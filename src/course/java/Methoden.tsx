import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/ChapterLink'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Methoden.code'

/**
 * KAPITEL 7.4 - Methoden
 * Funktionen heißen in Java Methoden, weil sie immer zu einer Klasse gehören.
 */
export function Methoden() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Was in JavaScript eine Funktion ist, heißt in Java <strong>Methode</strong> - einfach
          deshalb, weil sie immer zu einer Klasse gehört. Freistehende Funktionen gibt es nicht.
        </P>
        <TryIt mode="java" id="java-methoden-einstieg" {...examples['java-methoden-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Die Signatur">
        <CodeBlock code={codeBloecke.signatur} />
        <P>
          Diese Zeile ist ein Vertrag: Wer diese Methode aufruft, muss genau einen{' '}
          <Code>int</Code> übergeben und bekommt garantiert einen <Code>int</Code> zurück. Der
          Compiler prüft beide Seiten - vor dem Start.
        </P>
        <CodeBlock code={codeBloecke.jsVergleich} />
        <Hinweis variante="info">
          <Code>void</Code> heißt „gibt nichts zurück“. Eine Methode mit Rückgabetyp <em>muss</em>{' '}
          auf jedem Weg ein <Code>return</Code> erreichen - sonst meldet der Compiler{' '}
          <Code>missing return statement</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Überladen: ein Name, mehrere Varianten">
        <P>
          In JavaScript kann es pro Name nur eine Funktion geben. In Java dürfen mehrere Methoden
          denselben Namen tragen, solange sich ihre <strong>Parameter</strong> unterscheiden. Der
          Compiler sucht die passende heraus.
        </P>
        <TryIt mode="java" id="java-methoden-ueberladung" {...examples['java-methoden-ueberladung']} />
        <P>
          Genau deshalb kann <Code>System.out.println(…)</Code> mit Text, Zahl, Wahrheitswert und
          Objekt umgehen: Es gibt die Methode gut ein Dutzend Mal, einmal pro Typ.
        </P>
        <Hinweis variante="warnung">
          Der Rückgabetyp allein reicht nicht zur Unterscheidung. Zwei Methoden, die sich nur darin
          unterscheiden, sind ein Kompilierfehler.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Parameter sind immer Kopien">
        <P>
          Java übergibt <strong>immer</strong> eine Kopie des Werts. Bei <Code>int</Code> ist das
          die Zahl selbst - Änderungen in der Methode bleiben dort. Bei Objekten und Arrays wird die{' '}
          <em>Referenz</em> kopiert: Beide zeigen danach auf dasselbe Objekt, und wer es verändert,
          verändert es für alle.
        </P>
        <TryIt mode="java" id="java-methoden-parameter" {...examples['java-methoden-parameter']} />
        <P>
          Das ist dieselbe Unterscheidung wie zwischen Wert und Referenz in JavaScript (
          <Verweis nr="1.6" />) - nur dass Java sie durch die Typen sichtbar macht.
        </P>
      </Abschnitt>

      <Abschnitt titel="static oder nicht?">
        <P>Die Frage, über die am Anfang jeder stolpert. Die Antwort ist einfach:</P>
        <Liste>
          <li>
            <Code>static</Code> - die Methode gehört der <strong>Klasse</strong>. Sie braucht kein
            Objekt und kann auch keins benutzen. Typisch für Hilfsfunktionen:{' '}
            <Code>Math.max(…)</Code>, <Code>Integer.parseInt(…)</Code>.
          </li>
          <li>
            ohne <Code>static</Code> - die Methode gehört einem <strong>Objekt</strong> und darf auf
            dessen Felder zugreifen. Das ist der Normalfall, sobald es Daten gibt (
            <Verweis nr="7.6" />).
          </li>
        </Liste>
        <TryIt mode="java" id="java-methoden-static" {...examples['java-methoden-static']} />
        <Hinweis variante="tipp">
          Deshalb ist <Code>main</Code> static: Beim Start gibt es noch kein einziges Objekt, das die
          JVM benutzen könnte.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Rekursion">
        <P>
          Eine Methode darf sich selbst aufrufen. Wichtig ist nur der Ausstieg - ohne ihn läuft der
          Aufrufstapel voll und Java wirft einen <Code>StackOverflowError</Code>.
        </P>
        <TryIt mode="java" id="java-methoden-rekursion" {...examples['java-methoden-rekursion']} />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          mode="java"
          id="java-methoden-uebung"
          {...examples['java-methoden-uebung']}
          task={
            <>
              <p>Schreibe zwei Methoden:</p>
              <Liste>
                <li>
                  <Code>isPrime(int number)</Code> - gibt <Code>true</Code> zurück, wenn die Zahl
                  eine Primzahl ist (nur durch 1 und sich selbst teilbar, mindestens 2).
                </li>
                <li>
                  <Code>countPrimes(int upTo)</Code> - zählt, wie viele Primzahlen es von 2 bis
                  einschließlich <Code>upTo</Code> gibt. Nutze dafür <Code>isPrime</Code>.
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'Wodurch dürfen sich zwei überladene Methoden unterscheiden?',
            answers: [
              'nur durch den Rückgabetyp',
              'durch Anzahl oder Typ der Parameter',
              'durch die Reihenfolge im Quelltext',
              'durch den Namen der Parameter',
            ],
            correct: 1,
            explanation: 'Die Parameterliste macht die Methode eindeutig. Der Rückgabetyp allein reicht nicht.',
          },
          {
            question: 'Was passiert bei change(int zahl) { zahl = 99; } mit der Variablen des Aufrufers?',
            answers: [
              'Sie wird auch 99.',
              'Sie bleibt unverändert - die Methode hat eine Kopie bekommen.',
              'Es gibt einen Kompilierfehler.',
              'Das hängt vom Typ ab.',
            ],
            correct: 1,
            explanation: 'Java übergibt immer eine Kopie. Bei Objekten wird die Referenz kopiert - deshalb wirken Änderungen AM Objekt sehr wohl nach außen.',
          },
          {
            question: 'Warum ist main static?',
            answers: [
              'Damit sie schneller läuft.',
              'Weil beim Start noch kein Objekt existiert, auf dem sie laufen könnte.',
              'Damit sie nur einmal aufgerufen wird.',
              'Das ist reine Konvention.',
            ],
            correct: 1,
            explanation: 'static-Methoden gehören der Klasse - die JVM kann main also aufrufen, ohne vorher etwas zu erzeugen.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Eine Methode deklariert Rückgabetyp, Namen und die Typen aller Parameter - das ist ein Vertrag.',
          'Überladen: gleicher Name, andere Parameter. Der Compiler wählt aus.',
          'Parameter sind immer Kopien. Bei Objekten wird die Referenz kopiert - das Objekt selbst nicht.',
          <>
            <Code>static</Code> gehört der Klasse, ohne <Code>static</Code> einem Objekt.
          </>,
          <>
            Eine Methode mit Rückgabetyp braucht auf jedem Pfad ein <Code>return</Code>.
          </>,
        ]}
      />
    </>
  )
}
