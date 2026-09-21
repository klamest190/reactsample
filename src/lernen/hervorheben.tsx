/**
 * Minimaler Syntax-Highlighter für JavaScript/JSX - und für Java.
 *
 * Kein vollständiger Parser - ein einziger regulärer Ausdruck zerlegt den Code
 * in Kommentare, Strings, JSX-Tags, Zahlen und Wörter. Für Lernbeispiele reicht
 * das völlig und kostet keine zusätzliche Bibliothek.
 *
 * Die Schlüsselwörter beider Sprachen stehen in einer gemeinsamen Liste. Das
 * genügt hier, weil sich die Wörter kaum überschneiden und ein falsch
 * eingefärbtes Wort niemandem wehtut.
 */

type TokenTyp =
  | 'kommentar'
  | 'string'
  | 'keyword'
  | 'literal'
  | 'zahl'
  | 'tag'
  | 'funktion'
  | 'komponente'
  | 'text'

type Token = { typ: TokenTyp; text: string }

const KEYWORDS = new Set(
  (
    'const let var function return if else for while do switch case break continue ' +
    'default new class extends import from export async await try catch finally throw ' +
    'typeof instanceof in of this super yield delete void as type interface ' +
    // Java
    'public private protected static final abstract implements package throws enum ' +
    'record int long short byte double float boolean char synchronized native'
  ).split(' '),
)
const LITERALE = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'])

// Gruppen: 1 Kommentar · 2 String · 3 JSX-Tag · 4 Zahl · 5 Wort
const MUSTER =
  /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\[\s\S]|[^`\\])*`?)|(<\/?[A-Za-z][\w.]*)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g

function tokenisieren(code: string): Token[] {
  const tokens: Token[] = []
  let position = 0

  for (const treffer of code.matchAll(MUSTER)) {
    const start = treffer.index
    if (start > position) tokens.push({ typ: 'text', text: code.slice(position, start) })
    const [text, kommentar, string, tag, zahl, wort] = treffer
    position = start + text.length

    if (kommentar) tokens.push({ typ: 'kommentar', text })
    else if (string) tokens.push({ typ: 'string', text })
    else if (tag) {
      // `a<b` ist ein Vergleich, kein Tag: direkt davor steht ein Bezeichner.
      const davor = code[start - 1] ?? ''
      if (/[\w$)\]]/.test(davor)) {
        tokens.push({ typ: 'text', text: '<' })
        position = start + 1
      } else {
        tokens.push({ typ: 'tag', text })
      }
    } else if (zahl) tokens.push({ typ: 'zahl', text })
    else if (wort) {
      const danach = code.slice(position).match(/^\s*(.)/)?.[1]
      const typ: TokenTyp = KEYWORDS.has(wort)
        ? 'keyword'
        : LITERALE.has(wort)
          ? 'literal'
          : danach === '('
            ? 'funktion'
            : /^[A-Z]/.test(wort)
              ? 'komponente'
              : 'text'
      tokens.push({ typ, text: wort })
    }
  }

  if (position < code.length) tokens.push({ typ: 'text', text: code.slice(position) })
  return tokens
}

// Vollständige Klassennamen, damit der Tailwind-Scanner sie findet.
const FARBEN: Record<TokenTyp, string> = {
  kommentar: 'text-slate-400 italic dark:text-slate-500',
  string: 'text-emerald-700 dark:text-emerald-400',
  keyword: 'text-violet-700 dark:text-violet-400',
  literal: 'text-amber-700 dark:text-amber-400',
  zahl: 'text-amber-700 dark:text-amber-400',
  tag: 'text-rose-600 dark:text-rose-400',
  funktion: 'text-sky-700 dark:text-sky-400',
  komponente: 'text-teal-700 dark:text-teal-300',
  text: '',
}

/** Rendert Code als eingefärbte <span>s - für CodeBlock und CodeEditor. */
export function HervorgehobenerCode({ code }: { code: string }) {
  return tokenisieren(code).map((t, i) =>
    t.typ === 'text' ? (
      t.text
    ) : (
      <span key={i} className={FARBEN[t.typ]}>
        {t.text}
      </span>
    ),
  )
}
