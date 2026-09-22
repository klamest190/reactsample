import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { RequestFlow } from '../demos/BackendDiagrams'
import { beispiele, codeBloecke } from './SpringStart.code'

/**
 * CHAPTER 8.1 - Hello Spring Boot
 * What a backend is, HTTP in five minutes, and the first controller.
 */
export function SpringStart() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Bisher lief alles im Browser. Jetzt kommt die andere Seite: ein <strong>Backend</strong> -
          ein Programm auf einem Server, das Anfragen beantwortet. Das hier ist ein vollständiges
          Spring-Boot-Backend. Nach dem Start schickt der Editor automatisch eine Anfrage an{' '}
          <Code>/hello</Code>; unten siehst du die Antwort.
        </P>
        <TryIt modus="spring" id="spring-start-einstieg" {...beispiele['spring-start-einstieg']} />
        <Hinweis variante="info">
          Im Formular unter der Antwort kannst du selbst Anfragen schicken - probier{' '}
          <Code>/hallo</Code> (Tippfehler) oder die Methode <Code>POST</Code> und sieh dir an, was
          der Server dann sagt.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Wozu ein Backend?">
        <P>
          Die ToDo-App aus <Verweis id="projekt-7-speichern">dem Projekt</Verweis> speichert im{' '}
          <Code>localStorage</Code> - also nur in <em>diesem</em> Browser. Öffnest du sie am Handy,
          ist die Liste leer. Sobald Daten geteilt, dauerhaft gespeichert oder geschützt werden
          sollen, braucht es einen Server, dem alle Clients vertrauen:
        </P>
        <RequestFlow />
        <Liste>
          <li>
            Der <strong>Browser</strong> (die React-App) schickt eine HTTP-Anfrage - das kennst du
            schon als <Code>fetch</Code> aus <Verweis nr="5.2" />.
          </li>
          <li>
            Das <strong>Backend</strong> prüft, rechnet, fragt die Datenbank und antwortet mit JSON.
          </li>
          <li>
            Die <strong>Datenbank</strong> hält die Daten, auch wenn der Server neu startet.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="HTTP in fünf Minuten">
        <P>
          Jede Anfrage besteht aus einer <strong>Methode</strong>, einem <strong>Pfad</strong>,
          optionalen <strong>Headern</strong> und manchmal einem <strong>Body</strong>. Die Antwort
          hat einen <strong>Status-Code</strong>, Header und einen Body - bei uns fast immer JSON.
        </P>
        <div className="grid gap-3 lg:grid-cols-2">
          <CodeBlock code={codeBloecke.anfrage} titel="Anfrage · request.http" />
          <CodeBlock code={codeBloecke.antwort} titel="Antwort" sprache="konfig" />
          <CodeBlock code={codeBloecke.anlegen} titel="Anlegen · request.http" />
          <CodeBlock code={codeBloecke.angelegt} titel="Antwort" sprache="konfig" />
        </div>
        <Tabelle
          kopf={['Methode', 'Bedeutung']}
          spalten={['font-mono text-xs font-bold']}
          zeilen={[
            ['GET', 'lesen - ändert nichts, darf beliebig oft wiederholt werden'],
            ['POST', 'etwas Neues anlegen'],
            ['PUT', 'etwas komplett ersetzen'],
            ['PATCH', 'etwas teilweise ändern'],
            ['DELETE', 'etwas löschen'],
          ]}
        />
        <Tabelle
          kopf={['Status', 'Bedeutung']}
          spalten={['font-mono text-xs font-bold']}
          zeilen={[
            ['2xx', '200 OK, 201 Created, 204 No Content - hat geklappt'],
            ['4xx', '400 Bad Request, 404 Not Found, 405 Method Not Allowed - der Client hat etwas falsch gemacht'],
            ['5xx', '500 Internal Server Error - der Server hat einen Fehler (meist eine Exception)'],
          ]}
        />
        <Hinweis variante="tipp">
          Die Schreibweise oben ist das <Code>.http</Code>-Format, das IntelliJ IDEA und VS Code
          (mit der Erweiterung „REST Client“) direkt ausführen können. Genau so schreiben wir in
          diesem Teil Anfragen und Tests - nur mit einer Zeile <Code>→ 200 …</Code> für die
          erwartete Antwort.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Was ist Spring Boot?">
        <P>
          <strong>Spring</strong> ist seit 2003 das verbreitetste Framework für Java-Backends.{' '}
          <strong>Spring Boot</strong> ist die Schicht obendrauf, die das Einrichten übernimmt: Ein
          Webserver (Tomcat) ist eingebaut, Standardeinstellungen sind vernünftig gewählt, und statt
          seitenlanger Konfiguration zählt die Konvention. Du schreibst Klassen mit Annotationen -
          Spring findet sie beim Start und verdrahtet alles.
        </P>
        <P>
          Ein neues Projekt legst du auf <strong>start.spring.io</strong> an (oder direkt in
          IntelliJ): Projekt <em>Maven</em>, Sprache <em>Java</em>, Java-Version 21, als Abhängigkeit{' '}
          <em>Spring Web</em>. Heraus kommt ein Ordner mit dieser Struktur:
        </P>
        <CodeBlock code={codeBloecke.struktur} titel="todo-api/" sprache="konfig" />
        <P>
          Die <Code>pom.xml</Code> ist für Maven, was die <Code>package.json</Code> für npm ist: Sie
          nennt die Abhängigkeiten. Ein „Starter“ bündelt dabei alles, was zusammengehört -{' '}
          <Code>spring-boot-starter-web</Code> bringt Tomcat, Spring MVC und die JSON-Bibliothek
          Jackson mit.
        </P>
        <CodeBlock code={codeBloecke.pom} titel="pom.xml (Ausschnitt)" />
        <CodeBlock code={codeBloecke.starten} titel="Terminal" />
      </Abschnitt>

      <Abschnitt titel="Das erste Programm Stück für Stück">
        <Liste>
          <li>
            <Code>@SpringBootApplication</Code> markiert die Startklasse. Sie schaltet den{' '}
            <strong>Komponenten-Scan</strong> ein: Spring sucht beim Start alle Klassen mit
            Annotationen wie <Code>@RestController</Code>.
          </li>
          <li>
            <Code>SpringApplication.run(…)</Code> in <Code>main</Code> startet alles: Spring legt die
            Objekte an, der eingebaute Tomcat öffnet Port 8080.
          </li>
          <li>
            <Code>@RestController</Code> macht die Klasse zu einem Controller, dessen Rückgabewerte
            direkt die Antwort sind.
          </li>
          <li>
            <Code>@GetMapping("/hello")</Code> verbindet eine Methode mit <Code>GET /hello</Code>.
            Die Methode rufst du nie selbst auf - das macht Spring bei jeder passenden Anfrage.
          </li>
        </Liste>
        <P>
          Das ist das Grundprinzip von Spring, das dir in diesem Teil ständig begegnet:{' '}
          <strong>Du beschreibst mit Annotationen, was eine Klasse ist - und Spring ruft sie
          auf.</strong> Ab jetzt lassen wir die <Code>import</Code>-Zeilen weg; im echten Projekt
          ergänzt sie die IDE.
        </P>
        <CodeBlock code={codeBloecke.reactVergleich} titel="Vergleich mit React Router" />
      </Abschnitt>

      <Abschnitt titel="Parameter: aus dem Pfad und aus der Query">
        <P>
          Werte kommen auf zwei Wegen in die Methode: <Code>@RequestParam</Code> liest{' '}
          <Code>?name=Ada</Code> hinter dem Fragezeichen, <Code>@PathVariable</Code> liest einen
          Platzhalter <Code>{'{n}'}</Code> im Pfad. Spring wandelt dabei gleich in den Typ des
          Parameters um - und antwortet mit <strong>400 Bad Request</strong>, wenn das nicht geht.
          Die vierte Anfrage zeigt es.
        </P>
        <TryIt modus="spring" id="spring-start-parameter" {...beispiele['spring-start-parameter']} />
      </Abschnitt>

      <Abschnitt titel="Java-Objekte werden JSON">
        <P>
          Gibt eine Methode ein Objekt oder eine Liste zurück, wandelt Spring es automatisch in JSON
          um. Records (<Verweis nr="7.7" />) eignen sich dafür perfekt: Ihre Komponenten werden zu
          den Feldern im JSON.
        </P>
        <TryIt modus="spring" id="spring-start-json" {...beispiele['spring-start-json']} />
        <Hinweis variante="info">
          <strong>Wie läuft das hier im Browser?</strong> Die Java-Laufzeit aus Teil 7 führt deinen
          Code aus, eine kleine Nachbildung von Spring (<Code>src/spring/</Code>) liest die
          Annotationen, legt die Objekte an und leitet Anfragen an die richtige Methode. Es gibt
          kein Netzwerk und keinen echten Tomcat - aber dieselben Regeln, dieselben Status-Codes und
          dieselben Fehlermeldungen wie in einem echten Spring-Boot-Projekt.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="spring"
          id="spring-start-uebung"
          {...beispiele['spring-start-uebung']}
          aufgabe={
            <>
              <p>Schreibe einen Controller mit zwei Endpunkten:</p>
              <Liste>
                <li>
                  <Code>GET /greet?name=Ada</Code> antwortet mit dem Text <Code>Hello, Ada!</Code> -
                  ohne <Code>name</Code> mit <Code>Hello, World!</Code>
                </li>
                <li>
                  <Code>GET /api/status</Code> antwortet mit dem JSON{' '}
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
            frage: 'Welche HTTP-Methode passt zu „einen neuen Eintrag anlegen“?',
            antworten: ['GET', 'POST', 'DELETE', 'HEAD'],
            richtig: 1,
            erklaerung: 'POST legt etwas Neues an. GET liest nur, PUT/PATCH ändern, DELETE löscht.',
          },
          {
            frage: 'Wer ruft eine Methode mit @GetMapping("/hello") auf?',
            antworten: ['Die main-Methode', 'Spring, bei jeder Anfrage an GET /hello', 'Der Browser direkt', 'Niemand - sie ist nur Dokumentation'],
            richtig: 1,
            erklaerung: 'Spring findet die Methode beim Start über die Annotation und ruft sie für jede passende Anfrage auf.',
          },
          {
            frage: 'GET /square/seven, die Methode erwartet @PathVariable int n. Was antwortet Spring?',
            antworten: ['200 mit 0', '404 Not Found', '400 Bad Request', '500 Internal Server Error'],
            richtig: 2,
            erklaerung: '„seven“ lässt sich nicht in int umwandeln - das ist ein Fehler der Anfrage, also 400.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Ein Backend beantwortet HTTP-Anfragen: Methode + Pfad rein, Status-Code + Body (meist JSON) raus.',
          <>
            <Code>@SpringBootApplication</Code> + <Code>SpringApplication.run</Code> starten Spring und
            den eingebauten Tomcat auf Port 8080.
          </>,
          <>
            <Code>@RestController</Code> + <Code>@GetMapping("/pfad")</Code> verbinden eine Methode mit
            einer URL - aufgerufen wird sie von Spring.
          </>,
          <>
            <Code>@RequestParam</Code> liest <Code>?x=…</Code>, <Code>@PathVariable</Code> liest{' '}
            <Code>{'/{x}'}</Code> - samt Typumwandlung (sonst 400).
          </>,
          'Objekte und Records werden automatisch JSON.',
        ]}
      />
    </>
  )
}
