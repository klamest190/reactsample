import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Kontrollfluss.code'

/**
 * KAPITEL 1.2 (English) - Operators & Conditions
 */
export function Kontrollfluss() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>A condition decides which code runs.</P>
        <TryIt
          id="js-kontrollfluss-einstieg"
          {...examples['js-kontrollfluss-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Comparing: always ===">
        <P>
          JavaScript has two equality operators. <Code>==</Code> converts types first and therefore
          returns surprising results. <Code>===</Code> compares value <strong>and</strong> type - always
          use this one.
        </P>
        <TryIt
          id="js-kontrollfluss-1"
          {...examples['js-kontrollfluss-1']}
        />
      </Abschnitt>

      <Abschnitt titel="if / else and switch">
        <P>
          <Code>if</Code> runs code only under a condition. <Code>else if</Code> checks further cases in
          order, <Code>else</Code> catches the rest. <Code>switch</Code> is worthwhile when you compare one
          value with many fixed options - you will see it again in the reducer chapter.
        </P>
        <TryIt
          id="js-kontrollfluss-2"
          {...examples['js-kontrollfluss-2']}
        />
      </Abschnitt>

      <Abschnitt titel="Conditions as expressions - the toolkit for JSX">
        <P>
          <Code>if</Code> is a <em>statement</em> - it doesn’t produce a value. In JSX, however, only{' '}
          <em>expressions</em> are allowed. That is why you will see these operators all the time in React
          code:
        </P>
        <Liste>
          <li>
            <Code>condition ? a : b</Code> - the <strong>ternary operator</strong>: either a or b.
          </li>
          <li>
            <Code>a && b</Code> - if a is truthy, the result is b, otherwise a. In JSX: “show b only if a”.
          </li>
          <li>
            <Code>a || b</Code> - if a is truthy, the result is a, otherwise b. A classic fallback.
          </li>
          <li>
            <Code>a ?? b</Code> - <strong>nullish coalescing</strong>: b only if a is <Code>null</Code> or{' '}
            <Code>undefined</Code>. Unlike <Code>||</Code>, <Code>0</Code> or <Code>''</Code> are kept.
          </li>
          <li>
            <Code>a?.b</Code> - <strong>optional chaining</strong>: reads b only if a is not
            null/undefined, instead of throwing an error.
          </li>
        </Liste>
        <TryIt
          id="js-kontrollfluss-3"
          {...examples['js-kontrollfluss-3']}
        />
        <CodeBlock
          title="What this looks like in React later"
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="Loops">
        <P>
          You rarely write loops inside React components - there you use <Code>.map()</Code> (chapter
          1.4). For regular logic they are indispensable, though. Most common: <Code>for…of</Code> over
          all elements of a list.
        </P>
        <TryIt
          id="js-kontrollfluss-4"
          {...examples['js-kontrollfluss-4']}
        />
        <Hinweis variante="warnung">
          An infinite loop (e.g. <Code>while (true)</Code> without <Code>break</Code>) freezes the browser
          tab - here in the editor too. The only fix then is to reload the tab.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="js-kontrollfluss-uebung"
          {...examples['js-kontrollfluss-uebung']}
          task={
            <>
              <p>
                Complete the function <Code>grade(points)</Code>. It should return:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>90 points or more: <Code>'excellent'</Code></li>
                <li>70 points or more: <Code>'good'</Code></li>
                <li>50 points or more: <Code>'passed'</Code></li>
                <li>below that: <Code>'failed'</Code></li>
                <li>
                  if <Code>points</Code> is <Code>null</Code> or <Code>undefined</Code>:{' '}
                  <Code>'not specified'</Code>
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: "What is 0 ?? 'empty' ?",
            answers: ['0', "'empty'", 'undefined'],
            correct: 0,
            explanation: '?? only kicks in for null and undefined. 0 is a valid value and stays.',
          },
          {
            question: 'Why do you use the ternary operator instead of if/else in JSX?',
            answers: [
              'It is faster.',
              'Only expressions are allowed in JSX, and if is a statement.',
              'if/else does not exist in React.',
            ],
            correct: 1,
            explanation: 'An expression produces a value React can render - if/else doesn’t.',
          },
          {
            question: 'What happens with user?.address?.city if address is null?',
            answers: ['TypeError', 'The result is undefined', "The result is ''"],
            correct: 1,
            explanation: 'Optional chaining stops and returns undefined instead of throwing an error.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Always use <Code>===</Code> and <Code>!==</Code>.
          </>,
          <>
            <Code>? :</Code>, <Code>&&</Code>, <Code>??</Code> and <Code>?.</Code> are expressions -
            exactly what you need in JSX.
          </>,
          <>
            <Code>??</Code> instead of <Code>||</Code> when <Code>0</Code> or <Code>''</Code> are valid
            values.
          </>,
          <>
            <Code>for…of</Code> for lists - in React components usually <Code>.map()</Code>.
          </>,
        ]}
      />
    </>
  )
}
