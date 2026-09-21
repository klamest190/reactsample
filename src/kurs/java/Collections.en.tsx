import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Collections.code'

/**
 * CHAPTER 6.8 (English) - Collections & Generics
 */
export function Collections() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          An array has a fixed length - for everything else there are the <em>collections</em>. The
          most important one is <Code>ArrayList</Code>: a list that grows with you.
        </P>
        <TryIt modus="java" id="java-collections-einstieg" {...beispiele['java-collections-einstieg']} />
        <Hinweis variante="info">
          The two <Code>import</Code> lines at the top pull the classes from the package{' '}
          <Code>java.util</Code>. In an IDE a single keystroke inserts them. Here in the course you
          may also leave them out - the runtime knows the classes anyway.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Three types, three jobs">
        <CodeBlock code={codeBloecke.wahl} />
        <CodeBlock code={codeBloecke.jsVergleich} />
        <P>
          Note the left-hand side: <Code>{'List<String> names = new ArrayList<>()'}</Code>. You
          declare with the <strong>interface</strong> (<Code>List</Code>) and create with the{' '}
          <strong>class</strong> (<Code>ArrayList</Code>).
        </P>
        <CodeBlock code={codeBloecke.interfaceLinks} />
      </Abschnitt>

      <Abschnitt titel="Working with lists">
        <TryIt modus="java" id="java-collections-liste" {...beispiele['java-collections-liste']} />
        <Hinweis variante="warnung">
          Careful with <Code>remove</Code>: on a <Code>{'List<Integer>'}</Code>,{' '}
          <Code>list.remove(1)</Code> deletes the element at <em>position</em> 1 - not the number 1.
          To delete the number you need <Code>list.remove(Integer.valueOf(1))</Code>. One of the best
          known traps in Java.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Generics: the angle brackets">
        <P>
          <Code>{'<String>'}</Code> is not decoration but a promise to the compiler: only strings go
          in here - so only strings come out. Before Java 5 this did not exist; back then you had to
          convert every element back yourself when taking it out.
        </P>
        <TryIt modus="java" id="java-collections-generics" {...beispiele['java-collections-generics']} />
        <Hinweis variante="tipp">
          The diamond <Code>{'<>'}</Code> on the right stays empty - the compiler already knows from
          the left side what is meant. And: a collection only takes objects, hence{' '}
          <Code>{'List<Integer>'}</Code> instead of <Code>{'List<int>'}</Code> (see{' '}
          <Verweis nr="7.2" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="HashMap: key and value">
        <P>
          What is an object or a <Code>Map</Code> in JavaScript is called <Code>HashMap</Code> here.
          The type appears twice inside the angle brackets: <Code>{'Map<key, value>'}</Code>.
        </P>
        <TryIt modus="java" id="java-collections-map" {...beispiele['java-collections-map']} />
        <Hinweis variante="warnung">
          <Code>get</Code> returns <Code>null</Code> when the key is missing - and <Code>null</Code>{' '}
          is the short path to a <Code>NullPointerException</Code>. Use{' '}
          <Code>getOrDefault(key, fallback)</Code> whenever you can.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="HashSet: every value only once">
        <TryIt modus="java" id="java-collections-set" {...beispiele['java-collections-set']} />
      </Abschnitt>

      <Abschnitt titel="Lambdas and streams">
        <P>
          Since Java 8 there are lambdas - short functions like arrow functions in JavaScript. They
          also make <Code>map</Code>, <Code>filter</Code> and friends possible; here they are called{' '}
          <em>streams</em>.
        </P>
        <CodeBlock code={codeBloecke.streamVergleich} />
        <TryIt modus="java" id="java-collections-streams" {...beispiele['java-collections-streams']} />
        <P>
          <Code>String::toUpperCase</Code> is a <strong>method reference</strong> - shorthand for{' '}
          <Code>{'name -> name.toUpperCase()'}</Code>.
        </P>
        <P>
          If this looks familiar: it is exactly how lists become UI in React (<Verweis nr="1.4" />{' '}
          and <Verweis nr="3.2" />). Same idea, different spelling.
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="java"
          id="java-collections-uebung"
          {...beispiele['java-collections-uebung']}
          aufgabe={
            <>
              <p>Count how often each word appears in the text:</p>
              <Liste>
                <li>
                  Fill the <Code>counts</Code> map: word → count
                </li>
                <li>
                  Find the most frequent word and keep it in <Code>mostCommon</Code>, its count in{' '}
                  <Code>highest</Code>
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Why List<Integer> and not List<int> ?',
            antworten: [
              'It is only a convention.',
              'Collections can only hold objects - Integer is the object form of int.',
              'int would be too slow.',
              'List<int> exists but is deprecated.',
            ],
            richtig: 1,
            erklaerung: 'Primitive types are not objects. Autoboxing converts int to Integer automatically - and back.',
          },
          {
            frage: 'What does map.get("missing") return on a HashMap without that key?',
            antworten: ['0', 'an exception', 'null', 'an empty string'],
            richtig: 2,
            erklaerung: 'null - which is why getOrDefault(key, fallback) is usually the better choice.',
          },
          {
            frage: 'Which collection do you use when every value may appear only once?',
            antworten: ['ArrayList', 'HashMap', 'HashSet', 'Array'],
            richtig: 2,
            erklaerung: 'A set has no duplicates. add returns false when the value is already there.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>{'List<T>'}</Code> grows, <Code>{'Set<T>'}</Code> has no duplicates,{' '}
            <Code>{'Map<K, V>'}</Code> maps keys to values.
          </>,
          <>
            Interface on the left, implementation on the right:{' '}
            <Code>{'List<String> x = new ArrayList<>()'}</Code>.
          </>,
          'Generics turn runtime errors into compile errors - and save every cast.',
          <>
            <Code>getOrDefault</Code> instead of <Code>get</Code> wherever <Code>null</Code> could
            appear.
          </>,
          <>
            Lambdas (<Code>{'n -> n * 2'}</Code>) and streams are Java’s <Code>map</Code>/
            <Code>filter</Code>.
          </>,
        ]}
      />
    </>
  )
}
