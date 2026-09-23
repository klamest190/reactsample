import { createElement, lazy } from 'react'
import { projektSchritte } from '../projekt/meta'
import type { Teil } from './typen'

export const projektTeil: Teil = {
  id: 'projekt',
  nummer: 6,
  titel: { de: 'Projekt: ToDo-App', en: 'Project: Todo App' },
  kurztitel: { de: 'ToDo-Projekt', en: 'Todo Project' },
  bereich: 'frontend',
  beschreibung: {
    de: 'Der rote Faden: eine ToDo-App in 15 Schritten, die mit jedem Kursteil wächst - bis zur Challenge ohne Vorlage.',
    en: 'The common thread: a todo app in 15 steps that grows with every part of the course - up to a challenge without a template.',
  },
  // Alle Schritte teilen sich eine Seite, die ihre Daten per id nachlädt.
  kapitel: projektSchritte.map((schritt) => {
    const Seite = lazy(() =>
      import('../projekt/ProjektSchritt').then((modul) => ({
        default: () => createElement(modul.ProjektSchritt, { id: schritt.id }),
      })),
    )
    return { ...schritt, Komponente: { de: Seite, en: Seite } }
  }),
}
