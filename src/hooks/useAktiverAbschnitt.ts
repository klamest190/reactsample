import { useEffect, useState } from 'react'
import type { Abschnittseintrag } from '../components/Gliederung'

/**
 * Welcher Abschnitt ist gerade im Bild? Für die mitlaufende Gliederung am rechten Rand.
 *
 * Der IntersectionObserver meldet, wenn eine Überschrift das obere Drittel des
 * Fensters kreuzt - ohne scroll-Listener, der bei jedem Pixel feuern würde.
 * Aktiv ist der letzte Abschnitt, dessen Anfang schon über dieser Linie liegt.
 */
export function useAktiverAbschnitt(eintraege: Abschnittseintrag[]) {
  const [aktiv, setAktiv] = useState<string | null>(null)

  useEffect(() => {
    const elemente = eintraege
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null)
    if (elemente.length === 0) return

    const beobachter = new IntersectionObserver(
      () => {
        // Nicht den Einträgen des Observers trauen - bei schnellem Scrollen fehlen welche.
        // Stattdessen alle Positionen frisch lesen, das sind nur eine Handvoll.
        const linie = window.innerHeight / 3
        let treffer = elemente[0].id
        for (const el of elemente) {
          if (el.getBoundingClientRect().top <= linie) treffer = el.id
        }
        setAktiv(treffer)
      },
      { rootMargin: '0px 0px -66% 0px' },
    )
    elemente.forEach((el) => beobachter.observe(el))
    return () => beobachter.disconnect()
  }, [eintraege])

  return aktiv
}
