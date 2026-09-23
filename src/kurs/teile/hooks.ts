import { laden, type Teil } from './typen'

export const hooksTeil: Teil = {
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
      stichworte: ['rules of hooks', 'Hook-Regeln', 'updater function', 'lazy initializer', 'key reset'],
      Komponente: {
        de: laden(() => import('../hooks/UseState'), 'UseState'),
        en: laden(() => import('../hooks/UseState.en'), 'UseState'),
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
      stichworte: ['effect', 'Effekt', 'dependency array', 'cleanup', 'stale closure', 'useEffectEvent'],
      Komponente: {
        de: laden(() => import('../hooks/UseEffect'), 'UseEffect'),
        en: laden(() => import('../hooks/UseEffect.en'), 'UseEffect'),
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
      stichworte: ['ref', 'focus', 'DOM', 'forwardRef', 'ref prop', 'useImperativeHandle', 'useLayoutEffect', 'measure', 'messen'],
      Komponente: {
        de: laden(() => import('../hooks/UseRef'), 'UseRef'),
        en: laden(() => import('../hooks/UseRef.en'), 'UseRef'),
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
      stichworte: ['useCallback', 'memo', 'memoization', 'performance', 're-render', 'React Compiler', 'Compiler'],
      Komponente: {
        de: laden(() => import('../hooks/UseMemo'), 'UseMemo'),
        en: laden(() => import('../hooks/UseMemo.en'), 'UseMemo'),
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
      stichworte: ['reducer', 'dispatch', 'action'],
      Komponente: {
        de: laden(() => import('../hooks/UseReducer'), 'UseReducer'),
        en: laden(() => import('../hooks/UseReducer.en'), 'UseReducer'),
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
      stichworte: ['context', 'createContext', 'provider', 'prop drilling'],
      Komponente: {
        de: laden(() => import('../hooks/UseContext'), 'UseContext'),
        en: laden(() => import('../hooks/UseContext.en'), 'UseContext'),
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
      stichworte: ['custom hook', 'useLocalStorage', 'useFetch'],
      Komponente: {
        de: laden(() => import('../hooks/EigeneHooks'), 'EigeneHooks'),
        en: laden(() => import('../hooks/EigeneHooks.en'), 'EigeneHooks'),
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
      stichworte: ['useTransition', 'useDeferredValue', 'lazy', 'Suspense', 'isPending', 'concurrent', 'code splitting', 'Code-Splitting'],
      Komponente: {
        de: laden(() => import('../hooks/Nebenlaeufigkeit'), 'Nebenlaeufigkeit'),
        en: laden(() => import('../hooks/Nebenlaeufigkeit.en'), 'Nebenlaeufigkeit'),
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
      stichworte: ['use', 'useActionState', 'useFormStatus', 'useOptimistic', 'form action', 'Suspense'],
      Komponente: {
        de: laden(() => import('../hooks/React19Hooks'), 'React19Hooks'),
        en: laden(() => import('../hooks/React19Hooks.en'), 'React19Hooks'),
      },
    },
  ],
}
