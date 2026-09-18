const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary:
    'border border-slate-300 bg-white hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700',
}

// All other props (onClick, type, disabled …) are passed straight to <button>.
export function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}
