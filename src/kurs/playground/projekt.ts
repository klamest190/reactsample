import { js } from '../../lernen/quelltext'
import type { PlaygroundDaten } from './typen'

/**
 * Playground für Teil 6 (ToDo-Projekt). Die Bausteine passen zur Grundversion der
 * Vorlage: Sie benutzen `todos`, `setTodos` und `text` aus App - wie in den Projektschritten.
 */
export const projektPlayground: PlaygroundDaten = {
  teil: 'projekt',
  modus: 'react',
  hinweis: {
    de: 'Die Bausteine erwarten die Grundversion (todos, setTodos, text in App). Manche brauchen danach noch einen Handgriff - das steht jeweils dabei.',
    en: 'The building blocks expect the basic version (todos, setTodos, text in App). Some need one more manual step afterwards - it says so on each block.',
  },
  vorlagen: [
    {
      titel: { de: 'Grundversion', en: 'Basic version' },
      info: { de: 'Hinzufügen, abhaken, löschen - mit useState.', en: 'Add, check off, delete - with useState.' },
      code: js`
        function App() {
          const [todos, setTodos] = useState([
            { id: 1, text: 'Try the playground', done: false },
            { id: 2, text: 'Add a building block', done: false },
          ])
          const [text, setText] = useState('')

          function addTodo(event) {
            event.preventDefault()
            if (!text.trim()) return
            setTodos([...todos, { id: Date.now(), text: text.trim(), done: false }])
            setText('')
          }

          function toggleTodo(id) {
            setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
          }

          function deleteTodo(id) {
            setTodos(todos.filter((todo) => todo.id !== id))
          }

          return (
            <div>
              <h1>Todos</h1>
              <form onSubmit={addTodo}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs to be done?" />
                <button>Add</button>
              </form>
              <ul>
                {todos.map((todo) => (
                  <li key={todo.id} className={todo.done ? 'done' : ''}>
                    <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />{' '}
                    <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.text}</span>{' '}
                    <button onClick={() => deleteTodo(todo.id)} aria-label={'Delete ' + todo.text}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        }
      `,
    },
    {
      titel: { de: 'Mit useReducer & Speichern', en: 'With useReducer & saving' },
      info: { de: 'Reducer, Filter, „n open“ und localStorage - die ausgebaute Fassung.', en: 'Reducer, filter, "n open" and localStorage - the extended version.' },
      code: js`
        function todosReducer(todos, action) {
          switch (action.type) {
            case 'add':
              return [...todos, { id: Date.now(), text: action.text, done: false }]
            case 'toggle':
              return todos.map((todo) => (todo.id === action.id ? { ...todo, done: !todo.done } : todo))
            case 'delete':
              return todos.filter((todo) => todo.id !== action.id)
            case 'clearDone':
              return todos.filter((todo) => !todo.done)
            default:
              throw new Error('Unknown action: ' + action.type)
          }
        }

        function loadTodos() {
          try {
            return JSON.parse(localStorage.getItem('todos')) ?? []
          } catch {
            return []
          }
        }

        const FILTERS = { All: () => true, Open: (todo) => !todo.done, Done: (todo) => todo.done }

        function App() {
          const [todos, dispatch] = useReducer(todosReducer, undefined, loadTodos)
          const [text, setText] = useState('')
          const [filter, setFilter] = useState('All')

          useEffect(() => {
            localStorage.setItem('todos', JSON.stringify(todos))
          }, [todos])

          function addTodo(event) {
            event.preventDefault()
            if (!text.trim()) return
            dispatch({ type: 'add', text: text.trim() })
            setText('')
          }

          const visible = todos.filter(FILTERS[filter])
          const openCount = todos.filter((todo) => !todo.done).length

          return (
            <div>
              <h1>Todos</h1>
              <form onSubmit={addTodo}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs to be done?" />
                <button>Add</button>
              </form>
              <div>
                {Object.keys(FILTERS).map((name) => (
                  <button key={name} aria-pressed={filter === name} onClick={() => setFilter(name)}>
                    {name}
                  </button>
                ))}
              </div>
              <ul>
                {visible.map((todo) => (
                  <li key={todo.id} className={todo.done ? 'done' : ''}>
                    <input type="checkbox" checked={todo.done} onChange={() => dispatch({ type: 'toggle', id: todo.id })} /> {todo.text}{' '}
                    <button onClick={() => dispatch({ type: 'delete', id: todo.id })} aria-label={'Delete ' + todo.text}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <p>
                {openCount} open <button onClick={() => dispatch({ type: 'clearDone' })}>Clear done</button>
              </p>
            </div>
          )
        }
      `,
    },
    {
      titel: { de: 'Challenge: von null', en: 'Challenge: from scratch' },
      info: { de: 'Nur eine Überschrift. Baue die App selbst - Bausteine helfen, wo du hängst.', en: 'Just a heading. Build the app yourself - building blocks help where you get stuck.' },
      code: js`
        function App() {
          return (
            <div>
              <h1>Todos</h1>
            </div>
          )
        }
      `,
    },
  ],
  gruppen: [
    {
      titel: { de: 'Anzeige', en: 'Display' },
      bausteine: [
        {
          titel: { de: '„n open“', en: '"n open"' },
          info: { de: 'Abgeleiteter Wert: berechnen statt als State speichern.', en: 'A derived value: calculate it instead of storing it as state.' },
          code: 'const openCount = todos.filter((todo) => !todo.done).length',
          ort: 'komponente',
          nutzung: { ort: 'jsx', code: '<p>{openCount} open</p>' },
          kapitel: 'projekt-5-datenfluss',
        },
        {
          titel: { de: 'Leere Liste', en: 'Empty list' },
          info: { de: 'Ein Hinweis, solange es nichts zu tun gibt.', en: 'A note while there is nothing to do.' },
          code: '{todos.length === 0 && <p>Nothing to do 🎉</p>}',
          ort: 'jsx',
          kapitel: 'projekt-3-komponenten',
        },
        {
          titel: { de: 'TodoItem-Komponente', en: 'TodoItem component' },
          info: { de: 'Ein Eintrag als eigene Komponente. Danach: im map von App <TodoItem … /> benutzen.', en: 'One entry as its own component. Then: use <TodoItem … /> in the map inside App.' },
          code: js`
            function TodoItem({ todo, onToggle, onDelete }) {
              return (
                <li className={todo.done ? 'done' : ''}>
                  <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} /> {todo.text}{' '}
                  <button onClick={() => onDelete(todo.id)} aria-label={'Delete ' + todo.text}>
                    ✕
                  </button>
                </li>
              )
            }
          `,
          ort: 'oben',
          nutzung: {
            ort: 'jsx',
            code: "<ul>\n  <TodoItem todo={{ id: 0, text: 'Sample todo', done: true }} onToggle={() => {}} onDelete={() => {}} />\n</ul>",
          },
          kapitel: 'projekt-3-komponenten',
        },
      ],
    },
    {
      titel: { de: 'Aktionen & Filter', en: 'Actions & filter' },
      bausteine: [
        {
          titel: { de: '„Clear done“', en: '"Clear done"' },
          info: { de: 'Alle erledigten auf einmal entfernen.', en: 'Remove all finished todos at once.' },
          code: js`
            function clearDone() {
              setTodos(todos.filter((todo) => !todo.done))
            }
          `,
          ort: 'komponente',
          nutzung: { ort: 'jsx', code: '<button onClick={clearDone}>Clear done</button>' },
          kapitel: 'projekt-4-state',
        },
        {
          titel: { de: 'Filter All/Open/Done', en: 'Filter All/Open/Done' },
          info: { de: 'Danach im JSX todos.map durch visibleTodos.map ersetzen.', en: 'Afterwards replace todos.map with visibleTodos.map in the JSX.' },
          code: js`
            const [filter, setFilter] = useState('All')
            const visibleTodos = todos.filter((todo) => (filter === 'Open' ? !todo.done : filter === 'Done' ? todo.done : true))
          `,
          ort: 'komponente',
          nutzung: {
            ort: 'jsx',
            code: js`
              <div>
                {['All', 'Open', 'Done'].map((name) => (
                  <button key={name} aria-pressed={filter === name} onClick={() => setFilter(name)}>
                    {name}
                  </button>
                ))}
              </div>
            `,
          },
          kapitel: 'projekt-5-datenfluss',
        },
        {
          titel: { de: 'Eingabe prüfen', en: 'Validate input' },
          info: { de: 'Fehlermeldung ableiten und anzeigen. Danach in addTodo: if (error) return', en: 'Derive and show an error message. Then in addTodo: if (error) return' },
          code: "const error = text.length > 40 ? 'Please keep it under 40 characters' : ''",
          ort: 'komponente',
          nutzung: { ort: 'jsx', code: "{error && <p role=\"alert\" style={{ color: 'crimson' }}>{error}</p>}" },
          kapitel: 'projekt-10-validierung',
        },
        {
          titel: { de: 'Reducer für ToDos', en: 'Reducer for todos' },
          info: { de: 'Alle Änderungen an einer Stelle. In App: const [todos, dispatch] = useReducer(todosReducer, [])', en: 'All changes in one place. In App: const [todos, dispatch] = useReducer(todosReducer, [])' },
          code: js`
            function todosReducer(todos, action) {
              switch (action.type) {
                case 'add':
                  return [...todos, { id: Date.now(), text: action.text, done: false }]
                case 'toggle':
                  return todos.map((todo) => (todo.id === action.id ? { ...todo, done: !todo.done } : todo))
                case 'delete':
                  return todos.filter((todo) => todo.id !== action.id)
                default:
                  throw new Error('Unknown action: ' + action.type)
              }
            }
          `,
          ort: 'oben',
          kapitel: 'projekt-6-reducer',
        },
      ],
    },
    {
      titel: { de: 'Speichern, Fokus, Context', en: 'Saving, focus, context' },
      bausteine: [
        {
          titel: { de: 'In localStorage speichern', en: 'Save to localStorage' },
          info: { de: 'Speichert bei jeder Änderung. Zum Laden: useState(() => JSON.parse(localStorage.getItem(\'todos\')) ?? [])', en: 'Saves on every change. To load: useState(() => JSON.parse(localStorage.getItem(\'todos\')) ?? [])' },
          code: js`
            useEffect(() => {
              localStorage.setItem('todos', JSON.stringify(todos))
            }, [todos])
          `,
          ort: 'komponente',
          kapitel: 'projekt-7-speichern',
        },
        {
          titel: { de: 'Hook useLocalStorage', en: 'useLocalStorage hook' },
          info: { de: 'State, der einen Reload überlebt. In App: useLocalStorage(\'todos\', []) statt useState(…)', en: 'State that survives a reload. In App: useLocalStorage(\'todos\', []) instead of useState(…)' },
          code: js`
            function useLocalStorage(key, initialValue) {
              const [value, setValue] = useState(() => {
                try {
                  return JSON.parse(localStorage.getItem(key)) ?? initialValue
                } catch {
                  return initialValue
                }
              })
              useEffect(() => {
                localStorage.setItem(key, JSON.stringify(value))
              }, [key, value])
              return [value, setValue]
            }
          `,
          ort: 'oben',
          kapitel: 'projekt-7-speichern',
        },
        {
          titel: { de: 'Fokus zurück ins Feld', en: 'Focus back into the field' },
          info: { de: 'Danach: ref={inputRef} ans Eingabefeld und inputRef.current.focus() am Ende von addTodo.', en: 'Then: ref={inputRef} on the input and inputRef.current.focus() at the end of addTodo.' },
          code: 'const inputRef = useRef(null)',
          ort: 'komponente',
          kapitel: 'projekt-8-fokus',
        },
        {
          titel: { de: 'Context für die ToDos', en: 'Context for the todos' },
          info: { de: 'Provider und eigener Hook. App in <TodosProvider> packen, Kinder nutzen useTodos().', en: 'Provider and custom hook. Wrap App in <TodosProvider>, children use useTodos().' },
          code: js`
            const TodosContext = createContext(null)

            function TodosProvider({ children }) {
              const [todos, setTodos] = useState([])
              return <TodosContext value={{ todos, setTodos }}>{children}</TodosContext>
            }

            function useTodos() {
              const value = useContext(TodosContext)
              if (!value) throw new Error('useTodos must be used inside <TodosProvider>')
              return value
            }
          `,
          ort: 'oben',
          kapitel: 'projekt-9-context',
        },
      ],
    },
  ],
}
