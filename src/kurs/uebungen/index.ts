import type { Uebung, UebungsSammlung } from './typen'

/**
 * Übungen werden pro Kursteil erst geladen, wenn ein Kapitel des Teils geöffnet wird.
 * Die Promises werden zwischengespeichert - `use(promise)` braucht bei jedem Render
 * dasselbe Promise-Objekt (siehe Kapitel 4.9).
 */
const LADER: Record<string, () => Promise<{ uebungen: UebungsSammlung }>> = {
  js: () => import('./js'),
  ts: () => import('./ts'),
  java: () => import('./java'),
  react: () => import('./react'),
  hooks: () => import('./hooks'),
  praxis: () => import('./praxis'),
}

const cache = new Map<string, Promise<Uebung[]>>()

export function uebungenFuer(kapitelId: string): Promise<Uebung[]> {
  let promise = cache.get(kapitelId)
  if (!promise) {
    const teil = kapitelId.split('-')[0]
    const lader = LADER[teil]
    promise = lader ? lader().then((modul) => modul.uebungen[kapitelId] ?? []) : Promise.resolve([])
    cache.set(kapitelId, promise)
  }
  return promise
}
