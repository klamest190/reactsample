import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { DockerTerminal } from '../demos/DockerTerminal'
import { beispiele, codeBloecke, terminalDockerfile, terminalIgnore, terminalTasks } from './Dockerfile.code'

/**
 * CHAPTER 8.9 - Your own image: the Dockerfile
 * Instructions, layers and the build cache, .dockerignore, multi-stage builds for Spring and React.
 */
export function Dockerfile() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Ein <strong>Dockerfile</strong> beschreibt Schritt für Schritt, wie aus dem Projekt ein
          Image wird. Das hier ist der naheliegende erste Versuch für das Spring-Boot-Backend - er
          funktioniert. Aber schau dir die Hinweise, die Größe und den zweiten Build an: Nach einer
          kleinen Code-Änderung dauert er fast genauso lange wie der erste.
        </P>
        <TryIt modus="dockerfile" id="docker-dockerfile-einstieg" {...beispiele['docker-dockerfile-einstieg']} />
        <Hinweis variante="info">
          Gebaut wird hier in einer Simulation: Das Projekt <Code>todo-api</Code> ist eine
          Dateiliste (mit <Code>pom.xml</Code>, <Code>src/</Code>, <Code>.git/</Code>,{' '}
          <Code>target/</Code> …), und bekannte Befehle wie <Code>mvn</Code>, <Code>npm</Code> oder{' '}
          <Code>useradd</Code> verändern das Dateisystem so, wie sie es in echt tun. Zeiten und Größen
          sind realistische Schätzungen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die wichtigsten Anweisungen">
        <CodeBlock code={codeBloecke.befehle} titel="Dockerfile" />
        <CodeBlock code={codeBloecke.bauen} titel="Terminal" />
        <Hinweis variante="warnung">
          <Code>RUN</Code> läuft beim <strong>Bauen</strong>, <Code>CMD</Code>/<Code>ENTRYPOINT</Code>{' '}
          beim <strong>Starten</strong> des Containers. Wer den Server mit RUN startet, bekommt einen
          Build, der nie fertig wird.
        </Hinweis>
        <CodeBlock code={codeBloecke.run} titel="Dockerfile" />
      </Abschnitt>

      <Abschnitt titel="Schichten und der Build-Cache">
        <P>
          Jede Anweisung erzeugt eine <strong>Schicht</strong> (Layer). Docker merkt sich jede
          Schicht und baut sie nur neu, wenn sich ihre Anweisung geändert hat - bei{' '}
          <Code>COPY</Code> auch, wenn sich die kopierten Dateien geändert haben. Und:{' '}
          <strong>Ab der ersten neu gebauten Schicht werden alle folgenden neu gebaut.</strong>
        </P>
        <P>
          Im ersten Beispiel kopiert <Code>COPY . .</Code> alles auf einmal. Jede Code-Änderung macht
          diese Schicht ungültig - und damit auch das Herunterladen aller Abhängigkeiten danach. Die
          Lösung ist die Reihenfolge: <strong>Was sich selten ändert, kommt zuerst.</strong>
        </P>
        <TryIt modus="dockerfile" id="docker-dockerfile-cache" {...beispiele['docker-dockerfile-cache']} />
        <P>
          Stell unter dem Editor ein, was sich vor dem zweiten Build ändert: Bei „Quellcode“ bleiben{' '}
          <Code>COPY pom.xml</Code> und der Download im Cache (<Code>CACHED</Code>), bei
          „Abhängigkeiten“ nicht. Genau dasselbe Muster gilt für Node:{' '}
          <Code>package.json</Code> + <Code>package-lock.json</Code> kopieren, <Code>npm ci</Code>,
          erst dann der Code.
        </P>
      </Abschnitt>

      <Abschnitt titel=".dockerignore: was nicht mitgeschickt wird">
        <P>
          <Code>docker build .</Code> schickt den ganzen Ordner an Docker - den{' '}
          <strong>Build-Kontext</strong>. Ohne <Code>.dockerignore</Code> sind das auch{' '}
          <Code>.git/</Code>, die IDE-Einstellungen und alte Build-Ergebnisse in{' '}
          <Code>target/</Code>. Bei einem Node-Projekt wären es sogar die 180 MB{' '}
          <Code>node_modules</Code>. Die Datei funktioniert wie eine <Code>.gitignore</Code>; du
          findest sie über jedem Editor und kannst sie ändern - achte auf die Zeile „Build-Kontext“.
        </P>
      </Abschnitt>

      <Abschnitt titel="Multi-Stage-Builds: bauen und ausliefern trennen">
        <P>
          Zum Bauen braucht man Maven und das JDK (540 MB). Zum Laufen genügt die JRE (280 MB) und
          eine einzige Datei: die JAR. Ein <strong>Multi-Stage-Build</strong> nutzt dafür zwei{' '}
          <Code>FROM</Code>: Die erste Stage (<Code>AS build</Code>) baut, die zweite holt sich mit{' '}
          <Code>COPY --from=build</Code> nur das Ergebnis. Ins fertige Image kommt allein die letzte
          Stage - Maven, der Quellcode und der Download-Cache bleiben draußen.
        </P>
        <TryIt modus="dockerfile" id="docker-dockerfile-multistage" {...beispiele['docker-dockerfile-multistage']} />
        <Liste>
          <li>
            <Code>useradd</Code> + <Code>USER spring</Code>: Der Server läuft nicht als{' '}
            <Code>root</Code>. Bricht jemand in die Anwendung ein, hat er damit nicht gleich alle
            Rechte im Container.
          </li>
          <li>
            <Code>ENTRYPOINT</Code> in der JSON-Form: Java bekommt Signale wie{' '}
            <Code>docker stop</Code> direkt und kann sauber herunterfahren.
          </li>
          <li>
            <Code>EXPOSE 8080</Code> dokumentiert den Port - veröffentlicht wird er erst mit{' '}
            <Code>-p</Code> (<Verweis nr="8.8" />).
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.layers} titel="nach einer Code-Änderung" />
      </Abschnitt>

      <Abschnitt titel="Das Frontend: Node baut, nginx liefert aus">
        <P>
          Für die React-App gilt dasselbe Prinzip. <Code>npm run build</Code> erzeugt in{' '}
          <Code>dist/</Code> nur noch HTML, CSS und JavaScript - dafür braucht es zur Laufzeit kein
          Node mehr, ein Webserver genügt. Das fertige Image ist rund 50 MB groß. Die{' '}
          <Code>nginx.conf</Code> ist die aus <Verweis nr="8.7" />: Sie leitet <Code>/api/</Code> ans
          Backend weiter.
        </P>
        <TryIt modus="dockerfile" id="docker-dockerfile-react" {...beispiele['docker-dockerfile-react']} />
      </Abschnitt>

      <Abschnitt titel="Bauen und starten">
        <P>
          Dasselbe Dockerfile im Terminal: bauen, starten, fragen. Das Terminal benutzt das
          Multi-Stage-Dockerfile von oben.
        </P>
        <DockerTerminal tasks={terminalTasks} dockerfile={terminalDockerfile} project="spring" ignore={terminalIgnore} />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="dockerfile"
          id="docker-dockerfile-uebung"
          {...beispiele['docker-dockerfile-uebung']}
          aufgabe={
            <>
              <p>Mach aus dem naiven Dockerfile ein gutes:</p>
              <Liste>
                <li>Das fertige Image basiert auf einer JRE und ist kleiner als 350 MB.</li>
                <li>Nach einer Änderung am Quellcode kommt der Download der Abhängigkeiten aus dem Cache.</li>
                <li>Der Container läuft nicht als root - und startet natürlich noch.</li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Du änderst eine Java-Datei in src/. Welche Schichten baut Docker bei COPY pom.xml → RUN go-offline → COPY src → RUN package neu?',
            antworten: ['Alle', 'Nur COPY src und RUN package', 'Nur RUN package', 'Keine'],
            richtig: 1,
            erklaerung: 'COPY src ändert sich - ab dort wird alles neu gebaut. Die Schichten davor kommen aus dem Cache.',
          },
          {
            frage: 'Was landet bei einem Multi-Stage-Build im fertigen Image?',
            antworten: ['Alle Stages', 'Nur die letzte Stage', 'Nur die erste Stage', 'Nur die Dateien aus COPY'],
            richtig: 1,
            erklaerung: 'Frühere Stages sind nur Werkbänke - übernommen wird, was die letzte Stage mit COPY --from holt.',
          },
          {
            frage: 'Wofür ist die .dockerignore?',
            antworten: [
              'Sie verhindert, dass Container gestartet werden',
              'Sie hält Dateien aus dem Build-Kontext heraus, z. B. node_modules und .git',
              'Sie listet Images, die nicht geladen werden sollen',
              'Sie ersetzt das Dockerfile',
            ],
            richtig: 1,
            erklaerung: 'Was dort steht, wird nicht an Docker geschickt - schnellere Builds, kleinere Images, keine Geheimnisse aus Versehen.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>FROM</Code>, <Code>WORKDIR</Code>, <Code>COPY</Code>, <Code>RUN</Code> bauen das Image;{' '}
            <Code>ENTRYPOINT</Code>/<Code>CMD</Code> gelten erst beim Start.
          </>,
          'Jede Anweisung ist eine Schicht. Ab der ersten Änderung wird alles neu gebaut - Seltenes nach oben, Code nach unten.',
          <>
            <Code>.dockerignore</Code> hält <Code>node_modules</Code>, <Code>target</Code> und{' '}
            <Code>.git</Code> aus dem Build.
          </>,
          <>
            Multi-Stage: bauen mit JDK/Node, ausliefern mit JRE/nginx - per{' '}
            <Code>COPY --from=build</Code>.
          </>,
          <>
            Eigener Benutzer mit <Code>USER</Code>, <Code>ENTRYPOINT</Code> in JSON-Form, Versionen
            statt <Code>latest</Code>.
          </>,
        ]}
      />
    </>
  )
}
