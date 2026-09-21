/**
 * JAVA-TEIL · Die Werte zur Laufzeit
 *
 * Java kennt den Unterschied zwischen `int` und `double` auch noch, wenn das
 * Programm läuft - JavaScript hat dagegen nur eine einzige Zahlenart. Deshalb
 * merkt sich jeder Wert hier seine Art. Nur so stimmen die typischen
 * Java-Ergebnisse:
 *
 *   7 / 2        →  3      (int-Division schneidet ab)
 *   7 / 2.0      →  3.5
 *   'A' + 1      →  66     (char rechnet als Zahl)
 *   System.out.println(1.0) → "1.0"  (nicht "1")
 */

import type { MethodenDekl, TypDeklaration } from './ast'

export type Wert =
  | { art: 'int'; wert: number }
  | { art: 'long'; wert: number }
  | { art: 'double'; wert: number }
  | { art: 'char'; wert: number }
  | { art: 'boolean'; wert: boolean }
  | { art: 'null' }
  | JavaString
  | JavaArray
  | JavaObjekt
  | NativWert
  | JavaFunktion

/**
 * Strings sind eigene Objekte - genau deshalb ist `==` bei Strings in Java
 * eine Falle. Gleiche Literale teilen sich ein Objekt ("String-Pool"),
 * zur Laufzeit zusammengebaute Strings bekommen ein neues.
 */
export type JavaString = { art: 'string'; wert: string }
export type JavaArray = { art: 'array'; typ: string; werte: Wert[] }
export type JavaObjekt = { art: 'objekt'; klasse: Klasse; felder: Map<string, Wert> }
/** Alles aus der Standardbibliothek: ArrayList, HashMap, StringBuilder, … */
export type NativWert = { art: 'nativ'; typ: string; daten: NativDaten }
/** Ein Lambda bzw. eine Methodenreferenz. */
export type JavaFunktion = { art: 'funktion'; aufrufen: (argumente: Wert[]) => Wert }

export type NativDaten = {
  liste?: Wert[]
  map?: Map<string, { schluessel: Wert; wert: Wert }>
  text?: string
  zahl?: number
  klasse?: Klasse
  /** Bei Exceptions: die Nachricht. */
  meldung?: string
}

/** Eine Klasse zur Laufzeit - das, was die JVM beim Laden aufbaut. */
export type Klasse = {
  name: string
  dekl: TypDeklaration
  oberklasse?: Klasse
  /** Umgebende Klasse bei verschachtelten Klassen - deren static-Felder sind sichtbar. */
  aeussere?: Klasse
  /** Alle Interfaces inkl. der geerbten, nur die Namen. */
  interfaces: Set<string>
  /** Statische Felder gehören der Klasse, nicht den Objekten. */
  statisch: Map<string, Wert>
  /** Methodenname → alle Überladungen. */
  methoden: Map<string, MethodenDekl[]>
  konstruktoren: MethodenDekl[]
  abstrakt: boolean
  istInterface: boolean
  istEnum: boolean
}

// ---------------------------------------------------------------------------
// Bauen
// ---------------------------------------------------------------------------

export const NULL: Wert = { art: 'null' }
export const zahl = (wert: number): Wert => ({ art: 'int', wert: wert | 0 })
export const komma = (wert: number): Wert => ({ art: 'double', wert })
export const wahrheit = (wert: boolean): Wert => ({ art: 'boolean', wert })
export const zeichen = (wert: number): Wert => ({ art: 'char', wert })

/** Der String-Pool: gleiche Literale sind dasselbe Objekt (wie in Java). */
const pool = new Map<string, JavaString>()
export function poolString(wert: string): JavaString {
  let vorhanden = pool.get(wert)
  if (!vorhanden) {
    vorhanden = { art: 'string', wert }
    pool.set(wert, vorhanden)
  }
  return vorhanden
}
/** Zur Laufzeit entstandener String - bewusst ein NEUES Objekt. */
export const neuerString = (wert: string): JavaString => ({ art: 'string', wert })

// ---------------------------------------------------------------------------
// Fragen an Werte
// ---------------------------------------------------------------------------

export const istZahl = (w: Wert) => w.art === 'int' || w.art === 'long' || w.art === 'double' || w.art === 'char'
export const istGanz = (w: Wert) => w.art === 'int' || w.art === 'long' || w.art === 'char'

/** Der Zahlenwert - für alle Arten, die in Java als Zahl rechnen. */
export function alsZahl(w: Wert): number {
  if (w.art === 'int' || w.art === 'long' || w.art === 'double' || w.art === 'char') return w.wert
  if (w.art === 'boolean') return w.wert ? 1 : 0
  return NaN
}

/** Der Typname, wie ihn Java in Fehlermeldungen schreibt. */
export function typName(w: Wert): string {
  switch (w.art) {
    case 'string':
      return 'String'
    case 'null':
      return 'null'
    case 'array':
      return w.typ + '[]'
    case 'objekt':
      return w.klasse.name
    case 'nativ':
      return w.typ
    case 'funktion':
      return 'lambda'
    default:
      return w.art
  }
}

/** Zählt Objekte durch, damit `Object@1a2b3c` stabil ist. */
const identitaeten = new WeakMap<object, number>()
let naechsteId = 0x1b6d0000
export function identitaet(objekt: object): string {
  let id = identitaeten.get(objekt)
  if (id === undefined) {
    id = naechsteId += 0x2f1d
    identitaeten.set(objekt, id)
  }
  return id.toString(16)
}

// ---------------------------------------------------------------------------
// Ausgabe
// ---------------------------------------------------------------------------

/**
 * Wie Java eine Kommazahl schreibt: `1.0`, `0.30000000000000004`, `1.0E10`.
 * (JavaScript würde `1`, `0.30000000000000004` und `10000000000` sagen.)
 */
export function doubleText(v: number): string {
  if (Number.isNaN(v)) return 'NaN'
  if (v === Infinity) return 'Infinity'
  if (v === -Infinity) return '-Infinity'
  const betrag = Math.abs(v)
  if (v !== 0 && (betrag >= 1e7 || betrag < 1e-3)) {
    const [mantisse, exponent] = v.toExponential().split('e')
    return `${mantisse.includes('.') ? mantisse : mantisse + '.0'}E${Number(exponent)}`
  }
  const text = String(v)
  return /[.e]/.test(text) ? text : text + '.0'
}

/**
 * `String.valueOf(wert)` - also das, was `System.out.println` ausgibt.
 * Für eigene Objekte wird `toString()` gebraucht; das kann nur der
 * Interpreter aufrufen und reicht sich deshalb als `objektText` herein.
 */
export function textVon(w: Wert, objektText: (o: JavaObjekt | NativWert) => string): string {
  switch (w.art) {
    case 'null':
      return 'null'
    case 'boolean':
      return String(w.wert)
    case 'char':
      return String.fromCharCode(w.wert)
    case 'int':
    case 'long':
      return String(w.wert)
    case 'double':
      return doubleText(w.wert)
    case 'string':
      return w.wert
    case 'array':
      // Genau diese kryptische Ausgabe ist der Grund, warum es Arrays.toString() gibt.
      return `[${kuerzel(w.typ)}@${identitaet(w)}`
    case 'funktion':
      return `$$Lambda@${identitaet(w)}`
    default:
      return objektText(w)
  }
}

const KUERZEL: Record<string, string> = { int: 'I', long: 'J', double: 'D', boolean: 'Z', char: 'C', float: 'F' }
const kuerzel = (typ: string) => KUERZEL[typ] ?? 'L' + typ + ';'

// ---------------------------------------------------------------------------
// Vergleichen
// ---------------------------------------------------------------------------

/** `equals`: Inhalt statt Identität. Für Listen und Maps rekursiv. */
export function inhaltGleich(a: Wert, b: Wert): boolean {
  if (a.art === 'null' || b.art === 'null') return a.art === b.art
  if (istZahl(a) && istZahl(b)) {
    // Achtung: In echtem Java ist Integer.equals(Long) false - das ist hier bewusst
    // vereinfacht, weil der Kurs mit int und double arbeitet.
    return alsZahl(a) === alsZahl(b)
  }
  if (a.art === 'boolean' && b.art === 'boolean') return a.wert === b.wert
  if (a.art === 'string' && b.art === 'string') return a.wert === b.wert
  if (a.art === 'array' && b.art === 'array') return a === b
  if (a.art === 'nativ' && b.art === 'nativ') {
    if (a.typ !== b.typ) return false
    if (a.daten.liste && b.daten.liste) {
      return a.daten.liste.length === b.daten.liste.length && a.daten.liste.every((x, i) => inhaltGleich(x, b.daten.liste![i]))
    }
    if (a.daten.map && b.daten.map) {
      if (a.daten.map.size !== b.daten.map.size) return false
      for (const [k, eintrag] of a.daten.map) {
        const anderer = b.daten.map.get(k)
        if (!anderer || !inhaltGleich(eintrag.wert, anderer.wert)) return false
      }
      return true
    }
    return a === b
  }
  return a === b
}

/** Schlüssel für HashMap/HashSet: gleicher Inhalt → gleicher Schlüssel. */
export function schluesselVon(w: Wert): string {
  switch (w.art) {
    case 'null':
      return 'null'
    case 'string':
      return 's:' + w.wert
    case 'boolean':
      return 'b:' + w.wert
    case 'char':
      return 'c:' + w.wert
    case 'int':
    case 'long':
    case 'double':
      return 'n:' + w.wert
    case 'objekt':
      return 'o:' + identitaet(w)
    default:
      return 'x:' + identitaet(w as object)
  }
}
