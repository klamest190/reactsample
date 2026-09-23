import { useEffect, useState } from 'react'
import type { Typfehler } from './typpruefung'

/**
 * Red squiggles under whole lines - for checks that know the line of a problem but not
 * its column (Java, Spring, Dockerfile, Compose). The squiggle starts at the first
 * character of the line, so indentation stays unmarked.
 */
export function lineMarkers(code: string, messages: { zeile: number; text: string }[]): Typfehler[] {
  const lines = code.split('\n')
  return messages.map(({ zeile, text }) => {
    const line = lines[zeile - 1] ?? ''
    return { zeile, spalte: line.length - line.trimStart().length, laenge: line.trim().length || 1, text, code: 0 }
  })
}

/**
 * Checks the input shortly after the last key press - like the squiggles in an IDE.
 *
 * `check` may be synchronous or return a promise; `null` switches the check off. Until
 * a new result is in, the last one stays - otherwise the markers would flicker while
 * typing. A result that arrives after the input has changed again is dropped.
 * `check` is a dependency: keep it stable (module level, useCallback, useMemo).
 */
export function useDelayedCheck<I, T>(input: I, check: ((input: I) => T | Promise<T>) | null, delayMs = 700): T | null {
  const [result, setResult] = useState<T | null>(null)
  useEffect(() => {
    if (!check) return
    let current = true
    const timer = setTimeout(() => {
      void Promise.resolve(check(input)).then((value) => {
        if (current) setResult(() => value)
      })
    }, delayMs)
    return () => {
      current = false
      clearTimeout(timer)
    }
  }, [input, check, delayMs])
  return result
}
