import { http, java, js, properties } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Code for chapter 8.5 - Databases with Spring Data JPA. */

const APP = java`
  @SpringBootApplication
  public class TodoApplication {
    public static void main(String[] args) {
      SpringApplication.run(TodoApplication.class, args);
    }
  }
`
const withApp = (code: string) => `${APP}\n\n${code}`

const TODO_ENTITY = java`
  @Entity
  class Todo {
    @Id
    @GeneratedValue
    private Long id;
    private String title;
    private boolean done;

    protected Todo() {}                  // JPA needs a constructor without parameters

    Todo(String title) {
      this.title = title;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }
  }
`

export const beispiele = {
  'spring-daten-einstieg': {
    code: withApp(`${TODO_ENTITY}\n\n` + java`
      // That is all: Spring Data writes the implementation at startup.
      interface TodoRepository extends JpaRepository<Todo, Long> {}

      @RestController
      @RequestMapping("/api/todos")
      class TodoController {
        private final TodoRepository repository;

        TodoController(TodoRepository repository) {
          this.repository = repository;
        }

        @GetMapping
        List<Todo> all() {
          return repository.findAll();
        }

        @GetMapping("/{id}")
        ResponseEntity<Todo> one(@PathVariable Long id) {
          return ResponseEntity.of(repository.findById(id));     // 200 or 404
        }

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        Todo create(@RequestBody Map<String, String> body) {
          return repository.save(new Todo(body.get("title")));   // id is assigned here
        }

        @DeleteMapping("/{id}")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        void delete(@PathVariable Long id) {
          repository.deleteById(id);
        }
      }
    `),
    properties: properties`
      # Print every SQL statement Hibernate sends to the database
      spring.jpa.show-sql=true
    `,
    requests: http`
      POST /api/todos
      {"title": "Buy milk"}
      → 201 {"id": 1, "title": "Buy milk", "done": false}

      POST /api/todos
      {"title": "Learn JPA"}
      → 201 {"id": 2}

      GET /api/todos
      → 200 [{"id": 1}, {"id": 2}]

      DELETE /api/todos/1
      → 204

      GET /api/todos/1
      → 404
    `,
  },
  'spring-daten-abfragen': {
    code: withApp(`${TODO_ENTITY}\n\n` + java`
      interface TodoRepository extends JpaRepository<Todo, Long> {
        // Spring Data reads the method NAME and builds the query from it.
        List<Todo> findByDoneFalse();
        List<Todo> findByTitleContainingIgnoreCase(String part);
        List<Todo> findAllByOrderByTitleAsc();
        long countByDone(boolean done);
      }

      @Configuration
      class TestData {
        @Bean
        CommandLineRunner fill(TodoRepository repository) {
          return args -> {
            Todo milk = new Todo("Buy milk");
            milk.setDone(true);
            repository.save(milk);
            repository.save(new Todo("Learn JPA"));
            repository.save(new Todo("Call Ada"));
          };
        }
      }

      @RestController
      @RequestMapping("/api/todos")
      class TodoController {
        private final TodoRepository repository;

        TodoController(TodoRepository repository) {
          this.repository = repository;
        }

        @GetMapping("/open")
        List<Todo> open() { return repository.findByDoneFalse(); }

        @GetMapping("/search")
        List<Todo> search(@RequestParam String q) { return repository.findByTitleContainingIgnoreCase(q); }

        @GetMapping("/sorted")
        List<Todo> sorted() { return repository.findAllByOrderByTitleAsc(); }

        @GetMapping("/stats")
        Map<String, Long> stats() {
          return Map.of("done", repository.countByDone(true), "open", repository.countByDone(false));
        }
      }
    `),
    properties: properties`
      spring.jpa.show-sql=true
    `,
    requests: http`
      GET /api/todos/open
      → 200 [{"title": "Learn JPA"}, {"title": "Call Ada"}]

      GET /api/todos/search?q=MILK
      → 200 [{"title": "Buy milk"}]

      GET /api/todos/sorted
      → 200 [{"title": "Buy milk"}, {"title": "Call Ada"}, {"title": "Learn JPA"}]

      GET /api/todos/stats
      → 200 {"done": 1, "open": 2}
    `,
  },
  'spring-daten-schichten': {
    code: withApp(`${TODO_ENTITY}\n\n` + java`
      interface TodoRepository extends JpaRepository<Todo, Long> {}

      @Service
      class TodoService {
        private final TodoRepository repository;

        TodoService(TodoRepository repository) {
          this.repository = repository;
        }

        Todo create(String title) {
          return repository.save(new Todo(title.trim()));
        }

        // Wrong: changes a copy - nothing is saved.
        Todo toggleWithoutSave(Long id) {
          Todo todo = find(id);
          todo.setDone(!todo.isDone());
          return todo;
        }

        // Right: load, change, save.
        Todo toggle(Long id) {
          Todo todo = find(id);
          todo.setDone(!todo.isDone());
          return repository.save(todo);
        }

        private Todo find(Long id) {
          return repository.findById(id)
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo " + id + " not found"));
        }
      }

      @RestController
      @RequestMapping("/api/todos")
      class TodoController {
        private final TodoService service;
        private final TodoRepository repository;

        TodoController(TodoService service, TodoRepository repository) {
          this.service = service;
          this.repository = repository;
        }

        @GetMapping
        List<Todo> all() { return repository.findAll(); }

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        Todo create(@RequestBody Map<String, String> body) { return service.create(body.get("title")); }

        @PatchMapping("/{id}/toggle-wrong")
        Todo toggleWrong(@PathVariable Long id) { return service.toggleWithoutSave(id); }

        @PatchMapping("/{id}/toggle")
        Todo toggle(@PathVariable Long id) { return service.toggle(id); }
      }
    `),
    properties: properties`
      spring.jpa.show-sql=true
    `,
    requests: http`
      POST /api/todos
      {"title": "  Buy milk  "}
      → 201 {"id": 1, "title": "Buy milk", "done": false}

      PATCH /api/todos/1/toggle-wrong
      → 200 {"done": true}

      GET /api/todos
      → 200 [{"done": false}]

      PATCH /api/todos/1/toggle
      → 200 {"done": true}

      GET /api/todos
      → 200 [{"done": true}]

      PATCH /api/todos/9/toggle
      → 404
    `,
  },
  'spring-daten-uebung': {
    tipps: {
      de: [
        'Abfragen sind Methoden im Repository-Interface - ohne Rumpf: `List<Book> findByReadFalse();`',
        'Groß-/Kleinschreibung ignorieren: `List<Book> findByAuthorIgnoreCase(String author);` Die Namen müssen zu den Feldern der Entity passen.',
        'Im Controller: `@GetMapping("/unread")` und `@GetMapping("/by")` mit `@RequestParam String author`.',
      ],
      en: [
        'Queries are methods in the repository interface - without a body: `List<Book> findByReadFalse();`',
        'Ignore upper/lower case: `List<Book> findByAuthorIgnoreCase(String author);` The names must match the entity’s fields.',
        'In the controller: `@GetMapping("/unread")` and `@GetMapping("/by")` with `@RequestParam String author`.',
      ],
    },
    code: withApp(java`
      @Entity
      class Book {
        @Id @GeneratedValue
        private Long id;
        private String title;
        private String author;
        private boolean read;

        protected Book() {}
        Book(String title, String author, boolean read) {
          this.title = title;
          this.author = author;
          this.read = read;
        }

        public Long getId() { return id; }
        public String getTitle() { return title; }
        public String getAuthor() { return author; }
        public boolean isRead() { return read; }
      }

      interface BookRepository extends JpaRepository<Book, Long> {
        // TODO: two query methods
      }

      @Configuration
      class TestData {
        @Bean
        CommandLineRunner fill(BookRepository books) {
          return args -> {
            books.save(new Book("Emma", "Jane Austen", true));
            books.save(new Book("Persuasion", "Jane Austen", false));
            books.save(new Book("Dune", "Frank Herbert", false));
          };
        }
      }

      @RestController
      @RequestMapping("/api/books")
      class BookController {
        private final BookRepository books;

        BookController(BookRepository books) {
          this.books = books;
        }

        @GetMapping
        List<Book> all() {
          return books.findAll();
        }

        // TODO: GET /api/books/unread and GET /api/books/by?author=…
      }
    `),
    loesung: withApp(java`
      @Entity
      class Book {
        @Id @GeneratedValue
        private Long id;
        private String title;
        private String author;
        private boolean read;

        protected Book() {}
        Book(String title, String author, boolean read) {
          this.title = title;
          this.author = author;
          this.read = read;
        }

        public Long getId() { return id; }
        public String getTitle() { return title; }
        public String getAuthor() { return author; }
        public boolean isRead() { return read; }
      }

      interface BookRepository extends JpaRepository<Book, Long> {
        List<Book> findByReadFalse();
        List<Book> findByAuthorIgnoreCase(String author);
      }

      @Configuration
      class TestData {
        @Bean
        CommandLineRunner fill(BookRepository books) {
          return args -> {
            books.save(new Book("Emma", "Jane Austen", true));
            books.save(new Book("Persuasion", "Jane Austen", false));
            books.save(new Book("Dune", "Frank Herbert", false));
          };
        }
      }

      @RestController
      @RequestMapping("/api/books")
      class BookController {
        private final BookRepository books;

        BookController(BookRepository books) {
          this.books = books;
        }

        @GetMapping
        List<Book> all() {
          return books.findAll();
        }

        @GetMapping("/unread")
        List<Book> unread() {
          return books.findByReadFalse();
        }

        @GetMapping("/by")
        List<Book> byAuthor(@RequestParam String author) {
          return books.findByAuthorIgnoreCase(author);
        }
      }
    `),
    tests: [
      {
        name: { de: 'GET /api/books/unread → die zwei ungelesenen', en: 'GET /api/books/unread → the two unread ones' },
        http: 'GET /api/books/unread\n→ 200 [{"title": "Persuasion"}, {"title": "Dune"}]',
      },
      {
        name: { de: 'GET /api/books/by?author=jane austen → beide Austen-Bücher', en: 'GET /api/books/by?author=jane austen → both Austen books' },
        http: 'GET /api/books/by?author=jane%20austen\n→ 200 [{"title": "Emma"}, {"title": "Persuasion"}]',
      },
      {
        name: { de: 'Unbekannter Autor → leere Liste', en: 'Unknown author → empty list' },
        http: 'GET /api/books/by?author=Tolkien\n→ 200 []',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  tabelle: js`
    @Entity class Todo          →   table todo
      @Id Long id               →   column id (primary key)
      String title              →   column title
      boolean done              →   column done

    todo
    ┌────┬───────────┬───────┐
    │ id │ title     │ done  │
    ├────┼───────────┼───────┤
    │  1 │ Buy milk  │ true  │
    │  2 │ Learn JPA │ false │
    └────┴───────────┴───────┘
  `,
  methoden: java`
    repository.findAll()             // List<Todo>
    repository.findById(7L)          // Optional<Todo> - empty if there is none
    repository.save(todo)            // INSERT (new) or UPDATE (existing)
    repository.deleteById(7L)
    repository.existsById(7L)        // boolean
    repository.count()               // long
  `,
  namen: java`
    findByTitle(String title)                    where title = ?
    findByDoneFalse()                            where done = false
    findByTitleContainingIgnoreCase(String s)    where lower(title) like lower('%s%')
    findByPriorityGreaterThan(int p)             where priority > ?
    findByDoneAndPriority(boolean d, int p)      where done = ? and priority = ?
    findTop3ByOrderByCreatedDesc()               order by created desc limit 3
    countByDone(boolean done)                    select count(*) … where done = ?
    existsByTitle(String title)                  boolean
  `,
  pom: js`
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <!-- a database in memory, perfect for development -->
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>runtime</scope>
    </dependency>
    <!-- PostgreSQL for production (chapter 8.10) -->
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
    </dependency>
  `,
  postgres: properties`
    spring.datasource.url=jdbc:postgresql://localhost:5432/todo
    spring.datasource.username=todo
    spring.datasource.password=secret
    # create/update tables from the entities - fine for learning, use migrations (Flyway) in production
    spring.jpa.hibernate.ddl-auto=update
  `,
}
