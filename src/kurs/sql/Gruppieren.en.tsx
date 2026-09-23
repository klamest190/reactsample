import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { EvaluationOrder } from '../demos/SqlDiagrams'
import { beispiele, codeBloecke } from './Gruppieren.code'

/**
 * CHAPTER 9.3 - Counting & grouping (English version)
 */
export function Gruppieren() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          So far every row of the table came out on its own. For reports - how many, how much, on
          average - <Code>GROUP BY</Code> combines rows with the same value into <strong>one</strong>{' '}
          result row, and functions like <Code>count</Code> compute over every group:
        </P>
        <TryIt modus="sql" id="sql-gruppieren-einstieg" {...beispiele['sql-gruppieren-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Aggregate functions">
        <P>
          An <strong>aggregate function</strong> turns many values into one - like <Code>reduce</Code>{' '}
          in JavaScript (<Verweis id="js-arrays" />). Without <Code>GROUP BY</Code> the whole table is a
          single group:
        </P>
        <TryIt modus="sql" id="sql-gruppieren-aggregate" {...beispiele['sql-gruppieren-aggregate']} />
        <CodeBlock code={codeBloecke.funktionen} titel="SQL" />
        <Liste>
          <li>
            <Code>count(*)</Code> counts rows, <Code>count(column)</Code> only those where the column is
            not NULL - here 16 versus 11.
          </li>
          <li>
            <Code>sum</Code>, <Code>avg</Code>, <Code>min</Code> and <Code>max</Code> skip NULL too. So
            the average stock only uses the 11 products that have one.
          </li>
          <li>
            <Code>avg</Code> returns many decimal places - <Code>round(value, 2)</Code> rounds.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="GROUP BY: one row per group">
        <P>
          With <Code>GROUP BY status</Code> there is one group per status; the aggregate functions then
          compute per group. The second example is the heart of every shop report: the value of an
          order is the sum of quantity times unit price of its line items.
        </P>
        <TryIt modus="sql" id="sql-gruppieren-group-by" {...beispiele['sql-gruppieren-group-by']} />
        <P>
          The most important rule: after <Code>SELECT</Code> there may only be what is{' '}
          <strong>unique per group</strong> - the grouped columns and aggregates. Which name should be
          in the one row “books”? There are three.
        </P>
        <TryIt modus="sql" id="sql-gruppieren-fehler" {...beispiele['sql-gruppieren-fehler']} />
        <Hinweis variante="info">
          The message says exactly what to do: either add <Code>name</Code> to <Code>GROUP BY</Code>{' '}
          (then there is one group per category <em>and</em> name) or wrap it in an aggregate, e.g.{' '}
          <Code>string_agg(name, ', ')</Code> or <Code>min(name)</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="HAVING: filtering groups">
        <P>
          <Code>WHERE</Code> filters <strong>rows before</strong> grouping. If a condition is about the
          group itself - “at least two orders” - the group does not even exist yet at that point. That
          is what <Code>HAVING</Code> is for: a filter <strong>after</strong> grouping.
        </P>
        <TryIt modus="sql" id="sql-gruppieren-having" {...beispiele['sql-gruppieren-having']} />
      </Abschnitt>

      <Abschnitt titel="In which order is it computed?">
        <P>
          A query is written with <Code>SELECT</Code> first, but evaluated in a different order. If you
          know it, you understand almost every error message:
        </P>
        <EvaluationOrder />
        <P>
          <Code>SELECT</Code> only comes fifth. That is why <Code>WHERE</Code> does not know an alias
          from the SELECT yet - <Code>ORDER BY</Code>, on the other hand, does:
        </P>
        <TryIt modus="sql" id="sql-gruppieren-alias" {...beispiele['sql-gruppieren-alias']} />
        <P>
          The fix (behind “Show solution”): repeat the expression. For long expressions a subquery or{' '}
          <Code>WITH</Code> helps - that follows in <Verweis id="sql-profi" />.
        </P>
      </Abschnitt>

      <Abschnitt titel="Grouping by time">
        <P>
          Reports often group by month or year. <Code>to_char(date, 'YYYY-MM')</Code> turns a date into
          the month as text, <Code>extract(year FROM date)</Code> fetches a part as a number. And{' '}
          <Code>string_agg</Code> combines the texts of a group:
        </P>
        <TryIt modus="sql" id="sql-gruppieren-zeit" {...beispiele['sql-gruppieren-zeit']} />
        <Hinweis variante="info">
          <Code>GROUP BY month</Code> with the alias from the SELECT is a convenience of PostgreSQL.
          Portable would be <Code>GROUP BY to_char(ordered_at, 'YYYY-MM')</Code> or{' '}
          <Code>GROUP BY 1</Code> (the first column).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="sql"
          id="sql-gruppieren-uebung"
          {...beispiele['sql-gruppieren-uebung']}
          aufgabe={
            <p>
              Which orders are worth <strong>more than 400 €</strong>? Show <Code>order_id</Code> and{' '}
              <Code>total</Code> (sum of <Code>quantity * unit_price</Code>), the highest value first,
              ties by <Code>order_id</Code>.
            </p>
          }
          tipps={{
            de: ['Eine Zeile pro Bestellung: `GROUP BY order_id` und `sum(quantity * unit_price)`.', 'Die Bedingung betrifft die Summe - sie gehört in `HAVING`, nicht in `WHERE`.', '`ORDER BY total DESC, order_id`'],
            en: ['One row per order: `GROUP BY order_id` and `sum(quantity * unit_price)`.', 'The condition is about the sum - it belongs in `HAVING`, not in `WHERE`.', '`ORDER BY total DESC, order_id`'],
          }}
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'The column email is NULL for one of 12 customers. What does count(email) return?',
            antworten: ['12', '11', '1', 'NULL'],
            richtig: 1,
            erklaerung: 'count(column) only counts values that are not NULL. count(*) would return 12.',
          },
          {
            frage: 'Where does the condition “groups with more than 5 rows” go?',
            antworten: ['In WHERE', 'In HAVING', 'In GROUP BY', 'In ORDER BY'],
            richtig: 1,
            erklaerung: 'WHERE runs before grouping and does not know count(*) yet. HAVING filters the finished groups.',
          },
          {
            frage: 'Why does WHERE gross > 100 fail if gross is an alias from the SELECT?',
            antworten: [
              'Aliases must not contain numbers',
              'WHERE is evaluated before SELECT - the alias does not exist yet',
              'Aliases only apply in GROUP BY',
              'The alias has to be put in quotes',
            ],
            richtig: 1,
            erklaerung: 'Evaluation: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. The alias only exists from SELECT on.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Aggregate functions (<Code>count</Code>, <Code>sum</Code>, <Code>avg</Code>, <Code>min</Code>,{' '}
            <Code>max</Code>) turn many values into one and skip NULL.
          </>,
          'GROUP BY builds one result row per group. The SELECT may only contain grouped columns and aggregates.',
          'WHERE filters rows before grouping, HAVING filters groups afterwards.',
          'Evaluation order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
        ]}
      />
    </>
  )
}
