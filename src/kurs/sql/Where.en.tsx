import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Where.code'

/**
 * CHAPTER 9.2 - Filtering with WHERE (English version)
 */
export function Where() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          <Code>WHERE</Code> comes after <Code>FROM</Code> and only lets through the rows for which the
          condition is <strong>true</strong> - like <Code>filter</Code> on arrays (
          <Verweis id="js-arrays" />), except that the database does the work.
        </P>
        <TryIt modus="sql" id="sql-where-einstieg" {...beispiele['sql-where-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Comparing and combining">
        <CodeBlock code={codeBloecke.operatoren} titel="SQL" />
        <P>
          Important: a single <Code>=</Code> compares (no <Code>===</Code> like in JavaScript). Not
          equal is <Code>&lt;&gt;</Code>. You combine several conditions with <Code>AND</Code> and{' '}
          <Code>OR</Code>; common patterns have short forms:
        </P>
        <TryIt modus="sql" id="sql-where-vergleiche" {...beispiele['sql-where-vergleiche']} />
        <Liste>
          <li>
            <Code>IN ('books', 'accessories')</Code> is shorter and easier to read than a chain of{' '}
            <Code>OR</Code>.
          </li>
          <li>
            <Code>BETWEEN a AND b</Code> <strong>includes both ends</strong>. Dates are written as text
            in the format <Code>'2026-06-01'</Code> - PostgreSQL converts it.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="AND before OR">
        <P>
          Like multiplication before addition, <Code>AND</Code> binds more strongly than{' '}
          <Code>OR</Code>. That is the most common cause of queries that return “too much”:
        </P>
        <TryIt modus="sql" id="sql-where-klammern" {...beispiele['sql-where-klammern']} />
        <Hinweis variante="tipp">
          As soon as <Code>AND</Code> and <Code>OR</Code> appear in one condition: add parentheses.
          Even when they are not needed - the next reader will thank you.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Text patterns with LIKE">
        <P>
          <Code>LIKE</Code> compares with a pattern: <Code>%</Code> stands for any number of characters
          (including none), <Code>_</Code> for exactly one. So <Code>'Code%'</Code> means “starts with
          Code”, <Code>'%book%'</Code> “contains book”.
        </P>
        <TryIt modus="sql" id="sql-where-like" {...beispiele['sql-where-like']} />
        <P>
          <Code>LIKE</Code> is case-sensitive. PostgreSQL has <Code>ILIKE</Code>, which ignores case -
          in other databases you write <Code>lower(name) LIKE '%book%'</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="NULL: the value that is none">
        <P>
          <Code>NULL</Code> means “unknown” or “not there” - Charles Babbage has no email, software has
          no stock. NULL is <strong>not</strong> the same as 0 or an empty text, and it behaves
          differently from every other value:
        </P>
        <CodeBlock code={codeBloecke.null} titel="SQL" />
        <P>
          Every comparison with NULL yields NULL again - “unknown”. And <Code>WHERE</Code> keeps only
          rows whose condition is <strong>true</strong>. That is why <Code>= NULL</Code> never finds
          anything:
        </P>
        <TryIt modus="sql" id="sql-where-null" {...beispiele['sql-where-null']} />
        <Liste>
          <li>
            You ask for “no value” with <Code>IS NULL</Code>, for “some value” with{' '}
            <Code>IS NOT NULL</Code>.
          </li>
          <li>
            <Code>coalesce(a, b)</Code> returns the first value that is not NULL - ideal for display.
            The JavaScript counterpart is <Code>a ?? b</Code> (<Verweis id="js-kontrollfluss" />).
          </li>
          <li>
            The last query shows the trap: <Code>stock &lt;&gt; 0</Code> was meant as “not sold out”,
            but it also drops every product without stock (NULL). Perhaps{' '}
            <Code>stock &lt;&gt; 0 OR stock IS NULL</Code> was meant.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Classifying with CASE">
        <P>
          <Code>CASE</Code> is SQL’s <Code>if/else</Code> - but an <strong>expression</strong> that
          returns a value, like the ternary operator. The first matching line wins:
        </P>
        <TryIt modus="sql" id="sql-where-case" {...beispiele['sql-where-case']} />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="sql"
          id="sql-where-uebung"
          {...beispiele['sql-where-uebung']}
          aufgabe={
            <p>
              The warehouse wants to reorder: show all products with <strong>fewer than 10</strong> in
              stock - <Code>name</Code> and <Code>stock</Code>, the smallest stock first, ties by name.
              Products without stock (software, services) do not belong in the list.
            </p>
          }
          tipps={{
            de: ['Die Bedingung heißt `stock < 10`.', 'Und NULL? `NULL < 10` ist nicht wahr - diese Zeilen fallen von selbst heraus.', 'Sortieren: `ORDER BY stock, name`.'],
            en: ['The condition is `stock < 10`.', 'And NULL? `NULL < 10` is not true - these rows drop out by themselves.', 'Sort: `ORDER BY stock, name`.'],
          }}
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: "What does WHERE category = 'books' OR category = 'hardware' AND price > 100 return?",
            antworten: ['Books and hardware, each over 100', 'All books and the hardware over 100', 'Only hardware over 100', 'An error'],
            richtig: 1,
            erklaerung: 'AND binds more strongly: books OR (hardware AND price > 100). The first answer needs parentheses around the OR.',
          },
          {
            frage: 'How do you find customers without an email?',
            antworten: ['WHERE email = NULL', "WHERE email = ''", 'WHERE email IS NULL', 'WHERE NOT email'],
            richtig: 2,
            erklaerung: '= NULL is never true, because every comparison with NULL yields NULL again. That is what IS NULL is for.',
          },
          {
            frage: "Which names match LIKE 'A_a%'?",
            antworten: ['Ada Lovelace', 'Alan Turing', 'Anna', 'Ada Lovelace and Anna'],
            richtig: 0,
            erklaerung: "A, exactly one character (d), a, then anything. 'Anna' has an n in third place.",
          },
        ]}
      />

      <Merke
        punkte={[
          'WHERE keeps only rows whose condition is true.',
          <>
            <Code>=</Code> and <Code>&lt;&gt;</Code> compare; <Code>IN</Code>, <Code>BETWEEN</Code>,{' '}
            <Code>LIKE</Code>/<Code>ILIKE</Code> are short forms for common patterns.
          </>,
          'AND binds more strongly than OR - when in doubt, add parentheses.',
          <>
            NULL is “unknown”: comparisons with it yield NULL. Query it with <Code>IS NULL</Code>,
            replace it with <Code>coalesce</Code>.
          </>,
          <>
            <Code>CASE WHEN … THEN … ELSE … END</Code> classifies values.
          </>,
        ]}
      />
    </>
  )
}
