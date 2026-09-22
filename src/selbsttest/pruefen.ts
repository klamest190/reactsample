import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import type { CodeBeispiel, ReactTest, Test, TestErgebnis } from '../lernen/jsSandbox'
import { sandboxDokument } from '../lernen/jsSandbox'
import { formatieren, kompilieren, kompilierenProjekt, type ProjektDatei } from '../lernen/reactKompilieren'
import { reactTestsAusfuehren } from '../lernen/reactTests'
import { testsAusfuehren } from '../lernen/testLauf'
import { typenPruefen } from '../lernen/typpruefung'
import { tsTypenPruefen, tsUebersetzen } from '../lernen/tsLauf'
import type { Zweisprachig } from '../i18n/SpracheContext'
import { JAVA_ERWARTETE_FEHLER, javaBeispielPruefen } from '../java/inhalte'
import { SPRING_EXPECTED_FAILURES, springExampleCheck } from '../spring/contents'
import { DOCKER_EXPECTED_FAILURES, dockerExampleCheck } from '../docker/contents'

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

export type Modus = { modus: 'js' | 'ts' | 'react' | 'test' | 'java' | 'spring' | 'dockerfile' | 'compose'; typen: boolean; vorschau: boolean }
export type Ergebnis = { id: string; ort: string; ok: boolean; meldung: string; dauer: number }

/**
 * Beispiele, die absichtlich einen Fehler zeigen - mit Begründung.
 * Die Java-Kapitel bringen ihre eigenen mit (siehe src/java/inhalte.ts).
 */
export const ERWARTETE_FEHLER: Record<string, string> = {
  ...JAVA_ERWARTETE_FEHLER,
  ...SPRING_EXPECTED_FAILURES,
  ...DOCKER_EXPECTED_FAILURES,
  'ts-start-fehler': 'zeigt, dass ein Typfehler das Programm nicht aufhält',
}

const warten = (ms: number) => new Promise((r) => setTimeout(r, ms))
const nameVon = (n: string | Zweisprachig) => (typeof n === 'string' ? n : n.de)

// ---------------------------------------------------------------------------
// Ausführen
// ---------------------------------------------------------------------------

let laufNummer = 100_000

/** JavaScript im selben Sandbox-iframe wie TryIt. */
export function jsAusfuehren(
  code: string,
  optionen: { tests?: Test[]; vorbereitung?: string } = {},
): Promise<{ fehler: string[]; ergebnisse: TestErgebnis[] | null }> {
  const lauf = ++laufNummer
  const mitTests = Boolean(optionen.tests?.length)
  const iframe = document.createElement('iframe')
  iframe.setAttribute('sandbox', 'allow-scripts allow-forms')
  Object.assign(iframe.style, { position: 'fixed', left: '-10000px', width: '400px', height: '300px' })

  return new Promise((aufloesen) => {
    const fehler: string[] = []
    let ergebnisse: TestErgebnis[] | null = null
    let fertig = false
    const ende = () => {
      if (fertig) return
      fertig = true
      window.removeEventListener('message', beiNachricht)
      clearTimeout(notbremse)
      iframe.remove()
      aufloesen({ fehler, ergebnisse })
    }
    function beiNachricht(e: MessageEvent) {
      const n = e.data
      if (e.source !== iframe.contentWindow || !n?.tryit || n.lauf !== lauf) return
      if (n.typ === 'fehler') {
        fehler.push(n.text)
        // Ein Fehler im Modul verhindert auch die Tests - kurz warten, dann aufhören.
        if (mitTests) setTimeout(ende, 300)
      } else if (n.typ === 'tests') {
        ergebnisse = n.ergebnisse
        ende()
      } else if (n.typ === 'fertig' && !mitTests) {
        // Asynchrone Fehler (Timer, Promises) kurz abwarten.
        setTimeout(ende, 700)
      }
    }
    const notbremse = setTimeout(() => {
      if (mitTests && !ergebnisse) fehler.push('Zeitüberschreitung: keine Testergebnisse')
      ende()
    }, 10_000)
    window.addEventListener('message', beiNachricht)
    iframe.srcdoc = sandboxDokument({
      lauf,
      code,
      vorbereitung: optionen.vorbereitung,
      tests: optionen.tests?.map((t) => ({ ...t, name: nameVon(t.name) })),
      dunkel: false,
      sprache: 'de',
    })
    document.body.appendChild(iframe)
  })
}

/** Eine React-Komponente rendern und nicht abgefangene Fehler einsammeln. */
async function reactRendern(App: Parameters<typeof createElement>[0], aufraeumen: () => void) {
  const fehler: string[] = []
  const element = document.createElement('div')
  element.className = 'vorschau'
  Object.assign(element.style, { position: 'fixed', left: '-10000px', width: '720px' })
  document.body.appendChild(element)
  const root = createRoot(element, { onUncaughtError: (f) => fehler.push(formatieren(f)) })
  try {
    flushSync(() => root.render(createElement(App)))
    await warten(400)
  } catch (f) {
    fehler.push(formatieren(f))
  }
  root.unmount()
  element.remove()
  aufraeumen()
  return fehler
}

async function reactBeispiel(code: string) {
  try {
    const { App, aufraeumen } = await kompilieren(code, () => {}, 'de')
    return await reactRendern(App, aufraeumen)
  } catch (f) {
    return [formatieren(f)]
  }
}

export async function projektRendern(dateien: ProjektDatei[], einstieg: string) {
  try {
    const { App, aufraeumen } = await kompilierenProjekt(dateien, einstieg, () => {}, 'de')
    return await reactRendern(App, aufraeumen)
  } catch (f) {
    return [formatieren(f)]
  }
}

// ---------------------------------------------------------------------------
// Prüfen
// ---------------------------------------------------------------------------

const alleOk = (e: TestErgebnis[] | null) => Boolean(e?.length) && e!.every((x) => x.ok)
const ersterFehler = (e: TestErgebnis[] | null, fehler: string[] = []) =>
  fehler[0] ?? e?.find((x) => !x.ok)?.name + ': ' + e?.find((x) => !x.ok)?.meldung

/** Musterlösung grün, Startcode rot - für JS-, React- und Java-Übungen. */
async function uebungPruefen(
  modus: 'js' | 'react' | 'java',
  start: string,
  loesung: string,
  tests: Test[] | ReactTest[],
  vorbereitung?: string,
): Promise<string | null> {
  // Java prüft sich selbst - die Laufzeit in src/java/ braucht weder DOM noch iframe.
  if (modus === 'java') {
    const ergebnis = javaBeispielPruefen('', { code: start, loesung, tests: tests as Test[], vorbereitung })
    return ergebnis.ok ? null : ergebnis.meldung
  }
  if (modus === 'react') {
    const mitLoesung = await reactTestsAusfuehren(loesung, tests as ReactTest[], 'de')
    if (!alleOk(mitLoesung)) return 'Musterlösung besteht nicht: ' + ersterFehler(mitLoesung)
    if (start !== loesung) {
      const mitStart = await reactTestsAusfuehren(start, tests as ReactTest[], 'de')
      if (alleOk(mitStart)) return 'Startcode besteht schon alle Tests'
    }
    return null
  }
  const mitLoesung = await jsAusfuehren(loesung, { tests: tests as Test[], vorbereitung })
  if (!alleOk(mitLoesung.ergebnisse)) return 'Musterlösung besteht nicht: ' + ersterFehler(mitLoesung.ergebnisse, mitLoesung.fehler)
  if (start !== loesung) {
    const mitStart = await jsAusfuehren(start, { tests: tests as Test[], vorbereitung })
    if (alleOk(mitStart.ergebnisse) && mitStart.fehler.length === 0) return 'Startcode besteht schon alle Tests'
  }
  return null
}

/**
 * Reines TypeScript (Teil 2): Lösung bzw. Beispiel ohne Typfehler, Typ-Tests grün, läuft ohne Fehler
 * und besteht die Tests. Der Startcode einer Übung muss an irgendetwas davon scheitern.
 */
async function tsPruefen(b: CodeBeispiel): Promise<string | null> {
  const typTests = b.typTests ?? []
  const tests = b.tests as Test[] | undefined

  async function durchlauf(code: string) {
    const typen = await tsTypenPruefen(code, typTests)
    const typFehler = typen.imCode[0] ? `Typfehler in Zeile ${typen.imCode[0].zeile}: ${typen.imCode[0].text}` : null
    const testTypFehler = typen.proTest.findIndex((f) => f.length > 0)
    const uebersetzt = await tsUebersetzen(code)
    if ('fehler' in uebersetzt) return { meldung: 'nicht übersetzbar: ' + uebersetzt.fehler }
    const lauf = await jsAusfuehren(uebersetzt.code, { tests, vorbereitung: b.vorbereitung })
    const meldung =
      typFehler ??
      (testTypFehler >= 0 ? `Typ-Test „${nameVon(typTests[testTypFehler].name)}“: ${typen.proTest[testTypFehler][0].text}` : null) ??
      (tests?.length ? (alleOk(lauf.ergebnisse) ? null : ersterFehler(lauf.ergebnisse, lauf.fehler)) : (lauf.fehler[0] ?? null))
    return { meldung }
  }

  const ziel = await durchlauf(b.loesung ?? b.code)
  if (ziel.meldung) return `${b.loesung ? 'Musterlösung' : 'Beispiel'}: ${ziel.meldung}`
  if (b.loesung && b.loesung !== b.code && (tests?.length || typTests.length)) {
    const start = await durchlauf(b.code)
    if (!start.meldung) return 'Startcode besteht schon alles (Typen, Typ-Tests und Tests)'
  }
  return null
}

/** Eigene Tests (Test-Modus): grün mit der richtigen Komponente, jede Variante wird erkannt. */
async function testModusPruefen(
  code: string,
  dateien: ProjektDatei[] = [],
  varianten: { dateien: ProjektDatei[] }[] = [],
): Promise<{ gruen: boolean; erkannt: number; meldung: string }> {
  const eigene = { pfad: 'App.test.jsx', code }
  const bericht = await testsAusfuehren([...dateien, eigene], 'App.test.jsx', 'de')
  const gruen = !bericht.fehler && bericht.faelle.length > 0 && bericht.faelle.every((f) => f.ok)
  const meldung = bericht.fehler ?? bericht.faelle.filter((f) => !f.ok).map((f) => f.name + ': ' + f.meldung)[0] ?? ''
  let erkannt = 0
  for (const v of varianten) {
    const b = await testsAusfuehren([...v.dateien, eigene], 'App.test.jsx', 'de')
    if (b.fehler || b.faelle.some((f) => !f.ok)) erkannt++
  }
  return { gruen, erkannt, meldung }
}

/** Ein Beispiel aus einer *.code.ts-Datei - Art ergibt sich aus der Verwendung im Kapitel. */
export async function beispielPruefen(
  b: CodeBeispiel,
  m: Modus,
  extra: { dateien?: ProjektDatei[]; varianten?: { dateien: ProjektDatei[] }[]; id?: string } = {},
): Promise<string | null> {
  if (m.modus === 'java') {
    const ergebnis = javaBeispielPruefen('', b)
    return ergebnis.ok ? null : ergebnis.meldung
  }
  // Part 8 checks itself as well - Spring runtime and Docker simulator need no DOM.
  if (m.modus === 'spring') {
    const result = springExampleCheck(extra.id ?? '', b)
    return result.ok ? null : result.message
  }
  if (m.modus === 'dockerfile' || m.modus === 'compose') {
    const result = dockerExampleCheck(extra.id ?? '', b, m.modus)
    return result.ok ? null : result.message
  }

  if (m.modus === 'ts') return tsPruefen(b)

  if (m.modus === 'test') {
    if (extra.varianten?.length && b.loesung) {
      const mitLoesung = await testModusPruefen(b.loesung, extra.dateien, extra.varianten)
      if (!mitLoesung.gruen) return 'Musterlösung-Tests nicht grün: ' + mitLoesung.meldung
      if (mitLoesung.erkannt < extra.varianten.length) return `Musterlösung erkennt nur ${mitLoesung.erkannt}/${extra.varianten.length} Varianten`
      const mitStart = await testModusPruefen(b.code, extra.dateien, extra.varianten)
      if (mitStart.gruen && mitStart.erkannt === extra.varianten.length) return 'Startcode erkennt schon alle Varianten'
      return null
    }
    const r = await testModusPruefen(b.code, extra.dateien)
    return r.gruen ? null : 'Tests nicht grün: ' + r.meldung
  }

  if (m.typen) {
    const ziel = b.loesung ?? b.code
    const fehler = await typenPruefen(ziel)
    if (fehler.length) return `${b.loesung ? 'Musterlösung' : 'Beispiel'} hat Typfehler: Zeile ${fehler[0].zeile}: ${fehler[0].text}`
    if (b.loesung && (await typenPruefen(b.code)).length === 0 && b.tests?.length) {
      // Bei TS-Übungen ist „keine Typfehler“ ein Test - der Startcode muss welche haben.
      const mitStart = await reactTestsAusfuehren(b.code, b.tests as ReactTest[], 'de')
      if (alleOk(mitStart)) return 'Startcode hat keine Typfehler und besteht alle Tests'
    }
  }

  if (b.loesung && b.tests?.length) {
    // Bei TS-Übungen darf der Startcode alle Verhaltenstests bestehen - er scheitert an den Typen.
    const start = m.typen ? b.loesung : b.code
    return uebungPruefen(m.modus as 'js' | 'react' | 'java', start, b.loesung, b.tests as Test[] | ReactTest[], b.vorbereitung)
  }

  // Beispiel bzw. Übung ohne Tests: läuft ohne Fehler. Bei Übungen zählt nur die Lösung -
  // der Startcode darf unfertig sein.
  const code = b.loesung ?? b.code
  const fehler = m.modus === 'react' ? await reactBeispiel(code) : (await jsAusfuehren(code, { vorbereitung: b.vorbereitung })).fehler
  return fehler[0] ?? null
}

export { uebungPruefen, testModusPruefen, warten }
