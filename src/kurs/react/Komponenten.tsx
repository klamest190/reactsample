import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Komponenten.code'

/**
 * KAPITEL 2.1 - Komponenten & JSX
 * Der Schritt von "DOM von Hand ändern" zu "Oberfläche beschreiben".
 */
export function Komponenten() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Eine Komponente ist eine Funktion, die JSX zurückgibt.</P>
        <TryIt
          id="react-komponenten-einstieg"
          {...beispiele['react-komponenten-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Die Idee hinter React">
        <P>
          Im letzten Kapitel hast du das DOM von Hand verändert: Element suchen, Text setzen, Klasse
          umschalten. Das wird bei größeren Oberflächen schnell unübersichtlich. React dreht das um:
          Du beschreibst, <strong>wie die Oberfläche für bestimmte Daten aussehen soll</strong> - und
          React kümmert sich darum, das DOM passend zu verändern.
        </P>
        <CodeBlock code={codeBloecke.beispiel1} />
        <P>
          Eine <strong>Komponente</strong> ist dabei einfach eine JavaScript-Funktion, die
          beschreibt, was angezeigt werden soll.
        </P>
      </Abschnitt>

      <Abschnitt titel="Deine erste Komponente">
        <Liste>
          <li>Eine Komponente ist eine Funktion, die JSX zurückgibt.</li>
          <li>
            Ihr Name beginnt <strong>immer mit einem Großbuchstaben</strong>. <Code>{'<button>'}</Code>{' '}
            ist ein HTML-Element, <Code>{'<Button>'}</Code> deine Komponente.
          </li>
          <li>Komponenten benutzt du wie HTML-Tags - und so oft du willst.</li>
        </Liste>
        <TryIt
          id="react-komponenten-1"
          {...beispiele['react-komponenten-1']}
          modus="react"
        />
        <Hinweis variante="info">
          In einem echten Projekt steht ganz am Anfang einmal{' '}
          <Code>{"createRoot(document.getElementById('root')).render(<App />)"}</Code> - siehe{' '}
          <Code>src/main.tsx</Code> in diesem Projekt. Im Editor übernimmt das die Lernumgebung.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="JSX ist JavaScript">
        <P>
          JSX sieht aus wie HTML, wird aber vor dem Ausführen in normale Funktionsaufrufe übersetzt.
          Deshalb gelten ein paar Regeln, die sich von HTML unterscheiden:
        </P>
        <CodeBlock
          code={codeBloecke.beispiel2}
        />
        <Liste>
          <li>
            <strong>Ein Wurzelelement:</strong> Eine Funktion kann nur einen Wert zurückgeben. Brauchst
            du kein umschließendes <Code>{'<div>'}</Code>, nimm ein Fragment <Code>{'<>…</>'}</Code>.
          </li>
          <li>
            <Code>className</Code> statt <Code>class</Code> und <Code>htmlFor</Code> statt{' '}
            <Code>for</Code> - weil <Code>class</Code> und <Code>for</Code> in JavaScript reservierte
            Wörter sind.
          </li>
          <li>
            Attribute in <strong>camelCase</strong>: <Code>onClick</Code>, <Code>tabIndex</Code>,{' '}
            <Code>maxLength</Code>.
          </li>
          <li>
            <strong>Alle Tags schließen:</strong> <Code>{'<img />'}</Code>, <Code>{'<br />'}</Code>,{' '}
            <Code>{'<input />'}</Code>.
          </li>
          <li>
            <Code>style</Code> bekommt ein <strong>Objekt</strong>:{' '}
            <Code>{"style={{ color: 'red', fontSize: 20 }}"}</Code>.
          </li>
          <li>
            In geschweiften Klammern <Code>{'{ }'}</Code> steht JavaScript - aber nur{' '}
            <strong>Ausdrücke</strong> (etwas, das einen Wert ergibt), keine <Code>if</Code>- oder{' '}
            <Code>for</Code>-Anweisungen.
          </li>
        </Liste>
        <TryIt
          id="react-komponenten-2"
          {...beispiele['react-komponenten-2']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="react-komponenten-uebung"
          {...beispiele['react-komponenten-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Dieser Code ist in HTML-Denkweise geschrieben und lässt sich nicht übersetzen. Finde
                und behebe die <strong>vier Fehler</strong>, bis die Karte angezeigt wird.
              </p>
              <p className="mt-1">
                Danach: Baue eine eigene Komponente <Code>Footer</Code>, die „Built with React“
                anzeigt, und benutze sie in <Code>App</Code>.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Warum muss ein Komponentenname mit einem Großbuchstaben beginnen?',
            antworten: [
              'Das ist nur eine Stilkonvention.',
              'Sonst hält React ihn für ein HTML-Element.',
              'Weil JavaScript-Funktionen immer groß geschrieben werden.',
            ],
            richtig: 1,
            erklaerung: '<profile> wäre ein (unbekanntes) HTML-Tag, <Profile> ruft deine Funktion auf.',
          },
          {
            frage: 'Was darf in JSX zwischen { } stehen?',
            antworten: ['Nur Variablen', 'Jeder JavaScript-Ausdruck', 'Auch if- und for-Anweisungen'],
            richtig: 1,
            erklaerung:
              'Ausdrücke wie a + b, condition ? x : y oder list.map(…) - keine Anweisungen wie if oder for.',
          },
          {
            frage: 'Wie gibst du zwei Geschwister-Elemente ohne zusätzliches <div> zurück?',
            antworten: ['Als Array ohne Klammern', 'Mit einem Fragment <>…</>', 'Gar nicht'],
            richtig: 1,
            erklaerung: 'Das Fragment gruppiert Elemente, ohne selbst im DOM aufzutauchen.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Eine Komponente ist eine Funktion mit großem Anfangsbuchstaben, die JSX zurückgibt.',
          'JSX wird zu React.createElement(...) übersetzt - es ist JavaScript, kein HTML.',
          <>
            <Code>className</Code>, camelCase-Attribute, alle Tags schließen, <Code>style</Code> als
            Objekt.
          </>,
          <>
            Genau ein Wurzelelement - notfalls ein Fragment <Code>{'<>…</>'}</Code>.
          </>,
          <>
            In <Code>{'{ }'}</Code> stehen JavaScript-Ausdrücke.
          </>,
        ]}
      />
    </>
  )
}
