/* oxlint-disable react/only-export-components -- Provider, Hook und Typen gehören
   inhaltlich zusammen. Der Hinweis betrifft nur den Hot-Reload-Komfort von Vite. */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

/**
 * Der gesamte Lernfortschritt an einer Stelle.
 *
 * Warum ein Context und nicht State in App? Weil die Kapitelseite mit
 * `key={kapitel.id + sprache}` absichtlich neu aufgebaut wird, sobald man das
 * Kapitel oder die Sprache wechselt. Alles, was dabei überleben soll, muss
 * ÜBER diesem key liegen - der Provider hängt deshalb in main.tsx.
 *
 * Gespeichert wird in drei getrennten Schlüsseln, damit jeder für sich lesbar
 * und löschbar bleibt.
 */

/** Stand eines Kapitel-Quiz. `gesamt` dient als Gültigkeitsprüfung. */
export type QuizStand = {
  /** Anzahl Fragen zum Zeitpunkt des Speicherns. */
  gesamt: number
  /** Anzahl richtiger Antworten - abgeleitet, aber auch ohne die Fragen lesbar. */
  richtig: number
  /** Gewählter Antwortindex je Frage, null = noch offen. */
  antworten: (number | null)[]
}

type FortschrittWert = {
  erledigt: string[]
  quiz: Record<string, QuizStand>
  uebungen: string[]
  kapitelSetzen: (id: string, wert: boolean) => void
  quizSetzen: (kapitelId: string, stand: QuizStand) => void
  uebungGeloest: (uebungsId: string) => void
  allesZuruecksetzen: () => void
}

const FortschrittContext = createContext<FortschrittWert | null>(null)

export function FortschrittProvider({ children }: { children: ReactNode }) {
  const [erledigt, setErledigt] = useLocalStorage<string[]>('lernpfad-erledigt', [])
  const [quiz, setQuiz] = useLocalStorage<Record<string, QuizStand>>('lernpfad-quiz', {})
  const [uebungen, setUebungen] = useLocalStorage<string[]>('lernpfad-uebungen', [])

  // Alle Setter mit useCallback: sie landen in Effekt-Abhängigkeiten
  // (siehe Testergebnisse in TryIt.tsx) und dürfen sich nicht bei jedem Render ändern.
  const kapitelSetzen = useCallback(
    (id: string, wert: boolean) => {
      setErledigt((alt) => (wert ? [...new Set([...alt, id])] : alt.filter((e) => e !== id)))
    },
    [setErledigt],
  )

  const quizSetzen = useCallback(
    (kapitelId: string, stand: QuizStand) => {
      setQuiz((alt) => ({ ...alt, [kapitelId]: stand }))
    },
    [setQuiz],
  )

  const uebungGeloest = useCallback(
    (uebungsId: string) => {
      setUebungen((alt) => (alt.includes(uebungsId) ? alt : [...alt, uebungsId]))
    },
    [setUebungen],
  )

  const allesZuruecksetzen = useCallback(() => {
    setErledigt([])
    setQuiz({})
    setUebungen([])
    // Der selbst geschriebene Code (tryit:*) bleibt absichtlich stehen -
    // das ist die Arbeit der Lernenden, nicht ihr Fortschritt.
  }, [setErledigt, setQuiz, setUebungen])

  const wert = useMemo(
    () => ({ erledigt, quiz, uebungen, kapitelSetzen, quizSetzen, uebungGeloest, allesZuruecksetzen }),
    [erledigt, quiz, uebungen, kapitelSetzen, quizSetzen, uebungGeloest, allesZuruecksetzen],
  )

  return <FortschrittContext value={wert}>{children}</FortschrittContext>
}

export function useFortschritt() {
  const wert = useContext(FortschrittContext)
  if (!wert) throw new Error('useFortschritt braucht einen FortschrittProvider')
  return wert
}

/**
 * Gibt den gespeicherten Quizstand zurück - aber nur, wenn er noch zum Quiz passt.
 * Ändert sich die Fragenzahl eines Kapitels, ist der alte Stand wertlos.
 */
export function gueltigerQuizStand(stand: QuizStand | undefined, fragen: number) {
  return stand && stand.gesamt === fragen ? stand : undefined
}
