import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'praxis-komposition-einstieg': {
    code: js`
      function Card({ children }) {
        return <div style={{ border: '1px solid gray', borderRadius: 8, padding: 12 }}>{children}</div>
      }

      function App() {
        return (
          <Card>
            <h3>Any title</h3>
            <p>Any content - Card doesn’t care what is inside.</p>
          </Card>
        )
      }
    `,
  },
  'praxis-komposition-slots': {
    code: js`
      // The card knows nothing about its content - it only provides the frame.
      function Card({ image, title, actions, children }) {
        return (
          <article style={{ border: '1px solid #ccc', borderRadius: 12, overflow: 'hidden', width: 240, display: 'inline-block', margin: 6, verticalAlign: 'top' }}>
            {image && <div style={{ fontSize: 48, textAlign: 'center', background: '#f1f5f9' }}>{image}</div>}
            <div style={{ padding: 12 }}>
              <h3 style={{ margin: 0 }}>{title}</h3>
              {children}
            </div>
            {actions && <footer style={{ padding: 8, borderTop: '1px solid #eee' }}>{actions}</footer>}
          </article>
        )
      }

      function App() {
        const [saved, setSaved] = useState(false)

        return (
          <>
            <Card
              image="🥐"
              title="Croissant"
              actions={<button onClick={() => setSaved(!saved)}>{saved ? '★ saved' : '☆ save'}</button>}
            >
              <p>Buttery, crispy, €2.20</p>
            </Card>

            <Card title="Newsletter">
              <p>Completely different content, same card:</p>
              <input placeholder="Email" />
            </Card>
          </>
        )
      }
    `,
  },
  'praxis-komposition-children-perf': {
    code: js`
      function Expensive() {
        console.log('🐢 Expensive renders')
        return <p>I am expensive.</p>
      }

      function Collapsible({ children }) {
        const [open, setOpen] = useState(true)
        return (
          <div>
            <button onClick={() => setOpen(!open)}>{open ? 'Collapse' : 'Expand'}</button>
            <span style={{ marginLeft: 8 }}>Clicks only change Collapsible's state</span>
            <div style={{ display: open ? 'block' : 'none' }}>{children}</div>
          </div>
        )
      }

      function App() {
        // <Expensive /> is created here - Collapsible only passes it on.
        return (
          <Collapsible>
            <Expensive />
          </Collapsible>
        )
      }
    `,
  },
  'praxis-komposition-portal': {
    code: js`
      function Toast({ text, onClose }) {
        useEffect(() => {
          const id = setTimeout(onClose, 2500)
          return () => clearTimeout(id)
        }, [onClose])

        return createPortal(
          <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#0f172a', color: 'white', padding: '10px 16px', borderRadius: 10, zIndex: 100 }}>
            {text}
          </div>,
          document.body
        )
      }

      function App() {
        const [toast, setToast] = useState(null)
        const close = useCallback(() => setToast(null), [])

        return (
          <div style={{ overflow: 'hidden', height: 60, border: '2px dashed #999', padding: 8 }}>
            I have overflow: hidden …
            <button onClick={() => setToast('Saved ✓')}>Show toast</button>
            {toast && <Toast text={toast} onClose={close} />}
          </div>
        )
      }
    `,
  },
  'praxis-komposition-uebung': {
    tipps: {
      de: [
        '`Tabs` bekommt ein Array `tabs` mit `{ title, content }` und hält den aktiven Index selbst.',
        'Der Inhalt ist JSX - rendere einfach `tabs[active].content`.',
        'Der optionale Slot `extra` erscheint nur, wenn er übergeben wurde: `{extra && …}`.',
      ],
      en: [
        '`Tabs` receives an array `tabs` of `{ title, content }` and holds the active index itself.',
        'The content is JSX - simply render `tabs[active].content`.',
        'The optional `extra` slot only appears when passed: `{extra && …}`.',
      ],
    },
    code: js`
      function Tabs({ tabs, extra }) {
        return <div>…</div>
      }

      function App() {
        return (
          <>
            <p>Put two Tabs instances here</p>
          </>
        )
      }
    `,
    loesung: js`
      function Tabs({ tabs, extra }) {
        const [active, setActive] = useState(0)

        return (
          <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {tabs.map((tab, i) => (
                <button key={tab.title} onClick={() => setActive(i)} style={{ fontWeight: i === active ? 700 : 400 }}>
                  {tab.title}
                </button>
              ))}
              {extra && <div style={{ marginLeft: 'auto' }}>{extra}</div>}
            </div>
            <div style={{ paddingTop: 8 }}>{tabs[active].content}</div>
          </div>
        )
      }

      function App() {
        const [read, setRead] = useState(false)

        return (
          <>
            <Tabs
              tabs={[
                { title: 'Description', content: <p>A great product.</p> },
                { title: 'Reviews', content: <p>★★★★☆ (42)</p> },
              ]}
              extra={<small>Item 123</small>}
            />
            <Tabs
              tabs={[
                { title: 'Rules', content: <label><input type="checkbox" checked={read} onChange={() => setRead(!read)} /> read</label> },
                { title: 'Status', content: <p>{read ? '✅ Rules read' : '❌ not read yet'}</p> },
              ]}
            />
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Tabs ist eine Komponente und wird zweimal benutzt', en: 'Tabs is a component and used twice' },
        pruefung: js`
          expect(code).toMatch(/function Tabs\s*\(/)
          expect((code.match(/<Tabs[\s>]/g) ?? []).length).toBeGreaterThan(1)
          expect(code).toMatch(/extra=\{/)
        `,
      },
      {
        name: { de: 'Ein Klick auf einen Tab wechselt den Inhalt', en: 'Clicking a tab switches the content' },
        pruefung: js`
          await render()
          const [erster, zweiter] = findAll('button')
          const vorher = text()
          await click(zweiter)
          expect(text()).not.toBe(vorher)
          await click(erster)
          expect(text()).toBe(vorher)
        `,
      },
      {
        name: { de: 'Der aktive Tab ist fett', en: 'The active tab is bold' },
        pruefung: js`
          await render()
          const knopf = findAll('button')[1]
          await click(knopf)
          expect(Number(getComputedStyle(knopf).fontWeight)).toBeGreaterThan(600)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>
