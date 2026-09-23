import { useEffect, useState } from 'react'
import { Demo, Eingabe, Wert } from '../../components/Ui'
import { useWindowSize } from '../../hooks/useWindowSize'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 4.2): Effekt mit Dependency + Event-Listener über einen eigenen Hook. */

const TEXTE = {
  de: {
    titel: 'Effekt mit Dependency & Event-Listener',
    start: 'Mein neuer Tab-Titel',
    hinweis: 'Schau auf den Browser-Tab: Der Titel ändert sich mit.',
    fenster: 'Fenstergröße (useWindowSize)',
    feld: 'Tab-Titel',
  },
  en: {
    titel: 'Effect with dependency & event listener',
    start: 'My new tab title',
    hinweis: 'Look at the browser tab: the title changes as you type.',
    fenster: 'Window size (useWindowSize)',
    feld: 'Tab title',
  },
}

export function TitelUndFenster() {
  const t = TEXTE[useSprache().sprache]
  const [titel, setTitel] = useState(t.start)
  const groesse = useWindowSize() // eigener Hook, kapselt einen Effekt mit Cleanup

  // Läuft nach dem Render - und erneut, sobald sich `titel` ändert.
  useEffect(() => {
    const vorher = document.title
    document.title = titel
    return () => {
      document.title = vorher
    }
  }, [titel])

  return (
    <Demo titel={t.titel}>
      <Eingabe aria-label={t.feld} value={titel} onChange={(e) => setTitel(e.target.value)} />
      <p className="text-sm text-slate-600 dark:text-slate-400">{t.hinweis}</p>
      <Wert label={t.fenster}>
        {groesse.breite} × {groesse.hoehe}
      </Wert>
    </Demo>
  )
}
