import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Icon } from '../components/Icon'
import { useSprache, useTexte } from '../i18n/LanguageContext'
import { useDelayedCheck } from './editorChecks'
import type { TestResult } from './jsSandbox'
import { ErrorPanel, Console, EditorFrame, TestResults, TypeDiagnosticList, type Line } from './EditorFrame'
import { formatieren, compile, type Log } from './reactCompile'
import { runReactTests } from './reactTestKit'
import { tailwindForPreview } from './tailwind'
import type { ReactProps } from './TryIt'
import { checkTypes } from './typeCheck'
import { useEditor } from './useEditor'

/** React - the JSX is compiled and rendered into a root of its own (see reactKompilieren.ts). */

export function TryItReact(props: ReactProps) {
  const { id, tests, typed } = props
  const { sprache: language } = useSprache()
  const t = useTexte()
  const { code, frame } = useEditor(props)

  // Typprüfung kurz nach dem letzten Tastendruck - wie die roten Schlangenlinien in VS Code.
  const typeErrors = useDelayedCheck(code, typed ? checkTypes : null)
  const [lines, setLines] = useState<Line[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<Root | null>(null)
  const runRef = useRef(0)
  // Stoppt die Timer des vorherigen Laufs (siehe kompilieren).
  const cleanupRef = useRef(() => {})

  // Logs, die WÄHREND des Renderns der Vorschau entstehen, dürfen nicht sofort
  // State dieser Komponente setzen - deshalb sammeln und kurz danach übernehmen.
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

  // Übersetzt den Code und rendert ihn in die Vorschau-Wurzel (setzt selbst keinen State).
  const render = useCallback(
    async (sourceCode: string) => {
      const number = ++runRef.current
      buffer.current = []
      const root = rootRef.current
      if (!root) return

      try {
        // Tailwind-Klassen aus dem Editor sollen auch wirken, wenn sie sonst nirgends im Projekt stehen.
        tailwindForPreview(sourceCode)
        const { App, aufraeumen: cleanup } = await compile(sourceCode, log, language)
        // Inzwischen neu gestartet oder die Wurzel wurde abgebaut? Dann verwerfen.
        if (number !== runRef.current || rootRef.current !== root) return cleanup()
        cleanupRef.current()
        cleanupRef.current = cleanup
        // key={nummer}: jeder Lauf startet mit frischem State.
        // flushSync: the old preview is gone before the tests start (see ausfuehren).
        flushSync(() =>
          root.render(
            <ErrorBoundary key={number} fallback={(f) => <ErrorPanel text={`${f.name}: ${f.message}`} title={t.fehlerBeimRendern} />}>
              <App />
            </ErrorBoundary>,
          ),
        )
      } catch (error) {
        if (number !== runRef.current || rootRef.current !== root) return
        root.render(<ErrorPanel text={formatieren(error)} title={t.nichtUebersetzbar} />)
      }
    },
    [log, language, t],
  )

  // Tests laufen nur auf Knopfdruck (nicht beim ersten Anzeigen) - wie bei den JS-Übungen.
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [testsRunning, setTestsRunning] = useState(false)
  const testRunRef = useRef(0)

  function run(sourceCode: string) {
    setLines([])
    const preview = render(sourceCode)
    if (!tests?.length) return

    const number = ++testRunRef.current
    setResults(null)
    setTestsRunning(true)
    // The tests start once the new preview is in place. Before that, the old one may still be
    // running - and a test that mocks fetch would count its requests, too.
    const testRun = preview.then(() => runReactTests(sourceCode, tests, language))
    void Promise.all([testRun, typed ? checkTypes(sourceCode) : null]).then(
      ([next, error]) => {
        if (number !== testRunRef.current) return // inzwischen neu gestartet
        // Bei TypeScript-Übungen gehören saubere Typen dazu - als zusätzlicher Test.
        if (error) {
          const first = error[0]
          next = [
            ...next,
            {
              name: t.keineTypfehler,
              ok: error.length === 0,
              message: first ? `${t.typfehlerZeile(first.line)}: ${first.text}` : '',
            },
          ]
        }
        setResults(next)
        setTestsRunning(false)
      },
    )
  }

  // useEffectEvent liest immer den aktuellen `code`, ohne selbst eine Dependency zu sein.
  const firstRun = useEffectEvent(() => void render(code))

  // Eigene React-Wurzel für die Vorschau: Fehler und State der Lernenden bleiben
  // vom Rest der Seite getrennt, und es gibt kein doppeltes StrictMode-Rendern.
  useEffect(() => {
    const element = document.createElement('div')
    containerRef.current!.appendChild(element)
    // Formulare ohne eigenen Handler dürfen nicht die ganze Lernseite neu laden.
    // Der Listener liegt außerhalb der React-Wurzel und läuft deshalb nach deren Handlern.
    const noReload = (e: Event) => e.preventDefault()
    containerRef.current!.addEventListener('submit', noReload)
    const root = createRoot(element, {
      onCaughtError: (error) => log('error', formatieren(error)),
    })
    rootRef.current = root
    firstRun()

    const container = containerRef.current!
    return () => {
      container.removeEventListener('submit', noReload)
      rootRef.current = null
      const cleanup = cleanupRef.current
      // Nicht synchron während Reacts eigenem Commit abbauen.
      setTimeout(() => {
        root.unmount()
        element.remove()
        cleanup()
      })
    }
  }, [log])

  return (
    <EditorFrame
      {...frame}
      kind={typed ? 'TypeScript' : 'React'}
      running={testsRunning}
      run={(c) => run(c ?? code)}
      markers={typeErrors ?? undefined}
    >
      {typed && <TypeDiagnosticList error={typeErrors} />}
      <div className="px-4 pt-2 text-2xs tracking-wider text-slate-500 uppercase dark:text-slate-400">{t.vorschau}</div>
      <div ref={containerRef} data-preview className="preview min-h-16 px-4 pt-1 pb-4" />
      {tests?.length ? (
        <div className="border-t border-slate-200 dark:border-slate-800">
          {results ? (
            <TestResults id={id} results={results} />
          ) : (
            <p className="flex items-center gap-1.5 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              {testsRunning && <Icon name="uhr" className="size-3.5" />}
              {testsRunning ? t.testsLaufen : t.reactUebungStart}
            </p>
          )}
        </div>
      ) : null}
      <Console lines={lines} />
    </EditorFrame>
  )
}
