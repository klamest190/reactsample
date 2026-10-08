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

import type { MethodDecl, TypeDecl } from './ast'

export type Value =
  | { kind: 'int'; value: number }
  | { kind: 'long'; value: number }
  | { kind: 'double'; value: number }
  | { kind: 'char'; value: number }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'null' }
  | JavaString
  | JavaArray
  | JavaObject
  | NativeValue
  | JavaFunction

/**
 * Strings sind eigene Objekte - genau deshalb ist `==` bei Strings in Java
 * eine Falle. Gleiche Literale teilen sich ein Objekt ("String-Pool"),
 * zur Laufzeit zusammengebaute Strings bekommen ein neues.
 */
export type JavaString = { kind: 'string'; value: string }
export type JavaArray = { kind: 'array'; type: string; values: Value[] }
export type JavaObject = { kind: 'object'; classInfo: ClassInfo; fields: Map<string, Value> }
/** Alles aus der Standardbibliothek: ArrayList, HashMap, StringBuilder, … */
export type NativeValue = { kind: 'native'; type: string; data: NativeData }
/** Ein Lambda bzw. eine Methodenreferenz. */
export type JavaFunction = { kind: 'function'; call: (args: Value[]) => Value }

export type NativeData = {
  list?: Value[]
  map?: Map<string, { key: Value; value: Value }>
  text?: string
  number?: number
  classInfo?: ClassInfo
  /** Bei Exceptions: die Nachricht. */
  message?: string
}

/** Eine Klasse zur Laufzeit - das, was die JVM beim Laden aufbaut. */
export type ClassInfo = {
  name: string
  decl: TypeDecl
  superclass?: ClassInfo
  /** Umgebende Klasse bei verschachtelten Klassen - deren static-Felder sind sichtbar. */
  outer?: ClassInfo
  /** Alle Interfaces inkl. der geerbten, nur die Namen. */
  interfaces: Set<string>
  /** Statische Felder gehören der Klasse, nicht den Objekten. */
  isStatic: Map<string, Value>
  /** Methodenname → alle Überladungen. */
  methods: Map<string, MethodDecl[]>
  constructors: MethodDecl[]
  isAbstract: boolean
  isInterface: boolean
  isEnum: boolean
}

// ---------------------------------------------------------------------------
// Bauen
// ---------------------------------------------------------------------------

export const NULL: Value = { kind: 'null' }
export const number = (value: number): Value => ({ kind: 'int', value: value | 0 })
export const comma = (value: number): Value => ({ kind: 'double', value })
export const bool = (value: boolean): Value => ({ kind: 'boolean', value })
export const chars = (value: number): Value => ({ kind: 'char', value })

/** Der String-Pool: gleiche Literale sind dasselbe Objekt (wie in Java). */
const pool = new Map<string, JavaString>()
export function poolString(value: string): JavaString {
  let existing = pool.get(value)
  if (!existing) {
    existing = { kind: 'string', value }
    pool.set(value, existing)
  }
  return existing
}
/** Zur Laufzeit entstandener String - bewusst ein NEUES Objekt. */
export const newString = (value: string): JavaString => ({ kind: 'string', value })

// ---------------------------------------------------------------------------
// Fragen an Werte
// ---------------------------------------------------------------------------

export const isNumber = (w: Value) => w.kind === 'int' || w.kind === 'long' || w.kind === 'double' || w.kind === 'char'
export const isInteger = (w: Value) => w.kind === 'int' || w.kind === 'long' || w.kind === 'char'

/** Der Zahlenwert - für alle Arten, die in Java als Zahl rechnen. */
export function toNumber(w: Value): number {
  if (w.kind === 'int' || w.kind === 'long' || w.kind === 'double' || w.kind === 'char') return w.value
  if (w.kind === 'boolean') return w.value ? 1 : 0
  return NaN
}

/** Der Typname, wie ihn Java in Fehlermeldungen schreibt. */
export function typeName(w: Value): string {
  switch (w.kind) {
    case 'string':
      return 'String'
    case 'null':
      return 'null'
    case 'array':
      return w.type + '[]'
    case 'object':
      return w.classInfo.name
    case 'native':
      return w.type
    case 'function':
      return 'lambda'
    default:
      return w.kind
  }
}

/** Zählt Objekte durch, damit `Object@1a2b3c` stabil ist. */
const identities = new WeakMap<object, number>()
let nextId = 0x1b6d0000
export function identity(object: object): string {
  let id = identities.get(object)
  if (id === undefined) {
    id = nextId += 0x2f1d
    identities.set(object, id)
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
  const amount = Math.abs(v)
  if (v !== 0 && (amount >= 1e7 || amount < 1e-3)) {
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
export function textOf(w: Value, objectText: (o: JavaObject | NativeValue) => string): string {
  switch (w.kind) {
    case 'null':
      return 'null'
    case 'boolean':
      return String(w.value)
    case 'char':
      return String.fromCharCode(w.value)
    case 'int':
    case 'long':
      return String(w.value)
    case 'double':
      return doubleText(w.value)
    case 'string':
      return w.value
    case 'array':
      // Genau diese kryptische Ausgabe ist der Grund, warum es Arrays.toString() gibt.
      return `[${shortName(w.type)}@${identity(w)}`
    case 'function':
      return `$$Lambda@${identity(w)}`
    default:
      return objectText(w)
  }
}

const SHORT_NAMES: Record<string, string> = { int: 'I', long: 'J', double: 'D', boolean: 'Z', char: 'C', float: 'F' }
const shortName = (type: string) => SHORT_NAMES[type] ?? 'L' + type + ';'

// ---------------------------------------------------------------------------
// Vergleichen
// ---------------------------------------------------------------------------

/** `equals`: Inhalt statt Identität. Für Listen und Maps rekursiv. */
export function contentEquals(a: Value, b: Value): boolean {
  if (a.kind === 'null' || b.kind === 'null') return a.kind === b.kind
  if (isNumber(a) && isNumber(b)) {
    // Achtung: In echtem Java ist Integer.equals(Long) false - das ist hier bewusst
    // vereinfacht, weil der Kurs mit int und double arbeitet.
    return toNumber(a) === toNumber(b)
  }
  if (a.kind === 'boolean' && b.kind === 'boolean') return a.value === b.value
  if (a.kind === 'string' && b.kind === 'string') return a.value === b.value
  if (a.kind === 'array' && b.kind === 'array') return a === b
  if (a.kind === 'native' && b.kind === 'native') {
    if (a.type !== b.type) return false
    if (a.data.list && b.data.list) {
      return a.data.list.length === b.data.list.length && a.data.list.every((x, i) => contentEquals(x, b.data.list![i]))
    }
    if (a.data.map && b.data.map) {
      if (a.data.map.size !== b.data.map.size) return false
      for (const [k, entry] of a.data.map) {
        const other = b.data.map.get(k)
        if (!other || !contentEquals(entry.value, other.value)) return false
      }
      return true
    }
    return a === b
  }
  return a === b
}

/** Schlüssel für HashMap/HashSet: gleicher Inhalt → gleicher Schlüssel. */
export function keyOf(w: Value): string {
  switch (w.kind) {
    case 'null':
      return 'null'
    case 'string':
      return 's:' + w.value
    case 'boolean':
      return 'b:' + w.value
    case 'char':
      return 'c:' + w.value
    case 'int':
    case 'long':
    case 'double':
      return 'n:' + w.value
    case 'object':
      return 'o:' + identity(w)
    default:
      return 'x:' + identity(w as object)
  }
}
