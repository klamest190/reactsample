import { laden, type Teil } from './typen'

export const reactTeil: Teil = {
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
      stichworte: ['component', 'JSX', 'createRoot', 'fragment', 'className'],
      Komponente: {
        de: laden(() => import('../react/Komponenten'), 'Komponenten'),
        en: laden(() => import('../react/Komponenten.en'), 'Komponenten'),
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
      stichworte: ['props', 'children', 'key', 'list', 'Liste', 'conditional rendering'],
      Komponente: {
        de: laden(() => import('../react/Props'), 'Props'),
        en: laden(() => import('../react/Props.en'), 'Props'),
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
      stichworte: ['useState', 'onClick', 'event handler', 'render', 'snapshot', 'batching'],
      Komponente: {
        de: laden(() => import('../react/StateUndEvents'), 'StateUndEvents'),
        en: laden(() => import('../react/StateUndEvents.en'), 'StateUndEvents'),
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
      stichworte: ['lifting state up', 'State anheben', 'data flow', 'derived state', 'thinking in react'],
      Komponente: {
        de: laden(() => import('../react/Datenfluss'), 'Datenfluss'),
        en: laden(() => import('../react/Datenfluss.en'), 'Datenfluss'),
      },
    },
  ],
}
