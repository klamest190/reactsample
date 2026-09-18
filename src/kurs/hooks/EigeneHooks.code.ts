import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'hooks-eigene-einstieg': {
    code: js`
      function useToggle(initial = false) {
        const [value, setValue] = useState(initial)
        const toggle = () => setValue((v) => !v)
        return [value, toggle]
      }

      function App() {
        const [isOn, toggle] = useToggle()

        return <button onClick={toggle}>{isOn ? 'ON' : 'OFF'}</button>
      }
    `,
  },
  'hooks-eigene-extrahieren': {
    tipps: {
      de: [
        'Verschiebe `useState` und `useEffect` für den Online-Status unverändert in `function useOnlineStatus()`.',
        'Der Hook gibt nur `online` zurück - beide Komponenten rufen ihn einzeln auf.',
      ],
      en: [
        'Move the `useState` and `useEffect` for the online status unchanged into `function useOnlineStatus()`.',
        'The hook only returns `online` - both components call it separately.',
      ],
    },
    code: js`
      // Both components repeat the same logic.
      // Task: extract it into a hook useOnlineStatus().

      function StatusDisplay() {
        const [online, setOnline] = useState(navigator.onLine)
        useEffect(() => {
          const goOnline = () => setOnline(true)
          const goOffline = () => setOnline(false)
          window.addEventListener('online', goOnline)
          window.addEventListener('offline', goOffline)
          return () => {
            window.removeEventListener('online', goOnline)
            window.removeEventListener('offline', goOffline)
          }
        }, [])
        return <p>{online ? '🟢 Online' : '🔴 Offline'}</p>
      }

      function SaveButton() {
        const [online, setOnline] = useState(navigator.onLine)
        useEffect(() => {
          const goOnline = () => setOnline(true)
          const goOffline = () => setOnline(false)
          window.addEventListener('online', goOnline)
          window.addEventListener('offline', goOffline)
          return () => {
            window.removeEventListener('online', goOnline)
            window.removeEventListener('offline', goOffline)
          }
        }, [])
        return <button disabled={!online}>{online ? 'Save' : 'Waiting for connection …'}</button>
      }

      function App() {
        return (
          <>
            <StatusDisplay />
            <SaveButton />
            <p><small>Test it: DevTools → Network → Offline</small></p>
          </>
        )
      }
    `,
    loesung: js`
      function useOnlineStatus() {
        const [online, setOnline] = useState(navigator.onLine)
        useEffect(() => {
          const goOnline = () => setOnline(true)
          const goOffline = () => setOnline(false)
          window.addEventListener('online', goOnline)
          window.addEventListener('offline', goOffline)
          return () => {
            window.removeEventListener('online', goOnline)
            window.removeEventListener('offline', goOffline)
          }
        }, [])
        return online
      }

      function StatusDisplay() {
        const online = useOnlineStatus()
        return <p>{online ? '🟢 Online' : '🔴 Offline'}</p>
      }

      function SaveButton() {
        const online = useOnlineStatus()
        return <button disabled={!online}>{online ? 'Save' : 'Waiting for connection …'}</button>
      }

      function App() {
        return (
          <>
            <StatusDisplay />
            <SaveButton />
            <p><small>Test it: DevTools → Network → Offline</small></p>
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'useOnlineStatus enthält die Logik genau einmal', en: 'useOnlineStatus contains the logic exactly once' },
        pruefung: js`
          expect(code).toMatch(/function useOnlineStatus\s*\(/)
          expect((code.match(/addEventListener\(\s*'online'/g) ?? []).length).toBe(1)
          expect((code.match(/useOnlineStatus\(\)/g) ?? []).length).toBeGreaterThan(2)
        `,
      },
      {
        name: { de: 'Beide Komponenten zeigen den Status', en: 'Both components show the status' },
        pruefung: js`
          await render()
          expect(text()).toMatch(/Online|Offline/)
          expect(button(/Save|Waiting/)).toBeTruthy()
        `,
      },
    ],
  },
  'hooks-eigene-localstorage': {
    code: js`
      // Behaves like useState - but additionally stores the value in localStorage.
      function useLocalStorage(key, initialValue) {
        const [value, setValue] = useState(() => {
          const stored = localStorage.getItem(key)
          return stored !== null ? JSON.parse(stored) : initialValue
        })

        useEffect(() => {
          localStorage.setItem(key, JSON.stringify(value))
        }, [key, value])

        return [value, setValue]   // same shape as useState
      }

      function App() {
        const [name, setName] = useLocalStorage('exercise-name', '')
        const [dark, setDark] = useLocalStorage('exercise-dark', false)

        return (
          <div style={{ background: dark ? '#333' : '#eee', color: dark ? '#fff' : '#000', padding: 12 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <label>
              <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
              dark
            </label>
            <p>Hello {name || '…'}! Click "Run" - the values are kept.</p>
          </div>
        )
      }
    `,
  },
  'hooks-eigene-uebung': {
    tipps: {
      de: [
        'Der Hook bekommt Startwert und ein Optionsobjekt mit Standardwerten: `{ min = -Infinity, max = Infinity } = {}`.',
        'Eine Hilfsfunktion `clamp` hält den Wert in den Grenzen.',
        'Gib ein Objekt zurück: `value`, `increment`, `decrement`, `reset`, `atMin`, `atMax`.',
      ],
      en: [
        'The hook receives an initial value and an options object with defaults: `{ min = -Infinity, max = Infinity } = {}`.',
        'A helper function `clamp` keeps the value within bounds.',
        'Return an object: `value`, `increment`, `decrement`, `reset`, `atMin`, `atMax`.',
      ],
    },
    code: js`
      function useCounter(initial, { min = -Infinity, max = Infinity } = {}) {
        // Your code - nothing counts yet
        return { value: initial }
      }

      function Guests() {
        const { value, increment, decrement, atMin, atMax } = useCounter(2, { min: 1, max: 6 })
        return (
          <p>
            👥 Guests:{' '}
            <button onClick={decrement} disabled={atMin}>−</button> {value}{' '}
            <button onClick={increment} disabled={atMax}>+</button>
          </p>
        )
      }

      function Nights() {
        const { value, increment, decrement, reset, atMin } = useCounter(1, { min: 1 })
        return (
          <p>
            🌙 Nights:{' '}
            <button onClick={decrement} disabled={atMin}>−</button> {value}{' '}
            <button onClick={increment}>+</button>{' '}
            <button onClick={reset}>Reset</button>
          </p>
        )
      }

      function App() {
        return (
          <>
            <Guests />
            <Nights />
          </>
        )
      }
    `,
    loesung: js`
      function useCounter(initial, { min = -Infinity, max = Infinity } = {}) {
        const [value, setValue] = useState(initial)

        const clamp = (x) => Math.min(max, Math.max(min, x))

        return {
          value,
          increment: () => setValue((v) => clamp(v + 1)),
          decrement: () => setValue((v) => clamp(v - 1)),
          reset: () => setValue(initial),
          atMin: value <= min,
          atMax: value >= max,
        }
      }

      function Guests() {
        const { value, increment, decrement, atMin, atMax } = useCounter(2, { min: 1, max: 6 })
        return (
          <p>
            👥 Guests:{' '}
            <button onClick={decrement} disabled={atMin}>−</button> {value}{' '}
            <button onClick={increment} disabled={atMax}>+</button>
          </p>
        )
      }

      function Nights() {
        const { value, increment, decrement, reset, atMin } = useCounter(1, { min: 1 })
        return (
          <p>
            🌙 Nights:{' '}
            <button onClick={decrement} disabled={atMin}>−</button> {value}{' '}
            <button onClick={increment}>+</button>{' '}
            <button onClick={reset}>Reset</button>
          </p>
        )
      }

      function App() {
        return (
          <>
            <Guests />
            <Nights />
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Startwerte werden angezeigt', en: 'Initial values are shown' },
        pruefung: js`
          await render()
          expect(getByText('Guests').textContent).toMatch(/Guests:\D*2/)
          expect(getByText('Nights').textContent).toMatch(/Nights:\D*1/)
        `,
      },
      {
        name: { de: 'increment und decrement zählen', en: 'increment and decrement count' },
        pruefung: js`
          await render()
          await click(within(getByText('Guests')).button('+'))
          expect(getByText('Guests').textContent).toMatch(/Guests:\D*3/)
          await click(within(getByText('Guests')).button('−'))
          expect(getByText('Guests').textContent).toMatch(/Guests:\D*2/)
        `,
      },
      {
        name: { de: 'Der Wert bleibt unter max, atMax deaktiviert +', en: 'The value stays below max, atMax disables +' },
        pruefung: js`
          await render()
          for (let i = 0; i < 4; i++) await click(within(getByText('Guests')).button('+'))
          expect(getByText('Guests').textContent).toMatch(/Guests:\D*6/)
          expect(within(getByText('Guests')).button('+')).toBeDisabled()
        `,
      },
      {
        name: { de: 'atMin deaktiviert −', en: 'atMin disables −' },
        pruefung: js`
          await render()
          expect(within(getByText('Nights')).button('−')).toBeDisabled()
        `,
      },
      {
        name: { de: 'Zähler sind unabhängig, reset funktioniert', en: 'Counters are independent, reset works' },
        pruefung: js`
          await render()
          await click(within(getByText('Nights')).button('+'))
          await click(within(getByText('Nights')).button('+'))
          expect(getByText('Nights').textContent).toMatch(/Nights:\D*3/)
          expect(getByText('Guests').textContent).toMatch(/Guests:\D*2/)
          await click(within(getByText('Nights')).button('Reset'))
          expect(getByText('Nights').textContent).toMatch(/Nights:\D*1/)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    export function useDebounce(value, delayMs = 400) {
      const [debouncedValue, setDebouncedValue] = useState(value)

      useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delayMs)
        return () => clearTimeout(timer)   // discard the old timer on every change
      }, [value, delayMs])

      return debouncedValue
    }
  `,
}
