/* oxlint-disable react/refs -- Render-Zähler als Anschauungsmaterial: die Ref wird bewusst
   beim Rendern gelesen und geschrieben (siehe Kapitel 3.3, warum man das sonst nicht tut). */
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { Button, Demo, Wert } from '../../components/Ui'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 3.4): useMemo, useCallback & memo. */

const TEXTE = {
  de: {
    titel: 'useMemo, useCallback & memo',
    zaehler: (n: number) => `Zähler +1 (${n})`,
    faktor: (n: number) => `Faktor wechseln (${n}) - rechnet neu`,
    summe: 'teure Summe (useMemo)',
    beobachten: 'Klick auf „Zähler +1“ und beobachte die Render-Zähler:',
    ohneMemo: 'Ohne memo · Renders:',
    mitMemo: 'Mit memo + useCallback · Renders:',
    klick: 'Klick',
    klicks: 'Klicks in den Kindern',
    locale: 'de-DE',
  },
  en: {
    titel: 'useMemo, useCallback & memo',
    zaehler: (n: number) => `Counter +1 (${n})`,
    faktor: (n: number) => `Change factor (${n}) - recomputes`,
    summe: 'expensive sum (useMemo)',
    beobachten: 'Click “Counter +1” and watch the render counters:',
    ohneMemo: 'Without memo · renders:',
    mitMemo: 'With memo + useCallback · renders:',
    klick: 'Click',
    klicks: 'Clicks in the children',
    locale: 'en-US',
  },
}

type KindProps = { onKlick: () => void; text: string; knopf: string }

function NormalesKind({ onKlick, text, knopf }: KindProps) {
  const renders = useRef(0)
  renders.current += 1
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
      <span>
        {text} <strong>{renders.current}</strong>
      </span>
      <Button variante="sekundaer" onClick={onKlick}>
        {knopf}
      </Button>
    </div>
  )
}

// memo: rendert nur neu, wenn sich eine Prop (per Referenz) geändert hat.
const MemoKind = memo(function MemoKind({ onKlick, text, knopf }: KindProps) {
  const renders = useRef(0)
  renders.current += 1
  return (
    <div className="flex items-center justify-between rounded-lg bg-emerald-100 px-3 py-2 text-sm dark:bg-emerald-950">
      <span>
        {text} <strong>{renders.current}</strong>
      </span>
      <Button variante="sekundaer" onClick={onKlick}>
        {knopf}
      </Button>
    </div>
  )
})

/** Absichtlich teure Berechnung, damit useMemo einen spürbaren Sinn hat. */
function teureSummeBerechnen(faktor: number) {
  let summe = 0
  for (let i = 0; i < faktor * 3_000_000; i++) summe += i % 7
  return summe
}

export function PerformanceDemo() {
  const t = TEXTE[useSprache().sprache]
  const [zaehler, setZaehler] = useState(0)
  const [faktor, setFaktor] = useState(1)
  const [klicks, setKlicks] = useState(0)

  // Die Schleife läuft NUR neu, wenn sich `faktor` ändert.
  const summe = useMemo(() => teureSummeBerechnen(faktor), [faktor])

  // Gleiche Funktions-Identität über Renders hinweg -> memo kann greifen.
  const stabilerHandler = useCallback(() => setKlicks((k) => k + 1), [])
  // Zum Vergleich: bei jedem Render eine NEUE Funktion.
  const instabilerHandler = () => setKlicks((k) => k + 1)

  return (
    <Demo titel={t.titel}>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setZaehler((z) => z + 1)}>{t.zaehler(zaehler)}</Button>
        <Button variante="sekundaer" onClick={() => setFaktor((f) => (f % 3) + 1)}>
          {t.faktor(faktor)}
        </Button>
      </div>
      <Wert label={t.summe}>{summe.toLocaleString(t.locale)}</Wert>
      <p className="text-sm text-slate-600 dark:text-slate-400">{t.beobachten}</p>
      {/* Die Texte sind Strings - also gleiche Werte, die memo nicht stören. */}
      <NormalesKind onKlick={instabilerHandler} text={t.ohneMemo} knopf={t.klick} />
      <MemoKind onKlick={stabilerHandler} text={t.mitMemo} knopf={t.klick} />
      <Wert label={t.klicks}>{klicks}</Wert>
    </Demo>
  )
}
