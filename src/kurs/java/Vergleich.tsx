import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Vergleich.code'

/**
 * KAPITEL 7.10 - Java, JavaScript & React im Vergleich
 *
 * Das Abschlusskapitel des Java-Teils. Als einziges Kapitel benutzt es alle
 * drei Editoren nebeneinander - und zeigt, wo im Projekt welche Sprache liegt.
 */
export function Vergleich() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Dieselbe Aufgabe, zwei Sprachen: Summe und Durchschnitt einer Zahlenreihe. Beide Editoren
          laufen hier auf derselben Seite - achte auf das Abzeichen oben rechts.
        </P>
        <TryIt modus="java" titel="Java" id="java-vergleich-java" {...beispiele['java-vergleich-java']} />
        <TryIt titel="JavaScript" id="java-vergleich-js" {...beispiele['java-vergleich-js']} />
        <P>
          Zwei Dinge fallen auf: Java braucht deutlich mehr Rahmen - und der Cast{' '}
          <Code>(double)</Code> ist Pflicht, weil <Code>int / int</Code> sonst abschneiden würde (
          <Verweis nr="7.2" />).
        </P>
      </Abschnitt>

      <Abschnitt titel="Die Unterschiede auf einer Seite">
        <Tabelle
          breit
          kopf={['Thema', 'Java', 'JavaScript']}
          spalten={['align-top font-medium', undefined, 'text-slate-600 dark:text-slate-400']}
          zeilen={[
            ['Typen', 'im Code, vom Compiler geprüft', 'erst zur Laufzeit'],
            ['Fehler', 'viele vor dem Start', 'beim Ausführen'],
            ['Einstieg', 'main in einer Klasse', 'die erste Zeile der Datei'],
            ['Funktionen', 'Methoden in Klassen', 'überall, auch als Wert'],
            ['Objekte', 'aus einer Klasse gebaut', 'jederzeit frei gebaut'],
            ['Vererbung', 'extends, abstract, interface', 'Prototypen - selten benutzt'],
            ['Listen', 'Array (fest) / ArrayList', 'Array (wächst)'],
            ['„leer“', 'nur null', 'null und undefined'],
            ['Gleichheit', '== Identität, equals Inhalt', '=== Wert bzw. Identität'],
            ['Bedingungen', 'nur boolean', 'alles ist truthy/falsy'],
            ['Nebenläufigkeit', 'echte Threads', 'ein Thread + Event Loop'],
            ['Läuft', 'überall, wo eine JVM ist', 'im Browser und in Node'],
          ]}
        />
        <Hinweis variante="info">
          TypeScript (<Verweis nr="5.8" />) liegt genau dazwischen: Typen wie in Java, Laufzeit wie
          in JavaScript. Beim Bauen werden die Typen wieder entfernt - geprüft wird trotzdem vorher.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Dieselbe Logik dreimal">
        <P>
          Eine Aufgabenliste, gefiltert nach „offen“. Erst Java, dann JavaScript, dann React - und im
          dritten Fall wird daraus eine Oberfläche, die man anklicken kann.
        </P>
        <TryIt modus="java" titel="Java" id="java-vergleich-liste-java" {...beispiele['java-vergleich-liste-java']} />
        <TryIt titel="JavaScript" id="java-vergleich-liste-js" {...beispiele['java-vergleich-liste-js']} />
        <TryIt modus="react" titel="React" id="java-vergleich-liste-react" {...beispiele['java-vergleich-liste-react']} />
        <P>
          Die Kette <Code>stream().filter(…).toList()</Code> und{' '}
          <Code>{'tasks.filter(t => !t.done)'}</Code> sagen dasselbe. React fügt nur eines hinzu:
          Aus der gefilterten Liste wird automatisch das, was man sieht - ändert sich der State,
          zeichnet React neu (<Verweis nr="3.3" />).
        </P>
        <Hinweis variante="tipp">
          Genau deshalb steht in diesem Kurs zuerst JavaScript: React ist keine eigene Sprache,
          sondern eine Bibliothek. Java dagegen ist eine eigene Welt - mit eigenem Compiler, eigener
          Laufzeit und eigenen Werkzeugen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Wo liegt in diesem Projekt was?">
        <P>
          Die App selbst ist zu 100 % React und TypeScript. Java kommt hier nur an zwei Stellen vor -
          und beide sind sauber getrennt vom Rest:
        </P>
        <CodeBlock code={codeBloecke.struktur} titel="Projektstruktur" />
        <Liste>
          <li>
            <strong>☕ <Code>src/java/</Code></strong> - die Java-Laufzeit. Reines TypeScript, ohne
            React, ohne DOM. Sie kennt nur Text hinein und Ausgabe hinaus.
          </li>
          <li>
            <strong>☕ <Code>src/kurs/java/</Code></strong> - die Kapitel dieses Teils. Der Java-Code
            steht in den <Code>.code.ts</Code>-Dateien, der erklärende Text drumherum ist React.
          </li>
          <li>
            <strong>🟨 <Code>src/kurs/js/</Code></strong> und <Code>src/lernen/jsSandbox.ts</Code> -
            alles, was mit JavaScript zu tun hat.
          </li>
          <li>
            <strong>⚛️ der ganze Rest</strong> - Komponenten, Hooks, Seiten: React.
          </li>
        </Liste>
        <P>Jede der drei Sprachen nimmt beim Ausführen einen eigenen Weg:</P>
        <CodeBlock code={codeBloecke.wege} />
      </Abschnitt>

      <Abschnitt titel="Wie die Java-Laufzeit hier funktioniert">
        <P>
          Es gibt keine JVM im Browser. Was dein Java-Code hier durchläuft, sind vier Schritte -
          dieselben vier, die auch <Code>javac</Code> und die JVM gehen:
        </P>
        <Liste>
          <li>
            <strong>1. Lexer</strong> (<Code>lexer.ts</Code>) - zerlegt den Text in Token:{' '}
            <Code>int</Code>, <Code>x</Code>, <Code>=</Code>, <Code>5</Code>, <Code>;</Code>
          </li>
          <li>
            <strong>2. Parser</strong> (<Code>parser.ts</Code>) - baut daraus einen Syntaxbaum. Hier
            fällt ein fehlendes Semikolon auf.
          </li>
          <li>
            <strong>3. Prüfer</strong> (<Code>pruefer.ts</Code>) - geht den Baum durch und sucht
            Typfehler, unbekannte Namen, fehlende <Code>return</Code>. Das ist die Arbeit von{' '}
            <Code>javac</Code>. Diese Prüfung läuft auch beim Tippen - daher die roten
            Schlangenlinien.
          </li>
          <li>
            <strong>4. Interpreter</strong> (<Code>interpreter.ts</Code>) - führt den Baum aus. Das
            ist die Rolle der JVM. Er kennt den Unterschied zwischen <Code>int</Code> und{' '}
            <Code>double</Code>, lässt <Code>int</Code> überlaufen und wirft echte Exceptions.
          </li>
        </Liste>
        <TryIt modus="java" id="java-vergleich-laufzeit" {...beispiele['java-vergleich-laufzeit']} />
        <Hinweis variante="warnung">
          Die Laufzeit deckt die Grundlagen ab, nicht ganz Java. Es fehlen unter anderem Threads,
          Dateizugriff, <Code>Scanner</Code> (es gibt keine Tastatureingabe), Pakete über mehrere
          Dateien und anonyme Klassen. Für alles, was in diesem Teil steht, verhält sie sich aber wie
          eine echte JVM - geprüft von <Code>npm run test:java</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Wenn du Java außerhalb dieses Kurses schreiben willst">
        <P>
          Du brauchst ein <strong>JDK</strong> (z. B. Temurin oder Oracle JDK) und eine IDE -
          IntelliJ IDEA Community oder VS Code mit dem Java-Paket. Größere Projekte verwalten
          Abhängigkeiten mit Maven oder Gradle:
        </P>
        <CodeBlock code={codeBloecke.echtesProjekt} />
        <P>
          Der Weg dorthin ist derselbe wie in <Verweis nr="5.11" /> für React: raus aus dem
          Browser-Editor, rein in ein echtes Projekt.
        </P>
      </Abschnitt>

      <Abschnitt titel="Was nimmt man wofür?">
        <Liste>
          <li>
            <strong>Java</strong> - Server-Backends, Android, große und langlebige Systeme, überall
            dort, wo viele Menschen jahrelang am selben Code arbeiten. Die Strenge zahlt sich mit
            der Größe aus.
          </li>
          <li>
            <strong>JavaScript/TypeScript + React</strong> - alles im Browser, dazu Node-Server und
            mobile Apps. Schnell am Start, sehr beweglich.
          </li>
          <li>
            <strong>Beides zusammen</strong> ist der Normalfall in Unternehmen: ein Java-Backend, das
            JSON liefert, und ein React-Frontend, das es anzeigt (<Verweis nr="5.2" />).
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="java"
          id="java-vergleich-uebung"
          {...beispiele['java-vergleich-uebung']}
          aufgabe={
            <>
              <p>
                Übersetze zwei JavaScript-Einzeiler nach Java. Die Vorlagen stehen als Kommentar im
                Editor:
              </p>
              <Liste>
                <li>
                  <Code>average(int[] numbers)</Code> - der Durchschnitt als <Code>double</Code>, bei
                  einem leeren Array 0
                </li>
                <li>
                  <Code>countAbove(int[] numbers, int limit)</Code> - wie viele Werte{' '}
                  <em>größer</em> als <Code>limit</Code> sind
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was stimmt über Java und JavaScript?',
            antworten: [
              'JavaScript ist eine vereinfachte Version von Java.',
              'Beide sind unabhängige Sprachen - der ähnliche Name war Marketing.',
              'Java läuft im Browser, JavaScript auf dem Server.',
              'Beide werden von derselben Laufzeit ausgeführt.',
            ],
            richtig: 1,
            erklaerung: 'JavaScript hieß 1995 aus Marketinggründen so, weil Java damals populär war. Verwandt sind die Sprachen nicht.',
          },
          {
            frage: 'Welcher Ordner in diesem Projekt enthält ausschließlich Java-Logik?',
            antworten: ['src/lernen/', 'src/java/', 'src/kurs/', 'src/components/'],
            richtig: 1,
            erklaerung: 'src/java/ ist die Java-Laufzeit: Lexer, Parser, Prüfer, Interpreter - reines TypeScript ohne React.',
          },
          {
            frage: 'Wo würdest du eine Oberfläche mit Klickzustand bauen?',
            antworten: [
              'in Java, weil es typsicher ist',
              'in React, weil sich die Anzeige automatisch aus dem State ergibt',
              'das ist gleichwertig',
              'in reinem JavaScript ohne Bibliothek',
            ],
            richtig: 1,
            erklaerung: 'Genau dafür gibt es React: Du beschreibst das Ergebnis, React kümmert sich um die Änderungen am DOM.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Java und JavaScript sind zwei unabhängige Sprachen - Typen und Fehlerzeitpunkt sind der Hauptunterschied.',
          <>
            In diesem Projekt liegt Java ausschließlich in <Code>src/java/</Code> (Laufzeit) und{' '}
            <Code>src/kurs/java/</Code> (Kapitel).
          </>,
          'Die Laufzeit macht dasselbe wie javac + JVM: Lexer → Parser → Prüfer → Interpreter.',
          'Dieselbe Logik lässt sich in beiden Sprachen schreiben - React fügt nur hinzu, dass die Anzeige dem State folgt.',
          'In der Praxis trifft man beides: Java im Backend, React im Frontend.',
        ]}
      />
    </>
  )
}
