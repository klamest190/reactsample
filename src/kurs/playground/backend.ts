import { java } from '../../lernen/quelltext'
import type { PlaygroundDaten } from './typen'

/**
 * Playground for part 8 (Spring Boot), run by the Java runtime plus src/spring/.
 * Every building block is a complete class and lands at the end of the file -
 * with its own names and paths, so that all of them can live side by side.
 */
export const backendPlayground: PlaygroundDaten = {
  teil: 'backend',
  modus: 'spring',
  hinweis: {
    de: 'Nach ▶ Starten läuft die Anwendung - unten schickst du Anfragen. Beans und Endpunkte stehen im aufklappbaren Server-Status. Docker hat eigene Editoren in den Kapiteln 8.8 bis 8.10.',
    en: 'After ▶ Start the application runs - send requests below. Beans and endpoints are listed in the expandable server status. Docker has its own editors in chapters 8.8 to 8.10.',
  },
  vorlagen: [
    {
      titel: { de: 'Hallo API', en: 'Hello API' },
      info: { de: 'Die Startklasse und ein Controller mit einem Endpunkt.', en: 'The main class and a controller with one endpoint.' },
      code: java`
        @SpringBootApplication
        public class PlaygroundApplication {
          public static void main(String[] args) {
            SpringApplication.run(PlaygroundApplication.class, args);
          }
        }

        @RestController
        class HelloController {
          @GetMapping("/hello")
          String hello(@RequestParam(defaultValue = "World") String name) {
            return "Hello, " + name + "!";
          }
        }
      `,
    },
    {
      titel: { de: 'ToDo-API mit Datenbank', en: 'Todo API with a database' },
      info: { de: 'Entity, Repository, Service und Controller - wie in Kapitel 8.5.', en: 'Entity, repository, service and controller - like in chapter 8.5.' },
      code: java`
        @SpringBootApplication
        public class PlaygroundApplication {
          public static void main(String[] args) {
            SpringApplication.run(PlaygroundApplication.class, args);
          }
        }

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
        }

        record NewTodo(@NotBlank String title) {}

        @RestController
        @RequestMapping("/api/todos")
        class TodoController {
          private final TodoRepository todos;

          TodoController(TodoRepository todos) {
            this.todos = todos;
          }

          @GetMapping
          List<Todo> all() { return todos.findAll(); }

          @GetMapping("/open")
          List<Todo> open() { return todos.findByDoneFalse(); }

          @PostMapping
          @ResponseStatus(HttpStatus.CREATED)
          Todo create(@Valid @RequestBody NewTodo body) { return todos.save(new Todo(body.title())); }

          @PatchMapping("/{id}/done")
          Todo done(@PathVariable Long id) {
            Todo todo = todos.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            todo.setDone(true);
            return todos.save(todo);
          }
        }
      `,
    },
    {
      titel: { de: 'Beans verdrahten', en: 'Wiring beans' },
      info: { de: 'Ein Interface, zwei Implementierungen, @Primary und ein CommandLineRunner.', en: 'An interface, two implementations, @Primary and a CommandLineRunner.' },
      code: java`
        @SpringBootApplication
        public class PlaygroundApplication {
          public static void main(String[] args) {
            SpringApplication.run(PlaygroundApplication.class, args);
          }
        }

        interface Greeter {
          String greet(String name);
        }

        @Component
        @Primary
        class EnglishGreeter implements Greeter {
          public String greet(String name) { return "Hello " + name; }
        }

        @Component
        class GermanGreeter implements Greeter {
          public String greet(String name) { return "Hallo " + name; }
        }

        @Configuration
        class Startup {
          @Bean
          CommandLineRunner greetAll(List<Greeter> greeters) {
            return args -> {
              for (Greeter greeter : greeters) System.out.println(greeter.greet("Ada"));
            };
          }
        }
      `,
    },
  ],
  gruppen: [
    {
      titel: { de: 'Web', en: 'Web' },
      bausteine: [
        {
          titel: { de: 'GET-Endpunkt', en: 'GET endpoint' },
          info: { de: 'Ein Controller mit @GetMapping und @PathVariable.', en: 'A controller with @GetMapping and @PathVariable.' },
          code: java`
            @RestController
            class SquareController {
              @GetMapping("/square/{n}")
              int square(@PathVariable int n) {
                return n * n;$0
              }
            }
          `,
          ort: 'klasse',
          kapitel: 'spring-start',
        },
        {
          titel: { de: 'CRUD-Controller', en: 'CRUD controller' },
          info: { de: 'Anlegen, lesen und löschen mit einer Map - Status 201, 204 und 404.', en: 'Create, read and delete with a map - status 201, 204 and 404.' },
          code: java`
            record Note(long id, String text) {}

            @RestController
            @RequestMapping("/api/notes")
            class NoteController {
              private final Map<Long, Note> notes = new LinkedHashMap<>();
              private final AtomicLong ids = new AtomicLong();

              @GetMapping
              List<Note> all() { return new ArrayList<>(notes.values()); }

              @PostMapping
              @ResponseStatus(HttpStatus.CREATED)
              Note create(@RequestBody Map<String, String> body) {
                Note note = new Note(ids.incrementAndGet(), body.get("text"));
                notes.put(note.id(), note);
                return note;$0
              }

              @DeleteMapping("/{id}")
              ResponseEntity<Void> delete(@PathVariable long id) {
                return notes.remove(id) == null ? ResponseEntity.notFound().build() : ResponseEntity.noContent().build();
              }
            }
          `,
          ort: 'klasse',
          kapitel: 'spring-rest',
        },
      ],
    },
    {
      titel: { de: 'Beans', en: 'Beans' },
      bausteine: [
        {
          titel: { de: '@Service + Controller', en: '@Service + controller' },
          info: { de: 'Ein Service, der per Konstruktor in den Controller kommt.', en: 'A service that gets into the controller through the constructor.' },
          code: java`
            @Service
            class DiceService {
              private int rolls = 0;
              int roll() {
                rolls++;
                return 1 + (rolls * 7) % 6;$0
              }
            }

            @RestController
            class DiceController {
              private final DiceService dice;
              DiceController(DiceService dice) { this.dice = dice; }

              @GetMapping("/dice")
              int roll() { return dice.roll(); }
            }
          `,
          ort: 'klasse',
          kapitel: 'spring-beans',
        },
        {
          titel: { de: 'CommandLineRunner', en: 'CommandLineRunner' },
          info: { de: 'Code, der einmal nach dem Start läuft.', en: 'Code that runs once after the start.' },
          code: java`
            @Component
            class StartupMessage implements CommandLineRunner {
              public void run(String... args) {
                System.out.println("The application is ready.");$0
              }
            }
          `,
          ort: 'klasse',
          kapitel: 'spring-beans',
        },
      ],
    },
    {
      titel: { de: 'Fehler & Daten', en: 'Errors & data' },
      bausteine: [
        {
          titel: { de: '@RestControllerAdvice', en: '@RestControllerAdvice' },
          info: { de: 'Macht aus IllegalArgumentException überall ein 400 mit ProblemDetail.', en: 'Turns IllegalArgumentException into a 400 with ProblemDetail everywhere.' },
          code: java`
            @RestControllerAdvice
            class ApiErrors {
              @ExceptionHandler(IllegalArgumentException.class)
              ProblemDetail badInput(IllegalArgumentException e) {
                return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());$0
              }
            }
          `,
          ort: 'klasse',
          kapitel: 'spring-fehler',
        },
        {
          titel: { de: 'Entity + Repository', en: 'Entity + repository' },
          info: { de: 'Eine Tabelle und ein Repository mit einer abgeleiteten Abfrage.', en: 'A table and a repository with a derived query.' },
          code: java`
            @Entity
            class Contact {
              @Id @GeneratedValue
              private Long id;
              private String name;

              protected Contact() {}
              Contact(String name) { this.name = name; }

              public Long getId() { return id; }
              public String getName() { return name; }
            }

            interface ContactRepository extends JpaRepository<Contact, Long> {
              List<Contact> findByNameContainingIgnoreCase(String part);$0
            }

            @RestController
            class ContactController {
              private final ContactRepository contacts;
              ContactController(ContactRepository contacts) { this.contacts = contacts; }

              @GetMapping("/api/contacts")
              List<Contact> find(@RequestParam(defaultValue = "") String q) {
                return contacts.findByNameContainingIgnoreCase(q);
              }
            }
          `,
          ort: 'klasse',
          kapitel: 'spring-daten',
        },
      ],
    },
  ],
}
