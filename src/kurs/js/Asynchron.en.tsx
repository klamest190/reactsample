import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Asynchron.code'

// Simulated API so the examples work offline and without CORS problems.
/**
 * KAPITEL 1.7 (English) - Asynchronous JavaScript
 */
export function Asynchron() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>A timer runs later - the rest of the code does not wait for it.</P>
        <TryIt
          id="js-async-einstieg"
          {...beispiele['js-async-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Synchronous and asynchronous">
        <P>
          JavaScript runs code line by line - in <strong>a single thread</strong>. If it waited for a
          server response, the whole page would freeze. That is why slow things (timers, network) are
          handled <strong>asynchronously</strong>: you register what should happen <em>later</em>, and the
          rest continues immediately.
        </P>
        <TryIt
          id="js-async-1"
          {...beispiele['js-async-1']}
        />
      </Abschnitt>

      <Abschnitt titel="Promises">
        <P>
          A <strong>promise</strong> is an object for a result that does <em>not exist yet</em>. It starts
          out <Code>pending</Code> and later becomes either <Code>fulfilled</Code> (with a value) or{' '}
          <Code>rejected</Code> (with an error). You react to it with <Code>.then()</Code> and{' '}
          <Code>.catch()</Code>.
        </P>
        <TryIt
          id="js-async-2"
          {...beispiele['js-async-2']}
        />
      </Abschnitt>

      <Abschnitt titel="async / await">
        <P>
          <Code>async</Code>/<Code>await</Code> is the same as <Code>.then()</Code>, but reads like normal,
          synchronous code. <Code>await</Code> pauses the <Code>async</Code> function until the promise is
          fulfilled. You catch errors with <Code>try/catch</Code>.
        </P>
        <Hinweis variante="info">
          These examples already contain the helper functions <Code>wait(ms)</Code>,{' '}
          <Code>loadUser(id)</Code> and <Code>loadPosts(userId)</Code>. They simulate a server with a 300 ms
          delay.
        </Hinweis>
        <TryIt
          id="js-async-3"
          {...beispiele['js-async-3']}
        />
        <Hinweis variante="tipp">
          Top-level <Code>await</Code> works here in the editor and in ES modules. In normal functions the
          function itself has to be <Code>async</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The event loop">
        <P>
          Why does the 0 ms timer still come last? JavaScript has a <strong>call stack</strong> holding the code that is
          running right now. Only when it is empty does the <strong>event loop</strong> pick up new work: first all{' '}
          <strong>microtasks</strong> (<Code>.then</Code>, everything after an <Code>await</Code>), then the next{' '}
          <strong>task</strong> (timers, clicks, network responses). In between, the browser may repaint.
        </P>
        <CodeBlock code={codeBloecke.eventloop} />
        <TryIt id="js-async-eventloop" {...beispiele['js-async-eventloop']} />
        <Hinweis variante="info">
          That explains why a long loop freezes the whole page: while it runs, no task and no repaint get a turn. That is
          why React can split slow updates into small pieces and give the browser room in between (
          <Verweis id="hooks-nebenlaeufig" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="fetch - data from the server">
        <P>
          <Code>fetch</Code> is the built-in function for HTTP requests and returns a promise. There are two
          pitfalls you need to know:
        </P>
        <Liste>
          <li>
            <Code>fetch</Code> does <strong>not throw on 404 or 500</strong> - only on network problems.
            Check <Code>response.ok</Code> yourself.
          </li>
          <li>
            The body has to be read separately: <Code>await response.json()</Code>.
          </li>
        </Liste>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="js-async-4"
          {...beispiele['js-async-4']}
        />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="js-async-uebung"
          {...beispiele['js-async-uebung']}
          aufgabe={
            <>
              <p>
                Write the <Code>async</Code> function <Code>loadNames(ids)</Code>. It receives an array of IDs
                and returns an array of names. Use <Code>loadUser</Code> and load all of them{' '}
                <strong>in parallel</strong> with <Code>Promise.all</Code>.
              </p>
              <p className="mt-1">
                If a user doesn’t exist, <em>instead of an error</em> that position should contain{' '}
                <Code>'unknown'</Code>. (Tip: <Code>.catch()</Code> on each individual promise.)
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: "In what order does the output appear? console.log('A'); setTimeout(() => console.log('B'), 0); console.log('C')",
            antworten: ['A B C', 'A C B', 'B A C'],
            richtig: 1,
            erklaerung: 'The timer callback only runs once the current code is finished - even with 0 ms.',
          },
          {
            frage: 'fetch receives a 404 response. What happens?',
            antworten: [
              'The promise is rejected',
              'The promise is fulfilled, response.ok is false',
              'fetch returns null',
            ],
            richtig: 1,
            erklaerung: 'Only network errors lead to a rejection. You have to check HTTP errors via response.ok.',
          },
          {
            frage: 'Where can await be used?',
            antworten: ['Anywhere', 'In async functions (and at module level)', 'Only in .then()'],
            richtig: 1,
            erklaerung: 'await is only allowed in async functions - and at the top level of ES modules.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Asynchronous callbacks only run once the current code has completely finished.',
          'A promise is a future value: pending → fulfilled or rejected.',
          <>
            <Code>async/await</Code> + <Code>try/catch</Code> is the most readable form.
          </>,
          <>
            <Code>Promise.all</Code> loads in parallel.
          </>,
          <>
            <Code>fetch</Code>: check <Code>response.ok</Code> and <Code>await response.json()</Code>.
          </>,
        ]}
      />
    </>
  )
}
