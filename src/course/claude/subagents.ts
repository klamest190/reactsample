import type { Lesson } from './types'

export const subagentsLesson: Lesson = {
  id: 'claude-subagents',
  setup: { installed: true, loggedIn: true, inRepl: true, withMemory: true },
  blocks: [
    { type: 'heading', text: { de: 'Was ist ein Subagent?', en: 'What is a subagent?' } },
    {
      type: 'text',
      text: {
        de: 'Ein Subagent ist ein **zweiter Claude**, dem der Haupt-Claude eine Teilaufgabe übergibt. Er startet mit einem **eigenen, frischen Kontextfenster**: Systemanweisungen, dem Auftrag und - je nach Agent - CLAUDE.md und einem Blick auf git, aber **nicht** mit eurem bisherigen Gespräch. Er arbeitet die Aufgabe ab, liest dafür vielleicht Dutzende Dateien, und gibt am Ende nur eine **Zusammenfassung** zurück.',
        en: 'A subagent is a **second Claude** that the main Claude hands a sub-task to. It starts with its **own, fresh context window**: system instructions, the task and - depending on the agent - CLAUDE.md and a look at git, but **not** your conversation so far. It works through the task, maybe reading dozens of files, and in the end returns only a **summary**.',
      },
    },
    {
      type: 'code',
      language: 'text',
      caption: { de: 'So sieht das im Terminal aus', en: 'This is how it looks in the terminal' },
      code: '> Find all places where todos are changed\n⏺ Agent(Explore: find every place that changes todos)\n  ⎿ Done (9 tool uses · 24.6k tokens · 14s)\n  ⎿ src/hooks/useTodos.ts:7 add, :8 toggle (setTodos)\n  ⎿ src/components/TodoList.tsx:9 calls onToggle',
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: 'Der Agent hat rund 25.000 Tokens gelesen - in **deinem** Kontext landen davon nur die paar Zeilen Ergebnis. Genau das ist der Sinn: Recherche passiert nebenan, das Hauptgespräch bleibt schlank und aufmerksam.',
        en: 'The agent read about 25,000 tokens - only the few lines of its result land in **your** context. That is the whole point: research happens next door, the main conversation stays lean and attentive.',
      },
    },
    { type: 'heading', text: { de: 'Wozu aufteilen?', en: 'Why split the work?' } },
    {
      type: 'list',
      items: {
        de: [
          '**Kontext sparen**: Breite Suchen, lange Logs, viele Dateien - all das verstopft das Hauptgespräch. Ein Subagent schluckt es und meldet nur das Ergebnis.',
          '**Spezialisten**: Ein eigener Subagent hat seine eigene Anleitung, eigene Werkzeuge und auf Wunsch ein eigenes Modell - z. B. ein Reviewer, der nur lesen darf.',
          '**Parallel arbeiten**: Mehrere Subagents können gleichzeitig laufen, etwa einer pro Modul.',
          '**Saubere Trennung**: Der Subagent kennt dein Gespräch nicht - er urteilt unvoreingenommen, z. B. beim Review von Code, den Claude gerade selbst geschrieben hat.',
        ],
        en: [
          '**Save context**: broad searches, long logs, many files - all of that clogs the main conversation. A subagent swallows it and reports only the result.',
          '**Specialists**: a custom subagent has its own instructions, its own tools and, if you like, its own model - e.g. a reviewer that may only read.',
          '**Work in parallel**: several subagents can run at the same time, say one per module.',
          '**Clean separation**: the subagent does not know your conversation - it judges without bias, e.g. when reviewing code Claude has just written itself.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Die eingebauten Subagents', en: 'The built-in subagents' } },
    {
      type: 'table',
      head: { de: ['Subagent', 'Wofür', 'Werkzeuge'], en: ['Subagent', 'For', 'Tools'] },
      rows: {
        de: [
          ['Explore', 'schnelle Suche im Code, mit Gründlichkeit „quick“, „medium“ oder „very thorough“', 'nur lesend - Edit und Write sind gesperrt'],
          ['Plan', 'Recherche im Plan-Modus, bevor Claude einen Plan vorlegt', 'nur lesend'],
          ['general-purpose', 'mehrstufige Aufgaben, die auch Änderungen brauchen', 'alle Werkzeuge'],
        ],
        en: [
          ['Explore', 'fast code search, with thoroughness "quick", "medium" or "very thorough"', 'read-only - Edit and Write are denied'],
          ['Plan', 'research in plan mode before Claude presents a plan', 'read-only'],
          ['general-purpose', 'multi-step tasks that also need changes', 'all tools'],
        ],
      },
    },
    {
      type: 'text',
      text: {
        de: 'Du musst dafür nichts einrichten. Fragst du etwas Breites wie „Finde alle Stellen, an denen Todos geändert werden“, schickt Claude von selbst Explore los.',
        en: 'You do not need to set anything up. Ask something broad like "find all places where todos are changed" and Claude sends Explore on its own.',
      },
    },
    { type: 'heading', text: { de: 'Wie Claude delegiert', en: 'How Claude delegates' } },
    {
      type: 'text',
      text: {
        de: 'Jeder Subagent hat eine **Beschreibung**. Claude liest sie wie bei Skills und entscheidet daran, ob eine Aufgabe passt. Formulierungen wie „Use proactively after code changes“ machen Claude eifriger. Du kannst auch ausdrücklich delegieren - im Prompt, oder indem du `@` tippst und den Agenten aus der Liste wählst:',
        en: 'Every subagent has a **description**. Like with skills, Claude reads it and decides from it whether a task fits. Phrases like "Use proactively after code changes" make Claude more eager. You can also delegate explicitly - in the prompt, or by typing `@` and picking the agent from the list:',
      },
    },
    {
      type: 'code',
      language: 'text',
      code: '> Use the code-improver agent to review src/hooks/useTodos.ts',
    },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Der Subagent sieht dein Gespräch nicht. Alles, was er wissen muss - Dateien, Ziel, Einschränkungen -, muss im Auftrag stehen. Claude formuliert diesen Auftrag selbst; je klarer dein Prompt, desto besser wird er.',
        en: 'The subagent does not see your conversation. Everything it needs - files, goal, constraints - has to be in the task. Claude writes that task itself; the clearer your prompt, the better it gets.',
      },
    },
    { type: 'heading', text: { de: 'Eigene Subagents', en: 'Custom subagents' } },
    {
      type: 'text',
      text: {
        de: 'Ein eigener Subagent ist eine Markdown-Datei mit Frontmatter. Der Text darunter ist seine Systemanweisung - seine „Persönlichkeit“. Am einfachsten lässt du Claude die Datei anlegen und liest sie danach durch.',
        en: 'A custom subagent is a Markdown file with frontmatter. The text below it is its system prompt - its "personality". The easiest way is to let Claude create the file and then read it through.',
      },
    },
    {
      type: 'code',
      language: 'markdown',
      caption: { de: '.claude/agents/code-improver.md', en: '.claude/agents/code-improver.md' },
      code: '---\nname: code-improver\ndescription: Scans files and suggests improvements. Use after writing or modifying code.\ntools: Read, Grep, Glob\nmodel: sonnet\n---\n\nYou are a code improvement specialist.\n\n1. Read the files you were given\n2. Suggest concrete improvements with file:line\n3. Do not change any file yourself',
    },
    {
      type: 'table',
      head: { de: ['Feld', 'Bedeutung'], en: ['Field', 'Meaning'] },
      rows: {
        de: [
          ['`name`', 'Pflicht. Der Name, unter dem Claude den Agenten kennt (ohne `:`)'],
          ['`description`', 'Pflicht. Wann der Agent passt - daran entscheidet Claude'],
          ['`tools`', 'erlaubte Werkzeuge; fehlt das Feld, erbt er alle'],
          ['`model`', '`sonnet`, `opus`, `haiku`, `fable`, eine volle Modell-ID oder `inherit`'],
          ['`permissionMode`', 'eigener Berechtigungsmodus, z. B. `plan` oder `acceptEdits`'],
          ['`color`', 'Farbe in der Anzeige, z. B. `blue` oder `green`'],
        ],
        en: [
          ['`name`', 'Required. The name Claude knows the agent by (no `:`)'],
          ['`description`', 'Required. When the agent fits - Claude decides by it'],
          ['`tools`', 'allowed tools; without the field it inherits all'],
          ['`model`', '`sonnet`, `opus`, `haiku`, `fable`, a full model ID or `inherit`'],
          ['`permissionMode`', 'its own permission mode, e.g. `plan` or `acceptEdits`'],
          ['`color`', 'colour in the display, e.g. `blue` or `green`'],
        ],
      },
    },
    {
      type: 'table',
      head: { de: ['Ort', 'Gilt für', 'Vorrang'], en: ['Location', 'Applies to', 'Priority'] },
      rows: {
        de: [
          ['verwaltete Einstellungen', 'die ganze Organisation', '1 (höchster)'],
          ['`--agents` (JSON beim Start)', 'nur diese Sitzung', '2'],
          ['`.claude/agents/`', 'dieses Projekt - committen, fürs Team', '3'],
          ['`~/.claude/agents/`', 'alle deine Projekte', '4'],
          ['`agents/` eines Plugins', 'wer das Plugin installiert hat', '5'],
        ],
        en: [
          ['managed settings', 'the whole organization', '1 (highest)'],
          ['`--agents` (JSON at start)', 'this session only', '2'],
          ['`.claude/agents/`', 'this project - commit it, for the team', '3'],
          ['`~/.claude/agents/`', 'all your projects', '4'],
          ['a plugin’s `agents/`', 'whoever installed the plugin', '5'],
        ],
      },
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: '`/agents` öffnet seit Version 2.1.198 keinen Assistenten mehr, sondern erinnert daran, Claude um einen Subagent zu bitten oder die Datei in `.claude/agents/` bzw. `~/.claude/agents/` zu bearbeiten.',
        en: 'Since version 2.1.198, `/agents` no longer opens a wizard; it reminds you to ask Claude for a subagent or to edit the file in `.claude/agents/` or `~/.claude/agents/`.',
      },
    },
    { type: 'heading', text: { de: 'Subagent oder Skill?', en: 'Subagent or skill?' } },
    {
      type: 'table',
      head: { de: ['', 'Skill', 'Subagent'], en: ['', 'Skill', 'Subagent'] },
      rows: {
        de: [
          ['Was', 'eine Anleitung für einen Ablauf', 'eine eigene Rolle mit eigener Anleitung'],
          ['Kontext', 'läuft im Hauptgespräch (außer mit `context: fork`)', 'immer eigenes, frisches Kontextfenster'],
          ['Werkzeuge, Modell', 'die des Hauptgesprächs', 'eigene Auswahl möglich'],
          ['Gut für', 'wiederholbare Abläufe: Review-Checkliste, Release Notes', 'Recherche, Spezialisten, Arbeit nebenher'],
        ],
        en: [
          ['What', 'instructions for a workflow', 'a role of its own with its own instructions'],
          ['Context', 'runs in the main conversation (unless `context: fork`)', 'always its own, fresh context window'],
          ['Tools, model', 'those of the main conversation', 'its own selection possible'],
          ['Good for', 'repeatable workflows: review checklist, release notes', 'research, specialists, work on the side'],
        ],
      },
    },
    {
      type: 'text',
      text: {
        de: 'Beides lässt sich verbinden: Ein Skill mit `context: fork` läuft in einem Subagent, mit `agent:` wählst du dessen Typ. Mehr zu Skills in [[claude-skills]].',
        en: 'The two combine: a skill with `context: fork` runs in a subagent, and `agent:` picks its type. More on skills in [[claude-skills]].',
      },
    },
    { type: 'heading', text: { de: 'Vordergrund, Hintergrund, parallel', en: 'Foreground, background, parallel' } },
    {
      type: 'list',
      items: {
        de: [
          'Im **Vordergrund** wartet das Hauptgespräch, bis der Subagent fertig ist.',
          'Im **Hintergrund** läuft er nebenher, und du arbeitest weiter. `Strg+B` schiebt einen laufenden Subagent in den Hintergrund.',
          'Mehrere Subagents können **gleichzeitig** laufen - standardmäßig bis zu 20 (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`).',
          'Jeder Subagent kostet eigene Tokens. Für eine Frage zu einer einzelnen Datei lohnt er nicht - dafür reicht `@datei`.',
        ],
        en: [
          'In the **foreground** the main conversation waits until the subagent is done.',
          'In the **background** it runs alongside and you keep working. `Ctrl+B` moves a running subagent to the background.',
          'Several subagents can run **at the same time** - up to 20 by default (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`).',
          'Every subagent costs tokens of its own. For a question about a single file it is not worth it - `@file` does the job.',
        ],
      },
    },
  ],
  tasks: [
    {
      id: 'claude-subagents-explore',
      text: { de: 'Stell eine breite Suchfrage - Claude soll den Explore-Agenten schicken.', en: 'Ask a broad search question - Claude should send the Explore agent.' },
      command: 'Find all places where todos are changed',
      check: { type: 'subagentUsed', agent: 'Explore' },
    },
    {
      id: 'claude-subagents-context',
      text: { de: 'Sieh nach, wie wenig davon im Hauptkontext gelandet ist.', en: 'Check how little of it landed in the main context.' },
      command: '/context',
      check: { type: 'command', name: '/context' },
    },
    {
      id: 'claude-subagents-create',
      text: { de: 'Lass Claude einen eigenen Subagent für Security-Reviews anlegen und bestätige die Datei.', en: 'Let Claude create a custom subagent for security reviews and confirm the file.' },
      command: 'Create a subagent for security reviews',
      check: { type: 'agentCreated' },
    },
    {
      id: 'claude-subagents-use',
      text: { de: 'Beauftrage deinen neuen Agenten ausdrücklich mit einer Prüfung.', en: 'Explicitly give your new agent a check to do.' },
      command: 'Use the security-reviews agent to check the app',
      check: { type: 'subagentUsed', agent: 'security-reviews' },
    },
    { id: 'claude-subagents-list', text: { de: 'Lass dir alle Subagents anzeigen.', en: 'List all subagents.' }, command: '/agents', check: { type: 'command', name: '/agents' } },
  ],
  quiz: [
    {
      question: { de: 'Was bekommt das Hauptgespräch zurück, wenn ein Subagent fertig ist?', en: 'What does the main conversation get back when a subagent is done?' },
      answers: {
        de: ['Alle Dateien, die er gelesen hat', 'Nur seine Zusammenfassung', 'Gar nichts - er ändert nur Dateien', 'Sein komplettes Gesprächsprotokoll'],
        en: ['Every file it read', 'Only its summary', 'Nothing - it only changes files', 'Its complete transcript'],
      },
      correct: 1,
      explanation: {
        de: 'Der Subagent arbeitet in einem eigenen Kontextfenster. Zurück kommt nur das Ergebnis - so bleibt dein Kontext klein.',
        en: 'The subagent works in a context window of its own. Only the result comes back - that keeps your context small.',
      },
    },
    {
      question: { de: 'Welcher eingebaute Subagent passt für „Wo wird überall `fetch` aufgerufen?“', en: 'Which built-in subagent fits "Where is `fetch` called?"' },
      answers: { de: ['Explore', 'Plan', 'general-purpose', 'keiner - das geht nur per Hand'], en: ['Explore', 'Plan', 'general-purpose', 'none - that only works by hand'] },
      correct: 0,
      explanation: {
        de: 'Explore ist für schnelle, nur lesende Suchen im Code gemacht.',
        en: 'Explore is made for fast, read-only searches in the code.',
      },
    },
    {
      question: { de: 'Welche Felder braucht eine Subagent-Datei mindestens?', en: 'Which fields does a subagent file need at least?' },
      answers: {
        de: ['`name` und `description`', '`name`, `tools` und `model`', 'nur `tools`', 'keine - der Dateiname reicht'],
        en: ['`name` and `description`', '`name`, `tools` and `model`', 'only `tools`', 'none - the file name is enough'],
      },
      correct: 0,
      explanation: {
        de: 'Ohne `tools` erbt der Agent alle Werkzeuge, ohne `model` legt er kein eigenes Modell fest. Name und Beschreibung sind Pflicht.',
        en: 'Without `tools` the agent inherits all tools, without `model` it sets no model of its own. Name and description are required.',
      },
    },
    {
      question: { de: 'Warum sieht ein Subagent dein bisheriges Gespräch nicht?', en: 'Why does a subagent not see your conversation so far?' },
      answers: {
        de: ['Aus Datenschutzgründen', 'Weil er ein frisches Kontextfenster bekommt - das hält ihn fokussiert und den Kontext klein', 'Weil er ein anderes Modell nutzt', 'Er sieht es doch'],
        en: ['For privacy reasons', 'Because it gets a fresh context window - that keeps it focused and the context small', 'Because it uses another model', 'It does see it'],
      },
      correct: 1,
      explanation: {
        de: 'Frischer Kontext ist der Kern der Idee. Was er wissen muss, steht im Auftrag, den Claude ihm schreibt.',
        en: 'A fresh context is the core of the idea. What it needs to know is in the task Claude writes for it.',
      },
    },
    {
      question: { de: 'Du willst eine wiederholbare Review-Checkliste. Skill oder Subagent?', en: 'You want a repeatable review checklist. Skill or subagent?' },
      answers: {
        de: ['Skill - ein Ablauf, der im Gespräch läuft', 'Subagent - Checklisten brauchen ein eigenes Modell', 'Beides geht nicht', 'Ein Hook'],
        en: ['Skill - a workflow that runs in the conversation', 'Subagent - checklists need a model of their own', 'Neither works', 'A hook'],
      },
      correct: 0,
      explanation: {
        de: 'Skills sind für wiederholbare Abläufe gedacht. Subagents lohnen sich, wenn die Arbeit isoliert laufen oder eine eigene Rolle haben soll.',
        en: 'Skills are meant for repeatable workflows. Subagents pay off when the work should run isolated or have a role of its own.',
      },
    },
  ],
  keyPoints: {
    de: [
      'Ein Subagent arbeitet in einem eigenen, frischen Kontextfenster und gibt nur eine Zusammenfassung zurück.',
      'Eingebaut: Explore (schnelle Suche, nur lesend), Plan (Recherche im Plan-Modus), general-purpose (alle Werkzeuge).',
      'Claude delegiert anhand der `description`; ausdrücklich geht es mit „Use the X agent to …“ oder `@`.',
      'Eigene Subagents sind Markdown-Dateien in `.claude/agents/` (Team) oder `~/.claude/agents/` (du), Pflicht: `name` und `description`.',
      'Skill für wiederholbare Abläufe, Subagent für Recherche, Spezialisten und Arbeit nebenher.',
    ],
    en: [
      'A subagent works in its own, fresh context window and returns only a summary.',
      'Built in: Explore (fast search, read-only), Plan (research in plan mode), general-purpose (all tools).',
      'Claude delegates by the `description`; explicitly with "Use the X agent to …" or `@`.',
      'Custom subagents are Markdown files in `.claude/agents/` (team) or `~/.claude/agents/` (you); required: `name` and `description`.',
      'Skill for repeatable workflows, subagent for research, specialists and work on the side.',
    ],
  },
}
