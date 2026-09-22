import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './SpringBeans.code'

/**
 * CHAPTER 8.2 - Beans & dependency injection (English version)
 */
export function SpringBeans() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          The controller needs a <Code>GreetingService</Code> - but nowhere does it say{' '}
          <Code>new GreetingService()</Code>. Spring creates the object and passes it to the
          constructor. Open “2 beans · 1 endpoints” at the top: it shows who gets whom.
        </P>
        <TryIt modus="spring" id="spring-beans-einstieg" {...beispiele['spring-beans-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="The problem with new">
        <P>
          In a real backend, classes depend on each other: the controller needs a service, the
          service a repository, the repository a database connection. If every class builds what it
          needs itself, you get something like this:
        </P>
        <CodeBlock code={codeBloecke.ohneSpring} titel="TodoController.java - without Spring" />
        <P>
          Suddenly the controller has to know how to connect to a database. Nothing can be swapped -
          not even for a test. Spring turns this around: every class only <em>says</em> what it
          needs, and someone else passes it in. This is called <strong>dependency injection</strong>,
          and the “someone” is the <strong>Spring container</strong>.
        </P>
        <CodeBlock code={codeBloecke.mitSpring} titel="TodoController.java - with Spring" />
      </Abschnitt>

      <Abschnitt titel="Beans: objects managed by Spring">
        <P>
          An object that Spring creates and manages is called a <strong>bean</strong>. At startup,
          Spring looks for all classes with one of these annotations and turns each one into exactly
          one bean:
        </P>
        <Tabelle
          kopf={['Annotation', 'for']}
          spalten={['font-mono text-xs']}
          zeilen={[
            ['@Component', 'any bean - the general form'],
            ['@Service', 'business logic'],
            ['@Repository', 'data access'],
            ['@RestController', 'answers HTTP requests'],
            ['@Configuration', 'contains @Bean methods'],
          ]}
        />
        <P>
          Technically <Code>@Service</Code> and <Code>@Repository</Code> do the same as{' '}
          <Code>@Component</Code> - the name tells humans which role the class plays. The bean’s name
          is the class name with a lower-case first letter: <Code>greetingService</Code>.
        </P>
        <Hinweis variante="info">
          If a class has exactly one constructor, no further annotation is needed: Spring uses it and
          looks for a matching bean for <em>every parameter</em> - matching means: of the same type,
          a subclass or a class that implements the interface.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Every bean exists exactly once">
        <P>
          Both controllers get the same <Code>VisitCounter</Code> - not two copies. By default beans
          are <strong>singletons</strong>: one object for the whole application. Send the requests
          a few more times and watch the counter.
        </P>
        <TryIt modus="spring" id="spring-beans-singleton" {...beispiele['spring-beans-singleton']} />
        <Hinweis variante="warnung">
          Because all requests use the same bean - in a real server even at the same time from
          several threads - beans should have <strong>no changing state</strong> if possible. Data
          belongs in the database (<Verweis nr="8.5" />), not in fields of a service.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="When Spring finds nothing">
        <P>
          <Code>FriendlyGreeter</Code> implements <Code>Greeter</Code>, but carries no annotation -
          so it is not a bean. Spring stops the start and explains quite precisely what is missing.
          You will see this message a lot in real projects:
        </P>
        <TryIt modus="spring" id="spring-beans-fehlt" {...beispiele['spring-beans-fehlt']} />
        <P>The fix: <Code>@Component</Code> on <Code>FriendlyGreeter</Code>.</P>
      </Abschnitt>

      <Abschnitt titel="When Spring finds too much">
        <P>Now there are two beans of type <Code>Greeter</Code>. Which one should the controller get?</P>
        <TryIt modus="spring" id="spring-beans-zwei" {...beispiele['spring-beans-zwei']} />
        <P>Spring suggests three fixes itself - here are all three at once:</P>
        <Liste>
          <li>
            <Code>@Primary</Code> on one bean: it wins when only one is needed.
          </li>
          <li>
            <Code>@Qualifier("germanGreeter")</Code> on the parameter: exactly this bean, by name.
          </li>
          <li>
            <Code>{'List<Greeter>'}</Code> as the parameter: all beans of the type at once.
          </li>
        </Liste>
        <TryIt modus="spring" id="spring-beans-primary" {...beispiele['spring-beans-primary']} />
      </Abschnitt>

      <Abschnitt titel="@Bean: turning other classes into beans">
        <P>
          You cannot put <Code>@Component</Code> on classes from libraries. For them there are{' '}
          <Code>@Bean</Code> methods in a <Code>@Configuration</Code> class: Spring calls the method
          once, and the return value becomes a bean. Parameters of such methods are injected too.
        </P>
        <P>
          A special case is <Code>CommandLineRunner</Code>: Spring runs every bean of this type once{' '}
          <em>after</em> the start - ideal for test data. The output appears in the console after
          “Started …”.
        </P>
        <TryIt modus="spring" id="spring-beans-bean" {...beispiele['spring-beans-bean']} />
      </Abschnitt>

      <Abschnitt titel="Constructor instead of @Autowired">
        <P>
          In older projects you will often see field injection with <Code>@Autowired</Code>. It
          works, but has drawbacks:
        </P>
        <CodeBlock code={codeBloecke.feld} titel="not recommended" />
        <P>
          With a constructor the field is <Code>final</Code>, every dependency is visible in the
          signature - and a test does not need Spring at all:
        </P>
        <CodeBlock code={codeBloecke.test} titel="TodoControllerTest.java" />
        <P>
          And a cycle becomes visible right away: if two beans need each other in their
          constructors, none of them can be created first. Spring stops:
        </P>
        <TryIt modus="spring" id="spring-beans-kreis" {...beispiele['spring-beans-kreis']} />
        <CodeBlock code={codeBloecke.reactVergleich} titel="Compared with React context" />
        <P>
          You know the idea from <Verweis nr="4.6" />: something is provided in one place and used
          wherever it is needed - without passing it through all levels.
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="spring"
          id="spring-beans-uebung"
          {...beispiele['spring-beans-uebung']}
          aufgabe={
            <>
              <p>
                The controller builds its own <Code>PriceService</Code> - with the wrong discount.
                Switch to dependency injection:
              </p>
              <Liste>
                <li>
                  <Code>PriceService</Code> and both discount classes become beans.
                </li>
                <li>The controller gets the service through its constructor.</li>
                <li>
                  The <Code>StudentDiscount</Code> (20 % off) should apply:{' '}
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
            frage: 'What is a bean?',
            antworten: ['Any Java object', 'An object that Spring creates and manages', 'A class with getters and setters', 'A database table'],
            richtig: 1,
            erklaerung: 'Beans come from classes with @Component/@Service/… or from @Bean methods - Spring creates them and passes them on.',
          },
          {
            frage: 'Two controllers ask for a CounterService in their constructors. How many CounterService objects are there?',
            antworten: ['none', 'one', 'two', 'one per request'],
            richtig: 1,
            erklaerung: 'By default beans are singletons: both get the same object.',
          },
          {
            frage: 'Two beans implement the same interface, a constructor asks for it. What does NOT help?',
            antworten: ['@Primary on one of the beans', '@Qualifier("name") on the parameter', 'List<Interface> as the parameter', '@Autowired on the constructor'],
            richtig: 3,
            erklaerung: '@Autowired only says “please inject” - Spring still does not know which of the two is meant.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Dependency injection: classes do not create their dependencies themselves, they get them passed in.',
          <>
            Beans come from classes with <Code>@Component</Code>, <Code>@Service</Code>,{' '}
            <Code>@Repository</Code>, <Code>@RestController</Code> - or from <Code>@Bean</Code> methods.
          </>,
          'Injection happens through the constructor, matched by type. Every bean exists once (singleton).',
          <>
            No bean → “required a bean … that could not be found”. Several → <Code>@Primary</Code>,{' '}
            <Code>@Qualifier</Code> or <Code>List</Code>.
          </>,
          <>
            <Code>CommandLineRunner</Code> beans run once after the start.
          </>,
        ]}
      />
    </>
  )
}
