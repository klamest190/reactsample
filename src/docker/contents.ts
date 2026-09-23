/**
 * Checks the Dockerfile and compose examples of the chapters:
 *
 *   example without tests   builds (or starts) without errors
 *   exercise with tests     the solution passes all tests, the start code does NOT
 *
 * No DOM, no React - used by the browser self-test and by `npm run test:backend`.
 */

import type { CodeBeispiel, DockerTest } from '../lernen/jsSandbox'
import { simulateBuild } from './build'
import { composeUp } from './compose'
import { localized } from '../i18n/localized'
import { contentResult, type ContentResult } from '../selbsttest/results'

/** Examples that fail on purpose - with the reason. */
export const DOCKER_EXPECTED_FAILURES: Record<string, string> = {
  'docker-compose-localhost': 'shows the classic localhost mistake',
}


export function dockerExampleCheck(id: string, example: CodeBeispiel, mode: 'dockerfile' | 'compose'): ContentResult {
  const result = contentResult(id)
  const tests = example.tests as DockerTest[] | undefined
  const name = (t: DockerTest) => localized(t.name, 'de')

  const evaluate = (code: string) => {
    if (mode === 'dockerfile') {
      const build = simulateBuild(code, { project: example.project ?? 'spring', ignore: example.ignore, change: 'code' })
      return {
        error: build.first.error ? `line ${build.first.error.line}: ${build.first.error.message}` : null,
        failed: (tests ?? []).filter((t) => !safe(() => t.dockerfile?.(build))).map(name),
      }
    }
    const up = composeUp(code)
    const error = up.findings.find((f) => f.severity === 'error')
    return {
      error: error ? `line ${error.line}: ${error.en}` : !up.ok ? 'not all containers are running' : null,
      failed: (tests ?? []).filter((t) => !safe(() => t.compose?.(up))).map(name),
    }
  }

  if (tests?.length) {
    const solution = evaluate(example.loesung ?? example.code)
    if (solution.failed.length) return result(`solution fails: ${solution.failed.join(' · ')}${solution.error ? ` (${solution.error})` : ''}`)
    const start = evaluate(example.code)
    if (!start.failed.length) return result('the start code already passes all tests - nothing to practise')
    return result()
  }

  const expected = DOCKER_EXPECTED_FAILURES[id]
  const run = evaluate(example.code)
  if (run.error && !expected) return result(run.error)
  if (!run.error && expected) return result(`should fail (${expected}), but works`)
  if (example.loesung) {
    const solution = evaluate(example.loesung)
    if (solution.error) return result('solution: ' + solution.error)
  }
  return result()
}

function safe(check: () => boolean | undefined): boolean {
  try {
    return Boolean(check())
  } catch {
    return false
  }
}
