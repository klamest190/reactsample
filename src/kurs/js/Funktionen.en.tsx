import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Funktionen.code'

/**
 * KAPITEL 1.3 (English) - Functions & Closures
 */
export function Funktionen() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>A function takes values in and returns a result.</P>
        <TryIt
          id="js-funktionen-einstieg"
          {...beispiele['js-funktionen-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Declaring functions">
        <P>
          A function bundles code under a name. It receives <strong>parameters</strong> and returns a
          result with <Code>return</Code>. Without <Code>return</Code>, the result is{' '}
          <Code>undefined</Code>.
        </P>
        <TryIt
          id="js-funktionen-1"
          {...beispiele['js-funktionen-1']}
        />
      </Abschnitt>

      <Abschnitt titel="Arrow functions">
        <P>
          The short syntax with <Code>{'=>'}</Code> is everywhere in React code. If the body consists of a
          single expression, you can omit the curly braces and the <Code>return</Code> - this is called an{' '}
          <strong>implicit return</strong>.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="js-funktionen-2"
          {...beispiele['js-funktionen-2']}
        />
      </Abschnitt>

      <Abschnitt titel="Functions are values - callbacks">
        <P>
          In JavaScript you can store functions in variables, pass them as arguments and return them from
          other functions. A function you pass to another one is called a <strong>callback</strong>. That
          is exactly what you do in React with <Code>{'onClick={() => …}'}</Code>: you pass a function
          that React calls later.
        </P>
        <TryIt
          id="js-funktionen-3"
          {...beispiele['js-funktionen-3']}
        />
        <Hinweis variante="warnung">
          Common React mistake: <Code>{'onClick={remove()}'}</Code> calls the function{' '}
          <strong>immediately while rendering</strong>. Correct is <Code>{'onClick={remove}'}</Code> or{' '}
          <Code>{'onClick={() => remove(id)}'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Scope and closures">
        <P>
          Variables only exist within the block <Code>{'{ }'}</Code> in which they were declared (their{' '}
          <strong>scope</strong>). An inner function, however, can access the variables of the outer
          function - <strong>and keeps that access</strong> even after the outer function has long
          finished. This is called a <strong>closure</strong>.
        </P>
        <TryIt
          id="js-funktionen-4"
          {...beispiele['js-funktionen-4']}
        />
        <P>Why does this matter so much for React?</P>
        <Liste>
          <li>
            Every event handler in a component is a closure over the props and state of{' '}
            <strong>that one render</strong>.
          </li>
          <li>
            This explains the famous “stale state” problem (<em>stale closure</em>) you will meet in the
            hook chapters.
          </li>
          <li>Custom hooks work exactly like <Code>createCounter</Code>.</li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="js-funktionen-uebung"
          {...beispiele['js-funktionen-uebung']}
          aufgabe={
            <>
              <p>
                Write a function <Code>createCart()</Code> that returns an object with three functions:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>add(price)</Code> - remembers the price
                </li>
                <li>
                  <Code>total()</Code> - returns the sum of all prices
                </li>
                <li>
                  <Code>count()</Code> - returns the number of items
                </li>
              </ul>
              <p className="mt-1">
                The data should live <em>privately</em> in a closure. Two carts must not affect each other.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What does (x) => { x * 2 } return?',
            antworten: ['x * 2', 'undefined', 'An error'],
            richtig: 1,
            erklaerung: 'With curly braces you need an explicit return - otherwise undefined.',
          },
          {
            frage: 'Which syntax calls remove only when clicked?',
            antworten: ['onClick={remove()}', 'onClick={() => remove()}', 'onClick="remove()"'],
            richtig: 1,
            erklaerung: 'The arrow function is passed and only executed on click.',
          },
          {
            frage: 'What is a closure?',
            antworten: [
              'A function that calls itself',
              'A function that remembers access to the variables of the scope it was created in',
              'Closing a code block with }',
            ],
            richtig: 1,
            erklaerung: 'The inner function “closes over” the outer variables and keeps them.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Arrow functions: <Code>{'(a, b) => a + b'}</Code>. Return objects implicitly with{' '}
            <Code>{'() => ({ … })'}</Code>.
          </>,
          'Functions are values: store them, pass them (callbacks), return them.',
          <>
            Passing ≠ calling: <Code>fn</Code> vs. <Code>fn()</Code>.
          </>,
          'Closures remember the variables of where they were created - the basis of event handlers and hooks.',
        ]}
      />
    </>
  )
}
