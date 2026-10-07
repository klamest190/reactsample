/**
 * Part 8 (Spring Boot & Docker) without a browser:
 *   1. the Spring runtime itself (src/spring/selftest.ts): does it answer like real Spring Boot?
 *   2. the Docker simulator (src/docker/selftest.ts)
 *   3. every example and exercise of the chapters in src/course/backend/ and src/course/exercises/backend.ts
 * The same checks run in the browser in `npm run e2e:content`.
 */
import { describe, expect, it } from 'vitest'

import { springRuntimeCheck } from '../spring/selftest'
import { dockerRuntimeCheck } from '../docker/selftest'
import { springExampleCheck } from '../spring/contents'
import { dockerExampleCheck } from '../docker/contents'
import { uebungen } from '../course/exercises/backend'
import type { CodeBeispiel } from '../learning/jsSandbox'
import { tryItUsages } from './tryItUsages'

const chapterSources = import.meta.glob<string>(['../course/backend/*.tsx', '!../course/backend/*.en.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const codeModules = import.meta.glob<{ beispiele?: Record<string, CodeBeispiel> }>('../course/backend/*.code.ts', { eager: true })

const usages = tryItUsages(Object.values(chapterSources))

type Case = { id: string; example: CodeBeispiel; mode: string | undefined; file: string }

/** Runs an example on the runtime its editor mode stands for. */
function check({ id, example, mode }: Case) {
  if (mode === 'spring') return springExampleCheck(id, example)
  if (mode === 'dockerfile' || mode === 'compose') return dockerExampleCheck(id, example, mode)
  return { ok: false, message: mode ? `mode ${mode} is not a backend mode` : 'is not used in any chapter' }
}

const chapterCases: Case[] = Object.entries(codeModules).flatMap(([path, module]) =>
  Object.entries(module.beispiele ?? {}).map(([id, example]) => ({ id, example, mode: usages.get(id)?.modus, file: path.split('/').pop()! })),
)
// Predictions are multiple choice - nothing to run.
const exerciseCases: Case[] = Object.values(uebungen).flatMap((list) =>
  list.filter((u) => u.stufe !== 'vorhersage').map((u) => ({ id: u.id, example: u, mode: u.modus, file: 'uebungen/backend.ts' })),
)

it('finds the chapters', () => {
  expect(Object.keys(chapterSources).length).toBeGreaterThan(0)
  expect(chapterCases.length).toBeGreaterThan(0)
})

describe('Spring runtime', () => {
  it.each(springRuntimeCheck())('$name', ({ ok, message }) => {
    expect(ok, message).toBe(true)
  })
})

describe('Docker simulator', () => {
  it.each(dockerRuntimeCheck())('$name', ({ ok, message }) => {
    expect(ok, message).toBe(true)
  })
})

describe.each([
  ['chapter contents', chapterCases],
  ['extra exercises', exerciseCases],
])('%s', (_, cases) => {
  it.each(cases)('$id ($file)', (c) => {
    const result = check(c)
    expect(result.ok, result.message).toBe(true)
  })
})
