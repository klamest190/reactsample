import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './SpringConfig.code'

/**
 * CHAPTER 8.6 - Configuration, profiles & tests
 * Settings outside the code, different environments, and how Spring apps are tested.
 */
export function SpringConfig() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Port, Datenbank-Adresse, Versionsnummer: So etwas gehört nicht in den Code, sondern in die{' '}
          <Code>application.properties</Code>. Über dem Editor steht die Datei - ändere{' '}
          <Code>app.version</Code> oder ergänze <Code>app.max-todos=5</Code> und starte neu.
        </P>
        <TryIt modus="spring" id="spring-konfig-value" {...beispiele['spring-konfig-value']} />
      </Abschnitt>

      <Abschnitt titel="Werte lesen mit @Value">
        <P>
          <Code>{'@Value("${schluessel}")'}</Code> an einem Konstruktor-Parameter holt einen Wert aus
          der Konfiguration und wandelt ihn in den Typ des Parameters um. Nach einem Doppelpunkt
          steht ein Standardwert: <Code>{'${app.version:dev}'}</Code>. Fehlt ein Schlüssel ohne
          Standardwert, startet die Anwendung nicht - ein Tippfehler fällt also sofort auf.
        </P>
        <Hinweis variante="tipp">
          Auch in der Properties-Datei selbst dürfen Platzhalter stehen:{' '}
          <Code>{'app.greeting=Welcome to ${spring.application.name}'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Typisierte Konfiguration: @ConfigurationProperties">
        <P>
          Bei mehr als zwei, drei Werten wird <Code>@Value</Code> unübersichtlich. Besser: ein Record,
          der alle Einstellungen eines Bereichs bündelt. Spring füllt ihn aus allen Schlüsseln mit dem
          Präfix - <Code>todo.max-open</Code> landet in <Code>maxOpen</Code>. Der Record ist dann eine
          ganz normale Bean, die man injizieren kann.
        </P>
        <TryIt modus="spring" id="spring-konfig-properties" {...beispiele['spring-konfig-properties']} />
        <Hinweis variante="info">
          Damit Spring solche Records findet, steht an der Startklasse{' '}
          <Code>@ConfigurationPropertiesScan</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Profile: dev, test, prod">
        <P>
          Auf deinem Rechner soll keine echte E-Mail verschickt werden, auf dem Server schon. Dafür
          gibt es <strong>Profile</strong>. Beans mit <Code>@Profile("dev")</Code> existieren nur, wenn
          das Profil aktiv ist; <Code>@Profile("!dev")</Code> heißt „in allen anderen“. Welche Profile
          aktiv sind, steht in <Code>spring.profiles.active</Code>.
        </P>
        <TryIt modus="spring" id="spring-konfig-profile" {...beispiele['spring-konfig-profile']} />
        <P>
          Ändere <Code>spring.profiles.active=dev</Code> in <Code>prod</Code>: Jetzt wird der{' '}
          <Code>SmtpMailSender</Code> benutzt, die Testdaten fehlen, und <Code>mail.host</Code> kommt
          aus dem oberen Teil der Datei. Der Block nach <Code>#---</Code> gilt nur für das Profil{' '}
          <Code>dev</Code>. Genauso üblich sind eigene Dateien pro Profil:
        </P>
        <CodeBlock code={codeBloecke.dateien} titel="resources/" sprache="konfig" />
        <CodeBlock code={codeBloecke.starten} titel="Terminal" />
      </Abschnitt>

      <Abschnitt titel="Umgebungsvariablen schlagen die Datei">
        <P>
          Konfiguration kommt aus vielen Quellen. Weiter oben in dieser Liste gewinnt:
        </P>
        <CodeBlock code={codeBloecke.reihenfolge} titel="Reihenfolge" sprache="konfig" />
        <P>
          Besonders wichtig sind <strong>Umgebungsvariablen</strong>: Spring übersetzt jeden
          Schlüssel automatisch in einen Variablennamen - Punkte werden Unterstriche, alles groß:
        </P>
        <CodeBlock code={codeBloecke.umgebung} titel="Property ⇄ Umgebungsvariable" sprache="konfig" />
        <P>
          Genau so bekommt ein Container später seine Datenbank-Adresse und sein Passwort, ohne dass
          sie im Image stehen (<Verweis nr="8.10" />). Passwörter gehören deshalb nie in eine
          Properties-Datei, die ins Git wandert.
        </P>
      </Abschnitt>

      <Abschnitt titel="Spring-Anwendungen testen">
        <P>
          Controller testet man in echten Projekten mit <strong>MockMvc</strong>: Es schickt Anfragen
          an die Anwendung, ohne dass ein Server läuft, und prüft Status und JSON. Mit{' '}
          <Code>@WebMvcTest</Code> startet nur die Web-Schicht; alles darunter wird durch Attrappen (
          <Code>@MockitoBean</Code>) ersetzt - die Idee kennst du aus <Verweis nr="5.8" />.
        </P>
        <CodeBlock code={codeBloecke.mockMvc} titel="TodoControllerTest.java" />
        <P>
          <Code>@SpringBootTest</Code> startet dagegen die <em>ganze</em> Anwendung, samt Datenbank -
          langsamer, aber näher an der Wirklichkeit:
        </P>
        <CodeBlock code={codeBloecke.springBootTest} titel="TodoApiIT.java" />
        <P>
          Die Tests der Übungen in diesem Teil funktionieren genau wie ein <Code>@SpringBootTest</Code>:
          Jeder Test startet eine frische Anwendung, schickt Anfragen und vergleicht die Antworten.
        </P>
        <CodeBlock code={codeBloecke.kurs} titel="derselbe Test.http" />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="spring"
          id="spring-konfig-uebung"
          {...beispiele['spring-konfig-uebung']}
          aufgabe={
            <>
              <p>
                Die Begrüßung ist fest im Code. Hole sie aus der Konfiguration (die Properties über dem
                Editor sind schon da):
              </p>
              <Liste>
                <li>
                  Statt „Hello“ steht der Wert von <Code>app.greeting</Code> vorne.
                </li>
                <li>
                  Ist <Code>app.shout</Code> <Code>true</Code>, kommt die ganze Antwort in
                  Großbuchstaben. Fehlt der Schlüssel, gilt <Code>false</Code>.
                </li>
                <li>
                  <Code>GET /api/greet?name=Ada</Code> → <Code>MOIN, ADA!</Code>
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was bedeutet @Value("${app.max:10}")?',
            antworten: [
              'app.max muss genau 10 sein',
              'Der Wert von app.max - oder 10, wenn der Schlüssel fehlt',
              'app.max wird auf 10 gesetzt',
              'Höchstens 10 Werte',
            ],
            richtig: 1,
            erklaerung: 'Nach dem Doppelpunkt steht der Standardwert.',
          },
          {
            frage: 'In application.properties steht server.port=8080, beim Start ist SERVER_PORT=9090 gesetzt. Welcher Port gilt?',
            antworten: ['8080', '9090', 'Beide', 'Die Anwendung startet nicht'],
            richtig: 1,
            erklaerung: 'Umgebungsvariablen stehen in der Reihenfolge über der Properties-Datei.',
          },
          {
            frage: 'Eine Bean hat @Profile("dev"), aktiv ist das Profil "prod". Was passiert?',
            antworten: ['Die Bean wird angelegt', 'Die Bean existiert nicht', 'Die Anwendung startet nicht', 'Die Bean wird bei jedem Zugriff neu angelegt'],
            richtig: 1,
            erklaerung: 'Profil-Beans gibt es nur, wenn ihr Profil aktiv ist.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Einstellungen gehören in <Code>application.properties</Code>, gelesen mit{' '}
            <Code>{'@Value("${key:default}")'}</Code> oder gebündelt mit{' '}
            <Code>@ConfigurationProperties</Code>.
          </>,
          <>
            Profile (<Code>spring.profiles.active</Code>, <Code>@Profile</Code>) schalten Beans und
            Werte je Umgebung um.
          </>,
          'Umgebungsvariablen überschreiben die Datei: spring.datasource.url ⇄ SPRING_DATASOURCE_URL. Passwörter nie ins Git.',
          <>
            Tests: <Code>@WebMvcTest</Code> + MockMvc für Controller, <Code>@SpringBootTest</Code> für
            die ganze Anwendung.
          </>,
        ]}
      />
    </>
  )
}
