import type { Lesson } from './types'

export const skillsLesson: Lesson = {
  id: 'claude-skills',
  title: { de: 'Skills: wiederverwendbare Workflows', en: 'Skills: Reusable Workflows' },
  summary: {
    de: 'Wissen und Abläufe einmal aufschreiben, überall nutzen: Aufbau, Arten, Namensräume, Erstellen per Prompt und Best Practices.',
    en: 'Write knowledge and workflows down once, use them everywhere: structure, kinds, namespaces, creating by prompt and best practices.',
  },
  minutes: 50,
  goals: {
    de: [
      'Erklären, was ein Skill ist und wie er sich von CLAUDE.md unterscheidet',
      'Gebündelte, persönliche, Projekt- und Plugin-Skills unterscheiden',
      'Eine SKILL.md mit Frontmatter schreiben',
      'Skills per Prompt erstellen und das Ergebnis prüfen',
      'Steuern, wer einen Skill aufrufen darf',
      'Skills mit Namensraum aufrufen und verwalten',
    ],
    en: [
      'Explain what a skill is and how it differs from CLAUDE.md',
      'Tell bundled, personal, project and plugin skills apart',
      'Write a SKILL.md with frontmatter',
      'Create skills by prompting and check the result',
      'Control who may invoke a skill',
      'Call skills with a namespace and manage them',
    ],
  },
  keywords: ['skill', 'Skill', 'SKILL.md', 'frontmatter', 'description', '/skills', 'bundled skills', 'gebündelte Skills', 'plugin', 'Plugin', 'namespace', 'Namensraum', '$ARGUMENTS', 'disable-model-invocation', 'user-invocable', 'allowed-tools', 'progressive disclosure', 'workflow'],
  basics: ['claude-agent', 'claude-context'],
  setup: { installed: true, loggedIn: true, inRepl: true, withMemory: true, withProjectSkills: true },
  blocks: [
    { type: 'heading', text: { de: 'Was ist ein Skill?', en: 'What is a skill?' } },
    {
      type: 'text',
      text: {
        de: 'Ein Skill ist ein **Ordner mit einer `SKILL.md`**: eine Anleitung für eine bestimmte Aufgabe - „so reviewen wir Komponenten“, „so schreiben wir Release Notes“. Claude Code kennt von jedem Skill zunächst nur Name und Beschreibung. Die eigentliche Anleitung lädt es erst, wenn der Skill gebraucht wird.',
        en: 'A skill is a **folder with a `SKILL.md`**: instructions for one particular task - "this is how we review components", "this is how we write release notes". At first Claude Code only knows each skill\'s name and description. It loads the actual instructions only when the skill is needed.',
      },
    },
    {
      type: 'table',
      head: { de: ['', 'CLAUDE.md', 'Skill'], en: ['', 'CLAUDE.md', 'Skill'] },
      rows: {
        de: [
          ['Geladen', 'immer, bei jedem Start', 'nur die Beschreibung immer, der Rest bei Bedarf'],
          ['Inhalt', 'Fakten und Regeln fürs ganze Projekt', 'ein Ablauf für eine Aufgabe'],
          ['Aufruf', '-', '`/name` oder automatisch, wenn der Prompt passt'],
          ['Zusatzdateien', 'per `@`-Import', 'Vorlagen, Skripte, Beispiele im Skill-Ordner'],
        ],
        en: [
          ['Loaded', 'always, on every start', 'only the description always, the rest on demand'],
          ['Content', 'facts and rules for the whole project', 'a workflow for one task'],
          ['Invocation', '-', '`/name` or automatically when the prompt matches'],
          ['Extra files', 'via `@` imports', 'templates, scripts, examples in the skill folder'],
        ],
      },
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: 'Dieses Nachladen heißt **Progressive Disclosure**: Hundert Skills kosten fast keinen Kontext, solange sie nicht benutzt werden. Deshalb darf man großzügig Skills anlegen - aber nicht großzügig CLAUDE.md füllen.',
        en: 'This loading on demand is called **progressive disclosure**: a hundred skills cost almost no context until they are used. That is why you may create skills generously - but not fill CLAUDE.md generously.',
      },
    },
    { type: 'heading', text: { de: 'Arten von Skills', en: 'Kinds of skills' } },
    {
      type: 'text',
      text: {
        de: 'Die Doku unterscheidet **gebündelte Skills**, die mit Claude Code ausgeliefert werden, von Skills, die du oder andere schreiben. Gebündelte Skills wie `/code-review`, `/simplify` oder `/doctor` sind keine fest eingebauten Befehle wie `/help` oder `/compact`, sondern Anleitungen, die über das Skill-Werkzeug laufen.',
        en: 'The docs tell **bundled skills**, which ship with Claude Code, apart from skills you or others write. Bundled skills like `/code-review`, `/simplify` or `/doctor` are not built-in commands like `/help` or `/compact` but instructions that run through the Skill tool.',
      },
    },
    {
      type: 'table',
      head: { de: ['Art', 'Ort', 'Gilt für'], en: ['Kind', 'Location', 'Applies to'] },
      rows: {
        de: [
          ['Gebündelt', 'in Claude Code selbst', 'alle - abschaltbar mit `disableBundledSkills`'],
          ['Enterprise', 'verwaltete Einstellungen der Firma', 'alle in der Organisation'],
          ['Persönlich', '`~/.claude/skills/<name>/SKILL.md`', 'alle deine Projekte'],
          ['Projekt', '`.claude/skills/<name>/SKILL.md`', 'dieses Repo - ins Git, fürs Team'],
          ['Plugin', '`<plugin>/skills/<name>/SKILL.md`', 'wer das Plugin installiert hat'],
        ],
        en: [
          ['Bundled', 'inside Claude Code', 'everyone - can be turned off with `disableBundledSkills`'],
          ['Enterprise', 'managed settings of the company', 'everyone in the organization'],
          ['Personal', '`~/.claude/skills/<name>/SKILL.md`', 'all your projects'],
          ['Project', '`.claude/skills/<name>/SKILL.md`', 'this repo - in git, for the team'],
          ['Plugin', '`<plugin>/skills/<name>/SKILL.md`', 'whoever installed the plugin'],
        ],
      },
    },
    {
      type: 'text',
      text: {
        de: 'Heißen zwei Skills gleich, gewinnt Enterprise vor persönlich vor Projekt. Plugin-Skills können nicht kollidieren, weil sie einen **Namensraum** tragen: Der Skill `release-notes` aus dem Plugin `team-tools` heißt `/team-tools:release-notes`. Ein bloßes `/release-notes` findet ihn nicht.',
        en: 'If two skills share a name, enterprise wins over personal over project. Plugin skills cannot collide because they carry a **namespace**: the skill `release-notes` from the plugin `team-tools` is called `/team-tools:release-notes`. A bare `/release-notes` does not find it.',
      },
    },
    { type: 'heading', text: { de: 'Aufbau einer SKILL.md', en: 'Anatomy of a SKILL.md' } },
    {
      type: 'code',
      language: 'markdown',
      caption: { de: '.claude/skills/component-review/SKILL.md', en: '.claude/skills/component-review/SKILL.md' },
      code: '---\nname: component-review\ndescription: Reviews React components against the team checklist. Use when reviewing or checking a component.\nargument-hint: [component-file]\nallowed-tools: Read, Grep\n---\n\nReview $ARGUMENTS against this checklist:\n\n- Props typed, no `any`\n- Keys in lists are stable ids\n- Clickable elements are buttons, not divs\n- Report findings as a list with file:line\n\nFor the full style guide see [style-guide.md](style-guide.md).',
    },
    {
      type: 'list',
      items: {
        de: [
          'Das Frontmatter zwischen `---` muss in **Zeile 1** beginnen. Alle Felder sind optional, aber ohne `description` weiß Claude nicht, wann der Skill passt.',
          '`name` wird zum Befehl `/component-review` - Kleinbuchstaben, Ziffern, Bindestriche. Fehlt er, zählt der Ordnername.',
          '`description` ist der wichtigste Satz: Claude entscheidet allein anhand dieser Zeile, ob es den Skill lädt.',
          '`$ARGUMENTS` wird durch alles ersetzt, was nach dem Befehl steht: `/component-review src/TodoList.tsx`. Einzelne Argumente: `$0`, `$1` …',
          '`allowed-tools` erlaubt Werkzeuge ohne Rückfrage, solange der Skill aktiv ist - sparsam einsetzen.',
          'Weitere Dateien im Ordner (hier `style-guide.md`) liest Claude nur, wenn die Anleitung darauf verweist.',
        ],
        en: [
          'The frontmatter between `---` must start on **line 1**. All fields are optional, but without `description` Claude does not know when the skill fits.',
          '`name` becomes the command `/component-review` - lowercase letters, digits, hyphens. Without it the folder name counts.',
          '`description` is the most important sentence: Claude decides from this line alone whether to load the skill.',
          '`$ARGUMENTS` is replaced by everything after the command: `/component-review src/TodoList.tsx`. Single arguments: `$0`, `$1` …',
          '`allowed-tools` allows tools without asking while the skill is active - use it sparingly.',
          'Further files in the folder (here `style-guide.md`) are read only when the instructions point to them.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Wer darf den Skill aufrufen?', en: 'Who may invoke the skill?' } },
    {
      type: 'table',
      head: { de: ['Frontmatter', 'Du mit /name', 'Claude von selbst', 'Typisch für'], en: ['Frontmatter', 'You with /name', 'Claude on its own', 'Typical for'] },
      rows: {
        de: [
          ['(nichts)', 'ja', 'ja', 'Wissen und Abläufe: Reviews, Konventionen'],
          ['`disable-model-invocation: true`', 'ja', 'nein', 'Aktionen mit Folgen: Deploy, Release, Commit'],
          ['`user-invocable: false`', 'nein', 'ja', 'Hintergrundwissen, das kein Befehl sein soll'],
        ],
        en: [
          ['(nothing)', 'yes', 'yes', 'knowledge and workflows: reviews, conventions'],
          ['`disable-model-invocation: true`', 'yes', 'no', 'actions with consequences: deploy, release, commit'],
          ['`user-invocable: false`', 'no', 'yes', 'background knowledge that should not be a command'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Skills per Prompt erstellen', en: 'Creating skills by prompting' } },
    {
      type: 'text',
      text: {
        de: 'Du musst eine SKILL.md nicht von Hand schreiben. Beschreib Claude, was der Skill tun soll - Claude legt Ordner und Datei an und fragt vorher, wie bei jeder anderen Datei. Wichtig ist, was du ihm mitgibst:',
        en: 'You do not have to write a SKILL.md by hand. Describe to Claude what the skill should do - Claude creates the folder and the file and asks first, like for any other file. What matters is what you give it:',
      },
    },
    {
      type: 'code',
      language: 'text',
      code: '> Create a project skill for commit messages. Use Conventional Commits\n  (feat:, fix:, chore:), max 72 characters in the first line, and run\n  npm test before committing. It should only run when I call it.',
    },
    {
      type: 'list',
      items: {
        de: [
          '**Wann** soll er greifen? Daraus wird die `description`.',
          '**Welche Schritte**, welche Regeln, welches Ausgabeformat?',
          '**Wo** soll er liegen - im Projekt (fürs Team) oder persönlich?',
          '**Wer** darf ihn auslösen - hier nur du, also `disable-model-invocation: true`.',
          'Danach: die erzeugte Datei **lesen**, nachschärfen und den Skill einmal ausprobieren - am besten mit einem Prompt, der ihn nicht beim Namen nennt.',
        ],
        en: [
          '**When** should it apply? That becomes the `description`.',
          '**Which steps**, which rules, which output format?',
          '**Where** should it live - in the project (for the team) or personal?',
          '**Who** may trigger it - here only you, so `disable-model-invocation: true`.',
          'Afterwards: **read** the generated file, sharpen it and try the skill once - ideally with a prompt that does not name it.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Verwalten', en: 'Managing' } },
    {
      type: 'list',
      items: {
        de: [
          '`/skills` listet alle Skills mit Herkunft; Tippen filtert, `t` sortiert nach Tokenverbrauch.',
          'Projekt-Skills **committen** - so bekommt das ganze Team denselben Ablauf, und Änderungen laufen durchs Review.',
          'Ändern heißt: die SKILL.md bearbeiten. Löschen heißt: den Ordner löschen.',
          'Skills, die in mehreren Repos gebraucht werden, wandern in ein **Plugin** - mit eigenem Namensraum.',
          'Ältere `.claude/commands/name.md`-Dateien funktionieren weiter und erzeugen ebenfalls `/name`; neue Abläufe besser als Skill anlegen.',
        ],
        en: [
          '`/skills` lists all skills with their origin; typing filters, `t` sorts by token usage.',
          '**Commit** project skills - that way the whole team gets the same workflow, and changes go through review.',
          'Changing means editing the SKILL.md. Deleting means deleting the folder.',
          'Skills needed in several repos move into a **plugin** - with its own namespace.',
          'Older `.claude/commands/name.md` files keep working and create `/name` too; better create new workflows as skills.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Best Practices', en: 'Best practices' } },
    {
      type: 'list',
      items: {
        de: [
          '**Ein Skill, eine Aufgabe.** „review-and-deploy“ sind zwei Skills.',
          '**Die Beschreibung zuerst schreiben**: Was tut er, und „Use when …“. Das Wichtigste vorn - lange Beschreibungen werden gekürzt.',
          '**Kurz halten**: unter 500 Zeilen. Details, Vorlagen und Beispiele in Nachbardateien auslagern.',
          '**Konkret statt allgemein**: Befehle, Pfade, Ausgabeformat nennen. „Schreib gute Commits“ hilft niemandem.',
          '**Nebenwirkungen absichern**: Alles, was deployt, pusht oder löscht, bekommt `disable-model-invocation: true`.',
          '**Testen wie ein Nutzer**: Lädt Claude den Skill, wenn du das Problem beschreibst, ohne ihn zu nennen? Wenn nicht, ist die Beschreibung zu vage.',
        ],
        en: [
          '**One skill, one job.** "review-and-deploy" is two skills.',
          '**Write the description first**: what it does, and "Use when …". Most important first - long descriptions get cut.',
          '**Keep it short**: under 500 lines. Move details, templates and examples into sibling files.',
          '**Concrete, not general**: name commands, paths, output format. "Write good commits" helps nobody.',
          '**Guard side effects**: anything that deploys, pushes or deletes gets `disable-model-invocation: true`.',
          '**Test like a user**: does Claude load the skill when you describe the problem without naming it? If not, the description is too vague.',
        ],
      },
    },
  ],
  tasks: [
    { id: 'claude-skills-list', text: { de: 'Sieh nach, welche Skills es schon gibt.', en: 'Check which skills exist already.' }, command: '/skills', check: { type: 'command', name: '/skills' } },
    {
      id: 'claude-skills-auto',
      text: { de: 'Bitte um ein Review von `TodoList.tsx`, **ohne** den Skill zu nennen - Claude soll ihn selbst finden.', en: 'Ask for a review of `TodoList.tsx` **without** naming the skill - Claude should find it on its own.' },
      command: 'Please review the TodoList component',
      check: { type: 'skillInvoked', via: 'model' },
    },
    {
      id: 'claude-skills-create',
      text: { de: 'Lass Claude einen Projekt-Skill erstellen, z. B. `Erstelle einen Skill für Commit-Nachrichten`.', en: 'Let Claude create a project skill, e.g. `Create a skill for commit messages`.' },
      command: 'Create a skill for commit messages',
      check: { type: 'skillCreated', scope: 'project' },
    },
    {
      id: 'claude-skills-call',
      text: { de: 'Ruf deinen neuen Skill selbst mit `/name` auf - den Namen nennt Claude in seiner Antwort.', en: 'Call your new skill yourself with `/name` - Claude names it in its answer.' },
      check: { type: 'skillInvoked', via: 'slash' },
    },
    {
      id: 'claude-skills-plugin',
      text: { de: 'Ruf den Skill `release-notes` aus dem Plugin `team-tools` auf - mit Namensraum.', en: 'Call the skill `release-notes` from the plugin `team-tools` - with its namespace.' },
      command: '/team-tools:release-notes',
      check: { type: 'skillInvoked', name: 'team-tools:release-notes' },
    },
    {
      id: 'claude-skills-personal',
      text: { de: 'Erstelle einen **persönlichen** Skill, der in all deinen Projekten gilt.', en: 'Create a **personal** skill that works in all your projects.' },
      command: 'Create a personal skill for explaining regex',
      check: { type: 'skillCreated', scope: 'personal' },
    },
  ],
}
