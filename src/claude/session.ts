/**
 * CLAUDE CODE PART · A simulated Claude Code session
 *
 *   $ npm install -g @anthropic-ai/claude-code
 *   $ claude
 *   > explain this project
 *   > /compact focus on the toggle bug
 *   > create a skill for code reviews
 *
 * A state machine over four phases (see `Phase`): the shell, the login on first start, the REPL
 * and the permission dialog of the agentic loop. Every call returns a new session and the lines to
 * print - the input session is never changed, so React can keep it in state as it is.
 * Lessons check their tasks against `session.events` (tasks.ts).
 */

import { isSpecific, planPrompt, readStep, type Plan } from './agent'
import { CLEAR, runCommand } from './commands'
import { runPostToolUse, runPreToolUse } from './hooks'
import { mcpCli } from './mcp'
import { installPlugin, pluginCommand } from './plugins'
import type { ClaudeSession, Language, PermissionAnswer, PermissionMode, SessionSetup, TerminalLine, ToolStep } from './types'
import {
  BUGGY_TOGGLE,
  FIXED_TOGGLE,
  INJECTION_CONTENT,
  INJECTION_FILE,
  MEMORY_FILE,
  PRESET_AGENT,
  PROJECT_DIR,
  presetHooks,
  presetSkills,
  projectFiles,
} from './workspace'

export const VERSION = '2.1.300'
export const MODES: PermissionMode[] = ['default', 'acceptEdits', 'plan']
export { CLEAR }

export type Step = { session: ClaudeSession; lines: TerminalLine[] }

const out = (text: string): TerminalLine => ({ text, kind: 'output' })
const muted = (text: string): TerminalLine => ({ text, kind: 'muted' })
const result = (text: string): TerminalLine => ({ text, kind: 'result' })
const error = (text: string): TerminalLine => ({ text, kind: 'error' })
const hint = (text: string): TerminalLine => ({ text, kind: 'hint' })
const pick = (language: Language, de: string, en: string) => (language === 'de' ? de : en)

export function newSession(setup: SessionSetup): ClaudeSession {
  const prior = setup.priorMessages ?? 0
  const files = projectFiles()
  if (setup.withMemory) files['CLAUDE.md'] = MEMORY_FILE
  if (setup.withInjection) files[INJECTION_FILE] = INJECTION_CONTENT
  const session: ClaudeSession = {
    phase: setup.inRepl ? 'repl' : 'shell',
    installed: setup.installed,
    loggedIn: setup.loggedIn,
    mode: 'default',
    model: 'opus',
    contextTokens: prior * 1_800,
    messages: prior,
    costUsd: prior * 0.031,
    apiSeconds: prior * 9.5,
    linesAdded: prior * 4,
    linesRemoved: prior,
    filesInContext: prior ? ['src/App.tsx', 'src/components/TodoList.tsx'] : [],
    files,
    allowRules: [],
    denyRules: setup.protectEnv === false ? [] : ['Read(./.env)'],
    hooks: setup.withHooks ? presetHooks() : [],
    skills: presetSkills(setup.withProjectSkills ?? false).filter((s) => s.scope !== 'plugin'),
    agents: setup.withAgents ? [PRESET_AGENT] : [],
    mcpServers: [],
    marketplaces: [],
    plugins: [],
    branch: 'main',
    commits: [],
    checkpoints: [],
    queue: [],
    closing: [],
    history: [],
    events: [],
  }
  if (setup.withPlugins !== false) {
    session.marketplaces.push('company-plugins')
    installPlugin(session, 'team-tools')
  }
  return session
}

/** The lines a fresh terminal shows. */
export function welcome(session: ClaudeSession): TerminalLine[] {
  if (session.phase !== 'repl') return []
  return [
    { text: '✻ Welcome to Claude Code!', kind: 'title', boxed: true },
    { text: '', kind: 'output', boxed: true },
    { text: '  /help for help, /status for your current setup', kind: 'muted', boxed: true },
    { text: '', kind: 'output', boxed: true },
    { text: `  cwd: ${PROJECT_DIR}`, kind: 'muted', boxed: true },
  ]
}

/** Runs one line of input in whatever phase the session is. */
export function execute(current: ClaudeSession, input: string, language: Language): Step {
  const session = structuredClone(current)
  const lines: TerminalLine[] = []
  const line = input.trim()
  if (!line && session.phase !== 'login') return { session, lines }
  if (session.phase !== 'permission') session.history.push(line)

  switch (session.phase) {
    case 'shell':
      lines.push({ text: line, kind: 'input' })
      shell(session, line, language, lines)
      break
    case 'login':
      login(session, line, language, lines)
      break
    case 'repl':
      lines.push({ text: line, kind: 'prompt' })
      repl(session, line, language, lines)
      break
    case 'permission': {
      const answer = parseAnswer(line)
      if (answer) return answerPermission(session, answer, language)
      lines.push(hint(pick(language, 'Wähle 1 (Ja), 2 (Ja, nicht mehr fragen) oder 3 (Nein).', 'Choose 1 (Yes), 2 (Yes, don’t ask again) or 3 (No).')))
    }
  }
  return { session, lines }
}

function parseAnswer(line: string): PermissionAnswer | undefined {
  const l = line.toLowerCase()
  if (l === '1' || l === 'y' || l === 'yes' || l === 'j' || l === 'ja') return 'yes'
  if (l === '2') return 'always'
  if (l === '3' || l === 'n' || l === 'no' || l === 'nein' || l === 'esc') return 'no'
}

/** Splits a command line into words, keeping quoted parts together: `-p "a b"` -> ['-p', 'a b']. */
export function splitArgs(line: string) {
  return [...line.matchAll(/"([^"]*)"|“([^”]*)”|„([^“]*)“|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5])
}

// ---------------------------------------------------------------- shell

function shell(session: ClaudeSession, line: string, language: Language, lines: TerminalLine[]) {
  if (/^(sudo\s+)?npm (i|install) (-g|--global) @anthropic-ai\/claude-code(@latest)?$/.test(line)) {
    if (line.startsWith('sudo')) lines.push(hint(pick(language, 'Ohne sudo installieren - sonst gehören die Dateien root und Updates scheitern.', 'Install without sudo - otherwise root owns the files and updates fail.')))
    session.installed = true
    session.events.push({ type: 'installed', method: 'npm' })
    lines.push(out(''), out('added 3 packages in 4s'))
    return
  }
  if (/^curl -fsSL https:\/\/claude\.ai\/install\.sh \| bash/.test(line) || /^irm https:\/\/claude\.ai\/install\.ps1 \| iex$/.test(line)) {
    session.installed = true
    session.events.push({ type: 'installed', method: 'native' })
    lines.push(out('Setting up Claude Code...'), { text: '✔ Claude Code successfully installed!', kind: 'success' }, out(`  Version: ${VERSION}`), out('  Location: ~/.local/bin/claude'))
    return
  }
  const word = line.split(/\s+/)[0]
  if (word === 'claude' || line.includes('| claude')) {
    if (!session.installed) {
      lines.push(error('bash: claude: command not found'))
      lines.push(hint(pick(language, 'Claude Code ist noch nicht installiert.', 'Claude Code is not installed yet.')))
      return
    }
    claudeCli(session, line, language, lines)
    return
  }
  if (line === 'clear') lines.splice(0, lines.length, out(CLEAR))
  else if (line === 'pwd') lines.push(out(PROJECT_DIR))
  else if (line === 'ls' || line === 'ls -a') lines.push(out(Object.keys(session.files).filter((f) => !f.includes('/') && (line === 'ls -a' || !f.startsWith('.'))).concat('src').sort().join('  ')))
  else if (line.startsWith('cat ')) {
    const content = session.files[line.slice(4).trim()]
    if (content === undefined) lines.push(error(`cat: ${line.slice(4)}: No such file or directory`))
    else lines.push(...content.split('\n').map(out))
  } else if (/^node (-v|--version)$/.test(line)) lines.push(out('v22.12.0'))
  else lines.push(...shellOutput(session, line))
}

/** Output of the shell commands the project knows - used by `$` and by `!` inside Claude Code. */
function shellOutput(session: ClaudeSession, line: string): TerminalLine[] {
  if (line === 'npm test') {
    return session.files['src/hooks/useTodos.ts'].includes(BUGGY_TOGGLE)
      ? [error(' ✗ src/hooks/useTodos.test.ts > toggles only the clicked todo'), error(' Tests  1 failed (1)')]
      : [{ text: ' ✓ src/hooks/useTodos.test.ts (1 test)', kind: 'success' }, out(' Tests  1 passed (1)')]
  }
  if (line === 'git status') return [out(`On branch ${session.branch}`), out('Changes not staged for commit:'), out('  modified:   src/components/TodoList.tsx')]
  if (line === 'git branch') return ['main', ...(session.branch === 'main' ? [] : [session.branch])].map((b) => out(`${b === session.branch ? '*' : ' '} ${b}`))
  if (/^git log( --oneline)?$/.test(line)) return [...session.commits.map((c, i) => out(`${(0x3f2a1c9 + i).toString(16)} ${c}`)).reverse(), out('a81d0e2 Add todo list'), out('77c4b10 Initial commit')]
  if (line === 'ls') return [out('CLAUDE.md  README.md  package.json  src')]
  return [error(`bash: ${line.split(' ')[0]}: command not found`)]
}

/** `claude …` from the shell. */
function claudeCli(session: ClaudeSession, line: string, language: Language, lines: TerminalLine[]) {
  const piped = line.includes('| claude')
  const args = splitArgs(line.replace(/^.*?\bclaude\b\s*/, ''))
  const [first] = args
  if (first === '-v' || first === '--version') {
    session.events.push({ type: 'versionChecked' })
    lines.push(out(`${VERSION} (Claude Code)`))
    return
  }
  if (first === 'doctor') {
    session.events.push({ type: 'doctor' })
    lines.push(out('Diagnostics'), result(`Currently running: native (${VERSION})`), result('Path: ~/.local/bin/claude'), result('Auto-updates: enabled'), { text: '✔ No problems found', kind: 'success' })
    return
  }
  if (first === 'update') {
    lines.push(out(`Current version: ${VERSION}`), result('Claude Code is up to date'))
    return
  }
  if (first === 'mcp') {
    mcpCli(session, args.slice(1), lines)
    return
  }
  if (first === 'plugin') {
    // `claude plugin install x@y` and `claude plugin marketplace add …` do what /plugin does.
    pluginCommand(session, args.slice(1).join(' '), lines)
    return
  }
  if (args.includes('-p') || args.includes('--print')) {
    printMode(session, args, piped, language, lines)
    return
  }
  const resumed = first === '-c' || first === '--continue' || first === '-r' || first === '--resume'
  const prompt = !resumed && args.length === 1 && !first.startsWith('-') ? first : undefined
  if (args.length && !prompt && !resumed) {
    lines.push(error(`error: unknown option '${first}'`), muted("Run 'claude --help' for usage information."))
    return
  }
  if (!session.loggedIn) {
    session.phase = 'login'
    session.pendingPrompt = prompt
    lines.push(...loginMenu())
    return
  }
  start(session, resumed, prompt, language, lines)
}

/**
 * `claude -p "query" [--output-format json] [--allowedTools "Edit,Bash(npm test *)"]`.
 * Print mode cannot show a permission dialog: whatever is not allowed up front is denied.
 */
function printMode(session: ClaudeSession, args: string[], piped: boolean, language: Language, lines: TerminalLine[]) {
  if (!session.loggedIn) {
    lines.push(error('Invalid API key · Please run /login'))
    return
  }
  const value = (flag: string) => {
    const i = args.indexOf(flag)
    return i === -1 ? undefined : args[i + 1]
  }
  const prompt = value('-p') ?? value('--print') ?? ''
  const format = value('--output-format') === 'json' ? 'json' : 'text'
  const allowed = (value('--allowedTools') ?? value('--allowed-tools') ?? '').split(/[,\s]+(?![^(]*\))/).filter(Boolean)
  session.events.push({ type: 'headless', outputFormat: format, allowedTools: allowed.length > 0 })
  if (!prompt) {
    lines.push(error('Error: Input must be provided either through stdin or as a prompt argument when using --print'))
    return
  }
  const plan = planPrompt(session, piped ? `${prompt} (stdin attached)` : prompt, language)
  const isAllowed = (step: ToolStep) =>
    !needsPermission(session, step) ||
    allowed.some((rule) => rule === step.tool || (rule.startsWith('Bash(') && step.tool === 'Bash' && step.target.startsWith(rule.slice(5, -1).replace(/ ?\*$/, ''))))
  const blocked = plan.steps.find((step) => !isAllowed(step))
  let text: string
  if (blocked) {
    text = pick(language, `Ich bräuchte die Erlaubnis für ${blocked.tool}(${blocked.target}) - im Print-Modus kann ich nicht fragen.`, `I need permission for ${blocked.tool}(${blocked.target}) - print mode cannot ask.`)
  } else {
    // Everything allowed: the loop runs to the end without anyone watching.
    for (const step of plan.steps) applyStep(session, step, [])
    text = plan.closing.filter((l) => l.kind !== 'hint').map((l) => l.text).join('\n')
  }
  if (format === 'json') {
    lines.push(out(JSON.stringify({ result: text, session_id: '6f1c2a9e-4b7d-4e2a-9c3f-1d8e5a7b2c40', total_cost_usd: 0.0412 }, null, 2)))
    lines.push(muted('(shortened - the real result has more fields)'))
  } else lines.push(...text.split('\n').map(out))
  if (blocked) lines.push(hint(pick(language, `Vorab erlauben: claude -p "…" --allowedTools "${blocked.tool}"`, `Allow it up front: claude -p "…" --allowedTools "${blocked.tool}"`)))
}

function loginMenu(): TerminalLine[] {
  return [
    { text: 'Welcome to Claude Code', kind: 'title', boxed: true },
    { text: 'Select login method:', kind: 'output', boxed: true },
    { text: '  1. Claude account with subscription · Pro, Max, Team, or Enterprise', kind: 'output', boxed: true },
    { text: '  2. Anthropic Console account · API usage billing', kind: 'output', boxed: true },
    { text: "  3. 3rd-party platform · Amazon Bedrock, Microsoft Foundry, or Google Cloud's Agent Platform", kind: 'output', boxed: true },
  ]
}

function start(session: ClaudeSession, resumed: boolean, prompt: string | undefined, language: Language, lines: TerminalLine[]) {
  session.phase = 'repl'
  session.events.push({ type: 'started', resumed })
  if (!resumed) {
    session.contextTokens = 0
    session.messages = 0
    session.filesInContext = []
  }
  lines.push(...welcome(session))
  if (resumed) lines.push(muted(`Resumed conversation (${session.messages} messages)`))
  if (prompt) {
    lines.push({ text: prompt, kind: 'prompt' })
    repl(session, prompt, language, lines)
  }
}

function login(session: ClaudeSession, line: string, language: Language, lines: TerminalLine[]) {
  lines.push({ text: line, kind: 'input' })
  if (line !== '1' && line !== '2') {
    lines.push(hint(line === '3' ? pick(language, 'Cloud-Anbieter sind hier nicht simuliert - wähle 1 oder 2.', 'Cloud providers are not simulated here - choose 1 or 2.') : pick(language, 'Wähle 1 oder 2.', 'Choose 1 or 2.')))
    return
  }
  session.loggedIn = true
  session.events.push({ type: 'loggedIn', method: line === '1' ? 'subscription' : 'console' })
  lines.push(muted('Opening browser to sign in… (press c to copy the URL)'), { text: '✔ Login successful.', kind: 'success' })
  const prompt = session.pendingPrompt
  session.pendingPrompt = undefined
  start(session, false, prompt, language, lines)
}

// ---------------------------------------------------------------- REPL

const GO_AHEAD = /^(go ahead|proceed|do it|yes,? (do|go)|mach (es|das|weiter)|setz (es|das|den plan) um|umsetzen|los|leg los|ja,? (mach|los)|ok,? (mach|los))\b/i

function repl(session: ClaudeSession, line: string, language: Language, lines: TerminalLine[]) {
  if (line.startsWith('/')) {
    const [name, ...rest] = line.split(/\s+/)
    if (name === '/plugin') {
      session.events.push({ type: 'command', name: '/plugin', withArgs: rest.length > 0 })
      pluginCommand(session, rest.join(' '), lines)
      return
    }
    if (name === '/rewind') {
      rewind(session, language, lines)
      return
    }
    const plan = runCommand(session, line, language, lines)
    if (plan) runPlan(session, plan, line, lines, language)
    return
  }
  if (line.startsWith('!')) {
    const command = line.slice(1).trim()
    session.events.push({ type: 'bashMode' })
    lines.push(...shellOutput(session, command))
    session.contextTokens += 150
    return
  }
  session.events.push({ type: 'prompted', specific: isSpecific(line) })
  session.messages += 2
  session.contextTokens += Math.ceil(line.length / 4) + 350
  session.costUsd += 0.018
  session.apiSeconds += 6

  // "Go ahead" after a plan: carry out what was planned in plan mode.
  if (GO_AHEAD.test(line) && session.plannedPrompt) {
    if (session.mode === 'plan') {
      lines.push(hint(pick(language, 'Noch im Plan-Modus - erst mit Shift+Tab verlassen.', 'Still in plan mode - leave it with Shift+Tab first.')))
      return
    }
    const planned = session.plannedPrompt
    session.plannedPrompt = undefined
    session.events.push({ type: 'planExecuted' })
    runPlan(session, planPrompt(session, planned, language), planned, lines, language)
    return
  }

  // `@path` puts the file into the context before Claude even starts.
  const mentions = [...line.matchAll(/@([\w./-]+)/g)].map((m) => m[1])
  for (const path of mentions) {
    if (!(path in session.files)) {
      lines.push(error(`File not found: ${path}`))
      continue
    }
    const step = readStep(session, path)
    lines.push(result(`Read ${path} (${session.files[path].split('\n').length} lines)`))
    session.contextTokens += step.tokens
    if (!session.filesInContext.includes(path)) session.filesInContext.push(path)
    session.events.push({ type: 'fileMentioned', path })
  }
  const rest = line.replace(/@[\w./-]+/g, '').trim()
  if (mentions.length && rest.length < 3) {
    lines.push({ text: pick(language, 'Gelesen. Was soll ich mit der Datei machen?', 'Got it. What should I do with the file?'), kind: 'assistant' })
    return
  }
  runPlan(session, planPrompt(session, line, language), line, lines, language)
}

const MUTATING = new Set(['Edit', 'Write', 'Bash'])
const mutates = (step: ToolStep) => MUTATING.has(step.tool) || step.tool.startsWith('mcp__')

function runPlan(session: ClaudeSession, plan: Plan, prompt: string, lines: TerminalLine[], language: Language) {
  session.events.push(...(plan.events ?? []))
  // Plan mode: read what is needed, then present the changes as a plan instead of making them.
  if (session.mode === 'plan' && plan.steps.some(mutates)) {
    const reads = plan.steps.filter((step) => !mutates(step))
    const changes = plan.steps.filter(mutates)
    session.plannedPrompt = prompt
    session.events.push({ type: 'planned' })
    lines.push({ text: pick(language, 'Plan-Modus: Ich lese nur und ändere nichts.', 'Plan mode: I only read and change nothing.'), kind: 'assistant' })
    session.queue = reads
    session.closing = [
      { text: 'Plan:', kind: 'assistant' },
      ...changes.map((step, i) => ({ text: `${i + 1}. ${step.tool === 'Bash' ? 'Run' : step.tool} ${step.target}`, kind: 'assistant' as const })),
      { text: pick(language, 'Passt der Plan? Verlasse den Plan-Modus mit Shift+Tab und sag „mach weiter“.', 'Does the plan look right? Leave plan mode with Shift+Tab and say "go ahead".'), kind: 'assistant' },
    ]
    runQueue(session, lines)
    return
  }
  // Every prompt that will change files gets a checkpoint first - /rewind goes back to it.
  if (plan.steps.some((step) => step.writes)) {
    session.checkpoints.push({ prompt, files: { ...session.files } })
    session.checkpoints = session.checkpoints.slice(-100)
  }
  lines.push(...plan.intro)
  session.queue = plan.steps
  session.closing = plan.closing
  runQueue(session, lines)
}

/** `/rewind`: the menu of the real CLI, answered with "Restore code and conversation". */
function rewind(session: ClaudeSession, language: Language, lines: TerminalLine[]) {
  session.events.push({ type: 'command', name: '/rewind', withArgs: false })
  const checkpoint = session.checkpoints.pop()
  if (!checkpoint) {
    lines.push(muted(pick(language, 'Noch keine Checkpoints - es gab keinen Prompt, der Dateien geändert hat.', 'No checkpoints yet - no prompt has changed files.')))
    return
  }
  lines.push({ text: 'Rewind', kind: 'title', boxed: true })
  lines.push({ text: `  ❯ "${checkpoint.prompt}"`, kind: 'output', boxed: true })
  lines.push({ text: '  1. Restore code and conversation  2. Restore conversation  3. Restore code  4. Never mind', kind: 'muted', boxed: true })
  session.files = checkpoint.files
  session.messages = Math.max(0, session.messages - 2)
  session.events.push({ type: 'rewound' })
  lines.push(result(pick(language, `Code und Gespräch auf den Stand vor „${checkpoint.prompt}“ zurückgesetzt.`, `Restored code and conversation to before "${checkpoint.prompt}".`)))
}

/** A rule from "Yes, and don't ask again": `Bash(npm test *)` allows every command starting with `npm test`. */
export function ruleFor(step: ToolStep) {
  return step.tool === 'Bash' ? `Bash(${step.target.split(' ').slice(0, 2).join(' ')} *)` : `${step.tool.split('__').slice(0, 2).join('__')}__*`
}

function allowedByRule(session: ClaudeSession, step: ToolStep) {
  return session.allowRules.some((rule) => {
    if (step.tool.startsWith('mcp__')) return rule.endsWith('__*') && step.tool.startsWith(rule.slice(0, -1))
    const prefix = rule.match(/^Bash\((.+?)(?: \*)?\)$/)?.[1]
    return step.tool === 'Bash' && prefix !== undefined && step.target.startsWith(prefix)
  })
}

/** The deny rule that forbids this step, e.g. `Read(./.env)` for `Read(.env)`. */
function deniedBy(session: ClaudeSession, step: ToolStep) {
  return session.denyRules.find((rule) => {
    const [, tool, path] = rule.match(/^(\w+)\(\.?\/?(.+)\)$/) ?? []
    return (tool === step.tool || (tool === 'Read' && /^(Edit|Write)$/.test(step.tool))) && step.target.replace(/^\.\//, '') === path
  })
}

export function needsPermission(session: ClaudeSession, step: ToolStep) {
  if (step.tool === 'Bash' || step.tool.startsWith('mcp__')) return !allowedByRule(session, step)
  if (step.tool === 'Edit' || step.tool === 'Write') return session.mode !== 'acceptEdits'
  return false
}

/** Runs queued steps until one needs permission; then the session waits in phase `permission`. */
function runQueue(session: ClaudeSession, lines: TerminalLine[]) {
  while (session.queue.length) {
    const step = session.queue[0]
    // Hooks first, then the rules: a PreToolUse hook can stop a call before anything is asked.
    if (runPreToolUse(session, step, lines)) {
      stopLoop(session, lines, 'The hook blocked this - I will leave .env alone.')
      return
    }
    const rule = deniedBy(session, step)
    if (rule) {
      lines.push({ text: `${step.tool}(${step.target})`, kind: 'tool' })
      lines.push(error(`Permission to use ${step.tool} on ${step.target} has been denied by rule ${rule}`))
      session.events.push({ type: 'denied', rule })
      stopLoop(session, lines, 'That file is blocked by a deny rule in the settings, so I cannot read it.')
      return
    }
    if (needsPermission(session, step)) {
      session.phase = 'permission'
      lines.push(...permissionDialog(step))
      return
    }
    applyStep(session, step, lines)
    session.queue.shift()
  }
  lines.push(...session.closing)
  session.contextTokens += 60 * session.closing.length
  session.closing = []
  session.phase = 'repl'
}

function stopLoop(session: ClaudeSession, lines: TerminalLine[], message: string) {
  session.queue = []
  session.closing = []
  session.phase = 'repl'
  lines.push({ text: message, kind: 'assistant' })
}

function applyStep(session: ClaudeSession, step: ToolStep, lines: TerminalLine[]) {
  lines.push({ text: `${step.tool}(${step.target})`, kind: 'tool' })
  lines.push(...step.output)
  session.contextTokens += step.tokens
  session.apiSeconds += 2
  session.costUsd += step.tokens * 0.000003
  if (step.tool === 'Read' && !session.filesInContext.includes(step.target)) session.filesInContext.push(step.target)
  for (const [path, content] of Object.entries(step.writes ?? {})) {
    session.linesAdded += step.output.filter((l) => l.kind === 'added').length
    session.linesRemoved += step.output.filter((l) => l.kind === 'removed').length
    session.files[path] = content
  }
  const { skill, agent, hook, allowRule, denyRule, branch } = step
  if (skill) session.skills = [...session.skills.filter((s) => !(s.name === skill.name && s.scope === skill.scope)), skill]
  if (agent) session.agents = [...session.agents.filter((a) => a.name !== agent.name), agent]
  if (hook) session.hooks = [...session.hooks, hook]
  if (allowRule && !session.allowRules.includes(allowRule)) session.allowRules.push(allowRule)
  if (denyRule && !session.denyRules.includes(denyRule)) session.denyRules.push(denyRule)
  if (branch) session.branch = branch
  session.events.push(...(step.events ?? []))
  if (step.events?.some((e) => e.type === 'committed')) session.commits.push('Add todo filter')
  runPostToolUse(session, step, lines)
}

export function permissionDialog(step: ToolStep): TerminalLine[] {
  const box = (text: string, kind: TerminalLine['kind'] = 'output'): TerminalLine => ({ text, kind, boxed: true })
  const file = step.target.split('/').pop()
  if (step.tool === 'Bash' || step.tool.startsWith('mcp__')) {
    const mcp = step.tool.startsWith('mcp__')
    return [
      box(mcp ? `Tool use · ${step.tool}` : 'Bash command', 'title'),
      box(`  ${step.target}`),
      box(`  ${step.description ?? ''}`, 'muted'),
      box(''),
      box('Do you want to proceed?'),
      box('❯ 1. Yes'),
      box(mcp ? `  2. Yes, and don't ask again for ${step.tool.split('__')[1]} tools` : `  2. Yes, and don't ask again for ${step.target.split(' ').slice(0, 2).join(' ')} commands in ${PROJECT_DIR}`),
      box('  3. No, and tell Claude what to do differently (esc)'),
    ]
  }
  const create = step.tool === 'Write'
  return [
    box(create ? 'Create file' : 'Edit file', 'title'),
    box(step.target, 'muted'),
    ...step.output.filter((l) => l.kind === 'added' || l.kind === 'removed').map((l) => ({ ...l, boxed: true })),
    box(''),
    box(create ? `Do you want to create ${file}?` : `Do you want to make this edit to ${file}?`),
    box('❯ 1. Yes'),
    box('  2. Yes, allow all edits during this session (shift+tab)'),
    box('  3. No, and tell Claude what to do differently (esc)'),
  ]
}

/** The answer to the permission dialog - from typing 1/2/3 or clicking an option. */
export function answerPermission(current: ClaudeSession, answer: PermissionAnswer, language: Language): Step {
  const session = structuredClone(current)
  const lines: TerminalLine[] = []
  const step = session.queue[0]
  if (session.phase !== 'permission' || !step) return { session, lines }
  session.events.push({ type: 'permission', tool: step.tool, answer })

  if (answer === 'no') {
    session.queue = []
    session.closing = []
    session.phase = 'repl'
    lines.push(result(`User rejected ${step.tool}(${step.target})`))
    if (step.suspicious) {
      session.events.push({ type: 'injectionBlocked' })
      lines.push(hint(pick(language, 'Richtig: Der Befehl stammte aus einem versteckten Kommentar in der Datei, nicht von dir.', 'Right: the command came from a hidden comment in the file, not from you.')))
    } else lines.push(hint(pick(language, 'Claude wartet jetzt auf deine Korrektur - schreib, was es anders machen soll.', 'Claude now waits for your correction - tell it what to do differently.')))
    return { session, lines }
  }
  if (step.suspicious) lines.push(hint(pick(language, 'Vorsicht: Diesen Befehl hast nicht du verlangt - er stand versteckt in der gelesenen Datei.', 'Careful: you did not ask for this command - it was hidden in the file Claude read.')))
  if (answer === 'always') {
    if (step.tool === 'Bash' || step.tool.startsWith('mcp__')) {
      const rule = ruleFor(step)
      if (!session.allowRules.includes(rule)) session.allowRules.push(rule)
      lines.push(muted(`Added allow rule ${rule} to .claude/settings.local.json`))
    } else {
      session.mode = 'acceptEdits'
    }
  }
  applyStep(session, step, lines)
  session.queue.shift()
  runQueue(session, lines)
  return { session, lines }
}

/** Shift+Tab: default → accept edits → plan mode → default. */
export function cycleMode(current: ClaudeSession): ClaudeSession {
  const session = structuredClone(current)
  session.mode = MODES[(MODES.indexOf(session.mode) + 1) % MODES.length]
  session.events.push({ type: 'modeChanged', mode: session.mode })
  return session
}

/** For tests and the lesson texts: has Claude fixed the toggle bug? */
export function bugFixed(session: ClaudeSession) {
  return session.files['src/hooks/useTodos.ts'].includes(FIXED_TOGGLE)
}
