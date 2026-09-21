import { js } from '../../lernen/quelltext'
import type { UebungsSammlung } from './typen'

/**
 * Zusätzliche Übungen für Teil 2 (TypeScript) - gestuft wie in js.ts.
 * Alle Code-Übungen laufen mit modus 'ts': Neben den Tests zählt „keine Typfehler“,
 * und Typ-Tests prüfen, dass die Typen genau genug sind (siehe lernen/tsLauf.ts).
 */

const t = <T>(de: T, en: T) => ({ de, en })

export const uebungen: UebungsSammlung = {
  'ts-start': [
    {
      id: 'ts-start-vorhersage',
      stufe: 'vorhersage',
      titel: t('Typfehler - und trotzdem eine Ausgabe?', 'A type error - and still output?'),
      frage: t('Die Typprüfung meldet einen Fehler. Was gibt der Code beim Ausführen aus?', 'The type check reports an error. What does the code print when it runs?'),
      code: js`
        function double(n: number) {
          return n * 2
        }

        console.log(double('21'))
      `,
      antworten: t(['42', '2121', 'Nichts - der Typfehler stoppt das Programm', 'NaN'], ['42', '2121', 'Nothing - the type error stops the program', 'NaN']),
      richtig: 0,
      erklaerung: t(
        'Die Typen werden vor dem Ausführen entfernt, übrig bleibt `\'21\' * 2`. Der Operator `*` wandelt den String in eine Zahl um - also 42. Genau solche stillen Umwandlungen soll die Typprüfung verhindern.',
        'The types are removed before running, leaving `\'21\' * 2`. The `*` operator converts the string into a number - so 42. The type check exists to prevent exactly such silent conversions.',
      ),
    },
    {
      id: 'ts-start-unknown',
      stufe: 'fehler',
      titel: t('Länge von irgendwas', 'The length of anything'),
      aufgabe: t(
        '`lengthOf` bekommt einen Wert vom Typ `unknown`. Für Strings und Arrays soll die Länge herauskommen, für alles andere `0`. Die Typprüfung lässt `value.length` so nicht durch - grenze den Typ vorher ein.',
        '`lengthOf` gets a value of type `unknown`. For strings and arrays it should return the length, for everything else `0`. The type check does not allow `value.length` like this - narrow the type first.',
      ),
      modus: 'ts',
      code: js`
        function lengthOf(value: unknown): number {
          return value.length
        }

        console.log(lengthOf('hello'), lengthOf([1, 2]), lengthOf(42))
      `,
      loesung: js`
        function lengthOf(value: unknown): number {
          if (typeof value === 'string' || Array.isArray(value)) return value.length
          return 0
        }

        console.log(lengthOf('hello'), lengthOf([1, 2]), lengthOf(42))
      `,
      tipps: {
        de: ['`typeof value === \'string\'` grenzt auf String ein, `Array.isArray(value)` auf ein Array.', 'Nach dem `if` bleibt alles andere übrig - dafür `return 0`.'],
        en: ['`typeof value === \'string\'` narrows to a string, `Array.isArray(value)` to an array.', 'After the `if`, everything else is left - `return 0` for that.'],
      },
      tests: [
        { name: "lengthOf('abc')", ausdruck: "lengthOf('abc')", erwartet: 3 },
        { name: 'lengthOf([1, 2])', ausdruck: 'lengthOf([1, 2])', erwartet: 2 },
        { name: 'lengthOf(42)', ausdruck: 'lengthOf(42)', erwartet: 0 },
        { name: 'lengthOf(null)', ausdruck: 'lengthOf(null)', erwartet: 0 },
      ],
    },
    {
      id: 'ts-start-tupel',
      stufe: 'ergaenzen',
      titel: t('Vor- und Nachname als Tupel', 'First and last name as a tuple'),
      aufgabe: t(
        'Ergänze die Typen: `splitName` bekommt einen Text und gibt ein **Tupel** aus Vorname und Rest zurück - kein `string[]`.',
        'Add the types: `splitName` takes a string and returns a **tuple** of first name and the rest - not a `string[]`.',
      ),
      modus: 'ts',
      code: js`
        function splitName(fullName) {
          const [first, ...rest] = fullName.split(' ')
          return [first, rest.join(' ')]
        }

        const [firstName, lastName] = splitName('Ada Lovelace')
        console.log(firstName, '|', lastName)
      `,
      loesung: js`
        function splitName(fullName: string): [string, string] {
          const [first, ...rest] = fullName.split(' ')
          return [first, rest.join(' ')]
        }

        const [firstName, lastName] = splitName('Ada Lovelace')
        console.log(firstName, '|', lastName)
      `,
      tipps: {
        de: ['Der Parameter ist ein `string`.', 'Der Rückgabetyp steht hinter der Klammer: `: [string, string]`.'],
        en: ['The parameter is a `string`.', 'The return type goes after the parenthesis: `: [string, string]`.'],
      },
      tests: [
        { name: "splitName('Ada Lovelace')", ausdruck: "splitName('Ada Lovelace')", erwartet: ['Ada', 'Lovelace'] },
        { name: "splitName('Grace Brewster Hopper')", ausdruck: "splitName('Grace Brewster Hopper')", erwartet: ['Grace', 'Brewster Hopper'] },
      ],
      typTests: [{ name: t('splitName liefert [string, string]', 'splitName returns [string, string]'), code: "const nameParts: [string, string] = splitName('Linus Torvalds')" }],
    },
  ],

  'ts-objekte': [
    {
      id: 'ts-objekte-vorhersage',
      stufe: 'vorhersage',
      titel: t('Ein Feld zu viel', 'One field too many'),
      frage: t('Die Typprüfung meldet hier keinen Fehler. Was wird ausgegeben?', 'The type check reports no error here. What is printed?'),
      code: js`
        type Point = { x: number; y: number }

        const withZ = { x: 1, y: 2, z: 3 }
        const point: Point = withZ

        console.log(point.x + point.y, 'z' in point)
      `,
      antworten: ['3 true', '3 false', '6 true', '3 undefined'],
      richtig: 0,
      erklaerung: t(
        'Strukturelle Typisierung: `withZ` hat mindestens `x` und `y`, also passt es zu `Point`. Der Typ blendet `z` nur aus - zur Laufzeit ist es natürlich noch da.',
        'Structural typing: `withZ` has at least `x` and `y`, so it fits `Point`. The type only hides `z` - at runtime it is of course still there.',
      ),
    },
    {
      id: 'ts-objekte-readonly-fehler',
      stufe: 'fehler',
      titel: t('readonly verletzt', 'readonly violated'),
      aufgabe: t(
        '`withBiggerFont` soll eine Kopie mit 2 px größerer Schrift liefern. Stattdessen verändert sie das Original - und die Typprüfung beschwert sich zu Recht. Repariere die Funktion.',
        '`withBiggerFont` should return a copy with a font 2 px larger. Instead it changes the original - and the type check rightly complains. Fix the function.',
      ),
      modus: 'ts',
      code: js`
        type Settings = {
          readonly theme: string
          readonly fontSize: number
        }

        function withBiggerFont(settings: Settings): Settings {
          settings.fontSize = settings.fontSize + 2
          return settings
        }

        const original: Settings = { theme: 'dark', fontSize: 14 }
        console.log(withBiggerFont(original), original)
      `,
      loesung: js`
        type Settings = {
          readonly theme: string
          readonly fontSize: number
        }

        function withBiggerFont(settings: Settings): Settings {
          return { ...settings, fontSize: settings.fontSize + 2 }
        }

        const original: Settings = { theme: 'dark', fontSize: 14 }
        console.log(withBiggerFont(original), original)
      `,
      tipps: {
        de: ['Statt zu ändern, gibst du ein neues Objekt zurück.', 'Spread kopiert alle Felder, danach überschreibst du eines: `{ ...settings, fontSize: … }`.'],
        en: ['Instead of changing, return a new object.', 'Spread copies all fields, then you overwrite one: `{ ...settings, fontSize: … }`.'],
      },
      tests: [
        { name: t('Neue Schriftgröße', 'New font size'), ausdruck: "withBiggerFont({ theme: 'light', fontSize: 10 }).fontSize", erwartet: 12 },
        { name: t('Das Original bleibt unverändert', 'The original stays unchanged'), ausdruck: "(() => { const s = { theme: 'light', fontSize: 10 }; withBiggerFont(s); return s.fontSize })()", erwartet: 10 },
      ],
    },
    {
      id: 'ts-objekte-extends',
      stufe: 'frei',
      titel: t('Tiere und Haustiere', 'Animals and pets'),
      aufgabe: t(
        'Schreibe ein `interface Animal` mit `name` und `legs` (Zahl) und ein `interface Pet`, das `Animal` um `owner` erweitert. `describePet(pet)` liefert z. B. `"Rex (4 legs) belongs to Ada"`.',
        'Write an `interface Animal` with `name` and `legs` (a number) and an `interface Pet` that extends `Animal` with `owner`. `describePet(pet)` returns e.g. `"Rex (4 legs) belongs to Ada"`.',
      ),
      modus: 'ts',
      code: js`
        // Animal: name, legs - Pet: everything from Animal plus owner


        function describePet(pet) {
        }

        console.log(describePet({ name: 'Rex', legs: 4, owner: 'Ada' }))
      `,
      loesung: js`
        // Animal: name, legs - Pet: everything from Animal plus owner
        interface Animal {
          name: string
          legs: number
        }

        interface Pet extends Animal {
          owner: string
        }

        function describePet(pet: Pet): string {
          return \`\${pet.name} (\${pet.legs} legs) belongs to \${pet.owner}\`
        }

        console.log(describePet({ name: 'Rex', legs: 4, owner: 'Ada' }))
      `,
      tipps: {
        de: ['`interface Pet extends Animal { owner: string }` übernimmt alle Felder von `Animal`.', 'Ein Template-Literal baut den Text: `` `${pet.name} (${pet.legs} legs) …` ``.'],
        en: ['`interface Pet extends Animal { owner: string }` takes over all fields of `Animal`.', 'A template literal builds the text: `` `${pet.name} (${pet.legs} legs) …` ``.'],
      },
      tests: [
        { name: 'describePet(Rex)', ausdruck: "describePet({ name: 'Rex', legs: 4, owner: 'Ada' })", erwartet: 'Rex (4 legs) belongs to Ada' },
        { name: 'describePet(Tweety)', ausdruck: "describePet({ name: 'Tweety', legs: 2, owner: 'Granny' })", erwartet: 'Tweety (2 legs) belongs to Granny' },
      ],
      typTests: [
        { name: t('Ein Pet ist auch ein Animal', 'A pet is also an animal'), code: "const tom: Pet = { name: 'Tom', legs: 4, owner: 'Jerry' }\nconst someAnimal: Animal = tom" },
        { name: t('Ein Pet braucht einen owner', 'A pet needs an owner'), code: "// @ts-expect-error - owner is missing\nconst stray: Pet = { name: 'Stray', legs: 4 }" },
      ],
    },
  ],

  'ts-funktionen': [
    {
      id: 'ts-funktionen-vorhersage',
      stufe: 'vorhersage',
      titel: t('Optionaler Parameter und ??', 'Optional parameter and ??'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: js`
        function greet(name: string, greeting?: string) {
          return \`\${greeting ?? 'Hi'}, \${name}\`
        }

        console.log(greet('Ada'), '|', greet('Ada', ''))
      `,
      antworten: ['Hi, Ada | Hi, Ada', 'Hi, Ada | , Ada', 'undefined, Ada | , Ada', 'Hi, Ada | undefined, Ada'],
      richtig: 1,
      erklaerung: t(
        'Fehlt der optionale Parameter, ist er `undefined` - `??` nimmt dann `\'Hi\'`. Ein leerer String ist aber weder `null` noch `undefined`, also bleibt er stehen.',
        'If the optional parameter is missing, it is `undefined` - then `??` takes `\'Hi\'`. An empty string is neither `null` nor `undefined`, so it stays.',
      ),
    },
    {
      id: 'ts-funktionen-callback-fehler',
      stufe: 'fehler',
      titel: t('Der falsche Callback', 'The wrong callback'),
      aufgabe: t(
        'Das Ergebnis stimmt zufällig, aber die Typprüfung meldet einen Fehler: `tenPercent` passt nicht zum erwarteten Funktionstyp. Repariere `tenPercent`, ohne `applyDiscount` zu ändern.',
        'The result happens to be right, but the type check reports an error: `tenPercent` does not fit the expected function type. Fix `tenPercent` without changing `applyDiscount`.',
      ),
      modus: 'ts',
      code: js`
        function applyDiscount(prices: number[], discount: (price: number) => number): number[] {
          return prices.map(discount)
        }

        const tenPercent = (price: string) => Number(price) * 0.9

        console.log(applyDiscount([10, 20], tenPercent))
      `,
      loesung: js`
        function applyDiscount(prices: number[], discount: (price: number) => number): number[] {
          return prices.map(discount)
        }

        const tenPercent = (price: number) => price * 0.9

        console.log(applyDiscount([10, 20], tenPercent))
      `,
      tipps: {
        de: ['Lies den Typ des Parameters `discount`: Welchen Typ bekommt der Callback?', 'Der Callback bekommt eine Zahl - dann braucht es auch kein `Number(…)` mehr.'],
        en: ['Read the type of the `discount` parameter: which type does the callback get?', 'The callback gets a number - then you no longer need `Number(…)` either.'],
      },
      tests: [{ name: 'applyDiscount([10, 20], tenPercent)', ausdruck: 'applyDiscount([10, 20], tenPercent)', erwartet: [9, 18] }],
    },
    {
      id: 'ts-funktionen-pipe',
      stufe: 'ergaenzen',
      titel: t('Funktionen hintereinander schalten', 'Chaining functions'),
      aufgabe: t(
        '`pipe(first, second)` liefert eine neue Funktion, die erst `first` und dann `second` anwendet. Ergänze die Typen: Beide Parameter und das Ergebnis sind Funktionen von Zahl zu Zahl. Tipp: Ein eigener Typ `NumberFn` spart Schreibarbeit.',
        '`pipe(first, second)` returns a new function that applies `first` and then `second`. Add the types: both parameters and the result are functions from number to number. Tip: a type of your own, `NumberFn`, saves typing.',
      ),
      modus: 'ts',
      code: js`
        function pipe(first, second) {
          return (value) => second(first(value))
        }

        const addOne = (n: number) => n + 1
        const double = (n: number) => n * 2

        console.log(pipe(addOne, double)(3))
      `,
      loesung: js`
        type NumberFn = (value: number) => number

        function pipe(first: NumberFn, second: NumberFn): NumberFn {
          return (value) => second(first(value))
        }

        const addOne = (n: number) => n + 1
        const double = (n: number) => n * 2

        console.log(pipe(addOne, double)(3))
      `,
      tipps: {
        de: ['`type NumberFn = (value: number) => number`', 'Mit dem Rückgabetyp `NumberFn` bekommt `value` in der Arrow Function seinen Typ automatisch.'],
        en: ['`type NumberFn = (value: number) => number`', 'With the return type `NumberFn`, `value` in the arrow function gets its type automatically.'],
      },
      tests: [
        { name: 'pipe(addOne, double)(3)', ausdruck: 'pipe(addOne, double)(3)', erwartet: 8 },
        { name: 'pipe(double, addOne)(3)', ausdruck: 'pipe(double, addOne)(3)', erwartet: 7 },
      ],
      typTests: [
        { name: t('pipe liefert eine Zahlenfunktion', 'pipe returns a number function'), code: 'const piped: (value: number) => number = pipe(addOne, double)' },
        { name: t('Nur Funktionen von Zahl zu Zahl', 'Only functions from number to number'), code: '// @ts-expect-error - takes a string\npipe((text: string) => text.length, double)' },
      ],
    },
  ],

  'ts-unions': [
    {
      id: 'ts-unions-vorhersage',
      stufe: 'vorhersage',
      titel: t('Drei Typen, drei Zweige', 'Three types, three branches'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: js`
        function format(value: string | number | boolean) {
          if (typeof value === 'string') return value.toUpperCase()
          if (typeof value === 'number') return value.toFixed(1)
          return value ? 'yes' : 'no'
        }

        console.log(format('ok'), format(2), format(false))
      `,
      antworten: ['OK 2.0 no', 'ok 2 false', 'OK 2.0 false', 'OK 2 no'],
      richtig: 0,
      erklaerung: t(
        'Jedes `typeof` grenzt ein: Im ersten Zweig ist `value` ein String, im zweiten eine Zahl, danach bleibt nur `boolean` übrig.',
        'Each `typeof` narrows: in the first branch `value` is a string, in the second a number, after that only `boolean` is left.',
      ),
    },
    {
      id: 'ts-unions-fall-fehlt',
      stufe: 'fehler',
      titel: t('Ein Fall fehlt', 'A case is missing'),
      aufgabe: t(
        'Die Action `double` wurde neu eingeführt, aber `apply` behandelt sie noch nicht - die Typprüfung meldet, dass die Funktion nicht immer eine Zahl zurückgibt. Ergänze den Fall (`double` verdoppelt die Summe) und sichere das `switch` mit einer `never`-Prüfung ab.',
        'The `double` action was newly added, but `apply` does not handle it yet - the type check reports that the function does not always return a number. Add the case (`double` doubles the total) and secure the `switch` with a `never` check.',
      ),
      modus: 'ts',
      code: js`
        type Action = { type: 'add'; amount: number } | { type: 'reset' } | { type: 'double' }

        function apply(total: number, action: Action): number {
          switch (action.type) {
            case 'add':
              return total + action.amount
            case 'reset':
              return 0
          }
        }

        console.log(apply(5, { type: 'add', amount: 3 }), apply(5, { type: 'double' }))
      `,
      loesung: js`
        type Action = { type: 'add'; amount: number } | { type: 'reset' } | { type: 'double' }

        function apply(total: number, action: Action): number {
          switch (action.type) {
            case 'add':
              return total + action.amount
            case 'reset':
              return 0
            case 'double':
              return total * 2
            default: {
              const unhandled: never = action
              throw new Error('Unknown action: ' + JSON.stringify(unhandled))
            }
          }
        }

        console.log(apply(5, { type: 'add', amount: 3 }), apply(5, { type: 'double' }))
      `,
      tipps: {
        de: ['Ein weiteres `case \'double\': return total * 2`.', 'Im `default` hilft `const unhandled: never = action` - kommt später eine Action dazu, meldet sich die Typprüfung genau dort.'],
        en: ['Another `case \'double\': return total * 2`.', 'In `default`, `const unhandled: never = action` helps - if an action is added later, the type check reports exactly there.'],
      },
      tests: [
        { name: "apply(5, { type: 'double' })", ausdruck: "apply(5, { type: 'double' })", erwartet: 10 },
        { name: "apply(5, { type: 'add', amount: 3 })", ausdruck: "apply(5, { type: 'add', amount: 3 })", erwartet: 8 },
        { name: "apply(5, { type: 'reset' })", ausdruck: "apply(5, { type: 'reset' })", erwartet: 0 },
      ],
    },
    {
      id: 'ts-unions-zustand',
      stufe: 'frei',
      titel: t('Ladezustand ohne unmögliche Kombinationen', 'Loading state without impossible combinations'),
      aufgabe: t(
        'Modelliere `RequestState` als Discriminated Union über `status`: `idle`, `loading`, `success` (mit `data: string[]`) und `error` (mit `message: string`). `render(state)` liefert `"Nothing loaded yet"`, `"Loading …"`, `"3 items"` bzw. `"Error: …"`.',
        'Model `RequestState` as a discriminated union on `status`: `idle`, `loading`, `success` (with `data: string[]`) and `error` (with `message: string`). `render(state)` returns `"Nothing loaded yet"`, `"Loading …"`, `"3 items"` or `"Error: …"`.',
      ),
      modus: 'ts',
      code: js`
        type RequestState = unknown

        function render(state: RequestState): string {
          return ''
        }

        console.log(render({ status: 'success', data: ['a', 'b', 'c'] }))
      `,
      loesung: js`
        type RequestState =
          | { status: 'idle' }
          | { status: 'loading' }
          | { status: 'success'; data: string[] }
          | { status: 'error'; message: string }

        function render(state: RequestState): string {
          switch (state.status) {
            case 'idle':
              return 'Nothing loaded yet'
            case 'loading':
              return 'Loading …'
            case 'success':
              return \`\${state.data.length} items\`
            case 'error':
              return \`Error: \${state.message}\`
          }
        }

        console.log(render({ status: 'success', data: ['a', 'b', 'c'] }))
      `,
      tipps: {
        de: ['Vier Objekttypen mit `|` verbunden - jeder mit seinem eigenen `status`-Literal.', 'In `render` ein `switch (state.status)` mit vier Fällen.'],
        en: ['Four object types joined with `|` - each with its own `status` literal.', 'In `render`, a `switch (state.status)` with four cases.'],
      },
      tests: [
        { name: 'idle', ausdruck: "render({ status: 'idle' })", erwartet: 'Nothing loaded yet' },
        { name: 'loading', ausdruck: "render({ status: 'loading' })", erwartet: 'Loading …' },
        { name: 'success', ausdruck: "render({ status: 'success', data: ['a', 'b', 'c'] })", erwartet: '3 items' },
        { name: 'error', ausdruck: "render({ status: 'error', message: 'offline' })", erwartet: 'Error: offline' },
      ],
      typTests: [
        { name: t('success braucht data', 'success needs data'), code: "// @ts-expect-error - data is missing\nconst noData: RequestState = { status: 'success' }" },
        { name: t('loading hat keine data', 'loading has no data'), code: "// @ts-expect-error - no data while loading\nconst loadingWithData: RequestState = { status: 'loading', data: [] }" },
      ],
    },
  ],

  'ts-generics': [
    {
      id: 'ts-generics-vorhersage',
      stufe: 'vorhersage',
      titel: t('Was wird aus T?', 'What does T become?'),
      frage: t('Welchen Typ hat `result`?', 'What is the type of `result`?'),
      code: js`
        function wrap<T>(value: T) {
          return { value, list: [value] }
        }

        const result = wrap(42)
      `,
      antworten: ['{ value: number; list: number[] }', '{ value: 42; list: 42[] }', '{ value: any; list: any[] }', '{ value: T; list: T[] }'],
      richtig: 0,
      erklaerung: t(
        'TypeScript leitet `T` aus dem Argument ab und verbreitert das Literal `42` dabei zu `number`. Der Rückgabetyp wird mit diesem `T` ausgefüllt.',
        'TypeScript infers `T` from the argument and widens the literal `42` to `number`. The return type is filled in with that `T`.',
      ),
    },
    {
      id: 'ts-generics-constraint-fehler',
      stufe: 'fehler',
      titel: t('T weiß zu wenig', 'T knows too little'),
      aufgabe: t(
        'Der Code läuft, aber die Typprüfung meldet: `length` gibt es auf `T` nicht. Schränke `T` so ein, dass nur Werte mit einer `length` erlaubt sind.',
        'The code runs, but the type check reports: `length` does not exist on `T`. Constrain `T` so that only values with a `length` are allowed.',
      ),
      modus: 'ts',
      code: js`
        function longestItem<T>(items: T[]): T | undefined {
          let best: T | undefined
          for (const item of items) {
            if (best === undefined || item.length > best.length) best = item
          }
          return best
        }

        console.log(longestItem(['a', 'abc', 'ab']), longestItem([[1], [1, 2]]))
      `,
      loesung: js`
        function longestItem<T extends { length: number }>(items: T[]): T | undefined {
          let best: T | undefined
          for (const item of items) {
            if (best === undefined || item.length > best.length) best = item
          }
          return best
        }

        console.log(longestItem(['a', 'abc', 'ab']), longestItem([[1], [1, 2]]))
      `,
      tipps: {
        de: ['Einschränkungen stehen direkt am Typparameter: `<T extends …>`.', '`<T extends { length: number }>` erlaubt Strings, Arrays und alles andere mit `length`.'],
        en: ['Constraints go right on the type parameter: `<T extends …>`.', '`<T extends { length: number }>` allows strings, arrays and anything else with a `length`.'],
      },
      tests: [
        { name: "longestItem(['a', 'abc', 'ab'])", ausdruck: "longestItem(['a', 'abc', 'ab'])", erwartet: 'abc' },
        { name: 'longestItem([[1], [1, 2]])', ausdruck: 'longestItem([[1], [1, 2]])', erwartet: [1, 2] },
      ],
      typTests: [{ name: t('Zahlen haben keine length', 'Numbers have no length'), code: '// @ts-expect-error - numbers have no length\nlongestItem([1, 2, 3])' }],
    },
    {
      id: 'ts-generics-result',
      stufe: 'ergaenzen',
      titel: t('Ein generischer Result-Typ', 'A generic Result type'),
      aufgabe: t(
        'Schreibe `Result<T>`: entweder `{ ok: true; value: T }` oder `{ ok: false; error: string }`. Die Funktionen darunter sind fertig und sollen danach ohne Typfehler laufen.',
        'Write `Result<T>`: either `{ ok: true; value: T }` or `{ ok: false; error: string }`. The functions below are finished and should then run without type errors.',
      ),
      modus: 'ts',
      code: js`
        type Result<T> = unknown

        function safeDivide(a: number, b: number): Result<number> {
          return b === 0 ? { ok: false, error: 'Division by zero' } : { ok: true, value: a / b }
        }

        function unwrapOr<T>(result: Result<T>, fallback: T): T {
          return result.ok ? result.value : fallback
        }

        console.log(unwrapOr(safeDivide(10, 2), 0), unwrapOr(safeDivide(1, 0), -1))
      `,
      loesung: js`
        type Result<T> = { ok: true; value: T } | { ok: false; error: string }

        function safeDivide(a: number, b: number): Result<number> {
          return b === 0 ? { ok: false, error: 'Division by zero' } : { ok: true, value: a / b }
        }

        function unwrapOr<T>(result: Result<T>, fallback: T): T {
          return result.ok ? result.value : fallback
        }

        console.log(unwrapOr(safeDivide(10, 2), 0), unwrapOr(safeDivide(1, 0), -1))
      `,
      tipps: {
        de: ['Eine Union aus zwei Objekttypen - `ok` ist das gemeinsame Feld mit den Literalen `true` und `false`.', '`type Result<T> = { ok: true; value: T } | { ok: false; error: string }`'],
        en: ['A union of two object types - `ok` is the common field with the literals `true` and `false`.', '`type Result<T> = { ok: true; value: T } | { ok: false; error: string }`'],
      },
      tests: [
        { name: 'unwrapOr(safeDivide(10, 2), 0)', ausdruck: 'unwrapOr(safeDivide(10, 2), 0)', erwartet: 5 },
        { name: 'safeDivide(1, 0)', ausdruck: 'safeDivide(1, 0)', erwartet: { ok: false, error: 'Division by zero' } },
      ],
      typTests: [
        { name: t('Erfolg mit dem richtigen Werttyp', 'Success with the right value type'), code: "const good: Result<string> = { ok: true, value: 'x' }\n// @ts-expect-error - value must be a string\nconst wrongValue: Result<string> = { ok: true, value: 1 }" },
        { name: t('Ein Fehlschlag hat error statt value', 'A failure has error instead of value'), code: "// @ts-expect-error - a failure needs error\nconst mixed: Result<string> = { ok: false, value: 'x' }" },
      ],
    },
  ],

  'ts-utility': [
    {
      id: 'ts-utility-vorhersage',
      stufe: 'vorhersage',
      titel: t('Verbreitert oder nicht?', 'Widened or not?'),
      frage: t('Welche Zeile meldet die Typprüfung als Fehler?', 'Which line does the type check report as an error?'),
      code: js`
        const loose = { size: 'small' }
        const exact = { size: 'small' } as const

        loose.size = 'huge'   // line A
        exact.size = 'large'  // line B
      `,
      antworten: t(['Nur Zeile A', 'Nur Zeile B', 'Beide', 'Keine'], ['Only line A', 'Only line B', 'Both', 'Neither']),
      richtig: 1,
      erklaerung: t(
        'Ohne `as const` ist `loose.size` ein ganz normaler `string` - jeder Text ist erlaubt. Mit `as const` ist `exact.size` readonly und hat den Literal-Typ `\'small\'`.',
        'Without `as const`, `loose.size` is a plain `string` - any text is allowed. With `as const`, `exact.size` is readonly and has the literal type `\'small\'`.',
      ),
    },
    {
      id: 'ts-utility-id-schuetzen',
      stufe: 'fehler',
      titel: t('Die id darf sich nicht ändern', 'The id must not change'),
      aufgabe: t(
        '`updateUser` erlaubt mit `Partial<User>` auch Änderungen an der `id` - das soll ein Typfehler sein. Ändere nur den Typ des Parameters `changes`.',
        'With `Partial<User>`, `updateUser` also allows changes to the `id` - that should be a type error. Only change the type of the `changes` parameter.',
      ),
      modus: 'ts',
      code: js`
        type User = { id: number; name: string; email: string }

        function updateUser(user: User, changes: Partial<User>): User {
          return { ...user, ...changes }
        }

        const ada: User = { id: 1, name: 'Ada', email: 'ada@example.com' }
        console.log(updateUser(ada, { email: 'ada@lovelace.dev' }))
      `,
      loesung: js`
        type User = { id: number; name: string; email: string }

        function updateUser(user: User, changes: Partial<Omit<User, 'id'>>): User {
          return { ...user, ...changes }
        }

        const ada: User = { id: 1, name: 'Ada', email: 'ada@example.com' }
        console.log(updateUser(ada, { email: 'ada@lovelace.dev' }))
      `,
      tipps: {
        de: ['Erst die `id` entfernen, dann alles optional machen.', '`Partial<Omit<User, \'id\'>>`'],
        en: ['First remove the `id`, then make everything optional.', '`Partial<Omit<User, \'id\'>>`'],
      },
      tests: [{ name: t('E-Mail ändern', 'Change the email'), ausdruck: "updateUser(ada, { email: 'x@y.z' }).email", erwartet: 'x@y.z' }],
      typTests: [
        { name: t('name und email sind änderbar', 'name and email can be changed'), code: "updateUser(ada, { name: 'Augusta' })" },
        { name: t('Die id ist nicht änderbar', 'The id cannot be changed'), code: '// @ts-expect-error - the id cannot be changed\nupdateUser(ada, { id: 99 })' },
      ],
    },
    {
      id: 'ts-utility-rollen',
      stufe: 'frei',
      titel: t('Rollen und Rechte', 'Roles and permissions'),
      aufgabe: t(
        'Mach `ROLES` zur einzigen Quelle: `Role` soll genau einer der Werte sein, und `PERMISSIONS` muss für **jede** Rolle einen Eintrag haben. `can(role, action)` prüft, ob die Rolle die Aktion darf.',
        'Make `ROLES` the single source: `Role` should be exactly one of the values, and `PERMISSIONS` must have an entry for **every** role. `can(role, action)` checks whether the role may do the action.',
      ),
      modus: 'ts',
      code: js`
        const ROLES = ['admin', 'editor', 'viewer']
        type Role = string

        const PERMISSIONS = {
          admin: ['read', 'write', 'delete'],
          editor: ['read', 'write'],
          viewer: ['read'],
        }

        function can(role: Role, action: string): boolean {
          return PERMISSIONS[role].includes(action)
        }

        console.log(ROLES, can('editor', 'write'), can('viewer', 'delete'))
      `,
      loesung: js`
        const ROLES = ['admin', 'editor', 'viewer'] as const
        type Role = (typeof ROLES)[number]

        const PERMISSIONS: Record<Role, string[]> = {
          admin: ['read', 'write', 'delete'],
          editor: ['read', 'write'],
          viewer: ['read'],
        }

        function can(role: Role, action: string): boolean {
          return PERMISSIONS[role].includes(action)
        }

        console.log(ROLES, can('editor', 'write'), can('viewer', 'delete'))
      `,
      tipps: {
        de: ['`as const` hinter dem Array, dann `type Role = (typeof ROLES)[number]`.', '`const PERMISSIONS: Record<Role, string[]>` verlangt einen Eintrag pro Rolle.'],
        en: ['`as const` after the array, then `type Role = (typeof ROLES)[number]`.', '`const PERMISSIONS: Record<Role, string[]>` requires one entry per role.'],
      },
      tests: [
        { name: "can('editor', 'write')", ausdruck: "can('editor', 'write')", erwartet: true },
        { name: "can('viewer', 'delete')", ausdruck: "can('viewer', 'delete')", erwartet: false },
      ],
      typTests: [
        { name: t('Role ist eine Union der Werte', 'Role is a union of the values'), code: "const editorRole: Role = 'editor'\n// @ts-expect-error - there is no guest role\ncan('guest', 'read')" },
        { name: t('PERMISSIONS hat einen Eintrag pro Rolle', 'PERMISSIONS has one entry per role'), code: 'const checkedPermissions: Record<Role, string[]> = PERMISSIONS' },
      ],
    },
  ],

  'ts-klassen': [
    {
      id: 'ts-klassen-vorhersage',
      stufe: 'vorhersage',
      titel: t('Wie privat ist private?', 'How private is private?'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: js`
        class Box {
          private secret = 42
        }

        const box = new Box()
        console.log((box as any).secret)
      `,
      antworten: t(['42', 'undefined', 'Einen Laufzeitfehler: private', 'Nichts'], ['42', 'undefined', 'A runtime error: private', 'Nothing']),
      richtig: 0,
      erklaerung: t(
        '`private` prüft nur der Compiler - `as any` schaltet ihn ab. Zur Laufzeit ist `secret` ein ganz normales Feld. Wirklich privat wäre nur `#secret`.',
        'Only the compiler checks `private` - `as any` switches it off. At runtime `secret` is a perfectly normal field. Only `#secret` would be truly private.',
      ),
    },
    {
      id: 'ts-klassen-interface-fehler',
      stufe: 'fehler',
      titel: t('Versprechen nicht gehalten', 'Promise not kept'),
      aufgabe: t(
        '`ConsoleLogger` behauptet, `Logger` zu erfüllen - die Typprüfung sieht das anders. Ergänze, was fehlt: `count` ist die Zahl der bisher geloggten Nachrichten (am besten als Getter).',
        '`ConsoleLogger` claims to fulfill `Logger` - the type check disagrees. Add what is missing: `count` is the number of messages logged so far (ideally as a getter).',
      ),
      modus: 'ts',
      code: js`
        interface Logger {
          log(message: string): void
          readonly count: number
        }

        class ConsoleLogger implements Logger {
          private messages: string[] = []

          log(message: string) {
            this.messages.push(message)
          }
        }

        const logger = new ConsoleLogger()
        logger.log('start')
        logger.log('done')
      `,
      loesung: js`
        interface Logger {
          log(message: string): void
          readonly count: number
        }

        class ConsoleLogger implements Logger {
          private messages: string[] = []

          log(message: string) {
            this.messages.push(message)
          }

          get count() {
            return this.messages.length
          }
        }

        const logger = new ConsoleLogger()
        logger.log('start')
        logger.log('done')
      `,
      tipps: {
        de: ['Die Fehlermeldung nennt das fehlende Mitglied.', '`get count() { return this.messages.length }`'],
        en: ['The error message names the missing member.', '`get count() { return this.messages.length }`'],
      },
      tests: [{ name: 'logger.count', ausdruck: 'logger.count', erwartet: 2 }],
    },
    {
      id: 'ts-klassen-abstract',
      stufe: 'ergaenzen',
      titel: t('Festangestellt und stundenweise', 'Full-time and hourly'),
      aufgabe: t(
        'Schreibe die beiden Unterklassen von `Employee`: `FullTime(name, salary)` mit festem Monatsgehalt und `Hourly(name, hours, rate)` mit Stunden mal Stundensatz. Nutze Parameter-Properties.',
        'Write the two subclasses of `Employee`: `FullTime(name, salary)` with a fixed monthly salary and `Hourly(name, hours, rate)` with hours times rate. Use parameter properties.',
      ),
      modus: 'ts',
      code: js`
        abstract class Employee {
          constructor(public name: string) {}

          abstract monthlySalary(): number

          yearlySalary() {
            return this.monthlySalary() * 12
          }
        }

        class FullTime extends Employee {
        }

        class Hourly extends Employee {
        }

        const team: Employee[] = [new FullTime('Ada', 5000), new Hourly('Linus', 80, 25)]
        for (const person of team) console.log(person.name, person.monthlySalary())
      `,
      loesung: js`
        abstract class Employee {
          constructor(public name: string) {}

          abstract monthlySalary(): number

          yearlySalary() {
            return this.monthlySalary() * 12
          }
        }

        class FullTime extends Employee {
          constructor(name: string, private salary: number) {
            super(name)
          }

          monthlySalary() {
            return this.salary
          }
        }

        class Hourly extends Employee {
          constructor(name: string, private hours: number, private rate: number) {
            super(name)
          }

          monthlySalary() {
            return this.hours * this.rate
          }
        }

        const team: Employee[] = [new FullTime('Ada', 5000), new Hourly('Linus', 80, 25)]
        for (const person of team) console.log(person.name, person.monthlySalary())
      `,
      tipps: {
        de: ['Der Konstruktor ruft zuerst `super(name)` auf.', '`constructor(name: string, private salary: number) { super(name) }` - und dann `monthlySalary()` schreiben.'],
        en: ['The constructor calls `super(name)` first.', '`constructor(name: string, private salary: number) { super(name) }` - and then write `monthlySalary()`.'],
      },
      tests: [
        { name: "new FullTime('Ada', 5000).yearlySalary()", ausdruck: "new FullTime('Ada', 5000).yearlySalary()", erwartet: 60000 },
        { name: "new Hourly('Linus', 80, 25).monthlySalary()", ausdruck: "new Hourly('Linus', 80, 25).monthlySalary()", erwartet: 2000 },
      ],
    },
  ],

  'ts-fortgeschritten': [
    {
      id: 'ts-fortgeschritten-vorhersage',
      stufe: 'vorhersage',
      titel: t('Die Behauptung mit as', 'The claim with as'),
      frage: t('Die Typprüfung meldet nichts. Was wird ausgegeben?', 'The type check reports nothing. What is printed?'),
      code: js`
        const data = JSON.parse('{ "price": "9.99" }') as { price: number }

        console.log(data.price + 1)
      `,
      antworten: ['10.99', '9.991', 'NaN', 'Error'],
      richtig: 1,
      erklaerung: t(
        '`as` prüft nichts. `price` ist in Wahrheit der String `"9.99"`, und `+ 1` hängt deshalb eine 1 an. Daten von außen immer zur Laufzeit prüfen!',
        '`as` checks nothing. `price` really is the string `"9.99"`, so `+ 1` appends a 1. Always check data from outside at runtime!',
      ),
    },
    {
      id: 'ts-fortgeschritten-parse',
      stufe: 'fehler',
      titel: t('Blindes Vertrauen', 'Blind trust'),
      aufgabe: t(
        '`parseUser` behauptet mit `as`, dass jede Eingabe ein `User` ist. Prüfe die Daten stattdessen wirklich: Ist `data` kein Objekt oder haben `id` (Zahl) und `name` (Text) den falschen Typ, wirf `new Error(\'Invalid user\')`.',
        '`parseUser` claims with `as` that every input is a `User`. Actually check the data instead: if `data` is not an object, or `id` (a number) and `name` (a string) have the wrong type, throw `new Error(\'Invalid user\')`.',
      ),
      modus: 'ts',
      code: js`
        type User = { id: number; name: string }

        function parseUser(data: unknown): User {
          return data as User
        }

        console.log(parseUser(JSON.parse('{ "id": 1, "name": "Ada" }')))
      `,
      loesung: js`
        type User = { id: number; name: string }

        function parseUser(data: unknown): User {
          if (typeof data !== 'object' || data === null) throw new Error('Invalid user')
          if (!('id' in data) || typeof data.id !== 'number') throw new Error('Invalid user')
          if (!('name' in data) || typeof data.name !== 'string') throw new Error('Invalid user')
          return { id: data.id, name: data.name }
        }

        console.log(parseUser(JSON.parse('{ "id": 1, "name": "Ada" }')))
      `,
      tipps: {
        de: ['Zuerst: `typeof data !== \'object\' || data === null` - dann ist es kein Objekt.', 'Mit `\'id\' in data && typeof data.id === \'number\'` grenzt TypeScript Schritt für Schritt ein - am Ende brauchst du kein `as` mehr.'],
        en: ['First: `typeof data !== \'object\' || data === null` - then it is not an object.', 'With `\'id\' in data && typeof data.id === \'number\'` TypeScript narrows step by step - in the end you no longer need `as`.'],
      },
      tests: [
        { name: t('Gültige Daten', 'Valid data'), ausdruck: "parseUser({ id: 1, name: 'Ada' })", erwartet: { id: 1, name: 'Ada' } },
        { name: t('id als Text wird abgelehnt', 'id as a string is rejected'), ausdruck: "(() => { try { parseUser({ id: '1', name: 'Ada' }); return false } catch (e) { return e.message === 'Invalid user' } })()" },
        { name: t('null wird abgelehnt', 'null is rejected'), ausdruck: '(() => { try { parseUser(null); return false } catch (e) { return e.message === \'Invalid user\' } })()' },
      ],
    },
    {
      id: 'ts-fortgeschritten-getters',
      stufe: 'ergaenzen',
      titel: t('Getter per Mapped Type', 'Getters via a mapped type'),
      aufgabe: t(
        '`createGetters` baut zu jedem Feld eine Funktion: aus `name` wird `getName()`. Die Funktion ist fertig - schreibe den Typ `Getters<T>` mit einem Mapped Type und einem Template Literal Type.',
        '`createGetters` builds a function for every field: `name` becomes `getName()`. The function is finished - write the type `Getters<T>` with a mapped type and a template literal type.',
      ),
      modus: 'ts',
      code: js`
        type Getters<T> = unknown

        function createGetters<T extends Record<string, unknown>>(obj: T): Getters<T> {
          const result: Record<string, () => unknown> = {}
          for (const key of Object.keys(obj)) {
            result['get' + key[0].toUpperCase() + key.slice(1)] = () => obj[key]
          }
          return result as Getters<T>
        }

        const getters = createGetters({ name: 'Ada', age: 36 })
        console.log(getters.getName(), getters.getAge())
      `,
      loesung: js`
        type Getters<T> = {
          [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K]
        }

        function createGetters<T extends Record<string, unknown>>(obj: T): Getters<T> {
          const result: Record<string, () => unknown> = {}
          for (const key of Object.keys(obj)) {
            result['get' + key[0].toUpperCase() + key.slice(1)] = () => obj[key]
          }
          return result as Getters<T>
        }

        const getters = createGetters({ name: 'Ada', age: 36 })
        console.log(getters.getName(), getters.getAge())
      `,
      tipps: {
        de: ['Ein Mapped Type mit Umbenennung: `{ [K in keyof T as NeuerName]: Werttyp }`.', 'Der neue Name ist `get` plus `Capitalize<string & K>` als Template Literal Type, der Werttyp `() => T[K]`.'],
        en: ['A mapped type with renaming: `{ [K in keyof T as NewName]: ValueType }`.', 'The new name is `get` plus `Capitalize<string & K>` as a template literal type, the value type `() => T[K]`.'],
      },
      tests: [{ name: 'getters.getName()', ausdruck: 'getters.getName()', erwartet: 'Ada' }],
      typTests: [
        { name: t('Die Getter kennen ihre Typen', 'The getters know their types'), code: 'const nameValue: string = getters.getName()\nconst ageValue: number = getters.getAge()' },
        { name: t('Nur Getter für vorhandene Felder', 'Only getters for existing fields'), code: '// @ts-expect-error - there is no email field\ngetters.getEmail()' },
      ],
    },
  ],
}
