import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './SpringBeans.code'

/**
 * CHAPTER 8.2 - Beans & dependency injection
 * Spring creates the objects and passes them where they are needed.
 */
export function SpringBeans() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Der Controller braucht einen <Code>GreetingService</Code> - aber nirgends steht{' '}
          <Code>new GreetingService()</Code>. Spring legt das Objekt an und reicht es in den
          Konstruktor. Klapp oben „2 Beans · 1 Endpunkte“ auf: Dort steht, wer wen bekommt.
        </P>
        <TryIt modus="spring" id="spring-beans-einstieg" {...beispiele['spring-beans-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Das Problem mit new">
        <P>
          In einem echten Backend hängen Klassen voneinander ab: Der Controller braucht einen
          Service, der Service ein Repository, das Repository eine Datenbankverbindung. Baut jede
          Klasse selbst, was sie braucht, entsteht so etwas:
        </P>
        <CodeBlock code={codeBloecke.ohneSpring} titel="TodoController.java - ohne Spring" />
        <P>
          Der Controller muss plötzlich wissen, wie man eine Datenbank anschließt. Tauschen kann man
          nichts - auch nicht für einen Test. Spring dreht das um: Jede Klasse <em>sagt</em> nur, was
          sie braucht, und jemand anderes reicht es herein. Das heißt{' '}
          <strong>Dependency Injection</strong> (Abhängigkeiten werden „eingespritzt“), und der
          „jemand“ ist der <strong>Spring-Container</strong>.
        </P>
        <CodeBlock code={codeBloecke.mitSpring} titel="TodoController.java - mit Spring" />
      </Abschnitt>

      <Abschnitt titel="Beans: Objekte, die Spring verwaltet">
        <P>
          Ein Objekt, das Spring anlegt und verwaltet, heißt <strong>Bean</strong>. Beim Start sucht
          Spring alle Klassen mit einer dieser Annotationen und macht aus jeder genau eine Bean:
        </P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Annotation</th>
                <th className="py-2">wofür</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[
                ['@Component', 'irgendeine Bean - die allgemeine Form'],
                ['@Service', 'Geschäftslogik'],
                ['@Repository', 'Datenzugriff'],
                ['@RestController', 'beantwortet HTTP-Anfragen'],
                ['@Configuration', 'enthält @Bean-Methoden'],
              ].map(([annotation, wofuer]) => (
                <tr key={annotation}>
                  <td className="py-2 pr-4 font-mono text-xs">{annotation}</td>
                  <td className="py-2">{wofuer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Technisch machen <Code>@Service</Code> und <Code>@Repository</Code> dasselbe wie{' '}
          <Code>@Component</Code> - der Name sagt Menschen, welche Rolle die Klasse spielt. Der Name
          der Bean ist der Klassenname mit kleinem Anfangsbuchstaben: <Code>greetingService</Code>.
        </P>
        <Hinweis variante="info">
          Hat eine Klasse genau einen Konstruktor, braucht es keine weitere Annotation: Spring nimmt
          ihn und sucht für <em>jeden Parameter</em> eine passende Bean - passend heißt: vom selben
          Typ, einer Unterklasse oder einer Klasse, die das Interface implementiert.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Jede Bean gibt es genau einmal">
        <P>
          Beide Controller bekommen denselben <Code>VisitCounter</Code> - nicht zwei Kopien. Beans
          sind standardmäßig <strong>Singletons</strong>: ein Objekt für die ganze Anwendung. Schick
          die Anfragen ruhig öfter und beobachte den Zähler.
        </P>
        <TryIt modus="spring" id="spring-beans-singleton" {...beispiele['spring-beans-singleton']} />
        <Hinweis variante="warnung">
          Weil alle Anfragen dieselbe Bean benutzen - in einem echten Server sogar gleichzeitig aus
          mehreren Threads -, sollten Beans möglichst <strong>keinen veränderlichen Zustand</strong>{' '}
          haben. Daten gehören in die Datenbank (<Verweis nr="8.5" />), nicht in Felder eines
          Services.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Wenn Spring nichts findet">
        <P>
          <Code>FriendlyGreeter</Code> implementiert zwar <Code>Greeter</Code>, trägt aber keine
          Annotation - also ist es keine Bean. Spring bricht den Start ab und erklärt ziemlich genau,
          was fehlt. Diese Meldung wirst du in echten Projekten oft sehen:
        </P>
        <TryIt modus="spring" id="spring-beans-fehlt" {...beispiele['spring-beans-fehlt']} />
        <P>Die Lösung: <Code>@Component</Code> über <Code>FriendlyGreeter</Code>.</P>
      </Abschnitt>

      <Abschnitt titel="Wenn Spring zu viel findet">
        <P>Jetzt gibt es zwei Beans vom Typ <Code>Greeter</Code>. Welche soll der Controller bekommen?</P>
        <TryIt modus="spring" id="spring-beans-zwei" {...beispiele['spring-beans-zwei']} />
        <P>Spring schlägt selbst drei Lösungen vor - hier sind alle drei auf einmal:</P>
        <Liste>
          <li>
            <Code>@Primary</Code> an einer Bean: Sie gewinnt, wenn nur eine gebraucht wird.
          </li>
          <li>
            <Code>@Qualifier("germanGreeter")</Code> am Parameter: genau diese Bean, per Name.
          </li>
          <li>
            <Code>{'List<Greeter>'}</Code> als Parameter: alle Beans des Typs auf einmal.
          </li>
        </Liste>
        <TryIt modus="spring" id="spring-beans-primary" {...beispiele['spring-beans-primary']} />
      </Abschnitt>

      <Abschnitt titel="@Bean: fremde Klassen zu Beans machen">
        <P>
          Klassen aus Bibliotheken kannst du nicht mit <Code>@Component</Code> beschriften. Für sie
          gibt es <Code>@Bean</Code>-Methoden in einer <Code>@Configuration</Code>-Klasse: Spring ruft
          die Methode einmal auf, und der Rückgabewert wird eine Bean. Auch Parameter solcher
          Methoden werden injiziert.
        </P>
        <P>
          Ein Sonderfall ist <Code>CommandLineRunner</Code>: Spring führt jede Bean dieses Typs
          einmal <em>nach</em> dem Start aus - ideal für Testdaten. Die Ausgabe steht in der Konsole
          nach „Started …“.
        </P>
        <TryIt modus="spring" id="spring-beans-bean" {...beispiele['spring-beans-bean']} />
      </Abschnitt>

      <Abschnitt titel="Konstruktor statt @Autowired">
        <P>
          In älteren Projekten siehst du oft Feld-Injektion mit <Code>@Autowired</Code>. Sie
          funktioniert, hat aber Nachteile:
        </P>
        <CodeBlock code={codeBloecke.feld} titel="nicht empfohlen" />
        <P>
          Mit einem Konstruktor ist das Feld <Code>final</Code>, jede Abhängigkeit ist in der
          Signatur sichtbar - und ein Test braucht gar kein Spring:
        </P>
        <CodeBlock code={codeBloecke.test} titel="TodoControllerTest.java" />
        <P>
          Und ein Kreis ist sofort sichtbar: Brauchen sich zwei Beans gegenseitig im Konstruktor,
          kann keine zuerst entstehen. Spring bricht ab:
        </P>
        <TryIt modus="spring" id="spring-beans-kreis" {...beispiele['spring-beans-kreis']} />
        <CodeBlock code={codeBloecke.reactVergleich} titel="Vergleich mit React Context" />
        <P>
          Die Idee kennst du aus <Verweis nr="4.6" />: Etwas wird an einer Stelle bereitgestellt und
          dort benutzt, wo es gebraucht wird - ohne es durch alle Ebenen durchzureichen.
        </P>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="spring"
          id="spring-beans-uebung"
          {...beispiele['spring-beans-uebung']}
          aufgabe={
            <>
              <p>
                Der Controller baut sich seinen <Code>PriceService</Code> selbst - mit dem falschen
                Rabatt. Stelle auf Dependency Injection um:
              </p>
              <Liste>
                <li>
                  <Code>PriceService</Code> und beide Rabatt-Klassen werden Beans.
                </li>
                <li>Der Controller bekommt den Service über seinen Konstruktor.</li>
                <li>
                  Es soll der <Code>StudentDiscount</Code> (20 % Rabatt) gelten:{' '}
                  <Code>GET /api/price?amount=100</Code> → <Code>80.0</Code>.
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was ist eine Bean?',
            antworten: [
              'Jedes Java-Objekt',
              'Ein Objekt, das Spring anlegt und verwaltet',
              'Eine Klasse mit Gettern und Settern',
              'Eine Datenbanktabelle',
            ],
            richtig: 1,
            erklaerung: 'Beans entstehen aus Klassen mit @Component/@Service/… oder aus @Bean-Methoden - Spring legt sie an und reicht sie weiter.',
          },
          {
            frage: 'Zwei Controller verlangen im Konstruktor einen CounterService. Wie viele CounterService-Objekte gibt es?',
            antworten: ['keins', 'eins', 'zwei', 'eins pro Anfrage'],
            richtig: 1,
            erklaerung: 'Beans sind standardmäßig Singletons: beide bekommen dasselbe Objekt.',
          },
          {
            frage: 'Zwei Beans implementieren dasselbe Interface, ein Konstruktor verlangt es. Was hilft NICHT?',
            antworten: ['@Primary an einer der Beans', '@Qualifier("name") am Parameter', 'List<Interface> als Parameter', '@Autowired am Konstruktor'],
            richtig: 3,
            erklaerung: '@Autowired sagt nur „bitte injizieren“ - welche der beiden gemeint ist, weiß Spring dann immer noch nicht.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Dependency Injection: Klassen erzeugen ihre Abhängigkeiten nicht selbst, sie bekommen sie gereicht.',
          <>
            Beans entstehen aus Klassen mit <Code>@Component</Code>, <Code>@Service</Code>,{' '}
            <Code>@Repository</Code>, <Code>@RestController</Code> - oder aus <Code>@Bean</Code>-Methoden.
          </>,
          'Injiziert wird über den Konstruktor, passend nach Typ. Jede Bean gibt es einmal (Singleton).',
          <>
            Keine Bean → „required a bean … that could not be found“. Mehrere → <Code>@Primary</Code>,{' '}
            <Code>@Qualifier</Code> oder <Code>List</Code>.
          </>,
          <>
            <Code>CommandLineRunner</Code>-Beans laufen einmal nach dem Start.
          </>,
        ]}
      />
    </>
  )
}
