import type { IconName } from './Icon'

// Icon und Farbe pro Kursteil (Seitenleiste, Playground). Tailwind-Klassen als ganze Strings, damit der Scanner sie findet.
export const TEIL_STIL: Record<string, { icon: IconName; farbe: string }> = {
  javascript: { icon: 'code', farbe: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  typescript: { icon: 'schild', farbe: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  react: { icon: 'atom', farbe: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
  hooks: { icon: 'anker', farbe: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' },
  praxis: { icon: 'koffer', farbe: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  projekt: { icon: 'flagge', farbe: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  java: { icon: 'tasse', farbe: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300' },
}
