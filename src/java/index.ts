/**
 * JAVA-TEIL · Die einzige Tür nach außen
 *
 * Die ganze App kennt von `src/java/` genau diese Funktion:
 *
 *   javaAusfuehren(quelltext, { sprache, tests })
 *     → { zeilen, ergebnisse, fehler }
 *
 * Alles andere in diesem Ordner ist Innenleben. Das ist die saubere Grenze
 * zwischen „Java“ und „React“: Die Laufzeit weiß nichts von Komponenten,
 * die Komponenten wissen nichts von Syntaxbäumen.
 */

import { JavaSyntaxError } from './lexer'
import { parse } from './parser'
import { checkProgram } from './typeChecker'
import { Interpreter, JavaAbort, JavaException, type OutputLine } from './interpreter'
import { toNumber, doubleText, type Value } from './values'

export type JavaLanguage = 'de' | 'en'

export type JavaTest = {
  name: string
  /** Ein Java-Ausdruck, der nach `main` ausgewertet wird - z. B. `add(2, 3)`. */
  expression: string
  /** Erwartetes Ergebnis. Fehlt es, muss der Ausdruck `true` ergeben. */
  expected?: unknown
}

export type JavaTestResult = { name: string; ok: boolean; message: string }

export type JavaLine = { type: 'log' | 'info' | 'warn' | 'error' | 'exception'; text: string }

export type JavaRun = {
  lines: JavaLine[]
  results: JavaTestResult[] | null
  /** true, wenn das Programm nicht (vollständig) gelaufen ist. */
  failed: boolean
}

const MESSAGES = {
  de: {
    compileErrors: (count: number) => `${count} Fehler - das Programm wurde nicht gestartet.`,
    line: (n: number) => `Zeile ${n}`,
    exception: 'Das Programm wurde durch eine Exception beendet:',
    testFailure: (expected: string, actual: string) => `erwartet: ${expected}, bekommen: ${actual}`,
    testCrash: (message: string) => `Fehler beim Prüfen: ${message}`,
    noRun: 'Das Programm ist abgestürzt - die Tests konnten nicht geprüft werden.',
  },
  en: {
    compileErrors: (count: number) => `${count} error(s) - the program was not started.`,
    line: (n: number) => `line ${n}`,
    exception: 'The program was terminated by an exception:',
    testFailure: (expected: string, actual: string) => `expected: ${expected}, got: ${actual}`,
    testCrash: (message: string) => `error while checking: ${message}`,
    noRun: 'The program crashed - the tests could not be checked.',
  },
}

/**
 * Nur prüfen, nicht ausführen - für die roten Schlangenlinien im Editor.
 * Das ist genau das, was eine Java-IDE beim Tippen im Hintergrund tut.
 */
export function checkJava(sourceCode: string, language: JavaLanguage = 'de'): { line: number; text: string }[] {
  try {
    return checkProgram(parse(sourceCode)).map((m) => ({ line: m.line, text: language === 'de' ? m.de : m.en }))
  } catch (error) {
    if (error instanceof JavaSyntaxError) return [{ line: error.line, text: error.message }]
    return []
  }
}

/**
 * Führt ein Java-Programm aus. Läuft komplett synchron im Browser-Tab; der
 * Interpreter bricht selbst ab, wenn eine Schleife nicht endet.
 */
export function runJava(
  sourceCode: string,
  options: { language?: JavaLanguage; tests?: JavaTest[]; setup?: string } = {},
): JavaRun {
  const language = options.language ?? 'de'
  const t = MESSAGES[language]
  const lines: JavaLine[] = []

  // --- 1. Lesen (Lexer + Parser) ------------------------------------------
  // `vorbereitung` sind unsichtbare Hilfsklassen für Übungstests. Sie stehen
  // HINTER dem Code der Lernenden, damit alle Zeilennummern stimmen.
  const source = options.setup ? sourceCode + '\n\n' + options.setup : sourceCode
  let program
  try {
    program = parse(source)
  } catch (error) {
    if (error instanceof JavaSyntaxError) {
      return {
        lines: [{ type: 'exception', text: `Main.java:${error.line}: error: ${error.message}` }],
        results: options.tests ? allTestsFailed(options.tests, t.noRun) : null,
        failed: true,
      }
    }
    throw error
  }

  // --- 2. Prüfen (das, was javac macht) -----------------------------------
  const messages = checkProgram(program)
  if (messages.length) {
    for (const m of messages) {
      lines.push({ type: 'exception', text: `Main.java:${m.line}: error: ${m.en}` })
      if (language === 'de') lines.push({ type: 'info', text: '   ' + m.de })
      else if (m.en !== m.de) lines.push({ type: 'info', text: '   ' + m.en })
    }
    lines.push({ type: 'warn', text: t.compileErrors(messages.length) })
    return { lines, results: options.tests ? allTestsFailed(options.tests, t.noRun) : null, failed: true }
  }

  // --- 3. Ausführen --------------------------------------------------------
  let interpreter: Interpreter
  try {
    interpreter = new Interpreter(program)
  } catch (error) {
    return {
      lines: [{ type: 'exception', text: errorText(error, language) }],
      results: options.tests ? allTestsFailed(options.tests, t.noRun) : null,
      failed: true,
    }
  }

  let crashed = false
  try {
    interpreter.start()
  } catch (error) {
    crashed = true
    interpreter.finish()
    lines.push(...adopt(interpreter.lines))
    if (error instanceof JavaException) {
      lines.push({ type: 'exception', text: `Exception in thread "main" ${interpreter.exceptionText(error.value)}` })
      // Echtes Java listet hier die ganze Aufrufkette. Wir kennen sicher nur die
      // Zeile, in der es passiert ist - die ist beim Suchen ohnehin die wichtigste.
      if (error.line) lines.push({ type: 'info', text: `   at Main.java:${error.line}` })
    } else {
      lines.push({ type: 'exception', text: errorText(error, language) })
    }
    return { lines, results: options.tests ? allTestsFailed(options.tests, t.noRun) : null, failed: true }
  }

  lines.push(...adopt(interpreter.lines))

  // --- 4. Übungstests ------------------------------------------------------
  let results: JavaTestResult[] | null = null
  if (options.tests?.length) {
    // `output` macht die gesammelte Ausgabe im Test prüfbar.
    const output = interpreter.lines.map((z) => z.text).join('\n')
    interpreter.globalScope?.declare('output', { kind: 'string', value: output }, { name: 'String', dimensions: 0, args: [] })

    results = options.tests.map((test) => {
      try {
        const value = interpreter.evaluateExpression(test.expression)
        const actual = toJs(value, interpreter)
        const ok = test.expected === undefined ? actual === true : deepEqual(actual, test.expected)
        return {
          name: test.name,
          ok,
          message: ok ? '' : t.testFailure(show(test.expected === undefined ? true : test.expected), show(actual)),
        }
      } catch (error) {
        const text =
          error instanceof JavaException
            ? interpreter.exceptionText(error.value)
            : errorText(error, language)
        return { name: test.name, ok: false, message: t.testCrash(text) }
      }
    })
  }

  return { lines, results, failed: crashed }
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

const adopt = (lines: OutputLine[]): JavaLine[] =>
  lines.map((z) => ({ type: z.stream === 'err' ? 'error' : 'log', text: z.text }))

const allTestsFailed = (tests: JavaTest[], message: string): JavaTestResult[] =>
  tests.map((test) => ({ name: test.name, ok: false, message }))

function errorText(error: unknown, language: JavaLanguage): string {
  if (error instanceof JavaAbort) {
    const line = error.line
    const text = language === 'de' ? error.de : error.en
    return line ? `Main.java:${line}: error: ${text}` : text
  }
  if (error instanceof JavaSyntaxError) return `Main.java:${error.line}: error: ${error.message}`
  if (error instanceof RangeError) {
    return language === 'de'
      ? 'StackOverflowError: Eine Methode ruft sich endlos selbst auf.'
      : 'StackOverflowError: a method calls itself endlessly.'
  }
  return String(error instanceof Error ? error.message : error)
}

/** Java-Wert → JavaScript-Wert, damit Tests einfache Literale vergleichen können. */
function toJs(value: Value, interpreter: Interpreter): unknown {
  switch (value.kind) {
    case 'null':
      return null
    case 'boolean':
      return value.value
    case 'int':
    case 'long':
      return value.value
    case 'double':
      return value.value
    case 'char':
      return String.fromCharCode(value.value)
    case 'string':
      return value.value
    case 'array':
      return value.values.map((w) => toJs(w, interpreter))
    case 'native': {
      if (value.data.list) return value.data.list.map((w) => toJs(w, interpreter))
      if (value.data.map) {
        const object: Record<string, unknown> = {}
        for (const entry of value.data.map.values()) {
          object[interpreter.toText(entry.key)] = toJs(entry.value, interpreter)
        }
        return object
      }
      return interpreter.toText(value)
    }
    default:
      return interpreter.toText(value)
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a === 'number' && typeof b === 'number') {
    // 0.1 + 0.2 soll gegen 0.3 grün sein.
    return Math.abs(a - b) < 1e-9 || (Number.isNaN(a) && Number.isNaN(b))
  }
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((w, i) => deepEqual(w, b[i]))
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const x = a as Record<string, unknown>
    const y = b as Record<string, unknown>
    const key = Object.keys(x)
    return key.length === Object.keys(y).length && key.every((k) => deepEqual(x[k], y[k]))
  }
  return false
}

/** Werte so anzeigen, wie sie im Java-Code stehen würden. */
function show(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`
  if (Array.isArray(value)) return `[${value.map(show).join(', ')}]`
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : doubleText(value)
  if (value && typeof value === 'object') {
    return `{${Object.entries(value).map(([k, v]) => `${k}=${show(v)}`).join(', ')}}`
  }
  return String(value)
}

// Also used by the Spring part (src/spring/), which evaluates Java test expressions the same way.
export { toNumber as alsZahl, toJs as alsJs, deepEqual as tiefGleich, show as zeigen }
export type { Value as Wert }
