/**
 * Self-test of the Docker simulator - the cases.
 *
 *   npm run test:backend
 *
 * Each case checks one rule of real Docker: the layer cache, multi-stage builds,
 * `.dockerignore`, user checks, compose start order and the classic mistakes.
 */

import { simulateBuild, type BuildResult } from './build'
import { execute, newState } from './cli'
import { composeUp, type ComposeResult } from './compose'
import { runCases, type RuntimeResult } from '../selbsttest/results'

type Case = { name: string; check: () => string | null }

const SPRING_MULTI_STAGE = `
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system spring
USER spring
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
`

const cached = (r: BuildResult, fragment: string) => r.second?.steps.find((s) => s.label.includes(fragment))?.cached

const COMPOSE = `
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: todo
      POSTGRES_PASSWORD: secret
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
  api:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/todo
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: secret
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy
volumes:
  db-data:
`

const running = (r: ComposeResult, service: string) => r.containers.find((c) => c.service === service)?.running

const cases: Case[] = [
  {
    name: 'Multi-stage build: small JRE image, cache survives a code change',
    check: () => {
      const r = simulateBuild(SPRING_MULTI_STAGE, { project: 'spring', ignore: 'target/\n.git/', change: 'code' })
      if (r.first.error) return r.first.error.message
      if (!r.image || r.image.sizeMb > 320) return `image too big: ${r.image?.sizeMb}`
      if (!cached(r, 'dependency:go-offline')) return 'dependency download should be CACHED after a code change'
      if (cached(r, 'mvn -q package')) return 'the package step must run again after a code change'
      if (!r.run?.ok) return 'the image should start: ' + r.run?.lines.join(' | ')
      if (r.findings.some((f) => f.severity !== 'info')) return 'unexpected hints: ' + r.findings.map((f) => f.rule).join(', ')
      return null
    },
  },
  {
    name: 'Changed dependencies invalidate the dependency layer',
    check: () => {
      const r = simulateBuild(SPRING_MULTI_STAGE, { project: 'spring', ignore: 'target/', change: 'dependencies' })
      return cached(r, 'dependency:go-offline') === false ? null : 'go-offline should run again when pom.xml changed'
    },
  },
  {
    name: 'COPY . . before the build: every change downloads everything again',
    check: () => {
      const r = simulateBuild('FROM maven:3.9-eclipse-temurin-21\nWORKDIR /app\nCOPY . .\nRUN mvn package\nCMD ["java", "-jar", "target/todo-api-0.0.1-SNAPSHOT.jar"]', { project: 'spring', change: 'code' })
      if (r.second!.seconds < 50) return 'the rebuild should be slow'
      const rules = r.findings.map((f) => f.rule)
      for (const rule of ['cache-order', 'dockerignore', 'multi-stage', 'DL3002']) if (!rules.includes(rule)) return `hint ${rule} missing`
      return null
    },
  },
  {
    name: 'A JAR that is not where the command expects it',
    check: () => {
      const r = simulateBuild(SPRING_MULTI_STAGE.replace('COPY --from=build /app/target/*.jar app.jar', 'COPY --from=build /app/target/*.jar /opt/app.jar'), { project: 'spring', ignore: 'target/' })
      return r.run && !r.run.ok && r.run.lines[0].includes('Unable to access jarfile') ? null : 'expected "Unable to access jarfile": ' + r.run?.lines.join(' | ')
    },
  },
  {
    name: 'USER without creating the user first',
    check: () => {
      const r = simulateBuild(SPRING_MULTI_STAGE.replace('RUN useradd --system spring\n', ''), { project: 'spring', ignore: 'target/' })
      return r.run?.lines[0].includes('unable to find user spring') ? null : 'expected the passwd error: ' + r.run?.lines.join(' | ')
    },
  },
  {
    name: 'Missing sources and unknown instructions are build errors',
    check: () => {
      const noPom = simulateBuild('FROM maven:3.9-eclipse-temurin-21\nWORKDIR /app\nCOPY src ./src\nRUN mvn package', { project: 'spring' })
      if (!noPom.first.error?.message.includes('no POM')) return 'expected "no POM": ' + noPom.first.error?.message
      const typo = simulateBuild('FORM node:22', { project: 'react' })
      if (!typo.first.error?.message.includes('did you mean from?')) return 'expected a "did you mean" hint: ' + typo.first.error?.message
      const missing = simulateBuild('FROM eclipse-temurin:21-jre\nCOPY target/*.jar app.jar', { project: 'spring', ignore: 'target/' })
      if (!missing.first.error?.message.includes('not found')) return 'target/ is ignored - COPY must fail: ' + missing.first.error?.message
      return null
    },
  },
  {
    name: 'React: node build stage + nginx, .dockerignore keeps node_modules out',
    check: () => {
      const file = 'FROM node:22-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:1.27-alpine\nCOPY --from=build /app/dist /usr/share/nginx/html'
      const without = simulateBuild(file, { project: 'react' })
      const withIgnore = simulateBuild(file, { project: 'react', ignore: 'node_modules\ndist\n.git', change: 'code' })
      if (without.first.contextMb < 150) return 'without .dockerignore node_modules must be sent'
      if (withIgnore.first.contextMb > 1) return 'with .dockerignore the context must be small'
      if (!withIgnore.run?.ok) return 'nginx should serve the app: ' + withIgnore.run?.lines.join(' | ')
      if (!cached(withIgnore, 'npm ci')) return 'npm ci should be cached after a code change'
      if (withIgnore.image!.sizeMb > 60) return 'the nginx image should be small'
      return null
    },
  },
  {
    name: 'Compose: the full stack starts in the right order',
    check: () => {
      const r = composeUp(COMPOSE)
      if (!r.ok) return 'not everything runs: ' + r.log.map((l) => l.text).join(' | ')
      const order = r.log.filter((l) => l.text.includes('Container')).map((l) => l.text)
      if (!order[0].includes('db')) return 'db must start first: ' + order.join(', ')
      return r.urls.some((u) => u.url === 'http://localhost:8080/api/todos' && u.ok) ? null : 'the API should answer on 8080'
    },
  },
  {
    name: 'Compose: localhost, host port, missing password, missing healthcheck',
    check: () => {
      if (running(composeUp(COMPOSE.replace('db:5432', 'localhost:5432')), 'api')) return 'localhost must fail'
      if (running(composeUp(COMPOSE.replace('db:5432', 'db:5433')), 'api')) return 'port 5433 must fail inside the network'
      if (running(composeUp(COMPOSE.replace('      POSTGRES_PASSWORD: secret\n', '')), 'db')) return 'postgres without password must exit'
      const plain = composeUp(COMPOSE.replace('      db:\n        condition: service_healthy', '      - db'))
      if (running(plain, 'api')) return 'without waiting for healthy the api starts too early'
      const restart = composeUp(COMPOSE.replace('      db:\n        condition: service_healthy', '      - db').replace('    build: ./backend', '    build: ./backend\n    restart: on-failure'))
      return running(restart, 'api') ? null : 'with restart: on-failure the second attempt must succeed'
    },
  },
  {
    name: 'Compose: validation like docker compose',
    check: () => {
      const unknown = composeUp('services:\n  web:\n    imag: nginx')
      if (!unknown.findings[0]?.en.includes('Additional property imag is not allowed')) return 'unknown key not reported'
      const volume = composeUp('services:\n  db:\n    image: postgres:17\n    environment:\n      POSTGRES_PASSWORD: x\n    volumes:\n      - data:/var/lib/postgresql/data')
      if (!volume.findings[0]?.en.includes('undefined volume data')) return 'undeclared volume not reported'
      const ports = composeUp('services:\n  a:\n    image: nginx\n    ports: ["8080:80"]\n  b:\n    image: nginx\n    ports: ["8080:80"]')
      return running(ports, 'b') ? 'the second container must not get port 8080' : null
    },
  },
  {
    name: 'Terminal: run, ports, names, logs and rm',
    check: () => {
      const s = newState()
      const text = (cmd: string) => execute(s, cmd).map((l) => l.text).join('\n')
      if (!text('docker run hello-world').includes('Hello from Docker!')) return 'hello-world'
      text('docker run -d --name web -p 8080:80 nginx')
      if (!text('curl http://localhost:8080').includes('Welcome to nginx!')) return 'curl nginx'
      if (!text('docker run -d -p 8080:80 nginx').includes('port is already allocated')) return 'port conflict'
      if (!text('docker run -d --name web nginx').includes('is already in use')) return 'name conflict'
      if (!text('docker rm web').includes('container is running')) return 'rm running'
      text('docker run -d --name db postgres:17')
      if (!text('docker logs db').includes('POSTGRES_PASSWORD')) return 'postgres without password'
      text('docker stop web')
      if (!text('curl localhost:8080').includes('Failed to connect')) return 'stopped container still answers'
      return text('docker ps').includes('web') ? 'stopped container in docker ps' : null
    },
  },
]

export function dockerRuntimeCheck(): RuntimeResult[] {
  return runCases(cases, (c) => c.check())
}
