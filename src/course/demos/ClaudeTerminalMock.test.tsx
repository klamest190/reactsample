import { createRef } from 'react'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { renderInApp } from '../../test/render'
import { agentLoopLesson } from '../claude/agentLoop'
import { commandsLesson } from '../claude/commands'
import { setupLesson } from '../claude/setup'
import { ClaudeTaskList, ClaudeTerminalMock, type ClaudeTerminalHandle } from './ClaudeTerminalMock'

beforeEach(() => localStorage.clear())

const solved = () => JSON.parse(localStorage.getItem('lernpfad-uebungen') ?? '[]') as string[]
const input = () => screen.getByRole('textbox', { name: 'Input to Claude Code' })

describe('ClaudeTerminalMock', () => {
  it('marks a task as completed and saves it when the command runs', async () => {
    const user = userEvent.setup()
    renderInApp(<ClaudeTerminalMock setup={commandsLesson.setup} tasks={commandsLesson.tasks} thinkingMs={0} />)
    expect(screen.getByText('✻ Welcome to Claude Code!')).toBeInTheDocument()

    await user.type(input(), '/compact{Enter}')
    expect(screen.getByRole('log')).toHaveTextContent('Compacted.')
    expect(solved()).toEqual(['claude-commands-compact'])
    expect(screen.getAllByRole('img', { name: 'done' })).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent('Task solved: Run the compact command.')
  })

  it('keeps solved tasks after a remount - the progress is stored, not the session', async () => {
    const user = userEvent.setup()
    const first = renderInApp(<ClaudeTerminalMock setup={commandsLesson.setup} tasks={commandsLesson.tasks} thinkingMs={0} />)
    await user.type(input(), '/help{Enter}')
    first.unmount()
    renderInApp(<ClaudeTerminalMock setup={commandsLesson.setup} tasks={commandsLesson.tasks} thinkingMs={0} />)
    expect(screen.getByText('1 of 6')).toBeInTheDocument()
    expect(screen.getByRole('log')).not.toHaveTextContent('Show help')
  })

  it('walks through install and login from the shell', async () => {
    const user = userEvent.setup()
    renderInApp(<ClaudeTerminalMock setup={setupLesson.setup} tasks={setupLesson.tasks} thinkingMs={0} />)
    await user.type(input(), 'npm i -g @anthropic-ai/claude-code{Enter}claude{Enter}1{Enter}')
    expect(screen.getByRole('log')).toHaveTextContent('Login successful')
    expect(solved()).toEqual(['claude-setup-install', 'claude-setup-login'])
  })

  it('offers the permission dialog as buttons and stops the loop on "No"', async () => {
    const user = userEvent.setup()
    renderInApp(<ClaudeTerminalMock setup={agentLoopLesson.setup} tasks={agentLoopLesson.tasks} thinkingMs={0} />)
    await user.type(input(), 'Run the tests and fix the bug{Enter}')
    const dialog = screen.getByRole('group', { name: 'Enter your choice (1, 2 or 3)' })
    await user.click(within(dialog).getByRole('button', { name: '3. No' }))
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(screen.getByRole('log')).toHaveTextContent('User rejected Bash(npm test)')
    expect(solved()).toEqual(['claude-agent-reject'])
  })

  it('cycles the permission mode with Shift+Tab', async () => {
    const user = userEvent.setup()
    renderInApp(<ClaudeTerminalMock setup={agentLoopLesson.setup} tasks={agentLoopLesson.tasks} thinkingMs={0} />)
    await user.click(input())
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(screen.getByText('⏵⏵ accept edits on')).toBeInTheDocument()
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(screen.getByText('⏸ plan mode on')).toBeInTheDocument()
    expect(solved()).toContain('claude-agent-plan')
  })

  it('shows matching slash commands while typing', async () => {
    const user = userEvent.setup()
    renderInApp(<ClaudeTerminalMock setup={commandsLesson.setup} thinkingMs={0} />)
    await user.type(input(), '/co')
    const menu = screen.getByRole('list', { name: 'Matching commands' })
    await user.click(within(menu).getByRole('button', { name: /\/compact/ }))
    expect(input()).toHaveValue('/compact ')
  })

  it('thinks before it answers a prompt and can be interrupted with Esc', async () => {
    const user = userEvent.setup()
    renderInApp(<ClaudeTerminalMock setup={agentLoopLesson.setup} thinkingMs={10_000} />)
    await user.type(input(), 'Explain this project{Enter}')
    expect(screen.getByText(/Thinking…/)).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByText(/Thinking…/)).not.toBeInTheDocument()
    expect(screen.getByRole('log')).toHaveTextContent('Interrupted')
    expect(screen.getByRole('log')).not.toHaveTextContent('Read(package.json)')
  })

  it('takes commands from a task list outside the terminal', async () => {
    const user = userEvent.setup()
    const terminal = createRef<ClaudeTerminalHandle>()
    renderInApp(
      <>
        <ClaudeTaskList tasks={commandsLesson.tasks} onInsert={(command) => terminal.current?.insert(command)} />
        <ClaudeTerminalMock ref={terminal} setup={commandsLesson.setup} tasks={commandsLesson.tasks} showTasks={false} thinkingMs={0} />
      </>,
    )
    await user.click(screen.getAllByRole('button', { name: 'insert' })[2])
    expect(input()).toHaveValue('/compact')
    expect(input()).toHaveFocus()
    await act(async () => {
      await user.keyboard('{Enter}')
    })
    expect(screen.getByText('1 of 6')).toBeInTheDocument()
  })
})
