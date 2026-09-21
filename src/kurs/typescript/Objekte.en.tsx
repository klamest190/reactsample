import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Objekte.code'

/**
 * KAPITEL 2.2 (English) - Object Types & Interfaces
 */
export function Objekte() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          An object type lists which fields an object has and the type of each field. With <Code>?</Code> a
          field becomes optional, with <Code>readonly</Code> immutable.
        </P>
        <TryIt id="ts-objekte-einstieg" modus="ts" {...beispiele['ts-objekte-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="type or interface?">
        <P>
          There are two ways to write object types, and they work almost the same. An{' '}
          <Code>interface</Code> is extended with <Code>extends</Code>, types are combined with{' '}
          <Code>&</Code> (intersection: "both at once").
        </P>
        <TryIt id="ts-objekte-type-interface" modus="ts" {...beispiele['ts-objekte-type-interface']} />
        <CodeBlock titel="The differences" code={codeBloecke.vergleich} />
        <Hinweis variante="tipp">
          Pick one style and stick to it. Many React projects use <Code>type</Code> because it also works for
          unions and functions. You need <Code>interface</Code> when other types should be extended
          (declaration merging).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Optional fields">
        <P>
          <Code>fontSize?: number</Code> means: the field may be missing. So its type is{' '}
          <Code>number | undefined</Code> - and TypeScript only lets you calculate with it once you have
          handled the <Code>undefined</Code> case. The operators <Code>??</Code> and <Code>?.</Code> from{' '}
          <Verweis nr="1.2" /> are made for this.
        </P>
        <TryIt id="ts-objekte-optional" modus="ts" {...beispiele['ts-objekte-optional']} />
      </Abschnitt>

      <Abschnitt titel="readonly">
        <P>
          <Code>readonly</Code> forbids reassigning a field. For arrays there is{' '}
          <Code>readonly string[]</Code>: methods that change the array, like <Code>push</Code> or{' '}
          <Code>sort</Code>, simply don't exist. Exactly the behavior React expects from state (
          <Verweis nr="1.6" />).
        </P>
        <TryIt id="ts-objekte-readonly" modus="ts" {...beispiele['ts-objekte-readonly']} />
        <Hinweis variante="info">
          <Code>readonly</Code> also only exists while checking. At runtime the object could still be
          changed - if you really want to prevent that, add <Code>Object.freeze</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Structural typing">
        <P>
          TypeScript compares types by their <strong>shape</strong>, not by their name: an object fits if it
          has at least the required fields. This is also called "duck typing" - if it quacks like a duck …
          One exception: when you write an object literal directly, TypeScript reports extra fields, because
          that is almost always a typo.
        </P>
        <TryIt id="ts-objekte-strukturell" modus="ts" {...beispiele['ts-objekte-strukturell']} />
      </Abschnitt>

      <Abschnitt titel="Any keys: index signatures and Record">
        <P>
          Sometimes you don't know the keys in advance - scores per player, for example. Then you only
          describe the types of keys and values. <Code>{'Record<K, V>'}</Code> is the shorter way to write
          it.
        </P>
        <TryIt id="ts-objekte-index" modus="ts" {...beispiele['ts-objekte-index']} />
      </Abschnitt>

      <Abschnitt titel="Nested types">
        <P>
          Types can be nested as deeply as you like. Prefer several small, named types over one big nested
          one: they are easier to read, and you can reuse them separately.
        </P>
        <TryIt id="ts-objekte-verschachtelt" modus="ts" {...beispiele['ts-objekte-verschachtelt']} />
        <Liste>
          <li>
            Arrays of objects: <Code>Order[]</Code> - an array in which every element is an{' '}
            <Code>Order</Code>.
          </li>
          <li>In callbacks like reduce or map you don't need to annotate anything - the type comes from the array.</li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="ts-objekte-uebung"
          modus="ts"
          {...beispiele['ts-objekte-uebung']}
          aufgabe={
            <>
              <p>Describe the data of a library so the type check reports no more errors:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>Book</Code>: <Code>id</Code> (a number that must never change), <Code>title</Code>,{' '}
                  <Code>author</Code>, <Code>year</Code> (a number) and an optional <Code>isbn</Code>
                </li>
                <li>
                  <Code>Library</Code>: a <Code>name</Code> and a list of <Code>books</Code>
                </li>
              </ul>
              <p className="mt-1">You don't need to change the functions below.</p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'type Point = { x: number; y: number }. Does { x: 1, y: 2, z: 3 } from a variable fit?',
            antworten: ['Yes - it has at least x and y', 'No - z is too much', 'Only with interface'],
            richtig: 0,
            erklaerung: 'Structural typing: what counts is that the required fields exist. Only for object literals written directly does TypeScript report extra fields.',
          },
          {
            frage: 'What is the type of settings.fontSize with fontSize?: number?',
            antworten: ['number', 'number | undefined', 'number | null'],
            richtig: 1,
            erklaerung: 'An optional field may be missing - then you read undefined. That is why undefined is part of the type.',
          },
          {
            frage: 'How do you combine two object types A and B into one type with all fields?',
            antworten: ['A | B', 'A & B', 'A + B'],
            richtig: 1,
            erklaerung: 'The intersection A & B has all fields of A and of B. A | B would be "A or B" - more on that in chapter 2.4.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Object types: <Code>{'type User = { name: string }'}</Code> or{' '}
            <Code>{'interface User { name: string }'}</Code>.
          </>,
          <>
            <Code>field?: T</Code> is optional (<Code>T | undefined</Code>), <Code>readonly</Code> forbids
            reassignment.
          </>,
          <>
            Extend with <Code>extends</Code> (interface) or <Code>&</Code> (type).
          </>,
          'Types are compared by their shape, not by their name.',
          <>
            Unknown keys: <Code>{'Record<string, number>'}</Code>.
          </>,
        ]}
      />
    </>
  )
}
