import { useState } from 'react'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { Button, Demo } from '../../components/Ui'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 4.4): Error Boundary um einen Teilbereich + try/catch im Event-Handler. */

const TEXTE = {
  de: {
    titel: 'Error Boundary & try/catch (src/components/ErrorBoundary.tsx)',
    absturz: 'Absturz auslösen',
    renderFehler: 'Absichtlicher Render-Fehler in <Wackelkandidat>',
    inOrdnung: 'Alles in Ordnung ✅',
    abgestuerzt: 'Dieser Bereich ist abgestürzt.',
    wiederherstellen: 'Wiederherstellen',
    json: 'Kaputtes JSON parsen (Event-Handler)',
    unbekannt: 'Unbekannter Fehler',
  },
  en: {
    titel: 'Error boundary & try/catch (src/components/ErrorBoundary.tsx)',
    absturz: 'Trigger crash',
    renderFehler: 'Intentional render error in <Wackelkandidat>',
    inOrdnung: 'All good ✅',
    abgestuerzt: 'This area has crashed.',
    wiederherstellen: 'Restore',
    json: 'Parse broken JSON (event handler)',
    unbekannt: 'Unknown error',
  },
}

/** Komponente, die auf Kommando beim Rendern abstürzt. */
function Wackelkandidat({ kaputt, fehlertext, okText }: { kaputt: boolean; fehlertext: string; okText: string }) {
  if (kaputt) throw new Error(fehlertext)
  return <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm dark:bg-emerald-950">{okText}</p>
}

export function FehlerDemo() {
  const t = TEXTE[useSprache().sprache]
  const [kaputt, setKaputt] = useState(false)
  const [handlerFehler, setHandlerFehler] = useState<string | null>(null)

  function riskanteAktion() {
    // Fehler in Event-Handlern landen NICHT in der Boundary - hier braucht es try/catch.
    try {
      JSON.parse('{ no valid JSON')
    } catch (e) {
      setHandlerFehler(e instanceof Error ? e.message : t.unbekannt)
    }
  }

  return (
    <Demo titel={t.titel}>
      <Button variante="gefahr" onClick={() => setKaputt(true)} disabled={kaputt}>
        {t.absturz}
      </Button>
      {/* Die Boundary umschließt nur diesen Bereich - der Rest der Seite bleibt bedienbar. */}
      <ErrorBoundary
        fallback={(fehler, zuruecksetzen) => (
          <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm dark:border-rose-800 dark:bg-rose-950">
            <p className="font-medium text-rose-800 dark:text-rose-200">{t.abgestuerzt}</p>
            <p className="mt-1 font-mono text-xs text-rose-700 dark:text-rose-300">{fehler.message}</p>
            <Button
              variante="sekundaer"
              className="mt-2"
              onClick={() => {
                setKaputt(false) // Ursache beheben …
                zuruecksetzen() // … dann die Boundary zurücksetzen
              }}
            >
              {t.wiederherstellen}
            </Button>
          </div>
        )}
      >
        <Wackelkandidat kaputt={kaputt} fehlertext={t.renderFehler} okText={t.inOrdnung} />
      </ErrorBoundary>
      <Button variante="sekundaer" onClick={riskanteAktion}>
        {t.json}
      </Button>
      {handlerFehler && (
        <p className="rounded-lg bg-amber-100 px-3 py-2 font-mono text-xs dark:bg-amber-950">{handlerFehler}</p>
      )}
    </Demo>
  )
}
