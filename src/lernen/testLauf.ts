import React from 'react'
import { flushSync } from 'react-dom'
import { formatieren, projektAusfuehren, type ProjektDatei } from './reactKompilieren'

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

export type TestFall = { name: string; ok: boolean; meldung: string; dauer: number }
export type TestBericht = { faelle: TestFall[]; logs: string[]; fehler: string | null }

const TIMEOUT = 5000

class AssertionError extends Error {
  name = 'AssertionError'
}

// ---------------------------------------------------------------------------
// expect
// ---------------------------------------------------------------------------

function darstellen(wert: unknown): string {
  if (wert instanceof Element) {
    const text = (wert.textContent ?? '').trim().replace(/\s+/g, ' ')
    return `<${wert.tagName.toLowerCase()}>${text ? ` "${text.slice(0, 40)}"` : ''}`
  }
  if (typeof wert === 'string') return JSON.stringify(wert)
  return formatieren(wert, 1)
}

function gleich(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (a instanceof Map && b instanceof Map) return a.size === b.size && [...a].every(([k, v]) => gleich(v, b.get(k)))
  if (a instanceof Set && b instanceof Set) return a.size === b.size && [...a].every((v) => b.has(v))
  const ka = Object.keys(a).filter((k) => (a as Record<string, unknown>)[k] !== undefined)
  const kb = Object.keys(b).filter((k) => (b as Record<string, unknown>)[k] !== undefined)
  return ka.length === kb.length && ka.every((k) => gleich((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

type Attrappe = ((...args: unknown[]) => unknown) & {
  mock: { calls: unknown[][]; results: { type: 'return' | 'throw'; value: unknown }[] }
  _istAttrappe: true
}

function istAttrappe(wert: unknown): wert is Attrappe {
  return typeof wert === 'function' && (wert as Partial<Attrappe>)._istAttrappe === true
}

function alsElement(wert: unknown, matcher: string): HTMLElement {
  if (!(wert instanceof HTMLElement)) {
    throw new AssertionError(`${matcher}() expects an element, received ${darstellen(wert)}`)
  }
  return wert
}

function istDeaktiviert(el: HTMLElement) {
  if ((el as HTMLButtonElement).disabled) return true
  return Boolean(el.closest('fieldset:disabled'))
}

function wertVon(el: HTMLElement): unknown {
  if (el instanceof HTMLInputElement) {
    if (el.type === 'number') return el.value === '' ? null : Number(el.value)
    if (el.type === 'checkbox' || el.type === 'radio') return el.checked
    return el.value
  }
  if (el instanceof HTMLSelectElement && el.multiple) return [...el.selectedOptions].map((o) => o.value)
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return el.value
  return undefined
}

function textPasst(text: string, erwartet: string | RegExp) {
  const normal = text.replace(/\s+/g, ' ').trim()
  return typeof erwartet === 'string' ? normal.includes(erwartet) : erwartet.test(normal)
}

export function expect(ist: unknown) {
  function matcher(nicht: boolean) {
    // pruefe(bedingung, meldung): meldung wird für .not automatisch umformuliert
    const pruefe = (ok: boolean, meldung: string) => {
      if (ok === nicht) throw new AssertionError(nicht ? meldung.replace(/^expected (.+?) (to|not to) /, 'expected $1 not to ') : meldung)
    }
    const ziel = darstellen(ist)

    return {
      toBe: (e: unknown) => pruefe(Object.is(ist, e), `expected ${ziel} to be ${darstellen(e)}`),
      toEqual: (e: unknown) => pruefe(gleich(ist, e), `expected ${ziel} to equal ${darstellen(e)}`),
      toStrictEqual: (e: unknown) => pruefe(gleich(ist, e), `expected ${ziel} to strictly equal ${darstellen(e)}`),
      toBeTruthy: () => pruefe(Boolean(ist), `expected ${ziel} to be truthy`),
      toBeFalsy: () => pruefe(!ist, `expected ${ziel} to be falsy`),
      toBeNull: () => pruefe(ist === null, `expected ${ziel} to be null`),
      toBeUndefined: () => pruefe(ist === undefined, `expected ${ziel} to be undefined`),
      toBeDefined: () => pruefe(ist !== undefined, `expected ${ziel} to be defined`),
      toContain: (e: unknown) =>
        pruefe(
          (typeof ist === 'string' && typeof e === 'string' && ist.includes(e)) ||
            (Array.isArray(ist) && ist.includes(e)),
          `expected ${ziel} to contain ${darstellen(e)}`,
        ),
      toHaveLength: (n: number) =>
        pruefe((ist as { length?: number })?.length === n, `expected ${ziel} to have length ${n}, but it is ${(ist as { length?: number })?.length}`),
      toMatch: (e: RegExp | string) =>
        pruefe(typeof ist === 'string' && (typeof e === 'string' ? ist.includes(e) : e.test(ist)), `expected ${ziel} to match ${String(e)}`),
      toBeGreaterThan: (n: number) => pruefe((ist as number) > n, `expected ${ziel} to be greater than ${n}`),
      toBeGreaterThanOrEqual: (n: number) => pruefe((ist as number) >= n, `expected ${ziel} to be greater than or equal to ${n}`),
      toBeLessThan: (n: number) => pruefe((ist as number) < n, `expected ${ziel} to be less than ${n}`),
      toBeLessThanOrEqual: (n: number) => pruefe((ist as number) <= n, `expected ${ziel} to be less than or equal to ${n}`),
      toBeCloseTo: (n: number, stellen = 2) =>
        pruefe(Math.abs((ist as number) - n) < 10 ** -stellen / 2, `expected ${ziel} to be close to ${n}`),
      toHaveProperty: (schluessel: string, ...wert: unknown[]) =>
        pruefe(
          ist != null &&
            schluessel in Object(ist) &&
            (wert.length === 0 || gleich((ist as Record<string, unknown>)[schluessel], wert[0])),
          `expected ${ziel} to have property "${schluessel}"`,
        ),
      toThrow: (erwartet?: string | RegExp) => {
        let geworfen: unknown = null
        let hatGeworfen = false
        try {
          ;(ist as () => unknown)()
        } catch (f) {
          hatGeworfen = true
          geworfen = f
        }
        const text = geworfen instanceof Error ? geworfen.message : String(geworfen)
        const passt = hatGeworfen && (erwartet === undefined || textPasst(text, erwartet))
        pruefe(passt, erwartet === undefined ? 'expected function to throw an error' : `expected function to throw ${String(erwartet)}, got "${hatGeworfen ? text : 'no error'}"`)
      },

      // --- Attrappen (vi.fn) -------------------------------------------------
      toHaveBeenCalled: () => {
        if (!istAttrappe(ist)) throw new AssertionError(`${ziel} is not a mock function (vi.fn())`)
        pruefe(ist.mock.calls.length > 0, 'expected mock to have been called')
      },
      toHaveBeenCalledTimes: (n: number) => {
        if (!istAttrappe(ist)) throw new AssertionError(`${ziel} is not a mock function (vi.fn())`)
        pruefe(ist.mock.calls.length === n, `expected mock to have been called ${n} times, but got ${ist.mock.calls.length} times`)
      },
      toHaveBeenCalledWith: (...args: unknown[]) => {
        if (!istAttrappe(ist)) throw new AssertionError(`${ziel} is not a mock function (vi.fn())`)
        const aufrufe = ist.mock.calls.map((c) => darstellen(c)).join(', ') || 'no calls'
        pruefe(ist.mock.calls.some((c) => gleich(c, args)), `expected mock to have been called with ${darstellen(args)} - calls: ${aufrufe}`)
      },
      toHaveBeenLastCalledWith: (...args: unknown[]) => {
        if (!istAttrappe(ist)) throw new AssertionError(`${ziel} is not a mock function (vi.fn())`)
        pruefe(gleich(ist.mock.calls.at(-1), args), `expected last call to be ${darstellen(args)}, got ${darstellen(ist.mock.calls.at(-1))}`)
      },

      // --- DOM (wie @testing-library/jest-dom) -------------------------------
      toBeInTheDocument: () =>
        pruefe(ist instanceof Node && ist.isConnected, `expected ${ist == null ? 'element' : ziel} to be in the document`),
      toHaveTextContent: (e: string | RegExp) => {
        const el = alsElement(ist, 'toHaveTextContent')
        pruefe(textPasst(el.textContent ?? '', e), `expected ${ziel} to have text content ${darstellen(e)}`)
      },
      toBeDisabled: () => pruefe(istDeaktiviert(alsElement(ist, 'toBeDisabled')), `expected ${ziel} to be disabled`),
      toBeEnabled: () => pruefe(!istDeaktiviert(alsElement(ist, 'toBeEnabled')), `expected ${ziel} to be enabled`),
      toHaveValue: (e: unknown) => {
        const wert = wertVon(alsElement(ist, 'toHaveValue'))
        pruefe(gleich(wert, e), `expected ${ziel} to have value ${darstellen(e)}, but it has ${darstellen(wert)}`)
      },
      toBeChecked: () => pruefe(Boolean((alsElement(ist, 'toBeChecked') as HTMLInputElement).checked), `expected ${ziel} to be checked`),
      toHaveAttribute: (name: string, wert?: string) => {
        const el = alsElement(ist, 'toHaveAttribute')
        pruefe(
          el.hasAttribute(name) && (wert === undefined || el.getAttribute(name) === wert),
          `expected ${ziel} to have attribute ${name}${wert === undefined ? '' : `="${wert}"`}`,
        )
      },
      toHaveClass: (...klassen: string[]) => {
        const el = alsElement(ist, 'toHaveClass')
        pruefe(klassen.every((k) => el.classList.contains(k)), `expected ${ziel} to have class ${klassen.join(' ')}`)
      },
      toHaveFocus: () => pruefe(alsElement(ist, 'toHaveFocus') === document.activeElement, `expected ${ziel} to have focus`),
      toBeVisible: () => {
        const el = alsElement(ist, 'toBeVisible')
        const sichtbar = el.isConnected && !el.closest('[hidden]') && el.checkVisibility()
        pruefe(sichtbar, `expected ${ziel} to be visible`)
      },
      toHaveAccessibleName: (e: string | RegExp) => {
        const el = alsElement(ist, 'toHaveAccessibleName')
        const name = el.getAttribute('aria-label') ?? (el.getAttribute('aria-labelledby') ? document.getElementById(el.getAttribute('aria-labelledby')!)?.textContent : null) ?? el.textContent ?? ''
        pruefe(textPasst(name, e), `expected ${ziel} to have accessible name ${darstellen(e)}, got ${darstellen(name.trim())}`)
      },
    }
  }
  return { ...matcher(false), not: matcher(true) }
}

// ---------------------------------------------------------------------------
// vi
// ---------------------------------------------------------------------------

function vitestErstellen() {
  const wiederherstellen: (() => void)[] = []

  function fn(impl: (...args: unknown[]) => unknown = () => undefined) {
    let umsetzung = impl
    const attrappe = ((...args: unknown[]) => {
      attrappe.mock.calls.push(args)
      try {
        const wert = umsetzung(...args)
        attrappe.mock.results.push({ type: 'return', value: wert })
        return wert
      } catch (f) {
        attrappe.mock.results.push({ type: 'throw', value: f })
        throw f
      }
    }) as Attrappe & Record<string, unknown>
    attrappe.mock = { calls: [], results: [] }
    attrappe._istAttrappe = true
    attrappe.mockImplementation = (neu: typeof impl) => ((umsetzung = neu), attrappe)
    attrappe.mockReturnValue = (wert: unknown) => ((umsetzung = () => wert), attrappe)
    attrappe.mockResolvedValue = (wert: unknown) => ((umsetzung = () => Promise.resolve(wert)), attrappe)
    attrappe.mockRejectedValue = (wert: unknown) => ((umsetzung = () => Promise.reject(wert)), attrappe)
    attrappe.mockClear = () => ((attrappe.mock.calls = []), (attrappe.mock.results = []), attrappe)
    return attrappe
  }

  function spyOn(objekt: Record<string, unknown>, name: string) {
    const original = objekt[name] as (...args: unknown[]) => unknown
    const spion = fn((...args) => original.apply(objekt, args))
    objekt[name] = spion
    const zurueck = () => (objekt[name] = original)
    ;(spion as unknown as Record<string, unknown>).mockRestore = zurueck
    wiederherstellen.push(zurueck)
    return spion
  }

  const vi = {
    fn,
    spyOn,
    restoreAllMocks: () => wiederherstellen.splice(0).reverse().forEach((f) => f()),
  }

  // Tests und Hooks einsammeln. Jeder Test merkt sich die Hooks seiner describe-Blöcke.
  type Ebene = { name: string; vorher: (() => unknown)[]; nachher: (() => unknown)[] }
  type Test = { name: string; fn: () => unknown; ebenen: Ebene[]; nurDieser: boolean; skip: boolean }
  const tests: Test[] = []
  const stapel: Ebene[] = [{ name: '', vorher: [], nachher: [] }]

  function registrieren(name: string, fn: () => unknown, extra: Partial<Test> = {}) {
    tests.push({ name: [...stapel.slice(1).map((e) => e.name), name].join(' › '), fn, ebenen: [...stapel], nurDieser: false, skip: false, ...extra })
  }
  const test = Object.assign(registrieren, {
    only: (name: string, fn: () => unknown) => registrieren(name, fn, { nurDieser: true }),
    skip: (name: string, fn: () => unknown) => registrieren(name, fn, { skip: true }),
    todo: (name: string) => registrieren(name, () => {}, { skip: true }),
  })
  function describe(name: string, fn: () => void) {
    stapel.push({ name, vorher: [], nachher: [] })
    try {
      fn()
    } finally {
      stapel.pop()
    }
  }

  const modul = {
    describe,
    test,
    it: test,
    expect,
    vi,
    beforeEach: (fn: () => unknown) => stapel.at(-1)!.vorher.push(fn),
    afterEach: (fn: () => unknown) => stapel.at(-1)!.nachher.push(fn),
  }

  return { modul, tests, vi }
}

// ---------------------------------------------------------------------------
// Ausführen
// ---------------------------------------------------------------------------

function mitTimeout<T>(versprechen: Promise<T>) {
  let zeitgeber = 0
  return Promise.race([
    versprechen,
    new Promise<never>((_, ablehnen) => {
      zeitgeber = window.setTimeout(() => ablehnen(new Error(`Test timed out in ${TIMEOUT}ms`)), TIMEOUT)
    }),
  ]).finally(() => clearTimeout(zeitgeber))
}

function fehlertext(fehler: unknown) {
  if (fehler instanceof Error) {
    // Testing Library hängt das ganze DOM an die Meldung - gekürzt reicht es zum Verstehen.
    const text = fehler.message.length > 900 ? fehler.message.slice(0, 900) + ' …' : fehler.message
    return fehler instanceof AssertionError ? text : `${fehler.name}: ${text}`
  }
  return String(fehler)
}

// Testläufe nacheinander - sie teilen sich den Container und globale Flags von React.
let warteschlange: Promise<unknown> = Promise.resolve()

export function testsAusfuehren(dateien: ProjektDatei[], einstieg: string, sprache: 'de' | 'en'): Promise<TestBericht> {
  const lauf = warteschlange.then(() => ausfuehren(dateien, einstieg, sprache))
  warteschlange = lauf.catch(() => {})
  return lauf
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

async function ausfuehren(dateien: ProjektDatei[], einstieg: string, sprache: 'de' | 'en'): Promise<TestBericht> {
  installActFallback()
  const [rtl, userEvent] = await Promise.all([import('@testing-library/react'), import('@testing-library/user-event')])

  // Eigener Container außerhalb des Bildschirms, aber sichtbar für Testing Library.
  const bereich = document.createElement('div')
  bereich.className = 'vorschau'
  bereich.dataset.vorschau = ''
  Object.assign(bereich.style, { position: 'fixed', left: '-10000px', top: '0', width: '720px' })
  document.body.appendChild(bereich)

  const reactTestingLibrary = {
    ...rtl,
    render: (ui: Parameters<typeof rtl.render>[0], optionen: Parameters<typeof rtl.render>[1] = {}) =>
      rtl.render(ui, { baseElement: bereich, container: bereich.appendChild(document.createElement('div')), ...optionen }),
    screen: { ...rtl.within(bereich), debug: () => console.log(bereich.innerHTML) },
  }

  const logs: string[] = []
  const { modul, tests, vi } = vitestErstellen()
  const global = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  const vorherAct = global.IS_REACT_ACT_ENVIRONMENT
  // Wie in Vitest: React weiß, dass es in Tests läuft, und bündelt Updates in act().
  global.IS_REACT_ACT_ENVIRONMENT = true

  let aufraeumen = () => {}
  try {
    try {
      const ergebnis = await projektAusfuehren(dateien, einstieg, (_typ, text) => logs.push(text), sprache, {
        vitest: modul,
        '@testing-library/react': reactTestingLibrary,
        // __esModule: sonst macht der CommonJS-Umbau aus "import userEvent from …" den ganzen Namensraum.
        '@testing-library/user-event': { ...userEvent, __esModule: true },
      })
      aufraeumen = ergebnis.aufraeumen
    } catch (fehler) {
      return { faelle: [], logs, fehler: fehlertext(fehler) }
    }

    const mitOnly = tests.some((t) => t.nurDieser)
    const faelle: TestFall[] = []
    for (const t of tests) {
      if (t.skip || (mitOnly && !t.nurDieser)) continue
      const start = performance.now()
      let meldung = ''
      try {
        await mitTimeout(
          (async () => {
            for (const e of t.ebenen) for (const h of e.vorher) await h()
            try {
              await t.fn()
            } finally {
              for (const e of [...t.ebenen].reverse()) for (const h of e.nachher) await h()
            }
          })(),
        )
      } catch (fehler) {
        meldung = fehlertext(fehler)
      } finally {
        rtl.cleanup()
        vi.restoreAllMocks()
      }
      faelle.push({ name: t.name, ok: !meldung, meldung, dauer: Math.round(performance.now() - start) })
    }
    return { faelle, logs, fehler: null }
  } finally {
    aufraeumen()
    rtl.cleanup()
    bereich.remove()
    global.IS_REACT_ACT_ENVIRONMENT = vorherAct
  }
}
