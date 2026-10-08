/**
 * SPRING PART · The application context - Spring's heart
 *
 * What `SpringApplication.run(App.class, args)` does, in the same order:
 *
 *   1. Component scan: every class with @Component, @Service, @Repository,
 *      @RestController, @Configuration … becomes a bean definition. So does
 *      every @Bean method and every repository interface.
 *   2. Creating beans: constructor parameters are "injected" - Spring looks
 *      for exactly ONE bean of the parameter's type. None, two or a cycle
 *      stop the start with the same explanations real Spring Boot prints
 *      ("APPLICATION FAILED TO START").
 *   3. The web layer collects the @GetMapping/@PostMapping … methods (web.ts).
 *   4. "Started … in 0.4 seconds" - then CommandLineRunner beans run.
 *
 * Every bean exists exactly once (singleton): whoever asks for a TodoService
 * gets the same object.
 */

import type { Annotation, MethodDecl, Program, TypeRef } from '../java/ast'
import { Interpreter, JavaAbort, JavaException } from '../java/interpreter'
import { NULL, newString, type JavaObject, type ClassInfo, type NativeValue, type Value } from '../java/values'
import { STEREOTYPES, beanNameOf, find, has, text } from './annotations'
import { Config, PlaceholderError, kebab } from './config'
import { REPOSITORY_TYPES, Repository, RepositoryError, repositoryEntity } from './data'
import { springLibrary, type LibraryHost } from './library'

export type Language = 'de' | 'en'
export type OutputLine = { type: 'log' | 'info' | 'warn' | 'error' | 'exception'; text: string }

export type BeanKind = 'controller' | 'service' | 'repository' | 'component' | 'configuration' | 'bean' | 'advice'
export type BeanInfo = { name: string; type: string; kind: BeanKind; dependencies: string[]; line: number }

type Definition = {
  name: string
  /** Declared type: the class, the repository interface or the return type of a @Bean method. */
  type: string
  kind: BeanKind
  classInfo?: ClassInfo
  factory?: { owner: Definition; method: MethodDecl }
  repository?: { entity: string }
  primary: boolean
  order: number
  annotations: Annotation[]
  line: number
  dependencies: string[]
  instance?: Value
}

/** "APPLICATION FAILED TO START" - with Spring's description and action, plus a hint for learners. */
export class StartupFailure extends Error {
  readonly description: string
  readonly action: string | null
  readonly hint: { de: string; en: string }
  readonly line?: number

  constructor(description: string, action: string | null, hint: { de: string; en: string }, line?: number) {
    super(description)
    this.description = description
    this.action = action
    this.hint = hint
    this.line = line
  }
}

type InjectionPoint = { text: string; line: number }

const APP_START_TYPE = new Set(['CommandLineRunner', 'ApplicationRunner'])

export class SpringApp implements LibraryHost {
  readonly interpreter: Interpreter
  readonly config: Config
  readonly lines: OutputLine[] = []
  readonly definitions: Definition[] = []
  readonly repositories = new WeakMap<NativeValue, Repository>()
  started = false
  /** The class whose main method started the application. */
  mainClass: string | undefined
  readonly library: ReturnType<typeof springLibrary>
  readonly contextValue: NativeValue = { kind: 'native', type: 'ApplicationContext', data: {} }
  /** Filled by web.ts after the beans exist. */
  onStarted: ((app: SpringApp) => void) | null = null
  private readonly tables = new Map<string, { rows: JavaObject[]; nextId: number }>()

  readonly program: Program
  readonly language: Language

  constructor(program: Program, properties: string, language: Language) {
    this.program = program
    this.language = language
    this.config = new Config(properties)
    this.library = springLibrary(this)
    this.interpreter = new Interpreter(program, this.library)
  }

  get port() {
    return Number(this.config.get('server.port') ?? 8080)
  }

  get isWebApp() {
    return this.definitions.some((d) => d.kind === 'controller')
  }

  // --- Output ----------------------------------------------------------------

  /** Moves finished System.out lines over first - so logs and prints keep their order. */
  flushOutput() {
    for (const line of this.interpreter.lines) this.lines.push({ type: line.stream === 'err' ? 'error' : 'log', text: line.text })
    this.interpreter.lines.length = 0
  }

  log(level: 'INFO' | 'WARN' | 'ERROR', logger: string, message: string) {
    this.flushOutput()
    const type = level === 'INFO' ? 'info' : level === 'WARN' ? 'warn' : 'error'
    this.lines.push({ type, text: `${level.padEnd(5)} ${logger} : ${message}` })
  }

  print(text: string, type: OutputLine['type'] = 'log') {
    this.flushOutput()
    this.lines.push({ type, text })
  }

  // --- LibraryHost -------------------------------------------------------------

  run(mainClass: string | undefined, line: number): Value {
    if (!this.started) this.start(mainClass ?? this.mainClass, line)
    return this.contextValue
  }

  getBean(query: Value, line: number): Value {
    const i = this.interpreter
    if (query.kind === 'string') {
      const definition = this.definitions.find((d) => d.name === query.value)
      if (!definition) i.raise('NoSuchBeanDefinitionException', `No bean named '${query.value}' available`, line)
      return this.instantiate(definition!, [])
    }
    const type = query.kind === 'native' ? (query.data.text ?? '') : i.toText(query)
    const candidates = this.definitions.filter((d) => this.assignable(d, type))
    if (candidates.length === 0) i.raise('NoSuchBeanDefinitionException', `No qualifying bean of type '${type}' available`, line)
    const primary = candidates.filter((d) => d.primary)
    if (candidates.length > 1 && primary.length !== 1) {
      i.raise(
        'NoUniqueBeanDefinitionException',
        `No qualifying bean of type '${type}' available: expected single matching bean but found ${candidates.length}: ${candidates.map((d) => d.name).join(',')}`,
        line,
      )
    }
    return this.instantiate(candidates.length > 1 ? primary[0] : candidates[0], [])
  }

  beanNames() {
    return this.definitions.map((d) => d.name)
  }

  property(key: string) {
    return this.config.get(key)
  }

  activeProfiles() {
    return this.config.activeProfiles
  }

  repositoryCall(target: NativeValue, name: string, args: Value[], line: number): Value | undefined {
    return this.repositories.get(target)?.call(name, args, line)
  }

  // --- Starting ----------------------------------------------------------------

  start(mainClass: string | undefined, line: number) {
    const begin = performance.now()
    const appName = mainClass ?? 'Application'
    this.mainClass = mainClass
    this.log('INFO', appName, `Starting ${appName} using Java 21 with PID 4711`)
    const profiles = this.config.activeProfiles
    this.log(
      'INFO',
      appName,
      profiles.length
        ? `The following ${profiles.length} profile${profiles.length === 1 ? ' is' : 's are'} active: ${profiles.map((p) => `"${p}"`).join(', ')}`
        : 'No active profile set, falling back to 1 default profile: "default"',
    )

    try {
      this.collect()
      const repositoryCount = this.definitions.filter((d) => d.kind === 'repository').length
      if (repositoryCount) {
        this.log(
          'INFO',
          'RepositoryConfigurationDelegate',
          `Finished Spring Data repository scanning in 4 ms. Found ${repositoryCount} JPA repository interface${repositoryCount === 1 ? '' : 's'}.`,
        )
      }
      if (this.isWebApp) this.log('INFO', 'TomcatWebServer', `Tomcat initialized with port ${this.port} (http)`)
      for (const definition of this.definitions) this.instantiate(definition, [])
      this.onStarted?.(this)
    } catch (error) {
      throw this.asFailure(error, line)
    }

    this.started = true
    if (this.isWebApp) this.log('INFO', 'TomcatWebServer', `Tomcat started on port ${this.port} (http) with context path '/'`)
    const seconds = Math.max(0.05, (performance.now() - begin) / 1000 + 0.3)
    this.log('INFO', appName, `Started ${appName} in ${seconds.toFixed(3)} seconds (process running for ${(seconds + 0.4).toFixed(3)})`)

    // CommandLineRunner beans run AFTER the start - the application is fully usable there.
    const runners = this.definitions.filter((d) => [...APP_START_TYPE].some((t) => this.assignable(d, t))).sort((a, b) => a.order - b.order)
    for (const runner of runners) {
      const instance = this.instantiate(runner, [])
      try {
        this.interpreter.resetStepLimit()
        this.interpreter.callMethod(instance, 'run', [{ kind: 'array', type: 'String', values: [] }], runner.line)
      } catch (error) {
        throw this.asFailure(error, runner.line, runner.name)
      }
    }
  }

  private asFailure(error: unknown, line: number, bean?: string): unknown {
    if (error instanceof StartupFailure) return error
    if (error instanceof JavaException) {
      const text = this.interpreter.exceptionText(error.value)
      return new StartupFailure(
        bean ? `Failed to execute CommandLineRunner '${bean}': ${text}` : `Error creating bean: ${text}`,
        null,
        {
          de: `Beim Start ist eine Exception geflogen (Zeile ${error.line}). Solange ein Konstruktor, eine @Bean-Methode oder ein CommandLineRunner scheitert, startet die ganze Anwendung nicht.`,
          en: `An exception was thrown during startup (line ${error.line}). If a constructor, a @Bean method or a CommandLineRunner fails, the whole application does not start.`,
        },
        error.line,
      )
    }
    if (error instanceof PlaceholderError) {
      return new StartupFailure(
        `Error creating bean: ${error.message}`,
        null,
        {
          de: `\`${error.placeholder}\` steht nicht in application.properties. Trage den Schlüssel ein oder gib einen Standardwert an: \${${error.placeholder}:Standard}.`,
          en: `\`${error.placeholder}\` is not in application.properties. Add the key or give a default: \${${error.placeholder}:default}.`,
        },
        line,
      )
    }
    if (error instanceof RepositoryError) {
      return new StartupFailure(`Error creating bean: ${error.message}`, null, {
        de: 'Spring Data prüft Repositories schon beim Start: Die Entity braucht @Entity und ein Feld mit @Id, und jeder Methodenname muss aus Feldern der Entity bestehen (findByTitle braucht ein Feld title).',
        en: 'Spring Data checks repositories at startup: the entity needs @Entity and a field with @Id, and every method name must consist of the entity’s fields (findByTitle needs a field title).',
      })
    }
    return error
  }

  // --- 1. Component scan ------------------------------------------------------

  private collect() {
    const classes = [...this.interpreter.classes.values()]
    let order = 0

    for (const classInfo of classes) {
      const annotations = classInfo.decl.annotations ?? []
      const profile = find(annotations, 'Profile')
      if (profile && !(text(profile) ?? '').split(',').some((p) => this.config.isProfileActive(p))) continue

      const entity = repositoryEntity(classInfo.decl)
      if (entity) {
        for (const base of classInfo.decl.superTypes ?? []) if (REPOSITORY_TYPES.includes(base.name)) this.library.superClasses[classInfo.name] = base.name
        this.definitions.push({
          name: beanNameOf(classInfo.name),
          type: classInfo.name,
          kind: 'repository',
          classInfo,
          repository: { entity },
          primary: false,
          order: order++,
          annotations,
          line: classInfo.decl.line,
          dependencies: [],
        })
        continue
      }

      const stereotype = find(annotations, ...STEREOTYPES)
      const propertiesClass = has(annotations, 'ConfigurationProperties')
      if ((!stereotype && !propertiesClass) || classInfo.isInterface || classInfo.isAbstract) continue

      const definition: Definition = {
        name: text(stereotype, 'value') ?? beanNameOf(classInfo.name),
        type: classInfo.name,
        kind: kindOf(stereotype?.name ?? 'Component'),
        classInfo,
        primary: has(annotations, 'Primary'),
        order: orderOf(annotations) ?? order,
        annotations,
        line: classInfo.decl.line,
        dependencies: [],
      }
      order++
      this.definitions.push(definition)

      // @Bean methods of @Configuration classes (and of the @SpringBootApplication class)
      for (const overloads of classInfo.methods.values()) {
        for (const method of overloads) {
          const bean = find(method.annotations, 'Bean')
          if (!bean) continue
          const methodProfile = find(method.annotations, 'Profile')
          if (methodProfile && !(text(methodProfile) ?? '').split(',').some((p) => this.config.isProfileActive(p))) continue
          this.definitions.push({
            name: text(bean, 'value', 'name') ?? method.name,
            type: method.returnType.name,
            kind: 'bean',
            factory: { owner: definition, method },
            primary: has(method.annotations, 'Primary'),
            order: orderOf(method.annotations) ?? order++,
            annotations: method.annotations ?? [],
            line: method.line,
            dependencies: [],
          })
        }
      }
    }

    // Two beans with the same name: Spring Boot refuses to override by default.
    const names = new Map<string, Definition>()
    for (const definition of this.definitions) {
      const other = names.get(definition.name)
      if (other) {
        throw new StartupFailure(
          `The bean '${definition.name}', defined in ${where(definition)}, could not be registered. A bean with that name has already been defined in ${where(other)} and overriding is disabled.`,
          'Consider renaming one of the beans or enabling overriding by setting spring.main.allow-bean-definition-overriding=true',
          {
            de: 'Zwei Beans haben denselben Namen. Benenne eine Klasse oder @Bean-Methode um - oder gib einen Namen vor: @Service("anderer").',
            en: 'Two beans have the same name. Rename a class or @Bean method - or choose a name: @Service("other").',
          },
          definition.line,
        )
      }
      names.set(definition.name, definition)
    }
  }

  // --- 2. Creating beans ------------------------------------------------------

  instantiate(definition: Definition, chain: Definition[]): Value {
    if (definition.instance) return definition.instance
    if (chain.includes(definition)) throw cycleFailure([...chain.slice(chain.indexOf(definition)), definition])
    const path = [...chain, definition]
    const i = this.interpreter
    i.resetStepLimit()

    let instance: Value
    if (definition.repository) {
      const entity = i.classes.get(definition.repository.entity)
      if (!entity) throw new RepositoryError(`Not a managed type: class ${definition.repository.entity}`)
      let table = this.tables.get(entity.name)
      if (!table) this.tables.set(entity.name, (table = { rows: [], nextId: 1 }))
      const repository = new Repository(definition.name, definition.classInfo!.decl, entity, table, i, (sql) => {
        if (this.config.get('spring.jpa.show-sql') === 'true') this.print('Hibernate: ' + sql)
      })
      const value: NativeValue = { kind: 'native', type: definition.type, data: { text: '$repository' } }
      this.repositories.set(value, repository)
      instance = value
    } else if (definition.factory) {
      const { owner, method } = definition.factory
      const ownerInstance = this.instantiate(owner, path) as JavaObject
      const args = method.params.map((p, index) =>
        this.resolve(p.type, p.name, p.annotations, { text: `Parameter ${index} of method ${method.name} in ${owner.type}`, line: method.line }, definition, path),
      )
      instance = i.invoke(owner.classInfo!, method, method.isStatic ? null : ownerInstance, args)
    } else {
      instance = this.construct(definition, path)
    }

    definition.instance = instance
    return instance
  }

  private construct(definition: Definition, path: Definition[]): Value {
    const i = this.interpreter
    const classInfo = definition.classInfo!
    const properties = find(classInfo.decl.annotations, 'ConfigurationProperties')
    if (properties) return this.bindProperties(classInfo, text(properties, 'value', 'prefix') ?? '')

    const constructor = chooseConstructor(classInfo)
    const args = (constructor?.params ?? []).map((p, index) =>
      this.resolve(p.type, p.name, p.annotations, { text: `Parameter ${index} of constructor in ${classInfo.name}`, line: constructor!.line }, definition, path),
    )
    const object = i.instantiate(classInfo.name, args, definition.line) as JavaObject

    // Field injection (@Autowired on a field) - works, but constructors are the recommended way.
    for (let k: ClassInfo | undefined = classInfo; k; k = k.superclass) {
      for (const field of k.decl.fields) {
        if (field.isStatic) continue
        if (has(field.annotations, 'Autowired', 'Inject', 'Value')) {
          object.fields.set(
            field.name,
            i.adapt(this.resolve(field.type, field.name, field.annotations, { text: `Field ${field.name} in ${classInfo.name}`, line: field.line }, definition, path), field.type),
          )
        }
      }
    }

    for (const overloads of classInfo.methods.values()) {
      for (const method of overloads) {
        if (has(method.annotations, 'PostConstruct') && method.body) i.invoke(classInfo, method, object, [])
      }
    }
    return object
  }

  /** @ConfigurationProperties(prefix = "app"): fields / record components from `app.*`. */
  private bindProperties(classInfo: ClassInfo, prefix: string): Value {
    const i = this.interpreter
    const read = (name: string, type: TypeRef): Value | undefined => {
      const raw = this.config.get(`${prefix}.${kebab(name)}`) ?? this.config.get(`${prefix}.${name}`)
      return raw === undefined ? undefined : convertProperty(raw, type, i)
    }
    if (classInfo.decl.components) {
      return i.instantiate(classInfo.name, classInfo.decl.components.map((c) => read(c.name, c.type) ?? i.defaultValue(c.type)), classInfo.decl.line)
    }
    const object = i.instantiate(classInfo.name, [], classInfo.decl.line) as JavaObject
    for (const field of classInfo.decl.fields) {
      if (field.isStatic) continue
      const value = read(field.name, field.type)
      if (value === undefined) continue
      const setter = 'set' + field.name.charAt(0).toUpperCase() + field.name.slice(1)
      if (classInfo.methods.has(setter)) i.callMethod(object, setter, [value], field.line)
      else object.fields.set(field.name, value)
    }
    return object
  }

  /** Finds exactly one matching bean for a constructor parameter, a field or a @Bean parameter. */
  private resolve(
    type: TypeRef,
    name: string,
    annotations: Annotation[] | undefined,
    point: InjectionPoint,
    target: Definition,
    path: Definition[],
  ): Value {
    const i = this.interpreter
    const value = find(annotations, 'Value')
    if (value) return convertProperty(this.config.resolve(text(value) ?? ''), type, i)

    if (type.name === 'ApplicationContext' || type.name === 'ConfigurableApplicationContext') return this.contextValue
    if (type.name === 'Environment') return { kind: 'native', type: 'Environment', data: {} }

    const elementType = type.args[0]?.name
    if (['List', 'Collection', 'Set'].includes(type.name) && elementType) {
      const all = this.candidates(elementType).sort((a, b) => a.order - b.order)
      if (!all.length) throw missingFailure(point, `${type.name}<${elementType}>`)
      for (const d of all) target.dependencies.push(d.name)
      return { kind: 'native', type: 'ArrayList', data: { list: all.map((d) => this.instantiate(d, path)) } }
    }
    if (type.name === 'Optional' && elementType) {
      const all = this.candidates(elementType)
      if (all.length === 1) target.dependencies.push(all[0].name)
      return { kind: 'native', type: 'Optional', data: { list: all.length === 1 ? [this.instantiate(all[0], path)] : [] } }
    }

    let candidates = this.candidates(type.name)
    const qualifier = text(find(annotations, 'Qualifier'))
    if (qualifier) {
      candidates = candidates.filter((d) => d.name === qualifier || text(find(d.annotations, 'Qualifier')) === qualifier)
    }
    if (candidates.length > 1) {
      const primary = candidates.filter((d) => d.primary)
      if (primary.length === 1) candidates = primary
      else {
        // Last resort, like Spring: the parameter name matches a bean name.
        const byName = candidates.filter((d) => d.name === name)
        if (byName.length === 1) candidates = byName
      }
    }
    if (candidates.length === 0) throw missingFailure(point, type.name, qualifier)
    if (candidates.length > 1) throw ambiguousFailure(point, type.name, candidates)
    target.dependencies.push(candidates[0].name)
    return this.instantiate(candidates[0], path)
  }

  candidates(type: string) {
    return this.definitions.filter((d) => this.assignable(d, type))
  }

  /** Can this bean be injected where `type` is expected? Walks classes, interfaces and repository types. */
  assignable(definition: Definition, type: string): boolean {
    if (type === 'Object') return false
    if (definition.type === type) return true
    const start = definition.classInfo ?? this.interpreter.classes.get(definition.type)
    for (let k: ClassInfo | undefined = start; k; k = k.superclass) {
      if (k.name === type || k.interfaces.has(type) || k.decl.superclass === type) return true
    }
    for (let t: string | undefined = definition.type; t; t = this.library.superClasses[t]) if (t === type) return true
    if (definition.instance?.kind === 'function') return false
    return false
  }

  // --- For the UI -------------------------------------------------------------

  beans(): BeanInfo[] {
    return this.definitions.map((d) => ({
      name: d.name,
      type: d.type,
      kind: d.kind,
      dependencies: [...new Set(d.dependencies)],
      line: d.line,
    }))
  }

  definitionOf(name: string) {
    return this.definitions.find((d) => d.name === name)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function kindOf(stereotype: string): BeanKind {
  switch (stereotype) {
    case 'RestController':
    case 'Controller':
      return 'controller'
    case 'Service':
      return 'service'
    case 'Repository':
      return 'repository'
    case 'Configuration':
    case 'SpringBootApplication':
      return 'configuration'
    case 'RestControllerAdvice':
    case 'ControllerAdvice':
      return 'advice'
    default:
      return 'component'
  }
}

function orderOf(annotations: Annotation[] | undefined): number | undefined {
  const order = find(annotations, 'Order')
  const value = order?.values.value
  return typeof value === 'number' ? value : undefined
}

/** One constructor → that one. Several → the one with @Autowired, else the one without parameters. */
function chooseConstructor(classInfo: ClassInfo): MethodDecl | undefined {
  const constructors = classInfo.constructors
  if (constructors.length <= 1) return constructors[0]
  return constructors.find((c) => has(c.annotations, 'Autowired')) ?? constructors.find((c) => c.params.length === 0)
}

function where(definition: Definition) {
  return definition.factory ? `method '${definition.factory.method.name}' in ${definition.factory.owner.type}` : `file [${definition.type}.java]`
}

/** Text from properties/@Value into the parameter's type: "5" → int 5, "a,b" → List. */
export function convertProperty(raw: string, type: TypeRef, interpreter: Interpreter): Value {
  const name = type.name
  const fail = (): never =>
    interpreter.raise('IllegalArgumentException', `Failed to convert value of type 'java.lang.String' to required type '${name}'; For input string: "${raw}"`, 0)
  if (['int', 'Integer', 'long', 'Long', 'short', 'byte'].includes(name)) {
    if (!/^\s*-?\d+\s*$/.test(raw)) fail()
    return name === 'long' || name === 'Long' ? { kind: 'long', value: Number(raw) } : { kind: 'int', value: Number(raw) | 0 }
  }
  if (['double', 'Double', 'float', 'Float'].includes(name)) {
    if (Number.isNaN(Number(raw)) || raw.trim() === '') fail()
    return { kind: 'double', value: Number(raw) }
  }
  if (name === 'boolean' || name === 'Boolean') return { kind: 'boolean', value: raw.trim().toLowerCase() === 'true' }
  if (['List', 'Set', 'Collection'].includes(name) || type.dimensions > 0) {
    const parts = raw.split(',').map((p) => p.trim()).filter(Boolean)
    const element: TypeRef = type.dimensions > 0 ? { ...type, dimensions: 0 } : (type.args[0] ?? { name: 'String', dimensions: 0, args: [] })
    const values = parts.map((p) => convertProperty(p, element, interpreter))
    return type.dimensions > 0 ? { kind: 'array', type: element.name, values } : { kind: 'native', type: 'ArrayList', data: { list: values } }
  }
  return newString(raw)
}

function missingFailure(point: InjectionPoint, type: string, qualifier?: string) {
  const extra = qualifier ? `\n\nThe injection point has the following annotations:\n\t- @Qualifier("${qualifier}")` : ''
  return new StartupFailure(
    `${point.text} required a bean of type '${type}' that could not be found.${extra}`,
    `Consider defining a bean of type '${type}' in your configuration.`,
    {
      de: `Spring sucht eine Bean vom Typ ${type} und findet keine. Meist fehlt @Service, @Component oder @Repository an der Klasse, die ${type} ist bzw. implementiert - oder eine @Bean-Methode, die so etwas liefert.`,
      en: `Spring looks for a bean of type ${type} and finds none. Usually @Service, @Component or @Repository is missing on the class that is or implements ${type} - or a @Bean method that returns one.`,
    },
    point.line,
  )
}

function ambiguousFailure(point: InjectionPoint, type: string, candidates: Definition[]) {
  return new StartupFailure(
    `${point.text} required a single bean, but ${candidates.length} were found:\n${candidates.map((d) => `\t- ${d.name}: defined in ${where(d)}`).join('\n')}`,
    'Consider marking one of the beans as @Primary, updating the consumer to accept multiple beans, or using @Qualifier to identify the bean that should be consumed',
    {
      de: `Es gibt ${candidates.length} Beans vom Typ ${type} - Spring weiß nicht, welche gemeint ist. Lösungen: eine davon mit @Primary markieren, am Parameter @Qualifier("name") angeben oder List<${type}> verlangen, um alle zu bekommen.`,
      en: `There are ${candidates.length} beans of type ${type} - Spring does not know which one is meant. Fixes: mark one with @Primary, add @Qualifier("name") to the parameter, or ask for List<${type}> to get all of them.`,
    },
    point.line,
  )
}

function cycleFailure(cycle: Definition[]) {
  const unique = cycle.slice(0, -1)
  const lines = ['┌─────┐']
  unique.forEach((d, index) => {
    lines.push(`|  ${d.name} defined in ${where(d)}`)
    if (index < unique.length - 1) lines.push('↑     ↓')
  })
  lines.push('└─────┘')
  return new StartupFailure(
    `The dependencies of some of the beans in the application context form a cycle:\n\n${lines.join('\n')}`,
    'Relying upon circular references is discouraged and they are prohibited by default. Update your application to remove the dependency cycle between beans.',
    {
      de: `Die Beans brauchen sich gegenseitig (${unique.map((d) => d.name).join(' → ')} → ${unique[0].name}). Keine kann zuerst entstehen. Meist gehört gemeinsamer Code in eine dritte Klasse, die beide benutzen.`,
      en: `The beans need each other (${unique.map((d) => d.name).join(' → ')} → ${unique[0].name}). None of them can be created first. Usually shared code belongs in a third class that both use.`,
    },
    unique[0].line,
  )
}

export { JavaAbort as JavaAbbruch, JavaException as JavaAusnahme, NULL }
