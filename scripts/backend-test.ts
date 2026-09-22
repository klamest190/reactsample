/**
 * Checks part 8 (Spring Boot & Docker) on the command line:
 *
 *   npm run test:backend
 *
 *   1. the Spring runtime itself (src/spring/selftest.ts): does it answer like
 *      real Spring Boot would?
 *   2. the Docker simulator (src/docker/selftest.ts)
 *   3. every example and exercise of the chapters in src/kurs/backend/ and the
 *      extra exercises in src/kurs/uebungen/backend.ts
 *
 * The same checks also run in `npm run test:inhalte` in the browser; this
 * script is the fast way without a browser - like `npm run test:java`.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { springRuntimeCheck } from '../src/spring/selftest'
import { dockerRuntimeCheck } from '../src/docker/selftest'
import { SPRING_EXPECTED_FAILURES, springExampleCheck } from '../src/spring/contents'
import { DOCKER_EXPECTED_FAILURES, dockerExampleCheck } from '../src/docker/contents'
import type { CodeBeispiel } from '../src/lernen/jsSandbox'

const folder = join(import.meta.dirname, '..', 'src', 'kurs', 'backend')

let failed = 0
const report = (ok: boolean, name: string, message = '') => {
  if (!ok) failed++
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : '\n    → ' + message.replace(/\n/g, '\n      ')}`)
}

console.log('── Spring runtime ' + '─'.repeat(44))
for (const r of springRuntimeCheck()) report(r.ok, r.name, r.message)

console.log('\n── Docker simulator ' + '─'.repeat(42))
for (const r of dockerRuntimeCheck()) report(r.ok, r.name, r.message)

/** Which mode an example runs in - read from `modus="…"` of its <TryIt>, like the browser self-test does. */
const modes = new Map<string, string>()
for (const file of readdirSync(folder).filter((f) => f.endsWith('.tsx') && !f.endsWith('.en.tsx'))) {
  const source = readFileSync(join(folder, file), 'utf8')
  for (const piece of source.split('<TryIt').slice(1)) {
    const end = Math.min(...['aufgabe=', '/>'].map((s) => piece.indexOf(s)).filter((i) => i >= 0))
    const props = piece.slice(0, end)
    const id = props.match(/id="([^"]+)"/)?.[1]
    if (id) modes.set(id, props.match(/modus="(\w+)"/)?.[1] ?? 'js')
  }
}

function check(id: string, example: CodeBeispiel, mode: string | undefined, where: string) {
  if (mode === 'spring') {
    const r = springExampleCheck(id, example)
    report(r.ok, `${id}  (${where})`, r.message)
  } else if (mode === 'dockerfile' || mode === 'compose') {
    const r = dockerExampleCheck(id, example, mode)
    report(r.ok, `${id}  (${where})`, r.message)
  } else if (mode) {
    console.log(`· ${id}  (${where}, ${mode} - see test:inhalte)`)
  } else {
    report(false, `${id}  (${where})`, 'is not used in any chapter')
  }
}

console.log('\n── Chapter contents ' + '─'.repeat(42))
for (const file of readdirSync(folder).filter((f) => f.endsWith('.code.ts'))) {
  const module = (await import(join(folder, file))) as { beispiele?: Record<string, CodeBeispiel> }
  for (const [id, example] of Object.entries(module.beispiele ?? {})) check(id, example, modes.get(id), file)
}

console.log('\n── Extra exercises ' + '─'.repeat(43))
const { uebungen } = (await import('../src/kurs/uebungen/backend')) as typeof import('../src/kurs/uebungen/backend')
for (const list of Object.values(uebungen)) {
  for (const exercise of list) {
    if (exercise.stufe === 'vorhersage') continue // multiple choice, nothing to run
    check(exercise.id, exercise, exercise.modus, 'uebungen/backend.ts')
  }
}

console.log(`\n${failed ? '✗' : '✓'} ${failed} failed`)
const expected = Object.keys(SPRING_EXPECTED_FAILURES).length + Object.keys(DOCKER_EXPECTED_FAILURES).length
if (expected) console.log(`(${expected} example(s) fail on purpose)`)
if (failed) process.exitCode = 1
