/**
 * Selbsttest der Kursinhalte - `npm run test:inhalte` (optional: `-- praxis-` für einen Teil).
 *
 * Startet den Vite-Dev-Server, öffnet selbsttest.html im installierten Chrome
 * (playwright-core, kein Browser-Download nötig) und wartet, bis alle Beispiele,
 * Übungen und Projektschritte geprüft sind. Beendet sich mit Code 1, wenn etwas fehlschlägt.
 *
 * `-- --build`: against a production build instead of the dev server (as in CI) - some bugs
 * exist only there. Both can be combined: `npm run test:inhalte -- --build praxis-`.
 */
import { createLogger } from 'vite'
import { launchBrowser, startServer } from './test-server.mjs'

const argumente = process.argv.slice(2)
const produktion = argumente.includes('--build')
const nur = argumente.find((a) => !a.startsWith('--')) ?? ''

// Viele Beispiele zeigen absichtlich Fehler. Vite reicht sie aus dem Browser durch -
// hier werden diese Zeilen ausgeblendet, damit nur der Testbericht übrig bleibt.
const logger = createLogger('warn')
let inBrowserMeldung = false
const filter = (schreiben) => (text, ...rest) => {
  const zeile = String(text)
  if (zeile.includes('[vite]') && zeile.includes('(client)')) {
    inBrowserMeldung = true
    return true
  }
  if (inBrowserMeldung) {
    // Folgezeilen einer Browser-Meldung: Stacktrace, Leerzeilen, Hinweise von React.
    if (/^\s*(at |$)/.test(zeile) || /^(The above error|React will try)/.test(zeile)) return true
    inBrowserMeldung = false
  }
  return schreiben(zeile, ...rest)
}
process.stdout.write = filter(process.stdout.write.bind(process.stdout))
process.stderr.write = filter(process.stderr.write.bind(process.stderr))
if (produktion) console.log('Produktions-Build …')
const server = await startServer({ production: produktion, pages: ['index.html', 'selbsttest.html'], logger })
const adresse = server.url
const browser = await launchBrowser()

const seite = await browser.newPage()
const seitenfehler = []
seite.on('pageerror', (f) => seitenfehler.push(f.message))

const start = Date.now()
await seite.goto(`${adresse}selbsttest.html?nur=${encodeURIComponent(nur)}`)

// Fortschritt ausgeben, bis die Seite fertig meldet.
let gemeldet = 0
for (;;) {
  const stand = await seite.evaluate(() => window.__selbsttest ?? null)
  if (stand) {
    for (const e of stand.ergebnisse.slice(gemeldet)) {
      if (!e.ok) console.log(`✗ ${e.id}  (${e.ort})\n    → ${e.meldung}`)
    }
    if (stand.ergebnisse.length - gemeldet > 0) {
      process.stdout.write(`  ${stand.ergebnisse.length}/${stand.gesamt} geprüft\r`)
    }
    gemeldet = stand.ergebnisse.length
    if (stand.fertig) break
  }
  await new Promise((r) => setTimeout(r, 500))
}

const ergebnisse = await seite.evaluate(() => window.__selbsttest.ergebnisse)
const fehlgeschlagen = ergebnisse.filter((e) => !e.ok)
const langsamste = [...ergebnisse].sort((a, b) => b.dauer - a.dauer).slice(0, 3)

console.log(`\n${ergebnisse.length - fehlgeschlagen.length} ok, ${fehlgeschlagen.length} fehlgeschlagen - ${Math.round((Date.now() - start) / 1000)} s`)
console.log('Am langsamsten: ' + langsamste.map((e) => `${e.id} ${e.dauer} ms`).join(', '))
// Unbehandelte Fehler aus Beispielcode (z. B. ein Startcode ohne passenden case) sind erwartbar - nur zur Info.
if (seitenfehler.length) {
  console.log(`Hinweis: ${seitenfehler.length} unbehandelte Fehler aus Beispielcode: ${[...new Set(seitenfehler)].join(' · ')}`)
}

// In GitHub Actions: failures as annotations - visible on the commit without access to the logs.
if (process.env.GITHUB_ACTIONS) {
  for (const e of fehlgeschlagen) console.log(`::error title=Inhaltstest ${e.id}::${e.ort}: ${e.meldung.replace(/\n/g, ' ')}`)
}

await browser.close()
await server.close()
process.exit(fehlgeschlagen.length ? 1 : 0)
