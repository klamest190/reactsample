import { createElement, type ComponentType } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import type { Sprache } from '../i18n/LanguageContext'
import type { ReactTest, TestResult } from './jsSandbox'
import { formatieren, compile } from './reactCompile'
import { localized } from '../i18n/localized'

/**
 * Automatische Tests für React-Übungen - eine Mini-Variante von Testing Library.
 *
 * Jeder Test rendert die Komponente `App` der Lernenden frisch in einen
 * unsichtbaren Container und bedient sie wie ein Mensch: klicken, tippen,
 * absenden, warten. Der Testcode steht als String in den Kapitel-Code-Dateien:
 *
 *   {
 *     name: { de: 'Zähler erhöht sich', en: 'Counter increments' },
 *     pruefung: js`
 *       await render()
 *       await click(button('+1'))
 *       expect(text()).toContain('1')
 *     `,
 *   }
 *
 * Isolation pro Test: localStorage (außer den App-eigenen Schlüsseln),
 * document.title, fetch, confirm und alert werden danach wiederhergestellt.
 */

const MESSAGES = {
  de: {
    expected: (e: string, a: string) => `Erwartet ${e}, erhalten ${a}`,
    notExpected: (e: string) => `Erwartet nicht ${e}`,
    contains: (a: string, e: string) => `${a} enthält nicht ${e}`,
    notContains: (a: string, e: string) => `${a} enthält ${e}, sollte es aber nicht`,
    matches: (a: string, e: string) => `${a} passt nicht zu ${e}`,
    notMatches: (a: string, e: string) => `${a} passt zu ${e}, sollte es aber nicht`,
    truthy: (a: string) => `Erwartet einen wahren Wert, erhalten ${a}`,
    falsy: (a: string) => `Erwartet einen falschen Wert, erhalten ${a}`,
    greater: (a: string, e: string) => `Erwartet ${a} > ${e}`,
    less: (a: string, e: string) => `Erwartet ${a} < ${e}`,
    length: (e: number, a: number) => `Erwartet Länge ${e}, erhalten ${a}`,
    disabled: (e: string) => `${e} sollte deaktiviert sein`,
    enabled: (e: string) => `${e} sollte aktiviert sein`,
    button: (l: string) => `Knopf „${l}“ nicht gefunden`,
    buttonOff: (l: string) => `Knopf „${l}“ ist deaktiviert`,
    field: (h: string) => `Eingabefeld „${h}“ nicht gefunden`,
    textMissing: (t: string) => `Text „${t}“ nicht gefunden`,
    element: (s: string) => `Element „${s}“ nicht gefunden`,
    notRendered: 'Zuerst render() aufrufen',
    timeout: 'Zeitüberschreitung - der Test hat zu lange gedauert',
    renderError: 'Fehler beim Rendern: ',
    noApp: 'Keine Komponente App gefunden',
  },
  en: {
    expected: (e: string, a: string) => `Expected ${e}, received ${a}`,
    notExpected: (e: string) => `Expected not ${e}`,
    contains: (a: string, e: string) => `${a} does not contain ${e}`,
    notContains: (a: string, e: string) => `${a} contains ${e}, but should not`,
    matches: (a: string, e: string) => `${a} does not match ${e}`,
    notMatches: (a: string, e: string) => `${a} matches ${e}, but should not`,
    truthy: (a: string) => `Expected a truthy value, received ${a}`,
    falsy: (a: string) => `Expected a falsy value, received ${a}`,
    greater: (a: string, e: string) => `Expected ${a} > ${e}`,
    less: (a: string, e: string) => `Expected ${a} < ${e}`,
    length: (e: number, a: number) => `Expected length ${e}, received ${a}`,
    disabled: (e: string) => `${e} should be disabled`,
    enabled: (e: string) => `${e} should be enabled`,
    button: (l: string) => `Button “${l}” not found`,
    buttonOff: (l: string) => `Button “${l}” is disabled`,
    field: (h: string) => `Input “${h}” not found`,
    textMissing: (t: string) => `Text “${t}” not found`,
    element: (s: string) => `Element “${s}” not found`,
    notRendered: 'Call render() first',
    timeout: 'Timeout - the test took too long',
    renderError: 'Error while rendering: ',
    noApp: 'No App component found',
  },
}

/** Schlüssel, die der Lernpfad selbst benutzt - sie überleben die Test-Isolation. */
const APP_KEYS = [/^tryit:/, /^lernpfad-/, /^sprache$/, /^theme$/, /^demo-notiz$/]

const TEST_TIMEOUT = 15_000

class TestFailure extends Error {}

const short = (value: unknown) => {
  const text = formatieren(value, 1)
  return text.length > 90 ? text.slice(0, 87) + '…' : text
}
const normalize = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()
const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms))
const matches = (content: string, pattern: string | RegExp) =>
  typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content)

type Environment = {
  App: ComponentType
  code: string
  logs: string[]
  m: (typeof MESSAGES)['de']
  cleanup: (() => void)[]
  error: { value: unknown }
  /** The `fetch` the code under test sees - mockFetch swaps it (see ausfuehren). */
  fetch: { current: typeof fetch }
}

/** Alle Helfer, die im Testcode als Variablen verfügbar sind. */
function createHelpers(u: Environment) {
  const { m } = u
  let container: HTMLElement | null = null
  let root: Root | null = null

  function checkError() {
    if (u.error.value) {
      const f = u.error.value
      u.error.value = null
      throw new TestFailure(m.renderError + formatieren(f))
    }
  }

  function rootElement(): HTMLElement {
    if (!container) throw new TestFailure(m.notRendered)
    return container
  }

  function unmount() {
    const r = root
    const c = container
    root = null
    container = null
    if (r) flushSync(() => r.unmount())
    c?.remove()
  }
  u.cleanup.push(unmount)

  async function render() {
    unmount()
    container = document.createElement('div')
    container.className = 'preview'
    container.setAttribute('aria-hidden', 'true')
    Object.assign(container.style, { position: 'fixed', left: '-10000px', top: '0', width: '720px' })
    document.body.appendChild(container)
    root = createRoot(container, { onUncaughtError: (f) => (u.error.value = f) })
    const r = root
    flushSync(() => r.render(createElement(u.App)))
    await tick(30)
    checkError()
  }

  /** Suchfunktionen - global oder innerhalb eines Elements (within). */
  function finders(scope: () => HTMLElement) {
    const alle = (selector: string) => Array.from(scope().querySelectorAll<HTMLElement>(selector))

    // innerText statt textContent: sichtbarer Text mit Abständen zwischen Elementen ("0 / 50 characters Send").
    const text = () => normalize(scope().innerText || scope().textContent)

    function queryByText(pattern: string | RegExp): HTMLElement | null {
      const hits = alle('*')
        .map((el, index) => ({ el, index, length: normalize(el.textContent).length }))
        .filter(({ el }) => matches(normalize(el.textContent), pattern))
      // Kürzester Text gewinnt; bei gleichem Text das tiefere Element (z. B. <li> statt <ul>),
      // das in der Dokumentreihenfolge später kommt.
      hits.sort((a, b) => a.length - b.length || b.index - a.index)
      return hits[0]?.el ?? null
    }

    function getByText(pattern: string | RegExp) {
      const el = queryByText(pattern)
      if (!el) throw new TestFailure(m.textMissing(String(pattern)))
      return el
    }

    function button(label: string | RegExp) {
      const buttons = alle('button')
      const el =
        buttons.find((b) => typeof label === 'string' && normalize(b.textContent) === label) ??
        buttons.find((b) => matches(normalize(b.textContent), label) || matches(b.getAttribute('aria-label') ?? '', label))
      if (!el) throw new TestFailure(m.button(String(label)))
      return el as HTMLButtonElement
    }

    function field(hint?: string | number) {
      const fields = alle('input, textarea, select') as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[]
      let el: (typeof fields)[number] | undefined
      if (hint === undefined) el = fields[0]
      else if (typeof hint === 'number') el = fields[hint]
      else {
        const h = hint.toLowerCase()
        el = fields.find((f) => {
          const label = f.id ? scope().querySelector(`label[for="${CSS.escape(f.id)}"]`) : f.closest('label')
          return (
            f.getAttribute('name') === hint ||
            (f.getAttribute('placeholder') ?? '').toLowerCase().includes(h) ||
            (f.getAttribute('aria-label') ?? '').toLowerCase().includes(h) ||
            normalize(label?.textContent).toLowerCase().includes(h) ||
            f.getAttribute('type') === hint ||
            f.tagName.toLowerCase() === h
          )
        })
      }
      if (!el) throw new TestFailure(m.field(String(hint ?? '')))
      return el
    }

    function find(selector: string) {
      const el = scope().querySelector<HTMLElement>(selector)
      if (!el) throw new TestFailure(m.element(selector))
      return el
    }

    return { text, queryByText, getByText, button, field, find, findAll: alle }
  }

  const global = finders(rootElement)

  async function click(el: HTMLElement) {
    if ((el as HTMLButtonElement).disabled) throw new TestFailure(m.buttonOff(normalize(el.textContent)))
    el.click()
    await tick()
    checkError()
  }

  async function type(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string | number) {
    el.focus()
    // Über den nativen Setter, damit React die Änderung als echte Eingabe erkennt.
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set
    setter?.call(el, String(value))
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
    await tick()
    checkError()
  }

  async function press(el: HTMLElement, key: string) {
    el.focus()
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }))
    await tick()
    checkError()
  }

  async function blur(el: HTMLElement) {
    el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    el.blur()
    await tick()
    checkError()
  }

  async function submit(el: HTMLElement) {
    const form = el.closest('form')
    if (!form) throw new TestFailure(m.element('form'))
    form.requestSubmit()
    await tick()
    checkError()
  }

  async function waitFor<T>(fn: () => T | Promise<T>, timeout = 4000): Promise<T> {
    const start = performance.now()
    for (;;) {
      try {
        checkError()
        return await fn()
      } catch (e) {
        if (performance.now() - start > timeout) throw e
        await tick(50)
      }
    }
  }

  function expect(actual: unknown) {
    const build = (nicht: boolean) => {
      const check = (ok: boolean, message: string, nichtMeldung: string) => {
        if (ok === nicht) throw new TestFailure(nicht ? nichtMeldung : message)
      }
      return {
        toBe: (expected: unknown) => check(Object.is(actual, expected), m.expected(short(expected), short(actual)), m.notExpected(short(expected))),
        toEqual: (expected: unknown) =>
          check(JSON.stringify(actual) === JSON.stringify(expected), m.expected(short(expected), short(actual)), m.notExpected(short(expected))),
        toContain: (part: unknown) =>
          check(
            Array.isArray(actual) ? actual.includes(part) : String(actual).includes(String(part)),
            m.contains(short(actual), short(part)),
            m.notContains(short(actual), short(part)),
          ),
        toMatch: (pattern: RegExp) => check(pattern.test(String(actual)), m.matches(short(actual), String(pattern)), m.notMatches(short(actual), String(pattern))),
        toBeTruthy: () => check(Boolean(actual), m.truthy(short(actual)), m.falsy(short(actual))),
        toBeFalsy: () => check(!actual, m.falsy(short(actual)), m.truthy(short(actual))),
        toBeGreaterThan: (n: number) => check(Number(actual) > n, m.greater(short(actual), String(n)), m.less(short(actual), String(n))),
        toBeLessThan: (n: number) => check(Number(actual) < n, m.less(short(actual), String(n)), m.greater(short(actual), String(n))),
        toHaveLength: (n: number) => {
          const length = (actual as { length: number }).length
          check(length === n, m.length(n, length), m.notExpected(String(n)))
        },
        toBeDisabled: () => {
          const el = actual as HTMLButtonElement
          const name = `<${el.tagName?.toLowerCase()}> „${normalize(el.textContent) || el.getAttribute?.('name') || ''}“`
          check(Boolean(el.disabled), m.disabled(name), m.enabled(name))
        },
      }
    }
    return { ...build(false), not: build(true) }
  }

  function mockFetch(answer: (url: string, init?: RequestInit) => unknown) {
    const original = u.fetch.current
    const calls: { url: string; signal?: AbortSignal | null }[] = []
    u.fetch.current = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input)
      calls.push({ url, signal: init?.signal })
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 30)
        init?.signal?.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
      const result = (await answer(url, init)) as { status?: number; body?: unknown } | undefined
      if (result instanceof Response) return result
      const status = result && typeof result === 'object' && 'status' in result ? result.status! : 200
      const body = result && typeof result === 'object' && 'status' in result ? result.body : result
      return new Response(JSON.stringify(body ?? null), { status, headers: { 'content-type': 'application/json' } })
    }) as typeof fetch
    u.cleanup.push(() => (u.fetch.current = original))
    return { calls }
  }

  return {
    ...global,
    render,
    remount: render,
    within: (el: HTMLElement) => finders(() => el),
    click,
    type,
    check: click,
    blur,
    press,
    focused: () => document.activeElement,
    submit,
    wait: tick,
    waitFor,
    expect,
    mockFetch,
    code: u.code,
    logs: () => [...u.logs],
    clearLogs: () => void (u.logs.length = 0),
    title: () => document.title,
  }
}

// Testläufe nacheinander ausführen - sie verändern globale Dinge wie fetch und localStorage.
let queue: Promise<unknown> = Promise.resolve()

export function runReactTests(code: string, tests: ReactTest[], language: Sprache): Promise<TestResult[]> {
  const queued = queue.then(() => run(code, tests, language))
  queue = queued.catch(() => {})
  return queued
}

async function run(code: string, tests: ReactTest[], language: Sprache): Promise<TestResult[]> {
  const m = MESSAGES[language]
  const logs: string[] = []
  const names = tests.map((t) => localized(t.name, language))

  // The code under test gets a `fetch` of its own. mockFetch replaces only that one - replacing
  // window.fetch would also count the requests of the preview and every other example on the page.
  const testFetch: Environment['fetch'] = { current: (...args) => window.fetch(...args) }
  let compiled: Awaited<ReturnType<typeof compile>>
  try {
    compiled = await compile(code, (_typ, text) => logs.push(text), language, {
      fetch: (...args: Parameters<typeof fetch>) => testFetch.current(...args),
    })
  } catch (error) {
    return names.map((name) => ({ name, ok: false, message: formatieren(error) }))
  }

  const results: TestResult[] = []
  for (const [i, test] of tests.entries()) {
    logs.length = 0
    const u: Environment = { App: compiled.App, code, logs, m, cleanup: [], error: { value: null }, fetch: testFetch }

    // --- Isolation vorbereiten ---
    const storage = Object.entries(localStorage)
    for (const [k] of storage) if (!APP_KEYS.some((re) => re.test(k))) localStorage.removeItem(k)
    const title = document.title
    const { confirm, alert } = window
    window.confirm = () => true
    window.alert = () => {}
    const onError = (e: ErrorEvent) => (u.error.value ??= e.error ?? e.message)
    const beiPromise = (e: PromiseRejectionEvent) => (u.error.value ??= e.reason)
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', beiPromise)
    // Ein <form> ohne eigenen Handler würde sonst die ganze Seite neu laden.
    const noReload = (e: Event) => e.preventDefault()
    document.addEventListener('submit', noReload)

    try {
      const helpers = createHelpers(u)
      const fn = new Function(...Object.keys(helpers), `return (async () => {\n${test.script}\n})()`)
      let timer = 0
      await Promise.race([
        fn(...Object.values(helpers)),
        new Promise((_, reject) => (timer = window.setTimeout(() => reject(new TestFailure(m.timeout)), TEST_TIMEOUT))),
      ]).finally(() => clearTimeout(timer))
      if (u.error.value) throw new TestFailure(m.renderError + formatieren(u.error.value))
      results.push({ name: names[i], ok: true, message: '' })
    } catch (error) {
      const message = error instanceof TestFailure ? error.message : formatieren(error)
      results.push({ name: names[i], ok: false, message })
    } finally {
      for (const cleanup of u.cleanup.reverse()) {
        try {
          cleanup()
        } catch {
          /* Aufräumen darf den nächsten Test nicht blockieren */
        }
      }
      // --- Isolation wiederherstellen ---
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', beiPromise)
      document.removeEventListener('submit', noReload)
      window.confirm = confirm
      window.alert = alert
      document.title = title
      for (const k of Object.keys(localStorage)) if (!APP_KEYS.some((re) => re.test(k))) localStorage.removeItem(k)
      for (const [k, v] of storage) if (!APP_KEYS.some((re) => re.test(k))) localStorage.setItem(k, v)
    }
  }

  compiled.aufraeumen()
  return results
}
