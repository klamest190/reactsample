// One color per order status. "cancelled" is prepared already -
// it only has to be added to ORDER_STATUSES in data.js.
const STYLES = {
  open: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  shipped: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
}

export function StatusBadge({ status }) {
  const colors = STYLES[status] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors}`}>
      {status}
    </span>
  )
}
