import type { CodeBeispiel } from '../lernen/jsSandbox'
import { dateien as businessDateien } from '../kurs/praxis/BusinessApp.code'
import { uebungDateien, uebungVarianten } from '../kurs/praxis/Testen.code'
import { schrittInhalte } from '../kurs/projekt/schritte'
import { projektSchritte } from '../kurs/projekt/meta'
import type { UebungsSammlung } from '../kurs/uebungen/typen'
import { ERWARTETE_FEHLER, beispielPruefen, projektRendern, uebungPruefen, type Ergebnis, type Modus } from './pruefen'

/**
 * Einstieg der Testseite selbsttest.html (nur im Dev-Server, nicht im Build).
 * Gestartet wird sie von scripts/inhalte-testen.mjs; ?nur=praxis- beschränkt auf IDs mit diesem Anfang.
 * Das Ergebnis steht danach in window.__selbsttest.
 */

type Auftrag = { id: string; ort: string; pruefen: () => Promise<string | null> }

const codeModule = import.meta.glob<{ beispiele?: Record<string, CodeBeispiel> }>('../kurs/**/*.code.ts', { eager: true })
const kapitelQuellen = import.meta.glob<string>(['../kurs/**/*.tsx', '!../kurs/**/*.en.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const uebungsModule = import.meta.glob<{ uebungen: UebungsSammlung }>('../kurs/uebungen/{js,react,hooks,praxis}.ts', { eager: true })

/** Wie ein Beispiel im Kapitel verwendet wird: <TryIt id="…" modus="react" typen /> */
function modiAusKapiteln() {
  const modi = new Map<string, Modus>()
  for (const quelle of Object.values(kapitelQuellen)) {
    for (const stueck of quelle.split('<TryIt').slice(1)) {
      const id = stueck.match(/id="([^"]+)"/)?.[1]
      if (!id) continue
      // Nur die Props bis zur Aufgabe bzw. zum Tag-Ende betrachten - im Aufgabentext steht Fließtext.
      const ende = Math.min(...['aufgabe=', '/>'].map((s) => stueck.indexOf(s)).filter((i) => i >= 0))
      const props = stueck.slice(0, ende)
      const modus = (props.match(/modus="(\w+)"/)?.[1] ?? 'js') as Modus['modus']
      modi.set(id, { modus, typen: /\btypen\b/.test(props), vorschau: /\bvorschau\b/.test(props) })
    }
  }
  return modi
}

function auftraegeSammeln(): Auftrag[] {
  const modi = modiAusKapiteln()
  const auftraege: Auftrag[] = []

  // 1. Beispiele und Übungen in den Kapiteln
  for (const [pfad, modul] of Object.entries(codeModule)) {
    const ort = pfad.replace('../kurs/', '')
    for (const [id, beispiel] of Object.entries(modul.beispiele ?? {})) {
      const m = modi.get(id)
      if (!m) {
        auftraege.push({ id, ort, pruefen: async () => 'wird in keinem Kapitel verwendet' })
        continue
      }
      const extra = id === 'praxis-testen-uebung' ? { dateien: uebungDateien, varianten: uebungVarianten } : {}
      auftraege.push({ id, ort, pruefen: () => beispielPruefen(beispiel, m, extra) })
    }
  }

  // 2. Zusatzübungen
  for (const [pfad, modul] of Object.entries(uebungsModule)) {
    const ort = pfad.replace('../kurs/', '')
    for (const liste of Object.values(modul.uebungen)) {
      for (const u of liste) {
        if (u.stufe === 'vorhersage') continue // Multiple Choice, nichts auszuführen
        auftraege.push({
          id: u.id,
          ort,
          pruefen: () =>
            u.tests?.length
              ? uebungPruefen(u.modus, u.code, u.loesung, u.tests, u.vorbereitung)
              : beispielPruefen({ code: u.code, loesung: u.loesung, vorbereitung: u.vorbereitung }, { modus: u.modus, typen: false, vorschau: Boolean(u.vorschau) }),
        })
      }
    }
  }

  // 3. Projektschritte: jeder startet mit der Lösung des vorherigen
  let vorherige = ''
  for (const meta of projektSchritte) {
    const s = schrittInhalte[meta.id]
    if (!s) continue
    const start = s.start ?? vorherige
    vorherige = s.loesung
    const beispiel = { code: start, loesung: s.loesung, tests: s.modus === 'test' ? undefined : s.tests }
    const modus = { modus: s.modus, typen: s.modus === 'react' && Boolean(s.typen), vorschau: s.modus === 'js' && Boolean(s.vorschau) }
    const extra = s.modus === 'test' ? { dateien: s.dateien, varianten: s.varianten } : {}
    auftraege.push({ id: meta.id, ort: 'projekt/schritte.ts', pruefen: () => beispielPruefen(beispiel, modus, extra) })
  }

  // 4. Die Business-App der Werkstatt
  auftraege.push({
    id: 'praxis-business',
    ort: 'praxis/businessApp/',
    pruefen: async () => (await projektRendern(businessDateien, 'App.tsx'))[0] ?? null,
  })

  return auftraege
}

async function start() {
  const nur = new URLSearchParams(location.search).get('nur') ?? ''
  const auftraege = auftraegeSammeln().filter((a) => a.id.startsWith(nur))
  const ergebnisse: Ergebnis[] = []
  const ausgabe = document.getElementById('ausgabe')!
  const status = window as unknown as { __selbsttest: { fertig: boolean; ergebnisse: Ergebnis[]; gesamt: number } }
  status.__selbsttest = { fertig: false, ergebnisse, gesamt: auftraege.length }

  for (const a of auftraege) {
    const beginn = performance.now()
    let meldung: string | null
    try {
      meldung = await a.pruefen()
    } catch (f) {
      meldung = 'Absturz im Selbsttest: ' + String(f)
    }
    if (meldung && ERWARTETE_FEHLER[a.id]) meldung = null
    const e = { id: a.id, ort: a.ort, ok: !meldung, meldung: meldung ?? '', dauer: Math.round(performance.now() - beginn) }
    ergebnisse.push(e)
    ausgabe.textContent += `${e.ok ? '✓' : '✗'} ${e.id} (${e.dauer} ms)${e.ok ? '' : '\n    → ' + e.meldung}\n`
  }
  status.__selbsttest.fertig = true
  const fehlgeschlagen = ergebnisse.filter((e) => !e.ok).length
  ausgabe.textContent += `\n${ergebnisse.length - fehlgeschlagen} ok, ${fehlgeschlagen} fehlgeschlagen\n`
}

void start()
