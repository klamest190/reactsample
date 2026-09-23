import { createElement, type ComponentType } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import type { Sprache } from '../i18n/SpracheContext'
import type { ReactTest, TestErgebnis } from './jsSandbox'
import { formatieren, kompilieren } from './reactKompilieren'
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

const MELDUNGEN = {
  de: {
    erwartet: (e: string, a: string) => `Erwartet ${e}, erhalten ${a}`,
    erwartetNicht: (e: string) => `Erwartet nicht ${e}`,
    enthaelt: (a: string, e: string) => `${a} enthält nicht ${e}`,
    enthaeltNicht: (a: string, e: string) => `${a} enthält ${e}, sollte es aber nicht`,
    passt: (a: string, e: string) => `${a} passt nicht zu ${e}`,
    passtNicht: (a: string, e: string) => `${a} passt zu ${e}, sollte es aber nicht`,
    wahr: (a: string) => `Erwartet einen wahren Wert, erhalten ${a}`,
    falsch: (a: string) => `Erwartet einen falschen Wert, erhalten ${a}`,
    groesser: (a: string, e: string) => `Erwartet ${a} > ${e}`,
    kleiner: (a: string, e: string) => `Erwartet ${a} < ${e}`,
    laenge: (e: number, a: number) => `Erwartet Länge ${e}, erhalten ${a}`,
    deaktiviert: (e: string) => `${e} sollte deaktiviert sein`,
    aktiviert: (e: string) => `${e} sollte aktiviert sein`,
    knopf: (l: string) => `Knopf „${l}“ nicht gefunden`,
    knopfAus: (l: string) => `Knopf „${l}“ ist deaktiviert`,
    feld: (h: string) => `Eingabefeld „${h}“ nicht gefunden`,
    textFehlt: (t: string) => `Text „${t}“ nicht gefunden`,
    element: (s: string) => `Element „${s}“ nicht gefunden`,
    nichtGerendert: 'Zuerst render() aufrufen',
    zeitueberschreitung: 'Zeitüberschreitung - der Test hat zu lange gedauert',
    renderFehler: 'Fehler beim Rendern: ',
    keineApp: 'Keine Komponente App gefunden',
  },
  en: {
    erwartet: (e: string, a: string) => `Expected ${e}, received ${a}`,
    erwartetNicht: (e: string) => `Expected not ${e}`,
    enthaelt: (a: string, e: string) => `${a} does not contain ${e}`,
    enthaeltNicht: (a: string, e: string) => `${a} contains ${e}, but should not`,
    passt: (a: string, e: string) => `${a} does not match ${e}`,
    passtNicht: (a: string, e: string) => `${a} matches ${e}, but should not`,
    wahr: (a: string) => `Expected a truthy value, received ${a}`,
    falsch: (a: string) => `Expected a falsy value, received ${a}`,
    groesser: (a: string, e: string) => `Expected ${a} > ${e}`,
    kleiner: (a: string, e: string) => `Expected ${a} < ${e}`,
    laenge: (e: number, a: number) => `Expected length ${e}, received ${a}`,
    deaktiviert: (e: string) => `${e} should be disabled`,
    aktiviert: (e: string) => `${e} should be enabled`,
    knopf: (l: string) => `Button “${l}” not found`,
    knopfAus: (l: string) => `Button “${l}” is disabled`,
    feld: (h: string) => `Input “${h}” not found`,
    textFehlt: (t: string) => `Text “${t}” not found`,
    element: (s: string) => `Element “${s}” not found`,
    nichtGerendert: 'Call render() first',
    zeitueberschreitung: 'Timeout - the test took too long',
    renderFehler: 'Error while rendering: ',
    keineApp: 'No App component found',
  },
}

/** Schlüssel, die der Lernpfad selbst benutzt - sie überleben die Test-Isolation. */
const APP_SCHLUESSEL = [/^tryit:/, /^lernpfad-/, /^sprache$/, /^theme$/, /^demo-notiz$/]

const TEST_TIMEOUT = 15_000

class TestFehler extends Error {}

const kurz = (wert: unknown) => {
  const text = formatieren(wert, 1)
  return text.length > 90 ? text.slice(0, 87) + '…' : text
}
const normal = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()
const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms))
const passt = (inhalt: string, muster: string | RegExp) =>
  typeof muster === 'string' ? inhalt.includes(muster) : muster.test(inhalt)

type Umgebung = {
  App: ComponentType
  code: string
  logs: string[]
  m: (typeof MELDUNGEN)['de']
  aufraeumen: (() => void)[]
  fehler: { wert: unknown }
}

/** Alle Helfer, die im Testcode als Variablen verfügbar sind. */
function helferErstellen(u: Umgebung) {
  const { m } = u
  let container: HTMLElement | null = null
  let root: Root | null = null

  function fehlerPruefen() {
    if (u.fehler.wert) {
      const f = u.fehler.wert
      u.fehler.wert = null
      throw new TestFehler(m.renderFehler + formatieren(f))
    }
  }

  function wurzel(): HTMLElement {
    if (!container) throw new TestFehler(m.nichtGerendert)
    return container
  }

  function abbauen() {
    const r = root
    const c = container
    root = null
    container = null
    if (r) flushSync(() => r.unmount())
    c?.remove()
  }
  u.aufraeumen.push(abbauen)

  async function render() {
    abbauen()
    container = document.createElement('div')
    container.className = 'vorschau'
    container.setAttribute('aria-hidden', 'true')
    Object.assign(container.style, { position: 'fixed', left: '-10000px', top: '0', width: '720px' })
    document.body.appendChild(container)
    root = createRoot(container, { onUncaughtError: (f) => (u.fehler.wert = f) })
    const r = root
    flushSync(() => r.render(createElement(u.App)))
    await tick(30)
    fehlerPruefen()
  }

  /** Suchfunktionen - global oder innerhalb eines Elements (within). */
  function sucher(bereich: () => HTMLElement) {
    const alle = (selektor: string) => Array.from(bereich().querySelectorAll<HTMLElement>(selektor))

    // innerText statt textContent: sichtbarer Text mit Abständen zwischen Elementen ("0 / 50 characters Send").
    const text = () => normal(bereich().innerText || bereich().textContent)

    function queryByText(muster: string | RegExp): HTMLElement | null {
      const treffer = alle('*')
        .map((el, index) => ({ el, index, laenge: normal(el.textContent).length }))
        .filter(({ el }) => passt(normal(el.textContent), muster))
      // Kürzester Text gewinnt; bei gleichem Text das tiefere Element (z. B. <li> statt <ul>),
      // das in der Dokumentreihenfolge später kommt.
      treffer.sort((a, b) => a.laenge - b.laenge || b.index - a.index)
      return treffer[0]?.el ?? null
    }

    function getByText(muster: string | RegExp) {
      const el = queryByText(muster)
      if (!el) throw new TestFehler(m.textFehlt(String(muster)))
      return el
    }

    function button(label: string | RegExp) {
      const knoepfe = alle('button')
      const el =
        knoepfe.find((b) => typeof label === 'string' && normal(b.textContent) === label) ??
        knoepfe.find((b) => passt(normal(b.textContent), label) || passt(b.getAttribute('aria-label') ?? '', label))
      if (!el) throw new TestFehler(m.knopf(String(label)))
      return el as HTMLButtonElement
    }

    function field(hinweis?: string | number) {
      const felder = alle('input, textarea, select') as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[]
      let el: (typeof felder)[number] | undefined
      if (hinweis === undefined) el = felder[0]
      else if (typeof hinweis === 'number') el = felder[hinweis]
      else {
        const h = hinweis.toLowerCase()
        el = felder.find((f) => {
          const label = f.id ? bereich().querySelector(`label[for="${CSS.escape(f.id)}"]`) : f.closest('label')
          return (
            f.getAttribute('name') === hinweis ||
            (f.getAttribute('placeholder') ?? '').toLowerCase().includes(h) ||
            (f.getAttribute('aria-label') ?? '').toLowerCase().includes(h) ||
            normal(label?.textContent).toLowerCase().includes(h) ||
            f.getAttribute('type') === hinweis ||
            f.tagName.toLowerCase() === h
          )
        })
      }
      if (!el) throw new TestFehler(m.feld(String(hinweis ?? '')))
      return el
    }

    function find(selektor: string) {
      const el = bereich().querySelector<HTMLElement>(selektor)
      if (!el) throw new TestFehler(m.element(selektor))
      return el
    }

    return { text, queryByText, getByText, button, field, find, findAll: alle }
  }

  const global = sucher(wurzel)

  async function click(el: HTMLElement) {
    if ((el as HTMLButtonElement).disabled) throw new TestFehler(m.knopfAus(normal(el.textContent)))
    el.click()
    await tick()
    fehlerPruefen()
  }

  async function type(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, wert: string | number) {
    el.focus()
    // Über den nativen Setter, damit React die Änderung als echte Eingabe erkennt.
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set
    setter?.call(el, String(wert))
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
    await tick()
    fehlerPruefen()
  }

  async function press(el: HTMLElement, key: string) {
    el.focus()
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }))
    await tick()
    fehlerPruefen()
  }

  async function blur(el: HTMLElement) {
    el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    el.blur()
    await tick()
    fehlerPruefen()
  }

  async function submit(el: HTMLElement) {
    const form = el.closest('form')
    if (!form) throw new TestFehler(m.element('form'))
    form.requestSubmit()
    await tick()
    fehlerPruefen()
  }

  async function waitFor<T>(fn: () => T | Promise<T>, timeout = 4000): Promise<T> {
    const start = performance.now()
    for (;;) {
      try {
        fehlerPruefen()
        return await fn()
      } catch (e) {
        if (performance.now() - start > timeout) throw e
        await tick(50)
      }
    }
  }

  function expect(ist: unknown) {
    const baue = (nicht: boolean) => {
      const pruefe = (ok: boolean, meldung: string, nichtMeldung: string) => {
        if (ok === nicht) throw new TestFehler(nicht ? nichtMeldung : meldung)
      }
      return {
        toBe: (soll: unknown) => pruefe(Object.is(ist, soll), m.erwartet(kurz(soll), kurz(ist)), m.erwartetNicht(kurz(soll))),
        toEqual: (soll: unknown) =>
          pruefe(JSON.stringify(ist) === JSON.stringify(soll), m.erwartet(kurz(soll), kurz(ist)), m.erwartetNicht(kurz(soll))),
        toContain: (teil: unknown) =>
          pruefe(
            Array.isArray(ist) ? ist.includes(teil) : String(ist).includes(String(teil)),
            m.enthaelt(kurz(ist), kurz(teil)),
            m.enthaeltNicht(kurz(ist), kurz(teil)),
          ),
        toMatch: (muster: RegExp) => pruefe(muster.test(String(ist)), m.passt(kurz(ist), String(muster)), m.passtNicht(kurz(ist), String(muster))),
        toBeTruthy: () => pruefe(Boolean(ist), m.wahr(kurz(ist)), m.falsch(kurz(ist))),
        toBeFalsy: () => pruefe(!ist, m.falsch(kurz(ist)), m.wahr(kurz(ist))),
        toBeGreaterThan: (n: number) => pruefe(Number(ist) > n, m.groesser(kurz(ist), String(n)), m.kleiner(kurz(ist), String(n))),
        toBeLessThan: (n: number) => pruefe(Number(ist) < n, m.kleiner(kurz(ist), String(n)), m.groesser(kurz(ist), String(n))),
        toHaveLength: (n: number) => {
          const laenge = (ist as { length: number }).length
          pruefe(laenge === n, m.laenge(n, laenge), m.erwartetNicht(String(n)))
        },
        toBeDisabled: () => {
          const el = ist as HTMLButtonElement
          const name = `<${el.tagName?.toLowerCase()}> „${normal(el.textContent) || el.getAttribute?.('name') || ''}“`
          pruefe(Boolean(el.disabled), m.deaktiviert(name), m.aktiviert(name))
        },
      }
    }
    return { ...baue(false), not: baue(true) }
  }

  function mockFetch(antwort: (url: string, init?: RequestInit) => unknown) {
    const original = window.fetch
    const calls: { url: string; signal?: AbortSignal | null }[] = []
    window.fetch = (async (eingabe: RequestInfo | URL, init?: RequestInit) => {
      const url = String(eingabe instanceof Request ? eingabe.url : eingabe)
      calls.push({ url, signal: init?.signal })
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 30)
        init?.signal?.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
      const ergebnis = (await antwort(url, init)) as { status?: number; body?: unknown } | undefined
      if (ergebnis instanceof Response) return ergebnis
      const status = ergebnis && typeof ergebnis === 'object' && 'status' in ergebnis ? ergebnis.status! : 200
      const body = ergebnis && typeof ergebnis === 'object' && 'status' in ergebnis ? ergebnis.body : ergebnis
      return new Response(JSON.stringify(body ?? null), { status, headers: { 'content-type': 'application/json' } })
    }) as typeof fetch
    u.aufraeumen.push(() => (window.fetch = original))
    return { calls }
  }

  return {
    ...global,
    render,
    remount: render,
    within: (el: HTMLElement) => sucher(() => el),
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
let warteschlange: Promise<unknown> = Promise.resolve()

export function reactTestsAusfuehren(code: string, tests: ReactTest[], sprache: Sprache): Promise<TestErgebnis[]> {
  const lauf = warteschlange.then(() => ausfuehren(code, tests, sprache))
  warteschlange = lauf.catch(() => {})
  return lauf
}

async function ausfuehren(code: string, tests: ReactTest[], sprache: Sprache): Promise<TestErgebnis[]> {
  const m = MELDUNGEN[sprache]
  const logs: string[] = []
  const namen = tests.map((t) => localized(t.name, sprache))

  let kompiliert: Awaited<ReturnType<typeof kompilieren>>
  try {
    kompiliert = await kompilieren(code, (_typ, text) => logs.push(text), sprache)
  } catch (fehler) {
    return namen.map((name) => ({ name, ok: false, meldung: formatieren(fehler) }))
  }

  const ergebnisse: TestErgebnis[] = []
  for (const [i, test] of tests.entries()) {
    logs.length = 0
    const u: Umgebung = { App: kompiliert.App, code, logs, m, aufraeumen: [], fehler: { wert: null } }

    // --- Isolation vorbereiten ---
    const speicher = Object.entries(localStorage)
    for (const [k] of speicher) if (!APP_SCHLUESSEL.some((re) => re.test(k))) localStorage.removeItem(k)
    const titel = document.title
    const { confirm, alert } = window
    window.confirm = () => true
    window.alert = () => {}
    const beiFehler = (e: ErrorEvent) => (u.fehler.wert ??= e.error ?? e.message)
    const beiPromise = (e: PromiseRejectionEvent) => (u.fehler.wert ??= e.reason)
    window.addEventListener('error', beiFehler)
    window.addEventListener('unhandledrejection', beiPromise)
    // Ein <form> ohne eigenen Handler würde sonst die ganze Seite neu laden.
    const keinNeuladen = (e: Event) => e.preventDefault()
    document.addEventListener('submit', keinNeuladen)

    try {
      const helfer = helferErstellen(u)
      const fn = new Function(...Object.keys(helfer), `return (async () => {\n${test.pruefung}\n})()`)
      let timer = 0
      await Promise.race([
        fn(...Object.values(helfer)),
        new Promise((_, nein) => (timer = window.setTimeout(() => nein(new TestFehler(m.zeitueberschreitung)), TEST_TIMEOUT))),
      ]).finally(() => clearTimeout(timer))
      if (u.fehler.wert) throw new TestFehler(m.renderFehler + formatieren(u.fehler.wert))
      ergebnisse.push({ name: namen[i], ok: true, meldung: '' })
    } catch (fehler) {
      const meldung = fehler instanceof TestFehler ? fehler.message : formatieren(fehler)
      ergebnisse.push({ name: namen[i], ok: false, meldung })
    } finally {
      for (const aufraeumen of u.aufraeumen.reverse()) {
        try {
          aufraeumen()
        } catch {
          /* Aufräumen darf den nächsten Test nicht blockieren */
        }
      }
      // --- Isolation wiederherstellen ---
      window.removeEventListener('error', beiFehler)
      window.removeEventListener('unhandledrejection', beiPromise)
      document.removeEventListener('submit', keinNeuladen)
      window.confirm = confirm
      window.alert = alert
      document.title = titel
      for (const k of Object.keys(localStorage)) if (!APP_SCHLUESSEL.some((re) => re.test(k))) localStorage.removeItem(k)
      for (const [k, v] of speicher) if (!APP_SCHLUESSEL.some((re) => re.test(k))) localStorage.setItem(k, v)
    }
  }

  kompiliert.aufraeumen()
  return ergebnisse
}
