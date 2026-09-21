import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './DatenLaden.code'
import { LadeDemo } from '../demos/LadeDemo'

/**
 * KAPITEL 5.2 (English) - Fetching Data
 */
export function DatenLaden() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>Fetching data means: call <Code>fetch</Code> in an effect and put the result into state.</P>
        <TryIt
          id="praxis-daten-einstieg"
          {...beispiele['praxis-daten-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="The basic pattern">
        <P>
          Loading data from a server combines everything from <Verweis nr="1.7" /> (async/await) and <Verweis nr="4.2" /> (useEffect).
          Every request has three possible states - and each needs its own display:
        </P>
        <Liste>
          <li>
            <strong>Loading</strong> - placeholder or spinner
          </li>
          <li>
            <strong>Error</strong> - an understandable message, ideally with “Try again”
          </li>
          <li>
            <strong>Data</strong> - including the special case “empty”
          </li>
        </Liste>
        <TryIt
          id="praxis-daten-grundmuster"
          {...beispiele['praxis-daten-grundmuster']}
          modus="react"
        />
        <Hinweis variante="info">
          This example needs internet (JSONPlaceholder is a free test API). Offline you will see the error
          branch.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Race conditions and aborting">
        <P>
          If the request depends on an input (e.g. an ID), an <strong>older, slower response</strong> can
          arrive after a newer one and overwrite it. The solution is in the cleanup: the old request is aborted
          or its result ignored.
        </P>
        <TryIt
          id="praxis-daten-race"
          {...beispiele['praxis-daten-race']}
          modus="react"
        />
        <CodeBlock
          titel="With a real fetch"
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="The demo from this project">
        <LadeDemo />
      </Abschnitt>

      <Abschnitt titel="In real projects">
        <P>
          The pattern above is important to understand - but in larger apps you rarely write it by hand. It is
          still missing: caching, avoiding duplicate requests, refetching when the window regains focus,
          retries, pagination …
        </P>
        <Liste>
          <li>
            <strong>TanStack Query</strong> or <strong>SWR</strong> for client apps:{' '}
            <Code>{"const { data, isLoading, error } = useQuery({ queryKey: ['user', id], queryFn })"}</Code>
          </li>
          <li>
            <strong>Frameworks</strong> like Next.js or React Router load data directly during routing or on the
            server.
          </li>
          <li>
            React 19: <Code>use(promise)</Code> with <Code>Suspense</Code> (<Verweis nr="4.9" />), when the promise comes
            from a cache.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="praxis-daten-uebung"
          {...beispiele['praxis-daten-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Write the custom hook <Code>useFetch(url)</Code> that returns{' '}
                <Code>{'{ data, loading, error, reload }'}</Code>:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>Loads again when the URL changes, and aborts the old request.</li>
                <li>
                  Checks <Code>response.ok</Code> and otherwise throws <Code>{"new Error('HTTP ' + response.status)"}</Code>.
                </li>
                <li>
                  <Code>reload()</Code> starts the request again (tip: a counter in state as a dependency).
                </li>
              </ul>
              <p className="mt-1">The app uses it to show posts of the selected user.</p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Why can’t the effect function itself be async?',
            antworten: [
              'async is forbidden in React',
              'It would return a promise instead of a cleanup function',
              'Because fetch is synchronous',
            ],
            richtig: 1,
            erklaerung: 'That’s why you define an async function inside the effect and call it.',
          },
          {
            frage: 'What prevents a stale response from overwriting newer data?',
            antworten: ['useMemo', 'Aborting/ignoring in the effect’s cleanup', 'A key on the list'],
            richtig: 1,
            erklaerung: 'The cleanup runs before the effect starts with the new ID.',
          },
          {
            frage: 'Which three states should every request cover in the UI?',
            antworten: ['Loading, error, data', 'Start, middle, end', 'Online, offline, cache'],
            richtig: 0,
            erklaerung: 'Plus the special case “data, but empty”.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Loading, error, data (and empty) - every state needs its own display.',
          'An async function inside the effect; check response.ok yourself.',
          <>
            <Code>AbortController</Code> in the cleanup prevents race conditions.
          </>,
          <>
            Aborts (<Code>AbortError</Code>) are not errors for the UI.
          </>,
          'In larger apps: TanStack Query, SWR or the data loading of your framework.',
        ]}
      />
    </>
  )
}
