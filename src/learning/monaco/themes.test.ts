import { describe, expect, it } from 'vitest'

import { DARK, LIGHT, type ThemeColors } from './themes'

/**
 * `e2e:pages` runs axe-core over every page and Monaco's DOM is not excluded, so the
 * editor's token colours have to reach WCAG AA (4.5:1). This test keeps that honest
 * without starting a browser - it is the cheap guard in front of the expensive one.
 *
 * Measured against the *active line*, not the normal background: that line sits under the
 * cursor and has the lighter (resp. darker) highlight, so it is the worst case. An earlier
 * version failed exactly there.
 */

function channel(value: number): number {
  const v = value / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const n = parseInt(hex, 16)
  const r = channel((n >> 16) & 255)
  const g = channel((n >> 8) & 255)
  const b = channel(n & 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

/** Everything that is rendered as text and therefore measured by axe. */
const TEXT_TOKENS = ['foreground', 'comment', 'string', 'keyword', 'number', 'tag', 'fn', 'type', 'lineNumber'] as const

describe('contrast of the editor themes', () => {
  it('knows how to measure - black on white is 21:1', () => {
    expect(contrast('000000', 'FFFFFF')).toBeCloseTo(21, 0)
  })

  describe.each([
    ['light', LIGHT],
    ['dark', DARK],
  ])('%s', (_name, colors: ThemeColors) => {
    it.each(TEXT_TOKENS)('%s reaches AA on the normal background', (token) => {
      expect(contrast(colors[token], colors.background)).toBeGreaterThanOrEqual(4.5)
    })

    it.each(TEXT_TOKENS)('%s reaches AA on the highlighted active line', (token) => {
      expect(contrast(colors[token], colors.activeLine)).toBeGreaterThanOrEqual(4.5)
    })

    it('the active line number stays readable as well', () => {
      expect(contrast(colors.lineNumberActive, colors.activeLine)).toBeGreaterThanOrEqual(4.5)
    })
  })
})
