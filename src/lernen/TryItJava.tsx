import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { localized } from '../i18n/localized'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import type { JavaLauf } from '../java'
import { lineMarkers, useDelayedCheck } from './editorChecks'
import { Konsole, Rahmen, Testergebnisse } from './Rahmen'
import type { JavaProps } from './TryIt'
import { useSavedCode } from './useSavedCode'

/**
 * Anders als JavaScript braucht Java keinen iframe: Der Code läuft nie im
 * Browser, sondern wird von unserem Interpreter gelesen und Schritt für
 * Schritt ausgeführt. Er kann deshalb gar nicht an die Seite herankommen.
 *
 * Zwei Dinge fühlen sich dadurch wie eine echte Java-IDE an:
 *  - Beim Tippen prüft `javaPruefen` im Hintergrund (rote Schlangenlinien).
 *  - Erst wenn es keine Fehler mehr gibt, startet das Programm überhaupt.
 */
export function TryItJava({ id, titel, aufgabe, code: startCode, loesung, tipps, tests, vorbereitung, ...playground }: JavaProps) {
  const { sprache } = useSprache()
  const t = useTexte()
  const [code, setCode] = useSavedCode(id, startCode)
  // Die Laufzeit wird erst beim ersten Java-Kapitel geladen (siehe javaHolen).
  const [java, setJava] = useState(javaModul)

  const javaTests = useMemo(
    () => tests?.map((test) => ({ ...test, name: localized(test.name, sprache) })),
    [tests, sprache],
  )

  const [lauf, setLauf] = useState<JavaLauf | null>(null)
  const starten = (quelltext: string, mitTests: boolean) => {
    void javaHolen().then((modul) => {
      setJava(modul)
      setLauf(sicherAusfuehren(modul, quelltext, sprache, mitTests ? javaTests : undefined, vorbereitung))
    })
  }

  // Beispiele laufen sofort, Übungen erst auf Knopfdruck.
  const ersterLauf = useEffectEvent(() => {
    if (!tests) starten(code, false)
  })
  useEffect(() => {
    ersterLauf()
  }, [])

  // Die Fehlerprüfung läuft wie in einer IDE kurz nach dem letzten Tastendruck.
  const pruefen = useMemo(
    () => (java ? (quelltext: string) => lineMarkers(quelltext, java.javaPruefen(quelltext, sprache)) : null),
    [java, sprache],
  )
  const markierungen = useDelayedCheck(code, pruefen) ?? undefined

  return (
    <Rahmen
      {...playground}
      art="Java"
      titel={titel}
      aufgabe={aufgabe}
      code={code}
      setCode={setCode}
      startCode={startCode}
      loesung={loesung}
      tipps={tipps}
      markierungen={markierungen}
      ausfuehren={(c) => starten(c ?? code, true)}
    >
      <Testergebnisse id={id} ergebnisse={lauf?.ergebnisse ?? null} />
      <Konsole zeilen={lauf?.zeilen ?? []} leerText={lauf ? t.keineAusgabe : tests ? t.uebungStart : t.laeuft} />
    </Rahmen>
  )
}

/**
 * Die Java-Laufzeit (rund 3000 Zeilen) wird erst geladen, wenn wirklich ein
 * Java-Kapitel offen ist - wie die Kapitel selbst (siehe kurs.ts).
 */
type JavaModul = typeof import('../java')
let javaModul: JavaModul | null = null
let javaLaden: Promise<JavaModul> | null = null
function javaHolen(): Promise<JavaModul> {
  javaLaden ??= import('../java').then((modul) => {
    javaModul = modul
    return modul
  })
  return javaLaden
}

/** Ein Lauf darf die Seite nie mitreißen - auch nicht bei einem Fehler im Interpreter. */
function sicherAusfuehren(
  modul: JavaModul,
  code: string,
  sprache: 'de' | 'en',
  tests: { name: string; ausdruck: string; erwartet?: unknown }[] | undefined,
  vorbereitung?: string,
): JavaLauf {
  try {
    return modul.javaAusfuehren(code, { sprache, tests, vorbereitung })
  } catch (fehler) {
    return {
      zeilen: [{ typ: 'fehler', text: String(fehler instanceof Error ? fehler.message : fehler) }],
      ergebnisse: null,
      fehler: true,
    }
  }
}
