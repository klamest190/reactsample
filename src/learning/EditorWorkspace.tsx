import { useSyncExternalStore, useState, type ReactNode } from 'react'
import { Group, Panel, Separator, useDefaultLayout } from 'react-resizable-panels'
import { Icon, type IconName } from '../components/Icon'
import { focusableWhenScrolling } from '../components/scrollFocus'
import { useTexte } from '../i18n/LanguageContext'
import type { CursorStore } from './cursorStore'

/**
 * The workspace: editor on top, output below, a handle in between to move the split.
 *
 * Only the playground uses it (EditorFrame gets `workspace`). In the chapters everything
 * stays stacked - there you read text and editor in one flow, and a separate scroll area
 * would be in the way.
 *
 * Important: the content of every tab stays in the DOM and is only hidden. Running things
 * live inside it - JavaScript's sandbox iframe, the React root of the preview, the PGlite
 * connection. Switching tabs must not restart them.
 *
 * On react-resizable-panels v4: a size given as a string is a percentage, as a number it
 * would be pixels. `useDefaultLayout` remembers the split in localStorage.
 */

function CursorPosition({ store }: { store: CursorStore }) {
  const t = useTexte()
  const at = useSyncExternalStore(store.subscribe, store.get, store.get)
  return <span>{t.stelle(at.line, at.column)}</span>
}

export type Area = {
  id: string
  title: string
  icon: IconName
  content: ReactNode
  /** Number on the tab, e.g. how many problems there are. */
  count?: number
  /** While true there is nothing to see here - the tab stays away. */
  empty?: boolean
}

export function EditorWorkspace({
  editor,
  areas,
  kindLabel,
  cursor,
  duration,
  minimap,
  onToggleMinimap,
  storageId,
}: {
  editor: ReactNode
  areas: Area[]
  /** Short label of the language for the status bar, e.g. "JS". */
  kindLabel: string
  cursor: CursorStore
  /** Duration of the last run in milliseconds. */
  duration: number | null
  minimap: boolean
  onToggleMinimap: () => void
  /** Key the split is stored under. */
  storageId: string
}) {
  const t = useTexte()
  const visible = areas.filter((a) => !a.empty)
  // The first area is the most important one of that editor (JavaScript: console,
  // React: preview) - so the selection starts there.
  const [chosen, setChosen] = useState(areas[0]?.id ?? '')
  // If the active tab becomes empty, the selection slides to the first visible one.
  const active = visible.some((a) => a.id === chosen) ? chosen : (visible[0]?.id ?? '')

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'lernpfad-workspace:' + storageId,
    storage: typeof localStorage === 'undefined' ? undefined : localStorage,
    onlySaveAfterUserInteractions: true,
  })

  return (
    <div className="flex h-[70vh] min-h-96 flex-col">
      <Group orientation="vertical" defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged} className="min-h-0 flex-1">
        <Panel defaultSize="62%" minSize="20%" className="min-h-0">
          {editor}
        </Panel>

        {/* Separator sets role and tabIndex itself - it can be operated with the keyboard
            and therefore needs a name. */}
        <Separator
          aria-label={t.bereichTeilen}
          className="group relative h-1.5 shrink-0 bg-slate-200 transition hover:bg-brand-400 active:bg-brand-500 dark:bg-slate-800 dark:hover:bg-brand-600"
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-1/2 mx-auto h-0.5 w-10 -translate-y-1/2 rounded-full bg-slate-400 group-hover:bg-white dark:bg-slate-600"
          />
        </Separator>

        <Panel defaultSize="38%" minSize="12%" className="flex min-h-0 flex-col">
          <div
            role="tablist"
            aria-label={t.ausgabe}
            className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-800 dark:bg-slate-950/60"
          >
            {visible.map((area) => (
              <button
                key={area.id}
                role="tab"
                id={`tab-${storageId}-${area.id}`}
                aria-selected={area.id === active}
                aria-controls={`area-${storageId}-${area.id}`}
                onClick={() => setChosen(area.id)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                  area.id === active
                    ? 'border-brand-500 text-brand-700 dark:text-brand-300'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <Icon name={area.icon} className="size-3.5" />
                {area.title}
                {area.count !== undefined && area.count > 0 && (
                  <span className="rounded-full bg-rose-100 px-1.5 text-3xs font-semibold text-rose-800 tabular-nums dark:bg-rose-950 dark:text-rose-300">
                    {area.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Every tab stays in the DOM - only the active one is visible (see above). */}
          <div ref={focusableWhenScrolling} className="min-h-0 flex-1 overflow-y-auto">
            {areas.map((area) => (
              <div
                key={area.id}
                role="tabpanel"
                id={`area-${storageId}-${area.id}`}
                aria-labelledby={`tab-${storageId}-${area.id}`}
                hidden={area.id !== active}
              >
                {area.content}
              </div>
            ))}
          </div>
        </Panel>
      </Group>

      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200 bg-slate-50 px-3 py-1 font-mono text-2xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{kindLabel}</span>
        <CursorPosition store={cursor} />
        {duration !== null && (
          <span className="flex items-center gap-1">
            <Icon name="uhr" className="size-3" />
            {t.laufzeit(duration)}
          </span>
        )}
        <button
          onClick={onToggleMinimap}
          aria-pressed={minimap}
          className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <Icon name="raster" className="size-3" />
          {minimap ? t.minimapVerbergen : t.minimapZeigen}
        </button>
      </div>
    </div>
  )
}
