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
  toNumber,
  doubleText,
  contentEquals,
  isNumber,
  comma,
  newString,
  NULL,
  poolString,
  keyOf,
  typeName,
  bool,
  number,
  chars,
  type JavaString,
  type NativeValue,
  type Value,
} from './values'

/** Klassen, die man ohne `new` ansprechen kann: `Math.max(…)`, `Integer.parseInt(…)`. */
export const BUILTIN_CLASSES = new Set([
  'System', 'Math', 'String', 'Integer', 'Double', 'Boolean', 'Character', 'Long', 'Float', 'Short', 'Byte',
  'Arrays', 'Collections', 'List', 'Map', 'Set', 'Objects', 'Optional', 'Comparator', 'Collectors', 'Stream', 'IntStream',
])

/** Klassen, die man mit `new` erzeugen kann. */
const NATIVE_CONSTRUCTIBLE = new Set([
  'ArrayList', 'LinkedList', 'HashMap', 'LinkedHashMap', 'TreeMap', 'HashSet', 'LinkedHashSet', 'TreeSet',
  'StringBuilder', 'StringBuffer', 'String', 'Random', 'Object',
])

/** Die Vererbungskette der Exceptions - die braucht `catch`. */
const SUPERCLASSES: Record<string, string> = {
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

export const superclassOf = (name: string): string | undefined => SUPERCLASSES[name]

export function isExceptionClass(name: string): boolean {
  if (name === 'Throwable') return true
  if (name.endsWith('Exception') || name.endsWith('Error')) return true
  for (let k = SUPERCLASSES[name]; k; k = SUPERCLASSES[k]) if (k === 'Throwable') return true
  return false
}

// ---------------------------------------------------------------------------
// Kleine Helfer
// ---------------------------------------------------------------------------

const list = (values: Value[], type = 'ArrayList'): NativeValue => ({ kind: 'native', type, data: { list: values } })
const optional = (values: Value[]): NativeValue => ({ kind: 'native', type: 'Optional', data: { list: values } })
const map = (type = 'HashMap'): NativeValue => ({ kind: 'native', type, data: { map: new Map() } })

function listOf(value: Value, i: Interpreter, line: number): Value[] {
  if (value.kind === 'array') return value.values
  if (value.kind === 'native' && value.data.list) return value.data.list
  i.abort(`${typeName(value)} ist keine Liste.`, `${typeName(value)} is not a list`, line)
}

/** Natürliche Ordnung: Zahlen nach Größe, Strings alphabetisch, sonst compareTo. */
export function compare(a: Value, b: Value, i: Interpreter): number {
  if (isNumber(a) && isNumber(b)) return toNumber(a) - toNumber(b)
  if (a.kind === 'string' && b.kind === 'string') return a.value < b.value ? -1 : a.value > b.value ? 1 : 0
  if (a.kind === 'boolean' && b.kind === 'boolean') return Number(a.value) - Number(b.value)
  if (a.kind === 'object') return toNumber(i.callMethod(a, 'compareTo', [b], 0))
  return 0
}

/** Ruft ein Lambda oder ein Objekt mit passender Methode auf. */
function callFunction(fn: Value, args: Value[], i: Interpreter, line: number, method = 'apply'): Value {
  if (fn.kind === 'function') return fn.call(args)
  if (fn.kind === 'object' || fn.kind === 'native') return i.callMethod(fn, method, args, line)
  i.abort('Hier wird ein Lambda erwartet.', 'a lambda expression is required here', line)
}

const comparator = (fn: Value, i: Interpreter, line: number) => (a: Value, b: Value) =>
  toNumber(callFunction(fn, [a, b], i, line, 'compare'))

/**
 * `String.format` und `printf`: %d %s %f %b %c %n, mit Breite und Genauigkeit.
 * Beispiele: %5d (rechtsbündig), %-10s (linksbündig), %.2f (zwei Nachkommastellen).
 */
export function format(template: string, args: Value[], i: Interpreter, line: number): string {
  let index = 0
  return template.replace(/%(-)?(\d+)?(?:\.(\d+))?([sdfnb%c])/g, (_match, left, width, precision, kind) => {
    if (kind === '%') return '%'
    if (kind === 'n') return '\n'
    const value = args[index++]
    if (value === undefined) i.raise('IllegalArgumentException', 'MissingFormatArgumentException: %' + kind, line)
    let text: string
    switch (kind) {
      case 'd':
        text = String(Math.trunc(toNumber(value)))
        break
      case 'f':
        text = toNumber(value).toFixed(precision === undefined ? 6 : Number(precision))
        break
      case 'b':
        text = String(value.kind === 'boolean' ? value.value : value.kind !== 'null')
        break
      case 'c':
        text = value.kind === 'char' ? String.fromCharCode(value.value) : i.toText(value)
        break
      default:
        text = i.toText(value)
        if (precision !== undefined) text = text.slice(0, Number(precision))
    }
    const padWidth = width ? Number(width) : 0
    if (text.length >= padWidth) return text
    return left ? text.padEnd(padWidth) : text.padStart(padWidth)
  })
}

// ---------------------------------------------------------------------------
// Statische Felder: System.out, Math.PI, Integer.MAX_VALUE …
// ---------------------------------------------------------------------------

export function staticField(classInfo: string, name: string, _i: Interpreter): Value | null {
  if (classInfo === 'System') {
    if (name === 'out' || name === 'err') return { kind: 'native', type: 'PrintStream', data: { text: name } }
    if (name === 'in') return { kind: 'native', type: 'InputStream', data: {} }
  }
  if (classInfo === 'Math') {
    if (name === 'PI') return comma(Math.PI)
    if (name === 'E') return comma(Math.E)
  }
  if (classInfo === 'Integer') {
    if (name === 'MAX_VALUE') return number(2147483647)
    if (name === 'MIN_VALUE') return number(-2147483648)
  }
  if (classInfo === 'Long') {
    // Hinweis: JavaScript-Zahlen können den echten long-Bereich nicht genau
    // darstellen - für den Kurs genügt der gerundete Wert.
    if (name === 'MAX_VALUE') return { kind: 'long', value: Number.MAX_SAFE_INTEGER }
    if (name === 'MIN_VALUE') return { kind: 'long', value: Number.MIN_SAFE_INTEGER }
  }
  if (classInfo === 'Double') {
    if (name === 'MAX_VALUE') return comma(Number.MAX_VALUE)
    if (name === 'MIN_VALUE') return comma(Number.MIN_VALUE)
    if (name === 'NaN') return comma(NaN)
    if (name === 'POSITIVE_INFINITY') return comma(Infinity)
    if (name === 'NEGATIVE_INFINITY') return comma(-Infinity)
  }
  if (classInfo === 'Character' && name === 'MAX_VALUE') return chars(65535)
  return null
}

// ---------------------------------------------------------------------------
// Statische Methoden
// ---------------------------------------------------------------------------

export function staticCall(classInfo: string, name: string, a: Value[], i: Interpreter, line: number): Value {
  const text = (index: number) => i.toText(a[index])
  const n = (index: number) => toNumber(a[index])

  switch (classInfo) {
    case 'Math':
      switch (name) {
        case 'abs':
          return a[0].kind === 'double' ? comma(Math.abs(n(0))) : number(Math.abs(n(0)))
        case 'max':
          return a[0].kind === 'double' || a[1].kind === 'double' ? comma(Math.max(n(0), n(1))) : number(Math.max(n(0), n(1)))
        case 'min':
          return a[0].kind === 'double' || a[1].kind === 'double' ? comma(Math.min(n(0), n(1))) : number(Math.min(n(0), n(1)))
        case 'pow':
          return comma(Math.pow(n(0), n(1)))
        case 'sqrt':
          return comma(Math.sqrt(n(0)))
        case 'cbrt':
          return comma(Math.cbrt(n(0)))
        case 'round':
          return number(Math.round(n(0)))
        case 'floor':
          return comma(Math.floor(n(0)))
        case 'ceil':
          return comma(Math.ceil(n(0)))
        case 'random':
          return comma(Math.random())
        case 'hypot':
          return comma(Math.hypot(n(0), n(1)))
        case 'signum':
          return comma(Math.sign(n(0)))
        case 'floorDiv':
          return number(Math.floor(n(0) / n(1)))
        case 'floorMod':
          return number(((n(0) % n(1)) + n(1)) % n(1))
        case 'toRadians':
          return comma((n(0) * Math.PI) / 180)
        case 'toDegrees':
          return comma((n(0) * 180) / Math.PI)
        default: {
          const fn = (Math as unknown as Record<string, (x: number) => number>)[name]
          if (typeof fn === 'function') return comma(fn(n(0)))
        }
      }
      break

    case 'String':
      if (name === 'valueOf') return newString(text(0))
      if (name === 'format') return newString(format(text(0), a.slice(1), i, line))
      if (name === 'join') {
        const parts = a.length === 2 && (a[1].kind === 'array' || a[1].kind === 'native') ? listOf(a[1], i, line) : a.slice(1)
        return newString(parts.map((w) => i.toText(w)).join(text(0)))
      }
      break

    case 'Integer':
    case 'Long':
    case 'Short':
    case 'Byte':
      if (name === 'parseInt' || name === 'parseLong' || name === 'valueOf') {
        if (a[0].kind !== 'string') return number(n(0))
        const raw = a[0].value.trim()
        if (!/^[+-]?\d+$/.test(raw)) i.raise('NumberFormatException', `For input string: "${a[0].value}"`, line)
        return number(Number(raw))
      }
      if (name === 'toString') return newString(String(Math.trunc(n(0))))
      if (name === 'toBinaryString') return newString((n(0) >>> 0).toString(2))
      if (name === 'toHexString') return newString((n(0) >>> 0).toString(16))
      if (name === 'compare') return number(Math.sign(n(0) - n(1)))
      if (name === 'max') return number(Math.max(n(0), n(1)))
      if (name === 'min') return number(Math.min(n(0), n(1)))
      if (name === 'sum') return number(n(0) + n(1))
      break

    case 'Double':
    case 'Float':
      if (name === 'parseDouble' || name === 'valueOf' || name === 'parseFloat') {
        if (a[0].kind !== 'string') return comma(n(0))
        const raw = a[0].value.trim()
        if (raw === '' || Number.isNaN(Number(raw))) i.raise('NumberFormatException', `For input string: "${a[0].value}"`, line)
        return comma(Number(raw))
      }
      if (name === 'toString') return newString(doubleText(n(0)))
      if (name === 'compare') return number(Math.sign(n(0) - n(1)))
      if (name === 'isNaN') return bool(Number.isNaN(n(0)))
      break

    case 'Boolean':
      if (name === 'parseBoolean' || name === 'valueOf') return bool(text(0).trim().toLowerCase() === 'true')
      if (name === 'toString') return newString(text(0))
      break

    case 'Character': {
      const z = a[0] ? String.fromCharCode(toNumber(a[0])) : ''
      if (name === 'isDigit') return bool(/[0-9]/.test(z))
      if (name === 'isLetter') return bool(/\p{L}/u.test(z))
      if (name === 'isLetterOrDigit') return bool(/[\p{L}0-9]/u.test(z))
      if (name === 'isWhitespace') return bool(/\s/.test(z))
      if (name === 'isUpperCase') return bool(z !== z.toLowerCase())
      if (name === 'isLowerCase') return bool(z !== z.toUpperCase())
      if (name === 'toUpperCase') return chars(z.toUpperCase().charCodeAt(0))
      if (name === 'toLowerCase') return chars(z.toLowerCase().charCodeAt(0))
      if (name === 'toString') return newString(z)
      if (name === 'getNumericValue') return number(/[0-9]/.test(z) ? Number(z) : -1)
      break
    }

    case 'System':
      if (name === 'currentTimeMillis') return { kind: 'long', value: Date.now() }
      if (name === 'nanoTime') return { kind: 'long', value: Math.round(performance.now() * 1e6) }
      if (name === 'lineSeparator') return poolString('\n')
      if (name === 'exit') i.abort('System.exit() gibt es im Kurs nicht.', 'System.exit() is not available in this course runtime', line)
      if (name === 'arraycopy') {
        const source = a[0]
        const target = a[2]
        if (source.kind === 'array' && target.kind === 'array') {
          for (let k = 0; k < n(4); k++) target.values[n(3) + k] = source.values[n(1) + k]
        }
        return NULL
      }
      break

    case 'Arrays': {
      const array = a[0]
      if (name === 'toString') {
        if (array.kind !== 'array') return newString('null')
        return newString(`[${array.values.map((w) => i.toText(w)).join(', ')}]`)
      }
      if (name === 'deepToString') {
        const deep = (w: Value): string => (w.kind === 'array' ? `[${w.values.map(deep).join(', ')}]` : i.toText(w))
        return newString(deep(array))
      }
      if (name === 'sort' && array.kind === 'array') {
        const order = a[1] ? comparator(a[1], i, line) : (x: Value, y: Value) => compare(x, y, i)
        array.values.sort(order)
        return NULL
      }
      if (name === 'fill' && array.kind === 'array') {
        array.values.fill(a[1])
        return NULL
      }
      if (name === 'copyOf' && array.kind === 'array') {
        const length = n(1)
        const values = Array.from({ length }, (_, k) =>
          k < array.values.length ? array.values[k] : i.defaultValue({ name: array.type, dimensions: 0, args: [] }),
        )
        return { kind: 'array', type: array.type, values }
      }
      if (name === 'copyOfRange' && array.kind === 'array') {
        return { kind: 'array', type: array.type, values: array.values.slice(n(1), n(2)) }
      }
      if (name === 'equals') {
        const b = a[1]
        if (array.kind !== 'array' || b.kind !== 'array') return bool(false)
        return bool(array.values.length === b.values.length && array.values.every((w, k) => contentEquals(w, b.values[k])))
      }
      if (name === 'asList') return list(array.kind === 'array' && a.length === 1 ? [...array.values] : [...a])
      if (name === 'stream') return list(array.kind === 'array' ? [...array.values] : [], 'Stream')
      if (name === 'binarySearch' && array.kind === 'array') {
        return number(array.values.findIndex((w) => contentEquals(w, a[1])))
      }
      break
    }

    case 'List':
    case 'Set':
      if (name === 'of') return list([...a], classInfo === 'Set' ? 'LinkedHashSet' : 'ArrayList')
      if (name === 'copyOf') return list([...listOf(a[0], i, line)])
      break

    case 'Map':
      if (name === 'of') {
        const m = map('LinkedHashMap')
        for (let k = 0; k + 1 < a.length; k += 2) m.data.map!.set(keyOf(a[k]), { key: a[k], value: a[k + 1] })
        return m
      }
      if (name === 'entry') return { kind: 'native', type: 'Entry', data: { list: [a[0], a[1]] } }
      break

    case 'Collections':
      if (name === 'sort') {
        const l = listOf(a[0], i, line)
        l.sort(a[1] ? comparator(a[1], i, line) : (x, y) => compare(x, y, i))
        return NULL
      }
      if (name === 'reverse') {
        listOf(a[0], i, line).reverse()
        return NULL
      }
      if (name === 'shuffle') {
        const l = listOf(a[0], i, line)
        for (let k = l.length - 1; k > 0; k--) {
          const j = Math.floor(Math.random() * (k + 1))
          ;[l[k], l[j]] = [l[j], l[k]]
        }
        return NULL
      }
      if (name === 'max' || name === 'min') {
        const l = listOf(a[0], i, line)
        if (!l.length) i.raise('NoSuchElementException', null, line)
        return l.reduce((best, w) => (compare(w, best, i) * (name === 'max' ? 1 : -1) > 0 ? w : best))
      }
      if (name === 'emptyList') return list([])
      if (name === 'unmodifiableList') return list([...listOf(a[0], i, line)])
      break

    case 'Objects':
      if (name === 'equals') return bool(contentEquals(a[0], a[1]))
      if (name === 'isNull') return bool(a[0].kind === 'null')
      if (name === 'nonNull') return bool(a[0].kind !== 'null')
      if (name === 'toString') return newString(text(0))
      if (name === 'requireNonNull') {
        if (a[0].kind === 'null') i.raise('NullPointerException', a[1] ? text(1) : null, line)
        return a[0]
      }
      if (name === 'hash') return number(a.reduce((h, w) => (Math.imul(31, h) + [...i.toText(w)].reduce((s, c) => s + c.charCodeAt(0), 0)) | 0, 7))
      break

    case 'Optional':
      if (name === 'of' || name === 'ofNullable') return optional(a[0]?.kind === 'null' ? [] : [a[0]])
      if (name === 'empty') return optional([])
      break

    case 'Comparator':
      if (name === 'naturalOrder') return { kind: 'function', call: (args) => number(Math.sign(compare(args[0], args[1], i))) }
      if (name === 'reverseOrder') return { kind: 'function', call: (args) => number(-Math.sign(compare(args[0], args[1], i))) }
      if (name === 'comparing' || name === 'comparingInt' || name === 'comparingDouble') {
        const key = a[0]
        return {
          kind: 'function',
          call: (args) =>
            number(
              Math.sign(
                compare(
                  callFunction(key, [args[0]], i, line),
                  callFunction(key, [args[1]], i, line),
                  i,
                ),
              ),
            ),
        }
      }
      break

    case 'Collectors':
      if (name === 'toList' || name === 'toSet') return { kind: 'native', type: 'Collector', data: { text: name } }
      if (name === 'joining') return { kind: 'native', type: 'Collector', data: { text: 'joining', list: [...a] } }
      break

    case 'Stream':
      if (name === 'of') return list([...a], 'Stream')
      break

    case 'IntStream':
      if (name === 'range' || name === 'rangeClosed') {
        const values: Value[] = []
        for (let k = n(0); name === 'range' ? k < n(1) : k <= n(1); k++) values.push(number(k))
        return list(values, 'Stream')
      }
      break
  }

  i.abort(`${classInfo}.${name}(…) kennt diese Laufzeit nicht.`, `cannot find symbol: method ${name} in class ${classInfo}`, line)
}

// ---------------------------------------------------------------------------
// new …
// ---------------------------------------------------------------------------

export function createNative(classInfo: string, a: Value[], i: Interpreter, line: number): Value | null {
  if (isExceptionClass(classInfo)) {
    return { kind: 'native', type: classInfo, data: { message: a[0] && a[0].kind !== 'null' ? i.toText(a[0]) : undefined } }
  }
  if (classInfo === 'Scanner') {
    i.abort(
      'Scanner liest von der Tastatur - im Browser gibt es keine Eingabe. Setze die Werte direkt im Code.',
      'Scanner reads from the keyboard - there is no input in the browser. Set the values directly in the code.',
      line,
    )
  }
  if (!NATIVE_CONSTRUCTIBLE.has(classInfo)) return null

  switch (classInfo) {
    case 'ArrayList':
    case 'LinkedList':
      return list(a[0] && a[0].kind === 'native' ? [...(a[0].data.list ?? [])] : [], 'ArrayList')
    case 'HashSet':
    case 'LinkedHashSet':
    case 'TreeSet': {
      const input = a[0] && a[0].kind === 'native' ? (a[0].data.list ?? []) : []
      const set = list([], classInfo === 'TreeSet' ? 'TreeSet' : 'LinkedHashSet')
      for (const w of input) if (!set.data.list!.some((v) => contentEquals(v, w))) set.data.list!.push(w)
      if (classInfo === 'TreeSet') set.data.list!.sort((x, y) => compare(x, y, i))
      return set
    }
    case 'HashMap':
    case 'LinkedHashMap':
    case 'TreeMap': {
      const m = map(classInfo)
      if (a[0]?.kind === 'native' && a[0].data.map) for (const [k, e] of a[0].data.map) m.data.map!.set(k, e)
      return m
    }
    case 'StringBuilder':
    case 'StringBuffer':
      return { kind: 'native', type: 'StringBuilder', data: { text: a[0]?.kind === 'string' ? a[0].value : '' } }
    case 'String':
      // Absicht: `new String("hi")` ist ein NEUES Objekt - genau darum geht es beim ==-Kapitel.
      return newString(a[0] ? i.toText(a[0]) : '')
    case 'Random':
      return { kind: 'native', type: 'Random', data: { number: a[0] ? toNumber(a[0]) : Date.now() } }
    case 'Object':
      return { kind: 'native', type: 'Object', data: {} }
  }
  return null
}

export function nativeField(value: NativeValue, name: string, _i: Interpreter): Value | null {
  if (value.type === 'Entry' && value.data.list) {
    if (name === 'key') return value.data.list[0]
    if (name === 'value') return value.data.list[1]
  }
  return null
}

// ---------------------------------------------------------------------------
// Methoden auf eingebauten Objekten
// ---------------------------------------------------------------------------

export function nativeMethod(target: NativeValue, name: string, a: Value[], i: Interpreter, line: number): Value {
  const data = target.data

  // --- System.out / System.err ---------------------------------------------
  if (target.type === 'PrintStream') {
    const stream = data.text === 'err' ? 'err' : 'out'
    switch (name) {
      case 'println':
        i.print((a.length ? i.toText(a[0]) : '') + '\n', stream)
        return NULL
      case 'print':
        i.print(a.length ? i.toText(a[0]) : '', stream)
        return NULL
      case 'printf':
      case 'format':
        i.print(format(i.toText(a[0]), a.slice(1), i, line), stream)
        return NULL
      case 'flush':
        return NULL
    }
  }

  // --- Optional: eine Liste mit höchstens einem Element ---------------------
  if (target.type === 'Optional' && data.list) {
    const existing = data.list.length > 0
    switch (name) {
      case 'isPresent':
        return bool(existing)
      case 'isEmpty':
        return bool(!existing)
      case 'orElse':
        return existing ? data.list[0] : a[0]
      case 'orElseGet':
        return existing ? data.list[0] : callFunction(a[0], [], i, line, 'get')
      case 'ifPresent':
        if (existing) callFunction(a[0], [data.list[0]], i, line, 'accept')
        return NULL
      case 'map':
        return optional(existing ? [callFunction(a[0], [data.list[0]], i, line)] : [])
      case 'get':
      case 'getAsDouble':
      case 'orElseThrow':
        // orElseThrow(() -> new TodoNotFoundException(id)) throws what the supplier creates.
        if (!existing && name === 'orElseThrow' && a[0]) i.throwValue(callFunction(a[0], [], i, line, 'get'), line)
        if (!existing) i.raise('NoSuchElementException', 'No value present', line)
        return data.list[0]
      case 'toString':
        return newString(existing ? `Optional[${i.toText(data.list[0])}]` : 'Optional.empty')
    }
  }

  // --- Alles, was eine Liste ist: ArrayList, Set, Stream --------------------
  if (data.list) {
    const l = data.list
    const isSet = target.type.includes('Set')
    const isStream = target.type === 'Stream'
    const newList = (values: Value[]) => list(values, isStream ? 'Stream' : target.type)

    switch (name) {
      case 'add':
      case 'offer':
        if (a.length === 2 && !isSet) {
          l.splice(toNumber(a[0]), 0, a[1])
          return NULL
        }
        if (isSet && l.some((w) => contentEquals(w, a[0]))) return bool(false)
        l.push(a[0])
        if (target.type === 'TreeSet') l.sort((x, y) => compare(x, y, i))
        return bool(true)
      case 'addAll':
        for (const w of listOf(a[a.length - 1], i, line)) {
          if (isSet && l.some((v) => contentEquals(v, w))) continue
          l.push(w)
        }
        return bool(true)
      case 'get':
      case 'getFirst':
      case 'getLast': {
        const index = name === 'get' ? toNumber(a[0]) : name === 'getFirst' ? 0 : l.length - 1
        if (index < 0 || index >= l.length) {
          i.raise('IndexOutOfBoundsException', `Index ${index} out of bounds for length ${l.length}`, line)
        }
        return l[index]
      }
      case 'set': {
        const index = toNumber(a[0])
        if (index < 0 || index >= l.length) i.raise('IndexOutOfBoundsException', `Index ${index} out of bounds for length ${l.length}`, line)
        const previous = l[index]
        l[index] = a[1]
        return previous
      }
      case 'remove': {
        // list.remove(int) löscht nach Index, list.remove(Object) nach Inhalt - eine echte Java-Falle.
        if (a[0].kind === 'int' && !isSet) {
          const index = toNumber(a[0])
          if (index < 0 || index >= l.length) i.raise('IndexOutOfBoundsException', `Index ${index} out of bounds for length ${l.length}`, line)
          return l.splice(index, 1)[0]
        }
        const position = l.findIndex((w) => contentEquals(w, a[0]))
        if (position < 0) return bool(false)
        l.splice(position, 1)
        return bool(true)
      }
      case 'removeIf': {
        const prefix = l.length
        const keep = l.filter((w) => !isTrue(callFunction(a[0], [w], i, line, 'test')))
        l.length = 0
        l.push(...keep)
        return bool(prefix !== l.length)
      }
      case 'size':
        return number(l.length)
      case 'isEmpty':
        return bool(l.length === 0)
      case 'contains':
        return bool(l.some((w) => contentEquals(w, a[0])))
      case 'indexOf':
        return number(l.findIndex((w) => contentEquals(w, a[0])))
      case 'lastIndexOf':
        return number(l.map((w) => contentEquals(w, a[0])).lastIndexOf(true))
      case 'clear':
        l.length = 0
        return NULL
      case 'sort':
        l.sort(a[0] && a[0].kind !== 'null' ? comparator(a[0], i, line) : (x, y) => compare(x, y, i))
        return NULL
      case 'forEach':
        for (const w of [...l]) callFunction(a[0], [w], i, line, 'accept')
        return NULL
      case 'stream':
        return list([...l], 'Stream')
      case 'toList':
      case 'collect': {
        if (name === 'collect' && a[0]?.kind === 'native' && a[0].data.text === 'joining') {
          const separator = a[0].data.list?.[0]
          return newString(l.map((w) => i.toText(w)).join(separator ? i.toText(separator) : ''))
        }
        const asSet = name === 'collect' && a[0]?.kind === 'native' && a[0].data.text === 'toSet'
        return list([...l], asSet ? 'LinkedHashSet' : 'ArrayList')
      }
      case 'filter':
        return newList(l.filter((w) => isTrue(callFunction(a[0], [w], i, line, 'test'))))
      case 'map':
      case 'mapToInt':
      case 'mapToObj':
      case 'mapToDouble':
        return newList(l.map((w) => callFunction(a[0], [w], i, line)))
      case 'sorted':
        return newList([...l].sort(a[0] ? comparator(a[0], i, line) : (x, y) => compare(x, y, i)))
      case 'distinct': {
        const seen: Value[] = []
        for (const w of l) if (!seen.some((v) => contentEquals(v, w))) seen.push(w)
        return newList(seen)
      }
      case 'limit':
        return newList(l.slice(0, toNumber(a[0])))
      case 'skip':
        return newList(l.slice(toNumber(a[0])))
      case 'count':
        return { kind: 'long', value: l.length }
      case 'sum':
        return l.some((w) => w.kind === 'double') ? comma(l.reduce((s, w) => s + toNumber(w), 0)) : number(l.reduce((s, w) => s + toNumber(w), 0))
      case 'average':
        return optional(l.length ? [comma(l.reduce((s, w) => s + toNumber(w), 0) / l.length)] : [])
      case 'anyMatch':
        return bool(l.some((w) => isTrue(callFunction(a[0], [w], i, line, 'test'))))
      case 'allMatch':
        return bool(l.every((w) => isTrue(callFunction(a[0], [w], i, line, 'test'))))
      case 'noneMatch':
        return bool(!l.some((w) => isTrue(callFunction(a[0], [w], i, line, 'test'))))
      case 'findFirst':
        return optional(l.length ? [l[0]] : [])
      case 'reduce':
        return l.reduce((sum, w) => callFunction(a[1] ?? a[0], [sum, w], i, line), a.length > 1 ? a[0] : l[0] ?? NULL)
      case 'toArray':
        return { kind: 'array', type: 'Object', values: [...l] }
      case 'subList':
        return list(l.slice(toNumber(a[0]), toNumber(a[1])))
      case 'iterator':
        return { kind: 'native', type: 'Iterator', data: { list: [...l], number: 0 } }
      case 'hasNext':
        return bool((data.number ?? 0) < l.length)
      case 'next':
        if ((data.number ?? 0) >= l.length) i.raise('NoSuchElementException', null, line)
        return l[data.number!++]
      // --- Optional ---
      case 'isPresent':
        return bool(l.length > 0)
      case 'isEmptyOptional':
        return bool(l.length === 0)
      case 'orElse':
        return l.length ? l[0] : a[0]
      case 'ifPresent':
        if (l.length) callFunction(a[0], [l[0]], i, line, 'accept')
        return NULL
      case 'getAsDouble':
        if (!l.length) i.raise('NoSuchElementException', 'No value present', line)
        return l[0]
      // --- Map.Entry ---
      case 'getKey':
        return l[0]
      case 'getValue':
        return l[1]
      case 'equals':
        return bool(contentEquals(target, a[0]))
      case 'toString':
        return newString(i.toText(target))
    }
    if (target.type === 'Optional' && name === 'get') {
      if (!l.length) i.raise('NoSuchElementException', 'No value present', line)
      return l[0]
    }
  }

  // --- Map ------------------------------------------------------------------
  if (data.map) {
    const m = data.map
    const sort = () => {
      if (target.type !== 'TreeMap') return
      const entries = [...m.entries()].sort((x, y) => compare(x[1].key, y[1].key, i))
      m.clear()
      for (const [k, e] of entries) m.set(k, e)
    }
    switch (name) {
      case 'put': {
        const key = keyOf(a[0])
        const previous = m.get(key)?.value ?? NULL
        m.set(key, { key: a[0], value: a[1] })
        sort()
        return previous
      }
      case 'putIfAbsent': {
        const key = keyOf(a[0])
        if (m.has(key)) return m.get(key)!.value
        m.set(key, { key: a[0], value: a[1] })
        sort()
        return NULL
      }
      case 'get':
        return m.get(keyOf(a[0]))?.value ?? NULL
      case 'getOrDefault':
        return m.get(keyOf(a[0]))?.value ?? a[1]
      case 'containsKey':
        return bool(m.has(keyOf(a[0])))
      case 'containsValue':
        return bool([...m.values()].some((e) => contentEquals(e.value, a[0])))
      case 'remove': {
        const key = keyOf(a[0])
        const previous = m.get(key)?.value ?? NULL
        m.delete(key)
        return previous
      }
      case 'size':
        return number(m.size)
      case 'isEmpty':
        return bool(m.size === 0)
      case 'clear':
        m.clear()
        return NULL
      case 'keySet':
        return list([...m.values()].map((e) => e.key), 'LinkedHashSet')
      case 'values':
        return list([...m.values()].map((e) => e.value))
      case 'entrySet':
        return list([...m.values()].map((e) => ({ kind: 'native' as const, type: 'Entry', data: { list: [e.key, e.value] } })), 'LinkedHashSet')
      case 'forEach':
        for (const e of [...m.values()]) callFunction(a[0], [e.key, e.value], i, line, 'accept')
        return NULL
      case 'merge': {
        const key = keyOf(a[0])
        const previous = m.get(key)
        const fresh = previous ? callFunction(a[2], [previous.value, a[1]], i, line) : a[1]
        m.set(key, { key: a[0], value: fresh })
        sort()
        return fresh
      }
      case 'computeIfAbsent': {
        const key = keyOf(a[0])
        if (!m.has(key)) m.set(key, { key: a[0], value: callFunction(a[1], [a[0]], i, line) })
        sort()
        return m.get(key)!.value
      }
      case 'equals':
        return bool(contentEquals(target, a[0]))
      case 'toString':
        return newString(i.toText(target))
    }
  }

  // --- StringBuilder --------------------------------------------------------
  if (target.type === 'StringBuilder') {
    switch (name) {
      case 'append':
        data.text = (data.text ?? '') + i.toText(a[0])
        return target
      case 'insert':
        data.text = (data.text ?? '').slice(0, toNumber(a[0])) + i.toText(a[1]) + (data.text ?? '').slice(toNumber(a[0]))
        return target
      case 'reverse':
        data.text = [...(data.text ?? '')].reverse().join('')
        return target
      case 'deleteCharAt':
        data.text = (data.text ?? '').slice(0, toNumber(a[0])) + (data.text ?? '').slice(toNumber(a[0]) + 1)
        return target
      case 'setCharAt':
        data.text = (data.text ?? '').slice(0, toNumber(a[0])) + i.toText(a[1]) + (data.text ?? '').slice(toNumber(a[0]) + 1)
        return NULL
      case 'length':
        return number((data.text ?? '').length)
      case 'charAt':
        return chars((data.text ?? '').charCodeAt(toNumber(a[0])))
      case 'toString':
        return newString(data.text ?? '')
      case 'isEmpty':
        return bool(!data.text)
    }
  }

  // --- Random ---------------------------------------------------------------
  if (target.type === 'Random') {
    // Ein einfacher, aber reproduzierbarer Zufallsgenerator (LCG).
    const next = () => {
      data.number = (Math.imul(1664525, data.number ?? 0) + 1013904223) >>> 0
      return data.number / 4294967296
    }
    if (name === 'nextInt') return number(a.length === 2 ? toNumber(a[0]) + Math.floor(next() * (toNumber(a[1]) - toNumber(a[0]))) : Math.floor(next() * (a.length ? toNumber(a[0]) : 2 ** 31)))
    if (name === 'nextDouble') return comma(next())
    if (name === 'nextBoolean') return bool(next() < 0.5)
  }

  // --- Class ----------------------------------------------------------------
  if (target.type === 'Class') {
    if (name === 'getSimpleName' || name === 'getName') return newString(data.text ?? '')
  }

  // --- Exceptions -----------------------------------------------------------
  if (isExceptionClass(target.type)) {
    if (name === 'getMessage' || name === 'getLocalizedMessage') return data.message === undefined ? NULL : newString(data.message)
    if (name === 'toString') return newString(i.exceptionText(target))
    if (name === 'getClass') return { kind: 'native', type: 'Class', data: { text: target.type } }
    if (name === 'printStackTrace') {
      i.print(i.exceptionText(target) + '\n', 'err')
      return NULL
    }
  }

  // --- Für alle -------------------------------------------------------------
  if (name === 'equals') return bool(contentEquals(target, a[0]))
  if (name === 'toString') return newString(i.toText(target))
  if (name === 'getClass') return { kind: 'native', type: 'Class', data: { text: target.type } }
  if (name === 'hashCode') return number(0)

  i.abort(`${target.type} hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name} in ${target.type}`, line)
}

const isTrue = (w: Value) => w.kind === 'boolean' && w.value

// ---------------------------------------------------------------------------
// String-Methoden
// ---------------------------------------------------------------------------

export function stringMethod(target: JavaString, name: string, a: Value[], i: Interpreter, line: number): Value {
  const s = target.value
  const n = (index: number) => toNumber(a[index])
  const t = (index: number) => i.toText(a[index])
  const bound = (index: number, max = s.length) => {
    if (index < 0 || index > max) {
      i.raise('StringIndexOutOfBoundsException', `index ${index}, length ${s.length}`, line)
    }
  }

  switch (name) {
    case 'length':
      return number(s.length)
    case 'charAt':
      bound(n(0), s.length - 1)
      return chars(s.charCodeAt(n(0)))
    case 'substring': {
      const from = n(0)
      const end = a.length > 1 ? n(1) : s.length
      bound(from)
      bound(end)
      if (from > end) i.raise('StringIndexOutOfBoundsException', `begin ${from}, end ${end}, length ${s.length}`, line)
      return newString(s.slice(from, end))
    }
    case 'indexOf':
      return number(s.indexOf(a[0].kind === 'char' ? String.fromCharCode(toNumber(a[0])) : t(0), a.length > 1 ? n(1) : 0))
    case 'lastIndexOf':
      return number(s.lastIndexOf(t(0)))
    case 'contains':
      return bool(s.includes(t(0)))
    case 'startsWith':
      return bool(s.startsWith(t(0)))
    case 'endsWith':
      return bool(s.endsWith(t(0)))
    case 'equals':
      return bool(a[0].kind === 'string' && a[0].value === s)
    case 'equalsIgnoreCase':
      return bool(a[0].kind === 'string' && a[0].value.toLowerCase() === s.toLowerCase())
    case 'compareTo':
      return number(a[0].kind === 'string' ? (s < a[0].value ? -1 : s > a[0].value ? 1 : 0) : 0)
    case 'compareToIgnoreCase': {
      const b = t(0).toLowerCase()
      const x = s.toLowerCase()
      return number(x < b ? -1 : x > b ? 1 : 0)
    }
    case 'toUpperCase':
      return newString(s.toUpperCase())
    case 'toLowerCase':
      return newString(s.toLowerCase())
    case 'trim':
    case 'strip':
      return newString(s.trim())
    case 'isEmpty':
      return bool(s.length === 0)
    case 'isBlank':
      return bool(s.trim().length === 0)
    case 'replace':
      return newString(s.split(a[0].kind === 'char' ? String.fromCharCode(toNumber(a[0])) : t(0)).join(a[1].kind === 'char' ? String.fromCharCode(toNumber(a[1])) : t(1)))
    case 'replaceAll':
      return newString(s.replace(new RegExp(t(0), 'g'), t(1)))
    case 'split': {
      const pattern = t(0)
      // split() erwartet in Java einen regulären Ausdruck - aber nur, wenn wirklich
      // einer drinsteht. Sonst wird stumpf am Text getrennt (z. B. bei "a.b").
      const parts = /[\\[\](){}.*+?^$|]/.test(pattern) ? s.split(new RegExp(pattern)) : s.split(pattern)
      return { kind: 'array', type: 'String', values: parts.map((part) => newString(part)) }
    }
    case 'toCharArray':
      return { kind: 'array', type: 'char', values: [...s].map((c) => chars(c.charCodeAt(0))) }
    case 'repeat':
      return newString(s.repeat(n(0)))
    case 'concat':
      return newString(s + t(0))
    case 'matches':
      return bool(new RegExp('^(?:' + t(0) + ')$').test(s))
    case 'hashCode': {
      let h = 0
      for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0
      return number(h)
    }
    case 'chars':
      return { kind: 'native', type: 'Stream', data: { list: [...s].map((c) => number(c.charCodeAt(0))) } }
    case 'formatted':
      return newString(format(s, a, i, line))
    case 'intern':
      return poolString(s)
    case 'toString':
      return target
    case 'getClass':
      return { kind: 'native', type: 'Class', data: { text: 'String' } }
  }
  i.abort(`String hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name} in class String`, line)
}

// ---------------------------------------------------------------------------
// Methoden auf Zahlen, char und boolean (Autoboxing)
// ---------------------------------------------------------------------------

export function primitiveMethod(target: Value, name: string, a: Value[], i: Interpreter, line: number): Value {
  switch (name) {
    case 'equals':
      return bool(contentEquals(target, a[0]))
    case 'toString':
      return newString(i.toText(target))
    case 'compareTo':
      return number(Math.sign(compare(target, a[0], i)))
    case 'intValue':
      return number(Math.trunc(toNumber(target)))
    case 'doubleValue':
      return comma(toNumber(target))
    case 'charValue':
      return target
    case 'booleanValue':
      return target
    case 'hashCode':
      return number(Math.trunc(toNumber(target)))
    case 'getClass':
      return { kind: 'native', type: 'Class', data: { text: typeName(target) } }
  }
  i.abort(`${typeName(target)} hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name}`, line)
}
