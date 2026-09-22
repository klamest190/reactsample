import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { ContainersVsVms, PortMapping } from '../demos/BackendDiagrams'
import { DockerTerminal } from '../demos/DockerTerminal'
import { codeBloecke, terminalTasks, uebungTasks } from './DockerStart.code'

/**
 * CHAPTER 8.8 - Containers & images (English version)
 */
export function DockerStart() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          A terminal with the <Code>docker</Code> command - simulated, but with real commands and real
          messages. Work through the tasks below the terminal; “insert” writes the command into the
          line if you get stuck.
        </P>
        <DockerTerminal tasks={terminalTasks} />
      </Abschnitt>

      <Abschnitt titel="“But it works on my machine”">
        <P>
          The backend from the last chapters needs Java 21, a PostgreSQL database in the right
          version, certain environment variables … On your machine all of that is set up. On a
          colleague’s machine, on the test server and in production it has to be set up exactly the
          same - and something is always different somewhere.
        </P>
        <P>
          <strong>Docker</strong> packs a program <em>together with everything it needs</em> into an{' '}
          <strong>image</strong>: operating system files, Java, the JAR, settings. From one image you
          start any number of <strong>containers</strong> - the same everywhere, whether on Windows,
          Mac or a Linux server.
        </P>
        <ContainersVsVms />
        <P>
          Unlike a virtual machine, a container does not bring its own operating system: all
          containers share the machine’s kernel and are only isolated from each other. That is why
          they start in fractions of a second and need hardly any memory.
        </P>
        <Hinweis variante="info">
          On Windows and macOS, Docker Desktop runs a small Linux VM in the background for this - you
          do not notice it.
        </Hinweis>
        <CodeBlock code={codeBloecke.installieren} titel="Terminal" />
      </Abschnitt>

      <Abschnitt titel="Image and container">
        <P>
          You already know the difference from Java (<Verweis nr="7.6" />): an image is like a{' '}
          <strong>class</strong> - an immutable blueprint. A container is like an{' '}
          <strong>object</strong> - a running instance of it, with its own state. From one{' '}
          <Code>nginx</Code> image you can start three containers that know nothing about each other.
        </P>
        <Liste>
          <li>
            Images come from a <strong>registry</strong>, usually Docker Hub. <Code>docker run</Code>{' '}
            downloads them automatically the first time (“Unable to find image … locally”).
          </li>
          <li>
            The <strong>tag</strong> after the colon is the version. Without a tag you get{' '}
            <Code>latest</Code> - whatever happens to be newest today.
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.tags} titel="image names" sprache="konfig" />
      </Abschnitt>

      <Abschnitt titel="docker run, taken apart">
        <CodeBlock code={codeBloecke.run} titel="Terminal" />
        <P>
          <strong>Ports</strong> are the most common pitfall. A container has its own network: nginx
          listens on port 80 - but inside the container, not on your machine. Only{' '}
          <Code>-p 8080:80</Code> connects port 8080 of your machine with port 80 in the container.
          Your machine is always on the left, the container on the right.
        </P>
        <PortMapping />
        <Hinweis variante="warnung">
          Without <Code>-d</Code> a container runs in the foreground and blocks the terminal until you
          press Ctrl+C - which also stops it. For servers you almost always want{' '}
          <Code>docker run -d</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The commands for every day">
        <CodeBlock code={codeBloecke.befehle} titel="Terminal" />
        <P>
          If a container dies right after starting, the reason is almost always in{' '}
          <Code>docker logs</Code>. The PostgreSQL task shows the typical example: without{' '}
          <Code>POSTGRES_PASSWORD</Code> the database refuses to start - and says so.
        </P>
      </Abschnitt>

      <Abschnitt titel="Data that stays: volumes">
        <P>
          Everything a container writes disappears with it. For a database that would be fatal. A{' '}
          <strong>volume</strong> is a storage area that Docker manages outside the container and
          mounts into it:
        </P>
        <CodeBlock code={codeBloecke.volume} titel="Terminal" />
        <P>
          This makes containers <strong>disposable</strong>: you delete them without worry and start
          new ones - the state lives in the volume or the database, never in the container itself.
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <P>
          Back to the terminal, this time with a volume: start a database, watch it come up and throw
          the container away without losing the data.
        </P>
        <DockerTerminal tasks={uebungTasks} />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What is the difference between an image and a container?',
            antworten: [
              'There is none, they are two names for the same thing',
              'The image is the immutable blueprint, the container a running instance of it',
              'Containers are bigger than images',
              'An image runs, a container is stopped',
            ],
            richtig: 1,
            erklaerung: 'Like class and object: any number of containers can be started from one image.',
          },
          {
            frage: 'docker run -p 3000:80 nginx - at which address do you reach nginx in the browser?',
            antworten: ['http://localhost:80', 'http://localhost:3000', 'http://nginx:80', 'not at all'],
            richtig: 1,
            erklaerung: 'The port of your machine (3000) is on the left, the one in the container (80) on the right.',
          },
          {
            frage: 'A container stops right after starting. Where do you look first?',
            antworten: ['docker images', 'docker logs NAME', 'docker pull', 'In the Docker Desktop settings'],
            richtig: 1,
            erklaerung: 'docker logs shows what the container printed - the reason is usually there.',
          },
        ]}
      />

      <Merke
        punkte={[
          'An image contains a program with everything it needs - a container is a running instance of it.',
          'Containers share the machine’s kernel: lighter and faster than virtual machines.',
          <>
            <Code>docker run -d --name x -p HOST:CONTAINER -e KEY=VALUE image:tag</Code> - then{' '}
            <Code>ps</Code>, <Code>logs</Code>, <Code>exec</Code>, <Code>stop</Code>, <Code>rm</Code>.
          </>,
          'Always give versions with a tag - latest changes without warning.',
          'Data that should stay belongs in a volume.',
        ]}
      />
    </>
  )
}
