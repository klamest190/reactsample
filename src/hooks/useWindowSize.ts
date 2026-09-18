import { useEffect, useState } from 'react'

/**
 * EIGENER HOOK: abonniert ein Browser-Event und räumt es wieder ab.
 * Das ist das Standardmuster für "React mit der Außenwelt verbinden":
 *   1. Zustand anlegen
 *   2. Im Effekt Listener registrieren
 *   3. In der Cleanup-Funktion Listener entfernen (sonst Memory Leak!)
 */
export function useWindowSize() {
  const [groesse, setGroesse] = useState({
    breite: window.innerWidth,
    hoehe: window.innerHeight,
  })

  useEffect(() => {
    function beiResize() {
      setGroesse({ breite: window.innerWidth, hoehe: window.innerHeight })
    }

    window.addEventListener('resize', beiResize)
    beiResize() // einmal direkt aufrufen, falls sich die Groesse vorher geändert hat

    return () => window.removeEventListener('resize', beiResize)
  }, []) // leeres Array = nur beim Mount registrieren, beim Unmount abräumen

  return groesse
}
