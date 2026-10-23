import { describe, expect, it } from 'vitest'

import { answerPermission, cycleMode, execute, newSession } from '../../claude/session'
import { isSolved } from '../../claude/tasks'
import type { PermissionAnswer } from '../../claude/types'
import { alleKapitel } from '../course'
import { claudeTrack, lessonCompleted } from './curriculum'

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
  const lesson = claudeTrack.lessons.find((l) => l.id === lessonId)!
  let session = newSession(lesson.setup)
  for (const action of WALKTHROUGHS[lessonId]) {
    if (action === 'shift+tab') session = cycleMode(session)
    else if (typeof action === 'string') session = execute(session, action, 'en').session
    else session = answerPermission(session, action.answer, 'en').session
  }
  return { lesson, session }
}

describe('Claude Code track', () => {
  const lessons = claudeTrack.lessons
  const lessonIds = lessons.map((l) => l.id)

  it.each(lessonIds)('%s can be solved in the simulation', (id) => {
    const { lesson, session } = play(id)
    const open = lesson.tasks.filter((task) => !isSolved(task.check, session.events)).map((task) => task.id)
    expect(open).toEqual([])
    expect(lessonCompleted(lesson, lesson.tasks.map((t) => t.id))).toBe(true)
  })

  it('has unique lesson and task ids that do not clash with the course', () => {
    const taskIds = lessons.flatMap((l) => l.tasks.map((t) => t.id))
    const all = [...lessonIds, ...taskIds, ...alleKapitel.map((k) => k.id)]
    expect(new Set(all).size).toBe(all.length)
    for (const id of taskIds) expect(id).toMatch(/^claude-[a-z-]+$/)
  })

  it('only builds on chapters and lessons that exist', () => {
    const known = new Set([...lessonIds, ...alleKapitel.map((k) => k.id)])
    for (const lesson of lessons) for (const basic of lesson.basics) expect(known, `${lesson.id} -> ${basic}`).toContain(basic)
  })

  it('has every text in both languages', () => {
    for (const lesson of lessons) {
      expect(lesson.goals.de).toHaveLength(lesson.goals.en.length)
      for (const task of lesson.tasks) expect(task.text.de && task.text.en, task.id).toBeTruthy()
      for (const block of lesson.blocks) {
        if (block.type === 'list') expect(block.items.de, lesson.id).toHaveLength(block.items.en.length)
        if (block.type === 'table') {
          expect(block.rows.de, lesson.id).toHaveLength(block.rows.en.length)
          for (const row of [...block.rows.de, ...block.rows.en]) expect(row, lesson.id).toHaveLength(block.head.en.length)
        }
      }
    }
  })

  it('counts a lesson as done only with all tasks solved', () => {
    const [first] = lessons
    expect(lessonCompleted(first, [])).toBe(false)
    expect(lessonCompleted(first, first.tasks.slice(1).map((t) => t.id))).toBe(false)
  })
})
