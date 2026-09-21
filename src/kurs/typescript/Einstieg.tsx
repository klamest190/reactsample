import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Einstieg.code'

/**
 * KAPITEL 2.1 - Warum TypeScript?
 * Typen, Inferenz, Grundtypen - und dass Typen zur Laufzeit verschwinden.
 */
export function Einstieg() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          TypeScript ist JavaScript mit Typen. Du schreibst dazu, welche Art von Wert erwartet wird - und
          der Compiler meldet Fehler, <strong>bevor</strong> der Code läuft. Unter jedem Editor in diesem
          Teil siehst du das Ergebnis der Typprüfung.
        </P>
        <TryIt id="ts-start-einstieg" modus="ts" {...beispiele['ts-start-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Was TypeScript ist - und was nicht">
        <P>
          TypeScript ist eine <strong>Obermenge</strong> von JavaScript: Jeder JavaScript-Code ist
          gültiges TypeScript, es kommen nur Typangaben hinzu. Der größte Gewinn ist nicht, dass du
          weniger Fehler machst, sondern dass du sie <strong>sofort</strong> siehst - Tippfehler,
          vergessene Felder, falsche Argumente. Dazu kommen Autovervollständigung und gefahrloses
          Umbenennen in der IDE.
        </P>
        <TryIt id="ts-start-tippfehler" modus="ts" {...beispiele['ts-start-tippfehler']} />
        <P>Im echten Projekt laufen zwei Dinge getrennt voneinander:</P>
        <CodeBlock titel="Prüfen und Übersetzen" code={codeBloecke.ablauf} />
        <Liste>
          <li>
            Der <strong>Compiler</strong> (<Code>tsc</Code>, in VS Code läuft er ständig mit) prüft die
            Typen und meldet Fehler.
          </li>
          <li>
            Ein <strong>Übersetzer</strong> (Vite, sucrase, esbuild) entfernt die Typen einfach - übrig
            bleibt normales JavaScript, das der Browser versteht.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Typen existieren nur beim Prüfen">
        <P>
          Das hat eine wichtige Folge: Ein Typfehler hält das Programm <strong>nicht</strong> auf. Hier
          meldet die Typprüfung einen Fehler - und trotzdem läuft der Code und gibt etwas aus:
        </P>
        <TryIt id="ts-start-fehler" modus="ts" {...beispiele['ts-start-fehler']} />
        <CodeBlock titel="Type Erasure: die Typen werden entfernt" code={codeBloecke.entfernt} />
        <Hinweis variante="warnung">
          Weil die Typen zur Laufzeit weg sind, kann TypeScript <strong>nichts prüfen, was erst zur
          Laufzeit ankommt</strong> - Eingaben, <Code>JSON.parse</Code>, Antworten vom Server. Solche
          Daten musst du selbst prüfen (dazu mehr bei <Code>unknown</Code> und in <Verweis nr="2.8" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Annotation und Inferenz">
        <P>
          Eine <strong>Annotation</strong> schreibt den Typ ausdrücklich hin: <Code>let city: string</Code>.
          Meist musst du das gar nicht - TypeScript leitet den Typ aus dem Wert ab
          (<strong>Inferenz</strong>). Bei <Code>const</Code> ist der Typ sogar noch genauer: Der Wert
          ändert sich nie, also ist der Typ genau dieser eine Wert.
        </P>
        <TryIt id="ts-start-annotation" modus="ts" {...beispiele['ts-start-annotation']} />
        <Hinweis variante="tipp">
          Faustregel: <strong>Parameter</strong> von Funktionen immer annotieren, den Rest meist der
          Inferenz überlassen. Das hält den Code kurz, und an den Grenzen (was geht rein?) ist trotzdem
          alles klar.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die Grundtypen">
        <P>
          Die primitiven Typen heißen wie ihre <Code>typeof</Code>-Ergebnisse - klein geschrieben. Dazu
          kommen Arrays und <strong>Tupel</strong>: Arrays fester Länge, bei denen jede Position ihren
          eigenen Typ hat.
        </P>
        <TryIt id="ts-start-grundtypen" modus="ts" {...beispiele['ts-start-grundtypen']} />
        <Liste>
          <li>
            <Code>string</Code>, <Code>number</Code>, <Code>boolean</Code>, <Code>null</Code>,{' '}
            <Code>undefined</Code> (dazu selten <Code>bigint</Code> und <Code>symbol</Code>)
          </li>
          <li>
            Arrays: <Code>number[]</Code> oder gleichbedeutend <Code>{'Array<number>'}</Code>
          </li>
          <li>
            Tupel: <Code>[string, number]</Code> - kennst du schon von <Code>useState</Code>
          </li>
          <li>
            Nicht verwechseln: <Code>String</Code> mit großem S ist das Wrapper-Objekt - als Typ immer
            klein schreiben.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="any und unknown">
        <P>
          Beide stehen für „irgendein Wert“, verhalten sich aber gegensätzlich.{' '}
          <Code>any</Code> schaltet die Prüfung ab: Du darfst alles damit machen, auch Unsinn.{' '}
          <Code>unknown</Code> ist die sichere Variante: Du darfst damit <em>nichts</em> machen, bis du
          geprüft hast, was drinsteckt. Diese Prüfung heißt <strong>Eingrenzen</strong> (Narrowing) -
          mehr dazu in <Verweis nr="2.4" />.
        </P>
        <TryIt id="ts-start-any-unknown" modus="ts" {...beispiele['ts-start-any-unknown']} />
        <Hinweis variante="warnung">
          <Code>any</Code> ist ansteckend: Was du aus einem <Code>any</Code> liest, ist wieder{' '}
          <Code>any</Code>. Ein einziges <Code>any</Code> kann so die Prüfung in einem ganzen Bereich
          aushebeln. Für „weiß ich nicht“ ist <Code>unknown</Code> fast immer die bessere Wahl.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="strict: die tsconfig">
        <P>
          Welche Prüfungen laufen, steht in der <Code>tsconfig.json</Code>. Die wichtigste Einstellung ist{' '}
          <Code>strict</Code>. Sie schaltet unter anderem zwei Regeln ein: Parameter ohne Typ sind ein
          Fehler (statt still <Code>any</Code> zu werden), und <Code>null</Code>/<Code>undefined</Code>{' '}
          müssen ausdrücklich behandelt werden. Die Editoren hier laufen mit <Code>strict</Code>.
        </P>
        <TryIt id="ts-start-strict" modus="ts" {...beispiele['ts-start-strict']} />
        <CodeBlock code={codeBloecke.tsconfig} />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="ts-start-uebung"
          modus="ts"
          {...beispiele['ts-start-uebung']}
          aufgabe={
            <>
              <p>
                Der Code funktioniert, aber die Typprüfung meldet Fehler: Parameter ohne Typ werden nicht
                akzeptiert. Ergänze die Typen - <strong>ohne</strong> <Code>any</Code>:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>formatPrice</Code> bekommt einen Betrag und eine Währung
                </li>
                <li>
                  <Code>total</Code> bekommt ein Array von Zahlen
                </li>
                <li>
                  <Code>minMax</Code> gibt ein <strong>Tupel</strong> aus kleinstem und größtem Wert zurück
                </li>
              </ul>
              <p className="mt-1">
                Neben den normalen Tests gibt es <strong>Typ-Tests</strong>: Sie prüfen z. B., dass{' '}
                <Code>formatPrice('10', 'EUR')</Code> ein Typfehler ist.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Die Typprüfung meldet einen Fehler. Was passiert beim Ausführen?',
            antworten: ['Das Programm startet gar nicht', 'Der Code läuft trotzdem - die Typen werden nur entfernt', 'TypeScript korrigiert den Fehler automatisch'],
            richtig: 1,
            erklaerung: 'Prüfen und Übersetzen sind getrennt. Beim Übersetzen werden die Typen einfach entfernt - auch fehlerhafter Code läuft. In echten Projekten verhindert meist der Build (tsc) das Veröffentlichen.',
          },
          {
            frage: 'Welchen Typ leitet TypeScript für const status = "open" ab?',
            antworten: ['string', 'Den Literal-Typ "open"', 'any'],
            richtig: 1,
            erklaerung: 'Eine const-Variable kann sich nie ändern - deshalb ist ihr Typ genau dieser Wert. Mit let wäre es string.',
          },
          {
            frage: 'Du weißt nicht, was JSON.parse zurückgibt. Welcher Typ ist am sichersten?',
            antworten: ['any', 'unknown', 'object'],
            richtig: 1,
            erklaerung: 'unknown zwingt dich zu prüfen, bevor du den Wert benutzt. any würde jeden Fehler durchlassen.',
          },
        ]}
      />

      <Merke
        punkte={[
          'TypeScript = JavaScript + Typen. Fehler zeigt der Compiler, bevor der Code läuft.',
          'Typen werden beim Übersetzen entfernt - zur Laufzeit gibt es sie nicht.',
          <>
            Parameter annotieren (<Code>name: string</Code>), den Rest meist der Inferenz überlassen.
          </>,
          <>
            Arrays: <Code>number[]</Code>, Tupel: <Code>[string, number]</Code>.
          </>,
          <>
            <Code>unknown</Code> statt <Code>any</Code> - und immer mit <Code>"strict": true</Code>.
          </>,
        ]}
      />
    </>
  )
}
