import { useLocalStorage } from '../hooks/useLocalStorage'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { kurs } from '../kurs/kurs'
import { Icon, type IconName } from './Icon'
import { TEIL_STIL } from './teilStil'
import { Aufklapppfeil, KLEBT_MD, Taste } from './Ui'

/**
 * Kursnavigation: Suche, Nachschlage-Seiten und darunter die Teile des Kurses.
 * Den Playground gibt es nur einmal oben - zwischen den Teilen wechselt man auf der Seite selbst.
 *
 * Damit die Liste bei über 40 Einträgen übersichtlich bleibt, sind die Teile einklappbar.
 * Standard: nur der Teil des aktuellen Kapitels ist offen. Wer selbst auf- oder
 * zuklappt, überschreibt das - gespeichert wird nur die Abweichung vom Standard.
 * Beim Wechsel in einen anderen Teil geht dieser wieder auf, auch wenn man ihn vorher zugeklappt hatte.
 *
 * Die Übersichtsseite des ToDo-Projekts steht nicht separat oben, sondern als
 * erster Eintrag im Teil „Projekt“ - so gibt es jeden Eintrag nur einmal.
 */

/** Kleiner Fortschrittsring; voll = grüner Haken. */
function Fortschritt({ fertig, gesamt }: { fertig: number; gesamt: number }) {
  const umfang = 2 * Math.PI * 7
  if (gesamt > 0 && fertig === gesamt) {
    return (
      <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Icon name="haken" className="size-2.5" />
      </span>
    )
  }
  return (
    <svg viewBox="0 0 18 18" aria-hidden className="size-4 -rotate-90">
      <circle cx="9" cy="9" r="7" fill="none" strokeWidth="2.5" className="stroke-slate-200 dark:stroke-slate-700" />
      <circle
        cx="9"
        cy="9"
        r="7"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${(fertig / gesamt) * umfang} ${umfang}`}
        className={fertig ? 'stroke-brand-500' : 'stroke-transparent'}
      />
    </svg>
  )
}

export function Seitenleiste({
  route,
  erledigt,
  offen,
  schliessen,
  sucheOeffnen,
}: {
  route: string
  erledigt: string[]
  offen: boolean
  schliessen: () => void
  sucheOeffnen: () => void
}) {
  const { sprache } = useSprache()
  const t = useTexte()
  // Überdauert das Neuladen - wer zehn Teile zuklappt, will sie nicht wieder offen vorfinden.
  const [umgeschaltet, setUmgeschaltet] = useLocalStorage<Record<string, { offen: boolean; route: string }>>(
    'lernpfad-teile',
    {},
  )

  const seiten: { href: string; aktiv: boolean; label: string; icon: IconName }[] = [
    { href: '#', aktiv: route === '', label: t.uebersicht, icon: 'start' },
    { href: '#/glossar', aktiv: route.startsWith('glossar'), label: t.glossar, icon: 'buch' },
    { href: '#/playground', aktiv: route.startsWith('playground'), label: t.playground, icon: 'spielwiese' },
  ]

  // Einträge unterhalb eines Teils: dezent, aktiver Eintrag mit Akzentlinie links.
  const eintragStil = (aktiv: boolean) =>
    `-ml-px flex items-baseline gap-2 rounded-r-md border-l-2 py-1 pr-2 pl-3 text-code leading-snug transition ${
      aktiv
        ? 'border-brand-500 bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
        : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-100'
    }`

  return (
    <nav
      id="kursnavigation"
      aria-label={t.kapitelMenue}
      // Klicks auf Links sprudeln bis hierher hoch (Event Bubbling) - ein Handler für alle.
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a')) schliessen()
      }}
      // Mobil: nur sichtbar, wenn das Menü offen ist (dann als Overlay unter der Kopfzeile -
      // top-14.25 ist deren gemessene Höhe). Ab md: immer sichtbar, klebt beim Scrollen.
      className={`${offen ? 'fixed inset-x-0 top-14.25 bottom-0 z-30 block overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-slate-950' : 'hidden'} ${KLEBT_MD} md:block md:w-60 md:shrink-0 md:bg-transparent md:p-0 md:pr-2`}
    >
      <button
        onClick={() => {
          schliessen()
          sucheOeffnen()
        }}
        className="mb-3 flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-sm text-slate-500 shadow-xs transition hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
      >
        <Icon name="suche" className="size-4 text-slate-400" />
        <span className="flex-1">{t.sucheOeffnen}</span>
        <Taste>{t.strg} K</Taste>
      </button>

      <ul className="mb-3 space-y-0.5">
        {seiten.map((s) => (
          <li key={s.href}>
            <a
              href={s.href}
              aria-current={s.aktiv ? 'page' : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition ${
                s.aktiv
                  ? 'bg-white font-medium text-slate-900 shadow-xs ring-1 ring-slate-200 dark:bg-slate-900 dark:text-white dark:ring-slate-800'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon name={s.icon} className="size-4 text-slate-400" />
              {s.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
        {kurs.map((teil) => {
          const fertig = teil.kapitel.filter((k) => erledigt.includes(k.id)).length
          const istProjekt = teil.id === 'projekt'
          const enthaeltAktives = teil.kapitel.some((k) => k.id === route) || (istProjekt && route === 'projekt')
          const manuell = umgeschaltet[teil.id]
          const istOffen = manuell && (!enthaeltAktives || manuell.route === route) ? manuell.offen : enthaeltAktives
          const listenId = 'teil-' + teil.id
          const stil = TEIL_STIL[teil.id] ?? TEIL_STIL.javascript

          return (
            <div key={teil.id} className="mb-0.5">
              <button
                onClick={() => setUmgeschaltet((alt) => ({ ...alt, [teil.id]: { offen: !istOffen, route } }))}
                aria-expanded={istOffen}
                aria-controls={listenId}
                title={`${t.teil} ${teil.nummer} · ${teil.titel[sprache]} - ${fertig}/${teil.kapitel.length} ${t.erledigt}`}
                className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              >
                <span className={`flex size-6 items-center justify-center rounded-md ${stil.farbe}`}>
                  <Icon name={stil.icon} className="size-3.5" />
                </span>
                <span
                  className={`flex-1 text-sm ${enthaeltAktives ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-200'}`}
                >
                  {teil.kurztitel[sprache]}
                </span>
                <span className="sr-only">
                  {fertig}/{teil.kapitel.length} {t.erledigt}
                </span>
                <Fortschritt fertig={fertig} gesamt={teil.kapitel.length} />
                <Aufklapppfeil offen={istOffen} />
              </button>

              {istOffen && (
                <ul id={listenId} className="my-1 ml-5.5 border-l border-slate-200 dark:border-slate-800">
                  {istProjekt && (
                    <li>
                      <a
                        href="#/projekt"
                        aria-current={route === 'projekt' ? 'page' : undefined}
                        className={eintragStil(route === 'projekt')}
                      >
                        <Icon name="raster" className="size-3.5 self-center opacity-60" />
                        <span className="flex-1">{t.uebersicht}</span>
                      </a>
                    </li>
                  )}
                  {teil.kapitel.map((k, i) => {
                    const istAktiv = k.id === route
                    const istErledigt = erledigt.includes(k.id)
                    return (
                      <li key={k.id}>
                        <a href={'#/' + k.id} aria-current={istAktiv ? 'page' : undefined} className={eintragStil(istAktiv)}>
                          <span className="w-4 shrink-0 text-right text-2xs text-slate-400 tabular-nums dark:text-slate-500">
                            {i + 1}
                          </span>
                          <span className="flex-1">{k.titel[sprache]}</span>
                          {istErledigt && (
                            <span className="self-center text-emerald-500">
                              <Icon name="haken" className="size-3.5" />
                              <span className="sr-only">{t.erledigt}</span>
                            </span>
                          )}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
