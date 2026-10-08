import type { Mode as EditorMode } from '../learning/modes'

/** How a chapter uses an example: `<TryIt id="…" mode="react" typed preview />`. */
export type TryItUsage = { mode: EditorMode; typed: boolean; preview: boolean }

/**
 * Reads every `<TryIt>` from chapter sources and returns its usage by id. The examples in the
 * `.code.ts` files don't know their editor mode - only the chapter text that shows them does.
 *
 * Only the props up to `task=` or the end of the tag are read: the task text after it is
 * prose and may mention words like "typed". A `<TryIt>` without `mode` runs as JavaScript.
 */
export function tryItUsages(sources: Iterable<string>): Map<string, TryItUsage> {
  const usages = new Map<string, TryItUsage>()
  for (const source of sources) {
    for (const piece of source.split('<TryIt').slice(1)) {
      const end = Math.min(...['task=', '/>'].map((s) => piece.indexOf(s)).filter((i) => i >= 0))
      const props = piece.slice(0, end)
      const id = props.match(/id="([^"]+)"/)?.[1]
      if (!id) continue
      const mode = (props.match(/mode="(\w+)"/)?.[1] ?? 'js') as EditorMode
      usages.set(id, { mode, typed: /\btyped\b/.test(props), preview: /\bpreview\b/.test(props) })
    }
  }
  return usages
}
