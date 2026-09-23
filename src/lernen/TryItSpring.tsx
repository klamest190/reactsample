import { useCallback, useMemo, useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { localized } from '../i18n/localized'
import { useSprache } from '../i18n/SpracheContext'
import {
  formatJson,
  springCheck,
  springRun,
  type BeanInfo,
  type Exchange,
  type HttpRequest,
  type OutputLine,
  type RouteInfo,
  type SpringServer,
  type TestResult,
} from '../spring'
import { reason } from '../spring/http'
import { CodeEditor } from './CodeEditor'
import { lineMarkers, useDelayedCheck } from './editorChecks'
import { Konsole, Rahmen, Testergebnisse } from './Rahmen'
import type { SpringProps } from './TryIt'
import { useEditor } from './useEditor'
import { useSavedCode } from './useSavedCode'
import { focusableWhenScrolling } from '../components/scrollFocus'

/**
 * The editor for Spring Boot (part 8): Java code with Spring annotations, run by
 * the course's Java runtime plus the Spring layer in src/spring/.
 *
 * Below the editor: the server log, an HTTP client (like Postman or a `.http`
 * file in IntelliJ) and the list of beans and endpoints Spring found. The
 * application keeps running after the start - every "Send" is one request.
 */

const TEXTS = {
  de: {
    start: 'Starten',
    running: (port: number) => `läuft auf http://localhost:${port} (simuliert im Browser)`,
    notRunning: 'nicht gestartet',
    beansAndRoutes: (beans: number, routes: number) => `${beans} Beans · ${routes} Endpunkte`,
    beans: 'Beans',
    routes: 'Endpunkte',
    noRoutes: 'Keine Endpunkte - es gibt keinen @RestController.',
    dependsOn: 'bekommt',
    http: 'HTTP-Anfragen',
    send: 'Senden',
    body: 'Body (JSON)',
    empty: '(leere Antwort)',
    clear: 'Verlauf leeren',
    expectationFailed: 'Erwartung nicht erfüllt:',
    pickRoute: 'Klick auf einen Endpunkt füllt das Formular.',
    properties: 'application.properties',
    propertiesEditor: 'Editor für application.properties',
    exerciseStart: 'Starte mit ▶ - dann laufen die Tests, und du kannst selbst Anfragen schicken.',
    kinds: {
      controller: 'Controller',
      service: 'Service',
      repository: 'Repository',
      component: 'Komponente',
      configuration: 'Konfiguration',
      bean: '@Bean',
      advice: 'Advice',
    },
  },
  en: {
    start: 'Start',
    running: (port: number) => `running on http://localhost:${port} (simulated in the browser)`,
    notRunning: 'not started',
    beansAndRoutes: (beans: number, routes: number) => `${beans} beans · ${routes} endpoints`,
    beans: 'Beans',
    routes: 'Endpoints',
    noRoutes: 'No endpoints - there is no @RestController.',
    dependsOn: 'gets',
    http: 'HTTP requests',
    send: 'Send',
    body: 'Body (JSON)',
    empty: '(empty response)',
    clear: 'Clear history',
    expectationFailed: 'Expectation not met:',
    pickRoute: 'Click an endpoint to fill in the form.',
    properties: 'application.properties',
    propertiesEditor: 'Editor for application.properties',
    exerciseStart: 'Start with ▶ - the tests run, and you can send requests yourself.',
    kinds: {
      controller: 'Controller',
      service: 'Service',
      repository: 'Repository',
      component: 'Component',
      configuration: 'Configuration',
      bean: '@Bean',
      advice: 'Advice',
    },
  },
}

const KIND_ICONS: Record<BeanInfo['kind'], IconName> = {
  controller: 'globus',
  service: 'zahnrad',
  repository: 'datenbank',
  component: 'puzzle',
  configuration: 'werkzeug',
  bean: 'paket',
  advice: 'warnung',
}

type Run = {
  lines: OutputLine[]
  exchanges: Exchange[]
  results: TestResult[] | null
  server: SpringServer | null
}

export function TryItSpring(props: SpringProps) {
  const { id, tests, properties: startProperties, requests } = props
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const { code, rahmen } = useEditor(props)
  const [properties, setProperties] = useSavedCode(id + ':properties', startProperties ?? '')
  const springTests = useMemo(
    () => tests?.map((test) => ({ ...test, name: localized(test.name, sprache) })),
    [tests, sprache],
  )

  function compute(source: string, withTests: boolean): Run {
    try {
      const result = springRun(source, { language: sprache, properties, requests, tests: withTests ? springTests : undefined })
      return { lines: [...result.lines], exchanges: result.exchanges, results: result.results, server: result.server }
    } catch (error) {
      // The runtime must never take the page down.
      return { lines: [{ typ: 'fehler', text: String(error instanceof Error ? error.message : error) }], exchanges: [], results: null, server: null }
    }
  }
  // Examples start right away (the runtime is synchronous), exercises on the button.
  const [run, setRun] = useState<Run | null>(() => (tests ? null : compute(code, false)))

  function start(source: string, withTests: boolean) {
    setRun(compute(source, withTests))
  }

  // Red squiggles like in an IDE, shortly after the last key press.
  const check = useCallback((source: string) => lineMarkers(source, springCheck(source, sprache)), [sprache])
  const markers = useDelayedCheck(code, check) ?? undefined

  function send(request: HttpRequest) {
    const server = run?.server
    if (!server) return
    const { response } = server.send(request)
    setRun((old) => old && { ...old, lines: [...server.app.lines], exchanges: [...old.exchanges, { request, response, mismatch: null }] })
  }

  const propertiesEditor =
    startProperties !== undefined ? (
      <details open className="border-b border-slate-200 dark:border-slate-800">
        <summary className="cursor-pointer px-4 py-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
          <Icon name="datei" className="mr-1.5 inline size-3.5 align-[-2px]" />
          {t.properties}
        </summary>
        <CodeEditor wert={properties} beiAenderung={setProperties} beiAusfuehren={() => start(code, true)} label={t.propertiesEditor} sprache="properties" maxZeilen={8} />
      </details>
    ) : null

  return (
    <Rahmen
      {...rahmen}
      art="Spring"
      markierungen={markers}
      startText={t.start}
      oben={propertiesEditor}
      ausfuehren={(c) => start(c ?? code, true)}
    >
      <Testergebnisse id={id} ergebnisse={run?.results?.map((r) => ({ name: r.name, ok: r.ok, meldung: r.message })) ?? null} />
      {run ? (
        <>
          <ServerBar server={run.server} />
          <Konsole zeilen={run.lines} />
          {run.server && <HttpPanel server={run.server} exchanges={run.exchanges} onSend={send} onClear={() => setRun({ ...run, exchanges: [] })} />}
        </>
      ) : (
        <Konsole zeilen={[]} leerText={tests ? t.exerciseStart : '…'} />
      )}
    </Rahmen>
  )
}

// ---------------------------------------------------------------------------
// Server status, beans and endpoints
// ---------------------------------------------------------------------------

function ServerBar({ server }: { server: SpringServer | null }) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  if (!server) {
    return (
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span className="size-2 rounded-full bg-rose-500" aria-hidden="true" /> {t.notRunning}
      </div>
    )
  }
  const beans = server.beans()
  const routes = server.routes()
  return (
    <details className="border-b border-slate-200 text-xs dark:border-slate-800">
      <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2">
        <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
          {t.running(server.port)}
        </span>
        <span className="text-slate-500 dark:text-slate-400">{t.beansAndRoutes(beans.length, routes.length)} ▾</span>
      </summary>
      <div className="grid gap-4 px-4 pb-3 sm:grid-cols-2">
        <div>
          <h4 className="mb-1 font-semibold">{t.beans}</h4>
          <ul className="space-y-1">
            {beans.map((b) => (
              <li key={b.name} className="leading-snug">
                <Icon name={KIND_ICONS[b.kind]} className="mr-1.5 inline size-3.5 align-[-2px] text-slate-500 dark:text-slate-400" />
                <span className="font-mono font-semibold">{b.name}</span>{' '}
                <span className="text-slate-500 dark:text-slate-400">
                  ({t.kinds[b.kind]}
                  {b.type !== b.name ? `, ${b.type}` : ''})
                </span>
                {b.dependencies.length > 0 && (
                  <span className="block pl-5 text-slate-500 dark:text-slate-400">
                    ← {t.dependsOn} <span className="font-mono">{b.dependencies.join(', ')}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-1 font-semibold">{t.routes}</h4>
          {routes.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">{t.noRoutes}</p>
          ) : (
            <ul className="space-y-1 font-mono">
              {routes.map((r) => (
                <li key={r.method + r.path}>
                  <MethodBadge method={r.method} /> {r.path}
                  <span className="block pl-2 text-2xs text-slate-500 dark:text-slate-400">→ {r.handler}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </details>
  )
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  POST: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  PUT: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  PATCH: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  DELETE: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  '*': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

function MethodBadge({ method }: { method: string }) {
  return <span className={`inline-block rounded px-1.5 py-px font-mono text-2xs font-bold ${METHOD_COLORS[method] ?? METHOD_COLORS['*']}`}>{method}</span>
}

// ---------------------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------------------

function HttpPanel({ server, exchanges, onSend, onClear }: { server: SpringServer; exchanges: Exchange[]; onSend: (r: HttpRequest) => void; onClear: () => void }) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const routes = server.routes()
  const first = routes.find((r) => r.method === 'GET') ?? routes[0]
  const [method, setMethod] = useState<HttpRequest['method']>('GET')
  const [path, setPath] = useState(first ? example(first.path) : '/')
  const [body, setBody] = useState('{\n  \n}')
  const withBody = method === 'POST' || method === 'PUT' || method === 'PATCH'

  function pick(route: RouteInfo) {
    const m = route.method === '*' ? 'GET' : route.method
    setMethod(m)
    setPath(example(route.path))
  }

  return (
    <div role="group" aria-label={t.http} className="space-y-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">{t.http}</h4>
        {exchanges.length > 0 && (
          <button onClick={onClear} className="text-xs text-slate-500 hover:underline dark:text-slate-400">
            {t.clear}
          </button>
        )}
      </div>

      {exchanges.length > 0 && (
        <ol className="space-y-2">
          {exchanges.map((e, i) => (
            <li key={i}>
              <ExchangeView exchange={e} />
            </li>
          ))}
        </ol>
      )}

      {routes.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs" title={t.pickRoute}>
          {routes.map((r) => (
            <button
              key={r.method + r.path}
              onClick={() => pick(r)}
              className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono transition hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
            >
              <MethodBadge method={r.method} /> {r.path}
            </button>
          ))}
        </div>
      )}

      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSend({ method, path: path.startsWith('/') ? path : '/' + path, body: withBody ? body : undefined, headers: withBody ? { 'Content-Type': 'application/json' } : undefined })
        }}
      >
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpRequest['method'])}
            aria-label="HTTP method"
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            aria-label="Path"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700">
            {t.send}
          </button>
        </div>
        {withBody && (
          <label className="block">
            <span className="text-xs text-slate-500 dark:text-slate-400">{t.body}</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              spellCheck={false}
              rows={4}
              className="mt-0.5 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-code dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        )}
      </form>
    </div>
  )
}

/** `/api/todos/{id}` → `/api/todos/1` - a sensible default for the form. */
const example = (path: string) => path.replace(/\{[^}]+\}/g, '1')

function ExchangeView({ exchange }: { exchange: Exchange }) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const { request, response, mismatch } = exchange
  const status = response.status
  const color =
    status < 300
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
      : status < 500
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
  const body = response.body
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white text-code dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-1.5 font-mono dark:border-slate-800">
        <MethodBadge method={request.method} />
        <span className="min-w-0 flex-1 break-all">{request.path}</span>
        <span className={`rounded px-1.5 py-px text-2xs font-bold ${color}`}>
          {status} {reason(status)}
        </span>
        <span className="text-2xs text-slate-500 dark:text-slate-400">{response.millis} ms</span>
      </div>
      {request.body && <pre ref={focusableWhenScrolling} className="overflow-x-auto border-b border-slate-100 px-3 py-1.5 text-slate-500 dark:border-slate-800 dark:text-slate-400">{compact(request.body)}</pre>}
      <pre ref={focusableWhenScrolling} className="max-h-64 overflow-auto px-3 py-2">
        {body.kind === 'json' ? formatJson(body.value) : body.kind === 'text' ? body.text : <span className="text-slate-500 italic dark:text-slate-400">{t.empty}</span>}
      </pre>
      {response.headers.Location && <p className="px-3 pb-2 font-mono text-2xs text-slate-500 dark:text-slate-400">Location: {response.headers.Location}</p>}
      {mismatch && (
        <p className="border-t border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {t.expectationFailed} {mismatch[sprache]}
        </p>
      )}
    </div>
  )
}


const compact = (body: string) => {
  try {
    return JSON.stringify(JSON.parse(body))
  } catch {
    return body
  }
}
