import { js } from '../../lernen/quelltext'
import type { PlaygroundDaten } from './typen'

/**
 * Playground für Teil 2 (TypeScript). Läuft wie die Kapitel mit Typprüfung unter dem
 * Editor - Typfehler werden angezeigt, der Code läuft trotzdem.
 *
 * Alle Bausteine hängen sich unten an und benutzen eigene Namen (auch für Typen),
 * damit man beliebig viele davon kombinieren kann, ohne dass etwas doppelt deklariert ist.
 */
export const tsPlayground: PlaygroundDaten = {
  teil: 'typescript',
  modus: 'ts',
  hinweis: {
    de: 'Unter dem Editor steht das Ergebnis der Typprüfung. Typfehler halten das Programm nicht auf - genau wie in echt.',
    en: 'The result of the type check is shown below the editor. Type errors do not stop the program - just like for real.',
  },
  vorlagen: [
    {
      titel: { de: 'Leeres Blatt', en: 'Blank page' },
      info: { de: 'Eine Variable mit Typ - der Rest gehört dir.', en: 'One typed variable - the rest is yours.' },
      code: js`
        // TypeScript playground - write anything you like.
        // Pick building blocks on the left or type right here.

        const greeting: string = 'Hello playground!'
        console.log(greeting)
      `,
    },
    {
      titel: { de: 'Todo-Liste mit Typen', en: 'Typed todo list' },
      info: { de: 'Ein Objekttyp, eine Literal-Union und Funktionen, die nichts verändern.', en: 'An object type, a literal union and functions that change nothing.' },
      code: js`
        type Todo = { readonly id: number; title: string; done: boolean }
        type Filter = 'all' | 'open' | 'done'

        function addTodo(todos: readonly Todo[], title: string): Todo[] {
          return [...todos, { id: todos.length + 1, title, done: false }]
        }

        function toggle(todos: readonly Todo[], id: number): Todo[] {
          return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
        }

        function visible(todos: readonly Todo[], filter: Filter): Todo[] {
          if (filter === 'all') return [...todos]
          return todos.filter((todo) => (filter === 'done' ? todo.done : !todo.done))
        }

        let todos = addTodo([], 'Learn TypeScript')
        todos = addTodo(todos, 'Build something')
        todos = toggle(todos, 1)

        console.log(visible(todos, 'open'))
        console.log(visible(todos, 'done'))
      `,
    },
    {
      titel: { de: 'Formen (Discriminated Union)', en: 'Shapes (discriminated union)' },
      info: { de: 'Varianten mit gemeinsamem kind-Feld, switch und never-Prüfung.', en: 'Variants with a common kind field, switch and a never check.' },
      code: js`
        type Shape =
          | { kind: 'circle'; radius: number }
          | { kind: 'rectangle'; width: number; height: number }

        function area(shape: Shape): number {
          switch (shape.kind) {
            case 'circle':
              return Math.PI * shape.radius ** 2
            case 'rectangle':
              return shape.width * shape.height
            default: {
              const unhandled: never = shape
              return unhandled
            }
          }
        }

        const shapes: Shape[] = [
          { kind: 'circle', radius: 2 },
          { kind: 'rectangle', width: 3, height: 4 },
        ]

        for (const shape of shapes) console.log(shape.kind, area(shape).toFixed(2))
      `,
    },
    {
      titel: { de: 'Generischer Speicher', en: 'Generic store' },
      info: { de: 'Eine Klasse mit Typparameter und keyof.', en: 'A class with a type parameter and keyof.' },
      code: js`
        class Store<T extends { id: number }> {
          private items = new Map<number, T>()

          add(item: T) {
            this.items.set(item.id, item)
          }

          get(id: number): T | undefined {
            return this.items.get(id)
          }

          pluck<K extends keyof T>(key: K): T[K][] {
            return [...this.items.values()].map((item) => item[key])
          }
        }

        type Book = { id: number; title: string; year: number }

        const books = new Store<Book>()
        books.add({ id: 1, title: 'Dune', year: 1965 })
        books.add({ id: 2, title: 'Neuromancer', year: 1984 })

        console.log(books.get(2)?.title, books.pluck('year'))
      `,
    },
    {
      titel: { de: 'API-Daten prüfen', en: 'Checking API data' },
      info: { de: 'async/await, unknown und ein Type Guard - so kommen sichere Daten in die App.', en: 'async/await, unknown and a type guard - how safe data gets into the app.' },
      code: js`
        type User = { id: number; name: string }

        function isUser(value: unknown): value is User {
          return (
            typeof value === 'object' &&
            value !== null &&
            'id' in value &&
            typeof value.id === 'number' &&
            'name' in value &&
            typeof value.name === 'string'
          )
        }

        // Pretends to be fetch(...).then((r) => r.json())
        async function fakeFetch(json: string): Promise<unknown> {
          await new Promise((resolve) => setTimeout(resolve, 200))
          return JSON.parse(json)
        }

        async function loadUser(json: string): Promise<User | null> {
          const data = await fakeFetch(json)
          return isUser(data) ? data : null
        }

        loadUser('{ "id": 1, "name": "Ada" }').then((user) => console.log('valid:', user))
        loadUser('{ "id": "1" }').then((user) => console.log('invalid:', user))
      `,
    },
  ],
  gruppen: [
    {
      titel: { de: 'Grundtypen', en: 'Basic types' },
      bausteine: [
        {
          titel: { de: 'Variablen mit Typ', en: 'Typed variables' },
          info: { de: 'Annotation mit Doppelpunkt - oder Inferenz ohne.', en: 'An annotation with a colon - or inference without.' },
          code: js`
            const userName: string = 'Ada'
            let loginCount: number = 0
            const isAdmin = true // inferred: boolean
            loginCount++
            console.log(userName, loginCount, isAdmin)
          `,
          ort: 'ende',
          kapitel: 'ts-start',
        },
        {
          titel: { de: 'Array & Tupel', en: 'Array & tuple' },
          info: { de: 'number[] für Listen, [string, number] für feste Paare.', en: 'number[] for lists, [string, number] for fixed pairs.' },
          code: js`
            const scores: number[] = [90, 72, 100]
            const scoreEntry: [string, number] = ['Grace', 95]
            const [scorer, points] = scoreEntry
            console.log(scores, scorer.toUpperCase(), points.toFixed(1))
          `,
          ort: 'ende',
          kapitel: 'ts-start',
        },
        {
          titel: { de: 'unknown eingrenzen', en: 'Narrowing unknown' },
          info: { de: 'Erst prüfen, dann benutzen.', en: 'Check first, then use.' },
          code: js`
            function describeValue(value: unknown): string {
              if (typeof value === 'string') return 'text: ' + value.toUpperCase()
              if (typeof value === 'number') return 'number: ' + value.toFixed(2)
              return 'something else'
            }
            console.log(describeValue('hi'), describeValue(3), describeValue(null))
          `,
          ort: 'ende',
          kapitel: 'ts-start',
        },
      ],
    },
    {
      titel: { de: 'Objekte', en: 'Objects' },
      bausteine: [
        {
          titel: { de: 'type mit optionalem Feld', en: 'type with an optional field' },
          info: { de: 'Ein Objekttyp mit ?, readonly und einem Beispielwert.', en: 'An object type with ?, readonly and a sample value.' },
          code: js`
            type Product = {
              readonly id: number
              name: string
              price: number
              tags?: string[]
            }

            const mug: Product = { id: 1, name: 'Mug', price: 9.5 }
            console.log(mug.name, mug.tags?.length ?? 0)
          `,
          ort: 'ende',
          kapitel: 'ts-objekte',
        },
        {
          titel: { de: 'interface & extends', en: 'interface & extends' },
          info: { de: 'Ein Interface erweitert ein anderes.', en: 'One interface extends another.' },
          code: js`
            interface Animal {
              name: string
            }

            interface Dog extends Animal {
              breed: string
            }

            const rex: Dog = { name: 'Rex', breed: 'Beagle' }
            console.log(\`\${rex.name} is a \${rex.breed}\`)
          `,
          ort: 'ende',
          kapitel: 'ts-objekte',
        },
        {
          titel: { de: 'Record', en: 'Record' },
          info: { de: 'Ein Objekt mit beliebigen Schlüsseln desselben Typs.', en: 'An object with any keys of the same type.' },
          code: js`
            const stock: Record<string, number> = { apples: 3, pears: 0 }
            stock.kiwis = 12
            for (const [fruit, count] of Object.entries(stock)) console.log(fruit, count)
          `,
          ort: 'ende',
          kapitel: 'ts-objekte',
        },
      ],
    },
    {
      titel: { de: 'Funktionen', en: 'Functions' },
      bausteine: [
        {
          titel: { de: 'Typisierte Funktion', en: 'Typed function' },
          info: { de: 'Parameter- und Rückgabetyp.', en: 'Parameter and return types.' },
          code: js`
            function add(a: number, b: number): number {
              return a + b
            }
            console.log(add(2, 3))
          `,
          ort: 'ende',
          kapitel: 'ts-funktionen',
        },
        {
          titel: { de: 'Optional & Default', en: 'Optional & default' },
          info: { de: 'title? darf fehlen, times = 2 bringt seinen Typ mit.', en: 'title? may be missing, times = 2 brings its type along.' },
          code: js`
            function greet(name: string, title?: string, times = 1) {
              const text = title ? \`Hello \${title} \${name}! \` : \`Hello \${name}! \`
              return text.repeat(times)
            }
            console.log(greet('Ada'), greet('Hopper', 'Admiral', 2))
          `,
          ort: 'ende',
          kapitel: 'ts-funktionen',
        },
        {
          titel: { de: 'Funktionstyp & Callback', en: 'Function type & callback' },
          info: { de: 'Ein Typ für Funktionen - die Parameter bekommen ihren Typ automatisch.', en: 'A type for functions - the parameters get their types automatically.' },
          code: js`
            type Transform = (value: number) => number

            function applyAll(values: number[], transform: Transform): number[] {
              return values.map(transform)
            }

            const triple: Transform = (value) => value * 3
            console.log(applyAll([1, 2, 3], triple))
          `,
          ort: 'ende',
          kapitel: 'ts-funktionen',
        },
      ],
    },
    {
      titel: { de: 'Unions & Narrowing', en: 'Unions & narrowing' },
      bausteine: [
        {
          titel: { de: 'Literal-Union', en: 'Literal union' },
          info: { de: 'Nur diese drei Werte sind erlaubt.', en: 'Only these three values are allowed.' },
          code: js`
            type Status = 'loading' | 'success' | 'error'

            function statusIcon(status: Status) {
              if (status === 'loading') return '⏳'
              if (status === 'success') return '✅'
              return '❌'
            }
            console.log(statusIcon('success'))
          `,
          ort: 'ende',
          kapitel: 'ts-unions',
        },
        {
          titel: { de: 'Discriminated Union', en: 'Discriminated union' },
          info: { de: 'Varianten mit gemeinsamem type-Feld und switch.', en: 'Variants with a common type field and switch.' },
          code: js`
            type Payment =
              | { type: 'card'; last4: string }
              | { type: 'paypal'; email: string }

            function describePayment(payment: Payment): string {
              switch (payment.type) {
                case 'card':
                  return 'Card ending in ' + payment.last4
                case 'paypal':
                  return 'PayPal: ' + payment.email
              }
            }
            console.log(describePayment({ type: 'card', last4: '1234' }))
          `,
          ort: 'ende',
          kapitel: 'ts-unions',
        },
        {
          titel: { de: 'Type Guard', en: 'Type guard' },
          info: { de: 'Eine eigene Prüfung mit value is …', en: 'Your own check with value is …' },
          code: js`
            type Cat = { meow: () => string }

            function isCat(value: unknown): value is Cat {
              return typeof value === 'object' && value !== null && 'meow' in value
            }

            const pet: unknown = { meow: () => 'Meow!' }
            if (isCat(pet)) console.log(pet.meow())
          `,
          ort: 'ende',
          kapitel: 'ts-unions',
        },
      ],
    },
    {
      titel: { de: 'Generics', en: 'Generics' },
      bausteine: [
        {
          titel: { de: 'Generische Funktion', en: 'Generic function' },
          info: { de: 'T wird bei jedem Aufruf neu ausgefüllt.', en: 'T is filled in anew on every call.' },
          code: js`
            function lastItem<T>(items: T[]): T | undefined {
              return items[items.length - 1]
            }
            console.log(lastItem([1, 2, 3]), lastItem(['a', 'b'])?.toUpperCase())
          `,
          ort: 'ende',
          kapitel: 'ts-generics',
        },
        {
          titel: { de: 'Generischer Typ', en: 'Generic type' },
          info: { de: 'Eine Hülle um beliebige Daten.', en: 'A wrapper around any data.' },
          code: js`
            type ApiResponse<T> = { ok: boolean; data: T }

            const numbersResponse: ApiResponse<number[]> = { ok: true, data: [1, 2, 3] }
            console.log(numbersResponse.data.length)
          `,
          ort: 'ende',
          kapitel: 'ts-generics',
        },
        {
          titel: { de: 'keyof-Zugriff', en: 'keyof access' },
          info: { de: 'Nur gültige Schlüssel - und der passende Rückgabetyp.', en: 'Only valid keys - and the matching return type.' },
          code: js`
            function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
              return obj[key]
            }

            const profile = { nickname: 'ada', level: 7 }
            console.log(getField(profile, 'nickname'), getField(profile, 'level') + 1)
          `,
          ort: 'ende',
          kapitel: 'ts-generics',
        },
      ],
    },
    {
      titel: { de: 'Utility Types', en: 'Utility types' },
      bausteine: [
        {
          titel: { de: 'Partial, Pick & Omit', en: 'Partial, Pick & Omit' },
          info: { de: 'Neue Typen aus einem vorhandenen ableiten.', en: 'Derive new types from an existing one.' },
          code: js`
            type Task = { id: number; title: string; done: boolean }
            type TaskPatch = Partial<Omit<Task, 'id'>>
            type TaskPreview = Pick<Task, 'id' | 'title'>

            const taskPatch: TaskPatch = { done: true }
            const taskPreview: TaskPreview = { id: 1, title: 'Try utility types' }
            console.log(taskPatch, taskPreview)
          `,
          ort: 'ende',
          kapitel: 'ts-utility',
        },
        {
          titel: { de: 'as const → Union', en: 'as const → union' },
          info: { de: 'Eine Werteliste als einzige Quelle für einen Typ.', en: 'A list of values as the single source of a type.' },
          code: js`
            const SIZES = ['small', 'medium', 'large'] as const
            type Size = (typeof SIZES)[number]

            const chosenSize: Size = 'medium'
            console.log(SIZES, chosenSize)
          `,
          ort: 'ende',
          kapitel: 'ts-utility',
        },
        {
          titel: { de: 'satisfies', en: 'satisfies' },
          info: { de: 'Prüfen, ohne den genauen Typ zu verlieren.', en: 'Check without losing the exact type.' },
          code: js`
            const palette = {
              primary: '#2563eb',
              danger: '#dc2626',
            } satisfies Record<string, string>

            console.log(palette.primary.toUpperCase())
          `,
          ort: 'ende',
          kapitel: 'ts-utility',
        },
      ],
    },
    {
      titel: { de: 'Klassen & Enums', en: 'Classes & enums' },
      bausteine: [
        {
          titel: { de: 'Klasse mit private', en: 'Class with private' },
          info: { de: 'Parameter-Properties, private und ein Getter.', en: 'Parameter properties, private and a getter.' },
          code: js`
            class Account {
              private balance = 0

              constructor(public readonly owner: string) {}

              deposit(amount: number) {
                this.balance += amount
              }

              get current() {
                return this.balance
              }
            }

            const account = new Account('Ada')
            account.deposit(50)
            console.log(account.owner, account.current)
          `,
          ort: 'ende',
          kapitel: 'ts-klassen',
        },
        {
          titel: { de: 'implements', en: 'implements' },
          info: { de: 'Eine Klasse erfüllt ein Interface.', en: 'A class fulfills an interface.' },
          code: js`
            interface Greeter {
              greet(name: string): string
            }

            class FriendlyGreeter implements Greeter {
              greet(name: string) {
                return \`Nice to see you, \${name}!\`
              }
            }

            const greeter: Greeter = new FriendlyGreeter()
            console.log(greeter.greet('Grace'))
          `,
          ort: 'ende',
          kapitel: 'ts-klassen',
        },
        {
          titel: { de: 'enum', en: 'enum' },
          info: { de: 'Benannte Konstanten - erzeugen echten JavaScript-Code.', en: 'Named constants - they produce real JavaScript code.' },
          code: js`
            enum Direction {
              Up = 'UP',
              Down = 'DOWN',
            }

            console.log(Direction.Up, Object.values(Direction))
          `,
          ort: 'ende',
          kapitel: 'ts-klassen',
        },
      ],
    },
    {
      titel: { de: 'Fortgeschritten', en: 'Advanced' },
      bausteine: [
        {
          titel: { de: 'Mapped Type', en: 'Mapped type' },
          info: { de: 'Für jeden Schlüssel ein neues Feld.', en: 'A new field for every key.' },
          code: js`
            type Flags<T> = { [K in keyof T]: boolean }

            type Profile = { email: string; phone: string }
            const verified: Flags<Profile> = { email: true, phone: false }
            console.log(verified)
          `,
          ort: 'ende',
          kapitel: 'ts-fortgeschritten',
        },
        {
          titel: { de: 'Template Literal Type', en: 'Template literal type' },
          info: { de: 'String-Typen aus anderen Typen bauen.', en: 'Build string types from other types.' },
          code: js`
            type Color = 'red' | 'blue'
            type Shade = 'light' | 'dark'
            type ColorClass = \`\${Shade}-\${Color}\`

            const colorClass: ColorClass = 'dark-blue'
            console.log(colorClass)
          `,
          ort: 'ende',
          kapitel: 'ts-fortgeschritten',
        },
        {
          titel: { de: 'async mit Promise<T>', en: 'async with Promise<T>' },
          info: { de: 'Eine async-Funktion mit ausdrücklichem Rückgabetyp.', en: 'An async function with an explicit return type.' },
          code: js`
            async function loadNumbers(): Promise<number[]> {
              await new Promise((resolve) => setTimeout(resolve, 300))
              return [4, 8, 15]
            }

            loadNumbers().then((numbers) => console.log('loaded', numbers))
          `,
          ort: 'ende',
          kapitel: 'ts-fortgeschritten',
        },
      ],
    },
  ],
}
