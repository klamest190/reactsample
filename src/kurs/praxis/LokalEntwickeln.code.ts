import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen und Tipps gibt es in beiden Sprachen.
 */

export const beispiele = {
  'praxis-lokal-debugging': {
    code: js`
      // averageLength should return the average text length of all DONE todos.
      // The result is wrong - find out why with console.log (or a debugger statement).
      function averageLength(todos) {
        const done = todos.filter((todo) => todo.done)
        let sum = 0
        for (let i = 1; i < done.length; i++) {
          sum += done[i].text.length
        }
        return sum / done.length
      }

      const todos = [
        { id: 1, text: 'Learn JS', done: true },     // 8 characters
        { id: 2, text: 'Learn React', done: true },  // 11 characters
        { id: 3, text: 'Relax', done: false },
      ]

      console.log(averageLength(todos)) // expected: 9.5
      console.log(averageLength([]))    // expected: 0
    `,
    loesung: js`
      function averageLength(todos) {
        const done = todos.filter((todo) => todo.done)
        if (done.length === 0) return 0 // avoid 0 / 0 = NaN
        let sum = 0
        for (let i = 0; i < done.length; i++) {
          sum += done[i].text.length
        }
        return sum / done.length
      }

      const todos = [
        { id: 1, text: 'Learn JS', done: true },
        { id: 2, text: 'Learn React', done: true },
        { id: 3, text: 'Relax', done: false },
      ]

      console.log(averageLength(todos)) // 9.5
      console.log(averageLength([]))    // 0
    `,
    tipps: {
      de: [
        'Gib in der Schleife `i` und `sum` aus: `console.log(i, sum)`. Welche Durchläufe siehst du?',
        'Arrays beginnen bei Index **0**.',
        'Was ergibt `0 / 0` in JavaScript? Behandle das leere Array vorher gesondert.',
      ],
      en: [
        'Log `i` and `sum` inside the loop: `console.log(i, sum)`. Which iterations do you see?',
        'Arrays start at index **0**.',
        'What is `0 / 0` in JavaScript? Handle the empty array separately first.',
      ],
    },
    tests: [
      {
        name: { de: 'Durchschnitt der erledigten Todos', en: 'Average of the completed todos' },
        ausdruck: "averageLength([{ text: 'abcd', done: true }, { text: 'ab', done: true }, { text: 'abcdefgh', done: false }])",
        erwartet: 3,
      },
      { name: { de: 'Ein einzelnes Todo zählt mit', en: 'A single todo counts' }, ausdruck: "averageLength([{ text: 'abc', done: true }])", erwartet: 3 },
      { name: { de: 'Leere Liste ergibt 0', en: 'An empty list returns 0' }, ausdruck: 'averageLength([])', erwartet: 0 },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  pruefen: js`
    node -v    # v22 or newer
    npm -v
  `,
  anlegen: js`
    npm create vite@latest my-todos -- --template react-ts
    cd my-todos
    npm install
    npm run dev
  `,
  struktur: js`
    my-todos/
    ├─ index.html          <- the only HTML page, loads src/main.tsx
    ├─ package.json        <- dependencies and scripts (dev, build, preview)
    ├─ vite.config.ts
    ├─ public/             <- files copied as they are (favicon …)
    └─ src/
       ├─ main.tsx         <- createRoot(...).render(<App />)
       ├─ App.tsx          <- your app starts here
       ├─ App.css
       └─ index.css
  `,
  importe: js`
    // src/App.tsx - in a real project you import what you use
    import { useEffect, useReducer, useState } from 'react'
    import './App.css'

    type Todo = { id: number; text: string; done: boolean }

    export default function App() {
      const [text, setText] = useState('')
      // …
    }
  `,
  aufteilen: js`
    // src/components/TodoItem.tsx
    type Props = { todo: Todo; onToggle: (id: number) => void }

    export function TodoItem({ todo, onToggle }: Props) {
      return (
        <li className={todo.done ? 'done' : ''}>
          <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
          {todo.text}
        </li>
      )
    }

    // src/App.tsx
    import { TodoItem } from './components/TodoItem'
  `,
  debugger: js`
    function handleToggle(id: number) {
      debugger // execution pauses here while the DevTools are open
      dispatch({ type: 'toggled', id })
    }
  `,
  bauen: js`
    npm run build     # creates the optimized version in dist/
    npm run preview   # serves dist/ locally for a final check
  `,
}
