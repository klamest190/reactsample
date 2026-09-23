import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Profi.code'

/**
 * CHAPTER 9.7 - Subqueries, CTEs & window functions (English version)
 */
export function Profi() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          The result of a query is a table again - and can be used in another query. Here the inner
          query returns the average price, the outer one compares every product with it:
        </P>
        <TryIt modus="sql" id="sql-profi-einstieg" {...beispiele['sql-profi-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Subqueries">
        <P>A subquery stands in parentheses and can appear in three places:</P>
        <Liste>
          <li>
            As <strong>one value</strong> (like above): it must then return exactly one row and one
            column.
          </li>
          <li>
            As a <strong>list</strong> after <Code>IN</Code>: one column, any number of rows.
          </li>
          <li>
            As a <strong>table</strong> after <Code>FROM</Code> - there is a more readable form for that
            in a moment.
          </li>
        </Liste>
        <TryIt modus="sql" id="sql-profi-in-exists" {...beispiele['sql-profi-in-exists']} />
        <P>
          <Code>EXISTS (…)</Code> only asks whether the subquery finds <em>any</em> row. The subquery may
          refer to the outer row (<Code>o.customer_id = c.id</Code>) - conceptually it runs once per
          customer. <Code>NOT EXISTS</Code> is the alternative to the <Code>LEFT JOIN … IS NULL</Code> from{' '}
          <Verweis id="sql-joins" />.
        </P>
      </Abschnitt>

      <Abschnitt titel="WITH: queries in steps">
        <P>
          Nested subqueries are read from the inside out - that quickly gets confusing. A{' '}
          <strong>CTE</strong> (common table expression) gives an intermediate result a name with{' '}
          <Code>WITH name AS (…)</Code>. The query then reads from top to bottom, like variables in a
          program:
        </P>
        <TryIt modus="sql" id="sql-profi-cte" {...beispiele['sql-profi-cte']} />
        <Hinweis variante="tipp">
          Several steps are separated by commas: <Code>WITH a AS (…), b AS (SELECT … FROM a) SELECT …</Code>.
          Every step may use the previous ones. That is how even long reports stay understandable.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Window functions">
        <P>
          <Code>GROUP BY</Code> collapses rows - the single products are gone afterwards. A{' '}
          <strong>window function</strong> also computes over several rows, but{' '}
          <strong>keeps every row</strong> and writes the result next to it. You recognise it by{' '}
          <Code>OVER</Code>:
        </P>
        <CodeBlock code={codeBloecke.window} titel="SQL" />
        <TryIt modus="sql" id="sql-profi-window" {...beispiele['sql-profi-window']} />
        <Liste>
          <li>
            <Code>rank()</Code>, <Code>dense_rank()</Code>, <Code>row_number()</Code> number rows -
            differently on ties.
          </li>
          <li>
            Every aggregate function becomes a window function with <Code>OVER</Code>:{' '}
            <Code>avg(price) OVER (PARTITION BY category)</Code> is the category’s average - next to every
            single product.
          </li>
          <li>
            With <Code>ORDER BY</Code> in the window, <Code>sum</Code> computes a running total, and{' '}
            <Code>lag()</Code> looks at the previous row:
          </li>
        </Liste>
        <TryIt modus="sql" id="sql-profi-laufend" {...beispiele['sql-profi-laufend']} />
      </Abschnitt>

      <Abschnitt titel="Views and UNION">
        <P>
          A query you need again and again is saved as a <strong>view</strong>. It behaves like a table
          but computes anew on every read - the data still only lives in the real tables:
        </P>
        <TryIt modus="sql" id="sql-profi-view" {...beispiele['sql-profi-view']} />
        <P>
          And if two results with the same columns should go <em>below each other</em>,{' '}
          <Code>UNION ALL</Code> helps:
        </P>
        <CodeBlock code={codeBloecke.union} titel="SQL" />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="sql"
          id="sql-profi-uebung"
          {...beispiele['sql-profi-uebung']}
          aufgabe={
            <p>
              The CTE <Code>revenue</Code> already computes every customer’s revenue. Show only the{' '}
              <strong>customer with the highest revenue</strong> per country: <Code>country</Code>,{' '}
              <Code>name</Code>, <Code>revenue</Code>, sorted by country.
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
            frage: "WHERE price = (SELECT price FROM products WHERE category = 'books') - what happens?",
            antworten: [
              'All products that cost as much as any book',
              'An error: the subquery returns more than one row',
              'Only the first book is compared',
              'An empty result',
            ],
            richtig: 1,
            erklaerung: 'With = the subquery must return exactly one value. A list needs IN.',
          },
          {
            frage: 'What is the difference between sum(revenue) with GROUP BY and sum(revenue) OVER ()?',
            antworten: [
              'None',
              'GROUP BY collapses the rows, OVER () keeps every row and writes the sum next to it',
              'OVER () is faster',
              'OVER () only works with ORDER BY',
            ],
            richtig: 1,
            erklaerung: 'Window functions compute over other rows without collapsing them.',
          },
          {
            frage: 'What is WITH for?',
            antworten: [
              'It creates a permanent table',
              'It names an intermediate query, so the query is built in readable steps',
              'It starts a transaction',
              'It joins two tables',
            ],
            richtig: 1,
            erklaerung: 'A CTE only applies to the one query. To keep a query permanently, use CREATE VIEW.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Subqueries return a value, a list (IN) or a table; EXISTS only asks whether there are rows.',
          <>
            <Code>WITH name AS (…)</Code> splits long queries into named steps.
          </>,
          <>
            Window functions (<Code>… OVER (PARTITION BY … ORDER BY …)</Code>) compute over other rows and
            keep every row: rankings, running totals, comparisons with the previous row.
          </>,
          <>
            <Code>CREATE VIEW</Code> saves a query under a name, <Code>UNION ALL</Code> stacks results.
          </>,
        ]}
      />
    </>
  )
}
