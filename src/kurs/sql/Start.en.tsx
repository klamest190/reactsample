import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { SchemaDiagram } from '../demos/SqlDiagrams'
import { beispiele, codeBloecke } from './Start.code'

/**
 * CHAPTER 9.1 - Tables & SELECT (English version)
 */
export function Start() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          Below runs a real <strong>PostgreSQL</strong> - the same database as on a server, just as
          WebAssembly in the browser. It holds a small online shop with customers, products and
          orders. Change the query and press <Code>Ctrl+Enter</Code>: every run starts with fresh
          tables, so you cannot break anything.
        </P>
        <TryIt modus="sql" id="sql-start-einstieg" {...beispiele['sql-start-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Why a database?">
        <P>
          In the business app (<Verweis id="praxis-business" />) the customers lived in a JavaScript
          array - after a reload every change was gone. A backend needs a place where data stays{' '}
          <strong>permanently</strong>, where many users can read and write{' '}
          <strong>at the same time</strong> and which enforces <strong>rules</strong> (“every order
          belongs to a customer”). That is a database.
        </P>
        <P>
          A <strong>relational</strong> database stores data in <strong>tables</strong>: every{' '}
          <strong>row</strong> is a record (one customer), every <strong>column</strong> a property
          with a fixed type (<Code>name</Code> is text, <Code>joined</Code> a date). It looks like a
          spreadsheet, but is much stricter - and that is exactly what makes it reliable.
        </P>
        <P>
          You talk to it in <strong>SQL</strong> (Structured Query Language). SQL is{' '}
          <strong>declarative</strong>, like React: you describe <em>which</em> result you want, not{' '}
          <em>how</em> the database finds it. No loop, no <Code>filter</Code> - the database picks the
          fastest way itself.
        </P>
        <Hinweis variante="info">
          <strong>PostgreSQL</strong> (“Postgres”) is a free and very widely used database. The basics
          of this part apply almost word for word to MySQL, SQL Server or SQLite - where Postgres goes
          its own way, it says so.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The example database">
        <SchemaDiagram />
        <P>
          Four tables that belong together: a customer has many orders, an order has many line items,
          every line item points to a product. The connection works through keys:
        </P>
        <Liste>
          <li>
            The <strong>primary key</strong> (<Code>id</Code>, underlined) makes every row unique. Two
            customers may have the same name, but never the same id.
          </li>
          <li>
            A <strong>foreign key</strong> like <Code>orders.customer_id</Code> points to the primary
            key of another table. The database makes sure the customer really exists.
          </li>
        </Liste>
        <P>
          Above every SQL editor you can unfold the tables. Even faster are the{' '}
          <strong>meta commands</strong> of <Code>psql</Code>, PostgreSQL’s command-line tool. They
          start with a backslash:
        </P>
        <TryIt modus="sql" id="sql-start-erkunden" {...beispiele['sql-start-erkunden']} />
        <P>
          <Code>\d products</Code> shows the columns with their type, whether they are required (
          <Code>not null</Code>) and below that the table’s rules: primary key, checks (
          <Code>CHECK</Code>), foreign keys. How to create such tables yourself follows in{' '}
          <Verweis id="sql-tabellen" />.
        </P>
      </Abschnitt>

      <Abschnitt titel="SELECT: choosing columns">
        <P>Every query has the same basic shape - the parts always come in this order:</P>
        <CodeBlock code={codeBloecke.syntax} titel="SQL" />
        <P>
          After <Code>SELECT</Code> there can be not only columns but any <strong>expressions</strong>:
          calculations, texts, functions. <Code>AS</Code> gives a result column a name.{' '}
          <Code>||</Code> joins texts.
        </P>
        <TryIt modus="sql" id="sql-start-select" {...beispiele['sql-start-select']} />
        <Hinweis variante="warnung">
          <Code>SELECT *</Code> is handy for exploring. In an application you name the columns: if a
          column is added later, the result would otherwise change silently - and more data is sent
          than needed.
        </Hinweis>
        <P>A few rules almost everyone stumbles over at first:</P>
        <CodeBlock code={codeBloecke.regeln} titel="SQL" />
        <Liste>
          <li>
            <strong>Single</strong> quotes for text: <Code>'UK'</Code>. Double quotes are for names of
            columns and tables - <Code>"UK"</Code> would be a column called UK.
          </li>
          <li>
            Keywords are usually written in upper case, tables and columns in lower case with
            underscores (<Code>order_items</Code>). It is not required, but reads better.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Sorting and limiting">
        <P>
          Without <Code>ORDER BY</Code> a result has <strong>no guaranteed order</strong>. Often the
          rows come in insertion order - until the table grows or something changes. If you need an
          order, write it down.
        </P>
        <TryIt modus="sql" id="sql-start-sortieren" {...beispiele['sql-start-sortieren']} />
        <Liste>
          <li>
            <Code>ORDER BY price DESC, name</Code>: first by price descending, with the same price by
            name ascending (<Code>ASC</Code> is the default).
          </li>
          <li>
            <Code>LIMIT 5</Code> returns at most five rows, <Code>OFFSET 10</Code> skips the first ten
            - that is how you page through results.
          </li>
          <li>
            <Code>DISTINCT</Code> removes duplicate rows from the result.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="PostgreSQL on your machine">
        <P>
          Here PostgreSQL runs in the browser. On your machine the easiest way is Docker (
          <Verweis id="docker-start" />), then open <Code>psql</Code> inside it:
        </P>
        <CodeBlock code={codeBloecke.docker} titel="Terminal" />
        <CodeBlock code={codeBloecke.psql} titel="psql" />
        <P>
          If you prefer clicking: <strong>pgAdmin</strong>, <strong>DBeaver</strong> or the PostgreSQL
          extension for VS Code show tables and results graphically. The queries are the same. Spring
          Boot connects to exactly such a database - there JPA writes the SQL for you (
          <Verweis id="spring-daten" />). If you can read it, you also understand what JPA does.
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="sql"
          id="sql-start-uebung"
          {...beispiele['sql-start-uebung']}
          aufgabe={
            <p>
              For the shop’s home page: show the <strong>five most expensive products</strong> - only{' '}
              <Code>name</Code> and <Code>price</Code>, the most expensive first.
            </p>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What makes a row in a table unique?',
            antworten: ['Its position in the table', 'The primary key', 'The first text column', 'The order of insertion'],
            richtig: 1,
            erklaerung: 'The primary key (usually id) is different in every row - that is how you recognise it, and what foreign keys point to.',
          },
          {
            frage: 'SELECT name FROM customers - in which order do the rows come?',
            antworten: ['By id', 'Alphabetically', 'In no guaranteed order', 'In the order of the last ORDER BY'],
            richtig: 2,
            erklaerung: 'Without ORDER BY the order is not defined. It can change as soon as the table changes.',
          },
          {
            frage: "What does SELECT \"country\" FROM customers return compared to SELECT 'country' FROM customers?",
            antworten: [
              'Both are the same',
              'The first the column country, the second twelve times the text country',
              'The first is an error',
              'The second the column, the first the text',
            ],
            richtig: 1,
            erklaerung: 'Double quotes denote names (columns, tables), single quotes are text values.',
          },
        ]}
      />

      <Merke
        punkte={[
          'A relational database stores tables with rows and typed columns; primary and foreign keys connect them.',
          <>
            Basic shape: <Code>SELECT columns FROM table ORDER BY … LIMIT …;</Code> - after SELECT any
            expressions are allowed, <Code>AS</Code> gives names.
          </>,
          'Without ORDER BY there is no guaranteed order.',
          "Text in 'single', names in \"double\" quotes.",
          <>
            <Code>\dt</Code> lists tables, <Code>\d table</Code> shows how one is built.
          </>,
        ]}
      />
    </>
  )
}
