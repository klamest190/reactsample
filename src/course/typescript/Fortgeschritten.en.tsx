import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/ChapterLink'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Fortgeschritten.code'

/**
 * KAPITEL 2.8 (English) - Advanced Types & Practice
 */
export function Fortgeschritten() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          You can compute with types: a <strong>mapped type</strong> goes over all keys of a type and builds a
          new one from it - just like <Code>map</Code> builds a new array. The utility types from{' '}
          <Verweis nr="2.6" /> are built exactly this way.
        </P>
        <TryIt id="ts-fortgeschritten-einstieg" mode="ts" {...examples['ts-fortgeschritten-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Mapped types">
        <P>
          <Code>{'{ [K in keyof T]: … }'}</Code> means: one field for every key <Code>K</Code> of{' '}
          <Code>T</Code>. With <Code>?</Code> and <Code>readonly</Code> you add modifiers, with a minus in
          front you remove them.
        </P>
        <TryIt id="ts-fortgeschritten-mapped" mode="ts" {...examples['ts-fortgeschritten-mapped']} />
      </Abschnitt>

      <Abschnitt titel="Conditional types and infer">
        <P>
          <Code>T extends U ? X : Y</Code> is a ternary operator for types. With <Code>infer</Code> you pull a
          part out - like the element type of an array or the value of a promise. That is how{' '}
          <Code>ReturnType</Code> and <Code>Awaited</Code> are built.
        </P>
        <TryIt id="ts-fortgeschritten-conditional" mode="ts" {...examples['ts-fortgeschritten-conditional']} />
        <Hinweis variante="info">
          You rarely write such types yourself in everyday code - but you read them all the time in the types
          of libraries. If you can decipher them, you also understand long error messages.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Template literal types">
        <P>
          Like template strings, just for types: unions produce every combination. With{' '}
          <Code>Capitalize</Code>, <Code>Uppercase</Code> and friends you can reshape names - that is how{' '}
          <Code>'click'</Code> becomes the type <Code>'onClick'</Code>.
        </P>
        <TryIt id="ts-fortgeschritten-template" mode="ts" {...examples['ts-fortgeschritten-template']} />
      </Abschnitt>

      <Abschnitt titel="Type assertions: as">
        <P>
          <Code>value as Type</Code> tells the compiler: "trust me". Nothing is checked and nothing is
          converted - if the claim is wrong, you have a wrong type and no error. So: prefer checking (
          <Code>instanceof</Code>, type guards) over claiming.
        </P>
        <TryIt id="ts-fortgeschritten-assertions" mode="ts" {...examples['ts-fortgeschritten-assertions']} />
      </Abschnitt>

      <Abschnitt titel="Typing async code">
        <P>
          An <Code>async</Code> function always returns a <Code>{'Promise<T>'}</Code>, <Code>await</Code>{' '}
          unwraps it again. Feel free to write out the return type of functions that load data - it is the
          place every caller relies on.
        </P>
        <TryIt id="ts-fortgeschritten-async" mode="ts" {...examples['ts-fortgeschritten-async']} />
      </Abschnitt>

      <Abschnitt titel="Checking data from the server">
        <P>
          The most important boundary of every app: TypeScript doesn't know what comes from outside.{' '}
          <Code>response.json()</Code> returns <Code>any</Code> - an <Code>as Product</Code> would only be a
          claim. It only becomes safe when you check the data at runtime and turn it into a type.
        </P>
        <TryIt id="ts-fortgeschritten-validieren" mode="ts" {...examples['ts-fortgeschritten-validieren']} />
        <CodeBlock title="The same with a library" code={codeBloecke.zod} />
      </Abschnitt>

      <Abschnitt titel="The tsconfig in a real project">
        <P>
          A new Vite project (<Code>npm create vite@latest</Code>, template "React + TypeScript") already
          comes with a good tsconfig. These options are especially worth it:
        </P>
        <CodeBlock code={codeBloecke.tsconfig} />
        <Liste>
          <li>
            <Code>npx tsc --noEmit</Code> checks the whole project - it usually already runs as part of{' '}
            <Code>npm run build</Code>.
          </li>
          <li>
            TypeScript in React continues with props, events, hooks and context in{' '}
            <Verweis id="praxis-typescript" />.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="ts-fortgeschritten-uebung"
          mode="ts"
          {...examples['ts-fortgeschritten-uebung']}
          task={
            <>
              <p>A type-safe event emitter - the masterpiece of this part:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>on(event, handler)</Code>: only known events, and the handler gets exactly the data of
                  that event
                </li>
                <li>
                  <Code>emit(event, data)</Code>: only known events with the matching data
                </li>
                <li>
                  <Code>{'HandlerProps<Events>'}</Code>: an object type with <Code>onLogin</Code>,{' '}
                  <Code>onLogout</Code> and <Code>onPurchase</Code> - each with the matching handler
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'What is { [K in keyof T]: string } for T = { a: number; b: boolean }?',
            answers: ['{ a: number; b: boolean }', '{ a: string; b: string }', 'string'],
            correct: 1,
            explanation: 'The mapped type keeps all keys of T, but gives each of them the type string.',
          },
          {
            question: 'What does const user = data as User do at runtime?',
            answers: ['It checks whether data is a User', 'It converts data into a User', 'Nothing - as only exists while checking'],
            correct: 2,
            explanation: 'Type assertions are removed when translating. If the claim is wrong, nobody notices - until something crashes.',
          },
          {
            question: 'What is the safest way to handle data from response.json()?',
            answers: ['Cast it to the expected type with as', 'Treat it as unknown and check it at runtime', 'Keep working with any'],
            correct: 1,
            explanation: 'Only a real check (by hand or with a library like zod) makes sure type and data match.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Mapped types: <Code>{'{ [K in keyof T]: … }'}</Code> - that is how Partial, Readonly and friends are
            built.
          </>,
          <>
            Conditional types: <Code>T extends U ? X : Y</Code>, pull parts out with <Code>infer</Code>.
          </>,
          <>
            Template literal types: <Code>{'`on${Capitalize<T>}`'}</Code>.
          </>,
          <>
            <Code>as</Code> is a claim without a check - prefer narrowing.
          </>,
          <>
            Data from outside is <Code>unknown</Code>: check it at runtime, then type it.
          </>,
        ]}
      />
    </>
  )
}
