import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { CorsPicture } from '../demos/BackendDiagrams'
import { FullStack } from '../demos/FullStack'
import { backend, beispiele, codeBloecke, frontend } from './SpringReact.code'

/**
 * CHAPTER 8.7 - React meets Spring Boot
 * The todo app gets a server: fetch, CORS, the Vite proxy - and a full-stack workshop.
 */
export function SpringReact() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Links läuft ein Spring-Boot-Backend, rechts die ToDo-App aus dem Projekt - beide in diesem
          Browser-Tab. Jedes <Code>fetch('/api/…')</Code> der React-App landet im Backend; im
          Netzwerk-Protokoll siehst du jede Anfrage wie in den DevTools. Leg ein ToDo an, hake es ab,
          lösch es - und lies dabei das Server-Log.
        </P>
        <FullStack id="spring-react-werkstatt" backend={backend} frontend={frontend} />
        <Hinweis variante="tipp">
          Probier im Frontend ein leeres ToDo: Das Backend antwortet mit 400 (<Code>@NotBlank</Code>,{' '}
          <Verweis nr="8.4" />), und die App zeigt eine Meldung. Oder ändere im Backend{' '}
          <Code>"/api/todos"</Code> in <Code>"/api/tasks"</Code> - und schau, was im Netzwerk
          passiert.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Zwei Programme, eine Anwendung">
        <P>
          Beim Entwickeln laufen zwei Server: Vite liefert die React-App aus (Port 5173), Spring Boot
          die API (Port 8080). Sie reden nur über HTTP miteinander - das Frontend weiß nichts von
          Java, das Backend nichts von React.
        </P>
        <CodeBlock code={codeBloecke.entwicklung} titel="Terminal" sprache="konfig" />
        <P>
          Im Frontend ist das bekannte Handwerk aus <Verweis nr="5.2" /> gefragt:
        </P>
        <CodeBlock code={codeBloecke.fetch} titel="api.js" />
        <Hinweis variante="warnung">
          <Code>fetch</Code> wirft bei 400 oder 500 <strong>keinen</strong> Fehler - nur, wenn der
          Server gar nicht erreichbar ist. Den Status musst du selbst mit <Code>response.ok</Code>{' '}
          prüfen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="CORS: warum der Browser blockiert">
        <P>
          Rufst du aus der App auf <Code>localhost:5173</Code> direkt{' '}
          <Code>http://localhost:8080/api/todos</Code> auf, meldet der Browser einen{' '}
          <strong>CORS-Fehler</strong> - obwohl der Server funktioniert. Grund ist die{' '}
          <strong>Same-Origin-Policy</strong>: Eine Seite darf nur mit ihrem eigenen Ursprung
          (Protokoll + Host + Port) sprechen, außer der andere Server erlaubt es ausdrücklich.
        </P>
        <CorsPicture />
        <CodeBlock code={codeBloecke.cors} titel="preflight.http" />
        <P>Zwei Lösungen - die erste ist beim Entwickeln die bequemste:</P>
        <Liste>
          <li>
            <strong>Vite-Proxy</strong>: Die App fragt <Code>/api/…</Code> beim eigenen Server, und
            Vite reicht die Anfrage an Spring weiter. Für den Browser ist es derselbe Ursprung - kein
            CORS nötig. So verhält sich auch die Werkstatt oben.
          </li>
          <li>
            <strong>CORS erlauben</strong> im Backend, mit <Code>@CrossOrigin</Code> oder zentral in
            einer <Code>WebMvcConfigurer</Code>-Bean.
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.proxy} titel="vite.config.ts" />
        <CodeBlock code={codeBloecke.crossOrigin} titel="TodoController.java / WebConfig.java" />
        <Hinweis variante="info">
          CORS schützt die <em>Nutzer</em>, nicht den Server: Es verhindert, dass eine fremde Webseite
          im Namen des Nutzers deine API aufruft. <Code>curl</Code> oder Postman kümmern sich nicht
          darum - Schutz vor unbefugtem Zugriff braucht Authentifizierung.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Und in Produktion?">
        <P>
          Dort gibt es keinen Vite-Server mehr. <Code>npm run build</Code> erzeugt statische Dateien,
          die ein Webserver wie <strong>nginx</strong> ausliefert - und nginx übernimmt die Rolle des
          Proxys: <Code>/api/</Code> geht ans Backend, alles andere ist die React-App. Wieder ein
          Ursprung, wieder kein CORS.
        </P>
        <CodeBlock code={codeBloecke.nginx} titel="nginx.conf" sprache="konfig" />
        <P>
          Wie nginx, Backend und Datenbank zusammen gestartet werden, zeigen die Docker-Kapitel -
          am Ende läuft genau diese App mit einem einzigen Befehl (<Verweis nr="8.10" />).
        </P>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="spring"
          id="spring-react-uebung"
          {...beispiele['spring-react-uebung']}
          aufgabe={
            <>
              <p>
                Die React-App hakt ToDos mit <Code>{'PATCH /api/todos/{id}'}</Code> und dem Body{' '}
                <Code>{'{"done": true}'}</Code> ab. Im Backend fehlt der Endpunkt:
              </p>
              <Liste>
                <li>
                  Er setzt <Code>done</Code> und antwortet mit dem geänderten ToDo (200).
                </li>
                <li>
                  Gibt es die id nicht, antwortet er mit <strong>404</strong>.
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Die App auf localhost:5173 ruft fetch("http://localhost:8080/api/todos"). Was passiert ohne weitere Einstellungen?',
            antworten: ['Es funktioniert', 'Der Browser blockiert die Antwort (CORS)', 'Spring antwortet mit 404', 'fetch wandelt die URL automatisch um'],
            richtig: 1,
            erklaerung: 'Anderer Port = anderer Ursprung. Ohne Access-Control-Allow-Origin gibt der Browser die Antwort nicht heraus.',
          },
          {
            frage: 'Der Server antwortet mit 400. Was macht fetch?',
            antworten: ['Es wirft eine Exception', 'Es liefert eine Response mit ok = false', 'Es versucht es erneut', 'Es liefert undefined'],
            richtig: 1,
            erklaerung: 'fetch wirft nur bei Netzwerkfehlern. Den Status prüfst du selbst mit response.ok bzw. response.status.',
          },
          {
            frage: 'Wofür ist der Vite-Proxy gut?',
            antworten: [
              'Er macht die App schneller',
              'Er leitet /api an das Backend weiter - für den Browser bleibt es ein Ursprung',
              'Er ersetzt Spring Boot',
              'Er speichert Antworten zwischen',
            ],
            richtig: 1,
            erklaerung: 'Der Browser spricht nur mit localhost:5173; Vite reicht /api intern an localhost:8080 weiter.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Frontend und Backend sind getrennte Programme, die nur über HTTP und JSON reden.',
          <>
            <Code>fetch</Code> + <Code>response.ok</Code> + <Code>response.json()</Code> - 4xx/5xx sind
            keine Exceptions.
          </>,
          'Verschiedene Ports sind verschiedene Ursprünge: ohne Erlaubnis blockiert der Browser (CORS).',
          <>
            Beim Entwickeln löst der Vite-Proxy das Problem, in Produktion nginx; alternativ{' '}
            <Code>@CrossOrigin</Code> bzw. <Code>WebMvcConfigurer</Code>.
          </>,
        ]}
      />
    </>
  )
}
