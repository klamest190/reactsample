import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './React19Hooks.code'

/**
 * KAPITEL 4.9 - use, useActionState, useOptimistic & useFormStatus
 * Die Hooks aus React 19 für asynchrone Daten und Formulare.
 */
export function React19Hooks() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P><Code>useActionState</Code> verbindet ein Formular mit einer (asynchronen) Aktion - inklusive Ergebnis und Ladezustand.</P>
        <TryIt
          id="hooks-react19-einstieg"
          {...beispiele['hooks-react19-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Überblick">
        <P>
          React 19 hat mehrere Hooks mitgebracht, die typische asynchrone Abläufe deutlich kürzer
          machen - vor allem rund um Formulare. Sie bauen auf Transitions aus dem letzten Kapitel auf.
        </P>
        <Liste>
          <li>
            <Code>use(promise)</Code> - liest das Ergebnis eines Promises; solange es läuft, zeigt{' '}
            <Code>Suspense</Code> einen Platzhalter. <Code>use(Context)</Code> liest Context.
          </li>
          <li>
            <Code>useActionState</Code> - State, der sich aus dem Ergebnis einer (asynchronen) Aktion
            ergibt, inklusive Ladezustand.
          </li>
          <li>
            <Code>useFormStatus</Code> - fragt aus einer Kind-Komponente ab, ob das umgebende Formular
            gerade abgeschickt wird.
          </li>
          <li>
            <Code>useOptimistic</Code> - zeigt ein Ergebnis sofort an, bevor der Server geantwortet hat.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="use: Promises und Context lesen">
        <P>
          <Code>use</Code> ist ein besonderer Hook: Er darf als einziger auch in <Code>if</Code> oder
          Schleifen stehen. Übergibst du ihm ein Promise, „wartet“ die Komponente darauf - React
          zeigt so lange das <Code>fallback</Code> der nächsten <Code>Suspense</Code>-Grenze.
        </P>
        <TryIt
          id="hooks-react19-use"
          {...beispiele['hooks-react19-use']}
          modus="react"
        />
        <Hinweis variante="warnung">
          <Code>use</Code> erzeugt das Promise nicht - es liest nur. In echten Apps kommt das Promise
          aus einem Framework (z. B. Next.js Server Components) oder einer Bibliothek mit Cache wie
          TanStack Query. Ein <Code>fetch</Code> direkt im Rendern würde bei jedem Render ein neues
          Promise erzeugen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Formular-Actions und useActionState">
        <P>
          In React 19 kann <Code>{'<form action={…}>'}</Code> eine <strong>Funktion</strong> bekommen.
          React ruft sie beim Absenden mit den <Code>FormData</Code> auf - ohne{' '}
          <Code>preventDefault</Code>, ohne State pro Feld. Nach erfolgreicher Action werden
          unkontrollierte Felder automatisch geleert.
        </P>
        <P>
          <Code>useActionState</Code> verbindet so eine Action mit State: Das Ergebnis der Action wird
          zum neuen State, und du bekommst den Ladezustand gratis.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="hooks-react19-actionstate"
          {...beispiele['hooks-react19-actionstate']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="useFormStatus">
        <P>
          Einen Absende-Knopf baut man gern als eigene Komponente. Damit sie nicht per Prop erfahren
          muss, ob gerade gesendet wird, gibt es <Code>useFormStatus</Code> aus{' '}
          <Code>react-dom</Code>. Es liest den Status des <strong>umgebenden</strong>{' '}
          <Code>{'<form>'}</Code>.
        </P>
        <TryIt
          id="hooks-react19-formstatus"
          {...beispiele['hooks-react19-formstatus']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="useOptimistic">
        <P>
          Ein Like-Knopf, der erst nach einer Sekunde reagiert, fühlt sich kaputt an.{' '}
          <Code>useOptimistic</Code> zeigt das erwartete Ergebnis <strong>sofort</strong>. Ist die
          Action fertig, ersetzt React den optimistischen Wert automatisch durch den echten State -
          schlägt sie fehl, springt die Anzeige zurück.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel2}
        />
        <TryIt
          id="hooks-react19-optimistic"
          {...beispiele['hooks-react19-optimistic']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="hooks-react19-uebung"
          {...beispiele['hooks-react19-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Baue eine Kommentarfunktion mit den neuen Hooks:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>useActionState</Code>: Die Action ruft <Code>saveComment</Code> auf und
                  gibt die neue Kommentarliste zurück. Startwert: <Code>[]</Code>.
                </li>
                <li>
                  Gibt der Server einen Fehler zurück (leerer Text), zeigst du die Fehlermeldung an -
                  die Liste bleibt erhalten. Tipp: State als Objekt{' '}
                  <Code>{'{ comments, error }'}</Code>.
                </li>
                <li>
                  Ein eigener <Code>SendButton</Code> mit <Code>useFormStatus</Code>: „Send“, während des Sendens „Sending …“. Kommentare erscheinen als <Code>{'<li>'}</Code>.
                </li>
                <li>
                  Bonus: Mit <Code>useOptimistic</Code> erscheint der Kommentar sofort (halb
                  durchsichtig).
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was bekommt eine Funktion in <form action={fn}> als Argument?',
            antworten: ['Das Submit-Event', 'Ein FormData-Objekt', 'Die Werte aus dem State'],
            richtig: 1,
            erklaerung: 'Mit formData.get("name") liest du die Felder anhand ihres name-Attributs.',
          },
          {
            frage: 'Welcher Hook darf ausnahmsweise in einem if stehen?',
            antworten: ['useState', 'useActionState', 'use'],
            richtig: 2,
            erklaerung: 'use ist die einzige Ausnahme von der Reihenfolge-Regel.',
          },
          {
            frage: 'Wo muss useFormStatus aufgerufen werden?',
            antworten: [
              'In der Komponente, die das <form> rendert',
              'In einer Komponente, die innerhalb des <form> gerendert wird',
              'Egal wo',
            ],
            richtig: 1,
            erklaerung: 'Es liest den Status des umgebenden Formulars - also muss es darin liegen.',
          },
          {
            frage: 'Was passiert mit einem optimistischen Wert, wenn die Action fertig ist?',
            antworten: [
              'Er bleibt dauerhaft stehen',
              'React ersetzt ihn durch den echten State',
              'Er wird in localStorage gespeichert',
            ],
            richtig: 1,
            erklaerung: 'Deshalb springt die Anzeige zurück, wenn der echte State nicht aktualisiert wurde.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>use(promise)</Code> + <Code>Suspense</Code> für asynchrone Daten; das Promise nicht
            im Rendern erzeugen.
          </>,
          <>
            <Code>{'<form action={fn}>'}</Code> bekommt <Code>FormData</Code> - kein{' '}
            <Code>preventDefault</Code> nötig.
          </>,
          <>
            <Code>useActionState</Code> = Ergebnis der Action als State + <Code>isPending</Code>.
          </>,
          <>
            <Code>useFormStatus</Code> liefert <Code>pending</Code> für Komponenten im Formular.
          </>,
          <>
            <Code>useOptimistic</Code> zeigt das erwartete Ergebnis sofort an.
          </>,
        ]}
      />
    </>
  )
}
