import type { Lesson } from './types'

export const setupLesson: Lesson = {
  id: 'claude-setup',
  setup: { installed: false, loggedIn: false, inRepl: false },
  blocks: [
    { type: 'heading', text: { de: 'Was ist Claude Code?', en: 'What is Claude Code?' } },
    {
      type: 'text',
      text: {
        de: 'Claude Code ist ein **Agent im Terminal**. Du beschreibst eine Aufgabe in normaler Sprache, und Claude liest selbst Dateien, führt Befehle aus und ändert Code - Schritt für Schritt, und bei allem, was etwas verändert, fragt es dich vorher. Es arbeitet in dem Ordner, in dem du es startest.',
        en: 'Claude Code is an **agent in your terminal**. You describe a task in plain language, and Claude reads files, runs commands and changes code on its own - step by step, and it asks you first before anything that changes something. It works in the folder you start it in.',
      },
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: 'Ein Chat-Fenster beantwortet Fragen. Ein Agent **handelt**: Er entscheidet selbst, welche Datei er als Nächstes liest oder welchen Test er startet. Deshalb geht es in diesem Kurs genauso viel ums Steuern und Kontrollieren wie ums Fragen.',
        en: 'A chat window answers questions. An agent **acts**: it decides on its own which file to read next or which test to run. That is why this course is as much about steering and checking as about asking.',
      },
    },
    { type: 'heading', text: { de: 'Installation', en: 'Installation' } },
    {
      type: 'text',
      text: {
        de: 'Empfohlen ist der **native Installer**. Er braucht kein Node.js und aktualisiert Claude Code im Hintergrund selbst:',
        en: 'The recommended way is the **native installer**. It needs no Node.js and keeps Claude Code up to date in the background:',
      },
    },
    {
      type: 'code',
      language: 'bash',
      code: '# macOS, Linux, WSL\ncurl -fsSL https://claude.ai/install.sh | bash\n\n# Windows PowerShell\nirm https://claude.ai/install.ps1 | iex',
    },
    {
      type: 'text',
      text: {
        de: 'Wer ohnehin mit Node arbeitet, kann auch npm nehmen (ab Node.js 22). Wichtig: **ohne** `sudo` - sonst gehören die Dateien dem Administrator, und spätere Updates scheitern.',
        en: 'If you work with Node anyway, npm works too (Node.js 22 or newer). Important: **without** `sudo` - otherwise the administrator owns the files and later updates fail.',
      },
    },
    { type: 'code', language: 'bash', code: 'npm install -g @anthropic-ai/claude-code\n\nclaude --version   # e.g. 2.1.300 (Claude Code)\nclaude doctor      # checks the installation, changes nothing\nclaude update      # update by hand' },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Unter Windows empfiehlt sich zusätzlich Git for Windows: Claude führt Befehle dann in Git Bash aus, sonst in PowerShell.',
        en: 'On Windows, also install Git for Windows: Claude then runs commands in Git Bash, otherwise in PowerShell.',
      },
    },
    { type: 'heading', text: { de: 'Anmelden', en: 'Signing in' } },
    {
      type: 'text',
      text: {
        de: 'Beim ersten Start mit `claude` fragt Claude Code, wie du bezahlst, und öffnet dann den Browser zur Anmeldung:',
        en: 'On the first start with `claude`, Claude Code asks how you pay and then opens the browser to sign in:',
      },
    },
    {
      type: 'table',
      head: { de: ['Option', 'Für wen', 'Abrechnung'], en: ['Option', 'For whom', 'Billing'] },
      rows: {
        de: [
          ['1. Claude-Abo', 'Pro, Max, Team, Enterprise', 'im Abo enthalten, mit Nutzungslimits'],
          ['2. Anthropic Console', 'Entwickler mit API-Konto', 'nach verbrauchten Tokens'],
          ['3. Cloud-Anbieter', 'Amazon Bedrock, Google Cloud, Microsoft Foundry', 'über den Cloud-Vertrag'],
        ],
        en: [
          ['1. Claude subscription', 'Pro, Max, Team, Enterprise', 'included, with usage limits'],
          ['2. Anthropic Console', 'developers with an API account', 'per token used'],
          ['3. Cloud provider', 'Amazon Bedrock, Google Cloud, Microsoft Foundry', 'through the cloud contract'],
        ],
      },
    },
    {
      type: 'text',
      text: {
        de: 'Ist die Umgebungsvariable `ANTHROPIC_API_KEY` gesetzt, fragt Claude Code einmal, ob es diesen Schlüssel nutzen soll. Konto wechseln: `/logout` und `/login` innerhalb von Claude Code.',
        en: 'If the environment variable `ANTHROPIC_API_KEY` is set, Claude Code asks once whether to use that key. To switch accounts: `/logout` and `/login` inside Claude Code.',
      },
    },
    { type: 'heading', text: { de: 'Die Grundbefehle', en: 'The basic commands' } },
    {
      type: 'code',
      language: 'bash',
      code: 'claude                       # interactive session in the current folder\nclaude "explain this project"  # start with a first prompt\nclaude -c                    # continue the last conversation in this folder\nclaude -r                    # pick an older conversation\nclaude -p "explain this project"            # print mode: answer, then exit\ncat error.log | claude -p "what went wrong?"  # pipe text in',
    },
    {
      type: 'text',
      text: {
        de: 'Im **interaktiven Modus** siehst du die Eingabezeile mit `>`. Dort schreibst du Prompts oder Slash-Commands wie `/help`. Der **Print-Modus** (`-p`) beantwortet eine Frage und beendet sich - ideal für Skripte und CI. Weil er niemanden fragen kann, führt er nichts aus, was eine Erlaubnis bräuchte, solange du es nicht vorab freigibst.',
        en: 'In **interactive mode** you see the input line with `>`. There you type prompts or slash commands like `/help`. **Print mode** (`-p`) answers one question and exits - ideal for scripts and CI. Because it cannot ask anyone, it runs nothing that would need permission unless you allow it up front.',
      },
    },
    {
      type: 'list',
      items: {
        de: ['`Esc` unterbricht Claude mitten in der Arbeit', '`↑` holt frühere Eingaben zurück', '`/exit` oder zweimal `Strg+D` beendet die Sitzung'],
        en: ['`Esc` interrupts Claude while it works', '`↑` brings back earlier input', '`/exit` or `Ctrl+D` twice ends the session'],
      },
    },
  ],
  tasks: [
    {
      id: 'claude-setup-install',
      text: { de: 'Installiere Claude Code - nativ oder per npm.', en: 'Install Claude Code - natively or with npm.' },
      command: 'npm install -g @anthropic-ai/claude-code',
      check: { type: 'installed' },
    },
    {
      id: 'claude-setup-version',
      text: { de: 'Prüfe, welche Version installiert ist.', en: 'Check which version is installed.' },
      command: 'claude --version',
      check: { type: 'versionChecked' },
    },
    {
      id: 'claude-setup-login',
      text: { de: 'Starte Claude Code und melde dich mit deinem Abo an (Option `1`).', en: 'Start Claude Code and sign in with your subscription (option `1`).' },
      command: 'claude',
      check: { type: 'loggedIn' },
    },
    {
      id: 'claude-setup-prompt',
      text: { de: 'Stell deine erste Frage, z. B. `Erkläre dieses Projekt`.', en: 'Ask your first question, e.g. `Explain this project`.' },
      command: 'Explain this project',
      check: { type: 'prompted' },
    },
    {
      id: 'claude-setup-exit',
      text: { de: 'Beende die Sitzung.', en: 'End the session.' },
      command: '/exit',
      check: { type: 'exited' },
    },
    {
      id: 'claude-setup-print',
      text: { de: 'Stell dieselbe Frage im **Print-Modus** direkt aus der Shell.', en: 'Ask the same question in **print mode** straight from the shell.' },
      command: 'claude -p "explain this project"',
      check: { type: 'headless' },
    },
  ],
  quiz: [
    {
      question: { de: 'Was unterscheidet Claude Code von einem Chat-Fenster?', en: 'What sets Claude Code apart from a chat window?' },
      answers: {
        de: ['Es antwortet schneller', 'Es handelt selbst: liest Dateien, führt Befehle aus, ändert Code', 'Es braucht kein Konto', 'Es läuft nur in VS Code'],
        en: ['It answers faster', 'It acts on its own: reads files, runs commands, changes code', 'It needs no account', 'It only runs in VS Code'],
      },
      correct: 1,
      explanation: {
        de: 'Claude Code ist ein Agent im Terminal. Er entscheidet selbst über den nächsten Schritt - und fragt vor allem, was etwas verändert.',
        en: 'Claude Code is an agent in the terminal. It decides on the next step itself - and asks before anything that changes something.',
      },
    },
    {
      question: { de: 'Warum installiert man Claude Code per npm nicht mit `sudo`?', en: 'Why not install Claude Code with npm and `sudo`?' },
      answers: {
        de: ['sudo ist unter macOS verboten', 'Die Dateien gehören dann root - spätere Updates scheitern', 'npm kennt kein sudo', 'Dann fehlt der Login'],
        en: ['sudo is forbidden on macOS', 'root then owns the files - later updates fail', 'npm does not know sudo', 'Then the login is missing'],
      },
      correct: 1,
      explanation: {
        de: 'Mit sudo landen die Dateien beim Administrator. Der native Installer umgeht das Problem ganz und aktualisiert sich selbst.',
        en: 'With sudo the files end up owned by the administrator. The native installer avoids the problem entirely and updates itself.',
      },
    },
    {
      question: { de: 'Ein CI-Job soll eine Frage an Claude stellen und danach weiterlaufen. Welcher Aufruf passt?', en: 'A CI job should ask Claude one question and then carry on. Which call fits?' },
      answers: { de: ['claude', 'claude -c', 'claude -p "…"', 'claude doctor'], en: ['claude', 'claude -c', 'claude -p "…"', 'claude doctor'] },
      correct: 2,
      explanation: {
        de: 'Der Print-Modus antwortet und beendet sich. `claude` würde eine interaktive Sitzung öffnen und auf Eingaben warten.',
        en: 'Print mode answers and exits. `claude` would open an interactive session and wait for input.',
      },
    },
    {
      question: { de: 'Was ist im Print-Modus anders, wenn Claude eine Datei ändern will?', en: 'What is different in print mode when Claude wants to change a file?' },
      answers: {
        de: ['Nichts - es fragt wie sonst', 'Es kann nicht fragen, also wird das Werkzeug verweigert, wenn du es nicht vorab erlaubst', 'Es ändert ohne zu fragen', 'Es wechselt in den interaktiven Modus'],
        en: ['Nothing - it asks as usual', 'It cannot ask, so the tool is denied unless you allow it up front', 'It changes without asking', 'It switches to interactive mode'],
      },
      correct: 1,
      explanation: {
        de: 'Ohne Dialog keine Rückfrage. Was der Job darf, gibst du mit `--allowedTools` oder Regeln in den Einstellungen frei.',
        en: 'No dialog, no question. You grant what the job may do with `--allowedTools` or rules in the settings.',
      },
    },
  ],
  keyPoints: {
    de: [
      'Claude Code ist ein Agent im Terminal: Er liest, führt aus und ändert - im Ordner, in dem du ihn startest.',
      'Installieren nativ (empfohlen, aktualisiert sich selbst) oder per `npm install -g @anthropic-ai/claude-code` ohne sudo.',
      '`claude --version` und `claude doctor` prüfen die Installation.',
      'Anmelden mit Claude-Abo, Console-Konto oder über einen Cloud-Anbieter.',
      '`claude` ist interaktiv, `claude -p` antwortet einmal und beendet sich - für Skripte und CI.',
    ],
    en: [
      'Claude Code is an agent in the terminal: it reads, runs and changes things - in the folder you start it in.',
      'Install natively (recommended, updates itself) or with `npm install -g @anthropic-ai/claude-code` without sudo.',
      '`claude --version` and `claude doctor` check the installation.',
      'Sign in with a Claude subscription, a Console account or through a cloud provider.',
      '`claude` is interactive, `claude -p` answers once and exits - for scripts and CI.',
    ],
  },
}
