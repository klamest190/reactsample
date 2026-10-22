export type Cursor = { line: number; column: number }

/**
 * The cursor position changes on every keystroke. If it lived in `EditorFrame`'s state,
 * every character would re-render the whole frame - editor, tabs, console - and Monaco
 * would start dropping input (measurably: at 20 ms between keystrokes a character was
 * already lost). So it goes through this tiny store instead, and only the one span in the
 * status bar subscribes to it.
 */
export type CursorStore = {
  get: () => Cursor
  set: (at: Cursor) => void
  subscribe: (listener: () => void) => () => void
}

export function createCursorStore(): CursorStore {
  let at: Cursor = { line: 1, column: 1 }
  const listeners = new Set<() => void>()
  return {
    get: () => at,
    set(next) {
      if (next.line === at.line && next.column === at.column) return
      at = next
      for (const listener of listeners) listener()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
