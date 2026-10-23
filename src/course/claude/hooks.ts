import type { Lesson } from './types'

export const hooksLesson: Lesson = {
  id: 'claude-hooks',
  setup: { installed: true, loggedIn: true, inRepl: true, withMemory: true, withHooks: true, protectEnv: false },
  blocks: [
    { type: 'heading', text: { de: 'Was ist ein Hook?', en: 'What is a hook?' } },
    {
      type: 'text',
      text: {
        de: 'Ein **Hook** ist ein Shell-Befehl, den Claude Code an einem festen Punkt automatisch ausführt - etwa **nach jedem Edit** oder **vor jedem Werkzeugaufruf**. Anders als eine Bitte in CLAUDE.md passiert ein Hook immer: Er hängt nicht davon ab, ob das Modell daran denkt.',
        en: 'A **hook** is a shell command that Claude Code runs automatically at a fixed point - for example **after every edit** or **before every tool call**. Unlike a request in CLAUDE.md, a hook always happens: it does not depend on whether the model remembers it.',
      },
    },
    {
      type: 'table',
      head: { de: ['', 'Bitte in CLAUDE.md', 'Hook'], en: ['', 'Request in CLAUDE.md', 'Hook'] },
      rows: {
        de: [
          ['Wer handelt?', 'das Modell, wenn es daran denkt', 'Claude Code, jedes Mal'],
          ['Beispiel', '„Formatiere nach Änderungen“', 'Prettier läuft nach jedem Edit'],
          ['Kostet Kontext?', 'ja, bei jeder Anfrage', 'nein - nur seine Ausgabe, wenn es eine gibt'],
        ],
        en: [
          ['Who acts?', 'the model, if it remembers', 'Claude Code, every time'],
          ['Example', '"Format after changes"', 'Prettier runs after every edit'],
          ['Costs context?', 'yes, on every request', 'no - only its output, if there is any'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Die Ereignisse für den Einstieg', en: 'The events to start with' } },
    {
      type: 'table',
      head: { de: ['Ereignis', 'Wann', 'Typisch für'], en: ['Event', 'When', 'Typical for'] },
      rows: {
        de: [
          ['`PreToolUse`', 'vor einem Werkzeugaufruf', 'Aufrufe prüfen oder blockieren'],
          ['`PostToolUse`', 'nach einem erfolgreichen Werkzeugaufruf', 'formatieren, linten, protokollieren'],
          ['`UserPromptSubmit`', 'wenn du einen Prompt abschickst', 'Prompt prüfen, Kontext ergänzen'],
          ['`Notification`', 'wenn Claude deine Aufmerksamkeit braucht', 'Desktop-Benachrichtigung'],
          ['`Stop`', 'wenn Claude mit der Antwort fertig ist', 'prüfen, ob wirklich alles erledigt ist'],
          ['`SessionStart`', 'beim Start, Fortsetzen, nach /clear oder /compact', 'Kontext laden, z. B. offene Tickets'],
        ],
        en: [
          ['`PreToolUse`', 'before a tool call', 'check or block calls'],
          ['`PostToolUse`', 'after a successful tool call', 'format, lint, log'],
          ['`UserPromptSubmit`', 'when you send a prompt', 'check the prompt, add context'],
          ['`Notification`', 'when Claude needs your attention', 'desktop notification'],
          ['`Stop`', 'when Claude has finished its answer', 'check that everything is really done'],
          ['`SessionStart`', 'on start, resume, after /clear or /compact', 'load context, e.g. open tickets'],
        ],
      },
    },
    { type: 'heading', text: { de: 'So sieht ein Hook in den Einstellungen aus', en: 'What a hook looks like in the settings' } },
    {
      type: 'text',
      text: {
        de: 'Hooks stehen im Schlüssel `hooks` einer Einstellungsdatei - für das Team in `.claude/settings.json`. Darunter: das Ereignis, dann Gruppen mit einem `matcher` (für welche Werkzeuge), und darin die Befehle.',
        en: 'Hooks live under the `hooks` key of a settings file - for the team in `.claude/settings.json`. Below it: the event, then groups with a `matcher` (for which tools), and inside those the commands.',
      },
    },
    {
      type: 'code',
      language: 'json',
      caption: { de: '.claude/settings.json', en: '.claude/settings.json' },
      code: '{\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Edit|Write",\n        "hooks": [\n          { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/format.sh", "timeout": 30 }\n        ]\n      }\n    ]\n  }\n}',
    },
    {
      type: 'list',
      items: {
        de: [
          '`matcher`: Werkzeugnamen, mit `|` getrennt (`Edit|Write`). `*` oder ein leerer Matcher passen auf alles; andere Sonderzeichen machen ihn zu einem regulären Ausdruck, z. B. `mcp__memory__.*`.',
          '`${CLAUDE_PROJECT_DIR}` ist der Projektordner - so findet der Hook sein Skript, egal in welchem Unterordner Claude gerade arbeitet.',
          '`timeout` in Sekunden. Ohne Angabe darf ein Befehls-Hook bis zu 600 Sekunden laufen.',
          '`/hooks` zeigt alle Hooks mit ihrer Quelle an - ändern kannst du sie dort nicht, sondern nur in der Einstellungsdatei.',
        ],
        en: [
          '`matcher`: tool names separated by `|` (`Edit|Write`). `*` or an empty matcher match everything; other special characters turn it into a regular expression, e.g. `mcp__memory__.*`.',
          '`${CLAUDE_PROJECT_DIR}` is the project folder - so the hook finds its script no matter which subfolder Claude is working in.',
          '`timeout` in seconds. Without it, a command hook may run for up to 600 seconds.',
          '`/hooks` lists all hooks with their source - you cannot change them there, only in the settings file.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Was der Hook erfährt: JSON auf stdin', en: 'What the hook learns: JSON on stdin' } },
    {
      type: 'text',
      text: {
        de: 'Claude Code schickt jedem Hook ein JSON-Objekt auf die Standardeingabe. Es enthält u. a. `hook_event_name`, `session_id` und `cwd`, bei Werkzeug-Ereignissen zusätzlich `tool_name` und `tool_input` - also z. B. den Pfad der bearbeiteten Datei. Mit `jq` liest ein Skript genau das Feld, das es braucht:',
        en: 'Claude Code sends every hook a JSON object on standard input. It contains among others `hook_event_name`, `session_id` and `cwd`, for tool events also `tool_name` and `tool_input` - e.g. the path of the edited file. With `jq` a script reads exactly the field it needs:',
      },
    },
    {
      type: 'code',
      language: 'bash',
      caption: { de: '.claude/hooks/format.sh', en: '.claude/hooks/format.sh' },
      code: '#!/bin/bash\nfile=$(jq -r \'.tool_input.file_path // empty\')\n[[ -n "$file" && -f "$file" ]] || exit 0\nnpx prettier --write "$file" >/dev/null 2>&1\nexit 0',
    },
    { type: 'heading', text: { de: 'Exit-Codes: weiter, blockieren, Fehler', en: 'Exit codes: continue, block, error' } },
    {
      type: 'table',
      head: { de: ['Exit-Code', 'Bedeutung'], en: ['Exit code', 'Meaning'] },
      rows: {
        de: [
          ['`0`', 'Erfolg - es geht normal weiter. Ein JSON-Objekt auf stdout wird ausgewertet.'],
          ['`2`', 'Blockieren: bei `PreToolUse` findet der Aufruf nicht statt, bei `UserPromptSubmit` wird der Prompt verworfen, bei `Stop` arbeitet Claude weiter. stderr ist die Begründung.'],
          ['anderer, z. B. `1`', 'Fehler, der nicht blockiert - es gibt nur einen Hinweis.'],
        ],
        en: [
          ['`0`', 'Success - things go on as normal. A JSON object on stdout is evaluated.'],
          ['`2`', 'Block: for `PreToolUse` the call does not happen, for `UserPromptSubmit` the prompt is dropped, for `Stop` Claude keeps working. stderr is the reason.'],
          ['other, e.g. `1`', 'An error that does not block - there is only a notice.'],
        ],
      },
    },
    {
      type: 'text',
      text: {
        de: 'Statt über den Exit-Code kann ein `PreToolUse`-Hook auch per JSON entscheiden: `hookSpecificOutput` mit `permissionDecision` (`allow`, `deny`, `ask`) und einer Begründung. Wichtig: Ein `allow` aus einem Hook hebelt keine Deny- oder Ask-Regel aus.',
        en: 'Instead of the exit code, a `PreToolUse` hook can also decide through JSON: `hookSpecificOutput` with `permissionDecision` (`allow`, `deny`, `ask`) and a reason. Important: an `allow` from a hook does not override a deny or ask rule.',
      },
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: 'Im Terminal rechts sind zwei Hooks eingerichtet: ein Formatierer nach `Edit|Write` und ein Wächter-Skript vor `Read|Edit|Write`, das alles mit `.env` per Exit-Code 2 blockiert. `/hooks` zeigt beide.',
        en: 'The terminal on the right has two hooks set up: a formatter after `Edit|Write` and a guard script before `Read|Edit|Write` that blocks anything touching `.env` with exit code 2. `/hooks` shows both.',
      },
    },
    { type: 'heading', text: { de: 'Hooks und Sicherheit', en: 'Hooks and security' } },
    {
      type: 'list',
      items: {
        de: [
          'Hooks laufen mit **deinen** Rechten auf deinem Rechner. Ein Hook aus einem fremden Repo ist fremder Code - lies `.claude/settings.json`, bevor du einem neuen Projekt vertraust.',
          'Für **harte Verbote** empfiehlt die Doku Deny-Regeln (`"deny": ["Read(./.env)"]`), nicht Hooks. Hooks sind für Automatik gedacht, Regeln für Grenzen.',
          'Ein Hook, der hängt oder abbricht, blockiert `PreToolUse` nicht automatisch - noch ein Grund, Verbote als Regel zu schreiben.',
          'Lieber kleine, schnelle Skripte als viel Logik in einer JSON-Zeile.',
        ],
        en: [
          'Hooks run with **your** rights on your machine. A hook from someone else\'s repo is someone else\'s code - read `.claude/settings.json` before you trust a new project.',
          'For **hard bans** the docs recommend deny rules (`"deny": ["Read(./.env)"]`), not hooks. Hooks are meant for automation, rules for limits.',
          'A hook that hangs or times out does not block `PreToolUse` by itself - one more reason to write bans as rules.',
          'Prefer small, fast scripts over lots of logic in one JSON line.',
        ],
      },
    },
  ],
  tasks: [
    { id: 'claude-hooks-list', text: { de: 'Sieh dir die eingerichteten Hooks an.', en: 'Look at the hooks that are set up.' }, command: '/hooks', check: { type: 'command', name: '/hooks' } },
    {
      id: 'claude-hooks-block',
      text: { de: 'Bitte Claude, dir die `.env` zu zeigen - und sieh zu, wie der Wächter-Hook blockiert.', en: 'Ask Claude to show you the `.env` - and watch the guard hook block it.' },
      command: 'show me the .env file',
      check: { type: 'hookRan', event: 'PreToolUse', blocked: true },
    },
    {
      id: 'claude-hooks-format',
      text: { de: 'Lass Claude den Fehler beheben und achte auf die Zeile des Formatierer-Hooks nach dem Edit.', en: 'Let Claude fix the bug and watch for the formatter hook\'s line after the edit.' },
      command: 'Run the tests and fix the bug',
      check: { type: 'hookRan', event: 'PostToolUse' },
    },
    {
      id: 'claude-hooks-create',
      text: { de: 'Lass Claude einen Hook anlegen, der dich benachrichtigt, wenn es eine Eingabe braucht.', en: 'Let Claude create a hook that notifies you when it needs input.' },
      command: 'Add a hook that sends a notification when Claude needs input',
      check: { type: 'hookCreated', event: 'Notification' },
    },
  ],
  quiz: [
    {
      question: { de: 'Was unterscheidet einen Hook von einer Bitte in CLAUDE.md?', en: 'What sets a hook apart from a request in CLAUDE.md?' },
      answers: {
        de: ['Nichts, beides liest das Modell', 'Der Hook läuft immer, unabhängig davon, ob das Modell daran denkt', 'Hooks gelten nur im Plan-Modus', 'CLAUDE.md wird erzwungen, Hooks nicht'],
        en: ['Nothing, the model reads both', 'The hook always runs, whether or not the model remembers', 'Hooks only apply in plan mode', 'CLAUDE.md is enforced, hooks are not'],
      },
      correct: 1,
      explanation: {
        de: 'Hooks führt Claude Code selbst aus - deterministisch, an festen Punkten.',
        en: 'Claude Code runs hooks itself - deterministically, at fixed points.',
      },
    },
    {
      question: { de: 'Nach jedem Edit soll Prettier laufen. Welches Ereignis und welcher Matcher?', en: 'Prettier should run after every edit. Which event and which matcher?' },
      answers: {
        de: ['`PreToolUse` mit `Bash`', '`PostToolUse` mit `Edit|Write`', '`Stop` mit `*`', '`SessionStart` ohne Matcher'],
        en: ['`PreToolUse` with `Bash`', '`PostToolUse` with `Edit|Write`', '`Stop` with `*`', '`SessionStart` without a matcher'],
      },
      correct: 1,
      explanation: {
        de: '`PostToolUse` läuft nach dem Werkzeug; `Edit|Write` beschränkt ihn auf Dateiänderungen.',
        en: '`PostToolUse` runs after the tool; `Edit|Write` limits it to file changes.',
      },
    },
    {
      question: { de: 'Ein `PreToolUse`-Hook beendet sich mit Exit-Code 2. Was passiert?', en: 'A `PreToolUse` hook exits with code 2. What happens?' },
      answers: {
        de: ['Der Werkzeugaufruf wird blockiert, stderr ist die Begründung', 'Claude Code stürzt ab', 'Es gibt nur einen Hinweis, der Aufruf läuft', 'Der Hook wird neu gestartet'],
        en: ['The tool call is blocked, stderr is the reason', 'Claude Code crashes', 'There is only a notice, the call goes through', 'The hook is restarted'],
      },
      correct: 0,
      explanation: {
        de: 'Exit-Code 2 heißt „blockieren“. Andere Codes ungleich 0 sind Fehler, die nicht blockieren.',
        en: 'Exit code 2 means "block". Other non-zero codes are errors that do not block.',
      },
    },
    {
      question: { de: 'Wie erfährt ein Hook, welche Datei gerade bearbeitet wurde?', en: 'How does a hook learn which file was just edited?' },
      answers: {
        de: ['Aus einer Umgebungsvariable mit allen Dateien', 'Aus dem JSON auf stdin, z. B. `tool_input.file_path`', 'Er muss `git diff` aufrufen', 'Gar nicht'],
        en: ['From an environment variable with all files', 'From the JSON on stdin, e.g. `tool_input.file_path`', 'It has to call `git diff`', 'Not at all'],
      },
      correct: 1,
      explanation: {
        de: 'Claude Code schickt `tool_name` und `tool_input` als JSON; `jq` liest das Feld aus.',
        en: 'Claude Code sends `tool_name` and `tool_input` as JSON; `jq` reads the field.',
      },
    },
    {
      question: { de: '`.env` darf nie gelesen werden. Was empfiehlt die Doku dafür?', en: '`.env` must never be read. What do the docs recommend for that?' },
      answers: {
        de: ['Einen `PostToolUse`-Hook', 'Eine Deny-Regel `Read(./.env)` in den Einstellungen', 'Einen Satz in CLAUDE.md', 'Die Datei umbenennen'],
        en: ['A `PostToolUse` hook', 'A deny rule `Read(./.env)` in the settings', 'A sentence in CLAUDE.md', 'Renaming the file'],
      },
      correct: 1,
      explanation: {
        de: 'Für harte Grenzen sind Berechtigungsregeln gedacht. Hooks eignen sich für Automatik - ein hängender Hook blockiert z. B. nicht.',
        en: 'Permission rules are meant for hard limits. Hooks are for automation - a hook that hangs, for example, does not block.',
      },
    },
  ],
  keyPoints: {
    de: [
      'Hooks sind Shell-Befehle, die Claude Code an festen Punkten immer ausführt - anders als Bitten in CLAUDE.md.',
      'Für den Einstieg: `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Notification`, `Stop`, `SessionStart`.',
      'In `settings.json`: Ereignis → Gruppe mit `matcher` (z. B. `Edit|Write`) → Befehle; `/hooks` zeigt sie nur an.',
      'Der Hook bekommt JSON auf stdin (`tool_name`, `tool_input` …); Exit-Code 2 blockiert, andere Fehler nicht.',
      'Hooks laufen mit deinen Rechten - fremde Hooks prüfen. Harte Verbote gehören in Deny-Regeln.',
    ],
    en: [
      'Hooks are shell commands that Claude Code always runs at fixed points - unlike requests in CLAUDE.md.',
      'To start with: `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Notification`, `Stop`, `SessionStart`.',
      'In `settings.json`: event → group with `matcher` (e.g. `Edit|Write`) → commands; `/hooks` only shows them.',
      'The hook gets JSON on stdin (`tool_name`, `tool_input` …); exit code 2 blocks, other errors do not.',
      'Hooks run with your rights - check other people\'s hooks. Hard bans belong in deny rules.',
    ],
  },
}
