import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Asynchron.code'

// Simulierte API, damit die Beispiele offline und ohne CORS-Probleme laufen.
/**
 * KAPITEL 1.7 - Asynchrones JavaScript
 * Daten laden, Timer, Promises & async/await - Grundlage für useEffect und Daten-Hooks.
 */
export function Asynchron() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Ein Timer läuft später - der restliche Code wartet nicht auf ihn.</P>
        <TryIt
          id="js-async-einstieg"
          {...beispiele['js-async-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Synchron und asynchron">
        <P>
          JavaScript arbeitet Code Zeile für Zeile ab - und zwar in <strong>nur einem Thread</strong>.
          Würde es auf eine Serverantwort warten, wäre die ganze Seite eingefroren. Deshalb werden
          langsame Dinge (Timer, Netzwerk) <strong>asynchron</strong> erledigt: Du hinterlegst, was{' '}
          <em>später</em> passieren soll, und der Rest läuft sofort weiter.
        </P>
        <TryIt
          id="js-async-1"
          {...beispiele['js-async-1']}
        />
      </Abschnitt>

      <Abschnitt titel="Promises">
        <P>
          Ein <strong>Promise</strong> ist ein Objekt für ein Ergebnis, das es <em>noch nicht</em>{' '}
          gibt. Es ist zunächst <Code>pending</Code> und wird später entweder{' '}
          <Code>fulfilled</Code> (mit Wert) oder <Code>rejected</Code> (mit Fehler). Mit{' '}
          <Code>.then()</Code> und <Code>.catch()</Code> reagierst du darauf.
        </P>
        <TryIt
          id="js-async-2"
          {...beispiele['js-async-2']}
        />
      </Abschnitt>

      <Abschnitt titel="async / await">
        <P>
          <Code>async</Code>/<Code>await</Code> ist dasselbe wie <Code>.then()</Code>, liest sich
          aber wie normaler, synchroner Code. <Code>await</Code> pausiert die{' '}
          <Code>async</Code>-Funktion, bis das Promise erfüllt ist. Fehler fängst du mit{' '}
          <Code>try/catch</Code>.
        </P>
        <Hinweis variante="info">
          In diesen Beispielen gibt es schon die Hilfsfunktionen <Code>wait(ms)</Code>,{' '}
          <Code>loadUser(id)</Code> und <Code>loadPosts(userId)</Code>. Sie simulieren einen
          Server mit 300 ms Verzögerung.
        </Hinweis>
        <TryIt
          id="js-async-3"
          {...beispiele['js-async-3']}
        />
        <Hinweis variante="tipp">
          <Code>await</Code> auf oberster Ebene funktioniert hier im Editor und in ES-Modulen. In
          normalen Funktionen muss die Funktion selbst <Code>async</Code> sein.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die Event Loop">
        <P>
          Warum kommt der Timer mit 0 ms trotzdem zuletzt? JavaScript hat einen <strong>Call Stack</strong>, auf dem der
          gerade laufende Code liegt. Erst wenn er leer ist, holt die <strong>Event Loop</strong> neue Arbeit: zuerst
          alle <strong>Microtasks</strong> (<Code>.then</Code>, alles nach einem <Code>await</Code>), dann die nächste{' '}
          <strong>Task</strong> (Timer, Klicks, Netzwerk-Antworten). Dazwischen darf der Browser neu zeichnen.
        </P>
        <CodeBlock code={codeBloecke.eventloop} />
        <TryIt id="js-async-eventloop" {...beispiele['js-async-eventloop']} />
        <Hinweis variante="info">
          Das erklärt, warum eine lange Schleife die ganze Seite einfriert: Solange sie läuft, kommt keine Task und kein
          Neuzeichnen dran. React kann langsame Updates deshalb in kleine Stücke teilen und dazwischen dem Browser Luft
          lassen (<Verweis id="hooks-nebenlaeufig" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="fetch - Daten vom Server">
        <P>
          <Code>fetch</Code> ist die eingebaute Funktion für HTTP-Anfragen und gibt ein Promise
          zurück. Zwei Stolperfallen muss man kennen:
        </P>
        <Liste>
          <li>
            <Code>fetch</Code> wirft bei <strong>404 oder 500 keinen Fehler</strong> - nur bei
            Netzwerkproblemen. Prüfe <Code>response.ok</Code> selbst.
          </li>
          <li>
            Der Body muss nochmal separat gelesen werden: <Code>await response.json()</Code>.
          </li>
        </Liste>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="js-async-4"
          {...beispiele['js-async-4']}
        />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="js-async-uebung"
          {...beispiele['js-async-uebung']}
          aufgabe={
            <>
              <p>
                Schreibe die <Code>async</Code>-Funktion <Code>loadNames(ids)</Code>. Sie bekommt ein
                Array von IDs und gibt ein Array der Namen zurück. Nutze <Code>loadUser</Code> und
                lade alle <strong>parallel</strong> mit <Code>Promise.all</Code>.
              </p>
              <p className="mt-1">
                Gibt es einen Nutzer nicht, soll <em>statt eines Fehlers</em> an dieser Stelle{' '}
                <Code>'unknown'</Code> stehen. (Tipp: <Code>.catch()</Code> an jedem einzelnen
                Promise.)
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: "In welcher Reihenfolge erscheint die Ausgabe? console.log('A'); setTimeout(() => console.log('B'), 0); console.log('C')",
            antworten: ['A B C', 'A C B', 'B A C'],
            richtig: 1,
            erklaerung: 'Der Timer-Callback läuft erst, wenn der aktuelle Code fertig ist - selbst bei 0 ms.',
          },
          {
            frage: 'fetch bekommt eine 404-Antwort. Was passiert?',
            antworten: [
              'Das Promise wird rejected',
              'Das Promise wird erfüllt, response.ok ist false',
              'fetch gibt null zurück',
            ],
            richtig: 1,
            erklaerung: 'Nur Netzwerkfehler führen zu reject. HTTP-Fehler musst du über response.ok prüfen.',
          },
          {
            frage: 'Wo darf await stehen?',
            antworten: ['Überall', 'In async-Funktionen (und auf Modul-Ebene)', 'Nur in .then()'],
            richtig: 1,
            erklaerung: 'await ist nur in async-Funktionen erlaubt - und auf oberster Ebene von ES-Modulen.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Asynchrone Callbacks laufen erst, wenn der aktuelle Code komplett fertig ist.',
          'Ein Promise ist ein zukünftiger Wert: pending → fulfilled oder rejected.',
          <>
            <Code>async/await</Code> + <Code>try/catch</Code> ist die lesbarste Form.
          </>,
          <>
            <Code>Promise.all</Code> lädt parallel.
          </>,
          <>
            <Code>fetch</Code>: <Code>response.ok</Code> prüfen und <Code>await response.json()</Code>.
          </>,
        ]}
      />
    </>
  )
}
