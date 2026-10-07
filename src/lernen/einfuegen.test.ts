import { describe, expect, it } from 'vitest'

import { einfuegungAnwenden, einfuegungBerechnen, einfuegungenPlanen } from './einfuegen'

/** Inserts `snippet` at the `|` in `code` and returns the new code with `|` at the cursor. */
function insertAt(code: string, snippet: string) {
  const at = code.indexOf('|')
  const plain = code.replace('|', '')
  const insertion = einfuegungBerechnen(plain, at, at, snippet)
  const result = einfuegungAnwenden(plain, insertion)
  return result.slice(0, insertion.cursor) + '|' + result.slice(insertion.cursor)
}

describe('einfuegungBerechnen', () => {
  it('puts the snippet on a new line below when the cursor is behind code', () => {
    expect(insertAt('  const a = 1|\n', 'const b = 2')).toBe('  const a = 1\n  const b = 2|\n')
  })

  it('puts the snippet above a line when the cursor is at its start', () => {
    expect(insertAt('|  run()\n', 'setup()')).toBe('  setup()|\n  run()\n')
  })

  it('indents every line of a multi-line snippet like the target line', () => {
    expect(insertAt('    |', 'if (x) {\n  go()\n}')).toBe('    if (x) {\n      go()\n    }|')
  })

  it('does not indent blank lines of the snippet', () => {
    expect(insertAt('  |', 'a\n\nb')).toBe('  a\n\n  b|')
  })

  it('places the cursor at $0', () => {
    expect(insertAt('|', 'console.log($0)')).toBe('console.log(|)')
  })
})

describe('einfuegungenPlanen', () => {
  it('applies several parts from the back, so earlier positions stay valid', () => {
    const code = 'top\nbottom'
    const plan = einfuegungenPlanen(code, [
      { baustein: 'A', start: 0, ende: 0 },
      { baustein: 'B', start: code.length, ende: code.length, haupt: true },
    ])
    const result = plan.einfuegungen.reduce((c, e) => einfuegungAnwenden(c, e), code)
    expect(result).toBe('A\ntop\nbottom\nB')
    expect(plan.code).toBe(result)
    // The main part decides the cursor - shifted by the text inserted in front of it.
    expect(plan.cursor).toBe(result.length)
  })
})
