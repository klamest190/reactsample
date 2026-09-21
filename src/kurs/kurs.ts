import { createElement, lazy, type ComponentType } from 'react'
import type { Zweisprachig } from '../i18n/SpracheContext'
import { projektSchritte } from './projekt/meta'

/**
 * Die Kursstruktur als Daten - in beiden Sprachen.
 *
 * Komponenten sind in React ganz normale Werte - man kann sie in einem Array
 * speichern und später als <Inhalt /> rendern. Navigation, Startseite und
 * Kapitelseite werden komplett aus dieser Liste erzeugt.
 *
 * Jedes Kapitel gibt es als eigene Datei pro Sprache:
 *   src/kurs/<teil>/Name.tsx     Deutsch
 *   src/kurs/<teil>/Name.en.tsx  Englisch (mit englischen Namen im Code)
 * Die interaktiven TypeScript-Demos teilen sich beide unter src/kurs/demos/.
 */

/**
 * Jedes Kapitel wird erst geladen, wenn man es öffnet (Code-Splitting, siehe Kapitel 3.8).
 * lazy() erwartet einen default-Export - die Kapitel exportieren aber benannt,
 * deshalb wird der Export hier umverpackt.
 */
function laden<M extends Record<string, ComponentType>>(importieren: () => Promise<M>, name: keyof M) {
  return lazy(() => importieren().then((modul) => ({ default: modul[name] })))
}

export type Kapitel = {
  /** Sprachneutral - steht in der URL und im gespeicherten Fortschritt. */
  id: string
  titel: Zweisprachig
  /** Ein Satz: worum geht es? */
  kurz: Zweisprachig
  /** Geschätzte Minuten inkl. Übungen. */
  dauer: number
  lernziele: Zweisprachig<string[]>
  Komponente: Zweisprachig<ComponentType>
  /** Kapitel, deren Wissen hier vorausgesetzt wird (der rote Faden). */
  grundlagen?: string[]
  /** Zusätzliche Suchbegriffe (Hook-Namen, englische Fachbegriffe …). */
  stichworte?: string[]
}

export type Teil = {
  id: string
  nummer: number
  titel: Zweisprachig
  kurztitel: Zweisprachig
  icon: string
  beschreibung: Zweisprachig
  kapitel: Kapitel[]
}

export const kurs: Teil[] = [
  {
    id: 'javascript',
    nummer: 1,
    titel: { de: 'JavaScript-Grundlagen', en: 'JavaScript Fundamentals' },
    kurztitel: { de: 'JavaScript', en: 'JavaScript' },
    icon: '🟨',
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
        Komponente: {
          de: laden(() => import('./js/Variablen'), 'Variablen'),
          en: laden(() => import('./js/Variablen.en'), 'Variablen'),
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
        Komponente: {
          de: laden(() => import('./js/Kontrollfluss'), 'Kontrollfluss'),
          en: laden(() => import('./js/Kontrollfluss.en'), 'Kontrollfluss'),
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
        Komponente: {
          de: laden(() => import('./js/Funktionen'), 'Funktionen'),
          en: laden(() => import('./js/Funktionen.en'), 'Funktionen'),
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
        Komponente: {
          de: laden(() => import('./js/Arrays'), 'Arrays'),
          en: laden(() => import('./js/Arrays.en'), 'Arrays'),
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
        Komponente: {
          de: laden(() => import('./js/Objekte'), 'Objekte'),
          en: laden(() => import('./js/Objekte.en'), 'Objekte'),
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
        Komponente: {
          de: laden(() => import('./js/Referenzen'), 'Referenzen'),
          en: laden(() => import('./js/Referenzen.en'), 'Referenzen'),
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
        Komponente: {
          de: laden(() => import('./js/Asynchron'), 'Asynchron'),
          en: laden(() => import('./js/Asynchron.en'), 'Asynchron'),
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
        Komponente: {
          de: laden(() => import('./js/FehlerUndKlassen'), 'FehlerUndKlassen'),
          en: laden(() => import('./js/FehlerUndKlassen.en'), 'FehlerUndKlassen'),
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
        Komponente: {
          de: laden(() => import('./js/DomUndModule'), 'DomUndModule'),
          en: laden(() => import('./js/DomUndModule.en'), 'DomUndModule'),
        },
      },
    ],
  },
  {
    id: 'react',
    nummer: 2,
    titel: { de: 'React-Grundlagen', en: 'React Fundamentals' },
    kurztitel: { de: 'React', en: 'React' },
    icon: '⚛️',
    beschreibung: {
      de: 'Komponenten, JSX, Props, Events und der erste State: wie React Oberflächen aus Daten baut.',
      en: 'Components, JSX, props, events and your first state: how React builds user interfaces from data.',
    },
    kapitel: [
      {
        id: 'react-komponenten',
        titel: { de: 'Komponenten & JSX', en: 'Components & JSX' },
        kurz: {
          de: 'Oberflächen beschreiben statt das DOM von Hand zu ändern.',
          en: 'Describe user interfaces instead of changing the DOM by hand.',
        },
        dauer: 20,
        lernziele: {
          de: ['Verstehen, was eine Komponente ist', 'Die JSX-Regeln anwenden', 'Komponenten verschachteln', 'JavaScript-Ausdrücke in JSX nutzen'],
          en: ['Understand what a component is', 'Apply the JSX rules', 'Nest components', 'Use JavaScript expressions in JSX'],
        },
        Komponente: {
          de: laden(() => import('./react/Komponenten'), 'Komponenten'),
          en: laden(() => import('./react/Komponenten.en'), 'Komponenten'),
        },
      },
      {
        id: 'react-props',
        titel: { de: 'Props, Listen & Bedingungen', en: 'Props, Lists & Conditions' },
        kurz: {
          de: 'Komponenten konfigurieren und Daten in Oberflächen verwandeln.',
          en: 'Configure components and turn data into user interfaces.',
        },
        dauer: 30,
        lernziele: {
          de: ['Props übergeben und destrukturieren', 'children für Rahmen-Komponenten nutzen', 'Listen mit map und key rendern', 'Bedingt rendern'],
          en: ['Pass and destructure props', 'Use children for wrapper components', 'Render lists with map and key', 'Render conditionally'],
        },
        Komponente: {
          de: laden(() => import('./react/Props'), 'Props'),
          en: laden(() => import('./react/Props.en'), 'Props'),
        },
      },
      {
        id: 'react-state',
        titel: { de: 'Events & State', en: 'Events & State' },
        kurz: {
          de: 'Auf Benutzer reagieren und mit useState Zustand speichern.',
          en: 'Respond to users and store state with useState.',
        },
        dauer: 30,
        lernziele: {
          de: ['Event-Handler richtig übergeben', 'Verstehen, warum Variablen nicht reichen', 'useState einsetzen', 'Den Render-Ablauf und State-Snapshots verstehen'],
          en: ['Pass event handlers correctly', 'Understand why variables are not enough', 'Use useState', 'Understand rendering and state snapshots'],
        },
        Komponente: {
          de: laden(() => import('./react/StateUndEvents'), 'StateUndEvents'),
          en: laden(() => import('./react/StateUndEvents.en'), 'StateUndEvents'),
        },
      },
      {
        id: 'react-datenfluss',
        titel: { de: 'State teilen & Datenfluss', en: 'Sharing State & Data Flow' },
        kurz: {
          de: 'Wo State leben sollte und wie Komponenten miteinander reden.',
          en: 'Where state should live and how components talk to each other.',
        },
        dauer: 30,
        lernziele: {
          de: ['Daten nach unten, Ereignisse nach oben reichen', 'State in den Elternteil anheben', 'Redundanten State vermeiden', 'Eine Oberfläche „in React denken“'],
          en: ['Pass data down and events up', 'Lift state up to the parent', 'Avoid redundant state', '“Think in React” about a UI'],
        },
        Komponente: {
          de: laden(() => import('./react/Datenfluss'), 'Datenfluss'),
          en: laden(() => import('./react/Datenfluss.en'), 'Datenfluss'),
        },
      },
    ],
  },
  {
    id: 'hooks',
    nummer: 3,
    titel: { de: 'React Hooks im Detail', en: 'React Hooks in Depth' },
    kurztitel: { de: 'Hooks', en: 'Hooks' },
    icon: '🪝',
    beschreibung: {
      de: 'Der Schwerpunkt des Kurses: alle wichtigen Hooks mit dem Problem, das sie lösen - von useState bis zu den React-19-Hooks.',
      en: 'The focus of the course: every important hook and the problem it solves - from useState to the React 19 hooks.',
    },
    kapitel: [
      {
        id: 'hooks-usestate',
        titel: { de: 'Hook-Regeln & useState', en: 'Rules of Hooks & useState' },
        kurz: {
          de: 'Wie Hooks intern funktionieren und alles, was useState noch kann.',
          en: 'How hooks work internally and everything else useState can do.',
        },
        dauer: 35,
        lernziele: {
          de: ['Die Hook-Regeln und ihren Grund kennen', 'Funktionale Updates einsetzen', 'Objekte und Arrays im State aktualisieren', 'Lazy Initializer und key-Reset nutzen'],
          en: ['Know the rules of hooks and why they exist', 'Use updater functions', 'Update objects and arrays in state', 'Use lazy initializers and key resets'],
        },
        Komponente: {
          de: laden(() => import('./hooks/UseState'), 'UseState'),
          en: laden(() => import('./hooks/UseState.en'), 'UseState'),
        },
      },
      {
        id: 'hooks-useeffect',
        titel: { de: 'useEffect', en: 'useEffect' },
        kurz: {
          de: 'Mit der Außenwelt synchronisieren - und sauber wieder aufräumen.',
          en: 'Synchronize with the outside world - and clean up properly.',
        },
        dauer: 40,
        lernziele: {
          de: ['Das Dependency-Array verstehen', 'Cleanup-Funktionen schreiben', 'Veraltete Werte in Effekten vermeiden', 'Erkennen, wann man keinen Effekt braucht'],
          en: ['Understand the dependency array', 'Write cleanup functions', 'Avoid stale values in effects', 'Recognize when you don’t need an effect'],
        },
        Komponente: {
          de: laden(() => import('./hooks/UseEffect'), 'UseEffect'),
          en: laden(() => import('./hooks/UseEffect.en'), 'UseEffect'),
        },
      },
      {
        id: 'hooks-useref',
        titel: { de: 'useRef', en: 'useRef' },
        kurz: {
          de: 'Werte merken ohne Re-Render und direkt auf DOM-Elemente zugreifen.',
          en: 'Remember values without re-rendering and access DOM elements directly.',
        },
        dauer: 25,
        lernziele: {
          de: ['useRef und useState abgrenzen', 'DOM-Elemente fokussieren und messen', 'Timer-IDs in Refs speichern', 'Refs an eigene Komponenten weitergeben'],
          en: ['Distinguish useRef from useState', 'Focus and measure DOM elements', 'Store timer IDs in refs', 'Pass refs to your own components'],
        },
        Komponente: {
          de: laden(() => import('./hooks/UseRef'), 'UseRef'),
          en: laden(() => import('./hooks/UseRef.en'), 'UseRef'),
        },
      },
      {
        id: 'hooks-usememo',
        titel: { de: 'useMemo, useCallback & memo', en: 'useMemo, useCallback & memo' },
        kurz: {
          de: 'Unnötige Arbeit vermeiden - und wissen, wann es sich lohnt.',
          en: 'Avoid unnecessary work - and know when it is worth it.',
        },
        dauer: 35,
        lernziele: {
          de: ['Verstehen, wann Komponenten rendern', 'memo und Referenzgleichheit verstehen', 'useMemo und useCallback gezielt einsetzen', 'Erst messen, dann optimieren'],
          en: ['Understand when components render', 'Understand memo and referential equality', 'Use useMemo and useCallback deliberately', 'Measure first, then optimize'],
        },
        Komponente: {
          de: laden(() => import('./hooks/UseMemo'), 'UseMemo'),
          en: laden(() => import('./hooks/UseMemo.en'), 'UseMemo'),
        },
      },
      {
        id: 'hooks-usereducer',
        titel: { de: 'useReducer', en: 'useReducer' },
        kurz: {
          de: 'Komplexe Zustandsübergänge an einer Stelle bündeln.',
          en: 'Gather complex state transitions in one place.',
        },
        dauer: 35,
        lernziele: {
          de: ['Reducer als reine Funktionen schreiben', 'Actions sinnvoll benennen', 'useReducer in Komponenten nutzen', 'Zwischen useState und useReducer wählen'],
          en: ['Write reducers as pure functions', 'Name actions well', 'Use useReducer in components', 'Choose between useState and useReducer'],
        },
        Komponente: {
          de: laden(() => import('./hooks/UseReducer'), 'UseReducer'),
          en: laden(() => import('./hooks/UseReducer.en'), 'UseReducer'),
        },
      },
      {
        id: 'hooks-usecontext',
        titel: { de: 'useContext', en: 'useContext' },
        kurz: {
          de: 'Werte tief im Baum verfügbar machen, ohne Prop Drilling.',
          en: 'Make values available deep in the tree, without prop drilling.',
        },
        dauer: 30,
        lernziele: {
          de: ['Prop Drilling erkennen', 'Context anlegen, bereitstellen und lesen', 'Provider-Komponente mit eigenem Hook bauen', 'Context mit useReducer kombinieren'],
          en: ['Recognize prop drilling', 'Create, provide and read context', 'Build a provider component with a custom hook', 'Combine context with useReducer'],
        },
        Komponente: {
          de: laden(() => import('./hooks/UseContext'), 'UseContext'),
          en: laden(() => import('./hooks/UseContext.en'), 'UseContext'),
        },
      },
      {
        id: 'hooks-eigene',
        titel: { de: 'Eigene Hooks', en: 'Custom Hooks' },
        kurz: {
          de: 'Wiederverwendbare Logik in eigene Hooks auslagern.',
          en: 'Extract reusable logic into custom hooks.',
        },
        dauer: 30,
        lernziele: {
          de: ['Wiederholte Logik erkennen und extrahieren', 'Verstehen, dass Hooks Logik teilen, nicht State', 'Rückgabewerte sinnvoll gestalten', 'Die Hooks dieses Projekts lesen'],
          en: ['Spot and extract repeated logic', 'Understand that hooks share logic, not state', 'Design useful return values', 'Read the hooks in this project'],
        },
        Komponente: {
          de: laden(() => import('./hooks/EigeneHooks'), 'EigeneHooks'),
          en: laden(() => import('./hooks/EigeneHooks.en'), 'EigeneHooks'),
        },
      },
      {
        id: 'hooks-nebenlaeufig',
        titel: { de: 'useTransition & useDeferredValue', en: 'useTransition & useDeferredValue' },
        kurz: {
          de: 'Die Oberfläche flüssig halten, auch wenn Rendern teuer ist.',
          en: 'Keep the UI responsive, even when rendering is expensive.',
        },
        dauer: 30,
        lernziele: {
          de: ['Dringende und nicht dringende Updates unterscheiden', 'useDeferredValue mit memo einsetzen', 'useTransition mit isPending nutzen', 'Komponenten mit lazy nachladen'],
          en: ['Tell urgent from non-urgent updates', 'Use useDeferredValue with memo', 'Use useTransition with isPending', 'Load components on demand with lazy'],
        },
        Komponente: {
          de: laden(() => import('./hooks/Nebenlaeufigkeit'), 'Nebenlaeufigkeit'),
          en: laden(() => import('./hooks/Nebenlaeufigkeit.en'), 'Nebenlaeufigkeit'),
        },
      },
      {
        id: 'hooks-react19',
        titel: { de: 'use, Actions & useOptimistic', en: 'use, Actions & useOptimistic' },
        kurz: {
          de: 'Die Hooks aus React 19 für asynchrone Daten und Formulare.',
          en: 'The React 19 hooks for asynchronous data and forms.',
        },
        dauer: 35,
        lernziele: {
          de: ['Promises mit use und Suspense lesen', 'Formular-Actions mit useActionState schreiben', 'useFormStatus in Kind-Komponenten nutzen', 'Optimistische Updates umsetzen'],
          en: ['Read promises with use and Suspense', 'Write form actions with useActionState', 'Use useFormStatus in child components', 'Implement optimistic updates'],
        },
        Komponente: {
          de: laden(() => import('./hooks/React19Hooks'), 'React19Hooks'),
          en: laden(() => import('./hooks/React19Hooks.en'), 'React19Hooks'),
        },
      },
    ],
  },
  {
    id: 'praxis',
    nummer: 4,
    titel: { de: 'Praxis & Muster', en: 'Practice & Patterns' },
    kurztitel: { de: 'Praxis', en: 'Practice' },
    icon: '🛠️',
    beschreibung: {
      de: 'Formulare, Daten laden, Komposition, Fehlerbehandlung, Styling, TypeScript, Routing, Testen und Barrierefreiheit - und zum Schluss eigene Projekte.',
      en: 'Forms, data fetching, composition, error handling, styling, TypeScript, routing, testing and accessibility - and finally projects of your own.',
    },
    kapitel: [
      {
        id: 'praxis-formulare',
        titel: { de: 'Formulare', en: 'Forms' },
        kurz: {
          de: 'Controlled und uncontrolled Felder, Validierung und Barrierefreiheit.',
          en: 'Controlled and uncontrolled inputs, validation and accessibility.',
        },
        dauer: 30,
        lernziele: {
          de: ['Controlled und uncontrolled unterscheiden', 'Viele Felder mit einem Handler verwalten', 'Validierung ableiten statt speichern', 'Labels mit useId verknüpfen'],
          en: ['Tell controlled from uncontrolled', 'Manage many fields with one handler', 'Derive validation instead of storing it', 'Link labels with useId'],
        },
        Komponente: {
          de: laden(() => import('./praxis/Formulare'), 'Formulare'),
          en: laden(() => import('./praxis/Formulare.en'), 'Formulare'),
        },
      },
      {
        id: 'praxis-daten',
        titel: { de: 'Daten laden', en: 'Fetching Data' },
        kurz: {
          de: 'Laden, Fehler, Daten - und Race Conditions vermeiden.',
          en: 'Loading, error, data - and avoiding race conditions.',
        },
        dauer: 30,
        lernziele: {
          de: ['Das Lade-Muster mit useEffect umsetzen', 'Anfragen im Cleanup abbrechen', 'Einen useFetch-Hook schreiben', 'Bibliotheken für Server-Daten einordnen'],
          en: ['Implement the loading pattern with useEffect', 'Abort requests in cleanup', 'Write a useFetch hook', 'Know the libraries for server data'],
        },
        Komponente: {
          de: laden(() => import('./praxis/DatenLaden'), 'DatenLaden'),
          en: laden(() => import('./praxis/DatenLaden.en'), 'DatenLaden'),
        },
      },
      {
        id: 'praxis-komposition',
        titel: { de: 'Komposition & Portale', en: 'Composition & Portals' },
        kurz: {
          de: 'Komponenten kombinieren statt konfigurieren.',
          en: 'Compose components instead of configuring them.',
        },
        dauer: 25,
        lernziele: {
          de: ['children und Slot-Props einsetzen', 'Render-Props einordnen', 'Portale für Overlays nutzen', 'Eine wiederverwendbare Tabs-Komponente bauen'],
          en: ['Use children and slot props', 'Understand render props', 'Use portals for overlays', 'Build a reusable tabs component'],
        },
        Komponente: {
          de: laden(() => import('./praxis/Komposition'), 'Komposition'),
          en: laden(() => import('./praxis/Komposition.en'), 'Komposition'),
        },
      },
      {
        id: 'praxis-fehler',
        titel: { de: 'Fehlerbehandlung', en: 'Error Handling' },
        kurz: {
          de: 'Error Boundaries und try/catch - damit nicht die ganze App abstürzt.',
          en: 'Error boundaries and try/catch - so the whole app doesn’t crash.',
        },
        dauer: 20,
        lernziele: {
          de: ['Error Boundaries schreiben und platzieren', 'Wissen, was Boundaries nicht fangen', 'Fehler in async-Handlern behandeln', 'Boundaries per key zurücksetzen'],
          en: ['Write and place error boundaries', 'Know what boundaries don’t catch', 'Handle errors in async handlers', 'Reset boundaries with a key'],
        },
        Komponente: {
          de: laden(() => import('./praxis/Fehlerbehandlung'), 'Fehlerbehandlung'),
          en: laden(() => import('./praxis/Fehlerbehandlung.en'), 'Fehlerbehandlung'),
        },
      },
      {
        id: 'praxis-tailwind',
        titel: { de: 'Tailwind CSS', en: 'Tailwind CSS' },
        kurz: {
          de: 'Styling mit Utility-Klassen - und die eine große Stolperfalle.',
          en: 'Styling with utility classes - and the one big pitfall.',
        },
        dauer: 20,
        lernziele: {
          de: ['Utility-Klassen und Varianten nutzen', 'Klassen bedingt setzen', 'Die Scanner-Stolperfalle vermeiden', 'Tailwind v4 konfigurieren'],
          en: ['Use utility classes and variants', 'Apply classes conditionally', 'Avoid the scanner pitfall', 'Configure Tailwind v4'],
        },
        Komponente: {
          de: laden(() => import('./praxis/Tailwind'), 'Tailwind'),
          en: laden(() => import('./praxis/Tailwind.en'), 'Tailwind'),
        },
      },
      {
        id: 'praxis-typescript',
        titel: { de: 'TypeScript mit React', en: 'TypeScript with React' },
        kurz: {
          de: 'Props, State, Events, Reducer und Context mit Typen - geprüft vom echten Compiler.',
          en: 'Props, state, events, reducers and context with types - checked by the real compiler.',
        },
        dauer: 45,
        lernziele: {
          de: ['Props, State und Refs typisieren', 'Event-Typen einsetzen', 'Actions als Discriminated Union modellieren', 'Daten von außen mit unknown sicher prüfen'],
          en: ['Type props, state and refs', 'Use event types', 'Model actions as a discriminated union', 'Check outside data safely with unknown'],
        },
        Komponente: {
          de: laden(() => import('./praxis/TypeScript'), 'TypeScriptKapitel'),
          en: laden(() => import('./praxis/TypeScript.en'), 'TypeScriptKapitel'),
        },
      },
      {
        id: 'praxis-routing',
        titel: { de: 'Routing', en: 'Routing' },
        kurz: {
          de: 'Mehrere Seiten mit eigener Adresse: React Router mit Parametern, Layouts, Suchparametern und Loadern.',
          en: 'Several pages with their own address: React Router with params, layouts, search params and loaders.',
        },
        dauer: 40,
        lernziele: {
          de: ['Routen und Links anlegen', 'Dynamische Segmente mit useParams lesen', 'Layouts mit Outlet verschachteln', 'State in die URL legen und Daten per Loader laden'],
          en: ['Create routes and links', 'Read dynamic segments with useParams', 'Nest layouts with Outlet', 'Put state into the URL and load data with loaders'],
        },
        Komponente: {
          de: laden(() => import('./praxis/Routing'), 'Routing'),
          en: laden(() => import('./praxis/Routing.en'), 'Routing'),
        },
      },
      {
        id: 'praxis-testen',
        titel: { de: 'Testen', en: 'Testing' },
        kurz: {
          de: 'Eigene Tests mit Vitest und React Testing Library schreiben - und prüfen, ob sie Fehler finden.',
          en: 'Write your own tests with Vitest and React Testing Library - and check whether they catch bugs.',
        },
        dauer: 45,
        lernziele: {
          de: ['Tests mit test, describe und expect schreiben', 'Komponenten über Rollen finden und mit user-event bedienen', 'getBy, queryBy und findBy unterscheiden', 'Callbacks und fetch durch Attrappen ersetzen'],
          en: ['Write tests with test, describe and expect', 'Find components by role and use them with user-event', 'Tell getBy, queryBy and findBy apart', 'Replace callbacks and fetch with mocks'],
        },
        Komponente: {
          de: laden(() => import('./praxis/Testen'), 'Testen'),
          en: laden(() => import('./praxis/Testen.en'), 'Testen'),
        },
      },
      {
        id: 'praxis-barrierefreiheit',
        titel: { de: 'Barrierefreiheit', en: 'Accessibility' },
        kurz: {
          de: 'Apps für alle: semantisches HTML, Formulare, Tastatur, Fokus und Live-Regionen.',
          en: 'Apps for everyone: semantic HTML, forms, keyboard, focus and live regions.',
        },
        dauer: 35,
        lernziele: {
          de: ['Passende HTML-Elemente statt div wählen', 'Formularfelder und Fehler richtig verknüpfen', 'Tastaturbedienung und Fokus sicherstellen', 'Barrierefreiheit prüfen'],
          en: ['Pick the right HTML elements instead of divs', 'Link form fields and errors correctly', 'Ensure keyboard use and focus', 'Check accessibility'],
        },
        Komponente: {
          de: laden(() => import('./praxis/Barrierefreiheit'), 'Barrierefreiheit'),
          en: laden(() => import('./praxis/Barrierefreiheit.en'), 'Barrierefreiheit'),
        },
      },
      {
        id: 'praxis-lokal',
        titel: { de: 'Lokal entwickeln', en: 'Developing Locally' },
        kurz: {
          de: 'Raus aus dem Browser-Editor: ein eigenes Projekt mit Vite, DevTools und Debugging.',
          en: 'Leaving the browser editor: your own project with Vite, DevTools and debugging.',
        },
        dauer: 30,
        lernziele: {
          de: ['Ein React-Projekt mit Vite anlegen', 'Die Projektstruktur verstehen', 'Mit DevTools und Debugger Fehler finden', 'Die ToDo-App lokal nachbauen'],
          en: ['Create a React project with Vite', 'Understand the project structure', 'Find bugs with DevTools and the debugger', 'Rebuild the todo app locally'],
        },
        Komponente: {
          de: laden(() => import('./praxis/LokalEntwickeln'), 'LokalEntwickeln'),
          en: laden(() => import('./praxis/LokalEntwickeln.en'), 'LokalEntwickeln'),
        },
      },
      {
        id: 'praxis-projekt',
        titel: { de: 'Abschlussprojekt', en: 'Final Project' },
        kurz: {
          de: 'Ein Gewohnheiten-Tracker mit allem, was du gelernt hast.',
          en: 'A habit tracker using everything you have learned.',
        },
        dauer: 90,
        lernziele: {
          de: ['Ein Datenmodell mit Reducer entwerfen', 'Eigene Hooks kombinieren', 'Abgeleitete Werte berechnen', 'Eine vollständige App strukturieren'],
          en: ['Design a data model with a reducer', 'Combine custom hooks', 'Compute derived values', 'Structure a complete app'],
        },
        Komponente: {
          de: laden(() => import('./praxis/Abschlussprojekt'), 'Abschlussprojekt'),
          en: laden(() => import('./praxis/Abschlussprojekt.en'), 'Abschlussprojekt'),
        },
      },
      {
        id: 'praxis-business',
        titel: { de: 'Eine komplette Business-App', en: 'A Complete Business App' },
        kurz: {
          de: 'Eine fertige Kunden- und Auftragsverwaltung aus 17 Dateien: Datei wählen, ändern und die App live laufen sehen.',
          en: 'A finished customer and order management app in 17 files: pick a file, change it and watch the app run live.',
        },
        dauer: 60,
        lernziele: {
          de: ['Die Struktur einer echten React-App lesen', 'Datenfluss über Store, Context und Reducer nachvollziehen', 'Komponenten gezielt ändern und erweitern', 'Wissen, wie die Dateien per import zusammenhängen'],
          en: ['Read the structure of a real React app', 'Follow the data flow through store, context and reducer', 'Change and extend components in a targeted way', 'Know how the files are connected via import'],
        },
        Komponente: {
          de: laden(() => import('./praxis/BusinessApp'), 'BusinessApp'),
          en: laden(() => import('./praxis/BusinessApp.en'), 'BusinessApp'),
        },
      },
    ],
  },
  {
    id: 'projekt',
    nummer: 5,
    titel: { de: 'Projekt: ToDo-App', en: 'Project: Todo App' },
    kurztitel: { de: 'Projekt', en: 'Project' },
    icon: '🧵',
    beschreibung: {
      de: 'Der rote Faden: eine ToDo-App in 12 Schritten, die mit jedem Kursteil wächst - bis zur Challenge ohne Vorlage.',
      en: 'The common thread: a todo app in 12 steps that grows with every part of the course - up to a challenge without a template.',
    },
    // Alle Schritte teilen sich eine Seite, die ihre Daten per id nachlädt.
    kapitel: projektSchritte.map((schritt) => {
      const Seite = lazy(() =>
        import('./projekt/ProjektSchritt').then((modul) => ({
          default: () => createElement(modul.ProjektSchritt, { id: schritt.id }),
        })),
      )
      return { ...schritt, Komponente: { de: Seite, en: Seite } }
    }),
  },
  {
    id: 'java',
    nummer: 6,
    titel: { de: 'Java-Grundlagen', en: 'Java Fundamentals' },
    kurztitel: { de: 'Java', en: 'Java' },
    icon: '☕',
    beschreibung: {
      de: 'Die zweite Welt: eine streng typisierte, objektorientierte Sprache. Java läuft hier in einer eigenen Laufzeit (src/java/) - unabhängig von allem JavaScript und React.',
      en: 'The second world: a strictly typed, object-oriented language. Java runs here in its own runtime (src/java/) - independent of all JavaScript and React.',
    },
    kapitel: [
      {
        id: 'java-start',
        titel: { de: 'Hallo Java', en: 'Hello Java' },
        kurz: {
          de: 'Klasse, main, println - und warum Java erst kompiliert wird.',
          en: 'Class, main, println - and why Java is compiled first.',
        },
        dauer: 25,
        lernziele: {
          de: ['Ein Java-Programm starten können', 'Klasse, Methode und main einordnen', 'Kompilieren und Ausführen unterscheiden', 'Die ersten Unterschiede zu JavaScript benennen'],
          en: ['Start a Java program', 'Understand class, method and main', 'Tell compiling and running apart', 'Name the first differences to JavaScript'],
        },
        Komponente: {
          de: laden(() => import('./java/Start'), 'Start'),
          en: laden(() => import('./java/Start.en'), 'Start'),
        },
      },
      {
        id: 'java-variablen',
        titel: { de: 'Typen & Variablen', en: 'Types & Variables' },
        kurz: {
          de: 'int, double, boolean, char, String - und warum der Typ vorne steht.',
          en: 'int, double, boolean, char, String - and why the type comes first.',
        },
        dauer: 35,
        lernziele: {
          de: ['Die primitiven Typen kennen und wählen', 'Typen umwandeln (Casting)', 'final statt const einsetzen', 'Die Fallen der int-Division und der Kommazahlen kennen'],
          en: ['Know and choose the primitive types', 'Convert types (casting)', 'Use final instead of const', 'Know the traps of int division and decimals'],
        },
        Komponente: {
          de: laden(() => import('./java/Variablen'), 'Variablen'),
          en: laden(() => import('./java/Variablen.en'), 'Variablen'),
        },
      },
      {
        id: 'java-kontrollfluss',
        titel: { de: 'Bedingungen & Schleifen', en: 'Conditions & Loops' },
        kurz: {
          de: 'if, switch, for, while - fast wie in JavaScript, nur strenger.',
          en: 'if, switch, for, while - almost like JavaScript, just stricter.',
        },
        dauer: 30,
        lernziele: {
          de: ['Bedingungen mit echten booleans schreiben', 'switch klassisch und mit Pfeil nutzen', 'Die vier Schleifenarten einsetzen', 'break und continue gezielt verwenden'],
          en: ['Write conditions with real booleans', 'Use switch classic and with arrows', 'Use all four kinds of loops', 'Use break and continue deliberately'],
        },
        Komponente: {
          de: laden(() => import('./java/Kontrollfluss'), 'Kontrollfluss'),
          en: laden(() => import('./java/Kontrollfluss.en'), 'Kontrollfluss'),
        },
      },
      {
        id: 'java-methoden',
        titel: { de: 'Methoden', en: 'Methods' },
        kurz: {
          de: 'Rückgabetyp, Parameter, Überladung - und was static wirklich bedeutet.',
          en: 'Return type, parameters, overloading - and what static really means.',
        },
        dauer: 30,
        lernziele: {
          de: ['Methoden mit Typen deklarieren', 'Methoden überladen', 'static von Instanzmethoden unterscheiden', 'Verstehen, dass Parameter Kopien sind'],
          en: ['Declare methods with types', 'Overload methods', 'Tell static from instance methods', 'Understand that parameters are copies'],
        },
        Komponente: {
          de: laden(() => import('./java/Methoden'), 'Methoden'),
          en: laden(() => import('./java/Methoden.en'), 'Methoden'),
        },
      },
      {
        id: 'java-arrays',
        titel: { de: 'Arrays & Strings', en: 'Arrays & Strings' },
        kurz: {
          de: 'Feste Längen, Standardwerte - und warum == bei Strings lügt.',
          en: 'Fixed lengths, default values - and why == lies about strings.',
        },
        dauer: 35,
        lernziele: {
          de: ['Arrays anlegen und durchlaufen', 'Arrays.toString und Arrays.sort nutzen', 'String-Methoden sicher anwenden', 'equals statt == verwenden'],
          en: ['Create and traverse arrays', 'Use Arrays.toString and Arrays.sort', 'Use string methods confidently', 'Use equals instead of =='],
        },
        Komponente: {
          de: laden(() => import('./java/Arrays'), 'Arrays'),
          en: laden(() => import('./java/Arrays.en'), 'Arrays'),
        },
      },
      {
        id: 'java-klassen',
        titel: { de: 'Klassen & Objekte', en: 'Classes & Objects' },
        kurz: {
          de: 'Der Kern von Java: Bauplan, Konstruktor, Kapselung, toString.',
          en: 'The heart of Java: blueprint, constructor, encapsulation, toString.',
        },
        dauer: 45,
        lernziele: {
          de: ['Klassen mit Feldern und Methoden schreiben', 'Konstruktoren und this verstehen', 'Mit private kapseln und Getter/Setter schreiben', 'toString und equals überschreiben'],
          en: ['Write classes with fields and methods', 'Understand constructors and this', 'Encapsulate with private and write getters/setters', 'Override toString and equals'],
        },
        Komponente: {
          de: laden(() => import('./java/Klassen'), 'Klassen'),
          en: laden(() => import('./java/Klassen.en'), 'Klassen'),
        },
      },
      {
        id: 'java-vererbung',
        titel: { de: 'Vererbung & Interfaces', en: 'Inheritance & Interfaces' },
        kurz: {
          de: 'extends, super, @Override, abstract, implements - und Polymorphie.',
          en: 'extends, super, @Override, abstract, implements - and polymorphism.',
        },
        dauer: 45,
        lernziele: {
          de: ['Klassen erweitern und Methoden überschreiben', 'Polymorphie erklären und einsetzen', 'Abstrakte Klassen und Interfaces unterscheiden', 'enum und record kennen'],
          en: ['Extend classes and override methods', 'Explain and use polymorphism', 'Tell abstract classes and interfaces apart', 'Know enum and record'],
        },
        Komponente: {
          de: laden(() => import('./java/Vererbung'), 'Vererbung'),
          en: laden(() => import('./java/Vererbung.en'), 'Vererbung'),
        },
      },
      {
        id: 'java-collections',
        titel: { de: 'Collections & Generics', en: 'Collections & Generics' },
        kurz: {
          de: 'ArrayList und HashMap - Javas Antwort auf Array und Objekt.',
          en: 'ArrayList and HashMap - Java’s answer to array and object.',
        },
        dauer: 40,
        lernziele: {
          de: ['ArrayList statt Array einsetzen', 'HashMap für Schlüssel-Wert-Paare nutzen', 'Generics <…> lesen und schreiben', 'Listen mit Lambdas und Streams verarbeiten'],
          en: ['Use ArrayList instead of arrays', 'Use HashMap for key-value pairs', 'Read and write generics <…>', 'Process lists with lambdas and streams'],
        },
        Komponente: {
          de: laden(() => import('./java/Collections'), 'Collections'),
          en: laden(() => import('./java/Collections.en'), 'Collections'),
        },
      },
      {
        id: 'java-fehler',
        titel: { de: 'Exceptions', en: 'Exceptions' },
        kurz: {
          de: 'try/catch/finally, throw, eigene Fehlertypen - und checked vs. unchecked.',
          en: 'try/catch/finally, throw, custom error types - and checked vs. unchecked.',
        },
        dauer: 30,
        lernziele: {
          de: ['Exceptions fangen und gezielt behandeln', 'Eigene Exceptions werfen', 'finally richtig einsetzen', 'Checked und unchecked unterscheiden'],
          en: ['Catch and handle exceptions deliberately', 'Throw your own exceptions', 'Use finally correctly', 'Tell checked and unchecked apart'],
        },
        Komponente: {
          de: laden(() => import('./java/Fehler'), 'Fehler'),
          en: laden(() => import('./java/Fehler.en'), 'Fehler'),
        },
      },
      {
        id: 'java-vergleich',
        titel: { de: 'Java, JavaScript & React', en: 'Java, JavaScript & React' },
        kurz: {
          de: 'Dieselbe Aufgabe dreimal - und wo in diesem Projekt welche Sprache steckt.',
          en: 'The same task three times - and where each language lives in this project.',
        },
        dauer: 35,
        lernziele: {
          de: ['Die Unterschiede der Sprachen sicher benennen', 'Dieselbe Logik in Java und JavaScript lesen', 'Wissen, wo im Projekt Java, JS und React liegen', 'Verstehen, wie die Java-Laufzeit hier funktioniert'],
          en: ['Name the differences between the languages confidently', 'Read the same logic in Java and JavaScript', 'Know where Java, JS and React live in this project', 'Understand how the Java runtime here works'],
        },
        Komponente: {
          de: laden(() => import('./java/Vergleich'), 'Vergleich'),
          en: laden(() => import('./java/Vergleich.en'), 'Vergleich'),
        },
      },
    ],
  },
]

/**
 * Der rote Faden: was ein Kapitel voraussetzt. Steht hier gesammelt statt in jedem
 * Kapitel, damit man die Abhängigkeiten auf einen Blick sieht.
 */
const GRUNDLAGEN: Record<string, string[]> = {
  'js-kontrollfluss': ['js-variablen'],
  'js-funktionen': ['js-kontrollfluss'],
  'js-arrays': ['js-funktionen'],
  'js-objekte': ['js-arrays'],
  'js-referenzen': ['js-objekte', 'js-arrays'],
  'js-async': ['js-funktionen'],
  'js-fehler': ['js-funktionen', 'js-objekte'],
  'js-dom': ['js-funktionen', 'js-objekte'],
  'react-komponenten': ['js-dom', 'js-funktionen'],
  'react-props': ['react-komponenten', 'js-objekte', 'js-arrays'],
  'react-state': ['react-props', 'js-funktionen'],
  'react-datenfluss': ['react-state'],
  'hooks-usestate': ['react-state', 'js-referenzen'],
  'hooks-useeffect': ['hooks-usestate', 'js-async'],
  'hooks-useref': ['hooks-useeffect'],
  'hooks-usememo': ['hooks-usestate', 'js-referenzen'],
  'hooks-usereducer': ['hooks-usestate', 'js-kontrollfluss'],
  'hooks-usecontext': ['react-datenfluss', 'hooks-usememo'],
  'hooks-eigene': ['hooks-useeffect', 'js-funktionen'],
  'hooks-nebenlaeufig': ['hooks-usememo'],
  'hooks-react19': ['hooks-nebenlaeufig', 'js-async'],
  'praxis-formulare': ['react-state', 'hooks-usestate'],
  'praxis-daten': ['hooks-useeffect', 'js-async'],
  'praxis-komposition': ['react-props'],
  'praxis-fehler': ['react-komponenten', 'js-async'],
  'praxis-tailwind': ['react-komponenten'],
  'praxis-typescript': ['react-props', 'hooks-usereducer', 'hooks-usecontext', 'js-objekte'],
  'praxis-routing': ['react-props', 'react-datenfluss', 'praxis-komposition', 'praxis-daten'],
  'praxis-testen': ['react-state', 'praxis-formulare', 'praxis-daten', 'js-async'],
  'praxis-barrierefreiheit': ['praxis-formulare', 'praxis-testen', 'hooks-useref'],
  'praxis-lokal': ['react-komponenten', 'hooks-useeffect'],
  'praxis-projekt': ['hooks-usereducer', 'hooks-eigene', 'hooks-useeffect'],
  'praxis-business': ['hooks-usecontext', 'hooks-usereducer', 'praxis-formulare', 'praxis-komposition'],
  // Teil 6 steht für sich: Java braucht kein React. Die Verweise auf den
  // JavaScript-Teil sind Vergleichspunkte, keine Voraussetzungen.
  'java-variablen': ['java-start'],
  'java-kontrollfluss': ['java-variablen'],
  'java-methoden': ['java-kontrollfluss'],
  'java-arrays': ['java-variablen', 'java-kontrollfluss'],
  'java-klassen': ['java-methoden'],
  'java-vererbung': ['java-klassen'],
  'java-collections': ['java-klassen', 'java-arrays'],
  'java-fehler': ['java-klassen'],
  'java-vergleich': ['java-collections', 'js-arrays', 'react-komponenten'],
}

const STICHWORTE: Record<string, string[]> = {
  'js-variablen': ['const', 'let', 'typeof', 'string', 'number', 'boolean', 'template literal', 'truthy', 'falsy'],
  'js-kontrollfluss': ['if', 'else', 'switch', 'for', 'while', 'ternary', 'ternär', '===', 'optional chaining', 'nullish coalescing'],
  'js-funktionen': ['function', 'arrow function', 'callback', 'closure', 'parameter', 'return'],
  'js-arrays': ['map', 'filter', 'reduce', 'find', 'some', 'every', 'sort', 'toSorted', 'includes'],
  'js-objekte': ['object', 'destructuring', 'spread', 'rest', 'JSON', 'Object.entries', 'Map', 'Set'],
  'js-referenzen': ['reference', 'immutability', 'immutable', 'mutation', 'structuredClone', 'copy', 'Kopie'],
  'js-async': ['promise', 'async', 'await', 'fetch', 'setTimeout', 'event loop', 'Promise.all', 'try catch', 'microtask', 'call stack', 'queueMicrotask'],
  'js-fehler': ['try', 'catch', 'finally', 'throw', 'Error', 'TypeError', 'class', 'Klasse', 'constructor', 'this', 'bind', 'extends', 'super', 'getter', 'private', 'instanceof', 'custom error'],
  'js-dom': ['DOM', 'querySelector', 'addEventListener', 'event', 'import', 'export', 'module', 'imperativ', 'deklarativ'],
  'react-komponenten': ['component', 'JSX', 'createRoot', 'fragment', 'className'],
  'react-props': ['props', 'children', 'key', 'list', 'Liste', 'conditional rendering'],
  'react-state': ['useState', 'onClick', 'event handler', 'render', 'snapshot', 'batching'],
  'react-datenfluss': ['lifting state up', 'State anheben', 'data flow', 'derived state', 'thinking in react'],
  'hooks-usestate': ['rules of hooks', 'Hook-Regeln', 'updater function', 'lazy initializer', 'key reset'],
  'hooks-useeffect': ['effect', 'Effekt', 'dependency array', 'cleanup', 'stale closure', 'useEffectEvent'],
  'hooks-useref': ['ref', 'focus', 'DOM', 'forwardRef', 'ref prop', 'useImperativeHandle', 'useLayoutEffect', 'measure', 'messen'],
  'hooks-usememo': ['useCallback', 'memo', 'memoization', 'performance', 're-render', 'React Compiler', 'Compiler'],
  'hooks-usereducer': ['reducer', 'dispatch', 'action'],
  'hooks-usecontext': ['context', 'createContext', 'provider', 'prop drilling'],
  'hooks-eigene': ['custom hook', 'useLocalStorage', 'useFetch'],
  'hooks-nebenlaeufig': ['useTransition', 'useDeferredValue', 'lazy', 'Suspense', 'isPending', 'concurrent', 'code splitting', 'Code-Splitting'],
  'hooks-react19': ['use', 'useActionState', 'useFormStatus', 'useOptimistic', 'form action', 'Suspense'],
  'praxis-formulare': ['form', 'Formular', 'controlled', 'uncontrolled', 'validation', 'Validierung', 'useId', 'label'],
  'praxis-daten': ['fetch', 'loading', 'AbortController', 'race condition', 'useFetch', 'TanStack Query'],
  'praxis-komposition': ['children', 'slot', 'render props', 'portal', 'createPortal', 'tabs'],
  'praxis-fehler': ['error boundary', 'try catch', 'Fehler', 'error'],
  'praxis-tailwind': ['tailwind', 'css', 'className', 'dark mode', 'utility'],
  'praxis-typescript': ['typescript', 'ts', 'tsx', 'type', 'interface', 'generics', 'Generics', 'union', 'discriminated union', 'unknown', 'any', 'never', 'Partial', 'Omit', 'Pick', 'Record', 'ReactNode', 'ComponentProps', 'ChangeEvent', 'SubmitEvent', 'tsconfig', 'strict', 'type guard', 'Typen'],
  'praxis-routing': ['router', 'react router', 'route', 'Link', 'NavLink', 'useParams', 'useNavigate', 'Navigate', 'Outlet', 'useSearchParams', 'useLocation', 'loader', 'useLoaderData', 'BrowserRouter', 'MemoryRouter', '404', 'SPA', 'URL', 'Seiten'],
  'praxis-testen': ['test', 'testing', 'Vitest', 'Jest', 'Testing Library', 'RTL', 'user-event', 'userEvent', 'expect', 'describe', 'mock', 'vi.fn', 'spyOn', 'getByRole', 'queryBy', 'findBy', 'jest-dom', 'Mutationstest', 'mutation testing', 'Playwright', 'MSW', 'Unit-Test', 'unit test'],
  'praxis-barrierefreiheit': ['accessibility', 'a11y', 'Barrierefreiheit', 'ARIA', 'aria-label', 'aria-live', 'aria-describedby', 'screen reader', 'Screenreader', 'alt', 'role', 'Rolle', 'focus', 'Fokus', 'Tastatur', 'keyboard', 'dialog', 'BFSG', 'WCAG', 'semantic HTML'],
  'praxis-lokal': ['vite', 'npm', 'node', 'devtools', 'debugger', 'React DevTools', 'VS Code', 'build', 'deploy'],
  'praxis-projekt': ['habit tracker', 'Gewohnheiten', 'project'],
  'praxis-business': ['business app', 'CRM', 'dashboard', 'Projektstruktur', 'project structure', 'store', 'import', 'Werkstatt', 'workshop'],
  'java-start': ['java', 'JVM', 'main', 'System.out.println', 'compiler', 'Compiler', 'kompilieren', 'bytecode', 'Bytecode', 'javac', 'JDK', 'public class'],
  'java-variablen': ['int', 'double', 'boolean', 'char', 'long', 'float', 'String', 'casting', 'Casting', 'final', 'var', 'primitive', 'Wrapper', 'Integer', 'Typisierung', 'static typing'],
  'java-kontrollfluss': ['if', 'else', 'switch', 'for', 'while', 'do while', 'break', 'continue', 'ternär', 'enhanced for'],
  'java-methoden': ['method', 'Methode', 'return', 'void', 'static', 'überladen', 'overloading', 'Parameter', 'varargs', 'Rekursion', 'recursion'],
  'java-arrays': ['array', 'Array', 'length', 'Arrays.toString', 'Arrays.sort', 'StringBuilder', 'equals', '==', 'String-Pool', 'string pool', 'zweidimensional'],
  'java-klassen': ['class', 'Klasse', 'Objekt', 'object', 'constructor', 'Konstruktor', 'this', 'private', 'public', 'getter', 'setter', 'Kapselung', 'encapsulation', 'toString', 'equals', 'null'],
  'java-vererbung': ['extends', 'super', 'Override', 'abstract', 'interface', 'implements', 'Polymorphie', 'polymorphism', 'instanceof', 'enum', 'record', 'Vererbung', 'inheritance'],
  'java-collections': ['ArrayList', 'HashMap', 'List', 'Map', 'Set', 'Generics', 'generics', 'Autoboxing', 'autoboxing', 'Stream', 'stream', 'Lambda', 'lambda', 'Collections'],
  'java-fehler': ['try', 'catch', 'finally', 'throw', 'throws', 'Exception', 'RuntimeException', 'checked', 'unchecked', 'NullPointerException', 'Stacktrace'],
  'java-vergleich': ['Vergleich', 'comparison', 'Java vs JavaScript', 'Unterschiede', 'differences', 'Interpreter', 'interpreter', 'Laufzeit', 'runtime', 'Projektstruktur'],
}

export type KapitelMitTeil = Kapitel & { teil: Teil; nummer: string; grundlagen: string[]; stichworte: string[] }

/** Flache Liste aller Kapitel mit Nummer ("1.3") und Verweis auf ihren Teil. */
export const alleKapitel: KapitelMitTeil[] = kurs.flatMap((teil) =>
  teil.kapitel.map((k, i) => ({
    ...k,
    teil,
    nummer: `${teil.nummer}.${i + 1}`,
    grundlagen: k.grundlagen ?? GRUNDLAGEN[k.id] ?? [],
    stichworte: k.stichworte ?? STICHWORTE[k.id] ?? [],
  })),
)

/** Umkehrung des roten Fadens: welche Kapitel bauen auf diesem auf? */
export function aufbauendAuf(id: string) {
  return alleKapitel.filter((k) => k.grundlagen.includes(id))
}
