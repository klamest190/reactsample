import { claudeLesson } from './claude'
import type { Teil } from './types'

/** Part 11: what makes Claude Code a team tool - settings, hooks, skills, subagents, MCP, plugins, CI, safety. */
export const claudeAdvancedTeil: Teil = {
  id: 'claude-advanced',
  nummer: 11,
  titel: { de: 'Claude Code: Erweitern & Automatisieren', en: 'Claude Code: Extending & Automating' },
  kurztitel: { de: 'Claude Code Profi', en: 'Claude Code Pro' },
  bereich: 'tools',
  playground: false,
  beschreibung: {
    de: 'Claude Code an Team und Projekt anpassen: Einstellungen, Hooks, Skills, Subagents, MCP-Server und Plugins - dazu Automatisierung in Skripten und CI, sicheres Arbeiten und ein Praxisprojekt von Anfang bis Ende.',
    en: 'Fit Claude Code to team and project: settings, hooks, skills, subagents, MCP servers and plugins - plus automation in scripts and CI, working safely and a capstone project from start to finish.',
  },
  kapitel: [
    {
      id: 'claude-settings',
      titel: { de: 'Einstellungen & Konfiguration', en: 'Settings & Configuration' },
      kurz: {
        de: 'Welche Einstellungsdatei wofür gilt, wer Vorrang hat - und wie man Modell, Rechte und Umgebung einstellt.',
        en: 'Which settings file applies to what, which one wins - and how to set model, permissions and environment.',
      },
      dauer: 30,
      lernziele: {
        de: ['Anweisungen (CLAUDE.md) und Einstellungen unterscheiden', 'Die Einstellungsdateien und ihren Vorrang kennen', 'Teamregeln von persönlichen Einstellungen trennen', 'Modell, Effort und Antwortstil per Befehl einstellen'],
        en: ['Tell instructions (CLAUDE.md) from settings', 'Know the settings files and their precedence', 'Keep team rules apart from personal settings', 'Set model, effort and output style by command'],
      },
      stichworte: ['settings', 'Einstellungen', 'settings.json', 'settings.local.json', '/config', '/status', '/model', 'opusplan', '/effort', '/output-style', '/statusline', 'env', 'ANTHROPIC_MODEL', 'BASH_DEFAULT_TIMEOUT_MS', 'DISABLE_AUTOUPDATER', 'defaultMode', 'permissions'],
      Komponente: claudeLesson('claude-settings'),
    },
    {
      id: 'claude-hooks',
      titel: { de: 'Hooks: Automatik an festen Punkten', en: 'Hooks: Automation at Fixed Points' },
      kurz: {
        de: 'Shell-Befehle, die Claude Code bei jedem Edit, Werkzeugaufruf oder Sitzungsstart ausführt - formatieren, prüfen, blockieren.',
        en: 'Shell commands Claude Code runs on every edit, tool call or session start - format, check, block.',
      },
      dauer: 40,
      lernziele: {
        de: ['Hooks von Anweisungen in CLAUDE.md unterscheiden', 'Die wichtigsten Hook-Ereignisse zuordnen', 'Einen Hook mit Matcher in settings.json schreiben', 'Exit-Codes und stdin-JSON eines Hooks verstehen', 'Hooks sicher einsetzen und von Deny-Regeln abgrenzen'],
        en: ['Tell hooks from instructions in CLAUDE.md', 'Match the most important hook events', 'Write a hook with a matcher in settings.json', 'Understand a hook’s exit codes and stdin JSON', 'Use hooks safely and tell them from deny rules'],
      },
      stichworte: ['hook', 'Hook', 'hooks', 'PreToolUse', 'PostToolUse', 'UserPromptSubmit', 'Notification', 'Stop', 'SessionStart', 'matcher', 'exit code', 'jq', 'CLAUDE_PROJECT_DIR', '/hooks', 'prettier', 'permissionDecision'],
      Komponente: claudeLesson('claude-hooks'),
    },
    {
      id: 'claude-skills',
      titel: { de: 'Skills: wiederverwendbare Workflows', en: 'Skills: Reusable Workflows' },
      kurz: {
        de: 'Wissen und Abläufe einmal aufschreiben, überall nutzen: Aufbau, Arten, Namensräume, Erstellen per Prompt und Best Practices.',
        en: 'Write knowledge and workflows down once, use them everywhere: structure, kinds, namespaces, creating by prompt and best practices.',
      },
      dauer: 50,
      lernziele: {
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
      stichworte: ['skill', 'Skill', 'SKILL.md', 'frontmatter', 'description', '/skills', 'bundled skills', 'gebündelte Skills', 'plugin', 'Plugin', 'namespace', 'Namensraum', '$ARGUMENTS', 'disable-model-invocation', 'user-invocable', 'allowed-tools', 'progressive disclosure', 'workflow'],
      Komponente: claudeLesson('claude-skills'),
    },
    {
      id: 'claude-subagents',
      titel: { de: 'Subagents: Arbeit aufteilen', en: 'Subagents: Splitting the Work' },
      kurz: {
        de: 'Teilaufgaben an Agenten mit eigenem Kontext abgeben: eingebaute Subagents, eigene Agenten und wann sie sich lohnen.',
        en: 'Hand sub-tasks to agents with their own context: built-in subagents, custom agents and when they pay off.',
      },
      dauer: 35,
      lernziele: {
        de: ['Erklären, warum ein Subagent den Kontext klein hält', 'Explore, Plan und general-purpose unterscheiden', 'Subagents automatisch und ausdrücklich einsetzen', 'Einen eigenen Subagent mit Frontmatter anlegen', 'Zwischen Skill und Subagent entscheiden'],
        en: ['Explain why a subagent keeps the context small', 'Tell Explore, Plan and general-purpose apart', 'Use subagents automatically and explicitly', 'Create a custom subagent with frontmatter', 'Decide between skill and subagent'],
      },
      stichworte: ['subagent', 'Subagent', 'agent', 'Agent', 'Explore', 'Plan', 'general-purpose', '/agents', '.claude/agents', 'context window', 'Kontextfenster', 'delegate', 'delegieren', 'parallel', 'background', 'Ctrl+B', 'context: fork'],
      Komponente: claudeLesson('claude-subagents'),
    },
    {
      id: 'claude-mcp',
      titel: { de: 'MCP: externe Werkzeuge anbinden', en: 'MCP: Connecting External Tools' },
      kurz: {
        de: 'Mit dem Model Context Protocol bekommt Claude Zugriff auf Tracker, Datenbanken und Dienste - sicher eingerichtet.',
        en: 'With the Model Context Protocol Claude gets access to trackers, databases and services - set up safely.',
      },
      dauer: 35,
      lernziele: {
        de: ['Erklären, was MCP und ein MCP-Server sind', 'Server mit claude mcp add für http und stdio einrichten', 'Die Scopes local, project und user unterscheiden', 'MCP-Werkzeuge per Regel freigeben', 'Risiken fremder Server einschätzen'],
        en: ['Explain what MCP and an MCP server are', 'Set up servers with claude mcp add for http and stdio', 'Tell the scopes local, project and user apart', 'Allow MCP tools with rules', 'Judge the risks of outside servers'],
      },
      stichworte: ['MCP', 'Model Context Protocol', 'MCP server', 'MCP-Server', 'claude mcp add', '.mcp.json', '/mcp', 'stdio', 'http', 'scope', 'mcp__', 'OAuth', 'MAX_MCP_OUTPUT_TOKENS', 'prompt injection'],
      Komponente: claudeLesson('claude-mcp'),
    },
    {
      id: 'claude-plugins',
      titel: { de: 'Plugins & Marketplaces', en: 'Plugins & Marketplaces' },
      kurz: {
        de: 'Skills, Agents, Hooks und MCP-Server als Paket: installieren, teilen und selbst bauen.',
        en: 'Skills, agents, hooks and MCP servers as a package: install, share and build your own.',
      },
      dauer: 30,
      lernziele: {
        de: ['Erklären, was ein Plugin bündelt', 'Den Aufbau eines Plugins mit plugin.json lesen', 'Marketplaces hinzufügen und Plugins installieren', 'Namensräume von Plugin-Bestandteilen nutzen', 'Plugins im Team teilen und sicher auswählen'],
        en: ['Explain what a plugin bundles', 'Read the structure of a plugin with plugin.json', 'Add marketplaces and install plugins', 'Use the namespaces of plugin parts', 'Share plugins in the team and choose them safely'],
      },
      stichworte: ['plugin', 'Plugin', '/plugin', 'marketplace', 'Marketplace', 'plugin.json', 'marketplace.json', 'claude plugin', 'namespace', 'Namensraum', 'enabledPlugins', 'extraKnownMarketplaces', '/reload-plugins', 'claude plugin validate'],
      Komponente: claudeLesson('claude-plugins'),
    },
    {
      id: 'claude-headless',
      titel: { de: 'Headless & CI: Claude automatisieren', en: 'Headless & CI: Automating Claude' },
      kurz: {
        de: 'Claude ohne Dialog: Print-Modus, JSON-Ausgabe, vorab erlaubte Werkzeuge und Claude in GitHub Actions.',
        en: 'Claude without a dialog: print mode, JSON output, tools allowed up front and Claude in GitHub Actions.',
      },
      dauer: 35,
      lernziele: {
        de: ['Claude mit -p in Skripten nutzen und Text über stdin mitgeben', 'JSON-Ausgabe auswerten und Sitzungen fortsetzen', 'Werkzeuge vorab mit --allowedTools freigeben und Läufe begrenzen', 'Claude Code sicher in der CI einsetzen (--bare)', 'Die GitHub Action einrichten und mit @claude nutzen'],
        en: ['Use Claude with -p in scripts and pass text via stdin', 'Evaluate JSON output and continue sessions', 'Allow tools up front with --allowedTools and limit runs', 'Use Claude Code safely in CI (--bare)', 'Set up the GitHub Action and use it with @claude'],
      },
      stichworte: ['headless', 'print mode', 'Print-Modus', 'claude -p', '--output-format', 'json', 'stream-json', '--allowedTools', '--permission-mode', 'dontAsk', '--max-turns', '--max-budget-usd', '--bare', '--resume', 'session_id', 'CI', 'GitHub Actions', 'claude-code-action', '/install-github-app', '@claude', 'Agent SDK'],
      Komponente: claudeLesson('claude-headless'),
    },
    {
      id: 'claude-security',
      titel: { de: 'Sicher & verantwortungsvoll arbeiten', en: 'Working Safely and Responsibly' },
      kurz: {
        de: 'Geheimnisse sperren, Prompt Injection erkennen, isolieren - und warum am Ende du prüfst.',
        en: 'Lock away secrets, spot prompt injection, isolate - and why in the end you are the one who checks.',
      },
      dauer: 35,
      lernziele: {
        de: ['Die Risiken eines Agenten mit deinen Rechten benennen', 'Geheimnisse mit Deny-Regeln sperren', 'Prompt Injection erkennen und abwehren', 'Sandbox, Dev Container und VMs einordnen', 'Sicherheitsregeln im Team verankern'],
        en: ['Name the risks of an agent acting with your rights', 'Lock away secrets with deny rules', 'Recognize and fend off prompt injection', 'Place sandbox, dev containers and VMs', 'Anchor security rules in the team'],
      },
      stichworte: ['security', 'Sicherheit', 'prompt injection', 'Prompt Injection', 'deny', 'Read(./.env)', '.env', 'secret', 'Geheimnis', '.claudeignore', '/sandbox', 'sandbox', 'devcontainer', 'Dev Container', 'trust', '/feedback', 'managed settings', 'ConfigChange'],
      Komponente: claudeLesson('claude-security'),
    },
    {
      id: 'claude-project',
      titel: { de: 'Praxisprojekt: ein Feature von Anfang bis Ende', en: 'Capstone: A Feature End to End' },
      kurz: {
        de: 'Alles zusammen: erkunden, grün starten, Branch, planen, umsetzen, Pull Request - und das Gelernte festhalten.',
        en: 'Everything together: explore, start green, branch, plan, implement, pull request - and capture what you learned.',
      },
      dauer: 45,
      lernziele: {
        de: ['Den Ablauf erkunden, planen, umsetzen, committen anwenden', 'Vor neuen Features eine grüne Testbasis herstellen', 'Plan-Modus und Freigabe gezielt einsetzen', 'Mit Branch, Commit und Pull Request abschließen', 'Fehlschläge mit Esc, /rewind und /clear auffangen'],
        en: ['Apply the explore, plan, implement, commit workflow', 'Establish a green test baseline before new features', 'Use plan mode and approval on purpose', 'Wrap up with branch, commit and pull request', 'Recover from failures with Esc, /rewind and /clear'],
      },
      stichworte: ['project', 'Projekt', 'capstone', 'workflow', 'Ablauf', 'explore plan code commit', 'plan mode', 'Plan-Modus', 'branch', 'pull request', 'PR', 'gh', 'feature', 'filter', '/rewind', '/clear', 'best practices'],
      Komponente: claudeLesson('claude-project'),
    },
  ],
}
