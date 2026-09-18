import { useId } from 'react'

// Label + input + error message. useId connects label and input,
// even if the component is used several times on the same page.
export function Field({ label, error, ...inputProps }) {
  const id = useId()

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 aria-invalid:border-rose-500 dark:border-slate-600 dark:bg-slate-900"
        {...inputProps}
      />
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  )
}
