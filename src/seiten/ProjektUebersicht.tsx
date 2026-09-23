import { Icon, TeilSymbol } from '../components/Icon'
import { ButtonLink, KARTE } from '../components/Ui'
import { KapitelChip, Verweis } from '../components/Verweis'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { alleKapitel } from '../kurs/kurs'

/**
 * Überblick über das ToDo-Projekt: alle Schritte als Zeitleiste mit ihrem Vorwissen.
 * Nichts ist gesperrt - man kann bei jedem Schritt einsteigen.
 */
export function ProjektUebersicht({ erledigt }: { erledigt: string[] }) {
  const { sprache } = useSprache()
  const t = useTexte()
  const schritte = alleKapitel.filter((k) => k.teil.id === 'projekt')

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <TeilSymbol teil="projekt" groesse="gross" />
          {t.projektTitel}
        </h1>
        <p className="max-w-3xl text-lg text-slate-600 dark:text-slate-400">{t.projektText}</p>
        <ButtonLink href={'#/' + schritte[0].id} groesse="gross">
          {t.projektStarten}
          <Icon name="pfeilRechts" className="size-4" />
        </ButtonLink>
      </header>

      <ol className="relative space-y-3 border-l-2 border-slate-200 pl-6 dark:border-slate-800">
        {schritte.map((schritt, i) => {
          const fertig = erledigt.includes(schritt.id)
          // Nur Kapitel als Vorwissen zeigen - der vorherige Schritt ist durch die Reihenfolge klar.
          const vorwissen = schritt.grundlagen.filter((id) => !id.startsWith('projekt-'))
          return (
            <li key={schritt.id} className="relative">
              <span
                className={`absolute top-3 -left-[35px] flex size-6 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  fertig
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400'
                }`}
                aria-hidden
              >
                {fertig ? <Icon name="haken" className="size-3.5" /> : i + 1}
              </span>
              <div className={`${KARTE} p-4`}>
                <a href={'#/' + schritt.id} className="group block">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {t.schrittNr(i + 1)} · <Icon name="uhr" className="size-3" /> {t.dauer(schritt.dauer)}
                  </span>
                  <span className="block font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {schritt.titel[sprache]}
                  </span>
                  <span className="block text-sm text-slate-600 dark:text-slate-400">{schritt.kurz[sprache]}</span>
                </a>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t.vorwissen}:</span>
                  {vorwissen.map((id) => (
                    <KapitelChip key={id} id={id} />
                  ))}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        <Icon name="laptop" className="mr-1.5 inline size-4 align-[-3px]" />
        <Verweis id="praxis-lokal" />
        {t.projektLokal}
      </p>
    </div>
  )
}
