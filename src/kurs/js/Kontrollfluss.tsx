import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Kontrollfluss.code'

/**
 * KAPITEL 1.2 - Operatoren & Bedingungen
 * Besonders wichtig für React: Ternary, &&, ?? und ?. - die Werkzeuge für JSX.
 */
export function Kontrollfluss() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Eine Bedingung entscheidet, welcher Code läuft.</P>
        <TryIt
          id="js-kontrollfluss-einstieg"
          {...beispiele['js-kontrollfluss-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Vergleichen: immer ===">
        <P>
          JavaScript hat zwei Gleichheitsoperatoren. <Code>==</Code> wandelt Typen vorher um und
          liefert dadurch überraschende Ergebnisse. <Code>===</Code> vergleicht Wert{' '}
          <strong>und</strong> Typ - nimm immer diesen.
        </P>
        <TryIt
          id="js-kontrollfluss-1"
          {...beispiele['js-kontrollfluss-1']}
        />
      </Abschnitt>

      <Abschnitt titel="if / else und switch">
        <P>
          Mit <Code>if</Code> führst du Code nur unter einer Bedingung aus. <Code>else if</Code>{' '}
          prüft weitere Fälle der Reihe nach, <Code>else</Code> fängt den Rest.{' '}
          <Code>switch</Code> lohnt sich, wenn du einen Wert mit vielen festen Möglichkeiten
          vergleichst - du wirst es im Reducer-Kapitel wiedersehen.
        </P>
        <TryIt
          id="js-kontrollfluss-2"
          {...beispiele['js-kontrollfluss-2']}
        />
      </Abschnitt>

      <Abschnitt titel="Bedingungen als Ausdruck - das Handwerkszeug für JSX">
        <P>
          <Code>if</Code> ist eine <em>Anweisung</em> - sie ergibt keinen Wert. In JSX darfst du aber
          nur <em>Ausdrücke</em> verwenden. Deshalb begegnen dir in React-Code ständig diese vier
          Operatoren:
        </P>
        <Liste>
          <li>
            <Code>condition ? a : b</Code> - der <strong>ternäre Operator</strong>: entweder a oder b.
          </li>
          <li>
            <Code>a && b</Code> - ist a truthy, ergibt es b, sonst a. In JSX: „zeige b nur, wenn a“.
          </li>
          <li>
            <Code>a || b</Code> - ist a truthy, ergibt es a, sonst b. Klassischer Fallback.
          </li>
          <li>
            <Code>a ?? b</Code> - <strong>Nullish Coalescing</strong>: b nur, wenn a{' '}
            <Code>null</Code> oder <Code>undefined</Code> ist. Anders als <Code>||</Code> bleibt{' '}
            <Code>0</Code> oder <Code>''</Code> erhalten.
          </li>
          <li>
            <Code>a?.b</Code> - <strong>Optional Chaining</strong>: liest b nur, wenn a nicht
            null/undefined ist, statt einen Fehler zu werfen.
          </li>
        </Liste>
        <TryIt
          id="js-kontrollfluss-3"
          {...beispiele['js-kontrollfluss-3']}
        />
        <CodeBlock
          titel="So sieht das später in React aus"
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="Schleifen">
        <P>
          In React-Komponenten schreibst du selten Schleifen - dort nimmst du{' '}
          <Code>.map()</Code> (<Verweis nr="1.4" />). Für normale Logik sind sie aber unverzichtbar. Am
          häufigsten: <Code>for…of</Code> über alle Elemente einer Liste.
        </P>
        <TryIt
          id="js-kontrollfluss-4"
          {...beispiele['js-kontrollfluss-4']}
        />
        <Hinweis variante="warnung">
          Eine Endlosschleife (z. B. <Code>while (true)</Code> ohne <Code>break</Code>) friert den
          Browser-Tab ein - auch hier im Editor. Dann hilft nur, den Tab neu zu laden.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="js-kontrollfluss-uebung"
          {...beispiele['js-kontrollfluss-uebung']}
          aufgabe={
            <>
              <p>
                Ergänze die Funktion <Code>grade(points)</Code>. Sie soll zurückgeben:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>ab 90 Punkten: <Code>'excellent'</Code></li>
                <li>ab 70 Punkten: <Code>'good'</Code></li>
                <li>ab 50 Punkten: <Code>'passed'</Code></li>
                <li>darunter: <Code>'failed'</Code></li>
                <li>
                  wenn <Code>points</Code> <Code>null</Code> oder <Code>undefined</Code> ist:{' '}
                  <Code>'not specified'</Code>
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: "Was ergibt 0 ?? 'empty' ?",
            antworten: ['0', "'empty'", 'undefined'],
            richtig: 0,
            erklaerung: '?? greift nur bei null und undefined. 0 ist ein gültiger Wert und bleibt.',
          },
          {
            frage: 'Warum nutzt man in JSX den ternären Operator statt if/else?',
            antworten: [
              'Er ist schneller.',
              'In JSX sind nur Ausdrücke erlaubt, if ist eine Anweisung.',
              'if/else gibt es in React nicht.',
            ],
            richtig: 1,
            erklaerung: 'Ein Ausdruck ergibt einen Wert, den React rendern kann - if/else tut das nicht.',
          },
          {
            frage: 'Was passiert bei benutzer?.adresse?.stadt, wenn adresse null ist?',
            antworten: ['TypeError', 'Ergebnis ist undefined', "Ergebnis ist ''"],
            richtig: 1,
            erklaerung: 'Optional Chaining bricht ab und liefert undefined statt einen Fehler zu werfen.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Immer <Code>===</Code> und <Code>!==</Code> verwenden.
          </>,
          <>
            <Code>? :</Code>, <Code>&&</Code>, <Code>??</Code> und <Code>?.</Code> sind Ausdrücke -
            genau das, was du in JSX brauchst.
          </>,
          <>
            <Code>??</Code> statt <Code>||</Code>, wenn <Code>0</Code> oder <Code>''</Code> gültige
            Werte sind.
          </>,
          <>
            <Code>for…of</Code> für Listen - in React-Komponenten meist <Code>.map()</Code>.
          </>,
        ]}
      />
    </>
  )
}
