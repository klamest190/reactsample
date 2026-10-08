import {
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type Ref,
  type UIEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useSprache, useTexte } from '../i18n/LanguageContext'
import { planInsertions, type Step } from './insertion'
import { HighlightedCode } from './highlight'
import type { TypeDiagnostic } from './typeCheck'
import { classWord, tailwindEngine } from './tailwind'
import { EDITOR_LANGUAGES, type EditorLanguage } from './modes'
import { search, suggestionsFor, type Suggestion, type SuggestionKind } from './suggestions'

/**
 * Kleiner Code-Editor ohne Bibliothek.
 *
 * Trick: Ein durchsichtiges <textarea> liegt exakt über einem <pre> mit dem
 * eingefärbten Code. Man tippt im Textfeld (Cursor, Markieren, Strg+Z
 * funktionieren nativ) und sieht die Farben des <pre> darunter.
 * Beide müssen dafür dieselbe Schrift, Zeilenhöhe und Innenabstände haben.
 *
 * Dazu eine Autovervollständigung: Beim Tippen erscheinen passende Vorschläge
 * (siehe vorschlaege.ts), Strg+Leertaste öffnet sie von Hand.
 */

const LINE_HEIGHT = 20
const MAX_ZEILEN = 28
const PADDING = 12 // p-3
const POPUP_WIDTH = 340
const POPUP_HEIGHT = 290

type Props = {
  value: string
  onChange: (value: string) => void
  /** Strg+Enter. Bekommt den aktuellen Text mit - wichtig direkt nach einem Einfügen, bevor der State nachzieht. */
  onRun?: (code: string) => void
  label: string
  language: EditorLanguage
  /** Ab so vielen Zeilen scrollt der Editor, statt weiter zu wachsen. */
  maxLines?: number
  /** Typfehler: rot unterschlängelt, Zeilennummer rot, Meldung im Tooltip. */
  markers?: TypeDiagnostic[]
  /** Von außen Code einfügen (Bausteine im Playground), siehe EditorSteuerung. */
  control?: Ref<EditorControl>
}

/**
 * Was der Editor nach außen anbietet. Beide Aktionen laufen über das Textfeld selbst,
 * deshalb lassen sie sich mit Strg+Z rückgängig machen.
 */
export type EditorControl = {
  /** Aktueller Text und Auswahl. `vonHand`: Hat die Person seit dem letzten Einfügen selbst geklickt oder getippt? */
  stand: () => { code: string; start: number; end: number; manual: boolean }
  /** Bausteine einfügen (siehe einfuegungenPlanen). */
  insert: (steps: Step[]) => void
  /** Den ganzen Code ersetzen (z. B. durch eine Vorlage). */
  replace: (code: string) => void
  /** Wie Strg+Enter. */
  run: () => void
}

type Popup = {
  hits: Suggestion[]
  replaceChars: number
  selection: number
  x: number
  /** Unterkante der Cursorzeile (Popup darunter) bzw. Oberkante (Popup darüber). */
  y: number
  above: boolean
}

export function CodeEditor({
  value,
  onChange,
  onRun,
  label,
  language,
  maxLines = MAX_ZEILEN,
  markers = [],
  control,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const numbersRef = useRef<HTMLDivElement>(null)
  // Nach Escape darf Tab den Editor verlassen (sonst wäre die Tastatur gefangen).
  const tabFreigegeben = useRef(false)
  // Tailwind-Vorschläge kommen asynchron - nur die Antwort auf die letzte Anfrage zählt.
  const tailwindRequest = useRef(0)
  // Eigene Einfügungen (Vorschlag übernommen) sollen das Popup nicht gleich wieder öffnen.
  const suppress = useRef(false)

  const { sprache: ui } = useSprache()
  const t = useTexte()
  const [popup, setPopup] = useState<Popup | null>(null)
  const allSuggestions = useMemo(() => suggestionsFor(language, ui), [language, ui])
  const listId = useId()

  const lineTexts = value.split('\n')
  const lines = lineTexts.length
  const height = Math.min(Math.max(lines, 4), maxLines) * LINE_HEIGHT + 24 + 12

  // Solange das Popup offen ist: beim Scrollen oder Größe ändern schließen,
  // weil die berechnete Position sonst nicht mehr stimmt.
  const isOpen = popup !== null
  useEffect(() => {
    if (!isOpen) return
    const close = (e: Event) => {
      // Scrollen innerhalb der Vorschlagsliste selbst zählt nicht.
      if (e.target instanceof Element && e.target.closest('[data-suggestions]')) return
      setPopup(null)
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [isOpen])

  function onScroll(e: UIEvent<HTMLTextAreaElement>) {
    const { scrollTop, scrollLeft } = e.currentTarget
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop
      preRef.current.scrollLeft = scrollLeft
    }
    if (numbersRef.current) numbersRef.current.scrollTop = scrollTop
  }

  function insert(field: HTMLTextAreaElement, text: string) {
    // execCommand ist veraltet, aber der einzige Weg, der den Undo-Verlauf erhält.
    if (!document.execCommand('insertText', false, text)) {
      field.setRangeText(text, field.selectionStart, field.selectionEnd, 'end')
      onChange(field.value)
    }
  }

  // Steht der Cursor dort, wo die Person ihn hingesetzt hat - oder nur zufällig
  // (Startposition, nach dem letzten Einfügen)? Davon hängt ab, wo Bausteine landen.
  const manualCursor = useRef(false)

  useImperativeHandle(control, () => ({
    stand() {
      const field = textareaRef.current
      return {
        code: field?.value ?? value,
        start: field?.selectionStart ?? 0,
        end: field?.selectionEnd ?? 0,
        manual: manualCursor.current,
      }
    },
    insert(steps) {
      const field = textareaRef.current
      if (!field) return
      const plan = planInsertions(field.value, steps)
      field.focus()
      suppress.current = true
      for (const e of plan.einfuegungen) {
        field.setSelectionRange(e.start, e.end)
        insert(field, e.text)
      }
      suppress.current = false
      field.setSelectionRange(plan.cursor, plan.cursor)
      manualCursor.current = false
      setPopup(null)
      // Die eingefügte Stelle sichtbar machen.
      const line = field.value.slice(0, plan.cursor).split('\n').length - 1
      field.scrollTop = Math.max(0, line * LINE_HEIGHT - field.clientHeight / 2)
    },
    replace(code) {
      const field = textareaRef.current
      if (!field) return
      field.focus()
      field.select()
      suppress.current = true
      insert(field, code)
      suppress.current = false
      field.setSelectionRange(0, 0)
      field.scrollTop = 0
      manualCursor.current = false
      setPopup(null)
    },
    run() {
      onRun?.(textareaRef.current?.value ?? value)
    },
  }))

  // ---- Autovervollständigung ------------------------------------------------

  function showSuggestions(field: HTMLTextAreaElement, manual: boolean) {
    const before = field.value.slice(0, field.selectionStart)
    const line = before.slice(before.lastIndexOf('\n') + 1)

    // In className="…" gibt es Tailwind-Klassen statt JavaScript. Die Engine lädt beim ersten Mal nach,
    // deshalb kommt das Ergebnis asynchron - und zählt nur, wenn sich am Text nichts geändert hat.
    const classes = language === 'react' ? classWord(before) : null
    if (classes !== null) {
      const request = ++tailwindRequest.current
      if ((!manual && !classes) || field.selectionStart !== field.selectionEnd) {
        setPopup(null)
        return
      }
      void tailwindEngine()
        .then((engine) => {
          if (request !== tailwindRequest.current) return
          const { hits, replaceChars } = engine.suggestions(classes)
          openPopup(field, before, hits, replaceChars)
        })
        .catch((error: unknown) => console.error('Tailwind:', error))
      return
    }
    tailwindRequest.current++

    // Spring: `@GetMapping` counts as one word. The comment sign depends on the language (modi.ts).
    const word = line.match(language === 'spring' ? /@?[\w$.]*$/ : /[\w$.]*$/)![0]
    const commentMarker = EDITOR_LANGUAGES[language].comment
    const inComment = line.slice(0, line.length - word.length).includes(commentMarker)
    if ((!manual && (!word || /^\d/.test(word))) || inComment || field.selectionStart !== field.selectionEnd) {
      setPopup(null)
      return
    }

    const { hits, replaceChars } = search(allSuggestions, field.value, word, t.imCode)
    openPopup(field, before, hits, replaceChars)
  }

  function openPopup(field: HTMLTextAreaElement, before: string, hits: Suggestion[], replaceChars: number) {
    if (hits.length === 0) {
      setPopup(null)
      return
    }
    const line = before.slice(before.lastIndexOf('\n') + 1)

    // Position des Wortanfangs in Pixeln: Monospace-Schrift, also Spalte × Zeichenbreite.
    const style = getComputedStyle(field)
    const context = document.createElement('canvas').getContext('2d')!
    context.font = `${style.fontSize} ${style.fontFamily}`
    const charWidth = context.measureText('0000000000').width / 10

    const box = field.getBoundingClientRect()
    const lineIndex = before.split('\n').length - 1
    const column = line.length - replaceChars
    const x = box.left + PADDING + column * charWidth - field.scrollLeft
    const linesAbove = box.top + PADDING + lineIndex * LINE_HEIGHT - field.scrollTop
    const above = linesAbove + LINE_HEIGHT + POPUP_HEIGHT > window.innerHeight

    setPopup({
      hits,
      replaceChars,
      selection: 0,
      x: Math.max(8, Math.min(x, window.innerWidth - POPUP_WIDTH - 8)),
      y: above ? linesAbove : linesAbove + LINE_HEIGHT,
      above,
    })
  }

  function adopt(suggestion: Suggestion) {
    const field = textareaRef.current
    if (!field || !popup) return

    const start = field.selectionStart - popup.replaceChars
    const before = field.value.slice(0, start)
    const indent = before.slice(before.lastIndexOf('\n') + 1).match(/^\s*/)![0]

    // Mehrzeilige Vorlagen an die aktuelle Einrückung anpassen, $0 = Cursorposition.
    const template = (suggestion.insert ?? suggestion.label).replace(/\n/g, '\n' + indent)
    const cursor = template.indexOf('$0')
    const text = template.replace('$0', '')

    field.setSelectionRange(start, field.selectionStart) // getipptes Wort markieren …
    suppress.current = true
    insert(field, text) // … und ersetzen
    suppress.current = false

    if (cursor >= 0) field.setSelectionRange(start + cursor, start + cursor)
    setPopup(null)
    // Nach einer Tailwind-Variante wie "hover:" geht es direkt mit den Klassen weiter.
    if (suggestion.kind === 'tailwind' && text.endsWith(':')) showSuggestions(field, true)
  }

  function onInput(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value)
    if (suppress.current) return
    showSuggestions(e.target, false)
  }

  // ---- Tastatur -----------------------------------------------------------------

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const field = e.currentTarget

    if (popup) {
      const count = popup.hits.length
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const step = e.key === 'ArrowDown' ? 1 : -1
        setPopup({ ...popup, selection: (popup.selection + step + count) % count })
        return
      }
      if ((e.key === 'Enter' && !e.ctrlKey && !e.metaKey) || e.key === 'Tab') {
        e.preventDefault()
        adopt(popup.hits[popup.selection])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setPopup(null)
        return
      }
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
        setPopup(null)
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
      e.preventDefault()
      showSuggestions(field, true)
      return
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      setPopup(null)
      onRun?.(field.value)
      return
    }
    if (e.key === 'Escape') {
      tabFreigegeben.current = true
      return
    }
    if (e.key === 'Tab' && !e.shiftKey && !tabFreigegeben.current) {
      e.preventDefault()
      insert(field, '  ')
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      // Einrückung der aktuellen Zeile übernehmen, nach { ( [ eine Stufe mehr.
      const before = field.value.slice(0, field.selectionStart)
      const line = before.slice(before.lastIndexOf('\n') + 1)
      const indent = line.match(/^\s*/)![0]
      const extra = /[{([]\s*$|=>\s*$/.test(line) ? '  ' : ''
      e.preventDefault()
      insert(field, '\n' + indent + extra)
    }
    tabFreigegeben.current = false
  }

  const activeOptionId = popup ? `${listId}-${popup.selection}` : undefined

  return (
    <div
      className="flex bg-slate-50 font-mono text-code dark:bg-slate-950"
      style={{ lineHeight: LINE_HEIGHT + 'px' }}
    >
      <div
        ref={numbersRef}
        aria-hidden
        className="overflow-hidden border-r border-slate-200 py-3 pr-2 pl-3 text-right text-slate-500 select-none dark:border-slate-800 dark:text-slate-400"
        style={{ height }}
      >
        {Array.from({ length: lines }, (_, i) => {
          const error = markers.filter((m) => m.line === i + 1)
          return (
            <div
              key={i}
              title={error.map((m) => m.text).join('\n') || undefined}
              className={error.length ? 'font-semibold text-rose-700 dark:text-rose-400' : undefined}
            >
              {i + 1}
            </div>
          )
        })}
      </div>

      <div className="relative min-w-0 flex-1">
        <pre
          ref={preRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 m-0 overflow-hidden p-3 whitespace-pre"
        >
          <HighlightedCode code={value} language={EDITOR_LANGUAGES[language].highlight} />
          {/* Unterschlängelung: Die Schrift ist monospace, 1ch = ein Zeichen. */}
          {markers.map((m, i) => (
            <span
              key={i}
              className="absolute rounded-sm bg-rose-500/10 text-transparent underline decoration-rose-500 decoration-wavy underline-offset-3"
              style={{ top: PADDING + (m.line - 1) * LINE_HEIGHT, left: `calc(${PADDING}px + ${m.column}ch)` }}
            >
              {lineTexts[m.line - 1]?.slice(m.column, m.column + m.length) || ' '}
            </span>
          ))}
          {/* Leerzeichen, damit eine abschließende Leerzeile auch im <pre> Platz hat. */}
          {'\n '}
        </pre>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onInput}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
          onBlur={() => setPopup(null)}
          onMouseDown={() => setPopup(null)}
          onMouseUp={() => (manualCursor.current = true)}
          onKeyUp={(e) => {
            if (!e.ctrlKey && !e.metaKey && !['Escape', 'Tab', 'Shift', 'Control', 'Meta', 'Alt'].includes(e.key)) {
              manualCursor.current = true
            }
          }}
          aria-label={label}
          // A textarea stays a textbox (role combobox is only allowed on <input>). The suggestion
          // list is announced through aria-autocomplete, aria-controls and aria-activedescendant.
          aria-autocomplete="list"
          aria-controls={isOpen ? listId : undefined}
          aria-activedescendant={activeOptionId}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap="off"
          className="relative block w-full resize-none overflow-auto bg-transparent p-3 whitespace-pre text-transparent caret-slate-900 outline-none selection:bg-brand-500/25 dark:caret-white"
          style={{ height }}
        />
      </div>

      {popup &&
        // Portal: Der TryIt-Rahmen hat overflow:hidden und würde das Popup abschneiden.
        createPortal(
          <SuggestionList id={listId} popup={popup} onSelect={adopt} />,
          document.body,
        )}
    </div>
  )
}

// ---------------------------------------------------------------------------

const KIND_STYLE: Record<SuggestionKind, { short: string; classes: string }> = {
  function: { short: 'ƒ', classes: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' },
  hook: { short: 'use', classes: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300' },
  snippet: { short: '{ }', classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  keyword: { short: 'kw', classes: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  method: { short: '.m', classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  jsx: { short: '</>', classes: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  variable: { short: 'x', classes: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
  tailwind: { short: 'tw', classes: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
}

function SuggestionList({
  id,
  popup,
  onSelect,
}: {
  id: string
  popup: Popup
  onSelect: (v: Suggestion) => void
}) {
  const t = useTexte()
  const listRef = useRef<HTMLUListElement>(null)
  const active = popup.hits[popup.selection]
  const preview = (active.insert ?? active.label).replace('$0', '…')

  // Den ausgewählten Eintrag beim Blättern mit den Pfeiltasten sichtbar halten.
  useEffect(() => {
    listRef.current?.children[popup.selection]?.scrollIntoView({ block: 'nearest' })
  }, [popup.selection])

  return (
    <div
      // mousedown würde den Fokus aus dem Textfeld nehmen und das Popup schließen
      onMouseDown={(e) => e.preventDefault()}
      data-suggestions
      className="fixed z-50 overflow-hidden rounded-lg border border-slate-200 bg-white font-mono text-code shadow-xl dark:border-slate-700 dark:bg-slate-900"
      style={{
        left: popup.x,
        width: POPUP_WIDTH,
        ...(popup.above ? { bottom: window.innerHeight - popup.y } : { top: popup.y }),
      }}
    >
      <ul ref={listRef} id={id} role="listbox" aria-label={t.vorschlaege} className="max-h-52 overflow-y-auto py-1">
        {popup.hits.map((v, i) => {
          const style = KIND_STYLE[v.kind]
          return (
            <li
              key={v.label + v.kind}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === popup.selection}
              onClick={() => onSelect(v)}
              className={`flex cursor-pointer items-center gap-2 px-2 py-1 ${
                i === popup.selection ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {v.color ? (
                // Wie in VS Code: ein Farbfeld statt des Kürzels. Das Schachbrett zeigt Transparenz.
                <span className="flex w-8 shrink-0 justify-center">
                  <span
                    aria-hidden
                    className="size-3.5 rounded-sm border border-black/15 dark:border-white/25"
                    style={{ background: `linear-gradient(${v.color}, ${v.color}), repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 6px 6px` }}
                  />
                </span>
              ) : (
                <span className={`w-8 shrink-0 rounded px-1 text-center text-3xs font-semibold ${style.classes}`}>
                  {style.short}
                </span>
              )}
              <span className="truncate">{v.label}</span>
            </li>
          )
        })}
      </ul>
      <div className="space-y-1 border-t border-slate-200 px-3 py-2 font-sans text-xs dark:border-slate-700">
        {active.info && <p className="text-slate-700 dark:text-slate-200">{active.info}</p>}
        {active.css && (
          <pre className="max-h-40 overflow-auto font-mono text-2xs break-all whitespace-pre-wrap text-slate-600 dark:text-slate-300">{active.css}</pre>
        )}
        {preview !== active.label && (
          <pre className="max-h-16 overflow-hidden font-mono text-2xs whitespace-pre text-slate-500 dark:text-slate-400">
            {preview}
          </pre>
        )}
        <p className="text-2xs text-slate-500 dark:text-slate-400">{t.vorschlagHinweis}</p>
      </div>
    </div>
  )
}
