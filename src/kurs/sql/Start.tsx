import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { SchemaDiagram } from '../demos/SqlDiagrams'
import { beispiele, codeBloecke } from './Start.code'

/**
 * KAPITEL 9.1 - Tabellen & SELECT
 * Relationale Datenbanken, die Beispieldatenbank und die ersten Abfragen - auf echtem PostgreSQL.
 */
export function Start() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Unten läuft ein echtes <strong>PostgreSQL</strong> - dieselbe Datenbank wie auf einem
          Server, nur als WebAssembly im Browser. Darin liegt ein kleiner Online-Shop mit Kunden,
          Produkten und Bestellungen. Ändere die Abfrage und drück <Code>Strg+Enter</Code>: Jeder
          Lauf startet mit frischen Tabellen, du kannst also nichts kaputt machen.
        </P>
        <TryIt modus="sql" id="sql-start-einstieg" {...beispiele['sql-start-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Warum eine Datenbank?">
        <P>
          In der Business-App (<Verweis id="praxis-business" />) lagen die Kunden in einem
          JavaScript-Array - nach dem Neuladen war jede Änderung weg. Ein Backend braucht einen Ort,
          an dem Daten <strong>dauerhaft</strong> liegen, an dem viele Benutzer <strong>gleichzeitig</strong>{' '}
          lesen und schreiben können und der auf <strong>Regeln</strong> achtet („jede Bestellung
          gehört zu einem Kunden“). Das ist eine Datenbank.
        </P>
        <P>
          Eine <strong>relationale</strong> Datenbank speichert Daten in <strong>Tabellen</strong>:
          Jede <strong>Zeile</strong> ist ein Datensatz (ein Kunde), jede <strong>Spalte</strong> eine
          Eigenschaft mit festem Typ (<Code>name</Code> ist Text, <Code>joined</Code> ein Datum). Das
          sieht aus wie eine Tabellenkalkulation, ist aber viel strenger - und genau das macht es
          zuverlässig.
        </P>
        <P>
          Gesprochen wird mit ihr in <strong>SQL</strong> (Structured Query Language). SQL ist{' '}
          <strong>deklarativ</strong>, wie React: Du beschreibst, <em>welches</em> Ergebnis du willst,
          nicht <em>wie</em> die Datenbank es findet. Keine Schleife, kein <Code>filter</Code> - die
          Datenbank sucht sich selbst den schnellsten Weg.
        </P>
        <Hinweis variante="info">
          <strong>PostgreSQL</strong> („Postgres“) ist eine freie, sehr verbreitete Datenbank. Die
          Grundlagen dieses Teils gelten fast wörtlich auch für MySQL, SQL Server oder SQLite - wo
          Postgres eigene Wege geht, steht es dabei.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die Beispieldatenbank">
        <SchemaDiagram />
        <P>
          Vier Tabellen, die zusammenhängen: Ein Kunde hat viele Bestellungen, eine Bestellung hat
          viele Positionen, jede Position verweist auf ein Produkt. Die Verbindung läuft über
          Schlüssel:
        </P>
        <Liste>
          <li>
            Der <strong>Primärschlüssel</strong> (<Code>id</Code>, unterstrichen) macht jede Zeile
            eindeutig. Zwei Kunden dürfen gleich heißen, aber nie dieselbe id haben.
          </li>
          <li>
            Ein <strong>Fremdschlüssel</strong> wie <Code>orders.customer_id</Code> verweist auf den
            Primärschlüssel einer anderen Tabelle. Die Datenbank sorgt dafür, dass es den Kunden
            wirklich gibt.
          </li>
        </Liste>
        <P>
          Über jedem SQL-Editor kannst du die Tabellen aufklappen. Noch schneller geht es mit den{' '}
          <strong>Meta-Befehlen</strong> von <Code>psql</Code>, dem Kommandozeilen-Werkzeug von
          PostgreSQL. Sie beginnen mit einem Backslash:
        </P>
        <TryIt modus="sql" id="sql-start-erkunden" {...beispiele['sql-start-erkunden']} />
        <P>
          <Code>\d products</Code> zeigt die Spalten mit Typ, ob sie Pflicht sind (<Code>not null</Code>)
          und darunter die Regeln der Tabelle: Primärschlüssel, Prüfungen (<Code>CHECK</Code>),
          Fremdschlüssel. Wie man solche Tabellen selbst anlegt, kommt in <Verweis id="sql-tabellen" />.
        </P>
      </Abschnitt>

      <Abschnitt titel="SELECT: Spalten auswählen">
        <P>Jede Abfrage hat dieselbe Grundform - die Teile stehen immer in dieser Reihenfolge:</P>
        <CodeBlock code={codeBloecke.syntax} titel="SQL" />
        <P>
          Hinter <Code>SELECT</Code> stehen nicht nur Spalten, sondern beliebige{' '}
          <strong>Ausdrücke</strong>: Rechnungen, Texte, Funktionen. Mit <Code>AS</Code> bekommt eine
          Ergebnisspalte einen Namen. <Code>||</Code> hängt Texte aneinander.
        </P>
        <TryIt modus="sql" id="sql-start-select" {...beispiele['sql-start-select']} />
        <Hinweis variante="warnung">
          <Code>SELECT *</Code> ist zum Erkunden praktisch. In einer Anwendung nennt man die Spalten
          einzeln: Kommt später eine Spalte dazu, ändert sich sonst still das Ergebnis - und es wird
          mehr übertragen als nötig.
        </Hinweis>
        <P>Ein paar Regeln, über die fast jeder am Anfang stolpert:</P>
        <CodeBlock code={codeBloecke.regeln} titel="SQL" />
        <Liste>
          <li>
            <strong>Einfache</strong> Anführungszeichen für Text: <Code>'UK'</Code>. Doppelte sind für
            Namen von Spalten und Tabellen - <Code>"UK"</Code> wäre eine Spalte namens UK.
          </li>
          <li>
            Schlüsselwörter schreibt man üblicherweise groß, Tabellen und Spalten klein mit Unterstrich
            (<Code>order_items</Code>). Nötig ist das nicht, aber es liest sich besser.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Sortieren und begrenzen">
        <P>
          Ohne <Code>ORDER BY</Code> hat ein Ergebnis <strong>keine garantierte Reihenfolge</strong>.
          Oft kommen die Zeilen in Einfügereihenfolge - bis die Tabelle wächst oder sich etwas ändert.
          Brauchst du eine Reihenfolge, schreib sie hin.
        </P>
        <TryIt modus="sql" id="sql-start-sortieren" {...beispiele['sql-start-sortieren']} />
        <Liste>
          <li>
            <Code>ORDER BY price DESC, name</Code>: erst nach Preis absteigend, bei gleichem Preis nach
            Name aufsteigend (<Code>ASC</Code> ist der Standard).
          </li>
          <li>
            <Code>LIMIT 5</Code> liefert höchstens fünf Zeilen, <Code>OFFSET 10</Code> überspringt die
            ersten zehn - so blättert man seitenweise.
          </li>
          <li>
            <Code>DISTINCT</Code> entfernt doppelte Zeilen aus dem Ergebnis.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="PostgreSQL auf deinem Rechner">
        <P>
          Hier läuft PostgreSQL im Browser. Auf deinem Rechner startest du es am einfachsten mit
          Docker (<Verweis id="docker-start" />) und öffnest darin <Code>psql</Code>:
        </P>
        <CodeBlock code={codeBloecke.docker} titel="Terminal" />
        <CodeBlock code={codeBloecke.psql} titel="psql" />
        <P>
          Wer lieber klickt: <strong>pgAdmin</strong>, <strong>DBeaver</strong> oder die
          PostgreSQL-Erweiterung für VS Code zeigen Tabellen und Ergebnisse grafisch. Die Abfragen
          sind dieselben. Spring Boot verbindet sich mit genau so einer Datenbank - dort schreibt JPA
          das SQL für dich (<Verweis id="spring-daten" />). Wer es lesen kann, versteht auch, was JPA
          tut.
        </P>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="sql"
          id="sql-start-uebung"
          {...beispiele['sql-start-uebung']}
          aufgabe={
            <p>
              Für die Startseite des Shops: Zeige die <strong>fünf teuersten Produkte</strong> - nur{' '}
              <Code>name</Code> und <Code>price</Code>, das teuerste zuerst.
            </p>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was macht eine Zeile in einer Tabelle eindeutig?',
            antworten: ['Ihre Position in der Tabelle', 'Der Primärschlüssel', 'Die erste Textspalte', 'Die Reihenfolge beim Einfügen'],
            richtig: 1,
            erklaerung: 'Der Primärschlüssel (meist id) ist in jeder Zeile anders - daran erkennt man sie, und darauf verweisen Fremdschlüssel.',
          },
          {
            frage: "SELECT name FROM customers - in welcher Reihenfolge kommen die Zeilen?",
            antworten: ['Nach id', 'Alphabetisch', 'In keiner garantierten Reihenfolge', 'In der Reihenfolge des letzten ORDER BY'],
            richtig: 2,
            erklaerung: 'Ohne ORDER BY ist die Reihenfolge nicht festgelegt. Sie kann sich ändern, sobald sich die Tabelle ändert.',
          },
          {
            frage: "Was liefert SELECT \"country\" FROM customers im Vergleich zu SELECT 'country' FROM customers?",
            antworten: [
              'Beides ist dasselbe',
              'Das erste die Spalte country, das zweite zwölfmal den Text country',
              'Das erste ist ein Fehler',
              'Das zweite die Spalte, das erste den Text',
            ],
            richtig: 1,
            erklaerung: 'Doppelte Anführungszeichen bezeichnen Namen (Spalten, Tabellen), einfache sind Text-Werte.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Eine relationale Datenbank speichert Tabellen mit Zeilen und typisierten Spalten; Primär- und Fremdschlüssel verbinden sie.',
          <>
            Grundform: <Code>SELECT spalten FROM tabelle ORDER BY … LIMIT …;</Code> - hinter SELECT stehen
            beliebige Ausdrücke, <Code>AS</Code> vergibt Namen.
          </>,
          'Ohne ORDER BY gibt es keine garantierte Reihenfolge.',
          "Text in 'einfachen', Namen in \"doppelten\" Anführungszeichen.",
          <>
            <Code>\dt</Code> listet Tabellen, <Code>\d tabelle</Code> zeigt ihren Aufbau.
          </>,
        ]}
      />
    </>
  )
}
