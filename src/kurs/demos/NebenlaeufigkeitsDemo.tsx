import { Suspense, lazy, useDeferredValue, useMemo, useState, useTransition } from 'react'
import { Button, Code, Demo, Eingabe, Wert } from '../../components/Ui'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demos (Kapitel 3.8): useDeferredValue, useTransition, lazy + Suspense. */

// Wird erst geladen, wenn es das erste Mal gerendert wird.
const SchweresModul = lazy(() => import('./SchweresModul'))

const TEXTE = {
  de: {
    eintrag: 'Eintrag Nummer ',
    treffer: 'Treffer',
    wirdGerendert: 'wird gerendert …',
    nachladen: 'Diagramm nachladen',
    netzwerk: 'Im Netzwerk-Tab der DevTools siehst du beim Klick eine zusätzliche JS-Datei - den eigenen Chunk aus',
  },
  en: {
    eintrag: 'Entry number ',
    treffer: 'Matches',
    wirdGerendert: 'rendering …',
    nachladen: 'Load chart',
    netzwerk: 'In the network tab of the DevTools you will see an extra JS file when you click - the separate chunk from',
  },
}

function GrosseListe({ filter, eintrag }: { filter: string; eintrag: string }) {
  const { sprache } = useSprache()
  // 8.000 Einträge - genug, damit man den Unterschied spürt.
  const alle = useMemo(() => Array.from({ length: 8000 }, (_, i) => eintrag + (i + 1)), [eintrag])
  const gefiltert = useMemo(() => alle.filter((e) => e.includes(filter)), [alle, filter])

  return (
    <>
      <Wert label={TEXTE[sprache].treffer}>{gefiltert.length}</Wert>
      <ul className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 text-sm dark:border-slate-700">
        {gefiltert.slice(0, 200).map((e) => (
          <li key={e} className="border-b border-slate-100 px-3 py-1 last:border-0 dark:border-slate-800">
            {e}
          </li>
        ))}
      </ul>
    </>
  )
}

export function NebenlaeufigkeitsDemo() {
  const t = TEXTE[useSprache().sprache]
  const [suche, setSuche] = useState('')
  const verzoegert = useDeferredValue(suche)
  const [istAmArbeiten, startTransition] = useTransition()
  const [tab, setTab] = useState<'a' | 'b'>('a')
  const [zeigeModul, setZeigeModul] = useState(false)

  return (
    <>
      <Demo titel="useDeferredValue">
        <Eingabe value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="123" />
        {/* Halb durchsichtig, solange die Liste noch den alten Wert zeigt. */}
        <div className={suche !== verzoegert ? 'opacity-50 transition-opacity' : ''}>
          <GrosseListe filter={verzoegert} eintrag={t.eintrag} />
        </div>
      </Demo>

      <Demo titel="useTransition">
        <div className="flex items-center gap-2">
          {(['a', 'b'] as const).map((tabName) => (
            <Button
              key={tabName}
              variante={tab === tabName ? 'primaer' : 'sekundaer'}
              onClick={() => startTransition(() => setTab(tabName))}
            >
              Tab {tabName.toUpperCase()}
            </Button>
          ))}
          {istAmArbeiten && <span className="text-sm text-slate-500">{t.wirdGerendert}</span>}
        </div>
        <GrosseListe filter={tab === 'a' ? '1' : '99'} eintrag={t.eintrag} />
      </Demo>

      <Demo titel="lazy + Suspense">
        <Button onClick={() => setZeigeModul(true)} disabled={zeigeModul}>
          {t.nachladen}
        </Button>
        {zeigeModul && (
          <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />}>
            <SchweresModul />
          </Suspense>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t.netzwerk} <Code>import()</Code>.
        </p>
      </Demo>
    </>
  )
}
