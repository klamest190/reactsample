import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './DomUndModule.code'

/**
 * KAPITEL 1.9 - DOM, Events & Module
 * Der letzte JS-Baustein - und die Motivation, warum es React überhaupt gibt.
 */
export function DomUndModule() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Ein Element erzeugen, auf einen Klick reagieren, ins Dokument hängen.</P>
        <TryIt
          id="js-dom-einstieg"
          {...beispiele['js-dom-einstieg']}
          vorschau
        />
      </Abschnitt>

      <Abschnitt titel="Das DOM">
        <P>
          Der Browser macht aus dem HTML einen Baum von Objekten - das <strong>DOM</strong>{' '}
          (Document Object Model). Mit JavaScript kannst du Elemente suchen, erzeugen und verändern.
          In diesen Editoren gibt es eine <strong>Vorschau</strong> mit einem leeren{' '}
          <Code>{'<div id="app">'}</Code>, in den du schreiben kannst.
        </P>
        <TryIt
          id="js-dom-1"
          {...beispiele['js-dom-1']}
          vorschau
        />
      </Abschnitt>

      <Abschnitt titel="Events">
        <P>
          Mit <Code>addEventListener</Code> reagierst du auf Klicks, Eingaben und Tastendrücke. Der
          Callback bekommt ein <strong>Event-Objekt</strong> mit Details - z. B.{' '}
          <Code>event.target</Code>, das auslösende Element.
        </P>
        <TryIt
          id="js-dom-2"
          {...beispiele['js-dom-2']}
          vorschau
        />
      </Abschnitt>

      <Abschnitt titel="Das Problem: Zustand und Oberfläche synchron halten">
        <P>
          Schau dir das Beispiel oben nochmal an: Klickst du und tippst dann, überschreibt die
          Eingabe die Klickanzeige. Man muss sich <strong>bei jeder Änderung</strong> selbst
          überlegen, welche Teile der Seite betroffen sind. Das nennt man <strong>imperativ</strong>:
          Schritt für Schritt beschreiben, <em>wie</em> sich das DOM ändern soll.
        </P>
        <TryIt
          id="js-dom-3"
          {...beispiele['js-dom-3']}
          vorschau
        />
        <P>React löst genau dieses Problem mit einem anderen Ansatz - <strong>deklarativ</strong>:</P>
        <Liste>
          <li>Du hältst deine Daten (den <strong>State</strong>) an einer Stelle.</li>
          <li>
            Du beschreibst, wie die Oberfläche <em>für diese Daten</em> aussieht - einmal, als
            Funktion.
          </li>
          <li>
            Ändern sich die Daten, ruft React deine Funktion neu auf und aktualisiert das DOM{' '}
            <strong>selbst</strong>. Kein „nicht vergessen!“ mehr.
          </li>
        </Liste>
        <CodeBlock
          titel="Dieselbe Liste in React (Vorgeschmack auf Teil 3)"
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="Module: import und export">
        <P>
          Größere Programme verteilt man auf Dateien. Jede Datei ist ein <strong>Modul</strong> mit
          eigenem Scope. Was andere Dateien benutzen dürfen, wird <Code>export</Code>iert. In diesem
          Projekt siehst du das in jeder Datei unter <Code>src/</Code>.
        </P>
        <CodeBlock
          titel="math.js"
          code={codeBloecke.beispiel2}
        />
        <CodeBlock
          titel="app.js"
          code={codeBloecke.beispiel3}
        />
        <Hinweis variante="tipp">
          Benannte Exporte sind meist die bessere Wahl: Der Name ist überall gleich, und dein
          Editor kann ihn automatisch importieren. Default-Exporte braucht man z. B. für{' '}
          <Code>React.lazy()</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="js-dom-uebung"
          {...beispiele['js-dom-uebung']}
          vorschau
          aufgabe={
            <>
              <p>
                Baue einen Zähler mit DOM-Methoden: Ein <Code>{'<span>'}</Code> zeigt die Zahl, ein
                Knopf <strong>+1</strong> erhöht sie, ein Knopf <strong>Reset</strong> setzt sie auf
                0 zurück. Ist die Zahl größer als 5, soll sie <strong>rot</strong> werden.
              </p>
              <p className="mt-1">
                Merkst du, dass du die Anzeige an mehreren Stellen aktualisieren musst? Eine Funktion{' '}
                <Code>render()</Code> hilft - und genau diese Idee macht React zum Prinzip.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was bedeutet „deklarativ“ im Zusammenhang mit React?',
            antworten: [
              'Man beschreibt Schritt für Schritt, wie das DOM geändert wird.',
              'Man beschreibt, wie die Oberfläche für bestimmte Daten aussieht.',
              'Man deklariert alle Variablen mit const.',
            ],
            richtig: 1,
            erklaerung: 'React leitet die nötigen DOM-Änderungen selbst aus deiner Beschreibung ab.',
          },
          {
            frage: 'Wie viele Default-Exporte kann eine Datei haben?',
            antworten: ['Keinen', 'Höchstens einen', 'Beliebig viele'],
            richtig: 1,
            erklaerung: 'Ein Default-Export pro Modul, benannte Exporte beliebig viele.',
          },
          {
            frage: 'Wie importierst du den benannten Export area?',
            antworten: ["import area from './math.js'", "import { area } from './math.js'"],
            richtig: 1,
            erklaerung: 'Benannte Exporte stehen in geschweiften Klammern, der Default-Export ohne.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            DOM: <Code>querySelector</Code>, <Code>createElement</Code>, <Code>textContent</Code>,{' '}
            <Code>addEventListener</Code>.
          </>,
          'Imperativ = jede DOM-Änderung selbst ausführen. Das wird schnell fehleranfällig.',
          'React ist deklarativ: State ändern, React aktualisiert das DOM.',
          <>
            Module: <Code>export</Code> / <Code>{'import { … }'}</Code> für benannte,{' '}
            <Code>export default</Code> für einen Hauptexport.
          </>,
        ]}
      />
    </>
  )
}
