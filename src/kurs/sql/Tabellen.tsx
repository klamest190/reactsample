import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Tabellen.code'

/**
 * KAPITEL 9.6 - Tabellen entwerfen: CREATE TABLE
 * Datentypen, Schlüssel und Constraints, ALTER TABLE, Indizes und EXPLAIN - und der Weg zu JPA.
 */
export function Tabellen() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Bisher waren die Tabellen fertig. Jetzt legst du selbst eine an: für Produktbewertungen, mit
          Schlüsseln zu Produkten und Kunden und einer Regel, dass es nur 1 bis 5 Sterne gibt.
        </P>
        <TryIt modus="sql" id="sql-tabellen-einstieg" {...beispiele['sql-tabellen-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Aufbau von CREATE TABLE">
        <CodeBlock code={codeBloecke.aufbau} titel="SQL" />
        <P>
          Jede Spalte hat einen Namen, einen <strong>Typ</strong> und optional Regeln. Der Typ ist
          streng: In eine <Code>integer</Code>-Spalte passt kein Text, in eine <Code>date</Code>-Spalte
          kein „31. Februar“. Die wichtigsten Typen:
        </P>
        <Tabelle
          kopf={['Typ', 'Für', 'Beispiel']}
          spalten={['font-mono', undefined, 'font-mono']}
          dicht
          zeilen={[
            ['integer / bigint', 'Ganze Zahlen, Schlüssel (bigint bei sehr vielen Zeilen)', '42'],
            ['numeric(10, 2)', 'Geld und alles, was exakt sein muss', '19.90'],
            ['real / double precision', 'Messwerte - schnell, aber mit Rundungsfehlern', '0.1'],
            ['text / varchar(n)', 'Text; in PostgreSQL ist text der Normalfall', "'Ada'"],
            ['boolean', 'Ja/Nein', 'true'],
            ['date', 'Datum ohne Uhrzeit', "'2026-09-23'"],
            ['timestamptz', 'Zeitpunkt mit Zeitzone - für „wann ist es passiert“', 'now()'],
            ['jsonb', 'Flexible Zusatzdaten als JSON', `'{"color": "red"}'`],
            ['uuid', 'Weltweit eindeutige ids', 'gen_random_uuid()'],
          ]}
        />
        <Hinweis variante="warnung">
          Geld nie als <Code>real</Code> oder <Code>double precision</Code>: 0.1 ist darin nicht exakt
          darstellbar, zehnmal 0.10 ergibt nicht genau 1. <Code>numeric</Code> rechnet exakt - wie{' '}
          <Code>BigDecimal</Code> in Java.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Schlüssel und Regeln">
        <Liste>
          <li>
            <Code>PRIMARY KEY</Code> - eindeutig und nie NULL. Meist eine künstliche <Code>id</Code> mit{' '}
            <Code>GENERATED ALWAYS AS IDENTITY</Code>: Die Datenbank zählt selbst hoch. (Ältere Projekte
            schreiben <Code>serial</Code> - das macht fast dasselbe.)
          </li>
          <li>
            <Code>REFERENCES tabelle (spalte)</Code> - Fremdschlüssel: Der Wert muss dort existieren.
            Mit <Code>ON DELETE CASCADE</Code> werden abhängige Zeilen mitgelöscht (so bei{' '}
            <Code>order_items</Code>), ohne Zusatz wird das Löschen verweigert.
          </li>
          <li>
            <Code>NOT NULL</Code> - Pflichtfeld. <Code>UNIQUE</Code> - kein Wert doppelt.{' '}
            <Code>CHECK (…)</Code> - eine Bedingung, die jede Zeile erfüllen muss.
          </li>
          <li>
            <Code>DEFAULT …</Code> - der Wert, wenn beim INSERT keiner kommt.
          </li>
        </Liste>
        <TryIt modus="sql" id="sql-tabellen-check" {...beispiele['sql-tabellen-check']} />
        <P>
          Faustregel: Jede Regel, die <em>immer</em> gelten muss, gehört (auch) in die Datenbank. Das
          Backend prüft für schöne Fehlermeldungen, die Datenbank für die Sicherheit.
        </P>
      </Abschnitt>

      <Abschnitt titel="Tabellen ändern: ALTER TABLE">
        <P>
          Anwendungen wachsen, Tabellen mit ihnen. <Code>ALTER TABLE</Code> fügt Spalten hinzu, benennt
          um, ergänzt Regeln - ohne die vorhandenen Daten zu verlieren:
        </P>
        <TryIt modus="sql" id="sql-tabellen-alter" {...beispiele['sql-tabellen-alter']} />
        <P>
          <Code>DROP TABLE name</Code> löscht eine Tabelle samt Inhalt, <Code>DROP COLUMN</Code> eine
          Spalte. Beides lässt sich nicht rückgängig machen - außer in einer Transaktion, denn in
          PostgreSQL gilt auch für <Code>CREATE</Code>, <Code>ALTER</Code> und <Code>DROP</Code>: alles
          oder nichts.
        </P>
      </Abschnitt>

      <Abschnitt titel="Schneller suchen: Indizes">
        <P>
          Ohne Hilfe liest PostgreSQL für <Code>WHERE customer_id = 42</Code> die ganze Tabelle. Ein{' '}
          <strong>Index</strong> ist wie das Register eines Buchs: sortierte Verweise, über die man
          direkt zur richtigen Stelle springt. <Code>EXPLAIN</Code> zeigt, welchen Weg die Datenbank
          plant:
        </P>
        <TryIt modus="sql" id="sql-tabellen-index" {...beispiele['sql-tabellen-index']} />
        <Liste>
          <li>
            <Code>Seq Scan</Code> heißt: alle 200.000 Zeilen lesen. Mit Index springt PostgreSQL über
            den <Code>Bitmap Index Scan</Code> direkt zu den 40 Treffern - die geschätzten Kosten fallen
            von rund 3.800 auf rund 140.
          </li>
          <li>
            Primärschlüssel und <Code>UNIQUE</Code>-Spalten haben automatisch einen Index. Für
            Fremdschlüssel und häufig gefilterte Spalten legt man ihn selbst an.
          </li>
          <li>
            Indizes kosten Platz und machen jedes INSERT und UPDATE etwas langsamer. Also gezielt
            anlegen - dort, wo <Code>EXPLAIN</Code> einen teuren <Code>Seq Scan</Code> zeigt.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Und in Spring Boot?">
        <P>
          Eine JPA-Entity (<Verweis id="spring-daten" />) ist die Java-Seite einer Tabelle. Die
          Annotationen entsprechen dem, was du hier in SQL schreibst:
        </P>
        <CodeBlock code={codeBloecke.entity} titel="Review.java" />
        <P>
          Im Kurs erzeugt Hibernate die Tabellen beim Start selbst (<Code>ddl-auto</Code>). In echten
          Projekten schreibt man das SQL lieber selbst, als nummerierte <strong>Migrationen</strong>, die
          ein Werkzeug wie Flyway oder Liquibase beim Start der Reihe nach ausführt - so ist jede
          Änderung am Schema versioniert und auf jeder Datenbank gleich:
        </P>
        <CodeBlock code={codeBloecke.migration} titel="V2__add_reviews.sql" />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="sql"
          id="sql-tabellen-uebung"
          {...beispiele['sql-tabellen-uebung']}
          aufgabe={
            <>
              <p>
                Kunden sollen sich Produkte merken können. Lege die Tabelle <Code>wishlist</Code> an:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>customer_id</Code> und <Code>product_id</Code> (integer, Pflicht), jeweils
                  Fremdschlüssel auf <Code>customers</Code> bzw. <Code>products</Code>
                </li>
                <li>
                  <Code>added</Code> (date, Pflicht), standardmäßig das heutige Datum
                </li>
                <li>Ein Produkt steht pro Kunde höchstens einmal auf der Liste: Primärschlüssel aus beiden ids</li>
              </ul>
              <p className="mt-1">Trage danach ein, dass sich Ada (1) die Kopfhörer (6) wünscht.</p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Welcher Typ passt für den Preis eines Produkts?',
            antworten: ['real', 'integer', 'numeric(10, 2)', 'text'],
            richtig: 2,
            erklaerung: 'numeric rechnet exakt. real hat Rundungsfehler, integer kennt keine Cents, text lässt sich nicht rechnen.',
          },
          {
            frage: 'order_items.order_id hat ON DELETE CASCADE. Was passiert beim Löschen einer Bestellung?',
            antworten: [
              'Das Löschen wird verweigert',
              'Die Positionen werden mitgelöscht',
              'Die Positionen bekommen order_id NULL',
              'Nichts - die Positionen bleiben unverändert',
            ],
            richtig: 1,
            erklaerung: 'CASCADE löscht abhängige Zeilen mit. Ohne Zusatz würde PostgreSQL das Löschen mit einem Fremdschlüssel-Fehler ablehnen.',
          },
          {
            frage: 'EXPLAIN zeigt „Seq Scan“ auf einer großen Tabelle. Was bedeutet das?',
            antworten: [
              'Die Abfrage hat einen Fehler',
              'PostgreSQL liest die ganze Tabelle - vielleicht fehlt ein Index',
              'Die Tabelle ist sortiert',
              'Die Abfrage wurde aus dem Cache beantwortet',
            ],
            richtig: 1,
            erklaerung: 'Ein Seq Scan liest jede Zeile. Bei kleinen Tabellen ist das richtig, bei großen und seltenen Treffern hilft ein Index.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>CREATE TABLE name (spalte typ regeln, …)</Code> - Geld als <Code>numeric</Code>,
            Zeitpunkte als <Code>timestamptz</Code>, Text als <Code>text</Code>.
          </>,
          <>
            <Code>GENERATED ALWAYS AS IDENTITY PRIMARY KEY</Code> für ids, <Code>REFERENCES</Code> für
            Fremdschlüssel, dazu <Code>NOT NULL</Code>, <Code>UNIQUE</Code>, <Code>CHECK</Code>,{' '}
            <Code>DEFAULT</Code>.
          </>,
          'Regeln, die immer gelten müssen, gehören in die Datenbank.',
          <>
            <Code>ALTER TABLE</Code> ändert Tabellen mit Daten; in Projekten als versionierte Migration.
          </>,
          <>
            Ein Index beschleunigt Suchen; <Code>EXPLAIN</Code> zeigt, ob er benutzt wird.
          </>,
        ]}
      />
    </>
  )
}
