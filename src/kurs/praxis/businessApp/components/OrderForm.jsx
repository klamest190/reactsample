import { useId, useState } from 'react'
import { Button } from './Button'
import { Field } from './Field'
import { today } from '../format'

export function OrderForm({ customers, onSave, onCancel }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const selectId = useId()

  function handleSubmit(e) {
    e.preventDefault()
    const value = Number(amount)
    if (!title.trim() || !(value > 0)) {
      setError('Please enter a title and an amount greater than 0.')
      return
    }
    onSave({
      customerId: Number(customerId),
      title: title.trim(),
      amount: value,
      date: today(),
      status: 'open',
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="space-y-1">
        <label htmlFor={selectId} className="block text-sm font-medium">
          Customer
        </label>
        <select
          id={selectId}
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.company})
            </option>
          ))}
        </select>
      </div>
      <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <Field label="Amount in €" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      {error && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create order</Button>
      </div>
    </form>
  )
}
