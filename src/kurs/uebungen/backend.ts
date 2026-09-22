import { docker, http, java, yaml } from '../../lernen/quelltext'
import type { UebungsSammlung } from './typen'

/**
 * Extra exercises for part 8 (Spring Boot & Docker) - graded per chapter:
 * predict -> find the bug -> complete / write freely.
 *
 * The predictions aim at the places where Spring and Docker behave differently
 * from what one would guess.
 */

const t = <T>(de: T, en: T) => ({ de, en })

const APP = java`
  @SpringBootApplication
  public class DemoApplication {
    public static void main(String[] args) {
      SpringApplication.run(DemoApplication.class, args);
    }
  }
`
const withApp = (code: string) => `${APP}\n\n${code}`

export const uebungen: UebungsSammlung = {
  'spring-start': [
    {
      id: 'spring-start-vorhersage-status',
      stufe: 'vorhersage',
      titel: t('Vier Anfragen, vier Antworten', 'Four requests, four answers'),
      frage: t(
        'Der Controller hat nur `@GetMapping("/square/{n}") int square(@PathVariable int n)`. Welche Status-Codes bekommen diese Anfragen?',
        'The controller only has `@GetMapping("/square/{n}") int square(@PathVariable int n)`. Which status codes do these requests get?',
      ),
      code: http`
        GET    /square/4
        GET    /square/four
        POST   /square/4
        GET    /squares/4
      `,
      antworten: ['200, 400, 405, 404', '200, 404, 404, 404', '200, 500, 405, 404', '200, 400, 404, 405'],
      richtig: 0,
      erklaerung: t(
        '„four“ passt nicht in `int` → 400. Den Pfad gibt es, aber nicht für POST → 405 Method Not Allowed. `/squares` gibt es gar nicht → 404.',
        '“four” does not fit into `int` → 400. The path exists, but not for POST → 405 Method Not Allowed. `/squares` does not exist at all → 404.',
      ),
    },
    {
      id: 'spring-start-fehler-mapping',
      stufe: 'fehler',
      titel: t('Der Endpunkt antwortet nicht', 'The endpoint does not answer'),
      aufgabe: t(
        '`GET /api/version` soll `"1.0"` liefern, bekommt aber 404. Finde die zwei Fehler.',
        '`GET /api/version` should return `"1.0"` but gets 404. Find the two mistakes.',
      ),
      modus: 'spring',
      code: withApp(java`
        class VersionController {

          @GetMapping("/version")
          String version() {
            return "1.0";
          }
        }
      `),
      loesung: withApp(java`
        @RestController
        class VersionController {

          @GetMapping("/api/version")
          String version() {
            return "1.0";
          }
        }
      `),
      tests: [{ name: t('GET /api/version → "1.0"', 'GET /api/version → "1.0"'), http: 'GET /api/version\n→ 200 "1.0"' }],
      tipps: t(
        ['Ohne `@RestController` ist die Klasse keine Bean - Spring kennt ihre Methoden gar nicht.', 'Und der Pfad in `@GetMapping` muss genau zur Anfrage passen: `/api/version`.'],
        ['Without `@RestController` the class is no bean - Spring does not know its methods at all.', 'And the path in `@GetMapping` must match the request exactly: `/api/version`.'],
      ),
    },
  ],

  'spring-beans': [
    {
      id: 'spring-beans-vorhersage-singleton',
      stufe: 'vorhersage',
      titel: t('Wie oft wird gezählt?', 'How often is it counted?'),
      frage: t('Beide Controller bekommen einen `Counter` (eine `@Service`-Bean). Was antwortet die dritte Anfrage?', 'Both controllers get a `Counter` (a `@Service` bean). What does the third request answer?'),
      code: http`
        GET /a     # AController: return counter.next();
        GET /b     # BController: return counter.next();
        GET /a
      `,
      antworten: ['1', '2', '3', 'Die Anwendung startet nicht'],
      richtig: 2,
      erklaerung: t(
        'Beans sind Singletons: Beide Controller teilen sich denselben Counter - 1, 2, 3.',
        'Beans are singletons: both controllers share the same counter - 1, 2, 3.',
      ),
    },
    {
      id: 'spring-beans-fehler-start',
      stufe: 'fehler',
      titel: t('APPLICATION FAILED TO START', 'APPLICATION FAILED TO START'),
      aufgabe: t(
        'Die Anwendung startet nicht. Lies die Meldung und behebe den Fehler - ohne den Controller zu ändern.',
        'The application does not start. Read the message and fix the mistake - without changing the controller.',
      ),
      modus: 'spring',
      code: withApp(java`
        interface Clock {
          String now();
        }

        class FixedClock implements Clock {
          public String now() { return "12:00"; }
        }

        @RestController
        class TimeController {
          private final Clock clock;
          TimeController(Clock clock) { this.clock = clock; }

          @GetMapping("/time")
          String time() { return clock.now(); }
        }
      `),
      loesung: withApp(java`
        interface Clock {
          String now();
        }

        @Component
        class FixedClock implements Clock {
          public String now() { return "12:00"; }
        }

        @RestController
        class TimeController {
          private final Clock clock;
          TimeController(Clock clock) { this.clock = clock; }

          @GetMapping("/time")
          String time() { return clock.now(); }
        }
      `),
      tests: [{ name: t('GET /time → "12:00"', 'GET /time → "12:00"'), http: 'GET /time\n→ 200 "12:00"' }],
      tipps: t(['„required a bean of type Clock that could not be found“ - welche Klasse soll diese Bean sein?', '`@Component` über `FixedClock`.'], ['“required a bean of type Clock that could not be found” - which class should be that bean?', '`@Component` on `FixedClock`.']),
    },
  ],

  'spring-rest': [
    {
      id: 'spring-rest-vorhersage-json',
      stufe: 'vorhersage',
      titel: t('Was steht im JSON?', 'What is in the JSON?'),
      frage: t('Ein Controller gibt ein `new Account("Ada", "secret", true)` zurück. Welches JSON kommt an?', 'A controller returns `new Account("Ada", "secret", true)`. Which JSON arrives?'),
      code: java`
        class Account {
          private String name;
          private String password;
          private boolean active;
          // constructor …
          public String getName() { return name; }
          public boolean isActive() { return active; }
        }
      `,
      antworten: [
        '{"name": "Ada", "password": "secret", "active": true}',
        '{"name": "Ada", "active": true}',
        '{"name": "Ada", "isActive": true}',
        '{}',
      ],
      richtig: 1,
      erklaerung: t(
        'Jackson schreibt, was einen Getter hat. `isActive()` wird zu `"active"`, und `password` ohne Getter bleibt draußen.',
        'Jackson writes what has a getter. `isActive()` becomes `"active"`, and `password` without a getter stays out.',
      ),
    },
    {
      id: 'spring-rest-ergaenzen-filter',
      stufe: 'ergaenzen',
      titel: t('Filtern per Query-Parameter', 'Filtering with a query parameter'),
      aufgabe: t(
        '`GET /api/products` liefert alle Produkte. Mit `?maxPrice=10` sollen nur Produkte bis 10 kommen; ohne Parameter weiterhin alle.',
        '`GET /api/products` returns all products. With `?maxPrice=10` only products up to 10 should come back; without the parameter still all of them.',
      ),
      modus: 'spring',
      code: withApp(java`
        record Product(String name, double price) {}

        @RestController
        class ProductController {
          private final List<Product> products = List.of(
              new Product("Pen", 2.5), new Product("Book", 12.0), new Product("Mug", 8.0));

          @GetMapping("/api/products")
          List<Product> all() {
            return products;
          }
        }
      `),
      loesung: withApp(java`
        record Product(String name, double price) {}

        @RestController
        class ProductController {
          private final List<Product> products = List.of(
              new Product("Pen", 2.5), new Product("Book", 12.0), new Product("Mug", 8.0));

          @GetMapping("/api/products")
          List<Product> all(@RequestParam(required = false) Double maxPrice) {
            if (maxPrice == null) return products;
            return products.stream().filter(p -> p.price() <= maxPrice).toList();
          }
        }
      `),
      tests: [
        { name: t('?maxPrice=10 → Pen und Mug', '?maxPrice=10 → Pen and Mug'), http: 'GET /api/products?maxPrice=10\n→ 200 [{"name": "Pen"}, {"name": "Mug"}]' },
        { name: t('Ohne Parameter → alle drei', 'Without the parameter → all three'), http: 'GET /api/products\n→ 200 [{}, {}, {}]' },
      ],
      tipps: t(
        ['Ein optionaler Parameter: `@RequestParam(required = false) Double maxPrice` - `Double`, damit er `null` sein kann.', 'Filtern mit `products.stream().filter(p -> p.price() <= maxPrice).toList()`.'],
        ['An optional parameter: `@RequestParam(required = false) Double maxPrice` - `Double`, so it can be `null`.', 'Filter with `products.stream().filter(p -> p.price() <= maxPrice).toList()`.'],
      ),
    },
  ],

  'spring-fehler': [
    {
      id: 'spring-fehler-vorhersage-handler',
      stufe: 'vorhersage',
      titel: t('Welcher Handler gewinnt?', 'Which handler wins?'),
      frage: t(
        'Ein Controller wirft `TodoNotFoundException extends RuntimeException`. Die Advice-Klasse hat diese beiden Handler. Welcher Status kommt heraus?',
        'A controller throws `TodoNotFoundException extends RuntimeException`. The advice class has these two handlers. Which status comes out?',
      ),
      code: java`
        @ExceptionHandler(RuntimeException.class)
        ResponseEntity<String> any(RuntimeException e) { return ResponseEntity.status(500).body("oops"); }

        @ExceptionHandler(TodoNotFoundException.class)
        ResponseEntity<String> notFound(TodoNotFoundException e) { return ResponseEntity.status(404).body("gone"); }
      `,
      antworten: ['500 - der erste Handler steht oben', '404 - der genauere Typ gewinnt', 'beide werden aufgerufen', 'Spring meldet einen Konflikt beim Start'],
      richtig: 1,
      erklaerung: t(
        'Spring wählt den Handler, dessen Typ am nächsten an der Exception ist - die Reihenfolge im Code spielt keine Rolle.',
        'Spring picks the handler whose type is closest to the exception - the order in the code does not matter.',
      ),
    },
    {
      id: 'spring-fehler-fehler-valid',
      stufe: 'fehler',
      titel: t('Die Validierung greift nicht', 'Validation does not kick in'),
      aufgabe: t(
        'Eine leere E-Mail-Adresse wird angenommen, obwohl `@NotBlank @Email` dasteht. Finde den Fehler.',
        'An empty email address is accepted although `@NotBlank @Email` is there. Find the bug.',
      ),
      modus: 'spring',
      code: withApp(java`
        record Signup(@NotBlank @Email String email) {}

        @RestController
        class SignupController {
          @PostMapping("/api/signup")
          @ResponseStatus(HttpStatus.CREATED)
          String signup(@RequestBody Signup signup) {
            return "welcome " + signup.email();
          }
        }
      `),
      loesung: withApp(java`
        record Signup(@NotBlank @Email String email) {}

        @RestController
        class SignupController {
          @PostMapping("/api/signup")
          @ResponseStatus(HttpStatus.CREATED)
          String signup(@Valid @RequestBody Signup signup) {
            return "welcome " + signup.email();
          }
        }
      `),
      tests: [
        { name: t('Leere Adresse → 400', 'Empty address → 400'), http: 'POST /api/signup\n{"email": ""}\n→ 400' },
        { name: t('Keine Adresse → 400', 'Not an address → 400'), http: 'POST /api/signup\n{"email": "ada"}\n→ 400' },
        { name: t('Gültige Adresse → 201', 'Valid address → 201'), http: 'POST /api/signup\n{"email": "ada@example.com"}\n→ 201' },
      ],
      tipps: t(['Die Annotationen am Record werden nur geprüft, wenn der Parameter es verlangt.', '`@Valid` vor `@RequestBody`.'], ['The annotations on the record are only checked if the parameter asks for it.', '`@Valid` before `@RequestBody`.']),
    },
  ],

  'spring-daten': [
    {
      id: 'spring-daten-vorhersage-name',
      stufe: 'vorhersage',
      titel: t('Ein Buchstabe zu viel', 'One letter too many'),
      frage: t(
        'Die Entity `Todo` hat die Felder `id`, `title` und `done`. Was passiert mit diesem Repository?',
        'The entity `Todo` has the fields `id`, `title` and `done`. What happens with this repository?',
      ),
      code: java`
        interface TodoRepository extends JpaRepository<Todo, Long> {
          List<Todo> findByTitles(String title);
        }
      `,
      antworten: [
        'Die Methode liefert immer eine leere Liste',
        'Der erste Aufruf wirft eine Exception',
        'Die Anwendung startet nicht: No property \'titles\' found',
        'Spring korrigiert den Namen automatisch',
      ],
      richtig: 2,
      erklaerung: t(
        'Spring Data prüft alle Methodennamen beim Start. Ein Feld `titles` gibt es nicht - also startet die Anwendung gar nicht erst.',
        'Spring Data checks all method names at startup. There is no field `titles` - so the application does not even start.',
      ),
    },
    {
      id: 'spring-daten-ergaenzen-count',
      stufe: 'ergaenzen',
      titel: t('Zählen ohne Schleife', 'Counting without a loop'),
      aufgabe: t(
        '`GET /api/todos/open-count` soll die Zahl der offenen ToDos liefern (hier: 2). Ergänze eine Methode im Repository und benutze sie.',
        '`GET /api/todos/open-count` should return the number of open todos (here: 2). Add a method to the repository and use it.',
      ),
      modus: 'spring',
      code: withApp(java`
        @Entity
        class Todo {
          @Id @GeneratedValue private Long id;
          private String title;
          private boolean done;
          protected Todo() {}
          Todo(String title, boolean done) { this.title = title; this.done = done; }
          public Long getId() { return id; }
          public String getTitle() { return title; }
          public boolean isDone() { return done; }
        }

        interface TodoRepository extends JpaRepository<Todo, Long> {
        }

        @Configuration
        class Data {
          @Bean
          CommandLineRunner fill(TodoRepository todos) {
            return args -> {
              todos.save(new Todo("Milk", false));
              todos.save(new Todo("Bread", true));
              todos.save(new Todo("Tea", false));
            };
          }
        }

        @RestController
        class TodoController {
          private final TodoRepository todos;
          TodoController(TodoRepository todos) { this.todos = todos; }

          @GetMapping("/api/todos/open-count")
          long openCount() {
            return 0;
          }
        }
      `),
      loesung: withApp(java`
        @Entity
        class Todo {
          @Id @GeneratedValue private Long id;
          private String title;
          private boolean done;
          protected Todo() {}
          Todo(String title, boolean done) { this.title = title; this.done = done; }
          public Long getId() { return id; }
          public String getTitle() { return title; }
          public boolean isDone() { return done; }
        }

        interface TodoRepository extends JpaRepository<Todo, Long> {
          long countByDoneFalse();
        }

        @Configuration
        class Data {
          @Bean
          CommandLineRunner fill(TodoRepository todos) {
            return args -> {
              todos.save(new Todo("Milk", false));
              todos.save(new Todo("Bread", true));
              todos.save(new Todo("Tea", false));
            };
          }
        }

        @RestController
        class TodoController {
          private final TodoRepository todos;
          TodoController(TodoRepository todos) { this.todos = todos; }

          @GetMapping("/api/todos/open-count")
          long openCount() {
            return todos.countByDoneFalse();
          }
        }
      `),
      tests: [{ name: t('GET /api/todos/open-count → 2', 'GET /api/todos/open-count → 2'), http: 'GET /api/todos/open-count\n→ 200 2' }],
      tipps: t(['Zählen beginnt mit `countBy…`, der Rückgabetyp ist `long`.', '`long countByDoneFalse();`'], ['Counting starts with `countBy…`, the return type is `long`.', '`long countByDoneFalse();`']),
    },
  ],

  'spring-konfig': [
    {
      id: 'spring-konfig-vorhersage-profil',
      stufe: 'vorhersage',
      titel: t('Welcher Wert gilt?', 'Which value applies?'),
      frage: t('Welchen Wert bekommt `@Value("${app.color}")` mit dieser Datei?', 'Which value does `@Value("${app.color}")` get with this file?'),
      code: http`
        spring.profiles.active=prod
        app.color=blue
        #---
        spring.config.activate.on-profile=dev
        app.color=green
        #---
        spring.config.activate.on-profile=prod
        app.color=red
      `,
      antworten: ['blue', 'green', 'red', 'Die Anwendung startet nicht'],
      richtig: 2,
      erklaerung: t(
        'Aktiv ist `prod`. Der `dev`-Block wird übersprungen, der `prod`-Block überschreibt den Wert von oben.',
        '`prod` is active. The `dev` block is skipped, the `prod` block overrides the value from above.',
      ),
    },
  ],

  'spring-react': [
    {
      id: 'spring-react-vorhersage-fetch',
      stufe: 'vorhersage',
      titel: t('fetch und der 404', 'fetch and the 404'),
      frage: t('Der Server antwortet mit 404. Was gibt dieser Code aus?', 'The server answers with 404. What does this code print?'),
      code: http`
        try {
          const response = await fetch('/api/todos/99')
          console.log('ok:', response.ok, response.status)
        } catch (error) {
          console.log('error:', error.message)
        }
      `,
      antworten: ['ok: false 404', 'error: Not Found', 'ok: true 404', 'Es wird nichts ausgegeben'],
      richtig: 0,
      erklaerung: t(
        '`fetch` wirft nur bei Netzwerkfehlern. Eine Antwort mit 404 ist eine ganz normale Antwort - mit `ok === false`.',
        '`fetch` only throws on network errors. A response with 404 is a completely normal response - with `ok === false`.',
      ),
    },
  ],

  'docker-start': [
    {
      id: 'docker-start-vorhersage-port',
      stufe: 'vorhersage',
      titel: t('Welche Adresse?', 'Which address?'),
      frage: t('Nach diesem Befehl - welcher Aufruf auf deinem Rechner bekommt die nginx-Startseite?', 'After this command - which call on your machine gets the nginx start page?'),
      code: docker`
        docker run -d --name web -p 3000:80 nginx
      `,
      antworten: ['curl http://localhost:80', 'curl http://localhost:3000', 'curl http://web:80', 'curl http://localhost:3080'],
      richtig: 1,
      erklaerung: t(
        'Bei `-p HOST:CONTAINER` steht links dein Rechner. Port 80 gibt es nur im Container; den Namen `web` kennt nur das Docker-Netzwerk.',
        'With `-p HOST:CONTAINER` your machine is on the left. Port 80 only exists inside the container; the name `web` is only known in the Docker network.',
      ),
    },
  ],

  'docker-dockerfile': [
    {
      id: 'docker-dockerfile-vorhersage-cache',
      stufe: 'vorhersage',
      titel: t('Was kommt aus dem Cache?', 'What comes from the cache?'),
      frage: t('Du änderst `src/App.tsx` und baust neu. Welche Schritte laufen wirklich?', 'You change `src/App.tsx` and build again. Which steps really run?'),
      code: docker`
        FROM node:22-alpine
        WORKDIR /app
        COPY . .
        RUN npm ci
        RUN npm run build
      `,
      antworten: ['nur `npm run build`', '`COPY . .`, `npm ci` und `npm run build`', 'gar keine', 'nur `COPY . .`'],
      richtig: 1,
      erklaerung: t(
        '`COPY . .` kopiert auch `src/` - diese Schicht ändert sich, und alles danach läuft neu, auch das lange `npm ci`. Deshalb zuerst nur `package*.json` kopieren.',
        '`COPY . .` also copies `src/` - this layer changes, and everything after it runs again, including the long `npm ci`. That is why you copy only `package*.json` first.',
      ),
    },
    {
      id: 'docker-dockerfile-frei-react',
      stufe: 'frei',
      titel: t('Ein Image für die React-App', 'An image for the React app'),
      aufgabe: t(
        'Schreibe ein Dockerfile für das Projekt `todo-web`: Node baut die App (`npm ci`, `npm run build` → `dist/`), nginx liefert `dist/` aus `/usr/share/nginx/html` aus. Das Image soll kleiner als 100 MB sein, und nach einer Code-Änderung soll `npm ci` aus dem Cache kommen.',
        'Write a Dockerfile for the project `todo-web`: Node builds the app (`npm ci`, `npm run build` → `dist/`), nginx serves `dist/` from `/usr/share/nginx/html`. The image should be smaller than 100 MB, and after a code change `npm ci` should come from the cache.',
      ),
      modus: 'dockerfile',
      project: 'react',
      ignore: 'node_modules/\ndist/\n.git/',
      code: docker`
        # Stage 1: build

        # Stage 2: serve
      `,
      loesung: docker`
        FROM node:22-alpine AS build
        WORKDIR /app
        COPY package.json package-lock.json ./
        RUN npm ci
        COPY . .
        RUN npm run build

        FROM nginx:1.27-alpine
        COPY --from=build /app/dist /usr/share/nginx/html
        EXPOSE 80
      `,
      tests: [
        { name: t('nginx liefert die React-App aus', 'nginx serves the React app'), dockerfile: (r) => Boolean(r.run?.ok) },
        { name: t('Das Image ist kleiner als 100 MB', 'The image is smaller than 100 MB'), dockerfile: (r) => (r.image?.sizeMb ?? 9999) < 100 },
        { name: t('npm ci kommt nach einer Code-Änderung aus dem Cache', 'npm ci comes from the cache after a code change'), dockerfile: (r) => Boolean(r.second?.steps.some((s) => s.label.includes('npm ci') && s.cached)) },
      ],
      tipps: t(
        ['Zwei Stages: `FROM node:22-alpine AS build` und `FROM nginx:1.27-alpine`.', 'Erst `COPY package.json package-lock.json ./` und `RUN npm ci`, dann `COPY . .` und `RUN npm run build`.', 'In der zweiten Stage: `COPY --from=build /app/dist /usr/share/nginx/html`.'],
        ['Two stages: `FROM node:22-alpine AS build` and `FROM nginx:1.27-alpine`.', 'First `COPY package.json package-lock.json ./` and `RUN npm ci`, then `COPY . .` and `RUN npm run build`.', 'In the second stage: `COPY --from=build /app/dist /usr/share/nginx/html`.'],
      ),
    },
  ],

  'docker-compose': [
    {
      id: 'docker-compose-fehler-port',
      stufe: 'fehler',
      titel: t('Der falsche Port', 'The wrong port'),
      aufgabe: t(
        'Die Datenbank ist für Tools auf Port 5433 veröffentlicht - und seitdem startet die API nicht mehr. Warum? Behebe es, ohne die Veröffentlichung zu entfernen.',
        'The database is published on port 5433 for tools - and since then the API no longer starts. Why? Fix it without removing the published port.',
      ),
      modus: 'compose',
      code: yaml`
        services:
          db:
            image: postgres:17
            environment:
              POSTGRES_PASSWORD: secret
            ports:
              - "5433:5432"
            healthcheck:
              test: ["CMD-SHELL", "pg_isready -U postgres"]
          api:
            build: ./backend
            environment:
              SPRING_DATASOURCE_URL: jdbc:postgresql://db:5433/postgres
              SPRING_DATASOURCE_PASSWORD: secret
            ports:
              - "8080:8080"
            depends_on:
              db:
                condition: service_healthy
      `,
      loesung: yaml`
        services:
          db:
            image: postgres:17
            environment:
              POSTGRES_PASSWORD: secret
            ports:
              - "5433:5432"
            healthcheck:
              test: ["CMD-SHELL", "pg_isready -U postgres"]
          api:
            build: ./backend
            environment:
              SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/postgres
              SPRING_DATASOURCE_PASSWORD: secret
            ports:
              - "8080:8080"
            depends_on:
              db:
                condition: service_healthy
      `,
      tests: [
        { name: t('Beide Container laufen', 'Both containers are running'), compose: (r) => r.ok && r.containers.length === 2 },
        { name: t('db ist weiter auf Port 5433 veröffentlicht', 'db is still published on port 5433'), compose: (r) => Boolean(r.model?.services.find((s) => s.name === 'db')?.ports.some((p) => p.host === 5433)) },
      ],
      tipps: t(
        ['Die linke Zahl in `ports` gilt nur für deinen Rechner. Zwischen den Containern zählt der Port im Container.', 'Die API muss `db:5432` benutzen.'],
        ['The left number in `ports` only applies to your machine. Between containers the port inside the container counts.', 'The API has to use `db:5432`.'],
      ),
    },
  ],
}
