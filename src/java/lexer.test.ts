import { describe, expect, it } from 'vitest'

import { JavaSyntaxError, tokenize } from './lexer'

const texts = (source: string) => tokenize(source).filter((t) => t.kind !== 'end').map((t) => t.text)
const kinds = (source: string) => tokenize(source).filter((t) => t.kind !== 'end').map((t) => t.kind)

describe('tokenisieren', () => {
  it('splits a statement into keywords, names, symbols and numbers', () => {
    expect(texts('int x = 5;')).toEqual(['int', 'x', '=', '5', ';'])
    expect(kinds('int x = 5;')).toEqual(['keyword', 'name', 'symbol', 'number', 'symbol'])
  })

  it('always takes the longest operator', () => {
    expect(texts('a >>>= b -> c :: d ... e')).toEqual(['a', '>>>=', 'b', '->', 'c', '::', 'd', '...', 'e'])
    expect(texts('i++ + ++j')).toEqual(['i', '++', '+', '++', 'j'])
  })

  it('reads number literals with underscores, exponents and suffixes', () => {
    const [million, pi, exp, long, hex] = tokenize('1_000_000 3.14f 2e3 10L 0xFF')
    expect(million).toMatchObject({ value: 1_000_000, isFloat: false })
    expect(pi).toMatchObject({ value: 3.14, isFloat: true })
    expect(exp).toMatchObject({ value: 2000, isFloat: true })
    expect(long).toMatchObject({ value: 10, isFloat: false })
    expect(hex).toMatchObject({ value: 255 })
  })

  it('unescapes strings and keeps chars as code points', () => {
    const [text, char] = tokenize(String.raw`"a\tb\n\"c\" A" 'x'`)
    expect(text).toMatchObject({ kind: 'text', text: 'a\tb\n"c" A' })
    expect(char).toMatchObject({ kind: 'char', value: 'x'.charCodeAt(0) })
  })

  it('removes the common indentation of a text block', () => {
    const [block] = tokenize('"""\n    Hello\n      World\n    """')
    expect(block).toMatchObject({ kind: 'text', text: 'Hello\n  World' })
  })

  it('skips comments and tracks line and column', () => {
    const tokens = tokenize('// line comment\n/* block\n comment */ int\n  x')
    expect(tokens.filter((t) => t.kind !== 'end').map((t) => [t.text, t.line, t.column])).toEqual([
      ['int', 3, 13],
      ['x', 4, 3],
    ])
  })

  it.each([
    ['"open', 'unclosed string literal', 1],
    ['\n"""\nnever closed', 'unclosed text block', 2],
    ['/* forever', 'unclosed comment', 1],
  ])('reports %j with its line', (source, message, line) => {
    expect(() => tokenize(source)).toThrow(JavaSyntaxError)
    try {
      tokenize(source)
    } catch (error) {
      expect(error).toMatchObject({ message, line })
    }
  })
})
