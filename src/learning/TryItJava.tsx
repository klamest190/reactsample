import { useMemo, useState } from 'react'
import { localized } from '../i18n/localized'
import { useSprache, useTexte } from '../i18n/LanguageContext'
import type { JavaRun } from '../java'
import { lineMarkers, useDelayedCheck } from './editorChecks'
import { Console, EditorFrame, TestResults } from './EditorFrame'
import type { JavaProps } from './TryIt'
import { useEditor, useOnMount } from './useEditor'

/**
 * Anders als JavaScript braucht Java keinen iframe: Der Code läuft nie im
 * Browser, sondern wird von unserem Interpreter gelesen und Schritt für
 * Schritt ausgeführt. Er kann deshalb gar nicht an die Seite herankommen.
 *
 * Zwei Dinge fühlen sich dadurch wie eine echte Java-IDE an:
 *  - Beim Tippen prüft `javaPruefen` im Hintergrund (rote Schlangenlinien).
 *  - Erst wenn es keine Fehler mehr gibt, startet das Programm überhaupt.
 */
export function TryItJava(props: JavaProps) {
  const { id, tests, setup } = props
  const { sprache: language } = useSprache()
  const t = useTexte()
  const { code, frame } = useEditor(props)
  // Die Laufzeit wird erst beim ersten Java-Kapitel geladen (siehe javaHolen).
  const [java, setJava] = useState(javaModule)

  const javaTests = useMemo(
    () => tests?.map((test) => ({ ...test, name: localized(test.name, language) })),
    [tests, language],
  )

  const [runId, setRun] = useState<JavaRun | null>(null)
  const starten = (sourceCode: string, withTests: boolean) => {
    void getJava().then((mod) => {
      setJava(mod)
      setRun(runSafely(mod, sourceCode, language, withTests ? javaTests : undefined, setup))
    })
  }

  // Beispiele laufen sofort, Übungen erst auf Knopfdruck.
  useOnMount(() => {
    if (!tests) starten(code, false)
  })

  // Die Fehlerprüfung läuft wie in einer IDE kurz nach dem letzten Tastendruck.
  const check = useMemo(
    () => (java ? (sourceCode: string) => lineMarkers(sourceCode, java.checkJava(sourceCode, language)) : null),
    [java, language],
  )
  const markers = useDelayedCheck(code, check) ?? undefined

  return (
    <EditorFrame
      {...frame}
      kind="Java"
      markers={markers}
      run={(c) => starten(c ?? code, true)}
    >
      <TestResults id={id} results={runId?.results ?? null} />
      <Console lines={runId?.lines ?? []} emptyText={runId ? t.keineAusgabe : tests ? t.uebungStart : t.laeuft} />
    </EditorFrame>
  )
}

/**
 * Die Java-Laufzeit (rund 3000 Zeilen) wird erst geladen, wenn wirklich ein
 * Java-Kapitel offen ist - wie die Kapitel selbst (siehe kurs.ts).
 */
type JavaModule = typeof import('../java')
let javaModule: JavaModule | null = null
let loadJava: Promise<JavaModule> | null = null
function getJava(): Promise<JavaModule> {
  loadJava ??= import('../java').then((mod) => {
    javaModule = mod
    return mod
  })
  return loadJava
}

/** Ein Lauf darf die Seite nie mitreißen - auch nicht bei einem Fehler im Interpreter. */
function runSafely(
  mod: JavaModule,
  code: string,
  language: 'de' | 'en',
  tests: { name: string; expression: string; expected?: unknown }[] | undefined,
  setup?: string,
): JavaRun {
  try {
    return mod.runJava(code, { language, tests, setup })
  } catch (error) {
    return {
      lines: [{ type: 'exception', text: String(error instanceof Error ? error.message : error) }],
      results: null,
      failed: true,
    }
  }
}
