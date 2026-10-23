import type { Zweisprachig } from '../../i18n/LanguageContext'
import type { SessionSetup, TaskCheck } from '../../claude/types'

/**
 * The Claude Code track as data. Unlike the other parts, its lessons are not written as TSX:
 * every lesson has the same split-screen shape - text and tasks on the left, the simulated
 * terminal on the right - so the page renders them from these blocks.
 *
 * Texts are bilingual and use the mini syntax of <Text> (`code`, **bold**, [[chapter-id]]).
 * Code exists once, in English.
 */

export type LessonBlock =
  | { type: 'heading'; text: Zweisprachig }
  | { type: 'text'; text: Zweisprachig }
  | { type: 'list'; items: Zweisprachig<string[]> }
  | { type: 'code'; language: 'bash' | 'markdown' | 'json' | 'text'; code: string; caption?: Zweisprachig }
  | { type: 'note'; tone: 'tip' | 'warning' | 'remember'; text: Zweisprachig }
  | { type: 'table'; head: Zweisprachig<string[]>; rows: Zweisprachig<string[][]> }

export type LessonTask = {
  /** Course-wide unique - stored in the solved exercises (`lernpfad-uebungen`). */
  id: string
  text: Zweisprachig
  /** What to type - the "insert" button puts it into the input line without running it. */
  command?: string
  check: TaskCheck
}

export type Lesson = {
  /** Sprachneutral, wie alle Kapitel-IDs: steht in der URL und im Fortschritt. */
  id: string
  title: Zweisprachig
  summary: Zweisprachig
  minutes: number
  goals: Zweisprachig<string[]>
  keywords: string[]
  /** Chapters this lesson builds on (the red thread) - links, not locks. */
  basics: string[]
  /** How the terminal starts for this lesson. */
  setup: SessionSetup
  blocks: LessonBlock[]
  tasks: LessonTask[]
}

export type Track = {
  id: string
  title: Zweisprachig
  shortTitle: Zweisprachig
  description: Zweisprachig
  lessons: Lesson[]
}
