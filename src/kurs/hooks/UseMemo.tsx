import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './UseMemo.code'
import { PerformanceDemo } from '../demos/PerformanceDemo'

/**
 * KAPITEL 4.4 - useMemo, useCallback & memo
 */
export function UseMemo() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P><Code>useMemo</Code> rechnet nur neu, wenn sich eine Abhängigkeit ändert. Achte auf die Konsole.</P>
        <TryIt
          id="hooks-usememo-einstieg"
          {...beispiele['hooks-usememo-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Wann rendert eine Komponente?">
        <P>
          Rendert eine Komponente, rendert React standardmäßig <strong>alle ihre Kinder</strong> mit
          - egal, ob sich deren Props geändert haben. Das ist fast immer schnell genug, denn Rendern
          heißt nur „Funktion aufrufen“; das DOM ändert React ohnehin nur dort, wo nötig.
        </P>
        <TryIt
          id="hooks-usememo-render"
          {...beispiele['hooks-usememo-render']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="memo: Rendern überspringen">
        <P>
          <Code>memo(Component)</Code> erzeugt eine Variante, die nur neu rendert, wenn sich eine
          Prop geändert hat. Verglichen wird jede Prop mit <Code>Object.is</Code> - also für Objekte
          und Funktionen die <strong>Referenz</strong> (<Verweis nr="1.6" />).
        </P>
        <TryIt
          id="hooks-usememo-memo"
          {...beispiele['hooks-usememo-memo']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="useCallback und useMemo">
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Liste>
          <li>
            Beide geben beim nächsten Render den <strong>gespeicherten Wert</strong> zurück, solange
            sich keine Dependency geändert hat.
          </li>
          <li>
            <Code>useMemo</Code> hat zwei Einsätze: <strong>teure Berechnungen</strong> nicht bei jedem
            Render wiederholen und <strong>stabile Objekte/Arrays</strong> an memo-Kinder oder
            Effekt-Dependencies geben.
          </li>
          <li>
            <Code>useCallback</Code> brauchst du fast nur, wenn die Funktion an ein{' '}
            <Code>memo</Code>-Kind geht oder in einem Dependency-Array steht.
          </li>
        </Liste>
        <PerformanceDemo />
        <TryIt
          id="hooks-usememo-teuer"
          {...beispiele['hooks-usememo-teuer']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Der React Compiler">
        <P>
          Den richtigen Stellen <Code>useMemo</Code>, <Code>useCallback</Code> und <Code>memo</Code> zu geben, ist
          mühsam und fehleranfällig. Der <strong>React Compiler</strong> übernimmt das beim Build: Er analysiert jede
          Komponente und merkt sich Zwischenergebnisse automatisch - genau dort, wo sich Werte nicht geändert haben.
        </P>
        <CodeBlock code={codeBloecke.compilerVorher} />
        <P>So schaltest du ihn in einem Vite-Projekt ein:</P>
        <CodeBlock code={codeBloecke.compilerEinrichten} />
        <Liste>
          <li>
            Der Compiler verlässt sich auf die <strong>Regeln von React</strong>: Komponenten sind rein, Props und
            State werden nicht verändert, Hooks nur oben aufgerufen (<Verweis id="hooks-usestate" />). Bricht eine
            Komponente die Regeln, lässt er sie einfach aus.
          </li>
          <li>
            Bestehende <Code>useMemo</Code>- und <Code>useCallback</Code>-Aufrufe dürfen bleiben. Neue schreibst du mit
            Compiler nur noch in Ausnahmefällen - zum Beispiel, wenn ein Wert als Dependency eines Effekts stabil sein
            muss.
          </li>
          <li>
            In den React DevTools tragen optimierte Komponenten das Abzeichen <strong>„Memo ✨“</strong>.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Wann optimieren?">
        <Hinweis variante="warnung">
          <strong>Erst messen, dann optimieren.</strong> <Code>memo</Code>, <Code>useMemo</Code> und{' '}
          <Code>useCallback</Code> kosten selbst Speicher und Vergleiche, und falsche Dependencies
          erzeugen schwer zu findende Fehler. Die meisten Komponenten brauchen nichts davon.
        </Hinweis>
        <Liste>
          <li>
            Oft hilft Umstrukturieren mehr: State <strong>nach unten</strong> in die Komponente
            verschieben, die ihn braucht, oder schwere Teile als <Code>children</Code> übergeben.
          </li>
          <li>
            Der <strong>React Compiler</strong> setzt diese Optimierungen automatisch beim Build ein.
            Mit ihm schreibt man <Code>useMemo</Code> und <Code>useCallback</Code> kaum noch von Hand -
            das Verständnis dahinter bleibt trotzdem wichtig.
          </li>
          <li>
            Messen kannst du mit dem <strong>Profiler</strong> der React DevTools.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="hooks-usememo-uebung"
          {...beispiele['hooks-usememo-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Das Suchfeld ruckelt, weil bei jedem Tastendruck 20.000 Einträge sortiert werden und
                die langsame Tabelle neu rendert. Optimiere, <strong>ohne die Funktion zu ändern</strong>:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Das Sortieren soll nur laufen, wenn sich <Code>direction</Code> ändert.
                </li>
                <li>
                  <Code>Table</Code> soll beim Tippen im Notizfeld gar nicht mehr rendern.
                </li>
                <li>Prüfe in der Konsole, dass deine Optimierung wirkt.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Ein memo-Kind bekommt style={{ color: "red" }}. Rendert es bei jedem Eltern-Render neu?',
            antworten: [
              'Nein, der Inhalt ist gleich',
              'Ja, das Objekt-Literal ist bei jedem Render eine neue Referenz',
            ],
            richtig: 1,
            erklaerung: 'memo vergleicht Referenzen. Abhilfe: useMemo oder das Objekt außerhalb der Komponente definieren.',
          },
          {
            frage: 'Was ist der Unterschied zwischen useMemo und useCallback?',
            antworten: [
              'useMemo merkt sich ein Ergebnis, useCallback eine Funktion',
              'useCallback ist schneller',
              'useMemo ist nur für Arrays',
            ],
            richtig: 0,
            erklaerung: 'useCallback(fn, deps) entspricht useMemo(() => fn, deps).',
          },
          {
            frage: 'Wann solltest du useMemo einsetzen?',
            antworten: [
              'Bei jeder Berechnung',
              'Wenn eine Berechnung messbar teuer ist oder eine stabile Referenz gebraucht wird',
              'Nie, der Compiler macht das',
            ],
            richtig: 1,
            erklaerung: 'Optimierung hat Kosten. Erst messen, dann gezielt einsetzen.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Rendert eine Komponente, rendern ihre Kinder standardmäßig mit.',
          <>
            <Code>memo</Code> überspringt Renders bei gleichen Props - verglichen per Referenz.
          </>,
          <>
            <Code>useMemo</Code> merkt sich Ergebnisse, <Code>useCallback</Code> Funktionen - jeweils bis
            sich eine Dependency ändert.
          </>,
          'Die drei wirken meist nur zusammen: memo-Kind + stabile Props.',
          'Erst messen (React DevTools Profiler), dann optimieren. Der React Compiler nimmt viel davon ab.',
        ]}
      />
    </>
  )
}
