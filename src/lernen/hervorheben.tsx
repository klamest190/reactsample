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
 *
 * Part 8 adds a second mode, `konfig`, for files that are not program code:
 * Dockerfiles, compose.yaml, application.properties, `.http` requests and
 * terminal commands - `#` comments, instructions, keys and values.
 *
 * Part 9 adds `sql`: keywords in any case, `--` and block comments, 'strings',
 * "quoted names" and psql meta commands like `\dt`.
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
  | 'annotation'
  | 'text'

type Token = { typ: TokenTyp; text: string }

export type HighlightMode = 'code' | 'konfig' | 'sql'

const KEYWORDS = new Set(
  (
    'const let var function return if else for while do switch case break continue ' +
    'default new class extends import from export async await try catch finally throw ' +
    'typeof instanceof in of this super yield delete void as type interface ' +
    'readonly keyof infer satisfies declare ' +
    // Java
    'public private protected static final abstract implements package throws enum ' +
    'record int long short byte double float boolean char synchronized native'
  ).split(' '),
)
const LITERALE = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'])

// Gruppen: 1 Kommentar · 2 String · 3 JSX-Tag · 4 Zahl · 5 Annotation (Java: @GetMapping) · 6 Wort
const MUSTER =
  /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\[\s\S]|[^`\\])*`?)|(<\/?[A-Za-z][\w.]*)|(\b\d[\d_]*(?:\.\d+)?\b)|(@[A-Za-z][\w.]*)|([A-Za-z_$][\w$]*)/g

function tokenisieren(code: string): Token[] {
  const tokens: Token[] = []
  let position = 0

  for (const treffer of code.matchAll(MUSTER)) {
    const start = treffer.index
    if (start > position) tokens.push({ typ: 'text', text: code.slice(position, start) })
    const [text, kommentar, string, tag, zahl, annotation, wort] = treffer
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
    else if (annotation) tokens.push({ typ: 'annotation', text })
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

// --- Config files: Dockerfile, YAML, properties, .http, shell -----------------------------

const INSTRUCTION = /^(\s*)(FROM|RUN|CMD|LABEL|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|HEALTHCHECK|SHELL|STOPSIGNAL|ONBUILD|GET|POST|PUT|PATCH|DELETE|docker|curl|mvn|npm|\$)(?=\s|$)/
const KEY = /^(\s*(?:-\s+)?)([\w.$@-]+)(\s*[:=])/
const VALUE = /("(?:\\.|[^"\\\n])*"?|'[^'\n]*'?)|(\$\{[^}\n]*\}|--?[\w-]+=?|→|->)|(\b\d+(?:\.\d+)?\b)|(\b(?:true|false|null|AS|as)\b)/g

function tokenizeConfig(code: string): Token[] {
  const tokens: Token[] = []
  code.split('\n').forEach((line, index) => {
    if (index > 0) tokens.push({ typ: 'text', text: '\n' })
    const comment = line.match(/^(\s*)(#.*)$/)
    if (comment) {
      tokens.push({ typ: 'text', text: comment[1] }, { typ: 'kommentar', text: comment[2] })
      return
    }
    let rest = line
    const instruction = rest.match(INSTRUCTION)
    if (instruction) {
      tokens.push({ typ: 'text', text: instruction[1] }, { typ: 'keyword', text: instruction[2] })
      rest = rest.slice(instruction[0].length)
    } else {
      const key = rest.match(KEY)
      if (key) {
        tokens.push({ typ: 'text', text: key[1] }, { typ: 'funktion', text: key[2] }, { typ: 'text', text: key[3] })
        rest = rest.slice(key[0].length)
      }
    }
    // A trailing comment after a value: "image: nginx  # web server"
    const trailing = rest.match(/\s#.*$/)
    const body = trailing ? rest.slice(0, trailing.index) : rest
    let position = 0
    for (const match of body.matchAll(VALUE)) {
      if (match.index > position) tokens.push({ typ: 'text', text: body.slice(position, match.index) })
      const [text, string, special, number, literal] = match
      tokens.push({ typ: string ? 'string' : special ? 'literal' : number ? 'zahl' : literal ? 'keyword' : 'text', text })
      position = match.index + text.length
    }
    if (position < body.length) tokens.push({ typ: 'text', text: body.slice(position) })
    if (trailing) tokens.push({ typ: 'kommentar', text: trailing[0] })
  })
  return tokens
}

// --- SQL (part 9) --------------------------------------------------------------------------

const SQL_KEYWORDS = new Set(
  (
    'select from where and or not in is null as order by asc desc limit offset distinct group having join inner left right full outer cross on using ' +
    'insert into values update set delete returning create table alter add column drop rename to index view materialized primary key foreign references ' +
    'unique check default constraint cascade restrict begin commit rollback transaction savepoint union all intersect except case when then else end ' +
    'exists between like ilike with recursive over partition window filter explain analyze if conflict do nothing generated always identity nulls first last ' +
    'integer int bigint smallint serial bigserial numeric decimal real double precision text varchar char boolean date time timestamp timestamptz interval jsonb json uuid'
  ).split(' '),
)
const SQL_LITERALS = new Set(['true', 'false', 'null', 'current_date', 'current_timestamp'])

// Groups: 1 comment · 2 string · 3 quoted name · 4 meta command · 5 number · 6 word
const SQL_PATTERN = /(--[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|([eE]?'(?:''|[^'])*'?|\$\$[\s\S]*?(?:\$\$|$))|("[^"\n]*"?)|(^[ \t]*\\\S+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w$]*)/gm

function tokenizeSql(code: string): Token[] {
  const tokens: Token[] = []
  let position = 0
  for (const match of code.matchAll(SQL_PATTERN)) {
    if (match.index > position) tokens.push({ typ: 'text', text: code.slice(position, match.index) })
    const [text, comment, string, quoted, meta, number, word] = match
    position = match.index + text.length
    if (comment) tokens.push({ typ: 'kommentar', text })
    else if (string) tokens.push({ typ: 'string', text })
    else if (quoted) tokens.push({ typ: 'komponente', text })
    else if (meta) tokens.push({ typ: 'annotation', text })
    else if (number) tokens.push({ typ: 'zahl', text })
    else if (word) {
      const lower = word.toLowerCase()
      const next = code.slice(position).match(/^\s*(.)/)?.[1]
      tokens.push({ typ: SQL_LITERALS.has(lower) ? 'literal' : SQL_KEYWORDS.has(lower) ? 'keyword' : next === '(' ? 'funktion' : 'text', text: word })
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
  annotation: 'text-amber-600 dark:text-amber-300',
  text: '',
}

/** Rendert Code als eingefärbte <span>s - für CodeBlock und CodeEditor. */
export function HervorgehobenerCode({ code, sprache = 'code' }: { code: string; sprache?: HighlightMode }) {
  return (sprache === 'konfig' ? tokenizeConfig(code) : sprache === 'sql' ? tokenizeSql(code) : tokenisieren(code)).map((t, i) =>
    t.typ === 'text' ? (
      t.text
    ) : (
      <span key={i} className={FARBEN[t.typ]}>
        {t.text}
      </span>
    ),
  )
}
