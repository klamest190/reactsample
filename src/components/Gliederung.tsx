import { useEffect, type RefObject } from 'react'

/** Ein Eintrag im Inhaltsverzeichnis eines Kapitels. */
export type Abschnittseintrag = { id: string; titel: string }

/**
 * Sammelt die Abschnitte eines Kapitels ein und meldet sie nach oben.
 *
 * Warum der Umweg über das DOM? Das Kapitel ist eine fremde, per lazy() geladene
 * Komponente. Die Kapitelseite bekommt sie als <Inhalt /> und kann ihre Kinder
 * nicht lesen - React-Elemente sind von außen nicht durchsuchbar.
 *
 * Ein Zähler beim Rendern wäre die Alternative, aber das wäre eine unreine
 * Render-Funktion - genau das, wovor StrictMode warnt (siehe main.tsx).
 * Nach dem Rendern im Effekt nachzuschauen ist ehrlicher: dann steht die
 * Reihenfolge fest, und das DOM ist die Quelle der Wahrheit.
 *
 * Die Komponente rendert nichts. Sie steht als Geschwister INNERHALB von
 * <Suspense>, damit ihr Effekt erst läuft, wenn das Kapitel wirklich da ist.
 */
export function GliederungMelden({
  wurzel,
  melden,
}: {
  wurzel: RefObject<HTMLElement | null>
  melden: (eintraege: Abschnittseintrag[]) => void
}) {
  useEffect(() => {
    const el = wurzel.current
    if (!el) return

    const eintraege: Abschnittseintrag[] = []
    // :scope > section = nur die direkten Abschnitte des Kapitels,
    // nicht die <section> in eingebetteten Demos.
    el.querySelectorAll<HTMLElement>(':scope > section').forEach((abschnitt, i) => {
      const ueberschrift = abschnitt.querySelector(':scope > h2')
      if (!ueberschrift) return
      const id = abschnitt.dataset.anker || `abschnitt-${i + 1}`
      abschnitt.id = id
      eintraege.push({ id, titel: ueberschrift.textContent ?? '' })
    })
    melden(eintraege)

    // Beim Kapitelwechsel leeren, sonst zeigt das Verzeichnis kurz die alten Abschnitte.
    return () => melden([])
  }, [wurzel, melden])

  return null
}
