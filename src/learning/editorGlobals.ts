/**
 * What the editor provides without an import - as a type declaration.
 *
 * Hooks and friends are available in the editor without importing them (see GLOBALS in
 * reactCompile.ts). Both type engines need to know that, and both must see the same thing:
 * - typeCheck.worker.ts (the real tsc - it produces the authoritative diagnostics list)
 * - monaco/setup.ts (Monaco's own TS service - completion, hover, signature help)
 *
 * That is why the list lives here once instead of twice.
 */
export const EDITOR_GLOBALS = `
import * as React from 'react'
import * as ReactDOM from 'react-dom'
declare global {
  const useState: typeof React.useState
  const useEffect: typeof React.useEffect
  const useLayoutEffect: typeof React.useLayoutEffect
  const useEffectEvent: typeof React.useEffectEvent
  const useRef: typeof React.useRef
  const useMemo: typeof React.useMemo
  const useCallback: typeof React.useCallback
  const useReducer: typeof React.useReducer
  const useContext: typeof React.useContext
  const useId: typeof React.useId
  const useTransition: typeof React.useTransition
  const useDeferredValue: typeof React.useDeferredValue
  const useSyncExternalStore: typeof React.useSyncExternalStore
  const useImperativeHandle: typeof React.useImperativeHandle
  const useActionState: typeof React.useActionState
  const useOptimistic: typeof React.useOptimistic
  const use: typeof React.use
  const createContext: typeof React.createContext
  const memo: typeof React.memo
  const lazy: typeof React.lazy
  const forwardRef: typeof React.forwardRef
  const startTransition: typeof React.startTransition
  const Fragment: typeof React.Fragment
  const Suspense: typeof React.Suspense
  const createPortal: typeof ReactDOM.createPortal
  const useFormStatus: typeof ReactDOM.useFormStatus
}
export {}
`
