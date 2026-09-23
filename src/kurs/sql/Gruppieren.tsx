import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { EvaluationOrder } from '../demos/SqlDiagrams'
import { beispiele, codeBloecke } from './Gruppieren.code'

/**
 * KAPITEL 9.3 - Zählen & Gruppieren
 * Aggregatfunktionen, GROUP BY, HAVING und die Reihenfolge, in der eine Abfrage ausgewertet wird.
 */
export function Gruppieren() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Bisher kam jede Zeile der Tabelle einzeln heraus. Für Auswertungen - wie viele, wie viel,
          im Schnitt - fasst <Code>GROUP BY</Code> Zeilen mit gleichem Wert zu <strong>einer</strong>{' '}
          Ergebniszeile zusammen, und Funktionen wie <Code>count</Code> rechnen über jede Gruppe:
        </P>
        <TryIt modus="sql" id="sql-gruppieren-einstieg" {...beispiele['sql-gruppieren-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Aggregatfunktionen">
        <P>
          Eine <strong>Aggregatfunktion</strong> macht aus vielen Werten einen - wie <Code>reduce</Code>{' '}
          in JavaScript (<Verweis id="js-arrays" />). Ohne <Code>GROUP BY</Code> ist die ganze Tabelle
          eine einzige Gruppe:
        </P>
        <TryIt modus="sql" id="sql-gruppieren-aggregate" {...beispiele['sql-gruppieren-aggregate']} />
        <CodeBlock code={codeBloecke.funktionen} titel="SQL" />
        <Liste>
          <li>
            <Code>count(*)</Code> zählt Zeilen, <Code>count(spalte)</Code> nur die, in denen die Spalte
            nicht NULL ist - hier 16 gegen 11.
          </li>
          <li>
            Auch <Code>sum</Code>, <Code>avg</Code>, <Code>min</Code> und <Code>max</Code> übergehen
            NULL. Der Durchschnitt der Lagerbestände rechnet also nur mit den 11 Produkten, die einen haben.
          </li>
          <li>
            <Code>avg</Code> liefert viele Nachkommastellen - <Code>round(wert, 2)</Code> rundet.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="GROUP BY: eine Zeile pro Gruppe">
        <P>
          Mit <Code>GROUP BY status</Code> entsteht für jeden Status eine Gruppe; die Aggregatfunktionen
          rechnen dann je Gruppe. Das zweite Beispiel ist der Kern jeder Shop-Auswertung: der Wert
          einer Bestellung ist die Summe aus Menge mal Stückpreis ihrer Positionen.
        </P>
        <TryIt modus="sql" id="sql-gruppieren-group-by" {...beispiele['sql-gruppieren-group-by']} />
        <P>
          Die wichtigste Regel: Hinter <Code>SELECT</Code> darf nur stehen, was{' '}
          <strong>pro Gruppe eindeutig</strong> ist - die gruppierten Spalten und Aggregate. Welcher
          Name sollte in der einen Zeile „books“ stehen? Es gibt drei.
        </P>
        <TryIt modus="sql" id="sql-gruppieren-fehler" {...beispiele['sql-gruppieren-fehler']} />
        <Hinweis variante="info">
          Die Meldung sagt genau, was zu tun ist: <Code>name</Code> entweder in <Code>GROUP BY</Code>{' '}
          aufnehmen (dann gibt es eine Gruppe pro Kategorie <em>und</em> Name) oder in ein Aggregat
          packen, z. B. <Code>string_agg(name, ', ')</Code> oder <Code>min(name)</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="HAVING: Gruppen filtern">
        <P>
          <Code>WHERE</Code> filtert <strong>Zeilen, bevor</strong> gruppiert wird. Soll eine Bedingung
          über die Gruppe selbst gelten - „mindestens zwei Bestellungen“ -, gibt es die Gruppe zu dem
          Zeitpunkt noch gar nicht. Dafür ist <Code>HAVING</Code> da: ein Filter{' '}
          <strong>nach</strong> dem Gruppieren.
        </P>
        <TryIt modus="sql" id="sql-gruppieren-having" {...beispiele['sql-gruppieren-having']} />
      </Abschnitt>

      <Abschnitt titel="In welcher Reihenfolge wird gerechnet?">
        <P>
          Geschrieben wird eine Abfrage mit <Code>SELECT</Code> zuerst, ausgewertet aber in einer
          anderen Reihenfolge. Wer die kennt, versteht fast jede Fehlermeldung:
        </P>
        <EvaluationOrder />
        <P>
          <Code>SELECT</Code> kommt erst an fünfter Stelle. Deshalb kennt <Code>WHERE</Code> einen Alias
          aus dem SELECT noch nicht - <Code>ORDER BY</Code> dagegen schon:
        </P>
        <TryIt modus="sql" id="sql-gruppieren-alias" {...beispiele['sql-gruppieren-alias']} />
        <P>
          Die Lösung (hinter „Lösung zeigen“): den Ausdruck wiederholen. Bei langen Ausdrücken hilft
          eine Unterabfrage oder <Code>WITH</Code> - das kommt in <Verweis id="sql-profi" />.
        </P>
      </Abschnitt>

      <Abschnitt titel="Nach Zeit gruppieren">
        <P>
          Für Berichte gruppiert man oft nach Monat oder Jahr. <Code>to_char(datum, 'YYYY-MM')</Code>{' '}
          macht aus einem Datum den Monat als Text, <Code>extract(year FROM datum)</Code> holt einen
          Teil als Zahl. Und <Code>string_agg</Code> fasst Texte einer Gruppe zusammen:
        </P>
        <TryIt modus="sql" id="sql-gruppieren-zeit" {...beispiele['sql-gruppieren-zeit']} />
        <Hinweis variante="info">
          <Code>GROUP BY month</Code> mit dem Alias aus dem SELECT ist eine Bequemlichkeit von
          PostgreSQL. Portabel wäre <Code>GROUP BY to_char(ordered_at, 'YYYY-MM')</Code> oder{' '}
          <Code>GROUP BY 1</Code> (die erste Spalte).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="sql"
          id="sql-gruppieren-uebung"
          {...beispiele['sql-gruppieren-uebung']}
          aufgabe={
            <p>
              Welche Bestellungen haben einen Warenwert von <strong>mehr als 400 €</strong>? Zeige{' '}
              <Code>order_id</Code> und <Code>total</Code> (Summe von <Code>quantity * unit_price</Code>),
              den höchsten Wert zuerst, bei Gleichstand nach <Code>order_id</Code>.
            </p>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Die Spalte email ist bei einem von 12 Kunden NULL. Was liefert count(email)?',
            antworten: ['12', '11', '1', 'NULL'],
            richtig: 1,
            erklaerung: 'count(spalte) zählt nur Werte, die nicht NULL sind. count(*) würde 12 liefern.',
          },
          {
            frage: 'Wo gehört die Bedingung „Gruppen mit mehr als 5 Zeilen“ hin?',
            antworten: ['In WHERE', 'In HAVING', 'In GROUP BY', 'In ORDER BY'],
            richtig: 1,
            erklaerung: 'WHERE läuft vor dem Gruppieren und kennt count(*) noch nicht. HAVING filtert die fertigen Gruppen.',
          },
          {
            frage: 'Warum schlägt WHERE gross > 100 fehl, wenn gross ein Alias aus dem SELECT ist?',
            antworten: [
              'Aliase dürfen keine Zahlen enthalten',
              'WHERE wird vor SELECT ausgewertet - den Alias gibt es noch nicht',
              'Aliase gelten nur in GROUP BY',
              'Man muss den Alias in Anführungszeichen setzen',
            ],
            richtig: 1,
            erklaerung: 'Auswertung: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Erst ab SELECT existiert der Alias.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Aggregatfunktionen (<Code>count</Code>, <Code>sum</Code>, <Code>avg</Code>, <Code>min</Code>,{' '}
            <Code>max</Code>) machen aus vielen Werten einen und übergehen NULL.
          </>,
          'GROUP BY bildet eine Ergebniszeile pro Gruppe. Im SELECT stehen nur gruppierte Spalten und Aggregate.',
          'WHERE filtert Zeilen vor dem Gruppieren, HAVING filtert Gruppen danach.',
          'Ausgewertet wird FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
        ]}
      />
    </>
  )
}
