import { useState } from 'react'
import { useTexte } from '../i18n/LanguageContext'
import { HighlightedCode, type HighlightMode } from './highlight'
import { highlightForTitle } from './modes'
import { focusableWhenScrolling } from '../components/scrollFocus'

/** Statisches, eingefärbtes Codebeispiel mit Kopieren-Knopf. */
export function CodeBlock({ code, title, language }: { code: string; title?: string; language?: HighlightMode }) {
  // Ohne Angabe entscheidet der Titel: Dockerfile, compose.yaml, Terminal, SQL … (siehe modi.ts).
  const mode = language ?? highlightForTitle(title)
  const t = useTexte()
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <figure className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      {title && (
        <figcaption className="border-b border-slate-200 px-4 py-1.5 font-mono text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {title}
        </figcaption>
      )}
      <pre ref={focusableWhenScrolling} className="overflow-x-auto p-4 font-mono text-code leading-5">
        <code>
          <HighlightedCode code={code} language={mode} />
        </code>
      </pre>
      <button
        onClick={copy}
        // Dauerhaft sichtbar, nur dezent - auf Touch-Geräten gibt es kein Hover.
        className="absolute top-2 right-2 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-600 opacity-90 transition hover:opacity-100 focus-visible:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        {copied ? t.kopiert : t.kopieren}
      </button>
    </figure>
  )
}
