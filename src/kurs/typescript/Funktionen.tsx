import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Funktionen.code'

/**
 * KAPITEL 2.3 - Funktionen typisieren
 * Parameter, Rückgabewerte, Funktionstypen für Callbacks, void und never.
 */
export function Funktionen() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Bei Funktionen schreibst du hinter jeden Parameter seinen Typ. Den Rückgabetyp kann TypeScript
          meist selbst ableiten - du darfst ihn aber hinter die Klammer schreiben.
        </P>
        <TryIt id="ts-funktionen-einstieg" modus="ts" {...beispiele['ts-funktionen-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Optionale, Default- und Rest-Parameter">
        <P>
          Alles, was du aus <Verweis nr="1.3" /> kennst, lässt sich typisieren. Ein <Code>?</Code> macht
          einen Parameter optional, ein Default-Wert bringt seinen Typ gleich mit, und Rest-Parameter sind
          ein Array.
        </P>
        <TryIt id="ts-funktionen-parameter" modus="ts" {...beispiele['ts-funktionen-parameter']} />
        <Hinweis variante="info">
          Optionale Parameter müssen hinten stehen: <Code>(name: string, title?: string)</Code> geht,{' '}
          <Code>(title?: string, name: string)</Code> nicht.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Rückgabetypen">
        <P>
          Ein ausdrücklicher Rückgabetyp ist wie ein Versprechen: TypeScript prüft jedes{' '}
          <Code>return</Code> dagegen, und wer die Funktion aufruft, sieht sofort, was zurückkommt. Das
          lohnt sich besonders bei exportierten Funktionen. <Code>void</Code> bedeutet „gibt nichts
          Brauchbares zurück“.
        </P>
        <TryIt id="ts-funktionen-rueckgabe" modus="ts" {...beispiele['ts-funktionen-rueckgabe']} />
      </Abschnitt>

      <Abschnitt titel="Funktionstypen und Callbacks">
        <P>
          Funktionen sind Werte (<Verweis nr="1.3" />) - also haben sie auch einen Typ:{' '}
          <Code>{'(a: number, b: number) => number'}</Code>. Weist du eine Arrow Function einer Variablen
          mit Funktionstyp zu, bekommen ihre Parameter die Typen automatisch. Dasselbe passiert bei
          Callbacks.
        </P>
        <TryIt id="ts-funktionen-typen" modus="ts" {...beispiele['ts-funktionen-typen']} />
        <CodeBlock titel="Funktionstypen in React-Props" code={codeBloecke.eventHandler} />
      </Abschnitt>

      <Abschnitt titel="void und never">
        <P>
          <Code>void</Code> als Callback-Typ heißt: Der Rückgabewert wird ignoriert - deshalb darfst du
          auch eine Funktion übergeben, die etwas zurückgibt. <Code>never</Code> ist der Typ ohne Werte:
          Eine Funktion mit Rückgabetyp <Code>never</Code> kehrt nie normal zurück, weil sie immer einen
          Fehler wirft.
        </P>
        <TryIt id="ts-funktionen-void-never" modus="ts" {...beispiele['ts-funktionen-void-never']} />
        <Hinweis variante="warnung">
          Im <Code>catch</Code>-Block ist der Fehler vom Typ <Code>unknown</Code> - in JavaScript kann
          man schließlich alles werfen, auch Strings. Prüfe mit <Code>instanceof Error</Code>, bevor du{' '}
          <Code>.message</Code> liest.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Überladungen">
        <P>
          Mit Überladungen gibst du einer Funktion mehrere Signaturen. Aufrufer sehen nur diese
          Signaturen, die Implementierung darunter muss alle abdecken.
        </P>
        <TryIt id="ts-funktionen-ueberladung" modus="ts" {...beispiele['ts-funktionen-ueberladung']} />
        <Liste>
          <li>
            Oft reicht ein Union-Parameter (<Code>value: number | Date</Code>) - Überladungen lohnen sich
            erst, wenn der Rückgabetyp vom Argument abhängt.
          </li>
          <li>Du begegnest ihnen vor allem beim Lesen fremder Typen, etwa in der DOM-Bibliothek.</li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="ts-funktionen-uebung"
          modus="ts"
          {...beispiele['ts-funktionen-uebung']}
          aufgabe={
            <>
              <p>
                Ein kleines Validierungssystem, wie man es für Formulare braucht. Die Logik steht schon -
                es fehlen die Typen:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>Validator</Code> ist eine Funktion: Sie bekommt einen Text und gibt eine
                  Fehlermeldung oder <Code>null</Code> zurück
                </li>
                <li>
                  <Code>minLength</Code> bekommt eine Zahl und liefert einen <Code>Validator</Code>
                </li>
                <li>
                  <Code>validate</Code> bekommt einen Text und eine Liste von Validatoren und liefert alle
                  Fehlermeldungen
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Wo steht bei function f(x: number): string der Rückgabetyp?',
            antworten: ['Vor dem Funktionsnamen', 'Hinter der Parameterliste: ": string"', 'In der ersten Zeile des Körpers'],
            richtig: 1,
            erklaerung: 'Der Rückgabetyp folgt nach einem Doppelpunkt hinter der schließenden Klammer der Parameter.',
          },
          {
            frage: 'type Fn = (n: number) => void. Darf man (n) => n * 2 zuweisen?',
            antworten: ['Nein, die Funktion gibt eine Zahl zurück', 'Ja - bei void wird der Rückgabewert einfach ignoriert', 'Nur mit as'],
            richtig: 1,
            erklaerung: 'Ein void-Rückgabetyp in einem Funktionstyp heißt „der Wert wird nicht benutzt“. Deshalb funktioniert z. B. forEach((n) => list.push(n)).',
          },
          {
            frage: 'Welchen Typ hat error in catch (error) { … }?',
            antworten: ['Error', 'any', 'unknown'],
            richtig: 2,
            erklaerung: 'Mit strict ist error unknown - geworfen werden kann alles. Erst instanceof Error grenzt ihn ein.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Parameter immer typisieren: <Code>function add(a: number, b: number)</Code>.
          </>,
          <>
            Optional <Code>title?: string</Code>, Default <Code>times = 2</Code>, Rest{' '}
            <Code>...numbers: number[]</Code>.
          </>,
          <>
            Funktionstyp: <Code>{'type Operation = (a: number, b: number) => number'}</Code>.
          </>,
          <>
            <Code>void</Code> = kein brauchbarer Rückgabewert, <Code>never</Code> = kehrt nie zurück.
          </>,
          <>
            Im <Code>catch</Code> ist der Fehler <Code>unknown</Code>.
          </>,
        ]}
      />
    </>
  )
}
