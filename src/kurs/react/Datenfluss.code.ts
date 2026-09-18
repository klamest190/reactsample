import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'react-datenfluss-einstieg': {
    code: js`
      function Display({ count }) {
        return <p>Count: {count}</p>
      }

      function PlusButton({ onPlus }) {
        return <button onClick={onPlus}>+1</button>
      }

      function App() {
        const [count, setCount] = useState(0)

        return (
          <>
            <Display count={count} />
            <PlusButton onPlus={() => setCount(count + 1)} />
          </>
        )
      }
    `,
  },
  'react-datenfluss-1': {
    code: js`
      // The child has no state - it only displays and reports clicks.
      function Rating({ stars, onSelect }) {
        return (
          <div>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => onSelect(n)}>
                {n <= stars ? '★' : '☆'}
              </button>
            ))}
          </div>
        )
      }

      function App() {
        const [stars, setStars] = useState(3)

        return (
          <>
            {/* value down, callback down - the call comes back up */}
            <Rating stars={stars} onSelect={setStars} />
            <p>You gave {stars} out of 5 stars.</p>
          </>
        )
      }
    `,
  },
  'react-datenfluss-2': {
    tipps: {
      de: [
        'Der State `openIndex` wandert von `Section` nach `App`.',
        '`Section` bekommt `isOpen` und `onToggle` als Props und hat keinen eigenen State mehr.',
        'Erneutes Klicken schließt: `setOpenIndex(openIndex === index ? null : index)`.',
      ],
      en: [
        'The `openIndex` state moves from `Section` to `App`.',
        '`Section` receives `isOpen` and `onToggle` as props and has no state of its own anymore.',
        'Clicking again closes: `setOpenIndex(openIndex === index ? null : index)`.',
      ],
    },
    code: js`
      // BEFORE: every section has its own state -> several open at once
      function Section({ title, children }) {
        const [isOpen, setIsOpen] = useState(false)
        return (
          <div style={{ borderBottom: '1px solid #ccc', padding: 4 }}>
            <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? '▼' : '▶'} {title}</button>
            {isOpen && <p>{children}</p>}
          </div>
        )
      }

      function App() {
        return (
          <>
            <Section title="What is React?">A library for user interfaces.</Section>
            <Section title="What is state?">Data that can change.</Section>
            <Section title="What are props?">Parameters for components.</Section>
          </>
        )
      }

      // Task: change the code so that only ONE section is open at a time.
      // Tip: "isOpen" becomes a prop, the state (which index is open) moves to App.
    `,
    loesung: js`
      // AFTER: the state lives in the parent, the sections are "controlled"
      function Section({ title, isOpen, onToggle, children }) {
        return (
          <div style={{ borderBottom: '1px solid #ccc', padding: 4 }}>
            <button onClick={onToggle}>{isOpen ? '▼' : '▶'} {title}</button>
            {isOpen && <p>{children}</p>}
          </div>
        )
      }

      function App() {
        const [openIndex, setOpenIndex] = useState(0)

        // Clicking again closes the section
        const toggle = (index) => setOpenIndex(openIndex === index ? null : index)

        return (
          <>
            <Section title="What is React?" isOpen={openIndex === 0} onToggle={() => toggle(0)}>
              A library for user interfaces.
            </Section>
            <Section title="What is state?" isOpen={openIndex === 1} onToggle={() => toggle(1)}>
              Data that can change.
            </Section>
            <Section title="What are props?" isOpen={openIndex === 2} onToggle={() => toggle(2)}>
              Parameters for components.
            </Section>
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Ein Klick öffnet einen Abschnitt', en: 'A click opens a section' },
        pruefung: js`
          await render()
          await click(button(/What is state\?/))
          expect(text()).toContain('Data that can change.')
        `,
      },
      {
        name: { de: 'Es ist immer nur ein Abschnitt offen', en: 'Only one section is open at a time' },
        pruefung: js`
          await render()
          await click(button(/What is state\?/))
          await click(button(/What are props\?/))
          expect(text()).toContain('Parameters for components.')
          expect(text()).not.toContain('Data that can change.')
          expect(text()).not.toContain('A library for user interfaces.')
        `,
      },
    ],
  },
  'react-datenfluss-uebung': {
    tipps: {
      de: [
        'Suchtext und Checkbox gehören als State in `App` - beide Eingaben beeinflussen dieselbe Liste.',
        'Die Eingabe-Komponenten bekommen `value`/`checked` und `onChange` als Props.',
        'Die gefilterte Liste ist abgeleitet: `PRODUCTS.filter(…)` direkt in `App`.',
      ],
      en: [
        'The search text and the checkbox belong in `App` as state - both inputs affect the same list.',
        'The input components receive `value`/`checked` and `onChange` as props.',
        'The filtered list is derived: `PRODUCTS.filter(…)` right in `App`.',
      ],
    },
    code: js`
      const PRODUCTS = [
        { id: 1, name: 'Apple', available: true },
        { id: 2, name: 'Apricot', available: false },
        { id: 3, name: 'Banana', available: true },
        { id: 4, name: 'Blueberry', available: false },
        { id: 5, name: 'Kiwi', available: true },
      ]

      function SearchField() {
        return <input placeholder="Search …" />
      }

      function OnlyAvailable() {
        return (
          <label>
            <input type="checkbox" /> only available
          </label>
        )
      }

      function ProductList({ products }) {
        return (
          <ul>
            {products.map((p) => (
              <li key={p.id} style={{ color: p.available ? undefined : 'gray' }}>{p.name}</li>
            ))}
          </ul>
        )
      }

      function App() {
        return (
          <>
            <SearchField />
            <OnlyAvailable />
            <ProductList products={PRODUCTS} />
          </>
        )
      }
    `,
    loesung: js`
      const PRODUCTS = [
        { id: 1, name: 'Apple', available: true },
        { id: 2, name: 'Apricot', available: false },
        { id: 3, name: 'Banana', available: true },
        { id: 4, name: 'Blueberry', available: false },
        { id: 5, name: 'Kiwi', available: true },
      ]

      function SearchField({ value, onChange }) {
        return <input placeholder="Search …" value={value} onChange={(e) => onChange(e.target.value)} />
      }

      function OnlyAvailable({ checked, onChange }) {
        return (
          <label>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> only available
          </label>
        )
      }

      function ProductList({ products }) {
        if (products.length === 0) return <p>No matches.</p>
        return (
          <ul>
            {products.map((p) => (
              <li key={p.id} style={{ color: p.available ? undefined : 'gray' }}>{p.name}</li>
            ))}
          </ul>
        )
      }

      function App() {
        const [search, setSearch] = useState('')
        const [onlyAvailable, setOnlyAvailable] = useState(false)

        // Derived, not state
        const filtered = PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) &&
            (!onlyAvailable || p.available)
        )

        return (
          <>
            <SearchField value={search} onChange={setSearch} />
            <OnlyAvailable checked={onlyAvailable} onChange={setOnlyAvailable} />
            <ProductList products={filtered} />
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Ohne Filter sind alle 5 Produkte sichtbar', en: 'Without a filter all 5 products are visible' },
        pruefung: js`
          await render()
          expect(findAll('li')).toHaveLength(5)
        `,
      },
      {
        name: { de: 'Die Suche filtert ohne Groß-/Kleinschreibung', en: 'The search filters case-insensitively' },
        pruefung: js`
          await render()
          await type(field('Search'), 'AP')
          expect(findAll('li').map((li) => li.textContent)).toEqual(['Apple', 'Apricot'])
        `,
      },
      {
        name: { de: 'Die Checkbox blendet nicht verfügbare aus', en: 'The checkbox hides unavailable products' },
        pruefung: js`
          await render()
          await check(field('checkbox'))
          expect(findAll('li').map((li) => li.textContent)).toEqual(['Apple', 'Banana', 'Kiwi'])
        `,
      },
      {
        name: { de: 'Suche und Checkbox wirken zusammen', en: 'Search and checkbox work together' },
        pruefung: js`
          await render()
          await type(field('Search'), 'a')
          await check(field('checkbox'))
          expect(findAll('li').map((li) => li.textContent)).toEqual(['Apple', 'Banana'])
        `,
      },
      {
        name: { de: 'Der State lebt in App, nicht in den Kindern', en: 'The state lives in App, not in the children' },
        pruefung: js`
          const body = (name) => (code.match(new RegExp('function ' + name + '\\b[\\s\\S]*?\\n}')) ?? [''])[0]
          expect(body('SearchField')).not.toMatch(/useState/)
          expect(body('OnlyAvailable')).not.toMatch(/useState/)
          expect(body('App')).toMatch(/useState/)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    // ❌ Redundant state - has to be kept in sync on every change
    const [todos, setTodos] = useState([])
    const [openCount, setOpenCount] = useState(0)

    // ✅ Derived - can never get out of date
    const [todos, setTodos] = useState([])
    const openCount = todos.filter((t) => !t.done).length
  `,
}
