import { http, java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Code for chapter 8.3 - REST APIs with controllers. */

const APP = java`
  @SpringBootApplication
  public class TodoApplication {
    public static void main(String[] args) {
      SpringApplication.run(TodoApplication.class, args);
    }
  }
`
const withApp = (code: string) => `${APP}\n\n${code}`

export const beispiele = {
  'spring-rest-crud': {
    code: withApp(java`
      // What the API returns ...
      record Todo(long id, String title, boolean done) {}
      // ... and what a client sends: no id - the server assigns it.
      record TodoRequest(String title, boolean done) {}

      @RestController
      @RequestMapping("/api/todos")          // shared by all methods below
      class TodoController {
        private final Map<Long, Todo> todos = new LinkedHashMap<>();
        private final AtomicLong ids = new AtomicLong();

        // GET /api/todos  and  GET /api/todos?done=false
        @GetMapping
        List<Todo> all(@RequestParam(required = false) Boolean done) {
          if (done == null) return new ArrayList<>(todos.values());
          return todos.values().stream().filter(t -> t.done() == done).toList();
        }

        @GetMapping("/{id}")
        ResponseEntity<Todo> one(@PathVariable long id) {
          Todo todo = todos.get(id);
          if (todo == null) return ResponseEntity.notFound().build();      // 404
          return ResponseEntity.ok(todo);                                  // 200
        }

        @PostMapping
        ResponseEntity<Todo> create(@RequestBody TodoRequest request) {
          Todo todo = new Todo(ids.incrementAndGet(), request.title(), request.done());
          todos.put(todo.id(), todo);
          // 201 Created + where the new todo can be found
          return ResponseEntity.created(URI.create("/api/todos/" + todo.id())).body(todo);
        }

        @PutMapping("/{id}")
        ResponseEntity<Todo> replace(@PathVariable long id, @RequestBody TodoRequest request) {
          if (!todos.containsKey(id)) return ResponseEntity.notFound().build();
          Todo todo = new Todo(id, request.title(), request.done());
          todos.put(id, todo);
          return ResponseEntity.ok(todo);
        }

        @DeleteMapping("/{id}")
        ResponseEntity<Void> delete(@PathVariable long id) {
          if (todos.remove(id) == null) return ResponseEntity.notFound().build();
          return ResponseEntity.noContent().build();                       // 204
        }
      }
    `),
    requests: http`
      POST /api/todos
      {"title": "Buy milk"}
      → 201 {"id": 1, "title": "Buy milk", "done": false}

      POST /api/todos
      {"title": "Learn Spring", "done": true}
      → 201 {"id": 2}

      GET /api/todos
      → 200 [{"id": 1}, {"id": 2}]

      GET /api/todos?done=false
      → 200 [{"title": "Buy milk"}]

      PUT /api/todos/1
      {"title": "Buy oat milk", "done": true}
      → 200 {"id": 1, "title": "Buy oat milk", "done": true}

      DELETE /api/todos/2
      → 204

      GET /api/todos/2
      → 404
    `,
  },
  'spring-rest-json': {
    code: withApp(java`
      class User {
        private final String name;
        private final String password;       // no getter → never leaves the server
        private final boolean admin;

        User(String name, String password, boolean admin) {
          this.name = name;
          this.password = password;
          this.admin = admin;
        }

        public String getName() { return name; }          // → "name"
        public boolean isAdmin() { return admin; }        // → "admin"
      }

      class Secret {
        private String value = "top secret";               // no getter at all
      }

      @RestController
      class UserController {

        @GetMapping("/api/me")
        User me() {
          return new User("Ada", "correct horse battery staple", true);
        }

        @GetMapping("/api/secret")
        Secret secret() {
          return new Secret();
        }

        @PostMapping("/api/echo")
        Map<String, Object> echo(@RequestBody Map<String, Object> body) {
          return body;                                     // a Map works for any JSON object
        }
      }
    `),
    requests: http`
      GET /api/me
      → 200 {"name": "Ada", "admin": true}

      GET /api/secret
      → 500

      POST /api/echo
      {"any": "json", "numbers": [1, 2, 3]}
      → 200 {"any": "json", "numbers": [1, 2, 3]}

      POST /api/echo
      {"broken":
      → 400
    `,
  },
  'spring-rest-uebung': {
    tipps: {
      de: [
        '`@PutMapping("/{id}")` und `@DeleteMapping("/{id}")` - die id kommt mit `@PathVariable long id` in die Methode, der Body mit `@RequestBody BookRequest request`.',
        'Gibt es das Buch nicht (`books.containsKey(id)` ist false bzw. `books.remove(id)` liefert null), antwortest du mit `ResponseEntity.notFound().build()`.',
        'PUT antwortet mit `ResponseEntity.ok(book)`, DELETE mit `ResponseEntity.noContent().build()`.',
      ],
      en: [
        '`@PutMapping("/{id}")` and `@DeleteMapping("/{id}")` - the id gets into the method with `@PathVariable long id`, the body with `@RequestBody BookRequest request`.',
        'If the book does not exist (`books.containsKey(id)` is false or `books.remove(id)` returns null), answer with `ResponseEntity.notFound().build()`.',
        'PUT answers with `ResponseEntity.ok(book)`, DELETE with `ResponseEntity.noContent().build()`.',
      ],
    },
    code: withApp(java`
      record Book(long id, String title, String author) {}
      record BookRequest(String title, String author) {}

      @RestController
      @RequestMapping("/api/books")
      class BookController {
        private final Map<Long, Book> books = new LinkedHashMap<>();
        private final AtomicLong ids = new AtomicLong();

        @GetMapping
        List<Book> all() {
          return new ArrayList<>(books.values());
        }

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        Book create(@RequestBody BookRequest request) {
          Book book = new Book(ids.incrementAndGet(), request.title(), request.author());
          books.put(book.id(), book);
          return book;
        }

        // TODO: PUT /api/books/{id} and DELETE /api/books/{id}
      }
    `),
    loesung: withApp(java`
      record Book(long id, String title, String author) {}
      record BookRequest(String title, String author) {}

      @RestController
      @RequestMapping("/api/books")
      class BookController {
        private final Map<Long, Book> books = new LinkedHashMap<>();
        private final AtomicLong ids = new AtomicLong();

        @GetMapping
        List<Book> all() {
          return new ArrayList<>(books.values());
        }

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        Book create(@RequestBody BookRequest request) {
          Book book = new Book(ids.incrementAndGet(), request.title(), request.author());
          books.put(book.id(), book);
          return book;
        }

        @PutMapping("/{id}")
        ResponseEntity<Book> replace(@PathVariable long id, @RequestBody BookRequest request) {
          if (!books.containsKey(id)) return ResponseEntity.notFound().build();
          Book book = new Book(id, request.title(), request.author());
          books.put(id, book);
          return ResponseEntity.ok(book);
        }

        @DeleteMapping("/{id}")
        ResponseEntity<Void> delete(@PathVariable long id) {
          if (books.remove(id) == null) return ResponseEntity.notFound().build();
          return ResponseEntity.noContent().build();
        }
      }
    `),
    tests: [
      {
        name: { de: 'PUT ersetzt ein vorhandenes Buch (200)', en: 'PUT replaces an existing book (200)' },
        http: 'POST /api/books\n{"title": "Emma", "author": "Austen"}\nPUT /api/books/1\n{"title": "Persuasion", "author": "Austen"}\n→ 200 {"id": 1, "title": "Persuasion"}\nGET /api/books\n→ 200 [{"title": "Persuasion"}]',
      },
      {
        name: { de: 'PUT auf ein unbekanntes Buch → 404', en: 'PUT on an unknown book → 404' },
        http: 'PUT /api/books/9\n{"title": "x", "author": "y"}\n→ 404',
      },
      {
        name: { de: 'DELETE löscht (204) - danach ist die Liste leer', en: 'DELETE deletes (204) - afterwards the list is empty' },
        http: 'POST /api/books\n{"title": "Emma", "author": "Austen"}\nDELETE /api/books/1\n→ 204\nGET /api/books\n→ 200 []',
      },
      {
        name: { de: 'DELETE auf ein unbekanntes Buch → 404', en: 'DELETE on an unknown book → 404' },
        http: 'DELETE /api/books/9\n→ 404',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  rest: http`
    GET    /api/todos          → all todos                  200
    GET    /api/todos?done=true → filtered                  200
    GET    /api/todos/7        → todo 7                     200 / 404
    POST   /api/todos          → create (body: JSON)        201 + Location
    PUT    /api/todos/7        → replace todo 7             200 / 404
    PATCH  /api/todos/7        → change parts of todo 7     200 / 404
    DELETE /api/todos/7        → delete todo 7              204 / 404
  `,
  schlecht: http`
    # Not REST: verbs in the path, GET changes data
    GET  /api/getAllTodos
    GET  /api/deleteTodo?id=7
    POST /api/todos/update
  `,
  responseEntity: java`
    ResponseEntity.ok(todo)                               // 200 + body
    ResponseEntity.created(uri).body(todo)                // 201 + Location header
    ResponseEntity.noContent().build()                    // 204, no body
    ResponseEntity.notFound().build()                     // 404, no body
    ResponseEntity.badRequest().body(errors)              // 400 + body
    ResponseEntity.status(HttpStatus.CONFLICT).body(msg)  // any status
  `,
  getter: java`
    public String getTitle()  →  "title"
    public boolean isDone()   →  "done"      // "is" only for boolean
    record Todo(String title) →  "title"     // records: the components
    private String secret;    →  (missing)   // no getter, no JSON
  `,
}
