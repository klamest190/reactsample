import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Props.code'
import { BenutzerKarten } from '../demos/BenutzerKarten'

/**
 * KAPITEL 2.2 - Props, Listen & Bedingungen
 * Komponenten konfigurierbar machen und Daten in Oberflächen verwandeln.
 */
export function Props() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Props sind die Parameter einer Komponente - dieselbe Komponente, andere Daten.</P>
        <TryIt
          id="react-props-einstieg"
          {...beispiele['react-props-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Props: Parameter für Komponenten">
        <P>
          Props (kurz für <em>properties</em>) sind für Komponenten das, was Parameter für Funktionen
          sind. Du übergibst sie wie HTML-Attribute, und die Komponente bekommt sie als{' '}
          <strong>ein Objekt</strong>. Meist wird es direkt destrukturiert (<Verweis nr="1.5" />).
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Liste>
          <li>
            Strings in Anführungszeichen, <strong>alles andere in geschweiften Klammern</strong>:{' '}
            <Code>{'age={36}'}</Code>, <Code>{'active={false}'}</Code>,{' '}
            <Code>{'data={{ a: 1 }}'}</Code>.
          </li>
          <li>
            Ein Attribut ohne Wert (<Code>isAdmin</Code>) bedeutet <Code>true</Code>.
          </li>
          <li>Props dürfen alles sein: Zahlen, Objekte, Arrays, Funktionen, sogar JSX.</li>
        </Liste>
        <TryIt
          id="react-props-1"
          {...beispiele['react-props-1']}
          modus="react"
        />
        <Hinweis variante="warnung">
          Props sind <strong>schreibgeschützt</strong>. Eine Komponente darf ihre Props nie
          verändern - Daten fließen immer von oben (Eltern) nach unten (Kinder).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="children: Inhalt zwischen den Tags">
        <P>
          Alles, was du zwischen öffnendes und schließendes Tag schreibst, kommt als besondere Prop{' '}
          <Code>children</Code> an. So baust du Rahmen-Komponenten wie Karten, Dialoge oder Layouts.
        </P>
        <TryIt
          id="react-props-2"
          {...beispiele['react-props-2']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Listen rendern mit map und key">
        <P>
          Um eine Liste darzustellen, verwandelst du ein Array mit <Code>.map()</Code> in ein Array
          von JSX-Elementen. Jedes Element braucht eine <Code>key</Code>-Prop: einen{' '}
          <strong>stabilen, eindeutigen</strong> Wert, an dem React das Element beim nächsten Render
          wiedererkennt.
        </P>
        <BenutzerKarten />
        <P>
          Diese Demo ist in TypeScript geschrieben: <Code>src/kurs/demos/BenutzerKarten.tsx</Code>. Dort
          siehst du, wie man Props mit einem <Code>type</Code> beschreibt.
        </P>
        <TryIt
          id="react-props-3"
          {...beispiele['react-props-3']}
          modus="react"
        />
        <Hinweis variante="warnung">
          Den Array-Index als <Code>key</Code> nur nehmen, wenn sich die Liste nie umsortiert oder
          Elemente verliert. Sonst ordnet React State und Eingaben den falschen Zeilen zu. Und nie{' '}
          <Code>Math.random()</Code> - dann ist jeder Render eine „neue“ Liste.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Bedingtes Rendern">
        <P>
          Du kennst die Werkzeuge schon aus <Verweis nr="1.2" />. Zusätzlich darf eine Komponente{' '}
          <Code>null</Code> zurückgeben - dann rendert sie gar nichts.
        </P>
        <TryIt
          id="react-props-4"
          {...beispiele['react-props-4']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="react-props-uebung"
          {...beispiele['react-props-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Baue eine Kontaktliste:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Eine Komponente <Code>Contact</Code> mit den Props <Code>name</Code>,{' '}
                  <Code>email</Code> und <Code>favorite</Code>. Favoriten bekommen einen ⭐ vor dem
                  Namen.
                </li>
                <li>
                  <Code>App</Code> rendert <strong>alle</strong> Kontakte mit <Code>map</Code> und
                  passendem <Code>key</Code>.
                </li>
                <li>
                  Kontakte ohne E-Mail zeigen „no email“ in grauer Schrift.
                </li>
                <li>
                  Darüber steht „3 contacts, 1 of them favorite“ - aus den Daten <em>berechnet</em>.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Wie übergibst du die Zahl 5 als Prop?',
            antworten: ['count="5"', 'count={5}', 'count=5'],
            richtig: 1,
            erklaerung: 'count="5" wäre der String "5". Alles außer Strings kommt in { }.',
          },
          {
            frage: 'Was ist ein guter key für Listeneinträge aus einer Datenbank?',
            antworten: ['Der Array-Index', 'Math.random()', 'Die ID des Datensatzes'],
            richtig: 2,
            erklaerung: 'Die ID ist eindeutig und bleibt über Renders hinweg stabil.',
          },
          {
            frage: 'Wie kommt <Karte>Hallo</Karte> an den Text „Hallo“?',
            antworten: ['props.text', 'props.children', 'props.content'],
            richtig: 1,
            erklaerung: 'Inhalt zwischen den Tags landet immer in children.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Props sind ein Objekt - meist direkt im Parameter destrukturiert, gern mit Default-Werten.',
          'Props sind read-only: Daten fließen von oben nach unten.',
          <>
            <Code>children</Code> enthält den Inhalt zwischen den Tags.
          </>,
          <>
            Listen: <Code>{'data.map(d => <X key={d.id} … />)'}</Code> mit stabilem, eindeutigem key.
          </>,
          <>
            Bedingungen: <Code>&&</Code>, <Code>? :</Code> oder <Code>return null</Code>.
          </>,
        ]}
      />
    </>
  )
}
