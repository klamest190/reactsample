import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Aendern.code'

/**
 * CHAPTER 9.5 - Changing data & transactions (English version)
 */
export function Aendern() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          Reading is only half the story. Three commands change data: <Code>INSERT</Code> adds rows,{' '}
          <Code>UPDATE</Code> changes them, <Code>DELETE</Code> removes them. With{' '}
          <Code>RETURNING</Code> you get the affected rows back right away:
        </P>
        <TryIt modus="sql" id="sql-aendern-einstieg" {...beispiele['sql-aendern-einstieg']} />
        <Hinweis variante="info">
          Here every run starts with fresh tables - press Run twice, and Radia gets id 13 both times.
          In a real database every change stays until someone undoes it. That is exactly why the rest
          of this chapter is worth it.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="INSERT">
        <CodeBlock code={codeBloecke.formen} titel="SQL" />
        <P>
          Always name the columns - then the order of the values is clear, and a column added later
          breaks nothing. Columns that are left out get their <Code>DEFAULT</Code> (the{' '}
          <Code>id</Code> counts up, <Code>joined</Code> becomes today) or NULL. Separate several rows
          with commas:
        </P>
        <TryIt modus="sql" id="sql-aendern-insert" {...beispiele['sql-aendern-insert']} />
        <P>
          <Code>RETURNING</Code> is a PostgreSQL speciality you need all the time: a backend that
          creates a customer wants to return the new <Code>id</Code> (<Verweis id="spring-rest" />).
          Without RETURNING that would take a second query.
        </P>
      </Abschnitt>

      <Abschnitt titel="UPDATE and DELETE">
        <TryIt modus="sql" id="sql-aendern-update" {...beispiele['sql-aendern-update']} />
        <P>
          Computing with the old value is allowed: <Code>SET price = price * 1.10</Code>. The price is
          declared as <Code>numeric(8, 2)</Code>, so PostgreSQL rounds the result to two places by
          itself.
        </P>
        <TryIt modus="sql" id="sql-aendern-delete" {...beispiele['sql-aendern-delete']} />
        <Hinweis variante="warnung">
          <Code>UPDATE</Code> and <Code>DELETE</Code> <strong>without WHERE</strong> hit every row of
          the table - without asking. Make it a habit to test the <Code>WHERE</Code> with a{' '}
          <Code>SELECT</Code> first and then replace <Code>SELECT *</Code> with <Code>UPDATE … SET</Code>{' '}
          or <Code>DELETE</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Constraints keep watch">
        <P>
          The tables have rules (<Code>\d orders</Code> shows them). If a change breaks one, PostgreSQL
          rejects it - the data stays as it was. Ada still has orders, so she must not be deleted:
        </P>
        <TryIt modus="sql" id="sql-aendern-fremdschluessel" {...beispiele['sql-aendern-fremdschluessel']} />
        <P>The messages always follow the same pattern - which rule, which table:</P>
        <CodeBlock code={codeBloecke.fehler} titel="psql" />
        <P>
          These rules are not an obstacle but the last line of defence: even if a check is missing in
          the backend (<Verweis id="spring-fehler" />), no broken data gets into the database.
        </P>
      </Abschnitt>

      <Abschnitt titel="Transactions: all or nothing">
        <P>
          Creating an order takes three steps: the order, its line items, the new stock. If something
          fails after the second step, the goods would be sold but still in stock. A{' '}
          <strong>transaction</strong> bundles steps that only count together:
        </P>
        <TryIt modus="sql" id="sql-aendern-transaktion" {...beispiele['sql-aendern-transaktion']} />
        <Liste>
          <li>
            <Code>BEGIN</Code> starts the transaction. Other connections only see the changes after the{' '}
            <Code>COMMIT</Code> - then all at once.
          </li>
          <li>
            <Code>ROLLBACK</Code> discards everything since <Code>BEGIN</Code>. If a statement fails,
            PostgreSQL accepts no further ones until the ROLLBACK (“current transaction is aborted”).
          </li>
          <li>
            Without <Code>BEGIN</Code> every single statement is its own small transaction
            (“autocommit”).
          </li>
        </Liste>
        <P>ROLLBACK is also a safety net for trying things out:</P>
        <TryIt modus="sql" id="sql-aendern-rollback" {...beispiele['sql-aendern-rollback']} />
        <P>
          In Spring, <Code>@Transactional</Code> takes care of <Code>BEGIN</Code> and{' '}
          <Code>COMMIT</Code> - and of the <Code>ROLLBACK</Code> when the method ends with an exception
          (<Verweis id="spring-daten" />).
        </P>
      </Abschnitt>

      <Abschnitt titel="Insert or update: ON CONFLICT">
        <P>
          Sometimes you do not know whether the row already exists - for example when importing a
          customer list. <Code>INSERT … ON CONFLICT</Code> (“upsert”) says what should happen with a
          duplicate key: <Code>DO NOTHING</Code> or <Code>DO UPDATE</Code>. <Code>excluded</Code> is the
          row that was supposed to be inserted:
        </P>
        <TryIt modus="sql" id="sql-aendern-upsert" {...beispiele['sql-aendern-upsert']} />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="sql"
          id="sql-aendern-uebung"
          {...beispiele['sql-aendern-uebung']}
          aufgabe={
            <p>
              Book week in the shop: make <strong>all books 10 % cheaper</strong>. Then add the new book{' '}
              <Code>PostgreSQL Pocket Guide</Code> (category <Code>books</Code>, 19.90 €, 30 in stock) at
              the full price. The other products must not change.
            </p>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What happens with UPDATE products SET stock = 0; ?',
            antworten: ['PostgreSQL asks for confirmation', 'An error, because WHERE is missing', 'Every product has a stock of 0 afterwards', 'Only the first product is changed'],
            richtig: 2,
            erklaerung: 'Without WHERE an UPDATE applies to all rows. There is no confirmation - only a ROLLBACK in an open transaction can still save you.',
          },
          {
            frage: 'What is RETURNING for?',
            antworten: ['It undoes the change', 'It returns the inserted or changed rows', 'It ends the transaction', 'It returns the number of rows'],
            richtig: 1,
            erklaerung: 'RETURNING returns the affected rows - such as the new id after an INSERT - without a second query.',
          },
          {
            frage: 'Between BEGIN and COMMIT the third of four statements fails. What holds?',
            antworten: [
              'The first two are saved',
              'The first two and the fourth are saved',
              'Nothing is saved - the transaction has to be rolled back',
              'PostgreSQL skips the failing statement',
            ],
            richtig: 2,
            erklaerung: 'All or nothing: after an error the transaction accepts no more statements and ends with a ROLLBACK.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>INSERT INTO t (columns) VALUES (…)</Code>, <Code>UPDATE t SET … WHERE …</Code>,{' '}
            <Code>DELETE FROM t WHERE …</Code> - with <Code>RETURNING</Code> the rows come back.
          </>,
          'UPDATE and DELETE without WHERE hit every row. Test the WHERE with a SELECT first.',
          'Constraints (NOT NULL, UNIQUE, CHECK, foreign keys) reject wrong changes.',
          <>
            <Code>BEGIN</Code> … <Code>COMMIT</Code>: all or nothing. <Code>ROLLBACK</Code> discards.
          </>,
          <>
            <Code>ON CONFLICT … DO UPDATE / DO NOTHING</Code> inserts or updates.
          </>,
        ]}
      />
    </>
  )
}
