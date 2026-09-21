import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Kontrollfluss.code'

/**
 * KAPITEL 7.3 - Bedingungen & Schleifen
 * Fast alles ist wie in JavaScript - bis auf den einen Punkt: kein truthy.
 */
export function Kontrollfluss() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          <Code>if</Code>, <Code>else if</Code>, <Code>else</Code> sehen aus wie in JavaScript. Ändere
          die Temperatur und schau, welcher Zweig läuft.
        </P>
        <TryIt modus="java" id="java-kontrollfluss-einstieg" {...beispiele['java-kontrollfluss-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Eine Bedingung ist ein boolean - sonst nichts">
        <P>
          Das ist der einzige wirklich wichtige Unterschied in diesem Kapitel: In Java gibt es kein{' '}
          <em>truthy</em> und kein <em>falsy</em>. Was in <Code>if (…)</Code> steht, muss vom Typ{' '}
          <Code>boolean</Code> sein - sonst kompiliert es nicht.
        </P>
        <CodeBlock code={codeBloecke.keinTruthy} />
        <TryIt modus="java" id="java-kontrollfluss-boolean" {...beispiele['java-kontrollfluss-boolean']} />
        <Hinweis variante="tipp">
          Das nervt am Anfang und rettet später: <Code>if (name)</Code> ist in JavaScript eine
          häufige Fehlerquelle (ist <Code>0</Code> jetzt leer oder nicht?). In Java musst du dich
          entscheiden - und der Leser sieht, was du gemeint hast.
        </Hinweis>
        <P>
          <Code>&&</Code>, <Code>||</Code> und <Code>!</Code> funktionieren wie gewohnt, auch die
          Kurzschluss-Auswertung: Bei <Code>a && b</Code> wird <Code>b</Code> nur ausgewertet, wenn{' '}
          <Code>a</Code> wahr ist. Genau deshalb funktioniert der typische Null-Schutz{' '}
          <Code>{'name != null && name.length() > 0'}</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="switch: zweimal dieselbe Idee">
        <P>
          Java hat zwei Schreibweisen für <Code>switch</Code>. Die alte mit Doppelpunkt braucht{' '}
          <Code>break</Code> - sonst läuft die Ausführung in den nächsten Fall weiter
          („fall-through“, dieselbe Falle wie in JavaScript). Die neue mit <Code>-&gt;</Code> tut das
          nicht und kann sogar einen Wert liefern.
        </P>
        <TryIt modus="java" id="java-kontrollfluss-switch" {...beispiele['java-kontrollfluss-switch']} />
        <Hinweis variante="info">
          Nimm im Zweifel die Pfeil-Variante. Sie ist kürzer, kann nichts vergessen und macht aus
          dem <Code>switch</Code> einen Ausdruck - so wie <Code>useReducer</Code> in React eine
          Action in einen neuen State verwandelt (<Verweis nr="4.5" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Vier Schleifen für vier Situationen">
        <CodeBlock code={codeBloecke.schleifenWahl} />
        <TryIt modus="java" id="java-kontrollfluss-schleifen" {...beispiele['java-kontrollfluss-schleifen']} />
        <P>
          Die zweite Form (<Code>for (int score : scores)</Code>) heißt <em>enhanced for</em> oder
          for-each. Sie ist Javas Gegenstück zu <Code>for…of</Code> und funktioniert über Arrays,
          Listen und Mengen. Was ihr fehlt, ist der Index - wenn du den brauchst, nimm die
          Zählschleife.
        </P>
        <Hinweis variante="warnung">
          Eine Endlosschleife friert in Java das ganze Programm ein. Hier bricht die Laufzeit nach
          ein paar Millionen Schritten ab und sagt dir Bescheid - eine echte JVM würde einfach
          weiterlaufen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="break und continue">
        <P>
          <Code>continue</Code> überspringt den Rest des aktuellen Durchlaufs, <Code>break</Code>{' '}
          verlässt die Schleife ganz. Bei verschachtelten Schleifen betrifft beides immer nur die{' '}
          <strong>innerste</strong> Schleife.
        </P>
        <TryIt modus="java" id="java-kontrollfluss-break" {...beispiele['java-kontrollfluss-break']} />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="java"
          id="java-kontrollfluss-uebung"
          {...beispiele['java-kontrollfluss-uebung']}
          aufgabe={
            <>
              <p>
                FizzBuzz - der Klassiker. Gib die Zahlen von 1 bis 20 aus, dabei aber:
              </p>
              <Liste>
                <li>
                  durch 3 teilbar → <Code>Fizz</Code>
                </li>
                <li>
                  durch 5 teilbar → <Code>Buzz</Code>
                </li>
                <li>
                  durch beides teilbar → <Code>FizzBuzz</Code>
                </li>
              </Liste>
              <p className="mt-1">
                Zähle außerdem in <Code>fizzCount</Code>, wie oft <em>genau</em> „Fizz“ ausgegeben
                wurde (FizzBuzz zählt nicht mit).
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Welche Bedingung kompiliert in Java?',
            antworten: ['if (list.size())', 'if (name)', 'if (count > 0)', 'if (1)'],
            richtig: 2,
            erklaerung: 'Nur ein Ausdruck vom Typ boolean ist erlaubt. Zahlen und Objekte sind keine Bedingungen.',
          },
          {
            frage: 'Was passiert bei einem klassischen switch ohne break?',
            antworten: [
              'Nichts, break ist optional.',
              'Die Ausführung läuft in den nächsten case weiter.',
              'Es gibt einen Kompilierfehler.',
              'Der default-Zweig wird übersprungen.',
            ],
            richtig: 1,
            erklaerung: 'Das ist der berüchtigte fall-through. Die Pfeil-Schreibweise switch (…) { case x -> … } hat ihn nicht.',
          },
          {
            frage: 'Wann nimmst du do-while statt while?',
            antworten: [
              'Wenn die Schleife mindestens einmal laufen soll.',
              'Wenn du einen Zähler brauchst.',
              'Wenn du über ein Array läufst.',
              'Wenn die Bedingung kompliziert ist.',
            ],
            richtig: 0,
            erklaerung: 'Bei do-while steht die Prüfung am Ende - der Rumpf läuft also garantiert einmal.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Bedingungen sind immer boolean. Kein truthy, kein falsy - stattdessen ausschreiben.',
          <>
            <Code>switch</Code> mit <Code>-&gt;</Code> braucht kein <Code>break</Code> und kann einen
            Wert zurückgeben.
          </>,
          <>
            Vier Schleifen: <Code>for</Code> (Zähler), enhanced <Code>for</Code> (Elemente),{' '}
            <Code>while</Code> (unbekannt oft), <Code>do-while</Code> (mindestens einmal).
          </>,
          <>
            <Code>break</Code> und <Code>continue</Code> wirken nur auf die innerste Schleife.
          </>,
        ]}
      />
    </>
  )
}
