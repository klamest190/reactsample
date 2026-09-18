import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './EigeneHooks.code'
import { HookDemo } from '../demos/HookDemo'

/**
 * KAPITEL 3.7 (English) - Custom Hooks
 */
export function EigeneHooks() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>A custom hook is a function that starts with <Code>use</Code> and uses other hooks.</P>
        <TryIt
          id="hooks-eigene-einstieg"
          {...beispiele['hooks-eigene-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Reusing logic">
        <P>
          Components share UI. But how do you share <strong>behavior</strong> - like “track the window size”
          or “store this value in localStorage”? With a <strong>custom hook</strong>: a completely normal
          function whose name starts with <Code>use</Code> and that calls other hooks.
        </P>
        <Liste>
          <li>
            The name <strong>must</strong> start with <Code>use</Code> - that’s how React and the linter know
            the rules of hooks apply.
          </li>
          <li>A custom hook may call any other hooks.</li>
          <li>
            It shares <strong>logic, not state</strong>: every component that calls it gets its own,
            independent state - just like <Code>createCounter()</Code> from <Verweis nr="1.3" />.
          </li>
        </Liste>
        <TryIt
          id="hooks-eigene-extrahieren"
          {...beispiele['hooks-eigene-extrahieren']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="The hooks in this project">
        <P>
          Under <Code>src/hooks/</Code> you will find several custom hooks the app itself uses - each with
          comments. You can design the return value freely: a single value, a tuple like <Code>useState</Code>,
          or an object with names. (The source code of this project is written with German names.)
        </P>
        <CodeBlock
          titel="src/hooks/useDebounce.ts (translated)"
          code={codeBloecke.beispiel1}
        />
        <HookDemo />
        <P>
          More examples: <Code>useWindowSize</Code> (subscribing to an event), <Code>usePrevious</Code>{' '}
          (previous value via a ref) and <Code>useHashRoute</Code> - this app’s mini router based on{' '}
          <Code>useSyncExternalStore</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Build your own: useLocalStorage">
        <TryIt
          id="hooks-eigene-localstorage"
          {...beispiele['hooks-eigene-localstorage']}
          modus="react"
        />
        <Hinweis variante="tipp">
          Rule of thumb: when the same combination of <Code>useState</Code> and <Code>useEffect</Code> shows up
          for the second time, it belongs in a hook. And if an effect is hard to name, it helps to ask: what
          would the hook for it be called?
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="hooks-eigene-uebung"
          {...beispiele['hooks-eigene-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Write the hook <Code>{'useCounter(initial, { min, max })'}</Code>. It returns an object:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>value</Code>, <Code>increment()</Code>, <Code>decrement()</Code>, <Code>reset()</Code>
                </li>
                <li>
                  <Code>atMin</Code> and <Code>atMax</Code> (booleans, derived)
                </li>
                <li>The value always stays between min and max.</li>
              </ul>
              <p className="mt-1">
                The two components below already use it. Check that they count independently.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Two components call the same custom hook containing useState. Do they share the state?',
            antworten: ['Yes', 'No, each gets its own state'],
            richtig: 1,
            erklaerung: 'Hooks share logic. For shared state: lift state up or use context.',
          },
          {
            frage: 'Why must a custom hook start with “use”?',
            antworten: [
              'Otherwise JavaScript doesn’t allow the call',
              'So React tooling knows the rules of hooks apply',
              'It is just a matter of taste',
            ],
            richtig: 1,
            erklaerung: 'The linter and the React Compiler check functions with the use prefix against the rules of hooks.',
          },
          {
            frage: 'A helper function only formats a date and calls no hooks. Should it be called “useDate”?',
            antworten: ['Yes', 'No, then it is a normal function'],
            richtig: 1,
            erklaerung: 'Without hooks inside, the prefix is misleading - and the function couldn’t be used inside an if.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Custom hook = a function with a <Code>use</Code> prefix that uses other hooks.
          </>,
          'It shares logic, not state - every call has its own state.',
          'The return value is up to you: value, tuple or object.',
          'Repeated useState/useEffect combinations are the typical candidates.',
          <>
            Examples in the project: <Code>src/hooks/</Code>.
          </>,
        ]}
      />
    </>
  )
}
