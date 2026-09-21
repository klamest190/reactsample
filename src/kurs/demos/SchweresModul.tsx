/**
 * Diese Datei wird von der Demo in Kapitel 4.8 per React.lazy() nachgeladen.
 * Vite packt sie deshalb in einen eigenen JS-Chunk, der erst beim
 * tatsächlichen Anzeigen heruntergeladen wird (Code-Splitting).
 *
 * Wichtig: lazy() erwartet einen DEFAULT-Export.
 */
import { useSprache } from '../../i18n/SpracheContext'

export default function SchweresModul() {
  const { sprache } = useSprache()
  const balken = [42, 78, 31, 95, 60, 24]

  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <p className="mb-3 text-sm font-medium">{sprache === 'de' ? 'Nachgeladenes Diagramm' : 'Lazy-loaded chart'} 📊</p>
      <div className="flex h-32 items-end gap-2">
        {balken.map((wert, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-brand-500"
            style={{ height: wert + '%' }}
            title={wert + '%'}
          />
        ))}
      </div>
    </div>
  )
}
