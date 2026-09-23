import { js } from '../../../lernen/quelltext'
import { P6_LOESUNG, P7_LOESUNG, P8_LOESUNG, P9_LOESUNG, P10_LOESUNG, P11_LOESUNG } from './code'
import { TEST_HINZUFUEGEN, TEST_CLEAR_DONE, TEST_SPEICHERN, TEST_ALLES_GEHT_NOCH } from './tests'
import { t, type SchrittInhalt } from './typen'

/** Steps 6-11: useReducer, saving, focus, context, validation and loading data. */
export const schritteHooks: Record<string, SchrittInhalt> = {
  'projekt-6-reducer': {
    modus: 'react',
    einleitung: {
      de: 'Hinzufügen, umschalten, löschen - und gleich noch „erledigte entfernen“: Die Logik für die Todos ist über mehrere Handler verteilt. Ein **Reducer** bündelt sie in einer reinen Funktion ([[hooks-usereducer]]).\n\nKomponenten beschreiben dann nur noch, **was passiert ist** (`{ type: \'toggled\', id }`), der Reducer entscheidet, wie der neue State aussieht. Die Funktionen aus Schritt 1 findest du darin fast wörtlich wieder.',
      en: 'Add, toggle, delete - and now “remove completed” too: the todo logic is spread across several handlers. A **reducer** gathers it in one pure function ([[hooks-usereducer]]).\n\nComponents then only describe **what happened** (`{ type: \'toggled\', id }`), and the reducer decides what the new state looks like. You will recognize the functions from step 1 in it almost word for word.',
    },
    anforderungen: {
      de: [
        '`todosReducer(todos, action)` kennt `added`, `toggled`, `deleted` und `clearedDone`',
        '`App` nutzt `useReducer` statt `useState` für die Todos',
        'Knopf „Clear done“ entfernt alle erledigten Todos',
        '„Clear done“ ist deaktiviert, wenn kein Todo erledigt ist',
      ],
      en: [
        '`todosReducer(todos, action)` handles `added`, `toggled`, `deleted` and `clearedDone`',
        '`App` uses `useReducer` instead of `useState` for the todos',
        'A “Clear done” button removes all completed todos',
        '“Clear done” is disabled when no todo is done',
      ],
    },
    loesung: P6_LOESUNG,
    tipps: {
      de: [
        'Grundgerüst: `switch (action.type) { case \'added\': … default: throw new Error(…) }`.',
        '`const [todos, dispatch] = useReducer(todosReducer, initialTodos)`',
        'Die Handler werden zu Einzeilern: `onToggle={(id) => dispatch({ type: \'toggled\', id })}`.',
        '`clearedDone` ist ein `filter`, und `disabled={!todos.some((todo) => todo.done)}`.',
      ],
      en: [
        'Skeleton: `switch (action.type) { case \'added\': … default: throw new Error(…) }`.',
        '`const [todos, dispatch] = useReducer(todosReducer, initialTodos)`',
        'The handlers become one-liners: `onToggle={(id) => dispatch({ type: \'toggled\', id })}`.',
        '`clearedDone` is a `filter`, and `disabled={!todos.some((todo) => todo.done)}`.',
      ],
    },
    tests: [
      TEST_CLEAR_DONE,
      { name: t('„Clear done“ ist ohne erledigte Todos deaktiviert', '“Clear done” is disabled without completed todos'), pruefung: js`
        await render()
        await click(findAll('li input[type="checkbox"]')[0])
        expect(button('Clear done')).toBeDisabled()
      ` },
      TEST_ALLES_GEHT_NOCH,
      { name: t('useReducer mit todosReducer', 'useReducer with todosReducer'), pruefung: js`
        expect(code).toMatch(/function todosReducer/)
        expect(code).toMatch(/useReducer\(/)
        expect(code).not.toMatch(/useState\(\s*initialTodos\s*\)/)
      ` },
    ],
  },

  'projekt-7-speichern': {
    modus: 'react',
    einleitung: {
      de: 'Bisher ist nach einem Neuladen alles weg. Die Todos sollen im `localStorage` landen - das ist eine Synchronisation mit der Außenwelt, also ein Fall für `useEffect` ([[hooks-useeffect]]).\n\nDamit `App` übersichtlich bleibt, verpackst du das in einen **eigenen Hook** `usePersistentReducer` ([[hooks-eigene]]): Er verhält sich wie `useReducer`, liest beim Start aber aus dem Speicher und schreibt jede Änderung zurück. Außerdem zeigt der Tab-Titel die Zahl offener Todos.',
      en: 'So far everything is gone after a reload. The todos should be saved in `localStorage` - that is synchronization with the outside world, so a job for `useEffect` ([[hooks-useeffect]]).\n\nTo keep `App` tidy, you wrap it in a **custom hook** `usePersistentReducer` ([[hooks-eigene]]): it behaves like `useReducer` but reads from storage on start and writes every change back. The tab title also shows the number of open todos.',
    },
    anforderungen: {
      de: [
        '`usePersistentReducer(reducer, key, initialValue)` gibt `[state, dispatch]` zurück',
        'Beim Start werden gespeicherte Todos aus `localStorage` (Schlüssel `todos`) gelesen - nur beim ersten Render',
        'Kaputtes JSON im Speicher führt nicht zum Absturz, sondern zu den Starttodos',
        'Jede Änderung wird gespeichert',
        'Der Tab-Titel lautet „n open · Todos“',
      ],
      en: [
        '`usePersistentReducer(reducer, key, initialValue)` returns `[state, dispatch]`',
        'On start, saved todos are read from `localStorage` (key `todos`) - only on the first render',
        'Broken JSON in storage does not crash the app but falls back to the initial todos',
        'Every change is saved',
        'The tab title reads “n open · Todos”',
      ],
    },
    loesung: P7_LOESUNG,
    tipps: {
      de: [
        '`useReducer` hat ein drittes Argument: eine Init-Funktion, die nur einmal läuft - ideal zum Lesen aus dem Speicher.',
        'Lesen: `JSON.parse(localStorage.getItem(key))` in `try/catch`, bei `null` oder Fehler den Startwert nehmen.',
        'Schreiben: `useEffect(() => { localStorage.setItem(key, JSON.stringify(state)) }, [key, state])`.',
        'Titel: ein zweiter Effekt mit `[openCount]` als Abhängigkeit.',
      ],
      en: [
        '`useReducer` has a third argument: an init function that runs only once - ideal for reading from storage.',
        'Reading: `JSON.parse(localStorage.getItem(key))` inside `try/catch`, use the initial value on `null` or an error.',
        'Writing: `useEffect(() => { localStorage.setItem(key, JSON.stringify(state)) }, [key, state])`.',
        'Title: a second effect with `[openCount]` as its dependency.',
      ],
    },
    tests: [
      TEST_SPEICHERN,
      { name: t('Gespeicherte Todos werden beim Start geladen', 'Saved todos are loaded on start'), pruefung: js`
        localStorage.setItem('todos', JSON.stringify([{ id: 7, text: 'From storage', done: false }]))
        await render()
        expect(findAll('li')).toHaveLength(1)
        expect(text()).toContain('From storage')
      ` },
      { name: t('Kaputtes JSON führt zu den Starttodos', 'Broken JSON falls back to the initial todos'), pruefung: js`
        localStorage.setItem('todos', '{oops')
        await render()
        expect(findAll('li')).toHaveLength(3)
      ` },
      { name: t('Tab-Titel „2 open · Todos“', 'Tab title “2 open · Todos”'), pruefung: js`
        await render()
        await waitFor(() => expect(title()).toBe('2 open · Todos'))
        await click(findAll('li input[type="checkbox"]')[1])
        await waitFor(() => expect(title()).toBe('1 open · Todos'))
      ` },
      { name: t('Eigener Hook usePersistentReducer', 'Custom hook usePersistentReducer'), pruefung: js`
        expect(code).toMatch(/function usePersistentReducer/)
        expect(code).toMatch(/useEffect\(/)
      ` },
    ],
  },

  'projekt-8-fokus': {
    modus: 'react',
    einleitung: {
      de: 'Kleine Details machen eine App angenehm: Nach dem Hinzufügen soll man direkt weitertippen können, und Escape leert das Feld.\n\nDafür brauchst du Zugriff auf das echte DOM-Element - mit einer **Ref** ([[hooks-useref]]). Eine Ref löst beim Ändern kein Neu-Rendern aus und ist genau für solche imperativen Aktionen wie `focus()` gedacht.',
      en: 'Small details make an app pleasant: after adding a todo you should be able to keep typing, and Escape clears the input.\n\nFor that you need access to the real DOM element - with a **ref** ([[hooks-useref]]). Changing a ref does not trigger a re-render, and it is meant for exactly this kind of imperative action like `focus()`.',
    },
    anforderungen: {
      de: [
        'Nach dem Absenden (auch per Klick auf „Add“) hat das Eingabefeld den Fokus',
        'Escape im Eingabefeld leert es',
        'Alles andere funktioniert wie bisher',
      ],
      en: [
        'After submitting (also by clicking “Add”) the input has focus',
        'Escape in the input clears it',
        'Everything else works as before',
      ],
    },
    loesung: P8_LOESUNG,
    tipps: {
      de: [
        '`const inputRef = useRef(null)` in `TodoForm` und `<input ref={inputRef} …>`.',
        'Im Submit-Handler: `inputRef.current.focus()`.',
        '`onKeyDown={(event) => { if (event.key === \'Escape\') setText(\'\') }}`',
      ],
      en: [
        '`const inputRef = useRef(null)` in `TodoForm` and `<input ref={inputRef} …>`.',
        'In the submit handler: `inputRef.current.focus()`.',
        '`onKeyDown={(event) => { if (event.key === \'Escape\') setText(\'\') }}`',
      ],
    },
    tests: [
      { name: t('Nach „Add“ ist das Feld fokussiert', 'After “Add” the input is focused'), pruefung: js`
        await render()
        await type(field('What needs to be done?'), 'Keep typing')
        button('Add').focus()
        await click(button('Add'))
        expect(focused()).toBe(field('What needs to be done?'))
      ` },
      { name: t('Escape leert das Feld', 'Escape clears the input'), pruefung: js`
        await render()
        await type(field('What needs to be done?'), 'Oops')
        await press(field('What needs to be done?'), 'Escape')
        expect(field('What needs to be done?').value).toBe('')
      ` },
      TEST_HINZUFUEGEN,
      { name: t('useRef wird verwendet', 'useRef is used'), pruefung: js`
        expect(code).toMatch(/useRef\(/)
      ` },
    ],
  },

  'projekt-9-context': {
    modus: 'react',
    einleitung: {
      de: '`App` reicht `todos`, `onToggle` und `onDelete` durch `TodoList` an `TodoItem` weiter, obwohl `TodoList` selbst nichts damit macht - **Prop Drilling**.\n\nMit **Context** ([[hooks-usecontext]]) stellt ein `TodosProvider` die Todos und `dispatch` für alle Komponenten darunter bereit. Ein eigener Hook `useTodos` macht den Zugriff bequem und meldet einen klaren Fehler, wenn der Provider fehlt. `useMemo` hält den Context-Wert stabil ([[hooks-usememo]]).',
      en: '`App` passes `todos`, `onToggle` and `onDelete` through `TodoList` to `TodoItem`, although `TodoList` does nothing with them itself - **prop drilling**.\n\nWith **context** ([[hooks-usecontext]]), a `TodosProvider` makes the todos and `dispatch` available to all components below it. A custom hook `useTodos` makes access convenient and reports a clear error when the provider is missing. `useMemo` keeps the context value stable ([[hooks-usememo]]).',
    },
    anforderungen: {
      de: [
        '`TodosContext` mit `createContext`, `TodosProvider` hält die Todos (per `usePersistentReducer`)',
        '`useTodos()` liest den Context und wirft einen Fehler außerhalb des Providers',
        '`TodoForm`, `TodoItem` und der Zähler holen sich Daten und `dispatch` selbst - keine `onToggle`/`onDelete`-Props mehr',
        'Der Context-Wert wird mit `useMemo` erzeugt',
        'Alles funktioniert wie bisher',
      ],
      en: [
        '`TodosContext` via `createContext`, `TodosProvider` holds the todos (via `usePersistentReducer`)',
        '`useTodos()` reads the context and throws an error outside the provider',
        '`TodoForm`, `TodoItem` and the counter get data and `dispatch` themselves - no more `onToggle`/`onDelete` props',
        'The context value is created with `useMemo`',
        'Everything works as before',
      ],
    },
    loesung: P9_LOESUNG,
    tipps: {
      de: [
        '`const TodosContext = createContext(null)` - und im Provider `<TodosContext value={value}>{children}</TodosContext>`.',
        '`function useTodos() { const context = useContext(TodosContext); if (!context) throw new Error(…); return context }`',
        '`const value = useMemo(() => ({ todos, dispatch }), [todos, dispatch])`',
        '`App` wird zu `<TodosProvider><TodoApp /></TodosProvider>`; der Filter kann als lokaler State in `TodoApp` bleiben.',
      ],
      en: [
        '`const TodosContext = createContext(null)` - and in the provider `<TodosContext value={value}>{children}</TodosContext>`.',
        '`function useTodos() { const context = useContext(TodosContext); if (!context) throw new Error(…); return context }`',
        '`const value = useMemo(() => ({ todos, dispatch }), [todos, dispatch])`',
        '`App` becomes `<TodosProvider><TodoApp /></TodosProvider>`; the filter can stay as local state in `TodoApp`.',
      ],
    },
    tests: [
      TEST_ALLES_GEHT_NOCH,
      TEST_CLEAR_DONE,
      TEST_SPEICHERN,
      { name: t('Context, Provider und useTodos', 'Context, provider and useTodos'), pruefung: js`
        expect(code).toMatch(/createContext\(/)
        expect(code).toMatch(/function TodosProvider/)
        expect(code).toMatch(/function useTodos/)
        expect(code).toMatch(/useMemo\(/)
      ` },
      { name: t('Keine Callback-Props mehr durchgereicht', 'No more callback props passed down'), pruefung: js`
        expect(code).not.toMatch(/onToggle=\{/)
        expect(code).not.toMatch(/onDelete=\{/)
      ` },
    ],
  },

  'projekt-10-validierung': {
    modus: 'react',
    einleitung: {
      de: 'Bisher werden leere Eingaben still ignoriert. Besser: eine **verständliche Meldung**. Außerdem sollen doppelte und zu lange Todos abgelehnt werden ([[praxis-formulare]]).\n\nDie Fehlermeldung ist ein **abgeleiteter Wert** aus Eingabe und Todos - sie wird beim Rendern berechnet, nicht gespeichert. Gespeichert wird nur, ob schon einmal abgesendet wurde, damit „Please enter a todo“ nicht schon beim Öffnen erscheint.',
      en: 'So far, empty input is silently ignored. Better: a **clear message**. Duplicate and overly long todos should be rejected too ([[praxis-formulare]]).\n\nThe error message is a **derived value** from the input and the todos - computed while rendering, not stored. The only thing stored is whether the user has tried to submit, so that “Please enter a todo” does not appear right away.',
    },
    anforderungen: {
      de: [
        'Leeres Absenden zeigt „Please enter a todo“ - aber nicht schon beim ersten Anzeigen',
        'Mehr als 80 Zeichen: „At most 80 characters“',
        'Gleicher Text wie ein vorhandenes Todo (Groß-/Kleinschreibung egal): „This todo already exists“',
        'Die Meldung steht in einem Element mit `role="alert"`, das Feld hat dann `aria-invalid="true"`',
        'Ungültige Eingaben fügen nichts hinzu',
      ],
      en: [
        'Submitting empty input shows “Please enter a todo” - but not on first display',
        'More than 80 characters: “At most 80 characters”',
        'Same text as an existing todo (ignoring case): “This todo already exists”',
        'The message is in an element with `role="alert"`, and the input then has `aria-invalid="true"`',
        'Invalid input adds nothing',
      ],
    },
    loesung: P10_LOESUNG,
    tipps: {
      de: [
        'Schreib eine Funktion `validate(text, todos)`, die eine Meldung oder `null` zurückgibt.',
        'In `TodoForm`: `const error = validate(text, todos)` - direkt beim Rendern, kein Effekt nötig.',
        'Ein zusätzlicher State `triedToSubmit` entscheidet, ob die Meldung schon sichtbar sein darf.',
        '`{showError && <p id="todo-error" role="alert">{error}</p>}` und am Feld `aria-invalid={showError}`.',
      ],
      en: [
        'Write a function `validate(text, todos)` that returns a message or `null`.',
        'In `TodoForm`: `const error = validate(text, todos)` - right while rendering, no effect needed.',
        'An extra `triedToSubmit` state decides whether the message may be visible yet.',
        '`{showError && <p id="todo-error" role="alert">{error}</p>}` and on the input `aria-invalid={showError}`.',
      ],
    },
    tests: [
      { name: t('Anfangs keine Fehlermeldung', 'No error message at first'), pruefung: js`
        await render()
        expect(text()).not.toContain('Please enter a todo')
        expect(findAll('[role="alert"]')).toHaveLength(0)
      ` },
      { name: t('Leeres Absenden zeigt „Please enter a todo“', 'Submitting empty input shows “Please enter a todo”'), pruefung: js`
        await render()
        await click(button('Add'))
        expect(find('[role="alert"]').textContent).toContain('Please enter a todo')
        expect(findAll('li')).toHaveLength(3)
      ` },
      { name: t('Doppeltes Todo wird abgelehnt', 'Duplicate todo is rejected'), pruefung: js`
        await render()
        await type(field('What needs to be done?'), 'learn react')
        expect(text()).toContain('This todo already exists')
        await click(button('Add'))
        expect(findAll('li')).toHaveLength(3)
      ` },
      { name: t('Mehr als 80 Zeichen werden abgelehnt', 'More than 80 characters are rejected'), pruefung: js`
        await render()
        await type(field('What needs to be done?'), 'x'.repeat(81))
        expect(text()).toContain('At most 80 characters')
        await type(field('What needs to be done?'), 'x'.repeat(80))
        expect(text()).not.toContain('At most 80 characters')
      ` },
      { name: t('aria-invalid am Feld bei Fehler', 'aria-invalid on the input when invalid'), pruefung: js`
        await render()
        await type(field('What needs to be done?'), 'Learn React')
        expect(field('What needs to be done?').getAttribute('aria-invalid')).toBe('true')
      ` },
      TEST_HINZUFUEGEN,
    ],
  },

  'projekt-11-laden': {
    modus: 'react',
    einleitung: {
      de: 'Zum Schluss kommen die Starttodos nicht mehr aus dem Code, sondern von einer **API** - aber nur, wenn noch nichts gespeichert ist ([[praxis-daten]]).\n\nDer Provider kennt jetzt drei Zustände: laden, Fehler, fertig. Das Laden passiert in einem Effekt; die Cleanup-Funktion bricht die Anfrage per `AbortController` ab, falls die Komponente vorher verschwindet ([[js-async]]). Ein „Retry“-Knopf startet einen neuen Versuch.',
      en: 'Finally, the initial todos no longer come from the code but from an **API** - but only when nothing is stored yet ([[praxis-daten]]).\n\nThe provider now knows three states: loading, error, ready. Loading happens in an effect; the cleanup function aborts the request with an `AbortController` if the component goes away first ([[js-async]]). A “Retry” button starts a new attempt.',
    },
    anforderungen: {
      de: [
        'Ist unter `todos` nichts gespeichert, werden die Todos per `fetch(API_URL)` geladen',
        'Während des Ladens steht „Loading todos …“ da',
        'Bei einem Fehler (z. B. Status 500): „Could not load todos.“ und ein Knopf „Retry“, der erneut lädt',
        'Sind Todos gespeichert, wird **nicht** geladen',
        'Verschwindet die Komponente während des Ladens, wird die Anfrage abgebrochen',
      ],
      en: [
        'If nothing is stored under `todos`, the todos are loaded via `fetch(API_URL)`',
        'While loading, “Loading todos …” is shown',
        'On an error (e.g. status 500): “Could not load todos.” and a “Retry” button that loads again',
        'If todos are stored, nothing is loaded',
        'If the component goes away while loading, the request is aborted',
      ],
    },
    loesung: P11_LOESUNG,
    tipps: {
      de: [
        'Starte den Reducer mit `null` statt `initialTodos` - `null` heißt „noch nichts da“. Eine neue Action `loaded` setzt die geladenen Todos.',
        'Der Effekt: `if (todos !== null) return`, dann `fetch(API_URL, { signal: controller.signal })` und `return () => controller.abort()`.',
        '`response.ok` prüfen - `fetch` wirft bei Status 500 keinen Fehler.',
        'Für „Retry“ reicht ein Zähler-State `attempt` in den Abhängigkeiten des Effekts.',
      ],
      en: [
        'Start the reducer with `null` instead of `initialTodos` - `null` means “nothing there yet”. A new `loaded` action sets the loaded todos.',
        'The effect: `if (todos !== null) return`, then `fetch(API_URL, { signal: controller.signal })` and `return () => controller.abort()`.',
        'Check `response.ok` - `fetch` does not throw on status 500.',
        'For “Retry”, a counter state `attempt` in the effect’s dependencies is enough.',
      ],
    },
    tests: [
      { name: t('Zeigt „Loading todos …“ während des Ladens', 'Shows “Loading todos …” while loading'), pruefung: js`
        mockFetch(() => new Promise(() => {}))
        await render()
        expect(text()).toContain('Loading todos')
      ` },
      { name: t('Lädt Todos von der API', 'Loads todos from the API'), pruefung: js`
        const api = mockFetch(() => [{ id: 1, text: 'From the API', done: false }])
        await render()
        await waitFor(() => expect(text()).toContain('From the API'))
        expect(api.calls.length).toBeGreaterThan(0)
        expect(findAll('li')).toHaveLength(1)
      ` },
      { name: t('Fehler zeigt Meldung, „Retry“ lädt erneut', 'An error shows a message, “Retry” loads again'), pruefung: js`
        let fail = true
        mockFetch(() => (fail ? { status: 500, body: null } : [{ id: 1, text: 'Second try', done: false }]))
        await render()
        await waitFor(() => expect(text()).toContain('Could not load todos'))
        fail = false
        await click(button('Retry'))
        await waitFor(() => expect(text()).toContain('Second try'))
      ` },
      { name: t('Gespeicherte Todos: kein fetch', 'Stored todos: no fetch'), pruefung: js`
        localStorage.setItem('todos', JSON.stringify([{ id: 1, text: 'Stored', done: false }]))
        const api = mockFetch(() => [])
        await render()
        await wait(100)
        expect(api.calls).toHaveLength(0)
        expect(text()).toContain('Stored')
      ` },
      { name: t('Anfrage wird beim Entfernen abgebrochen', 'The request is aborted on unmount'), pruefung: js`
        const api = mockFetch(() => new Promise(() => {}))
        await render()
        await remount()
        expect(api.calls.length).toBeGreaterThan(0)
        expect(api.calls[0].signal?.aborted).toBe(true)
      ` },
    ],
  },
}
