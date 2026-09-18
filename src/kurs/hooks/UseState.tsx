import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './UseState.code'
import { ZaehlerDemo } from '../demos/ZaehlerDemo'

const hookUebersicht: [string, string, string][] = [
  ['useState', 'Zustand speichern', '3.1'],
  ['useEffect', 'Mit der Außenwelt synchronisieren', '3.2'],
  ['useRef', 'Wert merken ohne Re-Render, DOM-Zugriff', '3.3'],
  ['useMemo / useCallback', 'Berechnungen und Funktionen zwischenspeichern', '3.4'],
  ['useReducer', 'Komplexen State mit Actions verwalten', '3.5'],
  ['useContext', 'Werte ohne Prop-Drilling teilen', '3.6'],
  ['eigene Hooks', 'Logik zwischen Komponenten wiederverwenden', '3.7'],
  ['useTransition / useDeferredValue', 'Dringende Updates zuerst', '3.8'],
  ['use / useActionState / useOptimistic', 'React-19-Hooks für Daten & Formulare', '3.9'],
  ['useId', 'Eindeutige IDs für Barrierefreiheit', '4.1'],
]

/**
 * KAPITEL 3.1 - Hooks-Überblick & useState im Detail
 */
export function UseState() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P><Code>useState</Code> liefert den aktuellen Wert und eine Funktion, um ihn zu ändern.</P>
        <TryIt
          id="hooks-usestate-einstieg"
          {...beispiele['hooks-usestate-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Was sind Hooks?">
        <P>
          Hooks sind Funktionen, mit denen sich Funktionskomponenten in React-Features „einhaken“:
          State, Lebenszyklus, Context und mehr. Sie beginnen immer mit <Code>use</Code>. In diesem
          Teil lernst du alle wichtigen Hooks - jeweils mit dem Problem, das sie lösen.
        </P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Hook</th>
                <th className="py-2 pr-4">Wofür?</th>
                <th className="py-2">Kapitel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {hookUebersicht.map(([hook, wofuer, kapitel]) => (
                <tr key={hook}>
                  <td className="py-2 pr-4">
                    <Code>{hook}</Code>
                  </td>
                  <td className="py-2 pr-4">{wofuer}</td>
                  <td className="py-2 tabular-nums">{kapitel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Abschnitt>

      <Abschnitt titel="Die Regeln der Hooks - und warum es sie gibt">
        <Liste>
          <li>
            Hooks nur <strong>auf oberster Ebene</strong> aufrufen - nicht in <Code>if</Code>,
            Schleifen, verschachtelten Funktionen oder nach einem frühen <Code>return</Code>.
          </li>
          <li>
            Hooks nur in <strong>React-Komponenten</strong> oder <strong>eigenen Hooks</strong>{' '}
            aufrufen.
          </li>
        </Liste>
        <P>
          Der Grund: <Code>useState(0)</Code> hat keinen Namen. React merkt sich den State aller
          Hooks einer Komponente in einer Liste und ordnet sie über die{' '}
          <strong>Aufruf-Reihenfolge</strong> zu. Das kannst du in reinem JavaScript nachbauen:
        </P>
        <TryIt
          id="hooks-usestate-regeln"
          {...beispiele['hooks-usestate-regeln']}
        />
      </Abschnitt>

      <Abschnitt titel="Funktionale Updates">
        <P>
          Hängt der neue Wert vom alten ab, übergib dem Setter eine <strong>Funktion</strong>. React
          ruft sie mit dem jeweils aktuellsten Wert auf. Das ist wichtig, wenn du mehrmals
          hintereinander setzt oder aus einem Timer/Callback heraus, dessen Closure veraltet ist.
        </P>
        <ZaehlerDemo />
        <TryIt
          id="hooks-usestate-funktional"
          {...beispiele['hooks-usestate-funktional']}
          modus="react"
        />
        <Hinweis variante="warnung">
          Das Intervall oben wird nie gestoppt. Wie man Timer sauber aufräumt, lernst du im nächsten
          Kapitel mit <Code>useEffect</Code>. Hier setzt „Ausführen“ die Vorschau zurück.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Objekte und Arrays im State">
        <P>
          Hier zahlt sich <Verweis nr="1.6" /> aus: State wird nie verändert, sondern{' '}
          <strong>ersetzt</strong>. Anders als früher bei Klassenkomponenten fügt der Setter nichts
          zusammen - du musst die übrigen Felder selbst mit Spread übernehmen.
        </P>
        <TryIt
          id="hooks-usestate-objekte"
          {...beispiele['hooks-usestate-objekte']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Lazy Initializer">
        <P>
          Das Argument von <Code>useState(x)</Code> wird zwar nur beim ersten Render benutzt, aber{' '}
          <strong>bei jedem Render ausgewertet</strong>. Ist der Startwert teuer (z. B.{' '}
          <Code>localStorage</Code> lesen), übergib eine Funktion - React ruft sie nur einmal auf.
        </P>
        <TryIt
          id="hooks-usestate-lazy"
          {...beispiele['hooks-usestate-lazy']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="State zurücksetzen mit key">
        <P>
          State hängt an der <strong>Position</strong> einer Komponente im Baum. Rendert an derselben
          Stelle dieselbe Komponente, bleibt ihr State erhalten - auch mit anderen Props. Ändert sich
          aber der <Code>key</Code>, baut React sie komplett neu auf.
        </P>
        <TryIt
          id="hooks-usestate-key"
          {...beispiele['hooks-usestate-key']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="hooks-usestate-uebung"
          {...beispiele['hooks-usestate-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Baue eine Einkaufsliste. Alle Updates als funktionale Updates und ohne Mutation:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>Artikel über ein Eingabefeld und den Knopf „Add“ hinzufügen - als Listeneintrag „1× Name“.</li>
                <li>
                  Pro Artikel Knöpfe <strong>−</strong> und <strong>+</strong> für die Menge. Fällt die
                  Menge auf 0, verschwindet der Artikel.
                </li>
                <li>Unten „Total: n items“ mit der Summe aller Mengen (abgeleitet!).</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Warum dürfen Hooks nicht in einem if stehen?',
            antworten: [
              'Aus Performance-Gründen',
              'React ordnet Hooks über ihre Aufruf-Reihenfolge zu',
              'Weil if in Komponenten verboten ist',
            ],
            richtig: 1,
            erklaerung: 'Fällt ein Aufruf weg, verrutscht die Zuordnung aller folgenden Hooks.',
          },
          {
            frage: 'count ist 0. Was steht nach zweimal setCount(c => c + 1) im nächsten Render?',
            antworten: ['1', '2', '0'],
            richtig: 1,
            erklaerung: 'Funktionale Updates werden nacheinander auf den jeweils neuesten Wert angewendet.',
          },
          {
            frage: 'Was macht setProfile({ name: "Grace" }) mit den anderen Feldern von profile?',
            antworten: ['Behält sie', 'Entfernt sie - der State wird komplett ersetzt'],
            richtig: 1,
            erklaerung: 'useState ersetzt den Wert. Deshalb { ...prev, name: "Grace" }.',
          },
          {
            frage: 'Wie setzt du den State einer Kind-Komponente komplett zurück?',
            antworten: ['Mit einem neuen key', 'Mit useState(null)', 'Gar nicht'],
            richtig: 0,
            erklaerung: 'Ein anderer key lässt React die Komponente neu erzeugen - mit frischem State.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Hooks nur auf oberster Ebene - React ordnet sie über die Reihenfolge zu.',
          <>
            Neuer Wert hängt vom alten ab → <Code>{'setX(prev => …)'}</Code>.
          </>,
          <>
            Objekte/Arrays ersetzen, nicht mutieren: <Code>{'{ ...prev, field }'}</Code>,{' '}
            <Code>[...prev, x]</Code>.
          </>,
          <>
            Teurer Startwert → <Code>{'useState(() => compute())'}</Code>.
          </>,
          <>
            Neuer <Code>key</Code> = frischer State.
          </>,
        ]}
      />
    </>
  )
}
