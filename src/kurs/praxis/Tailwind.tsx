import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Tailwind.code'
import { TailwindDemo } from '../demos/TailwindDemo'

/**
 * KAPITEL 5.5 - Tailwind CSS in React
 */
export function Tailwind() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Mit Tailwind stylst du direkt über Klassen in <Code>className</Code>.</P>
        <TryIt
          id="praxis-tailwind-einstieg"
          {...beispiele['praxis-tailwind-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Utility First">
        <P>
          Tailwind liefert viele kleine Klassen, die jeweils genau eine Sache tun:{' '}
          <Code>p-4</Code> = Innenabstand, <Code>text-sm</Code> = kleine Schrift,{' '}
          <Code>rounded-lg</Code> = abgerundete Ecken. Statt eigener CSS-Dateien setzt du sie direkt ins
          Markup. In React passt das gut: Struktur, Logik und Aussehen einer Komponente stehen an einer
          Stelle, und es gibt keine globalen Namenskonflikte. Diese ganze App ist so gebaut.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Liste>
          <li>
            <strong>Varianten</strong> als Präfix: <Code>hover:</Code>, <Code>focus-visible:</Code>,{' '}
            <Code>disabled:</Code>, <Code>dark:</Code>
          </li>
          <li>
            <strong>Responsive</strong> mobile first: <Code>md:flex-row</Code> gilt ab 768 px Breite
          </li>
          <li>
            <strong>group</strong> / <strong>peer</strong>: Kind reagiert auf Zustand des Elternteils oder
            Geschwisters
          </li>
        </Liste>
        <TailwindDemo />
      </Abschnitt>

      <Abschnitt titel="Ausprobieren">
        <TryIt
          id="praxis-tailwind-karte"
          {...beispiele['praxis-tailwind-karte']}
          modus="react"
        />
        <Hinweis variante="tipp">
          <strong>Autovervollständigung wie in VS Code:</strong> Tippe in <Code>className="…"</Code> los,
          z. B. <Code>bg-</Code> oder <Code>hover:text-</Code> - der Editor schlägt alle Klassen vor, mit
          Farbfeld und dem CSS, das Tailwind daraus erzeugt. Jede Klasse wirkt sofort in der Vorschau.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Klassen dynamisch setzen - die große Stolperfalle">
        <P>
          Der Tailwind-Scanner liest deinen Code nur als Text. Er führt ihn nicht aus. Klassennamen, die
          erst zur Laufzeit zusammengesetzt werden, findet er nicht - sie haben dann keine Wirkung.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel2}
        />
        <Liste>
          <li>
            Für viele Bedingungen: die kleinen Pakete <Code>clsx</Code> (Klassen zusammenbauen) und{' '}
            <Code>tailwind-merge</Code> (Konflikte wie <Code>p-2 p-4</Code> auflösen).
          </li>
          <li>
            Wiederkehrende Kombinationen nicht mit <Code>@apply</Code> verstecken, sondern in eine{' '}
            <strong>React-Komponente</strong> packen - so wie <Code>Button</Code> und <Code>Hinweis</Code>{' '}
            in <Code>src/components/Ui.tsx</Code>.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Tailwind v4 in diesem Projekt">
        <P>
          Seit Version 4 gibt es keine <Code>tailwind.config.js</Code> mehr. Alles steht in CSS:
        </P>
        <CodeBlock
          titel="src/index.css"
          code={codeBloecke.beispiel3}
        />
        <P>
          Eingebunden wird Tailwind als Vite-Plugin in <Code>vite.config.ts</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="praxis-tailwind-uebung"
          {...beispiele['praxis-tailwind-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Baue eine <Code>Badge</Code>-Komponente mit der Prop <Code>status</Code> (
                <Code>'open' | 'inProgress' | 'done'</Code>). Jeder Status bekommt eigene Farben (<Code>open</Code> → amber, <Code>inProgress</Code> → sky, <Code>done</Code> → emerald), einen Text („open“, „in progress“, „done“) und ein Symbol - über ein <strong>Lookup-Objekt mit vollständigen Klassennamen</strong>.
              </p>
              <p className="mt-1">
                Verfügbare Klassen (kommen im Projekt vor): <Code>bg-amber-100 text-amber-800</Code>,{' '}
                <Code>bg-sky-100 text-sky-800</Code>, <Code>bg-emerald-100 text-emerald-800</Code>,{' '}
                <Code>rounded-full px-2 py-0.5 text-xs font-semibold</Code>.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Warum funktioniert className={`text-${color}-600`} nicht zuverlässig?',
            antworten: [
              'Template-Literale sind in className verboten',
              'Der Scanner findet den vollständigen Klassennamen nicht im Quelltext',
              'Tailwind unterstützt keine Farben',
            ],
            richtig: 1,
            erklaerung: 'Tailwind liest den Code statisch. Klassennamen müssen vollständig darin stehen.',
          },
          {
            frage: 'Was bedeutet md:grid-cols-3?',
            antworten: ['Nur auf mittleren Bildschirmen', 'Ab 768 px Breite und größer', 'Bis 768 px Breite'],
            richtig: 1,
            erklaerung: 'Tailwind ist mobile first: Präfixe gelten ab der Breite aufwärts.',
          },
          {
            frage: 'Wie verhindert man lange, wiederholte Klassenlisten in React?',
            antworten: ['Mit @apply in CSS', 'Mit einer eigenen Komponente', 'Mit inline style'],
            richtig: 1,
            erklaerung: 'Die Komponente ist in React die natürliche Einheit für Wiederverwendung.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Utility-Klassen direkt im JSX; Varianten wie hover:, dark:, md: als Präfix.',
          'Klassennamen immer vollständig in den Code schreiben - Lookup-Objekte statt Zusammensetzen.',
          'Wiederholungen in Komponenten kapseln, nicht mit @apply.',
          <>
            v4: Konfiguration in CSS (<Code>@import</Code>, <Code>@theme</Code>,{' '}
            <Code>@custom-variant</Code>).
          </>,
        ]}
      />
    </>
  )
}
