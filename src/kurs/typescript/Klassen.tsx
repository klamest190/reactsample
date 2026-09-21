import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Klassen.code'

/**
 * KAPITEL 2.7 - Klassen, Enums & Module
 * Was TypeScript zu Klassen hinzufügt, Enums gegen Unions, und wie Typen zwischen Dateien wandern.
 */
export function Klassen() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Klassen kennst du aus <Verweis nr="1.8" />. TypeScript ergänzt Typen für Felder und Methoden - und
          Zugriffsmodifikatoren wie <Code>private</Code> und <Code>readonly</Code>, die festlegen, wer was
          lesen und ändern darf.
        </P>
        <TryIt id="ts-klassen-einstieg" modus="ts" {...beispiele['ts-klassen-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Zugriffsmodifikatoren und Parameter-Properties">
        <P>
          <Code>public</Code> (Standard) sieht jeder, <Code>protected</Code> nur die Klasse und ihre
          Unterklassen, <Code>private</Code> nur die Klasse selbst. Steht ein Modifikator vor einem
          Konstruktor-Parameter, wird daraus automatisch ein Feld - das spart die Zeilen{' '}
          <Code>this.name = name</Code>.
        </P>
        <TryIt id="ts-klassen-modifikatoren" modus="ts" {...beispiele['ts-klassen-modifikatoren']} />
        <Hinweis variante="info">
          <Code>private</Code> gibt es nur beim Prüfen - zur Laufzeit ist das Feld ganz normal erreichbar.
          Die JavaScript-Felder mit <Code>#</Code> sind dagegen auch zur Laufzeit privat. Beides ist in
          Ordnung, nur bitte nicht gemischt in einer Klasse.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="implements und abstract">
        <P>
          Mit <Code>implements</Code> verspricht eine Klasse, ein Interface zu erfüllen - der Compiler
          prüft, ob alle Mitglieder da sind. Eine <Code>abstract</Code>-Klasse ist eine unfertige
          Basisklasse: Sie kann selbst nicht erzeugt werden, und ihre <Code>abstract</Code>-Methoden müssen
          die Unterklassen schreiben.
        </P>
        <TryIt id="ts-klassen-implements" modus="ts" {...beispiele['ts-klassen-implements']} />
        <Liste>
          <li>
            <Code>override</Code> markiert, dass eine Methode die der Basisklasse ersetzt - Tippfehler im
            Namen fallen so auf.
          </li>
          <li>
            In React-Code sind Klassen selten (Komponenten sind Funktionen). In Services, Fehlerklassen und
            Bibliotheken begegnen sie dir aber oft.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Enums - und warum Unions oft besser sind">
        <P>
          Ein <Code>enum</Code> ist eine Sammlung benannter Konstanten. Anders als fast alles andere in
          TypeScript erzeugt es echten JavaScript-Code. Viele Teams nehmen stattdessen Unions aus
          Literal-Typen (oder ein Objekt mit <Code>as const</Code>): Sie verschwinden beim Übersetzen
          komplett, und man kann einfach <Code>'active'</Code> schreiben.
        </P>
        <TryIt id="ts-klassen-enums" modus="ts" {...beispiele['ts-klassen-enums']} />
      </Abschnitt>

      <Abschnitt titel="Module: Typen exportieren und importieren">
        <P>
          Typen werden wie Werte mit <Code>export</Code> und <Code>import</Code> zwischen Dateien
          weitergegeben. <Code>import type</Code> sagt ausdrücklich: Das ist nur ein Typ - die Zeile
          verschwindet beim Übersetzen vollständig.
        </P>
        <CodeBlock titel="Typen zwischen Dateien" code={codeBloecke.module} />
        <Hinweis variante="tipp">
          Mit der tsconfig-Option <Code>verbatimModuleSyntax</Code> (in Vite-Projekten Standard) ist{' '}
          <Code>import type</Code> sogar Pflicht, wenn du nur Typen importierst.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="declare und .d.ts-Dateien">
        <P>
          <Code>declare</Code> beschreibt etwas, das es zur Laufzeit schon gibt, ohne Code dafür zu
          erzeugen. Dateien mit der Endung <Code>.d.ts</Code> enthalten nur solche Beschreibungen - so
          bekommen JavaScript-Bibliotheken ihre Typen.
        </P>
        <TryIt id="ts-klassen-declare" modus="ts" {...beispiele['ts-klassen-declare']} />
        <CodeBlock code={codeBloecke.dts} />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="ts-klassen-uebung"
          modus="ts"
          {...beispiele['ts-klassen-uebung']}
          aufgabe={
            <>
              <p>
                Schreibe die Klasse <Code>ShoppingCart</Code>:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Sie erfüllt das Interface <Code>CartLike</Code>
                </li>
                <li>
                  Der Konstruktor bekommt den Besitzer als <Code>public readonly</Code> Parameter-Property{' '}
                  <Code>owner</Code>
                </li>
                <li>
                  Die Artikel liegen in einem <Code>private</Code> Feld <Code>items</Code>
                </li>
                <li>
                  <Code>add</Code> erhöht bei gleicher <Code>sku</Code> nur die Menge, <Code>remove</Code>{' '}
                  entfernt einen Artikel
                </li>
                <li>
                  <Code>total</Code> ist ein Getter: Summe aus Preis mal Menge
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'constructor(private name: string) {} - was passiert?',
            antworten: ['Nichts, der Parameter ist nur im Konstruktor sichtbar', 'Es entsteht ein privates Feld name, das automatisch gesetzt wird', 'Ein Syntaxfehler'],
            richtig: 1,
            erklaerung: 'Eine Parameter-Property: Der Modifikator vor dem Parameter deklariert das Feld und weist den Wert zu.',
          },
          {
            frage: 'Was prüft class Circle implements Shape?',
            antworten: ['Dass Circle alle Mitglieder von Shape hat', 'Dass Circle von Shape erbt', 'Nichts - implements ist nur Dokumentation'],
            richtig: 0,
            erklaerung: 'implements vererbt nichts, es lässt den Compiler prüfen, dass die Klasse das Interface erfüllt.',
          },
          {
            frage: 'Was unterscheidet ein enum von einer Union aus Literal-Typen?',
            antworten: ['Nichts', 'Ein enum erzeugt echten JavaScript-Code, die Union verschwindet beim Übersetzen', 'Unions funktionieren nur mit Zahlen'],
            richtig: 1,
            erklaerung: 'Enums sind eines der wenigen TypeScript-Features mit Laufzeit-Code. Unions sind reine Typen.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Felder mit Typ deklarieren, <Code>private</Code> / <Code>protected</Code> / <Code>readonly</Code>{' '}
            regeln den Zugriff.
          </>,
          <>
            Parameter-Properties: <Code>constructor(private name: string) {'{}'}</Code>.
          </>,
          <>
            <Code>implements</Code> prüft ein Interface, <Code>abstract</Code> erzwingt Methoden in
            Unterklassen.
          </>,
          <>
            Unions aus Literalen sind oft die schlankere Alternative zu <Code>enum</Code>.
          </>,
          <>
            <Code>import type</Code> für reine Typen, <Code>declare</Code> und <Code>.d.ts</Code> beschreiben
            vorhandenen Code.
          </>,
        ]}
      />
    </>
  )
}
