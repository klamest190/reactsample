import { __unstable__loadDesignSystem, compile } from 'tailwindcss'
import projektCss from '../index.css?raw'
import themeCss from 'tailwindcss/theme.css?raw'
import utilitiesCss from 'tailwindcss/utilities.css?raw'
import type { Vorschlag } from './vorschlaege'

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

const eigenes = [...(projektCss.match(/@custom-variant[^;]+;/g) ?? []), ...(projektCss.match(/@theme\s*\{[^}]*\}/g) ?? [])].join('\n')

const EINGABE = `@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
${eigenes}`

async function loadStylesheet(id: string, base: string) {
  const content = id.includes('theme') ? themeCss : id.includes('utilities') ? utilitiesCss : ''
  return { path: id, base, content }
}

/** Alle Theme-Variablen (--color-red-500, --spacing, --text-sm …) mit ihrem Wert - für Farbfelder und Kommentare. */
const VARIABLEN = new Map<string, string>()
for (const css of [themeCss, eigenes]) {
  for (const [, name, wert] of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) VARIABLEN.set(name, wert.trim())
}

const designSystem = await __unstable__loadDesignSystem(EINGABE, { loadStylesheet })
const KLASSEN = designSystem.getClassList().map(([name]) => name)
const VARIANTEN = designSystem
  .getVariants()
  .filter((v) => !v.isArbitrary)
  .flatMap((v) => (v.values.length ? v.values.map((wert) => `${v.name}${v.hasDash ? '-' : ''}${wert}`) : [v.name]))

const MAX_TREFFER = 150

/**
 * Vorschläge für das Wort vor dem Cursor, z. B. `bg-re` oder `hover:text-`.
 * Varianten davor (`hover:`, `md:`, `dark:`) bleiben stehen - ersetzt wird nur der Teil danach.
 */
export function vorschlaege(wort: string): { treffer: Vorschlag[]; ersetzeZeichen: number } {
  const trenner = wort.lastIndexOf(':')
  const varianten = wort.slice(0, trenner + 1)
  const teil = wort.slice(trenner + 1)
  // "!" (important) und "-" (negativ) gehören vor die Klasse, werden aber nicht mitgesucht.
  const vorsatz = teil.match(/^!?-?/)![0]
  const suche = teil.slice(vorsatz.length)

  const klassen = KLASSEN.filter((k) => k.startsWith(suche))
  // Varianten nur vorschlagen, solange noch keine Klasse eindeutig getippt ist.
  const variantenTreffer = suche && !vorsatz ? VARIANTEN.filter((v) => v.startsWith(suche) && !KLASSEN.includes(suche)) : []

  const auswahl = [...variantenTreffer.slice(0, 20), ...klassen].slice(0, MAX_TREFFER)
  const cssListe = designSystem.candidatesToCss(auswahl.map((k) => varianten + vorsatz + k))

  const treffer = auswahl.map((name, i): Vorschlag => {
    if (i < Math.min(variantenTreffer.length, 20)) {
      return { label: name + ':', art: 'tailwind', info: '', css: `/* Variante: ${name}:… */` }
    }
    const css = cssListe[i]
    return { label: vorsatz + name, art: 'tailwind', info: '', css: css ? lesbar(css) : undefined, farbe: css ? farbeAus(css) : undefined }
  })
  return { treffer, ersetzeZeichen: teil.length }
}

/** Nur die Deklarationen, dazu die Werte der Theme-Variablen als Kommentar - wie VS Code es anzeigt. */
function lesbar(css: string) {
  return css
    .split('\n')
    .map((zeile) => {
      const variablen = [...zeile.matchAll(/var\((--[\w-]+)\)/g)].map((t) => t[1])
      const werte = variablen.map((v) => VARIABLEN.get(v)).filter(Boolean)
      const abstand = zeile.match(/calc\(var\(--spacing\) \* (-?[\d.]+)\)/)
      if (abstand) return `${zeile} /* ${Number(abstand[1]) * 0.25}rem */`
      return werte.length && zeile.includes(':') ? `${zeile} /* ${werte.join(', ')} */` : zeile
    })
    .join('\n')
}

/** Farbe für das Farbfeld in der Liste: die erste Farbvariable im CSS oder ein Farbwort. */
function farbeAus(css: string): string | undefined {
  if (!/(color|background|fill|stroke|border|outline|decoration|shadow|accent|caret|--tw-gradient|--tw-ring)/.test(css)) return undefined
  const variable = css.match(/var\((--color-[\w-]+)\)/)?.[1]
  if (variable) return VARIABLEN.get(variable)
  return css.match(/:\s*(transparent|currentcolor|#[0-9a-f]{3,8})\b/i)?.[1]
}

// ---------------------------------------------------------------------------
// CSS für die Vorschau
// ---------------------------------------------------------------------------

const compiler = await compile(EINGABE, { loadStylesheet })
let stil: HTMLStyleElement | null = null

/**
 * Erzeugt CSS für die Kandidaten und hängt es an die Seite. `build` merkt sich alle bisherigen
 * Kandidaten und liefert jedes Mal das vollständige CSS - ein <style>-Element reicht also.
 * Ungültige Kandidaten (normale Wörter aus dem Code) ignoriert Tailwind einfach.
 */
export function cssFuerVorschau(kandidaten: string[]) {
  const css = compiler.build(kandidaten)
  if (!stil) {
    stil = document.createElement('style')
    stil.dataset.tailwindVorschau = ''
    document.head.appendChild(stil)
  }
  if (stil.textContent !== css) stil.textContent = css
}
