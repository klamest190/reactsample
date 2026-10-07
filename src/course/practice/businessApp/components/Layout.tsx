import type { ReactNode } from 'react'

export type PageId = 'dashboard' | 'customers' | 'orders'

/** Every page gets this - pages that do not navigate may simply ignore it. */
export type PageProps = { onNavigate: (page: PageId) => void }

const NAV: { id: PageId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'customers', label: 'Customers', icon: '👥' },
  { id: 'orders', label: 'Orders', icon: '📦' },
]

type LayoutProps = PageProps & { page: PageId; children: ReactNode }

// @container: the layout reacts to its OWN width, not the window width -
// so it also works in a narrow column or preview. @2xl: = container at least 42rem wide.
export function Layout({ page, onNavigate, children }: LayoutProps) {
  const current = NAV.find((item) => item.id === page)

  return (
    <div className="@container h-full">
      <div className="relative flex h-full flex-col bg-slate-50 text-slate-900 @2xl:flex-row dark:bg-slate-900 dark:text-slate-100">
        <aside className="shrink-0 border-b border-slate-200 bg-white @2xl:w-48 @2xl:border-r @2xl:border-b-0 dark:border-slate-700 dark:bg-slate-800">
          <div className="px-4 py-3 text-lg font-bold">🌤️ BrightDesk</div>
          <nav className="flex gap-1 overflow-x-auto px-2 pb-2 @2xl:flex-col">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={item.id === page ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition ${
                  item.id === page
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="@container min-w-0 flex-1 overflow-y-auto p-4 @2xl:p-6">
          <h1 className="mb-4 text-xl font-semibold">{current?.label}</h1>
          {children}
        </main>
      </div>
    </div>
  )
}
