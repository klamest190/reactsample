import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './UseState.code'
import { ZaehlerDemo } from '../demos/ZaehlerDemo'

const hookOverview: [string, string, string][] = [
  ['useState', 'Store state', '3.1'],
  ['useEffect', 'Synchronize with the outside world', '3.2'],
  ['useRef', 'Remember values without re-render, DOM access', '3.3'],
  ['useMemo / useCallback', 'Cache calculations and functions', '3.4'],
  ['useReducer', 'Manage complex state with actions', '3.5'],
  ['useContext', 'Share values without prop drilling', '3.6'],
  ['custom hooks', 'Reuse logic between components', '3.7'],
  ['useTransition / useDeferredValue', 'Urgent updates first', '3.8'],
  ['use / useActionState / useOptimistic', 'React 19 hooks for data & forms', '3.9'],
  ['useId', 'Unique IDs for accessibility', '4.1'],
]

/**
 * KAPITEL 4.1 (English) - Hooks overview & useState in depth
 */
export function UseState() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P><Code>useState</Code> returns the current value and a function to change it.</P>
        <TryIt
          id="hooks-usestate-einstieg"
          {...beispiele['hooks-usestate-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="What are hooks?">
        <P>
          Hooks are functions that let function components “hook into” React features: state, lifecycle,
          context and more. They always start with <Code>use</Code>. In this part you will learn all the
          important hooks - each with the problem it solves.
        </P>
        <Tabelle
          kopf={['Hook', 'What for?', 'Chapter']}
          spalten={[undefined, undefined, 'tabular-nums']}
          zeilen={hookOverview.map(([hook, purpose, chapter]) => [
            <Code key={hook}>{hook}</Code>,
            purpose,
            chapter,
          ])}
        />
      </Abschnitt>

      <Abschnitt titel="The rules of hooks - and why they exist">
        <Liste>
          <li>
            Only call hooks <strong>at the top level</strong> - not inside <Code>if</Code>, loops, nested
            functions or after an early <Code>return</Code>.
          </li>
          <li>
            Only call hooks from <strong>React components</strong> or <strong>custom hooks</strong>.
          </li>
        </Liste>
        <P>
          The reason: <Code>useState(0)</Code> has no name. React stores the state of all hooks of a component
          in a list and matches them by their <strong>call order</strong>. You can rebuild that in plain
          JavaScript:
        </P>
        <TryIt
          id="hooks-usestate-regeln"
          {...beispiele['hooks-usestate-regeln']}
        />
      </Abschnitt>

      <Abschnitt titel="Updater functions">
        <P>
          If the new value depends on the old one, pass a <strong>function</strong> to the setter. React calls
          it with the most recent value. This matters when you set state several times in a row, or from a
          timer/callback whose closure is stale.
        </P>
        <ZaehlerDemo />
        <TryIt
          id="hooks-usestate-funktional"
          {...beispiele['hooks-usestate-funktional']}
          modus="react"
        />
        <Hinweis variante="warnung">
          The interval above is never stopped. You will learn how to clean up timers properly with{' '}
          <Code>useEffect</Code> in the next chapter. Here, “Run” resets the preview.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Objects and arrays in state">
        <P>
          This is where <Verweis nr="1.6" /> pays off: state is never changed, it is <strong>replaced</strong>. Unlike
          class components in the past, the setter doesn’t merge anything - you have to copy the remaining
          fields yourself with spread.
        </P>
        <TryIt
          id="hooks-usestate-objekte"
          {...beispiele['hooks-usestate-objekte']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Lazy initializer">
        <P>
          The argument of <Code>useState(x)</Code> is only used on the first render, but it is{' '}
          <strong>evaluated on every render</strong>. If the initial value is expensive (e.g. reading{' '}
          <Code>localStorage</Code>), pass a function - React calls it only once.
        </P>
        <TryIt
          id="hooks-usestate-lazy"
          {...beispiele['hooks-usestate-lazy']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Resetting state with key">
        <P>
          State is tied to the <strong>position</strong> of a component in the tree. If the same component
          renders in the same place, its state is kept - even with different props. But if the{' '}
          <Code>key</Code> changes, React rebuilds it completely.
        </P>
        <TryIt
          id="hooks-usestate-key"
          {...beispiele['hooks-usestate-key']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="hooks-usestate-uebung"
          {...beispiele['hooks-usestate-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Build a shopping list. All updates as updater functions and without mutation:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>Add items via an input and an “Add” button - as a list item “1× Name”.</li>
                <li>
                  Per item <strong>−</strong> and <strong>+</strong> buttons for the quantity. When it drops to 0,
                  the item disappears.
                </li>
                <li>At the bottom “Total: n items” with the sum of all quantities (derived!).</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Why can’t hooks be inside an if?',
            antworten: [
              'For performance reasons',
              'React matches hooks by their call order',
              'Because if is forbidden in components',
            ],
            richtig: 1,
            erklaerung: 'If one call is skipped, the mapping of all following hooks shifts.',
          },
          {
            frage: 'count is 0. What is it on the next render after calling setCount(c => c + 1) twice?',
            antworten: ['1', '2', '0'],
            richtig: 1,
            erklaerung: 'Updater functions are applied one after another to the latest value.',
          },
          {
            frage: 'What does setProfile({ name: "Grace" }) do to the other fields of profile?',
            antworten: ['Keeps them', 'Removes them - the state is replaced entirely'],
            richtig: 1,
            erklaerung: 'useState replaces the value. That’s why you write { ...prev, name: "Grace" }.',
          },
          {
            frage: 'How do you completely reset the state of a child component?',
            antworten: ['With a new key', 'With useState(null)', 'Not at all'],
            richtig: 0,
            erklaerung: 'A different key makes React create the component anew - with fresh state.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Hooks only at the top level - React matches them by order.',
          <>
            New value depends on the old one → <Code>{'setX(prev => …)'}</Code>.
          </>,
          <>
            Replace objects/arrays, don’t mutate them: <Code>{'{ ...prev, field }'}</Code>,{' '}
            <Code>[...prev, x]</Code>.
          </>,
          <>
            Expensive initial value → <Code>{'useState(() => compute())'}</Code>.
          </>,
          <>
            New <Code>key</Code> = fresh state.
          </>,
        ]}
      />
    </>
  )
}
