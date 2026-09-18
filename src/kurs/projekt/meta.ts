import type { Zweisprachig } from '../../i18n/SpracheContext'

/**
 * Der rote Faden: eine ToDo-App, die Schritt für Schritt mit den Kapiteln wächst.
 * Hier stehen nur die Metadaten (für Navigation, Suche und „Baut auf“) - Aufgaben,
 * Code und Tests liegen in schritte.ts und werden erst beim Öffnen geladen.
 *
 * Jeder Schritt startet mit dem Ergebnis des vorherigen - man kann also überall einsteigen.
 */

export type SchrittMeta = {
  id: string
  titel: Zweisprachig
  kurz: Zweisprachig
  dauer: number
  /** Kapitel, deren Wissen der Schritt anwendet. */
  grundlagen: string[]
  lernziele: Zweisprachig<string[]>
  stichworte: string[]
}

export const projektSchritte: SchrittMeta[] = [
  {
    id: 'projekt-1-daten',
    titel: { de: 'Datenmodell als Funktionen', en: 'Data model as functions' },
    kurz: { de: 'Die Logik der ToDo-App - ohne Oberfläche, nur mit reinen Funktionen.', en: 'The logic of the todo app - no UI, just pure functions.' },
    dauer: 25,
    grundlagen: ['js-funktionen', 'js-arrays', 'js-objekte', 'js-referenzen'],
    lernziele: {
      de: ['Todos als Objekte modellieren', 'Hinzufügen, Umschalten, Löschen ohne Mutation', 'Filtern und Zählen mit Array-Methoden'],
      en: ['Model todos as objects', 'Add, toggle and remove without mutation', 'Filter and count with array methods'],
    },
    stichworte: ['todo', 'reine Funktion', 'pure function', 'immutability', 'filter', 'map'],
  },
  {
    id: 'projekt-2-dom',
    titel: { de: 'Erste Oberfläche mit dem DOM', en: 'First UI with the DOM' },
    kurz: { de: 'Die Funktionen aus Schritt 1 bekommen eine Oberfläche - noch ohne React.', en: 'The functions from step 1 get a UI - still without React.' },
    dauer: 25,
    grundlagen: ['js-dom', 'projekt-1-daten'],
    lernziele: {
      de: ['Eine Liste aus Daten rendern', 'Formular und Klicks verarbeiten', 'Spüren, warum „alles neu zeichnen“ mühsam ist'],
      en: ['Render a list from data', 'Handle a form and clicks', 'Feel why “redraw everything” is tedious'],
    },
    stichworte: ['dom', 'addEventListener', 'render', 'submit', 'preventDefault'],
  },
  {
    id: 'projekt-3-komponenten',
    titel: { de: 'Komponenten & Props', en: 'Components & props' },
    kurz: { de: 'Die Liste als React-Komponenten: TodoItem und TodoList.', en: 'The list as React components: TodoItem and TodoList.' },
    dauer: 20,
    grundlagen: ['react-komponenten', 'react-props', 'projekt-2-dom'],
    lernziele: {
      de: ['Oberfläche in Komponenten zerlegen', 'Daten per Props weitergeben', 'Listen mit key rendern'],
      en: ['Split the UI into components', 'Pass data via props', 'Render lists with key'],
    },
    stichworte: ['component', 'komponente', 'props', 'key', 'jsx'],
  },
  {
    id: 'projekt-4-state',
    titel: { de: 'State & Events', en: 'State & events' },
    kurz: { de: 'Todos hinzufügen, abhaken und löschen - mit useState.', en: 'Add, check off and delete todos - with useState.' },
    dauer: 30,
    grundlagen: ['react-state', 'hooks-usestate', 'projekt-3-komponenten'],
    lernziele: {
      de: ['Todos im State halten', 'Controlled Input im Formular', 'Callbacks an Kinder geben'],
      en: ['Keep todos in state', 'A controlled input in the form', 'Pass callbacks to children'],
    },
    stichworte: ['useState', 'onSubmit', 'onChange', 'checkbox', 'callback'],
  },
  {
    id: 'projekt-5-datenfluss',
    titel: { de: 'Datenfluss & Filter', en: 'Data flow & filters' },
    kurz: { de: 'Formular und Filter als eigene Komponenten, der State lebt in App.', en: 'Form and filters as separate components, the state lives in App.' },
    dauer: 30,
    grundlagen: ['react-datenfluss', 'projekt-4-state'],
    lernziele: {
      de: ['State anheben', 'Abgeleitete Werte statt doppeltem State', 'Filter mit aria-pressed'],
      en: ['Lift state up', 'Derived values instead of duplicated state', 'Filters with aria-pressed'],
    },
    stichworte: ['lifting state', 'State anheben', 'derived state', 'filter'],
  },
  {
    id: 'projekt-6-reducer',
    titel: { de: 'Logik bündeln mit useReducer', en: 'Centralize logic with useReducer' },
    kurz: { de: 'Alle Änderungen an den Todos laufen über einen Reducer.', en: 'All changes to the todos go through a reducer.' },
    dauer: 25,
    grundlagen: ['hooks-usereducer', 'projekt-5-datenfluss'],
    lernziele: {
      de: ['Einen Reducer mit Actions schreiben', 'useState durch useReducer ersetzen', '„Clear done“ als neue Action'],
      en: ['Write a reducer with actions', 'Replace useState with useReducer', '“Clear done” as a new action'],
    },
    stichworte: ['useReducer', 'dispatch', 'action', 'reducer'],
  },
  {
    id: 'projekt-7-speichern',
    titel: { de: 'Speichern mit useEffect & eigenem Hook', en: 'Persist with useEffect & a custom hook' },
    kurz: { de: 'Die Todos überleben einen Reload - verpackt in einen eigenen Hook.', en: 'The todos survive a reload - wrapped in a custom hook.' },
    dauer: 30,
    grundlagen: ['hooks-useeffect', 'hooks-eigene', 'projekt-6-reducer'],
    lernziele: {
      de: ['localStorage mit useEffect synchronisieren', 'Lazy Initializer nutzen', 'Einen eigenen Hook bauen'],
      en: ['Sync localStorage with useEffect', 'Use a lazy initializer', 'Build a custom hook'],
    },
    stichworte: ['localStorage', 'useEffect', 'custom hook', 'eigener Hook', 'document.title'],
  },
  {
    id: 'projekt-8-fokus',
    titel: { de: 'Fokus & Tastatur mit useRef', en: 'Focus & keyboard with useRef' },
    kurz: { de: 'Das Eingabefeld behält den Fokus, Escape leert es.', en: 'The input keeps focus, Escape clears it.' },
    dauer: 15,
    grundlagen: ['hooks-useref', 'projekt-7-speichern'],
    lernziele: {
      de: ['DOM-Elemente per Ref fokussieren', 'Tastatur-Events behandeln'],
      en: ['Focus DOM elements via a ref', 'Handle keyboard events'],
    },
    stichworte: ['useRef', 'focus', 'Escape', 'onKeyDown'],
  },
  {
    id: 'projekt-9-context',
    titel: { de: 'Context statt Prop Drilling', en: 'Context instead of prop drilling' },
    kurz: { de: 'Ein TodosProvider versorgt alle Komponenten - ohne Props durchzureichen.', en: 'A TodosProvider supplies all components - without passing props down.' },
    dauer: 30,
    grundlagen: ['hooks-usecontext', 'hooks-usememo', 'projekt-8-fokus'],
    lernziele: {
      de: ['Provider-Komponente mit Reducer bauen', 'Eigenen Hook useTodos anbieten', 'Context-Wert mit useMemo stabil halten'],
      en: ['Build a provider component with a reducer', 'Offer a custom hook useTodos', 'Keep the context value stable with useMemo'],
    },
    stichworte: ['useContext', 'createContext', 'provider', 'prop drilling'],
  },
  {
    id: 'projekt-10-validierung',
    titel: { de: 'Formular-Validierung', en: 'Form validation' },
    kurz: { de: 'Leere, zu lange und doppelte Todos werden abgelehnt - mit verständlicher Meldung.', en: 'Empty, too long and duplicate todos are rejected - with a clear message.' },
    dauer: 25,
    grundlagen: ['praxis-formulare', 'projekt-9-context'],
    lernziele: {
      de: ['Validierung als abgeleiteten Wert', 'Fehlermeldungen barrierefrei anzeigen'],
      en: ['Validation as a derived value', 'Show error messages accessibly'],
    },
    stichworte: ['validation', 'Validierung', 'aria-invalid', 'role alert'],
  },
  {
    id: 'projekt-11-laden',
    titel: { de: 'Startdaten laden', en: 'Loading initial data' },
    kurz: { de: 'Beim ersten Start kommen die Todos von einer API - mit Laden, Fehler und Retry.', en: 'On first start the todos come from an API - with loading, error and retry.' },
    dauer: 30,
    grundlagen: ['praxis-daten', 'js-async', 'projekt-10-validierung'],
    lernziele: {
      de: ['fetch im Effekt mit AbortController', 'Laden, Fehler und Retry darstellen', 'Nur laden, wenn nichts gespeichert ist'],
      en: ['fetch in an effect with AbortController', 'Show loading, error and retry', 'Only load when nothing is stored'],
    },
    stichworte: ['fetch', 'AbortController', 'loading', 'retry', 'api'],
  },
  {
    id: 'projekt-12-challenge',
    titel: { de: 'Challenge: ToDo-App von null', en: 'Challenge: todo app from scratch' },
    kurz: { de: 'Ein leerer Editor, eine Anforderungsliste und Tests - zeig, was du kannst.', en: 'An empty editor, a list of requirements and tests - show what you can do.' },
    dauer: 60,
    grundlagen: ['react-datenfluss', 'hooks-usereducer', 'hooks-useeffect', 'hooks-eigene'],
    lernziele: {
      de: ['Eine vollständige React-App ohne Vorlage bauen', 'Das Gelernte selbstständig kombinieren'],
      en: ['Build a complete React app without a template', 'Combine what you learned on your own'],
    },
    stichworte: ['challenge', 'todo app', 'von null', 'from scratch', 'Abschluss'],
  },
]
