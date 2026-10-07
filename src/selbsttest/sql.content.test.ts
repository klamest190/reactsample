/**
 * Part 9 (PostgreSQL) without a browser - with the same PGlite as the browser:
 *   1. the runtime itself: statement splitter, meta commands, error positions
 *   2. the example database matches the table list of the table browser (src/sql/dataset.ts)
 *   3. every example and exercise of the chapters in src/kurs/sql/, the extra exercises and the playground
 * The same checks run in the browser in `npm run test:inhalte`.
 */
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { sqlExampleCheck, type SqlRunner } from '../sql/check'
import { SHOP_TABELLEN } from '../sql/dataset'
import { runScript } from '../sql/engine'
import { uebungen } from '../kurs/uebungen/sql'
import { sqlPlayground } from '../kurs/playground/sql'
import type { CodeBeispiel } from '../lernen/jsSandbox'

const codeModules = import.meta.glob<{ beispiele?: Record<string, CodeBeispiel> }>('../kurs/sql/*.code.ts', { eager: true })

let db: PGlite
const run: SqlRunner = (script, options) => runScript(db, script, options)

beforeAll(async () => {
  db = await PGlite.create()
})
afterAll(async () => {
  await db.close()
})

const B = '\\'

describe('runtime', () => {
  it('reports the error position as line and column', async () => {
    const r = await run(`SELECT 1;\nSELECT nme\n  FROM customers;`)
    expect(r.error).toMatchObject({ line: 2, column: 7 })
    expect(r.results).toHaveLength(1)
  })

  it('answers the meta commands \\dt and \\d', async () => {
    const r = await run(`${B}dt\n${B}d customers`)
    expect(r.results[0]?.rows).toHaveLength(4)
    expect(r.results[1]?.columns[0]).toBe('Column')
  })

  it('starts every run with a fresh database', async () => {
    const fresh = await run('SELECT count(*) FROM customers')
    await run('DELETE FROM order_items; DROP TABLE orders CASCADE; CREATE SCHEMA junk; BEGIN; SET search_path = junk;')
    const again = await run('SELECT count(*) FROM customers')
    expect(again.error).toBeNull()
    expect(again.results[0]?.rows[0]?.[0]).toBe(fresh.results[0]?.rows[0]?.[0])
  })

  it('returns values as text like psql', async () => {
    const r = await run(`SELECT DATE '2026-01-02' AS d, '{1,2}'::int[] AS a, true AS b, 1.50::numeric AS n, NULL AS x`)
    expect(r.results[0]?.rows[0]).toEqual(['2026-01-02', '{1,2}', 'true', '1.50', null])
  })
})

describe('example database', () => {
  it.each(SHOP_TABELLEN)('$name has the documented columns and rows', async (table) => {
    const r = await run(`
      SELECT column_name, CASE WHEN data_type = 'numeric' THEN 'numeric(' || numeric_precision || ',' || numeric_scale || ')' ELSE data_type END
      FROM information_schema.columns WHERE table_name = '${table.name}' ORDER BY ordinal_position;
      SELECT count(*) FROM ${table.name};`)
    const columns = r.results[0]?.rows.map((row) => `${row[0]} ${row[1]}`)
    expect(columns).toEqual(table.spalten.map((c) => `${c.name} ${c.typ}`))
    expect(Number(r.results[1]?.rows[0]?.[0])).toBe(table.zeilen)
  })
})

describe('chapter contents', () => {
  const examples = Object.entries(codeModules).flatMap(([path, module]) =>
    Object.entries(module.beispiele ?? {}).map(([id, example]) => ({ id, example, file: path.split('/').pop()! })),
  )
  it('finds the chapters', () => expect(examples.length).toBeGreaterThan(0))
  it.each(examples)('$id ($file)', async ({ id, example }) => {
    const r = await sqlExampleCheck(id, example, run)
    expect(r.ok, r.message).toBe(true)
  })
})

describe('extra exercises', () => {
  const all = Object.values(uebungen).flat()
  it.each(all)('$id', async (u) => {
    if (u.stufe === 'vorhersage') {
      // The code of a prediction must run - the answer is about its result.
      const r = await run(u.code)
      expect(r.error?.message).toBeUndefined()
      return
    }
    const r = await sqlExampleCheck(u.id, u, run)
    expect(r.ok, r.message).toBe(true)
  })
})

describe('playground', () => {
  const p = sqlPlayground
  const blocks = p.gruppen.flatMap((g) => g.bausteine)
  const errorText = (r: Awaited<ReturnType<SqlRunner>>) => (r.error ? `line ${r.error.line}: ${r.error.message}` : undefined)

  it.each(p.vorlagen.map((v, i) => ({ ...v, nr: i + 1, name: v.titel.en })))('template $nr: $name', async (v) => {
    expect(errorText(await run(v.code))).toBeUndefined()
  })

  it.each(blocks.map((b) => ({ ...b, name: b.titel.en })))('block: $name', async (b) => {
    expect(errorText(await run(p.vorlagen[0].code + '\n' + b.code.replace('$0', '')))).toBeUndefined()
  })

  it('runs all blocks together', async () => {
    const together = blocks.reduce((code, b) => code + '\n' + b.code.replace('$0', ''), p.vorlagen[0].code)
    expect(errorText(await run(together))).toBeUndefined()
  })
})
