import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Vererbung.code'

/**
 * KAPITEL 7.7 - Vererbung & Interfaces
 * Der zweite Pfeiler der Objektorientierung - und der größte Unterschied zu React.
 */
export function Vererbung() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Mit <Code>extends</Code> übernimmt eine Klasse alles von einer anderen - und darf einzelne
          Methoden anders machen.
        </P>
        <TryIt modus="java" id="java-vererbung-einstieg" {...beispiele['java-vererbung-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="„ist ein“">
        <CodeBlock code={codeBloecke.istEin} />
        <P>
          Die Unterklasse bekommt alle Felder und Methoden der Oberklasse. <Code>super(…)</Code> ruft
          deren Konstruktor auf - und muss als Erstes im eigenen Konstruktor stehen, denn ohne
          fertige Oberklasse gibt es kein gültiges Objekt.
        </P>
      </Abschnitt>

      <Abschnitt titel="Polymorphie: der Trick dahinter">
        <P>
          Das ist der eigentliche Gewinn. Die Variable sagt, <em>was man erwarten darf</em>; das
          Objekt entscheidet, <em>was passiert</em>. Man kann also eine Liste von{' '}
          <Code>Animal</Code> durchlaufen, ohne zu wissen, welche Tierart gerade dran ist.
        </P>
        <TryIt modus="java" id="java-vererbung-polymorphie" {...beispiele['java-vererbung-polymorphie']} />
        <Hinweis variante="info">
          <Code>@Override</Code> ersetzt die geerbte Methode. Mit <Code>super.methode()</Code> kannst
          du die alte Fassung trotzdem noch aufrufen und nur etwas ergänzen - so macht es{' '}
          <Code>Cat.describe()</Code>.
        </Hinweis>
        <P>
          <Code>instanceof</Code> prüft den echten Typ. Seit Java 16 darf man dabei gleich eine
          Variable anlegen: <Code>if (x instanceof Cat cat)</Code> spart den Cast.
        </P>
      </Abschnitt>

      <Abschnitt titel="abstract: ein Bauplan mit Lücken">
        <P>
          Eine <Code>abstract</Code>-Klasse kann man nicht instanziieren - sie ist nur die
          gemeinsame Grundlage. Eine <Code>abstract</Code>-Methode hat keinen Rumpf: Jede
          Unterklasse <em>muss</em> sie liefern, sonst kompiliert es nicht.
        </P>
        <TryIt modus="java" id="java-vererbung-abstract" {...beispiele['java-vererbung-abstract']} />
      </Abschnitt>

      <Abschnitt titel="Interfaces: Fähigkeiten statt Herkunft">
        <P>
          Ein Interface ist ein reiner Vertrag: „Wer das implementiert, kann Folgendes.“ Eine Klasse
          hat genau eine Oberklasse, darf aber beliebig viele Interfaces implementieren.
        </P>
        <CodeBlock code={codeBloecke.wahl} />
        <TryIt modus="java" id="java-vererbung-interface" {...beispiele['java-vererbung-interface']} />
        <Hinweis variante="tipp">
          Faustregel: <strong>abstract class</strong>, wenn es gemeinsame Daten und Code gibt („ist
          ein“). <strong>interface</strong>, wenn es nur um eine Fähigkeit geht („kann“) - besonders,
          wenn sie in ganz verschiedenen Klassen vorkommt.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="enum und record">
        <P>
          Zwei Spezialformen, die viel Tipparbeit sparen. Ein <Code>enum</Code> ist eine Klasse mit
          einer festen, abzählbaren Menge von Objekten - Javas Antwort auf den Union-Type aus
          TypeScript (<Verweis nr="5.8" />).
        </P>
        <TryIt modus="java" id="java-vererbung-enum" {...beispiele['java-vererbung-enum']} />
        <P>
          Ein <Code>record</Code> (seit Java 16) ist eine Klasse für reine Daten. Felder,
          Konstruktor, Getter, <Code>toString</Code> und <Code>equals</Code> erzeugt der Compiler -
          du schreibst eine Zeile.
        </P>
        <TryIt modus="java" id="java-vererbung-record" {...beispiele['java-vererbung-record']} />
      </Abschnitt>

      <Abschnitt titel="Und warum macht React das anders?">
        <P>
          React kennt keine Vererbung zwischen Komponenten. Statt eine Basiskomponente zu erweitern,
          steckt man kleine Komponenten ineinander - das ist <strong>Komposition</strong> (
          <Verweis nr="5.3" />).
        </P>
        <CodeBlock code={codeBloecke.reactVergleich} />
        <P>
          Beide Wege lösen dasselbe Problem: Code teilen, ohne ihn zu kopieren. Vererbung bindet
          dabei fest an eine Hierarchie, Komposition bleibt beweglich. Auch in Java lautet die
          moderne Empfehlung deshalb: <em>„composition over inheritance“</em> - Vererbung ja, aber
          mit Maß.
        </P>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="java"
          id="java-vererbung-uebung"
          {...beispiele['java-vererbung-uebung']}
          aufgabe={
            <>
              <p>Baue eine kleine Gehaltsabrechnung:</p>
              <Liste>
                <li>
                  <Code>abstract class Employee</Code> mit <Code>name</Code>, Konstruktor,{' '}
                  <Code>getName()</Code>, der abstrakten Methode <Code>monthlySalary()</Code> und{' '}
                  <Code>describe()</Code>, das <Code>"Name: Gehalt"</Code> liefert
                </li>
                <li>
                  <Code>Developer(name, hours, hourlyRate)</Code> - Gehalt ={' '}
                  <Code>hours * hourlyRate</Code>
                </li>
                <li>
                  <Code>Manager(name, fixedSalary)</Code> - Gehalt = das Fixgehalt
                </li>
              </Liste>
              <p className="mt-1">
                <Code>describe()</Code> darf nur <strong>einmal</strong> vorkommen - in{' '}
                <Code>Employee</Code>.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was bewirkt Polymorphie bei Animal a = new Dog("Rex"); a.sound(); ?',
            antworten: [
              'Es läuft die Methode von Animal.',
              'Es läuft die Methode von Dog.',
              'Es gibt einen Kompilierfehler.',
              'Das hängt von der Reihenfolge der Klassen ab.',
            ],
            richtig: 1,
            erklaerung: 'Der Typ der Variablen bestimmt, was du aufrufen DARFST. Welche Fassung läuft, entscheidet das Objekt.',
          },
          {
            frage: 'Wie viele Interfaces darf eine Klasse implementieren?',
            antworten: ['keins', 'genau eins', 'beliebig viele', 'höchstens zwei'],
            richtig: 2,
            erklaerung: 'Beliebig viele Interfaces - aber nur eine Oberklasse. Genau dafür gibt es Interfaces.',
          },
          {
            frage: 'Was gilt für eine abstrakte Methode?',
            antworten: [
              'Sie hat einen Rumpf, der überschrieben werden kann.',
              'Sie hat keinen Rumpf, und jede konkrete Unterklasse muss sie liefern.',
              'Sie ist automatisch static.',
              'Sie darf nur in Interfaces stehen.',
            ],
            richtig: 1,
            erklaerung: 'Sie ist ein Versprechen ohne Umsetzung - deshalb kann man die Klasse auch nicht instanziieren.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>extends</Code> heißt „ist ein“ - eine Oberklasse, beliebig viele Interfaces.
          </>,
          <>
            <Code>super(…)</Code> ruft den Konstruktor der Oberklasse, <Code>super.m()</Code> deren
            Methode.
          </>,
          'Polymorphie: Die Variable bestimmt, was erlaubt ist - das Objekt, was passiert.',
          <>
            <Code>abstract</Code> = gemeinsamer Code mit Lücken, <Code>interface</Code> = reiner
            Vertrag (mit optionalen <Code>default</Code>-Methoden).
          </>,
          <>
            <Code>enum</Code> für feste Mengen, <Code>record</Code> für reine Datenklassen.
          </>,
        ]}
      />
    </>
  )
}
