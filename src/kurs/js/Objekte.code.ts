import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'js-objekte-einstieg': {
    code: js`
      const user = { name: 'Ada', city: 'London' }

      console.log(user.name)
      console.log(user.city)
    `,
  },
  'js-objekte-1': {
    code: js`
      const book = {
        title: 'The Hobbit',
        author: 'J. R. R. Tolkien',
        year: 1937,
        genres: ['Fantasy', 'Adventure'],
        publisher: { name: 'Allen & Unwin', city: 'London' },
      }

      console.log(book.title)
      console.log(book.publisher.city)

      const field = 'year'
      console.log(book[field])       // dynamic key

      book.pages = 310               // add a property
      console.log(Object.keys(book))
      console.log(Object.entries({ a: 1, b: 2 }))

      // Shorthand: variable and key have the same name
      const name = 'Ada'
      const age = 36
      console.log({ name, age })  // instead of { name: name, age: age }
    `,
  },
  'js-objekte-2': {
    code: js`
      const user = { name: 'Grace', role: 'Admin', city: 'New York' }

      // Object: by NAME
      const { name, role } = user
      console.log(name, role)

      // Rename and default value
      const { city: town, country = 'USA' } = user
      console.log(town, country)

      // Array: by POSITION
      const coordinates = [52.52, 13.4]
      const [latitude, longitude] = coordinates
      console.log(latitude, longitude)

      // Skip elements
      const [, second] = ['a', 'b', 'c']
      console.log(second)

      // Directly in function parameters
      function describe({ name, role = 'Guest' }) {
        return \`\${name} is \${role}\`
      }
      console.log(describe(user))
      console.log(describe({ name: 'Linus' }))
    `,
  },
  'js-objekte-3': {
    code: js`
      const defaults = { theme: 'light', language: 'en', fontSize: 14 }

      // Spread: copy with changed values - LATER values win
      const mine = { ...defaults, theme: 'dark' }
      console.log(mine)
      console.log(defaults)   // unchanged!

      // Merge arrays
      const a = [1, 2]
      const b = [3, 4]
      console.log([...a, ...b, 5])

      // Rest: collect the rest
      const { theme, ...withoutTheme } = mine
      console.log(theme, withoutTheme)

      const [first, ...others] = [10, 20, 30]
      console.log(first, others)
    `,
  },
  'js-objekte-4': {
    code: js`
      const data = { id: 1, tags: ['new', 'sale'], active: true }

      const text = JSON.stringify(data)
      console.log(text, typeof text)

      const back = JSON.parse(text)
      console.log(back.tags[0])

      // Pretty-printed
      console.log(JSON.stringify(data, null, 2))
    `,
  },
  'js-objekte-uebung': {
    tipps: {
      de: [
        '`update`: `{ ...user, ...changes }` - spätere Schlüssel überschreiben frühere.',
        '`displayName` destrukturiert direkt in der Parameterliste: `({ firstName, lastName, title })`.',
        'Mit Titel oder ohne? Ein Ternär mit zwei Template-Literalen.',
      ],
      en: [
        '`update`: `{ ...user, ...changes }` - later keys override earlier ones.',
        '`displayName` destructures right in the parameter list: `({ firstName, lastName, title })`.',
        'With a title or without? A ternary with two template literals.',
      ],
    },
    code: js`
      function update(user, changes) {

      }

      function displayName(/* destructuring here */) {

      }

      const ada = { firstName: 'Ada', lastName: 'Lovelace', title: 'Dr.' }
      console.log(update(ada, { firstName: 'Augusta' }))
      console.log(displayName(ada))
    `,
    loesung: js`
      function update(user, changes) {
        return { ...user, ...changes }
      }

      function displayName({ firstName, lastName, title }) {
        return title ? \`\${title} \${firstName} \${lastName}\` : \`\${firstName} \${lastName}\`
      }

      const ada = { firstName: 'Ada', lastName: 'Lovelace', title: 'Dr.' }
      console.log(update(ada, { firstName: 'Augusta' }))
      console.log(displayName(ada))
    `,
    tests: [
      { name: { de: 'update überschreibt Felder', en: 'update overwrites fields' }, ausdruck: 'update({ a: 1, b: 2 }, { b: 3, c: 4 })', erwartet: { a: 1, b: 3, c: 4 } },
      { name: { de: 'update verändert das Original nicht', en: 'update does not change the original' }, ausdruck: '(() => { const o = { a: 1 }; update(o, { a: 2 }); return o.a === 1 })()' },
      { name: { de: 'update gibt ein NEUES Objekt zurück', en: 'update returns a NEW object' }, ausdruck: '(() => { const o = { a: 1 }; return update(o, {}) !== o })()' },
      { name: { de: 'displayName mit title', en: 'displayName with title' }, ausdruck: 'displayName({ firstName: \'Ada\', lastName: \'Lovelace\', title: \'Dr.\' })', erwartet: 'Dr. Ada Lovelace' },
      { name: { de: 'displayName ohne title', en: 'displayName without title' }, ausdruck: 'displayName({ firstName: \'Alan\', lastName: \'Turing\' })', erwartet: 'Alan Turing' },
    ],
  },
  'js-objekte-mapset': {
    code: js`
      // Set: every value at most once
      const tags = new Set(['react', 'js', 'react', 'css'])
      console.log(tags.size, tags.has('js')) // 3 true
      tags.add('ts').delete('css')
      console.log([...tags]) // back to an array with spread

      // Removing duplicates - the most common use
      const ids = [3, 1, 3, 2, 1]
      console.log([...new Set(ids)]) // [3, 1, 2]

      // Map: key -> value, keys can be anything and keep their order
      const users = new Map()
      users.set(1, { name: 'Ada' })
      users.set(2, { name: 'Linus' })
      console.log(users.get(2).name, users.size) // Linus 2

      for (const [id, user] of users) {
        console.log(id, '->', user.name)
      }

      // Build a lookup from an array: fast access by id instead of find() every time
      const products = [
        { id: 'a', price: 10 },
        { id: 'b', price: 25 },
      ]
      const byId = new Map(products.map((p) => [p.id, p]))
      console.log(byId.get('b').price) // 25
    `,
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    function Profile({ name, age }) { … }        // object destructuring of props
    const [count, setCount] = useState(0)       // array destructuring
  `,
}
