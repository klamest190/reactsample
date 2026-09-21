import { js } from '../../lernen/quelltext'
import type { UebungsSammlung } from './typen'

/** Zusätzliche Übungen für Teil 5 (Praxis & Muster) - gestuft wie in js.ts. */

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
}
