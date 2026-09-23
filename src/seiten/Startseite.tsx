import { useState } from 'react'
import { Icon, TeilSymbol, type IconName } from '../components/Icon'
import { Button, KARTE, Taste } from '../components/Ui'
import { useFortschritt } from '../context/FortschrittContext'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { alleKapitel, BEREICHE, kurs, type Teil } from '../kurs/kurs'

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
  const karte = `${KARTE} group block p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md dark:hover:border-brand-500`

  // Die vier Nachschlage-Karten. Die Suche ist ein Knopf (öffnet den Dialog), die anderen sind Links.
  const nachschlagen: { href: string; icon: IconName; titel: string; text: string }[] = [
    { href: '#/glossar', icon: 'buch', titel: t.glossar, text: t.kartenGlossar },
    { href: '#/projekt', icon: 'checkliste', titel: t.projekt, text: t.kartenProjekt },
    { href: '#/playground', icon: 'spielwiese', titel: t.playground, text: t.kartenPlayground },
  ]

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
              {naechstes.titel[sprache]}
              <Icon name="pfeilRechts" className="size-4" />
            </Button>
          ) : (
            <p className="flex items-center gap-2 font-medium text-emerald-600">
              <Icon name="pokal" className="size-5" />
              {t.allesGeschafft}
            </p>
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
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
                <Icon name={s.icon} className="size-4.5" />
              </span>
              <div className="mt-3 font-semibold">
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
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
              <Icon name="suche" className="size-4.5" />
            </span>
            <span className="mt-3 block font-semibold">
              {t.suche} <Taste className="ml-1">{t.strg} K</Taste>
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{t.kartenSuche}</span>
          </button>
          {nachschlagen.map((k) => (
            <a key={k.href} href={k.href} className={karte}>
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
                <Icon name={k.icon} className="size-4.5" />
              </span>
              <span className="mt-3 flex items-center gap-1 font-semibold">
                {k.titel}
                <Icon
                  name="pfeilRechts"
                  className="size-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                />
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">{k.text}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          {t.derLernpfad}
        </h2>
        {/* Wie in der Seitenleiste: erst der Browser (inkl. ToDo-Projekt), dann der Server. */}
        {BEREICHE.map((bereich) => (
          <div key={bereich} className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-slate-200 pb-2 dark:border-slate-800">
              <h3 className="text-xl font-bold tracking-tight">{t.bereiche[bereich].titel}</h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">{t.bereiche[bereich].text}</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {kurs
                .filter((teil) => teil.bereich === bereich && teil !== projekt)
                .map((teil) => (
                  <TeilKarte key={teil.id} teil={teil} erledigt={erledigt} />
                ))}
            </div>
            {projekt.bereich === bereich && <ProjektLeiste projekt={projekt} erledigt={erledigt} />}
          </div>
        ))}
      </section>

      <section className={`${KARTE} p-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400`}>
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <Icon name="code" className="size-4 text-brand-600 dark:text-brand-400" />
          {t.editorTippsTitel}
        </h2>
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

/** Ein Kursteil als Karte: Symbol, Titel, Fortschritt und die Kapitelliste. */
function TeilKarte({ teil, erledigt }: { teil: Teil; erledigt: string[] }) {
  const { sprache } = useSprache()
  const t = useTexte()
  const fertig = teil.kapitel.filter((k) => erledigt.includes(k.id)).length

  return (
    <div className={`${KARTE} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <TeilSymbol teil={teil.id} groesse="gross" />
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {t.teil} {teil.nummer}
            </p>
            <h4 className="text-lg leading-tight font-bold">{teil.titel[sprache]}</h4>
          </div>
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
              {erledigt.includes(k.id) && <Icon name="haken" className="size-4 self-center text-emerald-500" />}
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Der rote Faden des Frontends: die Schritte des ToDo-Projekts als Leiste. */
function ProjektLeiste({ projekt, erledigt }: { projekt: Teil; erledigt: string[] }) {
  const { sprache } = useSprache()
  const t = useTexte()

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-900/60 dark:bg-rose-950/20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-3 text-lg font-bold">
          <TeilSymbol teil="projekt" groesse="gross" />
          <span>
            <span className="block text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {t.teil} {projekt.nummer} · {t.roterFaden}
            </span>
            {projekt.titel[sprache]}
          </span>
        </h4>
        <a
          href="#/projekt"
          className="flex items-center gap-1 text-sm font-medium text-rose-700 hover:underline dark:text-rose-300"
        >
          {t.uebersicht}
          <Icon name="pfeilRechts" className="size-3.5" />
        </a>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{projekt.beschreibung[sprache]}</p>
      <ol className="mt-4 flex flex-wrap gap-2">
        {projekt.kapitel.map((schritt, i) => (
          <li key={schritt.id}>
            <a
              href={'#/' + schritt.id}
              title={schritt.kurz[sprache]}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition hover:border-rose-400 ${
                erledigt.includes(schritt.id)
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {erledigt.includes(schritt.id) ? (
                <Icon name="haken" className="size-3.5" />
              ) : (
                <span className="font-semibold tabular-nums">{i + 1}</span>
              )}
              {schritt.titel[sprache]}
            </a>
          </li>
        ))}
      </ol>
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
      <h2 className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
        <Icon name="papierkorb" className="size-4 text-slate-500 dark:text-slate-400" />
        {t.fortschrittTitel}
      </h2>
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
