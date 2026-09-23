import type { Zweisprachig } from '../i18n/SpracheContext'
import type { CodeBeispiel, TestErgebnis } from '../lernen/jsSandbox'
import type { RunOptions, SqlRun, SqlTable } from './engine'
import { localized } from '../i18n/localized'
import { contentResult, type ContentResult } from '../selbsttest/results'

/**
 * Tests for SQL exercises (part 9).
 *
 * Nobody writes expected values by hand: the model solution runs on its own fresh
 * database, and the learner's result has to match the solution's result.
 *
 *   { name }                    the last result of the script (the final SELECT)
 *   { name, abfrage: 'SELECT …' }  a check query that runs AFTER the script -
 *                               for INSERT, UPDATE, DELETE and CREATE TABLE
 *   reihenfolge: true           the rows must also come in the same order (ORDER BY)
 *   spalten: true               the column names must match too (AS)
 */
export type SqlTest = {
  name: string | Zweisprachig
  abfrage?: string
  reihenfolge?: boolean
  spalten?: boolean
}

/** An example or exercise in a chapter's .code.ts (part 9) - spread into <TryIt modus="sql">. */
export type SqlBeispiel = {
  code: string
  loesung?: string
  tests?: SqlTest[]
  /** Tips of an exercise - in both languages, shown one after the other. */
  tipps?: Zweisprachig<string[]>
}

export type SqlRunner = (script: string, options?: RunOptions) => Promise<SqlRun>

type Language = 'de' | 'en'

const TEXTS = {
  de: {
    scriptError: (m: string) => `Fehler im Skript: ${m}`,
    checkError: (m: string) => `Prüfabfrage schlägt fehl: ${m}`,
    noResult: 'Das Skript liefert kein Ergebnis - fehlt das SELECT am Ende?',
    columns: (expected: number, got: number) => `Erwartet ${expected} ${expected === 1 ? 'Spalte' : 'Spalten'}, bekommen ${got}`,
    names: (got: string, expected: string) => `Die Spalten heißen „${got}“ - erwartet „${expected}“`,
    rows: (expected: number, got: number) => `Erwartet ${expected} ${expected === 1 ? 'Zeile' : 'Zeilen'}, bekommen ${got}`,
    missing: (row: string) => `Diese Zeile fehlt: ${row}`,
    extra: (row: string) => `Diese Zeile gehört nicht dazu: ${row}`,
    order: 'Die Zeilen stimmen, aber nicht ihre Reihenfolge',
    rowDiffers: (n: number, expected: string, got: string) => `Zeile ${n}: erwartet ${expected}, bekommen ${got}`,
  },
  en: {
    scriptError: (m: string) => `Error in the script: ${m}`,
    checkError: (m: string) => `Check query fails: ${m}`,
    noResult: 'The script returns no result - is the SELECT at the end missing?',
    columns: (expected: number, got: number) => `Expected ${expected} ${expected === 1 ? 'column' : 'columns'}, got ${got}`,
    names: (got: string, expected: string) => `The columns are called “${got}” - expected “${expected}”`,
    rows: (expected: number, got: number) => `Expected ${expected} ${expected === 1 ? 'row' : 'rows'}, got ${got}`,
    missing: (row: string) => `This row is missing: ${row}`,
    extra: (row: string) => `This row does not belong: ${row}`,
    order: 'The rows are right, but not their order',
    rowDiffers: (n: number, expected: string, got: string) => `Row ${n}: expected ${expected}, got ${got}`,
  },
}

/** The check queries of the tests - they run after the script, in the same database. */
export function checkQueries(tests: SqlTest[] = []) {
  return tests.flatMap((t) => (t.abfrage ? [t.abfrage] : []))
}

/** The result the script ends with: the last statement that returned rows. */
export function lastTable(run: SqlRun): SqlTable | undefined {
  return run.results.filter((r) => r.hasRows).at(-1)
}

/**
 * Compares the learner's run with the solution's run - one entry per test.
 * Both runs must have been made with `checks: checkQueries(tests)`.
 */
export function evaluate(tests: SqlTest[], learner: SqlRun, solution: SqlRun, language: Language): TestErgebnis[] {
  const t = TEXTS[language]
  let check = 0
  return tests.map((test) => {
    const name = localized(test.name, language)
    const result = (meldung = '') => ({ name, ok: !meldung, meldung })

    let got: SqlTable | { error: string } | undefined
    let expected: SqlTable | { error: string } | undefined
    if (test.abfrage) {
      got = learner.checks[check]
      expected = solution.checks[check]
      check++
    } else {
      got = lastTable(learner)
      expected = lastTable(solution)
    }

    if (learner.error) return result(t.scriptError(learner.error.message))
    if (!expected || 'error' in expected) return result(t.checkError(expected?.error ?? '-'))
    if (!got) return result(t.noResult)
    if ('error' in got) return result(t.checkError(got.error))
    return result(compareTables(got, expected, test, language) ?? '')
  })
}

/** null if equal, otherwise what differs - in words a learner can act on. */
export function compareTables(got: SqlTable, expected: SqlTable, options: { reihenfolge?: boolean; spalten?: boolean }, language: Language): string | null {
  const t = TEXTS[language]
  if (got.columns.length !== expected.columns.length) return t.columns(expected.columns.length, got.columns.length)
  if (options.spalten && got.columns.join() !== expected.columns.join()) return t.names(got.columns.join(', '), expected.columns.join(', '))

  const gotRows = got.rows.map(rowKey)
  const expectedRows = expected.rows.map(rowKey)

  // Missing and extra rows first - that is the more helpful message.
  const rest = [...gotRows]
  const missing: number[] = []
  expectedRows.forEach((row, i) => {
    const index = rest.indexOf(row)
    if (index >= 0) rest.splice(index, 1)
    else missing.push(i)
  })
  if (gotRows.length !== expectedRows.length && (missing.length === 0 || rest.length === 0)) {
    return t.rows(expectedRows.length, gotRows.length) + ' - ' + (missing.length ? t.missing(show(expected.rows[missing[0]])) : t.extra(show(got.rows[gotRows.indexOf(rest[0])])))
  }
  if (missing.length) {
    const extraIndex = gotRows.indexOf(rest[0])
    return gotRows.length !== expectedRows.length
      ? t.rows(expectedRows.length, gotRows.length) + ' - ' + t.missing(show(expected.rows[missing[0]]))
      : missing.length === 1 && extraIndex >= 0
        ? t.rowDiffers(extraIndex + 1, show(expected.rows[missing[0]]), show(got.rows[extraIndex]))
        : t.missing(show(expected.rows[missing[0]]))
  }
  if (options.reihenfolge && gotRows.join('\n') !== expectedRows.join('\n')) return t.order
  return null
}

/** Numbers compare by value: 12.50 and 12.5 are the same. */
function normalize(value: string | null) {
  if (value === null) return '∅'
  return /^-?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(value) ? String(Number(value)) : value
}

function rowKey(row: (string | null)[]) {
  return JSON.stringify(row.map(normalize))
}

function show(row: (string | null)[]) {
  const text = '(' + row.map((v) => (v === null ? 'NULL' : v)).join(', ') + ')'
  return text.length > 90 ? text.slice(0, 89) + '…)' : text
}

// ---------------------------------------------------------------------------
// Self-test of the course content (browser self-test and npm run test:sql)
// ---------------------------------------------------------------------------

/** Examples that fail on purpose - with the reason. */
export const SQL_EXPECTED_FAILURES: Record<string, string> = {
  'sql-gruppieren-fehler': 'a column that is neither grouped nor aggregated',
  'sql-gruppieren-alias': 'WHERE cannot see an alias from SELECT',
  'sql-aendern-fremdschluessel': 'deleting a customer who still has orders',
  'sql-tabellen-check': 'a rating outside CHECK (rating BETWEEN 1 AND 5)',
}


/**
 *   example without tests   runs without errors (the solution too, if there is one)
 *   exercise with tests     the solution passes all tests, the start code does NOT
 */
export async function sqlExampleCheck(id: string, example: CodeBeispiel, run: SqlRunner): Promise<ContentResult> {
  const result = contentResult(id)
  const tests = example.tests as SqlTest[] | undefined

  if (tests?.length) {
    if (!example.loesung) return result('exercise with tests but without a solution')
    const checks = checkQueries(tests)
    const solution = await run(example.loesung, { checks })
    if (solution.error) return result(`solution fails in line ${solution.error.line}: ${solution.error.message}`)
    const own = evaluate(tests, solution, solution, 'en').filter((r) => !r.ok)
    if (own.length) return result(`solution does not pass its own tests: ${own.map((r) => `${r.name}: ${r.meldung}`).join(' · ')}`)
    const start = await run(example.code, { checks })
    if (evaluate(tests, start, solution, 'en').every((r) => r.ok)) return result('the start code already passes all tests - nothing to practise')
    return result()
  }

  const expected = SQL_EXPECTED_FAILURES[id]
  const own = await run(example.code)
  if (own.error && !expected) return result(`line ${own.error.line}: ${own.error.message}`)
  if (!own.error && expected) return result(`should fail (${expected}), but works`)
  if (example.loesung) {
    const solution = await run(example.loesung)
    if (solution.error) return result(`solution, line ${solution.error.line}: ${solution.error.message}`)
  }
  return result()
}
