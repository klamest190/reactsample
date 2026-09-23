import type { HighlightMode } from './hervorheben'

/**
 * Die Editor-Modi und Sprachen an einer Stelle.
 *
 * Was ein neuer Modus braucht, wird hier eingetragen - Typen der Übungen, Playgrounds
 * und des Selbsttests, das Abzeichen im Editor, die Hervorhebung und das
 * Kommentarzeichen leiten sich davon ab. Die Editoren selbst (TryIt*.tsx) und die
 * Prüfungen im Selbsttest bleiben je Modus eigener Code.
 */

/** Alle Modi von <TryIt modus="…">. */
export const MODI = ['js', 'ts', 'react', 'test', 'java', 'spring', 'dockerfile', 'compose', 'sql'] as const
export type Modus = (typeof MODI)[number]

/** Übungen: der Test-Modus hat eine eigene Form (Varianten), die es nur im Kapitel gibt. */
export type UebungsModus = Exclude<Modus, 'test'>

/** Playgrounds: Docker übt man im Terminal und in den Editoren der Kapitel 8.8 bis 8.10. */
export type PlaygroundModus = Exclude<Modus, 'test' | 'dockerfile' | 'compose'>

/** Jede Sprache eines Editors: wie sie eingefärbt wird und womit ein Zeilenkommentar beginnt. */
export const EDITOR_SPRACHEN = {
  js: { hervorhebung: 'code', kommentar: '//' },
  ts: { hervorhebung: 'code', kommentar: '//' },
  react: { hervorhebung: 'code', kommentar: '//' },
  java: { hervorhebung: 'code', kommentar: '//' },
  spring: { hervorhebung: 'code', kommentar: '//' },
  docker: { hervorhebung: 'konfig', kommentar: '#' },
  yaml: { hervorhebung: 'konfig', kommentar: '#' },
  properties: { hervorhebung: 'konfig', kommentar: '#' },
  sql: { hervorhebung: 'sql', kommentar: '--' },
} as const satisfies Record<string, { hervorhebung: HighlightMode; kommentar: string }>

export type EditorSprache = keyof typeof EDITOR_SPRACHEN

/**
 * Die Arten der Editor-Hülle (Rahmen in TryIt.tsx): das Abzeichen oben rechts und die
 * Sprache des Editors. Eine Art ist feiner als ein Modus - React mit Typprüfung zeigt TSX.
 * Tailwind-Klassen als ganze Strings, damit der Scanner sie findet.
 */
export const ARTEN = {
  JavaScript: { text: 'JS', klassen: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', sprache: 'js' },
  Java: { text: 'JAVA', klassen: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300', sprache: 'java' },
  React: { text: 'JSX', klassen: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300', sprache: 'react' },
  TypeScript: { text: 'TSX', klassen: 'bg-blue-600 text-white dark:bg-blue-600', sprache: 'react' },
  TS: { text: 'TS', klassen: 'bg-blue-600 text-white dark:bg-blue-600', sprache: 'ts' },
  Test: { text: 'TEST', klassen: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', sprache: 'react' },
  Spring: { text: 'SPRING', klassen: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300', sprache: 'spring' },
  Docker: { text: 'DOCKERFILE', klassen: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300', sprache: 'docker' },
  Compose: { text: 'COMPOSE', klassen: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300', sprache: 'yaml' },
  SQL: { text: 'SQL', klassen: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300', sprache: 'sql' },
} as const satisfies Record<string, { text: string; klassen: string; sprache: EditorSprache }>

export type Art = keyof typeof ARTEN

/** Dateien, die kein Programmcode sind: `#`-Kommentare, Schlüssel, Anweisungen (Teil 8). */
const KONFIG_TITEL = /Dockerfile|\.dockerignore|\.ya?ml$|\.properties$|\.http$|\.env$|Terminal/i
/** SQL-Skripte und psql-Sitzungen (Teil 9). */
const SQL_TITEL = /\.sql$|^SQL\b|^psql\b/i

/** Hervorhebung eines statischen Codeblocks nach seinem Titel (Dateiname, „Terminal“, „SQL“ …). */
export function hervorhebungFuerTitel(titel?: string): HighlightMode {
  if (titel && SQL_TITEL.test(titel)) return 'sql'
  if (titel && KONFIG_TITEL.test(titel)) return 'konfig'
  return 'code'
}
