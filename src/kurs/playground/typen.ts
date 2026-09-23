import type { Zweisprachig } from '../../i18n/SpracheContext'

/**
 * Datenmodell der Playgrounds - ein Playground pro Kursteil.
 *
 * Ein Baustein ist ein Stück Code, das man per Klick einfügt. Hat man vorher in den
 * Editor geklickt, landet er am Cursor. Sonst sucht `ort` die passende Stelle
 * (siehe orte.ts) - so entsteht auch ohne Vorwissen über den Aufbau lauffähiger Code.
 */

export type Ort =
  /** JavaScript und TypeScript: einfach unten anhängen. */
  | 'ende'
  /** React: auf oberster Ebene, vor `function App`. */
  | 'oben'
  /** React: im Rumpf von App, vor dem `return`. */
  | 'komponente'
  /** React: im JSX von App, vor dem schließenden Tag. */
  | 'jsx'
  /** Java: am Ende von `main`. */
  | 'main'
  /** Java: als Methode in der Klasse Main, vor `main`. */
  | 'methode'
  /** Java: als eigene Klasse unter Main. */
  | 'klasse'

export type Baustein = {
  titel: Zweisprachig
  info: Zweisprachig
  /** Immer Englisch, wie alle Codebeispiele im Kurs. `$0` = Cursor danach. */
  code: string
  ort: Ort
  /**
   * Zweiter Teil, der gleich mit eingefügt wird: z. B. `<Counter />` ins JSX
   * oder der Aufruf einer Methode in `main`. Dieser Teil landet am Cursor, falls gesetzt.
   */
  nutzung?: { ort: Ort; code: string }
  /** Import-Zeilen, die oben ergänzt werden, falls sie noch fehlen (z. B. `import java.util.ArrayList;`). */
  importe?: string[]
  /** Kapitel, in dem das erklärt wird. */
  kapitel?: string
}

export type BausteinGruppe = { titel: Zweisprachig; bausteine: Baustein[] }

/** Ein komplettes Programm zum Loslegen - ersetzt den ganzen Code. */
export type Vorlage = { titel: Zweisprachig; info: Zweisprachig; code: string }

export type PlaygroundDaten = {
  /** id des Kursteils (kurs.ts), steht auch in der URL: #/playground/<teil> */
  teil: string
  modus: 'js' | 'ts' | 'react' | 'java' | 'spring' | 'sql'
  /** Startcode - die erste Vorlage. */
  vorlagen: Vorlage[]
  gruppen: BausteinGruppe[]
  /** Kurzer Hinweis über dem Editor (z. B. was es hier nicht gibt). */
  hinweis?: Zweisprachig
}
