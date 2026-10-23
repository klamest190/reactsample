import type { Zweisprachig } from '../../i18n/LanguageContext'
import type { SessionSetup, TaskCheck } from '../../claude/types'

/**
 * The content of the Claude Code lessons as data. Title, goals and keywords live in
 * course/parts/claude.ts like for every other part; prerequisites in GRUNDLAGEN (course.ts).
 *
 * Unlike the other parts, the lessons are not written as TSX: every lesson has the same
 * split-screen shape - text and tasks on the left, the simulated terminal on the right - so
 * ClaudeLesson.tsx renders them from these blocks.
 *
 * Texts are bilingual and use the mini syntax of <Text> (`code`, **bold**, [[chapter-id]]).
 * Code exists once, in English.
 */

export type LessonBlock =
  /** Starts a new section (an <h2> on the page). */
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

/** A multiple-choice question for <Quiz>. The answers have the same order in both languages. */
export type LessonQuestion = {
  question: Zweisprachig
  answers: Zweisprachig<string[]>
  /** Index of the right answer. */
  correct: number
  explanation: Zweisprachig
}

export type Lesson = {
  /** The chapter id in course/parts/claude.ts. */
  id: string
  /** How the terminal starts for this lesson. */
  setup: SessionSetup
  blocks: LessonBlock[]
  tasks: LessonTask[]
  quiz: LessonQuestion[]
  /** "The key points" at the end of the lesson. */
  keyPoints: Zweisprachig<string[]>
}
