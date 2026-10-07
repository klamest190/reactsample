import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebounce } from './useDebounce'
import { useHashRoute } from './useHashRoute'
import { useLocalStorage } from './useLocalStorage'
import { usePrevious } from './usePrevious'
import { useToggle } from './useToggle'

beforeEach(() => localStorage.clear())

describe('useLocalStorage', () => {
  it('starts with the initial value and stores every change as JSON', () => {
    const { result } = renderHook(() => useLocalStorage('count', 1))
    expect(result.current[0]).toBe(1)
    act(() => result.current[1](2))
    expect(result.current[0]).toBe(2)
    expect(localStorage.getItem('count')).toBe('2')
  })

  it('reads a stored value back', () => {
    localStorage.setItem('list', JSON.stringify(['a', 'b']))
    const { result } = renderHook(() => useLocalStorage<string[]>('list', []))
    expect(result.current[0]).toEqual(['a', 'b'])
  })

  it('falls back to the initial value on broken JSON', () => {
    localStorage.setItem('broken', '{not json')
    const { result } = renderHook(() => useLocalStorage('broken', 'start'))
    expect(result.current[0]).toBe('start')
  })
})

describe('useHashRoute', () => {
  afterEach(() => {
    window.location.hash = ''
  })

  it('reads the route without "#/"', () => {
    window.location.hash = '/hooks-usestate/abschnitt-2'
    const { result } = renderHook(() => useHashRoute())
    expect(result.current[0]).toBe('hooks-usestate/abschnitt-2')
  })

  it('navigates and follows hashchange events', async () => {
    const { result } = renderHook(() => useHashRoute())
    await act(async () => {
      result.current[1]('glossar')
      await new Promise((resolve) => window.addEventListener('hashchange', resolve, { once: true }))
    })
    expect(window.location.hash).toBe('#/glossar')
    expect(result.current[0]).toBe('glossar')
  })

  it('navigates to the start page with an empty target', () => {
    window.location.hash = '/glossar'
    const { result } = renderHook(() => useHashRoute())
    act(() => result.current[1](''))
    expect(window.location.hash).toBe('')
  })
})

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('passes a value on only after it stayed stable for the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'a' } })
    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'abc' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('abc')
  })
})

describe('useToggle', () => {
  it('toggles and keeps the toggle function stable', () => {
    const { result } = renderHook(() => useToggle())
    const toggle = result.current.umschalten
    act(() => toggle())
    expect(result.current.an).toBe(true)
    act(() => result.current.umschalten())
    expect(result.current.an).toBe(false)
    expect(result.current.umschalten).toBe(toggle)
  })
})

describe('usePrevious', () => {
  it('returns the value of the previous render', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), { initialProps: { value: 1 } })
    expect(result.current).toBeUndefined()
    rerender({ value: 2 })
    expect(result.current).toBe(1)
    rerender({ value: 3 })
    expect(result.current).toBe(2)
  })
})
