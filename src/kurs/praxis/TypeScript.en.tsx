import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './TypeScript.code'

/**
 * KAPITEL 5.6 (English) - TypeScript with React
 */

const ereignisse: [string, string][] = [
  ['onChange (input)', 'ChangeEvent<HTMLInputElement>'],
  ['onChange (select)', 'ChangeEvent<HTMLSelectElement>'],
  ['onSubmit', 'SubmitEvent<HTMLFormElement>'],
  ['onClick', 'MouseEvent<HTMLButtonElement>'],
  ['onKeyDown', 'KeyboardEvent<HTMLInputElement>'],
]

const hilfstypen: [string, string][] = [
  ['Partial<T>', 'All fields optional - e.g. for changes'],
  ['Pick<T, "a" | "b">', 'Only the listed fields'],
  ['Omit<T, "id">', 'All fields except the listed ones'],
  ['Record<K, V>', 'Object with keys of type K and values of type V'],
  ['keyof T', 'The field names as a union: "id" | "name" | …'],
  ['ReturnType<typeof f>', 'The return type of a function'],
]

/** Two-column table, code on the left. `codeRechts`: right column as code too. */
function Tabelle({ kopf, zeilen, codeRechts = false }: { kopf: [string, string]; zeilen: [string, string][]; codeRechts?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full max-w-3xl text-left text-sm">
        <thead className="border-b border-slate-300 dark:border-slate-700">
          <tr>
            <th className="py-2 pr-4">{kopf[0]}</th>
            <th className="py-2">{kopf[1]}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {zeilen.map(([a, b]) => (
            <tr key={a}>
              <td className="py-1.5 pr-4 align-top">
                <Code>{a}</Code>
              </td>
              <td className="py-1.5">{codeRechts ? <Code>{b}</Code> : b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TypeScriptKapitel() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          A component with typed props. Change <Code>count={'{3}'}</Code> to <Code>count="3"</Code> - the type check
          below the editor reports the error before anyone uses the app.
        </P>
        <TryIt id="praxis-typescript-einstieg" {...beispiele['praxis-typescript-einstieg']} modus="react" typen />
        <Hinweis variante="tipp">
          This chapter shows TypeScript <strong>in React</strong>. You learn the language itself - object types,
          unions, generics, utility types - in depth in part 2, starting with <Verweis id="ts-start" />.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Why TypeScript?">
        <P>
          TypeScript is JavaScript with types. You write down what kind of value a variable, a parameter or a prop
          may have - and the editor checks it as you type. Almost every new React project uses it, this learning app
          included.
        </P>
        <Liste>
          <li>
            <strong>Errors while typing instead of for your users:</strong> typos in prop names, forgotten{' '}
            <Code>null</Code> checks, wrong arguments - all underlined in red.
          </li>
          <li>
            <strong>Autocompletion:</strong> the editor knows the fields of every object and the props of every
            component.
          </li>
          <li>
            <strong>Safe refactoring:</strong> rename a field and the compiler shows you every place you need to
            update.
          </li>
          <li>
            <strong>Documentation that stays current:</strong> the props type tells you how to use a component.
          </li>
        </Liste>
        <Hinweis variante="info">
          Good to know: TypeScript never runs in the browser. Vite (and the editor here) only strip the types when
          compiling - checking happens <em>separately</em>, in your editor and with <Code>tsc</Code>. That is why the
          preview here keeps running even with type errors. Types do not change what the code does.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The most important types">
        <P>
          You know the basic types from <Verweis id="js-variablen" />: <Code>string</Code>, <Code>number</Code>,{' '}
          <Code>boolean</Code>. On top of that there are arrays (<Code>string[]</Code>), object types with{' '}
          <Code>type</Code> and <strong>union types</strong> with <Code>|</Code> - “one or the other”. Unions of
          fixed values such as <Code>'all' | 'open' | 'done'</Code> are especially useful.
        </P>
        <TryIt id="praxis-typescript-grundlagen" {...beispiele['praxis-typescript-grundlagen']} modus="react" typen />
        <P>
          You do not have to annotate everything. TypeScript <strong>infers types</strong>:{' '}
          <Code>let attempts = 0</Code> is a <Code>number</Code> automatically. You mostly write types at the
          boundaries: function parameters, props and start values that reveal nothing (<Code>[]</Code>,{' '}
          <Code>null</Code>).
        </P>
      </Abschnitt>

      <Abschnitt titel="Typing props">
        <P>
          Props are an object - so you describe them with an object type. Optional props get a <Code>?</Code> and a
          default value when destructuring. For <Code>children</Code> use <Code>ReactNode</Code>: anything React can
          render (<Verweis id="react-props" />).
        </P>
        <TryIt id="praxis-typescript-props" {...beispiele['praxis-typescript-props']} modus="react" typen />
        <Liste>
          <li>
            <Code>ComponentProps&lt;'button'&gt;</Code> gives you all props of a real <Code>{'<button>'}</Code> (
            <Code>type</Code>, <Code>onClick</Code>, <Code>disabled</Code>, …). Combined with <Code>&amp;</Code> you
            get your own component that is used just like the HTML element.
          </li>
          <li>
            <Code>type</Code> or <Code>interface</Code>? Both work for props. Pick one per project - this app uses{' '}
            <Code>type</Code> because it can also express unions.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="State, refs and events">
        <P>
          <Code>useState('')</Code> needs no type, TypeScript sees the start value. It is different with{' '}
          <Code>null</Code> or <Code>[]</Code>: they reveal nothing about what comes later. Then you pass the type in
          angle brackets: <Code>useState&lt;User | null&gt;(null)</Code>. Refs to DOM elements get the element type (
          <Verweis id="hooks-useref" />).
        </P>
        <TryIt id="praxis-typescript-state" {...beispiele['praxis-typescript-state']} modus="react" typen />
        <P>
          After <Code>if (user)</Code> or <Code>user ? … : …</Code> TypeScript knows that <Code>user</Code> is not{' '}
          <Code>null</Code>. This is called <strong>narrowing</strong> - and exactly these forgotten checks are one of
          the most common causes of crashes in JavaScript.
        </P>
        <P>
          If you write handlers inline in JSX (<Code>{'onChange={(e) => …}'}</Code>), TypeScript knows the type of{' '}
          <Code>e</Code> on its own. Only handlers defined separately need an annotation:
        </P>
        <Tabelle kopf={['Event', 'Type (from react)']} zeilen={ereignisse} codeRechts />
        <Hinweis variante="tipp">
          No need to memorize them: hover over <Code>onChange</Code> in VS Code - the tooltip shows the type.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Reducers with discriminated unions">
        <P>
          Reducers (<Verweis id="hooks-usereducer" />) are where TypeScript shines most. Every action is its own object
          type with a fixed <Code>type</Code>, all of them together form a union. Inside the <Code>switch</Code>,
          TypeScript then knows in every <Code>case</Code> which fields the action has.
        </P>
        <TryIt id="praxis-typescript-reducer" {...beispiele['praxis-typescript-reducer']} modus="react" typen />
        <P>
          The <Code>default</Code> branch with <Code>never</Code> is a safety net: add the action{' '}
          <Code>{"| { type: 'removed'; id: number }"}</Code> at the top - the type check immediately reports that the
          reducer does not handle it yet. That way no case gets forgotten as your app grows.
        </P>
      </Abschnitt>

      <Abschnitt titel="Typing context">
        <P>
          <Code>createContext</Code> needs a type because the start value is usually <Code>null</Code>. The pro
          pattern from <Verweis id="hooks-usecontext" /> gets even better with TypeScript: the custom hook checks for{' '}
          <Code>null</Code> once - every caller gets a clean type without <Code>null</Code>.
        </P>
        <TryIt id="praxis-typescript-context" {...beispiele['praxis-typescript-context']} modus="react" typen />
      </Abschnitt>

      <Abschnitt titel="Generic components">
        <P>
          Some components work with any data, like a list or a table. With a <strong>type parameter</strong>{' '}
          <Code>&lt;T&gt;</Code> everything stays type-safe anyway: TypeScript fills in <Code>T</Code> at every usage
          from the <Code>items</Code> you pass.
        </P>
        <TryIt id="praxis-typescript-generisch" {...beispiele['praxis-typescript-generisch']} modus="react" typen />
      </Abschnitt>

      <Abschnitt titel="Types from types and outside data">
        <P>Instead of writing similar types several times, you derive them. The most important utility types:</P>
        <Tabelle kopf={['Utility type', 'Result']} zeilen={hilfstypen} />
        <P>
          TypeScript knows nothing about data from outside - from <Code>JSON.parse</Code>, <Code>fetch</Code> or{' '}
          <Code>localStorage</Code>. Give it the type <Code>unknown</Code> and check it before using it. A function
          with the return type <Code>value is Customer</Code> (a <strong>type guard</strong>) tells TypeScript the
          result of the check.
        </P>
        <TryIt id="praxis-typescript-typen" {...beispiele['praxis-typescript-typen']} modus="react" typen />
        <Hinweis variante="warnung">
          <Code>any</Code> switches checking off - and an <Code>any</Code> silently infects everything it touches.{' '}
          <Code>unknown</Code> is the safe variant: it accepts anything but can only be used after a check. And{' '}
          <Code>as Customer</Code> checks nothing either, it only claims.
        </Hinweis>
        <Hinweis variante="tipp">
          Hand-written type guards get long quickly. Real projects describe the shape of the data with{' '}
          <strong>Zod</strong> or <strong>Valibot</strong>: the schema checks at runtime and gives you the TypeScript
          type at the same time.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="TypeScript in your own project">
        <P>
          Vite comes with a ready-made template (more in <Verweis id="praxis-lokal" />):
        </P>
        <CodeBlock titel="Terminal" code={codeBloecke.anlegen} />
        <P>
          The settings live in <Code>tsconfig.json</Code>. The most important one is <Code>strict</Code> - without it
          you lose exactly the checks that find the most bugs:
        </P>
        <CodeBlock titel="tsconfig.json (excerpt)" code={codeBloecke.tsconfig} />
        <CodeBlock titel="Terminal" code={codeBloecke.pruefen} />
        <Hinweis variante="tipp">
          Migrating from JavaScript works step by step: rename one file at a time from <Code>.jsx</Code> to{' '}
          <Code>.tsx</Code> and fix the errors the compiler reports. That is exactly what you practice now.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="praxis-typescript-uebung"
          {...beispiele['praxis-typescript-uebung']}
          modus="react"
          typen
          aufgabe={
            <>
              <p>The cart works, but it is still plain JavaScript. Make the type check green:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Create the types <Code>Product</Code> and <Code>CartItem</Code> (product + quantity) and use them.
                </li>
                <li>
                  Give the state a type: <Code>useState&lt;…&gt;([])</Code>.
                </li>
                <li>
                  Type the parameters of <Code>formatPrice</Code>, <Code>add</Code> and <Code>remove</Code> and the props
                  of <Code>CartLine</Code>.
                </li>
                <li>The behavior stays the same. “No type errors” is one of the tests.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What happens to the types when Vite builds the app?',
            antworten: [
              'They are turned into runtime checks',
              'They are removed - checking is done separately by tsc or the editor',
              'The browser checks them while loading',
            ],
            richtig: 1,
            erklaerung: 'Plain JavaScript reaches the browser. That is why tsc -b belongs in the build.',
          },
          {
            frage: 'When does useState need a type in angle brackets?',
            antworten: ['Always', 'When the start value does not reveal the type, e.g. null or []', 'Only for objects'],
            richtig: 1,
            erklaerung: "useState('') is a string automatically - useState<User | null>(null) has to be spelled out.",
          },
          {
            frage: 'What is the never branch in the reducer for?',
            antworten: [
              'It catches runtime errors',
              'It reports at compile time when an action is missing in the switch',
              'It makes the reducer faster',
            ],
            richtig: 1,
            erklaerung: 'If all cases are handled, only never is left for action - otherwise you get a type error.',
          },
          {
            frage: 'Which type do you give data from JSON.parse before checking it?',
            antworten: ['any', 'unknown', 'object'],
            richtig: 1,
            erklaerung: 'unknown forces a check. any would switch every check off.',
          },
        ]}
      />

      <Merke
        punkte={[
          'TypeScript checks during development - plain JavaScript runs in the browser.',
          <>
            Props as an object type, <Code>children: ReactNode</Code>, optional props with <Code>?</Code>.
          </>,
          <>
            Types only where they cannot be inferred: parameters, <Code>useState&lt;T | null&gt;(null)</Code>,{' '}
            <Code>useRef&lt;HTMLInputElement&gt;(null)</Code>.
          </>,
          'Actions as a discriminated union, context with a null check in a custom hook.',
          <>
            Outside data is <Code>unknown</Code> - check first, then use. Always keep <Code>strict</Code> on.
          </>,
        ]}
      />
    </>
  )
}
