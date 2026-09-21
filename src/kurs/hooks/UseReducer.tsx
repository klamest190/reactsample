import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './UseReducer.code'
import { AufgabenDemo } from '../demos/AufgabenDemo'

/**
 * KAPITEL 4.5 - useReducer
 */
export function UseReducer() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P><Code>useReducer</Code>: Die Komponente schickt nur Actions, der Reducer entscheidet über den neuen State.</P>
        <TryIt
          id="hooks-usereducer-einstieg"
          {...beispiele['hooks-usereducer-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Das Problem: verstreute Update-Logik">
        <P>
          Wächst eine Komponente, verteilen sich die State-Änderungen auf viele Event-Handler:{' '}
          <Code>add</Code>, <Code>remove</Code>, <Code>rename</Code>,{' '}
          <Code>sort</Code> … Jeder ruft <Code>setX</Code> mit eigener Logik auf. Schwer zu
          überblicken, schwer zu testen.
        </P>
        <P>
          Ein <strong>Reducer</strong> sammelt alle Zustandsübergänge in <strong>einer</strong> reinen
          Funktion. Die Handler beschreiben nur noch, <em>was passiert ist</em> (eine{' '}
          <strong>Action</strong>), der Reducer entscheidet, <em>wie sich der State ändert</em>.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="Reducer sind einfach JavaScript">
        <P>
          Der Name kommt von <Code>Array.reduce</Code> aus <Verweis nr="1.4" />: Aus einem Startwert und
          einer Folge von Actions entsteht Schritt für Schritt der aktuelle State. Weil der Reducer
          nichts mit React zu tun hat, kannst du ihn ohne Komponente ausprobieren und testen.
        </P>
        <TryIt
          id="hooks-usereducer-js"
          {...beispiele['hooks-usereducer-js']}
        />
        <Hinweis variante="warnung">
          Ein Reducer muss <strong>rein</strong> sein: gleiche Eingabe → gleiche Ausgabe, keine
          Nebenwirkungen. Also kein <Code>fetch</Code>, kein <Code>Math.random()</Code>, kein{' '}
          <Code>localStorage</Code> und <strong>keine Mutation</strong> von <Code>state</Code> - immer
          ein neues Objekt zurückgeben.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="useReducer in einer Komponente">
        <TryIt
          id="hooks-usereducer-react"
          {...beispiele['hooks-usereducer-react']}
          modus="react"
        />
        <AufgabenDemo />
      </Abschnitt>

      <Abschnitt titel="useState oder useReducer?">
        <Liste>
          <li>
            <strong>useState</strong> für einzelne, unabhängige Werte: ein Eingabefeld, ein Schalter,
            ein Zähler.
          </li>
          <li>
            <strong>useReducer</strong>, wenn mehrere Werte zusammen geändert werden, der nächste
            State vom vorherigen abhängt oder es viele verschiedene Arten von Änderungen gibt.
          </li>
          <li>
            Bonus: <Code>dispatch</Code> ist immer dieselbe Funktion. Du kannst es bedenkenlos an Kinder
            oder per Context weitergeben - <Code>useCallback</Code> ist nicht nötig.
          </li>
        </Liste>
        <Hinweis variante="tipp">
          Benenne Actions nach dem, <strong>was passiert ist</strong> (<Code>'added'</Code>),
          nicht nach dem, was der State tun soll (<Code>'setTodos'</Code>). So bleibt die Logik im
          Reducer statt im Handler.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="hooks-usereducer-uebung"
          {...beispiele['hooks-usereducer-uebung']}
          aufgabe={
            <>
              <p>
                Schreibe den Reducer für einen Warenkorb. Der State ist ein Array{' '}
                <Code>{'[{ id, name, price, quantity }]'}</Code>. Unterstütze diese Actions:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>{"{ type: 'added', product }"}</Code> - neues Produkt mit{' '}
                  <Code>quantity: 1</Code>. Ist es schon drin, nur die Menge um 1 erhöhen.
                </li>
                <li>
                  <Code>{"{ type: 'quantityChanged', id, quantity }"}</Code> - setzt die Menge. Bei 0 oder
                  weniger wird der Artikel entfernt.
                </li>
                <li>
                  <Code>{"{ type: 'removed', id }"}</Code>
                </li>
                <li>
                  <Code>{"{ type: 'cleared' }"}</Code>
                </li>
              </ul>
              <p className="mt-1">
                Außerdem: <Code>total(state)</Code> gibt den Gesamtpreis zurück. Nichts mutieren!
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was darf ein Reducer NICHT tun?',
            antworten: [
              'Ein neues Objekt zurückgeben',
              'Eine Anfrage an den Server schicken',
              'Einen switch verwenden',
            ],
            richtig: 1,
            erklaerung: 'Reducer sind rein. Nebenwirkungen gehören in Event-Handler oder Effekte.',
          },
          {
            frage: 'Was gibt useReducer zurück?',
            antworten: ['[state, setState]', '[state, dispatch]', '{ state, reducer }'],
            richtig: 1,
            erklaerung: 'dispatch(action) schickt eine Action an den Reducer.',
          },
          {
            frage: 'Wie benennt man Actions am besten?',
            antworten: ["Nach dem Ereignis: 'added'", "Nach dem Setter: 'setList'"],
            richtig: 0,
            erklaerung: 'Die Action beschreibt, was passiert ist - der Reducer entscheidet über die Folgen.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Reducer: <Code>(state, action) =&gt; newState</Code> - rein, ohne Mutation.
          </>,
          <>
            <Code>const [state, dispatch] = useReducer(reducer, initial)</Code>, dann{' '}
            <Code>{"dispatch({ type: 'event', … })"}</Code>.
          </>,
          'Alle Zustandsübergänge an einer Stelle: übersichtlich und ohne React testbar.',
          'Gut bei zusammenhängendem State mit vielen Arten von Änderungen.',
          <>
            In TypeScript: Actions als Discriminated Union - siehe <Verweis id="praxis-typescript" />.
          </>,
        ]}
      />
    </>
  )
}
