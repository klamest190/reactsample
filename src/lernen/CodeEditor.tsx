import {
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type Ref,
  type UIEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { einfuegungenPlanen, type Schritt } from './einfuegen'
import { HervorgehobenerCode } from './hervorheben'
import type { Typfehler } from './typpruefung'
import { klassenWort, tailwindMotor } from './tailwind'
import { suchen, vorschlaegeFuer, type EditorSprache, type Vorschlag, type VorschlagArt } from './vorschlaege'

/**
 * Kleiner Code-Editor ohne Bibliothek.
 *
 * Trick: Ein durchsichtiges <textarea> liegt exakt über einem <pre> mit dem
 * eingefärbten Code. Man tippt im Textfeld (Cursor, Markieren, Strg+Z
 * funktionieren nativ) und sieht die Farben des <pre> darunter.
 * Beide müssen dafür dieselbe Schrift, Zeilenhöhe und Innenabstände haben.
 *
 * Dazu eine Autovervollständigung: Beim Tippen erscheinen passende Vorschläge
 * (siehe vorschlaege.ts), Strg+Leertaste öffnet sie von Hand.
 */

const ZEILENHOEHE = 20
const MAX_ZEILEN = 28
const INNENABSTAND = 12 // p-3
const POPUP_BREITE = 340
const POPUP_HOEHE = 290

type Props = {
  wert: string
  beiAenderung: (wert: string) => void
  /** Strg+Enter. Bekommt den aktuellen Text mit - wichtig direkt nach einem Einfügen, bevor der State nachzieht. */
  beiAusfuehren?: (code: string) => void
  label: string
  sprache: EditorSprache
  /** Ab so vielen Zeilen scrollt der Editor, statt weiter zu wachsen. */
  maxZeilen?: number
  /** Typfehler: rot unterschlängelt, Zeilennummer rot, Meldung im Tooltip. */
  markierungen?: Typfehler[]
  /** Von außen Code einfügen (Bausteine im Playground), siehe EditorSteuerung. */
  steuerung?: Ref<EditorSteuerung>
}

/**
 * Was der Editor nach außen anbietet. Beide Aktionen laufen über das Textfeld selbst,
 * deshalb lassen sie sich mit Strg+Z rückgängig machen.
 */
export type EditorSteuerung = {
  /** Aktueller Text und Auswahl. `vonHand`: Hat die Person seit dem letzten Einfügen selbst geklickt oder getippt? */
  stand: () => { code: string; start: number; ende: number; vonHand: boolean }
  /** Bausteine einfügen (siehe einfuegungenPlanen). */
  einfuegen: (schritte: Schritt[]) => void
  /** Den ganzen Code ersetzen (z. B. durch eine Vorlage). */
  ersetzen: (code: string) => void
  /** Wie Strg+Enter. */
  ausfuehren: () => void
}

type Popup = {
  treffer: Vorschlag[]
  ersetzeZeichen: number
  auswahl: number
  x: number
  /** Unterkante der Cursorzeile (Popup darunter) bzw. Oberkante (Popup darüber). */
  y: number
  oben: boolean
}

export function CodeEditor({
  wert,
  beiAenderung,
  beiAusfuehren,
  label,
  sprache,
  maxZeilen = MAX_ZEILEN,
  markierungen = [],
  steuerung,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const nummernRef = useRef<HTMLDivElement>(null)
  // Nach Escape darf Tab den Editor verlassen (sonst wäre die Tastatur gefangen).
  const tabFreigegeben = useRef(false)
  // Tailwind-Vorschläge kommen asynchron - nur die Antwort auf die letzte Anfrage zählt.
  const tailwindAnfrage = useRef(0)
  // Eigene Einfügungen (Vorschlag übernommen) sollen das Popup nicht gleich wieder öffnen.
  const unterdruecken = useRef(false)

  const { sprache: oberflaeche } = useSprache()
  const t = useTexte()
  const [popup, setPopup] = useState<Popup | null>(null)
  const alleVorschlaege = useMemo(() => vorschlaegeFuer(sprache, oberflaeche), [sprache, oberflaeche])
  const listenId = useId()

  const zeilenTexte = wert.split('\n')
  const zeilen = zeilenTexte.length
  const hoehe = Math.min(Math.max(zeilen, 4), maxZeilen) * ZEILENHOEHE + 24 + 12

  // Solange das Popup offen ist: beim Scrollen oder Größe ändern schließen,
  // weil die berechnete Position sonst nicht mehr stimmt.
  const istOffen = popup !== null
  useEffect(() => {
    if (!istOffen) return
    const schliessen = (e: Event) => {
      // Scrollen innerhalb der Vorschlagsliste selbst zählt nicht.
      if (e.target instanceof Element && e.target.closest('[data-vorschlaege]')) return
      setPopup(null)
    }
    window.addEventListener('scroll', schliessen, true)
    window.addEventListener('resize', schliessen)
    return () => {
      window.removeEventListener('scroll', schliessen, true)
      window.removeEventListener('resize', schliessen)
    }
  }, [istOffen])

  function beiScroll(e: UIEvent<HTMLTextAreaElement>) {
    const { scrollTop, scrollLeft } = e.currentTarget
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop
      preRef.current.scrollLeft = scrollLeft
    }
    if (nummernRef.current) nummernRef.current.scrollTop = scrollTop
  }

  function einfuegen(feld: HTMLTextAreaElement, text: string) {
    // execCommand ist veraltet, aber der einzige Weg, der den Undo-Verlauf erhält.
    if (!document.execCommand('insertText', false, text)) {
      feld.setRangeText(text, feld.selectionStart, feld.selectionEnd, 'end')
      beiAenderung(feld.value)
    }
  }

  // Steht der Cursor dort, wo die Person ihn hingesetzt hat - oder nur zufällig
  // (Startposition, nach dem letzten Einfügen)? Davon hängt ab, wo Bausteine landen.
  const cursorVonHand = useRef(false)

  useImperativeHandle(steuerung, () => ({
    stand() {
      const feld = textareaRef.current
      return {
        code: feld?.value ?? wert,
        start: feld?.selectionStart ?? 0,
        ende: feld?.selectionEnd ?? 0,
        vonHand: cursorVonHand.current,
      }
    },
    einfuegen(schritte) {
      const feld = textareaRef.current
      if (!feld) return
      const plan = einfuegungenPlanen(feld.value, schritte)
      feld.focus()
      unterdruecken.current = true
      for (const e of plan.einfuegungen) {
        feld.setSelectionRange(e.start, e.ende)
        einfuegen(feld, e.text)
      }
      unterdruecken.current = false
      feld.setSelectionRange(plan.cursor, plan.cursor)
      cursorVonHand.current = false
      setPopup(null)
      // Die eingefügte Stelle sichtbar machen.
      const zeile = feld.value.slice(0, plan.cursor).split('\n').length - 1
      feld.scrollTop = Math.max(0, zeile * ZEILENHOEHE - feld.clientHeight / 2)
    },
    ersetzen(code) {
      const feld = textareaRef.current
      if (!feld) return
      feld.focus()
      feld.select()
      unterdruecken.current = true
      einfuegen(feld, code)
      unterdruecken.current = false
      feld.setSelectionRange(0, 0)
      feld.scrollTop = 0
      cursorVonHand.current = false
      setPopup(null)
    },
    ausfuehren() {
      beiAusfuehren?.(textareaRef.current?.value ?? wert)
    },
  }))

  // ---- Autovervollständigung ------------------------------------------------

  function vorschlaegeZeigen(feld: HTMLTextAreaElement, vonHand: boolean) {
    const vorher = feld.value.slice(0, feld.selectionStart)
    const zeile = vorher.slice(vorher.lastIndexOf('\n') + 1)

    // In className="…" gibt es Tailwind-Klassen statt JavaScript. Die Engine lädt beim ersten Mal nach,
    // deshalb kommt das Ergebnis asynchron - und zählt nur, wenn sich am Text nichts geändert hat.
    const klassen = sprache === 'react' ? klassenWort(vorher) : null
    if (klassen !== null) {
      const anfrage = ++tailwindAnfrage.current
      if ((!vonHand && !klassen) || feld.selectionStart !== feld.selectionEnd) {
        setPopup(null)
        return
      }
      void tailwindMotor()
        .then((motor) => {
          if (anfrage !== tailwindAnfrage.current) return
          const { treffer, ersetzeZeichen } = motor.vorschlaege(klassen)
          popupOeffnen(feld, vorher, treffer, ersetzeZeichen)
        })
        .catch((fehler: unknown) => console.error('Tailwind:', fehler))
      return
    }
    tailwindAnfrage.current++

    const wort = zeile.match(/[\w$.]*$/)![0]
    const imKommentar = zeile.slice(0, zeile.length - wort.length).includes('//')
    if ((!vonHand && (!wort || /^\d/.test(wort))) || imKommentar || feld.selectionStart !== feld.selectionEnd) {
      setPopup(null)
      return
    }

    const { treffer, ersetzeZeichen } = suchen(alleVorschlaege, feld.value, wort, t.imCode)
    popupOeffnen(feld, vorher, treffer, ersetzeZeichen)
  }

  function popupOeffnen(feld: HTMLTextAreaElement, vorher: string, treffer: Vorschlag[], ersetzeZeichen: number) {
    if (treffer.length === 0) {
      setPopup(null)
      return
    }
    const zeile = vorher.slice(vorher.lastIndexOf('\n') + 1)

    // Position des Wortanfangs in Pixeln: Monospace-Schrift, also Spalte × Zeichenbreite.
    const stil = getComputedStyle(feld)
    const kontext = document.createElement('canvas').getContext('2d')!
    kontext.font = `${stil.fontSize} ${stil.fontFamily}`
    const zeichenBreite = kontext.measureText('0000000000').width / 10

    const box = feld.getBoundingClientRect()
    const zeilenIndex = vorher.split('\n').length - 1
    const spalte = zeile.length - ersetzeZeichen
    const x = box.left + INNENABSTAND + spalte * zeichenBreite - feld.scrollLeft
    const zeilenOben = box.top + INNENABSTAND + zeilenIndex * ZEILENHOEHE - feld.scrollTop
    const oben = zeilenOben + ZEILENHOEHE + POPUP_HOEHE > window.innerHeight

    setPopup({
      treffer,
      ersetzeZeichen,
      auswahl: 0,
      x: Math.max(8, Math.min(x, window.innerWidth - POPUP_BREITE - 8)),
      y: oben ? zeilenOben : zeilenOben + ZEILENHOEHE,
      oben,
    })
  }

  function uebernehmen(vorschlag: Vorschlag) {
    const feld = textareaRef.current
    if (!feld || !popup) return

    const start = feld.selectionStart - popup.ersetzeZeichen
    const vorher = feld.value.slice(0, start)
    const einrueckung = vorher.slice(vorher.lastIndexOf('\n') + 1).match(/^\s*/)![0]

    // Mehrzeilige Vorlagen an die aktuelle Einrückung anpassen, $0 = Cursorposition.
    const vorlage = (vorschlag.einfuegen ?? vorschlag.label).replace(/\n/g, '\n' + einrueckung)
    const cursor = vorlage.indexOf('$0')
    const text = vorlage.replace('$0', '')

    feld.setSelectionRange(start, feld.selectionStart) // getipptes Wort markieren …
    unterdruecken.current = true
    einfuegen(feld, text) // … und ersetzen
    unterdruecken.current = false

    if (cursor >= 0) feld.setSelectionRange(start + cursor, start + cursor)
    setPopup(null)
    // Nach einer Tailwind-Variante wie "hover:" geht es direkt mit den Klassen weiter.
    if (vorschlag.art === 'tailwind' && text.endsWith(':')) vorschlaegeZeigen(feld, true)
  }

  function beiEingabe(e: ChangeEvent<HTMLTextAreaElement>) {
    beiAenderung(e.target.value)
    if (unterdruecken.current) return
    vorschlaegeZeigen(e.target, false)
  }

  // ---- Tastatur -----------------------------------------------------------------

  function beiTaste(e: KeyboardEvent<HTMLTextAreaElement>) {
    const feld = e.currentTarget

    if (popup) {
      const anzahl = popup.treffer.length
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const schritt = e.key === 'ArrowDown' ? 1 : -1
        setPopup({ ...popup, auswahl: (popup.auswahl + schritt + anzahl) % anzahl })
        return
      }
      if ((e.key === 'Enter' && !e.ctrlKey && !e.metaKey) || e.key === 'Tab') {
        e.preventDefault()
        uebernehmen(popup.treffer[popup.auswahl])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setPopup(null)
        return
      }
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
        setPopup(null)
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
      e.preventDefault()
      vorschlaegeZeigen(feld, true)
      return
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      setPopup(null)
      beiAusfuehren?.(feld.value)
      return
    }
    if (e.key === 'Escape') {
      tabFreigegeben.current = true
      return
    }
    if (e.key === 'Tab' && !e.shiftKey && !tabFreigegeben.current) {
      e.preventDefault()
      einfuegen(feld, '  ')
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      // Einrückung der aktuellen Zeile übernehmen, nach { ( [ eine Stufe mehr.
      const vorher = feld.value.slice(0, feld.selectionStart)
      const zeile = vorher.slice(vorher.lastIndexOf('\n') + 1)
      const einrueckung = zeile.match(/^\s*/)![0]
      const extra = /[{([]\s*$|=>\s*$/.test(zeile) ? '  ' : ''
      e.preventDefault()
      einfuegen(feld, '\n' + einrueckung + extra)
    }
    tabFreigegeben.current = false
  }

  const aktiveOptionId = popup ? `${listenId}-${popup.auswahl}` : undefined

  return (
    <div
      className="flex bg-slate-50 font-mono text-[13px] dark:bg-slate-950"
      style={{ lineHeight: ZEILENHOEHE + 'px' }}
    >
      <div
        ref={nummernRef}
        aria-hidden
        className="overflow-hidden border-r border-slate-200 py-3 pr-2 pl-3 text-right text-slate-400 select-none dark:border-slate-800 dark:text-slate-600"
        style={{ height: hoehe }}
      >
        {Array.from({ length: zeilen }, (_, i) => {
          const fehler = markierungen.filter((m) => m.zeile === i + 1)
          return (
            <div
              key={i}
              title={fehler.map((m) => m.text).join('\n') || undefined}
              className={fehler.length ? 'font-semibold text-rose-600 dark:text-rose-400' : undefined}
            >
              {i + 1}
            </div>
          )
        })}
      </div>

      <div className="relative min-w-0 flex-1">
        <pre
          ref={preRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 m-0 overflow-hidden p-3 whitespace-pre"
        >
          <HervorgehobenerCode code={wert} />
          {/* Unterschlängelung: Die Schrift ist monospace, 1ch = ein Zeichen. */}
          {markierungen.map((m, i) => (
            <span
              key={i}
              className="absolute rounded-sm bg-rose-500/10 text-transparent underline decoration-rose-500 decoration-wavy underline-offset-3"
              style={{ top: INNENABSTAND + (m.zeile - 1) * ZEILENHOEHE, left: `calc(${INNENABSTAND}px + ${m.spalte}ch)` }}
            >
              {zeilenTexte[m.zeile - 1]?.slice(m.spalte, m.spalte + m.laenge) || ' '}
            </span>
          ))}
          {/* Leerzeichen, damit eine abschließende Leerzeile auch im <pre> Platz hat. */}
          {'\n '}
        </pre>
        <textarea
          ref={textareaRef}
          value={wert}
          onChange={beiEingabe}
          onKeyDown={beiTaste}
          onScroll={beiScroll}
          onBlur={() => setPopup(null)}
          onMouseDown={() => setPopup(null)}
          onMouseUp={() => (cursorVonHand.current = true)}
          onKeyUp={(e) => {
            if (!e.ctrlKey && !e.metaKey && !['Escape', 'Tab', 'Shift', 'Control', 'Meta', 'Alt'].includes(e.key)) {
              cursorVonHand.current = true
            }
          }}
          aria-label={label}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={istOffen}
          aria-controls={istOffen ? listenId : undefined}
          aria-activedescendant={aktiveOptionId}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap="off"
          className="relative block w-full resize-none overflow-auto bg-transparent p-3 whitespace-pre text-transparent caret-slate-900 outline-none selection:bg-brand-500/25 dark:caret-white"
          style={{ height: hoehe }}
        />
      </div>

      {popup &&
        // Portal: Der TryIt-Rahmen hat overflow:hidden und würde das Popup abschneiden.
        createPortal(
          <VorschlagsListe id={listenId} popup={popup} beiAuswahl={uebernehmen} />,
          document.body,
        )}
    </div>
  )
}

// ---------------------------------------------------------------------------

const ART_STIL: Record<VorschlagArt, { kurz: string; klassen: string }> = {
  funktion: { kurz: 'ƒ', klassen: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' },
  hook: { kurz: 'use', klassen: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300' },
  snippet: { kurz: '{ }', klassen: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  keyword: { kurz: 'kw', klassen: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  methode: { kurz: '.m', klassen: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  jsx: { kurz: '</>', klassen: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  variable: { kurz: 'x', klassen: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
  tailwind: { kurz: 'tw', klassen: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
}

function VorschlagsListe({
  id,
  popup,
  beiAuswahl,
}: {
  id: string
  popup: Popup
  beiAuswahl: (v: Vorschlag) => void
}) {
  const t = useTexte()
  const listeRef = useRef<HTMLUListElement>(null)
  const aktiv = popup.treffer[popup.auswahl]
  const vorschau = (aktiv.einfuegen ?? aktiv.label).replace('$0', '…')

  // Den ausgewählten Eintrag beim Blättern mit den Pfeiltasten sichtbar halten.
  useEffect(() => {
    listeRef.current?.children[popup.auswahl]?.scrollIntoView({ block: 'nearest' })
  }, [popup.auswahl])

  return (
    <div
      // mousedown würde den Fokus aus dem Textfeld nehmen und das Popup schließen
      onMouseDown={(e) => e.preventDefault()}
      data-vorschlaege
      className="fixed z-50 overflow-hidden rounded-lg border border-slate-200 bg-white font-mono text-[13px] shadow-xl dark:border-slate-700 dark:bg-slate-900"
      style={{
        left: popup.x,
        width: POPUP_BREITE,
        ...(popup.oben ? { bottom: window.innerHeight - popup.y } : { top: popup.y }),
      }}
    >
      <ul ref={listeRef} id={id} role="listbox" aria-label={t.vorschlaege} className="max-h-52 overflow-y-auto py-1">
        {popup.treffer.map((v, i) => {
          const stil = ART_STIL[v.art]
          return (
            <li
              key={v.label + v.art}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === popup.auswahl}
              onClick={() => beiAuswahl(v)}
              className={`flex cursor-pointer items-center gap-2 px-2 py-1 ${
                i === popup.auswahl ? 'bg-brand-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {v.farbe ? (
                // Wie in VS Code: ein Farbfeld statt des Kürzels. Das Schachbrett zeigt Transparenz.
                <span className="flex w-8 shrink-0 justify-center">
                  <span
                    aria-hidden
                    className="size-3.5 rounded-sm border border-black/15 dark:border-white/25"
                    style={{ background: `linear-gradient(${v.farbe}, ${v.farbe}), repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 6px 6px` }}
                  />
                </span>
              ) : (
                <span className={`w-8 shrink-0 rounded px-1 text-center text-[10px] font-semibold ${stil.klassen}`}>
                  {stil.kurz}
                </span>
              )}
              <span className="truncate">{v.label}</span>
            </li>
          )
        })}
      </ul>
      <div className="space-y-1 border-t border-slate-200 px-3 py-2 font-sans text-xs dark:border-slate-700">
        {aktiv.info && <p className="text-slate-700 dark:text-slate-200">{aktiv.info}</p>}
        {aktiv.css && (
          <pre className="max-h-40 overflow-auto font-mono text-[11px] break-all whitespace-pre-wrap text-slate-600 dark:text-slate-300">{aktiv.css}</pre>
        )}
        {vorschau !== aktiv.label && (
          <pre className="max-h-16 overflow-hidden font-mono text-[11px] whitespace-pre text-slate-500 dark:text-slate-400">
            {vorschau}
          </pre>
        )}
        <p className="text-[11px] text-slate-400">{t.vorschlagHinweis}</p>
      </div>
    </div>
  )
}
