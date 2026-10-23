import type { Lesson } from './types'

export const commandsLesson: Lesson = {
  id: 'claude-commands',
  setup: { installed: true, loggedIn: true, inRepl: true, priorMessages: 14 },
  blocks: [
    { type: 'heading', text: { de: 'Prompt oder Befehl?', en: 'Prompt or command?' } },
    {
      type: 'text',
      text: {
        de: 'Alles, was du in Claude Code tippst, geht an das Modell - **außer** es beginnt mit `/`. Ein Slash-Command wird von Claude Code selbst ausgeführt: sofort, ohne Tokens, mit immer gleichem Ergebnis. Tippst du nur `/`, zeigt ein Menü alle Befehle; weitere Buchstaben filtern die Liste.',
        en: 'Everything you type in Claude Code goes to the model - **unless** it starts with `/`. A slash command is run by Claude Code itself: instantly, without tokens, with the same result every time. Type just `/` and a menu lists all commands; more letters filter the list.',
      },
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: 'Die Sitzung im Terminal rechts läuft schon eine Weile: 14 Nachrichten zur Todo-App. So haben `/usage` und `/compact` etwas zu zeigen.',
        en: 'The session in the terminal on the right has been running for a while: 14 messages about the todo app. That gives `/usage` and `/compact` something to show.',
      },
    },
    { type: 'heading', text: { de: 'Die wichtigsten Befehle', en: 'The most important commands' } },
    {
      type: 'table',
      head: { de: ['Befehl', 'Was er tut', 'Wann'], en: ['Command', 'What it does', 'When'] },
      rows: {
        de: [
          ['`/help`', 'listet alle Befehle und Kürzel', 'wenn du etwas suchst'],
          ['`/usage`', 'Kosten, Dauer, geänderte Zeilen, Plan-Limits (`/cost` ist ein Alias)', 'nach einer großen Aufgabe'],
          ['`/compact [Anweisung]`', 'fasst das bisherige Gespräch zusammen und gibt Platz frei', 'wenn eine lange Aufgabe weitergeht'],
          ['`/clear`', 'beginnt ein leeres Gespräch (Aliase `/reset`, `/new`)', 'wenn eine neue Aufgabe beginnt'],
          ['`/bug [Bericht]`', 'meldet einen Fehler an Anthropic, samt Verlauf', 'wenn Claude Code selbst hakt'],
          ['`/model`', 'wechselt das Modell (opus, sonnet, haiku)', 'schwere vs. schnelle Aufgaben'],
          ['`/status`', 'Version, Modell, Konto, Verbindung', 'bei Problemen'],
        ],
        en: [
          ['`/help`', 'lists all commands and shortcuts', 'when you look for something'],
          ['`/usage`', 'cost, duration, changed lines, plan limits (`/cost` is an alias)', 'after a big task'],
          ['`/compact [instructions]`', 'summarizes the conversation so far and frees space', 'when a long task goes on'],
          ['`/clear`', 'starts an empty conversation (aliases `/reset`, `/new`)', 'when a new task begins'],
          ['`/bug [report]`', 'reports a problem to Anthropic, with the transcript', 'when Claude Code itself misbehaves'],
          ['`/model`', 'switches the model (opus, sonnet, haiku)', 'hard vs. quick tasks'],
          ['`/status`', 'version, model, account, connection', 'when something is off'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Warum Kontext etwas kostet', en: 'Why context costs something' } },
    {
      type: 'text',
      text: {
        de: 'Claude sieht bei jeder Antwort das **ganze** bisherige Gespräch: deine Prompts, seine Antworten, jede gelesene Datei, jede Testausgabe. Das ist das Kontextfenster. Je voller es ist, desto teurer und langsamer wird jede Antwort - und desto leichter übersieht Claude Wichtiges zwischen altem Ballast.',
        en: 'With every answer Claude sees the **whole** conversation so far: your prompts, its answers, every file it read, every test output. That is the context window. The fuller it gets, the more expensive and slower every answer becomes - and the easier Claude overlooks what matters among old clutter.',
      },
    },
    {
      type: 'list',
      items: {
        de: [
          '`/compact` behält das Wesentliche als Zusammenfassung - gut, wenn du **an derselben Aufgabe** weiterarbeitest.',
          'Mit einer Anweisung bestimmst du, was die Zusammenfassung behalten soll: `/compact focus on the toggle bug and the failing test`.',
          '`/clear` wirft alles weg - gut, wenn **etwas Neues** beginnt. Alte Gespräche bleiben über `claude -r` erreichbar.',
          'Läuft das Fenster voll, verdichtet Claude Code von selbst (Auto-Compact). Besser ist, du entscheidest vorher, was wichtig ist.',
        ],
        en: [
          '`/compact` keeps the essentials as a summary - good when you continue **the same task**.',
          'With instructions you decide what the summary keeps: `/compact focus on the toggle bug and the failing test`.',
          '`/clear` throws everything away - good when **something new** begins. Old conversations stay reachable with `claude -r`.',
          'When the window fills up, Claude Code compacts on its own (auto-compact). It is better when you decide first what matters.',
        ],
      },
    },
    {
      type: 'code',
      language: 'text',
      caption: { de: 'So sieht /compact mit Anweisung aus', en: 'This is /compact with instructions' },
      code: '> /compact focus on the toggle bug\n  Compacting conversation with instructions: "focus on the toggle bug"…\n  ⎿ Compacted. Context: 42.1k → 16.4k tokens',
    },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Faustregel: Neue Aufgabe → `/clear`. Lange Aufgabe, Halbzeit → `/compact` mit Fokus. Mit einem Pro- oder Max-Abo zählen die Plan-Limits in `/usage` mehr als die Dollar-Summe.',
        en: 'Rule of thumb: new task → `/clear`. Long task, half time → `/compact` with a focus. On a Pro or Max plan the plan limits in `/usage` matter more than the dollar figure.',
      },
    },
  ],
  tasks: [
    { id: 'claude-commands-help', text: { de: 'Lass dir alle Befehle anzeigen.', en: 'Show all commands.' }, command: '/help', check: { type: 'command', name: '/help' } },
    {
      id: 'claude-commands-usage',
      text: { de: 'Sieh nach, was die Sitzung bisher gekostet hat (`/cost` geht auch).', en: 'Check what the session has cost so far (`/cost` works too).' },
      command: '/cost',
      check: { type: 'command', name: '/usage' },
    },
    { id: 'claude-commands-compact', text: { de: 'Führe den Compact-Befehl aus.', en: 'Run the compact command.' }, command: '/compact', check: { type: 'compacted' } },
    {
      id: 'claude-commands-compact-focus',
      text: { de: 'Verdichte noch einmal - diesmal mit einer Fokus-Anweisung.', en: 'Compact again - this time with focus instructions.' },
      command: '/compact focus on the toggle bug',
      check: { type: 'compacted', withInstructions: true },
    },
    { id: 'claude-commands-clear', text: { de: 'Beginne ein leeres Gespräch.', en: 'Start an empty conversation.' }, command: '/clear', check: { type: 'command', name: '/clear' } },
    {
      id: 'claude-commands-bug',
      text: { de: 'Öffne den Fehlerbericht (hier wird nichts verschickt).', en: 'Open the bug report (nothing is sent here).' },
      command: '/bug the spinner never stops',
      check: { type: 'command', name: '/bug' },
    },
  ],
  quiz: [
    {
      question: { de: 'Was passiert mit einer Eingabe, die mit `/` beginnt?', en: 'What happens to input that starts with `/`?' },
      answers: {
        de: ['Sie geht als Prompt ans Modell', 'Claude Code führt sie selbst als Befehl aus', 'Sie wird ignoriert', 'Sie startet eine Shell'],
        en: ['It goes to the model as a prompt', 'Claude Code runs it itself as a command', 'It is ignored', 'It starts a shell'],
      },
      correct: 1,
      explanation: {
        de: 'Slash-Commands steuern Claude Code selbst - sofort und ohne Tokens. Alles andere geht als Prompt ans Modell.',
        en: 'Slash commands control Claude Code itself - instantly and without tokens. Everything else goes to the model as a prompt.',
      },
    },
    {
      question: {
        de: 'Du bist mitten in einer langen Fehlersuche, der Kontext ist voll. Was hilft, ohne den Faden zu verlieren?',
        en: 'You are in the middle of a long debugging session and the context is full. What helps without losing the thread?',
      },
      answers: { de: ['/clear', '/compact focus on the failing test', '/exit und neu starten', '/bug'], en: ['/clear', '/compact focus on the failing test', '/exit and start again', '/bug'] },
      correct: 1,
      explanation: {
        de: '`/compact` behält eine Zusammenfassung - mit Fokus-Anweisung genau das, was du noch brauchst. `/clear` würde alles verwerfen.',
        en: '`/compact` keeps a summary - with focus instructions exactly what you still need. `/clear` would throw everything away.',
      },
    },
    {
      question: { de: 'Wann ist `/clear` die bessere Wahl als `/compact`?', en: 'When is `/clear` the better choice than `/compact`?' },
      answers: {
        de: ['Wenn eine neue, unabhängige Aufgabe beginnt', 'Wenn ein Test fehlschlägt', 'Wenn du die Kosten sehen willst', 'Nie - /compact ist immer besser'],
        en: ['When a new, unrelated task begins', 'When a test fails', 'When you want to see the cost', 'Never - /compact is always better'],
      },
      correct: 0,
      explanation: {
        de: 'Alter Kontext einer erledigten Aufgabe lenkt nur ab und kostet Tokens. Für Neues: leeres Gespräch.',
        en: 'Old context of a finished task only distracts and costs tokens. For something new: an empty conversation.',
      },
    },
    {
      question: { de: 'Was zeigt `/cost` heute?', en: 'What does `/cost` show today?' },
      answers: {
        de: ['Die Preise aller Modelle', 'Dasselbe wie `/usage`: Kosten, Dauer, Änderungen und Plan-Limits', 'Nur die Tokens der letzten Antwort', 'Eine Rechnung zum Herunterladen'],
        en: ['The prices of all models', 'The same as `/usage`: cost, duration, changes and plan limits', 'Only the tokens of the last answer', 'An invoice to download'],
      },
      correct: 1,
      explanation: {
        de: '`/cost` ist ein Alias von `/usage`. Mit Abo zählen vor allem die Plan-Limits.',
        en: '`/cost` is an alias of `/usage`. On a subscription the plan limits matter most.',
      },
    },
  ],
  keyPoints: {
    de: [
      'Was mit `/` beginnt, führt Claude Code selbst aus - alles andere ist ein Prompt.',
      '`/help` listet alle Befehle, `/usage` (Alias `/cost`) zeigt Kosten und Limits.',
      'Jede Antwort sieht das ganze Gespräch - ein voller Kontext macht Claude teurer, langsamer und unaufmerksamer.',
      'Gleiche Aufgabe, weiter geht’s: `/compact` mit Fokus. Neue Aufgabe: `/clear`.',
      '`/bug` meldet Probleme mit Claude Code samt Verlauf an Anthropic.',
    ],
    en: [
      'Anything starting with `/` is run by Claude Code itself - everything else is a prompt.',
      '`/help` lists all commands, `/usage` (alias `/cost`) shows cost and limits.',
      'Every answer sees the whole conversation - a full context makes Claude more expensive, slower and less attentive.',
      'Same task, carrying on: `/compact` with a focus. New task: `/clear`.',
      '`/bug` reports problems with Claude Code to Anthropic, including the transcript.',
    ],
  },
}
