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
npm run test:java      # Teil 7 in Node (jiti)
npm run test:backend   # Teil 8: Spring-Laufzeit, Docker-Simulator, Beispiele (Node)
npm run test:sql       # Teil 9: echtes PostgreSQL (PGlite) in Node
```

Vor jedem Commit: `npx tsc -b`, `npm run lint`, `npm run build` und die betroffenen `test:*`.

## Struktur

```
CLAUDE.md README.md          diese Karte / ausführliche Doku (Deutsch)
index.html                   App-Einstieg
selbsttest.html              Einstieg für test:inhalte (src/selbsttest/main.ts)
vite.config.ts               Tailwind, React, optimizeDeps.exclude für PGlite
public/favicon.svg           Bildmarke "Lernpfad"
scripts/
  inhalte-testen.mjs         test:inhalte - startet Vite, öffnet selbsttest.html, wertet aus
  java-testen.ts             test:java
  backend-test.ts            test:backend (Spring + Docker)
  sql-test.ts                test:sql
src/
  main.tsx App.tsx           Einstieg; Layout, Hash-Routing, Seitenwahl, Sprachumschalter
  index.css                  Tailwind, Design-Tokens (brand-*), Dark Mode, Vorschau-Styles
  i18n/
    SpracheContext.tsx       Sprache de/en, useSprache(), useTexte(), Typ Zweisprachig
    texte.ts                 alle Oberflächentexte beider Sprachen (typgeprüft gleich)
    localized.ts             localized(text, sprache) für string | Zweisprachig
  components/                App-Oberfläche
    Icon.tsx                 alle SVG-Icons (Strichstil) + Logo + TeilSymbol - keine Emoji in der UI
    teilStil.ts              Icon/Kürzel/Farbe je Kursteil
    Ui.tsx                   Abschnitt, P, Hinweis, Merke, Button, KARTE, Aufklapppfeil …
    Seitenleiste.tsx Suche.tsx Gliederung.tsx Verweis.tsx ErrorBoundary.tsx
  context/                   ThemeContext, FortschrittContext (gelöste Übungen, Kapitel), KapitelContext
  hooks/                     useHashRoute, useLocalStorage, useAktiverAbschnitt, useDebounce …
  seiten/                    Startseite, KapitelSeite, Glossar, ProjektUebersicht, Playground
  kurs/                      INHALTE
    kurs.ts                  Teile → Kapitel (id, titel, lernziele, lazy Komponente de/en),
                             GRUNDLAGEN (Voraussetzungen), STICHWORTE (Suche), alleKapitel
    glossar.ts               Glossar-Einträge
    js/ typescript/ react/ hooks/ praxis/ java/ backend/ sql/
      Name.tsx               Kapiteltext DE  ┐ gleiche benannte Export-Komponente
      Name.en.tsx            Kapiteltext EN  ┘
      Name.code.ts           Code, Tests, Lösungen, Tipps - einmal, auf Englisch
    praxis/businessApp/      Beispiel-App (Seiten, Komponenten, Store) für das BusinessApp-Kapitel
    uebungen/                Zusatzübungen je Teil (index.ts lädt pro Teil nach), typen.ts
    playground/              Vorlagen + Bausteine je Teil, orte.ts, typen.ts
    projekt/                 ToDo-Projekt: meta.ts, schritte.ts, schritteFortgeschritten.ts, ProjektSchritt.tsx
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
  selbsttest/                main.ts (Seite für test:inhalte), pruefen.ts (Prüfung je Modus)
```

Laufzeiten (`java/`, `spring/`, `docker/`, `sql/`) kennen kein React und kein DOM, damit sie auch in
Node laufen (`test:java`, `test:backend`, `test:sql`). Die Tür nach außen ist jeweils `index.ts` bzw.
`client.ts`; `inhalte.ts`/`contents.ts`/`check.ts` prüfen die Kapitelbeispiele.

## Konventionen

- **Neuer Code auf Englisch** (Bezeichner und Kommentare). Älterer Code ist deutsch benannt
  (`Rahmen`, `ausfuehren`, `laeuft`) - beim Verschieben nicht umbenennen, nur Neues englisch schreiben.
  Texte für Lernende immer zweisprachig (`{ de, en }` bzw. `texte.ts`).
- **Kapitel = drei Dateien**: `.tsx` (DE), `.en.tsx` (EN), `.code.ts` (Code einmal, Englisch).
  Code, Tests, Lösungen und Übungs-Tipps stehen nur in der `.code.ts`. Eintrag in `kurs.ts`.
  Ablauf: README → "Ein Kapitel hinzufügen".
- **`TryIt`-IDs** sind kursweit eindeutig (Schlüssel für gespeicherten Code und Fortschritt).
- **Neuer Editor-Modus**: in `lernen/modi.ts` eintragen, Props in `TryIt.tsx`, Editor als
  `TryIt<Name>.tsx` (nutzt `Rahmen`), Prüfung in `selbsttest/pruefen.ts`.
- **Keine Emoji in der Oberfläche** - Icons aus `components/Icon.tsx` (fehlende dort ergänzen).
  Kursinhalte (Kapiteltexte, Beispielcode, simulierte Terminalausgaben) dürfen Emoji haben.
- Tailwind-Klassen als ganze Strings (der Scanner findet keine zusammengesetzten).
- Farben/Theme: `brand-*` Tokens, jede Fläche mit `dark:`-Variante.
- Git: direkt auf `main` committen und pushen, Branches/PRs nur auf Wunsch.

## Stolperfallen

- **`test:inhalte` läuft auf dem Dev-Server.** Fehler, die nur im Produktions-Build auftreten, sieht
  es nicht. Beispiel: React 19 hat `act` nur im Dev-Build - deshalb installiert `testLauf.ts` einen
  Ersatz, bevor die Testing Library lädt. Bei Änderungen an Editoren oder Laufzeiten auch
  `npm run build && npm run preview` im Browser prüfen.
- **Alle Editoren einer Seite teilen sich `window`.** Tests dürfen keine Globalen ersetzen, die
  Vorschauen und andere Beispiele mitbenutzen: `mockFetch` tauscht deshalb nur das `fetch`, das
  `kompilieren` dem getesteten Code als Globale gibt. React-Übungen starten ihre Tests erst,
  wenn die neue Vorschau steht (`TryItReact.ausfuehren`).
- `test:inhalte` prüft ohne Vorschau - Wechselwirkungen zwischen Vorschau und Test fallen nur im
  echten Editor auf.
- Kapitel-Imports in `kurs.ts` müssen existieren, sonst bricht Vite ab (beim Anlegen zuerst die Dateien).
- PGlite ist in `optimizeDeps.exclude` - nicht entfernen, sonst lädt die WASM-Datei nicht.
- Git Bash wandelt Argumente wie `/sql-start` in Windows-Pfade um - Routen ohne führenden `/` übergeben.
- Shell-Heredocs verschlucken Backslashes - Dateien mit `\` über Editor-Tools oder Node-Skripte schreiben.
