import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke, uebungDateien, uebungVarianten } from './Testen.code'

/**
 * KAPITEL 4.8 - Testen mit Vitest und React Testing Library
 *
 * Die Editoren laufen mit modus="test": Lernende schreiben die Tests selbst,
 * die Ausgabe sieht aus wie im Terminal von Vitest.
 */

const ebenen: [string, string, string][] = [
  ['Unit-Tests', 'Einzelne Funktionen: Berechnungen, Reducer, Validierung', 'Vitest'],
  ['Komponenten-Tests', 'Eine Komponente wie ein Mensch bedienen', 'Vitest + Testing Library'],
  ['End-to-End-Tests', 'Die ganze App im echten Browser, inkl. Server', 'Playwright'],
]

const abfragen: [string, string][] = [
  ['getBy…', 'Genau ein Element - sonst Fehler. Der Normalfall.'],
  ['queryBy…', 'Element oder null - um zu prüfen, dass etwas NICHT da ist.'],
  ['findBy…', 'Wartet, bis das Element auftaucht (async, mit await).'],
  ['getAllBy…', 'Mehrere Elemente als Array.'],
]

export function Testen() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Ein Test rendert eine Komponente, klickt wie ein Mensch und prüft, was danach zu sehen ist. Die Tests
          laufen hier im Editor - ändere <Code>count + 1</Code> in <Code>count + 2</Code> und der Test wird rot.
        </P>
        <TryIt id="praxis-testen-einstieg" {...beispiele['praxis-testen-einstieg']} modus="test" />
      </Abschnitt>

      <Abschnitt titel="Warum testen?">
        <P>
          Bisher hast du ausprobiert, ob dein Code funktioniert: klicken, schauen, weiter. Das klappt, bis die App
          wächst. Dann änderst du eine Stelle und etwas ganz anderes geht kaputt, ohne dass du es merkst. Tests
          sind ausprobieren <strong>als Code</strong>: einmal geschrieben, danach bei jedem Speichern in Sekunden
          wiederholt. Die Übungen in diesem Kurs prüfen deine Lösungen übrigens genauso.
        </P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Art</th>
                <th className="py-2 pr-4">Was wird geprüft?</th>
                <th className="py-2">Werkzeug</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {ebenen.map(([art, was, werkzeug]) => (
                <tr key={art}>
                  <td className="py-1.5 pr-4 font-medium">{art}</td>
                  <td className="py-1.5 pr-4">{was}</td>
                  <td className="py-1.5">{werkzeug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Viele schnelle Unit- und Komponenten-Tests, wenige langsame End-to-End-Tests für die wichtigsten Abläufe
          (Anmelden, Bestellen). In diesem Kapitel geht es um die ersten beiden.
        </P>
      </Abschnitt>

      <Abschnitt titel="Vitest: test, describe, expect">
        <P>
          <strong>Vitest</strong> ist der Test-Runner für Vite-Projekte. Ein Test ist eine Funktion mit Namen:{' '}
          <Code>test('was passieren soll', () =&gt; {'{ … }'})</Code>. Darin prüft <Code>expect(wert)</Code> mit
          einem <strong>Matcher</strong> wie <Code>toBe</Code>, ob das Ergebnis stimmt. <Code>describe</Code> fasst
          Tests zu einer Gruppe zusammen.
        </P>
        <TryIt id="praxis-testen-vitest" {...beispiele['praxis-testen-vitest']} modus="test" />
        <Liste>
          <li>
            <Code>toBe</Code> vergleicht mit <Code>===</Code>, <Code>toEqual</Code> den Inhalt - für Objekte und
            Arrays (<Verweis id="js-referenzen" />).
          </li>
          <li>
            Fehler prüfst du, indem du den Aufruf in eine Funktion packst:{' '}
            <Code>expect(() =&gt; …).toThrow()</Code>.
          </li>
          <li>
            Am leichtesten testbar sind <strong>reine Funktionen</strong>, z. B. Reducer (
            <Verweis id="hooks-usereducer" />): gleiche Eingabe, gleiche Ausgabe, kein React nötig.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Komponenten testen mit Testing Library">
        <P>
          <strong>React Testing Library</strong> rendert eine Komponente und sucht Elemente so, wie Menschen sie
          finden: über ihre <strong>Rolle</strong> und ihren sichtbaren Namen, nicht über CSS-Klassen oder
          Komponenten-Interna. Mit <strong>user-event</strong> tippst und klickst du wie echte Nutzer.
        </P>
        <TryIt id="praxis-testen-rtl" {...beispiele['praxis-testen-rtl']} modus="test" />
        <P>Die Abfragen gibt es in vier Varianten:</P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {abfragen.map(([name, text]) => (
                <tr key={name}>
                  <td className="py-1.5 pr-4 align-top">
                    <Code>{name}</Code>
                  </td>
                  <td className="py-1.5">{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Und wonach suchen? In dieser Reihenfolge: <Code>ByRole</Code> (Knöpfe, Überschriften, Felder …),{' '}
          <Code>ByLabelText</Code> (Formularfelder), <Code>ByText</Code>, und nur als letzter Ausweg{' '}
          <Code>ByTestId</Code>. Findet <Code>getByRole</Code> etwas nicht, findet es oft auch ein Screenreader
          nicht - dazu mehr in <Verweis id="praxis-barrierefreiheit" />.
        </P>
        <Hinweis variante="tipp">
          <Code>userEvent.setup()</Code> einmal pro Test, danach jede Aktion mit <Code>await</Code>:{' '}
          <Code>user.click()</Code>, <Code>user.type()</Code>, <Code>user.keyboard('{'{Enter}'}')</Code>,{' '}
          <Code>user.selectOptions()</Code>. Es löst alle Ereignisse aus, die auch ein echter Klick auslöst - das
          ältere <Code>fireEvent</Code> nur ein einzelnes.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Attrappen und asynchroner Code">
        <P>
          Viele Komponenten rufen etwas von außen auf: eine Callback-Prop, einen Server. Im Test ersetzt du das durch
          eine <strong>Attrappe</strong> (Mock). <Code>vi.fn()</Code> merkt sich jeden Aufruf und liefert, was du
          vorgibst. So prüfst du, <em>ob</em> und <em>womit</em> sie aufgerufen wurde - und kannst auch den
          Fehlerfall durchspielen.
        </P>
        <TryIt id="praxis-testen-mocks" {...beispiele['praxis-testen-mocks']} modus="test" />
        <P>
          Lädt die Komponente selbst Daten (<Verweis id="praxis-daten" />), ersetzt <Code>vi.spyOn()</Code> für die
          Dauer eines Tests das globale <Code>fetch</Code>. <Code>findBy…</Code> wartet, bis die Antwort angezeigt
          wird:
        </P>
        <TryIt id="praxis-testen-fetch" {...beispiele['praxis-testen-fetch']} modus="test" />
        <Hinweis variante="info">
          Größere Projekte fangen Anfragen lieber auf Netzwerkebene ab, mit <strong>MSW</strong> (Mock Service
          Worker). Dann muss der Test nicht wissen, ob die Komponente <Code>fetch</Code>, TanStack Query oder etwas
          anderes benutzt.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Was sollte man testen?">
        <Liste>
          <li>
            <strong>Verhalten, nicht Umsetzung:</strong> „Nach dem Klick steht 2 da“ - nicht „der State heißt count“.
            Solche Tests überleben jedes Umbauen, solange die App das Gleiche tut.
          </li>
          <li>
            <strong>Was kaputtgehen könnte:</strong> Grenzfälle (leer, 0, Maximum), Fehlerfälle, Regeln aus der
            Fachlichkeit. Nicht jede Zeile - 100 % Abdeckung ist kein Ziel.
          </li>
          <li>
            <strong>Für jeden gefundenen Bug ein Test</strong>, der ihn zeigt. Dann kommt er nie wieder.
          </li>
          <li>
            <strong>Ein Test prüft eine Sache</strong> und sagt im Namen, welche. Schlägt er fehl, weißt du sofort,
            was fehlt.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Im eigenen Projekt einrichten">
        <CodeBlock titel="Terminal" code={codeBloecke.installieren} />
        <CodeBlock code={codeBloecke.konfiguration} />
        <CodeBlock code={codeBloecke.setup} />
        <CodeBlock titel="Terminal" code={codeBloecke.ausfuehren} />
        <P>
          Testdateien liegen neben dem Code und heißen <Code>Name.test.tsx</Code> - Vitest findet sie
          automatisch. <Code>jsdom</Code> stellt in Node ein simuliertes <Code>document</Code> bereit.
        </P>
        <Hinweis variante="info">
          Im Editor hier laufen das echte Testing Library und user-event im Browser. <Code>vitest</Code> ist ein
          Nachbau mit den wichtigsten Funktionen (<Code>test</Code>, <Code>describe</Code>, <Code>expect</Code> mit
          den jest-dom-Matchern, <Code>vi.fn</Code>, <Code>vi.spyOn</Code>). Fake-Timer und <Code>vi.mock</Code> gibt
          es nur im echten Vitest.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="praxis-testen-uebung"
          {...beispiele['praxis-testen-uebung']}
          modus="test"
          dateien={uebungDateien}
          varianten={uebungVarianten}
          aufgabe={
            <>
              <p>
                Diesmal schreibst du die Tests. <Code>QuantityPicker</Code> (oben) wählt eine Menge von 1 bis{' '}
                <Code>max</Code>. Ob deine Tests gut sind, prüft ein <strong>Mutationstest</strong>: Sie laufen auch
                gegen vier kaputte Fassungen der Komponente - und müssen jede davon erwischen.
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>Unter 1 geht es nicht: „Decrease“ ist am Anfang deaktiviert.</li>
                <li>
                  Beim Maximum ist Schluss: Mit <Code>max={'{3}'}</Code> steht nach zwei Klicks auf „Increase“ eine 3
                  da, und „Increase“ ist deaktiviert.
                </li>
                <li>
                  <Code>onChange</Code> bekommt den <em>neuen</em> Wert.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Wie prüfst du, dass eine Fehlermeldung NICHT angezeigt wird?',
            antworten: [
              "expect(screen.getByRole('alert')).not.toBeInTheDocument()",
              "expect(screen.queryByRole('alert')).not.toBeInTheDocument()",
              "expect(screen.findByRole('alert')).toBeNull()",
            ],
            richtig: 1,
            erklaerung: 'getBy… wirft schon beim Suchen einen Fehler, wenn nichts da ist. queryBy… liefert null.',
          },
          {
            frage: 'Womit wartest du auf ein Element, das erst nach dem Laden erscheint?',
            antworten: ['getByText', 'await findByText', 'setTimeout im Test'],
            richtig: 1,
            erklaerung: 'findBy… versucht es wiederholt, bis das Element da ist oder die Zeit abläuft.',
          },
          {
            frage: 'Welche Abfrage bevorzugt Testing Library?',
            antworten: ['getByTestId', 'container.querySelector(".btn")', 'getByRole'],
            richtig: 2,
            erklaerung: 'Rolle und Name sind das, was Menschen und Screenreader wahrnehmen.',
          },
          {
            frage: 'Wofür ist vi.fn()?',
            antworten: [
              'Für eine Attrappe, die ihre Aufrufe mitschreibt',
              'Um Tests schneller zu machen',
              'Um eine Komponente zu rendern',
            ],
            richtig: 0,
            erklaerung: 'Damit prüfst du z. B. mit toHaveBeenCalledWith, ob ein Callback richtig aufgerufen wurde.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>test</Code> + <Code>expect(…).toBe/toEqual/…</Code>, gruppiert mit <Code>describe</Code>.
          </>,
          <>
            Komponenten: <Code>render</Code>, dann über <Code>screen.getByRole</Code> suchen und mit{' '}
            <Code>userEvent</Code> bedienen.
          </>,
          <>
            <Code>getBy</Code> = muss da sein, <Code>queryBy</Code> = darf fehlen, <Code>findBy</Code> = wartet.
          </>,
          <>
            Abhängigkeiten ersetzen: <Code>vi.fn()</Code> für Callbacks, <Code>vi.spyOn</Code> für{' '}
            <Code>fetch</Code>.
          </>,
          'Verhalten testen, nicht Umsetzung - und für jeden Bug ein Test.',
        ]}
      />
    </>
  )
}
