import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { renderInApp } from '../test/render'
import { Quiz, type Question } from './Quiz'

const questions: Question[] = [
  { question: 'What does typeof null return?', answers: ['"null"', '"object"'], correct: 1, explanation: 'A historic bug.' },
  { question: 'Is [] truthy?', answers: ['yes', 'no'], correct: 0, explanation: 'Every object is truthy.' },
]

beforeEach(() => localStorage.clear())

describe('Quiz', () => {
  it('reveals right and wrong answers with the explanation and counts the score', async () => {
    const user = userEvent.setup()
    renderInApp(<Quiz questions={questions} />, { chapterId: 'js-variablen' })

    await user.click(screen.getByRole('button', { name: '"null"' }))
    expect(screen.getByText(/Not quite\./)).toHaveTextContent('A historic bug.')
    // Answered questions are locked.
    expect(screen.getByRole('button', { name: /"object"/ })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'yes' }))
    expect(screen.getByText(/Correct!/)).toHaveTextContent('Every object is truthy.')
    expect(screen.getByText('1 / 2 correct')).toBeInTheDocument()
  })

  it('saves the answers per chapter, so they survive a remount', async () => {
    const user = userEvent.setup()
    const first = renderInApp(<Quiz questions={questions} />, { chapterId: 'js-variablen' })
    await user.click(screen.getByRole('button', { name: '"object"' }))
    expect(JSON.parse(localStorage.getItem('lernpfad-quiz')!)).toEqual({
      'js-variablen': { total: 2, correct: 1, answers: [1, null] },
    })
    first.unmount()

    renderInApp(<Quiz questions={questions} />, { chapterId: 'js-variablen' })
    expect(screen.getByText('1 / 2 correct')).toBeInTheDocument()
  })

  it('can be restarted once every question is answered', async () => {
    const user = userEvent.setup()
    renderInApp(<Quiz questions={questions} />, { chapterId: 'js-variablen' })
    await user.click(screen.getByRole('button', { name: '"object"' }))
    await user.click(screen.getByRole('button', { name: 'no' }))
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.queryByText(/correct$/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'yes' })).toBeEnabled()
  })
})
