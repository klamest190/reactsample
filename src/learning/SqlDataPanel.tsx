import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useSprache } from '../i18n/LanguageContext'
import { runSql } from '../sql/client'
import { SHOP_TABLES } from '../sql/dataset'
import type { SqlTable } from '../sql/engine'
import { focusableWhenScrolling } from '../components/scrollFocus'

/**
 * Die Beispieldaten direkt über jedem SQL-Editor (Teil 9) - damit man eine Abfrage
 * gegen die Daten nachvollziehen kann, ohne zu scrollen.
 *
 * Alle Tabellen, die im Code vorkommen, stehen nebeneinander mit ihren Zeilen - bei
 * einem JOIN sieht man so beide Seiten. Ein Klick auf eine Tabelle blendet sie ein
 * oder aus. Spalten, die die Abfrage benutzt, sind hervorgehoben. Gezeigt wird der
 * Ausgangszustand - so beginnt jeder Lauf.
 */

const TEXTS = {
  de: {
    database: 'Beispieldaten',
    show: 'Daten zeigen',
    hide: 'Daten ausblenden',
    inQuery: 'kommt in deiner Abfrage vor',
    pick: 'Klick auf eine Tabelle, um ihre Daten zu sehen.',
    start: 'So sehen die Tabellen vor jedem Lauf aus - du kannst nichts kaputt machen.',
    usedColumn: 'wird in deiner Abfrage benutzt',
    loading: 'Daten werden geladen …',
    failed: 'Die Daten konnten nicht geladen werden.',
    rows: (n: number) => (n === 1 ? '1 Zeile' : `${n} Zeilen`),
  },
  en: {
    database: 'Example data',
    show: 'Show data',
    hide: 'Hide data',
    inQuery: 'appears in your query',
    pick: 'Click a table to see its data.',
    start: 'This is what the tables look like before every run - you cannot break anything.',
    usedColumn: 'used in your query',
    loading: 'Loading the data …',
    failed: 'The data could not be loaded.',
    rows: (n: number) => (n === 1 ? '1 row' : `${n} rows`),
  },
}

/** The example data never changes between runs - it is fetched once per page. */
let seedData: Promise<Record<string, SqlTable>> | null = null

function loadSeedData() {
  if (!seedData) {
    seedData = runSql(SHOP_TABLES.map((t) => `SELECT * FROM ${t.name} ORDER BY 1, 2;`).join('\n')).then((run) => {
      if (run.error) throw new Error(run.error.message)
      return Object.fromEntries(SHOP_TABLES.map((t, i) => [t.name, run.results[i]]))
    })
    // A failed load (e.g. PostgreSQL could not start) is tried again next time.
    seedData.catch(() => {
      seedData = null
    })
  }
  return seedData
}

/** Code without comments - a table named in a comment is not part of the query. */
function withoutComments(code: string) {
  return code.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
}

const word = (name: string) => new RegExp(`\\b${name}\\b`, 'i')

/** The example tables that appear in the code, in the order of their first appearance. */
function usedTables(code: string) {
  const text = withoutComments(code)
  return SHOP_TABLES.map((t) => ({ name: t.name, position: text.search(word(t.name)) }))
    .filter((t) => t.position >= 0)
    .sort((a, b) => a.position - b.position)
    .map((t) => t.name)
}

export function SqlDataPanel({ code }: { code: string }) {
  const { sprache: language } = useSprache()
  const t = TEXTS[language]
  const benutzt = useMemo(() => usedTables(code), [code])
  // null: automatisch die Tabellen der Abfrage. Nach einem Klick gilt die eigene Auswahl.
  const [selection, setSelection] = useState<string[] | null>(null)
  // Gilt für alle SQL-Editoren: Wer die Daten ausblendet, will sie meist überall weg haben.
  const [open, setOpen] = useLocalStorage('sql-daten-offen', true)
  const [data, setData] = useState<Record<string, SqlTable> | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open || data) return
    let active = true
    loadSeedData().then(
      (d) => active && setData(d),
      () => active && setError(true),
    )
    return () => {
      active = false
    }
  }, [open, data])

  const visible = selection ?? benutzt

  function toggle(name: string) {
    setOpen(true)
    // Bei ausgeblendeten Daten zeigt der erste Klick die Tabelle, statt sie wegzunehmen.
    setSelection(open && visible.includes(name) ? visible.filter((n) => n !== name) : [...visible.filter((n) => n !== name), name])
  }

  return (
    <div className="border-b border-slate-200 bg-slate-50/60 px-4 py-2 text-xs dark:border-slate-800 dark:bg-slate-950/30">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
          <Icon name="datenbank" className="size-3.5" />
          {t.database}
        </span>
        {SHOP_TABLES.map((table) => {
          const active = open && visible.includes(table.name)
          const inCode = benutzt.includes(table.name)
          return (
            <button
              key={table.name}
              onClick={() => toggle(table.name)}
              aria-pressed={active}
              title={`${table.info[language]}${inCode ? ' - ' + t.inQuery : ''}`}
              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono transition ${
                active
                  ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
              } ${inCode ? 'font-semibold' : ''}`}
            >
              {inCode && <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />}
              {table.name}
              {inCode && <span className="sr-only"> ({t.inQuery})</span>}
            </button>
          )
        })}
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="ml-auto text-slate-500 hover:text-brand-600 dark:text-slate-400">
          {open ? t.hide : t.show}
        </button>
      </div>

      {open &&
        (visible.length === 0 ? (
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">{t.pick}</p>
        ) : error ? (
          <p className="mt-1.5 text-rose-600 dark:text-rose-400">{t.failed}</p>
        ) : !data ? (
          <p className="mt-1.5 text-slate-500 italic dark:text-slate-400">{t.loading}</p>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap items-start gap-3">
              {visible.map((name) => (
                <DataTable key={name} name={name} table={data[name]} code={code} />
              ))}
            </div>
            <p className="mt-1.5 text-slate-500 dark:text-slate-400">{t.start}</p>
          </>
        ))}
    </div>
  )
}

/** One example table: column names with type and key, below them the rows. */
function DataTable({ name, table, code }: { name: string; table: SqlTable; code: string }) {
  const { sprache: language } = useSprache()
  const t = TEXTS[language]
  const info = SHOP_TABLES.find((x) => x.name === name)!
  const text = useMemo(() => withoutComments(code), [code])
  const number = table.columns.map((_, c) => table.rows.some((r) => r[c] !== null) && table.rows.every((r) => r[c] === null || /^-?\d+(\.\d+)?$/.test(r[c]!)))

  return (
    <figure className="max-w-full min-w-0">
      <figcaption className="mb-1 text-slate-500 dark:text-slate-400" title={info.info[language]}>
        <code className="font-mono font-semibold text-slate-700 dark:text-slate-200">{name}</code> · {t.rows(table.rows.length)}
      </figcaption>
      <div ref={focusableWhenScrolling} className="max-h-44 overflow-auto rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="border-collapse font-mono text-2xs">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
            <tr>
              {table.columns.map((column, c) => {
                const meta = info.columns.find((s) => s.name === column)
                const benutzt = word(column).test(text)
                return (
                  <th
                    key={column}
                    scope="col"
                    title={benutzt ? t.usedColumn : undefined}
                    className={`border-b border-slate-200 px-2 py-1 align-bottom font-normal whitespace-nowrap dark:border-slate-700 ${number[c] ? 'text-right' : 'text-left'} ${
                      benutzt ? 'bg-brand-50 dark:bg-brand-500/15' : ''
                    }`}
                  >
                    <span className={`block font-semibold ${benutzt ? 'text-brand-800 dark:text-brand-200' : 'text-slate-700 dark:text-slate-200'}`}>{column}</span>
                    <span className="block text-slate-600 dark:text-slate-400">
                      {meta?.type}
                      {meta?.key && <span className="text-amber-700 dark:text-amber-400"> {meta.key}</span>}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((line, r) => (
              <tr key={r} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-900/40">
                {line.map((value, c) => (
                  <td key={c} className={`px-2 py-0.5 whitespace-nowrap ${number[c] ? 'text-right tabular-nums' : ''}`}>
                    {value === null ? <span className="text-slate-500 italic dark:text-slate-400">NULL</span> : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
