import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Start.code'

/**
 * KAPITEL 6.1 - Hallo Java
 * Der Einstieg in den Java-Teil: das Gerüst, die Ausgabe und der Compiler.
 */
export function Start() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Das kürzeste vollständige Java-Programm. Drück auf ▶ Ausführen - es läuft hier im Browser,
          genau wie die JavaScript-Beispiele, nur über einen anderen Weg.
        </P>
        <TryIt modus="java" id="java-start-einstieg" {...beispiele['java-start-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Warum ein Java-Teil in einem React-Kurs?">
        <P>
          Weil Java die andere Hälfte der Welt ist. JavaScript und React bauen Oberflächen im
          Browser; Java läuft seit fast 30 Jahren auf Servern, Android-Handys, Geldautomaten und in
          Banken-Backends. Wer beides kennt, versteht viel schneller, <em>warum</em> Sprachen so
          unterschiedlich aussehen.
        </P>
        <P>
          Die zwei wichtigsten Unterschiede siehst du schon im Beispiel oben:
        </P>
        <Liste>
          <li>
            <strong>Alles wohnt in einer Klasse.</strong> Es gibt in Java keinen Code, der einfach so
            „herumliegt“.
          </li>
          <li>
            <strong>Nichts läuft ungeprüft.</strong> Bevor auch nur eine Zeile ausgeführt wird, sieht
            sich der Compiler das ganze Programm an. Passt etwas nicht zusammen, startet es gar
            nicht erst.
          </li>
        </Liste>
        <Hinweis variante="info">
          Dieser Teil ist <strong>eigenständig</strong>: Er setzt keinen der Teile 1 bis 5 voraus und
          benutzt auch nichts davon. Wo es sich lohnt, gibt es Vergleiche - gesammelt in{' '}
          <Verweis nr="6.10" />.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Das Gerüst Wort für Wort">
        <CodeBlock code={codeBloecke.geruest} titel="Main.java" />
        <P>Jedes Wort in der zweiten Zeile hat eine Aufgabe:</P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Wort</th>
                <th className="py-2">Bedeutung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[
                ['public', 'Von überall aufrufbar. Ohne public würde die JVM die Methode nicht finden.'],
                ['static', 'Gehört der Klasse selbst - es muss also kein Objekt erzeugt werden, um zu starten.'],
                ['void', 'Die Methode gibt nichts zurück. („void“ = leer)'],
                ['main', 'Der feste Name, nach dem die JVM beim Start sucht.'],
                ['String[] args', 'Die Argumente von der Kommandozeile, als Array von Texten.'],
              ].map(([wort, bedeutung]) => (
                <tr key={wort}>
                  <td className="py-2 pr-4 align-top">
                    <Code>{wort}</Code>
                  </td>
                  <td className="py-2">{bedeutung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Zum Vergleich - dasselbe Programm in JavaScript braucht genau eine Zeile und keinerlei
          Rahmen:
        </P>
        <CodeBlock code={codeBloecke.jsVergleich} titel="hallo.js" />
        <Hinweis variante="tipp">
          Die Klasse heißt hier <Code>Main</Code>, weil unsere Laufzeit dort zuerst nach{' '}
          <Code>main</Code> sucht. In einem echten Projekt muss der Dateiname zum Namen der
          public-Klasse passen: <Code>Main.java</Code> für <Code>public class Main</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Ausgeben: println, print und printf">
        <P>
          <Code>System.out.println(…)</Code> ist Javas <Code>console.log</Code>. Der lange Name ist
          kein Zufall: <Code>System</Code> ist eine Klasse, <Code>out</Code> ein Feld darin (der
          Ausgabestrom) und <Code>println</Code> eine Methode auf diesem Strom.
        </P>
        <TryIt modus="java" id="java-start-ausgabe" {...beispiele['java-start-ausgabe']} />
        <Hinweis variante="tipp">
          Tipp für den Editor: Tippe <Code>sout</Code> und drück Enter - das ist dieselbe Abkürzung
          wie in IntelliJ IDEA.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Erst kompilieren, dann laufen">
        <P>
          JavaScript liest der Browser Zeile für Zeile und führt sie direkt aus. Java nimmt einen
          Umweg, der alles andere erklärt:
        </P>
        <Liste>
          <li>
            <strong>Der Compiler</strong> (<Code>javac</Code>) liest deinen Quelltext und prüft ihn
            komplett: Gibt es jede Variable? Passen die Typen? Fehlt ein <Code>return</Code>?
          </li>
          <li>
            Ist alles in Ordnung, entsteht <strong>Bytecode</strong> (<Code>Main.class</Code>) - eine
            Zwischensprache, die kein Mensch lesen muss.
          </li>
          <li>
            <strong>Die JVM</strong> (Java Virtual Machine) führt diesen Bytecode aus - auf Windows,
            Mac, Linux oder Android, überall gleich. Daher der alte Werbespruch „Write once, run
            anywhere“.
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.werkzeuge} titel="Auf der Kommandozeile" />
        <P>
          Der wichtige Effekt: Ein Tippfehler wird zum <strong>Kompilierfehler</strong>, und das
          Programm startet gar nicht. Probier es aus - das Semikolon in Zeile 3 fehlt:
        </P>
        <TryIt modus="java" id="java-start-fehler" {...beispiele['java-start-fehler']} />
        <Hinweis variante="warnung">
          Genau deshalb siehst du im Editor rote Schlangenlinien, sobald du kurz nicht tippst:
          Unsere Laufzeit prüft den Code im Hintergrund - so wie eine Java-IDE es auch tut.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Mehrere Klassen in einer Datei">
        <P>
          Ein Java-Programm besteht fast immer aus mehreren Klassen. Fürs Lernen dürfen sie in
          derselben Datei stehen - nur eine davon darf <Code>public</Code> sein.
        </P>
        <TryIt modus="java" id="java-start-mehrere" {...beispiele['java-start-mehrere']} />
      </Abschnitt>

      <Abschnitt titel="Die ersten Unterschiede zu JavaScript">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Thema</th>
                <th className="py-2 pr-4">Java</th>
                <th className="py-2">JavaScript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[
                ['Einstiegspunkt', 'public static void main(String[] args)', 'die erste Zeile der Datei'],
                ['Drumherum', 'immer eine Klasse', 'Code kann frei stehen'],
                ['Semikolon', 'Pflicht', 'meistens optional'],
                ['Typen', 'stehen im Code: int, String …', 'ergeben sich zur Laufzeit'],
                ['Fehler', 'viele schon beim Kompilieren', 'erst beim Ausführen'],
                ['Ausgabe', 'System.out.println(x)', 'console.log(x)'],
              ].map(([thema, java, js]) => (
                <tr key={thema}>
                  <td className="py-2 pr-4 align-top font-medium">{thema}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{java}</td>
                  <td className="py-2 font-mono text-xs text-slate-500 dark:text-slate-400">{js}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="java"
          id="java-start-uebung"
          {...beispiele['java-start-uebung']}
          aufgabe={
            <>
              <p>
                Lege in <Code>main</Code> zwei Variablen an: <Code>name</Code> mit dem Text{' '}
                <Code>"Ada"</Code> und <Code>year</Code> mit der Zahl <Code>1815</Code>.
              </p>
              <p className="mt-1">
                Gib damit genau eine Zeile aus: <Code>Ada was born in 1815.</Code>
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Wo startet ein Java-Programm?',
            antworten: [
              'in der ersten Zeile der Datei',
              'in der Methode main',
              'in der Klasse mit dem kürzesten Namen',
              'im Konstruktor',
            ],
            richtig: 1,
            erklaerung: 'Die JVM sucht nach public static void main(String[] args) und startet dort.',
          },
          {
            frage: 'Was macht javac?',
            antworten: [
              'Es führt das Programm aus.',
              'Es prüft den Quelltext und erzeugt Bytecode.',
              'Es lädt Bibliotheken aus dem Internet.',
              'Es formatiert den Code.',
            ],
            richtig: 1,
            erklaerung: 'javac ist der Compiler: prüfen, dann .class-Dateien mit Bytecode erzeugen. Ausgeführt wird der von der JVM.',
          },
          {
            frage: 'Was passiert bei einem fehlenden Semikolon?',
            antworten: [
              'Java ergänzt es automatisch.',
              'Nur die betroffene Zeile wird übersprungen.',
              'Das Programm startet gar nicht.',
              'Es gibt eine Warnung zur Laufzeit.',
            ],
            richtig: 2,
            erklaerung: 'Ein Syntaxfehler verhindert das Kompilieren - und ohne .class-Datei gibt es nichts auszuführen.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Jedes Java-Programm startet in <Code>public static void main(String[] args)</Code>.
          </>,
          'Aller Code steht in einer Klasse - freistehenden Code wie in JavaScript gibt es nicht.',
          <>
            <Code>System.out.println(x)</Code> gibt eine Zeile aus, <Code>print</Code> ohne
            Zeilenumbruch, <Code>printf</Code> formatiert.
          </>,
          'Erst kompilieren (javac → Bytecode), dann ausführen (JVM). Deshalb findet Java viele Fehler, bevor etwas läuft.',
          'Jede Anweisung endet mit einem Semikolon.',
        ]}
      />
    </>
  )
}
