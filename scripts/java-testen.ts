/**
 * Prüft den Java-Teil auf der Kommandozeile:
 *
 *   npm run test:java
 *
 *   1. die Laufzeit selbst (src/java/selbsttest.ts): Tut unser Java das, was
 *      echtes Java täte?
 *   2. alle Beispiele und Übungen der Kapitel in src/kurs/java/: Läuft jedes
 *      Beispiel? Besteht jede Musterlösung ihre Tests - und der Startcode nicht?
 *
 * Dieselben Prüfungen laufen auch in `npm run test:inhalte` im Browser; dieses
 * Skript ist der schnelle Weg ohne Browser.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { javaLaufzeitPruefen } from '../src/java/selbsttest'
import { JAVA_ERWARTETE_FEHLER, javaBeispielPruefen } from '../src/java/inhalte'
import type { CodeBeispiel } from '../src/lernen/jsSandbox'

const ordner = join(import.meta.dirname, '..', 'src', 'kurs', 'java')

let fehlgeschlagen = 0
const melden = (ok: boolean, name: string, meldung = '') => {
  if (!ok) fehlgeschlagen++
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : '\n    → ' + meldung}`)
}

console.log('── Laufzeit ' + '─'.repeat(50))
for (const e of javaLaufzeitPruefen()) melden(e.ok, e.name, e.message)

/**
 * Welche Beispiele laufen als Java? Das steht im `modus` des <TryIt> im
 * Kapiteltext - genau wie der Selbsttest im Browser es liest. Kapitel 6.10
 * zeigt dieselbe Aufgabe in Java, JavaScript und React; nur der Java-Teil
 * davon gehört hierher.
 */
const javaIds = new Set<string>()
const alleIds = new Set<string>()
for (const datei of readdirSync(ordner).filter((d) => d.endsWith('.tsx') && !d.endsWith('.en.tsx'))) {
  const quelle = readFileSync(join(ordner, datei), 'utf8')
  for (const stueck of quelle.split('<TryIt').slice(1)) {
    const ende = Math.min(...['aufgabe=', '/>'].map((s) => stueck.indexOf(s)).filter((i) => i >= 0))
    const props = stueck.slice(0, ende)
    const id = props.match(/id="([^"]+)"/)?.[1]
    if (!id) continue
    alleIds.add(id)
    if (props.includes('modus="java"')) javaIds.add(id)
  }
}

console.log('\n── Kapitelinhalte ' + '─'.repeat(44))
for (const datei of readdirSync(ordner).filter((d) => d.endsWith('.code.ts'))) {
  const modul = (await import(join(ordner, datei))) as { beispiele?: Record<string, CodeBeispiel> }
  for (const [id, beispiel] of Object.entries(modul.beispiele ?? {})) {
    if (!javaIds.has(id)) {
      // JavaScript- und React-Beispiele prüft `npm run test:inhalte` im Browser.
      if (alleIds.has(id)) console.log(`· ${id}  (${datei}, kein Java - siehe test:inhalte)`)
      else melden(false, `${id}  (${datei})`, 'wird in keinem Kapitel verwendet')
      continue
    }
    const ergebnis = javaBeispielPruefen(id, beispiel)
    melden(ergebnis.ok, `${ergebnis.id}  (${datei})`, ergebnis.message)
  }
}

console.log('\n── Zusatzübungen ' + '─'.repeat(45))
const { uebungen } = (await import('../src/kurs/uebungen/java')) as typeof import('../src/kurs/uebungen/java')
for (const liste of Object.values(uebungen)) {
  for (const uebung of liste) {
    if (uebung.stufe === 'vorhersage') continue // Multiple Choice, nichts auszuführen
    const ergebnis = javaBeispielPruefen(uebung.id, uebung)
    melden(ergebnis.ok, `${ergebnis.id}  (uebungen/java.ts)`, ergebnis.message)
  }
}

console.log(`\n${fehlgeschlagen ? '✗' : '✓'} ${fehlgeschlagen} fehlgeschlagen`)
if (fehlgeschlagen) process.exitCode = 1
if (Object.keys(JAVA_ERWARTETE_FEHLER).length) {
  console.log(`(${Object.keys(JAVA_ERWARTETE_FEHLER).length} Beispiel(e) dürfen absichtlich fehlschlagen)`)
}
