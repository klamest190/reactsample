import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'hooks-nebenlaeufig-einstieg': {
    code: js`
      function SlowPage() {
        const start = performance.now()
        while (performance.now() - start < 500) {} // simulates a slow render
        return <p>📊 Statistics are ready</p>
      }

      function App() {
        const [tab, setTab] = useState('home')
        const [isPending, startTransition] = useTransition()

        function show(next) {
          startTransition(() => setTab(next))
        }

        return (
          <>
            <button onClick={() => show('home')}>Home</button>
            <button onClick={() => show('stats')}>Statistics</button>
            {isPending && <p>⏳ Switching …</p>}
            {tab === 'home' ? <p>🏠 Welcome</p> : <SlowPage />}
          </>
        )
      }
    `,
  },
  'hooks-nebenlaeufig-problem': {
    tipps: {
      de: [
        '`const deferredQuery = useDeferredValue(query)` - das Feld nutzt `query`, die Liste `deferredQuery`.',
        'Ohne `memo` um die Liste bringt es nichts: Sie würde beim dringenden Render trotzdem mitrendern.',
      ],
      en: [
        '`const deferredQuery = useDeferredValue(query)` - the input uses `query`, the list `deferredQuery`.',
        'Without `memo` around the list it doesn’t help: it would still render along with the urgent render.',
      ],
    },
    code: js`
      // Every item is artificially slow (1 ms) - 250 of them = noticeable.
      function SlowItem({ text }) {
        const start = performance.now()
        while (performance.now() - start < 1) {}
        return <li>{text}</li>
      }

      const SlowList = memo(function SlowList({ query }) {
        const items = Array.from({ length: 250 }, (_, i) => \`\${query} - result \${i + 1}\`)
        return <ul style={{ maxHeight: 100, overflow: 'auto' }}>{items.map((item) => <SlowItem key={item} text={item} />)}</ul>
      })

      function App() {
        const [query, setQuery] = useState('')

        return (
          <>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type quickly …" />
            <SlowList query={query} />
          </>
        )
      }
    `,
    loesung: js`
      function SlowItem({ text }) {
        const start = performance.now()
        while (performance.now() - start < 1) {}
        return <li>{text}</li>
      }

      // memo is important: otherwise the list would render along with the urgent render anyway
      const SlowList = memo(function SlowList({ query }) {
        const items = Array.from({ length: 250 }, (_, i) => \`\${query} - result \${i + 1}\`)
        return <ul style={{ maxHeight: 100, overflow: 'auto' }}>{items.map((item) => <SlowItem key={item} text={item} />)}</ul>
      })

      function App() {
        const [query, setQuery] = useState('')
        // Lags behind when needed - the input stays responsive
        const deferredQuery = useDeferredValue(query)
        const isStale = query !== deferredQuery

        return (
          <>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type quickly …" />
            <div style={{ opacity: isStale ? 0.5 : 1 }}>
              <SlowList query={deferredQuery} />
            </div>
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'useDeferredValue wird genutzt', en: 'useDeferredValue is used' },
        pruefung: js`
          expect(code).toMatch(/useDeferredValue\(/)
        `,
      },
      {
        name: { de: 'Die Liste zeigt die Ergebnisse zur Eingabe', en: 'The list shows results for the input' },
        pruefung: js`
          await render()
          await type(field('input'), 'abc')
          await waitFor(() => expect(text()).toContain('abc - result 1'))
        `,
      },
    ],
  },
  'hooks-nebenlaeufig-transition': {
    code: js`
      function SlowTab({ name }) {
        const items = Array.from({ length: 300 }, (_, i) => i)
        return (
          <ul style={{ maxHeight: 100, overflow: 'auto' }}>
            {items.map((i) => {
              const t = performance.now()
              while (performance.now() - t < 1) {}
              return <li key={i}>{name} #{i}</li>
            })}
          </ul>
        )
      }

      function App() {
        const [tab, setTab] = useState('home')
        const [isPending, startTransition] = useTransition()

        function selectTab(nextTab) {
          // Without startTransition the page freezes when clicking "Slow".
          // Try both: setTab(nextTab) vs. startTransition(() => setTab(nextTab))
          startTransition(() => {
            setTab(nextTab)
          })
        }

        return (
          <>
            <button onClick={() => selectTab('home')}>Home</button>
            <button onClick={() => selectTab('slow')}>Slow 🐢</button>
            <button onClick={() => selectTab('contact')}>Contact</button>
            {isPending && <span> ⏳ loading …</span>}

            <div style={{ opacity: isPending ? 0.6 : 1 }}>
              {tab === 'home' && <p>Welcome! Click "Slow" and right after that "Contact".</p>}
              {tab === 'slow' && <SlowTab name="Post" />}
              {tab === 'contact' && <p>📧 hello@example.com</p>}
            </div>
          </>
        )
      }
    `,
  },
  'hooks-nebenlaeufig-uebung': {
    tipps: {
      de: [
        'Der Regler bleibt beim echten `hue`, die teuren Kacheln bekommen `useDeferredValue(hue)`.',
        '`Tiles` muss mit `memo` umhüllt sein.',
        'Veraltete Anzeige kennzeichnen: `opacity: hue !== deferredHue ? 0.5 : 1`.',
      ],
      en: [
        'The slider keeps the real `hue`, the expensive tiles get `useDeferredValue(hue)`.',
        '`Tiles` has to be wrapped in `memo`.',
        'Mark the stale display: `opacity: hue !== deferredHue ? 0.5 : 1`.',
      ],
    },
    code: js`
      function Tiles({ hue }) {
        const tiles = []
        for (let i = 0; i < 2000; i++) {
          const t = performance.now()
          while (performance.now() - t < 0.05) {}
          tiles.push(
            <span key={i} style={{ display: 'inline-block', width: 8, height: 8, background: \`hsl(\${(hue + i / 20) % 360} 70% 55%)\` }} />
          )
        }
        return <div style={{ lineHeight: 0 }}>{tiles}</div>
      }

      function App() {
        const [hue, setHue] = useState(200)

        return (
          <>
            <input type="range" min="0" max="360" value={hue} onChange={(e) => setHue(Number(e.target.value))} />
            <span> {hue}°</span>
            <Tiles hue={hue} />
          </>
        )
      }
    `,
    loesung: js`
      const Tiles = memo(function Tiles({ hue }) {
        const tiles = []
        for (let i = 0; i < 2000; i++) {
          const t = performance.now()
          while (performance.now() - t < 0.05) {}
          tiles.push(
            <span key={i} style={{ display: 'inline-block', width: 8, height: 8, background: \`hsl(\${(hue + i / 20) % 360} 70% 55%)\` }} />
          )
        }
        return <div style={{ lineHeight: 0 }}>{tiles}</div>
      })

      function App() {
        const [hue, setHue] = useState(200)
        const deferredHue = useDeferredValue(hue)

        return (
          <>
            <input type="range" min="0" max="360" value={hue} onChange={(e) => setHue(Number(e.target.value))} />
            <span> {hue}°</span>
            <div style={{ opacity: hue !== deferredHue ? 0.5 : 1 }}>
              <Tiles hue={deferredHue} />
            </div>
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Der Regler aktualisiert die Gradzahl', en: 'The slider updates the degree display' },
        pruefung: js`
          await render()
          await type(field('range'), 90)
          expect(text()).toContain('90°')
        `,
      },
      {
        name: { de: 'useDeferredValue und memo werden genutzt', en: 'useDeferredValue and memo are used' },
        pruefung: js`
          expect(code).toMatch(/useDeferredValue\(/)
          expect(code).toMatch(/memo\(/)
        `,
      },
    ],
  },
  'hooks-nebenlaeufig-lazy': {
    code: js`
      // In a project: const Chart = lazy(() => import('./Chart'))
      // The editor has no files, so the network is simulated with a 1.5 s delay.
      const Chart = lazy(
        () =>
          new Promise((resolve) => {
            console.log('Loading the chart code …')
            setTimeout(() => resolve({ default: ChartComponent }), 1500)
          }),
      )

      function ChartComponent() {
        const values = [3, 7, 4, 9, 6]
        return (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
            {values.map((v, i) => (
              <div key={i} style={{ width: 24, height: v * 10, background: '#6366f1', borderRadius: 3 }} />
            ))}
          </div>
        )
      }

      function App() {
        const [show, setShow] = useState(false)
        return (
          <>
            <button onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'} statistics</button>
            {show && (
              // Suspense shows the fallback until the code has arrived - only the first time
              <Suspense fallback={<p>⏳ Loading chart …</p>}>
                <Chart />
              </Suspense>
            )}
          </>
        )
      }
    `,
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    const [query, setQuery] = useState('')
    const deferredQuery = useDeferredValue(query)

    <input value={query} onChange={…} />        {/* always gets the latest value */}
    <Results query={deferredQuery} />          {/* may lag behind */}
  `,
}
