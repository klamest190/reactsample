import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Collections.code'

/**
 * KAPITEL 7.8 - Collections & Generics
 * ArrayList und HashMap - was in JavaScript Array und Objekt sind.
 */
export function Collections() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Ein Array hat eine feste Länge - für alles andere gibt es die <em>Collections</em>. Die
          wichtigste ist die <Code>ArrayList</Code>: eine Liste, die mitwächst.
        </P>
        <TryIt modus="java" id="java-collections-einstieg" {...beispiele['java-collections-einstieg']} />
        <Hinweis variante="info">
          Die beiden <Code>import</Code>-Zeilen oben holen die Klassen aus dem Paket{' '}
          <Code>java.util</Code>. In einer IDE fügt sie ein Tastendruck ein. Hier im Kurs darfst du
          sie auch weglassen - die Laufzeit kennt die Klassen ohnehin.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Drei Typen, drei Aufgaben">
        <CodeBlock code={codeBloecke.wahl} />
        <CodeBlock code={codeBloecke.jsVergleich} />
        <P>
          Auffällig ist die linke Seite: <Code>{'List<String> names = new ArrayList<>()'}</Code>. Man
          deklariert mit dem <strong>Interface</strong> (<Code>List</Code>) und erzeugt mit der{' '}
          <strong>Klasse</strong> (<Code>ArrayList</Code>).
        </P>
        <CodeBlock code={codeBloecke.interfaceLinks} />
      </Abschnitt>

      <Abschnitt titel="Mit Listen arbeiten">
        <TryIt modus="java" id="java-collections-liste" {...beispiele['java-collections-liste']} />
        <Hinweis variante="warnung">
          Aufgepasst bei <Code>remove</Code>: <Code>list.remove(1)</Code> löscht bei einer{' '}
          <Code>{'List<Integer>'}</Code> das Element an <em>Position</em> 1 - nicht die Zahl 1. Um
          die Zahl zu löschen, brauchst du <Code>list.remove(Integer.valueOf(1))</Code>. Eine der
          bekanntesten Fallen in Java.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Generics: die spitzen Klammern">
        <P>
          <Code>{'<String>'}</Code> ist keine Deko, sondern ein Versprechen an den Compiler: Hier
          kommen nur Strings hinein - also kommen auch nur Strings heraus. Vor Java 5 gab es das
          nicht; damals musste man jedes Element beim Herausholen selbst zurückverwandeln.
        </P>
        <TryIt modus="java" id="java-collections-generics" {...beispiele['java-collections-generics']} />
        <Hinweis variante="tipp">
          Der Diamant <Code>{'<>'}</Code> auf der rechten Seite bleibt leer - der Compiler weiß aus
          der linken Seite schon, was gemeint ist. Und: In eine Collection passen nur Objekte,
          deshalb <Code>{'List<Integer>'}</Code> statt <Code>{'List<int>'}</Code> (siehe{' '}
          <Verweis nr="7.2" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="HashMap: Schlüssel und Wert">
        <P>
          Was in JavaScript ein Objekt oder eine <Code>Map</Code> ist, heißt hier{' '}
          <Code>HashMap</Code>. Der Typ steht doppelt in den spitzen Klammern:{' '}
          <Code>{'Map<Schlüssel, Wert>'}</Code>.
        </P>
        <TryIt modus="java" id="java-collections-map" {...beispiele['java-collections-map']} />
        <Hinweis variante="warnung">
          <Code>get</Code> liefert <Code>null</Code>, wenn der Schlüssel fehlt - und{' '}
          <Code>null</Code> ist der kurze Weg zur <Code>NullPointerException</Code>. Nimm{' '}
          <Code>getOrDefault(key, standard)</Code>, wann immer es geht.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="HashSet: jeder Wert nur einmal">
        <TryIt modus="java" id="java-collections-set" {...beispiele['java-collections-set']} />
      </Abschnitt>

      <Abschnitt titel="Lambdas und Streams">
        <P>
          Seit Java 8 gibt es Lambdas - kurze Funktionen wie die Arrow Functions in JavaScript. Damit
          werden auch <Code>map</Code>, <Code>filter</Code> und Co. möglich; sie heißen hier{' '}
          <em>Streams</em>.
        </P>
        <CodeBlock code={codeBloecke.streamVergleich} />
        <TryIt modus="java" id="java-collections-streams" {...beispiele['java-collections-streams']} />
        <P>
          <Code>String::toUpperCase</Code> ist eine <strong>Methodenreferenz</strong> - die
          Kurzschreibweise für <Code>{'name -> name.toUpperCase()'}</Code>.
        </P>
        <P>
          Wenn dir das bekannt vorkommt: Genau so entstehen in React Listen aus Daten (
          <Verweis nr="1.4" /> und <Verweis nr="3.2" />). Die Idee ist dieselbe, nur die Schreibweise
          ist anders.
        </P>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="java"
          id="java-collections-uebung"
          {...beispiele['java-collections-uebung']}
          aufgabe={
            <>
              <p>Zähle, wie oft jedes Wort im Text vorkommt:</p>
              <Liste>
                <li>
                  Fülle die <Code>counts</Code>-Map: Wort → Anzahl
                </li>
                <li>
                  Finde das häufigste Wort und merke es in <Code>mostCommon</Code>, die Anzahl in{' '}
                  <Code>highest</Code>
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Warum List<Integer> und nicht List<int> ?',
            antworten: [
              'Das ist nur Konvention.',
              'Collections können nur Objekte aufnehmen - Integer ist die Objektform von int.',
              'int wäre zu langsam.',
              'List<int> gibt es, ist aber veraltet.',
            ],
            richtig: 1,
            erklaerung: 'Primitive Typen sind keine Objekte. Autoboxing wandelt int automatisch in Integer um - und zurück.',
          },
          {
            frage: 'Was liefert map.get("fehlt") bei einer HashMap ohne diesen Schlüssel?',
            antworten: ['0', 'eine Exception', 'null', 'einen leeren String'],
            richtig: 2,
            erklaerung: 'null - deshalb ist getOrDefault(key, standard) meistens die bessere Wahl.',
          },
          {
            frage: 'Welche Collection nimmst du, wenn jeder Wert nur einmal vorkommen soll?',
            antworten: ['ArrayList', 'HashMap', 'HashSet', 'Array'],
            richtig: 2,
            erklaerung: 'Ein Set kennt keine Duplikate. add gibt false zurück, wenn der Wert schon drin ist.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>{'List<T>'}</Code> wächst mit, <Code>{'Set<T>'}</Code> kennt keine Duplikate,{' '}
            <Code>{'Map<K, V>'}</Code> ordnet Schlüsseln Werte zu.
          </>,
          <>
            Links das Interface, rechts die Umsetzung:{' '}
            <Code>{'List<String> x = new ArrayList<>()'}</Code>.
          </>,
          'Generics machen aus Laufzeitfehlern Kompilierfehler - und sparen jeden Cast.',
          <>
            <Code>getOrDefault</Code> statt <Code>get</Code>, wo <Code>null</Code> drohen würde.
          </>,
          <>
            Lambdas (<Code>{'n -> n * 2'}</Code>) und Streams sind Javas <Code>map</Code>/
            <Code>filter</Code>.
          </>,
        ]}
      />
    </>
  )
}
