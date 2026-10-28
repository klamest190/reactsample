import { Fragment, useMemo, useState, type CSSProperties } from 'react'
import { Icon, TeilSymbol, type IconName } from '../components/Icon'
import { BEREICH_STIL } from '../components/partStyle'
import { Button, Taste } from '../components/Ui'
import { useFortschritt } from '../context/ProgressContext'
import { useSprache, useTexte } from '../i18n/LanguageContext'
import { alleKapitel, BEREICHE, kurs, type KapitelMitTeil } from '../course/course'
import { buildRouteMap, type RouteMap, type Station } from '../course/routeMap'

/**
 * Übersicht: Wo stehe ich, wie geht es weiter, wie hängt der Kurs zusammen?
 *
 * The centre is the route map: one line per area, one station per part (see
 * course/routeMap.ts). The travelled stretch of a line is solid, the rest dashed - the map
 * is the progress display. Picking a station shows its chapters below the map
 * (on narrow screens directly under the station).
 */
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

  // Abgeleitet: das erste noch offene Kapitel und sein Teil ("Du bist hier").
  const naechstes = alleKapitel.find((k) => !erledigt.includes(k.id))
  const gesamtMinuten = alleKapitel.reduce((summe, k) => summe + k.dauer, 0)
  const karte = useMemo(() => buildRouteMap(kurs, BEREICHE, alleKapitel, erledigt), [erledigt])
  const [gewaehlt, setGewaehlt] = useState<string | null>(naechstes?.teil.id ?? kurs[0].id)
  const waehlen = (id: string) => setGewaehlt((alt) => (alt === id ? null : id))
  const gewaehlteStation = karte.lines.flatMap((linie) => linie.stations).find((s) => s.part.id === gewaehlt)

  const nachschlagen: { href: string; icon: IconName; titel: string; text: string }[] = [
    { href: '#/glossar', icon: 'buch', titel: t.glossar, text: t.kartenGlossar },
    { href: '#/projekt', icon: 'checkliste', titel: t.projekt, text: t.kartenProjekt },
    { href: '#/playground', icon: 'spielwiese', titel: t.playground, text: t.kartenPlayground },
  ]
  const react = kurs.find((teil) => teil.id === 'react')!

  return (
    <div className="max-w-6xl space-y-14">
      <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-12">
        <div className="space-y-4">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">{t.heroTitel}</h1>
          <p className="max-w-2xl text-xl leading-relaxed text-slate-600 dark:text-slate-400">{t.heroText}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t.kursUmfang(alleKapitel.length, Math.round(gesamtMinuten / 60))}
          </p>
        </div>
        <NaechstesKapitel kapitel={naechstes} begonnen={erledigt.length > 0} navigieren={navigieren} />
      </section>

      <section aria-labelledby="lernpfad-titel" className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <h2 id="lernpfad-titel" className="text-xl font-bold tracking-tight">
              {t.derLernpfad}
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">{t.kartenHinweis}</p>
          </div>
          <Legende />
        </div>

        <KarteQuer karte={karte} hier={naechstes?.teil.id} gewaehlt={gewaehlt} waehlen={waehlen} />
        {gewaehlteStation && (
          <div className="hidden lg:block">
            <TeilDetail id="teil-detail" station={gewaehlteStation} erledigt={erledigt} />
          </div>
        )}
        <KarteSenkrecht karte={karte} hier={naechstes?.teil.id} gewaehlt={gewaehlt} waehlen={waehlen} erledigt={erledigt} />
      </section>

      <section aria-labelledby="so-lernst-du" className="border-t border-slate-200 pt-10 dark:border-slate-800">
        <h2 id="so-lernst-du" className="text-xl font-bold tracking-tight">
          {t.soLernstDu}
        </h2>
        {/* Wirklich eine Reihenfolge - deshalb nummeriert. */}
        <ol className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.schritte.map((s, i) => (
            <li key={s.icon} className="flex gap-3">
              <span aria-hidden className="text-xl leading-tight font-bold text-brand-600 tabular-nums dark:text-brand-400">
                {i + 1}
              </span>
              <span>
                <span className="block font-semibold">{s.titel}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="nachschlagen-titel" className="border-t border-slate-200 pt-10 dark:border-slate-800">
        <h2 id="nachschlagen-titel" className="text-xl font-bold tracking-tight">
          {t.wissensdatenbank}
        </h2>
        <ul className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            {/* Die Suche ist ein Knopf (öffnet den Dialog), die anderen sind Links. */}
            <button onClick={sucheOeffnen} className="group text-left">
              <span className="flex items-center gap-2 font-semibold group-hover:underline">
                <Icon name="suche" className="size-4 text-brand-600 dark:text-brand-400" />
                {t.suche}
                <Taste>{t.strg} K</Taste>
              </span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{t.kartenSuche}</span>
            </button>
          </li>
          {nachschlagen.map((k) => (
            <li key={k.href}>
              <a href={k.href} className="group block">
                <span className="flex items-center gap-2 font-semibold group-hover:underline">
                  <Icon name={k.icon} className="size-4 text-brand-600 dark:text-brand-400" />
                  {k.titel}
                </span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{k.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-10 border-t border-slate-200 pt-10 text-sm leading-relaxed text-slate-600 lg:grid-cols-2 dark:border-slate-800 dark:text-slate-400">
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">{t.editorTippsTitel}</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Taste>{t.strg}</Taste> + <Taste>Enter</Taste> {t.tippAusfuehren}
            </li>
            <li>
              {t.tippVorschlaege} <Taste>{t.strg}</Taste> + <Taste>{t.leertaste}</Taste> {t.tippVorschlaegeOeffnen}
            </li>
            <li>{t.tippSpeichern}</li>
            <li>
              <Taste>Tab</Taste> {t.tippTab} <Taste>Esc</Taste> {t.tippTabVerlassen}
            </li>
            <li>
              {t.tippSprung}{' '}
              <a
                href={'#/' + react.kapitel[0].id}
                className="text-brand-700 underline decoration-brand-300 underline-offset-2 hover:decoration-solid dark:text-brand-300"
              >
                {t.teil} {react.nummer}: {react.kurztitel[sprache]}
              </a>
              .
            </li>
          </ul>
        </section>
        <FortschrittZuruecksetzen />
      </div>
    </div>
  )
}

/** Die Karte oben rechts: das erste offene Kapitel mit einem Knopf dorthin. */
function NaechstesKapitel({
  kapitel,
  begonnen,
  navigieren,
}: {
  kapitel: KapitelMitTeil | undefined
  begonnen: boolean
  navigieren: (id: string) => void
}) {
  const { sprache } = useSprache()
  const t = useTexte()

  if (!kapitel) {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-white p-6 font-semibold text-emerald-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-emerald-400 dark:ring-slate-800">
        <Icon name="pokal" className="size-5" />
        {t.allesGeschafft}
      </p>
    )
  }
  const stil = BEREICH_STIL[kapitel.teil.bereich]
  return (
    <div className={`rounded-2xl border-t-4 bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 ${stil.rand}`}>
      <p className="text-sm text-slate-600 dark:text-slate-400">{t.alsNaechstes}</p>
      <p className={`mt-3 flex items-center gap-2 text-sm font-semibold ${stil.text}`}>
        <TeilSymbol teil={kapitel.teil.id} groesse="klein" />
        {t.teil} {kapitel.teil.nummer}: {kapitel.teil.titel[sprache]}
      </p>
      <h2 className="mt-1.5 text-xl leading-tight font-bold tracking-tight">
        <span className="mr-2 text-slate-500 tabular-nums dark:text-slate-400">{kapitel.nummer}</span>
        {kapitel.titel[sprache]}
      </h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{kapitel.kurz[sprache]}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button groesse="gross" onClick={() => navigieren(kapitel.id)}>
          {begonnen ? t.weiterLernen : t.jetztStarten}
        </Button>
        <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <Icon name="uhr" className="size-3.5" />
          {t.dauer(kapitel.dauer)}
        </span>
      </div>
    </div>
  )
}

type KartenProps = { karte: RouteMap; hier: string | undefined; gewaehlt: string | null; waehlen: (id: string) => void }

/**
 * Ab lg: die Linien waagerecht in einem Raster, eine Spalte pro Station. Jede Linie belegt
 * drei Zeilen (Name, Gleis, Stationsnamen); das Gleis ist genau 2rem hoch, damit Umstiege
 * und Strecken auf der Mitte der Punkte ansetzen.
 */
function KarteQuer({ karte, hier, gewaehlt, waehlen }: KartenProps) {
  const { sprache } = useSprache()
  const t = useTexte()
  const raster: CSSProperties = {
    gridTemplateColumns: `repeat(${karte.columns}, minmax(0, 1fr))`,
    gridTemplateRows: karte.lines.map(() => 'auto 2rem auto').join(' '),
  }

  return (
    <div className="hidden lg:grid" style={raster}>
      {karte.transfers.map((u) => (
        <div
          key={`${u.column}-${u.fromLine}-${u.toLine}`}
          aria-hidden
          className="relative"
          style={{ gridColumn: u.column + 1, gridRow: `${3 * u.fromLine + 2} / ${3 * u.toLine + 3}` }}
        >
          <span className="absolute inset-y-4 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      ))}

      {karte.lines.map((linie, li) => {
        const stil = BEREICH_STIL[linie.area]
        return (
          <Fragment key={linie.area}>
            {/* The label sits on the page background, so a transfer running behind it is
                interrupted instead of crossing the text - as on a printed route map. */}
            <h3
              className={`relative justify-self-start px-1 pb-2 ${li > 0 ? 'pt-8' : ''}`}
              style={{ gridColumn: `${linie.stations[0].column + 1} / -1`, gridRow: 3 * li + 1 }}
            >
              <span className="flex flex-wrap items-baseline gap-x-2 bg-slate-50 px-1 dark:bg-slate-950">
                <span className={`font-bold ${stil.text}`}>{t.bereiche[linie.area].titel}</span>
                <span className="text-sm font-normal text-slate-600 dark:text-slate-400">{t.bereiche[linie.area].text}</span>
              </span>
            </h3>

            {linie.stations.slice(0, -1).map((s) => (
              <div
                key={s.part.id}
                aria-hidden
                className="relative"
                style={{ gridColumn: `${s.column + 1} / span 2`, gridRow: 3 * li + 2 }}
              >
                <span className={`absolute inset-x-1/4 top-1/2 -translate-y-1/2 border-t-4 border-dashed ${stil.rand}`} />
                <span className="absolute inset-x-1/4 top-1/2 h-1.5 -translate-y-1/2">
                  <span
                    className={`block h-full origin-left animate-track rounded-full ${stil.linie}`}
                    style={{ width: `${(s.done / s.total) * 100}%`, animationDelay: `${s.column * 90}ms` }}
                  />
                </span>
              </div>
            ))}

            {linie.stations.map((s) => {
              const istGewaehlt = gewaehlt === s.part.id
              return (
                <button
                  key={s.part.id}
                  onClick={() => waehlen(s.part.id)}
                  aria-pressed={istGewaehlt}
                  aria-controls={istGewaehlt ? 'teil-detail' : undefined}
                  className="group relative flex flex-col items-center gap-0.5 rounded-lg px-1 pb-2 text-center"
                  style={{ gridColumn: s.column + 1, gridRow: `${3 * li + 2} / span 2` }}
                >
                  <span className="flex h-8 items-center">
                    <Punkt station={s} hier={hier === s.part.id} />
                  </span>
                  <span
                    className={`mt-1 bg-slate-50 px-1 text-sm leading-tight font-semibold decoration-2 underline-offset-4 dark:bg-slate-950 ${
                      istGewaehlt ? `underline ${stil.deko}` : 'group-hover:underline'
                    }`}
                  >
                    {s.part.kurztitel[sprache]}
                  </span>
                  <span className="bg-slate-50 px-1 text-xs text-slate-600 tabular-nums dark:bg-slate-950 dark:text-slate-400">
                    {s.done}/{s.total}
                    <span className="sr-only"> {t.erledigt}</span>
                  </span>
                  {hier === s.part.id && <span className={`bg-slate-50 px-1 text-xs font-semibold dark:bg-slate-950 ${stil.text}`}>{t.duBistHier}</span>}
                </button>
              )
            })}
          </Fragment>
        )
      })}
    </div>
  )
}

/** Unter lg: jede Linie senkrecht, die Kapitel klappen direkt unter der gewählten Station auf. */
function KarteSenkrecht({ karte, hier, gewaehlt, waehlen, erledigt }: KartenProps & { erledigt: string[] }) {
  const { sprache } = useSprache()
  const t = useTexte()
  const spalteVon = new Map(karte.lines.flatMap((linie) => linie.stations.map((s) => [s.part.id, s.column])))

  return (
    <div className="space-y-8 lg:hidden">
      {karte.lines.map((linie) => {
        const stil = BEREICH_STIL[linie.area]
        return (
          <div key={linie.area}>
            <h3 className="mb-3 flex flex-wrap items-baseline gap-x-2">
              <span className={`font-bold ${stil.text}`}>{t.bereiche[linie.area].titel}</span>
              <span className="text-sm font-normal text-slate-600 dark:text-slate-400">{t.bereiche[linie.area].text}</span>
            </h3>
            <ol>
              {linie.stations.map((s, i) => {
                const offen = gewaehlt === s.part.id
                const umstieg = s.changeFrom.filter((teil) => spalteVon.get(teil.id) === s.column)
                return (
                  <li key={s.part.id} className="relative pb-4 pl-11">
                    {i < linie.stations.length - 1 && (
                      <span aria-hidden className="absolute top-4 -bottom-4 left-0 w-8">
                        <span className={`absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-4 border-dashed ${stil.rand}`} />
                        <span
                          className={`absolute top-0 left-1/2 w-1.5 -translate-x-1/2 origin-top animate-track-down rounded-full ${stil.linie}`}
                          style={{ height: `${(s.done / s.total) * 100}%` }}
                        />
                      </span>
                    )}
                    <span className="absolute top-0 left-0 flex size-8 items-center justify-center">
                      <Punkt station={s} hier={hier === s.part.id} />
                    </span>
                    <button
                      onClick={() => waehlen(s.part.id)}
                      aria-expanded={offen}
                      aria-controls={offen ? `teil-detail-${s.part.id}` : undefined}
                      className="flex min-h-8 w-full flex-wrap items-baseline gap-x-2 rounded-lg text-left"
                    >
                      <span className={`font-semibold decoration-2 underline-offset-4 ${offen ? `underline ${stil.deko}` : ''}`}>
                        {s.part.kurztitel[sprache]}
                      </span>
                      <span className="text-sm text-slate-600 tabular-nums dark:text-slate-400">
                        {s.done}/{s.total}
                        <span className="sr-only"> {t.erledigt}</span>
                      </span>
                      {hier === s.part.id && <span className={`text-sm font-semibold ${stil.text}`}>{t.duBistHier}</span>}
                    </button>
                    {umstieg.length > 0 && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t.umstiegVon(umstieg.map((teil) => teil.kurztitel[sprache]).join(', '))}
                      </p>
                    )}
                    {offen && (
                      <div className="mt-3">
                        <TeilDetail id={`teil-detail-${s.part.id}`} station={s} erledigt={erledigt} Ueberschrift="h4" />
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Eine Station: offen (Ring), begonnen (Ring mit Kern), geschafft (gefüllt mit Haken).
 * "Du bist hier" bekommt einen Hof in der Linienfarbe.
 */
function Punkt({ station, hier }: { station: Station; hier: boolean }) {
  const stil = BEREICH_STIL[station.part.bereich]
  const geschafft = station.done === station.total
  return (
    <span
      className={`flex size-6 items-center justify-center rounded-full border-4 ${stil.rand} ${
        geschafft ? `${stil.punkt} text-white` : 'bg-white dark:bg-slate-950'
      } ${hier ? `ring-6 ${stil.halo}` : ''}`}
    >
      {geschafft ? (
        <Icon name="haken" className="size-3" />
      ) : station.done > 0 ? (
        <span className={`size-2 rounded-full ${stil.punkt}`} />
      ) : null}
    </span>
  )
}

/** Die drei Zustände einer Station - in Grau, sie gelten für alle Linien. */
function Legende() {
  const t = useTexte()
  const ring = 'flex size-4 items-center justify-center rounded-full border-[3px] border-slate-600 dark:border-slate-400'
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
      <li className="flex items-center gap-2">
        <span aria-hidden className={`${ring} bg-slate-600 text-white dark:bg-slate-400 dark:text-slate-950`}>
          <Icon name="haken" className="size-2.5" />
        </span>
        {t.legende.fertig}
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden className={`${ring} bg-white dark:bg-slate-950`}>
          <span className="size-1.5 rounded-full bg-slate-600 dark:bg-slate-400" />
        </span>
        {t.legende.begonnen}
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden className={`${ring} bg-white dark:bg-slate-950`} />
        {t.legende.offen}
      </li>
    </ul>
  )
}

/** Die Kapitel der gewählten Station - unter der Karte (ab lg) oder unter der Station. */
function TeilDetail({
  id,
  station,
  erledigt,
  Ueberschrift = 'h3',
}: {
  id: string
  station: Station
  erledigt: string[]
  Ueberschrift?: 'h3' | 'h4'
}) {
  const { sprache } = useSprache()
  const t = useTexte()
  const teil = station.part
  const stil = BEREICH_STIL[teil.bereich]

  return (
    <div id={id} className={`rounded-xl border-l-4 bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 ${stil.rand}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TeilSymbol teil={teil.id} groesse="gross" />
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t.teil} {teil.nummer}
            </p>
            <Ueberschrift className="text-xl leading-tight font-bold">{teil.titel[sprache]}</Ueberschrift>
          </div>
        </div>
        <span className="text-sm text-slate-600 tabular-nums dark:text-slate-400">
          {station.done}/{station.total} {t.erledigt}
        </span>
      </div>
      <p className="mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-400">{teil.beschreibung[sprache]}</p>
      {station.changeFrom.length > 0 && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t.bautAuf} {station.changeFrom.map((andere) => andere.kurztitel[sprache]).join(', ')}
        </p>
      )}
      {/* Spalten statt Raster: die Kapitel laufen von oben nach unten, wie man sie liest. */}
      <ol className="mt-4 gap-x-6 sm:columns-2 xl:columns-3">
        {teil.kapitel.map((k, i) => (
          <li key={k.id} className="break-inside-avoid">
            <a href={'#/' + k.id} className="flex gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
              <span className="w-8 shrink-0 text-slate-600 tabular-nums dark:text-slate-400">
                {teil.nummer}.{i + 1}
              </span>
              <span className="flex-1">{k.titel[sprache]}</span>
              {erledigt.includes(k.id) && (
                <span className="self-center text-emerald-600 dark:text-emerald-400">
                  <Icon name="haken" className="size-4" />
                  <span className="sr-only">{t.erledigt}</span>
                </span>
              )}
            </a>
          </li>
        ))}
      </ol>
      {teil.id === 'projekt' && (
        <a
          href="#/projekt"
          className="mt-3 inline-block px-2 text-sm font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 dark:text-brand-300"
        >
          {t.uebersicht}
        </a>
      )}
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
    <section>
      <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">{t.fortschrittTitel}</h2>
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
