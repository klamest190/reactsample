import { useState } from 'react'
import { Button, Demo, Wert } from '../../components/Ui'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 3.1): falsche vs. richtige Mehrfach-Updates. */

const TEXTE = {
  de: {
    titel: 'Funktionale Updates',
    label: 'count',
    falsch: '3× setCount(count + 1)',
    richtig: '3× setCount(prev => prev + 1)',
    reset: 'Zurücksetzen',
  },
  en: {
    titel: 'Updater functions',
    label: 'count',
    falsch: '3× setCount(count + 1)',
    richtig: '3× setCount(prev => prev + 1)',
    reset: 'Reset',
  },
}

export function ZaehlerDemo() {
  const t = TEXTE[useSprache().sprache]
  const [zaehler, setZaehler] = useState(0)

  function dreimalFalsch() {
    // Alle drei Aufrufe lesen denselben alten `zaehler` -> +1 statt +3
    setZaehler(zaehler + 1)
    setZaehler(zaehler + 1)
    setZaehler(zaehler + 1)
  }

  function dreimalRichtig() {
    // Funktionales Update - React reicht jeweils den neuesten Wert hinein
    setZaehler((alt) => alt + 1)
    setZaehler((alt) => alt + 1)
    setZaehler((alt) => alt + 1)
  }

  return (
    <Demo titel={t.titel}>
      <Wert label={t.label}>{zaehler}</Wert>
      <div className="flex flex-wrap gap-2">
        <Button variante="sekundaer" onClick={dreimalFalsch}>
          {t.falsch}
        </Button>
        <Button onClick={dreimalRichtig}>{t.richtig}</Button>
        <Button variante="gefahr" onClick={() => setZaehler(0)}>
          {t.reset}
        </Button>
      </div>
    </Demo>
  )
}
