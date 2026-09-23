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
 * Jedes Kapitel wird erst geladen, wenn man es öffnet (Code-Splitting, siehe Kapitel 4.8).
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

export type Bereich = 'frontend' | 'backend'

/** Reihenfolge der Bereiche in Seitenleiste und Startseite. */
export const BEREICHE: Bereich[] = ['frontend', 'backend']

export type Teil = {
  id: string
  nummer: number
  titel: Zweisprachig
  kurztitel: Zweisprachig
  /** Frontend (Browser) oder Backend (Server) - danach gliedern Seitenleiste und Startseite. */
  bereich: Bereich
  beschreibung: Zweisprachig
  kapitel: Kapitel[]
}

export const kurs: Teil[] = [
  {
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
    id: 'typescript',
    nummer: 2,
    titel: { de: 'TypeScript-Grundlagen', en: 'TypeScript Fundamentals' },
    kurztitel: { de: 'TypeScript', en: 'TypeScript' },
    bereich: 'frontend',
    beschreibung: {
      de: 'JavaScript mit Typen: Objekte und Funktionen beschreiben, Unions eingrenzen, Generics und Utility Types - alles mit echter Typprüfung im Editor.',
      en: 'JavaScript with types: describe objects and functions, narrow unions, generics and utility types - all with real type checking in the editor.',
    },
    kapitel: [
      {
        id: 'ts-start',
        titel: { de: 'Warum TypeScript?', en: 'Why TypeScript?' },
        kurz: {
          de: 'Typen, Inferenz und die wichtigsten Grundtypen - und warum Typen zur Laufzeit verschwinden.',
          en: 'Types, inference and the essential basic types - and why types disappear at runtime.',
        },
        dauer: 25,
        lernziele: {
          de: ['Typannotationen schreiben und Inferenz nutzen', 'Die Grundtypen, Arrays und Tupel kennen', 'any und unknown unterscheiden', 'Verstehen, dass Typen nur beim Prüfen existieren'],
          en: ['Write type annotations and rely on inference', 'Know the basic types, arrays and tuples', 'Tell any and unknown apart', 'Understand that types only exist while checking'],
        },
        Komponente: {
          de: laden(() => import('./typescript/Einstieg'), 'Einstieg'),
          en: laden(() => import('./typescript/Einstieg.en'), 'Einstieg'),
        },
      },
      {
        id: 'ts-objekte',
        titel: { de: 'Objekttypen & Interfaces', en: 'Object Types & Interfaces' },
        kurz: {
          de: 'Die Form von Objekten beschreiben: type, interface, optionale und readonly Felder.',
          en: 'Describe the shape of objects: type, interface, optional and readonly fields.',
        },
        dauer: 30,
        lernziele: {
          de: ['Objekttypen mit type und interface beschreiben', 'Optionale und readonly Felder einsetzen', 'Typen mit extends und & kombinieren', 'Strukturelle Typisierung verstehen'],
          en: ['Describe object types with type and interface', 'Use optional and readonly fields', 'Combine types with extends and &', 'Understand structural typing'],
        },
        Komponente: {
          de: laden(() => import('./typescript/Objekte'), 'Objekte'),
          en: laden(() => import('./typescript/Objekte.en'), 'Objekte'),
        },
      },
      {
        id: 'ts-funktionen',
        titel: { de: 'Funktionen typisieren', en: 'Typing Functions' },
        kurz: {
          de: 'Parameter, Rückgabewerte, Callbacks und Funktionstypen.',
          en: 'Parameters, return values, callbacks and function types.',
        },
        dauer: 25,
        lernziele: {
          de: ['Parameter und Rückgabewerte typisieren', 'Optionale, Default- und Rest-Parameter nutzen', 'Funktionstypen für Callbacks schreiben', 'void und never einordnen'],
          en: ['Type parameters and return values', 'Use optional, default and rest parameters', 'Write function types for callbacks', 'Understand void and never'],
        },
        Komponente: {
          de: laden(() => import('./typescript/Funktionen'), 'Funktionen'),
          en: laden(() => import('./typescript/Funktionen.en'), 'Funktionen'),
        },
      },
      {
        id: 'ts-unions',
        titel: { de: 'Unions & Narrowing', en: 'Unions & Narrowing' },
        kurz: {
          de: 'Ein Wert, mehrere mögliche Typen - und wie TypeScript sie sicher eingrenzt.',
          en: 'One value, several possible types - and how TypeScript narrows them safely.',
        },
        dauer: 35,
        lernziele: {
          de: ['Union- und Literal-Typen einsetzen', 'Mit typeof, in und instanceof eingrenzen', 'Discriminated Unions modellieren', 'Mit never auf Vollständigkeit prüfen'],
          en: ['Use union and literal types', 'Narrow with typeof, in and instanceof', 'Model discriminated unions', 'Check for exhaustiveness with never'],
        },
        Komponente: {
          de: laden(() => import('./typescript/Unions'), 'Unions'),
          en: laden(() => import('./typescript/Unions.en'), 'Unions'),
        },
      },
      {
        id: 'ts-generics',
        titel: { de: 'Generics', en: 'Generics' },
        kurz: {
          de: 'Funktionen und Typen, die mit jedem Typ funktionieren - ohne any.',
          en: 'Functions and types that work with any type - without any.',
        },
        dauer: 35,
        lernziele: {
          de: ['Generische Funktionen schreiben', 'Typparameter mit extends einschränken', 'keyof mit Generics kombinieren', 'Generische Typen und Klassen bauen'],
          en: ['Write generic functions', 'Constrain type parameters with extends', 'Combine keyof with generics', 'Build generic types and classes'],
        },
        Komponente: {
          de: laden(() => import('./typescript/Generics'), 'Generics'),
          en: laden(() => import('./typescript/Generics.en'), 'Generics'),
        },
      },
      {
        id: 'ts-utility',
        titel: { de: 'Typ-Operatoren & Utility Types', en: 'Type Operators & Utility Types' },
        kurz: {
          de: 'Typen aus anderen Typen ableiten: keyof, typeof, Partial, Pick, Omit, as const und satisfies.',
          en: 'Derive types from other types: keyof, typeof, Partial, Pick, Omit, as const and satisfies.',
        },
        dauer: 30,
        lernziele: {
          de: ['keyof, typeof und Indexzugriff nutzen', 'Die wichtigsten Utility Types einsetzen', 'as const und satisfies verstehen', 'Typen ableiten statt doppelt schreiben'],
          en: ['Use keyof, typeof and indexed access', 'Apply the most important utility types', 'Understand as const and satisfies', 'Derive types instead of writing them twice'],
        },
        Komponente: {
          de: laden(() => import('./typescript/UtilityTypes'), 'UtilityTypes'),
          en: laden(() => import('./typescript/UtilityTypes.en'), 'UtilityTypes'),
        },
      },
      {
        id: 'ts-klassen',
        titel: { de: 'Klassen, Enums & Module', en: 'Classes, Enums & Modules' },
        kurz: {
          de: 'Klassen mit Zugriffsmodifikatoren, Interfaces implementieren, Enums und Typen importieren.',
          en: 'Classes with access modifiers, implementing interfaces, enums and importing types.',
        },
        dauer: 30,
        lernziele: {
          de: ['Klassen mit private, readonly und Parameter-Properties schreiben', 'Interfaces implementieren und abstract nutzen', 'Enums und Union-Typen vergleichen', 'import type und Deklarationsdateien kennen'],
          en: ['Write classes with private, readonly and parameter properties', 'Implement interfaces and use abstract', 'Compare enums and union types', 'Know import type and declaration files'],
        },
        Komponente: {
          de: laden(() => import('./typescript/Klassen'), 'Klassen'),
          en: laden(() => import('./typescript/Klassen.en'), 'Klassen'),
        },
      },
      {
        id: 'ts-fortgeschritten',
        titel: { de: 'Fortgeschrittene Typen & Praxis', en: 'Advanced Types & Practice' },
        kurz: {
          de: 'Mapped und Conditional Types, Template Literal Types, sichere API-Daten und die tsconfig.',
          en: 'Mapped and conditional types, template literal types, safe API data and the tsconfig.',
        },
        dauer: 35,
        lernziele: {
          de: ['Mapped und Conditional Types lesen und schreiben', 'Template Literal Types einsetzen', 'Async-Code und API-Daten sicher typisieren', 'Type Assertions sparsam einsetzen und die tsconfig verstehen'],
          en: ['Read and write mapped and conditional types', 'Use template literal types', 'Type async code and API data safely', 'Use type assertions sparingly and understand the tsconfig'],
        },
        Komponente: {
          de: laden(() => import('./typescript/Fortgeschritten'), 'Fortgeschritten'),
          en: laden(() => import('./typescript/Fortgeschritten.en'), 'Fortgeschritten'),
        },
      },
    ],
  },
  {
    id: 'react',
    nummer: 3,
    titel: { de: 'React-Grundlagen', en: 'React Fundamentals' },
    kurztitel: { de: 'React', en: 'React' },
    bereich: 'frontend',
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
    nummer: 4,
    titel: { de: 'React Hooks im Detail', en: 'React Hooks in Depth' },
    kurztitel: { de: 'Hooks', en: 'Hooks' },
    bereich: 'frontend',
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
    nummer: 5,
    titel: { de: 'Praxis & Muster', en: 'Practice & Patterns' },
    kurztitel: { de: 'React-Praxis', en: 'React in Practice' },
    bereich: 'frontend',
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
    nummer: 6,
    titel: { de: 'Projekt: ToDo-App', en: 'Project: Todo App' },
    kurztitel: { de: 'ToDo-Projekt', en: 'Todo Project' },
    bereich: 'frontend',
    beschreibung: {
      de: 'Der rote Faden: eine ToDo-App in 15 Schritten, die mit jedem Kursteil wächst - bis zur Challenge ohne Vorlage.',
      en: 'The common thread: a todo app in 15 steps that grows with every part of the course - up to a challenge without a template.',
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
    nummer: 7,
    titel: { de: 'Java-Grundlagen', en: 'Java Fundamentals' },
    kurztitel: { de: 'Java', en: 'Java' },
    bereich: 'backend',
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
  {
    id: 'backend',
    nummer: 8,
    titel: { de: 'Backend: Spring Boot & Docker', en: 'Backend: Spring Boot & Docker' },
    kurztitel: { de: 'Spring & Docker', en: 'Spring & Docker' },
    bereich: 'backend',
    beschreibung: {
      de: 'Die Serverseite: REST-APIs mit Spring Boot, Dependency Injection, Validierung und Datenbanken - dann alles in Docker-Container verpackt und mit Docker Compose gestartet. Spring läuft hier auf der Java-Laufzeit aus Teil 7, Docker in einem Simulator.',
      en: 'The server side: REST APIs with Spring Boot, dependency injection, validation and databases - then everything packed into Docker containers and started with Docker Compose. Spring runs on the Java runtime from part 7, Docker in a simulator.',
    },
    kapitel: [
      {
        id: 'spring-start',
        titel: { de: 'Hallo Spring Boot', en: 'Hello Spring Boot' },
        kurz: {
          de: 'Was ein Backend macht, HTTP in fünf Minuten und der erste Controller.',
          en: 'What a backend does, HTTP in five minutes and the first controller.',
        },
        dauer: 35,
        lernziele: {
          de: ['Anfrage und Antwort in HTTP beschreiben', 'Methoden und Status-Codes zuordnen', 'Ein Spring-Boot-Projekt lesen und starten', 'Endpunkte mit @GetMapping und Parametern schreiben'],
          en: ['Describe request and response in HTTP', 'Match methods and status codes', 'Read and start a Spring Boot project', 'Write endpoints with @GetMapping and parameters'],
        },
        Komponente: {
          de: laden(() => import('./backend/SpringStart'), 'SpringStart'),
          en: laden(() => import('./backend/SpringStart.en'), 'SpringStart'),
        },
      },
      {
        id: 'spring-beans',
        titel: { de: 'Beans & Dependency Injection', en: 'Beans & Dependency Injection' },
        kurz: {
          de: 'Spring erzeugt die Objekte und reicht sie dorthin, wo sie gebraucht werden.',
          en: 'Spring creates the objects and passes them where they are needed.',
        },
        dauer: 40,
        lernziele: {
          de: ['Dependency Injection erklären', 'Beans mit @Component, @Service und @Bean anlegen', 'Konstruktor-Injektion einsetzen', 'Fehlende und mehrdeutige Beans beheben'],
          en: ['Explain dependency injection', 'Create beans with @Component, @Service and @Bean', 'Use constructor injection', 'Fix missing and ambiguous beans'],
        },
        Komponente: {
          de: laden(() => import('./backend/SpringBeans'), 'SpringBeans'),
          en: laden(() => import('./backend/SpringBeans.en'), 'SpringBeans'),
        },
      },
      {
        id: 'spring-rest',
        titel: { de: 'REST-APIs mit Controllern', en: 'REST APIs with Controllers' },
        kurz: {
          de: 'Ressourcen, die fünf Methoden, JSON-Bodies und passende Status-Codes.',
          en: 'Resources, the five methods, JSON bodies and fitting status codes.',
        },
        dauer: 45,
        lernziele: {
          de: ['Endpunkte nach REST-Konventionen entwerfen', 'CRUD mit GET, POST, PUT und DELETE umsetzen', 'Mit ResponseEntity Status-Codes setzen', 'Wissen, wie Objekte zu JSON werden'],
          en: ['Design endpoints following REST conventions', 'Implement CRUD with GET, POST, PUT and DELETE', 'Set status codes with ResponseEntity', 'Know how objects become JSON'],
        },
        Komponente: {
          de: laden(() => import('./backend/SpringRest'), 'SpringRest'),
          en: laden(() => import('./backend/SpringRest.en'), 'SpringRest'),
        },
      },
      {
        id: 'spring-fehler',
        titel: { de: 'Validierung & Fehlerbehandlung', en: 'Validation & Error Handling' },
        kurz: {
          de: 'Eingaben mit @Valid prüfen und Exceptions in klare Antworten verwandeln.',
          en: 'Check input with @Valid and turn exceptions into clear answers.',
        },
        dauer: 40,
        lernziele: {
          de: ['Eingaben mit Bean Validation prüfen', 'Exceptions auf passende Status-Codes abbilden', 'Fehler zentral mit @RestControllerAdvice behandeln', 'Fehlerantworten als ProblemDetail liefern'],
          en: ['Check input with Bean Validation', 'Map exceptions to fitting status codes', 'Handle errors centrally with @RestControllerAdvice', 'Return error answers as ProblemDetail'],
        },
        Komponente: {
          de: laden(() => import('./backend/SpringErrors'), 'SpringErrors'),
          en: laden(() => import('./backend/SpringErrors.en'), 'SpringErrors'),
        },
      },
      {
        id: 'spring-daten',
        titel: { de: 'Datenbanken mit Spring Data JPA', en: 'Databases with Spring Data JPA' },
        kurz: {
          de: 'Entities, Repositories ohne Implementierung und Abfragen aus Methodennamen.',
          en: 'Entities, repositories without an implementation and queries from method names.',
        },
        dauer: 45,
        lernziele: {
          de: ['Entities mit @Entity und @Id beschreiben', 'Mit JpaRepository speichern und laden', 'Abfragen aus Methodennamen ableiten', 'Controller, Service und Repository trennen'],
          en: ['Describe entities with @Entity and @Id', 'Save and load with JpaRepository', 'Derive queries from method names', 'Separate controller, service and repository'],
        },
        Komponente: {
          de: laden(() => import('./backend/SpringData'), 'SpringData'),
          en: laden(() => import('./backend/SpringData.en'), 'SpringData'),
        },
      },
      {
        id: 'spring-konfig',
        titel: { de: 'Konfiguration, Profile & Tests', en: 'Configuration, Profiles & Tests' },
        kurz: {
          de: 'Einstellungen außerhalb des Codes, verschiedene Umgebungen - und wie man Spring-Apps testet.',
          en: 'Settings outside the code, different environments - and how Spring apps are tested.',
        },
        dauer: 35,
        lernziele: {
          de: ['Werte mit @Value und @ConfigurationProperties lesen', 'Profile für verschiedene Umgebungen einsetzen', 'Konfiguration per Umgebungsvariable überschreiben', 'Controller mit MockMvc testen'],
          en: ['Read values with @Value and @ConfigurationProperties', 'Use profiles for different environments', 'Override configuration with environment variables', 'Test controllers with MockMvc'],
        },
        Komponente: {
          de: laden(() => import('./backend/SpringConfig'), 'SpringConfig'),
          en: laden(() => import('./backend/SpringConfig.en'), 'SpringConfig'),
        },
      },
      {
        id: 'spring-react',
        titel: { de: 'React trifft Spring Boot', en: 'React Meets Spring Boot' },
        kurz: {
          de: 'Die ToDo-App bekommt einen Server: fetch, CORS, der Vite-Proxy - und eine Full-Stack-Werkstatt.',
          en: 'The todo app gets a server: fetch, CORS, the Vite proxy - and a full-stack workshop.',
        },
        dauer: 40,
        lernziele: {
          de: ['Frontend und Backend über HTTP verbinden', 'Antworten mit fetch sicher auswerten', 'CORS verstehen und lösen', 'Den Weg von der Entwicklung in die Produktion kennen'],
          en: ['Connect frontend and backend via HTTP', 'Evaluate answers safely with fetch', 'Understand and solve CORS', 'Know the way from development to production'],
        },
        Komponente: {
          de: laden(() => import('./backend/SpringReact'), 'SpringReact'),
          en: laden(() => import('./backend/SpringReact.en'), 'SpringReact'),
        },
      },
      {
        id: 'docker-start',
        titel: { de: 'Container & Images', en: 'Containers & Images' },
        kurz: {
          de: 'Warum Container, was ein Image ist - und die Docker-Befehle für jeden Tag im Terminal.',
          en: 'Why containers, what an image is - and the everyday Docker commands in the terminal.',
        },
        dauer: 30,
        lernziele: {
          de: ['Container, Images und virtuelle Maschinen unterscheiden', 'Container mit docker run starten und verwalten', 'Ports und Umgebungsvariablen setzen', 'Daten mit Volumes erhalten'],
          en: ['Tell containers, images and virtual machines apart', 'Start and manage containers with docker run', 'Set ports and environment variables', 'Keep data with volumes'],
        },
        Komponente: {
          de: laden(() => import('./backend/DockerStart'), 'DockerStart'),
          en: laden(() => import('./backend/DockerStart.en'), 'DockerStart'),
        },
      },
      {
        id: 'docker-dockerfile',
        titel: { de: 'Das eigene Image: Dockerfile', en: 'Your Own Image: the Dockerfile' },
        kurz: {
          de: 'Anweisungen, Schichten und Build-Cache, .dockerignore und Multi-Stage-Builds für Spring und React.',
          en: 'Instructions, layers and the build cache, .dockerignore and multi-stage builds for Spring and React.',
        },
        dauer: 45,
        lernziele: {
          de: ['Ein Dockerfile schreiben und bauen', 'Den Build-Cache mit der richtigen Reihenfolge nutzen', 'Multi-Stage-Builds für kleine Images einsetzen', 'Images sicherer machen (eigener Benutzer, feste Versionen)'],
          en: ['Write and build a Dockerfile', 'Use the build cache with the right order', 'Use multi-stage builds for small images', 'Make images safer (own user, fixed versions)'],
        },
        Komponente: {
          de: laden(() => import('./backend/Dockerfile'), 'Dockerfile'),
          en: laden(() => import('./backend/Dockerfile.en'), 'Dockerfile'),
        },
      },
      {
        id: 'docker-compose',
        titel: { de: 'Docker Compose: die ganze App', en: 'Docker Compose: the Whole App' },
        kurz: {
          de: 'Datenbank, Backend und Frontend in einer Datei - gestartet mit einem Befehl.',
          en: 'Database, backend and frontend in one file - started with one command.',
        },
        dauer: 40,
        lernziele: {
          de: ['Eine compose.yaml für mehrere Container schreiben', 'Container über Service-Namen verbinden', 'Die Startreihenfolge mit Healthchecks absichern', 'Konfiguration und Passwörter richtig übergeben'],
          en: ['Write a compose.yaml for several containers', 'Connect containers by service name', 'Secure the start order with healthchecks', 'Pass configuration and passwords the right way'],
        },
        Komponente: {
          de: laden(() => import('./backend/DockerCompose'), 'DockerCompose'),
          en: laden(() => import('./backend/DockerCompose.en'), 'DockerCompose'),
        },
      },
    ],
  },
  {
    id: 'sql',
    nummer: 9,
    titel: { de: 'Datenbanken: SQL mit PostgreSQL', en: 'Databases: SQL with PostgreSQL' },
    kurztitel: { de: 'PostgreSQL', en: 'PostgreSQL' },
    bereich: 'backend',
    beschreibung: {
      de: 'Die Sprache der Datenbanken: abfragen, filtern, gruppieren, Tabellen verbinden, Daten ändern und Tabellen entwerfen. Alles läuft auf echtem PostgreSQL direkt im Browser - mit einer fertigen Shop-Datenbank, die bei jedem Lauf frisch startet.',
      en: 'The language of databases: querying, filtering, grouping, joining tables, changing data and designing tables. Everything runs on real PostgreSQL right in the browser - with a ready-made shop database that starts fresh on every run.',
    },
    kapitel: [
      {
        id: 'sql-start',
        titel: { de: 'Tabellen & SELECT', en: 'Tables & SELECT' },
        kurz: {
          de: 'Was eine relationale Datenbank ist, die Beispieldatenbank - und die ersten Abfragen.',
          en: 'What a relational database is, the example database - and the first queries.',
        },
        dauer: 30,
        lernziele: {
          de: ['Tabellen, Zeilen, Spalten und Schlüssel erklären', 'Spalten mit SELECT auswählen und umbenennen', 'Ergebnisse mit ORDER BY und LIMIT sortieren und begrenzen', 'Mit psql und \\d eine Datenbank erkunden'],
          en: ['Explain tables, rows, columns and keys', 'Select and rename columns with SELECT', 'Sort and limit results with ORDER BY and LIMIT', 'Explore a database with psql and \\d'],
        },
        Komponente: {
          de: laden(() => import('./sql/Start'), 'Start'),
          en: laden(() => import('./sql/Start.en'), 'Start'),
        },
      },
      {
        id: 'sql-where',
        titel: { de: 'Filtern mit WHERE', en: 'Filtering with WHERE' },
        kurz: {
          de: 'Vergleiche, AND/OR, IN, BETWEEN, LIKE - und der Sonderfall NULL.',
          en: 'Comparisons, AND/OR, IN, BETWEEN, LIKE - and the special case NULL.',
        },
        dauer: 30,
        lernziele: {
          de: ['Zeilen mit Vergleichen und AND/OR filtern', 'IN, BETWEEN, LIKE und ILIKE einsetzen', 'NULL mit IS NULL und COALESCE richtig behandeln', 'Werte mit CASE einteilen'],
          en: ['Filter rows with comparisons and AND/OR', 'Use IN, BETWEEN, LIKE and ILIKE', 'Handle NULL correctly with IS NULL and COALESCE', 'Classify values with CASE'],
        },
        Komponente: {
          de: laden(() => import('./sql/Where'), 'Where'),
          en: laden(() => import('./sql/Where.en'), 'Where'),
        },
      },
      {
        id: 'sql-gruppieren',
        titel: { de: 'Zählen & Gruppieren', en: 'Counting & Grouping' },
        kurz: {
          de: 'count, sum und avg, GROUP BY und HAVING - Auswertungen in einer Abfrage.',
          en: 'count, sum and avg, GROUP BY and HAVING - reports in one query.',
        },
        dauer: 35,
        lernziele: {
          de: ['Aggregatfunktionen wie count, sum und avg anwenden', 'Mit GROUP BY pro Gruppe rechnen', 'WHERE und HAVING unterscheiden', 'Die Reihenfolge kennen, in der eine Abfrage ausgewertet wird'],
          en: ['Use aggregate functions like count, sum and avg', 'Compute per group with GROUP BY', 'Tell WHERE and HAVING apart', 'Know the order in which a query is evaluated'],
        },
        Komponente: {
          de: laden(() => import('./sql/Gruppieren'), 'Gruppieren'),
          en: laden(() => import('./sql/Gruppieren.en'), 'Gruppieren'),
        },
      },
      {
        id: 'sql-joins',
        titel: { de: 'Tabellen verbinden: JOIN', en: 'Joining Tables: JOIN' },
        kurz: {
          de: 'Primär- und Fremdschlüssel, INNER und LEFT JOIN - und Abfragen über vier Tabellen.',
          en: 'Primary and foreign keys, INNER and LEFT JOIN - and queries across four tables.',
        },
        dauer: 40,
        lernziele: {
          de: ['Beziehungen über Fremdschlüssel verstehen', 'Tabellen mit JOIN … ON verbinden', 'Mit LEFT JOIN auch Zeilen ohne Partner finden', 'JOIN und GROUP BY für Auswertungen kombinieren'],
          en: ['Understand relationships through foreign keys', 'Connect tables with JOIN … ON', 'Find rows without a partner with LEFT JOIN', 'Combine JOIN and GROUP BY for reports'],
        },
        Komponente: {
          de: laden(() => import('./sql/Joins'), 'Joins'),
          en: laden(() => import('./sql/Joins.en'), 'Joins'),
        },
      },
      {
        id: 'sql-aendern',
        titel: { de: 'Daten ändern & Transaktionen', en: 'Changing Data & Transactions' },
        kurz: {
          de: 'INSERT, UPDATE und DELETE sicher einsetzen - und mit BEGIN/ROLLBACK alles oder nichts.',
          en: 'Use INSERT, UPDATE and DELETE safely - and all or nothing with BEGIN/ROLLBACK.',
        },
        dauer: 35,
        lernziele: {
          de: ['Zeilen mit INSERT einfügen und mit RETURNING zurückbekommen', 'Zeilen mit UPDATE und DELETE gezielt ändern', 'Fehlermeldungen von Constraints lesen', 'Änderungen in Transaktionen bündeln'],
          en: ['Insert rows with INSERT and get them back with RETURNING', 'Change rows precisely with UPDATE and DELETE', 'Read error messages from constraints', 'Bundle changes in transactions'],
        },
        Komponente: {
          de: laden(() => import('./sql/Aendern'), 'Aendern'),
          en: laden(() => import('./sql/Aendern.en'), 'Aendern'),
        },
      },
      {
        id: 'sql-tabellen',
        titel: { de: 'Tabellen entwerfen: CREATE TABLE', en: 'Designing Tables: CREATE TABLE' },
        kurz: {
          de: 'Datentypen, Schlüssel und Constraints, ALTER TABLE - und Indizes für schnelle Abfragen.',
          en: 'Data types, keys and constraints, ALTER TABLE - and indexes for fast queries.',
        },
        dauer: 40,
        lernziele: {
          de: ['Tabellen mit passenden Datentypen anlegen', 'Regeln mit PRIMARY KEY, REFERENCES, NOT NULL, UNIQUE und CHECK festlegen', 'Tabellen mit ALTER TABLE ändern', 'Mit EXPLAIN sehen, wann ein Index hilft'],
          en: ['Create tables with fitting data types', 'Set rules with PRIMARY KEY, REFERENCES, NOT NULL, UNIQUE and CHECK', 'Change tables with ALTER TABLE', 'See with EXPLAIN when an index helps'],
        },
        Komponente: {
          de: laden(() => import('./sql/Tabellen'), 'Tabellen'),
          en: laden(() => import('./sql/Tabellen.en'), 'Tabellen'),
        },
      },
      {
        id: 'sql-profi',
        titel: { de: 'Unterabfragen, CTEs & Window Functions', en: 'Subqueries, CTEs & Window Functions' },
        kurz: {
          de: 'Abfragen in Abfragen, WITH für Lesbarkeit, Ranglisten und laufende Summen.',
          en: 'Queries inside queries, WITH for readability, rankings and running totals.',
        },
        dauer: 40,
        lernziele: {
          de: ['Unterabfragen in WHERE und FROM einsetzen', 'Lange Abfragen mit WITH in Schritte zerlegen', 'Mit Window Functions Ranglisten und laufende Summen bilden', 'Abfragen als View speichern'],
          en: ['Use subqueries in WHERE and FROM', 'Split long queries into steps with WITH', 'Build rankings and running totals with window functions', 'Save queries as a view'],
        },
        Komponente: {
          de: laden(() => import('./sql/Profi'), 'Profi'),
          en: laden(() => import('./sql/Profi.en'), 'Profi'),
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
  // Teil 2 baut direkt auf JavaScript auf. React (Teil 3) setzt ihn nicht voraus - erst das TypeScript-Kapitel in Teil 5.
  'ts-start': ['js-variablen', 'js-funktionen'],
  'ts-objekte': ['ts-start', 'js-objekte'],
  'ts-funktionen': ['ts-objekte', 'js-funktionen'],
  'ts-unions': ['ts-funktionen', 'js-kontrollfluss'],
  'ts-generics': ['ts-unions', 'js-arrays'],
  'ts-utility': ['ts-generics'],
  'ts-klassen': ['ts-objekte', 'js-fehler'],
  'ts-fortgeschritten': ['ts-utility', 'js-async'],
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
  'praxis-typescript': ['react-props', 'hooks-usereducer', 'hooks-usecontext', 'ts-unions', 'ts-generics'],
  'praxis-routing': ['react-props', 'react-datenfluss', 'praxis-komposition', 'praxis-daten'],
  'praxis-testen': ['react-state', 'praxis-formulare', 'praxis-daten', 'js-async'],
  'praxis-barrierefreiheit': ['praxis-formulare', 'praxis-testen', 'hooks-useref'],
  'praxis-lokal': ['react-komponenten', 'hooks-useeffect'],
  'praxis-projekt': ['hooks-usereducer', 'hooks-eigene', 'hooks-useeffect'],
  'praxis-business': ['hooks-usecontext', 'hooks-usereducer', 'praxis-formulare', 'praxis-komposition'],
  // Teil 7 steht für sich: Java braucht kein React. Die Verweise auf den
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
  // Part 8: Spring builds on the Java part; the Docker chapters on the Spring backend they package.
  'spring-start': ['java-klassen', 'java-collections', 'praxis-daten'],
  'spring-beans': ['spring-start', 'java-vererbung'],
  'spring-rest': ['spring-beans', 'java-collections'],
  'spring-fehler': ['spring-rest', 'java-fehler'],
  'spring-daten': ['spring-rest'],
  'spring-konfig': ['spring-beans', 'spring-daten'],
  'spring-react': ['spring-rest', 'praxis-daten', 'hooks-useeffect'],
  'docker-start': ['praxis-lokal'],
  'docker-dockerfile': ['docker-start', 'spring-start'],
  'docker-compose': ['docker-dockerfile', 'spring-daten', 'spring-konfig', 'spring-react'],
  // Part 9 stands on its own like Java: SQL needs no programming language.
  'sql-where': ['sql-start'],
  'sql-gruppieren': ['sql-where'],
  'sql-joins': ['sql-gruppieren'],
  'sql-aendern': ['sql-where'],
  'sql-tabellen': ['sql-joins', 'sql-aendern'],
  'sql-profi': ['sql-joins', 'sql-gruppieren'],
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
  'ts-start': ['typescript', 'ts', 'type', 'Typ', 'annotation', 'inference', 'Inferenz', 'string', 'number', 'boolean', 'array', 'tuple', 'Tupel', 'any', 'unknown', 'strict', 'tsc', 'type erasure'],
  'ts-objekte': ['type', 'interface', 'optional', 'readonly', 'extends', 'intersection', 'structural typing', 'strukturell', 'index signature', 'Record', 'excess property'],
  'ts-funktionen': ['function', 'Funktion', 'parameter', 'return type', 'Rückgabetyp', 'callback', 'void', 'never', 'overload', 'Überladung', 'rest parameter', 'function type'],
  'ts-unions': ['union', 'literal type', 'narrowing', 'Eingrenzen', 'typeof', 'instanceof', 'discriminated union', 'exhaustive', 'never', 'type guard', 'type predicate', 'null', 'undefined', 'strictNullChecks'],
  'ts-generics': ['generics', 'Generics', 'generic', 'type parameter', 'Typparameter', 'extends', 'constraint', 'keyof', 'default type'],
  'ts-utility': ['utility types', 'keyof', 'typeof', 'indexed access', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit', 'Record', 'ReturnType', 'Parameters', 'Awaited', 'NonNullable', 'Exclude', 'Extract', 'as const', 'satisfies'],
  'ts-klassen': ['class', 'Klasse', 'private', 'protected', 'public', 'readonly', 'parameter properties', 'implements', 'abstract', 'enum', 'import type', 'export', 'module', 'd.ts', 'declare'],
  'ts-fortgeschritten': ['mapped types', 'conditional types', 'infer', 'template literal types', 'type assertion', 'non-null assertion', 'Promise', 'async', 'fetch', 'unknown', 'validation', 'Validierung', 'tsconfig', 'strict', 'noUncheckedIndexedAccess'],
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
  'spring-start': ['Spring', 'Spring Boot', 'backend', 'Backend', 'HTTP', 'REST', 'status code', 'Statuscode', '@RestController', '@GetMapping', '@RequestParam', '@PathVariable', 'Tomcat', 'Maven', 'pom.xml', 'start.spring.io', 'JSON'],
  'spring-beans': ['bean', 'Bean', 'dependency injection', 'Dependency Injection', 'DI', 'IoC', '@Component', '@Service', '@Autowired', '@Bean', '@Configuration', '@Primary', '@Qualifier', 'singleton', 'CommandLineRunner', 'NoUniqueBeanDefinitionException'],
  'spring-rest': ['REST', 'API', 'CRUD', '@PostMapping', '@PutMapping', '@DeleteMapping', '@RequestMapping', '@RequestBody', 'ResponseEntity', 'DTO', 'record', 'Jackson', 'JSON', '201', '204', '404', 'Location'],
  'spring-fehler': ['validation', 'Validierung', '@Valid', '@NotBlank', '@Size', 'Bean Validation', 'exception', '@ExceptionHandler', '@RestControllerAdvice', 'ResponseStatusException', '@ResponseStatus', 'ProblemDetail', '400', '500'],
  'spring-daten': ['JPA', 'Hibernate', 'Spring Data', 'JpaRepository', '@Entity', '@Id', '@GeneratedValue', 'repository', 'Repository', 'SQL', 'database', 'Datenbank', 'H2', 'PostgreSQL', 'derived query', 'findBy', 'Service', 'ORM'],
  'spring-konfig': ['application.properties', 'configuration', 'Konfiguration', '@Value', '@ConfigurationProperties', 'profile', 'Profil', '@Profile', 'environment variable', 'Umgebungsvariable', 'MockMvc', '@SpringBootTest', '@WebMvcTest', 'test', 'Test'],
  'spring-react': ['CORS', 'fetch', 'full stack', 'Full-Stack', 'Vite proxy', 'Proxy', '@CrossOrigin', 'same-origin', 'nginx', 'frontend', 'Frontend'],
  'docker-start': ['Docker', 'container', 'Container', 'image', 'Image', 'docker run', 'docker ps', 'docker logs', 'port', 'Port', 'volume', 'Volume', 'Docker Hub', 'registry', 'VM'],
  'docker-dockerfile': ['Dockerfile', 'docker build', 'layer', 'Schicht', 'cache', 'Cache', 'multi-stage', 'Multi-Stage', '.dockerignore', 'FROM', 'COPY', 'RUN', 'ENTRYPOINT', 'USER', 'nginx', 'JRE'],
  'docker-compose': ['Docker Compose', 'compose.yaml', 'docker-compose', 'services', 'depends_on', 'healthcheck', 'network', 'Netzwerk', '.env', 'Kubernetes', 'deployment', 'Deployment'],
  'sql-start': ['SQL', 'PostgreSQL', 'Postgres', 'database', 'Datenbank', 'relational', 'table', 'Tabelle', 'SELECT', 'FROM', 'AS', 'ORDER BY', 'LIMIT', 'OFFSET', 'DISTINCT', 'psql', 'PGlite', 'primary key', 'Primärschlüssel'],
  'sql-where': ['WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'ILIKE', 'NULL', 'IS NULL', 'COALESCE', 'CASE', 'filter', 'Filter'],
  'sql-gruppieren': ['GROUP BY', 'HAVING', 'aggregate', 'Aggregat', 'count', 'sum', 'avg', 'min', 'max', 'round', 'date_trunc', 'extract', 'string_agg'],
  'sql-joins': ['JOIN', 'INNER JOIN', 'LEFT JOIN', 'ON', 'USING', 'foreign key', 'Fremdschlüssel', 'relationship', 'Beziehung', 'alias', 'n:m'],
  'sql-aendern': ['INSERT', 'UPDATE', 'DELETE', 'RETURNING', 'transaction', 'Transaktion', 'BEGIN', 'COMMIT', 'ROLLBACK', 'ACID', 'constraint', 'ON CONFLICT', 'upsert'],
  'sql-tabellen': ['CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'data type', 'Datentyp', 'PRIMARY KEY', 'REFERENCES', 'NOT NULL', 'UNIQUE', 'CHECK', 'DEFAULT', 'IDENTITY', 'index', 'Index', 'CREATE INDEX', 'EXPLAIN', 'numeric', 'jsonb', 'normalization', 'Normalisierung'],
  'sql-profi': ['subquery', 'Unterabfrage', 'EXISTS', 'CTE', 'WITH', 'window function', 'OVER', 'PARTITION BY', 'rank', 'row_number', 'running total', 'laufende Summe', 'VIEW', 'CREATE VIEW', 'UNION'],
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
