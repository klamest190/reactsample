import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke, uebungDateien, uebungVarianten } from './Testen.code'

/**
 * KAPITEL 4.8 (English) - Testing with Vitest and React Testing Library
 */

const ebenen: [string, string, string][] = [
  ['Unit tests', 'Single functions: calculations, reducers, validation', 'Vitest'],
  ['Component tests', 'Use one component like a person would', 'Vitest + Testing Library'],
  ['End-to-end tests', 'The whole app in a real browser, including the server', 'Playwright'],
]

const abfragen: [string, string][] = [
  ['getBy…', 'Exactly one element - otherwise an error. The normal case.'],
  ['queryBy…', 'Element or null - to check that something is NOT there.'],
  ['findBy…', 'Waits until the element appears (async, with await).'],
  ['getAllBy…', 'Several elements as an array.'],
]

export function Testen() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          A test renders a component, clicks like a person and checks what is visible afterwards. The tests run
          right here in the editor - change <Code>count + 1</Code> to <Code>count + 2</Code> and the test turns red.
        </P>
        <TryIt id="praxis-testen-einstieg" {...beispiele['praxis-testen-einstieg']} modus="test" />
      </Abschnitt>

      <Abschnitt titel="Why test?">
        <P>
          So far you tried out whether your code works: click, look, move on. That works until the app grows. Then
          you change one place and something completely different breaks without you noticing. Tests are trying
          things out <strong>as code</strong>: written once, then repeated in seconds on every save. By the way, the
          exercises in this course check your solutions the same way.
        </P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Kind</th>
                <th className="py-2 pr-4">What is checked?</th>
                <th className="py-2">Tool</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {ebenen.map(([art, was, werkzeug]) => (
                <tr key={art}>
                  <td className="py-1.5 pr-4 font-medium">{art}</td>
                  <td className="py-1.5 pr-4">{was}</td>
                  <td className="py-1.5">{werkzeug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Many fast unit and component tests, a few slow end-to-end tests for the most important flows (logging in,
          ordering). This chapter is about the first two.
        </P>
      </Abschnitt>

      <Abschnitt titel="Vitest: test, describe, expect">
        <P>
          <strong>Vitest</strong> is the test runner for Vite projects. A test is a function with a name:{' '}
          <Code>test('what should happen', () =&gt; {'{ … }'})</Code>. Inside, <Code>expect(value)</Code> checks the
          result with a <strong>matcher</strong> such as <Code>toBe</Code>. <Code>describe</Code> groups tests.
        </P>
        <TryIt id="praxis-testen-vitest" {...beispiele['praxis-testen-vitest']} modus="test" />
        <Liste>
          <li>
            <Code>toBe</Code> compares with <Code>===</Code>, <Code>toEqual</Code> compares the contents - for objects
            and arrays (<Verweis id="js-referenzen" />).
          </li>
          <li>
            To check for errors, wrap the call in a function: <Code>expect(() =&gt; …).toThrow()</Code>.
          </li>
          <li>
            <strong>Pure functions</strong> are the easiest to test, e.g. reducers (<Verweis id="hooks-usereducer" />):
            same input, same output, no React needed.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Testing components with Testing Library">
        <P>
          <strong>React Testing Library</strong> renders a component and finds elements the way people do: by their{' '}
          <strong>role</strong> and visible name, not by CSS classes or component internals. With{' '}
          <strong>user-event</strong> you type and click like real users.
        </P>
        <TryIt id="praxis-testen-rtl" {...beispiele['praxis-testen-rtl']} modus="test" />
        <P>The queries come in four variants:</P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {abfragen.map(([name, text]) => (
                <tr key={name}>
                  <td className="py-1.5 pr-4 align-top">
                    <Code>{name}</Code>
                  </td>
                  <td className="py-1.5">{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          And what to search by? In this order: <Code>ByRole</Code> (buttons, headings, fields …),{' '}
          <Code>ByLabelText</Code> (form fields), <Code>ByText</Code>, and only as a last resort{' '}
          <Code>ByTestId</Code>. If <Code>getByRole</Code> cannot find something, a screen reader often cannot either
          - more on that in <Verweis id="praxis-barrierefreiheit" />.
        </P>
        <Hinweis variante="tipp">
          <Code>userEvent.setup()</Code> once per test, then every action with <Code>await</Code>:{' '}
          <Code>user.click()</Code>, <Code>user.type()</Code>, <Code>user.keyboard('{'{Enter}'}')</Code>,{' '}
          <Code>user.selectOptions()</Code>. It fires all the events a real click fires - the older{' '}
          <Code>fireEvent</Code> fires just one.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Mocks and async code">
        <P>
          Many components call something outside: a callback prop, a server. In a test you replace it with a{' '}
          <strong>mock</strong>. <Code>vi.fn()</Code> records every call and returns whatever you specify. That lets
          you check <em>whether</em> and <em>with what</em> it was called - and play through the error case too.
        </P>
        <TryIt id="praxis-testen-mocks" {...beispiele['praxis-testen-mocks']} modus="test" />
        <P>
          If the component loads data itself (<Verweis id="praxis-daten" />), <Code>vi.spyOn()</Code> replaces the
          global <Code>fetch</Code> for the duration of a test. <Code>findBy…</Code> waits until the response is shown:
        </P>
        <TryIt id="praxis-testen-fetch" {...beispiele['praxis-testen-fetch']} modus="test" />
        <Hinweis variante="info">
          Larger projects prefer to intercept requests at the network level with <strong>MSW</strong> (Mock Service
          Worker). Then the test does not need to know whether the component uses <Code>fetch</Code>, TanStack Query or
          something else.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="What should you test?">
        <Liste>
          <li>
            <strong>Behavior, not implementation:</strong> “after the click it shows 2” - not “the state is called
            count”. Such tests survive any refactoring as long as the app does the same thing.
          </li>
          <li>
            <strong>What could break:</strong> edge cases (empty, 0, maximum), error cases, business rules. Not every
            line - 100 % coverage is not the goal.
          </li>
          <li>
            <strong>A test for every bug you find</strong> that shows it. Then it never comes back.
          </li>
          <li>
            <strong>One test checks one thing</strong> and says which in its name. When it fails, you know right away
            what is missing.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Setting it up in your project">
        <CodeBlock titel="Terminal" code={codeBloecke.installieren} />
        <CodeBlock code={codeBloecke.konfiguration} />
        <CodeBlock code={codeBloecke.setup} />
        <CodeBlock titel="Terminal" code={codeBloecke.ausfuehren} />
        <P>
          Test files live next to the code and are called <Code>Name.test.tsx</Code> - Vitest finds them
          automatically. <Code>jsdom</Code> provides a simulated <Code>document</Code> in Node.
        </P>
        <Hinweis variante="info">
          The editor here runs the real Testing Library and user-event in the browser. <Code>vitest</Code> is a
          replica with the most important functions (<Code>test</Code>, <Code>describe</Code>, <Code>expect</Code>{' '}
          with the jest-dom matchers, <Code>vi.fn</Code>, <Code>vi.spyOn</Code>). Fake timers and{' '}
          <Code>vi.mock</Code> only exist in the real Vitest.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="praxis-testen-uebung"
          {...beispiele['praxis-testen-uebung']}
          modus="test"
          dateien={uebungDateien}
          varianten={uebungVarianten}
          aufgabe={
            <>
              <p>
                This time you write the tests. <Code>QuantityPicker</Code> (above) picks a quantity from 1 to{' '}
                <Code>max</Code>. Whether your tests are good is checked by a <strong>mutation test</strong>: they also
                run against four broken versions of the component - and must catch every one of them.
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>You cannot go below 1: “Decrease” is disabled at the start.</li>
                <li>
                  The maximum is the limit: with <Code>max={'{3}'}</Code> it shows 3 after two clicks on “Increase”,
                  and “Increase” is disabled.
                </li>
                <li>
                  <Code>onChange</Code> receives the <em>new</em> value.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'How do you check that an error message is NOT shown?',
            antworten: [
              "expect(screen.getByRole('alert')).not.toBeInTheDocument()",
              "expect(screen.queryByRole('alert')).not.toBeInTheDocument()",
              "expect(screen.findByRole('alert')).toBeNull()",
            ],
            richtig: 1,
            erklaerung: 'getBy… already throws while searching if nothing is there. queryBy… returns null.',
          },
          {
            frage: 'How do you wait for an element that only appears after loading?',
            antworten: ['getByText', 'await findByText', 'setTimeout in the test'],
            richtig: 1,
            erklaerung: 'findBy… retries until the element is there or the time runs out.',
          },
          {
            frage: 'Which query does Testing Library prefer?',
            antworten: ['getByTestId', 'container.querySelector(".btn")', 'getByRole'],
            richtig: 2,
            erklaerung: 'Role and name are what people and screen readers perceive.',
          },
          {
            frage: 'What is vi.fn() for?',
            antworten: ['A mock that records its calls', 'Making tests faster', 'Rendering a component'],
            richtig: 0,
            erklaerung: 'With it you check, e.g. with toHaveBeenCalledWith, whether a callback was called correctly.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>test</Code> + <Code>expect(…).toBe/toEqual/…</Code>, grouped with <Code>describe</Code>.
          </>,
          <>
            Components: <Code>render</Code>, then find via <Code>screen.getByRole</Code> and interact with{' '}
            <Code>userEvent</Code>.
          </>,
          <>
            <Code>getBy</Code> = must be there, <Code>queryBy</Code> = may be missing, <Code>findBy</Code> = waits.
          </>,
          <>
            Replace dependencies: <Code>vi.fn()</Code> for callbacks, <Code>vi.spyOn</Code> for <Code>fetch</Code>.
          </>,
          'Test behavior, not implementation - and write a test for every bug.',
        ]}
      />
    </>
  )
}
