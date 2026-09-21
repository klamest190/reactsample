import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Routing.code'

/**
 * KAPITEL 5.7 - Routing mit React Router
 *
 * Die Editoren laden echtes React Router nach. Alle Beispiele nutzen MemoryRouter,
 * weil die Vorschau Teil dieser Seite ist und deren Adresse nicht ändern darf.
 */
export function Routing() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Zwei Seiten, zwei Links: <Code>{'<Routes>'}</Code> zeigt die <Code>{'<Route>'}</Code>, deren{' '}
          <Code>path</Code> zur aktuellen Adresse passt.
        </P>
        <TryIt id="praxis-routing-einstieg" {...beispiele['praxis-routing-einstieg']} modus="react" />
      </Abschnitt>

      <Abschnitt titel="Was ist Routing?">
        <P>
          Echte Apps haben mehrere Seiten - und jede Seite ihre eigene <strong>Adresse</strong>. Das bringt Dinge,
          die man von Webseiten erwartet: Links teilen, Lesezeichen setzen, mit „Zurück“ zur vorherigen Seite. Eine
          React-App lädt dabei aber nicht bei jedem Klick eine neue HTML-Seite vom Server (Single Page App). Der{' '}
          <strong>Router</strong> liest die Adresse und entscheidet, welche Komponenten gerendert werden.
        </P>
        <P>
          Im Kern ist das nichts Neues: Der aktuelle Pfad ist State, und daraus wird die Seite ausgewählt. So sieht
          das ohne Bibliothek aus:
        </P>
        <TryIt id="praxis-routing-idee" {...beispiele['praxis-routing-idee']} modus="react" />
        <P>
          Ein echter Router macht zusätzlich zwei Dinge: Er schreibt den Pfad mit{' '}
          <Code>history.pushState()</Code> in die Adresszeile, und er hört auf das Ereignis <Code>popstate</Code>,
          damit der Zurück-Knopf funktioniert. Diese Lern-App macht es mit dem Teil nach dem <Code>#</Code> - schau
          mal in die Adresszeile: <Code>#/praxis-routing</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="React Router einrichten">
        <P>
          Die verbreitetste Bibliothek dafür ist <strong>React Router</strong>. Im eigenen Projekt installierst du sie
          und legst einen <Code>BrowserRouter</Code> um die ganze App:
        </P>
        <CodeBlock titel="Terminal" code={codeBloecke.installieren} />
        <CodeBlock code={codeBloecke.einrichten} />
        <Hinweis variante="info">
          In den Editoren hier steht stattdessen <Code>MemoryRouter</Code>. Er merkt sich die Adresse nur im
          Speicher statt in der Adresszeile - sonst würde jeder Klick in der Vorschau die Lern-App selbst woanders
          hinschicken. Alles andere funktioniert genauso. Auch in automatischen Tests nimmt man{' '}
          <Code>MemoryRouter</Code>.
        </Hinweis>
        <Liste>
          <li>
            <Code>{'<Link to="/about">'}</Code> statt <Code>{'<a href>'}</Code>: Ein normales <Code>{'<a>'}</Code>{' '}
            lädt die ganze Seite neu - aller State wäre weg.
          </li>
          <li>
            <Code>{'<Route path="…" element={…} />'}</Code> ordnet einer Adresse eine Komponente zu.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Dynamische Segmente, aktive Links und 404">
        <P>
          Für Detailseiten schreibst du nicht eine Route pro Produkt, sondern eine mit <strong>Platzhalter</strong>:{' '}
          <Code>/products/:id</Code>. Die Komponente liest den Wert mit <Code>useParams()</Code>. Die Route{' '}
          <Code>path="*"</Code> fängt alles auf, was sonst nicht passt.
        </P>
        <TryIt id="praxis-routing-params" {...beispiele['praxis-routing-params']} modus="react" />
        <Liste>
          <li>
            <Code>NavLink</Code> ist ein <Code>Link</Code>, der weiß, ob er aktiv ist - ideal für Menüs. „Products“
            bleibt auch auf <Code>/products/mouse</Code> aktiv. <Code>end</Code> verhindert das, sonst wäre „Home“
            (<Code>/</Code>) immer aktiv.
          </li>
          <li>
            Fehlt der Datensatz zum Platzhalter (<Code>/products/tablet</Code>), ist das Sache der Detailseite - die
            Route passt ja.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Verschachtelte Routen und Layouts">
        <P>
          Menü, Kopfzeile und Rahmen sollen nicht auf jeder Seite neu geschrieben werden. Dafür verschachtelst du
          Routen: Die äußere Route rendert das <strong>Layout</strong>, und an der Stelle{' '}
          <Code>{'<Outlet />'}</Code> erscheint die passende innere Route. Eine <Code>index</Code>-Route ist die
          Standardseite eines Bereichs.
        </P>
        <TryIt id="praxis-routing-layout" {...beispiele['praxis-routing-layout']} modus="react" />
        <P>
          Das ist dasselbe Prinzip wie <Code>children</Code> aus <Verweis id="praxis-komposition" /> - nur entscheidet
          hier die Adresse, was eingesetzt wird. Beim Wechsel zwischen „Profile“ und „Security“ bleibt das Layout
          stehen, nur der innere Teil wird neu gerendert.
        </P>
      </Abschnitt>

      <Abschnitt titel="Navigieren per Code und Weiterleiten">
        <P>
          Nicht jede Navigation ist ein Klick auf einen Link. Nach dem Absenden eines Formulars springst du mit{' '}
          <Code>useNavigate()</Code> weiter. Soll eine Seite gar nicht erst angezeigt werden, gibst du{' '}
          <Code>{'<Navigate to="…" />'}</Code> zurück - eine Weiterleitung beim Rendern.
        </P>
        <TryIt id="praxis-routing-navigieren" {...beispiele['praxis-routing-navigieren']} modus="react" />
        <Liste>
          <li>
            <Code>replace</Code> ersetzt den aktuellen Eintrag im Verlauf, statt einen neuen anzulegen. Nach dem
            Login soll „Zurück“ nicht wieder beim Login-Formular landen.
          </li>
          <li>
            <Code>navigate(-1)</Code> ist der Zurück-Knopf per Code.
          </li>
        </Liste>
        <Hinweis variante="warnung">
          Eine Weiterleitung im Browser ist kein Schutz. Jeder kann den Code der App lesen. Geheime Daten schützt
          nur der Server, der sie ohne gültige Anmeldung gar nicht erst herausgibt.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="State in der URL: Suchparameter">
        <P>
          Filter, Suchbegriff, Sortierung, aktueller Tab - solcher State gehört oft in die Adresse (
          <Code>?q=re&amp;sort=year</Code>). Dann kann man die Ansicht teilen, als Lesezeichen speichern, und sie
          übersteht ein Neuladen. <Code>useSearchParams()</Code> funktioniert fast wie <Code>useState</Code>, nur
          liegt der Wert in der URL - eine Quelle der Wahrheit (<Verweis id="react-datenfluss" />).
        </P>
        <TryIt id="praxis-routing-suche" {...beispiele['praxis-routing-suche']} modus="react" />
        <P>
          Suchparameter sind immer Strings. Fehlt einer, liefert <Code>get()</Code> <Code>null</Code> - deshalb die
          Standardwerte mit <Code>??</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Daten laden mit Loadern">
        <P>
          In <Verweis id="praxis-daten" /> hast du Daten mit <Code>useEffect</Code> geladen: Die Seite rendert erst
          leer, dann kommt der Ladezustand, dann die Daten. React Router kann das umdrehen. Im{' '}
          <strong>Data Mode</strong> bekommt eine Route einen <Code>loader</Code>, der <em>vor</em> dem Rendern läuft.
          Die Komponente holt sich das Ergebnis mit <Code>useLoaderData()</Code> und muss sich um Laden und Fehler
          nicht mehr kümmern.
        </P>
        <TryIt id="praxis-routing-loader" {...beispiele['praxis-routing-loader']} modus="react" />
        <Liste>
          <li>
            Die Routen sind hier Objekte statt JSX und werden mit <Code>createMemoryRouter</Code> (im Projekt:{' '}
            <Code>createBrowserRouter</Code>) einmal außerhalb der Komponenten angelegt.
          </li>
          <li>
            <Code>useNavigation().state</Code> ist <Code>"loading"</Code>, solange ein Loader läuft - für eine
            globale Ladeanzeige.
          </li>
          <li>
            Wirft der Loader einen Fehler, rendert React Router das <Code>errorElement</Code> der Route - wie eine
            Error Boundary (<Verweis id="praxis-fehler" />).
          </li>
        </Liste>
        <CodeBlock titel="Im eigenen Projekt" code={codeBloecke.datenRouter} />
        <Hinweis variante="tipp">
          React Router hat drei Stufen: <strong>Declarative</strong> (<Code>{'<Routes>'}</Code>, wie oben),{' '}
          <strong>Data</strong> (Loader, Actions) und <strong>Framework</strong> (mit Vite-Plugin, Server-Rendering und
          Routen aus Dateien). Alternativen sind <strong>TanStack Router</strong> (sehr stark mit TypeScript) und{' '}
          <strong>Next.js</strong> als komplettes Framework.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="praxis-routing-uebung"
          {...beispiele['praxis-routing-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Mach aus dem Blog eine App mit Detailseiten:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Die Titel in der Liste werden zu Links auf <Code>/posts/&lt;slug&gt;</Code>.
                </li>
                <li>
                  Eine Route <Code>/posts/:slug</Code> zeigt Titel und Text des Beitrags (<Code>useParams</Code>) und
                  einen Link „← Back“ zur Liste.
                </li>
                <li>
                  Alle anderen Adressen zeigen eine Seite mit „404“ - probiere es mit „Broken link“.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Warum <Link> statt <a href> für Seiten innerhalb der App?',
            antworten: [
              'Link ist schneller gestylt',
              'Ein <a> lädt die ganze Seite neu - aller State geht verloren',
              'Mit <a> funktioniert der Zurück-Knopf nicht',
            ],
            richtig: 1,
            erklaerung: 'Link ändert nur die Adresse und lässt React die passende Route rendern.',
          },
          {
            frage: 'Wie liest eine Komponente das :id aus /products/:id?',
            antworten: ['props.id', 'useParams()', 'useLocation().id'],
            richtig: 1,
            erklaerung: 'useParams() liefert ein Objekt mit allen Platzhaltern der passenden Route.',
          },
          {
            frage: 'Wofür steht <Outlet /> in einer Layout-Route?',
            antworten: [
              'Für einen Link nach draußen',
              'Für die Stelle, an der die passende Unter-Route erscheint',
              'Für die 404-Seite',
            ],
            richtig: 1,
            erklaerung: 'Das Layout bleibt stehen, nur der Inhalt am Outlet wechselt mit der Adresse.',
          },
          {
            frage: 'Welcher State gehört typischerweise in die URL?',
            antworten: [
              'Der Text, den jemand gerade in ein Formular tippt',
              'Filter, Suche und Sortierung einer Liste',
              'Ob ein Tooltip offen ist',
            ],
            richtig: 1,
            erklaerung: 'Alles, was man teilen oder als Lesezeichen speichern möchte.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Routing: Die Adresse bestimmt, welche Komponenten gerendert werden - ohne Neuladen.',
          <>
            <Code>{'<Routes>'}</Code> + <Code>{'<Route path element>'}</Code>, Navigation mit{' '}
            <Code>{'<Link>'}</Code> bzw. <Code>{'<NavLink>'}</Code>.
          </>,
          <>
            Platzhalter <Code>:id</Code> + <Code>useParams()</Code>, Fallback mit <Code>path="*"</Code>.
          </>,
          <>
            Layouts mit verschachtelten Routen und <Code>{'<Outlet />'}</Code>, Weiterleiten mit{' '}
            <Code>useNavigate</Code> und <Code>{'<Navigate />'}</Code>.
          </>,
          <>
            Teilbarer State in die URL: <Code>useSearchParams()</Code>. Loader laden Daten vor dem Rendern.
          </>,
        ]}
      />
    </>
  )
}
