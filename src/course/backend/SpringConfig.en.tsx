import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/ChapterLink'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './SpringConfig.code'

/**
 * CHAPTER 8.6 - Configuration, profiles & tests (English version)
 */
export function SpringConfig() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          Port, database address, version number: things like that do not belong in the code but in{' '}
          <Code>application.properties</Code>. The file is shown above the editor - change{' '}
          <Code>app.version</Code> or add <Code>app.max-todos=5</Code> and start again.
        </P>
        <TryIt mode="spring" id="spring-konfig-value" {...examples['spring-konfig-value']} />
      </Abschnitt>

      <Abschnitt titel="Reading values with @Value">
        <P>
          <Code>{'@Value("${key}")'}</Code> on a constructor parameter fetches a value from the
          configuration and converts it to the parameter’s type. A default follows a colon:{' '}
          <Code>{'${app.version:dev}'}</Code>. If a key without a default is missing, the application
          does not start - so a typo shows up right away.
        </P>
        <Hinweis variante="tipp">
          Placeholders may also appear in the properties file itself:{' '}
          <Code>{'app.greeting=Welcome to ${spring.application.name}'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Typed configuration: @ConfigurationProperties">
        <P>
          With more than two or three values, <Code>@Value</Code> gets messy. Better: a record that
          bundles all settings of one area. Spring fills it from all keys with the prefix -{' '}
          <Code>todo.max-open</Code> ends up in <Code>maxOpen</Code>. The record is then a completely
          normal bean that can be injected.
        </P>
        <TryIt mode="spring" id="spring-konfig-properties" {...examples['spring-konfig-properties']} />
        <Hinweis variante="info">
          For Spring to find such records, the main class carries{' '}
          <Code>@ConfigurationPropertiesScan</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Profiles: dev, test, prod">
        <P>
          On your machine no real email should be sent, on the server it should. That is what{' '}
          <strong>profiles</strong> are for. Beans with <Code>@Profile("dev")</Code> only exist while
          the profile is active; <Code>@Profile("!dev")</Code> means “in all others”. Which profiles
          are active is set in <Code>spring.profiles.active</Code>.
        </P>
        <TryIt mode="spring" id="spring-konfig-profile" {...examples['spring-konfig-profile']} />
        <P>
          Change <Code>spring.profiles.active=dev</Code> to <Code>prod</Code>: now the{' '}
          <Code>SmtpMailSender</Code> is used, the test data is missing, and <Code>mail.host</Code>{' '}
          comes from the upper part of the file. The block after <Code>#---</Code> only applies to
          the profile <Code>dev</Code>. Separate files per profile are just as common:
        </P>
        <CodeBlock code={codeBloecke.files} title="resources/" language="config" />
        <CodeBlock code={codeBloecke.starten} title="Terminal" />
      </Abschnitt>

      <Abschnitt titel="Environment variables beat the file">
        <P>Configuration comes from many sources. Higher up in this list wins:</P>
        <CodeBlock code={codeBloecke.reihenfolge} title="Order" language="config" />
        <P>
          <strong>Environment variables</strong> are especially important: Spring translates every
          key into a variable name automatically - dots become underscores, everything upper case:
        </P>
        <CodeBlock code={codeBloecke.umgebung} title="property ⇄ environment variable" language="config" />
        <P>
          This is exactly how a container will later get its database address and password without
          them being in the image (<Verweis nr="8.10" />). That is why passwords never belong in a
          properties file that goes into Git.
        </P>
      </Abschnitt>

      <Abschnitt titel="Testing Spring applications">
        <P>
          In real projects controllers are tested with <strong>MockMvc</strong>: it sends requests to
          the application without a running server and checks status and JSON. With{' '}
          <Code>@WebMvcTest</Code> only the web layer starts; everything below is replaced by
          stand-ins (<Code>@MockitoBean</Code>) - you know the idea from <Verweis nr="5.8" />.
        </P>
        <CodeBlock code={codeBloecke.mockMvc} title="TodoControllerTest.java" />
        <P>
          <Code>@SpringBootTest</Code>, on the other hand, starts the <em>whole</em> application,
          including the database - slower, but closer to reality:
        </P>
        <CodeBlock code={codeBloecke.springBootTest} title="TodoApiIT.java" />
        <P>
          The tests of the exercises in this part work just like a <Code>@SpringBootTest</Code>: every
          test starts a fresh application, sends requests and compares the answers.
        </P>
        <CodeBlock code={codeBloecke.kurs} title="the same test.http" />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          mode="spring"
          id="spring-konfig-uebung"
          {...examples['spring-konfig-uebung']}
          task={
            <>
              <p>
                The greeting is hard-coded. Take it from the configuration (the properties above the
                editor are already there):
              </p>
              <Liste>
                <li>
                  Instead of “Hello”, the value of <Code>app.greeting</Code> comes first.
                </li>
                <li>
                  If <Code>app.shout</Code> is <Code>true</Code>, the whole answer is in upper case. If
                  the key is missing, <Code>false</Code> applies.
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
        questions={[
          {
            question: 'What does @Value("${app.max:10}") mean?',
            answers: ['app.max must be exactly 10', 'The value of app.max - or 10 if the key is missing', 'app.max is set to 10', 'At most 10 values'],
            correct: 1,
            explanation: 'The default follows the colon.',
          },
          {
            question: 'application.properties says server.port=8080, SERVER_PORT=9090 is set at startup. Which port applies?',
            answers: ['8080', '9090', 'Both', 'The application does not start'],
            correct: 1,
            explanation: 'Environment variables come before the properties file in the order.',
          },
          {
            question: 'A bean has @Profile("dev"), the active profile is "prod". What happens?',
            answers: ['The bean is created', 'The bean does not exist', 'The application does not start', 'The bean is created anew on every access'],
            correct: 1,
            explanation: 'Profile beans only exist while their profile is active.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Settings belong in <Code>application.properties</Code>, read with{' '}
            <Code>{'@Value("${key:default}")'}</Code> or bundled with{' '}
            <Code>@ConfigurationProperties</Code>.
          </>,
          <>
            Profiles (<Code>spring.profiles.active</Code>, <Code>@Profile</Code>) switch beans and
            values per environment.
          </>,
          'Environment variables override the file: spring.datasource.url ⇄ SPRING_DATASOURCE_URL. Never put passwords into Git.',
          <>
            Tests: <Code>@WebMvcTest</Code> + MockMvc for controllers, <Code>@SpringBootTest</Code> for
            the whole application.
          </>,
        ]}
      />
    </>
  )
}
