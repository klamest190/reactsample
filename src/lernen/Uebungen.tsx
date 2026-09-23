import { use, useState } from 'react'
import { Icon } from '../components/Icon'
import { Aufklapppfeil, KARTE } from '../components/Ui'
import { useFortschritt } from '../context/FortschrittContext'
import { Verweis } from '../components/Verweis'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { uebungenFuer } from '../kurs/uebungen'
import type { CodeUebung, Stufe, Uebung, Vorhersage } from '../kurs/uebungen/typen'
import { CodeBlock } from './CodeBlock'
import { Text } from './Text'
import { TryIt, type TryItProps } from './TryIt'

/**
 * Zusätzliche Übungen am Ende eines Kapitels. Alle sind frei zugänglich, aber
 * eingeklappt - so bleibt die Seite übersichtlich und die Editoren starten erst,
 * wenn man eine Übung wirklich öffnet.
 */

const STUFEN_STIL: Record<Stufe, string> = {
  vorhersage: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  fehler: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  ergaenzen: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  frei: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
}

export function UebungenBereich({ kapitelId }: { kapitelId: string }) {
  const liste = use(uebungenFuer(kapitelId))
  const t = useTexte()
  const { uebungen } = useFortschritt()
  if (liste.length === 0) return null

  // Vorhersage-Aufgaben haben keine Tests, also auch kein „gelöst“ - sie zählen nicht mit.
  const bewertbar = liste.filter((u) => u.stufe !== 'vorhersage')
  const geloest = bewertbar.filter((u) => uebungen.includes('uebung-' + u.id)).length

  return (
    <section className="space-y-3" aria-labelledby="uebungen-titel">
      <div>
        <h2 id="uebungen-titel" className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-2 text-xl font-semibold tracking-tight dark:border-slate-800">
          <span className="flex items-center gap-2">
            <Icon name="hantel" className="size-5 text-brand-600 dark:text-brand-400" />
            {t.uebungenTitel}
          </span>
          {bewertbar.length > 0 && (
            <span className="text-sm font-normal text-slate-500 tabular-nums dark:text-slate-400">
              {t.uebungenGeloest(geloest, bewertbar.length)}
            </span>
          )}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t.uebungenText}</p>
      </div>
      <div className="space-y-2">
        {liste.map((uebung, i) => (
          <UebungKarte key={uebung.id} uebung={uebung} nummer={i + 1} />
        ))}
      </div>
    </section>
  )
}

function UebungKarte({ uebung, nummer }: { uebung: Uebung; nummer: number }) {
  const { sprache } = useSprache()
  const t = useTexte()
  const { uebungen } = useFortschritt()
  const [offen, setOffen] = useState(false)
  const istGeloest = uebungen.includes('uebung-' + uebung.id)

  return (
    <div className={`${KARTE} overflow-hidden`} data-uebung={uebung.id}>
      <button
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
      >
        <span className="w-5 shrink-0 text-sm text-slate-500 tabular-nums dark:text-slate-400">{nummer}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold ${STUFEN_STIL[uebung.stufe]}`}>
          {t.stufen[uebung.stufe]}
        </span>
        <span className="min-w-0 flex-1 font-medium">{uebung.titel[sprache]}</span>
        {istGeloest && (
          <span className="shrink-0 text-emerald-500">
            <Icon name="haken" className="size-4" />
            <span className="sr-only">{t.uebungGeloestKurz}</span>
          </span>
        )}
        {uebung.wiederholung && (
          <span className="hidden shrink-0 text-xs text-slate-500 sm:inline dark:text-slate-400">
            {t.wiederholung}
          </span>
        )}
        <Aufklapppfeil offen={offen} />
      </button>

      {offen && (
        <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
          {uebung.wiederholung && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.wiederholungAus} <Verweis id={uebung.wiederholung} />
            </p>
          )}
          {uebung.stufe === 'vorhersage' ? (
            <VorhersageAufgabe uebung={uebung} />
          ) : (
            <UebungEditor uebung={uebung} />
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
function UebungEditor({ uebung }: { uebung: CodeUebung }) {
  const { sprache } = useSprache()
  const props = {
    ...uebung,
    titel: undefined,
    id: 'uebung-' + uebung.id,
    aufgabe: <Text text={uebung.aufgabe[sprache]} />,
  } as TryItProps
  return <TryIt {...props} />
}

function VorhersageAufgabe({ uebung }: { uebung: Vorhersage }) {
  const { sprache } = useSprache()
  const t = useTexte()
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)
  const istCode = Array.isArray(uebung.antworten)
  const antworten = Array.isArray(uebung.antworten) ? uebung.antworten : uebung.antworten[sprache]
  const aufgeloest = gewaehlt !== null

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        <Text text={uebung.frage[sprache]} />
      </p>
      <CodeBlock code={uebung.code} sprache={uebung.hervorhebung} />
      <div className="grid gap-2 sm:grid-cols-2">
        {antworten.map((antwort, i) => {
          const stil = !aufgeloest
            ? 'border-slate-300 hover:border-brand-500 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800'
            : i === uebung.richtig
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
              : i === gewaehlt
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950'
                : 'border-slate-200 opacity-60 dark:border-slate-800'
          return (
            <button
              key={i}
              disabled={aufgeloest}
              onClick={() => setGewaehlt(i)}
              // Sprachneutrale Antworten sind Code-Ausgaben (monospace), übersetzte sind Fließtext.
              className={`min-w-0 rounded-lg border px-3 py-2 text-left text-sm wrap-anywhere transition ${istCode ? 'font-mono' : ''} ${stil}`}
            >
              {aufgeloest && i === uebung.richtig && '✓ '}
              {aufgeloest && i === gewaehlt && i !== uebung.richtig && '✗ '}
              {antwort}
            </button>
          )
        })}
      </div>
      {aufgeloest && (
        <div className="space-y-2">
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {gewaehlt === uebung.richtig ? t.quizRichtig : t.quizFalsch}
            <Text text={uebung.erklaerung[sprache]} />
          </p>
          <button onClick={() => setGewaehlt(null)} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            {t.quizNochmal}
          </button>
        </div>
      )}
    </div>
  )
}
