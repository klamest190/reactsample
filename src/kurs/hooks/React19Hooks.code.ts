import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'hooks-react19-einstieg': {
    code: js`
      async function save(previousMessage, formData) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return \`Saved: \${formData.get('name')}\`
      }

      function App() {
        const [message, formAction, isPending] = useActionState(save, '')

        return (
          <form action={formAction}>
            <input name="name" placeholder="Your name" />
            <button disabled={isPending}>{isPending ? 'Saving …' : 'Save'}</button>
            <p>{message}</p>
          </form>
        )
      }
    `,
  },
  'hooks-react19-use': {
    code: js`
      const QUOTES = [
        'Programs must be written for people to read. - Harold Abelson',
        'Simplicity is prerequisite for reliability. - Edsger Dijkstra',
        'First, solve the problem. Then, write the code. - John Johnson',
      ]

      // Simulated server
      function loadQuote() {
        return new Promise((resolve) =>
          setTimeout(() => resolve(QUOTES[Math.floor(Math.random() * QUOTES.length)]), 1000)
        )
      }

      function Quote({ quotePromise }) {
        const quote = use(quotePromise)   // "waits" until the promise is fulfilled
        return <blockquote>“{quote}”</blockquote>
      }

      function App() {
        // The promise must NOT be created during rendering - that would loop forever.
        // Here: once via lazy initializer, afterwards on click.
        const [quotePromise, setQuotePromise] = useState(() => loadQuote())

        return (
          <>
            <button onClick={() => setQuotePromise(loadQuote())}>New quote</button>
            <Suspense fallback={<p>⏳ Loading quote …</p>}>
              <Quote quotePromise={quotePromise} />
            </Suspense>
          </>
        )
      }
    `,
  },
  'hooks-react19-actionstate': {
    code: js`
      const wait = (ms) => new Promise((r) => setTimeout(r, ms))

      // Simulated server
      async function subscribeToNewsletter(email) {
        await wait(1000)
        if (!email.includes('@')) return { ok: false, message: 'That is not a valid email.' }
        if (email.startsWith('test')) return { ok: false, message: 'This address is already subscribed.' }
        return { ok: true, message: \`Thanks! Confirmation sent to \${email}.\` }
      }

      function App() {
        const [result, formAction, isPending] = useActionState(
          async (previous, formData) => {
            const email = formData.get('email')
            return subscribeToNewsletter(email)
          },
          null
        )

        return (
          <form action={formAction}>
            <input name="email" placeholder="you@email.com" disabled={isPending} />
            <button disabled={isPending}>{isPending ? 'Sending …' : 'Subscribe'}</button>
            {result && (
              <p style={{ color: result.ok ? 'green' : 'crimson' }}>{result.message}</p>
            )}
            <p><small>Try: without @, with test@…, with a normal address</small></p>
          </form>
        )
      }
    `,
  },
  'hooks-react19-formstatus': {
    code: js`
      // Reusable in any form - without props
      function SubmitButton({ children }) {
        const { pending } = useFormStatus()
        return <button disabled={pending}>{pending ? '⏳ One moment …' : children}</button>
      }

      function App() {
        const [saved, setSaved] = useState([])

        async function save(formData) {
          await new Promise((r) => setTimeout(r, 1200))
          setSaved((prev) => [...prev, formData.get('note')])
        }

        return (
          <>
            <form action={save}>
              <input name="note" placeholder="Note" required />
              <SubmitButton>Save</SubmitButton>
            </form>
            <ul>{saved.map((note, i) => <li key={i}>{note}</li>)}</ul>
          </>
        )
      }
    `,
  },
  'hooks-react19-optimistic': {
    code: js`
      const wait = (ms) => new Promise((r) => setTimeout(r, ms))

      function App() {
        const [messages, setMessages] = useState([{ id: 1, text: 'Hello!' }])

        const [displayed, addOptimistic] = useOptimistic(
          messages,
          (current, text) => [...current, { id: Math.random(), text, sending: true }]
        )

        async function send(formData) {
          const text = formData.get('text')
          addOptimistic(text)       // visible immediately
          await wait(1500)          // "server"
          if (text.toLowerCase().includes('error')) {
            console.error('Sending failed - the message disappears again')
            return
          }
          setMessages((prev) => [...prev, { id: Date.now(), text }])
        }

        return (
          <>
            <ul>
              {displayed.map((m) => (
                <li key={m.id} style={{ opacity: m.sending ? 0.5 : 1 }}>
                  {m.text} {m.sending && <small>(sending …)</small>}
                </li>
              ))}
            </ul>
            <form action={send}>
              <input name="text" placeholder='Message (with "error" it fails)' required />
              <button>Send</button>
            </form>
          </>
        )
      }
    `,
  },
  'hooks-react19-uebung': {
    tipps: {
      de: [
        '`useActionState` hält `{ comments, error }`; die Action bekommt den vorherigen State und `formData`.',
        'Im Knopf: `useFormStatus()` liefert `pending` - dafür muss er eine eigene Komponente im `<form>` sein.',
        '`useOptimistic(state.comments, …)` zeigt den neuen Kommentar sofort; Fehler fängst du mit `try/catch` in der Action.',
      ],
      en: [
        '`useActionState` holds `{ comments, error }`; the action receives the previous state and `formData`.',
        'In the button: `useFormStatus()` provides `pending` - for that it has to be its own component inside the `<form>`.',
        '`useOptimistic(state.comments, …)` shows the new comment immediately; catch errors with `try/catch` in the action.',
      ],
    },
    code: js`
      const wait = (ms) => new Promise((r) => setTimeout(r, ms))

      // "Server" - don't change
      async function saveComment(text) {
        await wait(1000)
        if (!text.trim()) throw new Error('Empty comments are not allowed.')
        return { id: Date.now(), text: text.trim() }
      }

      function App() {
        return (
          <form>
            <input name="text" placeholder="Comment" />
            <button>Send</button>
          </form>
        )
      }
    `,
    loesung: js`
      const wait = (ms) => new Promise((r) => setTimeout(r, ms))

      async function saveComment(text) {
        await wait(1000)
        if (!text.trim()) throw new Error('Empty comments are not allowed.')
        return { id: Date.now(), text: text.trim() }
      }

      function SendButton() {
        const { pending } = useFormStatus()
        return <button disabled={pending}>{pending ? 'Sending …' : 'Send'}</button>
      }

      function App() {
        const [state, formAction] = useActionState(
          async (previous, formData) => {
            const text = formData.get('text')
            addOptimistic(text)
            try {
              const comment = await saveComment(text)
              return { comments: [...previous.comments, comment], error: null }
            } catch (e) {
              return { ...previous, error: e.message }
            }
          },
          { comments: [], error: null }
        )

        const [displayed, addOptimistic] = useOptimistic(
          state.comments,
          (current, text) => [...current, { id: 'temp', text, temp: true }]
        )

        return (
          <>
            <ul>
              {displayed.map((c) => (
                <li key={c.id} style={{ opacity: c.temp ? 0.5 : 1 }}>{c.text}</li>
              ))}
            </ul>
            <form action={formAction}>
              <input name="text" placeholder="Comment" />
              <SendButton />
            </form>
            {state.error && <p style={{ color: 'crimson' }}>{state.error}</p>}
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Die neuen Hooks werden genutzt', en: 'The new hooks are used' },
        pruefung: js`
          expect(code).toMatch(/useActionState\(/)
          expect(code).toMatch(/useFormStatus\(/)
        `,
      },
      {
        name: { de: 'Ein Kommentar erscheint nach dem Senden', en: 'A comment appears after sending' },
        pruefung: js`
          await render()
          await type(field('text'), 'Great chapter!')
          await submit(field('text'))
          await waitFor(() => expect(findAll('li').map((li) => li.textContent)).toContain('Great chapter!'))
        `,
      },
      {
        name: { de: 'Während des Sendens zeigt der Knopf „Sending …“', en: 'While sending, the button shows “Sending …”' },
        pruefung: js`
          await render()
          await type(field('text'), 'Hi')
          await submit(field('text'))
          await waitFor(() => expect(text()).toContain('Sending …'), 800)
        `,
      },
      {
        name: { de: 'Ein leerer Kommentar zeigt die Fehlermeldung, die Liste bleibt', en: 'An empty comment shows the error, the list stays' },
        pruefung: js`
          await render()
          await type(field('text'), 'First')
          await submit(field('text'))
          await waitFor(() => expect(text()).toContain('First'))
          await wait(100)
          await type(field('text'), '')
          await submit(field('text'))
          await waitFor(() => expect(text()).toContain('Empty comments are not allowed.'))
          expect(text()).toContain('First')
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    const [state, formAction, isPending] = useActionState(
      async (previousState, formData) => {
        // ... call the server ...
        return newState
      },
      initialState
    )

    <form action={formAction}> … </form>
  `,
  beispiel2: js`
    const [optimistic, addOptimistic] = useOptimistic(
      realState,
      (current, newValue) => /* what does the state look like with newValue? */
    )
  `,
}
