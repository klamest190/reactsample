import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'praxis-daten-einstieg': {
    code: js`
      function App() {
        const [user, setUser] = useState(null)

        useEffect(() => {
          fetch('https://jsonplaceholder.typicode.com/users/1')
            .then((response) => response.json())
            .then((data) => setUser(data))
        }, [])

        if (!user) return <p>⏳ Loading …</p>
        return <p>Hello, {user.name}!</p>
      }
    `,
  },
  'praxis-daten-grundmuster': {
    code: js`
      function App() {
        const [users, setUsers] = useState(null)
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState(null)

        useEffect(() => {
          async function load() {
            try {
              const response = await fetch('https://jsonplaceholder.typicode.com/users')
              if (!response.ok) throw new Error('HTTP ' + response.status)
              setUsers(await response.json())
            } catch (e) {
              setError(e.message)
            } finally {
              setLoading(false)
            }
          }
          load()
        }, [])

        if (loading) return <p>⏳ Loading users …</p>
        if (error) return <p style={{ color: 'crimson' }}>Error: {error}</p>
        if (users.length === 0) return <p>No users found.</p>

        return (
          <ul>
            {users.map((u) => (
              <li key={u.id}>{u.name} - <small>{u.address.city}</small></li>
            ))}
          </ul>
        )
      }
    `,
  },
  'praxis-daten-race': {
    code: js`
      // Simulated server: user 1 responds deliberately SLOWLY.
      function loadUser(id, signal) {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => resolve({ id, name: ['', 'Ada', 'Alan', 'Grace'][id] }), id === 1 ? 2000 : 300)
          signal?.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new DOMException('aborted', 'AbortError'))
          })
        })
      }

      function Profile({ id }) {
        const [user, setUser] = useState(null)

        useEffect(() => {
          setUser(null)
          // ❌ Without aborting: click "1" and then quickly "2" - after 2 s Ada shows up although 2 is selected!
          loadUser(id).then(setUser)

          // ✅ With aborting: replace the line above with these three
          // const controller = new AbortController()
          // loadUser(id, controller.signal).then(setUser).catch(() => {})
          // return () => controller.abort()
        }, [id])

        return <p>Selected: {id} → Displayed: {user ? user.name : '⏳'}</p>
      }

      function App() {
        const [id, setId] = useState(2)
        return (
          <>
            {[1, 2, 3].map((n) => <button key={n} onClick={() => setId(n)}>{n}</button>)}
            <Profile id={id} />
          </>
        )
      }
    `,
  },
  'praxis-daten-uebung': {
    tipps: {
      de: [
        'Drei States: `data`, `loading`, `error` - und ein Effekt mit `[url]`.',
        '`AbortController` im Effekt anlegen, `signal` an `fetch` geben, im Cleanup `abort()`.',
        'Für „Neu laden“ ein Zähler-State `attempt` in den Abhängigkeiten.',
      ],
      en: [
        'Three states: `data`, `loading`, `error` - and an effect with `[url]`.',
        'Create an `AbortController` in the effect, pass `signal` to `fetch`, call `abort()` in cleanup.',
        'For “reload”, a counter state `attempt` in the dependencies.',
      ],
    },
    code: js`
      function useFetch(url) {
        // Your code
        return { data: null, loading: false, error: null, reload: () => {} }
      }

      function App() {
        const [userId, setUserId] = useState(1)
        const { data, loading, error, reload } = useFetch(
          \`https://jsonplaceholder.typicode.com/posts?userId=\${userId}&_limit=3\`
        )

        return (
          <>
            {[1, 2, 3].map((id) => (
              <button key={id} onClick={() => setUserId(id)} disabled={id === userId}>User {id}</button>
            ))}
            <button onClick={reload}>↻</button>
            {loading && <p>⏳ Loading …</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            {data && !loading && (
              <ul>{data.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
            )}
          </>
        )
      }
    `,
    loesung: js`
      function useFetch(url) {
        const [data, setData] = useState(null)
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState(null)
        const [attempt, setAttempt] = useState(0)

        useEffect(() => {
          const controller = new AbortController()
          setLoading(true)
          setError(null)

          fetch(url, { signal: controller.signal })
            .then((response) => {
              if (!response.ok) throw new Error('HTTP ' + response.status)
              return response.json()
            })
            .then((json) => {
              setData(json)
              setLoading(false)
            })
            .catch((e) => {
              if (e.name === 'AbortError') return
              setError(e.message)
              setLoading(false)
            })

          return () => controller.abort()
        }, [url, attempt])

        const reload = useCallback(() => setAttempt((a) => a + 1), [])

        return { data, loading, error, reload }
      }

      function App() {
        const [userId, setUserId] = useState(1)
        const { data, loading, error, reload } = useFetch(
          \`https://jsonplaceholder.typicode.com/posts?userId=\${userId}&_limit=3\`
        )

        return (
          <>
            {[1, 2, 3].map((id) => (
              <button key={id} onClick={() => setUserId(id)} disabled={id === userId}>User {id}</button>
            ))}
            <button onClick={reload}>↻</button>
            {loading && <p>⏳ Loading …</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            {data && !loading && (
              <ul>{data.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
            )}
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Zeigt „Loading …“ und dann die Beiträge', en: 'Shows “Loading …” and then the posts' },
        pruefung: js`
          mockFetch((url) => [{ id: 1, title: 'Post of user ' + new URL(url).searchParams.get('userId') }])
          await render()
          expect(text()).toContain('Loading')
          await waitFor(() => expect(text()).toContain('Post of user 1'))
        `,
      },
      {
        name: { de: 'Ein anderer Nutzer lädt neu', en: 'Another user loads again' },
        pruefung: js`
          mockFetch((url) => [{ id: 1, title: 'Post of user ' + new URL(url).searchParams.get('userId') }])
          await render()
          await waitFor(() => expect(text()).toContain('Post of user 1'))
          await click(button('User 2'))
          await waitFor(() => expect(text()).toContain('Post of user 2'))
        `,
      },
      {
        name: { de: 'HTTP-Fehler zeigen „HTTP 500“', en: 'HTTP errors show “HTTP 500”' },
        pruefung: js`
          mockFetch(() => ({ status: 500, body: {} }))
          await render()
          await waitFor(() => expect(text()).toContain('HTTP 500'))
        `,
      },
      {
        name: { de: 'reload startet die Anfrage erneut', en: 'reload starts the request again' },
        pruefung: js`
          const { calls } = mockFetch(() => [])
          await render()
          await waitFor(() => expect(calls.length).toBeGreaterThan(0))
          const vorher = calls.length
          await click(button('↻'))
          await waitFor(() => expect(calls.length).toBeGreaterThan(vorher))
        `,
      },
      {
        name: { de: 'Die alte Anfrage wird abgebrochen', en: 'The old request is aborted' },
        pruefung: js`
          const { calls } = mockFetch(() => [])
          await render()
          await click(button('User 2'))
          await waitFor(() => expect(calls.length).toBeGreaterThan(1))
          expect(calls[0].signal?.aborted).toBe(true)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    useEffect(() => {
      const controller = new AbortController()

      fetch(\`/api/users/\${id}\`, { signal: controller.signal })
        .then((r) => r.json())
        .then(setUser)
        .catch((e) => {
          if (e.name !== 'AbortError') setError(e.message)
        })

      return () => controller.abort()
    }, [id])
  `,
}
