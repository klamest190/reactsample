import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

const products = js`
  const products = [
    { id: 1, name: 'Keyboard', price: 49, category: 'tech', stock: 12 },
    { id: 2, name: 'Coffee mug', price: 12, category: 'kitchen', stock: 0 },
    { id: 3, name: 'Monitor', price: 199, category: 'tech', stock: 4 },
    { id: 4, name: 'Teapot', price: 25, category: 'kitchen', stock: 7 },
    { id: 5, name: 'Mouse', price: 29, category: 'tech', stock: 0 },
  ]
`

export const beispiele = {
  'js-arrays-einstieg': {
    code: js`
      const numbers = [1, 2, 3]
      const doubled = numbers.map((n) => n * 2)

      console.log(numbers)
      console.log(doubled)
    `,
  },
  'js-arrays-1': {
    code: js`
      const colors = ['red', 'green', 'blue']

      console.log(colors[0])              // first element
      console.log(colors.at(-1))          // last element
      console.log(colors.length)
      console.log(colors.includes('green'))
      console.log(colors.indexOf('blue'))
      console.log(colors.join(' | '))

      // Arrays can contain anything - including objects
      const people = [{ name: 'Ada' }, { name: 'Alan' }]
      console.log(people[1].name)
    `,
  },
  'js-arrays-2': {
    code: products +
    '\n\n' +
    js`
      // map: every product -> its name
      const names = products.map((p) => p.name)
      console.log(names)

      // filter: only products in stock
      const available = products.filter((p) => p.stock > 0)
      console.log(available.map((p) => p.name))

      // reduce: total value of the stock
      const stockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
      console.log('Stock value:', stockValue, '€')

      // Chaining: names of the cheap tech products
      const cheapTech = products
        .filter((p) => p.category === 'tech')
        .filter((p) => p.price < 100)
        .map((p) => \`\${p.name} (\${p.price} €)\`)
      console.log(cheapTech)
    `,
  },
  'js-arrays-3': {
    code: products +
    '\n\n' +
    js`
      // find: the FIRST matching element (or undefined)
      console.log(products.find((p) => p.id === 3))

      // findIndex: its position (or -1)
      console.log(products.findIndex((p) => p.name === 'Teapot'))

      // some: is there AT LEAST ONE match?
      console.log(products.some((p) => p.stock === 0))

      // every: do ALL match?
      console.log(products.every((p) => p.price > 10))
    `,
  },
  'js-arrays-4': {
    code: js`
      const numbers = [3, 1, 2]

      const sorted = numbers.toSorted((a, b) => a - b)
      console.log('new:', sorted, 'original:', numbers)

      numbers.sort((a, b) => a - b)
      console.log('after sort() the original is changed:', numbers)

      // Spread syntax: new array with an additional element
      const more = [...numbers, 4]
      console.log(more, numbers)

      // Careful: sort() without a compare function sorts as TEXT
      console.log([10, 9, 100].toSorted())
    `,
  },
  'js-arrays-uebung': {
    tipps: {
      de: [
        '`namesInStock`: erst `filter` (Bestand > 0), dann `map` auf den Namen.',
        '`totalPrice`: `reduce((sum, p) => sum + p.price, 0)` - der Startwert 0 ist wichtig.',
        '`mostExpensive`: `reduce` ohne Startwert, der „beste“ Artikel wandert als Akkumulator mit.',
      ],
      en: [
        '`namesInStock`: first `filter` (stock > 0), then `map` to the name.',
        '`totalPrice`: `reduce((sum, p) => sum + p.price, 0)` - the initial value 0 matters.',
        '`mostExpensive`: `reduce` without an initial value, the “best” item travels along as the accumulator.',
      ],
    },
    code: js`
      function namesInStock(list) {

      }

      function totalPrice(list) {

      }

      function mostExpensive(list) {

      }

      console.log(namesInStock(products))
    `,
    loesung: js`
      function namesInStock(list) {
        return list.filter((p) => p.stock > 0).map((p) => p.name)
      }

      function totalPrice(list) {
        return list.reduce((sum, p) => sum + p.price, 0)
      }

      function mostExpensive(list) {
        return list.reduce((best, p) => (p.price > best.price ? p : best))
      }

      console.log(namesInStock(products))
    `,
    vorbereitung: products,
    tests: [
      { name: { de: 'namesInStock liefert die richtigen Namen', en: 'namesInStock returns the right names' }, ausdruck: 'namesInStock(products)', erwartet: ['Keyboard', 'Monitor', 'Teapot'] },
      { name: { de: 'totalPrice ergibt 314', en: 'totalPrice is 314' }, ausdruck: 'totalPrice(products)', erwartet: 314 },
      { name: { de: 'totalPrice([]) ergibt 0', en: 'totalPrice([]) is 0' }, ausdruck: 'totalPrice([])', erwartet: 0 },
      { name: { de: 'mostExpensive ist der Monitor', en: 'mostExpensive is the monitor' }, ausdruck: 'mostExpensive(products)?.name', erwartet: 'Monitor' },
      { name: { de: 'Das Original-Array bleibt unverändert', en: 'The original array stays unchanged' }, ausdruck: '(namesInStock(products), totalPrice(products), mostExpensive(products), products.length === 5 && products[0].name === \'Keyboard\')' },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    [1, 2, 3].map(x => x * 2)            // [2, 4, 6]   transform every element
    [1, 2, 3].filter(x => x > 1)         // [2, 3]      keep only matching ones
    [1, 2, 3].reduce((sum, x) => sum + x, 0)  // 6      combine into ONE value
  `,
}
