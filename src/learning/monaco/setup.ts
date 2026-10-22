import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/editor/editor.worker.js?worker'
import tsWorker from 'monaco-editor/languages/features/typescript/ts.worker.js?worker'
import { EDITOR_GLOBALS } from '../editorGlobals'
import { registerThemes } from './themes'
import { registerCompletion } from './completion'

/**
 * Set Monaco up - once per page, and only when an editor actually needs it.
 *
 * Important: otherwise `@monaco-editor/react` fetches Monaco from a CDN. `loader.config`
 * hands it the locally installed copy instead - the project is meant to build offline and
 * in CI without a third-party service (same reasoning as the fonts, see index.css).
 *
 * This module pulls all of Monaco into its chunk. That is why it is only reached through
 * `monacoReady()` from `MonacoEditor.tsx`, and that editor in turn only in the playground
 * (CLAUDE.md: "Erster Download klein halten").
 *
 * Since Monaco 0.57 the language services live in their own namespace (`monaco.typescript`
 * instead of `monaco.languages.typescript`). The workers are imported without `esm/vs/` -
 * the package's `exports` map prepends that itself.
 */

// React's types - so Monaco can resolve `useState` and friends. Same paths as in
// typeCheck.worker.ts; react-router is left out, only the multi-file editor needs it.
const TYPES = import.meta.glob(
  [
    '/node_modules/@types/react/{index,global,jsx-runtime,jsx-dev-runtime}.d.ts',
    '/node_modules/@types/react-dom/{index,client}.d.ts',
    '/node_modules/@types/{react,react-dom}/package.json',
    '/node_modules/csstype/{index.d.ts,package.json}',
  ],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

let ready: Promise<typeof monaco> | null = null

/** Get Monaco - set up on the first call, the same instance afterwards. */
export function monacoReady(): Promise<typeof monaco> {
  ready ??= setUp()
  return ready
}

async function setUp(): Promise<typeof monaco> {
  // Monaco runs its language services in their own workers. Vite bundles them through
  // `?worker` (vite.config.ts: worker.format = 'es'); without that Monaco looks for them
  // on the network.
  self.MonacoEnvironment = {
    getWorker(_id: string, label: string) {
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    },
  }

  const ts = monaco.typescript
  const options: monaco.typescript.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.ReactJSX,
    lib: ['esnext', 'dom', 'dom.iterable'],
    strict: true,
    allowJs: true,
    allowNonTsExtensions: true,
    // React.useState and friends without an import - React is present in the editor.
    allowUmdGlobalAccess: true,
    skipLibCheck: true,
    esModuleInterop: true,
  }
  ts.typescriptDefaults.setCompilerOptions(options)
  ts.javascriptDefaults.setCompilerOptions(options)

  // The authoritative diagnostics still come from typeCheck.worker.ts (the real tsc, with
  // the same options as the project) and are shown as markers. Monaco's own diagnostics
  // stay off - otherwise two opinions would sit next to each other.
  const silent = { noSemanticValidation: true, noSyntaxValidation: true, noSuggestionDiagnostics: true }
  ts.typescriptDefaults.setDiagnosticsOptions(silent)
  ts.javascriptDefaults.setDiagnosticsOptions(silent)

  for (const [path, content] of Object.entries(TYPES)) {
    ts.typescriptDefaults.addExtraLib(content, 'file://' + path)
  }
  ts.typescriptDefaults.addExtraLib(EDITOR_GLOBALS, 'file:///globals.d.ts')

  registerThemes(monaco)
  registerCompletion(monaco)

  loader.config({ monaco })
  await loader.init()
  return monaco
}
