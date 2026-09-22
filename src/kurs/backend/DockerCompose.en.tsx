import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { ComposeNetwork } from '../demos/BackendDiagrams'
import { beispiele, codeBloecke } from './DockerCompose.code'

/**
 * CHAPTER 8.10 - Docker Compose: the whole app (English version)
 */
export function DockerCompose() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          The whole todo app - PostgreSQL, the Spring Boot backend and the React app - in one file.
          One <Code>docker compose up</Code>, and everything starts in the right order. Read the log:
          first the database becomes “healthy”, then the API connects, then nginx comes up.
        </P>
        <TryIt modus="compose" id="docker-compose-einstieg" {...beispiele['docker-compose-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Why Compose?">
        <P>
          With <Code>docker run</Code> you would have to type three long commands in the right order,
          create a network, create a volume - and do it again every time. A{' '}
          <Code>compose.yaml</Code> instead describes what should run, and Docker Compose takes care
          of it. It sits next to the project folders:
        </P>
        <CodeBlock code={codeBloecke.ordner} titel="todo/" sprache="konfig" />
        <Liste>
          <li>
            <Code>services</Code>: one entry per container. Either a ready-made <Code>image</Code> or{' '}
            <Code>build</Code> with the folder that contains the Dockerfile.
          </li>
          <li>
            <Code>environment</Code>: environment variables - for Spring exactly the ones from{' '}
            <Verweis nr="8.6" />: <Code>SPRING_DATASOURCE_URL</Code> overrides{' '}
            <Code>spring.datasource.url</Code>.
          </li>
          <li>
            <Code>ports</Code>, <Code>volumes</Code>: like <Code>-p</Code> and <Code>-v</Code> with{' '}
            <Code>docker run</Code>. Named volumes are declared at the very bottom.
          </li>
          <li>
            <Code>depends_on</Code>: the start order.
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.befehle} titel="Terminal" />
      </Abschnitt>

      <Abschnitt titel="One network, service names as addresses">
        <P>
          Compose creates a network of its own for the project. Inside it, containers reach each
          other by their <strong>service names</strong>: the API talks to the database at{' '}
          <Code>db:5432</Code>. From outside, from your machine, you only get to the ports published
          with <Code>ports</Code>.
        </P>
        <ComposeNetwork />
        <CodeBlock code={codeBloecke.netz} titel="Who reaches whom?" sprache="konfig" />
        <P>
          The most common mistake of all: <Code>localhost</Code> in the database address. On your
          machine it worked - in the container, <Code>localhost</Code> points to the API container
          itself, and no database runs there:
        </P>
        <TryIt modus="compose" id="docker-compose-localhost" {...beispiele['docker-compose-localhost']} />
      </Abschnitt>

      <Abschnitt titel="depends_on is not enough: healthchecks">
        <P>
          <Code>depends_on: [db]</Code> only waits until the database container has{' '}
          <em>started</em>. PostgreSQL then needs a few more seconds before it accepts connections -
          if the API starts in that time, it stops with “Connection refused”.
        </P>
        <P>
          The fix is a <Code>healthcheck</Code>: a command Docker runs regularly to check whether the
          service is ready (<Code>pg_isready</Code>). With <Code>condition: service_healthy</Code>{' '}
          the API waits for exactly that. Try it in the first example: replace the API’s{' '}
          <Code>depends_on</Code> block with <Code>depends_on: [db]</Code> - and then add{' '}
          <Code>restart: on-failure</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Passwords do not belong in the file">
        <P>
          The <Code>compose.yaml</Code> goes into Git - passwords must not. That is why Compose
          automatically reads a file <Code>.env</Code> next to it and inserts values with{' '}
          <Code>{'${NAME}'}</Code>:
        </P>
        <CodeBlock code={codeBloecke.env} titel=".env" />
        <CodeBlock code={codeBloecke.envNutzen} titel="compose.yaml" />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="compose"
          id="docker-compose-uebung"
          {...beispiele['docker-compose-uebung']}
          aufgabe={
            <>
              <p>
                This <Code>compose.yaml</Code> has four mistakes. Fix them one after the other - the
                messages of <Code>docker compose up</Code> lead the way:
              </p>
              <Liste>
                <li>All three containers are running.</li>
                <li>
                  The API answers on <Code>http://localhost:8080</Code>, the React app on{' '}
                  <Code>http://localhost:3000</Code>.
                </li>
                <li>The API waits until the database is “healthy”.</li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Abschnitt titel="And then?">
        <P>
          For a server you build the images once, give them a version and put them into a{' '}
          <strong>registry</strong>. On the server there is the same <Code>compose.yaml</Code> - just
          with <Code>image:</Code> instead of <Code>build:</Code>. Usually a CI pipeline (GitHub
          Actions, GitLab CI) does that on every push.
        </P>
        <CodeBlock code={codeBloecke.weiter} titel="Terminal" />
        <Hinweis variante="info">
          When it becomes more than one server, <strong>Kubernetes</strong> usually comes into play:
          it starts containers on many machines, replaces crashed ones automatically and spreads the
          load. The building blocks are the same ones you learned here - images, containers, ports,
          environment variables, volumes, healthchecks.
        </Hinweis>
        <P>
          And with that the path is complete: from <Code>const</Code> and <Code>let</Code> in{' '}
          <Verweis nr="1.1" /> via React and Java to an application with a database, an API and a
          frontend that runs anywhere with one command. 🎉
        </P>
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'At which address does the api container reach the database of the service “db”?',
            antworten: ['localhost:5432', 'db:5432', '127.0.0.1:5432', 'host.docker.internal:5432'],
            richtig: 1,
            erklaerung: 'In the compose network the service name is the address. localhost would be the api container itself.',
          },
          {
            frage: 'What does depends_on: [db] without a condition do?',
            antworten: [
              'The API only starts once the database accepts connections',
              'The API only starts after the db container has started - it does not have to be ready',
              'Nothing',
              'The database starts after the API',
            ],
            richtig: 1,
            erklaerung: 'Only the start order. Waiting for “ready” needs condition: service_healthy with a healthcheck.',
          },
          {
            frage: 'What does docker compose down -v do in addition to docker compose down?',
            antworten: ['It shows more output', 'It also deletes the volumes - the data is gone', 'It rebuilds the images', 'It pulls new versions'],
            richtig: 1,
            erklaerung: '-v stands for volumes: on the next up the database is empty.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            A <Code>compose.yaml</Code> describes all containers of an application;{' '}
            <Code>docker compose up -d</Code> starts them, <Code>down</Code> cleans up.
          </>,
          'In the compose network service names are the addresses (db:5432) - localhost is always the container itself.',
          <>
            Configuration via <Code>environment</Code> - Spring reads <Code>SPRING_DATASOURCE_URL</Code>{' '}
            & co. automatically.
          </>,
          <>
            <Code>depends_on</Code> + <Code>healthcheck</Code> + <Code>condition: service_healthy</Code>{' '}
            for a reliable start order.
          </>,
          <>
            Data in named volumes, passwords in <Code>.env</Code> - not in Git.
          </>,
        ]}
      />
    </>
  )
}
