import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Generics.code'

/**
 * KAPITEL 2.5 - Generics
 * Typparameter: wiederverwendbare Funktionen und Typen, die trotzdem genaue Typen behalten.
 */
export function Generics() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Manche Funktionen funktionieren mit jedem Typ - etwa „gib das erste Element zurück“. Mit{' '}
          <Code>any</Code> ginge die Information verloren, welcher Typ herauskommt. Ein{' '}
          <strong>Typparameter</strong> <Code>{'<T>'}</Code> ist ein Platzhalter, den TypeScript bei jedem
          Aufruf neu ausfüllt.
        </P>
        <TryIt id="ts-generics-einstieg" modus="ts" {...beispiele['ts-generics-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Generische Funktionen">
        <P>
          Typparameter stehen in spitzen Klammern hinter dem Funktionsnamen, es dürfen auch mehrere sein.
          Meist leitet TypeScript sie aus den Argumenten ab - du kannst sie aber auch ausdrücklich angeben:{' '}
          <Code>{"pair<string, boolean>('ok', true)"}</Code>.
        </P>
        <TryIt id="ts-generics-funktionen" modus="ts" {...beispiele['ts-generics-funktionen']} />
        <Hinweis variante="info">
          Die Namen <Code>T</Code>, <Code>U</Code>, <Code>K</Code> (Key) und <Code>V</Code> (Value) sind
          nur Konvention. Bei komplizierteren Typen helfen sprechende Namen wie <Code>TItem</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Einschränken mit extends">
        <P>
          Ohne Einschränkung weiß TypeScript über <Code>T</Code> gar nichts - du dürftest nicht einmal{' '}
          <Code>.length</Code> lesen. Mit <Code>{'T extends { length: number }'}</Code> erlaubst du nur
          Typen, die mindestens diese Form haben. Anders als ein fester Parametertyp behält <Code>T</Code>{' '}
          dabei alle übrigen Felder.
        </P>
        <TryIt id="ts-generics-constraints" modus="ts" {...beispiele['ts-generics-constraints']} />
      </Abschnitt>

      <Abschnitt titel="keyof und Indexzugriff">
        <P>
          <Code>keyof T</Code> ist die Union aller Schlüssel eines Typs, <Code>T[K]</Code> der Typ des
          Feldes <Code>K</Code>. Zusammen mit Generics entstehen Funktionen, die nur gültige Schlüssel
          annehmen und den passenden Typ zurückgeben - mehr zu beiden Operatoren in <Verweis nr="2.6" />.
        </P>
        <TryIt id="ts-generics-keyof" modus="ts" {...beispiele['ts-generics-keyof']} />
      </Abschnitt>

      <Abschnitt titel="Generische Typen">
        <P>
          Auch Typen können Parameter haben - ideal für Hüllen um beliebige Daten, etwa eine API-Antwort.
          Viele generische Typen kennst du schon: <Code>{'Array<T>'}</Code>, <Code>{'Promise<T>'}</Code>,{' '}
          <Code>{'Map<K, V>'}</Code>, <Code>{'Set<T>'}</Code>.
        </P>
        <TryIt id="ts-generics-typen" modus="ts" {...beispiele['ts-generics-typen']} />
      </Abschnitt>

      <Abschnitt titel="Generische Klassen">
        <P>
          Eine Klasse mit Typparameter legt den Typ beim Erzeugen fest:{' '}
          <Code>{'new Stack<number>()'}</Code>. Danach passen nur noch Zahlen hinein - und heraus kommen
          garantiert Zahlen.
        </P>
        <TryIt id="ts-generics-klassen" modus="ts" {...beispiele['ts-generics-klassen']} />
      </Abschnitt>

      <Abschnitt titel="Wann lohnen sich Generics?">
        <P>
          Ein Typparameter lohnt sich, wenn er etwas <strong>verbindet</strong> - typischerweise Eingabe und
          Ausgabe. Taucht er nur an einer Stelle auf, reicht meist ein normaler Typ wie{' '}
          <Code>unknown</Code>.
        </P>
        <CodeBlock code={codeBloecke.wann} />
        <CodeBlock titel="Generics in React" code={codeBloecke.react} />
        <Liste>
          <li>
            <Code>{'useState<Todo[]>([])'}</Code>: Aus einem leeren Array kann TypeScript den Typ nicht
            ableiten - deshalb gibst du ihn an.
          </li>
          <li>Generische Komponenten funktionieren genau wie generische Funktionen.</li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="ts-generics-uebung"
          modus="ts"
          {...beispiele['ts-generics-uebung']}
          aufgabe={
            <>
              <p>
                Die drei Hilfsfunktionen laufen schon - aber mit <Code>any</Code> geht jeder Typ verloren.
                Ersetze alle <Code>any</Code> durch Typparameter:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>last</Code> liefert den Elementtyp oder <Code>undefined</Code>
                </li>
                <li>
                  <Code>groupBy</Code> kennt im Callback den Typ der Elemente
                </li>
                <li>
                  <Code>pluck</Code> nimmt nur vorhandene Schlüssel und liefert ein Array vom Typ dieses Feldes
                </li>
              </ul>
              <p className="mt-1">Die Typ-Tests prüfen, dass die Typen genau genug sind.</p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'function first<T>(list: T[]): T | undefined. Welchen Typ hat first(["a", "b"])?',
            antworten: ['any', 'string | undefined', 'T'],
            richtig: 1,
            erklaerung: 'TypeScript setzt für T den Typ string ein, den es aus dem Argument ableitet.',
          },
          {
            frage: 'Was bewirkt <T extends { id: number }>?',
            antworten: ['T ist genau { id: number }', 'T muss mindestens ein Feld id: number haben und behält seine anderen Felder', 'T darf kein id haben'],
            richtig: 1,
            erklaerung: 'extends ist eine Mindestanforderung. Übergibst du { id: 1, title: "x" }, bleibt title im Typ erhalten.',
          },
          {
            frage: 'type User = { name: string; age: number }. Was ist keyof User?',
            antworten: ['"name" | "age"', 'string | number', 'string[]'],
            richtig: 0,
            erklaerung: 'keyof liefert die Union der Schlüssel. Die Typen der Werte bekommst du mit User[keyof User].',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Typparameter: <Code>{'function first<T>(list: T[]): T | undefined'}</Code> - wird bei jedem Aufruf
            ausgefüllt.
          </>,
          <>
            Einschränken mit <Code>{'<T extends { length: number }>'}</Code>.
          </>,
          <>
            <Code>{'<T, K extends keyof T>'}</Code> und <Code>T[K]</Code> für typsicheren Feldzugriff.
          </>,
          <>
            Generische Typen: <Code>{'type ApiResponse<T> = { data: T }'}</Code>, Klassen:{' '}
            <Code>{'class Stack<T>'}</Code>.
          </>,
          'Generics statt any - sie verbinden Eingabe und Ausgabe.',
        ]}
      />
    </>
  )
}
