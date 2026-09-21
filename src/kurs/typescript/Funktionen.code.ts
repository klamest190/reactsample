import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 2.3 - Funktionen typisieren. */

export const beispiele = {
  'ts-funktionen-einstieg': {
    code: js`
      // Parameters need types, the return type is optional (it is inferred)
      function add(a: number, b: number): number {
        return a + b
      }

      // Arrow functions work the same way
      const multiply = (a: number, b: number) => a * b // return type: number

      console.log(add(2, 3), multiply(4, 5))
      // add('2', 3) // ❌ Argument of type 'string' is not assignable to parameter of type 'number'
    `,
  },
  'ts-funktionen-parameter': {
    code: js`
      // Optional parameter: may be left out - then it is undefined
      function greet(name: string, title?: string) {
        return title ? \`Hello \${title} \${name}\` : \`Hello \${name}\`
      }

      // Default value: the type is inferred from it (here: number)
      function repeat(text: string, times = 2) {
        return text.repeat(times)
      }

      // Rest parameter: any number of arguments, collected in an array
      function sum(...numbers: number[]) {
        return numbers.reduce((total, n) => total + n, 0)
      }

      console.log(greet('Ada'), '|', greet('Hopper', 'Admiral'))
      console.log(repeat('ha'), repeat('ho', 3))
      console.log(sum(), sum(1, 2, 3))
    `,
  },
  'ts-funktionen-rueckgabe': {
    code: js`
      type User = { id: number; name: string }

      const users: User[] = [
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Grace' },
      ]

      // An explicit return type is a promise - the compiler checks every return
      function findUser(id: number): User | undefined {
        return users.find((user) => user.id === id)
      }

      // void: the function returns nothing useful
      function log(message: string): void {
        console.log('[log]', message)
      }

      log(findUser(2)?.name ?? 'nobody')
      log(findUser(9)?.name ?? 'nobody')
    `,
  },
  'ts-funktionen-typen': {
    code: js`
      // A function type describes the parameters and the return value
      type Operation = (a: number, b: number) => number

      const plus: Operation = (a, b) => a + b // a and b are numbers automatically
      const minus: Operation = (a, b) => a - b

      // Callbacks: the parameter is itself a function
      function applyAll(values: number[], transform: (value: number) => number) {
        return values.map(transform)
      }

      console.log(plus(1, 2), minus(5, 3))
      console.log(applyAll([1, 2, 3], (value) => value * 10))

      // Methods in object types
      type Counter = {
        count: number
        increment: () => void
      }

      const counter: Counter = {
        count: 0,
        increment() {
          this.count++
        },
      }
      counter.increment()
      console.log('count:', counter.count)
    `,
  },
  'ts-funktionen-void-never': {
    code: js`
      // void as a callback type: the return value is ignored
      const collected: number[] = []
      ;[1, 2, 3].forEach((n) => collected.push(n)) // push returns a number - fine for void

      // never: this function never returns normally
      function fail(message: string): never {
        throw new Error(message)
      }

      function parseAge(input: string): number {
        const age = Number(input)
        if (Number.isNaN(age)) fail(\`"\${input}" is not a number\`)
        return age
      }

      console.log(collected, parseAge('42'))

      try {
        parseAge('abc')
      } catch (error) {
        // In catch, error is unknown - anything can be thrown
        if (error instanceof Error) console.log('Error:', error.message)
      }
    `,
  },
  'ts-funktionen-ueberladung': {
    code: js`
      // Overloads: several signatures, one implementation
      function format(value: number): string
      function format(value: Date): string
      function format(value: number | Date): string {
        if (typeof value === 'number') return value.toFixed(2)
        return value.toISOString().slice(0, 10)
      }

      console.log(format(3.14159), format(new Date(Date.UTC(2026, 0, 15))))
      // format('text') // ❌ No overload matches this call.
    `,
  },
  'ts-funktionen-uebung': {
    tipps: {
      de: [
        'Ein Funktionstyp sieht so aus: `(value: string) => string | null`.',
        '`minLength` bekommt eine Zahl und gibt einen `Validator` zurück: `function minLength(length: number): Validator`.',
        '`validate` bekommt einen Text und ein Array von Validatoren (`Validator[]`) und liefert `string[]`.',
      ],
      en: [
        'A function type looks like this: `(value: string) => string | null`.',
        '`minLength` takes a number and returns a `Validator`: `function minLength(length: number): Validator`.',
        '`validate` takes a string and an array of validators (`Validator[]`) and returns `string[]`.',
      ],
    },
    code: js`
      // A validator gets a value and returns an error message - or null if everything is fine
      type Validator = unknown

      const required: Validator = (value) => (value.trim() === '' ? 'Required' : null)

      function minLength(length) {
        return (value) => (value.length < length ? \`At least \${length} characters\` : null)
      }

      function validate(value, validators) {
        return validators.map((check) => check(value)).filter((message) => message !== null)
      }

      console.log(validate('', [required, minLength(3)]))
      console.log(validate('Ada', [required, minLength(3)]))
    `,
    loesung: js`
      // A validator gets a value and returns an error message - or null if everything is fine
      type Validator = (value: string) => string | null

      const required: Validator = (value) => (value.trim() === '' ? 'Required' : null)

      function minLength(length: number): Validator {
        return (value) => (value.length < length ? \`At least \${length} characters\` : null)
      }

      function validate(value: string, validators: Validator[]): string[] {
        return validators.map((check) => check(value)).filter((message) => message !== null)
      }

      console.log(validate('', [required, minLength(3)]))
      console.log(validate('Ada', [required, minLength(3)]))
    `,
    tests: [
      { name: "validate('', …)", ausdruck: "validate('', [required, minLength(3)])", erwartet: ['Required', 'At least 3 characters'] },
      { name: "validate('Ada', …)", ausdruck: "validate('Ada', [required, minLength(3)])", erwartet: [] },
      { name: "minLength(5)('abc')", ausdruck: "minLength(5)('abc')", erwartet: 'At least 5 characters' },
    ],
    typTests: [
      { name: { de: 'Validator ist ein Funktionstyp', en: 'Validator is a function type' }, code: "const shortCheck: Validator = (value) => (value.length > 3 ? null : 'short')" },
      { name: { de: 'Ein Validator liefert string oder null', en: 'A validator returns string or null' }, code: '// @ts-expect-error\nconst brokenCheck: Validator = (value: string) => value.length' },
      { name: { de: 'minLength verlangt eine Zahl', en: 'minLength requires a number' }, code: "// @ts-expect-error\nminLength('3')" },
      { name: { de: 'validate liefert string[]', en: 'validate returns string[]' }, code: "const messages: string[] = validate('x', [required])" },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  eventHandler: js`
    // Function types are everywhere in React - e.g. for event handler props:
    type ButtonProps = {
      label: string
      onClick: () => void
      onHover?: (x: number, y: number) => void
    }
  `,
}
