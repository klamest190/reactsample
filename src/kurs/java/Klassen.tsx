import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Klassen.code'

/**
 * KAPITEL 7.6 - Klassen & Objekte
 * Das Herzstück von Java: Bauplan, Konstruktor, Kapselung.
 */
export function Klassen() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Bisher war die Klasse nur ein Rahmen um <Code>main</Code>. Jetzt wird sie zu dem, wofür sie
          gedacht ist: ein <strong>Bauplan</strong> für Objekte, die Daten und Verhalten zusammen
          halten.
        </P>
        <TryIt modus="java" id="java-klassen-einstieg" {...beispiele['java-klassen-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Bauplan und Objekt">
        <CodeBlock code={codeBloecke.bauplan} />
        <P>
          Die Klasse beschreibt, <em>was</em> ein Objekt hat und kann. Jedes <Code>new</Code> erzeugt
          daraus ein eigenes Objekt mit eigenen Werten. Die Methoden gibt es dagegen nur einmal - sie
          bekommen beim Aufruf mit <Code>this</Code> mitgeteilt, um welches Objekt es gerade geht.
        </P>
        <CodeBlock code={codeBloecke.jsVergleich} />
      </Abschnitt>

      <Abschnitt titel="Felder: Zustand mit Standardwert">
        <P>
          Felder sind Variablen, die zum Objekt gehören. Anders als lokale Variablen bekommen sie
          automatisch einen Standardwert - <Code>0</Code>, <Code>false</Code> oder{' '}
          <Code>null</Code>.
        </P>
        <TryIt modus="java" id="java-klassen-felder" {...beispiele['java-klassen-felder']} />
        <P>
          Ein <Code>static</Code>-Feld gehört dagegen der Klasse und existiert genau einmal - egal,
          wie viele Objekte es gibt. Praktisch für Zähler und Konstanten.
        </P>
      </Abschnitt>

      <Abschnitt titel="Der Konstruktor">
        <P>
          Der Konstruktor heißt wie die Klasse, hat <strong>keinen</strong> Rückgabetyp und läuft
          genau einmal: beim <Code>new</Code>. Seine Aufgabe ist, das Objekt in einen gültigen
          Zustand zu bringen.
        </P>
        <TryIt modus="java" id="java-klassen-konstruktor" {...beispiele['java-klassen-konstruktor']} />
        <Hinweis variante="info">
          <Code>this.title = title;</Code> ist kein Zierrat: Links steht das Feld, rechts der
          Parameter. Ohne <Code>this</Code> würde der Parameter sich selbst zugewiesen - ein Fehler,
          den der Compiler nicht sieht. Mit <Code>this(…)</Code> kann ein Konstruktor außerdem einen
          anderen aufrufen, statt Code zu wiederholen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Kapselung: private, Getter und Setter">
        <P>
          Das Grundprinzip der objektorientierten Programmierung: Ein Objekt hütet seine Daten selbst
          und lässt nur kontrollierte Wege hinein.
        </P>
        <CodeBlock code={codeBloecke.konvention} />
        <Liste>
          <li>
            <Code>private</Code> - nur innerhalb dieser Klasse sichtbar. Der Normalfall für Felder.
          </li>
          <li>
            <Code>public</Code> - von überall. Der Normalfall für Methoden, die andere benutzen
            sollen.
          </li>
          <li>
            <Code>protected</Code> - zusätzlich für erbende Klassen (<Verweis nr="7.7" />).
          </li>
          <li>ohne Angabe - sichtbar im selben Paket. Fürs Lernen völlig in Ordnung.</li>
        </Liste>
        <TryIt modus="java" id="java-klassen-kapselung" {...beispiele['java-klassen-kapselung']} />
        <Hinweis variante="tipp">
          Ein Setter ist kein Selbstzweck. Oft ist eine Methode mit einem sprechenden Namen besser:{' '}
          <Code>deposit(100)</Code> sagt mehr als <Code>setBalance(getBalance() + 100)</Code> - und
          kann prüfen, ob der Betrag überhaupt erlaubt ist.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="toString und equals">
        <P>
          Jede Klasse erbt von <Code>Object</Code> ein paar Methoden - unter anderem{' '}
          <Code>toString()</Code> und <Code>equals()</Code>. Die Standardversionen sind wenig
          hilfreich (<Code>Point@1b6d2f1d</Code> bzw. „ist es dasselbe Objekt?“), deshalb
          überschreibt man sie.
        </P>
        <TryIt modus="java" id="java-klassen-tostring" {...beispiele['java-klassen-tostring']} />
        <Hinweis variante="info">
          <Code>@Override</Code> ist eine Annotation. Sie ändert nichts am Programm, lässt den
          Compiler aber prüfen, dass du wirklich eine geerbte Methode überschreibst - ein Tippfehler
          im Namen fällt dadurch sofort auf.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Referenzen und null">
        <P>
          Eine Variable vom Typ einer Klasse enthält nie das Objekt selbst, sondern einen Verweis
          darauf. Zwei Variablen können also auf dasselbe Objekt zeigen - oder auf gar keins.
        </P>
        <TryIt modus="java" id="java-klassen-referenzen" {...beispiele['java-klassen-referenzen']} />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="java"
          id="java-klassen-uebung"
          {...beispiele['java-klassen-uebung']}
          aufgabe={
            <>
              <p>
                Schreibe die Klasse <Code>Task</Code> für eine ToDo-Aufgabe:
              </p>
              <Liste>
                <li>
                  private Felder <Code>title</Code> (<Code>String</Code>) und <Code>done</Code> (
                  <Code>boolean</Code>)
                </li>
                <li>
                  ein Konstruktor <Code>Task(String title)</Code> - neue Aufgaben sind nicht erledigt
                </li>
                <li>
                  <Code>getTitle()</Code> und <Code>isDone()</Code>
                </li>
                <li>
                  <Code>toggle()</Code> - schaltet zwischen erledigt und offen um
                </li>
                <li>
                  <Code>toString()</Code> - liefert <Code>"[x] Titel"</Code> bzw.{' '}
                  <Code>"[ ] Titel"</Code>
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was ist am Konstruktor besonders?',
            antworten: [
              'Er gibt immer das Objekt zurück.',
              'Er heißt wie die Klasse und hat keinen Rückgabetyp.',
              'Er ist immer static.',
              'Es darf nur einen pro Klasse geben.',
            ],
            richtig: 1,
            erklaerung: 'Kein Rückgabetyp, auch kein void. Und es darf beliebig viele geben, solange sich die Parameter unterscheiden.',
          },
          {
            frage: 'Wozu dient private bei einem Feld?',
            antworten: [
              'Es macht das Feld unveränderlich.',
              'Nur die eigene Klasse kommt heran - Änderungen laufen über Methoden, die prüfen können.',
              'Es spart Speicher.',
              'Das Feld existiert nur einmal.',
            ],
            richtig: 1,
            erklaerung: 'Unveränderlich macht final. private steuert die Sichtbarkeit - das ist Kapselung.',
          },
          {
            frage: 'Was macht this.name = name im Konstruktor?',
            antworten: [
              'Es kopiert das Objekt.',
              'Es weist dem Feld den Wert des gleichnamigen Parameters zu.',
              'Es legt ein neues Feld an.',
              'Es ist nur Stil, man kann es weglassen.',
            ],
            richtig: 1,
            erklaerung: 'Ohne this wäre name der Parameter - auf beiden Seiten. Das Feld bliebe leer.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Die Klasse ist der Bauplan, jedes new erzeugt ein Objekt mit eigenen Feldwerten.',
          <>
            Der Konstruktor heißt wie die Klasse, hat keinen Rückgabetyp und macht das Objekt
            gültig. <Code>this.x = x</Code> unterscheidet Feld und Parameter.
          </>,
          <>
            Felder <Code>private</Code>, Zugriff über Methoden - das ist Kapselung.
          </>,
          <>
            <Code>toString()</Code> und <Code>equals()</Code> überschreiben, sonst siehst du nur
            Adressen und vergleichst Identitäten.
          </>,
          'Variablen enthalten Verweise auf Objekte - oder null.',
        ]}
      />
    </>
  )
}
