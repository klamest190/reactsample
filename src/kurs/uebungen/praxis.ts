import { js } from '../../lernen/quelltext'
import type { UebungsSammlung } from './typen'

/**
 * Zusätzliche Übungen für Teil 5 (Praxis & Muster) - gestuft wie in js.ts.
 *
 * Zwei Kapitel stehen hier bewusst nicht: `praxis-projekt` und `praxis-business`
 * SIND selbst schon die Übung - ein Abschlussprojekt bzw. die Werkstatt mit
 * eigenen Aufgaben. Ein zusätzlicher Übungsblock darunter wäre nur Lärm.
 */

const t = (de: string, en: string) => ({ de, en })

export const uebungen: UebungsSammlung = {
  'praxis-formulare': [
    {
      id: 'praxis-formulare-readonly',
      stufe: 'vorhersage',
      titel: t('value ohne onChange', 'value without onChange'),
      frage: t('Was passiert, wenn man in dieses Feld tippt?', 'What happens when you type into this input?'),
      code: js`
        function App() {
          const [name, setName] = useState('Ada')
          return <input value={name} />
        }
      `,
      antworten: {
        de: ['Der Text ändert sich normal', 'Nichts - das Feld bleibt „Ada“', 'Der State ändert sich automatisch', 'React stürzt ab'],
        en: ['The text changes normally', 'Nothing - the input stays “Ada”', 'The state updates automatically', 'React crashes'],
      },
      richtig: 1,
      erklaerung: t(
        'Mit `value` bestimmt React den Inhalt. Ohne `onChange`, das den State ändert, setzt React das Feld bei jedem Tastendruck zurück (und warnt in der Konsole).',
        'With `value`, React controls the content. Without an `onChange` that updates state, React resets the input on every keystroke (and warns in the console).',
      ),
    },
    {
      id: 'praxis-formulare-checkbox',
      stufe: 'fehler',
      titel: t('Die Checkbox lässt sich nicht abwählen', 'The checkbox cannot be unchecked'),
      aufgabe: t(
        '„Send“ soll nur aktiv sein, solange die Checkbox angehakt ist. Nach dem ersten Haken bleibt der Knopf aber für immer aktiv.',
        '“Send” should only be enabled while the checkbox is checked. But after the first check, the button stays enabled forever.',
      ),
      modus: 'react',
      code: js`
        function App() {
          const [accepted, setAccepted] = useState(false)

          return (
            <form>
              <label>
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.value)} />
                I accept the terms
              </label>
              <button disabled={!accepted}>Send</button>
            </form>
          )
        }
      `,
      loesung: js`
        function App() {
          const [accepted, setAccepted] = useState(false)

          return (
            <form>
              <label>
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                I accept the terms
              </label>
              <button disabled={!accepted}>Send</button>
            </form>
          )
        }
      `,
      tipps: {
        de: ['Gib `e.target.value` einmal mit `console.log` aus.', 'Bei Checkboxen steht der Zustand in `e.target.checked`.'],
        en: ['Log `e.target.value` once with `console.log`.', 'For checkboxes, the state is in `e.target.checked`.'],
      },
      tests: [
        {
          name: t('An, aus, wieder deaktiviert', 'On, off, disabled again'),
          pruefung: js`
            await render()
            expect(button('Send')).toBeDisabled()
            await click(field('checkbox'))
            expect(button('Send')).not.toBeDisabled()
            await click(field('checkbox'))
            expect(button('Send')).toBeDisabled()
          `,
        },
      ],
    },
    {
      id: 'praxis-formulare-passwort',
      stufe: 'ergaenzen',
      titel: t('Passwort bestätigen', 'Confirm password'),
      aufgabe: t(
        'Ergänze die Validierung als **abgeleitete Werte**: Unter 8 Zeichen erscheint „At least 8 characters“, stimmen die Felder nicht überein „Passwords do not match“ (erst, wenn im zweiten Feld etwas steht). „Create account“ ist nur bei gültigen Eingaben aktiv.',
        'Complete the validation as **derived values**: under 8 characters show “At least 8 characters”, if the fields differ show “Passwords do not match” (only once the second field has content). “Create account” is only enabled for valid input.',
      ),
      modus: 'react',
      code: js`
        function App() {
          const [password, setPassword] = useState('')
          const [confirm, setConfirm] = useState('')

          // TODO: derive the error messages and whether the form is valid

          return (
            <form>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <input type="password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              <button>Create account</button>
            </form>
          )
        }
      `,
      loesung: js`
        function App() {
          const [password, setPassword] = useState('')
          const [confirm, setConfirm] = useState('')

          const tooShort = password.length > 0 && password.length < 8
          const mismatch = confirm.length > 0 && confirm !== password
          const isValid = password.length >= 8 && confirm === password

          return (
            <form>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {tooShort && <p role="alert">At least 8 characters</p>}
              <input type="password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              {mismatch && <p role="alert">Passwords do not match</p>}
              <button disabled={!isValid}>Create account</button>
            </form>
          )
        }
      `,
      tipps: {
        de: ['Kein zusätzlicher State nötig - alles lässt sich aus `password` und `confirm` berechnen.', '`const isValid = password.length >= 8 && confirm === password`'],
        en: ['No extra state needed - everything can be computed from `password` and `confirm`.', '`const isValid = password.length >= 8 && confirm === password`'],
      },
      tests: [
        {
          name: t('Zu kurzes Passwort', 'Password too short'),
          pruefung: js`
            await render()
            await type(field('Password'), 'abc')
            expect(text()).toContain('At least 8 characters')
            expect(button('Create account')).toBeDisabled()
          `,
        },
        {
          name: t('Abweichende Wiederholung', 'Mismatching repeat'),
          pruefung: js`
            await render()
            await type(field('Password'), 'secret123')
            expect(text()).not.toContain('Passwords do not match')
            await type(field('Repeat password'), 'secret124')
            expect(text()).toContain('Passwords do not match')
            expect(button('Create account')).toBeDisabled()
          `,
        },
        {
          name: t('Gültige Eingabe aktiviert den Knopf', 'Valid input enables the button'),
          pruefung: js`
            await render()
            await type(field('Password'), 'secret123')
            await type(field('Repeat password'), 'secret123')
            expect(button('Create account')).not.toBeDisabled()
            expect(findAll('[role="alert"]')).toHaveLength(0)
          `,
        },
      ],
    },
  ],

  'praxis-daten': [
    {
      id: 'praxis-daten-race',
      stufe: 'vorhersage',
      titel: t('Wer gewinnt das Rennen?', 'Who wins the race?'),
      frage: t(
        'Man wählt schnell nacheinander Nutzer 1 und dann Nutzer 2. Die Antwort für 1 braucht 2 s, die für 2 nur 0,5 s. Was steht am Ende da?',
        'You quickly select user 1 and then user 2. The response for 1 takes 2 s, the one for 2 only 0.5 s. What is shown at the end?',
      ),
      code: js`
        useEffect(() => {
          fetch('/api/users/' + userId)
            .then((response) => response.json())
            .then((user) => setUser(user))
        }, [userId])
      `,
      antworten: {
        de: ['Nutzer 2', 'Nutzer 1 - obwohl 2 ausgewählt ist', 'Beide nacheinander, am Ende 2', 'Nichts'],
        en: ['User 2', 'User 1 - although 2 is selected', 'Both in turn, ending with 2', 'Nothing'],
      },
      richtig: 1,
      erklaerung: t(
        'Die langsame Antwort für Nutzer 1 kommt **zuletzt** an und überschreibt Nutzer 2 - eine Race Condition. Lösung: im Cleanup abbrechen (`AbortController`) oder die Antwort ignorieren.',
        'The slow response for user 1 arrives **last** and overwrites user 2 - a race condition. Fix: abort in cleanup (`AbortController`) or ignore the response.',
      ),
    },
    {
      id: 'praxis-daten-endlos',
      stufe: 'fehler',
      titel: t('Hunderte Anfragen', 'Hundreds of requests'),
      aufgabe: t('Die Daten erscheinen - aber im Hintergrund wird ununterbrochen neu geladen. Finde den Grund.', 'The data appears - but it keeps reloading in the background. Find the reason.'),
      modus: 'react',
      code: js`
        function App() {
          const [quote, setQuote] = useState(null)

          useEffect(() => {
            fetch('https://dummyjson.com/quotes/1')
              .then((response) => response.json())
              .then((data) => setQuote(data))
          })

          return <p>{quote ? quote.quote : 'Loading …'}</p>
        }
      `,
      loesung: js`
        function App() {
          const [quote, setQuote] = useState(null)

          useEffect(() => {
            const controller = new AbortController()
            fetch('https://dummyjson.com/quotes/1', { signal: controller.signal })
              .then((response) => response.json())
              .then((data) => setQuote(data))
              .catch((error) => {
                if (error.name !== 'AbortError') console.error(error)
              })
            return () => controller.abort()
          }, [])

          return <p>{quote ? quote.quote : 'Loading …'}</p>
        }
      `,
      tipps: {
        de: ['Ohne Abhängigkeits-Array läuft der Effekt nach **jedem** Render - und `setQuote` löst einen neuen Render aus.', '`[]` als zweites Argument. Gute Praxis zusätzlich: Abbrechen im Cleanup.'],
        en: ['Without a dependency array, the effect runs after **every** render - and `setQuote` triggers a new render.', '`[]` as the second argument. Good practice on top: abort in cleanup.'],
      },
      tests: [
        {
          name: t('Lädt nur einmal', 'Loads only once'),
          pruefung: js`
            const api = mockFetch(() => ({ quote: 'Talk is cheap.' }))
            await render()
            await waitFor(() => expect(text()).toContain('Talk is cheap.'))
            // Nach dem Laden dürfen keine weiteren Anfragen folgen.
            const afterLoad = api.calls.length
            await wait(300)
            expect(api.calls).toHaveLength(afterLoad)
          `,
        },
      ],
    },
    {
      id: 'praxis-daten-usefetch',
      stufe: 'frei',
      titel: t('Ein eigener useFetch-Hook', 'A custom useFetch hook'),
      aufgabe: t(
        'Schreibe `useFetch(url)`, der `{ data, loading, error }` liefert. Er bricht Anfragen im Cleanup ab und behandelt HTTP-Fehler. `App` zeigt „Loading …“, „Error: HTTP 404“ oder die Daten.',
        'Write `useFetch(url)` returning `{ data, loading, error }`. It aborts requests in cleanup and handles HTTP errors. `App` shows “Loading …”, “Error: HTTP 404” or the data.',
      ),
      modus: 'react',
      code: js`
        function useFetch(url) {
          return { data: null, loading: true, error: null }
        }

        function App() {
          const { data, loading, error } = useFetch('https://dummyjson.com/todos/1')

          if (loading) return <p>Loading …</p>
          if (error) return <p>Error: {error.message}</p>
          return <p>{data.todo}</p>
        }
      `,
      loesung: js`
        function useFetch(url) {
          const [state, setState] = useState({ data: null, loading: true, error: null })

          useEffect(() => {
            const controller = new AbortController()
            setState({ data: null, loading: true, error: null })

            fetch(url, { signal: controller.signal })
              .then((response) => {
                if (!response.ok) throw new Error('HTTP ' + response.status)
                return response.json()
              })
              .then((data) => setState({ data, loading: false, error: null }))
              .catch((error) => {
                if (error.name !== 'AbortError') setState({ data: null, loading: false, error })
              })

            return () => controller.abort()
          }, [url])

          return state
        }

        function App() {
          const { data, loading, error } = useFetch('https://dummyjson.com/todos/1')

          if (loading) return <p>Loading …</p>
          if (error) return <p>Error: {error.message}</p>
          return <p>{data.todo}</p>
        }
      `,
      tipps: {
        de: ['Ein State-Objekt `{ data, loading, error }` und ein Effekt mit `[url]`.', '`fetch` wirft bei 404 nicht - prüfe `response.ok` und wirf selbst `new Error(\'HTTP \' + response.status)`.', '`AbortError` im `catch` ignorieren.'],
        en: ['A state object `{ data, loading, error }` and an effect with `[url]`.', '`fetch` does not throw on 404 - check `response.ok` and throw `new Error(\'HTTP \' + response.status)` yourself.', 'Ignore `AbortError` in the `catch`.'],
      },
      tests: [
        {
          name: t('Laden, dann Daten', 'Loading, then data'),
          pruefung: js`
            mockFetch(() => ({ todo: 'Write a custom hook' }))
            await render()
            expect(text()).toContain('Loading')
            await waitFor(() => expect(text()).toContain('Write a custom hook'))
          `,
        },
        {
          name: t('HTTP-Fehler wird angezeigt', 'HTTP error is shown'),
          pruefung: js`
            mockFetch(() => ({ status: 404, body: { message: 'Not found' } }))
            await render()
            await waitFor(() => expect(text()).toContain('Error: HTTP 404'))
          `,
        },
        {
          name: t('Abbruch beim Entfernen', 'Abort on unmount'),
          pruefung: js`
            const api = mockFetch(() => new Promise(() => {}))
            await render()
            await remount()
            expect(api.calls.length).toBeGreaterThan(0)
            expect(api.calls[0].signal?.aborted).toBe(true)
          `,
        },
      ],
    },
  ],

  'praxis-komposition': [
    {
      id: 'praxis-komposition-children',
      stufe: 'vorhersage',
      titel: t('Wo landet children?', 'Where do children go?'),
      frage: t('Was wird angezeigt?', 'What is displayed?'),
      code: js`
        function Box({ title }) {
          return <section><h2>{title}</h2></section>
        }

        function App() {
          return (
            <Box title="Todos">
              <p>Buy milk</p>
            </Box>
          )
        }
      `,
      antworten: {
        de: ['„Todos“ und „Buy milk“', 'Nur „Todos“', 'Nur „Buy milk“', 'Ein Fehler'],
        en: ['“Todos” and “Buy milk”', 'Only “Todos”', 'Only “Buy milk”', 'An error'],
      },
      richtig: 1,
      erklaerung: t(
        'Der Inhalt zwischen den Tags kommt als Prop `children` an - aber `Box` rendert ihn nirgends. Ohne `{children}` verschwindet er einfach.',
        'The content between the tags arrives as the `children` prop - but `Box` never renders it. Without `{children}` it simply disappears.',
      ),
    },
    {
      id: 'praxis-komposition-slots',
      stufe: 'ergaenzen',
      titel: t('Karte mit Slots', 'Card with slots'),
      aufgabe: t(
        'Ergänze `Card({ title, actions, children })`: Titel als `<h2>`, darunter `children`, und in einem `<footer>` die übergebenen `actions`. Ohne `actions` gibt es keinen Footer.',
        'Complete `Card({ title, actions, children })`: title as `<h2>`, then `children`, and the passed `actions` in a `<footer>`. Without `actions` there is no footer.',
      ),
      modus: 'react',
      code: js`
        function Card({ title, actions, children }) {
          // TODO
          return <section className="card" />
        }

        function App() {
          return (
            <>
              <Card title="Delete todo?" actions={<><button>Cancel</button><button>Delete</button></>}>
                <p>This cannot be undone.</p>
              </Card>
              <Card title="Info">
                <p>No actions here.</p>
              </Card>
            </>
          )
        }
      `,
      loesung: js`
        function Card({ title, actions, children }) {
          return (
            <section className="card">
              <h2>{title}</h2>
              {children}
              {actions && <footer>{actions}</footer>}
            </section>
          )
        }

        function App() {
          return (
            <>
              <Card title="Delete todo?" actions={<><button>Cancel</button><button>Delete</button></>}>
                <p>This cannot be undone.</p>
              </Card>
              <Card title="Info">
                <p>No actions here.</p>
              </Card>
            </>
          )
        }
      `,
      tipps: {
        de: ['JSX ist ein Wert - `actions` kann man wie `children` einfach rendern.', '`{actions && <footer>{actions}</footer>}`'],
        en: ['JSX is a value - you can render `actions` just like `children`.', '`{actions && <footer>{actions}</footer>}`'],
      },
      tests: [
        {
          name: t('Titel und Inhalt', 'Title and content'),
          pruefung: js`
            await render()
            expect(findAll('.card h2')).toHaveLength(2)
            expect(text()).toContain('This cannot be undone.')
          `,
        },
        {
          name: t('Footer nur mit actions', 'Footer only with actions'),
          pruefung: js`
            await render()
            expect(findAll('footer')).toHaveLength(1)
            expect(findAll('footer button')).toHaveLength(2)
          `,
        },
      ],
    },
  ],

  'praxis-fehler': [
    {
      id: 'praxis-fehler-boundary',
      stufe: 'vorhersage',
      titel: t('Was fängt eine Error Boundary?', 'What does an error boundary catch?'),
      frage: t('Welcher Fehler wird von einer Error Boundary abgefangen?', 'Which error is caught by an error boundary?'),
      code: js`
        // (a) throw in a component while rendering
        // (b) throw in an onClick handler
        // (c) a rejected promise after await in useEffect
      `,
      antworten: { de: ['(a)', '(b)', '(c)', 'Alle drei'], en: ['(a)', '(b)', '(c)', 'All three'] },
      richtig: 0,
      erklaerung: t(
        'Error Boundaries fangen nur Fehler **beim Rendern**. Fehler in Event-Handlern und asynchronem Code behandelst du mit `try/catch` - und zeigst sie über State an.',
        'Error boundaries only catch errors **during rendering**. Errors in event handlers and asynchronous code are handled with `try/catch` - and shown via state.',
      ),
    },
    {
      id: 'praxis-fehler-async',
      stufe: 'fehler',
      wiederholung: 'js-async',
      titel: t('Hängt bei „Saving …“', 'Stuck at “Saving …”'),
      aufgabe: t(
        'Das Speichern schlägt immer fehl (so ist `saveData` gebaut). Die Oberfläche bleibt aber bei „Saving …“ stehen. Zeige stattdessen „Could not save“ an.',
        'Saving always fails (that is how `saveData` is built). But the UI gets stuck at “Saving …”. Show “Could not save” instead.',
      ),
      modus: 'react',
      code: js`
        async function saveData() {
          await new Promise((resolve) => setTimeout(resolve, 100))
          throw new Error('Server unavailable')
        }

        function App() {
          const [status, setStatus] = useState('idle')

          async function handleSave() {
            setStatus('saving')
            await saveData()
            setStatus('saved')
          }

          return (
            <>
              <button onClick={handleSave}>Save</button>
              {status === 'saving' && <p>Saving …</p>}
              {status === 'saved' && <p>Saved!</p>}
            </>
          )
        }
      `,
      loesung: js`
        async function saveData() {
          await new Promise((resolve) => setTimeout(resolve, 100))
          throw new Error('Server unavailable')
        }

        function App() {
          const [status, setStatus] = useState('idle')

          async function handleSave() {
            setStatus('saving')
            try {
              await saveData()
              setStatus('saved')
            } catch {
              setStatus('error')
            }
          }

          return (
            <>
              <button onClick={handleSave}>Save</button>
              {status === 'saving' && <p>Saving …</p>}
              {status === 'saved' && <p>Saved!</p>}
              {status === 'error' && <p role="alert">Could not save</p>}
            </>
          )
        }
      `,
      tipps: {
        de: ['Nach dem `throw` wird `setStatus(\'saved\')` nie erreicht.', '`try { … } catch { setStatus(\'error\') }` und einen neuen Status anzeigen.'],
        en: ['After the `throw`, `setStatus(\'saved\')` is never reached.', '`try { … } catch { setStatus(\'error\') }` and display a new status.'],
      },
      tests: [
        {
          name: t('Zeigt „Could not save“', 'Shows “Could not save”'),
          pruefung: js`
            await render()
            await click(button('Save'))
            expect(text()).toContain('Saving')
            await waitFor(() => expect(text()).toContain('Could not save'))
            expect(text()).not.toContain('Saving')
          `,
        },
      ],
    },
    {
      id: 'praxis-fehler-reset',
      stufe: 'ergaenzen',
      titel: t('Error Boundary mit „Try again“', 'Error boundary with “Try again”'),
      aufgabe: t(
        'Ergänze `ErrorBoundary`: Bei einem Render-Fehler zeigt sie „Something went wrong“ und einen Knopf „Try again“, der den Fehlerzustand zurücksetzt.',
        'Complete `ErrorBoundary`: on a rendering error it shows “Something went wrong” and a “Try again” button that resets the error state.',
      ),
      modus: 'react',
      code: js`
        class ErrorBoundary extends React.Component {
          state = { hasError: false }

          // TODO: static getDerivedStateFromError

          render() {
            // TODO: fallback with "Try again"
            return this.props.children
          }
        }

        function Bomb({ explode }) {
          if (explode) throw new Error('Boom')
          return <p>All good</p>
        }

        function App() {
          const [explode, setExplode] = useState(false)
          return (
            <>
              <button onClick={() => setExplode(true)}>Break</button>
              <ErrorBoundary onReset={() => setExplode(false)}>
                <Bomb explode={explode} />
              </ErrorBoundary>
            </>
          )
        }
      `,
      loesung: js`
        class ErrorBoundary extends React.Component {
          state = { hasError: false }

          static getDerivedStateFromError() {
            return { hasError: true }
          }

          render() {
            if (this.state.hasError) {
              return (
                <p role="alert">
                  Something went wrong{' '}
                  <button
                    onClick={() => {
                      this.props.onReset?.()
                      this.setState({ hasError: false })
                    }}
                  >
                    Try again
                  </button>
                </p>
              )
            }
            return this.props.children
          }
        }

        function Bomb({ explode }) {
          if (explode) throw new Error('Boom')
          return <p>All good</p>
        }

        function App() {
          const [explode, setExplode] = useState(false)
          return (
            <>
              <button onClick={() => setExplode(true)}>Break</button>
              <ErrorBoundary onReset={() => setExplode(false)}>
                <Bomb explode={explode} />
              </ErrorBoundary>
            </>
          )
        }
      `,
      tipps: {
        de: ['`static getDerivedStateFromError() { return { hasError: true } }`', 'Beim Zurücksetzen erst die Ursache beheben (`onReset`), dann `this.setState({ hasError: false })`.'],
        en: ['`static getDerivedStateFromError() { return { hasError: true } }`', 'When resetting, fix the cause first (`onReset`), then `this.setState({ hasError: false })`.'],
      },
      tests: [
        {
          name: t('Fehler wird abgefangen und zurückgesetzt', 'Error is caught and reset'),
          pruefung: js`
            await render()
            await click(button('Break'))
            expect(text()).toContain('Something went wrong')
            await click(button('Try again'))
            expect(text()).toContain('All good')
          `,
        },
      ],
    },
  ],

  'praxis-tailwind': [
    {
      id: 'praxis-tailwind-dynamisch',
      stufe: 'vorhersage',
      titel: t('Dynamische Klassen', 'Dynamic classes'),
      frage: t('`color` ist "red". Wird der Text rot?', '`color` is "red". Does the text turn red?'),
      code: js`
        <p className={'text-' + color + '-600'}>Warning</p>
      `,
      antworten: {
        de: ['Ja, immer', 'Nur, wenn text-red-600 irgendwo vollständig im Quelltext steht', 'Nein, className erlaubt keine Ausdrücke', 'Nur im Dark Mode'],
        en: ['Yes, always', 'Only if text-red-600 appears in full somewhere in the source', 'No, className does not allow expressions', 'Only in dark mode'],
      },
      richtig: 1,
      erklaerung: t(
        'Tailwind sucht Klassennamen als Text im Quelltext. `text-red-600` steht hier nirgends vollständig - also wird kein CSS dafür erzeugt, außer zufällig an anderer Stelle.',
        'Tailwind searches the source for class names as text. `text-red-600` never appears in full here - so no CSS is generated for it, unless by chance elsewhere.',
      ),
    },
    {
      id: 'praxis-tailwind-lookup',
      stufe: 'fehler',
      titel: t('Farben per Lookup-Objekt', 'Colors via a lookup object'),
      aufgabe: t(
        'Die Klassen werden zusammengesetzt - in einem echten Projekt fehlen sie dann. Ersetze das durch ein Lookup-Objekt mit **vollständigen** Klassennamen.',
        'The classes are assembled from pieces - in a real project they would then be missing. Replace this with a lookup object containing **complete** class names.',
      ),
      modus: 'react',
      code: js`
        function Status({ tone, children }) {
          return <span className={'rounded px-2 bg-' + tone + '-100 text-' + tone + '-800'}>{children}</span>
        }

        function App() {
          return (
            <>
              <Status tone="emerald">done</Status> <Status tone="amber">open</Status>
            </>
          )
        }
      `,
      loesung: js`
        const TONES = {
          emerald: 'bg-emerald-100 text-emerald-800',
          amber: 'bg-amber-100 text-amber-800',
        }

        function Status({ tone, children }) {
          return <span className={'rounded px-2 ' + TONES[tone]}>{children}</span>
        }

        function App() {
          return (
            <>
              <Status tone="emerald">done</Status> <Status tone="amber">open</Status>
            </>
          )
        }
      `,
      tipps: {
        de: ['`const TONES = { emerald: \'bg-emerald-100 text-emerald-800\', … }`', 'Dann `className={\'rounded px-2 \' + TONES[tone]}`.'],
        en: ['`const TONES = { emerald: \'bg-emerald-100 text-emerald-800\', … }`', 'Then `className={\'rounded px-2 \' + TONES[tone]}`.'],
      },
      tests: [
        {
          name: t('Klassen stimmen', 'Classes are correct'),
          pruefung: js`
            await render()
            expect(findAll('span')[0].className).toContain('bg-emerald-100')
            expect(findAll('span')[1].className).toContain('text-amber-800')
          `,
        },
        {
          name: t('Vollständige Klassennamen im Code', 'Complete class names in the code'),
          pruefung: js`
            expect(code).toMatch(/bg-emerald-100 text-emerald-800/)
            expect(code).not.toMatch(/'bg-'\s*\+/)
          `,
        },
      ],
    },
  ],

  'praxis-lokal': [
    {
      id: 'praxis-lokal-import',
      stufe: 'vorhersage',
      titel: t('Die erste Fehlermeldung', 'The first error message'),
      frage: t(
        'Du kopierst eine Komponente aus dem Browser-Editor in `src/App.tsx`. Der Browser meldet „useState is not defined“. Was fehlt?',
        'You copy a component from the browser editor into `src/App.tsx`. The browser reports “useState is not defined”. What is missing?',
      ),
      code: js`
        export default function App() {
          const [count, setCount] = useState(0)
          return <button onClick={() => setCount(count + 1)}>{count}</button>
        }
      `,
      antworten: {
        de: ['npm install react', "import { useState } from 'react'", 'Ein Neustart von Vite', 'export statt export default'],
        en: ['npm install react', "import { useState } from 'react'", 'Restarting Vite', 'export instead of export default'],
      },
      richtig: 1,
      erklaerung: t(
        'Der Editor hier stellt Hooks automatisch bereit. Im echten Projekt importierst du jeden Hook selbst aus `react`.',
        'The editor here provides hooks automatically. In a real project you import every hook yourself from `react`.',
      ),
    },
  ],

  'praxis-typescript': [
    {
      id: 'praxis-typescript-optional',
      stufe: 'vorhersage',
      titel: t('Optionale Prop ohne Standardwert', 'Optional prop without a default'),
      frage: t('Was steht im Dokument?', 'What ends up in the document?'),
      code: js`
        type BadgeProps = { label: string; count?: number }

        function Badge({ label, count }: BadgeProps) {
          return <span>{label}: {count}</span>
        }

        function App() {
          return <Badge label="Inbox" />
        }
      `,
      antworten: {
        de: ['„Inbox: 0“', '„Inbox: “ - die Zahl fehlt', '„Inbox: undefined“', 'Ein Typfehler, nichts wird gerendert'],
        en: ['“Inbox: 0”', '“Inbox: ” - the number is missing', '“Inbox: undefined”', 'A type error, nothing renders'],
      },
      richtig: 1,
      erklaerung: t(
        '`count?` heißt `number | undefined`. Der Aufruf ist also korrekt typisiert. React rendert `undefined` als nichts - einen Standardwert musst du selbst setzen, z.B. `count = 0` beim Auspacken der Props.',
        '`count?` means `number | undefined`, so the call is correctly typed. React renders `undefined` as nothing - you have to set a default yourself, e.g. `count = 0` when destructuring the props.',
      ),
    },
    {
      id: 'praxis-typescript-union',
      stufe: 'fehler',
      titel: t('Action-Union ohne Absicherung', 'Action union without a guard'),
      aufgabe: t(
        'Der Reducer kennt zwei Actions, aber `payload` gibt es nur bei einer davon - die Typprüfung meldet das zu Recht. Mach `Action` zu einer **Discriminated Union** und grenze im Reducer über `action.type` ein. Ein unbekannter `type` soll den State unverändert zurückgeben.',
        'The reducer knows two actions, but `payload` exists on only one of them - the type check rightly complains. Turn `Action` into a **discriminated union** and narrow on `action.type` in the reducer. An unknown `type` should return the state unchanged.',
      ),
      modus: 'ts',
      code: js`
        type Action = { type: string; payload?: number }

        function reducer(count: number, action: Action): number {
          if (action.type === 'added') return count + action.payload
          if (action.type === 'reset') return 0
          return count
        }

        console.log(reducer(1, { type: 'added', payload: 4 }), reducer(9, { type: 'reset' }))
      `,
      loesung: js`
        type Action = { type: 'added'; payload: number } | { type: 'reset' }

        function reducer(count: number, action: Action): number {
          switch (action.type) {
            case 'added':
              return count + action.payload
            case 'reset':
              return 0
            default:
              return count
          }
        }

        console.log(reducer(1, { type: 'added', payload: 4 }), reducer(9, { type: 'reset' }))
      `,
      tipps: {
        de: [
          'Jede Action bekommt ihren eigenen Typ, verbunden mit `|`. Das gemeinsame Feld `type` unterscheidet sie.',
          'Nach `case \'added\':` weiß TypeScript, dass `payload` existiert - ohne `?`.',
          '`type Action = { type: \'added\'; payload: number } | { type: \'reset\' }`',
        ],
        en: [
          'Every action gets its own type, joined with `|`. The shared field `type` tells them apart.',
          'After `case \'added\':` TypeScript knows that `payload` exists - without `?`.',
          '`type Action = { type: \'added\'; payload: number } | { type: \'reset\' }`',
        ],
      },
      tests: [
        { name: 'added', ausdruck: "reducer(1, { type: 'added', payload: 4 })", erwartet: 5 },
        { name: 'reset', ausdruck: "reducer(9, { type: 'reset' })", erwartet: 0 },
      ],
      typTests: [
        {
          name: t('payload ist bei added Pflicht', 'payload is required for added'),
          // Prüft von der anderen Seite: OHNE payload MUSS es einen Typfehler geben.
          code: js`
            // @ts-expect-error payload fehlt
            const fehlt: Action = { type: 'added' }
            void fehlt
          `,
        },
        {
          name: t('reset kennt kein payload', 'reset has no payload'),
          code: js`
            const ok: Action = { type: 'reset' }
            void ok
          `,
        },
      ],
    },
    {
      id: 'praxis-typescript-useref',
      stufe: 'ergaenzen',
      titel: t('useState und useRef typisieren', 'Typing useState and useRef'),
      aufgabe: t(
        'Aus dem Startwert `null` allein kann TypeScript nichts ableiten - `selected` bekommt dadurch den Typ `null` und lässt sich später nicht mehr belegen. Schreib die Typen hin: `selected` ist `User | null`, `current` ist `HTMLInputElement | null`. Genau so machst du es bei `useState<User | null>(null)` und `useRef<HTMLInputElement>(null)`.',
        'From the start value `null` alone TypeScript can infer nothing - `selected` gets the type `null` and cannot be assigned later. Write the types down: `selected` is `User | null`, `current` is `HTMLInputElement | null`. This is exactly what you do with `useState<User | null>(null)` and `useRef<HTMLInputElement>(null)`.',
      ),
      modus: 'ts',
      code: js`
        type User = { id: number; name: string }

        const store = { selected: null }
        const inputRef = { current: null }

        function select(users: User[], name: string): string {
          store.selected = users.find((user) => user.name === name) ?? null
          return store.selected ? store.selected.name : 'nobody'
        }

        function currentValue(): string {
          return inputRef.current ? inputRef.current.value : ''
        }

        console.log(select([{ id: 1, name: 'Ada' }], 'Ada'), currentValue())
      `,
      loesung: js`
        type User = { id: number; name: string }

        const store: { selected: User | null } = { selected: null }
        const inputRef: { current: HTMLInputElement | null } = { current: null }

        function select(users: User[], name: string): string {
          store.selected = users.find((user) => user.name === name) ?? null
          return store.selected ? store.selected.name : 'nobody'
        }

        function currentValue(): string {
          return inputRef.current ? inputRef.current.value : ''
        }

        console.log(select([{ id: 1, name: 'Ada' }], 'Ada'), currentValue())
      `,
      tipps: {
        de: [
          '`{ selected: null }` hat den Typ `{ selected: null }` - da passt später kein `User` hinein.',
          'Schreib den Typ an die Variable: `const store: { selected: User | null } = { selected: null }`.',
          'Für das Element: `{ current: HTMLInputElement | null }`.',
        ],
        en: [
          '`{ selected: null }` has the type `{ selected: null }` - no `User` fits in there later.',
          'Put the type on the variable: `const store: { selected: User | null } = { selected: null }`.',
          'For the element: `{ current: HTMLInputElement | null }`.',
        ],
      },
      tests: [
        { name: t('gefunden', 'found'), ausdruck: "select([{ id: 1, name: 'Ada' }], 'Ada')", erwartet: 'Ada' },
        { name: t('nicht gefunden', 'not found'), ausdruck: "select([], 'Nobody')", erwartet: 'nobody' },
        { name: t('kein Element gesetzt', 'no element set'), ausdruck: 'currentValue()', erwartet: '' },
      ],
      typTests: [
        {
          name: t('store nimmt einen User auf', 'store accepts a user'),
          code: js`
            store.selected = { id: 7, name: 'Grace' }
            store.selected = null
          `,
        },
      ],
    },
  ],

  'praxis-routing': [
    {
      id: 'praxis-routing-link',
      stufe: 'vorhersage',
      titel: t('<a> statt <Link>', '<a> instead of <Link>'),
      frage: t(
        'Die App nutzt React Router. Was ist der Unterschied, wenn man hier `<a href="/about">` statt `<Link to="/about">` schreibt?',
        'The app uses React Router. What is the difference between writing `<a href="/about">` and `<Link to="/about">` here?',
      ),
      code: js`
        <nav>
          <a href="/about">About</a>
          <Link to="/about">About</Link>
        </nav>
      `,
      antworten: {
        de: [
          'Kein Unterschied, React Router fängt beide ab',
          'Das `<a>` lädt die ganze Seite neu, der State geht dabei verloren',
          'Das `<a>` funktioniert gar nicht',
          'Das `<Link>` ist nur eine kürzere Schreibweise',
        ],
        en: [
          'No difference, React Router intercepts both',
          'The `<a>` reloads the whole page, losing the state',
          'The `<a>` does not work at all',
          'The `<Link>` is just a shorter notation',
        ],
      },
      richtig: 1,
      erklaerung: t(
        '`<Link>` verhindert das Standardverhalten des Browsers und ändert nur die Adresse - React rendert die passende Route neu. Ein `<a>` startet die App von vorn: alles im State ist weg.',
        '`<Link>` prevents the browser default and only changes the address - React re-renders the matching route. An `<a>` starts the app from scratch: everything in state is gone.',
      ),
    },
    {
      id: 'praxis-routing-params',
      stufe: 'ergaenzen',
      titel: t('Detailseite mit :id', 'Detail page with :id'),
      aufgabe: t(
        'Ergänze die Routen: `/` zeigt die Liste, `/users/:id` die Detailseite des passenden Nutzers, und jede andere Adresse den Text „Not found“. `UserDetail` holt sich die `id` mit `useParams()`.',
        'Add the routes: `/` shows the list, `/users/:id` the detail page of the matching user, and any other address the text “Not found”. `UserDetail` gets the `id` with `useParams()`.',
      ),
      modus: 'react',
      code: js`
        import { MemoryRouter, Routes, Route, Link, useParams } from 'react-router'

        const USERS = [
          { id: '1', name: 'Ada' },
          { id: '2', name: 'Linus' },
        ]

        function List() {
          return (
            <ul>
              {USERS.map((user) => (
                <li key={user.id}>
                  <Link to={'/users/' + user.id}>{user.name}</Link>
                </li>
              ))}
            </ul>
          )
        }

        function UserDetail() {
          // TODO: id aus der Adresse lesen und den passenden Nutzer anzeigen
          return <h1>?</h1>
        }

        function App() {
          return (
            <MemoryRouter>
              {/* TODO: Routen ergänzen */}
              <List />
            </MemoryRouter>
          )
        }
      `,
      loesung: js`
        import { MemoryRouter, Routes, Route, Link, useParams } from 'react-router'

        const USERS = [
          { id: '1', name: 'Ada' },
          { id: '2', name: 'Linus' },
        ]

        function List() {
          return (
            <ul>
              {USERS.map((user) => (
                <li key={user.id}>
                  <Link to={'/users/' + user.id}>{user.name}</Link>
                </li>
              ))}
            </ul>
          )
        }

        function UserDetail() {
          const { id } = useParams()
          const user = USERS.find((entry) => entry.id === id)
          return <h1>{user ? user.name : 'Unknown user'}</h1>
        }

        function App() {
          return (
            <MemoryRouter>
              <Routes>
                <Route path="/" element={<List />} />
                <Route path="/users/:id" element={<UserDetail />} />
                <Route path="*" element={<p>Not found</p>} />
              </Routes>
            </MemoryRouter>
          )
        }
      `,
      tipps: {
        de: [
          '`<Routes>` umschließt alle `<Route path element>` - gerendert wird immer nur die passende.',
          '`useParams()` gibt ein Objekt zurück: `const { id } = useParams()`. Der Name kommt aus `:id`.',
          'Der Auffangpfad ist `path="*"` und steht zuletzt.',
        ],
        en: [
          '`<Routes>` wraps all `<Route path element>` - only the matching one renders.',
          '`useParams()` returns an object: `const { id } = useParams()`. The name comes from `:id`.',
          'The catch-all path is `path="*"` and comes last.',
        ],
      },
      tests: [
        {
          name: t('Startseite zeigt die Liste', 'Start page shows the list'),
          pruefung: js`
            await render()
            expect(findAll('li')).toHaveLength(2)
            expect(text()).toContain('Ada')
          `,
        },
        {
          name: t('Klick öffnet die Detailseite', 'Clicking opens the detail page'),
          pruefung: js`
            await render()
            await click(find('a[href="/users/2"]'))
            expect(find('h1').textContent).toBe('Linus')
          `,
        },
      ],
    },
    {
      id: 'praxis-routing-suchparameter',
      stufe: 'fehler',
      titel: t('Filter im eigenen State statt in der URL', 'Filter in local state instead of the URL'),
      aufgabe: t(
        'Der Filter steckt in `useState` - ein Link auf die gefilterte Ansicht lässt sich so nicht teilen. Leg ihn stattdessen mit `useSearchParams()` in die Adresse. Beim Umschalten soll `?status=done` bzw. `?status=open` in der URL stehen; ohne Parameter werden alle Einträge gezeigt.',
        'The filter lives in `useState`, so a link to the filtered view cannot be shared. Put it into the address with `useSearchParams()` instead. Switching should put `?status=done` or `?status=open` into the URL; without a parameter all entries are shown.',
      ),
      modus: 'react',
      code: js`
        import { MemoryRouter, useSearchParams } from 'react-router'

        const TODOS = [
          { id: 1, title: 'Write tests', done: true },
          { id: 2, title: 'Read docs', done: false },
          { id: 3, title: 'Ship it', done: false },
        ]

        function Todos() {
          const [status, setStatus] = useState('')
          const visible = status === '' ? TODOS : TODOS.filter((todo) => (status === 'done') === todo.done)

          return (
            <>
              <button onClick={() => setStatus('open')}>Open</button>
              <button onClick={() => setStatus('done')}>Done</button>
              <button onClick={() => setStatus('')}>All</button>
              <ul>
                {visible.map((todo) => (
                  <li key={todo.id}>{todo.title}</li>
                ))}
              </ul>
            </>
          )
        }

        function App() {
          return (
            <MemoryRouter>
              <Todos />
            </MemoryRouter>
          )
        }
      `,
      loesung: js`
        import { MemoryRouter, useSearchParams } from 'react-router'

        const TODOS = [
          { id: 1, title: 'Write tests', done: true },
          { id: 2, title: 'Read docs', done: false },
          { id: 3, title: 'Ship it', done: false },
        ]

        function Todos() {
          const [searchParams, setSearchParams] = useSearchParams()
          const status = searchParams.get('status') ?? ''
          const visible = status === '' ? TODOS : TODOS.filter((todo) => (status === 'done') === todo.done)

          return (
            <>
              <button onClick={() => setSearchParams({ status: 'open' })}>Open</button>
              <button onClick={() => setSearchParams({ status: 'done' })}>Done</button>
              <button onClick={() => setSearchParams({})}>All</button>
              <ul>
                {visible.map((todo) => (
                  <li key={todo.id}>{todo.title}</li>
                ))}
              </ul>
            </>
          )
        }

        function App() {
          return (
            <MemoryRouter>
              <Todos />
            </MemoryRouter>
          )
        }
      `,
      tipps: {
        de: [
          '`useSearchParams()` verhält sich wie `useState`, nur dass der Wert in der Adresse steht.',
          'Lesen: `searchParams.get(\'status\')` - fehlt der Parameter, kommt `null` zurück.',
          'Schreiben: `setSearchParams({ status: \'done\' })`, und `setSearchParams({})` räumt ihn wieder weg.',
        ],
        en: [
          '`useSearchParams()` behaves like `useState`, except the value lives in the address.',
          'Reading: `searchParams.get(\'status\')` - if the parameter is missing you get `null`.',
          'Writing: `setSearchParams({ status: \'done\' })`, and `setSearchParams({})` clears it again.',
        ],
      },
      tests: [
        {
          name: t('Ohne Filter alle Einträge', 'All entries without a filter'),
          pruefung: js`
            await render()
            expect(findAll('li')).toHaveLength(3)
          `,
        },
        {
          // Der MemoryRouter hält die Adresse im Speicher, nicht in window.location -
          // deshalb wird hier der Quelltext geprüft statt der echten Adresszeile.
          name: t('Der Filter kommt aus der Adresse', 'The filter comes from the address'),
          pruefung: js`
            await render()
            expect(code).toMatch(/useSearchParams\(/)
            expect(code).not.toMatch(/useState\(/)
          `,
        },
        {
          name: t('Filtern funktioniert weiter', 'Filtering still works'),
          pruefung: js`
            await render()
            await click(button('Done'))
            expect(findAll('li')).toHaveLength(1)
            expect(text()).toContain('Write tests')
          `,
        },
        {
          name: t('„All“ zeigt wieder alles', '“All” shows everything again'),
          pruefung: js`
            await render()
            await click(button('Done'))
            await click(button('All'))
            expect(findAll('li')).toHaveLength(3)
          `,
        },
      ],
    },
  ],

  'praxis-testen': [
    {
      id: 'praxis-testen-getby',
      stufe: 'vorhersage',
      titel: t('getBy, queryBy oder findBy?', 'getBy, queryBy or findBy?'),
      frage: t(
        'Ein Test soll prüfen, dass nach dem Absenden **keine** Fehlermeldung mehr da ist. Welche Abfrage gehört dahin?',
        'A test should check that **no** error message is there any more after submitting. Which query belongs there?',
      ),
      code: js`
        test('no error after a valid submit', async () => {
          render(<Form />)
          await userEvent.click(screen.getByRole('button', { name: 'Save' }))

          expect(/* ??? */('alert')).not.toBeInTheDocument()
        })
      `,
      antworten: {
        de: ['screen.getByRole', 'screen.queryByRole', 'screen.findByRole', 'screen.getAllByRole'],
        en: ['screen.getByRole', 'screen.queryByRole', 'screen.findByRole', 'screen.getAllByRole'],
      },
      richtig: 1,
      erklaerung: t(
        '`getBy…` wirft sofort einen Fehler, wenn nichts gefunden wird - der Test würde also abbrechen, statt zu bestehen. Nur `queryBy…` gibt `null` zurück und ist damit die richtige Wahl für „ist nicht da“. `findBy…` wartet und ist für Dinge, die erst später erscheinen.',
        '`getBy…` throws immediately when nothing is found - the test would fail instead of passing. Only `queryBy…` returns `null` and is therefore the right choice for “is not there”. `findBy…` waits and is for things that appear later.',
      ),
    },
    {
      id: 'praxis-testen-verhalten',
      stufe: 'frei',
      titel: t('Eine Komponente testbar machen', 'Making a component testable'),
      aufgabe: t(
        'Diese Suchleiste soll sich über ihre **Rolle** finden lassen, nicht über CSS-Klassen. Sorg dafür, dass das Eingabefeld ein Label „Search“ hat, der Knopf über seinen Namen „Search“ erreichbar ist, und nach dem Absenden die Trefferzahl als `role="status"` erscheint - also genau das, was ein Test mit `getByRole` und `getByLabelText` ansteuern würde.',
        'This search bar should be findable by its **role**, not by CSS classes. Make sure the input has a label “Search”, the button is reachable by its name “Search”, and after submitting the number of results appears as `role="status"` - exactly what a test with `getByRole` and `getByLabelText` would target.',
      ),
      modus: 'react',
      code: js`
        const ITEMS = ['apple', 'banana', 'avocado']

        function App() {
          const [query, setQuery] = useState('')
          const [hits, setHits] = useState(null)

          function onSubmit(event) {
            event.preventDefault()
            setHits(ITEMS.filter((item) => item.includes(query)).length)
          }

          return (
            <form onSubmit={onSubmit}>
              <div className="search-label">Search</div>
              <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} />
              <button className="search-button">🔍</button>
              {hits !== null && <div className="search-hits">{hits} results</div>}
            </form>
          )
        }
      `,
      loesung: js`
        const ITEMS = ['apple', 'banana', 'avocado']

        function App() {
          const [query, setQuery] = useState('')
          const [hits, setHits] = useState(null)

          function onSubmit(event) {
            event.preventDefault()
            setHits(ITEMS.filter((item) => item.includes(query)).length)
          }

          return (
            <form onSubmit={onSubmit}>
              <label htmlFor="search">Search</label>
              <input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
              <button>Search</button>
              {hits !== null && <div role="status">{hits} results</div>}
            </form>
          )
        }
      `,
      tipps: {
        de: [
          'Ein `<div>` mit Text ist kein Label. Nimm `<label htmlFor="…">` und gib dem Feld dieselbe `id`.',
          'Der zugängliche Name eines Knopfes ist sein Textinhalt - ein Emoji allein reicht nicht.',
          '`role="status"` sagt Screenreadern (und Tests) an, dass sich hier etwas Neues ergeben hat.',
        ],
        en: [
          'A `<div>` with text is not a label. Use `<label htmlFor="…">` and give the input the same `id`.',
          'The accessible name of a button is its text content - an emoji alone is not enough.',
          '`role="status"` announces to screen readers (and tests) that something new appeared here.',
        ],
      },
      tests: [
        {
          name: t('Feld hat ein verknüpftes Label', 'Input has a linked label'),
          pruefung: js`
            await render()
            const label = find('label')
            const input = find('input')
            expect(label.textContent).toContain('Search')
            expect(label.getAttribute('for')).toBe(input.getAttribute('id'))
          `,
        },
        {
          name: t('Knopf hat einen lesbaren Namen', 'Button has a readable name'),
          pruefung: js`
            await render()
            expect(find('button').textContent).toContain('Search')
          `,
        },
        {
          name: t('Trefferzahl als role="status"', 'Result count as role="status"'),
          pruefung: js`
            await render()
            await type(find('input'), 'a')
            await submit(find('form'))
            expect(find('[role="status"]').textContent).toContain('3')
          `,
        },
      ],
    },
  ],

  'praxis-barrierefreiheit': [
    {
      id: 'praxis-barrierefreiheit-div',
      stufe: 'vorhersage',
      titel: t('div mit onClick', 'div with onClick'),
      frage: t(
        'Was kann ein `<div onClick={…}>` nicht, was ein `<button onClick={…}>` kann?',
        'What can a `<div onClick={…}>` not do that a `<button onClick={…}>` can?',
      ),
      code: js`
        <div onClick={remove}>Delete</div>
        <button onClick={remove}>Delete</button>
      `,
      antworten: {
        de: [
          'Nichts - beides verhält sich gleich',
          'Es ist nicht per Tab erreichbar, reagiert nicht auf Enter/Leertaste und wird nicht als Knopf angesagt',
          'Es kann keine Funktion aufrufen',
          'Es lässt sich nicht mit CSS gestalten',
        ],
        en: [
          'Nothing - both behave the same',
          'It cannot be reached with Tab, does not react to Enter/Space and is not announced as a button',
          'It cannot call a function',
          'It cannot be styled with CSS',
        ],
      },
      richtig: 1,
      erklaerung: t(
        'Ein `<button>` bringt Fokussierbarkeit, Tastaturbedienung und die Rolle „button“ von sich aus mit. Beim `<div>` müsste man `tabIndex`, `role` und Tastatur-Handler alle selbst nachbauen - das passende Element zu nehmen ist einfacher und weniger fehleranfällig.',
        'A `<button>` brings focusability, keyboard operation and the role “button” by itself. With a `<div>` you would have to rebuild `tabIndex`, `role` and keyboard handlers yourself - taking the right element is simpler and less error-prone.',
      ),
    },
    {
      id: 'praxis-barrierefreiheit-elemente',
      stufe: 'fehler',
      titel: t('Klickbare divs ersetzen', 'Replacing clickable divs'),
      aufgabe: t(
        'Diese Liste ist mit der Maus bedienbar, mit der Tastatur nicht. Ersetze die `div`s durch die passenden Elemente: Der Umschalter ist ein `button`, der Verweis auf die Detailseite ein `a` mit `href`. Das Symbol-Icon des Löschknopfes braucht außerdem einen `aria-label`.',
        'This list can be operated with a mouse, but not with a keyboard. Replace the `div`s with the right elements: the toggle is a `button`, the link to the detail page an `a` with `href`. The icon-only delete button also needs an `aria-label`.',
      ),
      modus: 'react',
      code: js`
        const TODOS = [{ id: 1, title: 'Write docs', done: false }]

        function App() {
          const [todos, setTodos] = useState(TODOS)

          function toggle(id) {
            setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
          }

          return (
            <ul>
              {todos.map((todo) => (
                <li key={todo.id}>
                  <div onClick={() => toggle(todo.id)}>{todo.done ? 'Done' : 'Open'}</div>
                  <div onClick={() => location.assign('/todos/' + todo.id)}>{todo.title}</div>
                  <div onClick={() => setTodos([])}>🗑</div>
                </li>
              ))}
            </ul>
          )
        }
      `,
      loesung: js`
        const TODOS = [{ id: 1, title: 'Write docs', done: false }]

        function App() {
          const [todos, setTodos] = useState(TODOS)

          function toggle(id) {
            setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
          }

          return (
            <ul>
              {todos.map((todo) => (
                <li key={todo.id}>
                  <button onClick={() => toggle(todo.id)}>{todo.done ? 'Done' : 'Open'}</button>
                  <a href={'/todos/' + todo.id}>{todo.title}</a>
                  <button aria-label="Delete" onClick={() => setTodos([])}>
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )
        }
      `,
      tipps: {
        de: [
          'Etwas, das eine Aktion auslöst, ist ein `button`. Etwas, das woandershin führt, ist ein `a` mit `href`.',
          'Der Löschknopf zeigt nur ein Emoji - sein Name muss per `aria-label` dazu.',
          'Danach funktioniert die Tastaturbedienung von selbst, ohne `tabIndex` oder `onKeyDown`.',
        ],
        en: [
          'Something that triggers an action is a `button`. Something that leads elsewhere is an `a` with `href`.',
          'The delete button only shows an emoji - its name has to come from `aria-label`.',
          'After that keyboard operation works by itself, without `tabIndex` or `onKeyDown`.',
        ],
      },
      tests: [
        {
          name: t('Keine klickbaren divs mehr', 'No clickable divs left'),
          pruefung: js`
            await render()
            expect(findAll('li div')).toHaveLength(0)
            expect(findAll('li button')).toHaveLength(2)
            expect(findAll('li a[href]')).toHaveLength(1)
          `,
        },
        {
          name: t('Umschalter funktioniert weiter', 'Toggle still works'),
          pruefung: js`
            await render()
            await click(button('Open'))
            expect(text()).toContain('Done')
          `,
        },
        {
          name: t('Löschknopf hat einen Namen', 'Delete button has a name'),
          pruefung: js`
            await render()
            const loeschen = findAll('li button').find((el) => el.textContent.includes('🗑'))
            expect(loeschen.getAttribute('aria-label')).toBeTruthy()
          `,
        },
      ],
    },
    {
      id: 'praxis-barrierefreiheit-formular',
      stufe: 'ergaenzen',
      titel: t('Fehlermeldung richtig verknüpfen', 'Linking an error message properly'),
      aufgabe: t(
        'Das Formular zeigt den Fehler nur optisch an. Verknüpfe ihn richtig: Das Feld bekommt ein Label, im Fehlerfall `aria-invalid="true"` und ein `aria-describedby`, das auf die Meldung zeigt. Die Meldung selbst bekommt `role="alert"`, damit sie angesagt wird.',
        'The form only shows the error visually. Link it properly: the input gets a label, in the error case `aria-invalid="true"` and an `aria-describedby` pointing at the message. The message itself gets `role="alert"` so it is announced.',
      ),
      modus: 'react',
      code: js`
        function App() {
          const [email, setEmail] = useState('')
          const [error, setError] = useState('')

          function onSubmit(event) {
            event.preventDefault()
            setError(email.includes('@') ? '' : 'Please enter a valid email address.')
          }

          return (
            <form onSubmit={onSubmit}>
              <span>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
              {error && <p className="error">{error}</p>}
              <button>Sign up</button>
            </form>
          )
        }
      `,
      loesung: js`
        function App() {
          const [email, setEmail] = useState('')
          const [error, setError] = useState('')

          function onSubmit(event) {
            event.preventDefault()
            setError(email.includes('@') ? '' : 'Please enter a valid email address.')
          }

          return (
            <form onSubmit={onSubmit}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'email-error' : undefined}
              />
              {error && (
                <p id="email-error" role="alert" className="error">
                  {error}
                </p>
              )}
              <button>Sign up</button>
            </form>
          )
        }
      `,
      tipps: {
        de: [
          'Aus dem `<span>` wird ein `<label htmlFor="email">`, das Feld bekommt `id="email"`.',
          '`aria-describedby` enthält die `id` der Meldung - also muss die Meldung eine `id` haben.',
          'Ohne Fehler sollen beide Attribute ganz fehlen: `aria-invalid={error ? \'true\' : undefined}`.',
        ],
        en: [
          'The `<span>` becomes a `<label htmlFor="email">`, and the input gets `id="email"`.',
          '`aria-describedby` contains the `id` of the message - so the message needs an `id`.',
          'Without an error both attributes should be absent: `aria-invalid={error ? \'true\' : undefined}`.',
        ],
      },
      tests: [
        {
          name: t('Label ist mit dem Feld verknüpft', 'Label is linked to the input'),
          pruefung: js`
            await render()
            expect(find('label').getAttribute('for')).toBe(find('input').getAttribute('id'))
          `,
        },
        {
          name: t('Ohne Fehler keine aria-Attribute', 'No aria attributes without an error'),
          pruefung: js`
            await render()
            expect(find('input').getAttribute('aria-invalid')).toBe(null)
            expect(find('input').getAttribute('aria-describedby')).toBe(null)
          `,
        },
        {
          name: t('Fehler wird angesagt und verknüpft', 'Error is announced and linked'),
          pruefung: js`
            await render()
            await type(find('input'), 'nope')
            await submit(find('form'))
            const meldung = find('[role="alert"]')
            expect(find('input').getAttribute('aria-invalid')).toBe('true')
            expect(find('input').getAttribute('aria-describedby')).toBe(meldung.getAttribute('id'))
          `,
        },
      ],
    },
  ],
}
