import type { ReactNode } from 'react'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { alleKapitel } from '../kurs/kurs'

/**
 * Link auf ein anderes Kapitel - per id oder Nummer ("1.6").
 * Ohne children wird „Kapitel 1.6“ bzw. „chapter 1.6“ angezeigt, der volle Titel steht im Tooltip.
 */
export function Verweis({ id, nr, children }: { id?: string; nr?: string; children?: ReactNode }) {
  const { sprache } = useSprache()
  const t = useTexte()
  const kapitel = alleKapitel.find((k) => k.id === id || k.nummer === nr)
  if (!kapitel) return <>{children ?? nr ?? id}</>

  return (
    <a
      href={'#/' + kapitel.id}
      title={`${kapitel.nummer} ${kapitel.titel[sprache]}`}
      className="text-brand-700 underline decoration-brand-300 decoration-dotted underline-offset-2 hover:decoration-solid dark:text-brand-400"
    >
      {children ??
        (kapitel.teil.id === 'projekt'
          ? `${t.projekt} · ${t.schrittNr(kapitel.teil.kapitel.findIndex((k) => k.id === kapitel.id) + 1)}`
          : `${t.kapitelKlein} ${kapitel.nummer}`)}
    </a>
  )
}

/** Kleiner Chip mit Nummer und Titel - für „Baut auf“ und „Wird gebraucht in“. */
export function KapitelChip({ id }: { id: string }) {
  const { sprache } = useSprache()
  const kapitel = alleKapitel.find((k) => k.id === id)
  if (!kapitel) return null
  return (
    <a
      href={'#/' + kapitel.id}
      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700 transition hover:border-brand-500 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-brand-400"
    >
      <span className="text-slate-500 tabular-nums dark:text-slate-400">{kapitel.nummer}</span>
      {kapitel.titel[sprache]}
    </a>
  )
}
