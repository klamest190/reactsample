import type { Modus as EditorMode } from '../lernen/modi'

/** How a chapter uses an example: `<TryIt id="…" modus="react" typen vorschau />`. */
export type TryItUsage = { modus: EditorMode; typen: boolean; vorschau: boolean }

/**
 * Reads every `<TryIt>` from chapter sources and returns its usage by id. The examples in the
 * `.code.ts` files don't know their editor mode - only the chapter text that shows them does.
 *
 * Only the props up to `aufgabe=` or the end of the tag are read: the task text after it is
 * prose and may mention words like "typen". A `<TryIt>` without `modus` runs as JavaScript.
 */
export function tryItUsages(sources: Iterable<string>): Map<string, TryItUsage> {
  const usages = new Map<string, TryItUsage>()
  for (const source of sources) {
    for (const piece of source.split('<TryIt').slice(1)) {
      const end = Math.min(...['aufgabe=', '/>'].map((s) => piece.indexOf(s)).filter((i) => i >= 0))
      const props = piece.slice(0, end)
      const id = props.match(/id="([^"]+)"/)?.[1]
      if (!id) continue
      const modus = (props.match(/modus="(\w+)"/)?.[1] ?? 'js') as EditorMode
      usages.set(id, { modus, typen: /\btypen\b/.test(props), vorschau: /\bvorschau\b/.test(props) })
    }
  }
  return usages
}
