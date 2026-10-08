import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { FortschrittProvider, gueltigerQuizStand, useFortschritt, type QuizStand } from './ProgressContext'

const renderProgress = () => renderHook(() => useFortschritt(), { wrapper: FortschrittProvider })

beforeEach(() => localStorage.clear())

describe('FortschrittContext', () => {
  it('marks a chapter as done only once and can undo it', () => {
    const { result } = renderProgress()
    act(() => result.current.kapitelSetzen('js-variablen', true))
    act(() => result.current.kapitelSetzen('js-variablen', true))
    expect(result.current.erledigt).toEqual(['js-variablen'])
    act(() => result.current.kapitelSetzen('js-variablen', false))
    expect(result.current.erledigt).toEqual([])
  })

  it('remembers solved exercises without duplicates', () => {
    const { result } = renderProgress()
    act(() => result.current.uebungGeloest('a'))
    act(() => result.current.uebungGeloest('a'))
    act(() => result.current.uebungGeloest('b'))
    expect(result.current.uebungen).toEqual(['a', 'b'])
  })

  it('stores progress under the keys existing users already have', () => {
    const { result } = renderProgress()
    const quiz: QuizStand = { total: 3, correct: 2, answers: [0, 1, null] }
    act(() => {
      result.current.kapitelSetzen('react-props', true)
      result.current.quizSetzen('react-props', quiz)
      result.current.uebungGeloest('react-props-uebung')
    })
    expect(JSON.parse(localStorage.getItem('lernpfad-erledigt')!)).toEqual(['react-props'])
    expect(JSON.parse(localStorage.getItem('lernpfad-quiz')!)).toEqual({ 'react-props': quiz })
    expect(JSON.parse(localStorage.getItem('lernpfad-uebungen')!)).toEqual(['react-props-uebung'])
  })

  it('resets the progress but keeps the code learners wrote', () => {
    localStorage.setItem('tryit:js-variablen:abc', '"let x = 1"')
    const { result } = renderProgress()
    act(() => {
      result.current.kapitelSetzen('js-variablen', true)
      result.current.uebungGeloest('x')
    })
    act(() => result.current.allesZuruecksetzen())
    expect(result.current.erledigt).toEqual([])
    expect(result.current.uebungen).toEqual([])
    expect(result.current.quiz).toEqual({})
    expect(localStorage.getItem('tryit:js-variablen:abc')).toBe('"let x = 1"')
  })

  it('needs a provider', () => {
    expect(() => renderHook(() => useFortschritt())).toThrow(/FortschrittProvider/)
  })
})

describe('gueltigerQuizStand', () => {
  const stand: QuizStand = { total: 2, correct: 1, answers: [0, null] }

  it('returns the stored state while the number of questions matches', () => {
    expect(gueltigerQuizStand(stand, 2)).toBe(stand)
  })

  it('drops a state saved for a different number of questions', () => {
    expect(gueltigerQuizStand(stand, 3)).toBeUndefined()
    expect(gueltigerQuizStand(undefined, 2)).toBeUndefined()
  })
})
