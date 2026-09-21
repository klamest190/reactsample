import { Abschnitt, Code, Hinweis, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './UseRef.code'
import { RefDemo } from '../demos/RefDemo'

/**
 * KAPITEL 4.3 - useRef
 */
export function UseRef() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P><Code>useRef</Code> gibt dir Zugriff auf ein echtes DOM-Element.</P>
        <TryIt
          id="hooks-useref-einstieg"
          {...beispiele['hooks-useref-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Eine Schublade, die Renders überlebt">
        <P>
          <Code>useRef(initial)</Code> gibt dir ein Objekt <Code>{'{ current: initial }'}</Code>. React
          gibt dir bei jedem Render <strong>dasselbe Objekt</strong> zurück. Du kannst{' '}
          <Code>current</Code> jederzeit ändern - und das löst <strong>kein</strong> neues Rendern
          aus.
        </P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4"></th>
                <th className="py-2 pr-4">useState</th>
                <th className="py-2">useRef</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="py-2 pr-4 font-medium">Ändern löst Render aus</td>
                <td className="py-2 pr-4">ja</td>
                <td className="py-2">nein</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Ändern</td>
                <td className="py-2 pr-4">über den Setter, wirkt ab dem nächsten Render</td>
                <td className="py-2">
                  <Code>ref.current = x</Code>, sofort
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Beim Rendern lesen</td>
                <td className="py-2 pr-4">ja</td>
                <td className="py-2">nein (außer beim Initialisieren)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Typisch für</td>
                <td className="py-2 pr-4">alles, was man sieht</td>
                <td className="py-2">DOM-Elemente, Timer-IDs, „Mechanik“</td>
              </tr>
            </tbody>
          </table>
        </div>
        <TryIt
          id="hooks-useref-vergleich"
          {...beispiele['hooks-useref-vergleich']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Zugriff auf DOM-Elemente">
        <P>
          Übergibst du ein Ref-Objekt als <Code>ref</Code>-Prop an ein JSX-Element, setzt React nach
          dem Rendern <Code>ref.current</Code> auf den DOM-Knoten. So kannst du fokussieren, scrollen,
          messen oder Browser-APIs wie Video-Wiedergabe steuern.
        </P>
        <TryIt
          id="hooks-useref-dom"
          {...beispiele['hooks-useref-dom']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Werte merken: Timer-IDs & Co.">
        <P>
          Die ID eines Intervalls braucht niemand zu sehen - aber du musst sie beim Stoppen
          wiederfinden. Eine normale Variable wäre beim nächsten Render weg, State würde unnötig
          rendern. Genau dafür ist eine Ref da.
        </P>
        <RefDemo />
      </Abschnitt>

      <Abschnitt titel="Refs an eigene Komponenten weitergeben">
        <P>
          Seit React 19 ist <Code>ref</Code> bei Funktionskomponenten eine ganz normale Prop. Die
          Komponente reicht sie einfach an ein DOM-Element weiter. (Früher brauchte man dafür{' '}
          <Code>forwardRef</Code> - das siehst du noch oft in älterem Code.)
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Hinweis variante="warnung">
          <Code>ref.current</Code> <strong>nicht während des Renderns</strong> lesen oder schreiben
          (Ausnahme: einmalige Initialisierung). React weiß nichts von Ref-Änderungen - was du damit
          anzeigst, kann veralten. Refs gehören in Event-Handler und Effekte.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Nur ausgewählte Methoden freigeben: useImperativeHandle">
        <P>
          Normalerweise bekommt die Elternkomponente über die Ref das ganze DOM-Element - und kann damit alles machen.
          Mit <Code>useImperativeHandle</Code> bestimmt die Kindkomponente selbst, was sie nach außen anbietet: hier nur{' '}
          <Code>focus()</Code> und <Code>clear()</Code>.
        </P>
        <TryIt id="hooks-useref-imperativ" {...beispiele['hooks-useref-imperativ']} modus="react" />
        <Hinweis variante="tipp">
          Das ist die Ausnahme, nicht die Regel. Was sich mit Props ausdrücken lässt (<Code>{'value'}</Code>,{' '}
          <Code>{'open'}</Code>), gehört in Props. Imperative Methoden sind für Dinge wie Fokus, Scrollen oder Abspielen
          gedacht.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Messen vor dem Zeichnen: useLayoutEffect">
        <P>
          <Code>useEffect</Code> läuft, <em>nachdem</em> der Browser gezeichnet hat (<Verweis id="hooks-useeffect" />).
          Misst du dort ein Element und stellst danach etwas um, sieht man kurz den falschen Zustand - es flackert.{' '}
          <Code>useLayoutEffect</Code> läuft direkt nach der DOM-Änderung, aber <strong>vor</strong> dem Zeichnen.
        </P>
        <TryIt id="hooks-useref-layout" {...beispiele['hooks-useref-layout']} modus="react" />
        <Hinweis variante="warnung">
          <Code>useLayoutEffect</Code> blockiert das Zeichnen, bis er fertig ist. Nimm ihn nur zum Messen und Positionieren
          (Tooltips, Popups, Scroll-Position) - für alles andere bleibt <Code>useEffect</Code> richtig.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="hooks-useref-uebung"
          {...beispiele['hooks-useref-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Baue eine Stoppuhr mit Rundenzeiten:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Anzeige in der <Code>{'<h1>'}</Code> in Sekunden mit einer Nachkommastelle (z. B. „3.4 s“, Start „0.0 s“). Aktualisierung alle
                  100 ms.
                </li>
                <li>
                  Die <strong>Intervall-ID</strong> und die <strong>Startzeit</strong> (
                  <Code>Date.now()</Code>) liegen in Refs.
                </li>
                <li>Knöpfe: „Start“, „Stop“, „Lap“ (speichert die aktuelle Zeit als <Code>{'<li>'}</Code> in einer Liste), „Reset“.</li>
                <li>Beim Entfernen der Komponente muss das Intervall gestoppt werden.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was passiert, wenn du ref.current = 5 setzt?',
            antworten: [
              'Die Komponente rendert neu',
              'Der Wert ist sofort gespeichert, es gibt keinen Render',
              'Ein Fehler, refs sind read-only',
            ],
            richtig: 1,
            erklaerung: 'Refs sind veränderbar und für React „unsichtbar“.',
          },
          {
            frage: 'Wann ist eine DOM-Ref (ref={myRef}) gesetzt?',
            antworten: ['Schon beim ersten Rendern', 'Nachdem React das DOM aktualisiert hat'],
            richtig: 1,
            erklaerung: 'Deshalb nutzt man sie in Effekten oder Event-Handlern, nicht beim Rendern.',
          },
          {
            frage: 'Wo speicherst du die ID von setInterval?',
            antworten: ['In einer lokalen Variable', 'In useState', 'In useRef'],
            richtig: 2,
            erklaerung: 'Sie muss Renders überleben, soll aber keinen Render auslösen.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>useRef</Code> liefert ein stabiles <Code>{'{ current }'}</Code>-Objekt; Ändern löst
            keinen Render aus.
          </>,
          <>
            DOM-Zugriff: <Code>{'<input ref={myRef} />'}</Code>, dann{' '}
            <Code>myRef.current.focus()</Code>.
          </>,
          'Für Werte der „Mechanik“: Timer-IDs, Startzeiten, vorherige Werte.',
          <>
            React 19: <Code>ref</Code> ist eine normale Prop - <Code>forwardRef</Code> ist nicht mehr
            nötig.
          </>,
          'Refs nicht beim Rendern lesen/schreiben - Anzeigbares gehört in State.',
        ]}
      />
    </>
  )
}
