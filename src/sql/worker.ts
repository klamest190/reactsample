import { PGlite } from '@electric-sql/pglite'
import { runScript, type RunOptions } from './engine'

/**
 * PostgreSQL in a web worker. PGlite is a whole database server (several MB of
 * WebAssembly) - it starts once, on the first SQL editor, and then serves every
 * editor of the page. In the worker a runaway query cannot freeze the page:
 * client.ts terminates the worker after a timeout.
 */

export type Request = { id: number; script?: string; options?: RunOptions }
export type Response =
  | { id: number; type: 'ready' }
  | { id: number; type: 'started' }
  | { id: number; type: 'done'; run: Awaited<ReturnType<typeof runScript>> }
  | { id: number; type: 'failed'; message: string }

const database = PGlite.create()
database.then(
  () => post({ id: 0, type: 'ready' }),
  (e) => post({ id: 0, type: 'failed', message: String(e) }),
)

// One script after the other - two runs must never mix their statements.
let queue: Promise<void> = Promise.resolve()

self.onmessage = (e: MessageEvent<Request>) => {
  const { id, script, options } = e.data
  if (script === undefined) return
  queue = queue.then(async () => {
    try {
      const db = await database
      post({ id, type: 'started' })
      post({ id, type: 'done', run: await runScript(db, script, options) })
    } catch (error) {
      post({ id, type: 'failed', message: error instanceof Error ? error.message : String(error) })
    }
  })
}

function post(message: Response) {
  self.postMessage(message)
}
