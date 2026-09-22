import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Variablen.code'

/**
 * KAPITEL 1.1 (English) - Variables & Data Types
 */
export function Variablen() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>One value, one name: <Code>const</Code> for fixed values, <Code>let</Code> for values that change.</P>
        <TryIt
          id="js-variablen-einstieg"
          {...beispiele['js-variablen-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Why JavaScript first?">
        <P>
          React is not a language of its own, but a JavaScript library. Almost everything in React code
          that looks “magical” at first - <Code>{'[a, setA] = …'}</Code>,{' '}
          <Code>{'items.map(i => …)'}</Code>, <Code>{'{...props}'}</Code> - is plain JavaScript. Once
          you are confident with these fundamentals, you will learn React twice as fast.
        </P>
        <Hinweis variante="tipp">
          In every “Try it yourself” box you can change the code and run it with ▶ Run (or{' '}
          <Code>Ctrl + Enter</Code>). Everything you print with <Code>console.log()</Code> shows up in the
          console below.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Storing values with const and let">
        <P>A variable is a name for a value. Modern JavaScript has two keywords for this:</P>
        <Liste>
          <li>
            <Code>const</Code> - the name is assigned <strong>once</strong> and never reassigned. This is
            the default.
          </li>
          <li>
            <Code>let</Code> - the name may get a new value later (e.g. a counter in a loop).
          </li>
          <li>
            <Code>var</Code> is the old variant with strange rules - don’t use it in new code.
          </li>
        </Liste>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="js-variablen-1"
          {...beispiele['js-variablen-1']}
        />
        <Hinweis variante="info">
          Rule of thumb: always <Code>const</Code> - and only switch to <Code>let</Code> when you really
          need to reassign. In React components you will hardly ever need <Code>let</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The data types">
        <P>
          Every value has a type. You can ask for it with <Code>typeof</Code>. The so-called{' '}
          <strong>primitive</strong> types are:
        </P>
        <Tabelle
          kopf={['Type', 'Example', 'What for?']}
          spalten={[undefined, 'font-mono text-xs']}
          zeilen={[
            ['string', "'Hello', \"World\", `Text`", 'Text'],
            ['number', '42, 3.14, -7, NaN', 'Integers and decimals (there is only one number type)'],
            ['boolean', 'true, false', 'Yes/no decisions'],
            ['undefined', 'undefined', '“No value assigned yet”'],
            ['null', 'null', '“Intentionally empty”'],
          ].map(([type, example, purpose]) => [<Code key={type}>{type}</Code>, example, purpose])}
        />
        <P>
          Everything else - objects, arrays, functions - is an <strong>object</strong>. You will learn why
          this difference matters so much for React in <Verweis nr="1.6" />.
        </P>
        <TryIt
          id="js-variablen-2"
          {...beispiele['js-variablen-2']}
        />
      </Abschnitt>

      <Abschnitt titel="Strings and template literals">
        <P>
          Strings in single or double quotes are equivalent. Backticks <Code>`…`</Code> can do more: any
          JavaScript expression may go inside <Code>{'${…}'}</Code>, and line breaks are allowed. You
          will see these <strong>template literals</strong> all the time in React, e.g. for CSS classes.
        </P>
        <TryIt
          id="js-variablen-3"
          {...beispiele['js-variablen-3']}
        />
      </Abschnitt>

      <Abschnitt titel="Type conversion, truthy and falsy">
        <P>
          JavaScript sometimes converts types on its own - handy, but a common source of bugs. It is
          especially important to know which values count as <strong>false</strong> in a condition.
          These are exactly:
        </P>
        <CodeBlock code={codeBloecke.beispiel2} titel="The falsy values" />
        <P>
          <strong>Everything else</strong> is truthy - including <Code>'0'</Code>, <Code>'false'</Code>,{' '}
          <Code>[]</Code> and <Code>{'{}'}</Code>.
        </P>
        <TryIt
          id="js-variablen-4"
          {...beispiele['js-variablen-4']}
        />
        <Hinweis variante="warnung">
          This leads to a React classic: <Code>{'{count && <List />}'}</Code> shows a lonely{' '}
          <strong>0</strong> when <Code>count = 0</Code>, because 0 is falsy and gets rendered itself.
          Better: <Code>{'{count > 0 && <List />}'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="js-variablen-uebung"
          {...beispiele['js-variablen-uebung']}
          aufgabe={
            <>
              <p>
                Create the variables <Code>firstName</Code> with the value <Code>'Ada'</Code> and{' '}
                <Code>age</Code> with the <em>number</em> 36.
              </p>
              <p className="mt-1">
                Use a template literal to build the string <Code>sentence</Code> ={' '}
                <Code>'Ada is 36 years old.'</Code> and create <Code>isAdult</Code> - a boolean that is{' '}
                <em>calculated</em> from <Code>age</Code>.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Which keyword do you use for new variables by default?',
            antworten: ['var', 'let', 'const'],
            richtig: 2,
            erklaerung: 'const is the default. Use let only when you really need to reassign.',
          },
          {
            frage: "What is '5' + 1 ?",
            antworten: ['6', "'51'", 'NaN', 'an error'],
            richtig: 1,
            erklaerung: 'With + and a string, the number is converted to a string and appended.',
          },
          {
            frage: 'Which of these values is truthy?',
            antworten: ['0', "''", "'0'", 'null'],
            richtig: 2,
            erklaerung: "'0' is a non-empty string - and therefore truthy.",
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>const</Code> by default, <Code>let</Code> only for reassignment, never <Code>var</Code>.
          </>,
          'Primitive types: string, number, boolean, undefined, null. Everything else is an object.',
          <>
            Template literals: <Code>{'`Hello ${name}`'}</Code> - any JavaScript goes inside{' '}
            <Code>{'${}'}</Code>.
          </>,
          <>
            Only <Code>false, 0, '', null, undefined, NaN</Code> are falsy. Watch out for{' '}
            <Code>0 &&</Code> in JSX.
          </>,
        ]}
      />
    </>
  )
}
