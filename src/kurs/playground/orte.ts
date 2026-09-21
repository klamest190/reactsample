import type { Schritt } from '../../lernen/einfuegen'
import type { Baustein, Ort } from './typen'

/**
 * Wo landet ein Baustein, wenn niemand den Cursor gesetzt hat?
 *
 * Gesucht wird mit einfachen Mustern im Text - kein echter Parser. Das reicht, weil
 * die Vorlagen der Playgrounds diesem Aufbau folgen. Findet sich die Stelle nicht
 * (z. B. weil App umbenannt wurde), kommt der Baustein ans Ende.
 *
 * Ergebnis: Position im Code und der Text, der dort eingefügt wird - ganze Blöcke
 * (Komponenten, Methoden, Klassen) bekommen eine Leerzeile Abstand.
 */
export function automatischeStelle(code: string, ort: Ort, baustein: string): { position: number; text: string } {
  const ende = () => ({ position: code.length, text: code.trim() ? '\n' + baustein : baustein })

  switch (ort) {
    case 'ende':
    case 'klasse':
      return ende()

    case 'oben': {
      const app = code.search(/^(export\s+default\s+)?function\s+App\b/m)
      return app >= 0 ? { position: app, text: baustein + '\n' } : ende()
    }

    case 'komponente': {
      const ret = returnVonApp(code)
      return ret ? { position: zeilenAnfang(code, ret.index), text: baustein } : ende()
    }

    case 'jsx': {
      // Das JSX von App endet mit einer Zeile, die nur aus `)` besteht. Die Zeile davor
      // ist das schließende Tag - der Baustein kommt als letztes Kind davor.
      const ret = returnVonApp(code)
      if (!ret) return ende()
      const rest = code.slice(ret.index)
      const klammer = rest.search(/^[ \t]*\)[ \t]*;?[ \t]*$/m)
      if (klammer < 0) return ende()
      const tagZeile = code.lastIndexOf('\n', ret.index + klammer - 2) + 1
      if (tagZeile <= ret.index) return ende()
      return { position: tagZeile - 1, text: baustein }
    }

    case 'main': {
      const main = code.search(/static\s+void\s+main\s*\(/)
      const auf = main >= 0 ? code.indexOf('{', main) : -1
      const zu = auf >= 0 ? passendeKlammer(code, auf) : -1
      if (zu < 0) return ende()
      // Ans Ende der letzten Zeile vor der schließenden Klammer - dann gilt deren Einrückung.
      return { position: Math.max(auf + 1, zeilenAnfang(code, zu) - 1), text: baustein }
    }

    case 'methode': {
      const main = code.search(/^[ \t]*(public\s+)?static\s+void\s+main\b/m)
      return main >= 0 ? { position: main, text: baustein + '\n' } : ende()
    }
  }
}

function zeilenAnfang(code: string, index: number) {
  return code.lastIndexOf('\n', index - 1) + 1
}

/**
 * Das `return (` von App: allein am Zeilenende - also nicht `return () => …` eines Effekts
 * und nicht das einer anderen Komponente weiter oben.
 */
function returnVonApp(code: string) {
  const app = code.search(/\bfunction\s+App\b/)
  if (app < 0) return null
  const treffer = /^[ \t]*return\s*\([ \t]*$/m.exec(code.slice(app))
  return treffer ? { index: app + treffer.index } : null
}

/** Schließende geschweifte Klammer zu `{` an Position `auf` - Strings und Kommentare zählen nicht. */
function passendeKlammer(code: string, auf: number) {
  let tiefe = 0
  for (let i = auf; i < code.length; i++) {
    const z = code[i]
    if (z === '"' || z === "'") {
      i++
      while (i < code.length && code[i] !== z && code[i] !== '\n') i += code[i] === '\\' ? 2 : 1
    } else if (z === '/' && code[i + 1] === '/') {
      i = code.indexOf('\n', i)
      if (i < 0) return -1
    } else if (z === '/' && code[i + 1] === '*') {
      i = code.indexOf('*/', i + 2) + 1
      if (i <= 0) return -1
    } else if (z === '{') {
      tiefe++
    } else if (z === '}' && --tiefe === 0) {
      return i
    }
  }
  return -1
}

/** Stand des Editors beim Klick auf einen Baustein. */
export type EditorStand = { code: string; start: number; ende: number; vonHand: boolean }

/**
 * Welche Teile eines Bausteins wohin kommen:
 *  - ohne `nutzung`: der Code an den Cursor (falls von Hand gesetzt) oder an seinen Ort
 *  - mit `nutzung`: der Code immer an seinen Ort (z. B. die Komponente über App),
 *    die Nutzung an den Cursor oder an ihren Ort (z. B. `<Counter />` ins JSX)
 *  - fehlende Imports nach ganz oben
 */
export function bausteinSchritte(b: Baustein, stand: EditorStand): Schritt[] {
  const { code } = stand
  const amCursor = (text: string): Schritt => ({ baustein: text, start: stand.start, ende: stand.ende, haupt: true })
  const automatisch = (ort: Ort, text: string, haupt: boolean): Schritt => {
    const stelle = automatischeStelle(code, ort, text)
    return { baustein: stelle.text, start: stelle.position, ende: stelle.position, haupt }
  }

  const schritte: Schritt[] = []
  if (b.nutzung) {
    schritte.push(automatisch(b.ort, b.code, true))
    schritte.push(stand.vonHand ? { ...amCursor(b.nutzung.code), haupt: false } : automatisch(b.nutzung.ort, b.nutzung.code, false))
  } else {
    schritte.push(stand.vonHand ? amCursor(b.code) : automatisch(b.ort, b.code, true))
  }

  const fehlend = (b.importe ?? []).filter((zeile) => !code.includes(zeile))
  if (fehlend.length) {
    const erster = code.search(/^import\s/m)
    schritte.push(
      erster >= 0
        ? { baustein: fehlend.join('\n'), start: erster, ende: erster }
        : { baustein: fehlend.join('\n') + '\n', start: 0, ende: 0 },
    )
  }
  return schritte
}
