import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './DatenLaden.code'
import { LadeDemo } from '../demos/LadeDemo'

/**
 * KAPITEL 5.2 - Daten laden
 */
export function DatenLaden() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Daten laden heißt: in einem Effekt <Code>fetch</Code> aufrufen und das Ergebnis in den State legen.</P>
        <TryIt
          id="praxis-daten-einstieg"
          {...beispiele['praxis-daten-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Das Grundmuster">
        <P>
          Daten vom Server zu laden verbindet alles aus <Verweis nr="1.7" /> (async/await) und <Verweis nr="4.2" /> (useEffect).
          Jede Anfrage hat drei mögliche Zustände - und jeder braucht eine Darstellung:
        </P>
        <Liste>
          <li>
            <strong>Laden</strong> - Platzhalter oder Spinner
          </li>
          <li>
            <strong>Fehler</strong> - verständliche Meldung, möglichst mit „Erneut versuchen“
          </li>
          <li>
            <strong>Daten</strong> - und auch der Sonderfall „leer“
          </li>
        </Liste>
        <TryIt
          id="praxis-daten-grundmuster"
          {...beispiele['praxis-daten-grundmuster']}
          modus="react"
        />
        <Hinweis variante="info">
          Das Beispiel braucht Internet (JSONPlaceholder ist eine freie Test-API). Offline siehst du
          den Fehlerzweig.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Race Conditions und Abbrechen">
        <P>
          Hängt die Anfrage von einer Eingabe ab (z. B. einer ID), kann eine{' '}
          <strong>ältere, langsamere Antwort</strong> nach einer neueren eintreffen und sie
          überschreiben. Die Lösung steckt im Cleanup: Die alte Anfrage wird abgebrochen oder ihr
          Ergebnis ignoriert.
        </P>
        <TryIt
          id="praxis-daten-race"
          {...beispiele['praxis-daten-race']}
          modus="react"
        />
        <CodeBlock
          titel="Mit echtem fetch"
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="Die Demo aus diesem Projekt">
        <LadeDemo />
      </Abschnitt>

      <Abschnitt titel="In echten Projekten">
        <P>
          Das Muster oben ist wichtig zu verstehen - in größeren Apps schreibt man es aber selten von
          Hand. Denn es fehlen noch: Caching, doppelte Anfragen vermeiden, Neuladen beim
          Fensterwechsel, Retries, Pagination …
        </P>
        <Liste>
          <li>
            <strong>TanStack Query</strong> oder <strong>SWR</strong> für Client-Apps:{' '}
            <Code>{"const { data, isLoading, error } = useQuery({ queryKey: ['user', id], queryFn })"}</Code>
          </li>
          <li>
            <strong>Frameworks</strong> wie Next.js oder React Router laden Daten direkt beim Routing
            bzw. auf dem Server.
          </li>
          <li>
            React 19: <Code>use(promise)</Code> mit <Code>Suspense</Code> (<Verweis nr="4.9" />), wenn das Promise
            aus einem Cache kommt.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="praxis-daten-uebung"
          {...beispiele['praxis-daten-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Schreibe den eigenen Hook <Code>useFetch(url)</Code>, der{' '}
                <Code>{'{ data, loading, error, reload }'}</Code> zurückgibt:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>Lädt neu, wenn sich die URL ändert, und bricht die alte Anfrage ab.</li>
                <li>
                  Prüft <Code>response.ok</Code> und wirft sonst <Code>{"new Error('HTTP ' + response.status)"}</Code>.
                </li>
                <li>
                  <Code>reload()</Code> startet die Anfrage erneut (Tipp: ein Zähler im State als
                  Dependency).
                </li>
              </ul>
              <p className="mt-1">Die App zeigt damit Beiträge des gewählten Nutzers an.</p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Warum darf die Effekt-Funktion selbst nicht async sein?',
            antworten: [
              'async ist in React verboten',
              'Sie würde ein Promise statt einer Cleanup-Funktion zurückgeben',
              'Weil fetch synchron ist',
            ],
            richtig: 1,
            erklaerung: 'Deshalb definiert man eine async-Funktion im Effekt und ruft sie auf.',
          },
          {
            frage: 'Was verhindert, dass eine veraltete Antwort neuere Daten überschreibt?',
            antworten: ['useMemo', 'Abbrechen/Ignorieren im Cleanup des Effekts', 'Ein key an der Liste'],
            richtig: 1,
            erklaerung: 'Der Cleanup läuft, bevor der Effekt mit der neuen ID startet.',
          },
          {
            frage: 'Welche drei Zustände sollte jede Anfrage in der Oberfläche abdecken?',
            antworten: ['Laden, Fehler, Daten', 'Start, Mitte, Ende', 'Online, Offline, Cache'],
            richtig: 0,
            erklaerung: 'Plus den Sonderfall „Daten, aber leer“.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Laden, Fehler, Daten (und leer) - jeder Zustand braucht eine Darstellung.',
          'async-Funktion innerhalb des Effekts; response.ok selbst prüfen.',
          <>
            <Code>AbortController</Code> im Cleanup verhindert Race Conditions.
          </>,
          <>
            Abbrüche (<Code>AbortError</Code>) sind kein Fehler für die Oberfläche.
          </>,
          'In größeren Apps: TanStack Query, SWR oder das Daten-Laden des Frameworks.',
        ]}
      />
    </>
  )
}
