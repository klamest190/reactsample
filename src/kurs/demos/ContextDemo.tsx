import { createContext, use, useMemo, useState, type ReactNode } from 'react'
import { Button, Demo, Wert } from '../../components/Ui'
import { useTheme } from '../../context/ThemeContext'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 4.6): App-Contexts + eigener Context mit Provider und Consumer-Hook. */

const TEXTE = {
  de: {
    titel: 'Context in diesem Projekt',
    umschalten: 'Umschalten',
    synchron: 'Dieselben Contexts versorgen die Schalter oben rechts - alles bleibt synchron.',
    box: 'Diese Box kennt den Warenkorb nicht - die Kinder holen ihn sich selbst.',
    warenkorb: '🛒 Warenkorb',
    leeren: 'Leeren',
    produkte: ['Buch', 'Tasse', 'Sticker'],
  },
  en: {
    titel: 'Context in this project',
    umschalten: 'Toggle',
    synchron: 'The same contexts power the switches at the top right - everything stays in sync.',
    box: 'This box knows nothing about the cart - the children get it themselves.',
    warenkorb: '🛒 Cart',
    leeren: 'Clear',
    produkte: ['Book', 'Mug', 'Sticker'],
  },
}

type WarenkorbWert = { anzahl: number; hinzufuegen: () => void; leeren: () => void }

const WarenkorbContext = createContext<WarenkorbWert | null>(null)

function WarenkorbProvider({ children }: { children: ReactNode }) {
  const [anzahl, setAnzahl] = useState(0)

  // useMemo: neues Objekt nur, wenn sich anzahl ändert - sonst würden alle
  // Consumer bei jedem Render des Providers mitrendern.
  const wert = useMemo<WarenkorbWert>(
    () => ({ anzahl, hinzufuegen: () => setAnzahl((a) => a + 1), leeren: () => setAnzahl(0) }),
    [anzahl],
  )

  // React 19: <Context value> statt <Context.Provider value>
  return <WarenkorbContext value={wert}>{children}</WarenkorbContext>
}

// Konvention: einen Hook anbieten statt den Context selbst.
function useWarenkorb() {
  const ctx = use(WarenkorbContext) // `use` funktioniert wie useContext (siehe Kapitel 4.9)
  if (!ctx) throw new Error('useWarenkorb braucht einen <WarenkorbProvider>')
  return ctx
}

function Kopfzeile() {
  const t = TEXTE[useSprache().sprache]
  const { anzahl, leeren } = useWarenkorb()
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
      <span>
        {t.warenkorb}: {anzahl}
      </span>
      <Button variante="sekundaer" onClick={leeren}>
        {t.leeren}
      </Button>
    </div>
  )
}

function Produktliste() {
  const t = TEXTE[useSprache().sprache]
  const { hinzufuegen } = useWarenkorb()
  return (
    <div className="flex gap-2">
      {t.produkte.map((p) => (
        <Button key={p} onClick={hinzufuegen}>
          {p} +
        </Button>
      ))}
    </div>
  )
}

export function ContextDemo() {
  const { theme, toggleTheme } = useTheme()
  const { sprache, setSprache } = useSprache()
  const t = TEXTE[sprache]

  return (
    <Demo titel={t.titel}>
      <div className="flex flex-wrap items-center gap-2">
        <Wert label="theme (src/context/ThemeContext.tsx)">{theme}</Wert>
        <Button onClick={toggleTheme}>{t.umschalten}</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Wert label="sprache (src/i18n/SpracheContext.tsx)">{sprache}</Wert>
        <Button onClick={() => setSprache(sprache === 'de' ? 'en' : 'de')}>{t.umschalten}</Button>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">{t.synchron}</p>
      <WarenkorbProvider>
        <div className="space-y-2 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
          <p className="text-xs text-slate-500">{t.box}</p>
          <Kopfzeile />
          <Produktliste />
        </div>
      </WarenkorbProvider>
    </Demo>
  )
}
