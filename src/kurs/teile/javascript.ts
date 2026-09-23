import { laden, type Teil } from './typen'

export const javascriptTeil: Teil = {
  id: 'javascript',
  nummer: 1,
  titel: { de: 'JavaScript-Grundlagen', en: 'JavaScript Fundamentals' },
  kurztitel: { de: 'JavaScript', en: 'JavaScript' },
  bereich: 'frontend',
  beschreibung: {
    de: 'Alles, was du für React wirklich brauchst: Variablen, Funktionen, Arrays, Objekte, Referenzen und asynchroner Code.',
    en: 'Everything you really need for React: variables, functions, arrays, objects, references and asynchronous code.',
  },
  kapitel: [
    {
      id: 'js-variablen',
      titel: { de: 'Variablen & Datentypen', en: 'Variables & Data Types' },
      kurz: {
        de: 'Werte speichern, Typen erkennen und Texte zusammenbauen.',
        en: 'Store values, recognize types and build strings.',
      },
      dauer: 20,
      lernziele: {
        de: ['const und let richtig einsetzen', 'Die primitiven Datentypen kennen', 'Template-Literale schreiben', 'truthy und falsy unterscheiden'],
        en: ['Use const and let correctly', 'Know the primitive data types', 'Write template literals', 'Tell truthy and falsy apart'],
      },
      stichworte: ['const', 'let', 'typeof', 'string', 'number', 'boolean', 'template literal', 'truthy', 'falsy'],
      Komponente: {
        de: laden(() => import('../js/Variablen'), 'Variablen'),
        en: laden(() => import('../js/Variablen.en'), 'Variablen'),
      },
    },
    {
      id: 'js-kontrollfluss',
      titel: { de: 'Operatoren & Bedingungen', en: 'Operators & Conditions' },
      kurz: {
        de: 'Vergleichen, entscheiden, wiederholen - und die Operatoren, die du in JSX brauchst.',
        en: 'Compare, decide, repeat - and the operators you need in JSX.',
      },
      dauer: 25,
      lernziele: {
        de: ['=== statt == verwenden', 'if/else, switch und Schleifen schreiben', 'Ternär, &&, ?? und ?. als Ausdrücke nutzen', 'Den Unterschied zwischen || und ?? kennen'],
        en: ['Use === instead of ==', 'Write if/else, switch and loops', 'Use ternary, &&, ?? and ?. as expressions', 'Know the difference between || and ??'],
      },
      stichworte: ['if', 'else', 'switch', 'for', 'while', 'ternary', 'ternär', '===', 'optional chaining', 'nullish coalescing'],
      Komponente: {
        de: laden(() => import('../js/Kontrollfluss'), 'Kontrollfluss'),
        en: laden(() => import('../js/Kontrollfluss.en'), 'Kontrollfluss'),
      },
    },
    {
      id: 'js-funktionen',
      titel: { de: 'Funktionen & Closures', en: 'Functions & Closures' },
      kurz: {
        de: 'Funktionen als Werte, Arrow Functions, Callbacks - und warum Closures für Hooks entscheidend sind.',
        en: 'Functions as values, arrow functions, callbacks - and why closures are essential for hooks.',
      },
      dauer: 30,
      lernziele: {
        de: ['Funktionen deklarieren und Arrow Functions schreiben', 'Default- und Rest-Parameter nutzen', 'Callbacks übergeben statt aufrufen', 'Closures verstehen und einsetzen'],
        en: ['Declare functions and write arrow functions', 'Use default and rest parameters', 'Pass callbacks instead of calling them', 'Understand and use closures'],
      },
      stichworte: ['function', 'arrow function', 'callback', 'closure', 'parameter', 'return'],
      Komponente: {
        de: laden(() => import('../js/Funktionen'), 'Funktionen'),
        en: laden(() => import('../js/Funktionen.en'), 'Funktionen'),
      },
    },
    {
      id: 'js-arrays',
      titel: { de: 'Arrays & ihre Methoden', en: 'Arrays & Their Methods' },
      kurz: {
        de: 'map, filter, reduce und find - das tägliche Brot in React.',
        en: 'map, filter, reduce and find - your daily bread in React.',
      },
      dauer: 30,
      lernziele: {
        de: ['Arrays lesen und durchsuchen', 'map, filter und reduce sicher anwenden', 'Methoden verketten', 'Mutierende von nicht-mutierenden Methoden unterscheiden'],
        en: ['Read and search arrays', 'Apply map, filter and reduce confidently', 'Chain methods', 'Tell mutating from non-mutating methods'],
      },
      stichworte: ['map', 'filter', 'reduce', 'find', 'some', 'every', 'sort', 'toSorted', 'includes'],
      Komponente: {
        de: laden(() => import('../js/Arrays'), 'Arrays'),
        en: laden(() => import('../js/Arrays.en'), 'Arrays'),
      },
    },
    {
      id: 'js-objekte',
      titel: { de: 'Objekte & Destructuring', en: 'Objects & Destructuring' },
      kurz: {
        de: 'Objekte bauen und lesen, Destructuring, Spread und JSON.',
        en: 'Build and read objects, destructuring, spread and JSON.',
      },
      dauer: 25,
      lernziele: {
        de: ['Objekte anlegen und dynamisch lesen', 'Objekte und Arrays destrukturieren', 'Spread und Rest unterscheiden', 'Mit JSON arbeiten'],
        en: ['Create objects and read them dynamically', 'Destructure objects and arrays', 'Tell spread and rest apart', 'Work with JSON'],
      },
      stichworte: ['object', 'destructuring', 'spread', 'rest', 'JSON', 'Object.entries', 'Map', 'Set'],
      Komponente: {
        de: laden(() => import('../js/Objekte'), 'Objekte'),
        en: laden(() => import('../js/Objekte.en'), 'Objekte'),
      },
    },
    {
      id: 'js-referenzen',
      titel: { de: 'Referenzen & Immutability', en: 'References & Immutability' },
      kurz: {
        de: 'Warum man State in React nie verändert, sondern ersetzt.',
        en: 'Why state in React is never changed, but replaced.',
      },
      dauer: 25,
      lernziele: {
        de: ['Werte und Referenzen unterscheiden', 'Verstehen, wie React Änderungen erkennt', 'Arrays und Objekte unveränderlich aktualisieren', 'Flache und tiefe Kopien unterscheiden'],
        en: ['Tell values and references apart', 'Understand how React detects changes', 'Update arrays and objects immutably', 'Tell shallow and deep copies apart'],
      },
      stichworte: ['reference', 'immutability', 'immutable', 'mutation', 'structuredClone', 'copy', 'Kopie'],
      Komponente: {
        de: laden(() => import('../js/Referenzen'), 'Referenzen'),
        en: laden(() => import('../js/Referenzen.en'), 'Referenzen'),
      },
    },
    {
      id: 'js-async',
      titel: { de: 'Asynchrones JavaScript', en: 'Asynchronous JavaScript' },
      kurz: { de: 'Timer, Promises, async/await und fetch.', en: 'Timers, promises, async/await and fetch.' },
      dauer: 30,
      lernziele: {
        de: ['Die Reihenfolge asynchroner Abläufe vorhersagen', 'Promises mit then/catch nutzen', 'async/await mit try/catch schreiben', 'Parallel laden mit Promise.all'],
        en: ['Predict the order of asynchronous code', 'Use promises with then/catch', 'Write async/await with try/catch', 'Load in parallel with Promise.all'],
      },
      stichworte: ['promise', 'async', 'await', 'fetch', 'setTimeout', 'event loop', 'Promise.all', 'try catch', 'microtask', 'call stack', 'queueMicrotask'],
      Komponente: {
        de: laden(() => import('../js/Asynchron'), 'Asynchron'),
        en: laden(() => import('../js/Asynchron.en'), 'Asynchron'),
      },
    },
    {
      id: 'js-fehler',
      titel: { de: 'Fehler & Klassen', en: 'Errors & Classes' },
      kurz: {
        de: 'try/catch, eigene Fehler, Klassen und this - auch zum Lesen von fremdem Code.',
        en: 'try/catch, custom errors, classes and this - also for reading other people’s code.',
      },
      dauer: 30,
      lernziele: {
        de: ['Fehler mit throw werfen und mit try/catch/finally fangen', 'Klassen mit Feldern, Methoden und Gettern schreiben', 'Verstehen, worauf this zeigt', 'Eigene Fehlertypen mit extends bauen'],
        en: ['Throw errors with throw and catch them with try/catch/finally', 'Write classes with fields, methods and getters', 'Understand what this points to', 'Build custom error types with extends'],
      },
      stichworte: ['try', 'catch', 'finally', 'throw', 'Error', 'TypeError', 'class', 'Klasse', 'constructor', 'this', 'bind', 'extends', 'super', 'getter', 'private', 'instanceof', 'custom error'],
      Komponente: {
        de: laden(() => import('../js/FehlerUndKlassen'), 'FehlerUndKlassen'),
        en: laden(() => import('../js/FehlerUndKlassen.en'), 'FehlerUndKlassen'),
      },
    },
    {
      id: 'js-dom',
      titel: { de: 'DOM, Events & Module', en: 'DOM, Events & Modules' },
      kurz: {
        de: 'Das DOM von Hand ändern - und verstehen, warum es React gibt.',
        en: 'Change the DOM by hand - and understand why React exists.',
      },
      dauer: 25,
      lernziele: {
        de: ['Elemente erzeugen und verändern', 'Auf Events reagieren', 'Imperativ und deklarativ unterscheiden', 'import und export verwenden'],
        en: ['Create and change elements', 'React to events', 'Tell imperative and declarative apart', 'Use import and export'],
      },
      stichworte: ['DOM', 'querySelector', 'addEventListener', 'event', 'import', 'export', 'module', 'imperativ', 'deklarativ'],
      Komponente: {
        de: laden(() => import('../js/DomUndModule'), 'DomUndModule'),
        en: laden(() => import('../js/DomUndModule.en'), 'DomUndModule'),
      },
    },
  ],
}
