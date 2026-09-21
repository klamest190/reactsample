import { Abschnitt, Code, Hinweis, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './UseRef.code'
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
          {...beispiele['hooks-useref-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="A drawer that survives renders">
        <P>
          <Code>useRef(initial)</Code> gives you an object <Code>{'{ current: initial }'}</Code>. React hands
          you <strong>the same object</strong> on every render. You can change <Code>current</Code> at any
          time - and that does <strong>not</strong> trigger a render.
        </P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4"></th>
                <th className="py-2 pr-4">useState</th>
                <th className="py-2">useRef</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="py-2 pr-4 font-medium">Changing it triggers a render</td>
                <td className="py-2 pr-4">yes</td>
                <td className="py-2">no</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Changing</td>
                <td className="py-2 pr-4">via the setter, applies from the next render</td>
                <td className="py-2">
                  <Code>ref.current = x</Code>, immediately
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Read while rendering</td>
                <td className="py-2 pr-4">yes</td>
                <td className="py-2">no (except for initialization)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Typical for</td>
                <td className="py-2 pr-4">everything you see</td>
                <td className="py-2">DOM elements, timer IDs, “mechanics”</td>
              </tr>
            </tbody>
          </table>
        </div>
        <TryIt
          id="hooks-useref-vergleich"
          {...beispiele['hooks-useref-vergleich']}
          modus="react"
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
          {...beispiele['hooks-useref-dom']}
          modus="react"
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
        <TryIt id="hooks-useref-imperativ" {...beispiele['hooks-useref-imperativ']} modus="react" />
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
        <TryIt id="hooks-useref-layout" {...beispiele['hooks-useref-layout']} modus="react" />
        <Hinweis variante="warnung">
          <Code>useLayoutEffect</Code> blocks painting until it is done. Use it only for measuring and positioning
          (tooltips, popups, scroll position) - for everything else <Code>useEffect</Code> is still right.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="hooks-useref-uebung"
          {...beispiele['hooks-useref-uebung']}
          modus="react"
          aufgabe={
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
        fragen={[
          {
            frage: 'What happens when you set ref.current = 5?',
            antworten: [
              'The component re-renders',
              'The value is stored immediately, there is no render',
              'An error, refs are read-only',
            ],
            richtig: 1,
            erklaerung: 'Refs are mutable and “invisible” to React.',
          },
          {
            frage: 'When is a DOM ref (ref={myRef}) set?',
            antworten: ['Already during the first render', 'After React has updated the DOM'],
            richtig: 1,
            erklaerung: 'That’s why you use it in effects or event handlers, not while rendering.',
          },
          {
            frage: 'Where do you store the ID from setInterval?',
            antworten: ['In a local variable', 'In useState', 'In useRef'],
            richtig: 2,
            erklaerung: 'It has to survive renders but should not trigger one.',
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
