import type { IconName } from './Icon'

/**
 * Symbol und Farbe pro Kursteil (Seitenleiste, Startseite, Kapitelkopf, Playground).
 *
 * `kuerzel` statt Icon für die beiden Sprachen, die man an ihrem Kürzel erkennt (JS, TS).
 * `farbe` ist die Kachel: leichter Verlauf plus Innenrand, damit sie auf hellem und
 * dunklem Grund plastisch wirkt statt wie ein flacher Farbfleck.
 * Tailwind-Klassen als ganze Strings, damit der Scanner sie findet.
 */
export const TEIL_STIL: Record<string, { icon: IconName; kuerzel?: string; farbe: string }> = {
  javascript: {
    icon: 'code',
    kuerzel: 'JS',
    farbe:
      'bg-linear-to-br from-amber-100 to-amber-200/70 text-amber-800 ring-amber-500/25 dark:from-amber-400/25 dark:to-amber-500/10 dark:text-amber-200 dark:ring-amber-300/20',
  },
  typescript: {
    icon: 'schild',
    kuerzel: 'TS',
    farbe:
      'bg-linear-to-br from-blue-100 to-blue-200/70 text-blue-800 ring-blue-500/25 dark:from-blue-400/25 dark:to-blue-500/10 dark:text-blue-200 dark:ring-blue-300/20',
  },
  react: {
    icon: 'atom',
    farbe:
      'bg-linear-to-br from-sky-100 to-cyan-200/70 text-sky-700 ring-sky-500/25 dark:from-sky-400/25 dark:to-cyan-500/10 dark:text-sky-200 dark:ring-sky-300/20',
  },
  hooks: {
    icon: 'angelhaken',
    farbe:
      'bg-linear-to-br from-violet-100 to-violet-200/70 text-violet-700 ring-violet-500/25 dark:from-violet-400/25 dark:to-violet-500/10 dark:text-violet-200 dark:ring-violet-300/20',
  },
  praxis: {
    icon: 'werkzeug',
    farbe:
      'bg-linear-to-br from-teal-100 to-teal-200/70 text-teal-700 ring-teal-500/25 dark:from-teal-400/25 dark:to-teal-500/10 dark:text-teal-200 dark:ring-teal-300/20',
  },
  projekt: {
    icon: 'checkliste',
    farbe:
      'bg-linear-to-br from-rose-100 to-rose-200/70 text-rose-700 ring-rose-500/25 dark:from-rose-400/25 dark:to-rose-500/10 dark:text-rose-200 dark:ring-rose-300/20',
  },
  java: {
    icon: 'tasse',
    farbe:
      'bg-linear-to-br from-orange-100 to-orange-200/70 text-orange-700 ring-orange-500/25 dark:from-orange-400/25 dark:to-orange-500/10 dark:text-orange-200 dark:ring-orange-300/20',
  },
  backend: {
    icon: 'server',
    farbe:
      'bg-linear-to-br from-emerald-100 to-green-200/70 text-emerald-700 ring-emerald-500/25 dark:from-emerald-400/25 dark:to-green-500/10 dark:text-emerald-200 dark:ring-emerald-300/20',
  },
}
