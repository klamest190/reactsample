import type { CodeExample, ReactTest, Test } from '../learning/jsSandbox'
import { files as businessDateien } from '../course/practice/BusinessApp.code'
import { uebungDateien, uebungVarianten } from '../course/practice/Testen.code'
import { schrittInhalte } from '../course/project/steps'
import { projektSchritte } from '../course/project/meta'
import type { UebungsSammlung } from '../course/exercises/types'
import { playgrounds } from '../course/playground'
import { bausteinSchritte } from '../course/playground/locations'
import type { Baustein } from '../course/playground/types'
import { planInsertions } from '../learning/insertion'
import { EXPECTED_FAILURES, checkExample, renderProject, uebungPruefen, type Result, type Mode } from './checks'
import { tryItUsages } from './tryItUsages'

/**
 * Einstieg der Testseite selftest.html (nur im Dev-Server, nicht im Build).
 * Gestartet wird sie von scripts/e2e-content.mjs; ?only=praxis- limits it to ids with this prefix.
 * Das Ergebnis steht danach in window.__selftest.
 */

type Job = { id: string; location: string; check: () => Promise<string | null> }

const codeModules = import.meta.glob<{ examples?: Record<string, CodeExample> }>('../course/**/*.code.ts', { eager: true })
const chapterSources = import.meta.glob<string>(['../course/**/*.tsx', '!../course/**/*.en.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const exerciseModules = import.meta.glob<{ exercises: UebungsSammlung }>('../course/exercises/{js,ts,react,hooks,practice,java,backend,sql}.ts', { eager: true })

function collectJobs(): Job[] {
  const modi: Map<string, Mode> = tryItUsages(Object.values(chapterSources))
  const jobs: Job[] = []

  // 1. Beispiele und Übungen in den Kapiteln
  for (const [pfad, mod] of Object.entries(codeModules)) {
    const location = pfad.replace('../course/', '')
    for (const [id, example] of Object.entries(mod.examples ?? {})) {
      const m = modi.get(id)
      if (!m) {
        jobs.push({ id, location, check: async () => 'wird in keinem Kapitel verwendet' })
        continue
      }
      const extra = id === 'praxis-testen-uebung' ? { files: uebungDateien, variants: uebungVarianten } : {}
      jobs.push({ id, location, check: () => checkExample(example, m, { ...extra, id }) })
    }
  }

  // 2. Zusatzübungen
  for (const [pfad, mod] of Object.entries(exerciseModules)) {
    const location = pfad.replace('../course/', '')
    for (const list of Object.values(mod.exercises)) {
      for (const u of list) {
        if (u.stufe === 'vorhersage') continue // Multiple Choice, nichts auszuführen
        jobs.push({
          id: u.id,
          location,
          check: () =>
            u.mode === 'ts' || u.mode === 'spring' || u.mode === 'dockerfile' || u.mode === 'compose' || u.mode === 'sql'
              ? checkExample(u, { mode: u.mode, typed: false, preview: false }, { id: u.id })
              : u.tests?.length
              ? uebungPruefen(u.mode, u.code, u.solution, u.tests as Test[] | ReactTest[], u.setup)
              : checkExample({ code: u.code, solution: u.solution, setup: u.setup }, { mode: u.mode, typed: false, preview: Boolean(u.preview) }),
        })
      }
    }
  }

  // 3. Projektschritte: jeder startet mit der Lösung des vorherigen
  let previous = ''
  for (const meta of projektSchritte) {
    const s = schrittInhalte[meta.id]
    if (!s) continue
    const start = s.start ?? previous
    previous = s.solution
    const example = { code: start, solution: s.solution, tests: s.mode === 'test' ? undefined : s.tests }
    const mode = { mode: s.mode, typed: s.mode === 'react' && Boolean(s.typed), preview: s.mode === 'js' && Boolean(s.preview) }
    const extra = s.mode === 'test' ? { files: s.files, variants: s.variants } : {}
    jobs.push({ id: meta.id, location: 'project/steps.ts', check: () => checkExample(example, mode, extra) })
  }

  // 4. Die Business-App der Werkstatt
  jobs.push({
    id: 'praxis-business',
    location: 'praxis/businessApp/',
    check: async () => (await renderProject(businessDateien, 'App.tsx'))[0] ?? null,
  })

  // 5. Playgrounds: Vorlagen laufen, jeder Baustein läuft an seiner automatischen Stelle -
  //    und alle Bausteine eines Teils zusammen (findet doppelte Namen und falsche Stellen).
  for (const p of playgrounds) {
    const mode: Mode = { mode: p.mode, typed: false, preview: p.mode === 'js' }
    const location = `playground/${p.teil}.ts`
    const start = p.vorlagen[0].code
    const insert = (code: string, b: Baustein) =>
      planInsertions(code, bausteinSchritte(b, { code, start: 0, end: 0, manual: false })).code
    const check = (code: string) => checkExample({ code }, mode)

    p.vorlagen.forEach((v, i) => jobs.push({ id: `playground-${p.teil}-vorlage-${i + 1}`, location, check: () => check(v.code) }))
    const alle = p.gruppen.flatMap((g) => g.bausteine)
    for (const b of alle) {
      jobs.push({ id: `playground-${p.teil}-${b.titel.en}`, location, check: () => check(insert(start, b)) })
    }
    jobs.push({
      id: `playground-${p.teil}-alle-bausteine`,
      location,
      check: async () => {
        const code = alle.reduce(insert, start)
        const message = await check(code)
        return message && `${message}\n--- Code ---\n${code}`
      },
    })
  }

  return jobs
}

async function start() {
  const only = new URLSearchParams(location.search).get('only') ?? ''
  const jobs = collectJobs().filter((a) => a.id.startsWith(only))
  const results: Result[] = []
  const output = document.getElementById('output')!
  const status = window as unknown as { __selftest: { done: boolean; results: Result[]; total: number } }
  status.__selftest = { done: false, results, total: jobs.length }

  for (const a of jobs) {
    const begin = performance.now()
    let message: string | null
    try {
      message = await a.check()
    } catch (f) {
      message = 'Absturz im Selbsttest: ' + String(f)
    }
    if (message && EXPECTED_FAILURES[a.id]) message = null
    const e = { id: a.id, location: a.location, ok: !message, message: message ?? '', duration: Math.round(performance.now() - begin) }
    results.push(e)
    output.textContent += `${e.ok ? '✓' : '✗'} ${e.id} (${e.duration} ms)${e.ok ? '' : '\n    → ' + e.message}\n`
  }
  status.__selftest.done = true
  const failed = results.filter((e) => !e.ok).length
  output.textContent += `\n${results.length - failed} ok, ${failed} fehlgeschlagen\n`
}

void start()
