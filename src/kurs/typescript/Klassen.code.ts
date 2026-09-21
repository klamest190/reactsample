import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 2.7 - Klassen, Enums & Module. */

export const beispiele = {
  'ts-klassen-einstieg': {
    code: js`
      class BankAccount {
        // Fields are declared with their types
        readonly owner: string
        private balance = 0

        constructor(owner: string) {
          this.owner = owner
        }

        deposit(amount: number): void {
          if (amount <= 0) throw new Error('Amount must be positive')
          this.balance += amount
        }

        get currentBalance(): number {
          return this.balance
        }
      }

      const account = new BankAccount('Ada')
      account.deposit(50)
      // account.balance = 1_000_000 // ❌ Property 'balance' is private
      // account.owner = 'Eve' // ❌ read-only
      console.log(account.owner, account.currentBalance)
    `,
  },
  'ts-klassen-modifikatoren': {
    code: js`
      class Person {
        // Parameter properties: declare AND assign fields in one go
        constructor(
          public name: string,
          protected birthYear: number,
          private readonly id: string,
        ) {}

        describe() {
          return \`\${this.name} (#\${this.id})\`
        }
      }

      class Employee extends Person {
        constructor(name: string, birthYear: number, id: string, public role: string) {
          super(name, birthYear, id)
        }

        age(currentYear: number) {
          return currentYear - this.birthYear // protected: visible in subclasses
        }
      }

      const grace = new Employee('Grace', 1906, 'E-7', 'Admiral')
      console.log(grace.describe(), grace.role, grace.age(2026))
      // grace.birthYear // ❌ protected - only inside the class and its subclasses
      // grace.id // ❌ private - only inside Person

      // JavaScript's own #fields are private even at runtime
      class Vault {
        #code = 1234
        check(guess: number) {
          return guess === this.#code
        }
      }
      console.log(new Vault().check(1234))
    `,
  },
  'ts-klassen-implements': {
    code: js`
      interface Shape {
        name: string
        area(): number
      }

      // implements: the compiler checks that the class fulfills the interface
      class Circle implements Shape {
        name = 'circle'
        constructor(private radius: number) {}

        area() {
          return Math.PI * this.radius ** 2
        }
      }

      // abstract: a base class that cannot be instantiated itself
      abstract class Polygon implements Shape {
        abstract name: string
        abstract sides(): number

        area() {
          return 0
        }

        describe() {
          return \`\${this.name} with \${this.sides()} sides\`
        }
      }

      class Square extends Polygon {
        name = 'square'
        constructor(private size: number) {
          super()
        }

        sides() {
          return 4
        }

        override area() {
          return this.size ** 2
        }
      }

      const shapes: Shape[] = [new Circle(1), new Square(2)]
      for (const shape of shapes) console.log(shape.name, shape.area().toFixed(2))
      console.log(new Square(3).describe())
      // new Polygon() // ❌ Cannot create an instance of an abstract class
    `,
  },
  'ts-klassen-enums': {
    code: js`
      // An enum: a set of named constants
      enum Direction {
        Up = 'UP',
        Down = 'DOWN',
      }

      function move(direction: Direction) {
        return \`moving \${direction}\`
      }
      console.log(move(Direction.Up))
      // move('UP') // ❌ a string is not a Direction - even with the same value

      // Numeric enums count up from 0 - and also work backwards
      enum Level {
        Low,
        Medium,
        High,
      }
      console.log(Level.High, Level[2])

      // The modern alternative: a union of literals - no extra JavaScript
      type Status = 'active' | 'paused'
      function toggle(status: Status): Status {
        return status === 'active' ? 'paused' : 'active'
      }
      console.log(toggle('active'))
    `,
  },
  'ts-klassen-declare': {
    code: js`
      // declare: "this exists somewhere - trust me". Only a type, no code.
      // Typical for global variables that a script tag or the build tool provides.
      declare const APP_VERSION: string

      // In this editor nobody sets the variable - so check before using it:
      console.log(typeof APP_VERSION === 'undefined' ? 'no version set' : APP_VERSION)

      // declare also describes functions, classes and whole modules -
      // that is exactly what a .d.ts file contains:
      declare function formatMoney(cents: number, currency?: string): string
    `,
  },
  'ts-klassen-uebung': {
    tipps: {
      de: [
        'Beginne mit `class ShoppingCart implements CartLike {` - die Typprüfung sagt dir dann, welche Mitglieder noch fehlen.',
        '`private items: CartItem[] = []` und `constructor(public readonly owner: string) {}` erledigen Liste und Besitzer.',
        '`total` ist ein Getter: `get total() { return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0) }`.',
      ],
      en: [
        'Start with `class ShoppingCart implements CartLike {` - the type check then tells you which members are missing.',
        '`private items: CartItem[] = []` and `constructor(public readonly owner: string) {}` take care of the list and the owner.',
        '`total` is a getter: `get total() { return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0) }`.',
      ],
    },
    code: js`
      interface CartItem {
        readonly sku: string
        price: number
        quantity: number
      }

      interface CartLike {
        add(item: CartItem): void
        remove(sku: string): void
        readonly total: number
      }

      // Write the class here - see the task above
      class ShoppingCart {
      }

      const cart = new ShoppingCart('Ada')
      cart.add({ sku: 'mug', price: 9.5, quantity: 1 })
      cart.add({ sku: 'mug', price: 9.5, quantity: 2 })
      cart.add({ sku: 'pen', price: 1.5, quantity: 4 })
      console.log(cart.owner, cart.total)
    `,
    loesung: js`
      interface CartItem {
        readonly sku: string
        price: number
        quantity: number
      }

      interface CartLike {
        add(item: CartItem): void
        remove(sku: string): void
        readonly total: number
      }

      // Write the class here - see the task above
      class ShoppingCart implements CartLike {
        private items: CartItem[] = []

        constructor(public readonly owner: string) {}

        add(item: CartItem): void {
          const existing = this.items.find((entry) => entry.sku === item.sku)
          if (existing) existing.quantity += item.quantity
          else this.items.push({ ...item })
        }

        remove(sku: string): void {
          this.items = this.items.filter((entry) => entry.sku !== sku)
        }

        get total(): number {
          return this.items.reduce((sum, entry) => sum + entry.price * entry.quantity, 0)
        }
      }

      const cart = new ShoppingCart('Ada')
      cart.add({ sku: 'mug', price: 9.5, quantity: 1 })
      cart.add({ sku: 'mug', price: 9.5, quantity: 2 })
      cart.add({ sku: 'pen', price: 1.5, quantity: 4 })
      console.log(cart.owner, cart.total)
    `,
    tests: [
      { name: 'cart.total', ausdruck: 'cart.total', erwartet: 34.5 },
      { name: 'cart.owner', ausdruck: 'cart.owner', erwartet: 'Ada' },
      {
        name: { de: 'remove entfernt den Artikel', en: 'remove removes the item' },
        ausdruck: "(() => { const c = new ShoppingCart('B'); c.add({ sku: 'a', price: 2, quantity: 1 }); c.remove('a'); return c.total })()",
        erwartet: 0,
      },
    ],
    typTests: [
      { name: { de: 'ShoppingCart erfüllt CartLike', en: 'ShoppingCart fulfills CartLike' }, code: "const asCartLike: CartLike = new ShoppingCart('Test')" },
      { name: { de: 'items ist privat', en: 'items is private' }, code: "// @ts-expect-error - private\nnew ShoppingCart('Test').items" },
      { name: { de: 'owner ist readonly', en: 'owner is readonly' }, code: "// @ts-expect-error - readonly\nnew ShoppingCart('Test').owner = 'Eve'" },
      { name: { de: 'total kann man nur lesen', en: 'total can only be read' }, code: "// @ts-expect-error - a getter without a setter\nnew ShoppingCart('Test').total = 5" },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  module: js`
    // types.ts - types are exported like values
    export type Todo = { id: number; title: string; done: boolean }
    export interface User { name: string }

    // api.ts
    import type { Todo } from './types'            // types only - removed completely when compiling
    import { type User, fetchJson } from './http'   // mixed: a value and a type

    export async function loadTodos(): Promise<Todo[]> {
      return fetchJson('/api/todos')
    }
  `,
  dts: js`
    // For JavaScript libraries without their own types there are packages under @types:
    npm install lodash
    npm install --save-dev @types/lodash

    // A .d.ts file only contains types (declare) - e.g. src/vite-env.d.ts:
    /// <reference types="vite/client" />
    declare const APP_VERSION: string
  `,
}
