import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 2.2 - Objekttypen & Interfaces. */

export const beispiele = {
  'ts-objekte-einstieg': {
    code: js`
      type Product = {
        id: number
        name: string
        price: number
        tags?: string[] // optional - may be missing
        readonly sku: string // cannot be changed later
      }

      const mug: Product = { id: 1, name: 'Mug', price: 9.5, sku: 'MUG-01' }

      mug.price = 8.5 // ok
      // mug.sku = 'X' // ❌ Cannot assign to 'sku' because it is a read-only property

      console.log(mug.name, mug.price, mug.tags?.length ?? 0)
    `,
  },
  'ts-objekte-type-interface': {
    code: js`
      // Two ways to describe the same shape:
      type PointType = { x: number; y: number }

      interface PointInterface {
        x: number
        y: number
      }

      const a: PointType = { x: 1, y: 2 }
      const b: PointInterface = a // same shape → compatible

      // Interfaces are extended with extends ...
      interface Point3D extends PointInterface {
        z: number
      }

      // ... types are combined with & (intersection: both at once)
      type LabeledPoint = PointType & { label: string }

      const c: Point3D = { x: 1, y: 2, z: 3 }
      const d: LabeledPoint = { x: 0, y: 0, label: 'origin' }
      console.log(b, c, d)
    `,
  },
  'ts-objekte-optional': {
    code: js`
      type Settings = {
        theme: string
        fontSize?: number // number | undefined
      }

      function describe(settings: Settings) {
        // settings.fontSize.toFixed(0) // ❌ 'settings.fontSize' is possibly 'undefined'
        const size = settings.fontSize ?? 16
        return \`\${settings.theme} theme, \${size}px\`
      }

      console.log(describe({ theme: 'dark' }))
      console.log(describe({ theme: 'light', fontSize: 20 }))
    `,
  },
  'ts-objekte-readonly': {
    code: js`
      type Config = {
        readonly apiUrl: string
        readonly retries: number
      }

      const config: Config = { apiUrl: 'https://api.example.com', retries: 3 }
      // config.retries = 5 // ❌ read-only property

      // Readonly arrays: no push, no sort - just right for React state
      const colors: readonly string[] = ['red', 'green']
      // colors.push('blue') // ❌ Property 'push' does not exist on type 'readonly string[]'

      const moreColors = [...colors, 'blue'] // create a new array instead
      console.log(config.retries, moreColors)
    `,
  },
  'ts-objekte-strukturell': {
    code: js`
      type Named = { name: string }

      function hello(thing: Named) {
        return 'Hello ' + thing.name
      }

      // Everything with name: string fits - the name of the type doesn't matter
      const user = { name: 'Ada', age: 36 }
      const city = { name: 'Paris', population: 2_100_000 }
      console.log(hello(user), '|', hello(city))

      // But in an object literal written directly, extra fields are reported -
      // they are usually typos. Remove the // and try it:
      // hello({ name: 'Linus', agee: 9 })
    `,
  },
  'ts-objekte-index': {
    code: js`
      // Index signature: any number of keys, all with the same value type
      type Scores = { [player: string]: number }
      const scores: Scores = { ada: 12, grace: 9 }
      scores.linus = 4

      // Record<Key, Value> means the same and reads nicer
      const stock: Record<string, number> = { apples: 3, pears: 0 }

      // With fixed keys (a union, more in chapter 2.4) every key must be there
      type Weekday = 'mon' | 'tue' | 'wed'
      const hours: Record<Weekday, number> = { mon: 8, tue: 6, wed: 7 }

      for (const [player, points] of Object.entries(scores)) {
        console.log(player, points)
      }
      console.log(stock, hours)
    `,
  },
  'ts-objekte-verschachtelt': {
    code: js`
      type Address = {
        street: string
        city: string
      }

      type Order = { id: number; total: number }

      type Customer = {
        id: number
        name: string
        address: Address // a type inside a type
        orders: Order[] // an array of objects
      }

      const customer: Customer = {
        id: 7,
        name: 'Grace',
        address: { street: 'Main St 1', city: 'Arlington' },
        orders: [
          { id: 1, total: 20 },
          { id: 2, total: 35.5 },
        ],
      }

      // Inside reduce, TypeScript knows: order is an Order
      const revenue = customer.orders.reduce((sum, order) => sum + order.total, 0)
      console.log(\`\${customer.name} from \${customer.address.city}: \${revenue}\`)
    `,
  },
  'ts-objekte-uebung': {
    tipps: {
      de: [
        'Ein Feld, das sich nie ändern darf, bekommt `readonly` davor: `readonly id: number`.',
        'Optional heißt: Fragezeichen hinter den Namen - `isbn?: string`.',
        'Die Bibliothek braucht `name: string` und `books: Book[]`.',
      ],
      en: [
        'A field that must never change gets `readonly` in front: `readonly id: number`.',
        'Optional means: a question mark after the name - `isbn?: string`.',
        'The library needs `name: string` and `books: Book[]`.',
      ],
    },
    code: js`
      // 1. A book: id (never changes), title, author, year - and an optional isbn
      type Book = {
      }

      // 2. A library has a name and a list of books
      interface Library {
      }

      function addBook(library: Library, book: Book): Library {
        return { ...library, books: [...library.books, book] }
      }

      function findByAuthor(library: Library, author: string): Book[] {
        return library.books.filter((book) => book.author === author)
      }

      const cityLibrary: Library = { name: 'City Library', books: [] }
      const withDune = addBook(cityLibrary, { id: 1, title: 'Dune', author: 'Frank Herbert', year: 1965 })
      console.log(findByAuthor(withDune, 'Frank Herbert'))
    `,
    loesung: js`
      // 1. A book: id (never changes), title, author, year - and an optional isbn
      type Book = {
        readonly id: number
        title: string
        author: string
        year: number
        isbn?: string
      }

      // 2. A library has a name and a list of books
      interface Library {
        name: string
        books: Book[]
      }

      function addBook(library: Library, book: Book): Library {
        return { ...library, books: [...library.books, book] }
      }

      function findByAuthor(library: Library, author: string): Book[] {
        return library.books.filter((book) => book.author === author)
      }

      const cityLibrary: Library = { name: 'City Library', books: [] }
      const withDune = addBook(cityLibrary, { id: 1, title: 'Dune', author: 'Frank Herbert', year: 1965 })
      console.log(findByAuthor(withDune, 'Frank Herbert'))
    `,
    tests: [
      { name: { de: 'findByAuthor findet das Buch', en: 'findByAuthor finds the book' }, ausdruck: "findByAuthor(withDune, 'Frank Herbert').map((b) => b.title)", erwartet: ['Dune'] },
      { name: { de: 'addBook verändert die alte Bibliothek nicht', en: 'addBook does not change the old library' }, ausdruck: 'cityLibrary.books.length', erwartet: 0 },
    ],
    typTests: [
      {
        name: { de: 'isbn ist optional', en: 'isbn is optional' },
        code: "const withoutIsbn: Book = { id: 2, title: 'Emma', author: 'Jane Austen', year: 1815 }\nconst withIsbn: Book = { id: 3, title: 'Ulysses', author: 'James Joyce', year: 1922, isbn: '978-0' }",
      },
      { name: { de: 'id ist readonly', en: 'id is readonly' }, code: 'declare const someBook: Book\n// @ts-expect-error\nsomeBook.id = 5' },
      { name: { de: 'year muss eine Zahl sein', en: 'year must be a number' }, code: "// @ts-expect-error\nconst wrongYear: Book = { id: 4, title: 'X', author: 'Y', year: '1999' }" },
      { name: { de: 'Eine Bibliothek hat name und books', en: 'A library has name and books' }, code: "const homeLibrary: Library = { name: 'Home', books: [] }" },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  vergleich: js`
    // type: a name for ANY type - also unions, tuples, functions
    type Id = number | string
    type Pair = [number, number]
    type User = { id: Id; name: string }

    // interface: only for object shapes, but can be extended and merged
    interface Animal { name: string }
    interface Dog extends Animal { barks: boolean }

    // Declaration merging: a second interface with the same name ADDS fields
    interface Window { myAppVersion: string }
  `,
}
