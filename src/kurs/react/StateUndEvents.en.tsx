import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './StateUndEvents.code'

/**
 * KAPITEL 3.3 (English) - Events & State
 */
export function StateUndEvents() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>A click changes the state - and React redraws the component.</P>
        <TryIt
          id="react-state-einstieg"
          {...beispiele['react-state-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Responding to events">
        <P>
          In React you attach event handlers directly as props: <Code>onClick</Code>, <Code>onChange</Code>,{' '}
          <Code>onSubmit</Code>, <Code>onKeyDown</Code> … You pass <strong>a function</strong> - React calls
          it when the event happens and passes in the event object.
        </P>
        <TryIt
          id="react-state-1"
          {...beispiele['react-state-1']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Why a normal variable is not enough">
        <P>Try out what happens here when you click the button:</P>
        <TryIt
          id="react-state-2"
          {...beispiele['react-state-2']}
          modus="react"
        />
        <P>The console counts up, the display stays at 0. Two reasons:</P>
        <Liste>
          <li>
            <strong>React knows nothing about the change.</strong> Changing a variable does not trigger a new
            render.
          </li>
          <li>
            <strong>Local variables don’t survive a render.</strong> When the component renders again, the
            function starts from scratch - and <Code>clicks</Code> is 0 again.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="useState">
        <P>
          <Code>useState</Code> solves both problems. It is a <strong>hook</strong> - a function that lets a
          component “hook into” React. It returns a pair:
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="react-state-3"
          {...beispiele['react-state-3']}
          modus="react"
        />
        <Hinweis variante="info">
          You recognize hooks by the <Code>use</Code> prefix. They may only be called{' '}
          <strong>at the top level of a component</strong> - not in <Code>if</Code>, loops or nested
          functions. You will learn why in part 4.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Rendering: what happens on setState">
        <P>Every state change goes through three steps:</P>
        <ol className="max-w-3xl list-decimal space-y-1 pl-5 leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Trigger</strong> - you call <Code>setClicks(1)</Code>. React remembers the new value and
            schedules a render.
          </li>
          <li>
            <strong>Render</strong> - React calls your component function <em>again</em>. This time{' '}
            <Code>useState</Code> returns the new value.
          </li>
          <li>
            <strong>Commit</strong> - React compares the new JSX with the old one and only changes the DOM
            parts that are actually different.
          </li>
        </ol>
        <P>
          This leads to something important: within a render, state is a <strong>snapshot</strong>. The
          setter doesn’t change the variable, it changes the value for the <em>next</em> render.
        </P>
        <TryIt
          id="react-state-4"
          {...beispiele['react-state-4']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="react-state-uebung"
          {...beispiele['react-state-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Build a tweet box:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  A <Code>{'<textarea>'}</Code> whose content lives in state.
                </li>
                <li>Below it “<em>x</em> / 50 characters”. Above 50 characters the counter turns red (<Code>{"color: 'red'"}</Code>).</li>
                <li>
                  A “Send” button that is <Code>disabled</Code> when the text is empty or too long.
                </li>
                <li>Sending clears the text and increases a “Sent: n” counter.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What triggers a new render of the component?',
            antworten: ['Changing a local variable', 'Calling the useState setter with a new value', 'Calling console.log'],
            richtig: 1,
            erklaerung: 'Only state changes (and new props from above) trigger a render.',
          },
          {
            frage: 'number is 0. What does setNumber(number + 1); console.log(number) log?',
            antworten: ['0', '1', 'undefined'],
            richtig: 0,
            erklaerung: 'State is a snapshot within a render. The new value only applies in the next render.',
          },
          {
            frage: 'When is the initial value of useState(0) used?',
            antworten: ['On every render', 'Only on the very first render', 'On every click'],
            richtig: 1,
            erklaerung: 'After that React remembers the current value and ignores the argument.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Pass event handlers as functions: <Code>{'onClick={fn}'}</Code> or{' '}
            <Code>{'onClick={() => fn(x)}'}</Code>.
          </>,
          'Normal variables don’t trigger a render and don’t survive one.',
          <>
            <Code>const [value, setValue] = useState(initial)</Code> - call the setter → React re-renders.
          </>,
          'Rendering = React calls your function again; then only what’s necessary changes in the DOM.',
          'State is a snapshot per render.',
          'Values you can calculate from state don’t need their own state.',
        ]}
      />
    </>
  )
}
