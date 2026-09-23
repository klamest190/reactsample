/**
 * Result types shared by the self-tests of the runtimes (src/java, src/spring, src/docker, src/sql).
 * No React and no DOM - the runtimes' tests also run on the command line (scripts/*-test*.ts).
 */

/** One case of a runtime's own self-test: a program and what the real thing would do. */
export type RuntimeResult = { name: string; ok: boolean; message: string }

/** One example or exercise of the course, checked against its runtime. */
export type ContentResult = { id: string; ok: boolean; message: string }

/**
 * The result of one example: `result()` is ok, `result('what is wrong')` failed.
 *   const result = contentResult(id)
 *   if (broken) return result('the solution fails')
 *   return result()
 */
export const contentResult =
  (id: string) =>
  (message = ''): ContentResult => ({ id, ok: !message, message })

/**
 * Runs every case. `check` returns what is wrong, or null. A crash in the runtime counts as a
 * failed case instead of ending the whole run.
 */
export function runCases<C extends { name: string }>(cases: C[], check: (c: C) => string | null): RuntimeResult[] {
  return cases.map((c) => {
    let problem: string | null
    try {
      problem = check(c)
    } catch (error) {
      problem = 'crashed: ' + String(error instanceof Error ? error.stack : error)
    }
    return { name: c.name, ok: !problem, message: problem ?? '' }
  })
}
