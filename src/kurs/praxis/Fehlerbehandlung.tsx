import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Fehlerbehandlung.code'
import { FehlerDemo } from '../demos/FehlerDemo'

/**
 * KAPITEL 4.4 - Fehlerbehandlung
 */
export function Fehlerbehandlung() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Eine Error Boundary fängt den Absturz einer Kind-Komponente ab - der Rest der Seite läuft weiter.</P>
        <TryIt
          id="praxis-fehler-einstieg"
          {...beispiele['praxis-fehler-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Was passiert bei einem Fehler?">
        <P>
          Wirft eine Komponente beim <strong>Rendern</strong> einen Fehler, hängt React ohne
          Gegenmaßnahme den <strong>gesamten Baum</strong> aus - der Benutzer sieht eine weiße Seite.
          Lieber ein kaputtes Widget als eine kaputte App. Dafür gibt es{' '}
          <strong>Error Boundaries</strong>.
        </P>
        <FehlerDemo />
      </Abschnitt>

      <Abschnitt titel="Error Boundaries">
        <P>
          Eine Error Boundary ist die einzige Stelle, an der man heute noch eine{' '}
          <strong>Klassen-Komponente</strong> braucht - es gibt keine Hook-Variante. Man schreibt sie
          einmal (oder nimmt das Paket <Code>react-error-boundary</Code>) und setzt sie um riskante
          Bereiche.
        </P>
        <CodeBlock
          titel="Minimal"
          code={codeBloecke.beispiel1}
        />
        <P>
          <strong>Nicht</strong> gefangen werden Fehler in:
        </P>
        <Liste>
          <li>Event-Handlern → dort mit <Code>try/catch</Code></li>
          <li>
            asynchronem Code (<Code>setTimeout</Code>, Promises) → <Code>try/catch</Code> bzw.{' '}
            <Code>.catch()</Code>
          </li>
          <li>der Boundary selbst</li>
        </Liste>
        <P>
          Möchtest du einen Fehler aus einem Handler trotzdem in der Boundary anzeigen, speichere ihn
          im State und wirf ihn beim nächsten Rendern: <Code>{'if (error) throw error'}</Code>.
        </P>
        <TryIt
          id="praxis-fehler-boundary"
          {...beispiele['praxis-fehler-boundary']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Fehler in Handlern und asynchronem Code">
        <TryIt
          id="praxis-fehler-async"
          {...beispiele['praxis-fehler-async']}
          modus="react"
        />
        <Hinweis variante="info">
          In der Entwicklung zeigt der Browser trotz Boundary Fehler in der Konsole, und manche
          Dev-Tools blenden ein Overlay ein. Das echte Verhalten siehst du mit{' '}
          <Code>npm run build</Code> und <Code>npm run preview</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="praxis-fehler-uebung"
          {...beispiele['praxis-fehler-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Das Dashboard stürzt komplett ab, sobald ein Widget kaputte Daten bekommt.</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Schreibe eine <Code>ErrorBoundary</Code> mit Prop <Code>fallback</Code> und umschließe{' '}
                  <strong>jedes Widget einzeln</strong>, sodass die anderen weiterlaufen.
                </li>
                <li>
                  „Break the data“ soll nur das Umsatz-Widget treffen. Die Boundary zeigt dann „Widget unavailable“.
                </li>
                <li>
                  Bonus: Die Boundary setzt sich zurück, wenn sich die Daten ändern (Tipp: einfach{' '}
                  <Code>key</Code> verwenden!).
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Welchen Fehler fängt eine Error Boundary?',
            antworten: ['Einen Fehler in onClick', 'Einen Fehler beim Rendern eines Kindes', 'Einen abgelehnten fetch'],
            richtig: 1,
            erklaerung: 'Nur Fehler während Rendern, Lifecycle und Effekten der Kinder.',
          },
          {
            frage: 'Warum ist ErrorBoundary eine Klasse?',
            antworten: [
              'Weil es für getDerivedStateFromError keinen Hook gibt',
              'Weil Klassen schneller sind',
              'Das muss sie nicht sein',
            ],
            richtig: 0,
            erklaerung: 'Alternativ nimmt man das Paket react-error-boundary, das die Klasse kapselt.',
          },
          {
            frage: 'Wo setzt man Boundaries am besten?',
            antworten: [
              'Nur einmal ganz außen',
              'Um einzelne, unabhängige Bereiche - plus eine ganz außen',
              'Um jedes einzelne Element',
            ],
            richtig: 1,
            erklaerung: 'So fällt nur der betroffene Bereich aus, und nichts endet in einer weißen Seite.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Render-Fehler ohne Boundary legen die ganze App lahm.',
          <>
            Error Boundary: Klasse mit <Code>getDerivedStateFromError</Code> (oder{' '}
            <Code>react-error-boundary</Code>).
          </>,
          <>
            Event-Handler und async-Code: <Code>try/catch</Code> und einen Fehlerzustand im State.
          </>,
          <>
            Boundaries gezielt um unabhängige Bereiche setzen; zurücksetzen per <Code>key</Code>.
          </>,
        ]}
      />
    </>
  )
}
