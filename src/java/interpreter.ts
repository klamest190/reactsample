/**
 * JAVA-TEIL · Schritt 4 von 4: den Syntaxbaum ausführen
 *
 * Ein "tree-walking interpreter": Für jeden Knoten aus ast.ts gibt es hier
 * einen Fall. Echtes Java übersetzt stattdessen erst zu Bytecode und lässt
 * die JVM laufen - für einen Lernkurs im Browser ist der direkte Weg besser,
 * weil jede Fehlermeldung eine Zeilennummer aus dem Quelltext behalten kann.
 *
 * Bewusst nachgebaut, weil der Kurs es erklärt:
 *   - int-Arithmetik läuft über (überläuft bei 2147483647)
 *   - `/` schneidet bei ganzen Zahlen ab, `/ 0` wirft ArithmeticException
 *   - `==` vergleicht bei Objekten die Identität, `.equals()` den Inhalt
 *   - Felder haben Standardwerte (0, false, null), lokale Variablen nicht
 *   - Methoden werden dynamisch gebunden (Polymorphie)
 */

import type { Anweisung, Ausdruck, FeldDekl, MethodenDekl, Programm, TypRef } from './ast'
import { parsen } from './parser'
import {
  alsZahl,
  doubleText,
  identitaet,
  inhaltGleich,
  istZahl,
  komma,
  neuerString,
  NULL,
  poolString,
  schluesselVon,
  textVon,
  typName,
  wahrheit,
  zahl,
  zeichen,
  type JavaObjekt,
  type Klasse,
  type NativWert,
  type Wert,
} from './werte'
import {
  EINGEBAUTE_KLASSEN,
  istAusnahmeKlasse,
  nativErzeugen,
  nativMethode,
  nativesFeld,
  oberklasseVon,
  primitivMethode,
  statischerAufruf,
  statischesFeld,
  stringMethode,
} from './bibliothek'
import type { Extension } from './extension'

// ---------------------------------------------------------------------------
// Fehler und Signale
// ---------------------------------------------------------------------------

/** Eine Java-Exception - fangbar mit try/catch. */
export class JavaAusnahme extends Error {
  wert: Wert
  zeile: number

  constructor(wert: Wert, zeile: number) {
    super('java exception')
    this.name = 'JavaAusnahme'
    this.wert = wert
    this.zeile = zeile
  }
}

/** Abbruch von außen: Endlosschleife, zu viel Ausgabe. Nicht fangbar. */
export class JavaAbbruch extends Error {
  deutsch: string
  englisch: string
  /** Zeile, falls der Abbruch zu einer bestimmten Stelle gehört. */
  zeile?: number

  constructor(deutsch: string, englisch: string, zeile?: number) {
    super(deutsch)
    this.name = 'JavaAbbruch'
    this.deutsch = deutsch
    this.englisch = englisch
    this.zeile = zeile
  }
}

class Rueckgabe {
  wert: Wert
  constructor(wert: Wert) {
    this.wert = wert
  }
}
const BREAK = Symbol('break')
const CONTINUE = Symbol('continue')
type Fluss = void | Rueckgabe | typeof BREAK | typeof CONTINUE

const MAX_SCHRITTE = 4_000_000
const MAX_ZEILEN = 500

// ---------------------------------------------------------------------------
// Sichtbarkeitsbereiche
// ---------------------------------------------------------------------------

type Eintrag = { wert: Wert; typ: TypRef; final: boolean }

export class Umgebung {
  private variablen = new Map<string, Eintrag>()
  eltern?: Umgebung

  constructor(eltern?: Umgebung) {
    this.eltern = eltern
  }

  deklarieren(name: string, wert: Wert, typ: TypRef, final = false) {
    this.variablen.set(name, { wert, typ, final })
  }
  finden(name: string): Eintrag | undefined {
    return this.variablen.get(name) ?? this.eltern?.finden(name)
  }
  setzen(name: string, wert: Wert): boolean {
    const eintrag = this.variablen.get(name)
    if (eintrag) {
      eintrag.wert = wert
      return true
    }
    return this.eltern?.setzen(name, wert) ?? false
  }
  /** Alle sichtbaren Variablen (für die Testauswertung nach dem Lauf). */
  alle(): Map<string, Eintrag> {
    const map = new Map(this.eltern?.alle() ?? [])
    for (const [k, v] of this.variablen) map.set(k, v)
    return map
  }
}

type Kontext = {
  umgebung: Umgebung
  /** Das Objekt, auf dem gerade eine Methode läuft (`this`) - null bei static. */
  selbst: JavaObjekt | null
  /** Die Klasse, in der der laufende Code steht - wichtig für `super`. */
  klasse: Klasse | null
}

export type AusgabeZeile = { strom: 'out' | 'err'; text: string }

// ---------------------------------------------------------------------------
// Der Interpreter
// ---------------------------------------------------------------------------

export class Interpreter {
  klassen = new Map<string, Klasse>()
  zeilen: AusgabeZeile[] = []
  /** Die Umgebung von `main` nach dem Lauf - darin prüfen die Übungstests. */
  hauptUmgebung: Umgebung | null = null
  hauptKlasse: Klasse | null = null

  /** Additional library, e.g. Spring - see extension.ts. */
  readonly extension?: Extension

  private schritte = 0
  private puffer = { out: '', err: '' }

  constructor(programm: Programm, extension?: Extension) {
    this.extension = extension
    for (const dekl of programm.typen) {
      if (this.klassen.has(dekl.name)) {
        throw new JavaAbbruch(
          `Die Klasse ${dekl.name} ist doppelt deklariert.`,
          `duplicate class: ${dekl.name}`,
        )
      }
      const klasse: Klasse = {
        name: dekl.name,
        dekl,
        interfaces: new Set(dekl.interfaces),
        statisch: new Map(),
        methoden: new Map(),
        konstruktoren: [],
        abstrakt: dekl.abstrakt,
        istInterface: dekl.art === 'interface',
        istEnum: dekl.art === 'enum',
      }
      for (const m of dekl.methoden) {
        if (m.konstruktor) klasse.konstruktoren.push(m)
        else {
          const liste = klasse.methoden.get(m.name) ?? []
          liste.push(m)
          klasse.methoden.set(m.name, liste)
        }
      }
      this.klassen.set(dekl.name, klasse)
    }

    // Verwandtschaft auflösen, dann records/enums vervollständigen.
    for (const klasse of this.klassen.values()) {
      if (klasse.dekl.oberklasse) klasse.oberklasse = this.klassen.get(klasse.dekl.oberklasse)
      if (klasse.dekl.aeussere) klasse.aeussere = this.klassen.get(klasse.dekl.aeussere)
      for (const name of klasse.dekl.interfaces) {
        const i = this.klassen.get(name)
        if (i) for (const geerbt of i.interfaces) klasse.interfaces.add(geerbt)
      }
      let oben = klasse.oberklasse
      while (oben) {
        for (const i of oben.interfaces) klasse.interfaces.add(i)
        oben = oben.oberklasse
      }
      if (klasse.dekl.komponenten) this.recordVervollstaendigen(klasse)
    }
    for (const klasse of this.klassen.values()) this.statischesLaden(klasse)
  }

  // --- Ausgabe -------------------------------------------------------------

  drucken(text: string, strom: 'out' | 'err' = 'out') {
    this.puffer[strom] += text
    let umbruch = this.puffer[strom].indexOf('\n')
    while (umbruch >= 0) {
      this.zeileAusgeben(this.puffer[strom].slice(0, umbruch), strom)
      this.puffer[strom] = this.puffer[strom].slice(umbruch + 1)
      umbruch = this.puffer[strom].indexOf('\n')
    }
    if (this.puffer[strom].length > 10_000) {
      throw new JavaAbbruch('Zu viel Ausgabe in einer Zeile.', 'too much output on one line')
    }
  }

  private zeileAusgeben(text: string, strom: 'out' | 'err') {
    if (this.zeilen.length >= MAX_ZEILEN) {
      throw new JavaAbbruch(
        `Mehr als ${MAX_ZEILEN} Ausgabezeilen - läuft da eine Endlosschleife?`,
        `more than ${MAX_ZEILEN} lines of output - is there an endless loop?`,
      )
    }
    this.zeilen.push({ strom, text })
  }

  /** Reste ohne Zeilenumbruch am Ende trotzdem zeigen (print statt println). */
  abschliessen() {
    for (const strom of ['out', 'err'] as const) {
      if (this.puffer[strom]) {
        this.zeileAusgeben(this.puffer[strom], strom)
        this.puffer[strom] = ''
      }
    }
  }

  // --- Klassen vorbereiten --------------------------------------------------

  private recordVervollstaendigen(klasse: Klasse) {
    for (const k of klasse.dekl.komponenten!) {
      if (!klasse.dekl.felder.some((f) => f.name === k.name)) {
        klasse.dekl.felder.push({
          name: k.name,
          typ: k.typ,
          statisch: false,
          final: true,
          sichtbarkeit: 'private',
          zeile: klasse.dekl.zeile,
        })
      }
    }
  }

  private statischesLaden(klasse: Klasse) {
    const kontext: Kontext = { umgebung: new Umgebung(), selbst: null, klasse }
    for (const feld of klasse.dekl.felder) {
      if (!feld.statisch) continue
      klasse.statisch.set(feld.name, feld.init ? this.anpassen(this.auswerten(feld.init, kontext), feld.typ) : this.standardWert(feld.typ))
    }
    if (klasse.istEnum) {
      const konstanten: Wert[] = []
      klasse.dekl.konstanten.forEach((konstante, index) => {
        const argumente = konstante.argumente.map((a) => this.auswerten(a, kontext))
        const objekt = this.objektErzeugen(klasse, argumente, klasse.dekl.zeile)
        objekt.felder.set('$name', poolString(konstante.name))
        objekt.felder.set('$ordinal', zahl(index))
        klasse.statisch.set(konstante.name, objekt)
        konstanten.push(objekt)
      })
      klasse.statisch.set('$werte', { art: 'array', typ: klasse.name, werte: konstanten })
    }
  }

  // --- Programmstart --------------------------------------------------------

  /** Sucht `public static void main(String[] args)` und führt sie aus. */
  starten() {
    const mitMain = [...this.klassen.values()].filter((k) => (k.methoden.get('main') ?? []).some((m) => m.statisch))
    const klasse = mitMain.find((k) => k.name === 'Main') ?? mitMain[0]
    if (!klasse) {
      throw new JavaAbbruch(
        'Keine main-Methode gefunden. Ein Java-Programm startet in `public static void main(String[] args)`.',
        'No main method found. A Java program starts in `public static void main(String[] args)`.',
      )
    }
    this.hauptKlasse = klasse
    const methode = (klasse.methoden.get('main') ?? []).find((m) => m.statisch)!
    const umgebung = new Umgebung()
    umgebung.deklarieren('args', { art: 'array', typ: 'String', werte: [] }, methode.parameter[0]?.typ ?? { name: 'String', dimensionen: 1, argumente: [] })
    this.hauptUmgebung = umgebung
    this.bloeckeAusfuehren(methode.rumpf?.anweisungen ?? [], { umgebung, selbst: null, klasse })
    this.abschliessen()
  }

  /** Wertet einen einzelnen Ausdruck im Zustand nach `main` aus (für Tests). */
  ausdruckAuswerten(quelle: string): Wert {
    const programm = parsen(`class $Test { static Object $wert() { return ${quelle}; } }`)
    const methode = programm.typen[0].methoden[0]
    const kontext: Kontext = {
      umgebung: new Umgebung(this.hauptUmgebung ?? undefined),
      selbst: null,
      klasse: this.hauptKlasse,
    }
    const fluss = this.bloeckeAusfuehren(methode.rumpf!.anweisungen, kontext)
    return fluss instanceof Rueckgabe ? fluss.wert : NULL
  }

  // --- Anweisungen ----------------------------------------------------------

  private takt() {
    if (++this.schritte > MAX_SCHRITTE) {
      throw new JavaAbbruch(
        'Das Programm läuft zu lange - vermutlich eine Endlosschleife.',
        'The program runs too long - probably an endless loop.',
      )
    }
  }

  private bloeckeAusfuehren(anweisungen: Anweisung[], kontext: Kontext): Fluss {
    for (const a of anweisungen) {
      const fluss = this.ausfuehren(a, kontext)
      if (fluss) return fluss
    }
  }

  private ausfuehren(anweisung: Anweisung, kontext: Kontext): Fluss {
    this.takt()
    switch (anweisung.art) {
      case 'leer':
        return

      case 'block':
        return this.bloeckeAusfuehren(anweisung.anweisungen, { ...kontext, umgebung: new Umgebung(kontext.umgebung) })

      case 'lokal': {
        for (const v of anweisung.variablen) {
          const typ: TypRef = { ...anweisung.typ, dimensionen: anweisung.typ.dimensionen + v.dimensionen }
          let wert = v.init ? this.auswerten(v.init, kontext, typ) : { art: 'null' as const }
          if (v.init) wert = this.anpassen(wert, typ)
          kontext.umgebung.deklarieren(v.name, wert, typ, anweisung.final)
        }
        return
      }

      case 'ausdruck':
        this.auswerten(anweisung.ausdruck, kontext)
        return

      case 'if':
        if (this.wahrheitswert(this.auswerten(anweisung.bedingung, kontext), anweisung.zeile)) {
          return this.ausfuehren(anweisung.dann, kontext)
        }
        return anweisung.sonst ? this.ausfuehren(anweisung.sonst, kontext) : undefined

      case 'while':
        while (this.wahrheitswert(this.auswerten(anweisung.bedingung, kontext), anweisung.zeile)) {
          this.takt()
          const fluss = this.ausfuehren(anweisung.rumpf, kontext)
          if (fluss === BREAK) break
          if (fluss instanceof Rueckgabe) return fluss
        }
        return

      case 'doWhile':
        do {
          this.takt()
          const fluss = this.ausfuehren(anweisung.rumpf, kontext)
          if (fluss === BREAK) break
          if (fluss instanceof Rueckgabe) return fluss
        } while (this.wahrheitswert(this.auswerten(anweisung.bedingung, kontext), anweisung.zeile))
        return

      case 'for': {
        const innen: Kontext = { ...kontext, umgebung: new Umgebung(kontext.umgebung) }
        for (const i of anweisung.init) this.ausfuehren(i, innen)
        while (!anweisung.bedingung || this.wahrheitswert(this.auswerten(anweisung.bedingung, innen), anweisung.zeile)) {
          this.takt()
          const fluss = this.ausfuehren(anweisung.rumpf, innen)
          if (fluss === BREAK) break
          if (fluss instanceof Rueckgabe) return fluss
          for (const s of anweisung.schritt) this.auswerten(s, innen)
        }
        return
      }

      case 'forEach': {
        const quelle = this.auswerten(anweisung.quelle, kontext)
        const elemente = this.elementeVon(quelle, anweisung.zeile)
        for (const element of elemente) {
          this.takt()
          const innen: Kontext = { ...kontext, umgebung: new Umgebung(kontext.umgebung) }
          innen.umgebung.deklarieren(anweisung.name, this.anpassen(element, anweisung.typ), anweisung.typ)
          const fluss = this.ausfuehren(anweisung.rumpf, innen)
          if (fluss === BREAK) break
          if (fluss instanceof Rueckgabe) return fluss
        }
        return
      }

      case 'switch':
        return this.switchAusfuehren(anweisung, kontext).fluss

      case 'return':
        return new Rueckgabe(anweisung.wert ? this.auswerten(anweisung.wert, kontext) : NULL)

      case 'break':
        return BREAK

      case 'continue':
        return CONTINUE

      case 'throw': {
        const wert = this.auswerten(anweisung.wert, kontext)
        if (wert.art === 'null') this.werfen('NullPointerException', null, anweisung.zeile)
        throw new JavaAusnahme(wert, anweisung.zeile)
      }

      case 'try':
        return this.tryAusfuehren(anweisung, kontext)
    }
  }

  private switchAusfuehren(
    anweisung: Extract<Anweisung, { art: 'switch' }>,
    kontext: Kontext,
  ): { fluss: Fluss; ergebnis?: Wert } {
    const wert = this.auswerten(anweisung.wert, kontext)
    const passt = (kandidat: Ausdruck) => {
      // In `case ROT:` steht der Enum-Name ohne Klasse davor.
      if (kandidat.art === 'name' && wert.art === 'objekt' && wert.klasse.istEnum) {
        return wert.klasse.statisch.get(kandidat.name) === wert
      }
      return inhaltGleich(this.auswerten(kandidat, kontext), wert)
    }

    let start = anweisung.faelle.findIndex((f) => f.werte.length > 0 && f.werte.some(passt))
    if (start < 0) start = anweisung.faelle.findIndex((f) => f.werte.length === 0)
    if (start < 0) return { fluss: undefined }

    const innen: Kontext = { ...kontext, umgebung: new Umgebung(kontext.umgebung) }
    if (anweisung.pfeil) {
      const fall = anweisung.faelle[start]
      if (fall.ergebnis) return { fluss: undefined, ergebnis: this.auswerten(fall.ergebnis, innen) }
      const fluss = this.bloeckeAusfuehren(fall.anweisungen, innen)
      return { fluss: fluss === BREAK ? undefined : fluss }
    }
    // Klassisches switch: ohne break läuft es in den nächsten Fall weiter.
    for (let i = start; i < anweisung.faelle.length; i++) {
      const fluss = this.bloeckeAusfuehren(anweisung.faelle[i].anweisungen, innen)
      if (fluss === BREAK) return { fluss: undefined }
      if (fluss) return { fluss }
    }
    return { fluss: undefined }
  }

  private tryAusfuehren(anweisung: Extract<Anweisung, { art: 'try' }>, kontext: Kontext): Fluss {
    let fluss: Fluss
    try {
      fluss = this.ausfuehren(anweisung.rumpf, kontext)
    } catch (fehler) {
      if (!(fehler instanceof JavaAusnahme)) throw fehler
      const faenger = anweisung.faenger.find((f) => f.typen.some((t) => this.istInstanz(fehler.wert, t)))
      if (!faenger) {
        if (anweisung.schliesslich) this.ausfuehren(anweisung.schliesslich, kontext)
        throw fehler
      }
      const innen: Kontext = { ...kontext, umgebung: new Umgebung(kontext.umgebung) }
      innen.umgebung.deklarieren(faenger.name, fehler.wert, { name: faenger.typen[0], dimensionen: 0, argumente: [] })
      try {
        fluss = this.ausfuehren(faenger.rumpf, innen)
      } finally {
        if (anweisung.schliesslich) this.ausfuehren(anweisung.schliesslich, kontext)
      }
      return fluss
    }
    if (anweisung.schliesslich) {
      const flussSchluss = this.ausfuehren(anweisung.schliesslich, kontext)
      if (flussSchluss) return flussSchluss
    }
    return fluss
  }

  // --- Ausdrücke ------------------------------------------------------------

  private auswerten(ausdruck: Ausdruck, kontext: Kontext, erwartet?: TypRef): Wert {
    this.takt()
    switch (ausdruck.art) {
      case 'literal': {
        const l = ausdruck.wert
        switch (l.typ) {
          case 'int':
            return { art: 'int', wert: l.wert }
          case 'double':
            return komma(l.wert)
          case 'boolean':
            return wahrheit(l.wert)
          case 'char':
            return zeichen(l.wert)
          case 'String':
            return poolString(l.wert)
          default:
            return NULL
        }
      }

      case 'name':
        return this.nameLesen(ausdruck.name, kontext, ausdruck.zeile)

      case 'this':
        if (!kontext.selbst) this.abbruch('`this` gibt es in einer static-Methode nicht.', 'non-static variable this cannot be referenced from a static context')
        return kontext.selbst!

      case 'super':
        return kontext.selbst ?? NULL

      case 'classLiteral':
        return { art: 'nativ', typ: 'Class', daten: { text: ausdruck.className, klasse: this.klassen.get(ausdruck.className) } }

      case 'feld':
        return this.feldLesen(ausdruck.ziel, ausdruck.name, kontext, ausdruck.zeile)

      case 'index': {
        const ziel = this.auswerten(ausdruck.ziel, kontext)
        const index = alsZahl(this.auswerten(ausdruck.index, kontext))
        return this.arrayLesen(ziel, index, ausdruck.zeile)
      }

      case 'arrayWerte': {
        const werte = ausdruck.werte.map((w) => this.auswerten(w, kontext))
        const typ = erwartet?.name ?? 'Object'
        return { art: 'array', typ, werte: werte.map((w) => this.anpassen(w, { name: typ, dimensionen: 0, argumente: [] })) }
      }

      case 'neuArray':
        return this.arrayErzeugen(ausdruck, kontext)

      case 'neu':
        return this.neuErzeugen(ausdruck.klasse, ausdruck.argumente.map((a) => this.auswerten(a, kontext)), ausdruck.zeile)

      case 'aufruf':
        return this.aufrufAuswerten(ausdruck, kontext)

      case 'zuweisung':
        return this.zuweisen(ausdruck, kontext)

      case 'stufe': {
        const alt = this.auswerten(ausdruck.ziel, kontext)
        const eins: Wert = { art: 'int', wert: 1 }
        const neu = this.rechnen(ausdruck.operator === '++' ? '+' : '-', alt, eins, ausdruck.zeile)
        const gespeichert = this.schreiben(ausdruck.ziel, neu, kontext, ausdruck.zeile)
        return ausdruck.vorher ? gespeichert : alt
      }

      case 'binaer':
        return this.binaerAuswerten(ausdruck, kontext)

      case 'unaer': {
        const wert = this.auswerten(ausdruck.ausdruck, kontext)
        if (ausdruck.operator === '!') return wahrheit(!this.wahrheitswert(wert, ausdruck.zeile))
        if (ausdruck.operator === '-') {
          if (wert.art === 'double') return komma(-wert.wert)
          return zahl(-alsZahl(wert))
        }
        if (ausdruck.operator === '~') return zahl(~alsZahl(wert))
        return wert.art === 'char' ? zahl(wert.wert) : wert
      }

      case 'ternaer':
        return this.wahrheitswert(this.auswerten(ausdruck.bedingung, kontext), ausdruck.zeile)
          ? this.auswerten(ausdruck.dann, kontext, erwartet)
          : this.auswerten(ausdruck.sonst, kontext, erwartet)

      case 'instanceof': {
        const wert = this.auswerten(ausdruck.ausdruck, kontext)
        const passt = wert.art !== 'null' && this.istInstanz(wert, ausdruck.typ.replace(/\[\]$/, ''))
        if (passt && ausdruck.bindung) {
          kontext.umgebung.deklarieren(ausdruck.bindung, wert, { name: ausdruck.typ, dimensionen: 0, argumente: [] })
        }
        return wahrheit(passt)
      }

      case 'cast':
        return this.umwandeln(this.auswerten(ausdruck.ausdruck, kontext, ausdruck.typ), ausdruck.typ, ausdruck.zeile)

      case 'lambda': {
        const rumpf = ausdruck.rumpf
        const gefangen = kontext
        return {
          art: 'funktion',
          aufrufen: (argumente) => {
            const innen: Kontext = { ...gefangen, umgebung: new Umgebung(gefangen.umgebung) }
            ausdruck.parameter.forEach((p, i) => {
              innen.umgebung.deklarieren(p, argumente[i] ?? NULL, { name: 'var', dimensionen: 0, argumente: [] })
            })
            if ('art' in rumpf && rumpf.art === 'block') {
              const fluss = this.bloeckeAusfuehren(rumpf.anweisungen, innen)
              return fluss instanceof Rueckgabe ? fluss.wert : NULL
            }
            return this.auswerten(rumpf as Ausdruck, innen)
          },
        }
      }

      case 'methodenRef': {
        const ziel = ausdruck.ziel
        const name = ausdruck.name
        return {
          art: 'funktion',
          aufrufen: (argumente) => {
            if (name === '<init>') return this.neuErzeugen(ziel, argumente, ausdruck.zeile)
            const klasse = this.klassen.get(ziel)
            if (klasse || this.isBuiltIn(ziel)) {
              // Statisch (Integer::parseInt) oder auf dem ersten Argument (String::toUpperCase).
              try {
                return this.statischAufrufen(ziel, name, argumente, ausdruck.zeile)
              } catch {
                return this.methodeAufrufen(argumente[0], name, argumente.slice(1), ausdruck.zeile)
              }
            }
            const wert = this.nameLesen(ziel, kontext, ausdruck.zeile)
            return this.methodeAufrufen(wert, name, argumente, ausdruck.zeile)
          },
        }
      }

      case 'switchAusdruck': {
        const ergebnis = this.switchAusfuehren(ausdruck.anweisung as Extract<Anweisung, { art: 'switch' }>, kontext)
        if (ergebnis.ergebnis) return ergebnis.ergebnis
        if (ergebnis.fluss instanceof Rueckgabe) return ergebnis.fluss.wert
        return NULL
      }
    }
  }

  private binaerAuswerten(ausdruck: Extract<Ausdruck, { art: 'binaer' }>, kontext: Kontext): Wert {
    const { operator, zeile } = ausdruck
    // && und || werten die rechte Seite nur aus, wenn sie noch gebraucht wird.
    if (operator === '&&' || operator === '||') {
      const links = this.wahrheitswert(this.auswerten(ausdruck.links, kontext), zeile)
      if (operator === '&&' && !links) return wahrheit(false)
      if (operator === '||' && links) return wahrheit(true)
      return wahrheit(this.wahrheitswert(this.auswerten(ausdruck.rechts, kontext), zeile))
    }

    const links = this.auswerten(ausdruck.links, kontext)
    const rechts = this.auswerten(ausdruck.rechts, kontext)

    if (operator === '==' || operator === '!=') {
      const gleich = this.identisch(links, rechts)
      return wahrheit(operator === '==' ? gleich : !gleich)
    }

    // String + irgendwas: Der Sonderfall, den Java als einziges "Operator-Überladen" kennt.
    if (operator === '+' && (links.art === 'string' || rechts.art === 'string')) {
      const text = this.alsText(links) + this.alsText(rechts)
      // Zwei Literale fasst schon der Compiler zusammen - das Ergebnis liegt im Pool.
      const beideLiteral = ausdruck.links.art === 'literal' && ausdruck.rechts.art === 'literal'
      return beideLiteral ? poolString(text) : neuerString(text)
    }

    return this.rechnen(operator, links, rechts, zeile)
  }

  private rechnen(operator: string, links: Wert, rechts: Wert, zeile: number): Wert {
    if (operator === '&' && links.art === 'boolean' && rechts.art === 'boolean') return wahrheit(links.wert && rechts.wert)
    if (operator === '|' && links.art === 'boolean' && rechts.art === 'boolean') return wahrheit(links.wert || rechts.wert)
    if (operator === '^' && links.art === 'boolean' && rechts.art === 'boolean') return wahrheit(links.wert !== rechts.wert)

    if (!istZahl(links) || !istZahl(rechts)) {
      this.abbruch(
        `Der Operator ${operator} passt nicht zu ${typName(links)} und ${typName(rechts)}.`,
        `bad operand types for operator '${operator}': ${typName(links)}, ${typName(rechts)}`,
      )
    }
    const a = alsZahl(links)
    const b = alsZahl(rechts)

    switch (operator) {
      case '<':
        return wahrheit(a < b)
      case '>':
        return wahrheit(a > b)
      case '<=':
        return wahrheit(a <= b)
      case '>=':
        return wahrheit(a >= b)
    }

    // Sobald ein double beteiligt ist, rechnet Java in double weiter.
    const kommazahl = links.art === 'double' || rechts.art === 'double'
    switch (operator) {
      case '+':
        return kommazahl ? komma(a + b) : zahl(a + b)
      case '-':
        return kommazahl ? komma(a - b) : zahl(a - b)
      case '*':
        return kommazahl ? komma(a * b) : zahl(Math.imul(a | 0, b | 0))
      case '/':
        if (!kommazahl) {
          if (b === 0) this.werfen('ArithmeticException', '/ by zero', zeile)
          return zahl(Math.trunc(a / b))
        }
        return komma(a / b)
      case '%':
        if (!kommazahl && b === 0) this.werfen('ArithmeticException', '/ by zero', zeile)
        return kommazahl ? komma(a % b) : zahl(a % b)
      case '&':
        return zahl(a & b)
      case '|':
        return zahl(a | b)
      case '^':
        return zahl(a ^ b)
      case '<<':
        return zahl(a << b)
      case '>>':
        return zahl(a >> b)
      case '>>>':
        return zahl(a >>> b)
    }
    this.abbruch(`Unbekannter Operator ${operator}.`, `unknown operator ${operator}`)
  }

  /** `==`: Zahlen nach Wert, alles andere nach Identität - die klassische Java-Falle. */
  private identisch(a: Wert, b: Wert): boolean {
    if (a.art === 'null' || b.art === 'null') return a.art === b.art
    if (istZahl(a) && istZahl(b)) return alsZahl(a) === alsZahl(b)
    if (a.art === 'boolean' && b.art === 'boolean') return a.wert === b.wert
    return a === b
  }

  // --- Lesen und Schreiben --------------------------------------------------

  /**
   * Alle Klassen, deren static-Felder und -Methoden von hier aus sichtbar sind:
   * die eigene Klasse samt Oberklassen - und dasselbe für jede umgebende Klasse.
   */
  private *sichtbareKlassen(start: Klasse | null): Generator<Klasse> {
    for (let aussen: Klasse | undefined = start ?? undefined; aussen; aussen = aussen.aeussere) {
      for (let k: Klasse | undefined = aussen; k; k = k.oberklasse) yield k
    }
  }

  private nameLesen(name: string, kontext: Kontext, zeile: number): Wert {
    const lokal = kontext.umgebung.finden(name)
    if (lokal) return lokal.wert

    if (kontext.selbst) {
      const objekt = kontext.selbst
      if (objekt.felder.has(name)) return objekt.felder.get(name)!
    }
    for (const k of this.sichtbareKlassen(kontext.klasse)) {
      if (k.statisch.has(name)) return k.statisch.get(name)!
    }
    this.abbruch(`Die Variable \`${name}\` gibt es hier nicht.`, `cannot find symbol: variable ${name}`, zeile)
  }

  private feldLesen(zielAusdruck: Ausdruck, name: string, kontext: Kontext, zeile: number): Wert {
    // Klassenname davor? Dann ist es ein statisches Feld (Math.PI, Integer.MAX_VALUE).
    if (zielAusdruck.art === 'name' && !kontext.umgebung.finden(zielAusdruck.name)) {
      const klassenName = zielAusdruck.name
      const klasse = this.klassen.get(klassenName)
      if (klasse) {
        for (let k: Klasse | undefined = klasse; k; k = k.oberklasse) {
          if (k.statisch.has(name)) return k.statisch.get(name)!
        }
        this.abbruch(`${klassenName} hat kein statisches Feld \`${name}\`.`, `cannot find symbol: variable ${name}`, zeile)
      }
      const eingebaut = this.extension?.staticField?.(klassenName, name, this) ?? statischesFeld(klassenName, name, this)
      if (eingebaut) return eingebaut
    }

    const ziel = this.auswerten(zielAusdruck, kontext)
    if (ziel.art === 'null') this.werfen('NullPointerException', `Cannot read field "${name}" because the value is null`, zeile)
    if (ziel.art === 'array' && name === 'length') return zahl(ziel.werte.length)
    if (ziel.art === 'objekt') {
      if (ziel.felder.has(name)) return ziel.felder.get(name)!
      for (let k: Klasse | undefined = ziel.klasse; k; k = k.oberklasse) {
        if (k.statisch.has(name)) return k.statisch.get(name)!
      }
    }
    if (ziel.art === 'nativ') {
      const wert = nativesFeld(ziel, name, this)
      if (wert) return wert
    }
    this.abbruch(`\`${name}\` gibt es bei ${typName(ziel)} nicht.`, `cannot find symbol: variable ${name}`, zeile)
  }

  private arrayLesen(ziel: Wert, index: number, zeile: number): Wert {
    if (ziel.art === 'null') this.werfen('NullPointerException', 'Cannot load from null array', zeile)
    if (ziel.art !== 'array') {
      this.abbruch(`${typName(ziel)} ist kein Array.`, `array required, but ${typName(ziel)} found`, zeile)
    }
    if (index < 0 || index >= ziel.werte.length) {
      this.werfen('ArrayIndexOutOfBoundsException', `Index ${index} out of bounds for length ${ziel.werte.length}`, zeile)
    }
    return ziel.werte[index]
  }

  private zuweisen(ausdruck: Extract<Ausdruck, { art: 'zuweisung' }>, kontext: Kontext): Wert {
    const zielTyp = this.typVonZiel(ausdruck.ziel, kontext)
    let wert: Wert
    if (ausdruck.operator === '=') {
      wert = this.auswerten(ausdruck.wert, kontext, zielTyp)
    } else {
      const alt = this.auswerten(ausdruck.ziel, kontext)
      const rechts = this.auswerten(ausdruck.wert, kontext)
      const operator = ausdruck.operator.slice(0, -1)
      if (operator === '+' && alt.art === 'string') {
        wert = neuerString(alt.wert + this.alsText(rechts))
      } else {
        wert = this.rechnen(operator, alt, rechts, ausdruck.zeile)
        // `int x = 5; x += 1.5;` ist in Java erlaubt - es wird still abgeschnitten.
        if (zielTyp && ['int', 'long', 'short', 'byte', 'char'].includes(zielTyp.name) && zielTyp.dimensionen === 0 && wert.art === 'double') {
          wert = zielTyp.name === 'char' ? zeichen(Math.trunc(wert.wert)) : zahl(Math.trunc(wert.wert))
        }
      }
    }
    if (zielTyp) wert = this.anpassen(wert, zielTyp)
    return this.schreiben(ausdruck.ziel, wert, kontext, ausdruck.zeile)
  }

  /** Der deklarierte Typ des Ziels - nötig für `double d = 5;` und `x += 1.5`. */
  private typVonZiel(ziel: Ausdruck, kontext: Kontext): TypRef | undefined {
    if (ziel.art === 'name') {
      const lokal = kontext.umgebung.finden(ziel.name)
      if (lokal) return lokal.typ
      for (let k: Klasse | undefined = kontext.klasse ?? undefined; k; k = k.oberklasse) {
        const feld = k.dekl.felder.find((f) => f.name === ziel.name)
        if (feld) return feld.typ
      }
      return undefined
    }
    if (ziel.art === 'feld') {
      const basis = ziel.ziel
      if (basis.art === 'this' && kontext.klasse) {
        for (let k: Klasse | undefined = kontext.klasse; k; k = k.oberklasse) {
          const feld = k.dekl.felder.find((f) => f.name === ziel.name)
          if (feld) return feld.typ
        }
      }
      return undefined
    }
    return undefined
  }

  private schreiben(ziel: Ausdruck, wert: Wert, kontext: Kontext, zeile: number): Wert {
    if (ziel.art === 'name') {
      const lokal = kontext.umgebung.finden(ziel.name)
      if (lokal) {
        if (lokal.final) {
          this.abbruch(
            `\`${ziel.name}\` ist final und kann nicht neu zugewiesen werden.`,
            `cannot assign a value to final variable ${ziel.name}`,
            zeile,
          )
        }
        kontext.umgebung.setzen(ziel.name, wert)
        return wert
      }
      if (kontext.selbst?.felder.has(ziel.name)) {
        kontext.selbst.felder.set(ziel.name, wert)
        return wert
      }
      for (const k of this.sichtbareKlassen(kontext.klasse)) {
        if (k.statisch.has(ziel.name)) {
          k.statisch.set(ziel.name, wert)
          return wert
        }
      }
      this.abbruch(`Die Variable \`${ziel.name}\` gibt es hier nicht.`, `cannot find symbol: variable ${ziel.name}`, zeile)
    }

    if (ziel.art === 'feld') {
      if (ziel.ziel.art === 'name' && !kontext.umgebung.finden(ziel.ziel.name)) {
        const klasse = this.klassen.get(ziel.ziel.name)
        if (klasse) {
          for (let k: Klasse | undefined = klasse; k; k = k.oberklasse) {
            if (k.statisch.has(ziel.name)) {
              k.statisch.set(ziel.name, wert)
              return wert
            }
          }
        }
      }
      const objekt = this.auswerten(ziel.ziel, kontext)
      if (objekt.art === 'null') this.werfen('NullPointerException', `Cannot assign field "${ziel.name}" because the value is null`, zeile)
      if (objekt.art !== 'objekt') {
        this.abbruch(`${typName(objekt)} hat kein Feld \`${ziel.name}\`.`, `cannot find symbol: variable ${ziel.name}`, zeile)
      }
      objekt.felder.set(ziel.name, wert)
      return wert
    }

    if (ziel.art === 'index') {
      const array = this.auswerten(ziel.ziel, kontext)
      const index = alsZahl(this.auswerten(ziel.index, kontext))
      if (array.art === 'null') this.werfen('NullPointerException', 'Cannot store to null array', zeile)
      if (array.art !== 'array') this.abbruch(`${typName(array)} ist kein Array.`, `array required, but ${typName(array)} found`, zeile)
      if (index < 0 || index >= array.werte.length) {
        this.werfen('ArrayIndexOutOfBoundsException', `Index ${index} out of bounds for length ${array.werte.length}`, zeile)
      }
      array.werte[index] = this.anpassen(wert, { name: array.typ, dimensionen: 0, argumente: [] })
      return array.werte[index]
    }

    this.abbruch('Hier kann nichts zugewiesen werden.', 'unexpected type: variable required', zeile)
  }

  // --- Aufrufe --------------------------------------------------------------

  private aufrufAuswerten(ausdruck: Extract<Ausdruck, { art: 'aufruf' }>, kontext: Kontext): Wert {
    const { name, zeile } = ausdruck
    const argumente = ausdruck.argumente.map((a) => this.auswerten(a, kontext))

    // super(...) und this(...) im Konstruktor
    if (name === '<superinit>' || name === '<init>') {
      const klasse = name === '<superinit>' ? kontext.klasse?.oberklasse : kontext.klasse
      if (klasse && kontext.selbst) this.konstruktorLauf(klasse, kontext.selbst, argumente, zeile, name === '<init>')
      return NULL
    }

    // Ohne Ziel: eigene Methode (static oder auf this), sonst eine der umgebenden Klasse
    if (!ausdruck.ziel) {
      const klasse = kontext.klasse
      if (klasse) {
        const gefunden = this.methodeFinden(kontext.selbst?.klasse ?? klasse, name, argumente)
        if (gefunden) return this.methodeLaufen(gefunden.klasse, gefunden.methode, kontext.selbst, argumente, zeile)
        for (let aussen = klasse.aeussere; aussen; aussen = aussen.aeussere) {
          const dort = this.methodeFinden(aussen, name, argumente)
          if (dort) return this.methodeLaufen(dort.klasse, dort.methode, null, argumente, zeile)
        }
        // Von Object geerbt: toString(), getClass(), hashCode() ohne `this.` davor.
        if (kontext.selbst) {
          const geerbt = this.objektStandardMethode(kontext.selbst, name, argumente)
          if (geerbt) return geerbt
        }
      }
      this.abbruch(`Die Methode \`${name}\` gibt es hier nicht.`, `cannot find symbol: method ${name}`, zeile)
    }

    // super.methode(): bewusst NICHT dynamisch binden
    if (ausdruck.ueberSuper && kontext.klasse?.oberklasse) {
      const gefunden = this.methodeFinden(kontext.klasse.oberklasse, name, argumente)
      if (gefunden) return this.methodeLaufen(gefunden.klasse, gefunden.methode, kontext.selbst, argumente, zeile)
      this.abbruch(`Die Oberklasse hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name}`, zeile)
    }

    // Klassenname davor: statischer Aufruf (Math.max, Integer.parseInt, Helfer.hilf)
    if (ausdruck.ziel.art === 'name' && !kontext.umgebung.finden(ausdruck.ziel.name)) {
      const klassenName = ausdruck.ziel.name
      const klasse = this.klassen.get(klassenName)
      if (klasse) {
        if (klasse.istEnum && (name === 'values' || name === 'valueOf')) return this.enumStatisch(klasse, name, argumente, zeile)
        const gefunden = this.methodeFinden(klasse, name, argumente)
        if (gefunden) return this.methodeLaufen(gefunden.klasse, gefunden.methode, null, argumente, zeile)
        this.abbruch(`${klassenName} hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name}`, zeile)
      }
      if (this.isBuiltIn(klassenName)) return this.statischAufrufen(klassenName, name, argumente, zeile)
    }

    const ziel = this.auswerten(ausdruck.ziel, kontext)
    return this.methodeAufrufen(ziel, name, argumente, zeile)
  }

  statischAufrufen(klasse: string, name: string, argumente: Wert[], zeile: number): Wert {
    return this.extension?.staticCall?.(klasse, name, argumente, this, zeile) ?? statischerAufruf(klasse, name, argumente, this, zeile)
  }

  /** A class that can be used without a declaration - from the standard library or an extension. */
  isBuiltIn(className: string): boolean {
    return EINGEBAUTE_KLASSEN.has(className) || Boolean(this.extension?.classes.has(className))
  }

  /**
   * Runs one specific method on an object - for libraries that find methods by
   * their annotations (this is how Spring calls `@GetMapping` methods).
   */
  invoke(owner: Klasse, method: MethodenDekl, self: JavaObjekt | null, args: Wert[]): Wert {
    return this.methodeLaufen(owner, method, self, args, method.zeile)
  }

  /** Starts a fresh step budget - a server handles many requests, and each one gets its own limit. */
  resetStepLimit() {
    this.schritte = 0
  }

  /** Methodenaufruf auf einem Wert - hier passiert die dynamische Bindung. */
  methodeAufrufen(ziel: Wert, name: string, argumente: Wert[], zeile: number): Wert {
    if (ziel.art === 'null') {
      this.werfen('NullPointerException', `Cannot invoke "${name}()" because the value is null`, zeile)
    }
    if (ziel.art === 'string') return stringMethode(ziel, name, argumente, this, zeile)
    if (ziel.art === 'nativ') return this.extension?.method?.(ziel, name, argumente, this, zeile) ?? nativMethode(ziel, name, argumente, this, zeile)
    if (ziel.art === 'funktion') {
      // Funktionale Interfaces: egal ob apply, accept, test, get, run oder compare.
      return ziel.aufrufen(argumente)
    }
    if (ziel.art === 'array') {
      if (name === 'clone') return { art: 'array', typ: ziel.typ, werte: [...ziel.werte] }
      if (name === 'equals') return wahrheit(ziel === argumente[0])
      if (name === 'toString') return neuerString(this.alsText(ziel))
    }
    if (ziel.art === 'objekt') {
      const gefunden = this.methodeFinden(ziel.klasse, name, argumente)
      if (gefunden) return this.methodeLaufen(gefunden.klasse, gefunden.methode, ziel, argumente, zeile)
      const eingebaut = this.objektStandardMethode(ziel, name, argumente)
      if (eingebaut) return eingebaut
      this.abbruch(`${ziel.klasse.name} hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name}`, zeile)
    }
    return primitivMethode(ziel, name, argumente, this, zeile)
  }

  /** toString/equals/hashCode/getClass und die enum-Methoden gibt es immer. */
  private objektStandardMethode(objekt: JavaObjekt, name: string, argumente: Wert[]): Wert | null {
    switch (name) {
      case 'toString':
        return neuerString(this.alsText(objekt))
      case 'equals':
        return wahrheit(this.recordGleich(objekt, argumente[0]))
      case 'hashCode':
        return zahl(parseInt(identitaet(objekt), 16) | 0)
      case 'getClass':
        return { art: 'nativ', typ: 'Class', daten: { text: objekt.klasse.name } }
      // Eigene Exceptions erben getMessage() von Throwable.
      case 'getMessage':
      case 'getLocalizedMessage':
        return objekt.felder.get('$meldung') ?? NULL
      case 'printStackTrace':
        this.drucken(this.ausnahmeText(objekt) + '\n', 'err')
        return NULL
      case 'name':
      case 'toUpperCase':
        if (objekt.klasse.istEnum && name === 'name') return objekt.felder.get('$name') ?? NULL
        return null
      case 'ordinal':
        if (objekt.klasse.istEnum) return objekt.felder.get('$ordinal') ?? zahl(0)
        return null
      case 'compareTo':
        if (objekt.klasse.istEnum && argumente[0]?.art === 'objekt') {
          return zahl(alsZahl(objekt.felder.get('$ordinal')!) - alsZahl(argumente[0].felder.get('$ordinal')!))
        }
        return null
      default:
        // record: die Komponenten sind gleichzeitig Getter.
        if (objekt.klasse.dekl.komponenten?.some((k) => k.name === name) && !argumente.length) {
          return objekt.felder.get(name) ?? NULL
        }
        return null
    }
  }

  private recordGleich(objekt: JavaObjekt, anderer: Wert): boolean {
    if (anderer?.art !== 'objekt' || anderer.klasse !== objekt.klasse) return false
    const komponenten = objekt.klasse.dekl.komponenten
    if (!komponenten) return objekt === anderer
    return komponenten.every((k) => inhaltGleich(objekt.felder.get(k.name) ?? NULL, anderer.felder.get(k.name) ?? NULL))
  }

  private enumStatisch(klasse: Klasse, name: string, argumente: Wert[], zeile: number): Wert {
    if (name === 'values') {
      const werte = klasse.statisch.get('$werte')
      return werte?.art === 'array' ? { art: 'array', typ: klasse.name, werte: [...werte.werte] } : NULL
    }
    const gesucht = this.alsText(argumente[0])
    const treffer = klasse.statisch.get(gesucht)
    if (!treffer) this.werfen('IllegalArgumentException', `No enum constant ${klasse.name}.${gesucht}`, zeile)
    return treffer!
  }

  /** Sucht die Methode ab `klasse` aufwärts und wählt die passende Überladung. */
  private methodeFinden(klasse: Klasse, name: string, argumente: Wert[]): { klasse: Klasse; methode: MethodenDekl } | null {
    for (let k: Klasse | undefined = klasse; k; k = k.oberklasse) {
      const kandidaten = (k.methoden.get(name) ?? []).filter((m) => m.rumpf)
      const methode = this.ueberladungWaehlen(kandidaten, argumente)
      if (methode) return { klasse: k, methode }
    }
    // default-Methoden aus Interfaces
    for (const name2 of klasse.interfaces) {
      const i = this.klassen.get(name2)
      const methode = i && this.ueberladungWaehlen((i.methoden.get(name) ?? []).filter((m) => m.rumpf), argumente)
      if (methode) return { klasse: i!, methode }
    }
    return null
  }

  private ueberladungWaehlen(kandidaten: MethodenDekl[], argumente: Wert[]): MethodenDekl | undefined {
    const passend = kandidaten.filter((m) => m.parameter.length === argumente.length)
    if (passend.length <= 1) return passend[0] ?? kandidaten.find((m) => m.parameter.at(-1)?.varargs && argumente.length >= m.parameter.length - 1)
    // Mehrere gleich lange: die mit den genauesten Typen gewinnt.
    let beste = passend[0]
    let bestePunkte = -1
    for (const m of passend) {
      const punkte = m.parameter.reduce((summe, p, i) => summe + this.passung(argumente[i], p.typ), 0)
      if (punkte > bestePunkte) {
        bestePunkte = punkte
        beste = m
      }
    }
    return beste
  }

  private passung(wert: Wert, typ: TypRef): number {
    if (!wert) return 0
    const name = typ.name
    if (typ.dimensionen > 0) return wert.art === 'array' ? 3 : 0
    if (wert.art === 'string') return name === 'String' ? 3 : name === 'Object' || name === 'CharSequence' ? 1 : 0
    if (wert.art === 'int' || wert.art === 'long') {
      return ['int', 'long', 'short', 'byte'].includes(name) ? 3 : ['double', 'float'].includes(name) ? 2 : name === 'Integer' ? 3 : name === 'Object' ? 1 : 0
    }
    if (wert.art === 'double') return ['double', 'float'].includes(name) ? 3 : name === 'Double' ? 3 : name === 'Object' ? 1 : 0
    if (wert.art === 'char') return name === 'char' ? 3 : ['int', 'long', 'double'].includes(name) ? 2 : name === 'Object' ? 1 : 0
    if (wert.art === 'boolean') return name === 'boolean' || name === 'Boolean' ? 3 : name === 'Object' ? 1 : 0
    if (wert.art === 'objekt') return this.istInstanz(wert, name) ? 3 : name === 'Object' ? 1 : 0
    if (wert.art === 'nativ') return wert.typ === name ? 3 : this.istInstanz(wert, name) ? 2 : name === 'Object' ? 1 : 0
    if (wert.art === 'null') return ['int', 'double', 'boolean', 'char', 'long'].includes(name) ? 0 : 2
    return 1
  }

  private methodeLaufen(klasse: Klasse, methode: MethodenDekl, selbst: JavaObjekt | null, argumente: Wert[], zeile: number): Wert {
    if (!methode.rumpf) {
      this.abbruch(`\`${methode.name}\` hat keinen Rumpf.`, `abstract method ${methode.name} cannot be called`, zeile)
    }
    const umgebung = new Umgebung()
    methode.parameter.forEach((p, i) => {
      if (p.varargs) {
        const rest = argumente.slice(i)
        const wert: Wert =
          rest.length === 1 && rest[0]?.art === 'array' ? rest[0] : { art: 'array', typ: p.typ.name, werte: rest }
        umgebung.deklarieren(p.name, wert, p.typ)
      } else {
        umgebung.deklarieren(p.name, this.anpassen(argumente[i] ?? NULL, p.typ), p.typ)
      }
    })
    const fluss = this.bloeckeAusfuehren(methode.rumpf.anweisungen, {
      umgebung,
      selbst: methode.statisch ? null : selbst,
      klasse,
    })
    const wert = fluss instanceof Rueckgabe ? fluss.wert : NULL
    return this.anpassen(wert, methode.rueckgabe)
  }

  // --- Objekte erzeugen -----------------------------------------------------

  neuErzeugen(klassenName: string, argumente: Wert[], zeile: number): Wert {
    const klasse = this.klassen.get(klassenName)
    if (klasse) {
      if (klasse.abstrakt) {
        this.abbruch(
          `${klassenName} ist abstrakt - davon kann es kein Objekt geben.`,
          `${klassenName} is abstract; cannot be instantiated`,
          zeile,
        )
      }
      return this.objektErzeugen(klasse, argumente, zeile)
    }
    const nativ = this.extension?.create?.(klassenName, argumente, this, zeile) ?? nativErzeugen(klassenName, argumente, this, zeile)
    if (nativ) return nativ
    this.abbruch(`Die Klasse \`${klassenName}\` ist unbekannt.`, `cannot find symbol: class ${klassenName}`, zeile)
  }

  private objektErzeugen(klasse: Klasse, argumente: Wert[], zeile: number): JavaObjekt {
    const objekt: JavaObjekt = { art: 'objekt', klasse, felder: new Map() }
    // Felder bekommen IMMER einen Standardwert - anders als lokale Variablen.
    for (let k: Klasse | undefined = klasse; k; k = k.oberklasse) {
      for (const feld of k.dekl.felder) {
        if (!feld.statisch && !objekt.felder.has(feld.name)) objekt.felder.set(feld.name, this.standardWert(feld.typ))
      }
    }
    this.konstruktorLauf(klasse, objekt, argumente, zeile, false)
    return objekt
  }

  private konstruktorLauf(klasse: Klasse, objekt: JavaObjekt, argumente: Wert[], zeile: number, ueberThis: boolean) {
    const konstruktor = this.ueberladungWaehlen(klasse.konstruktoren, argumente)
    if (!konstruktor && klasse.konstruktoren.length && argumente.length) {
      this.abbruch(
        `Kein Konstruktor von ${klasse.name} passt zu ${argumente.length} Argument(en).`,
        `constructor ${klasse.name} cannot be applied to given types`,
        zeile,
      )
    }

    const umgebung = new Umgebung()
    konstruktor?.parameter.forEach((p, i) => umgebung.deklarieren(p.name, this.anpassen(argumente[i] ?? NULL, p.typ), p.typ))
    const kontext: Kontext = { umgebung, selbst: objekt, klasse }

    const anweisungen = konstruktor?.rumpf?.anweisungen ?? []
    const erste = anweisungen[0]
    const ersterAufruf =
      erste?.art === 'ausdruck' && erste.ausdruck.art === 'aufruf' && (erste.ausdruck.name === '<superinit>' || erste.ausdruck.name === '<init>')
        ? erste.ausdruck
        : null

    let felderSetzen = !ueberThis
    if (ersterAufruf?.name === '<superinit>') {
      const superArgumente = ersterAufruf.argumente.map((a) => this.auswerten(a, kontext))
      if (klasse.oberklasse) this.konstruktorLauf(klasse.oberklasse, objekt, superArgumente, zeile, false)
      // `class MeinFehler extends RuntimeException`: die Oberklasse ist eingebaut,
      // super(meldung) muss die Nachricht trotzdem aufbewahren.
      else if (superArgumente.length && klasse.dekl.oberklasse) objekt.felder.set('$meldung', superArgumente[0])
    } else if (ersterAufruf?.name === '<init>') {
      const eigene = ersterAufruf.argumente.map((a) => this.auswerten(a, kontext))
      this.konstruktorLauf(klasse, objekt, eigene, zeile, false)
      felderSetzen = false
    } else if (klasse.oberklasse) {
      this.konstruktorLauf(klasse.oberklasse, objekt, [], zeile, false)
    }

    if (felderSetzen) {
      for (const feld of klasse.dekl.felder) {
        if (!feld.statisch && feld.init) objekt.felder.set(feld.name, this.anpassen(this.auswerten(feld.init, kontext, feld.typ), feld.typ))
      }
      // record: die Komponenten landen automatisch in den Feldern.
      if (klasse.dekl.komponenten && !konstruktor) {
        klasse.dekl.komponenten.forEach((k, i) => objekt.felder.set(k.name, this.anpassen(argumente[i] ?? NULL, k.typ)))
      }
    }

    if (konstruktor?.rumpf) {
      this.bloeckeAusfuehren(ersterAufruf ? anweisungen.slice(1) : anweisungen, kontext)
    }
  }

  private arrayErzeugen(ausdruck: Extract<Ausdruck, { art: 'neuArray' }>, kontext: Kontext): Wert {
    if (ausdruck.werte) {
      const werte = ausdruck.werte.map((w) =>
        w.art === 'arrayWerte'
          ? this.auswerten(w, kontext, { ...ausdruck.typ, dimensionen: ausdruck.typ.dimensionen - 1 })
          : this.anpassen(this.auswerten(w, kontext), { ...ausdruck.typ, dimensionen: 0 }),
      )
      return { art: 'array', typ: ausdruck.typ.name + '[]'.repeat(ausdruck.typ.dimensionen - 1), werte }
    }
    const groessen = ausdruck.groessen.map((g) => alsZahl(this.auswerten(g, kontext)))
    const bauen = (tiefe: number): Wert => {
      const laenge = groessen[tiefe]
      if (laenge < 0) this.werfen('NegativeArraySizeException', String(laenge), ausdruck.zeile)
      if (laenge > 5_000_000) throw new JavaAbbruch('Das Array ist zu groß.', 'array too large')
      const rest = ausdruck.typ.dimensionen - tiefe - 1
      const elementTyp = ausdruck.typ.name + '[]'.repeat(rest)
      const werte: Wert[] = []
      for (let i = 0; i < laenge; i++) {
        werte.push(tiefe + 1 < groessen.length ? bauen(tiefe + 1) : this.standardWert({ name: ausdruck.typ.name, dimensionen: rest, argumente: [] }))
      }
      return { art: 'array', typ: elementTyp, werte }
    }
    return bauen(0)
  }

  // --- Typen ----------------------------------------------------------------

  standardWert(typ: TypRef): Wert {
    if (typ.dimensionen > 0) return NULL
    switch (typ.name) {
      case 'int':
      case 'short':
      case 'byte':
      case 'long':
        return zahl(0)
      case 'double':
      case 'float':
        return komma(0)
      case 'boolean':
        return wahrheit(false)
      case 'char':
        return zeichen(0)
      default:
        return NULL
    }
  }

  /** Erweiternde Umwandlung: `double d = 5;` muss 5.0 ergeben. */
  anpassen(wert: Wert, typ: TypRef | undefined): Wert {
    if (!typ || typ.dimensionen > 0) return wert
    if ((typ.name === 'double' || typ.name === 'float' || typ.name === 'Double') && (wert.art === 'int' || wert.art === 'long' || wert.art === 'char')) {
      return komma(wert.wert)
    }
    if ((typ.name === 'int' || typ.name === 'long' || typ.name === 'Integer' || typ.name === 'short' || typ.name === 'byte') && wert.art === 'char') {
      return zahl(wert.wert)
    }
    if (typ.name === 'char' && wert.art === 'int') return zeichen(wert.wert)
    if (typ.name === 'String' && wert.art === 'char') return wert
    return wert
  }

  private umwandeln(wert: Wert, typ: TypRef, zeile: number): Wert {
    if (typ.dimensionen > 0) return wert
    switch (typ.name) {
      case 'int':
      case 'short':
      case 'byte':
        if (!istZahl(wert)) break
        return zahl(Math.trunc(alsZahl(wert)))
      case 'long':
        if (!istZahl(wert)) break
        return { art: 'long', wert: Math.trunc(alsZahl(wert)) }
      case 'double':
      case 'float':
        if (!istZahl(wert)) break
        return komma(alsZahl(wert))
      case 'char':
        if (!istZahl(wert)) break
        return zeichen(Math.trunc(alsZahl(wert)) & 0xffff)
      case 'boolean':
        return wahrheit(this.wahrheitswert(wert, zeile))
      case 'Object':
        return wert
    }
    if (wert.art !== 'null' && !this.istInstanz(wert, typ.name)) {
      this.werfen('ClassCastException', `class ${typName(wert)} cannot be cast to class ${typ.name}`, zeile)
    }
    return wert
  }

  /** `instanceof` und `catch`: läuft die Vererbungskette hoch. */
  istInstanz(wert: Wert, typ: string): boolean {
    if (typ === 'Object') return wert.art !== 'null'
    switch (wert.art) {
      case 'string':
        return typ === 'String' || typ === 'CharSequence' || typ === 'Comparable'
      case 'int':
      case 'long':
        return typ === 'Integer' || typ === 'Number' || typ === 'Long'
      case 'double':
        return typ === 'Double' || typ === 'Number'
      case 'boolean':
        return typ === 'Boolean'
      case 'char':
        return typ === 'Character'
      case 'funktion':
        return true
      case 'array':
        return typ.endsWith('[]') || typ === 'Object'
      case 'objekt': {
        for (let k: Klasse | undefined = wert.klasse; k; k = k.oberklasse) {
          if (k.name === typ) return true
          if (k.interfaces.has(typ)) return true
          // Eigene Exception, die von einer eingebauten erbt
          if (!k.oberklasse && k.dekl.oberklasse) {
            for (let e: string | undefined = k.dekl.oberklasse; e; e = oberklasseVon(e) ?? this.extension?.superClasses?.[e]) {
              if (e === typ) return true
            }
          }
        }
        return false
      }
      case 'nativ': {
        for (let t: string | undefined = wert.typ; t; t = oberklasseVon(t) ?? this.extension?.superClasses?.[t]) {
          if (t === typ) return true
        }
        return ['List', 'Collection', 'Iterable'].includes(typ) && ['ArrayList', 'LinkedList'].includes(wert.typ)
          ? true
          : typ === 'Map' && ['HashMap', 'TreeMap', 'LinkedHashMap'].includes(wert.typ)
            ? true
            : typ === 'Set' && ['HashSet', 'TreeSet', 'LinkedHashSet'].includes(wert.typ)
      }
      default:
        return false
    }
  }

  wahrheitswert(wert: Wert, zeile: number): boolean {
    if (wert.art === 'boolean') return wert.wert
    if (wert.art === 'null') this.werfen('NullPointerException', 'Cannot unbox null to boolean', zeile)
    this.abbruch(
      `Hier wird ein boolean gebraucht, nicht ${typName(wert)}. (In Java gibt es kein "truthy"!)`,
      `incompatible types: ${typName(wert)} cannot be converted to boolean`,
      zeile,
    )
  }

  /** Alles, was in eine for-each-Schleife darf. */
  elementeVon(wert: Wert, zeile: number): Wert[] {
    if (wert.art === 'array') return [...wert.werte]
    if (wert.art === 'nativ') {
      if (wert.daten.liste) return [...wert.daten.liste]
      if (wert.daten.map) return [...wert.daten.map.values()].map((e) => ({ art: 'nativ' as const, typ: 'Entry', daten: { liste: [e.schluessel, e.wert] } }))
    }
    if (wert.art === 'null') this.werfen('NullPointerException', 'Cannot iterate over null', zeile)
    this.abbruch(`Über ${typName(wert)} kann man nicht iterieren.`, `for-each not applicable to expression type ${typName(wert)}`, zeile)
  }

  // --- String-Darstellung ---------------------------------------------------

  /** `String.valueOf(wert)` inklusive eigener toString()-Methoden. */
  alsText(wert: Wert): string {
    return textVon(wert, (objekt) => {
      if (objekt.art === 'objekt') {
        const eigene = this.methodeFinden(objekt.klasse, 'toString', [])
        if (eigene) return this.alsText(this.methodeLaufen(eigene.klasse, eigene.methode, objekt, [], 0))
        if (objekt.klasse.istEnum) return this.alsText(objekt.felder.get('$name') ?? NULL)
        if (objekt.klasse.dekl.komponenten) {
          const teile = objekt.klasse.dekl.komponenten.map((k) => `${k.name}=${this.alsText(objekt.felder.get(k.name) ?? NULL)}`)
          return `${objekt.klasse.name}[${teile.join(', ')}]`
        }
        return `${objekt.klasse.name}@${identitaet(objekt)}`
      }
      return this.nativText(objekt)
    })
  }

  private nativText(wert: NativWert): string {
    const own = this.extension?.text?.(wert, this)
    if (own !== undefined) return own
    const { liste, map, text, meldung } = wert.daten
    if (wert.typ === 'StringBuilder') return text ?? ''
    if (wert.typ === 'Class') return 'class ' + text
    if (wert.typ === 'Entry' && liste) return `${this.alsText(liste[0])}=${this.alsText(liste[1])}`
    if (map) return `{${[...map.values()].map((e) => `${this.alsText(e.schluessel)}=${this.alsText(e.wert)}`).join(', ')}}`
    if (liste) return `[${liste.map((w) => this.alsText(w)).join(', ')}]`
    if (istAusnahmeKlasse(wert.typ)) return meldung ? `${wert.typ}: ${meldung}` : wert.typ
    return `${wert.typ}@${identitaet(wert)}`
  }

  /** Wie Java eine Exception beim Absturz meldet. */
  ausnahmeText(wert: Wert): string {
    if (wert.art === 'nativ') {
      const name = (this.extension?.packageOf?.(wert.typ) ?? 'java.lang') + '.' + wert.typ
      return wert.daten.meldung ? `${name}: ${wert.daten.meldung}` : name
    }
    if (wert.art === 'objekt') {
      const meldung = this.methodeAufrufen(wert, 'getMessage', [], 0)
      const text = meldung.art === 'null' ? '' : this.alsText(meldung)
      return text ? `${wert.klasse.name}: ${text}` : wert.klasse.name
    }
    return this.alsText(wert)
  }

  // --- Fehler werfen --------------------------------------------------------

  /** Throws any Java value as an exception - e.g. the one an `orElseThrow` supplier created. */
  throwValue(value: Wert, line: number): never {
    throw new JavaAusnahme(value, line)
  }

  /** Wirft eine eingebaute Exception (fangbar). */
  werfen(klasse: string, meldung: string | null, zeile: number): never {
    throw new JavaAusnahme({ art: 'nativ', typ: klasse, daten: { meldung: meldung ?? undefined } }, zeile)
  }

  /** Bricht ab: ein Fehler, den echtes Java schon beim Kompilieren finden würde. */
  abbruch(deutsch: string, englisch: string, zeile?: number): never {
    throw new JavaAbbruch(deutsch, englisch, zeile)
  }

  // Kleine Helfer, die die Bibliothek braucht ---------------------------------
  zahlText = (v: number, kommazahl: boolean) => (kommazahl ? doubleText(v) : String(Math.trunc(v)))
  schluessel = schluesselVon
  feldDeklarationen(klasse: Klasse): FeldDekl[] {
    return klasse.dekl.felder
  }
}
