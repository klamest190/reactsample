import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Fehler.code'

/**
 * KAPITEL 7.9 - Exceptions
 * Fehler als eigener Kontrollfluss - mit Typen, die der Compiler kennt.
 */
export function Fehler() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Wenn etwas schiefgeht, wirft Java eine <strong>Exception</strong>. Fängt sie niemand,
          stürzt das Programm ab - mit <Code>try/catch</Code> übernimmst du das Steuer.
        </P>
        <TryIt modus="java" id="java-fehler-einstieg" {...beispiele['java-fehler-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Der Aufbau">
        <CodeBlock code={codeBloecke.aufbau} />
        <P>
          Der große Unterschied zu JavaScript: Es gibt <strong>mehrere catch-Blöcke</strong>, einen
          pro Fehlertyp. Java sucht den ersten passenden - deshalb steht der allgemeinste (
          <Code>Exception</Code>) immer zuletzt.
        </P>
        <CodeBlock code={codeBloecke.jsVergleich} />
      </Abschnitt>

      <Abschnitt titel="Die drei, die du am häufigsten siehst">
        <TryIt modus="java" id="java-fehler-typen" {...beispiele['java-fehler-typen']} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Exception</th>
                <th className="py-2">Passiert, wenn …</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[
                ['NullPointerException', 'du eine Methode auf null aufrufst - der Klassiker'],
                ['ArrayIndexOutOfBoundsException', 'du an einen Index greifst, den es nicht gibt'],
                ['NumberFormatException', 'Integer.parseInt(…) keinen Text mit Zahl bekommt'],
                ['ArithmeticException', 'du ganzzahlig durch 0 teilst'],
                ['ClassCastException', 'ein Cast auf einen Typ geht, der nicht passt'],
                ['IllegalArgumentException', 'du sie selbst wirfst, weil ein Argument unsinnig ist'],
              ].map(([name, wann]) => (
                <tr key={name}>
                  <td className="py-2 pr-4 align-top font-mono text-xs">{name}</td>
                  <td className="py-2">{wann}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Abschnitt>

      <Abschnitt titel="finally: läuft immer">
        <P>
          Der <Code>finally</Code>-Block läuft in jedem Fall - auch wenn im <Code>try</Code> schon
          ein <Code>return</Code> stand. Klassisch nutzt man ihn zum Aufräumen: Datei schließen,
          Verbindung trennen.
        </P>
        <TryIt modus="java" id="java-fehler-finally" {...beispiele['java-fehler-finally']} />
      </Abschnitt>

      <Abschnitt titel="Selbst werfen">
        <P>
          <Code>throw</Code> bricht die Methode sofort ab und reicht den Fehler nach oben. Das ist
          oft besser, als einen falschen Wert zurückzugeben - der Aufrufer <em>muss</em> sich dann
          kümmern.
        </P>
        <TryIt modus="java" id="java-fehler-werfen" {...beispiele['java-fehler-werfen']} />
      </Abschnitt>

      <Abschnitt titel="Eigene Exceptions">
        <P>
          Eine eigene Exception ist einfach eine Klasse, die von <Code>RuntimeException</Code> erbt
          (<Verweis nr="7.7" />). Der Vorteil: Sie kann zusätzliche Daten mitbringen - und der
          Aufrufer kann gezielt <em>diesen</em> Fall fangen.
        </P>
        <TryIt modus="java" id="java-fehler-eigene" {...beispiele['java-fehler-eigene']} />
      </Abschnitt>

      <Abschnitt titel="Checked und unchecked">
        <P>
          Java hat eine Eigenheit, die sonst kaum eine Sprache kennt: Bei manchen Exceptions{' '}
          <strong>zwingt</strong> dich der Compiler, etwas zu tun.
        </P>
        <CodeBlock code={codeBloecke.hierarchie} />
        <CodeBlock code={codeBloecke.checked} />
        <Liste>
          <li>
            <strong>checked</strong> (z. B. <Code>IOException</Code>): Du musst sie fangen oder mit{' '}
            <Code>throws</Code> weiterreichen. Sonst kompiliert es nicht.
          </li>
          <li>
            <strong>unchecked</strong> (alles unter <Code>RuntimeException</Code>): Du darfst, musst
            aber nicht.
          </li>
        </Liste>
        <Hinweis variante="tipp">
          Für eigene Fehler ist <Code>RuntimeException</Code> heute die übliche Wahl. Checked
          Exceptions führen leicht zu leeren <Code>catch</Code>-Blöcken, die ein Problem nur
          verstecken.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Wenn niemand fängt">
        <P>
          Dann wandert die Exception die Aufrufkette hoch, bis sie oben herausfällt. Das Programm
          endet - und gibt vorher aus, was passiert ist und wo.
        </P>
        <TryIt modus="java" id="java-fehler-ungefangen" {...beispiele['java-fehler-ungefangen']} />
        <Hinweis variante="info">
          Eine echte JVM listet hier die ganze Aufrufkette (<em>Stacktrace</em>):{' '}
          <Code>level2 → level1 → main</Code>. Diese Laufzeit nennt die Zeile, in der es passiert ist
          - beim Suchen ist das die wichtigste Information. Lies einen Stacktrace immer von{' '}
          <strong>oben</strong>: Dort steht die Stelle, an der es knallte.
        </Hinweis>
        <P>
          In React gibt es dafür die <em>Error Boundary</em> (<Verweis nr="5.4" />) - die Idee ist
          dieselbe: Ein Fehler soll nicht die ganze Anwendung mitreißen.
        </P>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="java"
          id="java-fehler-uebung"
          {...beispiele['java-fehler-uebung']}
          aufgabe={
            <>
              <p>Zwei Methoden, zwei Seiten derselben Medaille:</p>
              <Liste>
                <li>
                  <Code>parseOrDefault(text, fallback)</Code> - gibt die Zahl zurück, bei einem
                  ungültigen Text aber <Code>fallback</Code> statt eines Absturzes.
                </li>
                <li>
                  <Code>validateAge(age)</Code> - wirft eine{' '}
                  <Code>IllegalArgumentException</Code>, wenn das Alter kleiner als 0 oder größer
                  als 130 ist. Sonst passiert nichts.
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Wann läuft der finally-Block?',
            antworten: [
              'nur wenn kein Fehler auftrat',
              'nur wenn ein Fehler auftrat',
              'immer - auch nach einem return im try',
              'nur wenn es kein catch gibt',
            ],
            richtig: 2,
            erklaerung: 'finally ist der Aufräumblock und läuft in jedem Fall.',
          },
          {
            frage: 'Was unterscheidet checked von unchecked Exceptions?',
            antworten: [
              'Checked sind schwerwiegender.',
              'Bei checked verlangt der Compiler catch oder throws.',
              'Unchecked kann man nicht fangen.',
              'Checked gibt es nur in eigenen Klassen.',
            ],
            richtig: 1,
            erklaerung: 'Alles unterhalb von RuntimeException ist unchecked - der Rest muss behandelt oder weitergereicht werden.',
          },
          {
            frage: 'In welcher Reihenfolge stehen mehrere catch-Blöcke?',
            antworten: [
              'egal',
              'vom allgemeinsten zum speziellsten',
              'vom speziellsten zum allgemeinsten',
              'alphabetisch',
            ],
            richtig: 2,
            erklaerung: 'Java nimmt den ersten passenden. Stünde catch (Exception e) oben, käme nie ein anderer dran - das ist sogar ein Kompilierfehler.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>try</Code> - <Code>catch</Code> pro Fehlertyp - <Code>finally</Code> läuft immer.
          </>,
          'Speziellste Exception zuerst fangen, Exception ganz zum Schluss.',
          <>
            <Code>throw new IllegalArgumentException("…")</Code> ist oft besser als ein
            Rückgabewert, der „Fehler“ bedeuten soll.
          </>,
          <>
            Eigene Exceptions erben von <Code>RuntimeException</Code> und dürfen eigene Daten
            mitbringen.
          </>,
          'Einen Stacktrace liest man von oben: Dort steht, wo es passiert ist.',
        ]}
      />
    </>
  )
}
