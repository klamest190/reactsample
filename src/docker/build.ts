/**
 * DOCKER PART · `docker build` - simulated
 *
 * What really happens, step by step:
 *
 *   - Every instruction produces a LAYER on top of the previous one.
 *   - BuildKit caches every layer. A step is only re-run if its instruction
 *     changed, or (for COPY) the copied files changed - and then EVERY following
 *     step of that stage runs again. That is why the order matters:
 *
 *         COPY pom.xml .                  ← changes rarely
 *         RUN mvn dependency:go-offline   ← slow, but cached as long as pom.xml is the same
 *         COPY src ./src                  ← changes all the time
 *         RUN mvn package
 *
 *   - Multi-stage builds: a `FROM … AS build` stage compiles, the final stage only
 *     copies the result (`COPY --from=build …`). Only the final stage ends up in the image.
 *
 * No container runs here: RUN commands are recognized (mvn, npm, apt-get, adduser …)
 * and their effect on the file system is modelled - enough to find the typical
 * mistakes: missing files, wrong order, a JAR that is not where CMD expects it.
 */

import { DockerfileError, parseDockerfile, shellWords, substitute, type Instruction } from './dockerfile'
import { findImage, formatSize, splitImage } from './images'
import { PROJECTS, ignoredBy, type ProjectId } from './projects'

export type Change = 'none' | 'code' | 'dependencies'

export type BuildStep = {
  label: string
  line: number
  cached: boolean
  seconds: number
  /** Size of the layer in MB (0 for metadata like ENV or EXPOSE). */
  sizeMb: number
  /** Short explanation, e.g. "downloads all Maven dependencies". */
  note?: string
}

export type BuildRun = {
  steps: BuildStep[]
  log: string[]
  seconds: number
  contextMb: number
  error: { line: number; message: string } | null
}

export type Layer = { label: string; sizeMb: number; line: number }

export type ImageSummary = {
  base: string
  baseMb: number
  layers: Layer[]
  sizeMb: number
  user: string
  workdir: string
  command: string[] | null
  exposes: number[]
  env: Record<string, string>
  stages: string[]
  /** Paths in the final image (for tests and the "look inside" view). */
  files: string[]
}

export type Severity = 'error' | 'warning' | 'info'
export type Finding = { rule: string; severity: Severity; line: number; de: string; en: string }

export type RunPreview = { ok: boolean; lines: string[] }

export type BuildResult = {
  first: BuildRun
  /** The same build again after a change - shows what the cache saves. */
  second: BuildRun | null
  image: ImageSummary | null
  findings: Finding[]
  run: RunPreview | null
  instructions: Instruction[]
}

export type BuildOptions = {
  project: ProjectId
  /** Content of `.dockerignore` (empty = no file). */
  ignore?: string
  /** What changes before the second build. */
  change?: Change
  tag?: string
}

type FileEntry = { kb: number; version: string }
type Stage = {
  name: string
  index: number
  base: string
  files: Map<string, FileEntry>
  workdir: string
  user: string
  users: Set<string>
  tools: Set<string>
  env: Record<string, string>
  exposes: number[]
  command: string[] | null
  entrypoint: string[] | null
  cmd: string[] | null
  layers: Layer[]
  baseMb: number
  kind: string
}

const KB = 1024

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

export function simulateBuild(dockerfile: string, options: BuildOptions): BuildResult {
  let instructions: Instruction[]
  try {
    instructions = parseDockerfile(dockerfile)
  } catch (error) {
    if (!(error instanceof DockerfileError)) throw error
    const message = `failed to solve: dockerfile parse error on line ${error.line}: ${error.message}`
    return {
      first: { steps: [], log: [`ERROR: ${message}`], seconds: 0, contextMb: 0, error: { line: error.line, message } },
      second: null,
      image: null,
      findings: [],
      run: null,
      instructions: [],
    }
  }

  const first = new Builder(instructions, options, 'none', null).run()
  const second = options.change && !first.run.error ? new Builder(instructions, options, options.change, first.keys).run() : null
  const image = first.run.error ? null : first.image
  return {
    first: first.run,
    second: second?.run ?? null,
    image,
    findings: lint(instructions, options, image),
    run: image && first.final ? preview(first.final, image) : null,
    instructions,
  }
}

// ---------------------------------------------------------------------------
// The builder
// ---------------------------------------------------------------------------

class BuildFailure extends Error {
  readonly line: number
  constructor(message: string, line: number) {
    super(message)
    this.line = line
  }
}

class Builder {
  private readonly stages: Stage[] = []
  private readonly steps: BuildStep[] = []
  private readonly log: string[] = []
  readonly keys = new Set<string>()
  private readonly instructions: Instruction[]
  private readonly options: BuildOptions
  private readonly previous: Set<string> | null
  private readonly context: Map<string, FileEntry>
  private contextMb = 0

  constructor(instructions: Instruction[], options: BuildOptions, change: Change, previous: Set<string> | null) {
    this.instructions = instructions
    this.options = options
    this.previous = previous
    const project = PROJECTS[options.project]
    const ignored = ignoredBy(options.ignore ?? '')
    this.context = new Map()
    for (const file of project.files) {
      if (ignored(file.path)) continue
      const changed = change !== 'none' && file.group === change
      this.context.set(file.path, { kb: file.kb, version: changed ? 'v2' : 'v1' })
      this.contextMb += file.kb / KB
    }
  }

  run(): { run: BuildRun; image: ImageSummary | null; final: Stage | null; keys: Set<string> } {
    const t = this.log
    const counts = this.stageCounts()
    t.push('[+] Building')
    t.push(`#1 [internal] load build definition from Dockerfile`)
    t.push(`#2 [internal] load .dockerignore${this.options.ignore?.trim() ? '' : ' (no .dockerignore - everything is sent)'}`)
    t.push(`#3 [internal] load build context`)
    t.push(`#3 transferring context: ${formatSize(this.contextMb)}`)
    let seconds = this.contextMb / 60
    let error: BuildRun['error'] = null

    const globalArgs: Record<string, string> = {}
    let stage: Stage | null = null
    let key = ''
    let missed = false
    let stepNumber = 0

    try {
      for (const instruction of this.instructions) {
        if (!stage && instruction.keyword === 'ARG') {
          const [name, value = ''] = instruction.args.split('=')
          globalArgs[name.trim()] = value.trim()
          continue
        }
        if (instruction.keyword === 'FROM') {
          stage = this.startStage(instruction, globalArgs)
          key = `FROM ${stage.base}`
          missed = false
          stepNumber = 1
          const label = `[${stage.name} ${stepNumber}/${counts[stage.index]}] FROM docker.io/library/${stage.base}`
          const pull = this.previous ? 0 : Math.max(0.5, stage.baseMb / 45)
          this.steps.push({ label, line: instruction.line, cached: Boolean(this.previous), seconds: pull, sizeMb: 0 })
          t.push(`#${this.steps.length + 3} ${label}`)
          if (!this.previous) t.push(`#${this.steps.length + 3} pulling ${formatSize(stage.baseMb)} ... done ${pull.toFixed(1)}s`)
          seconds += pull
          continue
        }
        if (!stage) throw new BuildFailure('no build stage in current context - the first instruction must be FROM', instruction.line)

        const result = this.execute(stage, instruction)
        if (!result) continue // metadata: ENV, EXPOSE, CMD … - no own build step
        stepNumber++

        key += `|${instruction.keyword} ${instruction.args}|${result.inputs}`
        this.keys.add(key)
        const cached = !missed && Boolean(this.previous?.has(key))
        if (!cached) missed = true
        const label = `[${stage.name} ${stepNumber}/${counts[stage.index]}] ${instruction.keyword} ${flagText(instruction)}${instruction.args}`
        const stepSeconds = cached ? 0 : result.seconds
        this.steps.push({ label, line: instruction.line, cached, seconds: stepSeconds, sizeMb: result.sizeMb, note: result.note })
        t.push(`#${this.steps.length + 3} ${label}`)
        t.push(`#${this.steps.length + 3} ${cached ? 'CACHED' : `DONE ${stepSeconds.toFixed(1)}s`}`)
        seconds += stepSeconds
        if (result.sizeMb > 0) stage.layers.push({ label: `${instruction.keyword} ${instruction.args}`, sizeMb: result.sizeMb, line: instruction.line })
      }
      if (!stage) throw new BuildFailure('the Dockerfile has no FROM instruction', 1)
    } catch (failure) {
      if (!(failure instanceof BuildFailure)) throw failure
      error = { line: failure.line, message: failure.message }
      t.push(`ERROR: failed to solve: ${failure.message}`)
    }

    const final = error ? null : stage
    if (final) {
      t.push(`#${this.steps.length + 4} exporting to image`)
      t.push(`#${this.steps.length + 4} naming to docker.io/library/${this.options.tag ?? PROJECTS[this.options.project].name}:latest done`)
      seconds += 0.5
    }
    return {
      run: { steps: this.steps, log: t, seconds: Math.round(seconds * 10) / 10, contextMb: this.contextMb, error },
      image: final ? summarize(final, this.stages) : null,
      final,
      keys: this.keys,
    }
  }

  private stageCounts(): number[] {
    const counts: number[] = []
    for (const i of this.instructions) {
      if (i.keyword === 'FROM') counts.push(1)
      else if (counts.length && ['RUN', 'COPY', 'ADD', 'WORKDIR'].includes(i.keyword)) counts[counts.length - 1]++
    }
    return counts
  }

  private startStage(instruction: Instruction, globalArgs: Record<string, string>): Stage {
    const words = substitute(instruction.args, globalArgs).split(/\s+/)
    const reference = words[0]
    const alias = words[1]?.toLowerCase() === 'as' ? words[2] : undefined
    const index = this.stages.length
    const earlier = this.stages.find((s) => s.name === reference)
    let stage: Stage
    if (earlier) {
      // FROM build AS test - continue from an earlier stage
      stage = { ...earlier, name: alias ?? `stage-${index}`, index, files: new Map(earlier.files), layers: [...earlier.layers], users: new Set(earlier.users), tools: new Set(earlier.tools), env: { ...earlier.env } }
    } else {
      const image = findImage(reference)
      if (!image) {
        throw new BuildFailure(
          `docker.io/library/${reference}: pull access denied, repository does not exist or may require authorization`,
          instruction.line,
        )
      }
      const files = new Map<string, FileEntry>()
      if (image.kind === 'nginx') {
        files.set('/usr/share/nginx/html/index.html', { kb: 1, version: 'nginx-default' })
        files.set('/etc/nginx/conf.d/default.conf', { kb: 1, version: 'nginx-default' })
      }
      stage = {
        name: alias ?? `stage-${index}`,
        index,
        base: `${splitImage(reference).repository}:${splitImage(reference).tag}`,
        files,
        workdir: '/',
        user: 'root',
        users: new Set(['root', ...image.users]),
        tools: new Set(image.tools),
        env: {},
        exposes: [...(image.exposes ?? [])],
        command: null,
        entrypoint: null,
        cmd: image.defaultCommand ?? null,
        layers: [],
        baseMb: image.sizeMb,
        kind: image.kind,
      }
    }
    this.stages.push(stage)
    return stage
  }

  /** Runs one instruction. Returns null for pure metadata (no build step of its own in BuildKit's output). */
  private execute(stage: Stage, instruction: Instruction): { seconds: number; sizeMb: number; inputs: string; note?: string } | null {
    const args = substitute(instruction.args, stage.env)
    switch (instruction.keyword) {
      case 'WORKDIR': {
        stage.workdir = resolvePath(stage.workdir, args.trim())
        return { seconds: 0.1, sizeMb: 0, inputs: '' }
      }
      case 'ENV': {
        for (const [name, value] of envPairs(args)) stage.env[name] = value
        return null
      }
      case 'ARG': {
        const [name, value] = args.split('=')
        if (value !== undefined && stage.env[name.trim()] === undefined) stage.env[name.trim()] = value.trim()
        return null
      }
      case 'EXPOSE':
        for (const port of args.split(/\s+/)) {
          const n = parseInt(port, 10)
          if (!Number.isNaN(n) && !stage.exposes.includes(n)) stage.exposes.push(n)
        }
        return null
      case 'USER':
        stage.user = args.trim().split(':')[0]
        return null
      case 'CMD':
        stage.cmd = instruction.json ?? ['/bin/sh', '-c', args]
        return null
      case 'ENTRYPOINT':
        stage.entrypoint = instruction.json ?? ['/bin/sh', '-c', args]
        // A new ENTRYPOINT resets the CMD inherited from the base image.
        stage.cmd = null
        return null
      case 'LABEL':
      case 'HEALTHCHECK':
      case 'VOLUME':
      case 'STOPSIGNAL':
      case 'SHELL':
      case 'MAINTAINER':
      case 'ONBUILD':
        return null
      case 'COPY':
      case 'ADD':
        return this.copy(stage, instruction, args)
      case 'RUN':
        return this.runCommand(stage, instruction, args)
      default:
        return null
    }
  }

  private copy(stage: Stage, instruction: Instruction, args: string) {
    const parts = instruction.json ?? shellWords(args)
    if (parts.length < 2) throw new BuildFailure(`${instruction.keyword} requires at least two arguments, but only one was provided`, instruction.line)
    const destination = parts[parts.length - 1]
    const sources = parts.slice(0, -1)
    const from = instruction.flags.from
    let sourceFiles = this.context
    if (from) {
      const sourceStage = this.stages.find((s) => s.name === from || String(s.index) === from)
      if (!sourceStage || sourceStage === stage) {
        throw new BuildFailure(`failed to compute cache key: stage "${from}" not found - is there a FROM … AS ${from} before?`, instruction.line)
      }
      // COPY --from reads from the other stage's file system; relative paths start at its root.
      sourceFiles = sourceStage.files
    }

    const copied: [string, FileEntry][] = []
    for (const source of sources) {
      const matches = matchFiles(sourceFiles, source, Boolean(from))
      if (!matches.length) {
        const shown = from ? source : '/' + source.replace(/^\.\//, '')
        throw new BuildFailure(`failed to compute cache key: failed to calculate checksum of ref: "${shown}": not found`, instruction.line)
      }
      const isDirectory = matches.length > 1 || matches.some((m) => m.relative !== '')
      for (const m of matches) {
        const target = targetPath(stage.workdir, destination, m.path, m.relative, isDirectory || sources.length > 1)
        copied.push([target, m.entry])
      }
    }
    for (const [path, entry] of copied) stage.files.set(path, entry)
    const kb = copied.reduce((sum, [, e]) => sum + e.kb, 0)
    const inputs = copied.map(([p, e]) => `${p}@${e.version}`).sort().join(',')
    return { seconds: 0.1 + kb / KB / 200, sizeMb: kb / KB, inputs }
  }

  private runCommand(stage: Stage, instruction: Instruction, args: string) {
    if (stage.kind === 'distroless') {
      throw new BuildFailure('process "/bin/sh -c ' + args + '" did not complete successfully: exec: "/bin/sh": stat /bin/sh: no such file or directory (distroless images have no shell)', instruction.line)
    }
    const commands = (instruction.json ? [instruction.json.join(' ')] : args.split(/&&|;|\|\|/)).map((c) => c.trim()).filter(Boolean)
    let seconds = 0
    let sizeMb = 0
    const notes: string[] = []
    let aptListsMb = 0
    const produced: string[] = []
    const fail = (message: string, code = 1): never => {
      throw new BuildFailure(`process "/bin/sh -c ${args}" did not complete successfully: exit code: ${code}\n${message}`, instruction.line)
    }
    const has = (path: string) => [...stage.files.keys()].some((p) => p === path || p.startsWith(path + '/'))
    const inWorkdir = (name: string) => resolvePath(stage.workdir, name)
    const add = (path: string, kb: number, version: string) => {
      stage.files.set(path, { kb, version })
      produced.push(`${path}@${version}`)
    }
    const versionOf = (...paths: string[]) =>
      [...stage.files.entries()]
        .filter(([p]) => paths.some((prefix) => p === prefix || p.startsWith(prefix + '/')))
        .map(([p, e]) => `${p}@${e.version}`)
        .sort()
        .join(',')

    for (const command of commands) {
      const words = shellWords(command)
      const program = words[0]
      const needTool = (tool: string) => {
        if (!stage.tools.has(tool)) fail(`/bin/sh: 1: ${tool}: not found`, 127)
      }
      if (program === 'mvn' || program === './mvnw' || program === 'mvnw') {
        if (program === 'mvn') needTool('mvn')
        else {
          if (!has(inWorkdir('mvnw'))) fail(`/bin/sh: 1: ${program}: not found`, 127)
          if (!has(inWorkdir('.mvn'))) fail('Error: Could not find or load main class org.apache.maven.wrapper.MavenWrapperMain (.mvn/wrapper is missing)')
          needTool('java')
        }
        if (!has(inWorkdir('pom.xml'))) {
          fail(`[ERROR] The goal you specified requires a project to execute but there is no POM in this directory (${stage.workdir}).`)
        }
        const goals = words.slice(1).join(' ')
        const repository = '/root/.m2/repository'
        if (/dependency:(go-offline|resolve)/.test(goals)) {
          add(repository, 82 * KB, versionOf(inWorkdir('pom.xml')))
          seconds += 45
          sizeMb += 82
          notes.push('downloads all Maven dependencies')
        }
        if (/\b(package|install|verify)\b/.test(goals)) {
          if (!has(inWorkdir('src/main'))) fail('[ERROR] No sources to compile (src/main/java is missing)')
          const offline = has(repository)
          const version = versionOf(inWorkdir('pom.xml'), inWorkdir('src'))
          if (!offline) {
            add(repository, 82 * KB, versionOf(inWorkdir('pom.xml')))
            sizeMb += 82
          }
          add(inWorkdir('target/todo-api-0.0.1-SNAPSHOT.jar'), 26_000, version)
          add(inWorkdir('target/classes'), 200, version)
          const tests = /-DskipTests|-Dmaven\.test\.skip/.test(goals) ? 0 : 9
          seconds += (offline ? 14 : 58) + tests
          sizeMb += 26.2
          notes.push(offline ? 'compiles and packages the JAR' : 'downloads dependencies AND compiles')
        }
        continue
      }
      if (program === 'npm' || program === 'npx') {
        needTool('npm')
        const sub = words[1]
        if (sub === 'ci' || sub === 'install' || sub === 'i') {
          if (!has(inWorkdir('package.json'))) fail(`npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '${inWorkdir('package.json')}'`, 254)
          if (sub === 'ci' && !has(inWorkdir('package-lock.json'))) {
            fail('npm error The `npm ci` command can only install with an existing package-lock.json', 1)
          }
          add(inWorkdir('node_modules'), 180 * KB, versionOf(inWorkdir('package.json'), inWorkdir('package-lock.json')))
          seconds += sub === 'ci' ? 24 : 34
          sizeMb += 180
          notes.push('installs node_modules')
          continue
        }
        if (sub === 'run' && words[2] === 'build') {
          if (!has(inWorkdir('node_modules'))) fail('sh: 1: vite: not found', 127)
          if (!has(inWorkdir('src'))) fail('error during build: Could not resolve entry module "index.html" / src is missing')
          const version = versionOf(inWorkdir('src'), inWorkdir('index.html'), inWorkdir('node_modules'))
          add(inWorkdir('dist/index.html'), 1, version)
          add(inWorkdir('dist/assets/index.js'), 180, version)
          seconds += 7
          sizeMb += 0.2
          notes.push('builds the production bundle (dist/)')
          continue
        }
        seconds += 2
        continue
      }
      if (program === 'apt-get') {
        needTool('apt-get')
        if (words[1] === 'update') {
          aptListsMb += 25
          sizeMb += 25
          seconds += 6
          stage.tools.add('$apt-lists')
        } else if (words[1] === 'install') {
          if (!stage.tools.has('$apt-lists')) fail(`E: Unable to locate package ${words.filter((w) => !w.startsWith('-')).slice(2).join(' ')}`, 100)
          const packages = words.slice(2).filter((w) => !w.startsWith('-'))
          for (const p of packages) stage.tools.add(p)
          sizeMb += 15 * packages.length * (words.includes('--no-install-recommends') ? 1 : 2)
          seconds += 4 + 3 * packages.length
        }
        continue
      }
      if (program === 'apk') {
        needTool('apk')
        const packages = words.slice(2).filter((w) => !w.startsWith('-'))
        for (const p of packages) stage.tools.add(p)
        sizeMb += packages.length * (words.includes('--no-cache') ? 3 : 5)
        seconds += 2
        continue
      }
      if (program === 'rm') {
        const targets = words.slice(1).filter((w) => !w.startsWith('-'))
        for (const target of targets) {
          if (target.startsWith('/var/lib/apt/lists')) {
            // Only helps inside the SAME RUN as apt-get update - an earlier layer keeps its size.
            sizeMb -= aptListsMb
            aptListsMb = 0
            continue
          }
          const path = resolvePath(stage.workdir, target.replace(/\/\*$/, ''))
          for (const p of [...stage.files.keys()]) if (p === path || p.startsWith(path + '/')) stage.files.delete(p)
        }
        seconds += 0.2
        continue
      }
      if (['adduser', 'useradd', 'addgroup', 'groupadd'].includes(program)) {
        const valueFlags = new Set(['-G', '-g', '-u', '-s', '-h', '-D', '--uid', '--gid', '--shell', '--home', '--ingroup'])
        const names = words.slice(1).filter((w, i, all) => !w.startsWith('-') && !valueFlags.has(all[i - 1] ?? ''))
        const name = names[names.length - 1]
        if (name && (program === 'adduser' || program === 'useradd')) stage.users.add(name)
        seconds += 0.3
        continue
      }
      if (program === 'mkdir') {
        for (const dir of words.slice(1).filter((w) => !w.startsWith('-'))) add(resolvePath(stage.workdir, dir) + '/.keep', 0, 'dir')
        seconds += 0.1
        continue
      }
      if (['curl', 'wget'].includes(program)) {
        needTool(program)
        sizeMb += 5
        seconds += 3
        continue
      }
      // echo, chmod, chown, ls, java -version … - no noticeable effect
      seconds += 0.3
    }
    return {
      seconds,
      sizeMb: Math.max(0, Math.round(sizeMb * 10) / 10),
      inputs: produced.join(',') + '|' + versionOf(stage.workdir),
      note: notes.join(', ') || undefined,
    }
  }
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

function resolvePath(workdir: string, path: string): string {
  const absolute = path.startsWith('/') ? path : `${workdir.replace(/\/$/, '')}/${path}`
  const parts: string[] = []
  for (const part of absolute.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  return '/' + parts.join('/')
}

/** Files matching a COPY source: a file, a folder (with everything inside), `.` or a glob like `target/*.jar`. */
function matchFiles(files: Map<string, FileEntry>, source: string, fromStage: boolean) {
  let pattern = source.replace(/^\.\//, '')
  if (fromStage && pattern !== '.' && !pattern.startsWith('/')) pattern = resolvePath('/', pattern)
  pattern = pattern.replace(/\/$/, '')
  const result: { path: string; relative: string; entry: FileEntry }[] = []
  const glob = /[*?]/.test(pattern)
  const regex = glob ? new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]') + '$') : null
  for (const [path, entry] of files) {
    if (path.endsWith('/.keep')) continue
    if (pattern === '' || pattern === '.' || pattern === '/') result.push({ path, relative: path.replace(/^\//, ''), entry })
    else if (regex ? regex.test(path) : path === pattern) result.push({ path, relative: '', entry })
    else if (!regex && path.startsWith(pattern + '/')) result.push({ path, relative: path.slice(pattern.length + 1), entry })
  }
  return result
}

function targetPath(workdir: string, destination: string, source: string, relative: string, intoDirectory: boolean): string {
  const base = resolvePath(workdir, destination)
  if (relative) return `${base.replace(/\/$/, '')}/${relative}`
  if (intoDirectory || destination.endsWith('/') || destination === '.') return `${base.replace(/\/$/, '')}/${source.split('/').pop()}`
  return base
}

function envPairs(args: string): [string, string][] {
  if (!args.includes('=')) {
    const [name, ...value] = args.split(/\s+/)
    return [[name, value.join(' ')]]
  }
  return [...args.matchAll(/(\w+)=("[^"]*"|'[^']*'|\S*)/g)].map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')])
}

const flagText = (instruction: Instruction) =>
  Object.entries(instruction.flags)
    .map(([k, v]) => `--${k}=${v} `)
    .join('')

// ---------------------------------------------------------------------------
// The finished image
// ---------------------------------------------------------------------------

function summarize(final: Stage, stages: Stage[]): ImageSummary {
  const layers = final.layers
  const sizeMb = final.baseMb + layers.reduce((sum, l) => sum + l.sizeMb, 0)
  const command = final.entrypoint ? [...final.entrypoint, ...(final.cmd ?? [])] : final.cmd
  return {
    base: final.base,
    baseMb: final.baseMb,
    layers,
    sizeMb: Math.round(sizeMb * 10) / 10,
    user: final.user,
    workdir: final.workdir,
    command,
    exposes: final.exposes,
    env: final.env,
    stages: stages.map((s) => s.name),
    files: [...final.files.keys()].filter((p) => !p.endsWith('/.keep')),
  }
}

/** What `docker run -p 8080:8080 <image>` would print. */
function preview(stage: Stage, image: ImageSummary): RunPreview {
  const lines: string[] = []
  if (!stage.users.has(stage.user) && !/^\d+$/.test(stage.user)) {
    return { ok: false, lines: [`docker: Error response from daemon: unable to find user ${stage.user}: no matching entries in passwd file.`] }
  }
  const command = image.command
  if (!command?.length) return { ok: false, lines: ['docker: Error response from daemon: No command specified.'] }

  const words = command[0] === '/bin/sh' && command[1] === '-c' ? shellWords(command.slice(2).join(' ')) : command
  const program = words[0]
  if (program === 'java') {
    if (!stage.tools.has('java')) return { ok: false, lines: ['exec: "java": executable file not found in $PATH'] }
    const jarIndex = words.indexOf('-jar')
    if (jarIndex >= 0) {
      const jar = resolvePath(stage.workdir, words[jarIndex + 1] ?? '')
      if (!stage.files.has(jar)) return { ok: false, lines: [`Error: Unable to access jarfile ${words[jarIndex + 1]}`] }
    }
    lines.push('  .   ____          _            __ _ _')
    lines.push(' :: Spring Boot ::                (v4.0.0)')
    lines.push('INFO  TodoApiApplication : Starting TodoApiApplication using Java 21')
    lines.push('INFO  TomcatWebServer    : Tomcat started on port 8080 (http)')
    lines.push('INFO  TodoApiApplication : Started TodoApiApplication in 2.8 seconds')
    if (stage.user === 'root') lines.push('(USER root)')
    return { ok: true, lines }
  }
  if (program === 'nginx') {
    const index = stage.files.get('/usr/share/nginx/html/index.html')
    lines.push('/docker-entrypoint.sh: Configuration complete; ready for start up')
    lines.push('nginx: start worker processes')
    if (!index) lines.push('curl http://localhost:8080 → 403 Forbidden (directory index of "/usr/share/nginx/html/" is forbidden)')
    else if (index.version === 'nginx-default') lines.push('curl http://localhost:8080 → "Welcome to nginx!" - the default page, your app is not in /usr/share/nginx/html')
    else lines.push('curl http://localhost:8080 → 200 OK - your React app')
    return { ok: Boolean(index && index.version !== 'nginx-default'), lines }
  }
  if (program === 'node' || program === 'npm') {
    const script = words[1]
    if (program === 'node' && script && !stage.files.has(resolvePath(stage.workdir, script))) {
      return { ok: false, lines: [`Error: Cannot find module '${resolvePath(stage.workdir, script)}'`] }
    }
    lines.push(program === 'npm' ? `> ${words.slice(1).join(' ')}` : `node ${script ?? ''}`)
    lines.push('Server listening on port 3000')
    return { ok: true, lines }
  }
  if (program === 'jshell') return { ok: true, lines: ['|  Welcome to JShell -- Version 21', '(exits immediately without -it)'] }
  return { ok: true, lines: [`(runs: ${words.join(' ')})`] }
}

// ---------------------------------------------------------------------------
// Lint: the typical review comments - rule ids like hadolint where one exists
// ---------------------------------------------------------------------------

function lint(instructions: Instruction[], options: BuildOptions, image: ImageSummary | null): Finding[] {
  const findings: Finding[] = []
  const add = (rule: string, severity: Severity, line: number, de: string, en: string) => findings.push({ rule, severity, line, de, en })
  const froms = instructions.filter((i) => i.keyword === 'FROM')
  const finalFrom = froms[froms.length - 1]
  const finalStart = finalFrom ? instructions.indexOf(finalFrom) : 0
  const finalStage = instructions.slice(finalStart)

  for (const from of froms) {
    const reference = from.args.split(/\s+/)[0]
    const { tag, explicitTag } = splitImage(reference)
    if (froms.some((f) => f.args.split(/\s+/)[2] === reference)) continue // FROM build - an earlier stage
    if (!explicitTag || tag === 'latest') {
      add('DL3007', 'warning', from.line,
        `\`${reference}\` ohne feste Version: \`latest\` ändert sich jederzeit - der nächste Build kann plötzlich anders aussehen. Lege die Version fest, z. B. \`:21-jre\`.`,
        `\`${reference}\` has no fixed version: \`latest\` can change at any time - the next build may suddenly differ. Pin the version, e.g. \`:21-jre\`.`)
    }
  }

  if (image && froms.length === 1 && ['maven', 'jdk', 'node'].includes(findImage(finalFrom.args.split(/\s+/)[0])?.kind ?? '')) {
    add('multi-stage', 'warning', finalFrom.line,
      `Das fertige Image enthält die komplette Bau-Umgebung (${formatSize(image.sizeMb)}). Mit einem Multi-Stage-Build baust du in einer Stage und kopierst nur das Ergebnis in ein schlankes Laufzeit-Image (JRE bzw. nginx).`,
      `The final image contains the whole build environment (${formatSize(image.sizeMb)}). With a multi-stage build you build in one stage and copy only the result into a slim runtime image (JRE or nginx).`)
  }

  // COPY . . before installing dependencies: every code change reinstalls everything.
  let copiedAll: Instruction | null = null
  for (const i of instructions) {
    if (i.keyword === 'FROM') copiedAll = null
    if (i.keyword === 'COPY' && !i.flags.from && /^\.\s+\S+$/.test(i.args.trim())) copiedAll = i
    if (i.keyword === 'RUN' && copiedAll && /(mvnw?|\.\/mvnw)\s.*(dependency:go-offline|package|install)|npm (ci|install|i)\b/.test(i.args)) {
      add('cache-order', 'warning', copiedAll.line,
        '`COPY . .` steht vor dem Installieren der Abhängigkeiten. Dann ist nach JEDER Code-Änderung der Cache weg und alles wird neu heruntergeladen. Kopiere zuerst nur `pom.xml` bzw. `package*.json`, installiere, und kopiere danach den Code.',
        '`COPY . .` comes before installing the dependencies. Then EVERY code change invalidates the cache and everything is downloaded again. Copy only `pom.xml` or `package*.json` first, install, then copy the code.')
      copiedAll = null
    }
  }

  if (!options.ignore?.trim() && instructions.some((i) => i.keyword === 'COPY' && !i.flags.from && /^\.\s/.test(i.args.trim()))) {
    const heavy = options.project === 'react' ? '`node_modules` (180 MB)' : '`target/` und `.git/`'
    const heavyEn = options.project === 'react' ? '`node_modules` (180 MB)' : '`target/` and `.git/`'
    add('dockerignore', 'warning', 1,
      `Ohne \`.dockerignore\` landet mit \`COPY . .\` alles im Build - auch ${heavy}. Das macht den Build langsam und das Image groß.`,
      `Without a \`.dockerignore\`, \`COPY . .\` sends everything - including ${heavyEn}. That makes the build slow and the image big.`)
  }

  for (const i of instructions) {
    if (i.keyword === 'ADD' && !/^https?:|\.tar/.test(i.args.trim())) {
      add('DL3020', 'info', i.line, 'Für lokale Dateien `COPY` statt `ADD` verwenden - `ADD` kann mehr (URLs, Archive entpacken) und überrascht deshalb leichter.',
        'Use `COPY` instead of `ADD` for local files - `ADD` does more (URLs, unpacking archives) and therefore surprises more easily.')
    }
    if (i.keyword === 'RUN' && /\bcd\s+\//.test(i.args)) {
      add('DL3003', 'info', i.line, 'Statt `cd` in RUN lieber `WORKDIR` benutzen - das gilt dann auch für alle folgenden Befehle.',
        'Use `WORKDIR` instead of `cd` in RUN - it then applies to all following instructions as well.')
    }
    if (i.keyword === 'RUN' && /apt-get install/.test(i.args) && !/rm -rf \/var\/lib\/apt\/lists/.test(i.args)) {
      add('DL3009', 'info', i.line, 'Nach `apt-get install` im SELBEN RUN `rm -rf /var/lib/apt/lists/*` aufräumen - sonst bleiben die Paketlisten für immer in der Schicht.',
        'Clean up with `rm -rf /var/lib/apt/lists/*` in the SAME RUN after `apt-get install` - otherwise the package lists stay in the layer forever.')
    }
    if (i.keyword === 'RUN' && /npm install\b/.test(i.args)) {
      add('npm-ci', 'info', i.line, 'In Docker `npm ci` statt `npm install` - installiert exakt die Versionen aus `package-lock.json` und ist schneller.',
        'Use `npm ci` instead of `npm install` in Docker - it installs exactly the versions from `package-lock.json` and is faster.')
    }
    if (i.keyword === 'ENV' && /(PASSWORD|SECRET|TOKEN|API_KEY)\w*\s*=?\s*\S/i.test(i.args)) {
      add('secret', 'warning', i.line, 'Ein Passwort im Dockerfile steckt für immer im Image - jeder mit dem Image kann es mit `docker history` lesen. Übergib es beim Start (`-e` bzw. `environment:` in Compose).',
        'A password in the Dockerfile is in the image forever - anyone with the image can read it with `docker history`. Pass it at startup (`-e` or `environment:` in Compose).')
    }
  }

  const cmds = finalStage.filter((i) => i.keyword === 'CMD')
  if (cmds.length > 1) {
    add('DL4003', 'warning', cmds[0].line, 'Mehrere `CMD` - nur das letzte zählt.', 'Several `CMD` - only the last one counts.')
  }
  for (const i of finalStage) {
    if ((i.keyword === 'CMD' || i.keyword === 'ENTRYPOINT') && !i.json) {
      add('DL3025', 'info', i.line,
        `\`${i.keyword}\` in der Shell-Form startet \`/bin/sh -c …\` - dein Programm bekommt dann Signale wie \`docker stop\` nicht direkt. Besser die JSON-Form: \`${i.keyword} ["java", "-jar", "app.jar"]\`.`,
        `\`${i.keyword}\` in shell form starts \`/bin/sh -c …\` - your program then does not receive signals like \`docker stop\` directly. Prefer the JSON form: \`${i.keyword} ["java", "-jar", "app.jar"]\`.`)
    }
  }

  if (image) {
    if (image.user === 'root' && !['nginx', 'postgres', 'hello'].includes(findImage(image.base)?.kind ?? '')) {
      add('DL3002', 'warning', finalFrom.line,
        'Der Container läuft als `root`. Lege im letzten Stage einen eigenen Benutzer an und wechsle mit `USER` zu ihm - bricht jemand in die App ein, hat er dann nicht gleich alle Rechte.',
        'The container runs as `root`. Create a user of your own in the final stage and switch to it with `USER` - if someone breaks into the app, they do not get all rights at once.')
    }
    if (!image.command?.length) {
      add('no-command', 'error', finalFrom.line, 'Das Image hat keinen Startbefehl - es fehlt `CMD` oder `ENTRYPOINT`.', 'The image has no start command - `CMD` or `ENTRYPOINT` is missing.')
    }
    const runsJava = image.command?.some((c) => c === 'java' || c.includes('java '))
    if (runsJava && !image.exposes.includes(8080)) {
      add('expose', 'info', finalFrom.line, 'Spring Boot lauscht auf Port 8080 - `EXPOSE 8080` dokumentiert das (veröffentlicht wird der Port erst mit `-p`).',
        'Spring Boot listens on port 8080 - `EXPOSE 8080` documents it (the port is only published with `-p`).')
    }
  }
  return findings.sort((a, b) => a.line - b.line)
}
