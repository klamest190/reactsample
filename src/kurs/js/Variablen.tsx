import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Variablen.code'

/**
 * KAPITEL 1.1 - Variablen & Datentypen
 * Grundlage für alles Weitere: Werte speichern, Typen erkennen, Strings bauen.
 */
export function Variablen() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Ein Wert, ein Name: <Code>const</Code> für feste Werte, <Code>let</Code> für Werte, die sich ändern.</P>
        <TryIt
          id="js-variablen-einstieg"
          {...beispiele['js-variablen-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Warum erst JavaScript?">
        <P>
          React ist keine eigene Sprache, sondern eine JavaScript-Bibliothek. Fast alles, was in
          React-Code auf den ersten Blick „magisch“ aussieht - <Code>{'[a, setA] = …'}</Code>,{' '}
          <Code>{'items.map(i => …)'}</Code>, <Code>{'{...props}'}</Code> - ist ganz normales
          JavaScript. Wer diese Grundlagen sicher beherrscht, lernt React doppelt so schnell.
        </P>
        <Hinweis variante="tipp">
          In jedem „Probier’s selbst“-Kasten kannst du den Code ändern und mit ▶ Ausführen (oder{' '}
          <Code>Strg + Enter</Code>) starten. Alles, was du mit <Code>console.log()</Code> ausgibst,
          erscheint darunter in der Konsole.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Werte speichern mit const und let">
        <P>
          Eine Variable ist ein Name für einen Wert. Modernes JavaScript kennt dafür zwei
          Schlüsselwörter:
        </P>
        <Liste>
          <li>
            <Code>const</Code> - der Name wird <strong>einmal</strong> zugewiesen und nie neu belegt.
            Das ist der Standard.
          </li>
          <li>
            <Code>let</Code> - der Name darf später einen neuen Wert bekommen (z. B. ein Zähler in
            einer Schleife).
          </li>
          <li>
            <Code>var</Code> ist die alte Variante mit merkwürdigen Regeln - in neuem Code nicht
            mehr verwenden.
          </li>
        </Liste>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="js-variablen-1"
          {...beispiele['js-variablen-1']}
        />
        <Hinweis variante="info">
          Faustregel: Immer <Code>const</Code> - und erst dann zu <Code>let</Code> wechseln, wenn du
          wirklich neu zuweisen musst. In React-Komponenten brauchst du <Code>let</Code> fast nie.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die Datentypen">
        <P>
          Jeder Wert hat einen Typ. Mit <Code>typeof</Code> kannst du ihn abfragen. Die sogenannten{' '}
          <strong>primitiven</strong> Typen sind:
        </P>
        <Tabelle
          kopf={['Typ', 'Beispiel', 'Wofür?']}
          spalten={[undefined, 'font-mono text-xs']}
          zeilen={[
            ['string', "'Hallo', \"Welt\", `Text`", 'Text'],
            ['number', '42, 3.14, -7, NaN', 'Ganz- und Kommazahlen (es gibt nur einen Zahlentyp)'],
            ['boolean', 'true, false', 'Ja/Nein-Entscheidungen'],
            ['undefined', 'undefined', '„Noch kein Wert zugewiesen“'],
            ['null', 'null', '„Absichtlich leer“'],
          ].map(([typ, beispiel, wofuer]) => [<Code key={typ}>{typ}</Code>, beispiel, wofuer])}
        />
        <P>
          Alles andere - Objekte, Arrays, Funktionen - sind <strong>Objekte</strong>. Warum dieser
          Unterschied für React so wichtig ist, lernst du in <Verweis nr="1.6" />.
        </P>
        <TryIt
          id="js-variablen-2"
          {...beispiele['js-variablen-2']}
        />
      </Abschnitt>

      <Abschnitt titel="Strings und Template-Literale">
        <P>
          Strings in einfachen oder doppelten Anführungszeichen sind gleichwertig. Die Backticks{' '}
          <Code>`…`</Code> können mehr: In <Code>{'${…}'}</Code> darf jeder JavaScript-Ausdruck
          stehen, und Zeilenumbrüche sind erlaubt. Diese <strong>Template-Literale</strong> wirst du
          in React ständig sehen, z. B. für CSS-Klassen.
        </P>
        <TryIt
          id="js-variablen-3"
          {...beispiele['js-variablen-3']}
        />
      </Abschnitt>

      <Abschnitt titel="Typumwandlung, truthy und falsy">
        <P>
          JavaScript wandelt Typen manchmal von selbst um - das ist praktisch, aber eine häufige
          Fehlerquelle. Besonders wichtig ist, welche Werte in einer Bedingung als{' '}
          <strong>falsch</strong> gelten. Es sind genau diese:
        </P>
        <CodeBlock code={codeBloecke.beispiel2} titel="Die falsy-Werte" />
        <P>
          <strong>Alles andere</strong> ist truthy - auch <Code>'0'</Code>, <Code>'false'</Code>,{' '}
          <Code>[]</Code> und <Code>{'{}'}</Code>.
        </P>
        <TryIt
          id="js-variablen-4"
          {...beispiele['js-variablen-4']}
        />
        <Hinweis variante="warnung">
          Genau das führt in React zu einem Klassiker: <Code>{'{count && <List />}'}</Code> zeigt
          bei <Code>count = 0</Code> eine einsame <strong>0</strong> an, weil 0 falsy ist und dann
          selbst gerendert wird. Besser: <Code>{'{count > 0 && <List />}'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="js-variablen-uebung"
          {...beispiele['js-variablen-uebung']}
          aufgabe={
            <>
              <p>
                Lege die Variablen <Code>firstName</Code> mit dem Wert <Code>'Ada'</Code> und{' '}
                <Code>age</Code> mit der <em>Zahl</em> 36 an.
              </p>
              <p className="mt-1">
                Baue daraus mit einem Template-Literal den String <Code>sentence</Code> ={' '}
                <Code>'Ada is 36 years old.'</Code> und lege <Code>isAdult</Code> an - ein
                Boolean, der aus <Code>age</Code> <em>berechnet</em> wird.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Welches Schlüsselwort nimmst du standardmäßig für neue Variablen?',
            antworten: ['var', 'let', 'const'],
            richtig: 2,
            erklaerung: 'const ist der Standard. let nur, wenn du wirklich neu zuweisen musst.',
          },
          {
            frage: "Was ergibt '5' + 1 ?",
            antworten: ['6', "'51'", 'NaN', 'einen Fehler'],
            richtig: 1,
            erklaerung: 'Bei + mit einem String wird die Zahl in einen String umgewandelt und angehängt.',
          },
          {
            frage: 'Welcher dieser Werte ist truthy?',
            antworten: ['0', "''", "'0'", 'null'],
            richtig: 2,
            erklaerung: "'0' ist ein nicht-leerer String - und damit truthy.",
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>const</Code> als Standard, <Code>let</Code> nur bei Neuzuweisung, nie{' '}
            <Code>var</Code>.
          </>,
          'Primitive Typen: string, number, boolean, undefined, null. Alles andere sind Objekte.',
          <>
            Template-Literale: <Code>{'`Hello ${name}`'}</Code> - in <Code>{'${}'}</Code> steht
            beliebiges JavaScript.
          </>,
          <>
            Falsy sind nur <Code>false, 0, '', null, undefined, NaN</Code>. Vorsicht mit{' '}
            <Code>0 &&</Code> in JSX.
          </>,
        ]}
      />
    </>
  )
}
