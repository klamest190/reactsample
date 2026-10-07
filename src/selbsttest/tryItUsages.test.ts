import { describe, expect, it } from 'vitest'

import { tryItUsages } from './tryItUsages'

describe('tryItUsages', () => {
  it('reads id, mode and flags of every <TryIt>', () => {
    const chapter = `
      <P>Text</P>
      <TryIt id="a" beispiel={beispiele.a} />
      <TryIt id="b" modus="react" vorschau beispiel={beispiele.b} />
      <TryIt
        id="c"
        modus="ts"
        typen
        beispiel={beispiele.c}
      />`
    expect(Object.fromEntries(tryItUsages([chapter]))).toEqual({
      a: { modus: 'js', typen: false, vorschau: false },
      b: { modus: 'react', typen: false, vorschau: true },
      c: { modus: 'ts', typen: true, vorschau: false },
    })
  })

  it('ignores words in the task text after aufgabe=', () => {
    const chapter = `<TryIt id="x" modus="java" aufgabe={<P>Use typen and vorschau here</P>} />`
    expect(tryItUsages([chapter]).get('x')).toEqual({ modus: 'java', typen: false, vorschau: false })
  })

  it('collects across several sources and skips a <TryIt> without id', () => {
    const usages = tryItUsages(['<TryIt id="one" />', '<TryIt modus="sql" />', '<TryIt id="two" modus="sql" />'])
    expect([...usages.keys()]).toEqual(['one', 'two'])
  })
})
