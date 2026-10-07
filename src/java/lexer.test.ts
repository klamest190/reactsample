import { describe, expect, it } from 'vitest'

import { JavaSyntaxFehler, tokenisieren } from './lexer'

const texts = (source: string) => tokenisieren(source).filter((t) => t.art !== 'ende').map((t) => t.text)
const kinds = (source: string) => tokenisieren(source).filter((t) => t.art !== 'ende').map((t) => t.art)

describe('tokenisieren', () => {
  it('splits a statement into keywords, names, symbols and numbers', () => {
    expect(texts('int x = 5;')).toEqual(['int', 'x', '=', '5', ';'])
    expect(kinds('int x = 5;')).toEqual(['schluessel', 'name', 'symbol', 'zahl', 'symbol'])
  })

  it('always takes the longest operator', () => {
    expect(texts('a >>>= b -> c :: d ... e')).toEqual(['a', '>>>=', 'b', '->', 'c', '::', 'd', '...', 'e'])
    expect(texts('i++ + ++j')).toEqual(['i', '++', '+', '++', 'j'])
  })

  it('reads number literals with underscores, exponents and suffixes', () => {
    const [million, pi, exp, long, hex] = tokenisieren('1_000_000 3.14f 2e3 10L 0xFF')
    expect(million).toMatchObject({ wert: 1_000_000, kommazahl: false })
    expect(pi).toMatchObject({ wert: 3.14, kommazahl: true })
    expect(exp).toMatchObject({ wert: 2000, kommazahl: true })
    expect(long).toMatchObject({ wert: 10, kommazahl: false })
    expect(hex).toMatchObject({ wert: 255 })
  })

  it('unescapes strings and keeps chars as code points', () => {
    const [text, char] = tokenisieren(String.raw`"a\tb\n\"c\" A" 'x'`)
    expect(text).toMatchObject({ art: 'text', text: 'a\tb\n"c" A' })
    expect(char).toMatchObject({ art: 'zeichen', wert: 'x'.charCodeAt(0) })
  })

  it('removes the common indentation of a text block', () => {
    const [block] = tokenisieren('"""\n    Hello\n      World\n    """')
    expect(block).toMatchObject({ art: 'text', text: 'Hello\n  World' })
  })

  it('skips comments and tracks line and column', () => {
    const tokens = tokenisieren('// line comment\n/* block\n comment */ int\n  x')
    expect(tokens.filter((t) => t.art !== 'ende').map((t) => [t.text, t.zeile, t.spalte])).toEqual([
      ['int', 3, 13],
      ['x', 4, 3],
    ])
  })

  it.each([
    ['"open', 'unclosed string literal', 1],
    ['\n"""\nnever closed', 'unclosed text block', 2],
    ['/* forever', 'unclosed comment', 1],
  ])('reports %j with its line', (source, message, line) => {
    expect(() => tokenisieren(source)).toThrow(JavaSyntaxFehler)
    try {
      tokenisieren(source)
    } catch (error) {
      expect(error).toMatchObject({ meldung: message, zeile: line })
    }
  })
})
