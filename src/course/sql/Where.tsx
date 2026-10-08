import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/ChapterLink'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Where.code'

/**
 * KAPITEL 9.2 - Filtern mit WHERE
 * Vergleiche, AND/OR, IN, BETWEEN, LIKE - und NULL, der Wert, der keiner ist.
 */
export function Where() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          <Code>WHERE</Code> steht nach <Code>FROM</Code> und lässt nur die Zeilen durch, für die die
          Bedingung <strong>wahr</strong> ist - wie <Code>filter</Code> bei Arrays (<Verweis id="js-arrays" />),
          nur dass die Datenbank die Arbeit macht.
        </P>
        <TryIt mode="sql" id="sql-where-einstieg" {...examples['sql-where-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Vergleichen und verknüpfen">
        <CodeBlock code={codeBloecke.operatoren} title="SQL" />
        <P>
          Wichtig: Ein einfaches <Code>=</Code> vergleicht (kein <Code>===</Code> wie in JavaScript).
          Ungleich ist <Code>&lt;&gt;</Code>. Mehrere Bedingungen verbindest du mit <Code>AND</Code> und{' '}
          <Code>OR</Code>; für häufige Muster gibt es Kurzformen:
        </P>
        <TryIt mode="sql" id="sql-where-vergleiche" {...examples['sql-where-vergleiche']} />
        <Liste>
          <li>
            <Code>IN ('books', 'accessories')</Code> ist kürzer und lesbarer als eine Kette von{' '}
            <Code>OR</Code>.
          </li>
          <li>
            <Code>BETWEEN a AND b</Code> schließt <strong>beide Grenzen ein</strong>. Datumswerte
            schreibt man als Text im Format <Code>'2026-06-01'</Code> - PostgreSQL wandelt ihn um.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="AND vor OR">
        <P>
          Wie Punkt vor Strich bindet <Code>AND</Code> stärker als <Code>OR</Code>. Das ist die
          häufigste Ursache für Abfragen, die „zu viel“ liefern:
        </P>
        <TryIt mode="sql" id="sql-where-klammern" {...examples['sql-where-klammern']} />
        <Hinweis variante="tipp">
          Sobald <Code>AND</Code> und <Code>OR</Code> in einer Bedingung vorkommen: Klammern setzen.
          Auch wenn sie nicht nötig wären - der nächste Leser dankt es dir.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Textmuster mit LIKE">
        <P>
          <Code>LIKE</Code> vergleicht mit einem Muster: <Code>%</Code> steht für beliebig viele
          Zeichen (auch keins), <Code>_</Code> für genau eins. <Code>'Code%'</Code> heißt also „beginnt
          mit Code“, <Code>'%book%'</Code> „enthält book“.
        </P>
        <TryIt mode="sql" id="sql-where-like" {...examples['sql-where-like']} />
        <P>
          <Code>LIKE</Code> achtet auf Groß- und Kleinschreibung. PostgreSQL hat dafür{' '}
          <Code>ILIKE</Code>, das sie ignoriert - in anderen Datenbanken schreibt man{' '}
          <Code>lower(name) LIKE '%book%'</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="NULL: der Wert, der keiner ist">
        <P>
          <Code>NULL</Code> bedeutet „unbekannt“ oder „nicht vorhanden“ - Charles Babbage hat keine
          E-Mail, Software hat keinen Lagerbestand. NULL ist <strong>nicht</strong> dasselbe wie 0
          oder ein leerer Text, und es verhält sich anders als jeder andere Wert:
        </P>
        <CodeBlock code={codeBloecke.null} title="SQL" />
        <P>
          Jeder Vergleich mit NULL ergibt wieder NULL - „unbekannt“. Und <Code>WHERE</Code> behält nur
          Zeilen, deren Bedingung <strong>wahr</strong> ist. Deshalb findet <Code>= NULL</Code> nie
          etwas:
        </P>
        <TryIt mode="sql" id="sql-where-null" {...examples['sql-where-null']} />
        <Liste>
          <li>
            Nach „kein Wert“ fragt man mit <Code>IS NULL</Code>, nach „irgendein Wert“ mit{' '}
            <Code>IS NOT NULL</Code>.
          </li>
          <li>
            <Code>coalesce(a, b)</Code> liefert den ersten Wert, der nicht NULL ist - ideal für die
            Anzeige. Das Gegenstück in JavaScript ist <Code>a ?? b</Code> (<Verweis id="js-kontrollfluss" />).
          </li>
          <li>
            Die letzte Abfrage zeigt die Falle: <Code>stock &lt;&gt; 0</Code> sollte „nicht ausverkauft“
            heißen, wirft aber auch alle Produkte ohne Bestand (NULL) hinaus. Gemeint war vielleicht{' '}
            <Code>stock &lt;&gt; 0 OR stock IS NULL</Code>.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Einteilen mit CASE">
        <P>
          <Code>CASE</Code> ist das <Code>if/else</Code> von SQL - allerdings ein{' '}
          <strong>Ausdruck</strong>, der einen Wert liefert, wie der Ternär-Operator. Die erste
          zutreffende Zeile gewinnt:
        </P>
        <TryIt mode="sql" id="sql-where-case" {...examples['sql-where-case']} />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          mode="sql"
          id="sql-where-uebung"
          {...examples['sql-where-uebung']}
          task={
            <p>
              Das Lager will nachbestellen: Zeige alle Produkte mit <strong>weniger als 10 Stück</strong>{' '}
              auf Lager - <Code>name</Code> und <Code>stock</Code>, der kleinste Bestand zuerst, bei
              Gleichstand nach Name. Produkte ohne Lagerbestand (Software, Services) gehören nicht dazu.
            </p>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: "Was liefert WHERE category = 'books' OR category = 'hardware' AND price > 100?",
            answers: [
              'Bücher und Hardware, jeweils über 100',
              'Alle Bücher und die Hardware über 100',
              'Nur Hardware über 100',
              'Einen Fehler',
            ],
            correct: 1,
            explanation: 'AND bindet stärker: books OR (hardware AND price > 100). Für die erste Antwort braucht es Klammern um das OR.',
          },
          {
            question: 'Wie findest du Kunden ohne E-Mail?',
            answers: ['WHERE email = NULL', "WHERE email = ''", 'WHERE email IS NULL', 'WHERE NOT email'],
            correct: 2,
            explanation: '= NULL ist nie wahr, weil jeder Vergleich mit NULL wieder NULL ergibt. Dafür gibt es IS NULL.',
          },
          {
            question: "Welche Namen passen auf LIKE 'A_a%'?",
            answers: ['Ada Lovelace', 'Alan Turing', 'Anna', 'Ada Lovelace und Anna'],
            correct: 0,
            explanation: "A, genau ein beliebiges Zeichen (d), a, dann beliebig viel. 'Anna' hat an dritter Stelle ein n.",
          },
        ]}
      />

      <Merke
        punkte={[
          'WHERE behält nur Zeilen, deren Bedingung wahr ist.',
          <>
            <Code>=</Code> und <Code>&lt;&gt;</Code> vergleichen; <Code>IN</Code>, <Code>BETWEEN</Code>,{' '}
            <Code>LIKE</Code>/<Code>ILIKE</Code> sind Kurzformen für häufige Muster.
          </>,
          'AND bindet stärker als OR - im Zweifel Klammern setzen.',
          <>
            NULL ist „unbekannt“: Vergleiche damit ergeben NULL. Abfragen mit <Code>IS NULL</Code>,
            ersetzen mit <Code>coalesce</Code>.
          </>,
          <>
            <Code>CASE WHEN … THEN … ELSE … END</Code> teilt Werte ein.
          </>,
        ]}
      />
    </>
  )
}
