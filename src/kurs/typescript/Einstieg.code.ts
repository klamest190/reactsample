import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für Kapitel 2.1 - Warum TypeScript?
 * Alle laufen mit <TryIt modus="ts">: Typen werden entfernt, das JavaScript läuft, nebenher prüft der Compiler.
 */

export const beispiele = {
  'ts-start-einstieg': {
    code: js`
      function greet(name: string, times: number) {
        return \`Hello \${name}! \`.repeat(times)
      }

      console.log(greet('Ada', 2))

      // Remove the // and watch the type check below the editor:
      // console.log(greet(2, 'Ada'))
    `,
  },
  'ts-start-tippfehler': {
    code: js`
      type User = {
        firstName: string
        age: number
      }

      const user: User = { firstName: 'Ada', age: 36 }

      // In plain JavaScript this typo only shows up at runtime - as a crash.
      // TypeScript finds it while you type. Remove the // and try it:
      // console.log(user.firstname.toUpperCase())

      console.log(user.firstName.toUpperCase(), user.age + 1)
    `,
  },
  'ts-start-fehler': {
    code: js`
      function area(width: number, height: number) {
        return width * height
      }

      // The type check complains about this line ...
      const result = area(3, '4')

      // ... but the program runs anyway: JavaScript computes 3 * '4' = 12.
      console.log(result)
      // With area(3, 'four') the result would be NaN - and plain JS would not warn you.
    `,
  },
  'ts-start-annotation': {
    code: js`
      // Annotation: name, colon, type
      let city: string = 'Berlin'

      // Inference: TypeScript derives the type from the value
      let population = 3_700_000 // number
      const capital = 'Berlin' // the literal type 'Berlin' - a const never changes

      city = 'Hamburg' // ok, still a string
      // population = 'many' // ❌ Type 'string' is not assignable to type 'number'

      // At runtime only the JavaScript types remain:
      console.log(typeof city, typeof population, typeof capital)
    `,
  },
  'ts-start-grundtypen': {
    code: js`
      const title: string = 'TypeScript'
      const version: number = 6.0
      const isStrict: boolean = true
      const nothing: null = null
      const notSet: undefined = undefined

      // Arrays: two spellings, same meaning
      const scores: number[] = [90, 72, 100]
      const names: Array<string> = ['Ada', 'Grace']
      // scores.push('high') // ❌ 'string' is not assignable to 'number'

      // Tuple: fixed length, every position has its own type
      const point: [number, number] = [3, 4]
      const entry: [string, number] = ['Ada', 36]

      // Destructuring keeps the types: key is a string, value a number
      const [key, value] = entry

      console.log(title, version, isStrict, nothing, notSet)
      console.log(scores, names, point)
      console.log(key.toUpperCase(), value.toFixed(1))
    `,
  },
  'ts-start-any-unknown': {
    code: js`
      // any switches the type check off - everything is allowed, even nonsense
      const risky: any = 'hello'
      // risky.toFixed(2) would compile - and crash at runtime!
      console.log(risky.length)

      // unknown means "could be anything" - you have to check before using it
      const data: unknown = JSON.parse('{ "count": 3 }')
      // console.log(data.count) // ❌ 'data' is of type 'unknown'

      if (typeof data === 'object' && data !== null && 'count' in data) {
        console.log('count:', data.count)
      }

      function shout(value: unknown) {
        if (typeof value === 'string') {
          return value.toUpperCase() // in here, value is a string
        }
        return String(value)
      }

      console.log(shout('hi'), shout(42))
    `,
  },
  'ts-start-strict': {
    code: js`
      // With "strict": true - the default for new projects - ...

      // 1. parameters need a type. Without one they would silently become any.
      function double(n: number) {
        return n * 2
      }

      // 2. null and undefined are types of their own.
      const names = ['Ada', 'Grace', 'Linus']
      const found = names.find((n) => n.startsWith('G')) // string | undefined

      // console.log(found.toUpperCase()) // ❌ 'found' is possibly 'undefined'
      console.log(found?.toUpperCase(), double(21))
    `,
  },
  'ts-start-uebung': {
    tipps: {
      de: [
        'Jeder Parameter braucht einen Typ: `amount: number`, `currency: string`, `prices: number[]`.',
        'Ohne Angabe macht TypeScript aus `[a, b]` ein `number[]`. Für ein Tupel schreibst du den Rückgabetyp hin: `function minMax(values: number[]): [number, number]`.',
      ],
      en: [
        'Every parameter needs a type: `amount: number`, `currency: string`, `prices: number[]`.',
        'Without help, TypeScript turns `[a, b]` into `number[]`. For a tuple, write the return type: `function minMax(values: number[]): [number, number]`.',
      ],
    },
    code: js`
      function formatPrice(amount, currency) {
        return amount.toFixed(2) + ' ' + currency
      }

      function total(prices) {
        return prices.reduce((sum, price) => sum + price, 0)
      }

      function minMax(values) {
        return [Math.min(...values), Math.max(...values)]
      }

      const cart = [19.99, 5, 0.5]
      console.log(formatPrice(total(cart), 'EUR'))
      console.log(minMax(cart))
    `,
    loesung: js`
      function formatPrice(amount: number, currency: string): string {
        return amount.toFixed(2) + ' ' + currency
      }

      function total(prices: number[]): number {
        return prices.reduce((sum, price) => sum + price, 0)
      }

      function minMax(values: number[]): [number, number] {
        return [Math.min(...values), Math.max(...values)]
      }

      const cart = [19.99, 5, 0.5]
      console.log(formatPrice(total(cart), 'EUR'))
      console.log(minMax(cart))
    `,
    tests: [
      { name: "formatPrice(24.49, 'EUR')", ausdruck: "formatPrice(24.49, 'EUR')", erwartet: '24.49 EUR' },
      { name: 'total([1, 2, 3])', ausdruck: 'total([1, 2, 3])', erwartet: 6 },
      { name: 'minMax([3, 1, 2])', ausdruck: 'minMax([3, 1, 2])', erwartet: [1, 3] },
    ],
    typTests: [
      { name: { de: 'formatPrice lehnt einen Text als Betrag ab', en: 'formatPrice rejects a string as amount' }, code: "// @ts-expect-error\nformatPrice('10', 'EUR')" },
      { name: { de: 'total nimmt nur Zahlen-Arrays', en: 'total only takes number arrays' }, code: "// @ts-expect-error\ntotal(['1', '2'])" },
      { name: { de: 'minMax liefert ein Tupel [number, number]', en: 'minMax returns a tuple [number, number]' }, code: 'const minMaxResult: [number, number] = minMax([3, 1, 2])' },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  ablauf: js`
    app.ts  ──►  TypeScript compiler (tsc)  ──►  type errors?  (only reported)
       │
       └───►  types removed (Vite, sucrase, tsc)  ──►  app.js  ──►  browser / Node
  `,
  entfernt: js`
    // What you write:
    function toFahrenheit(celsius: number): number {
      return celsius * 1.8 + 32
    }

    // What actually runs - the types are simply gone:
    function toFahrenheit(celsius) {
      return celsius * 1.8 + 32
    }
  `,
  tsconfig: js`
    // tsconfig.json (excerpt)
    {
      "compilerOptions": {
        "strict": true,            // all strict checks at once - always switch it on
        "target": "ES2023",        // which JavaScript version is produced
        "noEmit": true             // only check - Vite does the translating
      }
    }
  `,
}
