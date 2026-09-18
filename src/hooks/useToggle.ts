import { useCallback, useState } from 'react'

/**
 * EIGENER HOOK: winziger Helfer für An/Aus-Zustände (Modal offen, Menü offen ...).
 * Zeigt, dass ein Hook nicht groß sein muss, um Wiederholung zu vermeiden.
 */
export function useToggle(start = false) {
  const [an, setAn] = useState(start)

  // Funktionales Update: `alt => !alt` braucht `an` nicht als Dependency,
  // deshalb bleibt die Funktion dauerhaft stabil (leeres Dependency-Array).
  const umschalten = useCallback(() => setAn((alt) => !alt), [])

  return { an, umschalten, setAn } as const
}
