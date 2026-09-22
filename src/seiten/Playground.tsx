import { useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { TEIL_STIL } from '../components/teilStil'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { kurs } from '../kurs/kurs'
import { playgrounds } from '../kurs/playground'
import { bausteinSchritte } from '../kurs/playground/orte'
import type { Baustein, PlaygroundDaten } from '../kurs/playground/typen'
import type { EditorSteuerung } from '../lernen/CodeEditor'
import { TryIt } from '../lernen/TryIt'

/**
 * Playground: frei programmieren - ein Editor pro Kursteil, ohne Aufgabe und ohne Tests.
 *
 * Damit man nicht vor einem leeren Blatt sitzt, gibt es links Bausteine (ein Klick fügt
 * sie ein) und oben Vorlagen (ersetzen den ganzen Code). Beides läuft über das Textfeld
 * des Editors, deshalb macht Strg+Z jeden Klick rückgängig.
 *
 * Der Code wird wie bei jedem TryIt pro id im localStorage gespeichert - also einmal pro Teil.
 */
export function Playground({ teil }: { teil?: string }) {
  const daten = playgrounds.find((p) => p.teil === teil) ?? playgrounds[0]
  const t = useTexte()
  const { sprache } = useSprache()

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{t.playgroundKopf}</h1>
        <p className="max-w-3xl text-slate-600 dark:text-slate-400">{t.playgroundText}</p>
        <nav aria-label={t.playgroundTeile} className="flex flex-wrap gap-2">
          {playgrounds.map((p) => {
            const kursTeil = kurs.find((k) => k.id === p.teil)!
            const stil = TEIL_STIL[p.teil] ?? TEIL_STIL.javascript
            const aktiv = p === daten
            return (
              <a
                key={p.teil}
                href={'#/playground/' + p.teil}
                aria-current={aktiv ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition ${
                  aktiv
                    ? 'border-brand-500 bg-brand-50 font-semibold text-brand-800 dark:bg-brand-500/15 dark:text-brand-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span className={`flex size-5 items-center justify-center rounded ${stil.farbe}`}>
                  <Icon name={stil.icon} className="size-3" />
                </span>
                {kursTeil.kurztitel[sprache]}
              </a>
            )
          })}
        </nav>
      </header>

      {/* key: Beim Teilwechsel startet alles frisch - Editor, Filter, aufgeklappte Gruppen. */}
      <Arbeitsflaeche key={daten.teil} daten={daten} />
    </div>
  )
}

function Arbeitsflaeche({ daten }: { daten: PlaygroundDaten }) {
  const t = useTexte()
  const { sprache } = useSprache()
  const editorRef = useRef<EditorSteuerung>(null)
  const [filter, setFilter] = useState('')
  const kursTeil = kurs.find((k) => k.id === daten.teil)!

  function bausteinEinfuegen(baustein: Baustein) {
    const editor = editorRef.current
    if (!editor) return
    editor.einfuegen(bausteinSchritte(baustein, editor.stand()))
    editor.ausfuehren()
  }

  function vorlageLaden(code: string) {
    const editor = editorRef.current
    if (!editor) return
    editor.ersetzen(code)
    editor.ausfuehren()
  }

  // Filter über Titel, Erklärung und Code - "map" findet also auch Bausteine, die map benutzen.
  const suche = filter.trim().toLowerCase()
  const gruppen = daten.gruppen
    .map((g) => ({
      ...g,
      bausteine: suche
        ? g.bausteine.filter((b) =>
            [b.titel[sprache], b.info[sprache], b.code, g.titel[sprache]].some((text) => text.toLowerCase().includes(suche)),
          )
        : g.bausteine,
    }))
    .filter((g) => g.bausteine.length > 0)

  const start = daten.vorlagen[0].code
  const gemeinsam = {
    id: 'playground-' + daten.teil,
    code: start,
    kopf: t.playgroundKopf,
    titel: kursTeil.kurztitel[sprache],
    editorRef,
    maxZeilen: 34,
  }

  return (
    <div className="space-y-4">
      {/* Vorlagen */}
      <section aria-labelledby="vorlagen-titel" className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 id="vorlagen-titel" className="text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            {t.vorlagen}
          </h2>
          <p className="text-xs text-slate-400">{t.vorlageHinweis}</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {daten.vorlagen.map((v) => (
            <li key={v.titel.en}>
              <button
                onClick={() => vorlageLaden(v.code)}
                title={v.info[sprache]}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm transition hover:border-brand-500 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:hover:text-brand-300"
              >
                {v.titel[sprache]}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {daten.hinweis && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          💡 {daten.hinweis[sprache]}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
        {/* Bausteine */}
        <aside
          aria-labelledby="bausteine-titel"
          className="rounded-xl border border-slate-200 bg-white lg:sticky lg:top-20 lg:flex lg:max-h-[calc(100vh-6rem)] lg:flex-col dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="space-y-2 border-b border-slate-200 p-3 dark:border-slate-800">
            <h2 id="bausteine-titel" className="text-sm font-semibold">
              🧩 {t.bausteine}
            </h2>
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t.bausteinFilter}
              aria-label={t.bausteinFilter}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
            />
            <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">{t.bausteinHinweis}</p>
          </div>

          <div className="max-h-96 overflow-y-auto p-2 lg:max-h-none lg:flex-1">
            {gruppen.length === 0 && <p className="p-2 text-sm text-slate-500">{t.keineBausteine}</p>}
            {gruppen.map((g, i) => (
              // Beim Filtern alle Treffer zeigen, sonst nur die erste Gruppe offen.
              <details key={g.titel.en + (suche ? ':suche' : '')} open={Boolean(suche) || i === 0} className="group mb-1">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                  <span className="text-slate-400 transition group-open:rotate-90" aria-hidden>
                    ▸
                  </span>
                  <span className="flex-1">{g.titel[sprache]}</span>
                  <span className="text-xs text-slate-400 tabular-nums">{g.bausteine.length}</span>
                </summary>
                <ul className="mt-1 space-y-1 pl-1">
                  {g.bausteine.map((b) => (
                    <li key={b.titel.en} className="flex items-start gap-1">
                      <button
                        onClick={() => bausteinEinfuegen(b)}
                        aria-label={t.bausteinEinfuegen(b.titel[sprache])}
                        className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-left transition hover:border-brand-400 hover:bg-brand-50 dark:border-slate-800 dark:hover:border-brand-600 dark:hover:bg-brand-500/10"
                      >
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[13px] font-semibold">{b.titel[sprache]}</span>
                          {t.orte[b.ort] && (
                            <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {t.orte[b.ort]}
                              {b.nutzung ? ' ' + t.mitNutzung : ''}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-slate-500 dark:text-slate-400">{b.info[sprache]}</span>
                      </button>
                      {b.kapitel && (
                        <a
                          href={'#/' + b.kapitel}
                          title={t.bausteinKapitel}
                          aria-label={`${t.bausteinKapitel}: ${b.titel[sprache]}`}
                          className="mt-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                        >
                          <Icon name="buch" className="size-3.5" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </aside>

        {/* Editor mit Ausgabe */}
        <div className="min-w-0">
          {daten.modus === 'react' ? (
            <TryIt {...gemeinsam} modus="react" />
          ) : daten.modus === 'java' ? (
            <TryIt {...gemeinsam} modus="java" />
          ) : daten.modus === 'spring' ? (
            <TryIt {...gemeinsam} modus="spring" />
          ) : daten.modus === 'ts' ? (
            <TryIt {...gemeinsam} modus="ts" />
          ) : (
            <TryIt {...gemeinsam} vorschau />
          )}
        </div>
      </div>
    </div>
  )
}
