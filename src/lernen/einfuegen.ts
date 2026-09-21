/**
 * Einen Code-Baustein in bestehenden Code einfügen - als reine Funktion, damit
 * der Editor (CodeEditor) und der Selbsttest genau dasselbe Ergebnis bekommen.
 *
 *  - Steht der Cursor mitten in einer Zeile mit Code, kommt der Baustein in eine neue Zeile darunter.
 *  - Steht er am Zeilenanfang, kommt der Baustein VOR diese Zeile.
 *  - Mehrzeilige Bausteine bekommen die Einrückung der Stelle, an der sie landen.
 *  - `$0` im Baustein markiert, wo danach der Cursor steht (sonst: am Ende).
 */

export type Einfuegung = {
  /** Bereich im alten Code, der ersetzt wird. */
  start: number
  ende: number
  text: string
  /** Cursorposition im neuen Code. */
  cursor: number
}

export function einfuegungBerechnen(code: string, start: number, ende: number, baustein: string): Einfuegung {
  const vorher = code.slice(0, start)
  const zeilenAnfang = vorher.lastIndexOf('\n') + 1
  const davor = vorher.slice(zeilenAnfang)
  const zeilenEnde = code.indexOf('\n', ende) === -1 ? code.length : code.indexOf('\n', ende)
  const danach = code.slice(ende, zeilenEnde)

  let einrueckung: string
  let praefix = ''
  let suffix = ''
  if (davor.trim()) {
    // Hinter Code mitten in der Zeile: neue Zeile mit derselben Einrückung beginnen.
    einrueckung = davor.match(/^\s*/)![0]
    praefix = '\n' + einrueckung
    if (danach.trim()) suffix = '\n' + einrueckung
  } else if (danach.trim()) {
    // Vor dem Code einer Zeile: Baustein davor, die Zeile rutscht mit ihrer Einrückung nach unten.
    const leer = danach.match(/^\s*/)![0]
    einrueckung = davor + leer
    start = zeilenAnfang
    ende += leer.length
    praefix = einrueckung
    suffix = '\n' + einrueckung
  } else {
    // Leere oder nur eingerückte Zeile: die vorhandene Einrückung gilt.
    einrueckung = davor
  }

  // Leerzeilen im Baustein nicht einrücken - sonst entstehen Zeilen nur aus Leerzeichen.
  const eingerueckt = baustein
    .split('\n')
    .map((zeile, i) => (i === 0 || !zeile.trim() ? zeile : einrueckung + zeile))
    .join('\n')
  const marke = eingerueckt.indexOf('$0')
  const rumpf = eingerueckt.replace('$0', '')
  const text = praefix + rumpf + suffix

  return {
    start,
    ende,
    text,
    cursor: start + praefix.length + (marke >= 0 ? marke : rumpf.length),
  }
}

/** Wendet eine Einfügung auf einen String an. */
export function einfuegungAnwenden(code: string, e: Einfuegung): string {
  return code.slice(0, e.start) + e.text + code.slice(e.ende)
}

/** Ein Teil eines Bausteins und wohin er soll - Positionen beziehen sich auf den Code VOR dem Einfügen. */
export type Schritt = { baustein: string; start: number; ende: number; /** Hier steht danach der Cursor. */ haupt?: boolean }

/**
 * Mehrere Teile auf einmal einfügen, z. B. eine Komponente oben und `<Counter />` im JSX.
 * Eingefügt wird von hinten nach vorne: So bleiben die Positionen der vorderen Teile gültig.
 * Das Ergebnis lässt sich der Reihe nach anwenden (Editor: ein Undo-Schritt pro Teil).
 */
export function einfuegungenPlanen(code: string, schritte: Schritt[]) {
  const reihenfolge = [...schritte].sort((a, b) => b.start - a.start)
  const einfuegungen: Einfuegung[] = []
  let aktuell = code
  let cursor: number | null = null
  for (const s of reihenfolge) {
    const e = einfuegungBerechnen(aktuell, s.start, s.ende, s.baustein)
    // Weiter vorne eingefügter Text verschiebt den gemerkten Cursor nach hinten.
    if (cursor !== null && e.start <= cursor) cursor += e.text.length - (e.ende - e.start)
    if (s.haupt || cursor === null) cursor = e.cursor
    aktuell = einfuegungAnwenden(aktuell, e)
    einfuegungen.push(e)
  }
  return { einfuegungen, code: aktuell, cursor: cursor ?? 0 }
}
