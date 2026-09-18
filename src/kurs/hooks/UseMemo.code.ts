import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'hooks-usememo-einstieg': {
    code: js`
      function App() {
        const [n, setN] = useState(10)
        const [other, setOther] = useState(0)

        const sum = useMemo(() => {
          console.log('Calculating the sum …')
          let total = 0
          for (let i = 1; i <= n; i++) total += i
          return total
        }, [n])

        return (
          <>
            <p>1 + 2 + … + {n} = {sum}</p>
            <button onClick={() => setN(n + 1)}>n + 1</button>
            <button onClick={() => setOther(other + 1)}>Other state: {other}</button>
          </>
        )
      }
    `,
  },
  'hooks-usememo-render': {
    code: js`
      function Header() {
        console.log('  Header renders')
        return <h3>My shop</h3>
      }

      function Footer({ year }) {
        console.log('  Footer renders')
        return <small>© {year}</small>
      }

      function App() {
        const [count, setCount] = useState(0)
        console.log('App renders')

        return (
          <>
            <Header />
            <button onClick={() => setCount(count + 1)}>Cart: {count}</button>
            <Footer year={2025} />
          </>
        )
      }
    `,
  },
  'hooks-usememo-memo': {
    tipps: {
      de: [
        '`memo` hilft nur, wenn alle Props gleich bleiben - auch `onDelete`.',
        '`useCallback` liefert dieselbe Funktion, solange sich die Abhängigkeiten nicht ändern.',
        'Mit Updater-Funktion (`setItems((prev) => …)`) braucht der Callback keine Abhängigkeiten.',
      ],
      en: [
        '`memo` only helps if all props stay the same - including `onDelete`.',
        '`useCallback` returns the same function as long as the dependencies don’t change.',
        'With an updater function (`setItems((prev) => …)`) the callback needs no dependencies.',
      ],
    },
    code: js`
      const List = memo(function List({ items, onDelete }) {
        console.log('🐢 List renders')
        return (
          <ul>
            {items.map((item) => (
              <li key={item}>{item} <button onClick={() => onDelete(item)}>✕</button></li>
            ))}
          </ul>
        )
      })

      function App() {
        const [text, setText] = useState('')
        const [items, setItems] = useState(['Apples', 'Bread', 'Cheese'])

        // ❌ A NEW function on every render -> memo is useless
        const deleteItem = (item) => setItems((prev) => prev.filter((x) => x !== item))

        return (
          <>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type here …" />
            <p>The list re-renders while typing despite memo. Why?</p>
            <List items={items} onDelete={deleteItem} />
          </>
        )
      }
    `,
    loesung: js`
      const List = memo(function List({ items, onDelete }) {
        console.log('🐢 List renders')
        return (
          <ul>
            {items.map((item) => (
              <li key={item}>{item} <button onClick={() => onDelete(item)}>✕</button></li>
            ))}
          </ul>
        )
      })

      function App() {
        const [text, setText] = useState('')
        const [items, setItems] = useState(['Apples', 'Bread', 'Cheese'])

        // ✅ useCallback: the same function as long as the dependencies don't change
        const deleteItem = useCallback((item) => setItems((prev) => prev.filter((x) => x !== item)), [])

        return (
          <>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type here …" />
            <p>Now the list no longer re-renders while typing.</p>
            <List items={items} onDelete={deleteItem} />
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Beim Tippen rendert die Liste nicht neu', en: 'The list doesn\'t re-render while typing' },
        pruefung: js`
          await render()
          clearLogs()
          await type(field('input'), 'abc')
          expect(logs().filter((l) => l.includes('List renders'))).toHaveLength(0)
        `,
      },
      {
        name: { de: 'Löschen funktioniert weiterhin', en: 'Deleting still works' },
        pruefung: js`
          await render()
          await click(within(getByText('Bread').closest('li')).button('✕'))
          expect(text()).not.toContain('Bread')
        `,
      },
    ],
  },
  'hooks-usememo-teuer': {
    code: js`
      function isPrime(n) {
        for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
        return n > 1
      }

      function App() {
        const [limit, setLimit] = useState(300000)
        const [dark, setDark] = useState(false)

        // Without useMemo this runs on EVERY render - including theme changes.
        // Wrap it in useMemo(() => …, [limit]) and compare.
        const start = performance.now()
        const count = Array.from({ length: limit }, (_, i) => i).filter(isPrime).length
        console.log('Counted primes in', Math.round(performance.now() - start), 'ms')

        return (
          <div style={{ background: dark ? '#222' : '#fafafa', color: dark ? '#eee' : '#222', padding: 12 }}>
            <button onClick={() => setDark(!dark)}>Toggle theme</button>
            <button onClick={() => setLimit(limit + 100000)}>Limit +100,000</button>
            <p>There are {count} primes below {limit.toLocaleString()}.</p>
          </div>
        )
      }
    `,
  },
  'hooks-usememo-uebung': {
    tipps: {
      de: [
        'Welche Arbeit ist teuer? Das Sortieren von 20.000 Einträgen - also `useMemo` mit `[direction]`.',
        '`Table` ist mit `memo` umhüllt, bekommt aber bei jedem Render ein neues `onSelect`.',
        '`useCallback((id) => setSelected(id), [])` macht `onSelect` stabil.',
      ],
      en: [
        'Which work is expensive? Sorting 20,000 entries - so `useMemo` with `[direction]`.',
        '`Table` is wrapped in `memo`, but receives a new `onSelect` on every render.',
        '`useCallback((id) => setSelected(id), [])` makes `onSelect` stable.',
      ],
    },
    code: js`
      const DATA = Array.from({ length: 20000 }, (_, i) => ({
        id: i,
        value: Math.round(Math.sin(i) * 10000),
      }))

      function Table({ rows, onSelect }) {
        console.log('Table renders')
        return (
          <ul style={{ maxHeight: 120, overflow: 'auto' }}>
            {rows.slice(0, 200).map((row) => (
              <li key={row.id} onClick={() => onSelect(row.id)}>#{row.id}: {row.value}</li>
            ))}
          </ul>
        )
      }

      function App() {
        const [note, setNote] = useState('')
        const [direction, setDirection] = useState(1)
        const [selected, setSelected] = useState(null)

        console.time('sorting')
        const sorted = DATA.toSorted((a, b) => (a.value - b.value) * direction)
        console.timeEnd('sorting')

        const select = (id) => setSelected(id)

        return (
          <>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type a note …" />
            <button onClick={() => setDirection(-direction)}>Reverse sorting</button>
            <p>Selected: {selected ?? '–'}</p>
            <Table rows={sorted} onSelect={select} />
          </>
        )
      }
    `,
    loesung: js`
      const DATA = Array.from({ length: 20000 }, (_, i) => ({
        id: i,
        value: Math.round(Math.sin(i) * 10000),
      }))

      const Table = memo(function Table({ rows, onSelect }) {
        console.log('Table renders')
        return (
          <ul style={{ maxHeight: 120, overflow: 'auto' }}>
            {rows.slice(0, 200).map((row) => (
              <li key={row.id} onClick={() => onSelect(row.id)}>#{row.id}: {row.value}</li>
            ))}
          </ul>
        )
      })

      function App() {
        const [note, setNote] = useState('')
        const [direction, setDirection] = useState(1)
        const [selected, setSelected] = useState(null)

        const sorted = useMemo(() => {
          console.log('sorting …')
          return DATA.toSorted((a, b) => (a.value - b.value) * direction)
        }, [direction])

        // setSelected is stable from React - the function needs no dependencies
        const select = useCallback((id) => setSelected(id), [])

        return (
          <>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type a note …" />
            <button onClick={() => setDirection(-direction)}>Reverse sorting</button>
            <p>Selected: {selected ?? '–'}</p>
            <Table rows={sorted} onSelect={select} />
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Beim Tippen wird nicht neu sortiert', en: 'Typing doesn\'t sort again' },
        pruefung: js`
          await render()
          clearLogs()
          await type(field('Type a note'), 'hello')
          expect(logs().filter((l) => /sort/i.test(l))).toHaveLength(0)
        `,
      },
      {
        name: { de: 'Beim Tippen rendert die Tabelle nicht', en: 'The table doesn\'t render while typing' },
        pruefung: js`
          await render()
          clearLogs()
          await type(field('Type a note'), 'hello')
          expect(logs().filter((l) => l.includes('Table renders'))).toHaveLength(0)
        `,
      },
      {
        name: { de: 'Sortierung umdrehen funktioniert weiterhin', en: 'Reversing the sort still works' },
        pruefung: js`
          await render()
          const vorher = findAll('li')[0].textContent
          await click(button('Reverse sorting'))
          expect(findAll('li')[0].textContent).not.toBe(vorher)
        `,
      },
      {
        name: { de: 'Eine Zeile auswählen funktioniert', en: 'Selecting a row works' },
        pruefung: js`
          await render()
          await click(findAll('li')[0])
          expect(text()).toMatch(/Selected: \d+/)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  compilerVorher: js`
    // What you write - no memo, no useMemo, no useCallback:
    function ProductList({ products, filter }) {
      const visible = products.filter((p) => p.name.includes(filter))
      const handleSelect = (id) => console.log('selected', id)
      return <List items={visible} onSelect={handleSelect} />
    }

    // What the compiler turns it into (simplified): results are cached
    // and only recomputed when products, filter or the handler change.
    function ProductList({ products, filter }) {
      const $ = useMemoCache(4)
      let visible
      if ($[0] !== products || $[1] !== filter) {
        visible = products.filter((p) => p.name.includes(filter))
        $[0] = products; $[1] = filter; $[2] = visible
      } else {
        visible = $[2]
      }
      // … the same for handleSelect and the JSX
    }
  `,
  compilerEinrichten: js`
    npm install -D @rolldown/plugin-babel @babel/core babel-plugin-react-compiler

    // vite.config.ts
    import { defineConfig } from 'vite'
    import react, { reactCompilerPreset } from '@vitejs/plugin-react'
    import babel from '@rolldown/plugin-babel'

    export default defineConfig({
      plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    })
  `,
  beispiel1: js`
    // Remembers a FUNCTION
    const handler = useCallback((x) => { … }, [dependencies])

    // Remembers a RESULT
    const result = useMemo(() => expensiveCalculation(a, b), [a, b])

    // useCallback(fn, deps) is the same as useMemo(() => fn, deps)
  `,
}
