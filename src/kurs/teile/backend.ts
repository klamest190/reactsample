import { laden, type Teil } from './typen'

export const backendTeil: Teil = {
  id: 'backend',
  nummer: 8,
  titel: { de: 'Backend: Spring Boot & Docker', en: 'Backend: Spring Boot & Docker' },
  kurztitel: { de: 'Spring & Docker', en: 'Spring & Docker' },
  bereich: 'backend',
  beschreibung: {
    de: 'Die Serverseite: REST-APIs mit Spring Boot, Dependency Injection, Validierung und Datenbanken - dann alles in Docker-Container verpackt und mit Docker Compose gestartet. Spring läuft hier auf der Java-Laufzeit aus Teil 7, Docker in einem Simulator.',
    en: 'The server side: REST APIs with Spring Boot, dependency injection, validation and databases - then everything packed into Docker containers and started with Docker Compose. Spring runs on the Java runtime from part 7, Docker in a simulator.',
  },
  kapitel: [
    {
      id: 'spring-start',
      titel: { de: 'Hallo Spring Boot', en: 'Hello Spring Boot' },
      kurz: {
        de: 'Was ein Backend macht, HTTP in fünf Minuten und der erste Controller.',
        en: 'What a backend does, HTTP in five minutes and the first controller.',
      },
      dauer: 35,
      lernziele: {
        de: ['Anfrage und Antwort in HTTP beschreiben', 'Methoden und Status-Codes zuordnen', 'Ein Spring-Boot-Projekt lesen und starten', 'Endpunkte mit @GetMapping und Parametern schreiben'],
        en: ['Describe request and response in HTTP', 'Match methods and status codes', 'Read and start a Spring Boot project', 'Write endpoints with @GetMapping and parameters'],
      },
      stichworte: ['Spring', 'Spring Boot', 'backend', 'Backend', 'HTTP', 'REST', 'status code', 'Statuscode', '@RestController', '@GetMapping', '@RequestParam', '@PathVariable', 'Tomcat', 'Maven', 'pom.xml', 'start.spring.io', 'JSON'],
      Komponente: {
        de: laden(() => import('../backend/SpringStart'), 'SpringStart'),
        en: laden(() => import('../backend/SpringStart.en'), 'SpringStart'),
      },
    },
    {
      id: 'spring-beans',
      titel: { de: 'Beans & Dependency Injection', en: 'Beans & Dependency Injection' },
      kurz: {
        de: 'Spring erzeugt die Objekte und reicht sie dorthin, wo sie gebraucht werden.',
        en: 'Spring creates the objects and passes them where they are needed.',
      },
      dauer: 40,
      lernziele: {
        de: ['Dependency Injection erklären', 'Beans mit @Component, @Service und @Bean anlegen', 'Konstruktor-Injektion einsetzen', 'Fehlende und mehrdeutige Beans beheben'],
        en: ['Explain dependency injection', 'Create beans with @Component, @Service and @Bean', 'Use constructor injection', 'Fix missing and ambiguous beans'],
      },
      stichworte: ['bean', 'Bean', 'dependency injection', 'Dependency Injection', 'DI', 'IoC', '@Component', '@Service', '@Autowired', '@Bean', '@Configuration', '@Primary', '@Qualifier', 'singleton', 'CommandLineRunner', 'NoUniqueBeanDefinitionException'],
      Komponente: {
        de: laden(() => import('../backend/SpringBeans'), 'SpringBeans'),
        en: laden(() => import('../backend/SpringBeans.en'), 'SpringBeans'),
      },
    },
    {
      id: 'spring-rest',
      titel: { de: 'REST-APIs mit Controllern', en: 'REST APIs with Controllers' },
      kurz: {
        de: 'Ressourcen, die fünf Methoden, JSON-Bodies und passende Status-Codes.',
        en: 'Resources, the five methods, JSON bodies and fitting status codes.',
      },
      dauer: 45,
      lernziele: {
        de: ['Endpunkte nach REST-Konventionen entwerfen', 'CRUD mit GET, POST, PUT und DELETE umsetzen', 'Mit ResponseEntity Status-Codes setzen', 'Wissen, wie Objekte zu JSON werden'],
        en: ['Design endpoints following REST conventions', 'Implement CRUD with GET, POST, PUT and DELETE', 'Set status codes with ResponseEntity', 'Know how objects become JSON'],
      },
      stichworte: ['REST', 'API', 'CRUD', '@PostMapping', '@PutMapping', '@DeleteMapping', '@RequestMapping', '@RequestBody', 'ResponseEntity', 'DTO', 'record', 'Jackson', 'JSON', '201', '204', '404', 'Location'],
      Komponente: {
        de: laden(() => import('../backend/SpringRest'), 'SpringRest'),
        en: laden(() => import('../backend/SpringRest.en'), 'SpringRest'),
      },
    },
    {
      id: 'spring-fehler',
      titel: { de: 'Validierung & Fehlerbehandlung', en: 'Validation & Error Handling' },
      kurz: {
        de: 'Eingaben mit @Valid prüfen und Exceptions in klare Antworten verwandeln.',
        en: 'Check input with @Valid and turn exceptions into clear answers.',
      },
      dauer: 40,
      lernziele: {
        de: ['Eingaben mit Bean Validation prüfen', 'Exceptions auf passende Status-Codes abbilden', 'Fehler zentral mit @RestControllerAdvice behandeln', 'Fehlerantworten als ProblemDetail liefern'],
        en: ['Check input with Bean Validation', 'Map exceptions to fitting status codes', 'Handle errors centrally with @RestControllerAdvice', 'Return error answers as ProblemDetail'],
      },
      stichworte: ['validation', 'Validierung', '@Valid', '@NotBlank', '@Size', 'Bean Validation', 'exception', '@ExceptionHandler', '@RestControllerAdvice', 'ResponseStatusException', '@ResponseStatus', 'ProblemDetail', '400', '500'],
      Komponente: {
        de: laden(() => import('../backend/SpringErrors'), 'SpringErrors'),
        en: laden(() => import('../backend/SpringErrors.en'), 'SpringErrors'),
      },
    },
    {
      id: 'spring-daten',
      titel: { de: 'Datenbanken mit Spring Data JPA', en: 'Databases with Spring Data JPA' },
      kurz: {
        de: 'Entities, Repositories ohne Implementierung und Abfragen aus Methodennamen.',
        en: 'Entities, repositories without an implementation and queries from method names.',
      },
      dauer: 45,
      lernziele: {
        de: ['Entities mit @Entity und @Id beschreiben', 'Mit JpaRepository speichern und laden', 'Abfragen aus Methodennamen ableiten', 'Controller, Service und Repository trennen'],
        en: ['Describe entities with @Entity and @Id', 'Save and load with JpaRepository', 'Derive queries from method names', 'Separate controller, service and repository'],
      },
      stichworte: ['JPA', 'Hibernate', 'Spring Data', 'JpaRepository', '@Entity', '@Id', '@GeneratedValue', 'repository', 'Repository', 'SQL', 'database', 'Datenbank', 'H2', 'PostgreSQL', 'derived query', 'findBy', 'Service', 'ORM'],
      Komponente: {
        de: laden(() => import('../backend/SpringData'), 'SpringData'),
        en: laden(() => import('../backend/SpringData.en'), 'SpringData'),
      },
    },
    {
      id: 'spring-konfig',
      titel: { de: 'Konfiguration, Profile & Tests', en: 'Configuration, Profiles & Tests' },
      kurz: {
        de: 'Einstellungen außerhalb des Codes, verschiedene Umgebungen - und wie man Spring-Apps testet.',
        en: 'Settings outside the code, different environments - and how Spring apps are tested.',
      },
      dauer: 35,
      lernziele: {
        de: ['Werte mit @Value und @ConfigurationProperties lesen', 'Profile für verschiedene Umgebungen einsetzen', 'Konfiguration per Umgebungsvariable überschreiben', 'Controller mit MockMvc testen'],
        en: ['Read values with @Value and @ConfigurationProperties', 'Use profiles for different environments', 'Override configuration with environment variables', 'Test controllers with MockMvc'],
      },
      stichworte: ['application.properties', 'configuration', 'Konfiguration', '@Value', '@ConfigurationProperties', 'profile', 'Profil', '@Profile', 'environment variable', 'Umgebungsvariable', 'MockMvc', '@SpringBootTest', '@WebMvcTest', 'test', 'Test'],
      Komponente: {
        de: laden(() => import('../backend/SpringConfig'), 'SpringConfig'),
        en: laden(() => import('../backend/SpringConfig.en'), 'SpringConfig'),
      },
    },
    {
      id: 'spring-react',
      titel: { de: 'React trifft Spring Boot', en: 'React Meets Spring Boot' },
      kurz: {
        de: 'Die ToDo-App bekommt einen Server: fetch, CORS, der Vite-Proxy - und eine Full-Stack-Werkstatt.',
        en: 'The todo app gets a server: fetch, CORS, the Vite proxy - and a full-stack workshop.',
      },
      dauer: 40,
      lernziele: {
        de: ['Frontend und Backend über HTTP verbinden', 'Antworten mit fetch sicher auswerten', 'CORS verstehen und lösen', 'Den Weg von der Entwicklung in die Produktion kennen'],
        en: ['Connect frontend and backend via HTTP', 'Evaluate answers safely with fetch', 'Understand and solve CORS', 'Know the way from development to production'],
      },
      stichworte: ['CORS', 'fetch', 'full stack', 'Full-Stack', 'Vite proxy', 'Proxy', '@CrossOrigin', 'same-origin', 'nginx', 'frontend', 'Frontend'],
      Komponente: {
        de: laden(() => import('../backend/SpringReact'), 'SpringReact'),
        en: laden(() => import('../backend/SpringReact.en'), 'SpringReact'),
      },
    },
    {
      id: 'docker-start',
      titel: { de: 'Container & Images', en: 'Containers & Images' },
      kurz: {
        de: 'Warum Container, was ein Image ist - und die Docker-Befehle für jeden Tag im Terminal.',
        en: 'Why containers, what an image is - and the everyday Docker commands in the terminal.',
      },
      dauer: 30,
      lernziele: {
        de: ['Container, Images und virtuelle Maschinen unterscheiden', 'Container mit docker run starten und verwalten', 'Ports und Umgebungsvariablen setzen', 'Daten mit Volumes erhalten'],
        en: ['Tell containers, images and virtual machines apart', 'Start and manage containers with docker run', 'Set ports and environment variables', 'Keep data with volumes'],
      },
      stichworte: ['Docker', 'container', 'Container', 'image', 'Image', 'docker run', 'docker ps', 'docker logs', 'port', 'Port', 'volume', 'Volume', 'Docker Hub', 'registry', 'VM'],
      Komponente: {
        de: laden(() => import('../backend/DockerStart'), 'DockerStart'),
        en: laden(() => import('../backend/DockerStart.en'), 'DockerStart'),
      },
    },
    {
      id: 'docker-dockerfile',
      titel: { de: 'Das eigene Image: Dockerfile', en: 'Your Own Image: the Dockerfile' },
      kurz: {
        de: 'Anweisungen, Schichten und Build-Cache, .dockerignore und Multi-Stage-Builds für Spring und React.',
        en: 'Instructions, layers and the build cache, .dockerignore and multi-stage builds for Spring and React.',
      },
      dauer: 45,
      lernziele: {
        de: ['Ein Dockerfile schreiben und bauen', 'Den Build-Cache mit der richtigen Reihenfolge nutzen', 'Multi-Stage-Builds für kleine Images einsetzen', 'Images sicherer machen (eigener Benutzer, feste Versionen)'],
        en: ['Write and build a Dockerfile', 'Use the build cache with the right order', 'Use multi-stage builds for small images', 'Make images safer (own user, fixed versions)'],
      },
      stichworte: ['Dockerfile', 'docker build', 'layer', 'Schicht', 'cache', 'Cache', 'multi-stage', 'Multi-Stage', '.dockerignore', 'FROM', 'COPY', 'RUN', 'ENTRYPOINT', 'USER', 'nginx', 'JRE'],
      Komponente: {
        de: laden(() => import('../backend/Dockerfile'), 'Dockerfile'),
        en: laden(() => import('../backend/Dockerfile.en'), 'Dockerfile'),
      },
    },
    {
      id: 'docker-compose',
      titel: { de: 'Docker Compose: die ganze App', en: 'Docker Compose: the Whole App' },
      kurz: {
        de: 'Datenbank, Backend und Frontend in einer Datei - gestartet mit einem Befehl.',
        en: 'Database, backend and frontend in one file - started with one command.',
      },
      dauer: 40,
      lernziele: {
        de: ['Eine compose.yaml für mehrere Container schreiben', 'Container über Service-Namen verbinden', 'Die Startreihenfolge mit Healthchecks absichern', 'Konfiguration und Passwörter richtig übergeben'],
        en: ['Write a compose.yaml for several containers', 'Connect containers by service name', 'Secure the start order with healthchecks', 'Pass configuration and passwords the right way'],
      },
      stichworte: ['Docker Compose', 'compose.yaml', 'docker-compose', 'services', 'depends_on', 'healthcheck', 'network', 'Netzwerk', '.env', 'Kubernetes', 'deployment', 'Deployment'],
      Komponente: {
        de: laden(() => import('../backend/DockerCompose'), 'DockerCompose'),
        en: laden(() => import('../backend/DockerCompose.en'), 'DockerCompose'),
      },
    },
  ],
}
