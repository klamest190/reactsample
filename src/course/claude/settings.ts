import type { Lesson } from './types'

export const settingsLesson: Lesson = {
  id: 'claude-settings',
  setup: { installed: true, loggedIn: true, inRepl: true, withMemory: true },
  blocks: [
    { type: 'heading', text: { de: 'Anweisungen oder Einstellungen?', en: 'Instructions or settings?' } },
    {
      type: 'text',
      text: {
        de: 'Claude Code lässt sich auf zwei Arten anpassen. **CLAUDE.md** enthält Anweisungen in normaler Sprache - Claude liest sie und hält sich in aller Regel daran, aber es sind Ratschläge. **Einstellungen** (`settings.json`) sind Konfiguration: Claude Code selbst setzt sie durch, egal was im Prompt steht. Was nie passieren darf, gehört deshalb in die Einstellungen.',
        en: 'Claude Code can be adapted in two ways. **CLAUDE.md** holds instructions in plain language - Claude reads them and usually follows them, but they are advice. **Settings** (`settings.json`) are configuration: Claude Code itself enforces them, whatever the prompt says. Anything that must never happen therefore belongs in the settings.',
      },
    },
    {
      type: 'table',
      head: { de: ['', 'CLAUDE.md', 'settings.json'], en: ['', 'CLAUDE.md', 'settings.json'] },
      rows: {
        de: [
          ['Form', 'Markdown, freier Text', 'JSON mit festen Schlüsseln'],
          ['Wirkung', 'Claude liest es und richtet sich danach', 'Claude Code erzwingt es'],
          ['Beispiel', '„Tests liegen neben dem Code“', '`"deny": ["Read(./.env)"]`'],
          ['Gut für', 'Konventionen, Befehle, Stolperfallen', 'Rechte, Modell, Hooks, Umgebung'],
        ],
        en: [
          ['Form', 'Markdown, free text', 'JSON with fixed keys'],
          ['Effect', 'Claude reads it and acts on it', 'Claude Code enforces it'],
          ['Example', '"Tests live next to the code"', '`"deny": ["Read(./.env)"]`'],
          ['Good for', 'conventions, commands, pitfalls', 'permissions, model, hooks, environment'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Die Einstellungsdateien und ihr Vorrang', en: 'The settings files and their precedence' } },
    {
      type: 'text',
      text: {
        de: 'Es gibt mehrere Dateien, je nachdem, für wen eine Einstellung gilt. Setzen zwei Dateien denselben Schlüssel, gewinnt die weiter oben in der Tabelle. Listen wie `permissions.allow` werden dagegen aus allen Dateien zusammengeführt.',
        en: 'There are several files, depending on whom a setting applies to. If two files set the same key, the one higher up in the table wins. Lists like `permissions.allow`, however, are merged from all files.',
      },
    },
    {
      type: 'table',
      head: { de: ['Vorrang', 'Ort', 'Gilt für', 'Ins Git?'], en: ['Precedence', 'Location', 'Applies to', 'In git?'] },
      rows: {
        de: [
          ['1 (höchster)', 'Verwaltete Einstellungen der Firma', 'alle in der Organisation', 'von der IT verteilt'],
          ['2', 'Kommandozeile `--settings`', 'nur diese Sitzung', '-'],
          ['3', '`.claude/settings.local.json`', 'dieses Projekt, nur du', 'nein'],
          ['4', '`.claude/settings.json`', 'dieses Projekt, das ganze Team', 'ja'],
          ['5 (niedrigster)', '`~/.claude/settings.json`', 'alle deine Projekte', 'nein, persönlich'],
        ],
        en: [
          ['1 (highest)', 'Managed settings of the company', 'everyone in the organization', 'distributed by IT'],
          ['2', 'command line `--settings`', 'only this session', '-'],
          ['3', '`.claude/settings.local.json`', 'this project, only you', 'no'],
          ['4', '`.claude/settings.json`', 'this project, the whole team', 'yes'],
          ['5 (lowest)', '`~/.claude/settings.json`', 'all your projects', 'no, personal'],
        ],
      },
    },
    {
      type: 'code',
      language: 'json',
      caption: { de: '.claude/settings.json - Teamregeln fürs Repo', en: '.claude/settings.json - team rules for the repo' },
      code: '{\n  "model": "opus",\n  "permissions": {\n    "allow": ["Bash(npm test *)", "Bash(npm run lint)"],\n    "ask": ["Bash(git push *)"],\n    "deny": ["Read(./.env)", "Read(./secrets/**)"],\n    "defaultMode": "acceptEdits"\n  },\n  "env": {\n    "BASH_DEFAULT_TIMEOUT_MS": "300000"\n  }\n}',
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: '„Yes, and don\'t ask again“ im Erlaubnisdialog schreibt in `.claude/settings.local.json` - also nur für dich. Soll das ganze Team eine Regel haben, gehört sie in `.claude/settings.json`, und die Datei wird committet.',
        en: '"Yes, and don\'t ask again" in the permission dialog writes to `.claude/settings.local.json` - so only for you. If the whole team should have a rule, it belongs in `.claude/settings.json`, and the file gets committed.',
      },
    },
    { type: 'heading', text: { de: 'Die wichtigsten Schlüssel', en: 'The most important keys' } },
    {
      type: 'table',
      head: { de: ['Schlüssel', 'Wofür'], en: ['Key', 'What for'] },
      rows: {
        de: [
          ['`model`', 'Standardmodell, z. B. `opus` oder `sonnet`'],
          ['`permissions`', '`allow`, `ask`, `deny` und `defaultMode` (Startmodus)'],
          ['`env`', 'Umgebungsvariablen für jede Sitzung'],
          ['`hooks`', 'Befehle an festen Punkten - eigene Lektion: [[claude-hooks]]'],
          ['`attribution`', 'Mitautor-Eintrag in Commits und PRs'],
          ['`outputStyle`', 'Antwortstil, z. B. `Explanatory`'],
          ['`autoUpdatesChannel`', '`latest` (Standard) oder `stable`'],
          ['`cleanupPeriodDays`', 'wie lange Verläufe und Checkpoints aufbewahrt werden'],
        ],
        en: [
          ['`model`', 'default model, e.g. `opus` or `sonnet`'],
          ['`permissions`', '`allow`, `ask`, `deny` and `defaultMode` (start mode)'],
          ['`env`', 'environment variables for every session'],
          ['`hooks`', 'commands at fixed points - a lesson of its own: [[claude-hooks]]'],
          ['`attribution`', 'co-author entry in commits and PRs'],
          ['`outputStyle`', 'answer style, e.g. `Explanatory`'],
          ['`autoUpdatesChannel`', '`latest` (default) or `stable`'],
          ['`cleanupPeriodDays`', 'how long transcripts and checkpoints are kept'],
        ],
      },
    },
    {
      type: 'note',
      tone: 'warning',
      text: {
        de: '`defaultMode` mit `auto` oder `bypassPermissions` wird in Projekt- und lokalen Einstellungen ignoriert - ein Repo soll sich nicht selbst mehr Rechte geben können.',
        en: '`defaultMode` set to `auto` or `bypassPermissions` is ignored in project and local settings - a repo must not be able to grant itself more rights.',
      },
    },
    { type: 'heading', text: { de: 'Einstellen, ohne JSON zu tippen', en: 'Configuring without typing JSON' } },
    {
      type: 'list',
      items: {
        de: [
          '`/config` öffnet die Einstellungen (Theme, Modell, Antwortstil …). Gespeichert wird meist in `~/.claude/settings.json`.',
          '`/status` zeigt Version, Modell, Konto - und unter „Setting sources“, aus welchen Dateien die Einstellungen gerade kommen.',
          '`/model` wechselt das Modell. Aliase: `opus`, `sonnet`, `haiku`, `fable`, `opusplan` (Opus im Plan-Modus, danach Sonnet), `default`, `best`.',
          '`/effort` stellt ein, wie gründlich Claude nachdenkt: `low`, `medium`, `high`, `xhigh`, `max`.',
          '`/output-style` wählt den Antwortstil: `Default`, `Proactive`, `Concise`, `Explanatory`, `Learning`.',
          '`/statusline` richtet eine eigene Statuszeile ein, z. B. mit Modell, Branch und Kontextfüllstand.',
          'Oder du bittest Claude: „Füge den Einstellungen eine Regel hinzu, die `npm run lint` fürs Team erlaubt“.',
        ],
        en: [
          '`/config` opens the settings (theme, model, output style …). Most of it is saved to `~/.claude/settings.json`.',
          '`/status` shows version, model, account - and under "Setting sources" which files the settings currently come from.',
          '`/model` switches the model. Aliases: `opus`, `sonnet`, `haiku`, `fable`, `opusplan` (Opus in plan mode, then Sonnet), `default`, `best`.',
          '`/effort` sets how thoroughly Claude thinks: `low`, `medium`, `high`, `xhigh`, `max`.',
          '`/output-style` picks the answer style: `Default`, `Proactive`, `Concise`, `Explanatory`, `Learning`.',
          '`/statusline` sets up a status line of your own, e.g. with model, branch and how full the context is.',
          'Or you ask Claude: "Add a rule to the settings that allows `npm run lint` for the team".',
        ],
      },
    },
    { type: 'heading', text: { de: 'Umgebungsvariablen', en: 'Environment variables' } },
    {
      type: 'text',
      text: {
        de: 'Manche Dinge stellt man per Umgebungsvariable ein - direkt in der Shell oder dauerhaft im Schlüssel `env` der Einstellungen. Eine Variable in der Shell gilt nur für diesen einen Start.',
        en: 'Some things are set through environment variables - right in the shell or permanently in the `env` key of the settings. A variable in the shell applies to that one start only.',
      },
    },
    {
      type: 'code',
      language: 'bash',
      code: '# use another model for this session only\nANTHROPIC_MODEL=sonnet claude\n\n# give long shell commands more time (default 120000 ms)\nBASH_DEFAULT_TIMEOUT_MS=300000 claude\n\n# turn off automatic updates\nDISABLE_AUTOUPDATER=1 claude',
    },
  ],
  tasks: [
    { id: 'claude-settings-config', text: { de: 'Öffne die Einstellungen.', en: 'Open the settings.' }, command: '/config', check: { type: 'command', name: '/config' } },
    {
      id: 'claude-settings-status',
      text: { de: 'Sieh nach, aus welchen Dateien die Einstellungen kommen.', en: 'Check which files the settings come from.' },
      command: '/status',
      check: { type: 'command', name: '/status' },
    },
    {
      id: 'claude-settings-model',
      text: { de: 'Wechsle das Modell auf `sonnet`.', en: 'Switch the model to `sonnet`.' },
      command: '/model sonnet',
      check: { type: 'modelChanged', model: 'sonnet' },
    },
    {
      id: 'claude-settings-permissions',
      text: { de: 'Sieh dir an, welche Allow- und Deny-Regeln es schon gibt.', en: 'Look at which allow and deny rules exist already.' },
      command: '/permissions',
      check: { type: 'command', name: '/permissions' },
    },
    {
      id: 'claude-settings-rule',
      text: { de: 'Lass Claude eine Teamregel eintragen, die `npm run lint` ohne Rückfrage erlaubt.', en: 'Let Claude add a team rule that allows `npm run lint` without asking.' },
      command: 'Add a rule to the settings that allows npm run lint for the team',
      check: { type: 'settingsChanged' },
    },
  ],
  quiz: [
    {
      question: { de: 'Eine Regel soll für das ganze Team gelten. Wohin gehört sie?', en: 'A rule should apply to the whole team. Where does it go?' },
      answers: {
        de: ['`~/.claude/settings.json`', '`.claude/settings.local.json`', '`.claude/settings.json`, committet', 'In die README'],
        en: ['`~/.claude/settings.json`', '`.claude/settings.local.json`', '`.claude/settings.json`, committed', 'Into the README'],
      },
      correct: 2,
      explanation: {
        de: 'Die Projektdatei liegt im Repo und gilt für alle. Die lokale Datei ist nur deine, die im Home-Ordner gilt für deine Projekte.',
        en: 'The project file lives in the repo and applies to everyone. The local file is only yours, the one in your home folder applies to your projects.',
      },
    },
    {
      question: { de: '`.claude/settings.json` setzt `"model": "opus"`, deine `.claude/settings.local.json` setzt `"model": "sonnet"`. Welches Modell gilt?', en: '`.claude/settings.json` sets `"model": "opus"`, your `.claude/settings.local.json` sets `"model": "sonnet"`. Which model applies?' },
      answers: { de: ['opus', 'sonnet', 'Das Standardmodell', 'Claude fragt nach'], en: ['opus', 'sonnet', 'The default model', 'Claude asks'] },
      correct: 1,
      explanation: {
        de: 'Lokale Projekteinstellungen haben Vorrang vor den geteilten. So kannst du für dich abweichen, ohne das Team zu stören.',
        en: 'Local project settings take precedence over the shared ones. That way you can deviate for yourself without affecting the team.',
      },
    },
    {
      question: { de: 'Warum gehört „Lies niemals .env“ in die Einstellungen statt in CLAUDE.md?', en: 'Why does "never read .env" belong in the settings rather than CLAUDE.md?' },
      answers: {
        de: ['CLAUDE.md kann keine Dateinamen enthalten', 'Einstellungen werden von Claude Code erzwungen, CLAUDE.md ist ein Ratschlag', 'CLAUDE.md wird nur bei /init gelesen', 'Es ist egal'],
        en: ['CLAUDE.md cannot contain file names', 'Settings are enforced by Claude Code, CLAUDE.md is advice', 'CLAUDE.md is only read during /init', 'It makes no difference'],
      },
      correct: 1,
      explanation: {
        de: 'Eine Deny-Regel greift unabhängig davon, was das Modell entscheidet. Für harte Regeln ist das der richtige Ort.',
        en: 'A deny rule applies regardless of what the model decides. For hard rules that is the right place.',
      },
    },
    {
      question: { de: 'Wo siehst du, aus welchen Dateien die aktuellen Einstellungen stammen?', en: 'Where do you see which files the current settings come from?' },
      answers: { de: ['`/status` unter „Setting sources“', '`/help`', '`/context`', '`/usage`'], en: ['`/status` under "Setting sources"', '`/help`', '`/context`', '`/usage`'] },
      correct: 0,
      explanation: {
        de: '`/status` listet Version, Modell, Konto und die Quellen der Einstellungen.',
        en: '`/status` lists version, model, account and the sources of the settings.',
      },
    },
    {
      question: { de: 'Was bewirkt das Modell-Alias `opusplan`?', en: 'What does the model alias `opusplan` do?' },
      answers: {
        de: ['Opus für alles', 'Opus im Plan-Modus, danach Sonnet für die Umsetzung', 'Ein Plan ohne Modell', 'Haiku zum Planen'],
        en: ['Opus for everything', 'Opus in plan mode, then Sonnet for carrying it out', 'A plan without a model', 'Haiku for planning'],
      },
      correct: 1,
      explanation: {
        de: 'Das stärkere Modell denkt den Plan durch, das schnellere setzt ihn um.',
        en: 'The stronger model thinks the plan through, the faster one carries it out.',
      },
    },
  ],
  keyPoints: {
    de: [
      'CLAUDE.md gibt Anweisungen, `settings.json` erzwingt Konfiguration - harte Regeln gehören in die Einstellungen.',
      'Vorrang: verwaltet > `--settings` > lokal > Projekt > persönlich; Listen wie `allow` werden zusammengeführt.',
      'Teamregeln in `.claude/settings.json` (committen), Persönliches in `.claude/settings.local.json` oder `~/.claude/settings.json`.',
      'Wichtige Schlüssel: `model`, `permissions`, `env`, `hooks`, `attribution`, `outputStyle`.',
      '`/config`, `/status`, `/model`, `/effort`, `/output-style` und `/statusline` stellen ein, ohne JSON zu tippen.',
    ],
    en: [
      'CLAUDE.md gives instructions, `settings.json` enforces configuration - hard rules belong in the settings.',
      'Precedence: managed > `--settings` > local > project > personal; lists like `allow` are merged.',
      'Team rules in `.claude/settings.json` (commit it), personal ones in `.claude/settings.local.json` or `~/.claude/settings.json`.',
      'Important keys: `model`, `permissions`, `env`, `hooks`, `attribution`, `outputStyle`.',
      '`/config`, `/status`, `/model`, `/effort`, `/output-style` and `/statusline` configure without typing JSON.',
    ],
  },
}
