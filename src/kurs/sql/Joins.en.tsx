import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { JoinComparison, SchemaDiagram } from '../demos/SqlDiagrams'
import { beispiele, codeBloecke } from './Joins.code'

/**
 * CHAPTER 9.4 - Joining tables: JOIN (English version)
 */
export function Joins() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          <Code>orders</Code> only holds the <Code>customer_id</Code> - the customer’s name is in{' '}
          <Code>customers</Code>. A <Code>JOIN</Code> puts the matching rows of both tables side by
          side:
        </P>
        <TryIt modus="sql" id="sql-joins-einstieg" {...beispiele['sql-joins-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Why the data is spread out">
        <P>
          You could write the customer’s name into every order. Then “Grace Hopper” would be in{' '}
          <Code>orders</Code> four times - and if her name changed, you would have to find all four
          places. That is why relational databases store every piece of information{' '}
          <strong>exactly once</strong> and point to it with keys. This is called{' '}
          <strong>normalization</strong>.
        </P>
        <SchemaDiagram />
        <Liste>
          <li>
            <strong>1 : n</strong> - one customer, many orders. The foreign key sits on the “many”
            side: <Code>orders.customer_id</Code>.
          </li>
          <li>
            <strong>n : m</strong> - an order contains many products, a product is part of many orders.
            That needs a table in between: <Code>order_items</Code> with two foreign keys (and the
            quantity as an extra).
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="JOIN … ON">
        <CodeBlock code={codeBloecke.syntax} titel="SQL" />
        <P>
          <Code>ON</Code> says which rows belong together. The short names <Code>o</Code> and{' '}
          <Code>c</Code> are <strong>aliases</strong> - at the latest when two tables have a column{' '}
          <Code>id</Code>, you have to say which one you mean anyway. What happens without{' '}
          <Code>ON</Code>?
        </P>
        <TryIt modus="sql" id="sql-joins-ohne-on" {...beispiele['sql-joins-ohne-on']} />
        <P>
          Without a condition the database combines <strong>every</strong> row with{' '}
          <strong>every</strong> row (a cross product): 20 orders × 12 customers = 240 rows. A JOIN is
          conceptually exactly that - followed by a filter that keeps only the matching pairs. A
          forgotten <Code>ON</Code> shows up as a suddenly huge result.
        </P>
      </Abschnitt>

      <Abschnitt titel="LEFT JOIN: even without a partner">
        <P>
          A plain <Code>JOIN</Code> (more precisely: <Code>INNER JOIN</Code>) only returns rows that have
          a partner on <strong>both</strong> sides. Margaret Hamilton and Niklaus Wirth never ordered -
          they are missing. <Code>LEFT JOIN</Code> keeps every row of the left table and fills the right
          side with NULL:
        </P>
        <JoinComparison />
        <TryIt modus="sql" id="sql-joins-left" {...beispiele['sql-joins-left']} />
        <P>
          The second query is a standard pattern: <Code>LEFT JOIN</Code> plus{' '}
          <Code>WHERE right.id IS NULL</Code> finds everything that has <strong>no</strong> partner -
          customers without an order, products that were never sold.
        </P>
        <CodeBlock code={codeBloecke.arten} titel="SQL" />
      </Abschnitt>

      <Abschnitt titel="Across several tables">
        <P>
          JOINs can be chained. Every further <Code>JOIN</Code> attaches a table to the intermediate
          result so far - here once across the whole database:
        </P>
        <TryIt modus="sql" id="sql-joins-kette" {...beispiele['sql-joins-kette']} />
        <P>
          Together with <Code>GROUP BY</Code> (<Verweis id="sql-gruppieren" />) this gives real reports,
          such as the revenue per customer:
        </P>
        <TryIt modus="sql" id="sql-joins-auswertung" {...beispiele['sql-joins-auswertung']} />
        <Hinweis variante="info">
          <Code>count(DISTINCT o.id)</Code> instead of <Code>count(*)</Code>: after the JOIN with{' '}
          <Code>order_items</Code> every order appears as often as it has line items. But we want to
          count orders, not line items.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Two traps with LEFT JOIN">
        <P>
          <strong>Counting correctly:</strong> with <Code>LEFT JOIN</Code> a customer without an order
          also has a row (with NULL). <Code>count(*)</Code> counts that row - <Code>count(o.id)</Code>{' '}
          skips NULL and returns the correct 0:
        </P>
        <TryIt modus="sql" id="sql-joins-zaehlen" {...beispiele['sql-joins-zaehlen']} />
        <P>
          <strong>Conditions in the right place:</strong> a condition on the right table in{' '}
          <Code>WHERE</Code> throws the NULL rows out again - the LEFT JOIN silently becomes an INNER
          JOIN. If the left side should stay complete, the condition belongs in <Code>ON</Code>:
        </P>
        <CodeBlock code={codeBloecke.falle} titel="SQL" />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="sql"
          id="sql-joins-uebung"
          {...beispiele['sql-joins-uebung']}
          aufgabe={
            <p>
              Which products have <strong>never been ordered</strong>? Show <Code>name</Code> and{' '}
              <Code>category</Code>, sorted by name.
            </p>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Which table holds the foreign key for “a customer has many orders”?',
            antworten: ['customers', 'orders', 'Both', 'A separate table'],
            richtig: 1,
            erklaerung: 'The foreign key sits on the “many” side: every order remembers its one customer (customer_id).',
          },
          {
            frage: '12 customers, 20 orders, 2 customers without an order. How many rows does customers JOIN orders return?',
            antworten: ['12', '20', '22', '240'],
            richtig: 1,
            erklaerung: 'The INNER JOIN returns every matching pair - one row per order. The customers without an order are missing; a LEFT JOIN would return 22.',
          },
          {
            frage: 'A query with JOIN suddenly returns thousands of rows. What is the most likely reason?',
            antworten: ['An index is missing', 'The ON condition is missing or joins the wrong columns', 'LIMIT is missing', 'A GROUP BY is missing'],
            richtig: 1,
            erklaerung: 'Without a matching ON condition every row is combined with every row (cross product).',
          },
        ]}
      />

      <Merke
        punkte={[
          'Every piece of information is stored once; foreign keys point to it. n:m relationships need a table in between.',
          <>
            <Code>JOIN b ON b.id = a.b_id</Code> connects matching rows; aliases (<Code>o</Code>,{' '}
            <Code>c</Code>) keep it short and unambiguous.
          </>,
          'INNER JOIN returns only rows with a partner, LEFT JOIN every row of the left table (NULL on the right).',
          <>
            <Code>LEFT JOIN … WHERE right.id IS NULL</Code> finds everything without a partner.
          </>,
          <>
            With LEFT JOIN count with <Code>count(right.id)</Code> instead of <Code>count(*)</Code> and put
            conditions on the right table into <Code>ON</Code>.
          </>,
        ]}
      />
    </>
  )
}
