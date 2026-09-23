import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'
import { useTexte } from '../i18n/SpracheContext'
import { Icon } from './Icon'

/**
 * Kleine, wiederverwendbare Bausteine für alle Kapitel.
 * Hier stecken gleich mehrere Konzepte drin:
 *  - Props mit TypeScript typisieren
 *  - `children` als Prop (Komposition)
 *  - HTML-Props erweitern statt jede einzeln durchreichen
 */

/**
 * Wiederkehrende Klassenketten an einer Stelle.
 * Tailwind-Klassen müssen als ganze Strings im Code stehen, damit der Scanner
 * sie findet - deshalb Konstanten und keine zusammengebauten Namen.
 */

/** Der Standardkasten der App. Aufrufer ergänzen Innenabstand und Schatten selbst. */
export const KARTE =
  'rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'

/** Fokusring für Elemente, die den Standardring aus index.css überschreiben müssen. */
export const FOKUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

/**
 * Spalte, die neben dem Inhalt am Kopf klebt und selbst scrollt.
 * 5rem Abstand = Kopfzeile, 6rem Höhenabzug = Kopfzeile + Luft unten.
 */
export const KLEBT_MD = 'md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto'
export const KLEBT_LG = 'lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]'

/**
 * Ein Unterkapitel mit Überschrift.
 *
 * Die Sprungmarke vergibt nicht der Abschnitt selbst, sondern ein Durchlauf nach
 * dem Rendern (siehe Gliederung.tsx) - nach Position, also `abschnitt-3`.
 * Das ist sprachneutral, weil die deutsche und die englische Fassung eines
 * Kapitels dieselben Abschnitte in derselben Reihenfolge haben.
 *
 * `anker` ist der Ausweg für Links, die dauerhaft halten sollen: damit bekommt
 * der Abschnitt einen festen Namen statt seiner Position.
 */
export function Abschnitt({
  titel,
  anker,
  children,
}: {
  titel: string
  anker?: string
  children: ReactNode
}) {
  return (
    <section data-anker={anker} className="scroll-mt-24 space-y-4">
      {/* tabIndex -1: die Überschrift ist kein Tabstopp, kann aber Sprungziel sein. */}
      <h2
        tabIndex={-1}
        className="border-b border-slate-200 pb-2 text-xl font-semibold tracking-tight outline-none dark:border-slate-800"
      >
        {titel}
      </h2>
      {children}
    </section>
  )
}

/** Fließtext mit angenehmer Zeilenlänge. */
export function P({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-3xl leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>
  )
}

/** Aufzählung im Fließtext. */
export function Liste({ children }: { children: ReactNode }) {
  return (
    <ul className="max-w-3xl list-disc space-y-1 pl-5 leading-relaxed text-slate-700 marker:text-brand-500 dark:text-slate-300">
      {children}
    </ul>
  )
}

/** Umrandete Box für ein fertiges, lauffähiges Beispiel. */
export function Demo({ titel, children }: { titel?: string; children: ReactNode }) {
  const t = useTexte()
  return (
    <div className={`${KARTE} p-4 shadow-sm`}>
      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
        {/* Kleiner pulsierender Punkt: hier läuft echter Code, kein Bild. */}
        <span aria-hidden className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        {t.liveDemo}{titel && ` · ${titel}`}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

/**
 * Tabelle für Übersichten im Kapiteltext.
 *
 * Die Struktur (waagerechter Scroll, Kopfzeile, Trennlinien, Zellabstände) steckt
 * hier, damit sie nicht in jedem Kapitel wieder abgetippt wird. Die Kapitel geben
 * nur noch Inhalte - `zeilen` ist eine Liste von Zeilen, jede Zeile eine Liste von Zellen.
 *
 * `spalten` setzt zusätzliche Klassen je Spalte, z.B. `font-mono` für eine Codespalte.
 * `breit` gibt die volle Spaltenbreite frei (sonst gilt die Lesebreite des Fließtexts),
 * `dicht` verkleinert die Zeilenhöhe für lange Listen.
 */
export function Tabelle({
  kopf,
  zeilen,
  spalten,
  breit,
  dicht,
}: {
  kopf?: ReactNode[]
  zeilen: ReactNode[][]
  spalten?: (string | undefined)[]
  breit?: boolean
  dicht?: boolean
}) {
  // Letzte Spalte ohne rechten Abstand - sonst steht die Tabelle rechts schief.
  const zelle = (index: number, anzahl: number) =>
    [dicht ? 'py-1.5' : 'py-2', index < anzahl - 1 ? 'pr-4' : '', spalten?.[index] ?? '']
      .filter(Boolean)
      .join(' ')

  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${breit ? '' : 'max-w-3xl'}`}>
        {kopf && (
          <thead className="border-b border-slate-300 dark:border-slate-700">
            <tr>
              {kopf.map((inhalt, i) => (
                <th key={i} className={zelle(i, kopf.length)}>
                  {inhalt}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {zeilen.map((zeile, r) => (
            <tr key={r}>
              {zeile.map((inhalt, i) => (
                <td key={i} className={zelle(i, zeile.length)}>
                  {inhalt}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Farbiger Hinweiskasten. `variante` ist ein Union-Type = nur diese Werte erlaubt. */
export function Hinweis({
  variante = 'info',
  children,
}: {
  variante?: 'info' | 'warnung' | 'tipp'
  children: ReactNode
}) {
  // Lookup-Objekt statt if/else-Kette. Tailwind-Klassen müssen als ganze
  // Strings im Code stehen, damit der Scanner sie findet (kein `bg-${farbe}-100`!).
  const stile = {
    info: 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200',
    warnung:
      'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
    tipp: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  }
  const symbole = { info: 'info', warnung: 'warnung', tipp: 'gluehbirne' } as const

  return (
    <div className={`flex gap-2.5 rounded-lg border px-3 py-2.5 text-sm leading-relaxed ${stile[variante]}`}>
      <Icon name={symbole[variante]} className="mt-0.5 size-4 opacity-80" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/** Zusammenfassung am Ende eines Kapitels. */
export function Merke({ punkte }: { punkte: ReactNode[] }) {
  const t = useTexte()
  return (
    <div className="rounded-xl border-l-4 border-brand-500 bg-brand-50 px-5 py-4 dark:bg-brand-700/15">
      <h3 className="mb-2 flex items-center gap-2 font-semibold">
        <Icon name="stern" className="size-4 text-brand-600 dark:text-brand-400" />
        {t.dasWichtigste}
      </h3>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {punkte.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Button, der ALLE nativen <button>-Props weiterreicht (onClick, disabled, type ...).
 * `ButtonHTMLAttributes<HTMLButtonElement>` liefert die Typen dafür,
 * Rest-Spread `{...rest}` gibt sie ans DOM-Element weiter.
 */
type Variante = 'primaer' | 'sekundaer' | 'gefahr' | 'erfolg'
type Groesse = 'normal' | 'gross'

/** Klassen für Button und ButtonLink - beide sehen gleich aus, nur das Element unterscheidet sich. */
function knopfKlassen(variante: Variante, groesse: Groesse, className: string) {
  const basis =
    'inline-flex items-center gap-1.5 rounded-lg font-medium transition ' +
    `disabled:cursor-not-allowed disabled:opacity-50 ${FOKUS}`

  const groessen = {
    normal: 'px-3 py-1.5 text-sm',
    gross: 'px-4 py-2 text-base',
  }

  const varianten = {
    primaer: 'bg-brand-600 text-white hover:bg-brand-700',
    sekundaer:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    gefahr: 'bg-rose-600 text-white hover:bg-rose-700',
    erfolg: 'bg-emerald-600 text-white hover:bg-emerald-700',
  }

  return `${basis} ${groessen[groesse]} ${varianten[variante]} ${className}`
}

export function Button({
  variante = 'primaer',
  groesse = 'normal',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; groesse?: Groesse }) {
  return <button className={knopfKlassen(variante, groesse, className)} {...rest} />
}

/** Sieht aus wie ein Button, ist aber ein Link - für Ziele mit eigener Adresse. */
export function ButtonLink({
  variante = 'primaer',
  groesse = 'normal',
  className = '',
  ...rest
}: ComponentProps<'a'> & { variante?: Variante; groesse?: Groesse }) {
  return <a className={knopfKlassen(variante, groesse, className)} {...rest} />
}

/** Texteingabe im einheitlichen Stil - alle <input>-Props (auch ref) werden durchgereicht. */
export function Eingabe({ className = '', ...rest }: ComponentProps<'input'>) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-800 ${className}`}
      {...rest}
    />
  )
}

/** Tastenkappe im Fließtext, z.B. für Strg + K. */
export function Taste({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={`rounded border border-slate-300 px-1 font-sans text-xs font-normal text-slate-500 dark:border-slate-700 dark:text-slate-400 ${className}`}
    >
      {children}
    </kbd>
  )
}

/** Platzhalter, solange ein per lazy() geladener Bereich noch unterwegs ist. */
export function Platzhalter({ label, bloecke = 3 }: { label: string; bloecke?: number }) {
  return (
    <div className="space-y-4" aria-label={label}>
      {Array.from({ length: bloecke }, (_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  )
}

/** Inline-Code, z.B. für Hook-Namen im Fließtext. */
export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-700 dark:bg-slate-800 dark:text-brand-400">
      {children}
    </code>
  )
}

/** Zeigt einen Wert groß an - praktisch, um State sichtbar zu machen. */
export function Wert({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm dark:bg-slate-800">
      <span className="text-slate-500 dark:text-slate-400">{label}: </span>
      <span className="font-semibold">{children}</span>
    </div>
  )
}

/** Kleiner Pfeil für auf- und zuklappbare Bereiche (SVG statt ▶ - das wird auf manchen Systemen zum Emoji). */
export function Aufklapppfeil({ offen }: { offen: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={`size-3 shrink-0 fill-none stroke-current stroke-2 text-slate-400 transition ${offen ? 'rotate-90' : ''}`}
    >
      <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
