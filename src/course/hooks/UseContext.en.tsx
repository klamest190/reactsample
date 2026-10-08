import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './UseContext.code'
import { ContextDemo } from '../demos/ContextDemo'

/**
 * KAPITEL 4.6 (English) - useContext
 */
export function UseContext() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P><Code>useContext</Code> reads a value provided further up the tree - without any props.</P>
        <TryIt
          id="hooks-usecontext-einstieg"
          {...examples['hooks-usecontext-einstieg']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="The problem: prop drilling">
        <P>
          Some values are needed by almost the entire app: the logged-in user, the color scheme, the language.
          With props you would have to pass them through every intermediate level - even through components
          that don’t use them themselves. This is called <strong>prop drilling</strong>.
        </P>
        <TryIt
          id="hooks-usecontext-drilling"
          {...examples['hooks-usecontext-drilling']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Context in three steps">
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Liste>
          <li>
            <Code>useContext</Code> returns the value of the <strong>closest provider above</strong>. If there
            is none, the default value from <Code>createContext</Code>.
          </li>
          <li>
            When the provider’s <Code>value</Code> changes, <strong>all components that read the context</strong>{' '}
            re-render automatically.
          </li>
          <li>
            Context is <strong>not a state manager</strong>, but a means of transport. The state itself still
            lives in <Code>useState</Code> or <Code>useReducer</Code> - usually in a dedicated provider
            component.
          </li>
        </Liste>
        <ContextDemo />
      </Abschnitt>

      <Abschnitt titel="The pro pattern: provider + reducer + custom hook">
        <P>
          In real projects you combine context with <Code>useReducer</Code> and wrap everything up in one file.
          Components only see a hook - like <Code>useTheme()</Code> and <Code>useSprache()</Code> in this
          project.
        </P>
        <TryIt
          id="hooks-usecontext-muster"
          {...examples['hooks-usecontext-muster']}
          mode="react"
        />
        <Hinweis variante="warnung">
          Every change to the context value re-renders <em>all</em> consumers. Keep the value stable with{' '}
          <Code>useMemo</Code> and prefer several small contexts (e.g. one for data, one for{' '}
          <Code>dispatch</Code>) over one huge one. And: not everything belongs in context - props are
          perfectly fine for two levels.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="hooks-usecontext-uebung"
          {...examples['hooks-usecontext-uebung']}
          mode="react"
          task={
            <>
              <p>Make the app multilingual:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Create a <Code>LanguageContext</Code>. The provider keeps the language (<Code>'en'</Code> or{' '}
                  <Code>'de'</Code>) in state.
                </li>
                <li>
                  Write a hook <Code>useTranslation()</Code> that returns <Code>{'{ language, t, toggle }'}</Code>.{' '}
                  <Code>t('greeting')</Code> returns the text from <Code>TEXTS</Code> in the current language.
                </li>
                <li>
                  <Code>Greeting</Code> and <Code>LanguageSwitch</Code> use the hook - without props.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'What does useContext return if there is no provider above?',
            answers: ['undefined', 'The default value from createContext', 'An error'],
            correct: 1,
            explanation: 'That’s why you often use null as the default and check for it in your own hook.',
          },
          {
            question: 'What happens when a provider’s value changes?',
            answers: [
              'Nothing until the page reloads',
              'All components that read the context re-render',
              'Only direct children re-render',
            ],
            correct: 1,
            explanation: 'Even memo components re-render when they read the changed context.',
          },
          {
            question: 'What is context NOT meant for?',
            answers: [
              'Making values available deep in the tree',
              'Replacing every piece of state, even if only one child needs it',
              'Providing the theme or logged-in user',
            ],
            correct: 1,
            explanation: 'For nearby components, props are simpler and more explicit.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Context solves prop drilling: createContext → provider → useContext.',
          <>
            React 19: <Code>{'<MyContext value={…}>'}</Code> instead of <Code>.Provider</Code>.
          </>,
          'Context only transports - the state lives in useState/useReducer inside the provider.',
          'Pattern: provider component + custom hook with a null check.',
          <>
            Keep the value stable with <Code>useMemo</Code>, prefer several small contexts.
          </>,
        ]}
      />
    </>
  )
}
