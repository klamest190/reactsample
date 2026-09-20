import type { ReactNode } from 'react'

type PanelProps = {
  title?: string
  /** Anything React can render - e.g. a button on the right of the title. */
  action?: ReactNode
  children: ReactNode
}

// A white box with an optional title and an optional action on the right.
// What goes inside is up to the caller (children).
export function Panel({ title, action, children }: PanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
