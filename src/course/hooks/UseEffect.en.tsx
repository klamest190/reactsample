import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './UseEffect.code'
import { TitelUndFenster } from '../demos/TitelUndFenster'

/**
 * KAPITEL 4.2 (English) - useEffect
 */
export function UseEffect() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P><Code>useEffect</Code> runs after rendering - here every time <Code>count</Code> changes.</P>
        <TryIt
          id="hooks-useeffect-einstieg"
          {...examples['hooks-useeffect-einstieg']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="What effects are for">
        <P>
          While rendering, a component should only calculate JSX - without side effects. Sometimes, however,
          it has to synchronize with something <strong>outside of React</strong>: start a timer, subscribe to
          a browser event, set <Code>document.title</Code>, open a connection. That is what{' '}
          <Code>useEffect</Code> is for. The effect runs <strong>after</strong> rendering, once the DOM has
          been updated.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="The dependency array">
        <P>The second argument decides when the effect runs again:</P>
        <Tabelle
          spalten={['font-mono']}
          zeilen={[
            ['[]', 'Only after the first render. Cleanup when the component is removed.'],
            [
              '[a, b]',
              <>
                After the first render and whenever <Code>a</Code> or <Code>b</Code> has changed (compared
                with <Code>Object.is</Code>).
              </>,
            ],
            ['omitted', 'After every render - rarely what you want.'],
          ]}
        />
        <TryIt
          id="hooks-useeffect-deps"
          {...examples['hooks-useeffect-deps']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Cleaning up">
        <P>
          React calls the function your effect returns <strong>before</strong> the effect runs again and when
          the component disappears. Without it, timers keep running and event listeners pile up (memory
          leak).
        </P>
        <TryIt
          id="hooks-useeffect-cleanup"
          {...examples['hooks-useeffect-cleanup']}
          mode="react"
        />
        <TitelUndFenster />
        <Hinweis variante="info">
          In <Code>StrictMode</Code> (see <Code>src/main.tsx</Code>) React runs every effect{' '}
          <strong>one extra time</strong> during development: effect → cleanup → effect. If your cleanup is
          missing, you notice right away. This does not happen in the production build. (The previews in the
          editors run without StrictMode.)
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Stale values: be honest about dependencies">
        <P>
          An effect is a closure over the props and state of <em>its</em> render. If a value you use is
          missing from the dependency array, the effect keeps running with a stale value. The rule:{' '}
          <strong>everything the effect reads from the component belongs in the array.</strong> The linter
          rule <Code>react-hooks/exhaustive-deps</Code> checks this automatically.
        </P>
        <TryIt
          id="hooks-useeffect-stale"
          {...examples['hooks-useeffect-stale']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Often you don’t need an effect at all">
        <P>
          Effects are an “escape hatch” from React. Two typical cases where they are <strong>wrong</strong>:
        </P>
        <Liste>
          <li>
            <strong>Calculating values from props/state</strong> → calculate them directly while rendering
            (with <Code>useMemo</Code> if needed).
          </li>
          <li>
            <strong>Reacting to a user action</strong> → put it in the event handler, not in an effect that
            waits for the resulting change.
          </li>
        </Liste>
        <CodeBlock
          code={codeBloecke.beispiel2}
        />
        <Hinweis variante="tipp">
          Rule of thumb: <em>“Why should this code run?”</em> Because the component is{' '}
          <strong>displayed</strong> → effect. Because the user <strong>did</strong> something → event
          handler. Because a value <strong>follows</strong> from others → calculate it while rendering.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="hooks-useeffect-uebung"
          {...examples['hooks-useeffect-uebung']}
          mode="react"
          task={
            <>
              <p>Build a Pomodoro countdown:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>Starts at 10 seconds, shown in the <Code>{'<h1>'}</Code> as “0:10”. Buttons: “Start”/“Pause” and “Reset”.</li>
                <li>
                  An effect with an interval counts down every second - <strong>only while it is
                  running</strong>. Don’t forget the cleanup!
                </li>
                <li>At 0 it stops automatically and shows “⏰ Take a break!”.</li>
                <li>
                  Second effect: <Code>document.title</Code> shows the remaining time, in the same format as the display, e.g. “0:07”.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'When does an effect with an empty dependency array [] run?',
            answers: ['Before the first render', 'After the first render', 'After every render'],
            correct: 1,
            explanation: 'Effects always run after rendering. With [] only after the first one.',
          },
          {
            question: 'When does React call the cleanup function?',
            answers: [
              'Only when the component is removed',
              'Before every re-run of the effect and on removal',
              'After every render',
            ],
            correct: 1,
            explanation: 'That way the old effect is always cleaned up before the new one starts.',
          },
          {
            question: 'You want filteredList from list and search. What is right?',
            answers: ['useEffect + setFilteredList', 'Calculate it while rendering (useMemo if needed)', 'useRef'],
            correct: 1,
            explanation: 'Derived values need neither an effect nor state.',
          },
          {
            question: 'Why does an effect run twice during development?',
            answers: [
              'A bug in React',
              'StrictMode deliberately checks whether the cleanup is correct',
              'Because dependencies are missing',
            ],
            correct: 1,
            explanation: 'Only during development and only in StrictMode.',
          },
        ]}
      />

      <Merke
        punkte={[
          'useEffect synchronizes with systems outside of React and runs after rendering.',
          <>
            Dependencies: <Code>[]</Code> once, <Code>[a]</Code> when a changes, no array after every render.
          </>,
          'Everything the effect reads from the component belongs in the dependency array.',
          'Cleanup removes timers, listeners and connections - before the next run and on removal.',
          'Calculations and reactions to clicks don’t belong in an effect.',
        ]}
      />
    </>
  )
}
