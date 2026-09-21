import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Arrays.code'

/**
 * KAPITEL 7.5 - Arrays & Strings
 * Feste Längen, Standardwerte, null - und die berühmte ==-Falle.
 */
export function Arrays() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Ein Array in Java hat <strong>einen Typ</strong> und <strong>eine feste Länge</strong>.
          Beides steht fest, sobald es existiert.
        </P>
        <TryIt modus="java" id="java-arrays-einstieg" {...beispiele['java-arrays-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Anlegen - und die Sache mit length">
        <CodeBlock code={codeBloecke.anlegen} />
        <Hinweis variante="warnung">
          <Code>array.length</Code> ohne Klammern, <Code>text.length()</Code> mit. Der Grund: Beim
          Array ist es ein Feld, beim String eine Methode. Diese Inkonsequenz ist ein Klassiker und
          erwischt jeden einmal.
        </Hinweis>
        <CodeBlock code={codeBloecke.jsVergleich} />
      </Abschnitt>

      <Abschnitt titel="Die Länge ist fest">
        <P>
          Es gibt kein <Code>push</Code>. Wer mehr Platz braucht, legt ein neues Array an und
          kopiert - oder nimmt gleich eine <Code>ArrayList</Code> (<Verweis nr="7.8" />).
        </P>
        <TryIt modus="java" id="java-arrays-laenge" {...beispiele['java-arrays-laenge']} />
        <Hinweis variante="tipp">
          <Code>System.out.println(array)</Code> gibt <Code>[I@1b6d2f1d</Code> aus - Typkürzel und
          Speicheradresse. Für den Inhalt brauchst du <Code>Arrays.toString(array)</Code>, bei
          verschachtelten Arrays <Code>Arrays.deepToString(array)</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Standardwerte - und null">
        <P>
          Ein frisches <Code>int[]</Code> ist voller Nullen, ein <Code>boolean[]</Code> voller{' '}
          <Code>false</Code>. Ein <Code>String[]</Code> ist dagegen voller <Code>null</Code> - und{' '}
          <Code>null</Code> hat keine Methoden:
        </P>
        <TryIt modus="java" id="java-arrays-npe" {...beispiele['java-arrays-npe']} />
        <P>
          Die <Code>NullPointerException</Code> ist der häufigste Laufzeitfehler in Java überhaupt.
          Ihr Erfinder Tony Hoare nennt sie heute „meinen Milliarden-Dollar-Fehler“. In{' '}
          <Verweis nr="7.9" /> lernst du, wie man mit ihr umgeht.
        </P>
      </Abschnitt>

      <Abschnitt titel="Zweidimensionale Arrays">
        <P>
          Ein <Code>int[][]</Code> ist ein Array von Arrays - also eine Tabelle. Die Zeilen können
          sogar unterschiedlich lang sein.
        </P>
        <TryIt modus="java" id="java-arrays-zweidimensional" {...beispiele['java-arrays-zweidimensional']} />
      </Abschnitt>

      <Abschnitt titel="Strings sind Objekte - und unveränderlich">
        <P>
          Ein <Code>String</Code> ist kein primitiver Typ, sondern ein Objekt der Klasse{' '}
          <Code>String</Code>. Und er ist <strong>immutable</strong>: Keine Methode ändert ihn,
          jede liefert einen neuen zurück.
        </P>
        <TryIt modus="java" id="java-arrays-strings" {...beispiele['java-arrays-strings']} />
        <Hinweis variante="info">
          Dieselbe Idee steckt hinter React-State: nicht verändern, sondern ersetzen (
          <Verweis nr="1.6" />). In Java gilt sie für Strings von Haus aus.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die ==-Falle">
        <P>
          Weil Strings Objekte sind, vergleicht <Code>==</Code> bei ihnen nicht den Inhalt, sondern
          die <strong>Identität</strong>: Sind das zwei Namen für dasselbe Objekt?
        </P>
        <CodeBlock code={codeBloecke.gleichheit} />
        <P>
          Verwirrend wird es, weil gleiche Literale sich ein Objekt teilen (den „String-Pool“) -{' '}
          <Code>==</Code> also manchmal zufällig <Code>true</Code> ergibt. Genau deshalb ist die
          Regel so einfach wie ausnahmslos:
        </P>
        <Hinweis variante="warnung">
          <strong>Bei Objekten immer <Code>equals</Code>, nie <Code>==</Code>.</strong> Bei
          primitiven Typen (<Code>int</Code>, <Code>double</Code>, <Code>char</Code>,{' '}
          <Code>boolean</Code>) dagegen immer <Code>==</Code>.
        </Hinweis>
        <TryIt modus="java" id="java-arrays-gleichheit" {...beispiele['java-arrays-gleichheit']} />
      </Abschnitt>

      <Abschnitt titel="Viele Strings zusammenbauen: StringBuilder">
        <P>
          Weil jeder <Code>+</Code> einen neuen String erzeugt, wird das in Schleifen teuer. Der{' '}
          <Code>StringBuilder</Code> sammelt stattdessen in einem einzigen Objekt.
        </P>
        <TryIt modus="java" id="java-arrays-builder" {...beispiele['java-arrays-builder']} />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="java"
          id="java-arrays-uebung"
          {...beispiele['java-arrays-uebung']}
          aufgabe={
            <>
              <p>
                Zerlege <Code>text</Code> an den Leerzeichen und berechne daraus:
              </p>
              <Liste>
                <li>
                  <Code>words</Code> - das <Code>String[]</Code> mit allen Wörtern
                </li>
                <li>
                  <Code>wordCount</Code> - die Anzahl der Wörter
                </li>
                <li>
                  <Code>longest</Code> - das längste Wort
                </li>
                <li>
                  <Code>mentionsJava</Code> - ob im Text „java“ vorkommt, egal wie geschrieben
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was ergibt new String("hi") == "hi" ?',
            antworten: ['true', 'false', 'einen Kompilierfehler', 'das ist zufällig'],
            richtig: 1,
            erklaerung: 'new String(…) erzeugt bewusst ein neues Objekt. == vergleicht die Identität, also false. equals ergibt true.',
          },
          {
            frage: 'Wie bekommst du den Inhalt eines int[] als Text?',
            antworten: [
              'array.toString()',
              'Arrays.toString(array)',
              'String.valueOf(array)',
              'array + ""',
            ],
            richtig: 1,
            erklaerung: 'Arrays haben keine eigene toString-Methode - alle anderen Varianten liefern die Adresse.',
          },
          {
            frage: 'Was steht in einem frischen String[3]?',
            antworten: ['drei leere Strings', 'dreimal null', 'dreimal undefined', 'nichts, es ist leer'],
            richtig: 1,
            erklaerung: 'Standardwert für alle Objekttypen ist null. Zugriff auf eine Methode davon gibt eine NullPointerException.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Arrays haben einen Typ und eine feste Länge. Zum Wachsen gibt es ArrayList.',
          <>
            <Code>array.length</Code> ohne Klammern, <Code>text.length()</Code> mit.
          </>,
          <>
            <Code>Arrays.toString(…)</Code> zeigt den Inhalt - sonst siehst du nur die Adresse.
          </>,
          'Strings sind unveränderliche Objekte: Jede Methode gibt einen neuen String zurück.',
          <>
            Objekte mit <Code>equals</Code> vergleichen, primitive Typen mit <Code>==</Code>.
          </>,
        ]}
      />
    </>
  )
}
