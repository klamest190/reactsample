/**
 * JAVA-TEIL · Der Syntaxbaum (AST = abstract syntax tree)
 *
 * Reine Datentypen: So sieht ein Java-Programm aus, nachdem der Parser es
 * gelesen hat. Der Interpreter läuft später genau über diese Knoten.
 *
 * Jeder Knoten kennt seine `zeile` - nur deshalb können Fehlermeldungen
 * sagen, WO etwas schiefgegangen ist.
 */

/** Ein Typ im Quelltext: `int`, `String`, `List<String>`, `int[][]`. */
export type TypRef = {
  name: string
  /** Anzahl der [] - `int[][]` hat 2. */
  dimensionen: number
  /** Generics werden gelesen, aber (wie in echtem Java zur Laufzeit) vergessen. */
  argumente: TypRef[]
}

export const TYP_UNBEKANNT: TypRef = { name: 'var', dimensionen: 0, argumente: [] }

export type Sichtbarkeit = 'public' | 'protected' | 'private' | 'paket'

export type ParamDekl = { name: string; typ: TypRef; varargs: boolean }

export type FeldDekl = {
  name: string
  typ: TypRef
  statisch: boolean
  final: boolean
  sichtbarkeit: Sichtbarkeit
  init?: Ausdruck
  zeile: number
}

export type MethodenDekl = {
  name: string
  rueckgabe: TypRef
  parameter: ParamDekl[]
  /** Fehlt bei abstrakten Methoden und Interface-Methoden ohne default. */
  rumpf?: Block
  statisch: boolean
  abstrakt: boolean
  sichtbarkeit: Sichtbarkeit
  /** Konstruktoren sind Methoden ohne Rückgabetyp, die so heißen wie die Klasse. */
  konstruktor: boolean
  zeile: number
}

export type TypDeklaration = {
  art: 'klasse' | 'interface' | 'enum'
  name: string
  abstrakt: boolean
  oberklasse?: string
  interfaces: string[]
  felder: FeldDekl[]
  methoden: MethodenDekl[]
  /** Nur bei enum: die Konstanten in Reihenfolge. */
  konstanten: { name: string; argumente: Ausdruck[] }[]
  /** Nur bei record: die Komponenten (werden zu final-Feldern + Gettern). */
  komponenten?: ParamDekl[]
  /** Bei verschachtelten Klassen: die umgebende Klasse - deren static-Felder sind sichtbar. */
  aeussere?: string
  zeile: number
}

export type Programm = {
  typen: TypDeklaration[]
  /** package/import werden gelesen und ignoriert - hier gibt es nur eine Datei. */
  importe: string[]
}

// ---------------------------------------------------------------------------
// Anweisungen
// ---------------------------------------------------------------------------

export type Block = { art: 'block'; anweisungen: Anweisung[]; zeile: number }

export type VarDekl = { name: string; dimensionen: number; init?: Ausdruck }

export type Anweisung =
  | Block
  | { art: 'lokal'; typ: TypRef; final: boolean; variablen: VarDekl[]; zeile: number }
  | { art: 'ausdruck'; ausdruck: Ausdruck; zeile: number }
  | { art: 'if'; bedingung: Ausdruck; dann: Anweisung; sonst?: Anweisung; zeile: number }
  | { art: 'while'; bedingung: Ausdruck; rumpf: Anweisung; zeile: number }
  | { art: 'doWhile'; bedingung: Ausdruck; rumpf: Anweisung; zeile: number }
  | { art: 'for'; init: Anweisung[]; bedingung?: Ausdruck; schritt: Ausdruck[]; rumpf: Anweisung; zeile: number }
  | { art: 'forEach'; typ: TypRef; name: string; quelle: Ausdruck; rumpf: Anweisung; zeile: number }
  | { art: 'switch'; wert: Ausdruck; faelle: SwitchFall[]; pfeil: boolean; zeile: number }
  | { art: 'return'; wert?: Ausdruck; zeile: number }
  | { art: 'break'; zeile: number }
  | { art: 'continue'; zeile: number }
  | { art: 'throw'; wert: Ausdruck; zeile: number }
  | { art: 'try'; rumpf: Block; faenger: Faenger[]; schliesslich?: Block; zeile: number }
  | { art: 'leer'; zeile: number }

export type SwitchFall = {
  /** Leer = `default`. Mehrere Werte für `case 1, 2 ->` bzw. gestapelte `case`. */
  werte: Ausdruck[]
  anweisungen: Anweisung[]
  /** Bei `case x -> ausdruck;` der Wert, den das switch liefert. */
  ergebnis?: Ausdruck
}

export type Faenger = { typen: string[]; name: string; rumpf: Block }

// ---------------------------------------------------------------------------
// Ausdrücke
// ---------------------------------------------------------------------------

export type Literal =
  | { typ: 'int'; wert: number }
  | { typ: 'double'; wert: number }
  | { typ: 'boolean'; wert: boolean }
  | { typ: 'char'; wert: number }
  | { typ: 'String'; wert: string }
  | { typ: 'null' }

export type Ausdruck =
  | { art: 'literal'; wert: Literal; zeile: number }
  | { art: 'name'; name: string; zeile: number }
  | { art: 'this'; zeile: number }
  | { art: 'feld'; ziel: Ausdruck; name: string; zeile: number }
  | { art: 'aufruf'; ziel?: Ausdruck; name: string; argumente: Ausdruck[]; ueberSuper: boolean; zeile: number }
  | { art: 'neu'; klasse: string; argumente: Ausdruck[]; zeile: number }
  | { art: 'neuArray'; typ: TypRef; groessen: Ausdruck[]; werte?: Ausdruck[]; zeile: number }
  | { art: 'arrayWerte'; werte: Ausdruck[]; zeile: number }
  | { art: 'index'; ziel: Ausdruck; index: Ausdruck; zeile: number }
  | { art: 'zuweisung'; ziel: Ausdruck; operator: string; wert: Ausdruck; zeile: number }
  | { art: 'binaer'; operator: string; links: Ausdruck; rechts: Ausdruck; zeile: number }
  | { art: 'unaer'; operator: string; ausdruck: Ausdruck; zeile: number }
  | { art: 'stufe'; operator: '++' | '--'; ziel: Ausdruck; vorher: boolean; zeile: number }
  | { art: 'ternaer'; bedingung: Ausdruck; dann: Ausdruck; sonst: Ausdruck; zeile: number }
  | { art: 'instanceof'; ausdruck: Ausdruck; typ: string; bindung?: string; zeile: number }
  | { art: 'cast'; typ: TypRef; ausdruck: Ausdruck; zeile: number }
  | { art: 'lambda'; parameter: string[]; rumpf: Ausdruck | Block; zeile: number }
  | { art: 'methodenRef'; ziel: string; name: string; zeile: number }
  | { art: 'super'; zeile: number }
  /** switch als Ausdruck (Java 14+): `int t = switch (tag) { case 1 -> 10; … };` */
  | { art: 'switchAusdruck'; anweisung: Anweisung; zeile: number }
