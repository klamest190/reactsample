import { useState } from 'react'
import { Button, Demo, Eingabe, Wert } from '../../components/Ui'
import { useDebounce } from '../../hooks/useDebounce'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useToggle } from '../../hooks/useToggle'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 4.7): die Hooks aus src/hooks/ im Einsatz. */

const TEXTE = {
  de: {
    titel: 'Hooks aus src/hooks/',
    localStorage: 'useLocalStorage - lade die Seite nach dem Tippen neu',
    notiz: 'Notiz …',
    details: (offen: boolean) => `Details ${offen ? 'verbergen' : 'zeigen'}`,
    detailText: 'Drei Zeilen Hook sparen überall Wiederholung.',
    suchen: 'Zutat suchen …',
    sofort: 'sofort',
    verzoegert: 'nach 500 ms',
    zutaten: ['Tomate', 'Mozzarella', 'Basilikum', 'Olivenöl', 'Knoblauch', 'Zwiebel', 'Paprika', 'Zucchini'],
  },
  en: {
    titel: 'Hooks from src/hooks/',
    localStorage: 'useLocalStorage - reload the page after typing',
    notiz: 'Note …',
    details: (offen: boolean) => `${offen ? 'Hide' : 'Show'} details`,
    detailText: 'Three lines of hook save repetition everywhere.',
    suchen: 'Search ingredient …',
    sofort: 'immediately',
    verzoegert: 'after 500 ms',
    zutaten: ['Tomato', 'Mozzarella', 'Basil', 'Olive oil', 'Garlic', 'Onion', 'Bell pepper', 'Zucchini'],
  },
}

export function HookDemo() {
  const t = TEXTE[useSprache().sprache]
  const [notiz, setNotiz] = useLocalStorage('demo-notiz', '')
  const { an: detailsOffen, umschalten } = useToggle(false)
  const [suche, setSuche] = useState('')
  const verzoegert = useDebounce(suche, 500)
  const treffer = t.zutaten.filter((z) => z.toLowerCase().includes(verzoegert.toLowerCase()))

  return (
    <Demo titel={t.titel}>
      <div>
        <p className="mb-1 text-sm font-medium">{t.localStorage}</p>
        <Eingabe value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder={t.notiz} />
      </div>
      <div>
        <p className="mb-1 text-sm font-medium">useToggle</p>
        <Button variante="sekundaer" onClick={umschalten}>
          {t.details(detailsOffen)}
        </Button>
        {detailsOffen && <p className="mt-2 text-sm">{t.detailText}</p>}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">useDebounce</p>
        <Eingabe value={suche} onChange={(e) => setSuche(e.target.value)} placeholder={t.suchen} />
        <div className="flex flex-wrap gap-2">
          <Wert label={t.sofort}>{suche || '–'}</Wert>
          <Wert label={t.verzoegert}>{verzoegert || '–'}</Wert>
        </div>
        <ul className="flex flex-wrap gap-1">
          {treffer.map((z) => (
            <li key={z} className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
              {z}
            </li>
          ))}
        </ul>
      </div>
    </Demo>
  )
}
