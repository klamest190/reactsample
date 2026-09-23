import { TEIL_STIL } from './teilStil'

/**
 * Schlichte Linien-Icons als Inline-SVG (Stil wie Lucide), ohne Bibliothek.
 * Sie übernehmen die Textfarbe (stroke="currentColor") und sehen auf jedem System gleich aus.
 *
 * Die Aufteilung im Projekt: SVG für die gesamte Oberfläche (Kopfzeile, Seitenleiste,
 * Überschriften, Knöpfe, Zustände), Emoji nur im Kursinhalt selbst.
 * Emoji rendert jedes System anders (Windows flach, macOS glänzend) - in der
 * Oberfläche wirkt das uneinheitlich, im Fließtext eines Kapitels stört es nicht.
 */

const PFADE = {
  suche: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  start: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9v12h14V9" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  buch: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  code: (
    <>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </>
  ),
  atom: (
    <>
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </>
  ),
  raster: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </>
  ),
  // Java heißt nach dem Kaffee, den die Erfinder getrunken haben.
  tasse: (
    <>
      <path d="M4 9h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M17 11h1a2.5 2.5 0 0 1 0 5h-1.3" />
      <path d="M8 2.5c-.8.8-.8 1.7 0 2.5s.8 1.7 0 2.5M12.5 2.5c-.8.8-.8 1.7 0 2.5s.8 1.7 0 2.5" />
    </>
  ),
  // Hooks: ein echter Haken (Öse, Schaft, Bogen, Widerhaken) statt eines Ankers.
  angelhaken: (
    <>
      <circle cx="15" cy="3.8" r="1.8" />
      <path d="M15 5.6V14a5 5 0 0 1-10 0v-3.5" />
      <path d="m5 10.5 3 2.5" />
    </>
  ),
  // ToDo-Projekt: Klemmbrett mit abgehakten Einträgen.
  checkliste: (
    <>
      <rect x="5" y="4" width="14" height="18" rx="2" />
      <path d="M9 2.5h6v3H9z" />
      <path d="m8.5 11 1.5 1.5 2.5-2.5M8.5 17l1.5 1.5 2.5-2.5M14.5 11.5h1.5M14.5 17.5h1.5" />
    </>
  ),
  // TypeScript: ein Schild mit Haken - Typen schützen vor Fehlern.
  schild: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  // Spielwiese: ein Editorfenster mit Play-Dreieck.
  spielwiese: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m10 9 5 3-5 3z" />
    </>
  ),
  haken: <path d="M20 6 9 17l-5-5" />,
  // Part 8: two server units - Spring Boot and Docker live on the server side.
  server: (
    <>
      <rect x="3" y="3" width="18" height="5.5" rx="1.5" />
      <rect x="3" y="9.25" width="18" height="5.5" rx="1.5" />
      <rect x="3" y="15.5" width="18" height="5.5" rx="1.5" />
      <path d="M7 5.75h.01M7 12h.01M7 18.25h.01M12 5.75h5M12 12h5M12 18.25h5" />
    </>
  ),
  datenbank: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </>
  ),

  // --- Kopfzeile ---------------------------------------------------------------
  menue: <path d="M4 6h16M4 12h16M4 18h16" />,
  sonne: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </>
  ),
  mond: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,

  // --- Überschriften und Hinweise ------------------------------------------------
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  warnung: (
    <>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  gluehbirne: (
    <>
      <path d="M9 18h6M10 22h4" />
      <path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A5.8 5.8 0 0 0 18 7.5a6 6 0 0 0-12 0c0 1.5.5 2.9 1.5 4 .7.8 1.3 1.5 1.4 2.5" />
    </>
  ),
  ziel: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  uhr: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  stern: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1z" />,
  auge: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  kolben: (
    <>
      <path d="M9 3h6M10 3v6.5L4.6 18.4A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.4-2.6L14 9.5V3" />
      <path d="M7 15h10" />
    </>
  ),
  hantel: (
    <>
      <path d="M6.5 6.5v11M17.5 6.5v11M6.5 12h11" />
      <path d="M3 9v6M21 9v6" />
    </>
  ),
  frage: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
    </>
  ),
  schluessel: (
    <>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m11.4 11.6 9.1-9.1M17 6l3 3M14.5 8.5l2 2" />
    </>
  ),
  werkzeug: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z" />
  ),
  puzzle: (
    <path d="M19.4 14.9a2 2 0 1 0 0-3.8H18V8a2 2 0 0 0-2-2h-3.1V4.6a2 2 0 1 0-3.8 0V6H6a2 2 0 0 0-2 2v3.1h1.4a2 2 0 1 1 0 3.8H4V18a2 2 0 0 0 2 2h3.1v-1.4a2 2 0 1 1 3.8 0V20H16a2 2 0 0 0 2-2v-3.1z" />
  ),
  laptop: (
    <>
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <path d="M2 20h20" />
    </>
  ),
  liste: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" />
    </>
  ),
  pfad: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M6 17v-3a4 4 0 0 1 4-4h4a4 4 0 0 0 4-4V7" />
    </>
  ),
  papierkorb: (
    <>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </>
  ),
  pokal: (
    <>
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </>
  ),

  // --- Knöpfe und Zustände -------------------------------------------------------
  pfeilRechts: <path d="M5 12h14M13 6l6 6-6 6" />,
  pfeilLinks: <path d="M19 12H5M11 18l-6-6 6-6" />,
  zuruecksetzen: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  kreuz: <path d="M18 6 6 18M6 6l12 12" />,
  vergroessern: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  verkleinern: <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />,
  kreisHaken: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  kreisKreuz: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </>
  ),
  kaestchen: <rect x="4" y="4" width="16" height="16" rx="3" />,
  abspielen: <path d="M7 4.5v15a.5.5 0 0 0 .8.4l11.4-7.5a.5.5 0 0 0 0-.8L7.8 4.1a.5.5 0 0 0-.8.4z" fill="currentColor" />,

  // --- Editors of parts 8 and 9: files, services, beans --------------------------
  ordner: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  datei: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </>
  ),
  // A Docker image, a bean - something packed and ready to use.
  paket: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </>
  ),
  globus: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </>
  ),
  // Published ports of a container.
  stecker: (
    <>
      <path d="M9 2v5M15 2v5" />
      <path d="M6 7h12v4a6 6 0 0 1-12 0z" />
      <path d="M12 17v5" />
    </>
  ),
  // Volumes of a container.
  festplatte: (
    <>
      <path d="M22 13H2l3.4-7.2A2 2 0 0 1 7.2 4.6h9.6a2 2 0 0 1 1.8 1.2z" />
      <rect x="2" y="13" width="20" height="7" rx="2" />
      <path d="M6 16.5h.01M10 16.5h.01" />
    </>
  ),
  zahnrad: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  // Spring's leaf.
  blatt: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z" />
      <path d="M2 21c0-3 1.9-5.4 5.2-6.1 2.4-.5 4.9-2 5.8-3.9" />
    </>
  ),
}

export type IconName = keyof typeof PFADE

export function Icon({ name, className = 'size-4' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      {PFADE[name]}
    </svg>
  )
}

/**
 * Bildmarke der App: ein Weg von einem offenen Startpunkt zu einem erreichten Ziel -
 * der Lernpfad. Dieselbe Form steht im Favicon (public/favicon.svg).
 * Die Kachel hat einen leichten Verlauf und einen hellen Innenrand, damit sie
 * auf hellem und dunklem Grund gleich plastisch wirkt.
 */
export function Logo({ className = 'size-8' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center rounded-[28%] bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-sm ring-1 ring-white/20 ring-inset ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" className="size-[62%]">
        <circle cx="6" cy="18.5" r="2.3" />
        <path d="M6 16.2V14a4 4 0 0 1 4-4h4a4 4 0 0 0 4-4v-.5" />
        <circle cx="18" cy="5" r="2.6" fill="currentColor" stroke="none" />
      </svg>
    </span>
  )
}

/** Farbiges Symbol eines Kursteils - überall dieselbe Kachel (Seitenleiste, Startseite, Kapitelkopf, Playground). */
export function TeilSymbol({ teil, groesse = 'normal' }: { teil: string; groesse?: 'klein' | 'normal' | 'gross' }) {
  const stil = TEIL_STIL[teil] ?? TEIL_STIL.javascript
  // [Kachel, Icon, Kürzel]
  const masse = {
    klein: ['size-5 rounded-[5px]', 'size-3', 'text-[8.5px]'],
    normal: ['size-6 rounded-md', 'size-3.5', 'text-[10px]'],
    gross: ['size-9 rounded-lg', 'size-5', 'text-[13px]'],
  }[groesse]
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center shadow-xs ring-1 ring-inset ${masse[0]} ${stil.farbe}`}
    >
      {stil.kuerzel ? (
        <span className={`leading-none font-extrabold tracking-tight ${masse[2]}`}>{stil.kuerzel}</span>
      ) : (
        <Icon name={stil.icon} className={masse[1]} />
      )}
    </span>
  )
}
