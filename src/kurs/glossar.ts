import type { Zweisprachig } from '../i18n/SpracheContext'
import { js } from '../lernen/quelltext'

/**
 * Glossar: kurze Erklärungen mit Link auf die Kapitel, in denen der Begriff ausführlich vorkommt.
 * Begriffe sind meist englische Fachwörter - so heißen sie auch in Doku und Fehlermeldungen.
 * Texte nutzen die Mini-Syntax von <Text>: `code`, **fett**, [[kapitel-id]].
 */
export type GlossarEintrag = {
  id: string
  begriff: string
  /** Deutscher Zusatz, falls es einen gebräuchlichen gibt. */
  deutsch?: string
  erklaerung: Zweisprachig
  code?: string
  kapitel: string[]
}

export const glossar: GlossarEintrag[] = [
  {
    id: 'action',
    begriff: 'Action',
    erklaerung: {
      de: 'Ein Objekt, das beschreibt, **was passiert ist** - meist mit `type` und weiteren Daten. Ein Reducer entscheidet anhand der Action, wie der neue State aussieht. In React 19 heißen außerdem Funktionen, die ein Formular verarbeiten, „Actions“.',
      en: 'An object describing **what happened** - usually with a `type` and extra data. A reducer uses the action to decide what the new state looks like. In React 19, functions that handle a form are also called “actions”.',
    },
    code: js`dispatch({ type: 'added', text: 'Buy milk' })`,
    kapitel: ['hooks-usereducer', 'hooks-react19'],
  },
  {
    id: 'arrow-function',
    begriff: 'Arrow function',
    deutsch: 'Pfeilfunktion',
    erklaerung: {
      de: 'Kurzschreibweise für Funktionen. Mit nur einem Ausdruck ohne `{}` wird dessen Wert automatisch zurückgegeben. In React ideal für Event-Handler und Array-Methoden.',
      en: 'A short syntax for functions. With a single expression and no `{}`, its value is returned automatically. Ideal for event handlers and array methods in React.',
    },
    code: js`const double = (n) => n * 2`,
    kapitel: ['js-funktionen'],
  },
  {
    id: 'async-await',
    begriff: 'async / await',
    erklaerung: {
      de: '`await` wartet auf ein Promise, ohne den Browser zu blockieren. Es ist nur in `async`-Funktionen erlaubt, die selbst wieder ein Promise zurückgeben. Fehler fängt man mit `try/catch`.',
      en: '`await` waits for a promise without blocking the browser. It is only allowed inside `async` functions, which themselves return a promise. Errors are caught with `try/catch`.',
    },
    code: js`
      async function load() {
        const response = await fetch('/api/todos')
        return response.json()
      }
    `,
    kapitel: ['js-async', 'praxis-daten'],
  },
  {
    id: 'batching',
    begriff: 'Batching',
    erklaerung: {
      de: 'React sammelt mehrere State-Updates aus einem Event und rendert danach **einmal**. Deshalb sieht man den neuen Wert erst beim nächsten Render - nicht direkt nach `setState`.',
      en: 'React collects several state updates from one event and then renders **once**. That is why you only see the new value on the next render - not right after `setState`.',
    },
    kapitel: ['react-state', 'hooks-usestate'],
  },
  {
    id: 'callback',
    begriff: 'Callback',
    erklaerung: {
      de: 'Eine Funktion, die man einer anderen Funktion **übergibt**, damit diese sie später aufruft - z. B. bei `map`, `setTimeout` oder `onClick`. Wichtig: übergeben (`onClick={save}`), nicht aufrufen (`onClick={save()}`).',
      en: 'A function you **pass** to another function so it can call it later - e.g. with `map`, `setTimeout` or `onClick`. Important: pass it (`onClick={save}`), don’t call it (`onClick={save()}`).',
    },
    kapitel: ['js-funktionen', 'react-state'],
  },
  {
    id: 'children',
    begriff: 'children',
    erklaerung: {
      de: 'Die spezielle Prop mit allem, was zwischen öffnendem und schließendem Tag einer Komponente steht. Damit baut man Rahmen wie Karten, Dialoge oder Layouts.',
      en: 'The special prop holding everything between the opening and closing tag of a component. Use it to build wrappers such as cards, dialogs or layouts.',
    },
    code: js`
      function Card({ children }) {
        return <div className="card">{children}</div>
      }
    `,
    kapitel: ['react-props', 'praxis-komposition'],
  },
  {
    id: 'cleanup',
    begriff: 'Cleanup',
    deutsch: 'Aufräumfunktion',
    erklaerung: {
      de: 'Die Funktion, die ein Effekt zurückgibt. React ruft sie auf, bevor der Effekt erneut läuft und wenn die Komponente verschwindet - zum Beenden von Timern, Listenern und Anfragen.',
      en: 'The function an effect returns. React calls it before the effect runs again and when the component goes away - to stop timers, listeners and requests.',
    },
    code: js`
      useEffect(() => {
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
      }, [])
    `,
    kapitel: ['hooks-useeffect'],
  },
  {
    id: 'closure',
    begriff: 'Closure',
    erklaerung: {
      de: 'Eine Funktion „merkt“ sich die Variablen aus dem Bereich, in dem sie erzeugt wurde. Jeder Render einer Komponente erzeugt neue Handler mit den Werten **dieses** Renders - das erklärt veraltete Werte in Effekten und Timern.',
      en: 'A function “remembers” the variables from the scope where it was created. Every render of a component creates new handlers with the values of **that** render - which explains stale values in effects and timers.',
    },
    code: js`
      function makeCounter() {
        let count = 0
        return () => ++count
      }
    `,
    kapitel: ['js-funktionen', 'hooks-useeffect'],
  },
  {
    id: 'component',
    begriff: 'Component',
    deutsch: 'Komponente',
    erklaerung: {
      de: 'Eine Funktion mit großem Anfangsbuchstaben, die JSX zurückgibt. Komponenten sind die Bausteine einer React-Oberfläche und lassen sich beliebig verschachteln und wiederverwenden.',
      en: 'A function with a capitalized name that returns JSX. Components are the building blocks of a React UI and can be nested and reused freely.',
    },
    code: js`
      function Greeting({ name }) {
        return <h1>Hello {name}!</h1>
      }
    `,
    kapitel: ['react-komponenten'],
  },
  {
    id: 'conditional-rendering',
    begriff: 'Conditional rendering',
    deutsch: 'Bedingtes Rendern',
    erklaerung: {
      de: 'Je nach Bedingung etwas anderes anzeigen - mit `? :`, `&&` oder einem frühen `return`. Achtung bei `&&` mit Zahlen: `0 && …` rendert eine 0.',
      en: 'Showing something different depending on a condition - with `? :`, `&&` or an early `return`. Careful with `&&` and numbers: `0 && …` renders a 0.',
    },
    code: js`{todos.length > 0 ? <List todos={todos} /> : <p>Nothing to do</p>}`,
    kapitel: ['react-props', 'js-kontrollfluss'],
  },
  {
    id: 'context',
    begriff: 'Context',
    erklaerung: {
      de: 'Stellt einen Wert für alle Komponenten darunter bereit, ohne ihn per Props durchzureichen. Typisch für Theme, Sprache, angemeldete Nutzer oder App-weiten State.',
      en: 'Provides a value to all components below it without passing it through props. Typical for theme, language, the signed-in user or app-wide state.',
    },
    code: js`
      const ThemeContext = createContext('light')
      // <ThemeContext value="dark">…</ThemeContext>
      const theme = useContext(ThemeContext)
    `,
    kapitel: ['hooks-usecontext'],
  },
  {
    id: 'controlled-component',
    begriff: 'Controlled component',
    deutsch: 'Kontrolliertes Feld',
    erklaerung: {
      de: 'Ein Eingabefeld, dessen Wert aus dem State kommt (`value`) und bei jeder Eingabe über `onChange` zurückgeschrieben wird. So ist der State immer die einzige Quelle der Wahrheit.',
      en: 'An input whose value comes from state (`value`) and is written back via `onChange` on every keystroke. That way, state is always the single source of truth.',
    },
    code: js`<input value={text} onChange={(e) => setText(e.target.value)} />`,
    kapitel: ['praxis-formulare', 'react-state'],
  },
  {
    id: 'dependency-array',
    begriff: 'Dependency array',
    deutsch: 'Abhängigkeiten',
    erklaerung: {
      de: 'Das zweite Argument von `useEffect`, `useMemo` und `useCallback`. React führt die Funktion nur neu aus, wenn sich einer dieser Werte geändert hat. `[]` heißt: nur beim ersten Anzeigen.',
      en: 'The second argument of `useEffect`, `useMemo` and `useCallback`. React only re-runs the function when one of these values has changed. `[]` means: only on first mount.',
    },
    kapitel: ['hooks-useeffect', 'hooks-usememo'],
  },
  {
    id: 'derived-state',
    begriff: 'Derived state',
    deutsch: 'Abgeleiteter Wert',
    erklaerung: {
      de: 'Werte, die sich aus State oder Props **berechnen** lassen, gehören nicht in eigenen State. Einfach beim Rendern ausrechnen - dann können sie nie veralten.',
      en: 'Values that can be **computed** from state or props don’t belong in their own state. Just calculate them while rendering - then they can never get out of sync.',
    },
    code: js`const openCount = todos.filter((todo) => !todo.done).length`,
    kapitel: ['react-datenfluss', 'praxis-formulare'],
  },
  {
    id: 'destructuring',
    begriff: 'Destructuring',
    deutsch: 'Destrukturierung',
    erklaerung: {
      de: 'Werte aus Objekten oder Arrays direkt in Variablen auspacken. In React überall: bei Props (`{ title }`) und bei Hooks (`[value, setValue]`).',
      en: 'Unpacking values from objects or arrays directly into variables. Everywhere in React: for props (`{ title }`) and hooks (`[value, setValue]`).',
    },
    code: js`
      const { title, done = false } = todo
      const [count, setCount] = useState(0)
    `,
    kapitel: ['js-objekte'],
  },
  {
    id: 'dispatch',
    begriff: 'dispatch',
    erklaerung: {
      de: 'Die Funktion aus `useReducer`, mit der man eine Action abschickt. React ruft daraufhin den Reducer auf und rendert mit dem neuen State.',
      en: 'The function from `useReducer` used to send an action. React then calls the reducer and renders with the new state.',
    },
    kapitel: ['hooks-usereducer'],
  },
  {
    id: 'dom',
    begriff: 'DOM',
    erklaerung: {
      de: 'Das Document Object Model: die Baumstruktur der Seite, die der Browser anzeigt. Ohne React ändert man es von Hand (`createElement`, `textContent`), mit React beschreibt man nur das Ergebnis.',
      en: 'The Document Object Model: the tree structure of the page the browser displays. Without React you change it by hand (`createElement`, `textContent`); with React you only describe the result.',
    },
    kapitel: ['js-dom', 'react-komponenten'],
  },
  {
    id: 'effect',
    begriff: 'Effect',
    deutsch: 'Effekt',
    erklaerung: {
      de: 'Code, der **nach** dem Rendern läuft, um die Komponente mit etwas außerhalb von React zu synchronisieren: Timer, Browser-APIs, Netzwerk, localStorage. Für Berechnungen braucht man keinen Effekt.',
      en: 'Code that runs **after** rendering to synchronize the component with something outside React: timers, browser APIs, network, localStorage. You don’t need an effect for calculations.',
    },
    kapitel: ['hooks-useeffect'],
  },
  {
    id: 'error-boundary',
    begriff: 'Error boundary',
    erklaerung: {
      de: 'Eine Komponente, die Fehler beim Rendern ihrer Kinder abfängt und stattdessen eine Ersatzanzeige zeigt. Fehler in Event-Handlern und asynchronem Code fängt sie **nicht**.',
      en: 'A component that catches errors while rendering its children and shows a fallback instead. It does **not** catch errors in event handlers or asynchronous code.',
    },
    kapitel: ['praxis-fehler'],
  },
  {
    id: 'event-handler',
    begriff: 'Event handler',
    erklaerung: {
      de: 'Eine Funktion, die bei einer Benutzeraktion aufgerufen wird - in JSX über Props wie `onClick`, `onChange` oder `onSubmit`. Hier gehören Nebenwirkungen hin, nicht ins Rendern.',
      en: 'A function called on a user action - in JSX via props such as `onClick`, `onChange` or `onSubmit`. Side effects belong here, not in rendering.',
    },
    kapitel: ['react-state', 'js-dom'],
  },
  {
    id: 'event-loop',
    begriff: 'Event loop',
    erklaerung: {
      de: 'Der Mechanismus, mit dem JavaScript nacheinander Aufgaben abarbeitet: erst der aktuelle Code, dann Promise-Reaktionen (Microtasks), dann Timer & Events. Deshalb läuft `setTimeout(fn, 0)` nach einem `then`.',
      en: 'The mechanism JavaScript uses to process tasks one after another: first the current code, then promise reactions (microtasks), then timers & events. That is why `setTimeout(fn, 0)` runs after a `then`.',
    },
    kapitel: ['js-async'],
  },
  {
    id: 'form-action',
    begriff: 'Form action',
    erklaerung: {
      de: 'In React 19 kann `<form action={fn}>` eine Funktion bekommen. Sie erhält die `FormData`, darf asynchron sein und arbeitet mit `useActionState` und `useFormStatus` zusammen.',
      en: 'In React 19, `<form action={fn}>` can take a function. It receives the `FormData`, may be asynchronous and works together with `useActionState` and `useFormStatus`.',
    },
    kapitel: ['hooks-react19'],
  },
  {
    id: 'hook',
    begriff: 'Hook',
    erklaerung: {
      de: 'Eine Funktion, deren Name mit `use` beginnt und die React-Features in Komponenten nutzbar macht. **Regeln:** nur auf oberster Ebene aufrufen (nicht in `if`/Schleifen) und nur in Komponenten oder anderen Hooks.',
      en: 'A function whose name starts with `use` and that makes React features available in components. **Rules:** only call them at the top level (not in `if`/loops) and only in components or other hooks.',
    },
    kapitel: ['hooks-usestate', 'hooks-eigene'],
  },
  {
    id: 'custom-hook',
    begriff: 'Custom hook',
    deutsch: 'Eigener Hook',
    erklaerung: {
      de: 'Eine eigene Funktion `useIrgendwas`, die andere Hooks kombiniert. Sie teilt **Logik**, nicht State: Jede Komponente, die sie aufruft, bekommt ihren eigenen State.',
      en: 'Your own `useSomething` function that combines other hooks. It shares **logic**, not state: every component calling it gets its own state.',
    },
    code: js`
      function useToggle(initial = false) {
        const [on, setOn] = useState(initial)
        return [on, () => setOn((o) => !o)]
      }
    `,
    kapitel: ['hooks-eigene'],
  },
  {
    id: 'immutability',
    begriff: 'Immutability',
    deutsch: 'Unveränderlichkeit',
    erklaerung: {
      de: 'State wird nie verändert, sondern durch eine **neue Kopie** ersetzt. React vergleicht Referenzen - wer ein Array mit `push` ändert, behält dieselbe Referenz und React rendert nicht neu.',
      en: 'State is never changed but replaced with a **new copy**. React compares references - if you change an array with `push`, the reference stays the same and React does not re-render.',
    },
    code: js`setTodos([...todos, newTodo]) // not: todos.push(newTodo)`,
    kapitel: ['js-referenzen', 'hooks-usestate'],
  },
  {
    id: 'jsx',
    begriff: 'JSX',
    erklaerung: {
      de: 'HTML-ähnliche Syntax in JavaScript, die zu Funktionsaufrufen übersetzt wird. Regeln: ein Wurzelelement, alle Tags schließen, `className` statt `class`, JavaScript in `{}`.',
      en: 'HTML-like syntax inside JavaScript that is compiled into function calls. Rules: one root element, close every tag, `className` instead of `class`, JavaScript inside `{}`.',
    },
    kapitel: ['react-komponenten'],
  },
  {
    id: 'key',
    begriff: 'key',
    erklaerung: {
      de: 'Eine stabile, eindeutige Kennung für Listeneinträge (meist die `id`). React ordnet damit Elemente zwischen Renders zu. Der Index ist ungeeignet, wenn sich die Reihenfolge ändert. Ein neuer `key` setzt eine Komponente komplett zurück.',
      en: 'A stable, unique identifier for list items (usually the `id`). React uses it to match elements between renders. The index is unsuitable when the order changes. A new `key` resets a component completely.',
    },
    code: js`{todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}`,
    kapitel: ['react-props', 'hooks-usestate'],
  },
  {
    id: 'lazy-initializer',
    begriff: 'Lazy initializer',
    erklaerung: {
      de: 'Eine Funktion als Startwert von `useState`/`useReducer`. Sie läuft nur beim ersten Render - ideal zum Lesen aus localStorage.',
      en: 'A function as the initial value of `useState`/`useReducer`. It only runs on the first render - ideal for reading from localStorage.',
    },
    code: js`const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('todos')) ?? [])`,
    kapitel: ['hooks-usestate', 'projekt-7-speichern'],
  },
  {
    id: 'lifting-state-up',
    begriff: 'Lifting state up',
    deutsch: 'State anheben',
    erklaerung: {
      de: 'Brauchen zwei Geschwister denselben State, wandert er in den gemeinsamen Elternteil. Der gibt ihn per Props nach unten und Änderungsfunktionen als Callbacks mit.',
      en: 'When two siblings need the same state, it moves up to their common parent. The parent passes it down via props, along with change functions as callbacks.',
    },
    kapitel: ['react-datenfluss', 'projekt-5-datenfluss'],
  },
  {
    id: 'memo',
    begriff: 'memo / useMemo / useCallback',
    deutsch: 'Memoisierung',
    erklaerung: {
      de: 'Ergebnisse merken, statt sie neu zu berechnen. `memo` überspringt Renders bei gleichen Props, `useMemo` merkt sich einen Wert, `useCallback` eine Funktion. Erst messen, dann einsetzen.',
      en: 'Remembering results instead of recomputing them. `memo` skips renders when props are equal, `useMemo` remembers a value, `useCallback` a function. Measure first, then use them.',
    },
    kapitel: ['hooks-usememo'],
  },
  {
    id: 'optimistic-update',
    begriff: 'Optimistic update',
    erklaerung: {
      de: 'Die Oberfläche zeigt das erwartete Ergebnis sofort, während die Anfrage noch läuft. Schlägt sie fehl, springt die Anzeige zurück. In React 19 mit `useOptimistic`.',
      en: 'The UI shows the expected result immediately while the request is still running. If it fails, the display reverts. In React 19 with `useOptimistic`.',
    },
    kapitel: ['hooks-react19'],
  },
  {
    id: 'portal',
    begriff: 'Portal',
    erklaerung: {
      de: 'Rendert Kinder an eine andere Stelle im DOM (z. B. direkt in `body`), während sie im React-Baum bleiben. Gut für Dialoge, Tooltips und Toasts.',
      en: 'Renders children to a different place in the DOM (e.g. directly into `body`) while they stay in the React tree. Good for dialogs, tooltips and toasts.',
    },
    kapitel: ['praxis-komposition'],
  },
  {
    id: 'promise',
    begriff: 'Promise',
    erklaerung: {
      de: 'Ein Objekt für einen Wert, der **später** kommt - oder einen Fehler. Man reagiert mit `then`/`catch` oder wartet mit `await`. `fetch` gibt zum Beispiel ein Promise zurück.',
      en: 'An object for a value that arrives **later** - or an error. You react with `then`/`catch` or wait with `await`. `fetch`, for example, returns a promise.',
    },
    kapitel: ['js-async'],
  },
  {
    id: 'prop-drilling',
    begriff: 'Prop drilling',
    erklaerung: {
      de: 'Props werden durch mehrere Ebenen gereicht, die sie selbst gar nicht brauchen. Abhilfe: Komposition mit `children` oder Context.',
      en: 'Props are passed through several levels that don’t need them themselves. Remedies: composition with `children` or context.',
    },
    kapitel: ['hooks-usecontext', 'praxis-komposition'],
  },
  {
    id: 'props',
    begriff: 'Props',
    erklaerung: {
      de: 'Die Eingabewerte einer Komponente - wie Parameter einer Funktion. Sie fließen von oben nach unten und sind für die Komponente **schreibgeschützt**.',
      en: 'The inputs of a component - like the parameters of a function. They flow from top to bottom and are **read-only** for the component.',
    },
    code: js`<TodoItem todo={todo} onToggle={toggle} />`,
    kapitel: ['react-props'],
  },
  {
    id: 'pure-function',
    begriff: 'Pure function',
    deutsch: 'Reine Funktion',
    erklaerung: {
      de: 'Gleiche Eingabe, gleiche Ausgabe - und keine Nebenwirkungen. Komponenten und Reducer sollen rein sein: Sie berechnen nur, sie ändern nichts außerhalb.',
      en: 'Same input, same output - and no side effects. Components and reducers should be pure: they only compute, they change nothing outside.',
    },
    kapitel: ['hooks-usereducer', 'projekt-1-daten'],
  },
  {
    id: 'race-condition',
    begriff: 'Race condition',
    erklaerung: {
      de: 'Zwei Anfragen laufen gleichzeitig und die **ältere** kommt zuletzt an - dann zeigt die Seite falsche Daten. Lösung: im Cleanup abbrechen (`AbortController`) oder Antworten ignorieren.',
      en: 'Two requests run at the same time and the **older** one arrives last - then the page shows the wrong data. Fix: abort in cleanup (`AbortController`) or ignore stale responses.',
    },
    kapitel: ['praxis-daten', 'hooks-useeffect'],
  },
  {
    id: 'reducer',
    begriff: 'Reducer',
    erklaerung: {
      de: 'Eine reine Funktion `(state, action) => neuerState`. Sie bündelt alle Zustandsänderungen an einer Stelle und lässt sich ohne React testen.',
      en: 'A pure function `(state, action) => newState`. It gathers all state changes in one place and can be tested without React.',
    },
    code: js`
      function todosReducer(todos, action) {
        switch (action.type) {
          case 'added':
            return [...todos, action.todo]
          default:
            return todos
        }
      }
    `,
    kapitel: ['hooks-usereducer', 'projekt-6-reducer'],
  },
  {
    id: 'ref',
    begriff: 'Ref',
    erklaerung: {
      de: 'Ein Behälter `{ current }`, der zwischen Renders erhalten bleibt, dessen Änderung aber **kein** Neu-Rendern auslöst. Für DOM-Elemente (Fokus, Maße), Timer-IDs und vorherige Werte.',
      en: 'A container `{ current }` that persists between renders, but changing it does **not** trigger a re-render. For DOM elements (focus, size), timer IDs and previous values.',
    },
    code: js`
      const inputRef = useRef(null)
      // <input ref={inputRef} />
      inputRef.current.focus()
    `,
    kapitel: ['hooks-useref', 'projekt-8-fokus'],
  },
  {
    id: 'reference',
    begriff: 'Reference',
    deutsch: 'Referenz',
    erklaerung: {
      de: 'Objekte und Arrays werden nicht kopiert, sondern über Referenzen geteilt. Zwei Variablen können auf **dasselbe** Objekt zeigen; `===` vergleicht nur, ob es dasselbe ist.',
      en: 'Objects and arrays are not copied but shared by reference. Two variables can point to the **same** object; `===` only checks whether it is the same one.',
    },
    kapitel: ['js-referenzen'],
  },
  {
    id: 'render',
    begriff: 'Render',
    erklaerung: {
      de: 'React ruft die Komponentenfunktion auf, um zu erfahren, was angezeigt werden soll. Ein Render passiert beim ersten Anzeigen und wenn sich State, Props oder Context ändern - danach aktualisiert React nur die geänderten Teile im DOM.',
      en: 'React calls the component function to find out what to display. A render happens on first display and whenever state, props or context change - then React updates only the changed parts of the DOM.',
    },
    kapitel: ['react-state', 'hooks-usememo'],
  },
  {
    id: 'spread',
    begriff: 'Spread / rest',
    erklaerung: {
      de: '`...` breitet Arrays oder Objekte aus (Spread: Kopie mit Änderungen) oder sammelt Reste ein (Rest: übrige Parameter oder Felder). Das Werkzeug für unveränderliche Updates.',
      en: '`...` spreads arrays or objects out (spread: a copy with changes) or collects what’s left (rest: remaining parameters or fields). The tool for immutable updates.',
    },
    code: js`const updated = { ...todo, done: true }`,
    kapitel: ['js-objekte', 'js-referenzen'],
  },
  {
    id: 'state',
    begriff: 'State',
    deutsch: 'Zustand',
    erklaerung: {
      de: 'Daten, die sich eine Komponente zwischen Renders merkt und deren Änderung die Oberfläche neu zeichnet. Jeder Render sieht einen festen **Schnappschuss** des States.',
      en: 'Data a component remembers between renders; changing it redraws the UI. Every render sees a fixed **snapshot** of the state.',
    },
    code: js`const [todos, setTodos] = useState([])`,
    kapitel: ['react-state', 'hooks-usestate'],
  },
  {
    id: 'stale-closure',
    begriff: 'Stale closure',
    deutsch: 'Veralteter Wert',
    erklaerung: {
      de: 'Ein Timer oder Effekt benutzt Werte aus einem **alten** Render, weil seine Funktion damals entstanden ist. Abhilfe: Abhängigkeiten angeben, funktionale Updates (`setCount(c => c + 1)`) oder `useEffectEvent`.',
      en: 'A timer or effect uses values from an **old** render because its function was created back then. Fix: declare dependencies, use updater functions (`setCount(c => c + 1)`) or `useEffectEvent`.',
    },
    kapitel: ['hooks-useeffect', 'js-funktionen'],
  },
  {
    id: 'suspense',
    begriff: 'Suspense',
    erklaerung: {
      de: 'Zeigt einen Platzhalter (`fallback`), solange etwas darin noch lädt - nachgeladener Code mit `lazy` oder Daten mit `use(promise)`.',
      en: 'Shows a placeholder (`fallback`) while something inside is still loading - code loaded with `lazy` or data read with `use(promise)`.',
    },
    code: js`
      <Suspense fallback={<p>Loading …</p>}>
        <Todos />
      </Suspense>
    `,
    kapitel: ['hooks-nebenlaeufig', 'hooks-react19'],
  },
  {
    id: 'transition',
    begriff: 'Transition',
    erklaerung: {
      de: 'Ein als „nicht dringend“ markiertes Update. React kann es unterbrechen, damit Eingaben flüssig bleiben. Mit `useTransition` bekommt man zusätzlich `isPending`.',
      en: 'An update marked as “not urgent”. React can interrupt it to keep input responsive. `useTransition` also gives you `isPending`.',
    },
    kapitel: ['hooks-nebenlaeufig'],
  },
  {
    id: 'truthy-falsy',
    begriff: 'Truthy / falsy',
    erklaerung: {
      de: 'In Bedingungen gelten `false`, `0`, `""`, `null`, `undefined` und `NaN` als falsch, alles andere als wahr - auch `[]` und `{}`.',
      en: 'In conditions, `false`, `0`, `""`, `null`, `undefined` and `NaN` count as false; everything else counts as true - including `[]` and `{}`.',
    },
    kapitel: ['js-variablen', 'js-kontrollfluss'],
  },
  {
    id: 'vite',
    begriff: 'Vite',
    erklaerung: {
      de: 'Das Werkzeug, mit dem man React-Projekte anlegt, lokal startet (`npm run dev`) und für die Veröffentlichung baut (`npm run build`). Änderungen erscheinen sofort im Browser.',
      en: 'The tool used to create React projects, run them locally (`npm run dev`) and build them for publishing (`npm run build`). Changes show up in the browser instantly.',
    },
    code: js`npm create vite@latest my-todos -- --template react-ts`,
    kapitel: ['praxis-lokal'],
  },
  {
    id: 'typescript',
    begriff: 'TypeScript',
    erklaerung: {
      de: 'JavaScript mit **Typen**. Editor und `tsc` prüfen beim Entwickeln, ob Werte, Props und Funktionsaufrufe zusammenpassen. Beim Übersetzen werden die Typen nur entfernt - im Browser läuft reines JavaScript.',
      en: 'JavaScript with **types**. The editor and `tsc` check during development whether values, props and function calls fit together. Compiling only strips the types - plain JavaScript runs in the browser.',
    },
    code: js`function Greeting({ name }: { name: string }) { … }`,
    kapitel: ['praxis-typescript'],
  },
  {
    id: 'union-type',
    begriff: 'Union type',
    deutsch: 'Vereinigungstyp',
    erklaerung: {
      de: 'Ein Typ, der **eines von mehreren** sein darf, geschrieben mit `|`. Besonders nützlich mit festen Werten, z. B. `\'open\' | \'done\'`. Nach einer Prüfung weiß TypeScript, welcher Fall vorliegt (Narrowing).',
      en: 'A type that may be **one of several**, written with `|`. Especially useful with fixed values such as `\'open\' | \'done\'`. After a check TypeScript knows which case applies (narrowing).',
    },
    code: js`type Filter = 'all' | 'open' | 'done'`,
    kapitel: ['praxis-typescript'],
  },
  {
    id: 'discriminated-union',
    begriff: 'Discriminated union',
    erklaerung: {
      de: 'Eine Union aus Objekttypen, die ein gemeinsames Feld mit festem Wert haben (meist `type`). Im `switch` über dieses Feld kennt TypeScript in jedem Fall die passenden Felder - ideal für Reducer-Actions.',
      en: 'A union of object types that share a field with a fixed value (usually `type`). In a `switch` over that field TypeScript knows the matching fields in every case - ideal for reducer actions.',
    },
    code: js`type Action = { type: 'added'; text: string } | { type: 'removed'; id: number }`,
    kapitel: ['praxis-typescript', 'hooks-usereducer'],
  },
  {
    id: 'generics',
    begriff: 'Generics',
    deutsch: 'Typparameter',
    erklaerung: {
      de: 'Ein Platzhalter für einen Typ, z. B. `<T>`, der erst bei der Verwendung festgelegt wird. So bleibt eine Funktion oder Komponente für beliebige Daten typsicher - `useState<User | null>` nutzt genau das.',
      en: 'A placeholder for a type, e.g. `<T>`, that is only fixed when used. That keeps a function or component type-safe for any data - `useState<User | null>` uses exactly this.',
    },
    code: js`function first<T>(items: T[]): T | undefined { return items[0] }`,
    kapitel: ['praxis-typescript'],
  },
  {
    id: 'routing',
    begriff: 'Routing',
    erklaerung: {
      de: 'Die **Adresse** (URL) bestimmt, welche Seite bzw. welche Komponenten angezeigt werden - ohne die Seite neu zu laden. In React meist mit **React Router**: `<Routes>`, `<Route>`, `<Link>`.',
      en: 'The **address** (URL) decides which page or components are shown - without reloading the page. In React usually done with **React Router**: `<Routes>`, `<Route>`, `<Link>`.',
    },
    code: js`<Route path="/products/:id" element={<ProductDetail />} />`,
    kapitel: ['praxis-routing'],
  },
  {
    id: 'url-parameter',
    begriff: 'URL parameter',
    deutsch: 'dynamisches Segment',
    erklaerung: {
      de: 'Ein Platzhalter im Pfad einer Route, z. B. `:id` in `/products/:id`. Die Komponente liest den Wert mit `useParams()`. Nicht zu verwechseln mit Suchparametern (`?q=…`), die `useSearchParams()` liefert.',
      en: 'A placeholder in a route path, e.g. `:id` in `/products/:id`. The component reads the value with `useParams()`. Not to be confused with search params (`?q=…`), which `useSearchParams()` returns.',
    },
    code: js`const { id } = useParams()`,
    kapitel: ['praxis-routing'],
  },
  {
    id: 'try-catch',
    begriff: 'try / catch',
    erklaerung: {
      de: 'Fängt Fehler ab, die im `try`-Block **geworfen** werden, statt das Programm abbrechen zu lassen. `finally` läuft in jedem Fall. Nur fangen, was man sinnvoll behandeln kann.',
      en: 'Catches errors **thrown** inside the `try` block instead of letting the program stop. `finally` runs in every case. Only catch what you can handle sensibly.',
    },
    code: js`try { JSON.parse(text) } catch (error) { console.log(error.message) }`,
    kapitel: ['js-fehler', 'js-async', 'praxis-fehler'],
  },
  {
    id: 'class',
    begriff: 'Class',
    deutsch: 'Klasse',
    erklaerung: {
      de: 'Eine Vorlage für Objekte mit gleichen Feldern und Methoden; `new` erzeugt eine Instanz. Moderne React-Komponenten sind Funktionen - Klassen brauchst du noch für Error Boundaries und eigene Fehlertypen.',
      en: 'A template for objects with the same fields and methods; `new` creates an instance. Modern React components are functions - you still need classes for error boundaries and custom error types.',
    },
    code: js`class Counter { count = 0; increment() { this.count++ } }`,
    kapitel: ['js-fehler'],
  },
  {
    id: 'this',
    begriff: 'this',
    erklaerung: {
      de: 'In einer Methode das Objekt **vor dem Punkt** beim Aufruf. Wird die Methode weitergegeben, geht es verloren. Arrow Functions haben kein eigenes `this`.',
      en: 'Inside a method, the object **in front of the dot** at call time. Passing the method on loses it. Arrow functions have no `this` of their own.',
    },
    code: js`timer.tick() // this === timer`,
    kapitel: ['js-fehler'],
  },
  {
    id: 'map-set',
    begriff: 'Map / Set',
    erklaerung: {
      de: '`Set`: jeder Wert höchstens einmal. `Map`: Schlüssel → Wert, Schlüssel dürfen alles sein. Im React-State immer eine Kopie anlegen: `new Set(prev).add(x)`.',
      en: '`Set`: each value at most once. `Map`: key → value, keys can be anything. In React state always make a copy: `new Set(prev).add(x)`.',
    },
    code: js`const unique = [...new Set([1, 2, 2, 3])] // [1, 2, 3]`,
    kapitel: ['js-objekte'],
  },
  {
    id: 'mock',
    begriff: 'Mock',
    deutsch: 'Attrappe',
    erklaerung: {
      de: 'Ein Ersatz für etwas Echtes im Test - eine Callback-Prop, `fetch`, ein Modul. `vi.fn()` merkt sich jeden Aufruf und liefert, was man vorgibt.',
      en: 'A stand-in for something real in a test - a callback prop, `fetch`, a module. `vi.fn()` records every call and returns what you specify.',
    },
    code: js`const onSave = vi.fn(); expect(onSave).toHaveBeenCalledWith('Ada')`,
    kapitel: ['praxis-testen'],
  },
  {
    id: 'testing-library',
    begriff: 'Testing Library',
    erklaerung: {
      de: 'Rendert Komponenten im Test und findet Elemente wie Menschen: über **Rolle** und sichtbaren Namen (`getByRole`). `getBy` muss finden, `queryBy` darf leer sein, `findBy` wartet.',
      en: 'Renders components in tests and finds elements the way people do: by **role** and visible name (`getByRole`). `getBy` must find, `queryBy` may be empty, `findBy` waits.',
    },
    code: js`screen.getByRole('button', { name: 'Save' })`,
    kapitel: ['praxis-testen', 'praxis-barrierefreiheit'],
  },
  {
    id: 'accessibility',
    begriff: 'Accessibility (a11y)',
    deutsch: 'Barrierefreiheit',
    erklaerung: {
      de: 'Alle können die App benutzen - mit Screenreader, nur per Tastatur, vergrößert. Grundlage ist **semantisches HTML**: `button`, `label`, Überschriften, `alt`-Texte.',
      en: 'Everyone can use the app - with a screen reader, keyboard only, zoomed in. The foundation is **semantic HTML**: `button`, `label`, headings, `alt` texts.',
    },
    code: js`<button aria-label="Close">✕</button>`,
    kapitel: ['praxis-barrierefreiheit'],
  },
  {
    id: 'aria',
    begriff: 'ARIA',
    erklaerung: {
      de: 'Attribute wie `aria-label`, `aria-describedby` oder `role`, die Screenreadern zusätzliche Informationen geben. Erste Regel: kein ARIA, wenn es ein passendes HTML-Element gibt.',
      en: 'Attributes like `aria-label`, `aria-describedby` or `role` that give screen readers extra information. First rule: no ARIA if there is a suitable HTML element.',
    },
    code: js`<p role="alert">Please enter a valid e-mail.</p>`,
    kapitel: ['praxis-barrierefreiheit'],
  },
  {
    id: 'code-splitting',
    begriff: 'Code splitting',
    erklaerung: {
      de: 'Teile der App werden erst geladen, wenn sie gebraucht werden. In React mit `lazy()` und `<Suspense>` - der Bundler legt den Code in eine eigene Datei.',
      en: 'Parts of the app are only loaded when they are needed. In React with `lazy()` and `<Suspense>` - the bundler puts the code into a separate file.',
    },
    code: js`const Chart = lazy(() => import('./Chart'))`,
    kapitel: ['hooks-nebenlaeufig', 'praxis-routing'],
  },
  {
    id: 'react-compiler',
    begriff: 'React Compiler',
    erklaerung: {
      de: 'Ein Build-Werkzeug, das Komponenten automatisch memoisiert - `useMemo`, `useCallback` und `memo` von Hand braucht man damit kaum noch. Setzt voraus, dass die Regeln von React eingehalten werden.',
      en: 'A build tool that memoizes components automatically - you hardly need `useMemo`, `useCallback` and `memo` by hand anymore. Requires that the rules of React are followed.',
    },
    kapitel: ['hooks-usememo'],
  },
]
