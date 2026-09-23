import { useState } from 'react'
import { Button, Demo } from '../../components/Ui'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 5.5): Varianten, responsive Grid, group und bedingte Klassen. */

const TEXTE = {
  de: {
    titel: 'Varianten, group & bedingte Klassen',
    hover: 'Hintergrund ändert sich',
    dark: 'andere Farbe im Dark Mode',
    raster: ['1 Spalte', 'ab sm: 2', 'ab lg: 4', 'mobile first'],
    group: 'group: Fahr über die ganze Zeile',
    umschalten: 'Umschalten',
    status: 'Status',
    aktiv: 'aktiv',
    inaktiv: 'inaktiv',
  },
  en: {
    titel: 'Variants, group & conditional classes',
    hover: 'background changes',
    dark: 'different color in dark mode',
    raster: ['1 column', 'from sm: 2', 'from lg: 4', 'mobile first'],
    group: 'group: hover over the whole row',
    umschalten: 'Toggle',
    status: 'Status',
    aktiv: 'active',
    inaktiv: 'inactive',
  },
}

export function TailwindDemo() {
  const t = TEXTE[useSprache().sprache]
  const [aktiv, setAktiv] = useState(true)

  return (
    <Demo titel={t.titel}>
      <div className="rounded-lg bg-slate-100 p-4 transition hover:bg-brand-100 dark:bg-slate-800 dark:hover:bg-brand-700">
        <p className="text-sm">
          <span className="font-semibold">hover:</span> {t.hover} · <span className="font-semibold">dark:</span>{' '}
          {t.dark}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {t.raster.map((text) => (
          <div key={text} className="rounded-lg bg-brand-600 px-3 py-2 text-center text-sm text-white">
            {text}
          </div>
        ))}
      </div>
      <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-brand-500 dark:border-slate-700">
        <span className="text-2xl transition group-hover:scale-125">🎯</span>
        <span className="text-sm text-slate-500 transition group-hover:text-brand-600 dark:text-slate-400">{t.group}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variante="sekundaer" onClick={() => setAktiv((a) => !a)}>
          {t.umschalten}
        </Button>
        {/* Bedingte Klassen: vollständige Klassennamen in beiden Zweigen. */}
        <div
          className={`rounded-lg px-3 py-2 text-sm transition ${
            aktiv
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {t.status}: {aktiv ? t.aktiv : t.inaktiv}
        </div>
      </div>
    </Demo>
  )
}
