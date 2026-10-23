# CLAUDE.md - reactsample

Ein zweisprachiger (DE/EN) Lernpfad im Browser: JavaScript, TypeScript, React, Java, Spring Boot,
Docker und SQL - mit Editoren, die den Code wirklich ausführen, Übungen mit Tests und Quiz.
Die README beschreibt die Inhalte und Editoren ausführlich; diese Datei ist die Karte für die Arbeit
am Code.

**Diese Datei aktuell halten:** Wer Dateien oder Ordner anlegt, verschiebt, umbenennt oder löscht,
passt die Struktur unten im selben Commit an. Ebenso neue Konventionen und Stolperfallen.

## Stack und Befehle

React 19, TypeScript 6, Vite 8 (rolldown), Tailwind v4, oxlint, Vitest. Kein Router-Framework (Hash-Routing
über `useHashRoute`), keine i18n-Bibliothek - Eigenbau im Projekt. Die Browser-Tests (`e2e:content`,
`e2e:pages`) laufen über playwright-core und axe-core.
Im Playground zusätzlich Monaco (`monaco-editor`, `@monaco-editor/react`), `react-resizable-panels`
und `@fontsource/jetbrains-mono` - alle drei nur dort und nachgeladen, siehe „Die zwei Editoren“.

```bash
npm run dev            # Dev-Server (http://localhost:5173)
npm run build          # tsc -b && vite build → dist/
npm run preview        # dist/ ausliefern - zum Prüfen des Produktions-Builds
npm run lint           # oxlint (muss ohne Warnung durchlaufen)
npm run e2e:content   # alle Beispiele, Übungen, Projektschritte im Browser (Chrome/Edge via playwright-core)
npm run e2e:content -- praxis-   # nur IDs mit diesem Anfang
npm run e2e:content -- --build   # dasselbe auf dem Produktions-Build (so läuft es in der CI)
npm run e2e:pages    # jede Seite im Produktions-Build: Seitenfehler, alle Musterlösungen grün,
                       # axe-core (hell + dunkel), Handybreite, App-Funktionen (~4 min, 4 Seiten parallel)
npm run e2e:pages -- js-        # nur Routen mit diesem Anfang (--parallel=N für mehr/weniger gleichzeitig)
npm test               # Vitest, drei Projekte (vite.config.ts): unit (Node), dom (jsdom), content
npm test -- java       # nur Dateien mit "java" im Pfad - z.B. Teil 7 (backend, sql ebenso)
npm run test:watch     # Vitest im Watch-Modus
npm run test:coverage  # mit Abdeckungsbericht nach coverage/ (index.html)
```

Vor jedem Commit: `npx tsc -b`, `npm run lint`, `npm run build`, `npm test` und die betroffenen `test:*`.
Bei Änderungen an Oberfläche, Editoren oder Laufzeiten zusätzlich `e2e:pages` (mit Filter reicht oft).
Die CI (`.github/workflows/ci.yml`) führt bei jedem Push auf `main` alles aus - nach dem Push das
Ergebnis prüfen. `gh` ist auf diesem Rechner nicht installiert, das Repo ist öffentlich - die API geht ohne Token:

```bash
curl -s https://api.github.com/repos/klamest190/reactsample/actions/runs?per_page=1     # Status des letzten Laufs
curl -s https://api.github.com/repos/klamest190/reactsample/actions/runs/<run>/jobs    # Jobs und Schritte
curl -s https://api.github.com/repos/klamest190/reactsample/check-runs/<job>/annotations  # Befunde
```

Die Logs selbst brauchen Admin-Rechte. Deshalb schreiben `e2e:content` und `e2e:pages` ihre Befunde
in der CI als Annotations (`::error::`). `e2e:pages` wiederholt Seiten mit Befund einmal einzeln -
was erst dann grün ist, erscheint als Warnung „instabil“.

## Struktur

```
CLAUDE.md README.md          diese Karte / ausführliche Doku
LICENSE                      MIT
.editorconfig .nvmrc         Editor-Grundeinstellungen (LF, 2 Leerzeichen) / Node-Version für CI und nvm
index.html                   App-Einstieg
selftest.html                Einstieg für e2e:content (src/selftest/main.ts)
vite.config.ts               Tailwind, React, optimizeDeps.exclude für PGlite, Vitest-Projekte und Coverage
tsconfig.*.json              app (src ohne Tests), node (vite.config), test (src/**/*.test.ts[x] + src/test, Node-Typen)
.github/workflows/ci.yml     CI: Job "code" (lint, build, Vitest mit Coverage), Job "browser" (e2e:content --build, e2e:pages)
.github/dependabot.yml       Abhängigkeiten: npm wöchentlich (minor/patch gebündelt), Actions monatlich
public/favicon.svg           Bildmarke "Lernpfad"
scripts/
  test-server.mjs            gemeinsam: Dev-Server oder Produktions-Build + Vorschau-Server, Chrome/Edge starten
  e2e-content.mjs            e2e:content - öffnet selftest.html, wertet aus (--build: Produktions-Build)
  e2e-pages.mjs              e2e:pages - jede Seite im Produktions-Build (siehe oben)
  coverage-summary.mjs       Coverage-Tabelle für die Job-Zusammenfassung der CI
src/
  main.tsx App.tsx           Einstieg; Layout, Hash-Routing, Seitenwahl, Sprachumschalter.
                             Im ersten Download: Kopfzeile, Seitenleiste, Startseite. Kapitelseite, Glossar,
                             Projekt, Playground und Suche (mit Glossar-Daten) werden nachgeladen,
                             die Kapitelseite schon im Leerlauf (requestIdleCallback)
  index.css                  Tailwind, Design-Tokens (brand-*), Dark Mode, Vorschau-Styles
  i18n/
    LanguageContext.tsx      Sprache de/en, Provider + Hooks, Typ für zweisprachige Werte
    messages.ts              alle Oberflächentexte beider Sprachen (typgeprüft gleich)
    localized.ts             localized(text, language) für string | zweisprachig
  components/                App-Oberfläche
    Icon.tsx                 alle SVG-Icons (Strichstil) + Logo + Teil-Symbol - keine Emoji in der UI
    partStyle.ts             Icon/Kürzel/Farbe je Kursteil
    scrollFocus.ts           focusableWhenScrolling: Scroll-Container per Tastatur erreichbar, solange sie scrollen
    Ui.tsx                   Bausteine der Kapiteltexte (Abschnitt, Absatz, Hinweis, Merke, Button, Karte …)
    Sidebar.tsx Search.tsx Outline.tsx ChapterLink.tsx ErrorBoundary.tsx
  context/                   ThemeContext, ProgressContext (Kapitel, Quiz, gelöste Übungen), ChapterContext
  hooks/                     useHashRoute, useLocalStorage, useActiveSection, useDebounce … (+ hooks.test.tsx)
  pages/                     HomePage, ChapterPage, GlossaryPage, ProjectOverview, Playground
  course/                    INHALTE
    course.ts                Reihenfolge der Teile, Voraussetzungen (roter Faden, bewusst zentral), Kapitelliste
    parts/                   ein Teil pro Datei: Kapitel (id, Titel, Lernziele, Stichworte, lazy Komponente de/en);
                             types.ts: Teil, Kapitel, Lader
    glossary.ts              Glossar-Einträge
    integrity.test.ts        Kurs als Daten prüfen: IDs eindeutig, Verweise gültig, jedes Kapitel DE + EN
    js/ typescript/ react/ hooks/ practice/ java/ backend/ sql/
      Name.tsx               Kapiteltext DE  ┐ gleiche benannte Export-Komponente
      Name.en.tsx            Kapiteltext EN  ┘
      Name.code.ts           Code, Tests, Lösungen, Tipps - einmal, auf Englisch
    practice/businessApp/    Beispiel-App (Seiten, Komponenten, Store) für das BusinessApp-Kapitel
    exercises/               Zusatzübungen je Teil (index.ts lädt pro Teil nach), types.ts
    playground/              Vorlagen + Bausteine je Teil, locations.ts, types.ts
    project/                 ToDo-Projekt: meta.ts (Titel, Vorwissen), ProjectStep.tsx, steps/ (Inhalte:
                             code.ts, tests.ts, basics.ts 1-5, hooks.ts 6-11, advanced.ts 12-14, challenge.ts 15)
    claude/                  Lernpfad "Claude Code Engineer" als DATEN (noch nicht in `kurs` eingehängt):
                             types.ts (Track, Lesson, LessonBlock, LessonTask), curriculum.ts (claudeTrack,
                             lessonCompleted), je Lektion eine Datei (setup, commands, context, agentLoop, skills);
                             curriculum.test.ts spielt jede Lektion in der Simulation durch
    demos/                   interaktive Demo-Komponenten der Kapitel (Diagramme, Terminal, FullStack …);
                             ClaudeTerminalMock.tsx: simuliertes Claude Code + ClaudeTaskList (über src/claude)
  learning/                  LERNBAUSTEINE (Editoren und ihre Laufzeiten im Browser)
    TryIt.tsx                Props aller Modi + Auswahl des Editors nach Modus (Spring/Docker/SQL lazy)
    EditorFrame.tsx          gemeinsam: Rahmen (Kopf, Aufgabe, Editor, Knöpfe, Tipps, Lösung),
                             Konsole, Testergebnisse, Typfehlerliste, Fehlerkasten
    TryItJs.tsx              JS/TS im Sandbox-iframe (jsSandbox.ts, tsRunner.ts)
    TryItReact.tsx           JSX/TSX mit Vorschau in eigener React-Wurzel, Tests über reactTestKit.ts
    TryItTest.tsx            eigene Tests schreiben (Vitest-Nachbau + echte Testing Library, testRunner.ts)
    TryItJava.tsx            Java über src/java (lazy geladen)
    TryItSpring.tsx          Spring über src/spring: Server-Log, HTTP-Client, Beans
    TryItDocker.tsx          Dockerfile- und Compose-Editor über src/docker
    TryItSql.tsx             SQL über src/sql, darüber SqlDataPanel.tsx (Beispieldaten)
    Workbench.tsx            Mehrdatei-Editor (Full-Stack-Kapitel, BusinessApp)
    modes.ts                 Register: Modi, Editorsprachen, Abzeichen, Hervorhebung nach Titel
    useEditor.ts             useEditor(props): gespeicherter Code + Props für den Rahmen; useOnMount (erster Lauf)
    editorChecks.ts          useDelayedCheck (Prüfen nach Tipp-Pause), lineMarkers (rote Linie je Zeile)
    CodeEditor.tsx           Textarea über eingefärbtem <pre>, Autovervollständigung (Kapitel)
    MonacoEditor.tsx         derselbe Vertrag in Monaco (nur Playground, lazy aus EditorFrame.tsx)
    EditorWorkspace.tsx      Playground-Layout: Editor/Ausgabe teilbar, Ausgabe in Reitern, Statusleiste
    cursorStore.ts           Cursorposition als Store - sonst rendert jeder Tastendruck den ganzen Rahmen
    editorGlobals.ts         Hooks ohne Import als .d.ts - gemeinsam für tsc-Worker und Monaco
    monaco/
      setup.ts               Monaco einrichten (lokale Fassung statt CDN, Worker, TS-Optionen, extraLibs)
      themes.ts              die zwei Themes - Farben wie highlight.tsx, auf WCAG AA gerechnet
      languages.ts           EditorLanguage -> Monaco-Sprache/Dateiendung + Register je Modell
      completion.ts          die Vorschläge des Kurses als Monaco-Provider (nutzt search())
    highlight.tsx            Syntax-Highlighter (code, konfig, sql)
    suggestions.ts backendSuggestions.ts sqlSuggestions.ts   Vorschläge im Editor
    reactCompile.ts          sucrase → Komponente, mit eigenen Globalen für Tests
    reactTestKit.ts          Mini-Testing-Library der React-Übungen (render, click, mockFetch …)
    testRunner.ts            Vitest-Nachbau für TryItTest, act-Ersatz für den Produktions-Build
    jsSandbox.ts tsRunner.ts typeCheck.ts(+ .worker.ts) tailwind.ts tailwindEngine.ts
    CodeBlock.tsx Quiz.tsx Exercises.tsx Text.tsx source.ts insertion.ts useSavedCode.ts
  java/                      Java-Interpreter (lexer, parser, typeChecker, interpreter, library, values) - kein React
  spring/                    Spring Boot auf der Java-Laufzeit - kein React
  docker/                    Docker-Simulator (build, compose, cli, yaml) - kein React
  sql/                       PostgreSQL via PGlite im Worker (engine, client, check, dataset) - kein React
  claude/                    Claude-Code-Simulator: session.ts (Zustandsmaschine shell/login/repl/permission),
                             commands.ts (Slash-Commands), agent.ts (Prompt -> Tool-Schritte), workspace.ts
                             (ToDo-App, Skills), tasks.ts (Aufgaben gegen Events prüfen), types.ts - kein React
  test/                      render.tsx (renderInApp: Komponenten mit Providern, Englisch), setup.ts (jest-dom, Cleanup)
  selftest/                  main.ts (Seite für e2e:content), checks.ts (Prüfung je Modus),
                             results.ts (RuntimeResult, ContentResult, runCases - gemeinsam für alle Laufzeiten),
                             tryItUsages.ts (liest <TryIt id mode typed preview> aus den Kapitelquellen),
                             java|backend|sql.content.test.ts (Vitest: Laufzeit-Selbsttests + alle Beispiele in Node)
```

Laufzeiten (`java/`, `spring/`, `docker/`, `sql/`) kennen kein React und kein DOM, damit sie auch in
Node laufen (Vitest-Projekt `content`). Die Tür nach außen ist jeweils `index.ts` bzw.
`client.ts`; `contents.ts`/`check.ts` prüfen die Kapitelbeispiele.

## Die zwei Editoren

Der Kurs hat zwei Editor-Oberflächen mit **demselben Vertrag** (gleiche Props, gleiche
`EditorControl` mit `stand/insert/replace/run`) - `EditorFrame` tauscht sie gegeneinander:

| | `CodeEditor.tsx` | `MonacoEditor.tsx` |
|---|---|---|
| wo | Kapitel, Übungen, Werkstatt | nur Playground (`workspace`) |
| Gewicht | im ersten Download | ~1 MB, `lazy()` in `EditorFrame.tsx` |
| Vorschläge | `suggestions.ts` + Tailwind-Engine | dieselben + Monacos IntelliSense aus den Typen |

Warum nicht überall Monaco: `EditorFrame` steckt in jeder der ~60 Kapitelseiten. Ein fester Import
würde Monaco überallhin mitnehmen - der erste Download soll klein bleiben (siehe Stolperfallen).

Die Laufzeiten bleiben unangetastet: Java läuft weiter im echten Interpreter unter `src/java/`,
SQL in echtem PostgreSQL (PGlite) unter `src/sql/`, React über sucrase. Monaco ist nur die
Oberfläche - er übersetzt und führt nichts aus.

**Ausgabe in Reitern:** Im Workspace-Layout liefern die Editoren ihre Ausgabeblöcke zusätzlich als
`areas` (benannt, in Reiter-Reihenfolge); ohne Workspace zählt wie bisher `children`. Beide
beschreiben dieselben Elemente - gerendert wird immer nur eins von beidem. Die Inhalte aller Reiter
bleiben im DOM (nur `hidden`), weil darin laufende Dinge stecken: das Sandbox-iframe, die
React-Wurzel der Vorschau, die PGlite-Verbindung.

## Konventionen

- **Code auf Englisch** (Bezeichner und Kommentare). Laufzeiten (`java/`, `spring/`, `docker/`, `sql/`),
  Editoren (`learning/`) und Selbsttest sind umgestellt; App-Oberfläche (components, context, hooks,
  i18n, pages) und Kursstruktur folgen. Neues immer englisch schreiben.
  Texte für Lernende immer zweisprachig (`{ de, en }` bzw. `i18n/messages.ts`).
- **Kapitel = drei Dateien**: `.tsx` (DE), `.en.tsx` (EN), `.code.ts` (Code einmal, Englisch).
  Code, Tests, Lösungen und Übungs-Tipps stehen nur in der `.code.ts`. Eintrag in `course/parts/<teil>.ts`,
  Voraussetzungen in `GRUNDLAGEN` (`kurs.ts`).
  Ablauf: README → "Ein Kapitel hinzufügen".
  Ausnahme: die Lektionen des Claude-Code-Pfads (`course/claude/`) sind Daten (Blöcke + Aufgaben), weil
  alle dieselbe geteilte Ansicht haben (links Text, rechts Terminal). Aufgaben prüfen Events der Sitzung
  (`TaskCheck`), keine Funktionen; gelöste Aufgaben landen per `uebungGeloest` in `lernpfad-uebungen`.
  Fakten zu Claude Code gegen code.claude.com/docs prüfen - Befehle und Aliase ändern sich oft
  (Stand 2026-10: `/cost` ist Alias von `/usage`, „gebündelte Skills“ statt „System-Skills“).
- **`TryIt`-IDs** sind kursweit eindeutig (Schlüssel für gespeicherten Code und Fortschritt).
- **Neuer Editor-Modus**: in `learning/modes.ts` eintragen, Props in `TryIt.tsx`, Editor als
  `TryIt<Name>.tsx` - `const { code, frame } = useEditor(props)`, dann `<EditorFrame {...frame} kind=… run=…>`;
  Prüfung in `selftest/checks.ts`. Eine neue Laufzeit liefert `RuntimeResult`/`ContentResult` aus `selftest/results.ts`.
- **Keine Emoji in der Oberfläche** - Icons aus `components/Icon.tsx` (fehlende dort ergänzen).
  Kursinhalte (Kapiteltexte, Beispielcode, simulierte Terminalausgaben) dürfen Emoji haben.
- Tailwind-Klassen als ganze Strings (der Scanner findet keine zusammengesetzten).
- Farben/Theme: `brand-*` Tokens, jede Fläche mit `dark:`-Variante.
- **Kontrast (WCAG AA 4,5:1)**, von `e2e:pages` geprüft. Text auf Weiß/`slate-50`: mindestens
  `text-slate-500`, auf getönten Flächen (`slate-100`, `brand-50` …) `text-slate-600`; im Dunkeln
  `dark:text-slate-400` - also nie `text-slate-400` für Text im hellen Design und nie `slate-500`/`600`
  ohne `dark:`-Variante. Weiße Schrift erst ab `-600`/`-700`-Hintergrund (`bg-emerald-700`).
- **Barrierefreiheit**: Eingabefelder brauchen ein Label (`<label>` oder `aria-label`), scrollbare
  Bereiche `ref={focusableWhenScrolling}`, Links im Fließtext eine Unterstreichung, Statuspunkte
  `role="img"` + `aria-label`. Nur ein `<main>` (App.tsx) und keine übersprungenen Überschriften.
- **Vorschau-Container** (gerenderter Code der Lernenden) tragen `data-preview` - die Prüfungen lassen
  sie aus, denn Beispielcode darf ein eigenes `<main>` oder `<h1>` haben.
- **Test-Attribute**: `data-running` am Rahmen eines laufenden Editors, `data-test-result="pass|fail"`
  an Testergebnissen, `data-exercise` an Übungskarten - daran orientiert sich `e2e:pages`.
- **Tests**: Unit-Tests liegen neben dem Code (`name.test.ts`, mit DOM `name.test.tsx`). Inhaltsprüfungen
  über alle Kapitel heißen `*.content.test.ts`. Neue Logik bekommt einen Test. Komponenten mit
  `renderInApp` aus `src/test/render.tsx` rendern. Die Coverage-Schwellen in `vite.config.ts` nur anheben.
- Git: direkt auf `main` committen und pushen, Branches/PRs nur auf Wunsch.

## Stolperfallen

- **Dev- und Produktions-Build verhalten sich verschieden.** Beispiel: React 19 hat `act` nur im
  Dev-Build - deshalb installiert `testRunner.ts` einen Ersatz, bevor die Testing Library lädt.
  `e2e:content` ohne `--build` sieht solche Fehler nicht; `e2e:pages` und die CI laufen auf dem
  Produktions-Build.
- **Tailwind zur Laufzeit** (`tailwindEngine.ts`) erzeugt CSS für Klassen im Editor-Code. Es liegt in der
  Ebene `preview` unter `utilities` (`@layer`-Reihenfolge in `index.css`). Ohne das hat eine Vorschau
  mit `bg-white` die `dark:`-Klassen der Seite überschrieben - die Seitenleiste wurde im Dunkeln hell.
- **Alle Editoren einer Seite teilen sich `window`.** Tests dürfen keine Globalen ersetzen, die
  Vorschauen und andere Beispiele mitbenutzen: `mockFetch` tauscht deshalb nur das `fetch`, das
  `compile` dem getesteten Code als Globale gibt. React-Übungen starten ihre Tests erst,
  wenn die neue Vorschau steht (`run` in `TryItReact.tsx`).
- `e2e:content` prüft ohne Vorschau - Wechselwirkungen zwischen Vorschau und Test fallen nur im
  echten Editor auf.
- Eine Demo kann das Farbschema umschalten: Prüfskripte laden jede Seite frisch (`goto` + `reload`),
  statt nur den Hash zu wechseln - sonst misst man im falschen Design.
- axe misst halbtransparente Hintergründe (`dark:bg-black/40`) falsch, wenn sich das Farbschema während
  des Laufs ändert - Kontrastfehler im Dunkeln erst an einer frisch geladenen Seite bestätigen.
- Playground-IDs (`teil: '…'`) stehen in den Dateien unter `course/playground/`, nicht in `index.ts`.
- Kapitel-Imports in `course/parts/*.ts` müssen existieren, sonst bricht Vite ab (beim Anlegen zuerst die Dateien).
- PGlite ist in `optimizeDeps.exclude` - nicht entfernen, sonst lädt die WASM-Datei nicht.
- **axe misst auch Monacos DOM.** `e2e:pages` nimmt nur `[data-preview]` und iframes aus - die
  Token-Farben im Editor müssen also 4,5:1 schaffen. Gerechnet wird gegen den *ungünstigsten*
  Hintergrund, die hervorgehobene aktive Zeile, nicht gegen die normale Fläche. Sonst fällt
  ausgerechnet die Zeile unter dem Cursor durch. Auch die Zeilennummern zählen als Text.
  `monaco/themes.test.ts` prüft das ohne Browser.
- **Nichts pro Tastendruck in den State des Rahmens.** Die Cursorposition lief erst über
  `useState` in `EditorFrame` - damit rendert jeder Tastendruck Editor, Reiter und Konsole neu,
  und Monaco verliert Zeichen (gemessen: bei 20 ms Tippabstand fehlte schon eins). Sie läuft
  deshalb über `cursorStore.ts`; nur die Statusleiste hängt daran.
- **Monaco nicht über das `value`-Prop steuern.** `@monaco-editor/react` schreibt dann bei jedem
  Unterschied das ganze Modell neu - und der React-State hinkt beim Tippen ein Zeichen hinterher.
  `MonacoEditor` nutzt `defaultValue` und spielt Änderungen von außen selbst ein.
- **Monacos Worker ohne `esm/vs/` importieren** (`monaco-editor/editor/editor.worker.js?worker`):
  die `exports`-Karte des Pakets hängt `esm/vs/` selbst davor, mit Präfix bricht der Build ab.
- **Monaco 0.57** hat die Sprachdienste verschoben: `monaco.typescript` statt
  `monaco.languages.typescript` (Letzteres ist nur noch ein Platzhalter mit `{ deprecated: true }`).
- `@monaco-editor/react` lädt Monaco sonst **von einem CDN**. `monaco/setup.ts` übergibt per
  `loader.config({ monaco })` die lokale Fassung und der Editor rendert erst danach.
- **react-resizable-panels v4**: Größen als *Zahl* sind Pixel, als *String* Prozent
  (`defaultSize="62%"`). Die Komponenten heißen `Group`/`Panel`/`Separator`.
- **Strg+K gehört der Suche.** Monaco belegt es als Akkord-Präfix und verschluckt es; `MonacoEditor`
  gibt es deshalb per `KeyboardEvent` ans Fenster zurück (`e2e:pages` prüft die Suche).
  Monacos eigene Befehlsliste liegt auf F1.
- Der Funktionstest des Playgrounds liest `page.innerText('main')` - **versteckte Reiter zählen
  nicht**. Der Reiter mit der Konsole muss nach einem Lauf sichtbar sein (erster Eintrag in
  `areas`, siehe `EditorWorkspace.tsx`).
- Git Bash wandelt Argumente wie `/sql-start` in Windows-Pfade um - Routen ohne führenden `/` übergeben.
- Shell-Heredocs verschlucken Backslashes - Dateien mit `\` über Editor-Tools oder Node-Skripte schreiben.
- **Namen, die der Compiler nicht sieht.** Das iframe-Protokoll (`BRIDGE`/`TEST_RUNNER` in `jsSandbox.ts`,
  Typ `SandboxMessage`), `'kind' in x`-Prüfungen, `data-*`-Attribute, die CSS-Ebene `preview` und
  `window.__selftest` hängen an Strings. Beim Umbenennen dort von Hand nachziehen; die Content-Tests
  und `e2e:*` fangen Fehler, `tsc` nicht.
- **Optionale Props verschwinden beim Spread still.** Ein Objekt mit falschem Schlüssel, das per
  `{...props}` in eine Komponente geht, meldet `tsc` nicht - solche Objekte mit
  `satisfies Partial<ComponentProps<typeof X>>` absichern (siehe `useEditor.ts`).
- **Erster Download klein halten:** Was `App.tsx` fest importiert, lädt jede Seite beim Start. Neue
  Seiten und alles mit Editoren oder großen Daten per `lazy()` einbinden (Stand: ~110 kB JS gzip).
