import type { Entry } from './suggestions'

/**
 * Editor suggestions for part 8: Spring annotations and classes (on top of the
 * Java suggestions), Dockerfile instructions and compose.yaml keys.
 * Code is English, the explanations are bilingual - like in vorschlaege.ts.
 */

export const SPRING: Entry[] = [
  // --- Beans ------------------------------------------------------------------
  { label: '@SpringBootApplication', insert: '@SpringBootApplication', kind: 'keyword', info: { de: 'Die Startklasse: schaltet Komponenten-Scan und Auto-Konfiguration ein.', en: 'The main class: switches on component scanning and auto-configuration.' } },
  { label: '@RestController', insert: '@RestController', kind: 'keyword', info: { de: 'Bean, deren Methoden HTTP-Anfragen beantworten - Rückgaben werden zu JSON.', en: 'A bean whose methods answer HTTP requests - return values become JSON.' } },
  { label: '@Service', insert: '@Service', kind: 'keyword', info: { de: 'Bean mit Geschäftslogik.', en: 'A bean with business logic.' } },
  { label: '@Component', insert: '@Component', kind: 'keyword', info: { de: 'Allgemeine Bean - Spring erzeugt und verwaltet das Objekt.', en: 'A general bean - Spring creates and manages the object.' } },
  { label: '@Repository', insert: '@Repository', kind: 'keyword', info: { de: 'Bean für den Datenzugriff.', en: 'A bean for data access.' } },
  { label: '@Configuration', insert: '@Configuration', kind: 'keyword', info: { de: 'Klasse mit @Bean-Methoden.', en: 'A class with @Bean methods.' } },
  { label: '@Bean', insert: '@Bean\n$0', kind: 'keyword', info: { de: 'Der Rückgabewert dieser Methode wird eine Bean.', en: 'The return value of this method becomes a bean.' } },
  { label: '@Primary', insert: '@Primary', kind: 'keyword', info: { de: 'Gewinnt, wenn mehrere Beans passen.', en: 'Wins when several beans match.' } },
  { label: '@Qualifier', insert: '@Qualifier("$0")', kind: 'keyword', info: { de: 'Wählt eine Bean über ihren Namen.', en: 'Picks a bean by its name.' } },
  { label: '@Autowired', insert: '@Autowired', kind: 'keyword', info: { de: 'Feld-Injektion - besser: Konstruktor-Parameter.', en: 'Field injection - better: constructor parameters.' } },
  { label: '@Value', insert: '@Value("${$0}")', kind: 'keyword', info: { de: 'Wert aus application.properties: @Value("${app.name}")', en: 'A value from application.properties: @Value("${app.name}")' } },
  { label: '@Profile', insert: '@Profile("$0")', kind: 'keyword', info: { de: 'Bean nur in diesem Profil (z. B. "dev").', en: 'A bean only in this profile (e.g. "dev").' } },
  { label: '@PostConstruct', insert: '@PostConstruct', kind: 'keyword', info: { de: 'Läuft einmal, nachdem die Bean fertig injiziert ist.', en: 'Runs once, after the bean has been injected.' } },
  // --- Web ----------------------------------------------------------------------
  { label: '@RequestMapping', insert: '@RequestMapping("/api/$0")', kind: 'keyword', info: { de: 'Gemeinsamer Pfad für alle Methoden des Controllers.', en: 'A common path for all methods of the controller.' } },
  { label: '@GetMapping', insert: '@GetMapping("$0")', kind: 'keyword', info: { de: 'Beantwortet GET-Anfragen (lesen).', en: 'Answers GET requests (reading).' } },
  { label: '@PostMapping', insert: '@PostMapping', kind: 'keyword', info: { de: 'Beantwortet POST-Anfragen (anlegen).', en: 'Answers POST requests (creating).' } },
  { label: '@PutMapping', insert: '@PutMapping("/{id}")', kind: 'keyword', info: { de: 'Beantwortet PUT-Anfragen (ersetzen).', en: 'Answers PUT requests (replacing).' } },
  { label: '@PatchMapping', insert: '@PatchMapping("/{id}")', kind: 'keyword', info: { de: 'Beantwortet PATCH-Anfragen (teilweise ändern).', en: 'Answers PATCH requests (partial changes).' } },
  { label: '@DeleteMapping', insert: '@DeleteMapping("/{id}")', kind: 'keyword', info: { de: 'Beantwortet DELETE-Anfragen (löschen).', en: 'Answers DELETE requests (deleting).' } },
  { label: '@PathVariable', insert: '@PathVariable ', kind: 'keyword', info: { de: 'Teil des Pfads: /todos/{id} → id', en: 'Part of the path: /todos/{id} → id' } },
  { label: '@RequestParam', insert: '@RequestParam ', kind: 'keyword', info: { de: 'Query-Parameter: /todos?done=true', en: 'A query parameter: /todos?done=true' } },
  { label: '@RequestBody', insert: '@RequestBody ', kind: 'keyword', info: { de: 'JSON aus dem Body → Objekt.', en: 'JSON from the body → object.' } },
  { label: '@ResponseStatus', insert: '@ResponseStatus(HttpStatus.$0)', kind: 'keyword', info: { de: 'Status-Code der Antwort, z. B. CREATED.', en: 'Status code of the response, e.g. CREATED.' } },
  { label: '@Valid', insert: '@Valid ', kind: 'keyword', info: { de: 'Prüft die Constraints des Objekts (@NotBlank …).', en: 'Checks the object’s constraints (@NotBlank …).' } },
  { label: '@NotBlank', insert: '@NotBlank', kind: 'keyword', info: { de: 'Text darf nicht leer sein.', en: 'Text must not be blank.' } },
  { label: '@Size', insert: '@Size(max = $0)', kind: 'keyword', info: { de: 'Länge von Text oder Liste begrenzen.', en: 'Limit the length of a text or list.' } },
  { label: '@Min', insert: '@Min($0)', kind: 'keyword', info: { de: 'Zahl mindestens …', en: 'Number at least …' } },
  { label: '@ExceptionHandler', insert: '@ExceptionHandler($0.class)', kind: 'keyword', info: { de: 'Methode, die eine Exception in eine Antwort verwandelt.', en: 'A method that turns an exception into a response.' } },
  { label: '@RestControllerAdvice', insert: '@RestControllerAdvice', kind: 'keyword', info: { de: 'Klasse mit @ExceptionHandler-Methoden für alle Controller.', en: 'A class with @ExceptionHandler methods for all controllers.' } },
  // --- JPA ----------------------------------------------------------------------
  { label: '@Entity', insert: '@Entity', kind: 'keyword', info: { de: 'Klasse ↔ Tabelle in der Datenbank.', en: 'Class ↔ database table.' } },
  { label: '@Id', insert: '@Id @GeneratedValue', kind: 'keyword', info: { de: 'Primärschlüssel - @GeneratedValue vergibt ihn automatisch.', en: 'Primary key - @GeneratedValue assigns it automatically.' } },
  // --- Classes ------------------------------------------------------------------
  { label: 'ResponseEntity.ok', insert: 'ResponseEntity.ok($0)', kind: 'function', info: { de: 'Antwort 200 mit Body.', en: 'Response 200 with a body.' } },
  { label: 'ResponseEntity.notFound', insert: 'ResponseEntity.notFound().build()', kind: 'function', info: { de: 'Antwort 404 ohne Body.', en: 'Response 404 without a body.' } },
  { label: 'ResponseEntity.status', insert: 'ResponseEntity.status(HttpStatus.$0).body()', kind: 'function', info: { de: 'Antwort mit beliebigem Status.', en: 'A response with any status.' } },
  { label: 'ResponseEntity.noContent', insert: 'ResponseEntity.noContent().build()', kind: 'function', info: { de: 'Antwort 204 - erfolgreich, ohne Inhalt.', en: 'Response 204 - successful, without content.' } },
  { label: 'ResponseStatusException', insert: 'new ResponseStatusException(HttpStatus.NOT_FOUND, "$0")', kind: 'function', info: { de: 'Exception mit HTTP-Status.', en: 'An exception with an HTTP status.' } },
  { label: 'SpringApplication.run', insert: 'SpringApplication.run($0.class, args);', kind: 'function', info: { de: 'Startet die Anwendung (Kontext + Tomcat).', en: 'Starts the application (context + Tomcat).' } },
  { label: 'JpaRepository', insert: 'JpaRepository<$0, Long>', kind: 'keyword', info: { de: 'Fertiges Repository: findAll, findById, save, deleteById …', en: 'A ready-made repository: findAll, findById, save, deleteById …' } },
  { label: 'CommandLineRunner', insert: 'CommandLineRunner', kind: 'keyword', info: { de: 'Bean, deren run() nach dem Start einmal läuft.', en: 'A bean whose run() runs once after startup.' } },
  { label: 'HttpStatus.CREATED', insert: 'HttpStatus.CREATED', kind: 'keyword', info: { de: '201 - angelegt.', en: '201 - created.' } },
  { label: 'HttpStatus.NOT_FOUND', insert: 'HttpStatus.NOT_FOUND', kind: 'keyword', info: { de: '404 - nicht gefunden.', en: '404 - not found.' } },
  { label: 'HttpStatus.NO_CONTENT', insert: 'HttpStatus.NO_CONTENT', kind: 'keyword', info: { de: '204 - ohne Inhalt.', en: '204 - no content.' } },
  { label: 'HttpStatus.BAD_REQUEST', insert: 'HttpStatus.BAD_REQUEST', kind: 'keyword', info: { de: '400 - fehlerhafte Anfrage.', en: '400 - bad request.' } },
  { label: '.findAll', insert: 'findAll()', kind: 'method', info: { de: 'Repository: alle Einträge.', en: 'Repository: all entries.' } },
  { label: '.findById', insert: 'findById($0)', kind: 'method', info: { de: 'Repository: Optional mit dem Eintrag.', en: 'Repository: an Optional with the entry.' } },
  { label: '.save', insert: 'save($0)', kind: 'method', info: { de: 'Repository: speichern (neu oder ändern).', en: 'Repository: save (new or update).' } },
  { label: '.deleteById', insert: 'deleteById($0)', kind: 'method', info: { de: 'Repository: löschen.', en: 'Repository: delete.' } },
  { label: '.orElseThrow', insert: 'orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND))', kind: 'method', info: { de: 'Optional: Wert oder 404.', en: 'Optional: the value or 404.' } },
]

export const DOCKERFILE: Entry[] = [
  { label: 'FROM', insert: 'FROM $0', kind: 'keyword', info: { de: 'Basis-Image - jede Stage beginnt damit. `FROM maven:3.9-eclipse-temurin-21 AS build`', en: 'Base image - every stage starts with it. `FROM maven:3.9-eclipse-temurin-21 AS build`' } },
  { label: 'WORKDIR', insert: 'WORKDIR /app', kind: 'keyword', info: { de: 'Arbeitsordner für alle folgenden Befehle.', en: 'Working directory for all following instructions.' } },
  { label: 'COPY', insert: 'COPY $0 .', kind: 'keyword', info: { de: 'Dateien aus dem Projekt ins Image kopieren. `--from=build` holt sie aus einer anderen Stage.', en: 'Copy files from the project into the image. `--from=build` takes them from another stage.' } },
  { label: 'RUN', insert: 'RUN $0', kind: 'keyword', info: { de: 'Befehl beim BAUEN ausführen - das Ergebnis wird eine Schicht.', en: 'Run a command while BUILDING - the result becomes a layer.' } },
  { label: 'ENV', insert: 'ENV $0=', kind: 'keyword', info: { de: 'Umgebungsvariable im Image.', en: 'An environment variable in the image.' } },
  { label: 'ARG', insert: 'ARG $0', kind: 'keyword', info: { de: 'Variable nur während des Builds.', en: 'A variable only during the build.' } },
  { label: 'EXPOSE', insert: 'EXPOSE 8080', kind: 'keyword', info: { de: 'Dokumentiert den Port - veröffentlicht wird er erst mit `-p`.', en: 'Documents the port - it is only published with `-p`.' } },
  { label: 'USER', insert: 'USER $0', kind: 'keyword', info: { de: 'Ab hier als dieser Benutzer statt root.', en: 'From here on as this user instead of root.' } },
  { label: 'ENTRYPOINT', insert: 'ENTRYPOINT ["java", "-jar", "app.jar"]', kind: 'keyword', info: { de: 'Startbefehl des Containers (JSON-Form!).', en: 'The container’s start command (JSON form!).' } },
  { label: 'CMD', insert: 'CMD ["$0"]', kind: 'keyword', info: { de: 'Standard-Befehl bzw. -Argumente beim Start.', en: 'Default command or arguments at startup.' } },
  { label: 'HEALTHCHECK', insert: 'HEALTHCHECK CMD $0', kind: 'keyword', info: { de: 'Wie Docker prüft, ob der Container gesund ist.', en: 'How Docker checks whether the container is healthy.' } },
  { label: 'LABEL', insert: 'LABEL $0=""', kind: 'keyword', info: { de: 'Metadaten, z. B. Autor oder Version.', en: 'Metadata, e.g. author or version.' } },
  { label: 'eclipse-temurin:21-jre', insert: 'eclipse-temurin:21-jre', kind: 'snippet', info: { de: 'Java-Laufzeit ohne Compiler - für das fertige Image.', en: 'Java runtime without compiler - for the final image.' } },
  { label: 'maven:3.9-eclipse-temurin-21', insert: 'maven:3.9-eclipse-temurin-21', kind: 'snippet', info: { de: 'Maven + JDK - zum Bauen.', en: 'Maven + JDK - for building.' } },
  { label: 'node:22-alpine', insert: 'node:22-alpine', kind: 'snippet', info: { de: 'Node.js, klein - zum Bauen der React-App.', en: 'Node.js, small - for building the React app.' } },
  { label: 'nginx:1.27-alpine', insert: 'nginx:1.27-alpine', kind: 'snippet', info: { de: 'Webserver für die fertige React-App.', en: 'Web server for the finished React app.' } },
]

export const COMPOSE: Entry[] = [
  { label: 'services', insert: 'services:\n  $0', kind: 'keyword', info: { de: 'Die Container der Anwendung.', en: 'The containers of the application.' } },
  { label: 'image', insert: 'image: $0', kind: 'keyword', info: { de: 'Fertiges Image, z. B. postgres:17', en: 'A ready-made image, e.g. postgres:17' } },
  { label: 'build', insert: 'build: ./$0', kind: 'keyword', info: { de: 'Image aus einem Ordner mit Dockerfile bauen.', en: 'Build the image from a folder with a Dockerfile.' } },
  { label: 'ports', insert: 'ports:\n  - "$0:"', kind: 'keyword', info: { de: '"HOST:CONTAINER" - links dein Rechner, rechts der Container.', en: '"HOST:CONTAINER" - your machine on the left, the container on the right.' } },
  { label: 'environment', insert: 'environment:\n  $0: ', kind: 'keyword', info: { de: 'Umgebungsvariablen - SPRING_DATASOURCE_URL ↔ spring.datasource.url', en: 'Environment variables - SPRING_DATASOURCE_URL ↔ spring.datasource.url' } },
  { label: 'depends_on', insert: 'depends_on:\n  $0:\n    condition: service_healthy', kind: 'keyword', info: { de: 'Startreihenfolge - mit service_healthy wird gewartet, bis der Dienst bereit ist.', en: 'Start order - with service_healthy it waits until the service is ready.' } },
  { label: 'healthcheck', insert: 'healthcheck:\n  test: ["CMD-SHELL", "$0"]\n  interval: 5s', kind: 'keyword', info: { de: 'Befehl, der prüft, ob der Dienst bereit ist.', en: 'A command that checks whether the service is ready.' } },
  { label: 'volumes', insert: 'volumes:\n  - $0', kind: 'keyword', info: { de: 'Daten, die einen Neustart überleben: name:/pfad', en: 'Data that survives a restart: name:/path' } },
  { label: 'restart', insert: 'restart: unless-stopped', kind: 'keyword', info: { de: 'Container nach einem Absturz neu starten.', en: 'Restart the container after a crash.' } },
  { label: 'POSTGRES_PASSWORD', insert: 'POSTGRES_PASSWORD: ', kind: 'snippet', info: { de: 'Pflicht für postgres.', en: 'Required for postgres.' } },
  { label: 'SPRING_DATASOURCE_URL', insert: 'SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/$0', kind: 'snippet', info: { de: 'Datenbank-Adresse für Spring - mit dem Service-Namen, nicht localhost!', en: 'Database address for Spring - with the service name, not localhost!' } },
]
