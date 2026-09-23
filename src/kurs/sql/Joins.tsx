import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { JoinComparison, SchemaDiagram } from '../demos/SqlDiagrams'
import { beispiele, codeBloecke } from './Joins.code'

/**
 * KAPITEL 9.4 - Tabellen verbinden: JOIN
 * Schlüssel, INNER und LEFT JOIN, Ketten über vier Tabellen und JOIN mit GROUP BY.
 */
export function Joins() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          In <Code>orders</Code> steht nur die <Code>customer_id</Code> - der Name des Kunden steht in{' '}
          <Code>customers</Code>. Ein <Code>JOIN</Code> setzt die zusammengehörigen Zeilen beider
          Tabellen nebeneinander:
        </P>
        <TryIt modus="sql" id="sql-joins-einstieg" {...beispiele['sql-joins-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Warum die Daten verteilt sind">
        <P>
          Man könnte den Kundennamen auch in jede Bestellung schreiben. Dann stünde „Grace Hopper“
          viermal in <Code>orders</Code> - und bei einer Namensänderung müsste man alle vier Stellen
          finden. Relationale Datenbanken speichern jede Information deshalb{' '}
          <strong>genau einmal</strong> und verweisen per Schlüssel darauf. Das nennt man{' '}
          <strong>Normalisierung</strong>.
        </P>
        <SchemaDiagram />
        <Liste>
          <li>
            <strong>1 : n</strong> - ein Kunde, viele Bestellungen. Der Fremdschlüssel steht auf der
            „vielen“ Seite: <Code>orders.customer_id</Code>.
          </li>
          <li>
            <strong>n : m</strong> - eine Bestellung enthält viele Produkte, ein Produkt steckt in vielen
            Bestellungen. Dafür braucht es eine Tabelle dazwischen: <Code>order_items</Code> mit zwei
            Fremdschlüsseln (und der Menge als Extra).
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="JOIN … ON">
        <CodeBlock code={codeBloecke.syntax} titel="SQL" />
        <P>
          <Code>ON</Code> sagt, welche Zeilen zusammengehören. Die kurzen Namen <Code>o</Code> und{' '}
          <Code>c</Code> sind <strong>Aliase</strong> - spätestens wenn zwei Tabellen eine Spalte{' '}
          <Code>id</Code> haben, muss man ohnehin sagen, welche gemeint ist. Was passiert ohne{' '}
          <Code>ON</Code>?
        </P>
        <TryIt modus="sql" id="sql-joins-ohne-on" {...beispiele['sql-joins-ohne-on']} />
        <P>
          Ohne Bedingung kombiniert die Datenbank <strong>jede</strong> Zeile mit{' '}
          <strong>jeder</strong> (ein Kreuzprodukt): 20 Bestellungen × 12 Kunden = 240 Zeilen. Ein JOIN
          ist gedanklich genau das - gefolgt von einem Filter, der nur die passenden Paare übrig lässt.
          Ein vergessenes <Code>ON</Code> erkennt man an plötzlich riesigen Ergebnissen.
        </P>
      </Abschnitt>

      <Abschnitt titel="LEFT JOIN: auch ohne Partner">
        <P>
          Ein normaler <Code>JOIN</Code> (genauer: <Code>INNER JOIN</Code>) liefert nur Zeilen, die auf{' '}
          <strong>beiden</strong> Seiten einen Partner haben. Margaret Hamilton und Niklaus Wirth haben
          nie bestellt - sie fehlen. <Code>LEFT JOIN</Code> behält alle Zeilen der linken Tabelle und
          füllt rechts mit NULL auf:
        </P>
        <JoinComparison />
        <TryIt modus="sql" id="sql-joins-left" {...beispiele['sql-joins-left']} />
        <P>
          Die zweite Abfrage ist ein Standardmuster: <Code>LEFT JOIN</Code> plus{' '}
          <Code>WHERE rechts.id IS NULL</Code> findet alles, was <strong>keinen</strong> Partner hat -
          Kunden ohne Bestellung, Produkte, die nie verkauft wurden.
        </P>
        <CodeBlock code={codeBloecke.arten} titel="SQL" />
      </Abschnitt>

      <Abschnitt titel="Über mehrere Tabellen">
        <P>
          JOINs lassen sich aneinanderreihen. Jeder weitere <Code>JOIN</Code> hängt eine Tabelle an das
          bisherige Zwischenergebnis - hier einmal quer durch die ganze Datenbank:
        </P>
        <TryIt modus="sql" id="sql-joins-kette" {...beispiele['sql-joins-kette']} />
        <P>
          Zusammen mit <Code>GROUP BY</Code> (<Verweis id="sql-gruppieren" />) entstehen daraus echte
          Auswertungen, etwa der Umsatz pro Kunde:
        </P>
        <TryIt modus="sql" id="sql-joins-auswertung" {...beispiele['sql-joins-auswertung']} />
        <Hinweis variante="info">
          <Code>count(DISTINCT o.id)</Code> statt <Code>count(*)</Code>: Nach dem JOIN mit{' '}
          <Code>order_items</Code> steht jede Bestellung so oft da, wie sie Positionen hat. Gezählt
          werden sollen aber Bestellungen, nicht Positionen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Zwei Fallen beim LEFT JOIN">
        <P>
          <strong>Richtig zählen:</strong> Mit <Code>LEFT JOIN</Code> hat auch ein Kunde ohne Bestellung
          eine Zeile (mit NULL). <Code>count(*)</Code> zählt diese Zeile mit - <Code>count(o.id)</Code>{' '}
          übergeht NULL und liefert die richtige 0:
        </P>
        <TryIt modus="sql" id="sql-joins-zaehlen" {...beispiele['sql-joins-zaehlen']} />
        <P>
          <strong>Bedingungen an der richtigen Stelle:</strong> Eine Bedingung auf die rechte Tabelle im{' '}
          <Code>WHERE</Code> wirft die NULL-Zeilen wieder hinaus - aus dem LEFT JOIN wird still ein
          INNER JOIN. Soll die linke Seite vollständig bleiben, gehört die Bedingung ins{' '}
          <Code>ON</Code>:
        </P>
        <CodeBlock code={codeBloecke.falle} titel="SQL" />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="sql"
          id="sql-joins-uebung"
          {...beispiele['sql-joins-uebung']}
          aufgabe={
            <p>
              Welche Produkte wurden <strong>noch nie bestellt</strong>? Zeige <Code>name</Code> und{' '}
              <Code>category</Code>, nach Name sortiert.
            </p>
          }
          tipps={{
            de: [
              'Bestellt heißt: Es gibt eine Zeile in `order_items` mit dieser `product_id`.',
              '`LEFT JOIN order_items i ON i.product_id = p.id` behält auch Produkte ohne Position.',
              'Übrig bleiben sollen die Zeilen, bei denen rechts nichts gefunden wurde: `WHERE i.product_id IS NULL`.',
            ],
            en: [
              'Ordered means: there is a row in `order_items` with this `product_id`.',
              '`LEFT JOIN order_items i ON i.product_id = p.id` also keeps products without a line item.',
              'What should remain are the rows where nothing was found on the right: `WHERE i.product_id IS NULL`.',
            ],
          }}
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'In welcher Tabelle steht der Fremdschlüssel bei „ein Kunde hat viele Bestellungen“?',
            antworten: ['In customers', 'In orders', 'In beiden', 'In einer eigenen Tabelle'],
            richtig: 1,
            erklaerung: 'Der Fremdschlüssel steht auf der „vielen“ Seite: jede Bestellung merkt sich ihren einen Kunden (customer_id).',
          },
          {
            frage: '12 Kunden, 20 Bestellungen, 2 Kunden ohne Bestellung. Wie viele Zeilen liefert customers JOIN orders?',
            antworten: ['12', '20', '22', '240'],
            richtig: 1,
            erklaerung: 'Der INNER JOIN liefert jedes passende Paar - eine Zeile pro Bestellung. Die Kunden ohne Bestellung fehlen; ein LEFT JOIN hätte 22 geliefert.',
          },
          {
            frage: 'Eine Abfrage mit JOIN liefert plötzlich tausende Zeilen. Was ist der wahrscheinlichste Grund?',
            antworten: ['Ein Index fehlt', 'Die ON-Bedingung fehlt oder verbindet die falschen Spalten', 'LIMIT fehlt', 'Es fehlt ein GROUP BY'],
            richtig: 1,
            erklaerung: 'Ohne passende ON-Bedingung wird jede Zeile mit jeder kombiniert (Kreuzprodukt).',
          },
        ]}
      />

      <Merke
        punkte={[
          'Jede Information steht einmal in der Datenbank; Fremdschlüssel verweisen darauf. n:m-Beziehungen brauchen eine Tabelle dazwischen.',
          <>
            <Code>JOIN b ON b.id = a.b_id</Code> verbindet zusammengehörige Zeilen; Aliase (<Code>o</Code>,{' '}
            <Code>c</Code>) halten es kurz und eindeutig.
          </>,
          'INNER JOIN liefert nur Zeilen mit Partner, LEFT JOIN alle Zeilen der linken Tabelle (rechts NULL).',
          <>
            <Code>LEFT JOIN … WHERE rechts.id IS NULL</Code> findet alles ohne Partner.
          </>,
          <>
            Mit LEFT JOIN <Code>count(rechts.id)</Code> statt <Code>count(*)</Code> zählen und Bedingungen
            auf die rechte Tabelle ins <Code>ON</Code> schreiben.
          </>,
        ]}
      />
    </>
  )
}
