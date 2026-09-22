import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { RequestFlow } from '../demos/BackendDiagrams'
import { beispiele, codeBloecke } from './SpringStart.code'

/**
 * CHAPTER 8.1 - Hello Spring Boot (English version)
 */
export function SpringStart() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          So far everything ran in the browser. Now for the other side: a <strong>backend</strong> -
          a program on a server that answers requests. This is a complete Spring Boot backend. After
          the start, the editor automatically sends a request to <Code>/hello</Code>; the answer is
          shown below.
        </P>
        <TryIt modus="spring" id="spring-start-einstieg" {...beispiele['spring-start-einstieg']} />
        <Hinweis variante="info">
          The form below the answer lets you send requests yourself - try <Code>/helo</Code> (a
          typo) or the method <Code>POST</Code> and see what the server says.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Why a backend?">
        <P>
          The todo app from <Verweis id="projekt-7-speichern">the project</Verweis> saves to{' '}
          <Code>localStorage</Code> - that is, only in <em>this</em> browser. Open it on your phone
          and the list is empty. As soon as data should be shared, stored permanently or protected,
          you need a server that all clients trust:
        </P>
        <RequestFlow />
        <Liste>
          <li>
            The <strong>browser</strong> (the React app) sends an HTTP request - you already know
            that as <Code>fetch</Code> from <Verweis nr="5.2" />.
          </li>
          <li>
            The <strong>backend</strong> checks, computes, asks the database and answers with JSON.
          </li>
          <li>
            The <strong>database</strong> keeps the data, even when the server restarts.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="HTTP in five minutes">
        <P>
          Every request consists of a <strong>method</strong>, a <strong>path</strong>, optional{' '}
          <strong>headers</strong> and sometimes a <strong>body</strong>. The response has a{' '}
          <strong>status code</strong>, headers and a body - almost always JSON for us.
        </P>
        <div className="grid gap-3 lg:grid-cols-2">
          <CodeBlock code={codeBloecke.anfrage} titel="Request · request.http" />
          <CodeBlock code={codeBloecke.antwort} titel="Response" sprache="konfig" />
          <CodeBlock code={codeBloecke.anlegen} titel="Creating · request.http" />
          <CodeBlock code={codeBloecke.angelegt} titel="Response" sprache="konfig" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[
                ['GET', 'read - changes nothing, may be repeated any number of times'],
                ['POST', 'create something new'],
                ['PUT', 'replace something completely'],
                ['PATCH', 'change something partially'],
                ['DELETE', 'delete something'],
              ].map(([method, meaning]) => (
                <tr key={method}>
                  <td className="py-2 pr-4 font-mono text-xs font-bold">{method}</td>
                  <td className="py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[
                ['2xx', '200 OK, 201 Created, 204 No Content - it worked'],
                ['4xx', '400 Bad Request, 404 Not Found, 405 Method Not Allowed - the client did something wrong'],
                ['5xx', '500 Internal Server Error - the server has a bug (usually an exception)'],
              ].map(([status, meaning]) => (
                <tr key={status}>
                  <td className="py-2 pr-4 font-mono text-xs font-bold">{status}</td>
                  <td className="py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Hinweis variante="tipp">
          The notation above is the <Code>.http</Code> format that IntelliJ IDEA and VS Code (with the
          “REST Client” extension) can run directly. This is exactly how we write requests and tests
          in this part - just with an extra line <Code>→ 200 …</Code> for the expected answer.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="What is Spring Boot?">
        <P>
          <strong>Spring</strong> has been the most widely used framework for Java backends since
          2003. <strong>Spring Boot</strong> is the layer on top that takes care of the setup: a web
          server (Tomcat) is built in, defaults are sensible, and convention replaces pages of
          configuration. You write classes with annotations - Spring finds them at startup and wires
          everything together.
        </P>
        <P>
          You create a new project at <strong>start.spring.io</strong> (or directly in IntelliJ):
          project <em>Maven</em>, language <em>Java</em>, Java version 21, dependency{' '}
          <em>Spring Web</em>. You get a folder with this structure:
        </P>
        <CodeBlock code={codeBloecke.struktur} titel="todo-api/" sprache="konfig" />
        <P>
          The <Code>pom.xml</Code> is to Maven what <Code>package.json</Code> is to npm: it lists the
          dependencies. A “starter” bundles everything that belongs together -{' '}
          <Code>spring-boot-starter-web</Code> brings Tomcat, Spring MVC and the JSON library
          Jackson.
        </P>
        <CodeBlock code={codeBloecke.pom} titel="pom.xml (excerpt)" />
        <CodeBlock code={codeBloecke.starten} titel="Terminal" />
      </Abschnitt>

      <Abschnitt titel="The first program piece by piece">
        <Liste>
          <li>
            <Code>@SpringBootApplication</Code> marks the main class. It switches on{' '}
            <strong>component scanning</strong>: at startup Spring looks for all classes with
            annotations like <Code>@RestController</Code>.
          </li>
          <li>
            <Code>SpringApplication.run(…)</Code> in <Code>main</Code> starts everything: Spring
            creates the objects, the embedded Tomcat opens port 8080.
          </li>
          <li>
            <Code>@RestController</Code> turns the class into a controller whose return values are
            the response.
          </li>
          <li>
            <Code>@GetMapping("/hello")</Code> connects a method with <Code>GET /hello</Code>. You
            never call the method yourself - Spring does, for every matching request.
          </li>
        </Liste>
        <P>
          This is the basic principle of Spring that you will meet all the time in this part:{' '}
          <strong>you describe with annotations what a class is - and Spring calls it.</strong> From
          now on we leave out the <Code>import</Code> lines; in a real project the IDE adds them.
        </P>
        <CodeBlock code={codeBloecke.reactVergleich} titel="Compared with React Router" />
      </Abschnitt>

      <Abschnitt titel="Parameters: from the path and from the query">
        <P>
          Values get into the method in two ways: <Code>@RequestParam</Code> reads{' '}
          <Code>?name=Ada</Code> after the question mark, <Code>@PathVariable</Code> reads a
          placeholder <Code>{'{n}'}</Code> in the path. Spring converts them to the parameter’s type
          right away - and answers <strong>400 Bad Request</strong> if that is not possible. The
          fourth request shows it.
        </P>
        <TryIt modus="spring" id="spring-start-parameter" {...beispiele['spring-start-parameter']} />
      </Abschnitt>

      <Abschnitt titel="Java objects become JSON">
        <P>
          If a method returns an object or a list, Spring turns it into JSON automatically. Records (
          <Verweis nr="7.7" />) are perfect for this: their components become the fields of the JSON.
        </P>
        <TryIt modus="spring" id="spring-start-json" {...beispiele['spring-start-json']} />
        <Hinweis variante="info">
          <strong>How does this run in the browser?</strong> The Java runtime from part 7 runs your
          code, a small replica of Spring (<Code>src/spring/</Code>) reads the annotations, creates
          the objects and routes requests to the right method. There is no network and no real
          Tomcat - but the same rules, the same status codes and the same error messages as in a
          real Spring Boot project.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="spring"
          id="spring-start-uebung"
          {...beispiele['spring-start-uebung']}
          aufgabe={
            <>
              <p>Write a controller with two endpoints:</p>
              <Liste>
                <li>
                  <Code>GET /greet?name=Ada</Code> answers with the text <Code>Hello, Ada!</Code> -
                  without <Code>name</Code> with <Code>Hello, World!</Code>
                </li>
                <li>
                  <Code>GET /api/status</Code> answers with the JSON{' '}
                  <Code>{'{"app": "todo-api", "up": true}'}</Code>
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Which HTTP method fits “create a new entry”?',
            antworten: ['GET', 'POST', 'DELETE', 'HEAD'],
            richtig: 1,
            erklaerung: 'POST creates something new. GET only reads, PUT/PATCH change, DELETE deletes.',
          },
          {
            frage: 'Who calls a method with @GetMapping("/hello")?',
            antworten: ['The main method', 'Spring, for every request to GET /hello', 'The browser directly', 'Nobody - it is just documentation'],
            richtig: 1,
            erklaerung: 'Spring finds the method at startup through the annotation and calls it for every matching request.',
          },
          {
            frage: 'GET /square/seven, the method expects @PathVariable int n. What does Spring answer?',
            antworten: ['200 with 0', '404 Not Found', '400 Bad Request', '500 Internal Server Error'],
            richtig: 2,
            erklaerung: '“seven” cannot be converted to int - that is a mistake in the request, so 400.',
          },
        ]}
      />

      <Merke
        punkte={[
          'A backend answers HTTP requests: method + path in, status code + body (usually JSON) out.',
          <>
            <Code>@SpringBootApplication</Code> + <Code>SpringApplication.run</Code> start Spring and
            the embedded Tomcat on port 8080.
          </>,
          <>
            <Code>@RestController</Code> + <Code>@GetMapping("/path")</Code> connect a method with a
            URL - Spring calls it.
          </>,
          <>
            <Code>@RequestParam</Code> reads <Code>?x=…</Code>, <Code>@PathVariable</Code> reads{' '}
            <Code>{'/{x}'}</Code> - including type conversion (otherwise 400).
          </>,
          'Objects and records become JSON automatically.',
        ]}
      />
    </>
  )
}
