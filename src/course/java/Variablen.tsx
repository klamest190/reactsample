import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/ChapterLink'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Variablen.code'

/**
 * KAPITEL 7.2 - Typen & Variablen
 * Der Kern des Unterschieds zu JavaScript: Typen stehen im Code.
 */
export function Variablen() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          In Java steht vor jedem Namen sein Typ. Das ist mehr Schreibarbeit - und der Grund, warum
          der Compiler so viel für dich findet.
        </P>
        <TryIt mode="java" id="java-variablen-einstieg" {...examples['java-variablen-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Der Typ gehört zur Variablen">
        <CodeBlock code={codeBloecke.deklaration} />
        <P>
          Einmal <Code>int</Code>, immer <Code>int</Code>. Eine Variable kann ihren Typ nie wechseln
          - das ist der Unterschied, aus dem sich fast alles andere ergibt:
        </P>
        <CodeBlock code={codeBloecke.jsVergleich} />
        <Hinweis variante="info">
          Man nennt das <strong>statische Typisierung</strong>: „statisch“, weil der Typ schon
          feststeht, bevor das Programm läuft. TypeScript bringt genau diese Idee zu JavaScript -
          nur verschwinden die Typen dort beim Übersetzen wieder (siehe <Verweis nr="5.8" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die acht primitiven Typen">
        <P>
          Java hat acht eingebaute Typen, die keine Objekte sind. In der Praxis brauchst du vier
          davon: <Code>int</Code>, <Code>double</Code>, <Code>boolean</Code> und <Code>char</Code>.
        </P>
        <Tabelle
          breit
          kopf={['Typ', 'Wofür', 'Standardwert']}
          spalten={['align-top', undefined, 'font-mono text-xs']}
          zeilen={[
            ['int', 'Ganze Zahlen - die Standardwahl', '0'],
            ['long', 'Sehr große ganze Zahlen (Zeitstempel, IDs)', '0'],
            ['double', 'Kommazahlen - die Standardwahl', '0.0'],
            ['float', 'Kommazahlen, halb so genau. Selten.', '0.0'],
            ['boolean', 'true oder false. Sonst nichts.', 'false'],
            ['char', "Genau ein Zeichen: 'A'", "'\\u0000'"],
            ['byte, short', 'Sehr kleine Zahlen. Fast nie nötig.', '0'],
          ].map(([typ, wofuer, standard]) => [<Code key={typ}>{typ}</Code>, wofuer, standard])}
        />
        <P>
          <Code>String</Code> fehlt in dieser Liste mit Absicht: Ein String ist kein primitiver Typ,
          sondern eine <strong>Klasse</strong> - deshalb wird er großgeschrieben. Mehr dazu in{' '}
          <Verweis nr="7.5" />.
        </P>
        <TryIt mode="java" id="java-variablen-typen" {...examples['java-variablen-typen']} />
        <Hinweis variante="warnung">
          Ein <Code>int</Code> hat eine feste Größe. Wird er zu groß, gibt es keinen Fehler - er
          fängt bei der kleinsten Zahl wieder an (Überlauf). JavaScript-Zahlen haben dieses Problem
          nicht, dafür andere.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die Falle: Division mit ganzen Zahlen">
        <P>
          Wenn links und rechts vom <Code>/</Code> ganze Zahlen stehen, rechnet Java auch ganzzahlig
          - der Rest fällt ersatzlos weg. Das ist der häufigste Anfängerfehler in Java überhaupt.
        </P>
        <TryIt mode="java" id="java-variablen-division" {...examples['java-variablen-division']} />
        <Hinweis variante="tipp">
          Merksatz: <strong>Ein double genügt.</strong> Sobald einer der beiden Werte eine Kommazahl
          ist, rechnet Java in <Code>double</Code> weiter. Deshalb helfen <Code>2.0</Code>,{' '}
          <Code>(double) a</Code> oder <Code>1.0 *</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Umwandeln (Casting)">
        <P>Zwei Richtungen, zwei Regeln:</P>
        <Liste>
          <li>
            <strong>Nach oben</strong> (<Code>int</Code> → <Code>double</Code>) passiert von selbst,
            denn es kann nichts verloren gehen.
          </li>
          <li>
            <strong>Nach unten</strong> (<Code>double</Code> → <Code>int</Code>) musst du ausdrücklich
            erlauben: <Code>(int) preis</Code>. Java schneidet dann ab - es rundet <em>nicht</em>.
          </li>
        </Liste>
        <TryIt mode="java" id="java-variablen-casting" {...examples['java-variablen-casting']} />
      </Abschnitt>

      <Abschnitt titel="final, var - und was mit const vergleichbar ist">
        <P>
          <Code>final</Code> ist Javas <Code>const</Code>: Der Wert darf danach nicht mehr neu
          zugewiesen werden. <Code>var</Code> sieht dagegen nur aus wie JavaScript - der Typ wird
          lediglich vom Compiler erraten und steht danach genauso fest.
        </P>
        <TryIt mode="java" id="java-variablen-final" {...examples['java-variablen-final']} />
        <Hinweis variante="info">
          Konstanten schreibt man in Java traditionell <Code>GROSS_MIT_UNTERSTRICHEN</Code>, alles
          andere in <Code>kleinCamelCase</Code>, Klassen in <Code>GrossCamelCase</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Wenn der Typ nicht passt">
        <P>
          Und so sieht es aus, wenn man es falsch macht. Der Fehler kommt nicht beim Ausführen -
          sondern davor:
        </P>
        <TryIt mode="java" id="java-variablen-fehler" {...examples['java-variablen-fehler']} />
        <P>
          Zum Vergleich: In JavaScript wäre <Code>let count = 'three'</Code> völlig in Ordnung, und
          der Fehler würde irgendwann später auffallen - vielleicht erst beim Nutzer.
        </P>
      </Abschnitt>

      <Abschnitt titel="Primitive und ihre Wrapper">
        <P>
          Zu jedem primitiven Typ gibt es eine Klasse: <Code>int</Code> → <Code>Integer</Code>,{' '}
          <Code>double</Code> → <Code>Double</Code>, <Code>boolean</Code> → <Code>Boolean</Code>,{' '}
          <Code>char</Code> → <Code>Character</Code>. Java wandelt zwischen beiden automatisch hin
          und her („Autoboxing“).
        </P>
        <CodeBlock code={codeBloecke.wrapper} />
        <P>
          Wichtig wird das in <Verweis nr="7.8" />: Eine <Code>ArrayList</Code> kann nur Objekte
          aufnehmen, deshalb heißt es dort <Code>{'List<Integer>'}</Code> und nicht{' '}
          <Code>{'List<int>'}</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          mode="java"
          id="java-variablen-uebung"
          {...examples['java-variablen-uebung']}
          task={
            <>
              <p>
                Gegeben sind <Code>items</Code> (7 Stück) und <Code>pricePerItem</Code> (2.50 €).
                Berechne daraus drei Variablen:
              </p>
              <Liste>
                <li>
                  <Code>total</Code> - der Gesamtpreis
                </li>
                <li>
                  <Code>half</Code> - die halbe Stückzahl, mit Nachkommastelle (3.5, nicht 3!)
                </li>
                <li>
                  <Code>rounded</Code> - der Gesamtpreis, kaufmännisch gerundet
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'Was gibt System.out.println(9 / 4) aus?',
            answers: ['2.25', '2', '2.0', 'einen Fehler'],
            correct: 1,
            explanation: 'Beide Werte sind int, also rechnet Java ganzzahlig: 2 (Rest wird abgeschnitten).',
          },
          {
            question: 'Welche Zeile ist ein Kompilierfehler?',
            answers: [
              'double d = 5;',
              'int i = 5.0;',
              "char c = 'x';",
              'long l = 5;',
            ],
            correct: 1,
            explanation: 'double → int verliert Nachkommastellen und braucht einen ausdrücklichen Cast: int i = (int) 5.0;',
          },
          {
            question: 'Was bedeutet var in Java?',
            answers: [
              'Der Typ kann sich später ändern.',
              'Der Compiler leitet den Typ aus dem Wert ab - danach steht er fest.',
              'Dasselbe wie var in JavaScript.',
              'Die Variable ist unveränderlich.',
            ],
            correct: 1,
            explanation: 'var spart nur Schreibarbeit. Der Typ ist danach genauso fest wie ausgeschrieben.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Der Typ steht vor dem Namen und ändert sich nie - das ist statische Typisierung.',
          <>
            Vier Typen reichen am Anfang: <Code>int</Code>, <Code>double</Code>,{' '}
            <Code>boolean</Code>, <Code>char</Code> - plus <Code>String</Code> (eine Klasse).
          </>,
          <>
            <Code>int / int</Code> schneidet ab. Ein <Code>double</Code> im Spiel rettet das
            Ergebnis.
          </>,
          <>
            Nach oben wird automatisch umgewandelt, nach unten nur mit <Code>(cast)</Code> - und dann
            abgeschnitten.
          </>,
          <>
            <Code>final</Code> ist Javas <Code>const</Code>. <Code>var</Code> spart nur Tipparbeit.
          </>,
        ]}
      />
    </>
  )
}
