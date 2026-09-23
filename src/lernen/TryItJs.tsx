import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { localized } from '../i18n/localized'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { useDelayedCheck } from './editorChecks'
import { sandboxDokument, type SandboxNachricht, type TestErgebnis } from './jsSandbox'
import { Konsole, Rahmen, Testergebnisse, Typfehlerliste, type Zeile } from './Rahmen'
import type { JsProps } from './TryIt'
import { tsTypenPruefen, tsUebersetzen, typErgebnisse } from './tsLauf'
import { useSavedCode } from './useSavedCode'

/** JavaScript and TypeScript - the code runs in a sandboxed iframe (see jsSandbox.ts and tsLauf.ts). */

/** Type errors in the code itself - the markers while typing. */
const typeErrorsInCode = async (code: string) => (await tsTypenPruefen(code)).imCode

export function TryItJs({ id, titel, aufgabe, code: startCode, loesung, tipps, tests, typTests, vorbereitung, vorschau, modus, ...playground }: JsProps) {
  const { theme } = useTheme()
  const { sprache } = useSprache()
  const t = useTexte()
  const [code, setCode] = useSavedCode(id, startCode)
  const ts = modus === 'ts'
  const istUebung = Boolean(tests || typTests)

  // Ein Lauf = fortlaufende Nummer + der (bei TypeScript schon übersetzte) Code zum Zeitpunkt des Klicks.
  // JS-Beispiele laufen sofort (Startwert), Übungen erst auf Knopfdruck (null).
  // TypeScript muss erst übersetzt werden - das geht nur asynchron, deshalb startet es im Effekt unten.
  const [lauf, setLauf] = useState<{ nummer: number; code: string; dunkel: boolean } | null>(() =>
    istUebung || ts ? null : { nummer: 1, code, dunkel: theme === 'dark' },
  )

  // TypeScript: Typprüfung kurz nach dem letzten Tastendruck (wie im React-Modus mit `typen`).
  const typfehler = useDelayedCheck(code, ts ? typeErrorsInCode : null)
  // Übungen: Typprüfung samt Typ-Tests als zusätzliche Testergebnisse, pro Lauf.
  const [typTestErgebnisse, setTypTestErgebnisse] = useState<TestErgebnis[] | null>(null)
  const uebersetzungRef = useRef(0)
  const [zeilen, setZeilen] = useState<Zeile[]>([])
  const [ergebnisse, setErgebnisse] = useState<TestErgebnis[] | null>(null)
  const [laeuft, setLaeuft] = useState(!istUebung)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const testIframeRef = useRef<HTMLIFrameElement>(null)
  // Die Vorschau erscheint nur, wenn der Code wirklich etwas anzeigt - sonst reicht die Konsole.
  // Bewusst NICHT bei jedem Start zurückgesetzt: Ein DOM-Beispiel würde sonst bei jedem
  // Ausführen kurz zusammenklappen. Entschieden wird, sobald der neue Lauf "fertig" meldet.
  const [vorschauMitInhalt, setVorschauMitInhalt] = useState(false)
  const inhaltGemeldet = useRef(false)
  const zeigeVorschau = Boolean(vorschau && vorschauMitInhalt)
  // Tests klicken und tippen im Dokument. Bei sichtbarer Vorschau laufen sie deshalb in
  // einem zweiten, unsichtbaren iframe - sonst würde die Vorschau von den Tests verändert.
  const getrennteTests = Boolean(vorschau && tests)

  // Die iframe-Dokumente sind abgeleitete Werte.
  const [dokument, testDokument] = useMemo(() => {
    if (!lauf) return [null, null]
    // Testnamen sind zweisprachig - in die Sandbox geht nur der Text der aktuellen Sprache.
    const testsInSprache = tests?.map((t) => ({ ...t, name: localized(t.name, sprache) }))
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
    inhaltGemeldet.current = false
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
          if (nachricht.inhalt) inhaltGemeldet.current = true
          setVorschauMitInhalt(inhaltGemeldet.current)
          break
        case 'inhalt':
          inhaltGemeldet.current = true
          setVorschauMitInhalt(true)
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
          // Ein Fehler bricht den Lauf ab, "fertig" kommt dann nicht mehr.
          setVorschauMitInhalt(inhaltGemeldet.current)
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
        // Das iframe bleibt immer eingehängt (der Code läuft darin), nur ohne Inhalt eben unsichtbar.
        <div className={zeigeVorschau ? 'border-b border-slate-200 dark:border-slate-800' : 'h-px overflow-hidden opacity-0'}>
          {zeigeVorschau && (
            <div className="px-4 pt-2 text-2xs tracking-wider text-slate-500 uppercase dark:text-slate-400">
              {t.vorschau}
            </div>
          )}
          <iframe
            key={lauf.nummer}
            ref={iframeRef}
            srcDoc={dokument ?? ''}
            sandbox="allow-scripts allow-forms"
            title={t.ausgabe}
            className={zeigeVorschau ? 'h-48 w-full' : 'h-px w-px'}
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
      <Testergebnisse id={id} ergebnisse={alleErgebnisse} />
      <Konsole
        zeilen={zeilen}
        leerText={
          istUebung && !lauf
            ? t.uebungStart
            : zeigeVorschau
              ? undefined
              : t.keineAusgabe
        }
      />
    </Rahmen>
  )
}
