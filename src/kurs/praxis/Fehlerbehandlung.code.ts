import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'praxis-fehler-einstieg': {
    code: js`
      class ErrorBoundary extends React.Component {
        state = { hasError: false }
        static getDerivedStateFromError() {
          return { hasError: true }
        }
        render() {
          if (this.state.hasError) return <p>😵 Something went wrong here.</p>
          return this.props.children
        }
      }

      function Broken() {
        throw new Error('Boom!')
      }

      function App() {
        return (
          <>
            <ErrorBoundary>
              <Broken />
            </ErrorBoundary>
            <p>The rest of the page still works.</p>
          </>
        )
      }
    `,
  },
  'praxis-fehler-boundary': {
    code: js`
      class ErrorBoundary extends React.Component {
        state = { error: null }
        static getDerivedStateFromError(error) {
          return { error }
        }
        render() {
          if (this.state.error) {
            return (
              <div style={{ background: '#fee2e2', padding: 8, borderRadius: 8 }}>
                💥 {this.props.name} crashed: {this.state.error.message}
                <button onClick={() => this.setState({ error: null })}>Try again</button>
              </div>
            )
          }
          return this.props.children
        }
      }

      function Weather({ city }) {
        if (city === '') throw new Error('No city given')
        return <p>☀️ It is 21 °C in {city}.</p>
      }

      function App() {
        const [city, setCity] = useState('Berlin')
        return (
          <>
            <input value={city} onChange={(e) => setCity(e.target.value)} />
            <p>Delete the text in the input field:</p>
            <ErrorBoundary name="Weather widget">
              <Weather city={city} />
            </ErrorBoundary>
            <p>… the rest of the page keeps working.</p>
          </>
        )
      }
    `,
  },
  'praxis-fehler-async': {
    code: js`
      const wait = (ms) => new Promise((r) => setTimeout(r, ms))

      async function save(data) {
        await wait(500)
        if (Math.random() < 0.5) throw new Error('Server error 500')
        return 'ok'
      }

      function App() {
        const [status, setStatus] = useState({ type: 'idle' })

        async function handleClick() {
          setStatus({ type: 'loading' })
          try {
            await save({ title: 'Test' })
            setStatus({ type: 'success' })
          } catch (error) {
            // User-friendly message + technical details in the console
            console.error(error)
            setStatus({ type: 'error', message: error.message })
          }
        }

        return (
          <>
            <button onClick={handleClick} disabled={status.type === 'loading'}>Save (50 % errors)</button>
            {status.type === 'loading' && <p>⏳ Saving …</p>}
            {status.type === 'success' && <p>✅ Saved</p>}
            {status.type === 'error' && (
              <p style={{ color: 'crimson' }}>
                That didn't work ({status.message}). <button onClick={handleClick}>Retry</button>
              </p>
            )}
          </>
        )
      }
    `,
  },
  'praxis-fehler-uebung': {
    tipps: {
      de: [
        'Jedes Widget bekommt seine eigene `ErrorBoundary` - dann bleibt der Rest stehen.',
        '`getDerivedStateFromError` speichert den Fehler, `render` zeigt dann `fallback`.',
        'Nach „Daten reparieren“ braucht die Boundary einen neuen `key`, sonst bleibt sie im Fehlerzustand.',
      ],
      en: [
        'Each widget gets its own `ErrorBoundary` - then the rest stays intact.',
        '`getDerivedStateFromError` stores the error, and `render` then shows `fallback`.',
        'After “Fix the data” the boundary needs a new `key`, otherwise it stays in the error state.',
      ],
    },
    code: js`
      function Revenue({ data }) {
        return <p>💶 Revenue: {data.revenue.toLocaleString()} €</p>
      }

      function Visitors() {
        return <p>👥 Visitors: 1,234</p>
      }

      function App() {
        const [data, setData] = useState({ revenue: 12500 })

        return (
          <>
            <button onClick={() => setData({})}>Break the data</button>
            <button onClick={() => setData({ revenue: 12500 })}>Fix the data</button>
            <Revenue data={data} />
            <Visitors />
          </>
        )
      }
    `,
    loesung: js`
      class ErrorBoundary extends React.Component {
        state = { error: null }
        static getDerivedStateFromError(error) {
          return { error }
        }
        componentDidCatch(error) {
          console.error('Widget error:', error.message)
        }
        render() {
          return this.state.error ? this.props.fallback : this.props.children
        }
      }

      function Revenue({ data }) {
        return <p>💶 Revenue: {data.revenue.toLocaleString()} €</p>
      }

      function Visitors() {
        return <p>👥 Visitors: 1,234</p>
      }

      const fallback = <p style={{ color: 'gray' }}>⚠️ Widget unavailable</p>

      function App() {
        const [data, setData] = useState({ revenue: 12500 })

        return (
          <>
            <button onClick={() => setData({})}>Break the data</button>
            <button onClick={() => setData({ revenue: 12500 })}>Fix the data</button>
            {/* New key for new data = fresh boundary */}
            <ErrorBoundary key={JSON.stringify(data)} fallback={fallback}>
              <Revenue data={data} />
            </ErrorBoundary>
            <ErrorBoundary fallback={fallback}>
              <Visitors />
            </ErrorBoundary>
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Eine eigene ErrorBoundary-Klasse', en: 'A custom ErrorBoundary class' },
        pruefung: js`
          expect(code).toMatch(/extends (React\.)?Component/)
          expect(code).toMatch(/getDerivedStateFromError/)
        `,
      },
      {
        name: { de: 'Kaputte Daten treffen nur das Umsatz-Widget', en: 'Broken data only affects the revenue widget' },
        pruefung: js`
          await render()
          await click(button('Break the data'))
          expect(text()).toContain('Widget unavailable')
          expect(text()).toContain('Visitors')
        `,
      },
      {
        name: { de: 'Reparierte Daten stellen das Widget wieder her', en: 'Fixed data restores the widget' },
        pruefung: js`
          await render()
          await click(button('Break the data'))
          await click(button('Fix the data'))
          expect(text()).toContain('Revenue')
          expect(text()).not.toContain('Widget unavailable')
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    class ErrorBoundary extends React.Component {
      state = { error: null }

      // Error -> new state -> render the fallback
      static getDerivedStateFromError(error) {
        return { error }
      }

      // A good place for logging (e.g. Sentry)
      componentDidCatch(error, info) {
        console.error(error, info.componentStack)
      }

      render() {
        if (this.state.error) return this.props.fallback
        return this.props.children
      }
    }
  `,
}
