import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Aendern.code'

/**
 * KAPITEL 9.5 - Daten ändern & Transaktionen
 * INSERT, UPDATE, DELETE mit RETURNING, Constraints als Schutz und BEGIN/COMMIT/ROLLBACK.
 */
export function Aendern() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Lesen ist nur die halbe Miete. Drei Befehle ändern Daten: <Code>INSERT</Code> fügt Zeilen
          ein, <Code>UPDATE</Code> ändert sie, <Code>DELETE</Code> löscht sie. Mit{' '}
          <Code>RETURNING</Code> bekommst du die betroffenen Zeilen gleich zurück:
        </P>
        <TryIt modus="sql" id="sql-aendern-einstieg" {...beispiele['sql-aendern-einstieg']} />
        <Hinweis variante="info">
          Hier startet jeder Lauf mit frischen Tabellen - drück zweimal auf Ausführen, und Radia hat
          beide Male die id 13. In einer echten Datenbank bleibt jede Änderung, bis jemand sie
          rückgängig macht. Genau deshalb lohnt sich der Rest dieses Kapitels.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="INSERT">
        <CodeBlock code={codeBloecke.formen} titel="SQL" />
        <P>
          Nenne die Spalten immer ausdrücklich - dann ist die Reihenfolge der Werte klar, und eine
          später hinzugefügte Spalte bricht nichts. Spalten, die fehlen, bekommen ihren{' '}
          <Code>DEFAULT</Code> (die <Code>id</Code> zählt hoch, <Code>joined</Code> wird heute) oder
          NULL. Mehrere Zeilen trennst du mit Komma:
        </P>
        <TryIt modus="sql" id="sql-aendern-insert" {...beispiele['sql-aendern-insert']} />
        <P>
          <Code>RETURNING</Code> ist eine PostgreSQL-Spezialität, die man ständig braucht: Ein Backend,
          das einen Kunden anlegt, will die neue <Code>id</Code> zurückgeben (<Verweis id="spring-rest" />).
          Ohne RETURNING bräuchte es dafür eine zweite Abfrage.
        </P>
      </Abschnitt>

      <Abschnitt titel="UPDATE und DELETE">
        <TryIt modus="sql" id="sql-aendern-update" {...beispiele['sql-aendern-update']} />
        <P>
          Rechnen mit dem alten Wert ist erlaubt: <Code>SET price = price * 1.10</Code>. Der Preis ist
          als <Code>numeric(8, 2)</Code> angelegt, deshalb rundet PostgreSQL das Ergebnis selbst auf zwei
          Stellen.
        </P>
        <TryIt modus="sql" id="sql-aendern-delete" {...beispiele['sql-aendern-delete']} />
        <Hinweis variante="warnung">
          <Code>UPDATE</Code> und <Code>DELETE</Code> <strong>ohne WHERE</strong> treffen jede Zeile
          der Tabelle - ohne Rückfrage. Gewöhn dir an, erst das <Code>WHERE</Code> mit einem{' '}
          <Code>SELECT</Code> zu testen und dann <Code>SELECT *</Code> durch <Code>UPDATE … SET</Code>{' '}
          oder <Code>DELETE</Code> zu ersetzen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Constraints passen auf">
        <P>
          Die Tabellen haben Regeln (<Code>\d orders</Code> zeigt sie). Verstößt eine Änderung dagegen,
          lehnt PostgreSQL sie ab - die Daten bleiben, wie sie waren. Ada hat noch Bestellungen, also
          darf sie nicht gelöscht werden:
        </P>
        <TryIt modus="sql" id="sql-aendern-fremdschluessel" {...beispiele['sql-aendern-fremdschluessel']} />
        <P>Die Meldungen folgen immer demselben Muster - welche Regel, welche Tabelle:</P>
        <CodeBlock code={codeBloecke.fehler} titel="psql" />
        <P>
          Diese Regeln sind kein Hindernis, sondern die letzte Verteidigungslinie: Selbst wenn im
          Backend eine Prüfung fehlt (<Verweis id="spring-fehler" />), kommen keine kaputten Daten in die
          Datenbank.
        </P>
      </Abschnitt>

      <Abschnitt titel="Transaktionen: alles oder nichts">
        <P>
          Eine Bestellung anzulegen sind drei Schritte: die Bestellung, ihre Positionen, der neue
          Lagerbestand. Bricht nach dem zweiten Schritt etwas ab, wäre die Ware verkauft, aber noch im
          Lager. Eine <strong>Transaktion</strong> fasst Schritte zusammen, die nur gemeinsam gelten:
        </P>
        <TryIt modus="sql" id="sql-aendern-transaktion" {...beispiele['sql-aendern-transaktion']} />
        <Liste>
          <li>
            <Code>BEGIN</Code> startet die Transaktion. Andere Verbindungen sehen die Änderungen erst
            nach dem <Code>COMMIT</Code> - dann alle auf einmal.
          </li>
          <li>
            <Code>ROLLBACK</Code> verwirft alles seit <Code>BEGIN</Code>. Scheitert eine Anweisung,
            nimmt PostgreSQL bis zum ROLLBACK keine weiteren mehr an („current transaction is aborted“).
          </li>
          <li>
            Ohne <Code>BEGIN</Code> ist jede einzelne Anweisung ihre eigene kleine Transaktion
            („autocommit“).
          </li>
        </Liste>
        <P>ROLLBACK ist auch ein Sicherheitsnetz zum Ausprobieren:</P>
        <TryIt modus="sql" id="sql-aendern-rollback" {...beispiele['sql-aendern-rollback']} />
        <P>
          In Spring übernimmt <Code>@Transactional</Code> das <Code>BEGIN</Code> und{' '}
          <Code>COMMIT</Code> - und das <Code>ROLLBACK</Code>, wenn die Methode mit einer Exception
          endet (<Verweis id="spring-daten" />).
        </P>
      </Abschnitt>

      <Abschnitt titel="Einfügen oder ändern: ON CONFLICT">
        <P>
          Manchmal weiß man nicht, ob es die Zeile schon gibt - etwa beim Import einer Kundenliste.{' '}
          <Code>INSERT … ON CONFLICT</Code> („Upsert“) sagt, was bei einem doppelten Schlüssel passieren
          soll: <Code>DO NOTHING</Code> oder <Code>DO UPDATE</Code>. <Code>excluded</Code> ist die Zeile,
          die eingefügt werden sollte:
        </P>
        <TryIt modus="sql" id="sql-aendern-upsert" {...beispiele['sql-aendern-upsert']} />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="sql"
          id="sql-aendern-uebung"
          {...beispiele['sql-aendern-uebung']}
          aufgabe={
            <p>
              Buchwoche im Shop: Mach <strong>alle Bücher 10 % günstiger</strong>. Füge danach das neue
              Buch <Code>PostgreSQL Pocket Guide</Code> (Kategorie <Code>books</Code>, 19.90 €, 30 Stück)
              zum vollen Preis ein. Die anderen Produkte dürfen sich nicht ändern.
            </p>
          }
          tipps={{
            de: [
              '10 % günstiger heißt `price * 0.9` - nur für `WHERE category = \'books\'`.',
              'Die Reihenfolge zählt: Erst das UPDATE, dann das INSERT - sonst wird das neue Buch mit reduziert.',
              '`INSERT INTO products (name, category, price, stock) VALUES (…)`',
            ],
            en: [
              '10 % cheaper means `price * 0.9` - only for `WHERE category = \'books\'`.',
              'The order matters: first the UPDATE, then the INSERT - otherwise the new book is reduced too.',
              '`INSERT INTO products (name, category, price, stock) VALUES (…)`',
            ],
          }}
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was passiert bei UPDATE products SET stock = 0; ?',
            antworten: [
              'PostgreSQL fragt nach',
              'Ein Fehler, weil WHERE fehlt',
              'Jedes Produkt hat danach den Bestand 0',
              'Nur das erste Produkt wird geändert',
            ],
            richtig: 2,
            erklaerung: 'Ohne WHERE gilt ein UPDATE für alle Zeilen. Es gibt keine Rückfrage - nur ein ROLLBACK in einer offenen Transaktion rettet dann noch.',
          },
          {
            frage: 'Wozu dient RETURNING?',
            antworten: [
              'Es macht die Änderung rückgängig',
              'Es liefert die eingefügten oder geänderten Zeilen zurück',
              'Es beendet die Transaktion',
              'Es gibt die Zahl der Zeilen zurück',
            ],
            richtig: 1,
            erklaerung: 'RETURNING liefert die betroffenen Zeilen - etwa die neue id nach einem INSERT - ohne eine zweite Abfrage.',
          },
          {
            frage: 'Zwischen BEGIN und COMMIT schlägt die dritte von vier Anweisungen fehl. Was gilt?',
            antworten: [
              'Die ersten zwei sind gespeichert',
              'Die ersten zwei und die vierte sind gespeichert',
              'Nichts ist gespeichert - die Transaktion muss zurückgerollt werden',
              'PostgreSQL überspringt die fehlerhafte Anweisung',
            ],
            richtig: 2,
            erklaerung: 'Alles oder nichts: Nach einem Fehler nimmt die Transaktion keine Anweisungen mehr an und endet mit einem ROLLBACK.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>INSERT INTO t (spalten) VALUES (…)</Code>, <Code>UPDATE t SET … WHERE …</Code>,{' '}
            <Code>DELETE FROM t WHERE …</Code> - mit <Code>RETURNING</Code> kommen die Zeilen zurück.
          </>,
          'UPDATE und DELETE ohne WHERE treffen alle Zeilen. Das WHERE erst mit einem SELECT testen.',
          'Constraints (NOT NULL, UNIQUE, CHECK, Fremdschlüssel) lehnen falsche Änderungen ab.',
          <>
            <Code>BEGIN</Code> … <Code>COMMIT</Code>: alles oder nichts. <Code>ROLLBACK</Code> verwirft.
          </>,
          <>
            <Code>ON CONFLICT … DO UPDATE / DO NOTHING</Code> fügt ein oder ändert.
          </>,
        ]}
      />
    </>
  )
}
