/**
 * Prüft die Java-Beispiele der Kapitel - mit denselben Regeln, die der
 * Selbsttest schon für JavaScript und React anwendet:
 *
 *   Beispiel ohne Tests   muss ohne Fehler durchlaufen
 *   Übung mit Tests       die Musterlösung besteht alle Tests,
 *                         der Startcode besteht sie NICHT (sonst wäre nichts zu tun)
 *
 * Steht hier statt in src/selbsttest/, weil es weder DOM noch React braucht -
 * so kann es auch die Kommandozeile (scripts/java-testen.ts) benutzen.
 */

import { javaAusfuehren } from './index'
import type { CodeBeispiel, Test } from '../lernen/jsSandbox'

/** Beispiele, die absichtlich nicht laufen - mit Begründung. */
export const JAVA_ERWARTETE_FEHLER: Record<string, string> = {
  'java-start-fehler': 'zeigt absichtlich einen Kompilierfehler (fehlendes Semikolon)',
  'java-variablen-fehler': 'zeigt absichtlich einen Typfehler',
  'java-arrays-npe': 'zeigt absichtlich eine NullPointerException',
  'java-fehler-ungefangen': 'zeigt absichtlich einen Absturz mit Stacktrace',
}

export type InhaltErgebnis = { id: string; ok: boolean; meldung: string }

const alsJavaTests = (tests: Test[]) =>
  tests.map((test) => ({
    name: typeof test.name === 'string' ? test.name : test.name.de,
    ausdruck: test.ausdruck,
    erwartet: test.erwartet,
  }))

export function javaBeispielPruefen(id: string, beispiel: CodeBeispiel): InhaltErgebnis {
  const ok = (meldung = ''): InhaltErgebnis => ({ id, ok: !meldung, meldung })
  const tests = beispiel.tests as Test[] | undefined

  if (tests?.length) {
    const javaTests = alsJavaTests(tests)
    const optionen = { sprache: 'de' as const, tests: javaTests, vorbereitung: beispiel.vorbereitung }
    const loesung = javaAusfuehren(beispiel.loesung ?? beispiel.code, optionen)
    const gescheitert = (loesung.ergebnisse ?? []).filter((e) => !e.ok)
    if (gescheitert.length) {
      return ok('Musterlösung scheitert: ' + gescheitert.map((e) => `„${e.name}“ ${e.meldung}`).join(' · '))
    }
    const startCode = javaAusfuehren(beispiel.code, optionen)
    if ((startCode.ergebnisse ?? []).every((e) => e.ok)) {
      return ok('Der Startcode besteht schon alle Tests - dann ist nichts zu üben.')
    }
    return ok()
  }

  const grund = JAVA_ERWARTETE_FEHLER[id]
  for (const [was, code] of [
    ['Beispiel', beispiel.code],
    ...(beispiel.loesung ? [['Musterlösung', beispiel.loesung] as const] : []),
  ] as const) {
    const lauf = javaAusfuehren(code, { sprache: 'de', vorbereitung: beispiel.vorbereitung })
    const fehler = lauf.zeilen.filter((z) => z.typ === 'fehler').map((z) => z.text)
    if (fehler.length && !grund) return ok(`${was}: ${fehler.join(' | ')}`)
    if (!fehler.length && grund && was === 'Beispiel') {
      return ok(`Sollte fehlschlagen (${grund}), läuft aber durch.`)
    }
  }
  return ok()
}
