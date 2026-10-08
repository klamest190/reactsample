/**
 * ════════════════════════════════════════════════════════════════════════════
 *  JAVA-TEIL · Schritt 1 von 4: aus Text werden Token
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Dieser Ordner (`src/java/`) ist die kleine Java-Laufzeit des Kurses:
 * reines TypeScript, kein React, kein DOM. Sie bekommt Java-Quelltext als
 * String und liefert Ausgaben zurück - mehr Berührung mit der App gibt es nicht.
 *
 *   lexer.ts       → Zeichen zu Token        ("int", "x", "=", "5", ";")
 *   parser.ts      → Token zu Syntaxbaum     (siehe ast.ts)
 *   pruefer.ts     → Typprüfung VOR dem Lauf (das, was javac macht)
 *   interpreter.ts → den Baum ausführen      (das, was die JVM macht)
 *
 * Der Lexer selbst ist ein einziger Durchlauf durch den Text: Leerraum und
 * Kommentare überspringen, sonst das längste passende Token einsammeln.
 */

export type TokenKind = 'name' | 'keyword' | 'number' | 'text' | 'char' | 'symbol' | 'end'

export type Token = {
  kind: TokenKind
  /** Der Quelltext des Tokens - bei Strings ohne Anführungszeichen. */
  text: string
  /** Bei Zahlen der Wert, bei `char` der Code-Punkt. */
  value?: number
  /** true, wenn die Zahl double/float ist (3.14, 2e3, 1.0f). */
  isFloat?: boolean
  line: number
  column: number
}

/** Alle Schlüsselwörter, die diese Laufzeit kennt (echtes Java hat ein paar mehr). */
export const KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
  'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
  'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
  'new', 'package', 'private', 'protected', 'public', 'record', 'return', 'short', 'static',
  'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try',
  'void', 'volatile', 'while', 'var', 'yield',
])

/** Literale sind in Java keine Schlüsselwörter, verhalten sich hier aber so. */
export const LITERALS = new Set(['true', 'false', 'null'])

/** Mehrzeichen-Operatoren, längste zuerst - so greift immer der längste Treffer. */
const SYMBOLS = [
  '>>>=', '<<=', '>>=', '>>>', '...', '->', '::',
  '++', '--', '&&', '||', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<',
  '{', '}', '(', ')', '[', ']', ';', ',', '.', '=', '>', '<', '!', '~', '?', ':', '+', '-', '*', '/',
  '&', '|', '^', '%', '@',
]

/** Fehler, den Lexer, Parser und Prüfer werfen: eine Meldung mit Zeilennummer. */
export class JavaSyntaxError extends Error {
  message: string
  line: number

  constructor(message: string, line: number) {
    super(message)
    this.name = 'JavaSyntaxFehler'
    this.message = message
    this.line = line
  }
}

const ESCAPES: Record<string, string> = {
  n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', s: ' ', '0': '\0', "'": "'", '"': '"', '\\': '\\',
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  let line = 1
  let lineStart = 0

  const column = () => i - lineStart + 1
  const error = (message: string): never => {
    throw new JavaSyntaxError(message, line)
  }

  while (i < source.length) {
    const c = source[i]

    // --- Leerraum -----------------------------------------------------------
    if (c === '\n') {
      line++
      i++
      lineStart = i
      continue
    }
    if (c === ' ' || c === '\t' || c === '\r') {
      i++
      continue
    }

    // --- Kommentare ---------------------------------------------------------
    if (c === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++
      continue
    }
    if (c === '/' && source[i + 1] === '*') {
      const start = line
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') {
          line++
          lineStart = i + 1
        }
        i++
      }
      if (i >= source.length) throw new JavaSyntaxError('unclosed comment', start)
      i += 2
      continue
    }

    const begin = { line, column: column() }

    // --- Namen & Schlüsselwörter -------------------------------------------
    if (/[A-Za-z_$]/.test(c)) {
      let j = i
      while (j < source.length && /[A-Za-z0-9_$]/.test(source[j])) j++
      const text = source.slice(i, j)
      i = j
      tokens.push({ kind: KEYWORDS.has(text) ? 'keyword' : 'name', text, ...begin })
      continue
    }

    // --- Zahlen -------------------------------------------------------------
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(source[i + 1] ?? ''))) {
      let j = i
      let isFloat = false
      if (c === '0' && /[xXbB]/.test(source[i + 1] ?? '')) {
        j = i + 2
        while (j < source.length && /[0-9a-fA-F_]/.test(source[j])) j++
      } else {
        while (j < source.length && /[0-9_]/.test(source[j])) j++
        if (source[j] === '.' && /[0-9]/.test(source[j + 1] ?? '')) {
          isFloat = true
          j++
          while (j < source.length && /[0-9_]/.test(source[j])) j++
        }
        if (/[eE]/.test(source[j] ?? '') && /[0-9+-]/.test(source[j + 1] ?? '')) {
          isFloat = true
          j += 2
          while (j < source.length && /[0-9]/.test(source[j])) j++
        }
      }
      const text = source.slice(i, j)
      const suffix = source[j] ?? ''
      if (/[lLdDfF]/.test(suffix)) {
        if (/[dDfF]/.test(suffix)) isFloat = true
        j++
      }
      i = j
      const value = Number(text.replace(/_/g, ''))
      if (Number.isNaN(value)) error(`malformed numeric literal: ${text}`)
      tokens.push({ kind: 'number', text, value, isFloat, ...begin })
      continue
    }

    // --- Strings ------------------------------------------------------------
    if (c === '"') {
      // Textblock """…""" (Java 15+)
      if (source.startsWith('"""', i)) {
        const end = source.indexOf('"""', i + 3)
        if (end < 0) error('unclosed text block')
        const raw = source.slice(i + 3, end).replace(/^[ \t]*\n/, '')
        for (const z of source.slice(i, end + 3)) if (z === '\n') line++
        i = end + 3
        const lines = raw.split('\n')
        const indent = Math.min(
          ...lines.filter((z) => z.trim()).map((z) => z.match(/^[ \t]*/)![0].length),
          Number.MAX_SAFE_INTEGER,
        )
        const content = lines.map((z) => z.slice(indent)).join('\n').replace(/\n$/, '')
        tokens.push({ kind: 'text', text: content, ...begin })
        continue
      }
      let j = i + 1
      let text = ''
      while (j < source.length && source[j] !== '"') {
        if (source[j] === '\n') error('unclosed string literal')
        if (source[j] === '\\') {
          const e = source[j + 1]
          if (e === 'u') {
            text += String.fromCharCode(parseInt(source.slice(j + 2, j + 6), 16))
            j += 6
            continue
          }
          text += ESCAPES[e] ?? e
          j += 2
          continue
        }
        text += source[j]
        j++
      }
      if (j >= source.length) error('unclosed string literal')
      i = j + 1
      tokens.push({ kind: 'text', text, ...begin })
      continue
    }

    // --- char ---------------------------------------------------------------
    if (c === "'") {
      let j = i + 1
      let chars: string
      if (source[j] === '\\') {
        const e = source[j + 1]
        if (e === 'u') {
          chars = String.fromCharCode(parseInt(source.slice(j + 2, j + 6), 16))
          j += 6
        } else {
          chars = ESCAPES[e] ?? e
          j += 2
        }
      } else {
        chars = source[j]
        j++
      }
      if (source[j] !== "'") error('unclosed character literal')
      i = j + 1
      tokens.push({ kind: 'char', text: chars, value: chars.charCodeAt(0), ...begin })
      continue
    }

    // --- Operatoren & Satzzeichen ------------------------------------------
    const symbol = SYMBOLS.find((s) => source.startsWith(s, i))
    if (symbol) {
      i += symbol.length
      tokens.push({ kind: 'symbol', text: symbol, ...begin })
      continue
    }

    error(`illegal character: '${c}'`)
  }

  tokens.push({ kind: 'end', text: '<ende>', line, column: column() })
  return tokens
}
