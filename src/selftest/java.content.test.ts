/**
 * Part 7 (Java) without a browser:
 *   1. the runtime itself (src/java/selftest.ts): does our Java do what real Java would?
 *   2. every example and exercise of the chapters in src/course/java/: does each example run, does
 *      each solution pass its tests - and does the starter code fail them?
 * The same checks run in the browser in `npm run e2e:content`.
 */
import { describe, expect, it } from 'vitest'

import { javaLaufzeitPruefen } from '../java/selftest'
import { javaBeispielPruefen } from '../java/contents'
import { uebungen } from '../course/exercises/java'
import type { CodeBeispiel } from '../learning/jsSandbox'
import { tryItUsages } from './tryItUsages'

const chapterSources = import.meta.glob<string>(['../course/java/*.tsx', '!../course/java/*.en.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const codeModules = import.meta.glob<{ beispiele?: Record<string, CodeBeispiel> }>('../course/java/*.code.ts', { eager: true })

const usages = tryItUsages(Object.values(chapterSources))
const examples = Object.entries(codeModules).flatMap(([path, module]) =>
  Object.entries(module.beispiele ?? {}).map(([id, example]) => ({ id, example, file: path.split('/').pop()! })),
)

it('finds the chapters', () => {
  expect(Object.keys(chapterSources).length).toBeGreaterThan(0)
  expect(examples.length).toBeGreaterThan(0)
})

describe('runtime', () => {
  it.each(javaLaufzeitPruefen())('$name', ({ ok, message }) => {
    expect(ok, message).toBe(true)
  })
})

describe('chapter contents', () => {
  it.each(examples)('$id ($file) is used in a chapter', ({ id }) => {
    expect(usages.has(id), `${id} is not used in any chapter`).toBe(true)
  })

  // Chapter 7.10 shows the same task in Java, JavaScript and React - only the Java part is checked here,
  // the others run in the browser self-test.
  const javaExamples = examples.filter(({ id }) => usages.get(id)?.modus === 'java')
  it.each(javaExamples)('$id ($file)', ({ id, example }) => {
    const result = javaBeispielPruefen(id, example)
    expect(result.ok, result.message).toBe(true)
  })
})

describe('extra exercises', () => {
  // Predictions are multiple choice - nothing to run.
  const runnable = Object.values(uebungen).flatMap((list) => list.filter((u) => u.stufe !== 'vorhersage'))
  it.each(runnable)('$id', (exercise) => {
    const result = javaBeispielPruefen(exercise.id, exercise)
    expect(result.ok, result.message).toBe(true)
  })
})
