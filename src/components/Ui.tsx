import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'
import { useTexte } from '../i18n/SpracheContext'

/**
 * Kleine, wiederverwendbare Bausteine für alle Kapitel.
 * Hier stecken gleich mehrere Konzepte drin:
 *  - Props mit TypeScript typisieren
 *  - `children` als Prop (Komposition)
 *  - HTML-Props erweitern statt jede einzeln durchreichen
 */

/** Ein Unterkapitel mit Überschrift. */
export function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="border-b border-slate-200 pb-2 text-xl font-semibold tracking-tight dark:border-slate-800">
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
        {t.liveDemo}{titel && ` · ${titel}`}
      </h3>
      <div className="space-y-3">{children}</div>
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
  const symbole = { info: 'ℹ️', warnung: '⚠️', tipp: '💡' }

  return (
    <div className={`flex gap-2 rounded-lg border px-3 py-2 text-sm leading-relaxed ${stile[variante]}`}>
      <span aria-hidden>{symbole[variante]}</span>
      <div>{children}</div>
    </div>
  )
}

/** Zusammenfassung am Ende eines Kapitels. */
export function Merke({ punkte }: { punkte: ReactNode[] }) {
  const t = useTexte()
  return (
    <div className="rounded-xl border-l-4 border-brand-500 bg-brand-50 px-5 py-4 dark:bg-brand-700/15">
      <h3 className="mb-2 font-semibold">{t.dasWichtigste}</h3>
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
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'primaer' | 'sekundaer' | 'gefahr'
}

export function Button({ variante = 'primaer', className = '', ...rest }: ButtonProps) {
  const basis =
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ' +
    'disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

  const varianten = {
    primaer: 'bg-brand-600 text-white hover:bg-brand-700',
    sekundaer:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    gefahr: 'bg-rose-600 text-white hover:bg-rose-700',
  }

  return <button className={`${basis} ${varianten[variante]} ${className}`} {...rest} />
}

/** Texteingabe im einheitlichen Stil - alle <input>-Props (auch ref) werden durchgereicht. */
export function Eingabe({ className = '', ...rest }: ComponentProps<'input'>) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 ${className}`}
      {...rest}
    />
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
