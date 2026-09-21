import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Methoden.code'

/**
 * CHAPTER 6.4 (English) - Methods
 */
export function Methoden() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          What JavaScript calls a function is a <strong>method</strong> in Java - simply because it
          always belongs to a class. Free-standing functions do not exist.
        </P>
        <TryIt modus="java" id="java-methoden-einstieg" {...beispiele['java-methoden-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="The signature">
        <CodeBlock code={codeBloecke.signatur} />
        <P>
          This line is a contract: whoever calls this method must pass exactly one <Code>int</Code>{' '}
          and is guaranteed to get an <Code>int</Code> back. The compiler checks both sides - before
          anything runs.
        </P>
        <CodeBlock code={codeBloecke.jsVergleich} />
        <Hinweis variante="info">
          <Code>void</Code> means “returns nothing”. A method with a return type <em>must</em> reach
          a <Code>return</Code> on every path - otherwise the compiler reports{' '}
          <Code>missing return statement</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Overloading: one name, several variants">
        <P>
          In JavaScript there can only be one function per name. In Java several methods may share a
          name as long as their <strong>parameters</strong> differ. The compiler picks the right one.
        </P>
        <TryIt modus="java" id="java-methoden-ueberladung" {...beispiele['java-methoden-ueberladung']} />
        <P>
          That is exactly why <Code>System.out.println(…)</Code> handles text, numbers, booleans and
          objects: the method exists a good dozen times, once per type.
        </P>
        <Hinweis variante="warnung">
          The return type alone is not enough to tell them apart. Two methods differing only in it
          are a compile error.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Parameters are always copies">
        <P>
          Java <strong>always</strong> passes a copy of the value. For an <Code>int</Code> that is
          the number itself - changes inside the method stay there. For objects and arrays the{' '}
          <em>reference</em> is copied: both then point at the same object, and whoever changes it
          changes it for everyone.
        </P>
        <TryIt modus="java" id="java-methoden-parameter" {...beispiele['java-methoden-parameter']} />
        <P>
          This is the same distinction as value vs. reference in JavaScript (<Verweis nr="1.6" />) -
          except that Java makes it visible through the types.
        </P>
      </Abschnitt>

      <Abschnitt titel="static or not?">
        <P>The question everyone stumbles over at first. The answer is simple:</P>
        <Liste>
          <li>
            <Code>static</Code> - the method belongs to the <strong>class</strong>. It needs no
            object and cannot use one either. Typical for helpers: <Code>Math.max(…)</Code>,{' '}
            <Code>Integer.parseInt(…)</Code>.
          </li>
          <li>
            without <Code>static</Code> - the method belongs to an <strong>object</strong> and may
            access its fields. That is the normal case as soon as there is data (<Verweis nr="6.6" />
            ).
          </li>
        </Liste>
        <TryIt modus="java" id="java-methoden-static" {...beispiele['java-methoden-static']} />
        <Hinweis variante="tipp">
          That is why <Code>main</Code> is static: at startup there is not a single object the JVM
          could use.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Recursion">
        <P>
          A method may call itself. The only important part is the exit - without it the call stack
          fills up and Java throws a <Code>StackOverflowError</Code>.
        </P>
        <TryIt modus="java" id="java-methoden-rekursion" {...beispiele['java-methoden-rekursion']} />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="java"
          id="java-methoden-uebung"
          {...beispiele['java-methoden-uebung']}
          aufgabe={
            <>
              <p>Write two methods:</p>
              <Liste>
                <li>
                  <Code>isPrime(int number)</Code> - returns <Code>true</Code> if the number is prime
                  (divisible only by 1 and itself, at least 2).
                </li>
                <li>
                  <Code>countPrimes(int upTo)</Code> - counts how many primes there are from 2 up to
                  and including <Code>upTo</Code>. Use <Code>isPrime</Code> for it.
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'How may two overloaded methods differ?',
            antworten: [
              'only in the return type',
              'in the number or type of parameters',
              'in their order in the source file',
              'in the names of the parameters',
            ],
            richtig: 1,
            erklaerung: 'The parameter list makes the method unique. The return type alone is not enough.',
          },
          {
            frage: "What happens to the caller's variable in change(int number) { number = 99; }?",
            antworten: [
              'It becomes 99 as well.',
              'It stays unchanged - the method received a copy.',
              'It is a compile error.',
              'It depends on the type.',
            ],
            richtig: 1,
            erklaerung: 'Java always passes a copy. For objects the reference is copied - which is why changes TO the object are visible outside.',
          },
          {
            frage: 'Why is main static?',
            antworten: [
              'So that it runs faster.',
              'Because at startup no object exists for it to run on.',
              'So that it is only called once.',
              'It is pure convention.',
            ],
            richtig: 1,
            erklaerung: 'static methods belong to the class - so the JVM can call main without creating anything first.',
          },
        ]}
      />

      <Merke
        punkte={[
          'A method declares its return type, name and the types of all parameters - that is a contract.',
          'Overloading: same name, different parameters. The compiler chooses.',
          'Parameters are always copies. For objects the reference is copied - not the object itself.',
          <>
            <Code>static</Code> belongs to the class, without <Code>static</Code> to an object.
          </>,
          <>
            A method with a return type needs a <Code>return</Code> on every path.
          </>,
        ]}
      />
    </>
  )
}
