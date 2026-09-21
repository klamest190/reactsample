import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Einstieg.code'

/**
 * KAPITEL 2.1 (English) - Why TypeScript?
 */
export function Einstieg() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          TypeScript is JavaScript with types. You write down what kind of value is expected - and the
          compiler reports mistakes <strong>before</strong> the code runs. Below every editor in this part
          you see the result of the type check.
        </P>
        <TryIt id="ts-start-einstieg" modus="ts" {...beispiele['ts-start-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="What TypeScript is - and what it isn't">
        <P>
          TypeScript is a <strong>superset</strong> of JavaScript: all JavaScript code is valid TypeScript,
          only type annotations are added. The biggest win is not that you make fewer mistakes, but that
          you see them <strong>right away</strong> - typos, forgotten fields, wrong arguments. On top you
          get autocompletion and safe renaming in the IDE.
        </P>
        <TryIt id="ts-start-tippfehler" modus="ts" {...beispiele['ts-start-tippfehler']} />
        <P>In a real project, two separate things happen:</P>
        <CodeBlock titel="Checking and translating" code={codeBloecke.ablauf} />
        <Liste>
          <li>
            The <strong>compiler</strong> (<Code>tsc</Code>, VS Code runs it all the time) checks the types
            and reports errors.
          </li>
          <li>
            A <strong>translator</strong> (Vite, sucrase, esbuild) simply removes the types - what is left is
            plain JavaScript the browser understands.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Types only exist while checking">
        <P>
          This has an important consequence: a type error does <strong>not</strong> stop the program. Here
          the type check reports an error - and still the code runs and prints something:
        </P>
        <TryIt id="ts-start-fehler" modus="ts" {...beispiele['ts-start-fehler']} />
        <CodeBlock titel="Type erasure: the types are removed" code={codeBloecke.entfernt} />
        <Hinweis variante="warnung">
          Since the types are gone at runtime, TypeScript <strong>cannot check anything that only arrives
          at runtime</strong> - user input, <Code>JSON.parse</Code>, server responses. You have to check such
          data yourself (more on that with <Code>unknown</Code> and in <Verweis nr="2.8" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Annotation and inference">
        <P>
          An <strong>annotation</strong> writes the type down explicitly: <Code>let city: string</Code>.
          Most of the time you don't need it - TypeScript derives the type from the value
          (<strong>inference</strong>). With <Code>const</Code> the type is even more precise: the value
          never changes, so the type is exactly that one value.
        </P>
        <TryIt id="ts-start-annotation" modus="ts" {...beispiele['ts-start-annotation']} />
        <Hinweis variante="tipp">
          Rule of thumb: always annotate function <strong>parameters</strong>, and mostly leave the rest to
          inference. That keeps the code short, and the boundaries (what goes in?) are still clear.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The basic types">
        <P>
          The primitive types are named like their <Code>typeof</Code> results - in lowercase. On top come
          arrays and <strong>tuples</strong>: arrays of fixed length where every position has its own type.
        </P>
        <TryIt id="ts-start-grundtypen" modus="ts" {...beispiele['ts-start-grundtypen']} />
        <Liste>
          <li>
            <Code>string</Code>, <Code>number</Code>, <Code>boolean</Code>, <Code>null</Code>,{' '}
            <Code>undefined</Code> (plus the rare <Code>bigint</Code> and <Code>symbol</Code>)
          </li>
          <li>
            Arrays: <Code>number[]</Code> or, meaning the same, <Code>{'Array<number>'}</Code>
          </li>
          <li>
            Tuples: <Code>[string, number]</Code> - you already know them from <Code>useState</Code>
          </li>
          <li>
            Don't mix them up: <Code>String</Code> with a capital S is the wrapper object - always write types
            in lowercase.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="any and unknown">
        <P>
          Both stand for "some value", but they behave in opposite ways. <Code>any</Code> switches the check
          off: you may do anything with it, even nonsense. <Code>unknown</Code> is the safe variant: you may
          do <em>nothing</em> with it until you have checked what is inside. That check is called{' '}
          <strong>narrowing</strong> - more in <Verweis nr="2.4" />.
        </P>
        <TryIt id="ts-start-any-unknown" modus="ts" {...beispiele['ts-start-any-unknown']} />
        <Hinweis variante="warnung">
          <Code>any</Code> is contagious: whatever you read from an <Code>any</Code> is <Code>any</Code>{' '}
          again. A single <Code>any</Code> can switch off the check for a whole area. For "I don't know",{' '}
          <Code>unknown</Code> is almost always the better choice.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="strict: the tsconfig">
        <P>
          Which checks run is set in <Code>tsconfig.json</Code>. The most important setting is{' '}
          <Code>strict</Code>. Among other things it turns on two rules: parameters without a type are an
          error (instead of silently becoming <Code>any</Code>), and <Code>null</Code>/<Code>undefined</Code>{' '}
          must be handled explicitly. The editors here run with <Code>strict</Code>.
        </P>
        <TryIt id="ts-start-strict" modus="ts" {...beispiele['ts-start-strict']} />
        <CodeBlock code={codeBloecke.tsconfig} />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="ts-start-uebung"
          modus="ts"
          {...beispiele['ts-start-uebung']}
          aufgabe={
            <>
              <p>
                The code works, but the type check reports errors: parameters without a type are not
                accepted. Add the types - <strong>without</strong> <Code>any</Code>:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>formatPrice</Code> takes an amount and a currency
                </li>
                <li>
                  <Code>total</Code> takes an array of numbers
                </li>
                <li>
                  <Code>minMax</Code> returns a <strong>tuple</strong> of the smallest and largest value
                </li>
              </ul>
              <p className="mt-1">
                Besides the normal tests there are <strong>type tests</strong>: they check, for example, that{' '}
                <Code>formatPrice('10', 'EUR')</Code> is a type error.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'The type check reports an error. What happens when you run the code?',
            antworten: ['The program does not start at all', 'The code runs anyway - the types are just removed', 'TypeScript fixes the error automatically'],
            richtig: 1,
            erklaerung: 'Checking and translating are separate. When translating, the types are simply removed - even broken code runs. In real projects, the build (tsc) usually prevents shipping it.',
          },
          {
            frage: 'Which type does TypeScript infer for const status = "open"?',
            antworten: ['string', 'The literal type "open"', 'any'],
            richtig: 1,
            erklaerung: 'A const variable can never change - so its type is exactly that value. With let it would be string.',
          },
          {
            frage: "You don't know what JSON.parse returns. Which type is the safest?",
            antworten: ['any', 'unknown', 'object'],
            richtig: 1,
            erklaerung: 'unknown forces you to check before using the value. any would let every mistake through.',
          },
        ]}
      />

      <Merke
        punkte={[
          'TypeScript = JavaScript + types. The compiler shows mistakes before the code runs.',
          'Types are removed when translating - they do not exist at runtime.',
          <>
            Annotate parameters (<Code>name: string</Code>), mostly leave the rest to inference.
          </>,
          <>
            Arrays: <Code>number[]</Code>, tuples: <Code>[string, number]</Code>.
          </>,
          <>
            <Code>unknown</Code> instead of <Code>any</Code> - and always with <Code>"strict": true</Code>.
          </>,
        ]}
      />
    </>
  )
}
