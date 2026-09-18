import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'hooks-usestate-einstieg': {
    code: js`
      function App() {
        const [isOn, setIsOn] = useState(false)

        return (
          <button onClick={() => setIsOn(!isOn)}>
            Light is {isOn ? 'ON 💡' : 'OFF'}
          </button>
        )
      }
    `,
  },
  'hooks-usestate-regeln': {
    code: js`
      // ---- A mini React in 20 lines ----
      const storage = []   // state of all hooks of the component
      let position = 0     // which hook call is next

      function useState(initialValue) {
        const myPosition = position
        if (storage[myPosition] === undefined) storage[myPosition] = initialValue
        const setValue = (next) => { storage[myPosition] = next }
        position++
        return [storage[myPosition], setValue]
      }

      function render(component, props) {
        position = 0        // start counting from zero on every render
        return component(props)
      }

      // ---- A "component" ----
      function Form({ showAge }) {
        const [name, setName] = useState('Ada')
        if (showAge) {
          const [age, setAge] = useState(36)   // ❌ hook inside if!
        }
        const [city, setCity] = useState('London')
        return \`name=\${name}, city=\${city}\`
      }

      console.log(render(Form, { showAge: true }))
      console.log(render(Form, { showAge: false }))
      // On the second render "city" gets the storage slot of "age"!
    `,
  },
  'hooks-usestate-funktional': {
    code: js`
      function App() {
        const [seconds, setSeconds] = useState(0)
        const [running, setRunning] = useState(false)

        function start() {
          setRunning(true)
          // ❌ The closure only knows seconds = the value at click time.
          //    Change it to: setSeconds((s) => s + 1)
          setInterval(() => setSeconds(seconds + 1), 1000)
        }

        return (
          <>
            <h2>{seconds} s</h2>
            <button onClick={start} disabled={running}>Start</button>
            <p>Stuck at 1? Then you have found the problem.</p>
          </>
        )
      }
    `,
  },
  'hooks-usestate-objekte': {
    code: js`
      function App() {
        const [profile, setProfile] = useState({ name: 'Ada', city: 'London', newsletter: false })
        const [tags, setTags] = useState(['react'])
        const [input, setInput] = useState('')

        function handleChange(e) {
          const { name, value, type, checked } = e.target
          // One handler for all fields: computed key [name]
          setProfile((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        }

        function addTag() {
          if (!input.trim()) return
          setTags((prev) => [...prev, input.trim()])
          setInput('')
        }

        return (
          <>
            <input name="name" value={profile.name} onChange={handleChange} />
            <input name="city" value={profile.city} onChange={handleChange} />
            <label>
              <input type="checkbox" name="newsletter" checked={profile.newsletter} onChange={handleChange} />
              Newsletter
            </label>
            <pre>{JSON.stringify(profile)}</pre>

            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tag" />
            <button onClick={addTag}>+</button>
            <p>
              {tags.map((t) => (
                <button key={t} onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
                  {t} ✕
                </button>
              ))}
            </p>
          </>
        )
      }
    `,
  },
  'hooks-usestate-lazy': {
    code: js`
      function computeExpensively() {
        console.log('🐢 computeExpensively() runs')
        return 42
      }

      function App() {
        // Runs on EVERY render:
        const [a, setA] = useState(computeExpensively())

        // Runs only on the first render (pass the function, don't call it):
        const [b, setB] = useState(() => computeExpensively())

        const [clicks, setClicks] = useState(0)

        return (
          <>
            <p>a = {a}, b = {b}</p>
            <button onClick={() => setClicks(clicks + 1)}>Re-render ({clicks})</button>
            <p>Click and watch the console.</p>
          </>
        )
      }
    `,
  },
  'hooks-usestate-key': {
    code: js`
      function Chat({ contact }) {
        const [message, setMessage] = useState('')
        return (
          <div>
            <p>Chat with <strong>{contact}</strong></p>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message …" />
          </div>
        )
      }

      function App() {
        const [contact, setContact] = useState('Ada')

        return (
          <>
            {['Ada', 'Alan', 'Grace'].map((c) => (
              <button key={c} onClick={() => setContact(c)}>{c}</button>
            ))}
            {/* Type something and switch contacts. The draft stays!
                Add key={contact} so that every contact starts fresh. */}
            <Chat contact={contact} />
          </>
        )
      }
    `,
  },
  'hooks-usestate-uebung': {
    tipps: {
      de: [
        'Neue Einträge mit Updater-Funktion: `setItems((prev) => [...prev, neu])`.',
        'Menge ändern: `map` mit `{ ...item, quantity: item.quantity + delta }`.',
        'Einträge mit Menge 0 danach per `filter` entfernen; die Summe ist ein `reduce`.',
      ],
      en: [
        'Add items with an updater function: `setItems((prev) => [...prev, newItem])`.',
        'Change the quantity: `map` with `{ ...item, quantity: item.quantity + delta }`.',
        'Afterwards remove items with quantity 0 via `filter`; the total is a `reduce`.',
      ],
    },
    code: js`
      function App() {
        const [items, setItems] = useState([
          { id: 1, name: 'Milk', quantity: 2 },
        ])

        return (
          <>
            <ul>
              {items.map((item) => (
                <li key={item.id}>{item.quantity}× {item.name}</li>
              ))}
            </ul>
          </>
        )
      }
    `,
    loesung: js`
      function App() {
        const [items, setItems] = useState([
          { id: 1, name: 'Milk', quantity: 2 },
        ])
        const [name, setName] = useState('')

        function addItem() {
          if (!name.trim()) return
          setItems((prev) => [...prev, { id: Date.now(), name: name.trim(), quantity: 1 }])
          setName('')
        }

        function changeQuantity(id, delta) {
          setItems((prev) =>
            prev
              .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
              .filter((item) => item.quantity > 0)
          )
        }

        const total = items.reduce((sum, item) => sum + item.quantity, 0)

        return (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item" />
            <button onClick={addItem}>Add</button>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <button onClick={() => changeQuantity(item.id, -1)}>−</button>
                  {item.quantity}× {item.name}
                  <button onClick={() => changeQuantity(item.id, 1)}>+</button>
                </li>
              ))}
            </ul>
            <p>Total: {total} items</p>
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Startet mit „2× Milk“', en: 'Starts with “2× Milk”' },
        pruefung: js`
          await render()
          expect(findAll('li')).toHaveLength(1)
          expect(text()).toContain('2× Milk')
        `,
      },
      {
        name: { de: 'Add legt einen Artikel mit Menge 1 an und leert das Feld', en: 'Add creates an item with quantity 1 and clears the input' },
        pruefung: js`
          await render()
          await type(field('input'), 'Bread')
          await click(button('Add'))
          expect(text()).toContain('1× Bread')
          expect(field('input').value).toBe('')
        `,
      },
      {
        name: { de: '+ und − ändern die Menge', en: '+ and − change the quantity' },
        pruefung: js`
          await render()
          await click(within(getByText('Milk').closest('li')).button('+'))
          expect(text()).toContain('3× Milk')
          await click(within(getByText('Milk').closest('li')).button('−'))
          expect(text()).toContain('2× Milk')
        `,
      },
      {
        name: { de: 'Bei Menge 0 verschwindet der Artikel', en: 'At quantity 0 the item disappears' },
        pruefung: js`
          await render()
          await click(within(getByText('Milk').closest('li')).button('−'))
          await click(within(getByText('Milk').closest('li')).button('−'))
          expect(text()).not.toContain('Milk')
        `,
      },
      {
        name: { de: '„Total: n items“ wird berechnet', en: '“Total: n items” is calculated' },
        pruefung: js`
          await render()
          expect(text()).toContain('Total: 2 items')
          await type(field('input'), 'Eggs')
          await click(button('Add'))
          expect(text()).toContain('Total: 3 items')
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>
