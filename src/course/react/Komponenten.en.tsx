import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Komponenten.code'

/**
 * KAPITEL 3.1 (English) - Components & JSX
 */
export function Komponenten() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>A component is a function that returns JSX.</P>
        <TryIt
          id="react-komponenten-einstieg"
          {...examples['react-komponenten-einstieg']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="The idea behind React">
        <P>
          In the last chapter you changed the DOM by hand: find an element, set text, toggle a class. That
          quickly gets messy for larger user interfaces. React turns it around: you describe{' '}
          <strong>what the UI should look like for certain data</strong> - and React takes care of changing
          the DOM accordingly.
        </P>
        <CodeBlock code={codeBloecke.beispiel1} />
        <P>
          A <strong>component</strong> is simply a JavaScript function that describes what should be
          displayed.
        </P>
      </Abschnitt>

      <Abschnitt titel="Your first component">
        <Liste>
          <li>A component is a function that returns JSX.</li>
          <li>
            Its name <strong>always starts with a capital letter</strong>. <Code>{'<button>'}</Code> is an
            HTML element, <Code>{'<Button>'}</Code> is your component.
          </li>
          <li>You use components like HTML tags - as often as you like.</li>
        </Liste>
        <TryIt
          id="react-komponenten-1"
          {...examples['react-komponenten-1']}
          mode="react"
        />
        <Hinweis variante="info">
          In a real project there is one call at the very start:{' '}
          <Code>{"createRoot(document.getElementById('root')).render(<App />)"}</Code> - see{' '}
          <Code>src/main.tsx</Code> in this project. In the editor, the learning environment does this for
          you.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="JSX is JavaScript">
        <P>
          JSX looks like HTML, but it is translated into normal function calls before it runs. That is why a
          few rules differ from HTML:
        </P>
        <CodeBlock
          code={codeBloecke.beispiel2}
        />
        <Liste>
          <li>
            <strong>One root element:</strong> a function can only return one value. If you don’t need a
            wrapping <Code>{'<div>'}</Code>, use a fragment <Code>{'<>…</>'}</Code>.
          </li>
          <li>
            <Code>className</Code> instead of <Code>class</Code> and <Code>htmlFor</Code> instead of{' '}
            <Code>for</Code> - because <Code>class</Code> and <Code>for</Code> are reserved words in
            JavaScript.
          </li>
          <li>
            Attributes in <strong>camelCase</strong>: <Code>onClick</Code>, <Code>tabIndex</Code>,{' '}
            <Code>maxLength</Code>.
          </li>
          <li>
            <strong>Close all tags:</strong> <Code>{'<img />'}</Code>, <Code>{'<br />'}</Code>,{' '}
            <Code>{'<input />'}</Code>.
          </li>
          <li>
            <Code>style</Code> takes an <strong>object</strong>:{' '}
            <Code>{"style={{ color: 'red', fontSize: 20 }}"}</Code>.
          </li>
          <li>
            Inside curly braces <Code>{'{ }'}</Code> goes JavaScript - but only <strong>expressions</strong>{' '}
            (something that produces a value), no <Code>if</Code> or <Code>for</Code> statements.
          </li>
        </Liste>
        <TryIt
          id="react-komponenten-2"
          {...examples['react-komponenten-2']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="react-komponenten-uebung"
          {...examples['react-komponenten-uebung']}
          mode="react"
          task={
            <>
              <p>
                This code is written with an HTML mindset and cannot be compiled. Find and fix the{' '}
                <strong>four mistakes</strong> until the card is displayed.
              </p>
              <p className="mt-1">
                Then: build your own component <Code>Footer</Code> that displays “Built with React”, and use it
                in <Code>App</Code>.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'Why must a component name start with a capital letter?',
            answers: [
              'It is just a style convention.',
              'Otherwise React treats it as an HTML element.',
              'Because JavaScript functions are always capitalized.',
            ],
            correct: 1,
            explanation: '<profile> would be an (unknown) HTML tag, <Profile> calls your function.',
          },
          {
            question: 'What may go between { } in JSX?',
            answers: ['Only variables', 'Any JavaScript expression', 'if and for statements too'],
            correct: 1,
            explanation: 'Expressions like a + b, condition ? x : y or list.map(…) - no statements like if or for.',
          },
          {
            question: 'How do you return two sibling elements without an extra <div>?',
            answers: ['As an array without brackets', 'With a fragment <>…</>', 'Not at all'],
            correct: 1,
            explanation: 'The fragment groups elements without appearing in the DOM itself.',
          },
        ]}
      />

      <Merke
        punkte={[
          'A component is a function with a capitalized name that returns JSX.',
          'JSX is translated to React.createElement(...) - it is JavaScript, not HTML.',
          <>
            <Code>className</Code>, camelCase attributes, close all tags, <Code>style</Code> as an object.
          </>,
          <>
            Exactly one root element - a fragment <Code>{'<>…</>'}</Code> if needed.
          </>,
          <>
            JavaScript expressions go inside <Code>{'{ }'}</Code>.
          </>,
        ]}
      />
    </>
  )
}
