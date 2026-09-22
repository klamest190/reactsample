import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './SpringRest.code'

/**
 * CHAPTER 8.3 - REST APIs with controllers
 * Resources, the five methods, request bodies, status codes and the JSON rules.
 */
export function SpringRest() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Eine komplette API für ToDos: auflisten, filtern, anlegen, ersetzen, löschen. Nach dem
          Start laufen sieben Anfragen durch - jede mit der erwarteten Antwort. Darunter kannst du
          weitermachen: Leg ein drittes ToDo an, lösch das erste, frag nach einem, das es nicht gibt.
        </P>
        <TryIt modus="spring" id="spring-rest-crud" {...beispiele['spring-rest-crud']} />
      </Abschnitt>

      <Abschnitt titel="REST: Ressourcen und Verben">
        <P>
          REST ist keine Technik, sondern eine Konvention, wie man HTTP-APIs baut. Der Kern:{' '}
          <strong>Der Pfad nennt ein Ding</strong> (eine <em>Ressource</em>, im Plural),{' '}
          <strong>die Methode sagt, was damit passiert.</strong>
        </P>
        <CodeBlock code={codeBloecke.rest} titel="todos.http" />
        <P>So sieht es aus, wenn man die Idee nicht beachtet:</P>
        <CodeBlock code={codeBloecke.schlecht} titel="bitte nicht.http" />
        <Hinweis variante="warnung">
          <Code>GET</Code> darf nie etwas verändern. Browser, Proxys und Suchmaschinen rufen
          GET-Links einfach so auf, wiederholen sie oder speichern die Antwort - ein{' '}
          <Code>GET /deleteTodo?id=7</Code> wird früher oder später versehentlich ausgelöst.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Ein Controller für eine Ressource">
        <Liste>
          <li>
            <Code>@RequestMapping("/api/todos")</Code> an der Klasse gilt für alle Methoden - dort
            steht dann nur noch der Rest: <Code>{'@GetMapping("/{id}")'}</Code>.
          </li>
          <li>
            <Code>@RequestBody TodoRequest request</Code> liest den JSON-Body und baut daraus ein
            Objekt. Fehlen Felder, bleiben sie leer (<Code>null</Code>, <Code>0</Code>,{' '}
            <Code>false</Code>); unbekannte Felder werden ignoriert.
          </li>
          <li>
            <Code>@RequestParam(required = false) Boolean done</Code>: ohne Parameter ist{' '}
            <Code>done</Code> einfach <Code>null</Code> - deshalb <Code>Boolean</Code> statt{' '}
            <Code>boolean</Code>.
          </li>
        </Liste>
        <P>
          Das Beispiel benutzt zwei Records: <Code>Todo</Code> für das, was die API herausgibt, und{' '}
          <Code>TodoRequest</Code> für das, was ein Client schicken darf. Solche reinen
          Transport-Klassen heißen <strong>DTOs</strong> (Data Transfer Objects). Der Client kann so
          keine <Code>id</Code> mitschicken - die vergibt der Server.
        </P>
      </Abschnitt>

      <Abschnitt titel="Status-Codes mit ResponseEntity">
        <P>
          Gibt eine Methode einfach ein Objekt zurück, antwortet Spring mit <strong>200</strong>.
          Für alles andere gibt es <Code>ResponseEntity</Code> - Status, Header und Body in einem:
        </P>
        <CodeBlock code={codeBloecke.responseEntity} titel="ResponseEntity.java" />
        <P>
          Steht der Status fest, geht es kürzer mit einer Annotation an der Methode:{' '}
          <Code>@ResponseStatus(HttpStatus.CREATED)</Code>. Die Übung unten nutzt beides.
        </P>
        <Hinweis variante="tipp">
          Nach einem POST gehört zu <strong>201 Created</strong> der Header <Code>Location</Code> mit
          der Adresse des neuen Eintrags. In der ersten Antwort oben siehst du ihn unter dem Body.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Wie aus Objekten JSON wird">
        <P>
          Die Umwandlung übernimmt die Bibliothek <strong>Jackson</strong>. Sie liest Objekte über
          ihre <strong>Getter</strong>, nicht über die Felder:
        </P>
        <CodeBlock code={codeBloecke.getter} titel="Getter → JSON" />
        <P>
          Das ist praktisch - ein Passwortfeld ohne Getter bleibt auf dem Server. Aber eine Klasse
          ganz ohne Getter kann Jackson gar nicht schreiben, dann gibt es <strong>500</strong>. Die
          dritte und vierte Anfrage zeigen: Für beliebiges JSON reicht eine <Code>Map</Code>, und
          kaputtes JSON beantwortet Spring mit <strong>400</strong>.
        </P>
        <TryIt modus="spring" id="spring-rest-json" {...beispiele['spring-rest-json']} />
        <Hinweis variante="info">
          Deshalb sind Records für APIs so beliebt (<Verweis nr="7.7" />): Sie haben automatisch
          „Getter“ für alle Komponenten, sind unveränderlich - und man sieht auf einen Blick, welche
          Felder im JSON stehen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="spring"
          id="spring-rest-uebung"
          {...beispiele['spring-rest-uebung']}
          aufgabe={
            <>
              <p>Die Bücher-API kann auflisten und anlegen. Ergänze:</p>
              <Liste>
                <li>
                  <Code>PUT /api/books/{'{id}'}</Code> ersetzt Titel und Autor - <strong>200</strong>{' '}
                  mit dem neuen Buch, <strong>404</strong>, wenn es die id nicht gibt
                </li>
                <li>
                  <Code>DELETE /api/books/{'{id}'}</Code> löscht - <strong>204</strong> ohne Body,{' '}
                  <strong>404</strong>, wenn es die id nicht gibt
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Welcher Endpunkt folgt den REST-Konventionen, um das ToDo 7 zu löschen?',
            antworten: ['GET /api/todos/7/delete', 'POST /api/deleteTodo?id=7', 'DELETE /api/todos/7', 'DELETE /api/todo?delete=7'],
            richtig: 2,
            erklaerung: 'Der Pfad nennt die Ressource (/api/todos/7), die Methode die Aktion (DELETE).',
          },
          {
            frage: 'Welcher Status passt nach einem erfolgreichen POST, der etwas angelegt hat?',
            antworten: ['200 OK', '201 Created', '204 No Content', '302 Found'],
            richtig: 1,
            erklaerung: '201 Created - dazu der Location-Header mit der Adresse des neuen Eintrags.',
          },
          {
            frage: 'Eine Klasse hat ein privates Feld „password“ ohne Getter. Was passiert mit ihm im JSON?',
            antworten: ['Es erscheint mit seinem Wert', 'Es erscheint als null', 'Es fehlt', 'Spring antwortet mit 500'],
            richtig: 2,
            erklaerung: 'Jackson liest über Getter. Ohne Getter bleibt das Feld unsichtbar - solange es andere Getter gibt.',
          },
        ]}
      />

      <Merke
        punkte={[
          'REST: der Pfad nennt die Ressource (Plural), die Methode die Aktion. GET ändert nie etwas.',
          <>
            <Code>@RequestMapping</Code> an der Klasse für den gemeinsamen Pfad, <Code>@GetMapping</Code>,{' '}
            <Code>@PostMapping</Code>, <Code>@PutMapping</Code>, <Code>@DeleteMapping</Code> an den Methoden.
          </>,
          <>
            <Code>@RequestBody</Code> macht aus JSON ein Objekt - am besten ein Record als DTO.
          </>,
          <>
            <Code>ResponseEntity</Code> bestimmt Status, Header und Body: 201 + Location, 204, 404 …
          </>,
          'Ins JSON kommt, was einen Getter hat (bei Records: jede Komponente).',
        ]}
      />
    </>
  )
}
