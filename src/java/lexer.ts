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

export type TokenArt = 'name' | 'schluessel' | 'zahl' | 'text' | 'zeichen' | 'symbol' | 'ende'

export type Token = {
  art: TokenArt
  /** Der Quelltext des Tokens - bei Strings ohne Anführungszeichen. */
  text: string
  /** Bei Zahlen der Wert, bei `char` der Code-Punkt. */
  wert?: number
  /** true, wenn die Zahl double/float ist (3.14, 2e3, 1.0f). */
  kommazahl?: boolean
  zeile: number
  spalte: number
}

/** Alle Schlüsselwörter, die diese Laufzeit kennt (echtes Java hat ein paar mehr). */
export const SCHLUESSELWOERTER = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
  'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
  'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
  'new', 'package', 'private', 'protected', 'public', 'record', 'return', 'short', 'static',
  'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try',
  'void', 'volatile', 'while', 'var', 'yield',
])

/** Literale sind in Java keine Schlüsselwörter, verhalten sich hier aber so. */
export const LITERALE = new Set(['true', 'false', 'null'])

/** Mehrzeichen-Operatoren, längste zuerst - so greift immer der längste Treffer. */
const SYMBOLE = [
  '>>>=', '<<=', '>>=', '>>>', '...', '->', '::',
  '++', '--', '&&', '||', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<',
  '{', '}', '(', ')', '[', ']', ';', ',', '.', '=', '>', '<', '!', '~', '?', ':', '+', '-', '*', '/',
  '&', '|', '^', '%', '@',
]

/** Fehler, den Lexer, Parser und Prüfer werfen: eine Meldung mit Zeilennummer. */
export class JavaSyntaxFehler extends Error {
  meldung: string
  zeile: number

  constructor(meldung: string, zeile: number) {
    super(meldung)
    this.name = 'JavaSyntaxFehler'
    this.meldung = meldung
    this.zeile = zeile
  }
}

const ESCAPES: Record<string, string> = {
  n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', s: ' ', '0': '\0', "'": "'", '"': '"', '\\': '\\',
}

export function tokenisieren(quelle: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  let zeile = 1
  let zeilenAnfang = 0

  const spalte = () => i - zeilenAnfang + 1
  const fehler = (meldung: string): never => {
    throw new JavaSyntaxFehler(meldung, zeile)
  }

  while (i < quelle.length) {
    const c = quelle[i]

    // --- Leerraum -----------------------------------------------------------
    if (c === '\n') {
      zeile++
      i++
      zeilenAnfang = i
      continue
    }
    if (c === ' ' || c === '\t' || c === '\r') {
      i++
      continue
    }

    // --- Kommentare ---------------------------------------------------------
    if (c === '/' && quelle[i + 1] === '/') {
      while (i < quelle.length && quelle[i] !== '\n') i++
      continue
    }
    if (c === '/' && quelle[i + 1] === '*') {
      const start = zeile
      i += 2
      while (i < quelle.length && !(quelle[i] === '*' && quelle[i + 1] === '/')) {
        if (quelle[i] === '\n') {
          zeile++
          zeilenAnfang = i + 1
        }
        i++
      }
      if (i >= quelle.length) throw new JavaSyntaxFehler('unclosed comment', start)
      i += 2
      continue
    }

    const beginn = { zeile, spalte: spalte() }

    // --- Namen & Schlüsselwörter -------------------------------------------
    if (/[A-Za-z_$]/.test(c)) {
      let j = i
      while (j < quelle.length && /[A-Za-z0-9_$]/.test(quelle[j])) j++
      const text = quelle.slice(i, j)
      i = j
      tokens.push({ art: SCHLUESSELWOERTER.has(text) ? 'schluessel' : 'name', text, ...beginn })
      continue
    }

    // --- Zahlen -------------------------------------------------------------
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(quelle[i + 1] ?? ''))) {
      let j = i
      let kommazahl = false
      if (c === '0' && /[xXbB]/.test(quelle[i + 1] ?? '')) {
        j = i + 2
        while (j < quelle.length && /[0-9a-fA-F_]/.test(quelle[j])) j++
      } else {
        while (j < quelle.length && /[0-9_]/.test(quelle[j])) j++
        if (quelle[j] === '.' && /[0-9]/.test(quelle[j + 1] ?? '')) {
          kommazahl = true
          j++
          while (j < quelle.length && /[0-9_]/.test(quelle[j])) j++
        }
        if (/[eE]/.test(quelle[j] ?? '') && /[0-9+-]/.test(quelle[j + 1] ?? '')) {
          kommazahl = true
          j += 2
          while (j < quelle.length && /[0-9]/.test(quelle[j])) j++
        }
      }
      const text = quelle.slice(i, j)
      const suffix = quelle[j] ?? ''
      if (/[lLdDfF]/.test(suffix)) {
        if (/[dDfF]/.test(suffix)) kommazahl = true
        j++
      }
      i = j
      const wert = Number(text.replace(/_/g, ''))
      if (Number.isNaN(wert)) fehler(`malformed numeric literal: ${text}`)
      tokens.push({ art: 'zahl', text, wert, kommazahl, ...beginn })
      continue
    }

    // --- Strings ------------------------------------------------------------
    if (c === '"') {
      // Textblock """…""" (Java 15+)
      if (quelle.startsWith('"""', i)) {
        const ende = quelle.indexOf('"""', i + 3)
        if (ende < 0) fehler('unclosed text block')
        const roh = quelle.slice(i + 3, ende).replace(/^[ \t]*\n/, '')
        for (const z of quelle.slice(i, ende + 3)) if (z === '\n') zeile++
        i = ende + 3
        const zeilen = roh.split('\n')
        const einzug = Math.min(
          ...zeilen.filter((z) => z.trim()).map((z) => z.match(/^[ \t]*/)![0].length),
          Number.MAX_SAFE_INTEGER,
        )
        const inhalt = zeilen.map((z) => z.slice(einzug)).join('\n').replace(/\n$/, '')
        tokens.push({ art: 'text', text: inhalt, ...beginn })
        continue
      }
      let j = i + 1
      let text = ''
      while (j < quelle.length && quelle[j] !== '"') {
        if (quelle[j] === '\n') fehler('unclosed string literal')
        if (quelle[j] === '\\') {
          const e = quelle[j + 1]
          if (e === 'u') {
            text += String.fromCharCode(parseInt(quelle.slice(j + 2, j + 6), 16))
            j += 6
            continue
          }
          text += ESCAPES[e] ?? e
          j += 2
          continue
        }
        text += quelle[j]
        j++
      }
      if (j >= quelle.length) fehler('unclosed string literal')
      i = j + 1
      tokens.push({ art: 'text', text, ...beginn })
      continue
    }

    // --- char ---------------------------------------------------------------
    if (c === "'") {
      let j = i + 1
      let zeichen: string
      if (quelle[j] === '\\') {
        const e = quelle[j + 1]
        if (e === 'u') {
          zeichen = String.fromCharCode(parseInt(quelle.slice(j + 2, j + 6), 16))
          j += 6
        } else {
          zeichen = ESCAPES[e] ?? e
          j += 2
        }
      } else {
        zeichen = quelle[j]
        j++
      }
      if (quelle[j] !== "'") fehler('unclosed character literal')
      i = j + 1
      tokens.push({ art: 'zeichen', text: zeichen, wert: zeichen.charCodeAt(0), ...beginn })
      continue
    }

    // --- Operatoren & Satzzeichen ------------------------------------------
    const symbol = SYMBOLE.find((s) => quelle.startsWith(s, i))
    if (symbol) {
      i += symbol.length
      tokens.push({ art: 'symbol', text: symbol, ...beginn })
      continue
    }

    fehler(`illegal character: '${c}'`)
  }

  tokens.push({ art: 'ende', text: '<ende>', zeile, spalte: spalte() })
  return tokens
}
