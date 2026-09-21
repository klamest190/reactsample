import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Unions.code'

/**
 * KAPITEL 2.4 - Unions & Narrowing
 * Das Herzstück von TypeScript im Alltag: Werte mit mehreren möglichen Typen sicher behandeln.
 */
export function Unions() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Eine Union <Code>A | B</Code> heißt „A oder B“. Aus festen Werten gebaut, beschreibt sie genau die
          erlaubten Möglichkeiten - statt irgendeinem <Code>string</Code> nur diese drei.
        </P>
        <TryIt id="ts-unions-einstieg" modus="ts" {...beispiele['ts-unions-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Union- und Literal-Typen">
        <P>
          Solange TypeScript nicht weiß, welcher Typ gerade drinsteckt, darfst du nur benutzen, was{' '}
          <strong>alle</strong> Möglichkeiten gemeinsam haben. <strong>Literal-Typen</strong> sind einzelne
          Werte als Typ - zusammen mit Unions ersetzen sie oft Enums und „magische Strings“.
        </P>
        <TryIt id="ts-unions-union" modus="ts" {...beispiele['ts-unions-union']} />
      </Abschnitt>

      <Abschnitt titel="Eingrenzen mit typeof und Wahrheitswerten">
        <P>
          <strong>Narrowing</strong> (Eingrenzen) heißt: Nach einer Prüfung weiß TypeScript, welcher Typ
          übrig ist. Das funktioniert mit ganz normalem JavaScript - <Code>typeof</Code>, <Code>if</Code>,
          frühes <Code>return</Code>. Nach dem <Code>if</Code> ist der geprüfte Fall weg.
        </P>
        <TryIt id="ts-unions-typeof" modus="ts" {...beispiele['ts-unions-typeof']} />
      </Abschnitt>

      <Abschnitt titel="in und instanceof">
        <P>
          Bei Objekten hilft <Code>typeof</Code> nicht weiter - es liefert immer <Code>"object"</Code>. Dann
          prüfst du mit <Code>in</Code>, ob eine Eigenschaft existiert, oder mit <Code>instanceof</Code>, ob
          der Wert von einer Klasse stammt.
        </P>
        <TryIt id="ts-unions-in-instanceof" modus="ts" {...beispiele['ts-unions-in-instanceof']} />
        <CodeBlock titel="Alle Arten, einzugrenzen" code={codeBloecke.eingrenzen} />
      </Abschnitt>

      <Abschnitt titel="Discriminated Unions">
        <P>
          Das wichtigste Muster dieses Kapitels: Jede Variante bekommt ein gemeinsames Feld (hier{' '}
          <Code>kind</Code>) mit einem eigenen Literal-Wert. Ein <Code>switch</Code> über dieses Feld grenzt
          die Variante ein - in jedem <Code>case</Code> kennt TypeScript genau ihre Felder. Reducer-Actions
          in <Verweis nr="4.5" /> funktionieren genau so.
        </P>
        <TryIt id="ts-unions-discriminated" modus="ts" {...beispiele['ts-unions-discriminated']} />
        <CodeBlock titel="Zustände statt Flags" code={codeBloecke.react} />
      </Abschnitt>

      <Abschnitt titel="Vollständigkeit prüfen mit never">
        <P>
          Kommt später eine Variante dazu, sollen alle Stellen auffallen, die sie noch nicht behandeln. Der
          Trick: Im <Code>default</Code> ist der Wert vom Typ <Code>never</Code>, wenn alle Fälle abgedeckt
          sind. Fehlt einer, passt der Wert nicht mehr zu <Code>never</Code> - und die Typprüfung meldet sich.
        </P>
        <TryIt id="ts-unions-never" modus="ts" {...beispiele['ts-unions-never']} />
        <Hinweis variante="tipp">
          Probier es aus: Entferne im Beispiel das <Code>//</Code> vor der Dreiecks-Variante und sieh
          dir an, was die Typprüfung meldet.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Eigene Type Guards">
        <P>
          Wird die Prüfung länger, packst du sie in eine Funktion. Der Rückgabetyp{' '}
          <Code>value is User</Code> macht daraus einen <strong>Type Guard</strong>: Gibt die Funktion{' '}
          <Code>true</Code> zurück, behandelt TypeScript den Wert danach als <Code>User</Code>. Ideal für
          Daten vom Typ <Code>unknown</Code>.
        </P>
        <TryIt id="ts-unions-guard" modus="ts" {...beispiele['ts-unions-guard']} />
        <Hinweis variante="warnung">
          TypeScript glaubt deinem Type Guard aufs Wort. Prüft er zu wenig, stimmt der Typ nicht mehr mit
          der Wirklichkeit überein - teste solche Funktionen deshalb besonders gründlich.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="null und undefined">
        <P>
          Mit <Code>strict</Code> sind <Code>null</Code> und <Code>undefined</Code> eigene Typen - ein
          „vielleicht nicht vorhandener“ Wert ist also einfach eine Union wie{' '}
          <Code>number | null</Code>. Eingrenzen, <Code>?.</Code> und <Code>??</Code> erledigen den Rest.
        </P>
        <TryIt id="ts-unions-null" modus="ts" {...beispiele['ts-unions-null']} />
        <Liste>
          <li>
            <Code>wert!</Code> (Non-Null-Assertion) entfernt <Code>null</Code> und <Code>undefined</Code> aus
            dem Typ - ohne jede Prüfung. Nur einsetzen, wenn du es wirklich sicher weißt.
          </li>
          <li>
            Besser: echt prüfen (<Code>if</Code>, <Code>??</Code>) - dann stimmen Typ und Laufzeit überein.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="ts-unions-uebung"
          modus="ts"
          {...beispiele['ts-unions-uebung']}
          aufgabe={
            <>
              <p>Ein Shop kennt drei Zahlungsarten:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  Modelliere sie als Discriminated Union <Code>Payment</Code> mit dem gemeinsamen Feld{' '}
                  <Code>type</Code> (<Code>'card'</Code>, <Code>'paypal'</Code>, <Code>'invoice'</Code>)
                </li>
                <li>
                  <Code>describe</Code> liefert <Code>"Card ending in 1234"</Code> (letzte vier Ziffern),{' '}
                  <Code>"PayPal (ada@example.com)"</Code> bzw. <Code>"Invoice, due in 14 days"</Code>
                </li>
                <li>
                  <Code>fee</Code> berechnet die Gebühr: Karte 2 %, PayPal 3 %, Rechnung keine
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'value hat den Typ string | number. Was darfst du ohne Prüfung aufrufen?',
            antworten: ['value.toUpperCase()', 'value.toFixed(2)', 'value.toString()'],
            richtig: 2,
            erklaerung: 'Ohne Eingrenzen ist nur erlaubt, was beide Typen haben. toString gibt es bei string und number, toUpperCase und toFixed jeweils nur bei einem.',
          },
          {
            frage: 'Was macht eine Union zur Discriminated Union?',
            antworten: ['Sie hat mindestens drei Varianten', 'Alle Varianten haben ein gemeinsames Feld mit unterschiedlichen Literal-Werten', 'Sie verwendet interface statt type'],
            richtig: 1,
            erklaerung: 'Das gemeinsame Feld (kind, type, status …) mit einem eigenen Literal pro Variante erlaubt es TypeScript, per switch oder if einzugrenzen.',
          },
          {
            frage: 'Wozu dient assertNever(shape) im default-Zweig?',
            antworten: ['Es wirft zur Laufzeit immer einen Fehler', 'Es meldet schon beim Prüfen, wenn ein Fall fehlt', 'Es macht aus shape einen beliebigen Typ'],
            richtig: 1,
            erklaerung: 'Sind alle Fälle behandelt, ist shape dort vom Typ never. Fehlt einer, passt der Rest nicht zu never - ein Typfehler zeigt die vergessene Stelle.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Union <Code>A | B</Code> = A oder B. Literal-Typen wie <Code>'open' | 'done'</Code> erlauben nur
            genau diese Werte.
          </>,
          <>
            Eingrenzen mit <Code>typeof</Code>, <Code>in</Code>, <Code>instanceof</Code>, Vergleichen und{' '}
            <Code>if (!wert)</Code>.
          </>,
          <>
            Discriminated Union: gemeinsames Feld wie <Code>kind</Code>, dann <Code>switch</Code>.
          </>,
          <>
            <Code>never</Code> im <Code>default</Code> prüft auf Vollständigkeit.
          </>,
          <>
            Type Guards (<Code>value is User</Code>) für <Code>unknown</Code>-Daten, <Code>!</Code> nur im
            Notfall.
          </>,
        ]}
      />
    </>
  )
}
