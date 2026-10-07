import { describe, expect, it } from 'vitest'

import { hash, js } from './source'

describe('js tag', () => {
  it('removes the common indentation and the blank first and last line', () => {
    const code = js`
      function greet(name) {
        return 'Hi ' + name
      }
    `
    expect(code).toBe("function greet(name) {\n  return 'Hi ' + name\n}")
  })

  it('keeps escapes raw, like typed in the editor', () => {
    const code = js`
      console.log('a\nb')
    `
    expect(code).toBe("console.log('a\\nb')")
  })

  it('unescapes backticks and template placeholders', () => {
    const code = js`
      const s = \`Hi \${name}\`
    `
    expect(code).toBe('const s = `Hi ${name}`')
  })

  it('ignores blank lines when measuring the indentation', () => {
    const code = js`
        a

        b
    `
    expect(code).toBe('a\n\nb')
  })
})

describe('hash', () => {
  // The hash is part of every localStorage key for saved code (tryit:<id>:<hash>).
  // Changing it would silently drop every learner's saved code - these values are pinned.
  it.each([
    ['', '0'],
    ['a', '2p'],
    ['const x = 1', '5y5eg9'],
    ['console.log("Hallo")\n', '1qv3dlg'],
    ['ÄÖÜ €', '33p1ue'],
  ])('hash(%j) = %s', (text, expected) => {
    expect(hash(text)).toBe(expected)
  })
})
