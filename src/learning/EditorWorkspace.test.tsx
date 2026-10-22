import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderInApp } from '../test/render'
import { EditorWorkspace, type Area } from './EditorWorkspace'
import { createCursorStore } from './cursorStore'

const cursor = createCursorStore()
cursor.set({ line: 3, column: 12 })

const areas: Area[] = [
  { id: 'output', title: 'Console', icon: 'kolben', content: <p>console output</p> },
  { id: 'preview', title: 'Preview', icon: 'auge', content: <iframe title="preview" /> },
  { id: 'tests', title: 'Tests', icon: 'kreisHaken', content: <p>test results</p>, empty: true },
  { id: 'problems', title: 'Problems', icon: 'warnung', content: <p>two problems</p>, count: 2 },
]

function setup(override: Partial<Parameters<typeof EditorWorkspace>[0]> = {}) {
  return renderInApp(
    <EditorWorkspace
      editor={<div>editor</div>}
      areas={areas}
      kindLabel="JS"
      cursor={cursor}
      duration={42}
      minimap={false}
      onToggleMinimap={() => {}}
      storageId="test"
      {...override}
    />,
  )
}

beforeEach(() => localStorage.clear())

describe('EditorWorkspace', () => {
  it('shows a tab per area and hides the empty ones', () => {
    setup()
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Console', 'Preview', 'Problems2'])
    expect(screen.queryByRole('tab', { name: /Tests/ })).toBeNull()
  })

  it('starts on the first area - the most important one of that editor', () => {
    setup()
    expect(screen.getByRole('tab', { name: 'Console' })).toHaveAttribute('aria-selected', 'true')
  })

  it('keeps every panel mounted and only hides the inactive ones', async () => {
    const user = userEvent.setup()
    setup()

    // The preview holds running things (iframe, React root, PGlite) - switching tabs must
    // not unmount them, so it is in the DOM even while the console tab is active.
    const preview = document.querySelector('iframe[title="preview"]')
    expect(preview).not.toBeNull()
    expect(screen.getByText('console output')).toBeVisible()
    expect(screen.getByText('two problems')).not.toBeVisible()

    await user.click(screen.getByRole('tab', { name: 'Problems2' }))

    expect(screen.getByText('two problems')).toBeVisible()
    expect(screen.getByText('console output')).not.toBeVisible()
    // Still the very same element - not remounted.
    expect(document.querySelector('iframe[title="preview"]')).toBe(preview)
  })

  it('falls back to the first visible area when the active one becomes empty', () => {
    const { rerender } = setup()
    rerender(
      <EditorWorkspace
        editor={<div>editor</div>}
        areas={areas.map((a) => (a.id === 'output' ? { ...a, empty: true } : a))}
        kindLabel="JS"
        cursor={cursor}
        duration={null}
        minimap={false}
        onToggleMinimap={() => {}}
        storageId="test"
      />,
    )
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true')
  })

  it('reports language, cursor position and run time in the status bar', () => {
    setup()
    expect(screen.getByText('JS')).toBeInTheDocument()
    expect(screen.getByText('Line 3, column 12')).toBeInTheDocument()
    expect(screen.getByText('42 ms')).toBeInTheDocument()
  })

  it('leaves the run time out before the first run', () => {
    setup({ duration: null })
    expect(screen.queryByText(/ ms$/)).toBeNull()
  })

  it('toggles the minimap', async () => {
    const user = userEvent.setup()
    const onToggleMinimap = vi.fn()
    setup({ onToggleMinimap })
    await user.click(screen.getByRole('button', { name: 'Show minimap' }))
    expect(onToggleMinimap).toHaveBeenCalledOnce()
  })

  it('gives the resize separator an accessible name - it is keyboard operable', () => {
    setup()
    expect(screen.getByRole('separator', { name: 'Resize areas' })).toBeInTheDocument()
  })
})
