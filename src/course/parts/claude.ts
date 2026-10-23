import { laden, type Teil } from './types'

/**
 * Part 10. All lessons share one component file - the content is data (course/claude/), the
 * language comes from the context, so German and English point to the same component.
 */
const lesson = (name: 'ClaudeSetup' | 'ClaudeCommands' | 'ClaudeContext' | 'ClaudeAgent' | 'ClaudeSkills') => {
  const component = laden(() => import('../claude/ClaudeLesson'), name)
  return { de: component, en: component }
}

export const claudeTeil: Teil = {
  id: 'claude',
  nummer: 10,
  titel: { de: 'Claude Code Engineer', en: 'Claude Code Engineer' },
  kurztitel: { de: 'Claude Code', en: 'Claude Code' },
  bereich: 'tools',
  playground: false,
  beschreibung: {
    de: 'Mit einem KI-Agenten im Terminal arbeiten: installieren, steuern, Kontext verwalten, den Agentic Loop kontrollieren und eigene Skills für das Team schreiben - geübt in einem simulierten Claude-Code-Terminal.',
    en: 'Work with an AI agent in the terminal: install, steer, manage context, control the agentic loop and write your own skills for the team - practised in a simulated Claude Code terminal.',
  },
  kapitel: [
    {
      id: 'claude-setup',
      titel: { de: 'Setup & Grundlagen', en: 'Setup & Basics' },
      kurz: {
        de: 'Claude Code installieren, anmelden und die ersten Befehle im Terminal.',
        en: 'Install Claude Code, sign in and run the first commands in the terminal.',
      },
      dauer: 25,
      lernziele: {
        de: ['Claude Code nativ oder per npm installieren', 'Die Installation prüfen und aktualisieren', 'Sich mit Abo oder Console-Konto anmelden', 'Interaktiven Modus und Print-Modus unterscheiden'],
        en: ['Install Claude Code natively or with npm', 'Check and update the installation', 'Sign in with a subscription or a Console account', 'Tell interactive mode and print mode apart'],
      },
      stichworte: ['Claude Code', 'Claude', 'AI', 'KI', 'agent', 'install', 'Installation', 'npm', 'claude --version', 'claude doctor', 'login', 'Anmeldung', 'ANTHROPIC_API_KEY', 'claude -p', 'print mode', 'CLI', 'REPL'],
      Komponente: lesson('ClaudeSetup'),
    },
    {
      id: 'claude-commands',
      titel: { de: 'Slash-Commands', en: 'Slash Commands' },
      kurz: {
        de: 'Claude Code steuern statt nur fragen: Hilfe, Kosten, Kontext verdichten und neu anfangen.',
        en: 'Steer Claude Code instead of just asking: help, cost, compacting context and starting over.',
      },
      dauer: 20,
      lernziele: {
        de: ['Slash-Commands von Prompts unterscheiden', 'Kosten und Limits mit /usage im Blick behalten', 'Mit /compact und /clear den Kontext bewusst verwalten', 'Fehler mit /bug melden'],
        en: ['Tell slash commands from prompts', 'Keep an eye on cost and limits with /usage', 'Manage the context on purpose with /compact and /clear', 'Report problems with /bug'],
      },
      stichworte: ['slash command', 'Slash-Command', '/help', '/compact', '/clear', '/cost', '/usage', '/bug', '/feedback', '/model', '/status', 'context window', 'Kontextfenster'],
      Komponente: lesson('ClaudeCommands'),
    },
    {
      id: 'claude-context',
      titel: { de: 'Kontext & Dateien', en: 'Context & Files' },
      kurz: {
        de: 'Wie Claude Code dein Projekt liest, was CLAUDE.md bewirkt und wie du gezielt Dateien in den Kontext holst.',
        en: 'How Claude Code reads your project, what CLAUDE.md does and how you bring files into the context on purpose.',
      },
      dauer: 30,
      lernziele: {
        de: ['Erklären, wie Claude ein Projekt erkundet', 'Den Kontext mit /context sichtbar machen', 'Dateien mit @ gezielt in den Kontext holen', 'Mit /init und CLAUDE.md dauerhaftes Projektwissen anlegen', 'Git-Informationen von Claude auswerten lassen'],
        en: ['Explain how Claude explores a project', 'Make the context visible with /context', 'Bring files into the context with @', 'Create lasting project knowledge with /init and CLAUDE.md', 'Let Claude work with git information'],
      },
      stichworte: ['context', 'Kontext', '/context', '@', 'mention', 'CLAUDE.md', '/init', '/memory', 'memory', 'git', 'git status', 'git diff', '/add-dir', '--add-dir', 'CLAUDE.local.md', 'AGENTS.md'],
      Komponente: lesson('ClaudeContext'),
    },
    {
      id: 'claude-agent',
      titel: { de: 'Agentic Loop & Tools', en: 'Agentic Loop & Tools' },
      kurz: {
        de: 'Wie Claude selbstständig liest, ausführt und ändert - und wie du mit Ja, Nein und Regeln die Kontrolle behältst.',
        en: 'How Claude reads, runs and changes things on its own - and how you stay in control with yes, no and rules.',
      },
      dauer: 35,
      lernziele: {
        de: ['Den Agentic Loop (planen, handeln, prüfen) beschreiben', 'Die eingebauten Werkzeuge und ihr Risiko kennen', 'Erlaubnisanfragen bewusst bestätigen oder ablehnen', 'Berechtigungsmodi mit Shift+Tab wechseln', 'Dauerhafte Regeln in den Einstellungen anlegen'],
        en: ['Describe the agentic loop (plan, act, check)', 'Know the built-in tools and their risk', 'Approve or reject permission requests on purpose', 'Switch permission modes with Shift+Tab', 'Create lasting rules in the settings'],
      },
      stichworte: ['agent', 'Agent', 'agentic loop', 'tool', 'Werkzeug', 'Bash', 'Read', 'Edit', 'Write', 'permission', 'Berechtigung', 'approve', 'reject', 'plan mode', 'Plan-Modus', 'acceptEdits', 'auto mode', 'shift+tab', '/permissions', 'settings.json'],
      Komponente: lesson('ClaudeAgent'),
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
      Komponente: lesson('ClaudeSkills'),
    },
  ],
}
