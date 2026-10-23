import { describe, expect, it } from 'vitest'

import { skillFromPrompt, slug } from './agent'
import { usedTokens } from './commands'
import { answerPermission, bugFixed, CLEAR, cycleMode, execute, newSession, type Step } from './session'
import { isSolved, matches } from './tasks'
import type { ClaudeSession, PermissionAnswer, SessionSetup } from './types'

const FRESH: SessionSetup = { installed: false, loggedIn: false, inRepl: false }
const READY: SessionSetup = { installed: true, loggedIn: true, inRepl: true }

/** Types several inputs one after another, like a learner would. */
function type(session: ClaudeSession, ...inputs: string[]): Step {
  let step: Step = { session, lines: [] }
  for (const input of inputs) {
    const next = execute(step.session, input, 'en')
    step = { session: next.session, lines: [...step.lines, ...next.lines] }
  }
  return step
}

function answer(session: ClaudeSession, ...answers: PermissionAnswer[]): Step {
  let step: Step = { session, lines: [] }
  for (const a of answers) {
    const next = answerPermission(step.session, a, 'en')
    step = { session: next.session, lines: [...step.lines, ...next.lines] }
  }
  return step
}

const text = (step: Step) => step.lines.map((l) => l.text).join('\n')

describe('setup and login', () => {
  it('knows no claude command before the installation', () => {
    const step = type(newSession(FRESH), 'claude --version')
    expect(text(step)).toContain('command not found')
    expect(step.session.events).toEqual([])
  })

  it('installs with npm or the native installer', () => {
    expect(type(newSession(FRESH), 'npm install -g @anthropic-ai/claude-code').session.events).toEqual([{ type: 'installed', method: 'npm' }])
    expect(type(newSession(FRESH), 'curl -fsSL https://claude.ai/install.sh | bash').session.events).toEqual([{ type: 'installed', method: 'native' }])
    expect(type(newSession(FRESH), 'irm https://claude.ai/install.ps1 | iex').session.installed).toBe(true)
  })

  it('warns about sudo but still installs', () => {
    const step = type(newSession(FRESH), 'sudo npm i -g @anthropic-ai/claude-code')
    expect(step.session.installed).toBe(true)
    expect(step.lines.some((l) => l.kind === 'hint')).toBe(true)
  })

  it('asks for the login method on the first start, then opens the REPL', () => {
    const installed = type(newSession(FRESH), 'npm i -g @anthropic-ai/claude-code', 'claude --version', 'claude')
    expect(installed.session.phase).toBe('login')
    const step = type(installed.session, '4', '1')
    expect(step.session.phase).toBe('repl')
    expect(text(step)).toContain('Welcome to Claude Code')
    expect(step.session.events).toContainEqual({ type: 'loggedIn', method: 'subscription' })
    expect(step.session.events).toContainEqual({ type: 'versionChecked' })
  })

  it('runs the prompt of `claude "query"` once the login is through', () => {
    const step = type(newSession({ ...FRESH, installed: true }), 'claude "explain this project"', '2')
    expect(step.session.events).toContainEqual({ type: 'prompted' })
    expect(text(step)).toContain('Read(package.json)')
  })

  it('answers in print mode without a REPL and exits', () => {
    const step = type(newSession({ ...READY, inRepl: false }), 'claude -p "explain this project"')
    expect(step.session.phase).toBe('shell')
    expect(step.session.events).toContainEqual({ type: 'headless' })
    expect(text(step)).toContain('todo app')
  })

  it('cannot ask for permission in print mode', () => {
    const step = type(newSession({ ...READY, inRepl: false }), 'claude -p "fix the failing test"')
    expect(text(step)).toContain('--allowedTools')
    expect(bugFixed(step.session)).toBe(false)
  })

  it('leaves Claude Code with /exit', () => {
    const step = type(newSession(READY), '/exit')
    expect(step.session.phase).toBe('shell')
    expect(step.session.events).toContainEqual({ type: 'exited' })
  })
})

describe('slash commands', () => {
  const talked = newSession({ ...READY, priorMessages: 12 })

  it('refuses to compact an empty conversation', () => {
    const step = type(newSession(READY), '/compact')
    expect(step.lines.some((l) => l.kind === 'error')).toBe(true)
    expect(step.session.events.some((e) => e.type === 'compacted')).toBe(false)
  })

  it('compacts the conversation and frees context', () => {
    const step = type(talked, '/compact focus on the toggle bug')
    expect(usedTokens(step.session)).toBeLessThan(usedTokens(talked))
    expect(step.session.events).toContainEqual({ type: 'compacted', withInstructions: true })
    expect(step.session.events).toContainEqual({ type: 'command', name: '/compact', withArgs: true })
  })

  it('reports aliases under their canonical name', () => {
    expect(type(talked, '/cost').session.events).toEqual([{ type: 'command', name: '/usage', withArgs: false }])
    expect(type(talked, '/reset').session.events).toEqual([{ type: 'command', name: '/clear', withArgs: false }])
  })

  it('clears the screen and the context with /clear', () => {
    const step = type(talked, '/clear')
    expect(step.lines.map((l) => l.text)).toContain(CLEAR)
    expect(step.session.contextTokens).toBe(0)
  })

  it('rejects unknown commands with a hint', () => {
    const step = type(talked, '/compakt')
    expect(text(step)).toContain('Unknown command: /compakt')
    expect(step.session.events).toEqual([])
  })

  it('writes a CLAUDE.md with /init after asking', () => {
    const asked = type(newSession(READY), '/init')
    expect(asked.session.phase).toBe('permission')
    const step = answer(asked.session, 'yes')
    expect(step.session.files['CLAUDE.md']).toContain('npm test')
    expect(step.session.events).toContainEqual({ type: 'memoryCreated' })
  })

  it('does not change the session it was given', () => {
    const before = structuredClone(talked)
    type(talked, '/compact', '/clear', 'fix the test')
    expect(talked).toEqual(before)
  })
})

describe('context', () => {
  it('reads files mentioned with @ into the context', () => {
    const step = type(newSession(READY), '@src/App.tsx')
    expect(step.session.filesInContext).toEqual(['src/App.tsx'])
    expect(step.session.events).toContainEqual({ type: 'fileMentioned', path: 'src/App.tsx' })
  })

  it('reports mentions of missing files', () => {
    const step = type(newSession(READY), 'what does @src/Missing.tsx do?')
    expect(text(step)).toContain('File not found: src/Missing.tsx')
  })

  it('inspects git when asked what changed', () => {
    const step = type(newSession(READY), 'what changed in git?')
    expect(step.session.phase).toBe('permission')
    expect(answer(step.session, 'yes', 'yes').session.events).toContainEqual({ type: 'gitInspected' })
  })

  it('runs shell commands after ! without Claude', () => {
    const step = type(newSession(READY), '!npm test')
    expect(step.session.events).toEqual([{ type: 'bashMode' }])
    expect(text(step)).toContain('1 failed')
  })
})

describe('agentic loop', () => {
  const fix = 'run the tests and fix the bug'

  it('stops at every tool that needs permission', () => {
    const step = type(newSession(READY), fix)
    expect(step.session.phase).toBe('permission')
    expect(step.session.queue[0]).toMatchObject({ tool: 'Bash', target: 'npm test' })
    expect(text(step)).toContain("Yes, and don't ask again for npm test commands")
  })

  it('remembers "don\'t ask again" as an allow rule', () => {
    const asked = type(newSession(READY), fix)
    const atEdit = answer(asked.session, 'always')
    expect(atEdit.session.allowRules).toEqual(['Bash(npm test *)'])
    expect(atEdit.session.queue[0].tool).toBe('Edit')
    // The second `npm test` runs without asking - the rule covers it.
    const done = answer(atEdit.session, 'yes')
    expect(done.session.phase).toBe('repl')
    expect(bugFixed(done.session)).toBe(true)
    expect(done.session.linesAdded).toBeGreaterThan(0)
  })

  it('stops the loop when a tool is rejected', () => {
    const step = answer(type(newSession(READY), fix).session, 'no')
    expect(step.session.phase).toBe('repl')
    expect(step.session.queue).toEqual([])
    expect(step.session.events).toContainEqual({ type: 'permission', tool: 'Bash', answer: 'no' })
    expect(bugFixed(step.session)).toBe(false)
  })

  it('edits without asking in accept-edits mode', () => {
    const session = cycleMode(newSession(READY))
    expect(session.mode).toBe('acceptEdits')
    const step = answer(type(session, fix).session, 'yes', 'yes')
    expect(step.session.events.filter((e) => e.type === 'permission')).toHaveLength(2)
    expect(bugFixed(step.session)).toBe(true)
  })

  it('only reads and plans in plan mode', () => {
    const session = cycleMode(cycleMode(newSession(READY)))
    expect(session.mode).toBe('plan')
    const step = type(session, fix)
    expect(step.session.phase).toBe('repl')
    expect(text(step)).toContain('Plan:')
    expect(bugFixed(step.session)).toBe(false)
    expect(cycleMode(session).mode).toBe('default')
  })
})

describe('skills', () => {
  it('derives the skill name from the prompt', () => {
    expect(skillFromPrompt('Erstelle einen Skill für Code-Reviews')).toEqual({ name: 'code-reviews', topic: 'Code-Reviews', scope: 'project' })
    expect(skillFromPrompt('create a personal skill for commit messages')).toMatchObject({ name: 'commit-messages', scope: 'personal' })
    expect(skillFromPrompt('create a skill')).toMatchObject({ name: 'my-workflow' })
    expect(skillFromPrompt('Create a project skill for commit messages. Use Conventional Commits, max 72 characters')).toMatchObject({ name: 'commit-messages' })
    expect(slug('Über Größe!')).toBe('ueber-groesse')
  })

  it('writes a project skill after asking and calls it by name', () => {
    const asked = type(newSession(READY), 'Erstelle einen Skill für Code-Reviews')
    expect(asked.session.phase).toBe('permission')
    const created = answer(asked.session, 'yes')
    const file = created.session.files['.claude/skills/code-reviews/SKILL.md']
    expect(file).toMatch(/^---\nname: code-reviews\ndescription: .+\n---/)
    expect(created.session.events).toContainEqual({ type: 'skillCreated', name: 'code-reviews', scope: 'project' })

    const called = type(created.session, '/code-reviews')
    expect(called.session.events).toContainEqual({ type: 'skillInvoked', name: 'code-reviews', via: 'slash' })
  })

  it('keeps personal skills out of the project', () => {
    const step = answer(type(newSession(READY), 'create a personal skill for commit messages').session, 'yes')
    expect(Object.keys(step.session.files).some((f) => f.includes('commit-messages'))).toBe(false)
    expect(step.session.skills.find((s) => s.name === 'commit-messages')?.scope).toBe('personal')
  })

  it('lets Claude load a skill when the prompt matches its description', () => {
    const step = type(newSession({ ...READY, withProjectSkills: true }), 'please review the TodoList component')
    expect(step.session.events).toContainEqual({ type: 'skillInvoked', name: 'component-review', via: 'model' })
  })

  it('calls plugin skills with their namespace', () => {
    const step = type(newSession(READY), '/team-tools:release-notes')
    expect(step.session.events).toContainEqual({ type: 'skillInvoked', name: 'team-tools:release-notes', via: 'slash' })
    expect(type(newSession(READY), '/release-notes').session.events).toEqual([])
  })

  it('lists skills with their scope', () => {
    expect(text(type(newSession({ ...READY, withProjectSkills: true }), '/skills'))).toMatch(/component-review\s+project/)
  })
})

describe('tasks', () => {
  it('matches events by type and the given fields only', () => {
    const event = { type: 'command', name: '/compact', withArgs: true } as const
    expect(matches({ type: 'command', name: '/compact' }, event)).toBe(true)
    expect(matches({ type: 'command', name: '/compact', withArgs: false }, event)).toBe(false)
    expect(matches({ type: 'compacted' }, event)).toBe(false)
    expect(isSolved({ type: 'command' }, [event])).toBe(true)
    expect(isSolved({ type: 'command' }, [])).toBe(false)
  })
})
