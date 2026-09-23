import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Profi.code'

/**
 * KAPITEL 9.7 - Unterabfragen, CTEs & Window Functions
 * Abfragen in Abfragen, WITH, OVER (PARTITION BY …) und Views.
 */
export function Profi() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Das Ergebnis einer Abfrage ist wieder eine Tabelle - und lässt sich in einer anderen Abfrage
          weiterverwenden. Hier liefert die innere Abfrage den Durchschnittspreis, die äußere vergleicht
          jedes Produkt damit:
        </P>
        <TryIt modus="sql" id="sql-profi-einstieg" {...beispiele['sql-profi-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Unterabfragen">
        <P>Eine Unterabfrage steht in Klammern und kann an drei Stellen vorkommen:</P>
        <Liste>
          <li>
            Als <strong>ein Wert</strong> (wie oben): Sie muss dann genau eine Zeile und eine Spalte
            liefern.
          </li>
          <li>
            Als <strong>Liste</strong> hinter <Code>IN</Code>: eine Spalte, beliebig viele Zeilen.
          </li>
          <li>
            Als <strong>Tabelle</strong> hinter <Code>FROM</Code> - dafür gibt es gleich eine lesbarere
            Form.
          </li>
        </Liste>
        <TryIt modus="sql" id="sql-profi-in-exists" {...beispiele['sql-profi-in-exists']} />
        <P>
          <Code>EXISTS (…)</Code> fragt nur, ob die Unterabfrage <em>irgendeine</em> Zeile findet. Die
          Unterabfrage darf sich dabei auf die äußere Zeile beziehen (<Code>o.customer_id = c.id</Code>) -
          sie läuft gedanklich einmal pro Kunde. <Code>NOT EXISTS</Code> ist die Alternative zum{' '}
          <Code>LEFT JOIN … IS NULL</Code> aus <Verweis id="sql-joins" />.
        </P>
      </Abschnitt>

      <Abschnitt titel="WITH: Abfragen in Schritten">
        <P>
          Verschachtelte Unterabfragen liest man von innen nach außen - das wird schnell unübersichtlich.
          Eine <strong>CTE</strong> (Common Table Expression) gibt einem Zwischenergebnis mit{' '}
          <Code>WITH name AS (…)</Code> einen Namen. Die Abfrage liest sich dann von oben nach unten, wie
          Variablen in einem Programm:
        </P>
        <TryIt modus="sql" id="sql-profi-cte" {...beispiele['sql-profi-cte']} />
        <Hinweis variante="tipp">
          Mehrere Schritte trennt man mit Komma: <Code>WITH a AS (…), b AS (SELECT … FROM a) SELECT …</Code>.
          Jeder Schritt darf die vorherigen benutzen. So entstehen auch lange Auswertungen, die man noch
          versteht.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Window Functions">
        <P>
          <Code>GROUP BY</Code> fasst Zeilen zusammen - die einzelnen Produkte sind danach weg. Eine{' '}
          <strong>Window Function</strong> rechnet ebenfalls über mehrere Zeilen, lässt aber{' '}
          <strong>jede Zeile stehen</strong> und schreibt das Ergebnis daneben. Erkennbar ist sie an{' '}
          <Code>OVER</Code>:
        </P>
        <CodeBlock code={codeBloecke.window} titel="SQL" />
        <TryIt modus="sql" id="sql-profi-window" {...beispiele['sql-profi-window']} />
        <Liste>
          <li>
            <Code>rank()</Code>, <Code>dense_rank()</Code>, <Code>row_number()</Code> nummerieren -
            unterschiedlich bei Gleichstand.
          </li>
          <li>
            Jede Aggregatfunktion wird mit <Code>OVER</Code> zur Window Function:{' '}
            <Code>avg(price) OVER (PARTITION BY category)</Code> ist der Durchschnitt der Kategorie -
            neben jedem einzelnen Produkt.
          </li>
          <li>
            Mit <Code>ORDER BY</Code> im Fenster rechnet <Code>sum</Code> fortlaufend, und{' '}
            <Code>lag()</Code> schaut auf die vorherige Zeile:
          </li>
        </Liste>
        <TryIt modus="sql" id="sql-profi-laufend" {...beispiele['sql-profi-laufend']} />
      </Abschnitt>

      <Abschnitt titel="Views und UNION">
        <P>
          Eine Abfrage, die man immer wieder braucht, speichert man als <strong>View</strong>. Sie
          verhält sich wie eine Tabelle, rechnet aber bei jedem Lesen neu - die Daten stehen weiter nur in
          den echten Tabellen:
        </P>
        <TryIt modus="sql" id="sql-profi-view" {...beispiele['sql-profi-view']} />
        <P>
          Und wenn zwei Ergebnisse mit gleichen Spalten <em>untereinander</em> sollen, hilft{' '}
          <Code>UNION ALL</Code>:
        </P>
        <CodeBlock code={codeBloecke.union} titel="SQL" />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="sql"
          id="sql-profi-uebung"
          {...beispiele['sql-profi-uebung']}
          aufgabe={
            <p>
              Die CTE <Code>revenue</Code> berechnet schon den Umsatz jedes Kunden. Zeige pro Land nur den{' '}
              <strong>Kunden mit dem höchsten Umsatz</strong>: <Code>country</Code>, <Code>name</Code>,{' '}
              <Code>revenue</Code>, nach Land sortiert.
            </p>
          }
          tipps={{
            de: [
              'Nummeriere die Kunden innerhalb jedes Landes: `rank() OVER (PARTITION BY country ORDER BY revenue DESC)`.',
              'Eine Window Function darf nicht im WHERE stehen (das läuft vorher). Leg deshalb einen zweiten Schritt an: `WITH revenue AS (…), ranked AS (SELECT …, rank() OVER (…) AS place FROM revenue)`.',
              'Zum Schluss: `SELECT country, name, revenue FROM ranked WHERE place = 1 ORDER BY country`.',
            ],
            en: [
              'Number the customers within every country: `rank() OVER (PARTITION BY country ORDER BY revenue DESC)`.',
              'A window function must not be in WHERE (that runs before). So add a second step: `WITH revenue AS (…), ranked AS (SELECT …, rank() OVER (…) AS place FROM revenue)`.',
              'Finally: `SELECT country, name, revenue FROM ranked WHERE place = 1 ORDER BY country`.',
            ],
          }}
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'WHERE price = (SELECT price FROM products WHERE category = \'books\') - was passiert?',
            antworten: [
              'Alle Produkte, die so viel kosten wie irgendein Buch',
              'Ein Fehler: Die Unterabfrage liefert mehr als eine Zeile',
              'Nur das erste Buch wird verglichen',
              'Ein leeres Ergebnis',
            ],
            richtig: 1,
            erklaerung: 'Mit = muss die Unterabfrage genau einen Wert liefern. Für eine Liste braucht es IN.',
          },
          {
            frage: 'Was ist der Unterschied zwischen sum(revenue) mit GROUP BY und sum(revenue) OVER ()?',
            antworten: [
              'Keiner',
              'GROUP BY fasst die Zeilen zusammen, OVER () lässt jede Zeile stehen und schreibt die Summe daneben',
              'OVER () ist schneller',
              'OVER () geht nur mit ORDER BY',
            ],
            richtig: 1,
            erklaerung: 'Window Functions rechnen über andere Zeilen, ohne sie zusammenzufassen.',
          },
          {
            frage: 'Wozu dient WITH?',
            antworten: [
              'Es legt eine dauerhafte Tabelle an',
              'Es gibt einer Zwischenabfrage einen Namen, damit die Abfrage in lesbaren Schritten entsteht',
              'Es startet eine Transaktion',
              'Es verbindet zwei Tabellen',
            ],
            richtig: 1,
            erklaerung: 'Eine CTE gilt nur für die eine Abfrage. Dauerhaft wird eine Abfrage mit CREATE VIEW.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Unterabfragen liefern einen Wert, eine Liste (IN) oder eine Tabelle; EXISTS fragt nur, ob es Zeilen gibt.',
          <>
            <Code>WITH name AS (…)</Code> zerlegt lange Abfragen in benannte Schritte.
          </>,
          <>
            Window Functions (<Code>… OVER (PARTITION BY … ORDER BY …)</Code>) rechnen über andere Zeilen
            und behalten jede Zeile: Ranglisten, laufende Summen, Vergleiche mit der Vorzeile.
          </>,
          <>
            <Code>CREATE VIEW</Code> speichert eine Abfrage unter einem Namen, <Code>UNION ALL</Code> hängt
            Ergebnisse untereinander.
          </>,
        ]}
      />
    </>
  )
}
