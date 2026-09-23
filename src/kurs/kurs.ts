import { javascriptTeil } from './teile/javascript'
import { typescriptTeil } from './teile/typescript'
import { reactTeil } from './teile/react'
import { hooksTeil } from './teile/hooks'
import { praxisTeil } from './teile/praxis'
import { projektTeil } from './teile/projekt'
import { javaTeil } from './teile/java'
import { backendTeil } from './teile/backend'
import { sqlTeil } from './teile/sql'
import type { Bereich, Kapitel, Teil } from './teile/typen'

export type { Bereich, Kapitel, Teil } from './teile/typen'

/**
 * Die Kursstruktur als Daten - in beiden Sprachen.
 *
 * Komponenten sind in React ganz normale Werte - man kann sie in einem Array
 * speichern und später als <Inhalt /> rendern. Navigation, Startseite und
 * Kapitelseite werden komplett aus dieser Liste erzeugt.
 *
 * Each part lives in its own file under src/kurs/teile/ (chapters, learning goals, search
 * keywords). Every chapter has one file per language:
 *   src/kurs/<teil>/Name.tsx     Deutsch
 *   src/kurs/<teil>/Name.en.tsx  Englisch (mit englischen Namen im Code)
 * Die interaktiven TypeScript-Demos teilen sich beide unter src/kurs/demos/.
 */

/** Reihenfolge der Bereiche in Seitenleiste und Startseite. */
export const BEREICHE: Bereich[] = ['frontend', 'backend']

/** The parts in course order - numbering and navigation follow this list. */
export const kurs: Teil[] = [javascriptTeil, typescriptTeil, reactTeil, hooksTeil, praxisTeil, projektTeil, javaTeil, backendTeil, sqlTeil]

/**
 * Der rote Faden: was ein Kapitel voraussetzt. Steht hier gesammelt statt in jedem
 * Kapitel, damit man die Abhängigkeiten auf einen Blick sieht.
 */
const GRUNDLAGEN: Record<string, string[]> = {
  'js-kontrollfluss': ['js-variablen'],
  'js-funktionen': ['js-kontrollfluss'],
  'js-arrays': ['js-funktionen'],
  'js-objekte': ['js-arrays'],
  'js-referenzen': ['js-objekte', 'js-arrays'],
  'js-async': ['js-funktionen'],
  'js-fehler': ['js-funktionen', 'js-objekte'],
  'js-dom': ['js-funktionen', 'js-objekte'],
  // Teil 2 baut direkt auf JavaScript auf. React (Teil 3) setzt ihn nicht voraus - erst das TypeScript-Kapitel in Teil 5.
  'ts-start': ['js-variablen', 'js-funktionen'],
  'ts-objekte': ['ts-start', 'js-objekte'],
  'ts-funktionen': ['ts-objekte', 'js-funktionen'],
  'ts-unions': ['ts-funktionen', 'js-kontrollfluss'],
  'ts-generics': ['ts-unions', 'js-arrays'],
  'ts-utility': ['ts-generics'],
  'ts-klassen': ['ts-objekte', 'js-fehler'],
  'ts-fortgeschritten': ['ts-utility', 'js-async'],
  'react-komponenten': ['js-dom', 'js-funktionen'],
  'react-props': ['react-komponenten', 'js-objekte', 'js-arrays'],
  'react-state': ['react-props', 'js-funktionen'],
  'react-datenfluss': ['react-state'],
  'hooks-usestate': ['react-state', 'js-referenzen'],
  'hooks-useeffect': ['hooks-usestate', 'js-async'],
  'hooks-useref': ['hooks-useeffect'],
  'hooks-usememo': ['hooks-usestate', 'js-referenzen'],
  'hooks-usereducer': ['hooks-usestate', 'js-kontrollfluss'],
  'hooks-usecontext': ['react-datenfluss', 'hooks-usememo'],
  'hooks-eigene': ['hooks-useeffect', 'js-funktionen'],
  'hooks-nebenlaeufig': ['hooks-usememo'],
  'hooks-react19': ['hooks-nebenlaeufig', 'js-async'],
  'praxis-formulare': ['react-state', 'hooks-usestate'],
  'praxis-daten': ['hooks-useeffect', 'js-async'],
  'praxis-komposition': ['react-props'],
  'praxis-fehler': ['react-komponenten', 'js-async'],
  'praxis-tailwind': ['react-komponenten'],
  'praxis-typescript': ['react-props', 'hooks-usereducer', 'hooks-usecontext', 'ts-unions', 'ts-generics'],
  'praxis-routing': ['react-props', 'react-datenfluss', 'praxis-komposition', 'praxis-daten'],
  'praxis-testen': ['react-state', 'praxis-formulare', 'praxis-daten', 'js-async'],
  'praxis-barrierefreiheit': ['praxis-formulare', 'praxis-testen', 'hooks-useref'],
  'praxis-lokal': ['react-komponenten', 'hooks-useeffect'],
  'praxis-projekt': ['hooks-usereducer', 'hooks-eigene', 'hooks-useeffect'],
  'praxis-business': ['hooks-usecontext', 'hooks-usereducer', 'praxis-formulare', 'praxis-komposition'],
  // Teil 7 steht für sich: Java braucht kein React. Die Verweise auf den
  // JavaScript-Teil sind Vergleichspunkte, keine Voraussetzungen.
  'java-variablen': ['java-start'],
  'java-kontrollfluss': ['java-variablen'],
  'java-methoden': ['java-kontrollfluss'],
  'java-arrays': ['java-variablen', 'java-kontrollfluss'],
  'java-klassen': ['java-methoden'],
  'java-vererbung': ['java-klassen'],
  'java-collections': ['java-klassen', 'java-arrays'],
  'java-fehler': ['java-klassen'],
  'java-vergleich': ['java-collections', 'js-arrays', 'react-komponenten'],
  // Part 8: Spring builds on the Java part; the Docker chapters on the Spring backend they package.
  'spring-start': ['java-klassen', 'java-collections', 'praxis-daten'],
  'spring-beans': ['spring-start', 'java-vererbung'],
  'spring-rest': ['spring-beans', 'java-collections'],
  'spring-fehler': ['spring-rest', 'java-fehler'],
  'spring-daten': ['spring-rest'],
  'spring-konfig': ['spring-beans', 'spring-daten'],
  'spring-react': ['spring-rest', 'praxis-daten', 'hooks-useeffect'],
  'docker-start': ['praxis-lokal'],
  'docker-dockerfile': ['docker-start', 'spring-start'],
  'docker-compose': ['docker-dockerfile', 'spring-daten', 'spring-konfig', 'spring-react'],
  // Part 9 stands on its own like Java: SQL needs no programming language.
  'sql-where': ['sql-start'],
  'sql-gruppieren': ['sql-where'],
  'sql-joins': ['sql-gruppieren'],
  'sql-aendern': ['sql-where'],
  'sql-tabellen': ['sql-joins', 'sql-aendern'],
  'sql-profi': ['sql-joins', 'sql-gruppieren'],
}

export type KapitelMitTeil = Kapitel & { teil: Teil; nummer: string; grundlagen: string[]; stichworte: string[] }

/** Flache Liste aller Kapitel mit Nummer ("1.3") und Verweis auf ihren Teil. */
export const alleKapitel: KapitelMitTeil[] = kurs.flatMap((teil) =>
  teil.kapitel.map((k, i) => ({
    ...k,
    teil,
    nummer: `${teil.nummer}.${i + 1}`,
    grundlagen: k.grundlagen ?? GRUNDLAGEN[k.id] ?? [],
    stichworte: k.stichworte ?? [],
  })),
)

/** Umkehrung des roten Fadens: welche Kapitel bauen auf diesem auf? */
export function aufbauendAuf(id: string) {
  return alleKapitel.filter((k) => k.grundlagen.includes(id))
}
