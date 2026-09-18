import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'react-state-einstieg': {
    code: js`
      function App() {
        const [count, setCount] = useState(0)

        return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
      }
    `,
  },
  'react-state-1': {
    code: js`
      function App() {
        function handleClick() {
          console.log('Clicked!')
        }

        function greet(name) {
          console.log('Hello ' + name)
        }

        return (
          <>
            {/* Pass the function - do NOT call it */}
            <button onClick={handleClick}>Click me</button>

            {/* With an argument: wrap it in an arrow function */}
            <button onClick={() => greet('Ada')}>Greet Ada</button>

            {/* The event object */}
            <input
              placeholder="Type something"
              onChange={(event) => console.log('Input:', event.target.value)}
            />
          </>
        )
      }
    `,
  },
  'react-state-2': {
    code: js`
      function App() {
        let clicks = 0

        function increment() {
          clicks = clicks + 1
          console.log('clicks is now', clicks)
        }

        return (
          <>
            <p>Clicks: {clicks}</p>
            <button onClick={increment}>+1</button>
          </>
        )
      }
    `,
  },
  'react-state-3': {
    code: js`
      function App() {
        const [clicks, setClicks] = useState(0)
        const [name, setName] = useState('')
        const [isLight, setIsLight] = useState(true)

        return (
          <div style={{ background: isLight ? '#fff8e1' : '#263238', color: isLight ? '#000' : '#fff', padding: 12, borderRadius: 8 }}>
            <p>Clicks: {clicks}</p>
            <button onClick={() => setClicks(clicks + 1)}>+1</button>
            <button onClick={() => setClicks(0)}>Reset</button>

            <p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
              {' '}Hello {name || 'stranger'}!
            </p>

            <button onClick={() => setIsLight(!isLight)}>
              {isLight ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        )
      }
    `,
  },
  'react-state-4': {
    code: js`
      function App() {
        const [number, setNumber] = useState(0)
        console.log('Render with number =', number)

        function handleClick() {
          setNumber(number + 1)
          console.log('Right after setNumber:', number)  // still the old value!

          setTimeout(() => {
            console.log('3 seconds later:', number)       // still! (closure)
          }, 3000)
        }

        return (
          <>
            <h2>{number}</h2>
            <button onClick={handleClick}>+1</button>
          </>
        )
      }
    `,
  },
  'react-state-uebung': {
    tipps: {
      de: [
        'Zwei State-Werte: der Text und die Anzahl gesendeter Nachrichten.',
        '„Zu lang“ und „leer“ sind abgeleitete Werte - einfach beim Rendern berechnen.',
        '`disabled={empty || tooLong}` und in `send` den Text zurücksetzen.',
      ],
      en: [
        'Two state values: the text and the number of sent messages.',
        '“Too long” and “empty” are derived values - just compute them while rendering.',
        '`disabled={empty || tooLong}` and reset the text in `send`.',
      ],
    },
    code: js`
      function App() {

        return (
          <div>
            <textarea rows={3} cols={40} />
          </div>
        )
      }
    `,
    loesung: js`
      const MAX = 50

      function App() {
        const [text, setText] = useState('')
        const [sent, setSent] = useState(0)

        // Derived values: no extra state needed!
        const tooLong = text.length > MAX
        const empty = text.trim() === ''

        function send() {
          setSent(sent + 1)
          setText('')
        }

        return (
          <div>
            <textarea rows={3} cols={40} value={text} onChange={(e) => setText(e.target.value)} />
            <p style={{ color: tooLong ? 'red' : undefined }}>
              {text.length} / {MAX} characters
            </p>
            <button onClick={send} disabled={empty || tooLong}>Send</button>
            <p>Sent: {sent}</p>
          </div>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Anfangs: leer, „0 / 50 characters“, Send deaktiviert', en: 'Initially: empty, “0 / 50 characters”, Send disabled' },
        pruefung: js`
          await render()
          expect(field('textarea').value).toBe('')
          expect(text()).toContain('0 / 50 characters')
          expect(button('Send')).toBeDisabled()
        `,
      },
      {
        name: { de: 'Tippen aktualisiert den Zähler und aktiviert Send', en: 'Typing updates the counter and enables Send' },
        pruefung: js`
          await render()
          await type(field('textarea'), 'Hello')
          expect(text()).toContain('5 / 50 characters')
          expect(button('Send')).not.toBeDisabled()
        `,
      },
      {
        name: { de: 'Über 50 Zeichen: Send deaktiviert, Zähler rot', en: 'Over 50 characters: Send disabled, counter red' },
        pruefung: js`
          await render()
          await type(field('textarea'), 'x'.repeat(51))
          expect(button('Send')).toBeDisabled()
          expect(getComputedStyle(getByText('51 / 50')).color).toBe('rgb(255, 0, 0)')
        `,
      },
      {
        name: { de: 'Send leert das Feld und zeigt „Sent: 1“', en: 'Send clears the field and shows “Sent: 1”' },
        pruefung: js`
          await render()
          expect(text()).toContain('Sent: 0')
          await type(field('textarea'), 'Hi there')
          await click(button('Send'))
          expect(field('textarea').value).toBe('')
          expect(text()).toContain('Sent: 1')
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    const [clicks, setClicks] = useState(0)
    //     ▲       ▲                    ▲
    //     │       │                    └─ initial value (only on the first render)
    //     │       └─ setter: store the new value AND trigger a re-render
    //     └─ current value for this render
  `,
}
