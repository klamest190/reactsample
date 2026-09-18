import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './UseMemo.code'
import { PerformanceDemo } from '../demos/PerformanceDemo'

/**
 * KAPITEL 3.4 (English) - useMemo, useCallback & memo
 */
export function UseMemo() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P><Code>useMemo</Code> only recalculates when a dependency changes. Watch the console.</P>
        <TryIt
          id="hooks-usememo-einstieg"
          {...beispiele['hooks-usememo-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="When does a component render?">
        <P>
          When a component renders, React renders <strong>all of its children</strong> by default -
          regardless of whether their props changed. That is almost always fast enough, because rendering
          just means “calling a function”; React only changes the DOM where necessary anyway.
        </P>
        <TryIt
          id="hooks-usememo-render"
          {...beispiele['hooks-usememo-render']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="memo: skipping renders">
        <P>
          <Code>memo(Component)</Code> creates a variant that only re-renders when a prop has changed. Each
          prop is compared with <Code>Object.is</Code> - so for objects and functions it compares the{' '}
          <strong>reference</strong> (<Verweis nr="1.6" />).
        </P>
        <TryIt
          id="hooks-usememo-memo"
          {...beispiele['hooks-usememo-memo']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="useCallback and useMemo">
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Liste>
          <li>
            Both return the <strong>stored value</strong> on the next render as long as no dependency has
            changed.
          </li>
          <li>
            <Code>useMemo</Code> has two uses: not repeating <strong>expensive calculations</strong> on every
            render, and passing <strong>stable objects/arrays</strong> to memo children or effect
            dependencies.
          </li>
          <li>
            You mostly need <Code>useCallback</Code> only when the function goes to a <Code>memo</Code> child or
            appears in a dependency array.
          </li>
        </Liste>
        <PerformanceDemo />
        <TryIt
          id="hooks-usememo-teuer"
          {...beispiele['hooks-usememo-teuer']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="The React Compiler">
        <P>
          Putting <Code>useMemo</Code>, <Code>useCallback</Code> and <Code>memo</Code> in the right places is tedious and
          error-prone. The <strong>React Compiler</strong> does it at build time: it analyzes every component and caches
          intermediate results automatically - exactly where values have not changed.
        </P>
        <CodeBlock code={codeBloecke.compilerVorher} />
        <P>This is how you switch it on in a Vite project:</P>
        <CodeBlock code={codeBloecke.compilerEinrichten} />
        <Liste>
          <li>
            The compiler relies on the <strong>rules of React</strong>: components are pure, props and state are not
            mutated, hooks are only called at the top (<Verweis id="hooks-usestate" />). If a component breaks the
            rules, the compiler simply skips it.
          </li>
          <li>
            Existing <Code>useMemo</Code> and <Code>useCallback</Code> calls can stay. With the compiler you only write
            new ones in exceptional cases - for example when a value must stay stable as an effect dependency.
          </li>
          <li>
            In the React DevTools, optimized components carry the badge <strong>“Memo ✨”</strong>.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="When to optimize?">
        <Hinweis variante="warnung">
          <strong>Measure first, then optimize.</strong> <Code>memo</Code>, <Code>useMemo</Code> and{' '}
          <Code>useCallback</Code> cost memory and comparisons themselves, and wrong dependencies cause bugs
          that are hard to find. Most components need none of them.
        </Hinweis>
        <Liste>
          <li>
            Restructuring often helps more: move state <strong>down</strong> into the component that needs it,
            or pass heavy parts as <Code>children</Code>.
          </li>
          <li>
            The <strong>React Compiler</strong> applies these optimizations automatically at build time. With
            it you hardly write <Code>useMemo</Code> and <Code>useCallback</Code> by hand anymore - but
            understanding them remains important.
          </li>
          <li>
            You can measure with the <strong>Profiler</strong> of the React DevTools.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="hooks-usememo-uebung"
          {...beispiele['hooks-usememo-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                The note field is sluggish because 20,000 entries are sorted on every keystroke and the slow table
                re-renders. Optimize it <strong>without changing the functionality</strong>:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Sorting should only run when <Code>direction</Code> changes.
                </li>
                <li>
                  <Code>Table</Code> should not render at all while typing in the note field.
                </li>
                <li>Check in the console that your optimization works.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'A memo child receives style={{ color: "red" }}. Does it re-render on every parent render?',
            antworten: ['No, the content is the same', 'Yes, the object literal is a new reference on every render'],
            richtig: 1,
            erklaerung: 'memo compares references. Fix: useMemo or define the object outside the component.',
          },
          {
            frage: 'What is the difference between useMemo and useCallback?',
            antworten: [
              'useMemo remembers a result, useCallback a function',
              'useCallback is faster',
              'useMemo is only for arrays',
            ],
            richtig: 0,
            erklaerung: 'useCallback(fn, deps) is equivalent to useMemo(() => fn, deps).',
          },
          {
            frage: 'When should you use useMemo?',
            antworten: [
              'For every calculation',
              'When a calculation is measurably expensive or a stable reference is needed',
              'Never, the compiler does it',
            ],
            richtig: 1,
            erklaerung: 'Optimization has costs. Measure first, then apply it deliberately.',
          },
        ]}
      />

      <Merke
        punkte={[
          'When a component renders, its children render too by default.',
          <>
            <Code>memo</Code> skips renders when props are equal - compared by reference.
          </>,
          <>
            <Code>useMemo</Code> remembers results, <Code>useCallback</Code> functions - until a dependency
            changes.
          </>,
          'The three usually only work together: memo child + stable props.',
          'Measure first (React DevTools Profiler), then optimize. The React Compiler takes a lot of this off your hands.',
        ]}
      />
    </>
  )
}
