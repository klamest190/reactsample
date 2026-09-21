import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './EigeneHooks.code'
import { HookDemo } from '../demos/HookDemo'

/**
 * KAPITEL 4.7 - Eigene Hooks
 */
export function EigeneHooks() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Ein eigener Hook ist eine Funktion, die mit <Code>use</Code> beginnt und andere Hooks benutzt.</P>
        <TryIt
          id="hooks-eigene-einstieg"
          {...beispiele['hooks-eigene-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Logik wiederverwenden">
        <P>
          Komponenten teilen Oberfläche. Aber wie teilt man <strong>Verhalten</strong> - etwa „merke
          dir die Fenstergröße“ oder „speichere diesen Wert im localStorage“? Mit einem{' '}
          <strong>eigenen Hook</strong>: einer ganz normalen Funktion, deren Name mit{' '}
          <Code>use</Code> beginnt und die andere Hooks aufruft.
        </P>
        <Liste>
          <li>
            Der Name <strong>muss</strong> mit <Code>use</Code> beginnen - daran erkennen React und der
            Linter, dass die Hook-Regeln gelten.
          </li>
          <li>Ein eigener Hook darf beliebige andere Hooks aufrufen.</li>
          <li>
            Er teilt <strong>Logik, nicht State</strong>: Jede Komponente, die ihn aufruft, bekommt
            ihren eigenen, unabhängigen State - genau wie <Code>createCounter()</Code> aus Kapitel
            1.3.
          </li>
        </Liste>
        <TryIt
          id="hooks-eigene-extrahieren"
          {...beispiele['hooks-eigene-extrahieren']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Die Hooks in diesem Projekt">
        <P>
          Unter <Code>src/hooks/</Code> liegen mehrere eigene Hooks, die die App selbst benutzt -
          jeweils kommentiert. Die Rückgabe gestaltest du frei: ein einzelner Wert, ein Tupel wie bei{' '}
          <Code>useState</Code> oder ein Objekt mit Namen.
        </P>
        <CodeBlock
          titel="src/hooks/useDebounce.ts"
          code={codeBloecke.beispiel1}
        />
        <HookDemo />
        <P>
          Weitere Beispiele: <Code>useWindowSize</Code> (Event abonnieren),{' '}
          <Code>usePrevious</Code> (vorheriger Wert per Ref) und <Code>useHashRoute</Code> - der
          Mini-Router dieser App auf Basis von <Code>useSyncExternalStore</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Selbst gebaut: useLocalStorage">
        <TryIt
          id="hooks-eigene-localstorage"
          {...beispiele['hooks-eigene-localstorage']}
          modus="react"
        />
        <Hinweis variante="tipp">
          Faustregel: Taucht dieselbe Kombination aus <Code>useState</Code> und{' '}
          <Code>useEffect</Code> zum zweiten Mal auf, gehört sie in einen Hook. Und wenn ein Effekt
          schwer zu benennen ist, hilft oft die Frage: Wie würde der Hook dafür heißen?
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="hooks-eigene-uebung"
          {...beispiele['hooks-eigene-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Schreibe den Hook <Code>{'useCounter(initial, { min, max })'}</Code>. Er gibt ein Objekt
                zurück:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>value</Code>, <Code>increment()</Code>, <Code>decrement()</Code>,{' '}
                  <Code>reset()</Code>
                </li>
                <li>
                  <Code>atMin</Code> und <Code>atMax</Code> (Booleans, abgeleitet)
                </li>
                <li>Der Wert bleibt immer zwischen min und max.</li>
              </ul>
              <p className="mt-1">
                Die beiden Komponenten unten benutzen ihn schon. Prüfe, dass sie unabhängig zählen.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Zwei Komponenten rufen denselben eigenen Hook mit useState auf. Teilen sie sich den State?',
            antworten: ['Ja', 'Nein, jede bekommt ihren eigenen State'],
            richtig: 1,
            erklaerung: 'Hooks teilen Logik. Für geteilten State: State anheben oder Context.',
          },
          {
            frage: 'Warum muss ein eigener Hook mit „use“ beginnen?',
            antworten: [
              'Sonst lässt JavaScript den Aufruf nicht zu',
              'Damit React-Tools erkennen, dass die Hook-Regeln gelten',
              'Das ist nur Geschmackssache',
            ],
            richtig: 1,
            erklaerung: 'Linter und React Compiler prüfen Funktionen mit use-Präfix nach den Hook-Regeln.',
          },
          {
            frage: 'Eine Hilfsfunktion formatiert nur ein Datum und ruft keine Hooks auf. Soll sie „useDate“ heißen?',
            antworten: ['Ja', 'Nein, dann ist es eine normale Funktion'],
            richtig: 1,
            erklaerung: 'Ohne Hooks darin ist das Präfix irreführend - und die Funktion dürfte sonst nicht in if stehen.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Eigener Hook = Funktion mit <Code>use</Code>-Präfix, die andere Hooks nutzt.
          </>,
          'Er teilt Logik, nicht State - jeder Aufruf hat eigenen State.',
          'Rückgabe frei wählbar: Wert, Tupel oder Objekt.',
          'Wiederholte useState/useEffect-Kombinationen sind der typische Kandidat.',
          <>
            Beispiele im Projekt: <Code>src/hooks/</Code>.
          </>,
        ]}
      />
    </>
  )
}
