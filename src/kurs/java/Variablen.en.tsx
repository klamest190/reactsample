import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Variablen.code'

/**
 * CHAPTER 6.2 (English) - Types & Variables
 */
export function Variablen() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          In Java every name is preceded by its type. That is more typing - and the reason the
          compiler can find so much for you.
        </P>
        <TryIt modus="java" id="java-variablen-einstieg" {...beispiele['java-variablen-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="The type belongs to the variable">
        <CodeBlock code={codeBloecke.deklaration} />
        <P>
          Once an <Code>int</Code>, always an <Code>int</Code>. A variable can never change its type
          - the difference from which almost everything else follows:
        </P>
        <CodeBlock code={codeBloecke.jsVergleich} />
        <Hinweis variante="info">
          This is called <strong>static typing</strong>: “static” because the type is settled before
          the program runs. TypeScript brings exactly this idea to JavaScript - except that there the
          types disappear again during the build (see <Verweis nr="5.8" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The eight primitive types">
        <P>
          Java has eight built-in types that are not objects. In practice you need four of them:{' '}
          <Code>int</Code>, <Code>double</Code>, <Code>boolean</Code> and <Code>char</Code>.
        </P>
        <Tabelle
          breit
          kopf={['Type', 'What for', 'Default value']}
          spalten={['align-top', undefined, 'font-mono text-xs']}
          zeilen={[
            ['int', 'Whole numbers - the default choice', '0'],
            ['long', 'Very large whole numbers (timestamps, IDs)', '0'],
            ['double', 'Decimals - the default choice', '0.0'],
            ['float', 'Decimals, half as precise. Rare.', '0.0'],
            ['boolean', 'true or false. Nothing else.', 'false'],
            ['char', "Exactly one character: 'A'", "'\\u0000'"],
            ['byte, short', 'Very small numbers. Almost never needed.', '0'],
          ].map(([typ, wofuer, standard]) => [<Code key={typ}>{typ}</Code>, wofuer, standard])}
        />
        <P>
          <Code>String</Code> is missing from this list on purpose: a string is not a primitive type
          but a <strong>class</strong> - which is why it is capitalized. More on that in{' '}
          <Verweis nr="7.5" />.
        </P>
        <TryIt modus="java" id="java-variablen-typen" {...beispiele['java-variablen-typen']} />
        <Hinweis variante="warnung">
          An <Code>int</Code> has a fixed size. If it grows too large there is no error - it starts
          again at the smallest number (overflow). JavaScript numbers do not have this problem, but
          they have others.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The trap: division with whole numbers">
        <P>
          If both sides of the <Code>/</Code> are whole numbers, Java divides as whole numbers too -
          the remainder simply disappears. This is the single most common beginner mistake in Java.
        </P>
        <TryIt modus="java" id="java-variablen-division" {...beispiele['java-variablen-division']} />
        <Hinweis variante="tipp">
          Rule of thumb: <strong>one double is enough.</strong> As soon as one of the two values is a
          decimal, Java continues in <Code>double</Code>. That is why <Code>2.0</Code>,{' '}
          <Code>(double) a</Code> or <Code>1.0 *</Code> all fix it.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Converting (casting)">
        <P>Two directions, two rules:</P>
        <Liste>
          <li>
            <strong>Upwards</strong> (<Code>int</Code> → <Code>double</Code>) happens by itself,
            because nothing can be lost.
          </li>
          <li>
            <strong>Downwards</strong> (<Code>double</Code> → <Code>int</Code>) you have to allow
            explicitly: <Code>(int) price</Code>. Java then cuts off - it does <em>not</em> round.
          </li>
        </Liste>
        <TryIt modus="java" id="java-variablen-casting" {...beispiele['java-variablen-casting']} />
      </Abschnitt>

      <Abschnitt titel="final, var - and what compares to const">
        <P>
          <Code>final</Code> is Java’s <Code>const</Code>: the value cannot be reassigned afterwards.{' '}
          <Code>var</Code>, on the other hand, only looks like JavaScript - the type is merely
          inferred by the compiler and is just as fixed afterwards.
        </P>
        <TryIt modus="java" id="java-variablen-final" {...beispiele['java-variablen-final']} />
        <Hinweis variante="info">
          By convention Java constants are written <Code>UPPER_WITH_UNDERSCORES</Code>, everything
          else in <Code>lowerCamelCase</Code>, classes in <Code>UpperCamelCase</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="When the type does not fit">
        <P>
          And this is what it looks like when you get it wrong. The error does not appear while
          running - but before:
        </P>
        <TryIt modus="java" id="java-variablen-fehler" {...beispiele['java-variablen-fehler']} />
        <P>
          For comparison: in JavaScript <Code>let count = 'three'</Code> would be perfectly fine, and
          the mistake would surface much later - maybe first for a user.
        </P>
      </Abschnitt>

      <Abschnitt titel="Primitives and their wrappers">
        <P>
          Every primitive type has a class: <Code>int</Code> → <Code>Integer</Code>,{' '}
          <Code>double</Code> → <Code>Double</Code>, <Code>boolean</Code> → <Code>Boolean</Code>,{' '}
          <Code>char</Code> → <Code>Character</Code>. Java converts between them automatically
          (“autoboxing”).
        </P>
        <CodeBlock code={codeBloecke.wrapper} />
        <P>
          This matters in <Verweis nr="7.8" />: an <Code>ArrayList</Code> can only hold objects,
          which is why it is <Code>{'List<Integer>'}</Code> there and not <Code>{'List<int>'}</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="java"
          id="java-variablen-uebung"
          {...beispiele['java-variablen-uebung']}
          aufgabe={
            <>
              <p>
                You are given <Code>items</Code> (7 pieces) and <Code>pricePerItem</Code> (2.50).
                Compute three variables from them:
              </p>
              <Liste>
                <li>
                  <Code>total</Code> - the total price
                </li>
                <li>
                  <Code>half</Code> - half the count, with decimals (3.5, not 3!)
                </li>
                <li>
                  <Code>rounded</Code> - the total price, rounded to a whole number
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What does System.out.println(9 / 4) print?',
            antworten: ['2.25', '2', '2.0', 'an error'],
            richtig: 1,
            erklaerung: 'Both values are int, so Java divides as whole numbers: 2 (the remainder is cut off).',
          },
          {
            frage: 'Which line is a compile error?',
            antworten: ['double d = 5;', 'int i = 5.0;', "char c = 'x';", 'long l = 5;'],
            richtig: 1,
            erklaerung: 'double → int loses decimals and needs an explicit cast: int i = (int) 5.0;',
          },
          {
            frage: 'What does var mean in Java?',
            antworten: [
              'The type can change later.',
              'The compiler infers the type from the value - after that it is fixed.',
              'The same as var in JavaScript.',
              'The variable is immutable.',
            ],
            richtig: 1,
            erklaerung: 'var only saves typing. Afterwards the type is just as fixed as if written out.',
          },
        ]}
      />

      <Merke
        punkte={[
          'The type comes before the name and never changes - that is static typing.',
          <>
            Four types are enough at the start: <Code>int</Code>, <Code>double</Code>,{' '}
            <Code>boolean</Code>, <Code>char</Code> - plus <Code>String</Code> (a class).
          </>,
          <>
            <Code>int / int</Code> cuts off. One <Code>double</Code> in the mix saves the result.
          </>,
          <>
            Upwards conversion is automatic, downwards only with a <Code>(cast)</Code> - and then it
            cuts off.
          </>,
          <>
            <Code>final</Code> is Java’s <Code>const</Code>. <Code>var</Code> only saves typing.
          </>,
        ]}
      />
    </>
  )
}
