import { describe, expect, it } from 'vitest'

import { isSpecific } from './agent'
import { parseMcpAdd } from './mcp'
import { answerPermission, bugFixed, cycleMode, execute, newSession, splitArgs, type Step } from './session'
import type { ClaudeSession, PermissionAnswer, SessionSetup } from './types'
import { INJECTION_COMMAND } from './workspace'

/**
 * The simulator features of the advanced lessons: hooks, rules, prompt injection, plan mode,
 * checkpoints, git, MCP, plugins, subagents and print mode.
 */

const READY: SessionSetup = { installed: true, loggedIn: true, inRepl: true }
const SHELL: SessionSetup = { installed: true, loggedIn: true, inRepl: false }

function type(session: ClaudeSession, ...inputs: (string | { answer: PermissionAnswer })[]): Step {
  let step: Step = { session, lines: [] }
  for (const input of inputs) {
    const next = typeof input === 'string' ? execute(step.session, input, 'en') : answerPermission(step.session, input.answer, 'en')
    step = { session: next.session, lines: [...step.lines, ...next.lines] }
  }
  return step
}

const yes = { answer: 'yes' } as const
const no = { answer: 'no' } as const
const text = (step: Step) => step.lines.map((l) => l.text).join('\n')

describe('basics', () => {
  it('answers questions about tokens and the context window', () => {
    expect(type(newSession(READY), 'What is a token?').session.events).toContainEqual({ type: 'conceptExplained', topic: 'tokens' })
    expect(type(newSession(READY), 'Was ist das Kontextfenster?').session.events).toContainEqual({ type: 'conceptExplained', topic: 'context' })
  })

  it('switches the model with /model and rejects unknown ones', () => {
    expect(type(newSession(READY), '/model haiku').session.events).toContainEqual({ type: 'modelChanged', model: 'haiku' })
    expect(type(newSession(READY), '/model gpt').session.events.some((e) => e.type === 'modelChanged')).toBe(false)
  })

  it('asks back on vague prompts and recognizes specific ones', () => {
    expect(type(newSession(READY), 'make it better').session.events).toContainEqual({ type: 'clarified' })
    expect(isSpecific('Fix toggle in @src/hooks/useTodos.ts so only the clicked todo flips')).toBe(true)
    expect(isSpecific('fix it')).toBe(false)
  })
})

describe('plan mode and checkpoints', () => {
  it('plans in plan mode and carries the plan out after "go ahead"', () => {
    const planned = type(cycleMode(cycleMode(newSession(READY))), 'Run the tests and fix the bug')
    expect(planned.session.events).toContainEqual({ type: 'planned' })
    expect(text(planned)).toContain('Plan:')
    expect(bugFixed(planned.session)).toBe(false)

    const stillPlanning = type(planned.session, 'go ahead')
    expect(stillPlanning.session.events).not.toContainEqual({ type: 'planExecuted' })

    const done = type(cycleMode(planned.session), 'go ahead', yes, yes, yes)
    expect(done.session.events).toContainEqual({ type: 'planExecuted' })
    expect(bugFixed(done.session)).toBe(true)
  })

  it('rewinds the code to before the last prompt that changed files', () => {
    const fixed = type(newSession(READY), 'Run the tests and fix the bug', yes, yes, yes)
    expect(bugFixed(fixed.session)).toBe(true)
    const back = type(fixed.session, '/rewind')
    expect(back.session.events).toContainEqual({ type: 'rewound' })
    expect(bugFixed(back.session)).toBe(false)
    expect(text(type(back.session, '/rewind'))).toContain('No checkpoints yet')
  })
})

describe('git', () => {
  it('creates a branch, commits and opens a pull request', () => {
    const branch = type(newSession(READY), 'Create a branch for the todo filter', yes)
    expect(branch.session.branch).toBe('feature/todo-filter')
    const pr = type(branch.session, 'Commit and open a pull request', yes, yes)
    expect(pr.session.events).toEqual(expect.arrayContaining([{ type: 'committed' }, { type: 'prCreated' }]))
    expect(text(type(pr.session, '!git log --oneline'))).toContain('Add todo filter')
  })

  it('branches off main before opening a pull request', () => {
    const step = type(newSession(READY), 'open a pull request', yes, yes, yes)
    expect(step.session.events).toContainEqual({ type: 'branchCreated', name: 'feature/todo-filter' })
  })
})

describe('settings, hooks and security', () => {
  it('blocks .env with the default deny rule', () => {
    const step = type(newSession(READY), 'show me the .env file')
    expect(step.session.events).toContainEqual({ type: 'denied', rule: 'Read(./.env)' })
    expect(text(step)).not.toContain('sk-live')
  })

  it('leaks the secret without a rule - and adds the rule when asked', () => {
    const open = newSession({ ...READY, protectEnv: false })
    expect(type(open, 'show me the .env file').session.events).toContainEqual({ type: 'secretRead' })
    const ruled = type(open, 'Add a deny rule for .env to the settings', yes)
    expect(ruled.session.denyRules).toEqual(['Read(./.env)'])
    expect(ruled.session.files['.claude/settings.json']).toContain('"deny"')
    expect(type(ruled.session, 'show me the .env file').session.events).toContainEqual({ type: 'denied', rule: 'Read(./.env)' })
  })

  it('shows an allow rule from the team settings in /permissions', () => {
    const step = type(newSession(READY), 'Add a rule to the settings that allows npm run lint for the team', yes, '/permissions')
    expect(step.session.allowRules).toEqual(['Bash(npm run lint)'])
    expect(text(step)).toMatch(/Allow:\n\s+Bash\(npm run lint\)/)
  })

  it('runs a PreToolUse hook that blocks .env and a PostToolUse formatter', () => {
    const hooked = newSession({ ...READY, withHooks: true, protectEnv: false })
    expect(type(hooked, 'show me the .env file').session.events).toContainEqual({ type: 'hookRan', event: 'PreToolUse', blocked: true })
    const fixed = type(hooked, 'Run the tests and fix the bug', yes, yes, yes)
    expect(fixed.session.events).toContainEqual({ type: 'hookRan', event: 'PostToolUse', blocked: false })
    expect(text(fixed)).toContain('prettier formatted src/hooks/useTodos.ts')
    expect(text(type(hooked, '/hooks'))).toContain('PostToolUse')
  })

  it('writes a hook into the settings when asked', () => {
    const step = type(newSession(READY), 'Add a hook that formats every file after an edit', yes)
    expect(step.session.events).toContainEqual({ type: 'hookCreated', event: 'PostToolUse' })
    expect(JSON.parse(step.session.files['.claude/settings.json']).hooks.PostToolUse[0].matcher).toBe('Edit|Write')
  })

  it('flags commands hidden in a file and records the rejection', () => {
    const session = newSession({ ...READY, withInjection: true })
    const asked = type(session, 'Summarize docs/vendor-notes.md')
    expect(asked.session.queue[0]).toMatchObject({ target: INJECTION_COMMAND, suspicious: true })
    expect(type(asked.session, no).session.events).toContainEqual({ type: 'injectionBlocked' })
  })
})

describe('subagents', () => {
  it('sends Explore for broad searches and keeps the main context small', () => {
    const before = newSession(READY)
    const step = type(before, 'Find all places where todos are changed')
    expect(step.session.events).toContainEqual({ type: 'subagentUsed', agent: 'Explore' })
    expect(step.session.contextTokens - before.contextTokens).toBeLessThan(2_000)
  })

  it('creates a custom subagent and uses it by name', () => {
    const created = type(newSession(READY), 'Create a subagent for security reviews', yes)
    expect(created.session.files['.claude/agents/security-reviews.md']).toMatch(/^---\nname: security-reviews\n/)
    expect(type(created.session, 'Use the security-reviews agent to check the app').session.events).toContainEqual({ type: 'subagentUsed', agent: 'security-reviews' })
    expect(text(type(created.session, '/agents'))).toContain('security-reviews')
  })
})

describe('MCP', () => {
  it('parses claude mcp add for http and stdio servers', () => {
    expect(parseMcpAdd(['--transport', 'http', 'tracker', 'https://mcp.example.com/tracker'])).toEqual({ name: 'tracker', transport: 'http', target: 'https://mcp.example.com/tracker', scope: 'local' })
    expect(parseMcpAdd(['--scope', 'project', 'db', '--', 'npx', '-y', 'db-server'])).toMatchObject({ transport: 'stdio', target: 'npx -y db-server', scope: 'project' })
    expect(parseMcpAdd(['tracker'])).toEqual(expect.stringContaining('Usage'))
  })

  it('adds a server in the shell and lets Claude use its tool', () => {
    const added = type(newSession(SHELL), 'claude mcp add --transport http --scope project tracker https://mcp.example.com/tracker', 'claude mcp list')
    expect(added.session.events).toEqual(expect.arrayContaining([{ type: 'mcpAdded', name: 'tracker', scope: 'project' }, { type: 'mcpListed' }]))
    expect(JSON.parse(added.session.files['.mcp.json']).mcpServers.tracker.url).toBe('https://mcp.example.com/tracker')

    const asked = type(added.session, 'claude', 'Which issues are open?')
    expect(asked.session.queue[0].tool).toBe('mcp__tracker__list_issues')
    const always = type(asked.session, { answer: 'always' })
    expect(always.session.allowRules).toEqual(['mcp__tracker__*'])
    expect(always.session.events).toContainEqual({ type: 'mcpToolUsed', server: 'tracker' })
  })

  it('explains that it has no access without a server', () => {
    expect(text(type(newSession(READY), 'Which issues are open?'))).toContain('claude mcp add')
  })
})

describe('plugins', () => {
  it('needs the marketplace before the plugin, then namespaces its skills', () => {
    const bare = newSession({ ...READY, withPlugins: false })
    expect(text(type(bare, '/plugin install team-tools@company-plugins'))).toContain('Marketplace "company-plugins" not found')
    const step = type(bare, '/plugin marketplace add acme/company-plugins', '/plugin install team-tools@company-plugins')
    expect(step.session.events).toEqual(expect.arrayContaining([{ type: 'marketplaceAdded', name: 'company-plugins' }, { type: 'pluginInstalled', name: 'team-tools' }]))
    expect(type(step.session, '/team-tools:release-notes').session.events).toContainEqual({ type: 'skillInvoked', name: 'team-tools:release-notes', via: 'slash' })
  })
})

describe('print mode', () => {
  it('splits quoted arguments', () => {
    expect(splitArgs('-p "fix the bug" --allowedTools "Edit,Bash(npm test *)"')).toEqual(['-p', 'fix the bug', '--allowedTools', 'Edit,Bash(npm test *)'])
  })

  it('prints JSON with the documented fields', () => {
    const step = type(newSession(SHELL), 'claude -p "explain this project" --output-format json')
    expect(JSON.parse(step.lines[1].text)).toMatchObject({ result: expect.stringContaining('todo app'), session_id: expect.any(String), total_cost_usd: expect.any(Number) })
    expect(step.session.events).toContainEqual({ type: 'headless', outputFormat: 'json', allowedTools: false })
  })

  it('runs the whole loop when the tools are allowed up front', () => {
    const denied = type(newSession(SHELL), 'claude -p "fix the failing test"')
    expect(bugFixed(denied.session)).toBe(false)
    const allowed = type(newSession(SHELL), 'claude -p "fix the failing test" --allowedTools "Edit,Bash(npm test *)"')
    expect(bugFixed(allowed.session)).toBe(true)
    expect(allowed.session.events).toContainEqual({ type: 'headless', outputFormat: 'text', allowedTools: true })
  })
})
