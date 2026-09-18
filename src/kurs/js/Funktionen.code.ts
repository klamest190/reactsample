import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'js-funktionen-einstieg': {
    code: js`
      function greet(name) {
        return \`Hello, \${name}!\`
      }

      console.log(greet('Ada'))
      console.log(greet('Grace'))
    `,
  },
  'js-funktionen-1': {
    code: js`
      // Function declaration
      function add(a, b) {
        return a + b
      }

      // Default parameter: used when nothing is passed
      function greet(name = 'stranger') {
        return \`Hello \${name}!\`
      }

      // Rest parameter: any number of arguments as an array
      function sum(...numbers) {
        let result = 0
        for (const n of numbers) result += n
        return result
      }

      console.log(add(2, 3))
      console.log(greet('Ada'))
      console.log(greet())
      console.log(sum(1, 2, 3, 4))
    `,
  },
  'js-funktionen-2': {
    code: js`
      const square = (n) => n * n
      const isEven = (n) => n % 2 === 0
      const person = (name, age) => ({ name, age })

      console.log(square(7))
      console.log(isEven(4), isEven(7))
      console.log(person('Grace', 85))

      // What happens without the parentheses around the object?
      const broken = (name) => { name }
      console.log(broken('Ada'))
    `,
  },
  'js-funktionen-3': {
    code: js`
      function repeat(times, action) {
        for (let i = 1; i <= times; i++) {
          action(i)  // call the function that was passed in
        }
      }

      repeat(3, (number) => console.log('Run', number))

      // Important: PASSING a function vs. CALLING it
      const sayHello = () => 'Hello!'
      console.log(sayHello)     // the function itself
      console.log(sayHello())   // its result

      // setTimeout calls the callback later
      setTimeout(() => console.log('...one second later'), 1000)
    `,
  },
  'js-funktionen-4': {
    code: js`
      function createCounter() {
        let count = 0  // "private" - not reachable from outside

        return () => {
          count = count + 1
          return count
        }
      }

      const counterA = createCounter()
      const counterB = createCounter()

      console.log(counterA())  // 1
      console.log(counterA())  // 2
      console.log(counterA())  // 3
      console.log(counterB())  // 1 - its own, independent count!
    `,
  },
  'js-funktionen-uebung': {
    tipps: {
      de: [
        '`total` und `count` sind lokale Variablen in `createCart` - von außen unerreichbar.',
        'Gib ein Objekt mit drei Funktionen zurück. Sie „sehen“ die Variablen dank Closure.',
        '`add: (price) => { total += price; count += 1 }`',
      ],
      en: [
        '`total` and `count` are local variables in `createCart` - unreachable from outside.',
        'Return an object with three functions. Thanks to closures they “see” the variables.',
        '`add: (price) => { total += price; count += 1 }`',
      ],
    },
    code: js`
      function createCart() {
        // Your code

        return {
          add: (price) => {},
          total: () => {},
          count: () => {},
        }
      }

      const cart = createCart()
      cart.add(10)
      cart.add(5.5)
      console.log(cart.total(), cart.count())
    `,
    loesung: js`
      function createCart() {
        let total = 0
        let count = 0

        return {
          add: (price) => {
            total += price
            count += 1
          },
          total: () => total,
          count: () => count,
        }
      }

      const cart = createCart()
      cart.add(10)
      cart.add(5.5)
      console.log(cart.total(), cart.count())
    `,
    tests: [
      { name: { de: 'Ein neuer Warenkorb ist leer', en: 'A new cart is empty' }, ausdruck: 'createCart().total() === 0 && createCart().count() === 0' },
      { name: { de: 'total() addiert alle Preise', en: 'total() adds up all prices' }, ausdruck: '(() => { const c = createCart(); c.add(3); c.add(4); return c.total() })()', erwartet: 7 },
      { name: { de: 'count() zählt die Artikel', en: 'count() counts the items' }, ausdruck: '(() => { const c = createCart(); c.add(3); c.add(4); c.add(1); return c.count() })()', erwartet: 3 },
      { name: { de: 'Zwei Warenkörbe sind unabhängig', en: 'Two carts are independent' }, ausdruck: '(() => { const a = createCart(); const b = createCart(); a.add(10); return b.total() })()', erwartet: 0 },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    function double(x) { return x * 2 }   // classic
    const double = (x) => { return x * 2 } // arrow with body
    const double = (x) => x * 2            // arrow with implicit return
    const double = x => x * 2              // one parameter: parentheses optional

    // Pitfall: returning an object implicitly needs parentheses
    const createPoint = (x, y) => ({ x, y })
  `,
}
