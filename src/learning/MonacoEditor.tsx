import Editor, { type OnMount } from '@monaco-editor/react'
import type * as Monaco from 'monaco-editor'
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useSprache, useTexte } from '../i18n/LanguageContext'
import type { EditorControl } from './CodeEditor'
import { planInsertions, type Step } from './insertion'
import { monacoReady } from './monaco/setup'
import { EXTENSIONS, MONACO_LANGUAGES, forgetModel, rememberModel } from './monaco/languages'
import { THEME_DARK, THEME_LIGHT } from './monaco/themes'
import type { EditorLanguage } from './modes'
import type { TypeDiagnostic } from './typeCheck'

/**
 * The playground's editor - Monaco, the same editor VS Code uses.
 *
 * It offers exactly the same thing to the outside as the own `CodeEditor` (same props,
 * same `EditorControl`), so that `EditorFrame` can swap the two. The chapters keep the own
 * editor: it is there immediately, Monaco needs a good megabyte and would otherwise be
 * pulled into every one of the ~60 chapter pages.
 *
 * What Monaco brings that the own editor cannot: real IntelliSense from the types (hover,
 * signature help, members after the dot), multiple cursors, bracket matching, find and
 * replace. The course's suggestions come on top - see monaco/completion.ts.
 */

const LINE_HEIGHT = 20
const PADDING = 12

type Props = {
  /** Unique per editor - the name of the Monaco model is derived from it. */
  id: string
  value: string
  onChange: (value: string) => void
  /** Strg+Enter. Receives the current text - important right after an insertion. */
  onRun?: (code: string) => void
  label: string
  language: EditorLanguage
  /** From this many lines on the editor scrolls instead of growing further. */
  maxLines?: number
  /** Type errors: red squiggle, message in the tooltip. */
  markers?: TypeDiagnostic[]
  control?: Ref<EditorControl>
  /** In the workspace layout the editor fills its panel instead of growing with the code. */
  fill?: boolean
  /** For the status bar: cursor position, 1-based. */
  onCursor?: (at: { line: number; column: number }) => void
  /** Show the minimap (toggle in the status bar). */
  minimap?: boolean
}

export function MonacoEditor({
  id,
  value,
  onChange,
  onRun,
  label,
  language,
  maxLines = 28,
  markers = [],
  control,
  fill,
  onCursor,
  minimap = false,
}: Props) {
  const { theme } = useTheme()
  const { sprache } = useSprache()
  const t = useTexte()
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof Monaco | null>(null)
  // URI of the model - needed to deregister it on teardown.
  const uriRef = useRef<string | null>(null)
  // Has the person clicked or typed themselves since the last insertion? That decides
  // whether a building block goes to the cursor (see course/playground/places.ts).
  const manualCursor = useRef(false)
  // Monaco's commands are bound once, but `onRun` may change. So the current version lives
  // in a ref, written inside an effect rather than during render.
  // The text we last reported ourselves. Everything else is an outside change.
  const lastEmitted = useRef(value)
  const runRef = useRef(onRun)
  useEffect(() => {
    runRef.current = onRun
  })

  const [mounted, setMounted] = useState(false)
  // Set Monaco up first (local copy instead of CDN, themes, suggestions), then render.
  // Without that `@monaco-editor/react` fetches Monaco from the network itself.
  const [prepared, setPrepared] = useState(false)
  useEffect(() => {
    let active = true
    void monacoReady().then(() => {
      if (active) setPrepared(true)
    })
    return () => {
      active = false
    }
  }, [])

  const path = `file:///playground/${id}.${EXTENSIONS[language]}`

  // Same height as the own editor, so swapping them is not jarring.
  const lines = value.split('\n').length
  const height = Math.min(Math.max(lines, 4), maxLines) * LINE_HEIGHT + 2 * PADDING

  const onEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    const model = editor.getModel()
    if (model) {
      uriRef.current = model.uri.toString()
      rememberModel(uriRef.current, { language, ui: sprache, infoInCode: t.imCode })
    }

    // Strg+Enter runs - with the text from the model, not from React state: right after a
    // building block the state only catches up on the next render.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runRef.current?.(editor.getValue())
    })

    // In this app Strg+K belongs to the search (App.tsx). Monaco would otherwise claim it
    // as a chord prefix and swallow it - so hand it back to the window here.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    })

    editor.onDidChangeCursorPosition((e) => {
      onCursor?.({ line: e.position.lineNumber, column: e.position.column })
      // Source 'mouse' or 'keyboard' means: it was the person themselves.
      if (e.source === 'mouse' || e.source === 'keyboard') manualCursor.current = true
    })

    setMounted(true)
  }

  // Remove the model from the registry on teardown.
  useEffect(
    () => () => {
      if (uriRef.current) forgetModel(uriRef.current)
    },
    [],
  )

  // Interface or editor language changed: update the registry so the explanations in the
  // list switch along.
  useEffect(() => {
    const model = editorRef.current?.getModel()
    if (model) rememberModel(model.uri.toString(), { language, ui: sprache, infoInCode: t.imCode })
  }, [language, sprache, t.imCode, mounted])

  // Apply outside changes (reset, "take the solution", a template) to the model.
  //
  // Deliberately not through the `value` prop of `@monaco-editor/react`: that one rewrites
  // the whole model whenever `value` and the model differ. While typing React state is
  // always one keystroke behind, so it would write stale text back and swallow characters.
  // Our own edits never come back here, because `lastEmitted` already holds them.
  useEffect(() => {
    const editor = editorRef.current
    const model = editor?.getModel()
    if (!editor || !model) return
    if (value === lastEmitted.current || value === model.getValue()) return
    editor.pushUndoStop()
    editor.executeEdits('external', [{ range: model.getFullModelRange(), text: value, forceMoveMarkers: true }])
    editor.pushUndoStop()
    lastEmitted.current = value
  }, [value, mounted])

  // Type errors as markers - the list comes from typeCheck.worker.ts resp. the runtimes.
  useEffect(() => {
    const monaco = monacoRef.current
    const model = editorRef.current?.getModel()
    if (!monaco || !model) return
    monaco.editor.setModelMarkers(
      model,
      'lernpfad',
      markers.map((m) => ({
        severity: monaco.MarkerSeverity.Error,
        message: m.text,
        startLineNumber: m.line,
        // TypeDiagnostic counts columns from 0, Monaco from 1.
        startColumn: m.column + 1,
        endLineNumber: m.line,
        endColumn: m.column + m.length + 1,
        code: m.code ? 'TS' + m.code : undefined,
      })),
    )
  }, [markers, mounted])

  useImperativeHandle(
    control,
    (): EditorControl => ({
      stand() {
        const editor = editorRef.current
        const model = editor?.getModel()
        if (!editor || !model) return { code: value, start: 0, end: 0, manual: false }
        const selection = editor.getSelection()
        const start = selection ? model.getOffsetAt(selection.getStartPosition()) : 0
        const end = selection ? model.getOffsetAt(selection.getEndPosition()) : 0
        return { code: model.getValue(), start, end, manual: manualCursor.current }
      },

      insert(steps: Step[]) {
        const editor = editorRef.current
        const model = editor?.getModel()
        if (!editor || !model) return
        editor.focus()
        const plan = planInsertions(model.getValue(), steps)
        // `planInsertions` sorts descending, so the offsets of the remaining steps stay
        // valid. Every step is its own undo stop - Strg+Z therefore takes back each click
        // individually.
        for (const insertion of plan.einfuegungen) {
          editor.pushUndoStop()
          editor.executeEdits('block', [
            { range: rangeFromOffsets(model, insertion.start, insertion.end), text: insertion.text, forceMoveMarkers: true },
          ])
        }
        editor.pushUndoStop()
        const at = model.getPositionAt(plan.cursor)
        editor.setPosition(at)
        editor.revealPositionInCenterIfOutsideViewport(at)
        manualCursor.current = false
      },

      replace(code: string) {
        const editor = editorRef.current
        const model = editor?.getModel()
        if (!editor || !model) return
        editor.pushUndoStop()
        editor.executeEdits('template', [{ range: model.getFullModelRange(), text: code }])
        editor.pushUndoStop()
        editor.setPosition({ lineNumber: 1, column: 1 })
        editor.setScrollPosition({ scrollTop: 0 })
        manualCursor.current = false
      },

      run() {
        onRun?.(editorRef.current?.getValue() ?? value)
      },
    }),
  )

  // `@monaco-editor/react` calls `updateOptions` as soon as the identity of the options
  // object changes - a literal in the JSX would mean: on every keystroke.
  const options = useMemo<Monaco.editor.IStandaloneEditorConstructionOptions>(
    () => ({
      ariaLabel: label,
      fontSize: 14,
      lineHeight: LINE_HEIGHT,
      fontFamily: '"JetBrains Mono", ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace',
      fontLigatures: false,
      lineNumbers: 'on',
      minimap: { enabled: minimap, size: 'proportional', maxColumn: 60 },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      padding: { top: PADDING, bottom: PADDING },
      // Names from the learner's own code already come from `search` (suggestions.ts) -
      // Monaco's word list would offer them a second time.
      wordBasedSuggestions: 'off',
      quickSuggestions: { other: true, comments: false, strings: true },
      suggestOnTriggerCharacters: true,
      tabCompletion: 'on',
      snippetSuggestions: 'inline',
      scrollbar: { alwaysConsumeMouseWheel: false },
      overviewRulerLanes: 0,
      renderLineHighlight: 'line',
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      bracketPairColorization: { enabled: false },
      stickyScroll: { enabled: false },
      fixedOverflowWidgets: true,
    }),
    [label, minimap],
  )

  if (!prepared) {
    return <div className="border-b border-slate-200 p-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">{t.laeuft}</div>
  }

  return (
    <div className="border-b border-slate-200 dark:border-slate-800" style={fill ? { height: '100%' } : { height }}>
      <Editor
        path={path}
        language={MONACO_LANGUAGES[language]}
        defaultValue={value}
        onChange={(next) => {
          lastEmitted.current = next ?? ''
          onChange(next ?? '')
        }}
        onMount={onEditorMount}
        theme={theme === 'dark' ? THEME_DARK : THEME_LIGHT}
        loading={<div className="p-3 text-sm text-slate-500 dark:text-slate-400">{t.laeuft}</div>}
        options={options}
      />
    </div>
  )
}

function rangeFromOffsets(model: Monaco.editor.ITextModel, start: number, end: number): Monaco.IRange {
  const a = model.getPositionAt(start)
  const b = model.getPositionAt(end)
  return { startLineNumber: a.lineNumber, startColumn: a.column, endLineNumber: b.lineNumber, endColumn: b.column }
}
