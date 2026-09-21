import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './UseContext.code'
import { ContextDemo } from '../demos/ContextDemo'

/**
 * KAPITEL 4.6 - useContext
 */
export function UseContext() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P><Code>useContext</Code> liest einen Wert, den eine Komponente weiter oben bereitstellt - ganz ohne Props.</P>
        <TryIt
          id="hooks-usecontext-einstieg"
          {...beispiele['hooks-usecontext-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Das Problem: Prop Drilling">
        <P>
          Manche Werte braucht fast die ganze App: angemeldeter Benutzer, Farbschema, Sprache. Mit
          Props müsstest du sie durch jede Zwischenebene reichen - auch durch Komponenten, die sie gar
          nicht selbst benutzen. Das nennt man <strong>Prop Drilling</strong>.
        </P>
        <TryIt
          id="hooks-usecontext-drilling"
          {...beispiele['hooks-usecontext-drilling']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Context in drei Schritten">
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Liste>
          <li>
            <Code>useContext</Code> liefert den Wert des <strong>nächsten Providers darüber</strong>.
            Gibt es keinen, den Default-Wert aus <Code>createContext</Code>.
          </li>
          <li>
            Ändert sich der <Code>value</Code> des Providers, rendern{' '}
            <strong>alle Komponenten, die den Context lesen</strong>, automatisch neu.
          </li>
          <li>
            Context ist <strong>kein State-Manager</strong>, sondern ein Transportweg. Der State lebt
            weiterhin in <Code>useState</Code> oder <Code>useReducer</Code> - meist in einer
            eigenen Provider-Komponente.
          </li>
        </Liste>
        <ContextDemo />
      </Abschnitt>

      <Abschnitt titel="Das Profi-Muster: Provider + Reducer + eigener Hook">
        <P>
          In echten Projekten kombiniert man Context mit <Code>useReducer</Code> und kapselt alles in
          einer Datei. Komponenten sehen nur noch einen Hook - wie <Code>useTheme()</Code> in diesem
          Projekt.
        </P>
        <TryIt
          id="hooks-usecontext-muster"
          {...beispiele['hooks-usecontext-muster']}
          modus="react"
        />
        <Hinweis variante="warnung">
          Jede Änderung am Context-Wert rendert <em>alle</em> Consumer neu. Halte den Wert mit{' '}
          <Code>useMemo</Code> stabil und baue lieber mehrere kleine Contexts (z. B. einen für Daten,
          einen für <Code>dispatch</Code>) als einen riesigen. Und: Nicht alles gehört in Context -
          für zwei Ebenen sind Props völlig in Ordnung.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="hooks-usecontext-uebung"
          {...beispiele['hooks-usecontext-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Mach die App mehrsprachig:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Lege einen <Code>LanguageContext</Code> an. Der Provider hält die Sprache (
                  <Code>'en'</Code> oder <Code>'de'</Code>) im State.
                </li>
                <li>
                  Schreibe einen Hook <Code>useTranslation()</Code>, der{' '}
                  <Code>{'{ language, t, toggle }'}</Code> zurückgibt. <Code>t('greeting')</Code> liefert
                  den Text aus <Code>TEXTS</Code> in der aktuellen Sprache.
                </li>
                <li>
                  <Code>Greeting</Code> und <Code>LanguageSwitch</Code> nutzen den Hook - ohne Props.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Welchen Wert liefert useContext, wenn kein Provider darüber liegt?',
            antworten: ['undefined', 'Den Default-Wert aus createContext', 'Einen Fehler'],
            richtig: 1,
            erklaerung: 'Deshalb nimmt man oft null als Default und prüft im eigenen Hook darauf.',
          },
          {
            frage: 'Was passiert, wenn sich der value eines Providers ändert?',
            antworten: [
              'Nichts, bis die Seite neu lädt',
              'Alle Komponenten, die den Context lesen, rendern neu',
              'Nur direkte Kinder rendern neu',
            ],
            richtig: 1,
            erklaerung: 'Auch memo-Komponenten rendern neu, wenn sie den geänderten Context lesen.',
          },
          {
            frage: 'Wofür ist Context NICHT gedacht?',
            antworten: [
              'Werte tief im Baum verfügbar machen',
              'Jeden State ersetzen, auch wenn nur ein Kind ihn braucht',
              'Theme oder angemeldeten Benutzer bereitstellen',
            ],
            richtig: 1,
            erklaerung: 'Für nahe Komponenten sind Props einfacher und expliziter.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Context löst Prop Drilling: createContext → Provider → useContext.',
          <>
            React 19: <Code>{'<MyContext value={…}>'}</Code> statt <Code>.Provider</Code>.
          </>,
          'Context transportiert nur - der State lebt in useState/useReducer im Provider.',
          'Muster: Provider-Komponente + eigener Hook mit Null-Prüfung.',
          <>
            Wert mit <Code>useMemo</Code> stabil halten, lieber mehrere kleine Contexts.
          </>,
        ]}
      />
    </>
  )
}
