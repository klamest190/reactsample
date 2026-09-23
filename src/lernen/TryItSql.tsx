import { useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Icon } from '../components/Icon'
import { useSprache } from '../i18n/SpracheContext'
import { checkQueries, evaluate, lastTable } from '../sql/check'
import { onSqlReady, runSql, SqlTimeout, sqlReady, startSql } from '../sql/client'
import type { SqlError, SqlRun, SqlTable } from '../sql/engine'
import type { TestErgebnis } from './jsSandbox'
import { SqlDatenleiste } from './SqlDatenleiste'
import { Rahmen, Testergebnisse } from './Rahmen'
import type { SqlProps } from './TryIt'
import type { Typfehler } from './typpruefung'
import { useSavedCode } from './useSavedCode'
import { focusableWhenScrolling } from '../components/scrollFocus'

/**
 * The SQL editor of part 9: real PostgreSQL (PGlite) on the example shop database.
 *
 * Every run starts with a fresh copy of the tables - learners can DELETE and DROP
 * as they like. The output shows one block per statement: a result table, or what
 * the statement did ("3 rows updated"). The first error stops the run and is marked
 * in the editor.
 *
 * Exercises compare with the model solution (src/sql/check.ts); if the result is
 * wrong, the expected result can be opened below.
 */

const TEXTS = {
  de: {
    starting: 'PostgreSQL startet … (beim ersten Mal wird die Datenbank geladen, einige MB)',
    running: 'läuft …',
    exerciseStart: 'Starte mit ▶ - dann laufen die Tests.',
    empty: 'Das Skript enthält keine Anweisung.',
    rows: (n: number) => (n === 1 ? '1 Zeile' : `${n} Zeilen`),
    more: (n: number) => `… und ${n} weitere Zeilen`,
    affected: {
      INSERT: (n: number) => (n === 1 ? '1 Zeile eingefügt' : `${n} Zeilen eingefügt`),
      UPDATE: (n: number) => (n === 1 ? '1 Zeile geändert' : `${n} Zeilen geändert`),
      DELETE: (n: number) => (n === 1 ? '1 Zeile gelöscht' : `${n} Zeilen gelöscht`),
    } as Record<string, (n: number) => string>,
    done: 'erledigt',
    error: 'FEHLER',
    line: (n: number) => `Zeile ${n}`,
    timeout: 'Abgebrochen: Das Skript lief länger als 10 Sekunden. PostgreSQL wurde neu gestartet.',
    crashed: (m: string) => `PostgreSQL ist abgestürzt: ${m}`,
    stopped: (n: number) => (n === 1 ? 'Die Anweisung danach wurde nicht mehr ausgeführt.' : `Die ${n} Anweisungen danach wurden nicht mehr ausgeführt.`),
    expected: 'Erwartetes Ergebnis anzeigen',
    ms: (ms: number) => `${ms} ms`,
  },
  en: {
    starting: 'PostgreSQL is starting … (the first time the database is downloaded, a few MB)',
    running: 'running …',
    exerciseStart: 'Start with ▶ - then the tests run.',
    empty: 'The script contains no statement.',
    rows: (n: number) => (n === 1 ? '1 row' : `${n} rows`),
    more: (n: number) => `… and ${n} more rows`,
    affected: {
      INSERT: (n: number) => (n === 1 ? '1 row inserted' : `${n} rows inserted`),
      UPDATE: (n: number) => (n === 1 ? '1 row updated' : `${n} rows updated`),
      DELETE: (n: number) => (n === 1 ? '1 row deleted' : `${n} rows deleted`),
    } as Record<string, (n: number) => string>,
    done: 'done',
    error: 'ERROR',
    line: (n: number) => `line ${n}`,
    timeout: 'Stopped: the script ran for more than 10 seconds. PostgreSQL was restarted.',
    crashed: (m: string) => `PostgreSQL crashed: ${m}`,
    stopped: (n: number) => (n === 1 ? 'The statement after it was not run.' : `The ${n} statements after it were not run.`),
    expected: 'Show the expected result',
    ms: (ms: number) => `${ms} ms`,
  },
}

type Outcome = { run: SqlRun | null; results: TestErgebnis[] | null; expected: SqlTable | null; failure: string | null }

export function TryItSql({ id, titel, aufgabe, code: startCode, loesung, tipps, tests, ...playground }: SqlProps) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const [code, setCode] = useSavedCode(id, startCode)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  // Examples start running right away (see firstRun), exercises wait for the button.
  const [running, setRunning] = useState(!tests)
  const ready = useSyncExternalStore(onSqlReady, sqlReady)
  // Only the newest run may show its result - an older one can finish later.
  const latest = useRef(0)
  // The solution's run does not change - it is computed once.
  const solutionRun = useRef<Promise<SqlRun> | null>(null)

  async function start(source: string, withTests: boolean) {
    const number = ++latest.current
    try {
      const checks = withTests && tests?.length ? checkQueries(tests) : undefined
      const run = await runSql(source, { checks })
      let results: TestErgebnis[] | null = null
      let expected: SqlTable | null = null
      if (checks && tests && loesung) {
        solutionRun.current ??= runSql(loesung, { checks })
        const solution = await solutionRun.current
        results = evaluate(tests, run, solution, sprache)
        // The expected table helps when the final result is wrong - not for check queries.
        const lastTest = results.findIndex((r, i) => !r.ok && !tests[i].abfrage)
        if (lastTest >= 0 && !run.error) expected = lastTable(solution) ?? null
      }
      if (number === latest.current) setOutcome({ run, results, expected, failure: null })
    } catch (e) {
      solutionRun.current = null
      const failure = e instanceof SqlTimeout ? t.timeout : t.crashed(e instanceof Error ? e.message : String(e))
      if (number === latest.current) setOutcome({ run: null, results: null, expected: null, failure })
    } finally {
      if (number === latest.current) setRunning(false)
    }
  }

  // Examples run right away, exercises on the button. Either way PostgreSQL starts now.
  const firstRun = useEffectEvent(() => {
    startSql()
    if (!tests) void start(code, false)
  })
  useEffect(() => {
    firstRun()
  }, [])

  const markers: Typfehler[] | undefined = useMemo(() => {
    const error = outcome?.run?.error
    return error ? [{ zeile: error.line, spalte: error.column, laenge: error.length, text: error.message, code: 0 }] : undefined
  }, [outcome])

  return (
    <Rahmen
      {...playground}
      art="SQL"
      titel={titel}
      aufgabe={aufgabe}
      code={code}
      setCode={setCode}
      startCode={startCode}
      loesung={loesung}
      tipps={tipps}
      markierungen={markers}
      laeuft={running}
      oben={<SqlDatenleiste code={code} />}
      ausfuehren={(c) => {
        setRunning(true)
        void start(c ?? code, true)
      }}
    >
      <Testergebnisse id={id} ergebnisse={outcome?.results ?? null} />
      {outcome?.failure ? (
        <p className="flex gap-2 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <Icon name="warnung" className="mt-0.5 size-4 shrink-0" />
          {outcome.failure}
        </p>
      ) : outcome?.run ? (
        <SqlOutput run={outcome.run} />
      ) : (
        <p className="px-4 py-3 text-sm text-slate-500 italic dark:text-slate-400">{!ready && (running || !tests) ? t.starting : tests ? t.exerciseStart : t.running}</p>
      )}
      {outcome?.expected && (
        <details className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <summary className="cursor-pointer text-sm font-medium text-brand-700 dark:text-brand-400">{t.expected}</summary>
          <div className="mt-2">
            <ResultTable table={outcome.expected} />
          </div>
        </details>
      )}
    </Rahmen>
  )
}

function SqlOutput({ run }: { run: SqlRun }) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  if (!run.results.length && !run.error) return <p className="px-4 py-3 text-sm text-slate-500 italic dark:text-slate-400">{t.empty}</p>

  return (
    <div className="space-y-3 px-4 py-3">
      {run.results.map((result, i) => (
        <div key={i} className="space-y-1">
          <p className="flex items-baseline gap-2 font-mono text-2xs text-slate-500 dark:text-slate-400">
            <span className="shrink-0 text-slate-500 tabular-nums dark:text-slate-400">{t.line(result.line)}</span>
            <span className="min-w-0 truncate">{result.label}</span>
          </p>
          {result.hasRows ? (
            <>
              <ResultTable table={result} />
              {t.affected[result.command] && <p className="text-xs text-slate-500 dark:text-slate-400">{t.affected[result.command](result.affected)}</p>}
            </>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
              <Icon name="kreisHaken" className="size-4" />
              <span className="font-mono text-xs font-semibold">{result.command}</span>
              <span className="text-slate-600 dark:text-slate-300">{t.affected[result.command]?.(result.affected) ?? t.done}</span>
            </p>
          )}
        </div>
      ))}
      {run.error && <ErrorBox error={run.error} />}
      {run.results.length > 0 && <p className="text-right text-2xs text-slate-500 tabular-nums dark:text-slate-400">{t.ms(run.ms)}</p>}
    </div>
  )
}

function ErrorBox({ error }: { error: SqlError }) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  return (
    <div className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-3 font-mono text-code whitespace-pre-wrap text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
      <p className="text-2xs text-rose-700 dark:text-rose-400/80">
        {t.line(error.line)} · {error.label}
      </p>
      <p>
        <strong>{t.error}:</strong> {error.message}
      </p>
      {error.detail && <p>DETAIL: {error.detail}</p>}
      {error.hint && <p>HINT: {error.hint}</p>}
      {error.skipped > 0 && <p className="pt-1 font-sans text-xs text-rose-700/80 dark:text-rose-300/80">{t.stopped(error.skipped)}</p>}
    </div>
  )
}

/** A result like in a database tool: header, NULL in grey, numbers on the right. */
export function ResultTable({ table }: { table: SqlTable }) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const numeric = table.columns.map((_, c) =>
    table.rows.some((row) => row[c] !== null) && table.rows.every((row) => row[c] === null || /^-?\d+(\.\d+)?$/.test(row[c]!)),
  )
  const total = table.rows.length + (table.truncated ?? 0)

  return (
    <div>
      <div ref={focusableWhenScrolling} className="max-h-80 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full border-collapse font-mono text-code">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
            <tr>
              {table.columns.map((column, c) => (
                <th
                  key={c}
                  scope="col"
                  className={`border-b border-slate-200 px-2.5 py-1 font-semibold whitespace-nowrap text-slate-700 dark:border-slate-700 dark:text-slate-200 ${numeric[c] ? 'text-right' : 'text-left'}`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-900/40">
                {row.map((value, c) => (
                  <td key={c} className={`px-2.5 py-0.5 align-top whitespace-pre ${numeric[c] ? 'text-right tabular-nums' : ''}`}>
                    {value === null ? <span className="text-slate-500 italic dark:text-slate-400">NULL</span> : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
        ({t.rows(total)})
        {table.truncated ? ' ' + t.more(table.truncated) : ''}
      </p>
    </div>
  )
}
