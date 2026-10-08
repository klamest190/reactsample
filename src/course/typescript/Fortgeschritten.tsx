import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/ChapterLink'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Fortgeschritten.code'

/**
 * KAPITEL 2.8 - Fortgeschrittene Typen & Praxis
 * Mapped, Conditional und Template Literal Types - dazu, was im Projektalltag zählt:
 * Assertions, Async-Code, Daten vom Server und die tsconfig.
 */
export function Fortgeschritten() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Mit Typen kann man rechnen: Ein <strong>Mapped Type</strong> läuft über alle Schlüssel eines Typs
          und baut daraus einen neuen - so wie <Code>map</Code> aus einem Array ein neues macht. Die
          Utility Types aus <Verweis nr="2.6" /> sind genau so gebaut.
        </P>
        <TryIt id="ts-fortgeschritten-einstieg" mode="ts" {...examples['ts-fortgeschritten-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Mapped Types">
        <P>
          <Code>{'{ [K in keyof T]: … }'}</Code> heißt: für jeden Schlüssel <Code>K</Code> von{' '}
          <Code>T</Code> ein Feld. Mit <Code>?</Code> und <Code>readonly</Code> fügst du Modifikatoren
          hinzu, mit einem Minus davor entfernst du sie.
        </P>
        <TryIt id="ts-fortgeschritten-mapped" mode="ts" {...examples['ts-fortgeschritten-mapped']} />
      </Abschnitt>

      <Abschnitt titel="Conditional Types und infer">
        <P>
          <Code>T extends U ? X : Y</Code> ist ein ternärer Operator für Typen. Mit <Code>infer</Code> holst
          du dabei einen Teil heraus - etwa den Elementtyp eines Arrays oder den Wert eines Promise. So sind{' '}
          <Code>ReturnType</Code> und <Code>Awaited</Code> gebaut.
        </P>
        <TryIt id="ts-fortgeschritten-conditional" mode="ts" {...examples['ts-fortgeschritten-conditional']} />
        <Hinweis variante="info">
          Solche Typen schreibst du im Alltag selten selbst - aber du liest sie ständig in den Typen von
          Bibliotheken. Wer sie entziffern kann, versteht auch lange Fehlermeldungen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Template Literal Types">
        <P>
          Wie Template-Strings, nur für Typen: Aus Unions entstehen alle Kombinationen. Mit{' '}
          <Code>Capitalize</Code>, <Code>Uppercase</Code> & Co. lassen sich Namen umformen - so wird aus{' '}
          <Code>'click'</Code> der Typ <Code>'onClick'</Code>.
        </P>
        <TryIt id="ts-fortgeschritten-template" mode="ts" {...examples['ts-fortgeschritten-template']} />
      </Abschnitt>

      <Abschnitt titel="Type Assertions: as">
        <P>
          <Code>wert as Typ</Code> sagt dem Compiler: „Vertrau mir.“ Es wird nichts geprüft und nichts
          umgewandelt - stimmt die Behauptung nicht, hast du einen falschen Typ und keinen Fehler. Deshalb:
          lieber prüfen (<Code>instanceof</Code>, Type Guards) als behaupten.
        </P>
        <TryIt id="ts-fortgeschritten-assertions" mode="ts" {...examples['ts-fortgeschritten-assertions']} />
      </Abschnitt>

      <Abschnitt titel="Async-Code typisieren">
        <P>
          Eine <Code>async</Code>-Funktion gibt immer ein <Code>{'Promise<T>'}</Code> zurück,{' '}
          <Code>await</Code> packt es wieder aus. Schreib den Rückgabetyp von Funktionen, die Daten laden,
          ruhig aus - er ist die Stelle, an der alle Aufrufer ansetzen.
        </P>
        <TryIt id="ts-fortgeschritten-async" mode="ts" {...examples['ts-fortgeschritten-async']} />
      </Abschnitt>

      <Abschnitt titel="Daten vom Server prüfen">
        <P>
          Die wichtigste Grenze jeder App: Was von außen kommt, kennt TypeScript nicht.{' '}
          <Code>response.json()</Code> liefert <Code>any</Code> - ein <Code>as Product</Code> wäre nur eine
          Behauptung. Sicher wird es erst, wenn du die Daten zur Laufzeit prüfst und daraus einen Typ machst.
        </P>
        <TryIt id="ts-fortgeschritten-validieren" mode="ts" {...examples['ts-fortgeschritten-validieren']} />
        <CodeBlock title="Dasselbe mit einer Bibliothek" code={codeBloecke.zod} />
      </Abschnitt>

      <Abschnitt titel="Die tsconfig im echten Projekt">
        <P>
          Ein neues Vite-Projekt (<Code>npm create vite@latest</Code>, Vorlage „React + TypeScript“) bringt
          eine gute tsconfig schon mit. Diese Optionen lohnen sich besonders:
        </P>
        <CodeBlock code={codeBloecke.tsconfig} />
        <Liste>
          <li>
            <Code>npx tsc --noEmit</Code> prüft das ganze Projekt - in <Code>npm run build</Code> läuft das
            meist schon mit.
          </li>
          <li>
            Weiter geht es mit TypeScript in React: Props, Events, Hooks und Context in <Verweis id="praxis-typescript" />.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="ts-fortgeschritten-uebung"
          mode="ts"
          {...examples['ts-fortgeschritten-uebung']}
          task={
            <>
              <p>Ein typsicherer Event-Emitter - das Gesellenstück dieses Teils:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>on(event, handler)</Code>: nur bekannte Events, und der Handler bekommt genau die Daten
                  dieses Events
                </li>
                <li>
                  <Code>emit(event, data)</Code>: nur bekannte Events mit den passenden Daten
                </li>
                <li>
                  <Code>{'HandlerProps<Events>'}</Code>: ein Objekttyp mit <Code>onLogin</Code>,{' '}
                  <Code>onLogout</Code> und <Code>onPurchase</Code> - jeweils mit dem passenden Handler
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'Was ergibt { [K in keyof T]: string } für T = { a: number; b: boolean }?',
            answers: ['{ a: number; b: boolean }', '{ a: string; b: string }', 'string'],
            correct: 1,
            explanation: 'Der Mapped Type übernimmt alle Schlüssel von T, gibt jedem aber den Typ string.',
          },
          {
            question: 'Was macht const user = data as User zur Laufzeit?',
            answers: ['Es prüft, ob data ein User ist', 'Es wandelt data in einen User um', 'Nichts - as existiert nur beim Prüfen'],
            correct: 2,
            explanation: 'Type Assertions werden beim Übersetzen entfernt. Stimmt die Behauptung nicht, merkt es niemand - bis etwas abstürzt.',
          },
          {
            question: 'Wie behandelt man Daten aus response.json() am sichersten?',
            answers: ['Mit as auf den erwarteten Typ setzen', 'Als unknown behandeln und zur Laufzeit prüfen', 'Mit any weiterarbeiten'],
            correct: 1,
            explanation: 'Nur eine echte Prüfung (von Hand oder mit einer Bibliothek wie zod) stellt sicher, dass Typ und Daten übereinstimmen.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Mapped Types: <Code>{'{ [K in keyof T]: … }'}</Code> - so sind Partial, Readonly & Co. gebaut.
          </>,
          <>
            Conditional Types: <Code>T extends U ? X : Y</Code>, mit <Code>infer</Code> Teile herausholen.
          </>,
          <>
            Template Literal Types: <Code>{'`on${Capitalize<T>}`'}</Code>.
          </>,
          <>
            <Code>as</Code> ist eine Behauptung ohne Prüfung - lieber eingrenzen.
          </>,
          <>
            Daten von außen sind <Code>unknown</Code>: zur Laufzeit prüfen, dann typisieren.
          </>,
        ]}
      />
    </>
  )
}
