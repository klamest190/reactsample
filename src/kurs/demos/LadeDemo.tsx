import { useEffect, useState } from 'react'
import { Button, Demo } from '../../components/Ui'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 4.2): laden / Fehler / Daten mit AbortController im Cleanup. */

type Benutzer = { id: number; name: string; ort: string }

const TEXTE = {
  de: {
    titel: 'Laden / Fehler / Daten (25 % Fehlerquote)',
    neuLaden: 'Neu laden',
    laedt: 'Lädt …',
    serverFehler: 'Server nicht erreichbar (simuliert)',
    nochmal: ' - einfach nochmal versuchen.',
    unbekannt: 'Unbekannter Fehler',
  },
  en: {
    titel: 'Loading / error / data (25 % error rate)',
    neuLaden: 'Reload',
    laedt: 'Loading …',
    serverFehler: 'Server unreachable (simulated)',
    nochmal: ' - just try again.',
    unbekannt: 'Unknown error',
  },
}

/** Simulierte API mit Latenz, 25 % Fehlerquote und Abbruch-Unterstützung. */
function benutzerLaden(signal: AbortSignal, fehlertext: string): Promise<Benutzer[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (Math.random() < 0.25) return reject(new Error(fehlertext))
      resolve([
        { id: 1, name: 'Ada Lovelace', ort: 'London' },
        { id: 2, name: 'Alan Turing', ort: 'Wilmslow' },
        { id: 3, name: 'Grace Hopper', ort: 'New York' },
      ])
    }, 900)
    // Abbruch-Signal beachten - genau das macht fetch intern auch.
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

export function LadeDemo() {
  const t = TEXTE[useSprache().sprache]
  const [daten, setDaten] = useState<Benutzer[] | null>(null)
  const [laedt, setLaedt] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)
  const [versuch, setVersuch] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    // Der Effekt selbst darf nicht async sein (er gibt ja den Cleanup zurück),
    // also eine async-Funktion darin.
    async function laden() {
      try {
        setDaten(await benutzerLaden(controller.signal, t.serverFehler))
        setFehler(null)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return // gewollt
        setFehler(e instanceof Error ? e.message : t.unbekannt)
      } finally {
        if (!controller.signal.aborted) setLaedt(false)
      }
    }
    laden()

    return () => controller.abort()
  }, [versuch, t])

  return (
    <Demo titel={t.titel}>
      <Button
        onClick={() => {
          setLaedt(true)
          setVersuch((v) => v + 1)
        }}
        disabled={laedt}
      >
        {laedt ? t.laedt : t.neuLaden}
      </Button>
      {laedt && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      )}
      {!laedt && fehler && (
        <p className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
          {fehler}
          {t.nochmal}
        </p>
      )}
      {!laedt && !fehler && daten && (
        <ul className="space-y-1">
          {daten.map((b) => (
            <li
              key={b.id}
              className="flex justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
            >
              <span>{b.name}</span>
              <span className="text-slate-500">{b.ort}</span>
            </li>
          ))}
        </ul>
      )}
    </Demo>
  )
}
