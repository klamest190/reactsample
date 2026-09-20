import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Werkstatt } from '../../lernen/Werkstatt'
import { codeBloecke, dateien } from './BusinessApp.code'

const aufbau: [string, string][] = [
  ['App.tsx', 'Einstieg: Store, Layout und die Seite zum gewählten Menüpunkt'],
  ['store.tsx', 'Alle Daten: useReducer + Context + eigener Hook useStore'],
  ['data.ts', 'Das Datenmodell als Typen (Customer, Order, OrderStatus) und die Startdaten'],
  ['format.ts', 'Hilfsfunktionen ohne React: Geld- und Datumsformat'],
  ['hooks/', 'Eigene Hooks, die mehrere Komponenten nutzen können'],
  ['pages/', 'Eine Komponente pro Seite - sie holen sich ihre Daten aus dem Store'],
  ['components/', 'Wiederverwendbare Bausteine, die nur über Props gesteuert werden'],
]

/**
 * KAPITEL 4.12 - Eine komplette Business-App
 */
export function BusinessApp() {
  return (
    <>
      <Abschnitt titel="Eine echte App statt einzelner Schnipsel">
        <P>
          Bisher hast du jedes Konzept für sich ausprobiert. Hier siehst du, wie alles in einer richtigen
          Anwendung zusammenspielt: <strong>BrightDesk</strong>, eine kleine Kunden- und
          Auftragsverwaltung mit Dashboard, Kundentabelle und Auftragsliste.
        </P>
        <P>
          Die App besteht aus {dateien.length} Dateien in TypeScript, aufgeteilt wie in einem echten
          Projekt. Wähle links eine Datei aus und ändere sie - die laufende App darunter übernimmt deine
          Änderung nach einer kurzen Pause, und die Typprüfung meldet Fehler über alle Dateien hinweg
          (<Verweis id="praxis-typescript" />). Mit <strong>⛶ Vollbild</strong> liegen Dateien, Editor und
          App nebeneinander.
        </P>
        <Hinweis variante="tipp">
          Benutze die App erst einmal: Kunden suchen und sortieren, einen Kunden anklicken und bearbeiten,
          einen Auftrag anlegen, den Status ändern - und schau, wie sich das Dashboard mitverändert.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die Werkstatt">
        <Werkstatt id="praxis-business" titel="BrightDesk" dateien={dateien} einstieg="App.tsx" typen />
      </Abschnitt>

      <Abschnitt titel="So ist die App aufgebaut">
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Datei / Ordner</th>
                <th className="py-2">Aufgabe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {aufbau.map(([datei, aufgabe]) => (
                <tr key={datei}>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <Code>{datei}</Code>
                  </td>
                  <td className="py-2">{aufgabe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>Die Daten fließen immer im selben Kreis:</P>
        <Liste>
          <li>
            Eine Seite liest die Daten mit <Code>useStore()</Code> - dahinter steckt{' '}
            <Code>useContext</Code> (<Verweis id="hooks-usecontext" />).
          </li>
          <li>
            Ein Klick schickt eine Action, z. B. <Code>{"dispatch({ type: 'order/statusChanged', … })"}</Code>.
          </li>
          <li>
            Der Reducer in <Code>store.tsx</Code> baut daraus einen <strong>neuen</strong> State, ohne den
            alten zu verändern (<Verweis id="hooks-usereducer" />, <Verweis id="js-referenzen" />).
          </li>
          <li>
            Alle Komponenten, die diese Daten lesen, rendern neu. Kennzahlen wie der Umsatz werden dabei
            jedes Mal aus den Aufträgen <strong>abgeleitet</strong> statt gespeichert (
            <Verweis id="react-datenfluss" />).
          </li>
        </Liste>
        <P>
          Zu jeder Datei zeigt die Werkstatt über dem Editor, welche Kapitel die verwendeten Konzepte
          erklären.
        </P>
      </Abschnitt>

      <Abschnitt titel="Aufgaben zum Ausprobieren">
        <Liste>
          <li>
            <strong>Neuer Status:</strong> Füge in <Code>data.ts</Code> den Status{' '}
            <Code>'cancelled'</Code> zu <Code>ORDER_STATUSES</Code> hinzu. Filter, Auswahlliste und Etikett
            passen sich von selbst an - warum eigentlich?
          </li>
          <li>
            <strong>Neue Kennzahl:</strong> Ergänze in <Code>pages/Dashboard.tsx</Code> eine{' '}
            <Code>StatCard</Code> „Average order“ mit dem Durchschnittswert aller Aufträge.
          </li>
          <li>
            <strong>Neue Spalte:</strong> Zeige in <Code>pages/Customers.tsx</Code> die Anzahl der
            Aufträge pro Kunde - sortierbar, also als Eintrag in <Code>COLUMNS</Code>.
          </li>
          <li>
            <strong>Andere Formatierung:</strong> Stelle in <Code>format.ts</Code> auf{' '}
            <Code>'de-DE'</Code> um. Alle Beträge und Daten der App ändern sich - weil es nur diese eine
            Stelle gibt.
          </li>
          <li>
            <strong>Kunden löschen:</strong> Baue in <Code>store.tsx</Code> eine Action{' '}
            <Code>'customer/deleted'</Code> und im Kundendialog einen Knopf dafür. Überlege, was mit den
            Aufträgen dieses Kunden passieren soll.
          </li>
          <li>
            <strong>Neue Seite:</strong> Schreibe in <Code>App.tsx</Code> eine kleine Komponente{' '}
            <Code>Settings</Code>, trage sie in <Code>PAGES</Code> ein und ergänze den Menüpunkt in{' '}
            <Code>components/Layout.tsx</Code>.
          </li>
        </Liste>
        <Hinweis>
          Nach jeder Code-Änderung startet die App neu - angelegte Kunden oder geänderte Status sind dann
          wieder weg, deine Code-Änderungen aber nicht: Sie bleiben in deinem Browser gespeichert.{' '}
          <strong>↺ Alles zurücksetzen</strong> holt den Originalzustand zurück.
        </Hinweis>
        <Hinweis variante="tipp">
          Probier die Typen aus: Schreib in <Code>store.tsx</Code> eine Action falsch (z. B.{' '}
          <Code>'order/statusChangd'</Code>) - der <Code>never</Code>-Zweig im Reducer meldet sofort, dass ein
          Fall fehlt. Die App läuft trotzdem weiter, denn im Browser werden die Typen nur entfernt.
        </Hinweis>
        <Hinweis variante="warnung">
          Die Vorschau nutzt das Tailwind-CSS dieser Lernseite. Klassen, die nirgends im Kurs vorkommen,
          sind darin nicht enthalten (<Verweis id="praxis-tailwind" />). Wirkt eine neue Klasse nicht,
          nimm eine ähnliche aus der App oder <Code>{'style={{ … }}'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Vom Browser ins eigene Projekt">
        <P>
          Die Dateien sind genau so geschrieben wie in einem Vite-Projekt (<Verweis id="praxis-lokal" />).
          Leg ein Projekt an, kopiere die Dateien nach <Code>src/</Code> - es fehlt nur noch{' '}
          <Code>main.tsx</Code>, das die App in die Seite hängt:
        </P>
        <CodeBlock titel="Terminal" code={codeBloecke.anlegen} />
        <CodeBlock titel="src/main.tsx" code={codeBloecke.main} />
        <P>
          In <Code>index.css</Code> steht dann <Code>@import "tailwindcss";</Code> und die Farben{' '}
          <Code>brand-…</Code> als <Code>@theme</Code>, oder du ersetzt sie durch eine Tailwind-Farbe wie{' '}
          <Code>blue</Code>.
        </P>
      </Abschnitt>

      <Merke
        punkte={[
          'Echte Apps teilen sich in Seiten (pages), Bausteine (components), eigene Hooks und Module ohne React auf.',
          <>
            Globale Daten: <Code>useReducer</Code> + Context + ein eigener Hook wie <Code>useStore</Code>.
          </>,
          'Werte wie Summen und Zähler werden abgeleitet, nicht zusätzlich gespeichert.',
          'Kleine Komponenten, die nur Props bekommen, lassen sich überall wiederverwenden.',
          <>
            Mit <Code>import</Code>/<Code>export</Code> hängen die Dateien zusammen - der Bundler (hier ein
            Mini-Bundler im Browser) fügt sie zu einer App zusammen.
          </>,
          'Das Datenmodell steht an einer Stelle - alle anderen Dateien bekommen ihre Typen von dort.',
        ]}
      />
    </>
  )
}
