import { describe, expect, it } from 'vitest'

import { answerPermission, cycleMode, execute, newSession } from '../../claude/session'
import { isSolved } from '../../claude/tasks'
import type { PermissionAnswer } from '../../claude/types'
import { alleKapitel } from '../course'
import { claudeTeil } from '../parts/claude'
import { claudeAdvancedTeil } from '../parts/claudeAdvanced'
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
  'claude-basics': ['What is a token?', 'What is the context window?', '/context', '/model', '/model haiku', 'What are hallucinations?'],
  'claude-prompting': ['make it better', 'Explain what toggle does in @src/hooks/useTodos.ts, step by step', 'shift+tab', 'shift+tab', 'Run the tests and fix the bug', 'shift+tab', 'go ahead', yes, yes, yes, '/clear'],
  'claude-git': ['What changed in git?', yes, yes, 'Create a branch for the todo filter', yes, 'Run the tests and fix the bug', yes, yes, yes, '/rewind', 'Commit and open a pull request', yes, yes, '!git log --oneline'],
  'claude-settings': ['/config', '/status', '/model sonnet', 'Add a rule to the settings that allows npm run lint for the team', yes, '/permissions'],
  'claude-hooks': ['/hooks', 'show me the .env file', 'Run the tests and fix the bug', yes, yes, yes, 'Add a hook that sends a notification when Claude needs input', yes],
  'claude-subagents': ['Find all places where todos are changed', '/context', 'Create a subagent for security reviews', yes, 'Use the security-reviews agent to check the app', '/agents'],
  'claude-mcp': [
    'claude mcp add --transport http tracker https://mcp.example.com/tracker',
    'claude mcp add --transport http --scope project tracker https://mcp.example.com/tracker',
    'claude mcp list',
    'claude',
    'Which issues are open?',
    yes,
    'Which issues are open?',
    { answer: 'always' },
    '/mcp',
  ],
  'claude-plugins': ['/plugin', '/plugin marketplace add acme/company-plugins', '/plugin install team-tools@company-plugins', '/skills', '/team-tools:release-notes', yes],
  'claude-headless': [
    'claude -p "explain this project"',
    'claude -p "explain this project" --output-format json',
    'cat package.json | claude -p "explain this project"',
    'claude -p "fix the failing test"',
    'claude -p "fix the failing test" --allowedTools "Edit,Bash(npm test *)"',
    'claude -p "fix the failing test" --allowedTools "Edit,Bash(npm test *)" --output-format json',
  ],
  'claude-security': ['/permissions', 'show me the .env file', 'Add a deny rule for .env to the settings', yes, 'show me the .env file', 'Summarize docs/vendor-notes.md', { answer: 'no' }],
  'claude-project': [
    'Explain this project',
    'Run the tests and fix the bug',
    yes,
    yes,
    yes,
    'Create a branch for the todo filter',
    yes,
    'shift+tab',
    'shift+tab',
    'Add a filter feature to the todo list',
    'shift+tab',
    'go ahead',
    yes,
    yes,
    yes,
    'Commit and open a pull request',
    yes,
    yes,
    'Create a skill for new features',
    yes,
  ],
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

  it('have one lesson per chapter of parts 10 and 11, in the same order', () => {
    expect(lessonIds).toEqual([...claudeTeil.kapitel, ...claudeAdvancedTeil.kapitel].map((k) => k.id))
    expect(Object.keys(WALKTHROUGHS).sort()).toEqual([...lessonIds].sort())
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

  it('have JSON examples that parse - learners copy them into their settings', () => {
    for (const lesson of lessons)
      for (const block of lesson.blocks) if (block.type === 'code' && block.language === 'json') expect(() => JSON.parse(block.code), `${lesson.id}: ${block.code.slice(0, 40)}`).not.toThrow()
  })

  it('counts a lesson as done only with all tasks solved', () => {
    const [first] = lessons
    expect(lessonCompleted(first, [])).toBe(false)
    expect(lessonCompleted(first, first.tasks.slice(1).map((t) => t.id))).toBe(false)
  })
})
