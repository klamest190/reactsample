import type { Lesson } from './types'

export const contextLesson: Lesson = {
  id: 'claude-context',
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
  quiz: [
    {
      question: { de: 'Wie lernt Claude Code ein Projekt kennen?', en: 'How does Claude Code get to know a project?' },
      answers: {
        de: ['Es lädt beim Start alle Dateien', 'Es erkundet mit Werkzeugen und liest gezielt, was es braucht', 'Es fragt dich nach jeder Datei', 'Über einen Index in der Cloud'],
        en: ['It loads every file on start', 'It explores with tools and reads what it needs', 'It asks you for every file', 'Through an index in the cloud'],
      },
      correct: 1,
      explanation: {
        de: 'Claude sucht und liest wie du im Terminal. Jede gelesene Datei landet im Kontext.',
        en: 'Claude searches and reads like you would in the terminal. Every file it reads lands in the context.',
      },
    },
    {
      question: { de: 'Was bewirkt `@src/App.tsx` in einem Prompt?', en: 'What does `@src/App.tsx` do in a prompt?' },
      answers: {
        de: ['Die Datei wird sofort in den Kontext gelesen', 'Die Datei wird gesperrt', 'Claude darf die Datei nicht ändern', 'Die Datei wird an Anthropic gemeldet'],
        en: ['The file is read into the context right away', 'The file gets locked', 'Claude may not change the file', 'The file is reported to Anthropic'],
      },
      correct: 0,
      explanation: {
        de: 'Mit `@` sagst du genau, worum es geht - Claude spart sich die Suche.',
        en: 'With `@` you say exactly what it is about - Claude saves itself the search.',
      },
    },
    {
      question: { de: 'Wohin gehört eine Regel, die nur für dich in diesem Projekt gilt?', en: 'Where does a rule go that applies only to you in this project?' },
      answers: { de: ['./CLAUDE.md', '~/.claude/CLAUDE.md', './CLAUDE.local.md', 'README.md'], en: ['./CLAUDE.md', '~/.claude/CLAUDE.md', './CLAUDE.local.md', 'README.md'] },
      correct: 2,
      explanation: {
        de: '`CLAUDE.local.md` gilt nur in diesem Projekt und gehört in `.gitignore`. `~/.claude/CLAUDE.md` gälte für alle deine Projekte.',
        en: '`CLAUDE.local.md` applies only to this project and belongs in `.gitignore`. `~/.claude/CLAUDE.md` would apply to all your projects.',
      },
    },
    {
      question: { de: 'Was gehört **nicht** in eine CLAUDE.md?', en: 'What does **not** belong in a CLAUDE.md?' },
      answers: {
        de: ['Wie man die Tests startet', 'Code-Konventionen des Teams', 'Eine Kopie aller Komponenten, damit Claude sie kennt', 'Stolperfallen, die Claude sonst falsch machen würde'],
        en: ['How to run the tests', 'The team’s code conventions', 'A copy of every component so Claude knows them', 'Pitfalls Claude would otherwise get wrong'],
      },
      correct: 2,
      explanation: {
        de: 'CLAUDE.md lädt bei jeder Anfrage. Was Claude ohnehin im Code sieht, kostet dort nur Kontext.',
        en: 'CLAUDE.md loads on every request. What Claude sees in the code anyway only costs context there.',
      },
    },
  ],
  keyPoints: {
    de: [
      'Claude erkundet das Projekt mit Werkzeugen; jede gelesene Datei bleibt im Kontext. `/context` zeigt die Aufteilung.',
      '`@pfad` holt eine Datei gezielt in den Kontext - genaue Prompts sparen Suche und Tokens.',
      'CLAUDE.md ist das Gedächtnis des Projekts: kurz, konkret, im Git. `/init` schreibt einen Entwurf, `/memory` öffnet die Dateien.',
      'Persönlich: `~/.claude/CLAUDE.md` (alle Projekte) und `CLAUDE.local.md` (dieses Projekt, nicht im Git).',
      'Für git nutzt Claude `git status`, `git diff` und `git log` - Ordner außerhalb gibst du mit `/add-dir` frei.',
    ],
    en: [
      'Claude explores the project with tools; every file it reads stays in the context. `/context` shows the split.',
      '`@path` brings a file into the context on purpose - precise prompts save searching and tokens.',
      'CLAUDE.md is the project memory: short, concrete, in git. `/init` writes a draft, `/memory` opens the files.',
      'Personal: `~/.claude/CLAUDE.md` (all projects) and `CLAUDE.local.md` (this project, not in git).',
      'For git Claude uses `git status`, `git diff` and `git log` - grant folders outside with `/add-dir`.',
    ],
  },
}
