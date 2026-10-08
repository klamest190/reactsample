import type { Zweisprachig } from '../../../i18n/LanguageContext'
import type { ReactTest, Test } from '../../../learning/jsSandbox'
import type { ProjectFile } from '../../../learning/reactCompile'

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
  solution: string
  hints: Zweisprachig<string[]>
}

export type SchrittInhalt =
  | (Basis & { mode: 'js'; preview?: boolean; tests: Test[] })
  /** `typen`: zusätzlich echte Typprüfung im Editor (TypeScript-Schritt). */
  | (Basis & { mode: 'react'; typed?: boolean; tests: ReactTest[] })
  /** Die Lernenden schreiben die Tests selbst - geprüft per Mutationstest gegen `varianten`. */
  | (Basis & {
      mode: 'test'
      files: ProjectFile[]
      variants: { name: Zweisprachig; files: ProjectFile[] }[]
    })


/** A text in both languages - short to write in the step data. */
export const t = (de: string, en: string): Zweisprachig => ({ de, en })
