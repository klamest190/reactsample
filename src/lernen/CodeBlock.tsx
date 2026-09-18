import { useState } from 'react'
import { useTexte } from '../i18n/SpracheContext'
import { HervorgehobenerCode } from './hervorheben'

/** Statisches, eingefärbtes Codebeispiel mit Kopieren-Knopf. */
export function CodeBlock({ code, titel }: { code: string; titel?: string }) {
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
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-5">
        <code>
          <HervorgehobenerCode code={code} />
        </code>
      </pre>
      <button
        onClick={kopieren}
        className="absolute top-2 right-2 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-600 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        {kopiert ? t.kopiert : t.kopieren}
      </button>
    </figure>
  )
}
