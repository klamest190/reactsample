import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'hooks-useref-einstieg': {
    code: js`
      function App() {
        const inputRef = useRef(null)

        return (
          <>
            <input ref={inputRef} placeholder="Type here" />
            <button onClick={() => inputRef.current.focus()}>Focus the input</button>
          </>
        )
      }
    `,
  },
  'hooks-useref-vergleich': {
    code: js`
      function App() {
        const [stateClicks, setStateClicks] = useState(0)
        const refClicks = useRef(0)

        return (
          <>
            <button onClick={() => setStateClicks(stateClicks + 1)}>
              State: {stateClicks}
            </button>
            <button
              onClick={() => {
                refClicks.current++
                console.log('refClicks.current =', refClicks.current)
              }}
            >
              Ref: {refClicks.current}
            </button>
            <p>
              Click "Ref" several times - the display doesn't change until a
              state click triggers a re-render.
            </p>
          </>
        )
      }
    `,
  },
  'hooks-useref-dom': {
    code: js`
      function App() {
        const input = useRef(null)
        const listEnd = useRef(null)
        const [entries, setEntries] = useState(['One', 'Two', 'Three'])

        function addEntry() {
          setEntries((prev) => [...prev, 'Entry ' + (prev.length + 1)])
          // Scroll to the end after the next render
          setTimeout(() => listEnd.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
        }

        return (
          <>
            <input ref={input} placeholder="I get focused" />
            <button onClick={() => input.current.focus()}>Focus</button>
            <button onClick={() => console.log('Width:', input.current.offsetWidth, 'px')}>
              Measure width
            </button>

            <div style={{ height: 90, overflowY: 'auto', border: '1px solid #ccc', marginTop: 8 }}>
              {entries.map((e) => <div key={e}>{e}</div>)}
              <div ref={listEnd} />
            </div>
            <button onClick={addEntry}>Add entry</button>
          </>
        )
      }
    `,
  },
  'hooks-useref-uebung': {
    tipps: {
      de: [
        'Interval-ID und Startzeit ändern nichts an der Anzeige - sie gehören in Refs.',
        'Beim Fortsetzen die schon vergangene Zeit abziehen: `startTime.current = Date.now() - ms`.',
        'Aufräumen beim Entfernen: `useEffect(() => () => clearInterval(interval.current), [])`.',
      ],
      en: [
        'The interval ID and start time don’t affect the display - they belong in refs.',
        'When resuming, subtract the elapsed time: `startTime.current = Date.now() - ms`.',
        'Clean up on unmount: `useEffect(() => () => clearInterval(interval.current), [])`.',
      ],
    },
    code: js`
      function App() {
        const [ms, setMs] = useState(0)
        const [laps, setLaps] = useState([])

        return (
          <>
            <h1>{(ms / 1000).toFixed(1)} s</h1>
            <button>Start</button>
            <button>Stop</button>
            <button>Lap</button>
            <button>Reset</button>
          </>
        )
      }
    `,
    loesung: js`
      function App() {
        const [ms, setMs] = useState(0)
        const [laps, setLaps] = useState([])
        const [running, setRunning] = useState(false)
        const interval = useRef(null)
        const startTime = useRef(0)

        function start() {
          // Account for time already elapsed (continue after stop)
          startTime.current = Date.now() - ms
          interval.current = setInterval(() => {
            setMs(Date.now() - startTime.current)
          }, 100)
          setRunning(true)
        }

        function stop() {
          clearInterval(interval.current)
          setRunning(false)
        }

        function reset() {
          stop()
          setMs(0)
          setLaps([])
        }

        useEffect(() => () => clearInterval(interval.current), [])

        return (
          <>
            <h1>{(ms / 1000).toFixed(1)} s</h1>
            <button onClick={start} disabled={running}>Start</button>
            <button onClick={stop} disabled={!running}>Stop</button>
            <button onClick={() => setLaps((l) => [...l, ms])} disabled={!running}>Lap</button>
            <button onClick={reset}>Reset</button>
            <ol>
              {laps.map((lap, i) => <li key={i}>{(lap / 1000).toFixed(1)} s</li>)}
            </ol>
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Startet bei „0.0 s“', en: 'Starts at “0.0 s”' },
        pruefung: js`
          await render()
          expect(find('h1').textContent).toBe('0.0 s')
        `,
      },
      {
        name: { de: 'Start lässt die Zeit laufen', en: 'Start makes the time run' },
        pruefung: js`
          await render()
          await click(button('Start'))
          await wait(450)
          expect(find('h1').textContent).not.toBe('0.0 s')
        `,
      },
      {
        name: { de: 'Stop hält die Zeit an', en: 'Stop freezes the time' },
        pruefung: js`
          await render()
          await click(button('Start'))
          await wait(350)
          await click(button('Stop'))
          const stand = find('h1').textContent
          await wait(400)
          expect(find('h1').textContent).toBe(stand)
        `,
      },
      {
        name: { de: 'Lap speichert eine Rundenzeit als Listeneintrag', en: 'Lap stores a lap time as a list item' },
        pruefung: js`
          await render()
          await click(button('Start'))
          await wait(250)
          await click(button('Lap'))
          expect(findAll('li')).toHaveLength(1)
        `,
      },
      {
        name: { de: 'Reset setzt Zeit und Runden zurück', en: 'Reset clears time and laps' },
        pruefung: js`
          await render()
          await click(button('Start'))
          await wait(250)
          await click(button('Lap'))
          await click(button('Reset'))
          expect(find('h1').textContent).toBe('0.0 s')
          expect(findAll('li')).toHaveLength(0)
        `,
      },
      {
        name: { de: 'Intervall-ID und Startzeit liegen in Refs', en: 'Interval ID and start time live in refs' },
        pruefung: js`
          expect((code.match(/useRef\(/g) ?? []).length).toBeGreaterThan(1)
        `,
      },
    ],
  },
  'hooks-useref-imperativ': {
    code: js`
      function SearchField({ ref }) {
        const inputRef = useRef(null)
        const [value, setValue] = useState('')

        // The parent does not get the whole <input> - only these two methods
        useImperativeHandle(ref, () => ({
          focus: () => inputRef.current.focus(),
          clear: () => {
            setValue('')
            inputRef.current.focus()
          },
        }), [])

        return <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search" />
      }

      function App() {
        const searchRef = useRef(null)
        return (
          <>
            <SearchField ref={searchRef} />{' '}
            <button onClick={() => searchRef.current.focus()}>Focus</button>{' '}
            <button onClick={() => searchRef.current.clear()}>Clear</button>{' '}
            <button onClick={() => console.log('The parent sees:', Object.keys(searchRef.current))}>
              What does the parent see?
            </button>
          </>
        )
      }
    `,
  },
  'hooks-useref-layout': {
    code: js`
      function MeasuredBox({ text }) {
        const boxRef = useRef(null)
        const [height, setHeight] = useState(0)

        // Runs after React has updated the DOM but BEFORE the browser paints.
        // The measured value is shown in the very same frame - no flicker.
        useLayoutEffect(() => {
          setHeight(boxRef.current.getBoundingClientRect().height)
        }, [text])

        return (
          <>
            <div ref={boxRef} style={{ width: 220, padding: 8, border: '1px solid #94a3b8', borderRadius: 6 }}>
              {text}
            </div>
            <p>This box is {Math.round(height)} px high.</p>
          </>
        )
      }

      function App() {
        const [text, setText] = useState('Type more text and watch the height.')
        return (
          <>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} cols={40} />
            <MeasuredBox text={text} />
          </>
        )
      }
    `,
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    function SearchField({ ref, ...props }) {
      return <input ref={ref} type="search" {...props} />
    }

    // Usage:
    const field = useRef(null)
    <SearchField ref={field} placeholder="Search" />
  `,
}
