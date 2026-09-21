import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './UtilityTypes.code'

/**
 * KAPITEL 2.6 - Typ-Operatoren & Utility Types
 * Typen aus anderen Typen ableiten: eine Quelle der Wahrheit statt doppelter Definitionen.
 */
export function UtilityTypes() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Ein Todo zum Anlegen hat noch keine <Code>id</Code>, ein Update ändert nur einzelne Felder. Statt
          dafür neue Typen abzuschreiben, leitest du sie mit <strong>Utility Types</strong> vom
          Original ab. Ändert sich <Code>Todo</Code>, ändern sich alle abgeleiteten Typen mit.
        </P>
        <TryIt id="ts-utility-einstieg" modus="ts" {...beispiele['ts-utility-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="typeof, keyof und Indexzugriff">
        <P>Drei Operatoren, aus denen fast alles andere gebaut ist:</P>
        <Liste>
          <li>
            <Code>typeof wert</Code> - an einer Typ-Stelle macht es aus einem <strong>Wert</strong> einen Typ
          </li>
          <li>
            <Code>keyof Typ</Code> - die Union aller Schlüssel
          </li>
          <li>
            <Code>{"Typ['feld']"}</Code> - der Typ eines einzelnen Feldes (Indexzugriff)
          </li>
        </Liste>
        <TryIt id="ts-utility-keyof-typeof" modus="ts" {...beispiele['ts-utility-keyof-typeof']} />
        <Hinweis variante="info">
          Achte auf die Stelle: <Code>typeof x</Code> in normalem Code ist das JavaScript-
          <Code>typeof</Code> und liefert zur Laufzeit einen String wie <Code>"object"</Code>. Hinter{' '}
          <Code>type … =</Code> oder einem Doppelpunkt ist es der TypeScript-Operator.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="as const">
        <P>
          Normalerweise verbreitert TypeScript Werte: Aus <Code>'small'</Code> in einem Array wird{' '}
          <Code>string</Code>. Mit <Code>as const</Code> bleibt jeder Wert sein eigener Literal-Typ, und
          alles wird <Code>readonly</Code>. So wird eine Liste von Werten zur einzigen Quelle - der
          Union-Typ ergibt sich daraus.
        </P>
        <TryIt id="ts-utility-as-const" modus="ts" {...beispiele['ts-utility-as-const']} />
      </Abschnitt>

      <Abschnitt titel="satisfies">
        <P>
          Eine Annotation (<Code>const x: Typ = …</Code>) prüft den Wert, ersetzt aber seinen Typ durch den
          allgemeineren. <Code>satisfies Typ</Code> prüft genauso - behält aber den genauen Typ des Werts.
          Das ist ideal für Konfigurationen und Nachschlage-Tabellen.
        </P>
        <TryIt id="ts-utility-satisfies" modus="ts" {...beispiele['ts-utility-satisfies']} />
        <Hinweis variante="tipp">
          Die Codebeispiele dieses Kurses nutzen genau das: <Code>{'satisfies Record<string, CodeBeispiel>'}</Code>{' '}
          prüft jedes Beispiel - und trotzdem kennt TypeScript jede einzelne ID.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Die wichtigsten Utility Types">
        <P>
          TypeScript bringt eine Reihe fertiger Typ-Werkzeuge mit. Du musst sie nicht auswendig kennen -
          aber wissen, dass es sie gibt.
        </P>
        <TryIt id="ts-utility-mehr" modus="ts" {...beispiele['ts-utility-mehr']} />
        <CodeBlock titel="Übersicht" code={codeBloecke.uebersicht} />
        <Liste>
          <li>
            <Code>{'ReturnType<typeof fn>'}</Code> ist praktisch, wenn der Typ aus einer Funktion kommt, die du
            nicht selbst geschrieben hast.
          </li>
          <li>
            In React begegnen dir außerdem <Code>{"ComponentProps<'button'>"}</Code> und{' '}
            <Code>ReactNode</Code> - dazu mehr im TypeScript-Kapitel von Teil 5.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="ts-utility-uebung"
          modus="ts"
          {...beispiele['ts-utility-uebung']}
          aufgabe={
            <>
              <p>
                Leite alle Typen von <Code>Product</Code> ab - ohne ein einziges Feld abzuschreiben:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>ProductDraft</Code>: alles außer <Code>id</Code>
                </li>
                <li>
                  <Code>ProductPatch</Code>: nur <Code>name</Code>, <Code>price</Code> und <Code>stock</Code>, alle
                  optional
                </li>
                <li>
                  <Code>ProductSummary</Code>: nur <Code>id</Code> und <Code>name</Code>
                </li>
                <li>
                  <Code>Category</Code>: einer der Werte aus <Code>CATEGORIES</Code>
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Welcher Typ hat alle Felder von User außer password?',
            antworten: ["Pick<User, 'password'>", "Omit<User, 'password'>", "Partial<User>"],
            richtig: 1,
            erklaerung: 'Omit lässt die genannten Felder weg, Pick behält nur die genannten.',
          },
          {
            frage: "Was ist (typeof SIZES)[number] für const SIZES = ['s', 'm'] as const?",
            antworten: ['number', 'string', "'s' | 'm'"],
            richtig: 2,
            erklaerung: 'as const macht aus dem Array ein readonly-Tupel mit Literal-Typen. [number] liest den Typ aller Elemente - die Union der Werte.',
          },
          {
            frage: 'Was unterscheidet satisfies von einer Typannotation?',
            antworten: ['satisfies prüft gar nicht', 'satisfies prüft den Wert, behält aber seinen genauen Typ', 'satisfies funktioniert nur mit Funktionen'],
            richtig: 1,
            erklaerung: 'Beide prüfen gegen den Typ. Die Annotation ersetzt den Typ durch den allgemeineren, satisfies lässt den abgeleiteten Typ stehen.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Ableiten statt abschreiben: <Code>Partial</Code>, <Code>Pick</Code>, <Code>Omit</Code>,{' '}
            <Code>Record</Code>, <Code>Readonly</Code>.
          </>,
          <>
            <Code>typeof wert</Code> macht aus einem Wert einen Typ, <Code>keyof</Code> liefert die Schlüssel,{' '}
            <Code>{"T['feld']"}</Code> einen Feldtyp.
          </>,
          <>
            <Code>as const</Code> + <Code>(typeof LISTE)[number]</Code> = Union aus einer Werteliste.
          </>,
          <>
            <Code>satisfies</Code> prüft und behält den genauen Typ.
          </>,
          <>
            <Code>ReturnType</Code>, <Code>Parameters</Code>, <Code>Awaited</Code> holen Typen aus Funktionen.
          </>,
        ]}
      />
    </>
  )
}
