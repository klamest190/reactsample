import { laden, type Teil } from './typen'

export const praxisTeil: Teil = {
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
      stichworte: ['form', 'Formular', 'controlled', 'uncontrolled', 'validation', 'Validierung', 'useId', 'label'],
      Komponente: {
        de: laden(() => import('../praxis/Formulare'), 'Formulare'),
        en: laden(() => import('../praxis/Formulare.en'), 'Formulare'),
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
      stichworte: ['fetch', 'loading', 'AbortController', 'race condition', 'useFetch', 'TanStack Query'],
      Komponente: {
        de: laden(() => import('../praxis/DatenLaden'), 'DatenLaden'),
        en: laden(() => import('../praxis/DatenLaden.en'), 'DatenLaden'),
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
      stichworte: ['children', 'slot', 'render props', 'portal', 'createPortal', 'tabs'],
      Komponente: {
        de: laden(() => import('../praxis/Komposition'), 'Komposition'),
        en: laden(() => import('../praxis/Komposition.en'), 'Komposition'),
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
      stichworte: ['error boundary', 'try catch', 'Fehler', 'error'],
      Komponente: {
        de: laden(() => import('../praxis/Fehlerbehandlung'), 'Fehlerbehandlung'),
        en: laden(() => import('../praxis/Fehlerbehandlung.en'), 'Fehlerbehandlung'),
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
      stichworte: ['tailwind', 'css', 'className', 'dark mode', 'utility'],
      Komponente: {
        de: laden(() => import('../praxis/Tailwind'), 'Tailwind'),
        en: laden(() => import('../praxis/Tailwind.en'), 'Tailwind'),
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
      stichworte: ['typescript', 'ts', 'tsx', 'type', 'interface', 'generics', 'Generics', 'union', 'discriminated union', 'unknown', 'any', 'never', 'Partial', 'Omit', 'Pick', 'Record', 'ReactNode', 'ComponentProps', 'ChangeEvent', 'SubmitEvent', 'tsconfig', 'strict', 'type guard', 'Typen'],
      Komponente: {
        de: laden(() => import('../praxis/TypeScript'), 'TypeScriptKapitel'),
        en: laden(() => import('../praxis/TypeScript.en'), 'TypeScriptKapitel'),
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
      stichworte: ['router', 'react router', 'route', 'Link', 'NavLink', 'useParams', 'useNavigate', 'Navigate', 'Outlet', 'useSearchParams', 'useLocation', 'loader', 'useLoaderData', 'BrowserRouter', 'MemoryRouter', '404', 'SPA', 'URL', 'Seiten'],
      Komponente: {
        de: laden(() => import('../praxis/Routing'), 'Routing'),
        en: laden(() => import('../praxis/Routing.en'), 'Routing'),
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
      stichworte: ['test', 'testing', 'Vitest', 'Jest', 'Testing Library', 'RTL', 'user-event', 'userEvent', 'expect', 'describe', 'mock', 'vi.fn', 'spyOn', 'getByRole', 'queryBy', 'findBy', 'jest-dom', 'Mutationstest', 'mutation testing', 'Playwright', 'MSW', 'Unit-Test', 'unit test'],
      Komponente: {
        de: laden(() => import('../praxis/Testen'), 'Testen'),
        en: laden(() => import('../praxis/Testen.en'), 'Testen'),
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
      stichworte: ['accessibility', 'a11y', 'Barrierefreiheit', 'ARIA', 'aria-label', 'aria-live', 'aria-describedby', 'screen reader', 'Screenreader', 'alt', 'role', 'Rolle', 'focus', 'Fokus', 'Tastatur', 'keyboard', 'dialog', 'BFSG', 'WCAG', 'semantic HTML'],
      Komponente: {
        de: laden(() => import('../praxis/Barrierefreiheit'), 'Barrierefreiheit'),
        en: laden(() => import('../praxis/Barrierefreiheit.en'), 'Barrierefreiheit'),
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
      stichworte: ['vite', 'npm', 'node', 'devtools', 'debugger', 'React DevTools', 'VS Code', 'build', 'deploy'],
      Komponente: {
        de: laden(() => import('../praxis/LokalEntwickeln'), 'LokalEntwickeln'),
        en: laden(() => import('../praxis/LokalEntwickeln.en'), 'LokalEntwickeln'),
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
      stichworte: ['habit tracker', 'Gewohnheiten', 'project'],
      Komponente: {
        de: laden(() => import('../praxis/Abschlussprojekt'), 'Abschlussprojekt'),
        en: laden(() => import('../praxis/Abschlussprojekt.en'), 'Abschlussprojekt'),
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
      stichworte: ['business app', 'CRM', 'dashboard', 'Projektstruktur', 'project structure', 'store', 'import', 'Werkstatt', 'workshop'],
      Komponente: {
        de: laden(() => import('../praxis/BusinessApp'), 'BusinessApp'),
        en: laden(() => import('../praxis/BusinessApp.en'), 'BusinessApp'),
      },
    },
  ],
}
