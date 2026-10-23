import { slug, type Plan } from './agent'
import type { ClaudeSession, Language, Subagent, TerminalLine, ToolStep } from './types'
import { agentFile } from './workspace'

/**
 * Subagents: Claude hands a task to an agent with its own, fresh context window. The agent works
 * through many files; only its short summary comes back - that is what keeps the main context small.
 * Built in (code.claude.com/docs, 2026-10): Explore (fast, read-only search), Plan (research in
 * plan mode) and general-purpose. Custom ones live in .claude/agents/<name>.md.
 */

const say = (text: string): TerminalLine => ({ text, kind: 'assistant' })
const result = (text: string): TerminalLine => ({ text, kind: 'result' })
const pick = (language: Language, de: string, en: string) => (language === 'de' ? de : en)

export const BUILT_IN_AGENTS = [
  { name: 'Explore', description: 'Fast, read-only search through the codebase' },
  { name: 'Plan', description: 'Research for plan mode, read-only' },
  { name: 'general-purpose', description: 'Multi-step tasks with all tools' },
]

function agentStep(agent: string, task: string, summary: string[]): ToolStep {
  return {
    tool: 'Agent',
    target: `${agent}: ${task}`,
    // The agent read thousands of tokens - the main context only gets the summary.
    output: [result('Done (9 tool uses · 24.6k tokens · 14s)'), ...summary.map(result)],
    tokens: 450,
    events: [{ type: 'toolUsed', tool: 'Agent' }, { type: 'subagentUsed', agent }],
  }
}

/** "Search the whole codebase for …" - Claude sends Explore. */
export function explorePlan(language: Language): Plan {
  return {
    intro: [say(pick(language, 'Das ist eine breite Suche - ich schicke den Explore-Agenten los, damit dein Kontext klein bleibt.', "That's a broad search - I'll send the Explore agent so your context stays small."))],
    steps: [
      agentStep('Explore', 'find every place that changes todos', [
        'src/hooks/useTodos.ts:7 add, :8 toggle (setTodos)',
        'src/components/TodoList.tsx:9 calls onToggle',
        'src/App.tsx:5 wires add and toggle to the list',
      ]),
    ],
    closing: [
      say(pick(language, 'Todos werden nur in `useTodos.ts` geändert - `add` und `toggle`. Die Komponenten rufen nur die Funktionen auf.', 'Todos are only changed in `useTodos.ts` - `add` and `toggle`. The components just call those functions.')),
      say(pick(language, 'Der Agent hat ~25k Tokens gelesen; in deinem Kontext landen davon nur ein paar hundert.', 'The agent read ~25k tokens; only a few hundred of them land in your context.')),
    ],
  }
}

/** "Use the test-writer agent to …" */
export function customAgentPlan(agent: Subagent, language: Language): Plan {
  return {
    intro: [],
    steps: [agentStep(agent.name, 'write tests for useTodos', ['Wrote src/hooks/useTodos.add.test.ts (3 tests)', 'npm test: 4 passed'])],
    closing: [say(pick(language, `Der Agent \`${agent.name}\` hat drei Tests für \`add\` geschrieben, alle grün.`, `The \`${agent.name}\` agent wrote three tests for \`add\`, all green.`))],
  }
}

/** "Create a subagent for …" - Claude writes .claude/agents/<name>.md. */
export function createAgentPlan(prompt: string, language: Language): Plan {
  const topic = prompt.match(/\b(?:für|fuer|for|that|der|die|zum|zur)\s+(.+)$/i)?.[1].split(/[.!?,;:\n]/)[0] ?? ''
  const words = topic.split(/\s+/).filter((w) => w && !/^(einen?|eine|den|die|das|der|a|an|the|subagent|agent|agenten)$/i.test(w))
  const name = slug(words.slice(0, 3).join(' ')) || 'helper'
  const agent: Subagent = {
    name,
    description: `Handles ${words.join(' ') || 'focused tasks'}. Use proactively when the user asks for it.`,
    tools: 'Read, Grep, Glob',
    scope: 'project',
  }
  const path = `.claude/agents/${name}.md`
  const content = agentFile(agent, `You are a specialist for ${words.join(' ') || 'focused tasks'}.\n\n1. Read the relevant files first\n2. Work only on what you were asked\n3. Reply with a short summary and file:line references`)
  return {
    intro: [say(pick(language, `Ich lege den Subagent \`${name}\` an - nur mit Lese-Werkzeugen, das reicht für den Anfang.`, `I'll create the subagent \`${name}\` - with read-only tools, enough to start with.`))],
    steps: [
      {
        tool: 'Write',
        target: path,
        output: [result(`Wrote ${content.split('\n').length} lines to ${path}`), ...content.split('\n').map((text) => ({ text, kind: 'added' as const }))],
        tokens: content.length,
        writes: { [path]: content },
        agent,
        events: [{ type: 'toolUsed', tool: 'Write' }, { type: 'agentCreated', name }],
      },
    ],
    closing: [
      say(pick(language, `Fertig. Ich nutze \`${name}\` von selbst, wenn die Beschreibung passt - oder du sagst „use the ${name} agent to …“.`, `Done. I'll use \`${name}\` on my own when the description fits - or you say "use the ${name} agent to …".`)),
    ],
  }
}

/** `/agents` - since v2.1.198 a reminder instead of a wizard, plus what is there. */
export function agentsOverview(session: ClaudeSession): TerminalLine[] {
  const out = (text: string): TerminalLine => ({ text, kind: 'output' })
  return [
    out('Ask Claude to create a subagent, or add a Markdown file to .claude/agents/ (project) or ~/.claude/agents/ (personal).'),
    out(''),
    out('Built-in:'),
    ...BUILT_IN_AGENTS.map((a) => out(`  ${a.name.padEnd(18)}${a.description}`)),
    out('Custom:'),
    ...(session.agents.length ? session.agents.map((a) => out(`  ${a.name.padEnd(18)}${a.scope.padEnd(9)}${a.description}`)) : [{ text: '  (none yet)', kind: 'muted' as const }]),
  ]
}
