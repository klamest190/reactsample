import { js, yaml } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Code for chapter 8.10 - Docker Compose. `docker compose up` is simulated (src/docker/compose.ts):
 * start order, logs and the typical mistakes behave like in reality.
 */

const FULL_STACK = yaml`
  services:
    db:
      image: postgres:17
      environment:
        POSTGRES_DB: todo
        POSTGRES_USER: todo
        POSTGRES_PASSWORD: secret
      volumes:
        - db-data:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U todo"]
        interval: 5s
        retries: 5

    api:
      build: ./backend
      environment:
        SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/todo
        SPRING_DATASOURCE_USERNAME: todo
        SPRING_DATASOURCE_PASSWORD: secret
      ports:
        - "8080:8080"
      depends_on:
        db:
          condition: service_healthy

    web:
      build: ./frontend
      ports:
        - "3000:80"
      depends_on:
        - api

  volumes:
    db-data:
`

export const beispiele = {
  'docker-compose-einstieg': {
    code: FULL_STACK,
  },
  'docker-compose-localhost': {
    // On purpose: localhost inside the api container is the api container itself.
    code: FULL_STACK.replace('jdbc:postgresql://db:5432/todo', 'jdbc:postgresql://localhost:5432/todo'),
  },
  'docker-compose-uebung': {
    tipps: {
      de: [
        'Lies zuerst die rote Meldung: Ein Volume, das ein Service benutzt, muss ganz unten unter `volumes:` stehen.',
        'Die Datenbank startet nicht ohne `POSTGRES_PASSWORD` - und es muss dasselbe sein wie `SPRING_DATASOURCE_PASSWORD`.',
        'Im Container ist `localhost` der Container selbst. Die Datenbank heißt im Netzwerk so wie ihr Service: `db`.',
        'Damit die API wartet, bis die Datenbank bereit ist: `depends_on:` → `db:` → `condition: service_healthy` (der Healthcheck ist schon da).',
      ],
      en: [
        'Read the red message first: a volume used by a service must be listed at the very bottom under `volumes:`.',
        'The database does not start without `POSTGRES_PASSWORD` - and it must be the same as `SPRING_DATASOURCE_PASSWORD`.',
        'Inside a container, `localhost` is the container itself. In the network the database is called like its service: `db`.',
        'To make the API wait until the database is ready: `depends_on:` → `db:` → `condition: service_healthy` (the healthcheck is already there).',
      ],
    },
    code: yaml`
      services:
        db:
          image: postgres:17
          environment:
            POSTGRES_DB: todo
            POSTGRES_USER: todo
          volumes:
            - db-data:/var/lib/postgresql/data
          healthcheck:
            test: ["CMD-SHELL", "pg_isready -U todo"]
            interval: 5s

        api:
          build: ./backend
          environment:
            SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/todo
            SPRING_DATASOURCE_USERNAME: todo
            SPRING_DATASOURCE_PASSWORD: secret
          ports:
            - "8080:8080"
          depends_on:
            - db

        web:
          build: ./frontend
          ports:
            - "3000:80"
          depends_on:
            - api
    `,
    loesung: FULL_STACK,
    tests: [
      { name: { de: 'Alle drei Container laufen', en: 'All three containers are running' }, compose: (r) => r.ok && r.containers.length === 3 },
      { name: { de: 'Die API antwortet auf http://localhost:8080', en: 'The API answers on http://localhost:8080' }, compose: (r) => r.urls.some((u) => u.url.startsWith('http://localhost:8080') && u.ok) },
      { name: { de: 'Die React-App ist auf http://localhost:3000 erreichbar', en: 'The React app is reachable on http://localhost:3000' }, compose: (r) => r.urls.some((u) => u.url === 'http://localhost:3000' && u.ok) },
      {
        name: { de: 'Die API wartet, bis die Datenbank „healthy“ ist', en: 'The API waits until the database is “healthy”' },
        compose: (r) => Boolean(r.model?.services.find((s) => s.name === 'api')?.dependsOn.some((d) => d.service === 'db' && d.condition === 'service_healthy')),
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  ordner: js`
    todo/
    ├── compose.yaml
    ├── .env                  ← passwords, NOT in Git
    ├── backend/              ← Spring Boot + Dockerfile (chapter 8.9)
    │   ├── Dockerfile
    │   └── src/ …
    └── frontend/             ← React + Dockerfile + nginx.conf
        ├── Dockerfile
        └── src/ …
  `,
  befehle: js`
    docker compose up -d          # build what is needed, start everything in the background
    docker compose ps             # status of all containers of the project
    docker compose logs -f api    # follow the logs of one service
    docker compose up -d --build  # rebuild the images after code changes
    docker compose down           # stop and remove the containers (volumes stay)
    docker compose down -v        # ... and delete the volumes too - the data is gone
  `,
  env: js`
    # .env - next to compose.yaml, listed in .gitignore
    POSTGRES_PASSWORD=a-long-random-password
  `,
  envNutzen: yaml`
    services:
      db:
        environment:
          POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}      # taken from .env
      api:
        environment:
          SPRING_DATASOURCE_PASSWORD: \${POSTGRES_PASSWORD}
  `,
  netz: js`
    From the api container:
      db:5432            ✅  the service name is the host name
      localhost:5432     ❌  that is the api container itself
      db:5433            ❌  inside the network only the CONTAINER port counts

    From your machine (browser, curl):
      localhost:8080     ✅  because of  ports: - "8080:8080"
      localhost:5432     ❌  the db service publishes no port - and does not need to
  `,
  weiter: js`
    docker build -t registry.example.com/todo-api:1.0 ./backend
    docker push registry.example.com/todo-api:1.0     # into a registry (Docker Hub, GitHub, GitLab …)
    # on the server: the same compose.yaml with image: … instead of build: …
  `,
}
