import type { ClaudeSession, Language, Skill, SkillScope, TerminalLine, ToolStep } from './types'
import { BUGGY_TOGGLE, FIXED_TOGGLE, GIT_CHANGES, skillCommand, skillFile, skillPath } from './workspace'

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
    events: [{ type: 'toolUsed', tool: 'Edit' }],
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
  if (session.mode === 'plan') {
    return {
      intro: [say(pick(language, 'Plan-Modus: Ich lese nur und ändere nichts.', 'Plan mode: I only read and change nothing.'))],
      steps: [readStep(session, 'src/hooks/useTodos.ts'), readStep(session, 'src/hooks/useTodos.test.ts')],
      closing: [
        say(pick(language, 'Plan:', 'Plan:')),
        say(pick(language, '1. `toggle` in useTodos.ts nur für die passende `id` umschalten', '1. In useTodos.ts, toggle only the todo with the matching `id`')),
        say(pick(language, '2. `npm test` ausführen und prüfen, dass der Test grün ist', '2. Run `npm test` and check the test passes')),
        say(pick(language, 'Mit Shift+Tab den Plan-Modus verlassen, dann setze ich das um.', 'Leave plan mode with Shift+Tab and I will carry it out.')),
      ],
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

function git(language: Language, commit: boolean): Plan {
  const status = [
    result('On branch main'),
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
  if (commit) {
    steps.push({
      tool: 'Bash',
      target: 'git add src/components && git commit -m "Add todo filter"',
      description: 'Commit the todo filter',
      output: [result('[main 3f2a1c9] Add todo filter'), result(' 2 files changed, 31 insertions(+), 2 deletions(-)')],
      tokens: 150,
      events: [{ type: 'toolUsed', tool: 'Bash' }],
    })
  }
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

function fallback(language: Language): Plan {
  return {
    intro: [],
    steps: [],
    closing: [
      say(pick(language, 'Gern - was genau soll ich tun?', 'Sure - what exactly should I do?')),
      {
        text: pick(
          language,
          'Diese Simulation versteht z. B.: „Erkläre das Projekt“, „Lass die Tests laufen und behebe den Fehler“, „Was hat sich in git geändert?“, „Erstelle einen Skill für Code-Reviews“ oder Prompts mit @src/App.tsx.',
          'This simulation understands e.g.: "Explain the project", "Run the tests and fix the bug", "What changed in git?", "Create a skill for code reviews" or prompts with @src/App.tsx.',
        ),
        kind: 'hint',
      },
    ],
  }
}

/** Plans what Claude does with a prompt. `@` mentions are handled by the session before this. */
export function planPrompt(session: ClaudeSession, prompt: string, language: Language): Plan {
  const p = prompt.toLowerCase()
  if (/skill/.test(p) && /erstell|create|make|schreib|write|bau|build|leg .*an|anleg|neue|new|generat/.test(p)) return createSkill(session, prompt, language)
  const skill = findSkillFor(session, prompt)
  if (skill) return runSkill(session, skill, 'model', language)
  if (/test|fix|fehler|repar|kaputt|broken|bug/.test(p)) return testAndFix(session, language)
  if (/commit/.test(p)) return git(language, true)
  if (/git|geändert|geaendert|änderung|changed|changes|diff|status/.test(p)) return git(language, false)
  if (/erklär|erklaer|explain|überblick|overview|beschreib|describe|struktur|structure|was macht|what does|what is|worum/.test(p)) return explain(session, language)
  return fallback(language)
}
