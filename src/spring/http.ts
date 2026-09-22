/**
 * SPRING PART · HTTP requests, responses and the `.http` notation
 *
 * The course describes requests the way IntelliJ and VS Code do in `.http`
 * files - plus one extra line for the expected answer:
 *
 *   POST /api/todos
 *   {"title": "Buy milk"}
 *   → 201 {"title": "Buy milk", "done": false}
 *
 *   GET /api/todos/99
 *   → 404
 *
 * Expected JSON is compared "loosely": every property written down must match,
 * additional properties in the answer are fine. Arrays must have the same length.
 */

import type { Json } from './json'

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const
export type HttpMethod = (typeof METHODS)[number]

export type HttpRequest = {
  method: HttpMethod
  /** Path including the query string: `/api/todos?done=true` */
  path: string
  headers?: Record<string, string>
  body?: string
}

export type HttpResponse = {
  status: number
  headers: Record<string, string>
  /** JSON, plain text (a controller returning String) or nothing. */
  body: { kind: 'json'; value: Json } | { kind: 'text'; text: string } | { kind: 'empty' }
  /** Server-side duration in milliseconds. */
  millis: number
}

export type Expectation = { status?: number; body?: { kind: 'json'; value: Json } | { kind: 'text'; text: string } }
export type HttpStep = { request: HttpRequest; expectation?: Expectation; line: number }

export const REASONS: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  301: 'Moved Permanently',
  302: 'Found',
  304: 'Not Modified',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  410: 'Gone',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  503: 'Service Unavailable',
}

export const reason = (status: number) => REASONS[status] ?? ''

// ---------------------------------------------------------------------------
// Parsing the notation
// ---------------------------------------------------------------------------

const REQUEST_LINE = new RegExp(`^(${METHODS.join('|')})\\s+(\\S+)\\s*$`)
const EXPECT_LINE = /^(?:→|->)\s*(\d{3})?\s*(.*)$/
const HEADER_LINE = /^([A-Za-z][\w-]*):\s*(.*)$/

export function parseHttp(source: string): HttpStep[] {
  const steps: HttpStep[] = []
  let current: HttpStep | null = null
  let body: string[] = []
  let inHeaders = false

  const finishBody = () => {
    if (current && body.join('').trim()) current.request.body = body.join('\n').trim()
    body = []
  }

  source.split('\n').forEach((raw, index) => {
    const line = raw.trim()
    const request = line.match(REQUEST_LINE)
    if (request) {
      finishBody()
      current = { request: { method: request[1] as HttpMethod, path: request[2] }, line: index + 1 }
      steps.push(current)
      inHeaders = true
      return
    }
    if (line.startsWith('#') || line.startsWith('//')) return
    const expect = line.match(EXPECT_LINE)
    if (expect && current) {
      finishBody()
      current.expectation = { status: expect[1] ? Number(expect[1]) : undefined, body: parseExpectedBody(expect[2].trim()) }
      inHeaders = false
      return
    }
    if (!current) return
    if (inHeaders && !body.length && line) {
      const header = line.match(HEADER_LINE)
      if (header && !line.startsWith('{') && !line.startsWith('[') && !line.startsWith('"')) {
        current.request.headers = { ...current.request.headers, [header[1]]: header[2] }
        return
      }
    }
    inHeaders = false
    if (line || body.length) body.push(raw)
  })
  finishBody()
  return steps
}

function parseExpectedBody(text: string): Expectation['body'] {
  if (!text) return undefined
  try {
    const json = JSON.parse(text) as Json
    // A quoted string is compared with a plain-text answer as well (controllers returning String).
    return { kind: 'json', value: json }
  } catch {
    return { kind: 'text', text }
  }
}

/** One request as a single line: `POST /api/todos {"title":"Milk"}` */
export function requestText(request: HttpRequest) {
  return `${request.method} ${request.path}${request.body ? ' ' + compact(request.body) : ''}`
}

const compact = (body: string) => {
  try {
    return JSON.stringify(JSON.parse(body))
  } catch {
    return body.replace(/\s+/g, ' ')
  }
}

// ---------------------------------------------------------------------------
// Comparing answers with expectations
// ---------------------------------------------------------------------------

export type Mismatch = { de: string; en: string }

export function check(response: HttpResponse, expectation: Expectation): Mismatch | null {
  if (expectation.status !== undefined && response.status !== expectation.status) {
    return {
      de: `erwartet Status ${expectation.status}, bekommen ${response.status} ${reason(response.status)}`,
      en: `expected status ${expectation.status}, got ${response.status} ${reason(response.status)}`,
    }
  }
  const expected = expectation.body
  if (!expected) return null

  if (expected.kind === 'text' || (expected.kind === 'json' && typeof expected.value === 'string' && response.body.kind === 'text')) {
    const wanted = expected.kind === 'text' ? expected.text : (expected.value as string)
    const got = response.body.kind === 'text' ? response.body.text : response.body.kind === 'json' ? JSON.stringify(response.body.value) : ''
    return got.trim() === wanted.trim()
      ? null
      : { de: `erwartet den Text ${JSON.stringify(wanted)}, bekommen ${JSON.stringify(got)}`, en: `expected the text ${JSON.stringify(wanted)}, got ${JSON.stringify(got)}` }
  }

  if (response.body.kind !== 'json') {
    return {
      de: `erwartet JSON, bekommen ${response.body.kind === 'text' ? 'Text ' + JSON.stringify(response.body.text) : 'eine leere Antwort'}`,
      en: `expected JSON, got ${response.body.kind === 'text' ? 'text ' + JSON.stringify(response.body.text) : 'an empty response'}`,
    }
  }
  return compare(expected.value, response.body.value, '')
}

/** Loose comparison: written properties must match, extra ones are fine. */
export function compare(expected: Json, actual: Json | undefined, path: string): Mismatch | null {
  const where = path || '$'
  if (actual === undefined) return { de: `${where} fehlt in der Antwort`, en: `${where} is missing in the response` }
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return { de: `${where}: erwartet eine Liste, bekommen ${show(actual)}`, en: `${where}: expected a list, got ${show(actual)}` }
    if (expected.length !== actual.length) {
      return { de: `${where}: erwartet ${expected.length} Einträge, bekommen ${actual.length}`, en: `${where}: expected ${expected.length} entries, got ${actual.length}` }
    }
    for (let i = 0; i < expected.length; i++) {
      const problem = compare(expected[i], actual[i], `${path}[${i}]`)
      if (problem) return problem
    }
    return null
  }
  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object' || Array.isArray(actual)) {
      return { de: `${where}: erwartet ein Objekt, bekommen ${show(actual)}`, en: `${where}: expected an object, got ${show(actual)}` }
    }
    for (const [key, value] of Object.entries(expected)) {
      const problem = compare(value, (actual as Record<string, Json>)[key], path ? `${path}.${key}` : key)
      if (problem) return problem
    }
    return null
  }
  const same = typeof expected === 'number' && typeof actual === 'number' ? Math.abs(expected - actual) < 1e-9 : expected === actual
  return same ? null : { de: `${where}: erwartet ${show(expected)}, bekommen ${show(actual)}`, en: `${where}: expected ${show(expected)}, got ${show(actual)}` }
}

const show = (json: Json) => {
  const text = JSON.stringify(json)
  return text.length > 60 ? text.slice(0, 57) + '…' : text
}
