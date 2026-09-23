import type { Zweisprachig } from '../../i18n/SpracheContext'
import type { DockerTest, ReactTest, SpringTestSpec, Test } from '../../lernen/jsSandbox'
import type { SqlTest } from '../../sql/check'
import type { ProjectId } from '../../docker/projects'
import type { TypTest } from '../../lernen/tsLauf'
import type { HighlightMode } from '../../lernen/hervorheben'
import type { UebungsModus } from '../../lernen/modi'

/**
 * Zusätzliche Übungen pro Kapitel - in vier Stufen:
 *
 *   vorhersage  Was gibt dieser Code aus? (Multiple Choice, trainiert das mentale Modell)
 *   fehler      Code mit einem typischen Bug finden und reparieren
 *   ergaenzen   Ein Gerüst vervollständigen
 *   frei        Nur Anforderungen und Tests
 *
 * Texte sind zweisprachig, Code ist immer Englisch. In Texten gilt eine Mini-Syntax
 * (siehe lernen/Text.tsx): `code`, **fett** und [[kapitel-id]] als Link.
 */

export type Stufe = 'vorhersage' | 'fehler' | 'ergaenzen' | 'frei'

type Basis = {
  /** Kursweit eindeutig - auch Schlüssel für gespeicherten Code. */
  id: string
  titel: Zweisprachig
  /** Kapitel-ID, falls die Übung bewusst ein früheres Kapitel wiederholt. */
  wiederholung?: string
}

export type Vorhersage = Basis & {
  stufe: 'vorhersage'
  frage: Zweisprachig
  code: string
  /** Antworten sind meist Konsolenausgaben und damit sprachneutral. */
  antworten: string[] | Zweisprachig<string[]>
  richtig: number
  erklaerung: Zweisprachig
  /** Einfärbung von `code`, wenn es kein Programmcode ist (z. B. 'sql' in Teil 9). */
  hervorhebung?: HighlightMode
}

export type CodeUebung = Basis & {
  stufe: 'fehler' | 'ergaenzen' | 'frei'
  aufgabe: Zweisprachig
  modus: UebungsModus
  code: string
  loesung: string
  vorbereitung?: string
  vorschau?: boolean
  tests?: Test[] | ReactTest[] | SpringTestSpec[] | DockerTest[] | SqlTest[]
  /** Part 8: application.properties and requests (spring), project and .dockerignore (dockerfile). */
  properties?: string
  requests?: string
  project?: ProjectId
  ignore?: string
  /** Nur bei modus 'ts': Code, der zusammen mit der Lösung ohne Typfehler kompilieren muss (siehe tsLauf.ts). */
  typTests?: TypTest[]
  tipps: Zweisprachig<string[]>
}

export type Uebung = Vorhersage | CodeUebung

/** Übungen je Kapitel-ID. */
export type UebungsSammlung = Record<string, Uebung[]>
