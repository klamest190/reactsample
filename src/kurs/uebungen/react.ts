import { js } from '../../lernen/quelltext'
import type { UebungsSammlung } from './typen'

/** Zusätzliche Übungen für Teil 2 (React-Grundlagen) - gestuft wie in js.ts. */

const t = (de: string, en: string) => ({ de, en })

export const uebungen: UebungsSammlung = {
  'react-komponenten': [
    {
      id: 'react-komponenten-ausdruecke',
      stufe: 'vorhersage',
      titel: t('Was rendert JSX?', 'What does JSX render?'),
      frage: t('Welcher Text steht im Absatz?', 'Which text is in the paragraph?'),
      code: js`
        function App() {
          return (
            <p>
              {['a', 'b'].join(', ')}
              {true}
              {null}
              {5 > 3 ? ' yes' : ' no'}
            </p>
          )
        }
      `,
      antworten: ['a, b true null yes', 'a, b yes', 'a,b yes', 'ab yes'],
      richtig: 1,
      erklaerung: t(
        '`true`, `false`, `null` und `undefined` rendern **nichts**. Deshalb funktionieren Bedingungen wie `{isOpen && <Menu />}`.',
        '`true`, `false`, `null` and `undefined` render **nothing**. That is why conditions like `{isOpen && <Menu />}` work.',
      ),
    },
    {
      id: 'react-komponenten-jsx-regeln',
      stufe: 'fehler',
      titel: t('Drei JSX-Fehler', 'Three JSX mistakes'),
      aufgabe: t(
        'Dieser Code lässt sich nicht einmal übersetzen. Finde die drei Verstöße gegen die JSX-Regeln, bis „Profile“ in einer Karte erscheint.',
        'This code does not even compile. Find the three violations of the JSX rules until “Profile” appears in a card.',
      ),
      modus: 'react',
      code: js`
        function card() {
          return (
            <div class="card">
              <h2>Profile</h2>
              <hr>
              <p>Hello!</p>
            </div>
          )
        }

        function App() {
          return <card />
        }
      `,
      loesung: js`
        function Card() {
          return (
            <div className="card">
              <h2>Profile</h2>
              <hr />
              <p>Hello!</p>
            </div>
          )
        }

        function App() {
          return <Card />
        }
      `,
      tipps: {
        de: [
          'Die Fehlermeldung nennt eine Zeile: Jedes Tag muss geschlossen werden, auch `<hr />`.',
          'Kleingeschriebene Tags wie `<card />` hält React für HTML-Elemente. Komponenten beginnen mit einem Großbuchstaben.',
          'In JSX heißt das Attribut `className`.',
        ],
        en: [
          'The error message names a line: every tag must be closed, including `<hr />`.',
          'React treats lowercase tags like `<card />` as HTML elements. Components start with a capital letter.',
          'In JSX the attribute is called `className`.',
        ],
      },
      tests: [
        {
          name: t('Karte mit Überschrift wird angezeigt', 'Card with heading is shown'),
          pruefung: js`
            await render()
            expect(find('.card h2').textContent).toBe('Profile')
          `,
        },
        {
          name: t('Komponente heißt Card, className statt class', 'Component is called Card, className instead of class'),
          pruefung: js`
            expect(code).toMatch(/function Card/)
            expect(code).not.toMatch(/\sclass=/)
          `,
        },
      ],
    },
    {
      id: 'react-komponenten-ausdruck',
      stufe: 'ergaenzen',
      titel: t('JavaScript in JSX', 'JavaScript in JSX'),
      aufgabe: t(
        'Ergänze `Header` und `App`: `Header` zeigt `<h1>Ada Lovelace</h1>` aus dem Objekt `user`. `App` rendert `Header` und darunter „Born 1815, n years ago“ - n aus dem aktuellen Jahr berechnet.',
        'Complete `Header` and `App`: `Header` shows `<h1>Ada Lovelace</h1>` from the `user` object. `App` renders `Header` and below it “Born 1815, n years ago” - with n computed from the current year.',
      ),
      modus: 'react',
      code: js`
        const user = { firstName: 'Ada', lastName: 'Lovelace', born: 1815 }

        function Header() {
          // TODO: <h1> with first and last name
        }

        function App() {
          return (
            <main>
              {/* TODO: Header and the "Born …" paragraph */}
            </main>
          )
        }
      `,
      loesung: js`
        const user = { firstName: 'Ada', lastName: 'Lovelace', born: 1815 }

        function Header() {
          return (
            <h1>
              {user.firstName} {user.lastName}
            </h1>
          )
        }

        function App() {
          const yearsAgo = new Date().getFullYear() - user.born
          return (
            <main>
              <Header />
              <p>
                Born {user.born}, {yearsAgo} years ago
              </p>
            </main>
          )
        }
      `,
      tipps: {
        de: ['`{user.firstName} {user.lastName}` - das Leerzeichen zwischen den Klammern bleibt erhalten.', '`new Date().getFullYear()` liefert das aktuelle Jahr.'],
        en: ['`{user.firstName} {user.lastName}` - the space between the braces is kept.', '`new Date().getFullYear()` returns the current year.'],
      },
      tests: [
        {
          name: t('Überschrift „Ada Lovelace“', 'Heading “Ada Lovelace”'),
          pruefung: js`
            await render()
            expect(find('h1').textContent).toBe('Ada Lovelace')
          `,
        },
        {
          name: t('Jahre werden berechnet', 'Years are computed'),
          pruefung: js`
            await render()
            expect(text()).toContain('Born 1815, ' + (new Date().getFullYear() - 1815) + ' years ago')
          `,
        },
        {
          name: t('Header ist eine eigene Komponente', 'Header is its own component'),
          pruefung: js`
            expect(code).toMatch(/<Header\s*\/>/)
          `,
        },
      ],
    },
  ],

  'react-props': [
    {
      id: 'react-props-null',
      stufe: 'vorhersage',
      titel: t('Die verirrte 0', 'The stray 0'),
      frage: t('`count` ist 0. Was wird angezeigt?', '`count` is 0. What is displayed?'),
      code: js`
        function Inbox({ count }) {
          return <div>{count && <p>You have new messages</p>}</div>
        }
      `,
      antworten: {
        de: ['Nichts', 'Eine 0', 'You have new messages', 'false'],
        en: ['Nothing', 'A 0', 'You have new messages', 'false'],
      },
      richtig: 1,
      erklaerung: t(
        '`0 && …` ergibt `0` - und Zahlen rendert React. Sicher ist `{count > 0 && …}` oder ein Ternär.',
        '`0 && …` evaluates to `0` - and React renders numbers. Safe options: `{count > 0 && …}` or a ternary.',
      ),
    },
    {
      id: 'react-props-liste',
      stufe: 'fehler',
      titel: t('Die Liste bleibt leer', 'The list stays empty'),
      aufgabe: t(
        'Es sollen drei Begrüßungen erscheinen - „Hello Ada!“, „Hello Grace!“, „Hello Linus!“. Finde die zwei Fehler.',
        'Three greetings should appear - “Hello Ada!”, “Hello Grace!”, “Hello Linus!”. Find the two bugs.',
      ),
      modus: 'react',
      code: js`
        const users = ['Ada', 'Grace', 'Linus']

        function Greeting(name) {
          return <li>Hello {name}!</li>
        }

        function App() {
          return (
            <ul>
              {users.map((user) => {
                <Greeting key={user} name={user} />
              })}
            </ul>
          )
        }
      `,
      loesung: js`
        const users = ['Ada', 'Grace', 'Linus']

        function Greeting({ name }) {
          return <li>Hello {name}!</li>
        }

        function App() {
          return (
            <ul>
              {users.map((user) => (
                <Greeting key={user} name={user} />
              ))}
            </ul>
          )
        }
      `,
      tipps: {
        de: ['Eine Arrow Function mit `{ }` braucht ein `return` - oder runde Klammern statt geschweifter.', 'Eine Komponente bekommt **ein** Props-Objekt. Destrukturiere es: `function Greeting({ name })`.'],
        en: ['An arrow function with `{ }` needs a `return` - or parentheses instead of braces.', 'A component receives **one** props object. Destructure it: `function Greeting({ name })`.'],
      },
      tests: [
        {
          name: t('Drei Einträge', 'Three items'),
          pruefung: js`
            await render()
            expect(findAll('li')).toHaveLength(3)
          `,
        },
        {
          name: t('Namen werden angezeigt', 'Names are shown'),
          pruefung: js`
            await render()
            expect(text()).toContain('Hello Grace!')
          `,
        },
      ],
    },
    {
      id: 'react-props-produkte',
      stufe: 'ergaenzen',
      titel: t('Produktliste mit Bedingungen', 'Product list with conditions'),
      aufgabe: t(
        'Ergänze `ProductList({ products })`: Ist die Liste leer, steht dort „No products“. Sonst ein `<li>` pro Produkt mit Name und Preis (`4.50 €`), bei `stock === 0` zusätzlich „Sold out“.',
        'Complete `ProductList({ products })`: if the list is empty, it shows “No products”. Otherwise one `<li>` per product with name and price (`4.50 €`), plus “Sold out” when `stock === 0`.',
      ),
      modus: 'react',
      code: js`
        const PRODUCTS = [
          { id: 1, name: 'Coffee', price: 4.5, stock: 12 },
          { id: 2, name: 'Tea', price: 3, stock: 0 },
        ]

        function ProductList({ products }) {
          // TODO
        }

        function App() {
          return (
            <>
              <ProductList products={PRODUCTS} />
              <ProductList products={[]} />
            </>
          )
        }
      `,
      loesung: js`
        const PRODUCTS = [
          { id: 1, name: 'Coffee', price: 4.5, stock: 12 },
          { id: 2, name: 'Tea', price: 3, stock: 0 },
        ]

        function ProductList({ products }) {
          if (products.length === 0) return <p>No products</p>

          return (
            <ul>
              {products.map((product) => (
                <li key={product.id}>
                  {product.name} - {product.price.toFixed(2)} €{product.stock === 0 && <strong> Sold out</strong>}
                </li>
              ))}
            </ul>
          )
        }

        function App() {
          return (
            <>
              <ProductList products={PRODUCTS} />
              <ProductList products={[]} />
            </>
          )
        }
      `,
      tipps: {
        de: ['Frühes `return` für die leere Liste.', '`price.toFixed(2)` formatiert mit zwei Nachkommastellen.', '`{product.stock === 0 && <strong> Sold out</strong>}`'],
        en: ['An early `return` for the empty list.', '`price.toFixed(2)` formats with two decimal places.', '`{product.stock === 0 && <strong> Sold out</strong>}`'],
      },
      tests: [
        {
          name: t('Zwei Produkte mit Preisen', 'Two products with prices'),
          pruefung: js`
            await render()
            expect(findAll('li')).toHaveLength(2)
            expect(text()).toContain('4.50 €')
            expect(text()).toContain('3.00 €')
          `,
        },
        {
          name: t('„Sold out“ nur bei Tee', '“Sold out” only for tea'),
          pruefung: js`
            await render()
            expect(findAll('li')[1].textContent).toContain('Sold out')
            expect(findAll('li')[0].textContent).not.toContain('Sold out')
          `,
        },
        {
          name: t('Leere Liste zeigt „No products“', 'Empty list shows “No products”'),
          pruefung: js`
            await render()
            expect(text()).toContain('No products')
          `,
        },
      ],
    },
  ],

  'react-state': [
    {
      id: 'react-state-snapshot',
      stufe: 'vorhersage',
      titel: t('Zweimal setzen', 'Setting it twice'),
      frage: t('`count` ist 0. Nach einem Klick: Was wird angezeigt, was geloggt?', '`count` is 0. After one click: what is displayed, what is logged?'),
      code: js`
        function handleClick() {
          setCount(count + 1)
          setCount(count + 1)
          console.log(count)
        }
      `,
      antworten: {
        de: ['Anzeige 2, Log 2', 'Anzeige 1, Log 0', 'Anzeige 2, Log 0', 'Anzeige 1, Log 1'],
        en: ['Shows 2, logs 2', 'Shows 1, logs 0', 'Shows 2, logs 0', 'Shows 1, logs 1'],
      },
      richtig: 1,
      erklaerung: t(
        'State ist ein **Schnappschuss** pro Render: `count` bleibt in diesem Handler 0, also wird zweimal `0 + 1` gesetzt. Mit `setCount((c) => c + 1)` wären es 2.',
        'State is a **snapshot** per render: `count` stays 0 in this handler, so `0 + 1` is set twice. With `setCount((c) => c + 1)` it would be 2.',
      ),
    },
    {
      id: 'react-state-variable',
      stufe: 'fehler',
      titel: t('Der Like-Knopf zählt nicht', 'The like button does not count'),
      aufgabe: t('Ein Klick auf den Knopf soll die Zahl erhöhen. Warum passiert nichts?', 'Clicking the button should increase the number. Why does nothing happen?'),
      modus: 'react',
      code: js`
        function App() {
          let likes = 0

          return <button onClick={() => (likes = likes + 1)}>♥ {likes}</button>
        }
      `,
      loesung: js`
        function App() {
          const [likes, setLikes] = useState(0)

          return <button onClick={() => setLikes(likes + 1)}>♥ {likes}</button>
        }
      `,
      tipps: {
        de: ['Eine normale Variable wird bei jedem Render neu mit 0 angelegt - und ihre Änderung löst keinen Render aus.', '`const [likes, setLikes] = useState(0)`'],
        en: ['A normal variable is created with 0 again on every render - and changing it does not trigger a render.', '`const [likes, setLikes] = useState(0)`'],
      },
      tests: [
        {
          name: t('Zwei Klicks ergeben ♥ 2', 'Two clicks give ♥ 2'),
          pruefung: js`
            await render()
            await click(find('button'))
            await click(find('button'))
            expect(find('button').textContent).toBe('♥ 2')
          `,
        },
      ],
    },
    {
      id: 'react-state-details',
      stufe: 'frei',
      titel: t('Details ein- und ausblenden', 'Show and hide details'),
      aufgabe: t(
        'Baue `App` mit einem Knopf „Show details“. Nach dem Klick erscheint der Absatz „The secret is 42.“ und der Knopf heißt „Hide details“. Darunter steht, wie oft die Details schon geöffnet wurden: „Opened 1×“.',
        'Build `App` with a “Show details” button. After a click, the paragraph “The secret is 42.” appears and the button reads “Hide details”. Below, show how often the details have been opened: “Opened 1×”.',
      ),
      modus: 'react',
      code: js`
        function App() {
          return <button>Show details</button>
        }
      `,
      loesung: js`
        function App() {
          const [isOpen, setIsOpen] = useState(false)
          const [openCount, setOpenCount] = useState(0)

          function handleClick() {
            if (!isOpen) setOpenCount(openCount + 1)
            setIsOpen(!isOpen)
          }

          return (
            <div>
              <button onClick={handleClick}>{isOpen ? 'Hide details' : 'Show details'}</button>
              {isOpen && <p>The secret is 42.</p>}
              <p>Opened {openCount}×</p>
            </div>
          )
        }
      `,
      tipps: {
        de: ['Zwei State-Werte: ob offen, und wie oft geöffnet.', 'Beim Öffnen (nicht beim Schließen) den Zähler erhöhen.'],
        en: ['Two state values: whether it is open, and how often it was opened.', 'Increase the counter when opening (not when closing).'],
      },
      tests: [
        {
          name: t('Anfangs verborgen', 'Hidden at first'),
          pruefung: js`
            await render()
            expect(text()).not.toContain('The secret is 42.')
            expect(text()).toContain('Opened 0×')
          `,
        },
        {
          name: t('Öffnen und schließen', 'Open and close'),
          pruefung: js`
            await render()
            await click(button('Show details'))
            expect(text()).toContain('The secret is 42.')
            await click(button('Hide details'))
            expect(text()).not.toContain('The secret is 42.')
          `,
        },
        {
          name: t('Zählt nur das Öffnen', 'Only counts opening'),
          pruefung: js`
            await render()
            await click(button('Show details'))
            await click(button('Hide details'))
            await click(button('Show details'))
            expect(text()).toContain('Opened 2×')
          `,
        },
      ],
    },
  ],

  'react-datenfluss': [
    {
      id: 'react-datenfluss-redundant',
      stufe: 'vorhersage',
      titel: t('Überflüssiger State', 'Redundant state'),
      frage: t('Welcher State ist überflüssig?', 'Which state is redundant?'),
      code: js`
        const [todos, setTodos] = useState([])
        const [filter, setFilter] = useState('all')
        const [openCount, setOpenCount] = useState(0)
        const [draft, setDraft] = useState('')
      `,
      antworten: ['todos', 'filter', 'openCount', 'draft'],
      richtig: 2,
      erklaerung: t(
        '`openCount` lässt sich jederzeit aus `todos` berechnen. Als eigener State muss man ihn bei jeder Änderung mitpflegen - und vergisst es irgendwann.',
        '`openCount` can always be computed from `todos`. As separate state it must be updated with every change - and sooner or later someone forgets.',
      ),
    },
    {
      id: 'react-datenfluss-anheben',
      stufe: 'fehler',
      titel: t('Die Umrechnung reagiert nicht', 'The conversion does not react'),
      aufgabe: t(
        'Nach der Eingabe von 100 °C soll „212 °F“ erscheinen. Beide Komponenten haben aber ihren eigenen State. Hebe den State an.',
        'After entering 100 °C, “212 °F” should appear. But both components have their own state. Lift the state up.',
      ),
      modus: 'react',
      code: js`
        function CelsiusInput() {
          const [celsius, setCelsius] = useState('')
          return <input value={celsius} onChange={(e) => setCelsius(e.target.value)} placeholder="Celsius" />
        }

        function FahrenheitDisplay() {
          const [celsius] = useState('')
          return <p>{celsius === '' ? '–' : Number(celsius) * 1.8 + 32} °F</p>
        }

        function App() {
          return (
            <>
              <CelsiusInput />
              <FahrenheitDisplay />
            </>
          )
        }
      `,
      loesung: js`
        function CelsiusInput({ value, onChange }) {
          return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Celsius" />
        }

        function FahrenheitDisplay({ celsius }) {
          return <p>{celsius === '' ? '–' : Number(celsius) * 1.8 + 32} °F</p>
        }

        function App() {
          const [celsius, setCelsius] = useState('')
          return (
            <>
              <CelsiusInput value={celsius} onChange={setCelsius} />
              <FahrenheitDisplay celsius={celsius} />
            </>
          )
        }
      `,
      tipps: {
        de: ['Der State gehört in den gemeinsamen Elternteil `App`.', 'Nach unten: `celsius` als Prop. Nach oben: `onChange` als Callback.'],
        en: ['The state belongs in the common parent `App`.', 'Downward: `celsius` as a prop. Upward: `onChange` as a callback.'],
      },
      tests: [
        {
          name: t('100 °C ergibt 212 °F', '100 °C gives 212 °F'),
          pruefung: js`
            await render()
            await type(field('Celsius'), 100)
            expect(text()).toContain('212 °F')
          `,
        },
        {
          name: t('State lebt in App', 'State lives in App'),
          pruefung: js`
            expect(code).toMatch(/function App\(\)\s*\{\s*const \[\w+, \w+\] = useState/)
          `,
        },
      ],
    },
    {
      id: 'react-datenfluss-akkordeon',
      stufe: 'ergaenzen',
      titel: t('Akkordeon: immer nur eins offen', 'Accordion: only one open at a time'),
      aufgabe: t(
        'Ergänze `App` und `Panel`: Jedes Panel hat einen Knopf mit seinem Titel. Nur das aktive Panel zeigt seinen Inhalt; anfangs das erste. `App` hält den Index des aktiven Panels.',
        'Complete `App` and `Panel`: each panel has a button with its title. Only the active panel shows its content; the first one at the start. `App` holds the index of the active panel.',
      ),
      modus: 'react',
      code: js`
        function Panel({ title, children }) {
          // TODO: button with the title, children only when active
          return (
            <section>
              <button>{title}</button>
              <p>{children}</p>
            </section>
          )
        }

        function App() {
          return (
            <>
              <Panel title="About">A learning path for React.</Panel>
              <Panel title="Stack">React, Vite and Tailwind.</Panel>
            </>
          )
        }
      `,
      loesung: js`
        function Panel({ title, children, isActive, onShow }) {
          return (
            <section>
              <button onClick={onShow}>{title}</button>
              {isActive && <p>{children}</p>}
            </section>
          )
        }

        function App() {
          const [activeIndex, setActiveIndex] = useState(0)
          return (
            <>
              <Panel title="About" isActive={activeIndex === 0} onShow={() => setActiveIndex(0)}>
                A learning path for React.
              </Panel>
              <Panel title="Stack" isActive={activeIndex === 1} onShow={() => setActiveIndex(1)}>
                React, Vite and Tailwind.
              </Panel>
            </>
          )
        }
      `,
      tipps: {
        de: ['`const [activeIndex, setActiveIndex] = useState(0)` in `App`.', 'Jedes Panel bekommt `isActive` und `onShow` als Props.'],
        en: ['`const [activeIndex, setActiveIndex] = useState(0)` in `App`.', 'Each panel receives `isActive` and `onShow` as props.'],
      },
      tests: [
        {
          name: t('Anfangs nur das erste offen', 'Only the first open at the start'),
          pruefung: js`
            await render()
            expect(text()).toContain('A learning path for React.')
            expect(text()).not.toContain('React, Vite and Tailwind.')
          `,
        },
        {
          name: t('Klick wechselt das offene Panel', 'Click switches the open panel'),
          pruefung: js`
            await render()
            await click(button('Stack'))
            expect(text()).toContain('React, Vite and Tailwind.')
            expect(text()).not.toContain('A learning path for React.')
          `,
        },
      ],
    },
  ],
}
