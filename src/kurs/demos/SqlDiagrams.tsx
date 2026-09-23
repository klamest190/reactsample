import type { ReactNode } from 'react'
import { useSprache } from '../../i18n/SpracheContext'
import { SHOP_TABELLEN } from '../../sql/dataset'

/**
 * Diagrams for part 9 - plain HTML like the ones of part 8, readable in light and
 * dark mode and on a phone.
 */

const TEXTS = {
  de: {
    schemaLabel: 'Die Beispieldatenbank: customers, orders, order_items und products mit ihren Beziehungen',
    rows: (n: number) => `${n} Zeilen`,
    oneMany: 'hat viele',
    manyOne: 'gehört zu',
    orderLabel: 'Die Reihenfolge, in der PostgreSQL eine Abfrage auswertet',
    written: 'So schreibt man sie',
    evaluated: 'So wird sie ausgewertet',
    steps: {
      FROM: 'Tabellen holen und verbinden',
      WHERE: 'Zeilen filtern',
      'GROUP BY': 'Gruppen bilden',
      HAVING: 'Gruppen filtern',
      SELECT: 'Spalten berechnen, Aliase vergeben',
      'ORDER BY': 'sortieren',
      LIMIT: 'abschneiden',
    } as Record<string, string>,
    joinLabel: 'INNER JOIN und LEFT JOIN im Vergleich',
    inner: 'nur Kunden mit Bestellung',
    left: 'alle Kunden - ohne Bestellung steht NULL',
    customer: 'Kunde',
    order: 'Bestellung',
  },
  en: {
    schemaLabel: 'The example database: customers, orders, order_items and products with their relationships',
    rows: (n: number) => `${n} rows`,
    oneMany: 'has many',
    manyOne: 'belongs to',
    orderLabel: 'The order in which PostgreSQL evaluates a query',
    written: 'How you write it',
    evaluated: 'How it is evaluated',
    steps: {
      FROM: 'fetch and join the tables',
      WHERE: 'filter rows',
      'GROUP BY': 'form groups',
      HAVING: 'filter groups',
      SELECT: 'compute columns, assign aliases',
      'ORDER BY': 'sort',
      LIMIT: 'cut off',
    } as Record<string, string>,
    joinLabel: 'INNER JOIN and LEFT JOIN compared',
    inner: 'only customers with an order',
    left: 'all customers - NULL where there is no order',
    customer: 'customer',
    order: 'order',
  },
}

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure role="img" aria-label={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      {children}
    </figure>
  )
}

/** One table of the example database as a card: name, columns, keys. */
function TableCard({ name }: { name: string }) {
  const { sprache } = useSprache()
  const table = SHOP_TABELLEN.find((t) => t.name === name)!
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-lg border border-indigo-300 bg-white text-xs dark:border-indigo-800 dark:bg-slate-900">
      <div className="flex items-baseline justify-between gap-2 border-b border-indigo-200 bg-indigo-50 px-2.5 py-1.5 dark:border-indigo-900 dark:bg-indigo-950/50">
        <span className="font-mono font-semibold text-indigo-900 dark:text-indigo-200">{table.name}</span>
        <span className="text-2xs text-slate-500 tabular-nums">{TEXTS[sprache].rows(table.zeilen)}</span>
      </div>
      <ul className="px-2.5 py-1.5 font-mono leading-5">
        {table.spalten.map((c) => (
          <li key={c.name} className="flex flex-wrap items-baseline gap-x-1.5">
            <span className={c.schluessel?.startsWith('PK') ? 'font-semibold underline decoration-amber-500 underline-offset-2' : ''}>{c.name}</span>
            {c.schluessel?.includes('→') && <span className="text-2xs text-amber-700 dark:text-amber-400">{c.schluessel.replace('PK · ', '')}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Relation({ left, right, label }: { left: string; right: string; label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center px-1 py-1 text-center font-mono text-2xs text-slate-500 dark:text-slate-400">
      <span>
        {left} ─ {right}
      </span>
      <span aria-hidden="true" className="text-lg leading-none">
        <span className="hidden md:inline">⟷</span>
        <span className="md:hidden">↕</span>
      </span>
      <span className="font-sans">{label}</span>
    </div>
  )
}

/** customers 1─n orders 1─n order_items n─1 products */
export function SchemaDiagram() {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  return (
    <Figure label={t.schemaLabel}>
      <div className="flex flex-col items-stretch gap-1 md:flex-row md:items-center">
        <TableCard name="customers" />
        <Relation left="1" right="n" label={t.oneMany} />
        <TableCard name="orders" />
        <Relation left="1" right="n" label={t.oneMany} />
        <TableCard name="order_items" />
        <Relation left="n" right="1" label={t.manyOne} />
        <TableCard name="products" />
      </div>
    </Figure>
  )
}

const WRITTEN = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT']
const EVALUATED = ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY', 'LIMIT']

/** Written order vs. logical evaluation order - why WHERE cannot see an alias from SELECT. */
export function EvaluationOrder() {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  return (
    <Figure label={t.orderLabel}>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{t.written}</p>
          <ol className="space-y-1 font-mono text-xs">
            {WRITTEN.map((w) => (
              <li key={w} className={`rounded border px-2 py-0.5 ${w === 'SELECT' ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
                {w}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{t.evaluated}</p>
          <ol className="space-y-1 text-xs">
            {EVALUATED.map((w, i) => (
              <li key={w} className={`flex items-baseline gap-2 rounded border px-2 py-0.5 ${w === 'SELECT' ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
                <span className="w-4 shrink-0 text-slate-400 tabular-nums">{i + 1}.</span>
                <span className="w-20 shrink-0 font-mono">{w}</span>
                <span className="text-slate-600 dark:text-slate-300">{t.steps[w]}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Figure>
  )
}

const JOIN_ROWS: [string, string | null][] = [
  ['Ada Lovelace', '101'],
  ['Ada Lovelace', '104'],
  ['Margaret Hamilton', null],
  ['Edsger Dijkstra', '109'],
  ['Niklaus Wirth', null],
]

/** The same few customers, once with INNER JOIN and once with LEFT JOIN. */
export function JoinComparison() {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const table = (title: string, note: string, rows: [string, string | null][]) => (
    <div className="min-w-0 flex-1">
      <p className="font-mono text-xs font-semibold">{title}</p>
      <p className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">{note}</p>
      <table className="w-full border-collapse overflow-hidden rounded-md border border-slate-300 bg-white font-mono text-xs dark:border-slate-700 dark:bg-slate-900">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            <th className="px-2 py-0.5 text-left font-semibold">{t.customer}</th>
            <th className="px-2 py-0.5 text-right font-semibold">{t.order}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, order], i) => (
            <tr key={i} className={order === null ? 'bg-amber-50 dark:bg-amber-950/30' : ''}>
              <td className="px-2 py-0.5">{name}</td>
              <td className="px-2 py-0.5 text-right">{order ?? <span className="text-slate-400 italic">NULL</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
  return (
    <Figure label={t.joinLabel}>
      <div className="flex flex-col gap-4 sm:flex-row">
        {table('JOIN', t.inner, JOIN_ROWS.filter(([, o]) => o !== null))}
        {table('LEFT JOIN', t.left, JOIN_ROWS)}
      </div>
    </Figure>
  )
}
