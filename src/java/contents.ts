/**
 * Prüft die Java-Beispiele der Kapitel - mit denselben Regeln, die der
 * Selbsttest schon für JavaScript und React anwendet:
 *
 *   Beispiel ohne Tests   muss ohne Fehler durchlaufen
 *   Übung mit Tests       die Musterlösung besteht alle Tests,
 *                         der Startcode besteht sie NICHT (sonst wäre nichts zu tun)
 *
 * Steht hier statt in src/selftest/, weil es weder DOM noch React braucht -
 * so kann es auch die Kommandozeile (src/selftest/java.content.test.ts) benutzen.
 */

import { runJava } from './index'
import type { CodeExample, Test } from '../learning/jsSandbox'
import { localized } from '../i18n/localized'
import { contentResult, type ContentResult } from '../selftest/results'

/** Beispiele, die absichtlich nicht laufen - mit Begründung. */
export const JAVA_EXPECTED_FAILURES: Record<string, string> = {
  'java-start-fehler': 'zeigt absichtlich einen Kompilierfehler (fehlendes Semikolon)',
  'java-variablen-fehler': 'zeigt absichtlich einen Typfehler',
  'java-arrays-npe': 'zeigt absichtlich eine NullPointerException',
  'java-fehler-ungefangen': 'zeigt absichtlich einen Absturz mit Stacktrace',
}

const toJavaTests = (tests: Test[]) =>
  tests.map((test) => ({
    name: localized(test.name, 'de'),
    expression: test.expression,
    expected: test.expected,
  }))

export function checkJavaExample(id: string, example: CodeExample): ContentResult {
  const ok = contentResult(id)
  const tests = example.tests as Test[] | undefined

  if (tests?.length) {
    const javaTests = toJavaTests(tests)
    const options = { language: 'de' as const, tests: javaTests, setup: example.setup }
    const solution = runJava(example.solution ?? example.code, options)
    const failed = (solution.results ?? []).filter((e) => !e.ok)
    if (failed.length) {
      return ok('Musterlösung scheitert: ' + failed.map((e) => `„${e.name}“ ${e.message}`).join(' · '))
    }
    const startCode = runJava(example.code, options)
    if ((startCode.results ?? []).every((e) => e.ok)) {
      return ok('Der Startcode besteht schon alle Tests - dann ist nichts zu üben.')
    }
    return ok()
  }

  const reason = JAVA_EXPECTED_FAILURES[id]
  for (const [what, code] of [
    ['Beispiel', example.code],
    ...(example.solution ? [['Musterlösung', example.solution] as const] : []),
  ] as const) {
    const run = runJava(code, { language: 'de', setup: example.setup })
    const error = run.lines.filter((z) => z.type === 'exception').map((z) => z.text)
    if (error.length && !reason) return ok(`${what}: ${error.join(' | ')}`)
    if (!error.length && reason && what === 'Beispiel') {
      return ok(`Sollte fehlschlagen (${reason}), läuft aber durch.`)
    }
  }
  return ok()
}
