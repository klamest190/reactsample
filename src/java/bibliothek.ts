/**
 * JAVA-TEIL · Die Standardbibliothek in klein
 *
 * Java bringt Tausende Klassen mit. Für die Grundlagen braucht man davon
 * erstaunlich wenige - genau die stehen hier: System.out, Math, String,
 * die Wrapper (Integer, Double …), Arrays, ArrayList, HashMap, StringBuilder,
 * ein paar Streams und die üblichen Exceptions.
 *
 * Jede Methode ist ein kurzer TypeScript-Fall. Das ist ehrlicher als es
 * aussieht: Auch im echten JDK sind viele dieser Methoden nur wenige Zeilen.
 */

import type { Interpreter } from './interpreter'
import {
  alsZahl,
  doubleText,
  inhaltGleich,
  istZahl,
  komma,
  neuerString,
  NULL,
  poolString,
  schluesselVon,
  typName,
  wahrheit,
  zahl,
  zeichen,
  type JavaString,
  type NativWert,
  type Wert,
} from './werte'

/** Klassen, die man ohne `new` ansprechen kann: `Math.max(…)`, `Integer.parseInt(…)`. */
export const EINGEBAUTE_KLASSEN = new Set([
  'System', 'Math', 'String', 'Integer', 'Double', 'Boolean', 'Character', 'Long', 'Float', 'Short', 'Byte',
  'Arrays', 'Collections', 'List', 'Map', 'Set', 'Objects', 'Optional', 'Comparator', 'Collectors', 'Stream', 'IntStream',
])

/** Klassen, die man mit `new` erzeugen kann. */
const NATIV_ERZEUGBAR = new Set([
  'ArrayList', 'LinkedList', 'HashMap', 'LinkedHashMap', 'TreeMap', 'HashSet', 'LinkedHashSet', 'TreeSet',
  'StringBuilder', 'StringBuffer', 'String', 'Random', 'Object',
])

/** Die Vererbungskette der Exceptions - die braucht `catch`. */
const OBERKLASSEN: Record<string, string> = {
  Exception: 'Throwable',
  Error: 'Throwable',
  RuntimeException: 'Exception',
  IOException: 'Exception',
  FileNotFoundException: 'IOException',
  InterruptedException: 'Exception',
  ArithmeticException: 'RuntimeException',
  NullPointerException: 'RuntimeException',
  ClassCastException: 'RuntimeException',
  IllegalArgumentException: 'RuntimeException',
  NumberFormatException: 'IllegalArgumentException',
  IllegalStateException: 'RuntimeException',
  IndexOutOfBoundsException: 'RuntimeException',
  ArrayIndexOutOfBoundsException: 'IndexOutOfBoundsException',
  StringIndexOutOfBoundsException: 'IndexOutOfBoundsException',
  NegativeArraySizeException: 'RuntimeException',
  UnsupportedOperationException: 'RuntimeException',
  ConcurrentModificationException: 'RuntimeException',
  NoSuchElementException: 'RuntimeException',
  InputMismatchException: 'NoSuchElementException',
  StackOverflowError: 'Error',
  OutOfMemoryError: 'Error',
  // Sammlungen: nur so weit, wie instanceof es im Kurs braucht.
  ArrayList: 'AbstractList',
  AbstractList: 'List',
  LinkedList: 'AbstractList',
  List: 'Collection',
  Set: 'Collection',
  HashSet: 'Set',
  LinkedHashSet: 'HashSet',
  TreeSet: 'Set',
  HashMap: 'Map',
  LinkedHashMap: 'HashMap',
  TreeMap: 'Map',
  Collection: 'Iterable',
}

export const oberklasseVon = (name: string): string | undefined => OBERKLASSEN[name]

export function istAusnahmeKlasse(name: string): boolean {
  if (name === 'Throwable') return true
  if (name.endsWith('Exception') || name.endsWith('Error')) return true
  for (let k = OBERKLASSEN[name]; k; k = OBERKLASSEN[k]) if (k === 'Throwable') return true
  return false
}

// ---------------------------------------------------------------------------
// Kleine Helfer
// ---------------------------------------------------------------------------

const liste = (werte: Wert[], typ = 'ArrayList'): NativWert => ({ art: 'nativ', typ, daten: { liste: werte } })
const optional = (werte: Wert[]): NativWert => ({ art: 'nativ', typ: 'Optional', daten: { liste: werte } })
const map = (typ = 'HashMap'): NativWert => ({ art: 'nativ', typ, daten: { map: new Map() } })

function listeVon(wert: Wert, i: Interpreter, zeile: number): Wert[] {
  if (wert.art === 'array') return wert.werte
  if (wert.art === 'nativ' && wert.daten.liste) return wert.daten.liste
  i.abbruch(`${typName(wert)} ist keine Liste.`, `${typName(wert)} is not a list`, zeile)
}

/** Natürliche Ordnung: Zahlen nach Größe, Strings alphabetisch, sonst compareTo. */
export function vergleichen(a: Wert, b: Wert, i: Interpreter): number {
  if (istZahl(a) && istZahl(b)) return alsZahl(a) - alsZahl(b)
  if (a.art === 'string' && b.art === 'string') return a.wert < b.wert ? -1 : a.wert > b.wert ? 1 : 0
  if (a.art === 'boolean' && b.art === 'boolean') return Number(a.wert) - Number(b.wert)
  if (a.art === 'objekt') return alsZahl(i.methodeAufrufen(a, 'compareTo', [b], 0))
  return 0
}

/** Ruft ein Lambda oder ein Objekt mit passender Methode auf. */
function funktionAufrufen(funktion: Wert, argumente: Wert[], i: Interpreter, zeile: number, methode = 'apply'): Wert {
  if (funktion.art === 'funktion') return funktion.aufrufen(argumente)
  if (funktion.art === 'objekt' || funktion.art === 'nativ') return i.methodeAufrufen(funktion, methode, argumente, zeile)
  i.abbruch('Hier wird ein Lambda erwartet.', 'a lambda expression is required here', zeile)
}

const vergleicher = (funktion: Wert, i: Interpreter, zeile: number) => (a: Wert, b: Wert) =>
  alsZahl(funktionAufrufen(funktion, [a, b], i, zeile, 'compare'))

/**
 * `String.format` und `printf`: %d %s %f %b %c %n, mit Breite und Genauigkeit.
 * Beispiele: %5d (rechtsbündig), %-10s (linksbündig), %.2f (zwei Nachkommastellen).
 */
export function formatieren(vorlage: string, argumente: Wert[], i: Interpreter, zeile: number): string {
  let index = 0
  return vorlage.replace(/%(-)?(\d+)?(?:\.(\d+))?([sdfnb%c])/g, (_treffer, links, breite, genauigkeit, art) => {
    if (art === '%') return '%'
    if (art === 'n') return '\n'
    const wert = argumente[index++]
    if (wert === undefined) i.werfen('IllegalArgumentException', 'MissingFormatArgumentException: %' + art, zeile)
    let text: string
    switch (art) {
      case 'd':
        text = String(Math.trunc(alsZahl(wert)))
        break
      case 'f':
        text = alsZahl(wert).toFixed(genauigkeit === undefined ? 6 : Number(genauigkeit))
        break
      case 'b':
        text = String(wert.art === 'boolean' ? wert.wert : wert.art !== 'null')
        break
      case 'c':
        text = wert.art === 'char' ? String.fromCharCode(wert.wert) : i.alsText(wert)
        break
      default:
        text = i.alsText(wert)
        if (genauigkeit !== undefined) text = text.slice(0, Number(genauigkeit))
    }
    const platz = breite ? Number(breite) : 0
    if (text.length >= platz) return text
    return links ? text.padEnd(platz) : text.padStart(platz)
  })
}

// ---------------------------------------------------------------------------
// Statische Felder: System.out, Math.PI, Integer.MAX_VALUE …
// ---------------------------------------------------------------------------

export function statischesFeld(klasse: string, name: string, _i: Interpreter): Wert | null {
  if (klasse === 'System') {
    if (name === 'out' || name === 'err') return { art: 'nativ', typ: 'PrintStream', daten: { text: name } }
    if (name === 'in') return { art: 'nativ', typ: 'InputStream', daten: {} }
  }
  if (klasse === 'Math') {
    if (name === 'PI') return komma(Math.PI)
    if (name === 'E') return komma(Math.E)
  }
  if (klasse === 'Integer') {
    if (name === 'MAX_VALUE') return zahl(2147483647)
    if (name === 'MIN_VALUE') return zahl(-2147483648)
  }
  if (klasse === 'Long') {
    // Hinweis: JavaScript-Zahlen können den echten long-Bereich nicht genau
    // darstellen - für den Kurs genügt der gerundete Wert.
    if (name === 'MAX_VALUE') return { art: 'long', wert: Number.MAX_SAFE_INTEGER }
    if (name === 'MIN_VALUE') return { art: 'long', wert: Number.MIN_SAFE_INTEGER }
  }
  if (klasse === 'Double') {
    if (name === 'MAX_VALUE') return komma(Number.MAX_VALUE)
    if (name === 'MIN_VALUE') return komma(Number.MIN_VALUE)
    if (name === 'NaN') return komma(NaN)
    if (name === 'POSITIVE_INFINITY') return komma(Infinity)
    if (name === 'NEGATIVE_INFINITY') return komma(-Infinity)
  }
  if (klasse === 'Character' && name === 'MAX_VALUE') return zeichen(65535)
  return null
}

// ---------------------------------------------------------------------------
// Statische Methoden
// ---------------------------------------------------------------------------

export function statischerAufruf(klasse: string, name: string, a: Wert[], i: Interpreter, zeile: number): Wert {
  const text = (index: number) => i.alsText(a[index])
  const n = (index: number) => alsZahl(a[index])

  switch (klasse) {
    case 'Math':
      switch (name) {
        case 'abs':
          return a[0].art === 'double' ? komma(Math.abs(n(0))) : zahl(Math.abs(n(0)))
        case 'max':
          return a[0].art === 'double' || a[1].art === 'double' ? komma(Math.max(n(0), n(1))) : zahl(Math.max(n(0), n(1)))
        case 'min':
          return a[0].art === 'double' || a[1].art === 'double' ? komma(Math.min(n(0), n(1))) : zahl(Math.min(n(0), n(1)))
        case 'pow':
          return komma(Math.pow(n(0), n(1)))
        case 'sqrt':
          return komma(Math.sqrt(n(0)))
        case 'cbrt':
          return komma(Math.cbrt(n(0)))
        case 'round':
          return zahl(Math.round(n(0)))
        case 'floor':
          return komma(Math.floor(n(0)))
        case 'ceil':
          return komma(Math.ceil(n(0)))
        case 'random':
          return komma(Math.random())
        case 'hypot':
          return komma(Math.hypot(n(0), n(1)))
        case 'signum':
          return komma(Math.sign(n(0)))
        case 'floorDiv':
          return zahl(Math.floor(n(0) / n(1)))
        case 'floorMod':
          return zahl(((n(0) % n(1)) + n(1)) % n(1))
        case 'toRadians':
          return komma((n(0) * Math.PI) / 180)
        case 'toDegrees':
          return komma((n(0) * 180) / Math.PI)
        default: {
          const funktion = (Math as unknown as Record<string, (x: number) => number>)[name]
          if (typeof funktion === 'function') return komma(funktion(n(0)))
        }
      }
      break

    case 'String':
      if (name === 'valueOf') return neuerString(text(0))
      if (name === 'format') return neuerString(formatieren(text(0), a.slice(1), i, zeile))
      if (name === 'join') {
        const teile = a.length === 2 && (a[1].art === 'array' || a[1].art === 'nativ') ? listeVon(a[1], i, zeile) : a.slice(1)
        return neuerString(teile.map((w) => i.alsText(w)).join(text(0)))
      }
      break

    case 'Integer':
    case 'Long':
    case 'Short':
    case 'Byte':
      if (name === 'parseInt' || name === 'parseLong' || name === 'valueOf') {
        if (a[0].art !== 'string') return zahl(n(0))
        const roh = a[0].wert.trim()
        if (!/^[+-]?\d+$/.test(roh)) i.werfen('NumberFormatException', `For input string: "${a[0].wert}"`, zeile)
        return zahl(Number(roh))
      }
      if (name === 'toString') return neuerString(String(Math.trunc(n(0))))
      if (name === 'toBinaryString') return neuerString((n(0) >>> 0).toString(2))
      if (name === 'toHexString') return neuerString((n(0) >>> 0).toString(16))
      if (name === 'compare') return zahl(Math.sign(n(0) - n(1)))
      if (name === 'max') return zahl(Math.max(n(0), n(1)))
      if (name === 'min') return zahl(Math.min(n(0), n(1)))
      if (name === 'sum') return zahl(n(0) + n(1))
      break

    case 'Double':
    case 'Float':
      if (name === 'parseDouble' || name === 'valueOf' || name === 'parseFloat') {
        if (a[0].art !== 'string') return komma(n(0))
        const roh = a[0].wert.trim()
        if (roh === '' || Number.isNaN(Number(roh))) i.werfen('NumberFormatException', `For input string: "${a[0].wert}"`, zeile)
        return komma(Number(roh))
      }
      if (name === 'toString') return neuerString(doubleText(n(0)))
      if (name === 'compare') return zahl(Math.sign(n(0) - n(1)))
      if (name === 'isNaN') return wahrheit(Number.isNaN(n(0)))
      break

    case 'Boolean':
      if (name === 'parseBoolean' || name === 'valueOf') return wahrheit(text(0).trim().toLowerCase() === 'true')
      if (name === 'toString') return neuerString(text(0))
      break

    case 'Character': {
      const z = a[0] ? String.fromCharCode(alsZahl(a[0])) : ''
      if (name === 'isDigit') return wahrheit(/[0-9]/.test(z))
      if (name === 'isLetter') return wahrheit(/\p{L}/u.test(z))
      if (name === 'isLetterOrDigit') return wahrheit(/[\p{L}0-9]/u.test(z))
      if (name === 'isWhitespace') return wahrheit(/\s/.test(z))
      if (name === 'isUpperCase') return wahrheit(z !== z.toLowerCase())
      if (name === 'isLowerCase') return wahrheit(z !== z.toUpperCase())
      if (name === 'toUpperCase') return zeichen(z.toUpperCase().charCodeAt(0))
      if (name === 'toLowerCase') return zeichen(z.toLowerCase().charCodeAt(0))
      if (name === 'toString') return neuerString(z)
      if (name === 'getNumericValue') return zahl(/[0-9]/.test(z) ? Number(z) : -1)
      break
    }

    case 'System':
      if (name === 'currentTimeMillis') return { art: 'long', wert: Date.now() }
      if (name === 'nanoTime') return { art: 'long', wert: Math.round(performance.now() * 1e6) }
      if (name === 'lineSeparator') return poolString('\n')
      if (name === 'exit') i.abbruch('System.exit() gibt es im Kurs nicht.', 'System.exit() is not available in this course runtime', zeile)
      if (name === 'arraycopy') {
        const quelle = a[0]
        const ziel = a[2]
        if (quelle.art === 'array' && ziel.art === 'array') {
          for (let k = 0; k < n(4); k++) ziel.werte[n(3) + k] = quelle.werte[n(1) + k]
        }
        return NULL
      }
      break

    case 'Arrays': {
      const array = a[0]
      if (name === 'toString') {
        if (array.art !== 'array') return neuerString('null')
        return neuerString(`[${array.werte.map((w) => i.alsText(w)).join(', ')}]`)
      }
      if (name === 'deepToString') {
        const tief = (w: Wert): string => (w.art === 'array' ? `[${w.werte.map(tief).join(', ')}]` : i.alsText(w))
        return neuerString(tief(array))
      }
      if (name === 'sort' && array.art === 'array') {
        const ordnung = a[1] ? vergleicher(a[1], i, zeile) : (x: Wert, y: Wert) => vergleichen(x, y, i)
        array.werte.sort(ordnung)
        return NULL
      }
      if (name === 'fill' && array.art === 'array') {
        array.werte.fill(a[1])
        return NULL
      }
      if (name === 'copyOf' && array.art === 'array') {
        const laenge = n(1)
        const werte = Array.from({ length: laenge }, (_, k) =>
          k < array.werte.length ? array.werte[k] : i.standardWert({ name: array.typ, dimensionen: 0, argumente: [] }),
        )
        return { art: 'array', typ: array.typ, werte }
      }
      if (name === 'copyOfRange' && array.art === 'array') {
        return { art: 'array', typ: array.typ, werte: array.werte.slice(n(1), n(2)) }
      }
      if (name === 'equals') {
        const b = a[1]
        if (array.art !== 'array' || b.art !== 'array') return wahrheit(false)
        return wahrheit(array.werte.length === b.werte.length && array.werte.every((w, k) => inhaltGleich(w, b.werte[k])))
      }
      if (name === 'asList') return liste(array.art === 'array' && a.length === 1 ? [...array.werte] : [...a])
      if (name === 'stream') return liste(array.art === 'array' ? [...array.werte] : [], 'Stream')
      if (name === 'binarySearch' && array.art === 'array') {
        return zahl(array.werte.findIndex((w) => inhaltGleich(w, a[1])))
      }
      break
    }

    case 'List':
    case 'Set':
      if (name === 'of') return liste([...a], klasse === 'Set' ? 'LinkedHashSet' : 'ArrayList')
      if (name === 'copyOf') return liste([...listeVon(a[0], i, zeile)])
      break

    case 'Map':
      if (name === 'of') {
        const m = map('LinkedHashMap')
        for (let k = 0; k + 1 < a.length; k += 2) m.daten.map!.set(schluesselVon(a[k]), { schluessel: a[k], wert: a[k + 1] })
        return m
      }
      if (name === 'entry') return { art: 'nativ', typ: 'Entry', daten: { liste: [a[0], a[1]] } }
      break

    case 'Collections':
      if (name === 'sort') {
        const l = listeVon(a[0], i, zeile)
        l.sort(a[1] ? vergleicher(a[1], i, zeile) : (x, y) => vergleichen(x, y, i))
        return NULL
      }
      if (name === 'reverse') {
        listeVon(a[0], i, zeile).reverse()
        return NULL
      }
      if (name === 'shuffle') {
        const l = listeVon(a[0], i, zeile)
        for (let k = l.length - 1; k > 0; k--) {
          const j = Math.floor(Math.random() * (k + 1))
          ;[l[k], l[j]] = [l[j], l[k]]
        }
        return NULL
      }
      if (name === 'max' || name === 'min') {
        const l = listeVon(a[0], i, zeile)
        if (!l.length) i.werfen('NoSuchElementException', null, zeile)
        return l.reduce((beste, w) => (vergleichen(w, beste, i) * (name === 'max' ? 1 : -1) > 0 ? w : beste))
      }
      if (name === 'emptyList') return liste([])
      if (name === 'unmodifiableList') return liste([...listeVon(a[0], i, zeile)])
      break

    case 'Objects':
      if (name === 'equals') return wahrheit(inhaltGleich(a[0], a[1]))
      if (name === 'isNull') return wahrheit(a[0].art === 'null')
      if (name === 'nonNull') return wahrheit(a[0].art !== 'null')
      if (name === 'toString') return neuerString(text(0))
      if (name === 'requireNonNull') {
        if (a[0].art === 'null') i.werfen('NullPointerException', a[1] ? text(1) : null, zeile)
        return a[0]
      }
      if (name === 'hash') return zahl(a.reduce((h, w) => (Math.imul(31, h) + [...i.alsText(w)].reduce((s, c) => s + c.charCodeAt(0), 0)) | 0, 7))
      break

    case 'Optional':
      if (name === 'of' || name === 'ofNullable') return optional(a[0]?.art === 'null' ? [] : [a[0]])
      if (name === 'empty') return optional([])
      break

    case 'Comparator':
      if (name === 'naturalOrder') return { art: 'funktion', aufrufen: (args) => zahl(Math.sign(vergleichen(args[0], args[1], i))) }
      if (name === 'reverseOrder') return { art: 'funktion', aufrufen: (args) => zahl(-Math.sign(vergleichen(args[0], args[1], i))) }
      if (name === 'comparing' || name === 'comparingInt' || name === 'comparingDouble') {
        const schluessel = a[0]
        return {
          art: 'funktion',
          aufrufen: (args) =>
            zahl(
              Math.sign(
                vergleichen(
                  funktionAufrufen(schluessel, [args[0]], i, zeile),
                  funktionAufrufen(schluessel, [args[1]], i, zeile),
                  i,
                ),
              ),
            ),
        }
      }
      break

    case 'Collectors':
      if (name === 'toList' || name === 'toSet') return { art: 'nativ', typ: 'Collector', daten: { text: name } }
      if (name === 'joining') return { art: 'nativ', typ: 'Collector', daten: { text: 'joining', liste: [...a] } }
      break

    case 'Stream':
      if (name === 'of') return liste([...a], 'Stream')
      break

    case 'IntStream':
      if (name === 'range' || name === 'rangeClosed') {
        const werte: Wert[] = []
        for (let k = n(0); name === 'range' ? k < n(1) : k <= n(1); k++) werte.push(zahl(k))
        return liste(werte, 'Stream')
      }
      break
  }

  i.abbruch(`${klasse}.${name}(…) kennt diese Laufzeit nicht.`, `cannot find symbol: method ${name} in class ${klasse}`, zeile)
}

// ---------------------------------------------------------------------------
// new …
// ---------------------------------------------------------------------------

export function nativErzeugen(klasse: string, a: Wert[], i: Interpreter, zeile: number): Wert | null {
  if (istAusnahmeKlasse(klasse)) {
    return { art: 'nativ', typ: klasse, daten: { meldung: a[0] && a[0].art !== 'null' ? i.alsText(a[0]) : undefined } }
  }
  if (klasse === 'Scanner') {
    i.abbruch(
      'Scanner liest von der Tastatur - im Browser gibt es keine Eingabe. Setze die Werte direkt im Code.',
      'Scanner reads from the keyboard - there is no input in the browser. Set the values directly in the code.',
      zeile,
    )
  }
  if (!NATIV_ERZEUGBAR.has(klasse)) return null

  switch (klasse) {
    case 'ArrayList':
    case 'LinkedList':
      return liste(a[0] && a[0].art === 'nativ' ? [...(a[0].daten.liste ?? [])] : [], 'ArrayList')
    case 'HashSet':
    case 'LinkedHashSet':
    case 'TreeSet': {
      const eingabe = a[0] && a[0].art === 'nativ' ? (a[0].daten.liste ?? []) : []
      const menge = liste([], klasse === 'TreeSet' ? 'TreeSet' : 'LinkedHashSet')
      for (const w of eingabe) if (!menge.daten.liste!.some((v) => inhaltGleich(v, w))) menge.daten.liste!.push(w)
      if (klasse === 'TreeSet') menge.daten.liste!.sort((x, y) => vergleichen(x, y, i))
      return menge
    }
    case 'HashMap':
    case 'LinkedHashMap':
    case 'TreeMap': {
      const m = map(klasse)
      if (a[0]?.art === 'nativ' && a[0].daten.map) for (const [k, e] of a[0].daten.map) m.daten.map!.set(k, e)
      return m
    }
    case 'StringBuilder':
    case 'StringBuffer':
      return { art: 'nativ', typ: 'StringBuilder', daten: { text: a[0]?.art === 'string' ? a[0].wert : '' } }
    case 'String':
      // Absicht: `new String("hi")` ist ein NEUES Objekt - genau darum geht es beim ==-Kapitel.
      return neuerString(a[0] ? i.alsText(a[0]) : '')
    case 'Random':
      return { art: 'nativ', typ: 'Random', daten: { zahl: a[0] ? alsZahl(a[0]) : Date.now() } }
    case 'Object':
      return { art: 'nativ', typ: 'Object', daten: {} }
  }
  return null
}

export function nativesFeld(wert: NativWert, name: string, _i: Interpreter): Wert | null {
  if (wert.typ === 'Entry' && wert.daten.liste) {
    if (name === 'key') return wert.daten.liste[0]
    if (name === 'value') return wert.daten.liste[1]
  }
  return null
}

// ---------------------------------------------------------------------------
// Methoden auf eingebauten Objekten
// ---------------------------------------------------------------------------

export function nativMethode(ziel: NativWert, name: string, a: Wert[], i: Interpreter, zeile: number): Wert {
  const daten = ziel.daten

  // --- System.out / System.err ---------------------------------------------
  if (ziel.typ === 'PrintStream') {
    const strom = daten.text === 'err' ? 'err' : 'out'
    switch (name) {
      case 'println':
        i.drucken((a.length ? i.alsText(a[0]) : '') + '\n', strom)
        return NULL
      case 'print':
        i.drucken(a.length ? i.alsText(a[0]) : '', strom)
        return NULL
      case 'printf':
      case 'format':
        i.drucken(formatieren(i.alsText(a[0]), a.slice(1), i, zeile), strom)
        return NULL
      case 'flush':
        return NULL
    }
  }

  // --- Optional: eine Liste mit höchstens einem Element ---------------------
  if (ziel.typ === 'Optional' && daten.liste) {
    const vorhanden = daten.liste.length > 0
    switch (name) {
      case 'isPresent':
        return wahrheit(vorhanden)
      case 'isEmpty':
        return wahrheit(!vorhanden)
      case 'orElse':
        return vorhanden ? daten.liste[0] : a[0]
      case 'orElseGet':
        return vorhanden ? daten.liste[0] : funktionAufrufen(a[0], [], i, zeile, 'get')
      case 'ifPresent':
        if (vorhanden) funktionAufrufen(a[0], [daten.liste[0]], i, zeile, 'accept')
        return NULL
      case 'map':
        return optional(vorhanden ? [funktionAufrufen(a[0], [daten.liste[0]], i, zeile)] : [])
      case 'get':
      case 'getAsDouble':
      case 'orElseThrow':
        // orElseThrow(() -> new TodoNotFoundException(id)) throws what the supplier creates.
        if (!vorhanden && name === 'orElseThrow' && a[0]) i.throwValue(funktionAufrufen(a[0], [], i, zeile, 'get'), zeile)
        if (!vorhanden) i.werfen('NoSuchElementException', 'No value present', zeile)
        return daten.liste[0]
      case 'toString':
        return neuerString(vorhanden ? `Optional[${i.alsText(daten.liste[0])}]` : 'Optional.empty')
    }
  }

  // --- Alles, was eine Liste ist: ArrayList, Set, Stream --------------------
  if (daten.liste) {
    const l = daten.liste
    const istMenge = ziel.typ.includes('Set')
    const istStream = ziel.typ === 'Stream'
    const neueListe = (werte: Wert[]) => liste(werte, istStream ? 'Stream' : ziel.typ)

    switch (name) {
      case 'add':
      case 'offer':
        if (a.length === 2 && !istMenge) {
          l.splice(alsZahl(a[0]), 0, a[1])
          return NULL
        }
        if (istMenge && l.some((w) => inhaltGleich(w, a[0]))) return wahrheit(false)
        l.push(a[0])
        if (ziel.typ === 'TreeSet') l.sort((x, y) => vergleichen(x, y, i))
        return wahrheit(true)
      case 'addAll':
        for (const w of listeVon(a[a.length - 1], i, zeile)) {
          if (istMenge && l.some((v) => inhaltGleich(v, w))) continue
          l.push(w)
        }
        return wahrheit(true)
      case 'get':
      case 'getFirst':
      case 'getLast': {
        const index = name === 'get' ? alsZahl(a[0]) : name === 'getFirst' ? 0 : l.length - 1
        if (index < 0 || index >= l.length) {
          i.werfen('IndexOutOfBoundsException', `Index ${index} out of bounds for length ${l.length}`, zeile)
        }
        return l[index]
      }
      case 'set': {
        const index = alsZahl(a[0])
        if (index < 0 || index >= l.length) i.werfen('IndexOutOfBoundsException', `Index ${index} out of bounds for length ${l.length}`, zeile)
        const alt = l[index]
        l[index] = a[1]
        return alt
      }
      case 'remove': {
        // list.remove(int) löscht nach Index, list.remove(Object) nach Inhalt - eine echte Java-Falle.
        if (a[0].art === 'int' && !istMenge) {
          const index = alsZahl(a[0])
          if (index < 0 || index >= l.length) i.werfen('IndexOutOfBoundsException', `Index ${index} out of bounds for length ${l.length}`, zeile)
          return l.splice(index, 1)[0]
        }
        const stelle = l.findIndex((w) => inhaltGleich(w, a[0]))
        if (stelle < 0) return wahrheit(false)
        l.splice(stelle, 1)
        return wahrheit(true)
      }
      case 'removeIf': {
        const vorher = l.length
        const behalten = l.filter((w) => !istWahr(funktionAufrufen(a[0], [w], i, zeile, 'test')))
        l.length = 0
        l.push(...behalten)
        return wahrheit(vorher !== l.length)
      }
      case 'size':
        return zahl(l.length)
      case 'isEmpty':
        return wahrheit(l.length === 0)
      case 'contains':
        return wahrheit(l.some((w) => inhaltGleich(w, a[0])))
      case 'indexOf':
        return zahl(l.findIndex((w) => inhaltGleich(w, a[0])))
      case 'lastIndexOf':
        return zahl(l.map((w) => inhaltGleich(w, a[0])).lastIndexOf(true))
      case 'clear':
        l.length = 0
        return NULL
      case 'sort':
        l.sort(a[0] && a[0].art !== 'null' ? vergleicher(a[0], i, zeile) : (x, y) => vergleichen(x, y, i))
        return NULL
      case 'forEach':
        for (const w of [...l]) funktionAufrufen(a[0], [w], i, zeile, 'accept')
        return NULL
      case 'stream':
        return liste([...l], 'Stream')
      case 'toList':
      case 'collect': {
        if (name === 'collect' && a[0]?.art === 'nativ' && a[0].daten.text === 'joining') {
          const trenner = a[0].daten.liste?.[0]
          return neuerString(l.map((w) => i.alsText(w)).join(trenner ? i.alsText(trenner) : ''))
        }
        const alsMenge = name === 'collect' && a[0]?.art === 'nativ' && a[0].daten.text === 'toSet'
        return liste([...l], alsMenge ? 'LinkedHashSet' : 'ArrayList')
      }
      case 'filter':
        return neueListe(l.filter((w) => istWahr(funktionAufrufen(a[0], [w], i, zeile, 'test'))))
      case 'map':
      case 'mapToInt':
      case 'mapToObj':
      case 'mapToDouble':
        return neueListe(l.map((w) => funktionAufrufen(a[0], [w], i, zeile)))
      case 'sorted':
        return neueListe([...l].sort(a[0] ? vergleicher(a[0], i, zeile) : (x, y) => vergleichen(x, y, i)))
      case 'distinct': {
        const gesehen: Wert[] = []
        for (const w of l) if (!gesehen.some((v) => inhaltGleich(v, w))) gesehen.push(w)
        return neueListe(gesehen)
      }
      case 'limit':
        return neueListe(l.slice(0, alsZahl(a[0])))
      case 'skip':
        return neueListe(l.slice(alsZahl(a[0])))
      case 'count':
        return { art: 'long', wert: l.length }
      case 'sum':
        return l.some((w) => w.art === 'double') ? komma(l.reduce((s, w) => s + alsZahl(w), 0)) : zahl(l.reduce((s, w) => s + alsZahl(w), 0))
      case 'average':
        return optional(l.length ? [komma(l.reduce((s, w) => s + alsZahl(w), 0) / l.length)] : [])
      case 'anyMatch':
        return wahrheit(l.some((w) => istWahr(funktionAufrufen(a[0], [w], i, zeile, 'test'))))
      case 'allMatch':
        return wahrheit(l.every((w) => istWahr(funktionAufrufen(a[0], [w], i, zeile, 'test'))))
      case 'noneMatch':
        return wahrheit(!l.some((w) => istWahr(funktionAufrufen(a[0], [w], i, zeile, 'test'))))
      case 'findFirst':
        return optional(l.length ? [l[0]] : [])
      case 'reduce':
        return l.reduce((summe, w) => funktionAufrufen(a[1] ?? a[0], [summe, w], i, zeile), a.length > 1 ? a[0] : l[0] ?? NULL)
      case 'toArray':
        return { art: 'array', typ: 'Object', werte: [...l] }
      case 'subList':
        return liste(l.slice(alsZahl(a[0]), alsZahl(a[1])))
      case 'iterator':
        return { art: 'nativ', typ: 'Iterator', daten: { liste: [...l], zahl: 0 } }
      case 'hasNext':
        return wahrheit((daten.zahl ?? 0) < l.length)
      case 'next':
        if ((daten.zahl ?? 0) >= l.length) i.werfen('NoSuchElementException', null, zeile)
        return l[daten.zahl!++]
      // --- Optional ---
      case 'isPresent':
        return wahrheit(l.length > 0)
      case 'isEmptyOptional':
        return wahrheit(l.length === 0)
      case 'orElse':
        return l.length ? l[0] : a[0]
      case 'ifPresent':
        if (l.length) funktionAufrufen(a[0], [l[0]], i, zeile, 'accept')
        return NULL
      case 'getAsDouble':
        if (!l.length) i.werfen('NoSuchElementException', 'No value present', zeile)
        return l[0]
      // --- Map.Entry ---
      case 'getKey':
        return l[0]
      case 'getValue':
        return l[1]
      case 'equals':
        return wahrheit(inhaltGleich(ziel, a[0]))
      case 'toString':
        return neuerString(i.alsText(ziel))
    }
    if (ziel.typ === 'Optional' && name === 'get') {
      if (!l.length) i.werfen('NoSuchElementException', 'No value present', zeile)
      return l[0]
    }
  }

  // --- Map ------------------------------------------------------------------
  if (daten.map) {
    const m = daten.map
    const sortieren = () => {
      if (ziel.typ !== 'TreeMap') return
      const eintraege = [...m.entries()].sort((x, y) => vergleichen(x[1].schluessel, y[1].schluessel, i))
      m.clear()
      for (const [k, e] of eintraege) m.set(k, e)
    }
    switch (name) {
      case 'put': {
        const schluessel = schluesselVon(a[0])
        const alt = m.get(schluessel)?.wert ?? NULL
        m.set(schluessel, { schluessel: a[0], wert: a[1] })
        sortieren()
        return alt
      }
      case 'putIfAbsent': {
        const schluessel = schluesselVon(a[0])
        if (m.has(schluessel)) return m.get(schluessel)!.wert
        m.set(schluessel, { schluessel: a[0], wert: a[1] })
        sortieren()
        return NULL
      }
      case 'get':
        return m.get(schluesselVon(a[0]))?.wert ?? NULL
      case 'getOrDefault':
        return m.get(schluesselVon(a[0]))?.wert ?? a[1]
      case 'containsKey':
        return wahrheit(m.has(schluesselVon(a[0])))
      case 'containsValue':
        return wahrheit([...m.values()].some((e) => inhaltGleich(e.wert, a[0])))
      case 'remove': {
        const schluessel = schluesselVon(a[0])
        const alt = m.get(schluessel)?.wert ?? NULL
        m.delete(schluessel)
        return alt
      }
      case 'size':
        return zahl(m.size)
      case 'isEmpty':
        return wahrheit(m.size === 0)
      case 'clear':
        m.clear()
        return NULL
      case 'keySet':
        return liste([...m.values()].map((e) => e.schluessel), 'LinkedHashSet')
      case 'values':
        return liste([...m.values()].map((e) => e.wert))
      case 'entrySet':
        return liste([...m.values()].map((e) => ({ art: 'nativ' as const, typ: 'Entry', daten: { liste: [e.schluessel, e.wert] } })), 'LinkedHashSet')
      case 'forEach':
        for (const e of [...m.values()]) funktionAufrufen(a[0], [e.schluessel, e.wert], i, zeile, 'accept')
        return NULL
      case 'merge': {
        const schluessel = schluesselVon(a[0])
        const alt = m.get(schluessel)
        const neu = alt ? funktionAufrufen(a[2], [alt.wert, a[1]], i, zeile) : a[1]
        m.set(schluessel, { schluessel: a[0], wert: neu })
        sortieren()
        return neu
      }
      case 'computeIfAbsent': {
        const schluessel = schluesselVon(a[0])
        if (!m.has(schluessel)) m.set(schluessel, { schluessel: a[0], wert: funktionAufrufen(a[1], [a[0]], i, zeile) })
        sortieren()
        return m.get(schluessel)!.wert
      }
      case 'equals':
        return wahrheit(inhaltGleich(ziel, a[0]))
      case 'toString':
        return neuerString(i.alsText(ziel))
    }
  }

  // --- StringBuilder --------------------------------------------------------
  if (ziel.typ === 'StringBuilder') {
    switch (name) {
      case 'append':
        daten.text = (daten.text ?? '') + i.alsText(a[0])
        return ziel
      case 'insert':
        daten.text = (daten.text ?? '').slice(0, alsZahl(a[0])) + i.alsText(a[1]) + (daten.text ?? '').slice(alsZahl(a[0]))
        return ziel
      case 'reverse':
        daten.text = [...(daten.text ?? '')].reverse().join('')
        return ziel
      case 'deleteCharAt':
        daten.text = (daten.text ?? '').slice(0, alsZahl(a[0])) + (daten.text ?? '').slice(alsZahl(a[0]) + 1)
        return ziel
      case 'setCharAt':
        daten.text = (daten.text ?? '').slice(0, alsZahl(a[0])) + i.alsText(a[1]) + (daten.text ?? '').slice(alsZahl(a[0]) + 1)
        return NULL
      case 'length':
        return zahl((daten.text ?? '').length)
      case 'charAt':
        return zeichen((daten.text ?? '').charCodeAt(alsZahl(a[0])))
      case 'toString':
        return neuerString(daten.text ?? '')
      case 'isEmpty':
        return wahrheit(!daten.text)
    }
  }

  // --- Random ---------------------------------------------------------------
  if (ziel.typ === 'Random') {
    // Ein einfacher, aber reproduzierbarer Zufallsgenerator (LCG).
    const naechste = () => {
      daten.zahl = (Math.imul(1664525, daten.zahl ?? 0) + 1013904223) >>> 0
      return daten.zahl / 4294967296
    }
    if (name === 'nextInt') return zahl(a.length === 2 ? alsZahl(a[0]) + Math.floor(naechste() * (alsZahl(a[1]) - alsZahl(a[0]))) : Math.floor(naechste() * (a.length ? alsZahl(a[0]) : 2 ** 31)))
    if (name === 'nextDouble') return komma(naechste())
    if (name === 'nextBoolean') return wahrheit(naechste() < 0.5)
  }

  // --- Class ----------------------------------------------------------------
  if (ziel.typ === 'Class') {
    if (name === 'getSimpleName' || name === 'getName') return neuerString(daten.text ?? '')
  }

  // --- Exceptions -----------------------------------------------------------
  if (istAusnahmeKlasse(ziel.typ)) {
    if (name === 'getMessage' || name === 'getLocalizedMessage') return daten.meldung === undefined ? NULL : neuerString(daten.meldung)
    if (name === 'toString') return neuerString(i.ausnahmeText(ziel))
    if (name === 'getClass') return { art: 'nativ', typ: 'Class', daten: { text: ziel.typ } }
    if (name === 'printStackTrace') {
      i.drucken(i.ausnahmeText(ziel) + '\n', 'err')
      return NULL
    }
  }

  // --- Für alle -------------------------------------------------------------
  if (name === 'equals') return wahrheit(inhaltGleich(ziel, a[0]))
  if (name === 'toString') return neuerString(i.alsText(ziel))
  if (name === 'getClass') return { art: 'nativ', typ: 'Class', daten: { text: ziel.typ } }
  if (name === 'hashCode') return zahl(0)

  i.abbruch(`${ziel.typ} hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name} in ${ziel.typ}`, zeile)
}

const istWahr = (w: Wert) => w.art === 'boolean' && w.wert

// ---------------------------------------------------------------------------
// String-Methoden
// ---------------------------------------------------------------------------

export function stringMethode(ziel: JavaString, name: string, a: Wert[], i: Interpreter, zeile: number): Wert {
  const s = ziel.wert
  const n = (index: number) => alsZahl(a[index])
  const t = (index: number) => i.alsText(a[index])
  const grenze = (index: number, max = s.length) => {
    if (index < 0 || index > max) {
      i.werfen('StringIndexOutOfBoundsException', `index ${index}, length ${s.length}`, zeile)
    }
  }

  switch (name) {
    case 'length':
      return zahl(s.length)
    case 'charAt':
      grenze(n(0), s.length - 1)
      return zeichen(s.charCodeAt(n(0)))
    case 'substring': {
      const von = n(0)
      const bis = a.length > 1 ? n(1) : s.length
      grenze(von)
      grenze(bis)
      if (von > bis) i.werfen('StringIndexOutOfBoundsException', `begin ${von}, end ${bis}, length ${s.length}`, zeile)
      return neuerString(s.slice(von, bis))
    }
    case 'indexOf':
      return zahl(s.indexOf(a[0].art === 'char' ? String.fromCharCode(alsZahl(a[0])) : t(0), a.length > 1 ? n(1) : 0))
    case 'lastIndexOf':
      return zahl(s.lastIndexOf(t(0)))
    case 'contains':
      return wahrheit(s.includes(t(0)))
    case 'startsWith':
      return wahrheit(s.startsWith(t(0)))
    case 'endsWith':
      return wahrheit(s.endsWith(t(0)))
    case 'equals':
      return wahrheit(a[0].art === 'string' && a[0].wert === s)
    case 'equalsIgnoreCase':
      return wahrheit(a[0].art === 'string' && a[0].wert.toLowerCase() === s.toLowerCase())
    case 'compareTo':
      return zahl(a[0].art === 'string' ? (s < a[0].wert ? -1 : s > a[0].wert ? 1 : 0) : 0)
    case 'compareToIgnoreCase': {
      const b = t(0).toLowerCase()
      const x = s.toLowerCase()
      return zahl(x < b ? -1 : x > b ? 1 : 0)
    }
    case 'toUpperCase':
      return neuerString(s.toUpperCase())
    case 'toLowerCase':
      return neuerString(s.toLowerCase())
    case 'trim':
    case 'strip':
      return neuerString(s.trim())
    case 'isEmpty':
      return wahrheit(s.length === 0)
    case 'isBlank':
      return wahrheit(s.trim().length === 0)
    case 'replace':
      return neuerString(s.split(a[0].art === 'char' ? String.fromCharCode(alsZahl(a[0])) : t(0)).join(a[1].art === 'char' ? String.fromCharCode(alsZahl(a[1])) : t(1)))
    case 'replaceAll':
      return neuerString(s.replace(new RegExp(t(0), 'g'), t(1)))
    case 'split': {
      const muster = t(0)
      // split() erwartet in Java einen regulären Ausdruck - aber nur, wenn wirklich
      // einer drinsteht. Sonst wird stumpf am Text getrennt (z. B. bei "a.b").
      const teile = /[\\[\](){}.*+?^$|]/.test(muster) ? s.split(new RegExp(muster)) : s.split(muster)
      return { art: 'array', typ: 'String', werte: teile.map((teil) => neuerString(teil)) }
    }
    case 'toCharArray':
      return { art: 'array', typ: 'char', werte: [...s].map((c) => zeichen(c.charCodeAt(0))) }
    case 'repeat':
      return neuerString(s.repeat(n(0)))
    case 'concat':
      return neuerString(s + t(0))
    case 'matches':
      return wahrheit(new RegExp('^(?:' + t(0) + ')$').test(s))
    case 'hashCode': {
      let h = 0
      for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0
      return zahl(h)
    }
    case 'chars':
      return { art: 'nativ', typ: 'Stream', daten: { liste: [...s].map((c) => zahl(c.charCodeAt(0))) } }
    case 'formatted':
      return neuerString(formatieren(s, a, i, zeile))
    case 'intern':
      return poolString(s)
    case 'toString':
      return ziel
    case 'getClass':
      return { art: 'nativ', typ: 'Class', daten: { text: 'String' } }
  }
  i.abbruch(`String hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name} in class String`, zeile)
}

// ---------------------------------------------------------------------------
// Methoden auf Zahlen, char und boolean (Autoboxing)
// ---------------------------------------------------------------------------

export function primitivMethode(ziel: Wert, name: string, a: Wert[], i: Interpreter, zeile: number): Wert {
  switch (name) {
    case 'equals':
      return wahrheit(inhaltGleich(ziel, a[0]))
    case 'toString':
      return neuerString(i.alsText(ziel))
    case 'compareTo':
      return zahl(Math.sign(vergleichen(ziel, a[0], i)))
    case 'intValue':
      return zahl(Math.trunc(alsZahl(ziel)))
    case 'doubleValue':
      return komma(alsZahl(ziel))
    case 'charValue':
      return ziel
    case 'booleanValue':
      return ziel
    case 'hashCode':
      return zahl(Math.trunc(alsZahl(ziel)))
    case 'getClass':
      return { art: 'nativ', typ: 'Class', daten: { text: typName(ziel) } }
  }
  i.abbruch(`${typName(ziel)} hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name}`, zeile)
}
