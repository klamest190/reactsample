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

import { JavaSyntaxFehler } from './lexer'
import { parsen } from './parser'
import { pruefen } from './pruefer'
import { Interpreter, JavaAbbruch, JavaAusnahme, type AusgabeZeile } from './interpreter'
import { alsZahl, doubleText, type Wert } from './werte'

export type JavaSprache = 'de' | 'en'

export type JavaTest = {
  name: string
  /** Ein Java-Ausdruck, der nach `main` ausgewertet wird - z. B. `add(2, 3)`. */
  ausdruck: string
  /** Erwartetes Ergebnis. Fehlt es, muss der Ausdruck `true` ergeben. */
  erwartet?: unknown
}

export type JavaTestErgebnis = { name: string; ok: boolean; meldung: string }

export type JavaZeile = { typ: 'log' | 'info' | 'warn' | 'error' | 'fehler'; text: string }

export type JavaLauf = {
  zeilen: JavaZeile[]
  ergebnisse: JavaTestErgebnis[] | null
  /** true, wenn das Programm nicht (vollständig) gelaufen ist. */
  fehler: boolean
}

const TEXTE = {
  de: {
    kompilierfehler: (anzahl: number) => `${anzahl} Fehler - das Programm wurde nicht gestartet.`,
    zeile: (n: number) => `Zeile ${n}`,
    ausnahme: 'Das Programm wurde durch eine Exception beendet:',
    testFehler: (erwartet: string, bekommen: string) => `erwartet: ${erwartet}, bekommen: ${bekommen}`,
    testAbsturz: (meldung: string) => `Fehler beim Prüfen: ${meldung}`,
    keinLauf: 'Das Programm ist abgestürzt - die Tests konnten nicht geprüft werden.',
  },
  en: {
    kompilierfehler: (anzahl: number) => `${anzahl} error(s) - the program was not started.`,
    zeile: (n: number) => `line ${n}`,
    ausnahme: 'The program was terminated by an exception:',
    testFehler: (erwartet: string, bekommen: string) => `expected: ${erwartet}, got: ${bekommen}`,
    testAbsturz: (meldung: string) => `error while checking: ${meldung}`,
    keinLauf: 'The program crashed - the tests could not be checked.',
  },
}

/**
 * Nur prüfen, nicht ausführen - für die roten Schlangenlinien im Editor.
 * Das ist genau das, was eine Java-IDE beim Tippen im Hintergrund tut.
 */
export function javaPruefen(quelltext: string, sprache: JavaSprache = 'de'): { zeile: number; text: string }[] {
  try {
    return pruefen(parsen(quelltext)).map((m) => ({ zeile: m.zeile, text: sprache === 'de' ? m.deutsch : m.englisch }))
  } catch (fehler) {
    if (fehler instanceof JavaSyntaxFehler) return [{ zeile: fehler.zeile, text: fehler.meldung }]
    return []
  }
}

/**
 * Führt ein Java-Programm aus. Läuft komplett synchron im Browser-Tab; der
 * Interpreter bricht selbst ab, wenn eine Schleife nicht endet.
 */
export function javaAusfuehren(
  quelltext: string,
  optionen: { sprache?: JavaSprache; tests?: JavaTest[]; vorbereitung?: string } = {},
): JavaLauf {
  const sprache = optionen.sprache ?? 'de'
  const t = TEXTE[sprache]
  const zeilen: JavaZeile[] = []

  // --- 1. Lesen (Lexer + Parser) ------------------------------------------
  // `vorbereitung` sind unsichtbare Hilfsklassen für Übungstests. Sie stehen
  // HINTER dem Code der Lernenden, damit alle Zeilennummern stimmen.
  const quelle = optionen.vorbereitung ? quelltext + '\n\n' + optionen.vorbereitung : quelltext
  let programm
  try {
    programm = parsen(quelle)
  } catch (fehler) {
    if (fehler instanceof JavaSyntaxFehler) {
      return {
        zeilen: [{ typ: 'fehler', text: `Main.java:${fehler.zeile}: error: ${fehler.meldung}` }],
        ergebnisse: optionen.tests ? alleTestsRot(optionen.tests, t.keinLauf) : null,
        fehler: true,
      }
    }
    throw fehler
  }

  // --- 2. Prüfen (das, was javac macht) -----------------------------------
  const meldungen = pruefen(programm)
  if (meldungen.length) {
    for (const m of meldungen) {
      zeilen.push({ typ: 'fehler', text: `Main.java:${m.zeile}: error: ${m.englisch}` })
      if (sprache === 'de') zeilen.push({ typ: 'info', text: '   ' + m.deutsch })
      else if (m.englisch !== m.deutsch) zeilen.push({ typ: 'info', text: '   ' + m.englisch })
    }
    zeilen.push({ typ: 'warn', text: t.kompilierfehler(meldungen.length) })
    return { zeilen, ergebnisse: optionen.tests ? alleTestsRot(optionen.tests, t.keinLauf) : null, fehler: true }
  }

  // --- 3. Ausführen --------------------------------------------------------
  let interpreter: Interpreter
  try {
    interpreter = new Interpreter(programm)
  } catch (fehler) {
    return {
      zeilen: [{ typ: 'fehler', text: fehlerText(fehler, sprache) }],
      ergebnisse: optionen.tests ? alleTestsRot(optionen.tests, t.keinLauf) : null,
      fehler: true,
    }
  }

  let abgestuerzt = false
  try {
    interpreter.starten()
  } catch (fehler) {
    abgestuerzt = true
    interpreter.abschliessen()
    zeilen.push(...uebernehmen(interpreter.zeilen))
    if (fehler instanceof JavaAusnahme) {
      zeilen.push({ typ: 'fehler', text: `Exception in thread "main" ${interpreter.ausnahmeText(fehler.wert)}` })
      // Echtes Java listet hier die ganze Aufrufkette. Wir kennen sicher nur die
      // Zeile, in der es passiert ist - die ist beim Suchen ohnehin die wichtigste.
      if (fehler.zeile) zeilen.push({ typ: 'info', text: `   at Main.java:${fehler.zeile}` })
    } else {
      zeilen.push({ typ: 'fehler', text: fehlerText(fehler, sprache) })
    }
    return { zeilen, ergebnisse: optionen.tests ? alleTestsRot(optionen.tests, t.keinLauf) : null, fehler: true }
  }

  zeilen.push(...uebernehmen(interpreter.zeilen))

  // --- 4. Übungstests ------------------------------------------------------
  let ergebnisse: JavaTestErgebnis[] | null = null
  if (optionen.tests?.length) {
    // `output` macht die gesammelte Ausgabe im Test prüfbar.
    const ausgabe = interpreter.zeilen.map((z) => z.text).join('\n')
    interpreter.hauptUmgebung?.deklarieren('output', { art: 'string', wert: ausgabe }, { name: 'String', dimensionen: 0, argumente: [] })

    ergebnisse = optionen.tests.map((test) => {
      try {
        const wert = interpreter.ausdruckAuswerten(test.ausdruck)
        const bekommen = alsJs(wert, interpreter)
        const ok = test.erwartet === undefined ? bekommen === true : tiefGleich(bekommen, test.erwartet)
        return {
          name: test.name,
          ok,
          meldung: ok ? '' : t.testFehler(zeigen(test.erwartet === undefined ? true : test.erwartet), zeigen(bekommen)),
        }
      } catch (fehler) {
        const text =
          fehler instanceof JavaAusnahme
            ? interpreter.ausnahmeText(fehler.wert)
            : fehlerText(fehler, sprache)
        return { name: test.name, ok: false, meldung: t.testAbsturz(text) }
      }
    })
  }

  return { zeilen, ergebnisse, fehler: abgestuerzt }
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

const uebernehmen = (zeilen: AusgabeZeile[]): JavaZeile[] =>
  zeilen.map((z) => ({ typ: z.strom === 'err' ? 'error' : 'log', text: z.text }))

const alleTestsRot = (tests: JavaTest[], meldung: string): JavaTestErgebnis[] =>
  tests.map((test) => ({ name: test.name, ok: false, meldung }))

function fehlerText(fehler: unknown, sprache: JavaSprache): string {
  if (fehler instanceof JavaAbbruch) {
    const zeile = fehler.zeile
    const text = sprache === 'de' ? fehler.deutsch : fehler.englisch
    return zeile ? `Main.java:${zeile}: error: ${text}` : text
  }
  if (fehler instanceof JavaSyntaxFehler) return `Main.java:${fehler.zeile}: error: ${fehler.meldung}`
  if (fehler instanceof RangeError) {
    return sprache === 'de'
      ? 'StackOverflowError: Eine Methode ruft sich endlos selbst auf.'
      : 'StackOverflowError: a method calls itself endlessly.'
  }
  return String(fehler instanceof Error ? fehler.message : fehler)
}

/** Java-Wert → JavaScript-Wert, damit Tests einfache Literale vergleichen können. */
function alsJs(wert: Wert, interpreter: Interpreter): unknown {
  switch (wert.art) {
    case 'null':
      return null
    case 'boolean':
      return wert.wert
    case 'int':
    case 'long':
      return wert.wert
    case 'double':
      return wert.wert
    case 'char':
      return String.fromCharCode(wert.wert)
    case 'string':
      return wert.wert
    case 'array':
      return wert.werte.map((w) => alsJs(w, interpreter))
    case 'nativ': {
      if (wert.daten.liste) return wert.daten.liste.map((w) => alsJs(w, interpreter))
      if (wert.daten.map) {
        const objekt: Record<string, unknown> = {}
        for (const eintrag of wert.daten.map.values()) {
          objekt[interpreter.alsText(eintrag.schluessel)] = alsJs(eintrag.wert, interpreter)
        }
        return objekt
      }
      return interpreter.alsText(wert)
    }
    default:
      return interpreter.alsText(wert)
  }
}

function tiefGleich(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a === 'number' && typeof b === 'number') {
    // 0.1 + 0.2 soll gegen 0.3 grün sein.
    return Math.abs(a - b) < 1e-9 || (Number.isNaN(a) && Number.isNaN(b))
  }
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((w, i) => tiefGleich(w, b[i]))
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const x = a as Record<string, unknown>
    const y = b as Record<string, unknown>
    const schluessel = Object.keys(x)
    return schluessel.length === Object.keys(y).length && schluessel.every((k) => tiefGleich(x[k], y[k]))
  }
  return false
}

/** Werte so anzeigen, wie sie im Java-Code stehen würden. */
function zeigen(wert: unknown): string {
  if (typeof wert === 'string') return `"${wert}"`
  if (Array.isArray(wert)) return `[${wert.map(zeigen).join(', ')}]`
  if (typeof wert === 'number') return Number.isInteger(wert) ? String(wert) : doubleText(wert)
  if (wert && typeof wert === 'object') {
    return `{${Object.entries(wert).map(([k, v]) => `${k}=${zeigen(v)}`).join(', ')}}`
  }
  return String(wert)
}

// Also used by the Spring part (src/spring/), which evaluates Java test expressions the same way.
export { alsZahl, alsJs, tiefGleich, zeigen }
export type { Wert }
