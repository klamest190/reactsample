import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Objekte.code'

/**
 * KAPITEL 2.2 - Objekttypen & Interfaces
 * Die Form von Objekten beschreiben - die Grundlage für Props, State und API-Daten.
 */
export function Objekte() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Ein Objekttyp listet auf, welche Felder ein Objekt hat und welchen Typ jedes Feld hat. Mit{' '}
          <Code>?</Code> wird ein Feld optional, mit <Code>readonly</Code> unveränderlich.
        </P>
        <TryIt id="ts-objekte-einstieg" modus="ts" {...beispiele['ts-objekte-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="type oder interface?">
        <P>
          Für Objekte gibt es zwei Schreibweisen, die fast gleich funktionieren. Ein{' '}
          <Code>interface</Code> wird mit <Code>extends</Code> erweitert, Typen kombinierst du mit{' '}
          <Code>&</Code> (Intersection: „beides zugleich“).
        </P>
        <TryIt id="ts-objekte-type-interface" modus="ts" {...beispiele['ts-objekte-type-interface']} />
        <CodeBlock titel="Die Unterschiede" code={codeBloecke.vergleich} />
        <Hinweis variante="tipp">
          Such dir eine Schreibweise aus und bleib dabei. Viele React-Projekte nehmen <Code>type</Code>,
          weil es auch für Unions und Funktionen funktioniert. <Code>interface</Code> braucht man, wenn
          fremde Typen erweitert werden sollen (Declaration Merging).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Optionale Felder">
        <P>
          <Code>fontSize?: number</Code> heißt: Das Feld darf fehlen. Sein Typ ist deshalb{' '}
          <Code>number | undefined</Code> - und TypeScript lässt dich erst damit rechnen, wenn du den
          Fall <Code>undefined</Code> behandelt hast. Die Operatoren <Code>??</Code> und <Code>?.</Code>{' '}
          aus <Verweis nr="1.2" /> sind dafür wie gemacht.
        </P>
        <TryIt id="ts-objekte-optional" modus="ts" {...beispiele['ts-objekte-optional']} />
      </Abschnitt>

      <Abschnitt titel="readonly">
        <P>
          <Code>readonly</Code> verbietet das Neuzuweisen eines Feldes. Für Arrays gibt es{' '}
          <Code>readonly string[]</Code>: Methoden wie <Code>push</Code> oder <Code>sort</Code>, die das
          Array verändern, sind dann gar nicht vorhanden. Genau das Verhalten, das React bei State
          erwartet (<Verweis nr="1.6" />).
        </P>
        <TryIt id="ts-objekte-readonly" modus="ts" {...beispiele['ts-objekte-readonly']} />
        <Hinweis variante="info">
          Auch <Code>readonly</Code> gibt es nur beim Prüfen. Zur Laufzeit ließe sich das Objekt
          weiterhin ändern - wer das wirklich verhindern will, nimmt zusätzlich{' '}
          <Code>Object.freeze</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Strukturelle Typisierung">
        <P>
          TypeScript vergleicht Typen nach ihrer <strong>Form</strong>, nicht nach ihrem Namen: Ein Objekt
          passt, wenn es mindestens die geforderten Felder hat. Das nennt man auch „Duck Typing“ - wenn es
          quakt wie eine Ente … Eine Ausnahme: Schreibst du ein Objekt-Literal direkt hin, meldet TypeScript
          überzählige Felder, weil das fast immer ein Tippfehler ist.
        </P>
        <TryIt id="ts-objekte-strukturell" modus="ts" {...beispiele['ts-objekte-strukturell']} />
      </Abschnitt>

      <Abschnitt titel="Beliebige Schlüssel: Index-Signaturen und Record">
        <P>
          Manchmal kennst du die Schlüssel vorher nicht - etwa bei Punkteständen pro Spieler. Dann
          beschreibst du nur, welchen Typ Schlüssel und Werte haben. <Code>{'Record<K, V>'}</Code> ist die
          kürzere Schreibweise dafür.
        </P>
        <TryIt id="ts-objekte-index" modus="ts" {...beispiele['ts-objekte-index']} />
      </Abschnitt>

      <Abschnitt titel="Verschachtelte Typen">
        <P>
          Typen lassen sich beliebig ineinander setzen. Lieber mehrere kleine, benannte Typen als ein großer
          verschachtelter: Sie sind lesbarer, und du kannst sie einzeln wiederverwenden.
        </P>
        <TryIt id="ts-objekte-verschachtelt" modus="ts" {...beispiele['ts-objekte-verschachtelt']} />
        <Liste>
          <li>
            Arrays von Objekten: <Code>Order[]</Code> - ein Array, in dem jedes Element ein{' '}
            <Code>Order</Code> ist.
          </li>
          <li>In Callbacks wie reduce oder map musst du nichts annotieren - der Typ ergibt sich aus dem Array.</li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="ts-objekte-uebung"
          modus="ts"
          {...beispiele['ts-objekte-uebung']}
          aufgabe={
            <>
              <p>Beschreibe die Daten einer Bibliothek, sodass die Typprüfung keine Fehler mehr meldet:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>Book</Code>: <Code>id</Code> (Zahl, darf sich nie ändern), <Code>title</Code>,{' '}
                  <Code>author</Code>, <Code>year</Code> (Zahl) und eine optionale <Code>isbn</Code>
                </li>
                <li>
                  <Code>Library</Code>: ein <Code>name</Code> und eine Liste <Code>books</Code>
                </li>
              </ul>
              <p className="mt-1">Die Funktionen darunter musst du nicht ändern.</p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'type Point = { x: number; y: number }. Passt { x: 1, y: 2, z: 3 } aus einer Variablen?',
            antworten: ['Ja - es hat mindestens x und y', 'Nein - z ist zu viel', 'Nur mit interface'],
            richtig: 0,
            erklaerung: 'Strukturelle Typisierung: Es zählt, dass die geforderten Felder da sind. Nur bei direkt hingeschriebenen Objekt-Literalen meldet TypeScript überzählige Felder.',
          },
          {
            frage: 'Welchen Typ hat settings.fontSize bei fontSize?: number?',
            antworten: ['number', 'number | undefined', 'number | null'],
            richtig: 1,
            erklaerung: 'Ein optionales Feld kann fehlen - dann liest man undefined. Deshalb gehört undefined zum Typ.',
          },
          {
            frage: 'Womit kombinierst du zwei Objekttypen A und B zu einem Typ mit allen Feldern?',
            antworten: ['A | B', 'A & B', 'A + B'],
            richtig: 1,
            erklaerung: 'Die Intersection A & B hat alle Felder von A und von B. A | B wäre „A oder B“ - dazu mehr in Kapitel 2.4.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Objekttypen: <Code>{'type User = { name: string }'}</Code> oder{' '}
            <Code>{'interface User { name: string }'}</Code>.
          </>,
          <>
            <Code>feld?: T</Code> ist optional (<Code>T | undefined</Code>), <Code>readonly</Code> verbietet
            Neuzuweisung.
          </>,
          <>
            Erweitern mit <Code>extends</Code> (interface) oder <Code>&</Code> (type).
          </>,
          'Typen werden nach ihrer Form verglichen, nicht nach ihrem Namen.',
          <>
            Unbekannte Schlüssel: <Code>{'Record<string, number>'}</Code>.
          </>,
        ]}
      />
    </>
  )
}
