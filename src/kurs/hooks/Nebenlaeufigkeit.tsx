import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Nebenlaeufigkeit.code'
import { NebenlaeufigkeitsDemo } from '../demos/NebenlaeufigkeitsDemo'

/**
 * KAPITEL 4.8 - useTransition & useDeferredValue
 */
export function Nebenlaeufigkeit() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P><Code>useTransition</Code> markiert ein Update als „nicht dringend“ und meldet über <Code>isPending</Code>, dass es noch läuft.</P>
        <TryIt
          id="hooks-nebenlaeufig-einstieg"
          {...beispiele['hooks-nebenlaeufig-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Das Problem: Ein langsamer Render blockiert alles">
        <P>
          Normalerweise ist jedes State-Update <strong>dringend</strong>: React rendert es sofort und
          am Stück. Ist dieser Render teuer, kann der Browser in der Zeit nichts anderes tun -
          Tastatureingaben ruckeln. Probier es aus und tippe schnell ins Feld:
        </P>
        <TryIt
          id="hooks-nebenlaeufig-problem"
          {...beispiele['hooks-nebenlaeufig-problem']}
          modus="react"
        />
        <P>
          Seit React 18 kann React Renders <strong>unterbrechen</strong>. Du musst ihm nur sagen,
          welche Updates warten dürfen. Dafür gibt es zwei Hooks:
        </P>
        <Liste>
          <li>
            <Code>useDeferredValue(value)</Code> - „Benutze für diesen Teil ruhig einen etwas älteren
            Wert.“ Gut, wenn du den State <strong>nicht selbst</strong> setzt (z. B. er kommt als Prop).
          </li>
          <li>
            <Code>useTransition()</Code> - „Dieses Update, das <strong>ich</strong> auslöse, ist nicht
            dringend.“ Liefert zusätzlich <Code>isPending</Code> für einen Ladehinweis.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="useDeferredValue">
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <P>
          React rendert zuerst mit dem <strong>alten</strong> verzögerten Wert (schnell, weil{' '}
          <Code>memo</Code> die Liste überspringt) und versucht danach im Hintergrund, mit dem neuen
          Wert zu rendern. Kommt eine neue Eingabe dazwischen, wird dieser Hintergrund-Render
          verworfen. Die Lösung zur Aufgabe oben zeigt das Muster.
        </P>
        <Hinweis variante="info">
          Anders als Debouncing (<Verweis nr="4.7" />) gibt es <strong>keine feste Wartezeit</strong>: Auf einem
          schnellen Rechner hinkt nichts hinterher, auf einem langsamen passt es sich an.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="useTransition">
        <TryIt
          id="hooks-nebenlaeufig-transition"
          {...beispiele['hooks-nebenlaeufig-transition']}
          modus="react"
        />
        <Liste>
          <li>
            Während der Transition bleibt der <strong>alte Tab sichtbar</strong> und bedienbar, statt
            dass die Seite einfriert.
          </li>
          <li>Klickt man währenddessen woanders hin, bricht React den langsamen Render ab.</li>
          <li>
            In React 19 darf die Funktion in <Code>startTransition</Code> auch <Code>async</Code> sein
            - das nutzt <Code>useActionState</Code> im nächsten Kapitel.
          </li>
        </Liste>
        <Hinweis variante="warnung">
          Für Eingabefelder funktioniert <Code>startTransition</Code> nicht: Der Wert eines{' '}
          <Code>{'<input>'}</Code> muss sofort aktualisiert werden. Dort ist{' '}
          <Code>useDeferredValue</Code> das richtige Werkzeug.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Code-Splitting mit lazy">
        <P>
          Eine große App muss nicht alles auf einmal laden. <Code>lazy()</Code> lädt eine Komponente erst, wenn sie
          zum ersten Mal gerendert wird - der Bundler legt ihren Code dafür in eine eigene Datei. Solange sie lädt,
          zeigt das nächste <Code>{'<Suspense>'}</Code> darüber seinen <Code>fallback</Code>.
        </P>
        <TryIt id="hooks-nebenlaeufig-lazy" {...beispiele['hooks-nebenlaeufig-lazy']} modus="react" />
        <P>
          Gute Kandidaten sind Seiten (je Route eine Datei, <Verweis id="praxis-routing" />), große Diagramme, Editoren
          und selten geöffnete Dialoge. Diese Lern-App lädt so jedes Kapitel erst beim Öffnen. Blende die Statistik aus
          und wieder ein: Beim zweiten Mal erscheint sie sofort.
        </P>
      </Abschnitt>

      <Abschnitt titel="Die Demos aus diesem Projekt">
        <P>
          Zum Vergleich in TypeScript - inklusive <Code>lazy</Code> und <Code>Suspense</Code>: Ein Teil
          der App wird erst beim ersten Anzeigen nachgeladen, <Code>Suspense</Code> zeigt solange einen
          Platzhalter.
        </P>
        <NebenlaeufigkeitsDemo />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="hooks-nebenlaeufig-uebung"
          {...beispiele['hooks-nebenlaeufig-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Der Farbregler ruckelt, weil jede Bewegung 2.000 langsame Kacheln neu zeichnet. Sorge
                dafür, dass der <strong>Regler flüssig</strong> bleibt und die Kacheln nachziehen:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>Nutze das passende Hook für einen Wert, den ein Eingabefeld setzt.</li>
                <li>Denk an memo - sonst hilft das Hook nichts.</li>
                <li>Solange die Kacheln veraltet sind, sollen sie halb durchsichtig sein.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Ein Eingabefeld setzt State, der eine langsame Liste filtert. Welches Hook passt?',
            antworten: ['useTransition um setState des Inputs', 'useDeferredValue für den Wert, den die Liste bekommt'],
            richtig: 1,
            erklaerung: 'Das Eingabefeld selbst muss sofort aktualisiert werden - nur die Liste darf warten.',
          },
          {
            frage: 'Was liefert useTransition zurück?',
            antworten: ['[isPending, startTransition]', '[value, setValue]', 'Ein Promise'],
            richtig: 0,
            erklaerung: 'isPending zeigt an, ob gerade eine Transition gerendert wird.',
          },
          {
            frage: 'Warum braucht useDeferredValue meist memo?',
            antworten: [
              'Sonst gibt es einen Fehler',
              'Sonst rendert die langsame Komponente beim dringenden Render trotzdem mit',
              'memo macht den Wert verzögert',
            ],
            richtig: 1,
            erklaerung: 'Mit memo überspringt React die Liste, solange sie den alten Wert bekommt.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Normale Updates sind dringend und blockieren bei teuren Renders die Eingabe.',
          <>
            <Code>useDeferredValue(value)</Code>: ein hinterherhinkender Wert für den langsamen Teil -
            zusammen mit <Code>memo</Code>.
          </>,
          <>
            <Code>useTransition</Code>: eigene Updates als nicht dringend markieren, mit{' '}
            <Code>isPending</Code>.
          </>,
          'Nicht dringende Renders können unterbrochen und verworfen werden.',
          <>
            <Code>lazy</Code> + <Code>Suspense</Code>: Komponenten erst bei Bedarf laden.
          </>,
        ]}
      />
    </>
  )
}
