# Lernpfad JS & React · JS & React Learning Path

Eine interaktive Wissensdatenbank mit **React 19 + TypeScript + Tailwind CSS v4 + Vite**: erst die
JavaScript-Grundlagen, dann TypeScript, dann React und ausführlich die Hooks. In jedem Kapitel gibt es
„Probier's selbst“-Editoren, in denen man Code direkt im Browser ändert und ausführt.

Obendrauf kommt ein **eigenständiger Java-Teil** (Teil 7). Auch dort läuft der Code im Browser -
ausgeführt von einer kleinen Java-Laufzeit, die zum Projekt gehört (`src/java/`). Java, JavaScript
und React sind dabei sauber getrennt; wo was liegt, steht unter [Der Java-Teil](#der-java-teil).

**Alles ist frei erreichbar** - es gibt keine Level und nichts wird freigeschaltet. Den roten Faden
liefern Querverweise („Baut auf“, „Darauf bauen auf“) und ein durchgehendes **ToDo-App-Projekt**, das
mit den Kapiteln wächst.

Der Kurs ist **zweisprachig (Deutsch/Englisch)** - umschaltbar oben rechts. Übersetzt wird der Text
drumherum; **Codebeispiele sind in beiden Sprachen identisch und immer Englisch** (`count`, `todos`, `handleClick`).

*An interactive, bilingual (German/English) course: JavaScript fundamentals, React basics and React
hooks in depth - plus a self-contained Java part with its own runtime in the browser. With runnable
editors, auto-graded exercises and quizzes. Switch the language at the top right.*

## Starten

```bash
npm install     # einmalig
npm run dev     # Entwicklungsserver auf http://localhost:5173
npm run build   # Produktionsbuild nach dist/
npm run preview # Produktionsbuild lokal ansehen
npm run lint    # oxlint
npm run test:inhalte  # Selbsttest: führt alle Beispiele, Übungen und Projektschritte aus
npm run test:java     # nur Teil 7: die Java-Laufzeit und alle Java-Beispiele (ohne Browser)
```

### Selbsttest der Inhalte

`npm run test:inhalte` startet den Dev-Server, öffnet `selbsttest.html` im installierten Chrome
(oder Edge) und prüft mit denselben Funktionen wie die Editoren der App:

- jedes Beispiel läuft ohne Fehler,
- jede Musterlösung besteht alle ihre Tests - und der Startcode besteht sie **nicht**,
- TypeScript-Beispiele haben keine Typfehler,
- selbst geschriebene Tests erkennen jede eingebaute Fehler-Variante (Mutationstest).

Einzelne Teile prüfen: `npm run test:inhalte -- praxis-` (alles, dessen ID so beginnt).

## Aufbau eines Kapitels

Jedes Kapitel folgt derselben Struktur:

1. **Lernziele** - was man danach kann
2. **Erklärung** mit Codebeispielen
3. **🧪 Probier's selbst** - Editor mit Ausführen-Knopf (JavaScript, JSX oder Java)
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
| **2 · TypeScript-Grundlagen** | Warum TypeScript? · Objekttypen & Interfaces · Funktionen typisieren · Unions & Narrowing · Generics · Typ-Operatoren & Utility Types · Klassen, Enums & Module · Fortgeschrittene Typen & Praxis |
| **3 · React-Grundlagen** | Komponenten & JSX · Props, Listen & Bedingungen · Events & State · State teilen & Datenfluss |
| **4 · React Hooks im Detail** | Hook-Regeln & `useState` · `useEffect` · `useRef` · `useMemo`/`useCallback`/`memo` · `useReducer` · `useContext` · Eigene Hooks · `useTransition`/`useDeferredValue` · `use`, `useActionState`, `useOptimistic`, `useFormStatus` |
| **5 · Praxis & Muster** | Formulare · Daten laden · Komposition & Portale · Fehlerbehandlung · Tailwind CSS · Lokal entwickeln (Vite, DevTools, Debugging) · Abschlussprojekt (Gewohnheiten-Tracker) |
| **6 · Projekt: ToDo-App** | Datenmodell als Funktionen · DOM-Version · Komponenten & Props · State & Events · Datenfluss & Filter · `useReducer` · Speichern mit `useEffect` & eigenem Hook · Fokus mit `useRef` · Context · Validierung · Startdaten laden · **Challenge: von null** |
| **7 · Java-Grundlagen** ☕ | Hallo Java · Typen & Variablen · Bedingungen & Schleifen · Methoden · Arrays & Strings · Klassen & Objekte · Vererbung & Interfaces · Collections & Generics · Exceptions · **Java, JavaScript & React im Vergleich** |

Teil 7 ist **eigenständig**: Er setzt keinen der Teile 1-6 voraus und benutzt nichts daraus. Die
Querverweise dorthin sind Vergleiche, keine Voraussetzungen.

Zum Nachschlagen gibt es außerdem:

- **🔍 Suche** (`Strg`/`⌘` + `K`) über Kapitel, Stichworte, Glossar und Projektschritte
- **📚 Glossar** mit rund 50 Begriffen (`#/glossar/closure` springt direkt zu einem Eintrag)
- **🧵 Projektübersicht** (`#/projekt`) mit dem Vorwissen jedes Schritts
- **🛝 Playground** (`#/playground/<teil>`) - siehe [Der Playground](#der-playground)

### Das ToDo-Projekt

Jeder Schritt startet mit der **Lösung des vorherigen** - man kann also überall einsteigen. Alle Schritte
folgen denselben Konventionen, die die Tests prüfen: Eingabefeld „What needs to be done?“, Knopf „Add“,
`<li>` mit Checkbox und Klasse `done`, Löschknopf ✕, Filter All/Open/Done mit `aria-pressed`,
„n open“, „Clear done“ und der `localStorage`-Schlüssel `todos`.

## Projektstruktur

Die Sprachen sind an der Ordnerstruktur ablesbar: ☕ nur Java, 🟨 nur JavaScript, ⚛️ React.

```
src/
  java/                  ☕ Die Java-Laufzeit - reines TypeScript, kein React, kein DOM
    lexer.ts               Zeichen → Token
    parser.ts              Token → Syntaxbaum (ast.ts)
    pruefer.ts             Typprüfung VOR dem Lauf - das, was javac macht
    interpreter.ts         Führt den Syntaxbaum aus - die Rolle der JVM
    bibliothek.ts          System.out, Math, String, ArrayList, HashMap, Exceptions …
    werte.ts               int/double/String/Objekte zur Laufzeit, Java-Ausgabeformat
    index.ts               javaAusfuehren() + javaPruefen() - die einzige Tür nach außen
    selbsttest.ts          Java-Programme mit der Ausgabe, die echtes Java liefern würde
    inhalte.ts             Prüft die Beispiele der Kapitel (von beiden Selbsttests genutzt)
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
    js/ typescript/ react/ hooks/ praxis/
      Name.tsx             Kapiteltext Deutsch
      Name.en.tsx          Kapiteltext Englisch
      Name.code.ts         Codebeispiele, Tests und Lösungen - gemeinsam für beide Sprachen
    java/                ☕ Teil 7, gleicher Aufbau - der Code in den .code.ts ist Java
    demos/                 Interaktive TypeScript-Demos, von beiden Sprachfassungen genutzt
    playground/            Vorlagen und Bausteine der Playgrounds, eine Datei pro Teil (siehe unten)
  lernen/                  Die Lern-Bausteine
    TryIt.tsx              "Probier's selbst"-Editor (JS, React, Test und Java)
    CodeEditor.tsx         Editor: Textarea über eingefärbtem <pre>, mit Autovervollständigung
    einfuegen.ts           Code-Bausteine mit passender Einrückung einfügen (Playground)
    vorschlaege.ts         Vorschläge (console.log, Array-Methoden, Hooks, JSX …) mit Erklärungen
    hervorheben.tsx        Mini-Syntax-Highlighter
    jsSandbox.ts         🟨 HTML-Dokument für die JS-Sandbox inkl. Testläufer
    reactKompilieren.ts  ⚛️  JSX mit sucrase übersetzen und als Komponente ausführen
    CodeBlock.tsx          Statisches Codebeispiel
    Quiz.tsx               Multiple-Choice-Fragen
    Uebungen.tsx           Einklappbare Übungskarten (Vorhersage oder Editor)
    Text.tsx               Mini-Syntax für Texte aus Daten: `code`, **fett**, [[kapitel-id]]
    reactTests.ts          Mini-Testing-Library für React-Übungen
    quelltext.ts           js`…` / java`…` Tag für Codebeispiele (roh, automatisch ausgerückt)
  seiten/
    Startseite.tsx         Übersicht, Nachschlagen, Lernpfad, roter Faden, "Weiter lernen"
    KapitelSeite.tsx       Rahmen eines Kapitels: Kopf mit "Baut auf", Inhalt, Übungen, roter Faden
    Glossar.tsx            Alphabetisches Glossar mit Filter und Sprungmarken
    ProjektUebersicht.tsx  Zeitleiste der Projektschritte
    Playground.tsx         Freies Programmieren mit Vorlagen und Bausteinen, ein Editor pro Teil
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

**TypeScript** (`modus="ts"`, Teil 2) läuft in derselben Sandbox wie JavaScript. Vorher entfernt
sucrase die Typen (wie Vite, die Zeilennummern bleiben gleich), und nebenher prüft der echte
TypeScript-Compiler im Web Worker (`src/lernen/typpruefung.worker.ts`) mit `strict` - Fehler erscheinen
rot unterschlängelt und in einer Liste unter dem Editor, das Programm läuft trotzdem. Übungen können
zusätzlich **Typ-Tests** mitbringen: TypeScript-Code, der hinter den Code der Lernenden gehängt und nur
geprüft wird. Mit `// @ts-expect-error` testet man so auch, dass etwas *verboten* ist
(`src/lernen/tsLauf.ts`):

```ts
typTests: [
  { name: { de: 'isbn ist optional', en: 'isbn is optional' }, code: "const b: Book = { id: 1, title: 'Emma' }" },
  { name: { de: 'id ist readonly', en: 'id is readonly' }, code: 'declare const b: Book\n// @ts-expect-error\nb.id = 5' },
]
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

**Tailwind in den React-Editoren** (`src/lernen/tailwind.ts`, `tailwindMotor.ts`): Das Seiten-CSS enthält
nur Klassen, die irgendwo im Projekt vorkommen. Deshalb läuft für die Vorschau zusätzlich die Tailwind-Engine
selbst im Browser (Paket `tailwindcss`, mit dem Theme und den Brand-Farben aus `index.css`) und erzeugt
CSS für genau die Klassen im Editor-Code - so wirkt jede Klasse. Dieselbe Engine liefert die
Autovervollständigung in `className="…"`, `cn(…)` und `clsx(…)`: alle Klassen und Varianten wie in VS Code,
mit Farbfeld und dem erzeugten CSS (Theme-Werte als Kommentar). Geladen wird sie erst, wenn ein Editor
sie braucht.

**Java** (`modus="java"`) läuft weder im iframe noch im Browser selbst, sondern in der Laufzeit unter
`src/java/` - siehe [Der Java-Teil](#der-java-teil).

**Autovervollständigung:** Beim Tippen schlägt der Editor passende Einträge aus
`src/lernen/vorschlaege.ts` vor, dazu Namen, die schon im Code stehen. Jeder Vorschlag hat eine kurze
Erklärung. ↑/↓ wählen, Enter/Tab fügen ein (`$0` in der Vorlage bestimmt die Cursorposition), Esc
schließt, Strg+Leertaste öffnet die Liste von Hand. Nach einem Punkt erscheinen Methoden wie `map` oder `filter`.
Für Java gibt es eine eigene Liste (`System.out.println`, `int`, `ArrayList` …) statt der JavaScript-Vorschläge.

## Der Playground

Für jeden Teil gibt es einen Editor zum freien Programmieren - ohne Aufgabe und ohne Tests
(`#/playground/javascript`, `/typescript`, `/react`, `/hooks`, `/praxis`, `/projekt`, `/java`). Erreichbar über
die Seitenleiste (ein Eintrag oben, gewechselt wird über die Teil-Leiste auf der Seite), die Startseite und einen Hinweis am Ende
jedes Kapitels. Damit man nicht vor einem leeren Blatt sitzt:

- **Vorlagen** ersetzen den ganzen Code durch ein fertiges kleines Programm (Zähler, FizzBuzz, Bankkonto …).
- **Bausteine** fügen per Klick ein Stück Code ein und führen danach aus. Hat man vorher in den Editor
  geklickt, landet der Baustein am Cursor - sonst an der passenden Stelle: in JavaScript unten, in React
  über `App` / im Rumpf von `App` / im JSX, in Java in `main` / als Methode / als eigene Klasse.
  Komponenten, Methoden und Klassen bringen ihren Aufruf gleich mit (`<Counter />`, `add(2, 3)`), fehlende
  Java- und React-Imports werden oben ergänzt.

Beides läuft über das Textfeld des Editors, **Strg + Z** macht also jeden Klick rückgängig. Der Code wird
wie bei jedem Editor im `localStorage` gespeichert (einmal pro Teil).

| Datei | Aufgabe |
|-------|---------|
| `src/kurs/playground/<teil>.ts` | Vorlagen und Bausteine eines Teils (Code Englisch, Texte zweisprachig) |
| `src/kurs/playground/orte.ts` | Wohin ein Baustein ohne Cursor kommt (`ende`, `oben`, `komponente`, `jsx`, `main`, `methode`, `klasse`) |
| `src/lernen/einfuegen.ts` | Einfügen mit passender Einrückung - von Editor und Selbsttest gemeinsam genutzt |
| `src/seiten/Playground.tsx` | Die Seite: Teil-Auswahl, Vorlagen, Bausteinleiste, Editor |

`npm run test:inhalte -- playground-` prüft jede Vorlage, jeden Baustein an seiner automatischen Stelle
und alle Bausteine eines Teils zusammen (findet doppelte Variablennamen und falsche Einfügestellen).

## Der Java-Teil

Teil 7 ist bewusst so gebaut, dass man auf einen Blick sieht, wo Java aufhört und wo React anfängt.

**Die Grenze.** Die ganze App kennt von `src/java/` genau zwei Funktionen:

```ts
javaAusfuehren(quelltext, { sprache, tests, vorbereitung })  // → { zeilen, ergebnisse, fehler }
javaPruefen(quelltext, sprache)                              // → [{ zeile, text }]  (nur prüfen)
```

Die Laufzeit kennt weder React noch das DOM, und die Komponenten kennen keine Syntaxbäume. Deshalb
läuft derselbe Code im Browser **und** auf der Kommandozeile (`npm run test:java`).

**Die vier Schritte** - dieselben, die `javac` und die JVM gehen:

| Datei | Aufgabe | Entspricht |
|-------|---------|------------|
| `lexer.ts` | Text → Token | Teil von `javac` |
| `parser.ts` | Token → Syntaxbaum | Teil von `javac` |
| `pruefer.ts` | Typen, unbekannte Namen, fehlendes `return` | Teil von `javac` |
| `interpreter.ts` + `bibliothek.ts` | Ausführen | die JVM |

`pruefer.ts` läuft zusätzlich beim Tippen (400 ms nach dem letzten Tastendruck) und erzeugt die roten
Schlangenlinien im Editor - wie eine Java-IDE. Grundregel dort: **im Zweifel nichts melden**; ein
falscher Fehler wäre schlimmer als ein übersehener.

**Was nachgebaut ist,** weil der Kurs es erklärt: int-Überlauf, abschneidende `int`-Division,
`ArithmeticException` bei `/ 0`, Standardwerte von Feldern, der String-Pool (`==` vs. `equals`),
dynamische Bindung, Autoboxing, das Java-Ausgabeformat für `double` (`1.0`, `1.0E10`) und
`[I@1b6d2f1d` für Arrays ohne `Arrays.toString`.

**Was fehlt:** Threads, Dateizugriff, `Scanner` (es gibt keine Tastatureingabe), Pakete über mehrere
Dateien, anonyme und innere Klassen, `try`-with-resources. Die Laufzeit sagt es, wenn etwas davon
vorkommt.

**Übungen in Java** funktionieren wie die JavaScript-Übungen: Die Tests sind Java-**Ausdrücke**, die
nach `main` im Zustand des Programms ausgewertet werden. Sichtbar sind dort die lokalen Variablen von
`main`, alle Methoden und Klassen - und `output`, die gesammelte Konsolenausgabe:

```ts
tests: [
  { name: { de: 'summe ist 5', en: 'sum is 5' }, ausdruck: 'sum', erwartet: 5 },
  { name: { de: 'isPrime(7)', en: 'isPrime(7)' }, ausdruck: 'isPrime(7)', erwartet: true },
  { name: { de: 'Ausgabe', en: 'output' }, ausdruck: 'output.contains("Ada")', erwartet: true },
]
```

Braucht ein Test `try/catch` oder eine Schleife, kommt eine unsichtbare Hilfsklasse in
`vorbereitung` dazu - sie wird hinter den Code der Lernenden gehängt.

**Geprüft wird alles zweifach:** `npm run test:java` (schnell, ohne Browser) und `npm run test:inhalte`
(im Browser, zusammen mit allen anderen Kapiteln). `src/java/selbsttest.ts` enthält dafür über 40
Java-Programme mit genau der Ausgabe, die eine echte JVM liefern würde.

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

Für ein **Java-Kapitel** zusätzlich: im `.code.ts` den Tag `java\`…\`` statt `js\`…\`` verwenden und an
jedes `<TryIt>` ein `modus="java"` schreiben - daran erkennen beide Selbsttests, welche Sprache
ausgeführt werden soll. Beispiele, die absichtlich einen Fehler zeigen, kommen mit Begründung in
`JAVA_ERWARTETE_FEHLER` (`src/java/inhalte.ts`).

Für ein **TypeScript-Kapitel** (Teil 2) an jedes `<TryIt>` ein `modus="ts"` schreiben. Beispiele
müssen dann ohne Typfehler kompilieren; eines, das absichtlich einen Typfehler zeigt, kommt mit
Begründung in `ERWARTETE_FEHLER` (`src/selbsttest/pruefen.ts`).
