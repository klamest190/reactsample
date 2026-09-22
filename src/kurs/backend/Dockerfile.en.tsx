import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { DockerTerminal } from '../demos/DockerTerminal'
import { beispiele, codeBloecke, terminalDockerfile, terminalIgnore, terminalTasks } from './Dockerfile.code'

/**
 * CHAPTER 8.9 - Your own image: the Dockerfile (English version)
 */
export function Dockerfile() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          A <strong>Dockerfile</strong> describes step by step how the project becomes an image. This
          is the obvious first attempt for the Spring Boot backend - and it works. But look at the
          hints, the size and the second build: after a small code change it takes almost as long as
          the first one.
        </P>
        <TryIt modus="dockerfile" id="docker-dockerfile-einstieg" {...beispiele['docker-dockerfile-einstieg']} />
        <Hinweis variante="info">
          Building happens in a simulation here: the project <Code>todo-api</Code> is a list of files
          (with <Code>pom.xml</Code>, <Code>src/</Code>, <Code>.git/</Code>, <Code>target/</Code> …),
          and known commands like <Code>mvn</Code>, <Code>npm</Code> or <Code>useradd</Code> change the
          file system the way they really do. Times and sizes are realistic estimates.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The most important instructions">
        <CodeBlock code={codeBloecke.befehle} titel="Dockerfile" />
        <CodeBlock code={codeBloecke.bauen} titel="Terminal" />
        <Hinweis variante="warnung">
          <Code>RUN</Code> runs while <strong>building</strong>, <Code>CMD</Code>/
          <Code>ENTRYPOINT</Code> when the container <strong>starts</strong>. Start the server with RUN
          and you get a build that never finishes.
        </Hinweis>
        <CodeBlock code={codeBloecke.run} titel="Dockerfile" />
      </Abschnitt>

      <Abschnitt titel="Layers and the build cache">
        <P>
          Every instruction produces a <strong>layer</strong>. Docker remembers every layer and only
          rebuilds it if its instruction changed - for <Code>COPY</Code> also if the copied files
          changed. And: <strong>from the first rebuilt layer on, all following layers are rebuilt.</strong>
        </P>
        <P>
          In the first example, <Code>COPY . .</Code> copies everything at once. Every code change
          invalidates this layer - and with it the download of all dependencies afterwards. The fix
          is the order: <strong>what changes rarely comes first.</strong>
        </P>
        <TryIt modus="dockerfile" id="docker-dockerfile-cache" {...beispiele['docker-dockerfile-cache']} />
        <P>
          Below the editor, choose what changes before the second build: with “source code”,{' '}
          <Code>COPY pom.xml</Code> and the download stay in the cache (<Code>CACHED</Code>), with
          “dependencies” they do not. Exactly the same pattern applies to Node: copy{' '}
          <Code>package.json</Code> + <Code>package-lock.json</Code>, <Code>npm ci</Code>, and only then
          the code.
        </P>
      </Abschnitt>

      <Abschnitt titel=".dockerignore: what is not sent">
        <P>
          <Code>docker build .</Code> sends the whole folder to Docker - the{' '}
          <strong>build context</strong>. Without a <Code>.dockerignore</Code> that includes{' '}
          <Code>.git/</Code>, the IDE settings and old build results in <Code>target/</Code>. In a Node
          project it would even be the 180 MB of <Code>node_modules</Code>. The file works like a{' '}
          <Code>.gitignore</Code>; you find it above every editor and can change it - watch the line
          “build context”.
        </P>
      </Abschnitt>

      <Abschnitt titel="Multi-stage builds: separate building and shipping">
        <P>
          Building needs Maven and the JDK (540 MB). Running only needs the JRE (280 MB) and a single
          file: the JAR. A <strong>multi-stage build</strong> uses two <Code>FROM</Code> for this: the
          first stage (<Code>AS build</Code>) builds, the second takes only the result with{' '}
          <Code>COPY --from=build</Code>. Only the last stage ends up in the final image - Maven, the
          source code and the download cache stay out.
        </P>
        <TryIt modus="dockerfile" id="docker-dockerfile-multistage" {...beispiele['docker-dockerfile-multistage']} />
        <Liste>
          <li>
            <Code>useradd</Code> + <Code>USER spring</Code>: the server does not run as{' '}
            <Code>root</Code>. If someone breaks into the application, they do not get all rights in
            the container right away.
          </li>
          <li>
            <Code>ENTRYPOINT</Code> in JSON form: Java receives signals like <Code>docker stop</Code>{' '}
            directly and can shut down cleanly.
          </li>
          <li>
            <Code>EXPOSE 8080</Code> documents the port - it is only published with <Code>-p</Code> (
            <Verweis nr="8.8" />).
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.layers} titel="after a code change" />
      </Abschnitt>

      <Abschnitt titel="The frontend: Node builds, nginx serves">
        <P>
          The same principle applies to the React app. <Code>npm run build</Code> produces only HTML,
          CSS and JavaScript in <Code>dist/</Code> - no Node is needed at runtime, a web server is
          enough. The final image is about 50 MB. The <Code>nginx.conf</Code> is the one from{' '}
          <Verweis nr="8.7" />: it forwards <Code>/api/</Code> to the backend.
        </P>
        <TryIt modus="dockerfile" id="docker-dockerfile-react" {...beispiele['docker-dockerfile-react']} />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="dockerfile"
          id="docker-dockerfile-uebung"
          {...beispiele['docker-dockerfile-uebung']}
          aufgabe={
            <>
              <p>Turn the naive Dockerfile into a good one:</p>
              <Liste>
                <li>The final image is based on a JRE and smaller than 350 MB.</li>
                <li>After a change to the source code, the dependency download comes from the cache.</li>
                <li>The container does not run as root - and of course still starts.</li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Abschnitt titel="Build and run">
        <P>
          Finally the same Dockerfile in the terminal: build, start, ask. The terminal uses the
          multi-stage Dockerfile from above.
        </P>
        <DockerTerminal tasks={terminalTasks} dockerfile={terminalDockerfile} project="spring" ignore={terminalIgnore} />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'You change a Java file in src/. Which layers does Docker rebuild for COPY pom.xml → RUN go-offline → COPY src → RUN package?',
            antworten: ['All of them', 'Only COPY src and RUN package', 'Only RUN package', 'None'],
            richtig: 1,
            erklaerung: 'COPY src changes - from there on everything is rebuilt. The layers before come from the cache.',
          },
          {
            frage: 'What ends up in the final image of a multi-stage build?',
            antworten: ['All stages', 'Only the last stage', 'Only the first stage', 'Only the files from COPY'],
            richtig: 1,
            erklaerung: 'Earlier stages are just workbenches - what counts is what the last stage takes with COPY --from.',
          },
          {
            frage: 'What is the .dockerignore for?',
            antworten: [
              'It prevents containers from starting',
              'It keeps files out of the build context, e.g. node_modules and .git',
              'It lists images that should not be pulled',
              'It replaces the Dockerfile',
            ],
            richtig: 1,
            erklaerung: 'What is listed there is not sent to Docker - faster builds, smaller images, no secrets by accident.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>FROM</Code>, <Code>WORKDIR</Code>, <Code>COPY</Code>, <Code>RUN</Code> build the image;{' '}
            <Code>ENTRYPOINT</Code>/<Code>CMD</Code> only apply at startup.
          </>,
          'Every instruction is a layer. From the first change on everything is rebuilt - rare things at the top, code at the bottom.',
          <>
            <Code>.dockerignore</Code> keeps <Code>node_modules</Code>, <Code>target</Code> and{' '}
            <Code>.git</Code> out of the build.
          </>,
          <>
            Multi-stage: build with JDK/Node, ship with JRE/nginx - via <Code>COPY --from=build</Code>.
          </>,
          <>
            Your own user with <Code>USER</Code>, <Code>ENTRYPOINT</Code> in JSON form, versions
            instead of <Code>latest</Code>.
          </>,
        ]}
      />
    </>
  )
}
