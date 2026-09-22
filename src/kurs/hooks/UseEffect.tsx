import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './UseEffect.code'
import { TitelUndFenster } from '../demos/TitelUndFenster'

/**
 * KAPITEL 4.2 - useEffect
 */
export function UseEffect() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P><Code>useEffect</Code> läuft nach dem Rendern - hier jedes Mal, wenn sich <Code>count</Code> ändert.</P>
        <TryIt
          id="hooks-useeffect-einstieg"
          {...beispiele['hooks-useeffect-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Wofür Effekte da sind">
        <P>
          Eine Komponente soll beim Rendern nur JSX berechnen - ohne Nebenwirkungen. Manchmal muss
          sie sich aber mit etwas <strong>außerhalb von React</strong> abstimmen: einen Timer
          starten, ein Browser-Event abonnieren, <Code>document.title</Code> setzen, eine
          Verbindung öffnen. Dafür gibt es <Code>useEffect</Code>. Der Effekt läuft{' '}
          <strong>nach</strong> dem Rendern, wenn das DOM schon aktualisiert ist.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="Das Dependency-Array">
        <P>Das zweite Argument entscheidet, wann der Effekt erneut läuft:</P>
        <Tabelle
          spalten={['font-mono']}
          zeilen={[
            ['[]', 'Nur nach dem ersten Render. Cleanup beim Entfernen der Komponente.'],
            [
              '[a, b]',
              <>
                Nach dem ersten Render und immer, wenn sich <Code>a</Code> oder <Code>b</Code> geändert
                hat (Vergleich mit <Code>Object.is</Code>).
              </>,
            ],
            ['weggelassen', 'Nach jedem Render - selten gewollt.'],
          ]}
        />
        <TryIt
          id="hooks-useeffect-deps"
          {...beispiele['hooks-useeffect-deps']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Aufräumen mit Cleanup">
        <P>
          Die Funktion, die dein Effekt zurückgibt, ruft React auf, <strong>bevor</strong> der
          Effekt erneut läuft und wenn die Komponente verschwindet. Ohne sie laufen Timer weiter und
          Event-Listener sammeln sich an (Speicherleck).
        </P>
        <TryIt
          id="hooks-useeffect-cleanup"
          {...beispiele['hooks-useeffect-cleanup']}
          modus="react"
        />
        <TitelUndFenster />
        <Hinweis variante="info">
          Im <Code>StrictMode</Code> (siehe <Code>src/main.tsx</Code>) führt React in der Entwicklung
          jeden Effekt <strong>einmal extra</strong> aus: Effekt → Cleanup → Effekt. Fehlt dein
          Cleanup, fällt das so sofort auf. Im Produktivbuild passiert das nicht. (Die Vorschau in
          den Editoren läuft ohne StrictMode.)
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Veraltete Werte: Dependencies ehrlich angeben">
        <P>
          Ein Effekt ist eine Closure über die Props und den State <em>seines</em> Renders. Fehlt ein
          verwendeter Wert im Dependency-Array, läuft der Effekt mit einem veralteten Wert weiter.
          Die Regel: <strong>Alles, was der Effekt aus der Komponente liest, gehört ins Array.</strong>{' '}
          Der Linter <Code>react-hooks/exhaustive-deps</Code> prüft das automatisch.
        </P>
        <TryIt
          id="hooks-useeffect-stale"
          {...beispiele['hooks-useeffect-stale']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Du brauchst oft gar keinen Effekt">
        <P>
          Effekte sind ein „Notausgang“ aus React. Zwei typische Fälle, in denen sie{' '}
          <strong>falsch</strong> sind:
        </P>
        <Liste>
          <li>
            <strong>Werte aus Props/State berechnen</strong> → direkt beim Rendern berechnen (ggf.
            mit <Code>useMemo</Code>).
          </li>
          <li>
            <strong>Auf eine Benutzeraktion reagieren</strong> → in den Event-Handler, nicht in einen
            Effekt, der auf die Folge-Änderung wartet.
          </li>
        </Liste>
        <CodeBlock
          code={codeBloecke.beispiel2}
        />
        <Hinweis variante="tipp">
          Faustregel: <em>„Warum soll dieser Code laufen?“</em> Weil die Komponente{' '}
          <strong>angezeigt</strong> wird → Effekt. Weil der Benutzer etwas{' '}
          <strong>getan</strong> hat → Event-Handler. Weil sich ein Wert aus anderen{' '}
          <strong>ergibt</strong> → beim Rendern berechnen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="hooks-useeffect-uebung"
          {...beispiele['hooks-useeffect-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Baue einen Pomodoro-Countdown:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>Startet bei 10 Sekunden, angezeigt in der <Code>{'<h1>'}</Code> als „0:10“. Knöpfe: „Start“/„Pause“ und „Reset“.</li>
                <li>
                  Ein Effekt mit Intervall zählt jede Sekunde herunter - <strong>nur solange er
                  läuft</strong>. Cleanup nicht vergessen!
                </li>
                <li>Bei 0 stoppt er automatisch und zeigt „⏰ Take a break!“.</li>
                <li>
                  Zweiter Effekt: <Code>document.title</Code> zeigt die Restzeit, im selben Format wie die Anzeige, z. B. „0:07“.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Wann läuft ein Effekt mit leerem Dependency-Array []?',
            antworten: ['Vor dem ersten Render', 'Nach dem ersten Render', 'Nach jedem Render'],
            richtig: 1,
            erklaerung: 'Effekte laufen immer nach dem Rendern. Mit [] nur nach dem ersten.',
          },
          {
            frage: 'Wann ruft React die Cleanup-Funktion auf?',
            antworten: [
              'Nur beim Entfernen der Komponente',
              'Vor jedem erneuten Effekt-Lauf und beim Entfernen',
              'Nach jedem Render',
            ],
            richtig: 1,
            erklaerung: 'So wird der alte Effekt immer abgeräumt, bevor der neue startet.',
          },
          {
            frage: 'Du willst filteredList aus list und search erzeugen. Was ist richtig?',
            antworten: [
              'useEffect + setFilteredList',
              'Beim Rendern berechnen (ggf. useMemo)',
              'useRef',
            ],
            richtig: 1,
            erklaerung: 'Abgeleitete Werte brauchen weder Effekt noch State.',
          },
          {
            frage: 'Warum läuft ein Effekt in der Entwicklung zweimal?',
            antworten: [
              'Ein Bug in React',
              'StrictMode prüft absichtlich, ob der Cleanup korrekt ist',
              'Weil die Dependencies fehlen',
            ],
            richtig: 1,
            erklaerung: 'Nur in der Entwicklung und nur im StrictMode.',
          },
        ]}
      />

      <Merke
        punkte={[
          'useEffect synchronisiert mit Systemen außerhalb von React und läuft nach dem Rendern.',
          <>
            Dependencies: <Code>[]</Code> einmal, <Code>[a]</Code> bei Änderung von a, ohne Array nach
            jedem Render.
          </>,
          'Alles, was der Effekt aus der Komponente liest, gehört ins Dependency-Array.',
          'Cleanup räumt Timer, Listener und Verbindungen ab - vor dem nächsten Lauf und beim Entfernen.',
          'Berechnungen und Reaktionen auf Klicks gehören nicht in einen Effekt.',
        ]}
      />
    </>
  )
}
