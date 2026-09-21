import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './StateUndEvents.code'

/**
 * KAPITEL 3.3 - Events & State
 * Die Oberfläche wird interaktiv: Ereignisse behandeln, Zustand speichern, neu rendern.
 */
export function StateUndEvents() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Ein Klick ändert den State - und React zeichnet die Komponente neu.</P>
        <TryIt
          id="react-state-einstieg"
          {...beispiele['react-state-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Auf Events reagieren">
        <P>
          In React hängst du Event-Handler direkt als Prop an: <Code>onClick</Code>,{' '}
          <Code>onChange</Code>, <Code>onSubmit</Code>, <Code>onKeyDown</Code> … Du übergibst{' '}
          <strong>eine Funktion</strong> - React ruft sie beim Ereignis auf und reicht das
          Event-Objekt hinein.
        </P>
        <TryIt
          id="react-state-1"
          {...beispiele['react-state-1']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Warum eine normale Variable nicht reicht">
        <P>Probier aus, was hier passiert, wenn du auf den Knopf klickst:</P>
        <TryIt
          id="react-state-2"
          {...beispiele['react-state-2']}
          modus="react"
        />
        <P>Die Konsole zählt hoch, die Anzeige bleibt bei 0. Zwei Gründe:</P>
        <Liste>
          <li>
            <strong>React weiß nichts von der Änderung.</strong> Eine Variable zu ändern löst kein
            neues Rendern aus.
          </li>
          <li>
            <strong>Lokale Variablen überleben keinen Render.</strong> Rendert die Komponente neu,
            läuft die Funktion von vorn - und <Code>clicks</Code> ist wieder 0.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="useState">
        <P>
          <Code>useState</Code> löst beide Probleme. Es ist ein <strong>Hook</strong> - eine
          Funktion, mit der sich eine Komponente in React „einhakt“. Es gibt dir ein Paar zurück:
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="react-state-3"
          {...beispiele['react-state-3']}
          modus="react"
        />
        <Hinweis variante="info">
          Hooks erkennst du am <Code>use</Code> am Anfang. Sie dürfen nur{' '}
          <strong>direkt oben in einer Komponente</strong> aufgerufen werden - nicht in{' '}
          <Code>if</Code>, Schleifen oder verschachtelten Funktionen. Warum, erfährst du in Teil 4.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Rendern: was bei setState passiert">
        <P>Jede Zustandsänderung durchläuft drei Schritte:</P>
        <ol className="max-w-3xl list-decimal space-y-1 pl-5 leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Auslösen</strong> - du rufst <Code>setClicks(1)</Code> auf. React merkt sich den
            neuen Wert und plant einen Render.
          </li>
          <li>
            <strong>Rendern</strong> - React ruft deine Komponenten-Funktion <em>erneut</em> auf.
            Diesmal liefert <Code>useState</Code> den neuen Wert.
          </li>
          <li>
            <strong>Übernehmen (Commit)</strong> - React vergleicht das neue JSX mit dem alten und
            ändert nur die DOM-Stellen, die wirklich anders sind.
          </li>
        </ol>
        <P>
          Daraus folgt etwas Wichtiges: Innerhalb eines Renders ist State eine{' '}
          <strong>Momentaufnahme</strong> (Snapshot). Der Setter ändert nicht die Variable, sondern
          den Wert für den <em>nächsten</em> Render.
        </P>
        <TryIt
          id="react-state-4"
          {...beispiele['react-state-4']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="react-state-uebung"
          {...beispiele['react-state-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Baue eine Tweet-Box:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Ein <Code>{'<textarea>'}</Code>, dessen Inhalt im State liegt.
                </li>
                <li>
                  Darunter „<em>x</em> / 50 characters“. Über 50 Zeichen wird der Zähler rot (<Code>{"color: 'red'"}</Code>).
                </li>
                <li>
                  Ein Knopf „Send“, der <Code>disabled</Code> ist, wenn der Text leer oder zu lang
                  ist.
                </li>
                <li>
                  Beim Senden wird der Text geleert und ein Zähler „Sent: n“ erhöht.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was löst ein neues Rendern der Komponente aus?',
            antworten: [
              'Eine lokale Variable ändern',
              'Den Setter von useState mit einem neuen Wert aufrufen',
              'console.log aufrufen',
            ],
            richtig: 1,
            erklaerung: 'Nur State-Änderungen (und neue Props von oben) lösen einen Render aus.',
          },
          {
            frage: 'number ist 0. Was loggt: setNumber(number + 1); console.log(number) ?',
            antworten: ['0', '1', 'undefined'],
            richtig: 0,
            erklaerung: 'State ist innerhalb eines Renders ein Snapshot. Der neue Wert gilt erst im nächsten Render.',
          },
          {
            frage: 'Wann wird der Startwert von useState(0) verwendet?',
            antworten: ['Bei jedem Render', 'Nur beim allerersten Render', 'Bei jedem Klick'],
            richtig: 1,
            erklaerung: 'Danach merkt sich React den aktuellen Wert und ignoriert das Argument.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Event-Handler als Funktion übergeben: <Code>{'onClick={fn}'}</Code> oder{' '}
            <Code>{'onClick={() => fn(x)}'}</Code>.
          </>,
          'Normale Variablen lösen kein Rendern aus und überleben keinen Render.',
          <>
            <Code>const [value, setValue] = useState(initial)</Code> - Setter aufrufen → React rendert
            neu.
          </>,
          'Rendern = React ruft deine Funktion erneut auf; danach wird nur das Nötige im DOM geändert.',
          'State ist pro Render ein Snapshot.',
          'Werte, die sich aus State berechnen lassen, brauchen keinen eigenen State.',
        ]}
      />
    </>
  )
}
