import { useMemo } from 'react'
import { useStore } from '../store'
import { Panel } from '../components/Panel'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { formatCurrency, formatDate } from '../format'
import type { PageProps } from '../components/Layout'

export function Dashboard({ onNavigate }: PageProps) {
  const { customers, orders } = useStore()

  // Key figures are derived from the orders - never stored separately.
  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === 'paid')
    const unpaid = orders.filter((o) => o.status !== 'paid')
    return {
      revenue: paid.reduce((sum, o) => sum + o.amount, 0),
      outstanding: unpaid.reduce((sum, o) => sum + o.amount, 0),
      unpaidCount: unpaid.length,
    }
  }, [orders])

  const topCustomers = useMemo(() => {
    return customers
      .map((c) => ({
        ...c,
        total: orders.filter((o) => o.customerId === c.id).reduce((sum, o) => sum + o.amount, 0),
      }))
      .toSorted((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [customers, orders])

  const latestOrders = orders.toSorted((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const biggest = topCustomers[0]?.total || 1
  const customerName = (id: number) => customers.find((c) => c.id === id)?.name ?? 'Unknown'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
        <StatCard label="Revenue (paid)" value={formatCurrency(stats.revenue)} icon="💶" />
        <StatCard
          label="Outstanding"
          value={formatCurrency(stats.outstanding)}
          hint={`${stats.unpaidCount} orders not paid yet`}
          icon="⏳"
        />
        <StatCard label="Customers" value={customers.length} icon="👥" />
        <StatCard label="Orders" value={orders.length} icon="📦" />
      </div>

      <div className="grid gap-6 @2xl:grid-cols-2">
        <Panel title="Top customers">
          <ul className="space-y-3">
            {topCustomers.map((c) => (
              <li key={c.id}>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="truncate">{c.name}</span>
                  <span className="tabular-nums">{formatCurrency(c.total)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                  <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(c.total / biggest) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Latest orders"
          action={
            <button onClick={() => onNavigate('orders')} className="text-sm text-brand-600 hover:underline dark:text-brand-400">
              Show all →
            </button>
          }
        >
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {latestOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{o.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {customerName(o.customerId)} · {formatDate(o.date)}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
