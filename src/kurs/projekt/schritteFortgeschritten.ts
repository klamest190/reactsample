import type { Zweisprachig } from '../../i18n/SpracheContext'
import { js } from '../../lernen/quelltext'
import type { SchrittInhalt } from './schritte'

/**
 * Die drei Schritte vor der Challenge: TypeScript, Routing und eigene Tests.
 *
 * Wie in schritte.ts entsteht jede Lösung aus Bausteinen - so teilen sich die Schritte
 * die unveränderten Teile, und geänderte Teile stehen genau einmal da.
 */

const t = (de: string, en: string): Zweisprachig => ({ de, en })

// --- Bausteine der TypeScript-Fassung ---------------------------------------------------

const TYPEN = js`
  // The data model - written down once, used everywhere.
  type Todo = { id: number; text: string; done: boolean }
  type Filter = 'all' | 'open' | 'done'

  // Every action with exactly the fields it needs (discriminated union).
  type Action =
    | { type: 'loaded'; todos: Todo[] }
    | { type: 'added'; text: string }
    | { type: 'toggled'; id: number }
    | { type: 'deleted'; id: number }
    | { type: 'clearedDone' }

  const API_URL =
    'data:application/json,' +
    encodeURIComponent(JSON.stringify([
      { id: 1, text: 'Learn JavaScript', done: true },
      { id: 2, text: 'Learn React', done: false },
      { id: 3, text: 'Load todos from an API', done: false },
    ]))
`

const REDUCER_TS = js`
  // null = not loaded yet. TypeScript forces us to say what happens in that case.
  function todosReducer(todos: Todo[] | null, action: Action): Todo[] {
    if (action.type === 'loaded') return action.todos
    if (todos === null) return []

    switch (action.type) {
      case 'added': {
        const id = todos.length === 0 ? 1 : Math.max(...todos.map((todo) => todo.id)) + 1
        return [...todos, { id, text: action.text, done: false }]
      }
      case 'toggled':
        return todos.map((todo) => (todo.id === action.id ? { ...todo, done: !todo.done } : todo))
      case 'deleted':
        return todos.filter((todo) => todo.id !== action.id)
      case 'clearedDone':
        return todos.filter((todo) => !todo.done)
      default: {
        // Forgot a case? Then action is not "never" here and this line fails.
        const missing: never = action
        throw new Error('Unknown action: ' + JSON.stringify(missing))
      }
    }
  }
`

const HOOK_TS = js`
  // Generic: works with any state and any action type.
  function usePersistentReducer<S, A>(reducer: (state: S, action: A) => S, key: string, initialValue: S) {
    const [state, dispatch] = useReducer(reducer, key, (storageKey: string): S => {
      try {
        const stored = localStorage.getItem(storageKey)
        return stored ? (JSON.parse(stored) as S) : initialValue
      } catch {
        return initialValue
      }
    })

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state))
    }, [key, state])

    return [state, dispatch] as const
  }
`

const CONTEXT_TS = js`
  type TodosContextValue = { todos: Todo[]; dispatch: Dispatch<Action> }

  // null as the start value: outside the provider there is no sensible value.
  const TodosContext = createContext<TodosContextValue | null>(null)

  function TodosProvider({ children }: { children: ReactNode }) {
    const [todos, dispatch] = usePersistentReducer<Todo[] | null, Action>(todosReducer, 'todos', null)
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(todos === null ? 'loading' : 'ready')
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
      if (todos !== null) return
      const controller = new AbortController()

      async function load() {
        try {
          const response = await fetch(API_URL, { signal: controller.signal })
          if (!response.ok) throw new Error('HTTP ' + response.status)
          // Data from outside is unknown - here we promise that it has the shape Todo[].
          dispatch({ type: 'loaded', todos: (await response.json()) as Todo[] })
          setStatus('ready')
        } catch (error) {
          // In TypeScript the error in catch is unknown - check it before using it.
          if (error instanceof Error && error.name !== 'AbortError') setStatus('error')
        }
      }

      load()
      return () => controller.abort()
    }, [todos, attempt, dispatch])

    const value = useMemo(() => ({ todos: todos ?? [], dispatch }), [todos, dispatch])

    if (status === 'error') {
      return (
        <p role="alert">
          Could not load todos.{' '}
          <button
            onClick={() => {
              setStatus('loading')
              setAttempt((a) => a + 1)
            }}
          >
            Retry
          </button>
        </p>
      )
    }
    if (todos === null) return <p>Loading todos …</p>

    return <TodosContext value={value}>{children}</TodosContext>
  }

  // After the null check the return type is TodosContextValue - callers need no check.
  function useTodos(): TodosContextValue {
    const context = useContext(TodosContext)
    if (!context) throw new Error('useTodos must be used inside <TodosProvider>')
    return context
  }
`

/** Das Todo als Zeile - in Schritt 13 wird der Text zum Link auf die Detailseite. */
const item = (text: string) => js`
  function TodoItem({ todo }: { todo: Todo }) {
    const { dispatch } = useTodos()
    return (
      <li className={todo.done ? 'done' : ''}>
        <input type="checkbox" checked={todo.done} onChange={() => dispatch({ type: 'toggled', id: todo.id })} />
        __TEXT__
        <button onClick={() => dispatch({ type: 'deleted', id: todo.id })} aria-label={'Delete ' + todo.text}>
          ✕
        </button>
      </li>
    )
  }

  function TodoList({ filter }: { filter: Filter }) {
    const { todos } = useTodos()
    const visibleTodos = todos.filter((todo) => (filter === 'all' ? true : filter === 'done' ? todo.done : !todo.done))
    return (
      <ul>
        {visibleTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    )
  }

  function Footer() {
    const { todos, dispatch } = useTodos()
    const openCount = todos.filter((todo) => !todo.done).length
    const hasDone = todos.some((todo) => todo.done)

    useEffect(() => {
      document.title = openCount + ' open · Todos'
    }, [openCount])

    return (
      <p>
        {openCount} open{' '}
        <button onClick={() => dispatch({ type: 'clearedDone' })} disabled={!hasDone}>
          Clear done
        </button>
      </p>
    )
  }
`.replace('__TEXT__', text)

const FILTER_BUTTONS_TS = js`
  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'done', label: 'Done' },
  ]

  function FilterButtons({ filter, onChange }: { filter: Filter; onChange: (filter: Filter) => void }) {
    return (
      <div>
        {FILTERS.map((f) => (
          <button key={f.value} aria-pressed={filter === f.value} onClick={() => onChange(f.value)}>
            {f.label}
          </button>
        ))}
      </div>
    )
  }
`

const FORM_TS = js`
  const MAX_LENGTH = 80

  function validate(text: string, todos: Todo[]): string | null {
    const trimmed = text.trim()
    if (trimmed === '') return 'Please enter a todo'
    if (trimmed.length > MAX_LENGTH) return 'At most ' + MAX_LENGTH + ' characters'
    if (todos.some((todo) => todo.text.toLowerCase() === trimmed.toLowerCase())) return 'This todo already exists'
    return null
  }

  function TodoForm() {
    const { todos, dispatch } = useTodos()
    const [text, setText] = useState('')
    const [triedToSubmit, setTriedToSubmit] = useState(false)
    // The element type goes in the angle brackets, the start value is null.
    const inputRef = useRef<HTMLInputElement>(null)

    const error = validate(text, todos)
    const showError = error !== null && (triedToSubmit || text !== '')

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault()
      inputRef.current?.focus() // ?. because current can be null
      if (error) {
        setTriedToSubmit(true)
        return
      }
      dispatch({ type: 'added', text: text.trim() })
      setText('')
      setTriedToSubmit(false)
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (event.key === 'Escape') setText('')
    }

    return (
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)} // inline: TypeScript knows the type of e
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          aria-invalid={showError}
          aria-describedby={showError ? 'todo-error' : undefined}
        />
        <button>Add</button>
        {showError && (
          <p id="todo-error" role="alert">
            {error}
          </p>
        )}
      </form>
    )
  }
`

const APP_TS = js`
  function TodoApp() {
    const [filter, setFilter] = useState<Filter>('all')
    return (
      <main>
        <h1>Todos</h1>
        <TodoForm />
        <FilterButtons filter={filter} onChange={setFilter} />
        <TodoList filter={filter} />
        <Footer />
      </main>
    )
  }

  function App() {
    return (
      <TodosProvider>
        <TodoApp />
      </TodosProvider>
    )
  }
`

const IMPORT_TS = "import type { Dispatch, KeyboardEvent, ReactNode, SubmitEvent } from 'react'"

const P12_LOESUNG = [
  IMPORT_TS,
  TYPEN,
  REDUCER_TS,
  HOOK_TS,
  CONTEXT_TS,
  item('<span>{todo.text}</span>'),
  FILTER_BUTTONS_TS,
  FORM_TS,
  APP_TS,
].join('\n\n')

// --- Bausteine der Routing-Fassung -------------------------------------------------------

const FILTER_LINKS = js`
  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'done', label: 'Done' },
  ]

  // The filter is no longer state - it is part of the address.
  // NavLink marks the active link with aria-current="page" all by itself.
  function FilterLinks() {
    return (
      <div>
        {FILTERS.map((f) => (
          <NavLink key={f.value} to={f.value === 'all' ? '/' : '/' + f.value} end>
            {f.label}
          </NavLink>
        ))}
      </div>
    )
  }
`

const APP_ROUTER = js`
  function TodoDetail() {
    // The :id from the address is always a string - todo.id is a number.
    const { id } = useParams()
    const { todos } = useTodos()
    const todo = todos.find((t) => t.id === Number(id))

    if (!todo) {
      return (
        <p role="alert">
          Todo not found. <Link to="/">Back to the list</Link>
        </p>
      )
    }
    return (
      <article>
        <h1>{todo.text}</h1>
        <p>{todo.done ? 'Done' : 'Open'}</p>
        <Link to="/">← Back to the list</Link>
      </article>
    )
  }

  // Layout route: the frame stays, only the list at <Outlet /> changes.
  function TodoApp() {
    return (
      <main>
        <h1>Todos</h1>
        <TodoForm />
        <FilterLinks />
        <Outlet />
        <Footer />
      </main>
    )
  }

  function App() {
    // In a project this is <BrowserRouter> - the preview must not change this page's address.
    return (
      <MemoryRouter>
        <TodosProvider>
          <Routes>
            <Route path="/" element={<TodoApp />}>
              <Route index element={<TodoList filter="all" />} />
              <Route path="open" element={<TodoList filter="open" />} />
              <Route path="done" element={<TodoList filter="done" />} />
            </Route>
            <Route path="/todo/:id" element={<TodoDetail />} />
            <Route path="*" element={<p>404 - page not found</p>} />
          </Routes>
        </TodosProvider>
      </MemoryRouter>
    )
  }
`

const IMPORT_ROUTER = "import { Link, MemoryRouter, NavLink, Outlet, Route, Routes, useParams } from 'react-router'"

const P13_LOESUNG = [
  IMPORT_TS,
  IMPORT_ROUTER,
  TYPEN,
  REDUCER_TS,
  HOOK_TS,
  CONTEXT_TS,
  item("{/* Every todo has its own address now */}\n      <Link to={'/todo/' + todo.id}>{todo.text}</Link>"),
  FILTER_LINKS,
  FORM_TS,
  APP_ROUTER,
].join('\n\n')

// --- Schritt 14: eigene Tests ------------------------------------------------------------

/** Die App aus Schritt 13 als importierbare Datei - die Tests der Lernenden laufen dagegen. */
const TODO_APP_MODUL = P13_LOESUNG.replace('function App() {', 'export function App() {')

const TEST_KOPF = js`
  import { describe, test, expect, beforeEach } from 'vitest'
  import { render, screen } from '@testing-library/react'
  import userEvent from '@testing-library/user-event'
  import { App } from './TodoApp'

  const TODOS = [
    { id: 1, text: 'Learn JavaScript', done: true },
    { id: 2, text: 'Learn React', done: false },
  ]

  beforeEach(() => {
    // Seed the app: then it loads nothing from the API and every test starts the same way.
    localStorage.setItem('todos', JSON.stringify(TODOS))
  })
`

const P14_START = [
  TEST_KOPF,
  js`
    describe('Todo app', () => {
      test('shows the stored todos', () => {
        render(<App />)
        expect(screen.getAllByRole('listitem')).toHaveLength(2)
      })

      // TODO: more tests - see the task above
    })
  `,
].join('\n')

const P14_LOESUNG = [
  TEST_KOPF,
  js`
    describe('Todo app', () => {
      test('shows the stored todos', () => {
        render(<App />)
        expect(screen.getAllByRole('listitem')).toHaveLength(2)
      })

      test('adds a todo and clears the input', async () => {
        const user = userEvent.setup()
        render(<App />)
        const input = screen.getByPlaceholderText('What needs to be done?')
        await user.type(input, 'Walk the dog')
        await user.click(screen.getByRole('button', { name: 'Add' }))
        expect(screen.getAllByRole('listitem')).toHaveLength(3)
        expect(input).toHaveValue('')
      })

      test('refuses empty input and says why', async () => {
        const user = userEvent.setup()
        render(<App />)
        await user.type(screen.getByPlaceholderText('What needs to be done?'), '   ')
        await user.click(screen.getByRole('button', { name: 'Add' }))
        expect(screen.getAllByRole('listitem')).toHaveLength(2)
        expect(screen.getByRole('alert')).toHaveTextContent('Please enter a todo')
      })

      test('the checkbox toggles both ways and updates the count', async () => {
        const user = userEvent.setup()
        render(<App />)
        const boxes = screen.getAllByRole('checkbox')
        await user.click(boxes[1])
        expect(screen.getByText('0 open', { exact: false })).toBeInTheDocument()
        await user.click(boxes[1])
        expect(boxes[1]).not.toBeChecked()
        expect(screen.getByText('1 open', { exact: false })).toBeInTheDocument()
      })

      test('deletes exactly the chosen todo', async () => {
        const user = userEvent.setup()
        render(<App />)
        await user.click(screen.getByRole('button', { name: 'Delete Learn React' }))
        expect(screen.getAllByRole('listitem')).toHaveLength(1)
        expect(screen.queryByText('Learn React')).not.toBeInTheDocument()
      })

      test('“Clear done” only removes the completed todos', async () => {
        const user = userEvent.setup()
        render(<App />)
        await user.click(screen.getByRole('button', { name: 'Clear done' }))
        expect(screen.getAllByRole('listitem')).toHaveLength(1)
        expect(screen.getByText('Learn React')).toBeInTheDocument()
      })
    })
  `,
].join('\n')

/** Baut eine Fassung mit genau einem Fehler - und meldet sich, wenn die Stelle nicht mehr eindeutig ist. */
function mutante(suchen: string, ersetzen: string) {
  const treffer = TODO_APP_MODUL.split(suchen).length - 1
  if (treffer !== 1) throw new Error(`Mutante passt ${treffer}-mal: ${suchen}`)
  return [{ pfad: 'TodoApp.tsx', code: TODO_APP_MODUL.replace(suchen, ersetzen) }]
}

const VARIANTEN = [
  {
    name: t('leere Eingaben landen in der Liste', 'empty input ends up in the list'),
    dateien: mutante("if (trimmed === '') return 'Please enter a todo'", "if (text === '') return 'Please enter a todo'"),
  },
  {
    name: t('die Checkbox schaltet nur an, nie aus', 'the checkbox only turns on, never off'),
    dateien: mutante('{ ...todo, done: !todo.done }', '{ ...todo, done: true }'),
  },
  {
    name: t('„Clear done“ löscht alles', '“Clear done” deletes everything'),
    dateien: mutante('return todos.filter((todo) => !todo.done)', 'return []'),
  },
  {
    name: t('die Anzahl zählt auch erledigte Todos', 'the count includes completed todos'),
    dateien: mutante('const openCount = todos.filter((todo) => !todo.done).length', 'const openCount = todos.length'),
  },
  {
    name: t('Löschen entfernt das falsche Todo', 'deleting removes the wrong todo'),
    dateien: mutante('return todos.filter((todo) => todo.id !== action.id)', 'return todos.filter((todo, index) => index !== 0)'),
  },
]

// --- Die Schritte -------------------------------------------------------------------------

export const schritteFortgeschritten: Record<string, SchrittInhalt> = {
  'projekt-12-typescript': {
    modus: 'react',
    typen: true,
    einleitung: {
      de: 'Die App ist fertig - jetzt kommt der Umzug nach **TypeScript** ([[praxis-typescript]]). Genau so läuft es in echten Projekten: Der Code bleibt, die Typen kommen dazu.\n\nDie Typprüfung unter dem Editor zeigt dir, was noch fehlt. Fang beim Datenmodell an (`Todo`, `Filter`, `Action`) - danach ergibt sich vieles von selbst, weil TypeScript die Typen weiterreicht.',
      en: 'The app is finished - now it moves to **TypeScript** ([[praxis-typescript]]). This is exactly how it goes in real projects: the code stays, the types are added.\n\nThe type check below the editor shows what is still missing. Start with the data model (`Todo`, `Filter`, `Action`) - much of the rest follows by itself, because TypeScript passes the types on.',
    },
    anforderungen: {
      de: [
        '`type Todo`, `type Filter` (`all | open | done`) und `type Action` als Union aller Actions',
        'Der Reducer ist typisiert; der `default`-Zweig prüft mit `never`, dass kein Fall fehlt',
        '`usePersistentReducer` bleibt allgemein nutzbar - mit Typparametern statt `any`',
        'Der Context hat einen Typ und startet mit `null`; `useTodos()` liefert danach einen Wert ohne `null`',
        'Props, `useState`, `useRef` und der Submit-Handler sind typisiert',
        'Die Typprüfung meldet keinen Fehler - das Verhalten bleibt gleich',
      ],
      en: [
        '`type Todo`, `type Filter` (`all | open | done`) and `type Action` as a union of all actions',
        'The reducer is typed; the `default` branch uses `never` to check that no case is missing',
        '`usePersistentReducer` stays reusable - with type parameters instead of `any`',
        'The context has a type and starts as `null`; `useTodos()` then returns a value without `null`',
        'Props, `useState`, `useRef` and the submit handler are typed',
        'The type check reports no errors - the behavior stays the same',
      ],
    },
    loesung: P12_LOESUNG,
    tipps: {
      de: [
        'Zuerst nur die Typen oben hinschreiben: `Todo`, `Filter`, `Action`. Danach `todosReducer(todos: Todo[] | null, action: Action): Todo[]`.',
        'Der Reducer startet mit `null` - fang die beiden Sonderfälle oben ab: `if (action.type === "loaded") return action.todos` und `if (todos === null) return []`.',
        '`usePersistentReducer<S, A>(reducer: (state: S, action: A) => S, key: string, initialValue: S)` - und am Ende `return [state, dispatch] as const`.',
        '`createContext<TodosContextValue | null>(null)`, `useRef<HTMLInputElement>(null)` (dann `current?.focus()`), `useState<Filter>("all")`.',
        'Im `catch` ist der Fehler `unknown`: `if (error instanceof Error && error.name !== "AbortError")`.',
      ],
      en: [
        'First just write the types at the top: `Todo`, `Filter`, `Action`. Then `todosReducer(todos: Todo[] | null, action: Action): Todo[]`.',
        'The reducer starts with `null` - handle both special cases first: `if (action.type === "loaded") return action.todos` and `if (todos === null) return []`.',
        '`usePersistentReducer<S, A>(reducer: (state: S, action: A) => S, key: string, initialValue: S)` - and at the end `return [state, dispatch] as const`.',
        '`createContext<TodosContextValue | null>(null)`, `useRef<HTMLInputElement>(null)` (then `current?.focus()`), `useState<Filter>("all")`.',
        'In `catch` the error is `unknown`: `if (error instanceof Error && error.name !== "AbortError")`.',
      ],
    },
    tests: [
      {
        name: t('Die App funktioniert unverändert', 'The app still works as before'),
        pruefung: js`
          mockFetch(() => [
            { id: 1, text: 'Learn JavaScript', done: true },
            { id: 2, text: 'Learn React', done: false },
            { id: 3, text: 'Build a todo app', done: false },
          ])
          await render()
          await waitFor(() => expect(findAll('li')).toHaveLength(3))
          await type(field('What needs to be done?'), 'Add types')
          await click(button('Add'))
          expect(findAll('li')).toHaveLength(4)
          await click(findAll('li input[type="checkbox"]')[1])
          expect(text()).toContain('2 open')
          await click(button('Done'))
          expect(findAll('li')).toHaveLength(2)
        `,
      },
      {
        name: t('Es gibt die Typen Todo, Filter und Action', 'There are types Todo, Filter and Action'),
        pruefung: js`
          expect(code).toMatch(/(type|interface)\s+Todo\b/)
          expect(code).toMatch(/type\s+Filter\s*=/)
          expect(code).toMatch(/(type|interface)\s+Action\b/)
        `,
      },
      {
        name: t('Der Reducer prüft mit never auf vergessene Actions', 'The reducer uses never to catch forgotten actions'),
        pruefung: js`
          expect(code).toMatch(/:\s*never\b/)
        `,
      },
      {
        name: t('Context und Ref sind typisiert', 'Context and ref are typed'),
        pruefung: js`
          expect(code).toMatch(/createContext<[^>]+>/)
          expect(code).toMatch(/useRef<HTMLInputElement>/)
        `,
      },
    ],
  },

  'projekt-13-routing': {
    modus: 'react',
    typen: true,
    einleitung: {
      de: 'Bisher lebt der Filter im State - niemand kann eine gefilterte Ansicht verschicken. Mit **React Router** ([[praxis-routing]]) bekommt jede Ansicht eine eigene Adresse: `/`, `/open`, `/done` und `/todo/2`.\n\nIm Editor steht `MemoryRouter` statt `BrowserRouter`, weil die Vorschau Teil dieser Seite ist. Alles andere ist wie im echten Projekt.',
      en: 'So far the filter lives in state - nobody can share a filtered view. With **React Router** ([[praxis-routing]]) every view gets its own address: `/`, `/open`, `/done` and `/todo/2`.\n\nThe editor uses `MemoryRouter` instead of `BrowserRouter` because the preview is part of this page. Everything else is like a real project.',
    },
    anforderungen: {
      de: [
        '`<MemoryRouter>` umschließt die App, die Routen stehen in `<Routes>`',
        'Die Filter sind `NavLink`s auf `/`, `/open` und `/done` - der aktive bekommt automatisch `aria-current="page"`',
        'Die Liste ist eine verschachtelte Route: `TodoApp` rendert Formular, Filter, `<Outlet />` und Fußzeile',
        'Der Text eines Todos ist ein Link auf `/todo/<id>`; die Detailseite zeigt Text, Status und „← Back to the list“',
        'Gibt es das Todo nicht, steht dort „Todo not found“; alle anderen Adressen landen bei `path="*"`',
      ],
      en: [
        '`<MemoryRouter>` wraps the app, the routes live in `<Routes>`',
        'The filters are `NavLink`s to `/`, `/open` and `/done` - the active one gets `aria-current="page"` automatically',
        'The list is a nested route: `TodoApp` renders the form, the filters, `<Outlet />` and the footer',
        'A todo’s text is a link to `/todo/<id>`; the detail page shows text, status and “← Back to the list”',
        'If the todo does not exist it says “Todo not found”; every other address ends up at `path="*"`',
      ],
    },
    loesung: P13_LOESUNG,
    tipps: {
      de: [
        'Import: `import { Link, MemoryRouter, NavLink, Outlet, Route, Routes, useParams } from "react-router"`.',
        'Aus `FilterButtons` wird `FilterLinks`: `<NavLink to={f.value === "all" ? "/" : "/" + f.value} end>`. Der Filter-State in `TodoApp` entfällt.',
        'Verschachtelte Routen: `<Route path="/" element={<TodoApp />}>` mit `<Route index element={<TodoList filter="all" />} />` und je einer Route für `open` und `done`.',
        '`useParams()` liefert Strings: `todos.find((t) => t.id === Number(id))`.',
      ],
      en: [
        'Import: `import { Link, MemoryRouter, NavLink, Outlet, Route, Routes, useParams } from "react-router"`.',
        '`FilterButtons` becomes `FilterLinks`: `<NavLink to={f.value === "all" ? "/" : "/" + f.value} end>`. The filter state in `TodoApp` goes away.',
        'Nested routes: `<Route path="/" element={<TodoApp />}>` with `<Route index element={<TodoList filter="all" />} />` and one route each for `open` and `done`.',
        '`useParams()` returns strings: `todos.find((t) => t.id === Number(id))`.',
      ],
    },
    tests: [
      {
        name: t('Die Filter-Links zeigen die passenden Todos', 'The filter links show the matching todos'),
        pruefung: js`
          localStorage.setItem('todos', JSON.stringify([
            { id: 1, text: 'Learn JavaScript', done: true },
            { id: 2, text: 'Learn React', done: false },
            { id: 3, text: 'Build a todo app', done: false },
          ]))
          await render()
          expect(findAll('li')).toHaveLength(3)
          await click(getByText('Open'))
          await wait(50)
          expect(findAll('li')).toHaveLength(2)
          await click(getByText('Done'))
          await wait(50)
          expect(findAll('li')).toHaveLength(1)
          await click(getByText('All'))
          await wait(50)
          expect(findAll('li')).toHaveLength(3)
        `,
      },
      {
        name: t('Der aktive Filter hat aria-current="page"', 'The active filter has aria-current="page"'),
        pruefung: js`
          localStorage.setItem('todos', JSON.stringify([{ id: 1, text: 'Learn React', done: false }]))
          await render()
          await click(getByText('Open'))
          await wait(50)
          expect(getByText('Open').getAttribute('aria-current')).toBe('page')
          expect(getByText('All').getAttribute('aria-current')).toBe(null)
        `,
      },
      {
        name: t('Ein Todo öffnet seine Detailseite und führt zurück', 'A todo opens its detail page and leads back'),
        pruefung: js`
          localStorage.setItem('todos', JSON.stringify([
            { id: 1, text: 'Learn JavaScript', done: true },
            { id: 2, text: 'Learn React', done: false },
          ]))
          await render()
          await click(getByText('Learn React'))
          await wait(50)
          expect(findAll('li')).toHaveLength(0)
          expect(text()).toContain('Open')
          await click(getByText(/Back to the list/))
          await wait(50)
          expect(findAll('li')).toHaveLength(2)
        `,
      },
      {
        name: t('Hinzufügen funktioniert weiterhin', 'Adding still works'),
        pruefung: js`
          localStorage.setItem('todos', JSON.stringify([{ id: 1, text: 'Learn React', done: false }]))
          await render()
          await type(field('What needs to be done?'), 'Add routing')
          await click(button('Add'))
          expect(findAll('li')).toHaveLength(2)
          expect(text()).toContain('Add routing')
        `,
      },
      {
        name: t('Es gibt eine Route für unbekannte Adressen', 'There is a route for unknown addresses'),
        pruefung: js`
          expect(code).toMatch(/path="\*"/)
          expect(code).toMatch(/useParams\(\)/)
        `,
      },
    ],
  },

  'projekt-14-testen': {
    modus: 'test',
    dateien: [{ pfad: 'TodoApp.tsx', code: TODO_APP_MODUL }],
    varianten: VARIANTEN,
    einleitung: {
      de: 'Zum Abschluss drehst du die Richtung um: Die App steht (oben, nur lesbar) - du schreibst die **Tests** ([[praxis-testen]]).\n\nOb deine Tests gut sind, prüft ein Mutationstest: Sie laufen zusätzlich gegen fünf Fassungen der App, in die je ein typischer Fehler eingebaut ist. Jede davon muss mindestens einen deiner Tests rot machen.',
      en: 'To finish, you turn things around: the app is done (above, read-only) - you write the **tests** ([[praxis-testen]]).\n\nWhether your tests are good is checked by a mutation test: they also run against five versions of the app, each with one typical bug built in. Every one of them has to turn at least one of your tests red.',
    },
    anforderungen: {
      de: [
        'Die gespeicherten Todos werden angezeigt (das macht der Startcode schon vor)',
        'Hinzufügen: Nach „Add“ steht das Todo in der Liste und das Feld ist wieder leer',
        'Leere Eingaben: nichts wird hinzugefügt, und es erscheint eine Meldung',
        'Die Checkbox schaltet in **beide** Richtungen um, und die Anzahl „n open“ stimmt',
        'Der ✕-Knopf löscht genau ein Todo - das richtige',
        '„Clear done“ entfernt nur die erledigten Todos',
      ],
      en: [
        'The stored todos are shown (the starting code already does this)',
        'Adding: after “Add” the todo is in the list and the input is empty again',
        'Empty input: nothing is added and a message appears',
        'The checkbox toggles **both** ways and the count “n open” is correct',
        'The ✕ button deletes exactly one todo - the right one',
        '“Clear done” only removes the completed todos',
      ],
    },
    start: P14_START,
    loesung: P14_LOESUNG,
    tipps: {
      de: [
        'Jeder Test beginnt mit `const user = userEvent.setup()` und `render(<App />)`.',
        'Elemente über ihre Rolle finden: `screen.getByRole("button", { name: "Add" })`, `screen.getAllByRole("listitem")`, `screen.getAllByRole("checkbox")`.',
        'Die Meldung bei leerer Eingabe hat `role="alert"`: `expect(screen.getByRole("alert")).toHaveTextContent("Please enter a todo")`.',
        'Umschalten in beide Richtungen: zweimal klicken und danach `expect(box).not.toBeChecked()` prüfen - sonst fällt „schaltet nur an“ nicht auf.',
        'Der Löschknopf hat einen Namen: `screen.getByRole("button", { name: "Delete Learn React" })`.',
      ],
      en: [
        'Every test starts with `const user = userEvent.setup()` and `render(<App />)`.',
        'Find elements by their role: `screen.getByRole("button", { name: "Add" })`, `screen.getAllByRole("listitem")`, `screen.getAllByRole("checkbox")`.',
        'The message for empty input has `role="alert"`: `expect(screen.getByRole("alert")).toHaveTextContent("Please enter a todo")`.',
        'Toggle both ways: click twice and then check `expect(box).not.toBeChecked()` - otherwise “only turns on” slips through.',
        'The delete button has a name: `screen.getByRole("button", { name: "Delete Learn React" })`.',
      ],
    },
  },
}
