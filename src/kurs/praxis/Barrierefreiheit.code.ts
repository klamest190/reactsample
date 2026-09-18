import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für das Kapitel Barrierefreiheit - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen und Tipps gibt es in beiden Sprachen.
 */

export const beispiele = {
  'praxis-a11y-einstieg': {
    code: js`
      function App() {
        const [count, setCount] = useState(0)
        const fakeButton = { display: 'inline-block', padding: '4px 10px', background: '#e2e8f0', borderRadius: 6, cursor: 'pointer' }

        return (
          <>
            <div onClick={() => setCount(count + 1)} style={fakeButton}>div: +1</div>{' '}
            <button onClick={() => setCount(count + 1)}>button: +1</button>
            <p>Count: {count}</p>
            <p>Click into this preview, then use only the keyboard: Tab to an element, then Enter or Space.</p>
          </>
        )
      }
    `,
  },
  'praxis-a11y-semantik': {
    code: js`
      function ProductCard({ product, onAdd, onFavorite }) {
        return (
          <article style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, maxWidth: 280 }}>
            {/* alt describes what the image shows */}
            <img src={product.image} alt={product.imageText} width="64" height="64" />
            {/* A real heading - screen reader users jump between headings */}
            <h3 style={{ margin: '8px 0' }}>{product.name}</h3>
            <p>
              <span aria-hidden="true">★★★★☆</span>
              {/* Text only for screen readers - "four black stars" helps nobody */}
              <span className="sr-only">Rated 4 out of 5</span>
            </p>
            <button onClick={onAdd}>Add to cart</button>{' '}
            {/* Icon-only button: aria-label gives it a name */}
            <button onClick={onFavorite} aria-label={'Add ' + product.name + ' to favorites'}>
              ♡
            </button>
          </article>
        )
      }

      const CUP = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='20' font-size='20'%3E☕%3C/text%3E%3C/svg%3E"

      function App() {
        const product = { name: 'Espresso cup', image: CUP, imageText: 'White espresso cup with saucer' }
        return (
          <ProductCard
            product={product}
            onAdd={() => console.log('added')}
            onFavorite={() => console.log('favorite')}
          />
        )
      }
    `,
  },
  'praxis-a11y-formular': {
    code: js`
      function App() {
        const [email, setEmail] = useState('')
        const [submitted, setSubmitted] = useState(false)
        const id = useId()
        const error = submitted && !email.includes('@') ? 'Please enter a valid e-mail address.' : ''

        return (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
            }}
          >
            {/* 1. A visible label, linked via htmlFor/id */}
            <label htmlFor={id}>E-mail</label>{' '}
            <input
              id={id}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // 2. Mark the field as invalid and point to the error text
              aria-invalid={Boolean(error)}
              aria-describedby={error ? id + '-error' : undefined}
            />{' '}
            <button>Subscribe</button>
            {/* 3. role="alert" announces the error as soon as it appears */}
            {error && (
              <p id={id + '-error'} role="alert" style={{ color: 'crimson' }}>
                {error}
              </p>
            )}
          </form>
        )
      }
    `,
  },
  'praxis-a11y-fokus': {
    code: js`
      function App() {
        const dialogRef = useRef(null)
        const [answer, setAnswer] = useState('')

        // <dialog> with showModal() brings everything a modal needs:
        // focus moves inside, Tab stays inside, Escape closes it,
        // and afterwards focus returns to the button that opened it.
        return (
          <>
            <button onClick={() => dialogRef.current.showModal()}>Delete account …</button>
            <p>{answer}</p>

            <dialog
              ref={dialogRef}
              aria-labelledby="dialog-title"
              onClose={(e) => setAnswer('Answer: ' + (e.currentTarget.returnValue || 'cancelled'))}
              style={{ borderRadius: 8, padding: 16 }}
            >
              <h2 id="dialog-title" style={{ marginTop: 0 }}>Really delete?</h2>
              <p>This cannot be undone.</p>
              {/* method="dialog": the button closes the dialog and sets returnValue */}
              <form method="dialog">
                <button value="cancelled" autoFocus>Cancel</button>{' '}
                <button value="deleted">Delete</button>
              </form>
            </dialog>
          </>
        )
      }
    `,
  },
  'praxis-a11y-live': {
    code: js`
      const FRUITS = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Mango', 'Melon']

      function App() {
        const [query, setQuery] = useState('')
        const [saved, setSaved] = useState(false)
        const results = FRUITS.filter((f) => f.toLowerCase().includes(query.toLowerCase()))

        return (
          <>
            <label>
              Search fruit <input value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            {/* aria-live="polite": changes are read out as soon as the screen reader is idle */}
            <p aria-live="polite">{results.length} results</p>
            <ul>
              {results.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button onClick={() => setSaved(true)}>Save search</button>
            {/* role="status" is a polite live region, too */}
            <p role="status">{saved ? 'Search saved.' : ''}</p>
          </>
        )
      }
    `,
  },
  'praxis-a11y-pruefen': {
    code: js`
      import { test, expect } from 'vitest'
      import { render, screen } from '@testing-library/react'

      function BadToolbar() {
        return (
          <div>
            <div onClick={() => {}}>Save</div>
            <button>🗑</button>
            <input placeholder="Search" />
          </div>
        )
      }

      function GoodToolbar() {
        return (
          <div>
            <button>Save</button>
            <button aria-label="Delete">🗑</button>
            <label>
              Search <input />
            </label>
          </div>
        )
      }

      // getByRole only finds what the accessibility tree offers - like a screen reader.
      // Swap GoodToolbar for BadToolbar in the tests and see what fails.
      const Toolbar = GoodToolbar

      test('Save is a real button', () => {
        render(<Toolbar />)
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      })

      test('the icon button has a name', () => {
        render(<Toolbar />)
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      })

      test('the search field has a label', () => {
        render(<Toolbar />)
        expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
      })
    `,
  },
  'praxis-a11y-uebung': {
    tipps: {
      de: [
        'Aus `<b>` wird `<h2>`, aus den beiden klickbaren `<div>`/`<span>` echte `<button>`. Der ✕-Knopf braucht `aria-label="Close"`.',
        'Das Bild ist nur Dekoration: `alt=""` sagt dem Screenreader, dass er es überspringen soll.',
        'Für das Feld: `const id = useId()`, dann `<label htmlFor={id}>E-mail</label>` und `<input id={id} … />`.',
        'Die Fehlermeldung bekommt `id={id + \'-error\'}`, das Feld `aria-invalid={Boolean(error)}` und `aria-describedby={id + \'-error\'}`.',
      ],
      en: [
        '`<b>` becomes `<h2>`, the two clickable `<div>`/`<span>` become real `<button>`s. The ✕ button needs `aria-label="Close"`.',
        'The image is decoration only: `alt=""` tells the screen reader to skip it.',
        'For the field: `const id = useId()`, then `<label htmlFor={id}>E-mail</label>` and `<input id={id} … />`.',
        'The error message gets `id={id + \'-error\'}`, the field gets `aria-invalid={Boolean(error)}` and `aria-describedby={id + \'-error\'}`.',
      ],
    },
    code: js`
      const ENVELOPE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='20' font-size='20'%3E✉️%3C/text%3E%3C/svg%3E"

      function App() {
        const [email, setEmail] = useState('')
        const [error, setError] = useState('')
        const [done, setDone] = useState(false)
        const [open, setOpen] = useState(true)

        function subscribe() {
          if (!email.includes('@')) return setError('Please enter a valid e-mail address.')
          setError('')
          setDone(true)
        }

        if (!open) return <p>Closed.</p>

        return (
          <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <b style={{ fontSize: 18 }}>Newsletter</b>
              <span onClick={() => setOpen(false)} style={{ cursor: 'pointer' }}>✕</span>
            </div>
            <img src={ENVELOPE} width="40" height="40" />
            {done ? (
              <p>Thanks for subscribing!</p>
            ) : (
              <div>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />{' '}
                <div
                  onClick={subscribe}
                  style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '2px 10px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Subscribe
                </div>
                <p style={{ color: 'crimson' }}>{error}</p>
              </div>
            )}
          </div>
        )
      }
    `,
    loesung: js`
      const ENVELOPE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='20' font-size='20'%3E✉️%3C/text%3E%3C/svg%3E"

      function App() {
        const [email, setEmail] = useState('')
        const [error, setError] = useState('')
        const [done, setDone] = useState(false)
        const [open, setOpen] = useState(true)
        const id = useId()

        function subscribe(e) {
          e.preventDefault()
          if (!email.includes('@')) return setError('Please enter a valid e-mail address.')
          setError('')
          setDone(true)
        }

        if (!open) return <p>Closed.</p>

        return (
          <section style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>Newsletter</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <img src={ENVELOPE} width="40" height="40" alt="" />
            {done ? (
              <p role="status">Thanks for subscribing!</p>
            ) : (
              <form onSubmit={subscribe} noValidate>
                <label htmlFor={id}>E-mail</label>{' '}
                <input
                  id={id}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? id + '-error' : undefined}
                />{' '}
                <button>Subscribe</button>
                {error && (
                  <p id={id + '-error'} role="alert" style={{ color: 'crimson' }}>
                    {error}
                  </p>
                )}
              </form>
            )}
          </section>
        )
      }
    `,
    tests: [
      {
        name: { de: '„Newsletter“ ist eine Überschrift', en: '“Newsletter” is a heading' },
        pruefung: js`
          await render()
          const heading = findAll('h1, h2, h3, h4').find((h) => h.textContent.includes('Newsletter'))
          expect(Boolean(heading)).toBe(true)
        `,
      },
      {
        name: { de: 'Schließen ist ein <button> mit Namen „Close“', en: 'Close is a <button> named “Close”' },
        pruefung: js`
          await render()
          await click(button('Close'))
          expect(text()).toContain('Closed.')
        `,
      },
      {
        name: { de: 'Das Bild hat ein alt-Attribut', en: 'The image has an alt attribute' },
        pruefung: js`
          await render()
          expect(find('img').hasAttribute('alt')).toBe(true)
        `,
      },
      {
        name: { de: 'Das E-Mail-Feld hat ein echtes Label', en: 'The e-mail field has a real label' },
        pruefung: js`
          await render()
          const input = find('input')
          const labels = [...(input.labels ?? [])].map((l) => l.textContent)
          expect(labels.some((l) => l.includes('E-mail'))).toBe(true)
        `,
      },
      {
        name: { de: '„Subscribe“ ist ein <button>', en: '“Subscribe” is a <button>' },
        pruefung: js`
          await render()
          expect(button('Subscribe').tagName).toBe('BUTTON')
        `,
      },
      {
        name: { de: 'Der Fehler ist mit dem Feld verknüpft', en: 'The error is linked to the field' },
        pruefung: js`
          await render()
          await type(find('input'), 'nope')
          await click(button('Subscribe'))
          const input = find('input')
          expect(input.getAttribute('aria-invalid')).toBe('true')
          const ids = (input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)
          const text = ids.map((i) => document.getElementById(i)?.textContent ?? '').join(' ')
          expect(text).toContain('valid e-mail')
        `,
      },
      {
        name: { de: 'Mit gültiger Adresse kommt der Dank', en: 'A valid address shows the thank-you' },
        pruefung: js`
          await render()
          await type(find('input'), 'ada@example.com')
          await click(button('Subscribe'))
          expect(text()).toContain('Thanks for subscribing!')
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>
