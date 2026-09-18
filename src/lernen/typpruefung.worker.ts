import ts from 'typescript'
import type { Typfehler } from './typpruefung'

/**
 * Echte Typprüfung für den Editor - mit dem TypeScript-Compiler selbst.
 *
 * sucrase entfernt Typen nur, es prüft sie nicht (genau wie Vite). Hier läuft
 * deshalb zusätzlich der Compiler, in einem Web Worker, damit die Seite beim
 * Prüfen nicht hängt. Er sieht ein kleines virtuelles Dateisystem: die
 * Standardbibliothek, die Typen von React und die Datei aus dem Editor.
 */

const LIB = import.meta.glob(
  ['/node_modules/typescript/lib/lib.es*.d.ts', '/node_modules/typescript/lib/lib.dom*.d.ts', '/node_modules/typescript/lib/lib.decorators*.d.ts'],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

// Die Typen von React - unter denselben Pfaden wie im echten Projekt.
const TYPEN = import.meta.glob(
  [
    '/node_modules/@types/react/{index,global,jsx-runtime,jsx-dev-runtime}.d.ts',
    '/node_modules/@types/react-dom/{index,client}.d.ts',
    '/node_modules/@types/{react,react-dom}/package.json',
    '/node_modules/csstype/{index.d.ts,package.json}',
  ],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

const LIB_ORDNER = '/lib/'
const DATEI = '/app.tsx'

// Im Editor gibt es Hooks & Co. ohne Import (siehe GLOBALE in reactKompilieren.ts) - das muss der Compiler wissen.
const GLOBALE = `
import * as React from 'react'
import * as ReactDOM from 'react-dom'
declare global {
  const useState: typeof React.useState
  const useEffect: typeof React.useEffect
  const useLayoutEffect: typeof React.useLayoutEffect
  const useEffectEvent: typeof React.useEffectEvent
  const useRef: typeof React.useRef
  const useMemo: typeof React.useMemo
  const useCallback: typeof React.useCallback
  const useReducer: typeof React.useReducer
  const useContext: typeof React.useContext
  const useId: typeof React.useId
  const useTransition: typeof React.useTransition
  const useDeferredValue: typeof React.useDeferredValue
  const useSyncExternalStore: typeof React.useSyncExternalStore
  const useImperativeHandle: typeof React.useImperativeHandle
  const useActionState: typeof React.useActionState
  const useOptimistic: typeof React.useOptimistic
  const use: typeof React.use
  const createContext: typeof React.createContext
  const memo: typeof React.memo
  const lazy: typeof React.lazy
  const forwardRef: typeof React.forwardRef
  const startTransition: typeof React.startTransition
  const Fragment: typeof React.Fragment
  const Suspense: typeof React.Suspense
  const createPortal: typeof ReactDOM.createPortal
  const useFormStatus: typeof ReactDOM.useFormStatus
}
export {}
`

const dateien = new Map<string, string>([...Object.entries(TYPEN), ['/globale.d.ts', GLOBALE]])
for (const [pfad, inhalt] of Object.entries(LIB)) {
  dateien.set(LIB_ORDNER + pfad.split('/').pop(), inhalt)
}

const OPTIONEN: ts.CompilerOptions = {
  strict: true,
  noEmit: true,
  target: ts.ScriptTarget.ES2023,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  lib: ['lib.es2023.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  types: [],
  skipLibCheck: true,
  allowImportingTsExtensions: true,
  // React.useState o. Ä. ohne Import - im Editor ist React vorhanden.
  allowUmdGlobalAccess: true,
}

let editorCode = ''
let version = 0

const host: ts.LanguageServiceHost = {
  getScriptFileNames: () => [DATEI, '/globale.d.ts'],
  getScriptVersion: (pfad) => (pfad === DATEI ? String(version) : '1'),
  getScriptSnapshot: (pfad) => {
    const inhalt = pfad === DATEI ? editorCode : dateien.get(pfad)
    return inhalt === undefined ? undefined : ts.ScriptSnapshot.fromString(inhalt)
  },
  getCurrentDirectory: () => '/',
  getCompilationSettings: () => OPTIONEN,
  getDefaultLibFileName: () => LIB_ORDNER + 'lib.es2023.d.ts',
  fileExists: (pfad) => pfad === DATEI || dateien.has(pfad),
  readFile: (pfad) => (pfad === DATEI ? editorCode : dateien.get(pfad)),
  directoryExists: (ordner) => {
    const praefix = ordner.endsWith('/') ? ordner : ordner + '/'
    return [...dateien.keys()].some((pfad) => pfad.startsWith(praefix))
  },
  getDirectories: () => [],
}

// Der Language Service merkt sich die geparsten Bibliotheken - nur der erste Lauf ist langsam.
const dienst = ts.createLanguageService(host, ts.createDocumentRegistry())

function pruefen(code: string): Typfehler[] {
  editorCode = code
  version++
  const diagnosen = [...dienst.getSyntacticDiagnostics(DATEI), ...dienst.getSemanticDiagnostics(DATEI)]
  const quelle = dienst.getProgram()?.getSourceFile(DATEI)

  return diagnosen.map((d) => {
    const start = d.start ?? 0
    const { line, character } = quelle ? quelle.getLineAndCharacterOfPosition(start) : { line: 0, character: 0 }
    // Markierung höchstens bis zum Zeilenende - der Editor zeichnet pro Zeile.
    const zeilenende = code.indexOf('\n', start)
    const laenge = Math.max(1, Math.min(d.length ?? 1, (zeilenende === -1 ? code.length : zeilenende) - start))
    return {
      zeile: line + 1,
      spalte: character,
      laenge,
      text: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      code: d.code,
    }
  })
}

// Im Worker ist self der Worker-Scope. Die Projekt-Typen kennen nur das DOM, deshalb diese schmale Beschreibung.
const scope = self as unknown as {
  onmessage: (e: MessageEvent<{ id: number; code: string }>) => void
  postMessage: (nachricht: unknown) => void
}

scope.onmessage = (e) => {
  const { id, code } = e.data
  try {
    scope.postMessage({ id, fehler: pruefen(code) })
  } catch (fehler) {
    scope.postMessage({ id, fehler: [], absturz: String(fehler) })
  }
}
