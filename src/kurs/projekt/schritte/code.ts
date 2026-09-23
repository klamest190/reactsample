import { js } from '../../../lernen/quelltext'

/**
 * The code of the project, step by step. Every step starts with the solution of the one before -
 * so the solutions are built from these blocks and reused as the next step's start.
 */

// --- Schritt 1: reine Funktionen ------------------------------------------------------

export const FUNKTIONEN = js`
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

export const P1_START = js`
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

export const P1_LOESUNG =
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

export const P2_GERUEST = js`
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

export const P2_START =
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

export const P2_LOESUNG =
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

export const START_TODOS = js`
  const initialTodos = [
    { id: 1, text: 'Learn JavaScript', done: true },
    { id: 2, text: 'Learn React', done: false },
    { id: 3, text: 'Build a todo app', done: false },
  ]
`

export const P3_START =
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

export const P3_LOESUNG =
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

export const ITEM_MIT_CALLBACKS = js`
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

export const P4_LOESUNG =
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

export const FILTER_KOMPONENTEN = js`
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

export const P5_LOESUNG =
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

export const REDUCER = js`
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

export const FORM_MIT_ONADD = js`
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
export const APP_VORLAGE = js`
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

export const einruecken = (code: string, n: number) =>
  code
    .split('\n')
    .map((zeile) => (zeile ? ' '.repeat(n) + zeile : zeile))
    .join('\n')

/** Setzt die Hook-Zeile ein und - falls vorhanden - zusätzlichen Code vor dem return. */
export const app6 = (hookZeile: string, extra = '') =>
  APP_VORLAGE.replace('__HOOK__', hookZeile).replace(/^ *__EXTRA__\n/m, extra ? '\n' + einruecken(extra, 2) + '\n\n' : '\n')

export const P6_LOESUNG = [
  START_TODOS,
  REDUCER,
  ITEM_MIT_CALLBACKS,
  FILTER_KOMPONENTEN,
  FORM_MIT_ONADD,
  app6('const [todos, dispatch] = useReducer(todosReducer, initialTodos)'),
].join('\n\n')

// --- Schritt 7: Speichern ---------------------------------------------------------------

export const PERSISTENT_HOOK = js`
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

export const TITEL_EFFEKT = js`
    useEffect(() => {
      document.title = openCount + ' open · Todos'
    }, [openCount])
`

export const P7_LOESUNG = [
  START_TODOS,
  REDUCER,
  PERSISTENT_HOOK,
  ITEM_MIT_CALLBACKS,
  FILTER_KOMPONENTEN,
  FORM_MIT_ONADD,
  app6("const [todos, dispatch] = usePersistentReducer(todosReducer, 'todos', initialTodos)", TITEL_EFFEKT),
].join('\n\n')

// --- Schritt 8: Fokus -------------------------------------------------------------------

export const FORM_MIT_REF = js`
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

export const P8_LOESUNG = [
  START_TODOS,
  REDUCER,
  PERSISTENT_HOOK,
  ITEM_MIT_CALLBACKS,
  FILTER_KOMPONENTEN,
  FORM_MIT_REF,
  app6("const [todos, dispatch] = usePersistentReducer(todosReducer, 'todos', initialTodos)", TITEL_EFFEKT),
].join('\n\n')

// --- Schritt 9: Context -----------------------------------------------------------------

export const CONTEXT = js`
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

export const ITEM_MIT_CONTEXT = js`
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

export const FORM_MIT_CONTEXT = js`
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

export const APP_MIT_CONTEXT = js`
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

export const P9_LOESUNG = [START_TODOS, REDUCER, PERSISTENT_HOOK, CONTEXT, ITEM_MIT_CONTEXT, FILTER_KOMPONENTEN, FORM_MIT_CONTEXT, APP_MIT_CONTEXT].join('\n\n')

// --- Schritt 10: Validierung ------------------------------------------------------------

export const FORM_VALIDIERT = js`
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

export const P10_LOESUNG = [START_TODOS, REDUCER, PERSISTENT_HOOK, CONTEXT, ITEM_MIT_CONTEXT, FILTER_KOMPONENTEN, FORM_VALIDIERT, APP_MIT_CONTEXT].join('\n\n')

// --- Schritt 11: Laden ------------------------------------------------------------------

export const API = js`
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

export const REDUCER_MIT_LOADED = REDUCER.replace(
  "    case 'added': {",
  "    case 'loaded':\n      return action.todos\n    case 'added': {",
)

export const CONTEXT_MIT_LADEN = js`
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

export const P11_LOESUNG = [API, REDUCER_MIT_LOADED, PERSISTENT_HOOK, CONTEXT_MIT_LADEN, ITEM_MIT_CONTEXT, FILTER_KOMPONENTEN, FORM_VALIDIERT, APP_MIT_CONTEXT].join(
  '\n\n',
)

// --- Schritt 12: Challenge --------------------------------------------------------------

export const P12_START = js`
  // Challenge: build the todo app from scratch.
  // The requirements are listed above the editor - the tests check all of them.
  // Structure it however you like: useState or useReducer, one component or many.

  function App() {
    return <h1>Todos</h1>
  }
`

export const P12_LOESUNG = [
  REDUCER,
  PERSISTENT_HOOK,
  ITEM_MIT_CALLBACKS,
  FILTER_KOMPONENTEN,
  FORM_MIT_REF,
  app6("const [todos, dispatch] = usePersistentReducer(todosReducer, 'todos', [])"),
].join('\n\n')
