import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Icon } from '../components/Icon'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { useDelayedCheck } from './editorChecks'
import type { TestErgebnis } from './jsSandbox'
import { Fehlerkasten, Konsole, Rahmen, Testergebnisse, Typfehlerliste, type Zeile } from './Rahmen'
import { formatieren, kompilieren, type Protokoll } from './reactKompilieren'
import { reactTestsAusfuehren } from './reactTests'
import { tailwindFuerVorschau } from './tailwind'
import type { ReactProps } from './TryIt'
import { typenPruefen } from './typpruefung'
import { useEditor } from './useEditor'

/** React - the JSX is compiled and rendered into a root of its own (see reactKompilieren.ts). */

export function TryItReact(props: ReactProps) {
  const { id, tests, typen } = props
  const { sprache } = useSprache()
  const t = useTexte()
  const { code, rahmen } = useEditor(props)

  // Typprüfung kurz nach dem letzten Tastendruck - wie die roten Schlangenlinien in VS Code.
  const typfehler = useDelayedCheck(code, typen ? typenPruefen : null)
  const [zeilen, setZeilen] = useState<Zeile[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<Root | null>(null)
  const laufRef = useRef(0)
  // Stoppt die Timer des vorherigen Laufs (siehe kompilieren).
  const aufraeumenRef = useRef(() => {})

  // Logs, die WÄHREND des Renderns der Vorschau entstehen, dürfen nicht sofort
  // State dieser Komponente setzen - deshalb sammeln und kurz danach übernehmen.
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

  // Übersetzt den Code und rendert ihn in die Vorschau-Wurzel (setzt selbst keinen State).
  const rendern = useCallback(
    async (quelltext: string) => {
      const nummer = ++laufRef.current
      puffer.current = []
      const root = rootRef.current
      if (!root) return

      try {
        // Tailwind-Klassen aus dem Editor sollen auch wirken, wenn sie sonst nirgends im Projekt stehen.
        tailwindFuerVorschau(quelltext)
        const { App, aufraeumen } = await kompilieren(quelltext, protokoll, sprache)
        // Inzwischen neu gestartet oder die Wurzel wurde abgebaut? Dann verwerfen.
        if (nummer !== laufRef.current || rootRef.current !== root) return aufraeumen()
        aufraeumenRef.current()
        aufraeumenRef.current = aufraeumen
        // key={nummer}: jeder Lauf startet mit frischem State.
        // flushSync: the old preview is gone before the tests start (see ausfuehren).
        flushSync(() =>
          root.render(
            <ErrorBoundary key={nummer} fallback={(f) => <Fehlerkasten text={`${f.name}: ${f.message}`} titel={t.fehlerBeimRendern} />}>
              <App />
            </ErrorBoundary>,
          ),
        )
      } catch (fehler) {
        if (nummer !== laufRef.current || rootRef.current !== root) return
        root.render(<Fehlerkasten text={formatieren(fehler)} titel={t.nichtUebersetzbar} />)
      }
    },
    [protokoll, sprache, t],
  )

  // Tests laufen nur auf Knopfdruck (nicht beim ersten Anzeigen) - wie bei den JS-Übungen.
  const [ergebnisse, setErgebnisse] = useState<TestErgebnis[] | null>(null)
  const [testsLaufen, setTestsLaufen] = useState(false)
  const testLaufRef = useRef(0)

  function ausfuehren(quelltext: string) {
    setZeilen([])
    const vorschau = rendern(quelltext)
    if (!tests?.length) return

    const nummer = ++testLaufRef.current
    setErgebnisse(null)
    setTestsLaufen(true)
    // The tests start once the new preview is in place. Before that, the old one may still be
    // running - and a test that mocks fetch would count its requests, too.
    const testlauf = vorschau.then(() => reactTestsAusfuehren(quelltext, tests, sprache))
    void Promise.all([testlauf, typen ? typenPruefen(quelltext) : null]).then(
      ([neu, fehler]) => {
        if (nummer !== testLaufRef.current) return // inzwischen neu gestartet
        // Bei TypeScript-Übungen gehören saubere Typen dazu - als zusätzlicher Test.
        if (fehler) {
          const erster = fehler[0]
          neu = [
            ...neu,
            {
              name: t.keineTypfehler,
              ok: fehler.length === 0,
              meldung: erster ? `${t.typfehlerZeile(erster.zeile)}: ${erster.text}` : '',
            },
          ]
        }
        setErgebnisse(neu)
        setTestsLaufen(false)
      },
    )
  }

  // useEffectEvent liest immer den aktuellen `code`, ohne selbst eine Dependency zu sein.
  const ersterLauf = useEffectEvent(() => void rendern(code))

  // Eigene React-Wurzel für die Vorschau: Fehler und State der Lernenden bleiben
  // vom Rest der Seite getrennt, und es gibt kein doppeltes StrictMode-Rendern.
  useEffect(() => {
    const element = document.createElement('div')
    containerRef.current!.appendChild(element)
    // Formulare ohne eigenen Handler dürfen nicht die ganze Lernseite neu laden.
    // Der Listener liegt außerhalb der React-Wurzel und läuft deshalb nach deren Handlern.
    const keinNeuladen = (e: Event) => e.preventDefault()
    containerRef.current!.addEventListener('submit', keinNeuladen)
    const root = createRoot(element, {
      onCaughtError: (fehler) => protokoll('error', formatieren(fehler)),
    })
    rootRef.current = root
    ersterLauf()

    const container = containerRef.current!
    return () => {
      container.removeEventListener('submit', keinNeuladen)
      rootRef.current = null
      const aufraeumen = aufraeumenRef.current
      // Nicht synchron während Reacts eigenem Commit abbauen.
      setTimeout(() => {
        root.unmount()
        element.remove()
        aufraeumen()
      })
    }
  }, [protokoll])

  return (
    <Rahmen
      {...rahmen}
      art={typen ? 'TypeScript' : 'React'}
      laeuft={testsLaufen}
      ausfuehren={(c) => ausfuehren(c ?? code)}
      markierungen={typfehler ?? undefined}
    >
      {typen && <Typfehlerliste fehler={typfehler} />}
      <div className="px-4 pt-2 text-2xs tracking-wider text-slate-500 uppercase dark:text-slate-400">{t.vorschau}</div>
      <div ref={containerRef} data-vorschau className="vorschau min-h-16 px-4 pt-1 pb-4" />
      {tests?.length ? (
        <div className="border-t border-slate-200 dark:border-slate-800">
          {ergebnisse ? (
            <Testergebnisse id={id} ergebnisse={ergebnisse} />
          ) : (
            <p className="flex items-center gap-1.5 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              {testsLaufen && <Icon name="uhr" className="size-3.5" />}
              {testsLaufen ? t.testsLaufen : t.reactUebungStart}
            </p>
          )}
        </div>
      ) : null}
      <Konsole zeilen={zeilen} />
    </Rahmen>
  )
}
