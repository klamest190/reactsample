import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Nebenlaeufigkeit.code'
import { NebenlaeufigkeitsDemo } from '../demos/NebenlaeufigkeitsDemo'

/**
 * KAPITEL 3.8 (English) - useTransition & useDeferredValue
 */
export function Nebenlaeufigkeit() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P><Code>useTransition</Code> marks an update as “not urgent” and tells you via <Code>isPending</Code> that it is still running.</P>
        <TryIt
          id="hooks-nebenlaeufig-einstieg"
          {...beispiele['hooks-nebenlaeufig-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="The problem: a slow render blocks everything">
        <P>
          Normally every state update is <strong>urgent</strong>: React renders it immediately and in one go.
          If that render is expensive, the browser can’t do anything else in the meantime - typing becomes
          laggy. Try it and type quickly into the field:
        </P>
        <TryIt
          id="hooks-nebenlaeufig-problem"
          {...beispiele['hooks-nebenlaeufig-problem']}
          modus="react"
        />
        <P>
          Since React 18, React can <strong>interrupt</strong> renders. You only have to tell it which updates
          can wait. There are two hooks for that:
        </P>
        <Liste>
          <li>
            <Code>useDeferredValue(value)</Code> - “Feel free to use a slightly older value for this part.” Good
            when you <strong>don’t set</strong> the state yourself (e.g. it comes in as a prop).
          </li>
          <li>
            <Code>useTransition()</Code> - “This update that <strong>I</strong> trigger is not urgent.” Also
            gives you <Code>isPending</Code> for a loading indicator.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="useDeferredValue">
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <P>
          React first renders with the <strong>old</strong> deferred value (fast, because <Code>memo</Code>{' '}
          skips the list) and then tries to render with the new value in the background. If new input arrives
          in between, this background render is discarded. The solution to the exercise above shows the
          pattern.
        </P>
        <Hinweis variante="info">
          Unlike debouncing (<Verweis nr="3.7" />) there is <strong>no fixed delay</strong>: on a fast machine nothing
          lags behind, on a slow one it adapts.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="useTransition">
        <TryIt
          id="hooks-nebenlaeufig-transition"
          {...beispiele['hooks-nebenlaeufig-transition']}
          modus="react"
        />
        <Liste>
          <li>
            During the transition the <strong>old tab stays visible</strong> and usable, instead of the page
            freezing.
          </li>
          <li>If you click somewhere else meanwhile, React aborts the slow render.</li>
          <li>
            In React 19 the function inside <Code>startTransition</Code> may also be <Code>async</Code> - that is
            what <Code>useActionState</Code> in the next chapter builds on.
          </li>
        </Liste>
        <Hinweis variante="warnung">
          <Code>startTransition</Code> doesn’t work for input fields: the value of an <Code>{'<input>'}</Code>{' '}
          must update immediately. <Code>useDeferredValue</Code> is the right tool there.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Code splitting with lazy">
        <P>
          A large app does not have to load everything at once. <Code>lazy()</Code> loads a component only when it is
          rendered for the first time - the bundler puts its code into a separate file for that. While it loads, the
          nearest <Code>{'<Suspense>'}</Code> above shows its <Code>fallback</Code>.
        </P>
        <TryIt id="hooks-nebenlaeufig-lazy" {...beispiele['hooks-nebenlaeufig-lazy']} modus="react" />
        <P>
          Good candidates are pages (one file per route, <Verweis id="praxis-routing" />), large charts, editors and
          rarely opened dialogs. This learning app loads every chapter that way, only when you open it. Hide the
          statistics and show them again: the second time they appear instantly.
        </P>
      </Abschnitt>

      <Abschnitt titel="The demos from this project">
        <P>
          For comparison in TypeScript - including <Code>lazy</Code> and <Code>Suspense</Code>: part of the app
          is only loaded when it is first displayed, and <Code>Suspense</Code> shows a placeholder until then.
        </P>
        <NebenlaeufigkeitsDemo />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="hooks-nebenlaeufig-uebung"
          {...beispiele['hooks-nebenlaeufig-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                The color slider is laggy because every movement redraws 2,000 slow tiles. Make sure the{' '}
                <strong>slider stays smooth</strong> and the tiles catch up:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>Use the right hook for a value that an input sets.</li>
                <li>Remember memo - otherwise the hook doesn’t help.</li>
                <li>While the tiles are stale, they should be semi-transparent.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'An input sets state that filters a slow list. Which hook fits?',
            antworten: ['useTransition around the input’s setState', 'useDeferredValue for the value the list receives'],
            richtig: 1,
            erklaerung: 'The input itself must update immediately - only the list may wait.',
          },
          {
            frage: 'What does useTransition return?',
            antworten: ['[isPending, startTransition]', '[value, setValue]', 'A promise'],
            richtig: 0,
            erklaerung: 'isPending tells you whether a transition is currently rendering.',
          },
          {
            frage: 'Why does useDeferredValue usually need memo?',
            antworten: [
              'Otherwise there is an error',
              'Otherwise the slow component renders along with the urgent render anyway',
              'memo makes the value deferred',
            ],
            richtig: 1,
            erklaerung: 'With memo, React skips the list as long as it receives the old value.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Normal updates are urgent and block input during expensive renders.',
          <>
            <Code>useDeferredValue(value)</Code>: a lagging value for the slow part - together with{' '}
            <Code>memo</Code>.
          </>,
          <>
            <Code>useTransition</Code>: mark your own updates as non-urgent, with <Code>isPending</Code>.
          </>,
          'Non-urgent renders can be interrupted and discarded.',
          <>
            <Code>lazy</Code> + <Code>Suspense</Code>: load components only when needed.
          </>,
        ]}
      />
    </>
  )
}
