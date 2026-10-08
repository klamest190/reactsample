import * as React from 'react'
import * as ReactDOM from 'react-dom'
import type { ComponentType } from 'react'

/**
 * Macht aus dem Editor-Text eine echte React-Komponente.
 *
 * 1. sucrase übersetzt JSX (und TypeScript) in normales JavaScript.
 *    Es wird erst beim ersten Ausführen nachgeladen (dynamisches import()),
 *    damit es nicht im Start-Bundle landet.
 * 2. new Function(...) führt den Code aus. Alle Hooks werden als Parameter
 *    hineingereicht - man kann `useState` also mit oder ohne Import benutzen.
 * 3. Zurückgegeben wird die Komponente `App` (oder der default-Export).
 */

export type Log = (type: 'log' | 'info' | 'warn' | 'error', text: string) => void

// Alles, was im Editor ohne Import verfügbar ist.
const GLOBALS: Record<string, unknown> = {
  useState: React.useState,
  useEffect: React.useEffect,
  useLayoutEffect: React.useLayoutEffect,
  useEffectEvent: React.useEffectEvent,
  useRef: React.useRef,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
  useReducer: React.useReducer,
  useContext: React.useContext,
  useId: React.useId,
  useTransition: React.useTransition,
  useDeferredValue: React.useDeferredValue,
  useSyncExternalStore: React.useSyncExternalStore,
  useImperativeHandle: React.useImperativeHandle,
  useActionState: React.useActionState,
  useOptimistic: React.useOptimistic,
  use: React.use,
  createContext: React.createContext,
  memo: React.memo,
  lazy: React.lazy,
  forwardRef: React.forwardRef,
  startTransition: React.startTransition,
  Fragment: React.Fragment,
  Suspense: React.Suspense,
  createPortal: ReactDOM.createPortal,
  useFormStatus: ReactDOM.useFormStatus,
}

const MODULE: Record<string, unknown> = { react: React, 'react-dom': ReactDOM }

// Bibliotheken, die erst geladen werden, wenn ein Code sie wirklich importiert.
const LOADABLE: Record<string, () => Promise<unknown>> = {
  'react-router': () => import('react-router'),
}

async function loadModules(sources: string[]) {
  for (const [name, load] of Object.entries(LOADABLE)) {
    if (name in MODULE) continue
    if (sources.some((q) => q.includes(`'${name}'`) || q.includes(`"${name}"`))) MODULE[name] = await load()
  }
}

/** Werte ähnlich wie die Browser-Konsole als Text darstellen. */
export function formatieren(value: unknown, depth = 0): string {
  if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value)
  if (typeof value === 'function') return `ƒ ${value.name || 'anonym'}()`
  if (value === null || typeof value !== 'object') return String(value)
  if (value instanceof Error) return `${value.name}: ${value.message}`
  if (value instanceof Node) return `<${value.nodeName.toLowerCase()}>`
  if (depth > 3) return Array.isArray(value) ? '[…]' : '{…}'
  if (Array.isArray(value)) return `[${value.map((w) => formatieren(w, depth + 1)).join(', ')}]`
  const fields = Object.entries(value).map(([k, v]) => `${k}: ${formatieren(v, depth + 1)}`)
  return fields.length ? `{ ${fields.join(', ')} }` : '{}'
}


const MESSAGES = {
  de: {
    importNotAvailable: (name: string) => `Import "${name}" gibt es im Editor nicht - nur react, react-dom und react-router.`,
    noComponent: 'Keine Komponente gefunden. Definiere eine Funktion namens App.',
    fileMissing: (name: string, from: string) => `${from}: Die Datei "${name}" gibt es nicht.`,
    noDefaultExport: (file: string) => `${file} braucht einen default-Export mit der Komponente App.`,
  },
  en: {
    importNotAvailable: (name: string) => `Import "${name}" is not available in the editor - only react, react-dom and react-router.`,
    noComponent: 'No component found. Define a function called App.',
    fileMissing: (name: string, from: string) => `${from}: The file "${name}" does not exist.`,
    noDefaultExport: (file: string) => `${file} needs a default export with the App component.`,
  },
}

const OPTIONS = {
  transforms: ['jsx', 'typescript', 'imports'] as ('jsx' | 'typescript' | 'imports')[],
  production: true, // kein __source/__self im Ergebnis
}

/**
 * Was jeder übersetzte Code als "globale" Werte bekommt: eine Konsole, die ins
 * Ausgabefeld schreibt, und Timer, die beim nächsten Lauf aufgeräumt werden.
 */
function environment(log: Log) {
  // Eigene Konsole: schreibt in die echte UND in das Ausgabefeld unter dem Editor.
  const konsole = { ...console }
  for (const type of ['log', 'info', 'warn', 'error'] as const) {
    konsole[type] = (...values: unknown[]) => {
      console[type](...values)
      log(type, values.map((w) => formatieren(w)).join(' '))
    }
  }
  const timings = new Map<string, number>()
  konsole.time = (label = 'default') => void timings.set(label, performance.now())
  konsole.timeEnd = (label = 'default') => {
    const start = timings.get(label)
    if (start === undefined) return
    timings.delete(label)
    konsole.log(`${label}: ${(performance.now() - start).toFixed(1)} ms`)
  }

  // Timer mitschreiben, damit vergessene Intervalle beim nächsten Lauf nicht weiterlaufen.
  const timeouts = new Set<number>()
  const intervals = new Set<number>()
  const timer = {
    setTimeout: (fn: () => void, ms?: number, ...args: unknown[]) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id)
        fn()
      }, ms, ...args)
      timeouts.add(id)
      return id
    },
    clearTimeout: (id: number) => {
      timeouts.delete(id)
      window.clearTimeout(id)
    },
    setInterval: (fn: () => void, ms?: number, ...args: unknown[]) => {
      const id = window.setInterval(fn, ms, ...args)
      intervals.add(id)
      return id
    },
    clearInterval: (id: number) => {
      intervals.delete(id)
      window.clearInterval(id)
    },
  }
  const cleanup = () => {
    timeouts.forEach((id) => window.clearTimeout(id))
    intervals.forEach((id) => window.clearInterval(id))
  }

  return { globals: { console: konsole, ...timer, ...GLOBALS }, aufraeumen: cleanup }
}

/**
 * `extraGlobals`: additional values the code sees as globals - the full-stack workshop
 * (part 8) passes its own `fetch` that talks to the simulated Spring backend.
 */
export async function compile(sourceCode: string, log: Log, language: 'de' | 'en', extraGlobals: Record<string, unknown> = {}) {
  const { transform } = await import('sucrase')
  await loadModules([sourceCode])
  const { code } = transform(sourceCode, OPTIONS)
  const { globals, aufraeumen: cleanup } = environment(log)

  const require = (name: string) => {
    if (name in MODULE) return MODULE[name]
    throw new Error(MESSAGES[language].importNotAvailable(name))
  }

  const parameter = { React, require, exports: {}, ...globals, ...extraGlobals }
  const factory = new Function(
    ...Object.keys(parameter),
    code + '\n;return typeof App !== "undefined" ? App : exports.default;',
  )

  const App: unknown = factory(...Object.values(parameter))
  if (typeof App !== 'function') {
    throw new Error(MESSAGES[language].noComponent)
  }
  return { App: App as ComponentType, aufraeumen: cleanup }
}

export type ProjectFile = { pfad: string; code: string }

/** Hängt den Dateinamen genau einmal vor die Fehlermeldung. */
function withFile(error: unknown, pfad: string) {
  const f = error instanceof Error ? error : new Error(String(error))
  if (!(f as { file?: string }).file) {
    f.message = `${pfad}: ${f.message}`
    ;(f as { file?: string }).file = pfad
  }
  return f
}

/**
 * Wie kompilieren(), aber für ein ganzes Projekt aus mehreren Dateien.
 *
 * Jede Datei wird einzeln übersetzt; `import … from './components/Layout'`
 * wird dabei zu require('./components/Layout'). Unser eigenes require löst
 * den Pfad relativ zur importierenden Datei auf, führt die Zieldatei einmal
 * aus und merkt sich ihre Exporte - im Kleinen genau das, was ein Bundler wie
 * Vite macht.
 */
export async function compileProject(
  files: ProjectFile[],
  entry: string,
  log: Log,
  language: 'de' | 'en',
) {
  const { exports, aufraeumen: cleanup } = await runProject(files, entry, log, language)
  const App = exports.default
  if (typeof App !== 'function') {
    cleanup()
    throw new Error(MESSAGES[language].noDefaultExport(entry))
  }
  return { App: App as ComponentType, aufraeumen: cleanup }
}

/**
 * Führt ein Projekt aus und liefert die Exporte der Einstiegsdatei.
 * `zusatzModule` ergänzt oder ersetzt Bibliotheken - z. B. für Tests eine eigene Fassung von "vitest".
 */
export async function runProject(
  files: ProjectFile[],
  entry: string,
  log: Log,
  language: 'de' | 'en',
  extraModules: Record<string, unknown> = {},
) {
  const { transform } = await import('sucrase')
  await loadModules(files.map((d) => d.code))

  const compiled = new Map<string, string>()
  for (const file of files) {
    try {
      compiled.set(file.pfad, transform(file.code, OPTIONS).code)
    } catch (error) {
      throw withFile(error, file.pfad)
    }
  }

  const { globals, aufraeumen: cleanup } = environment(log)
  const loaded = new Map<string, Record<string, unknown>>()

  function aufloesen(from: string, name: string) {
    const parts = from.split('/').slice(0, -1)
    for (const part of name.split('/')) {
      if (part === '..') parts.pop()
      else if (part !== '.') parts.push(part)
    }
    const base = parts.join('/')
    const candidates = ['', '.jsx', '.js', '.tsx', '.ts', '/index.jsx', '/index.js'].map((extension) => base + extension)
    return candidates.find((k) => compiled.has(k))
  }

  function load(pfad: string): Record<string, unknown> {
    const existing = loaded.get(pfad)
    if (existing) return existing
    const exports: Record<string, unknown> = {}
    // Vor dem Ausführen eintragen, damit zyklische Imports nicht endlos laufen.
    loaded.set(pfad, exports)

    const require = (name: string) => {
      if (name in extraModules) return extraModules[name]
      if (name in MODULE) return MODULE[name]
      if (name.startsWith('.')) {
        const target = aufloesen(pfad, name)
        if (!target) throw new Error(MESSAGES[language].fileMissing(name, pfad))
        return load(target)
      }
      throw new Error(MESSAGES[language].importNotAvailable(name))
    }

    const parameter = { React, require, exports, module: { exports }, ...globals }
    try {
      new Function(...Object.keys(parameter), compiled.get(pfad)!)(...Object.values(parameter))
    } catch (error) {
      throw withFile(error, pfad)
    }
    return exports
  }

  try {
    return { exports: load(entry), aufraeumen: cleanup }
  } catch (error) {
    cleanup()
    throw error
  }
}
