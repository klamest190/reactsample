import { createElement, lazy } from 'react'
import type { Teil } from './types'

/**
 * Parts 10 and 11 (this file and claudeAdvanced.ts). Every lesson is data (course/claude/) shown by
 * the same component, ClaudeLesson; the language comes from the context, so German and English
 * point to the same lazily loaded component.
 */
export function claudeLesson(id: string) {
  const component = lazy(() => import('../claude/ClaudeLesson').then(({ ClaudeLesson }) => ({ default: () => createElement(ClaudeLesson, { id }) })))
  return { de: component, en: component }
}

export const claudeTeil: Teil = {
  id: 'claude',
  nummer: 10,
  titel: { de: 'Claude Code: Grundlagen', en: 'Claude Code: Fundamentals' },
  kurztitel: { de: 'Claude Code', en: 'Claude Code' },
  bereich: 'tools',
  playground: false,
  beschreibung: {
    de: 'Mit einem KI-Agenten im Terminal arbeiten - von Grund auf: wie Sprachmodelle und Agenten funktionieren, Installation, Befehle, Kontext, gute Aufträge, der Agentic Loop und Git als Sicherheitsnetz. Geübt in einem simulierten Claude-Code-Terminal.',
    en: 'Working with an AI agent in the terminal - from the ground up: how language models and agents work, installation, commands, context, good prompts, the agentic loop and git as the safety net. Practised in a simulated Claude Code terminal.',
  },
  kapitel: [
    {
      id: 'claude-basics',
      titel: { de: 'Wie KI-Agenten arbeiten', en: 'How AI Agents Work' },
      kurz: {
        de: 'Sprachmodell, Tokens, Kontextfenster, Modelle und Halluzinationen - und was aus einem Modell einen Agenten macht.',
        en: 'Language model, tokens, context window, models and hallucinations - and what turns a model into an agent.',
      },
      dauer: 25,
      lernziele: {
        de: ['Erklären, wie ein Sprachmodell Text erzeugt und was der Knowledge Cutoff bedeutet', 'Tokens und das Kontextfenster verstehen', 'Modelle mit /model wählen und den Aufwand einschätzen', 'Halluzinationen erkennen und durch Prüfen abfangen', 'Chat und Agent unterscheiden'],
        en: ['Explain how a language model produces text and what the knowledge cutoff means', 'Understand tokens and the context window', 'Pick models with /model and judge the effort', 'Recognize hallucinations and catch them by checking', 'Tell chat and agent apart'],
      },
      stichworte: ['Claude Code', 'Claude', 'LLM', 'language model', 'Sprachmodell', 'token', 'Token', 'context window', 'Kontextfenster', 'knowledge cutoff', 'model', 'Modell', '/model', 'opus', 'sonnet', 'haiku', 'fable', 'opusplan', 'effort', '/effort', 'ultrathink', 'thinking', 'hallucination', 'Halluzination', 'agent', 'Agent', 'AI', 'KI'],
      Komponente: claudeLesson('claude-basics'),
    },
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
      stichworte: ['Claude Code', 'install', 'Installation', 'npm', 'claude --version', 'claude doctor', 'login', 'Anmeldung', 'ANTHROPIC_API_KEY', 'claude -p', 'print mode', 'CLI', 'REPL'],
      Komponente: claudeLesson('claude-setup'),
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
      Komponente: claudeLesson('claude-commands'),
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
      Komponente: claudeLesson('claude-context'),
    },
    {
      id: 'claude-prompting',
      titel: { de: 'Gute Aufträge formulieren', en: 'Writing Good Prompts' },
      kurz: {
        de: 'Konkret statt vage, Kontext mitgeben, erst planen, dann umsetzen - und früh korrigieren.',
        en: 'Specific instead of vague, give context, plan first, then implement - and correct early.',
      },
      dauer: 30,
      lernziele: {
        de: ['Aufträge mit Ort, Symptom, Einschränkungen und Erfolgskriterium formulieren', 'Kontext mit @-Dateien, Fehlerausgaben und Screenshots mitgeben', 'Den Ablauf Erkunden - Planen - Umsetzen - Committen anwenden', 'Mit dem Plan-Modus erst planen, dann umsetzen lassen', 'Früh korrigieren und typische Fehlmuster vermeiden'],
        en: ['Write tasks with location, symptom, constraints and success criterion', 'Give context with @ files, error output and screenshots', 'Apply the explore - plan - code - commit routine', 'Use plan mode to plan first, then let Claude implement', 'Correct early and avoid common failure patterns'],
      },
      stichworte: ['prompt', 'Prompt', 'prompting', 'Auftrag', 'specific', 'konkret', 'plan mode', 'Plan-Modus', 'shift+tab', 'Ctrl+G', 'explore plan code commit', 'success criteria', 'Erfolgskriterium', '/verify', '/rewind', 'Esc', '/clear', 'screenshot', 'best practices', 'writer reviewer'],
      Komponente: claudeLesson('claude-prompting'),
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
      Komponente: claudeLesson('claude-agent'),
    },
    {
      id: 'claude-git',
      titel: { de: 'Git-Workflows & Checkpoints', en: 'Git Workflows & Checkpoints' },
      kurz: {
        de: 'Git als Sicherheitsnetz: Status und Diff lesen lassen, Branches, Commits, Pull Requests - und mit /rewind zurückspringen.',
        en: 'Git as the safety net: let Claude read status and diff, branches, commits, pull requests - and jump back with /rewind.',
      },
      dauer: 35,
      lernziele: {
        de: ['Git als Sicherheitsnetz für Agenten-Arbeit nutzen', 'Branches, Commits und Pull Requests von Claude anlegen lassen', 'Checkpoints und /rewind einsetzen und ihre Grenzen kennen', 'Parallele Sitzungen mit Worktrees trennen'],
        en: ['Use git as the safety net for agent work', 'Let Claude create branches, commits and pull requests', 'Use checkpoints and /rewind and know their limits', 'Keep parallel sessions apart with worktrees'],
      },
      stichworte: ['git', 'Git', 'branch', 'Branch', 'commit', 'pull request', 'PR', 'gh', 'diff', 'git log', '/rewind', 'checkpoint', 'Checkpoint', 'worktree', 'claude -w', '--from-pr', 'attribution'],
      Komponente: claudeLesson('claude-git'),
    },
  ],
}
