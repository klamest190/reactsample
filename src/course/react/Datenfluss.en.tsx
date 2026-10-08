import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Datenfluss.code'

/**
 * KAPITEL 3.4 (English) - Sharing State & Data Flow
 */
export function Datenfluss() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>The state lives in the parent: data goes down as a prop, the click goes up as a callback.</P>
        <TryIt
          id="react-datenfluss-einstieg"
          {...examples['react-datenfluss-einstieg']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Data flows down, events flow up">
        <P>
          Every component has its <strong>own</strong> state. Two sibling components cannot access each
          other’s state directly. The rule in React is simple:
        </P>
        <Liste>
          <li>
            <strong>Data flows down</strong> - parents pass values to children as props.
          </li>
          <li>
            <strong>Events flow up</strong> - parents pass functions as props, which children call to report
            something.
          </li>
        </Liste>
        <TryIt
          id="react-datenfluss-1"
          {...examples['react-datenfluss-1']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Lifting state up">
        <P>
          If several components need the same state, it belongs in their <strong>closest common
          parent</strong>. In the example, only one section should be open at a time. As long as each
          section has its own <Code>isOpen</Code> state, that’s impossible - the sections don’t know about
          each other.
        </P>
        <TryIt
          id="react-datenfluss-2"
          {...examples['react-datenfluss-2']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="A single source of truth">
        <P>
          Store every piece of information only <strong>once</strong>. Anything that can be calculated from it
          is calculated while rendering. Duplicated state sooner or later gets out of sync.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Hinweis variante="tipp">
          Ask yourself for every piece of state: <em>Does it change over time? Isn’t it already passed in as a
          prop? Can I calculate it from other state?</em> Only if the answers are “yes, no, no” is it real
          state.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Thinking in React - a procedure">
        <ol className="max-w-3xl list-decimal space-y-1 pl-5 leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Break the UI into components</strong> - each component has one job.
          </li>
          <li>
            <strong>Build a static version</strong> - props only, no state yet.
          </li>
          <li>
            <strong>Find the minimal state</strong> - what really changes?
          </li>
          <li>
            <strong>Decide where the state lives</strong> - in the closest common parent of all components
            that need it.
          </li>
          <li>
            <strong>Add inverse data flow</strong> - pass callbacks to the children.
          </li>
        </ol>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="react-datenfluss-uebung"
          {...examples['react-datenfluss-uebung']}
          mode="react"
          task={
            <>
              <p>The components are already built statically (step 2). Make the list filterable:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>SearchField</Code> and <Code>OnlyAvailable</Code> receive their value and a callback as
                  props - they have <strong>no state of their own</strong>.
                </li>
                <li>
                  The state (search text, checkbox) lives in <Code>App</Code>.
                </li>
                <li>
                  <Code>ProductList</Code> only receives the already <em>filtered</em> products.
                </li>
                <li>The search ignores upper/lower case.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'Two sibling components need the same value. Where does the state belong?',
            answers: ['In both components', 'In the closest common parent', 'In a global variable'],
            correct: 1,
            explanation: 'From there it can be passed down to both children as props.',
          },
          {
            question: 'How does a child tell its parent that something happened?',
            answers: [
              'It changes the props',
              'It calls a function it received as a prop',
              'It reads the parent’s state',
            ],
            correct: 1,
            explanation: 'Callback props are the way up.',
          },
          {
            question: 'You have the state “list”. How do you get “count”?',
            answers: ['const [count, setCount] = useState(list.length)', 'const count = list.length'],
            correct: 1,
            explanation: 'Derived values are calculated while rendering - that way they can never get out of date.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Data flows down via props, events flow up via callback props.',
          'State needed by several components moves to their closest common parent.',
          'Components without their own state that are driven by props are called “controlled”.',
          'A single source of truth: calculate what can be derived instead of storing it twice.',
        ]}
      />
    </>
  )
}
