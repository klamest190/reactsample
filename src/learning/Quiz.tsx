import { useState, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { KARTE } from '../components/Ui'
import { gueltigerQuizStand, useFortschritt } from '../context/ProgressContext'
import { useKapitelId } from '../context/ChapterContext'
import { useTexte } from '../i18n/LanguageContext'

/** Eine Multiple-Choice-Frage. `richtig` ist der Index der richtigen Antwort. */
export type Question = {
  question: ReactNode
  answers: ReactNode[]
  correct: number
  explanation: ReactNode
}

export function Quiz({ questions }: { questions: Question[] }) {
  const t = useTexte()
  const chapterId = useKapitelId()
  const { quiz, quizSetzen: setQuiz } = useFortschritt()

  // Pro Frage die gewählte Antwort (oder undefined). Abgeleitet: Anzahl richtiger.
  //
  // Gespeichert werden Antwort-INDIZES. Das geht nur, weil die deutsche und die
  // englische Fassung eines Kapitels dieselben Antworten in derselben Reihenfolge
  // haben - wer eine Antwortliste umsortiert, muss das in beiden Sprachen tun.
  const [selected, setSelected] = useState<(number | undefined)[]>(() => {
    const stand = chapterId ? gueltigerQuizStand(quiz[chapterId], questions.length) : undefined
    return stand ? stand.answers.map((a) => a ?? undefined) : []
  })

  const answered = selected.filter((g) => g !== undefined).length
  const correct = questions.filter((f, i) => selected[i] === f.correct).length

  /** Auswahl übernehmen und zugleich merken, damit sie den Kapitelwechsel überlebt. */
  function remember(next: (number | undefined)[]) {
    setSelected(next)
    if (!chapterId) return
    setQuiz(chapterId, {
      total: questions.length,
      correct: questions.filter((f, i) => next[i] === f.correct).length,
      answers: questions.map((_, i) => next[i] ?? null),
    })
  }

  return (
    <div className={`${KARTE} space-y-4 p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Icon name="frage" className="size-4.5 text-brand-600 dark:text-brand-400" />
          {t.quizTitel}
        </h3>
        {answered > 0 && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t.quizStand(correct, questions.length)}
          </span>
        )}
      </div>

      {questions.map((f, fi) => {
        const selection = selected[fi]
        const revealed = selection !== undefined

        return (
          // min-w-0: a fieldset is at least as wide as its content by default - long code answers would widen the page.
          <fieldset key={fi} className="min-w-0 space-y-2">
            <legend className="mb-2 text-sm font-medium">
              {fi + 1}. {f.question}
            </legend>
            <div className="grid gap-2">
              {f.answers.map((answer, ai) => {
                const isCorrect = ai === f.correct
                const isSelected = ai === selection
                const style = !revealed
                  ? 'border-slate-300 hover:border-brand-500 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  : isCorrect
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                    : isSelected
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950'
                      : 'border-slate-200 opacity-60 dark:border-slate-800'

                return (
                  <button
                    key={ai}
                    disabled={revealed}
                    onClick={() => {
                      const next = [...selected]
                      next[fi] = ai
                      remember(next)
                    }}
                    className={`rounded-lg border px-3 py-2 text-left text-sm wrap-anywhere transition ${style}`}
                  >
                    {revealed && isCorrect && '✓ '}
                    {revealed && isSelected && !isCorrect && '✗ '}
                    {answer}
                  </button>
                )
              })}
            </div>
            {revealed && (
              <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {selection === f.correct ? t.quizRichtig : t.quizFalsch}
                {f.explanation}
              </p>
            )}
          </fieldset>
        )
      })}

      {answered === questions.length && (
        <button
          onClick={() => remember([])}
          className="rounded text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          {t.quizNochmal}
        </button>
      )}
    </div>
  )
}
