import { js } from '../../lernen/quelltext'
import type { UebungsSammlung } from './typen'

/** Zusätzliche Übungen für Teil 4 (Hooks) - gestuft wie in js.ts. */

const t = (de: string, en: string) => ({ de, en })

export const uebungen: UebungsSammlung = {
  'hooks-usestate': [
    {
      id: 'hooks-usestate-updater',
      stufe: 'vorhersage',
      titel: t('Updater und Wert gemischt', 'Updaters and values mixed'),
      frage: t('`count` ist 0. Welchen Wert hat `count` nach dem Klick?', '`count` is 0. What is `count` after the click?'),
      code: js`
        function handleClick() {
          setCount((c) => c + 1)
          setCount((c) => c + 1)
          setCount(count + 5)
        }
      `,
      antworten: ['7', '5', '2', '1'],
      richtig: 1,
      erklaerung: t(
        'React arbeitet die Updates der Reihe nach ab: 0 → 1 → 2. Dann `setCount(count + 5)` mit dem Schnappschuss `count = 0` - das ersetzt alles durch 5.',
        'React processes the updates in order: 0 → 1 → 2. Then `setCount(count + 5)` with the snapshot `count = 0` - which replaces everything with 5.',
      ),
    },
    {
      id: 'hooks-usestate-mutation',
      stufe: 'fehler',
      wiederholung: 'js-referenzen',
      titel: t('„Add“ tut nichts', '“Add” does nothing'),
      aufgabe: t('Ein Klick auf „Add“ soll einen Eintrag hinzufügen. Die Liste bleibt aber gleich. Warum?', 'Clicking “Add” should add an item. But the list stays the same. Why?'),
      modus: 'react',
      code: js`
        function App() {
          const [items, setItems] = useState(['Learn hooks'])

          function add() {
            items.push('Item ' + (items.length + 1))
            setItems(items)
          }

          return (
            <>
              <button onClick={add}>Add</button>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )
        }
      `,
      loesung: js`
        function App() {
          const [items, setItems] = useState(['Learn hooks'])

          function add() {
            setItems([...items, 'Item ' + (items.length + 1)])
          }

          return (
            <>
              <button onClick={add}>Add</button>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )
        }
      `,
      tipps: {
        de: ['React vergleicht mit `Object.is`: Ist es noch **dasselbe** Array, wird nicht neu gerendert.', 'Erzeuge ein neues Array: `setItems([...items, neu])`.'],
        en: ['React compares with `Object.is`: if it is still the **same** array, nothing re-renders.', 'Create a new array: `setItems([...items, newItem])`.'],
      },
      tests: [
        {
          name: t('Zwei Klicks ergeben drei Einträge', 'Two clicks give three items'),
          pruefung: js`
            await render()
            await click(button('Add'))
            await click(button('Add'))
            expect(findAll('li')).toHaveLength(3)
          `,
        },
        {
          name: t('Kein push auf dem State', 'No push on the state'),
          pruefung: js`
            expect(code).not.toMatch(/items\.push/)
          `,
        },
      ],
    },
    {
      id: 'hooks-usestate-objekt',
      stufe: 'ergaenzen',
      titel: t('Ein Handler für mehrere Felder', 'One handler for several fields'),
      aufgabe: t(
        'Ergänze `handleChange`: Es aktualisiert das passende Feld im Objekt `person` anhand von `e.target.name`. Darunter steht „Hello Ada Lovelace“.',
        'Complete `handleChange`: it updates the matching field of the `person` object based on `e.target.name`. Below, it shows “Hello Ada Lovelace”.',
      ),
      modus: 'react',
      code: js`
        function App() {
          const [person, setPerson] = useState({ firstName: '', lastName: '' })

          function handleChange(e) {
            // TODO
          }

          return (
            <>
              <input name="firstName" value={person.firstName} onChange={handleChange} placeholder="First name" />
              <input name="lastName" value={person.lastName} onChange={handleChange} placeholder="Last name" />
              <p>
                Hello {person.firstName} {person.lastName}
              </p>
            </>
          )
        }
      `,
      loesung: js`
        function App() {
          const [person, setPerson] = useState({ firstName: '', lastName: '' })

          function handleChange(e) {
            setPerson({ ...person, [e.target.name]: e.target.value })
          }

          return (
            <>
              <input name="firstName" value={person.firstName} onChange={handleChange} placeholder="First name" />
              <input name="lastName" value={person.lastName} onChange={handleChange} placeholder="Last name" />
              <p>
                Hello {person.firstName} {person.lastName}
              </p>
            </>
          )
        }
      `,
      tipps: {
        de: ['Ein berechneter Schlüssel: `{ [e.target.name]: e.target.value }`.', 'Die anderen Felder mit Spread übernehmen: `{ ...person, … }`.'],
        en: ['A computed key: `{ [e.target.name]: e.target.value }`.', 'Keep the other fields with spread: `{ ...person, … }`.'],
      },
      tests: [
        {
          name: t('Beide Felder werden übernommen', 'Both fields are applied'),
          pruefung: js`
            await render()
            await type(field('firstName'), 'Ada')
            await type(field('lastName'), 'Lovelace')
            expect(text()).toContain('Hello Ada Lovelace')
          `,
        },
      ],
    },
  ],

  'hooks-useeffect': [
    {
      id: 'hooks-useeffect-ohne-deps',
      stufe: 'vorhersage',
      titel: t('Effekt ohne Abhängigkeiten', 'Effect without dependencies'),
      frage: t('Die Komponente erscheint, dann wird zweimal geklickt. Wie oft steht „effect“ in der Konsole?', 'The component appears, then the button is clicked twice. How often is “effect” logged?'),
      code: js`
        function Counter() {
          const [count, setCount] = useState(0)
          useEffect(() => {
            console.log('effect')
          })
          return <button onClick={() => setCount(count + 1)}>{count}</button>
        }
      `,
      antworten: { de: ['1', '2', '3', 'Endlos'], en: ['1', '2', '3', 'Endlessly'] },
      richtig: 2,
      erklaerung: t(
        'Ohne Abhängigkeits-Array läuft ein Effekt nach **jedem** Render: einmal beim Anzeigen, dann nach jedem der zwei Klicks. Mit `[]` wäre es nur einmal.',
        'Without a dependency array, an effect runs after **every** render: once on display, then after each of the two clicks. With `[]` it would run only once.',
      ),
    },
    {
      id: 'hooks-useeffect-intervall',
      stufe: 'fehler',
      wiederholung: 'js-funktionen',
      titel: t('Die Uhr bleibt bei 1 stehen', 'The clock gets stuck at 1'),
      aufgabe: t(
        'Die Anzeige soll alle 100 ms um eins steigen, bleibt aber bei 1 stehen. Außerdem fehlt das Aufräumen. Behebe beides.',
        'The display should go up by one every 100 ms but gets stuck at 1. Cleanup is missing too. Fix both.',
      ),
      modus: 'react',
      code: js`
        function App() {
          const [ticks, setTicks] = useState(0)

          useEffect(() => {
            setInterval(() => {
              setTicks(ticks + 1)
            }, 100)
          }, [])

          return <p>Ticks: {ticks}</p>
        }
      `,
      loesung: js`
        function App() {
          const [ticks, setTicks] = useState(0)

          useEffect(() => {
            const id = setInterval(() => {
              setTicks((t) => t + 1)
            }, 100)
            return () => clearInterval(id)
          }, [])

          return <p>Ticks: {ticks}</p>
        }
      `,
      tipps: {
        de: ['Der Timer-Callback stammt aus dem ersten Render - dort ist `ticks` für immer 0 (Stale Closure).', 'Updater-Funktion: `setTicks((t) => t + 1)`.', 'Cleanup: `const id = setInterval(…)` und `return () => clearInterval(id)`.'],
        en: ['The timer callback comes from the first render - where `ticks` is 0 forever (stale closure).', 'Updater function: `setTicks((t) => t + 1)`.', 'Cleanup: `const id = setInterval(…)` and `return () => clearInterval(id)`.'],
      },
      tests: [
        {
          name: t('Zählt weiter', 'Keeps counting'),
          pruefung: js`
            await render()
            await wait(550)
            const ticks = Number(text().match(/\d+/)[0])
            expect(ticks).toBeGreaterThan(2)
          `,
        },
        {
          name: t('Intervall wird aufgeräumt', 'Interval is cleaned up'),
          pruefung: js`
            expect(code).toMatch(/clearInterval\(/)
            expect(code).toMatch(/return\s*\(\)\s*=>/)
          `,
        },
      ],
    },
    {
      id: 'hooks-useeffect-titel',
      stufe: 'ergaenzen',
      titel: t('Tab-Titel synchronisieren', 'Sync the tab title'),
      aufgabe: t('Halte `document.title` mit dem Zähler synchron: „Clicked 0 times“, „Clicked 1 times“ …', 'Keep `document.title` in sync with the counter: “Clicked 0 times”, “Clicked 1 times” …'),
      modus: 'react',
      code: js`
        function App() {
          const [count, setCount] = useState(0)

          // TODO: update document.title

          return <button onClick={() => setCount(count + 1)}>Click me</button>
        }
      `,
      loesung: js`
        function App() {
          const [count, setCount] = useState(0)

          useEffect(() => {
            document.title = 'Clicked ' + count + ' times'
          }, [count])

          return <button onClick={() => setCount(count + 1)}>Click me</button>
        }
      `,
      tipps: {
        de: ['Der Titel gehört zur Außenwelt - also `useEffect`.', 'Abhängigkeit: `[count]`.'],
        en: ['The title belongs to the outside world - so `useEffect`.', 'Dependency: `[count]`.'],
      },
      tests: [
        {
          name: t('Titel folgt dem Zähler', 'Title follows the counter'),
          pruefung: js`
            await render()
            await waitFor(() => expect(title()).toBe('Clicked 0 times'))
            await click(button('Click me'))
            await waitFor(() => expect(title()).toBe('Clicked 1 times'))
          `,
        },
        {
          name: t('Mit useEffect', 'With useEffect'),
          pruefung: js`
            expect(code).toMatch(/useEffect\(/)
          `,
        },
      ],
    },
  ],

  'hooks-useref': [
    {
      id: 'hooks-useref-kein-render',
      stufe: 'vorhersage',
      titel: t('Ref statt State', 'Ref instead of state'),
      frage: t('Der Knopf wird dreimal geklickt. Was zeigt er an?', 'The button is clicked three times. What does it show?'),
      code: js`
        function App() {
          const clicks = useRef(0)
          return <button onClick={() => clicks.current++}>{clicks.current}</button>
        }
      `,
      antworten: ['0', '1', '3', 'NaN'],
      richtig: 0,
      erklaerung: t(
        '`clicks.current` ist zwar 3, aber eine Ref-Änderung löst **keinen** Render aus. Was angezeigt werden soll, gehört in State.',
        '`clicks.current` is 3, but changing a ref does **not** trigger a render. Anything that should be displayed belongs in state.',
      ),
    },
    {
      id: 'hooks-useref-timer',
      stufe: 'fehler',
      titel: t('Stopp stoppt nicht', 'Stop does not stop'),
      aufgabe: t('Nach „Start“ läuft die Stoppuhr, aber „Stop“ hält sie nicht an. Finde heraus, wo die Timer-ID verloren geht.', 'After “Start” the stopwatch runs, but “Stop” does not halt it. Find out where the timer ID gets lost.'),
      modus: 'react',
      code: js`
        function App() {
          const [time, setTime] = useState(0)
          let intervalId = null

          function start() {
            intervalId = setInterval(() => setTime((t) => t + 1), 50)
          }

          function stop() {
            clearInterval(intervalId)
          }

          return (
            <>
              <p>Time: {time}</p>
              <button onClick={start}>Start</button>
              <button onClick={stop}>Stop</button>
            </>
          )
        }
      `,
      loesung: js`
        function App() {
          const [time, setTime] = useState(0)
          const intervalRef = useRef(null)

          function start() {
            clearInterval(intervalRef.current)
            intervalRef.current = setInterval(() => setTime((t) => t + 1), 50)
          }

          function stop() {
            clearInterval(intervalRef.current)
          }

          return (
            <>
              <p>Time: {time}</p>
              <button onClick={start}>Start</button>
              <button onClick={stop}>Stop</button>
            </>
          )
        }
      `,
      tipps: {
        de: ['Nach jedem Render ist `intervalId` wieder `null` - die Funktion `App` läuft ja komplett neu.', 'Eine Ref überlebt Renders: `const intervalRef = useRef(null)`.'],
        en: ['After every render, `intervalId` is `null` again - the `App` function runs from scratch.', 'A ref survives renders: `const intervalRef = useRef(null)`.'],
      },
      tests: [
        {
          name: t('Stop hält die Uhr an', 'Stop halts the clock'),
          pruefung: js`
            await render()
            await click(button('Start'))
            await wait(200)
            await click(button('Stop'))
            const stopped = text()
            await wait(200)
            expect(text()).toBe(stopped)
            expect(stopped).not.toContain('Time: 0')
          `,
        },
      ],
    },
    {
      id: 'hooks-useref-fokus',
      stufe: 'ergaenzen',
      titel: t('Feld fokussieren', 'Focus an input'),
      aufgabe: t('Ein Klick auf „Focus“ soll den Cursor ins Eingabefeld setzen.', 'Clicking “Focus” should put the cursor into the input.'),
      modus: 'react',
      code: js`
        function App() {
          // TODO: create a ref and connect it to the input

          return (
            <>
              <input placeholder="Your name" />
              <button>Focus</button>
            </>
          )
        }
      `,
      loesung: js`
        function App() {
          const inputRef = useRef(null)

          return (
            <>
              <input ref={inputRef} placeholder="Your name" />
              <button onClick={() => inputRef.current.focus()}>Focus</button>
            </>
          )
        }
      `,
      tipps: {
        de: ['`const inputRef = useRef(null)` und `<input ref={inputRef} />`.', 'Im Klick-Handler: `inputRef.current.focus()`.'],
        en: ['`const inputRef = useRef(null)` and `<input ref={inputRef} />`.', 'In the click handler: `inputRef.current.focus()`.'],
      },
      tests: [
        {
          name: t('Klick fokussiert das Feld', 'Click focuses the input'),
          pruefung: js`
            await render()
            button('Focus').focus()
            await click(button('Focus'))
            expect(focused()).toBe(field('Your name'))
          `,
        },
      ],
    },
  ],

  'hooks-usememo': [
    {
      id: 'hooks-usememo-style',
      stufe: 'vorhersage',
      titel: t('memo und neue Objekte', 'memo and new objects'),
      frage: t('`Child` ist mit `memo` umhüllt. Rendert es neu, wenn `App` neu rendert?', '`Child` is wrapped in `memo`. Does it re-render when `App` re-renders?'),
      code: js`
        const Child = memo(function Child({ style }) {
          return <p style={style}>Hi</p>
        })

        function App() {
          const [count, setCount] = useState(0)
          return (
            <>
              <button onClick={() => setCount(count + 1)}>{count}</button>
              <Child style={{ color: 'tomato' }} />
            </>
          )
        }
      `,
      antworten: {
        de: ['Nein, memo verhindert es', 'Ja, jedes Mal', 'Nur beim ersten Klick', 'Nur, wenn sich die Farbe ändert'],
        en: ['No, memo prevents it', 'Yes, every time', 'Only on the first click', 'Only when the color changes'],
      },
      richtig: 1,
      erklaerung: t(
        '`{ color: \'tomato\' }` ist bei jedem Render ein **neues** Objekt. `memo` vergleicht per Referenz und sieht eine geänderte Prop. Abhilfe: Objekt außerhalb der Komponente oder `useMemo`.',
        '`{ color: \'tomato\' }` is a **new** object on every render. `memo` compares by reference and sees a changed prop. Fix: define the object outside the component or use `useMemo`.',
      ),
    },
    {
      id: 'hooks-usememo-deps',
      stufe: 'fehler',
      titel: t('Die Suche filtert nicht', 'The search does not filter'),
      aufgabe: t('Beim Tippen soll die Liste gefiltert werden. Sie bleibt aber unverändert.', 'Typing should filter the list. But it stays unchanged.'),
      modus: 'react',
      code: js`
        const FRUITS = ['Apple', 'Apricot', 'Banana', 'Cherry']

        function App() {
          const [query, setQuery] = useState('')

          const visible = useMemo(() => {
            return FRUITS.filter((fruit) => fruit.toLowerCase().includes(query.toLowerCase()))
          }, [])

          return (
            <>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
              <ul>
                {visible.map((fruit) => (
                  <li key={fruit}>{fruit}</li>
                ))}
              </ul>
            </>
          )
        }
      `,
      loesung: js`
        const FRUITS = ['Apple', 'Apricot', 'Banana', 'Cherry']

        function App() {
          const [query, setQuery] = useState('')

          const visible = useMemo(() => {
            return FRUITS.filter((fruit) => fruit.toLowerCase().includes(query.toLowerCase()))
          }, [query])

          return (
            <>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
              <ul>
                {visible.map((fruit) => (
                  <li key={fruit}>{fruit}</li>
                ))}
              </ul>
            </>
          )
        }
      `,
      tipps: {
        de: ['`useMemo` rechnet nur neu, wenn sich eine Abhängigkeit ändert.', 'Welcher Wert wird in der Funktion benutzt, fehlt aber im Array?'],
        en: ['`useMemo` only recomputes when a dependency changes.', 'Which value is used inside the function but missing from the array?'],
      },
      tests: [
        {
          name: t('„ap“ findet zwei Früchte', '“ap” finds two fruits'),
          pruefung: js`
            await render()
            await type(field('Search'), 'ap')
            expect(findAll('li')).toHaveLength(2)
          `,
        },
      ],
    },
    {
      id: 'hooks-usememo-callback',
      stufe: 'ergaenzen',
      titel: t('Unnötige Renders vermeiden', 'Avoid unnecessary renders'),
      aufgabe: t(
        '`ResetButton` ist mit `memo` umhüllt und loggt jeden Render. Trotzdem rendert er bei jeder Eingabe ins Textfeld neu. Sorge dafür, dass er beim Tippen nicht mehr rendert.',
        '`ResetButton` is wrapped in `memo` and logs every render. Still, it re-renders on every keystroke in the text field. Make sure it no longer renders while typing.',
      ),
      modus: 'react',
      code: js`
        const ResetButton = memo(function ResetButton({ onReset }) {
          console.log('ResetButton render')
          return <button onClick={onReset}>Reset</button>
        })

        function App() {
          const [text, setText] = useState('')

          const handleReset = () => setText('')

          return (
            <>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type" />
              <ResetButton onReset={handleReset} />
            </>
          )
        }
      `,
      loesung: js`
        const ResetButton = memo(function ResetButton({ onReset }) {
          console.log('ResetButton render')
          return <button onClick={onReset}>Reset</button>
        })

        function App() {
          const [text, setText] = useState('')

          const handleReset = useCallback(() => setText(''), [])

          return (
            <>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type" />
              <ResetButton onReset={handleReset} />
            </>
          )
        }
      `,
      tipps: {
        de: ['`handleReset` ist bei jedem Render eine neue Funktion - für `memo` eine geänderte Prop.', '`useCallback(() => setText(\'\'), [])` - `setText` ist stabil und muss nicht in die Abhängigkeiten.'],
        en: ['`handleReset` is a new function on every render - a changed prop for `memo`.', '`useCallback(() => setText(\'\'), [])` - `setText` is stable and does not need to be a dependency.'],
      },
      tests: [
        {
          name: t('Tippen rendert ResetButton nicht neu', 'Typing does not re-render ResetButton'),
          pruefung: js`
            await render()
            clearLogs()
            await type(field('Type'), 'Hello')
            expect(logs().filter((line) => line.includes('ResetButton render'))).toHaveLength(0)
          `,
        },
        {
          name: t('Reset funktioniert weiter', 'Reset still works'),
          pruefung: js`
            await render()
            await type(field('Type'), 'Hello')
            await click(button('Reset'))
            expect(field('Type').value).toBe('')
          `,
        },
      ],
    },
  ],

  'hooks-usereducer': [
    {
      id: 'hooks-usereducer-mutation',
      stufe: 'vorhersage',
      titel: t('Reducer verändert den State', 'Reducer mutates state'),
      frage: t('Was passiert beim Dispatch von `incremented`?', 'What happens when `incremented` is dispatched?'),
      code: js`
        function reducer(state, action) {
          if (action.type === 'incremented') {
            state.count++
            return state
          }
          return state
        }
      `,
      antworten: {
        de: ['Die Anzeige erhöht sich', 'Die Anzeige bleibt gleich', 'React wirft einen Fehler', 'Die Anzeige erhöht sich um 2'],
        en: ['The display increases', 'The display stays the same', 'React throws an error', 'The display increases by 2'],
      },
      richtig: 1,
      erklaerung: t(
        'Der Reducer gibt **dasselbe** Objekt zurück. React sieht keine Änderung und rendert nicht neu - obwohl `count` intern erhöht wurde. Immer ein neues Objekt zurückgeben.',
        'The reducer returns the **same** object. React sees no change and does not re-render - even though `count` was increased internally. Always return a new object.',
      ),
    },
    {
      id: 'hooks-usereducer-fehler',
      stufe: 'fehler',
      wiederholung: 'js-kontrollfluss',
      titel: t('Minus und Reset kaputt', 'Minus and reset are broken'),
      aufgabe: t('„+“ funktioniert, „−“ und „Reset“ nicht. Finde die zwei Fehler.', '“+” works, “−” and “Reset” don’t. Find the two bugs.'),
      modus: 'react',
      code: js`
        function reducer(state, action) {
          switch (action.type) {
            case 'incremented':
              return { count: state.count + 1 }
            case 'decremented':
              return { count: state.count - 1 }
            case 'reset':
              ({ count: 0 })
            default:
              return state
          }
        }

        function App() {
          const [state, dispatch] = useReducer(reducer, { count: 0 })
          return (
            <>
              <p>Count: {state.count}</p>
              <button onClick={() => dispatch({ type: 'incremented' })}>+</button>
              <button onClick={() => dispatch({ type: 'decrement' })}>−</button>
              <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
            </>
          )
        }
      `,
      loesung: js`
        function reducer(state, action) {
          switch (action.type) {
            case 'incremented':
              return { count: state.count + 1 }
            case 'decremented':
              return { count: state.count - 1 }
            case 'reset':
              return { count: 0 }
            default:
              throw new Error('Unknown action: ' + action.type)
          }
        }

        function App() {
          const [state, dispatch] = useReducer(reducer, { count: 0 })
          return (
            <>
              <p>Count: {state.count}</p>
              <button onClick={() => dispatch({ type: 'incremented' })}>+</button>
              <button onClick={() => dispatch({ type: 'decremented' })}>−</button>
              <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
            </>
          )
        }
      `,
      tipps: {
        de: ['Vergleiche den `type` im Knopf mit den `case`-Namen.', 'Im `reset`-Fall fehlt etwas - ohne `return` läuft `switch` in den nächsten Fall weiter.', 'Ein `throw` im `default` hätte den Tippfehler sofort gezeigt.'],
        en: ['Compare the `type` in the button with the `case` names.', 'Something is missing in the `reset` case - without `return`, `switch` falls through to the next case.', 'A `throw` in `default` would have revealed the typo right away.'],
      },
      tests: [
        {
          name: t('+ + − ergibt 1', '+ + − gives 1'),
          pruefung: js`
            await render()
            await click(button('+'))
            await click(button('+'))
            await click(button('−'))
            expect(text()).toContain('Count: 1')
          `,
        },
        {
          name: t('Reset setzt auf 0', 'Reset sets to 0'),
          pruefung: js`
            await render()
            await click(button('+'))
            await click(button('Reset'))
            expect(text()).toContain('Count: 0')
          `,
        },
      ],
    },
    {
      id: 'hooks-usereducer-wizard',
      stufe: 'frei',
      titel: t('Schritt-für-Schritt-Assistent', 'Step-by-step wizard'),
      aufgabe: t(
        'Baue mit `useReducer` einen Assistenten mit 3 Schritten: Anzeige „Step 1 of 3“, Knöpfe „Back“ und „Next“. „Back“ ist bei Schritt 1 deaktiviert, „Next“ bei Schritt 3. Ein Knopf „Start over“ springt zurück zu Schritt 1.',
        'Build a wizard with 3 steps using `useReducer`: display “Step 1 of 3”, buttons “Back” and “Next”. “Back” is disabled on step 1, “Next” on step 3. A “Start over” button jumps back to step 1.',
      ),
      modus: 'react',
      code: js`
        function wizardReducer(step, action) {

        }

        function App() {
          return <p>Step 1 of 3</p>
        }
      `,
      loesung: js`
        const LAST_STEP = 3

        function wizardReducer(step, action) {
          switch (action.type) {
            case 'next':
              return Math.min(step + 1, LAST_STEP)
            case 'back':
              return Math.max(step - 1, 1)
            case 'restarted':
              return 1
            default:
              throw new Error('Unknown action: ' + action.type)
          }
        }

        function App() {
          const [step, dispatch] = useReducer(wizardReducer, 1)
          return (
            <>
              <p>
                Step {step} of {LAST_STEP}
              </p>
              <button onClick={() => dispatch({ type: 'back' })} disabled={step === 1}>
                Back
              </button>
              <button onClick={() => dispatch({ type: 'next' })} disabled={step === LAST_STEP}>
                Next
              </button>
              <button onClick={() => dispatch({ type: 'restarted' })}>Start over</button>
            </>
          )
        }
      `,
      tipps: {
        de: ['Der State kann einfach eine Zahl sein: `useReducer(wizardReducer, 1)`.', '`Math.min` und `Math.max` halten den Schritt in den Grenzen.'],
        en: ['The state can simply be a number: `useReducer(wizardReducer, 1)`.', '`Math.min` and `Math.max` keep the step within bounds.'],
      },
      tests: [
        {
          name: t('Vor und zurück', 'Forward and back'),
          pruefung: js`
            await render()
            await click(button('Next'))
            await click(button('Next'))
            expect(text()).toContain('Step 3 of 3')
            await click(button('Back'))
            expect(text()).toContain('Step 2 of 3')
          `,
        },
        {
          name: t('Knöpfe an den Grenzen deaktiviert', 'Buttons disabled at the bounds'),
          pruefung: js`
            await render()
            expect(button('Back')).toBeDisabled()
            await click(button('Next'))
            await click(button('Next'))
            expect(button('Next')).toBeDisabled()
          `,
        },
        {
          name: t('Start over und useReducer', 'Start over and useReducer'),
          pruefung: js`
            await render()
            await click(button('Next'))
            await click(button('Start over'))
            expect(text()).toContain('Step 1 of 3')
            expect(code).toMatch(/useReducer\(/)
          `,
        },
      ],
    },
  ],

  'hooks-usecontext': [
    {
      id: 'hooks-usecontext-default',
      stufe: 'vorhersage',
      titel: t('Ohne Provider', 'Without a provider'),
      frage: t('Was zeigt `Label` an?', 'What does `Label` show?'),
      code: js`
        const ThemeContext = createContext('light')

        function Label() {
          return <p>{useContext(ThemeContext)}</p>
        }

        function App() {
          return (
            <>
              <ThemeContext value="dark">
                <p>Inside</p>
              </ThemeContext>
              <Label />
            </>
          )
        }
      `,
      antworten: { de: ['dark', 'light', 'undefined', 'Einen Fehler'], en: ['dark', 'light', 'undefined', 'An error'] },
      richtig: 1,
      erklaerung: t(
        '`Label` steht **außerhalb** des Providers. Dann gilt der Standardwert aus `createContext`.',
        '`Label` is **outside** the provider. In that case the default value from `createContext` applies.',
      ),
    },
    {
      id: 'hooks-usecontext-provider',
      stufe: 'fehler',
      titel: t('Das Theme wechselt nicht', 'The theme does not switch'),
      aufgabe: t('Nach „Toggle“ soll „Theme: dark“ dastehen. Es bleibt aber „light“.', 'After “Toggle”, it should say “Theme: dark”. But it stays “light”.'),
      modus: 'react',
      code: js`
        const ThemeContext = createContext('light')

        function ThemeLabel() {
          const theme = useContext(ThemeContext)
          return <p>Theme: {theme}</p>
        }

        function App() {
          const [theme, setTheme] = useState('light')
          return (
            <>
              <ThemeContext value={theme}>
                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Toggle</button>
              </ThemeContext>
              <ThemeLabel />
            </>
          )
        }
      `,
      loesung: js`
        const ThemeContext = createContext('light')

        function ThemeLabel() {
          const theme = useContext(ThemeContext)
          return <p>Theme: {theme}</p>
        }

        function App() {
          const [theme, setTheme] = useState('light')
          return (
            <ThemeContext value={theme}>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Toggle</button>
              <ThemeLabel />
            </ThemeContext>
          )
        }
      `,
      tipps: {
        de: ['Ein Provider versorgt nur die Komponenten **innerhalb** seiner Tags.'],
        en: ['A provider only supplies the components **inside** its tags.'],
      },
      tests: [
        {
          name: t('Toggle wechselt auf dark', 'Toggle switches to dark'),
          pruefung: js`
            await render()
            await click(button('Toggle'))
            expect(text()).toContain('Theme: dark')
          `,
        },
      ],
    },
    {
      id: 'hooks-usecontext-user',
      stufe: 'ergaenzen',
      titel: t('Provider mit eigenem Hook', 'Provider with a custom hook'),
      aufgabe: t(
        'Ergänze `UserProvider` und `useUser`: Der Provider hält den Nutzer (anfangs `null`) sowie `logIn` und `logOut`. `useUser` wirft außerhalb des Providers einen Fehler. `Greeting` zeigt „Guest“ oder „Hello, Ada“.',
        'Complete `UserProvider` and `useUser`: the provider holds the user (initially `null`) plus `logIn` and `logOut`. `useUser` throws outside the provider. `Greeting` shows “Guest” or “Hello, Ada”.',
      ),
      modus: 'react',
      code: js`
        const UserContext = createContext(null)

        function UserProvider({ children }) {
          // TODO: state + value with user, logIn and logOut
          return children
        }

        function useUser() {
          // TODO
        }

        function Greeting() {
          const { user, logIn, logOut } = useUser()
          return user ? (
            <p>
              Hello, {user.name} <button onClick={logOut}>Log out</button>
            </p>
          ) : (
            <p>
              Guest <button onClick={() => logIn('Ada')}>Log in</button>
            </p>
          )
        }

        function App() {
          return (
            <UserProvider>
              <Greeting />
            </UserProvider>
          )
        }
      `,
      loesung: js`
        const UserContext = createContext(null)

        function UserProvider({ children }) {
          const [user, setUser] = useState(null)
          const value = useMemo(
            () => ({
              user,
              logIn: (name) => setUser({ name }),
              logOut: () => setUser(null),
            }),
            [user],
          )
          return <UserContext value={value}>{children}</UserContext>
        }

        function useUser() {
          const context = useContext(UserContext)
          if (!context) throw new Error('useUser must be used inside <UserProvider>')
          return context
        }

        function Greeting() {
          const { user, logIn, logOut } = useUser()
          return user ? (
            <p>
              Hello, {user.name} <button onClick={logOut}>Log out</button>
            </p>
          ) : (
            <p>
              Guest <button onClick={() => logIn('Ada')}>Log in</button>
            </p>
          )
        }

        function App() {
          return (
            <UserProvider>
              <Greeting />
            </UserProvider>
          )
        }
      `,
      tipps: {
        de: ['Im Provider: `const [user, setUser] = useState(null)` und `<UserContext value={…}>{children}</UserContext>`.', '`useUser`: `useContext(UserContext)` lesen, bei `null` einen Fehler werfen.'],
        en: ['In the provider: `const [user, setUser] = useState(null)` and `<UserContext value={…}>{children}</UserContext>`.', '`useUser`: read `useContext(UserContext)`, throw an error on `null`.'],
      },
      tests: [
        {
          name: t('Anmelden und abmelden', 'Log in and log out'),
          pruefung: js`
            await render()
            expect(text()).toContain('Guest')
            await click(button('Log in'))
            expect(text()).toContain('Hello, Ada')
            await click(button('Log out'))
            expect(text()).toContain('Guest')
          `,
        },
        {
          name: t('useUser wirft außerhalb des Providers', 'useUser throws outside the provider'),
          pruefung: js`
            expect(code).toMatch(/throw new Error/)
          `,
        },
      ],
    },
  ],

  'hooks-eigene': [
    {
      id: 'hooks-eigene-geteilt',
      stufe: 'vorhersage',
      titel: t('Teilen zwei Komponenten den State?', 'Do two components share state?'),
      frage: t('Beide Komponenten nutzen `useToggle`. Man klickt einmal auf A. Was zeigt B?', 'Both components use `useToggle`. You click A once. What does B show?'),
      code: js`
        function useToggle() {
          const [on, setOn] = useState(false)
          return [on, () => setOn(!on)]
        }

        function Switch({ label }) {
          const [on, toggle] = useToggle()
          return <button onClick={toggle}>{label}: {on ? 'on' : 'off'}</button>
        }

        // <Switch label="A" />  <Switch label="B" />
      `,
      antworten: { de: ['B: on', 'B: off', 'Einen Fehler'], en: ['B: on', 'B: off', 'An error'] },
      richtig: 1,
      erklaerung: t(
        'Eigene Hooks teilen **Logik**, nicht State. Jeder Aufruf bekommt seinen eigenen `useState`. Gemeinsamen State erreicht man durch Anheben oder Context.',
        'Custom hooks share **logic**, not state. Every call gets its own `useState`. Shared state requires lifting it up or context.',
      ),
    },
    {
      id: 'hooks-eigene-regeln',
      stufe: 'fehler',
      titel: t('Absturz beim Aufklappen', 'Crash when expanding'),
      aufgabe: t('Ein Klick auf „Show details“ lässt die Komponente abstürzen. Welche Hook-Regel wird verletzt?', 'Clicking “Show details” crashes the component. Which rule of hooks is broken?'),
      modus: 'react',
      code: js`
        function useToggle(initial = false) {
          const [on, setOn] = useState(initial)
          return [on, () => setOn((o) => !o)]
        }

        function App() {
          const [showDetails, toggleDetails] = useToggle()

          let liked = false
          let toggleLiked = () => {}
          if (showDetails) {
            ;[liked, toggleLiked] = useToggle()
          }

          return (
            <>
              <button onClick={toggleDetails}>{showDetails ? 'Hide details' : 'Show details'}</button>
              {showDetails && (
                <p>
                  Details <button onClick={toggleLiked}>{liked ? '♥' : '♡'}</button>
                </p>
              )}
            </>
          )
        }
      `,
      loesung: js`
        function useToggle(initial = false) {
          const [on, setOn] = useState(initial)
          return [on, () => setOn((o) => !o)]
        }

        function App() {
          const [showDetails, toggleDetails] = useToggle()
          const [liked, toggleLiked] = useToggle()

          return (
            <>
              <button onClick={toggleDetails}>{showDetails ? 'Hide details' : 'Show details'}</button>
              {showDetails && (
                <p>
                  Details <button onClick={toggleLiked}>{liked ? '♥' : '♡'}</button>
                </p>
              )}
            </>
          )
        }
      `,
      tipps: {
        de: ['React erkennt Hooks an ihrer **Reihenfolge**. Ein Hook im `if` verschiebt sie.', 'Rufe `useToggle` immer auf - benutze das Ergebnis nur bei Bedarf.'],
        en: ['React identifies hooks by their **order**. A hook inside `if` shifts it.', 'Always call `useToggle` - only use the result when needed.'],
      },
      tests: [
        {
          name: t('Details aufklappen und liken', 'Expand details and like'),
          pruefung: js`
            await render()
            await click(button('Show details'))
            expect(text()).toContain('Details')
            await click(button('♡'))
            expect(text()).toContain('♥')
          `,
        },
      ],
    },
    {
      id: 'hooks-eigene-debounce',
      stufe: 'frei',
      titel: t('useDebouncedValue', 'useDebouncedValue'),
      aufgabe: t(
        'Schreibe `useDebouncedValue(value, delay)`: Es gibt `value` erst zurück, wenn er sich `delay` ms lang nicht geändert hat. `App` zeigt damit „Searching for: …“ 300 ms nach der letzten Eingabe.',
        'Write `useDebouncedValue(value, delay)`: it only returns `value` once it has not changed for `delay` ms. `App` uses it to show “Searching for: …” 300 ms after the last keystroke.',
      ),
      modus: 'react',
      code: js`
        function useDebouncedValue(value, delay) {
          return value
        }

        function App() {
          const [query, setQuery] = useState('')
          const debouncedQuery = useDebouncedValue(query, 300)

          return (
            <>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
              <p>Searching for: {debouncedQuery}</p>
            </>
          )
        }
      `,
      loesung: js`
        function useDebouncedValue(value, delay) {
          const [debounced, setDebounced] = useState(value)

          useEffect(() => {
            const id = setTimeout(() => setDebounced(value), delay)
            return () => clearTimeout(id)
          }, [value, delay])

          return debounced
        }

        function App() {
          const [query, setQuery] = useState('')
          const debouncedQuery = useDebouncedValue(query, 300)

          return (
            <>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
              <p>Searching for: {debouncedQuery}</p>
            </>
          )
        }
      `,
      tipps: {
        de: ['Ein eigener State für den verzögerten Wert.', 'Ein Effekt startet bei jeder Änderung einen Timer - und das Cleanup bricht den vorherigen ab.'],
        en: ['A separate state for the delayed value.', 'An effect starts a timer on every change - and the cleanup cancels the previous one.'],
      },
      tests: [
        {
          name: t('Nicht sofort, aber nach 300 ms', 'Not immediately, but after 300 ms'),
          pruefung: js`
            await render()
            await type(field('Search'), 'react')
            expect(text()).not.toContain('Searching for: react')
            await waitFor(() => expect(text()).toContain('Searching for: react'))
          `,
        },
        {
          name: t('Schnelles Tippen startet den Timer neu', 'Fast typing restarts the timer'),
          pruefung: js`
            await render()
            await type(field('Search'), 'r')
            await wait(200)
            await type(field('Search'), 're')
            await wait(200)
            expect(text()).not.toContain('Searching for: r')
            await waitFor(() => expect(text()).toContain('Searching for: re'))
          `,
        },
      ],
    },
  ],

  'hooks-nebenlaeufig': [
    {
      id: 'hooks-nebenlaeufig-dringend',
      stufe: 'vorhersage',
      titel: t('Was ist nicht dringend?', 'What is not urgent?'),
      frage: t('Welches Update gehört in `startTransition`?', 'Which update belongs in `startTransition`?'),
      code: js`
        function handleChange(e) {
          setInput(e.target.value)         // (a)
          setFilteredList(filter(e.target.value)) // (b) renders 10,000 rows
        }
      `,
      antworten: {
        de: ['(a) - die Eingabe', '(b) - die große Liste', 'Beide', 'Keins'],
        en: ['(a) - the input', '(b) - the large list', 'Both', 'Neither'],
      },
      richtig: 1,
      erklaerung: t(
        'Das Eingabefeld muss sofort reagieren, sonst fühlt sich Tippen zäh an. Die Liste darf kurz hinterherhinken - also ist (b) die Transition.',
        'The input must respond immediately, otherwise typing feels sluggish. The list may lag behind briefly - so (b) is the transition.',
      ),
    },
    {
      id: 'hooks-nebenlaeufig-suspense',
      stufe: 'ergaenzen',
      titel: t('Nachladen mit Platzhalter', 'Lazy loading with a placeholder'),
      aufgabe: t(
        '`Details` wird mit `lazy` nachgeladen. Ergänze eine `Suspense`-Grenze, damit nach dem Klick „Loading details …“ erscheint, bis „Details loaded“ da ist.',
        '`Details` is loaded with `lazy`. Add a `Suspense` boundary so that “Loading details …” appears after the click until “Details loaded” is there.',
      ),
      modus: 'react',
      code: js`
        // Simulates a slow network: the module arrives after 300 ms.
        const Details = lazy(
          () => new Promise((resolve) => setTimeout(() => resolve({ default: () => <p>Details loaded</p> }), 300)),
        )

        function App() {
          const [show, setShow] = useState(false)
          return (
            <>
              <button onClick={() => setShow(true)}>Show details</button>
              {show && <Details />}
            </>
          )
        }
      `,
      loesung: js`
        // Simulates a slow network: the module arrives after 300 ms.
        const Details = lazy(
          () => new Promise((resolve) => setTimeout(() => resolve({ default: () => <p>Details loaded</p> }), 300)),
        )

        function App() {
          const [show, setShow] = useState(false)
          return (
            <>
              <button onClick={() => setShow(true)}>Show details</button>
              <Suspense fallback={<p>Loading details …</p>}>{show && <Details />}</Suspense>
            </>
          )
        }
      `,
      tipps: {
        de: ['`<Suspense fallback={…}>` um die Stelle, die nachlädt.'],
        en: ['`<Suspense fallback={…}>` around the part that loads.'],
      },
      tests: [
        {
          name: t('Platzhalter, dann Inhalt', 'Placeholder, then content'),
          pruefung: js`
            await render()
            await click(button('Show details'))
            expect(text()).toContain('Loading details')
            await waitFor(() => expect(text()).toContain('Details loaded'))
          `,
        },
      ],
    },
  ],

  'hooks-react19': [
    {
      id: 'hooks-react19-optimistic',
      stufe: 'vorhersage',
      titel: t('Optimistisch und fehlgeschlagen', 'Optimistic and failed'),
      frage: t(
        'Ein Like wird mit `useOptimistic` sofort angezeigt. Die Anfrage an den Server schlägt fehl. Was sieht man danach?',
        'A like is shown immediately with `useOptimistic`. The request to the server fails. What do you see afterwards?',
      ),
      code: js`
        const [optimisticLikes, addOptimisticLike] = useOptimistic(likes, (current) => current + 1)

        async function likeAction() {
          addOptimisticLike()
          await saveLike() // throws
          setLikes(likes + 1)
        }
      `,
      antworten: {
        de: ['Das Like bleibt stehen', 'Die Anzeige springt auf den alten Wert zurück', 'Die Anzeige zeigt NaN', 'Es werden 2 Likes gezählt'],
        en: ['The like stays', 'The display falls back to the old value', 'The display shows NaN', '2 likes are counted'],
      },
      richtig: 1,
      erklaerung: t(
        'Der optimistische Wert gilt nur, solange die Action läuft. Danach zeigt React wieder den echten State - und der wurde nie erhöht.',
        'The optimistic value only applies while the action is running. Afterwards React shows the real state again - which was never increased.',
      ),
    },
    {
      id: 'hooks-react19-use',
      stufe: 'fehler',
      titel: t('Lädt für immer', 'Loading forever'),
      aufgabe: t(
        'Der Name soll nach kurzer Zeit erscheinen, aber „Loading …“ bleibt stehen. Das Promise wird bei jedem Render neu erzeugt. Behebe das.',
        'The name should appear after a moment, but “Loading …” stays. The promise is created anew on every render. Fix it.',
      ),
      modus: 'react',
      code: js`
        function fetchUser() {
          return new Promise((resolve) => setTimeout(() => resolve({ name: 'Ada' }), 100))
        }

        function UserName() {
          const user = use(fetchUser())
          return <p>{user.name}</p>
        }

        function App() {
          return (
            <Suspense fallback={<p>Loading …</p>}>
              <UserName />
            </Suspense>
          )
        }
      `,
      loesung: js`
        function fetchUser() {
          return new Promise((resolve) => setTimeout(() => resolve({ name: 'Ada' }), 100))
        }

        function UserName({ userPromise }) {
          const user = use(userPromise)
          return <p>{user.name}</p>
        }

        function App() {
          // Created once and kept - use() needs the same promise on every render.
          const [userPromise] = useState(() => fetchUser())
          return (
            <Suspense fallback={<p>Loading …</p>}>
              <UserName userPromise={userPromise} />
            </Suspense>
          )
        }
      `,
      tipps: {
        de: ['Nach dem Laden rendert React neu - und `fetchUser()` erzeugt ein **neues** Promise, das wieder wartet.', 'Erzeuge das Promise außerhalb der suspendierenden Komponente, z. B. mit `useState(() => fetchUser())` in `App`, und gib es als Prop weiter.'],
        en: ['After loading, React renders again - and `fetchUser()` creates a **new** promise that waits again.', 'Create the promise outside the suspending component, e.g. with `useState(() => fetchUser())` in `App`, and pass it down as a prop.'],
      },
      tests: [
        {
          name: t('Name erscheint', 'Name appears'),
          pruefung: js`
            await render()
            await waitFor(() => expect(text()).toContain('Ada'), 2000)
          `,
        },
      ],
    },
    {
      id: 'hooks-react19-action',
      stufe: 'ergaenzen',
      titel: t('Formular mit useActionState', 'A form with useActionState'),
      aufgabe: t(
        'Ergänze `saveName`: Ohne Namen gibt es „Name is required“ zurück, sonst nach dem Speichern „Saved Ada“. Während des Speicherns ist der Knopf „Save“ deaktiviert.',
        'Complete `saveName`: without a name it returns “Name is required”, otherwise “Saved Ada” after saving. While saving, the “Save” button is disabled.',
      ),
      modus: 'react',
      code: js`
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

        async function saveName(previousMessage, formData) {
          const name = formData.get('name')
          // TODO: validate, await wait(300), return a message
        }

        function App() {
          const [message, formAction, isPending] = useActionState(saveName, '')

          return (
            <form action={formAction}>
              <input name="name" placeholder="Name" />
              <button>Save</button>
              <p>{message}</p>
            </form>
          )
        }
      `,
      loesung: js`
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

        async function saveName(previousMessage, formData) {
          const name = formData.get('name').trim()
          if (!name) return 'Name is required'
          await wait(300)
          return 'Saved ' + name
        }

        function App() {
          const [message, formAction, isPending] = useActionState(saveName, '')

          return (
            <form action={formAction}>
              <input name="name" placeholder="Name" />
              <button disabled={isPending}>Save</button>
              <p>{message}</p>
            </form>
          )
        }
      `,
      tipps: {
        de: ['Der Rückgabewert der Action wird zum neuen `message`.', '`isPending` ist `true`, solange die Action läuft: `<button disabled={isPending}>`.'],
        en: ['The action’s return value becomes the new `message`.', '`isPending` is `true` while the action runs: `<button disabled={isPending}>`.'],
      },
      tests: [
        {
          name: t('Leerer Name wird abgelehnt', 'Empty name is rejected'),
          pruefung: js`
            await render()
            await click(button('Save'))
            await waitFor(() => expect(text()).toContain('Name is required'))
          `,
        },
        {
          name: t('Speichern mit Wartezustand', 'Saving with pending state'),
          pruefung: js`
            await render()
            await type(field('Name'), 'Ada')
            await click(button('Save'))
            await waitFor(() => expect(button('Save')).toBeDisabled(), 250)
            await waitFor(() => expect(text()).toContain('Saved Ada'))
            expect(button('Save')).not.toBeDisabled()
          `,
        },
      ],
    },
  ],
}
