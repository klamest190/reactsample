/**
 * DOCKER PART · A simulated terminal for the docker command
 *
 *   docker run -d --name web -p 8080:80 nginx
 *   docker ps
 *   curl http://localhost:8080
 *   docker logs web
 *   docker stop web && docker rm web      (one command per line here)
 *
 * The state (images, containers, volumes) lives in a plain object, every
 * command returns new output lines. Nothing leaves the browser: images are
 * "pulled" from the catalog in images.ts, containers only pretend to run.
 * What is real: the commands, their options, their messages and the rules -
 * a port can only be used once, a running container cannot be removed, a name
 * must be unique, postgres needs a password …
 */

import { simulateBuild } from './build'
import { findImage, formatSize, splitImage, type ImageInfo } from './images'
import type { ProjectId } from './projects'

export type Container = {
  id: string
  name: string
  image: string
  command: string
  status: 'running' | 'exited' | 'created'
  exitCode: number
  ports: { host: number; container: number }[]
  env: Record<string, string>
  logs: string[]
  created: number
  autoRemove: boolean
  volumes: { source: string; target: string }[]
  kind: ImageInfo['kind']
}

export type LocalImage = { repository: string; tag: string; id: string; sizeMb: number; created: number; info: ImageInfo }

export type DockerState = {
  images: LocalImage[]
  containers: Container[]
  volumes: string[]
  networks: string[]
  /** Counts commands - "created 3 minutes ago" is measured in commands. */
  clock: number
  seed: number
  history: string[]
}

export type TerminalLine = { text: string; kind: 'input' | 'output' | 'error' | 'hint' }

export type TerminalOptions = {
  /** Dockerfile used by `docker build` (the lesson's project). */
  dockerfile?: string
  project?: ProjectId
  ignore?: string
  language?: 'de' | 'en'
}

export function newState(): DockerState {
  return { images: [], containers: [], volumes: [], networks: ['bridge', 'host', 'none'], clock: 0, seed: 7, history: [] }
}

/** Runs one line. Returns the output; `state` is changed in place. */
export function execute(state: DockerState, input: string, options: TerminalOptions = {}): TerminalLine[] {
  const out: TerminalLine[] = []
  const line = input.trim()
  if (!line) return out
  // `a && b`: run b only if a printed no error - like a real shell.
  if (line.includes(' && ')) {
    for (const part of line.split(' && ')) {
      const lines = execute(state, part, options)
      out.push(...lines)
      if (lines.some((l) => l.kind === 'error')) break
    }
    return out
  }
  state.history.push(line)
  state.clock++
  const print = (text: string, kind: TerminalLine['kind'] = 'output') => out.push({ text, kind })
  const hint = (de: string, en: string) => print((options.language === 'en' ? en : de), 'hint')
  const words = words0(line)

  if (words[0] === 'curl') {
    curl(state, words.slice(1), print)
    return out
  }
  if (words[0] === 'clear') return [{ text: '\u0000clear', kind: 'output' }]
  if (words[0] === 'help') {
    print('docker run [-d] [--name NAME] [-p HOST:CONTAINER] [-e KEY=VALUE] [-v VOLUME:/path] [--rm] IMAGE [COMMAND]')
    print('docker ps [-a] · docker images · docker pull IMAGE · docker logs NAME · docker exec NAME COMMAND')
    print('docker stop|start|restart|rm [-f] NAME · docker rmi IMAGE · docker volume ls|create|rm · docker build -t NAME .')
    print('curl http://localhost:PORT · clear')
    return out
  }
  if (words[0] !== 'docker') {
    print(`${words[0]}: command not found`, 'error')
    hint('Dieses Terminal kennt nur `docker …`, `curl` und `clear`.', 'This terminal only knows `docker …`, `curl` and `clear`.')
    return out
  }

  const [command, ...rest] = words.slice(1)
  switch (command) {
    case undefined:
    case '--help':
      return execute(state, 'help', options)
    case '--version':
    case 'version':
      print('Docker version 28.5.1, build e180ab8 (simulated)')
      break
    case 'run':
      run(state, rest, print, hint)
      break
    case 'ps':
    case 'container':
      if (command === 'container' && rest[0] !== 'ls') {
        print(`docker: 'container ${rest[0] ?? ''}' is not supported in this simulator`, 'error')
        break
      }
      ps(state, command === 'container' ? rest.slice(1) : rest, print)
      break
    case 'images':
    case 'image':
      if (command === 'image' && rest[0] !== 'ls') {
        if (rest[0] === 'rm') removeImage(state, rest.slice(1), print)
        else print(`docker: 'image ${rest[0] ?? ''}' is not supported in this simulator`, 'error')
        break
      }
      images(state, print)
      break
    case 'pull':
      if (!rest[0]) print('"docker pull" requires exactly 1 argument.', 'error')
      else pull(state, rest[0], print)
      break
    case 'rmi':
      removeImage(state, rest, print)
      break
    case 'stop':
    case 'start':
    case 'restart':
    case 'kill':
      for (const name of rest) lifecycle(state, command, name, print)
      if (!rest.length) print(`"docker ${command}" requires at least 1 argument.`, 'error')
      break
    case 'rm':
      remove(state, rest, print, hint)
      break
    case 'logs':
      logs(state, rest, print)
      break
    case 'exec':
      exec(state, rest, print, hint)
      break
    case 'inspect':
      inspect(state, rest[0], print)
      break
    case 'volume':
      volume(state, rest, print)
      break
    case 'network':
      if (rest[0] === 'ls') {
        print('NETWORK ID     NAME      DRIVER    SCOPE')
        state.networks.forEach((n, i) => print(`${hex(state, 12, i + 100)}   ${n.padEnd(9)} ${n === 'bridge' ? 'bridge' : n === 'host' ? 'host' : 'null'}    local`))
      } else if (rest[0] === 'create' && rest[1]) {
        state.networks.push(rest[1])
        print(hex(state, 64))
      } else print('Usage: docker network ls | docker network create NAME', 'error')
      break
    case 'build':
      build(state, rest, print, hint, options)
      break
    case 'compose':
      hint('Für `docker compose` gibt es in Kapitel „Docker Compose“ einen eigenen Editor.', 'There is a dedicated editor for `docker compose` in the chapter “Docker Compose”.')
      break
    default:
      print(`docker: '${command}' is not a docker command.`, 'error')
      print("See 'docker --help'", 'error')
  }
  return out
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

type Print = (text: string, kind?: TerminalLine['kind']) => void
type Hint = (de: string, en: string) => void

function run(state: DockerState, args: string[], print: Print, hint: Hint) {
  let detached = false
  let name: string | undefined
  let autoRemove = false
  let interactive = false
  const ports: Container['ports'] = []
  const env: Record<string, string> = {}
  const volumes: Container['volumes'] = []
  let index = 0
  for (; index < args.length; index++) {
    const a = args[index]
    if (!a.startsWith('-')) break
    const value = () => {
      const inline = a.includes('=') && a.startsWith('--') ? a.slice(a.indexOf('=') + 1) : undefined
      return inline ?? args[++index]
    }
    if (a === '-d' || a === '--detach') detached = true
    else if (a === '--rm') autoRemove = true
    else if (/^-[it]+$/.test(a) || a === '--interactive' || a === '--tty') interactive = true
    else if (/^-(d|it|ti|dit|itd)$/.test(a)) {
      detached = a.includes('d')
      interactive = true
    } else if (a === '--name' || a.startsWith('--name=')) name = value()
    else if (a === '-p' || a === '--publish' || a.startsWith('--publish=')) {
      const spec = value() ?? ''
      const match = spec.match(/^(?:(\d+):)?(\d+)$/)
      if (!match) {
        print(`docker: invalid publish opts format (should be name=value but got '${spec}').`, 'error')
        return
      }
      ports.push({ host: Number(match[1] ?? match[2]), container: Number(match[2]) })
    } else if (a === '-e' || a === '--env' || a.startsWith('--env=')) {
      const [key, ...v] = (value() ?? '').split('=')
      env[key] = v.join('=')
    } else if (a === '-v' || a === '--volume' || a.startsWith('--volume=')) {
      const [source, target] = (value() ?? '').split(':')
      volumes.push({ source, target })
      if (source && !/^[./]/.test(source) && !state.volumes.includes(source)) state.volumes.push(source)
    } else if (a === '--network' || a.startsWith('--network=')) value()
    else {
      print(`unknown flag: ${a}`, 'error')
      print("See 'docker run --help'.", 'error')
      return
    }
  }
  const reference = args[index]
  const command = args.slice(index + 1)
  if (!reference) {
    print('"docker run" requires at least 1 argument.', 'error')
    return
  }
  if (name && state.containers.some((c) => c.name === name)) {
    const other = state.containers.find((c) => c.name === name)!
    print(`docker: Error response from daemon: Conflict. The container name "/${name}" is already in use by container "${other.id}${hex(state, 52)}". You have to remove (or rename) that container to be able to reuse that name.`, 'error')
    hint(`Entweder anderen Namen wählen oder den alten Container entfernen: docker rm -f ${name}`, `Either pick another name or remove the old container: docker rm -f ${name}`)
    return
  }
  const image = ensureImage(state, reference, print)
  if (!image) return

  for (const port of ports) {
    const holder = state.containers.find((c) => c.status === 'running' && c.ports.some((p) => p.host === port.host))
    if (holder) {
      const id = hex(state, 64)
      print(id)
      print(`docker: Error response from daemon: driver failed programming external connectivity on endpoint: Bind for 0.0.0.0:${port.host} failed: port is already allocated.`, 'error')
      hint(`Port ${port.host} benutzt schon „${holder.name}“. Nimm links eine andere Zahl (z. B. -p ${port.host + 1}:${port.container}) oder stoppe den anderen Container.`, `Port ${port.host} is already used by “${holder.name}”. Pick another number on the left (e.g. -p ${port.host + 1}:${port.container}) or stop the other container.`)
      state.containers.push(container(state, image.info, reference, name, command, ports, env, volumes, autoRemove, id.slice(0, 12), 'created'))
      return
    }
  }

  const c = container(state, image.info, reference, name, command, ports, env, volumes, autoRemove)
  state.containers.push(c)
  const result = behave(c, interactive)
  c.logs.push(...result.logs)
  c.status = result.running ? 'running' : 'exited'
  c.exitCode = result.exitCode

  if (detached) {
    print(c.id + hex(state, 52))
    if (!result.running && result.exitCode !== 0) {
      hint(`Der Container ist sofort wieder beendet (Exit ${result.exitCode}). Warum, steht in: docker logs ${c.name}`, `The container stopped right away (exit ${result.exitCode}). The reason is in: docker logs ${c.name}`)
    }
  } else {
    for (const l of result.logs) print(l)
    if (result.running) {
      // A server in the foreground would block the terminal - here we pretend Ctrl+C was pressed.
      print('^C', 'input')
      c.status = 'exited'
      c.exitCode = 0
      hint(
        'Ohne -d läuft der Container im Vordergrund und blockiert das Terminal - Strg+C beendet ihn (hier schon passiert). Für Server fast immer: docker run -d …',
        'Without -d the container runs in the foreground and blocks the terminal - Ctrl+C stops it (already done here). For servers you almost always want: docker run -d …',
      )
    }
  }
  if (c.autoRemove && c.status === 'exited') state.containers.splice(state.containers.indexOf(c), 1)
}

function behave(c: Container, interactive: boolean): { running: boolean; exitCode: number; logs: string[] } {
  const logs: string[] = []
  const cmd = c.command
  switch (c.kind) {
    case 'hello':
      return {
        running: false,
        exitCode: 0,
        logs: [
          '',
          'Hello from Docker!',
          'This message shows that your installation appears to be working correctly.',
          '',
          'To generate this message, Docker took the following steps:',
          ' 1. The Docker client contacted the Docker daemon.',
          ' 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.',
          ' 3. The Docker daemon created a new container from that image which runs the',
          '    executable that produces the output you are currently reading.',
          ' 4. The Docker daemon streamed that output to the Docker client, which sent it',
          '    to your terminal.',
        ],
      }
    case 'nginx':
      return {
        running: true,
        exitCode: 0,
        logs: [
          '/docker-entrypoint.sh: Configuration complete; ready for start up',
          'nginx/1.27.5 start worker processes',
        ],
      }
    case 'postgres':
      if (!c.env.POSTGRES_PASSWORD && c.env.POSTGRES_HOST_AUTH_METHOD !== 'trust') {
        return {
          running: false,
          exitCode: 1,
          logs: [
            'Error: Database is uninitialized and superuser password is not specified.',
            '       You must specify POSTGRES_PASSWORD to a non-empty value for the',
            '       superuser. For example, "-e POSTGRES_PASSWORD=password" on "docker run".',
          ],
        }
      }
      return { running: true, exitCode: 0, logs: ['PostgreSQL init process complete; ready for start up.', 'database system is ready to accept connections'] }
    case 'redis':
      return { running: true, exitCode: 0, logs: ['* Ready to accept connections tcp'] }
    case 'app':
      return {
        running: true,
        exitCode: 0,
        logs: [
          ' :: Spring Boot ::                (v4.0.0)',
          'INFO  TodoApiApplication : Starting TodoApiApplication using Java 21',
          "INFO  TomcatWebServer    : Tomcat started on port 8080 (http) with context path '/'",
          'INFO  TodoApiApplication : Started TodoApiApplication in 2.9 seconds',
        ],
      }
    case 'jdk':
    case 'jre':
      if (cmd.startsWith('java -version') || cmd.startsWith('java --version')) {
        return { running: false, exitCode: 0, logs: ['openjdk version "21.0.8" 2025-07-15 LTS', 'OpenJDK Runtime Environment Temurin-21.0.8+9 (build 21.0.8+9-LTS)'] }
      }
      return { running: false, exitCode: 0, logs: interactive ? ['|  Welcome to JShell -- Version 21.0.8', '(interactive shells are not simulated - exiting)'] : [] }
    case 'node':
      if (/^node (-v|--version)/.test(cmd)) return { running: false, exitCode: 0, logs: ['v22.21.1'] }
      return { running: false, exitCode: 0, logs: interactive ? ['Welcome to Node.js v22.21.1.', '(interactive shells are not simulated - exiting)'] : [] }
    case 'os': {
      if (!cmd || /^(sh|bash|\/bin\/sh|\/bin\/bash)$/.test(cmd)) {
        return { running: false, exitCode: 0, logs: interactive ? ['(interactive shells are not simulated - exiting)'] : [] }
      }
      const echo = cmd.match(/^echo\s+(.*)$/)
      if (echo) return { running: false, exitCode: 0, logs: [echo[1].replace(/^["']|["']$/g, '')] }
      if (cmd.startsWith('cat /etc/os-release')) return { running: false, exitCode: 0, logs: [c.image.startsWith('alpine') ? 'NAME="Alpine Linux"' : 'PRETTY_NAME="Ubuntu 24.04 LTS"'] }
      if (cmd === 'ls' || cmd === 'ls /') return { running: false, exitCode: 0, logs: ['bin  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var'] }
      if (cmd.startsWith('sleep')) return { running: true, exitCode: 0, logs: [] }
      return { running: false, exitCode: 127, logs: [`docker: Error response from daemon: failed to create task for container: exec: "${cmd.split(' ')[0]}": executable file not found in $PATH`] }
    }
    default:
      return { running: false, exitCode: 0, logs }
  }
}

function container(
  state: DockerState,
  info: ImageInfo,
  reference: string,
  name: string | undefined,
  command: string[],
  ports: Container['ports'],
  env: Record<string, string>,
  volumes: Container['volumes'],
  autoRemove: boolean,
  id = hex(state, 12),
  status: Container['status'] = 'created',
): Container {
  const { repository, tag } = splitImage(reference)
  return {
    id,
    name: name ?? randomName(state),
    image: tag === 'latest' ? repository : `${repository}:${tag}`,
    command: command.join(' ') || (info.defaultCommand ?? []).join(' '),
    status,
    exitCode: 0,
    ports,
    env,
    logs: [],
    created: state.clock,
    autoRemove,
    volumes,
    kind: info.kind,
  }
}

function ensureImage(state: DockerState, reference: string, print: Print): LocalImage | null {
  const { repository, tag } = splitImage(reference)
  const local = state.images.find((i) => i.repository === repository && i.tag === tag)
  if (local) return local
  print(`Unable to find image '${repository}:${tag}' locally`)
  return pull(state, reference, print)
}

function pull(state: DockerState, reference: string, print: Print): LocalImage | null {
  const { repository, tag } = splitImage(reference)
  const info = findImage(reference)
  if (!info || info.kind === 'app') {
    print(`docker: Error response from daemon: pull access denied for ${repository}, repository does not exist or may require 'docker login': denied: requested access to the resource is denied`, 'error')
    return null
  }
  const existing = state.images.find((i) => i.repository === repository && i.tag === tag)
  if (existing) {
    print(`${tag}: Pulling from library/${repository}`)
    print(`Status: Image is up to date for ${repository}:${tag}`)
    return existing
  }
  print(`${tag}: Pulling from library/${repository}`)
  const layers = Math.max(1, Math.min(6, Math.round(info.sizeMb / 60)))
  for (let i = 0; i < layers; i++) print(`${hex(state, 12)}: Pull complete`)
  print(`Digest: sha256:${hex(state, 64)}`)
  print(`Status: Downloaded newer image for ${repository}:${tag}`)
  const image: LocalImage = { repository, tag, id: hex(state, 12), sizeMb: info.sizeMb, created: state.clock, info }
  state.images.push(image)
  return image
}

function ps(state: DockerState, args: string[], print: Print) {
  const all = args.includes('-a') || args.includes('--all')
  const quiet = args.includes('-q')
  const list = state.containers.filter((c) => all || c.status === 'running')
  if (quiet) {
    for (const c of list) print(c.id)
    return
  }
  print(row(['CONTAINER ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'NAMES'], [14, 16, 22, 20, 26, 26]))
  for (const c of list) {
    print(
      row(
        [
          c.id,
          c.image,
          `"${c.command.length > 18 ? c.command.slice(0, 17) + '…' : c.command}"`,
          ago(state, c.created),
          c.status === 'running' ? upTime(state, c.created) : c.status === 'created' ? 'Created' : `Exited (${c.exitCode}) ${ago(state, c.created)}`,
          c.status === 'running' ? c.ports.map((p) => `0.0.0.0:${p.host}->${p.container}/tcp`).join(', ') : '',
          c.name,
        ],
        [14, 16, 22, 20, 26, 26],
      ),
    )
  }
}

function images(state: DockerState, print: Print) {
  print(row(['REPOSITORY', 'TAG', 'IMAGE ID', 'CREATED', 'SIZE'], [20, 14, 14, 18]))
  for (const i of state.images) print(row([i.repository, i.tag, i.id, ago(state, i.created), formatSize(i.sizeMb)], [20, 14, 14, 18]))
}

function removeImage(state: DockerState, args: string[], print: Print) {
  const force = args.includes('-f')
  for (const reference of args.filter((a) => !a.startsWith('-'))) {
    const { repository, tag } = splitImage(reference)
    const image = state.images.find((i) => i.repository === repository && i.tag === tag) ?? state.images.find((i) => i.id.startsWith(reference))
    if (!image) {
      print(`Error response from daemon: No such image: ${repository}:${tag}`, 'error')
      continue
    }
    const user = state.containers.find((c) => splitImage(c.image).repository === image.repository)
    if (user && !force) {
      print(`Error response from daemon: conflict: unable to remove repository reference "${reference}" (must force) - container ${user.id} is using its referenced image ${image.id}`, 'error')
      continue
    }
    state.images.splice(state.images.indexOf(image), 1)
    print(`Untagged: ${image.repository}:${image.tag}`)
    print(`Deleted: sha256:${image.id}${hex(state, 52)}`)
  }
}

function find(state: DockerState, reference: string | undefined): Container | undefined {
  if (!reference) return undefined
  return state.containers.find((c) => c.name === reference) ?? state.containers.find((c) => c.id.startsWith(reference) && reference.length >= 2)
}

function lifecycle(state: DockerState, command: string, reference: string, print: Print) {
  const c = find(state, reference)
  if (!c) {
    print(`Error response from daemon: No such container: ${reference}`, 'error')
    return
  }
  if (command === 'stop' || command === 'kill') {
    if (c.status === 'running') {
      c.status = 'exited'
      c.exitCode = command === 'kill' ? 137 : 0
      c.logs.push(command === 'kill' ? '(killed)' : c.kind === 'nginx' ? 'gracefully shutting down' : 'received signal - shutting down')
    }
    print(reference)
    if (c.autoRemove) state.containers.splice(state.containers.indexOf(c), 1)
    return
  }
  const result = behave(c, false)
  c.logs.push(...result.logs)
  c.status = result.running ? 'running' : 'exited'
  c.exitCode = result.exitCode
  print(reference)
}

function remove(state: DockerState, args: string[], print: Print, hint: Hint) {
  const force = args.includes('-f') || args.includes('--force')
  for (const reference of args.filter((a) => !a.startsWith('-'))) {
    const c = find(state, reference)
    if (!c) {
      // With -f a missing container is no reason to stop a `… && …` chain.
      if (!force) print(`Error response from daemon: No such container: ${reference}`, 'error')
      continue
    }
    if (c.status === 'running' && !force) {
      print(`Error response from daemon: cannot remove container "/${c.name}": container is running: stop the container before removing or force remove`, 'error')
      hint(`Erst stoppen: docker stop ${c.name} - oder beides auf einmal: docker rm -f ${c.name}`, `Stop it first: docker stop ${c.name} - or both at once: docker rm -f ${c.name}`)
      continue
    }
    state.containers.splice(state.containers.indexOf(c), 1)
    print(reference)
  }
}

function logs(state: DockerState, args: string[], print: Print) {
  const reference = args.filter((a) => !a.startsWith('-'))[0]
  const c = find(state, reference)
  if (!c) {
    print(`Error response from daemon: No such container: ${reference ?? ''}`, 'error')
    return
  }
  for (const l of c.logs) print(l)
  if (args.includes('-f') && c.status === 'running') print('(following - Ctrl+C to stop)', 'hint')
}

function exec(state: DockerState, args: string[], print: Print, hint: Hint) {
  // Options like -it come before the container name.
  let start = 0
  while (start < args.length && args[start].startsWith('-')) start++
  const [reference, ...command] = args.slice(start)
  const c = find(state, reference)
  if (!c) {
    print(`Error response from daemon: No such container: ${reference ?? ''}`, 'error')
    return
  }
  if (c.status !== 'running') {
    print(`Error response from daemon: container ${c.id}${hex(state, 52)} is not running`, 'error')
    return
  }
  const cmd = command.join(' ')
  if (/^(sh|bash|\/bin\/sh|\/bin\/bash)$/.test(cmd)) {
    hint('Eine interaktive Shell simuliert dieses Terminal nicht - gib den Befehl direkt an: docker exec NAME ls /', 'This terminal does not simulate an interactive shell - pass the command directly: docker exec NAME ls /')
    return
  }
  if (cmd === 'env') {
    print('PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin')
    print(`HOSTNAME=${c.id}`)
    for (const [k, v] of Object.entries(c.env)) print(`${k}=${v}`)
    return
  }
  if (cmd.startsWith('ls')) {
    const path = command[1] ?? '/'
    if (c.kind === 'nginx' && path.startsWith('/usr/share/nginx/html')) print('50x.html  index.html')
    else if (c.kind === 'postgres' && path.startsWith('/var/lib/postgresql')) print('data')
    else print('bin  boot  dev  docker-entrypoint.d  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var')
    return
  }
  if (cmd.startsWith('cat /etc/os-release')) {
    print(c.image.includes('alpine') ? 'NAME="Alpine Linux"' : 'PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"')
    return
  }
  if (c.kind === 'postgres' && cmd.startsWith('psql')) {
    print(' ?column? ')
    print('----------')
    print('        1')
    print('(1 row)')
    return
  }
  if (c.kind === 'postgres' && cmd.startsWith('pg_isready')) {
    print('/var/run/postgresql:5432 - accepting connections')
    return
  }
  if (cmd.startsWith('nginx -v')) {
    print('nginx version: nginx/1.27.5')
    return
  }
  print(`OCI runtime exec failed: exec failed: unable to start container process: exec: "${command[0]}": executable file not found in $PATH: unknown`, 'error')
}

function inspect(state: DockerState, reference: string | undefined, print: Print) {
  const c = find(state, reference)
  if (!c) {
    print(`Error: No such object: ${reference ?? ''}`, 'error')
    return
  }
  const json = {
    Id: c.id,
    Name: '/' + c.name,
    State: { Status: c.status, Running: c.status === 'running', ExitCode: c.exitCode },
    Config: { Image: c.image, Env: Object.entries(c.env).map(([k, v]) => `${k}=${v}`), Cmd: c.command.split(' ') },
    HostConfig: { PortBindings: Object.fromEntries(c.ports.map((p) => [`${p.container}/tcp`, [{ HostPort: String(p.host) }]])) },
    Mounts: c.volumes.map((v) => ({ Type: /^[./]/.test(v.source) ? 'bind' : 'volume', Source: v.source, Destination: v.target })),
  }
  for (const l of JSON.stringify([json], null, 2).split('\n')) print(l)
}

function volume(state: DockerState, args: string[], print: Print) {
  const [sub, name] = args
  if (sub === 'ls') {
    print('DRIVER    VOLUME NAME')
    for (const v of state.volumes) print(`local     ${v}`)
  } else if (sub === 'create') {
    const v = name ?? hex(state, 64)
    if (!state.volumes.includes(v)) state.volumes.push(v)
    print(v)
  } else if (sub === 'rm' && name) {
    const user = state.containers.find((c) => c.volumes.some((m) => m.source === name))
    if (user) print(`Error response from daemon: remove ${name}: volume is in use - [${user.id}]`, 'error')
    else if (!state.volumes.includes(name)) print(`Error response from daemon: get ${name}: no such volume`, 'error')
    else {
      state.volumes.splice(state.volumes.indexOf(name), 1)
      print(name)
    }
  } else print('Usage: docker volume ls | create NAME | rm NAME', 'error')
}

function build(state: DockerState, args: string[], print: Print, hint: Hint, options: TerminalOptions) {
  let tag = ''
  for (let i = 0; i < args.length; i++) if (args[i] === '-t' || args[i] === '--tag') tag = args[++i] ?? ''
  const context = args.filter((a, i) => !a.startsWith('-') && args[i - 1] !== '-t' && args[i - 1] !== '--tag')[0]
  if (!context) {
    print('ERROR: "docker buildx build" requires exactly 1 argument.', 'error')
    hint('Der Punkt am Ende fehlt: docker build -t todo-api .  (der Punkt ist der Build-Kontext - der aktuelle Ordner)', 'The dot at the end is missing: docker build -t todo-api .  (the dot is the build context - the current folder)')
    return
  }
  if (!options.dockerfile) {
    print('ERROR: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory', 'error')
    return
  }
  const result = simulateBuild(options.dockerfile, { project: options.project ?? 'spring', ignore: options.ignore, tag: tag || undefined })
  for (const l of result.first.log) print(l, l.startsWith('ERROR') ? 'error' : 'output')
  if (!result.image) return
  const { repository, tag: version } = splitImage(tag || '<none>')
  // The built image behaves like its base: a runnable Spring Boot JAR on a JRE, or nginx.
  const baseKind = findImage(result.image.base)?.kind
  const kind: ImageInfo['kind'] = baseKind === 'nginx' ? 'nginx' : result.run?.ok && ['jre', 'jdk', 'maven', 'distroless'].includes(baseKind ?? '') ? 'app' : 'os'
  const info: ImageInfo = { repository, sizeMb: result.image.sizeMb, users: [], tools: ['java'], kind, exposes: result.image.exposes }
  state.images = state.images.filter((i) => !(i.repository === repository && i.tag === version))
  state.images.push({ repository, tag: version, id: hex(state, 12), sizeMb: result.image.sizeMb, created: state.clock, info })
  if (!tag) hint('Ohne -t hat das Image keinen Namen (<none>). Mit -t todo-api kannst du es später per Name starten.', 'Without -t the image has no name (<none>). With -t todo-api you can start it by name later.')
}

function curl(state: DockerState, args: string[], print: Print) {
  const url = args.find((a) => !a.startsWith('-')) ?? ''
  const match = url.match(/^(?:https?:\/\/)?(?:localhost|127\.0\.0\.1)(?::(\d+))?(\/.*)?$/)
  if (!match) {
    print(`curl: (6) Could not resolve host: ${url.replace(/^https?:\/\//, '').split('/')[0]}`, 'error')
    return
  }
  const port = Number(match[1] ?? 80)
  const path = match[2] ?? '/'
  const target = state.containers.find((c) => c.status === 'running' && c.ports.some((p) => p.host === port))
  if (!target) {
    print(`curl: (7) Failed to connect to localhost port ${port} after 0 ms: Couldn't connect to server`, 'error')
    return
  }
  const mapped = target.ports.find((p) => p.host === port)!
  switch (target.kind) {
    case 'nginx':
      if (mapped.container !== 80) {
        print('curl: (56) Recv failure: Connection reset by peer', 'error')
        return
      }
      print('<!DOCTYPE html>')
      print('<html><head><title>Welcome to nginx!</title></head>')
      print('<body><h1>Welcome to nginx!</h1> …</body></html>')
      return
    case 'app':
      if (mapped.container !== 8080) {
        print('curl: (56) Recv failure: Connection reset by peer', 'error')
        return
      }
      print(path.startsWith('/api/todos') ? '[]' : '{"timestamp":"…","status":404,"error":"Not Found","path":"' + path + '"}')
      return
    case 'postgres':
    case 'redis':
      print('curl: (52) Empty reply from server', 'error')
      return
    default:
      print('curl: (56) Recv failure: Connection reset by peer', 'error')
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function words0(line: string): string[] {
  return [...line.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3])
}

/** Deterministic "random" hex ids - the same session always gives the same ids. */
function hex(state: DockerState, length: number, salt = 0): string {
  let text = ''
  while (text.length < length) {
    state.seed = (Math.imul(state.seed ^ (salt * 2654435761), 1103515245) + 12345) >>> 0
    text += state.seed.toString(16).padStart(8, '0')
  }
  return text.slice(0, length)
}

const ADJECTIVES = ['brave', 'eager', 'funny', 'happy', 'jolly', 'lucid', 'quirky', 'sleepy', 'vigilant', 'zealous']
const SCIENTISTS = ['lovelace', 'hopper', 'turing', 'noether', 'curie', 'euler', 'hamilton', 'shannon', 'goldberg', 'knuth']

function randomName(state: DockerState): string {
  const n = parseInt(hex(state, 4), 16)
  return `${ADJECTIVES[n % ADJECTIVES.length]}_${SCIENTISTS[Math.floor(n / 10) % SCIENTISTS.length]}`
}

function ago(state: DockerState, created: number): string {
  const minutes = Math.max(0, state.clock - created)
  return minutes === 0 ? 'Less than a second ago' : minutes === 1 ? 'About a minute ago' : `${minutes} minutes ago`
}

function row(cells: string[], widths: number[]): string {
  return cells.map((c, i) => (i < widths.length ? c.padEnd(widths[i]) : c)).join(' ').trimEnd()
}

function upTime(state: DockerState, created: number): string {
  const minutes = Math.max(1, state.clock - created)
  return minutes === 1 ? 'Up About a minute' : `Up ${minutes} minutes`
}
