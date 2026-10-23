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

import { planPrompt, readStep, type Plan } from './agent'
import { CLEAR, runCommand } from './commands'
import type { ClaudeSession, Language, PermissionAnswer, PermissionMode, SessionSetup, TerminalLine, ToolStep } from './types'
import { BUGGY_TOGGLE, FIXED_TOGGLE, MEMORY_FILE, PROJECT_DIR, presetSkills, projectFiles } from './workspace'

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
  return {
    phase: setup.inRepl ? 'repl' : 'shell',
    installed: setup.installed,
    loggedIn: setup.loggedIn,
    mode: 'default',
    model: 'sonnet',
    contextTokens: prior * 1_800,
    messages: prior,
    costUsd: prior * 0.031,
    apiSeconds: prior * 9.5,
    linesAdded: prior * 4,
    linesRemoved: prior,
    filesInContext: prior ? ['src/App.tsx', 'src/components/TodoList.tsx'] : [],
    files,
    allowRules: [],
    skills: presetSkills(setup.withProjectSkills ?? false),
    queue: [],
    closing: [],
    history: [],
    events: [],
  }
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
  else if (line === 'npm test' || line === 'git status') lines.push(...shellOutput(session, line))
  else lines.push(error(`bash: ${word}: command not found`))
}

/** Output of the shell commands the project knows - used by `$` and by `!` inside Claude Code. */
function shellOutput(session: ClaudeSession, line: string): TerminalLine[] {
  if (line === 'npm test') {
    return session.files['src/hooks/useTodos.ts'].includes(BUGGY_TOGGLE)
      ? [error(' ✗ src/hooks/useTodos.test.ts > toggles only the clicked todo'), error(' Tests  1 failed (1)')]
      : [{ text: ' ✓ src/hooks/useTodos.test.ts (1 test)', kind: 'success' }, out(' Tests  1 passed (1)')]
  }
  if (line === 'git status') return [out('On branch main'), out('Changes not staged for commit:'), out('  modified:   src/components/TodoList.tsx')]
  if (line === 'ls') return [out('CLAUDE.md  README.md  package.json  src')]
  return [error(`bash: ${line.split(' ')[0]}: command not found`)]
}

/** `claude …` from the shell. */
function claudeCli(session: ClaudeSession, line: string, language: Language, lines: TerminalLine[]) {
  const args = line.replace(/^.*?\bclaude\b\s*/, '')
  if (/^(-v|--version)$/.test(args)) {
    session.events.push({ type: 'versionChecked' })
    lines.push(out(`${VERSION} (Claude Code)`))
    return
  }
  if (args === 'doctor') {
    session.events.push({ type: 'doctor' })
    lines.push(out('Diagnostics'), result(`Currently running: native (${VERSION})`), result('Path: ~/.local/bin/claude'), result('Auto-updates: enabled'), { text: '✔ No problems found', kind: 'success' })
    return
  }
  if (args === 'update') {
    lines.push(out(`Current version: ${VERSION}`), result('Claude Code is up to date'))
    return
  }
  const print = args.match(/^(?:-c\s+)?(?:-p|--print)\s+["“„']?(.+?)["“”']?$/)
  if (print) {
    if (!session.loggedIn) {
      lines.push(error('Invalid API key · Please run /login'))
      return
    }
    session.events.push({ type: 'headless' })
    // Print mode answers and exits - it cannot show a permission dialog, so such a tool is denied.
    const plan = planPrompt(session, print[1], language)
    const blocked = plan.steps.find((step) => needsPermission(session, step))
    if (blocked) {
      lines.push(out(pick(language, `Ich bräuchte die Erlaubnis für ${blocked.tool}(${blocked.target}) - im Print-Modus kann ich nicht fragen.`, `I need permission for ${blocked.tool}(${blocked.target}) - print mode cannot ask.`)))
      lines.push(hint(pick(language, `Vorab erlauben: claude -p "…" --allowedTools "${blocked.tool}"`, `Allow it up front: claude -p "…" --allowedTools "${blocked.tool}"`)))
      return
    }
    lines.push(...plan.closing.map((l) => ({ text: l.text, kind: l.kind === 'hint' ? l.kind : ('output' as const) })))
    return
  }
  const prompt = args.match(/^["“„'](.+)["“”']$/)?.[1]
  const resumed = /^(-c|--continue|-r|--resume)\b/.test(args)
  if (args && !prompt && !resumed) {
    lines.push(error(`error: unknown option '${args.split(' ')[0]}'`), muted("Run 'claude --help' for usage information."))
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

function repl(session: ClaudeSession, line: string, language: Language, lines: TerminalLine[]) {
  if (line.startsWith('/')) {
    const plan = runCommand(session, line, language, lines)
    if (plan) runPlan(session, plan, lines)
    return
  }
  if (line.startsWith('!')) {
    const command = line.slice(1).trim()
    session.events.push({ type: 'bashMode' })
    lines.push(...shellOutput(session, command))
    session.contextTokens += 150
    return
  }
  session.events.push({ type: 'prompted' })
  session.messages += 2
  session.contextTokens += Math.ceil(line.length / 4) + 350
  session.costUsd += 0.018
  session.apiSeconds += 6

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
  runPlan(session, planPrompt(session, line, language), lines)
}

function runPlan(session: ClaudeSession, plan: Plan, lines: TerminalLine[]) {
  lines.push(...plan.intro)
  session.queue = plan.steps
  session.closing = plan.closing
  runQueue(session, lines)
}

const MUTATING = new Set(['Edit', 'Write', 'Bash'])

/** A rule from "Yes, and don't ask again": `Bash(npm test *)` allows every command starting with `npm test`. */
export function ruleFor(step: ToolStep) {
  return `Bash(${step.target.split(' ').slice(0, 2).join(' ')} *)`
}

function allowedByRule(session: ClaudeSession, command: string) {
  return session.allowRules.some((rule) => {
    const prefix = rule.match(/^Bash\((.+?)(?: \*)?\)$/)?.[1]
    return prefix !== undefined && command.startsWith(prefix)
  })
}

export function needsPermission(session: ClaudeSession, step: ToolStep) {
  if (step.tool === 'Bash') return !allowedByRule(session, step.target)
  if (step.tool === 'Edit' || step.tool === 'Write') return session.mode !== 'acceptEdits'
  return false
}

/** Runs queued steps until one needs permission; then the session waits in phase `permission`. */
function runQueue(session: ClaudeSession, lines: TerminalLine[]) {
  while (session.queue.length) {
    const step = session.queue[0]
    if (session.mode === 'plan' && MUTATING.has(step.tool)) {
      lines.push({ text: `⏸ Plan mode: skipped ${step.tool}(${step.target}) - shift+tab to leave plan mode and run it.`, kind: 'muted' })
      session.queue = []
      break
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
  if (step.skill) {
    const skill = step.skill
    session.skills = [...session.skills.filter((s) => !(s.name === skill.name && s.scope === skill.scope)), skill]
  }
  session.events.push(...(step.events ?? []))
}

export function permissionDialog(step: ToolStep): TerminalLine[] {
  const box = (text: string, kind: TerminalLine['kind'] = 'output'): TerminalLine => ({ text, kind, boxed: true })
  const file = step.target.split('/').pop()
  if (step.tool === 'Bash') {
    return [
      box('Bash command', 'title'),
      box(`  ${step.target}`),
      box(`  ${step.description ?? ''}`, 'muted'),
      box(''),
      box('Do you want to proceed?'),
      box('❯ 1. Yes'),
      box(`  2. Yes, and don't ask again for ${step.target.split(' ').slice(0, 2).join(' ')} commands in ${PROJECT_DIR}`),
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
    lines.push(hint(pick(language, 'Claude wartet jetzt auf deine Korrektur - schreib, was es anders machen soll.', 'Claude now waits for your correction - tell it what to do differently.')))
    return { session, lines }
  }
  if (answer === 'always') {
    if (step.tool === 'Bash') {
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
