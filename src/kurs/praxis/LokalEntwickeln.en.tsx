import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { LokalCheckliste } from '../demos/LokalCheckliste'
import { beispiele, codeBloecke } from './LokalEntwickeln.code'

/**
 * KAPITEL 5.10 (English) - Developing locally: the bridge from the browser editor to your own project
 */
export function LokalEntwickeln() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          The editors here are built for learning: hooks are already imported, everything lives in one file, and
          tests tell you whether it works. Real projects look different - many files, imports, TypeScript, a build
          step. This chapter takes exactly that step, using the todo app from{' '}
          <Verweis id="projekt-11-laden">the project</Verweis>.
        </P>
        <Liste>
          <li>
            <strong>Node.js</strong> (LTS version) - comes with <Code>npm</Code>, which installs packages and runs
            scripts
          </li>
          <li>
            <strong>VS Code</strong> as your editor - with TypeScript support out of the box
          </li>
          <li>
            <strong>React DevTools</strong> as a browser extension for Chrome, Edge or Firefox
          </li>
        </Liste>
        <CodeBlock titel="Terminal" code={codeBloecke.pruefen} />
      </Abschnitt>

      <Abschnitt titel="Create a project with Vite">
        <P>
          <strong>Vite</strong> sets up a ready-to-go React project and starts a development server. Changes to files
          show up in the browser immediately, without losing state (hot module replacement).
        </P>
        <CodeBlock titel="Terminal" code={codeBloecke.anlegen} />
        <P>
          The app then runs at <Code>http://localhost:5173</Code>. The structure is easy to follow:
        </P>
        <CodeBlock code={codeBloecke.struktur} />
        <Hinweis variante="tipp">
          This learning app is built the same way: React, TypeScript, Vite and Tailwind. Look inside{' '}
          <Code>reactsample/src</Code> to see how a larger project is organized.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="What is different in a real project">
        <Liste>
          <li>
            <strong>Imports:</strong> hooks are not available automatically -{' '}
            <Code>{"import { useState } from 'react'"}</Code> (<Verweis id="js-dom" />).
          </li>
          <li>
            <strong>Exports:</strong> <Code>App</Code> is provided to <Code>main.tsx</Code> with{' '}
            <Code>export default</Code>.
          </li>
          <li>
            <strong>One component per file</strong>, usually under <Code>src/components/</Code>.
          </li>
          <li>
            <strong>TypeScript:</strong> props and state get types. VS Code shows errors while you type (<Verweis id="praxis-typescript" />).
          </li>
          <li>
            <strong>StrictMode:</strong> in development, effects intentionally run twice so missing cleanups stand
            out (<Verweis id="hooks-useeffect" />).
          </li>
        </Liste>
        <CodeBlock titel="src/App.tsx" code={codeBloecke.importe} />
        <CodeBlock code={codeBloecke.aufteilen} />
      </Abschnitt>

      <Abschnitt titel="Finding bugs: console, debugger, React DevTools">
        <P>When something is wrong, don’t guess - look. Three tools cover almost everything:</P>
        <Liste>
          <li>
            <Code>console.log(value)</Code> - the quickest look at a value. Tip:{' '}
            <Code>{'console.log({ todos, filter })'}</Code> shows the names too.
          </li>
          <li>
            <strong>Breakpoints</strong> - click a line number in the browser’s <em>Sources</em> panel or write{' '}
            <Code>debugger</Code> in your code. Execution pauses and you can see every variable.
          </li>
          <li>
            <strong>React DevTools</strong> - the <em>Components</em> tab shows the component tree with props, state
            and hooks; the <em>Profiler</em> tab shows what renders how often (<Verweis id="hooks-usememo" />).
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.debugger} />
      </Abschnitt>

      <Abschnitt titel="Rebuild the todo app locally">
        <P>
          Take the solution from <Verweis id="projekt-11-laden" /> (or your own from the challenge) and move it into
          your project step by step: first everything in <Code>App.tsx</Code> with the necessary imports, then split
          the components into their own files, then add types. Replace <Code>API_URL</Code> with a real address or a
          JSON file in <Code>public/</Code>.
        </P>
        <LokalCheckliste />
        <P>To publish, build an optimized version:</P>
        <CodeBlock titel="Terminal" code={codeBloecke.bauen} />
        <P>
          The <Code>dist/</Code> folder then only contains static files. You can upload them to services such as
          Netlify, Vercel or GitHub Pages.
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <P>Debugging works the same everywhere - here in the browser editor just as in your own project later.</P>
        <TryIt
          id="praxis-lokal-debugging"
          titel="🐞 Bug hunt"
          {...beispiele['praxis-lokal-debugging']}
          aufgabe={
            <p>
              <Code>averageLength</Code> returns wrong values. Use <Code>console.log</Code> to find out why and fix the
              function - for an empty list too.
            </p>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Which command starts the development server of a Vite project?',
            antworten: [<Code key="a">npm run build</Code>, <Code key="b">npm run dev</Code>, <Code key="c">npm install</Code>],
            richtig: 1,
            erklaerung: 'npm run dev starts the server with hot reload; build creates the final version in dist/.',
          },
          {
            frage: 'Your effect runs twice in development. Why?',
            antworten: ['A bug in Vite', 'StrictMode intentionally checks that the cleanup is correct', 'The dependencies are missing'],
            richtig: 1,
            erklaerung: 'StrictMode mounts components twice in development. This does not happen in the build.',
          },
          {
            frage: 'Where is the most convenient place to see the current state of a specific component?',
            antworten: ['In the network tab', 'In the React DevTools under Components', 'In package.json'],
            richtig: 1,
            erklaerung: 'The Components tab shows the props, state and hooks of every component - and you can even edit values.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>npm create vite@latest</Code> creates a project, <Code>npm run dev</Code> starts it,{' '}
            <Code>npm run build</Code> builds it.
          </>,
          <>In a real project you import hooks yourself and spread components across files.</>,
          <>
            You find bugs with <Code>console.log</Code>, breakpoints and the React DevTools - instead of guessing.
          </>,
          <>In development, StrictMode runs effects twice to reveal missing cleanups.</>,
        ]}
      />
    </>
  )
}
