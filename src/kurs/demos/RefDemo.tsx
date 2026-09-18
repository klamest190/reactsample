import { useEffect, useRef, useState } from 'react'
import { Button, Demo, Eingabe, Wert } from '../../components/Ui'
import { usePrevious } from '../../hooks/usePrevious'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 3.3): DOM-Ref, Timer-ID und usePrevious. */

const TEXTE = {
  de: {
    titel: 'Drei Einsätze von useRef',
    platzhalter: 'Klick auf Fokussieren …',
    fokussieren: 'Fokussieren',
    start: 'Start',
    stopp: 'Stopp',
    zahl: 'number',
    vorher: 'vorher (usePrevious)',
    erhoehen: 'Zufällig erhöhen',
  },
  en: {
    titel: 'Three uses of useRef',
    platzhalter: 'Click on Focus …',
    fokussieren: 'Focus',
    start: 'Start',
    stopp: 'Stop',
    zahl: 'number',
    vorher: 'previous (usePrevious)',
    erhoehen: 'Increase randomly',
  },
}

export function RefDemo() {
  const t = TEXTE[useSprache().sprache]
  const eingabeRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)
  const [ticks, setTicks] = useState(0)
  const [laeuft, setLaeuft] = useState(false)
  const [zahl, setZahl] = useState(0)
  const vorherigeZahl = usePrevious(zahl) // eigener Hook auf useRef-Basis

  function starten() {
    if (timerRef.current !== null) return
    setLaeuft(true)
    timerRef.current = window.setInterval(() => setTicks((tick) => tick + 1), 500)
  }

  function stoppen() {
    if (timerRef.current === null) return
    clearInterval(timerRef.current)
    timerRef.current = null
    setLaeuft(false)
  }

  // Sicherheitsnetz: verschwindet die Komponente, Timer trotzdem stoppen.
  useEffect(
    () => () => {
      if (timerRef.current !== null) clearInterval(timerRef.current)
    },
    [],
  )

  return (
    <Demo titel={t.titel}>
      <div className="flex gap-2">
        <Eingabe ref={eingabeRef} placeholder={t.platzhalter} />
        <Button onClick={() => eingabeRef.current?.focus()}>{t.fokussieren}</Button>
      </div>
      <div className="flex items-center gap-2">
        <Wert label="ticks">{ticks}</Wert>
        <Button onClick={starten} disabled={laeuft}>
          {t.start}
        </Button>
        <Button variante="sekundaer" onClick={stoppen} disabled={!laeuft}>
          {t.stopp}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Wert label={t.zahl}>{zahl}</Wert>
        <Wert label={t.vorher}>{vorherigeZahl ?? '–'}</Wert>
        <Button variante="sekundaer" onClick={() => setZahl((z) => z + Math.ceil(Math.random() * 9))}>
          {t.erhoehen}
        </Button>
      </div>
    </Demo>
  )
}
