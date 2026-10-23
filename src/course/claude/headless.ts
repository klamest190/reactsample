import type { Lesson } from './types'

export const headlessLesson: Lesson = {
  id: 'claude-headless',
  setup: { installed: true, loggedIn: true, inRepl: false },
  blocks: [
    { type: 'heading', text: { de: 'Claude ohne Terminal-Sitzung', en: 'Claude without a terminal session' } },
    {
      type: 'text',
      text: {
        de: 'Bisher hast du mit Claude gesprochen: Prompt tippen, Antwort lesen, Erlaubnis geben. Für Skripte, Git-Hooks oder die CI gibt es niemanden, der tippt oder auf „Yes“ drückt. Dafür hat Claude Code den **Print-Modus** (`-p`, auch „headless“): eine Frage rein, eine Antwort raus, danach beendet sich der Prozess.',
        en: 'So far you have talked to Claude: type a prompt, read the answer, grant permission. In scripts, git hooks or CI nobody types or presses "Yes". For that Claude Code has **print mode** (`-p`, also "headless"): one question in, one answer out, then the process exits.',
      },
    },
    {
      type: 'code',
      language: 'bash',
      code: 'claude -p "explain this project"                     # answer as text, then exit\ncat error.log | claude -p "what went wrong?"           # stdin becomes part of the prompt\nclaude -c -p "now write a test for it"                # continue the last interactive conversation (-c skips -p sessions)',
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: 'Der Print-Modus ist derselbe Agent mit denselben Werkzeugen und demselben Loop - nur ohne Dialog. Was im Dialog eine Rückfrage wäre, wird hier **abgelehnt**, solange du es nicht vorab erlaubst.',
        en: 'Print mode is the same agent with the same tools and the same loop - just without a dialog. What would be a question in the dialog is **denied** here unless you allow it up front.',
      },
    },
    { type: 'heading', text: { de: 'Ausgabeformate', en: 'Output formats' } },
    {
      type: 'table',
      head: { de: ['Format', 'Liefert', 'Gut für'], en: ['Format', 'Returns', 'Good for'] },
      rows: {
        de: [
          ['`--output-format text`', 'nur den Antworttext (Standard)', 'Menschen, einfache Skripte'],
          ['`--output-format json`', 'ein JSON-Objekt mit `result`, `session_id`, `total_cost_usd` …', 'Skripte, die weiterarbeiten'],
          ['`--output-format stream-json`', 'ein JSON-Objekt pro Zeile, die letzte ist das Ergebnis', 'Fortschritt live mitlesen'],
        ],
        en: [
          ['`--output-format text`', 'just the answer text (default)', 'humans, simple scripts'],
          ['`--output-format json`', 'one JSON object with `result`, `session_id`, `total_cost_usd` …', 'scripts that work on with it'],
          ['`--output-format stream-json`', 'one JSON object per line, the last one is the result', 'following progress live'],
        ],
      },
    },
    {
      type: 'code',
      language: 'bash',
      caption: { de: 'Die Sitzungs-ID merken und später fortsetzen', en: 'Keep the session id and continue later' },
      code: 'session_id=$(claude -p "review src/hooks/useTodos.ts" --output-format json | jq -r \'.session_id\')\nclaude -p "now fix what you found" --resume "$session_id"',
    },
    {
      type: 'text',
      text: {
        de: 'Mit `--json-schema \'{…}\'` und JSON-Ausgabe bekommst du zusätzlich `structured_output` - Daten in genau der Form, die dein Skript erwartet. `total_cost_usd` ist eine Schätzung auf deinem Rechner, keine Rechnung.',
        en: 'With `--json-schema \'{…}\'` and JSON output you also get `structured_output` - data in exactly the shape your script expects. `total_cost_usd` is an estimate on your machine, not an invoice.',
      },
    },
    { type: 'heading', text: { de: 'Was darf Claude ohne Rückfrage?', en: 'What may Claude do without asking?' } },
    {
      type: 'text',
      text: {
        de: 'Lesen geht immer. Alles, was im Dialog eine Erlaubnis bräuchte - Dateien ändern, Befehle ausführen -, gibst du im Print-Modus mit Flags frei. Die Regeln haben dieselbe Form wie in `settings.json`.',
        en: 'Reading always works. Everything that would need permission in the dialog - changing files, running commands - you grant with flags in print mode. The rules have the same shape as in `settings.json`.',
      },
    },
    {
      type: 'table',
      head: { de: ['Flag', 'Wirkung'], en: ['Flag', 'Effect'] },
      rows: {
        de: [
          ['`--allowedTools "Read,Edit,Bash(npm test *)"`', 'genau diese Werkzeuge und Befehle ohne Rückfrage'],
          ['`--disallowedTools "Bash(git push *)"`', 'diese Werkzeuge nie'],
          ['`--permission-mode dontAsk`', 'alles, was fragen würde, wird abgelehnt'],
          ['`--max-turns 5`', 'höchstens fünf Runden im Loop, dann Abbruch mit Fehler'],
          ['`--max-budget-usd 5.00`', 'Obergrenze für die geschätzten Kosten'],
          ['`--append-system-prompt "…"`', 'eigene Anweisungen an den Systemprompt anhängen'],
        ],
        en: [
          ['`--allowedTools "Read,Edit,Bash(npm test *)"`', 'exactly these tools and commands without asking'],
          ['`--disallowedTools "Bash(git push *)"`', 'never these tools'],
          ['`--permission-mode dontAsk`', 'everything that would ask is denied'],
          ['`--max-turns 5`', 'at most five rounds of the loop, then it stops with an error'],
          ['`--max-budget-usd 5.00`', 'upper limit for the estimated cost'],
          ['`--append-system-prompt "…"`', 'append your own instructions to the system prompt'],
        ],
      },
    },
    {
      type: 'code',
      language: 'bash',
      caption: { de: 'Ein Fix ohne Mensch - aber nur mit diesen Werkzeugen', en: 'A fix without a human - but only with these tools' },
      code: 'claude -p "fix the failing test" \\\n  --allowedTools "Edit,Bash(npm test *)" \\\n  --max-turns 10 \\\n  --output-format json',
    },
    {
      type: 'note',
      tone: 'warning',
      text: {
        de: 'Im Print-Modus gibt es **keinen Vertrauensdialog** für neue Ordner und **keine Rückfrage** für Server aus `.mcp.json`. Für Skripte und CI empfiehlt die Doku `--bare`: Dann lädt Claude Code keine Hooks, Skills, Plugins, MCP-Server, kein Auto-Memory und keine CLAUDE.md - und meldet sich nur per `ANTHROPIC_API_KEY` (oder `apiKeyHelper`) an.',
        en: 'In print mode there is **no trust dialog** for new folders and **no question** for servers from `.mcp.json`. For scripts and CI the docs recommend `--bare`: Claude Code then loads no hooks, skills, plugins, MCP servers, auto memory or CLAUDE.md - and signs in only via `ANTHROPIC_API_KEY` (or `apiKeyHelper`).',
      },
    },
    { type: 'heading', text: { de: 'Claude in GitHub Actions', en: 'Claude in GitHub Actions' } },
    {
      type: 'text',
      text: {
        de: 'Die offizielle Action `anthropics/claude-code-action@v1` bringt Claude in Pull Requests und Issues. Am schnellsten richtest du sie in einer Claude-Code-Sitzung im Repo mit `/install-github-app` ein - dafür brauchst du Admin-Rechte am Repo und die GitHub CLI (`gh auth login`). Der Befehl installiert die Claude GitHub App, speichert das Secret und öffnet einen PR mit dem Workflow.',
        en: 'The official action `anthropics/claude-code-action@v1` brings Claude into pull requests and issues. The quickest setup is `/install-github-app` in a Claude Code session in the repo - you need admin rights on the repo and the GitHub CLI (`gh auth login`). The command installs the Claude GitHub App, stores the secret and opens a PR with the workflow.',
      },
    },
    {
      type: 'code',
      language: 'text',
      caption: { de: '.github/workflows/claude.yml - reagiert auf @claude in Kommentaren', en: '.github/workflows/claude.yml - reacts to @claude in comments' },
      code: "on:\n  issue_comment: { types: [created] }\n  pull_request_review_comment: { types: [created] }\njobs:\n  claude:\n    if: contains(github.event.comment.body, '@claude')\n    runs-on: ubuntu-latest\n    permissions: { contents: write, pull-requests: write, issues: write, id-token: write, actions: read }\n    steps:\n      - uses: actions/checkout@v6\n        with: { fetch-depth: 1 }\n      - uses: anthropics/claude-code-action@v1\n        with:\n          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}",
    },
    {
      type: 'list',
      items: {
        de: [
          '**Interaktiv** (ohne `prompt`): Claude antwortet, wenn jemand `@claude` in einen Kommentar schreibt - z. B. „@claude behebe den Typfehler in diesem PR“.',
          '**Automatisch** (mit `prompt`): Claude läuft bei jedem passenden Ereignis, auch nach Zeitplan (`schedule`) - z. B. ein Review bei jedem neuen PR.',
          'Als Secret entweder `ANTHROPIC_API_KEY` oder `CLAUDE_CODE_OAUTH_TOKEN` - Letzteres erzeugt `claude setup-token` für dein Abo.',
          'Mit `claude_args` gibst du dieselben Flags mit wie lokal, z. B. `--max-turns 5 --allowedTools "…"`.',
          'Nur Leute mit Schreibrechten können Claude auslösen; Bots werden abgewiesen, wenn sie nicht in `allowed_bots` stehen.',
        ],
        en: [
          '**Interactive** (no `prompt`): Claude answers when someone writes `@claude` in a comment - e.g. "@claude fix the type error in this PR".',
          '**Automated** (with `prompt`): Claude runs on every matching event, also on a schedule (`schedule`) - e.g. a review for every new PR.',
          'As the secret either `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN` - the latter comes from `claude setup-token` for your subscription.',
          'With `claude_args` you pass the same flags as locally, e.g. `--max-turns 5 --allowedTools "…"`.',
          'Only people with write access can trigger Claude; bots are rejected unless they are listed in `allowed_bots`.',
        ],
      },
    },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Die Action ist auf dem **Agent SDK** gebaut. Wer Claude in eigene Programme einbauen will - mit denselben Werkzeugen und demselben Loop -, findet das SDK für Python und TypeScript in der Claude-Code-Doku.',
        en: 'The action is built on the **Agent SDK**. If you want Claude inside your own programs - with the same tools and the same loop - the docs have the SDK for Python and TypeScript.',
      },
    },
  ],
  tasks: [
    {
      id: 'claude-headless-print',
      text: { de: 'Stell eine Frage im Print-Modus - ohne Claude Code zu starten.', en: 'Ask a question in print mode - without starting Claude Code.' },
      command: 'claude -p "explain this project"',
      check: { type: 'headless' },
    },
    {
      id: 'claude-headless-json',
      text: { de: 'Hol dieselbe Antwort als JSON, wie ein Skript sie bräuchte.', en: 'Get the same answer as JSON, the way a script would need it.' },
      command: 'claude -p "explain this project" --output-format json',
      check: { type: 'headless', outputFormat: 'json' },
    },
    {
      id: 'claude-headless-allowed',
      text: {
        de: 'Lass `claude -p "fix the failing test"` laufen - und dann noch einmal mit `--allowedTools "Edit,Bash(npm test *)"`. Was ändert sich?',
        en: 'Run `claude -p "fix the failing test"` - and then again with `--allowedTools "Edit,Bash(npm test *)"`. What changes?',
      },
      command: 'claude -p "fix the failing test" --allowedTools "Edit,Bash(npm test *)"',
      check: { type: 'headless', allowedTools: true },
    },
    {
      id: 'claude-headless-ci',
      text: {
        de: 'Bau den Aufruf, wie er in einer Pipeline stünde: erlaubte Werkzeuge **und** JSON-Ausgabe.',
        en: 'Build the call the way it would sit in a pipeline: allowed tools **and** JSON output.',
      },
      command: 'claude -p "fix the failing test" --allowedTools "Edit,Bash(npm test *)" --output-format json',
      check: { type: 'headless', outputFormat: 'json', allowedTools: true },
    },
  ],
  quiz: [
    {
      question: { de: 'Was passiert im Print-Modus, wenn Claude eine Datei ändern will, die du nicht freigegeben hast?', en: 'What happens in print mode when Claude wants to change a file you have not allowed?' },
      answers: {
        de: ['Claude fragt im Terminal nach', 'Das Werkzeug wird abgelehnt', 'Claude ändert die Datei trotzdem', 'Der Prozess wartet, bis jemand zustimmt'],
        en: ['Claude asks in the terminal', 'The tool is denied', 'Claude changes the file anyway', 'The process waits until someone approves'],
      },
      correct: 1,
      explanation: {
        de: 'Ohne Dialog keine Rückfrage. Was der Lauf darf, legst du vorher mit `--allowedTools` oder Regeln fest.',
        en: 'No dialog, no question. You decide up front with `--allowedTools` or rules what the run may do.',
      },
    },
    {
      question: { de: 'Welches Feld der JSON-Ausgabe brauchst du, um die Sitzung später mit `--resume` fortzusetzen?', en: 'Which field of the JSON output do you need to continue the session later with `--resume`?' },
      answers: { de: ['`result`', '`session_id`', '`total_cost_usd`', '`structured_output`'], en: ['`result`', '`session_id`', '`total_cost_usd`', '`structured_output`'] },
      correct: 1,
      explanation: {
        de: '`session_id` identifiziert das Gespräch - `jq -r \'.session_id\'` holt sie aus der Ausgabe.',
        en: '`session_id` identifies the conversation - `jq -r \'.session_id\'` pulls it out of the output.',
      },
    },
    {
      question: { de: 'Warum empfiehlt die Doku `--bare` für Skripte und CI?', en: 'Why do the docs recommend `--bare` for scripts and CI?' },
      answers: {
        de: ['Es macht Claude schneller im Denken', 'Es lädt keine Hooks, Skills, Plugins, MCP-Server und keine CLAUDE.md - der Lauf hängt nicht von der Umgebung ab', 'Es schaltet alle Rückfragen ab', 'Es spart das API-Konto'],
        en: ['It makes Claude think faster', 'It loads no hooks, skills, plugins, MCP servers or CLAUDE.md - the run does not depend on the environment', 'It turns off all questions', 'It saves the API account'],
      },
      correct: 1,
      explanation: {
        de: 'Ein CI-Lauf soll reproduzierbar sein und nichts Fremdes laden - gerade weil `-p` keinen Vertrauensdialog zeigt.',
        en: 'A CI run should be reproducible and load nothing unexpected - especially because `-p` shows no trust dialog.',
      },
    },
    {
      question: { de: 'Wie richtest du Claude für ein GitHub-Repo am schnellsten ein?', en: 'What is the quickest way to set up Claude for a GitHub repo?' },
      answers: {
        de: ['`/install-github-app` in einer Claude-Code-Sitzung im Repo', '`npm install claude-action`', 'Den API-Key in die README schreiben', '`claude mcp add github`'],
        en: ['`/install-github-app` in a Claude Code session in the repo', '`npm install claude-action`', 'Write the API key into the README', '`claude mcp add github`'],
      },
      correct: 0,
      explanation: {
        de: 'Der Befehl installiert die GitHub App, speichert das Secret und öffnet einen PR mit dem Workflow. Er braucht Admin-Rechte und die GitHub CLI.',
        en: 'The command installs the GitHub App, stores the secret and opens a PR with the workflow. It needs admin rights and the GitHub CLI.',
      },
    },
    {
      question: { de: 'Wer kann Claude in einem PR mit `@claude` auslösen?', en: 'Who can trigger Claude in a PR with `@claude`?' },
      answers: {
        de: ['Jeder, der kommentieren kann', 'Nur Leute mit Schreibrechten am Repo', 'Nur der Repo-Besitzer', 'Nur Bots'],
        en: ['Anyone who can comment', 'Only people with write access to the repo', 'Only the repo owner', 'Only bots'],
      },
      correct: 1,
      explanation: {
        de: 'Die Action prüft die Rechte des Auslösers. Bots werden abgewiesen, wenn sie nicht ausdrücklich erlaubt sind.',
        en: 'The action checks the rights of whoever triggers it. Bots are rejected unless they are explicitly allowed.',
      },
    },
  ],
  keyPoints: {
    de: [
      '`claude -p "…"` beantwortet eine Frage und beendet sich - derselbe Agent, nur ohne Dialog. Mit `|` gibst du Text über stdin mit.',
      '`--output-format json` liefert `result`, `session_id` und `total_cost_usd`; mit `--resume` geht es in derselben Sitzung weiter.',
      'Was fragen würde, wird abgelehnt - erlaubt wird vorab mit `--allowedTools`; begrenzt mit `--max-turns` und `--max-budget-usd`.',
      'Für Skripte und CI `--bare`: kein Vertrauensdialog im Print-Modus, also nichts Unbekanntes laden.',
      'GitHub: `/install-github-app`, dann `anthropics/claude-code-action@v1` mit `@claude` oder einem festen `prompt`.',
    ],
    en: [
      '`claude -p "…"` answers one question and exits - the same agent, just without a dialog. With `|` you pass text via stdin.',
      '`--output-format json` returns `result`, `session_id` and `total_cost_usd`; `--resume` carries on in the same session.',
      'Whatever would ask is denied - allow up front with `--allowedTools`; limit with `--max-turns` and `--max-budget-usd`.',
      'For scripts and CI `--bare`: print mode has no trust dialog, so load nothing unknown.',
      'GitHub: `/install-github-app`, then `anthropics/claude-code-action@v1` with `@claude` or a fixed `prompt`.',
    ],
  },
}
