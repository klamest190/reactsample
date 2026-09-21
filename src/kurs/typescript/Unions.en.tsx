import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Unions.code'

/**
 * KAPITEL 2.4 (English) - Unions & Narrowing
 */
export function Unions() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          A union <Code>A | B</Code> means "A or B". Built from fixed values, it describes exactly the allowed
          options - instead of any <Code>string</Code>, only these three.
        </P>
        <TryIt id="ts-unions-einstieg" modus="ts" {...beispiele['ts-unions-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Union and literal types">
        <P>
          As long as TypeScript doesn't know which type is inside, you may only use what <strong>all</strong>{' '}
          options have in common. <strong>Literal types</strong> are single values as types - together with
          unions they often replace enums and "magic strings".
        </P>
        <TryIt id="ts-unions-union" modus="ts" {...beispiele['ts-unions-union']} />
      </Abschnitt>

      <Abschnitt titel="Narrowing with typeof and truthiness">
        <P>
          <strong>Narrowing</strong> means: after a check, TypeScript knows which type is left. It works with
          plain JavaScript - <Code>typeof</Code>, <Code>if</Code>, an early <Code>return</Code>. After the{' '}
          <Code>if</Code>, the checked case is gone.
        </P>
        <TryIt id="ts-unions-typeof" modus="ts" {...beispiele['ts-unions-typeof']} />
      </Abschnitt>

      <Abschnitt titel="in and instanceof">
        <P>
          For objects, <Code>typeof</Code> doesn't help - it always returns <Code>"object"</Code>. Then you
          check with <Code>in</Code> whether a property exists, or with <Code>instanceof</Code> whether the
          value comes from a class.
        </P>
        <TryIt id="ts-unions-in-instanceof" modus="ts" {...beispiele['ts-unions-in-instanceof']} />
        <CodeBlock titel="All the ways to narrow" code={codeBloecke.eingrenzen} />
      </Abschnitt>

      <Abschnitt titel="Discriminated unions">
        <P>
          The most important pattern of this chapter: every variant gets a common field (here{' '}
          <Code>kind</Code>) with its own literal value. A <Code>switch</Code> on this field narrows the
          variant - in every <Code>case</Code>, TypeScript knows exactly its fields. Reducer actions in{' '}
          <Verweis nr="4.5" /> work exactly like this.
        </P>
        <TryIt id="ts-unions-discriminated" modus="ts" {...beispiele['ts-unions-discriminated']} />
        <CodeBlock titel="States instead of flags" code={codeBloecke.react} />
      </Abschnitt>

      <Abschnitt titel="Checking exhaustiveness with never">
        <P>
          When a variant is added later, every place that doesn't handle it yet should stand out. The trick:
          in the <Code>default</Code> branch the value is of type <Code>never</Code> if all cases are covered.
          If one is missing, the value no longer fits <Code>never</Code> - and the type check speaks up.
        </P>
        <TryIt id="ts-unions-never" modus="ts" {...beispiele['ts-unions-never']} />
        <Hinweis variante="tipp">
          Try it: remove the <Code>//</Code> in front of the triangle variant in the example and look at
          what the type check reports.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Your own type guards">
        <P>
          When the check gets longer, put it into a function. The return type <Code>value is User</Code>{' '}
          turns it into a <strong>type guard</strong>: if the function returns <Code>true</Code>, TypeScript
          treats the value as a <Code>User</Code> afterwards. Ideal for data of type <Code>unknown</Code>.
        </P>
        <TryIt id="ts-unions-guard" modus="ts" {...beispiele['ts-unions-guard']} />
        <Hinweis variante="warnung">
          TypeScript takes your type guard at its word. If it checks too little, the type no longer matches
          reality - so test such functions especially carefully.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="null and undefined">
        <P>
          With <Code>strict</Code>, <Code>null</Code> and <Code>undefined</Code> are types of their own - a
          value that "might not be there" is simply a union like <Code>number | null</Code>. Narrowing,{' '}
          <Code>?.</Code> and <Code>??</Code> do the rest.
        </P>
        <TryIt id="ts-unions-null" modus="ts" {...beispiele['ts-unions-null']} />
        <Liste>
          <li>
            <Code>value!</Code> (non-null assertion) removes <Code>null</Code> and <Code>undefined</Code> from
            the type - without any check. Only use it when you really know for sure.
          </li>
          <li>
            Better: actually check (<Code>if</Code>, <Code>??</Code>) - then type and runtime agree.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="ts-unions-uebung"
          modus="ts"
          {...beispiele['ts-unions-uebung']}
          aufgabe={
            <>
              <p>A shop knows three payment methods:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Model them as a discriminated union <Code>Payment</Code> with the common field{' '}
                  <Code>type</Code> (<Code>'card'</Code>, <Code>'paypal'</Code>, <Code>'invoice'</Code>)
                </li>
                <li>
                  <Code>describe</Code> returns <Code>"Card ending in 1234"</Code> (last four digits),{' '}
                  <Code>"PayPal (ada@example.com)"</Code> or <Code>"Invoice, due in 14 days"</Code>
                </li>
                <li>
                  <Code>fee</Code> calculates the fee: card 2 %, PayPal 3 %, invoice none
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'value has the type string | number. What may you call without a check?',
            antworten: ['value.toUpperCase()', 'value.toFixed(2)', 'value.toString()'],
            richtig: 2,
            erklaerung: 'Without narrowing, only what both types have is allowed. toString exists on string and number, toUpperCase and toFixed only on one of them.',
          },
          {
            frage: 'What turns a union into a discriminated union?',
            antworten: ['It has at least three variants', 'All variants share a field with different literal values', 'It uses interface instead of type'],
            richtig: 1,
            erklaerung: 'The common field (kind, type, status …) with its own literal per variant lets TypeScript narrow with switch or if.',
          },
          {
            frage: 'What is assertNever(shape) in the default branch for?',
            antworten: ['It always throws at runtime', 'It reports a missing case while checking', 'It turns shape into any type'],
            richtig: 1,
            erklaerung: 'If all cases are handled, shape is of type never there. If one is missing, the rest does not fit never - a type error shows the forgotten place.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Union <Code>A | B</Code> = A or B. Literal types like <Code>'open' | 'done'</Code> allow exactly
            these values.
          </>,
          <>
            Narrow with <Code>typeof</Code>, <Code>in</Code>, <Code>instanceof</Code>, comparisons and{' '}
            <Code>if (!value)</Code>.
          </>,
          <>
            Discriminated union: a common field like <Code>kind</Code>, then <Code>switch</Code>.
          </>,
          <>
            <Code>never</Code> in <Code>default</Code> checks exhaustiveness.
          </>,
          <>
            Type guards (<Code>value is User</Code>) for <Code>unknown</Code> data, <Code>!</Code> only in an
            emergency.
          </>,
        ]}
      />
    </>
  )
}
