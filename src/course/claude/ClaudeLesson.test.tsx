import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { renderInApp } from '../../test/render'
import { ClaudeCommands } from './ClaudeLesson'

beforeEach(() => localStorage.clear())

describe('ClaudeLesson', () => {
  it('shows theory, tasks, terminal, quiz and key points of a lesson', () => {
    renderInApp(<ClaudeCommands />, { chapterId: 'claude-commands' })
    expect(screen.getByRole('heading', { level: 2, name: 'Prompt or command?' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Try it yourself' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Tasks/ })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Claude Code (simulated)' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /What happens to input that starts with/ })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').some((li) => li.textContent?.includes('Same task, carrying on'))).toBe(true)
  })

  it('stores quiz answers for the chapter', async () => {
    const user = userEvent.setup()
    renderInApp(<ClaudeCommands />, { chapterId: 'claude-commands' })
    await user.click(screen.getByRole('button', { name: 'Claude Code runs it itself as a command' }))
    expect(JSON.parse(localStorage.getItem('lernpfad-quiz')!)['claude-commands']).toMatchObject({ correct: 1, total: 4 })
  })

  it('marks the chapter as done once every task is solved', async () => {
    const user = userEvent.setup({ delay: null })
    renderInApp(<ClaudeCommands />, { chapterId: 'claude-commands' })
    const input = screen.getByRole('textbox', { name: 'Input to Claude Code' })
    // Commands answer at once - no thinking pause, so no timers to wait for.
    for (const command of ['/help', '/cost', '/compact', '/compact focus on the bug', '/clear', '/bug'])
      await user.type(input, `${command}{Enter}`)
    expect(JSON.parse(localStorage.getItem('lernpfad-erledigt')!)).toEqual(['claude-commands'])
  })
})
