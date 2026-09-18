import { Abschnitt, Code, Hinweis, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Objekte.code'

/**
 * KAPITEL 1.5 - Objekte, Destructuring & Spread
 * Props sind Objekte, useState liefert ein Array - beides wird ständig destrukturiert.
 */
export function Objekte() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Ein Objekt bündelt zusammengehörige Werte unter Namen.</P>
        <TryIt
          id="js-objekte-einstieg"
          {...beispiele['js-objekte-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Objekte">
        <P>
          Ein Objekt fasst zusammengehörige Werte unter Namen (<strong>Schlüsseln</strong>)
          zusammen. Lesen kannst du mit Punkt-Notation oder mit eckigen Klammern - letztere
          brauchst du, wenn der Schlüssel in einer Variable steht.
        </P>
        <TryIt
          id="js-objekte-1"
          {...beispiele['js-objekte-1']}
        />
      </Abschnitt>

      <Abschnitt titel="Destructuring">
        <P>
          Destructuring holt Werte aus Objekten und Arrays direkt in Variablen. Du wirst es in jeder
          einzelnen React-Komponente sehen:
        </P>
        <CodeBlock
          titel="Destructuring in React"
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="js-objekte-2"
          {...beispiele['js-objekte-2']}
        />
      </Abschnitt>

      <Abschnitt titel="Spread und Rest: ...">
        <P>
          Die drei Punkte haben zwei Bedeutungen. Als <strong>Spread</strong> verteilen sie den
          Inhalt eines Objekts oder Arrays in ein neues. Als <strong>Rest</strong> sammeln sie „den
          Rest“ ein.
        </P>
        <TryIt
          id="js-objekte-3"
          {...beispiele['js-objekte-3']}
        />
        <Hinweis variante="tipp">
          <Code>{'{ ...prev, field: next }'}</Code> ist <strong>das</strong> Muster, um State-Objekte in
          React zu aktualisieren. Präg es dir gut ein.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Map und Set">
        <P>
          Für zwei häufige Aufgaben gibt es eigene Datenstrukturen. Ein <Code>Set</Code> enthält jeden Wert höchstens
          einmal - ideal für ausgewählte IDs oder zum Entfernen von Duplikaten. Eine <Code>Map</Code> ordnet Schlüsseln
          Werte zu wie ein Objekt, aber die Schlüssel dürfen alles sein (auch Zahlen oder Objekte), die Reihenfolge
          bleibt erhalten und <Code>size</Code> sagt, wie viele Einträge es gibt.
        </P>
        <TryIt id="js-objekte-mapset" {...beispiele['js-objekte-mapset']} />
        <Hinweis variante="warnung">
          Im React-State gilt auch hier: nicht verändern, sondern kopieren (<Verweis id="js-referenzen" />).{' '}
          <Code>selected.add(id)</Code> ändert das bestehende Set, React sieht keine Änderung. Richtig ist{' '}
          <Code>{'setSelected((prev) => new Set(prev).add(id))'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="JSON">
        <P>
          JSON ist ein Textformat, das fast wie ein JavaScript-Objekt aussieht. Du brauchst es, um
          Daten zu speichern (z. B. im <Code>localStorage</Code>) oder von einem Server zu laden.
        </P>
        <TryIt
          id="js-objekte-4"
          {...beispiele['js-objekte-4']}
        />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="js-objekte-uebung"
          {...beispiele['js-objekte-uebung']}
          aufgabe={
            <>
              <p>
                <strong>1.</strong> Schreibe <Code>update(user, changes)</Code>: Es gibt
                ein <em>neues</em> Objekt mit allen Feldern von <Code>user</Code> zurück, in dem die
                Felder aus <Code>changes</Code> überschrieben sind. <Code>user</Code> selbst darf
                sich nicht verändern.
              </p>
              <p className="mt-1">
                <strong>2.</strong> Schreibe <Code>displayName</Code> mit Destructuring im Parameter:
                Es bekommt ein Objekt mit <Code>firstName</Code>, <Code>lastName</Code> und optional{' '}
                <Code>title</Code> und liefert z. B. <Code>'Dr. Ada Lovelace'</Code> bzw. ohne Titel{' '}
                <Code>'Ada Lovelace'</Code>.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: "Was ist das Ergebnis von { ...{ a: 1, b: 2 }, b: 5 } ?",
            antworten: ['{ a: 1, b: 2 }', '{ a: 1, b: 5 }', '{ b: 5 }'],
            richtig: 1,
            erklaerung: 'Spätere Eigenschaften überschreiben frühere mit gleichem Namen.',
          },
          {
            frage: 'Was steht nach const [x, y] = useState(0) in y?',
            antworten: ['0', 'Die Setter-Funktion', 'undefined'],
            richtig: 1,
            erklaerung: 'useState gibt ein Array [value, setter] zurück - destrukturiert nach Position.',
          },
          {
            frage: 'Wie liest du eine Eigenschaft, deren Name in der Variable field steht?',
            antworten: ['obj.field', 'obj[field]', "obj['field']"],
            richtig: 1,
            erklaerung: "obj.field und obj['field'] lesen beide die Eigenschaft mit dem Namen „field“.",
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Kurzschreibweise <Code>{'{ name, age }'}</Code> und dynamische Schlüssel{' '}
            <Code>obj[field]</Code>.
          </>,
          'Destructuring: Objekte nach Namen, Arrays nach Position - auch direkt in Parametern.',
          <>
            Spread <Code>{'{ ...prev, x: 1 }'}</Code> erzeugt eine Kopie mit Änderungen.
          </>,
          <>
            <Code>JSON.stringify</Code> / <Code>JSON.parse</Code> wandeln zwischen Objekt und Text.
          </>,
        ]}
      />
    </>
  )
}
