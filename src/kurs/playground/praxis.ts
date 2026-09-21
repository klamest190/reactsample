import { js } from '../../lernen/quelltext'
import { reactLeer } from './react'
import type { PlaygroundDaten } from './typen'

/**
 * Playground für Teil 5 (Praxis): Formulare, Daten laden, Komposition, Fehler, TypeScript …
 * Daten kommen von einem simulierten Server (fakeFetch im Baustein), damit alles offline läuft.
 */
export const praxisPlayground: PlaygroundDaten = {
  teil: 'praxis',
  modus: 'react',
  hinweis: {
    de: 'TypeScript-Syntax funktioniert hier auch ohne Typprüfung - die Typen werden beim Übersetzen einfach entfernt, wie bei Vite.',
    en: 'TypeScript syntax works here too, just without type checking - types are simply removed when compiling, like in Vite.',
  },
  vorlagen: [
    reactLeer,
    {
      titel: { de: 'Anmeldeformular mit Prüfung', en: 'Sign-up form with validation' },
      info: { de: 'Kontrollierte Felder, Fehlermeldungen und onSubmit.', en: 'Controlled fields, error messages and onSubmit.' },
      code: js`
        function App() {
          const [form, setForm] = useState({ email: '', password: '' })
          const [touched, setTouched] = useState(false)
          const [sent, setSent] = useState(false)

          const errors = {
            email: form.email.includes('@') ? '' : 'Please enter a valid email address',
            password: form.password.length >= 8 ? '' : 'At least 8 characters',
          }
          const valid = !errors.email && !errors.password

          function handleSubmit(event) {
            event.preventDefault()
            setTouched(true)
            if (valid) setSent(true)
          }

          if (sent) return <p>✅ Welcome, {form.email}!</p>

          return (
            <form onSubmit={handleSubmit} noValidate>
              <label>
                Email <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              {touched && errors.email && <p style={{ color: 'crimson' }}>{errors.email}</p>}
              <label>
                Password <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
              {touched && errors.password && <p style={{ color: 'crimson' }}>{errors.password}</p>}
              <button>Sign up</button>
            </form>
          )
        }
      `,
    },
    {
      titel: { de: 'Daten laden', en: 'Loading data' },
      info: { de: 'Laden, Fehler, Ergebnis - die drei Zustände jeder Anfrage.', en: 'Loading, error, result - the three states of every request.' },
      code: js`
        // A pretend server: answers after 600 ms, fails sometimes.
        function fakeFetch(url) {
          return new Promise((resolve, reject) =>
            setTimeout(() => {
              if (Math.random() < 0.2) reject(new Error('Network error - try again'))
              else resolve([{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }, { id: 3, name: 'Linus' }])
            }, 600),
          )
        }

        function App() {
          const [users, setUsers] = useState(null)
          const [error, setError] = useState(null)
          const [reload, setReload] = useState(0)

          useEffect(() => {
            let ignore = false
            fakeFetch('/api/users')
              .then((data) => !ignore && setUsers(data))
              .catch((e) => !ignore && setError(e.message))
            return () => {
              ignore = true
            }
          }, [reload])

          function retry() {
            setUsers(null)
            setError(null)
            setReload(reload + 1)
          }

          return (
            <div>
              {error ? (
                <p>
                  ⚠️ {error} <button onClick={retry}>Retry</button>
                </p>
              ) : !users ? (
                <p>Loading …</p>
              ) : (
                <ul>
                  {users.map((user) => (
                    <li key={user.id}>{user.name}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        }
      `,
    },
    {
      titel: { de: 'TypeScript-Komponente', en: 'TypeScript component' },
      info: { de: 'Props mit Typ, State mit Typ - der Rest ist ganz normales React.', en: 'Typed props, typed state - the rest is plain React.' },
      code: js`
        type Task = { id: number; title: string; done: boolean }

        type TaskRowProps = {
          task: Task
          onToggle: (id: number) => void
        }

        function TaskRow({ task, onToggle }: TaskRowProps) {
          return (
            <li>
              <label>
                <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} /> {task.title}
              </label>
            </li>
          )
        }

        function App() {
          const [tasks, setTasks] = useState<Task[]>([
            { id: 1, title: 'Learn TypeScript', done: false },
            { id: 2, title: 'Build something', done: false },
          ])

          function toggle(id: number) {
            setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
          }

          return (
            <ul>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={toggle} />
              ))}
            </ul>
          )
        }
      `,
    },
  ],
  gruppen: [
    {
      titel: { de: 'Formulare', en: 'Forms' },
      bausteine: [
        {
          titel: { de: 'Formular mit onSubmit', en: 'Form with onSubmit' },
          info: { de: 'preventDefault verhindert das Neuladen der Seite.', en: 'preventDefault stops the page from reloading.' },
          code: js`
            function MessageForm() {
              const [message, setMessage] = useState('')
              function handleSubmit(event) {
                event.preventDefault()
                console.log('Sending:', message)
                setMessage('')
              }
              return (
                <form onSubmit={handleSubmit}>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
                  <button disabled={!message.trim()}>Send</button>
                </form>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<MessageForm />' },
          kapitel: 'praxis-formulare',
        },
        {
          titel: { de: 'Auswahl & Checkbox', en: 'Select & checkbox' },
          info: { de: 'select nutzt value, Checkboxen nutzen checked.', en: 'select uses value, checkboxes use checked.' },
          code: js`
            function PizzaOrder() {
              const [size, setSize] = useState('medium')
              const [extraCheese, setExtraCheese] = useState(false)
              return (
                <div>
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                  <label>
                    <input type="checkbox" checked={extraCheese} onChange={(e) => setExtraCheese(e.target.checked)} /> Extra cheese
                  </label>
                  <p>
                    {size} pizza{extraCheese ? ' with extra cheese' : ''}
                  </p>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<PizzaOrder />' },
          kapitel: 'praxis-formulare',
        },
        {
          titel: { de: 'FormData auslesen', en: 'Reading FormData' },
          info: { de: 'Ungesteuerte Felder: Werte erst beim Absenden einsammeln.', en: 'Uncontrolled fields: collect the values only on submit.' },
          code: js`
            function QuickSurvey() {
              function handleSubmit(event) {
                event.preventDefault()
                const data = Object.fromEntries(new FormData(event.currentTarget))
                console.log(data)
              }
              return (
                <form onSubmit={handleSubmit}>
                  <input name="name" placeholder="Name" />
                  <input name="color" placeholder="Favourite color" />
                  <button>Submit</button>
                </form>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<QuickSurvey />' },
          kapitel: 'praxis-formulare',
        },
      ],
    },
    {
      titel: { de: 'Daten laden', en: 'Loading data' },
      bausteine: [
        {
          titel: { de: 'Laden mit useEffect', en: 'Loading with useEffect' },
          info: { de: 'Mit ignore-Flag gegen veraltete Antworten.', en: 'With an ignore flag against stale responses.' },
          code: js`
            const loadQuote = () => new Promise((resolve) => setTimeout(() => resolve('Simplicity is prerequisite for reliability.'), 500))

            function Quote() {
              const [quote, setQuote] = useState(null)
              useEffect(() => {
                let ignore = false
                loadQuote().then((text) => {
                  if (!ignore) setQuote(text)
                })
                return () => {
                  ignore = true
                }
              }, [])
              return <blockquote>{quote ?? 'Loading …'}</blockquote>
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Quote />' },
          kapitel: 'praxis-daten',
        },
        {
          titel: { de: 'use() mit Suspense', en: 'use() with Suspense' },
          info: { de: 'Das Promise lesen, Suspense zeigt solange einen Platzhalter.', en: 'Read the promise; Suspense shows a placeholder meanwhile.' },
          code: js`
            const weatherPromise = new Promise((resolve) => setTimeout(() => resolve({ city: 'Hamburg', degrees: 14 }), 800))

            function Weather() {
              const weather = use(weatherPromise)
              return (
                <p>
                  {weather.city}: {weather.degrees} °C
                </p>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Suspense fallback={<p>Loading weather …</p>}>\n  <Weather />\n</Suspense>' },
          kapitel: 'hooks-react19',
        },
      ],
    },
    {
      titel: { de: 'Komposition & Portale', en: 'Composition & portals' },
      bausteine: [
        {
          titel: { de: 'Layout mit Slots', en: 'Layout with slots' },
          info: { de: 'Mehrere „Löcher“ per Props - nicht nur children.', en: 'Several "holes" via props - not just children.' },
          code: js`
            function SplitLayout({ left, right }) {
              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, background: '#e0f2fe', padding: 8, borderRadius: 8 }}>{left}</div>
                  <div style={{ flex: 1, background: '#fef3c7', padding: 8, borderRadius: 8 }}>{right}</div>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<SplitLayout left={<p>Left side</p>} right={<p>Right side</p>} />' },
          kapitel: 'praxis-komposition',
        },
        {
          titel: { de: 'Modal mit Portal', en: 'Modal with a portal' },
          info: { de: 'createPortal rendert in document.body - über allem anderen.', en: 'createPortal renders into document.body - above everything else.' },
          code: js`
            function Modal({ onClose, children }) {
              return createPortal(
                <div
                  onClick={onClose}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 100 }}
                >
                  <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', color: 'black', padding: 24, borderRadius: 12 }}>
                    {children}
                    <button onClick={onClose}>Close</button>
                  </div>
                </div>,
                document.body,
              )
            }

            function ModalDemo() {
              const [open, setOpen] = useState(false)
              return (
                <div>
                  <button onClick={() => setOpen(true)}>Open modal</button>
                  {open && <Modal onClose={() => setOpen(false)}>Hello from the portal!</Modal>}
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<ModalDemo />' },
          kapitel: 'praxis-komposition',
        },
      ],
    },
    {
      titel: { de: 'Fehler & TypeScript', en: 'Errors & TypeScript' },
      bausteine: [
        {
          titel: { de: 'Error Boundary', en: 'Error boundary' },
          info: { de: 'Fängt Render-Fehler der Kinder ab - der Rest der App läuft weiter.', en: 'Catches render errors of its children - the rest of the app keeps running.' },
          code: js`
            class ErrorBoundary extends Component {
              state = { error: null }
              static getDerivedStateFromError(error) {
                return { error }
              }
              render() {
                if (this.state.error) return <p>⚠️ Something broke: {this.state.error.message}</p>
                return this.props.children
              }
            }

            function BuggyButton() {
              const [broken, setBroken] = useState(false)
              if (broken) throw new Error('Button exploded')
              return <button onClick={() => setBroken(true)}>Break me</button>
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<ErrorBoundary>\n  <BuggyButton />\n</ErrorBoundary>' },
          importe: ["import { Component } from 'react'"],
          kapitel: 'praxis-fehler',
        },
        {
          titel: { de: 'Props mit Typ', en: 'Typed props' },
          info: { de: 'Ein type beschreibt die Props - optionale mit ?.', en: 'A type describes the props - optional ones with ?.' },
          code: js`
            type BadgeProps = { label: string; count?: number }

            function Badge({ label, count = 0 }: BadgeProps) {
              return (
                <span style={{ background: '#ede9fe', padding: '2px 8px', borderRadius: 99, marginRight: 4 }}>
                  {label}: {count}
                </span>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Badge label="Inbox" count={3} />' },
          kapitel: 'praxis-typescript',
        },
        {
          titel: { de: 'Union-Typ für Zustände', en: 'Union type for states' },
          info: { de: 'Genau einer von mehreren Zuständen - mit passenden Daten.', en: 'Exactly one of several states - each with its own data.' },
          code: js`
            type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'done'; result: string }

            function StatusView() {
              const [status, setStatus] = useState<Status>({ kind: 'idle' })
              function start() {
                setStatus({ kind: 'loading' })
                setTimeout(() => setStatus({ kind: 'done', result: '42' }), 700)
              }
              if (status.kind === 'loading') return <p>Thinking …</p>
              if (status.kind === 'done') return <p>The answer is {status.result}.</p>
              return <button onClick={start}>Ask</button>
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<StatusView />' },
          kapitel: 'praxis-typescript',
        },
      ],
    },
    {
      titel: { de: 'Routing & Barrierefreiheit', en: 'Routing & accessibility' },
      bausteine: [
        {
          titel: { de: 'Mini-Router', en: 'Mini router' },
          info: { de: 'React Router mit MemoryRouter - die Adresse lebt nur im Speicher.', en: 'React Router with MemoryRouter - the address only lives in memory.' },
          code: js`
            function RouterDemo() {
              return (
                <MemoryRouter>
                  <nav style={{ display: 'flex', gap: 8 }}>
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                  </nav>
                  <Routes>
                    <Route path="/" element={<p>🏠 Home page</p>} />
                    <Route path="/about" element={<p>ℹ️ About page</p>} />
                  </Routes>
                </MemoryRouter>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<RouterDemo />' },
          importe: ["import { Link, MemoryRouter, Route, Routes } from 'react-router'"],
          kapitel: 'praxis-routing',
        },
        {
          titel: { de: 'Label & useId', en: 'Label & useId' },
          info: { de: 'Jedes Feld braucht ein Label - useId liefert eine eindeutige id.', en: 'Every field needs a label - useId provides a unique id.' },
          code: js`
            function LabeledField() {
              const id = useId()
              return (
                <div>
                  <label htmlFor={id}>Nickname</label> <input id={id} />
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<LabeledField />' },
          kapitel: 'praxis-barrierefreiheit',
        },
        {
          titel: { de: 'Live-Region', en: 'Live region' },
          info: { de: 'aria-live lässt Screenreader Änderungen vorlesen.', en: 'aria-live makes screen readers announce changes.' },
          code: js`
            function SaveStatus() {
              const [status, setStatus] = useState('')
              function save() {
                setStatus('Saving …')
                setTimeout(() => setStatus('Saved ✓'), 600)
              }
              return (
                <div>
                  <button onClick={save}>Save</button>
                  <p role="status" aria-live="polite">
                    {status}
                  </p>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<SaveStatus />' },
          kapitel: 'praxis-barrierefreiheit',
        },
      ],
    },
  ],
}
