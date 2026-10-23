import type { Lesson } from './types'

export const basicsLesson: Lesson = {
  id: 'claude-basics',
  setup: { installed: true, loggedIn: true, inRepl: true },
  blocks: [
    { type: 'heading', text: { de: 'Was ist ein Sprachmodell?', en: 'What is a language model?' } },
    {
      type: 'text',
      text: {
        de: 'Hinter Claude Code steht ein **Sprachmodell** (Large Language Model, LLM). Es wurde mit sehr viel Text und Code trainiert und hat dabei gelernt, wie Text weitergeht. Bekommt es eine Eingabe, sagt es Stück für Stück vorher, was als Nächstes am wahrscheinlichsten passt - so entstehen Antworten, Erklärungen und Code.',
        en: 'Behind Claude Code is a **language model** (large language model, LLM). It was trained on a huge amount of text and code and learned how text continues. Given an input, it predicts piece by piece what fits best next - that is how answers, explanations and code come about.',
      },
    },
    {
      type: 'text',
      text: {
        de: 'Das Training endet an einem Stichtag, dem **Knowledge Cutoff**. Was danach erschienen ist - eine neue Bibliotheksversion, ein geändertes API -, kennt das Modell nicht aus dem Gedächtnis. Es kann es aber nachlesen: in deinen Dateien, in der Dokumentation oder im Web.',
        en: 'Training ends at a cut-off date, the **knowledge cutoff**. Whatever appeared later - a new library version, a changed API - the model does not know from memory. But it can look it up: in your files, in the documentation or on the web.',
      },
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: 'Ein Sprachmodell „weiß“ nichts wie eine Datenbank. Es erzeugt wahrscheinliche Fortsetzungen. Meist ist das richtig - aber nicht immer. Deshalb ist Prüfen fester Teil der Arbeit mit Claude.',
        en: 'A language model does not "know" things like a database. It produces likely continuations. Usually they are right - but not always. That is why checking is a fixed part of working with Claude.',
      },
    },
    { type: 'heading', text: { de: 'Tokens: die Einheit von allem', en: 'Tokens: the unit of everything' } },
    {
      type: 'text',
      text: {
        de: 'Ein Modell liest und schreibt keine Buchstaben, sondern **Tokens**: Stücke von Text - oft ein Wortteil, manchmal ein ganzes Wort oder ein Satzzeichen. Wie ein Text zerlegt wird, hängt vom Text ab; Code mit vielen Sonderzeichen ergibt oft mehr Tokens als Fließtext.',
        en: 'A model does not read and write letters but **tokens**: pieces of text - often part of a word, sometimes a whole word or a punctuation mark. How a text is split depends on the text; code with many special characters often yields more tokens than prose.',
      },
    },
    {
      type: 'list',
      items: {
        de: [
          'Das **Kontextfenster** wird in Tokens gemessen.',
          'Mit API-Konto zahlst du **pro Token** - für das, was Claude liest, und das, was es schreibt.',
          'Mit Abo zählen die **Nutzungslimits** deines Plans, ebenfalls auf Basis von Tokens.',
          '`/context` und `/usage` zeigen dir, wo du gerade stehst.',
        ],
        en: [
          'The **context window** is measured in tokens.',
          'With an API account you pay **per token** - for what Claude reads and what it writes.',
          'On a subscription the **usage limits** of your plan count, also based on tokens.',
          '`/context` and `/usage` show you where you stand right now.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Das Kontextfenster: alles, was Claude sieht', en: 'The context window: everything Claude sees' } },
    {
      type: 'text',
      text: {
        de: 'Für jede Antwort bekommt das Modell einen großen Block Text: Systemanweisungen, Werkzeugbeschreibungen, deine CLAUDE.md, das ganze bisherige Gespräch, jede gelesene Datei und jede Befehlsausgabe. Das ist das **Kontextfenster**. Bei den aktuellen Modellen fasst es standardmäßig **1 Million Tokens**.',
        en: 'For every answer the model gets one big block of text: system instructions, tool descriptions, your CLAUDE.md, the whole conversation so far, every file read and every command output. That is the **context window**. On current models it holds **1 million tokens** by default.',
      },
    },
    {
      type: 'table',
      head: { de: ['Im Kontext', 'Wann', 'Beispiel'], en: ['In the context', 'When', 'Example'] },
      rows: {
        de: [
          ['Systemanweisungen und Werkzeuge', 'immer, ab dem Start', 'wie Read oder Bash funktionieren'],
          ['CLAUDE.md und Skill-Beschreibungen', 'immer, ab dem Start', 'eure Befehle und Konventionen'],
          ['Das Gespräch', 'wächst mit jeder Nachricht', 'deine Prompts, Claudes Antworten'],
          ['Gelesene Dateien und Ausgaben', 'sobald ein Werkzeug läuft', '`src/App.tsx`, die Ausgabe von `npm test`'],
        ],
        en: [
          ['System instructions and tools', 'always, from the start', 'how Read or Bash work'],
          ['CLAUDE.md and skill descriptions', 'always, from the start', 'your commands and conventions'],
          ['The conversation', 'grows with every message', 'your prompts, Claude’s answers'],
          ['Files read and outputs', 'as soon as a tool runs', '`src/App.tsx`, the output of `npm test`'],
        ],
      },
    },
    {
      type: 'note',
      tone: 'warning',
      text: {
        de: 'Was nicht im Kontext steht, weiß Claude nicht. Eine neue Sitzung beginnt **ohne Erinnerung** an die letzte - geladen wird nur, was in Dateien steht, etwa die CLAUDE.md. Läuft das Fenster voll, verdichtet Claude Code das Gespräch automatisch ([[claude-commands]]).',
        en: 'What is not in the context, Claude does not know. A new session starts **without memory** of the last one - only what is in files gets loaded, such as CLAUDE.md. When the window fills up, Claude Code compacts the conversation automatically ([[claude-commands]]).',
      },
    },
    { type: 'heading', text: { de: 'Modelle und Aliase', en: 'Models and aliases' } },
    {
      type: 'text',
      text: {
        de: 'Claude gibt es in mehreren Größen. Größere Modelle denken gründlicher, kleinere antworten schneller und günstiger. In Claude Code wählst du sie über kurze **Aliase** - mit `/model` in der Sitzung oder `--model` beim Start. Standard bei Pro, Max, Team, Enterprise und API ist Opus.',
        en: 'Claude comes in several sizes. Larger models think more thoroughly, smaller ones answer faster and cheaper. In Claude Code you pick them by short **aliases** - with `/model` in the session or `--model` at start. The default on Pro, Max, Team, Enterprise and API is Opus.',
      },
    },
    {
      type: 'table',
      head: { de: ['Alias', 'Stärke', 'Gut für'], en: ['Alias', 'Strength', 'Good for'] },
      rows: {
        de: [
          ['`opus`', 'gründlichstes Denken', 'schwierige Fehler, Architektur, große Umbauten'],
          ['`sonnet`', 'ausgewogen', 'alltägliche Programmieraufgaben'],
          ['`haiku`', 'schnell und günstig', 'kleine, klare Aufgaben'],
          ['`fable`', 'eigene Modellfamilie', 'zur Auswahl, wenn `/model` sie anbietet'],
          ['`opusplan`', 'Opus im Plan-Modus, danach Sonnet', 'gründlich planen, zügig umsetzen'],
        ],
        en: [
          ['`opus`', 'most thorough thinking', 'hard bugs, architecture, big refactorings'],
          ['`sonnet`', 'balanced', 'everyday programming tasks'],
          ['`haiku`', 'fast and cheap', 'small, clear tasks'],
          ['`fable`', 'a model family of its own', 'an option when `/model` offers it'],
          ['`opusplan`', 'Opus in plan mode, then Sonnet', 'plan thoroughly, implement quickly'],
        ],
      },
    },
    {
      type: 'code',
      language: 'bash',
      code: '/model              # show the current model and the aliases\n/model haiku        # switch (and save as default)\nclaude --model opus # pick the model at start',
    },
    { type: 'heading', text: { de: 'Denken und Aufwand', en: 'Thinking and effort' } },
    {
      type: 'text',
      text: {
        de: 'Moderne Modelle können vor der Antwort „nachdenken“ (Extended Thinking): Sie arbeiten das Problem erst intern durch. Bei den aktuellen 5.5-Modellen ist das immer an. Wie gründlich, steuerst du mit dem **Aufwand** (`/effort`: low, medium, high, xhigh, max). Für eine einzelne besonders knifflige Anfrage schreibst du `ultrathink` in den Prompt.',
        en: 'Modern models can "think" before answering (extended thinking): they work through the problem internally first. On the current 5.5 models it is always on. How thoroughly is set by the **effort** (`/effort`: low, medium, high, xhigh, max). For a single, particularly tricky request, write `ultrathink` in the prompt.',
      },
    },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Denken kostet Tokens - auch wenn du es nicht siehst. Hoher Aufwand lohnt sich für schwere Probleme, nicht für „benenne diese Variable um“. Formulierungen wie „think hard“ sind übrigens keine Schlüsselwörter.',
        en: 'Thinking costs tokens - even when you do not see it. High effort pays off for hard problems, not for "rename this variable". Phrases like "think hard" are not keywords, by the way.',
      },
    },
    { type: 'heading', text: { de: 'Halluzinationen und Prüfen', en: 'Hallucinations and checking' } },
    {
      type: 'text',
      text: {
        de: 'Weil ein Modell wahrscheinliche Fortsetzungen erzeugt, kann es etwas sagen, das plausibel klingt und trotzdem falsch ist: eine Funktion, die es nicht gibt, eine Option, die anders heißt. Das nennt man **Halluzination**. Das Gegenmittel ist nicht Misstrauen, sondern **Prüfen**: Claude soll nachlesen statt raten, und am Ende beweisen Tests, Build oder ein Blick in die App, dass es stimmt.',
        en: 'Because a model produces likely continuations, it can say something that sounds plausible and is still wrong: a function that does not exist, an option with a different name. That is called a **hallucination**. The remedy is not distrust but **checking**: Claude should look things up instead of guessing, and in the end tests, the build or a look at the app prove it is right.',
      },
    },
    { type: 'heading', text: { de: 'Vom Chat zum Agenten', en: 'From chat to agent' } },
    {
      type: 'text',
      text: {
        de: 'Ein Chat beantwortet Fragen aus dem, was im Gespräch steht. Ein **Agent** ist dasselbe Modell plus **Werkzeuge** plus eine **Schleife**: Es darf Dateien lesen, Befehle ausführen und Code ändern, sieht jedes Ergebnis und entscheidet über den nächsten Schritt. Genau das ist Claude Code.',
        en: 'A chat answers questions from what is in the conversation. An **agent** is the same model plus **tools** plus a **loop**: it may read files, run commands and change code, sees every result and decides on the next step. That is exactly what Claude Code is.',
      },
    },
    {
      type: 'table',
      head: { de: ['', 'Chat', 'Agent (Claude Code)'], en: ['', 'Chat', 'Agent (Claude Code)'] },
      rows: {
        de: [
          ['Kennt dein Projekt', 'nur, was du hineinkopierst', 'liest selbst nach'],
          ['Führt Code aus', 'nein', 'ja, mit deiner Erlaubnis'],
          ['Prüft sein Ergebnis', 'nein', 'ja, z. B. mit Tests'],
          ['Deine Rolle', 'Fragen stellen, Antworten übertragen', 'Aufträge geben, Schritte freigeben, Ergebnis prüfen'],
        ],
        en: [
          ['Knows your project', 'only what you paste in', 'looks it up itself'],
          ['Runs code', 'no', 'yes, with your permission'],
          ['Checks its result', 'no', 'yes, e.g. with tests'],
          ['Your role', 'ask questions, copy answers over', 'give tasks, approve steps, check the result'],
        ],
      },
    },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Probier es rechts aus: Frag Claude selbst, was ein Token oder das Kontextfenster ist - und sieh mit `/context`, wie voll es gerade ist.',
        en: 'Try it on the right: ask Claude itself what a token or the context window is - and check with `/context` how full it is right now.',
      },
    },
  ],
  tasks: [
    {
      id: 'claude-basics-tokens',
      text: { de: 'Frag Claude, was ein Token ist.', en: 'Ask Claude what a token is.' },
      command: 'What is a token?',
      check: { type: 'conceptExplained', topic: 'tokens' },
    },
    {
      id: 'claude-basics-window',
      text: { de: 'Frag Claude, was das Kontextfenster ist.', en: 'Ask Claude what the context window is.' },
      command: 'What is the context window?',
      check: { type: 'conceptExplained', topic: 'context' },
    },
    { id: 'claude-basics-context', text: { de: 'Sieh dir an, wie voll der Kontext gerade ist.', en: 'See how full the context is right now.' }, command: '/context', check: { type: 'command', name: '/context' } },
    { id: 'claude-basics-model', text: { de: 'Lass dir das aktuelle Modell und die Aliase zeigen.', en: 'Show the current model and the aliases.' }, command: '/model', check: { type: 'command', name: '/model' } },
    {
      id: 'claude-basics-switch',
      text: { de: 'Wechsle auf das schnelle, günstige Modell `haiku`.', en: 'Switch to the fast, cheap model `haiku`.' },
      command: '/model haiku',
      check: { type: 'modelChanged', model: 'haiku' },
    },
    {
      id: 'claude-basics-hallucination',
      text: { de: 'Frag Claude, was Halluzinationen sind und was dagegen hilft.', en: 'Ask Claude what hallucinations are and what helps against them.' },
      command: 'What are hallucinations?',
      check: { type: 'conceptExplained', topic: 'hallucination' },
    },
  ],
  quiz: [
    {
      question: { de: 'Was ist ein Token?', en: 'What is a token?' },
      answers: {
        de: ['Ein Passwort für die API', 'Ein Stück Text, in dem das Modell liest und schreibt', 'Eine Zeile Code', 'Ein Werkzeug von Claude Code'],
        en: ['A password for the API', 'A piece of text the model reads and writes in', 'A line of code', 'A Claude Code tool'],
      },
      correct: 1,
      explanation: {
        de: 'Tokens sind Textstücke - oft Wortteile. Kontextfenster, Limits und Kosten werden in Tokens gemessen.',
        en: 'Tokens are pieces of text - often parts of words. Context window, limits and cost are measured in tokens.',
      },
    },
    {
      question: { de: 'Claude kennt eine Bibliotheksversion nicht, die nach seinem Training erschien. Was hilft?', en: 'Claude does not know a library version released after its training. What helps?' },
      answers: {
        de: ['Nichts - das Modell kann das nicht', 'Es die Doku oder die Dateien nachlesen lassen', 'Den Prompt wiederholen', 'Ein größeres Kontextfenster einstellen'],
        en: ['Nothing - the model cannot do that', 'Let it read the docs or the files', 'Repeat the prompt', 'Set a larger context window'],
      },
      correct: 1,
      explanation: {
        de: 'Nach dem Knowledge Cutoff fehlt das Wissen im Gedächtnis - aber als Agent kann Claude es nachlesen.',
        en: 'After the knowledge cutoff the knowledge is missing from memory - but as an agent Claude can look it up.',
      },
    },
    {
      question: { de: 'Was weiß Claude zu Beginn einer neuen Sitzung von der letzten?', en: 'What does Claude know from the last session when a new one starts?' },
      answers: {
        de: ['Alles, was besprochen wurde', 'Nur, was in geladenen Dateien wie CLAUDE.md steht', 'Die letzten zehn Nachrichten', 'Alles, solange der Rechner nicht neu startet'],
        en: ['Everything that was discussed', 'Only what is in loaded files such as CLAUDE.md', 'The last ten messages', 'Everything, as long as the computer does not restart'],
      },
      correct: 1,
      explanation: {
        de: 'Jede Sitzung beginnt mit einem frischen Kontext. Dauerhaftes Wissen gehört in Dateien, die geladen werden.',
        en: 'Every session starts with a fresh context. Lasting knowledge belongs in files that get loaded.',
      },
    },
    {
      question: { de: 'Was schützt am besten vor Halluzinationen im Code?', en: 'What protects best against hallucinations in code?' },
      answers: {
        de: ['Höflich fragen', 'Das Ergebnis prüfen - mit Tests, Build oder einem Blick in die App', 'Immer das größte Modell nehmen', 'Kürzere Prompts'],
        en: ['Asking politely', 'Checking the result - with tests, the build or a look at the app', 'Always using the largest model', 'Shorter prompts'],
      },
      correct: 1,
      explanation: {
        de: 'Auch das beste Modell kann irren. Was ein Test beweist, muss man nicht glauben.',
        en: 'Even the best model can be wrong. What a test proves does not need to be believed.',
      },
    },
    {
      question: { de: 'Was macht aus einem Sprachmodell einen Agenten?', en: 'What turns a language model into an agent?' },
      answers: {
        de: ['Ein größeres Training', 'Werkzeuge und eine Schleife aus Handeln und Prüfen', 'Ein eigenes Terminal-Fenster', 'Eine längere Antwort'],
        en: ['Bigger training', 'Tools and a loop of acting and checking', 'A terminal window of its own', 'A longer answer'],
      },
      correct: 1,
      explanation: {
        de: 'Modell + Werkzeuge + Schleife: Claude handelt, sieht das Ergebnis und entscheidet über den nächsten Schritt.',
        en: 'Model + tools + loop: Claude acts, sees the result and decides on the next step.',
      },
    },
  ],
  keyPoints: {
    de: [
      'Ein Sprachmodell sagt wahrscheinliche Fortsetzungen vorher; sein Wissen endet am Knowledge Cutoff - Neueres muss es nachlesen.',
      'Tokens sind die Einheit von allem: Kontextfenster, Kosten und Limits werden in Tokens gemessen.',
      'Das Kontextfenster (aktuell standardmäßig 1 Mio. Tokens) ist alles, was Claude sieht - eine neue Sitzung beginnt ohne Erinnerung.',
      'Modelle wählst du mit `/model` (opus, sonnet, haiku, fable, opusplan), die Gründlichkeit mit `/effort` oder `ultrathink`.',
      'Halluzinationen gibt es - deshalb prüfen: Ein Agent ist Modell + Werkzeuge + Schleife und kann sein Ergebnis selbst testen.',
    ],
    en: [
      'A language model predicts likely continuations; its knowledge ends at the knowledge cutoff - newer things it has to look up.',
      'Tokens are the unit of everything: context window, cost and limits are measured in tokens.',
      'The context window (currently 1M tokens by default) is everything Claude sees - a new session starts without memory.',
      'Pick models with `/model` (opus, sonnet, haiku, fable, opusplan), thoroughness with `/effort` or `ultrathink`.',
      'Hallucinations happen - so check: an agent is model + tools + loop and can test its own result.',
    ],
  },
}
