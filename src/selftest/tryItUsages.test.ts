import { describe, expect, it } from 'vitest'

import { tryItUsages } from './tryItUsages'

describe('tryItUsages', () => {
  it('reads id, mode and flags of every <TryIt>', () => {
    const chapter = `
      <P>Text</P>
      <TryIt id="a" beispiel={beispiele.a} />
      <TryIt id="b" mode="react" preview beispiel={beispiele.b} />
      <TryIt
        id="c"
        mode="ts"
        typed
        beispiel={beispiele.c}
      />`
    expect(Object.fromEntries(tryItUsages([chapter]))).toEqual({
      a: { mode: 'js', typed: false, preview: false },
      b: { mode: 'react', typed: false, preview: true },
      c: { mode: 'ts', typed: true, preview: false },
    })
  })

  it('ignores words in the task text after task=', () => {
    const chapter = `<TryIt id="x" mode="java" task={<P>Use typed and preview here</P>} />`
    expect(tryItUsages([chapter]).get('x')).toEqual({ mode: 'java', typed: false, preview: false })
  })

  it('collects across several sources and skips a <TryIt> without id', () => {
    const usages = tryItUsages(['<TryIt id="one" />', '<TryIt mode="sql" />', '<TryIt id="two" mode="sql" />'])
    expect([...usages.keys()]).toEqual(['one', 'two'])
  })
})
