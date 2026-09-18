import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

const fakeApi = js`
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  async function loadUser(id) {
    await wait(300)
    const users = { 1: 'Ada', 2: 'Alan', 3: 'Grace' }
    if (!users[id]) throw new Error('User ' + id + ' not found')
    return { id, name: users[id] }
  }

  async function loadPosts(userId) {
    await wait(300)
    return [\`Post A by #\${userId}\`, \`Post B by #\${userId}\`]
  }
`

export const beispiele = {
  'js-async-einstieg': {
    code: js`
      console.log('1: start')

      setTimeout(() => {
        console.log('3: one second later')
      }, 1000)

      console.log('2: end')
    `,
  },
  'js-async-1': {
    code: js`
      console.log('1: Start')

      setTimeout(() => {
        console.log('3: Timer finished')
      }, 0)   // even with 0 ms!

      console.log('2: End of the code')

      // Why does 3 come last? The callback only runs once
      // the current code has completely finished (event loop).
    `,
  },
  'js-async-2': {
    code: js`
      function rollDice() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const number = Math.ceil(Math.random() * 6)
            if (number === 1) reject(new Error('A 1 - bad luck!'))
            else resolve(number)
          }, 500)
        })
      }

      console.log('Rolling the dice ...')

      rollDice()
        .then((number) => console.log('Rolled:', number))
        .catch((error) => console.error(error.message))
        .finally(() => console.log('Done (success or error)'))

      // Run it several times - sometimes you get a 1
    `,
  },
  'js-async-3': {
    code: js`
      async function showProfile(id) {
        try {
          console.log('Loading user', id, '...')
          const user = await loadUser(id)
          const posts = await loadPosts(user.id)
          console.log(user.name, 'has', posts.length, 'posts')
        } catch (error) {
          console.error('Error:', error.message)
        }
      }

      await showProfile(1)
      await showProfile(99)   // does not exist

      // In parallel instead of one after another: Promise.all
      const all = await Promise.all([loadUser(1), loadUser(2), loadUser(3)])
      console.log(all.map((u) => u.name))
    `,
    vorbereitung: fakeApi,
  },
  'js-async-4': {
    code: js`
      // Needs internet. Without a connection you will see the catch branch.
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=3')
        if (!response.ok) throw new Error('HTTP ' + response.status)

        const todos = await response.json()
        for (const todo of todos) {
          console.log(todo.completed ? '✅' : '⬜', todo.title)
        }
      } catch (error) {
        console.error('Loading failed:', error.message)
      }
    `,
  },
  'js-async-uebung': {
    tipps: {
      de: [
        'Erzeuge mit `ids.map(…)` ein Array von Promises.',
        'Jedes Promise fängt seinen eigenen Fehler: `.then((user) => user.name).catch(() => \'unknown\')`.',
        '`return Promise.all(promises)` wartet auf alle gleichzeitig.',
      ],
      en: [
        'Use `ids.map(…)` to create an array of promises.',
        'Each promise catches its own error: `.then((user) => user.name).catch(() => \'unknown\')`.',
        '`return Promise.all(promises)` waits for all of them at once.',
      ],
    },
    code: js`
      async function loadNames(ids) {

      }

      console.log(await loadNames([1, 2]))
    `,
    loesung: js`
      async function loadNames(ids) {
        const promises = ids.map((id) =>
          loadUser(id)
            .then((user) => user.name)
            .catch(() => 'unknown')
        )
        return Promise.all(promises)
      }

      console.log(await loadNames([1, 2]))
    `,
    vorbereitung: fakeApi,
    tests: [
      { name: { de: 'loadNames gibt ein Promise zurück', en: 'loadNames returns a promise' }, ausdruck: 'loadNames([1]) instanceof Promise' },
      { name: { de: 'Namen in der richtigen Reihenfolge', en: 'Names in the right order' }, ausdruck: 'loadNames([3, 1])', erwartet: ['Grace', 'Ada'] },
      { name: { de: 'Unbekannte IDs werden zu "unknown"', en: 'Unknown IDs become "unknown"' }, ausdruck: 'loadNames([2, 42])', erwartet: ['Alan', 'unknown'] },
      { name: { de: 'Lädt parallel (3 Nutzer in unter 600 ms)', en: 'Loads in parallel (3 users in under 600 ms)' }, ausdruck: '(async () => { const t = performance.now(); await loadNames([1, 2, 3]); return performance.now() - t < 600 })()' },
    ],
  },
  'js-async-eventloop': {
    code: js`
      console.log('1 sync: start')

      setTimeout(() => console.log('5 task: setTimeout 0'), 0)

      Promise.resolve().then(() => console.log('3 microtask: then'))

      queueMicrotask(() => console.log('4 microtask: queueMicrotask'))

      async function load() {
        console.log('2 sync: inside async function, before await')
        await null
        console.log('4b microtask: after await')
      }
      load()

      console.log('2b sync: end of script')

      // Order: all synchronous code -> all microtasks -> the next task.
      // The browser can only repaint between tasks.
    `,
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  eventloop: js`
    ┌───────────────┐    empty?    ┌──────────────────┐    then    ┌──────────────┐
    │  Call stack   │ ───────────▶ │ All microtasks   │ ─────────▶ │ Next task    │
    │  (your code)  │              │ Promise.then,    │            │ setTimeout,  │
    └───────────────┘              │ await            │            │ click, fetch │
          ▲                        └──────────────────┘            └──────┬───────┘
          └──────────────────── (browser may repaint here) ───────────────┘
  `,

  beispiel1: js`
    async function loadTodos() {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=3')

      if (!response.ok) {
        throw new Error(\`HTTP error \${response.status}\`)
      }

      const todos = await response.json()
      return todos
    }
  `,
}
