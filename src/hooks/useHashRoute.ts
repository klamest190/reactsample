import { useCallback, useSyncExternalStore } from 'react'

/**
 * EIGENER HOOK: Mini-Router über den URL-Hash (#/kapitel-id).
 *
 * useSyncExternalStore ist der offizielle Weg, einen Wert AUSSERHALB von React
 * (hier: window.location.hash) als State zu benutzen:
 *   1. subscribe: sich für Änderungen anmelden, Abmelde-Funktion zurückgeben
 *   2. getSnapshot: den aktuellen Wert lesen
 * React rendert neu, sobald sich der Snapshot ändert - auch beim Zurück-Button.
 */

function abonnieren(beiAenderung: () => void) {
  window.addEventListener('hashchange', beiAenderung)
  return () => window.removeEventListener('hashchange', beiAenderung)
}

function lesen() {
  return window.location.hash.replace(/^#\/?/, '')
}

export function useHashRoute() {
  const route = useSyncExternalStore(abonnieren, lesen)

  const navigieren = useCallback((ziel: string) => {
    window.location.hash = ziel ? '/' + ziel : ''
  }, [])

  return [route, navigieren] as const
}
