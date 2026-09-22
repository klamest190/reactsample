import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './SpringErrors.code'

/**
 * CHAPTER 8.4 - Validation & error handling
 * Never trust the client; turn exceptions into clear answers.
 */
export function SpringErrors() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Zwei Annotationen am Record, ein <Code>@Valid</Code> davor - und Spring weist ungültige
          Daten ab, bevor deine Methode überhaupt läuft. Die zweite Anfrage bekommt{' '}
          <strong>400</strong>, die Methode wird gar nicht aufgerufen. Was genau falsch war, steht im
          Log.
        </P>
        <TryIt modus="spring" id="spring-fehler-valid" {...beispiele['spring-fehler-valid']} />
      </Abschnitt>

      <Abschnitt titel="Traue nie dem Client">
        <P>
          Das Formular im Frontend prüft vielleicht schon, ob der Titel leer ist (
          <Verweis nr="5.1" />) - aber das Backend darf sich darauf nicht verlassen. Jeder kann mit{' '}
          <Code>curl</Code> oder einem Skript beliebige Anfragen schicken. Deshalb gilt:{' '}
          <strong>Das Backend prüft alles, was hereinkommt, selbst.</strong>
        </P>
        <P>
          Dafür gibt es <strong>Bean Validation</strong>: Regeln als Annotationen direkt an den
          Feldern. Im echten Projekt braucht es dazu diesen Starter:
        </P>
        <CodeBlock code={codeBloecke.abhaengigkeit} titel="pom.xml" />
        <Tabelle
          kopf={['Annotation', 'prüft']}
          spalten={['font-mono text-xs']}
          zeilen={[
            ['@NotNull', 'nicht null'],
            ['@NotBlank', 'Text nicht null, nicht leer und nicht nur Leerzeichen'],
            ['@NotEmpty', 'Text oder Liste nicht leer'],
            ['@Size(min = 1, max = 40)', 'Länge von Text oder Liste'],
            ['@Min(1) / @Max(5)', 'Zahlenbereich'],
            ['@Positive', 'größer als 0'],
            ['@Email', 'sieht aus wie eine E-Mail-Adresse'],
            ['@Pattern(regexp = "…")', 'passt zu einem regulären Ausdruck'],
          ]}
        />
        <Hinweis variante="warnung">
          Ohne <Code>@Valid</Code> am Parameter passiert gar nichts - die Annotationen am Record
          werden dann einfach ignoriert. Das ist der häufigste Grund für „meine Validierung
          funktioniert nicht“.
        </Hinweis>
        <P>
          Die Standard-Antwort von Spring Boot verrät übrigens nicht, <em>was</em> falsch war - nur
          dass es falsch war:
        </P>
        <CodeBlock code={codeBloecke.standard} titel="400 Bad Request" sprache="konfig" />
        <P>Wie man das ändert, kommt gleich.</P>
      </Abschnitt>

      <Abschnitt titel="Exceptions werden Status-Codes">
        <P>
          Nicht jeder Fehler ist eine kaputte Eingabe. Manchmal gibt es das Gesuchte einfach nicht -
          dann soll <strong>404</strong> herauskommen, nicht 500. Zwei einfache Wege:
        </P>
        <Liste>
          <li>
            <Code>@ResponseStatus(HttpStatus.NOT_FOUND)</Code> an einer eigenen Exception-Klasse
            (eigene Exceptions: <Verweis nr="7.9" />).
          </li>
          <li>
            <Code>throw new ResponseStatusException(HttpStatus.CONFLICT, "…")</Code> direkt an der
            Stelle, wo das Problem auffällt.
          </li>
        </Liste>
        <P>
          Alles andere, was aus einer Methode herausfliegt, wird zu <strong>500</strong> - mit
          Stacktrace im Log. Die Meldung erscheint in der Antwort nur, weil in den Properties{' '}
          <Code>server.error.include-message=always</Code> steht:
        </P>
        <TryIt modus="spring" id="spring-fehler-status" {...beispiele['spring-fehler-status']} />
        <Hinweis variante="info">
          Dass Spring Boot Fehlermeldungen standardmäßig verschweigt, ist Absicht: Eine Meldung wie
          „Connection to db-prod-3 refused“ verrät Angreifern mehr, als sie wissen sollten.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Alle Fehler an einer Stelle: @RestControllerAdvice">
        <P>
          In größeren Projekten will man Fehler einheitlich beantworten. Eine Klasse mit{' '}
          <Code>@RestControllerAdvice</Code> sammelt dafür <Code>@ExceptionHandler</Code>-Methoden,
          die für <em>alle</em> Controller gelten. Sie bekommen die Exception als Parameter und geben
          die Antwort zurück - genau wie eine normale Controller-Methode.
        </P>
        <P>
          Für den Inhalt gibt es einen Standard, <strong>Problem Details</strong> (RFC 9457), den
          Spring mit <Code>ProblemDetail</Code> direkt unterstützt:
        </P>
        <CodeBlock code={codeBloecke.problem} titel="404 · application/problem+json" sprache="konfig" />
        <P>
          Auch Validierungsfehler sind Exceptions (<Code>MethodArgumentNotValidException</Code>) - ein
          Handler kann daraus eine Liste „Feld → Meldung“ machen, mit der ein Formular im Frontend
          etwas anfangen kann:
        </P>
        <TryIt modus="spring" id="spring-fehler-advice" {...beispiele['spring-fehler-advice']} />
        <P>Wer eine Exception bekommt, entscheidet Spring in dieser Reihenfolge:</P>
        <CodeBlock code={codeBloecke.reihenfolge} titel="Reihenfolge" sprache="konfig" />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="spring"
          id="spring-fehler-uebung"
          {...beispiele['spring-fehler-uebung']}
          aufgabe={
            <>
              <p>Mach die Bücher-API robust:</p>
              <Liste>
                <li>
                  Beim Anlegen müssen <Code>title</Code> und <Code>author</Code> ausgefüllt sein und{' '}
                  <Code>pages</Code> mindestens 1 - sonst <strong>400</strong>.
                </li>
                <li>
                  <Code>GET /api/books/9</Code> für ein unbekanntes Buch antwortet mit{' '}
                  <strong>404</strong> und einem <Code>ProblemDetail</Code>, dessen{' '}
                  <Code>detail</Code> „Book 9 not found“ lautet.
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Ein Record hat @NotBlank am Titel, der Controller-Parameter nur @RequestBody. Was passiert bei leerem Titel?',
            antworten: ['400 Bad Request', 'Nichts - der leere Titel wird angenommen', '500 Internal Server Error', 'Die Anwendung startet nicht'],
            richtig: 1,
            erklaerung: 'Ohne @Valid wird nicht geprüft. Die Annotationen allein bewirken nichts.',
          },
          {
            frage: 'Eine Methode wirft eine NullPointerException, niemand fängt sie. Welcher Status kommt heraus?',
            antworten: ['400', '404', '500', '200 mit leerem Body'],
            richtig: 2,
            erklaerung: 'Eine unerwartete Exception ist ein Fehler des Servers: 500 Internal Server Error.',
          },
          {
            frage: 'Wofür ist @RestControllerAdvice gut?',
            antworten: [
              'Es macht Controller schneller',
              'Es sammelt @ExceptionHandler-Methoden, die für alle Controller gelten',
              'Es prüft Eingaben',
              'Es ersetzt @RestController',
            ],
            richtig: 1,
            erklaerung: 'Eine zentrale Stelle, an der Exceptions aus allen Controllern in einheitliche Antworten übersetzt werden.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Das Backend prüft alle Eingaben selbst - egal, was das Frontend schon prüft.',
          <>
            Regeln als Annotationen (<Code>@NotBlank</Code>, <Code>@Size</Code>, <Code>@Min</Code> …),
            aktiviert durch <Code>@Valid</Code> am Parameter. Verstoß → 400.
          </>,
          <>
            „Gibt es nicht“ → 404 mit <Code>@ResponseStatus</Code> an der Exception oder{' '}
            <Code>ResponseStatusException</Code>. Unerwartetes → 500.
          </>,
          <>
            <Code>@RestControllerAdvice</Code> + <Code>@ExceptionHandler</Code> beantworten Fehler
            aller Controller an einer Stelle - am besten als <Code>ProblemDetail</Code>.
          </>,
        ]}
      />
    </>
  )
}
