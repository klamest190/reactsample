import { js } from '../../lernen/quelltext'
import type { WerkstattDatei } from '../../lernen/Werkstatt'

/**
 * Die Business-App für Kapitel 5.12 - ein echtes kleines Projekt.
 *
 * Die Dateien liegen als normale .tsx/.ts-Dateien unter ./businessApp/ und werden
 * hier nur als Text eingelesen (?raw). So bleiben sie lesbar, man kann sie 1:1 in
 * ein Vite-Projekt kopieren - und Tailwind findet ihre Klassen beim Bauen.
 */
const quellen = import.meta.glob<string>('./businessApp/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function quelle(pfad: string) {
  const code = quellen[`./businessApp/${pfad}`]
  if (code === undefined) throw new Error(`Datei fehlt: businessApp/${pfad}`)
  return code.replace(/\r\n/g, '\n').trimEnd()
}

type Beschreibung = Omit<WerkstattDatei, 'code'>

const beschreibungen: Beschreibung[] = [
  {
    pfad: 'App.tsx',
    text: {
      de: 'Der Einstieg: Store drumherum, Layout, und je nach Menüpunkt eine andere Seite.',
      en: 'The entry point: store around everything, the layout, and a different page per menu entry.',
    },
    kapitel: ['react-komponenten', 'react-datenfluss'],
  },
  {
    pfad: 'store.tsx',
    text: {
      de: 'Alle Daten der App: ein Reducer für die Änderungen, per Context überall erreichbar, dazu der eigene Hook useStore.',
      en: 'All data of the app: a reducer for the changes, available everywhere via context, plus the custom hook useStore.',
    },
    kapitel: ['hooks-usereducer', 'hooks-usecontext', 'hooks-eigene', 'js-referenzen'],
  },
  {
    pfad: 'data.ts',
    text: {
      de: 'Das Datenmodell (Customer, Order, OrderStatus) und die Startdaten - in einer echten App kämen sie per fetch vom Server.',
      en: 'The data model (Customer, Order, OrderStatus) and the start data - in a real app they would come from a server via fetch.',
    },
    kapitel: ['js-objekte', 'praxis-daten'],
  },
  {
    pfad: 'format.ts',
    text: {
      de: 'Hilfsfunktionen ganz ohne React - ein normales Modul mit export, typisiert.',
      en: 'Helper functions without any React - a plain typed module with export.',
    },
    kapitel: ['js-dom', 'js-funktionen'],
  },
  {
    pfad: 'hooks/useSort.ts',
    text: {
      de: 'Eigener Hook zum Sortieren von Tabellen - wiederverwendbar für jede Liste.',
      en: 'Custom hook for sorting tables - reusable for any list.',
    },
    kapitel: ['hooks-eigene', 'hooks-usememo', 'js-arrays'],
  },
  {
    pfad: 'pages/Dashboard.tsx',
    text: {
      de: 'Kennzahlen und Listen - alles aus den Aufträgen abgeleitet, nichts doppelt gespeichert.',
      en: 'Key figures and lists - all derived from the orders, nothing stored twice.',
    },
    kapitel: ['hooks-usememo', 'js-arrays', 'react-props'],
  },
  {
    pfad: 'pages/Customers.tsx',
    text: {
      de: 'Kundentabelle mit Suche, Sortierung und Dialog zum Anlegen und Bearbeiten.',
      en: 'Customer table with search, sorting and a dialog for creating and editing.',
    },
    kapitel: ['react-state', 'react-props', 'hooks-eigene'],
  },
  {
    pfad: 'pages/Orders.tsx',
    text: {
      de: 'Aufträge mit Status-Filter, Summenzeile und Statuswechsel per dispatch.',
      en: 'Orders with a status filter, a total row and status changes via dispatch.',
    },
    kapitel: ['react-props', 'hooks-usereducer', 'js-arrays'],
  },
  {
    pfad: 'components/Layout.tsx',
    text: {
      de: 'Seitenleiste und Inhaltsbereich. Die Seite selbst kommt als children herein.',
      en: 'Sidebar and content area. The page itself comes in as children.',
    },
    kapitel: ['praxis-komposition', 'praxis-tailwind'],
  },
  {
    pfad: 'components/Panel.tsx',
    text: {
      de: 'Eine Box mit Titel und optionaler Aktion - ein Slot-Muster.',
      en: 'A box with a title and an optional action - a slot pattern.',
    },
    kapitel: ['praxis-komposition'],
  },
  {
    pfad: 'components/StatCard.tsx',
    text: {
      de: 'Eine Kennzahl-Kachel. Rein darstellend: nur Props, kein State.',
      en: 'A key figure tile. Purely presentational: only props, no state.',
    },
    kapitel: ['react-props'],
  },
  {
    pfad: 'components/StatusBadge.tsx',
    text: {
      de: 'Farbiges Etikett pro Status - die Farben stehen in einem Objekt.',
      en: 'A colored label per status - the colors live in an object.',
    },
    kapitel: ['praxis-tailwind', 'js-objekte'],
  },
  {
    pfad: 'components/Button.tsx',
    text: {
      de: 'Ein Button in zwei Varianten. Alle übrigen Props werden per Rest/Spread durchgereicht.',
      en: 'A button in two variants. All other props are passed through with rest/spread.',
    },
    kapitel: ['js-objekte', 'praxis-tailwind'],
  },
  {
    pfad: 'components/Field.tsx',
    text: {
      de: 'Label, Eingabefeld und Fehlermeldung - verbunden über useId.',
      en: 'Label, input and error message - connected via useId.',
    },
    kapitel: ['praxis-formulare'],
  },
  {
    pfad: 'components/Dialog.tsx',
    text: {
      de: 'Modaler Dialog: Inhalt per children, Schließen mit Escape über einen Effekt mit Cleanup.',
      en: 'Modal dialog: content via children, closing with Escape through an effect with cleanup.',
    },
    kapitel: ['hooks-useeffect', 'praxis-komposition'],
  },
  {
    pfad: 'components/CustomerForm.tsx',
    text: {
      de: 'Kontrolliertes Formular mit einem Handler für alle Felder und abgeleiteter Validierung.',
      en: 'Controlled form with one handler for all fields and derived validation.',
    },
    kapitel: ['praxis-formulare', 'hooks-usestate'],
  },
  {
    pfad: 'components/OrderForm.tsx',
    text: {
      de: 'Neuer Auftrag: Auswahlliste, Zahlenfeld und eine einfache Prüfung beim Absenden.',
      en: 'New order: a select, a number input and a simple check on submit.',
    },
    kapitel: ['praxis-formulare'],
  },
]

export const dateien: WerkstattDatei[] = beschreibungen.map((b) => ({ ...b, code: quelle(b.pfad) }))

export const codeBloecke = {
  main: js`
    import { StrictMode } from 'react'
    import { createRoot } from 'react-dom/client'
    import './index.css'
    import App from './App'

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  `,
  anlegen: js`
    npm create vite@latest brightdesk -- --template react-ts
    cd brightdesk
    npm install tailwindcss @tailwindcss/vite
    npm run dev
  `,
}
