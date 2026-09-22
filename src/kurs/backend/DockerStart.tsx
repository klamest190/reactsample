import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { ContainersVsVms, PortMapping } from '../demos/BackendDiagrams'
import { DockerTerminal } from '../demos/DockerTerminal'
import { codeBloecke, terminalTasks } from './DockerStart.code'

/**
 * CHAPTER 8.8 - Containers & images
 * Why containers, image vs. container, and the everyday docker commands in a simulated terminal.
 */
export function DockerStart() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Ein Terminal mit dem Befehl <Code>docker</Code> - simuliert, aber mit echten Befehlen und
          echten Meldungen. Arbeite die Aufgaben unter dem Terminal ab; „einsetzen“ schreibt dir den
          Befehl in die Zeile, wenn du nicht weiterkommst.
        </P>
        <DockerTerminal tasks={terminalTasks} />
      </Abschnitt>

      <Abschnitt titel="„Bei mir läuft’s aber“">
        <P>
          Das Backend aus den letzten Kapiteln braucht Java 21, eine PostgreSQL-Datenbank in der
          richtigen Version, bestimmte Umgebungsvariablen … Auf deinem Rechner ist das alles
          eingerichtet. Auf dem Rechner eines Kollegen, auf dem Testserver und in der Produktion muss
          es genauso eingerichtet werden - und irgendwo ist immer etwas anders.
        </P>
        <P>
          <strong>Docker</strong> packt ein Programm <em>mitsamt allem, was es braucht</em> in ein{' '}
          <strong>Image</strong>: Betriebssystem-Dateien, Java, die JAR, Einstellungen. Aus einem Image
          startet man beliebig viele <strong>Container</strong> - überall gleich, egal ob auf Windows,
          Mac oder einem Linux-Server.
        </P>
        <ContainersVsVms />
        <P>
          Anders als eine virtuelle Maschine bringt ein Container kein eigenes Betriebssystem mit: Alle
          Container teilen sich den Kern (Kernel) des Rechners und sind nur voneinander abgeschottet.
          Deshalb starten sie in Sekundenbruchteilen und brauchen kaum Speicher.
        </P>
        <Hinweis variante="info">
          Auf Windows und macOS läuft Docker Desktop dafür im Hintergrund eine kleine Linux-VM - du
          merkst davon nichts.
        </Hinweis>
        <CodeBlock code={codeBloecke.installieren} titel="Terminal" />
      </Abschnitt>

      <Abschnitt titel="Image und Container">
        <P>
          Den Unterschied kennst du schon aus Java (<Verweis nr="7.6" />): Ein Image ist wie eine{' '}
          <strong>Klasse</strong> - ein unveränderlicher Bauplan. Ein Container ist wie ein{' '}
          <strong>Objekt</strong> - eine laufende Instanz davon, mit eigenem Zustand. Aus einem{' '}
          <Code>nginx</Code>-Image kannst du drei Container starten, die nichts voneinander wissen.
        </P>
        <Liste>
          <li>
            Images kommen aus einer <strong>Registry</strong>, meist Docker Hub. <Code>docker run</Code>{' '}
            lädt sie beim ersten Mal automatisch herunter („Unable to find image … locally“).
          </li>
          <li>
            Der <strong>Tag</strong> hinter dem Doppelpunkt ist die Version. Ohne Tag bekommst du{' '}
            <Code>latest</Code> - also das, was heute zufällig das Neueste ist.
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.tags} titel="Image-Namen" sprache="konfig" />
      </Abschnitt>

      <Abschnitt titel="docker run, auseinandergenommen">
        <CodeBlock code={codeBloecke.run} titel="Terminal" />
        <P>
          <strong>Ports</strong> sind die häufigste Stolperfalle. Ein Container hat sein eigenes
          Netzwerk: nginx lauscht auf Port 80 - aber im Container, nicht auf deinem Rechner. Erst{' '}
          <Code>-p 8080:80</Code> verbindet Port 8080 deines Rechners mit Port 80 im Container.
          Links steht immer dein Rechner, rechts der Container.
        </P>
        <PortMapping />
        <Hinweis variante="warnung">
          Ohne <Code>-d</Code> läuft ein Container im Vordergrund und blockiert das Terminal, bis du
          Strg+C drückst - dann ist er auch gestoppt. Für Server willst du fast immer{' '}
          <Code>docker run -d</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die Befehle für jeden Tag">
        <CodeBlock code={codeBloecke.befehle} titel="Terminal" />
        <P>
          Stirbt ein Container gleich nach dem Start, steht der Grund fast immer in{' '}
          <Code>docker logs</Code>. Die Aufgabe mit PostgreSQL zeigt das typische Beispiel: Ohne{' '}
          <Code>POSTGRES_PASSWORD</Code> weigert sich die Datenbank zu starten - und sagt das auch.
        </P>
      </Abschnitt>

      <Abschnitt titel="Daten, die bleiben: Volumes">
        <P>
          Alles, was ein Container schreibt, verschwindet mit ihm. Für eine Datenbank wäre das fatal.
          Ein <strong>Volume</strong> ist ein Speicherbereich, den Docker außerhalb des Containers
          verwaltet und in ihn einhängt:
        </P>
        <CodeBlock code={codeBloecke.volume} titel="Terminal" />
        <P>
          Container sind damit <strong>wegwerfbar</strong>: Man löscht sie ohne Bedenken und startet
          neue - der Zustand liegt im Volume oder in der Datenbank, nie im Container selbst.
        </P>
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was ist der Unterschied zwischen Image und Container?',
            antworten: [
              'Es gibt keinen, das sind zwei Namen für dasselbe',
              'Das Image ist der unveränderliche Bauplan, der Container eine laufende Instanz davon',
              'Container sind größer als Images',
              'Ein Image läuft, ein Container ist gestoppt',
            ],
            richtig: 1,
            erklaerung: 'Wie Klasse und Objekt: aus einem Image lassen sich beliebig viele Container starten.',
          },
          {
            frage: 'docker run -p 3000:80 nginx - unter welcher Adresse erreichst du nginx im Browser?',
            antworten: ['http://localhost:80', 'http://localhost:3000', 'http://nginx:80', 'gar nicht'],
            richtig: 1,
            erklaerung: 'Links steht der Port deines Rechners (3000), rechts der im Container (80).',
          },
          {
            frage: 'Ein Container ist direkt nach dem Start beendet. Wo schaust du zuerst?',
            antworten: ['docker images', 'docker logs NAME', 'docker pull', 'In den Einstellungen von Docker Desktop'],
            richtig: 1,
            erklaerung: 'docker logs zeigt, was der Container ausgegeben hat - meist steht der Grund dort.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Ein Image enthält ein Programm samt allem, was es braucht - ein Container ist eine laufende Instanz davon.',
          'Container teilen sich den Kernel des Rechners: leichter und schneller als virtuelle Maschinen.',
          <>
            <Code>docker run -d --name x -p HOST:CONTAINER -e KEY=VALUE image:tag</Code> - danach{' '}
            <Code>ps</Code>, <Code>logs</Code>, <Code>exec</Code>, <Code>stop</Code>, <Code>rm</Code>.
          </>,
          'Versionen immer mit Tag angeben - latest ändert sich ohne Vorwarnung.',
          'Daten, die bleiben sollen, gehören in ein Volume.',
        ]}
      />
    </>
  )
}
