import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSprache, useTexte, type Sprache } from '../i18n/SpracheContext'
import { Icon } from './Icon'
import { Taste } from './Ui'
import { glossar } from '../kurs/glossar'
import { alleKapitel } from '../kurs/kurs'

/**
 * Suche über alles: Kapitel (Titel, Kurztext, Lernziele, Stichworte), Glossar und Projektschritte.
 * Öffnet mit Strg/⌘ + K oder über die Seitenleiste. Bedienbar komplett per Tastatur.
 */

type Treffer = { art: 'kapitel' | 'glossar' | 'projekt' | 'seite'; ziel: string; titel: string; unter: string; punkte: number }

/** Suchtext normalisieren: klein, ohne Akzente - „Überblick“ findet man auch mit „uberblick“. */
const normal = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

function suchen(anfrage: string, sprache: Sprache, seiten: { ziel: string; titel: string }[]): Treffer[] {
  const woerter = normal(anfrage).split(/\s+/).filter(Boolean)
  if (woerter.length === 0) return []

  // Jedes Wort muss irgendwo vorkommen. Treffer im Titel zählen mehr.
  const bewerten = (titel: string, rest: string[]) => {
    const t = normal(titel)
    const r = normal(rest.join(' '))
    let punkte = 0
    for (const wort of woerter) {
      if (t.startsWith(wort)) punkte += 6
      else if (t.includes(wort)) punkte += 4
      else if (r.includes(wort)) punkte += 1
      else return 0
    }
    return punkte
  }

  const treffer: Treffer[] = []
  for (const k of alleKapitel) {
    const andere: Sprache = sprache === 'de' ? 'en' : 'de'
    const punkte = bewerten(k.titel[sprache], [k.kurz[sprache], ...k.lernziele[sprache], ...k.stichworte, k.titel[andere], k.nummer])
    if (punkte)
      treffer.push({
        art: k.teil.id === 'projekt' ? 'projekt' : 'kapitel',
        ziel: k.id,
        titel: `${k.nummer} ${k.titel[sprache]}`,
        unter: k.kurz[sprache],
        punkte: punkte + 0.5,
      })
  }
  for (const e of glossar) {
    const punkte = bewerten(e.begriff, [e.deutsch ?? '', e.erklaerung[sprache]])
    if (punkte)
      treffer.push({
        art: 'glossar',
        ziel: 'glossar/' + e.id,
        titel: e.begriff + (e.deutsch && sprache === 'de' ? ` · ${e.deutsch}` : ''),
        unter: e.erklaerung[sprache].replace(/[`*[\]]/g, ''),
        punkte,
      })
  }
  for (const s of seiten) {
    const punkte = bewerten(s.titel, [])
    if (punkte) treffer.push({ art: 'seite', ziel: s.ziel, titel: s.titel, unter: '', punkte })
  }
  return treffer.toSorted((a, b) => b.punkte - a.punkte).slice(0, 12)
}

export function Suche({ offen, schliessen, navigieren }: { offen: boolean; schliessen: () => void; navigieren: (ziel: string) => void }) {
  if (!offen) return null
  // Eigene Komponente, damit Eingabe und Auswahl bei jedem Öffnen frisch starten.
  return createPortal(<SuchDialog schliessen={schliessen} navigieren={navigieren} />, document.body)
}

function SuchDialog({ schliessen, navigieren }: { schliessen: () => void; navigieren: (ziel: string) => void }) {
  const { sprache } = useSprache()
  const t = useTexte()
  const [anfrage, setAnfrage] = useState('')
  const [auswahl, setAuswahl] = useState(0)
  const listeRef = useRef<HTMLUListElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Fokus zurückgeben: wer den Dialog per Tastatur geöffnet hat, steht danach
  // wieder auf demselben Knopf und nicht am Seitenanfang.
  useEffect(() => {
    const vorher = document.activeElement as HTMLElement | null
    return () => vorher?.focus?.()
  }, [])

  const seiten = [
    { ziel: '', titel: t.uebersicht },
    { ziel: 'glossar', titel: t.glossar },
    { ziel: 'projekt', titel: t.projekt },
    { ziel: 'playground', titel: t.playground },
  ]
  const treffer = suchen(anfrage, sprache, seiten)
  const aktiv = Math.min(auswahl, Math.max(treffer.length - 1, 0))

  // Die ausgewählte Zeile im sichtbaren Bereich halten.
  useEffect(() => {
    listeRef.current?.children[aktiv]?.scrollIntoView({ block: 'nearest' })
  }, [aktiv])

  function oeffnen(ziel: string) {
    schliessen()
    navigieren(ziel)
  }

  function tasten(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAuswahl((aktiv + 1) % Math.max(treffer.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAuswahl((aktiv - 1 + treffer.length) % Math.max(treffer.length, 1))
    } else if (e.key === 'Enter' && treffer[aktiv]) {
      e.preventDefault()
      oeffnen(treffer[aktiv].ziel)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      schliessen()
    } else if (e.key === 'Tab') {
      // Fokusfalle: aria-modal blendet den Hintergrund nur für Screenreader aus,
      // die Tab-Taste kommt trotzdem hinaus. Also hier im Kreis führen.
      const ziele = dialogRef.current?.querySelectorAll<HTMLElement>('input, button, [href]')
      if (!ziele?.length) return
      const erstes = ziele[0]
      const letztes = ziele[ziele.length - 1]
      if (e.shiftKey && document.activeElement === erstes) {
        e.preventDefault()
        letztes.focus()
      } else if (!e.shiftKey && document.activeElement === letztes) {
        e.preventDefault()
        erstes.focus()
      }
    }
  }

  const artStil: Record<Treffer['art'], string> = {
    kapitel: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    glossar: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    projekt: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    seite: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 p-4 pt-[10vh] backdrop-blur-sm" onMouseDown={schliessen}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.suche}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
          <Icon name="suche" className="size-4.5 text-slate-400" />
          <input
            autoFocus
            role="combobox"
            aria-expanded={treffer.length > 0}
            aria-controls="suchergebnisse"
            aria-activedescendant={treffer[aktiv] ? 'treffer-' + aktiv : undefined}
            value={anfrage}
            onChange={(e) => {
              setAnfrage(e.target.value)
              setAuswahl(0)
            }}
            onKeyDown={tasten}
            placeholder={t.suchePlatzhalter}
            aria-label={t.suchePlatzhalter}
            className="w-full bg-transparent py-3 text-base outline-none"
          />
          <Taste>Esc</Taste>
        </div>

        {anfrage.trim() && treffer.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">{t.sucheKeineTreffer}</p>
        )}

        {treffer.length > 0 && (
          <ul id="suchergebnisse" role="listbox" ref={listeRef} className="max-h-[60vh] overflow-y-auto p-2">
            {treffer.map((tr, i) => (
              <li
                key={tr.art + tr.ziel}
                id={'treffer-' + i}
                role="option"
                aria-selected={i === aktiv}
                onMouseMove={() => setAuswahl(i)}
                onClick={() => oeffnen(tr.ziel)}
                className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 ${i === aktiv ? 'bg-brand-50 dark:bg-slate-800' : ''}`}
              >
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-3xs font-semibold uppercase ${artStil[tr.art]}`}>
                  {t.sucheArten[tr.art]}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{tr.titel}</span>
                  {tr.unter && <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{tr.unter}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {t.sucheHinweis}
        </p>
      </div>
    </div>
  )
}
