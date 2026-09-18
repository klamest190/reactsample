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

export type Protokoll = (typ: 'log' | 'info' | 'warn' | 'error', text: string) => void

// Alles, was im Editor ohne Import verfügbar ist.
const GLOBALE: Record<string, unknown> = {
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
const NACHLADBAR: Record<string, () => Promise<unknown>> = {
  'react-router': () => import('react-router'),
}

async function moduleNachladen(quelltexte: string[]) {
  for (const [name, laden] of Object.entries(NACHLADBAR)) {
    if (name in MODULE) continue
    if (quelltexte.some((q) => q.includes(`'${name}'`) || q.includes(`"${name}"`))) MODULE[name] = await laden()
  }
}

/** Werte ähnlich wie die Browser-Konsole als Text darstellen. */
export function formatieren(wert: unknown, tiefe = 0): string {
  if (typeof wert === 'string') return tiefe === 0 ? wert : JSON.stringify(wert)
  if (typeof wert === 'function') return `ƒ ${wert.name || 'anonym'}()`
  if (wert === null || typeof wert !== 'object') return String(wert)
  if (wert instanceof Error) return `${wert.name}: ${wert.message}`
  if (wert instanceof Node) return `<${wert.nodeName.toLowerCase()}>`
  if (tiefe > 3) return Array.isArray(wert) ? '[…]' : '{…}'
  if (Array.isArray(wert)) return `[${wert.map((w) => formatieren(w, tiefe + 1)).join(', ')}]`
  const felder = Object.entries(wert).map(([k, v]) => `${k}: ${formatieren(v, tiefe + 1)}`)
  return felder.length ? `{ ${felder.join(', ')} }` : '{}'
}


const MELDUNGEN = {
  de: {
    import: (name: string) => `Import "${name}" gibt es im Editor nicht - nur react, react-dom und react-router.`,
    keineKomponente: 'Keine Komponente gefunden. Definiere eine Funktion namens App.',
    dateiFehlt: (name: string, von: string) => `${von}: Die Datei "${name}" gibt es nicht.`,
    keinDefaultExport: (datei: string) => `${datei} braucht einen default-Export mit der Komponente App.`,
  },
  en: {
    import: (name: string) => `Import "${name}" is not available in the editor - only react, react-dom and react-router.`,
    keineKomponente: 'No component found. Define a function called App.',
    dateiFehlt: (name: string, von: string) => `${von}: The file "${name}" does not exist.`,
    keinDefaultExport: (datei: string) => `${datei} needs a default export with the App component.`,
  },
}

const OPTIONEN = {
  transforms: ['jsx', 'typescript', 'imports'] as ('jsx' | 'typescript' | 'imports')[],
  production: true, // kein __source/__self im Ergebnis
}

/**
 * Was jeder übersetzte Code als "globale" Werte bekommt: eine Konsole, die ins
 * Ausgabefeld schreibt, und Timer, die beim nächsten Lauf aufgeräumt werden.
 */
function umgebung(protokoll: Protokoll) {
  // Eigene Konsole: schreibt in die echte UND in das Ausgabefeld unter dem Editor.
  const konsole = { ...console }
  for (const typ of ['log', 'info', 'warn', 'error'] as const) {
    konsole[typ] = (...werte: unknown[]) => {
      console[typ](...werte)
      protokoll(typ, werte.map((w) => formatieren(w)).join(' '))
    }
  }
  const zeitmessungen = new Map<string, number>()
  konsole.time = (label = 'default') => void zeitmessungen.set(label, performance.now())
  konsole.timeEnd = (label = 'default') => {
    const start = zeitmessungen.get(label)
    if (start === undefined) return
    zeitmessungen.delete(label)
    konsole.log(`${label}: ${(performance.now() - start).toFixed(1)} ms`)
  }

  // Timer mitschreiben, damit vergessene Intervalle beim nächsten Lauf nicht weiterlaufen.
  const timeouts = new Set<number>()
  const intervalle = new Set<number>()
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
      intervalle.add(id)
      return id
    },
    clearInterval: (id: number) => {
      intervalle.delete(id)
      window.clearInterval(id)
    },
  }
  const aufraeumen = () => {
    timeouts.forEach((id) => window.clearTimeout(id))
    intervalle.forEach((id) => window.clearInterval(id))
  }

  return { globale: { console: konsole, ...timer, ...GLOBALE }, aufraeumen }
}

export async function kompilieren(quelltext: string, protokoll: Protokoll, sprache: 'de' | 'en') {
  const { transform } = await import('sucrase')
  await moduleNachladen([quelltext])
  const { code } = transform(quelltext, OPTIONEN)
  const { globale, aufraeumen } = umgebung(protokoll)

  const require = (name: string) => {
    if (name in MODULE) return MODULE[name]
    throw new Error(MELDUNGEN[sprache].import(name))
  }

  const parameter = { React, require, exports: {}, ...globale }
  const fabrik = new Function(
    ...Object.keys(parameter),
    code + '\n;return typeof App !== "undefined" ? App : exports.default;',
  )

  const App: unknown = fabrik(...Object.values(parameter))
  if (typeof App !== 'function') {
    throw new Error(MELDUNGEN[sprache].keineKomponente)
  }
  return { App: App as ComponentType, aufraeumen }
}

export type ProjektDatei = { pfad: string; code: string }

/** Hängt den Dateinamen genau einmal vor die Fehlermeldung. */
function mitDatei(fehler: unknown, pfad: string) {
  const f = fehler instanceof Error ? fehler : new Error(String(fehler))
  if (!(f as { datei?: string }).datei) {
    f.message = `${pfad}: ${f.message}`
    ;(f as { datei?: string }).datei = pfad
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
export async function kompilierenProjekt(
  dateien: ProjektDatei[],
  einstieg: string,
  protokoll: Protokoll,
  sprache: 'de' | 'en',
) {
  const { exports, aufraeumen } = await projektAusfuehren(dateien, einstieg, protokoll, sprache)
  const App = exports.default
  if (typeof App !== 'function') {
    aufraeumen()
    throw new Error(MELDUNGEN[sprache].keinDefaultExport(einstieg))
  }
  return { App: App as ComponentType, aufraeumen }
}

/**
 * Führt ein Projekt aus und liefert die Exporte der Einstiegsdatei.
 * `zusatzModule` ergänzt oder ersetzt Bibliotheken - z. B. für Tests eine eigene Fassung von "vitest".
 */
export async function projektAusfuehren(
  dateien: ProjektDatei[],
  einstieg: string,
  protokoll: Protokoll,
  sprache: 'de' | 'en',
  zusatzModule: Record<string, unknown> = {},
) {
  const { transform } = await import('sucrase')
  await moduleNachladen(dateien.map((d) => d.code))

  const uebersetzt = new Map<string, string>()
  for (const datei of dateien) {
    try {
      uebersetzt.set(datei.pfad, transform(datei.code, OPTIONEN).code)
    } catch (fehler) {
      throw mitDatei(fehler, datei.pfad)
    }
  }

  const { globale, aufraeumen } = umgebung(protokoll)
  const geladen = new Map<string, Record<string, unknown>>()

  function aufloesen(von: string, name: string) {
    const teile = von.split('/').slice(0, -1)
    for (const teil of name.split('/')) {
      if (teil === '..') teile.pop()
      else if (teil !== '.') teile.push(teil)
    }
    const basis = teile.join('/')
    const kandidaten = ['', '.jsx', '.js', '.tsx', '.ts', '/index.jsx', '/index.js'].map((endung) => basis + endung)
    return kandidaten.find((k) => uebersetzt.has(k))
  }

  function laden(pfad: string): Record<string, unknown> {
    const vorhanden = geladen.get(pfad)
    if (vorhanden) return vorhanden
    const exports: Record<string, unknown> = {}
    // Vor dem Ausführen eintragen, damit zyklische Imports nicht endlos laufen.
    geladen.set(pfad, exports)

    const require = (name: string) => {
      if (name in zusatzModule) return zusatzModule[name]
      if (name in MODULE) return MODULE[name]
      if (name.startsWith('.')) {
        const ziel = aufloesen(pfad, name)
        if (!ziel) throw new Error(MELDUNGEN[sprache].dateiFehlt(name, pfad))
        return laden(ziel)
      }
      throw new Error(MELDUNGEN[sprache].import(name))
    }

    const parameter = { React, require, exports, module: { exports }, ...globale }
    try {
      new Function(...Object.keys(parameter), uebersetzt.get(pfad)!)(...Object.values(parameter))
    } catch (fehler) {
      throw mitDatei(fehler, pfad)
    }
    return exports
  }

  try {
    return { exports: laden(einstieg), aufraeumen }
  } catch (fehler) {
    aufraeumen()
    throw fehler
  }
}
