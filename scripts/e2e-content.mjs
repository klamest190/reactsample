/**
 * Self-test of the course contents - `npm run e2e:content` (optional: `-- praxis-` for one part).
 *
 * Starts the Vite dev server, opens selftest.html in the installed Chrome (playwright-core, no
 * browser download) and waits until every example, exercise and project step is checked.
 * Exits with code 1 when something fails.
 *
 * `-- --build`: against a production build instead of the dev server (as in CI) - some bugs
 * exist only there. Both can be combined: `npm run e2e:content -- --build praxis-`.
 */
import { createLogger } from 'vite'
import { launchBrowser, startServer } from './test-server.mjs'

const args = process.argv.slice(2)
const production = args.includes('--build')
const only = args.find((a) => !a.startsWith('--')) ?? ''

// Many examples show errors on purpose. Vite passes them on from the browser - these lines are
// hidden here so that only the test report remains.
const logger = createLogger('warn')
let inBrowserMessage = false
const filter = (write) => (text, ...rest) => {
  const line = String(text)
  if (line.includes('[vite]') && line.includes('(client)')) {
    inBrowserMessage = true
    return true
  }
  if (inBrowserMessage) {
    // Lines following a browser message: stack trace, empty lines, notes from React.
    if (/^\s*(at |$)/.test(line) || /^(The above error|React will try)/.test(line)) return true
    inBrowserMessage = false
  }
  return write(line, ...rest)
}
process.stdout.write = filter(process.stdout.write.bind(process.stdout))
process.stderr.write = filter(process.stderr.write.bind(process.stderr))
if (production) console.log('Production build …')
const server = await startServer({ production, pages: ['index.html', 'selftest.html'], logger })
const browser = await launchBrowser()

const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

const start = Date.now()
await page.goto(`${server.url}selftest.html?only=${encodeURIComponent(only)}`)

// Report progress until the page says it is done. A page that never starts (an error while
// loading the modules) would otherwise keep this loop waiting forever.
let reported = 0
for (;;) {
  const status = await page.evaluate(() => window.__selftest ?? null)
  if (!status && Date.now() - start > 60_000) {
    console.log(`✗ selftest.html did not start within 60 s${pageErrors.length ? ': ' + pageErrors.join(' · ') : ''}`)
    if (process.env.GITHUB_ACTIONS) console.log(`::error title=Content test::selftest.html did not start: ${pageErrors.join(' · ')}`)
    await browser.close()
    await server.close()
    process.exit(1)
  }
  if (status) {
    for (const r of status.results.slice(reported)) {
      if (!r.ok) console.log(`✗ ${r.id}  (${r.location})\n    → ${r.message}`)
    }
    if (status.results.length - reported > 0) {
      process.stdout.write(`  ${status.results.length}/${status.total} checked\r`)
    }
    reported = status.results.length
    if (status.done) break
  }
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const results = await page.evaluate(() => window.__selftest.results)
const failed = results.filter((r) => !r.ok)
const slowest = [...results].sort((a, b) => b.duration - a.duration).slice(0, 3)

console.log(`\n${results.length - failed.length} ok, ${failed.length} failed - ${Math.round((Date.now() - start) / 1000)} s`)
console.log('Slowest: ' + slowest.map((r) => `${r.id} ${r.duration} ms`).join(', '))
// Uncaught errors from example code (e.g. starter code without a matching case) are expected - info only.
if (pageErrors.length) {
  console.log(`Note: ${pageErrors.length} uncaught errors from example code: ${[...new Set(pageErrors)].join(' · ')}`)
}

// In GitHub Actions: failures as annotations - visible on the commit without access to the logs.
if (process.env.GITHUB_ACTIONS) {
  for (const r of failed) console.log(`::error title=Content test ${r.id}::${r.location}: ${r.message.replace(/\n/g, ' ')}`)
}

await browser.close()
await server.close()
process.exit(failed.length ? 1 : 0)
