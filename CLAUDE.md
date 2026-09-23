# CLAUDE.md - reactsample

Ein zweisprachiger (DE/EN) Lernpfad im Browser: JavaScript, TypeScript, React, Java, Spring Boot,
Docker und SQL - mit Editoren, die den Code wirklich ausführen, Übungen mit Tests und Quiz.
Die README beschreibt die Inhalte und Editoren ausführlich; diese Datei ist die Karte für die Arbeit
am Code.

**Diese Datei aktuell halten:** Wer Dateien oder Ordner anlegt, verschiebt, umbenennt oder löscht,
passt die Struktur unten im selben Commit an. Ebenso neue Konventionen und Stolperfallen.

## Stack und Befehle

React 19, TypeScript 6, Vite 8 (rolldown), Tailwind v4, oxlint. Kein Router-Framework (Hash-Routing
über `useHashRoute`), keine i18n-Bibliothek, kein Test-Framework - alles Eigenbau im Projekt.

```bash
npm run dev            # Dev-Server (http://localhost:5173)
npm run build          # tsc -b && vite build → dist/
npm run preview        # dist/ ausliefern - zum Prüfen des Produktions-Builds
npm run lint           # oxlint (muss ohne Warnung durchlaufen)
npm run test:inhalte   # alle Beispiele, Übungen, Projektschritte im Browser (Chrome/Edge via playwright-core)
npm run test:inhalte -- praxis-   # nur IDs mit diesem Anfang
npm run test:inhalte -- --build   # dasselbe auf dem Produktions-Build (so läuft es in der CI)
npm run test:seiten    # jede Seite im Produktions-Build: Seitenfehler, alle Musterlösungen grün,
                       # axe-core (hell + dunkel), Handybreite, App-Funktionen (~4 min, 4 Seiten parallel)
npm run test:seiten -- js-        # nur Routen mit diesem Anfang (--parallel=N für mehr/weniger gleichzeitig)
npm run test:java      # Teil 7 in Node (jiti)
npm run test:backend   # Teil 8: Spring-Laufzeit, Docker-Simulator, Beispiele (Node)
npm run test:sql       # Teil 9: echtes PostgreSQL (PGlite) in Node
```

Vor jedem Commit: `npx tsc -b`, `npm run lint`, `npm run build` und die betroffenen `test:*`.
Bei Änderungen an Oberfläche, Editoren oder Laufzeiten zusätzlich `test:seiten` (mit Filter reicht oft).
Die CI (`.github/workflows/ci.yml`) führt bei jedem Push auf `main` alles aus - nach dem Push das
Ergebnis prüfen. `gh` ist auf diesem Rechner nicht installiert, das Repo ist öffentlich - die API geht ohne Token:

```bash
curl -s https://api.github.com/repos/klamest190/reactsample/actions/runs?per_page=1     # Status des letzten Laufs
curl -s https://api.github.com/repos/klamest190/reactsample/actions/runs/<run>/jobs    # Jobs und Schritte
curl -s https://api.github.com/repos/klamest190/reactsample/check-runs/<job>/annotations  # Befunde
```

Die Logs selbst brauchen Admin-Rechte. Deshalb schreiben `test:inhalte` und `test:seiten` ihre Befunde
in der CI als Annotations (`::error::`). `test:seiten` wiederholt Seiten mit Befund einmal einzeln -
was erst dann grün ist, erscheint als Warnung „instabil“.

## Struktur

```
CLAUDE.md README.md          diese Karte / ausführliche Doku (Deutsch)
index.html                   App-Einstieg
selbsttest.html              Einstieg für test:inhalte (src/selbsttest/main.ts)
vite.config.ts               Tailwind, React, optimizeDeps.exclude für PGlite
tsconfig.*.json              app (src), node (vite.config), scripts (Test-Skripte - jiti prüft keine Typen, tsc -b schon)
.github/workflows/ci.yml     CI: Job "code" (lint, build, Node-Tests), Job "browser" (test:inhalte --build, test:seiten)
public/favicon.svg           Bildmarke "Lernpfad"
scripts/
  test-server.mjs            gemeinsam: Dev-Server oder Produktions-Build + Vorschau-Server, Chrome/Edge starten
  inhalte-testen.mjs         test:inhalte - öffnet selbsttest.html, wertet aus (--build: Produktions-Build)
  seiten-testen.mjs          test:seiten - jede Seite im Produktions-Build (siehe oben)
  java-testen.ts             test:java
  backend-test.ts            test:backend (Spring + Docker)
  sql-test.ts                test:sql
src/
  main.tsx App.tsx           Einstieg; Layout, Hash-Routing, Seitenwahl, Sprachumschalter.
                             Im ersten Download: Kopfzeile, Seitenleiste, Startseite. KapitelSeite, Glossar,
                             Projekt, Playground und Suche (mit Glossar-Daten) werden nachgeladen,
                             die KapitelSeite schon im Leerlauf (requestIdleCallback)
  index.css                  Tailwind, Design-Tokens (brand-*), Dark Mode, Vorschau-Styles
  i18n/
    SpracheContext.tsx       Sprache de/en, useSprache(), useTexte(), Typ Zweisprachig
    texte.ts                 alle Oberflächentexte beider Sprachen (typgeprüft gleich)
    localized.ts             localized(text, sprache) für string | Zweisprachig
  components/                App-Oberfläche
    Icon.tsx                 alle SVG-Icons (Strichstil) + Logo + TeilSymbol - keine Emoji in der UI
    teilStil.ts              Icon/Kürzel/Farbe je Kursteil
    scrollFocus.ts           focusableWhenScrolling: Scroll-Container per Tastatur erreichbar, solange sie scrollen
    Ui.tsx                   Abschnitt, P, Hinweis, Merke, Button, KARTE, Aufklapppfeil …
    Seitenleiste.tsx Suche.tsx Gliederung.tsx Verweis.tsx ErrorBoundary.tsx
  context/                   ThemeContext, FortschrittContext (gelöste Übungen, Kapitel), KapitelContext
  hooks/                     useHashRoute, useLocalStorage, useAktiverAbschnitt, useDebounce …
  seiten/                    Startseite, KapitelSeite, Glossar, ProjektUebersicht, Playground
  kurs/                      INHALTE
    kurs.ts                  Reihenfolge der Teile, GRUNDLAGEN (roter Faden, bewusst zentral), alleKapitel
    teile/                   ein Teil pro Datei: Kapitel (id, titel, lernziele, stichworte, lazy Komponente de/en);
                             typen.ts: Teil, Kapitel, laden()
    glossar.ts               Glossar-Einträge
    js/ typescript/ react/ hooks/ praxis/ java/ backend/ sql/
      Name.tsx               Kapiteltext DE  ┐ gleiche benannte Export-Komponente
      Name.en.tsx            Kapiteltext EN  ┘
      Name.code.ts           Code, Tests, Lösungen, Tipps - einmal, auf Englisch
    praxis/businessApp/      Beispiel-App (Seiten, Komponenten, Store) für das BusinessApp-Kapitel
    uebungen/                Zusatzübungen je Teil (index.ts lädt pro Teil nach), typen.ts
    playground/              Vorlagen + Bausteine je Teil, orte.ts, typen.ts
    projekt/                 ToDo-Projekt: meta.ts (Titel, Vorwissen), ProjektSchritt.tsx, schritte/ (Inhalte:
                             code.ts, tests.ts, grundlagen.ts 1-5, hooks.ts 6-11, fortgeschritten.ts 12-14, challenge.ts 15)
    demos/                   interaktive Demo-Komponenten der Kapitel (Diagramme, Terminal, FullStack …)
  lernen/                    LERNBAUSTEINE (Editoren und ihre Laufzeiten im Browser)
    TryIt.tsx                Props aller Modi + Auswahl des Editors nach `modus` (Spring/Docker/SQL lazy)
    Rahmen.tsx               gemeinsam: Rahmen (Kopf, Aufgabe, Editor, Knöpfe, Tipps, Lösung),
                             Konsole, Testergebnisse, Typfehlerliste, Fehlerkasten, Typ Zeile
    TryItJs.tsx              JS/TS im Sandbox-iframe (jsSandbox.ts, tsLauf.ts)
    TryItReact.tsx           JSX/TSX mit Vorschau in eigener React-Wurzel, Tests über reactTests.ts
    TryItTest.tsx            eigene Tests schreiben (Vitest-Nachbau + echte Testing Library, testLauf.ts)
    TryItJava.tsx            Java über src/java (lazy geladen)
    TryItSpring.tsx          Spring über src/spring: Server-Log, HTTP-Client, Beans
    TryItDocker.tsx          Dockerfile- und Compose-Editor über src/docker
    TryItSql.tsx             SQL über src/sql, darüber SqlDatenleiste.tsx (Beispieldaten)
    Werkstatt.tsx            Mehrdatei-Editor (Full-Stack-Kapitel, BusinessApp)
    modi.ts                  Register: MODI, EDITOR_SPRACHEN, ARTEN (Abzeichen), hervorhebungFuerTitel
    useEditor.ts             useEditor(props): gespeicherter Code + Props für <Rahmen>; useOnMount (erster Lauf)
    editorChecks.ts          useDelayedCheck (Prüfen nach Tipp-Pause), lineMarkers (rote Linie je Zeile)
    CodeEditor.tsx           Textarea über eingefärbtem <pre>, Autovervollständigung
    hervorheben.tsx          Syntax-Highlighter (code, konfig, sql)
    vorschlaege.ts backendSuggestions.ts sqlSuggestions.ts   Vorschläge im Editor
    reactKompilieren.ts      sucrase → Komponente; kompilieren(…, extraGlobals) für eigene Globale
    reactTests.ts            Mini-Testing-Library der React-Übungen (render, click, mockFetch …)
    testLauf.ts              Vitest-Nachbau für TryItTest, act-Ersatz für den Produktions-Build
    jsSandbox.ts tsLauf.ts typpruefung.ts(+ .worker.ts) tailwind.ts tailwindMotor.ts
    CodeBlock.tsx Quiz.tsx Uebungen.tsx Text.tsx quelltext.ts einfuegen.ts useSavedCode.ts
  java/                      Java-Interpreter (lexer, parser, pruefer, interpreter, bibliothek) - kein React
  spring/                    Spring Boot auf der Java-Laufzeit - kein React
  docker/                    Docker-Simulator (build, compose, cli) - kein React
  sql/                       PostgreSQL via PGlite im Worker (engine, client, check, dataset) - kein React
  selbsttest/                main.ts (Seite für test:inhalte), pruefen.ts (Prüfung je Modus),
                             results.ts (RuntimeResult, ContentResult, runCases - gemeinsam für alle Laufzeiten)
```

Laufzeiten (`java/`, `spring/`, `docker/`, `sql/`) kennen kein React und kein DOM, damit sie auch in
Node laufen (`test:java`, `test:backend`, `test:sql`). Die Tür nach außen ist jeweils `index.ts` bzw.
`client.ts`; `inhalte.ts`/`contents.ts`/`check.ts` prüfen die Kapitelbeispiele.

## Konventionen

- **Neuer Code auf Englisch** (Bezeichner und Kommentare). Älterer Code ist deutsch benannt
  (`Rahmen`, `ausfuehren`, `laeuft`) - beim Verschieben nicht umbenennen, nur Neues englisch schreiben.
  Texte für Lernende immer zweisprachig (`{ de, en }` bzw. `texte.ts`).
- **Kapitel = drei Dateien**: `.tsx` (DE), `.en.tsx` (EN), `.code.ts` (Code einmal, Englisch).
  Code, Tests, Lösungen und Übungs-Tipps stehen nur in der `.code.ts`. Eintrag in `kurs/teile/<teil>.ts`,
  Voraussetzungen in `GRUNDLAGEN` (`kurs.ts`).
  Ablauf: README → "Ein Kapitel hinzufügen".
- **`TryIt`-IDs** sind kursweit eindeutig (Schlüssel für gespeicherten Code und Fortschritt).
- **Neuer Editor-Modus**: in `lernen/modi.ts` eintragen, Props in `TryIt.tsx`, Editor als
  `TryIt<Name>.tsx` - `const { code, rahmen } = useEditor(props)`, dann `<Rahmen {...rahmen} art=… ausfuehren=…>`;
  Prüfung in `selbsttest/pruefen.ts`. Eine neue Laufzeit liefert `RuntimeResult`/`ContentResult` aus `selbsttest/results.ts`.
- **Keine Emoji in der Oberfläche** - Icons aus `components/Icon.tsx` (fehlende dort ergänzen).
  Kursinhalte (Kapiteltexte, Beispielcode, simulierte Terminalausgaben) dürfen Emoji haben.
- Tailwind-Klassen als ganze Strings (der Scanner findet keine zusammengesetzten).
- Farben/Theme: `brand-*` Tokens, jede Fläche mit `dark:`-Variante.
- **Kontrast (WCAG AA 4,5:1)**, von `test:seiten` geprüft. Text auf Weiß/`slate-50`: mindestens
  `text-slate-500`, auf getönten Flächen (`slate-100`, `brand-50` …) `text-slate-600`; im Dunkeln
  `dark:text-slate-400` - also nie `text-slate-400` für Text im hellen Design und nie `slate-500`/`600`
  ohne `dark:`-Variante. Weiße Schrift erst ab `-600`/`-700`-Hintergrund (`bg-emerald-700`).
- **Barrierefreiheit**: Eingabefelder brauchen ein Label (`<label>` oder `aria-label`), scrollbare
  Bereiche `ref={focusableWhenScrolling}`, Links im Fließtext eine Unterstreichung, Statuspunkte
  `role="img"` + `aria-label`. Nur ein `<main>` (App.tsx) und keine übersprungenen Überschriften.
- **Vorschau-Container** (gerenderter Code der Lernenden) tragen `data-vorschau` - die Prüfungen lassen
  sie aus, denn Beispielcode darf ein eigenes `<main>` oder `<h1>` haben.
- **Test-Attribute**: `data-laeuft` am Rahmen eines laufenden Editors, `data-testergebnis="gruen|rot"`
  an Testergebnissen, `data-uebung` an Übungskarten - daran orientiert sich `test:seiten`.
- Git: direkt auf `main` committen und pushen, Branches/PRs nur auf Wunsch.

## Stolperfallen

- **Dev- und Produktions-Build verhalten sich verschieden.** Beispiel: React 19 hat `act` nur im
  Dev-Build - deshalb installiert `testLauf.ts` einen Ersatz, bevor die Testing Library lädt.
  `test:inhalte` ohne `--build` sieht solche Fehler nicht; `test:seiten` und die CI laufen auf dem
  Produktions-Build.
- **Tailwind zur Laufzeit** (`tailwindMotor.ts`) erzeugt CSS für Klassen im Editor-Code. Es liegt in der
  Ebene `vorschau` unter `utilities` (`@layer`-Reihenfolge in `index.css`). Ohne das hat eine Vorschau
  mit `bg-white` die `dark:`-Klassen der Seite überschrieben - die Seitenleiste wurde im Dunkeln hell.
- **Alle Editoren einer Seite teilen sich `window`.** Tests dürfen keine Globalen ersetzen, die
  Vorschauen und andere Beispiele mitbenutzen: `mockFetch` tauscht deshalb nur das `fetch`, das
  `kompilieren` dem getesteten Code als Globale gibt. React-Übungen starten ihre Tests erst,
  wenn die neue Vorschau steht (`TryItReact.ausfuehren`).
- `test:inhalte` prüft ohne Vorschau - Wechselwirkungen zwischen Vorschau und Test fallen nur im
  echten Editor auf.
- Eine Demo kann das Farbschema umschalten: Prüfskripte laden jede Seite frisch (`goto` + `reload`),
  statt nur den Hash zu wechseln - sonst misst man im falschen Design.
- axe misst halbtransparente Hintergründe (`dark:bg-black/40`) falsch, wenn sich das Farbschema während
  des Laufs ändert - Kontrastfehler im Dunkeln erst an einer frisch geladenen Seite bestätigen.
- Playground-IDs (`teil: '…'`) stehen in den Dateien unter `kurs/playground/`, nicht in `index.ts`.
- Kapitel-Imports in `kurs/teile/*.ts` müssen existieren, sonst bricht Vite ab (beim Anlegen zuerst die Dateien).
- PGlite ist in `optimizeDeps.exclude` - nicht entfernen, sonst lädt die WASM-Datei nicht.
- Git Bash wandelt Argumente wie `/sql-start` in Windows-Pfade um - Routen ohne führenden `/` übergeben.
- Shell-Heredocs verschlucken Backslashes - Dateien mit `\` über Editor-Tools oder Node-Skripte schreiben.
- **Erster Download klein halten:** Was `App.tsx` fest importiert, lädt jede Seite beim Start. Neue
  Seiten und alles mit Editoren oder großen Daten per `lazy()` einbinden (Stand: ~110 kB JS gzip).
