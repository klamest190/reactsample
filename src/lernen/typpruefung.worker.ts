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
    // React Router für das Routing im ToDo-Projekt
    '/node_modules/react-router/package.json',
    '/node_modules/react-router/dist/production/**/*.d.ts',
  ],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

const LIB_ORDNER = '/lib/'
const DATEI = '/app.tsx'
// Reines TypeScript (Teil 2): ohne JSX, damit z. B. <T>(x: T) => x eine generische Funktion ist.
const DATEI_TS = '/app.ts'

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

/** Inhalt einer Datei: Editor, Projekt oder mitgeliefertes Typ-Paket. */
function lesen(pfad: string): string | undefined {
  if (pfad === aktiveDatei) return editorCode
  return projekt.get(pfad)?.code ?? dateien.get(pfad)
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
let aktiveDatei = DATEI
let version = 0

// Mehrere Dateien (Werkstatt): Pfad -> Inhalt + Version. Die Version sagt dem
// Language Service, welche Datei sich geändert hat - alles andere bleibt geparst.
const PROJEKT_ORDNER = '/projekt/'
const projekt = new Map<string, { code: string; version: number }>()

function projektSetzen(dateien: { pfad: string; code: string }[]) {
  const aktuelle = new Set<string>()
  for (const datei of dateien) {
    const pfad = PROJEKT_ORDNER + datei.pfad
    aktuelle.add(pfad)
    const vorhanden = projekt.get(pfad)
    if (!vorhanden) projekt.set(pfad, { code: datei.code, version: 1 })
    else if (vorhanden.code !== datei.code) projekt.set(pfad, { code: datei.code, version: vorhanden.version + 1 })
  }
  for (const pfad of projekt.keys()) if (!aktuelle.has(pfad)) projekt.delete(pfad)
}

const host: ts.LanguageServiceHost = {
  getScriptFileNames: () => [aktiveDatei, '/globale.d.ts', ...projekt.keys()],
  getScriptVersion: (pfad) => {
    if (pfad === aktiveDatei) return String(version)
    return String(projekt.get(pfad)?.version ?? 1)
  },
  getScriptSnapshot: (pfad) => {
    const inhalt = lesen(pfad)
    return inhalt === undefined ? undefined : ts.ScriptSnapshot.fromString(inhalt)
  },
  getCurrentDirectory: () => '/',
  getCompilationSettings: () => OPTIONEN,
  getDefaultLibFileName: () => LIB_ORDNER + 'lib.es2023.d.ts',
  fileExists: (pfad) => lesen(pfad) !== undefined,
  readFile: lesen,
  directoryExists: (ordner) => {
    const praefix = ordner.endsWith('/') ? ordner : ordner + '/'
    return [...dateien.keys(), ...projekt.keys()].some((pfad) => pfad.startsWith(praefix))
  },
  getDirectories: () => [],
}

// Der Language Service merkt sich die geparsten Bibliotheken - nur der erste Lauf ist langsam.
const dienst = ts.createLanguageService(host, ts.createDocumentRegistry())

/** Eine einzelne Datei prüfen - der Editor-Code oder eine Datei des Projekts. */
function pruefen(datei: string): Typfehler[] {
  const code = lesen(datei) ?? ''
  const diagnosen = [...dienst.getSyntacticDiagnostics(datei), ...dienst.getSemanticDiagnostics(datei)]
  const quelle = dienst.getProgram()?.getSourceFile(datei)

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
  onmessage: (e: MessageEvent<{ id: number; code?: string; ts?: boolean; dateien?: { pfad: string; code: string }[]; aktiv?: string }>) => void
  postMessage: (nachricht: unknown) => void
}

scope.onmessage = (e) => {
  const { id, code, ts: nurTs, dateien: projektDateien, aktiv } = e.data
  try {
    if (projektDateien) {
      projektSetzen(projektDateien)
      scope.postMessage({ id, fehler: pruefen(PROJEKT_ORDNER + aktiv) })
    } else {
      editorCode = code ?? ''
      aktiveDatei = nurTs ? DATEI_TS : DATEI
      version++
      scope.postMessage({ id, fehler: pruefen(aktiveDatei) })
    }
  } catch (fehler) {
    scope.postMessage({ id, fehler: [], absturz: String(fehler) })
  }
}
