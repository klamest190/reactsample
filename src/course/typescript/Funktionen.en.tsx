import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/ChapterLink'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Funktionen.code'

/**
 * KAPITEL 2.3 (English) - Typing Functions
 */
export function Funktionen() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          In functions, you write the type after every parameter. TypeScript can usually infer the return
          type itself - but you may write it after the parentheses.
        </P>
        <TryIt id="ts-funktionen-einstieg" mode="ts" {...examples['ts-funktionen-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Optional, default and rest parameters">
        <P>
          Everything you know from <Verweis nr="1.3" /> can be typed. A <Code>?</Code> makes a parameter
          optional, a default value brings its type along, and rest parameters are an array.
        </P>
        <TryIt id="ts-funktionen-parameter" mode="ts" {...examples['ts-funktionen-parameter']} />
        <Hinweis variante="info">
          Optional parameters must come last: <Code>(name: string, title?: string)</Code> works,{' '}
          <Code>(title?: string, name: string)</Code> doesn't.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Return types">
        <P>
          An explicit return type is like a promise: TypeScript checks every <Code>return</Code> against it,
          and whoever calls the function sees right away what comes back. It pays off especially for
          exported functions. <Code>void</Code> means "returns nothing useful".
        </P>
        <TryIt id="ts-funktionen-rueckgabe" mode="ts" {...examples['ts-funktionen-rueckgabe']} />
      </Abschnitt>

      <Abschnitt titel="Function types and callbacks">
        <P>
          Functions are values (<Verweis nr="1.3" />) - so they have a type too:{' '}
          <Code>{'(a: number, b: number) => number'}</Code>. When you assign an arrow function to a variable
          with a function type, its parameters get their types automatically. The same happens with
          callbacks.
        </P>
        <TryIt id="ts-funktionen-typen" mode="ts" {...examples['ts-funktionen-typen']} />
        <CodeBlock title="Function types in React props" code={codeBloecke.eventHandler} />
      </Abschnitt>

      <Abschnitt titel="void and never">
        <P>
          <Code>void</Code> as a callback type means: the return value is ignored - which is why you may
          also pass a function that returns something. <Code>never</Code> is the type with no values: a
          function with return type <Code>never</Code> never returns normally, because it always throws.
        </P>
        <TryIt id="ts-funktionen-void-never" mode="ts" {...examples['ts-funktionen-void-never']} />
        <Hinweis variante="warnung">
          In a <Code>catch</Code> block the error is of type <Code>unknown</Code> - in JavaScript you can
          throw anything, even strings. Check with <Code>instanceof Error</Code> before you read{' '}
          <Code>.message</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Overloads">
        <P>
          Overloads give a function several signatures. Callers only see these signatures, and the
          implementation below must cover all of them.
        </P>
        <TryIt id="ts-funktionen-ueberladung" mode="ts" {...examples['ts-funktionen-ueberladung']} />
        <Liste>
          <li>
            A union parameter (<Code>value: number | Date</Code>) is often enough - overloads only pay off when
            the return type depends on the argument.
          </li>
          <li>You mostly meet them when reading other people's types, e.g. in the DOM library.</li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="ts-funktionen-uebung"
          mode="ts"
          {...examples['ts-funktionen-uebung']}
          task={
            <>
              <p>A small validation system, the kind you need for forms. The logic is there - the types are missing:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>Validator</Code> is a function: it takes a string and returns an error message or{' '}
                  <Code>null</Code>
                </li>
                <li>
                  <Code>minLength</Code> takes a number and returns a <Code>Validator</Code>
                </li>
                <li>
                  <Code>validate</Code> takes a string and a list of validators and returns all error messages
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'Where is the return type in function f(x: number): string?',
            answers: ['Before the function name', 'After the parameter list: ": string"', 'In the first line of the body'],
            correct: 1,
            explanation: 'The return type follows a colon after the closing parenthesis of the parameters.',
          },
          {
            question: 'type Fn = (n: number) => void. May you assign (n) => n * 2?',
            answers: ['No, the function returns a number', 'Yes - with void the return value is simply ignored', 'Only with as'],
            correct: 1,
            explanation: 'A void return type in a function type means "the value is not used". That is why forEach((n) => list.push(n)) works.',
          },
          {
            question: 'What is the type of error in catch (error) { … }?',
            answers: ['Error', 'any', 'unknown'],
            correct: 2,
            explanation: 'With strict, error is unknown - anything can be thrown. Only instanceof Error narrows it.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Always type parameters: <Code>function add(a: number, b: number)</Code>.
          </>,
          <>
            Optional <Code>title?: string</Code>, default <Code>times = 2</Code>, rest{' '}
            <Code>...numbers: number[]</Code>.
          </>,
          <>
            Function type: <Code>{'type Operation = (a: number, b: number) => number'}</Code>.
          </>,
          <>
            <Code>void</Code> = no useful return value, <Code>never</Code> = never returns.
          </>,
          <>
            In <Code>catch</Code> the error is <Code>unknown</Code>.
          </>,
        ]}
      />
    </>
  )
}
