import type { Lesson } from './types'

export const projectLesson: Lesson = {
  id: 'claude-project',
  setup: { installed: true, loggedIn: true, inRepl: true, withMemory: true },
  blocks: [
    { type: 'heading', text: { de: 'Ein Feature von Anfang bis Ende', en: 'A feature from start to finish' } },
    {
      type: 'text',
      text: {
        de: 'In den bisherigen Lektionen hast du jedes Werkzeug einzeln kennengelernt. Hier kommt alles zusammen: Die Todo-App soll einen **Filter** bekommen (alle, offen, erledigt). Du arbeitest so, wie es die Claude-Code-Doku als bewährten Ablauf empfiehlt: **erkunden, planen, umsetzen, committen** - und dazwischen prüfen.',
        en: 'In the previous lessons you met every tool on its own. Here everything comes together: the todo app gets a **filter** (all, open, done). You work the way the Claude Code docs recommend as a proven workflow: **explore, plan, implement, commit** - and check in between.',
      },
    },
    {
      type: 'table',
      head: { de: ['Schritt', 'Was du tust', 'Werkzeug'], en: ['Step', 'What you do', 'Tool'] },
      rows: {
        de: [
          ['1. Erkunden', 'Claude das Projekt lesen und erklären lassen', 'Prompt, `@datei`'],
          ['2. Grün starten', 'erst den alten Fehler beheben, damit Tests wieder etwas aussagen', 'Agentic Loop'],
          ['3. Branch', 'einen Branch anlegen, main bleibt sauber', 'git'],
          ['4. Planen', 'im Plan-Modus einen Plan erstellen lassen und prüfen', 'Shift+Tab'],
          ['5. Umsetzen', 'den Plan freigeben, jeden Diff lesen', '„go ahead“, Erlaubnisdialog'],
          ['6. Prüfen', 'Tests laufen lassen, Ergebnis ansehen', '`npm test`'],
          ['7. Abschließen', 'committen, Pull Request öffnen', 'git, `gh`'],
          ['8. Festhalten', 'Gelerntes in CLAUDE.md oder einen Skill schreiben', '`/memory`, Skill'],
        ],
        en: [
          ['1. Explore', 'let Claude read and explain the project', 'prompt, `@file`'],
          ['2. Start green', 'fix the old bug first so the tests mean something again', 'agentic loop'],
          ['3. Branch', 'create a branch, main stays clean', 'git'],
          ['4. Plan', 'let Claude write a plan in plan mode and check it', 'Shift+Tab'],
          ['5. Implement', 'approve the plan, read every diff', '"go ahead", permission dialog'],
          ['6. Verify', 'run the tests, look at the result', '`npm test`'],
          ['7. Wrap up', 'commit, open a pull request', 'git, `gh`'],
          ['8. Capture', 'write what you learned into CLAUDE.md or a skill', '`/memory`, skill'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Erkunden und grün starten', en: 'Explore and start green' } },
    {
      type: 'text',
      text: {
        de: 'Bevor du etwas Neues baust, sieh dir an, was da ist. Ein Prompt wie „Erkläre dieses Projekt“ lässt Claude die wichtigen Dateien lesen. Dabei fällt auf: `toggle` schaltet alle Todos um, ein Test ist rot. Wer auf roten Tests weiterbaut, weiß später nicht, ob ein neuer Fehler vom Feature kommt - also erst reparieren.',
        en: 'Before you build something new, look at what is there. A prompt like "Explain this project" lets Claude read the important files. It turns out: `toggle` flips every todo, one test is red. If you build on red tests, you will not know later whether a new failure comes from the feature - so fix it first.',
      },
    },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Gib Claude immer etwas, woran es seine Arbeit selbst prüfen kann: einen Test, einen Build, eine erwartete Ausgabe. Das ist laut Doku der wirksamste Hebel für gute Ergebnisse.',
        en: 'Always give Claude something to check its own work against: a test, a build, an expected output. According to the docs that is the most effective lever for good results.',
      },
    },
    { type: 'heading', text: { de: 'Branch, Plan, Umsetzung', en: 'Branch, plan, implementation' } },
    {
      type: 'text',
      text: {
        de: 'Ein eigener Branch hält `main` sauber und macht den Pull Request am Ende einfach. Dann der wichtigste Schritt: **planen, bevor geändert wird**. Im Plan-Modus liest Claude nur und schreibt einen Plan - welche Dateien, welche Änderungen, welche Prüfung. Passt der Plan nicht, sagst du es jetzt, nicht nach zwanzig Änderungen.',
        en: 'A branch of its own keeps `main` clean and makes the pull request at the end simple. Then the most important step: **plan before anything changes**. In plan mode Claude only reads and writes a plan - which files, which changes, which check. If the plan is off, you say so now, not after twenty changes.',
      },
    },
    {
      type: 'code',
      language: 'text',
      caption: { de: 'Der Ablauf im Terminal', en: 'The flow in the terminal' },
      code: '> Create a branch for the todo filter\n  ⏺ Bash(git switch -c feature/todo-filter)\n\n  (Shift+Tab twice: ⏸ plan mode on)\n> Add a filter feature to the todo list\n  ⏺ Plan:\n    1. Write src/components/TodoFilter.tsx\n    2. Edit src/App.tsx\n    3. Run npm test\n\n  (Shift+Tab: back to default)\n> go ahead',
    },
    {
      type: 'list',
      items: {
        de: [
          'Jeden Diff im Erlaubnisdialog lesen: Liegt der Zustand dort, wo ihn das Team haben will? Sind die Knöpfe per Tastatur bedienbar?',
          'Der Test am Ende ist nicht Formsache - erst wenn er grün ist, ist das Feature fertig.',
          'Bei kleinen, klaren Änderungen darfst du das Planen überspringen. Je größer die Aufgabe, desto mehr lohnt es sich.',
        ],
        en: [
          'Read every diff in the permission dialog: does the state live where the team wants it? Can the buttons be used with a keyboard?',
          'The test at the end is not a formality - the feature is done only once it is green.',
          'For small, clear changes you may skip planning. The bigger the task, the more it pays off.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Abschließen und festhalten', en: 'Wrap up and capture' } },
    {
      type: 'text',
      text: {
        de: '„Committe und öffne einen Pull Request“ - Claude schreibt die Commit-Nachricht, pusht den Branch und öffnet den PR mit der GitHub CLI `gh`. Danach kommt der Schritt, der dich beim nächsten Mal schneller macht: Was hast du Claude heute erklären müssen? Gehört es dauerhaft in die **CLAUDE.md**, oder ist es ein wiederkehrender Ablauf für einen **Skill**?',
        en: '"Commit and open a pull request" - Claude writes the commit message, pushes the branch and opens the PR with the GitHub CLI `gh`. Then comes the step that makes you faster next time: what did you have to explain to Claude today? Does it belong permanently into **CLAUDE.md**, or is it a recurring workflow for a **skill**?',
      },
    },
    { type: 'heading', text: { de: 'Wenn es schiefgeht', en: 'When things go wrong' } },
    {
      type: 'table',
      head: { de: ['Situation', 'Was hilft'], en: ['Situation', 'What helps'] },
      rows: {
        de: [
          ['Claude läuft in die falsche Richtung', '`Esc` unterbricht sofort, dann korrigieren'],
          ['Die letzte Änderung war Unsinn', '`/rewind` - Code und Gespräch auf einen früheren Stand'],
          ['Zweimal korrigiert, immer noch falsch', '`/clear` und den Prompt mit dem Gelernten neu schreiben'],
          ['Der Kontext ist voll mit altem Ballast', '`/compact` mit Fokus oder `/clear` für die nächste Aufgabe'],
        ],
        en: [
          ['Claude is heading the wrong way', '`Esc` interrupts at once, then correct'],
          ['The last change was nonsense', '`/rewind` - code and conversation back to an earlier point'],
          ['Corrected twice, still wrong', '`/clear` and rewrite the prompt with what you learned'],
          ['The context is full of old clutter', '`/compact` with a focus or `/clear` for the next task'],
        ],
      },
    },
    {
      type: 'note',
      tone: 'warning',
      text: {
        de: '`/rewind` ersetzt kein git: Änderungen, die nur ein Bash-Befehl gemacht hat, werden nicht erfasst. Deshalb der Branch am Anfang und Commits am Ende.',
        en: '`/rewind` does not replace git: changes made only by a Bash command are not tracked. That is why the branch at the start and commits at the end.',
      },
    },
  ],
  tasks: [
    {
      id: 'claude-project-explore',
      text: { de: 'Lass dir das Projekt erklären, bevor du etwas änderst.', en: 'Have the project explained before you change anything.' },
      command: 'Explain this project',
      check: { type: 'toolUsed', tool: 'Glob' },
    },
    {
      id: 'claude-project-green',
      text: { de: 'Starte grün: Lass die Tests laufen und den alten Fehler beheben.', en: 'Start green: have the tests run and the old bug fixed.' },
      command: 'Run the tests and fix the bug',
      check: { type: 'bugFixed' },
    },
    {
      id: 'claude-project-branch',
      text: { de: 'Leg einen Branch für den Filter an.', en: 'Create a branch for the filter.' },
      command: 'Create a branch for the todo filter',
      check: { type: 'branchCreated' },
    },
    {
      id: 'claude-project-plan',
      text: {
        de: 'Wechsle in den Plan-Modus (zweimal Shift+Tab) und bitte um den Filter: `Add a filter feature to the todo list`.',
        en: 'Switch to plan mode (Shift+Tab twice) and ask for the filter: `Add a filter feature to the todo list`.',
      },
      check: { type: 'planned' },
    },
    {
      id: 'claude-project-build',
      text: { de: 'Verlasse den Plan-Modus, gib den Plan mit `go ahead` frei und prüfe jeden Diff.', en: 'Leave plan mode, approve the plan with `go ahead` and check every diff.' },
      check: { type: 'featureBuilt' },
    },
    {
      id: 'claude-project-pr',
      text: { de: 'Committe und öffne einen Pull Request.', en: 'Commit and open a pull request.' },
      command: 'Commit and open a pull request',
      check: { type: 'prCreated' },
    },
    {
      id: 'claude-project-capture',
      text: { de: 'Halte den Ablauf fest: Lass Claude einen Skill für neue Features anlegen.', en: 'Capture the workflow: let Claude create a skill for new features.' },
      command: 'Create a skill for new features',
      check: { type: 'skillCreated' },
    },
  ],
  quiz: [
    {
      question: { de: 'In welcher Reihenfolge empfiehlt die Doku die Arbeit an einem Feature?', en: 'In which order do the docs recommend working on a feature?' },
      answers: {
        de: ['Umsetzen, committen, planen, erkunden', 'Erkunden, planen, umsetzen, committen', 'Committen, erkunden, umsetzen, planen', 'Planen, committen, erkunden, umsetzen'],
        en: ['Implement, commit, plan, explore', 'Explore, plan, implement, commit', 'Commit, explore, implement, plan', 'Plan, commit, explore, implement'],
      },
      correct: 1,
      explanation: {
        de: 'Erst verstehen, dann einen Plan prüfen, dann ändern - und am Ende sichern.',
        en: 'First understand, then check a plan, then change - and secure it at the end.',
      },
    },
    {
      question: { de: 'Warum zuerst den alten Fehler beheben, bevor das Feature kommt?', en: 'Why fix the old bug before the feature?' },
      answers: {
        de: ['Weil Claude sonst nicht startet', 'Damit rote Tests später eindeutig auf das Feature zeigen', 'Weil Branches nur mit grünen Tests gehen', 'Das ist egal'],
        en: ['Because Claude will not start otherwise', 'So red tests later clearly point to the feature', 'Because branches only work with green tests', 'It does not matter'],
      },
      correct: 1,
      explanation: {
        de: 'Ein grüner Ausgangspunkt macht jeden neuen Fehler eindeutig zuordenbar.',
        en: 'A green starting point makes every new failure clearly attributable.',
      },
    },
    {
      question: { de: 'Was macht Claude im Plan-Modus mit dem Feature-Auftrag?', en: 'What does Claude do with the feature request in plan mode?' },
      answers: {
        de: ['Es setzt ihn sofort um', 'Es liest die nötigen Dateien und legt einen Plan vor, ohne etwas zu ändern', 'Es lehnt ihn ab', 'Es committet direkt'],
        en: ['It implements it right away', 'It reads the files it needs and presents a plan without changing anything', 'It refuses it', 'It commits straight away'],
      },
      correct: 1,
      explanation: {
        de: 'Erst nach dem Verlassen des Plan-Modus und deiner Freigabe wird geändert.',
        en: 'Changes happen only after leaving plan mode and your approval.',
      },
    },
    {
      question: { de: 'Du hast Claude zweimal korrigiert und das Ergebnis ist immer noch falsch. Was jetzt?', en: 'You corrected Claude twice and the result is still wrong. What now?' },
      answers: {
        de: ['Ein drittes und viertes Mal korrigieren', '`/clear` und den Prompt mit dem Gelernten neu schreiben', 'Claude Code neu installieren', 'Das Modell wechseln und weitermachen'],
        en: ['Correct a third and fourth time', '`/clear` and rewrite the prompt with what you learned', 'Reinstall Claude Code', 'Switch the model and carry on'],
      },
      correct: 1,
      explanation: {
        de: 'Ein Kontext voller Fehlversuche lenkt ab. Neu anfangen mit einem besseren Prompt ist meist schneller.',
        en: 'A context full of failed attempts distracts. Starting over with a better prompt is usually faster.',
      },
    },
    {
      question: { de: 'Was gehört nach dem PR in einen Skill statt in die CLAUDE.md?', en: 'What belongs into a skill rather than CLAUDE.md after the PR?' },
      answers: {
        de: ['Wie man die Tests startet', 'Ein wiederkehrender Ablauf, z. B. „so bauen wir ein neues Feature“', 'Der Projektname', 'Die Liste aller Dateien'],
        en: ['How to run the tests', 'A recurring workflow, e.g. "this is how we build a new feature"', 'The project name', 'The list of all files'],
      },
      correct: 1,
      explanation: {
        de: 'Fakten, die immer gelten, gehören in CLAUDE.md; Abläufe für bestimmte Aufgaben in einen Skill, der nur bei Bedarf lädt.',
        en: 'Facts that always hold go into CLAUDE.md; workflows for particular tasks into a skill that loads only when needed.',
      },
    },
  ],
  keyPoints: {
    de: [
      'Erkunden, planen, umsetzen, committen - und vor dem Neuen erst grün werden.',
      'Ein Branch pro Feature hält main sauber; der Plan-Modus fängt Missverständnisse ab, bevor Code entsteht.',
      'Jeden Diff lesen und Claude etwas zum Prüfen geben: Tests, Build, erwartete Ausgabe.',
      'Schiefgelaufen? `Esc`, `/rewind`, nach zwei Fehlversuchen `/clear` mit besserem Prompt - git bleibt das Sicherheitsnetz.',
      'Gelerntes festhalten: Fakten in CLAUDE.md, wiederkehrende Abläufe als Skill.',
    ],
    en: [
      'Explore, plan, implement, commit - and get green before building something new.',
      'One branch per feature keeps main clean; plan mode catches misunderstandings before code exists.',
      'Read every diff and give Claude something to check against: tests, build, expected output.',
      'Gone wrong? `Esc`, `/rewind`, after two failed attempts `/clear` with a better prompt - git stays the safety net.',
      'Capture what you learned: facts in CLAUDE.md, recurring workflows as a skill.',
    ],
  },
}
