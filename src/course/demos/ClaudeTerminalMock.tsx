import { Fragment, useCallback, useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type Ref } from 'react'
import { Icon } from '../../components/Icon'
import { focusableWhenScrolling } from '../../components/scrollFocus'
import { useFortschritt } from '../../context/ProgressContext'
import { useSprache } from '../../i18n/LanguageContext'
import { Text } from '../../learning/Text'
import { completions, CONTEXT_WINDOW, usedTokens } from '../../claude/commands'
import { answerPermission, CLEAR, cycleMode, execute, newSession, welcome, type Step } from '../../claude/session'
import { isSolved } from '../../claude/tasks'
import type { ClaudeSession, PermissionAnswer, SessionSetup, TerminalLine } from '../../claude/types'
import { PROJECT_DIR } from '../../claude/workspace'
import type { LessonTask } from '../claude/types'

/**
 * Live demo (Claude Code track): a simulated Claude Code terminal. The logic lives in
 * src/claude/ (no React); this component keeps the session in state, prints the lines and checks
 * the lesson's tasks after every step. Solved tasks go into the saved progress (`uebungGeloest`),
 * so they stay ticked after a reload - the session itself starts fresh.
 */

export type ClaudeTerminalHandle = {
  /** Puts a command into the input line without running it - for task lists outside the terminal. */
  insert: (command: string) => void
}

const TEXTS = {
  de: {
    title: 'Claude Code (simuliert)',
    input: 'Eingabe an Claude Code',
    reset: 'Neu starten',
    tasks: 'Aufgaben',
    progress: (n: number, total: number) => `${n} von ${total}`,
    use: 'einsetzen',
    thinking: 'Denkt nach…',
    interrupted: 'Unterbrochen · Was soll Claude stattdessen tun?',
    solved: (task: string) => `Aufgabe gelöst: ${task}`,
    done: 'erledigt',
    hint: 'Hinweis',
    shellPlaceholder: 'Befehl eingeben, z. B. claude',
    replPlaceholder: 'Prompt oder /befehl …',
    choose: 'Auswahl eingeben (1, 2 oder 3)',
    modes: { default: 'Shift+Tab: Berechtigungsmodus', acceptEdits: '⏵⏵ accept edits on', plan: '⏸ plan mode on' },
    modeButton: 'Berechtigungsmodus wechseln (Shift+Tab)',
    answers: { yes: '1. Ja', always: '2. Ja, nicht mehr fragen', no: '3. Nein' },
    menu: 'Passende Befehle',
  },
  en: {
    title: 'Claude Code (simulated)',
    input: 'Input to Claude Code',
    reset: 'Start over',
    tasks: 'Tasks',
    progress: (n: number, total: number) => `${n} of ${total}`,
    use: 'insert',
    thinking: 'Thinking…',
    interrupted: 'Interrupted · What should Claude do instead?',
    solved: (task: string) => `Task solved: ${task}`,
    done: 'done',
    hint: 'Hint',
    shellPlaceholder: 'Type a command, e.g. claude',
    replPlaceholder: 'Prompt or /command …',
    choose: 'Enter your choice (1, 2 or 3)',
    modes: { default: 'Shift+Tab: permission mode', acceptEdits: '⏵⏵ accept edits on', plan: '⏸ plan mode on' },
    modeButton: 'Switch permission mode (Shift+Tab)',
    answers: { yes: '1. Yes', always: "2. Yes, don't ask again", no: '3. No' },
    menu: 'Matching commands',
  },
}

/** Drops everything up to the last clear marker. */
function appendLines(old: TerminalLine[], added: TerminalLine[]) {
  const clear = added.findLastIndex((l) => l.text === CLEAR)
  return clear === -1 ? [...old, ...added] : added.slice(clear + 1)
}

/** `code` in Claude's answers, coloured like in the real CLI. */
function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith('`') && part.endsWith('`') && part.length > 1 ? (
          <span key={i} className="text-sky-300">
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}

function Line({ line, hintLabel }: { line: TerminalLine; hintLabel: string }) {
  // min-h-5: empty lines (e.g. in a SKILL.md) keep their height.
  const base = 'min-h-5 break-words whitespace-pre-wrap'
  switch (line.kind) {
    case 'input':
      return <div className={`${base} mt-1 text-emerald-300`}>$ {line.text}</div>
    case 'prompt':
      return <div className={`${base} mt-2 rounded bg-slate-800/70 px-1.5 text-slate-200`}>&gt; {line.text}</div>
    case 'assistant':
      return (
        <div className={`${base} flex gap-2 text-slate-100`}>
          <span aria-hidden="true">⏺</span>
          <span className="min-w-0 flex-1">
            <InlineCode text={line.text} />
          </span>
        </div>
      )
    case 'tool': {
      const open = line.text.indexOf('(')
      return (
        <div className={`${base} mt-1 flex gap-2`}>
          <span aria-hidden="true" className="text-emerald-400">
            ⏺
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-semibold text-slate-100">{line.text.slice(0, open)}</span>
            <span className="text-slate-300">{line.text.slice(open)}</span>
          </span>
        </div>
      )
    }
    case 'result':
      return <div className={`${base} pl-4 text-slate-400`}>⎿&nbsp; {line.text}</div>
    case 'added':
      return <div className={`${base} bg-emerald-950 pl-4 text-emerald-300`}>{line.text}</div>
    case 'removed':
      return <div className={`${base} bg-rose-950 pl-4 text-rose-300`}>{line.text}</div>
    case 'title':
      return <div className={`${base} font-semibold text-[#e08a6b]`}>{line.text}</div>
    case 'success':
      return <div className={`${base} text-emerald-300`}>{line.text}</div>
    case 'error':
      return <div className={`${base} text-rose-300`}>{line.text}</div>
    case 'muted':
      return <div className={`${base} text-slate-400`}>{line.text}</div>
    case 'hint':
      return (
        <div className={`${base} my-1 flex items-start gap-1.5 text-amber-300`}>
          <Icon name="gluehbirne" className="mt-0.5 size-3.5 shrink-0" />
          <span className="sr-only">{hintLabel}: </span>
          <span className="min-w-0 flex-1">
            <InlineCode text={line.text} />
          </span>
        </div>
      )
    default:
      return (
        <div className={`${base} text-slate-100`}>
          <InlineCode text={line.text} />
        </div>
      )
  }
}

/** Consecutive boxed lines form one frame, like the dialogs of the real CLI. */
function Output({ lines, hintLabel }: { lines: TerminalLine[]; hintLabel: string }) {
  const groups: { boxed: boolean; lines: TerminalLine[] }[] = []
  for (const line of lines) {
    const boxed = line.boxed === true
    const last = groups.at(-1)
    if (last && last.boxed === boxed) last.lines.push(line)
    else groups.push({ boxed, lines: [line] })
  }
  return groups.map((group, g) =>
    group.boxed ? (
      <div key={g} className="my-1.5 rounded-md border border-[#d97757]/70 px-2.5 py-1.5">
        {group.lines.map((line, i) => (
          <Line key={i} line={line} hintLabel={hintLabel} />
        ))}
      </div>
    ) : (
      <Fragment key={g}>
        {group.lines.map((line, i) => (
          <Line key={i} line={line} hintLabel={hintLabel} />
        ))}
      </Fragment>
    ),
  )
}

/** The checklist of a lesson - inside the terminal or, in the split layout, next to the text. */
export function ClaudeTaskList({ tasks, onInsert }: { tasks: LessonTask[]; onInsert?: (command: string) => void }) {
  const { sprache } = useSprache()
  const { uebungen } = useFortschritt()
  const t = TEXTS[sprache]
  const states = tasks.map((task) => ({ ...task, isCompleted: uebungen.includes(task.id) }))
  return (
    <div>
      <h4 className="mb-1.5 flex items-center justify-between text-sm font-semibold">
        {t.tasks}
        <span className="text-xs font-normal text-slate-500 tabular-nums dark:text-slate-400">{t.progress(states.filter((s) => s.isCompleted).length, tasks.length)}</span>
      </h4>
      <ol className="space-y-1.5">
        {states.map((task, i) => (
          <li key={task.id} className="flex items-start gap-2 text-sm">
            <span className="w-5 shrink-0 tabular-nums">
              {task.isCompleted ? (
                <span role="img" aria-label={t.done} className="text-emerald-600 dark:text-emerald-400">
                  <Icon name="kreisHaken" className="mt-0.5 size-4" />
                </span>
              ) : (
                `${i + 1}.`
              )}
            </span>
            <span className={`min-w-0 flex-1 ${task.isCompleted ? 'text-slate-500 dark:text-slate-400' : ''}`}>
              <Text text={task.text[sprache]} />
              {task.command && !task.isCompleted && onInsert && (
                <button
                  type="button"
                  onClick={() => onInsert(task.command!)}
                  className="ml-2 rounded border border-slate-300 px-1 font-mono text-2xs text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400"
                  title={task.command}
                >
                  {t.use}
                </button>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function ClaudeTerminalMock({
  setup,
  tasks = [],
  showTasks = true,
  thinkingMs = 700,
  ref,
}: {
  setup: SessionSetup
  tasks?: LessonTask[]
  /** false: the page shows the tasks itself (split layout) via <ClaudeTaskList>. */
  showTasks?: boolean
  /** Pause before Claude answers a prompt - 0 in tests. */
  thinkingMs?: number
  ref?: Ref<ClaudeTerminalHandle>
}) {
  const { sprache } = useSprache()
  const { uebungGeloest } = useFortschritt()
  const t = TEXTS[sprache]
  const [session, setSession] = useState<ClaudeSession>(() => newSession(setup))
  const [lines, setLines] = useState<TerminalLine[]>(() => welcome(newSession(setup)))
  const [input, setInput] = useState('')
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [thinking, setThinking] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const outputRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const outputCallback = useCallback((element: HTMLDivElement | null) => {
    outputRef.current = element
    return focusableWhenScrolling(element)
  }, [])

  useImperativeHandle(ref, () => ({
    insert(command: string) {
      setInput(command)
      inputRef.current?.focus()
    },
  }))

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [lines, thinking])

  useEffect(() => () => clearTimeout(timer.current), [])

  /** Takes over a step: new session, new lines, and every task its events solve. */
  function commit(step: Step) {
    setSession(step.session)
    setLines((old) => appendLines(old, step.lines))
    const solved = tasks.filter((task) => isSolved(task.check, step.session.events) && !isSolved(task.check, session.events))
    for (const task of solved) uebungGeloest(task.id)
    if (solved.length) setAnnouncement(solved.map((task) => t.solved(task.text[sprache].replace(/[`*]/g, ''))).join(' · '))
  }

  function submit(text: string) {
    if (thinking) return
    const step = execute(session, text, sprache)
    setInput('')
    setHistoryIndex(null)
    // Prompts make Claude "think" first; commands, the shell and dialog answers are instant.
    const isPrompt = session.phase === 'repl' && !/^[/!]/.test(text.trim()) && text.trim() !== ''
    if (!isPrompt || thinkingMs === 0) {
      commit(step)
      return
    }
    const [promptLine, ...rest] = step.lines
    setLines((old) => [...old, promptLine])
    setThinking(true)
    timer.current = setTimeout(() => {
      setThinking(false)
      commit({ session: step.session, lines: rest })
    }, thinkingMs)
  }

  function interrupt() {
    clearTimeout(timer.current)
    setThinking(false)
    setLines((old) => [...old, { text: t.interrupted, kind: 'result' }])
  }

  function answer(choice: PermissionAnswer) {
    commit(answerPermission(session, choice, sprache))
    inputRef.current?.focus()
  }

  function switchMode() {
    const next = cycleMode(session)
    commit({ session: next, lines: [] })
  }

  function reset() {
    clearTimeout(timer.current)
    const fresh = newSession(setup)
    setSession(fresh)
    setLines(welcome(fresh))
    setThinking(false)
    setInput('')
    inputRef.current?.focus()
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    const history = session.history
    if (e.key === 'Escape') {
      if (thinking) interrupt()
      else if (session.phase === 'permission') answer('no')
      else setInput('')
    } else if (e.key === 'Tab' && e.shiftKey && (session.phase === 'repl' || session.phase === 'permission')) {
      // Only inside Claude Code - in the shell Shift+Tab keeps moving the focus as usual.
      e.preventDefault()
      switchMode()
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault()
      const index = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(index)
      setInput(history[index])
    } else if (e.key === 'ArrowDown' && historyIndex !== null) {
      e.preventDefault()
      const index = historyIndex + 1
      setHistoryIndex(index >= history.length ? null : index)
      setInput(index >= history.length ? '' : history[index])
    }
  }

  const inClaude = session.phase === 'repl' || session.phase === 'permission'
  const menu = session.phase === 'repl' && /^\/\S*$/.test(input) ? completions(session, input) : []
  const percent = Math.round((usedTokens(session) / CONTEXT_WINDOW) * 100)
  const symbol = session.phase === 'shell' ? '$' : session.phase === 'repl' ? '>' : '?'
  const placeholder = session.phase === 'shell' ? t.shellPlaceholder : session.phase === 'repl' ? t.replPlaceholder : t.choose

  return (
    <section aria-label={t.title} className="space-y-3">
      {/* No ligatures: in a diff `=>` has to look like `=>`, not like an arrow. */}
      <div className="overflow-hidden rounded-lg bg-slate-950 font-mono text-code leading-5 text-slate-100 shadow-inner [font-variant-ligatures:none]">
        <div className="flex items-center gap-1.5 border-b border-slate-800 px-3 py-1.5">
          <span className="size-2.5 rounded-full bg-rose-500" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-amber-400" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="ml-2 truncate text-2xs text-slate-400">
            <span className="text-[#e08a6b]">✻</span> {inClaude ? `claude · ${PROJECT_DIR}` : `bash · ${PROJECT_DIR}`}
          </span>
          <button type="button" onClick={reset} className="ml-auto flex items-center gap-1 text-2xs text-slate-400 hover:text-slate-200">
            <Icon name="zuruecksetzen" className="size-3" />
            {t.reset}
          </button>
        </div>

        <div ref={outputCallback} className="h-104 overflow-y-auto px-3 py-2" onClick={() => inputRef.current?.focus()} role="log" aria-live="polite">
          <Output lines={lines} hintLabel={t.hint} />
          {thinking && (
            <div className="mt-1 flex items-center gap-2 text-[#e08a6b]">
              <span aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
                ✻
              </span>
              {t.thinking} <span className="text-slate-400">(esc)</span>
            </div>
          )}
        </div>

        {session.phase === 'permission' && (
          <div className="flex flex-wrap gap-2 border-t border-slate-800 px-3 py-2" role="group" aria-label={t.choose}>
            {(['yes', 'always', 'no'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => answer(choice)}
                className={`rounded border px-2 py-0.5 text-2xs ${choice === 'no' ? 'border-rose-400/60 text-rose-300 hover:bg-rose-950' : 'border-emerald-400/60 text-emerald-300 hover:bg-emerald-950'}`}
              >
                {t.answers[choice]}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (input.trim() || session.phase === 'login') submit(input)
          }}
          className={`flex items-center gap-2 border-t px-3 py-2 ${inClaude ? 'border-[#d97757]/70' : 'border-slate-800'}`}
        >
          <span className={session.phase === 'shell' ? 'text-emerald-400' : 'text-[#e08a6b]'} aria-hidden="true">
            {symbol}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={placeholder}
            aria-label={t.input}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-400"
          />
        </form>

        {menu.length > 0 && (
          <ul aria-label={t.menu} className="border-t border-slate-800 px-3 py-1.5">
            {menu.map((item) => (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => {
                    setInput(`${item.name} `)
                    inputRef.current?.focus()
                  }}
                  className="flex w-full gap-3 rounded px-1 text-left text-2xs hover:bg-slate-800"
                >
                  <span className="w-44 shrink-0 truncate text-[#e08a6b]">{item.name}</span>
                  <span className="min-w-0 flex-1 truncate text-slate-400">{item.help}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {inClaude && (
          <div className="flex items-center justify-between gap-3 px-3 pb-1.5 text-2xs text-slate-400">
            <button type="button" onClick={switchMode} title={t.modeButton} aria-label={`${t.modeButton}: ${session.mode}`} className="hover:text-slate-200">
              <span className={session.mode === 'plan' ? 'text-teal-300' : session.mode === 'acceptEdits' ? 'text-violet-300' : ''}>{t.modes[session.mode]}</span>
            </button>
            <span className="tabular-nums">
              {session.model} · {percent}% context
            </span>
          </div>
        )}
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      {showTasks && tasks.length > 0 && (
        <ClaudeTaskList
          tasks={tasks}
          onInsert={(command) => {
            setInput(command)
            inputRef.current?.focus()
          }}
        />
      )}
    </section>
  )
}
