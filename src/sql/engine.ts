import type { PGlite } from '@electric-sql/pglite'
import { SHOP_SQL } from './dataset'
import { lineAndColumn, splitStatements, stripComments, type Statement } from './statements'

/**
 * Runs an SQL script against PGlite - real PostgreSQL compiled to WebAssembly.
 *
 * Knows nothing about React or workers: the browser calls it inside a web worker
 * (worker.ts), `npm run test:sql` directly in Node.
 *
 * Every run starts from a fresh copy of the example database (resetDatabase), then
 * executes the statements one by one - like psql with ON_ERROR_STOP: the first error
 * ends the run. Values come back as text, exactly as PostgreSQL prints them.
 */

export type SqlTable = {
  columns: string[]
  rows: (string | null)[][]
  /** More rows than were sent back (see MAX_ROWS). */
  truncated?: number
}

export type SqlResult = SqlTable & {
  /** First line of the statement, without comments - the label above the result. */
  label: string
  /** 1-based line in the script. */
  line: number
  /** "SELECT", "INSERT", "CREATE TABLE", "\d" … */
  command: string
  /** Did the statement return rows (SELECT, RETURNING, meta command)? */
  hasRows: boolean
  affected: number
}

export type SqlError = {
  message: string
  detail?: string
  hint?: string
  /** SQLSTATE, e.g. 23505 for a unique violation. */
  code?: string
  line: number
  column: number
  length: number
  label: string
  /** Statements after the failing one that were not run. */
  skipped: number
}

export type SqlRun = {
  results: SqlResult[]
  error: SqlError | null
  /** Results of the check queries of an exercise - run after the script. */
  checks: (SqlTable | { error: string })[]
  ms: number
}

export type RunOptions = {
  /** Queries that run after the script (exercise tests) - their results land in `checks`. */
  checks?: string[]
  /** Without the example tables (only for tests of the runtime itself). */
  empty?: boolean
}

const MAX_ROWS = 500

/**
 * PostgreSQL sends values as text. PGlite turns some of them into JavaScript objects
 * (Date, arrays, JSON) - these OIDs stay text instead, so they look like in psql.
 */
const RAW_TYPES = [
  17, // bytea
  114, 3802, // json, jsonb
  1082, 1083, 1114, 1184, 1186, 1266, // date, time, timestamp, timestamptz, interval, timetz
  199, 1000, 1005, 1007, 1009, 1014, 1015, 1016, 1021, 1022, 1115, 1182, 1185, 1231, 3807, // arrays
]
export const PARSERS = Object.fromEntries(RAW_TYPES.map((oid) => [oid, (value: string) => value]))

/** Throws the example database away and loads it again - a few milliseconds. */
export async function resetDatabase(db: PGlite, options: RunOptions = {}) {
  // Leave an open (or aborted) transaction of the previous run, then reset the session.
  try {
    await db.exec('ROLLBACK')
  } catch {
    // no transaction open
  }
  await db.exec('DISCARD ALL')
  const schemas = await db.query<{ nspname: string }>(
    `SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg\\_%' AND nspname NOT IN ('information_schema', 'public')`,
  )
  for (const { nspname } of schemas.rows) await db.exec(`DROP SCHEMA "${nspname.replace(/"/g, '""')}" CASCADE`)
  await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;')
  if (!options.empty) await db.exec(SHOP_SQL)
}

export async function runScript(db: PGlite, script: string, options: RunOptions = {}): Promise<SqlRun> {
  const begin = performance.now()
  await resetDatabase(db, options)

  const results: SqlResult[] = []
  let error: SqlError | null = null

  const statements = splitStatements(script)
  for (const [index, statement] of statements.entries()) {
    const label = labelOf(statement)
    // The line where the statement itself begins - after leading comments.
    const line = lineAndColumn(script, statement.start + statement.text.length - stripComments(statement.text).length).line
    try {
      if (statement.meta !== undefined) {
        results.push(...(await metaCommand(db, statement.meta)).map((table) => ({ ...table, label, line, command: '\\' + statement.meta!.split(/\s/)[0], hasRows: true, affected: 0 })))
        continue
      }
      const [result] = (await db.exec(statement.text, { rowMode: 'array', parsers: PARSERS })).slice(-1)
      const hasRows = (result?.fields.length ?? 0) > 0
      results.push({
        ...(hasRows ? toTable(result.fields, result.rows as unknown[][]) : { columns: [], rows: [] }),
        label,
        line,
        command: commandOf(statement),
        hasRows,
        affected: result?.affectedRows ?? 0,
      })
    } catch (e) {
      error = { ...toError(e, script, statement, label), skipped: statements.length - index - 1 }
      break
    }
  }

  const checks: SqlRun['checks'] = []
  for (const check of options.checks ?? []) {
    try {
      // A failed transaction would block every check - end it first.
      if (error) await db.exec('ROLLBACK').catch(() => {})
      const [result] = (await db.exec(check, { rowMode: 'array', parsers: PARSERS })).slice(-1)
      checks.push(toTable(result?.fields ?? [], (result?.rows ?? []) as unknown[][]))
    } catch (e) {
      checks.push({ error: e instanceof Error ? e.message : String(e) })
    }
  }

  return { results, error, checks, ms: Math.round(performance.now() - begin) }
}

function toTable(fields: { name: string }[], rows: unknown[][]): SqlTable {
  return {
    columns: fields.map((f) => f.name),
    rows: rows.slice(0, MAX_ROWS).map((row) => row.map(toText)),
    ...(rows.length > MAX_ROWS ? { truncated: rows.length - MAX_ROWS } : {}),
  }
}

/** Everything as text - the way PostgreSQL itself prints it (booleans as true/false instead of t/f). */
export function toText(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  return JSON.stringify(value)
}

function labelOf(statement: Statement) {
  const text = statement.meta !== undefined ? '\\' + statement.meta : stripComments(statement.text)
  const first = text.split('\n')[0].trim()
  const more = text.trim().includes('\n') || first.length > 70
  return (first.length > 70 ? first.slice(0, 70) : first).replace(/;$/, '') + (more ? ' …' : '')
}

/** The command tag as psql shows it: SELECT, INSERT, CREATE TABLE … */
export function commandOf(statement: Statement) {
  const words = stripComments(statement.text).toUpperCase().match(/[A-Z_]+/g) ?? []
  const [first = '', ...rest] = words
  if (['CREATE', 'ALTER', 'DROP'].includes(first)) {
    const object = rest.find((w) => !['OR', 'REPLACE', 'UNIQUE', 'TEMP', 'TEMPORARY', 'IF', 'NOT', 'EXISTS', 'MATERIALIZED'].includes(w))
    return `${first} ${object ?? ''}`.trim()
  }
  return first
}

function toError(e: unknown, script: string, statement: Statement, label: string): Omit<SqlError, 'skipped'> {
  const err = e as { message?: string; position?: string | number; detail?: string; hint?: string; code?: string }
  const text = statement.text
  // PostgreSQL counts from 1 inside the statement it got. Without a position: the start of the statement.
  const position = Number(err.position)
  const inStatement = position > 0 ? position - 1 : text.length - stripComments(text).length
  const offset = statement.start + inStatement
  const { line, column } = lineAndColumn(script, offset)
  const token = script.slice(offset).match(/^("[^"\n]*"|'[^'\n]*'|\w+|\S)/)?.[0] ?? ' '
  return {
    message: err.message ?? String(e),
    detail: err.detail || undefined,
    hint: err.hint || undefined,
    code: err.code || undefined,
    line,
    column,
    length: position > 0 ? token.length : stripComments(text).split('\n')[0].length || 1,
    label,
  }
}

// ---------------------------------------------------------------------------
// psql meta commands - the most important ones, answered from the system catalog
// ---------------------------------------------------------------------------

export const META_COMMANDS = ['\\dt', '\\d NAME', '\\di']

async function metaCommand(db: PGlite, command: string): Promise<SqlTable[]> {
  const [name, ...args] = command.split(/\s+/)
  const arg = args.join(' ')
  const table = async (query: string, params: unknown[] = []) => {
    const r = await db.query(query, params, { rowMode: 'array', parsers: PARSERS })
    return toTable(r.fields, r.rows as unknown[][])
  }

  if ((name === 'd' || name === 'dt' || name === 'd+' || name === 'dt+') && !arg) {
    return [
      await table(`
        SELECT n.nspname AS "Schema", c.relname AS "Name",
               CASE c.relkind WHEN 'r' THEN 'table' WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view' ELSE 'other' END AS "Type"
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind IN ('r', 'v', 'm') AND n.nspname NOT IN ('pg_catalog', 'information_schema') AND n.nspname NOT LIKE 'pg\\_%'
        ORDER BY 1, 2`),
    ]
  }
  if (name === 'di' && !arg) {
    return [
      await table(`
        SELECT schemaname AS "Schema", indexname AS "Name", tablename AS "Table", indexdef AS "Definition"
        FROM pg_indexes WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY 1, 3, 2`),
    ]
  }
  if (name === 'd' || name === 'd+') {
    const exists = await db.query('SELECT to_regclass($1) AS oid', [arg])
    if (!(exists.rows[0] as { oid: unknown }).oid) throw new Error(`Did not find any relation named "${arg}".`)
    const columns = await table(
      `
      SELECT a.attname AS "Column", format_type(a.atttypid, a.atttypmod) AS "Type",
             CASE WHEN a.attnotnull THEN 'not null' ELSE '' END AS "Nullable",
             COALESCE(pg_get_expr(d.adbin, d.adrelid),
                      CASE a.attidentity WHEN 'd' THEN 'generated by default as identity' WHEN 'a' THEN 'generated always as identity' END,
                      '') AS "Default"
      FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE a.attrelid = to_regclass($1) AND a.attnum > 0 AND NOT a.attisdropped
      ORDER BY a.attnum`,
      [arg],
    )
    const keys = await table(
      `
      SELECT conname AS "Constraint / index", pg_get_constraintdef(oid) AS "Definition"
      FROM pg_constraint WHERE conrelid = to_regclass($1) AND contype <> 'n'
      UNION ALL
      SELECT i.relname, pg_get_indexdef(i.oid)
      FROM pg_index x JOIN pg_class i ON i.oid = x.indexrelid
      WHERE x.indrelid = to_regclass($1) AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = x.indexrelid)
      ORDER BY 1`,
      [arg],
    )
    return keys.rows.length ? [columns, keys] : [columns]
  }
  throw new Error(`\\${name}: this meta command is not available here. Available: ${META_COMMANDS.join(', ')}`)
}
