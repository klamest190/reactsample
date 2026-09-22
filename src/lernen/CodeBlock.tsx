import { useState } from 'react'
import { useTexte } from '../i18n/SpracheContext'
import { HervorgehobenerCode, type HighlightMode } from './hervorheben'

/** Files that are no program code get the config highlighting (# comments, keys, instructions). */
const CONFIG_TITLE = /Dockerfile|\.dockerignore|\.ya?ml$|\.properties$|\.http$|\.env$|Terminal/i

/** Statisches, eingefärbtes Codebeispiel mit Kopieren-Knopf. */
export function CodeBlock({ code, titel, sprache }: { code: string; titel?: string; sprache?: HighlightMode }) {
  const modus = sprache ?? (titel && CONFIG_TITLE.test(titel) ? 'konfig' : 'code')
  const t = useTexte()
  const [kopiert, setKopiert] = useState(false)

  async function kopieren() {
    await navigator.clipboard.writeText(code)
    setKopiert(true)
    setTimeout(() => setKopiert(false), 1500)
  }

  return (
    <figure className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      {titel && (
        <figcaption className="border-b border-slate-200 px-4 py-1.5 font-mono text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {titel}
        </figcaption>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-code leading-5">
        <code>
          <HervorgehobenerCode code={code} sprache={modus} />
        </code>
      </pre>
      <button
        onClick={kopieren}
        // Dauerhaft sichtbar, nur dezent - auf Touch-Geräten gibt es kein Hover.
        className="absolute top-2 right-2 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-600 opacity-60 transition hover:opacity-100 focus-visible:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        {kopiert ? t.kopiert : t.kopieren}
      </button>
    </figure>
  )
}
