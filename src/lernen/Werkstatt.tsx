import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Icon } from '../components/Icon'
import { KapitelChip } from '../components/Verweis'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useSprache, useTexte, type Zweisprachig } from '../i18n/SpracheContext'
import { CodeEditor } from './CodeEditor'
import { hash } from './quelltext'
import { tailwindFuerVorschau } from './tailwind'
import { formatieren, kompilierenProjekt, type Protokoll } from './reactKompilieren'
import { useDelayedCheck } from './editorChecks'
import { typenPruefenProjekt } from './typpruefung'
import { Fehlerkasten, Konsole, Typfehlerliste, type Zeile } from './Rahmen'
import { focusableWhenScrolling } from '../components/scrollFocus'

/**
 * Werkstatt: ein ganzes React-Projekt aus mehreren Dateien.
 *
 * Links die Dateien, in der Mitte der Editor der gewählten Datei, daneben bzw.
 * darunter die laufende App. Nach jeder Änderung wird das Projekt nach einer
 * kurzen Pause neu übersetzt (siehe kompilierenProjekt). Lässt sich der Code
 * nicht übersetzen, läuft die App im letzten funktionierenden Stand weiter.
 */

export type WerkstattDatei = {
  /** Pfad im Projekt, z. B. "components/Button.jsx" - so wird er auch importiert. */
  pfad: string
  code: string
  /** Was in dieser Datei passiert. */
  text: Zweisprachig
  /** Kapitel, in denen die verwendeten Konzepte erklärt werden. */
  kapitel: string[]
}

type Props = {
  /** Schlüssel für den gespeicherten Code. */
  id: string
  titel: string
  dateien: WerkstattDatei[]
  /** Datei mit dem default-Export App. */
  einstieg: string
  /** TypeScript-Projekt: zusätzlich echte Typprüfung für die gerade offene Datei. */
  typen?: boolean
}

const PAUSE_MS = 700

export function Werkstatt({ id, titel, dateien, einstieg, typen }: Props) {
  const t = useTexte()
  const { sprache } = useSprache()

  const startCode = useMemo(() => Object.fromEntries(dateien.map((d) => [d.pfad, d.code])), [dateien])
  const [gespeichert, setGespeichert] = useLocalStorage<Record<string, string>>(
    `werkstatt:${id}:${hash(JSON.stringify(startCode))}`,
    startCode,
  )
  // Fehlt eine Datei im Gespeicherten, gilt ihr Startcode.
  const code = useMemo(() => ({ ...startCode, ...gespeichert }), [startCode, gespeichert])

  const [aktiv, setAktiv] = useState(einstieg)
  const [vollbild, setVollbild] = useState(false)
  const [zeilen, setZeilen] = useState<Zeile[]>([])
  const [uebersetzungsfehler, setUebersetzungsfehler] = useState<string | null>(null)

  const aktiveDatei = dateien.find((d) => d.pfad === aktiv) ?? dateien[0]
  const geaendert = (pfad: string) => code[pfad] !== startCode[pfad]
  const irgendwasGeaendert = dateien.some((d) => geaendert(d.pfad))

  // Dateien nach Ordnern gruppieren - in der Reihenfolge, in der sie vorkommen.
  const ordner = useMemo(() => {
    const gruppen = new Map<string, WerkstattDatei[]>()
    for (const datei of dateien) {
      const name = datei.pfad.includes('/') ? datei.pfad.slice(0, datei.pfad.lastIndexOf('/')) : ''
      gruppen.set(name, [...(gruppen.get(name) ?? []), datei])
    }
    return [...gruppen]
  }, [dateien])

  // --- Vorschau: eigene React-Wurzel, wie bei TryIt ---------------------------------------
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<Root | null>(null)
  const laufRef = useRef(0)
  const aufraeumenRef = useRef(() => {})

  // Logs während des Renderns sammeln und kurz danach übernehmen (siehe TryIt).
  const puffer = useRef<Zeile[]>([])
  const protokoll = useCallback<Protokoll>((typ, text) => {
    puffer.current.push({ typ, text })
    if (puffer.current.length === 1) {
      setTimeout(() => {
        const neu = puffer.current
        puffer.current = []
        setZeilen((alt) => [...alt, ...neu].slice(-200))
      })
    }
  }, [])

  const rendern = useCallback(
    async (quellen: Record<string, string>) => {
      const nummer = ++laufRef.current
      const root = rootRef.current
      if (!root) return

      try {
        const projekt = Object.entries(quellen).map(([pfad, code]) => ({ pfad, code }))
        tailwindFuerVorschau(Object.values(quellen).join('\n'))
        const { App, aufraeumen } = await kompilierenProjekt(projekt, einstieg, protokoll, sprache)
        if (nummer !== laufRef.current || rootRef.current !== root) return aufraeumen()
        aufraeumenRef.current()
        aufraeumenRef.current = aufraeumen
        puffer.current = []
        setZeilen([])
        setUebersetzungsfehler(null)
        root.render(
          <ErrorBoundary key={nummer} fallback={(f) => <Fehlerkasten text={`${f.name}: ${f.message}`} titel={t.fehlerBeimRendern} />}>
            <App />
          </ErrorBoundary>,
        )
      } catch (fehler) {
        if (nummer !== laufRef.current || rootRef.current !== root) return
        // Die alte App bleibt stehen - nur der Fehler wird angezeigt.
        setUebersetzungsfehler(formatieren(fehler))
      }
    },
    [einstieg, protokoll, sprache, t],
  )

  const ersterLauf = useEffectEvent(() => void rendern(code))

  useEffect(() => {
    const container = containerRef.current!
    const element = document.createElement('div')
    element.style.height = '100%'
    container.appendChild(element)
    const keinNeuladen = (e: Event) => e.preventDefault()
    container.addEventListener('submit', keinNeuladen)
    const root = createRoot(element, {
      onCaughtError: (fehler) => protokoll('error', formatieren(fehler)),
    })
    rootRef.current = root
    // oxlint-disable-next-line react/set-state-in-effect -- rendern setzt State erst nach dem await, nicht synchron.
    ersterLauf()

    return () => {
      container.removeEventListener('submit', keinNeuladen)
      rootRef.current = null
      const aufraeumen = aufraeumenRef.current
      setTimeout(() => {
        root.unmount()
        element.remove()
        aufraeumen()
      })
    }
  }, [protokoll])

  // Nach einer Tipp-Pause automatisch neu übersetzen. Der erste Lauf passiert oben.
  const letzterCode = useRef(code)
  useEffect(() => {
    if (letzterCode.current === code) return
    letzterCode.current = code
    const timer = setTimeout(() => void rendern(code), PAUSE_MS)
    return () => clearTimeout(timer)
  }, [code, rendern])

  // Typprüfung der offenen Datei - kurz nach dem letzten Tastendruck, wie in VS Code.
  const pruefen = useCallback(
    async (dateienJetzt: Record<string, string>) => {
      const projekt = Object.entries(dateienJetzt).map(([pfad, quelltext]) => ({ pfad, code: quelltext }))
      return { pfad: aktiv, fehler: await typenPruefenProjekt(projekt, aktiv) }
    },
    [aktiv],
  )
  const typpruefung = useDelayedCheck(code, typen ? pruefen : null)
  // A result for another file does not apply to the open one.
  const typfehler = typpruefung?.pfad === aktiv ? typpruefung.fehler : null

  // Im Vollbild soll die Lernseite dahinter nicht mitscrollen.
  useEffect(() => {
    if (!vollbild) return
    const vorher = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = vorher
    }
  }, [vollbild])

  function aendern(pfad: string, neu: string) {
    setGespeichert((alt) => ({ ...startCode, ...alt, [pfad]: neu }))
  }

  // --- Oberfläche ---------------------------------------------------------------------------
  const knopf =
    'inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800'

  return (
    <div
      className={
        vollbild
          ? 'fixed inset-0 z-50 flex flex-col overflow-auto bg-white lg:overflow-hidden dark:bg-slate-900'
          : 'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
      }
    >
      {/* Kopfzeile */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="werkzeug" className="size-4 text-brand-600 dark:text-brand-400" />
          <span>
            {t.werkstatt}
            <span className="font-normal text-slate-500 dark:text-slate-400"> · {titel}</span>
          </span>
        </h3>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={() => setGespeichert(startCode)} disabled={!irgendwasGeaendert} className={knopf}>
            <Icon name="zuruecksetzen" className="size-3.5" />
            {t.allesZuruecksetzen}
          </button>
          <button onClick={() => setVollbild((v) => !v)} className={knopf}>
            <Icon name={vollbild ? 'verkleinern' : 'vergroessern'} className="size-3.5" />
            {vollbild ? t.vollbildBeenden : t.vollbild}
          </button>
        </div>
      </div>

      <div
        className={
          vollbild
            ? 'grid min-h-0 flex-1 lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]'
            : 'grid md:grid-cols-[12rem_minmax(0,1fr)]'
        }
      >
        {/* Dateien */}
        <nav
          aria-label={t.dateien}
          className="border-b border-slate-200 bg-slate-50 md:border-r md:border-b-0 lg:overflow-y-auto dark:border-slate-800 dark:bg-slate-950/40"
        >
          <label className="block p-3 md:hidden">
            <span className="sr-only">{t.dateiWaehlen}</span>
            <select
              value={aktiv}
              onChange={(e) => setAktiv(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {dateien.map((d) => (
                <option key={d.pfad} value={d.pfad}>
                  {d.pfad}
                  {geaendert(d.pfad) ? ` • ${t.geaendert}` : ''}
                </option>
              ))}
            </select>
          </label>
          <div className="hidden py-2 md:block">
            <p className="px-3 pb-1 text-2xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">{t.dateien}</p>
            {ordner.map(([name, inhalt]) => (
              <div key={name}>
                {name && (
                  <p className="flex items-center gap-1.5 px-3 pt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                    <Icon name="ordner" className="size-3.5" />
                    {name}
                  </p>
                )}
                <ul>
                  {inhalt.map((d) => {
                    const dateiname = d.pfad.slice(d.pfad.lastIndexOf('/') + 1)
                    return (
                      <li key={d.pfad}>
                        <button
                          onClick={() => setAktiv(d.pfad)}
                          aria-current={d.pfad === aktiv ? 'true' : undefined}
                          title={d.pfad}
                          className={`flex w-full items-center gap-1.5 py-1 pr-3 text-left font-mono text-xs transition ${
                            name ? 'pl-7' : 'pl-3'
                          } ${
                            d.pfad === aktiv
                              ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{dateiname}</span>
                          {geaendert(d.pfad) && (
                            <span className="ml-auto size-1.5 shrink-0 rounded-full bg-amber-500" title={t.geaendert} />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Editor */}
        <div className={vollbild ? 'flex min-w-0 flex-col lg:min-h-0 lg:border-r lg:border-slate-200 lg:dark:border-slate-800' : 'min-w-0'}>
          <div className="space-y-1.5 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold">{aktiveDatei.pfad}</span>
              <button
                onClick={() => aendern(aktiveDatei.pfad, startCode[aktiveDatei.pfad])}
                disabled={!geaendert(aktiveDatei.pfad)}
                className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 disabled:opacity-40 dark:text-slate-400 dark:hover:text-white"
              >
                <Icon name="zuruecksetzen" className="size-3" />
                {t.dateiZuruecksetzen}
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{aktiveDatei.text[sprache]}</p>
            {aktiveDatei.kapitel.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                {t.mehrDazu}
                {aktiveDatei.kapitel.map((k) => (
                  <KapitelChip key={k} id={k} />
                ))}
              </div>
            )}
          </div>
          <div className={vollbild ? 'min-h-0 flex-1 overflow-auto' : ''}>
            <CodeEditor
              key={aktiveDatei.pfad}
              wert={code[aktiveDatei.pfad]}
              beiAenderung={(neu) => aendern(aktiveDatei.pfad, neu)}
              beiAusfuehren={() => void rendern(code)}
              label={`${t.codeEditor}: ${aktiveDatei.pfad}`}
              sprache="react"
              maxZeilen={vollbild ? 1000 : 26}
              markierungen={typfehler ?? undefined}
            />
          </div>
          {typen && <Typfehlerliste fehler={typfehler} />}
          <p className="border-t border-slate-200 px-4 py-1.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {t.werkstattHinweis}
          </p>
        </div>

        {/* Laufende App */}
        <div
          className={
            vollbild
              ? 'flex min-w-0 flex-col border-t border-slate-200 lg:min-h-0 lg:border-t-0 dark:border-slate-800'
              : 'border-t border-slate-200 md:col-span-2 dark:border-slate-800'
          }
        >
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
            <span className="flex gap-1" aria-hidden>
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="flex-1 truncate rounded-md bg-white px-2 py-0.5 text-center text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              {t.liveApp} · {titel}
            </span>
          </div>
          {uebersetzungsfehler && (
            <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
              <p className="flex items-center gap-1.5 font-semibold">
                <Icon name="kreisKreuz" className="size-4" />
                {t.nichtUebersetzbar}
              </p>
              <pre className="mt-1 font-mono text-xs whitespace-pre-wrap">{uebersetzungsfehler}</pre>
              <p className="mt-1 text-xs opacity-80">{t.letzterStand}</p>
            </div>
          )}
          <div ref={containerRef} data-vorschau className={vollbild ? 'h-144 lg:h-auto lg:min-h-0 lg:flex-1' : 'h-144'} />
          <div ref={focusableWhenScrolling} className={vollbild ? 'max-h-40 shrink-0 overflow-y-auto' : 'max-h-40 overflow-y-auto'}>
            <Konsole zeilen={zeilen} />
          </div>
        </div>
      </div>
    </div>
  )
}
