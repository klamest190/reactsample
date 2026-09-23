import { Suspense, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { GliederungMelden, type Abschnittseintrag } from '../components/Gliederung'
import { Icon, TeilSymbol } from '../components/Icon'
import { Button, KARTE, Platzhalter } from '../components/Ui'
import { KapitelChip } from '../components/Verweis'
import { useFortschritt } from '../context/FortschrittContext'
import { useAktiverAbschnitt } from '../hooks/useAktiverAbschnitt'
import { KapitelIdProvider } from '../context/KapitelContext'
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
  abschnittZiel,
  istErledigt,
  erledigtSetzen,
  navigieren,
}: {
  kapitel: KapitelMitTeil
  abschnittZiel?: string
  istErledigt: boolean
  erledigtSetzen: (wert: boolean) => void
  navigieren: (id: string) => void
}) {
  const { sprache } = useSprache()
  const t = useTexte()
  const { quiz } = useFortschritt()
  // Die Abschnitte kennt erst das gerenderte Kapitel - siehe Gliederung.tsx.
  const inhaltRef = useRef<HTMLDivElement>(null)
  const [gliederung, setGliederung] = useState<Abschnittseintrag[]>([])
  const aktiverAbschnitt = useAktiverAbschnitt(gliederung)

  // Sprung zu einem Abschnitt (#/kapitel-id/abschnitt-3).
  // `gliederung` muss in den Abhängigkeiten stehen: beim Kaltstart trifft das
  // Ziel ein, bevor das nachgeladene Kapitel da ist - dann greift der Effekt erneut.
  useEffect(() => {
    if (!abschnittZiel || gliederung.length === 0) return
    const el = document.getElementById(abschnittZiel)
    el?.scrollIntoView({ block: 'start' })
    el?.querySelector<HTMLElement>(':scope > h2')?.focus({ preventScroll: true })
  }, [abschnittZiel, gliederung])

  // Der gespeicherte Quizstand - hier ohne Fragenzahl zur Hand, deshalb
  // reicht die eingebaute Prüfung aus dem Stand selbst.
  const quizStand = quiz[kapitel.id]

  const index = alleKapitel.indexOf(kapitel)
  const vorher = alleKapitel[index - 1]
  const nachher = alleKapitel[index + 1]
  // Jedes Kapitel gibt es als eigene Komponente pro Sprache.
  const Inhalt = kapitel.Komponente[sprache]
  // Roter Faden rückwärts: wer baut auf diesem Kapitel auf? Projektschritte getrennt anzeigen.
  const nachfolger = aufbauendAuf(kapitel.id)
  const imProjekt = nachfolger.filter((k) => k.teil.id === 'projekt')
  const weiterfuehrend = nachfolger.filter((k) => k.teil.id !== 'projekt')

  // Erst ab drei Abschnitten lohnt ein Verzeichnis - darunter sieht man ohnehin alles.
  const mitGliederung = gliederung.length > 2

  return (
    <KapitelIdProvider id={kapitel.id}>
      {/* Auf breiten Bildschirmen (ab 2xl) steht die Gliederung als eigene Spalte rechts
          und läuft beim Scrollen mit. Darunter bleibt sie ein Kasten über dem Inhalt. */}
      <div className={mitGliederung ? '2xl:grid 2xl:grid-cols-[minmax(0,1fr)_15rem] 2xl:gap-12' : ''}>
        <article className="min-w-0 space-y-10">
          <header className="space-y-4">
            <p className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400">
              <TeilSymbol teil={kapitel.teil.id} groesse="klein" />
              {t.teil} {kapitel.teil.nummer} · {kapitel.teil.titel[sprache]}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="mr-2 text-slate-400 tabular-nums">{kapitel.nummer}</span>
              {kapitel.titel[sprache]}
            </h1>
            <p className="max-w-3xl text-lg text-slate-600 dark:text-slate-400">{kapitel.kurz[sprache]}</p>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Icon name="uhr" className="size-3.5" />
              {t.dauer(kapitel.dauer)} · {t.kapitelVon(index + 1, alleKapitel.length)}
            </p>
            {kapitel.grundlagen.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t.bautAuf}</span>
                {kapitel.grundlagen.map((id) => (
                  <KapitelChip key={id} id={id} />
                ))}
              </div>
            )}

            <div className={`${KARTE} p-4`}>
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <Icon name="ziel" className="size-4.5 text-brand-600 dark:text-brand-400" />
                {t.lernzieleTitel}
              </h2>
              <ul className="grid gap-x-6 gap-y-1.5 text-sm text-slate-700 sm:grid-cols-2 dark:text-slate-300">
                {kapitel.lernziele[sprache].map((ziel) => (
                  <li key={ziel} className="flex gap-2">
                    <Icon name="haken" className="mt-0.5 size-4 text-emerald-500" />
                    {ziel}
                  </li>
                ))}
              </ul>
            </div>
          </header>

          {mitGliederung && (
            <nav aria-labelledby="gliederung-titel" className={`${KARTE} px-4 py-3 text-sm 2xl:hidden`}>
              <h2
                id="gliederung-titel"
                className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
              >
                {t.aufDieserSeite}
              </h2>
              <ol className="space-y-1">
                {gliederung.map((abschnitt, i) => (
                  <li key={abschnitt.id} className="flex gap-2">
                    <span className="w-4 shrink-0 text-right text-slate-400 tabular-nums">{i + 1}</span>
                    {/* Eine Route, kein nacktes #fragment - sonst denkt der Hash-Router, die Seite wechselt. */}
                    <a
                      href={`#/${kapitel.id}/${abschnitt.id}`}
                      className="text-slate-700 hover:text-brand-600 hover:underline dark:text-slate-300 dark:hover:text-brand-400"
                    >
                      {abschnitt.titel}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <ErrorBoundary>
            {/* Kapitel werden per lazy() nachgeladen - solange zeigt Suspense den Platzhalter. */}
            <Suspense fallback={<Platzhalter label={t.kapitelLaedt} />}>
              <div ref={inhaltRef} className="space-y-10">
                <Inhalt />
                <GliederungMelden wurzel={inhaltRef} melden={setGliederung} />
              </div>
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
            {/* Übungen laden unabhängig vom Kapitel - ohne eigenen Platzhalter, sie stehen ja ganz unten. */}
            <Suspense fallback={<Platzhalter label={t.kapitelLaedt} bloecke={1} />}>
              <UebungenBereich kapitelId={kapitel.id} />
            </Suspense>
          </ErrorBoundary>

          {nachfolger.length > 0 && (
            <aside className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-sm dark:border-brand-900 dark:bg-brand-950/30">
              <h2 className="flex items-center gap-2 font-semibold">
                <Icon name="pfad" className="size-4 text-brand-600 dark:text-brand-400" />
                {t.roterFaden}
              </h2>
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

          <a
            href={'#/playground/' + kapitel.teil.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm transition hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:bg-brand-500/10"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              <Icon name="spielwiese" className="size-4" />
            </span>
            <span className="flex-1 text-slate-600 dark:text-slate-300">{t.playgroundHinweis(kapitel.teil.kurztitel[sprache])}</span>
            <span className="font-medium text-brand-700 dark:text-brand-400">{t.zumPlayground}</span>
          </a>

          <footer className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            {quizStand && (
              <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Icon name="frage" className="size-4" />
                {t.quizStand(quizStand.richtig, quizStand.gesamt)}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {istErledigt ? (
                <>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <Icon name="kreisHaken" className="size-5" />
                    {t.kapitelAbgeschlossen}
                  </span>
                  <button
                    onClick={() => erledigtSetzen(false)}
                    className="rounded text-sm text-slate-500 hover:underline dark:text-slate-400"
                  >
                    {t.rueckgaengig}
                  </button>
                </>
              ) : (
                <Button
                  variante="erfolg"
                  groesse="gross"
                  onClick={() => {
                    erledigtSetzen(true)
                    navigieren(nachher ? nachher.id : '')
                  }}
                >
                  <Icon name="haken" className="size-4.5" />
                  {t.kapitelAbschliessen}
                  {nachher ? t.undWeiter : ''}
                </Button>
              )}
            </div>

            <nav className="grid gap-3 sm:grid-cols-2" aria-label={t.kapitelBlaettern}>
              {vorher ? (
                <a
                  href={'#/' + vorher.id}
                  className="rounded-xl border border-slate-200 p-3 transition hover:border-brand-500 dark:border-slate-800"
                >
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t.zurueck}</span>
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
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t.weiter}</span>
                  <span className="block font-medium">
                    {nachher.nummer} {nachher.titel[sprache]}
                  </span>
                </a>
              )}
            </nav>
          </footer>
        </article>

        {mitGliederung && (
          <aside className="hidden 2xl:block">
            <nav aria-labelledby="gliederung-rand-titel" className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto text-sm">
              <h2
                id="gliederung-rand-titel"
                className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
              >
                {t.aufDieserSeite}
              </h2>
              <ol className="space-y-0.5 border-l border-slate-200 dark:border-slate-800">
                {gliederung.map((abschnitt) => {
                  const aktiv = abschnitt.id === aktiverAbschnitt
                  return (
                    <li key={abschnitt.id}>
                      <a
                        href={`#/${kapitel.id}/${abschnitt.id}`}
                        aria-current={aktiv ? 'location' : undefined}
                        className={`-ml-px block border-l-2 py-1 pl-3 leading-snug transition ${
                          aktiv
                            ? 'border-brand-500 font-medium text-brand-700 dark:text-brand-300'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-100'
                        }`}
                      >
                        {abschnitt.titel}
                      </a>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </aside>
        )}
      </div>
    </KapitelIdProvider>
  )
}
