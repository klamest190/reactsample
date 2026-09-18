import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Referenzen.code'

/**
 * KAPITEL 1.6 - Referenzen & Immutability
 * Das wichtigste JS-Kapitel für React: Warum man State nie mutiert.
 */
export function Referenzen() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Zwei Variablen, aber nur ein Array: Zuweisen kopiert nicht.</P>
        <TryIt
          id="js-referenzen-einstieg"
          {...beispiele['js-referenzen-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Werte und Referenzen">
        <P>
          Primitive Werte (Zahlen, Strings, Booleans …) werden <strong>kopiert</strong>, wenn du sie
          einer anderen Variable zuweist. Objekte und Arrays dagegen nicht: Die Variable enthält nur
          eine <strong>Referenz</strong> - eine Art Adresse, unter der das Objekt im Speicher liegt.
          Zwei Variablen können auf <em>dasselbe</em> Objekt zeigen.
        </P>
        <TryIt
          id="js-referenzen-1"
          {...beispiele['js-referenzen-1']}
        />
        <CodeBlock
          titel="Vorstellung im Speicher"
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="Warum React das so wichtig nimmt">
        <P>
          Wenn du State setzt, prüft React mit <Code>Object.is(prev, next)</Code> - im Prinzip{' '}
          <Code>===</Code> - ob sich etwas geändert hat. Verändert du ein Objekt direkt
          (<strong>Mutation</strong>), bleibt die Referenz gleich. Für React sieht es aus, als wäre
          nichts passiert: <strong>Kein Re-Render</strong>, die Oberfläche bleibt veraltet.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel2}
        />
        <TryIt
          id="js-referenzen-2"
          {...beispiele['js-referenzen-2']}
        />
        <Hinweis variante="info">
          Unveränderlichkeit (<strong>Immutability</strong>) hat noch mehr Vorteile: Alte Zustände
          bleiben erhalten (Undo!), und Optimierungen wie <Code>memo</Code> können mit einem
          schnellen <Code>===</Code> prüfen, ob sich etwas geändert hat.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die Update-Muster">
        <P>Diese Muster wirst du in React immer wieder schreiben:</P>
        <TryIt
          id="js-referenzen-3"
          {...beispiele['js-referenzen-3']}
        />
      </Abschnitt>

      <Abschnitt titel="Flache vs. tiefe Kopien">
        <P>
          Spread kopiert nur die <strong>oberste Ebene</strong>. Verschachtelte Objekte darin sind
          weiterhin geteilte Referenzen. Wer verschachtelt ändert, muss jede Ebene auf dem Weg
          kopieren.
        </P>
        <TryIt
          id="js-referenzen-4"
          {...beispiele['js-referenzen-4']}
        />
        <Liste>
          <li>Tief verschachtelten State möglichst vermeiden - flache Strukturen sind leichter zu aktualisieren.</li>
          <li>
            <Code>structuredClone</Code> kopiert alles, ist aber langsamer und erzeugt überall neue
            Referenzen.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="js-referenzen-uebung"
          {...beispiele['js-referenzen-uebung']}
          aufgabe={
            <>
              <p>
                Schreibe drei Funktionen, die ein Array von Todos <strong>nicht verändern</strong>,
                sondern ein neues zurückgeben:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>addTodo(todos, text)</Code> - hängt{' '}
                  <Code>{'{ id: todos.length + 1, text, done: false }'}</Code> an
                </li>
                <li>
                  <Code>toggleTodo(todos, id)</Code> - kehrt <Code>done</Code> beim passenden Todo um
                </li>
                <li>
                  <Code>renameTodo(todos, id, text)</Code> - ändert den Text beim passenden Todo
                </li>
              </ul>
              <p className="mt-1">Die Tests prüfen auch, dass das Original unverändert bleibt.</p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was ergibt [1] === [1] ?',
            antworten: ['true', 'false'],
            richtig: 1,
            erklaerung: 'Zwei Array-Literale sind zwei verschiedene Objekte mit verschiedenen Referenzen.',
          },
          {
            frage: 'Warum rendert React nach list.push(x); setList(list) nicht neu?',
            antworten: [
              'push ist in React verboten',
              'Die Referenz ist dieselbe - React sieht keine Änderung',
              'setListe braucht eine Funktion',
            ],
            richtig: 1,
            erklaerung: 'React vergleicht alt und neu mit Object.is. Gleiche Referenz = keine Änderung.',
          },
          {
            frage: 'Was kopiert { ...user } ?',
            antworten: ['Alle Ebenen', 'Nur die oberste Ebene', 'Nichts, es ist eine Referenz'],
            richtig: 1,
            erklaerung: 'Spread ist eine flache Kopie - verschachtelte Objekte werden weiter geteilt.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Primitive werden kopiert, Objekte und Arrays nur als Referenz weitergegeben.',
          <>
            <Code>===</Code> bei Objekten vergleicht die Referenz, nicht den Inhalt.
          </>,
          'React erkennt Änderungen an einer neuen Referenz - deshalb State nie mutieren.',
          <>
            Muster: <Code>[...arr, x]</Code>, <Code>arr.filter(…)</Code>,{' '}
            <Code>{'arr.map(x => x.id === id ? { ...x, … } : x)'}</Code>.
          </>,
          'Spread kopiert flach: verschachtelte Ebenen einzeln kopieren.',
        ]}
      />
    </>
  )
}
