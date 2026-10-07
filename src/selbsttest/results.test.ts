import { describe, expect, it } from 'vitest'

import { contentResult, runCases } from './results'

describe('contentResult', () => {
  it('is ok without a message and failed with one', () => {
    const result = contentResult('js-example')
    expect(result()).toEqual({ id: 'js-example', ok: true, message: '' })
    expect(result('the solution fails')).toEqual({ id: 'js-example', ok: false, message: 'the solution fails' })
  })
})

describe('runCases', () => {
  const cases = [{ name: 'passes' }, { name: 'fails' }, { name: 'crashes' }]

  it('turns the returned problem into a result per case', () => {
    const results = runCases(cases, (c) => {
      if (c.name === 'fails') return 'expected 2, got 3'
      if (c.name === 'crashes') throw new Error('boom')
      return null
    })
    expect(results.map((r) => [r.name, r.ok])).toEqual([
      ['passes', true],
      ['fails', false],
      ['crashes', false],
    ])
    expect(results[1].message).toBe('expected 2, got 3')
  })

  it('reports a crash as a failed case instead of ending the run', () => {
    const [result] = runCases([{ name: 'x' }], () => {
      throw new Error('boom')
    })
    expect(result.message).toMatch(/^crashed: Error: boom/)
  })
})
