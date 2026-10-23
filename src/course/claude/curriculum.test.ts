import { describe, expect, it } from 'vitest'

import { answerPermission, cycleMode, execute, newSession } from '../../claude/session'
import { isSolved } from '../../claude/tasks'
import type { PermissionAnswer } from '../../claude/types'
import { alleKapitel } from '../course'
import { claudeTeil } from '../parts/claude'
import { lessonCompleted, lessons } from './curriculum'

/** What a learner does: type a line, answer a permission dialog or press Shift+Tab. */
type Action = string | { answer: PermissionAnswer } | 'shift+tab'

const yes = { answer: 'yes' } as const

/** One way through every lesson - all tasks must be solved at the end. */
const WALKTHROUGHS: Record<string, Action[]> = {
  'claude-setup': ['npm install -g @anthropic-ai/claude-code', 'claude --version', 'claude', '1', 'Explain this project', '/exit', 'claude -p "explain this project"'],
  'claude-commands': ['/help', '/cost', '/compact', '/compact focus on the toggle bug', '/clear', '/bug the spinner never stops'],
  'claude-context': ['/context', 'what does toggle in @src/hooks/useTodos.ts do?', '/init', yes, '/memory', 'What changed in git?', yes, yes],
  'claude-agent': [
    'Run the tests and fix the bug',
    { answer: 'no' },
    'Run the tests and fix the bug',
    { answer: 'always' },
    yes,
    '/permissions',
    'shift+tab',
    'shift+tab',
    '!npm test',
  ],
  'claude-skills': ['/skills', 'Please review the TodoList component', 'Create a skill for commit messages', yes, '/commit-messages', '/team-tools:release-notes', yes, 'Create a personal skill for explaining regex', yes],
}

function play(lessonId: string) {
  const lesson = lessons.find((l) => l.id === lessonId)!
  let session = newSession(lesson.setup)
  for (const action of WALKTHROUGHS[lessonId]) {
    if (action === 'shift+tab') session = cycleMode(session)
    else if (typeof action === 'string') session = execute(session, action, 'en').session
    else session = answerPermission(session, action.answer, 'en').session
  }
  return { lesson, session }
}

describe('Claude Code lessons', () => {
  const lessonIds = lessons.map((l) => l.id)
  const chapterIds = new Set(alleKapitel.map((k) => k.id))
  /** Every bilingual text of a lesson, for checks that look at all of them. */
  const texts = (lesson: (typeof lessons)[number]) =>
    JSON.stringify([lesson.blocks, lesson.tasks.map((t) => t.text), lesson.quiz, lesson.keyPoints])

  it.each(lessonIds)('%s can be solved in the simulation', (id) => {
    const { lesson, session } = play(id)
    const open = lesson.tasks.filter((task) => !isSolved(task.check, session.events)).map((task) => task.id)
    expect(open).toEqual([])
    expect(lessonCompleted(lesson, lesson.tasks.map((t) => t.id))).toBe(true)
  })

  it('have one lesson per chapter of part 10, in the same order', () => {
    expect(lessonIds).toEqual(claudeTeil.kapitel.map((k) => k.id))
  })

  it('have task ids that are unique and do not clash with chapter ids', () => {
    const taskIds = lessons.flatMap((l) => l.tasks.map((t) => t.id))
    expect(new Set(taskIds).size).toBe(taskIds.length)
    for (const id of taskIds) {
      expect(id).toMatch(/^claude-[a-z-]+$/)
      expect(chapterIds.has(id), id).toBe(false)
    }
  })

  it('have every list, table and quiz in both languages with the same shape', () => {
    for (const lesson of lessons) {
      for (const task of lesson.tasks) expect(task.text.de && task.text.en, task.id).toBeTruthy()
      for (const block of lesson.blocks) {
        if (block.type === 'list') expect(block.items.de, lesson.id).toHaveLength(block.items.en.length)
        if (block.type === 'table') {
          expect(block.rows.de, lesson.id).toHaveLength(block.rows.en.length)
          for (const row of [...block.rows.de, ...block.rows.en]) expect(row, lesson.id).toHaveLength(block.head.en.length)
        }
      }
      expect(lesson.keyPoints.de, lesson.id).toHaveLength(lesson.keyPoints.en.length)
    }
  })

  it('have quizzes whose right answer exists in both languages', () => {
    for (const lesson of lessons) {
      expect(lesson.quiz.length, lesson.id).toBeGreaterThanOrEqual(3)
      for (const q of lesson.quiz) {
        // The quiz stores answer indexes - both languages need the same answers in the same order.
        expect(q.answers.de, q.question.en).toHaveLength(q.answers.en.length)
        expect(q.correct, q.question.en).toBeLessThan(q.answers.en.length)
        expect(q.explanation.de && q.explanation.en, q.question.en).toBeTruthy()
      }
    }
  })

  it('only link to chapters that exist', () => {
    const broken = lessons.flatMap((l) => [...texts(l).matchAll(/\[\[([\w-]+)\]\]/g)].map((m) => m[1]).filter((id) => !chapterIds.has(id)))
    expect(broken).toEqual([])
  })

  it('counts a lesson as done only with all tasks solved', () => {
    const [first] = lessons
    expect(lessonCompleted(first, [])).toBe(false)
    expect(lessonCompleted(first, first.tasks.slice(1).map((t) => t.id))).toBe(false)
  })
})
