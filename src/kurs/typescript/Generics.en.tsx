import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Generics.code'

/**
 * KAPITEL 2.5 (English) - Generics
 */
export function Generics() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          Some functions work with any type - "return the first element", for example. With <Code>any</Code>{' '}
          you would lose the information about which type comes out. A <strong>type parameter</strong>{' '}
          <Code>{'<T>'}</Code> is a placeholder that TypeScript fills in anew on every call.
        </P>
        <TryIt id="ts-generics-einstieg" modus="ts" {...beispiele['ts-generics-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Generic functions">
        <P>
          Type parameters go in angle brackets after the function name, and there may be several. Usually
          TypeScript infers them from the arguments - but you can also pass them explicitly:{' '}
          <Code>{"pair<string, boolean>('ok', true)"}</Code>.
        </P>
        <TryIt id="ts-generics-funktionen" modus="ts" {...beispiele['ts-generics-funktionen']} />
        <Hinweis variante="info">
          The names <Code>T</Code>, <Code>U</Code>, <Code>K</Code> (key) and <Code>V</Code> (value) are just
          convention. For more complex types, descriptive names like <Code>TItem</Code> help.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Constraining with extends">
        <P>
          Without a constraint, TypeScript knows nothing about <Code>T</Code> - you couldn't even read{' '}
          <Code>.length</Code>. With <Code>{'T extends { length: number }'}</Code> you only allow types that
          have at least this shape. Unlike a fixed parameter type, <Code>T</Code> keeps all its other fields.
        </P>
        <TryIt id="ts-generics-constraints" modus="ts" {...beispiele['ts-generics-constraints']} />
      </Abschnitt>

      <Abschnitt titel="keyof and indexed access">
        <P>
          <Code>keyof T</Code> is the union of all keys of a type, <Code>T[K]</Code> the type of the field{' '}
          <Code>K</Code>. Combined with generics you get functions that only accept valid keys and return the
          matching type - more on both operators in <Verweis nr="2.6" />.
        </P>
        <TryIt id="ts-generics-keyof" modus="ts" {...beispiele['ts-generics-keyof']} />
      </Abschnitt>

      <Abschnitt titel="Generic types">
        <P>
          Types can have parameters too - ideal for wrappers around any data, like an API response. You
          already know many generic types: <Code>{'Array<T>'}</Code>, <Code>{'Promise<T>'}</Code>,{' '}
          <Code>{'Map<K, V>'}</Code>, <Code>{'Set<T>'}</Code>.
        </P>
        <TryIt id="ts-generics-typen" modus="ts" {...beispiele['ts-generics-typen']} />
      </Abschnitt>

      <Abschnitt titel="Generic classes">
        <P>
          A class with a type parameter fixes the type on creation: <Code>{'new Stack<number>()'}</Code>.
          After that, only numbers go in - and guaranteed numbers come out.
        </P>
        <TryIt id="ts-generics-klassen" modus="ts" {...beispiele['ts-generics-klassen']} />
      </Abschnitt>

      <Abschnitt titel="When are generics worth it?">
        <P>
          A type parameter pays off when it <strong>connects</strong> something - typically input and output.
          If it appears in only one place, a normal type like <Code>unknown</Code> is usually enough.
        </P>
        <CodeBlock code={codeBloecke.wann} />
        <CodeBlock titel="Generics in React" code={codeBloecke.react} />
        <Liste>
          <li>
            <Code>{'useState<Todo[]>([])'}</Code>: TypeScript can't infer the type from an empty array - so you
            pass it.
          </li>
          <li>Generic components work exactly like generic functions.</li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="ts-generics-uebung"
          modus="ts"
          {...beispiele['ts-generics-uebung']}
          aufgabe={
            <>
              <p>
                The three helper functions already run - but with <Code>any</Code>, every type is lost. Replace
                every <Code>any</Code> with type parameters:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>last</Code> returns the item type or <Code>undefined</Code>
                </li>
                <li>
                  <Code>groupBy</Code> knows the item type inside the callback
                </li>
                <li>
                  <Code>pluck</Code> only accepts existing keys and returns an array of that field's type
                </li>
              </ul>
              <p className="mt-1">The type tests check that the types are precise enough.</p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'function first<T>(list: T[]): T | undefined. What is the type of first(["a", "b"])?',
            antworten: ['any', 'string | undefined', 'T'],
            richtig: 1,
            erklaerung: 'TypeScript fills in string for T, which it infers from the argument.',
          },
          {
            frage: 'What does <T extends { id: number }> do?',
            antworten: ['T is exactly { id: number }', 'T must have at least a field id: number and keeps its other fields', 'T must not have an id'],
            richtig: 1,
            erklaerung: 'extends is a minimum requirement. If you pass { id: 1, title: "x" }, title stays in the type.',
          },
          {
            frage: 'type User = { name: string; age: number }. What is keyof User?',
            antworten: ['"name" | "age"', 'string | number', 'string[]'],
            richtig: 0,
            erklaerung: 'keyof returns the union of the keys. You get the value types with User[keyof User].',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Type parameter: <Code>{'function first<T>(list: T[]): T | undefined'}</Code> - filled in on every
            call.
          </>,
          <>
            Constrain with <Code>{'<T extends { length: number }>'}</Code>.
          </>,
          <>
            <Code>{'<T, K extends keyof T>'}</Code> and <Code>T[K]</Code> for type-safe field access.
          </>,
          <>
            Generic types: <Code>{'type ApiResponse<T> = { data: T }'}</Code>, classes:{' '}
            <Code>{'class Stack<T>'}</Code>.
          </>,
          'Generics instead of any - they connect input and output.',
        ]}
      />
    </>
  )
}
