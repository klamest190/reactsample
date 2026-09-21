import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Kontrollfluss.code'

/**
 * CHAPTER 6.3 (English) - Conditions & Loops
 */
export function Kontrollfluss() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          <Code>if</Code>, <Code>else if</Code>, <Code>else</Code> look just like JavaScript. Change
          the temperature and see which branch runs.
        </P>
        <TryIt modus="java" id="java-kontrollfluss-einstieg" {...beispiele['java-kontrollfluss-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="A condition is a boolean - nothing else">
        <P>
          This is the only truly important difference in this chapter: Java has no <em>truthy</em>{' '}
          and no <em>falsy</em>. Whatever stands in <Code>if (…)</Code> must be of type{' '}
          <Code>boolean</Code> - otherwise it does not compile.
        </P>
        <CodeBlock code={codeBloecke.keinTruthy} />
        <TryIt modus="java" id="java-kontrollfluss-boolean" {...beispiele['java-kontrollfluss-boolean']} />
        <Hinweis variante="tipp">
          It is annoying at first and saves you later: <Code>if (name)</Code> is a common source of
          bugs in JavaScript (is <Code>0</Code> empty or not?). In Java you have to decide - and the
          reader can see what you meant.
        </Hinweis>
        <P>
          <Code>&&</Code>, <Code>||</Code> and <Code>!</Code> work as usual, including short-circuit
          evaluation: in <Code>a && b</Code>, <Code>b</Code> is only evaluated if <Code>a</Code> is
          true. That is exactly why the typical null guard{' '}
          <Code>{'name != null && name.length() > 0'}</Code> works.
        </P>
      </Abschnitt>

      <Abschnitt titel="switch: the same idea twice">
        <P>
          Java has two ways to write <Code>switch</Code>. The old one with a colon needs{' '}
          <Code>break</Code> - otherwise execution continues into the next case (“fall-through”, the
          same trap as in JavaScript). The new one with <Code>-&gt;</Code> does not, and it can even
          produce a value.
        </P>
        <TryIt modus="java" id="java-kontrollfluss-switch" {...beispiele['java-kontrollfluss-switch']} />
        <Hinweis variante="info">
          When in doubt use the arrow form. It is shorter, cannot forget anything and turns the{' '}
          <Code>switch</Code> into an expression - much like <Code>useReducer</Code> in React turns
          an action into a new state (<Verweis nr="3.5" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Four loops for four situations">
        <CodeBlock code={codeBloecke.schleifenWahl} />
        <TryIt modus="java" id="java-kontrollfluss-schleifen" {...beispiele['java-kontrollfluss-schleifen']} />
        <P>
          The second form (<Code>for (int score : scores)</Code>) is called the <em>enhanced for</em>{' '}
          or for-each loop. It is Java’s counterpart to <Code>for…of</Code> and works over arrays,
          lists and sets. What it lacks is the index - if you need that, use the counting loop.
        </P>
        <Hinweis variante="warnung">
          An endless loop freezes the whole program in Java. Here the runtime stops after a few
          million steps and tells you - a real JVM would simply keep going.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="break and continue">
        <P>
          <Code>continue</Code> skips the rest of the current round, <Code>break</Code> leaves the
          loop entirely. With nested loops both only affect the <strong>innermost</strong> loop.
        </P>
        <TryIt modus="java" id="java-kontrollfluss-break" {...beispiele['java-kontrollfluss-break']} />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="java"
          id="java-kontrollfluss-uebung"
          {...beispiele['java-kontrollfluss-uebung']}
          aufgabe={
            <>
              <p>FizzBuzz - the classic. Print the numbers from 1 to 20, but:</p>
              <Liste>
                <li>
                  divisible by 3 → <Code>Fizz</Code>
                </li>
                <li>
                  divisible by 5 → <Code>Buzz</Code>
                </li>
                <li>
                  divisible by both → <Code>FizzBuzz</Code>
                </li>
              </Liste>
              <p className="mt-1">
                Also count in <Code>fizzCount</Code> how often <em>exactly</em> “Fizz” was printed
                (FizzBuzz does not count).
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Which condition compiles in Java?',
            antworten: ['if (list.size())', 'if (name)', 'if (count > 0)', 'if (1)'],
            richtig: 2,
            erklaerung: 'Only an expression of type boolean is allowed. Numbers and objects are not conditions.',
          },
          {
            frage: 'What happens in a classic switch without break?',
            antworten: [
              'Nothing, break is optional.',
              'Execution continues into the next case.',
              'It is a compile error.',
              'The default branch is skipped.',
            ],
            richtig: 1,
            erklaerung: 'That is the infamous fall-through. The arrow form switch (…) { case x -> … } does not have it.',
          },
          {
            frage: 'When do you use do-while instead of while?',
            antworten: [
              'When the loop should run at least once.',
              'When you need a counter.',
              'When looping over an array.',
              'When the condition is complicated.',
            ],
            richtig: 0,
            erklaerung: 'In do-while the check is at the end - so the body runs at least once, guaranteed.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Conditions are always boolean. No truthy, no falsy - write it out instead.',
          <>
            <Code>switch</Code> with <Code>-&gt;</Code> needs no <Code>break</Code> and can return a
            value.
          </>,
          <>
            Four loops: <Code>for</Code> (counter), enhanced <Code>for</Code> (elements),{' '}
            <Code>while</Code> (unknown count), <Code>do-while</Code> (at least once).
          </>,
          <>
            <Code>break</Code> and <Code>continue</Code> only affect the innermost loop.
          </>,
        ]}
      />
    </>
  )
}
