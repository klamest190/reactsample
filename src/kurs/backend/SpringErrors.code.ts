import { http, java, js, properties } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Code for chapter 8.4 - Validation & error handling. */

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
  'spring-fehler-valid': {
    code: withApp(java`
      // The rules sit directly on the fields of the request.
      record NewTodo(
          @NotBlank @Size(max = 40) String title,
          @Min(1) @Max(5) int priority) {}

      record Todo(long id, String title, int priority) {}

      @RestController
      @RequestMapping("/api/todos")
      class TodoController {
        private final AtomicLong ids = new AtomicLong();

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        Todo create(@Valid @RequestBody NewTodo request) {    // @Valid: check first!
          return new Todo(ids.incrementAndGet(), request.title(), request.priority());
        }
      }
    `),
    requests: http`
      POST /api/todos
      {"title": "Buy milk", "priority": 2}
      → 201 {"id": 1, "title": "Buy milk", "priority": 2}

      POST /api/todos
      {"title": "   ", "priority": 9}
      → 400
    `,
  },
  'spring-fehler-status': {
    code: withApp(java`
      // Option 1: the status is part of the exception class.
      @ResponseStatus(HttpStatus.NOT_FOUND)
      class TodoNotFoundException extends RuntimeException {
        TodoNotFoundException(long id) {
          super("Todo " + id + " not found");
        }
      }

      @RestController
      @RequestMapping("/api/todos")
      class TodoController {
        private final Map<Long, String> todos = new HashMap<>(Map.of(1L, "Buy milk"));

        @GetMapping("/{id}")
        String one(@PathVariable long id) {
          String title = todos.get(id);
          if (title == null) throw new TodoNotFoundException(id);
          return title;
        }

        // Option 2: throw a ResponseStatusException right where the problem is.
        @DeleteMapping("/{id}")
        String delete(@PathVariable long id) {
          if (id == 1) throw new ResponseStatusException(HttpStatus.CONFLICT, "Todo 1 is still in use");
          return "deleted";
        }

        // Anything else that is thrown becomes a 500.
        @GetMapping("/boom")
        String boom() {
          return todos.get(99).toUpperCase();
        }
      }
    `),
    properties: properties`
      # Without this line the error body contains no message (the default is "never").
      server.error.include-message=always
    `,
    requests: http`
      GET /api/todos/1
      → 200 "Buy milk"

      GET /api/todos/7
      → 404 {"message": "Todo 7 not found"}

      DELETE /api/todos/1
      → 409 {"message": "Todo 1 is still in use"}

      GET /api/todos/boom
      → 500
    `,
  },
  'spring-fehler-advice': {
    code: withApp(java`
      class TodoNotFoundException extends RuntimeException {
        TodoNotFoundException(long id) {
          super("Todo " + id + " not found");
        }
      }

      record NewTodo(@NotBlank String title, @Size(max = 200) String note) {}

      @RestController
      @RequestMapping("/api/todos")
      class TodoController {

        @GetMapping("/{id}")
        String one(@PathVariable long id) {
          throw new TodoNotFoundException(id);
        }

        @PostMapping
        String create(@Valid @RequestBody NewTodo todo) {
          return "created " + todo.title();
        }
      }

      // One place for all errors of all controllers.
      @RestControllerAdvice
      class ApiErrors {

        // RFC 9457 "problem details": a standard format for error answers.
        @ExceptionHandler(TodoNotFoundException.class)
        ProblemDetail notFound(TodoNotFoundException e) {
          return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        }

        // Which field is wrong, and why - that is what a form needs.
        @ExceptionHandler(MethodArgumentNotValidException.class)
        ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
          Map<String, String> errors = new LinkedHashMap<>();
          for (FieldError error : e.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
          }
          return ResponseEntity.badRequest().body(errors);
        }
      }
    `),
    requests: http`
      GET /api/todos/7
      → 404 {"title": "Not Found", "status": 404, "detail": "Todo 7 not found", "instance": "/api/todos/7"}

      POST /api/todos
      {"title": ""}
      → 400 {"title": "must not be blank"}

      POST /api/todos
      {"title": "Buy milk"}
      → 200 "created Buy milk"
    `,
  },
  'spring-fehler-uebung': {
    tipps: {
      de: [
        'Die Regeln gehören an die Komponenten des Records: `@NotBlank String title`, `@NotBlank String author`, `@Min(1) int pages` - und `@Valid` vor `@RequestBody`.',
        'In `one` wirfst du `new BookNotFoundException(id)`, wenn `books.get(id)` null ist.',
        'Die Advice-Klasse braucht `@RestControllerAdvice` und eine Methode mit `@ExceptionHandler(BookNotFoundException.class)`, die `ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage())` zurückgibt.',
      ],
      en: [
        'The rules belong on the record components: `@NotBlank String title`, `@NotBlank String author`, `@Min(1) int pages` - and `@Valid` before `@RequestBody`.',
        'In `one`, throw `new BookNotFoundException(id)` if `books.get(id)` is null.',
        'The advice class needs `@RestControllerAdvice` and a method with `@ExceptionHandler(BookNotFoundException.class)` that returns `ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage())`.',
      ],
    },
    code: withApp(java`
      record Book(long id, String title, String author, int pages) {}
      record BookRequest(String title, String author, int pages) {}

      class BookNotFoundException extends RuntimeException {
        BookNotFoundException(long id) {
          super("Book " + id + " not found");
        }
      }

      @RestController
      @RequestMapping("/api/books")
      class BookController {
        private final Map<Long, Book> books = new LinkedHashMap<>();
        private final AtomicLong ids = new AtomicLong();

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        Book create(@RequestBody BookRequest request) {
          Book book = new Book(ids.incrementAndGet(), request.title(), request.author(), request.pages());
          books.put(book.id(), book);
          return book;
        }

        @GetMapping("/{id}")
        Book one(@PathVariable long id) {
          return books.get(id);
        }
      }

      // TODO: a @RestControllerAdvice that turns BookNotFoundException into a 404 ProblemDetail
    `),
    loesung: withApp(java`
      record Book(long id, String title, String author, int pages) {}
      record BookRequest(@NotBlank String title, @NotBlank String author, @Min(1) int pages) {}

      class BookNotFoundException extends RuntimeException {
        BookNotFoundException(long id) {
          super("Book " + id + " not found");
        }
      }

      @RestController
      @RequestMapping("/api/books")
      class BookController {
        private final Map<Long, Book> books = new LinkedHashMap<>();
        private final AtomicLong ids = new AtomicLong();

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        Book create(@Valid @RequestBody BookRequest request) {
          Book book = new Book(ids.incrementAndGet(), request.title(), request.author(), request.pages());
          books.put(book.id(), book);
          return book;
        }

        @GetMapping("/{id}")
        Book one(@PathVariable long id) {
          Book book = books.get(id);
          if (book == null) throw new BookNotFoundException(id);
          return book;
        }
      }

      @RestControllerAdvice
      class ApiErrors {
        @ExceptionHandler(BookNotFoundException.class)
        ProblemDetail notFound(BookNotFoundException e) {
          return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        }
      }
    `),
    tests: [
      {
        name: { de: 'Ein gültiges Buch wird angelegt (201)', en: 'A valid book is created (201)' },
        http: 'POST /api/books\n{"title": "Emma", "author": "Austen", "pages": 474}\n→ 201 {"id": 1, "title": "Emma"}',
      },
      {
        name: { de: 'Leerer Titel → 400', en: 'Blank title → 400' },
        http: 'POST /api/books\n{"title": " ", "author": "Austen", "pages": 474}\n→ 400',
      },
      {
        name: { de: 'Fehlender Autor → 400', en: 'Missing author → 400' },
        http: 'POST /api/books\n{"title": "Emma", "pages": 474}\n→ 400',
      },
      {
        name: { de: '0 Seiten → 400', en: '0 pages → 400' },
        http: 'POST /api/books\n{"title": "Emma", "author": "Austen", "pages": 0}\n→ 400',
      },
      {
        name: { de: 'Unbekanntes Buch → 404 mit ProblemDetail', en: 'Unknown book → 404 with ProblemDetail' },
        http: 'GET /api/books/9\n→ 404 {"status": 404, "detail": "Book 9 not found"}',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  abhaengigkeit: js`
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
  `,
  standard: js`
    {
      "timestamp": "2026-09-22T10:15:30.123+00:00",
      "status": 400,
      "error": "Bad Request",
      "path": "/api/todos"
    }
  `,
  problem: js`
    {
      "type": "about:blank",
      "title": "Not Found",
      "status": 404,
      "detail": "Todo 7 not found",
      "instance": "/api/todos/7"
    }
  `,
  reihenfolge: js`
    1. @ExceptionHandler in the same controller
    2. @ExceptionHandler in a @RestControllerAdvice      ← the most specific type wins
    3. ResponseStatusException / @ResponseStatus on the exception class
    4. everything else: 500 Internal Server Error (+ stack trace in the log)
  `,
}
