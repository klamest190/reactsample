import { useEffect, useState, type ReactNode, type Ref } from 'react'
import { Icon } from '../components/Icon'
import { useFortschritt } from '../context/ProgressContext'
import { useSprache, useTexte } from '../i18n/LanguageContext'
import { CodeBlock } from './CodeBlock'
import { CodeEditor, type EditorControl } from './CodeEditor'
import { KINDS, EDITOR_LANGUAGES, type Kind } from './modes'
import { Text } from './Text'
import type { TestResult } from './jsSandbox'
import type { TypeDiagnostic } from './typeCheck'

/**
 * The parts every editor shares: the frame around it (header, task, editor, buttons,
 * tips, solution) and the blocks below it (console, test results, type errors).
 * The editors themselves live in TryIt*.tsx - TryIt.tsx picks one by `modus`.
 */

export type Line = { type: 'log' | 'info' | 'warn' | 'error' | 'exception'; text: string }

// Abzeichen und Editorsprache je Art stehen in modi.ts (ARTEN).

export function EditorFrame({
  kind,
  runLabel,
  title,
  task,
  code,
  setCode,
  startCode,
  solution,
  hints,
  run,
  running,
  markers,
  above,
  editorRef,
  heading,
  maxLines,
  children,
}: {
  editorRef?: Ref<EditorControl>
  heading?: string
  maxLines?: number
  kind: Kind
  /** Label of the run button, e.g. "docker build" (default: Ausführen). The play icon is added in front. */
  runLabel?: string
  markers?: TypeDiagnostic[]
  /** Inhalt zwischen Aufgabe und Editor, z. B. nur lesbare Dateien. */
  above?: ReactNode
  title?: string
  task?: ReactNode
  code: string
  setCode: (code: string) => void
  startCode: string
  solution?: string
  hints?: { de: string[]; en: string[] }
  run: (code?: string) => void
  running?: boolean
  children: ReactNode
}) {
  const t = useTexte()
  const { sprache: language } = useSprache()
  const [showSolution, setShowSolution] = useState(false)
  // Wie viele Tipps schon aufgedeckt sind - immer der Reihe nach.
  const [hintCount, setHintCount] = useState(0)
  const hintList = hints?.[language] ?? []
  const isExercise = Boolean(task)

  return (
    // data-running: lets the page test (scripts/e2e-pages.mjs) wait for running editors.
    <div data-running={running || undefined} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <Icon
            name={heading ? 'spielwiese' : isExercise ? 'hantel' : 'kolben'}
            className="size-4 text-brand-600 dark:text-brand-400"
          />
          <span className="min-w-0">
            {heading ?? (isExercise ? t.uebung : t.probierSelbst)}
            {title && <span className="font-normal text-slate-500 dark:text-slate-400"> · {title}</span>}
          </span>
        </h3>
        <span className={`rounded-full px-2 py-0.5 font-mono text-2xs font-semibold ${KINDS[kind].classes}`}>
          {KINDS[kind].text}
        </span>
      </div>

      {task && (
        <div className="border-b border-slate-200 bg-brand-50 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-brand-700/15 dark:text-slate-200">
          {task}
        </div>
      )}

      {above}

      <CodeEditor
        value={code}
        onChange={setCode}
        onRun={(c) => run(c)}
        label={`${t.codeEditor}${title ? ': ' + title : ''}`}
        language={KINDS[kind].language}
        markers={markers}
        control={editorRef}
        maxLines={maxLines}
      />

      <div className="flex flex-wrap items-center gap-2 border-y border-slate-200 px-4 py-2 dark:border-slate-800">
        <button
          onClick={() => run()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800"
        >
          <Icon name="abspielen" className="size-3.5" />
          {runLabel ?? t.ausfuehren}
        </button>
        <button
          onClick={() => {
            setCode(startCode)
            run(startCode)
          }}
          disabled={code === startCode}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Icon name="zuruecksetzen" className="size-3.5" />
          {t.zuruecksetzen}
        </button>
        {hintList.length > 0 && (
          <button
            onClick={() => setHintCount((n) => Math.min(n + 1, hintList.length))}
            disabled={hintCount >= hintList.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-900 transition hover:bg-amber-100 disabled:opacity-40 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            <Icon name="gluehbirne" className="size-3.5" />
            {t.tipp(Math.min(hintCount + 1, hintList.length), hintList.length)}
          </button>
        )}
        {solution && (
          <button
            onClick={() => setShowSolution((z) => !z)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Icon name="schluessel" className="size-3.5" />
            {showSolution ? t.loesungVerbergen : t.loesungZeigen}
          </button>
        )}
        <span className="ml-auto hidden text-xs text-slate-500 sm:inline dark:text-slate-400">
          {running ? t.laeuft : t.tastenHinweis}
        </span>
      </div>

      {hintCount > 0 && (
        <ol className="space-y-1 border-b border-slate-200 bg-amber-50/60 px-4 py-3 text-sm dark:border-slate-800 dark:bg-amber-950/30">
          {hintList.slice(0, hintCount).map((hint, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex shrink-0 items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                <Icon name="gluehbirne" className="size-3.5" />
                {i + 1}.
              </span>
              <span>
                <Text text={hint} />
              </span>
            </li>
          ))}
        </ol>
      )}

      {showSolution && solution && (
        <div className="space-y-2 border-b border-slate-200 p-4 dark:border-slate-800">
          <CodeBlock code={solution} title={t.musterloesung} language={EDITOR_LANGUAGES[KINDS[kind].language].highlight} />
          <button
            onClick={() => {
              setCode(solution)
              run(solution)
            }}
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {t.loesungUebernehmen}
          </button>
        </div>
      )}

      {children}
    </div>
  )
}

export function Console({ lines, emptyText }: { lines: Line[]; emptyText?: string }) {
  const t = useTexte()
  const colors = {
    log: 'text-slate-100',
    info: 'text-sky-300',
    warn: 'text-amber-300',
    error: 'text-rose-300',
    exception: 'text-rose-300',
  }

  if (lines.length === 0 && !emptyText) return null

  return (
    <div className="bg-slate-900 px-4 py-3 font-mono text-code leading-5 dark:bg-black/40">
      <div className="mb-1 text-2xs tracking-wider text-slate-400 uppercase">{t.konsole}</div>
      {lines.length === 0 ? (
        <div className="text-slate-400 italic">{emptyText}</div>
      ) : (
        lines.map((z, i) => (
          <div key={i} className={`flex gap-1.5 ${colors[z.type]}`}>
            {z.type === 'exception' ? (
              <Icon name="kreisKreuz" className="mt-0.75 size-3.5" />
            ) : z.type === 'warn' ? (
              <Icon name="warnung" className="mt-0.75 size-3.5" />
            ) : (
              <span aria-hidden className="w-3.5 shrink-0 text-center text-slate-500 dark:text-slate-400">›</span>
            )}
            <span className="min-w-0 wrap-break-word whitespace-pre-wrap">{z.text}</span>
          </div>
        ))
      )}
    </div>
  )
}

export function TestResults({ id, results }: { id?: string; results: TestResult[] | null }) {
  const t = useTexte()
  const { uebungGeloest: exerciseSolved } = useFortschritt()
  const passed = results?.filter((e) => e.ok).length ?? 0
  const alle = results !== null && results.length > 0 && passed === results.length

  // Einmal grün heißt gelöst - das merken wir uns, damit die Übung beim
  // nächsten Besuch als erledigt zu sehen ist.
  useEffect(() => {
    if (id && alle) exerciseSolved(id)
  }, [id, alle, exerciseSolved])

  // Erst NACH den Hooks aussteigen - die Reihenfolge der Hooks muss konstant bleiben.
  if (!results) return null

  return (
    // data-test-result: read by the page test - every exercise must turn green with its solution.
    <div data-test-result={alle ? 'pass' : 'fail'} className="space-y-1.5 px-4 py-3 text-sm">
      <p
        className={`flex items-center gap-1.5 font-semibold ${alle ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}
      >
        {alle && <Icon name="pokal" className="size-4" />}
        {alle
          ? t.alleTestsBestanden(results.length)
          : t.testsBestanden(passed, results.length)}
      </p>
      <ul className="space-y-1">
        {results.map((e) => (
          <li key={e.name} className="flex gap-2">
            <Icon
              name={e.ok ? 'kreisHaken' : 'kreisKreuz'}
              className={`mt-0.5 size-4 ${e.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
            />
            <span className="sr-only">{e.ok ? t.testOk : t.testFehler}</span>
            <span>
              {e.name}
              {e.message && (
                <span className="block font-mono text-xs text-rose-600 dark:text-rose-400">
                  {e.message}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Ergebnis der Typprüfung unter dem Editor. `null` = Prüfung läuft noch. */
export function TypeDiagnosticList({ error }: { error: TypeDiagnostic[] | null }) {
  const t = useTexte()
  if (!error) {
    return <p className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-2 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <Icon name="uhr" className="size-3.5" />
        {t.typpruefungLaeuft}
      </p>
  }
  if (error.length === 0) {
    return (
      <p className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-slate-800 dark:text-emerald-400">
        <Icon name="kreisHaken" className="size-3.5" />
        {t.typpruefung}: {t.keineTypfehler}
      </p>
    )
  }
  return (
    <div className="border-b border-rose-200 bg-rose-50/70 px-4 py-2.5 text-sm dark:border-rose-900 dark:bg-rose-950/30">
      <p className="font-semibold text-rose-800 dark:text-rose-300">
        {t.typpruefung}: {t.typfehler(error.length)}
      </p>
      <ul className="mt-1 space-y-1">
        {error.map((f, i) => (
          <li key={i} className="flex gap-2 font-mono text-xs leading-5 text-rose-900 dark:text-rose-200">
            <span className="shrink-0 text-rose-700 tabular-nums dark:text-rose-500">{t.typfehlerZeile(f.line)}</span>
            <span className="whitespace-pre-wrap">
              {f.text} <span className="text-slate-600 dark:text-rose-400">TS{f.code}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">{t.typfehlerHinweis}</p>
    </div>
  )
}

// Wird in der separaten Vorschau-Wurzel gerendert - dort gibt es keinen Sprach-Context,
// deshalb kommt der Titel als Prop.
export function ErrorPanel({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
      <p className="flex items-center gap-1.5 font-semibold">
        <Icon name="kreisKreuz" className="size-4" />
        {title}
      </p>
      <pre className="mt-1 font-mono text-xs whitespace-pre-wrap">{text}</pre>
    </div>
  )
}
