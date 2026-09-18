import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './FehlerUndKlassen.code'

/**
 * KAPITEL 1.8 - Fehler & Klassen
 * try/catch/throw, Klassen, this und eigene Fehlertypen - die Grundlage für
 * Error Boundaries (4.4) und zum Lesen von fremdem Code.
 */
export function FehlerUndKlassen() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          <Code>try</Code> probiert etwas, <Code>catch</Code> fängt den Fehler ab - und das Programm läuft weiter.
        </P>
        <TryIt id="js-fehler-einstieg" {...beispiele['js-fehler-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Fehler werfen und fangen">
        <P>
          Läuft etwas schief, <strong>wirft</strong> JavaScript einen Fehler: ein Objekt mit <Code>name</Code> und{' '}
          <Code>message</Code>. Wird er nicht gefangen, bricht das Skript ab. Mit <Code>throw</Code> wirfst du selbst
          einen - zum Beispiel, wenn eine Funktion mit ungültigen Werten aufgerufen wird. <Code>finally</Code> läuft
          in jedem Fall, mit oder ohne Fehler.
        </P>
        <TryIt id="js-fehler-werfen" {...beispiele['js-fehler-werfen']} />
        <Liste>
          <li>
            Eingebaute Fehlertypen: <Code>TypeError</Code> (falscher Typ, z. B. <Code>undefined.x</Code>),{' '}
            <Code>RangeError</Code> (Wert außerhalb des erlaubten Bereichs), <Code>SyntaxError</Code> (z. B. bei{' '}
            <Code>JSON.parse</Code>), <Code>ReferenceError</Code> (Variable gibt es nicht).
          </li>
          <li>
            Wirf immer ein <Code>Error</Code>-Objekt, keinen String: Nur so gibt es <Code>message</Code> und den{' '}
            <Code>stack</Code>, der zeigt, wo der Fehler entstand.
          </li>
          <li>
            Mit <Code>await</Code> funktioniert <Code>try/catch</Code> genauso für asynchrone Fehler (
            <Verweis id="js-async" />).
          </li>
        </Liste>
        <Hinweis variante="warnung">
          Ein leeres <Code>catch {'{}'}</Code> ist gefährlich: Der Fehler verschwindet, und niemand erfährt davon.
          Fange nur, was du sinnvoll behandeln kannst - alles andere wirf weiter.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Klassen">
        <P>
          Eine <strong>Klasse</strong> ist eine Vorlage für Objekte mit gleichen Feldern und Methoden. Mit{' '}
          <Code>new</Code> entsteht ein neues Objekt (eine <strong>Instanz</strong>), der <Code>constructor</Code>{' '}
          richtet es ein. In Methoden zeigt <Code>this</Code> auf die Instanz.
        </P>
        <TryIt id="js-fehler-klassen" {...beispiele['js-fehler-klassen']} />
        <Liste>
          <li>
            <Code>#feld</Code> ist privat: Von außen kommt niemand heran, nicht einmal zum Lesen.
          </li>
          <li>
            <Code>get</Code> macht aus einer Methode ein Feld, das bei jedem Lesen berechnet wird - ohne Setter lässt
            es sich nicht überschreiben.
          </li>
          <li>
            <Code>static</Code> gehört zur Klasse selbst, nicht zu den Instanzen: <Code>Counter.fromString()</Code>.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Was ist this?">
        <P>
          <Code>this</Code> ist das Objekt <strong>vor dem Punkt</strong> beim Aufruf - nicht das Objekt, in dem die
          Methode definiert wurde. Gibst du eine Methode weiter (als Callback, an <Code>setTimeout</Code>, als
          Event-Handler), fehlt dieser Punkt, und <Code>this</Code> ist <Code>undefined</Code>.
        </P>
        <TryIt id="js-fehler-this" {...beispiele['js-fehler-this']} />
        <P>
          Arrow Functions haben kein eigenes <Code>this</Code>, sie nehmen das von außen (
          <Verweis id="js-funktionen" />). Das ist ein Grund, warum React heute auf Funktionskomponenten setzt: Es gibt
          kein <Code>this</Code>, das verloren gehen kann. In älterem React-Code siehst du noch{' '}
          <Code>class … extends React.Component</Code> und <Code>this.setState</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Vererbung und eigene Fehler">
        <P>
          Mit <Code>extends</Code> übernimmt eine Klasse alles von einer anderen und ergänzt es.{' '}
          <Code>super(…)</Code> ruft den Konstruktor der Elternklasse auf. Am nützlichsten ist das für{' '}
          <strong>eigene Fehlertypen</strong>: Mit <Code>instanceof</Code> unterscheidest du dann erwartete Fehler
          (falsche Eingabe) von echten Programmfehlern.
        </P>
        <TryIt id="js-fehler-vererbung" {...beispiele['js-fehler-vererbung']} />
        <P>
          Eine Stelle, an der du in React bis heute eine Klasse schreibst, ist die Error Boundary - sie fängt Fehler
          beim Rendern ab (<Verweis id="praxis-fehler" />).
        </P>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="js-fehler-uebung"
          {...beispiele['js-fehler-uebung']}
          aufgabe={
            <>
              <p>Baue ein kleines Bankkonto:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>InsufficientFundsError</Code> erbt von <Code>Error</Code> und hat den <Code>name</Code>{' '}
                  <Code>'InsufficientFundsError'</Code>.
                </li>
                <li>
                  <Code>new BankAccount(owner, start = 0)</Code> mit <Code>deposit(amount)</Code>,{' '}
                  <Code>withdraw(amount)</Code> und dem Getter <Code>balance</Code>. Der Kontostand darf sich von außen
                  nicht ändern lassen.
                </li>
                <li>
                  Zu viel abheben wirft einen <Code>InsufficientFundsError</Code> und lässt den Kontostand unverändert.
                </li>
                <li>
                  <Code>history</Code> ist ein Array mit <Code>{"{ type: 'deposit' | 'withdraw', amount }"}</Code>.
                </li>
                <li>
                  <Code>safeWithdraw(account, amount)</Code> gibt <Code>true</Code> oder bei zu wenig Geld{' '}
                  <Code>false</Code> zurück - alle anderen Fehler wirft es weiter.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Wann läuft der finally-Block?',
            antworten: ['Nur ohne Fehler', 'Nur nach einem Fehler', 'Immer - mit und ohne Fehler'],
            richtig: 2,
            erklaerung: 'Ideal zum Aufräumen, z. B. um einen Ladezustand zu beenden.',
          },
          {
            frage: 'Was ist this in obj.methode()?',
            antworten: ['Die Klasse', 'obj - das Objekt vor dem Punkt', 'Immer window'],
            richtig: 1,
            erklaerung: 'Ohne Punkt beim Aufruf (z. B. als Callback) geht this verloren.',
          },
          {
            frage: 'Wozu eigene Fehlerklassen wie ValidationError?',
            antworten: [
              'Damit man mit instanceof erwartete Fehler von echten Bugs unterscheiden kann',
              'Weil Error nicht geworfen werden darf',
              'Damit der Fehler schneller ist',
            ],
            richtig: 0,
            erklaerung: 'Erwartete Fehler behandelst du, unbekannte wirfst du weiter.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>throw new Error('…')</Code> wirft, <Code>try/catch</Code> fängt, <Code>finally</Code> räumt auf.
          </>,
          'Nur fangen, was man behandeln kann - unbekannte Fehler weiterwerfen.',
          <>
            Klassen: <Code>constructor</Code>, Methoden, <Code>#privat</Code>, <Code>get</Code>, <Code>static</Code>,{' '}
            <Code>extends</Code> + <Code>super</Code>.
          </>,
          <>
            <Code>this</Code> ist das Objekt vor dem Punkt. Arrow Functions haben kein eigenes <Code>this</Code>.
          </>,
        ]}
      />
    </>
  )
}
