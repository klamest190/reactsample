import { createElement, useEffect, useEffectEvent, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { useSprache } from '../../i18n/SpracheContext'
import { CodeEditor } from '../../lernen/CodeEditor'
import { formatieren, kompilieren } from '../../lernen/reactKompilieren'
import { Konsole, type Zeile } from '../../lernen/Rahmen'
import { useSavedCode } from '../../lernen/useSavedCode'
import { springStart, type SpringServer } from '../../spring'
import { focusableWhenScrolling } from '../../components/scrollFocus'

/**
 * The full-stack workshop (part 8): the React todo app on the right, a Spring Boot
 * backend on the left - both run in this browser tab.
 *
 * The React code calls `fetch('/api/todos')` as usual. Here `fetch` is replaced
 * by a small bridge: requests to `/api/…` go to the simulated Spring application,
 * everything else answers 404 - exactly like the Vite dev proxy in a real project
 * (see the chapter). The network log below shows every request, like the DevTools.
 */

const TEXTS = {
  de: {
    run: '▶ Backend und Frontend starten',
    backend: 'Backend · Spring Boot (Java)',
    frontend: 'Frontend · React (App.jsx)',
    preview: 'Vorschau · http://localhost:5173',
    network: 'Netzwerk',
    noRequests: 'Noch keine Anfragen.',
    serverLog: 'Server-Log',
    backendDown: 'Das Backend ist nicht gestartet - fetch bekommt keine Antwort.',
    reset: 'Beides zurücksetzen',
    editorBackend: 'Editor für das Backend',
    editorFrontend: 'Editor für das Frontend',
  },
  en: {
    run: '▶ Start backend and frontend',
    backend: 'Backend · Spring Boot (Java)',
    frontend: 'Frontend · React (App.jsx)',
    preview: 'Preview · http://localhost:5173',
    network: 'Network',
    noRequests: 'No requests yet.',
    serverLog: 'Server log',
    backendDown: 'The backend did not start - fetch gets no answer.',
    reset: 'Reset both',
    editorBackend: 'Editor for the backend',
    editorFrontend: 'Editor for the frontend',
  },
}

type NetworkEntry = { method: string; url: string; status: number | null; millis: number; body?: string }

export function FullStack({ id, backend: backendStart, frontend: frontendStart }: { id: string; backend: string; frontend: string }) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const [backend, setBackend] = useSavedCode(id + ':backend', backendStart)
  const [frontend, setFrontend] = useSavedCode(id + ':frontend', frontendStart)
  const [serverLines, setServerLines] = useState<Zeile[]>([])
  const [browserLines, setBrowserLines] = useState<Zeile[]>([])
  const [network, setNetwork] = useState<NetworkEntry[]>([])
  const [server, setServer] = useState<SpringServer | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<Root | null>(null)
  const cleanupRef = useRef<() => void>(() => {})
  const runRef = useRef(0)

  async function start(backendCode = backend, frontendCode = frontend) {
    const run = ++runRef.current
    // 1. Backend
    const started = springStart(backendCode, { language: sprache })
    const api = started.server
    setServer(api)
    setServerLines([...started.lines])
    setNetwork([])
    setBrowserLines(api ? [] : [{ typ: 'warn', text: t.backendDown }])

    // 2. The bridge: fetch('/api/…') → the Spring application in this tab
    const bridge = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
      const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const url = new URL(raw, 'http://localhost:5173')
      const method = (init.method ?? 'GET').toUpperCase()
      const body = typeof init.body === 'string' ? init.body : undefined
      const entry: NetworkEntry = { method, url: url.pathname + url.search, status: null, millis: 0, body }
      await new Promise((resolve) => setTimeout(resolve, 60))
      if (run !== runRef.current) return new Response(null, { status: 499 })
      if (!url.pathname.startsWith('/api') || !api) {
        entry.status = api ? 404 : null
        setNetwork((old) => [...old, entry])
        if (!api) throw new TypeError('Failed to fetch')
        return new Response('Not Found', { status: 404 })
      }
      const { response } = api.send({ method: method as 'GET', path: entry.url, body, headers: { 'Content-Type': 'application/json' } })
      entry.status = response.status
      entry.millis = response.millis + 60
      setNetwork((old) => [...old, entry])
      setServerLines([...api.app.lines])
      const text = response.body.kind === 'json' ? JSON.stringify(response.body.value) : response.body.kind === 'text' ? response.body.text : null
      const contentType = response.body.kind === 'json' ? 'application/json' : 'text/plain'
      return new Response(response.status === 204 ? null : text, { status: response.status, headers: { 'Content-Type': contentType } })
    }

    // 3. Frontend
    cleanupRef.current()
    rootRef.current?.unmount()
    rootRef.current = null
    const log = (typ: Zeile['typ'], text: string) => setBrowserLines((old) => [...old, { typ, text }])
    try {
      const { App, aufraeumen } = await kompilieren(frontendCode, log, sprache, { fetch: bridge })
      if (run !== runRef.current || !previewRef.current) return
      cleanupRef.current = aufraeumen
      const root = createRoot(previewRef.current, { onUncaughtError: (error) => log('fehler', formatieren(error)) })
      rootRef.current = root
      root.render(createElement(ErrorBoundary, null, createElement(App)))
    } catch (error) {
      log('fehler', formatieren(error))
    }
  }

  const firstStart = useEffectEvent(() => {
    void start()
  })
  const teardown = useEffectEvent(() => {
    runRef.current++
    cleanupRef.current()
    const root = rootRef.current
    rootRef.current = null
    // Unmounting during a render is not allowed - do it right after.
    setTimeout(() => root?.unmount())
  })
  useEffect(() => {
    // Started from a timer: the first start changes state, which must not happen synchronously in an effect.
    const timer = setTimeout(firstStart)
    return () => {
      clearTimeout(timer)
      teardown()
    }
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <button onClick={() => void start()} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-800">
          {t.run}
        </button>
        <button
          onClick={() => {
            setBackend(backendStart)
            setFrontend(frontendStart)
            void start(backendStart, frontendStart)
          }}
          disabled={backend === backendStart && frontend === frontendStart}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {t.reset}
        </button>
        <span className={`ml-auto flex items-center gap-1.5 text-xs ${server ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}`}>
          <span className={`size-2 rounded-full ${server ? 'bg-emerald-500' : 'bg-rose-500'}`} aria-hidden="true" />
          {server ? 'localhost:8080' : '—'}
        </span>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="min-w-0 border-b border-slate-200 lg:border-r lg:border-b-0 dark:border-slate-800">
          <div className="border-b border-slate-200 px-4 py-1 font-mono text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">🍃 {t.backend}</div>
          <CodeEditor wert={backend} beiAenderung={setBackend} beiAusfuehren={(c) => void start(c, frontend)} label={t.editorBackend} sprache="spring" maxZeilen={22} />
        </div>
        <div className="min-w-0">
          <div className="border-b border-slate-200 px-4 py-1 font-mono text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">⚛️ {t.frontend}</div>
          <CodeEditor wert={frontend} beiAenderung={setFrontend} beiAusfuehren={(c) => void start(backend, c)} label={t.editorFrontend} sprache="react" maxZeilen={22} />
        </div>
      </div>

      <div className="grid border-t border-slate-200 lg:grid-cols-2 dark:border-slate-800">
        <div className="min-w-0 border-b border-slate-200 lg:border-r lg:border-b-0 dark:border-slate-800">
          <div className="px-4 py-1 text-2xs tracking-wider text-slate-500 uppercase dark:text-slate-400">{t.preview}</div>
          <div ref={previewRef} data-vorschau className="vorschau min-h-40 px-4 pb-4" />
          <Konsole zeilen={browserLines} />
        </div>
        <div className="min-w-0">
          <div className="px-4 py-1 text-2xs tracking-wider text-slate-500 uppercase dark:text-slate-400">{t.network}</div>
          <div ref={focusableWhenScrolling} className="max-h-56 overflow-auto px-4 pb-3">
            {network.length === 0 ? (
              <p className="text-xs text-slate-500 italic dark:text-slate-400">{t.noRequests}</p>
            ) : (
              <table className="w-full font-mono text-xs">
                <tbody>
                  {network.map((n, i) => (
                    <tr key={i} className={n.status === null || n.status >= 400 ? 'text-rose-600 dark:text-rose-400' : ''}>
                      <td className="pr-2 font-bold">{n.method}</td>
                      <td className="pr-2 break-all">
                        {n.url}
                        {n.body && <span className="block text-2xs text-slate-500 dark:text-slate-400">{n.body}</span>}
                      </td>
                      <td className="pr-2">{n.status ?? 'failed'}</td>
                      <td className="text-right text-slate-500 dark:text-slate-400">{n.millis} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <details>
            <summary className="cursor-pointer px-4 py-1 text-2xs tracking-wider text-slate-500 uppercase dark:text-slate-400">{t.serverLog}</summary>
            <Konsole zeilen={serverLines} />
          </details>
        </div>
      </div>
    </div>
  )
}
