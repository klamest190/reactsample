/**
 * Self-test of the Spring runtime - the cases.
 *
 *   npm run test:spring
 *
 * Every case is a small Spring application plus requests in `.http` notation
 * with the answer real Spring Boot would give (`→ status body`), and texts that
 * must (or must not) appear in the console. If everything here is green, the
 * course examples behave the way they would in a real Spring Boot application.
 */

import { check, parseHttp, requestText } from './http'
import { springStart } from './index'

type Case = {
  name: string
  code: string
  properties?: string
  /** Requests with expectations. */
  http?: string
  /** Texts that must appear in the console output (in this order). */
  output?: string[]
  /** Texts that must NOT appear. */
  notInOutput?: string[]
  /** The application must fail to start. */
  fails?: boolean
}

const APP = `
@SpringBootApplication
public class DemoApplication {
  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }
}
`

const cases: Case[] = [
  // --- Web basics ------------------------------------------------------------------
  {
    name: 'Hello controller with @RequestParam and default value',
    code: APP + `
@RestController
class HelloController {
  @GetMapping("/hello")
  String hello(@RequestParam(defaultValue = "World") String name) {
    return "Hello, " + name + "!";
  }
}`,
    http: `
GET /hello
→ 200 "Hello, World!"
GET /hello?name=Ada
→ 200 "Hello, Ada!"
POST /hello
→ 405
GET /hallo
→ 404`,
    output: ['Tomcat started on port 8080', 'Started DemoApplication'],
  },
  {
    name: 'server.port and a required @RequestParam',
    code: APP + `
@RestController
class SearchController {
  @GetMapping("/search")
  String search(@RequestParam String q, @RequestParam(required = false) Integer limit) {
    return q + ":" + limit;
  }
}`,
    properties: 'server.port=9090',
    http: `
GET /search?q=milk
→ 200 "milk:null"
GET /search?q=milk&limit=3
→ 200 "milk:3"
GET /search
→ 400
GET /search?q=a&limit=x
→ 400`,
    output: ['Tomcat initialized with port 9090', "Required request parameter 'q'"],
  },
  {
    name: 'CRUD with records, ResponseEntity and status codes',
    code: APP + `
record Todo(long id, String title, boolean done) {}
record TodoRequest(String title, boolean done) {}

@RestController
@RequestMapping("/api/todos")
class TodoController {
  private final Map<Long, Todo> todos = new LinkedHashMap<>();
  private final AtomicLong ids = new AtomicLong();

  @GetMapping
  List<Todo> all() { return new ArrayList<>(todos.values()); }

  @GetMapping("/{id}")
  ResponseEntity<Todo> one(@PathVariable Long id) {
    Todo todo = todos.get(id);
    return todo == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(todo);
  }

  @PostMapping
  ResponseEntity<Todo> create(@RequestBody TodoRequest request) {
    Todo todo = new Todo(ids.incrementAndGet(), request.title(), request.done());
    todos.put(todo.id(), todo);
    return ResponseEntity.created(URI.create("/api/todos/" + todo.id())).body(todo);
  }

  @PutMapping("/{id}")
  ResponseEntity<Todo> update(@PathVariable Long id, @RequestBody TodoRequest request) {
    if (!todos.containsKey(id)) return ResponseEntity.notFound().build();
    Todo todo = new Todo(id, request.title(), request.done());
    todos.put(id, todo);
    return ResponseEntity.ok(todo);
  }

  @DeleteMapping("/{id}")
  ResponseEntity<Void> delete(@PathVariable Long id) {
    return todos.remove(id) == null ? ResponseEntity.notFound().build() : ResponseEntity.noContent().build();
  }
}`,
    http: `
POST /api/todos
{"title": "Milk"}
→ 201 {"id": 1, "title": "Milk", "done": false}
POST /api/todos
{"title": "Bread", "done": true, "unknown": 5}
→ 201 {"id": 2, "done": true}
GET /api/todos
→ 200 [{"title": "Milk"}, {"title": "Bread"}]
PUT /api/todos/1
{"title": "Oat milk", "done": true}
→ 200 {"id": 1, "title": "Oat milk", "done": true}
PUT /api/todos/7
{"title": "x"}
→ 404
DELETE /api/todos/2
→ 204
DELETE /api/todos/2
→ 404
GET /api/todos
→ 200 [{"id": 1}]
POST /api/todos
{"title": "broken"
→ 400
POST /api/todos
→ 400`,
  },

  // --- Dependency injection ----------------------------------------------------------
  {
    name: 'Constructor injection: one singleton for everyone',
    code: APP + `
@Service
class Counter {
  private int count = 0;
  int next() { return ++count; }
}

@RestController
class AController {
  private final Counter counter;
  AController(Counter counter) { this.counter = counter; }
  @GetMapping("/a") int a() { return counter.next(); }
}

@RestController
class BController {
  private final Counter counter;
  BController(Counter counter) { this.counter = counter; }
  @GetMapping("/b") int b() { return counter.next(); }
}`,
    http: `
GET /a
→ 200 1
GET /b
→ 200 2
GET /a
→ 200 3`,
  },
  {
    name: 'Missing bean: APPLICATION FAILED TO START',
    code: APP + `
interface GreetingService { String greet(String name); }

class FriendlyGreeting implements GreetingService {
  public String greet(String name) { return "Hi " + name; }
}

@RestController
class GreetingController {
  private final GreetingService service;
  GreetingController(GreetingService service) { this.service = service; }
}`,
    fails: true,
    output: [
      'APPLICATION FAILED TO START',
      "Parameter 0 of constructor in GreetingController required a bean of type 'GreetingService' that could not be found.",
      "Consider defining a bean of type 'GreetingService' in your configuration.",
    ],
  },
  {
    name: 'Two candidates: ambiguous, then fixed with @Primary and @Qualifier',
    code: APP + `
interface Greeter { String greet(); }
@Component class English implements Greeter { public String greet() { return "Hello"; } }
@Component class German implements Greeter { public String greet() { return "Hallo"; } }

@RestController
class GreetingController {
  private final Greeter greeter;
  GreetingController(Greeter greeter) { this.greeter = greeter; }
}`,
    fails: true,
    output: ['required a single bean, but 2 were found:', '- english: defined in file [English.java]', 'Consider marking one of the beans as @Primary'],
  },
  {
    name: '@Primary, @Qualifier, parameter name and List<> injection',
    code: APP + `
interface Greeter { String greet(); }
@Component @Primary class English implements Greeter { public String greet() { return "Hello"; } }
@Component class German implements Greeter { public String greet() { return "Hallo"; } }
@Component class French implements Greeter { public String greet() { return "Bonjour"; } }

@RestController
class GreetingController {
  private final Greeter primary;
  private final Greeter qualified;
  private final Greeter french;
  private final List<Greeter> all;

  GreetingController(Greeter greeter, @Qualifier("german") Greeter other, Greeter french, List<Greeter> all) {
    this.primary = greeter;
    this.qualified = other;
    this.french = french;
    this.all = all;
  }

  @GetMapping("/greet")
  String greet() { return primary.greet() + " " + qualified.greet() + " " + all.size(); }
}`,
    http: `
GET /greet
→ 200 "Hello Hallo 3"`,
  },
  {
    name: 'A dependency cycle stops the start',
    code: APP + `
@Service class AService { AService(BService b) {} }
@Service class BService { BService(AService a) {} }`,
    fails: true,
    output: ['The dependencies of some of the beans in the application context form a cycle:', '|  AService defined in file [AService.java]', '|  BService defined in file [BService.java]'],
  },
  {
    name: '@Configuration with @Bean methods and a CommandLineRunner',
    code: APP + `
class Clock {
  private final String zone;
  Clock(String zone) { this.zone = zone; }
  String zone() { return zone; }
}

@Configuration
class AppConfig {
  @Bean
  Clock clock() { return new Clock("Europe/Berlin"); }

  @Bean
  CommandLineRunner hello(Clock clock) {
    return args -> System.out.println("Running in " + clock.zone());
  }
}`,
    output: ['Started DemoApplication', 'Running in Europe/Berlin'],
    notInOutput: ['Tomcat'],
  },
  {
    name: 'Field injection with @Autowired and @PostConstruct',
    code: APP + `
@Service class Repo { String name() { return "repo"; } }

@Service
class UsesRepo {
  @Autowired
  private Repo repo;

  @PostConstruct
  void init() { System.out.println("ready: " + repo.name()); }
}`,
    output: ['ready: repo', 'Started DemoApplication'],
  },
  {
    name: 'Two beans with the same name',
    code: APP + `
@Service("worker") class A {}
@Component("worker") class B {}`,
    fails: true,
    output: ["The bean 'worker'", 'overriding is disabled'],
  },

  // --- Configuration ---------------------------------------------------------------
  {
    name: '@Value, placeholders and defaults',
    code: APP + `
@RestController
class InfoController {
  private final String name;
  private final int max;
  private final String greeting;

  InfoController(@Value("\${app.name}") String name, @Value("\${app.max-items:10}") int max, @Value("\${app.greeting}") String greeting) {
    this.name = name;
    this.max = max;
    this.greeting = greeting;
  }

  @GetMapping("/info")
  String info() { return greeting + " " + name + " " + (max + 1); }
}`,
    properties: 'app.name=Todo\napp.greeting=Welcome to ${app.name}!',
    http: `
GET /info
→ 200 "Welcome to Todo! Todo 11"`,
  },
  {
    name: 'A missing placeholder stops the start',
    code: APP + `
@Component
class NeedsValue {
  NeedsValue(@Value("\${app.secret}") String secret) {}
}`,
    fails: true,
    output: ["Could not resolve placeholder 'app.secret'"],
  },
  {
    name: 'Profiles: @Profile beans and #--- documents',
    code: APP + `
interface Mailer { String send(); }
@Component @Profile("dev") class FakeMailer implements Mailer { public String send() { return "fake"; } }
@Component @Profile("!dev") class SmtpMailer implements Mailer { public String send() { return "smtp"; } }

@RestController
class MailController {
  private final Mailer mailer;
  private final String host;
  MailController(Mailer mailer, @Value("\${mail.host}") String host) { this.mailer = mailer; this.host = host; }
  @GetMapping("/mail") String mail() { return mailer.send() + "@" + host; }
}`,
    properties: 'spring.profiles.active=dev\nmail.host=smtp.example.com\n#---\nspring.config.activate.on-profile=dev\nmail.host=localhost',
    http: `
GET /mail
→ 200 "fake@localhost"`,
    output: ['The following 1 profile is active: "dev"'],
  },
  {
    name: '@ConfigurationProperties record',
    code: APP + `
@ConfigurationProperties(prefix = "app")
record AppProperties(String name, int maxItems) {}

@RestController
class PropsController {
  private final AppProperties props;
  PropsController(AppProperties props) { this.props = props; }
  @GetMapping("/props") AppProperties props() { return props; }
}`,
    properties: 'app.name=Todo\napp.max-items=5',
    http: `
GET /props
→ 200 {"name": "Todo", "maxItems": 5}`,
  },

  // --- JSON ---------------------------------------------------------------------------
  {
    name: 'JSON: getters decide, fields without getters stay private',
    code: APP + `
class User {
  private String name;
  private String password;
  private boolean admin;
  User(String name, String password, boolean admin) { this.name = name; this.password = password; this.admin = admin; }
  public String getName() { return name; }
  public boolean isAdmin() { return admin; }
}

class Secret {
  private String value = "x";
}

@RestController
class UserController {
  @GetMapping("/user") User user() { return new User("Ada", "geheim", true); }
  @GetMapping("/secret") Secret secret() { return new Secret(); }
}`,
    http: `
GET /user
→ 200 {"name": "Ada", "admin": true}
GET /secret
→ 500`,
    output: ['No serializer found for class Secret'],
  },
  {
    name: 'JSON: reading into a class with setters, enums and lists',
    code: APP + `
enum Priority { LOW, HIGH }

class Task {
  private String title;
  private Priority priority;
  private List<String> tags;
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public Priority getPriority() { return priority; }
  public void setPriority(Priority priority) { this.priority = priority; }
  public List<String> getTags() { return tags; }
  public void setTags(List<String> tags) { this.tags = tags; }
}

@RestController
class TaskController {
  @PostMapping("/tasks") Task echo(@RequestBody Task task) { return task; }
}`,
    http: `
POST /tasks
{"title": "Ship", "priority": "HIGH", "tags": ["a", "b"]}
→ 200 {"title": "Ship", "priority": "HIGH", "tags": ["a", "b"]}
POST /tasks
{"title": "Ship", "priority": "URGENT"}
→ 400`,
    output: ['not one of the values accepted for Enum class: [LOW, HIGH]'],
  },

  // --- Errors -------------------------------------------------------------------------
  {
    name: 'ResponseStatusException - message only with include-message',
    code: APP + `
@RestController
class OrderController {
  @GetMapping("/orders/{id}")
  String order(@PathVariable int id) {
    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order " + id + " not found");
  }
}`,
    properties: 'server.error.include-message=always',
    http: `
GET /orders/7
→ 404 {"status": 404, "error": "Not Found", "message": "Order 7 not found", "path": "/orders/7"}`,
    output: ['404 NOT_FOUND "Order 7 not found"'],
  },
  {
    name: '@ResponseStatus on an exception class, and an unexpected crash',
    code: APP + `
@ResponseStatus(HttpStatus.NOT_FOUND)
class TodoNotFoundException extends RuntimeException {
  TodoNotFoundException(long id) { super("Todo " + id + " not found"); }
}

@RestController
class TodoController {
  @GetMapping("/todos/{id}") String one(@PathVariable long id) { throw new TodoNotFoundException(id); }
  @GetMapping("/boom") String boom() { String s = null; return s.trim(); }
}`,
    http: `
GET /todos/3
→ 404
GET /boom
→ 500 {"status": 500, "error": "Internal Server Error"}`,
    output: ['Resolved [TodoNotFoundException: Todo 3 not found]', 'NullPointerException'],
  },
  {
    name: '@RestControllerAdvice with ProblemDetail and validation errors',
    code: APP + `
class TodoNotFoundException extends RuntimeException {
  TodoNotFoundException(long id) { super("Todo " + id + " not found"); }
}

record NewTodo(@NotBlank String title, @Size(max = 5, message = "at most {max} characters") String note, @Min(1) int priority) {}

@RestController
class TodoController {
  @GetMapping("/todos/{id}") String one(@PathVariable long id) { throw new TodoNotFoundException(id); }
  @PostMapping("/todos") String create(@Valid @RequestBody NewTodo todo) { return "ok"; }
}

@RestControllerAdvice
class ErrorHandler {
  @ExceptionHandler(TodoNotFoundException.class)
  ProblemDetail notFound(TodoNotFoundException e) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
    Map<String, String> errors = new LinkedHashMap<>();
    for (FieldError error : e.getBindingResult().getFieldErrors()) {
      errors.put(error.getField(), error.getDefaultMessage());
    }
    return ResponseEntity.badRequest().body(errors);
  }
}`,
    http: `
GET /todos/4
→ 404 {"title": "Not Found", "status": 404, "detail": "Todo 4 not found", "instance": "/todos/4"}
POST /todos
{"title": " ", "note": "too long", "priority": 0}
→ 400 {"title": "must not be blank", "note": "at most 5 characters", "priority": "must be greater than or equal to 1"}
POST /todos
{"title": "ok", "priority": 2}
→ 200 "ok"`,
  },
  {
    name: 'Ambiguous mapping stops the start',
    code: APP + `
@RestController
class A {
  @GetMapping("/x") String one() { return "1"; }
  @GetMapping("/x") String two() { return "2"; }
}`,
    fails: true,
    output: ['Ambiguous mapping'],
  },
  {
    name: 'main without SpringApplication.run: no server',
    code: `
@SpringBootApplication
public class DemoApplication {
  public static void main(String[] args) {
    System.out.println("forgot to start");
  }
}`,
    output: ['forgot to start', 'SpringApplication.run'],
  },

  // --- Spring Data JPA ------------------------------------------------------------------
  {
    name: 'JpaRepository: CRUD, derived queries and show-sql',
    code: APP + `
@Entity
class Todo {
  @Id @GeneratedValue
  private Long id;
  private String title;
  private boolean done;

  protected Todo() {}
  Todo(String title) { this.title = title; }

  public Long getId() { return id; }
  public String getTitle() { return title; }
  public boolean isDone() { return done; }
  public void setDone(boolean done) { this.done = done; }
}

interface TodoRepository extends JpaRepository<Todo, Long> {
  List<Todo> findByDoneFalse();
  List<Todo> findByTitleContainingIgnoreCase(String part);
  List<Todo> findAllByOrderByTitleAsc();
  long countByDone(boolean done);
}

@RestController
@RequestMapping("/api/todos")
class TodoController {
  private final TodoRepository repository;
  TodoController(TodoRepository repository) { this.repository = repository; }

  @GetMapping List<Todo> all() { return repository.findAll(); }
  @GetMapping("/open") List<Todo> open() { return repository.findByDoneFalse(); }
  @GetMapping("/search") List<Todo> search(@RequestParam String q) { return repository.findByTitleContainingIgnoreCase(q); }
  @GetMapping("/sorted") List<Todo> sorted() { return repository.findAllByOrderByTitleAsc(); }
  @GetMapping("/count") long done() { return repository.countByDone(true); }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  Todo create(@RequestBody Map<String, String> body) { return repository.save(new Todo(body.get("title"))); }

  @PatchMapping("/{id}/forget")
  Todo forget(@PathVariable Long id) {
    Todo todo = repository.findById(id).orElseThrow();
    todo.setDone(true);            // no save() - the change is lost
    return todo;
  }

  @PatchMapping("/{id}/done")
  Todo done(@PathVariable Long id) {
    Todo todo = repository.findById(id).orElseThrow();
    todo.setDone(true);
    return repository.save(todo);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable Long id) { repository.deleteById(id); }
}`,
    properties: 'spring.jpa.show-sql=true',
    http: `
POST /api/todos
{"title": "Milk"}
→ 201 {"id": 1, "title": "Milk", "done": false}
POST /api/todos
{"title": "Bread"}
→ 201 {"id": 2}
PATCH /api/todos/1/forget
→ 200 {"done": true}
GET /api/todos/open
→ 200 [{"title": "Milk"}, {"title": "Bread"}]
PATCH /api/todos/1/done
→ 200 {"done": true}
GET /api/todos/open
→ 200 [{"title": "Bread"}]
GET /api/todos/search?q=BRE
→ 200 [{"id": 2}]
GET /api/todos/sorted
→ 200 [{"title": "Bread"}, {"title": "Milk"}]
GET /api/todos/count
→ 200 1
DELETE /api/todos/2
→ 204
GET /api/todos
→ 200 [{"id": 1}]`,
    output: ['Found 1 JPA repository interface', 'Hibernate: insert into todo (done,title) values (?,?)', 'Hibernate: select t1_0.id,t1_0.done,t1_0.title from todo t1_0 where t1_0.done=false'],
  },
  {
    name: 'Spring Data checks method names at startup',
    code: APP + `
@Entity
class Todo {
  @Id @GeneratedValue private Long id;
  private String title;
}
interface TodoRepository extends JpaRepository<Todo, Long> {
  List<Todo> findByTitel(String titel);
}`,
    fails: true,
    output: ["No property 'titel' found for type 'Todo'"],
  },
  {
    name: 'An entity needs @Id',
    code: APP + `
@Entity
class Todo {
  private Long id;
}
interface TodoRepository extends JpaRepository<Todo, Long> {}`,
    fails: true,
    output: ['No identifier specified for entity: Todo'],
  },
]

// ---------------------------------------------------------------------------

export type RuntimeResult = { name: string; ok: boolean; message: string }

/** Runs all cases - without DOM or React, so it works on the command line too. */
export function springRuntimeCheck(): RuntimeResult[] {
  return cases.map((c) => {
    const fail = (message: string): RuntimeResult => ({ name: c.name, ok: false, message })
    const started = springStart(c.code, { language: 'en', properties: c.properties })
    const problems: string[] = []

    if (c.fails && started.server) problems.push('should not start, but did')
    if (!c.fails && started.failed) problems.push('did not start: ' + started.lines.filter((l) => l.typ === 'fehler' || l.typ === 'error').map((l) => l.text).join(' | '))

    if (started.server) {
      for (const step of parseHttp(c.http ?? '')) {
        const { response } = started.server.send(step.request)
        const mismatch = step.expectation ? check(response, step.expectation) : null
        if (mismatch) problems.push(`${requestText(step.request)} → ${mismatch.en}`)
      }
    }

    const output = (started.server ? started.server.app.lines : started.lines).map((l) => l.text).join('\n')
    let position = 0
    for (const expected of c.output ?? []) {
      const found = output.indexOf(expected, position)
      if (found < 0) problems.push(`output is missing ${JSON.stringify(expected)}`)
      else position = found
    }
    for (const unwanted of c.notInOutput ?? []) if (output.includes(unwanted)) problems.push(`output must not contain ${JSON.stringify(unwanted)}`)

    return problems.length ? fail(problems.join(' · ') + '\n--- output ---\n' + output) : { name: c.name, ok: true, message: '' }
  })
}
