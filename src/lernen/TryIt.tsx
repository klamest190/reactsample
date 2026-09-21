import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useTheme } from '../context/ThemeContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { CodeBlock } from './CodeBlock'
import { CodeEditor, type EditorSteuerung } from './CodeEditor'
import { Text } from './Text'
import { sandboxDokument, type ReactTest, type SandboxNachricht, type Test, type TestErgebnis } from './jsSandbox'
import { reactTestsAusfuehren } from './reactTests'
import { formatieren, kompilieren, type Protokoll } from './reactKompilieren'
import { hash } from './quelltext'
import { tailwindFuerVorschau } from './tailwind'
import { typenPruefen, type Typfehler } from './typpruefung'
import { tsTypenPruefen, tsUebersetzen, typErgebnisse, type TypTest } from './tsLauf'
import type { JavaLauf } from '../java'
import { testsAusfuehren, type TestBericht } from './testLauf'
import type { ProjektDatei } from './reactKompilieren'
import type { Zweisprachig } from '../i18n/SpracheContext'

/**
 * "Probier's selbst" - ein Editor mit Ausführen-Knopf.
 *
 *   <TryIt id="…" code={…} />                  JavaScript, Ausgabe = Konsole
 *   <TryIt id="…" code={…} tests={[…]} />      JavaScript-Übung mit automatischer Prüfung
 *   <TryIt id="…" code={…} vorschau />         JavaScript mit sichtbarem <div id="app">
 *   <TryIt id="…" code={…} modus="ts" />       TypeScript mit Konsole und Typprüfung (Teil 2), siehe tsLauf.ts
 *   <TryIt id="…" code={…} modus="react" />    JSX, gerendert wird die Komponente App
 *   <TryIt id="…" code={…} modus="react" typen />  TSX mit echter Typprüfung
 *   <TryIt id="…" code={…} modus="test" />     Eigene Tests (Vitest + Testing Library), siehe testLauf.ts
 *   <TryIt id="…" code={…} modus="java" />     Java, ausgeführt von src/java/ (Teil 7)
 *
 * Der Code wird pro `id` im localStorage gespeichert, damit Eingaben einen
 * Kapitelwechsel überleben.
 */

type Gemeinsam = {
  /** Eindeutig im ganzen Kurs - Schlüssel für den gespeicherten Code. */
  id: string
  titel?: string
  /** Aufgabenstellung über dem Editor. */
  aufgabe?: ReactNode
  code: string
  loesung?: string
  /** Gestufte Tipps, die nacheinander vor der Musterlösung aufgedeckt werden können. */
  tipps?: { de: string[]; en: string[] }
  /** Playground: Zugriff auf den Editor von außen (Bausteine einfügen), eigene Überschrift, größerer Editor. */
  editorRef?: Ref<EditorSteuerung>
  kopf?: string
  maxZeilen?: number
}

type JsProps = Gemeinsam & {
  /** 'ts': Typen werden vor dem Ausführen entfernt und nebenher geprüft. */
  modus?: 'js' | 'ts'
  tests?: Test[]
  /** Nur bei 'ts': Typ-Tests einer Übung (siehe tsLauf.ts). */
  typTests?: TypTest[]
  /** Unsichtbarer Code, der vorher läuft (z. B. Hilfsfunktionen oder Testdaten). */
  vorbereitung?: string
  /** Zeigt das Dokument des iframes an, damit DOM-Code sichtbar wird. */
  vorschau?: boolean
}

type ReactProps = Gemeinsam & {
  modus: 'react'
  /** Automatische Prüfung, siehe reactTests.ts */
  tests?: ReactTest[]
  /** TypeScript: zusätzlich echte Typprüfung (siehe typpruefung.ts). Bei Übungen zählt „keine Typfehler“ als Test. */
  typen?: boolean
}

type TestProps = Gemeinsam & {
  modus: 'test'
  /** Dateien, die der Testcode importieren kann (z. B. die Komponente) - werden nur lesbar angezeigt. */
  dateien?: ProjektDatei[]
  /** Übung: fehlerhafte Fassungen der Dateien. Die Tests der Lernenden müssen jede davon erkennen. */
  varianten?: { name: Zweisprachig; dateien: ProjektDatei[] }[]
}

type JavaProps = Gemeinsam & {
  modus: 'java'
  /** Wie bei JS: ein Ausdruck, der nach `main` ausgewertet wird - nur eben in Java. */
  tests?: Test[]
  /** Unsichtbare Hilfsklassen, die hinter den Code gehängt werden (für Tests). */
  vorbereitung?: string
}

export function TryIt(props: JsProps | ReactProps | TestProps | JavaProps) {
  if (props.modus === 'react') return <TryItReact {...props} />
  if (props.modus === 'test') return <TryItTest {...props} />
  if (props.modus === 'java') return <TryItJava {...props} />
  return <TryItJs {...props} />
}

// ---------------------------------------------------------------------------
// Gemeinsame Hülle
// ---------------------------------------------------------------------------

export type Zeile = { typ: 'log' | 'info' | 'warn' | 'error' | 'fehler'; text: string }

const ABZEICHEN = {
  JavaScript: { text: 'JS', klassen: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  Java: { text: 'JAVA', klassen: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  React: { text: 'JSX', klassen: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' },
  TypeScript: { text: 'TSX', klassen: 'bg-blue-600 text-white dark:bg-blue-500' },
  TS: { text: 'TS', klassen: 'bg-blue-600 text-white dark:bg-blue-500' },
  Test: { text: 'TEST', klassen: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
}

function useGespeicherterCode(id: string, startCode: string) {
  return useLocalStorage(`tryit:${id}:${hash(startCode)}`, startCode)
}

function Rahmen({
  art,
  titel,
  aufgabe,
  code,
  setCode,
  startCode,
  loesung,
  tipps,
  ausfuehren,
  laeuft,
  markierungen,
  oben,
  editorRef,
  kopf,
  maxZeilen,
  children,
}: {
  editorRef?: Ref<EditorSteuerung>
  kopf?: string
  maxZeilen?: number
  art: keyof typeof ABZEICHEN
  markierungen?: Typfehler[]
  /** Inhalt zwischen Aufgabe und Editor, z. B. nur lesbare Dateien. */
  oben?: ReactNode
  titel?: string
  aufgabe?: ReactNode
  code: string
  setCode: (code: string) => void
  startCode: string
  loesung?: string
  tipps?: { de: string[]; en: string[] }
  ausfuehren: (code?: string) => void
  laeuft?: boolean
  children: ReactNode
}) {
  const t = useTexte()
  const { sprache } = useSprache()
  const [zeigeLoesung, setZeigeLoesung] = useState(false)
  // Wie viele Tipps schon aufgedeckt sind - immer der Reihe nach.
  const [tippAnzahl, setTippAnzahl] = useState(0)
  const tippListe = tipps?.[sprache] ?? []
  const istUebung = Boolean(aufgabe)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <h3 className="text-sm font-semibold">
          {kopf ?? (istUebung ? t.uebung : t.probierSelbst)}
          {titel && <span className="font-normal text-slate-500 dark:text-slate-400"> · {titel}</span>}
        </h3>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${ABZEICHEN[art].klassen}`}>
          {ABZEICHEN[art].text}
        </span>
      </div>

      {aufgabe && (
        <div className="border-b border-slate-200 bg-brand-50 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-brand-700/15 dark:text-slate-200">
          {aufgabe}
        </div>
      )}

      {oben}

      <CodeEditor
        wert={code}
        beiAenderung={setCode}
        beiAusfuehren={(c) => ausfuehren(c)}
        label={`${t.codeEditor}${titel ? ': ' + titel : ''}`}
        sprache={art === 'JavaScript' ? 'js' : art === 'Java' ? 'java' : art === 'TS' ? 'ts' : 'react'}
        markierungen={markierungen}
        steuerung={editorRef}
        maxZeilen={maxZeilen}
      />

      <div className="flex flex-wrap items-center gap-2 border-y border-slate-200 px-4 py-2 dark:border-slate-800">
        <button
          onClick={() => ausfuehren()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          {t.ausfuehren}
        </button>
        <button
          onClick={() => {
            setCode(startCode)
            ausfuehren(startCode)
          }}
          disabled={code === startCode}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {t.zuruecksetzen}
        </button>
        {tippListe.length > 0 && (
          <button
            onClick={() => setTippAnzahl((n) => Math.min(n + 1, tippListe.length))}
            disabled={tippAnzahl >= tippListe.length}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-900 transition hover:bg-amber-100 disabled:opacity-40 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            {t.tipp(Math.min(tippAnzahl + 1, tippListe.length), tippListe.length)}
          </button>
        )}
        {loesung && (
          <button
            onClick={() => setZeigeLoesung((z) => !z)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {zeigeLoesung ? t.loesungVerbergen : t.loesungZeigen}
          </button>
        )}
        <span className="ml-auto hidden text-xs text-slate-400 sm:inline">
          {laeuft ? t.laeuft : t.tastenHinweis}
        </span>
      </div>

      {tippAnzahl > 0 && (
        <ol className="space-y-1 border-b border-slate-200 bg-amber-50/60 px-4 py-3 text-sm dark:border-slate-800 dark:bg-amber-950/30">
          {tippListe.slice(0, tippAnzahl).map((tipp, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0 font-semibold text-amber-700 dark:text-amber-400">💡 {i + 1}.</span>
              <span>
                <Text text={tipp} />
              </span>
            </li>
          ))}
        </ol>
      )}

      {zeigeLoesung && loesung && (
        <div className="space-y-2 border-b border-slate-200 p-4 dark:border-slate-800">
          <CodeBlock code={loesung} titel={t.musterloesung} />
          <button
            onClick={() => {
              setCode(loesung)
              ausfuehren(loesung)
            }}
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {t.loesungUebernehmen}
          </button>
        </div>
      )}

      {children}
    </div>
  )
}

export function Konsole({ zeilen, leerText }: { zeilen: Zeile[]; leerText?: string }) {
  const t = useTexte()
  const farben = {
    log: 'text-slate-100',
    info: 'text-sky-300',
    warn: 'text-amber-300',
    error: 'text-rose-300',
    fehler: 'text-rose-300',
  }

  if (zeilen.length === 0 && !leerText) return null

  return (
    <div className="bg-slate-900 px-4 py-3 font-mono text-[13px] leading-5 dark:bg-black/40">
      <div className="mb-1 text-[11px] tracking-wider text-slate-500 uppercase">{t.konsole}</div>
      {zeilen.length === 0 ? (
        <div className="text-slate-500 italic">{leerText}</div>
      ) : (
        zeilen.map((z, i) => (
          <div key={i} className={`wrap-break-word whitespace-pre-wrap ${farben[z.typ]}`}>
            {z.typ === 'fehler' ? '⛔ ' : z.typ === 'warn' ? '⚠ ' : '› '}
            {z.text}
          </div>
        ))
      )}
    </div>
  )
}

function Testergebnisse({ ergebnisse }: { ergebnisse: TestErgebnis[] | null }) {
  const t = useTexte()
  if (!ergebnisse) return null
  const bestanden = ergebnisse.filter((e) => e.ok).length
  const alle = bestanden === ergebnisse.length

  return (
    <div className="space-y-1.5 px-4 py-3 text-sm">
      <p
        className={`font-semibold ${alle ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}
      >
        {alle
          ? t.alleTestsBestanden(ergebnisse.length)
          : t.testsBestanden(bestanden, ergebnisse.length)}
      </p>
      <ul className="space-y-1">
        {ergebnisse.map((e) => (
          <li key={e.name} className="flex gap-2">
            <span>{e.ok ? '✅' : '❌'}</span>
            <span>
              {e.name}
              {e.meldung && (
                <span className="block font-mono text-xs text-rose-600 dark:text-rose-400">
                  {e.meldung}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// JavaScript im iframe
// ---------------------------------------------------------------------------

function TryItJs({ id, titel, aufgabe, code: startCode, loesung, tipps, tests, typTests, vorbereitung, vorschau, modus, ...playground }: JsProps) {
  const { theme } = useTheme()
  const { sprache } = useSprache()
  const t = useTexte()
  const [code, setCode] = useGespeicherterCode(id, startCode)
  const ts = modus === 'ts'
  const istUebung = Boolean(tests || typTests)

  // Ein Lauf = fortlaufende Nummer + der (bei TypeScript schon übersetzte) Code zum Zeitpunkt des Klicks.
  // JS-Beispiele laufen sofort (Startwert), Übungen erst auf Knopfdruck (null).
  // TypeScript muss erst übersetzt werden - das geht nur asynchron, deshalb startet es im Effekt unten.
  const [lauf, setLauf] = useState<{ nummer: number; code: string; dunkel: boolean } | null>(() =>
    istUebung || ts ? null : { nummer: 1, code, dunkel: theme === 'dark' },
  )

  // TypeScript: Typprüfung kurz nach dem letzten Tastendruck (wie im React-Modus mit `typen`).
  const [typpruefung, setTyppruefung] = useState<{ code: string; fehler: Typfehler[] } | null>(null)
  useEffect(() => {
    if (!ts) return
    const zeitgeber = setTimeout(() => {
      void tsTypenPruefen(code).then(({ imCode }) => setTyppruefung({ code, fehler: imCode }))
    }, 700)
    return () => clearTimeout(zeitgeber)
  }, [code, ts])
  // Bis das neue Ergebnis da ist, bleibt das letzte stehen - sonst flackert die Anzeige bei jedem Tastendruck.
  const typfehler = typpruefung?.fehler ?? null
  // Übungen: Typprüfung samt Typ-Tests als zusätzliche Testergebnisse, pro Lauf.
  const [typTestErgebnisse, setTypTestErgebnisse] = useState<TestErgebnis[] | null>(null)
  const uebersetzungRef = useRef(0)
  const [zeilen, setZeilen] = useState<Zeile[]>([])
  const [ergebnisse, setErgebnisse] = useState<TestErgebnis[] | null>(null)
  const [laeuft, setLaeuft] = useState(!istUebung)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const testIframeRef = useRef<HTMLIFrameElement>(null)
  // Tests klicken und tippen im Dokument. Bei sichtbarer Vorschau laufen sie deshalb in
  // einem zweiten, unsichtbaren iframe - sonst würde die Vorschau von den Tests verändert.
  const getrennteTests = Boolean(vorschau && tests)

  // Die iframe-Dokumente sind abgeleitete Werte.
  const [dokument, testDokument] = useMemo(() => {
    if (!lauf) return [null, null]
    // Testnamen sind zweisprachig - in die Sandbox geht nur der Text der aktuellen Sprache.
    const testsInSprache = tests?.map((t) => ({ ...t, name: typeof t.name === 'string' ? t.name : t.name[sprache] }))
    const basis = { lauf: lauf.nummer, code: lauf.code, vorbereitung, dunkel: lauf.dunkel, sprache }
    return getrennteTests
      ? [sandboxDokument(basis), sandboxDokument({ ...basis, tests: testsInSprache })]
      : [sandboxDokument({ ...basis, tests: testsInSprache }), null]
  }, [lauf, vorbereitung, tests, sprache, getrennteTests])

  function ausfuehren(quelltext: string) {
    setZeilen([])
    setErgebnisse(null)
    setLaeuft(true)
    const dunkel = theme === 'dark'
    if (!ts) {
      setLauf((alt) => ({ nummer: (alt?.nummer ?? 0) + 1, code: quelltext, dunkel }))
      return
    }
    setTypTestErgebnisse(null)
    tsStarten(quelltext, dunkel)
  }

  // TypeScript: prüfen und übersetzen, danach laufen lassen. Setzt State nur asynchron.
  function tsStarten(quelltext: string, dunkel: boolean) {
    const nummer = ++uebersetzungRef.current
    if (istUebung) {
      void tsTypenPruefen(quelltext, typTests).then((pruefung) => {
        if (nummer === uebersetzungRef.current) setTypTestErgebnisse(typErgebnisse(pruefung, typTests ?? [], sprache, t))
      })
    }
    void tsUebersetzen(quelltext).then((ergebnis) => {
      if (nummer !== uebersetzungRef.current) return // inzwischen neu gestartet
      if ('fehler' in ergebnis) {
        // Syntaxfehler: Es gibt kein JavaScript, das laufen könnte.
        setLauf(null)
        setZeilen([{ typ: 'fehler', text: ergebnis.fehler }])
        setLaeuft(false)
        return
      }
      setLauf((alt) => ({ nummer: (alt?.nummer ?? 0) + 1, code: ergebnis.code, dunkel }))
    })
  }

  // TypeScript-Beispiele laufen wie JS-Beispiele sofort - nur eben nach dem Übersetzen.
  const ersterLauf = useEffectEvent(() => {
    if (ts && !istUebung) tsStarten(code, theme === 'dark')
  })
  useEffect(() => {
    ersterLauf()
  }, [])

  // Bei TypeScript-Übungen zählen die Typen mit: erst wenn beides da ist, gibt es ein Ergebnis.
  const alleErgebnisse =
    !ts || !istUebung
      ? ergebnisse
      : !tests?.length
        ? typTestErgebnisse
        : ergebnisse && typTestErgebnisse
          ? [...ergebnisse, ...typTestErgebnisse]
          : null

  // Nachrichten aus dem iframe einsammeln - nur vom aktuellen Lauf.
  useEffect(() => {
    if (!lauf) return
    function beiNachricht(e: MessageEvent) {
      const nachricht = e.data as SandboxNachricht
      if (!nachricht?.tryit || nachricht.lauf !== lauf!.nummer) return
      // Aus dem Test-iframe zählen nur die Ergebnisse - Ausgaben kommen schon von der Vorschau.
      if (testIframeRef.current && e.source === testIframeRef.current.contentWindow) {
        if (nachricht.typ === 'tests') setErgebnisse(nachricht.ergebnisse)
        return
      }
      if (e.source !== iframeRef.current?.contentWindow) return

      switch (nachricht.typ) {
        case 'fertig':
          setLaeuft(false)
          break
        case 'clear':
          setZeilen([])
          break
        case 'tests':
          setErgebnisse(nachricht.ergebnisse)
          break
        case 'fehler': {
          const ort = nachricht.zeile && nachricht.zeile > 0 ? ' ' + t.zeile(nachricht.zeile) : ''
          setZeilen((alt) => [...alt, { typ: 'fehler', text: nachricht.text + ort }])
          setLaeuft(false)
          break
        }
        default:
          setZeilen((alt) => [...alt, { typ: nachricht.typ, text: nachricht.text }])
      }
    }
    window.addEventListener('message', beiNachricht)
    return () => window.removeEventListener('message', beiNachricht)
  }, [lauf, t])

  return (
    <Rahmen
      {...playground}
      art={ts ? 'TS' : 'JavaScript'}
      titel={titel}
      aufgabe={aufgabe}
      code={code}
      setCode={setCode}
      startCode={startCode}
      loesung={loesung}
      tipps={tipps}
      laeuft={laeuft}
      ausfuehren={(c) => ausfuehren(c ?? code)}
      markierungen={typfehler ?? undefined}
    >
      {ts && <Typfehlerliste fehler={typfehler} />}
      {lauf && (
        <div className={vorschau ? 'border-b border-slate-200 dark:border-slate-800' : 'h-px overflow-hidden opacity-0'}>
          {vorschau && (
            <div className="px-4 pt-2 text-[11px] tracking-wider text-slate-500 uppercase">
              {t.vorschau}
            </div>
          )}
          <iframe
            key={lauf.nummer}
            ref={iframeRef}
            srcDoc={dokument ?? ''}
            sandbox="allow-scripts allow-forms"
            title={t.ausgabe}
            className={vorschau ? 'h-48 w-full' : 'h-px w-px'}
          />
          {testDokument && (
            <iframe
              key={'tests' + lauf.nummer}
              ref={testIframeRef}
              srcDoc={testDokument}
              sandbox="allow-scripts allow-forms"
              aria-hidden
              tabIndex={-1}
              className="absolute h-px w-px opacity-0"
            />
          )}
        </div>
      )}
      <Testergebnisse ergebnisse={alleErgebnisse} />
      <Konsole
        zeilen={zeilen}
        leerText={
          istUebung && !lauf
            ? t.uebungStart
            : vorschau
              ? undefined
              : t.keineAusgabe
        }
      />
    </Rahmen>
  )
}

// ---------------------------------------------------------------------------
// Java: ausgeführt von der Laufzeit in src/java/
// ---------------------------------------------------------------------------

/**
 * Anders als JavaScript braucht Java keinen iframe: Der Code läuft nie im
 * Browser, sondern wird von unserem Interpreter gelesen und Schritt für
 * Schritt ausgeführt. Er kann deshalb gar nicht an die Seite herankommen.
 *
 * Zwei Dinge fühlen sich dadurch wie eine echte Java-IDE an:
 *  - Beim Tippen prüft `javaPruefen` im Hintergrund (rote Schlangenlinien).
 *  - Erst wenn es keine Fehler mehr gibt, startet das Programm überhaupt.
 */
function TryItJava({ id, titel, aufgabe, code: startCode, loesung, tipps, tests, vorbereitung, ...playground }: JavaProps) {
  const { sprache } = useSprache()
  const t = useTexte()
  const [code, setCode] = useGespeicherterCode(id, startCode)
  // Die Laufzeit wird erst beim ersten Java-Kapitel geladen (siehe javaHolen).
  const [java, setJava] = useState(javaModul)

  const javaTests = useMemo(
    () => tests?.map((test) => ({ ...test, name: typeof test.name === 'string' ? test.name : test.name[sprache] })),
    [tests, sprache],
  )

  const [lauf, setLauf] = useState<JavaLauf | null>(null)
  const starten = (quelltext: string, mitTests: boolean) => {
    void javaHolen().then((modul) => {
      setJava(modul)
      setLauf(sicherAusfuehren(modul, quelltext, sprache, mitTests ? javaTests : undefined, vorbereitung))
    })
  }

  // Beispiele laufen sofort, Übungen erst auf Knopfdruck.
  const ersterLauf = useEffectEvent(() => {
    if (!tests) starten(code, false)
  })
  useEffect(() => {
    ersterLauf()
  }, [])

  // Die Fehlerprüfung läuft wie in einer IDE kurz nach dem letzten Tastendruck.
  const [pruefung, setPruefung] = useState<{ code: string; fehler: Typfehler[] } | null>(null)
  useEffect(() => {
    if (!java) return
    const zeitgeber = setTimeout(() => {
      const zeilenTexte = code.split('\n')
      const fehler = java.javaPruefen(code, sprache).map((m) => ({
        zeile: m.zeile,
        spalte: Math.max(0, (zeilenTexte[m.zeile - 1] ?? '').length - (zeilenTexte[m.zeile - 1] ?? '').trimStart().length),
        laenge: (zeilenTexte[m.zeile - 1] ?? '').trim().length || 1,
        text: m.text,
        code: 0,
      }))
      setPruefung({ code, fehler })
    }, 700)
    return () => clearTimeout(zeitgeber)
  }, [code, sprache, java])
  // Bis das neue Ergebnis da ist, bleibt das letzte stehen - sonst flackert die Anzeige bei jedem Tastendruck.
  const markierungen = pruefung?.fehler

  return (
    <Rahmen
      {...playground}
      art="Java"
      titel={titel}
      aufgabe={aufgabe}
      code={code}
      setCode={setCode}
      startCode={startCode}
      loesung={loesung}
      tipps={tipps}
      markierungen={markierungen}
      ausfuehren={(c) => starten(c ?? code, true)}
    >
      <Testergebnisse ergebnisse={lauf?.ergebnisse ?? null} />
      <Konsole zeilen={lauf?.zeilen ?? []} leerText={lauf ? t.keineAusgabe : tests ? t.uebungStart : t.laeuft} />
    </Rahmen>
  )
}

/**
 * Die Java-Laufzeit (rund 3000 Zeilen) wird erst geladen, wenn wirklich ein
 * Java-Kapitel offen ist - wie die Kapitel selbst (siehe kurs.ts).
 */
type JavaModul = typeof import('../java')
let javaModul: JavaModul | null = null
let javaLaden: Promise<JavaModul> | null = null
function javaHolen(): Promise<JavaModul> {
  javaLaden ??= import('../java').then((modul) => {
    javaModul = modul
    return modul
  })
  return javaLaden
}

/** Ein Lauf darf die Seite nie mitreißen - auch nicht bei einem Fehler im Interpreter. */
function sicherAusfuehren(
  modul: JavaModul,
  code: string,
  sprache: 'de' | 'en',
  tests: { name: string; ausdruck: string; erwartet?: unknown }[] | undefined,
  vorbereitung?: string,
): JavaLauf {
  try {
    return modul.javaAusfuehren(code, { sprache, tests, vorbereitung })
  } catch (fehler) {
    return {
      zeilen: [{ typ: 'fehler', text: String(fehler instanceof Error ? fehler.message : fehler) }],
      ergebnisse: null,
      fehler: true,
    }
  }
}

// ---------------------------------------------------------------------------
// React: JSX übersetzen und in eine eigene Wurzel rendern
// ---------------------------------------------------------------------------

function TryItReact({ id, titel, aufgabe, code: startCode, loesung, tipps, tests, typen, ...playground }: ReactProps) {
  const { sprache } = useSprache()
  const t = useTexte()
  const [code, setCode] = useGespeicherterCode(id, startCode)

  // Typprüfung kurz nach dem letzten Tastendruck - wie die roten Schlangenlinien in VS Code.
  // Das Ergebnis merkt sich, für welchen Code es gilt: Veraltete Markierungen werden nicht gezeigt.
  const [typpruefung, setTyppruefung] = useState<{ code: string; fehler: Typfehler[] } | null>(null)
  useEffect(() => {
    if (!typen) return
    const zeitgeber = setTimeout(() => {
      void typenPruefen(code).then((fehler) => setTyppruefung({ code, fehler }))
    }, 700)
    return () => clearTimeout(zeitgeber)
  }, [code, typen])
  // Bis das neue Ergebnis da ist, bleibt das letzte stehen - sonst flackert die Anzeige bei jedem Tastendruck.
  const typfehler = typpruefung?.fehler ?? null
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
        root.render(
          <ErrorBoundary key={nummer} fallback={(f) => <Fehlerkasten text={`${f.name}: ${f.message}`} titel={t.fehlerBeimRendern} />}>
            <App />
          </ErrorBoundary>,
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
    void rendern(quelltext)
    if (!tests?.length) return

    const nummer = ++testLaufRef.current
    setErgebnisse(null)
    setTestsLaufen(true)
    void Promise.all([reactTestsAusfuehren(quelltext, tests, sprache), typen ? typenPruefen(quelltext) : null]).then(
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
      {...playground}
      art={typen ? 'TypeScript' : 'React'}
      titel={titel}
      aufgabe={aufgabe}
      code={code}
      setCode={setCode}
      startCode={startCode}
      loesung={loesung}
      tipps={tipps}
      laeuft={testsLaufen}
      ausfuehren={(c) => ausfuehren(c ?? code)}
      markierungen={typfehler ?? undefined}
    >
      {typen && <Typfehlerliste fehler={typfehler} />}
      <div className="px-4 pt-2 text-[11px] tracking-wider text-slate-500 uppercase">{t.vorschau}</div>
      <div ref={containerRef} className="vorschau min-h-16 px-4 pt-1 pb-4" />
      {tests?.length ? (
        <div className="border-t border-slate-200 dark:border-slate-800">
          {ergebnisse ? (
            <Testergebnisse ergebnisse={ergebnisse} />
          ) : (
            <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              {testsLaufen ? `⏳ ${t.testsLaufen}` : t.reactUebungStart}
            </p>
          )}
        </div>
      ) : null}
      <Konsole zeilen={zeilen} />
    </Rahmen>
  )
}

/** Ergebnis der Typprüfung unter dem Editor. `null` = Prüfung läuft noch. */
export function Typfehlerliste({ fehler }: { fehler: Typfehler[] | null }) {
  const t = useTexte()
  if (!fehler) {
    return <p className="border-b border-slate-200 px-4 py-2 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">⏳ {t.typpruefungLaeuft}</p>
  }
  if (fehler.length === 0) {
    return (
      <p className="border-b border-slate-200 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-slate-800 dark:text-emerald-400">
        ✓ {t.typpruefung}: {t.keineTypfehler}
      </p>
    )
  }
  return (
    <div className="border-b border-rose-200 bg-rose-50/70 px-4 py-2.5 text-sm dark:border-rose-900 dark:bg-rose-950/30">
      <p className="font-semibold text-rose-800 dark:text-rose-300">
        {t.typpruefung}: {t.typfehler(fehler.length)}
      </p>
      <ul className="mt-1 space-y-1">
        {fehler.map((f, i) => (
          <li key={i} className="flex gap-2 font-mono text-xs leading-5 text-rose-900 dark:text-rose-200">
            <span className="shrink-0 text-rose-500 tabular-nums">{t.typfehlerZeile(f.zeile)}</span>
            <span className="whitespace-pre-wrap">
              {f.text} <span className="text-rose-400">TS{f.code}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t.typfehlerHinweis}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests schreiben: Vitest + React Testing Library (siehe testLauf.ts)
// ---------------------------------------------------------------------------

const TESTDATEI = 'App.test.jsx'

function TryItTest({ id, titel, aufgabe, code: startCode, loesung, tipps, dateien = [], varianten, ...playground }: TestProps) {
  const { sprache } = useSprache()
  const t = useTexte()
  const [code, setCode] = useGespeicherterCode(id, startCode)
  const [bericht, setBericht] = useState<TestBericht | null>(null)
  const [pruefungen, setPruefungen] = useState<TestErgebnis[] | null>(null)
  const [laeuft, setLaeuft] = useState(false)
  const laufRef = useRef(0)
  const istUebung = Boolean(varianten?.length)

  async function ausfuehren(quelltext: string) {
    const nummer = ++laufRef.current
    setLaeuft(true)
    setPruefungen(null)
    const eigene = { pfad: TESTDATEI, code: quelltext }
    const neu = await testsAusfuehren([...dateien, eigene], TESTDATEI, sprache)
    if (nummer !== laufRef.current) return
    setBericht(neu)

    if (varianten?.length) {
      // Mutationstest: Gute Tests sind grün mit der richtigen Komponente und rot mit jeder kaputten.
      const gruen = !neu.fehler && neu.faelle.length > 0 && neu.faelle.every((f) => f.ok)
      const ergebnisse: TestErgebnis[] = [
        {
          name: t.testsGruen,
          ok: gruen,
          meldung: neu.fehler ?? (neu.faelle.length === 0 ? t.keineTests : (neu.faelle.find((f) => !f.ok)?.name ?? '')),
        },
      ]
      for (const variante of varianten) {
        const mitFehler = await testsAusfuehren([...variante.dateien, eigene], TESTDATEI, sprache)
        const erkannt = Boolean(mitFehler.fehler) || mitFehler.faelle.some((f) => !f.ok)
        ergebnisse.push({
          name: t.fehlerErkannt(variante.name[sprache]),
          ok: gruen && erkannt,
          meldung: erkannt ? '' : t.fehlerNichtErkannt,
        })
      }
      if (nummer !== laufRef.current) return
      setPruefungen(ergebnisse)
    }
    setLaeuft(false)
  }

  // Beispiele laufen sofort, Übungen erst auf Knopfdruck - wie bei den anderen Editoren.
  const ersterLauf = useEffectEvent(() => void ausfuehren(code))
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- startet den externen Testlauf; „läuft“ muss sofort sichtbar sein.
    if (!istUebung) ersterLauf()
  }, [istUebung])

  return (
    <Rahmen
      {...playground}
      art="Test"
      titel={titel}
      aufgabe={aufgabe}
      code={code}
      setCode={setCode}
      startCode={startCode}
      loesung={loesung}
      tipps={tipps}
      laeuft={laeuft}
      ausfuehren={(c) => void ausfuehren(c ?? code)}
      oben={dateien.map((d) => (
        <div key={d.pfad} className="border-b border-slate-200 p-3 dark:border-slate-800">
          <CodeBlock code={d.code} titel={`${d.pfad} (${t.nurLesen})`} />
        </div>
      ))}
    >
      {!bericht ? (
        <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
          {laeuft ? `⏳ ${t.testsLaufen}` : t.reactUebungStart}
        </p>
      ) : (
        <Testausgabe bericht={bericht} laeuft={laeuft} />
      )}
      {pruefungen && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <Testergebnisse ergebnisse={pruefungen} />
        </div>
      )}
      <Konsole zeilen={bericht?.logs.map((text) => ({ typ: 'log' as const, text })) ?? []} />
    </Rahmen>
  )
}

/** Ausgabe wie im Terminal von Vitest: ✓/✗ pro Test, Dauer, Fehlermeldung, Zusammenfassung. */
function Testausgabe({ bericht, laeuft }: { bericht: TestBericht; laeuft: boolean }) {
  const t = useTexte()
  const bestanden = bericht.faelle.filter((f) => f.ok).length
  const fehlgeschlagen = bericht.faelle.length - bestanden

  return (
    <div className={`bg-slate-900 px-4 py-3 font-mono text-[13px] leading-5 text-slate-200 transition-opacity dark:bg-black/40 ${laeuft ? 'opacity-60' : ''}`}>
      <div className="mb-1 text-[11px] tracking-wider text-slate-500 uppercase">{t.deineTests}</div>
      {bericht.fehler ? (
        <div className="text-rose-300">
          ⛔ {t.testDateiFehler}
          <div className="mt-1 whitespace-pre-wrap">{bericht.fehler}</div>
        </div>
      ) : bericht.faelle.length === 0 ? (
        <div className="text-slate-400 italic">{t.keineTests}</div>
      ) : (
        <>
          <ul>
            {bericht.faelle.map((f, i) => (
              <li key={i}>
                <span className={f.ok ? 'text-emerald-400' : 'text-rose-400'}>{f.ok ? '✓' : '✗'}</span> {f.name}{' '}
                <span className="text-slate-500">{f.dauer}ms</span>
                {f.meldung && <div className="mb-1 ml-4 whitespace-pre-wrap text-rose-300">→ {f.meldung}</div>}
              </li>
            ))}
          </ul>
          <div className={`mt-2 font-semibold ${fehlgeschlagen ? 'text-rose-400' : 'text-emerald-400'}`}>
            Tests: {t.testZusammenfassung(bestanden, fehlgeschlagen)} ({bericht.faelle.length})
          </div>
        </>
      )}
    </div>
  )
}

// Wird in der separaten Vorschau-Wurzel gerendert - dort gibt es keinen Sprach-Context,
// deshalb kommt der Titel als Prop.
export function Fehlerkasten({ text, titel }: { text: string; titel: string }) {
  return (
    <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
      <p className="font-semibold">⛔ {titel}</p>
      <pre className="mt-1 font-mono text-xs whitespace-pre-wrap">{text}</pre>
    </div>
  )
}
