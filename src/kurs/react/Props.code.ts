import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'react-props-einstieg': {
    code: js`
      function Greeting({ name }) {
        return <p>Hello, {name}!</p>
      }

      function App() {
        return (
          <>
            <Greeting name="Ada" />
            <Greeting name="Grace" />
          </>
        )
      }
    `,
  },
  'react-props-1': {
    code: js`
      function Product({ name, price, discount = 0, isNew }) {
        const finalPrice = price * (1 - discount / 100)

        return (
          <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8, margin: 4 }}>
            <h3>{name} {isNew && '🆕'}</h3>
            <p>
              {discount > 0 && <s>{price} € </s>}
              <strong>{finalPrice.toFixed(2)} €</strong>
            </p>
          </div>
        )
      }

      function App() {
        return (
          <>
            <Product name="Coffee mug" price={12} />
            <Product name="Teapot" price={30} discount={20} isNew />
            <Product name="Espresso machine" price={249} discount={10} />
          </>
        )
      }
    `,
  },
  'react-props-2': {
    code: js`
      function Card({ title, children }) {
        return (
          <section style={{ border: '2px solid royalblue', borderRadius: 12, padding: 12, marginBottom: 8 }}>
            <h3 style={{ marginTop: 0 }}>{title}</h3>
            {children}
          </section>
        )
      }

      function App() {
        return (
          <>
            <Card title="Plain text">
              I am children.
            </Card>
            <Card title="Any JSX">
              <p>A paragraph …</p>
              <button>… and a button</button>
            </Card>
          </>
        )
      }
    `,
  },
  'react-props-3': {
    code: js`
      const tasks = [
        { id: 't1', text: 'Understand props', done: true },
        { id: 't2', text: 'Render lists', done: false },
        { id: 't3', text: "Don't forget the key", done: false },
      ]

      function App() {
        return (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                {task.done ? '✅' : '⬜'} {task.text}
              </li>
            ))}
          </ul>
        )
      }
    `,
  },
  'react-props-4': {
    code: js`
      function Status({ online }) {
        // Early return with if - allowed before the return
        if (online === undefined) return null
        return <span>{online ? '🟢 online' : '⚫ offline'}</span>
      }

      function Inbox({ count }) {
        return (
          <div>
            {/* && for "only if" */}
            {count > 0 && <p>You have {count} new messages.</p>}
            {/* ternary for "either/or" */}
            {count === 0 ? <p>All read 🎉</p> : <button>Open</button>}
          </div>
        )
      }

      function App() {
        return (
          <>
            <p>Ada: <Status online={true} /></p>
            <p>Alan: <Status online={false} /></p>
            <p>Unknown: <Status /></p>
            <hr />
            <Inbox count={3} />
            <Inbox count={0} />
          </>
        )
      }
    `,
  },
  'react-props-uebung': {
    tipps: {
      de: [
        '`Contact` destrukturiert seine Props: `function Contact({ name, email, favorite })`.',
        'Stern nur für Favoriten: `{favorite && \'⭐ \'}`; fehlende E-Mail per Ternär.',
        'Im `map` den `key={c.id}` nicht vergessen; die Anzahl ist `contacts.filter((c) => c.favorite).length`.',
      ],
      en: [
        '`Contact` destructures its props: `function Contact({ name, email, favorite })`.',
        'Star only for favorites: `{favorite && \'⭐ \'}`; handle the missing email with a ternary.',
        'Don’t forget `key={c.id}` in the `map`; the count is `contacts.filter((c) => c.favorite).length`.',
      ],
    },
    code: js`
      const contacts = [
        { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', favorite: true },
        { id: 2, name: 'Alan Turing', email: null, favorite: false },
        { id: 3, name: 'Grace Hopper', email: 'grace@example.com', favorite: false },
      ]

      function Contact(/* props */) {
        return <li>…</li>
      }

      function App() {
        return <ul></ul>
      }
    `,
    loesung: js`
      const contacts = [
        { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', favorite: true },
        { id: 2, name: 'Alan Turing', email: null, favorite: false },
        { id: 3, name: 'Grace Hopper', email: 'grace@example.com', favorite: false },
      ]

      function Contact({ name, email, favorite }) {
        return (
          <li>
            {favorite && '⭐ '}
            <strong>{name}</strong>{' - '}
            {email ? email : <span style={{ color: 'gray' }}>no email</span>}
          </li>
        )
      }

      function App() {
        const favorites = contacts.filter((c) => c.favorite).length

        return (
          <>
            <p>{contacts.length} contacts, {favorites} of them favorite</p>
            <ul>
              {contacts.map((c) => (
                <Contact key={c.id} name={c.name} email={c.email} favorite={c.favorite} />
              ))}
            </ul>
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Alle drei Kontakte sind Listeneinträge', en: 'All three contacts are list items' },
        pruefung: js`
          await render()
          expect(findAll('li')).toHaveLength(3)
        `,
      },
      {
        name: { de: 'Nur Favoriten haben einen ⭐', en: 'Only favorites have a ⭐' },
        pruefung: js`
          await render()
          const [ada, alan, grace] = findAll('li')
          expect(ada.textContent).toContain('⭐')
          expect(alan.textContent).not.toContain('⭐')
          expect(grace.textContent).not.toContain('⭐')
        `,
      },
      {
        name: { de: 'Fehlende E-Mail zeigt „no email“', en: 'A missing email shows “no email”' },
        pruefung: js`
          await render()
          const [ada, alan] = findAll('li')
          expect(ada.textContent).toContain('ada@example.com')
          expect(alan.textContent).toContain('no email')
        `,
      },
      {
        name: { de: 'Die Zusammenfassung ist aus den Daten berechnet', en: 'The summary is calculated from the data' },
        pruefung: js`
          await render()
          expect(text()).toContain('3 contacts, 1 of them favorite')
          expect(code).not.toMatch(/(>|['"\`])\s*3 contacts/)
        `,
      },
      {
        name: { de: 'Die Liste nutzt map und key', en: 'The list uses map and key' },
        pruefung: js`
          expect(code).toMatch(/\.map\(/)
          expect(code).toMatch(/key=\{/)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    // Usage:
    <Greeting name="Ada" age={36} isAdmin />

    // The component receives: { name: 'Ada', age: 36, isAdmin: true }
    function Greeting({ name, age, isAdmin = false }) { … }
  `,
}
