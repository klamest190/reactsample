/**
 * Checks part 9 (PostgreSQL) on the command line - with the same PGlite as the browser:
 *
 *   npm run test:sql
 *
 *   1. the runtime itself: statement splitter, meta commands, error positions
 *   2. the example database matches the table list of the table browser (src/sql/dataset.ts)
 *   3. every example and exercise of the chapters in src/kurs/sql/, the extra exercises
 *      in src/kurs/uebungen/sql.ts and the SQL playground
 *
 * The same checks also run in `npm run test:inhalte` in the browser; this script is the
 * fast way without a browser - like `npm run test:backend`.
 */

import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PGlite } from '@electric-sql/pglite'

import { sqlExampleCheck, type SqlRunner } from '../src/sql/check'
import { SHOP_TABELLEN } from '../src/sql/dataset'
import { runScript } from '../src/sql/engine'
import { splitStatements } from '../src/sql/statements'
import { uebungen } from '../src/kurs/uebungen/sql'
import { sqlPlayground } from '../src/kurs/playground/sql'
import type { CodeBeispiel } from '../src/lernen/jsSandbox'

const db = await PGlite.create()
const run: SqlRunner = (script, options) => runScript(db, script, options)

let failed = 0
const report = (ok: boolean, name: string, message = '') => {
  if (!ok) failed++
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : '\n    → ' + message.replace(/\n/g, '\n      ')}`)
}
const B = String.fromCharCode(92) // a backslash - written like this so no tool can swallow it

console.log('── Runtime ' + '─'.repeat(51))
{
  const parts = splitStatements(`SELECT 'a;b', "x;y", $$;$$ FROM t; -- c;\n/* d; */ SELECT 2;\n${B}dt\n${B}d orders\nSELECT E'${B}';';`)
  report(parts.length === 5 && parts[2].meta === 'dt' && parts[3].meta === 'd orders', 'splitter: strings, comments, dollar quotes, meta commands', JSON.stringify(parts))
  const r = await run(`SELECT 1;\nSELECT nme\n  FROM customers;`)
  report(r.error?.line === 2 && r.error.column === 7 && r.results.length === 1, 'error position → line 2, column 7', JSON.stringify(r.error))
  const meta = await run(`${B}dt\n${B}d customers`)
  report(meta.results[0]?.rows.length === 4 && meta.results[1]?.columns[0] === 'Column', 'meta commands \\dt and \\d', JSON.stringify(meta.results.map((x) => x.rows.length)))
  const fresh = await run('SELECT count(*) FROM customers')
  await run('DELETE FROM order_items; DROP TABLE orders CASCADE; CREATE SCHEMA junk; BEGIN; SET search_path = junk;')
  const again = await run('SELECT count(*) FROM customers')
  report(again.results[0]?.rows[0]?.[0] === fresh.results[0]?.rows[0]?.[0] && !again.error, 'every run starts with a fresh database', JSON.stringify(again))
  const values = await run(`SELECT DATE '2026-01-02' AS d, '{1,2}'::int[] AS a, true AS b, 1.50::numeric AS n, NULL AS x`)
  report(JSON.stringify(values.results[0]?.rows[0]) === '["2026-01-02","{1,2}","true","1.50",null]', 'values come back as text like in psql', JSON.stringify(values.results[0]?.rows))
}

console.log('\n── Example database ' + '─'.repeat(42))
for (const table of SHOP_TABELLEN) {
  const r = await run(`
    SELECT column_name, CASE WHEN data_type = 'numeric' THEN 'numeric(' || numeric_precision || ',' || numeric_scale || ')' ELSE data_type END
    FROM information_schema.columns WHERE table_name = '${table.name}' ORDER BY ordinal_position;
    SELECT count(*) FROM ${table.name};`)
  const columns = r.results[0]?.rows.map((row) => `${row[0]} ${row[1]}`).join(', ')
  const expected = table.spalten.map((c) => `${c.name} ${c.typ}`).join(', ')
  const rows = Number(r.results[1]?.rows[0]?.[0])
  report(columns === expected && rows === table.zeilen, `${table.name}: ${table.spalten.length} columns, ${table.zeilen} rows`, `got ${columns} / ${rows} rows`)
}

console.log('\n── Chapters, exercises, playground ' + '─'.repeat(27))
const folder = join(import.meta.dirname, '..', 'src', 'kurs', 'sql')
for (const file of readdirSync(folder).filter((f) => f.endsWith('.code.ts'))) {
  const module = (await import(pathToFileURL(join(folder, file)).href)) as { beispiele?: Record<string, CodeBeispiel> }
  for (const [id, example] of Object.entries(module.beispiele ?? {})) {
    const r = await sqlExampleCheck(id, example, run)
    report(r.ok, `${id}  (sql/${file})`, r.message)
  }
}
for (const list of Object.values(uebungen)) {
  for (const u of list) {
    if (u.stufe === 'vorhersage') {
      // The code of a prediction must run - the answer is about its result.
      const r = await run(u.code)
      report(!r.error, `${u.id}  (uebungen/sql.ts, prediction)`, r.error?.message)
      continue
    }
    const r = await sqlExampleCheck(u.id, u, run)
    report(r.ok, `${u.id}  (uebungen/sql.ts)`, r.message)
  }
}
{
  const p = sqlPlayground
  for (const [i, v] of p.vorlagen.entries()) {
    const r = await run(v.code)
    report(!r.error, `playground template ${i + 1}: ${v.titel.en}`, r.error && `line ${r.error.line}: ${r.error.message}`)
  }
  const all = p.gruppen.flatMap((g) => g.bausteine)
  for (const b of all) {
    const r = await run(p.vorlagen[0].code + '\n' + b.code.replace('$0', ''))
    report(!r.error, `playground block: ${b.titel.en}`, r.error && `line ${r.error.line}: ${r.error.message}`)
  }
  const together = all.reduce((code, b) => code + '\n' + b.code.replace('$0', ''), p.vorlagen[0].code)
  const r = await run(together)
  report(!r.error, 'playground: all blocks together', r.error && `line ${r.error.line}: ${r.error.message}`)
}

console.log(failed ? `\n${failed} failed` : '\nall ok')
await db.close()
process.exit(failed ? 1 : 0)
