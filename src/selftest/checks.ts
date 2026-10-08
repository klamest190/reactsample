import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import type { CodeExample, ReactTest, SandboxMessage, Test, TestResult } from '../learning/jsSandbox'
import { sandboxDocument } from '../learning/jsSandbox'
import { formatieren, compile, compileProject, type ProjectFile } from '../learning/reactCompile'
import { runReactTests } from '../learning/reactTestKit'
import { runTests } from '../learning/testRunner'
import { checkTypes } from '../learning/typeCheck'
import { checkTsTypes, transpileTs } from '../learning/tsRunner'
import type { Zweisprachig } from '../i18n/LanguageContext'
import { JAVA_EXPECTED_FAILURES, checkJavaExample } from '../java/contents'
import { SPRING_EXPECTED_FAILURES, springExampleCheck } from '../spring/contents'
import { DOCKER_EXPECTED_FAILURES, dockerExampleCheck } from '../docker/contents'
import { SQL_EXPECTED_FAILURES, sqlExampleCheck } from '../sql/check'
import { runSql } from '../sql/client'
import type { Mode as EditorModus } from '../learning/modes'
import { localized } from '../i18n/localized'

/**
 * Selbsttest der Kursinhalte: führt jedes Beispiel, jede Übung und jeden Projektschritt
 * mit denselben Funktionen aus wie die Editoren der App.
 *
 *   Beispiel ohne Lösung   läuft ohne Fehler (React: kein Absturz beim Rendern)
 *   Übung mit Tests        Musterlösung besteht alle Tests, der Startcode NICHT alle
 *   TypeScript             Beispiele und Musterlösungen ohne Typfehler (TSX und reines TS mit Typ-Tests)
 *   Test-Modus             die Tests der Beispiele sind grün; bei Übungen erkennt die
 *                          Musterlösung alle kaputten Varianten, der Startcode nicht
 */

export type Mode = { mode: EditorModus; typed: boolean; preview: boolean }
export type Result = { id: string; location: string; ok: boolean; message: string; duration: number }

/**
 * Beispiele, die absichtlich einen Fehler zeigen - mit Begründung.
 * Die Java-Kapitel bringen ihre eigenen mit (siehe src/java/contents.ts).
 */
export const EXPECTED_FAILURES: Record<string, string> = {
  ...JAVA_EXPECTED_FAILURES,
  ...SPRING_EXPECTED_FAILURES,
  ...DOCKER_EXPECTED_FAILURES,
  ...SQL_EXPECTED_FAILURES,
  'ts-start-fehler': 'zeigt, dass ein Typfehler das Programm nicht aufhält',
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const nameOf = (n: string | Zweisprachig) => localized(n, 'de')

// ---------------------------------------------------------------------------
// Ausführen
// ---------------------------------------------------------------------------

let runNumber = 100_000

/** JavaScript im selben Sandbox-iframe wie TryIt. */
export function runJs(
  code: string,
  options: { tests?: Test[]; setup?: string } = {},
): Promise<{ error: string[]; results: TestResult[] | null }> {
  const runId = ++runNumber
  const withTests = Boolean(options.tests?.length)
  const iframe = document.createElement('iframe')
  iframe.setAttribute('sandbox', 'allow-scripts allow-forms')
  Object.assign(iframe.style, { position: 'fixed', left: '-10000px', width: '400px', height: '300px' })

  return new Promise((aufloesen) => {
    const error: string[] = []
    let results: TestResult[] | null = null
    let fertig = false
    const end = () => {
      if (fertig) return
      fertig = true
      window.removeEventListener('message', onMessage)
      clearTimeout(emergencyStop)
      iframe.remove()
      aufloesen({ error, results })
    }
    function onMessage(e: MessageEvent<SandboxMessage | undefined>) {
      const n = e.data
      if (e.source !== iframe.contentWindow || !n?.tryit || n.runId !== runId) return
      if (n.type === 'exception') {
        error.push(n.text)
        // Ein Fehler im Modul verhindert auch die Tests - kurz warten, dann aufhören.
        if (withTests) setTimeout(end, 300)
      } else if (n.type === 'tests') {
        results = n.results
        end()
      } else if (n.type === 'done' && !withTests) {
        // Asynchrone Fehler (Timer, Promises) kurz abwarten.
        setTimeout(end, 700)
      }
    }
    const emergencyStop = setTimeout(() => {
      if (withTests && !results) error.push('Zeitüberschreitung: keine Testergebnisse')
      end()
    }, 10_000)
    window.addEventListener('message', onMessage)
    iframe.srcdoc = sandboxDocument({
      runId,
      code,
      setup: options.setup,
      tests: options.tests?.map((t) => ({ ...t, name: nameOf(t.name) })),
      dark: false,
      language: 'de',
    })
    document.body.appendChild(iframe)
  })
}

/** Eine React-Komponente rendern und nicht abgefangene Fehler einsammeln. */
async function renderReact(App: Parameters<typeof createElement>[0], cleanup: () => void) {
  const error: string[] = []
  const element = document.createElement('div')
  element.className = 'preview'
  Object.assign(element.style, { position: 'fixed', left: '-10000px', width: '720px' })
  document.body.appendChild(element)
  const root = createRoot(element, { onUncaughtError: (f) => error.push(formatieren(f)) })
  try {
    flushSync(() => root.render(createElement(App)))
    await wait(400)
  } catch (f) {
    error.push(formatieren(f))
  }
  root.unmount()
  element.remove()
  cleanup()
  return error
}

async function reactExample(code: string) {
  try {
    const { App, aufraeumen: cleanup } = await compile(code, () => {}, 'de')
    return await renderReact(App, cleanup)
  } catch (f) {
    return [formatieren(f)]
  }
}

export async function renderProject(files: ProjectFile[], entry: string) {
  try {
    const { App, aufraeumen: cleanup } = await compileProject(files, entry, () => {}, 'de')
    return await renderReact(App, cleanup)
  } catch (f) {
    return [formatieren(f)]
  }
}

// ---------------------------------------------------------------------------
// Prüfen
// ---------------------------------------------------------------------------

const allOk = (e: TestResult[] | null) => Boolean(e?.length) && e!.every((x) => x.ok)
const firstError = (e: TestResult[] | null, error: string[] = []) =>
  error[0] ?? e?.find((x) => !x.ok)?.name + ': ' + e?.find((x) => !x.ok)?.message

/** Musterlösung grün, Startcode rot - für JS-, React- und Java-Übungen. */
async function checkExercise(
  mode: 'js' | 'react' | 'java',
  start: string,
  solution: string,
  tests: Test[] | ReactTest[],
  setup?: string,
): Promise<string | null> {
  // Java prüft sich selbst - die Laufzeit in src/java/ braucht weder DOM noch iframe.
  if (mode === 'java') {
    const result = checkJavaExample('', { code: start, solution, tests: tests as Test[], setup })
    return result.ok ? null : result.message
  }
  if (mode === 'react') {
    const withSolution = await runReactTests(solution, tests as ReactTest[], 'de')
    if (!allOk(withSolution)) return 'Musterlösung besteht nicht: ' + firstError(withSolution)
    if (start !== solution) {
      const withStart = await runReactTests(start, tests as ReactTest[], 'de')
      if (allOk(withStart)) return 'Startcode besteht schon alle Tests'
    }
    return null
  }
  const withSolution = await runJs(solution, { tests: tests as Test[], setup })
  if (!allOk(withSolution.results)) return 'Musterlösung besteht nicht: ' + firstError(withSolution.results, withSolution.error)
  if (start !== solution) {
    const withStart = await runJs(start, { tests: tests as Test[], setup })
    if (allOk(withStart.results) && withStart.error.length === 0) return 'Startcode besteht schon alle Tests'
  }
  return null
}

/**
 * Reines TypeScript (Teil 2): Lösung bzw. Beispiel ohne Typfehler, Typ-Tests grün, läuft ohne Fehler
 * und besteht die Tests. Der Startcode einer Übung muss an irgendetwas davon scheitern.
 */
async function checkTs(b: CodeExample): Promise<string | null> {
  const typeTests = b.typeTests ?? []
  const tests = b.tests as Test[] | undefined

  async function pass(code: string) {
    const types = await checkTsTypes(code, typeTests)
    const typeError = types.inCode[0] ? `Typfehler in Zeile ${types.inCode[0].line}: ${types.inCode[0].text}` : null
    const testTypeErrors = types.perTest.findIndex((f) => f.length > 0)
    const compiled = await transpileTs(code)
    if ('error' in compiled) return { message: 'nicht übersetzbar: ' + compiled.error }
    const run = await runJs(compiled.code, { tests, setup: b.setup })
    const message =
      typeError ??
      (testTypeErrors >= 0 ? `Typ-Test „${nameOf(typeTests[testTypeErrors].name)}“: ${types.perTest[testTypeErrors][0].text}` : null) ??
      (tests?.length ? (allOk(run.results) ? null : firstError(run.results, run.error)) : (run.error[0] ?? null))
    return { message }
  }

  const target = await pass(b.solution ?? b.code)
  if (target.message) return `${b.solution ? 'Musterlösung' : 'Beispiel'}: ${target.message}`
  if (b.solution && b.solution !== b.code && (tests?.length || typeTests.length)) {
    const start = await pass(b.code)
    if (!start.message) return 'Startcode besteht schon alles (Typen, Typ-Tests und Tests)'
  }
  return null
}

/** Eigene Tests (Test-Modus): grün mit der richtigen Komponente, jede Variante wird erkannt. */
async function checkTestMode(
  code: string,
  files: ProjectFile[] = [],
  variants: { files: ProjectFile[] }[] = [],
): Promise<{ passed: boolean; detected: number; message: string }> {
  const own = { pfad: 'App.test.jsx', code }
  const report = await runTests([...files, own], 'App.test.jsx', 'de')
  const passed = !report.error && report.cases.length > 0 && report.cases.every((f) => f.ok)
  const message = report.error ?? report.cases.filter((f) => !f.ok).map((f) => f.name + ': ' + f.message)[0] ?? ''
  let detected = 0
  for (const v of variants) {
    const b = await runTests([...v.files, own], 'App.test.jsx', 'de')
    if (b.error || b.cases.some((f) => !f.ok)) detected++
  }
  return { passed, detected, message }
}

/** Ein Beispiel aus einer *.code.ts-Datei - Art ergibt sich aus der Verwendung im Kapitel. */
export async function checkExample(
  b: CodeExample,
  m: Mode,
  extra: { files?: ProjectFile[]; variants?: { files: ProjectFile[] }[]; id?: string } = {},
): Promise<string | null> {
  if (m.mode === 'java') {
    const result = checkJavaExample('', b)
    return result.ok ? null : result.message
  }
  // Part 8 checks itself as well - Spring runtime and Docker simulator need no DOM.
  if (m.mode === 'spring') {
    const result = springExampleCheck(extra.id ?? '', b)
    return result.ok ? null : result.message
  }
  if (m.mode === 'dockerfile' || m.mode === 'compose') {
    const result = dockerExampleCheck(extra.id ?? '', b, m.mode)
    return result.ok ? null : result.message
  }

  // Part 9: real PostgreSQL in the same worker the editors use.
  if (m.mode === 'sql') {
    const result = await sqlExampleCheck(extra.id ?? '', b, runSql)
    return result.ok ? null : result.message
  }

  if (m.mode === 'ts') return checkTs(b)

  if (m.mode === 'test') {
    if (extra.variants?.length && b.solution) {
      const withSolution = await checkTestMode(b.solution, extra.files, extra.variants)
      if (!withSolution.passed) return 'Musterlösung-Tests nicht grün: ' + withSolution.message
      if (withSolution.detected < extra.variants.length) return `Musterlösung erkennt nur ${withSolution.detected}/${extra.variants.length} Varianten`
      const withStart = await checkTestMode(b.code, extra.files, extra.variants)
      if (withStart.passed && withStart.detected === extra.variants.length) return 'Startcode erkennt schon alle Varianten'
      return null
    }
    const r = await checkTestMode(b.code, extra.files)
    return r.passed ? null : 'Tests nicht grün: ' + r.message
  }

  if (m.typed) {
    const target = b.solution ?? b.code
    const error = await checkTypes(target)
    if (error.length) return `${b.solution ? 'Musterlösung' : 'Beispiel'} hat Typfehler: Zeile ${error[0].line}: ${error[0].text}`
    if (b.solution && (await checkTypes(b.code)).length === 0 && b.tests?.length) {
      // Bei TS-Übungen ist „keine Typfehler“ ein Test - der Startcode muss welche haben.
      const withStart = await runReactTests(b.code, b.tests as ReactTest[], 'de')
      if (allOk(withStart)) return 'Startcode hat keine Typfehler und besteht alle Tests'
    }
  }

  if (b.solution && b.tests?.length) {
    // Bei TS-Übungen darf der Startcode alle Verhaltenstests bestehen - er scheitert an den Typen.
    const start = m.typed ? b.solution : b.code
    return checkExercise(m.mode as 'js' | 'react' | 'java', start, b.solution, b.tests as Test[] | ReactTest[], b.setup)
  }

  // Beispiel bzw. Übung ohne Tests: läuft ohne Fehler. Bei Übungen zählt nur die Lösung -
  // der Startcode darf unfertig sein.
  const code = b.solution ?? b.code
  const error = m.mode === 'react' ? await reactExample(code) : (await runJs(code, { setup: b.setup })).error
  return error[0] ?? null
}

export { checkExercise as uebungPruefen, checkTestMode as testModusPruefen, wait as warten }
