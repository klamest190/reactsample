import { describe, expect, it } from 'vitest'

import { check, parseHttp, requestText, type HttpResponse } from './http'

describe('parseHttp', () => {
  it('reads requests with headers, body and the expected answer', () => {
    const steps = parseHttp(
      [
        '# create a todo',
        'POST /api/todos',
        'Content-Type: application/json',
        '',
        '{ "title": "Milk" }',
        '→ 201 {"id": 1, "title": "Milk"}',
        '',
        'GET /api/todos/1',
        '-> 404',
      ].join('\n'),
    )
    expect(steps).toHaveLength(2)
    expect(steps[0]).toMatchObject({
      line: 2,
      request: { method: 'POST', path: '/api/todos', headers: { 'Content-Type': 'application/json' }, body: '{ "title": "Milk" }' },
      expectation: { status: 201, body: { kind: 'json', value: { id: 1, title: 'Milk' } } },
    })
    expect(steps[1]).toMatchObject({ line: 8, request: { method: 'GET', path: '/api/todos/1' }, expectation: { status: 404 } })
  })

  it('treats an expected body that is not JSON as plain text', () => {
    const [step] = parseHttp('GET /hello\n→ 200 Hello World')
    expect(step.expectation?.body).toEqual({ kind: 'text', text: 'Hello World' })
  })
})

describe('requestText', () => {
  it('prints a request on one line with compact JSON', () => {
    expect(requestText({ method: 'POST', path: '/api/todos', body: '{\n  "title": "Milk"\n}' })).toBe('POST /api/todos {"title":"Milk"}')
  })
})

describe('check', () => {
  const response = (status: number, body: HttpResponse['body'] = { kind: 'empty' }): HttpResponse => ({ status, headers: {}, body, millis: 1 })

  it('accepts a matching answer - extra properties are fine', () => {
    const answer = response(200, { kind: 'json', value: { id: 1, extra: true } })
    expect(check(answer, { status: 200, body: { kind: 'json', value: { id: 1 } } })).toBeNull()
  })

  it('reports a missing property with its path', () => {
    const answer = response(200, { kind: 'json', value: { todo: {} } })
    expect(check(answer, { body: { kind: 'json', value: { todo: { title: 'Milk' } } } })?.en).toMatch(/title is missing in the response/)
  })

  it('reports a wrong status in both languages', () => {
    expect(check(response(500), { status: 201 })).toEqual({
      de: 'erwartet Status 201, bekommen 500 Internal Server Error',
      en: 'expected status 201, got 500 Internal Server Error',
    })
  })
})
