import ts from 'typescript'
import type { TypeDiagnostic } from './typeCheck'

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
const TYPES = import.meta.glob(
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

const LIB_FOLDER = '/lib/'
const FILE = '/app.tsx'
// Reines TypeScript (Teil 2): ohne JSX, damit z. B. <T>(x: T) => x eine generische Funktion ist.
const FILE_TS = '/app.ts'

// Im Editor gibt es Hooks & Co. ohne Import (siehe GLOBALE in reactKompilieren.ts) - das muss der Compiler wissen.
const GLOBALS = `
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

const files = new Map<string, string>([...Object.entries(TYPES), ['/globale.d.ts', GLOBALS]])
for (const [pfad, content] of Object.entries(LIB)) {
  files.set(LIB_FOLDER + pfad.split('/').pop(), content)
}

/** Inhalt einer Datei: Editor, Projekt oder mitgeliefertes Typ-Paket. */
function read(pfad: string): string | undefined {
  if (pfad === activeFile) return editorCode
  return projekt.get(pfad)?.code ?? files.get(pfad)
}

const OPTIONS: ts.CompilerOptions = {
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
let activeFile = FILE
let version = 0

// Mehrere Dateien (Werkstatt): Pfad -> Inhalt + Version. Die Version sagt dem
// Language Service, welche Datei sich geändert hat - alles andere bleibt geparst.
const PROJECT_FOLDER = '/projekt/'
const projekt = new Map<string, { code: string; version: number }>()

function setProject(files: { pfad: string; code: string }[]) {
  const current = new Set<string>()
  for (const file of files) {
    const pfad = PROJECT_FOLDER + file.pfad
    current.add(pfad)
    const existing = projekt.get(pfad)
    if (!existing) projekt.set(pfad, { code: file.code, version: 1 })
    else if (existing.code !== file.code) projekt.set(pfad, { code: file.code, version: existing.version + 1 })
  }
  for (const pfad of projekt.keys()) if (!current.has(pfad)) projekt.delete(pfad)
}

const host: ts.LanguageServiceHost = {
  getScriptFileNames: () => [activeFile, '/globale.d.ts', ...projekt.keys()],
  getScriptVersion: (pfad) => {
    if (pfad === activeFile) return String(version)
    return String(projekt.get(pfad)?.version ?? 1)
  },
  getScriptSnapshot: (pfad) => {
    const content = read(pfad)
    return content === undefined ? undefined : ts.ScriptSnapshot.fromString(content)
  },
  getCurrentDirectory: () => '/',
  getCompilationSettings: () => OPTIONS,
  getDefaultLibFileName: () => LIB_FOLDER + 'lib.es2023.d.ts',
  fileExists: (pfad) => read(pfad) !== undefined,
  readFile: read,
  directoryExists: (folder) => {
    const prefix = folder.endsWith('/') ? folder : folder + '/'
    return [...files.keys(), ...projekt.keys()].some((pfad) => pfad.startsWith(prefix))
  },
  getDirectories: () => [],
}

// Der Language Service merkt sich die geparsten Bibliotheken - nur der erste Lauf ist langsam.
const service = ts.createLanguageService(host, ts.createDocumentRegistry())

/** Eine einzelne Datei prüfen - der Editor-Code oder eine Datei des Projekts. */
function check(file: string): TypeDiagnostic[] {
  const code = read(file) ?? ''
  const diagnostics = [...service.getSyntacticDiagnostics(file), ...service.getSemanticDiagnostics(file)]
  const source = service.getProgram()?.getSourceFile(file)

  return diagnostics.map((d) => {
    const start = d.start ?? 0
    const { line, character } = source ? source.getLineAndCharacterOfPosition(start) : { line: 0, character: 0 }
    // Markierung höchstens bis zum Zeilenende - der Editor zeichnet pro Zeile.
    const lineEnd = code.indexOf('\n', start)
    const length = Math.max(1, Math.min(d.length ?? 1, (lineEnd === -1 ? code.length : lineEnd) - start))
    return {
      line: line + 1,
      column: character,
      length,
      text: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      code: d.code,
    }
  })
}

// Im Worker ist self der Worker-Scope. Die Projekt-Typen kennen nur das DOM, deshalb diese schmale Beschreibung.
const scope = self as unknown as {
  onmessage: (e: MessageEvent<{ id: number; code?: string; ts?: boolean; files?: { pfad: string; code: string }[]; active?: string }>) => void
  postMessage: (message: unknown) => void
}

scope.onmessage = (e) => {
  const { id, code, ts: nurTs, files: projectFiles, active } = e.data
  try {
    if (projectFiles) {
      setProject(projectFiles)
      scope.postMessage({ id, error: check(PROJECT_FOLDER + active) })
    } else {
      editorCode = code ?? ''
      activeFile = nurTs ? FILE_TS : FILE
      version++
      scope.postMessage({ id, error: check(activeFile) })
    }
  } catch (error) {
    scope.postMessage({ id, error: [], absturz: String(error) })
  }
}
