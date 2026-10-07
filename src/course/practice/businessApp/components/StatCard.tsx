import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  /** Number or already formatted text. */
  value: ReactNode
  hint?: string
  icon?: string
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span aria-hidden>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
}
