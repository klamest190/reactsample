/**
 * SPRING PART · The classes Spring brings along
 *
 * Plugged into the Java runtime as an extension (see src/java/extension.ts):
 * `ResponseEntity`, `HttpStatus`, `ResponseStatusException`, `ProblemDetail`,
 * `SpringApplication.run(…)`, the application context - and `AtomicLong`,
 * which many Spring examples use to count ids.
 *
 * Everything that needs the running application (beans, repositories,
 * properties) is asked from the `LibraryHost` - that is context.ts.
 */

import type { Extension } from '../java/extension'
import { NULL, newString, bool, number, type NativeValue, type Value } from '../java/values'

export interface LibraryHost {
  /** `SpringApplication.run(App.class, args)` - starts the context and returns it. */
  run(mainClass: string | undefined, line: number): Value
  getBean(query: Value, line: number): Value
  beanNames(): string[]
  property(key: string): string | undefined
  activeProfiles(): string[]
  /** A Spring Data repository method - `undefined` if `target` is no repository. */
  repositoryCall(target: NativeValue, name: string, args: Value[], line: number): Value | undefined
}

// ---------------------------------------------------------------------------
// HttpStatus
// ---------------------------------------------------------------------------

export const STATUS_NAMES: Record<number, string> = {
  200: 'OK',
  201: 'CREATED',
  202: 'ACCEPTED',
  204: 'NO_CONTENT',
  301: 'MOVED_PERMANENTLY',
  302: 'FOUND',
  304: 'NOT_MODIFIED',
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
  409: 'CONFLICT',
  410: 'GONE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
  501: 'NOT_IMPLEMENTED',
  503: 'SERVICE_UNAVAILABLE',
}
const STATUS_CODES: Record<string, number> = Object.fromEntries(Object.entries(STATUS_NAMES).map(([code, name]) => [name, Number(code)]))
// Newer name of 422 (Spring 6.x)
STATUS_CODES.UNPROCESSABLE_CONTENT = 422

const REASON_PHRASES: Record<number, string> = {
  200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content', 301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 409: 'Conflict',
  410: 'Gone', 415: 'Unsupported Media Type', 422: 'Unprocessable Entity', 429: 'Too Many Requests',
  500: 'Internal Server Error', 501: 'Not Implemented', 503: 'Service Unavailable',
}
export const reasonPhrase = (code: number) => REASON_PHRASES[code] ?? ''

// `HttpStatus.NOT_FOUND == HttpStatus.NOT_FOUND` must be true - one object per constant, like an enum.
const statusObjects = new Map<number, NativeValue>()
export function httpStatus(code: number): NativeValue {
  let status = statusObjects.get(code)
  if (!status) {
    status = { kind: 'native', type: 'HttpStatus', data: { number: code, text: STATUS_NAMES[code] ?? String(code) } }
    statusObjects.set(code, status)
  }
  return status
}

/** A status from Java: `HttpStatus.CREATED`, `201` or a `HttpStatusCode`. */
export function statusCode(value: Value | undefined): number | null {
  if (!value) return null
  if (value.kind === 'int' || value.kind === 'long') return value.value
  if (value.kind === 'native' && value.type === 'HttpStatus') return value.data.number ?? null
  return null
}

/** A status from an annotation: `HttpStatus.NOT_FOUND` or `NOT_FOUND`. */
export function statusFromName(name: string | undefined): number | null {
  if (!name) return null
  const constant = name.slice(name.lastIndexOf('.') + 1)
  return STATUS_CODES[constant] ?? (/^\d{3}$/.test(constant) ? Number(constant) : null)
}

// ---------------------------------------------------------------------------
// Building values
// ---------------------------------------------------------------------------

type Headers = Map<string, { key: Value; value: Value }>

export function responseEntity(status: number, body: Value | null, headers: Headers = new Map()): NativeValue {
  return { kind: 'native', type: 'ResponseEntity', data: { number: status, list: body ? [body] : [], map: headers } }
}

function builder(status: number, withBody = true, headers: Headers = new Map()): NativeValue {
  return { kind: 'native', type: withBody ? 'ResponseEntity.BodyBuilder' : 'ResponseEntity.HeadersBuilder', data: { number: status, map: headers } }
}

function header(headers: Headers, name: string, value: string): Headers {
  const copy = new Map(headers)
  const key = newString(name)
  copy.set('s:' + name, { key, value: newString(value) })
  return copy
}

export function responseStatusException(status: number, reason?: string): NativeValue {
  const name = STATUS_NAMES[status] ?? String(status)
  return {
    kind: 'native',
    type: 'ResponseStatusException',
    data: { number: status, text: reason, message: `${status} ${name}${reason ? ` "${reason}"` : ''}` },
  }
}

/** Exceptions raised by Spring itself while binding a request - catchable with @ExceptionHandler. */
export function frameworkException(type: string, message: string, fieldErrors?: FieldErrorInfo[]): NativeValue {
  return {
    kind: 'native',
    type,
    data: {
      message,
      list: fieldErrors?.map((e) => ({
        kind: 'native' as const,
        type: 'FieldError',
        data: { text: e.field, message: e.message, list: [e.rejected] },
      })),
    },
  }
}

export type FieldErrorInfo = { objectName: string; field: string; rejected: Value; message: string }

function problemDetail(status: number, detail: Value | null): NativeValue {
  const map: Headers = new Map()
  const put = (key: string, value: Value) => map.set('s:' + key, { key: newString(key), value })
  put('type', newString('about:blank'))
  put('title', newString(reasonPhrase(status)))
  put('status', number(status))
  if (detail && detail.kind !== 'null') put('detail', detail)
  return { kind: 'native', type: 'ProblemDetail', data: { number: status, map } }
}

// ---------------------------------------------------------------------------
// The extension
// ---------------------------------------------------------------------------

const CLASSES = [
  'SpringApplication', 'ApplicationContext', 'ConfigurableApplicationContext', 'Environment',
  'ResponseEntity', 'HttpStatus', 'HttpStatusCode', 'ResponseStatusException', 'ProblemDetail', 'URI',
  'CommandLineRunner', 'ApplicationRunner', 'RequestMethod', 'MediaType',
  'MethodArgumentNotValidException', 'BindingResult', 'FieldError', 'MethodArgumentTypeMismatchException',
  'MissingServletRequestParameterException', 'HttpMessageNotReadableException', 'EntityNotFoundException',
  'JpaRepository', 'CrudRepository', 'ListCrudRepository', 'PagingAndSortingRepository', 'Repository',
  'AtomicLong', 'AtomicInteger',
]

const SUPER_CLASSES: Record<string, string> = {
  ResponseStatusException: 'ErrorResponseException',
  ErrorResponseException: 'NestedRuntimeException',
  NestedRuntimeException: 'RuntimeException',
  MethodArgumentNotValidException: 'BindException',
  BindException: 'Exception',
  MethodArgumentTypeMismatchException: 'TypeMismatchException',
  TypeMismatchException: 'RuntimeException',
  MissingServletRequestParameterException: 'ServletException',
  ServletException: 'Exception',
  HttpMessageNotReadableException: 'HttpMessageConversionException',
  HttpMessageConversionException: 'RuntimeException',
  EntityNotFoundException: 'PersistenceException',
  PersistenceException: 'RuntimeException',
  JpaRepository: 'ListCrudRepository',
  ListCrudRepository: 'CrudRepository',
  PagingAndSortingRepository: 'Repository',
  CrudRepository: 'Repository',
  ConfigurableApplicationContext: 'ApplicationContext',
}

const PACKAGES: Record<string, string> = {
  ResponseStatusException: 'org.springframework.web.server',
  MethodArgumentNotValidException: 'org.springframework.web.bind',
  MethodArgumentTypeMismatchException: 'org.springframework.web.method.annotation',
  MissingServletRequestParameterException: 'org.springframework.web.bind',
  HttpMessageNotReadableException: 'org.springframework.http.converter',
  EntityNotFoundException: 'jakarta.persistence',
}

export function springLibrary(host: LibraryHost): Extension & { superClasses: Record<string, string> } {
  return {
    classes: new Set(CLASSES),
    // Filled further at startup: every repository interface → JpaRepository.
    superClasses: { ...SUPER_CLASSES },
    packageOf: (type) => PACKAGES[type],

    staticField(className, name) {
      if (className === 'HttpStatus') {
        const code = STATUS_CODES[name]
        return code ? httpStatus(code) : undefined
      }
      return undefined
    },

    staticCall(className, name, args, i, line) {
      const [a, b] = args
      switch (className) {
        case 'SpringApplication':
          if (name === 'run') return host.run(a?.kind === 'native' ? a.data.text : undefined, line)
          return undefined
        case 'HttpStatus':
        case 'HttpStatusCode':
          if (name === 'valueOf' || name === 'resolve') {
            const code = statusCode(a)
            if (code && STATUS_NAMES[code]) return httpStatus(code)
            if (name === 'resolve') return NULL
            return i.raise('IllegalArgumentException', `No matching constant for [${code}]`, line)
          }
          return undefined
        case 'URI':
          if (name === 'create') return { kind: 'native', type: 'URI', data: { text: i.toText(a) } }
          return undefined
        case 'ProblemDetail':
          if (name === 'forStatus') return problemDetail(statusCode(a) ?? 500, null)
          if (name === 'forStatusAndDetail') return problemDetail(statusCode(a) ?? 500, b ?? null)
          return undefined
        case 'ResponseEntity':
          switch (name) {
            case 'ok':
              return a ? responseEntity(200, a) : builder(200)
            case 'status':
              return builder(statusCode(a) ?? 200)
            case 'created':
              return builder(201, true, a ? header(new Map(), 'Location', i.toText(a)) : new Map())
            case 'accepted':
              return builder(202)
            case 'noContent':
              return builder(204, false)
            case 'badRequest':
              return builder(400)
            case 'notFound':
              return builder(404, false)
            case 'unprocessableEntity':
            case 'unprocessableContent':
              return builder(422)
            case 'internalServerError':
              return builder(500)
            case 'of':
            case 'ofNullable': {
              const inner = name === 'of' && a?.kind === 'native' && a.type === 'Optional' ? (a.data.list?.[0] ?? null) : a && a.kind !== 'null' ? a : null
              return inner ? responseEntity(200, inner) : responseEntity(404, null)
            }
          }
          return undefined
      }
      return undefined
    },

    create(className, args, i) {
      const [a, b] = args
      switch (className) {
        case 'ResponseStatusException':
          return responseStatusException(statusCode(a) ?? 500, b && b.kind !== 'null' ? i.toText(b) : undefined)
        case 'ResponseEntity': {
          // new ResponseEntity<>(body, HttpStatus.OK) or new ResponseEntity<>(HttpStatus.NO_CONTENT)
          if (args.length === 1) return responseEntity(statusCode(a) ?? 200, null)
          return responseEntity(statusCode(b) ?? 200, a && a.kind !== 'null' ? a : null)
        }
        case 'AtomicLong':
        case 'AtomicInteger':
          return { kind: 'native', type: className, data: { number: a && (a.kind === 'int' || a.kind === 'long') ? a.value : 0 } }
      }
      return undefined
    },

    method(target, name, args, i, line) {
      const data = target.data
      const [a, b] = args
      const repository = host.repositoryCall(target, name, args, line)
      if (repository) return repository

      switch (target.type) {
        case 'HttpStatus': {
          const code = data.number ?? 0
          switch (name) {
            case 'value':
              return number(code)
            case 'getReasonPhrase':
              return newString(reasonPhrase(code))
            case 'name':
              return newString(data.text ?? '')
            case 'is2xxSuccessful':
              return bool(code >= 200 && code < 300)
            case 'is4xxClientError':
              return bool(code >= 400 && code < 500)
            case 'is5xxServerError':
              return bool(code >= 500)
            case 'isError':
              return bool(code >= 400)
            case 'equals':
              return bool(a === target)
          }
          return undefined
        }
        case 'ResponseEntity.BodyBuilder':
        case 'ResponseEntity.HeadersBuilder':
          if (name === 'body' && target.type === 'ResponseEntity.BodyBuilder') return responseEntity(data.number ?? 200, a && a.kind !== 'null' ? a : null, data.map)
          if (name === 'build') return responseEntity(data.number ?? 200, null, data.map)
          if (name === 'header') return { ...target, data: { ...data, map: header(data.map ?? new Map(), i.toText(a), i.toText(b)) } }
          if (name === 'location') return { ...target, data: { ...data, map: header(data.map ?? new Map(), 'Location', i.toText(a)) } }
          return undefined
        case 'ResponseEntity':
          switch (name) {
            case 'getStatusCode':
              return httpStatus(data.number ?? 200)
            case 'getStatusCodeValue':
              return number(data.number ?? 200)
            case 'getBody':
              return data.list?.[0] ?? NULL
            case 'hasBody':
              return bool(Boolean(data.list?.length))
            case 'getHeaders':
              return { kind: 'native', type: 'LinkedHashMap', data: { map: new Map(data.map) } }
          }
          return undefined
        case 'ResponseStatusException':
          if (name === 'getStatusCode') return httpStatus(data.number ?? 500)
          if (name === 'getReason') return data.text !== undefined ? newString(data.text) : NULL
          return undefined
        case 'ProblemDetail': {
          const map = data.map!
          const read = (key: string) => map.get('s:' + key)?.value ?? NULL
          const write = (key: string, value: Value) => {
            map.set('s:' + key, { key: newString(key), value })
            return NULL
          }
          switch (name) {
            case 'getStatus':
              return number(data.number ?? 500)
            case 'getTitle':
            case 'getDetail':
            case 'getType':
            case 'getInstance':
              return read(name.slice(3).toLowerCase())
            case 'setTitle':
            case 'setDetail':
            case 'setType':
            case 'setInstance':
              return write(name.slice(3).toLowerCase(), a.kind === 'native' ? newString(i.toText(a)) : a)
            case 'setProperty':
              return write(i.toText(a), b)
          }
          return undefined
        }
        case 'MethodArgumentNotValidException':
        case 'BindingResult':
          if (name === 'getBindingResult') return { kind: 'native', type: 'BindingResult', data: { list: data.list ?? [] } }
          if (name === 'getFieldErrors' || name === 'getAllErrors') return { kind: 'native', type: 'ArrayList', data: { list: [...(data.list ?? [])] } }
          if (name === 'getErrorCount') return number(data.list?.length ?? 0)
          if (name === 'hasErrors') return bool(Boolean(data.list?.length))
          if (name === 'getFieldError') return data.list?.[0] ?? NULL
          return undefined
        case 'FieldError':
          if (name === 'getField') return newString(data.text ?? '')
          if (name === 'getDefaultMessage') return newString(data.message ?? '')
          if (name === 'getRejectedValue') return data.list?.[0] ?? NULL
          return undefined
        case 'AtomicLong':
        case 'AtomicInteger': {
          const make = (n: number): Value => (target.type === 'AtomicLong' ? { kind: 'long', value: n } : number(n))
          const now = data.number ?? 0
          const set = (n: number) => {
            data.number = n
            return n
          }
          switch (name) {
            case 'incrementAndGet':
              return make(set(now + 1))
            case 'getAndIncrement':
              set(now + 1)
              return make(now)
            case 'decrementAndGet':
              return make(set(now - 1))
            case 'addAndGet':
              return make(set(now + (a && 'value' in a ? Number(a.value) : 0)))
            case 'get':
            case 'longValue':
            case 'intValue':
              return make(now)
            case 'set':
              set(a && 'value' in a ? Number(a.value) : 0)
              return NULL
          }
          return undefined
        }
        case 'ApplicationContext':
          switch (name) {
            case 'getBean':
              return host.getBean(a, line)
            case 'getBeanDefinitionNames':
              return { kind: 'array', type: 'String', values: host.beanNames().map((n) => newString(n)) }
            case 'getBeanDefinitionCount':
              return number(host.beanNames().length)
            case 'containsBean':
              return bool(host.beanNames().includes(i.toText(a)))
            case 'getEnvironment':
              return { kind: 'native', type: 'Environment', data: {} }
          }
          return undefined
        case 'Environment':
          if (name === 'getProperty') {
            const value = host.property(i.toText(a))
            return value !== undefined ? newString(value) : (b ?? NULL)
          }
          if (name === 'getActiveProfiles') return { kind: 'array', type: 'String', values: host.activeProfiles().map((p) => newString(p)) }
          return undefined
      }
      return undefined
    },

    text(value, i) {
      const data = value.data
      switch (value.type) {
        case 'HttpStatus':
          return `${data.number} ${data.text}`
        case 'URI':
          return data.text ?? ''
        case 'ResponseEntity':
          return `<${data.number} ${STATUS_NAMES[data.number ?? 200] ?? ''} ${reasonPhrase(data.number ?? 200)},${data.list?.length ? i.toText(data.list[0]) + ',' : ''}[]>`
        case 'ResponseStatusException':
          return `org.springframework.web.server.ResponseStatusException: ${data.message}`
        case 'AtomicLong':
        case 'AtomicInteger':
          return String(data.number ?? 0)
        case 'ApplicationContext':
          return 'org.springframework.context.ApplicationContext'
        case 'FieldError':
          return `Field error on field '${data.text}': ${data.message}`
      }
      return undefined
    },
  }
}
