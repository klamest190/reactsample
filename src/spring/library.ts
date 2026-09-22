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
import { NULL, neuerString, wahrheit, zahl, type NativWert, type Wert } from '../java/werte'

export interface LibraryHost {
  /** `SpringApplication.run(App.class, args)` - starts the context and returns it. */
  run(mainClass: string | undefined, line: number): Wert
  getBean(query: Wert, line: number): Wert
  beanNames(): string[]
  property(key: string): string | undefined
  activeProfiles(): string[]
  /** A Spring Data repository method - `undefined` if `target` is no repository. */
  repositoryCall(target: NativWert, name: string, args: Wert[], line: number): Wert | undefined
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
const statusObjects = new Map<number, NativWert>()
export function httpStatus(code: number): NativWert {
  let status = statusObjects.get(code)
  if (!status) {
    status = { art: 'nativ', typ: 'HttpStatus', daten: { zahl: code, text: STATUS_NAMES[code] ?? String(code) } }
    statusObjects.set(code, status)
  }
  return status
}

/** A status from Java: `HttpStatus.CREATED`, `201` or a `HttpStatusCode`. */
export function statusCode(value: Wert | undefined): number | null {
  if (!value) return null
  if (value.art === 'int' || value.art === 'long') return value.wert
  if (value.art === 'nativ' && value.typ === 'HttpStatus') return value.daten.zahl ?? null
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

type Headers = Map<string, { schluessel: Wert; wert: Wert }>

export function responseEntity(status: number, body: Wert | null, headers: Headers = new Map()): NativWert {
  return { art: 'nativ', typ: 'ResponseEntity', daten: { zahl: status, liste: body ? [body] : [], map: headers } }
}

function builder(status: number, withBody = true, headers: Headers = new Map()): NativWert {
  return { art: 'nativ', typ: withBody ? 'ResponseEntity.BodyBuilder' : 'ResponseEntity.HeadersBuilder', daten: { zahl: status, map: headers } }
}

function header(headers: Headers, name: string, value: string): Headers {
  const copy = new Map(headers)
  const key = neuerString(name)
  copy.set('s:' + name, { schluessel: key, wert: neuerString(value) })
  return copy
}

export function responseStatusException(status: number, reason?: string): NativWert {
  const name = STATUS_NAMES[status] ?? String(status)
  return {
    art: 'nativ',
    typ: 'ResponseStatusException',
    daten: { zahl: status, text: reason, meldung: `${status} ${name}${reason ? ` "${reason}"` : ''}` },
  }
}

/** Exceptions raised by Spring itself while binding a request - catchable with @ExceptionHandler. */
export function frameworkException(type: string, message: string, fieldErrors?: FieldErrorInfo[]): NativWert {
  return {
    art: 'nativ',
    typ: type,
    daten: {
      meldung: message,
      liste: fieldErrors?.map((e) => ({
        art: 'nativ' as const,
        typ: 'FieldError',
        daten: { text: e.field, meldung: e.message, liste: [e.rejected] },
      })),
    },
  }
}

export type FieldErrorInfo = { objectName: string; field: string; rejected: Wert; message: string }

function problemDetail(status: number, detail: Wert | null): NativWert {
  const map: Headers = new Map()
  const put = (key: string, value: Wert) => map.set('s:' + key, { schluessel: neuerString(key), wert: value })
  put('type', neuerString('about:blank'))
  put('title', neuerString(reasonPhrase(status)))
  put('status', zahl(status))
  if (detail && detail.art !== 'null') put('detail', detail)
  return { art: 'nativ', typ: 'ProblemDetail', daten: { zahl: status, map } }
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
          if (name === 'run') return host.run(a?.art === 'nativ' ? a.daten.text : undefined, line)
          return undefined
        case 'HttpStatus':
        case 'HttpStatusCode':
          if (name === 'valueOf' || name === 'resolve') {
            const code = statusCode(a)
            if (code && STATUS_NAMES[code]) return httpStatus(code)
            if (name === 'resolve') return NULL
            return i.werfen('IllegalArgumentException', `No matching constant for [${code}]`, line)
          }
          return undefined
        case 'URI':
          if (name === 'create') return { art: 'nativ', typ: 'URI', daten: { text: i.alsText(a) } }
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
              return builder(201, true, a ? header(new Map(), 'Location', i.alsText(a)) : new Map())
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
              const inner = name === 'of' && a?.art === 'nativ' && a.typ === 'Optional' ? (a.daten.liste?.[0] ?? null) : a && a.art !== 'null' ? a : null
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
          return responseStatusException(statusCode(a) ?? 500, b && b.art !== 'null' ? i.alsText(b) : undefined)
        case 'ResponseEntity': {
          // new ResponseEntity<>(body, HttpStatus.OK) or new ResponseEntity<>(HttpStatus.NO_CONTENT)
          if (args.length === 1) return responseEntity(statusCode(a) ?? 200, null)
          return responseEntity(statusCode(b) ?? 200, a && a.art !== 'null' ? a : null)
        }
        case 'AtomicLong':
        case 'AtomicInteger':
          return { art: 'nativ', typ: className, daten: { zahl: a && (a.art === 'int' || a.art === 'long') ? a.wert : 0 } }
      }
      return undefined
    },

    method(target, name, args, i, line) {
      const data = target.daten
      const [a, b] = args
      const repository = host.repositoryCall(target, name, args, line)
      if (repository) return repository

      switch (target.typ) {
        case 'HttpStatus': {
          const code = data.zahl ?? 0
          switch (name) {
            case 'value':
              return zahl(code)
            case 'getReasonPhrase':
              return neuerString(reasonPhrase(code))
            case 'name':
              return neuerString(data.text ?? '')
            case 'is2xxSuccessful':
              return wahrheit(code >= 200 && code < 300)
            case 'is4xxClientError':
              return wahrheit(code >= 400 && code < 500)
            case 'is5xxServerError':
              return wahrheit(code >= 500)
            case 'isError':
              return wahrheit(code >= 400)
            case 'equals':
              return wahrheit(a === target)
          }
          return undefined
        }
        case 'ResponseEntity.BodyBuilder':
        case 'ResponseEntity.HeadersBuilder':
          if (name === 'body' && target.typ === 'ResponseEntity.BodyBuilder') return responseEntity(data.zahl ?? 200, a && a.art !== 'null' ? a : null, data.map)
          if (name === 'build') return responseEntity(data.zahl ?? 200, null, data.map)
          if (name === 'header') return { ...target, daten: { ...data, map: header(data.map ?? new Map(), i.alsText(a), i.alsText(b)) } }
          if (name === 'location') return { ...target, daten: { ...data, map: header(data.map ?? new Map(), 'Location', i.alsText(a)) } }
          return undefined
        case 'ResponseEntity':
          switch (name) {
            case 'getStatusCode':
              return httpStatus(data.zahl ?? 200)
            case 'getStatusCodeValue':
              return zahl(data.zahl ?? 200)
            case 'getBody':
              return data.liste?.[0] ?? NULL
            case 'hasBody':
              return wahrheit(Boolean(data.liste?.length))
            case 'getHeaders':
              return { art: 'nativ', typ: 'LinkedHashMap', daten: { map: new Map(data.map) } }
          }
          return undefined
        case 'ResponseStatusException':
          if (name === 'getStatusCode') return httpStatus(data.zahl ?? 500)
          if (name === 'getReason') return data.text !== undefined ? neuerString(data.text) : NULL
          return undefined
        case 'ProblemDetail': {
          const map = data.map!
          const read = (key: string) => map.get('s:' + key)?.wert ?? NULL
          const write = (key: string, value: Wert) => {
            map.set('s:' + key, { schluessel: neuerString(key), wert: value })
            return NULL
          }
          switch (name) {
            case 'getStatus':
              return zahl(data.zahl ?? 500)
            case 'getTitle':
            case 'getDetail':
            case 'getType':
            case 'getInstance':
              return read(name.slice(3).toLowerCase())
            case 'setTitle':
            case 'setDetail':
            case 'setType':
            case 'setInstance':
              return write(name.slice(3).toLowerCase(), a.art === 'nativ' ? neuerString(i.alsText(a)) : a)
            case 'setProperty':
              return write(i.alsText(a), b)
          }
          return undefined
        }
        case 'MethodArgumentNotValidException':
        case 'BindingResult':
          if (name === 'getBindingResult') return { art: 'nativ', typ: 'BindingResult', daten: { liste: data.liste ?? [] } }
          if (name === 'getFieldErrors' || name === 'getAllErrors') return { art: 'nativ', typ: 'ArrayList', daten: { liste: [...(data.liste ?? [])] } }
          if (name === 'getErrorCount') return zahl(data.liste?.length ?? 0)
          if (name === 'hasErrors') return wahrheit(Boolean(data.liste?.length))
          if (name === 'getFieldError') return data.liste?.[0] ?? NULL
          return undefined
        case 'FieldError':
          if (name === 'getField') return neuerString(data.text ?? '')
          if (name === 'getDefaultMessage') return neuerString(data.meldung ?? '')
          if (name === 'getRejectedValue') return data.liste?.[0] ?? NULL
          return undefined
        case 'AtomicLong':
        case 'AtomicInteger': {
          const make = (n: number): Wert => (target.typ === 'AtomicLong' ? { art: 'long', wert: n } : zahl(n))
          const now = data.zahl ?? 0
          const set = (n: number) => {
            data.zahl = n
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
              return make(set(now + (a && 'wert' in a ? Number(a.wert) : 0)))
            case 'get':
            case 'longValue':
            case 'intValue':
              return make(now)
            case 'set':
              set(a && 'wert' in a ? Number(a.wert) : 0)
              return NULL
          }
          return undefined
        }
        case 'ApplicationContext':
          switch (name) {
            case 'getBean':
              return host.getBean(a, line)
            case 'getBeanDefinitionNames':
              return { art: 'array', typ: 'String', werte: host.beanNames().map((n) => neuerString(n)) }
            case 'getBeanDefinitionCount':
              return zahl(host.beanNames().length)
            case 'containsBean':
              return wahrheit(host.beanNames().includes(i.alsText(a)))
            case 'getEnvironment':
              return { art: 'nativ', typ: 'Environment', daten: {} }
          }
          return undefined
        case 'Environment':
          if (name === 'getProperty') {
            const value = host.property(i.alsText(a))
            return value !== undefined ? neuerString(value) : (b ?? NULL)
          }
          if (name === 'getActiveProfiles') return { art: 'array', typ: 'String', werte: host.activeProfiles().map((p) => neuerString(p)) }
          return undefined
      }
      return undefined
    },

    text(value, i) {
      const data = value.daten
      switch (value.typ) {
        case 'HttpStatus':
          return `${data.zahl} ${data.text}`
        case 'URI':
          return data.text ?? ''
        case 'ResponseEntity':
          return `<${data.zahl} ${STATUS_NAMES[data.zahl ?? 200] ?? ''} ${reasonPhrase(data.zahl ?? 200)},${data.liste?.length ? i.alsText(data.liste[0]) + ',' : ''}[]>`
        case 'ResponseStatusException':
          return `org.springframework.web.server.ResponseStatusException: ${data.meldung}`
        case 'AtomicLong':
        case 'AtomicInteger':
          return String(data.zahl ?? 0)
        case 'ApplicationContext':
          return 'org.springframework.context.ApplicationContext'
        case 'FieldError':
          return `Field error on field '${data.text}': ${data.meldung}`
      }
      return undefined
    },
  }
}
