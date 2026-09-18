import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './Komposition.code'
import { KompositionsDemo } from '../demos/KompositionsDemo'

/**
 * KAPITEL 4.3 - Komposition
 */
export function Komposition() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Über <Code>children</Code> steckt man beliebigen Inhalt in eine Komponente.</P>
        <TryIt
          id="praxis-komposition-einstieg"
          {...beispiele['praxis-komposition-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Zusammensetzen statt konfigurieren">
        <P>
          React kennt keine Vererbung zwischen Komponenten. Wiederverwendung entsteht durch{' '}
          <strong>Zusammensetzen</strong>. Ein Warnsignal ist eine Komponente mit immer mehr
          Boolean-Props (<Code>showIcon</Code>, <Code>withBorder</Code>, <Code>compact</Code> …). Oft ist
          es besser, Inhalt als JSX hineinzureichen.
        </P>
        <Liste>
          <li>
            <strong>children</strong> - „hier kommt beliebiger Inhalt rein“
          </li>
          <li>
            <strong>Slot-Props</strong> - mehrere benannte Stellen für JSX (<Code>header</Code>,{' '}
            <Code>footer</Code>, <Code>actions</Code>)
          </li>
          <li>
            <strong>Render-Props</strong> - das Kind bekommt Daten und entscheidet selbst über die
            Darstellung (heute meist durch eigene Hooks ersetzt)
          </li>
          <li>
            <strong>Portale</strong> - rendern an einer anderen Stelle im DOM, bleiben aber im React-Baum
          </li>
        </Liste>
        <KompositionsDemo />
      </Abschnitt>

      <Abschnitt titel="Slots statt Props-Wüste">
        <TryIt
          id="praxis-komposition-slots"
          {...beispiele['praxis-komposition-slots']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="children schützt vor unnötigen Renders">
        <P>
          Ein angenehmer Nebeneffekt: JSX, das als <Code>children</Code> hereinkommt, wurde schon vom{' '}
          <em>Elternteil</em> erzeugt. Ändert sich nur der State der Rahmen-Komponente, rendern die
          children <strong>nicht</strong> mit - ganz ohne <Code>memo</Code>.
        </P>
        <TryIt
          id="praxis-komposition-children-perf"
          {...beispiele['praxis-komposition-children-perf']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Portale">
        <P>
          Dialoge, Tooltips und Toasts müssen über allem liegen. Stecken sie tief in einem Container
          mit <Code>overflow: hidden</Code> oder eigenem <Code>z-index</Code>, werden sie abgeschnitten.{' '}
          <Code>createPortal(jsx, domNode)</Code> rendert sie direkt an einer anderen Stelle im DOM -
          State, Context und Events funktionieren aber weiter wie gewohnt.
        </P>
        <TryIt
          id="praxis-komposition-portal"
          {...beispiele['praxis-komposition-portal']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="praxis-komposition-uebung"
          {...beispiele['praxis-komposition-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Baue eine wiederverwendbare <Code>Tabs</Code>-Komponente. Sie bekommt eine Prop{' '}
                <Code>{'tabs = [{ title, content }]'}</Code>, wobei <Code>content</Code> beliebiges JSX ist:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>Oben die Titel als Knöpfe, der aktive ist fett.</li>
                <li>Darunter nur der Inhalt des aktiven Tabs.</li>
                <li>
                  Optionaler Slot <Code>extra</Code>, der rechts neben den Knöpfen erscheint.
                </li>
                <li>Benutze sie in App zweimal mit völlig unterschiedlichem Inhalt.</li>
              </ul>
            </>
          }
        />
        <Hinweis variante="tipp">
          Wenn eine Komponente mehr als zwei, drei Slots braucht, lohnt sich oft das Muster{' '}
          <strong>Compound Components</strong>: <Code>{'<Tabs><Tabs.List>…</Tabs.List><Tabs.Panel>…</Tabs.Panel></Tabs>'}</Code>{' '}
          - die Teile teilen sich den State über einen Context.
        </Hinweis>
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Eine Komponente hat schon 8 Boolean-Props für kleine Varianten. Was hilft meistens?',
            antworten: ['Noch mehr Props', 'Inhalt per children oder Slot-Props hineinreichen', 'Eine Klasse erben'],
            richtig: 1,
            erklaerung: 'Komposition hält die Komponente klein und den Aufrufer flexibel.',
          },
          {
            frage: 'Wohin sprudelt ein Klick-Event in einem Portal?',
            antworten: ['Durch den DOM-Baum (zu body)', 'Durch den React-Baum (zur Komponente, die das Portal rendert)'],
            richtig: 1,
            erklaerung: 'Für React bleibt das Portal ein Kind seiner Eltern-Komponente.',
          },
          {
            frage: 'Warum rendert <Teuer /> als children nicht neu, wenn der Rahmen seinen State ändert?',
            antworten: [
              'Weil children immer memoisiert sind',
              'Weil das JSX vom Elternteil erzeugt wurde und sich dort nichts geändert hat',
              'Das stimmt nicht, es rendert immer neu',
            ],
            richtig: 1,
            erklaerung: 'Die children-Prop ist dasselbe Objekt wie vorher - React kann den Teilbaum überspringen.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>children</Code> und Slot-Props statt immer neuer Konfigurations-Props.
          </>,
          'children-Inhalt rendert nicht mit, wenn nur der Rahmen seinen State ändert.',
          'Render-Props trennen Logik und Darstellung - heute meist als eigener Hook gelöst.',
          <>
            <Code>createPortal</Code> für Dialoge, Toasts und Tooltips über allem.
          </>,
        ]}
      />
    </>
  )
}
