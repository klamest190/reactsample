import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Arrays.code'

/**
 * CHAPTER 6.5 (English) - Arrays & Strings
 */
export function Arrays() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          An array in Java has <strong>one type</strong> and <strong>a fixed length</strong>. Both
          are settled the moment it exists.
        </P>
        <TryIt modus="java" id="java-arrays-einstieg" {...beispiele['java-arrays-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Creating them - and the thing about length">
        <CodeBlock code={codeBloecke.anlegen} />
        <Hinweis variante="warnung">
          <Code>array.length</Code> without parentheses, <Code>text.length()</Code> with. The reason:
          on an array it is a field, on a string a method. This inconsistency is a classic and
          catches everyone once.
        </Hinweis>
        <CodeBlock code={codeBloecke.jsVergleich} />
      </Abschnitt>

      <Abschnitt titel="The length is fixed">
        <P>
          There is no <Code>push</Code>. If you need more room you create a new array and copy - or
          use an <Code>ArrayList</Code> right away (<Verweis nr="7.8" />).
        </P>
        <TryIt modus="java" id="java-arrays-laenge" {...beispiele['java-arrays-laenge']} />
        <Hinweis variante="tipp">
          <Code>System.out.println(array)</Code> prints <Code>[I@1b6d2f1d</Code> - a type code and a
          memory address. For the content you need <Code>Arrays.toString(array)</Code>, and{' '}
          <Code>Arrays.deepToString(array)</Code> for nested arrays.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Default values - and null">
        <P>
          A fresh <Code>int[]</Code> is full of zeros, a <Code>boolean[]</Code> full of{' '}
          <Code>false</Code>. A <Code>String[]</Code>, however, is full of <Code>null</Code> - and{' '}
          <Code>null</Code> has no methods:
        </P>
        <TryIt modus="java" id="java-arrays-npe" {...beispiele['java-arrays-npe']} />
        <P>
          The <Code>NullPointerException</Code> is the most common runtime error in Java. Its
          inventor Tony Hoare calls it “my billion-dollar mistake” today. In <Verweis nr="7.9" /> you
          will learn how to deal with it.
        </P>
      </Abschnitt>

      <Abschnitt titel="Two-dimensional arrays">
        <P>
          An <Code>int[][]</Code> is an array of arrays - a table. The rows may even have different
          lengths.
        </P>
        <TryIt modus="java" id="java-arrays-zweidimensional" {...beispiele['java-arrays-zweidimensional']} />
      </Abschnitt>

      <Abschnitt titel="Strings are objects - and immutable">
        <P>
          A <Code>String</Code> is not a primitive type but an object of the class{' '}
          <Code>String</Code>. And it is <strong>immutable</strong>: no method changes it, every
          method returns a new one.
        </P>
        <TryIt modus="java" id="java-arrays-strings" {...beispiele['java-arrays-strings']} />
        <Hinweis variante="info">
          The same idea is behind React state: do not change it, replace it (<Verweis nr="1.6" />).
          In Java it applies to strings by default.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The == trap">
        <P>
          Because strings are objects, <Code>==</Code> does not compare their content but their{' '}
          <strong>identity</strong>: are these two names for the same object?
        </P>
        <CodeBlock code={codeBloecke.gleichheit} />
        <P>
          It gets confusing because equal literals share one object (the “string pool”) - so{' '}
          <Code>==</Code> sometimes happens to be <Code>true</Code>. Which is exactly why the rule is
          as simple as it is absolute:
        </P>
        <Hinweis variante="warnung">
          <strong>
            For objects always <Code>equals</Code>, never <Code>==</Code>.
          </strong>{' '}
          For primitive types (<Code>int</Code>, <Code>double</Code>, <Code>char</Code>,{' '}
          <Code>boolean</Code>) always <Code>==</Code>.
        </Hinweis>
        <TryIt modus="java" id="java-arrays-gleichheit" {...beispiele['java-arrays-gleichheit']} />
      </Abschnitt>

      <Abschnitt titel="Building many strings: StringBuilder">
        <P>
          Because every <Code>+</Code> creates a new string, this gets expensive in loops. A{' '}
          <Code>StringBuilder</Code> collects everything in a single object instead.
        </P>
        <TryIt modus="java" id="java-arrays-builder" {...beispiele['java-arrays-builder']} />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="java"
          id="java-arrays-uebung"
          {...beispiele['java-arrays-uebung']}
          aufgabe={
            <>
              <p>
                Split <Code>text</Code> at the spaces and compute:
              </p>
              <Liste>
                <li>
                  <Code>words</Code> - the <Code>String[]</Code> with all words
                </li>
                <li>
                  <Code>wordCount</Code> - the number of words
                </li>
                <li>
                  <Code>longest</Code> - the longest word
                </li>
                <li>
                  <Code>mentionsJava</Code> - whether “java” appears in the text, in any casing
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What does new String("hi") == "hi" evaluate to?',
            antworten: ['true', 'false', 'a compile error', 'it is random'],
            richtig: 1,
            erklaerung: 'new String(…) deliberately creates a new object. == compares identity, so false. equals gives true.',
          },
          {
            frage: 'How do you get the content of an int[] as text?',
            antworten: ['array.toString()', 'Arrays.toString(array)', 'String.valueOf(array)', 'array + ""'],
            richtig: 1,
            erklaerung: 'Arrays have no toString of their own - all other variants print the address.',
          },
          {
            frage: 'What is inside a fresh String[3]?',
            antworten: ['three empty strings', 'three nulls', 'three undefineds', 'nothing, it is empty'],
            richtig: 1,
            erklaerung: 'The default value for all object types is null. Calling a method on it gives a NullPointerException.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Arrays have one type and a fixed length. To grow, use an ArrayList.',
          <>
            <Code>array.length</Code> without parentheses, <Code>text.length()</Code> with.
          </>,
          <>
            <Code>Arrays.toString(…)</Code> shows the content - otherwise you only see the address.
          </>,
          'Strings are immutable objects: every method returns a new string.',
          <>
            Compare objects with <Code>equals</Code>, primitives with <Code>==</Code>.
          </>,
        ]}
      />
    </>
  )
}
