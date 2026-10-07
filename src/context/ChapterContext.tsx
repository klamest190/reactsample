/* oxlint-disable react/only-export-components -- Context und Hook gehören zusammen. */
import { createContext, useContext, type ReactNode } from 'react'

/**
 * Welches Kapitel wird gerade angezeigt?
 *
 * Das Quiz steht tief im Kapitelinhalt und hat über 100 Aufrufstellen - eine
 * neue Prop an jeder einzelnen wäre Unfug. Über den Context findet es selbst
 * heraus, zu welchem Kapitel es gehört, und kann seinen Stand speichern.
 *
 * Kein Provider = null. Das ist erlaubt: Kapitelinhalte tauchen auch im
 * Playground und in der Werkstatt auf, dort gibt es nichts zu speichern.
 */
const KapitelIdContext = createContext<string | null>(null)

export function KapitelIdProvider({ id, children }: { id: string; children: ReactNode }) {
  return <KapitelIdContext value={id}>{children}</KapitelIdContext>
}

export function useKapitelId() {
  return useContext(KapitelIdContext)
}
