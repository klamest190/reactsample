import { hookEvents, hookFromPrompt, settingsJson } from './hooks'
import { issuesPlan } from './mcp'
import { createAgentPlan, customAgentPlan, explorePlan } from './subagents'
import type { ClaudeSession, Language, SessionEvent, Skill, SkillScope, TerminalLine, ToolStep } from './types'
import { BUGGY_TOGGLE, FIXED_TOGGLE, GIT_CHANGES, INJECTION_COMMAND, INJECTION_FILE, skillCommand, skillFile, skillPath } from './workspace'

/**
 * What Claude does with a prompt. There is no model behind this: the prompt is matched against a
 * handful of intents (explain, test & fix, git, create a skill, use a skill), each of which plans
 * a few tool steps. The session runs the steps one by one and stops at every step that needs
 * permission - that is the agentic loop the lessons are about.
 */

export type Plan = {
  /** Printed before the first step. */
  intro: TerminalLine[]
  steps: ToolStep[]
  /** Printed after the last step. */
  closing: TerminalLine[]
  /** Left behind when the plan starts, e.g. `clarified` for a question back. */
  events?: SessionEvent[]
}

const say = (text: string): TerminalLine => ({ text, kind: 'assistant' })
const result = (text: string): TerminalLine => ({ text, kind: 'result' })
const pick = (language: Language, de: string, en: string) => (language === 'de' ? de : en)

const lineCount = (text: string) => text.split('\n').length

export function readStep(session: ClaudeSession, path: string): ToolStep {
  const content = session.files[path] ?? ''
  return {
    tool: 'Read',
    target: path,
    output: [result(`Read ${lineCount(content)} lines`)],
    tokens: content.length,
    events: [{ type: 'toolUsed', tool: 'Read' }],
  }
}

function globStep(pattern: string, found: string[]): ToolStep {
  return {
    tool: 'Glob',
    target: pattern,
    output: [result(`Found ${found.length} files`)],
    tokens: 40 * found.length,
    events: [{ type: 'toolUsed', tool: 'Glob' }],
  }
}

function testStep(session: ClaudeSession, fixedBefore: boolean): ToolStep {
  const fixed = fixedBefore || !session.files['src/hooks/useTodos.ts'].includes(BUGGY_TOGGLE)
  const output = fixed
    ? [result(' ✓ src/hooks/useTodos.test.ts (1 test)'), result(' Test Files  1 passed (1)'), result('      Tests  1 passed (1)')]
    : [
        result(' ✗ src/hooks/useTodos.test.ts > toggles only the clicked todo'),
        result('   AssertionError: expected [ true, true ] to deeply equal [ true, false ]'),
        result(' Test Files  1 failed (1)'),
        result('      Tests  1 failed (1)'),
      ]
  return { tool: 'Bash', target: 'npm test', description: 'Run the test suite', output, tokens: 600, events: [{ type: 'toolUsed', tool: 'Bash' }] }
}

function fixStep(session: ClaudeSession): ToolStep {
  const path = 'src/hooks/useTodos.ts'
  return {
    tool: 'Edit',
    target: path,
    output: [
      result(`Updated ${path} with 1 addition and 1 removal`),
      { text: `-${BUGGY_TOGGLE}`, kind: 'removed' },
      { text: `+${FIXED_TOGGLE}`, kind: 'added' },
    ],
    tokens: 300,
    writes: { [path]: session.files[path].replace(BUGGY_TOGGLE, FIXED_TOGGLE) },
    events: [{ type: 'toolUsed', tool: 'Edit' }, { type: 'bugFixed' }],
  }
}

function explain(session: ClaudeSession, language: Language): Plan {
  const files = Object.keys(session.files).filter((f) => /\.(tsx?|json)$/.test(f))
  return {
    intro: [],
    steps: [globStep('**/*.{ts,tsx,json}', files), readStep(session, 'package.json'), readStep(session, 'src/App.tsx'), readStep(session, 'src/hooks/useTodos.ts')],
    closing: [
      say(pick(language, 'Das ist eine kleine Todo-App mit React, TypeScript und Vite:', 'This is a small todo app built with React, TypeScript and Vite:')),
      say(pick(language, '- `src/App.tsx` verbindet den Hook `useTodos` mit der Liste', '- `src/App.tsx` wires the `useTodos` hook to the list')),
      say(pick(language, '- `src/hooks/useTodos.ts` hält den State (add, toggle)', '- `src/hooks/useTodos.ts` holds the state (add, toggle)')),
      say(pick(language, '- Tests laufen mit Vitest (`npm test`), Lint mit oxlint', '- Tests run with Vitest (`npm test`), linting with oxlint')),
      say(pick(language, 'Auffällig: `toggle` dreht alle Todos um, nicht nur das angeklickte.', 'Worth a look: `toggle` flips every todo, not just the clicked one.')),
    ],
  }
}

function testAndFix(session: ClaudeSession, language: Language): Plan {
  const buggy = session.files['src/hooks/useTodos.ts'].includes(BUGGY_TOGGLE)
  if (!buggy) {
    return {
      intro: [say(pick(language, 'Ich lasse die Tests laufen.', "I'll run the tests."))],
      steps: [testStep(session, true)],
      closing: [say(pick(language, 'Alle Tests sind grün.', 'All tests pass.'))],
    }
  }
  return {
    intro: [say(pick(language, 'Ich lasse zuerst die Tests laufen, um den Fehler zu sehen.', "I'll run the tests first to see what fails."))],
    steps: [testStep(session, false), readStep(session, 'src/hooks/useTodos.ts'), fixStep(session), testStep(session, true)],
    closing: [
      say(pick(language, 'Behoben: `toggle` hat jedes Todo umgeschaltet. Jetzt vergleicht es die `id`.', 'Fixed: `toggle` flipped every todo. It now compares the `id`.')),
      say(pick(language, 'Der Test ist grün.', 'The test passes.')),
    ],
  }
}

function branchStep(name: string): ToolStep {
  return {
    tool: 'Bash',
    target: `git switch -c ${name}`,
    description: 'Create and switch to a new branch',
    output: [result(`Switched to a new branch '${name}'`)],
    tokens: 60,
    branch: name,
    events: [{ type: 'toolUsed', tool: 'Bash' }, { type: 'branchCreated', name }],
  }
}

function commitStep(session: ClaudeSession, message: string): ToolStep {
  return {
    tool: 'Bash',
    target: `git add -A && git commit -m "${message}"`,
    description: 'Commit the changes',
    output: [result(`[${session.branch} 3f2a1c9] ${message}`), result(' 2 files changed, 31 insertions(+), 2 deletions(-)')],
    tokens: 150,
    events: [{ type: 'toolUsed', tool: 'Bash' }, { type: 'committed' }],
  }
}

/** "Create a branch for the filter" / "commit" / "open a pull request". */
function gitWork(session: ClaudeSession, prompt: string, language: Language): Plan {
  const p = prompt.toLowerCase()
  const wantsPr = /pull request|pull-request|\bpr\b|merge request/.test(p)
  const wantsBranch = /branch|zweig/.test(p) || (wantsPr && session.branch === 'main')
  const topic = prompt.match(/\b(?:für|fuer|for|named|namens)\s+(?:den |die |das |the |a )?(.+)$/i)?.[1].split(/[.!?,;:\n]/)[0]
  const name = `feature/${slug(topic ?? '') || 'todo-filter'}`
  const steps: ToolStep[] = []
  if (wantsBranch && session.branch === 'main') steps.push(branchStep(name))
  if (/commit/.test(p) || wantsPr) steps.push(commitStep(session, 'Add todo filter'))
  if (wantsPr) {
    steps.push({
      tool: 'Bash',
      target: 'git push -u origin HEAD && gh pr create --fill',
      description: 'Push the branch and open a pull request',
      output: [result(`branch '${wantsBranch ? name : session.branch}' set up to track 'origin/${wantsBranch ? name : session.branch}'`), result('https://github.com/acme/todo-app/pull/17')],
      tokens: 200,
      events: [{ type: 'toolUsed', tool: 'Bash' }, { type: 'prCreated' }],
    })
  }
  const closing = wantsPr
    ? [say(pick(language, 'Pull Request #17 ist offen: https://github.com/acme/todo-app/pull/17', 'Pull request #17 is open: https://github.com/acme/todo-app/pull/17'))]
    : steps.some((s) => s.branch)
      ? [say(pick(language, `Du bist jetzt auf \`${name}\` - main bleibt unberührt.`, `You are on \`${name}\` now - main stays untouched.`))]
      : [say(pick(language, 'Committet.', 'Committed.'))]
  if (!steps.length) return git(session, language, false)
  return { intro: [], steps, closing }
}

function git(session: ClaudeSession, language: Language, commit: boolean): Plan {
  const status = [
    result(`On branch ${session.branch}`),
    result('Changes not staged for commit:'),
    ...GIT_CHANGES.modified.map((f) => result(`  modified:   ${f}`)),
    result('Untracked files:'),
    ...GIT_CHANGES.untracked.map((f) => result(`  ${f}`)),
  ]
  const steps: ToolStep[] = [
    { tool: 'Bash', target: 'git status', description: 'Show working tree status', output: status, tokens: 200, events: [{ type: 'toolUsed', tool: 'Bash' }, { type: 'gitInspected' }] },
    {
      tool: 'Bash',
      target: 'git diff',
      description: 'Show unstaged changes',
      output: [result('src/components/TodoList.tsx | 4 ++--'), result('1 file changed, 2 insertions(+), 2 deletions(-)')],
      tokens: 400,
      events: [{ type: 'toolUsed', tool: 'Bash' }],
    },
  ]
  if (commit) steps.push(commitStep(session, 'Add todo filter'))
  return {
    intro: [],
    steps,
    closing: commit
      ? [say(pick(language, 'Committet als „Add todo filter“.', 'Committed as "Add todo filter".'))]
      : [
          say(pick(language, 'Geändert ist `TodoList.tsx`, neu (noch nicht in git) ist `TodoFilter.tsx`.', 'Changed: `TodoList.tsx`; new and not yet tracked: `TodoFilter.tsx`.')),
          say(pick(language, 'Soll ich beides committen?', 'Shall I commit both?')),
        ],
  }
}

const UMLAUTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }

/** "Code-Reviews!" -> "code-reviews" (skill names: lowercase letters, digits, hyphens). */
export function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => UMLAUTS[c])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .slice(0, 4)
    .join('-')
}

const FILLER = /^(einen?|eine|den|die|das|der|a|an|the|my|meine?n?|unsere?n?|our|skill|skills)$/

/** "Erstelle einen Skill für Code-Reviews" -> { name: "code-reviews", topic: "Code-Reviews" } */
export function skillFromPrompt(prompt: string): { name: string; topic: string; scope: SkillScope } {
  const scope: SkillScope = /persönlich|personal|global|~\/\.claude|alle projekte|all (my )?projects|überall|everywhere/i.test(prompt) ? 'personal' : 'project'
  const match = prompt.match(/\b(?:für|fuer|for|zum|zur|that|der|die|named|namens)\s+(.+)$/i)
  const words = (match?.[1] ?? '')
    .split(/[.!?,;:\n]/)[0]
    .replace(/["„“]/g, '')
    .replace(/\b(persönlich|personal|global|in allen projekten|for all (my )?projects|überall|everywhere)\b/gi, '')
    .split(/\s+/)
    .filter((w) => w && !FILLER.test(w.toLowerCase()))
  const topic = words.slice(0, 4).join(' ')
  return { name: slug(topic) || 'my-workflow', topic: topic || 'my workflow', scope }
}

function createSkill(session: ClaudeSession, prompt: string, language: Language): Plan {
  const { name, topic, scope } = skillFromPrompt(prompt)
  const skill: Skill = {
    name,
    scope,
    description: `Guides Claude through ${topic}. Use when the user asks about ${topic} or works on it.`,
    body: [
      `# ${topic}`,
      '',
      '## Steps',
      '1. Read the relevant files before changing anything',
      `2. Follow the team conventions for ${topic} from CLAUDE.md`,
      '3. Run `npm test` and `npm run lint` before reporting back',
      '',
      '## Output',
      '- Summarize what you did as a short list',
    ].join('\n'),
    triggers: topic
      .toLowerCase()
      .split(/[\s-]+/)
      .filter((w) => w.length > 4),
  }
  const path = skillPath(skill)
  const content = skillFile(skill)
  const exists = session.skills.some((s) => s.name === name && s.scope === scope)
  return {
    intro: [say(pick(language, `Ich lege einen ${scope === 'personal' ? 'persönlichen' : 'Projekt-'}Skill \`${name}\` an.`, `I'll create a ${scope} skill \`${name}\`.`))],
    steps: [
      globStep('.claude/skills/*/SKILL.md', session.skills.filter((s) => s.scope === 'project').map((s) => s.name)),
      readStep(session, 'CLAUDE.md' in session.files ? 'CLAUDE.md' : 'package.json'),
      {
        tool: 'Write',
        target: path,
        output: [result(`${exists ? 'Updated' : 'Wrote'} ${lineCount(content)} lines to ${path}`), ...content.split('\n').map((text) => ({ text, kind: 'added' as const }))],
        tokens: content.length,
        writes: scope === 'project' ? { [path]: content } : undefined,
        skill,
        events: [{ type: 'toolUsed', tool: 'Write' }, { type: 'skillCreated', name, scope }],
      },
    ],
    closing: [
      say(pick(language, `Fertig: \`${path}\`.`, `Done: \`${path}\`.`)),
      say(
        pick(
          language,
          `Aufrufen mit \`/${name}\` - oder einfach darüber reden: Passt ein Prompt zur \`description\`, lädt Claude den Skill selbst.`,
          `Call it with \`/${name}\` - or just talk about it: when a prompt matches the \`description\`, Claude loads the skill on its own.`,
        ),
      ),
    ],
  }
}

/** Runs a skill: either typed as /name, or picked by Claude because the prompt matched. */
export function runSkill(session: ClaudeSession, skill: Skill, via: 'slash' | 'model', language: Language): Plan {
  const name = skillCommand(skill)
  const load: ToolStep = {
    tool: 'Skill',
    target: name,
    output: [result(`Loaded ${skillPath(skill)}`)],
    tokens: skill.body.length + skill.description.length,
    events: [{ type: 'skillInvoked', name, via }],
  }
  const intro = via === 'model' ? [say(pick(language, `Das passt zum Skill \`${name}\` - ich lade ihn.`, `That matches the skill \`${name}\` - loading it.`))] : []
  if (skill.name === 'component-review') {
    return {
      intro,
      steps: [load, readStep(session, 'src/components/TodoList.tsx')],
      closing: [
        say(pick(language, 'Review nach der Team-Checkliste:', 'Review against the team checklist:')),
        say(pick(language, '- TodoList.tsx:9 - `<li onClick>` ist per Tastatur nicht bedienbar, besser ein `<button>`', '- TodoList.tsx:9 - `<li onClick>` cannot be used with a keyboard, use a `<button>`')),
        say(pick(language, '- TodoList.tsx:3 - `onAdd` wird übergeben, aber nie benutzt', '- TodoList.tsx:3 - `onAdd` is passed but never used')),
        say(pick(language, '- Keys sind stabile ids - in Ordnung', '- Keys are stable ids - fine')),
      ],
    }
  }
  if (skill.name === 'release-notes') {
    return {
      intro,
      steps: [
        load,
        {
          tool: 'Bash',
          target: 'git log v1.2.0..HEAD --oneline',
          description: 'List commits since the last tag',
          output: [result('3f2a1c9 Add todo filter'), result('a81d0e2 Fix toggle flipping every todo'), result('77c4b10 Update dependencies')],
          tokens: 200,
          events: [{ type: 'toolUsed', tool: 'Bash' }],
        },
      ],
      closing: [say('## Features\n- Todo filter\n## Fixes\n- Toggle flips only the clicked todo\n## Chores\n- Dependencies updated')],
    }
  }
  return {
    intro,
    steps: [load],
    closing: [
      say(pick(language, `Ich folge den Anweisungen aus \`${skillPath(skill)}\`:`, `Following the instructions in \`${skillPath(skill)}\`:`)),
      ...skill.body
        .split('\n')
        .filter((l) => /^(\d+\.|-)/.test(l))
        .map((l) => say(`  ${l}`)),
    ],
  }
}

function findSkillFor(session: ClaudeSession, prompt: string) {
  const lower = prompt.toLowerCase()
  return session.skills.find((s) => s.triggers.some((t) => lower.includes(t)))
}


/** "What is a token?" - the basics lesson asks Claude itself. */
function concept(topic: 'tokens' | 'context' | 'hallucination' | 'agent', language: Language): Plan {
  const answers = {
    tokens: [
      pick(language, 'Ein Token ist ein Stück Text - oft ein Wortteil, manchmal ein ganzes Wort oder ein Satzzeichen.', 'A token is a piece of text - often part of a word, sometimes a whole word or a punctuation mark.'),
      pick(language, 'Ich lese und schreibe in Tokens; Kontextfenster, Limits und Kosten werden in Tokens gemessen.', 'I read and write in tokens; context window, limits and cost are all measured in tokens.'),
      pick(language, 'Code hat viele Sonderzeichen und wird dadurch oft in mehr Tokens zerlegt als Fließtext.', 'Code has many special characters and often splits into more tokens than prose.'),
    ],
    context: [
      pick(language, 'Das Kontextfenster ist alles, was ich bei einer Antwort sehe: Systemanweisungen, CLAUDE.md, das Gespräch, gelesene Dateien, Werkzeugausgaben.', 'The context window is everything I see for one answer: system instructions, CLAUDE.md, the conversation, files read, tool output.'),
      pick(language, 'Was nicht darin steht, weiß ich nicht - zwischen Sitzungen erinnere ich mich nur an das, was wieder geladen wird.', 'What is not in it, I do not know - between sessions I only remember what gets loaded again.'),
      pick(language, '`/context` zeigt, wie voll es gerade ist.', '`/context` shows how full it is right now.'),
    ],
    hallucination: [
      pick(language, 'Ich erzeuge wahrscheinliche Fortsetzungen - manchmal klingt etwas plausibel und ist trotzdem falsch, z. B. eine API, die es nicht gibt.', 'I generate likely continuations - sometimes something sounds plausible and is still wrong, e.g. an API that does not exist.'),
      pick(language, 'Gegenmittel: mich Dateien lesen und Tests laufen lassen, statt aus dem Gedächtnis zu antworten - und das Ergebnis prüfen.', 'The remedy: let me read files and run tests instead of answering from memory - and check the result.'),
    ],
    agent: [
      pick(language, 'Ein Agent ist ein Modell, das Werkzeuge benutzen darf und in einer Schleife arbeitet: handeln, Ergebnis ansehen, nächsten Schritt wählen.', 'An agent is a model that may use tools and works in a loop: act, look at the result, pick the next step.'),
      pick(language, 'Ohne Werkzeuge könnte ich nur raten, was in deinem Projekt steht. Mit ihnen lese ich nach und prüfe selbst.', 'Without tools I could only guess what is in your project. With them I look it up and check for myself.'),
    ],
  }
  return { intro: [], steps: [], closing: answers[topic].map(say), events: [{ type: 'conceptExplained', topic }] }
}

const FILTER_COMPONENT = `type Filter = 'all' | 'open' | 'done'

type Props = { value: Filter; onChange: (filter: Filter) => void }

export function TodoFilter({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="Filter">
      {(['all', 'open', 'done'] as const).map((filter) => (
        <button key={filter} aria-pressed={value === filter} onClick={() => onChange(filter)}>
          {filter}
        </button>
      ))}
    </div>
  )
}`

/** "Add a filter to the todo list" - the capstone feature. */
function filterFeature(session: ClaudeSession, language: Language): Plan {
  const path = 'src/components/TodoFilter.tsx'
  const app = session.files['src/App.tsx']
  const nextApp = app.includes('TodoFilter')
    ? app
    : app
        .replace("import { TodoList } from './components/TodoList'", "import { useState } from 'react'\nimport { TodoFilter } from './components/TodoFilter'\nimport { TodoList } from './components/TodoList'")
        .replace('  return <TodoList', "  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')\n  const visible = todos.filter((t) => filter === 'all' || (filter === 'done') === t.done)\n  return (\n    <>\n      <TodoFilter value={filter} onChange={setFilter} />\n      <TodoList")
        .replace('todos={todos} onAdd={add} onToggle={toggle} />', 'todos={visible} onAdd={add} onToggle={toggle} />\n    </>\n  )')
  return {
    intro: [say(pick(language, 'Ich sehe mir zuerst an, wie die Liste aufgebaut ist.', "I'll first look at how the list is built."))],
    steps: [
      readStep(session, 'src/App.tsx'),
      readStep(session, 'src/components/TodoList.tsx'),
      {
        tool: 'Write',
        target: path,
        output: [result(`Wrote ${FILTER_COMPONENT.split('\n').length} lines to ${path}`), ...FILTER_COMPONENT.split('\n').map((text) => ({ text, kind: 'added' as const }))],
        tokens: 500,
        writes: { [path]: FILTER_COMPONENT },
        events: [{ type: 'toolUsed', tool: 'Write' }],
      },
      {
        tool: 'Edit',
        target: 'src/App.tsx',
        output: [
          result('Updated src/App.tsx with 9 additions and 1 removal'),
          { text: "+  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')", kind: 'added' },
          { text: '+  <TodoFilter value={filter} onChange={setFilter} />', kind: 'added' },
        ],
        tokens: 400,
        writes: { 'src/App.tsx': nextApp },
        events: [{ type: 'toolUsed', tool: 'Edit' }, { type: 'featureBuilt' }],
      },
      testStep(session, false),
    ],
    closing: [
      say(pick(language, 'Der Filter ist eingebaut: `TodoFilter.tsx` mit drei Knöpfen, der Zustand liegt in `App.tsx`.', 'The filter is in: `TodoFilter.tsx` with three buttons, the state lives in `App.tsx`.')),
      say(
        session.files['src/hooks/useTodos.ts'].includes(BUGGY_TOGGLE)
          ? pick(language, 'Achtung: Der alte Toggle-Test schlägt noch fehl - der Fehler liegt in `useTodos.ts`, nicht im Filter. Soll ich ihn auch beheben?', 'Heads-up: the old toggle test still fails - the bug is in `useTodos.ts`, not in the filter. Shall I fix it too?')
          : pick(language, 'Alle Tests sind grün.', 'All tests pass.'),
      ),
    ],
  }
}

/** "Show me the .env file" - stopped by a deny rule or a hook, or leaked if neither exists. */
function readSecret(session: ClaudeSession, language: Language): Plan {
  const content = session.files['.env'] ?? ''
  return {
    intro: [],
    steps: [
      {
        tool: 'Read',
        target: '.env',
        output: [result(`Read ${lineCount(content)} lines`), { text: content, kind: 'output' }],
        tokens: 40,
        events: [{ type: 'toolUsed', tool: 'Read' }, { type: 'secretRead' }],
      },
    ],
    closing: [
      say(pick(language, 'Die Datei enthält einen API-Token. Den solltest du nirgends einfügen - auch nicht in einen Chat.', 'The file contains an API token. Do not paste it anywhere - not into a chat either.')),
      { text: pick(language, 'Ein Geheimnis ist jetzt im Kontext gelandet. Eine Deny-Regel `Read(./.env)` hätte das verhindert.', 'A secret just landed in the context. A deny rule `Read(./.env)` would have prevented that.'), kind: 'hint' },
    ],
  }
}

/** "Add a deny rule for .env" / "allow npm run lint for the team" - Claude edits .claude/settings.json. */
function settingsChange(session: ClaudeSession, prompt: string, language: Language): Plan {
  const deny = /deny|verbiet|sperr|block|\.env|secret|geheim/.test(prompt.toLowerCase())
  const rule = deny ? 'Read(./.env)' : 'Bash(npm run lint)'
  const nextDeny = deny && !session.denyRules.includes(rule) ? [...session.denyRules, rule] : session.denyRules
  const content = settingsJson({ hooks: session.hooks, denyRules: nextDeny }, deny ? [] : [rule])
  return {
    intro: [],
    steps: [
      {
        tool: 'Edit',
        target: '.claude/settings.json',
        output: [result('Updated .claude/settings.json'), { text: `+      "${rule}"`, kind: 'added' }],
        tokens: 200,
        writes: { '.claude/settings.json': content },
        denyRule: deny ? rule : undefined,
        allowRule: deny ? undefined : rule,
        events: [{ type: 'toolUsed', tool: 'Edit' }, { type: 'settingsChanged', file: 'settings.json' }],
      },
    ],
    closing: [
      say(
        deny
          ? pick(language, 'Ab jetzt ist das Lesen von `.env` gesperrt - Claude Code setzt die Regel durch, egal was ich entscheide. Für das ganze Team, sobald die Datei committet ist.', 'Reading `.env` is blocked from now on - Claude Code enforces the rule, whatever I decide. For the whole team once the file is committed.')
          : pick(language, '`npm run lint` läuft ab jetzt ohne Rückfrage - für alle, sobald `.claude/settings.json` committet ist.', '`npm run lint` runs without asking from now on - for everyone once `.claude/settings.json` is committed.'),
      ),
    ],
  }
}

/** "Add a hook that formats after every edit" */
function createHook(session: ClaudeSession, prompt: string, language: Language): Plan {
  const hook = hookFromPrompt(prompt)
  const content = settingsJson({ hooks: [...session.hooks, hook], denyRules: session.denyRules })
  return {
    intro: [say(pick(language, `Ich trage einen ${hook.event}-Hook in \`.claude/settings.json\` ein.`, `I'll add a ${hook.event} hook to \`.claude/settings.json\`.`))],
    steps: [
      {
        tool: 'Edit',
        target: '.claude/settings.json',
        output: [result('Updated .claude/settings.json'), ...content.split('\n').map((text) => ({ text, kind: 'added' as const }))],
        tokens: 300,
        writes: { '.claude/settings.json': content },
        hook,
        events: [{ type: 'toolUsed', tool: 'Edit' }, ...hookEvents(hook)],
      },
    ],
    closing: [say(pick(language, 'Der Hook gilt ab dem nächsten Werkzeugaufruf. `/hooks` zeigt alle Hooks.', 'The hook applies from the next tool call. `/hooks` lists all hooks.'))],
  }
}

/** "Summarize docs/vendor-notes.md" - the file carries hidden instructions. */
function injection(session: ClaudeSession, language: Language): Plan {
  return {
    intro: [],
    steps: [
      readStep(session, INJECTION_FILE),
      {
        tool: 'Bash',
        target: INJECTION_COMMAND,
        description: 'Install the required helper',
        output: [result('(script output)')],
        tokens: 100,
        suspicious: true,
        events: [{ type: 'toolUsed', tool: 'Bash' }],
      },
    ],
    closing: [say(pick(language, 'Zusammenfassung: Version 4 hat `onSelect` in `onChange` umbenannt.', 'Summary: version 4 renamed `onSelect` to `onChange`.'))],
  }
}

function fallback(language: Language): Plan {
  return {
    intro: [],
    steps: [],
    closing: [
      say(pick(language, 'Gern - was genau soll ich tun? Welche Datei, welches Verhalten, woran erkennst du, dass es fertig ist?', 'Sure - what exactly should I do? Which file, which behaviour, how will you know it is done?')),
      {
        text: pick(
          language,
          'Diese Simulation versteht z. B.: „Erkläre das Projekt“, „Lass die Tests laufen und behebe den Fehler“, „Leg einen Branch an“, „Erstelle einen Skill für Code-Reviews“, „Welche Issues sind offen?“ oder Prompts mit @src/App.tsx.',
          'This simulation understands e.g.: "Explain the project", "Run the tests and fix the bug", "Create a branch", "Create a skill for code reviews", "Which issues are open?" or prompts with @src/App.tsx.',
        ),
        kind: 'hint',
      },
    ],
    events: [{ type: 'clarified' }],
  }
}

/** A prompt is specific when it names a file and says enough to act on. */
export function isSpecific(prompt: string) {
  return /@[\w./-]+|\bsrc\/|\.(tsx?|json|md)\b/.test(prompt) && prompt.trim().split(/\s+/).length >= 6
}

const has = (p: string, pattern: RegExp) => pattern.test(p)
const CREATE = /erstell|create|make|schreib|write|bau|build|leg .*an|anleg|neue|new|generat|\badd\b|hinzu|füg|fueg|einricht|set up/

/** Plans what Claude does with a prompt. `@` mentions are handled by the session before this. */
export function planPrompt(session: ClaudeSession, prompt: string, language: Language): Plan {
  const p = prompt.toLowerCase()
  // Questions about the basics come first - "token" must not end up at the .env intent.
  if (has(p, /was (ist|sind|bedeutet)|what (is|are)|erklär mir|explain to me|wie funktioniert|how does/)) {
    if (has(p, /token/)) return concept('tokens', language)
    if (has(p, /kontext|context/)) return concept('context', language)
    if (has(p, /halluzin|hallucinat/)) return concept('hallucination', language)
    if (has(p, /\bagent/) && !has(p, /subagent/)) return concept('agent', language)
  }
  if (has(p, /skill/) && has(p, CREATE)) return createSkill(session, prompt, language)
  if (has(p, /subagent|\bagent\b|agenten/) && has(p, CREATE)) return createAgentPlan(prompt, language)
  if (has(p, /\bhook/) && has(p, CREATE)) return createHook(session, prompt, language)
  if (has(p, /deny|regel|rule|settings|einstellung/) && has(p, CREATE)) return settingsChange(session, prompt, language)
  if (has(p, /vendor-notes|zusammenfass|summari[sz]e/)) return injection(session, language)
  const agent = session.agents.find((a) => p.includes(a.name))
  if (agent) return customAgentPlan(agent, language)
  const skill = findSkillFor(session, prompt)
  if (skill) return runSkill(session, skill, 'model', language)
  if (has(p, /\.env|secret|geheimnis|api.?key|passwort|password/)) return readSecret(session, language)
  if (has(p, /issue|ticket/)) return issuesPlan(session, language)
  if (has(p, /subagent|explore|durchsuch|search the (whole )?(codebase|project)|finde? alle|find (all|every)|überall|everywhere/)) return explorePlan(language)
  // Branch and PR wishes first: "a branch for the todo filter" is about git, not about the filter.
  if (has(p, /branch|zweig|pull request|pull-request|\bpr\b|merge request/)) return gitWork(session, prompt, language)
  if (has(p, /filter|feature/)) return filterFeature(session, language)
  if (has(p, /test|fix|fehler|repar|kaputt|broken|bug/)) return testAndFix(session, language)
  if (has(p, /commit/)) return gitWork(session, prompt, language)
  if (has(p, /git|geändert|geaendert|änderung|changed|changes|diff|status/)) return git(session, language, false)
  if (has(p, /erklär|erklaer|explain|überblick|overview|beschreib|describe|struktur|structure|was macht|what does|worum/)) return explain(session, language)
  return fallback(language)
}
