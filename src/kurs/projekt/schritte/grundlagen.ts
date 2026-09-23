import { js } from '../../../lernen/quelltext'
import { P1_START, P1_LOESUNG, P2_START, P2_LOESUNG, P3_START, P3_LOESUNG, P4_LOESUNG, P5_LOESUNG } from './code'
import { TEST_HINZUFUEGEN, TEST_LEER, TEST_UMSCHALTEN, TEST_LOESCHEN, TEST_FILTER, TEST_ARIA_PRESSED } from './tests'
import { t, type SchrittInhalt } from './typen'

/** Steps 1-5: plain JavaScript, then React with components, state and data flow. */
export const schritteGrundlagen: Record<string, SchrittInhalt> = {
  'projekt-1-daten': {
    modus: 'js',
    einleitung: {
      de: 'Bevor es eine Oberfläche gibt, braucht die App ein **Datenmodell**: Ein Todo ist ein Objekt `{ id, text, done }`, alle Todos zusammen ein Array.\n\nDie Funktionen hier verändern nie das übergebene Array, sondern geben ein **neues** zurück - genau so, wie React es später von State verlangt ([[js-referenzen]]). Weil sie nichts anderes tun, als aus Eingaben ein Ergebnis zu berechnen, sind es **reine Funktionen**.',
      en: 'Before there is a UI, the app needs a **data model**: a todo is an object `{ id, text, done }`, and all todos together form an array.\n\nThe functions here never change the array they receive but return a **new** one - exactly what React will later require for state ([[js-referenzen]]). Because they do nothing but compute a result from their inputs, they are **pure functions**.',
    },
    anforderungen: {
      de: [
        '`addTodo(todos, text)` hängt `{ id, text, done: false }` an - Text ohne Leerzeichen am Rand, `id` = größte vorhandene id + 1 (oder 1)',
        'Leerer Text: `addTodo` gibt die Todos unverändert zurück',
        '`toggleTodo(todos, id)` kehrt `done` des passenden Todos um',
        '`removeTodo(todos, id)` entfernt das passende Todo',
        '`filterTodos(todos, filter)` liefert für `all`, `open` bzw. `done` die passenden Todos',
        '`countOpen(todos)` zählt die offenen Todos',
        'Keine Funktion verändert das übergebene Array oder seine Objekte',
      ],
      en: [
        '`addTodo(todos, text)` appends `{ id, text, done: false }` - text without surrounding spaces, `id` = highest existing id + 1 (or 1)',
        'Empty text: `addTodo` returns the todos unchanged',
        '`toggleTodo(todos, id)` flips `done` of the matching todo',
        '`removeTodo(todos, id)` removes the matching todo',
        '`filterTodos(todos, filter)` returns the matching todos for `all`, `open` or `done`',
        '`countOpen(todos)` counts the open todos',
        'No function changes the array it receives or its objects',
      ],
    },
    start: P1_START,
    loesung: P1_LOESUNG,
    tipps: {
      de: [
        'Für `addTodo`: `text.trim()` entfernt Leerzeichen, `[...todos, neu]` erzeugt das neue Array.',
        'Die nächste id: `Math.max(...todos.map((todo) => todo.id)) + 1` - aber Vorsicht, `Math.max()` ohne Werte ergibt `-Infinity`.',
        '`toggleTodo` mit `map`: für das passende Todo `{ ...todo, done: !todo.done }` zurückgeben, sonst das Todo selbst.',
        '`removeTodo`, `filterTodos` und `countOpen` sind jeweils ein `filter` ([[js-arrays]]).',
      ],
      en: [
        'For `addTodo`: `text.trim()` removes spaces, `[...todos, newTodo]` creates the new array.',
        'The next id: `Math.max(...todos.map((todo) => todo.id)) + 1` - but careful, `Math.max()` without values is `-Infinity`.',
        '`toggleTodo` with `map`: return `{ ...todo, done: !todo.done }` for the matching todo, otherwise the todo itself.',
        '`removeTodo`, `filterTodos` and `countOpen` are each a single `filter` ([[js-arrays]]).',
      ],
    },
    tests: [
      { name: t('addTodo fügt ein Todo mit id 1 hinzu', 'addTodo adds a todo with id 1'), ausdruck: "addTodo([], '  Learn JS  ')", erwartet: [{ id: 1, text: 'Learn JS', done: false }] },
      { name: t('addTodo ignoriert leeren Text', 'addTodo ignores empty text'), ausdruck: "addTodo([], '   ')", erwartet: [] },
      { name: t('addTodo vergibt größte id + 1', 'addTodo uses highest id + 1'), ausdruck: "addTodo([{ id: 5, text: 'a', done: false }, { id: 2, text: 'b', done: true }], 'c')[2].id", erwartet: 6 },
      { name: t('addTodo verändert das Original nicht', 'addTodo does not change the original'), ausdruck: "(() => { const list = []; const result = addTodo(list, 'x'); return list.length === 0 && result !== list })()" },
      {
        name: t('toggleTodo kehrt done um', 'toggleTodo flips done'),
        ausdruck: "toggleTodo([{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }], 2)",
        erwartet: [{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: true }],
      },
      { name: t('toggleTodo verändert das Original-Objekt nicht', 'toggleTodo does not change the original object'), ausdruck: "(() => { const list = [{ id: 1, text: 'a', done: false }]; const result = toggleTodo(list, 1); return list[0].done === false && result[0].done === true })()" },
      { name: t('removeTodo entfernt das Todo', 'removeTodo removes the todo'), ausdruck: "removeTodo([{ id: 1, text: 'a', done: false }, { id: 2, text: 'b', done: false }], 1)", erwartet: [{ id: 2, text: 'b', done: false }] },
      {
        name: t('filterTodos: all, open und done', 'filterTodos: all, open and done'),
        ausdruck: "(() => { const list = [{ id: 1, text: 'a', done: true }, { id: 2, text: 'b', done: false }]; return [filterTodos(list, 'all').length, filterTodos(list, 'open')[0]?.id, filterTodos(list, 'done')[0]?.id] })()",
        erwartet: [2, 2, 1],
      },
      { name: t('countOpen zählt offene Todos', 'countOpen counts open todos'), ausdruck: "countOpen([{ id: 1, text: 'a', done: true }, { id: 2, text: 'b', done: false }, { id: 3, text: 'c', done: false }])", erwartet: 2 },
    ],
  },

  'projekt-2-dom': {
    modus: 'js',
    vorschau: true,
    einleitung: {
      de: 'Jetzt bekommen die Funktionen aus Schritt 1 eine Oberfläche - mit reinem DOM-Code wie in [[js-dom]]. Das Muster: Daten ändern, dann `render()` zeichnet die ganze Liste neu.\n\nAchte beim Schreiben darauf, wie viel Code nur dafür da ist, Elemente zu erzeugen und Listener anzuhängen. Genau diese Arbeit nimmt dir React ab dem nächsten Schritt ab.',
      en: 'Now the functions from step 1 get a UI - with plain DOM code as in [[js-dom]]. The pattern: change the data, then `render()` redraws the whole list.\n\nWhile writing, notice how much code exists only to create elements and attach listeners. That is exactly the work React takes off your hands from the next step on.',
    },
    anforderungen: {
      de: [
        '`render()` erzeugt pro Todo ein `<li>` mit Checkbox, `<span>` mit dem Text und einem ✕-Knopf',
        'Erledigte Todos: `<li class="done">` und angehakte Checkbox',
        'Der Absatz `.count` zeigt „n open“',
        'Absenden des Formulars fügt ein Todo hinzu und leert das Feld (ohne Neuladen der Seite)',
        'Checkbox schaltet um, ✕ löscht - danach wird neu gerendert',
      ],
      en: [
        '`render()` creates an `<li>` per todo with a checkbox, a `<span>` with the text and a ✕ button',
        'Completed todos: `<li class="done">` and a checked checkbox',
        'The `.count` paragraph shows “n open”',
        'Submitting the form adds a todo and clears the input (without reloading the page)',
        'The checkbox toggles, ✕ deletes - then everything is rendered again',
      ],
    },
    start: P2_START,
    loesung: P2_LOESUNG,
    tipps: {
      de: [
        '`list.innerHTML = \'\'` leert die Liste, danach eine `for…of`-Schleife über `todos`.',
        'Elemente erzeugen: `document.createElement(\'li\')`, Text mit `textContent`, anhängen mit `li.append(checkbox, text, remove)`.',
        'Im Listener erst die Daten ändern (`todos = toggleTodo(todos, todo.id)`), dann `render()` aufrufen.',
        'Formular: `form.addEventListener(\'submit\', (event) => { event.preventDefault(); … })`.',
      ],
      en: [
        '`list.innerHTML = \'\'` empties the list, then a `for…of` loop over `todos`.',
        'Create elements: `document.createElement(\'li\')`, text via `textContent`, attach with `li.append(checkbox, text, remove)`.',
        'In the listener, change the data first (`todos = toggleTodo(todos, todo.id)`), then call `render()`.',
        'Form: `form.addEventListener(\'submit\', (event) => { event.preventDefault(); … })`.',
      ],
    },
    tests: [
      { name: t('Zwei <li> werden gerendert', 'Two <li> are rendered'), ausdruck: "document.querySelectorAll('#app li').length", erwartet: 2 },
      { name: t('Texte stehen in den Einträgen', 'The texts appear in the items'), ausdruck: "document.querySelector('#app ul').textContent.includes('Learn JavaScript') && document.querySelector('#app ul').textContent.includes('Build a todo app')" },
      { name: t('Erledigtes Todo hat Klasse done und Haken', 'Completed todo has class done and a check mark'), ausdruck: "document.querySelectorAll('#app li.done').length === 1 && document.querySelector('#app li input[type=checkbox]')?.checked === true" },
      { name: t('Anzeige „1 open“', 'Shows “1 open”'), ausdruck: "document.querySelector('#app .count').textContent.trim()", erwartet: '1 open' },
      {
        name: t('Formular fügt ein Todo hinzu und leert das Feld', 'The form adds a todo and clears the input'),
        ausdruck: "(() => { const input = document.querySelector('#app form input'); input.value = '  Walk the dog '; document.querySelector('#app form').requestSubmit(); const items = document.querySelectorAll('#app li'); return items.length === 3 && items[2].textContent.includes('Walk the dog') && document.querySelector('#app form input').value === '' })()",
      },
      {
        name: t('Checkbox schaltet um', 'Checkbox toggles'),
        ausdruck: "(() => { document.querySelectorAll('#app li input[type=checkbox]')[1]?.click(); return document.querySelectorAll('#app li.done').length === 2 && document.querySelector('#app .count').textContent.trim() === '1 open' })()",
      },
      {
        name: t('✕ löscht das Todo', '✕ deletes the todo'),
        ausdruck: "(() => { document.querySelector('#app li button')?.click(); return document.querySelectorAll('#app li').length === 2 && !document.querySelector('#app ul').textContent.includes('Learn JavaScript') })()",
      },
    ],
  },

  'projekt-3-komponenten': {
    modus: 'react',
    einleitung: {
      de: 'Dieselbe Liste - diesmal mit React. Statt Elemente von Hand zu erzeugen, **beschreibst** du, wie die Oberfläche für bestimmte Daten aussieht ([[react-komponenten]]).\n\nZerlege sie in zwei Komponenten: `TodoItem` zeigt ein einzelnes Todo, `TodoList` die ganze Liste. Die Daten kommen per **Props** von oben ([[react-props]]). Noch ist alles statisch - Klicks folgen im nächsten Schritt.',
      en: 'The same list - this time with React. Instead of creating elements by hand, you **describe** what the UI looks like for given data ([[react-komponenten]]).\n\nSplit it into two components: `TodoItem` shows a single todo, `TodoList` the whole list. The data comes from above via **props** ([[react-props]]). Everything is still static - clicks follow in the next step.',
    },
    anforderungen: {
      de: [
        '`TodoItem` rendert ein `<li>` mit Checkbox (`checked` = `done`), Text und ✕-Knopf',
        'Erledigte Todos bekommen `className="done"`',
        '`TodoList` rendert ein `<ul>` mit einem `TodoItem` pro Todo - mit `key`',
        '`App` zeigt die Liste und darunter „n open“',
      ],
      en: [
        '`TodoItem` renders an `<li>` with a checkbox (`checked` = `done`), the text and a ✕ button',
        'Completed todos get `className="done"`',
        '`TodoList` renders a `<ul>` with one `TodoItem` per todo - with a `key`',
        '`App` shows the list and “n open” below it',
      ],
    },
    start: P3_START,
    loesung: P3_LOESUNG,
    tipps: {
      de: [
        'In `TodoList`: `todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)`.',
        'Eine Checkbox ohne `onChange` braucht `readOnly`, sonst warnt React.',
        'Die offene Anzahl ist ein abgeleiteter Wert: `initialTodos.filter((todo) => !todo.done).length`.',
      ],
      en: [
        'In `TodoList`: `todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)`.',
        'A checkbox without `onChange` needs `readOnly`, otherwise React warns.',
        'The open count is a derived value: `initialTodos.filter((todo) => !todo.done).length`.',
      ],
    },
    tests: [
      { name: t('Drei <li> werden gerendert', 'Three <li> are rendered'), pruefung: js`
        await render()
        expect(findAll('li')).toHaveLength(3)
        expect(text()).toContain('Learn React')
      ` },
      { name: t('Checkboxen zeigen den done-Zustand', 'Checkboxes show the done state'), pruefung: js`
        await render()
        const boxes = findAll('li input[type="checkbox"]')
        expect(boxes).toHaveLength(3)
        expect(boxes[0].checked).toBe(true)
        expect(boxes[1].checked).toBe(false)
      ` },
      { name: t('Erledigtes Todo hat die Klasse done', 'Completed todo has the class done'), pruefung: js`
        await render()
        expect(findAll('li.done')).toHaveLength(1)
      ` },
      { name: t('Jedes Todo hat einen ✕-Knopf', 'Every todo has a ✕ button'), pruefung: js`
        await render()
        expect(findAll('li button')).toHaveLength(3)
      ` },
      { name: t('Anzeige „2 open“', 'Shows “2 open”'), pruefung: js`
        await render()
        expect(text()).toContain('2 open')
      ` },
      { name: t('Komponenten TodoItem und TodoList mit key', 'Components TodoItem and TodoList with key'), pruefung: js`
        expect(code).toMatch(/function TodoItem/)
        expect(code).toMatch(/function TodoList/)
        expect(code).toMatch(/<TodoItem/)
        expect(code).toMatch(/key=\{/)
      ` },
    ],
  },

  'projekt-4-state': {
    modus: 'react',
    einleitung: {
      de: 'Jetzt wird die Liste lebendig. Die Todos wandern in **State** ([[react-state]]): Jede Änderung erzeugt ein neues Array, React rendert neu.\n\nDas Eingabefeld ist ein **kontrolliertes Feld** - sein Wert steht ebenfalls im State. Klicks in `TodoItem` meldet die Komponente über **Callback-Props** (`onToggle`, `onDelete`) nach oben: Daten fließen nach unten, Ereignisse nach oben.',
      en: 'Now the list comes alive. The todos move into **state** ([[react-state]]): every change creates a new array and React re-renders.\n\nThe input is a **controlled input** - its value lives in state too. `TodoItem` reports clicks upward via **callback props** (`onToggle`, `onDelete`): data flows down, events flow up.',
    },
    anforderungen: {
      de: [
        'Formular mit Eingabefeld (placeholder „What needs to be done?“) und Knopf „Add“',
        'Absenden (Klick oder Enter) fügt ein Todo hinzu, leere Eingaben werden ignoriert, danach ist das Feld leer',
        'Checkbox schaltet `done` um, ✕ löscht',
        '„n open“ stimmt immer',
      ],
      en: [
        'A form with an input (placeholder “What needs to be done?”) and an “Add” button',
        'Submitting (click or Enter) adds a todo, empty input is ignored, afterwards the input is empty',
        'The checkbox toggles `done`, ✕ deletes',
        '“n open” is always correct',
      ],
    },
    loesung: P4_LOESUNG,
    tipps: {
      de: [
        '`const [todos, setTodos] = useState(initialTodos)` und `const [text, setText] = useState(\'\')` in `App`.',
        '`<form onSubmit={handleSubmit}>` - und in `handleSubmit` zuerst `event.preventDefault()`.',
        'Neues Array statt `push`: `setTodos([...todos, { id, text: trimmed, done: false }])` ([[hooks-usestate]]).',
        '`TodoItem` bekommt `onToggle` und `onDelete`: `onChange={() => onToggle(todo.id)}`.',
      ],
      en: [
        '`const [todos, setTodos] = useState(initialTodos)` and `const [text, setText] = useState(\'\')` in `App`.',
        '`<form onSubmit={handleSubmit}>` - and in `handleSubmit`, call `event.preventDefault()` first.',
        'A new array instead of `push`: `setTodos([...todos, { id, text: trimmed, done: false }])` ([[hooks-usestate]]).',
        '`TodoItem` receives `onToggle` and `onDelete`: `onChange={() => onToggle(todo.id)}`.',
      ],
    },
    tests: [
      TEST_HINZUFUEGEN,
      { name: t('Enter im Feld sendet das Formular ab', 'Enter in the input submits the form'), pruefung: js`
        await render()
        await type(field('What needs to be done?'), 'Via Enter')
        await submit(field('What needs to be done?'))
        expect(text()).toContain('Via Enter')
      ` },
      TEST_LEER,
      TEST_UMSCHALTEN,
      TEST_LOESCHEN,
      { name: t('State wird nicht mit push verändert', 'State is not changed with push'), pruefung: js`
        expect(code).toMatch(/useState\(/)
        expect(code).not.toMatch(/todos\.push\(/)
      ` },
    ],
  },

  'projekt-5-datenfluss': {
    modus: 'react',
    einleitung: {
      de: '`App` wird langsam voll. Zeit, aufzuräumen: Das Formular wird zur Komponente `TodoForm` mit eigenem State für den Text, und es kommen Filter dazu ([[react-datenfluss]]).\n\nWichtig ist, **wo** State lebt: Die Todos brauchen Formular, Liste und Zähler - also bleiben sie in `App`. Die gefilterte Liste ist dagegen kein State, sondern wird bei jedem Render **abgeleitet**.',
      en: '`App` is getting crowded. Time to tidy up: the form becomes a `TodoForm` component with its own state for the text, and filters are added ([[react-datenfluss]]).\n\nWhat matters is **where** state lives: the form, list and counter all need the todos - so they stay in `App`. The filtered list, on the other hand, is not state but **derived** on every render.',
    },
    anforderungen: {
      de: [
        '`TodoForm` mit eigenem Text-State meldet neue Todos über `onAdd(text)`',
        '`FilterButtons` zeigt „All“, „Open“ und „Done“; der aktive Knopf hat `aria-pressed="true"`',
        'Die Liste zeigt nur die Todos des aktiven Filters',
        '„n open“ zählt immer alle offenen Todos, unabhängig vom Filter',
      ],
      en: [
        '`TodoForm` with its own text state reports new todos via `onAdd(text)`',
        '`FilterButtons` shows “All”, “Open” and “Done”; the active button has `aria-pressed="true"`',
        'The list only shows the todos of the active filter',
        '“n open” always counts all open todos, regardless of the filter',
      ],
    },
    loesung: P5_LOESUNG,
    tipps: {
      de: [
        'Filter-State in `App`: `const [filter, setFilter] = useState(\'all\')`.',
        'Kein zweiter State für die gefilterte Liste! `const visibleTodos = todos.filter(…)` direkt beim Rendern.',
        '`<button aria-pressed={filter === f.value} onClick={() => onChange(f.value)}>`',
        'Der Text-State wandert aus `App` in `TodoForm` - `App` braucht ihn nicht mehr.',
      ],
      en: [
        'Filter state in `App`: `const [filter, setFilter] = useState(\'all\')`.',
        'No second state for the filtered list! `const visibleTodos = todos.filter(…)` right while rendering.',
        '`<button aria-pressed={filter === f.value} onClick={() => onChange(f.value)}>`',
        'The text state moves from `App` into `TodoForm` - `App` no longer needs it.',
      ],
    },
    tests: [
      TEST_FILTER,
      TEST_ARIA_PRESSED,
      { name: t('„n open“ hängt nicht vom Filter ab', '“n open” does not depend on the filter'), pruefung: js`
        await render()
        await click(button('Done'))
        expect(text()).toContain('2 open')
      ` },
      { name: t('Abgehaktes Todo verschwindet aus „Open“', 'Checked todo disappears from “Open”'), pruefung: js`
        await render()
        await click(button('Open'))
        await click(findAll('li input[type="checkbox"]')[0])
        expect(findAll('li')).toHaveLength(1)
      ` },
      TEST_HINZUFUEGEN,
      { name: t('Komponenten TodoForm und FilterButtons', 'Components TodoForm and FilterButtons'), pruefung: js`
        expect(code).toMatch(/function TodoForm/)
        expect(code).toMatch(/function FilterButtons/)
      ` },
    ],
  },
}
