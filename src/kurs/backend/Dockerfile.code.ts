import { docker, js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'
import type { TerminalTask } from '../demos/DockerTerminal'

/**
 * Code for chapter 8.9 - The Dockerfile. Builds are simulated (src/docker/build.ts) with the
 * course projects as build context: `todo-api` (Spring Boot) and `todo-web` (React).
 */

const JAVA_IGNORE = js`
  target/
  .git/
  .idea/
  *.md
`

const MULTI_STAGE = docker`
  # --- Stage 1: build with Maven and the full JDK ---------------------------
  FROM maven:3.9-eclipse-temurin-21 AS build
  WORKDIR /app
  COPY pom.xml .
  RUN mvn -q dependency:go-offline          # cached as long as pom.xml does not change
  COPY src ./src
  RUN mvn -q package -DskipTests

  # --- Stage 2: only what is needed to RUN -----------------------------------
  FROM eclipse-temurin:21-jre
  WORKDIR /app
  RUN useradd --system spring
  USER spring
  COPY --from=build /app/target/*.jar app.jar
  EXPOSE 8080
  ENTRYPOINT ["java", "-jar", "app.jar"]
`

export const beispiele = {
  'docker-dockerfile-einstieg': {
    code: docker`
      FROM maven:3.9-eclipse-temurin-21
      WORKDIR /app
      COPY . .
      RUN mvn package
      CMD java -jar target/todo-api-0.0.1-SNAPSHOT.jar
    `,
    project: 'spring',
    ignore: '',
  },
  'docker-dockerfile-cache': {
    code: docker`
      FROM maven:3.9-eclipse-temurin-21
      WORKDIR /app

      # 1. Only the dependency list - it changes rarely
      COPY pom.xml .
      RUN mvn -q dependency:go-offline

      # 2. The code - it changes all the time
      COPY src ./src
      RUN mvn -q package -DskipTests

      CMD ["java", "-jar", "target/todo-api-0.0.1-SNAPSHOT.jar"]
    `,
    project: 'spring',
    ignore: JAVA_IGNORE,
  },
  'docker-dockerfile-multistage': {
    code: MULTI_STAGE,
    project: 'spring',
    ignore: JAVA_IGNORE,
  },
  'docker-dockerfile-react': {
    code: docker`
      # --- Build the React app with Node --------------------------------------
      FROM node:22-alpine AS build
      WORKDIR /app
      COPY package.json package-lock.json ./
      RUN npm ci
      COPY . .
      RUN npm run build                        # → /app/dist

      # --- Serve the static files with nginx ---------------------------------
      FROM nginx:1.27-alpine
      COPY nginx.conf /etc/nginx/conf.d/default.conf
      COPY --from=build /app/dist /usr/share/nginx/html
      EXPOSE 80
    `,
    project: 'react',
    ignore: js`
      node_modules/
      dist/
      .git/
      *.md
    `,
  },
  'docker-dockerfile-uebung': {
    tipps: {
      de: [
        'Zuerst nur `COPY pom.xml .` und `RUN mvn -q dependency:go-offline`, danach erst `COPY src ./src` und `RUN mvn -q package -DskipTests` - dann bleibt der Download im Cache.',
        'Zwei Stages: `FROM maven:3.9-eclipse-temurin-21 AS build` zum Bauen, `FROM eclipse-temurin:21-jre` für das fertige Image. Die JAR holst du mit `COPY --from=build /app/target/*.jar app.jar`.',
        'Nicht als root: `RUN useradd --system spring` und danach `USER spring`. Zum Schluss `ENTRYPOINT ["java", "-jar", "app.jar"]`.',
      ],
      en: [
        'First only `COPY pom.xml .` and `RUN mvn -q dependency:go-offline`, only then `COPY src ./src` and `RUN mvn -q package -DskipTests` - so the download stays in the cache.',
        'Two stages: `FROM maven:3.9-eclipse-temurin-21 AS build` for building, `FROM eclipse-temurin:21-jre` for the final image. Get the JAR with `COPY --from=build /app/target/*.jar app.jar`.',
        'Not as root: `RUN useradd --system spring` and then `USER spring`. Finally `ENTRYPOINT ["java", "-jar", "app.jar"]`.',
      ],
    },
    code: docker`
      FROM maven:3.9-eclipse-temurin-21
      WORKDIR /app
      COPY . .
      RUN mvn package
      CMD java -jar target/todo-api-0.0.1-SNAPSHOT.jar
    `,
    loesung: MULTI_STAGE,
    project: 'spring',
    ignore: JAVA_IGNORE,
    tests: [
      { name: { de: 'Das Image baut ohne Fehler und startet', en: 'The image builds without errors and starts' }, dockerfile: (r) => !r.first.error && Boolean(r.run?.ok) },
      { name: { de: 'Das fertige Image basiert auf einer JRE (kein JDK, kein Maven)', en: 'The final image is based on a JRE (no JDK, no Maven)' }, dockerfile: (r) => Boolean(r.image?.base.includes('jre')) },
      { name: { de: 'Das Image ist kleiner als 350 MB', en: 'The image is smaller than 350 MB' }, dockerfile: (r) => (r.image?.sizeMb ?? 9999) < 350 },
      {
        name: { de: 'Nach einer Code-Änderung kommt der Abhängigkeits-Download aus dem Cache', en: 'After a code change the dependency download comes from the cache' },
        dockerfile: (r) => Boolean(r.second?.steps.some((s) => s.label.includes('dependency:go-offline') && s.cached)),
      },
      { name: { de: 'Der Container läuft nicht als root', en: 'The container does not run as root' }, dockerfile: (r) => Boolean(r.image && r.image.user !== 'root') },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Tasks for the terminal at the end of the chapter: build the image and run it. */
export const terminalTasks: TerminalTask[] = [
  {
    text: { de: 'Baue das Image aus dem Dockerfile und nenne es `todo-api`.', en: 'Build the image from the Dockerfile and name it `todo-api`.' },
    command: 'docker build -t todo-api .',
    done: (s) => s.images.some((i) => i.repository === 'todo-api'),
  },
  {
    text: { de: 'Starte es im Hintergrund als `api` mit Port 8080.', en: 'Start it in the background as `api` with port 8080.' },
    command: 'docker run -d --name api -p 8080:8080 todo-api',
    done: (s) => s.containers.some((c) => c.name === 'api' && c.status === 'running' && c.ports.some((p) => p.host === 8080 && p.container === 8080)),
  },
  {
    text: { de: 'Frag die API: `curl http://localhost:8080/api/todos`', en: 'Ask the API: `curl http://localhost:8080/api/todos`' },
    command: 'curl http://localhost:8080/api/todos',
    done: (s) => s.history.some((h) => /curl .*8080\/api\/todos/.test(h)) && s.containers.some((c) => c.name === 'api' && c.status === 'running'),
  },
]

export const terminalDockerfile = MULTI_STAGE
export const terminalIgnore = JAVA_IGNORE

export const codeBloecke = {
  befehle: docker`
    FROM image:tag          the base image - every stage starts with it
    WORKDIR /app            working directory for everything that follows (created if needed)
    COPY source target      files from the project (or --from=stage from another stage)
    RUN command             runs while BUILDING - the result becomes a layer
    ENV KEY=value           environment variable in the image
    EXPOSE 8080             documents the port (published only with -p)
    USER name               from here on as this user instead of root
    ENTRYPOINT ["…"]        the start command of the container
    CMD ["…"]               default command or arguments at startup
  `,
  bauen: js`
    $ docker build -t todo-api .        # "." = the build context: this folder
    $ docker images
    REPOSITORY   TAG      IMAGE ID       SIZE
    todo-api     latest   3f1c9a2b7d4e   305MB
    $ docker run -d -p 8080:8080 todo-api
  `,
  run: docker`
    RUN java -jar app.jar       # WRONG: runs during the build - the build never ends
    CMD ["java", "-jar", "app.jar"]   # right: runs when the CONTAINER starts
  `,
  layers: docker`
    FROM eclipse-temurin:21-jre     ─┐
    WORKDIR /app                     │  cached layers - identical for every build
    RUN useradd --system spring     ─┘
    COPY --from=build … app.jar     ← new layer: only this changes when the code changes
  `,
}
