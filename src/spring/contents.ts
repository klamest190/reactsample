/**
 * Checks the Spring examples of the chapters - with the same rules the
 * self-test applies to all other parts:
 *
 *   example without tests   the application starts, and every request with an
 *                           expectation (`→ 200 …`) gets exactly that answer
 *   exercise with tests     the solution passes all tests, the start code does NOT
 *
 * No DOM, no React - used by the browser self-test and by `npm run test:backend`.
 */

import type { CodeBeispiel, SpringTestSpec } from '../lernen/jsSandbox'
import { parseHttp, requestText } from './http'
import { springRun } from './index'
import { localized } from '../i18n/localized'
import { contentResult, type ContentResult } from '../selbsttest/results'

/** Examples that fail on purpose - with the reason. */
export const SPRING_EXPECTED_FAILURES: Record<string, string> = {
  'spring-beans-fehlt': 'shows the report for a missing bean',
  'spring-beans-zwei': 'shows the report for two candidates',
  'spring-beans-kreis': 'shows the report for a dependency cycle',
}


const asTests = (tests: SpringTestSpec[]) => tests.map((t) => ({ ...t, name: localized(t.name, 'de') }))

export function springExampleCheck(id: string, example: CodeBeispiel): ContentResult {
  const result = contentResult(id)
  const tests = example.tests as SpringTestSpec[] | undefined
  const options = { language: 'de' as const, properties: example.properties, requests: example.requests }

  if (tests?.length) {
    const solution = springRun(example.loesung ?? example.code, { ...options, tests: asTests(tests) })
    const failed = (solution.results ?? []).filter((r) => !r.ok)
    if (failed.length) return result('solution fails: ' + failed.map((r) => `“${r.name}” ${r.message}`).join(' · '))
    const start = springRun(example.code, { ...options, tests: asTests(tests) })
    if ((start.results ?? []).every((r) => r.ok)) return result('the start code already passes all tests - nothing to practise')
    return result()
  }

  const expected = SPRING_EXPECTED_FAILURES[id]
  for (const [what, code] of [['example', example.code], ...(example.loesung ? [['solution', example.loesung]] : [])] as const) {
    const run = springRun(code, options)
    if (run.failed && !expected) {
      const errors = run.lines.filter((l) => l.typ === 'fehler' || l.typ === 'error').map((l) => l.text)
      return result(`${what} does not start: ${errors.join(' | ')}`)
    }
    if (!run.failed && expected && what === 'example') return result(`should fail (${expected}), but starts`)
    for (const exchange of run.exchanges) {
      if (exchange.mismatch) return result(`${what}: ${requestText(exchange.request)} → ${exchange.mismatch.de}`)
    }
  }
  // Requests of an example must be well-formed - a typo would silently send nothing.
  if (example.requests && !parseHttp(example.requests).length) return result('`requests` contains no request')
  return result()
}
