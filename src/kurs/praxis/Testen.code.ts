import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'
import type { ProjektDatei } from '../../lernen/reactKompilieren'
import type { Zweisprachig } from '../../i18n/SpracheContext'

/**
 * Codebeispiele für das Testen-Kapitel - für die deutsche UND die englische Fassung.
 * Alle laufen mit <TryIt modus="test">: echtes React Testing Library + user-event,
 * dazu ein Nachbau von Vitest (siehe src/lernen/testLauf.ts).
 */

export const beispiele = {
  'praxis-testen-einstieg': {
    code: js`
      import { test, expect } from 'vitest'
      import { render, screen } from '@testing-library/react'
      import userEvent from '@testing-library/user-event'

      function Counter() {
        const [count, setCount] = useState(0)
        return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
      }

      test('counts clicks', async () => {
        const user = userEvent.setup()
        render(<Counter />)
        await user.click(screen.getByRole('button'))
        expect(screen.getByRole('button')).toHaveTextContent('Clicked 1 times')
      })
    `,
  },
  'praxis-testen-vitest': {
    code: js`
      import { describe, test, expect } from 'vitest'

      // The code under test - in a project it lives in its own file (price.js)
      function totalPrice(items, discountPercent = 0) {
        if (discountPercent < 0 || discountPercent > 100) throw new Error('Invalid discount')
        const sum = items.reduce((s, item) => s + item.price * item.quantity, 0)
        return Math.round(sum * (100 - discountPercent)) / 100
      }

      describe('totalPrice', () => {
        const cart = [
          { price: 10, quantity: 2 },
          { price: 5, quantity: 1 },
        ]

        test('adds up price × quantity', () => {
          expect(totalPrice(cart)).toBe(25)
        })

        test('applies a discount', () => {
          expect(totalPrice(cart, 10)).toBe(22.5)
        })

        test('an empty cart costs nothing', () => {
          expect(totalPrice([])).toBe(0)
        })

        test('rejects invalid discounts', () => {
          expect(() => totalPrice(cart, 120)).toThrow('Invalid discount')
        })

        test('objects: toEqual compares the contents', () => {
          expect({ total: 25 }).toEqual({ total: 25 })
          expect({ total: 25 }).not.toBe({ total: 25 }) // two different objects
        })

        // Try it: change the 25 in the first test to 26 and look at the output
      })
    `,
  },
  'praxis-testen-rtl': {
    code: js`
      import { describe, test, expect } from 'vitest'
      import { render, screen } from '@testing-library/react'
      import userEvent from '@testing-library/user-event'

      function LoginForm() {
        const [email, setEmail] = useState('')
        const [error, setError] = useState('')

        function handleSubmit(e) {
          e.preventDefault()
          setError(email.includes('@') ? '' : 'Please enter a valid e-mail.')
        }

        return (
          <form onSubmit={handleSubmit}>
            <h2>Log in</h2>
            <label>
              E-mail <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button type="submit">Log in</button>
            {error && <p role="alert">{error}</p>}
          </form>
        )
      }

      describe('LoginForm', () => {
        test('shows heading, field and button', () => {
          render(<LoginForm />)
          expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument()
          expect(screen.getByLabelText('E-mail')).toHaveValue('')
          expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled()
        })

        test('shows no error at the start', () => {
          render(<LoginForm />)
          // queryBy… returns null instead of throwing - for "is NOT there"
          expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        })

        test('complains about an invalid e-mail', async () => {
          const user = userEvent.setup()
          render(<LoginForm />)
          await user.type(screen.getByLabelText('E-mail'), 'ada.example.com')
          await user.click(screen.getByRole('button', { name: 'Log in' }))
          expect(screen.getByRole('alert')).toHaveTextContent('valid e-mail')
        })
      })
    `,
  },
  'praxis-testen-mocks': {
    code: js`
      import { describe, test, expect, vi } from 'vitest'
      import { render, screen } from '@testing-library/react'
      import userEvent from '@testing-library/user-event'

      function NewsletterForm({ onSubscribe }) {
        const [email, setEmail] = useState('')
        const [status, setStatus] = useState('idle')

        async function handleSubmit(e) {
          e.preventDefault()
          setStatus('saving')
          try {
            await onSubscribe(email)
            setStatus('done')
          } catch {
            setStatus('error')
          }
        }

        if (status === 'done') return <p>Thanks! Check your inbox.</p>
        return (
          <form onSubmit={handleSubmit}>
            <label>
              E-mail <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button disabled={status === 'saving'}>{status === 'saving' ? 'Saving …' : 'Subscribe'}</button>
            {status === 'error' && <p role="alert">Something went wrong.</p>}
          </form>
        )
      }

      describe('NewsletterForm', () => {
        test('passes the e-mail to onSubscribe', async () => {
          const user = userEvent.setup()
          // A mock function: records every call and returns what we tell it to
          const onSubscribe = vi.fn().mockResolvedValue(undefined)
          render(<NewsletterForm onSubscribe={onSubscribe} />)

          await user.type(screen.getByLabelText('E-mail'), 'ada@example.com')
          await user.click(screen.getByRole('button', { name: 'Subscribe' }))

          expect(onSubscribe).toHaveBeenCalledWith('ada@example.com')
          // findBy… waits until the element appears
          expect(await screen.findByText('Thanks! Check your inbox.')).toBeInTheDocument()
        })

        test('shows an error when saving fails', async () => {
          const user = userEvent.setup()
          const onSubscribe = vi.fn().mockRejectedValue(new Error('Server down'))
          render(<NewsletterForm onSubscribe={onSubscribe} />)

          await user.type(screen.getByLabelText('E-mail'), 'ada@example.com')
          await user.click(screen.getByRole('button', { name: 'Subscribe' }))

          expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong')
          expect(screen.getByRole('button', { name: 'Subscribe' })).toBeEnabled()
        })
      })
    `,
  },
  'praxis-testen-fetch': {
    code: js`
      import { test, expect, vi } from 'vitest'
      import { render, screen } from '@testing-library/react'

      function UserCard({ id }) {
        const [user, setUser] = useState(null)
        const [error, setError] = useState(null)

        useEffect(() => {
          fetch('/api/users/' + id)
            .then((res) => {
              if (!res.ok) throw new Error('HTTP ' + res.status)
              return res.json()
            })
            .then(setUser)
            .catch((e) => setError(e.message))
        }, [id])

        if (error) return <p role="alert">Error: {error}</p>
        if (!user) return <p>Loading …</p>
        return <h3>{user.name}</h3>
      }

      test('shows the user after loading', async () => {
        // Replace fetch for this test - no real server needed
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ name: 'Ada Lovelace' }))
        render(<UserCard id={1} />)

        expect(screen.getByText('Loading …')).toBeInTheDocument()
        expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
        expect(fetch).toHaveBeenCalledWith('/api/users/1')
      })

      test('shows an error for a 404', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 404 }))
        render(<UserCard id={99} />)
        expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 404')
      })
    `,
  },
  'praxis-testen-uebung': {
    tipps: {
      de: [
        'Am Anfang darf man nicht unter 1: Prüfe `screen.getByRole(\'button\', { name: \'Decrease\' })` mit `toBeDisabled()`.',
        'Für das Maximum: `render(<QuantityPicker max={3} />)`, zweimal auf „Increase“ klicken, dann Anzeige und Knopf prüfen.',
        'Für `onChange` brauchst du eine Attrappe: `const onChange = vi.fn()` - und danach `toHaveBeenCalledWith(2)`.',
      ],
      en: [
        'At the start you cannot go below 1: check `screen.getByRole(\'button\', { name: \'Decrease\' })` with `toBeDisabled()`.',
        'For the maximum: `render(<QuantityPicker max={3} />)`, click “Increase” twice, then check the display and the button.',
        'For `onChange` you need a mock: `const onChange = vi.fn()` - and then `toHaveBeenCalledWith(2)`.',
      ],
    },
    code: js`
      import { describe, test, expect, vi } from 'vitest'
      import { render, screen } from '@testing-library/react'
      import userEvent from '@testing-library/user-event'
      import { QuantityPicker } from './QuantityPicker'

      describe('QuantityPicker', () => {
        test('starts at 1', () => {
          render(<QuantityPicker />)
          expect(screen.getByLabelText('Quantity')).toHaveTextContent('1')
        })

        // TODO: more tests - see the task above
      })
    `,
    loesung: js`
      import { describe, test, expect, vi } from 'vitest'
      import { render, screen } from '@testing-library/react'
      import userEvent from '@testing-library/user-event'
      import { QuantityPicker } from './QuantityPicker'

      describe('QuantityPicker', () => {
        test('starts at 1', () => {
          render(<QuantityPicker />)
          expect(screen.getByLabelText('Quantity')).toHaveTextContent('1')
        })

        test('cannot go below 1', () => {
          render(<QuantityPicker />)
          expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled()
        })

        test('stops at max', async () => {
          const user = userEvent.setup()
          render(<QuantityPicker max={3} />)
          const increase = screen.getByRole('button', { name: 'Increase' })
          await user.click(increase)
          await user.click(increase)
          expect(screen.getByLabelText('Quantity')).toHaveTextContent('3')
          expect(increase).toBeDisabled()
        })

        test('reports the new value', async () => {
          const user = userEvent.setup()
          const onChange = vi.fn()
          render(<QuantityPicker onChange={onChange} />)
          await user.click(screen.getByRole('button', { name: 'Increase' }))
          expect(onChange).toHaveBeenCalledWith(2)
        })
      })
    `,
  },
} satisfies Record<string, CodeBeispiel>

// --- Die Komponente der Übung und ihre kaputten Varianten (Mutationstest) ---

const PICKER = js`
  import { useState } from 'react'

  export function QuantityPicker({ max = 5, onChange }) {
    const [quantity, setQuantity] = useState(1)

    function change(next) {
      setQuantity(next)
      onChange?.(next)
    }

    return (
      <div>
        <button onClick={() => change(quantity - 1)} disabled={quantity <= 1} aria-label="Decrease">
          −
        </button>
        <output aria-label="Quantity" style={{ margin: '0 12px' }}>
          {quantity}
        </output>
        <button onClick={() => change(quantity + 1)} disabled={quantity >= max} aria-label="Increase">
          +
        </button>
      </div>
    )
  }
`

/** Baut eine Variante mit genau einem Fehler - und schlägt laut fehl, falls die Stelle nicht mehr existiert. */
function mutante(suchen: string, ersetzen: string): ProjektDatei[] {
  if (!PICKER.includes(suchen)) throw new Error(`Mutante passt nicht mehr: ${suchen}`)
  return [{ pfad: 'QuantityPicker.jsx', code: PICKER.replace(suchen, ersetzen) }]
}

export const uebungDateien: ProjektDatei[] = [{ pfad: 'QuantityPicker.jsx', code: PICKER }]

export const uebungVarianten: { name: Zweisprachig; dateien: ProjektDatei[] }[] = [
  { name: { de: 'startet bei 0', en: 'starts at 0' }, dateien: mutante('useState(1)', 'useState(0)') },
  {
    name: { de: '„−“ geht unter 1', en: '“−” goes below 1' },
    dateien: mutante('disabled={quantity <= 1}', 'disabled={quantity < 1}'),
  },
  {
    name: { de: 'das Maximum wird überschritten', en: 'the maximum is exceeded' },
    dateien: mutante('disabled={quantity >= max}', 'disabled={quantity > max}'),
  },
  {
    name: { de: 'onChange bekommt den alten Wert', en: 'onChange receives the old value' },
    dateien: mutante('onChange?.(next)', 'onChange?.(quantity)'),
  },
]

export const codeBloecke = {
  installieren: js`
    npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom
  `,
  konfiguration: js`
    // vite.config.ts
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    export default defineConfig({
      plugins: [react()],
      test: {
        environment: 'jsdom',            // a simulated browser in Node
        setupFiles: ['./src/setupTests.ts'],
      },
    })
  `,
  setup: js`
    // src/setupTests.ts - matchers like toBeInTheDocument()
    import '@testing-library/jest-dom/vitest'
    import { cleanup } from '@testing-library/react'
    import { afterEach } from 'vitest'

    afterEach(() => cleanup())
  `,
  ausfuehren: js`
    # package.json: "test": "vitest"
    npm test            # watch mode: re-runs the affected tests on every save
    npx vitest run      # run once, e.g. in CI
  `,
}
