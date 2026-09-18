import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für das TypeScript-Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen und Tipps gibt es in beiden Sprachen.
 * Alle Beispiele laufen mit <TryIt typen>, also mit echter Typprüfung.
 */

export const beispiele = {
  'praxis-typescript-einstieg': {
    code: js`
      type GreetingProps = {
        name: string
        count: number
      }

      function Greeting({ name, count }: GreetingProps) {
        return <p>Hello {name}, you have {count} new messages.</p>
      }

      function App() {
        // Try it: change count={3} to count="3" - the type check complains right away.
        return <Greeting name="Ada" count={3} />
      }
    `,
  },
  'praxis-typescript-grundlagen': {
    code: js`
      // Annotation: name: Type
      const title: string = 'Learn TypeScript'
      // Inference: TypeScript sees the value - no annotation needed
      let attempts = 0
      attempts = attempts + 1
      const tags: string[] = ['react', 'types']

      // An object type. "?" makes a field optional.
      type Todo = {
        id: number
        text: string
        done: boolean
        dueDate?: string
      }

      // A union of literal types: only these three strings are allowed
      type Filter = 'all' | 'open' | 'done'

      // Parameters always need types, the return type is optional
      function countTodos(todos: Todo[], filter: Filter): number {
        if (filter === 'all') return todos.length
        return todos.filter((t) => (filter === 'done' ? t.done : !t.done)).length
      }

      const todos: Todo[] = [
        { id: 1, text: 'Read the chapter', done: true },
        { id: 2, text: 'Do the exercise', done: false, dueDate: '2026-10-01' },
      ]

      console.log('open:', countTodos(todos, 'open'), '| tags:', tags.join(', '))
      // Remove the // in the next line and watch the type check:
      // console.log(countTodos(todos, 'finished'))

      function App() {
        return (
          <p>
            {title}: {countTodos(todos, 'done')} of {todos.length} done
          </p>
        )
      }
    `,
  },
  'praxis-typescript-props': {
    code: js`
      import type { ComponentProps, ReactNode } from 'react'

      type CardProps = {
        title: string
        variant?: 'info' | 'warning' // optional - the default is set below
        children: ReactNode // anything React can render
      }

      function Card({ title, variant = 'info', children }: CardProps) {
        const color = variant === 'warning' ? '#b45309' : '#0369a1'
        return (
          <section style={{ border: '2px solid ' + color, borderRadius: 8, padding: 8, marginBottom: 8 }}>
            <strong style={{ color }}>{title}</strong>
            <div>{children}</div>
          </section>
        )
      }

      // All props of a normal <button> - plus our own "loading"
      type ButtonProps = ComponentProps<'button'> & { loading?: boolean }

      function Button({ loading = false, children, ...rest }: ButtonProps) {
        return (
          <button {...rest} disabled={loading || rest.disabled}>
            {loading ? 'Saving …' : children}
          </button>
        )
      }

      function App() {
        return (
          <>
            <Card title="Note">Every usage of a component is checked.</Card>
            <Card title="Careful" variant="warning">
              <Button type="submit" onClick={() => console.log('clicked')}>
                Save
              </Button>{' '}
              <Button loading>Save</Button>
            </Card>
            {/* Try it: variant="danger", a missing title or <Button typ="submit"> */}
          </>
        )
      }
    `,
  },
  'praxis-typescript-state': {
    code: js`
      import type { ChangeEvent, SubmitEvent } from 'react'

      type User = { name: string; email: string }

      function App() {
        // Inferred from the start value: string
        const [draft, setDraft] = useState('')
        // Starts as null - so the type has to be spelled out
        const [user, setUser] = useState<User | null>(null)
        // DOM refs: the element type, start value null
        const inputRef = useRef<HTMLInputElement>(null)

        function handleChange(e: ChangeEvent<HTMLInputElement>) {
          setDraft(e.target.value)
        }

        function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
          e.preventDefault()
          setUser({ name: draft, email: draft.toLowerCase() + '@example.com' })
          setDraft('')
          inputRef.current?.focus() // ?. because current can be null
        }

        return (
          <form onSubmit={handleSubmit}>
            <input ref={inputRef} value={draft} onChange={handleChange} placeholder="Name" />
            <button>Log in</button>
            {/* Narrowing: inside the ternary TypeScript knows that user is not null */}
            {user ? <p>Welcome, {user.name} ({user.email})</p> : <p>Not logged in.</p>}
            {/* Try it: <p>{user.name}</p> without the check */}
          </form>
        )
      }
    `,
  },
  'praxis-typescript-reducer': {
    code: js`
      type Todo = { id: number; text: string; done: boolean }

      // Every action has a "type" - and exactly the fields it needs
      type Action =
        | { type: 'added'; text: string }
        | { type: 'toggled'; id: number }
        | { type: 'cleared' }

      function todosReducer(todos: Todo[], action: Action): Todo[] {
        switch (action.type) {
          case 'added':
            // TypeScript knows: in this case, action has "text"
            return [...todos, { id: Date.now(), text: action.text, done: false }]
          case 'toggled':
            return todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
          case 'cleared':
            return todos.filter((t) => !t.done)
          default: {
            // Forgot a case? Then action is not "never" here -> type error
            const missing: never = action
            return missing
          }
        }
      }

      function App() {
        const [todos, dispatch] = useReducer(todosReducer, [])
        const [text, setText] = useState('')

        return (
          <div>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="New todo" />
            <button
              onClick={() => {
                dispatch({ type: 'added', text })
                setText('')
              }}
            >
              Add
            </button>{' '}
            <button onClick={() => dispatch({ type: 'cleared' })}>Clear done</button>
            <ul>
              {todos.map((t) => (
                <li
                  key={t.id}
                  onClick={() => dispatch({ type: 'toggled', id: t.id })}
                  style={{ cursor: 'pointer', textDecoration: t.done ? 'line-through' : 'none' }}
                >
                  {t.text}
                </li>
              ))}
            </ul>
          </div>
        )
      }
    `,
  },
  'praxis-typescript-context': {
    code: js`
      import type { ReactNode } from 'react'

      type Theme = 'light' | 'dark'
      type ThemeContextValue = { theme: Theme; toggle: () => void }

      // null as the start value: outside a provider there is no sensible value
      const ThemeContext = createContext<ThemeContextValue | null>(null)

      function useTheme() {
        const value = useContext(ThemeContext)
        // After this check the return type is ThemeContextValue - without null
        if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
        return value
      }

      function ThemeProvider({ children }: { children: ReactNode }) {
        const [theme, setTheme] = useState<Theme>('light')
        const value = useMemo(
          () => ({ theme, toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')) }),
          [theme],
        )
        return <ThemeContext value={value}>{children}</ThemeContext>
      }

      function Toolbar() {
        const { theme, toggle } = useTheme() // no "?." and no null check needed
        return (
          <div style={{ padding: 8, background: theme === 'dark' ? '#1e293b' : '#e2e8f0', color: theme === 'dark' ? 'white' : 'black' }}>
            Theme: {theme} <button onClick={toggle}>Toggle</button>
          </div>
        )
      }

      function App() {
        return (
          <ThemeProvider>
            <Toolbar />
          </ThemeProvider>
        )
      }
    `,
  },
  'praxis-typescript-generisch': {
    code: js`
      import type { ReactNode } from 'react'

      // T is a placeholder for "the type of the items" - chosen at every usage
      type ListProps<T> = {
        items: T[]
        getKey: (item: T) => string | number
        renderItem: (item: T) => ReactNode
      }

      function List<T>({ items, getKey, renderItem }: ListProps<T>) {
        if (items.length === 0) return <p>Nothing here.</p>
        return (
          <ul>
            {items.map((item) => (
              <li key={getKey(item)}>{renderItem(item)}</li>
            ))}
          </ul>
        )
      }

      type Product = { sku: string; name: string; price: number }

      const products: Product[] = [
        { sku: 'A-1', name: 'Keyboard', price: 49 },
        { sku: 'B-2', name: 'Mouse', price: 19.5 },
      ]
      const users = [
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Linus' },
      ]

      function App() {
        return (
          <>
            {/* Here T = Product: p has sku, name and price */}
            <List items={products} getKey={(p) => p.sku} renderItem={(p) => <>{p.name} - {p.price.toFixed(2)} €</>} />
            {/* Here T = { id: number; name: string } */}
            <List items={users} getKey={(u) => u.id} renderItem={(u) => <strong>{u.name}</strong>} />
            {/* Try it: renderItem={(p) => p.title} in the first list */}
          </>
        )
      }
    `,
  },
  'praxis-typescript-typen': {
    code: js`
      type Customer = { id: number; name: string; email: string; vip: boolean }

      // Derive new types instead of writing them again:
      type CustomerDraft = Omit<Customer, 'id'> // the form before saving
      type CustomerChanges = Partial<CustomerDraft> // every field optional
      type CustomerPreview = Pick<Customer, 'id' | 'name'> // only these fields
      const labels: Record<keyof Customer, string> = { id: 'No.', name: 'Name', email: 'E-mail', vip: 'VIP' }

      function update(customer: Customer, changes: CustomerChanges): Customer {
        return { ...customer, ...changes }
      }

      const draft: CustomerDraft = { name: 'Ada', email: 'ada@example.com', vip: false }
      const ada: Customer = { id: 1, ...draft }
      const preview: CustomerPreview = { id: ada.id, name: ada.name }
      console.log(update(ada, { vip: true }), preview)

      // Data from outside (JSON, fetch) is "unknown" - it has to be checked first
      function isCustomer(value: unknown): value is Customer {
        return (
          typeof value === 'object' && value !== null &&
          'id' in value && typeof value.id === 'number' &&
          'name' in value && typeof value.name === 'string' &&
          'email' in value && typeof value.email === 'string' &&
          'vip' in value && typeof value.vip === 'boolean'
        )
      }

      const fromServer: unknown = JSON.parse('{"id": 2, "name": "Linus", "email": "linus@example.com", "vip": true}')
      // console.log(fromServer.name) // error: fromServer is of type unknown

      function App() {
        if (!isCustomer(fromServer)) return <p>Invalid data</p>
        // From here on, fromServer is a Customer
        return (
          <dl>
            {(Object.keys(labels) as (keyof Customer)[]).map((key) => (
              <div key={key}>
                <dt style={{ fontWeight: 600 }}>{labels[key]}</dt>
                <dd>{String(fromServer[key])}</dd>
              </div>
            ))}
          </dl>
        )
      }
    `,
  },
  'praxis-typescript-uebung': {
    tipps: {
      de: [
        'Beginne mit den Daten: `type Product = { id: number; name: string; price: number }` und `type CartItem = { product: Product; quantity: number }`.',
        '`useState([])` kennt den Typ der Einträge nicht (er wird `never[]`). Schreibe `useState<CartItem[]>([])`.',
        'Für `CartLine` brauchst du einen Props-Typ: `item` ist ein `CartItem`, `onRemove` eine Funktion `(id: number) => void`.',
      ],
      en: [
        'Start with the data: `type Product = { id: number; name: string; price: number }` and `type CartItem = { product: Product; quantity: number }`.',
        '`useState([])` does not know the type of the entries (it becomes `never[]`). Write `useState<CartItem[]>([])`.',
        '`CartLine` needs a props type: `item` is a `CartItem`, `onRemove` is a function `(id: number) => void`.',
      ],
    },
    code: js`
      // The cart works - but the type check reports errors everywhere.
      // Add types until it is green (see the task above).

      const PRODUCTS = [
        { id: 1, name: 'Coffee', price: 4.5 },
        { id: 2, name: 'Tea', price: 3 },
        { id: 3, name: 'Cake', price: 5.25 },
      ]

      function formatPrice(value) {
        return value.toFixed(2) + ' €'
      }

      function CartLine({ item, onRemove }) {
        return (
          <li>
            {item.quantity} × {item.product.name} = {formatPrice(item.quantity * item.product.price)}{' '}
            <button onClick={() => onRemove(item.product.id)}>Remove</button>
          </li>
        )
      }

      function App() {
        const [items, setItems] = useState([])

        function add(product) {
          setItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id)
            if (existing) return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + 1 } : i))
            return [...prev, { product, quantity: 1 }]
          })
        }

        function remove(id) {
          setItems((prev) => prev.filter((i) => i.product.id !== id))
        }

        const total = items.reduce((sum, i) => sum + i.quantity * i.product.price, 0)

        return (
          <div>
            {PRODUCTS.map((p) => (
              <button key={p.id} onClick={() => add(p)}>
                + {p.name}
              </button>
            ))}
            <ul>
              {items.map((item) => (
                <CartLine key={item.product.id} item={item} onRemove={remove} />
              ))}
            </ul>
            <p>Total: {formatPrice(total)}</p>
          </div>
        )
      }
    `,
    loesung: js`
      type Product = { id: number; name: string; price: number }
      type CartItem = { product: Product; quantity: number }

      const PRODUCTS: Product[] = [
        { id: 1, name: 'Coffee', price: 4.5 },
        { id: 2, name: 'Tea', price: 3 },
        { id: 3, name: 'Cake', price: 5.25 },
      ]

      function formatPrice(value: number) {
        return value.toFixed(2) + ' €'
      }

      type CartLineProps = {
        item: CartItem
        onRemove: (id: number) => void
      }

      function CartLine({ item, onRemove }: CartLineProps) {
        return (
          <li>
            {item.quantity} × {item.product.name} = {formatPrice(item.quantity * item.product.price)}{' '}
            <button onClick={() => onRemove(item.product.id)}>Remove</button>
          </li>
        )
      }

      function App() {
        const [items, setItems] = useState<CartItem[]>([])

        function add(product: Product) {
          setItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id)
            if (existing) return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + 1 } : i))
            return [...prev, { product, quantity: 1 }]
          })
        }

        function remove(id: number) {
          setItems((prev) => prev.filter((i) => i.product.id !== id))
        }

        const total = items.reduce((sum, i) => sum + i.quantity * i.product.price, 0)

        return (
          <div>
            {PRODUCTS.map((p) => (
              <button key={p.id} onClick={() => add(p)}>
                + {p.name}
              </button>
            ))}
            <ul>
              {items.map((item) => (
                <CartLine key={item.product.id} item={item} onRemove={remove} />
              ))}
            </ul>
            <p>Total: {formatPrice(total)}</p>
          </div>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Der Warenkorb zählt Mengen und Summe', en: 'The cart counts quantities and the total' },
        pruefung: js`
          await render()
          await click(button('+ Coffee'))
          await click(button('+ Coffee'))
          await click(button('+ Tea'))
          expect(text()).toContain('2 × Coffee')
          expect(text()).toContain('Total: 12.00 €')
        `,
      },
      {
        name: { de: 'Entfernen funktioniert weiterhin', en: 'Removing still works' },
        pruefung: js`
          await render()
          await click(button('+ Cake'))
          await click(button('Remove'))
          expect(text()).not.toContain('× Cake')
          expect(text()).toContain('Total: 0.00 €')
        `,
      },
      {
        name: { de: 'Es gibt die Typen Product und CartItem', en: 'There are types Product and CartItem' },
        pruefung: js`
          expect(code).toMatch(/(type|interface)\s+Product\b/)
          expect(code).toMatch(/(type|interface)\s+CartItem\b/)
        `,
      },
      {
        name: { de: 'Der State hat einen Typ: useState<…>', en: 'The state has a type: useState<…>' },
        pruefung: js`
          expect(code).toMatch(/useState<[^>]+>\(\s*\[\s*\]\s*\)/)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  anlegen: js`
    npm create vite@latest my-app -- --template react-ts
    cd my-app
    npm install
    npm run dev
  `,
  tsconfig: js`
    {
      "compilerOptions": {
        "strict": true,             // the important one: null checks, no implicit any
        "jsx": "react-jsx",
        "target": "ES2023",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "noEmit": true,             // Vite compiles - tsc only checks
        "noUnusedLocals": true,
        "noUnusedParameters": true
      },
      "include": ["src"]
    }
  `,
  pruefen: js`
    # Vite only strips the types. The actual check:
    npx tsc -b          # check the whole project once
    npm run build       # "tsc -b && vite build" - the build fails on type errors
  `,
}
