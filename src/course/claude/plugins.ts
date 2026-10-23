import type { Lesson } from './types'

export const pluginsLesson: Lesson = {
  id: 'claude-plugins',
  setup: { installed: true, loggedIn: true, inRepl: true, withMemory: true, withPlugins: false },
  blocks: [
    { type: 'heading', text: { de: 'Was ist ein Plugin?', en: 'What is a plugin?' } },
    {
      type: 'text',
      text: {
        de: 'Skills, Subagents, Hooks, MCP-Server - all das richtest du bisher pro Projekt oder pro Person ein. Ein **Plugin** schnürt es zu einem Paket, das sich mit einem Befehl installieren, aktualisieren und wieder entfernen lässt. So bekommt ein ganzes Team dieselben Werkzeuge, ohne Dateien von Repo zu Repo zu kopieren.',
        en: 'Skills, subagents, hooks, MCP servers - so far you set all of that up per project or per person. A **plugin** bundles it into a package that you install, update and remove with one command. That way a whole team gets the same tools without copying files from repo to repo.',
      },
    },
    {
      type: 'table',
      head: { de: ['Bestandteil', 'Ordner im Plugin', 'Mehr dazu'], en: ['Part', 'Folder in the plugin', 'More on it'] },
      rows: {
        de: [
          ['Skills', '`skills/<name>/SKILL.md`', '[[claude-skills]]'],
          ['Subagents', '`agents/*.md`', '[[claude-subagents]]'],
          ['Hooks', '`hooks/hooks.json`', 'Automatik bei Ereignissen'],
          ['MCP-Server', '`.mcp.json`', '[[claude-mcp]]'],
          ['LSP-Server', '`.lsp.json`', 'Sprachunterstützung'],
          ['Output Styles, Themes', '`output-styles/`, `themes/`', 'Darstellung'],
          ['Befehle (alt)', '`commands/*.md`', 'heute besser Skills'],
        ],
        en: [
          ['Skills', '`skills/<name>/SKILL.md`', '[[claude-skills]]'],
          ['Subagents', '`agents/*.md`', '[[claude-subagents]]'],
          ['Hooks', '`hooks/hooks.json`', 'automation on events'],
          ['MCP servers', '`.mcp.json`', '[[claude-mcp]]'],
          ['LSP servers', '`.lsp.json`', 'language support'],
          ['Output styles, themes', '`output-styles/`, `themes/`', 'presentation'],
          ['Commands (legacy)', '`commands/*.md`', 'better as skills today'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Aufbau eines Plugins', en: 'Anatomy of a plugin' } },
    {
      type: 'code',
      language: 'text',
      code: 'deploy-tools/\n  .claude-plugin/\n    plugin.json        the manifest - the only file in .claude-plugin/\n  skills/\n    deploy/SKILL.md\n  agents/\n    reviewer.md\n  hooks/\n    hooks.json\n  .mcp.json',
    },
    {
      type: 'code',
      language: 'json',
      caption: { de: '.claude-plugin/plugin.json', en: '.claude-plugin/plugin.json' },
      code: '{\n  "name": "deploy-tools",\n  "version": "1.2.0",\n  "description": "Deployment commands",\n  "author": { "name": "Example Team" }\n}',
    },
    {
      type: 'list',
      items: {
        de: [
          '`name` ist das einzige Pflichtfeld - in Kleinbuchstaben mit Bindestrichen, ohne Leerzeichen, `@` oder `:`.',
          '`version` legt den Stand fest; `description`, `author`, `homepage`, `license` und `keywords` beschreiben das Plugin.',
          'Eine `CLAUDE.md` im Plugin-Ordner wird **nicht** geladen - Wissen gehört in Skills.',
        ],
        en: [
          '`name` is the only required field - lowercase with hyphens, no spaces, `@` or `:`.',
          '`version` pins the state; `description`, `author`, `homepage`, `license` and `keywords` describe the plugin.',
          'A `CLAUDE.md` in the plugin folder is **not** loaded - knowledge belongs in skills.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Namensräume', en: 'Namespaces' } },
    {
      type: 'text',
      text: {
        de: 'Alles aus einem Plugin trägt dessen Namen als Präfix. Der Skill `review` aus dem Plugin `my-plugin` heißt `/my-plugin:review`, der Agent `reviewer` heißt `my-plugin:reviewer`. Deshalb kollidieren Plugins nie mit deinen eigenen Skills - auch wenn beide `review` heißen.',
        en: 'Everything from a plugin carries its name as a prefix. The skill `review` from the plugin `my-plugin` is called `/my-plugin:review`, the agent `reviewer` is `my-plugin:reviewer`. That is why plugins never collide with your own skills - even if both are called `review`.',
      },
    },
    { type: 'heading', text: { de: 'Marketplaces', en: 'Marketplaces' } },
    {
      type: 'text',
      text: {
        de: 'Plugins findest du über **Marketplaces**. Ein Marketplace ist kein Shop, sondern ein **Katalog**: eine Datei `.claude-plugin/marketplace.json` in einem Repository, die Plugins und ihre Quellen auflistet. Den offiziellen Marketplace `claude-plugins-official` fügt Claude Code beim ersten Start selbst hinzu; den eurer Firma fügst du hinzu:',
        en: 'You find plugins through **marketplaces**. A marketplace is not a store but a **catalog**: a file `.claude-plugin/marketplace.json` in a repository that lists plugins and their sources. Claude Code adds the official marketplace `claude-plugins-official` itself on first start; your company’s you add yourself:',
      },
    },
    {
      type: 'code',
      language: 'bash',
      code: '/plugin marketplace add owner/repo                  # a GitHub repository\n/plugin marketplace add owner/repo#v2.0             # pinned to a tag or branch\n/plugin marketplace add https://gitlab.example.com/group/repo.git\n/plugin marketplace add ./my-marketplace            # a local folder',
    },
    { type: 'heading', text: { de: 'Installieren und verwalten', en: 'Installing and managing' } },
    {
      type: 'code',
      language: 'bash',
      code: '# inside Claude Code\n/plugin                                   # panel: Discover, Installed, Marketplaces, Errors\n/plugin install deploy-tools@company-plugins\n/reload-plugins                           # apply changes in the running session\n\n# from the shell\nclaude plugin install deploy-tools@company-plugins --scope project\nclaude plugin list\nclaude plugin disable deploy-tools@company-plugins\nclaude plugin uninstall deploy-tools@company-plugins',
    },
    {
      type: 'table',
      head: { de: ['Scope', 'Gespeichert in', 'Gilt für'], en: ['Scope', 'Stored in', 'Applies to'] },
      rows: {
        de: [
          ['`user` (Standard)', '`~/.claude/settings.json`', 'dich, in allen Projekten'],
          ['`project`', '`.claude/settings.json` - committen', 'das Team in diesem Projekt'],
          ['`local`', '`.claude/settings.local.json`', 'nur dich, nur dieses Projekt'],
        ],
        en: [
          ['`user` (default)', '`~/.claude/settings.json`', 'you, in all projects'],
          ['`project`', '`.claude/settings.json` - commit it', 'the team in this project'],
          ['`local`', '`.claude/settings.local.json`', 'only you, only this project'],
        ],
      },
    },
    {
      type: 'text',
      text: {
        de: 'Für das Team stehen Marketplace und Plugins in der committeten `.claude/settings.json` (Schlüssel `extraKnownMarketplaces` und `enabledPlugins`). Jede Person installiert das Plugin trotzdem einmal selbst, etwa mit `claude plugin install … --scope project`. Plugins aus dem offiziellen Marketplace aktualisieren sich automatisch, die aus anderen Marketplaces erst, wenn du es in `/plugin` einschaltest.',
        en: 'For the team, marketplace and plugins live in the committed `.claude/settings.json` (keys `extraKnownMarketplaces` and `enabledPlugins`). Everyone still installs the plugin once themselves, e.g. with `claude plugin install … --scope project`. Plugins from the official marketplace update automatically, those from other marketplaces only once you turn it on in `/plugin`.',
      },
    },
    { type: 'heading', text: { de: 'Ein eigenes Plugin', en: 'A plugin of your own' } },
    {
      type: 'list',
      items: {
        de: [
          'Ordner mit `.claude-plugin/plugin.json` anlegen und Skills, Agents oder Hooks aus deinem Projekt hineinziehen.',
          'Mit `claude plugin validate ./mein-plugin` prüfen - in der CI mit `--strict`, dann scheitern auch Warnungen.',
          'Lokal testen: `/plugin marketplace add ./mein-marketplace` und von dort installieren.',
          'Teilen: das Repository mit `marketplace.json` veröffentlichen, das Team fügt es als Marketplace hinzu.',
        ],
        en: [
          'Create a folder with `.claude-plugin/plugin.json` and move skills, agents or hooks from your project into it.',
          'Check it with `claude plugin validate ./my-plugin` - in CI with `--strict`, so warnings fail too.',
          'Test locally: `/plugin marketplace add ./my-marketplace` and install from there.',
          'Share: publish the repository with `marketplace.json`; the team adds it as a marketplace.',
        ],
      },
    },
    {
      type: 'note',
      tone: 'warning',
      text: {
        de: 'Ein Plugin kann Hooks mitbringen, die Befehle ausführen, MCP-Server starten und Programme in den Pfad legen. Installiere nur aus Quellen, denen du vertraust, und sieh dir bei fremden Plugins an, was drinsteckt.',
        en: 'A plugin can bring hooks that run commands, start MCP servers and put programs on the path. Only install from sources you trust, and look at what is inside a foreign plugin.',
      },
    },
  ],
  tasks: [
    { id: 'claude-plugins-panel', text: { de: 'Öffne die Plugin-Übersicht.', en: 'Open the plugin overview.' }, command: '/plugin', check: { type: 'command', name: '/plugin' } },
    {
      id: 'claude-plugins-marketplace',
      text: { de: 'Füge den Firmen-Marketplace `acme/company-plugins` hinzu.', en: 'Add the company marketplace `acme/company-plugins`.' },
      command: '/plugin marketplace add acme/company-plugins',
      check: { type: 'marketplaceAdded' },
    },
    {
      id: 'claude-plugins-install',
      text: { de: 'Installiere das Plugin `team-tools` aus diesem Marketplace.', en: 'Install the plugin `team-tools` from that marketplace.' },
      command: '/plugin install team-tools@company-plugins',
      check: { type: 'pluginInstalled', name: 'team-tools' },
    },
    { id: 'claude-plugins-skills', text: { de: 'Sieh nach, welcher Skill dazugekommen ist - und wie er heißt.', en: 'Check which skill was added - and what it is called.' }, command: '/skills', check: { type: 'command', name: '/skills' } },
    {
      id: 'claude-plugins-run',
      text: { de: 'Ruf den Skill `release-notes` des Plugins mit seinem Namensraum auf.', en: 'Call the plugin’s `release-notes` skill with its namespace.' },
      command: '/team-tools:release-notes',
      check: { type: 'skillInvoked', name: 'team-tools:release-notes' },
    },
  ],
  quiz: [
    {
      question: { de: 'Was ist ein Plugin?', en: 'What is a plugin?' },
      answers: {
        de: ['Ein anderes Modell', 'Ein Paket aus Skills, Agents, Hooks, MCP-Servern & Co., mit einem Befehl installierbar', 'Eine Erweiterung für VS Code', 'Eine CLAUDE.md für mehrere Projekte'],
        en: ['Another model', 'A package of skills, agents, hooks, MCP servers and more, installable with one command', 'An extension for VS Code', 'A CLAUDE.md for several projects'],
      },
      correct: 1,
      explanation: {
        de: 'Plugins bündeln, was du sonst einzeln einrichtest - und machen es teilbar.',
        en: 'Plugins bundle what you would otherwise set up one by one - and make it shareable.',
      },
    },
    {
      question: { de: 'Was ist ein Marketplace?', en: 'What is a marketplace?' },
      answers: {
        de: ['Ein Shop, in dem man Plugins kauft', 'Ein Katalog in einem Repository, der Plugins und ihre Quellen auflistet', 'Die Einstellungsdatei für Plugins', 'Ein MCP-Server'],
        en: ['A store where you buy plugins', 'A catalog in a repository that lists plugins and their sources', 'The settings file for plugins', 'An MCP server'],
      },
      correct: 1,
      explanation: {
        de: 'Ein Marketplace ist eine `marketplace.json` in einem Repo - ein Verzeichnis, kein Laden.',
        en: 'A marketplace is a `marketplace.json` in a repo - a directory, not a store.',
      },
    },
    {
      question: { de: 'Wie rufst du den Skill `deploy` aus dem Plugin `ops` auf?', en: 'How do you call the skill `deploy` from the plugin `ops`?' },
      answers: { de: ['/deploy', '/ops:deploy', '/plugin deploy', '@ops/deploy'], en: ['/deploy', '/ops:deploy', '/plugin deploy', '@ops/deploy'] },
      correct: 1,
      explanation: {
        de: 'Plugin-Bestandteile tragen den Plugin-Namen als Namensraum.',
        en: 'Plugin parts carry the plugin name as their namespace.',
      },
    },
    {
      question: { de: 'Welches Feld in `plugin.json` ist Pflicht?', en: 'Which field in `plugin.json` is required?' },
      answers: { de: ['`version`', '`name`', '`author`', '`skills`'], en: ['`version`', '`name`', '`author`', '`skills`'] },
      correct: 1,
      explanation: {
        de: 'Nur `name` ist Pflicht. Skills, Agents und Hooks findet Claude Code in ihren Standardordnern.',
        en: 'Only `name` is required. Claude Code finds skills, agents and hooks in their default folders.',
      },
    },
    {
      question: { de: 'Warum solltest du ein fremdes Plugin vor der Installation ansehen?', en: 'Why should you look at a foreign plugin before installing it?' },
      answers: {
        de: ['Es könnte zu groß sein', 'Es kann Hooks und MCP-Server mitbringen, die Befehle ausführen', 'Es überschreibt deine CLAUDE.md', 'Muss man nicht - Plugins sind geprüft'],
        en: ['It could be too big', 'It can bring hooks and MCP servers that run commands', 'It overwrites your CLAUDE.md', 'No need - plugins are vetted'],
      },
      correct: 1,
      explanation: {
        de: 'Ein Plugin bringt ausführbare Teile mit. Vertrauen in die Quelle ist Pflicht.',
        en: 'A plugin brings executable parts. Trust in the source is a must.',
      },
    },
  ],
  keyPoints: {
    de: [
      'Ein Plugin bündelt Skills, Subagents, Hooks, MCP-Server und mehr zu einem installierbaren Paket.',
      'Pflicht ist nur `.claude-plugin/plugin.json` mit `name`; die Bestandteile liegen in ihren Standardordnern.',
      'Alles aus einem Plugin hat einen Namensraum: `/plugin:skill`, `plugin:agent`.',
      'Marketplaces sind Kataloge in Repos: `/plugin marketplace add owner/repo`, dann `/plugin install name@marketplace`.',
      'Fürs Team: Scope `project` in `.claude/settings.json` committen - und nur Plugins aus vertrauten Quellen installieren.',
    ],
    en: [
      'A plugin bundles skills, subagents, hooks, MCP servers and more into an installable package.',
      'Only `.claude-plugin/plugin.json` with `name` is required; the parts live in their default folders.',
      'Everything from a plugin has a namespace: `/plugin:skill`, `plugin:agent`.',
      'Marketplaces are catalogs in repos: `/plugin marketplace add owner/repo`, then `/plugin install name@marketplace`.',
      'For the team: commit scope `project` in `.claude/settings.json` - and only install plugins from trusted sources.',
    ],
  },
}
