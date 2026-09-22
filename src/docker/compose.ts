/**
 * DOCKER PART · `docker compose up` - simulated
 *
 * A compose.yaml describes several containers that belong together: here the
 * course's todo app with a database (postgres), the Spring Boot backend and the
 * React frontend (nginx). This file checks the file like `docker compose` does
 * (unknown keys, undefined volumes, port conflicts) and then plays the start:
 * in which order the containers start, what they log, which ones crash - and why.
 *
 * The typical mistakes behave like in reality:
 *   - `localhost` in the backend's database URL: inside a container, localhost is
 *     the container itself → "Connection refused". The database is reachable
 *     under its SERVICE NAME (`db`).
 *   - Using the host port (5433) instead of the container port (5432) inside the network.
 *   - `depends_on` only waits for the start, not until the database is ready -
 *     without a healthcheck the backend may be too early.
 *   - postgres refuses to start without POSTGRES_PASSWORD.
 */

import { findImage, splitImage } from './images'
import { YamlError, parseYaml, type Yaml } from './yaml'

export type ComposeFinding = { severity: 'error' | 'warning' | 'info'; line: number; de: string; en: string }

export type Port = { host: number | null; container: number; raw: string }
export type Mount = { source: string; target: string; named: boolean }
export type Dependency = { service: string; condition: 'service_started' | 'service_healthy' | 'service_completed_successfully' }

export type ComposeService = {
  name: string
  image?: string
  build?: string
  ports: Port[]
  environment: Record<string, string>
  dependsOn: Dependency[]
  volumes: Mount[]
  restart?: string
  healthcheck?: string
  command?: string
  kind: 'spring' | 'react' | 'postgres' | 'redis' | 'nginx' | 'other'
  line: number
}

export type ComposeModel = { project: string; services: ComposeService[]; volumes: string[] }

export type ContainerState = {
  name: string
  service: string
  image: string
  status: string
  running: boolean
  ports: string
}

export type LogLine = { service: string | null; text: string; kind: 'info' | 'ok' | 'error' | 'warn' }

export type ComposeResult = {
  ok: boolean
  findings: ComposeFinding[]
  model: ComposeModel | null
  log: LogLine[]
  containers: ContainerState[]
  /** What you would see in the browser or with curl on the host. */
  urls: { url: string; service: string; answer: string; ok: boolean }[]
}

const TOP_LEVEL = new Set(['version', 'name', 'services', 'volumes', 'networks', 'secrets', 'configs', 'include'])
const SERVICE_KEYS = new Set([
  'image', 'build', 'ports', 'environment', 'env_file', 'depends_on', 'volumes', 'networks', 'restart', 'command',
  'entrypoint', 'healthcheck', 'container_name', 'expose', 'working_dir', 'user', 'profiles', 'deploy', 'labels',
  'stdin_open', 'tty', 'platform', 'pull_policy', 'extra_hosts', 'hostname', 'secrets', 'configs', 'init',
  'stop_grace_period', 'logging', 'develop', 'mem_limit', 'cpus',
])

export function composeUp(source: string, project = 'todo'): ComposeResult {
  const findings: ComposeFinding[] = []
  const fail = (line: number, de: string, en: string): ComposeResult => {
    findings.push({ severity: 'error', line, de, en })
    return { ok: false, findings, model: null, log: [{ service: null, text: en, kind: 'error' }], containers: [], urls: [] }
  }

  let parsed: { value: Yaml; lines: Map<string, number> }
  try {
    parsed = parseYaml(source)
  } catch (error) {
    if (!(error instanceof YamlError)) throw error
    return fail(error.line, `YAML-Fehler in Zeile ${error.line}: ${error.message}`, `yaml: line ${error.line}: ${error.message}`)
  }
  const lineOf = (path: string) => parsed.lines.get(path) ?? 1
  const root = parsed.value
  if (!isMap(root)) return fail(1, 'Die Datei muss mit `services:` beginnen.', 'top-level object must be a mapping')

  for (const key of Object.keys(root)) {
    if (!TOP_LEVEL.has(key) && !key.startsWith('x-')) {
      return fail(lineOf(key), `Unbekannter Schlüssel \`${key}\` auf oberster Ebene.`, `validating compose.yaml: (root) Additional property ${key} is not allowed`)
    }
  }
  if ('version' in root) {
    findings.push({
      severity: 'info',
      line: lineOf('version'),
      de: '`version` ist veraltet und wird ignoriert - moderne Compose-Dateien lassen die Zeile weg.',
      en: '`version` is obsolete, it will be ignored - modern compose files leave it out.',
    })
  }
  const services = root.services
  if (!isMap(services) || !Object.keys(services).length) return fail(1, 'Es gibt keine `services:`.', 'no service defined: services must be a mapping')

  const declaredVolumes = isMap(root.volumes) ? Object.keys(root.volumes) : []
  const model: ComposeModel = { project: typeof root.name === 'string' ? root.name : project, services: [], volumes: declaredVolumes }

  // --- Read and check every service --------------------------------------------------------
  for (const [name, raw] of Object.entries(services)) {
    const base = `services.${name}`
    if (!isMap(raw)) return fail(lineOf(base), `Service \`${name}\` ist leer.`, `service "${name}" has neither an image nor a build context specified`)
    for (const key of Object.keys(raw)) {
      if (!SERVICE_KEYS.has(key)) {
        const guess = [...SERVICE_KEYS].find((k) => closeTo(k, key))
        return fail(
          lineOf(`${base}.${key}`),
          `\`${key}\` gibt es bei einem Service nicht${guess ? ` - meintest du \`${guess}\`?` : ''}.`,
          `validating compose.yaml: services.${name} Additional property ${key} is not allowed`,
        )
      }
    }
    const image = typeof raw.image === 'string' ? raw.image : undefined
    const build = typeof raw.build === 'string' ? raw.build : isMap(raw.build) && typeof raw.build.context === 'string' ? raw.build.context : undefined
    if (!image && !build) return fail(lineOf(base), `\`${name}\` braucht \`image:\` oder \`build:\`.`, `service "${name}" has neither an image nor a build context specified`)

    const service: ComposeService = {
      name,
      image,
      build,
      ports: [],
      environment: {},
      dependsOn: [],
      volumes: [],
      restart: typeof raw.restart === 'string' ? raw.restart : undefined,
      healthcheck: isMap(raw.healthcheck) ? flatten(raw.healthcheck.test) : undefined,
      command: raw.command !== undefined ? flatten(raw.command) : undefined,
      kind: 'other',
      line: lineOf(base),
    }

    for (const [index, port] of asList(raw.ports).entries()) {
      const text = String(port)
      // [IP:][HOST:]CONTAINER[/tcp] - "127.0.0.1:8080:8080", "8080:8080" or just "8080"
      const match = text.match(/^(?:(?:\d+\.\d+\.\d+\.\d+|localhost):)?(?:(\d+):)?(\d+)(?:\/(tcp|udp))?$/)
      if (!match) {
        return fail(lineOf(`${base}.ports[${index}]`), `Ungültige Port-Angabe \`${text}\` - Format: "HOST:CONTAINER", z. B. "8080:8080".`, `invalid port specification: "${text}"`)
      }
      service.ports.push({ host: match[1] ? Number(match[1]) : null, container: Number(match[2]), raw: text })
    }

    const env = raw.environment
    if (Array.isArray(env)) {
      for (const entry of env) {
        const [key, ...value] = String(entry).split('=')
        service.environment[key] = value.join('=')
      }
    } else if (isMap(env)) {
      for (const [key, value] of Object.entries(env)) service.environment[key] = value === null ? '' : String(value)
    }

    const depends = raw.depends_on
    if (Array.isArray(depends)) for (const d of depends) service.dependsOn.push({ service: String(d), condition: 'service_started' })
    else if (isMap(depends)) {
      for (const [d, options] of Object.entries(depends)) {
        const condition = isMap(options) && typeof options.condition === 'string' ? options.condition : 'service_started'
        service.dependsOn.push({ service: d, condition: condition as Dependency['condition'] })
      }
    }

    for (const [index, volume] of asList(raw.volumes).entries()) {
      const [source, target] = String(volume).split(':')
      if (!target) continue // anonymous volume
      const named = !/^[./~]/.test(source)
      if (named && !declaredVolumes.includes(source)) {
        return fail(
          lineOf(`${base}.volumes[${index}]`),
          `Das Volume \`${source}\` wird benutzt, aber nicht unter \`volumes:\` (ganz unten) angelegt.`,
          `service "${name}" refers to undefined volume ${source}: invalid compose project`,
        )
      }
      service.volumes.push({ source, target, named })
    }
    service.kind = kindOf(service)
    model.services.push(service)
  }

  // --- Relationships ---------------------------------------------------------------------------
  const names = new Set(model.services.map((s) => s.name))
  for (const service of model.services) {
    for (const d of service.dependsOn) {
      if (!names.has(d.service)) {
        return fail(lineOf(`services.${service.name}.depends_on`), `\`${service.name}\` hängt von \`${d.service}\` ab - diesen Service gibt es nicht.`, `service "${service.name}" depends on undefined service "${d.service}": invalid compose project`)
      }
      const target = model.services.find((s) => s.name === d.service)!
      if (d.condition === 'service_healthy' && !target.healthcheck) {
        return fail(lineOf(`services.${service.name}.depends_on`), `\`${d.service}\` hat keinen \`healthcheck\` - dann kann es nie „healthy“ werden.`, `dependency failed to start: container ${model.project}-${d.service}-1 has no healthcheck configured`)
      }
    }
  }
  const order = startOrder(model.services)
  if (!order) return fail(1, 'Die Services hängen im Kreis voneinander ab.', 'dependency cycle detected')

  const log: LogLine[] = []
  const containers: ContainerState[] = []
  const hostPorts = new Map<number, string>()
  const state = new Map<string, { running: boolean; healthy: boolean; attempts: number }>()

  // --- Pull, build, network, volumes -----------------------------------------------------------
  for (const s of model.services) {
    if (s.image && !findImage(s.image)) {
      return fail(s.line, `Das Image \`${s.image}\` gibt es nicht (Tippfehler?).`, `Error response from daemon: pull access denied for ${splitImage(s.image).repository}, repository does not exist or may require 'docker login'`)
    }
  }
  const pulled = model.services.filter((s) => s.image)
  const built = model.services.filter((s) => s.build)
  if (pulled.length) log.push({ service: null, text: `[+] Pulling ${pulled.length}/${pulled.length}`, kind: 'info' })
  for (const s of pulled) log.push({ service: null, text: ` ✔ ${s.name} Pulled`, kind: 'ok' })
  if (built.length) log.push({ service: null, text: `[+] Building ${built.length}/${built.length}`, kind: 'info' })
  for (const s of built) log.push({ service: null, text: ` ✔ Service ${s.name}  Built  (from ${s.build}/Dockerfile)`, kind: 'ok' })
  log.push({ service: null, text: `[+] Running ${model.services.length + 1 + model.volumes.length}/${model.services.length + 1 + model.volumes.length}`, kind: 'info' })
  log.push({ service: null, text: ` ✔ Network ${model.project}_default  Created`, kind: 'ok' })
  for (const v of model.volumes) log.push({ service: null, text: ` ✔ Volume "${model.project}_${v}"  Created`, kind: 'ok' })

  // --- Start in dependency order -----------------------------------------------------------------
  for (const s of order) {
    const container = `${model.project}-${s.name}-1`
    const image = s.image ?? `${model.project}-${s.name}`
    let status = 'Up'
    let running = true
    const own: LogLine[] = []
    const say = (text: string, kind: LogLine['kind'] = 'info') => own.push({ service: s.name, text, kind })

    for (const port of s.ports) {
      if (port.host === null) continue
      const holder = hostPorts.get(port.host)
      if (holder) {
        log.push({
          service: null,
          text: ` ✘ Container ${container}  Error response from daemon: Bind for 0.0.0.0:${port.host} failed: port is already allocated (by ${holder})`,
          kind: 'error',
        })
        findings.push({
          severity: 'error',
          line: s.line,
          de: `Port ${port.host} auf deinem Rechner ist schon an \`${holder}\` vergeben. Jeder Host-Port kann nur einmal belegt werden - nimm links eine andere Zahl.`,
          en: `Port ${port.host} on your machine is already taken by \`${holder}\`. Every host port can only be used once - pick another number on the left.`,
        })
        running = false
        status = 'Created'
      } else hostPorts.set(port.host, s.name)
    }

    // Wait for dependencies
    for (const d of s.dependsOn) {
      const dependency = state.get(d.service)
      if (!dependency?.running) {
        say(`dependency failed to start: container ${model.project}-${d.service}-1 exited`, 'error')
        running = false
        status = 'Created'
      }
    }

    if (running) {
      const outcome = behave(s, model, state)
      for (const line of outcome.lines) say(line.text, line.kind)
      running = outcome.running
      status = outcome.status
    }
    state.set(s.name, { running, healthy: running && Boolean(s.healthcheck), attempts: 1 })
    const verb = !running ? (status.startsWith('Exited') ? 'Exited' : 'Error') : s.healthcheck ? 'Healthy' : 'Started'
    log.push({ service: null, text: ` ${running ? '✔' : '✘'} Container ${container}  ${verb}`, kind: running ? 'ok' : 'error' })
    log.push(...own)
    containers.push({
      name: container,
      service: s.name,
      image,
      status,
      running,
      // Like `docker compose ps`: a stopped container publishes nothing.
      ports: running ? s.ports.map((p) => (p.host ? `0.0.0.0:${p.host}->${p.container}/tcp` : `${p.container}/tcp`)).join(', ') : '',
    })
  }

  // --- Warnings that do not stop the start ---------------------------------------------------------
  let passwordReported = false
  for (const s of model.services) {
    if (s.kind === 'postgres' && !s.volumes.some((v) => v.target.startsWith('/var/lib/postgresql'))) {
      findings.push({
        severity: 'warning',
        line: s.line,
        de: 'Die Datenbank hat kein Volume für `/var/lib/postgresql/data` - mit `docker compose down` sind alle Daten weg.',
        en: 'The database has no volume for `/var/lib/postgresql/data` - `docker compose down` deletes all data.',
      })
    }
    if (s.kind === 'postgres' && s.ports.some((p) => p.host !== null)) {
      findings.push({
        severity: 'info',
        line: s.line,
        de: 'Der Datenbank-Port ist auf deinem Rechner veröffentlicht. Das Backend braucht das nicht (es nutzt das Netzwerk von Compose) - praktisch ist es nur für Tools wie DBeaver.',
        en: 'The database port is published on your machine. The backend does not need this (it uses the compose network) - it is only handy for tools like DBeaver.',
      })
    }
    for (const [key, value] of Object.entries(s.environment)) {
      if (!passwordReported && /PASSWORD/i.test(key) && value && !value.startsWith('${')) {
        passwordReported = true
        findings.push({
          severity: 'info',
          line: s.line,
          de: `\`${key}\` steht im Klartext in der Datei. Für echte Projekte gehört das in eine \`.env\`-Datei (nicht ins Git) und wird mit \`\${${key}}\` eingesetzt.`,
          en: `\`${key}\` is written in plain text. In real projects it belongs in a \`.env\` file (not in Git) and is inserted with \`\${${key}}\`.`,
        })
        break
      }
    }
  }

  const urls = model.services.flatMap((s) =>
    s.ports
      .filter((p) => p.host !== null)
      .map((p) => {
        const container = containers.find((c) => c.service === s.name)!
        const url = `http://localhost:${p.host}`
        if (!container.running) return { url, service: s.name, answer: 'Connection refused - the container is not running', ok: false }
        switch (s.kind) {
          case 'spring':
            return { url: url + '/api/todos', service: s.name, answer: p.container === 8080 ? '200 OK  []' : `Connection reset - the app listens on 8080, not ${p.container}`, ok: p.container === 8080 }
          case 'react':
          case 'nginx':
            return { url, service: s.name, answer: p.container === 80 ? '200 OK  <!doctype html> … (the React app)' : `Connection reset - nginx listens on 80, not ${p.container}`, ok: p.container === 80 }
          case 'postgres':
            return { url, service: s.name, answer: '(no HTTP - a database; connect with psql or DBeaver)', ok: true }
          default:
            return { url, service: s.name, answer: '200 OK', ok: true }
        }
      }),
  )

  return { ok: containers.every((c) => c.running), findings, model, log, containers, urls }
}

// ---------------------------------------------------------------------------
// How each kind of container behaves
// ---------------------------------------------------------------------------

type Outcome = { running: boolean; status: string; lines: { text: string; kind: LogLine['kind'] }[] }

function behave(s: ComposeService, model: ComposeModel, state: Map<string, { running: boolean; healthy: boolean }>): Outcome {
  const lines: Outcome['lines'] = []
  const say = (text: string, kind: LogLine['kind'] = 'info') => lines.push({ text, kind })
  const env = s.environment
  switch (s.kind) {
    case 'postgres': {
      if (!env.POSTGRES_PASSWORD && env.POSTGRES_HOST_AUTH_METHOD !== 'trust') {
        say('Error: Database is uninitialized and superuser password is not specified.', 'error')
        say('       You must specify POSTGRES_PASSWORD to a non-empty value for the superuser.', 'error')
        return { running: false, status: 'Exited (1)', lines }
      }
      say('PostgreSQL init process complete; ready for start up.')
      say(`database system is ready to accept connections${env.POSTGRES_DB ? ` (database "${env.POSTGRES_DB}")` : ''}`, 'ok')
      return { running: true, status: s.healthcheck ? 'Up (healthy)' : 'Up', lines }
    }
    case 'spring': {
      say(':: Spring Boot ::                (v4.0.0)')
      say('Starting TodoApiApplication using Java 21')
      const url = env.SPRING_DATASOURCE_URL
      if (url) {
        const match = url.match(/^jdbc:postgresql:\/\/([^:/]+)(?::(\d+))?\/(\w+)/)
        if (!match) {
          say(`Driver org.postgresql.Driver claims to not accept jdbcUrl, ${url}`, 'error')
          return crash(s, lines)
        }
        const [, host, portText, database] = match
        const port = Number(portText ?? 5432)
        if (host === 'localhost' || host === '127.0.0.1') {
          say(`HikariPool-1 - Exception during pool initialization.`, 'error')
          say(`org.postgresql.util.PSQLException: Connection to ${host}:${port} refused.`, 'error')
          say('→ In a container, localhost is the container ITSELF. Use the service name of the database (e.g. db).', 'warn')
          return crash(s, lines)
        }
        const db = model.services.find((x) => x.name === host)
        if (!db) {
          say(`org.postgresql.util.PSQLException: The connection attempt failed. java.net.UnknownHostException: ${host}`, 'error')
          return crash(s, lines)
        }
        if (db.kind !== 'postgres') {
          say(`org.postgresql.util.PSQLException: Connection to ${host}:${port} refused (${host} is no PostgreSQL database).`, 'error')
          return crash(s, lines)
        }
        if (port !== 5432) {
          say(`org.postgresql.util.PSQLException: Connection to ${host}:${port} refused.`, 'error')
          say(`→ Inside the compose network the CONTAINER port counts: ${host}:5432 (the left number in "ports" is only for your machine).`, 'warn')
          return crash(s, lines)
        }
        const dbState = state.get(db.name)
        if (!dbState?.running) {
          say(`org.postgresql.util.PSQLException: Connection to ${host}:5432 refused.`, 'error')
          return crash(s, lines)
        }
        const user = env.SPRING_DATASOURCE_USERNAME ?? 'postgres'
        const expectedUser = db.environment.POSTGRES_USER ?? 'postgres'
        if (user !== expectedUser || (env.SPRING_DATASOURCE_PASSWORD ?? '') !== (db.environment.POSTGRES_PASSWORD ?? '')) {
          say(`org.postgresql.util.PSQLException: FATAL: password authentication failed for user "${user}"`, 'error')
          return crash(s, lines)
        }
        if ((db.environment.POSTGRES_DB ?? expectedUser) !== database) {
          say(`org.postgresql.util.PSQLException: FATAL: database "${database}" does not exist`, 'error')
          return crash(s, lines)
        }
        const waitsForHealthy = s.dependsOn.some((d) => d.service === db.name && d.condition === 'service_healthy')
        if (!waitsForHealthy) {
          // The database container runs, but postgres needs a few seconds to be ready.
          say(`org.postgresql.util.PSQLException: Connection to ${host}:5432 refused. (the database is still starting)`, 'error')
          if (!s.restart || s.restart === 'no') {
            say('→ depends_on only waits until the container has STARTED, not until postgres is ready. Add a healthcheck to db and "condition: service_healthy" - or restart: on-failure.', 'warn')
            return crash(s, lines)
          }
          say(`restarting (restart: ${s.restart}) …`, 'warn')
        }
        say('HikariPool-1 - Start completed.', 'ok')
      }
      say('Tomcat started on port 8080 (http) with context path \'/\'')
      say('Started TodoApiApplication in 3.4 seconds', 'ok')
      return { running: true, status: 'Up', lines }
    }
    case 'react':
    case 'nginx':
      say('/docker-entrypoint.sh: Configuration complete; ready for start up')
      say('nginx/1.27 start worker processes', 'ok')
      return { running: true, status: 'Up', lines }
    case 'redis':
      say('Ready to accept connections tcp', 'ok')
      return { running: true, status: 'Up', lines }
    default:
      say('started', 'ok')
      return { running: true, status: 'Up', lines }
  }
}

function crash(s: ComposeService, lines: Outcome['lines']): Outcome {
  lines.push({ text: 'APPLICATION FAILED TO START', kind: 'error' })
  return { running: false, status: s.restart && s.restart !== 'no' ? 'Restarting (1)' : 'Exited (1)', lines }
}

function kindOf(s: ComposeService): ComposeService['kind'] {
  if (s.image) {
    const image = findImage(s.image)
    if (image?.kind === 'postgres') return 'postgres'
    if (image?.kind === 'redis') return 'redis'
    if (image?.kind === 'nginx') return 'nginx'
    if (/todo-api|backend|spring/.test(s.image)) return 'spring'
    if (/todo-web|frontend/.test(s.image)) return 'react'
    return 'other'
  }
  const hint = `${s.name} ${s.build}`
  if (/api|backend|spring|server/.test(hint)) return 'spring'
  if (/web|frontend|ui|client/.test(hint)) return 'react'
  return 'other'
}

/** Dependencies first - Kahn's algorithm; null on a cycle. */
function startOrder(services: ComposeService[]): ComposeService[] | null {
  const result: ComposeService[] = []
  const done = new Set<string>()
  while (result.length < services.length) {
    const next = services.find((s) => !done.has(s.name) && s.dependsOn.every((d) => done.has(d.service)))
    if (!next) return null
    result.push(next)
    done.add(next.name)
  }
  return result
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isMap = (value: Yaml | undefined): value is { [key: string]: Yaml } => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const asList = (value: Yaml | undefined): Yaml[] => (Array.isArray(value) ? value : value === undefined || value === null ? [] : [value])
const flatten = (value: Yaml | undefined): string => (Array.isArray(value) ? value.map(String).join(' ') : value === undefined || value === null ? '' : String(value))

function closeTo(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 2) return false
  let differences = 0
  for (let i = 0, j = 0; i < a.length || j < b.length; i++, j++) {
    if (a[i] !== b[j]) {
      differences++
      if (a[i + 1] === b[j]) i++
      else if (a[i] === b[j + 1]) j++
    }
  }
  return differences <= 2
}
