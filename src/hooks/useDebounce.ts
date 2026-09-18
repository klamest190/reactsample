import { useEffect, useState } from 'react'

/**
 * EIGENER HOOK: gibt einen Wert erst verzögert weiter.
 * Typischer Fall: Sucheingabe soll nicht bei jedem Tastendruck eine Anfrage auslösen.
 *
 * Der Kniff steckt in der CLEANUP-FUNKTION: bei jeder Aenderung räumt React
 * den alten Timer ab, bevor der Effekt neu läuft. Der Timer läuft also nur
 * durch, wenn `wert` für `verzoegerungMs` stabil bleibt.
 */
export function useDebounce<T>(wert: T, verzoegerungMs = 400) {
  const [verzoegerterWert, setVerzoegerterWert] = useState(wert)

  useEffect(() => {
    const timer = setTimeout(() => setVerzoegerterWert(wert), verzoegerungMs)
    return () => clearTimeout(timer) // Cleanup vor dem nächsten Lauf + beim Unmount
  }, [wert, verzoegerungMs])

  return verzoegerterWert
}
