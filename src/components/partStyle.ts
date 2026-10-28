import { kurs, type Bereich } from '../course/course'
import type { IconName } from './Icon'

/**
 * Symbol pro Kursteil (Seitenleiste, Startseite, Kapitelkopf, Playground).
 *
 * `kuerzel` statt Icon für die beiden Sprachen, die man an ihrem Kürzel erkennt (JS, TS).
 * The colour does not come from the part but from its area: one colour per line of the
 * route map on the start page (see BEREICH_STIL). Eleven colours for eleven parts sorted
 * nothing - three colours for three areas say where a part belongs.
 */
export const TEIL_STIL: Record<string, { icon: IconName; kuerzel?: string }> = {
  javascript: { icon: 'code', kuerzel: 'JS' },
  typescript: { icon: 'schild', kuerzel: 'TS' },
  react: { icon: 'atom' },
  hooks: { icon: 'angelhaken' },
  praxis: { icon: 'werkzeug' },
  projekt: { icon: 'checkliste' },
  java: { icon: 'tasse' },
  backend: { icon: 'server' },
  sql: { icon: 'datenbank' },
  claude: { icon: 'terminal' },
  'claude-advanced': { icon: 'puzzle' },
}

/**
 * Colours of one line (area). Tailwind classes as whole strings so the scanner finds them.
 *   kachel: the part badge         linie: travelled track      rand: dashed track, station ring
 *   halo:   ring around "you are here"     deko: underline of the chosen station     punkt: filled station
 *   text:   line-coloured text (AA on white and on slate-900)     spur: tinted surface
 */
export const BEREICH_STIL: Record<
  Bereich,
  { kachel: string; linie: string; rand: string; halo: string; deko: string; punkt: string; text: string; spur: string }
> = {
  frontend: {
    kachel: 'bg-frontend-100 text-frontend-800 ring-frontend-500/30 dark:bg-frontend-400/15 dark:text-frontend-200 dark:ring-frontend-300/25',
    linie: 'bg-frontend-500',
    rand: 'border-frontend-500',
    halo: 'ring-frontend-500/30',
    deko: 'decoration-frontend-500',
    punkt: 'bg-frontend-600',
    text: 'text-frontend-700 dark:text-frontend-300',
    spur: 'bg-frontend-200 dark:bg-frontend-900',
  },
  backend: {
    kachel: 'bg-backend-100 text-backend-800 ring-backend-500/30 dark:bg-backend-400/15 dark:text-backend-200 dark:ring-backend-300/25',
    linie: 'bg-backend-500',
    rand: 'border-backend-500',
    halo: 'ring-backend-500/30',
    deko: 'decoration-backend-500',
    punkt: 'bg-backend-600',
    text: 'text-backend-700 dark:text-backend-300',
    spur: 'bg-backend-200 dark:bg-backend-900',
  },
  tools: {
    kachel: 'bg-tools-100 text-tools-800 ring-tools-500/30 dark:bg-tools-400/15 dark:text-tools-200 dark:ring-tools-300/25',
    linie: 'bg-tools-500',
    rand: 'border-tools-500',
    halo: 'ring-tools-500/30',
    deko: 'decoration-tools-500',
    punkt: 'bg-tools-600',
    text: 'text-tools-700 dark:text-tools-300',
    spur: 'bg-tools-200 dark:bg-tools-900',
  },
}

/** The area a part belongs to - frontend for unknown ids. */
export function bereichVon(teilId: string): Bereich {
  return kurs.find((teil) => teil.id === teilId)?.bereich ?? 'frontend'
}
