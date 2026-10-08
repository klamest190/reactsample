import { describe, expect, it } from 'vitest'

import { runJava, checkJava } from './index'

/** Runs `body` inside `main` and returns the printed lines. */
function run(body: string, extra = '') {
  const result = runJava(`public class Main {\n${extra}\npublic static void main(String[] args) {\n${body}\n}\n}`, { language: 'en' })
  return { output: result.lines.filter((z) => z.type === 'log').map((z) => z.text), errors: result.lines.filter((z) => z.type === 'exception').map((z) => z.text), failed: result.failed }
}

describe('javaAusfuehren', () => {
  it('prints with System.out.println', () => {
    expect(run('System.out.println("Hello " + 42);').output).toEqual(['Hello 42'])
  })

  it('uses Java integer semantics: truncating division and 32-bit overflow', () => {
    expect(run('System.out.println(7 / 2); System.out.println(Integer.MAX_VALUE + 1);').output).toEqual(['3', '-2147483648'])
  })

  it('compares strings by reference with == and by value with equals', () => {
    const { output } = run('String a = new String("x"); String b = new String("x"); System.out.println(a == b); System.out.println(a.equals(b));')
    expect(output).toEqual(['false', 'true'])
  })

  it('supports switch expressions and records', () => {
    const { output } = run(
      'Point p = new Point(1, 2); String s = switch (p.x()) { case 1 -> "one"; default -> "other"; }; System.out.println(s + " " + p);',
      'record Point(int x, int y) {}',
    )
    expect(output).toEqual(['one Point[x=1, y=2]'])
  })

  it('ends with a stack trace on an uncaught exception', () => {
    const { failed, errors } = run('int[] a = new int[2]; a[5] = 1;')
    expect(failed).toBe(true)
    expect(errors.join('\n')).toMatch(/ArrayIndexOutOfBoundsException/)
  })

  it('refuses to start a program with a compile error, like javac', () => {
    const { failed, errors, output } = run('int x = "text"; System.out.println("never");')
    expect(failed).toBe(true)
    expect(output).toEqual([])
    expect(errors[0]).toMatch(/^Main\.java:\d+: error: incompatible types/)
  })

  it('reports a syntax error with its line', () => {
    const result = runJava('public class Main {\n  public static void main(String[] args) {\n    int x = 1\n  }\n}')
    expect(result.failed).toBe(true)
    expect(result.lines[0].text).toMatch(/^Main\.java:[34]: error: /)
  })

  it('runs exercise tests against the program', () => {
    const source = 'public class Main {\n  static int add(int a, int b) { return a + b; }\n  public static void main(String[] args) {}\n}'
    const result = runJava(source, {
      language: 'en',
      tests: [
        { name: 'adds', expression: 'add(2, 3)', expected: 5 },
        { name: 'wrong on purpose', expression: 'add(1, 1)', expected: 3 },
      ],
    })
    expect(result.results?.map((e) => e.ok)).toEqual([true, false])
    expect(result.results?.[1].message).toBe('expected: 3, got: 2')
  })
})

describe('javaPruefen', () => {
  it('returns no findings for a valid program', () => {
    expect(checkJava('public class Main { public static void main(String[] args) { int x = 1; } }')).toEqual([])
  })

  it('returns type errors with their line, in the chosen language', () => {
    const findings = checkJava('public class Main {\n  public static void main(String[] args) {\n    boolean b = 1;\n  }\n}', 'en')
    expect(findings).toHaveLength(1)
    expect(findings[0].line).toBe(3)
    expect(findings[0].text).toMatch(/incompatible types/)
  })
})
