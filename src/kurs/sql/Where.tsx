import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Where.code'

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
        <TryIt modus="sql" id="sql-where-einstieg" {...beispiele['sql-where-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Vergleichen und verknüpfen">
        <CodeBlock code={codeBloecke.operatoren} titel="SQL" />
        <P>
          Wichtig: Ein einfaches <Code>=</Code> vergleicht (kein <Code>===</Code> wie in JavaScript).
          Ungleich ist <Code>&lt;&gt;</Code>. Mehrere Bedingungen verbindest du mit <Code>AND</Code> und{' '}
          <Code>OR</Code>; für häufige Muster gibt es Kurzformen:
        </P>
        <TryIt modus="sql" id="sql-where-vergleiche" {...beispiele['sql-where-vergleiche']} />
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
        <TryIt modus="sql" id="sql-where-klammern" {...beispiele['sql-where-klammern']} />
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
        <TryIt modus="sql" id="sql-where-like" {...beispiele['sql-where-like']} />
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
        <CodeBlock code={codeBloecke.null} titel="SQL" />
        <P>
          Jeder Vergleich mit NULL ergibt wieder NULL - „unbekannt“. Und <Code>WHERE</Code> behält nur
          Zeilen, deren Bedingung <strong>wahr</strong> ist. Deshalb findet <Code>= NULL</Code> nie
          etwas:
        </P>
        <TryIt modus="sql" id="sql-where-null" {...beispiele['sql-where-null']} />
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
        <TryIt modus="sql" id="sql-where-case" {...beispiele['sql-where-case']} />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="sql"
          id="sql-where-uebung"
          {...beispiele['sql-where-uebung']}
          aufgabe={
            <p>
              Das Lager will nachbestellen: Zeige alle Produkte mit <strong>weniger als 10 Stück</strong>{' '}
              auf Lager - <Code>name</Code> und <Code>stock</Code>, der kleinste Bestand zuerst, bei
              Gleichstand nach Name. Produkte ohne Lagerbestand (Software, Services) gehören nicht dazu.
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
            frage: "Was liefert WHERE category = 'books' OR category = 'hardware' AND price > 100?",
            antworten: [
              'Bücher und Hardware, jeweils über 100',
              'Alle Bücher und die Hardware über 100',
              'Nur Hardware über 100',
              'Einen Fehler',
            ],
            richtig: 1,
            erklaerung: 'AND bindet stärker: books OR (hardware AND price > 100). Für die erste Antwort braucht es Klammern um das OR.',
          },
          {
            frage: 'Wie findest du Kunden ohne E-Mail?',
            antworten: ['WHERE email = NULL', "WHERE email = ''", 'WHERE email IS NULL', 'WHERE NOT email'],
            richtig: 2,
            erklaerung: '= NULL ist nie wahr, weil jeder Vergleich mit NULL wieder NULL ergibt. Dafür gibt es IS NULL.',
          },
          {
            frage: "Welche Namen passen auf LIKE 'A_a%'?",
            antworten: ['Ada Lovelace', 'Alan Turing', 'Anna', 'Ada Lovelace und Anna'],
            richtig: 0,
            erklaerung: "A, genau ein beliebiges Zeichen (d), a, dann beliebig viel. 'Anna' hat an dritter Stelle ein n.",
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
