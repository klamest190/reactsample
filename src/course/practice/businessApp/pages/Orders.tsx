import { useState } from 'react'
import { useStore, type OrderDraft } from '../store'
import { ORDER_STATUSES, type OrderStatus } from '../data'
import { Button } from '../components/Button'
import { Dialog } from '../components/Dialog'
import { OrderForm } from '../components/OrderForm'
import { StatusBadge } from '../components/StatusBadge'
import { formatCurrency, formatDate } from '../format'

type FilterValue = 'all' | OrderStatus

const FILTERS: FilterValue[] = ['all', ...ORDER_STATUSES]

export function Orders() {
  const { orders, customers, dispatch } = useStore()
  const [filter, setFilter] = useState<FilterValue>('all')
  const [creating, setCreating] = useState(false)

  const countFor = (status: FilterValue) =>
    status === 'all' ? orders.length : orders.filter((o) => o.status === status).length
  const visible = orders
    .filter((o) => filter === 'all' || o.status === filter)
    .toSorted((a, b) => b.date.localeCompare(a.date))
  const total = visible.reduce((sum, o) => sum + o.amount, 0)
  const customerName = (id: number) => customers.find((c) => c.id === id)?.name ?? 'Unknown'

  function handleCreate(order: OrderDraft) {
    dispatch({ type: 'order/added', order })
    setCreating(false)
    setFilter('all')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              aria-pressed={filter === status}
              className={`rounded-full px-3 py-1 text-sm capitalize transition ${
                filter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {status} <span className="opacity-70">({countFor(status)})</span>
            </button>
          ))}
        </div>
        <Button className="ml-auto" onClick={() => setCreating(true)}>
          + New order
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {visible.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-2">
                  <p className="font-medium">{o.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">#{o.id}</p>
                </td>
                <td className="px-4 py-2">{customerName(o.customerId)}</td>
                <td className="px-4 py-2 whitespace-nowrap">{formatDate(o.date)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatCurrency(o.amount)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <select
                      value={o.status}
                      // The value of a <select> is a string - here we know it is a status.
                      onChange={(e) => dispatch({ type: 'order/statusChanged', id: o.id, status: e.target.value as OrderStatus })}
                      aria-label={`Status of order ${o.id}`}
                      className="rounded-md border border-slate-300 bg-transparent px-1 py-0.5 text-xs dark:border-slate-600"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 font-semibold dark:border-slate-700">
            <tr>
              <td className="px-4 py-2" colSpan={3}>
                Total ({visible.length} orders)
              </td>
              <td className="px-4 py-2 text-right tabular-nums">{formatCurrency(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {creating && (
        <Dialog title="New order" onClose={() => setCreating(false)}>
          <OrderForm customers={customers} onSave={handleCreate} onCancel={() => setCreating(false)} />
        </Dialog>
      )}
    </div>
  )
}
