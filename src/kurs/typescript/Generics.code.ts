import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 2.5 - Generics. */

export const beispiele = {
  'ts-generics-einstieg': {
    code: js`
      // T is a placeholder - filled in anew on every call
      function first<T>(list: T[]): T | undefined {
        return list[0]
      }

      const firstNumber = first([10, 20, 30]) // T = number
      const firstWord = first(['a', 'b']) // T = string

      console.log(firstNumber?.toFixed(1), firstWord?.toUpperCase())
      // firstNumber?.toUpperCase() // ❌ Property 'toUpperCase' does not exist on type 'number'
    `,
  },
  'ts-generics-funktionen': {
    code: js`
      // Several type parameters
      function pair<A, B>(first: A, second: B): [A, B] {
        return [first, second]
      }

      // Usually inferred - but you can also pass them explicitly
      const inferred = pair('age', 36) // [string, number]
      const explicit = pair<string, boolean>('ok', true)

      // The result type U comes from the callback
      function mapAll<T, U>(items: T[], transform: (item: T) => U): U[] {
        const result: U[] = []
        for (const item of items) result.push(transform(item))
        return result
      }

      const lengths = mapAll(['one', 'three'], (word) => word.length) // number[]
      console.log(inferred, explicit, lengths)
    `,
  },
  'ts-generics-constraints': {
    code: js`
      // extends restricts T: only types that have a length
      function longest<T extends { length: number }>(a: T, b: T): T {
        return a.length >= b.length ? a : b
      }

      console.log(longest('apple', 'kiwi')) // strings have a length
      console.log(longest([1, 2, 3], [4])) // arrays too
      // longest(10, 20) // ❌ 'number' does not satisfy the constraint '{ length: number; }'

      type HasId = { id: number }

      // T keeps ALL of its fields - not only id
      function byId<T extends HasId>(items: T[], id: number): T | undefined {
        return items.find((item) => item.id === id)
      }

      const task = byId([{ id: 1, title: 'Learn generics' }], 1)
      console.log(task?.title) // title is still known!
    `,
  },
  'ts-generics-keyof': {
    code: js`
      type User = { name: string; age: number; admin: boolean }

      // keyof User = 'name' | 'age' | 'admin'
      // T[K] is the type of that field ("indexed access")
      function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
        return obj[key]
      }

      const ada: User = { name: 'Ada', age: 36, admin: true }
      const userName = getProp(ada, 'name') // string
      const userAge = getProp(ada, 'age') // number
      // getProp(ada, 'email') // ❌ Argument of type '"email"' is not assignable ...
      console.log(userName.toUpperCase(), userAge + 1)

      // In practice: sort by any key
      function sortBy<T>(items: T[], key: keyof T): T[] {
        return items.toSorted((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0))
      }

      const team: User[] = [ada, { name: 'Grace', age: 29, admin: false }]
      console.log(sortBy(team, 'age').map((user) => user.name))
    `,
  },
  'ts-generics-typen': {
    code: js`
      // A generic type: a type with a placeholder
      type ApiResponse<T> = {
        ok: boolean
        data: T
        receivedAt: string
      }

      type Product = { id: number; name: string }

      const single: ApiResponse<Product> = { ok: true, data: { id: 1, name: 'Mug' }, receivedAt: '12:00' }
      const list: ApiResponse<Product[]> = { ok: true, data: [], receivedAt: '12:01' }

      // A default for the type parameter
      type Box<T = string> = { value: T }
      const textBox: Box = { value: 'string is the default' }
      const numberBox: Box<number> = { value: 42 }

      // You already know many generic types: Array<T>, Promise<T>, Map<K, V>, Set<T>
      const visits = new Map<string, number>()
      visits.set('home', 3)

      console.log(single.data.name, list.data.length, textBox.value, numberBox.value, visits.get('home'))
    `,
  },
  'ts-generics-klassen': {
    code: js`
      class Stack<T> {
        private items: T[] = []

        push(item: T) {
          this.items.push(item)
        }

        pop(): T | undefined {
          return this.items.pop()
        }

        get size() {
          return this.items.length
        }
      }

      const numbers = new Stack<number>()
      numbers.push(1)
      numbers.push(2)
      // numbers.push('three') // ❌ 'string' is not assignable to 'number'
      console.log(numbers.pop(), numbers.size)

      const words = new Stack<string>()
      words.push('hello')
      console.log(words.pop()?.toUpperCase())
    `,
  },
  'ts-generics-uebung': {
    tipps: {
      de: [
        'Schreib den Typparameter hinter den Funktionsnamen: `function last<T>(items: T[]): T | undefined`.',
        'Bei `groupBy` ersetzt `T` jedes `any`: `items: T[]`, `getKey: (item: T) => string`, Ergebnis `Record<string, T[]>`.',
        'Für `pluck` brauchst du zwei Typparameter: `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][]`.',
      ],
      en: [
        'Write the type parameter after the function name: `function last<T>(items: T[]): T | undefined`.',
        'In `groupBy`, `T` replaces every `any`: `items: T[]`, `getKey: (item: T) => string`, result `Record<string, T[]>`.',
        'For `pluck` you need two type parameters: `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][]`.',
      ],
    },
    code: js`
      // Replace every any with type parameters - the functions should work for ALL types
      // and still keep the exact types.

      // The last element - or undefined for an empty array
      function last(items: any[]): any {
        return items[items.length - 1]
      }

      // Groups the items by a key, e.g. by team
      function groupBy(items: any[], getKey: (item: any) => string): Record<string, any[]> {
        const groups: Record<string, any[]> = {}
        for (const item of items) {
          const key = getKey(item)
          groups[key] = [...(groups[key] ?? []), item]
        }
        return groups
      }

      // Reads one field from every item
      function pluck(items: any[], key: any): any[] {
        return items.map((item) => item[key])
      }

      const people = [
        { name: 'Ada', team: 'red' },
        { name: 'Grace', team: 'blue' },
        { name: 'Linus', team: 'red' },
      ]
      console.log(last(people), groupBy(people, (person) => person.team), pluck(people, 'name'))
    `,
    loesung: js`
      // Replace every any with type parameters - the functions should work for ALL types
      // and still keep the exact types.

      // The last element - or undefined for an empty array
      function last<T>(items: T[]): T | undefined {
        return items[items.length - 1]
      }

      // Groups the items by a key, e.g. by team
      function groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]> {
        const groups: Record<string, T[]> = {}
        for (const item of items) {
          const key = getKey(item)
          groups[key] = [...(groups[key] ?? []), item]
        }
        return groups
      }

      // Reads one field from every item
      function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
        return items.map((item) => item[key])
      }

      const people = [
        { name: 'Ada', team: 'red' },
        { name: 'Grace', team: 'blue' },
        { name: 'Linus', team: 'red' },
      ]
      console.log(last(people), groupBy(people, (person) => person.team), pluck(people, 'name'))
    `,
    tests: [
      { name: 'last([1, 2, 3])', ausdruck: 'last([1, 2, 3])', erwartet: 3 },
      { name: { de: 'last([]) ist undefined', en: 'last([]) is undefined' }, ausdruck: 'last([]) === undefined' },
      {
        name: { de: 'groupBy nach Team', en: 'groupBy by team' },
        ausdruck: 'groupBy(people, (p) => p.team)',
        erwartet: { red: [{ name: 'Ada', team: 'red' }, { name: 'Linus', team: 'red' }], blue: [{ name: 'Grace', team: 'blue' }] },
      },
      { name: "pluck(people, 'name')", ausdruck: "pluck(people, 'name')", erwartet: ['Ada', 'Grace', 'Linus'] },
    ],
    typTests: [
      {
        name: { de: 'last liefert T | undefined', en: 'last returns T | undefined' },
        code: 'const lastNumber = last([1, 2, 3])\n// @ts-expect-error - it could be undefined\nconst sureNumber: number = lastNumber',
      },
      {
        name: { de: 'groupBy kennt den Typ der Elemente', en: 'groupBy knows the item type' },
        code: '// @ts-expect-error - numbers have no toUpperCase\ngroupBy([1, 2], (n) => n.toUpperCase())',
      },
      {
        name: { de: 'pluck liefert den Typ des Feldes', en: 'pluck returns the type of the field' },
        code: "const ages = pluck([{ name: 'Ada', age: 36 }], 'age')\n// @ts-expect-error - ages is number[], not string[]\nconst ageTexts: string[] = ages",
      },
      {
        name: { de: 'pluck nimmt nur vorhandene Schlüssel', en: 'pluck only accepts existing keys' },
        code: "// @ts-expect-error - there is no email\npluck([{ name: 'Ada' }], 'email')",
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  react: js`
    // Generics in React, you will meet them in part 5:
    const [todos, setTodos] = useState<Todo[]>([])      // useState<T>
    const inputRef = useRef<HTMLInputElement>(null)      // useRef<T>
    const ThemeContext = createContext<Theme>('light')   // createContext<T>

    // A generic component: a list for ANY kind of item
    function List<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) { … }
  `,
  wann: js`
    // ❌ Unnecessary: T appears only once - a plain parameter type is enough
    function logValue<T>(value: T): void { console.log(value) }
    function logValue(value: unknown): void { console.log(value) }   // ✅ the same

    // ✅ Useful: T connects input and output
    function identity<T>(value: T): T { return value }
  `,
}
