import { useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { useSprache, useTexte } from '../i18n/LanguageContext'
import { CodeBlock } from './CodeBlock'
import type { TestResult } from './jsSandbox'
import { Console, EditorFrame, TestResults } from './EditorFrame'
import { runTests, type TestReport } from './testRunner'
import type { TestProps } from './TryIt'
import { useEditor, useOnMount } from './useEditor'

/** Writing tests - Vitest and React Testing Library, run in the browser (see testLauf.ts). */

const TESTDATEI = 'App.test.jsx'

export function TryItTest(props: TestProps) {
  const { id, files = [], variants } = props
  const { sprache: language } = useSprache()
  const t = useTexte()
  const { code, frame } = useEditor(props)
  const [report, setReport] = useState<TestReport | null>(null)
  const [checks, setChecks] = useState<TestResult[] | null>(null)
  const [running, setRunning] = useState(false)
  const runRef = useRef(0)
  const isExercise = Boolean(variants?.length)

  async function run(sourceCode: string) {
    const number = ++runRef.current
    setRunning(true)
    setChecks(null)
    const own = { pfad: TESTDATEI, code: sourceCode }
    const next = await runTests([...files, own], TESTDATEI, language)
    if (number !== runRef.current) return
    setReport(next)

    if (variants?.length) {
      // Mutationstest: Gute Tests sind grün mit der richtigen Komponente und rot mit jeder kaputten.
      const passed = !next.error && next.cases.length > 0 && next.cases.every((f) => f.ok)
      const results: TestResult[] = [
        {
          name: t.testsGruen,
          ok: passed,
          message: next.error ?? (next.cases.length === 0 ? t.keineTests : (next.cases.find((f) => !f.ok)?.name ?? '')),
        },
      ]
      for (const variant of variants) {
        const withError = await runTests([...variant.files, own], TESTDATEI, language)
        const detected = Boolean(withError.error) || withError.cases.some((f) => !f.ok)
        results.push({
          name: t.fehlerErkannt(variant.name[language]),
          ok: passed && detected,
          message: detected ? '' : t.fehlerNichtErkannt,
        })
      }
      if (number !== runRef.current) return
      setChecks(results)
    }
    setRunning(false)
  }

  // Beispiele laufen sofort, Übungen erst auf Knopfdruck - wie bei den anderen Editoren.
  useOnMount(() => {
    if (!isExercise) void run(code)
  })

  return (
    <EditorFrame
      {...frame}
      kind="Test"
      running={running}
      run={(c) => void run(c ?? code)}
      above={files.map((d) => (
        <div key={d.pfad} className="border-b border-slate-200 p-3 dark:border-slate-800">
          <CodeBlock code={d.code} title={`${d.pfad} (${t.nurLesen})`} />
        </div>
      ))}
    >
      {!report ? (
        <p className="flex items-center gap-1.5 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
          {running && <Icon name="uhr" className="size-3.5" />}
          {running ? t.testsLaufen : t.reactUebungStart}
        </p>
      ) : (
        <TestOutput report={report} running={running} />
      )}
      {checks && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <TestResults id={id} results={checks} />
        </div>
      )}
      <Console lines={report?.logs.map((text) => ({ type: 'log' as const, text })) ?? []} />
    </EditorFrame>
  )
}

/** Ausgabe wie im Terminal von Vitest: ✓/✗ pro Test, Dauer, Fehlermeldung, Zusammenfassung. */
function TestOutput({ report, running }: { report: TestReport; running: boolean }) {
  const t = useTexte()
  const passed = report.cases.filter((f) => f.ok).length
  const failed = report.cases.length - passed

  return (
    <div className={`bg-slate-900 px-4 py-3 font-mono text-code leading-5 text-slate-200 transition-opacity dark:bg-black/40 ${running ? 'opacity-60' : ''}`}>
      <div className="mb-1 text-2xs tracking-wider text-slate-400 uppercase">{t.deineTests}</div>
      {report.error ? (
        <div className="text-rose-300">
          <Icon name="kreisKreuz" className="mr-1.5 inline size-3.5 align-[-2px]" />
          {t.testDateiFehler}
          <div className="mt-1 whitespace-pre-wrap">{report.error}</div>
        </div>
      ) : report.cases.length === 0 ? (
        <div className="text-slate-400 italic">{t.keineTests}</div>
      ) : (
        <>
          <ul>
            {report.cases.map((f, i) => (
              <li key={i}>
                <span className={f.ok ? 'text-emerald-400' : 'text-rose-400'}>{f.ok ? '✓' : '✗'}</span> {f.name}{' '}
                <span className="text-slate-400">{f.duration}ms</span>
                {f.message && <div className="mb-1 ml-4 whitespace-pre-wrap text-rose-300">→ {f.message}</div>}
              </li>
            ))}
          </ul>
          <div className={`mt-2 font-semibold ${failed ? 'text-rose-400' : 'text-emerald-400'}`}>
            Tests: {t.testZusammenfassung(passed, failed)} ({report.cases.length})
          </div>
        </>
      )}
    </div>
  )
}
