/**
 * Selbsttest der Kursinhalte - `npm run test:inhalte` (optional: `-- praxis-` für einen Teil).
 *
 * Startet den Vite-Dev-Server, öffnet selbsttest.html im installierten Chrome
 * (playwright-core, kein Browser-Download nötig) und wartet, bis alle Beispiele,
 * Übungen und Projektschritte geprüft sind. Beendet sich mit Code 1, wenn etwas fehlschlägt.
 */
import { chromium } from 'playwright-core'
import { createLogger, createServer } from 'vite'

const nur = process.argv[2] ?? ''
// Konsolenausgaben aus dem Browser nicht durchreichen - viele Beispiele zeigen absichtlich Fehler.
const logger = createLogger('warn')
for (const stufe of ['warn', 'error']) {
  const original = logger[stufe]
  logger[stufe] = (text, optionen) => {
    if (!String(text).includes('(client)')) original(text, optionen)
  }
}
const server = await createServer({ server: { port: 5197, strictPort: false }, customLogger: logger })
await server.listen()
const adresse = server.resolvedUrls.local[0]

// Installierter Chrome, sonst Edge (auf Windows immer vorhanden).
let browser
for (const channel of ['chrome', 'msedge']) {
  try {
    browser = await chromium.launch({ channel })
    break
  } catch {
    // nächsten Browser versuchen
  }
}
if (!browser) {
  console.error('Kein Chrome oder Edge gefunden.')
  process.exit(2)
}

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

await browser.close()
await server.close()
process.exit(fehlgeschlagen.length ? 1 : 0)
