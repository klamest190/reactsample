import type { Zweisprachig } from '../../../i18n/SpracheContext'
import type { ReactTest, Test } from '../../../lernen/jsSandbox'
import type { ProjektDatei } from '../../../lernen/reactKompilieren'

/**
 * Inhalte der Projektschritte (Metadaten siehe meta.ts).
 *
 * Jeder Schritt startet mit der Lösung des vorherigen - deshalb stehen die Lösungen
 * als Konstanten oben und werden als `start` weiterverwendet. So kann man bei jedem
 * Schritt einsteigen, ohne die vorherigen gemacht zu haben.
 *
 * Konventionen der App (von den Tests geprüft, deshalb überall gleich):
 *   Eingabefeld mit placeholder "What needs to be done?", Knopf "Add",
 *   <li> pro Todo mit Checkbox, Klasse "done" und Löschknopf "✕",
 *   Filterknöpfe All / Open / Done mit aria-pressed, Text "n open", Knopf "Clear done",
 *   localStorage-Schlüssel "todos".
 */

type Basis = {
  einleitung: Zweisprachig
  anforderungen: Zweisprachig<string[]>
  /** Startcode; fehlt er, startet der Editor mit der Lösung des vorherigen Schritts. */
  start?: string
  loesung: string
  tipps: Zweisprachig<string[]>
}

export type SchrittInhalt =
  | (Basis & { modus: 'js'; vorschau?: boolean; tests: Test[] })
  /** `typen`: zusätzlich echte Typprüfung im Editor (TypeScript-Schritt). */
  | (Basis & { modus: 'react'; typen?: boolean; tests: ReactTest[] })
  /** Die Lernenden schreiben die Tests selbst - geprüft per Mutationstest gegen `varianten`. */
  | (Basis & {
      modus: 'test'
      dateien: ProjektDatei[]
      varianten: { name: Zweisprachig; dateien: ProjektDatei[] }[]
    })


/** A text in both languages - short to write in the step data. */
export const t = (de: string, en: string): Zweisprachig => ({ de, en })
