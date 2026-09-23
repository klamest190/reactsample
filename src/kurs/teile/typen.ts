import { lazy, type ComponentType } from 'react'
import type { Zweisprachig } from '../../i18n/SpracheContext'

/**
 * Types of the course structure and the lazy loader for chapters - shared by kurs.ts and the
 * part files next to this one (one file per part).
 */

/**
 * Jedes Kapitel wird erst geladen, wenn man es öffnet (Code-Splitting, siehe Kapitel 4.8).
 * lazy() erwartet einen default-Export - die Kapitel exportieren aber benannt,
 * deshalb wird der Export hier umverpackt.
 */
export function laden<M extends Record<string, ComponentType>>(importieren: () => Promise<M>, name: keyof M) {
  return lazy(() => importieren().then((modul) => ({ default: modul[name] })))
}

export type Kapitel = {
  /** Sprachneutral - steht in der URL und im gespeicherten Fortschritt. */
  id: string
  titel: Zweisprachig
  /** Ein Satz: worum geht es? */
  kurz: Zweisprachig
  /** Geschätzte Minuten inkl. Übungen. */
  dauer: number
  lernziele: Zweisprachig<string[]>
  Komponente: Zweisprachig<ComponentType>
  /** Kapitel, deren Wissen hier vorausgesetzt wird (der rote Faden). */
  grundlagen?: string[]
  /** Zusätzliche Suchbegriffe (Hook-Namen, englische Fachbegriffe …). */
  stichworte?: string[]
}

export type Bereich = 'frontend' | 'backend'


export type Teil = {
  id: string
  nummer: number
  titel: Zweisprachig
  kurztitel: Zweisprachig
  /** Frontend (Browser) oder Backend (Server) - danach gliedern Seitenleiste und Startseite. */
  bereich: Bereich
  beschreibung: Zweisprachig
  kapitel: Kapitel[]
}
