import { useMemo, useState } from 'react'
import { useStore, type CustomerDraft } from '../store'
import { useSort } from '../hooks/useSort'
import { Button } from '../components/Button'
import { CustomerForm } from '../components/CustomerForm'
import { Dialog } from '../components/Dialog'
import { formatCurrency } from '../format'
import type { Customer } from '../data'

/** A customer plus the revenue calculated for the table. */
type Row = Customer & { revenue: number }

const COLUMNS: { key: keyof Row & string; label: string; numeric?: boolean }[] = [
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'revenue', label: 'Revenue', numeric: true },
]

export function Customers() {
  const { customers, orders, dispatch } = useStore()
  const [query, setQuery] = useState('')
  // null = dialog closed, 'new' = new customer, otherwise the customer being edited
  const [editing, setEditing] = useState<Customer | 'new' | null>(null)

  // Add the revenue per customer and apply the search.
  const rows = useMemo<Row[]>(() => {
    const search = query.trim().toLowerCase()
    return customers
      .map((c) => ({
        ...c,
        revenue: orders.filter((o) => o.customerId === c.id).reduce((sum, o) => sum + o.amount, 0),
      }))
      .filter((c) => `${c.name} ${c.company} ${c.city}`.toLowerCase().includes(search))
  }, [customers, orders, query])

  // The hook is generic: here T is Row, so sortBy only accepts keys of Row.
  const { sorted, sort, sortBy } = useSort(rows, 'name')

  function handleSave(customer: CustomerDraft) {
    dispatch({ type: 'customer/saved', customer })
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers …"
          aria-label="Search customers"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
        <Button onClick={() => setEditing('new')}>+ New customer</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} className={`px-4 py-2 ${col.numeric ? 'text-right' : ''}`}>
                  <button onClick={() => sortBy(col.key)} className="font-semibold uppercase hover:text-slate-900 dark:hover:text-white">
                    {col.label}
                    {sort.key === col.key && (sort.direction === 'asc' ? ' ▲' : ' ▼')}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {sorted.map((c) => (
              <tr
                key={c.id}
                onClick={() => setEditing(customers.find((x) => x.id === c.id) ?? null)}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <td className="px-4 py-2">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.email}</p>
                </td>
                <td className="px-4 py-2">{c.company}</td>
                <td className="px-4 py-2">{c.city}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatCurrency(c.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="p-4 text-center text-sm text-slate-500">No customers match “{query}”.</p>
        )}
      </div>

      {editing && (
        <Dialog title={editing === 'new' ? 'New customer' : 'Edit customer'} onClose={() => setEditing(null)}>
          <CustomerForm
            customer={editing === 'new' ? null : editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Dialog>
      )}
    </div>
  )
}
