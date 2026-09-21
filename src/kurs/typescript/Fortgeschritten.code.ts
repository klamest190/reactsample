import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 2.8 - Fortgeschrittene Typen & Praxis. */

export const beispiele = {
  'ts-fortgeschritten-einstieg': {
    code: js`
      type User = { name: string; age: number; email: string }

      // A mapped type goes over every key of a type - like map() for types
      type Flags<T> = { [K in keyof T]: boolean }

      const changed: Flags<User> = { name: true, age: false, email: false }
      // Forget a key or add a wrong one - the type check notices it.

      console.log(changed)
    `,
  },
  'ts-fortgeschritten-mapped': {
    code: js`
      type Todo = { title: string; done: boolean }

      // Partial and Readonly are mapped types, too - here written by hand:
      type MyPartial<T> = { [K in keyof T]?: T[K] }
      type MyReadonly<T> = { readonly [K in keyof T]: T[K] }
      // A minus removes a modifier: -readonly, -?
      type Mutable<T> = { -readonly [K in keyof T]: T[K] }

      const patch: MyPartial<Todo> = { done: true }
      const frozen: MyReadonly<Todo> = { title: 'Read', done: false }
      // frozen.done = true // ❌ read-only

      const editable: Mutable<MyReadonly<Todo>> = { ...frozen }
      editable.done = true

      // Practical: one optional error message per form field
      type FormErrors<T> = { [K in keyof T]?: string }
      const errors: FormErrors<Todo> = { title: 'Title is required' }

      console.log(patch, frozen, editable, errors)
    `,
  },
  'ts-fortgeschritten-conditional': {
    code: js`
      // Conditional type: "if T fits, then X, otherwise Y" - for types
      type IsString<T> = T extends string ? 'yes' : 'no'
      const a: IsString<'hello'> = 'yes'
      const b: IsString<42> = 'no'

      // infer pulls a part out of a type
      type ElementOf<T> = T extends (infer Item)[] ? Item : never
      type Unwrap<T> = T extends Promise<infer Value> ? Value : T

      type Numbers = ElementOf<number[]> // number
      type Loaded = Unwrap<Promise<string>> // string
      type Plain = Unwrap<boolean> // boolean

      const n: Numbers = 1
      const s: Loaded = 'done'
      const p: Plain = true

      // For unions, conditional types work on every member separately
      type WithoutNull<T> = T extends null | undefined ? never : T
      const value: WithoutNull<string | null | undefined> = 'never null'

      console.log(a, b, n, s, p, value)
    `,
  },
  'ts-fortgeschritten-template': {
    code: js`
      type Size = 'sm' | 'md' | 'lg'
      type Color = 'red' | 'blue'

      // Template literal types build new string types - every combination
      type ClassName = \`\${Color}-\${Size}\` // 'red-sm' | 'red-md' | … (6 in total)

      type EventName<T extends string> = \`on\${Capitalize<T>}\`
      type ClickHandler = EventName<'click'> // 'onClick'

      const button: ClassName = 'blue-lg'
      // const wrong: ClassName = 'green-lg' // ❌
      const handlerName: ClickHandler = 'onClick'

      // A pattern for IDs: only strings that start with "user_" followed by a number
      type UserId = \`user_\${number}\`
      function loadUser(id: UserId) {
        return 'loading ' + id
      }

      console.log(button, handlerName, loadUser('user_42'))
      // loadUser('42') // ❌ '"42"' is not assignable to '\`user_\${number}\`'
    `,
  },
  'ts-fortgeschritten-assertions': {
    code: js`
      // as: "I know better than the compiler" - and nothing is checked at runtime!
      const input: unknown = '42'
      const length = (input as string).length // ok here - input really is a string

      // Dangerous: as can lie
      const notANumber = 'hello' as unknown as number
      console.log(length, typeof notANumber) // "string" - the type was a lie

      // In the browser: querySelector returns Element | null.
      // Tempting:  const app = document.querySelector('#app') as HTMLDivElement
      // Safer: check instead of asserting
      const app = document.querySelector('#app')
      if (app instanceof HTMLDivElement) {
        console.log('found a div with the id', app.id)
      }
    `,
  },
  'ts-fortgeschritten-async': {
    code: js`
      type Post = { id: number; title: string }

      // An async function always returns a Promise<…>
      async function loadPost(id: number): Promise<Post> {
        await new Promise((resolve) => setTimeout(resolve, 100)) // pretend to wait for a server
        return { id, title: \`Post #\${id}\` }
      }

      async function main() {
        const post = await loadPost(1) // Post - await unwraps the promise
        console.log(post.title)

        const posts = await Promise.all([loadPost(2), loadPost(3)]) // Post[]
        console.log(posts.map((p) => p.id))
      }

      main()
    `,
  },
  'ts-fortgeschritten-validieren': {
    code: js`
      type Product = { id: number; name: string; price: number }

      // What comes from the server is unknown - TypeScript cannot check it for you
      function parseProduct(data: unknown): Product {
        if (typeof data !== 'object' || data === null) throw new Error('not an object')
        const { id, name, price } = data as Record<string, unknown>
        if (typeof id !== 'number') throw new Error('id must be a number')
        if (typeof name !== 'string') throw new Error('name must be a string')
        if (typeof price !== 'number') throw new Error('price must be a number')
        return { id, name, price } // from here on the type is really true
      }

      // Pretends to be response.json() - once correct, once broken
      const good: unknown = JSON.parse('{ "id": 1, "name": "Mug", "price": 9.5 }')
      const broken: unknown = JSON.parse('{ "id": "1", "name": "Mug" }')

      console.log(parseProduct(good))
      try {
        parseProduct(broken)
      } catch (error) {
        console.log('Rejected:', error instanceof Error ? error.message : error)
      }
    `,
  },
  'ts-fortgeschritten-uebung': {
    tipps: {
      de: [
        'Beide Methoden brauchen einen eigenen Typparameter für das Event: `on<K extends keyof E>(event: K, handler: (data: E[K]) => void): void`.',
        '`emit` sieht genauso aus - nur mit `data: E[K]` statt eines Handlers.',
        'Für `HandlerProps` hilft ein Mapped Type, der die Schlüssel mit `as` umbenennt. Der neue Name ist ein Template Literal Type aus `on` und `Capitalize<string & K>`, der Wert ist `(data: E[K]) => void`.',
      ],
      en: [
        'Both methods need their own type parameter for the event: `on<K extends keyof E>(event: K, handler: (data: E[K]) => void): void`.',
        '`emit` looks the same - just with `data: E[K]` instead of a handler.',
        'For `HandlerProps`, a mapped type that renames the keys with `as` helps. The new name is a template literal type made of `on` and `Capitalize<string & K>`, the value is `(data: E[K]) => void`.',
      ],
    },
    code: js`
      // Which events exist - and which data each one carries
      type Events = {
        login: { user: string }
        logout: undefined
        purchase: { item: string; price: number }
      }

      // 1. Make on and emit type-safe
      class Emitter<E> {
        private handlers: { [K in keyof E]?: ((data: E[K]) => void)[] } = {}

        on(event, handler) {
          const list = this.handlers[event] ?? []
          this.handlers[event] = [...list, handler]
        }

        emit(event, data) {
          for (const handler of this.handlers[event] ?? []) handler(data)
        }
      }

      // 2. One prop per event: onLogin, onLogout, onPurchase - each with the right handler
      type HandlerProps<E> = unknown

      const shop = new Emitter<Events>()
      shop.on('login', (data) => console.log('Welcome', data.user))
      shop.on('purchase', (data) => console.log(\`\${data.item} for \${data.price} €\`))
      shop.emit('login', { user: 'Ada' })
      shop.emit('purchase', { item: 'Mug', price: 9.5 })
    `,
    loesung: js`
      // Which events exist - and which data each one carries
      type Events = {
        login: { user: string }
        logout: undefined
        purchase: { item: string; price: number }
      }

      // 1. Make on and emit type-safe
      class Emitter<E> {
        private handlers: { [K in keyof E]?: ((data: E[K]) => void)[] } = {}

        on<K extends keyof E>(event: K, handler: (data: E[K]) => void): void {
          const list = this.handlers[event] ?? []
          this.handlers[event] = [...list, handler]
        }

        emit<K extends keyof E>(event: K, data: E[K]): void {
          for (const handler of this.handlers[event] ?? []) handler(data)
        }
      }

      // 2. One prop per event: onLogin, onLogout, onPurchase - each with the right handler
      type HandlerProps<E> = {
        [K in keyof E as \`on\${Capitalize<string & K>}\`]: (data: E[K]) => void
      }

      const shop = new Emitter<Events>()
      shop.on('login', (data) => console.log('Welcome', data.user))
      shop.on('purchase', (data) => console.log(\`\${data.item} for \${data.price} €\`))
      shop.emit('login', { user: 'Ada' })
      shop.emit('purchase', { item: 'Mug', price: 9.5 })
    `,
    tests: [
      {
        name: { de: 'emit ruft die Handler des Events auf', en: 'emit calls the handlers of the event' },
        ausdruck:
          "(() => { const e = new Emitter(); const got = []; e.on('purchase', (d) => got.push(d.price)); e.on('purchase', (d) => got.push(d.item)); e.emit('purchase', { item: 'mug', price: 9.5 }); e.emit('login', { user: 'Ada' }); return got })()",
        erwartet: [9.5, 'mug'],
      },
    ],
    typTests: [
      { name: { de: 'Der Handler kennt die Daten', en: 'The handler knows the data' }, code: "declare const emitterA: Emitter<Events>\nemitterA.on('login', (data) => data.user.toUpperCase())" },
      { name: { de: 'Nur bekannte Events', en: 'Only known events' }, code: "declare const emitterB: Emitter<Events>\n// @ts-expect-error - there is no signup event\nemitterB.on('signup', () => {})" },
      { name: { de: 'emit prüft die Daten', en: 'emit checks the data' }, code: "declare const emitterC: Emitter<Events>\n// @ts-expect-error - price is missing\nemitterC.emit('purchase', { item: 'Mug' })" },
      {
        name: { de: 'HandlerProps: ein Prop pro Event', en: 'HandlerProps: one prop per event' },
        code: "const allHandlers: HandlerProps<Events> = { onLogin: (data) => data.user, onLogout: () => {}, onPurchase: (data) => data.price }\n// @ts-expect-error - onLogout and onPurchase are missing\nconst someHandlers: HandlerProps<Events> = { onLogin: () => {} }",
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  zod: js`
    // Libraries like zod describe the check ONCE - the type is derived from it:
    import { z } from 'zod'

    const Product = z.object({ id: z.number(), name: z.string(), price: z.number() })
    type Product = z.infer<typeof Product>   // { id: number; name: string; price: number }

    const product = Product.parse(await response.json())   // throws if the data is wrong
  `,
  tsconfig: js`
    {
      "compilerOptions": {
        "strict": true,                      // the basis: noImplicitAny, strictNullChecks, …
        "noUncheckedIndexedAccess": true,    // list[0] is T | undefined - finds many bugs
        "noUnusedLocals": true,              // unused variables are errors
        "noFallthroughCasesInSwitch": true,  // a case without break/return is an error
        "verbatimModuleSyntax": true,        // import type for types - required
        "target": "ES2023",
        "module": "ESNext",
        "moduleResolution": "bundler",       // resolve imports the way Vite does
        "jsx": "react-jsx",
        "noEmit": true                       // tsc only checks, Vite builds
      }
    }
  `,
}
