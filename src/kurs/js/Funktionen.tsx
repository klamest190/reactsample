import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Funktionen.code'

/**
 * KAPITEL 1.3 - Funktionen & Closures
 * Komponenten SIND Funktionen, Event-Handler SIND Callbacks, Hooks leben von Closures.
 */
export function Funktionen() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Eine Funktion bekommt Werte hinein und gibt ein Ergebnis zurück.</P>
        <TryIt
          id="js-funktionen-einstieg"
          {...beispiele['js-funktionen-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Funktionen deklarieren">
        <P>
          Eine Funktion bündelt Code unter einem Namen. Sie bekommt <strong>Parameter</strong> und
          gibt mit <Code>return</Code> ein Ergebnis zurück. Ohne <Code>return</Code> ist das
          Ergebnis <Code>undefined</Code>.
        </P>
        <TryIt
          id="js-funktionen-1"
          {...beispiele['js-funktionen-1']}
        />
      </Abschnitt>

      <Abschnitt titel="Arrow Functions">
        <P>
          Die kurze Schreibweise mit <Code>{'=>'}</Code> ist in React-Code allgegenwärtig. Besteht
          der Rumpf nur aus einem Ausdruck, kannst du die geschweiften Klammern und das{' '}
          <Code>return</Code> weglassen - das nennt man <strong>impliziten Return</strong>.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="js-funktionen-2"
          {...beispiele['js-funktionen-2']}
        />
      </Abschnitt>

      <Abschnitt titel="Funktionen sind Werte - Callbacks">
        <P>
          In JavaScript kannst du Funktionen in Variablen speichern, als Argument übergeben und aus
          anderen Funktionen zurückgeben. Eine Funktion, die du einer anderen übergibst, heißt{' '}
          <strong>Callback</strong>. Genau das machst du in React bei{' '}
          <Code>{'onClick={() => …}'}</Code>: Du übergibst eine Funktion, die React später aufruft.
        </P>
        <TryIt
          id="js-funktionen-3"
          {...beispiele['js-funktionen-3']}
        />
        <Hinweis variante="warnung">
          Häufiger React-Fehler: <Code>{'onClick={remove()}'}</Code> ruft die Funktion{' '}
          <strong>sofort beim Rendern</strong> auf. Richtig ist <Code>{'onClick={remove}'}</Code>{' '}
          oder <Code>{'onClick={() => remove(id)}'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Scope und Closures">
        <P>
          Variablen existieren nur in dem Block <Code>{'{ }'}</Code>, in dem sie deklariert wurden
          (ihr <strong>Scope</strong>). Eine innere Funktion kann aber auf die Variablen der
          äußeren Funktion zugreifen - <strong>und behält diesen Zugriff</strong>, auch wenn die
          äußere Funktion längst fertig ist. Das nennt man <strong>Closure</strong>.
        </P>
        <TryIt
          id="js-funktionen-4"
          {...beispiele['js-funktionen-4']}
        />
        <P>Warum ist das für React so wichtig?</P>
        <Liste>
          <li>
            Jeder Event-Handler in einer Komponente ist eine Closure über die Props und den State{' '}
            <strong>dieses einen Renders</strong>.
          </li>
          <li>
            Das erklärt das berühmte „veraltete State“-Problem (<em>stale closure</em>), das du in
            den Hook-Kapiteln kennenlernst.
          </li>
          <li>Eigene Hooks funktionieren nach genau diesem Muster wie <Code>createCounter</Code>.</li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="js-funktionen-uebung"
          {...beispiele['js-funktionen-uebung']}
          aufgabe={
            <>
              <p>
                Schreibe eine Funktion <Code>createCart()</Code>, die ein Objekt mit drei
                Funktionen zurückgibt:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>add(price)</Code> - merkt sich den Preis
                </li>
                <li>
                  <Code>total()</Code> - gibt die Summe aller Preise zurück
                </li>
                <li>
                  <Code>count()</Code> - gibt die Anzahl der Artikel zurück
                </li>
              </ul>
              <p className="mt-1">
                Die Daten sollen <em>privat</em> in einer Closure liegen. Zwei Warenkörbe dürfen sich
                nicht gegenseitig beeinflussen.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was gibt (x) => { x * 2 } zurück?',
            antworten: ['x * 2', 'undefined', 'Einen Fehler'],
            richtig: 1,
            erklaerung: 'Mit geschweiften Klammern braucht es ein explizites return - sonst undefined.',
          },
          {
            frage: 'Welche Schreibweise ruft remove erst beim Klick auf?',
            antworten: ['onClick={remove()}', 'onClick={() => remove()}', 'onClick="remove()"'],
            richtig: 1,
            erklaerung: 'Die Arrow Function wird übergeben und erst beim Klick ausgeführt.',
          },
          {
            frage: 'Was ist eine Closure?',
            antworten: [
              'Eine Funktion, die sich selbst aufruft',
              'Eine Funktion, die sich den Zugriff auf Variablen ihres Entstehungs-Scopes merkt',
              'Das Schließen eines Code-Blocks mit }',
            ],
            richtig: 1,
            erklaerung: 'Die innere Funktion „schließt“ die äußeren Variablen ein und behält sie.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Arrow Functions: <Code>{'(a, b) => a + b'}</Code>. Objekte implizit zurückgeben:{' '}
            <Code>{'() => ({ … })'}</Code>.
          </>,
          'Funktionen sind Werte: speichern, übergeben (Callbacks), zurückgeben.',
          <>
            Übergeben ≠ Aufrufen: <Code>fn</Code> vs. <Code>fn()</Code>.
          </>,
          'Closures merken sich die Variablen ihres Entstehungsorts - die Grundlage von Event-Handlern und Hooks.',
        ]}
      />
    </>
  )
}
