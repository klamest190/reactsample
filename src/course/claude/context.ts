import type { Lesson } from './types'

export const contextLesson: Lesson = {
  id: 'claude-context',
  title: { de: 'Kontext & Dateien', en: 'Context & Files' },
  summary: {
    de: 'Wie Claude Code dein Projekt liest, was CLAUDE.md bewirkt und wie du gezielt Dateien in den Kontext holst.',
    en: 'How Claude Code reads your project, what CLAUDE.md does and how you bring files into the context on purpose.',
  },
  minutes: 30,
  goals: {
    de: ['Erklären, wie Claude ein Projekt erkundet', 'Den Kontext mit /context sichtbar machen', 'Dateien mit @ gezielt in den Kontext holen', 'Mit /init und CLAUDE.md dauerhaftes Projektwissen anlegen', 'Git-Informationen von Claude auswerten lassen'],
    en: ['Explain how Claude explores a project', 'Make the context visible with /context', 'Bring files into the context with @', 'Create lasting project knowledge with /init and CLAUDE.md', 'Let Claude work with git information'],
  },
  keywords: ['context', 'Kontext', '/context', '@', 'mention', 'CLAUDE.md', '/init', '/memory', 'memory', 'git', 'git status', 'git diff', '/add-dir', '--add-dir', 'CLAUDE.local.md', 'AGENTS.md'],
  basics: ['claude-commands'],
  setup: { installed: true, loggedIn: true, inRepl: true },
  blocks: [
    { type: 'heading', text: { de: 'Kein Index - Claude liest wie du', en: 'No index - Claude reads like you do' } },
    {
      type: 'text',
      text: {
        de: 'Claude Code lädt dein Projekt nicht vorab in den Speicher. Es erkundet es mit Werkzeugen, so wie du es im Terminal tun würdest: Dateien suchen, hineinsehen, gezielt weiterlesen. Jede gelesene Datei landet im Kontext - und bleibt dort, bis das Gespräch verdichtet oder geleert wird.',
        en: 'Claude Code does not load your project into memory up front. It explores it with tools, the way you would in the terminal: find files, look inside, read on where it matters. Every file it reads lands in the context - and stays there until the conversation is compacted or cleared.',
      },
    },
    {
      type: 'text',
      text: {
        de: 'Vor deinem ersten Prompt ist trotzdem schon einiges im Kontext: die Systemanweisungen, die Beschreibungen der Werkzeuge, deine **CLAUDE.md**-Dateien und die Beschreibungen aller Skills. `/context` zeigt die Aufteilung als Raster.',
        en: 'Before your first prompt, some things are in the context already: the system instructions, the tool descriptions, your **CLAUDE.md** files and the descriptions of all skills. `/context` shows the split as a grid.',
      },
    },
    { type: 'heading', text: { de: 'Dateien gezielt erwähnen: @', en: 'Mentioning files: @' } },
    {
      type: 'text',
      text: {
        de: 'Mit `@` vervollständigt Claude Code Dateipfade und liest die Datei sofort ein. Das spart Suchschritte und macht klar, **worüber** du redest:',
        en: 'With `@` Claude Code completes file paths and reads the file right away. That saves search steps and makes clear **what** you are talking about:',
      },
    },
    { type: 'code', language: 'text', code: '> what does toggle in @src/hooks/useTodos.ts do?\n  ⎿ Read src/hooks/useTodos.ts (12 lines)' },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Je genauer der Prompt, desto weniger muss Claude suchen - und desto kleiner bleibt der Kontext. „Behebe den Fehler in @src/hooks/useTodos.ts, der Test in useTodos.test.ts schlägt fehl“ schlägt „Irgendwas ist kaputt“.',
        en: 'The more precise the prompt, the less Claude has to search - and the smaller the context stays. "Fix the bug in @src/hooks/useTodos.ts, the test in useTodos.test.ts fails" beats "something is broken".',
      },
    },
    { type: 'heading', text: { de: 'CLAUDE.md: das Gedächtnis des Projekts', en: 'CLAUDE.md: the project memory' } },
    {
      type: 'text',
      text: {
        de: 'Jede neue Sitzung beginnt ohne Erinnerung. Was Claude immer wissen soll - Befehle, Code-Stil, Stolperfallen -, gehört in eine **CLAUDE.md**. Sie wird bei jedem Start automatisch geladen. `/init` lässt Claude das Projekt untersuchen und einen ersten Entwurf schreiben; `/memory` öffnet die Dateien zum Bearbeiten.',
        en: 'Every new session starts without memory. What Claude should always know - commands, code style, pitfalls - belongs into a **CLAUDE.md**. It loads automatically on every start. `/init` lets Claude study the project and write a first draft; `/memory` opens the files for editing.',
      },
    },
    {
      type: 'table',
      head: { de: ['Datei', 'Gilt für', 'Ins Git?'], en: ['File', 'Applies to', 'In git?'] },
      rows: {
        de: [
          ['`~/.claude/CLAUDE.md`', 'alle deine Projekte', 'nein, persönlich'],
          ['`./CLAUDE.md` oder `./.claude/CLAUDE.md`', 'dieses Projekt, das ganze Team', 'ja'],
          ['`./CLAUDE.local.md`', 'dieses Projekt, nur du', 'nein, in .gitignore'],
          ['`src/…/CLAUDE.md`', 'nur diesen Unterordner - lädt erst, wenn Claude dort liest', 'ja'],
        ],
        en: [
          ['`~/.claude/CLAUDE.md`', 'all your projects', 'no, personal'],
          ['`./CLAUDE.md` or `./.claude/CLAUDE.md`', 'this project, the whole team', 'yes'],
          ['`./CLAUDE.local.md`', 'this project, only you', 'no, in .gitignore'],
          ['`src/…/CLAUDE.md`', 'only that subfolder - loads once Claude reads there', 'yes'],
        ],
      },
    },
    {
      type: 'code',
      language: 'markdown',
      caption: { de: 'Eine gute CLAUDE.md ist kurz und konkret', en: 'A good CLAUDE.md is short and concrete' },
      code: '# todo-app\n\n## Commands\n- `npm test` - Vitest, run before every commit\n- `npm run lint` - oxlint\n\n## Code style\n- State logic lives in hooks under src/hooks/\n- Tests next to the code: name.test.ts\n\nSee @README.md for the architecture.',
    },
    {
      type: 'note',
      tone: 'warning',
      text: {
        de: 'CLAUDE.md kostet bei **jeder** Anfrage Kontext. Schreib hinein, was Claude sonst falsch machen würde - nicht, was es aus dem Code ohnehin sieht. Mit `@pfad` bindest du weitere Dateien ein.',
        en: 'CLAUDE.md costs context on **every** request. Write what Claude would otherwise get wrong - not what it sees in the code anyway. `@path` imports further files.',
      },
    },
    { type: 'heading', text: { de: 'Git als Gedächtnis der Änderungen', en: 'Git as the memory of changes' } },
    {
      type: 'text',
      text: {
        de: 'Claude nutzt git wie du: `git status` und `git diff` zeigen, was sich geändert hat, `git log` erzählt die Geschichte. Frag einfach „Was hat sich geändert?“ oder „Schreib eine Commit-Nachricht und committe“. Weil Claude dafür Shell-Befehle ausführt, fragt es dich vorher (Modul 4).',
        en: 'Claude uses git like you do: `git status` and `git diff` show what changed, `git log` tells the history. Just ask "What changed?" or "Write a commit message and commit". Because Claude runs shell commands for that, it asks you first (module 4).',
      },
    },
    {
      type: 'text',
      text: {
        de: 'Braucht Claude Dateien außerhalb des Startordners - etwa ein gemeinsames Backend-Repo -, gibst du sie mit `claude --add-dir ../backend` oder in der Sitzung mit `/add-dir ../backend` frei.',
        en: 'If Claude needs files outside the start folder - say a shared backend repo - grant access with `claude --add-dir ../backend` or, in the session, `/add-dir ../backend`.',
      },
    },
  ],
  tasks: [
    { id: 'claude-context-context', text: { de: 'Sieh dir an, was schon im Kontext ist.', en: 'Look at what is in the context already.' }, command: '/context', check: { type: 'command', name: '/context' } },
    {
      id: 'claude-context-mention',
      text: { de: 'Frag nach einer Datei und hol sie mit `@` in den Kontext.', en: 'Ask about a file and bring it into the context with `@`.' },
      command: 'what does toggle in @src/hooks/useTodos.ts do?',
      check: { type: 'fileMentioned' },
    },
    {
      id: 'claude-context-init',
      text: { de: 'Lass Claude eine CLAUDE.md schreiben und bestätige das Anlegen.', en: 'Let Claude write a CLAUDE.md and confirm creating it.' },
      command: '/init',
      check: { type: 'memoryCreated' },
    },
    { id: 'claude-context-memory', text: { de: 'Öffne die Übersicht der Memory-Dateien.', en: 'Open the overview of memory files.' }, command: '/memory', check: { type: 'command', name: '/memory' } },
    {
      id: 'claude-context-git',
      text: { de: 'Frag Claude, was sich in git geändert hat.', en: 'Ask Claude what changed in git.' },
      command: 'What changed in git?',
      check: { type: 'gitInspected' },
    },
  ],
}
