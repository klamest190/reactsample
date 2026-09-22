import { http, java, js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Code for chapter 8.1 - Hello Spring Boot. Shared by the German and the English version.
 *
 * The Java code runs in the course's Java runtime plus the Spring layer (src/spring/);
 * `requests` are sent to the application after every start.
 */

export const beispiele = {
  'spring-start-einstieg': {
    code: java`
      import org.springframework.boot.SpringApplication;
      import org.springframework.boot.autoconfigure.SpringBootApplication;
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.web.bind.annotation.RestController;

      @SpringBootApplication
      public class HelloApplication {
        public static void main(String[] args) {
          SpringApplication.run(HelloApplication.class, args);
        }
      }

      @RestController
      class HelloController {

        @GetMapping("/hello")
        String hello() {
          return "Hello, Spring Boot!";
        }
      }
    `,
    requests: http`
      GET /hello
      → 200 "Hello, Spring Boot!"
    `,
  },
  'spring-start-parameter': {
    code: java`
      @SpringBootApplication
      public class HelloApplication {
        public static void main(String[] args) {
          SpringApplication.run(HelloApplication.class, args);
        }
      }

      @RestController
      class HelloController {

        // /hello?name=Ada  →  name = "Ada"
        // /hello           →  name = "World" (the default value)
        @GetMapping("/hello")
        String hello(@RequestParam(defaultValue = "World") String name) {
          return "Hello, " + name + "!";
        }

        // /square/7  →  n = 7  (the text "7" from the path becomes an int)
        @GetMapping("/square/{n}")
        int square(@PathVariable int n) {
          return n * n;
        }
      }
    `,
    requests: http`
      GET /hello
      GET /hello?name=Ada
      GET /square/7
      GET /square/seven
    `,
  },
  'spring-start-json': {
    code: java`
      @SpringBootApplication
      public class LanguageApplication {
        public static void main(String[] args) {
          SpringApplication.run(LanguageApplication.class, args);
        }
      }

      // A record is a class for pure data (chapter 7.7) - perfect for JSON answers.
      record Language(String name, int year, boolean typed) {}

      @RestController
      class LanguageController {

        @GetMapping("/api/languages")
        List<Language> all() {
          return List.of(
              new Language("Java", 1995, true),
              new Language("JavaScript", 1995, false),
              new Language("TypeScript", 2012, true));
        }

        @GetMapping("/api/languages/first")
        Language first() {
          return all().get(0);
        }
      }
    `,
    requests: http`
      GET /api/languages
      GET /api/languages/first
    `,
  },
  'spring-start-uebung': {
    tipps: {
      de: [
        'Eine Klasse wird zum Controller mit `@RestController`, eine Methode beantwortet `GET /greet` mit `@GetMapping("/greet")`.',
        'Den Query-Parameter bekommst du mit `@RequestParam(defaultValue = "World") String name`.',
        'Für JSON reicht ein Record: `record Status(String app, boolean up) {}` - die Methode gibt einfach `new Status("todo-api", true)` zurück.',
      ],
      en: [
        'A class becomes a controller with `@RestController`, a method answers `GET /greet` with `@GetMapping("/greet")`.',
        'You get the query parameter with `@RequestParam(defaultValue = "World") String name`.',
        'A record is enough for JSON: `record Status(String app, boolean up) {}` - the method simply returns `new Status("todo-api", true)`.',
      ],
    },
    code: java`
      @SpringBootApplication
      public class GreetingApplication {
        public static void main(String[] args) {
          SpringApplication.run(GreetingApplication.class, args);
        }
      }

      // Your controller:

    `,
    loesung: java`
      @SpringBootApplication
      public class GreetingApplication {
        public static void main(String[] args) {
          SpringApplication.run(GreetingApplication.class, args);
        }
      }

      record Status(String app, boolean up) {}

      @RestController
      class GreetingController {

        @GetMapping("/greet")
        String greet(@RequestParam(defaultValue = "World") String name) {
          return "Hello, " + name + "!";
        }

        @GetMapping("/api/status")
        Status status() {
          return new Status("todo-api", true);
        }
      }
    `,
    tests: [
      {
        name: { de: 'GET /greet?name=Ada → "Hello, Ada!"', en: 'GET /greet?name=Ada → "Hello, Ada!"' },
        http: 'GET /greet?name=Ada\n→ 200 "Hello, Ada!"',
      },
      {
        name: { de: 'Ohne name: "Hello, World!"', en: 'Without name: "Hello, World!"' },
        http: 'GET /greet\n→ 200 "Hello, World!"',
      },
      {
        name: { de: 'GET /api/status → {"app": "todo-api", "up": true}', en: 'GET /api/status → {"app": "todo-api", "up": true}' },
        http: 'GET /api/status\n→ 200 {"app": "todo-api", "up": true}',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  anfrage: http`
    GET /api/todos?done=false HTTP/1.1
    Host: localhost:8080
    Accept: application/json
  `,
  antwort: js`
    HTTP/1.1 200 OK
    Content-Type: application/json

    [{"id": 1, "title": "Buy milk", "done": false}]
  `,
  anlegen: http`
    POST /api/todos HTTP/1.1
    Host: localhost:8080
    Content-Type: application/json

    {"title": "Buy milk"}
  `,
  angelegt: js`
    HTTP/1.1 201 Created
    Location: /api/todos/1
    Content-Type: application/json

    {"id": 1, "title": "Buy milk", "done": false}
  `,
  struktur: js`
    todo-api/
    ├── pom.xml                       ← dependencies and build (Maven)
    ├── mvnw, mvnw.cmd                ← Maven wrapper: no Maven installation needed
    └── src/
        ├── main/
        │   ├── java/com/example/todo/
        │   │   ├── TodoApplication.java   ← main + @SpringBootApplication
        │   │   └── TodoController.java
        │   └── resources/
        │       └── application.properties ← configuration (chapter 8.6)
        └── test/java/com/example/todo/    ← tests
  `,
  pom: js`
    <parent>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-parent</artifactId>
      <version>4.0.0</version>
    </parent>

    <properties>
      <java.version>21</java.version>
    </properties>

    <dependencies>
      <!-- Web: embedded Tomcat, Spring MVC, JSON with Jackson -->
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
      </dependency>
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
      </dependency>
    </dependencies>
  `,
  starten: js`
    $ ./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
    ...
    Tomcat started on port 8080 (http) with context path '/'
    Started TodoApplication in 1.9 seconds

    $ curl http://localhost:8080/hello
    Hello, Spring Boot!
  `,
  reactVergleich: js`
    // React (part 3): a URL in the browser → a component
    <Route path="/todos/:id" element={<TodoPage />} />

    // Spring: an HTTP request to the server → a method
    @GetMapping("/todos/{id}")
    Todo one(@PathVariable long id) { … }
  `,
}
