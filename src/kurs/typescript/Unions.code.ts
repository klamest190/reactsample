import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 2.4 - Unions & Narrowing. */

export const beispiele = {
  'ts-unions-einstieg': {
    code: js`
      type Status = 'loading' | 'success' | 'error'

      function message(status: Status) {
        if (status === 'loading') return '⏳ Loading …'
        if (status === 'success') return '✅ Done'
        return '❌ Something went wrong' // only 'error' is left here
      }

      console.log(message('loading'), message('error'))
      // message('done') // ❌ Argument of type '"done"' is not assignable to parameter of type 'Status'
    `,
  },
  'ts-unions-union': {
    code: js`
      // A union: the value is ONE of these types
      let id: number | string
      id = 42
      id = 'abc-42'

      // Without a check, only what ALL members have is allowed
      function printId(value: number | string) {
        // value.toUpperCase() // ❌ Property 'toUpperCase' does not exist on type 'number'
        console.log('ID:', value.toString())
      }
      printId(7)
      printId(id)

      // Literal types: exact values as types
      type Direction = 'up' | 'down' | 'left' | 'right'
      type Dice = 1 | 2 | 3 | 4 | 5 | 6

      const move: Direction = 'left'
      const roll: Dice = 6
      console.log(move, roll)
    `,
  },
  'ts-unions-typeof': {
    code: js`
      function pad(value: string | number, width: number) {
        if (typeof value === 'number') {
          // in here: value is a number
          return value.toFixed(1).padStart(width)
        }
        // after the if, only string is left
        return value.padStart(width)
      }

      function greet(name: string | null | undefined) {
        if (!name) return 'Hello stranger' // truthiness: null, undefined and '' are out
        return 'Hello ' + name.toUpperCase()
      }

      console.log(\`[\${pad(3, 6)}]\`, \`[\${pad('ab', 6)}]\`)
      console.log(greet(null), '|', greet('Ada'))
    `,
  },
  'ts-unions-in-instanceof': {
    code: js`
      type Fish = { name: string; swim: () => string }
      type Bird = { name: string; fly: () => string }

      function move(animal: Fish | Bird) {
        // "in" checks whether a property exists
        if ('swim' in animal) return animal.name + ': ' + animal.swim()
        return animal.name + ': ' + animal.fly()
      }

      const nemo: Fish = { name: 'Nemo', swim: () => 'splash' }
      const tweety: Bird = { name: 'Tweety', fly: () => 'flap flap' }
      console.log(move(nemo), '|', move(tweety))

      // instanceof works for classes - e.g. Date or Error
      function describe(value: Date | Error) {
        if (value instanceof Date) return 'Date: ' + value.getUTCFullYear()
        return 'Error: ' + value.message
      }

      console.log(describe(new Date(Date.UTC(2026, 5, 1))), '|', describe(new Error('oops')))
    `,
  },
  'ts-unions-discriminated': {
    code: js`
      // Every variant has the same field "kind" - each with its own literal value
      type Shape =
        | { kind: 'circle'; radius: number }
        | { kind: 'rectangle'; width: number; height: number }
        | { kind: 'square'; size: number }

      function area(shape: Shape): number {
        switch (shape.kind) {
          case 'circle':
            return Math.PI * shape.radius ** 2 // only circles have a radius
          case 'rectangle':
            return shape.width * shape.height
          case 'square':
            return shape.size ** 2
        }
      }

      const shapes: Shape[] = [
        { kind: 'circle', radius: 1 },
        { kind: 'rectangle', width: 2, height: 3 },
        { kind: 'square', size: 4 },
      ]

      console.log(shapes.map((shape) => area(shape).toFixed(2)))
    `,
  },
  'ts-unions-never': {
    code: js`
      type Shape =
        | { kind: 'circle'; radius: number }
        | { kind: 'square'; size: number }
        // | { kind: 'triangle'; base: number; height: number }
      // Remove the // above - the type check shows where the triangle is still missing.

      function assertNever(value: never): never {
        throw new Error('Unhandled case: ' + JSON.stringify(value))
      }

      function describe(shape: Shape) {
        switch (shape.kind) {
          case 'circle':
            return \`circle with radius \${shape.radius}\`
          case 'square':
            return \`square with size \${shape.size}\`
          default:
            // All cases handled? Then shape is never here. Otherwise: type error.
            return assertNever(shape)
        }
      }

      console.log(describe({ kind: 'circle', radius: 2 }))
      console.log(describe({ kind: 'square', size: 3 }))
    `,
  },
  'ts-unions-guard': {
    code: js`
      type User = { name: string; email: string }

      // A type guard returns a boolean - and tells TypeScript what it means
      function isUser(value: unknown): value is User {
        return (
          typeof value === 'object' &&
          value !== null &&
          'name' in value &&
          typeof value.name === 'string' &&
          'email' in value &&
          typeof value.email === 'string'
        )
      }

      const data: unknown = JSON.parse('{ "name": "Ada", "email": "ada@example.com" }')
      if (isUser(data)) {
        console.log(data.email) // data is a User in here
      }

      // Great for filter, too: removes null AND fixes the type
      const maybeNames = ['Ada', null, 'Grace', null]
      const names: string[] = maybeNames.filter((name): name is string => name !== null)
      console.log(names)
    `,
  },
  'ts-unions-null': {
    code: js`
      function findPosition(list: string[], item: string): number | null {
        const index = list.indexOf(item)
        return index === -1 ? null : index
      }

      const fruits = ['apple', 'pear']
      const position = findPosition(fruits, 'pear')

      // console.log(position + 1) // ❌ 'position' is possibly 'null'
      if (position !== null) console.log('found at place', position + 1)

      console.log(findPosition(fruits, 'kiwi') ?? 'not found')

      // The ! operator says "trust me, this is not null/undefined" - it checks nothing at runtime!
      const first = fruits.at(0)! // string instead of string | undefined
      console.log(first.toUpperCase())
    `,
  },
  'ts-unions-uebung': {
    tipps: {
      de: [
        'Eine Discriminated Union: drei Objekttypen mit `|` verbunden, jeder mit `type: \'card\'`, `type: \'paypal\'` bzw. `type: \'invoice\'`.',
        'In `describe` hilft `switch (payment.type)` - in jedem `case` kennt TypeScript die Felder der Variante.',
        'Die letzten vier Ziffern: `payment.number.slice(-4)`.',
      ],
      en: [
        'A discriminated union: three object types joined with `|`, each with `type: \'card\'`, `type: \'paypal\'` or `type: \'invoice\'`.',
        'In `describe`, `switch (payment.type)` helps - in each `case` TypeScript knows the fields of that variant.',
        'The last four digits: `payment.number.slice(-4)`.',
      ],
    },
    code: js`
      // 1. The three payment methods as a discriminated union - the common field is "type":
      //    card:    number (string), holder (string)
      //    paypal:  email (string)
      //    invoice: dueDays (number)
      type Payment = unknown

      // 2. "Card ending in 1234" | "PayPal (ada@example.com)" | "Invoice, due in 14 days"
      function describe(payment: Payment): string {
        return ''
      }

      // 3. Fees: card 2 %, paypal 3 %, invoice none
      function fee(payment: Payment, amount: number): number {
        return 0
      }

      console.log(describe({ type: 'paypal', email: 'ada@example.com' }))
      console.log(fee({ type: 'invoice', dueDays: 14 }, 100))
    `,
    loesung: js`
      // 1. The three payment methods as a discriminated union - the common field is "type":
      type Payment =
        | { type: 'card'; number: string; holder: string }
        | { type: 'paypal'; email: string }
        | { type: 'invoice'; dueDays: number }

      // 2. "Card ending in 1234" | "PayPal (ada@example.com)" | "Invoice, due in 14 days"
      function describe(payment: Payment): string {
        switch (payment.type) {
          case 'card':
            return \`Card ending in \${payment.number.slice(-4)}\`
          case 'paypal':
            return \`PayPal (\${payment.email})\`
          case 'invoice':
            return \`Invoice, due in \${payment.dueDays} days\`
        }
      }

      // 3. Fees: card 2 %, paypal 3 %, invoice none
      function fee(payment: Payment, amount: number): number {
        switch (payment.type) {
          case 'card':
            return amount * 0.02
          case 'paypal':
            return amount * 0.03
          case 'invoice':
            return 0
        }
      }

      console.log(describe({ type: 'paypal', email: 'ada@example.com' }))
      console.log(fee({ type: 'invoice', dueDays: 14 }, 100))
    `,
    tests: [
      { name: 'describe(card)', ausdruck: "describe({ type: 'card', number: '4111111111111234', holder: 'Ada' })", erwartet: 'Card ending in 1234' },
      { name: 'describe(paypal)', ausdruck: "describe({ type: 'paypal', email: 'ada@example.com' })", erwartet: 'PayPal (ada@example.com)' },
      { name: 'describe(invoice)', ausdruck: "describe({ type: 'invoice', dueDays: 14 })", erwartet: 'Invoice, due in 14 days' },
      { name: 'fee(card, 250)', ausdruck: "fee({ type: 'card', number: '1', holder: 'A' }, 250)", erwartet: 5 },
      { name: 'fee(paypal, 250)', ausdruck: "fee({ type: 'paypal', email: 'a@b.c' }, 250)", erwartet: 7.5 },
    ],
    typTests: [
      {
        name: { de: 'Alle drei Varianten sind gültig', en: 'All three variants are valid' },
        code: "const allPayments: Payment[] = [{ type: 'card', number: '4111', holder: 'Ada' }, { type: 'paypal', email: 'a@b.c' }, { type: 'invoice', dueDays: 30 }]",
      },
      { name: { de: 'Eine Karte braucht auch holder', en: 'A card also needs a holder' }, code: "// @ts-expect-error\nconst incompleteCard: Payment = { type: 'card', number: '4111' }" },
      { name: { de: 'Unbekannte Zahlungsarten werden abgelehnt', en: 'Unknown payment methods are rejected' }, code: "// @ts-expect-error\nconst bitcoin: Payment = { type: 'bitcoin', wallet: 'abc' }" },
      { name: { de: 'Eine Rechnung hat kein email-Feld', en: 'An invoice has no email field' }, code: "// @ts-expect-error\nconst wrongInvoice: Payment = { type: 'invoice', dueDays: 14, email: 'x' }" },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  eingrenzen: js`
    typeof value === 'string'     // primitive types: string, number, boolean, …
    value instanceof Date         // instances of a class
    'swim' in animal              // does the object have this property?
    shape.kind === 'circle'       // compare the discriminant of a union
    if (value)  /  value != null  // truthiness / rule out null and undefined
    isUser(value)                 // your own type guard: value is User
  `,
  react: js`
    // You will see this pattern again and again in React - e.g. for loading state:
    type State =
      | { status: 'loading' }
      | { status: 'error'; message: string }
      | { status: 'success'; data: string[] }

    // Impossible combinations (data AND error at the same time) can't even be written down.
  `,
}
