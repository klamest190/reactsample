import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './Komposition.code'
import { KompositionsDemo } from '../demos/KompositionsDemo'

/**
 * KAPITEL 4.3 (English) - Composition & Portals
 */
export function Komposition() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>With <Code>children</Code> you can put any content inside a component.</P>
        <TryIt
          id="praxis-komposition-einstieg"
          {...beispiele['praxis-komposition-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Compose instead of configure">
        <P>
          React has no inheritance between components. Reuse comes from <strong>composition</strong>. A warning
          sign is a component with more and more boolean props (<Code>showIcon</Code>, <Code>withBorder</Code>,{' '}
          <Code>compact</Code> …). Often it’s better to pass content in as JSX.
        </P>
        <Liste>
          <li>
            <strong>children</strong> - “any content goes here”
          </li>
          <li>
            <strong>Slot props</strong> - several named places for JSX (<Code>header</Code>, <Code>footer</Code>,{' '}
            <Code>actions</Code>)
          </li>
          <li>
            <strong>Render props</strong> - the child receives data and decides on the presentation itself
            (mostly replaced by custom hooks today)
          </li>
          <li>
            <strong>Portals</strong> - render somewhere else in the DOM but stay in the React tree
          </li>
        </Liste>
        <KompositionsDemo />
      </Abschnitt>

      <Abschnitt titel="Slots instead of a prop desert">
        <TryIt
          id="praxis-komposition-slots"
          {...beispiele['praxis-komposition-slots']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="children protect against unnecessary renders">
        <P>
          A nice side effect: JSX that comes in as <Code>children</Code> was already created by the{' '}
          <em>parent</em>. If only the state of the wrapper component changes, the children{' '}
          <strong>don’t</strong> re-render - without any <Code>memo</Code>.
        </P>
        <TryIt
          id="praxis-komposition-children-perf"
          {...beispiele['praxis-komposition-children-perf']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Portals">
        <P>
          Dialogs, tooltips and toasts have to sit on top of everything. If they are nested deep inside a
          container with <Code>overflow: hidden</Code> or its own <Code>z-index</Code>, they get clipped.{' '}
          <Code>createPortal(jsx, domNode)</Code> renders them directly somewhere else in the DOM - yet state,
          context and events keep working as usual.
        </P>
        <TryIt
          id="praxis-komposition-portal"
          {...beispiele['praxis-komposition-portal']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="praxis-komposition-uebung"
          {...beispiele['praxis-komposition-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Build a reusable <Code>Tabs</Code> component. It receives a prop{' '}
                <Code>{'tabs = [{ title, content }]'}</Code>, where <Code>content</Code> is any JSX:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>The titles as buttons at the top, the active one in bold.</li>
                <li>Below that only the content of the active tab.</li>
                <li>
                  An optional slot <Code>extra</Code> that appears to the right of the buttons.
                </li>
                <li>Use it twice in App with completely different content.</li>
              </ul>
            </>
          }
        />
        <Hinweis variante="tipp">
          When a component needs more than two or three slots, the <strong>compound components</strong> pattern
          is often worth it: <Code>{'<Tabs><Tabs.List>…</Tabs.List><Tabs.Panel>…</Tabs.Panel></Tabs>'}</Code> -
          the parts share their state via a context.
        </Hinweis>
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'A component already has 8 boolean props for small variants. What usually helps?',
            antworten: ['Even more props', 'Passing content in via children or slot props', 'Inheriting from a class'],
            richtig: 1,
            erklaerung: 'Composition keeps the component small and the caller flexible.',
          },
          {
            frage: 'Where does a click event inside a portal bubble to?',
            antworten: ['Through the DOM tree (to body)', 'Through the React tree (to the component that renders the portal)'],
            richtig: 1,
            erklaerung: 'For React the portal remains a child of its parent component.',
          },
          {
            frage: 'Why doesn’t <Expensive /> as children re-render when the wrapper changes its state?',
            antworten: [
              'Because children are always memoized',
              'Because the JSX was created by the parent and nothing changed there',
              'That’s not true, it always re-renders',
            ],
            richtig: 1,
            erklaerung: 'The children prop is the same object as before - React can skip the subtree.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>children</Code> and slot props instead of ever more configuration props.
          </>,
          'children content doesn’t re-render when only the wrapper changes its state.',
          'Render props separate logic and presentation - today mostly solved with a custom hook.',
          <>
            <Code>createPortal</Code> for dialogs, toasts and tooltips on top of everything.
          </>,
        ]}
      />
    </>
  )
}
