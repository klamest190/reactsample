import type { Lesson } from './types'

export const promptingLesson: Lesson = {
  id: 'claude-prompting',
  setup: { installed: true, loggedIn: true, inRepl: true, withMemory: true },
  blocks: [
    { type: 'heading', text: { de: 'Der Auftrag entscheidet', en: 'The task decides' } },
    {
      type: 'text',
      text: {
        de: 'Claude sieht nur, was im Kontext steht. Was du im Kopf hast - welche Datei gemeint ist, was „besser“ heißt, wann die Aufgabe fertig ist -, muss in den Prompt. Ein guter Auftrag spart Suchschritte, Rückfragen und Korrekturen. Ein vager Auftrag führt zu Raten.',
        en: 'Claude only sees what is in the context. What you have in mind - which file is meant, what "better" means, when the task is done - has to go into the prompt. A good task saves search steps, questions and corrections. A vague task leads to guessing.',
      },
    },
    {
      type: 'note',
      tone: 'remember',
      text: {
        de: 'Stell dir vor, du gibst die Aufgabe einer neuen Kollegin, die das Projekt nicht kennt. Was müsstest du ihr sagen? Genau das gehört in den Prompt.',
        en: 'Imagine handing the task to a new colleague who does not know the project. What would you have to tell them? Exactly that belongs in the prompt.',
      },
    },
    { type: 'heading', text: { de: 'Konkret statt vage', en: 'Specific, not vague' } },
    {
      type: 'list',
      items: {
        de: [
          '**Wo?** Datei, Komponente oder Funktion nennen - am besten mit `@pfad`.',
          '**Was ist falsch?** Das Symptom beschreiben: Fehlermeldung, falsches Verhalten, Schritte zum Nachstellen.',
          '**Was soll gelten?** Einschränkungen: „ändere den Test nicht“, „keine neue Bibliothek“, „wie in `TodoList.tsx`“.',
          '**Woran erkennst du Erfolg?** Ein Test, der grün wird, ein Build ohne Fehler, ein bestimmtes Verhalten in der App.',
        ],
        en: [
          '**Where?** Name the file, component or function - ideally with `@path`.',
          '**What is wrong?** Describe the symptom: error message, wrong behaviour, steps to reproduce.',
          '**What must hold?** Constraints: "do not change the test", "no new library", "like in `TodoList.tsx`".',
          '**How do you know it worked?** A test that turns green, a build without errors, a certain behaviour in the app.',
        ],
      },
    },
    {
      type: 'table',
      head: { de: ['Vage', 'Konkret'], en: ['Vague', 'Specific'] },
      rows: {
        de: [
          ['„Mach es besser.“', '„In `@src/components/TodoList.tsx` sind die Einträge per Tastatur nicht bedienbar. Mach daraus Buttons, ohne das Aussehen zu ändern.“'],
          ['„Irgendwas ist kaputt.“', '„Der Test in `useTodos.test.ts` schlägt fehl: Toggle ändert alle Todos. Behebe den Fehler in `useTodos.ts`, nicht im Test.“'],
          ['„Schreib Tests.“', '„Schreib Vitest-Tests für `add` in `src/hooks/useTodos.ts` - leere Eingabe, zwei Einträge, Reihenfolge. Lass sie danach laufen.“'],
        ],
        en: [
          ['"Make it better."', '"In `@src/components/TodoList.tsx` the items cannot be used with a keyboard. Turn them into buttons without changing the look."'],
          ['"Something is broken."', '"The test in `useTodos.test.ts` fails: toggle changes every todo. Fix the bug in `useTodos.ts`, not in the test."'],
          ['"Write tests."', '"Write Vitest tests for `add` in `src/hooks/useTodos.ts` - empty input, two entries, order. Run them afterwards."'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Kontext mitgeben', en: 'Giving context' } },
    {
      type: 'list',
      items: {
        de: [
          '`@datei` holt eine Datei direkt in den Kontext ([[claude-context]]).',
          'Fehlermeldungen und Logs einfügen - oder hineinleiten: `cat error.log | claude -p "what went wrong?"`.',
          'Screenshots und Bilder per Einfügen oder Drag & Drop ins Eingabefeld - hilfreich bei Layoutfehlern.',
          'Auf bestehende Muster zeigen: „mach es wie in `TodoList.tsx`“ - Claude übernimmt dann euren Stil.',
        ],
        en: [
          '`@file` brings a file straight into the context ([[claude-context]]).',
          'Paste error messages and logs - or pipe them in: `cat error.log | claude -p "what went wrong?"`.',
          'Paste or drag screenshots and images into the input - helpful for layout bugs.',
          'Point to existing patterns: "do it like in `TodoList.tsx`" - Claude then follows your style.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Erkunden, planen, umsetzen, committen', en: 'Explore, plan, code, commit' } },
    {
      type: 'text',
      text: {
        de: 'Für alles, was größer ist als eine Zeile, hat sich ein Ablauf in vier Schritten bewährt. Der wichtigste Trick: **erst planen, dann ändern**. Im **Plan-Modus** (Shift+Tab, bis „plan mode on“ erscheint) liest Claude nur und legt einen Plan vor. Mit Strg+G öffnest du den Plan im Editor und passt ihn an. Erst wenn er stimmt, verlässt du den Plan-Modus und lässt umsetzen.',
        en: 'For anything bigger than one line, a four-step routine has proven itself. The key trick: **plan first, then change**. In **plan mode** (Shift+Tab until "plan mode on" appears) Claude only reads and presents a plan. Ctrl+G opens the plan in your editor to adjust it. Only once it is right do you leave plan mode and let Claude carry it out.',
      },
    },
    {
      type: 'table',
      head: { de: ['Schritt', 'Du sagst', 'Claude tut'], en: ['Step', 'You say', 'Claude does'] },
      rows: {
        de: [
          ['1. Erkunden', '„Lies `useTodos.ts` und die Tests, ändere noch nichts.“', 'liest und fasst zusammen'],
          ['2. Planen', 'Plan-Modus: „Wie würdest du den Toggle-Fehler beheben?“', 'schlägt Schritte vor'],
          ['3. Umsetzen', 'Plan-Modus verlassen, „mach weiter“', 'ändert Code, lässt Tests laufen'],
          ['4. Committen', '„Committe mit einer passenden Nachricht.“', 'schreibt den Commit'],
        ],
        en: [
          ['1. Explore', '"Read `useTodos.ts` and the tests, do not change anything yet."', 'reads and summarizes'],
          ['2. Plan', 'plan mode: "How would you fix the toggle bug?"', 'proposes steps'],
          ['3. Code', 'leave plan mode, "go ahead"', 'changes code, runs tests'],
          ['4. Commit', '"Commit with a fitting message."', 'writes the commit'],
        ],
      },
    },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Planen lohnt sich nicht immer: Lässt sich die Änderung in einem Satz beschreiben („benenne `add` in `addTodo` um“), mach es direkt.',
        en: 'Planning does not always pay off: if the change fits in one sentence ("rename `add` to `addTodo`"), just do it.',
      },
    },
    { type: 'heading', text: { de: 'Claude prüfen lassen', en: 'Let Claude check its work' } },
    {
      type: 'text',
      text: {
        de: 'Der größte Hebel für gute Ergebnisse: Gib Claude etwas, woran es sich selbst messen kann - einen Test, einen Build, einen Screenshot zum Vergleich. Dann merkt Claude Fehler selbst, statt dass du sie findest. Der gebündelte Skill `/verify` lässt Claude seine Änderungen gezielt überprüfen.',
        en: 'The biggest lever for good results: give Claude something to measure itself against - a test, a build, a screenshot to compare. Then Claude notices mistakes itself instead of you finding them. The bundled skill `/verify` lets Claude check its changes on purpose.',
      },
    },
    {
      type: 'code',
      language: 'text',
      caption: { de: 'Ein Auftrag mit Erfolgskriterium', en: 'A task with a success criterion' },
      code: '> Fix the toggle bug in @src/hooks/useTodos.ts.\n  Do not change the test. Done means: npm test passes.',
    },
    { type: 'heading', text: { de: 'Früh korrigieren', en: 'Correcting early' } },
    {
      type: 'list',
      items: {
        de: [
          '`Esc` unterbricht Claude sofort - der Kontext bleibt, du kannst umlenken.',
          '`Esc Esc` bei leerer Eingabe oder `/rewind` springt zu einem früheren Punkt zurück, auf Wunsch samt Code.',
          '„Mach das rückgängig“ reicht oft schon für den letzten Schritt.',
          'Nach zwei erfolglosen Korrekturen: `/clear` und den Auftrag mit dem Gelernten neu formulieren. Ein frischer Start schlägt eine lange Fehlerkette.',
        ],
        en: [
          '`Esc` stops Claude at once - the context stays, you can steer elsewhere.',
          '`Esc Esc` on an empty input or `/rewind` jumps back to an earlier point, including the code if you want.',
          '"Undo that" is often enough for the last step.',
          'After two failed corrections: `/clear` and rewrite the task with what you learned. A fresh start beats a long chain of errors.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Typische Fehlmuster', en: 'Common failure patterns' } },
    {
      type: 'table',
      head: { de: ['Muster', 'Was passiert', 'Besser'], en: ['Pattern', 'What happens', 'Better'] },
      rows: {
        de: [
          ['Alles in einer Sitzung', 'der Kontext füllt sich mit Altem', '`/clear` zwischen unabhängigen Aufgaben'],
          ['Immer wieder korrigieren', 'fehlgeschlagene Versuche verwirren', 'nach zwei Versuchen neu anfangen'],
          ['Überladene CLAUDE.md', 'wichtige Regeln gehen unter', 'kurz halten, jede Zeile prüfen'],
          ['Vertrauen ohne Prüfen', 'Fehler fallen erst später auf', 'Tests und Build als Erfolgskriterium'],
          ['Endloses Erkunden', 'Claude liest und liest', 'Umfang begrenzen oder einen Subagent suchen lassen'],
        ],
        en: [
          ['Kitchen-sink session', 'the context fills up with old stuff', '`/clear` between unrelated tasks'],
          ['Correcting over and over', 'failed attempts confuse', 'start fresh after two attempts'],
          ['Over-specified CLAUDE.md', 'important rules get lost', 'keep it short, check every line'],
          ['Trust without checking', 'mistakes surface later', 'tests and build as success criteria'],
          ['Infinite exploration', 'Claude reads and reads', 'limit the scope or let a subagent search'],
        ],
      },
    },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Für wichtige Änderungen lohnt das **Schreiber-Prüfer-Muster**: Eine Sitzung schreibt den Code, eine zweite, frische Sitzung reviewt ihn - ohne die Annahmen der ersten zu kennen.',
        en: 'For important changes the **writer/reviewer pattern** pays off: one session writes the code, a second, fresh session reviews it - without knowing the assumptions of the first.',
      },
    },
  ],
  tasks: [
    {
      id: 'claude-prompting-vague',
      text: { de: 'Gib Claude einen vagen Auftrag wie `make it better` und sieh, was passiert.', en: 'Give Claude a vague task like `make it better` and see what happens.' },
      command: 'make it better',
      check: { type: 'clarified' },
    },
    {
      id: 'claude-prompting-specific',
      text: { de: 'Stell einen konkreten Auftrag, der eine Datei mit `@` nennt.', en: 'Give a specific task that names a file with `@`.' },
      command: 'Explain what toggle does in @src/hooks/useTodos.ts, step by step',
      check: { type: 'prompted', specific: true },
    },
    { id: 'claude-prompting-plan-mode', text: { de: 'Wechsle mit Shift+Tab in den Plan-Modus.', en: 'Switch to plan mode with Shift+Tab.' }, check: { type: 'modeChanged', mode: 'plan' } },
    {
      id: 'claude-prompting-plan',
      text: { de: 'Lass Claude im Plan-Modus planen, wie es den Fehler behebt.', en: 'Let Claude plan in plan mode how to fix the bug.' },
      command: 'Run the tests and fix the bug',
      check: { type: 'planned' },
    },
    {
      id: 'claude-prompting-execute',
      text: { de: 'Verlasse den Plan-Modus (Shift+Tab) und lass den Plan umsetzen.', en: 'Leave plan mode (Shift+Tab) and let Claude carry out the plan.' },
      command: 'go ahead',
      check: { type: 'planExecuted' },
    },
    { id: 'claude-prompting-clear', text: { de: 'Aufgabe erledigt - beginne ein frisches Gespräch.', en: 'Task done - start a fresh conversation.' }, command: '/clear', check: { type: 'command', name: '/clear' } },
  ],
  quiz: [
    {
      question: { de: 'Welcher Prompt führt am ehesten zum Ziel?', en: 'Which prompt is most likely to succeed?' },
      answers: {
        de: [
          '„Fix den Bug.“',
          '„Der Test in useTodos.test.ts schlägt fehl - behebe den Fehler in @src/hooks/useTodos.ts, ändere den Test nicht.“',
          '„Mach alles besser.“',
          '„Kannst du mal schauen?“',
        ],
        en: [
          '"Fix the bug."',
          '"The test in useTodos.test.ts fails - fix the bug in @src/hooks/useTodos.ts, do not change the test."',
          '"Make everything better."',
          '"Can you take a look?"',
        ],
      },
      correct: 1,
      explanation: {
        de: 'Ort, Symptom, Einschränkung und Erfolgskriterium - Claude muss nichts raten.',
        en: 'Location, symptom, constraint and success criterion - Claude has nothing to guess.',
      },
    },
    {
      question: { de: 'Wozu dient der Plan-Modus?', en: 'What is plan mode for?' },
      answers: {
        de: ['Claude arbeitet schneller', 'Claude liest und plant nur - du prüfst den Plan, bevor etwas geändert wird', 'Claude darf ohne Rückfrage alles ändern', 'Er ersetzt die Tests'],
        en: ['Claude works faster', 'Claude only reads and plans - you check the plan before anything changes', 'Claude may change everything without asking', 'It replaces the tests'],
      },
      correct: 1,
      explanation: {
        de: 'Fehler im Plan sind billig zu korrigieren, Fehler im Code teurer. Mit Strg+G kannst du den Plan selbst bearbeiten.',
        en: 'Mistakes in a plan are cheap to fix, mistakes in code are costly. Ctrl+G lets you edit the plan yourself.',
      },
    },
    {
      question: { de: 'Du hast Claude zweimal korrigiert, und es läuft immer noch in die falsche Richtung. Was jetzt?', en: 'You corrected Claude twice and it still goes the wrong way. What now?' },
      answers: {
        de: ['Ein drittes und viertes Mal korrigieren', '`/clear` und den Auftrag mit dem Gelernten neu formulieren', 'Das Modell wechseln und weitermachen', 'Den Rechner neu starten'],
        en: ['Correct a third and fourth time', '`/clear` and rewrite the task with what you learned', 'Switch the model and carry on', 'Restart the computer'],
      },
      correct: 1,
      explanation: {
        de: 'Fehlversuche bleiben im Kontext und lenken ab. Ein frischer, besserer Auftrag ist meist schneller.',
        en: 'Failed attempts stay in the context and distract. A fresh, better task is usually faster.',
      },
    },
    {
      question: { de: 'Was ist der größte Hebel für verlässliche Ergebnisse?', en: 'What is the biggest lever for reliable results?' },
      answers: {
        de: ['Lange, höfliche Prompts', 'Claude ein Erfolgskriterium geben, das es selbst prüfen kann - Test, Build, Screenshot', 'Immer im Plan-Modus bleiben', 'Möglichst viele Dateien mit @ erwähnen'],
        en: ['Long, polite prompts', 'Giving Claude a success criterion it can check itself - test, build, screenshot', 'Always staying in plan mode', 'Mentioning as many files as possible with @'],
      },
      correct: 1,
      explanation: {
        de: 'Kann Claude sein Ergebnis messen, findet es Fehler selbst - du musst weniger nacharbeiten.',
        en: 'When Claude can measure its result, it finds mistakes itself - you have less to rework.',
      },
    },
  ],
  keyPoints: {
    de: [
      'Claude sieht nur den Kontext: Ort, Symptom, Einschränkungen und Erfolgskriterium gehören in den Prompt.',
      'Kontext mitgeben mit `@datei`, eingefügten Fehlern und Logs, Screenshots und Verweisen auf bestehende Muster.',
      'Größere Aufgaben: erkunden, im Plan-Modus planen, umsetzen, committen - kleine direkt erledigen.',
      'Ein prüfbares Ziel (Test, Build, Screenshot) lässt Claude seine Fehler selbst finden.',
      'Früh korrigieren mit `Esc` und `/rewind`; nach zwei Fehlversuchen `/clear` und neu formulieren.',
    ],
    en: [
      'Claude only sees the context: location, symptom, constraints and success criterion belong in the prompt.',
      'Give context with `@file`, pasted errors and logs, screenshots and pointers to existing patterns.',
      'Bigger tasks: explore, plan in plan mode, code, commit - do small ones directly.',
      'A checkable goal (test, build, screenshot) lets Claude find its own mistakes.',
      'Correct early with `Esc` and `/rewind`; after two failed attempts, `/clear` and rewrite.',
    ],
  },
}
