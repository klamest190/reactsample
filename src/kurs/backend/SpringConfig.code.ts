import { http, java, js, properties } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Code for chapter 8.6 - Configuration, profiles & tests. */

const APP = java`
  @SpringBootApplication
  @ConfigurationPropertiesScan
  public class TodoApplication {
    public static void main(String[] args) {
      SpringApplication.run(TodoApplication.class, args);
    }
  }
`
const withApp = (code: string) => `${APP}\n\n${code}`

export const beispiele = {
  'spring-konfig-value': {
    code: withApp(java`
      @RestController
      class InfoController {
        private final String name;
        private final String version;
        private final int maxTodos;

        InfoController(@Value("\${spring.application.name}") String name,
                       @Value("\${app.version:dev}") String version,       // ":dev" = default value
                       @Value("\${app.max-todos:100}") int maxTodos) {     // text → int
          this.name = name;
          this.version = version;
          this.maxTodos = maxTodos;
        }

        @GetMapping("/api/info")
        Map<String, Object> info() {
          return Map.of("name", name, "version", version, "maxTodos", maxTodos);
        }
      }
    `),
    properties: properties`
      spring.application.name=todo-api
      server.port=8080
      app.version=1.4.2
      # app.max-todos is missing - so the default 100 applies
    `,
    requests: http`
      GET /api/info
      → 200 {"name": "todo-api", "version": "1.4.2", "maxTodos": 100}
    `,
  },
  'spring-konfig-properties': {
    code: withApp(java`
      // All settings of one area in one typed object - instead of many @Value.
      @ConfigurationProperties(prefix = "todo")
      record TodoProperties(int maxOpen, String defaultTitle) {}

      @Service
      class TodoService {
        private final TodoProperties props;
        private final List<String> open = new ArrayList<>();

        TodoService(TodoProperties props) {
          this.props = props;
        }

        String add(String title) {
          if (open.size() >= props.maxOpen()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "At most " + props.maxOpen() + " open todos");
          }
          String name = title == null || title.isBlank() ? props.defaultTitle() : title;
          open.add(name);
          return name;
        }
      }

      @RestController
      class TodoController {
        private final TodoService service;

        TodoController(TodoService service) {
          this.service = service;
        }

        @PostMapping("/api/todos")
        String add(@RequestParam(required = false) String title) {
          return service.add(title);
        }
      }
    `),
    properties: properties`
      # todo.max-open and todo.maxOpen mean the same ("relaxed binding")
      todo.max-open=2
      todo.default-title=Untitled
      server.error.include-message=always
    `,
    requests: http`
      POST /api/todos?title=Milk
      → 200 "Milk"
      POST /api/todos
      → 200 "Untitled"
      POST /api/todos?title=Bread
      → 409 {"message": "At most 2 open todos"}
    `,
  },
  'spring-konfig-profile': {
    code: withApp(java`
      interface MailSender {
        String send(String to);
      }

      // Only in the profile "dev": nothing is really sent.
      @Component
      @Profile("dev")
      class FakeMailSender implements MailSender {
        public String send(String to) { return "(pretending to mail " + to + ")"; }
      }

      // In every other profile.
      @Component
      @Profile("!dev")
      class SmtpMailSender implements MailSender {
        private final String host;
        SmtpMailSender(@Value("\${mail.host}") String host) { this.host = host; }
        public String send(String to) { return "mail to " + to + " via " + host; }
      }

      @Configuration
      @Profile("dev")
      class DevData {
        @Bean
        CommandLineRunner hello() {
          return args -> System.out.println("DEV: test data loaded");
        }
      }

      @RestController
      class MailController {
        private final MailSender sender;
        MailController(MailSender sender) { this.sender = sender; }

        @PostMapping("/api/mail")
        String mail(@RequestParam String to) { return sender.send(to); }
      }
    `),
    properties: properties`
      spring.profiles.active=dev
      mail.host=smtp.example.com

      #---
      # This block only counts when the profile "dev" is active:
      spring.config.activate.on-profile=dev
      mail.host=localhost
    `,
    requests: http`
      POST /api/mail?to=ada@example.com
      → 200 "(pretending to mail ada@example.com)"
    `,
  },
  'spring-konfig-uebung': {
    tipps: {
      de: [
        'Werte aus den Properties bekommst du per Konstruktor-Parameter: `@Value("${app.greeting}") String greeting`.',
        'Für `app.shout` brauchst du einen Standardwert, falls die Zeile fehlt: `@Value("${app.shout:false}") boolean shout`.',
        'Zum Schluss: `String text = greeting + ", " + name + "!";` und bei `shout` `text.toUpperCase()` zurückgeben.',
      ],
      en: [
        'You get values from the properties as constructor parameters: `@Value("${app.greeting}") String greeting`.',
        'For `app.shout` you need a default in case the line is missing: `@Value("${app.shout:false}") boolean shout`.',
        'Finally: `String text = greeting + ", " + name + "!";` and return `text.toUpperCase()` if `shout` is set.',
      ],
    },
    code: withApp(java`
      @RestController
      class GreetingController {

        @GetMapping("/api/greet")
        String greet(@RequestParam(defaultValue = "World") String name) {
          return "Hello, " + name + "!";
        }
      }
    `),
    loesung: withApp(java`
      @RestController
      class GreetingController {
        private final String greeting;
        private final boolean shout;

        GreetingController(@Value("\${app.greeting}") String greeting,
                           @Value("\${app.shout:false}") boolean shout) {
          this.greeting = greeting;
          this.shout = shout;
        }

        @GetMapping("/api/greet")
        String greet(@RequestParam(defaultValue = "World") String name) {
          String text = greeting + ", " + name + "!";
          return shout ? text.toUpperCase() : text;
        }
      }
    `),
    properties: properties`
      app.greeting=Moin
      app.shout=true
    `,
    tests: [
      {
        name: { de: 'GET /api/greet?name=Ada → "MOIN, ADA!"', en: 'GET /api/greet?name=Ada → "MOIN, ADA!"' },
        http: 'GET /api/greet?name=Ada\n→ 200 "MOIN, ADA!"',
      },
      {
        name: { de: 'Ohne name → "MOIN, WORLD!"', en: 'Without name → "MOIN, WORLD!"' },
        http: 'GET /api/greet\n→ 200 "MOIN, WORLD!"',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  reihenfolge: js`
    (highest priority first)
    1. command line          java -jar app.jar --server.port=9090
    2. environment variables SERVER_PORT=9090
    3. application-dev.properties  (when the profile "dev" is active)
    4. application.properties
    5. @Value("\${…:default}")   the default in the code
  `,
  umgebung: js`
    spring.datasource.url       ⇄  SPRING_DATASOURCE_URL
    spring.datasource.password  ⇄  SPRING_DATASOURCE_PASSWORD
    server.port                 ⇄  SERVER_PORT
    todo.max-open               ⇄  TODO_MAXOPEN
  `,
  dateien: js`
    src/main/resources/
    ├── application.properties         ← always
    ├── application-dev.properties     ← only with the profile "dev"
    └── application-prod.properties    ← only with the profile "prod"
  `,
  starten: js`
    $ ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
    $ java -jar target/todo-api.jar --spring.profiles.active=prod
    $ SPRING_PROFILES_ACTIVE=prod java -jar target/todo-api.jar
  `,
  mockMvc: java`
    @WebMvcTest(TodoController.class)       // starts only the web layer
    class TodoControllerTest {

      @Autowired MockMvc mvc;               // sends requests without a real server
      @MockitoBean TodoService service;     // a stand-in instead of the real service

      @Test
      void unknownTodoIs404() throws Exception {
        when(service.find(7L)).thenThrow(new TodoNotFoundException(7));

        mvc.perform(get("/api/todos/7"))
           .andExpect(status().isNotFound());
      }

      @Test
      void createReturns201() throws Exception {
        when(service.create("Milk")).thenReturn(new Todo(1L, "Milk", false));

        mvc.perform(post("/api/todos")
               .contentType(MediaType.APPLICATION_JSON)
               .content("{\"title\": \"Milk\"}"))
           .andExpect(status().isCreated())
           .andExpect(jsonPath("$.title").value("Milk"));
      }
    }
  `,
  springBootTest: java`
    @SpringBootTest                         // the WHOLE application, with database
    @AutoConfigureMockMvc
    class TodoApiIT {
      @Autowired MockMvc mvc;

      @Test
      void createAndList() throws Exception {
        mvc.perform(post("/api/todos").contentType(MediaType.APPLICATION_JSON).content("{\"title\": \"Milk\"}"))
           .andExpect(status().isCreated());
        mvc.perform(get("/api/todos"))
           .andExpect(jsonPath("$[0].title").value("Milk"));
      }
    }
  `,
  kurs: http`
    # The same test in the notation of this course:
    POST /api/todos
    {"title": "Milk"}
    → 201

    GET /api/todos
    → 200 [{"title": "Milk"}]
  `,
}
