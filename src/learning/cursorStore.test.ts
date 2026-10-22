import { describe, expect, it, vi } from 'vitest'

import { createCursorStore } from './cursorStore'

describe('createCursorStore', () => {
  it('starts at the beginning of the document', () => {
    expect(createCursorStore().get()).toEqual({ line: 1, column: 1 })
  })

  it('notifies subscribers about a new position', () => {
    const store = createCursorStore()
    const listener = vi.fn()
    store.subscribe(listener)

    store.set({ line: 4, column: 7 })

    expect(listener).toHaveBeenCalledOnce()
    expect(store.get()).toEqual({ line: 4, column: 7 })
  })

  it('stays silent when the position has not changed', () => {
    // That is the point of the store: a keystroke that does not move the cursor to a new
    // line or column must not re-render the status bar.
    const store = createCursorStore()
    const listener = vi.fn()
    store.subscribe(listener)

    store.set({ line: 1, column: 1 })

    expect(listener).not.toHaveBeenCalled()
  })

  it('returns a stable object so useSyncExternalStore does not loop', () => {
    const store = createCursorStore()
    expect(store.get()).toBe(store.get())
  })

  it('stops notifying after unsubscribing', () => {
    const store = createCursorStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    unsubscribe()
    store.set({ line: 2, column: 1 })

    expect(listener).not.toHaveBeenCalled()
  })
})
