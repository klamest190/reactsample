/**
 * SPRING PART · Spring MVC - from an HTTP request to a method call and back
 *
 *   GET /api/todos/7
 *     1. find the route:   @GetMapping("/{id}") in a class with @RequestMapping("/api/todos")
 *     2. bind arguments:   @PathVariable Long id = 7   (text "7" → Long)
 *                          @RequestParam, @RequestBody (JSON → object, then @Valid)
 *     3. call the method
 *     4. write the answer: ResponseEntity → status + body, objects → JSON, String → text
 *
 * Errors follow Spring's rules: an @ExceptionHandler (in the controller or an
 * @RestControllerAdvice) wins; otherwise ResponseStatusException and
 * @ResponseStatus decide the status; everything else becomes 500.
 */

import type { Annotation, MethodDecl, ParamDecl, TypeRef } from '../java/ast'
import { JavaAbort, JavaException } from '../java/interpreter'
import { NULL, newString, type JavaObject, type ClassInfo, type NativeValue, type Value } from '../java/values'
import { MAPPINGS, constantName, find, has, text, texts } from './annotations'
import type { SpringApp } from './context'
import { reason, type HttpMethod, type HttpRequest, type HttpResponse } from './http'
import { JsonError, fromJson, parseJson, toJson, typeText, type Json } from './json'
import { frameworkException, reasonPhrase, statusFromName } from './library'
import { validate, validationMessage } from './validation'

export type RouteInfo = { method: HttpMethod | '*'; path: string; handler: string; line: number }

type Route = {
  method: HttpMethod | '*'
  path: string
  segments: string[]
  bean: string
  classInfo: ClassInfo
  handler: MethodDecl
}

type Handler = { bean: string; classInfo: ClassInfo; method: MethodDecl; types: string[] }

const SIMPLE_TYPES = new Set([
  'String', 'int', 'Integer', 'long', 'Long', 'double', 'Double', 'boolean', 'Boolean', 'short', 'Short', 'float', 'Float', 'char', 'Character',
])

export class Web {
  readonly routes: Route[] = []
  private readonly handlers: Handler[] = []

  private readonly app: SpringApp

  constructor(app: SpringApp) {
    this.app = app
  }

  /** Collects all mappings - called while the context starts (ambiguous mappings stop the start). */
  build() {
    for (const definition of this.app.definitions) {
      const classInfo = definition.classInfo
      if (!classInfo || definition.factory) continue
      const isController = has(classInfo.decl.annotations, 'RestController', 'Controller')
      const isAdvice = has(classInfo.decl.annotations, 'RestControllerAdvice', 'ControllerAdvice')
      if (!isController && !isAdvice) continue

      for (const overloads of classInfo.methods.values()) {
        for (const method of overloads) {
          const exceptionHandler = find(method.annotations, 'ExceptionHandler')
          if (exceptionHandler) {
            const types = texts(exceptionHandler)
            this.handlers.push({
              bean: definition.name,
              classInfo,
              method,
              // Without a value, the parameter types say which exceptions are meant.
              types: types.length ? types.map(constantName) : method.params.map((p) => p.type.name).filter((t) => /Exception$|Error$|Throwable$/.test(t)),
            })
          }
          if (!isController) continue
          this.addRoutes(definition.name, classInfo, method)
        }
      }
    }
  }

  private addRoutes(bean: string, classInfo: ClassInfo, method: MethodDecl) {
    const mapping = method.annotations?.find((a) => a.name in MAPPINGS)
    if (!mapping) return
    const prefixes = texts(find(classInfo.decl.annotations, 'RequestMapping'), 'value', 'path')
    const paths = texts(mapping, 'value', 'path')
    const verbs: (HttpMethod | '*')[] = MAPPINGS[mapping.name]
      ? [MAPPINGS[mapping.name] as HttpMethod]
      : texts(mapping, 'method').map((m) => constantName(m) as HttpMethod)
    const contextPath = (this.app.config.get('server.servlet.context-path') ?? '').replace(/\/$/, '')

    for (const prefix of prefixes.length ? prefixes : ['']) {
      for (const path of paths.length ? paths : ['']) {
        const full = normalize(contextPath + '/' + prefix + '/' + path)
        for (const verb of verbs.length ? verbs : ['*' as const]) {
          const existing = this.routes.find((r) => r.path === full && (r.method === verb || r.method === '*' || verb === '*'))
          if (existing) throw ambiguous(bean, classInfo, method, verb, full, existing)
          this.routes.push({ method: verb, path: full, segments: split(full), bean, classInfo, handler: method })
        }
      }
    }
  }

  routeInfos(): RouteInfo[] {
    return this.routes.map((r) => ({
      method: r.method,
      path: r.path,
      handler: `${r.classInfo.name}.${r.handler.name}(${r.handler.params.map((p) => p.type.name).join(', ')})`,
      line: r.handler.line,
    }))
  }

  // --- Handling one request -----------------------------------------------------

  handle(request: HttpRequest): HttpResponse {
    const begin = performance.now()
    const app = this.app
    app.interpreter.resetStepLimit()
    const [rawPath, query = ''] = request.path.split('?')
    const path = normalize(decodeURIComponent(rawPath))
    const finish = (response: Omit<HttpResponse, 'millis'>): HttpResponse => {
      app.interpreter.finish()
      app.flushOutput()
      return { ...response, millis: Math.max(1, Math.round(performance.now() - begin)) }
    }

    const segments = split(path)
    const matching = this.routes
      .map((route) => ({ route, variables: match(route.segments, segments) }))
      .filter((m): m is { route: Route; variables: Record<string, string> } => m.variables !== null)
      // Literal segments beat {variables}: /api/todos/open wins against /api/todos/{id}
      .sort((a, b) => Object.keys(a.variables).length - Object.keys(b.variables).length)

    if (!matching.length) {
      app.log('WARN', 'PageNotFound', `No endpoint ${request.method} ${path}.`)
      app.log('WARN', 'DefaultHandlerExceptionResolver', `Resolved [org.springframework.web.servlet.resource.NoResourceFoundException: No static resource ${path.slice(1)}.]`)
      return finish(this.errorResponse(404, path, `No static resource ${path.slice(1)}.`))
    }
    const found = matching.find((m) => m.route.method === request.method || m.route.method === '*')
    if (!found) {
      const allowed = [...new Set(matching.map((m) => m.route.method))].join(', ')
      app.log('WARN', 'DefaultHandlerExceptionResolver', `Resolved [org.springframework.web.HttpRequestMethodNotSupportedException: Request method '${request.method}' is not supported]`)
      return finish({ ...this.errorResponse(405, path, `Request method '${request.method}' is not supported`), headers: { Allow: allowed } })
    }

    const { route, variables } = found
    const controller = app.definitionOf(route.bean)!
    const self = app.instantiate(controller, []) as JavaObject
    let args: Value[]
    try {
      args = route.handler.params.map((p) => this.bind(p, request, variables, new URLSearchParams(query)))
    } catch (error) {
      if (error instanceof BindError) return finish(this.onException(error.exception, path, route, self))
      throw error
    }

    try {
      const result = app.interpreter.invoke(route.classInfo, route.handler, self, args)
      return finish(this.write(result, route.handler, path))
    } catch (error) {
      if (error instanceof JavaException) return finish(this.onException(error.value, path, route, self, error.line))
      if (error instanceof JavaAbort) {
        const message = app.language === 'de' ? error.de : error.en
        app.log('ERROR', 'dispatcherServlet', `Servlet.service() threw exception: ${message}${error.line ? ` (Main.java:${error.line})` : ''}`)
        return finish(this.errorResponse(500, path, message))
      }
      if (error instanceof RangeError) {
        app.log('ERROR', 'dispatcherServlet', 'Servlet.service() threw exception [java.lang.StackOverflowError]')
        return finish(this.errorResponse(500, path, 'StackOverflowError'))
      }
      throw error
    }
  }

  /** Turns a request part into the value of one method parameter. */
  private bind(parameter: ParamDecl, request: HttpRequest, variables: Record<string, string>, query: URLSearchParams): Value {
    const i = this.app.interpreter
    const a = parameter.annotations
    const type = parameter.type

    const pathVariable = find(a, 'PathVariable')
    if (pathVariable) {
      const name = text(pathVariable, 'value', 'name') ?? parameter.name
      return this.convert(variables[name] ?? '', type, name)
    }

    const requestParam = find(a, 'RequestParam')
    if (requestParam || (!has(a, 'RequestBody', 'RequestHeader') && SIMPLE_TYPES.has(type.name) && type.dimensions === 0)) {
      const name = text(requestParam, 'value', 'name') ?? parameter.name
      const fallback = text(requestParam, 'defaultValue')
      const required = requestParam ? (requestParam.values.required ?? true) !== false && fallback === undefined : false
      const values = query.getAll(name)
      if (!values.length) {
        if (fallback !== undefined) return this.convert(fallback, type, name)
        if (required && type.name !== 'Optional') {
          throw new BindError(
            frameworkException('MissingServletRequestParameterException', `Required request parameter '${name}' for method parameter type ${type.name} is not present`),
          )
        }
        return i.defaultValue(type)
      }
      if (['List', 'Set', 'Collection'].includes(type.name)) {
        const element = type.args[0] ?? { name: 'String', dimensions: 0, args: [] }
        const parts = values.flatMap((v) => v.split(','))
        return { kind: 'native', type: 'ArrayList', data: { list: parts.map((p) => this.convert(p, element, name)) } }
      }
      return this.convert(values[0], type, name)
    }

    const header = find(a, 'RequestHeader')
    if (header) {
      const name = text(header, 'value', 'name') ?? parameter.name
      const value = Object.entries(request.headers ?? {}).find(([k]) => k.toLowerCase() === name.toLowerCase())?.[1]
      if (value === undefined) {
        const fallback = text(header, 'defaultValue')
        if (fallback !== undefined) return this.convert(fallback, type, name)
        if (header.values.required === false) return NULL
        throw new BindError(frameworkException('MissingRequestHeaderException', `Required request header '${name}' for method parameter type ${type.name} is not present`))
      }
      return this.convert(value, type, name)
    }

    if (has(a, 'RequestBody')) {
      const body = request.body?.trim()
      if (!body) {
        throw new BindError(frameworkException('HttpMessageNotReadableException', 'Required request body is missing'))
      }
      let value: Value
      try {
        value = fromJson(parseJson(body), type, i)
      } catch (error) {
        if (error instanceof JsonError) throw new BindError(frameworkException('HttpMessageNotReadableException', error.message))
        if (error instanceof JavaException) throw error
        throw error
      }
      if (has(a, 'Valid', 'Validated')) {
        const errors = validate(value, i)
        if (errors.length) {
          throw new BindError(frameworkException('MethodArgumentNotValidException', validationMessage(errors, i), errors))
        }
      }
      return value
    }
    return NULL
  }

  private convert(raw: string, type: TypeRef, name: string): Value {
    const i = this.app.interpreter
    const mismatch = (): never => {
      throw new BindError(
        frameworkException(
          'MethodArgumentTypeMismatchException',
          `Method parameter '${name}': Failed to convert value of type 'java.lang.String' to required type '${qualified(type)}'; For input string: "${raw}"`,
        ),
      )
    }
    switch (type.name) {
      case 'int':
      case 'Integer':
      case 'short':
      case 'Short':
      case 'long':
      case 'Long':
        if (!/^-?\d+$/.test(raw.trim())) mismatch()
        return type.name.toLowerCase().startsWith('long') ? { kind: 'long', value: Number(raw) } : { kind: 'int', value: Number(raw) | 0 }
      case 'double':
      case 'Double':
      case 'float':
      case 'Float':
        if (raw.trim() === '' || Number.isNaN(Number(raw))) mismatch()
        return { kind: 'double', value: Number(raw) }
      case 'boolean':
      case 'Boolean': {
        const lower = raw.trim().toLowerCase()
        if (!['true', 'false', 'on', 'off', 'yes', 'no', '1', '0'].includes(lower)) mismatch()
        return { kind: 'boolean', value: ['true', 'on', 'yes', '1'].includes(lower) }
      }
      case 'String':
        return newString(raw)
    }
    const classInfo = i.classes.get(type.name)
    if (classInfo?.isEnum) {
      const constant = classInfo.isStatic.get(raw)
      if (!constant || !classInfo.decl.constants.some((k) => k.name === raw)) mismatch()
      return constant!
    }
    return newString(raw)
  }

  // --- Writing the answer ---------------------------------------------------------

  private write(result: Value, method: MethodDecl, path: string): Omit<HttpResponse, 'millis'> {
    const i = this.app.interpreter
    const status = statusFromName(text(find(method.annotations, 'ResponseStatus'), 'value', 'code')) ?? 200

    if (result.kind === 'native' && result.type === 'ResponseEntity') {
      const code = result.data.number ?? 200
      const headers: Record<string, string> = {}
      for (const entry of result.data.map?.values() ?? []) headers[i.toText(entry.key)] = i.toText(entry.value)
      const body = result.data.list?.[0]
      if (!body || body.kind === 'null') return { status: code, headers, body: { kind: 'empty' } }
      const written = this.body(body, path)
      return written.status === 500 ? written : { ...written, status: code, headers: { ...headers, ...written.headers } }
    }
    if (result.kind === 'native' && result.type === 'ProblemDetail') {
      const code = result.data.number ?? 500
      const map = result.data.map!
      if (!map.has('s:instance')) map.set('s:instance', { key: newString('instance'), value: newString(path) })
      return { status: code, headers: { 'Content-Type': 'application/problem+json' }, body: { kind: 'json', value: toJson(result, i) } }
    }
    if (method.returnType.name === 'void' || result.kind === 'null') {
      return { status, headers: {}, body: { kind: 'empty' } }
    }
    const response = this.body(result, path)
    return { ...response, status: response.status === 500 ? 500 : status }
  }

  private body(value: Value, path: string): Omit<HttpResponse, 'millis'> {
    const i = this.app.interpreter
    if (value.kind === 'string') return { status: 200, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: { kind: 'text', text: value.value } }
    try {
      return { status: 200, headers: { 'Content-Type': 'application/json' }, body: { kind: 'json', value: toJson(value, i) } }
    } catch (error) {
      if (!(error instanceof JsonError)) throw error
      this.app.log('WARN', 'DefaultHandlerExceptionResolver', `Resolved [org.springframework.http.converter.HttpMessageNotWritableException: ${error.message}]`)
      return this.errorResponse(500, path, error.message)
    }
  }

  // --- Errors ---------------------------------------------------------------------

  private onException(exception: Value, path: string, route: Route, controller: JavaObject, line?: number): Omit<HttpResponse, 'millis'> {
    const app = this.app
    const i = app.interpreter

    // 1. @ExceptionHandler: first the controller's own, then the advices - the most specific type wins.
    const own = this.handlers.filter((h) => h.classInfo === route.classInfo)
    const advices = this.handlers.filter((h) => h.classInfo !== route.classInfo && has(h.classInfo.decl.annotations, 'RestControllerAdvice', 'ControllerAdvice'))
    for (const group of [own, advices]) {
      const handler = this.bestHandler(group, exception)
      if (!handler) continue
      const self = handler.classInfo === route.classInfo ? controller : (app.instantiate(app.definitionOf(handler.bean)!, []) as JavaObject)
      const args = handler.method.params.map((p) => (i.isInstance(exception, p.type.name) || p.type.name === 'Exception' ? exception : NULL))
      try {
        const result = i.invoke(handler.classInfo, handler.method, self, args)
        return this.write(result, handler.method, path)
      } catch (error) {
        if (error instanceof JavaException) {
          app.log('ERROR', 'ExceptionHandlerExceptionResolver', `Failure in @ExceptionHandler ${handler.classInfo.name}#${handler.method.name}: ${i.exceptionText(error.value)}`)
          return this.errorResponse(500, path, i.exceptionText(error.value))
        }
        throw error
      }
    }

    // 2. What Spring knows by itself
    if (exception.kind === 'native') {
      const message = exception.data.message ?? ''
      switch (exception.type) {
        case 'ResponseStatusException': {
          const code = exception.data.number ?? 500
          app.log('WARN', 'ExceptionHandlerExceptionResolver', `Resolved [org.springframework.web.server.ResponseStatusException: ${message}]`)
          return this.errorResponse(code, path, exception.data.text ?? '')
        }
        case 'MethodArgumentNotValidException':
        case 'MethodArgumentTypeMismatchException':
        case 'MissingServletRequestParameterException':
        case 'MissingRequestHeaderException':
        case 'HttpMessageNotReadableException':
          app.log('WARN', 'DefaultHandlerExceptionResolver', `Resolved [${exception.type}: ${message}]`)
          return this.errorResponse(400, path, message)
      }
    }
    // @ResponseStatus on your own exception class
    if (exception.kind === 'object') {
      for (let k: ClassInfo | undefined = exception.classInfo; k; k = k.superclass) {
        const annotation = find(k.decl.annotations, 'ResponseStatus')
        const code = statusFromName(text(annotation, 'value', 'code'))
        if (code) {
          const reasonText = text(annotation, 'reason')
          app.log('WARN', 'ResponseStatusExceptionResolver', `Resolved [${i.exceptionText(exception)}]`)
          return this.errorResponse(code, path, reasonText ?? messageOf(exception, i))
        }
      }
    }

    // 3. Everything else: 500 and a stack trace in the log
    app.log(
      'ERROR',
      'dispatcherServlet',
      `Servlet.service() for servlet [dispatcherServlet] threw exception [Request processing failed: ${i.exceptionText(exception)}] with root cause`,
    )
    app.print(`${i.exceptionText(exception)}${line ? `\n    at Main.java:${line}` : ''}`, 'error')
    return this.errorResponse(500, path, messageOf(exception, i))
  }

  private bestHandler(handlers: Handler[], exception: Value): Handler | null {
    let best: Handler | null = null
    let bestDistance = Infinity
    for (const handler of handlers) {
      for (const type of handler.types) {
        const distance = this.distance(exception, type)
        if (distance < bestDistance) {
          best = handler
          bestDistance = distance
        }
      }
    }
    return best
  }

  /** How many steps up the class hierarchy until `type` - Spring prefers the closest handler. */
  private distance(exception: Value, type: string): number {
    const i = this.app.interpreter
    if (!i.isInstance(exception, type)) return Infinity
    let name = exception.kind === 'object' ? exception.classInfo.name : exception.kind === 'native' ? exception.type : ''
    for (let steps = 0; steps < 20; steps++) {
      if (name === type) return steps
      const classInfo = i.classes.get(name)
      const parent = classInfo ? classInfo.decl.superclass : (this.app.library.superClasses[name] ?? PARENTS[name])
      if (!parent) return 10 + steps
      name = parent
    }
    return 50
  }

  /** Spring Boot's standard error body. The message only appears with server.error.include-message=always. */
  private errorResponse(status: number, path: string, message: string): Omit<HttpResponse, 'millis'> {
    const body: Record<string, Json> = {
      timestamp: new Date().toISOString().replace('Z', '+00:00'),
      status,
      error: reasonPhrase(status) || reason(status),
      path,
    }
    if (this.app.config.get('server.error.include-message') === 'always') body.message = message
    return { status, headers: { 'Content-Type': 'application/json' }, body: { kind: 'json', value: body } }
  }
}

/** Parents of the standard exceptions (the Java runtime knows them, but does not export the table). */
const PARENTS: Record<string, string> = {
  IllegalArgumentException: 'RuntimeException',
  IllegalStateException: 'RuntimeException',
  NullPointerException: 'RuntimeException',
  ArithmeticException: 'RuntimeException',
  NumberFormatException: 'IllegalArgumentException',
  IndexOutOfBoundsException: 'RuntimeException',
  UnsupportedOperationException: 'RuntimeException',
  NoSuchElementException: 'RuntimeException',
  RuntimeException: 'Exception',
  Exception: 'Throwable',
}

class BindError extends Error {
  readonly exception: NativeValue

  constructor(exception: NativeValue) {
    super(exception.data.message)
    this.exception = exception
  }
}

function messageOf(exception: Value, i: SpringApp['interpreter']): string {
  const message = i.callMethod(exception, 'getMessage', [], 0)
  return message.kind === 'null' ? '' : i.toText(message)
}

function ambiguous(bean: string, classInfo: ClassInfo, method: MethodDecl, verb: string, path: string, existing: Route) {
  return new MappingError(
    `Ambiguous mapping. Cannot map '${bean}' method ${classInfo.name}#${method.name}() to {${verb} [${path}]}: There is already '${existing.bean}' bean method ${existing.classInfo.name}#${existing.handler.name}() mapped.`,
    method.line,
  )
}

export class MappingError extends Error {
  readonly line: number

  constructor(message: string, line: number) {
    super(message)
    this.line = line
  }
}

const normalize = (path: string) => '/' + path.split('/').filter(Boolean).join('/')
const split = (path: string) => path.split('/').filter(Boolean)

function match(pattern: string[], actual: string[]): Record<string, string> | null {
  if (pattern.length !== actual.length) return null
  const variables: Record<string, string> = {}
  for (let k = 0; k < pattern.length; k++) {
    const variable = pattern[k].match(/^\{(\w+)(?::.*)?\}$/)
    if (variable) variables[variable[1]] = actual[k]
    else if (pattern[k] !== actual[k]) return null
  }
  return variables
}

const qualified = (type: TypeRef) => {
  const name = typeText(type)
  return ['String', 'Long', 'Integer', 'Double', 'Boolean'].includes(name) ? 'java.lang.' + name : name
}

export type { Annotation }
