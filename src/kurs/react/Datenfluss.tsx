import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Datenfluss.code'

/**
 * KAPITEL 3.4 - State teilen & Datenfluss
 * "Thinking in React": Wo lebt der State, wie reden Komponenten miteinander?
 */
export function Datenfluss() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Der State liegt im Eltern-Element: Daten gehen per Prop nach unten, der Klick per Callback nach oben.</P>
        <TryIt
          id="react-datenfluss-einstieg"
          {...beispiele['react-datenfluss-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Daten fließen nach unten, Ereignisse nach oben">
        <P>
          Jede Komponente hat ihren <strong>eigenen</strong> State. Zwei Geschwister-Komponenten
          können nicht direkt auf den State der anderen zugreifen. Die Regel in React ist einfach:
        </P>
        <Liste>
          <li>
            <strong>Daten fließen nach unten</strong> - Eltern geben Werte als Props an Kinder.
          </li>
          <li>
            <strong>Ereignisse fließen nach oben</strong> - Eltern geben Funktionen als Props, die
            Kinder aufrufen, um etwas zu melden.
          </li>
        </Liste>
        <TryIt
          id="react-datenfluss-1"
          {...beispiele['react-datenfluss-1']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="State anheben (Lifting State Up)">
        <P>
          Brauchen mehrere Komponenten denselben Zustand, gehört er in ihren{' '}
          <strong>nächsten gemeinsamen Elternteil</strong>. Im Beispiel soll immer nur ein Abschnitt
          geöffnet sein. Solange jeder Abschnitt seinen eigenen <Code>isOpen</Code>-State hat, geht
          das nicht - die Abschnitte wissen nichts voneinander.
        </P>
        <TryIt
          id="react-datenfluss-2"
          {...beispiele['react-datenfluss-2']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Eine Quelle der Wahrheit">
        <P>
          Speichere jede Information nur <strong>einmal</strong>. Alles, was sich daraus berechnen
          lässt, berechnest du beim Rendern. Doppelter State läuft früher oder später auseinander.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Hinweis variante="tipp">
          Frage dich bei jedem State: <em>Ändert er sich über die Zeit? Kommt er nicht schon als
          Prop? Kann ich ihn aus anderem State berechnen?</em> Nur wenn die Antworten „ja, nein,
          nein“ lauten, ist es echter State.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Denken in React - ein Vorgehen">
        <ol className="max-w-3xl list-decimal space-y-1 pl-5 leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Oberfläche in Komponenten zerlegen</strong> - jede Komponente hat eine Aufgabe.
          </li>
          <li>
            <strong>Statische Version bauen</strong> - nur Props, noch kein State.
          </li>
          <li>
            <strong>Minimalen State finden</strong> - was ändert sich wirklich?
          </li>
          <li>
            <strong>Festlegen, wo der State lebt</strong> - beim nächsten gemeinsamen Elternteil
            aller Komponenten, die ihn brauchen.
          </li>
          <li>
            <strong>Datenfluss nach oben ergänzen</strong> - Callbacks an die Kinder geben.
          </li>
        </ol>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="react-datenfluss-uebung"
          {...beispiele['react-datenfluss-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Die Komponenten sind schon statisch gebaut (Schritt 2). Mach die Liste filterbar:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>SearchField</Code> und <Code>OnlyAvailable</Code> bekommen ihren Wert und einen
                  Callback als Props - sie haben <strong>keinen eigenen State</strong>.
                </li>
                <li>
                  Der State (Suchtext, Checkbox) lebt in <Code>App</Code>.
                </li>
                <li>
                  <Code>ProductList</Code> bekommt nur die bereits <em>gefilterten</em> Produkte.
                </li>
                <li>Die Suche ignoriert Groß-/Kleinschreibung.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Zwei Geschwister-Komponenten brauchen denselben Wert. Wo gehört der State hin?',
            antworten: [
              'In beide Komponenten',
              'In den nächsten gemeinsamen Elternteil',
              'In eine globale Variable',
            ],
            richtig: 1,
            erklaerung: 'Von dort kann er per Props an beide Kinder weitergegeben werden.',
          },
          {
            frage: 'Wie teilt ein Kind dem Elternteil mit, dass etwas passiert ist?',
            antworten: [
              'Es ändert die Props',
              'Es ruft eine Funktion auf, die es als Prop bekommen hat',
              'Es liest den State des Elternteils',
            ],
            richtig: 1,
            erklaerung: 'Callbacks als Props sind der Weg nach oben.',
          },
          {
            frage: 'Du hast den State „list“. Wie bekommst du „count“?',
            antworten: [
              'const [count, setCount] = useState(list.length)',
              'const count = list.length',
            ],
            richtig: 1,
            erklaerung: 'Abgeleitete Werte berechnet man beim Rendern - so können sie nie veralten.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Daten fließen per Props nach unten, Ereignisse per Callback-Props nach oben.',
          'Gemeinsam benötigter State wandert in den nächsten gemeinsamen Elternteil.',
          'Komponenten ohne eigenen State, die über Props gesteuert werden, heißen „controlled“.',
          'Eine Quelle der Wahrheit: Abgeleitetes berechnen statt doppelt speichern.',
        ]}
      />
    </>
  )
}
