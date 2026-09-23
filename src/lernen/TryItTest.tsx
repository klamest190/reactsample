import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { CodeBlock } from './CodeBlock'
import type { TestErgebnis } from './jsSandbox'
import { Konsole, Rahmen, Testergebnisse } from './Rahmen'
import { testsAusfuehren, type TestBericht } from './testLauf'
import type { TestProps } from './TryIt'
import { useSavedCode } from './useSavedCode'

/** Writing tests - Vitest and React Testing Library, run in the browser (see testLauf.ts). */

const TESTDATEI = 'App.test.jsx'

export function TryItTest({ id, titel, aufgabe, code: startCode, loesung, tipps, dateien = [], varianten, ...playground }: TestProps) {
  const { sprache } = useSprache()
  const t = useTexte()
  const [code, setCode] = useSavedCode(id, startCode)
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
        <p className="flex items-center gap-1.5 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
          {laeuft && <Icon name="uhr" className="size-3.5" />}
          {laeuft ? t.testsLaufen : t.reactUebungStart}
        </p>
      ) : (
        <Testausgabe bericht={bericht} laeuft={laeuft} />
      )}
      {pruefungen && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <Testergebnisse id={id} ergebnisse={pruefungen} />
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
    <div className={`bg-slate-900 px-4 py-3 font-mono text-code leading-5 text-slate-200 transition-opacity dark:bg-black/40 ${laeuft ? 'opacity-60' : ''}`}>
      <div className="mb-1 text-2xs tracking-wider text-slate-400 uppercase">{t.deineTests}</div>
      {bericht.fehler ? (
        <div className="text-rose-300">
          <Icon name="kreisKreuz" className="mr-1.5 inline size-3.5 align-[-2px]" />
          {t.testDateiFehler}
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
                <span className="text-slate-400">{f.dauer}ms</span>
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
