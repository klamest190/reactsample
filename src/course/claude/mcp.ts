import type { Lesson } from './types'

export const mcpLesson: Lesson = {
  id: 'claude-mcp',
  setup: { installed: true, loggedIn: true, inRepl: false },
  blocks: [
    { type: 'heading', text: { de: 'Was ist MCP?', en: 'What is MCP?' } },
    {
      type: 'text',
      text: {
        de: 'Von Haus aus kann Claude Code lesen, schreiben, Befehle ausführen und im Web suchen. Auf euren Issue-Tracker, eure Datenbank oder euer Design-Tool hat es keinen Zugriff. Das **Model Context Protocol (MCP)** ist ein offener Standard, über den solche Systeme Claude **zusätzliche Werkzeuge** anbieten - dazu Prompts und Ressourcen. Das Programm, das diese Werkzeuge bereitstellt, heißt **MCP-Server**.',
        en: 'Out of the box Claude Code can read, write, run commands and search the web. It has no access to your issue tracker, your database or your design tool. The **Model Context Protocol (MCP)** is an open standard through which such systems offer Claude **extra tools** - plus prompts and resources. The program that provides these tools is called an **MCP server**.',
      },
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: 'Vergleich: Ein MCP-Server ist für Claude, was ein Treiber für das Betriebssystem ist. Claude muss euren Tracker nicht kennen - der Server übersetzt zwischen beiden.',
        en: 'Comparison: an MCP server is to Claude what a driver is to the operating system. Claude does not need to know your tracker - the server translates between the two.',
      },
    },
    {
      type: 'table',
      head: { de: ['Transport', 'Wo läuft der Server?', 'Beispiel'], en: ['Transport', 'Where does the server run?', 'Example'] },
      rows: {
        de: [
          ['`http`', 'entfernt, im Netz - empfohlen für Cloud-Dienste', 'ein gehosteter Dienst wie Notion'],
          ['`stdio`', 'lokal, als Programm auf deinem Rechner', 'ein Datenbank-Werkzeug per `npx`'],
          ['`sse`', 'entfernt - veraltet, besser `http` nutzen', 'ältere Server'],
        ],
        en: [
          ['`http`', 'remote, on the network - recommended for cloud services', 'a hosted service like Notion'],
          ['`stdio`', 'local, as a program on your machine', 'a database tool via `npx`'],
          ['`sse`', 'remote - deprecated, use `http` instead', 'older servers'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Einen Server hinzufügen', en: 'Adding a server' } },
    {
      type: 'text',
      text: {
        de: 'Server richtest du mit dem Kommandozeilenbefehl `claude mcp add` ein - also **in der Shell**, nicht als Prompt. Die Beispiele stammen aus der offiziellen Doku:',
        en: 'You set servers up with the command-line command `claude mcp add` - so **in the shell**, not as a prompt. The examples come from the official docs:',
      },
    },
    {
      type: 'code',
      language: 'bash',
      code: '# remote server over HTTP\nclaude mcp add --transport http notion https://mcp.notion.com/mcp\n\n# with an auth header\nclaude mcp add --transport http secure-api https://api.example.com/mcp --header "Authorization: Bearer your-token"\n\n# local server: everything after -- is the command that starts it\nclaude mcp add --env AIRTABLE_API_KEY=YOUR_KEY --transport stdio airtable -- npx -y airtable-mcp-server',
    },
    {
      type: 'list',
      items: {
        de: [
          '`--transport` (kurz `-t`): `http`, `stdio` oder das veraltete `sse`.',
          '`--` trennt die Optionen von Claude Code vom Befehl, der den Server startet.',
          '`--env` (`-e`) setzt Umgebungsvariablen für den Server - vor den Namen schreiben.',
          '`--header` (`-H`) schickt einen HTTP-Header mit, etwa für ein Token.',
          '`--scope` (`-s`) bestimmt, wo die Einstellung landet - siehe unten.',
        ],
        en: [
          '`--transport` (short `-t`): `http`, `stdio` or the deprecated `sse`.',
          '`--` separates the options of Claude Code from the command that starts the server.',
          '`--env` (`-e`) sets environment variables for the server - put it before the name.',
          '`--header` (`-H`) sends an HTTP header along, e.g. for a token.',
          '`--scope` (`-s`) decides where the setting lands - see below.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Scopes: für wen gilt der Server?', en: 'Scopes: who gets the server?' } },
    {
      type: 'table',
      head: { de: ['Scope', 'Gespeichert in', 'Gilt für'], en: ['Scope', 'Stored in', 'Applies to'] },
      rows: {
        de: [
          ['`local` (Standard)', '`~/.claude.json`', 'nur dich, nur dieses Projekt'],
          ['`project`', '`.mcp.json` im Projekt - committen', 'das ganze Team in diesem Projekt'],
          ['`user`', '`~/.claude.json`', 'dich, in allen Projekten'],
        ],
        en: [
          ['`local` (default)', '`~/.claude.json`', 'only you, only this project'],
          ['`project`', '`.mcp.json` in the project - commit it', 'the whole team in this project'],
          ['`user`', '`~/.claude.json`', 'you, in all projects'],
        ],
      },
    },
    {
      type: 'code',
      language: 'json',
      caption: { de: '.mcp.json - Geheimnisse kommen aus Umgebungsvariablen', en: '.mcp.json - secrets come from environment variables' },
      code: '{\n  "mcpServers": {\n    "shared-server": {\n      "type": "http",\n      "url": "https://example.com/mcp",\n      "headers": { "Authorization": "Bearer ${API_KEY}" }\n    },\n    "local-tool": {\n      "command": "npx",\n      "args": ["-y", "some-mcp-server"],\n      "env": { "DB_URL": "${DB_URL:-postgresql://localhost/dev}" }\n    }\n  }\n}',
    },
    {
      type: 'note',
      tone: 'warning',
      text: {
        de: 'Tokens nie direkt in `.mcp.json` schreiben - die Datei landet im Git. `${VAR}` und `${VAR:-standard}` holen Werte aus der Umgebung. Bevor eine interaktive Sitzung Server aus `.mcp.json` nutzt, fragt Claude Code einmal nach; `claude -p` lädt sie ohne Rückfrage.',
        en: 'Never write tokens directly into `.mcp.json` - the file ends up in git. `${VAR}` and `${VAR:-default}` take values from the environment. Before an interactive session uses servers from `.mcp.json`, Claude Code asks once; `claude -p` loads them without asking.',
      },
    },
    { type: 'heading', text: { de: 'Verwalten', en: 'Managing' } },
    {
      type: 'code',
      language: 'bash',
      code: 'claude mcp list            # all servers and whether they connect\nclaude mcp get tracker     # details of one server\nclaude mcp remove tracker  # remove it (also deletes its OAuth tokens)',
    },
    {
      type: 'text',
      text: {
        de: 'In der laufenden Sitzung zeigt `/mcp` den Zustand aller Server mit ihren Werkzeugen. Dort meldest du dich bei Servern mit OAuth an, schaltest Server ein oder aus und verbindest sie neu.',
        en: 'In the running session, `/mcp` shows the state of every server with its tools. That is where you sign in to servers with OAuth, turn servers on or off and reconnect them.',
      },
    },
    { type: 'heading', text: { de: 'Werkzeuge und Rechte', en: 'Tools and permissions' } },
    {
      type: 'text',
      text: {
        de: 'MCP-Werkzeuge heißen `mcp__<server>__<werkzeug>` - zum Beispiel `mcp__tracker__list_issues`. Wie bei Bash fragt Claude vor der Nutzung. Mit „Yes, and don’t ask again“ oder einer Regel in den Einstellungen gibst du sie frei:',
        en: 'MCP tools are named `mcp__<server>__<tool>` - for example `mcp__tracker__list_issues`. Like with Bash, Claude asks before using them. With "Yes, and don’t ask again" or a rule in the settings you allow them:',
      },
    },
    {
      type: 'table',
      head: { de: ['Regel', 'Erlaubt'], en: ['Rule', 'Allows'] },
      rows: {
        de: [
          ['`mcp__puppeteer__*`', 'alle Werkzeuge des Servers `puppeteer`'],
          ['`mcp__github__get_*`', 'alle `get_…`-Werkzeuge des Servers `github`'],
          ['`mcp__puppeteer__puppeteer_navigate`', 'genau ein Werkzeug'],
        ],
        en: [
          ['`mcp__puppeteer__*`', 'every tool of the server `puppeteer`'],
          ['`mcp__github__get_*`', 'every `get_…` tool of the server `github`'],
          ['`mcp__puppeteer__puppeteer_navigate`', 'exactly one tool'],
        ],
      },
    },
    {
      type: 'text',
      text: {
        de: 'Antworten von MCP-Werkzeugen landen im Kontext. Ab 10.000 Tokens warnt Claude Code, die Grenze liegt standardmäßig bei 25.000 Tokens und lässt sich mit `MAX_MCP_OUTPUT_TOKENS` anheben.',
        en: 'Answers of MCP tools land in the context. From 10,000 tokens on Claude Code warns; the limit is 25,000 tokens by default and can be raised with `MAX_MCP_OUTPUT_TOKENS`.',
      },
    },
    {
      type: 'note',
      tone: 'warning',
      text: {
        de: 'Ein MCP-Server führt Code aus oder spricht mit fremden Diensten. Prüfe jeden Server, bevor du ihn verbindest. Server, die Inhalte aus dem Netz holen (Webseiten, Tickets, E-Mails), können Prompt Injection einschleusen - Text, der wie eine Anweisung an Claude aussieht. Auch Plugins können Server mitbringen, `.mcp.json` zeigt also nicht unbedingt alle.',
        en: 'An MCP server runs code or talks to outside services. Check every server before you connect it. Servers that fetch content from the network (web pages, tickets, emails) can smuggle in prompt injection - text that looks like an instruction to Claude. Plugins can bring servers too, so `.mcp.json` does not necessarily show all of them.',
      },
    },
  ],
  tasks: [
    {
      id: 'claude-mcp-add',
      text: { de: 'Füge in der Shell den HTTP-Server `tracker` hinzu (`https://mcp.example.com/tracker`).', en: 'Add the HTTP server `tracker` in the shell (`https://mcp.example.com/tracker`).' },
      command: 'claude mcp add --transport http tracker https://mcp.example.com/tracker',
      check: { type: 'mcpAdded' },
    },
    {
      id: 'claude-mcp-project',
      text: { de: 'Füge ihn noch einmal hinzu - diesmal für das ganze Team (Scope `project`).', en: 'Add it once more - this time for the whole team (scope `project`).' },
      command: 'claude mcp add --transport http --scope project tracker https://mcp.example.com/tracker',
      check: { type: 'mcpAdded', scope: 'project' },
    },
    { id: 'claude-mcp-list', text: { de: 'Prüfe, ob der Server verbindet.', en: 'Check whether the server connects.' }, command: 'claude mcp list', check: { type: 'mcpListed' } },
    {
      id: 'claude-mcp-use',
      text: { de: 'Starte Claude Code und frag, welche Issues offen sind. Erlaube das MCP-Werkzeug.', en: 'Start Claude Code and ask which issues are open. Allow the MCP tool.' },
      command: 'Which issues are open?',
      check: { type: 'mcpToolUsed', server: 'tracker' },
    },
    {
      id: 'claude-mcp-always',
      text: { de: 'Frag noch einmal und erlaube die Werkzeuge des Servers dauerhaft (`2`).', en: 'Ask again and allow the server’s tools for good (`2`).' },
      command: 'Which issues are open?',
      check: { type: 'permission', answer: 'always' },
    },
    { id: 'claude-mcp-status', text: { de: 'Sieh dir in der Sitzung den Zustand der MCP-Server an.', en: 'Look at the state of the MCP servers inside the session.' }, command: '/mcp', check: { type: 'command', name: '/mcp' } },
  ],
  quiz: [
    {
      question: { de: 'Wozu dient ein MCP-Server?', en: 'What is an MCP server for?' },
      answers: {
        de: ['Er macht Claude schneller', 'Er bietet Claude zusätzliche Werkzeuge für ein anderes System an', 'Er speichert das Gespräch', 'Er ersetzt die CLAUDE.md'],
        en: ['It makes Claude faster', 'It offers Claude extra tools for another system', 'It stores the conversation', 'It replaces CLAUDE.md'],
      },
      correct: 1,
      explanation: {
        de: 'MCP ist ein Standard, über den Systeme wie Tracker oder Datenbanken Claude Werkzeuge anbieten.',
        en: 'MCP is a standard through which systems like trackers or databases offer Claude tools.',
      },
    },
    {
      question: { de: 'Wohin gehört ein Server, den das ganze Team im Projekt nutzen soll?', en: 'Where does a server go that the whole team should use in the project?' },
      answers: {
        de: ['Scope `local` in `~/.claude.json`', 'Scope `project` in `.mcp.json`, committet', 'Scope `user`', 'In die CLAUDE.md'],
        en: ['Scope `local` in `~/.claude.json`', 'Scope `project` in `.mcp.json`, committed', 'Scope `user`', 'Into CLAUDE.md'],
      },
      correct: 1,
      explanation: {
        de: '`.mcp.json` liegt im Repo. `local` und `user` landen in deiner persönlichen `~/.claude.json`.',
        en: '`.mcp.json` lives in the repo. `local` and `user` end up in your personal `~/.claude.json`.',
      },
    },
    {
      question: { de: 'Was bedeutet `--` in `claude mcp add db -- npx -y db-server`?', en: 'What does `--` mean in `claude mcp add db -- npx -y db-server`?' },
      answers: {
        de: ['Ein Kommentar', 'Alles danach ist der Befehl, der den lokalen Server startet', 'Der Server wird entfernt', 'Es schaltet Rückfragen ab'],
        en: ['A comment', 'Everything after it is the command that starts the local server', 'The server gets removed', 'It turns off questions'],
      },
      correct: 1,
      explanation: {
        de: 'Ohne `--` würde Claude Code `-y` als eigene Option lesen.',
        en: 'Without `--`, Claude Code would read `-y` as its own option.',
      },
    },
    {
      question: { de: 'Welche Regel erlaubt alle Werkzeuge des Servers `tracker`?', en: 'Which rule allows every tool of the server `tracker`?' },
      answers: { de: ['`Bash(tracker *)`', '`mcp__tracker__*`', '`tracker:*`', '`Read(tracker)`'], en: ['`Bash(tracker *)`', '`mcp__tracker__*`', '`tracker:*`', '`Read(tracker)`'] },
      correct: 1,
      explanation: {
        de: 'MCP-Werkzeuge heißen `mcp__<server>__<werkzeug>`; der Stern steht für alle Werkzeuge.',
        en: 'MCP tools are named `mcp__<server>__<tool>`; the star stands for every tool.',
      },
    },
    {
      question: { de: 'Ein Server liest Tickets von Kunden. Welches Risiko solltest du kennen?', en: 'A server reads customer tickets. Which risk should you know about?' },
      answers: {
        de: ['Keins - Tickets sind nur Text', 'Prompt Injection: Text im Ticket könnte wie eine Anweisung an Claude wirken', 'Der Server wird zu langsam', 'Claude vergisst die CLAUDE.md'],
        en: ['None - tickets are just text', 'Prompt injection: text in a ticket could act like an instruction to Claude', 'The server gets too slow', 'Claude forgets CLAUDE.md'],
      },
      correct: 1,
      explanation: {
        de: 'Fremde Inhalte landen im Kontext. Deshalb: Server prüfen und bei unerwarteten Aktionen genau hinsehen.',
        en: 'Outside content lands in the context. So: check servers and look closely at unexpected actions.',
      },
    },
  ],
  keyPoints: {
    de: [
      'MCP ist ein offener Standard: Server bieten Claude zusätzliche Werkzeuge für andere Systeme an.',
      '`claude mcp add` in der Shell - `--transport http` für entfernte, `-- befehl` für lokale Server.',
      'Scopes: `local` (Standard, nur du), `project` (`.mcp.json`, fürs Team), `user` (alle deine Projekte).',
      'Werkzeuge heißen `mcp__server__werkzeug`; Regeln wie `mcp__tracker__*` geben sie frei. `/mcp` zeigt den Zustand.',
      'Jeden Server vorher prüfen - fremde Inhalte können Prompt Injection mitbringen. Geheimnisse per `${VAR}`, nie im Klartext.',
    ],
    en: [
      'MCP is an open standard: servers offer Claude extra tools for other systems.',
      '`claude mcp add` in the shell - `--transport http` for remote, `-- command` for local servers.',
      'Scopes: `local` (default, only you), `project` (`.mcp.json`, for the team), `user` (all your projects).',
      'Tools are named `mcp__server__tool`; rules like `mcp__tracker__*` allow them. `/mcp` shows the state.',
      'Check every server first - outside content can bring prompt injection. Secrets via `${VAR}`, never in plain text.',
    ],
  },
}
