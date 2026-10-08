import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { localized } from '../i18n/localized'
import { useSprache, useTexte } from '../i18n/LanguageContext'
import { useDelayedCheck } from './editorChecks'
import { sandboxDocument, type SandboxMessage, type TestResult } from './jsSandbox'
import { Console, EditorFrame, TestResults, TypeDiagnosticList, type Line } from './EditorFrame'
import type { JsProps } from './TryIt'
import { checkTsTypes, transpileTs, typeResults } from './tsRunner'
import { useEditor, useOnMount } from './useEditor'

/** JavaScript and TypeScript - the code runs in a sandboxed iframe (see jsSandbox.ts and tsLauf.ts). */

/** Type errors in the code itself - the markers while typing. */
const typeErrorsInCode = async (code: string) => (await checkTsTypes(code)).inCode

export function TryItJs(props: JsProps) {
  const { id, tests, typeTests, setup, preview, mode } = props
  const { theme } = useTheme()
  const { sprache: language } = useSprache()
  const t = useTexte()
  const { code, frame } = useEditor(props)
  const ts = mode === 'ts'
  const isExercise = Boolean(tests || typeTests)

  // Ein Lauf = fortlaufende Nummer + der (bei TypeScript schon übersetzte) Code zum Zeitpunkt des Klicks.
  // JS-Beispiele laufen sofort (Startwert), Übungen erst auf Knopfdruck (null).
  // TypeScript muss erst übersetzt werden - das geht nur asynchron, deshalb startet es im Effekt unten.
  const [currentRun, setCurrentRun] = useState<{ number: number; code: string; dark: boolean } | null>(() =>
    isExercise || ts ? null : { number: 1, code, dark: theme === 'dark' },
  )

  // TypeScript: Typprüfung kurz nach dem letzten Tastendruck (wie im React-Modus mit `typen`).
  const typeErrors = useDelayedCheck(code, ts ? typeErrorsInCode : null)
  // Übungen: Typprüfung samt Typ-Tests als zusätzliche Testergebnisse, pro Lauf.
  const [typeTestResults, setTypeTestResults] = useState<TestResult[] | null>(null)
  const compiledRef = useRef(0)
  const [lines, setLines] = useState<Line[]>([])
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [running, setRunning] = useState(!isExercise)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const testIframeRef = useRef<HTMLIFrameElement>(null)
  // Die Vorschau erscheint nur, wenn der Code wirklich etwas anzeigt - sonst reicht die Konsole.
  // Bewusst NICHT bei jedem Start zurückgesetzt: Ein DOM-Beispiel würde sonst bei jedem
  // Ausführen kurz zusammenklappen. Entschieden wird, sobald der neue Lauf "fertig" meldet.
  const [previewHasContent, setPreviewHasContent] = useState(false)
  const contentReported = useRef(false)
  const showPreview = Boolean(preview && previewHasContent)
  // Tests klicken und tippen im Dokument. Bei sichtbarer Vorschau laufen sie deshalb in
  // einem zweiten, unsichtbaren iframe - sonst würde die Vorschau von den Tests verändert.
  const separateTests = Boolean(preview && tests)

  // Die iframe-Dokumente sind abgeleitete Werte.
  const [dokument, testDocument] = useMemo(() => {
    if (!currentRun) return [null, null]
    // Testnamen sind zweisprachig - in die Sandbox geht nur der Text der aktuellen Sprache.
    const testsInLanguage = tests?.map((t) => ({ ...t, name: localized(t.name, language) }))
    const base = { runId: currentRun.number, code: currentRun.code, setup, dark: currentRun.dark, language }
    return separateTests
      ? [sandboxDocument(base), sandboxDocument({ ...base, tests: testsInLanguage })]
      : [sandboxDocument({ ...base, tests: testsInLanguage }), null]
  }, [currentRun, setup, tests, language, separateTests])

  function run(sourceCode: string) {
    setLines([])
    setResults(null)
    setRunning(true)
    const dark = theme === 'dark'
    if (!ts) {
      setCurrentRun((previous) => ({ number: (previous?.number ?? 0) + 1, code: sourceCode, dark }))
      return
    }
    setTypeTestResults(null)
    startTs(sourceCode, dark)
  }

  // TypeScript: prüfen und übersetzen, danach laufen lassen. Setzt State nur asynchron.
  function startTs(sourceCode: string, dark: boolean) {
    const number = ++compiledRef.current
    if (isExercise) {
      void checkTsTypes(sourceCode, typeTests).then((script) => {
        if (number === compiledRef.current) setTypeTestResults(typeResults(script, typeTests ?? [], language, t))
      })
    }
    void transpileTs(sourceCode).then((result) => {
      if (number !== compiledRef.current) return // inzwischen neu gestartet
      if ('error' in result) {
        // Syntaxfehler: Es gibt kein JavaScript, das laufen könnte.
        setCurrentRun(null)
        setLines([{ type: 'exception', text: result.error }])
        setRunning(false)
        return
      }
      setCurrentRun((previous) => ({ number: (previous?.number ?? 0) + 1, code: result.code, dark }))
    })
  }

  // TypeScript-Beispiele laufen wie JS-Beispiele sofort - nur eben nach dem Übersetzen.
  useOnMount(() => {
    if (ts && !isExercise) startTs(code, theme === 'dark')
  })

  // Bei TypeScript-Übungen zählen die Typen mit: erst wenn beides da ist, gibt es ein Ergebnis.
  const allResults =
    !ts || !isExercise
      ? results
      : !tests?.length
        ? typeTestResults
        : results && typeTestResults
          ? [...results, ...typeTestResults]
          : null

  // Nachrichten aus dem iframe einsammeln - nur vom aktuellen Lauf.
  useEffect(() => {
    if (!currentRun) return
    contentReported.current = false
    function onMessage(e: MessageEvent) {
      const message = e.data as SandboxMessage
      if (!message?.tryit || message.runId !== currentRun!.number) return
      // Aus dem Test-iframe zählen nur die Ergebnisse - Ausgaben kommen schon von der Vorschau.
      if (testIframeRef.current && e.source === testIframeRef.current.contentWindow) {
        if (message.type === 'tests') setResults(message.results)
        return
      }
      if (e.source !== iframeRef.current?.contentWindow) return

      switch (message.type) {
        case 'done':
          setRunning(false)
          if (message.content) contentReported.current = true
          setPreviewHasContent(contentReported.current)
          break
        case 'content':
          contentReported.current = true
          setPreviewHasContent(true)
          break
        case 'clear':
          setLines([])
          break
        case 'tests':
          setResults(message.results)
          break
        case 'exception': {
          const location = message.line && message.line > 0 ? ' ' + t.zeile(message.line) : ''
          setLines((previous) => [...previous, { type: 'exception', text: message.text + location }])
          setRunning(false)
          // Ein Fehler bricht den Lauf ab, "fertig" kommt dann nicht mehr.
          setPreviewHasContent(contentReported.current)
          break
        }
        default:
          setLines((previous) => [...previous, { type: message.type, text: message.text }])
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [currentRun, t])

  return (
    <EditorFrame
      {...frame}
      kind={ts ? 'TS' : 'JavaScript'}
      running={running}
      run={(c) => run(c ?? code)}
      markers={typeErrors ?? undefined}
    >
      {ts && <TypeDiagnosticList error={typeErrors} />}
      {currentRun && (
        // Das iframe bleibt immer eingehängt (der Code läuft darin), nur ohne Inhalt eben unsichtbar.
        <div className={showPreview ? 'border-b border-slate-200 dark:border-slate-800' : 'h-px overflow-hidden opacity-0'}>
          {showPreview && (
            <div className="px-4 pt-2 text-2xs tracking-wider text-slate-500 uppercase dark:text-slate-400">
              {t.vorschau}
            </div>
          )}
          <iframe
            key={currentRun.number}
            ref={iframeRef}
            srcDoc={dokument ?? ''}
            sandbox="allow-scripts allow-forms"
            title={t.ausgabe}
            className={showPreview ? 'h-48 w-full' : 'h-px w-px'}
          />
          {testDocument && (
            <iframe
              key={'tests' + currentRun.number}
              ref={testIframeRef}
              srcDoc={testDocument}
              sandbox="allow-scripts allow-forms"
              aria-hidden
              tabIndex={-1}
              className="absolute h-px w-px opacity-0"
            />
          )}
        </div>
      )}
      <TestResults id={id} results={allResults} />
      <Console
        lines={lines}
        emptyText={
          isExercise && !currentRun
            ? t.uebungStart
            : showPreview
              ? undefined
              : t.keineAusgabe
        }
      />
    </EditorFrame>
  )
}
