import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './React19Hooks.code'

/**
 * KAPITEL 4.9 (English) - use, useActionState, useOptimistic & useFormStatus
 */
export function React19Hooks() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P><Code>useActionState</Code> connects a form to an (async) action - including result and loading state.</P>
        <TryIt
          id="hooks-react19-einstieg"
          {...beispiele['hooks-react19-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Overview">
        <P>
          React 19 introduced several hooks that make typical asynchronous flows much shorter - especially
          around forms. They build on the transitions from the last chapter.
        </P>
        <Liste>
          <li>
            <Code>use(promise)</Code> - reads the result of a promise; while it is pending,{' '}
            <Code>Suspense</Code> shows a placeholder. <Code>use(Context)</Code> reads context.
          </li>
          <li>
            <Code>useActionState</Code> - state that results from an (asynchronous) action, including the
            pending state.
          </li>
          <li>
            <Code>useFormStatus</Code> - lets a child component ask whether the surrounding form is being
            submitted.
          </li>
          <li>
            <Code>useOptimistic</Code> - shows a result immediately, before the server has responded.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="use: reading promises and context">
        <P>
          <Code>use</Code> is a special hook: it is the only one that may appear inside <Code>if</Code> or
          loops. If you pass it a promise, the component “waits” for it - meanwhile React shows the{' '}
          <Code>fallback</Code> of the nearest <Code>Suspense</Code> boundary.
        </P>
        <TryIt
          id="hooks-react19-use"
          {...beispiele['hooks-react19-use']}
          modus="react"
        />
        <Hinweis variante="warnung">
          <Code>use</Code> doesn’t create the promise - it only reads it. In real apps the promise comes from a
          framework (e.g. Next.js Server Components) or a library with a cache like TanStack Query. A{' '}
          <Code>fetch</Code> directly while rendering would create a new promise on every render.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Form actions and useActionState">
        <P>
          In React 19, <Code>{'<form action={…}>'}</Code> can receive a <strong>function</strong>. React calls it
          on submit with the <Code>FormData</Code> - no <Code>preventDefault</Code>, no state per field. After a
          successful action, uncontrolled fields are reset automatically.
        </P>
        <P>
          <Code>useActionState</Code> connects such an action with state: the result of the action becomes the
          new state, and you get the pending state for free.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="hooks-react19-actionstate"
          {...beispiele['hooks-react19-actionstate']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="useFormStatus">
        <P>
          A submit button is often built as its own component. So that it doesn’t need a prop to know whether
          the form is being submitted, there is <Code>useFormStatus</Code> from <Code>react-dom</Code>. It reads
          the status of the <strong>surrounding</strong> <Code>{'<form>'}</Code>.
        </P>
        <TryIt
          id="hooks-react19-formstatus"
          {...beispiele['hooks-react19-formstatus']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="useOptimistic">
        <P>
          A like button that only reacts after a second feels broken. <Code>useOptimistic</Code> shows the
          expected result <strong>immediately</strong>. When the action is finished, React automatically
          replaces the optimistic value with the real state - if it fails, the display jumps back.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel2}
        />
        <TryIt
          id="hooks-react19-optimistic"
          {...beispiele['hooks-react19-optimistic']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="hooks-react19-uebung"
          {...beispiele['hooks-react19-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Build a comment feature with the new hooks:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>useActionState</Code>: the action calls <Code>saveComment</Code> and returns the new list
                  of comments. Initial value: <Code>[]</Code>.
                </li>
                <li>
                  If the server returns an error (empty text), show the error message - the list is kept. Tip:
                  state as an object <Code>{'{ comments, error }'}</Code>.
                </li>
                <li>
                  A dedicated <Code>SendButton</Code> with <Code>useFormStatus</Code>: “Send”, while sending “Sending …”. Comments appear as <Code>{'<li>'}</Code>.
                </li>
                <li>
                  Bonus: with <Code>useOptimistic</Code> the comment appears immediately (semi-transparent).
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What does a function in <form action={fn}> receive as its argument?',
            antworten: ['The submit event', 'A FormData object', 'The values from state'],
            richtig: 1,
            erklaerung: 'With formData.get("name") you read the fields by their name attribute.',
          },
          {
            frage: 'Which hook may, as an exception, be inside an if?',
            antworten: ['useState', 'useActionState', 'use'],
            richtig: 2,
            erklaerung: 'use is the only exception to the order rule.',
          },
          {
            frage: 'Where must useFormStatus be called?',
            antworten: [
              'In the component that renders the <form>',
              'In a component rendered inside the <form>',
              'Anywhere',
            ],
            richtig: 1,
            erklaerung: 'It reads the status of the surrounding form - so it has to be inside it.',
          },
          {
            frage: 'What happens to an optimistic value when the action is finished?',
            antworten: [
              'It stays forever',
              'React replaces it with the real state',
              'It is stored in localStorage',
            ],
            richtig: 1,
            erklaerung: 'That’s why the display jumps back if the real state wasn’t updated.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>use(promise)</Code> + <Code>Suspense</Code> for asynchronous data; don’t create the promise
            while rendering.
          </>,
          <>
            <Code>{'<form action={fn}>'}</Code> receives <Code>FormData</Code> - no <Code>preventDefault</Code>{' '}
            needed.
          </>,
          <>
            <Code>useActionState</Code> = the action’s result as state + <Code>isPending</Code>.
          </>,
          <>
            <Code>useFormStatus</Code> provides <Code>pending</Code> for components inside the form.
          </>,
          <>
            <Code>useOptimistic</Code> shows the expected result immediately.
          </>,
        ]}
      />
    </>
  )
}
