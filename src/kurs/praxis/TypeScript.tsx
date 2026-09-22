import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './TypeScript.code'

/**
 * KAPITEL 5.6 - TypeScript mit React
 *
 * Alle Editoren hier laufen mit `typen`: Neben der Vorschau prüft der echte
 * TypeScript-Compiler den Code und unterschlängelt Fehler.
 */

const ereignisse: [string, string][] = [
  ['onChange (input)', 'ChangeEvent<HTMLInputElement>'],
  ['onChange (select)', 'ChangeEvent<HTMLSelectElement>'],
  ['onSubmit', 'SubmitEvent<HTMLFormElement>'],
  ['onClick', 'MouseEvent<HTMLButtonElement>'],
  ['onKeyDown', 'KeyboardEvent<HTMLInputElement>'],
]

const hilfstypen: [string, string][] = [
  ['Partial<T>', 'Alle Felder optional - z. B. für Änderungen'],
  ['Pick<T, "a" | "b">', 'Nur die genannten Felder'],
  ['Omit<T, "id">', 'Alle Felder außer den genannten'],
  ['Record<K, V>', 'Objekt mit Schlüsseln vom Typ K und Werten vom Typ V'],
  ['keyof T', 'Die Feldnamen als Union: "id" | "name" | …'],
  ['ReturnType<typeof f>', 'Der Rückgabetyp einer Funktion'],
]

/** Zeilen dieser beiden Übersichten: links immer Code, rechts wahlweise. */
const codeZeilen = (zeilen: [string, string][], codeRechts = false) =>
  zeilen.map(([a, b]) => [<Code key={a}>{a}</Code>, codeRechts ? <Code key={b}>{b}</Code> : b])

export function TypeScriptKapitel() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Eine Komponente mit typisierten Props. Ändere <Code>count={'{3}'}</Code> in <Code>count="3"</Code> - die
          Typprüfung unter dem Editor meldet den Fehler, bevor irgendjemand die App benutzt.
        </P>
        <TryIt id="praxis-typescript-einstieg" {...beispiele['praxis-typescript-einstieg']} modus="react" typen />
        <Hinweis variante="tipp">
          Dieses Kapitel zeigt TypeScript <strong>in React</strong>. Die Sprache selbst - Objekttypen, Unions,
          Generics, Utility Types - lernst du ausführlich in Teil 2, beginnend mit <Verweis id="ts-start" />.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Warum TypeScript?">
        <P>
          TypeScript ist JavaScript mit Typen. Du schreibst dazu, welche Art von Wert eine Variable, ein Parameter
          oder eine Prop haben darf - und der Editor prüft das beim Tippen. Fast alle neuen React-Projekte nutzen
          es, auch diese Lern-App.
        </P>
        <Liste>
          <li>
            <strong>Fehler beim Tippen statt beim Nutzer:</strong> Tippfehler in Prop-Namen, vergessene{' '}
            <Code>null</Code>-Prüfungen, falsche Argumente - alles rot unterschlängelt.
          </li>
          <li>
            <strong>Autovervollständigung:</strong> Der Editor kennt die Felder jedes Objekts und die Props jeder
            Komponente.
          </li>
          <li>
            <strong>Sicheres Umbauen:</strong> Benennst du ein Feld um, zeigt dir der Compiler jede Stelle, die du
            anpassen musst.
          </li>
          <li>
            <strong>Doku, die nicht veraltet:</strong> Der Props-Typ sagt, wie man eine Komponente benutzt.
          </li>
        </Liste>
        <Hinweis variante="info">
          Wichtig zu wissen: Im Browser läuft nie TypeScript. Vite (und der Editor hier) entfernen die Typen beim
          Übersetzen nur - geprüft wird <em>zusätzlich</em>, vom Editor und von <Code>tsc</Code>. Deshalb läuft die
          Vorschau hier auch bei Typfehlern weiter. Die Typen ändern nichts daran, was der Code tut.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die wichtigsten Typen">
        <P>
          Die Grundtypen kennst du schon aus <Verweis id="js-variablen" />: <Code>string</Code>,{' '}
          <Code>number</Code>, <Code>boolean</Code>. Dazu kommen Arrays (<Code>string[]</Code>), Objekttypen mit{' '}
          <Code>type</Code> und <strong>Union-Typen</strong> mit <Code>|</Code> - „das eine oder das andere“.
          Besonders nützlich sind Unions aus festen Werten wie <Code>'all' | 'open' | 'done'</Code>.
        </P>
        <TryIt id="praxis-typescript-grundlagen" {...beispiele['praxis-typescript-grundlagen']} modus="react" typen />
        <P>
          Du musst nicht alles annotieren. TypeScript <strong>leitet Typen ab</strong> (Inferenz):{' '}
          <Code>let attempts = 0</Code> ist automatisch eine <Code>number</Code>. Typen schreibst du vor allem an
          die Grenzen: Funktionsparameter, Props und Startwerte, aus denen sich nichts ablesen lässt (
          <Code>[]</Code>, <Code>null</Code>).
        </P>
      </Abschnitt>

      <Abschnitt titel="Props typisieren">
        <P>
          Props sind ein Objekt - also beschreibst du sie mit einem Objekttyp. Optionale Props bekommen ein{' '}
          <Code>?</Code> und einen Standardwert beim Destructuring. Für <Code>children</Code> nimmst du{' '}
          <Code>ReactNode</Code>: alles, was React rendern kann (<Verweis id="react-props" />).
        </P>
        <TryIt id="praxis-typescript-props" {...beispiele['praxis-typescript-props']} modus="react" typen />
        <Liste>
          <li>
            <Code>ComponentProps&lt;'button'&gt;</Code> liefert alle Props eines echten <Code>{'<button>'}</Code>{' '}
            (<Code>type</Code>, <Code>onClick</Code>, <Code>disabled</Code>, …). Mit <Code>&amp;</Code> kombiniert
            entsteht eine eigene Komponente, die sich wie das HTML-Element benutzen lässt.
          </li>
          <li>
            <Code>type</Code> oder <Code>interface</Code>? Für Props funktionieren beide. Bleib im Projekt bei einem -
            diese App nutzt <Code>type</Code>, weil es auch Unions kann.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="State, Refs und Events">
        <P>
          <Code>useState('')</Code> braucht keinen Typ, TypeScript sieht den Startwert. Anders bei{' '}
          <Code>null</Code> oder <Code>[]</Code>: Daraus lässt sich nicht ablesen, was später hineinkommt. Dann gibst
          du den Typ in spitzen Klammern an: <Code>useState&lt;User | null&gt;(null)</Code>. Refs auf DOM-Elemente
          bekommen den Elementtyp (<Verweis id="hooks-useref" />).
        </P>
        <TryIt id="praxis-typescript-state" {...beispiele['praxis-typescript-state']} modus="react" typen />
        <P>
          Nach <Code>if (user)</Code> oder <Code>user ? … : …</Code> weiß TypeScript, dass <Code>user</Code> nicht{' '}
          <Code>null</Code> ist. Das heißt <strong>Narrowing</strong> - und genau diese vergessenen Prüfungen sind in
          JavaScript eine der häufigsten Absturzursachen.
        </P>
        <P>
          Schreibst du Handler direkt ins JSX (<Code>{'onChange={(e) => …}'}</Code>), kennt TypeScript den Typ von{' '}
          <Code>e</Code> von selbst. Nur ausgelagerte Handler brauchen eine Annotation:
        </P>
        <Tabelle dicht spalten={['align-top']} kopf={['Event', 'Typ (aus react)']} zeilen={codeZeilen(ereignisse, true)} />
        <Hinweis variante="tipp">
          Den Typ musst du nicht auswendig wissen: Fahre in VS Code mit der Maus über <Code>onChange</Code> - der
          Tooltip zeigt ihn an.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Reducer mit Discriminated Unions">
        <P>
          Für Reducer (<Verweis id="hooks-usereducer" />) spielt TypeScript seine größte Stärke aus. Jede Action ist
          ein eigener Objekttyp mit einem festen <Code>type</Code>, alle zusammen eine Union. Im <Code>switch</Code>{' '}
          weiß TypeScript dann in jedem <Code>case</Code>, welche Felder die Action hat.
        </P>
        <TryIt id="praxis-typescript-reducer" {...beispiele['praxis-typescript-reducer']} modus="react" typen />
        <P>
          Der <Code>default</Code>-Zweig mit <Code>never</Code> ist eine Absicherung: Ergänze oben die Action{' '}
          <Code>{"| { type: 'removed'; id: number }"}</Code> - sofort meldet die Typprüfung, dass der Reducer sie
          noch nicht behandelt. So vergisst du bei wachsenden Apps keinen Fall.
        </P>
      </Abschnitt>

      <Abschnitt titel="Context typisieren">
        <P>
          <Code>createContext</Code> braucht einen Typ, weil der Startwert meist <Code>null</Code> ist. Das
          Profi-Muster aus <Verweis id="hooks-usecontext" /> wird mit TypeScript noch besser: Der eigene Hook prüft
          einmal auf <Code>null</Code> - alle Aufrufer bekommen danach einen sauberen Typ ohne <Code>null</Code>.
        </P>
        <TryIt id="praxis-typescript-context" {...beispiele['praxis-typescript-context']} modus="react" typen />
      </Abschnitt>

      <Abschnitt titel="Generische Komponenten">
        <P>
          Manche Komponenten funktionieren mit beliebigen Daten, etwa eine Liste oder Tabelle. Mit einem{' '}
          <strong>Typparameter</strong> <Code>&lt;T&gt;</Code> bleibt trotzdem alles typsicher: TypeScript setzt{' '}
          <Code>T</Code> bei jeder Verwendung aus den übergebenen <Code>items</Code> ein.
        </P>
        <TryIt id="praxis-typescript-generisch" {...beispiele['praxis-typescript-generisch']} modus="react" typen />
      </Abschnitt>

      <Abschnitt titel="Typen aus Typen und Daten von außen">
        <P>
          Statt ähnliche Typen mehrfach zu schreiben, leitest du sie ab. Die wichtigsten Hilfstypen:
        </P>
        <Tabelle dicht spalten={['align-top']} kopf={['Hilfstyp', 'Ergebnis']} zeilen={codeZeilen(hilfstypen)} />
        <P>
          Daten von außen - aus <Code>JSON.parse</Code>, <Code>fetch</Code> oder <Code>localStorage</Code> - kennt
          TypeScript nicht. Gib ihnen den Typ <Code>unknown</Code> und prüfe sie, bevor du sie benutzt. Eine
          Funktion mit dem Rückgabetyp <Code>value is Customer</Code> (ein <strong>Type Guard</strong>) teilt
          TypeScript das Ergebnis der Prüfung mit.
        </P>
        <TryIt id="praxis-typescript-typen" {...beispiele['praxis-typescript-typen']} modus="react" typen />
        <Hinweis variante="warnung">
          <Code>any</Code> schaltet die Prüfung ab - ein <Code>any</Code> steckt still alles an, was damit in Berührung
          kommt. <Code>unknown</Code> ist die sichere Variante: erlaubt alles, benutzt werden darf es erst nach
          einer Prüfung. Auch <Code>as Customer</Code> prüft nichts, es behauptet nur.
        </Hinweis>
        <Hinweis variante="tipp">
          Type Guards von Hand werden schnell lang. In echten Projekten beschreibt man die Form der Daten mit{' '}
          <strong>Zod</strong> oder <strong>Valibot</strong>: Das Schema prüft zur Laufzeit und liefert gleichzeitig
          den TypeScript-Typ.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="TypeScript im eigenen Projekt">
        <P>
          Vite bringt eine fertige Vorlage mit (mehr dazu in <Verweis id="praxis-lokal" />):
        </P>
        <CodeBlock titel="Terminal" code={codeBloecke.anlegen} />
        <P>
          Die Einstellungen stehen in der <Code>tsconfig.json</Code>. Die wichtigste ist <Code>strict</Code> - ohne
          sie fehlen genau die Prüfungen, die am meisten Fehler finden:
        </P>
        <CodeBlock titel="tsconfig.json (Auszug)" code={codeBloecke.tsconfig} />
        <CodeBlock titel="Terminal" code={codeBloecke.pruefen} />
        <Hinweis variante="tipp">
          Aus JavaScript umsteigen geht schrittweise: Datei für Datei von <Code>.jsx</Code> in <Code>.tsx</Code>{' '}
          umbenennen und die Fehler beheben, die der Compiler meldet. Genau das übst du jetzt.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="praxis-typescript-uebung"
          {...beispiele['praxis-typescript-uebung']}
          modus="react"
          typen
          aufgabe={
            <>
              <p>Der Warenkorb funktioniert, ist aber noch reines JavaScript. Mach die Typprüfung grün:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Lege die Typen <Code>Product</Code> und <Code>CartItem</Code> (Produkt + Menge) an und nutze sie.
                </li>
                <li>
                  Gib dem State einen Typ: <Code>useState&lt;…&gt;([])</Code>.
                </li>
                <li>Typisiere die Parameter von <Code>formatPrice</Code>, <Code>add</Code> und <Code>remove</Code> und die Props von <Code>CartLine</Code>.</li>
                <li>Das Verhalten bleibt gleich. „Keine Typfehler“ ist einer der Tests.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was passiert mit den Typen, wenn Vite die App baut?',
            antworten: [
              'Sie werden in Laufzeit-Prüfungen übersetzt',
              'Sie werden entfernt - geprüft wird separat von tsc bzw. dem Editor',
              'Der Browser prüft sie beim Laden',
            ],
            richtig: 1,
            erklaerung: 'Im Browser kommt reines JavaScript an. Deshalb gehört tsc -b in den Build.',
          },
          {
            frage: 'Wann brauchst du bei useState einen Typ in spitzen Klammern?',
            antworten: [
              'Immer',
              'Wenn sich der Typ nicht aus dem Startwert ablesen lässt, z. B. bei null oder []',
              'Nur bei Objekten',
            ],
            richtig: 1,
            erklaerung: "useState('') ist automatisch string - useState<User | null>(null) muss man angeben.",
          },
          {
            frage: 'Wozu dient der never-Zweig im Reducer?',
            antworten: [
              'Er fängt Laufzeitfehler ab',
              'Er meldet zur Übersetzungszeit, wenn eine Action im switch fehlt',
              'Er macht den Reducer schneller',
            ],
            richtig: 1,
            erklaerung: 'Sind alle Fälle behandelt, bleibt für action nur never übrig - sonst gibt es einen Typfehler.',
          },
          {
            frage: 'Welchen Typ gibst du Daten aus JSON.parse, bevor du sie geprüft hast?',
            antworten: ['any', 'unknown', 'object'],
            richtig: 1,
            erklaerung: 'unknown zwingt zur Prüfung. any würde jede Prüfung abschalten.',
          },
        ]}
      />

      <Merke
        punkte={[
          'TypeScript prüft beim Entwickeln - im Browser läuft reines JavaScript.',
          <>
            Props als Objekttyp, <Code>children: ReactNode</Code>, optionale Props mit <Code>?</Code>.
          </>,
          <>
            Typen nur, wo sie sich nicht ableiten lassen: Parameter, <Code>useState&lt;T | null&gt;(null)</Code>,{' '}
            <Code>useRef&lt;HTMLInputElement&gt;(null)</Code>.
          </>,
          'Actions als Discriminated Union, Context mit null-Prüfung im eigenen Hook.',
          <>
            Daten von außen sind <Code>unknown</Code> - erst prüfen, dann benutzen. <Code>strict</Code> immer an.
          </>,
        ]}
      />
    </>
  )
}
