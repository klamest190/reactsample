import React from 'react'
import { flushSync } from 'react-dom'
import { formatieren, runProject, type ProjectFile } from './reactCompile'

/**
 * Führt Tests aus, die Lernende selbst schreiben - im Stil von Vitest + React Testing Library:
 *
 *   import { describe, test, expect, vi } from 'vitest'
 *   import { render, screen } from '@testing-library/react'
 *   import userEvent from '@testing-library/user-event'
 *
 * Testing Library und user-event sind die echten Bibliotheken. "vitest" ist ein kleiner
 * Nachbau (test, describe, expect mit den gängigen Matchern inkl. jest-dom, vi.fn, vi.spyOn),
 * denn der echte Vitest läuft nur in Node bzw. einem eigenen Browser-Prozess.
 *
 * Gerendert wird in einen eigenen, unsichtbaren Container. `screen` sucht nur darin -
 * sonst würde getByText auch Texte dieser Lern-Seite finden.
 */

export type TestCase = { name: string; ok: boolean; message: string; duration: number }
export type TestReport = { cases: TestCase[]; logs: string[]; error: string | null }

const TIMEOUT = 5000

class AssertionError extends Error {
  name = 'AssertionError'
}

// ---------------------------------------------------------------------------
// expect
// ---------------------------------------------------------------------------

function render(value: unknown): string {
  if (value instanceof Element) {
    const text = (value.textContent ?? '').trim().replace(/\s+/g, ' ')
    return `<${value.tagName.toLowerCase()}>${text ? ` "${text.slice(0, 40)}"` : ''}`
  }
  if (typeof value === 'string') return JSON.stringify(value)
  return formatieren(value, 1)
}

function same(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (a instanceof Map && b instanceof Map) return a.size === b.size && [...a].every(([k, v]) => same(v, b.get(k)))
  if (a instanceof Set && b instanceof Set) return a.size === b.size && [...a].every((v) => b.has(v))
  const ka = Object.keys(a).filter((k) => (a as Record<string, unknown>)[k] !== undefined)
  const kb = Object.keys(b).filter((k) => (b as Record<string, unknown>)[k] !== undefined)
  return ka.length === kb.length && ka.every((k) => same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

type Mock = ((...args: unknown[]) => unknown) & {
  mock: { calls: unknown[][]; results: { type: 'return' | 'throw'; value: unknown }[] }
  _isMock: true
}

function isMock(value: unknown): value is Mock {
  return typeof value === 'function' && (value as Partial<Mock>)._isMock === true
}

function alsElement(value: unknown, matcher: string): HTMLElement {
  if (!(value instanceof HTMLElement)) {
    throw new AssertionError(`${matcher}() expects an element, received ${render(value)}`)
  }
  return value
}

function isDisabled(el: HTMLElement) {
  if ((el as HTMLButtonElement).disabled) return true
  return Boolean(el.closest('fieldset:disabled'))
}

function valueOf(el: HTMLElement): unknown {
  if (el instanceof HTMLInputElement) {
    if (el.type === 'number') return el.value === '' ? null : Number(el.value)
    if (el.type === 'checkbox' || el.type === 'radio') return el.checked
    return el.value
  }
  if (el instanceof HTMLSelectElement && el.multiple) return [...el.selectedOptions].map((o) => o.value)
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return el.value
  return undefined
}

function textMatches(text: string, expected: string | RegExp) {
  const normalize = text.replace(/\s+/g, ' ').trim()
  return typeof expected === 'string' ? normalize.includes(expected) : expected.test(normalize)
}

export function expect(actual: unknown) {
  function matcher(nicht: boolean) {
    // pruefe(bedingung, meldung): meldung wird für .not automatisch umformuliert
    const check = (ok: boolean, message: string) => {
      if (ok === nicht) throw new AssertionError(nicht ? message.replace(/^expected (.+?) (to|not to) /, 'expected $1 not to ') : message)
    }
    const target = render(actual)

    return {
      toBe: (e: unknown) => check(Object.is(actual, e), `expected ${target} to be ${render(e)}`),
      toEqual: (e: unknown) => check(same(actual, e), `expected ${target} to equal ${render(e)}`),
      toStrictEqual: (e: unknown) => check(same(actual, e), `expected ${target} to strictly equal ${render(e)}`),
      toBeTruthy: () => check(Boolean(actual), `expected ${target} to be truthy`),
      toBeFalsy: () => check(!actual, `expected ${target} to be falsy`),
      toBeNull: () => check(actual === null, `expected ${target} to be null`),
      toBeUndefined: () => check(actual === undefined, `expected ${target} to be undefined`),
      toBeDefined: () => check(actual !== undefined, `expected ${target} to be defined`),
      toContain: (e: unknown) =>
        check(
          (typeof actual === 'string' && typeof e === 'string' && actual.includes(e)) ||
            (Array.isArray(actual) && actual.includes(e)),
          `expected ${target} to contain ${render(e)}`,
        ),
      toHaveLength: (n: number) =>
        check((actual as { length?: number })?.length === n, `expected ${target} to have length ${n}, but it is ${(actual as { length?: number })?.length}`),
      toMatch: (e: RegExp | string) =>
        check(typeof actual === 'string' && (typeof e === 'string' ? actual.includes(e) : e.test(actual)), `expected ${target} to match ${String(e)}`),
      toBeGreaterThan: (n: number) => check((actual as number) > n, `expected ${target} to be greater than ${n}`),
      toBeGreaterThanOrEqual: (n: number) => check((actual as number) >= n, `expected ${target} to be greater than or equal to ${n}`),
      toBeLessThan: (n: number) => check((actual as number) < n, `expected ${target} to be less than ${n}`),
      toBeLessThanOrEqual: (n: number) => check((actual as number) <= n, `expected ${target} to be less than or equal to ${n}`),
      toBeCloseTo: (n: number, positions = 2) =>
        check(Math.abs((actual as number) - n) < 10 ** -positions / 2, `expected ${target} to be close to ${n}`),
      toHaveProperty: (key: string, ...value: unknown[]) =>
        check(
          actual != null &&
            key in Object(actual) &&
            (value.length === 0 || same((actual as Record<string, unknown>)[key], value[0])),
          `expected ${target} to have property "${key}"`,
        ),
      toThrow: (expected?: string | RegExp) => {
        let thrown: unknown = null
        let threw = false
        try {
          ;(actual as () => unknown)()
        } catch (f) {
          threw = true
          thrown = f
        }
        const text = thrown instanceof Error ? thrown.message : String(thrown)
        const matches = threw && (expected === undefined || textMatches(text, expected))
        check(matches, expected === undefined ? 'expected function to throw an error' : `expected function to throw ${String(expected)}, got "${threw ? text : 'no error'}"`)
      },

      // --- Attrappen (vi.fn) -------------------------------------------------
      toHaveBeenCalled: () => {
        if (!isMock(actual)) throw new AssertionError(`${target} is not a mock function (vi.fn())`)
        check(actual.mock.calls.length > 0, 'expected mock to have been called')
      },
      toHaveBeenCalledTimes: (n: number) => {
        if (!isMock(actual)) throw new AssertionError(`${target} is not a mock function (vi.fn())`)
        check(actual.mock.calls.length === n, `expected mock to have been called ${n} times, but got ${actual.mock.calls.length} times`)
      },
      toHaveBeenCalledWith: (...args: unknown[]) => {
        if (!isMock(actual)) throw new AssertionError(`${target} is not a mock function (vi.fn())`)
        const calls = actual.mock.calls.map((c) => render(c)).join(', ') || 'no calls'
        check(actual.mock.calls.some((c) => same(c, args)), `expected mock to have been called with ${render(args)} - calls: ${calls}`)
      },
      toHaveBeenLastCalledWith: (...args: unknown[]) => {
        if (!isMock(actual)) throw new AssertionError(`${target} is not a mock function (vi.fn())`)
        check(same(actual.mock.calls.at(-1), args), `expected last call to be ${render(args)}, got ${render(actual.mock.calls.at(-1))}`)
      },

      // --- DOM (wie @testing-library/jest-dom) -------------------------------
      toBeInTheDocument: () =>
        check(actual instanceof Node && actual.isConnected, `expected ${actual == null ? 'element' : target} to be in the document`),
      toHaveTextContent: (e: string | RegExp) => {
        const el = alsElement(actual, 'toHaveTextContent')
        check(textMatches(el.textContent ?? '', e), `expected ${target} to have text content ${render(e)}`)
      },
      toBeDisabled: () => check(isDisabled(alsElement(actual, 'toBeDisabled')), `expected ${target} to be disabled`),
      toBeEnabled: () => check(!isDisabled(alsElement(actual, 'toBeEnabled')), `expected ${target} to be enabled`),
      toHaveValue: (e: unknown) => {
        const value = valueOf(alsElement(actual, 'toHaveValue'))
        check(same(value, e), `expected ${target} to have value ${render(e)}, but it has ${render(value)}`)
      },
      toBeChecked: () => check(Boolean((alsElement(actual, 'toBeChecked') as HTMLInputElement).checked), `expected ${target} to be checked`),
      toHaveAttribute: (name: string, value?: string) => {
        const el = alsElement(actual, 'toHaveAttribute')
        check(
          el.hasAttribute(name) && (value === undefined || el.getAttribute(name) === value),
          `expected ${target} to have attribute ${name}${value === undefined ? '' : `="${value}"`}`,
        )
      },
      toHaveClass: (...classes: string[]) => {
        const el = alsElement(actual, 'toHaveClass')
        check(classes.every((k) => el.classList.contains(k)), `expected ${target} to have class ${classes.join(' ')}`)
      },
      toHaveFocus: () => check(alsElement(actual, 'toHaveFocus') === document.activeElement, `expected ${target} to have focus`),
      toBeVisible: () => {
        const el = alsElement(actual, 'toBeVisible')
        const visible = el.isConnected && !el.closest('[hidden]') && el.checkVisibility()
        check(visible, `expected ${target} to be visible`)
      },
      toHaveAccessibleName: (e: string | RegExp) => {
        const el = alsElement(actual, 'toHaveAccessibleName')
        const name = el.getAttribute('aria-label') ?? (el.getAttribute('aria-labelledby') ? document.getElementById(el.getAttribute('aria-labelledby')!)?.textContent : null) ?? el.textContent ?? ''
        check(textMatches(name, e), `expected ${target} to have accessible name ${render(e)}, got ${render(name.trim())}`)
      },
    }
  }
  return { ...matcher(false), not: matcher(true) }
}

// ---------------------------------------------------------------------------
// vi
// ---------------------------------------------------------------------------

function createVitest() {
  const restore: (() => void)[] = []

  function fn(impl: (...args: unknown[]) => unknown = () => undefined) {
    let implementation = impl
    const mock = ((...args: unknown[]) => {
      mock.mock.calls.push(args)
      try {
        const value = implementation(...args)
        mock.mock.results.push({ type: 'return', value })
        return value
      } catch (f) {
        mock.mock.results.push({ type: 'throw', value: f })
        throw f
      }
    }) as Mock & Record<string, unknown>
    mock.mock = { calls: [], results: [] }
    mock._isMock = true
    mock.mockImplementation = (next: typeof impl) => ((implementation = next), mock)
    mock.mockReturnValue = (value: unknown) => ((implementation = () => value), mock)
    mock.mockResolvedValue = (value: unknown) => ((implementation = () => Promise.resolve(value)), mock)
    mock.mockRejectedValue = (value: unknown) => ((implementation = () => Promise.reject(value)), mock)
    mock.mockClear = () => ((mock.mock.calls = []), (mock.mock.results = []), mock)
    return mock
  }

  function spyOn(object: Record<string, unknown>, name: string) {
    const original = object[name] as (...args: unknown[]) => unknown
    const spy = fn((...args) => original.apply(object, args))
    object[name] = spy
    const back = () => (object[name] = original)
    ;(spy as unknown as Record<string, unknown>).mockRestore = back
    restore.push(back)
    return spy
  }

  const vi = {
    fn,
    spyOn,
    restoreAllMocks: () => restore.splice(0).reverse().forEach((f) => f()),
  }

  // Tests und Hooks einsammeln. Jeder Test merkt sich die Hooks seiner describe-Blöcke.
  type Layer = { name: string; before: (() => unknown)[]; after: (() => unknown)[] }
  type Test = { name: string; fn: () => unknown; layers: Layer[]; onlyThis: boolean; skip: boolean }
  const tests: Test[] = []
  const stack: Layer[] = [{ name: '', before: [], after: [] }]

  function register(name: string, fn: () => unknown, extra: Partial<Test> = {}) {
    tests.push({ name: [...stack.slice(1).map((e) => e.name), name].join(' › '), fn, layers: [...stack], onlyThis: false, skip: false, ...extra })
  }
  const test = Object.assign(register, {
    only: (name: string, fn: () => unknown) => register(name, fn, { onlyThis: true }),
    skip: (name: string, fn: () => unknown) => register(name, fn, { skip: true }),
    todo: (name: string) => register(name, () => {}, { skip: true }),
  })
  function describe(name: string, fn: () => void) {
    stack.push({ name, before: [], after: [] })
    try {
      fn()
    } finally {
      stack.pop()
    }
  }

  const mod = {
    describe,
    test,
    it: test,
    expect,
    vi,
    beforeEach: (fn: () => unknown) => stack.at(-1)!.before.push(fn),
    afterEach: (fn: () => unknown) => stack.at(-1)!.after.push(fn),
  }

  return { modul: mod, tests, vi }
}

// ---------------------------------------------------------------------------
// Ausführen
// ---------------------------------------------------------------------------

function withTimeout<T>(promise: Promise<T>) {
  let timers = 0
  return Promise.race([
    promise,
    new Promise<never>((_, ablehnen) => {
      timers = window.setTimeout(() => ablehnen(new Error(`Test timed out in ${TIMEOUT}ms`)), TIMEOUT)
    }),
  ]).finally(() => clearTimeout(timers))
}

function errorText(error: unknown) {
  if (error instanceof Error) {
    // Testing Library hängt das ganze DOM an die Meldung - gekürzt reicht es zum Verstehen.
    const text = error.message.length > 900 ? error.message.slice(0, 900) + ' …' : error.message
    return error instanceof AssertionError ? text : `${error.name}: ${text}`
  }
  return String(error)
}

// Testläufe nacheinander - sie teilen sich den Container und globale Flags von React.
let queue: Promise<unknown> = Promise.resolve()

export function runTests(files: ProjectFile[], entry: string, language: 'de' | 'en'): Promise<TestReport> {
  const queued = queue.then(() => run(files, entry, language))
  queue = queued.catch(() => {})
  return queued
}

/**
 * React 19 ships `act` only in its development build. Testing Library wraps every render
 * and event in it - in the published (production) build every test would fail with
 * "act is not a function". This stand-in does what the tests rely on: updates inside the
 * callback are applied right away, an async callback is awaited plus one task, so the
 * state updates it caused have run.
 * It must be in place before Testing Library loads - that looks for `React.act` once.
 */
function installActFallback() {
  // The types always declare `act` - at runtime the production build has none.
  const react = React as unknown as { act?: (callback: () => unknown) => unknown }
  if (typeof react.act === 'function') return
  react.act = (callback: () => unknown) => {
    let result: unknown
    flushSync(() => {
      result = callback()
    })
    if (result instanceof Promise) {
      return result.then(async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 0))
        return value
      })
    }
    return result
  }
}

async function run(files: ProjectFile[], entry: string, language: 'de' | 'en'): Promise<TestReport> {
  installActFallback()
  const [rtl, userEvent] = await Promise.all([import('@testing-library/react'), import('@testing-library/user-event')])

  // Eigener Container außerhalb des Bildschirms, aber sichtbar für Testing Library.
  const scope = document.createElement('div')
  scope.className = 'preview'
  scope.dataset.preview = ''
  Object.assign(scope.style, { position: 'fixed', left: '-10000px', top: '0', width: '720px' })
  document.body.appendChild(scope)

  const reactTestingLibrary = {
    ...rtl,
    render: (ui: Parameters<typeof rtl.render>[0], options: Parameters<typeof rtl.render>[1] = {}) =>
      rtl.render(ui, { baseElement: scope, container: scope.appendChild(document.createElement('div')), ...options }),
    screen: { ...rtl.within(scope), debug: () => console.log(scope.innerHTML) },
  }

  const logs: string[] = []
  const { modul: mod, tests, vi } = createVitest()
  const global = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  const previousAct = global.IS_REACT_ACT_ENVIRONMENT
  // Wie in Vitest: React weiß, dass es in Tests läuft, und bündelt Updates in act().
  global.IS_REACT_ACT_ENVIRONMENT = true

  let cleanup = () => {}
  try {
    try {
      const result = await runProject(files, entry, (_typ, text) => logs.push(text), language, {
        vitest: mod,
        '@testing-library/react': reactTestingLibrary,
        // __esModule: sonst macht der CommonJS-Umbau aus "import userEvent from …" den ganzen Namensraum.
        '@testing-library/user-event': { ...userEvent, __esModule: true },
      })
      cleanup = result.aufraeumen
    } catch (error) {
      return { cases: [], logs, error: errorText(error) }
    }

    const withOnly = tests.some((t) => t.onlyThis)
    const cases: TestCase[] = []
    for (const t of tests) {
      if (t.skip || (withOnly && !t.onlyThis)) continue
      const start = performance.now()
      let message = ''
      try {
        await withTimeout(
          (async () => {
            for (const e of t.layers) for (const h of e.before) await h()
            try {
              await t.fn()
            } finally {
              for (const e of [...t.layers].reverse()) for (const h of e.after) await h()
            }
          })(),
        )
      } catch (error) {
        message = errorText(error)
      } finally {
        rtl.cleanup()
        vi.restoreAllMocks()
      }
      cases.push({ name: t.name, ok: !message, message, duration: Math.round(performance.now() - start) })
    }
    return { cases, logs, error: null }
  } finally {
    cleanup()
    rtl.cleanup()
    scope.remove()
    global.IS_REACT_ACT_ENVIRONMENT = previousAct
  }
}
