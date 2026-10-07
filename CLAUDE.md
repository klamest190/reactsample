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
    demos/                   interaktive Demo-Komponenten der Kapitel (Diagramme, Terminal, FullStack …)
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
    CodeEditor.tsx           Textarea über eingefärbtem <pre>, Autovervollständigung
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
  test/                      render.tsx (renderInApp: Komponenten mit Providern, Englisch), setup.ts (jest-dom, Cleanup)
  selftest/                  main.ts (Seite für e2e:content), checks.ts (Prüfung je Modus),
                             results.ts (RuntimeResult, ContentResult, runCases - gemeinsam für alle Laufzeiten),
                             tryItUsages.ts (liest <TryIt id modus typen vorschau> aus den Kapitelquellen),
                             java|backend|sql.content.test.ts (Vitest: Laufzeit-Selbsttests + alle Beispiele in Node)
```

Laufzeiten (`java/`, `spring/`, `docker/`, `sql/`) kennen kein React und kein DOM, damit sie auch in
Node laufen (Vitest-Projekt `content`). Die Tür nach außen ist jeweils `index.ts` bzw.
`client.ts`; `contents.ts`/`check.ts` prüfen die Kapitelbeispiele.

## Konventionen

- **Neuer Code auf Englisch** (Bezeichner und Kommentare). Älterer Code ist deutsch benannt
  (`Rahmen`, `ausfuehren`, `laeuft`) - beim Verschieben nicht umbenennen, nur Neues englisch schreiben.
  Texte für Lernende immer zweisprachig (`{ de, en }` bzw. `i18n/messages.ts`).
- **Kapitel = drei Dateien**: `.tsx` (DE), `.en.tsx` (EN), `.code.ts` (Code einmal, Englisch).
  Code, Tests, Lösungen und Übungs-Tipps stehen nur in der `.code.ts`. Eintrag in `course/parts/<teil>.ts`,
  Voraussetzungen in `GRUNDLAGEN` (`kurs.ts`).
  Ablauf: README → "Ein Kapitel hinzufügen".
- **`TryIt`-IDs** sind kursweit eindeutig (Schlüssel für gespeicherten Code und Fortschritt).
- **Neuer Editor-Modus**: in `learning/modes.ts` eintragen, Props in `TryIt.tsx`, Editor als
  `TryIt<Name>.tsx` - `const { code, rahmen } = useEditor(props)`, dann `<Rahmen {...rahmen} art=… ausfuehren=…>`;
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
- **Vorschau-Container** (gerenderter Code der Lernenden) tragen `data-vorschau` - die Prüfungen lassen
  sie aus, denn Beispielcode darf ein eigenes `<main>` oder `<h1>` haben.
- **Test-Attribute**: `data-laeuft` am Rahmen eines laufenden Editors, `data-testergebnis="gruen|rot"`
  an Testergebnissen, `data-uebung` an Übungskarten - daran orientiert sich `e2e:pages`.
- **Tests**: Unit-Tests liegen neben dem Code (`name.test.ts`, mit DOM `name.test.tsx`). Inhaltsprüfungen
  über alle Kapitel heißen `*.content.test.ts`. Neue Logik bekommt einen Test. Komponenten mit
  `renderInApp` aus `src/test/render.tsx` rendern. Die Coverage-Schwellen in `vite.config.ts` nur anheben.
- Git: direkt auf `main` committen und pushen, Branches/PRs nur auf Wunsch.

## Stolperfallen

- **Dev- und Produktions-Build verhalten sich verschieden.** Beispiel: React 19 hat `act` nur im
  Dev-Build - deshalb installiert `testLauf.ts` einen Ersatz, bevor die Testing Library lädt.
  `e2e:content` ohne `--build` sieht solche Fehler nicht; `e2e:pages` und die CI laufen auf dem
  Produktions-Build.
- **Tailwind zur Laufzeit** (`tailwindMotor.ts`) erzeugt CSS für Klassen im Editor-Code. Es liegt in der
  Ebene `vorschau` unter `utilities` (`@layer`-Reihenfolge in `index.css`). Ohne das hat eine Vorschau
  mit `bg-white` die `dark:`-Klassen der Seite überschrieben - die Seitenleiste wurde im Dunkeln hell.
- **Alle Editoren einer Seite teilen sich `window`.** Tests dürfen keine Globalen ersetzen, die
  Vorschauen und andere Beispiele mitbenutzen: `mockFetch` tauscht deshalb nur das `fetch`, das
  `kompilieren` dem getesteten Code als Globale gibt. React-Übungen starten ihre Tests erst,
  wenn die neue Vorschau steht (`TryItReact.ausfuehren`).
- `e2e:content` prüft ohne Vorschau - Wechselwirkungen zwischen Vorschau und Test fallen nur im
  echten Editor auf.
- Eine Demo kann das Farbschema umschalten: Prüfskripte laden jede Seite frisch (`goto` + `reload`),
  statt nur den Hash zu wechseln - sonst misst man im falschen Design.
- axe misst halbtransparente Hintergründe (`dark:bg-black/40`) falsch, wenn sich das Farbschema während
  des Laufs ändert - Kontrastfehler im Dunkeln erst an einer frisch geladenen Seite bestätigen.
- Playground-IDs (`teil: '…'`) stehen in den Dateien unter `course/playground/`, nicht in `index.ts`.
- Kapitel-Imports in `course/parts/*.ts` müssen existieren, sonst bricht Vite ab (beim Anlegen zuerst die Dateien).
- PGlite ist in `optimizeDeps.exclude` - nicht entfernen, sonst lädt die WASM-Datei nicht.
- Git Bash wandelt Argumente wie `/sql-start` in Windows-Pfade um - Routen ohne führenden `/` übergeben.
- Shell-Heredocs verschlucken Backslashes - Dateien mit `\` über Editor-Tools oder Node-Skripte schreiben.
- **Erster Download klein halten:** Was `App.tsx` fest importiert, lädt jede Seite beim Start. Neue
  Seiten und alles mit Editoren oder großen Daten per `lazy()` einbinden (Stand: ~110 kB JS gzip).
