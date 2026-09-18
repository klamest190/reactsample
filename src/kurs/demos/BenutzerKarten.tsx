import { Demo } from '../../components/Ui'
import { useSprache } from '../../i18n/SpracheContext'

/**
 * Live-Demo (Kapitel 2.2): typisierte Props + Liste mit key.
 * Die Texte liegen zweisprachig im Objekt TEXTE - so machen es alle Demos.
 */

type Rolle = 'admin' | 'redakteur' | 'gast'

// Props mit TypeScript beschreiben. `?` = optional, Union = nur diese Werte erlaubt.
type BenutzerKarteProps = {
  name: string
  rolle: Rolle
  punkte?: number
}

const TEXTE = {
  de: {
    titel: 'Typisierte Props & Liste',
    punkte: 'Punkte',
    rollen: { admin: 'Admin', redakteur: 'Redakteur', gast: 'Gast' },
  },
  en: {
    titel: 'Typed props & list',
    punkte: 'points',
    rollen: { admin: 'Admin', redakteur: 'Editor', gast: 'Guest' },
  },
}

const benutzer: (BenutzerKarteProps & { id: number })[] = [
  { id: 1, name: 'Ada Lovelace', rolle: 'admin', punkte: 120 },
  { id: 2, name: 'Alan Turing', rolle: 'redakteur', punkte: 95 },
  { id: 3, name: 'Grace Hopper', rolle: 'gast' }, // punkte fehlt -> Default 0
]

// Destructuring direkt in der Parameterliste + Default-Wert für punkte.
function BenutzerKarte({ name, rolle, punkte = 0 }: BenutzerKarteProps) {
  const t = TEXTE[useSprache().sprache]
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t.rollen[rolle]}</p>
      </div>
      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
        {punkte} {t.punkte}
      </span>
    </div>
  )
}

export function BenutzerKarten() {
  const t = TEXTE[useSprache().sprache]
  return (
    <Demo titel={t.titel}>
      <div className="space-y-2">
        {benutzer.map((b) => (
          <BenutzerKarte key={b.id} name={b.name} rolle={b.rolle} punkte={b.punkte} />
        ))}
      </div>
    </Demo>
  )
}
