import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { ComposeNetwork } from '../demos/BackendDiagrams'
import { beispiele, codeBloecke } from './DockerCompose.code'

/**
 * CHAPTER 8.10 - Docker Compose: the whole app
 * Database, backend and frontend in one file, started with one command.
 */
export function DockerCompose() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Die ganze ToDo-App - PostgreSQL, das Spring-Boot-Backend und die React-App - in einer
          Datei. Ein <Code>docker compose up</Code>, und alles startet in der richtigen Reihenfolge.
          Lies das Log: Erst wird die Datenbank „healthy“, dann verbindet sich die API, dann kommt
          nginx.
        </P>
        <TryIt modus="compose" id="docker-compose-einstieg" {...beispiele['docker-compose-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Warum Compose?">
        <P>
          Mit <Code>docker run</Code> müsstest du drei lange Befehle in der richtigen Reihenfolge
          tippen, ein Netzwerk anlegen, ein Volume anlegen - und das jedes Mal wieder. Eine{' '}
          <Code>compose.yaml</Code> beschreibt stattdessen, was laufen soll, und Docker Compose sorgt
          dafür. Sie liegt neben den Projektordnern:
        </P>
        <CodeBlock code={codeBloecke.ordner} titel="todo/" sprache="konfig" />
        <Liste>
          <li>
            <Code>services</Code>: ein Eintrag pro Container. Entweder ein fertiges{' '}
            <Code>image</Code> oder <Code>build</Code> mit dem Ordner, in dem das Dockerfile liegt.
          </li>
          <li>
            <Code>environment</Code>: Umgebungsvariablen - für Spring gerade die aus{' '}
            <Verweis nr="8.6" />: <Code>SPRING_DATASOURCE_URL</Code> überschreibt{' '}
            <Code>spring.datasource.url</Code>.
          </li>
          <li>
            <Code>ports</Code>, <Code>volumes</Code>: wie <Code>-p</Code> und <Code>-v</Code> bei{' '}
            <Code>docker run</Code>. Benannte Volumes werden ganz unten angelegt.
          </li>
          <li>
            <Code>depends_on</Code>: die Startreihenfolge.
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.befehle} titel="Terminal" />
      </Abschnitt>

      <Abschnitt titel="Ein Netzwerk, Service-Namen als Adressen">
        <P>
          Compose legt für das Projekt ein eigenes Netzwerk an. Darin erreichen sich die Container
          über ihre <strong>Service-Namen</strong>: Die API spricht die Datenbank unter{' '}
          <Code>db:5432</Code> an. Von außen, von deinem Rechner, kommt man nur an die Ports, die mit{' '}
          <Code>ports</Code> veröffentlicht sind.
        </P>
        <ComposeNetwork />
        <CodeBlock code={codeBloecke.netz} titel="Wer erreicht wen?" sprache="konfig" />
        <P>
          Der häufigste Fehler überhaupt: <Code>localhost</Code> in der Datenbank-Adresse. Auf deinem
          Rechner hat das funktioniert - im Container zeigt <Code>localhost</Code> auf den
          API-Container selbst, und dort läuft keine Datenbank:
        </P>
        <TryIt modus="compose" id="docker-compose-localhost" {...beispiele['docker-compose-localhost']} />
      </Abschnitt>

      <Abschnitt titel="depends_on reicht nicht: Healthchecks">
        <P>
          <Code>depends_on: [db]</Code> wartet nur, bis der Datenbank-Container <em>gestartet</em>{' '}
          ist. PostgreSQL braucht danach aber noch ein paar Sekunden, bis es Verbindungen annimmt -
          startet die API in dieser Zeit, bricht sie mit „Connection refused“ ab.
        </P>
        <P>
          Die Lösung ist ein <Code>healthcheck</Code>: ein Befehl, mit dem Docker regelmäßig prüft,
          ob der Dienst bereit ist (<Code>pg_isready</Code>). Mit{' '}
          <Code>condition: service_healthy</Code> wartet die API genau darauf. Probier es im ersten
          Beispiel aus: Ersetze den <Code>depends_on</Code>-Block der API durch{' '}
          <Code>depends_on: [db]</Code> - und dann ergänze <Code>restart: on-failure</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Passwörter gehören nicht in die Datei">
        <P>
          Die <Code>compose.yaml</Code> landet im Git - Passwörter dürfen es nicht. Compose liest
          deshalb automatisch eine Datei <Code>.env</Code> daneben und setzt Werte mit{' '}
          <Code>{'${NAME}'}</Code> ein:
        </P>
        <CodeBlock code={codeBloecke.env} titel=".env" />
        <CodeBlock code={codeBloecke.envNutzen} titel="compose.yaml" />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="compose"
          id="docker-compose-uebung"
          {...beispiele['docker-compose-uebung']}
          aufgabe={
            <>
              <p>
                Diese <Code>compose.yaml</Code> hat vier Fehler. Behebe einen nach dem anderen - die
                Meldungen von <Code>docker compose up</Code> führen dich hin:
              </p>
              <Liste>
                <li>Alle drei Container laufen.</li>
                <li>
                  Die API antwortet auf <Code>http://localhost:8080</Code>, die React-App auf{' '}
                  <Code>http://localhost:3000</Code>.
                </li>
                <li>Die API wartet, bis die Datenbank „healthy“ ist.</li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Abschnitt titel="Und dann?">
        <P>
          Für einen Server baut man die Images einmal, versieht sie mit einer Version und legt sie in
          eine <strong>Registry</strong>. Auf dem Server steht dieselbe <Code>compose.yaml</Code> -
          nur mit <Code>image:</Code> statt <Code>build:</Code>. Meist übernimmt das eine
          CI-Pipeline (GitHub Actions, GitLab CI) bei jedem Push.
        </P>
        <CodeBlock code={codeBloecke.weiter} titel="Terminal" />
        <Hinweis variante="info">
          Wenn es mehr als ein Server wird, kommt meist <strong>Kubernetes</strong> ins Spiel: Es
          startet Container auf vielen Rechnern, ersetzt abgestürzte automatisch und verteilt die
          Last. Die Bausteine sind dieselben, die du hier kennengelernt hast - Images, Container,
          Ports, Umgebungsvariablen, Volumes, Healthchecks.
        </Hinweis>
        <P>
          Damit ist der Weg komplett: von <Code>const</Code> und <Code>let</Code> in{' '}
          <Verweis nr="1.1" /> über React und Java bis zu einer Anwendung mit Datenbank, API und
          Frontend, die mit einem Befehl überall läuft. 🎉
        </P>
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Unter welcher Adresse erreicht der api-Container die Datenbank aus dem Service „db“?',
            antworten: ['localhost:5432', 'db:5432', '127.0.0.1:5432', 'host.docker.internal:5432'],
            richtig: 1,
            erklaerung: 'Im Compose-Netzwerk ist der Service-Name die Adresse. localhost wäre der api-Container selbst.',
          },
          {
            frage: 'Was bewirkt depends_on: [db] ohne condition?',
            antworten: [
              'Die API startet erst, wenn die Datenbank Verbindungen annimmt',
              'Die API startet erst, nachdem der db-Container gestartet wurde - bereit muss er nicht sein',
              'Nichts',
              'Die Datenbank startet nach der API',
            ],
            richtig: 1,
            erklaerung: 'Nur die Startreihenfolge. Auf „bereit“ wartet erst condition: service_healthy mit einem Healthcheck.',
          },
          {
            frage: 'Was macht docker compose down -v zusätzlich zu docker compose down?',
            antworten: ['Es zeigt mehr Ausgaben', 'Es löscht auch die Volumes - die Daten sind weg', 'Es baut die Images neu', 'Es lädt neue Versionen'],
            richtig: 1,
            erklaerung: '-v steht für volumes: Beim nächsten up ist die Datenbank leer.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Eine <Code>compose.yaml</Code> beschreibt alle Container einer Anwendung;{' '}
            <Code>docker compose up -d</Code> startet sie, <Code>down</Code> räumt auf.
          </>,
          'Im Compose-Netzwerk sind Service-Namen die Adressen (db:5432) - localhost ist immer der eigene Container.',
          <>
            Konfiguration über <Code>environment</Code> - Spring liest{' '}
            <Code>SPRING_DATASOURCE_URL</Code> & Co. automatisch.
          </>,
          <>
            <Code>depends_on</Code> + <Code>healthcheck</Code> + <Code>condition: service_healthy</Code>{' '}
            für eine verlässliche Startreihenfolge.
          </>,
          <>
            Daten in benannten Volumes, Passwörter in <Code>.env</Code> - nicht im Git.
          </>,
        ]}
      />
    </>
  )
}
