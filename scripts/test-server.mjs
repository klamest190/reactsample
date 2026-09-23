/**
 * Shared by the browser tests (inhalte-testen.mjs, seiten-testen.mjs): a server for the app and
 * the installed Chrome (or Edge) via playwright-core - no browser download needed.
 *
 * `production: true` builds the app like `npm run build` and serves it like `npm run preview`.
 * Some bugs only exist there (React has `act` only in its development build, for example).
 */
import path from 'node:path'
import { chromium } from 'playwright-core'
import { build, createServer, preview } from 'vite'

const root = path.resolve(import.meta.dirname, '..')

/** Installed Chrome, else Edge (always present on Windows). Exits with code 2 if neither is found. */
export async function launchBrowser() {
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await chromium.launch({ channel })
    } catch {
      // try the next browser
    }
  }
  console.error('Kein Chrome oder Edge gefunden.')
  process.exit(2)
}

/**
 * Starts the app and returns its address.
 *   pages: the HTML entry points a production build needs (the dev server serves every file).
 */
export async function startServer({ production = false, pages = ['index.html'], logger } = {}) {
  if (!production) {
    const server = await createServer({ root, server: { port: 5197, strictPort: false }, customLogger: logger })
    await server.listen()
    return { url: server.resolvedUrls.local[0], close: () => server.close() }
  }
  const outDir = path.join(root, 'node_modules', '.test-build')
  const input = Object.fromEntries(pages.map((page) => [page.replace(/\.html$/, ''), path.join(root, page)]))
  await build({ root, logLevel: 'error', build: { outDir, emptyOutDir: true, rolldownOptions: { input }, chunkSizeWarningLimit: 50_000 } })
  const server = await preview({ root, logLevel: 'warn', build: { outDir }, preview: { port: 5198, strictPort: false } })
  return { url: server.resolvedUrls.local[0], close: () => new Promise((resolve) => server.httpServer.close(resolve)) }
}
