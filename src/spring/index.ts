/**
 * SPRING PART · The only door to the outside
 *
 * The app knows exactly these functions from `src/spring/`:
 *
 *   springStart(source, { language, properties })       → a running server (or why it did not start)
 *   springRun(source, { …, requests, tests })            → start + requests + tests, for examples and exercises
 *   springCheck(source, language)                         → red squiggles while typing
 *
 * `src/spring/` builds on the Java runtime (`src/java/`) and plugs its classes
 * in as an extension. It knows nothing about React - just like `src/java/`.
 *
 * What this is NOT: real Spring. There is no Tomcat, no network, no database.
 * Requests are method calls inside the browser tab, the "database" is a list
 * in memory. What IS real: the rules - which bean gets injected, which method
 * answers which URL, which status code comes back and why.
 */

import { alsJs, tiefGleich, zeigen } from '../java'
import { JavaAbbruch, JavaAusnahme, Umgebung } from '../java/interpreter'
import { JavaSyntaxFehler } from '../java/lexer'
import { parsen } from '../java/parser'
import { pruefen } from '../java/pruefer'
import { find } from './annotations'
import { SpringApp, StartupFailure, type BeanInfo, type Language, type OutputLine } from './context'
import { check, parseHttp, requestText, type HttpRequest, type HttpResponse, type Mismatch } from './http'
import { springLibrary } from './library'
import { MappingError, Web, type RouteInfo } from './web'

export type { BeanInfo, Language, OutputLine, HttpRequest, HttpResponse, RouteInfo }
export { parseHttp, requestText } from './http'
export { formatJson } from './json'

export type SpringTest = {
  name: string
  /** Requests in `.http` notation, each optionally followed by `→ status body`. */
  http?: string
  /** A Java expression checked afterwards; `context` (the ApplicationContext) and `output` are available. */
  ausdruck?: string
  erwartet?: unknown
}

export type Exchange = { request: HttpRequest; response: HttpResponse; mismatch: Mismatch | null }
export type TestResult = { name: string; ok: boolean; message: string }

export type SpringRun = {
  lines: OutputLine[]
  exchanges: Exchange[]
  results: TestResult[] | null
  /** true if the application did not start (compile error, startup failure, crash in main). */
  failed: boolean
  server: SpringServer | null
}

type Options = { language?: Language; properties?: string }

const TEXTS = {
  de: {
    compileErrors: (n: number) => `${n} Fehler - das Programm wurde nicht gestartet.`,
    notStarted: 'main hat SpringApplication.run(…) nicht aufgerufen - es läuft kein Server, Anfragen gehen ins Leere.',
    noServer: 'Die Anwendung ist nicht gestartet - die Tests konnten nicht geprüft werden.',
    testFailed: (expected: string, got: string) => `erwartet: ${expected}, bekommen: ${got}`,
    testCrashed: (message: string) => `Fehler beim Prüfen: ${message}`,
  },
  en: {
    compileErrors: (n: number) => `${n} error(s) - the program was not started.`,
    notStarted: 'main did not call SpringApplication.run(…) - no server is running, requests go nowhere.',
    noServer: 'The application did not start - the tests could not be checked.',
    testFailed: (expected: string, got: string) => `expected: ${expected}, got: ${got}`,
    testCrashed: (message: string) => `error while checking: ${message}`,
  },
}

/** A started application. Every `send` is one HTTP request against it. */
export class SpringServer {
  readonly app: SpringApp
  private readonly web: Web

  constructor(app: SpringApp, web: Web) {
    this.app = app
    this.web = web
  }

  get port() {
    return this.app.port
  }

  send(request: HttpRequest): { response: HttpResponse; lines: OutputLine[] } {
    const before = this.app.lines.length
    let response: HttpResponse
    try {
      response = this.web.handle(request)
    } catch (error) {
      // A bug in this runtime must never take the page down - report it like a server error.
      this.app.print(String(error instanceof Error ? error.message : error), 'fehler')
      response = { status: 500, headers: {}, body: { kind: 'text', text: 'Internal Server Error' }, millis: 1 }
    }
    return { response, lines: this.app.lines.slice(before) }
  }

  beans(): BeanInfo[] {
    return this.app.beans()
  }

  routes(): RouteInfo[] {
    return this.web.routeInfos()
  }
}

/** Only check, don't run - for the red squiggles, like an IDE does while typing. */
export function springCheck(source: string, language: Language = 'de'): { zeile: number; text: string }[] {
  try {
    const classes = springLibrary(dummyHost).classes
    return pruefen(parsen(source), classes).map((m) => ({ zeile: m.zeile, text: language === 'de' ? m.deutsch : m.englisch }))
  } catch (error) {
    if (error instanceof JavaSyntaxFehler) return [{ zeile: error.zeile, text: error.meldung }]
    return []
  }
}

/** Compiles and starts the application - like `mvn spring-boot:run`. */
export function springStart(source: string, options: Options = {}): { lines: OutputLine[]; failed: boolean; server: SpringServer | null } {
  const language = options.language ?? 'de'
  const t = TEXTS[language]
  const lines: OutputLine[] = []

  // --- 1. Read -----------------------------------------------------------------------
  let program
  try {
    program = parsen(source)
  } catch (error) {
    if (error instanceof JavaSyntaxFehler) return { lines: [{ typ: 'fehler', text: `Main.java:${error.zeile}: error: ${error.meldung}` }], failed: true, server: null }
    throw error
  }

  // --- 2. Compile ----------------------------------------------------------------------
  const messages = pruefen(program, springLibrary(dummyHost).classes)
  if (messages.length) {
    for (const m of messages) {
      lines.push({ typ: 'fehler', text: `Main.java:${m.zeile}: error: ${m.englisch}` })
      if (language === 'de') lines.push({ typ: 'info', text: '   ' + m.deutsch })
    }
    lines.push({ typ: 'warn', text: t.compileErrors(messages.length) })
    return { lines, failed: true, server: null }
  }

  // --- 3. Start ------------------------------------------------------------------------
  let app: SpringApp
  try {
    app = new SpringApp(program, options.properties ?? '', language)
  } catch (error) {
    return { lines: [{ typ: 'fehler', text: errorText(error, language) }], failed: true, server: null }
  }
  const web = new Web(app)
  app.onStarted = () => {
    try {
      web.build()
    } catch (error) {
      if (!(error instanceof MappingError)) throw error
      throw new StartupFailure(
        `Error creating bean with name 'requestMappingHandlerMapping': ${error.message}`,
        null,
        {
          de: 'Zwei Methoden beantworten dieselbe Kombination aus HTTP-Methode und Pfad. Jede Route darf es nur einmal geben.',
          en: 'Two methods answer the same combination of HTTP method and path. Every route may exist only once.',
        },
        error.line,
      )
    }
  }

  const mainClass = [...app.interpreter.klassen.values()].find((k) => (k.methoden.get('main') ?? []).some((m) => m.statisch))
  let failed = false
  try {
    if (mainClass) {
      app.interpreter.starten()
    } else {
      // Short examples may leave out main - then we start the application ourselves.
      const application = [...app.interpreter.klassen.values()].find((k) => find(k.dekl.annotations, 'SpringBootApplication'))
      app.run(application?.name, 1)
    }
  } catch (error) {
    failed = true
    app.interpreter.abschliessen()
    if (error instanceof StartupFailure) reportFailure(app, error, language)
    else if (error instanceof JavaAusnahme) {
      app.print(`Exception in thread "main" ${app.interpreter.ausnahmeText(error.wert)}`, 'fehler')
      if (error.zeile) app.print(`   at Main.java:${error.zeile}`, 'info')
    } else app.print(errorText(error, language), 'fehler')
  }
  app.interpreter.abschliessen()
  app.flushOutput()

  if (!failed && !app.started) {
    app.print(t.notStarted, 'warn')
    return { lines: app.lines, failed: false, server: null }
  }
  return { lines: app.lines, failed, server: failed ? null : new SpringServer(app, web) }
}

/**
 * Start, send the example's requests, run the tests - for examples, exercises and
 * the self-test. Every test gets a FRESH application, so tests cannot influence each other.
 */
export function springRun(
  source: string,
  options: Options & { requests?: string; tests?: SpringTest[] } = {},
): SpringRun {
  const language = options.language ?? 'de'
  const started = springStart(source, options)
  const exchanges: Exchange[] = []
  if (started.server && options.requests) {
    for (const step of parseHttp(options.requests)) {
      const { response } = started.server.send(step.request)
      exchanges.push({ request: step.request, response, mismatch: step.expectation ? check(response, step.expectation) : null })
    }
  }
  const lines = started.server ? started.server.app.lines : started.lines
  const results = options.tests?.length ? options.tests.map((test) => runTest(source, test, options, language)) : null
  return { lines, exchanges, results, failed: started.failed, server: started.server }
}

function runTest(source: string, test: SpringTest, options: Options, language: Language): TestResult {
  const t = TEXTS[language]
  const result = (message = ''): TestResult => ({ name: test.name, ok: !message, message })
  let started
  try {
    started = springStart(source, options)
  } catch (error) {
    return result(t.testCrashed(errorText(error, language)))
  }
  const server = started.server
  if (!server) return result(t.noServer)

  for (const step of parseHttp(test.http ?? '')) {
    const { response } = server.send(step.request)
    if (!step.expectation) continue
    const mismatch = check(response, step.expectation)
    if (mismatch) return result(`${requestText(step.request)} → ${mismatch[language]}`)
  }

  if (test.ausdruck) {
    const i = server.app.interpreter
    try {
      i.hauptUmgebung ??= new Umgebung()
      i.hauptUmgebung.deklarieren('context', server.app.contextValue, { name: 'ApplicationContext', dimensionen: 0, argumente: [] })
      const output = server.app.lines.filter((l) => l.typ === 'log').map((l) => l.text).join('\n')
      i.hauptUmgebung.deklarieren('output', { art: 'string', wert: output }, { name: 'String', dimensionen: 0, argumente: [] })
      i.resetStepLimit()
      const value = alsJs(i.ausdruckAuswerten(test.ausdruck), i)
      const expected = test.erwartet === undefined ? true : test.erwartet
      if (!tiefGleich(value, expected)) return result(t.testFailed(zeigen(expected), zeigen(value)))
    } catch (error) {
      const text = error instanceof JavaAusnahme ? i.ausnahmeText(error.wert) : errorText(error, language)
      return result(t.testCrashed(text))
    }
  }
  return result()
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Spring Boot's failure report: the analysis block, or "Application run failed". */
function reportFailure(app: SpringApp, failure: StartupFailure, language: Language) {
  app.log('WARN', 'AnnotationConfigServletWebServerApplicationContext', 'Exception encountered during context initialization - cancelling refresh attempt')
  if (failure.action) {
    app.print('', 'error')
    app.print('***************************', 'error')
    app.print('APPLICATION FAILED TO START', 'error')
    app.print('***************************', 'error')
    app.print('', 'error')
    app.print('Description:', 'error')
    app.print('', 'error')
    for (const line of failure.description.split('\n')) app.print(line, 'error')
    app.print('', 'error')
    app.print('Action:', 'error')
    app.print('', 'error')
    app.print(failure.action, 'error')
  } else {
    app.log('ERROR', 'SpringApplication', 'Application run failed')
    for (const line of failure.description.split('\n')) app.print(line, 'fehler')
  }
  app.print('', 'info')
  app.print(`💡 ${failure.hint[language]}${failure.line ? ` (Main.java:${failure.line})` : ''}`, 'info')
}

function errorText(error: unknown, language: Language): string {
  if (error instanceof JavaAbbruch) {
    const text = language === 'de' ? error.deutsch : error.englisch
    return error.zeile ? `Main.java:${error.zeile}: error: ${text}` : text
  }
  if (error instanceof JavaSyntaxFehler) return `Main.java:${error.zeile}: error: ${error.meldung}`
  if (error instanceof RangeError) {
    return language === 'de' ? 'StackOverflowError: Eine Methode ruft sich endlos selbst auf.' : 'StackOverflowError: a method calls itself endlessly.'
  }
  return String(error instanceof Error ? error.message : error)
}

/** Only for the list of class names - these calls never happen. */
const dummyHost = {
  run: () => ({ art: 'null' as const }),
  getBean: () => ({ art: 'null' as const }),
  beanNames: () => [],
  property: () => undefined,
  activeProfiles: () => [],
  repositoryCall: () => undefined,
}

