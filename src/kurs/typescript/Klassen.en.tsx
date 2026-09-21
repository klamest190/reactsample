import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Klassen.code'

/**
 * KAPITEL 2.7 (English) - Classes, Enums & Modules
 */
export function Klassen() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          You know classes from <Verweis nr="1.8" />. TypeScript adds types for fields and methods - and access
          modifiers like <Code>private</Code> and <Code>readonly</Code> that decide who may read and change
          what.
        </P>
        <TryIt id="ts-klassen-einstieg" modus="ts" {...beispiele['ts-klassen-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Access modifiers and parameter properties">
        <P>
          <Code>public</Code> (the default) is visible to everyone, <Code>protected</Code> only to the class
          and its subclasses, <Code>private</Code> only to the class itself. A modifier in front of a
          constructor parameter automatically turns it into a field - which saves the lines{' '}
          <Code>this.name = name</Code>.
        </P>
        <TryIt id="ts-klassen-modifikatoren" modus="ts" {...beispiele['ts-klassen-modifikatoren']} />
        <Hinweis variante="info">
          <Code>private</Code> only exists while checking - at runtime the field is perfectly reachable.
          JavaScript's <Code>#</Code> fields, on the other hand, are private at runtime too. Both are fine,
          just don't mix them in one class.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="implements and abstract">
        <P>
          With <Code>implements</Code> a class promises to fulfill an interface - the compiler checks that all
          members are there. An <Code>abstract</Code> class is an unfinished base class: it can't be created
          itself, and the subclasses must write its <Code>abstract</Code> methods.
        </P>
        <TryIt id="ts-klassen-implements" modus="ts" {...beispiele['ts-klassen-implements']} />
        <Liste>
          <li>
            <Code>override</Code> marks that a method replaces the one of the base class - so typos in the name
            stand out.
          </li>
          <li>
            Classes are rare in React code (components are functions). But you'll meet them often in services,
            error classes and libraries.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Enums - and why unions are often better">
        <P>
          An <Code>enum</Code> is a set of named constants. Unlike almost everything else in TypeScript it
          produces real JavaScript code. Many teams use unions of literal types instead (or an object with{' '}
          <Code>as const</Code>): they disappear completely when translating, and you can simply write{' '}
          <Code>'active'</Code>.
        </P>
        <TryIt id="ts-klassen-enums" modus="ts" {...beispiele['ts-klassen-enums']} />
      </Abschnitt>

      <Abschnitt titel="Modules: exporting and importing types">
        <P>
          Types are passed between files with <Code>export</Code> and <Code>import</Code>, just like values.{' '}
          <Code>import type</Code> says explicitly: this is only a type - the line disappears completely when
          translating.
        </P>
        <CodeBlock titel="Types between files" code={codeBloecke.module} />
        <Hinweis variante="tipp">
          With the tsconfig option <Code>verbatimModuleSyntax</Code> (the default in Vite projects),{' '}
          <Code>import type</Code> is even required when you only import types.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="declare and .d.ts files">
        <P>
          <Code>declare</Code> describes something that already exists at runtime, without producing code for
          it. Files ending in <Code>.d.ts</Code> contain only such descriptions - that is how JavaScript
          libraries get their types.
        </P>
        <TryIt id="ts-klassen-declare" modus="ts" {...beispiele['ts-klassen-declare']} />
        <CodeBlock code={codeBloecke.dts} />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="ts-klassen-uebung"
          modus="ts"
          {...beispiele['ts-klassen-uebung']}
          aufgabe={
            <>
              <p>
                Write the class <Code>ShoppingCart</Code>:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  It fulfills the interface <Code>CartLike</Code>
                </li>
                <li>
                  The constructor takes the owner as a <Code>public readonly</Code> parameter property{' '}
                  <Code>owner</Code>
                </li>
                <li>
                  The items live in a <Code>private</Code> field <Code>items</Code>
                </li>
                <li>
                  <Code>add</Code> only increases the quantity for the same <Code>sku</Code>, <Code>remove</Code>{' '}
                  removes an item
                </li>
                <li>
                  <Code>total</Code> is a getter: the sum of price times quantity
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'constructor(private name: string) {} - what happens?',
            antworten: ['Nothing, the parameter is only visible in the constructor', 'A private field name is created and set automatically', 'A syntax error'],
            richtig: 1,
            erklaerung: 'A parameter property: the modifier in front of the parameter declares the field and assigns the value.',
          },
          {
            frage: 'What does class Circle implements Shape check?',
            antworten: ['That Circle has all members of Shape', 'That Circle inherits from Shape', 'Nothing - implements is just documentation'],
            richtig: 0,
            erklaerung: 'implements inherits nothing, it lets the compiler check that the class fulfills the interface.',
          },
          {
            frage: 'What is the difference between an enum and a union of literal types?',
            antworten: ['None', 'An enum produces real JavaScript code, the union disappears when translating', 'Unions only work with numbers'],
            richtig: 1,
            erklaerung: 'Enums are one of the few TypeScript features with runtime code. Unions are pure types.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Declare fields with a type, <Code>private</Code> / <Code>protected</Code> / <Code>readonly</Code>{' '}
            control access.
          </>,
          <>
            Parameter properties: <Code>constructor(private name: string) {'{}'}</Code>.
          </>,
          <>
            <Code>implements</Code> checks an interface, <Code>abstract</Code> forces methods in subclasses.
          </>,
          <>
            Unions of literals are often the leaner alternative to <Code>enum</Code>.
          </>,
          <>
            <Code>import type</Code> for pure types, <Code>declare</Code> and <Code>.d.ts</Code> describe existing
            code.
          </>,
        ]}
      />
    </>
  )
}
