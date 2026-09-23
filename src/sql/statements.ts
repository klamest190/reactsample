/**
 * Splits an SQL script into single statements - like psql does before it sends them.
 *
 * A `;` only ends a statement outside of strings ('…', E'…'), quoted names ("…"),
 * dollar quotes ($$…$$, $tag$…$tag$) and comments (-- …, /* … *\/).
 * A line that starts with a backslash is a psql meta command (\dt, \d customers) and
 * ends at the end of the line instead.
 *
 * Every statement keeps its position in the script, so an error position reported by
 * PostgreSQL can be turned back into a line in the editor.
 */

export type Statement = {
  /** The text sent to the database - from the end of the previous statement, comments included. */
  text: string
  /** Offset of `text` in the whole script. */
  start: number
  /** psql meta command without the backslash, e.g. "d customers". */
  meta?: string
}

export function splitStatements(script: string): Statement[] {
  const statements: Statement[] = []
  let start = 0
  let i = 0

  const push = (end: number) => {
    const text = script.slice(start, end)
    if (!isEmpty(text)) statements.push({ text, start })
    start = end
  }

  while (i < script.length) {
    const c = script[i]
    const next = script[i + 1]

    if (c === '-' && next === '-') {
      i = lineEnd(script, i)
    } else if (c === '/' && next === '*') {
      const end = script.indexOf('*/', i + 2)
      i = end < 0 ? script.length : end + 2
    } else if (c === "'") {
      // E'…' allows backslash escapes, a normal string only '' for a quote.
      const escaped = /[eE]/.test(script[i - 1] ?? '') && !/[\w$]/.test(script[i - 2] ?? '')
      i = stringEnd(script, i, "'", escaped)
    } else if (c === '"') {
      i = stringEnd(script, i, '"', false)
    } else if (c === '$') {
      const tag = script.slice(i).match(/^\$([A-Za-z_]\w*)?\$/)
      if (tag && !/[\w$]/.test(script[i - 1] ?? '')) {
        const end = script.indexOf(tag[0], i + tag[0].length)
        i = end < 0 ? script.length : end + tag[0].length
      } else {
        i++
      }
    } else if (c === ';') {
      i++
      push(i)
    } else if (c === '\\' && isEmpty(script.slice(start, i))) {
      // Meta command: the rest of the line (psql also allows a trailing ;).
      const end = lineEnd(script, i)
      const command = script.slice(i + 1, end).trim().replace(/;$/, '').trim()
      statements.push({ text: script.slice(i, end), start: i, meta: command })
      i = end
      start = end
    } else {
      i++
    }
  }
  push(script.length)
  return statements
}

/** Only whitespace and comments? */
export function isEmpty(text: string) {
  return stripComments(text).trim() === ''
}

/** The statement without leading comments and whitespace - for labels and for guessing its kind. */
export function stripComments(text: string) {
  let rest = text
  for (;;) {
    const trimmed = rest.trimStart()
    if (trimmed.startsWith('--')) rest = trimmed.slice(lineEnd(trimmed, 0))
    else if (trimmed.startsWith('/*')) {
      const end = trimmed.indexOf('*/')
      rest = end < 0 ? '' : trimmed.slice(end + 2)
    } else return trimmed
  }
}

function lineEnd(text: string, from: number) {
  const end = text.indexOf('\n', from)
  return end < 0 ? text.length : end
}

function stringEnd(text: string, from: number, quote: string, backslash: boolean) {
  let i = from + 1
  while (i < text.length) {
    if (backslash && text[i] === '\\') i += 2
    else if (text[i] === quote && text[i + 1] === quote) i += 2
    else if (text[i] === quote) return i + 1
    else i++
  }
  return text.length
}

/** 1-based line and 0-based column of an offset. */
export function lineAndColumn(text: string, offset: number) {
  const before = text.slice(0, offset)
  const line = before.split('\n').length
  return { line, column: offset - (before.lastIndexOf('\n') + 1) }
}
