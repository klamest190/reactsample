/* oxlint-disable react/refs -- Genau darum geht es in diesem Hook: der Ref-Wert
   wird bewusst beim Rendern gelesen, um den vorherigen Stand zu zeigen. */
import { useEffect, useRef } from 'react'

/**
 * EIGENER HOOK: merkt sich den Wert aus dem vorherigen Render.
 *
 * Funktioniert, weil useRef einen Container liefert, dessen Aenderung KEIN
 * Re-Render auslöst. Der Effekt läuft erst nach dem Render, also liest die
 * Komponente während des Renders noch den alten Wert.
 */
export function usePrevious<T>(wert: T) {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = wert
  }, [wert])

  return ref.current
}
