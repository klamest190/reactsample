import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'hooks-useeffect-einstieg': {
    code: js`
      function App() {
        const [count, setCount] = useState(0)

        useEffect(() => {
          console.log(\`Effect: count is now \${count}\`)
        }, [count])

        return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      }
    `,
  },
  'hooks-useeffect-deps': {
    code: js`
      function App() {
        const [a, setA] = useState(0)
        const [b, setB] = useState(0)

        useEffect(() => {
          console.log('[]      → only the first time')
        }, [])

        useEffect(() => {
          console.log('[a]     → a is now', a)
        }, [a])

        useEffect(() => {
          console.log('none    → after every render')
        })

        return (
          <>
            <button onClick={() => setA(a + 1)}>a = {a}</button>
            <button onClick={() => setB(b + 1)}>b = {b}</button>
            <button onClick={() => setA(a)}>set a to the same value</button>
          </>
        )
      }
    `,
  },
  'hooks-useeffect-cleanup': {
    code: js`
      function Stopwatch({ speed }) {
        const [seconds, setSeconds] = useState(0)

        useEffect(() => {
          console.log('▶ Interval started, speed', speed)
          const id = setInterval(() => {
            setSeconds((s) => s + 1)   // updater -> seconds is not a dependency
          }, 1000 / speed)

          return () => {
            console.log('■ Interval stopped, speed', speed)
            clearInterval(id)
          }
        }, [speed])

        return <h2>{seconds} s</h2>
      }

      function App() {
        const [visible, setVisible] = useState(true)
        const [speed, setSpeed] = useState(1)

        return (
          <>
            <button onClick={() => setVisible(!visible)}>
              {visible ? 'Hide' : 'Show'}
            </button>
            <button onClick={() => setSpeed(speed === 1 ? 5 : 1)}>Speed: {speed}×</button>
            {visible && <Stopwatch speed={speed} />}
          </>
        )
      }
    `,
  },
  'hooks-useeffect-stale': {
    code: js`
      function App() {
        const [step, setStep] = useState(1)
        const [value, setValue] = useState(0)

        useEffect(() => {
          const id = setInterval(() => {
            // ❌ "step" is missing from the dependencies - stays 1 forever
            setValue((v) => v + step)
          }, 1000)
          return () => clearInterval(id)
        }, [])   // Fix it to [step]

        return (
          <>
            <h2>{value}</h2>
            <p>
              Step:{' '}
              <input type="number" value={step} onChange={(e) => setStep(Number(e.target.value))} />
            </p>
          </>
        )
      }
    `,
  },
  'hooks-useeffect-uebung': {
    tipps: {
      de: [
        'Ein Effekt startet das Intervall nur, solange der Countdown läuft - und räumt es im Cleanup ab.',
        'Im Intervall die Updater-Funktion nutzen: `setRemaining((r) => r - 1)`.',
        '„Aktiv“ ist abgeleitet: `running && remaining > 0`. Ein zweiter Effekt setzt `document.title`.',
      ],
      en: [
        'An effect starts the interval only while the countdown is running - and clears it in cleanup.',
        'Use the updater function inside the interval: `setRemaining((r) => r - 1)`.',
        '“Active” is derived: `running && remaining > 0`. A second effect sets `document.title`.',
      ],
    },
    code: js`
      const START = 10

      function App() {
        const [remaining, setRemaining] = useState(START)
        const [running, setRunning] = useState(false)

        return (
          <>
            <h1>{remaining}</h1>
            <button>Start</button>
            <button>Reset</button>
          </>
        )
      }
    `,
    loesung: js`
      const START = 10

      function App() {
        const [remaining, setRemaining] = useState(START)
        const [running, setRunning] = useState(false)

        // Derived: automatically finished at 0 - no extra state update
        const active = running && remaining > 0

        // Interval only while the countdown is active
        useEffect(() => {
          if (!active) return
          const id = setInterval(() => setRemaining((r) => r - 1), 1000)
          return () => clearInterval(id)
        }, [active])

        const display = \`0:\${String(remaining).padStart(2, '0')}\`

        useEffect(() => {
          const previous = document.title
          document.title = display
          return () => { document.title = previous }
        }, [display])

        return (
          <>
            <h1>{display}</h1>
            {remaining === 0 && <p>⏰ Take a break!</p>}
            <button onClick={() => setRunning(!running)} disabled={remaining === 0}>
              {active ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => { setRunning(false); setRemaining(START) }}>Reset</button>
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Startet bei „0:10“', en: 'Starts at “0:10”' },
        pruefung: js`
          await render()
          expect(find('h1').textContent).toBe('0:10')
        `,
      },
      {
        name: { de: 'Start zählt jede Sekunde herunter', en: 'Start counts down every second' },
        pruefung: js`
          await render()
          await click(button('Start'))
          await wait(1150)
          expect(find('h1').textContent).toBe('0:09')
        `,
      },
      {
        name: { de: 'Pause hält den Countdown an', en: 'Pause stops the countdown' },
        pruefung: js`
          await render()
          await click(button('Start'))
          await wait(1100)
          await click(button('Pause'))
          const stand = find('h1').textContent
          await wait(1200)
          expect(find('h1').textContent).toBe(stand)
        `,
      },
      {
        name: { de: 'Reset setzt auf 0:10 zurück und stoppt', en: 'Reset goes back to 0:10 and stops' },
        pruefung: js`
          await render()
          await click(button('Start'))
          await wait(1100)
          await click(button('Reset'))
          expect(find('h1').textContent).toBe('0:10')
          await wait(1100)
          expect(find('h1').textContent).toBe('0:10')
        `,
      },
      {
        name: { de: 'Der Tab-Titel zeigt die Restzeit', en: 'The tab title shows the remaining time' },
        pruefung: js`
          await render()
          expect(title()).toBe('0:10')
          await click(button('Start'))
          await wait(1150)
          expect(title()).toBe('0:09')
        `,
      },
      {
        name: { de: 'Bei 0 stoppt er und zeigt „⏰ Take a break!“ (dauert 10 s)', en: 'At 0 it stops and shows “⏰ Take a break!” (takes 10 s)' },
        pruefung: js`
          await render()
          await click(button('Start'))
          await waitFor(() => expect(text()).toContain('⏰ Take a break!'), 12000)
          expect(find('h1').textContent).toBe('0:00')
          await wait(1100)
          expect(find('h1').textContent).toBe('0:00')
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    useEffect(() => {
      // Effect: connect, subscribe, start …

      return () => {
        // Cleanup (optional): disconnect, unsubscribe, stop …
      }
    }, [dependencies])
  `,
  beispiel2: js`
    // ❌ Unnecessary effect: double render, extra state
    const [fullName, setFullName] = useState('')
    useEffect(() => {
      setFullName(firstName + ' ' + lastName)
    }, [firstName, lastName])

    // ✅ Just calculate it
    const fullName = firstName + ' ' + lastName

    // ❌ Effect reacts to a resulting change
    useEffect(() => {
      if (purchased) showToast('Thanks for your purchase!')
    }, [purchased])

    // ✅ Directly in the handler
    function buy() {
      setPurchased(true)
      showToast('Thanks for your purchase!')
    }
  `,
}
