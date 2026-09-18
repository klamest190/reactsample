import { Abschnitt, Code, Hinweis, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Arrays.code'

/**
 * KAPITEL 1.4 - Arrays & ihre Methoden
 * map, filter, find & reduce sind in React das tägliche Brot.
 */
export function Arrays() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Eine Liste von Werten - und mit <Code>map</Code> eine neue Liste daraus.</P>
        <TryIt
          id="js-arrays-einstieg"
          {...beispiele['js-arrays-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Arrays anlegen und lesen">
        <P>
          Ein Array ist eine geordnete Liste von Werten. Der Index beginnt bei <strong>0</strong>.
        </P>
        <TryIt
          id="js-arrays-1"
          {...beispiele['js-arrays-1']}
        />
      </Abschnitt>

      <Abschnitt titel="Die großen Drei: map, filter, reduce">
        <P>
          Diese Methoden verändern das ursprüngliche Array <strong>nicht</strong>, sondern geben ein
          neues zurück. Du übergibst jeweils eine Callback-Funktion, die für jedes Element
          aufgerufen wird.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="js-arrays-2"
          {...beispiele['js-arrays-2']}
        />
        <Hinweis variante="info">
          In React ist <Code>.map()</Code> <strong>der</strong> Weg, Listen darzustellen:{' '}
          <Code>{'products.map(p => <li key={p.id}>{p.name}</li>)'}</Code>. Deshalb lohnt es sich,
          es jetzt wirklich zu verinnerlichen.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Suchen und prüfen">
        <TryIt
          id="js-arrays-3"
          {...beispiele['js-arrays-3']}
        />
      </Abschnitt>

      <Abschnitt titel="Achtung: Methoden, die das Array verändern">
        <P>
          Einige ältere Methoden <strong>mutieren</strong> das Array direkt: <Code>push</Code>,{' '}
          <Code>pop</Code>, <Code>splice</Code>, <Code>sort</Code>, <Code>reverse</Code>. In React
          darfst du State nie direkt verändern (warum, lernst du in <Verweis nr="1.6" />). Für jede gibt es
          eine nicht-mutierende Alternative:
        </P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Mutiert ❌</th>
                <th className="py-2">Erzeugt neues Array ✅</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-xs dark:divide-slate-800">
              {[
                ['arr.push(x)', '[...arr, x]'],
                ['arr.unshift(x)', '[x, ...arr]'],
                ['arr.splice(i, 1)', 'arr.filter((_, idx) => idx !== i)  oder  arr.toSpliced(i, 1)'],
                ['arr[i] = x', 'arr.map((el, idx) => idx === i ? x : el)  oder  arr.with(i, x)'],
                ['arr.sort()', 'arr.toSorted()'],
                ['arr.reverse()', 'arr.toReversed()'],
              ].map(([alt, neu]) => (
                <tr key={alt}>
                  <td className="py-2 pr-4">{alt}</td>
                  <td className="py-2">{neu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TryIt
          id="js-arrays-4"
          {...beispiele['js-arrays-4']}
        />
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="js-arrays-uebung"
          {...beispiele['js-arrays-uebung']}
          aufgabe={
            <>
              <p>
                Das Array <Code>products</Code> (wie oben) ist bereits vorhanden. Schreibe diese
                Funktionen - <strong>ohne Schleifen</strong>, nur mit Array-Methoden:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>namesInStock(list)</Code> → Array der Namen aller Produkte mit{' '}
                  <Code>stock &gt; 0</Code>
                </li>
                <li>
                  <Code>totalPrice(list)</Code> → Summe aller <Code>price</Code>-Werte
                </li>
                <li>
                  <Code>mostExpensive(list)</Code> → das Produkt-Objekt mit dem höchsten Preis
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was gibt [1, 2, 3].map(x => x > 1) zurück?',
            antworten: ['[2, 3]', '[false, true, true]', 'true'],
            richtig: 1,
            erklaerung: 'map wandelt jedes Element um - hier in das Ergebnis des Vergleichs. Zum Aussortieren nimmt man filter.',
          },
          {
            frage: 'Was liefert find, wenn nichts passt?',
            antworten: ['-1', 'null', 'undefined', '[]'],
            richtig: 2,
            erklaerung: 'find gibt undefined zurück; findIndex liefert -1.',
          },
          {
            frage: 'Welche Methode verändert das ursprüngliche Array?',
            antworten: ['filter', 'toSorted', 'sort', 'map'],
            richtig: 2,
            erklaerung: 'sort sortiert „in place“. toSorted gibt eine sortierte Kopie zurück.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>map</Code> wandelt um, <Code>filter</Code> sortiert aus, <Code>reduce</Code> fasst
            zusammen, <Code>find</Code> sucht ein Element.
          </>,
          'Diese Methoden erzeugen neue Arrays und lassen sich verketten.',
          <>
            <Code>push</Code>, <Code>splice</Code>, <Code>sort</Code> mutieren - in React stattdessen
            Spread, <Code>filter</Code>, <Code>map</Code> oder <Code>toSorted</Code>.
          </>,
        ]}
      />
    </>
  )
}
