/**
 * JAVA-TEIL · Schritt 2 von 4: aus Token wird ein Syntaxbaum
 *
 * Ein klassischer "recursive descent"-Parser: für jede Regel der Grammatik
 * eine Funktion, die sich gegenseitig aufrufen. `ausdruck()` ruft `ternaer()`,
 * das ruft `oder()`, … bis hinunter zu `primaer()` - dadurch entsteht ganz
 * automatisch die richtige Punkt-vor-Strich-Reihenfolge.
 *
 * An zwei Stellen muss der Parser raten und darf zurückspringen (`sichern()`):
 *   - Ist `List<String> a = …` eine Deklaration oder ein Vergleich mit `<`?
 *   - Ist `(String) x` eine Umwandlung (Cast) oder eine Klammer?
 * Echtes javac macht dasselbe.
 */

import { JavaSyntaxFehler, tokenisieren, type Token } from './lexer'
import type {
  Anweisung,
  Ausdruck,
  Block,
  Faenger,
  Literal,
  ParamDekl,
  Programm,
  Sichtbarkeit,
  SwitchFall,
  TypDeklaration,
  TypRef,
  VarDekl,
} from './ast'

const PRIMITIVE = new Set(['int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char', 'void', 'var'])

/** Modifikatoren, die vor Klassen, Feldern und Methoden stehen dürfen. */
const MODIFIKATOREN = new Set([
  'public', 'private', 'protected', 'static', 'final', 'abstract', 'default',
  'synchronized', 'native', 'transient', 'volatile', 'strictfp',
])

type Modifikatoren = { statisch: boolean; final: boolean; abstrakt: boolean; sichtbarkeit: Sichtbarkeit }

export function parsen(quelle: string): Programm {
  const tokens = tokenisieren(quelle)
  let pos = 0

  // --- Werkzeuge ------------------------------------------------------------
  const jetzt = () => tokens[pos]
  const naechstes = (n = 1) => tokens[Math.min(pos + n, tokens.length - 1)]
  const istEnde = () => jetzt().art === 'ende'
  const ist = (text: string, n = 0) => naechstes(n).text === text && naechstes(n).art !== 'text'
  const istName = (n = 0) => naechstes(n).art === 'name'

  function fehler(meldung: string, token: Token = jetzt()): never {
    throw new JavaSyntaxFehler(meldung, token.zeile)
  }
  /** Nimmt das Token, wenn es passt - sonst false. */
  function nimm(text: string) {
    if (ist(text)) {
      pos++
      return true
    }
    return false
  }
  function erwarte(text: string): Token {
    if (!ist(text)) fehler(`'${text}' expected, found '${jetzt().text}'`)
    return tokens[pos++]
  }
  function erwarteName(): string {
    if (jetzt().art !== 'name') fehler(`<identifier> expected, found '${jetzt().text}'`)
    return tokens[pos++].text
  }
  const sichern = () => pos
  const zurueck = (p: number) => {
    pos = p
  }

  /** `>>` und `>>>` schließen mehrere Generics auf einmal - hier aufspalten. */
  function schliesseSpitz() {
    const t = jetzt()
    if (t.text === '>') {
      pos++
      return true
    }
    if (t.text === '>>' || t.text === '>>>') {
      t.text = t.text.slice(1)
      return true
    }
    return false
  }

  // --- Typen ----------------------------------------------------------------

  function istTypAnfang(n = 0) {
    const t = naechstes(n)
    return t.art === 'name' || (t.art === 'schluessel' && PRIMITIVE.has(t.text))
  }

  /** Liest einen Typ. Gibt null zurück, wenn hier keiner steht (für Rateversuche). */
  function typLesen(): TypRef | null {
    if (!istTypAnfang()) return null
    let name = tokens[pos++].text
    // Punktnamen wie java.util.List: für uns zählt nur der letzte Teil.
    while (ist('.') && istName(1)) {
      pos++
      name = tokens[pos++].text
    }
    const argumente: TypRef[] = []
    if (ist('<')) {
      const p = sichern()
      pos++
      if (schliesseSpitz()) {
        // Diamond <> - kein Argument
      } else {
        let ok = true
        while (true) {
          if (nimm('?')) {
            if (nimm('extends') || nimm('super')) typLesen()
            argumente.push({ name: 'Object', dimensionen: 0, argumente: [] })
          } else {
            const arg = typLesen()
            if (!arg) {
              ok = false
              break
            }
            argumente.push(arg)
          }
          if (nimm(',')) continue
          if (schliesseSpitz()) break
          ok = false
          break
        }
        if (!ok) {
          zurueck(p) // war doch ein Vergleich, kein Generic
          return { name, dimensionen: 0, argumente: [] }
        }
      }
    }
    let dimensionen = 0
    while (ist('[') && ist(']', 1)) {
      pos += 2
      dimensionen++
    }
    return { name, dimensionen, argumente }
  }

  function typErwarten(): TypRef {
    const typ = typLesen()
    if (!typ) fehler(`<type> expected, found '${jetzt().text}'`)
    return typ
  }

  // --- Modifikatoren & Annotationen ----------------------------------------

  function modifikatorenLesen(): Modifikatoren {
    const m: Modifikatoren = { statisch: false, final: false, abstrakt: false, sichtbarkeit: 'paket' }
    while (true) {
      if (ist('@')) {
        pos++ // @Override, @FunctionalInterface … werden gelesen und ignoriert
        erwarteName()
        if (ist('(')) klammerUeberspringen()
        continue
      }
      const t = jetzt().text
      if (jetzt().art === 'schluessel' && MODIFIKATOREN.has(t)) {
        pos++
        if (t === 'static') m.statisch = true
        else if (t === 'final') m.final = true
        else if (t === 'abstract') m.abstrakt = true
        else if (t === 'public' || t === 'private' || t === 'protected') m.sichtbarkeit = t
        continue
      }
      return m
    }
  }

  function klammerUeberspringen() {
    let tiefe = 0
    do {
      if (ist('(')) tiefe++
      else if (ist(')')) tiefe--
      pos++
    } while (tiefe > 0 && !istEnde())
  }

  // --- Typdeklarationen -----------------------------------------------------

  function typDeklaration(mods: Modifikatoren): TypDeklaration {
    const zeile = jetzt().zeile
    const art = nimm('class') ? 'klasse' : nimm('interface') ? 'interface' : nimm('enum') ? 'enum' : 'record'
    if (art === 'record') erwarte('record')
    const name = erwarteName()

    // Generische Klassen: <T> lesen und vergessen (Java macht zur Laufzeit dasselbe).
    if (ist('<')) {
      pos++
      while (!schliesseSpitz() && !istEnde()) pos++
    }

    const deklaration: TypDeklaration = {
      art: art === 'record' ? 'klasse' : art,
      name,
      abstrakt: mods.abstrakt || art === 'interface',
      interfaces: [],
      felder: [],
      methoden: [],
      konstanten: [],
      zeile,
    }

    if (art === 'record') {
      deklaration.komponenten = parameterListe()
    }
    if (nimm('extends')) {
      const erster = typErwarten()
      if (art === 'interface') {
        deklaration.interfaces.push(erster.name)
        while (nimm(',')) deklaration.interfaces.push(typErwarten().name)
      } else {
        deklaration.oberklasse = erster.name
      }
    }
    if (nimm('implements')) {
      do {
        deklaration.interfaces.push(typErwarten().name)
      } while (nimm(','))
    }

    erwarte('{')

    if (art === 'enum') {
      while (istName() && !istEnde()) {
        const kName = erwarteName()
        const argumente = ist('(') ? argumentListe() : []
        deklaration.konstanten.push({ name: kName, argumente })
        if (!nimm(',')) break
      }
      nimm(';')
    }

    while (!ist('}') && !istEnde()) {
      if (nimm(';')) continue
      mitgliedLesen(deklaration)
    }
    erwarte('}')
    return deklaration
  }

  /** Ein Mitglied: Feld, Methode, Konstruktor oder eine verschachtelte Klasse. */
  function mitgliedLesen(klasse: TypDeklaration) {
    const mods = modifikatorenLesen()

    if (ist('class') || ist('interface') || ist('enum') || (ist('record') && istName(1))) {
      // Verschachtelte Typen behandeln wir wie eigene Klassen der Datei - sie
      // merken sich aber, wo sie standen, damit sie deren static-Felder sehen.
      const innen = typDeklaration(mods)
      innen.aeussere = klasse.name
      verschachtelte.push(innen)
      return
    }
    if (ist('{')) fehler('initializer blocks are not supported in this course runtime')

    const zeile = jetzt().zeile

    // Konstruktor: heißt wie die Klasse und hat sofort eine Klammer.
    if (jetzt().art === 'name' && jetzt().text === klasse.name && ist('(', 1)) {
      pos++
      const parameter = parameterListe()
      wurfListe()
      const rumpf = block()
      klasse.methoden.push({
        name: '<init>',
        rueckgabe: { name: 'void', dimensionen: 0, argumente: [] },
        parameter,
        rumpf,
        statisch: false,
        abstrakt: false,
        sichtbarkeit: mods.sichtbarkeit,
        konstruktor: true,
        zeile,
      })
      return
    }

    // Generische Methode: <T> vor dem Rückgabetyp.
    if (ist('<')) {
      pos++
      while (!schliesseSpitz() && !istEnde()) pos++
    }

    const typ = typErwarten()

    // Methode: Name direkt gefolgt von (
    if (istName() && ist('(', 1)) {
      const name = erwarteName()
      const parameter = parameterListe()
      while (ist('[') && ist(']', 1)) pos += 2
      wurfListe()
      const abstrakt = mods.abstrakt || (klasse.art === 'interface' && ist(';'))
      const rumpf = ist(';') ? (pos++, undefined) : block()
      klasse.methoden.push({
        name,
        rueckgabe: typ,
        parameter,
        rumpf,
        statisch: mods.statisch,
        abstrakt: abstrakt && !rumpf,
        sichtbarkeit: klasse.art === 'interface' ? 'public' : mods.sichtbarkeit,
        konstruktor: false,
        zeile,
      })
      return
    }

    // Sonst: ein oder mehrere Felder.
    do {
      const name = erwarteName()
      let dimensionen = 0
      while (ist('[') && ist(']', 1)) {
        pos += 2
        dimensionen++
      }
      const init = nimm('=') ? (ist('{') ? arrayWerte() : ausdruck()) : undefined
      klasse.felder.push({
        name,
        typ: { ...typ, dimensionen: typ.dimensionen + dimensionen },
        statisch: mods.statisch || klasse.art === 'interface',
        final: mods.final || klasse.art === 'interface',
        sichtbarkeit: mods.sichtbarkeit,
        init,
        zeile,
      })
    } while (nimm(','))
    erwarte(';')
  }

  function wurfListe() {
    if (nimm('throws')) {
      do {
        typErwarten()
      } while (nimm(','))
    }
  }

  function parameterListe(): ParamDekl[] {
    erwarte('(')
    const parameter: ParamDekl[] = []
    if (!ist(')')) {
      do {
        modifikatorenLesen() // final / @Annotation vor Parametern
        const typ = typErwarten()
        const varargs = nimm('...')
        const name = erwarteName()
        let dimensionen = 0
        while (ist('[') && ist(']', 1)) {
          pos += 2
          dimensionen++
        }
        parameter.push({
          name,
          typ: { ...typ, dimensionen: typ.dimensionen + dimensionen + (varargs ? 1 : 0) },
          varargs,
        })
      } while (nimm(','))
    }
    erwarte(')')
    return parameter
  }

  // --- Anweisungen ----------------------------------------------------------

  function block(): Block {
    const zeile = erwarte('{').zeile
    const anweisungen: Anweisung[] = []
    while (!ist('}') && !istEnde()) anweisungen.push(anweisung())
    erwarte('}')
    return { art: 'block', anweisungen, zeile }
  }

  function anweisung(): Anweisung {
    const zeile = jetzt().zeile

    if (ist('{')) return block()
    if (nimm(';')) return { art: 'leer', zeile }
    if (ist('if')) return ifAnweisung()
    if (ist('while')) return whileAnweisung()
    if (ist('do')) return doWhileAnweisung()
    if (ist('for')) return forAnweisung()
    if (ist('switch')) return switchAnweisung()
    if (ist('try')) return tryAnweisung()
    if (nimm('return')) {
      const wert = ist(';') ? undefined : ausdruck()
      erwarte(';')
      return { art: 'return', wert, zeile }
    }
    if (nimm('break')) {
      if (istName()) pos++ // Labels werden gelesen und ignoriert
      erwarte(';')
      return { art: 'break', zeile }
    }
    if (nimm('continue')) {
      if (istName()) pos++
      erwarte(';')
      return { art: 'continue', zeile }
    }
    if (nimm('throw')) {
      const wert = ausdruck()
      erwarte(';')
      return { art: 'throw', wert, zeile }
    }
    if (ist('class') || ist('interface') || ist('enum')) {
      verschachtelte.push(typDeklaration(modifikatorenLesen()))
      return { art: 'leer', zeile }
    }

    const lokale = lokaleDeklaration()
    if (lokale) return lokale

    const wert = ausdruck()
    erwarte(';')
    return { art: 'ausdruck', ausdruck: wert, zeile }
  }

  /**
   * Rateversuch: Steht hier eine lokale Variable? `int x = 1;`, `String[] a;`,
   * `var n = 2;`, `Map<String, Integer> m = …`. Passt es nicht, wird
   * zurückgesprungen und als Ausdruck gelesen.
   */
  function lokaleDeklaration(): Anweisung | null {
    const start = sichern()
    const zeile = jetzt().zeile
    let final = false
    while (ist('final') || ist('@')) {
      if (nimm('final')) final = true
      else {
        pos++
        erwarteName()
        if (ist('(')) klammerUeberspringen()
      }
    }
    const typ = typLesen()
    if (!typ || !istName()) {
      zurueck(start)
      return null
    }
    // Nach dem Namen muss = ; , oder [ kommen - sonst war es ein Ausdruck.
    const danach = naechstes(1).text
    if (!['=', ';', ',', '['].includes(danach)) {
      zurueck(start)
      return null
    }
    if (danach === '[' && naechstes(2).text !== ']') {
      zurueck(start)
      return null
    }

    const variablen: VarDekl[] = []
    do {
      const name = erwarteName()
      let dimensionen = 0
      while (ist('[') && ist(']', 1)) {
        pos += 2
        dimensionen++
      }
      const init = nimm('=') ? (ist('{') ? arrayWerte() : ausdruck()) : undefined
      variablen.push({ name, dimensionen, init })
    } while (nimm(','))
    erwarte(';')
    return { art: 'lokal', typ, final, variablen, zeile }
  }

  function ifAnweisung(): Anweisung {
    const zeile = erwarte('if').zeile
    erwarte('(')
    const bedingung = ausdruck()
    erwarte(')')
    const dann = anweisung()
    const sonst = nimm('else') ? anweisung() : undefined
    return { art: 'if', bedingung, dann, sonst, zeile }
  }

  function whileAnweisung(): Anweisung {
    const zeile = erwarte('while').zeile
    erwarte('(')
    const bedingung = ausdruck()
    erwarte(')')
    return { art: 'while', bedingung, rumpf: anweisung(), zeile }
  }

  function doWhileAnweisung(): Anweisung {
    const zeile = erwarte('do').zeile
    const rumpf = anweisung()
    erwarte('while')
    erwarte('(')
    const bedingung = ausdruck()
    erwarte(')')
    erwarte(';')
    return { art: 'doWhile', bedingung, rumpf, zeile }
  }

  function forAnweisung(): Anweisung {
    const zeile = erwarte('for').zeile
    erwarte('(')

    // for-each: for (Typ name : quelle)
    const start = sichern()
    modifikatorenLesen()
    const typ = typLesen()
    if (typ && istName() && ist(':', 1)) {
      const name = erwarteName()
      erwarte(':')
      const quelle = ausdruck()
      erwarte(')')
      return { art: 'forEach', typ, name, quelle, rumpf: anweisung(), zeile }
    }
    zurueck(start)

    const init: Anweisung[] = []
    if (!nimm(';')) {
      const lokale = lokaleDeklaration()
      if (lokale) init.push(lokale)
      else {
        do {
          init.push({ art: 'ausdruck', ausdruck: ausdruck(), zeile })
        } while (nimm(','))
        erwarte(';')
      }
    }
    const bedingung = ist(';') ? undefined : ausdruck()
    erwarte(';')
    const schritt: Ausdruck[] = []
    if (!ist(')')) {
      do {
        schritt.push(ausdruck())
      } while (nimm(','))
    }
    erwarte(')')
    return { art: 'for', init, bedingung, schritt, rumpf: anweisung(), zeile }
  }

  function switchAnweisung(): Anweisung {
    const zeile = erwarte('switch').zeile
    erwarte('(')
    const wert = ausdruck()
    erwarte(')')
    erwarte('{')
    const faelle: SwitchFall[] = []
    let pfeil = false

    while (!ist('}') && !istEnde()) {
      const werte: Ausdruck[] = []
      if (nimm('default')) {
        // default ohne Werte
      } else {
        erwarte('case')
        do {
          werte.push(fallWert())
        } while (nimm(','))
      }

      if (nimm('->')) {
        pfeil = true
        if (ist('{')) {
          faelle.push({ werte, anweisungen: [block()] })
        } else if (ist('throw')) {
          faelle.push({ werte, anweisungen: [anweisung()] })
        } else {
          const ergebnis = ausdruck()
          erwarte(';')
          faelle.push({ werte, anweisungen: [], ergebnis })
        }
        continue
      }

      erwarte(':')
      // Gestapelte Labels: case 1: case 2: …
      while (ist('case') || (ist('default') && ist(':', 1))) {
        if (nimm('default')) {
          erwarte(':')
          faelle.push({ werte: [...werte], anweisungen: [] })
          werte.length = 0
        } else {
          erwarte('case')
          do {
            werte.push(fallWert())
          } while (nimm(','))
          erwarte(':')
        }
      }
      const anweisungen: Anweisung[] = []
      while (!ist('case') && !ist('default') && !ist('}') && !istEnde()) anweisungen.push(anweisung())
      faelle.push({ werte, anweisungen })
    }
    erwarte('}')
    return { art: 'switch', wert, faelle, pfeil, zeile }
  }

  /**
   * Ein case-Label. Sonderfall: `case ROT ->` ist ein enum-Name mit Pfeil und
   * KEIN Lambda - deshalb hier nicht der normale Ausdrucks-Parser.
   */
  function fallWert(): Ausdruck {
    if (istName() && ['->', ',', ':'].includes(naechstes(1).text)) {
      const t = tokens[pos++]
      return { art: 'name', name: t.text, zeile: t.zeile }
    }
    return ternaer()
  }

  function tryAnweisung(): Anweisung {
    const zeile = erwarte('try').zeile
    if (ist('(')) fehler('try-with-resources is not supported in this course runtime')
    const rumpf = block()
    const faenger: Faenger[] = []
    while (nimm('catch')) {
      erwarte('(')
      modifikatorenLesen()
      const typen = [typErwarten().name]
      while (nimm('|')) typen.push(typErwarten().name)
      const name = erwarteName()
      erwarte(')')
      faenger.push({ typen, name, rumpf: block() })
    }
    const schliesslich = nimm('finally') ? block() : undefined
    if (!faenger.length && !schliesslich) fehler("'catch' or 'finally' expected")
    return { art: 'try', rumpf, faenger, schliesslich, zeile }
  }

  // --- Ausdrücke ------------------------------------------------------------

  function ausdruck(): Ausdruck {
    const links = ternaer()
    const op = jetzt().text
    if (jetzt().art === 'symbol' && ['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>='].includes(op)) {
      const zeile = tokens[pos++].zeile
      const wert = ausdruck() // rechtsassoziativ: a = b = c
      return { art: 'zuweisung', ziel: links, operator: op, wert, zeile }
    }
    return links
  }

  function ternaer(): Ausdruck {
    const bedingung = binaer(0)
    if (ist('?')) {
      const zeile = tokens[pos++].zeile
      const dann = ausdruck()
      erwarte(':')
      const sonst = ternaer()
      return { art: 'ternaer', bedingung, dann, sonst, zeile }
    }
    return bedingung
  }

  /** Alle zweistelligen Operatoren mit einer Tabelle statt einer Funktion je Stufe. */
  const STUFEN: string[][] = [
    ['||'],
    ['&&'],
    ['|'],
    ['^'],
    ['&'],
    ['==', '!='],
    ['<', '>', '<=', '>=', 'instanceof'],
    ['<<', '>>', '>>>'],
    ['+', '-'],
    ['*', '/', '%'],
  ]

  function binaer(stufe: number): Ausdruck {
    if (stufe >= STUFEN.length) return unaer()
    let links = binaer(stufe + 1)
    while (true) {
      const t = jetzt()
      if (!STUFEN[stufe].includes(t.text) || (t.art !== 'symbol' && t.text !== 'instanceof')) break
      // `>` `>` nebeneinander sind hier nie Generics - die hat typLesen() schon geschluckt.
      pos++
      if (t.text === 'instanceof') {
        nimm('final')
        const typ = typErwarten()
        const bindung = istName() ? erwarteName() : undefined
        links = { art: 'instanceof', ausdruck: links, typ: typ.name + '[]'.repeat(typ.dimensionen), bindung, zeile: t.zeile }
        continue
      }
      const rechts = binaer(stufe + 1)
      links = { art: 'binaer', operator: t.text, links, rechts, zeile: t.zeile }
    }
    return links
  }

  function unaer(): Ausdruck {
    const t = jetzt()
    if (t.art === 'symbol' && ['!', '~', '-', '+'].includes(t.text)) {
      pos++
      return { art: 'unaer', operator: t.text, ausdruck: unaer(), zeile: t.zeile }
    }
    if (t.text === '++' || t.text === '--') {
      pos++
      return { art: 'stufe', operator: t.text as '++' | '--', ziel: unaer(), vorher: true, zeile: t.zeile }
    }
    // Cast? (int) x   (String) o   (List<String>) o
    if (ist('(')) {
      const start = sichern()
      pos++
      const typ = typLesen()
      if (typ && ist(')')) {
        pos++
        const folgt = jetzt()
        const kannFolgen =
          folgt.art === 'name' ||
          folgt.art === 'zahl' ||
          folgt.art === 'text' ||
          folgt.art === 'zeichen' ||
          ['new', 'this', 'super', 'true', 'false', 'null'].includes(folgt.text) ||
          folgt.text === '(' ||
          folgt.text === '!'
        const primitiv = PRIMITIVE.has(typ.name) && typ.dimensionen === 0
        if (kannFolgen && (primitiv || typ.dimensionen > 0 || /^[A-Z]/.test(typ.name))) {
          return { art: 'cast', typ, ausdruck: unaer(), zeile: t.zeile }
        }
      }
      zurueck(start)
    }
    return nachgestellt(primaer())
  }

  /** Alles, was hinter einem Wert stehen kann: .feld, .methode(), [i], ++, -- */
  function nachgestellt(wert: Ausdruck): Ausdruck {
    while (true) {
      const t = jetzt()
      if (ist('.')) {
        pos++
        if (ist('<')) {
          // explizite Typargumente beim Aufruf: list.<String>toArray()
          pos++
          while (!schliesseSpitz() && !istEnde()) pos++
        }
        const name = ist('new') ? fehler('inner class creation is not supported') : erwarteName()
        if (ist('(')) {
          wert = { art: 'aufruf', ziel: wert, name, argumente: argumentListe(), ueberSuper: wert.art === 'super', zeile: t.zeile }
        } else {
          wert = { art: 'feld', ziel: wert, name, zeile: t.zeile }
        }
        continue
      }
      if (ist('::')) {
        pos++
        const name = ist('new') ? (pos++, '<init>') : erwarteName()
        const ziel = wert.art === 'name' ? wert.name : wert.art === 'feld' ? wert.name : ''
        wert = { art: 'methodenRef', ziel, name, zeile: t.zeile }
        continue
      }
      if (ist('[')) {
        pos++
        const index = ausdruck()
        erwarte(']')
        wert = { art: 'index', ziel: wert, index, zeile: t.zeile }
        continue
      }
      if (ist('++') || ist('--')) {
        pos++
        wert = { art: 'stufe', operator: t.text as '++' | '--', ziel: wert, vorher: false, zeile: t.zeile }
        continue
      }
      return wert
    }
  }

  function argumentListe(): Ausdruck[] {
    erwarte('(')
    const argumente: Ausdruck[] = []
    if (!ist(')')) {
      do {
        argumente.push(ausdruck())
      } while (nimm(','))
    }
    erwarte(')')
    return argumente
  }

  function arrayWerte(): Ausdruck {
    const zeile = erwarte('{').zeile
    const werte: Ausdruck[] = []
    if (!ist('}')) {
      do {
        if (ist('}')) break // erlaubtes Komma am Ende
        werte.push(ist('{') ? arrayWerte() : ausdruck())
      } while (nimm(','))
    }
    erwarte('}')
    return { art: 'arrayWerte', werte, zeile }
  }

  function literalLesen(): Literal | null {
    const t = jetzt()
    if (t.art === 'zahl') {
      pos++
      return t.kommazahl ? { typ: 'double', wert: t.wert! } : { typ: 'int', wert: t.wert! }
    }
    if (t.art === 'text') {
      pos++
      return { typ: 'String', wert: t.text }
    }
    if (t.art === 'zeichen') {
      pos++
      return { typ: 'char', wert: t.wert! }
    }
    if (t.text === 'true' || t.text === 'false') {
      pos++
      return { typ: 'boolean', wert: t.text === 'true' }
    }
    if (t.text === 'null') {
      pos++
      return { typ: 'null' }
    }
    return null
  }

  function primaer(): Ausdruck {
    const t = jetzt()
    const zeile = t.zeile

    const wert = literalLesen()
    if (wert) return { art: 'literal', wert, zeile }

    if (nimm('this')) {
      if (ist('(')) return { art: 'aufruf', name: '<init>', argumente: argumentListe(), ueberSuper: false, zeile }
      return { art: 'this', zeile }
    }
    if (nimm('super')) {
      if (ist('(')) return { art: 'aufruf', name: '<superinit>', argumente: argumentListe(), ueberSuper: true, zeile }
      return { art: 'super', zeile }
    }
    if (nimm('new')) return neuLesen(zeile)
    // switch als Ausdruck: int x = switch (tag) { case 1 -> 10; default -> 0; };
    if (ist('switch')) return { art: 'switchAusdruck', anweisung: switchAnweisung(), zeile }

    // Lambda mit einem Parameter ohne Klammern: x -> x * 2
    if (istName() && ist('->', 1)) {
      const p = erwarteName()
      erwarte('->')
      return { art: 'lambda', parameter: [p], rumpf: ist('{') ? block() : ausdruck(), zeile }
    }

    if (ist('(')) {
      // Lambda mit Klammern: () -> …, (a, b) -> …, (int a) -> …
      const start = sichern()
      pos++
      const parameter: string[] = []
      let istLambda = true
      if (!ist(')')) {
        do {
          modifikatorenLesen()
          const p = sichern()
          const typ = typLesen()
          if (typ && istName()) {
            parameter.push(erwarteName())
          } else {
            zurueck(p)
            if (istName()) parameter.push(erwarteName())
            else {
              istLambda = false
              break
            }
          }
        } while (nimm(','))
      }
      if (istLambda && ist(')') && ist('->', 1)) {
        pos += 2
        return { art: 'lambda', parameter, rumpf: ist('{') ? block() : ausdruck(), zeile }
      }
      zurueck(start)
      pos++
      const innen = ausdruck()
      erwarte(')')
      return innen
    }

    if (istName()) {
      let name = erwarteName()
      // Voll qualifizierter Name: java.util.Arrays.sort(…) → Arrays.sort(…)
      if ((name === 'java' || name === 'javax') && ist('.')) {
        while (ist('.') && istName(1) && /^[a-z]/.test(naechstes(1).text)) {
          pos += 2
        }
        if (ist('.') && istName(1)) {
          pos++
          name = erwarteName()
        }
      }
      if (ist('(')) {
        return { art: 'aufruf', name, argumente: argumentListe(), ueberSuper: false, zeile }
      }
      return { art: 'name', name, zeile }
    }

    // `int.class` o. Ä. kommt im Kurs nicht vor - alles andere ist ein Fehler.
    fehler(`illegal start of expression: '${t.text}'`)
  }

  function neuLesen(zeile: number): Ausdruck {
    const typ = typErwarten()
    // `new int[]{1, 2, 3}`: die leeren Klammern hat typLesen() schon geschluckt.
    if (typ.dimensionen > 0 && ist('{')) {
      const werte = arrayWerte() as { werte: Ausdruck[] }
      return { art: 'neuArray', typ, groessen: [], werte: werte.werte, zeile }
    }
    if (ist('[')) {
      const groessen: Ausdruck[] = []
      let dimensionen = 0
      while (ist('[')) {
        pos++
        if (ist(']')) {
          pos++
          dimensionen++
          continue
        }
        groessen.push(ausdruck())
        erwarte(']')
        dimensionen++
      }
      const basis: TypRef = { ...typ, dimensionen }
      if (ist('{')) {
        const werte = arrayWerte() as { werte: Ausdruck[] }
        return { art: 'neuArray', typ: basis, groessen: [], werte: werte.werte, zeile }
      }
      return { art: 'neuArray', typ: basis, groessen, zeile }
    }
    const argumente = argumentListe()
    if (ist('{')) fehler('anonymous classes are not supported in this course runtime')
    return { art: 'neu', klasse: typ.name, argumente, zeile }
  }

  // --- Los geht's -----------------------------------------------------------

  const verschachtelte: TypDeklaration[] = []
  const typen: TypDeklaration[] = []
  const importe: string[] = []

  while (!istEnde()) {
    if (nimm('package')) {
      while (!ist(';') && !istEnde()) pos++
      erwarte(';')
      continue
    }
    if (nimm('import')) {
      nimm('static')
      let pfad = ''
      while (!ist(';') && !istEnde()) pfad += tokens[pos++].text
      erwarte(';')
      importe.push(pfad)
      continue
    }
    if (nimm(';')) continue
    const mods = modifikatorenLesen()
    if (ist('class') || ist('interface') || ist('enum') || ist('record')) {
      typen.push(typDeklaration(mods))
      continue
    }
    fehler(`class, interface or enum expected, found '${jetzt().text}'`)
  }

  if (!typen.length) throw new JavaSyntaxFehler('no class found - Java code always lives inside a class', 1)

  return { typen: [...typen, ...verschachtelte], importe }
}
