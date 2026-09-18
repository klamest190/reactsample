/* oxlint-disable react/only-export-components -- Provider und Hooks gehören inhaltlich
   zusammen. Der Hinweis betrifft nur den Hot-Reload-Komfort von Vite. */
import { createContext, use, useEffect, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { texte, type Texte } from './texte'

/**
 * Zweisprachigkeit (Deutsch/Englisch) - bewusst ohne i18n-Bibliothek.
 *
 *  - Die gewählte Sprache lebt in einem Context und im localStorage.
 *  - Oberflächentexte kommen aus texte.ts: useTexte().ausfuehren
 *  - Kapitel gibt es als eigene Komponente pro Sprache (siehe kurs/kurs.ts),
 *    weil sich dort nicht nur Texte, sondern auch die Codebeispiele unterscheiden.
 */

export type Sprache = 'de' | 'en'

/** Ein Wert in beiden Sprachen, z. B. { de: 'Übersicht', en: 'Overview' }. */
export type Zweisprachig<T = string> = Record<Sprache, T>

type SpracheWert = { sprache: Sprache; setSprache: (sprache: Sprache) => void }

const SpracheContext = createContext<SpracheWert | null>(null)

function startSprache(): Sprache {
  return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'
}

export function SpracheProvider({ children }: { children: ReactNode }) {
  const [sprache, setSprache] = useLocalStorage<Sprache>('sprache', startSprache())

  // <html lang> für Screenreader, Silbentrennung und Rechtschreibprüfung aktuell halten.
  useEffect(() => {
    document.documentElement.lang = sprache
  }, [sprache])

  const wert = useMemo(() => ({ sprache, setSprache }), [sprache, setSprache])
  return <SpracheContext value={wert}>{children}</SpracheContext>
}

export function useSprache() {
  const ctx = use(SpracheContext)
  if (!ctx) throw new Error('useSprache braucht einen <SpracheProvider>')
  return ctx
}

/** Alle Oberflächentexte in der aktuellen Sprache. */
export function useTexte(): Texte {
  return texte[useSprache().sprache]
}
