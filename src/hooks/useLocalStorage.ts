import { useEffect, useState } from 'react'

/**
 * EIGENER HOOK: verhält sich wie useState, speichert den Wert aber zusätzlich
 * im localStorage und liest ihn beim Start wieder aus.
 *
 * Regeln für eigene Hooks:
 *  1. Name beginnt mit "use"
 *  2. Darf andere Hooks aufrufen
 *  3. Wird nur auf oberster Ebene einer Komponente / eines Hooks aufgerufen
 *     (nicht in if / for / Callbacks)
 *
 * Generic <T>: der Hook funktioniert mit jedem Datentyp und behält die
 * Typinformation ("useLocalStorage<number>" -> setter erwartet number).
 */
export function useLocalStorage<T>(key: string, startwert: T) {
  const [wert, setWert] = useState<T>(() => {
    try {
      const roh = localStorage.getItem(key)
      return roh ? (JSON.parse(roh) as T) : startwert
    } catch {
      // z.B. kaputtes JSON oder deaktivierter Storage -> einfach Startwert
      return startwert
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(wert))
  }, [key, wert])

  // `as const` macht aus dem Array ein Tupel [T, Setter] statt (T | Setter)[].
  return [wert, setWert] as const
}
