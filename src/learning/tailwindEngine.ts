import { __unstable__loadDesignSystem, compile } from 'tailwindcss'
import projektCss from '../index.css?raw'
import themeCss from 'tailwindcss/theme.css?raw'
import utilitiesCss from 'tailwindcss/utilities.css?raw'
import type { Suggestion } from './suggestions'

/**
 * Tailwind im Browser - mit derselben Engine, die Vite beim Bauen benutzt (Paket `tailwindcss`).
 * Wird erst geladen, wenn ein React-Editor Tailwind-Klassen braucht (siehe tailwind.ts).
 *
 * Zwei Aufgaben:
 *  - Vorschläge: alle Klassen samt erzeugtem CSS - wie die Tailwind-Erweiterung in VS Code.
 *  - Vorschau: CSS für genau die Klassen, die im Editor-Code stehen. Das Seiten-CSS enthält
 *    nur Klassen, die irgendwo im Projekt vorkommen - ohne das hier bliebe z. B. `bg-lime-300` wirkungslos.
 *
 * Grundlage ist das Theme von Tailwind plus die eigenen Einstellungen aus index.css
 * (Brand-Farben, Dark-Mode-Variante). Preflight fehlt absichtlich - das hat die Seite schon.
 */

const own = [...(projektCss.match(/@custom-variant[^;]+;/g) ?? []), ...(projektCss.match(/@theme\s*\{[^}]*\}/g) ?? [])].join('\n')

const INPUT = `@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
${own}`

async function loadStylesheet(id: string, base: string) {
  const content = id.includes('theme') ? themeCss : id.includes('utilities') ? utilitiesCss : ''
  return { path: id, base, content }
}

/** Alle Theme-Variablen (--color-red-500, --spacing, --text-sm …) mit ihrem Wert - für Farbfelder und Kommentare. */
const VARIABLES = new Map<string, string>()
for (const css of [themeCss, own]) {
  for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) VARIABLES.set(name, value.trim())
}

const designSystem = await __unstable__loadDesignSystem(INPUT, { loadStylesheet })
const CLASSES = designSystem.getClassList().map(([name]) => name)
const VARIANTS = designSystem
  .getVariants()
  .filter((v) => !v.isArbitrary)
  .flatMap((v) => (v.values.length ? v.values.map((value) => `${v.name}${v.hasDash ? '-' : ''}${value}`) : [v.name]))

const MAX_HITS = 150

/**
 * Vorschläge für das Wort vor dem Cursor, z. B. `bg-re` oder `hover:text-`.
 * Varianten davor (`hover:`, `md:`, `dark:`) bleiben stehen - ersetzt wird nur der Teil danach.
 */
export function suggestions(word: string): { hits: Suggestion[]; replaceChars: number } {
  const trenner = word.lastIndexOf(':')
  const variants = word.slice(0, trenner + 1)
  const part = word.slice(trenner + 1)
  // "!" (important) und "-" (negativ) gehören vor die Klasse, werden aber nicht mitgesucht.
  const prefix = part.match(/^!?-?/)![0]
  const query = part.slice(prefix.length)

  const classes = CLASSES.filter((k) => k.startsWith(query))
  // Varianten nur vorschlagen, solange noch keine Klasse eindeutig getippt ist.
  const variantHits = query && !prefix ? VARIANTS.filter((v) => v.startsWith(query) && !CLASSES.includes(query)) : []

  const selection = [...variantHits.slice(0, 20), ...classes].slice(0, MAX_HITS)
  const cssList = designSystem.candidatesToCss(selection.map((k) => variants + prefix + k))

  const hits = selection.map((name, i): Suggestion => {
    if (i < Math.min(variantHits.length, 20)) {
      return { label: name + ':', kind: 'tailwind', info: '', css: `/* Variante: ${name}:… */` }
    }
    const css = cssList[i]
    return { label: prefix + name, kind: 'tailwind', info: '', css: css ? readable(css) : undefined, color: css ? colorOff(css) : undefined }
  })
  return { hits, replaceChars: part.length }
}

/** Nur die Deklarationen, dazu die Werte der Theme-Variablen als Kommentar - wie VS Code es anzeigt. */
function readable(css: string) {
  return css
    .split('\n')
    .map((line) => {
      const variables = [...line.matchAll(/var\((--[\w-]+)\)/g)].map((t) => t[1])
      const values = variables.map((v) => VARIABLES.get(v)).filter(Boolean)
      const gap = line.match(/calc\(var\(--spacing\) \* (-?[\d.]+)\)/)
      if (gap) return `${line} /* ${Number(gap[1]) * 0.25}rem */`
      return values.length && line.includes(':') ? `${line} /* ${values.join(', ')} */` : line
    })
    .join('\n')
}

/** Farbe für das Farbfeld in der Liste: die erste Farbvariable im CSS oder ein Farbwort. */
function colorOff(css: string): string | undefined {
  if (!/(color|background|fill|stroke|border|outline|decoration|shadow|accent|caret|--tw-gradient|--tw-ring)/.test(css)) return undefined
  const variable = css.match(/var\((--color-[\w-]+)\)/)?.[1]
  if (variable) return VARIABLES.get(variable)
  return css.match(/:\s*(transparent|currentcolor|#[0-9a-f]{3,8})\b/i)?.[1]
}

// ---------------------------------------------------------------------------
// CSS für die Vorschau
// ---------------------------------------------------------------------------

const compiler = await compile(INPUT, { loadStylesheet })
let style: HTMLStyleElement | null = null

/**
 * Erzeugt CSS für die Kandidaten und hängt es an die Seite. `build` merkt sich alle bisherigen
 * Kandidaten und liefert jedes Mal das vollständige CSS - ein <style>-Element reicht also.
 * Ungültige Kandidaten (normale Wörter aus dem Code) ignoriert Tailwind einfach.
 */
export function cssForPreview(candidates: string[]) {
  // Into the layer "preview" below the page's utilities (see index.css): a class the page
  // already has keeps the page's rules - including its dark: variants.
  const css = compiler.build(candidates).replaceAll('@layer utilities', '@layer preview')
  if (!style) {
    style = document.createElement('style')
    style.dataset.tailwindVorschau = ''
    document.head.appendChild(style)
  }
  if (style.textContent !== css) style.textContent = css
}
