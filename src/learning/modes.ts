import type { HighlightMode } from './highlight'

/**
 * Die Editor-Modi und Sprachen an einer Stelle.
 *
 * Was ein neuer Modus braucht, wird hier eingetragen - Typen der Übungen, Playgrounds
 * und des Selbsttests, das Abzeichen im Editor, die Hervorhebung und das
 * Kommentarzeichen leiten sich davon ab. Die Editoren selbst (TryIt*.tsx) und die
 * Prüfungen im Selbsttest bleiben je Modus eigener Code.
 */

/** Alle Modi von <TryIt modus="…">. */
export const MODES = ['js', 'ts', 'react', 'test', 'java', 'spring', 'dockerfile', 'compose', 'sql'] as const
export type Mode = (typeof MODES)[number]

/** Übungen: der Test-Modus hat eine eigene Form (Varianten), die es nur im Kapitel gibt. */
export type ExerciseMode = Exclude<Mode, 'test'>

/** Playgrounds: Docker übt man im Terminal und in den Editoren der Kapitel 8.8 bis 8.10. */
export type PlaygroundMode = Exclude<Mode, 'test' | 'dockerfile' | 'compose'>

/** Jede Sprache eines Editors: wie sie eingefärbt wird und womit ein Zeilenkommentar beginnt. */
export const EDITOR_LANGUAGES = {
  js: { highlight: 'code', comment: '//' },
  ts: { highlight: 'code', comment: '//' },
  react: { highlight: 'code', comment: '//' },
  java: { highlight: 'code', comment: '//' },
  spring: { highlight: 'code', comment: '//' },
  docker: { highlight: 'config', comment: '#' },
  yaml: { highlight: 'config', comment: '#' },
  properties: { highlight: 'config', comment: '#' },
  sql: { highlight: 'sql', comment: '--' },
} as const satisfies Record<string, { highlight: HighlightMode; comment: string }>

export type EditorLanguage = keyof typeof EDITOR_LANGUAGES

/**
 * Die Arten der Editor-Hülle (Rahmen in TryIt.tsx): das Abzeichen oben rechts und die
 * Sprache des Editors. Eine Art ist feiner als ein Modus - React mit Typprüfung zeigt TSX.
 * Tailwind-Klassen als ganze Strings, damit der Scanner sie findet.
 */
export const KINDS = {
  JavaScript: { text: 'JS', classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', language: 'js' },
  Java: { text: 'JAVA', classes: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300', language: 'java' },
  React: { text: 'JSX', classes: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300', language: 'react' },
  TypeScript: { text: 'TSX', classes: 'bg-blue-600 text-white dark:bg-blue-600', language: 'react' },
  TS: { text: 'TS', classes: 'bg-blue-600 text-white dark:bg-blue-600', language: 'ts' },
  Test: { text: 'TEST', classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', language: 'react' },
  Spring: { text: 'SPRING', classes: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300', language: 'spring' },
  Docker: { text: 'DOCKERFILE', classes: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300', language: 'docker' },
  Compose: { text: 'COMPOSE', classes: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300', language: 'yaml' },
  SQL: { text: 'SQL', classes: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300', language: 'sql' },
} as const satisfies Record<string, { text: string; classes: string; language: EditorLanguage }>

export type Kind = keyof typeof KINDS

/** Dateien, die kein Programmcode sind: `#`-Kommentare, Schlüssel, Anweisungen (Teil 8). */
const CONFIG_TITLE = /Dockerfile|\.dockerignore|\.ya?ml$|\.properties$|\.http$|\.env$|Terminal/i
/** SQL-Skripte und psql-Sitzungen (Teil 9). */
const SQL_TITLE = /\.sql$|^SQL\b|^psql\b/i

/** Hervorhebung eines statischen Codeblocks nach seinem Titel (Dateiname, „Terminal“, „SQL“ …). */
export function highlightForTitle(title?: string): HighlightMode {
  if (title && SQL_TITLE.test(title)) return 'sql'
  if (title && CONFIG_TITLE.test(title)) return 'config'
  return 'code'
}
