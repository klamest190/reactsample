/**
 * Seitentest - `npm run test:seiten` (optional: `-- js-` nur für Seiten, deren Route so beginnt).
 *
 * Builds the app like `npm run build`, serves it like `npm run preview` and checks it in the
 * installed Chrome. test:inhalte checks the course contents; this checks the pages people see:
 *
 *  1. Every page (start, glossary, project, chapters, playgrounds) - German, light, desktop:
 *     - no JavaScript error on the page
 *     - every extra exercise opened and every sample solution applied: each must turn green,
 *       no editor may hang ("Tests laufen …")
 *     - axe-core finds no accessibility violation. Previews ([data-vorschau]) are left out, they
 *       show learners' code. Checked by hand instead, without previews: one <main>, no skipped
 *       heading level (axe can only check those for the whole document).
 *  2. Every page again as a phone (390 px), English, dark: no horizontal scrolling, enough contrast.
 *  3. The app itself: language, color scheme, search, saved code, chapter progress, playground.
 *
 * Exits with code 1 if anything fails.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { launchBrowser, startServer } from './test-server.mjs'

const root = path.resolve(import.meta.dirname, '..')
const filter = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? ''
// Pages checked at the same time: `-- --parallel=1` for a slow machine.
const PARALLEL = Number(process.argv.find((a) => a.startsWith('--parallel='))?.split('=')[1] ?? Math.min(4, os.availableParallelism()))
const axeSource = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

const kurs = fs.readFileSync(path.join(root, 'src/kurs/kurs.ts'), 'utf8')
// One playground per part - each file names its part (teil: 'javascript').
const playgroundDir = path.join(root, 'src/kurs/playground')
const playgrounds = fs.readdirSync(playgroundDir).map((f) => fs.readFileSync(path.join(playgroundDir, f), 'utf8')).join('\n')
const routes = [
  '',
  'glossar',
  'projekt',
  ...[...kurs.matchAll(/^ {8}id: '([a-z0-9-]+)'/gm)].map((m) => m[1]),
  ...[...new Set([...playgrounds.matchAll(/^ {2}teil: '([a-z0-9-]+)'/gm)].map((m) => m[1]))].map((teil) => 'playground/' + teil),
].filter((route) => route.startsWith(filter))

// Page-level rules axe cannot limit to a part of the page - checked by hand without previews.
const PAGE_RULES = ['landmark-no-duplicate-main', 'landmark-main-is-top-level', 'landmark-unique', 'heading-order']

/** Findings of the run ("route: what") - and pages that were only clean at the second attempt. */
const failures = []
const unstable = []
const record = (line) => {
  failures.push(line)
  console.log(`✗ ${line}`)
}

console.log('Produktions-Build …')
const server = await startServer({ production: true })
const browser = await launchBrowser()
const started = Date.now()

/** A fresh browser context per page: own storage, fixed language and color scheme. */
async function openPage(route, { language, theme, width }) {
  const context = await browser.newContext({ viewport: { width, height: 900 } })
  await context.addInitScript(
    ([language, theme]) => {
      // Also runs in the sandboxed iframes of the JS editors, where storage is off-limits.
      try {
        localStorage.setItem('sprache', JSON.stringify(language))
        localStorage.setItem('theme', theme)
      } catch {
        // sandboxed frame
      }
    },
    [language, theme],
  )
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message.split('\n')[0]))
  try {
    await page.goto(server.url + '#/' + route)
    await page.waitForSelector('main h1', { timeout: 30000 })
    await page.waitForTimeout(1000)
  } catch (error) {
    await context.close()
    throw error
  }
  return { page, errors, close: () => context.close() }
}

async function axe(page, options) {
  await page.addScriptTag({ content: axeSource })
  return page.evaluate(
    (options) => window.axe.run({ exclude: [['[data-vorschau]'], ['iframe']] }, options).then((r) => r.violations.map((v) => `${v.id} (${v.nodes.length}×) ${v.nodes[0].target.join(' ')}`)),
    options,
  )
}

/**
 * Runs `check(route, report)` for every route, `PARALLEL` pages at a time - each in its own
 * browser context. A page with findings is checked once more on its own at the end: on a slow
 * machine (CI) a long exercise can miss its time. Clean at the second attempt counts as
 * unstable (reported, not failed); a crash of one page never stops the run.
 */
async function forEveryPage(name, check) {
  const run = async (route) => {
    const found = []
    try {
      await check(route, (what) => found.push(what))
    } catch (error) {
      found.push(`Abbruch: ${error.message.split('\n')[0]}`)
    }
    return found
  }
  const suspicious = new Map()
  let next = 0
  let done = 0
  const worker = async () => {
    while (next < routes.length) {
      const route = routes[next++]
      const found = await run(route)
      if (found.length) suspicious.set(route, found)
      process.stdout.write(`  ${++done}/${routes.length}\r`)
    }
  }
  await Promise.all(Array.from({ length: Math.min(PARALLEL, routes.length) }, worker))

  for (const [route, first] of suspicious) {
    const where = route || 'start'
    const again = await run(route)
    if (again.length) {
      for (const what of again) record(`${where}: ${what}`)
    } else {
      unstable.push(`${where} (${name}): ${first[0]}`)
      console.log(`~ ${where}: erst beim zweiten Versuch in Ordnung - ${first[0]}`)
    }
  }
}

// --- 1. Every page: errors, exercises, accessibility ----------------------------------------
console.log(`\n1. ${routes.length} Seiten: Fehler, Musterlösungen, Barrierefreiheit (${PARALLEL} parallel)`)
await forEveryPage('Desktop', async (route, report) => {
  const { page, errors, close } = await openPage(route, { language: 'de', theme: 'light', width: 1300 })
  try {
    await checkDesktop(page, errors, report)
  } finally {
    await close()
  }
})

async function checkDesktop(page, errors, report) {
  for (const button of await page.$$('[data-uebung] > button[aria-expanded="false"]')) await button.click()
  await page.waitForTimeout(1000)
  for (const button of await page.$$('button:has-text("Lösung zeigen")')) await button.click()
  for (const button of await page.$$('button:has-text("Lösung in den Editor übernehmen")')) await button.click()
  // Wait until no editor runs any more (SQL starts PostgreSQL, one React exercise waits 10 s).
  for (let quiet = 0, waited = 0; quiet < 3 && waited < 120; waited++) {
    await page.waitForTimeout(500)
    quiet = (await page.$('[data-laeuft]')) ? 0 : quiet + 1
  }

  const state = await page.evaluate(() => {
    const title = (el) => el.closest('[data-laeuft], .rounded-xl')?.querySelector('h3')?.textContent?.trim() ?? '?'
    const outside = (el) => !el.closest('[data-vorschau]')
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter((h) => outside(h) && h.offsetParent !== null)
    const skipped = []
    headings.forEach((h, j) => {
      const level = Number(h.tagName[1])
      const previous = j ? Number(headings[j - 1].tagName[1]) : 0
      if (level > previous + 1) skipped.push(`h${previous || '-'} → ${h.tagName.toLowerCase()} "${h.textContent.trim().slice(0, 40)}"`)
    })
    return {
      red: [...document.querySelectorAll('[data-testergebnis="rot"]')].map(title),
      hanging: [...document.querySelectorAll('[data-laeuft]')].map(title),
      mains: [...document.querySelectorAll('main, [role="main"]')].filter(outside).length,
      skipped,
    }
  })
  for (const t of state.red) report(`Musterlösung nicht grün: ${t}`)
  for (const t of state.hanging) report(`Editor hängt: ${t}`)
  if (state.mains !== 1) report(`${state.mains} <main> statt 1`)
  for (const s of state.skipped) report(`Überschrift übersprungen: ${s}`)
  for (const v of await axe(page, { rules: Object.fromEntries(PAGE_RULES.map((r) => [r, { enabled: false }])) })) report(`axe: ${v}`)
  for (const e of [...new Set(errors)]) report(`Seitenfehler: ${e}`)
}

// --- 2. Phone, English, dark -----------------------------------------------------------------
console.log(`\n2. ${routes.length} Seiten als Handy, Englisch, dunkel`)
await forEveryPage('Handy', async (route, report) => {
  const { page, errors, close } = await openPage(route, { language: 'en', theme: 'dark', width: 390 })
  try {
    const width = await page.evaluate(() => document.documentElement.scrollWidth)
    if (width > 391) report(`Handy: Seite ist ${width} px breit (Bildschirm 390 px)`)
    for (const v of await axe(page, { runOnly: ['color-contrast'] })) report(`dunkel: ${v}`)
    for (const e of [...new Set(errors)]) report(`Seitenfehler (en): ${e}`)
  } finally {
    await close()
  }
})

// --- 3. The app itself -------------------------------------------------------------------------
if (!filter) {
  console.log('\n3. Die App selbst')
  const check = async (name, run) => {
    try {
      await run()
      console.log(`  ✓ ${name}`)
    } catch (error) {
      record(`app: ${name}: ${error.message.split('\n')[0]}`)
    }
  }
  const expect = (ok, message) => {
    if (!ok) throw new Error(message)
  }

  await check('Sprache umschalten und behalten', async () => {
    const { page, close } = await openPage('js-variablen', { language: 'de', theme: 'light', width: 1300 })
    const before = await page.textContent('main h1')
    await page.click('button[lang="en"]')
    await page.waitForTimeout(500)
    const after = await page.textContent('main h1')
    expect(before !== after, `Titel unverändert: ${after}`)
    // addInitScript would set German again on a reload - read what the app stored instead.
    expect((await page.evaluate(() => localStorage.getItem('sprache'))) === '"en"', 'Sprache nicht gespeichert')
    await close()
  })

  await check('Farbschema umschalten und behalten', async () => {
    const { page, close } = await openPage('', { language: 'de', theme: 'light', width: 1300 })
    await page.click('button[aria-label="Farbschema umschalten"]')
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark')), 'kein dunkles Design')
    expect((await page.evaluate(() => localStorage.getItem('theme'))) === 'dark', 'Farbschema nicht gespeichert')
    await close()
  })

  await check('Suche findet ein Kapitel', async () => {
    const { page, close } = await openPage('', { language: 'de', theme: 'light', width: 1300 })
    await page.keyboard.press('Control+k')
    await page.waitForSelector('[role="dialog"] input')
    await page.keyboard.type('useState')
    await page.waitForTimeout(300)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(800)
    const hash = await page.evaluate(() => location.hash)
    expect(hash.includes('hooks-usestate'), `landet auf ${hash}`)
    await close()
  })

  await check('Code im Editor bleibt nach dem Neuladen', async () => {
    const context = await browser.newContext({ viewport: { width: 1300, height: 900 } })
    const page = await context.newPage()
    await page.goto(server.url + '#/js-variablen')
    await page.waitForSelector('main textarea')
    const editor = page.locator('main textarea').first()
    await editor.click()
    await page.keyboard.press('Control+End')
    await page.keyboard.type('\n// seiten-test')
    await page.waitForTimeout(700)
    await page.reload()
    await page.waitForSelector('main textarea')
    const value = await page.locator('main textarea').first().inputValue()
    expect(value.includes('// seiten-test'), 'Code verloren')
    await context.close()
  })

  await check('Kapitel abschließen zählt im Fortschritt', async () => {
    const { page, close } = await openPage('js-variablen', { language: 'de', theme: 'light', width: 1300 })
    await page.click('button:has-text("Kapitel abschließen")')
    await page.waitForTimeout(500)
    const header = await page.textContent('header')
    // The counter follows other header text without a space - no \b before the number.
    expect(/(^|\D)1\/\d+/.test(header), `Fortschritt: ${header.match(/\d+\/\d+/)?.[0]}`)
    await close()
  })

  await check('Playground führt Code aus', async () => {
    const { page, errors, close } = await openPage('playground/javascript', { language: 'de', theme: 'light', width: 1300 })
    // A template with output, then run - by role and exact name: has-text would also match
    // building blocks whose description says "ausführen".
    await page.getByRole('button', { name: 'FizzBuzz', exact: true }).click()
    await page.getByRole('button', { name: 'Ausführen', exact: true }).first().click()
    await page.waitForTimeout(1500)
    // A console line starts with "›" - the word alone is also in the template's name and code.
    expect(/›\s*FizzBuzz/.test(await page.innerText('main')), 'keine FizzBuzz-Ausgabe in der Konsole')
    expect(!(await page.$('[data-laeuft]')), 'Editor hängt')
    expect(errors.length === 0, `Seitenfehler: ${errors[0]}`)
    await close()
  })
}

await browser.close()
await server.close()
const seconds = Math.round((Date.now() - started) / 1000)
if (unstable.length) console.log(`\n~ ${unstable.length} Seite(n) erst beim zweiten Versuch in Ordnung:\n  ${unstable.join('\n  ')}`)
console.log(`\n${failures.length ? `✗ ${failures.length} Fehler` : '✓ alles in Ordnung'} - ${routes.length} Seiten, ${seconds} s`)
// In GitHub Actions: findings as annotations - visible on the commit without access to the logs.
if (process.env.GITHUB_ACTIONS) {
  for (const line of failures) console.log(`::error title=Seitentest::${line}`)
  for (const line of unstable) console.log(`::warning title=Seitentest (instabil)::${line}`)
}
process.exit(failures.length ? 1 : 0)
