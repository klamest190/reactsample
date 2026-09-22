import { useState, type ReactNode } from 'react'
import { KARTE } from '../components/Ui'
import { useTexte } from '../i18n/SpracheContext'

/** Eine Multiple-Choice-Frage. `richtig` ist der Index der richtigen Antwort. */
export type Frage = {
  frage: ReactNode
  antworten: ReactNode[]
  richtig: number
  erklaerung: ReactNode
}

export function Quiz({ fragen }: { fragen: Frage[] }) {
  const t = useTexte()
  // Pro Frage die gewählte Antwort (oder undefined). Abgeleitet: Anzahl richtiger.
  const [gewaehlt, setGewaehlt] = useState<(number | undefined)[]>([])
  const beantwortet = gewaehlt.filter((g) => g !== undefined).length
  const richtig = fragen.filter((f, i) => gewaehlt[i] === f.richtig).length

  return (
    <div className={`${KARTE} space-y-4 p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t.quizTitel}</h3>
        {beantwortet > 0 && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t.quizStand(richtig, fragen.length)}
          </span>
        )}
      </div>

      {fragen.map((f, fi) => {
        const auswahl = gewaehlt[fi]
        const aufgeloest = auswahl !== undefined

        return (
          <fieldset key={fi} className="space-y-2">
            <legend className="mb-2 text-sm font-medium">
              {fi + 1}. {f.frage}
            </legend>
            <div className="grid gap-2">
              {f.antworten.map((antwort, ai) => {
                const istRichtig = ai === f.richtig
                const istGewaehlt = ai === auswahl
                const stil = !aufgeloest
                  ? 'border-slate-300 hover:border-brand-500 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  : istRichtig
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                    : istGewaehlt
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950'
                      : 'border-slate-200 opacity-60 dark:border-slate-800'

                return (
                  <button
                    key={ai}
                    disabled={aufgeloest}
                    onClick={() =>
                      setGewaehlt((alt) => {
                        const neu = [...alt]
                        neu[fi] = ai
                        return neu
                      })
                    }
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${stil}`}
                  >
                    {aufgeloest && istRichtig && '✓ '}
                    {aufgeloest && istGewaehlt && !istRichtig && '✗ '}
                    {antwort}
                  </button>
                )
              })}
            </div>
            {aufgeloest && (
              <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {auswahl === f.richtig ? t.quizRichtig : t.quizFalsch}
                {f.erklaerung}
              </p>
            )}
          </fieldset>
        )
      })}

      {beantwortet === fragen.length && (
        <button
          onClick={() => setGewaehlt([])}
          className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          {t.quizNochmal}
        </button>
      )}
    </div>
  )
}
