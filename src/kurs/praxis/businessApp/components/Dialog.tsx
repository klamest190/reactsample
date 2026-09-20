import { useEffect, type ReactNode } from 'react'

type DialogProps = { title: string; onClose: () => void; children: ReactNode }

// A modal dialog. The content comes in as children - the dialog
// does not know whether it shows a customer form or something else.
export function Dialog({ title, onClose, children }: DialogProps) {
  // Close with Escape. The cleanup removes the listener again.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-10 flex items-start justify-center bg-slate-900/40 p-4 pt-12" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
