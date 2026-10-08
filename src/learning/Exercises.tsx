import { use, useState } from 'react'
import { Icon } from '../components/Icon'
import { Aufklapppfeil, KARTE } from '../components/Ui'
import { useFortschritt } from '../context/ProgressContext'
import { Verweis } from '../components/ChapterLink'
import { useSprache, useTexte } from '../i18n/LanguageContext'
import { uebungenFuer } from '../course/exercises'
import type { CodeUebung, Stufe, Uebung, Vorhersage } from '../course/exercises/types'
import { CodeBlock } from './CodeBlock'
import { Text } from './Text'
import { TryIt, type TryItProps } from './TryIt'

/**
 * Zusätzliche Übungen am Ende eines Kapitels. Alle sind frei zugänglich, aber
 * eingeklappt - so bleibt die Seite übersichtlich und die Editoren starten erst,
 * wenn man eine Übung wirklich öffnet.
 */

const LEVEL_STYLE: Record<Stufe, string> = {
  vorhersage: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  fehler: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  ergaenzen: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  frei: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
}

export function ExercisesSection({ chapterId }: { chapterId: string }) {
  const list = use(uebungenFuer(chapterId))
  const t = useTexte()
  const { uebungen: exercises } = useFortschritt()
  if (list.length === 0) return null

  // Vorhersage-Aufgaben haben keine Tests, also auch kein „gelöst“ - sie zählen nicht mit.
  const gradable = list.filter((u) => u.stufe !== 'vorhersage')
  const solved = gradable.filter((u) => exercises.includes('uebung-' + u.id)).length

  return (
    <section className="space-y-3" aria-labelledby="uebungen-titel">
      <div>
        <h2 id="uebungen-titel" className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-2 text-xl font-semibold tracking-tight dark:border-slate-800">
          <span className="flex items-center gap-2">
            <Icon name="hantel" className="size-5 text-brand-600 dark:text-brand-400" />
            {t.uebungenTitel}
          </span>
          {gradable.length > 0 && (
            <span className="text-sm font-normal text-slate-500 tabular-nums dark:text-slate-400">
              {t.uebungenGeloest(solved, gradable.length)}
            </span>
          )}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t.uebungenText}</p>
      </div>
      <div className="space-y-2">
        {list.map((exercise, i) => (
          <ExerciseCard key={exercise.id} exercise={exercise} number={i + 1} />
        ))}
      </div>
    </section>
  )
}

function ExerciseCard({ exercise, number }: { exercise: Uebung; number: number }) {
  const { sprache: language } = useSprache()
  const t = useTexte()
  const { uebungen: exercises } = useFortschritt()
  const [open, setOpen] = useState(false)
  const isSolved = exercises.includes('uebung-' + exercise.id)

  return (
    <div className={`${KARTE} overflow-hidden`} data-exercise={exercise.id}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
      >
        <span className="w-5 shrink-0 text-sm text-slate-500 tabular-nums dark:text-slate-400">{number}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold ${LEVEL_STYLE[exercise.stufe]}`}>
          {t.stufen[exercise.stufe]}
        </span>
        <span className="min-w-0 flex-1 font-medium">{exercise.titel[language]}</span>
        {isSolved && (
          <span className="shrink-0 text-emerald-500">
            <Icon name="haken" className="size-4" />
            <span className="sr-only">{t.uebungGeloestKurz}</span>
          </span>
        )}
        {exercise.wiederholung && (
          <span className="hidden shrink-0 text-xs text-slate-500 sm:inline dark:text-slate-400">
            {t.wiederholung}
          </span>
        )}
        <Aufklapppfeil offen={open} />
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
          {exercise.wiederholung && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.wiederholungAus} <Verweis id={exercise.wiederholung} />
            </p>
          )}
          {exercise.stufe === 'vorhersage' ? (
            <PredictionTask exercise={exercise} />
          ) : (
            <ExerciseEditor exercise={exercise} />
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Der Editor einer Übung. Jede Übung bringt genau die Felder mit, die ihr Modus braucht
 * (`properties` bei Spring, `project` bei Dockerfiles, `typTests` bei TypeScript …) -
 * deshalb reicht ein Aufruf für alle Modi. Der Titel steht schon auf der Karte.
 */
function ExerciseEditor({ exercise }: { exercise: CodeUebung }) {
  const { sprache: language } = useSprache()
  const props = {
    ...exercise,
    title: undefined,
    id: 'uebung-' + exercise.id,
    task: <Text text={exercise.task[language]} />,
  } as TryItProps
  return <TryIt {...props} />
}

function PredictionTask({ exercise }: { exercise: Vorhersage }) {
  const { sprache: language } = useSprache()
  const t = useTexte()
  const [selected, setSelected] = useState<number | null>(null)
  const isCode = Array.isArray(exercise.antworten)
  const answers = Array.isArray(exercise.antworten) ? exercise.antworten : exercise.antworten[language]
  const revealed = selected !== null

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        <Text text={exercise.frage[language]} />
      </p>
      <CodeBlock code={exercise.code} language={exercise.hervorhebung} />
      <div className="grid gap-2 sm:grid-cols-2">
        {answers.map((answer, i) => {
          const style = !revealed
            ? 'border-slate-300 hover:border-brand-500 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
            : i === exercise.richtig
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
              : i === selected
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950'
                : 'border-slate-200 opacity-60 dark:border-slate-800'
          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => setSelected(i)}
              // Sprachneutrale Antworten sind Code-Ausgaben (monospace), übersetzte sind Fließtext.
              className={`min-w-0 rounded-lg border px-3 py-2 text-left text-sm wrap-anywhere transition ${isCode ? 'font-mono' : ''} ${style}`}
            >
              {revealed && i === exercise.richtig && '✓ '}
              {revealed && i === selected && i !== exercise.richtig && '✗ '}
              {answer}
            </button>
          )
        })}
      </div>
      {revealed && (
        <div className="space-y-2">
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {selected === exercise.richtig ? t.quizRichtig : t.quizFalsch}
            <Text text={exercise.erklaerung[language]} />
          </p>
          <button onClick={() => setSelected(null)} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            {t.quizNochmal}
          </button>
        </div>
      )}
    </div>
  )
}
