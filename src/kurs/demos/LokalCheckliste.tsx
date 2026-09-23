import { Demo } from '../../components/Ui'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 5.10): Checkliste für das erste lokale Projekt - wird gespeichert. */

const TEXTE = {
  de: {
    titel: 'Checkliste: Die ToDo-App auf deinem Rechner',
    fertig: (n: number, gesamt: number) => `${n} von ${gesamt} erledigt`,
    zuruecksetzen: 'Zurücksetzen',
    punkte: [
      'Node.js (LTS) und VS Code installiert',
      'Projekt mit „npm create vite@latest“ angelegt',
      '„npm run dev“ läuft und die Seite ist im Browser offen',
      'React DevTools im Browser installiert',
      'Lösung aus Projektschritt 11 in src/App.tsx kopiert und Imports ergänzt',
      'Komponenten in eigene Dateien unter src/components/ aufgeteilt',
      'Einen Breakpoint gesetzt und State in den React DevTools angesehen',
      '„npm run build“ ohne Fehler durchgelaufen',
    ],
  },
  en: {
    titel: 'Checklist: the todo app on your computer',
    fertig: (n: number, gesamt: number) => `${n} of ${gesamt} done`,
    zuruecksetzen: 'Reset',
    punkte: [
      'Node.js (LTS) and VS Code installed',
      'Project created with “npm create vite@latest”',
      '“npm run dev” is running and the page is open in the browser',
      'React DevTools installed in the browser',
      'Solution from project step 11 copied into src/App.tsx and imports added',
      'Components split into their own files under src/components/',
      'Set a breakpoint and inspected state in the React DevTools',
      '“npm run build” finished without errors',
    ],
  },
}

export function LokalCheckliste() {
  const t = TEXTE[useSprache().sprache]
  // Gespeichert werden die Indizes - so bleibt der Stand beim Sprachwechsel erhalten.
  const [erledigt, setErledigt] = useLocalStorage<number[]>('lernpfad-lokal-checkliste', [])

  function umschalten(index: number) {
    setErledigt((alt) => (alt.includes(index) ? alt.filter((i) => i !== index) : [...alt, index]))
  }

  return (
    <Demo titel={t.titel}>
      <ul className="space-y-1.5">
        {t.punkte.map((punkt, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input type="checkbox" checked={erledigt.includes(i)} onChange={() => umschalten(i)} className="mt-1 accent-emerald-600" />
              <span className={erledigt.includes(i) ? 'text-slate-500 line-through dark:text-slate-400' : ''}>{punkt}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: (erledigt.length / t.punkte.length) * 100 + '%' }} />
        </div>
        <span className="text-slate-500 tabular-nums dark:text-slate-400">{t.fertig(erledigt.length, t.punkte.length)}</span>
        {erledigt.length > 0 && (
          <button onClick={() => setErledigt([])} className="text-slate-500 hover:underline dark:text-slate-400">
            {t.zuruecksetzen}
          </button>
        )}
      </div>
    </Demo>
  )
}
