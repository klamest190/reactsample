import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Tabellen.code'

/**
 * CHAPTER 9.6 - Designing tables: CREATE TABLE (English version)
 */
export function Tabellen() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          So far the tables were ready-made. Now you create one yourself: for product reviews, with
          keys to products and customers and a rule that there are only 1 to 5 stars.
        </P>
        <TryIt modus="sql" id="sql-tabellen-einstieg" {...beispiele['sql-tabellen-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="How CREATE TABLE is built">
        <CodeBlock code={codeBloecke.aufbau} titel="SQL" />
        <P>
          Every column has a name, a <strong>type</strong> and optional rules. The type is strict: no
          text fits into an <Code>integer</Code> column, no “February 31st” into a <Code>date</Code>{' '}
          column. The most important types:
        </P>
        <Tabelle
          kopf={['Type', 'For', 'Example']}
          spalten={['font-mono', undefined, 'font-mono']}
          dicht
          zeilen={[
            ['integer / bigint', 'Whole numbers, keys (bigint for very many rows)', '42'],
            ['numeric(10, 2)', 'Money and everything that must be exact', '19.90'],
            ['real / double precision', 'Measurements - fast, but with rounding errors', '0.1'],
            ['text / varchar(n)', 'Text; in PostgreSQL text is the normal case', "'Ada'"],
            ['boolean', 'Yes/no', 'true'],
            ['date', 'A date without time', "'2026-09-23'"],
            ['timestamptz', 'A point in time with time zone - for “when did it happen”', 'now()'],
            ['jsonb', 'Flexible extra data as JSON', `'{"color": "red"}'`],
            ['uuid', 'Globally unique ids', 'gen_random_uuid()'],
          ]}
        />
        <Hinweis variante="warnung">
          Never store money as <Code>real</Code> or <Code>double precision</Code>: 0.1 cannot be
          represented exactly, ten times 0.10 is not exactly 1. <Code>numeric</Code> computes exactly -
          like <Code>BigDecimal</Code> in Java.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Keys and rules">
        <Liste>
          <li>
            <Code>PRIMARY KEY</Code> - unique and never NULL. Usually an artificial <Code>id</Code> with{' '}
            <Code>GENERATED ALWAYS AS IDENTITY</Code>: the database counts up by itself. (Older projects
            write <Code>serial</Code> - that does almost the same.)
          </li>
          <li>
            <Code>REFERENCES table (column)</Code> - a foreign key: the value must exist there. With{' '}
            <Code>ON DELETE CASCADE</Code> dependent rows are deleted too (like for{' '}
            <Code>order_items</Code>), without it the delete is refused.
          </li>
          <li>
            <Code>NOT NULL</Code> - a required field. <Code>UNIQUE</Code> - no value twice.{' '}
            <Code>CHECK (…)</Code> - a condition every row must meet.
          </li>
          <li>
            <Code>DEFAULT …</Code> - the value if the INSERT brings none.
          </li>
        </Liste>
        <TryIt modus="sql" id="sql-tabellen-check" {...beispiele['sql-tabellen-check']} />
        <P>
          Rule of thumb: every rule that must <em>always</em> hold belongs (also) in the database. The
          backend checks for nice error messages, the database for safety.
        </P>
      </Abschnitt>

      <Abschnitt titel="Changing tables: ALTER TABLE">
        <P>
          Applications grow, and tables with them. <Code>ALTER TABLE</Code> adds columns, renames,
          adds rules - without losing the existing data:
        </P>
        <TryIt modus="sql" id="sql-tabellen-alter" {...beispiele['sql-tabellen-alter']} />
        <P>
          <Code>DROP TABLE name</Code> deletes a table with its content, <Code>DROP COLUMN</Code> a
          column. Neither can be undone - except in a transaction, because in PostgreSQL{' '}
          <Code>CREATE</Code>, <Code>ALTER</Code> and <Code>DROP</Code> are all or nothing too.
        </P>
      </Abschnitt>

      <Abschnitt titel="Searching faster: indexes">
        <P>
          Without help, PostgreSQL reads the whole table for <Code>WHERE customer_id = 42</Code>. An{' '}
          <strong>index</strong> is like the index of a book: sorted pointers that let you jump straight
          to the right place. <Code>EXPLAIN</Code> shows which way the database plans to take:
        </P>
        <TryIt modus="sql" id="sql-tabellen-index" {...beispiele['sql-tabellen-index']} />
        <Liste>
          <li>
            <Code>Seq Scan</Code> means: read all 200,000 rows. With the index PostgreSQL jumps straight
            to the 40 matches via a <Code>Bitmap Index Scan</Code> - the estimated cost drops from about
            3,800 to about 140.
          </li>
          <li>
            Primary keys and <Code>UNIQUE</Code> columns get an index automatically. For foreign keys
            and frequently filtered columns you create it yourself.
          </li>
          <li>
            Indexes take space and make every INSERT and UPDATE a little slower. So create them
            deliberately - where <Code>EXPLAIN</Code> shows an expensive <Code>Seq Scan</Code>.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="And in Spring Boot?">
        <P>
          A JPA entity (<Verweis id="spring-daten" />) is the Java side of a table. The annotations
          correspond to what you write here in SQL:
        </P>
        <CodeBlock code={codeBloecke.entity} titel="Review.java" />
        <P>
          In the course Hibernate creates the tables itself at startup (<Code>ddl-auto</Code>). In real
          projects you rather write the SQL yourself, as numbered <strong>migrations</strong> that a tool
          like Flyway or Liquibase runs in order at startup - so every change to the schema is
          versioned and the same on every database:
        </P>
        <CodeBlock code={codeBloecke.migration} titel="V2__add_reviews.sql" />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="sql"
          id="sql-tabellen-uebung"
          {...beispiele['sql-tabellen-uebung']}
          aufgabe={
            <>
              <p>
                Customers should be able to remember products. Create the table <Code>wishlist</Code>:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>customer_id</Code> and <Code>product_id</Code> (integer, required), foreign keys to{' '}
                  <Code>customers</Code> and <Code>products</Code>
                </li>
                <li>
                  <Code>added</Code> (date, required), today’s date by default
                </li>
                <li>A product is on a customer’s list at most once: a primary key made of both ids</li>
              </ul>
              <p className="mt-1">Then record that Ada (1) wishes for the headphones (6).</p>
            </>
          }
          tipps={{
            de: [
              'Eine Spalte mit Fremdschlüssel: `customer_id integer NOT NULL REFERENCES customers (id)`.',
              'Das heutige Datum als Standard: `DEFAULT current_date`.',
              'Ein Schlüssel aus zwei Spalten steht als eigene Zeile am Ende: `PRIMARY KEY (customer_id, product_id)`.',
            ],
            en: [
              'A column with a foreign key: `customer_id integer NOT NULL REFERENCES customers (id)`.',
              'Today’s date as the default: `DEFAULT current_date`.',
              'A key made of two columns is a separate line at the end: `PRIMARY KEY (customer_id, product_id)`.',
            ],
          }}
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Which type fits the price of a product?',
            antworten: ['real', 'integer', 'numeric(10, 2)', 'text'],
            richtig: 2,
            erklaerung: 'numeric computes exactly. real has rounding errors, integer knows no cents, text cannot be computed with.',
          },
          {
            frage: 'order_items.order_id has ON DELETE CASCADE. What happens when an order is deleted?',
            antworten: ['The delete is refused', 'The line items are deleted too', 'The line items get order_id NULL', 'Nothing - the line items stay unchanged'],
            richtig: 1,
            erklaerung: 'CASCADE deletes dependent rows too. Without it, PostgreSQL would refuse the delete with a foreign key error.',
          },
          {
            frage: 'EXPLAIN shows “Seq Scan” on a big table. What does that mean?',
            antworten: [
              'The query has an error',
              'PostgreSQL reads the whole table - maybe an index is missing',
              'The table is sorted',
              'The query was answered from the cache',
            ],
            richtig: 1,
            erklaerung: 'A Seq Scan reads every row. For small tables that is right; for big tables and few matches an index helps.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>CREATE TABLE name (column type rules, …)</Code> - money as <Code>numeric</Code>, points in
            time as <Code>timestamptz</Code>, text as <Code>text</Code>.
          </>,
          <>
            <Code>GENERATED ALWAYS AS IDENTITY PRIMARY KEY</Code> for ids, <Code>REFERENCES</Code> for
            foreign keys, plus <Code>NOT NULL</Code>, <Code>UNIQUE</Code>, <Code>CHECK</Code>,{' '}
            <Code>DEFAULT</Code>.
          </>,
          'Rules that must always hold belong in the database.',
          <>
            <Code>ALTER TABLE</Code> changes tables that hold data; in projects as a versioned migration.
          </>,
          <>
            An index speeds up searches; <Code>EXPLAIN</Code> shows whether it is used.
          </>,
        ]}
      />
    </>
  )
}
