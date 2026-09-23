import type { RunOptions, SqlRun } from './engine'
import type { Request, Response } from './worker'

/**
 * The browser side of the SQL runtime: one worker for the whole page, one script at a time.
 *
 * The timeout starts when the worker actually begins a script - the first start
 * (downloading and booting PostgreSQL) does not count. A script that runs longer is
 * stopped the hard way: the worker is terminated, the next run starts a new one.
 */

const TIMEOUT_MS = 10_000

export class SqlTimeout extends Error {
  constructor() {
    super(`timeout after ${TIMEOUT_MS / 1000} s`)
  }
}

let worker: Worker | null = null
let ready = false
let nextId = 1
type Job = { request: Request; resolve: (run: SqlRun) => void; reject: (e: Error) => void; started?: boolean; timer?: number }
const waiting = new Map<number, Job>()
const readyListeners = new Set<() => void>()

/** Is PostgreSQL already running? (Before the first start the editors show "starting …".) */
export function sqlReady() {
  return ready
}

/** Called when PostgreSQL has started - for the loading state of the editors. */
export function onSqlReady(listener: () => void) {
  readyListeners.add(listener)
  return () => {
    readyListeners.delete(listener)
  }
}

/** Starts PostgreSQL in the background, so the first ▶ does not have to wait for it. */
export function startSql() {
  getWorker()
}

function getWorker() {
  if (worker) return worker
  const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  w.onmessage = (e: MessageEvent<Response>) => {
    const message = e.data
    if (message.type === 'ready') {
      ready = true
      readyListeners.forEach((l) => l())
      return
    }
    const job = waiting.get(message.id)
    if (message.id === 0 && message.type === 'failed') {
      stop(new Error('PostgreSQL could not start: ' + message.message))
      return
    }
    if (!job) return
    if (message.type === 'started') {
      job.started = true
      job.timer = window.setTimeout(() => stop(new SqlTimeout()), TIMEOUT_MS)
    } else {
      clearTimeout(job.timer)
      waiting.delete(message.id)
      if (message.type === 'done') job.resolve(message.run)
      else job.reject(new Error(message.message))
    }
  }
  w.onerror = (e) => stop(new Error(e.message || 'PostgreSQL worker crashed'))
  worker = w
  return w
}

/**
 * Ends the worker. The script that was running fails; scripts that were only queued
 * (other editors) are sent to a new worker. Without a running script (the start
 * failed) every job fails.
 */
function stop(error: Error) {
  worker?.terminate()
  worker = null
  ready = false
  const jobs = [...waiting.values()]
  const retry = jobs.some((job) => job.started) ? jobs.filter((job) => !job.started) : []
  for (const job of jobs) {
    clearTimeout(job.timer)
    if (!retry.includes(job)) {
      waiting.delete(job.request.id)
      job.reject(error)
    }
  }
  for (const job of retry) getWorker().postMessage(job.request)
}

/** Runs a script on a fresh copy of the example database. */
export function runSql(script: string, options: RunOptions = {}): Promise<SqlRun> {
  const id = nextId++
  const request: Request = { id, script, options }
  return new Promise((resolve, reject) => {
    waiting.set(id, { request, resolve, reject })
    getWorker().postMessage(request)
  })
}
