import { js } from '../../lernen/quelltext'
import type { PlaygroundDaten } from './typen'

/**
 * Playground für Teil 1 (JavaScript). Läuft in derselben Sandbox wie die Kapitel,
 * mit sichtbarem <div id="app"> für die DOM-Bausteine.
 *
 * Die Bausteine benutzen bewusst verschiedene Variablennamen, damit man mehrere
 * hintereinander einfügen kann, ohne dass `const` doppelt vergeben wird.
 */
export const jsPlayground: PlaygroundDaten = {
  teil: 'javascript',
  modus: 'js',
  vorlagen: [
    {
      titel: { de: 'Leeres Blatt', en: 'Blank page' },
      info: { de: 'Nur ein console.log - der Rest gehört dir.', en: 'Just a console.log - the rest is yours.' },
      code: js`
        // JavaScript playground - write anything you like.
        // Pick building blocks on the left or type right here.

        console.log('Hello playground!')
      `,
    },
    {
      titel: { de: 'FizzBuzz', en: 'FizzBuzz' },
      info: { de: 'Der Klassiker: Schleife, Bedingungen und der Rest-Operator %.', en: 'The classic: a loop, conditions and the remainder operator %.' },
      code: js`
        for (let i = 1; i <= 15; i++) {
          if (i % 15 === 0) console.log('FizzBuzz')
          else if (i % 3 === 0) console.log('Fizz')
          else if (i % 5 === 0) console.log('Buzz')
          else console.log(i)
        }
      `,
    },
    {
      titel: { de: 'Einkaufsliste', en: 'Shopping list' },
      info: { de: 'Ein Array von Objekten mit filter, map und reduce auswerten.', en: 'Analyse an array of objects with filter, map and reduce.' },
      code: js`
        const cart = [
          { name: 'Apples', price: 2.5, amount: 4 },
          { name: 'Bread', price: 3.2, amount: 1 },
          { name: 'Coffee', price: 7.9, amount: 2 },
        ]

        const lines = cart.map((item) => \`\${item.amount} × \${item.name}: \${(item.price * item.amount).toFixed(2)} €\`)
        console.log(lines.join('\n'))

        const total = cart.reduce((sum, item) => sum + item.price * item.amount, 0)
        console.log('Total:', total.toFixed(2), '€')

        const expensive = cart.filter((item) => item.price > 3)
        console.log('Expensive:', expensive.map((item) => item.name))
      `,
    },
    {
      titel: { de: 'Klick-Zähler im DOM', en: 'Click counter in the DOM' },
      info: { de: 'Elemente erzeugen, Event-Listener, Text aktualisieren - ganz ohne React.', en: 'Create elements, add an event listener, update text - no React at all.' },
      code: js`
        const app = document.getElementById('app')
        let clicks = 0

        const label = document.createElement('p')
        label.textContent = 'Clicked 0 times'

        const button = document.createElement('button')
        button.textContent = 'Click me'
        button.addEventListener('click', () => {
          clicks++
          label.textContent = \`Clicked \${clicks} times\`
        })

        app.append(button, label)
      `,
    },
    {
      titel: { de: 'Daten „laden“ mit async/await', en: '"Loading" data with async/await' },
      info: { de: 'Ein Promise, das nach einer Pause Daten liefert - wie ein Server.', en: 'A promise that delivers data after a pause - like a server.' },
      code: js`
        function fakeServer(ms) {
          return new Promise((resolve) => setTimeout(() => resolve([{ id: 1, name: 'Ada' }, { id: 2, name: 'Linus' }]), ms))
        }

        async function main() {
          console.log('Loading …')
          const users = await fakeServer(500)
          console.log('Done:', users.map((user) => user.name))
        }

        main()
      `,
    },
  ],
  gruppen: [
    {
      titel: { de: 'Ausgabe & Variablen', en: 'Output & variables' },
      bausteine: [
        {
          titel: { de: 'console.log', en: 'console.log' },
          info: { de: 'Werte in der Konsole ausgeben - dein wichtigstes Werkzeug.', en: 'Print values to the console - your most important tool.' },
          code: js`console.log($0)`,
          ort: 'ende',
          kapitel: 'js-variablen',
        },
        {
          titel: { de: 'const & let', en: 'const & let' },
          info: { de: 'const für Werte, die bleiben - let für Werte, die sich ändern.', en: 'const for values that stay - let for values that change.' },
          code: js`
            const firstName = 'Ada'
            let age = 36
            age = age + 1
            console.log(firstName, age)
          `,
          ort: 'ende',
          kapitel: 'js-variablen',
        },
        {
          titel: { de: 'Template-String', en: 'Template string' },
          info: { de: 'Text mit eingebauten Werten: `…${wert}…`', en: 'Text with embedded values: `…${value}…`' },
          code: js`
            const city = 'Berlin'
            const degrees = 21
            console.log(\`In \${city} it is \${degrees} °C\`)
          `,
          ort: 'ende',
          kapitel: 'js-variablen',
        },
        {
          titel: { de: 'typeof', en: 'typeof' },
          info: { de: 'Welcher Datentyp steckt in einem Wert?', en: 'Which data type is inside a value?' },
          code: js`console.log(typeof 42, typeof 'hi', typeof true, typeof undefined, typeof null, typeof [])`,
          ort: 'ende',
          kapitel: 'js-variablen',
        },
      ],
    },
    {
      titel: { de: 'Bedingungen & Schleifen', en: 'Conditions & loops' },
      bausteine: [
        {
          titel: { de: 'if / else', en: 'if / else' },
          info: { de: 'Code nur unter einer Bedingung ausführen.', en: 'Run code only under a condition.' },
          code: js`
            const temperature = 18
            if (temperature > 25) {
              console.log('Hot')
            } else if (temperature > 15) {
              console.log('Nice')
            } else {
              console.log('Cold')
            }
          `,
          ort: 'ende',
          kapitel: 'js-kontrollfluss',
        },
        {
          titel: { de: 'Ternärer Operator', en: 'Ternary operator' },
          info: { de: 'Ein if/else als Ausdruck: bedingung ? ja : nein', en: 'An if/else as an expression: condition ? yes : no' },
          code: js`
            const points = 72
            const grade = points >= 50 ? 'passed' : 'failed'
            console.log(grade)
          `,
          ort: 'ende',
          kapitel: 'js-kontrollfluss',
        },
        {
          titel: { de: 'for-Schleife', en: 'for loop' },
          info: { de: 'Zählen von … bis.', en: 'Count from … to.' },
          code: js`
            for (let i = 1; i <= 5; i++) {
              console.log('Round', i)
            }
          `,
          ort: 'ende',
          kapitel: 'js-kontrollfluss',
        },
        {
          titel: { de: 'for … of', en: 'for … of' },
          info: { de: 'Jedes Element einer Liste durchgehen.', en: 'Go through every element of a list.' },
          code: js`
            for (const fruit of ['apple', 'pear', 'plum']) {
              console.log(fruit)
            }
          `,
          ort: 'ende',
          kapitel: 'js-kontrollfluss',
        },
        {
          titel: { de: 'while', en: 'while' },
          info: { de: 'Wiederholen, solange eine Bedingung gilt.', en: 'Repeat as long as a condition holds.' },
          code: js`
            let countdown = 3
            while (countdown > 0) {
              console.log(countdown)
              countdown--
            }
            console.log('Liftoff!')
          `,
          ort: 'ende',
          kapitel: 'js-kontrollfluss',
        },
        {
          titel: { de: 'switch', en: 'switch' },
          info: { de: 'Einen Wert mit mehreren festen Fällen vergleichen.', en: 'Compare one value with several fixed cases.' },
          code: js`
            const day = 'sat'
            switch (day) {
              case 'sat':
              case 'sun':
                console.log('Weekend')
                break
              default:
                console.log('Workday')
            }
          `,
          ort: 'ende',
          kapitel: 'js-kontrollfluss',
        },
      ],
    },
    {
      titel: { de: 'Funktionen', en: 'Functions' },
      bausteine: [
        {
          titel: { de: 'Funktion', en: 'Function' },
          info: { de: 'Code mit Namen, Parametern und Rückgabewert.', en: 'Code with a name, parameters and a return value.' },
          code: js`
            function greet(name) {
              return 'Hello ' + name
            }
            console.log(greet('Ada'))
          `,
          ort: 'ende',
          kapitel: 'js-funktionen',
        },
        {
          titel: { de: 'Arrow Function', en: 'Arrow function' },
          info: { de: 'Die kurze Schreibweise - überall in React.', en: 'The short form - everywhere in React.' },
          code: js`
            const square = (n) => n * n
            console.log(square(7))
          `,
          ort: 'ende',
          kapitel: 'js-funktionen',
        },
        {
          titel: { de: 'Standardwert', en: 'Default parameter' },
          info: { de: 'Parameter mit Wert, falls nichts übergeben wird.', en: 'A parameter value used when nothing is passed.' },
          code: js`
            function orderCoffee(size = 'medium') {
              console.log('One ' + size + ' coffee')
            }
            orderCoffee()
            orderCoffee('large')
          `,
          ort: 'ende',
          kapitel: 'js-funktionen',
        },
        {
          titel: { de: 'Closure', en: 'Closure' },
          info: { de: 'Eine Funktion merkt sich Variablen ihrer Umgebung.', en: 'A function remembers variables from its surroundings.' },
          code: js`
            function makeCounter() {
              let value = 0
              return () => ++value
            }
            const next = makeCounter()
            console.log(next(), next(), next())
          `,
          ort: 'ende',
          kapitel: 'js-funktionen',
        },
      ],
    },
    {
      titel: { de: 'Arrays', en: 'Arrays' },
      bausteine: [
        {
          titel: { de: 'map', en: 'map' },
          info: { de: 'Jedes Element umwandeln - neues Array gleicher Länge.', en: 'Transform every element - new array of the same length.' },
          code: js`
            const prices = [5, 12, 8]
            const withTax = prices.map((price) => price * 1.19)
            console.log(withTax)
          `,
          ort: 'ende',
          kapitel: 'js-arrays',
        },
        {
          titel: { de: 'filter', en: 'filter' },
          info: { de: 'Nur Elemente behalten, für die die Bedingung gilt.', en: 'Keep only the elements that match the condition.' },
          code: js`
            const ages = [12, 19, 34, 8, 51]
            const adults = ages.filter((age) => age >= 18)
            console.log(adults)
          `,
          ort: 'ende',
          kapitel: 'js-arrays',
        },
        {
          titel: { de: 'reduce', en: 'reduce' },
          info: { de: 'Ein Array zu einem einzigen Wert zusammenfassen.', en: 'Combine an array into a single value.' },
          code: js`
            const scores = [3, 7, 10, 4]
            const sum = scores.reduce((total, score) => total + score, 0)
            console.log(sum)
          `,
          ort: 'ende',
          kapitel: 'js-arrays',
        },
        {
          titel: { de: 'find & some', en: 'find & some' },
          info: { de: 'Das erste passende Element suchen - oder nur fragen, ob es eins gibt.', en: 'Look for the first match - or just ask whether there is one.' },
          code: js`
            const team = ['Ada', 'Grace', 'Linus']
            console.log(team.find((person) => person.startsWith('G')))
            console.log(team.some((person) => person.length > 5))
          `,
          ort: 'ende',
          kapitel: 'js-arrays',
        },
        {
          titel: { de: 'Sortieren (ohne Original zu ändern)', en: 'Sort (without changing the original)' },
          info: { de: 'toSorted liefert eine sortierte Kopie.', en: 'toSorted returns a sorted copy.' },
          code: js`
            const numbers = [42, 7, 19, 3]
            console.log(numbers.toSorted((a, b) => a - b), numbers)
          `,
          ort: 'ende',
          kapitel: 'js-arrays',
        },
      ],
    },
    {
      titel: { de: 'Objekte', en: 'Objects' },
      bausteine: [
        {
          titel: { de: 'Objekt', en: 'Object' },
          info: { de: 'Werte mit Namen bündeln.', en: 'Bundle values with names.' },
          code: js`
            const book = { title: 'Dune', year: 1965, tags: ['sci-fi'] }
            console.log(book.title, book['year'])
          `,
          ort: 'ende',
          kapitel: 'js-objekte',
        },
        {
          titel: { de: 'Destructuring', en: 'Destructuring' },
          info: { de: 'Eigenschaften direkt in Variablen auspacken.', en: 'Unpack properties straight into variables.' },
          code: js`
            const movie = { name: 'Alien', rating: 8.5 }
            const { name, rating } = movie
            console.log(name, rating)
          `,
          ort: 'ende',
          kapitel: 'js-objekte',
        },
        {
          titel: { de: 'Kopie mit Änderung (Spread)', en: 'Copy with a change (spread)' },
          info: { de: 'Neues Objekt statt das alte zu verändern - wie in React.', en: 'A new object instead of changing the old one - just like in React.' },
          code: js`
            const settings = { theme: 'light', fontSize: 14 }
            const darker = { ...settings, theme: 'dark' }
            console.log(settings, darker)
          `,
          ort: 'ende',
          kapitel: 'js-referenzen',
        },
        {
          titel: { de: 'Über ein Objekt laufen', en: 'Loop over an object' },
          info: { de: 'Object.entries liefert [schlüssel, wert]-Paare.', en: 'Object.entries returns [key, value] pairs.' },
          code: js`
            const stock = { apples: 4, pears: 0, plums: 12 }
            for (const [fruit, count] of Object.entries(stock)) {
              console.log(fruit, count)
            }
          `,
          ort: 'ende',
          kapitel: 'js-objekte',
        },
        {
          titel: { de: 'JSON', en: 'JSON' },
          info: { de: 'Objekt ↔ Text - so werden Daten gespeichert und verschickt.', en: 'Object ↔ text - how data is stored and sent.' },
          code: js`
            const text = JSON.stringify({ done: true, items: [1, 2] })
            console.log(text)
            console.log(JSON.parse(text).items)
          `,
          ort: 'ende',
          kapitel: 'js-objekte',
        },
      ],
    },
    {
      titel: { de: 'Asynchron & Fehler', en: 'Async & errors' },
      bausteine: [
        {
          titel: { de: 'setTimeout', en: 'setTimeout' },
          info: { de: 'Code später ausführen.', en: 'Run code later.' },
          code: js`
            console.log('Now')
            setTimeout(() => console.log('One second later'), 1000)
          `,
          ort: 'ende',
          kapitel: 'js-async',
        },
        {
          titel: { de: 'async / await', en: 'async / await' },
          info: { de: 'Auf ein Promise warten, als wäre es normaler Code.', en: 'Wait for a promise as if it were normal code.' },
          code: js`
            const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
            async function slowHello() {
              await pause(300)
              console.log('Hello after 300 ms')
            }
            slowHello()
          `,
          ort: 'ende',
          kapitel: 'js-async',
        },
        {
          titel: { de: 'try / catch', en: 'try / catch' },
          info: { de: 'Fehler abfangen, statt abzustürzen.', en: 'Catch errors instead of crashing.' },
          code: js`
            try {
              JSON.parse('{ broken')
            } catch (error) {
              console.log('Caught:', error.message)
            }
          `,
          ort: 'ende',
          kapitel: 'js-fehler',
        },
        {
          titel: { de: 'Klasse', en: 'Class' },
          info: { de: 'Bauplan für Objekte mit Methoden.', en: 'A blueprint for objects with methods.' },
          code: js`
            class Dog {
              constructor(name) {
                this.name = name
              }
              bark() {
                return this.name + ' says woof'
              }
            }
            console.log(new Dog('Rex').bark())
          `,
          ort: 'ende',
          kapitel: 'js-fehler',
        },
      ],
    },
    {
      titel: { de: 'DOM (Vorschau)', en: 'DOM (preview)' },
      bausteine: [
        {
          titel: { de: 'Überschrift einfügen', en: 'Add a heading' },
          info: { de: 'Ein Element erzeugen und in <div id="app"> hängen.', en: 'Create an element and append it to <div id="app">.' },
          code: js`
            const heading = document.createElement('h2')
            heading.textContent = 'Made with JavaScript'
            document.getElementById('app').append(heading)
          `,
          ort: 'ende',
          kapitel: 'js-dom',
        },
        {
          titel: { de: 'Knopf mit Klick', en: 'Button with a click' },
          info: { de: 'addEventListener reagiert auf Klicks.', en: 'addEventListener reacts to clicks.' },
          code: js`
            const hiButton = document.createElement('button')
            hiButton.textContent = 'Say hi'
            hiButton.addEventListener('click', () => console.log('Hi!'))
            document.getElementById('app').append(hiButton)
          `,
          ort: 'ende',
          kapitel: 'js-dom',
        },
        {
          titel: { de: 'Eingabefeld', en: 'Input field' },
          info: { de: 'Das input-Event feuert bei jedem Tastendruck.', en: 'The input event fires on every keystroke.' },
          code: js`
            const field = document.createElement('input')
            field.placeholder = 'Type something'
            const echo = document.createElement('p')
            field.addEventListener('input', () => (echo.textContent = field.value.toUpperCase()))
            document.getElementById('app').append(field, echo)
          `,
          ort: 'ende',
          kapitel: 'js-dom',
        },
        {
          titel: { de: 'Liste aus einem Array', en: 'List from an array' },
          info: { de: 'Für jedes Element ein <li> - so wie später in React mit map.', en: 'One <li> per element - just like map in React later.' },
          code: js`
            const list = document.createElement('ul')
            for (const planet of ['Mercury', 'Venus', 'Earth']) {
              const li = document.createElement('li')
              li.textContent = planet
              list.append(li)
            }
            document.getElementById('app').append(list)
          `,
          ort: 'ende',
          kapitel: 'js-dom',
        },
      ],
    },
  ],
}
