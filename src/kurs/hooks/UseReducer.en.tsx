import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './UseReducer.code'
import { AufgabenDemo } from '../demos/AufgabenDemo'

/**
 * KAPITEL 3.5 (English) - useReducer
 */
export function UseReducer() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P><Code>useReducer</Code>: the component only sends actions, the reducer decides the new state.</P>
        <TryIt
          id="hooks-usereducer-einstieg"
          {...beispiele['hooks-usereducer-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="The problem: scattered update logic">
        <P>
          As a component grows, state changes spread across many event handlers: <Code>add</Code>,{' '}
          <Code>remove</Code>, <Code>rename</Code>, <Code>sort</Code> … Each calls <Code>setX</Code> with its
          own logic. Hard to keep track of, hard to test.
        </P>
        <P>
          A <strong>reducer</strong> gathers all state transitions in <strong>one</strong> pure function. The
          handlers only describe <em>what happened</em> (an <strong>action</strong>), the reducer decides{' '}
          <em>how the state changes</em>.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="Reducers are just JavaScript">
        <P>
          The name comes from <Code>Array.reduce</Code> in <Verweis nr="1.4" />: step by step, the current state emerges
          from an initial value and a sequence of actions. Because the reducer has nothing to do with React,
          you can try it out and test it without a component.
        </P>
        <TryIt
          id="hooks-usereducer-js"
          {...beispiele['hooks-usereducer-js']}
        />
        <Hinweis variante="warnung">
          A reducer must be <strong>pure</strong>: same input → same output, no side effects. So no{' '}
          <Code>fetch</Code>, no <Code>Math.random()</Code>, no <Code>localStorage</Code> and{' '}
          <strong>no mutation</strong> of <Code>state</Code> - always return a new object.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="useReducer in a component">
        <TryIt
          id="hooks-usereducer-react"
          {...beispiele['hooks-usereducer-react']}
          modus="react"
        />
        <AufgabenDemo />
      </Abschnitt>

      <Abschnitt titel="useState or useReducer?">
        <Liste>
          <li>
            <strong>useState</strong> for single, independent values: an input field, a toggle, a counter.
          </li>
          <li>
            <strong>useReducer</strong> when several values change together, the next state depends on the
            previous one, or there are many different kinds of changes.
          </li>
          <li>
            Bonus: <Code>dispatch</Code> is always the same function. You can safely pass it to children or via
            context - no <Code>useCallback</Code> needed.
          </li>
        </Liste>
        <Hinweis variante="tipp">
          Name actions after <strong>what happened</strong> (<Code>'added'</Code>), not after what the state
          should do (<Code>'setTodos'</Code>). That keeps the logic in the reducer instead of the handler.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="hooks-usereducer-uebung"
          {...beispiele['hooks-usereducer-uebung']}
          aufgabe={
            <>
              <p>
                Write the reducer for a shopping cart. The state is an array{' '}
                <Code>{'[{ id, name, price, quantity }]'}</Code>. Support these actions:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>{"{ type: 'added', product }"}</Code> - new product with <Code>quantity: 1</Code>. If it
                  is already in the cart, only increase the quantity by 1.
                </li>
                <li>
                  <Code>{"{ type: 'quantityChanged', id, quantity }"}</Code> - sets the quantity. At 0 or less the
                  item is removed.
                </li>
                <li>
                  <Code>{"{ type: 'removed', id }"}</Code>
                </li>
                <li>
                  <Code>{"{ type: 'cleared' }"}</Code>
                </li>
              </ul>
              <p className="mt-1">
                Also: <Code>total(state)</Code> returns the total price. Don’t mutate anything!
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What must a reducer NOT do?',
            antworten: ['Return a new object', 'Send a request to the server', 'Use a switch'],
            richtig: 1,
            erklaerung: 'Reducers are pure. Side effects belong in event handlers or effects.',
          },
          {
            frage: 'What does useReducer return?',
            antworten: ['[state, setState]', '[state, dispatch]', '{ state, reducer }'],
            richtig: 1,
            erklaerung: 'dispatch(action) sends an action to the reducer.',
          },
          {
            frage: 'How should actions be named?',
            antworten: ["After the event: 'added'", "After the setter: 'setList'"],
            richtig: 0,
            erklaerung: 'The action describes what happened - the reducer decides the consequences.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Reducer: <Code>(state, action) =&gt; newState</Code> - pure, without mutation.
          </>,
          <>
            <Code>const [state, dispatch] = useReducer(reducer, initial)</Code>, then{' '}
            <Code>{"dispatch({ type: 'event', … })"}</Code>.
          </>,
          'All state transitions in one place: clear and testable without React.',
          'Good for related state with many kinds of changes.',
          <>
            In TypeScript: actions as a discriminated union - see <Verweis id="praxis-typescript" />.
          </>,
        ]}
      />
    </>
  )
}
