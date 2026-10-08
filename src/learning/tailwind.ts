/**
 * Tailwind in den React-Editoren - der leichte Teil, der immer geladen ist.
 * Die eigentliche Engine (tailwindMotor.ts, gut 250 kB) kommt erst, wenn sie gebraucht wird.
 */

type Engine = typeof import('./tailwindEngine')
let engine: Promise<Engine> | null = null

export function tailwindEngine(): Promise<Engine> {
  engine ??= import('./tailwindEngine')
  return engine
}

/**
 * Steht der Cursor in einer Klassenliste? Dann liefert die Funktion das angefangene Wort.
 * Erkannt werden `className="…"`, `className={'…'}`, `className={`…`}`, `class="…"`
 * und die Argumente von `cn(…)` / `clsx(…)`.
 */
export function classWord(before: string): string | null {
  const rest = before.slice(-500)
  const context =
    /\bclass(?:Name)?\s*=\s*\{?\s*(["'`])(?:(?!\1)[^\n])*$/.test(rest) || /\b(?:cn|clsx|classNames|twMerge)\([^()]*(["'`])(?:(?!\1)[^\n])*$/.test(rest)
  if (!context) return null
  // Das Wort geht bis zum letzten Leerzeichen oder Anführungszeichen - mit - : / [ ] . # % !
  return rest.match(/[^\s"'`{}()$]*$/)![0]
}

/** Mögliche Klassen im Code - Tailwind sortiert ungültige selbst aus. */
function candidates(code: string) {
  return [...new Set(code.split(/[\s"'`{}()<>;,=]+/))].filter((k) => k.length > 1 && k.length < 100 && /^[!@\-[a-z]/.test(k))
}

/**
 * Sorgt dafür, dass alle Tailwind-Klassen aus dem Editor-Code in der Vorschau wirken.
 * Ohne Klassenlisten im Code wird die Engine gar nicht erst geladen.
 */
export function tailwindForPreview(code: string) {
  if (!/\bclass(Name)?\b|\b(cn|clsx)\(/.test(code)) return
  void tailwindEngine()
    .then((m) => m.cssForPreview(candidates(code)))
    .catch((error: unknown) => console.error('Tailwind:', error))
}
