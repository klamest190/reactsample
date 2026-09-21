/**
 * JAVA-TEIL · Schritt 3 von 4: prüfen, BEVOR etwas läuft
 *
 * Das ist der größte Unterschied zu JavaScript: In Java findet der Compiler
 * einen ganzen Stapel Fehler, ohne das Programm je zu starten. Diese Datei
 * macht davon das Wichtigste nach:
 *
 *   int zahl = "drei";     → incompatible types: String cannot be converted to int
 *   System.out.println(x); → cannot find symbol: variable x
 *   int verdoppeln(int n) {} → missing return statement
 *
 * Grundregel hier: **Im Zweifel nichts melden.** Ein falscher Fehler wäre für
 * Lernende schlimmer als ein übersehener - den fängt sonst die Laufzeit.
 */

import type { Anweisung, Ausdruck, MethodenDekl, Programm, TypDeklaration, TypRef } from './ast'
import { EINGEBAUTE_KLASSEN, istAusnahmeKlasse } from './bibliothek'

export type Pruefmeldung = { zeile: number; deutsch: string; englisch: string }

/** Typen, bei denen wir uns sicher genug sind, um zu meckern. */
type Typ = string | null

const PRIMITIVE = new Set(['int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char'])
const GANZE = new Set(['int', 'long', 'short', 'byte', 'char'])

/** Klassen, die es ohne Deklaration gibt (Standardbibliothek). */
const BEKANNTE_KLASSEN = new Set([
  ...EINGEBAUTE_KLASSEN,
  'ArrayList', 'LinkedList', 'HashMap', 'LinkedHashMap', 'TreeMap', 'HashSet', 'LinkedHashSet', 'TreeSet',
  'StringBuilder', 'StringBuffer', 'Random', 'Object', 'Number', 'CharSequence', 'Comparable', 'Iterable',
  'Collection', 'Entry', 'Scanner', 'Thread', 'Runnable', 'Function', 'BiFunction', 'Supplier', 'Consumer',
  'Predicate', 'UnaryOperator', 'BinaryOperator', 'Iterator', 'Void', 'Class',
])

export function pruefen(programm: Programm): Pruefmeldung[] {
  const meldungen: Pruefmeldung[] = []
  const klassen = new Map(programm.typen.map((t) => [t.name, t]))

  const melde = (zeile: number, deutsch: string, englisch: string) => {
    if (meldungen.length < 10 && !meldungen.some((m) => m.zeile === zeile)) meldungen.push({ zeile, deutsch, englisch })
  }

  const istKlasse = (name: string) => klassen.has(name) || BEKANNTE_KLASSEN.has(name) || istAusnahmeKlasse(name)

  /** Alle Felder einer Klasse: eigene, geerbte und die der umgebenden Klasse. */
  function felderVon(klasse: TypDeklaration): Map<string, TypRef> {
    const felder = new Map<string, TypRef>()
    const gesehen = new Set<string>()
    const sammeln = (start: TypDeklaration | undefined) => {
      let aktuell = start
      while (aktuell && !gesehen.has(aktuell.name)) {
        gesehen.add(aktuell.name)
        for (const feld of aktuell.felder) if (!felder.has(feld.name)) felder.set(feld.name, feld.typ)
        for (const komponente of aktuell.komponenten ?? []) if (!felder.has(komponente.name)) felder.set(komponente.name, komponente.typ)
        for (const konstante of aktuell.konstanten) {
          if (!felder.has(konstante.name)) felder.set(konstante.name, { name: aktuell.name, dimensionen: 0, argumente: [] })
        }
        if (aktuell.aeussere) sammeln(klassen.get(aktuell.aeussere))
        aktuell = aktuell.oberklasse ? klassen.get(aktuell.oberklasse) : undefined
      }
    }
    sammeln(klasse)
    return felder
  }

  // --- Typen vergleichen ---------------------------------------------------

  const typText = (typ: TypRef) => typ.name + '[]'.repeat(typ.dimensionen)

  /** Passt ein Wert vom Typ `von` in eine Variable vom Typ `zu`? */
  function passt(von: Typ, zu: Typ, literal: boolean): boolean {
    if (!von || !zu || von === zu) return true
    if (zu === 'var' || zu === 'Object' || von === 'unbekannt' || zu === 'unbekannt') return true
    if (von === 'null') return !PRIMITIVE.has(zu)
    if (zu === 'String') return false
    if (von === 'String') return zu === 'CharSequence' || zu === 'Comparable'
    if (von === 'boolean') return zu === 'Boolean'
    if (zu === 'boolean') return von === 'Boolean'
    if (GANZE.has(von) && (zu === 'double' || zu === 'float')) return true
    if (GANZE.has(von) && GANZE.has(zu)) {
      // char c = 65; geht, char c = intVariable; nicht.
      if (zu === 'char' && von !== 'char') return literal
      if ((zu === 'short' || zu === 'byte') && von === 'int') return literal
      return true
    }
    if ((von === 'double' || von === 'float') && zu !== 'double' && zu !== 'float' && zu !== 'Double') return false
    if (von === 'int' && zu === 'Integer') return true
    if (von === 'double' && zu === 'Double') return true
    if (von === 'char' && zu === 'Character') return true
    if (PRIMITIVE.has(von) !== PRIMITIVE.has(zu)) return false
    return true
  }

  // --- Ein Sichtbarkeitsbereich --------------------------------------------

  type Rahmen = {
    variablen: Map<string, Typ>
    felder: Map<string, TypRef>
    klasse: TypDeklaration
    statisch: boolean
  }

  function typVon(ausdruck: Ausdruck, rahmen: Rahmen): Typ {
    switch (ausdruck.art) {
      case 'literal':
        return ausdruck.wert.typ
      case 'name': {
        if (rahmen.variablen.has(ausdruck.name)) return rahmen.variablen.get(ausdruck.name)!
        const feld = rahmen.felder.get(ausdruck.name)
        return feld ? typText(feld) : null
      }
      case 'this':
        return rahmen.klasse.name
      case 'neu':
        return ausdruck.klasse
      case 'neuArray':
        return typText(ausdruck.typ)
      case 'cast':
        return typText(ausdruck.typ)
      case 'instanceof':
        return 'boolean'
      case 'ternaer': {
        const dann = typVon(ausdruck.dann, rahmen)
        return dann === typVon(ausdruck.sonst, rahmen) ? dann : null
      }
      case 'unaer':
        if (ausdruck.operator === '!') return 'boolean'
        return typVon(ausdruck.ausdruck, rahmen)
      case 'binaer': {
        const op = ausdruck.operator
        if (['==', '!=', '<', '>', '<=', '>=', '&&', '||'].includes(op)) return 'boolean'
        const links = typVon(ausdruck.links, rahmen)
        const rechts = typVon(ausdruck.rechts, rahmen)
        if (op === '+' && (links === 'String' || rechts === 'String')) return 'String'
        if (!links || !rechts) return null
        if (links === 'boolean' && rechts === 'boolean') return 'boolean'
        if (links === 'double' || rechts === 'double' || links === 'float' || rechts === 'float') return 'double'
        if (GANZE.has(links) && GANZE.has(rechts)) return 'int'
        return null
      }
      case 'index': {
        const ziel = typVon(ausdruck.ziel, rahmen)
        return ziel?.endsWith('[]') ? ziel.slice(0, -2) : null
      }
      case 'aufruf': {
        // Nur eigene Methoden der eigenen Klasse sind sicher bestimmbar.
        if (!ausdruck.ziel) {
          const methode = rahmen.klasse.methoden.find((m) => m.name === ausdruck.name)
          return methode ? typText(methode.rueckgabe) : null
        }
        if (ausdruck.ziel.art === 'name') {
          const klasse = klassen.get(ausdruck.ziel.name)
          const methode = klasse?.methoden.find((m) => m.name === ausdruck.name && m.statisch)
          if (methode) return typText(methode.rueckgabe)
        }
        return null
      }
      case 'feld':
        if (ausdruck.name === 'length' && typVon(ausdruck.ziel, rahmen)?.endsWith('[]')) return 'int'
        return null
      default:
        return null
    }
  }

  /** Läuft durch einen Ausdruck und meldet unbekannte Namen. */
  function ausdruckPruefen(ausdruck: Ausdruck, rahmen: Rahmen) {
    switch (ausdruck.art) {
      case 'name':
        if (!rahmen.variablen.has(ausdruck.name) && !rahmen.felder.has(ausdruck.name) && !istKlasse(ausdruck.name)) {
          melde(
            ausdruck.zeile,
            `Die Variable \`${ausdruck.name}\` ist hier nicht bekannt. Wurde sie deklariert (z. B. \`int ${ausdruck.name} = …;\`) - und steht sie im selben Block?`,
            `cannot find symbol: variable ${ausdruck.name}`,
          )
        }
        return
      case 'binaer':
        ausdruckPruefen(ausdruck.links, rahmen)
        ausdruckPruefen(ausdruck.rechts, rahmen)
        return
      case 'unaer':
        ausdruckPruefen(ausdruck.ausdruck, rahmen)
        return
      case 'stufe':
        ausdruckPruefen(ausdruck.ziel, rahmen)
        return
      case 'ternaer':
        ausdruckPruefen(ausdruck.bedingung, rahmen)
        ausdruckPruefen(ausdruck.dann, rahmen)
        ausdruckPruefen(ausdruck.sonst, rahmen)
        return
      case 'zuweisung': {
        ausdruckPruefen(ausdruck.wert, rahmen)
        ausdruckPruefen(ausdruck.ziel, rahmen)
        if (ausdruck.operator === '=') {
          const ziel = typVon(ausdruck.ziel, rahmen)
          const wert = typVon(ausdruck.wert, rahmen)
          if (ziel && wert && !passt(wert, ziel, ausdruck.wert.art === 'literal')) {
            melde(
              ausdruck.zeile,
              `${wert} passt nicht in eine Variable vom Typ ${ziel}.`,
              `incompatible types: ${wert} cannot be converted to ${ziel}`,
            )
          }
        }
        return
      }
      case 'aufruf':
        if (ausdruck.ziel) ausdruckPruefen(ausdruck.ziel, rahmen)
        for (const a of ausdruck.argumente) ausdruckPruefen(a, rahmen)
        return
      case 'feld':
        if (ausdruck.ziel.art !== 'name' || !istKlasse(ausdruck.ziel.name)) ausdruckPruefen(ausdruck.ziel, rahmen)
        return
      case 'index':
        ausdruckPruefen(ausdruck.ziel, rahmen)
        ausdruckPruefen(ausdruck.index, rahmen)
        return
      case 'neu':
        if (!istKlasse(ausdruck.klasse)) {
          melde(ausdruck.zeile, `Die Klasse \`${ausdruck.klasse}\` gibt es nicht.`, `cannot find symbol: class ${ausdruck.klasse}`)
        }
        for (const a of ausdruck.argumente) ausdruckPruefen(a, rahmen)
        return
      case 'neuArray':
        for (const g of ausdruck.groessen) ausdruckPruefen(g, rahmen)
        for (const w of ausdruck.werte ?? []) ausdruckPruefen(w, rahmen)
        return
      case 'arrayWerte':
        for (const w of ausdruck.werte) ausdruckPruefen(w, rahmen)
        return
      case 'cast':
        ausdruckPruefen(ausdruck.ausdruck, rahmen)
        return
      case 'instanceof':
        ausdruckPruefen(ausdruck.ausdruck, rahmen)
        // `o instanceof Cat cat` legt cat gleich mit an (Java 16+).
        if (ausdruck.bindung) rahmen.variablen.set(ausdruck.bindung, ausdruck.typ)
        return
      case 'lambda': {
        // Lambda-Parameter gelten im Rumpf - Typen kennen wir nicht.
        const innen: Rahmen = { ...rahmen, variablen: new Map(rahmen.variablen) }
        for (const p of ausdruck.parameter) innen.variablen.set(p, null)
        if ('art' in ausdruck.rumpf && ausdruck.rumpf.art === 'block') anweisungPruefen(ausdruck.rumpf, innen)
        else ausdruckPruefen(ausdruck.rumpf as Ausdruck, innen)
        return
      }
      default:
        return
    }
  }

  function anweisungPruefen(anweisung: Anweisung, rahmen: Rahmen) {
    switch (anweisung.art) {
      case 'block': {
        const innen: Rahmen = { ...rahmen, variablen: new Map(rahmen.variablen) }
        for (const a of anweisung.anweisungen) anweisungPruefen(a, innen)
        return
      }
      case 'lokal':
        for (const v of anweisung.variablen) {
          if (v.init) {
            ausdruckPruefen(v.init, rahmen)
            const zielTyp = typText({ ...anweisung.typ, dimensionen: anweisung.typ.dimensionen + v.dimensionen })
            const wertTyp = v.init.art === 'arrayWerte' ? null : typVon(v.init, rahmen)
            if (wertTyp && !passt(wertTyp, zielTyp, v.init.art === 'literal')) {
              melde(
                anweisung.zeile,
                `${wertTyp} passt nicht in eine Variable vom Typ ${zielTyp}. In Java muss der Typ genau stimmen - anders als in JavaScript.`,
                `incompatible types: ${wertTyp} cannot be converted to ${zielTyp}`,
              )
            }
          }
          if (anweisung.typ.name !== 'var' && !PRIMITIVE.has(anweisung.typ.name) && !istKlasse(anweisung.typ.name)) {
            melde(anweisung.zeile, `Den Typ \`${anweisung.typ.name}\` gibt es nicht.`, `cannot find symbol: class ${anweisung.typ.name}`)
          }
          rahmen.variablen.set(v.name, typText({ ...anweisung.typ, dimensionen: anweisung.typ.dimensionen + v.dimensionen }))
        }
        return
      case 'ausdruck':
        ausdruckPruefen(anweisung.ausdruck, rahmen)
        return
      case 'if':
        ausdruckPruefen(anweisung.bedingung, rahmen)
        bedingungPruefen(anweisung.bedingung, rahmen)
        anweisungPruefen(anweisung.dann, rahmen)
        if (anweisung.sonst) anweisungPruefen(anweisung.sonst, rahmen)
        return
      case 'while':
      case 'doWhile':
        ausdruckPruefen(anweisung.bedingung, rahmen)
        bedingungPruefen(anweisung.bedingung, rahmen)
        anweisungPruefen(anweisung.rumpf, rahmen)
        return
      case 'for': {
        const innen: Rahmen = { ...rahmen, variablen: new Map(rahmen.variablen) }
        for (const a of anweisung.init) anweisungPruefen(a, innen)
        if (anweisung.bedingung) {
          ausdruckPruefen(anweisung.bedingung, innen)
          bedingungPruefen(anweisung.bedingung, innen)
        }
        for (const s of anweisung.schritt) ausdruckPruefen(s, innen)
        anweisungPruefen(anweisung.rumpf, innen)
        return
      }
      case 'forEach': {
        ausdruckPruefen(anweisung.quelle, rahmen)
        const innen: Rahmen = { ...rahmen, variablen: new Map(rahmen.variablen) }
        innen.variablen.set(anweisung.name, anweisung.typ.name === 'var' ? null : typText(anweisung.typ))
        anweisungPruefen(anweisung.rumpf, innen)
        return
      }
      case 'switch': {
        ausdruckPruefen(anweisung.wert, rahmen)
        const innen: Rahmen = { ...rahmen, variablen: new Map(rahmen.variablen) }
        for (const fall of anweisung.faelle) {
          for (const a of fall.anweisungen) anweisungPruefen(a, innen)
          if (fall.ergebnis) ausdruckPruefen(fall.ergebnis, innen)
        }
        return
      }
      case 'return':
        if (anweisung.wert) ausdruckPruefen(anweisung.wert, rahmen)
        return
      case 'throw':
        ausdruckPruefen(anweisung.wert, rahmen)
        return
      case 'try': {
        anweisungPruefen(anweisung.rumpf, rahmen)
        for (const faenger of anweisung.faenger) {
          const innen: Rahmen = { ...rahmen, variablen: new Map(rahmen.variablen) }
          innen.variablen.set(faenger.name, faenger.typen[0])
          anweisungPruefen(faenger.rumpf, innen)
        }
        if (anweisung.schliesslich) anweisungPruefen(anweisung.schliesslich, rahmen)
        return
      }
      default:
        return
    }
  }

  /** Der Klassiker aus JavaScript: `if (zahl)` statt `if (zahl > 0)`. */
  function bedingungPruefen(ausdruck: Ausdruck, rahmen: Rahmen) {
    const typ = typVon(ausdruck, rahmen)
    if (typ && typ !== 'boolean' && typ !== 'Boolean' && typ !== 'unbekannt') {
      melde(
        ausdruck.zeile,
        `Eine Bedingung muss in Java ein \`boolean\` sein, nicht ${typ}. In JavaScript wäre das „truthy“ - in Java ein Fehler.`,
        `incompatible types: ${typ} cannot be converted to boolean`,
      )
    }
  }

  /** Enthält der Rumpf überhaupt irgendwo ein return mit Wert? */
  function hatReturn(anweisungen: Anweisung[]): boolean {
    return anweisungen.some((a) => {
      switch (a.art) {
        case 'return':
          return Boolean(a.wert)
        case 'throw':
          return true
        case 'block':
          return hatReturn(a.anweisungen)
        case 'if':
          return hatReturn([a.dann]) || (a.sonst ? hatReturn([a.sonst]) : false)
        case 'while':
        case 'doWhile':
        case 'forEach':
          return hatReturn([a.rumpf])
        case 'for':
          return hatReturn([a.rumpf])
        case 'switch':
          return a.faelle.some((f) => hatReturn(f.anweisungen) || Boolean(f.ergebnis))
        case 'try':
          return hatReturn(a.rumpf.anweisungen) || a.faenger.some((f) => hatReturn(f.rumpf.anweisungen))
        default:
          return false
      }
    })
  }

  // --- Jede Methode jeder Klasse prüfen ------------------------------------

  for (const klasse of programm.typen) {
    const felder = felderVon(klasse)
    for (const methode of klasse.methoden) {
      if (!methode.rumpf) continue
      const rahmen: Rahmen = {
        variablen: new Map(methode.parameter.map((p) => [p.name, p.typ.name + '[]'.repeat(p.typ.dimensionen)] as const)),
        felder,
        klasse,
        statisch: methode.statisch,
      }
      for (const a of methode.rumpf.anweisungen) anweisungPruefen(a, rahmen)
      rueckgabePruefen(methode)
    }
  }

  function rueckgabePruefen(methode: MethodenDekl) {
    if (methode.konstruktor || !methode.rumpf) return
    if (methode.rueckgabe.name === 'void' && methode.rueckgabe.dimensionen === 0) return
    if (!hatReturn(methode.rumpf.anweisungen)) {
      melde(
        methode.zeile,
        `Die Methode \`${methode.name}\` verspricht ein ${typText(methode.rueckgabe)} zurückzugeben, tut es aber nie. Fehlt ein \`return\`?`,
        'missing return statement',
      )
    }
  }

  return meldungen.sort((a, b) => a.zeile - b.zeile)
}
