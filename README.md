# Lernpfad JS & React · JS & React Learning Path

Eine interaktive Wissensdatenbank mit **React 19 + TypeScript + Tailwind CSS v4 + Vite**: erst die
JavaScript-Grundlagen, dann React, dann ausführlich die Hooks. In jedem Kapitel gibt es
„Probier's selbst“-Editoren, in denen man Code direkt im Browser ändert und ausführt.

**Alles ist frei erreichbar** - es gibt keine Level und nichts wird freigeschaltet. Den roten Faden
liefern Querverweise („Baut auf“, „Darauf bauen auf“) und ein durchgehendes **ToDo-App-Projekt**, das
mit den Kapiteln wächst.

Der Kurs ist **zweisprachig (Deutsch/Englisch)** - umschaltbar oben rechts. Übersetzt wird der Text
drumherum; **Codebeispiele sind in beiden Sprachen identisch und immer Englisch** (`count`, `todos`, `handleClick`).

*An interactive, bilingual (German/English) course: JavaScript fundamentals, React basics and React
hooks in depth, with runnable editors, auto-graded exercises and quizzes. Switch the language at the top right.*

## Starten

```bash
npm install     # einmalig
npm run dev     # Entwicklungsserver auf http://localhost:5173
npm run build   # Produktionsbuild nach dist/
npm run preview # Produktionsbuild lokal ansehen
npm run lint    # oxlint
```

## Aufbau eines Kapitels

Jedes Kapitel folgt derselben Struktur:

1. **Lernziele** - was man danach kann
2. **Erklärung** mit Codebeispielen
3. **🧪 Probier's selbst** - Editor mit Ausführen-Knopf (JavaScript oder JSX)
4. **👀 Live-Demos** - in TypeScript geschriebene Komponenten aus dem Projekt
5. **🏋️ Übung** - Aufgabe mit automatischen Tests, gestuften Tipps und Musterlösung
6. **✅ Quiz** und **📌 Zusammenfassung**
7. **🏋️ Übungen** (optional, eingeklappt) - gestuft: *Vorhersagen → Fehler finden → Ergänzen → Frei schreiben*,
   einzelne sind als *↺ Wiederholung* eines früheren Kapitels markiert
8. **🧵 Roter Faden** - in welchen Projektschritten das Kapitel angewendet wird und welche Kapitel darauf aufbauen

Im Kopf steht zusätzlich **„Baut auf“** mit Links auf die vorausgesetzten Kapitel.

Der Fortschritt („Kapitel abschließen“) und der Code in den Editoren werden im
`localStorage` gespeichert.

## Der Lernpfad

| Teil | Kapitel |
|------|---------|
| **1 · JavaScript-Grundlagen** | Variablen & Datentypen · Operatoren & Bedingungen · Funktionen & Closures · Arrays · Objekte & Destructuring · Referenzen & Immutability · Asynchrones JS · DOM, Events & Module |
| **2 · React-Grundlagen** | Komponenten & JSX · Props, Listen & Bedingungen · Events & State · State teilen & Datenfluss |
| **3 · React Hooks im Detail** | Hook-Regeln & `useState` · `useEffect` · `useRef` · `useMemo`/`useCallback`/`memo` · `useReducer` · `useContext` · Eigene Hooks · `useTransition`/`useDeferredValue` · `use`, `useActionState`, `useOptimistic`, `useFormStatus` |
| **4 · Praxis & Muster** | Formulare · Daten laden · Komposition & Portale · Fehlerbehandlung · Tailwind CSS · Lokal entwickeln (Vite, DevTools, Debugging) · Abschlussprojekt (Gewohnheiten-Tracker) |
| **5 · Projekt: ToDo-App** | Datenmodell als Funktionen · DOM-Version · Komponenten & Props · State & Events · Datenfluss & Filter · `useReducer` · Speichern mit `useEffect` & eigenem Hook · Fokus mit `useRef` · Context · Validierung · Startdaten laden · **Challenge: von null** |

Zum Nachschlagen gibt es außerdem:

- **🔍 Suche** (`Strg`/`⌘` + `K`) über Kapitel, Stichworte, Glossar und Projektschritte
- **📚 Glossar** mit rund 40 Begriffen (`#/glossar/closure` springt direkt zu einem Eintrag)
- **🧵 Projektübersicht** (`#/projekt`) mit dem Vorwissen jedes Schritts

### Das ToDo-Projekt

Jeder Schritt startet mit der **Lösung des vorherigen** - man kann also überall einsteigen. Alle Schritte
folgen denselben Konventionen, die die Tests prüfen: Eingabefeld „What needs to be done?“, Knopf „Add“,
`<li>` mit Checkbox und Klasse `done`, Löschknopf ✕, Filter All/Open/Done mit `aria-pressed`,
„n open“, „Clear done“ und der `localStorage`-Schlüssel `todos`.

## Projektstruktur

```
src/
  main.tsx                 Einstiegspunkt: createRoot, StrictMode, ThemeProvider
  App.tsx                  Layout, Routing über den URL-Hash, Lernfortschritt, Sprachumschalter
  i18n/
    SpracheContext.tsx     Sprache (de/en) als Context + localStorage, useSprache(), useTexte()
    texte.ts               Alle Oberflächentexte in beiden Sprachen (typgeprüft)
  index.css                Tailwind, Dark Mode, Design-Tokens, Styles für die Editor-Vorschau
  kurs/
    kurs.ts                Kursstruktur als Daten (Teile, Kapitel, Lernziele) + roter Faden (GRUNDLAGEN, STICHWORTE)
    glossar.ts             Glossar-Einträge (zweisprachig, Code Englisch, Kapitel-Links)
    uebungen/              Zusätzliche gestufte Übungen pro Kapitel, pro Teil nachgeladen
      typen.ts             Vorhersage | CodeUebung (fehler, ergaenzen, frei)
    projekt/
      meta.ts              Die 12 Projektschritte: Titel, Vorwissen, Stichworte
      schritte.ts          Einleitung, Anforderungen, Start, Lösung, Tests und Tipps pro Schritt
      ProjektSchritt.tsx   Eine Seite für alle Schritte
    js/ react/ hooks/ praxis/
      Name.tsx             Kapiteltext Deutsch
      Name.en.tsx          Kapiteltext Englisch
      Name.code.ts         Codebeispiele, Tests und Lösungen - gemeinsam für beide Sprachen
    demos/                 Interaktive TypeScript-Demos, von beiden Sprachfassungen genutzt
  lernen/                  Die Lern-Bausteine
    TryIt.tsx              "Probier's selbst"-Editor (JS und React)
    CodeEditor.tsx         Editor: Textarea über eingefärbtem <pre>, mit Autovervollständigung
    vorschlaege.ts         Vorschläge (console.log, Array-Methoden, Hooks, JSX …) mit Erklärungen
    hervorheben.tsx        Mini-Syntax-Highlighter
    jsSandbox.ts           HTML-Dokument für die JS-Sandbox inkl. Testläufer
    reactKompilieren.ts    JSX mit sucrase übersetzen und als Komponente ausführen
    CodeBlock.tsx          Statisches Codebeispiel
    Quiz.tsx               Multiple-Choice-Fragen
    Uebungen.tsx           Einklappbare Übungskarten (Vorhersage oder Editor)
    Text.tsx               Mini-Syntax für Texte aus Daten: `code`, **fett**, [[kapitel-id]]
    reactTests.ts          Mini-Testing-Library für React-Übungen
    quelltext.ts           js`…` Tag für Codebeispiele (roh, automatisch ausgerückt)
  seiten/
    Startseite.tsx         Übersicht, Nachschlagen, Lernpfad, roter Faden, "Weiter lernen"
    KapitelSeite.tsx       Rahmen eines Kapitels: Kopf mit "Baut auf", Inhalt, Übungen, roter Faden
    Glossar.tsx            Alphabetisches Glossar mit Filter und Sprungmarken
    ProjektUebersicht.tsx  Zeitleiste der Projektschritte
  components/
    Ui.tsx                 Abschnitt, P, Demo, Hinweis, Merke, Button, Eingabe, …
    Seitenleiste.tsx       Kursnavigation mit einklappbaren Teilen
    Suche.tsx              Suchdialog (Strg/⌘ + K), komplett per Tastatur bedienbar
    Verweis.tsx            Links auf Kapitel: <Verweis nr="1.6" />, <KapitelChip id="…" />
    ErrorBoundary.tsx      Klassen-Komponente, die Render-Fehler abfängt
  context/
    ThemeContext.tsx       Context + Provider + eigener Hook (Hell/Dunkel)
  hooks/
    useHashRoute.ts        Mini-Router mit useSyncExternalStore
    useLocalStorage.ts     State, der einen Reload überlebt
    useDebounce.ts         Wert verzögert weitergeben
    useToggle.ts           An/Aus in einer Zeile
    useWindowSize.ts       Browser-Event abonnieren und abmelden
    usePrevious.ts         Vorherigen Wert merken
```

## Wie die Editoren funktionieren

**JavaScript** läuft in einem `<iframe sandbox="allow-scripts allow-forms">` als ES-Modul (dadurch geht auch
Top-Level-`await`). Eine kleine Brücke leitet `console.log`, Fehler (mit Zeilennummer) und
Testergebnisse per `postMessage` an die Seite weiter. Bei jedem Ausführen entsteht ein frisches
iframe. Hat eine Übung eine sichtbare Vorschau *und* Tests, laufen die Tests in einem zweiten,
unsichtbaren iframe - so verändern ihre Klicks die Vorschau nicht. Übungen definieren Tests als Ausdrücke
und können gestufte Tipps mitbringen (`tipps: { de: [...], en: [...] }`), die man einzeln aufdeckt:

```tsx
<TryIt
  id="js-beispiel-uebung"
  aufgabe={<p>Schreibe summe(a, b).</p>}
  code={js`function summe(a, b) {}`}
  loesung={js`function summe(a, b) { return a + b }`}
  tests={[{ name: 'summe(2, 3) ist 5', ausdruck: 'summe(2, 3)', erwartet: 5 }]}
/>
```

**React** (`modus="react"`) übersetzt den Code mit [sucrase](https://github.com/alangpierce/sucrase)
(wird erst beim ersten Ausführen nachgeladen) und rendert die Komponente `App` in eine eigene
React-Wurzel. Alle Hooks sind ohne Import verfügbar, `import … from 'react'` funktioniert aber
auch. Timer aus dem Editor-Code werden beim nächsten Lauf automatisch gestoppt.

**Automatische Tests für React-Übungen** (`src/lernen/reactTests.ts`) funktionieren wie eine kleine
Testing Library: Jeder Test rendert `App` frisch in einen unsichtbaren Container und bedient sie. Die
Tests stehen mit zweisprachigen Namen in `Name.code.ts` und laufen, sobald man auf ▶ Ausführen klickt:

```ts
tests: [
  {
    name: { de: 'Send leert das Feld', en: 'Send clears the field' },
    pruefung: js`
      await render()
      await type(field('textarea'), 'Hi')
      await click(button('Send'))
      expect(field('textarea').value).toBe('')
    `,
  },
]
```

Verfügbar sind u. a. `render`, `remount`, `click`, `type`, `check`, `blur`, `press` (Taste), `focused`, `submit`, `wait`, `waitFor`,
`text`, `getByText`, `button`, `field`, `find`, `findAll`, `within`, `expect` (`toBe`, `toEqual`,
`toContain`, `toMatch`, `toHaveLength`, `toBeDisabled` … auch mit `.not`), `logs`, `title`, `code`
(Quelltext) und `mockFetch`. localStorage, `document.title`, `fetch` und `confirm` werden pro Test isoliert.

Einschränkung: Tailwind-Klassen wirken in der Vorschau nur, wenn sie irgendwo im Projekt-Quelltext
vorkommen. Für freies Experimentieren eignet sich `style={{ … }}`.

**Autovervollständigung:** Beim Tippen schlägt der Editor passende Einträge aus
`src/lernen/vorschlaege.ts` vor, dazu Namen, die schon im Code stehen. Jeder Vorschlag hat eine kurze
Erklärung. ↑/↓ wählen, Enter/Tab fügen ein (`$0` in der Vorlage bestimmt die Cursorposition), Esc
schließt, Strg+Leertaste öffnet die Liste von Hand. Nach einem Punkt erscheinen Methoden wie `map` oder `filter`.

## Zweisprachigkeit

- **Oberfläche:** Texte stehen in `src/i18n/texte.ts`. Der Typ des englischen Objekts wird aus dem
  deutschen abgeleitet - fehlt eine Übersetzung, meldet TypeScript einen Fehler. In Komponenten:
  `const t = useTexte()`, dann `t.ausfuehren`.
- **Code ist immer Englisch** und existiert nur einmal: `Name.code.ts` enthält für jedes `TryIt`
  Startcode, Lösung, Vorbereitung und Tests (`beispiele['id']`) sowie die statischen Codeblöcke
  (`codeBloecke`). Nur die angezeigten Testnamen sind zweisprachig (`name: { de, en }`).
- **Kapiteltext:** eine Datei pro Sprache (`Name.tsx`, `Name.en.tsx`), beide exportieren dieselbe
  Komponente und binden den Code so ein: `<TryIt id="…" {...beispiele['…']} />`. Code-Namen im
  deutschen Fließtext (z. B. in `<Code>`) sind ebenfalls die englischen.
- **Demos** (`src/kurs/demos/`) gibt es nur einmal; ihre Texte liegen in einem `TEXTE`-Objekt mit `de` und `en`.
- **Editor:** Die Autovervollständigung fügt englischen Code ein, ihre Erklärungen sowie Test- und
  Fehlermeldungen der Sandbox sind zweisprachig.
- Die Startsprache richtet sich nach der Browsersprache, die Auswahl wird im `localStorage` gespeichert.

## Ein Kapitel hinzufügen

1. `src/kurs/<teil>/MeinKapitel.code.ts` mit den (englischen) Codebeispielen anlegen.
2. `MeinKapitel.tsx` (Deutsch) und `MeinKapitel.en.tsx` (Englisch) mit derselben benannten
   Export-Komponente anlegen, die den Code per `{...beispiele['id']}` einbinden
   (Vorlage: ein beliebiges vorhandenes Kapitel).
3. In `src/kurs/kurs.ts` eintragen - `titel`, `kurz` und `lernziele` jeweils mit `de` und `en`, dazu
   `Komponente: { de: laden(() => import('./<teil>/MeinKapitel'), 'MeinKapitel'), en: laden(() => import('./<teil>/MeinKapitel.en'), 'MeinKapitel') }`.

Navigation, Startseite, Nummerierung und Fortschritt ergeben sich automatisch. Die `id` jedes
`TryIt` muss kursweit eindeutig sein.
