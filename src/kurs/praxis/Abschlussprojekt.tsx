import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './Abschlussprojekt.code'

const schritte: [string, string, string][] = [
  ['1', 'Datenmodell & Reducer', 'Gewohnheiten als Array, Actions: hinzugefuegt, abgehakt, geloescht. Datum als "YYYY-MM-DD"-String.'],
  ['2', 'useLocalStorage', 'Eigener Hook, damit die Daten einen Reload überleben - kombiniert mit useReducer.'],
  ['3', 'Formular', 'Neue Gewohnheit anlegen; nach dem Hinzufügen per useRef wieder ins Feld fokussieren.'],
  ['4', 'Liste & Komponenten', 'Eine Zeile pro Gewohnheit mit Haken für heute und den letzten 7 Tagen.'],
  ['5', 'Abgeleitete Werte', 'Serie (Tage am Stück) und Tagesfortschritt berechnen - mit useMemo.'],
  ['6', 'Feinschliff', 'document.title zeigt „3/5 erledigt“ (useEffect), leerer Zustand, Löschen mit Rückfrage.'],
]

/**
 * KAPITEL 5.11 - Abschlussprojekt
 */
export function Abschlussprojekt() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Zum Abschluss baust du eine kleine, vollständige App und setzt fast alles aus diesem Kurs
          zusammen ein: Array-Methoden und Immutability aus Teil 1, Komponenten und Datenfluss aus Teil 3
          und die Hooks aus Teil 4. Nimm dir Zeit - und schau erst in die Musterlösung, wenn du
          festhängst.
        </P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Schritt</th>
                <th className="py-2">Was zu tun ist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {schritte.map(([nr, titel, text]) => (
                <tr key={nr}>
                  <td className="py-2 pr-4 tabular-nums">{nr}</td>
                  <td className="py-2 pr-4 font-medium whitespace-nowrap">{titel}</td>
                  <td className="py-2">{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Hinweis variante="tipp">
          Arbeite Schritt für Schritt und drücke nach jedem Schritt auf ▶ Ausführen. Dein Code wird
          automatisch gespeichert, du kannst also jederzeit eine Pause machen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="praxis-projekt"
          {...beispiele['praxis-projekt']}
          modus="react"
          titel="Gewohnheiten-Tracker"
          aufgabe={
            <>
              <p>
                <strong>Anforderungen</strong> - die Hilfsfunktionen für Datumswerte sind schon da:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>Gewohnheit über ein Eingabefeld und „Add“ anlegen (nicht leer, keine Duplikate - dann ist „Add“ deaktiviert) und per „🗑“ löschen (mit <Code>confirm</Code>).</li>
                <li>Für jede Gewohnheit eine Zeile mit 7 Knöpfen für die letzten 7 Tage (der letzte ist heute); ein Klick hakt den Tag ab oder wieder aus.</li>
                <li>Pro Gewohnheit die aktuelle <strong>Serie</strong>: wie viele Tage bis heute (oder gestern) am Stück erledigt, angezeigt als „🔥 n“.</li>
                <li>Oben: „Today: 2 of 3 done“ plus Fortschrittsbalken; derselbe Text im Tab-Titel.</li>
                <li>Alles überlebt einen Reload (localStorage). State-Logik in einem Reducer.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Abschnitt titel="Erweiterungen, wenn du noch Lust hast">
        <Liste>
          <li>
            <strong>Context:</strong> <Code>habits</Code> und <Code>dispatch</Code> per Context statt
            Props bereitstellen.
          </li>
          <li>
            <strong>Undo:</strong> Den Reducer um eine Historie erweitern (<Code>past</Code>,{' '}
            <Code>present</Code>) - dank Immutability fast geschenkt.
          </li>
          <li>
            <strong>Statistik:</strong> Eine Wochenübersicht mit Erfolgsquote pro Gewohnheit.
          </li>
          <li>
            <strong>Optimistisch speichern:</strong> Tu so, als ginge das Speichern an einen Server, und
            nutze <Code>useOptimistic</Code>.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Wie geht es weiter?">
        <P>Du kennst jetzt die Grundlagen von React. Sinnvolle nächste Schritte:</P>
        <Liste>
          <li>
            <strong>Eigenes Projekt aufsetzen:</strong> <Code>npm create vite@latest</Code> mit dem
            Template <Code>react-ts</Code> - so ist auch dieses Projekt entstanden. Schau dir den Code
            unter <Code>src/</Code> an: Er nutzt genau die Muster aus dem Kurs.
          </li>
          <li>
            <strong>TypeScript:</strong> Baue den Tracker noch einmal in TypeScript (<Verweis id="praxis-typescript" />) -
            typisierte Actions fangen viele Fehler ab, bevor sie passieren.
          </li>
          <li>
            <strong>Routing:</strong> Eine Statistik-Seite mit eigener Adresse (<Verweis id="praxis-routing" />).
          </li>
          <li>
            <strong>Daten:</strong> TanStack Query für Server-Daten mit Cache.
          </li>
          <li>
            <strong>Testen:</strong> Tests für den Reducer und die wichtigsten Abläufe (<Verweis id="praxis-testen" />).
          </li>
          <li>
            <strong>Frameworks:</strong> Next.js oder React Router (Framework-Modus) für Server-Rendering
            und Server Components.
          </li>
          <li>
            <strong>Dokumentation:</strong> <Code>react.dev</Code> ist ausgezeichnet - besonders die
            Abschnitte „Thinking in React“ und „You Might Not Need an Effect“.
          </li>
        </Liste>
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Womit fängst du bei einer App wie dem Tracker sinnvollerweise an?',
            antworten: [
              'Mit dem Layout und den Farben',
              'Mit dem Datenmodell und den Übergängen - also dem Reducer',
              'Mit den Komponenten, die Oberfläche ergibt sich daraus',
            ],
            richtig: 1,
            erklaerung:
              'Steht fest, wie die Daten aussehen und wie sie sich ändern, ist die Oberfläche nur noch eine Darstellung davon.',
          },
          {
            frage: 'Die Serie („🔥 4“) einer Gewohnheit - wo gehört sie hin?',
            antworten: [
              'Als eigener State, der beim Abhaken mitgepflegt wird',
              'In den Reducer als zusätzliches Feld jeder Gewohnheit',
              'Gar nicht in den State - sie wird aus den abgehakten Tagen berechnet',
            ],
            richtig: 2,
            erklaerung:
              'Was sich aus vorhandenem State ableiten lässt, gehört nicht in den State. Sonst können beide Werte auseinanderlaufen.',
          },
          {
            frage: 'Wofür ist ein eigener Hook wie useLocalStorage gut?',
            antworten: [
              'Er macht die App schneller',
              'Er kapselt wiederkehrende Mechanik, damit Komponenten sie nicht jedes Mal wiederholen',
              'Er ersetzt den Reducer',
            ],
            richtig: 1,
            erklaerung:
              'Eigene Hooks bündeln Logik mit State und Effekten an einer Stelle - die Komponente bleibt lesbar.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Erst das Datenmodell und die Übergänge (Reducer), dann die Oberfläche.',
          'State minimal halten - Serie, Fortschritt und Titel werden abgeleitet.',
          'Eigene Hooks kapseln wiederkehrende Mechanik wie localStorage.',
          'Kleine Komponenten mit klaren Props halten den Datenfluss nachvollziehbar.',
          '🎉 Glückwunsch - du hast den Lernpfad geschafft!',
        ]}
      />
    </>
  )
}
