import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Icon } from '../components/Icon'
import { KapitelChip } from '../components/ChapterLink'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useSprache, useTexte, type Zweisprachig } from '../i18n/LanguageContext'
import { CodeEditor } from './CodeEditor'
import { hash } from './source'
import { tailwindForPreview } from './tailwind'
import { formatieren, compileProject, type Log } from './reactCompile'
import { useDelayedCheck } from './editorChecks'
import { checkProjectTypes } from './typeCheck'
import { ErrorPanel, Console, TypeDiagnosticList, type Line } from './EditorFrame'
import { focusableWhenScrolling } from '../components/scrollFocus'

/**
 * Werkstatt: ein ganzes React-Projekt aus mehreren Dateien.
 *
 * Links die Dateien, in der Mitte der Editor der gewählten Datei, daneben bzw.
 * darunter die laufende App. Nach jeder Änderung wird das Projekt nach einer
 * kurzen Pause neu übersetzt (siehe kompilierenProjekt). Lässt sich der Code
 * nicht übersetzen, läuft die App im letzten funktionierenden Stand weiter.
 */

export type WorkbenchFile = {
  /** Pfad im Projekt, z. B. "components/Button.jsx" - so wird er auch importiert. */
  pfad: string
  code: string
  /** Was in dieser Datei passiert. */
  text: Zweisprachig
  /** Kapitel, in denen die verwendeten Konzepte erklärt werden. */
  kapitel: string[]
}

type Props = {
  /** Schlüssel für den gespeicherten Code. */
  id: string
  title: string
  files: WorkbenchFile[]
  /** Datei mit dem default-Export App. */
  entry: string
  /** TypeScript-Projekt: zusätzlich echte Typprüfung für die gerade offene Datei. */
  typed?: boolean
}

const PAUSE_MS = 700

export function Workbench({ id, title, files, entry, typed }: Props) {
  const t = useTexte()
  const { sprache: language } = useSprache()

  const startCode = useMemo(() => Object.fromEntries(files.map((d) => [d.pfad, d.code])), [files])
  const [saved, setSaved] = useLocalStorage<Record<string, string>>(
    `werkstatt:${id}:${hash(JSON.stringify(startCode))}`,
    startCode,
  )
  // Fehlt eine Datei im Gespeicherten, gilt ihr Startcode.
  const code = useMemo(() => ({ ...startCode, ...saved }), [startCode, saved])

  const [active, setActive] = useState(entry)
  const [fullscreen, setFullscreen] = useState(false)
  const [lines, setLines] = useState<Line[]>([])
  const [compileError, setCompileError] = useState<string | null>(null)

  const activeFile = files.find((d) => d.pfad === active) ?? files[0]
  const changed = (pfad: string) => code[pfad] !== startCode[pfad]
  const anythingChanged = files.some((d) => changed(d.pfad))

  // Dateien nach Ordnern gruppieren - in der Reihenfolge, in der sie vorkommen.
  const folder = useMemo(() => {
    const groups = new Map<string, WorkbenchFile[]>()
    for (const file of files) {
      const name = file.pfad.includes('/') ? file.pfad.slice(0, file.pfad.lastIndexOf('/')) : ''
      groups.set(name, [...(groups.get(name) ?? []), file])
    }
    return [...groups]
  }, [files])

  // --- Vorschau: eigene React-Wurzel, wie bei TryIt ---------------------------------------
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<Root | null>(null)
  const runRef = useRef(0)
  const cleanupRef = useRef(() => {})

  // Logs während des Renderns sammeln und kurz danach übernehmen (siehe TryIt).
  const buffer = useRef<Line[]>([])
  const log = useCallback<Log>((type, text) => {
    buffer.current.push({ type, text })
    if (buffer.current.length === 1) {
      setTimeout(() => {
        const next = buffer.current
        buffer.current = []
        setLines((previous) => [...previous, ...next].slice(-200))
      })
    }
  }, [])

  const render = useCallback(
    async (sources: Record<string, string>) => {
      const number = ++runRef.current
      const root = rootRef.current
      if (!root) return

      try {
        const projekt = Object.entries(sources).map(([pfad, code]) => ({ pfad, code }))
        tailwindForPreview(Object.values(sources).join('\n'))
        const { App, aufraeumen: cleanup } = await compileProject(projekt, entry, log, language)
        if (number !== runRef.current || rootRef.current !== root) return cleanup()
        cleanupRef.current()
        cleanupRef.current = cleanup
        buffer.current = []
        setLines([])
        setCompileError(null)
        root.render(
          <ErrorBoundary key={number} fallback={(f) => <ErrorPanel text={`${f.name}: ${f.message}`} title={t.fehlerBeimRendern} />}>
            <App />
          </ErrorBoundary>,
        )
      } catch (error) {
        if (number !== runRef.current || rootRef.current !== root) return
        // Die alte App bleibt stehen - nur der Fehler wird angezeigt.
        setCompileError(formatieren(error))
      }
    },
    [entry, log, language, t],
  )

  const firstRun = useEffectEvent(() => void render(code))

  useEffect(() => {
    const container = containerRef.current!
    const element = document.createElement('div')
    element.style.height = '100%'
    container.appendChild(element)
    const noReload = (e: Event) => e.preventDefault()
    container.addEventListener('submit', noReload)
    const root = createRoot(element, {
      onCaughtError: (error) => log('error', formatieren(error)),
    })
    rootRef.current = root
    // oxlint-disable-next-line react/set-state-in-effect -- rendern setzt State erst nach dem await, nicht synchron.
    firstRun()

    return () => {
      container.removeEventListener('submit', noReload)
      rootRef.current = null
      const cleanup = cleanupRef.current
      setTimeout(() => {
        root.unmount()
        element.remove()
        cleanup()
      })
    }
  }, [log])

  // Nach einer Tipp-Pause automatisch neu übersetzen. Der erste Lauf passiert oben.
  const lastCode = useRef(code)
  useEffect(() => {
    if (lastCode.current === code) return
    lastCode.current = code
    const timer = setTimeout(() => void render(code), PAUSE_MS)
    return () => clearTimeout(timer)
  }, [code, render])

  // Typprüfung der offenen Datei - kurz nach dem letzten Tastendruck, wie in VS Code.
  const check = useCallback(
    async (currentFiles: Record<string, string>) => {
      const projekt = Object.entries(currentFiles).map(([pfad, sourceCode]) => ({ pfad, code: sourceCode }))
      return { pfad: active, error: await checkProjectTypes(projekt, active) }
    },
    [active],
  )
  const typeCheck = useDelayedCheck(code, typed ? check : null)
  // A result for another file does not apply to the open one.
  const typeErrors = typeCheck?.pfad === active ? typeCheck.error : null

  // Im Vollbild soll die Lernseite dahinter nicht mitscrollen.
  useEffect(() => {
    if (!fullscreen) return
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = before
    }
  }, [fullscreen])

  function change(pfad: string, next: string) {
    setSaved((previous) => ({ ...startCode, ...previous, [pfad]: next }))
  }

  // --- Oberfläche ---------------------------------------------------------------------------
  const button =
    'inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800'

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-50 flex flex-col overflow-auto bg-white lg:overflow-hidden dark:bg-slate-900'
          : 'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
      }
    >
      {/* Kopfzeile */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="werkzeug" className="size-4 text-brand-600 dark:text-brand-400" />
          <span>
            {t.werkstatt}
            <span className="font-normal text-slate-500 dark:text-slate-400"> · {title}</span>
          </span>
        </h3>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={() => setSaved(startCode)} disabled={!anythingChanged} className={button}>
            <Icon name="zuruecksetzen" className="size-3.5" />
            {t.allesZuruecksetzen}
          </button>
          <button onClick={() => setFullscreen((v) => !v)} className={button}>
            <Icon name={fullscreen ? 'verkleinern' : 'vergroessern'} className="size-3.5" />
            {fullscreen ? t.vollbildBeenden : t.vollbild}
          </button>
        </div>
      </div>

      <div
        className={
          fullscreen
            ? 'grid min-h-0 flex-1 lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]'
            : 'grid md:grid-cols-[12rem_minmax(0,1fr)]'
        }
      >
        {/* Dateien */}
        <nav
          aria-label={t.dateien}
          className="border-b border-slate-200 bg-slate-50 md:border-r md:border-b-0 lg:overflow-y-auto dark:border-slate-800 dark:bg-slate-950/40"
        >
          <label className="block p-3 md:hidden">
            <span className="sr-only">{t.dateiWaehlen}</span>
            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {files.map((d) => (
                <option key={d.pfad} value={d.pfad}>
                  {d.pfad}
                  {changed(d.pfad) ? ` • ${t.geaendert}` : ''}
                </option>
              ))}
            </select>
          </label>
          <div className="hidden py-2 md:block">
            <p className="px-3 pb-1 text-2xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">{t.dateien}</p>
            {folder.map(([name, content]) => (
              <div key={name}>
                {name && (
                  <p className="flex items-center gap-1.5 px-3 pt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                    <Icon name="ordner" className="size-3.5" />
                    {name}
                  </p>
                )}
                <ul>
                  {content.map((d) => {
                    const fileName = d.pfad.slice(d.pfad.lastIndexOf('/') + 1)
                    return (
                      <li key={d.pfad}>
                        <button
                          onClick={() => setActive(d.pfad)}
                          aria-current={d.pfad === active ? 'true' : undefined}
                          title={d.pfad}
                          className={`flex w-full items-center gap-1.5 py-1 pr-3 text-left font-mono text-xs transition ${
                            name ? 'pl-7' : 'pl-3'
                          } ${
                            d.pfad === active
                              ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{fileName}</span>
                          {changed(d.pfad) && (
                            <span className="ml-auto size-1.5 shrink-0 rounded-full bg-amber-500" title={t.geaendert} />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Editor */}
        <div className={fullscreen ? 'flex min-w-0 flex-col lg:min-h-0 lg:border-r lg:border-slate-200 lg:dark:border-slate-800' : 'min-w-0'}>
          <div className="space-y-1.5 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold">{activeFile.pfad}</span>
              <button
                onClick={() => change(activeFile.pfad, startCode[activeFile.pfad])}
                disabled={!changed(activeFile.pfad)}
                className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 disabled:opacity-40 dark:text-slate-400 dark:hover:text-white"
              >
                <Icon name="zuruecksetzen" className="size-3" />
                {t.dateiZuruecksetzen}
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{activeFile.text[language]}</p>
            {activeFile.kapitel.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                {t.mehrDazu}
                {activeFile.kapitel.map((k) => (
                  <KapitelChip key={k} id={k} />
                ))}
              </div>
            )}
          </div>
          <div className={fullscreen ? 'min-h-0 flex-1 overflow-auto' : ''}>
            <CodeEditor
              key={activeFile.pfad}
              value={code[activeFile.pfad]}
              onChange={(next) => change(activeFile.pfad, next)}
              onRun={() => void render(code)}
              label={`${t.codeEditor}: ${activeFile.pfad}`}
              language="react"
              maxLines={fullscreen ? 1000 : 26}
              markers={typeErrors ?? undefined}
            />
          </div>
          {typed && <TypeDiagnosticList error={typeErrors} />}
          <p className="border-t border-slate-200 px-4 py-1.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {t.werkstattHinweis}
          </p>
        </div>

        {/* Laufende App */}
        <div
          className={
            fullscreen
              ? 'flex min-w-0 flex-col border-t border-slate-200 lg:min-h-0 lg:border-t-0 dark:border-slate-800'
              : 'border-t border-slate-200 md:col-span-2 dark:border-slate-800'
          }
        >
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
            <span className="flex gap-1" aria-hidden>
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="flex-1 truncate rounded-md bg-white px-2 py-0.5 text-center text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              {t.liveApp} · {title}
            </span>
          </div>
          {compileError && (
            <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
              <p className="flex items-center gap-1.5 font-semibold">
                <Icon name="kreisKreuz" className="size-4" />
                {t.nichtUebersetzbar}
              </p>
              <pre className="mt-1 font-mono text-xs whitespace-pre-wrap">{compileError}</pre>
              <p className="mt-1 text-xs opacity-80">{t.letzterStand}</p>
            </div>
          )}
          <div ref={containerRef} data-preview className={fullscreen ? 'h-144 lg:h-auto lg:min-h-0 lg:flex-1' : 'h-144'} />
          <div ref={focusableWhenScrolling} className={fullscreen ? 'max-h-40 shrink-0 overflow-y-auto' : 'max-h-40 overflow-y-auto'}>
            <Console lines={lines} />
          </div>
        </div>
      </div>
    </div>
  )
}
