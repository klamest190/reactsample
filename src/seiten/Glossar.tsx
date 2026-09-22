import { useEffect, useState } from 'react'
import { Eingabe } from '../components/Ui'
import { KapitelChip } from '../components/Verweis'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { glossar } from '../kurs/glossar'
import { CodeBlock } from '../lernen/CodeBlock'
import { Text } from '../lernen/Text'

/**
 * Alle Begriffe alphabetisch, mit Filter und Sprungmarken A–Z.
 * `#/glossar/closure` springt direkt zu einem Eintrag (z. B. aus der Suche).
 */
export function Glossar({ ziel }: { ziel?: string }) {
  const { sprache } = useSprache()
  const t = useTexte()
  const [filter, setFilter] = useState('')

  const sortiert = glossar.toSorted((a, b) => a.begriff.localeCompare(b.begriff, 'en', { sensitivity: 'base' }))
  const suche = filter.trim().toLowerCase()
  const sichtbar = suche
    ? sortiert.filter((e) =>
        [e.begriff, e.deutsch ?? '', e.erklaerung[sprache]].some((feld) => feld.toLowerCase().includes(suche)),
      )
    : sortiert
  const buchstaben = [...new Set(sortiert.map((e) => e.begriff[0].toUpperCase()))]

  // Zum Ziel-Eintrag scrollen, sobald er gerendert ist.
  useEffect(() => {
    if (!ziel) return
    const el = document.getElementById('glossar-' + ziel)
    el?.scrollIntoView({ block: 'start' })
    el?.focus({ preventScroll: true })
  }, [ziel])

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{t.glossarTitel}</h1>
        <p className="max-w-3xl text-slate-600 dark:text-slate-400">{t.glossarText}</p>
        <Eingabe
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t.glossarFilter}
          aria-label={t.glossarFilter}
          className="max-w-md bg-white dark:bg-slate-900"
        />
        {!suche && (
          <nav className="flex flex-wrap gap-1 text-sm" aria-label="A–Z">
            {buchstaben.map((b) => (
              <a
                key={b}
                href={'#/glossar/' + sortiert.find((e) => e.begriff[0].toUpperCase() === b)!.id}
                className="rounded px-1.5 py-0.5 font-mono text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {b}
              </a>
            ))}
          </nav>
        )}
      </header>

      {sichtbar.length === 0 && <p className="text-slate-500 dark:text-slate-400">{t.sucheKeineTreffer}</p>}

      <dl className="space-y-3">
        {sichtbar.map((eintrag) => (
          <div
            key={eintrag.id}
            id={'glossar-' + eintrag.id}
            tabIndex={-1}
            className={`scroll-mt-24 space-y-2 rounded-xl border bg-white p-4 outline-none dark:bg-slate-900 ${
              eintrag.id === ziel ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <dt className="flex flex-wrap items-baseline gap-2">
              <span className="text-lg font-semibold">{eintrag.begriff}</span>
              {eintrag.deutsch && sprache === 'de' && (
                <span className="text-sm text-slate-500 dark:text-slate-400">· {eintrag.deutsch}</span>
              )}
            </dt>
            <dd className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <p>
                <Text text={eintrag.erklaerung[sprache]} />
              </p>
              {eintrag.code && <CodeBlock code={eintrag.code} />}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.glossarMehr}</span>
                {eintrag.kapitel.map((id) => (
                  <KapitelChip key={id} id={id} />
                ))}
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
