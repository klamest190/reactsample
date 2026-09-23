import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Demo } from '../../components/Ui'
import { useSprache, type Zweisprachig } from '../../i18n/SpracheContext'
import { execute, newState, type DockerState, type TerminalLine } from '../../docker/cli'
import type { ProjectId } from '../../docker/projects'
import { Text } from '../../lernen/Text'

/**
 * Live demo (part 8): a terminal with a simulated `docker` command.
 * Tasks are checked against the simulated state after every command -
 * e.g. "an nginx container is running and published on port 8080".
 */

export type TerminalTask = {
  text: Zweisprachig
  /** A command that solves the task - clicking it puts it into the input line (not run). */
  command?: string
  done: (state: DockerState) => boolean
}

const TEXTS = {
  de: {
    title: 'Terminal (simuliert)',
    placeholder: 'docker run hello-world',
    input: 'Befehl eingeben',
    reset: 'Neu starten',
    tasks: 'Aufgaben',
    progress: (n: number, total: number) => `${n} von ${total}`,
    welcome: 'Tippe einen docker-Befehl und drücke Enter. `help` zeigt, was dieses Terminal kann. ↑/↓ holt frühere Befehle zurück.',
    use: 'einsetzen',
    running: (n: number) => (n === 1 ? '1 Container läuft' : `${n} Container laufen`),
  },
  en: {
    title: 'Terminal (simulated)',
    placeholder: 'docker run hello-world',
    input: 'Enter a command',
    reset: 'Start over',
    tasks: 'Tasks',
    progress: (n: number, total: number) => `${n} of ${total}`,
    welcome: 'Type a docker command and press Enter. `help` shows what this terminal can do. ↑/↓ brings back earlier commands.',
    use: 'insert',
    running: (n: number) => (n === 1 ? '1 container running' : `${n} containers running`),
  },
}

export function DockerTerminal({
  tasks = [],
  dockerfile,
  project,
  ignore,
}: {
  tasks?: TerminalTask[]
  dockerfile?: string
  project?: ProjectId
  ignore?: string
}) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const [state, setState] = useState<DockerState>(newState)
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [input, setInput] = useState('')
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight })
  }, [lines])

  function run(command: string) {
    // The simulator changes the state object in place - copy it first, React needs a new object.
    const next: DockerState = structuredClone(state)
    const output = execute(next, command, { dockerfile, project, ignore, language: sprache })
    setState(next)
    setLines((old) => (output[0]?.text === '\u0000clear' ? [] : [...old, { text: command, kind: 'input' }, ...output]))
    setInput('')
    setHistoryIndex(null)
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    const history = state.history
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault()
      const index = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(index)
      setInput(history[index])
    } else if (e.key === 'ArrowDown' && historyIndex !== null) {
      e.preventDefault()
      const index = historyIndex + 1
      if (index >= history.length) {
        setHistoryIndex(null)
        setInput('')
      } else {
        setHistoryIndex(index)
        setInput(history[index])
      }
    }
  }

  const done = tasks.map((task) => {
    try {
      return task.done(state)
    } catch {
      return false
    }
  })
  const running = state.containers.filter((c) => c.status === 'running').length

  return (
    <Demo titel={t.title}>
      <div className="overflow-hidden rounded-lg bg-slate-950 font-mono text-code leading-5 text-slate-100 shadow-inner">
        <div className="flex items-center gap-1.5 border-b border-slate-800 px-3 py-1.5">
          <span className="size-2.5 rounded-full bg-rose-500" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-amber-400" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="ml-2 text-2xs text-slate-400">bash · {t.running(running)}</span>
          <button
            onClick={() => {
              setState(newState())
              setLines([])
              inputRef.current?.focus()
            }}
            className="ml-auto text-2xs text-slate-400 hover:text-slate-200"
          >
            ↺ {t.reset}
          </button>
        </div>
        <div ref={outputRef} className="max-h-80 min-h-40 overflow-y-auto px-3 py-2" onClick={() => inputRef.current?.focus()} role="log" aria-live="polite">
          {lines.length === 0 && <p className="text-slate-400">{t.welcome}</p>}
          {lines.map((l, i) => (
            <div
              key={i}
              className={`break-all whitespace-pre-wrap ${
                l.kind === 'input' ? 'mt-1 text-emerald-300' : l.kind === 'error' ? 'text-rose-300' : l.kind === 'hint' ? 'text-amber-300' : 'text-slate-100'
              }`}
            >
              {l.kind === 'input' ? '$ ' : l.kind === 'hint' ? '💡 ' : ''}
              {l.text}
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (input.trim()) run(input)
          }}
          className="flex items-center gap-2 border-t border-slate-800 px-3 py-2"
        >
          <span className="text-emerald-400" aria-hidden="true">
            $
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={t.placeholder}
            aria-label={t.input}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-600"
          />
        </form>
      </div>

      {tasks.length > 0 && (
        <div className="mt-3">
          <h4 className="mb-1.5 flex items-center justify-between text-sm font-semibold">
            {t.tasks}
            <span className="text-xs font-normal text-slate-500 tabular-nums dark:text-slate-400">{t.progress(done.filter(Boolean).length, tasks.length)}</span>
          </h4>
          <ol className="space-y-1.5">
            {tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span aria-hidden="true" className="w-5 shrink-0">
                  {done[i] ? '✅' : `${i + 1}.`}
                </span>
                <span className={`min-w-0 flex-1 ${done[i] ? 'text-slate-500' : ''}`}>
                  <Text text={task.text[sprache]} />
                  {task.command && !done[i] && (
                    <button
                      onClick={() => {
                        setInput(task.command!)
                        inputRef.current?.focus()
                      }}
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
      )}
    </Demo>
  )
}
