import { describe, expect, it } from 'vitest'

import { isEmpty, lineAndColumn, splitStatements, stripComments } from './statements'

const texts = (script: string) => splitStatements(script).map((s) => s.text.trim())

describe('splitStatements', () => {
  it('splits at semicolons and keeps each start offset', () => {
    const script = 'SELECT 1; SELECT 2;'
    const parts = splitStatements(script)
    expect(parts.map((p) => p.text)).toEqual(['SELECT 1;', ' SELECT 2;'])
    expect(parts.map((p) => script.slice(p.start, p.start + p.text.length))).toEqual(['SELECT 1;', ' SELECT 2;'])
  })

  it('keeps a statement without a final semicolon', () => {
    expect(texts('SELECT 1;\nSELECT 2')).toEqual(['SELECT 1;', 'SELECT 2'])
  })

  it('ignores semicolons in strings, quoted names, dollar quotes and comments', () => {
    const parts = splitStatements(`SELECT 'a;b', "x;y", $$;$$ FROM t; -- c;\n/* d; */ SELECT 2;\n\\dt\n\\d orders\nSELECT E'\\';';`)
    expect(parts).toHaveLength(5)
    expect(parts[0].text).toBe(`SELECT 'a;b', "x;y", $$;$$ FROM t;`)
    expect(parts[2].meta).toBe('dt')
    expect(parts[3].meta).toBe('d orders')
    expect(parts[4].text.trim()).toBe(`SELECT E'\\';';`)
  })

  it('handles tagged dollar quotes with semicolons inside', () => {
    expect(texts('DO $body$ BEGIN PERFORM 1; END $body$; SELECT 1;')).toEqual(['DO $body$ BEGIN PERFORM 1; END $body$;', 'SELECT 1;'])
  })

  it("treats '' as an escaped quote in a normal string", () => {
    expect(texts(`SELECT 'it''s; fine'; SELECT 2;`)).toEqual([`SELECT 'it''s; fine';`, 'SELECT 2;'])
  })

  it('drops parts that are only whitespace or comments', () => {
    expect(texts('SELECT 1;\n  -- just a comment\n')).toEqual(['SELECT 1;'])
  })

  it('reads a meta command up to the end of the line, with an optional semicolon', () => {
    const [meta, next] = splitStatements('\\d customers;\nSELECT 1;')
    expect(meta.meta).toBe('d customers')
    expect(next.text.trim()).toBe('SELECT 1;')
  })
})

describe('stripComments / isEmpty', () => {
  it('removes leading comments and whitespace only', () => {
    expect(stripComments('  -- a\n/* b */\n SELECT 1 -- c')).toBe('SELECT 1 -- c')
  })

  it('knows when nothing but comments is left', () => {
    expect(isEmpty('/* a */ -- b\n  ')).toBe(true)
    expect(isEmpty('/* a */ SELECT 1')).toBe(false)
  })
})

describe('lineAndColumn', () => {
  it('returns a 1-based line and a 0-based column', () => {
    const text = 'SELECT 1;\nSELECT nme\n  FROM customers;'
    expect(lineAndColumn(text, 0)).toEqual({ line: 1, column: 0 })
    expect(lineAndColumn(text, text.indexOf('nme'))).toEqual({ line: 2, column: 7 })
  })
})
