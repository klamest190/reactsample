import { useState } from 'react'
import { Button, KARTE, Taste } from '../components/Ui'
import { useFortschritt } from '../context/FortschrittContext'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { alleKapitel, kurs } from '../kurs/kurs'

/** Übersicht: Wie funktioniert der Kurs, welche Teile gibt es, wo geht es weiter? */
export function Startseite({
  erledigt,
  navigieren,
  sucheOeffnen,
}: {
  erledigt: string[]
  navigieren: (id: string) => void
  sucheOeffnen: () => void
}) {
  const { sprache } = useSprache()
  const t = useTexte()

  // Abgeleitet: das erste noch offene Kapitel.
  const naechstes = alleKapitel.find((k) => !erledigt.includes(k.id))
  const gesamtMinuten = alleKapitel.reduce((summe, k) => summe + k.dauer, 0)

  const projekt = kurs.find((teil) => teil.id === 'projekt')!
  const react = kurs.find((teil) => teil.id === 'react')!
  const karte = `${KARTE} block p-4 text-left transition hover:border-brand-500 hover:shadow-sm`

  return (
    <div className="space-y-12">
      <section className="space-y-5">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight">
          {t.heroTitel}
          <span className="text-brand-600 dark:text-brand-400">{t.heroTitelBetont}</span>
        </h1>
        <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">{t.heroText}</p>
        <div className="flex flex-wrap items-center gap-3">
          {naechstes ? (
            <Button groesse="gross" onClick={() => navigieren(naechstes.id)}>
              {erledigt.length === 0 ? t.jetztStarten : t.weiterLernen}: {naechstes.nummer}{' '}
              {naechstes.titel[sprache]} →
            </Button>
          ) : (
            <p className="font-medium text-emerald-600">{t.allesGeschafft}</p>
          )}
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t.kursUmfang(alleKapitel.length, Math.round(gesamtMinuten / 60))}
          </span>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          {t.soLernstDu}
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.schritte.map((s, i) => (
            <li key={s.icon} className={`${KARTE} p-4`}>
              <div className="text-2xl" aria-hidden>
                {s.icon}
              </div>
              <div className="mt-2 font-semibold">
                {i + 1}. {s.titel}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          {t.wissensdatenbank}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button onClick={sucheOeffnen} className={karte}>
            <span className="text-2xl" aria-hidden>
              🔍
            </span>
            <span className="mt-1 block font-semibold">
              {t.suche} <Taste className="ml-1">{t.strg} K</Taste>
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{t.kartenSuche}</span>
          </button>
          <a href="#/glossar" className={karte}>
            <span className="text-2xl" aria-hidden>
              📚
            </span>
            <span className="mt-1 block font-semibold">{t.glossar}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{t.kartenGlossar}</span>
          </a>
          <a href="#/projekt" className={karte}>
            <span className="text-2xl" aria-hidden>
              🧵
            </span>
            <span className="mt-1 block font-semibold">{t.projekt}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{t.kartenProjekt}</span>
          </a>
          <a href="#/playground" className={karte}>
            <span className="text-2xl" aria-hidden>
              🛝
            </span>
            <span className="mt-1 block font-semibold">{t.playground}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{t.kartenPlayground}</span>
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          {t.derLernpfad}
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {kurs
            .filter((teil) => teil !== projekt)
            .map((teil) => {
            const fertig = teil.kapitel.filter((k) => erledigt.includes(k.id)).length
            return (
              <div key={teil.id} className={`${KARTE} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-brand-600 uppercase dark:text-brand-400">
                      {t.teil} {teil.nummer}
                    </p>
                    <h3 className="text-xl font-bold">
                      {teil.icon} {teil.titel[sprache]}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs tabular-nums dark:bg-slate-800">
                    {fertig}/{teil.kapitel.length}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{teil.beschreibung[sprache]}</p>
                <ol className="mt-4 space-y-1">
                  {teil.kapitel.map((k, i) => (
                    <li key={k.id}>
                      <a
                        href={'#/' + k.id}
                        className="flex gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className="w-8 shrink-0 text-slate-400 tabular-nums">
                          {teil.nummer}.{i + 1}
                        </span>
                        <span className="flex-1">{k.titel[sprache]}</span>
                        {erledigt.includes(k.id) && <span className="text-emerald-500">✓</span>}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )
          })}
        </div>

        {/* Der rote Faden quer durch alle Teile: die Projektschritte als Leiste. */}
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-900 dark:bg-brand-950/30">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-xl font-bold">
              {projekt.icon} {projekt.titel[sprache]}
            </h3>
            <a href="#/projekt" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400">
              {t.uebersicht} →
            </a>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{projekt.beschreibung[sprache]}</p>
          <ol className="mt-4 flex flex-wrap gap-2">
            {projekt.kapitel.map((schritt, i) => (
              <li key={schritt.id}>
                <a
                  href={'#/' + schritt.id}
                  title={schritt.kurz[sprache]}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition hover:border-brand-500 ${
                    erledigt.includes(schritt.id)
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <span className="font-semibold tabular-nums">{erledigt.includes(schritt.id) ? '✓' : i + 1}</span>
                  {schritt.titel[sprache]}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${KARTE} p-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400`}>
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">{t.editorTippsTitel}</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Taste>{t.strg}</Taste> + <Taste>Enter</Taste> {t.tippAusfuehren}
          </li>
          <li>
            {t.tippVorschlaege} <Taste>{t.strg}</Taste> + <Taste>{t.leertaste}</Taste>{' '}
            {t.tippVorschlaegeOeffnen}
          </li>
          <li>{t.tippSpeichern}</li>
          <li>
            <Taste>Tab</Taste> {t.tippTab} <Taste>Esc</Taste> {t.tippTabVerlassen}
          </li>
          <li>
            {t.tippSprung}{' '}
            <a href={'#/' + react.kapitel[0].id} className="text-brand-600 hover:underline dark:text-brand-400">
              {t.teil} {react.nummer} · {react.kurztitel[sprache]}
            </a>
            .
          </li>
        </ul>
      </section>

      <FortschrittZuruecksetzen />
    </div>
  )
}

/**
 * Zurücksetzen in zwei Schritten statt mit confirm(): der Kurs lehrt confirm()
 * als Beispiel, in der App selbst wäre es ein schlechtes Vorbild.
 */
function FortschrittZuruecksetzen() {
  const t = useTexte()
  const { allesZuruecksetzen } = useFortschritt()
  const [sicher, setSicher] = useState(false)

  return (
    <section className={`${KARTE} p-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400`}>
      <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">{t.fortschrittTitel}</h2>
      <p className="mb-3 max-w-2xl">{t.fortschrittText}</p>
      <Button
        variante={sicher ? 'gefahr' : 'sekundaer'}
        onClick={() => {
          if (!sicher) return setSicher(true)
          allesZuruecksetzen()
          setSicher(false)
        }}
      >
        {sicher ? t.wirklichZuruecksetzen : t.fortschrittZuruecksetzen}
      </Button>
    </section>
  )
}
