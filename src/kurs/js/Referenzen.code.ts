import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'js-referenzen-einstieg': {
    code: js`
      const a = [1, 2]
      const b = a          // same array, not a copy

      b.push(3)
      console.log(a)       // a has changed too!
      console.log(a === b) // true
    `,
  },
  'js-referenzen-1': {
    code: js`
      // Primitives: a real copy
      let a = 5
      let b = a
      b = 10
      console.log('a:', a, 'b:', b)

      // Objects: the same reference!
      const original = { name: 'Ada' }
      const alsoOriginal = original
      alsoOriginal.name = 'Grace'
      console.log('original:', original)   // changed too!

      // Comparison checks the REFERENCE, not the content
      console.log({ x: 1 } === { x: 1 })  // false - two different objects
      console.log(original === alsoOriginal) // true - the same object
      console.log([1, 2] === [1, 2])      // false
    `,
  },
  'js-referenzen-2': {
    code: js`
      // This is how React "thinks" when comparing old and new state:
      function hasChanged(prev, next) {
        return !Object.is(prev, next)
      }

      const list = ['a', 'b']

      // Mutation:
      const sameList = list
      sameList.push('c')
      console.log('After push:', hasChanged(list, sameList))

      // New copy:
      const newList = [...list, 'd']
      console.log('After spread:', hasChanged(list, newList))
    `,
  },
  'js-referenzen-3': {
    code: js`
      const todos = [
        { id: 1, text: 'Learn JS', done: true },
        { id: 2, text: 'Learn React', done: false },
      ]

      // Add
      const withNew = [...todos, { id: 3, text: 'Master hooks', done: false }]

      // Remove
      const withoutOne = todos.filter((t) => t.id !== 1)

      // Change one element: map + spread
      const toggled = todos.map((t) =>
        t.id === 2 ? { ...t, done: !t.done } : t
      )

      console.log(withNew.length, withoutOne.length)
      console.log(toggled)
      console.log('Original unchanged:', todos[1].done)

      // Unchanged elements keep their reference - great for memo!
      console.log(toggled[0] === todos[0], toggled[1] === todos[1])
    `,
  },
  'js-referenzen-4': {
    code: js`
      const user = { name: 'Ada', address: { city: 'London' } }

      // ❌ Shallow copy, then mutated a nested object
      const copy = { ...user }
      copy.address.city = 'Paris'
      console.log('Original:', user.address.city)  // Paris! 😱

      // ✅ Copy every level along the way
      const correct = { ...user, address: { ...user.address, city: 'Berlin' } }
      console.log(correct.address.city, user.address.city)

      // Deep copy of everything (rarely needed)
      const deep = structuredClone(user)
      deep.address.city = 'Rome'
      console.log(deep.address.city, user.address.city)
    `,
  },
  'js-referenzen-uebung': {
    tipps: {
      de: [
        'Keine Methode, die das Array verändert (`push`, direkte Zuweisung) - immer ein neues Array zurückgeben.',
        '`addTodo`: `[...todos, neuesTodo]`.',
        '`toggleTodo` und `renameTodo`: `map` und für das passende Todo `{ ...t, done: !t.done }` bzw. `{ ...t, text }`.',
      ],
      en: [
        'No methods that change the array (`push`, direct assignment) - always return a new array.',
        '`addTodo`: `[...todos, newTodo]`.',
        '`toggleTodo` and `renameTodo`: `map`, and for the matching todo `{ ...t, done: !t.done }` or `{ ...t, text }`.',
      ],
    },
    code: js`
      function addTodo(todos, text) {

      }

      function toggleTodo(todos, id) {

      }

      function renameTodo(todos, id, text) {

      }

      const start = [{ id: 1, text: 'Go shopping', done: false }]
      console.log(toggleTodo(start, 1), start)
    `,
    loesung: js`
      function addTodo(todos, text) {
        return [...todos, { id: todos.length + 1, text, done: false }]
      }

      function toggleTodo(todos, id) {
        return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      }

      function renameTodo(todos, id, text) {
        return todos.map((t) => (t.id === id ? { ...t, text } : t))
      }

      const start = [{ id: 1, text: 'Go shopping', done: false }]
      console.log(toggleTodo(start, 1), start)
    `,
    vorbereitung: js`
      const __start = () => [
        { id: 1, text: 'A', done: false },
        { id: 2, text: 'B', done: true },
      ]
    `,
    tests: [
      { name: { de: 'addTodo hängt ein neues Todo an', en: 'addTodo appends a new todo' }, ausdruck: 'addTodo(__start(), \'C\')[2]', erwartet: { id: 3, text: 'C', done: false } },
      { name: { de: 'addTodo verändert das Original nicht', en: 'addTodo does not change the original' }, ausdruck: '(() => { const t = __start(); addTodo(t, \'C\'); return t.length === 2 })()' },
      { name: { de: 'toggleTodo kehrt done um', en: 'toggleTodo flips done' }, ausdruck: 'toggleTodo(__start(), 2).map((t) => t.done)', erwartet: [false, false] },
      { name: { de: 'toggleTodo mutiert das Todo-Objekt nicht', en: 'toggleTodo does not mutate the todo object' }, ausdruck: '(() => { const t = __start(); toggleTodo(t, 1); return t[0].done === false })()' },
      { name: { de: 'Unveränderte Todos behalten ihre Referenz', en: 'Unchanged todos keep their reference' }, ausdruck: '(() => { const t = __start(); return toggleTodo(t, 1)[1] === t[1] })()' },
      { name: { de: 'renameTodo ändert nur den Text', en: 'renameTodo only changes the text' }, ausdruck: 'renameTodo(__start(), 1, \'New\')[0]', erwartet: { id: 1, text: 'New', done: false } },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    original     ──┐
                   ├──►  { name: 'Grace' }
    alsoOriginal ──┘

    { x: 1 }  ──►  object #1
    { x: 1 }  ──►  object #2     (different location → not ===)
  `,
  beispiel2: js`
    // ❌ Mutation - same reference, React notices nothing
    todos.push(newTodo)
    setTodos(todos)

    // ✅ New array - new reference, React re-renders
    setTodos([...todos, newTodo])
  `,
}
