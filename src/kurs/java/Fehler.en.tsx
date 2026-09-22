import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Fehler.code'

/**
 * CHAPTER 6.9 (English) - Exceptions
 */
export function Fehler() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          When something goes wrong, Java throws an <strong>exception</strong>. If nobody catches it
          the program crashes - with <Code>try/catch</Code> you take the wheel.
        </P>
        <TryIt modus="java" id="java-fehler-einstieg" {...beispiele['java-fehler-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="The structure">
        <CodeBlock code={codeBloecke.aufbau} />
        <P>
          The big difference to JavaScript: there are <strong>several catch blocks</strong>, one per
          error type. Java looks for the first matching one - which is why the most general one (
          <Code>Exception</Code>) always comes last.
        </P>
        <CodeBlock code={codeBloecke.jsVergleich} />
      </Abschnitt>

      <Abschnitt titel="The three you will see most often">
        <TryIt modus="java" id="java-fehler-typen" {...beispiele['java-fehler-typen']} />
        <Tabelle
          breit
          kopf={['Exception', 'Happens when …']}
          spalten={['align-top font-mono text-xs']}
          zeilen={[
            ['NullPointerException', 'you call a method on null - the classic'],
            ['ArrayIndexOutOfBoundsException', 'you reach for an index that does not exist'],
            ['NumberFormatException', 'Integer.parseInt(…) gets text that is not a number'],
            ['ArithmeticException', 'you divide whole numbers by 0'],
            ['ClassCastException', 'a cast targets a type that does not fit'],
            ['IllegalArgumentException', 'you throw it yourself because an argument makes no sense'],
          ]}
        />
      </Abschnitt>

      <Abschnitt titel="finally: always runs">
        <P>
          The <Code>finally</Code> block runs in any case - even if the <Code>try</Code> already had
          a <Code>return</Code>. Classically it is used for cleanup: close a file, drop a connection.
        </P>
        <TryIt modus="java" id="java-fehler-finally" {...beispiele['java-fehler-finally']} />
      </Abschnitt>

      <Abschnitt titel="Throwing yourself">
        <P>
          <Code>throw</Code> ends the method immediately and passes the error upwards. That is often
          better than returning a wrong value - the caller then <em>has</em> to deal with it.
        </P>
        <TryIt modus="java" id="java-fehler-werfen" {...beispiele['java-fehler-werfen']} />
      </Abschnitt>

      <Abschnitt titel="Your own exceptions">
        <P>
          A custom exception is simply a class extending <Code>RuntimeException</Code> (
          <Verweis nr="7.7" />). The benefit: it can carry extra data - and callers can catch exactly{' '}
          <em>this</em> case.
        </P>
        <TryIt modus="java" id="java-fehler-eigene" {...beispiele['java-fehler-eigene']} />
      </Abschnitt>

      <Abschnitt titel="Checked and unchecked">
        <P>
          Java has a peculiarity hardly any other language shares: for some exceptions the compiler{' '}
          <strong>forces</strong> you to act.
        </P>
        <CodeBlock code={codeBloecke.hierarchie} />
        <CodeBlock code={codeBloecke.checked} />
        <Liste>
          <li>
            <strong>checked</strong> (e.g. <Code>IOException</Code>): you must catch it or pass it on
            with <Code>throws</Code>. Otherwise it does not compile.
          </li>
          <li>
            <strong>unchecked</strong> (everything under <Code>RuntimeException</Code>): you may, but
            you do not have to.
          </li>
        </Liste>
        <Hinweis variante="tipp">
          For your own errors <Code>RuntimeException</Code> is the usual choice today. Checked
          exceptions easily lead to empty <Code>catch</Code> blocks that only hide a problem.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="When nobody catches">
        <P>
          Then the exception travels up the call chain until it falls out at the top. The program
          ends - and first prints what happened and where.
        </P>
        <TryIt modus="java" id="java-fehler-ungefangen" {...beispiele['java-fehler-ungefangen']} />
        <Hinweis variante="info">
          A real JVM lists the whole call chain here (the <em>stack trace</em>):{' '}
          <Code>level2 → level1 → main</Code>. This runtime names the line where it happened - the
          most important piece when hunting a bug. Always read a stack trace from the{' '}
          <strong>top</strong>: that is where it blew up.
        </Hinweis>
        <P>
          React has the <em>error boundary</em> for this (<Verweis nr="5.4" />) - same idea: one
          error should not take the whole application down with it.
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="java"
          id="java-fehler-uebung"
          {...beispiele['java-fehler-uebung']}
          aufgabe={
            <>
              <p>Two methods, two sides of the same coin:</p>
              <Liste>
                <li>
                  <Code>parseOrDefault(text, fallback)</Code> - returns the number, but{' '}
                  <Code>fallback</Code> instead of a crash for invalid text.
                </li>
                <li>
                  <Code>validateAge(age)</Code> - throws an <Code>IllegalArgumentException</Code>{' '}
                  when the age is below 0 or above 130. Otherwise nothing happens.
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'When does the finally block run?',
            antworten: [
              'only when no error occurred',
              'only when an error occurred',
              'always - even after a return inside try',
              'only when there is no catch',
            ],
            richtig: 2,
            erklaerung: 'finally is the cleanup block and runs in any case.',
          },
          {
            frage: 'What is the difference between checked and unchecked exceptions?',
            antworten: [
              'Checked ones are more severe.',
              'For checked ones the compiler demands catch or throws.',
              'Unchecked ones cannot be caught.',
              'Checked ones only exist in your own classes.',
            ],
            richtig: 1,
            erklaerung: 'Everything below RuntimeException is unchecked - the rest must be handled or passed on.',
          },
          {
            frage: 'In what order do several catch blocks go?',
            antworten: [
              'any order',
              'most general to most specific',
              'most specific to most general',
              'alphabetically',
            ],
            richtig: 2,
            erklaerung: 'Java takes the first match. With catch (Exception e) on top nothing else would ever run - that is even a compile error.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>try</Code> - one <Code>catch</Code> per error type - <Code>finally</Code> always
            runs.
          </>,
          'Catch the most specific exception first, Exception last.',
          <>
            <Code>throw new IllegalArgumentException("…")</Code> is often better than a return value
            that is supposed to mean “error”.
          </>,
          <>
            Custom exceptions extend <Code>RuntimeException</Code> and may carry their own data.
          </>,
          'Read a stack trace from the top: that is where it happened.',
        ]}
      />
    </>
  )
}
