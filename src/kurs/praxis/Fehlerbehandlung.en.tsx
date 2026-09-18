import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Fehlerbehandlung.code'
import { FehlerDemo } from '../demos/FehlerDemo'

/**
 * KAPITEL 4.4 (English) - Error Handling
 */
export function Fehlerbehandlung() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>An error boundary catches the crash of a child component - the rest of the page keeps running.</P>
        <TryIt
          id="praxis-fehler-einstieg"
          {...beispiele['praxis-fehler-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="What happens on an error?">
        <P>
          If a component throws an error while <strong>rendering</strong>, React unmounts the{' '}
          <strong>entire tree</strong> unless something catches it - the user sees a blank page. Better one
          broken widget than a broken app. That’s what <strong>error boundaries</strong> are for.
        </P>
        <FehlerDemo />
      </Abschnitt>

      <Abschnitt titel="Error boundaries">
        <P>
          An error boundary is the only place where you still need a <strong>class component</strong> today -
          there is no hook version. You write it once (or use the package <Code>react-error-boundary</Code>) and
          place it around risky areas.
        </P>
        <CodeBlock
          titel="Minimal"
          code={codeBloecke.beispiel1}
        />
        <P>
          Errors are <strong>not</strong> caught in:
        </P>
        <Liste>
          <li>event handlers → use <Code>try/catch</Code> there</li>
          <li>
            asynchronous code (<Code>setTimeout</Code>, promises) → <Code>try/catch</Code> or{' '}
            <Code>.catch()</Code>
          </li>
          <li>the boundary itself</li>
        </Liste>
        <P>
          If you still want to show an error from a handler in the boundary, store it in state and throw it on
          the next render: <Code>{'if (error) throw error'}</Code>.
        </P>
        <TryIt
          id="praxis-fehler-boundary"
          {...beispiele['praxis-fehler-boundary']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Errors in handlers and asynchronous code">
        <TryIt
          id="praxis-fehler-async"
          {...beispiele['praxis-fehler-async']}
          modus="react"
        />
        <Hinweis variante="info">
          During development the browser still logs errors to the console despite the boundary, and some dev
          tools show an overlay. You see the real behavior with <Code>npm run build</Code> and{' '}
          <Code>npm run preview</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="praxis-fehler-uebung"
          {...beispiele['praxis-fehler-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>The dashboard crashes completely as soon as one widget receives broken data.</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Write an <Code>ErrorBoundary</Code> with a <Code>fallback</Code> prop and wrap{' '}
                  <strong>each widget individually</strong>, so that the others keep working.
                </li>
                <li>
                  “Break the data” should only affect the revenue widget. The boundary then shows “Widget
                  unavailable”.
                </li>
                <li>
                  Bonus: the boundary resets when the data changes (tip: just use a <Code>key</Code>!).
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Which error does an error boundary catch?',
            antworten: ['An error in onClick', 'An error while rendering a child', 'A rejected fetch'],
            richtig: 1,
            erklaerung: 'Only errors during rendering, lifecycle and effects of its children.',
          },
          {
            frage: 'Why is ErrorBoundary a class?',
            antworten: [
              'Because there is no hook for getDerivedStateFromError',
              'Because classes are faster',
              'It doesn’t have to be',
            ],
            richtig: 0,
            erklaerung: 'Alternatively use the react-error-boundary package, which wraps the class.',
          },
          {
            frage: 'Where are boundaries best placed?',
            antworten: [
              'Only once at the very top',
              'Around individual, independent areas - plus one at the very top',
              'Around every single element',
            ],
            richtig: 1,
            erklaerung: 'That way only the affected area fails, and nothing ends in a blank page.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Render errors without a boundary take down the whole app.',
          <>
            Error boundary: a class with <Code>getDerivedStateFromError</Code> (or{' '}
            <Code>react-error-boundary</Code>).
          </>,
          <>
            Event handlers and async code: <Code>try/catch</Code> and an error state.
          </>,
          <>
            Place boundaries deliberately around independent areas; reset them with a <Code>key</Code>.
          </>,
        ]}
      />
    </>
  )
}
