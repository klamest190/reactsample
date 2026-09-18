import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'hooks-usereducer-einstieg': {
    code: js`
      function reducer(state, action) {
        switch (action.type) {
          case 'increment':
            return state + 1
          case 'reset':
            return 0
          default:
            return state
        }
      }

      function App() {
        const [count, dispatch] = useReducer(reducer, 0)

        return (
          <>
            <p>Count: {count}</p>
            <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
            <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
          </>
        )
      }
    `,
  },
  'hooks-usereducer-js': {
    code: js`
      function counterReducer(state, action) {
        switch (action.type) {
          case 'incremented':
            return { ...state, count: state.count + action.by, history: [...state.history, '+' + action.by] }
          case 'decremented':
            return { ...state, count: state.count - action.by, history: [...state.history, '-' + action.by] }
          case 'reset':
            return { count: 0, history: [] }
          default:
            throw new Error('Unknown action: ' + action.type)
        }
      }

      const actions = [
        { type: 'incremented', by: 5 },
        { type: 'incremented', by: 3 },
        { type: 'decremented', by: 2 },
      ]

      // This is exactly what React does - just spread out over time:
      const result = actions.reduce(counterReducer, { count: 0, history: [] })
      console.log(result)

      // A single step:
      console.log(counterReducer(result, { type: 'reset' }))
    `,
  },
  'hooks-usereducer-react': {
    code: js`
      const initialState = { count: 0, step: 1 }

      function reducer(state, action) {
        switch (action.type) {
          case 'incremented':
            return { ...state, count: state.count + state.step }
          case 'decremented':
            return { ...state, count: state.count - state.step }
          case 'stepChanged':
            return { ...state, step: action.step }
          case 'reset':
            return initialState
          default:
            throw new Error('Unknown action: ' + action.type)
        }
      }

      function App() {
        const [state, dispatch] = useReducer(reducer, initialState)

        return (
          <>
            <h2>{state.count}</h2>
            <button onClick={() => dispatch({ type: 'decremented' })}>−</button>
            <button onClick={() => dispatch({ type: 'incremented' })}>+</button>
            <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
            <p>
              Step:{' '}
              <input
                type="number"
                value={state.step}
                onChange={(e) => dispatch({ type: 'stepChanged', step: Number(e.target.value) })}
              />
            </p>
          </>
        )
      }
    `,
  },
  'hooks-usereducer-uebung': {
    tipps: {
      de: [
        'Für `added`: Gibt es das Produkt schon (`some`)? Dann Menge per `map` erhöhen, sonst mit `quantity: 1` anhängen.',
        '`quantityChanged`: erst `map`, dann `filter((item) => item.quantity > 0)`.',
        '`total`: `reduce` über `price * quantity`.',
      ],
      en: [
        'For `added`: does the product already exist (`some`)? Then increase the quantity via `map`, otherwise append it with `quantity: 1`.',
        '`quantityChanged`: first `map`, then `filter((item) => item.quantity > 0)`.',
        '`total`: `reduce` over `price * quantity`.',
      ],
    },
    code: js`
      function cartReducer(state, action) {
        switch (action.type) {

          default:
            throw new Error('Unknown action: ' + action.type)
        }
      }

      function total(state) {

      }

      const coffee = { id: 1, name: 'Coffee', price: 4 }
      let cart = cartReducer([], { type: 'added', product: coffee })
      console.log(cart)
    `,
    loesung: js`
      function cartReducer(state, action) {
        switch (action.type) {
          case 'added': {
            const exists = state.some((item) => item.id === action.product.id)
            if (exists) {
              return state.map((item) => (item.id === action.product.id ? { ...item, quantity: item.quantity + 1 } : item))
            }
            return [...state, { ...action.product, quantity: 1 }]
          }
          case 'quantityChanged':
            return state
              .map((item) => (item.id === action.id ? { ...item, quantity: action.quantity } : item))
              .filter((item) => item.quantity > 0)
          case 'removed':
            return state.filter((item) => item.id !== action.id)
          case 'cleared':
            return []
          default:
            throw new Error('Unknown action: ' + action.type)
        }
      }

      function total(state) {
        return state.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }

      const coffee = { id: 1, name: 'Coffee', price: 4 }
      let cart = cartReducer([], { type: 'added', product: coffee })
      console.log(cart)
    `,
    vorbereitung: js`
      const __tea = { id: 2, name: 'Tea', price: 3 }
      const __cake = { id: 3, name: 'Cake', price: 5 }
      const __cart = () => [{ ...__tea, quantity: 2 }]
    `,
    tests: [
      { name: { de: 'added: neues Produkt mit quantity 1', en: 'added: new product with quantity 1' }, ausdruck: 'cartReducer([], { type: \'added\', product: __cake })', erwartet: [{ id: 3, name: 'Cake', price: 5, quantity: 1 }] },
      { name: { de: 'added: vorhandenes Produkt erhöht die Menge', en: 'added: existing product increases the quantity' }, ausdruck: 'cartReducer(__cart(), { type: \'added\', product: __tea })[0].quantity', erwartet: 3 },
      { name: { de: 'quantityChanged setzt die Menge', en: 'quantityChanged sets the quantity' }, ausdruck: 'cartReducer(__cart(), { type: \'quantityChanged\', id: 2, quantity: 7 })[0].quantity', erwartet: 7 },
      { name: { de: 'quantityChanged mit 0 entfernt den Artikel', en: 'quantityChanged with 0 removes the item' }, ausdruck: 'cartReducer(__cart(), { type: \'quantityChanged\', id: 2, quantity: 0 })', erwartet: [] },
      { name: { de: 'removed und cleared funktionieren', en: 'removed and cleared work' }, ausdruck: 'cartReducer(__cart(), { type: \'removed\', id: 2 }).length === 0 && cartReducer(__cart(), { type: \'cleared\' }).length === 0' },
      { name: { de: 'Der alte State wird nicht verändert', en: 'The old state is not changed' }, ausdruck: '(() => { const s = __cart(); cartReducer(s, { type: \'added\', product: __tea }); cartReducer(s, { type: \'quantityChanged\', id: 2, quantity: 9 }); return s[0].quantity === 2 && s.length === 1 })()' },
      { name: { de: 'total berechnet den Gesamtpreis', en: 'total calculates the total price' }, ausdruck: 'total([{ ...__tea, quantity: 2 }, { ...__cake, quantity: 3 }])', erwartet: 21 },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    function reducer(state, action) {
      switch (action.type) {
        case 'incremented': return { ...state, count: state.count + action.by }
        case 'reset':       return { ...state, count: 0 }
        default:            throw new Error('Unknown action: ' + action.type)
      }
    }

    const [state, dispatch] = useReducer(reducer, { count: 0 })
    dispatch({ type: 'incremented', by: 5 })
  `,
}
