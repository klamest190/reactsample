/**
 * Einen Code-Baustein in bestehenden Code einfügen - als reine Funktion, damit
 * der Editor (CodeEditor) und der Selbsttest genau dasselbe Ergebnis bekommen.
 *
 *  - Steht der Cursor mitten in einer Zeile mit Code, kommt der Baustein in eine neue Zeile darunter.
 *  - Steht er am Zeilenanfang, kommt der Baustein VOR diese Zeile.
 *  - Mehrzeilige Bausteine bekommen die Einrückung der Stelle, an der sie landen.
 *  - `$0` im Baustein markiert, wo danach der Cursor steht (sonst: am Ende).
 */

export type Insertion = {
  /** Bereich im alten Code, der ersetzt wird. */
  start: number
  end: number
  text: string
  /** Cursorposition im neuen Code. */
  cursor: number
}

export function computeInsertion(code: string, start: number, end: number, snippet: string): Insertion {
  const beforeCursor = code.slice(0, start)
  const lineStart = beforeCursor.lastIndexOf('\n') + 1
  const lineBefore = beforeCursor.slice(lineStart)
  const lineEnd = code.indexOf('\n', end) === -1 ? code.length : code.indexOf('\n', end)
  const lineAfter = code.slice(end, lineEnd)

  let indent: string
  let prefix = ''
  let suffix = ''
  if (lineBefore.trim()) {
    // Hinter Code mitten in der Zeile: neue Zeile mit derselben Einrückung beginnen.
    indent = lineBefore.match(/^\s*/)![0]
    prefix = '\n' + indent
    if (lineAfter.trim()) suffix = '\n' + indent
  } else if (lineAfter.trim()) {
    // Vor dem Code einer Zeile: Baustein davor, die Zeile rutscht mit ihrer Einrückung nach unten.
    const empty = lineAfter.match(/^\s*/)![0]
    indent = lineBefore + empty
    start = lineStart
    end += empty.length
    prefix = indent
    suffix = '\n' + indent
  } else {
    // Leere oder nur eingerückte Zeile: die vorhandene Einrückung gilt.
    indent = lineBefore
  }

  // Leerzeilen im Baustein nicht einrücken - sonst entstehen Zeilen nur aus Leerzeichen.
  const indented = snippet
    .split('\n')
    .map((line, i) => (i === 0 || !line.trim() ? line : indent + line))
    .join('\n')
  const marker = indented.indexOf('$0')
  const body = indented.replace('$0', '')
  const text = prefix + body + suffix

  return {
    start,
    end,
    text,
    cursor: start + prefix.length + (marker >= 0 ? marker : body.length),
  }
}

/** Wendet eine Einfügung auf einen String an. */
export function applyInsertion(code: string, e: Insertion): string {
  return code.slice(0, e.start) + e.text + code.slice(e.end)
}

/** Ein Teil eines Bausteins und wohin er soll - Positionen beziehen sich auf den Code VOR dem Einfügen. */
export type Step = { snippet: string; start: number; end: number; /** Hier steht danach der Cursor. */ main?: boolean }

/**
 * Mehrere Teile auf einmal einfügen, z. B. eine Komponente oben und `<Counter />` im JSX.
 * Eingefügt wird von hinten nach vorne: So bleiben die Positionen der vorderen Teile gültig.
 * Das Ergebnis lässt sich der Reihe nach anwenden (Editor: ein Undo-Schritt pro Teil).
 */
export function planInsertions(code: string, steps: Step[]) {
  const order = [...steps].sort((a, b) => b.start - a.start)
  const insertions: Insertion[] = []
  let current = code
  let cursor: number | null = null
  for (const s of order) {
    const e = computeInsertion(current, s.start, s.end, s.snippet)
    // Weiter vorne eingefügter Text verschiebt den gemerkten Cursor nach hinten.
    if (cursor !== null && e.start <= cursor) cursor += e.text.length - (e.end - e.start)
    if (s.main || cursor === null) cursor = e.cursor
    current = applyInsertion(current, e)
    insertions.push(e)
  }
  return { einfuegungen: insertions, code: current, cursor: cursor ?? 0 }
}
