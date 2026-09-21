import { js } from '../../lernen/quelltext'
import { reactLeer } from './react'
import type { PlaygroundDaten } from './typen'

/** Playground für Teil 4 (Hooks): pro Hook eine kleine, fertige Komponente plus Gerüste für App. */
export const hooksPlayground: PlaygroundDaten = {
  teil: 'hooks',
  modus: 'react',
  vorlagen: [
    reactLeer,
    {
      titel: { de: 'Stoppuhr', en: 'Stopwatch' },
      info: { de: 'useState + useEffect mit Intervall und Cleanup + useRef für die Startzeit.', en: 'useState + useEffect with an interval and cleanup + useRef for the start time.' },
      code: js`
        function App() {
          const [running, setRunning] = useState(false)
          const [elapsed, setElapsed] = useState(0)
          const startRef = useRef(0)

          useEffect(() => {
            if (!running) return
            startRef.current = Date.now() - elapsed
            const id = setInterval(() => setElapsed(Date.now() - startRef.current), 50)
            return () => clearInterval(id)
          }, [running]) // elapsed only matters when starting

          return (
            <div>
              <h1 style={{ fontVariantNumeric: 'tabular-nums' }}>{(elapsed / 1000).toFixed(2)} s</h1>
              <button onClick={() => setRunning(!running)}>{running ? 'Stop' : 'Start'}</button>
              <button onClick={() => setElapsed(0)} disabled={running}>
                Reset
              </button>
            </div>
          )
        }
      `,
    },
    {
      titel: { de: 'Warenkorb mit useReducer', en: 'Cart with useReducer' },
      info: { de: 'Alle Änderungen als Aktionen an einer Stelle: der Reducer.', en: 'Every change as an action in one place: the reducer.' },
      code: js`
        function cartReducer(cart, action) {
          switch (action.type) {
            case 'add':
              return { ...cart, [action.item]: (cart[action.item] ?? 0) + 1 }
            case 'remove': {
              const { [action.item]: _, ...rest } = cart
              return rest
            }
            case 'clear':
              return {}
            default:
              throw new Error('Unknown action: ' + action.type)
          }
        }

        function App() {
          const [cart, dispatch] = useReducer(cartReducer, {})
          const entries = Object.entries(cart)

          return (
            <div>
              {['🍎', '🍌', '🥐'].map((item) => (
                <button key={item} onClick={() => dispatch({ type: 'add', item })}>
                  + {item}
                </button>
              ))}
              <ul>
                {entries.map(([item, amount]) => (
                  <li key={item}>
                    {amount} × {item} <button onClick={() => dispatch({ type: 'remove', item })}>✕</button>
                  </li>
                ))}
              </ul>
              {entries.length > 0 && <button onClick={() => dispatch({ type: 'clear' })}>Clear</button>}
            </div>
          )
        }
      `,
    },
    {
      titel: { de: 'Theme mit Context', en: 'Theme with context' },
      info: { de: 'Ein Wert für den ganzen Baum - ohne Props durchzureichen.', en: 'One value for the whole tree - without passing props down.' },
      code: js`
        const ThemeContext = createContext('light')

        function ThemedBox({ children }) {
          const theme = useContext(ThemeContext)
          const dark = theme === 'dark'
          return (
            <div style={{ background: dark ? '#0f172a' : '#f1f5f9', color: dark ? 'white' : 'black', padding: 16, borderRadius: 12 }}>
              {children}
            </div>
          )
        }

        function App() {
          const [theme, setTheme] = useState('light')

          return (
            <ThemeContext value={theme}>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Toggle theme</button>
              <ThemedBox>
                <p>The current theme is {theme}.</p>
              </ThemedBox>
            </ThemeContext>
          )
        }
      `,
    },
  ],
  gruppen: [
    {
      titel: { de: 'Gerüste für App', en: 'Scaffolds for App' },
      bausteine: [
        {
          titel: { de: 'useState', en: 'useState' },
          info: { de: 'Ein Wert, der ein neues Rendern auslöst, wenn er sich ändert.', en: 'A value that triggers a re-render when it changes.' },
          code: 'const [value, setValue] = useState($0)',
          ort: 'komponente',
          kapitel: 'hooks-usestate',
        },
        {
          titel: { de: 'useEffect', en: 'useEffect' },
          info: { de: 'Code nach dem Rendern - mit Cleanup und Abhängigkeiten.', en: 'Code after rendering - with cleanup and dependencies.' },
          code: js`
            useEffect(() => {
              console.log('effect runs')$0
              return () => console.log('cleanup')
            }, [])
          `,
          ort: 'komponente',
          kapitel: 'hooks-useeffect',
        },
        {
          titel: { de: 'useRef', en: 'useRef' },
          info: { de: 'Eine Box, die Renders überlebt - ohne neu zu rendern. Oft für DOM-Elemente.', en: 'A box that survives renders - without re-rendering. Often for DOM elements.' },
          code: 'const boxRef = useRef(null)',
          ort: 'komponente',
          kapitel: 'hooks-useref',
        },
        {
          titel: { de: 'useMemo', en: 'useMemo' },
          info: { de: 'Ergebnis einer Berechnung merken, bis sich die Abhängigkeiten ändern.', en: 'Remember a calculation until its dependencies change.' },
          code: 'const sorted = useMemo(() => [3, 1, 2].toSorted(), [])',
          ort: 'komponente',
          kapitel: 'hooks-usememo',
        },
        {
          titel: { de: 'useCallback', en: 'useCallback' },
          info: { de: 'Dieselbe Funktion über Renders hinweg - wichtig für memo-Kinder.', en: 'The same function across renders - important for memo children.' },
          code: js`
            const handleSave = useCallback(() => {
              console.log('saved')$0
            }, [])
          `,
          ort: 'komponente',
          kapitel: 'hooks-usememo',
        },
      ],
    },
    {
      titel: { de: 'useState & useEffect', en: 'useState & useEffect' },
      bausteine: [
        {
          titel: { de: 'Funktions-Update', en: 'Updater function' },
          info: { de: 'setCount(c => c + 1) rechnet immer mit dem neuesten Wert.', en: 'setCount(c => c + 1) always uses the latest value.' },
          code: js`
            function PlusThree() {
              const [count, setCount] = useState(0)
              function addThree() {
                setCount((c) => c + 1)
                setCount((c) => c + 1)
                setCount((c) => c + 1)
              }
              return <button onClick={addThree}>+3 → {count}</button>
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<PlusThree />' },
          kapitel: 'hooks-usestate',
        },
        {
          titel: { de: 'Objekt im State', en: 'Object in state' },
          info: { de: 'Ein Feld ändern = neues Objekt mit Spread.', en: 'Changing one field = a new object with spread.' },
          code: js`
            function ProfileForm() {
              const [profile, setProfile] = useState({ name: 'Ada', city: 'London' })
              return (
                <div>
                  <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  <input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                  <p>{profile.name} lives in {profile.city}.</p>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<ProfileForm />' },
          kapitel: 'hooks-usestate',
        },
        {
          titel: { de: 'Uhr (Intervall + Cleanup)', en: 'Clock (interval + cleanup)' },
          info: { de: 'Der Effekt startet einen Timer - das Cleanup stoppt ihn wieder.', en: 'The effect starts a timer - the cleanup stops it again.' },
          code: js`
            function Clock() {
              const [now, setNow] = useState(new Date())
              useEffect(() => {
                const id = setInterval(() => setNow(new Date()), 1000)
                return () => clearInterval(id)
              }, [])
              return <p>🕒 {now.toLocaleTimeString()}</p>
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Clock />' },
          kapitel: 'hooks-useeffect',
        },
        {
          titel: { de: 'Fensterbreite beobachten', en: 'Watch the window width' },
          info: { de: 'Event-Listener im Effekt anmelden und im Cleanup abmelden.', en: 'Add an event listener in the effect and remove it in the cleanup.' },
          code: js`
            function WindowWidth() {
              const [width, setWidth] = useState(window.innerWidth)
              useEffect(() => {
                const update = () => setWidth(window.innerWidth)
                window.addEventListener('resize', update)
                return () => window.removeEventListener('resize', update)
              }, [])
              return <p>The window is {width}px wide.</p>
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<WindowWidth />' },
          kapitel: 'hooks-useeffect',
        },
      ],
    },
    {
      titel: { de: 'useRef & useMemo', en: 'useRef & useMemo' },
      bausteine: [
        {
          titel: { de: 'Fokus per Knopf', en: 'Focus with a button' },
          info: { de: 'ref={…} gibt Zugriff auf das echte DOM-Element.', en: 'ref={…} gives access to the real DOM element.' },
          code: js`
            function FocusInput() {
              const inputRef = useRef(null)
              return (
                <div>
                  <input ref={inputRef} placeholder="Click the button" />
                  <button onClick={() => inputRef.current.focus()}>Focus</button>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<FocusInput />' },
          kapitel: 'hooks-useref',
        },
        {
          titel: { de: 'Renders zählen', en: 'Counting renders' },
          info: { de: 'Ein Ref ändern löst KEIN neues Rendern aus.', en: 'Changing a ref does NOT trigger a re-render.' },
          code: js`
            function RenderCounter() {
              const [text, setText] = useState('')
              const renders = useRef(0)
              renders.current++
              return (
                <div>
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type" />
                  <p>Rendered {renders.current} times</p>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<RenderCounter />' },
          kapitel: 'hooks-useref',
        },
        {
          titel: { de: 'Teure Berechnung merken', en: 'Remember an expensive calculation' },
          info: { de: 'Die Primzahlen werden nur neu berechnet, wenn sich die Grenze ändert.', en: 'The primes are only recalculated when the limit changes.' },
          code: js`
            function Primes() {
              const [limit, setLimit] = useState(100)
              const [dark, setDark] = useState(false)
              const primes = useMemo(() => {
                console.log('calculating primes up to', limit)
                const result = []
                for (let n = 2; n <= limit; n++) {
                  if (result.every((p) => n % p !== 0)) result.push(n)
                }
                return result
              }, [limit])
              return (
                <div style={{ background: dark ? '#1e293b' : 'transparent', color: dark ? 'white' : 'inherit', padding: 8 }}>
                  <input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
                  <button onClick={() => setDark(!dark)}>Toggle color (no recalculation)</button>
                  <p>{primes.length} primes, the last is {primes.at(-1)}</p>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Primes />' },
          kapitel: 'hooks-usememo',
        },
      ],
    },
    {
      titel: { de: 'useReducer & useContext', en: 'useReducer & useContext' },
      bausteine: [
        {
          titel: { de: 'Zähler mit Reducer', en: 'Counter with a reducer' },
          info: { de: 'dispatch({ type }) statt vieler Setter.', en: 'dispatch({ type }) instead of many setters.' },
          code: js`
            function counterReducer(state, action) {
              switch (action.type) {
                case 'increment':
                  return state + 1
                case 'decrement':
                  return state - 1
                case 'reset':
                  return 0
                default:
                  return state
              }
            }

            function ReducerCounter() {
              const [count, dispatch] = useReducer(counterReducer, 0)
              return (
                <div>
                  <button onClick={() => dispatch({ type: 'decrement' })}>−</button>
                  <strong> {count} </strong>
                  <button onClick={() => dispatch({ type: 'increment' })}>+</button>
                  <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<ReducerCounter />' },
          kapitel: 'hooks-usereducer',
        },
        {
          titel: { de: 'Context: Sprache', en: 'Context: language' },
          info: { de: 'Provider oben, useContext tief unten - dazwischen keine Props.', en: 'Provider at the top, useContext deep down - no props in between.' },
          code: js`
            const LanguageContext = createContext('en')

            function Welcome() {
              const language = useContext(LanguageContext)
              return <p>{language === 'de' ? 'Willkommen!' : 'Welcome!'}</p>
            }

            function LanguageDemo() {
              const [language, setLanguage] = useState('en')
              return (
                <LanguageContext value={language}>
                  <button onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}>Switch language</button>
                  <Welcome />
                </LanguageContext>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<LanguageDemo />' },
          kapitel: 'hooks-usecontext',
        },
      ],
    },
    {
      titel: { de: 'Eigene Hooks', en: 'Custom hooks' },
      bausteine: [
        {
          titel: { de: 'useToggle', en: 'useToggle' },
          info: { de: 'Logik mit Hooks in eine eigene Funktion auslagern.', en: 'Move hook logic into a function of its own.' },
          code: js`
            function useToggle(start = false) {
              const [on, setOn] = useState(start)
              const toggle = useCallback(() => setOn((o) => !o), [])
              return [on, toggle]
            }

            function Lamp() {
              const [on, toggle] = useToggle()
              return <button onClick={toggle}>{on ? '💡 on' : '🌑 off'}</button>
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Lamp />' },
          kapitel: 'hooks-eigene',
        },
        {
          titel: { de: 'useDebounce', en: 'useDebounce' },
          info: { de: 'Einen Wert erst weitergeben, wenn eine Weile nichts passiert.', en: 'Only pass on a value once nothing has happened for a while.' },
          code: js`
            function useDebounce(value, ms) {
              const [debounced, setDebounced] = useState(value)
              useEffect(() => {
                const id = setTimeout(() => setDebounced(value), ms)
                return () => clearTimeout(id)
              }, [value, ms])
              return debounced
            }

            function SearchBox() {
              const [query, setQuery] = useState('')
              const debounced = useDebounce(query, 500)
              return (
                <div>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
                  <p>Searching for: {debounced}</p>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<SearchBox />' },
          kapitel: 'hooks-eigene',
        },
      ],
    },
    {
      titel: { de: 'Nebenläufig & React 19', en: 'Concurrent & React 19' },
      bausteine: [
        {
          titel: { de: 'useDeferredValue', en: 'useDeferredValue' },
          info: { de: 'Die Eingabe bleibt flüssig, die lange Liste zieht nach.', en: 'Typing stays smooth, the long list catches up.' },
          code: js`
            const WORDS = Array.from({ length: 5000 }, (_, i) => 'item ' + i)

            function DeferredList() {
              const [query, setQuery] = useState('')
              const deferred = useDeferredValue(query)
              const matches = useMemo(() => WORDS.filter((w) => w.includes(deferred)), [deferred])
              return (
                <div>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter 5000 items" />
                  <p style={{ opacity: query !== deferred ? 0.5 : 1 }}>{matches.length} matches</p>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<DeferredList />' },
          kapitel: 'hooks-nebenlaeufig',
        },
        {
          titel: { de: 'useActionState', en: 'useActionState' },
          info: { de: 'Formular-Aktion mit Ergebnis und „läuft gerade“ in einem Hook.', en: 'A form action with its result and "pending" in one hook.' },
          code: js`
            async function subscribe(previous, formData) {
              await new Promise((resolve) => setTimeout(resolve, 500))
              const email = formData.get('email')
              return email.includes('@') ? 'Subscribed ' + email : 'That is not an email address'
            }

            function Newsletter() {
              const [message, formAction, pending] = useActionState(subscribe, '')
              return (
                <form action={formAction}>
                  <input name="email" placeholder="you@example.com" />
                  <button disabled={pending}>{pending ? 'Sending …' : 'Subscribe'}</button>
                  {message && <p>{message}</p>}
                </form>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Newsletter />' },
          kapitel: 'hooks-react19',
        },
      ],
    },
  ],
}
