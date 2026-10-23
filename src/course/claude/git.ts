import type { Lesson } from './types'

export const gitLesson: Lesson = {
  id: 'claude-git',
  setup: { installed: true, loggedIn: true, inRepl: true, withMemory: true },
  blocks: [
    { type: 'heading', text: { de: 'Warum Git mit einem Agenten noch wichtiger wird', en: 'Why git matters even more with an agent' } },
    {
      type: 'text',
      text: {
        de: 'Ein Agent ändert in wenigen Sekunden mehrere Dateien. Das ist sein Vorteil - und sein Risiko. **Git** ist dein Sicherheitsnetz: Jeder Commit ist ein Stand, zu dem du zurückkannst, jeder Diff zeigt genau, was Claude gemacht hat. Wer mit Claude Code arbeitet, committet öfter, nicht seltener.',
        en: 'An agent changes several files within seconds. That is its strength - and its risk. **Git** is your safety net: every commit is a state you can return to, every diff shows exactly what Claude did. Working with Claude Code means committing more often, not less.',
      },
    },
    {
      type: 'list',
      items: {
        de: [
          '**Vor** einer größeren Aufgabe: sauberer Stand, am besten ein eigener Branch.',
          '**Während** der Arbeit: Im Standardmodus zeigt Claude dir jeden Edit als Diff, bevor es ihn macht.',
          '**Danach**: `git diff` lesen wie ein Code-Review - auch wenn alle Tests grün sind.',
        ],
        en: [
          '**Before** a bigger task: a clean state, ideally a branch of its own.',
          '**During** the work: in the default mode Claude shows you every edit as a diff before it makes it.',
          '**Afterwards**: read `git diff` like a code review - even when every test passes.',
        ],
      },
    },
    { type: 'heading', text: { de: 'Claude liest Git für dich', en: 'Claude reads git for you' } },
    {
      type: 'text',
      text: {
        de: 'Claude benutzt dieselben Git-Befehle wie du - über das Bash-Werkzeug. Frag einfach „Was hat sich geändert?“: Claude ruft `git status` und `git diff` auf und fasst zusammen. Für die Geschichte eines Fehlers hilft `git log` („Seit wann ist der Test rot?“). Weil das Shell-Befehle sind, siehst du den Erlaubnisdialog aus [[claude-agent]].',
        en: 'Claude uses the same git commands you do - through the Bash tool. Just ask "What changed?": Claude runs `git status` and `git diff` and sums up. For the history of a bug, `git log` helps ("Since when has the test been red?"). Because these are shell commands, you see the permission dialog from [[claude-agent]].',
      },
    },
    {
      type: 'table',
      head: { de: ['Du fragst', 'Claude führt aus', 'Wofür'], en: ['You ask', 'Claude runs', 'What for'] },
      rows: {
        de: [
          ['„Was hat sich geändert?“', '`git status`, `git diff`', 'Überblick vor dem Commit'],
          ['„Leg einen Branch für den Filter an“', '`git switch -c feature/todo-filter`', 'eine Aufgabe, ein Branch'],
          ['„Committe das“', '`git add -A && git commit -m "…"`', 'Commit-Nachricht aus dem Diff'],
          ['„Öffne einen Pull Request“', '`git push` und `gh pr create`', 'Review durchs Team'],
        ],
        en: [
          ['"What changed?"', '`git status`, `git diff`', 'overview before the commit'],
          ['"Create a branch for the filter"', '`git switch -c feature/todo-filter`', 'one task, one branch'],
          ['"Commit this"', '`git add -A && git commit -m "…"`', 'commit message from the diff'],
          ['"Open a pull request"', '`git push` and `gh pr create`', 'review by the team'],
        ],
      },
    },
    { type: 'heading', text: { de: 'Branches, Commits, Pull Requests', en: 'Branches, commits, pull requests' } },
    {
      type: 'text',
      text: {
        de: 'Eine gute Gewohnheit: **pro Aufgabe ein Branch**. Dann bleibt `main` sauber, und wenn ein Versuch schiefgeht, wirfst du den Branch weg. Claude schreibt Commit-Nachrichten aus dem Diff - lies sie trotzdem, denn sie erklären die Änderung für dein zukünftiges Ich und für das Team.',
        en: 'A good habit: **one branch per task**. Then `main` stays clean, and if an attempt goes wrong, you throw the branch away. Claude writes commit messages from the diff - read them anyway, they explain the change to your future self and the team.',
      },
    },
    {
      type: 'code',
      language: 'text',
      caption: { de: 'Ein typischer Ablauf in Claude Code', en: 'A typical flow in Claude Code' },
      code: '> Create a branch for the todo filter\n⏺ Bash(git switch -c feature/todo-filter)\n> Add a filter to the todo list\n  … Claude edits, you approve …\n> Commit and open a pull request\n⏺ Bash(git add -A && git commit -m "Add todo filter")\n⏺ Bash(git push -u origin HEAD && gh pr create --fill)',
    },
    {
      type: 'text',
      text: {
        de: 'Für Pull Requests nutzt Claude die GitHub-CLI `gh` - sie muss installiert und mit `gh auth login` angemeldet sein. Ob Claude sich in Commits und PRs als Mitautor einträgt, steuert die Einstellung `attribution` (Unterschlüssel `commit` und `pr`). Die ältere Einstellung `includeCoAuthoredBy` ist veraltet.',
        en: 'For pull requests Claude uses the GitHub CLI `gh` - it has to be installed and signed in with `gh auth login`. Whether Claude adds itself as co-author to commits and PRs is controlled by the setting `attribution` (sub-keys `commit` and `pr`). The older setting `includeCoAuthoredBy` is deprecated.',
      },
    },
    {
      type: 'note',
      tone: 'tip',
      text: {
        de: 'Mit `claude --from-pr 123` öffnest du eine Sitzung, die mit Pull Request 123 verknüpft ist - praktisch, um Review-Kommentare abzuarbeiten. Sitzungen, in denen Claude selbst einen PR angelegt hat, werden automatisch verknüpft.',
        en: 'With `claude --from-pr 123` you open a session linked to pull request 123 - handy for working through review comments. Sessions in which Claude created a PR itself are linked automatically.',
      },
    },
    { type: 'heading', text: { de: 'Checkpoints und /rewind', en: 'Checkpoints and /rewind' } },
    {
      type: 'text',
      text: {
        de: 'Zusätzlich zu Git legt Claude Code **Checkpoints** an: vor jedem Prompt, der einen neuen Durchlauf startet, merkt es sich den Stand der Dateien. Mit `/rewind` - oder zweimal `Esc` bei leerer Eingabe - springst du zu einem früheren Prompt zurück und wählst, was zurückgesetzt wird.',
        en: 'On top of git, Claude Code creates **checkpoints**: before every prompt that starts a new turn, it remembers the state of the files. With `/rewind` - or pressing `Esc` twice on an empty prompt - you jump back to an earlier prompt and pick what to restore.',
      },
    },
    {
      type: 'table',
      head: { de: ['Option im Menü', 'Wirkung'], en: ['Menu option', 'Effect'] },
      rows: {
        de: [
          ['Restore code and conversation', 'Dateien und Gespräch auf den Stand vor dem Prompt'],
          ['Restore conversation', 'nur das Gespräch zurück, die Dateien bleiben'],
          ['Restore code', 'nur die Dateien zurück, das Gespräch bleibt'],
          ['Summarize from here / up to here', 'Teil des Gesprächs zusammenfassen statt löschen'],
          ['Never mind', 'nichts tun'],
        ],
        en: [
          ['Restore code and conversation', 'files and conversation back to before the prompt'],
          ['Restore conversation', 'only the conversation back, the files stay'],
          ['Restore code', 'only the files back, the conversation stays'],
          ['Summarize from here / up to here', 'summarize part of the conversation instead of deleting it'],
          ['Never mind', 'do nothing'],
        ],
      },
    },
    {
      type: 'note',
      tone: 'warning',
      text: {
        de: 'Checkpoints ersetzen Git nicht. Nicht erfasst werden Änderungen, die **nur** über Bash-Befehle passieren (z. B. `rm` oder ein Skript), Änderungen von außen (dein Editor, eine zweite Sitzung) und meist auch Edits von Subagents. Behalten werden die letzten 100 Checkpoints einer Sitzung.',
        en: 'Checkpoints do not replace git. Not covered are changes made **only** through Bash commands (e.g. `rm` or a script), changes from outside (your editor, a second session) and usually edits by subagents. The last 100 checkpoints of a session are kept.',
      },
    },
    { type: 'heading', text: { de: 'Parallel arbeiten mit Worktrees', en: 'Working in parallel with worktrees' } },
    {
      type: 'text',
      text: {
        de: 'Zwei Aufgaben gleichzeitig - etwa ein Bugfix, während Claude an einem Feature arbeitet? Zwei Sitzungen im selben Ordner würden sich gegenseitig Dateien überschreiben. Ein **Git-Worktree** ist ein zweiter Arbeitsordner desselben Repos mit eigenem Branch. `claude -w <name>` startet Claude direkt in so einem Worktree unter `.claude/worktrees/<name>`.',
        en: 'Two tasks at once - say a bug fix while Claude works on a feature? Two sessions in the same folder would overwrite each other\'s files. A **git worktree** is a second working folder of the same repo with its own branch. `claude -w <name>` starts Claude right in such a worktree under `.claude/worktrees/<name>`.',
      },
    },
    { type: 'code', language: 'bash', code: '# terminal 1: the feature\nclaude -w todo-filter\n\n# terminal 2: the bug fix, at the same time\nclaude -w fix-toggle' },
  ],
  tasks: [
    {
      id: 'claude-git-status',
      text: { de: 'Frag Claude, was sich in Git geändert hat, und erlaube die beiden Git-Befehle.', en: 'Ask Claude what changed in git and allow both git commands.' },
      command: 'What changed in git?',
      check: { type: 'gitInspected' },
    },
    {
      id: 'claude-git-branch',
      text: { de: 'Lass Claude einen Branch für den Todo-Filter anlegen.', en: 'Let Claude create a branch for the todo filter.' },
      command: 'Create a branch for the todo filter',
      check: { type: 'branchCreated' },
    },
    {
      id: 'claude-git-rewind',
      text: { de: 'Lass Claude den Fehler beheben - und nimm die Änderung danach mit `/rewind` zurück.', en: 'Let Claude fix the bug - and take the change back afterwards with `/rewind`.' },
      command: '/rewind',
      check: { type: 'rewound' },
    },
    {
      id: 'claude-git-commit',
      text: { de: 'Lass Claude committen und einen Pull Request öffnen.', en: 'Let Claude commit and open a pull request.' },
      command: 'Commit and open a pull request',
      check: { type: 'committed' },
    },
    {
      id: 'claude-git-pr',
      text: { de: 'Prüfe, dass der Pull Request angelegt wurde (der Link steht in Claudes Antwort).', en: 'Check that the pull request was created (the link is in Claude\'s answer).' },
      check: { type: 'prCreated' },
    },
    {
      id: 'claude-git-log',
      text: { de: 'Sieh dir selbst im Shell-Modus die Commit-Geschichte an.', en: 'Look at the commit history yourself in shell mode.' },
      command: '!git log --oneline',
      check: { type: 'bashMode' },
    },
  ],
  quiz: [
    {
      question: { de: 'Warum lohnt sich ein eigener Branch pro Aufgabe besonders mit einem Agenten?', en: 'Why is one branch per task especially worth it with an agent?' },
      answers: {
        de: ['Claude arbeitet nur auf Branches', 'Main bleibt sauber, und ein misslungener Versuch lässt sich einfach verwerfen', 'Branches sind schneller als main', 'Ohne Branch kann Claude nicht committen'],
        en: ['Claude only works on branches', 'Main stays clean, and a failed attempt is easy to throw away', 'Branches are faster than main', 'Without a branch Claude cannot commit'],
      },
      correct: 1,
      explanation: {
        de: 'Ein Agent ändert viel in kurzer Zeit. Auf einem eigenen Branch ist jeder Versuch isoliert und reviewbar.',
        en: 'An agent changes a lot in a short time. On a branch of its own, every attempt is isolated and reviewable.',
      },
    },
    {
      question: { de: 'Was stellt `/rewind` **nicht** zuverlässig wieder her?', en: 'What does `/rewind` **not** reliably restore?' },
      answers: {
        de: ['Edits, die Claude mit dem Edit-Werkzeug gemacht hat', 'Das Gespräch', 'Dateien, die nur ein Bash-Befehl wie `rm` verändert hat', 'Den Stand vor dem letzten Prompt'],
        en: ['Edits Claude made with the Edit tool', 'The conversation', 'Files changed only by a Bash command like `rm`', 'The state before the last prompt'],
      },
      correct: 2,
      explanation: {
        de: 'Checkpoints erfassen die Datei-Edits von Claude, nicht reine Shell-Änderungen und nicht Änderungen von außen. Für alles andere gibt es Git.',
        en: 'Checkpoints capture Claude\'s file edits, not pure shell changes and not changes from outside. For everything else there is git.',
      },
    },
    {
      question: { de: 'Was braucht Claude, um einen Pull Request auf GitHub zu öffnen?', en: 'What does Claude need to open a pull request on GitHub?' },
      answers: {
        de: ['Nichts - das kann Claude Code von sich aus', 'Die GitHub-CLI `gh`, angemeldet mit `gh auth login`', 'Einen MCP-Server für GitHub, zwingend', 'Ein Claude-Max-Abo'],
        en: ['Nothing - Claude Code does that on its own', 'The GitHub CLI `gh`, signed in with `gh auth login`', 'An MCP server for GitHub, mandatory', 'A Claude Max subscription'],
      },
      correct: 1,
      explanation: {
        de: 'Claude benutzt `gh pr create` über das Bash-Werkzeug - wie du im Terminal.',
        en: 'Claude uses `gh pr create` through the Bash tool - just like you would in the terminal.',
      },
    },
    {
      question: { de: 'Du willst parallel an zwei Aufgaben arbeiten lassen. Was verhindert, dass sich die Sitzungen Dateien überschreiben?', en: 'You want two tasks worked on in parallel. What keeps the sessions from overwriting each other\'s files?' },
      answers: {
        de: ['Zwei Terminalfenster im selben Ordner', '`claude -w <name>` - jede Sitzung in ihrem eigenen Worktree', '`/clear` zwischen den Aufgaben', '`/rewind` nach jeder Änderung'],
        en: ['Two terminal windows in the same folder', '`claude -w <name>` - each session in its own worktree', '`/clear` between the tasks', '`/rewind` after every change'],
      },
      correct: 1,
      explanation: {
        de: 'Ein Worktree ist ein eigener Arbeitsordner mit eigenem Branch - die Sitzungen kommen sich nicht in die Quere.',
        en: 'A worktree is a working folder of its own with its own branch - the sessions do not get in each other\'s way.',
      },
    },
    {
      question: { de: 'Mit welcher Einstellung steuerst du, ob Claude sich als Mitautor in Commits einträgt?', en: 'Which setting controls whether Claude adds itself as co-author to commits?' },
      answers: { de: ['`attribution`', '`includeCoAuthoredBy` - die aktuelle Einstellung', '`gitAuthor`', '`commitStyle`'], en: ['`attribution`', '`includeCoAuthoredBy` - the current setting', '`gitAuthor`', '`commitStyle`'] },
      correct: 0,
      explanation: {
        de: '`attribution` mit den Unterschlüsseln `commit` und `pr` ersetzt das veraltete `includeCoAuthoredBy`.',
        en: '`attribution` with the sub-keys `commit` and `pr` replaces the deprecated `includeCoAuthoredBy`.',
      },
    },
  ],
  keyPoints: {
    de: [
      'Git ist das Sicherheitsnetz für Agenten-Arbeit: oft committen, jeden Diff lesen.',
      'Claude nutzt `git status`, `git diff`, `git log` über Bash - und `gh` für Pull Requests.',
      'Pro Aufgabe ein Branch; `attribution` steuert den Mitautor-Eintrag in Commits und PRs.',
      'Checkpoints und `/rewind` (oder `Esc` `Esc`) holen frühere Stände zurück - aber keine reinen Bash-Änderungen und kein Ersatz für Git.',
      '`claude -w <name>` trennt parallele Sitzungen in eigene Worktrees; `--from-pr` verknüpft eine Sitzung mit einem PR.',
    ],
    en: [
      'Git is the safety net for agent work: commit often, read every diff.',
      'Claude uses `git status`, `git diff`, `git log` through Bash - and `gh` for pull requests.',
      'One branch per task; `attribution` controls the co-author entry in commits and PRs.',
      'Checkpoints and `/rewind` (or `Esc` `Esc`) bring back earlier states - but not pure Bash changes and no replacement for git.',
      '`claude -w <name>` keeps parallel sessions apart in worktrees; `--from-pr` links a session to a PR.',
    ],
  },
}
