import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderInApp } from '../test/render'
import { EditorFrame } from './EditorFrame'

const START = 'const x = 1'
const SOLUTION = 'const x = 2'

/** A frame with real code state, like the editors use it. */
function Frame({ run }: { run: (code?: string) => void }) {
  const [code, setCode] = useState(START)
  return (
    <EditorFrame
      kind="JavaScript"
      title="Variables"
      task="Change x to 2."
      code={code}
      setCode={setCode}
      startCode={START}
      solution={SOLUTION}
      hints={{ de: ['Erster', 'Zweiter'], en: ['First hint', 'Second hint'] }}
      run={run}
    >
      <output>{code}</output>
    </EditorFrame>
  )
}

beforeEach(() => localStorage.clear())

describe('Rahmen', () => {
  it('shows an exercise with its task', () => {
    renderInApp(<Frame run={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /^Exercise\s*· Variables$/ })).toBeInTheDocument()
    expect(screen.getByText('Change x to 2.')).toBeInTheDocument()
  })

  it('reveals hints one after another', async () => {
    const user = userEvent.setup()
    renderInApp(<Frame run={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Hint 1/2' }))
    expect(screen.getByText('First hint')).toBeInTheDocument()
    expect(screen.queryByText('Second hint')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Hint 2/2' }))
    expect(screen.getByText('Second hint')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hint 2/2' })).toBeDisabled()
  })

  it('copies the solution into the editor and runs it', async () => {
    const user = userEvent.setup()
    const run = vi.fn()
    renderInApp(<Frame run={run} />)
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Show solution' }))
    await user.click(screen.getByRole('button', { name: 'Copy solution into the editor' }))
    expect(run).toHaveBeenLastCalledWith(SOLUTION)
    expect(screen.getByRole('status')).toHaveTextContent(SOLUTION)

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(run).toHaveBeenLastCalledWith(START)
    expect(screen.getByRole('status')).toHaveTextContent(START)
  })

  it('runs the current code with the run button', async () => {
    const user = userEvent.setup()
    const run = vi.fn()
    renderInApp(<Frame run={run} />)
    await user.click(screen.getByRole('button', { name: 'Run' }))
    expect(run).toHaveBeenCalledWith()
  })
})
