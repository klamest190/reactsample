import { useEffect, useState, type ReactNode, type Ref } from 'react'
import { Icon } from '../components/Icon'
import { useFortschritt } from '../context/FortschrittContext'
import { useSprache, useTexte } from '../i18n/SpracheContext'
import { CodeBlock } from './CodeBlock'
import { CodeEditor, type EditorSteuerung } from './CodeEditor'
import { ARTEN, EDITOR_SPRACHEN, type Art } from './modi'
import { Text } from './Text'
import type { TestErgebnis } from './jsSandbox'
import type { Typfehler } from './typpruefung'

/**
 * The parts every editor shares: the frame around it (header, task, editor, buttons,
 * tips, solution) and the blocks below it (console, test results, type errors).
 * The editors themselves live in TryIt*.tsx - TryIt.tsx picks one by `modus`.
 */

export type Zeile = { typ: 'log' | 'info' | 'warn' | 'error' | 'fehler'; text: string }

// Abzeichen und Editorsprache je Art stehen in modi.ts (ARTEN).

export function Rahmen({
  art,
  startText,
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
  art: Art
  /** Label of the run button, e.g. "docker build" (default: Ausführen). The play icon is added in front. */
  startText?: string
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
        <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <Icon
            name={kopf ? 'spielwiese' : istUebung ? 'hantel' : 'kolben'}
            className="size-4 text-brand-600 dark:text-brand-400"
          />
          <span className="min-w-0">
            {kopf ?? (istUebung ? t.uebung : t.probierSelbst)}
            {titel && <span className="font-normal text-slate-500 dark:text-slate-400"> · {titel}</span>}
          </span>
        </h3>
        <span className={`rounded-full px-2 py-0.5 font-mono text-2xs font-semibold ${ARTEN[art].klassen}`}>
          {ARTEN[art].text}
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
        sprache={ARTEN[art].sprache}
        markierungen={markierungen}
        steuerung={editorRef}
        maxZeilen={maxZeilen}
      />

      <div className="flex flex-wrap items-center gap-2 border-y border-slate-200 px-4 py-2 dark:border-slate-800">
        <button
          onClick={() => ausfuehren()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Icon name="abspielen" className="size-3.5" />
          {startText ?? t.ausfuehren}
        </button>
        <button
          onClick={() => {
            setCode(startCode)
            ausfuehren(startCode)
          }}
          disabled={code === startCode}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Icon name="zuruecksetzen" className="size-3.5" />
          {t.zuruecksetzen}
        </button>
        {tippListe.length > 0 && (
          <button
            onClick={() => setTippAnzahl((n) => Math.min(n + 1, tippListe.length))}
            disabled={tippAnzahl >= tippListe.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-900 transition hover:bg-amber-100 disabled:opacity-40 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            <Icon name="gluehbirne" className="size-3.5" />
            {t.tipp(Math.min(tippAnzahl + 1, tippListe.length), tippListe.length)}
          </button>
        )}
        {loesung && (
          <button
            onClick={() => setZeigeLoesung((z) => !z)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Icon name="schluessel" className="size-3.5" />
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
              <span className="flex shrink-0 items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                <Icon name="gluehbirne" className="size-3.5" />
                {i + 1}.
              </span>
              <span>
                <Text text={tipp} />
              </span>
            </li>
          ))}
        </ol>
      )}

      {zeigeLoesung && loesung && (
        <div className="space-y-2 border-b border-slate-200 p-4 dark:border-slate-800">
          <CodeBlock code={loesung} titel={t.musterloesung} sprache={EDITOR_SPRACHEN[ARTEN[art].sprache].hervorhebung} />
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
    <div className="bg-slate-900 px-4 py-3 font-mono text-code leading-5 dark:bg-black/40">
      <div className="mb-1 text-2xs tracking-wider text-slate-500 uppercase">{t.konsole}</div>
      {zeilen.length === 0 ? (
        <div className="text-slate-500 italic">{leerText}</div>
      ) : (
        zeilen.map((z, i) => (
          <div key={i} className={`flex gap-1.5 ${farben[z.typ]}`}>
            {z.typ === 'fehler' ? (
              <Icon name="kreisKreuz" className="mt-0.75 size-3.5" />
            ) : z.typ === 'warn' ? (
              <Icon name="warnung" className="mt-0.75 size-3.5" />
            ) : (
              <span aria-hidden className="w-3.5 shrink-0 text-center text-slate-500">›</span>
            )}
            <span className="min-w-0 wrap-break-word whitespace-pre-wrap">{z.text}</span>
          </div>
        ))
      )}
    </div>
  )
}

export function Testergebnisse({ id, ergebnisse }: { id?: string; ergebnisse: TestErgebnis[] | null }) {
  const t = useTexte()
  const { uebungGeloest } = useFortschritt()
  const bestanden = ergebnisse?.filter((e) => e.ok).length ?? 0
  const alle = ergebnisse !== null && ergebnisse.length > 0 && bestanden === ergebnisse.length

  // Einmal grün heißt gelöst - das merken wir uns, damit die Übung beim
  // nächsten Besuch als erledigt zu sehen ist.
  useEffect(() => {
    if (id && alle) uebungGeloest(id)
  }, [id, alle, uebungGeloest])

  // Erst NACH den Hooks aussteigen - die Reihenfolge der Hooks muss konstant bleiben.
  if (!ergebnisse) return null

  return (
    <div className="space-y-1.5 px-4 py-3 text-sm">
      <p
        className={`flex items-center gap-1.5 font-semibold ${alle ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}
      >
        {alle && <Icon name="pokal" className="size-4" />}
        {alle
          ? t.alleTestsBestanden(ergebnisse.length)
          : t.testsBestanden(bestanden, ergebnisse.length)}
      </p>
      <ul className="space-y-1">
        {ergebnisse.map((e) => (
          <li key={e.name} className="flex gap-2">
            <Icon
              name={e.ok ? 'kreisHaken' : 'kreisKreuz'}
              className={`mt-0.5 size-4 ${e.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
            />
            <span className="sr-only">{e.ok ? t.testOk : t.testFehler}</span>
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

/** Ergebnis der Typprüfung unter dem Editor. `null` = Prüfung läuft noch. */
export function Typfehlerliste({ fehler }: { fehler: Typfehler[] | null }) {
  const t = useTexte()
  if (!fehler) {
    return <p className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-2 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <Icon name="uhr" className="size-3.5" />
        {t.typpruefungLaeuft}
      </p>
  }
  if (fehler.length === 0) {
    return (
      <p className="flex items-center gap-1.5 border-b border-slate-200 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-slate-800 dark:text-emerald-400">
        <Icon name="kreisHaken" className="size-3.5" />
        {t.typpruefung}: {t.keineTypfehler}
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

// Wird in der separaten Vorschau-Wurzel gerendert - dort gibt es keinen Sprach-Context,
// deshalb kommt der Titel als Prop.
export function Fehlerkasten({ text, titel }: { text: string; titel: string }) {
  return (
    <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
      <p className="flex items-center gap-1.5 font-semibold">
        <Icon name="kreisKreuz" className="size-4" />
        {titel}
      </p>
      <pre className="mt-1 font-mono text-xs whitespace-pre-wrap">{text}</pre>
    </div>
  )
}
