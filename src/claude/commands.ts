import { readStep, runSkill, type Plan } from './agent'
import type { ClaudeSession, Language, TerminalLine } from './types'
import { MEMORY_FILE, PROJECT_DIR, skillCommand, skillPath } from './workspace'

/**
 * The slash commands of the simulation. Names, aliases and behaviour follow the Claude Code docs
 * (code.claude.com/docs/en/commands, checked 2026-10): `/cost` is an alias of `/usage`, `/clear`
 * has the aliases `/reset` and `/new`, `/bug` opens the bug report.
 */

/** Printed as the only line by /clear and `clear`: the terminal empties its output. */
export const CLEAR = '\u0000clear'
export const CONTEXT_WINDOW = 200_000
/** System prompt and tool definitions - in the context before the first prompt. */
export const BASE_TOKENS = { system: 3_100, tools: 11_800 }
export const MODEL = 'claude-sonnet-5-5'

type Command = { name: string; aliases?: string[]; args?: string; help: string }

export const COMMANDS: Command[] = [
  { name: '/help', help: 'Show help and available commands' },
  { name: '/compact', args: '[instructions]', help: 'Summarize the conversation to free up context' },
  { name: '/clear', aliases: ['/reset', '/new'], help: 'Start a new conversation with empty context' },
  { name: '/usage', aliases: ['/cost', '/stats'], help: 'Show session cost, plan limits and activity' },
  { name: '/context', help: 'Visualize current context usage' },
  { name: '/bug', args: '[report]', help: 'Report a bug to Anthropic' },
  { name: '/feedback', args: '[report]', help: 'Send product feedback' },
  { name: '/init', help: 'Create a CLAUDE.md for this project' },
  { name: '/memory', help: 'Edit CLAUDE.md memory files' },
  { name: '/permissions', help: 'View and edit allow, ask and deny rules' },
  { name: '/skills', help: 'List available skills' },
  { name: '/model', args: '[model]', help: 'Set the AI model' },
  { name: '/status', help: 'Show version, model, account and connectivity' },
  { name: '/add-dir', args: '<path>', help: 'Add a working directory' },
  { name: '/login', help: 'Sign in with your Anthropic account' },
  { name: '/logout', help: 'Sign out' },
  { name: '/exit', aliases: ['/quit'], help: 'Exit Claude Code' },
]

export function findCommand(typed: string) {
  return COMMANDS.find((c) => c.name === typed || c.aliases?.includes(typed))
}

/** Commands and skills starting with what has been typed - for the menu below the input. */
export function completions(session: ClaudeSession, typed: string) {
  const skills = session.skills.map((s) => ({ name: `/${skillCommand(s)}`, help: `${s.description} (${s.scope})` }))
  return [...COMMANDS, ...skills].filter((c) => c.name.startsWith(typed)).slice(0, 6)
}

const out = (text: string): TerminalLine => ({ text, kind: 'output' })
const muted = (text: string): TerminalLine => ({ text, kind: 'muted' })
const result = (text: string): TerminalLine => ({ text, kind: 'result' })
const pick = (language: Language, de: string, en: string) => (language === 'de' ? de : en)

export function skillTokens(session: ClaudeSession) {
  return session.skills.reduce((sum, s) => sum + 20 + s.description.length / 4, 0)
}

function memoryTokens(session: ClaudeSession) {
  return Math.round((session.files['CLAUDE.md']?.length ?? 0) / 4)
}

/** Everything in the window: base, memory, skill descriptions and the conversation. */
export function usedTokens(session: ClaudeSession) {
  return BASE_TOKENS.system + BASE_TOKENS.tools + memoryTokens(session) + Math.round(skillTokens(session)) + session.contextTokens
}

const k = (n: number) => `${(n / 1000).toFixed(1)}k`

function contextGrid(session: ClaudeSession): TerminalLine[] {
  const used = usedTokens(session)
  const parts = [
    ['System prompt', BASE_TOKENS.system],
    ['System tools', BASE_TOKENS.tools],
    ['Memory files', memoryTokens(session)],
    ['Skills', Math.round(skillTokens(session))],
    ['Messages', session.contextTokens],
  ] as const
  const cells = 20
  const filled = Math.max(1, Math.round((used / CONTEXT_WINDOW) * cells))
  return [
    out(`Context Usage  ${MODEL} · ${k(used)}/${k(CONTEXT_WINDOW)} tokens (${Math.round((used / CONTEXT_WINDOW) * 100)}%)`),
    out(`  ${'⛁ '.repeat(filled)}${'⛶ '.repeat(cells - filled)}`),
    ...parts.map(([label, n]) => out(`  ⛁ ${label}: ${k(n)} tokens (${((n / CONTEXT_WINDOW) * 100).toFixed(1)}%)`)),
    out(`  ⛶ Free space: ${k(CONTEXT_WINDOW - used)}`),
    ...(session.filesInContext.length ? [muted(`  Files read: ${session.filesInContext.join(', ')}`)] : []),
  ]
}

/**
 * Runs a slash command. Returns a plan when the command makes Claude work with tools
 * (`/init`, a skill) - the session then runs it like a prompt.
 */
export function runCommand(session: ClaudeSession, input: string, language: Language, lines: TerminalLine[]): Plan | void {
  const [typed, ...rest] = input.trim().split(/\s+/)
  const args = rest.join(' ')
  const command = findCommand(typed)
  const skill = session.skills.find((s) => `/${skillCommand(s)}` === typed)

  if (!command && skill) return runSkill(session, skill, 'slash', language)
  if (!command) {
    lines.push({ text: `Unknown command: ${typed}`, kind: 'error' })
    lines.push({ text: pick(language, '/help zeigt alle Befehle, /skills alle Skills.', '/help lists all commands, /skills all skills.'), kind: 'hint' })
    return
  }
  session.events.push({ type: 'command', name: command.name, withArgs: args.length > 0 })

  switch (command.name) {
    case '/help':
      lines.push(out('Claude Code - ask questions, edit files, run commands.'), out(''), out('Commands:'))
      for (const c of COMMANDS) lines.push(out(`  ${`${c.name}${c.args ? ` ${c.args}` : ''}`.padEnd(26)}${c.help}`))
      lines.push(out(''), muted('Shortcuts: ! shell mode · @ mention a file · shift+tab cycle permission modes · esc interrupt · ↑ history'))
      return
    case '/compact': {
      if (session.messages === 0) {
        lines.push({ text: 'Error: Not enough messages to compact.', kind: 'error' })
        return
      }
      const before = usedTokens(session)
      session.contextTokens = Math.round(1_200 + (args ? 300 : 0))
      session.messages = 1
      session.events.push({ type: 'compacted', withInstructions: args.length > 0 })
      lines.push(muted(args ? `Compacting conversation with instructions: "${args}"…` : 'Compacting conversation…'))
      lines.push(result(`Compacted. Context: ${k(before)} → ${k(usedTokens(session))} tokens (ctrl+o to see full summary)`))
      if (session.filesInContext.length) lines.push(result(`Re-read recently used files: ${session.filesInContext.slice(-5).join(', ')}`))
      return
    }
    case '/clear':
      session.contextTokens = 0
      session.messages = 0
      session.filesInContext = []
      lines.push({ text: CLEAR, kind: 'output' })
      return
    case '/usage': {
      const minutes = Math.floor(session.apiSeconds / 60)
      lines.push(
        out(`Total cost:            $${session.costUsd.toFixed(4)}`),
        out(`Total duration (API):  ${minutes}m ${Math.round(session.apiSeconds % 60)}s`),
        out(`Total code changes:    ${session.linesAdded} lines added, ${session.linesRemoved} lines removed`),
        out(`Usage by model:`),
        out(`  ${MODEL}:  ${k(session.contextTokens * 3 + 4_000)} input, ${k(session.messages * 450)} output`),
        muted(pick(language, 'Mit einem Pro- oder Max-Abo zählen die Plan-Limits, nicht die Dollar-Summe.', 'On a Pro or Max plan the plan limits count, not the dollar figure.')),
      )
      return
    }
    case '/context':
      lines.push(...contextGrid(session))
      return
    case '/bug':
    case '/feedback':
      lines.push(
        { text: command.name === '/bug' ? 'Submit a bug report' : 'Send feedback', kind: 'title', boxed: true },
        { text: args ? `Report: ${args}` : 'Describe the issue (what you did, what you expected, what happened)', kind: 'output', boxed: true },
        { text: 'The report includes the transcript of this session. Continue? (y/n)', kind: 'output', boxed: true },
        { text: pick(language, 'Simulation: Hier wird nichts verschickt.', 'Simulation: nothing is sent here.'), kind: 'hint' },
      )
      return
    case '/init':
      return {
        intro: [{ text: pick(language, 'Ich sehe mir das Projekt an und schreibe eine CLAUDE.md.', "I'll look at the project and write a CLAUDE.md."), kind: 'assistant' }],
        steps: [
          readStep(session, 'package.json'),
          readStep(session, 'README.md'),
          readStep(session, 'src/hooks/useTodos.ts'),
          {
            tool: 'Write',
            target: 'CLAUDE.md',
            output: [result(`Wrote ${MEMORY_FILE.split('\n').length} lines to CLAUDE.md`), ...MEMORY_FILE.split('\n').map((text) => ({ text, kind: 'added' as const }))],
            tokens: 400,
            writes: { 'CLAUDE.md': MEMORY_FILE },
            events: [{ type: 'toolUsed', tool: 'Write' }, { type: 'memoryCreated' }],
          },
        ],
        closing: [
          {
            text: pick(
              language,
              'CLAUDE.md liegt im Projekt und wird ab jetzt bei jedem Start geladen. Committe sie, damit das Team dieselben Regeln hat.',
              'CLAUDE.md is in the project and loads on every start from now on. Commit it so the team shares the same rules.',
            ),
            kind: 'assistant',
          },
        ],
      }
    case '/memory': {
      const project = 'CLAUDE.md' in session.files
      lines.push(
        out('Memory files'),
        out(`  User memory      ~/.claude/CLAUDE.md`),
        out(`  Project memory   ./CLAUDE.md ${project ? '' : '(not found - run /init)'}`),
        muted('Select a file to open it in your editor.'),
      )
      return
    }
    case '/permissions':
      lines.push(out('Permissions'), out('  Allow:'))
      if (session.allowRules.length === 0) lines.push(muted('    (none yet - "Yes, and don\'t ask again" adds rules here)'))
      for (const rule of session.allowRules) lines.push(out(`    ${rule}`))
      lines.push(out('  Deny:'), out('    Read(./.env)'), muted('  Rules are saved in .claude/settings.local.json'))
      return
    case '/skills':
      lines.push(out(`Skills (${session.skills.length})`))
      for (const s of session.skills) lines.push(out(`  /${skillCommand(s).padEnd(30)}${s.scope.padEnd(10)}${skillPath(s)}`))
      lines.push(muted('  Bundled skills such as /doctor, /code-review and /simplify ship with Claude Code.'))
      return
    case '/model':
      if (args) session.model = args
      lines.push(out(args ? `Set model to ${args}` : `Current model: ${session.model}  (aliases: opus, sonnet, haiku)`))
      return
    case '/status':
      lines.push(out('Version:  2.1.300 (simulated)'), out(`Model:    ${session.model}`), out('Account:  dev@example.com (Claude Pro)'), out(`cwd:      ${PROJECT_DIR}`))
      return
    case '/add-dir':
      lines.push(args ? result(`Added ${args} as a working directory`) : { text: 'Usage: /add-dir <path>', kind: 'error' })
      return
    case '/login':
      lines.push(result('Already logged in as dev@example.com'))
      return
    case '/logout':
      session.loggedIn = false
      session.phase = 'shell'
      lines.push(result('Successfully logged out from your Anthropic account.'))
      return
    case '/exit':
      session.phase = 'shell'
      session.events.push({ type: 'exited' })
      lines.push(muted('Goodbye!'))
      return
  }
}
