import type { Lesson } from './types'

export const agentLoopLesson: Lesson = {
  id: 'claude-agent',
  setup: { installed: true, loggedIn: true, inRepl: true, withMemory: true },
  blocks: [
    { type: 'heading', text: { de: 'Der Loop: planen, handeln, prüfen', en: 'The loop: plan, act, check' } },
    {
      type: 'text',
      text: {
        de: 'Bittest du Claude „Lass die Tests laufen und behebe den Fehler“, entsteht kein einzelner Antworttext, sondern eine Schleife: Claude ruft ein Werkzeug auf, sieht das Ergebnis, entscheidet über den nächsten Schritt - so lange, bis die Aufgabe erledigt ist oder es dich braucht.',
        en: 'When you ask Claude "run the tests and fix the bug", you do not get one answer but a loop: Claude calls a tool, sees the result, decides on the next step - until the task is done or it needs you.',
      },
    },
    {
      type: 'code',
      language: 'text',
      caption: { de: 'Ein Durchlauf im Terminal rechts', en: 'One run in the terminal on the right' },
      code: '⏺ Bash(npm test)              → 1 test fails\n⏺ Read(src/hooks/useTodos.ts) → finds the bug\n⏺ Edit(src/hooks/useTodos.ts) → fixes it\n⏺ Bash(npm test)              → passes - done',
    },
    { type: 'heading', text: { de: 'Werkzeuge und ihr Risiko', en: 'Tools and their risk' } },
    {
      type: 'table',
      head: { de: ['Werkzeug', 'Tut', 'Fragt vorher?'], en: ['Tool', 'Does', 'Asks first?'] },
      rows: {
        de: [
          ['Read, Glob, Grep', 'Dateien lesen und suchen', 'nein - nur lesend'],
          ['Edit, Write', 'Dateien ändern oder anlegen', 'ja, zeigt den Diff'],
          ['Bash', 'Shell-Befehle ausführen', 'ja, je Befehl'],
          ['WebFetch, WebSearch', 'Seiten abrufen, im Web suchen', 'ja'],
          ['Skill, Agent', 'Skills laden, Subagenten starten', 'je nach Aufgabe'],
        ],
        en: [
          ['Read, Glob, Grep', 'read and search files', 'no - read only'],
          ['Edit, Write', 'change or create files', 'yes, shows the diff'],
          ['Bash', 'run shell commands', 'yes, per command'],
          ['WebFetch, WebSearch', 'fetch pages, search the web', 'yes'],
          ['Skill, Agent', 'load skills, start subagents', 'depends on the task'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Eingreifen: Ja, immer, Nein', en: 'Stepping in: yes, always, no' } },
    {
      type: 'list',
      items: {
        de: [
          '**1. Yes** - genau diesen Schritt erlauben. Der Standard, solange du Claude noch nicht kennst.',
          "**2. Yes, and don't ask again** - bei Bash wird daraus eine Regel wie `Bash(npm test *)` in `.claude/settings.local.json`; bei Dateiänderungen gilt es bis zum Ende der Sitzung.",
          '**3. No** - der Loop hält an, und Claude wartet auf deine Korrektur. Ablehnen ist kein Fehler, sondern Steuerung: „Nein, ändere den Test nicht, der Fehler liegt im Hook.“',
        ],
        en: [
          '**1. Yes** - allow exactly this step. The default while you are getting to know Claude.',
          "**2. Yes, and don't ask again** - for Bash this becomes a rule like `Bash(npm test *)` in `.claude/settings.local.json`; for file edits it lasts until the session ends.",
          '**3. No** - the loop stops and Claude waits for your correction. Rejecting is not a failure but steering: "No, don\'t change the test, the bug is in the hook."',
        ],
      },
    },
    {
      type: 'note',
      tone: 'warning',
      text: {
        de: 'Lies den Diff, bevor du Ja sagst - besonders, wenn Claude einen Test ändern will, damit er grün wird. Ein grüner Test, den Claude passend gemacht hat, beweist nichts.',
        en: 'Read the diff before you say yes - especially when Claude wants to change a test to make it pass. A green test that Claude bent to fit proves nothing.',
      },
    },
    { type: 'heading', text: { de: 'Berechtigungsmodi', en: 'Permission modes' } },
    {
      type: 'text',
      text: {
        de: '`Shift+Tab` wechselt den Modus; die Zeile unter der Eingabe zeigt den aktuellen. Im Terminal rechts klickst du dafür auf die Modus-Anzeige oder drückst Shift+Tab im Eingabefeld.',
        en: '`Shift+Tab` switches the mode; the line below the input shows the current one. In the terminal on the right, click the mode indicator or press Shift+Tab in the input.',
      },
    },
    {
      type: 'table',
      head: { de: ['Modus', 'Verhalten', 'Gut für'], en: ['Mode', 'Behaviour', 'Good for'] },
      rows: {
        de: [
          ['default (Manual)', 'fragt bei Änderungen und Befehlen', 'Neues, Unbekanntes'],
          ['acceptEdits', 'ändert Dateien ohne Rückfrage, fragt weiter bei Befehlen', 'wenn der Plan steht'],
          ['plan', 'liest und plant nur, ändert nichts', 'große Aufgaben: erst Plan prüfen'],
          ['auto', 'ein Klassifikator entscheidet, was ohne Rückfrage laufen darf', 'lange Läufe, wenn verfügbar'],
        ],
        en: [
          ['default (Manual)', 'asks before edits and commands', 'new, unknown work'],
          ['acceptEdits', 'edits files without asking, still asks for commands', 'once the plan is set'],
          ['plan', 'only reads and plans, changes nothing', 'big tasks: check the plan first'],
          ['auto', 'a classifier decides what may run without asking', 'long runs, where available'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Regeln fürs ganze Team', en: 'Rules for the whole team' } },
    {
      type: 'text',
      text: {
        de: 'Statt jeden Tag dieselben Befehle zu erlauben, schreibst du Regeln in `.claude/settings.json` (ins Git, gilt fürs Team) oder `.claude/settings.local.json` (nur du). `deny` schlägt `ask` schlägt `allow`. `/permissions` zeigt alle Regeln.',
        en: 'Instead of allowing the same commands every day, write rules into `.claude/settings.json` (in git, for the team) or `.claude/settings.local.json` (only you). `deny` beats `ask` beats `allow`. `/permissions` shows all rules.',
      },
    },
    {
      type: 'code',
      language: 'json',
      caption: { de: '.claude/settings.json', en: '.claude/settings.json' },
      code: '{\n  "permissions": {\n    "allow": ["Bash(npm test *)", "Bash(npm run lint)"],\n    "ask": ["Bash(git push *)"],\n    "deny": ["Read(./.env)", "Read(./secrets/**)"]\n  }\n}',
    },
    {
      type: 'text',
      text: {
        de: 'Und manchmal willst du selbst etwas ausführen, ohne Claude zu fragen: Ein `!` am Zeilenanfang schaltet in den Shell-Modus. `!npm test` läuft direkt - und die Ausgabe landet im Kontext, sodass Claude sie danach kennt.',
        en: 'And sometimes you want to run something yourself without asking Claude: a `!` at the start of the line switches to shell mode. `!npm test` runs directly - and its output lands in the context, so Claude knows it afterwards.',
      },
    },
  ],
  tasks: [
    {
      id: 'claude-agent-reject',
      text: { de: 'Bitte Claude, die Tests laufen zu lassen und den Fehler zu beheben - und **lehne** den ersten Befehl ab (`3`).', en: 'Ask Claude to run the tests and fix the bug - and **reject** the first command (`3`).' },
      command: 'Run the tests and fix the bug',
      check: { type: 'permission', answer: 'no' },
    },
    {
      id: 'claude-agent-always',
      text: { de: 'Bitte noch einmal - und erlaube `npm test` dauerhaft (`2`).', en: 'Ask again - and allow `npm test` for good (`2`).' },
      command: 'Run the tests and fix the bug',
      check: { type: 'permission', tool: 'Bash', answer: 'always' },
    },
    {
      id: 'claude-agent-edit',
      text: { de: 'Prüfe den Diff und lass Claude die Datei ändern.', en: 'Check the diff and let Claude change the file.' },
      check: { type: 'toolUsed', tool: 'Edit' },
    },
    { id: 'claude-agent-rules', text: { de: 'Sieh dir die entstandene Regel an.', en: 'Look at the rule that was created.' }, command: '/permissions', check: { type: 'command', name: '/permissions' } },
    { id: 'claude-agent-plan', text: { de: 'Wechsle mit Shift+Tab in den Plan-Modus.', en: 'Switch to plan mode with Shift+Tab.' }, check: { type: 'modeChanged', mode: 'plan' } },
    { id: 'claude-agent-shell', text: { de: 'Führe die Tests selbst im Shell-Modus aus.', en: 'Run the tests yourself in shell mode.' }, command: '!npm test', check: { type: 'bashMode' } },
  ],
  quiz: [
    {
      question: { de: 'Was ist der Agentic Loop?', en: 'What is the agentic loop?' },
      answers: {
        de: [
          'Claude wiederholt dieselbe Antwort, bis du zustimmst',
          'Werkzeug aufrufen, Ergebnis ansehen, nächsten Schritt wählen - bis die Aufgabe erledigt ist',
          'Eine Endlosschleife, die man mit Strg+C beendet',
          'Ein Test, der immer wieder läuft',
        ],
        en: ['Claude repeats the same answer until you agree', 'Call a tool, look at the result, pick the next step - until the task is done', 'An endless loop you end with Ctrl+C', 'A test that runs again and again'],
      },
      correct: 1,
      explanation: {
        de: 'Jedes Ergebnis fließt in die nächste Entscheidung ein - so findet Claude den Fehler, behebt ihn und prüft die Lösung.',
        en: 'Every result feeds the next decision - that is how Claude finds the bug, fixes it and checks the fix.',
      },
    },
    {
      question: { de: 'Du wählst bei `npm test` „Yes, and don’t ask again“. Was entsteht?', en: 'You pick "Yes, and don’t ask again" for `npm test`. What is created?' },
      answers: {
        de: ['Nichts - es gilt nur einmal', 'Die Regel `Bash(npm test *)` in `.claude/settings.local.json`', 'Claude darf ab jetzt jeden Befehl ausführen', 'Ein Eintrag in CLAUDE.md'],
        en: ['Nothing - it only applies once', 'The rule `Bash(npm test *)` in `.claude/settings.local.json`', 'Claude may run any command from now on', 'An entry in CLAUDE.md'],
      },
      correct: 1,
      explanation: {
        de: 'Die Regel erlaubt nur Befehle, die mit `npm test` beginnen - und nur für dich, weil die lokale Datei nicht ins Git gehört.',
        en: 'The rule only allows commands starting with `npm test` - and only for you, because the local file stays out of git.',
      },
    },
    {
      question: { de: 'Eine große Umbauaufgabe steht an. Welcher Modus ist der beste Start?', en: 'A big refactoring is ahead. Which mode is the best start?' },
      answers: { de: ['acceptEdits', 'plan', 'bypassPermissions', 'Print-Modus'], en: ['acceptEdits', 'plan', 'bypassPermissions', 'print mode'] },
      correct: 1,
      explanation: {
        de: 'Im Plan-Modus liest Claude nur und legt einen Plan vor. Erst wenn der stimmt, lässt du ihn umsetzen.',
        en: 'In plan mode Claude only reads and presents a plan. Only once it is right do you let it carry it out.',
      },
    },
    {
      question: {
        de: '`allow` enthält `Read(./**)`, `deny` enthält `Read(./.env)`. Darf Claude `.env` lesen?',
        en: '`allow` contains `Read(./**)`, `deny` contains `Read(./.env)`. May Claude read `.env`?',
      },
      answers: { de: ['Ja, allow kommt zuerst', 'Nein, deny schlägt allow', 'Nur nach Rückfrage', 'Nur im Plan-Modus'], en: ['Yes, allow comes first', 'No, deny beats allow', 'Only after asking', 'Only in plan mode'] },
      correct: 1,
      explanation: { de: 'Die Reihenfolge ist fest: deny vor ask vor allow.', en: 'The order is fixed: deny before ask before allow.' },
    },
  ],
  keyPoints: {
    de: [
      'Claude arbeitet in einer Schleife: Werkzeug aufrufen, Ergebnis prüfen, weiter - bis die Aufgabe erledigt ist.',
      'Lesen läuft ohne Rückfrage; Dateien ändern, Befehle und Web-Zugriffe fragen vorher.',
      'Yes erlaubt einmal, „don’t ask again“ legt eine Regel an, No hält den Loop an - und ist Steuerung, kein Fehler.',
      'Shift+Tab wechselt den Modus: default, acceptEdits, plan (und auto, wo verfügbar).',
      'Teamregeln stehen in `.claude/settings.json`; deny schlägt ask schlägt allow. `!befehl` führst du selbst aus.',
    ],
    en: [
      'Claude works in a loop: call a tool, check the result, go on - until the task is done.',
      'Reading runs without asking; changing files, commands and web access ask first.',
      'Yes allows once, "don’t ask again" creates a rule, No stops the loop - and is steering, not failure.',
      'Shift+Tab switches the mode: default, acceptEdits, plan (and auto where available).',
      'Team rules live in `.claude/settings.json`; deny beats ask beats allow. `!command` you run yourself.',
    ],
  },
}
