import { Suspense } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { KapitelChip } from '../components/Verweis'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { alleKapitel, aufbauendAuf, type KapitelMitTeil } from '../kurs/kurs'
import { UebungenBereich } from '../lernen/Uebungen'

/**
 * Rahmen für jedes Kapitel - immer derselbe Aufbau:
 *   Kopf (Teil, Nummer, Dauer) -> Lernziele -> Inhalt -> Abschluss + Weiter
 * Das Kapitel selbst liefert nur den Inhalt, die Struktur kommt von hier.
 */
export function KapitelSeite({
  kapitel,
  istErledigt,
  erledigtSetzen,
  navigieren,
}: {
  kapitel: KapitelMitTeil
  istErledigt: boolean
  erledigtSetzen: (wert: boolean) => void
  navigieren: (id: string) => void
}) {
  const { sprache } = useSprache()
  const t = useTexte()

  const index = alleKapitel.indexOf(kapitel)
  const vorher = alleKapitel[index - 1]
  const nachher = alleKapitel[index + 1]
  // Jedes Kapitel gibt es als eigene Komponente pro Sprache.
  const Inhalt = kapitel.Komponente[sprache]
  // Roter Faden rückwärts: wer baut auf diesem Kapitel auf? Projektschritte getrennt anzeigen.
  const nachfolger = aufbauendAuf(kapitel.id)
  const imProjekt = nachfolger.filter((k) => k.teil.id === 'projekt')
  const weiterfuehrend = nachfolger.filter((k) => k.teil.id !== 'projekt')

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
          {kapitel.teil.icon} {t.teil} {kapitel.teil.nummer} · {kapitel.teil.titel[sprache]}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="mr-2 text-slate-400 tabular-nums">{kapitel.nummer}</span>
          {kapitel.titel[sprache]}
        </h1>
        <p className="max-w-3xl text-lg text-slate-600 dark:text-slate-400">{kapitel.kurz[sprache]}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ⏱ {t.dauer(kapitel.dauer)} · {t.kapitelVon(index + 1, alleKapitel.length)}
        </p>
        {kapitel.grundlagen.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t.bautAuf}</span>
            {kapitel.grundlagen.map((id) => (
              <KapitelChip key={id} id={id} />
            ))}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 font-semibold">{t.lernzieleTitel}</h2>
          <ul className="grid gap-1 text-sm text-slate-700 sm:grid-cols-2 dark:text-slate-300">
            {kapitel.lernziele[sprache].map((ziel) => (
              <li key={ziel} className="flex gap-2">
                <span className="text-emerald-500">→</span>
                {ziel}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <ErrorBoundary>
        {/* Kapitel werden per lazy() nachgeladen - solange zeigt Suspense den Platzhalter. */}
        <Suspense
          fallback={
            <div className="space-y-4" aria-label={t.kapitelLaedt}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          }
        >
          <div className="space-y-10">
            <Inhalt />
          </div>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        {/* Übungen laden unabhängig vom Kapitel - ohne eigenen Platzhalter, sie stehen ja ganz unten. */}
        <Suspense fallback={null}>
          <UebungenBereich kapitelId={kapitel.id} />
        </Suspense>
      </ErrorBoundary>

      {nachfolger.length > 0 && (
        <aside className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-sm dark:border-brand-900 dark:bg-brand-950/30">
          <h2 className="font-semibold">{t.roterFaden}</h2>
          {imProjekt.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-600 dark:text-slate-400">{t.imProjekt}</span>
              {imProjekt.map((k) => (
                <KapitelChip key={k.id} id={k.id} />
              ))}
            </div>
          )}
          {weiterfuehrend.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-600 dark:text-slate-400">{t.daraufAufbauen}</span>
              {weiterfuehrend.map((k) => (
                <KapitelChip key={k.id} id={k.id} />
              ))}
            </div>
          )}
        </aside>
      )}

      <footer className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {istErledigt ? (
            <>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{t.kapitelAbgeschlossen}</span>
              <button onClick={() => erledigtSetzen(false)} className="text-sm text-slate-500 hover:underline">
                {t.rueckgaengig}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                erledigtSetzen(true)
                navigieren(nachher ? nachher.id : '')
              }}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
            >
              {t.kapitelAbschliessen}
              {nachher ? t.undWeiter : ''}
            </button>
          )}
        </div>

        <nav className="grid gap-3 sm:grid-cols-2" aria-label={t.kapitelBlaettern}>
          {vorher ? (
            <a
              href={'#/' + vorher.id}
              className="rounded-xl border border-slate-200 p-3 transition hover:border-brand-500 dark:border-slate-800"
            >
              <span className="text-xs text-slate-500">{t.zurueck}</span>
              <span className="block font-medium">
                {vorher.nummer} {vorher.titel[sprache]}
              </span>
            </a>
          ) : (
            <span />
          )}
          {nachher && (
            <a
              href={'#/' + nachher.id}
              className="rounded-xl border border-slate-200 p-3 text-right transition hover:border-brand-500 dark:border-slate-800"
            >
              <span className="text-xs text-slate-500">{t.weiter}</span>
              <span className="block font-medium">
                {nachher.nummer} {nachher.titel[sprache]}
              </span>
            </a>
          )}
        </nav>
      </footer>
    </article>
  )
}
