import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './FehlerUndKlassen.code'

/**
 * KAPITEL 1.8 (English) - Errors & Classes
 */
export function FehlerUndKlassen() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          <Code>try</Code> attempts something, <Code>catch</Code> catches the error - and the program keeps running.
        </P>
        <TryIt id="js-fehler-einstieg" {...beispiele['js-fehler-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Throwing and catching errors">
        <P>
          When something goes wrong, JavaScript <strong>throws</strong> an error: an object with <Code>name</Code> and{' '}
          <Code>message</Code>. If nobody catches it, the script stops. With <Code>throw</Code> you throw one yourself -
          for example when a function is called with invalid values. <Code>finally</Code> runs in every case, with or
          without an error.
        </P>
        <TryIt id="js-fehler-werfen" {...beispiele['js-fehler-werfen']} />
        <Liste>
          <li>
            Built-in error types: <Code>TypeError</Code> (wrong type, e.g. <Code>undefined.x</Code>),{' '}
            <Code>RangeError</Code> (value outside the allowed range), <Code>SyntaxError</Code> (e.g. in{' '}
            <Code>JSON.parse</Code>), <Code>ReferenceError</Code> (the variable does not exist).
          </li>
          <li>
            Always throw an <Code>Error</Code> object, never a string: only then do you get a <Code>message</Code> and
            the <Code>stack</Code> that shows where the error came from.
          </li>
          <li>
            With <Code>await</Code>, <Code>try/catch</Code> works the same way for async errors (
            <Verweis id="js-async" />).
          </li>
        </Liste>
        <Hinweis variante="warnung">
          An empty <Code>catch {'{}'}</Code> is dangerous: the error disappears and nobody ever hears about it. Only
          catch what you can handle sensibly - throw everything else on.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Classes">
        <P>
          A <strong>class</strong> is a template for objects with the same fields and methods. <Code>new</Code>{' '}
          creates a new object (an <strong>instance</strong>), the <Code>constructor</Code> sets it up. Inside methods,{' '}
          <Code>this</Code> points to the instance.
        </P>
        <TryIt id="js-fehler-klassen" {...beispiele['js-fehler-klassen']} />
        <Liste>
          <li>
            <Code>#field</Code> is private: nobody outside can reach it, not even to read it.
          </li>
          <li>
            <Code>get</Code> turns a method into a field that is computed on every read - without a setter it cannot
            be overwritten.
          </li>
          <li>
            <Code>static</Code> belongs to the class itself, not to its instances: <Code>Counter.fromString()</Code>.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="What is this?">
        <P>
          <Code>this</Code> is the object <strong>in front of the dot</strong> when calling - not the object the method
          was defined in. If you pass a method on (as a callback, to <Code>setTimeout</Code>, as an event handler), the
          dot is missing and <Code>this</Code> is <Code>undefined</Code>.
        </P>
        <TryIt id="js-fehler-this" {...beispiele['js-fehler-this']} />
        <P>
          Arrow functions have no <Code>this</Code> of their own, they use the one from outside (
          <Verweis id="js-funktionen" />). That is one reason why React relies on function components today: there is
          no <Code>this</Code> to lose. In older React code you still see <Code>class … extends React.Component</Code>{' '}
          and <Code>this.setState</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Inheritance and custom errors">
        <P>
          With <Code>extends</Code>, a class takes over everything from another one and adds to it.{' '}
          <Code>super(…)</Code> calls the parent’s constructor. This is most useful for <strong>custom error
          types</strong>: with <Code>instanceof</Code> you can tell expected errors (invalid input) from real bugs.
        </P>
        <TryIt id="js-fehler-vererbung" {...beispiele['js-fehler-vererbung']} />
        <P>
          One place where you still write a class in React today is the error boundary - it catches errors during
          rendering (<Verweis id="praxis-fehler" />).
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="js-fehler-uebung"
          {...beispiele['js-fehler-uebung']}
          aufgabe={
            <>
              <p>Build a small bank account:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>InsufficientFundsError</Code> extends <Code>Error</Code> and has the <Code>name</Code>{' '}
                  <Code>'InsufficientFundsError'</Code>.
                </li>
                <li>
                  <Code>new BankAccount(owner, start = 0)</Code> with <Code>deposit(amount)</Code>,{' '}
                  <Code>withdraw(amount)</Code> and the getter <Code>balance</Code>. The balance must not be changeable
                  from outside.
                </li>
                <li>
                  Withdrawing too much throws an <Code>InsufficientFundsError</Code> and leaves the balance unchanged.
                </li>
                <li>
                  <Code>history</Code> is an array of <Code>{"{ type: 'deposit' | 'withdraw', amount }"}</Code>.
                </li>
                <li>
                  <Code>safeWithdraw(account, amount)</Code> returns <Code>true</Code>, or <Code>false</Code> when there
                  is not enough money - it throws all other errors on.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'When does the finally block run?',
            antworten: ['Only without an error', 'Only after an error', 'Always - with and without an error'],
            richtig: 2,
            erklaerung: 'Ideal for cleaning up, e.g. to end a loading state.',
          },
          {
            frage: 'What is this in obj.method()?',
            antworten: ['The class', 'obj - the object in front of the dot', 'Always window'],
            richtig: 1,
            erklaerung: 'Without a dot at call time (e.g. as a callback), this gets lost.',
          },
          {
            frage: 'Why write custom error classes like ValidationError?',
            antworten: [
              'So instanceof can tell expected errors from real bugs',
              'Because Error must not be thrown',
              'To make the error faster',
            ],
            richtig: 0,
            erklaerung: 'You handle expected errors and throw unknown ones on.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>throw new Error('…')</Code> throws, <Code>try/catch</Code> catches, <Code>finally</Code> cleans up.
          </>,
          'Only catch what you can handle - throw unknown errors on.',
          <>
            Classes: <Code>constructor</Code>, methods, <Code>#private</Code>, <Code>get</Code>, <Code>static</Code>,{' '}
            <Code>extends</Code> + <Code>super</Code>.
          </>,
          <>
            <Code>this</Code> is the object in front of the dot. Arrow functions have no <Code>this</Code> of their own.
          </>,
        ]}
      />
    </>
  )
}
