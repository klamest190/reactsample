import { Abschnitt, Code, Hinweis, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/ChapterLink'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './UseRef.code'
import { RefDemo } from '../demos/RefDemo'

/**
 * KAPITEL 4.3 (English) - useRef
 */
export function UseRef() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P><Code>useRef</Code> gives you access to a real DOM element.</P>
        <TryIt
          id="hooks-useref-einstieg"
          {...examples['hooks-useref-einstieg']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="A drawer that survives renders">
        <P>
          <Code>useRef(initial)</Code> gives you an object <Code>{'{ current: initial }'}</Code>. React hands
          you <strong>the same object</strong> on every render. You can change <Code>current</Code> at any
          time - and that does <strong>not</strong> trigger a render.
        </P>
        <Tabelle
          kopf={['', 'useState', 'useRef']}
          spalten={['font-medium']}
          zeilen={[
            ['Changing it triggers a render', 'yes', 'no'],
            [
              'Changing',
              'via the setter, applies from the next render',
              <>
                <Code>ref.current = x</Code>, immediately
              </>,
            ],
            ['Read while rendering', 'yes', 'no (except for initialization)'],
            ['Typical for', 'everything you see', 'DOM elements, timer IDs, “mechanics”'],
          ]}
        />
        <TryIt
          id="hooks-useref-vergleich"
          {...examples['hooks-useref-vergleich']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Accessing DOM elements">
        <P>
          If you pass a ref object as the <Code>ref</Code> prop to a JSX element, React sets{' '}
          <Code>ref.current</Code> to the DOM node after rendering. This lets you focus, scroll, measure or
          control browser APIs like video playback.
        </P>
        <TryIt
          id="hooks-useref-dom"
          {...examples['hooks-useref-dom']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Remembering values: timer IDs & co.">
        <P>
          Nobody needs to see the ID of an interval - but you have to find it again to stop it. A normal
          variable would be gone on the next render, state would render unnecessarily. That is exactly what a
          ref is for.
        </P>
        <RefDemo />
      </Abschnitt>

      <Abschnitt titel="Passing refs to your own components">
        <P>
          Since React 19, <Code>ref</Code> is a normal prop for function components. The component simply
          passes it on to a DOM element. (You used to need <Code>forwardRef</Code> for this - you will still
          see it a lot in older code.)
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Hinweis variante="warnung">
          <strong>Don’t read or write</strong> <Code>ref.current</Code> <strong>while rendering</strong>{' '}
          (exception: one-time initialization). React doesn’t know about ref changes - whatever you display
          with it can get out of date. Refs belong in event handlers and effects.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exposing only selected methods: useImperativeHandle">
        <P>
          Normally the parent gets the whole DOM element through the ref - and can do anything with it. With{' '}
          <Code>useImperativeHandle</Code> the child decides what it offers: here only <Code>focus()</Code> and{' '}
          <Code>clear()</Code>.
        </P>
        <TryIt id="hooks-useref-imperativ" {...examples['hooks-useref-imperativ']} mode="react" />
        <Hinweis variante="tipp">
          This is the exception, not the rule. Whatever can be expressed with props (<Code>{'value'}</Code>,{' '}
          <Code>{'open'}</Code>) belongs in props. Imperative methods are meant for things like focus, scrolling or
          playback.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Measuring before painting: useLayoutEffect">
        <P>
          <Code>useEffect</Code> runs <em>after</em> the browser has painted (<Verweis id="hooks-useeffect" />). If you
          measure an element there and then rearrange something, you briefly see the wrong state - it flickers.{' '}
          <Code>useLayoutEffect</Code> runs right after the DOM change but <strong>before</strong> painting.
        </P>
        <TryIt id="hooks-useref-layout" {...examples['hooks-useref-layout']} mode="react" />
        <Hinweis variante="warnung">
          <Code>useLayoutEffect</Code> blocks painting until it is done. Use it only for measuring and positioning
          (tooltips, popups, scroll position) - for everything else <Code>useEffect</Code> is still right.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="hooks-useref-uebung"
          {...examples['hooks-useref-uebung']}
          mode="react"
          task={
            <>
              <p>Build a stopwatch with lap times:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>Display in the <Code>{'<h1>'}</Code> in seconds with one decimal (e.g. “3.4 s”, starting at “0.0 s”). Update every 100 ms.</li>
                <li>
                  The <strong>interval ID</strong> and the <strong>start time</strong> (<Code>Date.now()</Code>)
                  live in refs.
                </li>
                <li>Buttons: “Start”, “Stop”, “Lap” (stores the current time as an <Code>{'<li>'}</Code> in a list), “Reset”.</li>
                <li>When the component is removed, the interval must be stopped.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'What happens when you set ref.current = 5?',
            answers: [
              'The component re-renders',
              'The value is stored immediately, there is no render',
              'An error, refs are read-only',
            ],
            correct: 1,
            explanation: 'Refs are mutable and “invisible” to React.',
          },
          {
            question: 'When is a DOM ref (ref={myRef}) set?',
            answers: ['Already during the first render', 'After React has updated the DOM'],
            correct: 1,
            explanation: 'That’s why you use it in effects or event handlers, not while rendering.',
          },
          {
            question: 'Where do you store the ID from setInterval?',
            answers: ['In a local variable', 'In useState', 'In useRef'],
            correct: 2,
            explanation: 'It has to survive renders but should not trigger one.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>useRef</Code> returns a stable <Code>{'{ current }'}</Code> object; changing it doesn’t
            trigger a render.
          </>,
          <>
            DOM access: <Code>{'<input ref={myRef} />'}</Code>, then <Code>myRef.current.focus()</Code>.
          </>,
          'For “mechanics” values: timer IDs, start times, previous values.',
          <>
            React 19: <Code>ref</Code> is a normal prop - <Code>forwardRef</Code> is no longer needed.
          </>,
          'Don’t read/write refs while rendering - anything displayed belongs in state.',
        ]}
      />
    </>
  )
}
