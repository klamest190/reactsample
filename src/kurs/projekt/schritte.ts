import type { Zweisprachig } from '../../i18n/SpracheContext'
import type { ReactTest, Test } from '../../lernen/jsSandbox'
import { js } from '../../lernen/quelltext'

/**
 * Inhalte der Projektschritte (Metadaten siehe meta.ts).
 *
 * Jeder Schritt startet mit der Lösung des vorherigen - deshalb stehen die Lösungen
 * als Konstanten oben und werden als `start` weiterverwendet. So kann man bei jedem
 * Schritt einsteigen, ohne die vorherigen gemacht zu haben.
 *
 * Konventionen der App (von den Tests geprüft, deshalb überall gleich):
 *   Eingabefeld mit placeholder "What needs to be done?", Knopf "Add",
 *   <li> pro Todo mit Checkbox, Klasse "done" und Löschknopf "✕",
 *   Filterknöpfe All / Open / Done mit aria-pressed, Text "n open", Knopf "Clear done",
 *   localStorage-Schlüssel "todos".
 */

type Basis = {
  einleitung: Zweisprachig
  anforderungen: Zweisprachig<string[]>
  /** Startcode; fehlt er, startet der Editor mit der Lösung des vorherigen Schritts. */
  start?: string
  loesung: string
  tipps: Zweisprachig<string[]>
}

export type SchrittInhalt =
  | (Basis & { modus: 'js'; vorschau?: boolean; tests: Test[] })
  | (Basis & { modus: 'react'; tests: ReactTest[] })

// --- Schritt 1: reine Funktionen ------------------------------------------------------

const FUNKTIONEN = js`
  function addTodo(todos, text) {
    const trimmed = text.trim()
    if (trimmed === '') return todos
    const id = todos.length === 0 ? 1 : Math.max(...todos.map((todo) => todo.id)) + 1
    return [...todos, { id, text: trimmed, done: false }]
  }

  function toggleTodo(todos, id) {
    return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
  }

  function removeTodo(todos, id) {
    return todos.filter((todo) => todo.id !== id)
  }

  function filterTodos(todos, filter) {
    if (filter === 'open') return todos.filter((todo) => !todo.done)
    if (filter === 'done') return todos.filter((todo) => todo.done)
    return todos
  }

  function countOpen(todos) {
    return todos.filter((todo) => !todo.done).length
  }
`

const P1_START = js`
  // A todo looks like this: { id: 1, text: 'Learn JavaScript', done: false }

  function addTodo(todos, text) {
    // Return a NEW array with the todo added (trimmed text, next id, done: false).
    // Empty text: return the todos unchanged.
  }

  function toggleTodo(todos, id) {
    // Return a new array in which the todo with this id has the opposite "done" value.
  }

  function removeTodo(todos, id) {
    // Return a new array without the todo with this id.
  }

  function filterTodos(todos, filter) {
    // filter is 'all', 'open' or 'done'
  }

  function countOpen(todos) {
    // How many todos are not done?
  }

  let todos = []
  todos = addTodo(todos, 'Learn JavaScript')
  todos = addTodo(todos, 'Build a todo app')
  todos = toggleTodo(todos, 1)
  console.log(todos)
  console.log('Open:', countOpen(todos))
`

const P1_LOESUNG =
  FUNKTIONEN +
  '\n\n' +
  js`
  let todos = []
  todos = addTodo(todos, 'Learn JavaScript')
  todos = addTodo(todos, 'Build a todo app')
  todos = toggleTodo(todos, 1)
  console.log(todos)
  console.log('Open:', countOpen(todos))
`

// --- Schritt 2: DOM ---------------------------------------------------------------------

const P2_GERUEST = js`
  let todos = [
    { id: 1, text: 'Learn JavaScript', done: true },
    { id: 2, text: 'Build a todo app', done: false },
  ]

  const app = document.querySelector('#app')
  app.innerHTML =
    '<form><input placeholder="What needs to be done?" /> <button>Add</button></form>' +
    '<ul></ul><p class="count"></p>'

  const form = app.querySelector('form')
  const input = app.querySelector('input')
  const list = app.querySelector('ul')
  const count = app.querySelector('.count')
`

const P2_START =
  FUNKTIONEN +
  '\n\n' +
  P2_GERUEST +
  '\n\n' +
  js`
  function render() {
    // 1. Empty the list
    // 2. Create an <li> per todo with a checkbox, a <span> with the text and a ✕ button
    // 3. Show "n open" in the count paragraph
  }

  // TODO: handle the form's submit event

  render()
`

const P2_LOESUNG =
  FUNKTIONEN +
  '\n\n' +
  P2_GERUEST +
  '\n\n' +
  js`
  function render() {
    list.innerHTML = ''
    for (const todo of todos) {
      const li = document.createElement('li')
      li.className = todo.done ? 'done' : ''

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = todo.done
      checkbox.addEventListener('change', () => {
        todos = toggleTodo(todos, todo.id)
        render()
      })

      const text = document.createElement('span')
      text.textContent = todo.text

      const remove = document.createElement('button')
      remove.textContent = '✕'
      remove.addEventListener('click', () => {
        todos = removeTodo(todos, todo.id)
        render()
      })

      li.append(checkbox, text, remove)
      list.append(li)
    }
    count.textContent = countOpen(todos) + ' open'
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    todos = addTodo(todos, input.value)
    input.value = ''
    render()
  })

  render()
`

// --- Schritt 3: Komponenten -------------------------------------------------------------

const START_TODOS = js`
  const initialTodos = [
    { id: 1, text: 'Learn JavaScript', done: true },
    { id: 2, text: 'Learn React', done: false },
    { id: 3, text: 'Build a todo app', done: false },
  ]
`

const P3_START =
  START_TODOS +
  '\n\n' +
  js`
  function TodoItem({ todo }) {
    // TODO: <li> with a checkbox, the text and a ✕ button
  }

  function TodoList({ todos }) {
    // TODO: <ul> with one TodoItem per todo (don't forget the key)
  }

  function App() {
    return (
      <main>
        <h1>Todos</h1>
        {/* TODO: the TodoList and "n open" */}
      </main>
    )
  }
`

const P3_LOESUNG =
  START_TODOS +
  '\n\n' +
  js`
  function TodoItem({ todo }) {
    return (
      <li className={todo.done ? 'done' : ''}>
        <input type="checkbox" checked={todo.done} readOnly />
        <span>{todo.text}</span>
        <button aria-label={'Delete ' + todo.text}>✕</button>
      </li>
    )
  }

  function TodoList({ todos }) {
    return (
      <ul>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    )
  }

  function App() {
    const openCount = initialTodos.filter((todo) => !todo.done).length

    return (
      <main>
        <h1>Todos</h1>
        <TodoList todos={initialTodos} />
        <p>{openCount} open</p>
      </main>
    )
  }
`

// --- Schritt 4: State & Events ----------------------------------------------------------

const ITEM_MIT_CALLBACKS = js`
  function TodoItem({ todo, onToggle, onDelete }) {
    return (
      <li className={todo.done ? 'done' : ''}>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        <span>{todo.text}</span>
        <button onClick={() => onDelete(todo.id)} aria-label={'Delete ' + todo.text}>
          ✕
        </button>
      </li>
    )
  }

  function TodoList({ todos, onToggle, onDelete }) {
    return (
      <ul>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </ul>
    )
  }
`

const P4_LOESUNG =
  START_TODOS +
  '\n\n' +
  ITEM_MIT_CALLBACKS +
  '\n\n' +
  js`
  function App() {
    const [todos, setTodos] = useState(initialTodos)
    const [text, setText] = useState('')

    function handleSubmit(event) {
      event.preventDefault()
      const trimmed = text.trim()
      if (trimmed === '') return
      const id = todos.length === 0 ? 1 : Math.max(...todos.map((todo) => todo.id)) + 1
      setTodos([...todos, { id, text: trimmed, done: false }])
      setText('')
    }

    function handleToggle(id) {
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
    }

    function handleDelete(id) {
      setTodos(todos.filter((todo) => todo.id !== id))
    }

    const openCount = todos.filter((todo) => !todo.done).length

    return (
      <main>
        <h1>Todos</h1>
        <form onSubmit={handleSubmit}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs to be done?" />
          <button>Add</button>
        </form>
        <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
        <p>{openCount} open</p>
      </main>
    )
  }
`

// --- Schritt 5: Datenfluss & Filter -----------------------------------------------------

const FILTER_KOMPONENTEN = js`
  const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'done', label: 'Done' },
  ]

  function FilterButtons({ filter, onChange }) {
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

const P5_LOESUNG =
  START_TODOS +
  '\n\n' +
  ITEM_MIT_CALLBACKS +
  '\n\n' +
  FILTER_KOMPONENTEN +
  '\n\n' +
  js`
  function TodoForm({ onAdd }) {
    const [text, setText] = useState('')

    function handleSubmit(event) {
      event.preventDefault()
      if (text.trim() === '') return
      onAdd(text.trim())
      setText('')
    }

    return (
      <form onSubmit={handleSubmit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs to be done?" />
        <button>Add</button>
      </form>
    )
  }

  function App() {
    const [todos, setTodos] = useState(initialTodos)
    const [filter, setFilter] = useState('all')

    function handleAdd(text) {
      const id = todos.length === 0 ? 1 : Math.max(...todos.map((todo) => todo.id)) + 1
      setTodos([...todos, { id, text, done: false }])
    }

    function handleToggle(id) {
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
    }

    function handleDelete(id) {
      setTodos(todos.filter((todo) => todo.id !== id))
    }

    // Derived values - no extra state needed.
    const visibleTodos = todos.filter((todo) => (filter === 'all' ? true : filter === 'done' ? todo.done : !todo.done))
    const openCount = todos.filter((todo) => !todo.done).length

    return (
      <main>
        <h1>Todos</h1>
        <TodoForm onAdd={handleAdd} />
        <FilterButtons filter={filter} onChange={setFilter} />
        <TodoList todos={visibleTodos} onToggle={handleToggle} onDelete={handleDelete} />
        <p>{openCount} open</p>
      </main>
    )
  }
`

// --- Schritt 6: useReducer --------------------------------------------------------------

const REDUCER = js`
  function todosReducer(todos, action) {
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
      default:
        throw new Error('Unknown action: ' + action.type)
    }
  }
`

const FORM_MIT_ONADD = js`
  function TodoForm({ onAdd }) {
    const [text, setText] = useState('')

    function handleSubmit(event) {
      event.preventDefault()
      if (text.trim() === '') return
      onAdd(text.trim())
      setText('')
    }

    return (
      <form onSubmit={handleSubmit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs to be done?" />
        <button>Add</button>
      </form>
    )
  }
`

// Der js-Tag übernimmt keine ${…}-Werte - deshalb Platzhalter, die danach ersetzt werden.
const APP_VORLAGE = js`
  function App() {
    __HOOK__
    const [filter, setFilter] = useState('all')

    const visibleTodos = todos.filter((todo) => (filter === 'all' ? true : filter === 'done' ? todo.done : !todo.done))
    const openCount = todos.filter((todo) => !todo.done).length
    const hasDone = todos.some((todo) => todo.done)
    __EXTRA__
    return (
      <main>
        <h1>Todos</h1>
        <TodoForm onAdd={(text) => dispatch({ type: 'added', text })} />
        <FilterButtons filter={filter} onChange={setFilter} />
        <TodoList
          todos={visibleTodos}
          onToggle={(id) => dispatch({ type: 'toggled', id })}
          onDelete={(id) => dispatch({ type: 'deleted', id })}
        />
        <p>
          {openCount} open{' '}
          <button onClick={() => dispatch({ type: 'clearedDone' })} disabled={!hasDone}>
            Clear done
          </button>
        </p>
      </main>
    )
  }
`

const einruecken = (code: string, n: number) =>
  code
    .split('\n')
    .map((zeile) => (zeile ? ' '.repeat(n) + zeile : zeile))
    .join('\n')

/** Setzt die Hook-Zeile ein und - falls vorhanden - zusätzlichen Code vor dem return. */
const app6 = (hookZeile: string, extra = '') =>
  APP_VORLAGE.replace('__HOOK__', hookZeile).replace(/^ *__EXTRA__\n/m, extra ? '\n' + einruecken(extra, 2) + '\n\n' : '\n')

const P6_LOESUNG = [
  START_TODOS,
  REDUCER,
  ITEM_MIT_CALLBACKS,
  FILTER_KOMPONENTEN,
  FORM_MIT_ONADD,
  app6('const [todos, dispatch] = useReducer(todosReducer, initialTodos)'),
].join('\n\n')

// --- Schritt 7: Speichern ---------------------------------------------------------------

const PERSISTENT_HOOK = js`
  function usePersistentReducer(reducer, key, initialValue) {
    const [state, dispatch] = useReducer(reducer, key, (storageKey) => {
      try {
        const stored = localStorage.getItem(storageKey)
        return stored ? JSON.parse(stored) : initialValue
      } catch {
        return initialValue
      }
    })

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state))
    }, [key, state])

    return [state, dispatch]
  }
`

const TITEL_EFFEKT = js`
    useEffect(() => {
      document.title = openCount + ' open · Todos'
    }, [openCount])
`

const P7_LOESUNG = [
  START_TODOS,
  REDUCER,
  PERSISTENT_HOOK,
  ITEM_MIT_CALLBACKS,
  FILTER_KOMPONENTEN,
  FORM_MIT_ONADD,
  app6("const [todos, dispatch] = usePersistentReducer(todosReducer, 'todos', initialTodos)", TITEL_EFFEKT),
].join('\n\n')

// --- Schritt 8: Fokus -------------------------------------------------------------------

const FORM_MIT_REF = js`
  function TodoForm({ onAdd }) {
    const [text, setText] = useState('')
    const inputRef = useRef(null)

    function handleSubmit(event) {
      event.preventDefault()
      inputRef.current.focus()
      if (text.trim() === '') return
      onAdd(text.trim())
      setText('')
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setText('')
    }

    return (
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
        />
        <button>Add</button>
      </form>
    )
  }
`

const P8_LOESUNG = [
  START_TODOS,
  REDUCER,
  PERSISTENT_HOOK,
  ITEM_MIT_CALLBACKS,
  FILTER_KOMPONENTEN,
  FORM_MIT_REF,
  app6("const [todos, dispatch] = usePersistentReducer(todosReducer, 'todos', initialTodos)", TITEL_EFFEKT),
].join('\n\n')

// --- Schritt 9: Context -----------------------------------------------------------------

const CONTEXT = js`
  const TodosContext = createContext(null)

  function TodosProvider({ children }) {
    const [todos, dispatch] = usePersistentReducer(todosReducer, 'todos', initialTodos)
    // Same object as long as todos don't change - consumers don't re-render needlessly.
    const value = useMemo(() => ({ todos, dispatch }), [todos, dispatch])
    return <TodosContext value={value}>{children}</TodosContext>
  }

  function useTodos() {
    const context = useContext(TodosContext)
    if (!context) throw new Error('useTodos must be used inside <TodosProvider>')
    return context
  }
`

const ITEM_MIT_CONTEXT = js`
  function TodoItem({ todo }) {
    const { dispatch } = useTodos()
    return (
      <li className={todo.done ? 'done' : ''}>
        <input type="checkbox" checked={todo.done} onChange={() => dispatch({ type: 'toggled', id: todo.id })} />
        <span>{todo.text}</span>
        <button onClick={() => dispatch({ type: 'deleted', id: todo.id })} aria-label={'Delete ' + todo.text}>
          ✕
        </button>
      </li>
    )
  }

  function TodoList({ filter }) {
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
`

const FORM_MIT_CONTEXT = js`
  function TodoForm() {
    const { dispatch } = useTodos()
    const [text, setText] = useState('')
    const inputRef = useRef(null)

    function handleSubmit(event) {
      event.preventDefault()
      inputRef.current.focus()
      if (text.trim() === '') return
      dispatch({ type: 'added', text: text.trim() })
      setText('')
    }

    return (
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setText('')}
          placeholder="What needs to be done?"
        />
        <button>Add</button>
      </form>
    )
  }
`

const APP_MIT_CONTEXT = js`
  function TodoApp() {
    const [filter, setFilter] = useState('all')
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

const P9_LOESUNG = [START_TODOS, REDUCER, PERSISTENT_HOOK, CONTEXT, ITEM_MIT_CONTEXT, FILTER_KOMPONENTEN, FORM_MIT_CONTEXT, APP_MIT_CONTEXT].join('\n\n')

// --- Schritt 10: Validierung ------------------------------------------------------------

const FORM_VALIDIERT = js`
  const MAX_LENGTH = 80

  function validate(text, todos) {
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
    const inputRef = useRef(null)

    // Derived: always matches the current input, never out of date.
    const error = validate(text, todos)
    const showError = error !== null && (triedToSubmit || text !== '')

    function handleSubmit(event) {
      event.preventDefault()
      inputRef.current.focus()
      if (error) {
        setTriedToSubmit(true)
        return
      }
      dispatch({ type: 'added', text: text.trim() })
      setText('')
      setTriedToSubmit(false)
    }

    return (
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setText('')}
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

const P10_LOESUNG = [START_TODOS, REDUCER, PERSISTENT_HOOK, CONTEXT, ITEM_MIT_CONTEXT, FILTER_KOMPONENTEN, FORM_VALIDIERT, APP_MIT_CONTEXT].join('\n\n')

// --- Schritt 11: Laden ------------------------------------------------------------------

const API = js`
  // Stand-in for a real server: a data URL that fetch can read like any other URL.
  // (The tests replace fetch with their own version.)
  const API_URL =
    'data:application/json,' +
    encodeURIComponent(JSON.stringify([
      { id: 1, text: 'Learn JavaScript', done: true },
      { id: 2, text: 'Learn React', done: false },
      { id: 3, text: 'Load todos from an API', done: false },
    ]))
`

const REDUCER_MIT_LOADED = REDUCER.replace(
  "    case 'added': {",
  "    case 'loaded':\n      return action.todos\n    case 'added': {",
)

const CONTEXT_MIT_LADEN = js`
  const TodosContext = createContext(null)

  function TodosProvider({ children }) {
    // null = nothing stored yet -> load from the API
    const [todos, dispatch] = usePersistentReducer(todosReducer, 'todos', null)
    const [status, setStatus] = useState(todos === null ? 'loading' : 'ready')
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
      if (todos !== null) return
      const controller = new AbortController()

      async function load() {
        try {
          const response = await fetch(API_URL, { signal: controller.signal })
          if (!response.ok) throw new Error('HTTP ' + response.status)
          dispatch({ type: 'loaded', todos: await response.json() })
          setStatus('ready')
        } catch (error) {
          if (error.name !== 'AbortError') setStatus('error')
        }
      }

      load()
      return () => controller.abort()
    }, [todos, attempt, dispatch])

    const value = useMemo(() => ({ todos, dispatch }), [todos, dispatch])

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

  function useTodos() {
    const context = useContext(TodosContext)
    if (!context) throw new Error('useTodos must be used inside <TodosProvider>')
    return context
  }
`

const P11_LOESUNG = [API, REDUCER_MIT_LOADED, PERSISTENT_HOOK, CONTEXT_MIT_LADEN, ITEM_MIT_CONTEXT, FILTER_KOMPONENTEN, FORM_VALIDIERT, APP_MIT_CONTEXT].join(
  '\n\n',
)

// --- Schritt 12: Challenge --------------------------------------------------------------

const P12_START = js`
  // Challenge: build the todo app from scratch.
  // The requirements are listed above the editor - the tests check all of them.
  // Structure it however you like: useState or useReducer, one component or many.

  function App() {
    return <h1>Todos</h1>
  }
`

const P12_LOESUNG = [
  REDUCER,
  PERSISTENT_HOOK,
  ITEM_MIT_CALLBACKS,
  FILTER_KOMPONENTEN,
  FORM_MIT_REF,
  app6("const [todos, dispatch] = usePersistentReducer(todosReducer, 'todos', [])"),
].join('\n\n')

// --- Wiederkehrende Tests ---------------------------------------------------------------

const t = (de: string, en: string) => ({ de, en })

const TEST_HINZUFUEGEN: ReactTest = {
  name: t('Neues Todo über das Formular hinzufügen', 'Add a new todo via the form'),
  pruefung: js`
    await render()
    const before = findAll('li').length
    await type(field('What needs to be done?'), '  Walk the dog  ')
    await click(button('Add'))
    expect(findAll('li')).toHaveLength(before + 1)
    expect(text()).toContain('Walk the dog')
    expect(field('What needs to be done?').value).toBe('')
  `,
}

const TEST_LEER: ReactTest = {
  name: t('Leere Eingaben werden ignoriert', 'Empty input is ignored'),
  pruefung: js`
    await render()
    const before = findAll('li').length
    await type(field('What needs to be done?'), '   ')
    await click(button('Add'))
    expect(findAll('li')).toHaveLength(before)
  `,
}

const TEST_UMSCHALTEN: ReactTest = {
  name: t('Checkbox schaltet „done“ um und aktualisiert die Anzahl', 'Checkbox toggles “done” and updates the count'),
  pruefung: js`
    await render()
    await click(findAll('li input[type="checkbox"]')[1])
    expect(findAll('li.done')).toHaveLength(2)
    expect(text()).toContain('1 open')
  `,
}

const TEST_LOESCHEN: ReactTest = {
  name: t('✕ löscht das Todo', '✕ deletes the todo'),
  pruefung: js`
    await render()
    await click(within(findAll('li')[0]).button(/✕|delete|remove/i))
    expect(findAll('li')).toHaveLength(2)
    expect(text()).not.toContain('Learn JavaScript')
  `,
}

const TEST_FILTER: ReactTest = {
  name: t('Filter All / Open / Done zeigen die passenden Todos', 'Filters All / Open / Done show the matching todos'),
  pruefung: js`
    await render()
    await click(button('Open'))
    expect(findAll('li')).toHaveLength(2)
    await click(button('Done'))
    expect(findAll('li')).toHaveLength(1)
    await click(button('All'))
    expect(findAll('li')).toHaveLength(3)
  `,
}

const TEST_ARIA_PRESSED: ReactTest = {
  name: t('Der aktive Filter hat aria-pressed="true"', 'The active filter has aria-pressed="true"'),
  pruefung: js`
    await render()
    expect(button('All').getAttribute('aria-pressed')).toBe('true')
    await click(button('Done'))
    expect(button('Done').getAttribute('aria-pressed')).toBe('true')
    expect(button('All').getAttribute('aria-pressed')).toBe('false')
  `,
}

const TEST_CLEAR_DONE: ReactTest = {
  name: t('„Clear done“ entfernt erledigte Todos', '“Clear done” removes completed todos'),
  pruefung: js`
    await render()
    await click(button('Clear done'))
    expect(findAll('li')).toHaveLength(2)
    expect(text()).not.toContain('Learn JavaScript')
  `,
}

const TEST_SPEICHERN: ReactTest = {
  name: t('Todos überleben ein Neuladen (localStorage "todos")', 'Todos survive a reload (localStorage "todos")'),
  pruefung: js`
    await render()
    await type(field('What needs to be done?'), 'Still here')
    await click(button('Add'))
    await waitFor(() => expect(localStorage.getItem('todos') ?? '').toContain('Still here'))
    await remount()
    expect(text()).toContain('Still here')
  `,
}

/** Grundfunktionen einmal komplett durchspielen - für Schritte, die umbauen statt erweitern. */
const TEST_ALLES_GEHT_NOCH: ReactTest = {
  name: t('Hinzufügen, Umschalten, Löschen und Filtern funktionieren weiter', 'Adding, toggling, deleting and filtering still work'),
  pruefung: js`
    await render()
    await type(field('What needs to be done?'), 'Refactor')
    await click(button('Add'))
    expect(findAll('li')).toHaveLength(4)
    await click(findAll('li input[type="checkbox"]')[1])
    expect(text()).toContain('2 open')
    await click(within(findAll('li')[0]).button(/✕|delete|remove/i))
    expect(findAll('li')).toHaveLength(3)
    await click(button('Done'))
    expect(findAll('li')).toHaveLength(1)
  `,
}

// --- Die Schritte -----------------------------------------------------------------------

export const schrittInhalte: Record<string, SchrittInhalt> = {
  'projekt-1-daten': {
    modus: 'js',
    einleitung: {
      de: 'Bevor es eine Oberfläche gibt, braucht die App ein **Datenmodell**: Ein Todo ist ein Objekt `{ id, text, done }`, alle Todos zusammen ein Array.\n\nDie Funktionen hier verändern nie das übergebene Array, sondern geben ein **neues** zurück - genau so, wie React es später von State verlangt ([[js-referenzen]]). Weil sie nichts anderes tun, als aus Eingaben ein Ergebnis zu berechnen, sind es **reine Funktionen**.',
      en: 'Before there is a UI, the app needs a **data model**: a todo is an object `{ id, text, done }`, and all todos together form an array.\n\nThe functions here never change the array they receive but return a **new** one - exactly what React will later require for state ([[js-referenzen]]). Because they do nothing but compute a result from their inputs, they are **pure functions**.',
    },
    anforderungen: {
      de: [
        '`addTodo(todos, text)` hängt `{ id, text, done: false }` an - Text ohne Leerzeichen am Rand, `id` = größte vorhandene id + 1 (oder 1)',
        'Leerer Text: `addTodo` gibt die Todos unverändert zurück',
        '`toggleTodo(todos, id)` kehrt `done` des passenden Todos um',
        '`removeTodo(todos, id)` entfernt das passende Todo',
        '`filterTodos(todos, filter)` liefert für `all`, `open` bzw. `done` die passenden Todos',
        '`countOpen(todos)` zählt die offenen Todos',
        'Keine Funktion verändert das übergebene Array oder seine Objekte',
      ],
      en: [
        '`addTodo(todos, text)` appends `{ id, text, done: false }` - text without surrounding spaces, `id` = highest existing id + 1 (or 1)',
        'Empty text: `addTodo` returns the todos unchanged',
        '`toggleTodo(todos, id)` flips `done` of the matching todo',
        '`removeTodo(todos, id)` removes the matching todo',
        '`filterTodos(todos, filter)` returns the matching todos for `all`, `open` or `done`',
        '`countOpen(todos)` counts the open todos',
        'No function changes the array it receives or its objects',
      ],
    },
    start: P1_START,
    loesung: P1_LOESUNG,
    tipps: {
      de: [
        'Für `addTodo`: `text.trim()` entfernt Leerzeichen, `[...todos, neu]` erzeugt das neue Array.',
        'Die nächste id: `Math.max(...todos.map((todo) => todo.id)) + 1` - aber Vorsicht, `Math.max()` ohne Werte ergibt `-Infinity`.',
        '`toggleTodo` mit `map`: für das passende Todo `{ ...todo, done: !todo.done }` zurückgeben, sonst das Todo selbst.',
        '`removeTodo`, `filterTodos` und `countOpen` sind jeweils ein `filter` ([[js-arrays]]).',
      ],
      en: [
        'For `addTodo`: `text.trim()` removes spaces, `[...todos, newTodo]` creates the new array.',
        'The next id: `Math.max(...todos.map((todo) => todo.id)) + 1` - but careful, `Math.max()` without values is `-Infinity`.',
        '`toggleTodo` with `map`: return `{ ...todo, done: !todo.done }` for the matching todo, otherwise the todo itself.',
        '`removeTodo`, `filterTodos` and `countOpen` are each a single `filter` ([[js-arrays]]).',
      ],
    },
    tests: [
      { name: t('addTodo fügt ein Todo mit id 1 hinzu', 'addTodo adds a todo with id 1'), ausdruck: "addTodo([], '  Learn JS  ')", erwartet: [{ id: 1, text: 'Learn JS', done: false }] },
      { name: t('addTodo ignoriert leeren Text', 'addTodo ignores empty text'), ausdruck: "addTodo([], '   ')", erwartet: [] },
      { name: t('addTodo vergibt größte id + 1', 'addTodo uses highest id + 1'), ausdruck: "addTodo([{ id: 5, text: 'a', done: false }, { id: 2, text: 'b', done: true }], 'c')[2].id", erwartet: 6 },
      { name: t('addTodo verändert das Original nicht', 'addTodo does not change the original'), ausdruck: "(() => { const list = []; const result = addTodo(list, 'x'); return list.length === 0 && result !== list })()" },
      {
        name: t('toggleTodo kehrt done um', 'toggleTodo flips done'),
        ausdruck: "toggleTodo([{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }], 2)",
        erwartet: [{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: true }],
      },
      { name: t('toggleTodo verändert das Original-Objekt nicht', 'toggleTodo does not change the original object'), ausdruck: "(() => { const list = [{ id: 1, text: 'a', done: false }]; const result = toggleTodo(list, 1); return list[0].done === false && result[0].done === true })()" },
      { name: t('removeTodo entfernt das Todo', 'removeTodo removes the todo'), ausdruck: "removeTodo([{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }], 1)", erwartet: [{ id: 2, text: 'b', done: false }] },
      {
        name: t('filterTodos: all, open und done', 'filterTodos: all, open and done'),
        ausdruck: "(() => { const list = [{ id: 1, text: 'a', done: true }, { id: 2, text: 'b', done: false }]; return [filterTodos(list, 'all').length, filterTodos(list, 'open')[0]?.id, filterTodos(list, 'done')[0]?.id] })()",
        erwartet: [2, 2, 1],
      },
      { name: t('countOpen zählt offene Todos', 'countOpen counts open todos'), ausdruck: "countOpen([{ id: 1, text: 'a', done: true }, { id: 2, text: 'b', done: false }, { id: 3, text: 'c', done: false }])", erwartet: 2 },
    ],
  },

  'projekt-2-dom': {
    modus: 'js',
    vorschau: true,
    einleitung: {
      de: 'Jetzt bekommen die Funktionen aus Schritt 1 eine Oberfläche - mit reinem DOM-Code wie in [[js-dom]]. Das Muster: Daten ändern, dann `render()` zeichnet die ganze Liste neu.\n\nAchte beim Schreiben darauf, wie viel Code nur dafür da ist, Elemente zu erzeugen und Listener anzuhängen. Genau diese Arbeit nimmt dir React ab dem nächsten Schritt ab.',
      en: 'Now the functions from step 1 get a UI - with plain DOM code as in [[js-dom]]. The pattern: change the data, then `render()` redraws the whole list.\n\nWhile writing, notice how much code exists only to create elements and attach listeners. That is exactly the work React takes off your hands from the next step on.',
    },
    anforderungen: {
      de: [
        '`render()` erzeugt pro Todo ein `<li>` mit Checkbox, `<span>` mit dem Text und einem ✕-Knopf',
        'Erledigte Todos: `<li class="done">` und angehakte Checkbox',
        'Der Absatz `.count` zeigt „n open“',
        'Absenden des Formulars fügt ein Todo hinzu und leert das Feld (ohne Neuladen der Seite)',
        'Checkbox schaltet um, ✕ löscht - danach wird neu gerendert',
      ],
      en: [
        '`render()` creates an `<li>` per todo with a checkbox, a `<span>` with the text and a ✕ button',
        'Completed todos: `<li class="done">` and a checked checkbox',
        'The `.count` paragraph shows “n open”',
        'Submitting the form adds a todo and clears the input (without reloading the page)',
        'The checkbox toggles, ✕ deletes - then everything is rendered again',
      ],
    },
    start: P2_START,
    loesung: P2_LOESUNG,
    tipps: {
      de: [
        '`list.innerHTML = \'\'` leert die Liste, danach eine `for…of`-Schleife über `todos`.',
        'Elemente erzeugen: `document.createElement(\'li\')`, Text mit `textContent`, anhängen mit `li.append(checkbox, text, remove)`.',
        'Im Listener erst die Daten ändern (`todos = toggleTodo(todos, todo.id)`), dann `render()` aufrufen.',
        'Formular: `form.addEventListener(\'submit\', (event) => { event.preventDefault(); … })`.',
      ],
      en: [
        '`list.innerHTML = \'\'` empties the list, then a `for…of` loop over `todos`.',
        'Create elements: `document.createElement(\'li\')`, text via `textContent`, attach with `li.append(checkbox, text, remove)`.',
        'In the listener, change the data first (`todos = toggleTodo(todos, todo.id)`), then call `render()`.',
        'Form: `form.addEventListener(\'submit\', (event) => { event.preventDefault(); … })`.',
      ],
    },
    tests: [
      { name: t('Zwei <li> werden gerendert', 'Two <li> are rendered'), ausdruck: "document.querySelectorAll('#app li').length", erwartet: 2 },
      { name: t('Texte stehen in den Einträgen', 'The texts appear in the items'), ausdruck: "document.querySelector('#app ul').textContent.includes('Learn JavaScript') && document.querySelector('#app ul').textContent.includes('Build a todo app')" },
      { name: t('Erledigtes Todo hat Klasse done und Haken', 'Completed todo has class done and a check mark'), ausdruck: "document.querySelectorAll('#app li.done').length === 1 && document.querySelector('#app li input[type=checkbox]')?.checked === true" },
      { name: t('Anzeige „1 open“', 'Shows “1 open”'), ausdruck: "document.querySelector('#app .count').textContent.trim()", erwartet: '1 open' },
      {
        name: t('Formular fügt ein Todo hinzu und leert das Feld', 'The form adds a todo and clears the input'),
        ausdruck: "(() => { const input = document.querySelector('#app form input'); input.value = '  Walk the dog '; document.querySelector('#app form').requestSubmit(); const items = document.querySelectorAll('#app li'); return items.length === 3 && items[2].textContent.includes('Walk the dog') && document.querySelector('#app form input').value === '' })()",
      },
      {
        name: t('Checkbox schaltet um', 'Checkbox toggles'),
        ausdruck: "(() => { document.querySelectorAll('#app li input[type=checkbox]')[1]?.click(); return document.querySelectorAll('#app li.done').length === 2 && document.querySelector('#app .count').textContent.trim() === '1 open' })()",
      },
      {
        name: t('✕ löscht das Todo', '✕ deletes the todo'),
        ausdruck: "(() => { document.querySelector('#app li button')?.click(); return document.querySelectorAll('#app li').length === 2 && !document.querySelector('#app ul').textContent.includes('Learn JavaScript') })()",
      },
    ],
  },

  'projekt-3-komponenten': {
    modus: 'react',
    einleitung: {
      de: 'Dieselbe Liste - diesmal mit React. Statt Elemente von Hand zu erzeugen, **beschreibst** du, wie die Oberfläche für bestimmte Daten aussieht ([[react-komponenten]]).\n\nZerlege sie in zwei Komponenten: `TodoItem` zeigt ein einzelnes Todo, `TodoList` die ganze Liste. Die Daten kommen per **Props** von oben ([[react-props]]). Noch ist alles statisch - Klicks folgen im nächsten Schritt.',
      en: 'The same list - this time with React. Instead of creating elements by hand, you **describe** what the UI looks like for given data ([[react-komponenten]]).\n\nSplit it into two components: `TodoItem` shows a single todo, `TodoList` the whole list. The data comes from above via **props** ([[react-props]]). Everything is still static - clicks follow in the next step.',
    },
    anforderungen: {
      de: [
        '`TodoItem` rendert ein `<li>` mit Checkbox (`checked` = `done`), Text und ✕-Knopf',
        'Erledigte Todos bekommen `className="done"`',
        '`TodoList` rendert ein `<ul>` mit einem `TodoItem` pro Todo - mit `key`',
        '`App` zeigt die Liste und darunter „n open“',
      ],
      en: [
        '`TodoItem` renders an `<li>` with a checkbox (`checked` = `done`), the text and a ✕ button',
        'Completed todos get `className="done"`',
        '`TodoList` renders a `<ul>` with one `TodoItem` per todo - with a `key`',
        '`App` shows the list and “n open” below it',
      ],
    },
    start: P3_START,
    loesung: P3_LOESUNG,
    tipps: {
      de: [
        'In `TodoList`: `todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)`.',
        'Eine Checkbox ohne `onChange` braucht `readOnly`, sonst warnt React.',
        'Die offene Anzahl ist ein abgeleiteter Wert: `initialTodos.filter((todo) => !todo.done).length`.',
      ],
      en: [
        'In `TodoList`: `todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)`.',
        'A checkbox without `onChange` needs `readOnly`, otherwise React warns.',
        'The open count is a derived value: `initialTodos.filter((todo) => !todo.done).length`.',
      ],
    },
    tests: [
      { name: t('Drei <li> werden gerendert', 'Three <li> are rendered'), pruefung: js`
        await render()
        expect(findAll('li')).toHaveLength(3)
        expect(text()).toContain('Learn React')
      ` },
      { name: t('Checkboxen zeigen den done-Zustand', 'Checkboxes show the done state'), pruefung: js`
        await render()
        const boxes = findAll('li input[type="checkbox"]')
        expect(boxes).toHaveLength(3)
        expect(boxes[0].checked).toBe(true)
        expect(boxes[1].checked).toBe(false)
      ` },
      { name: t('Erledigtes Todo hat die Klasse done', 'Completed todo has the class done'), pruefung: js`
        await render()
        expect(findAll('li.done')).toHaveLength(1)
      ` },
      { name: t('Jedes Todo hat einen ✕-Knopf', 'Every todo has a ✕ button'), pruefung: js`
        await render()
        expect(findAll('li button')).toHaveLength(3)
      ` },
      { name: t('Anzeige „2 open“', 'Shows “2 open”'), pruefung: js`
        await render()
        expect(text()).toContain('2 open')
      ` },
      { name: t('Komponenten TodoItem und TodoList mit key', 'Components TodoItem and TodoList with key'), pruefung: js`
        expect(code).toMatch(/function TodoItem/)
        expect(code).toMatch(/function TodoList/)
        expect(code).toMatch(/<TodoItem/)
        expect(code).toMatch(/key=\{/)
      ` },
    ],
  },

  'projekt-4-state': {
    modus: 'react',
    einleitung: {
      de: 'Jetzt wird die Liste lebendig. Die Todos wandern in **State** ([[react-state]]): Jede Änderung erzeugt ein neues Array, React rendert neu.\n\nDas Eingabefeld ist ein **kontrolliertes Feld** - sein Wert steht ebenfalls im State. Klicks in `TodoItem` meldet die Komponente über **Callback-Props** (`onToggle`, `onDelete`) nach oben: Daten fließen nach unten, Ereignisse nach oben.',
      en: 'Now the list comes alive. The todos move into **state** ([[react-state]]): every change creates a new array and React re-renders.\n\nThe input is a **controlled input** - its value lives in state too. `TodoItem` reports clicks upward via **callback props** (`onToggle`, `onDelete`): data flows down, events flow up.',
    },
    anforderungen: {
      de: [
        'Formular mit Eingabefeld (placeholder „What needs to be done?“) und Knopf „Add“',
        'Absenden (Klick oder Enter) fügt ein Todo hinzu, leere Eingaben werden ignoriert, danach ist das Feld leer',
        'Checkbox schaltet `done` um, ✕ löscht',
        '„n open“ stimmt immer',
      ],
      en: [
        'A form with an input (placeholder “What needs to be done?”) and an “Add” button',
        'Submitting (click or Enter) adds a todo, empty input is ignored, afterwards the input is empty',
        'The checkbox toggles `done`, ✕ deletes',
        '“n open” is always correct',
      ],
    },
    loesung: P4_LOESUNG,
    tipps: {
      de: [
        '`const [todos, setTodos] = useState(initialTodos)` und `const [text, setText] = useState(\'\')` in `App`.',
        '`<form onSubmit={handleSubmit}>` - und in `handleSubmit` zuerst `event.preventDefault()`.',
        'Neues Array statt `push`: `setTodos([...todos, { id, text: trimmed, done: false }])` ([[hooks-usestate]]).',
        '`TodoItem` bekommt `onToggle` und `onDelete`: `onChange={() => onToggle(todo.id)}`.',
      ],
      en: [
        '`const [todos, setTodos] = useState(initialTodos)` and `const [text, setText] = useState(\'\')` in `App`.',
        '`<form onSubmit={handleSubmit}>` - and in `handleSubmit`, call `event.preventDefault()` first.',
        'A new array instead of `push`: `setTodos([...todos, { id, text: trimmed, done: false }])` ([[hooks-usestate]]).',
        '`TodoItem` receives `onToggle` and `onDelete`: `onChange={() => onToggle(todo.id)}`.',
      ],
    },
    tests: [
      TEST_HINZUFUEGEN,
      { name: t('Enter im Feld sendet das Formular ab', 'Enter in the input submits the form'), pruefung: js`
        await render()
        await type(field('What needs to be done?'), 'Via Enter')
        await submit(field('What needs to be done?'))
        expect(text()).toContain('Via Enter')
      ` },
      TEST_LEER,
      TEST_UMSCHALTEN,
      TEST_LOESCHEN,
      { name: t('State wird nicht mit push verändert', 'State is not changed with push'), pruefung: js`
        expect(code).toMatch(/useState\(/)
        expect(code).not.toMatch(/todos\.push\(/)
      ` },
    ],
  },

  'projekt-5-datenfluss': {
    modus: 'react',
    einleitung: {
      de: '`App` wird langsam voll. Zeit, aufzuräumen: Das Formular wird zur Komponente `TodoForm` mit eigenem State für den Text, und es kommen Filter dazu ([[react-datenfluss]]).\n\nWichtig ist, **wo** State lebt: Die Todos brauchen Formular, Liste und Zähler - also bleiben sie in `App`. Die gefilterte Liste ist dagegen kein State, sondern wird bei jedem Render **abgeleitet**.',
      en: '`App` is getting crowded. Time to tidy up: the form becomes a `TodoForm` component with its own state for the text, and filters are added ([[react-datenfluss]]).\n\nWhat matters is **where** state lives: the form, list and counter all need the todos - so they stay in `App`. The filtered list, on the other hand, is not state but **derived** on every render.',
    },
    anforderungen: {
      de: [
        '`TodoForm` mit eigenem Text-State meldet neue Todos über `onAdd(text)`',
        '`FilterButtons` zeigt „All“, „Open“ und „Done“; der aktive Knopf hat `aria-pressed="true"`',
        'Die Liste zeigt nur die Todos des aktiven Filters',
        '„n open“ zählt immer alle offenen Todos, unabhängig vom Filter',
      ],
      en: [
        '`TodoForm` with its own text state reports new todos via `onAdd(text)`',
        '`FilterButtons` shows “All”, “Open” and “Done”; the active button has `aria-pressed="true"`',
        'The list only shows the todos of the active filter',
        '“n open” always counts all open todos, regardless of the filter',
      ],
    },
    loesung: P5_LOESUNG,
    tipps: {
      de: [
        'Filter-State in `App`: `const [filter, setFilter] = useState(\'all\')`.',
        'Kein zweiter State für die gefilterte Liste! `const visibleTodos = todos.filter(…)` direkt beim Rendern.',
        '`<button aria-pressed={filter === f.value} onClick={() => onChange(f.value)}>`',
        'Der Text-State wandert aus `App` in `TodoForm` - `App` braucht ihn nicht mehr.',
      ],
      en: [
        'Filter state in `App`: `const [filter, setFilter] = useState(\'all\')`.',
        'No second state for the filtered list! `const visibleTodos = todos.filter(…)` right while rendering.',
        '`<button aria-pressed={filter === f.value} onClick={() => onChange(f.value)}>`',
        'The text state moves from `App` into `TodoForm` - `App` no longer needs it.',
      ],
    },
    tests: [
      TEST_FILTER,
      TEST_ARIA_PRESSED,
      { name: t('„n open“ hängt nicht vom Filter ab', '“n open” does not depend on the filter'), pruefung: js`
        await render()
        await click(button('Done'))
        expect(text()).toContain('2 open')
      ` },
      { name: t('Abgehaktes Todo verschwindet aus „Open“', 'Checked todo disappears from “Open”'), pruefung: js`
        await render()
        await click(button('Open'))
        await click(findAll('li input[type="checkbox"]')[0])
        expect(findAll('li')).toHaveLength(1)
      ` },
      TEST_HINZUFUEGEN,
      { name: t('Komponenten TodoForm und FilterButtons', 'Components TodoForm and FilterButtons'), pruefung: js`
        expect(code).toMatch(/function TodoForm/)
        expect(code).toMatch(/function FilterButtons/)
      ` },
    ],
  },

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

  'projekt-12-challenge': {
    modus: 'react',
    einleitung: {
      de: 'Jetzt ohne Vorlage: Baue die ToDo-App **von null** - so, wie du es für richtig hältst. Die Tests prüfen nur, was ein Mensch sieht und tut, nicht wie dein Code aufgebaut ist.\n\nVersuch es zuerst ganz ohne Tipps und ohne in die früheren Schritte zu schauen. Wenn du hängst: Die Tipps verweisen auf die passenden Kapitel. Und wenn alle Tests grün sind, kannst du die App mit [[praxis-lokal]] auf deinen eigenen Rechner holen.',
      en: 'Now without a template: build the todo app **from scratch** - however you think is right. The tests only check what a person sees and does, not how your code is structured.\n\nTry it first without any hints and without looking at the earlier steps. If you get stuck, the hints point to the relevant chapters. And once all tests are green, [[praxis-lokal]] shows you how to move the app to your own computer.',
    },
    anforderungen: {
      de: [
        'Anfangs leer, Anzeige „0 open“',
        'Eingabefeld (placeholder „What needs to be done?“) und Knopf „Add“: fügt ein Todo hinzu, ignoriert leere Eingaben, leert danach das Feld',
        'Jedes Todo ist ein `<li>` mit Checkbox, Text und ✕-Knopf; erledigte haben die Klasse `done`',
        'Filter „All“, „Open“, „Done“ mit `aria-pressed`',
        '„n open“ und ein Knopf „Clear done“',
        'Die Todos werden im `localStorage` unter `todos` gespeichert und beim Start geladen',
      ],
      en: [
        'Empty at first, showing “0 open”',
        'An input (placeholder “What needs to be done?”) and an “Add” button: adds a todo, ignores empty input, then clears the input',
        'Every todo is an `<li>` with a checkbox, the text and a ✕ button; completed ones have the class `done`',
        'Filters “All”, “Open”, “Done” with `aria-pressed`',
        '“n open” and a “Clear done” button',
        'The todos are saved in `localStorage` under `todos` and loaded on start',
      ],
    },
    start: P12_START,
    loesung: P12_LOESUNG,
    tipps: {
      de: [
        'Fang mit den Daten an: Welcher State ist nötig? (Todos, Eingabetext, Filter) - [[react-datenfluss]]',
        'Erst hinzufügen und anzeigen, dann umschalten und löschen, dann Filter - nach jedem Teil ausführen.',
        'Viele Änderungen an einem Array? Ein Reducer hält das übersichtlich - [[hooks-usereducer]]',
        'Speichern: Lazy Initializer zum Lesen, `useEffect` zum Schreiben - [[hooks-useeffect]]',
      ],
      en: [
        'Start with the data: which state is needed? (todos, input text, filter) - [[react-datenfluss]]',
        'First add and display, then toggle and delete, then filters - run after each part.',
        'Many changes to one array? A reducer keeps it manageable - [[hooks-usereducer]]',
        'Saving: a lazy initializer for reading, `useEffect` for writing - [[hooks-useeffect]]',
      ],
    },
    tests: [
      { name: t('Anfangs leer mit „0 open“', 'Empty at first with “0 open”'), pruefung: js`
        await render()
        expect(findAll('li')).toHaveLength(0)
        expect(text()).toContain('0 open')
      ` },
      { name: t('Hinzufügen: getrimmt, leer ignoriert, Feld geleert', 'Adding: trimmed, empty ignored, input cleared'), pruefung: js`
        await render()
        await type(field('What needs to be done?'), '  First  ')
        await click(button('Add'))
        await type(field('What needs to be done?'), '   ')
        await click(button('Add'))
        await type(field('What needs to be done?'), 'Second')
        await click(button('Add'))
        expect(findAll('li')).toHaveLength(2)
        expect(findAll('li')[0].textContent).toContain('First')
        expect(field('What needs to be done?').value).toBe('')
        expect(text()).toContain('2 open')
      ` },
      { name: t('Umschalten und Löschen', 'Toggling and deleting'), pruefung: js`
        await render()
        for (const todo of ['A', 'B', 'C']) {
          await type(field('What needs to be done?'), todo)
          await click(button('Add'))
        }
        await click(findAll('li input[type="checkbox"]')[0])
        expect(findAll('li.done')).toHaveLength(1)
        expect(text()).toContain('2 open')
        await click(within(findAll('li')[2]).button(/✕|delete|remove/i))
        expect(findAll('li')).toHaveLength(2)
      ` },
      { name: t('Filter mit aria-pressed', 'Filters with aria-pressed'), pruefung: js`
        await render()
        for (const todo of ['A', 'B']) {
          await type(field('What needs to be done?'), todo)
          await click(button('Add'))
        }
        await click(findAll('li input[type="checkbox"]')[0])
        await click(button('Open'))
        expect(findAll('li')).toHaveLength(1)
        expect(button('Open').getAttribute('aria-pressed')).toBe('true')
        await click(button('Done'))
        expect(findAll('li')).toHaveLength(1)
        expect(findAll('li')[0].textContent).toContain('A')
        await click(button('All'))
        expect(findAll('li')).toHaveLength(2)
      ` },
      { name: t('„Clear done“ entfernt erledigte', '“Clear done” removes completed ones'), pruefung: js`
        await render()
        for (const todo of ['A', 'B']) {
          await type(field('What needs to be done?'), todo)
          await click(button('Add'))
        }
        await click(findAll('li input[type="checkbox"]')[1])
        await click(button('Clear done'))
        expect(findAll('li')).toHaveLength(1)
        expect(findAll('li')[0].textContent).toContain('A')
      ` },
      {
        name: t('Speichern im localStorage', 'Saving in localStorage'),
        pruefung: js`
          await render()
          await type(field('What needs to be done?'), 'Still here')
          await click(button('Add'))
          await waitFor(() => expect(localStorage.getItem('todos') ?? '').toContain('Still here'))
          await remount()
          expect(text()).toContain('Still here')
        `,
      },
    ],
  },
}
