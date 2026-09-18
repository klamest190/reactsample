import { js } from '../../lernen/quelltext'
import type { UebungsSammlung } from './typen'

/**
 * Zusätzliche Übungen für Teil 1 (JavaScript) - pro Kapitel gestuft:
 * vorhersagen -> Fehler finden -> ergänzen / frei schreiben.
 * Code ist Englisch, Texte zweisprachig (Mini-Syntax von <Text>).
 */

const t = (de: string, en: string) => ({ de, en })

export const uebungen: UebungsSammlung = {
  'js-variablen': [
    {
      id: 'js-variablen-typeof',
      stufe: 'vorhersage',
      titel: t('Was liefert typeof?', 'What does typeof return?'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: js`
        console.log(typeof null, typeof [], typeof NaN)
      `,
      antworten: ['null array number', 'object object number', 'object array NaN', 'null object undefined'],
      richtig: 1,
      erklaerung: t(
        '`typeof null` ist ein historischer Fehler und ergibt `"object"`. Arrays sind Objekte (prüfen mit `Array.isArray`), und `NaN` ist tatsächlich vom Typ `"number"`.',
        '`typeof null` is a historical bug and returns `"object"`. Arrays are objects (check with `Array.isArray`), and `NaN` really is of type `"number"`.',
      ),
    },
    {
      id: 'js-variablen-plus',
      stufe: 'fehler',
      titel: t('Plötzlich 301 Jahre alt', 'Suddenly 301 years old'),
      aufgabe: t(
        '`greet(\'Ada\', 30)` soll `"Hello Ada, you will be 31 next year"` liefern. Stattdessen steht da 301. Finde und behebe den Fehler.',
        '`greet(\'Ada\', 30)` should return `"Hello Ada, you will be 31 next year"`. Instead it says 301. Find and fix the bug.',
      ),
      modus: 'js',
      code: js`
        function greet(name, age) {
          return 'Hello ' + name + ', you will be ' + age + 1 + ' next year'
        }

        console.log(greet('Ada', 30))
      `,
      loesung: js`
        function greet(name, age) {
          return \`Hello \${name}, you will be \${age + 1} next year\`
        }

        console.log(greet('Ada', 30))
      `,
      tipps: {
        de: ['`+` arbeitet von links nach rechts. Was ist `\'…be \' + 30`?', 'Klammern um `age + 1` oder ein Template-Literal mit `${age + 1}` lösen das.'],
        en: ['`+` works from left to right. What is `\'…be \' + 30`?', 'Parentheses around `age + 1` or a template literal with `${age + 1}` fix it.'],
      },
      tests: [
        { name: t('greet(\'Ada\', 30)', 'greet(\'Ada\', 30)'), ausdruck: "greet('Ada', 30)", erwartet: 'Hello Ada, you will be 31 next year' },
        { name: t('greet(\'Linus\', 9)', 'greet(\'Linus\', 9)'), ausdruck: "greet('Linus', 9)", erwartet: 'Hello Linus, you will be 10 next year' },
      ],
    },
    {
      id: 'js-variablen-describe',
      stufe: 'ergaenzen',
      titel: t('Typ und Wahrheitswert beschreiben', 'Describe type and truthiness'),
      aufgabe: t(
        'Ergänze `describe(value)`: Es gibt den Typ und „truthy“ oder „falsy“ zurück, z. B. `"number, falsy"` für `0`.',
        'Complete `describe(value)`: it returns the type and “truthy” or “falsy”, e.g. `"number, falsy"` for `0`.',
      ),
      modus: 'js',
      code: js`
        function describe(value) {
          // e.g. describe(0) -> "number, falsy"
        }

        console.log(describe(0))
        console.log(describe('hi'))
      `,
      loesung: js`
        function describe(value) {
          const truthiness = value ? 'truthy' : 'falsy'
          return \`\${typeof value}, \${truthiness}\`
        }

        console.log(describe(0))
        console.log(describe('hi'))
      `,
      tipps: {
        de: ['`typeof value` liefert den Typ als Text.', '`value ? \'truthy\' : \'falsy\'` - eine Bedingung wandelt jeden Wert in true oder false um.'],
        en: ['`typeof value` returns the type as a string.', '`value ? \'truthy\' : \'falsy\'` - a condition turns any value into true or false.'],
      },
      tests: [
        { name: 'describe(0)', ausdruck: 'describe(0)', erwartet: 'number, falsy' },
        { name: "describe('hi')", ausdruck: "describe('hi')", erwartet: 'string, truthy' },
        { name: 'describe(null)', ausdruck: 'describe(null)', erwartet: 'object, falsy' },
        { name: 'describe([])', ausdruck: 'describe([])', erwartet: 'object, truthy' },
      ],
    },
  ],

  'js-kontrollfluss': [
    {
      id: 'js-kontrollfluss-oder',
      stufe: 'vorhersage',
      titel: t('|| oder ??', '|| or ??'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: js`
        console.log(0 || 'default', 0 ?? 'default')
      `,
      antworten: ['default default', '0 0', 'default 0', '0 default'],
      richtig: 2,
      erklaerung: t(
        '`||` nimmt die rechte Seite bei **jedem** falsy-Wert, also auch bei `0`. `??` nur bei `null` oder `undefined` - die `0` bleibt erhalten.',
        '`||` takes the right side for **any** falsy value, including `0`. `??` only for `null` or `undefined` - the `0` is kept.',
      ),
    },
    {
      id: 'js-kontrollfluss-zuweisung',
      stufe: 'fehler',
      titel: t('Immer „0 todos“', 'Always “0 todos”'),
      aufgabe: t(
        '`getLabel` liefert für jede Zahl dasselbe Ergebnis. Finde die beiden Fehler.',
        '`getLabel` returns the same result for every number. Find the two bugs.',
      ),
      modus: 'js',
      code: js`
        function getLabel(count) {
          if (count = 0) return 'No todos'
          if (count == '1') return '1 todo'
          return count + ' todos'
        }

        console.log(getLabel(0), '|', getLabel(1), '|', getLabel(5))
      `,
      loesung: js`
        function getLabel(count) {
          if (count === 0) return 'No todos'
          if (count === 1) return '1 todo'
          return count + ' todos'
        }

        console.log(getLabel(0), '|', getLabel(1), '|', getLabel(5))
      `,
      tipps: {
        de: ['Ein einzelnes `=` ist eine **Zuweisung**, kein Vergleich.', 'Nimm immer `===` - dann fällt auch `== \'1\'` auf, das den String `"1"` akzeptieren würde.'],
        en: ['A single `=` is an **assignment**, not a comparison.', 'Always use `===` - then `== \'1\'`, which would accept the string `"1"`, stands out too.'],
      },
      tests: [
        { name: 'getLabel(0)', ausdruck: 'getLabel(0)', erwartet: 'No todos' },
        { name: 'getLabel(1)', ausdruck: 'getLabel(1)', erwartet: '1 todo' },
        { name: 'getLabel(5)', ausdruck: 'getLabel(5)', erwartet: '5 todos' },
        { name: t("getLabel('1') ist kein Sonderfall", "getLabel('1') is not a special case"), ausdruck: "getLabel('1')", erwartet: '1 todos' },
      ],
    },
    {
      id: 'js-kontrollfluss-fizzbuzz',
      stufe: 'frei',
      titel: t('FizzBuzz', 'FizzBuzz'),
      aufgabe: t(
        'Schreibe `fizzBuzz(n)`: Es gibt ein Array mit den Zahlen 1 bis n als Text zurück - aber durch 3 teilbar wird zu `"Fizz"`, durch 5 zu `"Buzz"`, durch beides zu `"FizzBuzz"`.',
        'Write `fizzBuzz(n)`: it returns an array of the numbers 1 to n as strings - but divisible by 3 becomes `"Fizz"`, by 5 `"Buzz"`, by both `"FizzBuzz"`.',
      ),
      modus: 'js',
      code: js`
        function fizzBuzz(n) {

        }
      `,
      loesung: js`
        function fizzBuzz(n) {
          const result = []
          for (let i = 1; i <= n; i++) {
            if (i % 15 === 0) result.push('FizzBuzz')
            else if (i % 3 === 0) result.push('Fizz')
            else if (i % 5 === 0) result.push('Buzz')
            else result.push(String(i))
          }
          return result
        }

        console.log(fizzBuzz(15))
      `,
      tipps: {
        de: ['`i % 3 === 0` prüft, ob `i` durch 3 teilbar ist.', 'Die Reihenfolge der Bedingungen zählt: „durch beides“ zuerst prüfen.'],
        en: ['`i % 3 === 0` checks whether `i` is divisible by 3.', 'The order of the conditions matters: check “both” first.'],
      },
      tests: [
        { name: 'fizzBuzz(5)', ausdruck: 'fizzBuzz(5)', erwartet: ['1', '2', 'Fizz', '4', 'Buzz'] },
        { name: t('fizzBuzz(15) endet mit FizzBuzz', 'fizzBuzz(15) ends with FizzBuzz'), ausdruck: 'fizzBuzz(15).at(-1)', erwartet: 'FizzBuzz' },
        { name: 'fizzBuzz(0)', ausdruck: 'fizzBuzz(0)', erwartet: [] },
      ],
    },
  ],

  'js-funktionen': [
    {
      id: 'js-funktionen-closure',
      stufe: 'vorhersage',
      titel: t('Zwei Zähler', 'Two counters'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: js`
        function makeCounter() {
          let count = 0
          return () => ++count
        }

        const a = makeCounter()
        const b = makeCounter()
        a()
        a()
        console.log(a(), b())
      `,
      antworten: ['3 1', '3 3', '1 1', '2 1'],
      richtig: 0,
      erklaerung: t(
        'Jeder Aufruf von `makeCounter` erzeugt ein **eigenes** `count`. `a` hat es dreimal erhöht, `b` einmal - genau so bekommt jede Komponente ihren eigenen State.',
        'Every call to `makeCounter` creates its **own** `count`. `a` increased it three times, `b` once - just like every component gets its own state.',
      ),
    },
    {
      id: 'js-funktionen-once',
      stufe: 'fehler',
      titel: t('once() verschluckt Argumente', 'once() swallows arguments'),
      aufgabe: t(
        '`once(fn)` soll eine Funktion liefern, die `fn` nur beim ersten Aufruf ausführt und dessen Ergebnis zurückgibt. Sie funktioniert noch nicht richtig.',
        '`once(fn)` should return a function that runs `fn` only on the first call and returns its result. It does not work correctly yet.',
      ),
      modus: 'js',
      code: js`
        function once(fn) {
          let called = false
          return function (...args) {
            if (called) return
            called = true
            fn(args)
          }
        }

        const addOnce = once((a, b) => a + b)
        console.log(addOnce(2, 3)) // expected: 5
        console.log(addOnce(4, 5)) // expected: undefined
      `,
      loesung: js`
        function once(fn) {
          let called = false
          return function (...args) {
            if (called) return
            called = true
            return fn(...args)
          }
        }

        const addOnce = once((a, b) => a + b)
        console.log(addOnce(2, 3)) // 5
        console.log(addOnce(4, 5)) // undefined
      `,
      tipps: {
        de: ['`args` ist ein Array. Was bekommt `fn` als ersten Parameter?', 'Zwei Dinge fehlen: Spread `fn(...args)` und ein `return`.'],
        en: ['`args` is an array. What does `fn` receive as its first parameter?', 'Two things are missing: spread `fn(...args)` and a `return`.'],
      },
      tests: [
        { name: t('Erster Aufruf liefert das Ergebnis', 'First call returns the result'), ausdruck: 'once((a, b) => a + b)(2, 3)', erwartet: 5 },
        { name: t('Zweiter Aufruf führt fn nicht aus', 'Second call does not run fn'), ausdruck: '(() => { let n = 0; const f = once(() => ++n); f(); f(); return n })()', erwartet: 1 },
      ],
    },
    {
      id: 'js-funktionen-multiplier',
      stufe: 'ergaenzen',
      titel: t('Funktionen, die Funktionen bauen', 'Functions that build functions'),
      aufgabe: t(
        'Ergänze `createMultiplier(factor)`: Es gibt eine Funktion zurück, die ihr Argument mit `factor` multipliziert. `createMultiplier(3)(5)` ergibt 15.',
        'Complete `createMultiplier(factor)`: it returns a function that multiplies its argument by `factor`. `createMultiplier(3)(5)` returns 15.',
      ),
      modus: 'js',
      code: js`
        function createMultiplier(factor) {
          // return a function
        }

        // Try it:
        // const double = createMultiplier(2)
        // console.log(double(5))
      `,
      loesung: js`
        function createMultiplier(factor) {
          return (value) => value * factor
        }

        const double = createMultiplier(2)
        console.log(double(5))
      `,
      tipps: {
        de: ['Die zurückgegebene Funktion kann `factor` weiter benutzen - das ist eine Closure.', '`return (value) => value * factor`'],
        en: ['The returned function can keep using `factor` - that is a closure.', '`return (value) => value * factor`'],
      },
      tests: [
        { name: 'createMultiplier(3)(5)', ausdruck: 'createMultiplier(3)(5)', erwartet: 15 },
        { name: t('Unabhängige Multiplikatoren', 'Independent multipliers'), ausdruck: '(() => { const d = createMultiplier(2); const h = createMultiplier(100); return [d(4), h(4)] })()', erwartet: [8, 400] },
      ],
    },
  ],

  'js-arrays': [
    {
      id: 'js-arrays-sort',
      stufe: 'vorhersage',
      titel: t('sort() ohne Vergleich', 'sort() without a comparison'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: js`
        const numbers = [3, 1, 10, 2]
        numbers.sort()
        console.log(numbers)
      `,
      antworten: ['[1, 2, 3, 10]', '[1, 10, 2, 3]', '[10, 3, 2, 1]', '[3, 1, 10, 2]'],
      richtig: 1,
      erklaerung: t(
        'Ohne Vergleichsfunktion sortiert `sort` **als Text** - `"10"` kommt vor `"2"`. Richtig: `sort((a, b) => a - b)`. Außerdem verändert `sort` das Array; `toSorted` nicht.',
        'Without a compare function, `sort` sorts **as strings** - `"10"` comes before `"2"`. Correct: `sort((a, b) => a - b)`. Also, `sort` changes the array; `toSorted` does not.',
      ),
    },
    {
      id: 'js-arrays-map-filter',
      stufe: 'fehler',
      titel: t('Lücken in der Liste', 'Gaps in the list'),
      aufgabe: t(
        '`getOpenTexts` soll nur die Texte der offenen Todos liefern. Es kommen aber `undefined`-Einträge heraus.',
        '`getOpenTexts` should return only the texts of open todos. But it returns `undefined` entries.',
      ),
      modus: 'js',
      code: js`
        const todos = [
          { text: 'Learn map', done: true },
          { text: 'Learn filter', done: false },
          { text: 'Learn reduce', done: false },
        ]

        function getOpenTexts(todos) {
          return todos.map((todo) => {
            if (!todo.done) return todo.text
          })
        }

        console.log(getOpenTexts(todos))
      `,
      loesung: js`
        const todos = [
          { text: 'Learn map', done: true },
          { text: 'Learn filter', done: false },
          { text: 'Learn reduce', done: false },
        ]

        function getOpenTexts(todos) {
          return todos.filter((todo) => !todo.done).map((todo) => todo.text)
        }

        console.log(getOpenTexts(todos))
      `,
      tipps: {
        de: ['`map` liefert **immer** gleich viele Elemente - auch für die, bei denen nichts zurückgegeben wird.', 'Erst `filter`, dann `map`.'],
        en: ['`map` **always** returns the same number of elements - even for those where nothing is returned.', 'First `filter`, then `map`.'],
      },
      tests: [
        { name: t('Nur offene Texte', 'Only open texts'), ausdruck: 'getOpenTexts(todos)', erwartet: ['Learn filter', 'Learn reduce'] },
        { name: t('Leere Liste', 'Empty list'), ausdruck: 'getOpenTexts([])', erwartet: [] },
      ],
    },
    {
      id: 'js-arrays-reduce',
      stufe: 'frei',
      titel: t('Ausgaben pro Kategorie', 'Expenses per category'),
      aufgabe: t(
        'Schreibe `totalByCategory(expenses)`: Es summiert die Beträge pro Kategorie und gibt ein Objekt zurück, z. B. `{ food: 17, travel: 40 }`.',
        'Write `totalByCategory(expenses)`: it sums the amounts per category and returns an object, e.g. `{ food: 17, travel: 40 }`.',
      ),
      modus: 'js',
      code: js`
        const expenses = [
          { category: 'food', amount: 12 },
          { category: 'travel', amount: 40 },
          { category: 'food', amount: 5 },
        ]

        function totalByCategory(expenses) {

        }
      `,
      loesung: js`
        const expenses = [
          { category: 'food', amount: 12 },
          { category: 'travel', amount: 40 },
          { category: 'food', amount: 5 },
        ]

        function totalByCategory(expenses) {
          return expenses.reduce((totals, expense) => {
            totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount
            return totals
          }, {})
        }

        console.log(totalByCategory(expenses))
      `,
      tipps: {
        de: ['`reduce` mit einem leeren Objekt `{}` als Startwert.', 'Noch keine Summe für die Kategorie? `(totals[category] ?? 0) + amount`.'],
        en: ['`reduce` with an empty object `{}` as the initial value.', 'No sum for the category yet? `(totals[category] ?? 0) + amount`.'],
      },
      tests: [
        { name: t('Beispieldaten', 'Sample data'), ausdruck: 'totalByCategory(expenses)', erwartet: { food: 17, travel: 40 } },
        { name: t('Leere Liste ergibt {}', 'Empty list returns {}'), ausdruck: 'totalByCategory([])', erwartet: {} },
      ],
    },
  ],

  'js-objekte': [
    {
      id: 'js-objekte-default',
      stufe: 'vorhersage',
      titel: t('Standardwerte beim Destructuring', 'Defaults when destructuring'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: js`
        const { name, age = 30 } = { name: 'Ada', age: null }
        console.log(name, age)
      `,
      antworten: ['Ada 30', 'Ada null', 'Ada undefined', 'undefined null'],
      richtig: 1,
      erklaerung: t(
        'Standardwerte greifen nur bei `undefined`. `null` ist ein echter Wert und bleibt stehen.',
        'Defaults only apply for `undefined`. `null` is a real value and stays.',
      ),
    },
    {
      id: 'js-objekte-spread-reihenfolge',
      stufe: 'fehler',
      titel: t('Einstellungen werden nicht übernommen', 'Settings are not applied'),
      aufgabe: t(
        '`updateSettings` soll die Änderungen über die alten Einstellungen legen. Das Theme bleibt aber „light“.',
        '`updateSettings` should apply the changes on top of the old settings. But the theme stays “light”.',
      ),
      modus: 'js',
      code: js`
        function updateSettings(settings, changes) {
          return { ...changes, ...settings }
        }

        console.log(updateSettings({ theme: 'light', language: 'en' }, { theme: 'dark' }))
      `,
      loesung: js`
        function updateSettings(settings, changes) {
          return { ...settings, ...changes }
        }

        console.log(updateSettings({ theme: 'light', language: 'en' }, { theme: 'dark' }))
      `,
      tipps: {
        de: ['Bei doppelten Schlüsseln gewinnt der, der **später** im Objekt steht.'],
        en: ['With duplicate keys, the one that comes **later** in the object wins.'],
      },
      tests: [
        { name: t('Änderung wird übernommen', 'Change is applied'), ausdruck: "updateSettings({ theme: 'light', language: 'en' }, { theme: 'dark' })", erwartet: { theme: 'dark', language: 'en' } },
        { name: t('Original bleibt unverändert', 'Original stays unchanged'), ausdruck: "(() => { const s = { theme: 'light' }; updateSettings(s, { theme: 'dark' }); return s.theme })()", erwartet: 'light' },
      ],
    },
    {
      id: 'js-objekte-verschachtelt',
      stufe: 'ergaenzen',
      titel: t('Verschachteltes Destructuring', 'Nested destructuring'),
      aufgabe: t(
        'Ergänze `formatUser(user)` mit Destructuring in der Parameterliste: Ergebnis `"Ada from London"`. Fehlt `address`, steht dort `"unknown"`.',
        'Complete `formatUser(user)` using destructuring in the parameter list: result `"Ada from London"`. If `address` is missing, it says `"unknown"`.',
      ),
      modus: 'js',
      code: js`
        function formatUser(user) {
          // Tip: destructure right in the parameter list
        }

        console.log(formatUser({ name: 'Ada', address: { city: 'London' } }))
        console.log(formatUser({ name: 'Linus' }))
      `,
      loesung: js`
        function formatUser({ name, address: { city = 'unknown' } = {} }) {
          return \`\${name} from \${city}\`
        }

        console.log(formatUser({ name: 'Ada', address: { city: 'London' } }))
        console.log(formatUser({ name: 'Linus' }))
      `,
      tipps: {
        de: ['`function formatUser({ name, address })` packt die obersten Felder aus.', 'Verschachtelt mit Standardwerten: `address: { city = \'unknown\' } = {}`.'],
        en: ['`function formatUser({ name, address })` unpacks the top-level fields.', 'Nested with defaults: `address: { city = \'unknown\' } = {}`.'],
      },
      tests: [
        { name: t('Mit Adresse', 'With address'), ausdruck: "formatUser({ name: 'Ada', address: { city: 'London' } })", erwartet: 'Ada from London' },
        { name: t('Ohne Adresse', 'Without address'), ausdruck: "formatUser({ name: 'Linus' })", erwartet: 'Linus from unknown' },
      ],
    },
  ],

  'js-referenzen': [
    {
      id: 'js-referenzen-kopie',
      stufe: 'vorhersage',
      titel: t('Kopie oder Referenz?', 'Copy or reference?'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: js`
        const a = { count: 1 }
        const b = a
        b.count = 2
        const c = { ...a }
        c.count = 3
        console.log(a.count, b.count, c.count)
      `,
      antworten: ['1 2 3', '2 2 3', '3 3 3', '1 1 3'],
      richtig: 1,
      erklaerung: t(
        '`b` zeigt auf **dasselbe** Objekt wie `a`. `c` ist eine neue Kopie - Änderungen daran betreffen `a` nicht.',
        '`b` points to the **same** object as `a`. `c` is a new copy - changing it does not affect `a`.',
      ),
    },
    {
      id: 'js-referenzen-flach',
      stufe: 'fehler',
      titel: t('Die Kopie verändert das Original', 'The copy changes the original'),
      aufgabe: t(
        '`addTag` soll einen neuen Post mit zusätzlichem Tag liefern, ohne den alten zu verändern. Trotzdem hat danach auch das Original den Tag.',
        '`addTag` should return a new post with an extra tag without changing the old one. Yet afterwards the original has the tag too.',
      ),
      modus: 'js',
      code: js`
        function addTag(post, tag) {
          const copy = { ...post }
          copy.tags.push(tag)
          return copy
        }

        const post = { title: 'Hooks', tags: ['react'] }
        const updated = addTag(post, 'javascript')
        console.log(post.tags, updated.tags)
      `,
      loesung: js`
        function addTag(post, tag) {
          return { ...post, tags: [...post.tags, tag] }
        }

        const post = { title: 'Hooks', tags: ['react'] }
        const updated = addTag(post, 'javascript')
        console.log(post.tags, updated.tags)
      `,
      tipps: {
        de: ['Spread kopiert nur **eine Ebene**. `copy.tags` ist noch dasselbe Array wie `post.tags`.', 'Auch das Array muss neu sein: `tags: [...post.tags, tag]`.'],
        en: ['Spread only copies **one level**. `copy.tags` is still the same array as `post.tags`.', 'The array has to be new as well: `tags: [...post.tags, tag]`.'],
      },
      tests: [
        { name: t('Neuer Post hat den Tag', 'New post has the tag'), ausdruck: "addTag({ title: 'x', tags: ['a'] }, 'b').tags", erwartet: ['a', 'b'] },
        { name: t('Original bleibt unverändert', 'Original stays unchanged'), ausdruck: "(() => { const p = { title: 'x', tags: ['a'] }; addTag(p, 'b'); return p.tags })()", erwartet: ['a'] },
      ],
    },
    {
      id: 'js-referenzen-update',
      stufe: 'ergaenzen',
      titel: t('Ein Element unveränderlich ändern', 'Update one item immutably'),
      aufgabe: t(
        'Ergänze `updateTodo(todos, id, changes)`: neues Array, das passende Todo mit den Änderungen, **alle anderen Objekte unverändert** (dieselbe Referenz) - so kann `memo` sie später überspringen.',
        'Complete `updateTodo(todos, id, changes)`: a new array, the matching todo with the changes, **all other objects untouched** (same reference) - so `memo` can skip them later.',
      ),
      modus: 'js',
      wiederholung: 'js-arrays',
      code: js`
        function updateTodo(todos, id, changes) {

        }

        const todos = [
          { id: 1, text: 'A', done: false },
          { id: 2, text: 'B', done: false },
        ]
        console.log(updateTodo(todos, 2, { done: true }))
      `,
      loesung: js`
        function updateTodo(todos, id, changes) {
          return todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo))
        }

        const todos = [
          { id: 1, text: 'A', done: false },
          { id: 2, text: 'B', done: false },
        ]
        console.log(updateTodo(todos, 2, { done: true }))
      `,
      tipps: {
        de: ['`map` über alle Todos.', 'Passendes Todo: `{ ...todo, ...changes }`, sonst `todo` selbst zurückgeben.'],
        en: ['`map` over all todos.', 'Matching todo: `{ ...todo, ...changes }`, otherwise return `todo` itself.'],
      },
      tests: [
        { name: t('Änderung übernommen', 'Change applied'), ausdruck: "updateTodo(todos, 2, { done: true })[1]", erwartet: { id: 2, text: 'B', done: true } },
        { name: t('Neues Array, Original unverändert', 'New array, original unchanged'), ausdruck: '(() => { const r = updateTodo(todos, 2, { done: true }); return r !== todos && todos[1].done === false })()' },
        { name: t('Andere Todos behalten ihre Referenz', 'Other todos keep their reference'), ausdruck: 'updateTodo(todos, 2, { done: true })[0] === todos[0]' },
      ],
    },
  ],

  'js-async': [
    {
      id: 'js-async-reihenfolge',
      stufe: 'vorhersage',
      titel: t('Wer kommt zuerst?', 'Who comes first?'),
      frage: t('In welcher Reihenfolge erscheinen die Buchstaben?', 'In which order do the letters appear?'),
      code: js`
        console.log('A')
        setTimeout(() => console.log('B'), 0)
        Promise.resolve().then(() => console.log('C'))
        console.log('D')
      `,
      antworten: ['A B C D', 'A D B C', 'A D C B', 'A C D B'],
      richtig: 2,
      erklaerung: t(
        'Erst der synchrone Code (A, D). Dann Promise-Reaktionen (C) - sie haben Vorrang vor Timern. Zuletzt der Timer (B), auch mit 0 ms.',
        'First the synchronous code (A, D). Then promise reactions (C) - they take priority over timers. Finally the timer (B), even with 0 ms.',
      ),
    },
    {
      id: 'js-async-foreach',
      stufe: 'fehler',
      titel: t('Das Ergebnis ist leer', 'The result is empty'),
      aufgabe: t(
        '`loadNames` soll die Namen aller Nutzer laden. Es kommt aber ein leeres Array zurück. `fetchUser(id)` ist vorhanden und liefert nach kurzer Zeit `{ id, name }`.',
        '`loadNames` should load the names of all users. But it returns an empty array. `fetchUser(id)` exists and resolves to `{ id, name }` after a short delay.',
      ),
      modus: 'js',
      vorbereitung: js`
        function fetchUser(id) {
          return new Promise((resolve) => setTimeout(() => resolve({ id, name: 'User ' + id }), 20))
        }
      `,
      code: js`
        async function loadNames(ids) {
          const names = []
          ids.forEach(async (id) => {
            const user = await fetchUser(id)
            names.push(user.name)
          })
          return names
        }

        loadNames([1, 2, 3]).then((names) => console.log(names))
      `,
      loesung: js`
        async function loadNames(ids) {
          const users = await Promise.all(ids.map((id) => fetchUser(id)))
          return users.map((user) => user.name)
        }

        loadNames([1, 2, 3]).then((names) => console.log(names))
      `,
      tipps: {
        de: ['`forEach` wartet nicht auf `async`-Callbacks - `return names` passiert sofort.', '`Promise.all(ids.map((id) => fetchUser(id)))` wartet auf alle gleichzeitig.'],
        en: ['`forEach` does not wait for `async` callbacks - `return names` happens right away.', '`Promise.all(ids.map((id) => fetchUser(id)))` waits for all of them at once.'],
      },
      tests: [
        { name: t('Alle Namen in Reihenfolge', 'All names in order'), ausdruck: 'loadNames([1, 2, 3])', erwartet: ['User 1', 'User 2', 'User 3'] },
        { name: t('Leere Liste', 'Empty list'), ausdruck: 'loadNames([])', erwartet: [] },
      ],
    },
    {
      id: 'js-async-retry',
      stufe: 'frei',
      titel: t('Nochmal versuchen', 'Try again'),
      aufgabe: t(
        'Schreibe `retry(fn, attempts)`: Es ruft die async-Funktion `fn` auf und versucht es bei einem Fehler erneut - höchstens `attempts`-mal. Klappt es, kommt das Ergebnis zurück, sonst wird der letzte Fehler geworfen.',
        'Write `retry(fn, attempts)`: it calls the async function `fn` and tries again on an error - at most `attempts` times. If it works, the result is returned; otherwise the last error is thrown.',
      ),
      modus: 'js',
      code: js`
        async function retry(fn, attempts) {

        }
      `,
      loesung: js`
        async function retry(fn, attempts) {
          let lastError
          for (let i = 0; i < attempts; i++) {
            try {
              return await fn()
            } catch (error) {
              lastError = error
            }
          }
          throw lastError
        }

        let calls = 0
        retry(async () => {
          calls++
          if (calls < 3) throw new Error('Not yet')
          return 'Success after ' + calls + ' calls'
        }, 5).then(console.log)
      `,
      tipps: {
        de: ['Eine `for`-Schleife mit `try { return await fn() } catch (error) { … }`.', 'Das `await` im `return` ist wichtig - sonst landet der Fehler nicht im `catch`.', 'Nach der Schleife: `throw lastError`.'],
        en: ['A `for` loop with `try { return await fn() } catch (error) { … }`.', 'The `await` in the `return` matters - otherwise the error does not reach the `catch`.', 'After the loop: `throw lastError`.'],
      },
      tests: [
        {
          name: t('Erfolg beim dritten Versuch', 'Success on the third attempt'),
          ausdruck: "(async () => { let n = 0; const r = await retry(async () => { n++; if (n < 3) throw new Error('fail'); return 'ok' }, 3); return [r, n] })()",
          erwartet: ['ok', 3],
        },
        {
          name: t('Wirft den letzten Fehler nach allen Versuchen', 'Throws the last error after all attempts'),
          ausdruck: "(async () => { let n = 0; try { await retry(async () => { n++; throw new Error('nope ' + n) }, 2); return 'no error' } catch (e) { return [e.message, n] } })()",
          erwartet: ['nope 2', 2],
        },
      ],
    },
  ],

  'js-dom': [
    {
      id: 'js-dom-bubbling',
      stufe: 'vorhersage',
      titel: t('Event Bubbling', 'Event bubbling'),
      frage: t('Die Liste enthält den Knopf. Was steht nach dem Klick in der Konsole?', 'The list contains the button. What is in the console after the click?'),
      code: js`
        // <ul id="list"><li><button id="delete">Delete</button></li></ul>
        list.addEventListener('click', () => console.log('ul'))
        deleteButton.addEventListener('click', () => console.log('button'))
        deleteButton.click()
      `,
      antworten: ['button', 'ul', 'button ul', 'ul button'],
      richtig: 2,
      erklaerung: t(
        'Events steigen vom Ziel nach oben auf: erst der Knopf, dann die Liste. Genau so funktioniert ein Handler für viele Einträge (Event Delegation).',
        'Events bubble up from the target: first the button, then the list. That is how one handler for many items works (event delegation).',
      ),
    },
    {
      id: 'js-dom-listener',
      stufe: 'fehler',
      titel: t('Der Knopf reagiert nicht', 'The button does not react'),
      aufgabe: t(
        'Beim Laden erscheint sofort „Item 1“, danach tut der Knopf nichts mehr. Finde den Fehler.',
        '“Item 1” appears right on load, and after that the button does nothing. Find the bug.',
      ),
      modus: 'js',
      vorschau: true,
      code: js`
        const app = document.querySelector('#app')
        app.innerHTML = '<button id="add">Add item</button><ul id="items"></ul>'

        let count = 0

        function addItem() {
          count++
          const li = document.createElement('li')
          li.textContent = 'Item ' + count
          document.querySelector('#items').append(li)
        }

        document.querySelector('#add').addEventListener('click', addItem())
      `,
      loesung: js`
        const app = document.querySelector('#app')
        app.innerHTML = '<button id="add">Add item</button><ul id="items"></ul>'

        let count = 0

        function addItem() {
          count++
          const li = document.createElement('li')
          li.textContent = 'Item ' + count
          document.querySelector('#items').append(li)
        }

        document.querySelector('#add').addEventListener('click', addItem)
      `,
      tipps: {
        de: ['`addItem()` **ruft** die Funktion auf - übergeben wird ihr Rückgabewert `undefined`.', 'Übergib die Funktion selbst: `addEventListener(\'click\', addItem)`.'],
        en: ['`addItem()` **calls** the function - what gets passed is its return value `undefined`.', 'Pass the function itself: `addEventListener(\'click\', addItem)`.'],
      },
      tests: [
        {
          name: t('Anfangs leer, zwei Klicks = zwei Einträge', 'Empty at first, two clicks = two items'),
          ausdruck: "(() => { const before = document.querySelectorAll('#items li').length; document.querySelector('#add').click(); document.querySelector('#add').click(); return [before, document.querySelectorAll('#items li').length] })()",
          erwartet: [0, 2],
        },
      ],
    },
    {
      id: 'js-dom-zaehler',
      stufe: 'ergaenzen',
      titel: t('Zeichenzähler', 'Character counter'),
      aufgabe: t(
        'Ergänze den Listener: Bei jeder Eingabe zeigt `#counter` „n / 20“. Bei mehr als 20 Zeichen bekommt `#counter` die Klasse `too-long`.',
        'Complete the listener: on every input, `#counter` shows “n / 20”. With more than 20 characters, `#counter` gets the class `too-long`.',
      ),
      modus: 'js',
      vorschau: true,
      code: js`
        const app = document.querySelector('#app')
        app.innerHTML = '<textarea id="message"></textarea><p id="counter">0 / 20</p>'

        const message = document.querySelector('#message')
        const counter = document.querySelector('#counter')

        message.addEventListener('input', () => {
          // TODO
        })
      `,
      loesung: js`
        const app = document.querySelector('#app')
        app.innerHTML = '<textarea id="message"></textarea><p id="counter">0 / 20</p>'

        const message = document.querySelector('#message')
        const counter = document.querySelector('#counter')

        message.addEventListener('input', () => {
          const length = message.value.length
          counter.textContent = length + ' / 20'
          counter.classList.toggle('too-long', length > 20)
        })
      `,
      tipps: {
        de: ['`message.value.length` ist die aktuelle Länge.', '`counter.classList.toggle(\'too-long\', length > 20)` setzt oder entfernt die Klasse.'],
        en: ['`message.value.length` is the current length.', '`counter.classList.toggle(\'too-long\', length > 20)` adds or removes the class.'],
      },
      tests: [
        {
          name: t('Zeigt die Länge an', 'Shows the length'),
          ausdruck: "(() => { const m = document.querySelector('#message'); m.value = 'Hello'; m.dispatchEvent(new Event('input')); return document.querySelector('#counter').textContent })()",
          erwartet: '5 / 20',
        },
        {
          name: t('Klasse too-long ab 21 Zeichen', 'Class too-long from 21 characters'),
          ausdruck: "(() => { const m = document.querySelector('#message'); const c = document.querySelector('#counter'); m.value = 'x'.repeat(21); m.dispatchEvent(new Event('input')); const zuLang = c.classList.contains('too-long'); m.value = 'x'.repeat(20); m.dispatchEvent(new Event('input')); return [zuLang, c.classList.contains('too-long')] })()",
          erwartet: [true, false],
        },
      ],
    },
  ],
}
