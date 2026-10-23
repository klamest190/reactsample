import type { ClaudeSession, Hook, HookEvent, SessionEvent, TerminalLine, ToolStep } from './types'

/**
 * Hooks of the simulation. Real hooks are shell commands that get the tool call as JSON on stdin;
 * here their effect is derived from the command: a formatter reports success after an edit, a
 * guard script blocks every tool call that touches .env (exit code 2).
 */

const result = (text: string): TerminalLine => ({ text, kind: 'result' })

export function matchesTool(hook: Hook, tool: string) {
  if (!hook.matcher || hook.matcher === '*') return true
  return hook.matcher.split('|').some((part) => part === tool)
}

const isGuard = (hook: Hook) => /protect-env|\.env/.test(hook.command)
const isFormatter = (hook: Hook) => /prettier|eslint --fix|biome format/.test(hook.command)

/**
 * PreToolUse: runs before the step. Returns the hook that blocked it, if any - the step is then
 * not executed and Claude gets the hook's message instead.
 */
export function runPreToolUse(session: ClaudeSession, step: ToolStep, lines: TerminalLine[]): Hook | undefined {
  for (const hook of session.hooks) {
    if (hook.event !== 'PreToolUse' || !matchesTool(hook, step.tool)) continue
    const blocked = isGuard(hook) && step.target.includes('.env')
    session.events.push({ type: 'hookRan', event: 'PreToolUse', blocked })
    if (blocked) {
      lines.push({ text: `${step.tool}(${step.target})`, kind: 'tool' })
      lines.push({ text: `PreToolUse:${step.tool} hook blocked the call (exit code 2)`, kind: 'error' })
      lines.push(result('protect-env.sh: .env contains secrets and must not be touched'))
      return hook
    }
  }
}

/** PostToolUse: runs after a step that went through. */
export function runPostToolUse(session: ClaudeSession, step: ToolStep, lines: TerminalLine[]) {
  for (const hook of session.hooks) {
    if (hook.event !== 'PostToolUse' || !matchesTool(hook, step.tool)) continue
    session.events.push({ type: 'hookRan', event: 'PostToolUse', blocked: false })
    lines.push(result(isFormatter(hook) ? `PostToolUse:${step.tool} hook: prettier formatted ${step.target}` : `PostToolUse:${step.tool} hook completed`))
  }
}

/** The hook Claude writes when asked for one - picked from the prompt. */
export function hookFromPrompt(prompt: string): Hook {
  const p = prompt.toLowerCase()
  if (/\.env|secret|geheim|block|schütz|schuetz|protect|verbiet|prevent/.test(p))
    return { event: 'PreToolUse', matcher: 'Read|Edit|Write', command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/protect-env.sh' }
  if (/notif|benachrichtig|meld|ping|sound/.test(p)) return { event: 'Notification', command: 'notify-send "Claude Code" "Claude needs your input"' }
  return { event: 'PostToolUse', matcher: 'Edit|Write', command: "jq -r '.tool_input.file_path' | xargs npx prettier --write" }
}

/** `.claude/settings.json` with the given hooks and rules - what Claude writes, what the lessons show. */
export function settingsJson(session: Pick<ClaudeSession, 'hooks' | 'denyRules'>, allow: string[] = []) {
  const byEvent = new Map<HookEvent, Hook[]>()
  for (const hook of session.hooks) byEvent.set(hook.event, [...(byEvent.get(hook.event) ?? []), hook])
  const hooks = Object.fromEntries(
    [...byEvent].map(([event, list]) => [
      event,
      list.map((hook) => ({ ...(hook.matcher ? { matcher: hook.matcher } : {}), hooks: [{ type: 'command', command: hook.command }] })),
    ]),
  )
  const permissions = { ...(allow.length ? { allow } : {}), ...(session.denyRules.length ? { deny: session.denyRules } : {}) }
  return JSON.stringify({ permissions, ...(session.hooks.length ? { hooks } : {}) }, null, 2)
}

export function hookEvents(hook: Hook): SessionEvent[] {
  return [{ type: 'hookCreated', event: hook.event }, { type: 'settingsChanged', file: 'settings.json' }]
}
