import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './UtilityTypes.code'

/**
 * KAPITEL 2.6 (English) - Type Operators & Utility Types
 */
export function UtilityTypes() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          A todo that is about to be created has no <Code>id</Code> yet, an update only changes single fields.
          Instead of copying new types for that, you derive them from the original with{' '}
          <strong>utility types</strong>. When <Code>Todo</Code> changes, all derived types change with it.
        </P>
        <TryIt id="ts-utility-einstieg" modus="ts" {...beispiele['ts-utility-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="typeof, keyof and indexed access">
        <P>Three operators that almost everything else is built from:</P>
        <Liste>
          <li>
            <Code>typeof value</Code> - in a type position it turns a <strong>value</strong> into a type
          </li>
          <li>
            <Code>keyof Type</Code> - the union of all keys
          </li>
          <li>
            <Code>{"Type['field']"}</Code> - the type of a single field (indexed access)
          </li>
        </Liste>
        <TryIt id="ts-utility-keyof-typeof" modus="ts" {...beispiele['ts-utility-keyof-typeof']} />
        <Hinweis variante="info">
          Watch the position: <Code>typeof x</Code> in normal code is the JavaScript <Code>typeof</Code> and
          returns a string like <Code>"object"</Code> at runtime. After <Code>type … =</Code> or a colon, it is
          the TypeScript operator.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="as const">
        <P>
          Normally TypeScript widens values: <Code>'small'</Code> in an array becomes <Code>string</Code>. With{' '}
          <Code>as const</Code> every value stays its own literal type, and everything becomes{' '}
          <Code>readonly</Code>. That way a list of values becomes the single source - the union type follows
          from it.
        </P>
        <TryIt id="ts-utility-as-const" modus="ts" {...beispiele['ts-utility-as-const']} />
      </Abschnitt>

      <Abschnitt titel="satisfies">
        <P>
          An annotation (<Code>const x: Type = …</Code>) checks the value, but replaces its type with the more
          general one. <Code>satisfies Type</Code> checks just the same - but keeps the exact type of the
          value. That is ideal for configurations and lookup tables.
        </P>
        <TryIt id="ts-utility-satisfies" modus="ts" {...beispiele['ts-utility-satisfies']} />
        <Hinweis variante="tipp">
          The code examples of this course use exactly this: <Code>{'satisfies Record<string, CodeBeispiel>'}</Code>{' '}
          checks every example - and still TypeScript knows every single ID.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The most important utility types">
        <P>
          TypeScript comes with a set of ready-made type tools. You don't need to know them by heart - but you
          should know they exist.
        </P>
        <TryIt id="ts-utility-mehr" modus="ts" {...beispiele['ts-utility-mehr']} />
        <CodeBlock titel="Overview" code={codeBloecke.uebersicht} />
        <Liste>
          <li>
            <Code>{'ReturnType<typeof fn>'}</Code> is handy when the type comes from a function you didn't write
            yourself.
          </li>
          <li>
            In React you'll also meet <Code>{"ComponentProps<'button'>"}</Code> and <Code>ReactNode</Code> -
            more on that in the TypeScript chapter of part 5.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="ts-utility-uebung"
          modus="ts"
          {...beispiele['ts-utility-uebung']}
          aufgabe={
            <>
              <p>
                Derive all types from <Code>Product</Code> - without copying a single field:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>ProductDraft</Code>: everything except <Code>id</Code>
                </li>
                <li>
                  <Code>ProductPatch</Code>: only <Code>name</Code>, <Code>price</Code> and <Code>stock</Code>, all
                  optional
                </li>
                <li>
                  <Code>ProductSummary</Code>: only <Code>id</Code> and <Code>name</Code>
                </li>
                <li>
                  <Code>Category</Code>: one of the values in <Code>CATEGORIES</Code>
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Which type has all fields of User except password?',
            antworten: ["Pick<User, 'password'>", "Omit<User, 'password'>", "Partial<User>"],
            richtig: 1,
            erklaerung: 'Omit leaves out the listed fields, Pick keeps only the listed ones.',
          },
          {
            frage: "What is (typeof SIZES)[number] for const SIZES = ['s', 'm'] as const?",
            antworten: ['number', 'string', "'s' | 'm'"],
            richtig: 2,
            erklaerung: 'as const turns the array into a readonly tuple of literal types. [number] reads the type of all elements - the union of the values.',
          },
          {
            frage: 'What is the difference between satisfies and a type annotation?',
            antworten: ['satisfies does not check at all', 'satisfies checks the value but keeps its exact type', 'satisfies only works with functions'],
            richtig: 1,
            erklaerung: 'Both check against the type. The annotation replaces the type with the more general one, satisfies keeps the inferred type.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Derive instead of copying: <Code>Partial</Code>, <Code>Pick</Code>, <Code>Omit</Code>,{' '}
            <Code>Record</Code>, <Code>Readonly</Code>.
          </>,
          <>
            <Code>typeof value</Code> turns a value into a type, <Code>keyof</Code> returns the keys,{' '}
            <Code>{"T['field']"}</Code> a field type.
          </>,
          <>
            <Code>as const</Code> + <Code>(typeof LIST)[number]</Code> = a union from a list of values.
          </>,
          <>
            <Code>satisfies</Code> checks and keeps the exact type.
          </>,
          <>
            <Code>ReturnType</Code>, <Code>Parameters</Code>, <Code>Awaited</Code> get types out of functions.
          </>,
        ]}
      />
    </>
  )
}
