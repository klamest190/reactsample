import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { CorsPicture } from '../demos/BackendDiagrams'
import { FullStack } from '../demos/FullStack'
import { backend, beispiele, codeBloecke, frontend } from './SpringReact.code'

/**
 * CHAPTER 8.7 - React meets Spring Boot (English version)
 */
export function SpringReact() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          On the left runs a Spring Boot backend, on the right the todo app from the project - both
          in this browser tab. Every <Code>fetch('/api/…')</Code> of the React app ends up in the
          backend; the network log shows every request like the DevTools do. Create a todo, tick it
          off, delete it - and read the server log while you do.
        </P>
        <FullStack id="spring-react-werkstatt" backend={backend} frontend={frontend} />
        <Hinweis variante="tipp">
          Try an empty todo in the frontend: the backend answers with 400 (<Code>@NotBlank</Code>,{' '}
          <Verweis nr="8.4" />), and the app shows a message. Or change <Code>"/api/todos"</Code> to{' '}
          <Code>"/api/tasks"</Code> in the backend - and watch what happens in the network log.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Two programs, one application">
        <P>
          During development two servers run: Vite serves the React app (port 5173), Spring Boot the
          API (port 8080). They only talk to each other via HTTP - the frontend knows nothing about
          Java, the backend nothing about React.
        </P>
        <CodeBlock code={codeBloecke.entwicklung} titel="Terminal" sprache="konfig" />
        <P>In the frontend you need the familiar craft from <Verweis nr="5.2" />:</P>
        <CodeBlock code={codeBloecke.fetch} titel="api.js" />
        <Hinweis variante="warnung">
          <Code>fetch</Code> does <strong>not</strong> throw on 400 or 500 - only when the server
          cannot be reached at all. You have to check the status yourself with{' '}
          <Code>response.ok</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="CORS: why the browser blocks">
        <P>
          If the app on <Code>localhost:5173</Code> calls{' '}
          <Code>http://localhost:8080/api/todos</Code> directly, the browser reports a{' '}
          <strong>CORS error</strong> - even though the server works. The reason is the{' '}
          <strong>same-origin policy</strong>: a page may only talk to its own origin (protocol + host
          + port), unless the other server explicitly allows it.
        </P>
        <CorsPicture />
        <CodeBlock code={codeBloecke.cors} titel="preflight.http" />
        <P>Two solutions - the first one is the most convenient during development:</P>
        <Liste>
          <li>
            <strong>Vite proxy</strong>: the app asks its own server for <Code>/api/…</Code>, and
            Vite forwards the request to Spring. For the browser it is the same origin - no CORS
            needed. The workshop above behaves the same way.
          </li>
          <li>
            <strong>Allow CORS</strong> in the backend, with <Code>@CrossOrigin</Code> or centrally
            in a <Code>WebMvcConfigurer</Code> bean.
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.proxy} titel="vite.config.ts" />
        <CodeBlock code={codeBloecke.crossOrigin} titel="TodoController.java / WebConfig.java" />
        <Hinweis variante="info">
          CORS protects the <em>users</em>, not the server: it prevents a foreign website from calling
          your API in the user’s name. <Code>curl</Code> or Postman do not care about it - protection
          against unauthorized access needs authentication.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="And in production?">
        <P>
          There is no Vite server any more. <Code>npm run build</Code> produces static files that a
          web server like <strong>nginx</strong> serves - and nginx takes over the role of the proxy:{' '}
          <Code>/api/</Code> goes to the backend, everything else is the React app. Again one origin,
          again no CORS.
        </P>
        <CodeBlock code={codeBloecke.nginx} titel="nginx.conf" sprache="konfig" />
        <P>
          How nginx, backend and database are started together is shown in the Docker chapters - in
          the end exactly this app runs with a single command (<Verweis nr="8.10" />).
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="spring"
          id="spring-react-uebung"
          {...beispiele['spring-react-uebung']}
          aufgabe={
            <>
              <p>
                The React app ticks off todos with <Code>{'PATCH /api/todos/{id}'}</Code> and the body{' '}
                <Code>{'{"done": true}'}</Code>. The backend is missing the endpoint:
              </p>
              <Liste>
                <li>
                  It sets <Code>done</Code> and answers with the changed todo (200).
                </li>
                <li>
                  If the id does not exist, it answers with <strong>404</strong>.
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'The app on localhost:5173 calls fetch("http://localhost:8080/api/todos"). What happens without further settings?',
            antworten: ['It works', 'The browser blocks the answer (CORS)', 'Spring answers with 404', 'fetch rewrites the URL automatically'],
            richtig: 1,
            erklaerung: 'A different port is a different origin. Without Access-Control-Allow-Origin the browser does not hand out the answer.',
          },
          {
            frage: 'The server answers with 400. What does fetch do?',
            antworten: ['It throws an exception', 'It returns a Response with ok = false', 'It tries again', 'It returns undefined'],
            richtig: 1,
            erklaerung: 'fetch only throws on network errors. You check the status yourself with response.ok or response.status.',
          },
          {
            frage: 'What is the Vite proxy good for?',
            antworten: ['It makes the app faster', 'It forwards /api to the backend - for the browser it stays one origin', 'It replaces Spring Boot', 'It caches answers'],
            richtig: 1,
            erklaerung: 'The browser only talks to localhost:5173; Vite forwards /api to localhost:8080 internally.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Frontend and backend are separate programs that only talk via HTTP and JSON.',
          <>
            <Code>fetch</Code> + <Code>response.ok</Code> + <Code>response.json()</Code> - 4xx/5xx are
            no exceptions.
          </>,
          'Different ports are different origins: without permission the browser blocks (CORS).',
          <>
            During development the Vite proxy solves it, in production nginx; alternatively{' '}
            <Code>@CrossOrigin</Code> or <Code>WebMvcConfigurer</Code>.
          </>,
        ]}
      />
    </>
  )
}
