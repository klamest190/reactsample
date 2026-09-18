import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'js-dom-einstieg': {
    code: js`
      const button = document.createElement('button')
      button.textContent = 'Click me'

      button.addEventListener('click', () => {
        button.textContent = 'Clicked!'
      })

      document.querySelector('#app').append(button)
    `,
  },
  'js-dom-1': {
    code: js`
      const app = document.querySelector('#app')

      const heading = document.createElement('h2')
      heading.textContent = 'Hello DOM!'
      heading.style.color = 'tomato'

      const list = document.createElement('ul')
      for (const language of ['HTML', 'CSS', 'JavaScript']) {
        const item = document.createElement('li')
        item.textContent = language
        list.append(item)
      }

      app.append(heading, list)
      console.log('Elements in #app:', app.children.length)
    `,
  },
  'js-dom-2': {
    code: js`
      const app = document.querySelector('#app')
      app.innerHTML = \`
        <input id="name" placeholder="Your name">
        <button id="button">Click me</button>
        <p id="output">Nothing happened yet.</p>
      \`

      const input = document.querySelector('#name')
      const button = document.querySelector('#button')
      const output = document.querySelector('#output')
      let clicks = 0

      button.addEventListener('click', () => {
        clicks++
        output.textContent = \`Clicked \${clicks}×\`
      })

      input.addEventListener('input', (event) => {
        output.textContent = 'Hello ' + event.target.value
      })
    `,
  },
  'js-dom-3': {
    code: js`
      // A mini to-do list "by hand". Notice in how many places
      // the counter has to be updated.
      const app = document.querySelector('#app')
      app.innerHTML = \`
        <input id="new" placeholder="New task"> <button id="add">+</button>
        <p id="counter"></p>
        <ul id="list"></ul>
      \`
      const todos = []

      function updateCounter() {
        document.querySelector('#counter').textContent =
          todos.filter((t) => !t.done).length + ' open'
      }

      document.querySelector('#add').addEventListener('click', () => {
        const field = document.querySelector('#new')
        const todo = { text: field.value, done: false }
        todos.push(todo)

        const li = document.createElement('li')
        li.textContent = todo.text
        li.addEventListener('click', () => {
          todo.done = !todo.done
          li.style.textDecoration = todo.done ? 'line-through' : ''
          updateCounter()        // don't forget!
        })
        document.querySelector('#list').append(li)

        field.value = ''
        updateCounter()          // don't forget!
      })

      updateCounter()
    `,
  },
  'js-dom-uebung': {
    tipps: {
      de: [
        'Elemente einmal erzeugen und mit `app.append(…)` einhängen.',
        'Eine Funktion `render()` setzt Text und Farbe aus `count` - rufe sie nach jeder Änderung auf.',
        'Farbe: `display.style.color = count > 5 ? \'red\' : \'\'`.',
      ],
      en: [
        'Create the elements once and attach them with `app.append(…)`.',
        'A `render()` function sets text and color from `count` - call it after every change.',
        'Color: `display.style.color = count > 5 ? \'red\' : \'\'`.',
      ],
    },
    code: js`
      const app = document.querySelector('#app')
      let count = 0

      // Your code
    `,
    loesung: js`
      const app = document.querySelector('#app')
      let count = 0

      const display = document.createElement('span')
      const plus = document.createElement('button')
      const reset = document.createElement('button')
      plus.textContent = '+1'
      reset.textContent = 'Reset'
      app.append(display, plus, reset)

      // One function that derives the UI from the state
      function render() {
        display.textContent = count + ' '
        display.style.color = count > 5 ? 'red' : ''
      }

      plus.addEventListener('click', () => {
        count++
        render()
      })
      reset.addEventListener('click', () => {
        count = 0
        render()
      })

      render()
    `,
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    function TodoList() {
      const [todos, setTodos] = useState([])
      const open = todos.filter((t) => !t.done).length

      return (
        <>
          <p>{open} open</p>
          <ul>
            {todos.map((t) => <li key={t.id}>{t.text}</li>)}
          </ul>
        </>
      )
    }
  `,
  beispiel2: js`
    // Named exports - as many as you like per file
    export const PI = 3.14159
    export function area(radius) {
      return PI * radius * radius
    }

    // Default export - at most one per file
    export default function circumference(radius) {
      return 2 * PI * radius
    }
  `,
  beispiel3: js`
    import circumference, { area, PI } from './math.js'  // default + named
    import { area as circleArea } from './math.js'        // rename
    import * as math from './math.js'                      // everything as an object

    // Packages from node_modules without a path:
    import { useState } from 'react'
  `,
}
