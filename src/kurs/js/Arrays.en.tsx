import { Abschnitt, Code, Hinweis, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Arrays.code'

/**
 * KAPITEL 1.4 (English) - Arrays & Their Methods
 */
export function Arrays() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>A list of values - and with <Code>map</Code> a new list made from it.</P>
        <TryIt
          id="js-arrays-einstieg"
          {...beispiele['js-arrays-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Creating and reading arrays">
        <P>
          An array is an ordered list of values. The index starts at <strong>0</strong>.
        </P>
        <TryIt
          id="js-arrays-1"
          {...beispiele['js-arrays-1']}
        />
      </Abschnitt>

      <Abschnitt titel="The big three: map, filter, reduce">
        <P>
          These methods do <strong>not</strong> change the original array, they return a new one. You
          pass a callback function each time, which is called for every element.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <TryIt
          id="js-arrays-2"
          {...beispiele['js-arrays-2']}
        />
        <Hinweis variante="info">
          In React, <Code>.map()</Code> is <strong>the</strong> way to display lists:{' '}
          <Code>{'products.map(p => <li key={p.id}>{p.name}</li>)'}</Code>. So it pays off to really
          internalize it now.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Searching and checking">
        <TryIt
          id="js-arrays-3"
          {...beispiele['js-arrays-3']}
        />
      </Abschnitt>

      <Abschnitt titel="Watch out: methods that change the array">
        <P>
          Some older methods <strong>mutate</strong> the array directly: <Code>push</Code>,{' '}
          <Code>pop</Code>, <Code>splice</Code>, <Code>sort</Code>, <Code>reverse</Code>. In React you must
          never change state directly (you will learn why in <Verweis nr="1.6" />). There is a non-mutating
          alternative for each of them:
        </P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Mutates ❌</th>
                <th className="py-2">Creates a new array ✅</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-xs dark:divide-slate-800">
              {[
                ['arr.push(x)', '[...arr, x]'],
                ['arr.unshift(x)', '[x, ...arr]'],
                ['arr.splice(i, 1)', 'arr.filter((_, idx) => idx !== i)  or  arr.toSpliced(i, 1)'],
                ['arr[i] = x', 'arr.map((el, idx) => idx === i ? x : el)  or  arr.with(i, x)'],
                ['arr.sort()', 'arr.toSorted()'],
                ['arr.reverse()', 'arr.toReversed()'],
              ].map(([old, modern]) => (
                <tr key={old}>
                  <td className="py-2 pr-4">{old}</td>
                  <td className="py-2">{modern}</td>
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

      <Abschnitt titel="Exercise">
        <TryIt
          id="js-arrays-uebung"
          {...beispiele['js-arrays-uebung']}
          aufgabe={
            <>
              <p>
                The array <Code>products</Code> (as above) already exists. Write these functions -{' '}
                <strong>without loops</strong>, only with array methods:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>namesInStock(list)</Code> → array of the names of all products with{' '}
                  <Code>stock &gt; 0</Code>
                </li>
                <li>
                  <Code>totalPrice(list)</Code> → sum of all <Code>price</Code> values
                </li>
                <li>
                  <Code>mostExpensive(list)</Code> → the product object with the highest price
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What does [1, 2, 3].map(x => x > 1) return?',
            antworten: ['[2, 3]', '[false, true, true]', 'true'],
            richtig: 1,
            erklaerung: 'map transforms every element - here into the result of the comparison. To remove elements, use filter.',
          },
          {
            frage: 'What does find return when nothing matches?',
            antworten: ['-1', 'null', 'undefined', '[]'],
            richtig: 2,
            erklaerung: 'find returns undefined; findIndex returns -1.',
          },
          {
            frage: 'Which method changes the original array?',
            antworten: ['filter', 'toSorted', 'sort', 'map'],
            richtig: 2,
            erklaerung: 'sort sorts “in place”. toSorted returns a sorted copy.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>map</Code> transforms, <Code>filter</Code> selects, <Code>reduce</Code> combines,{' '}
            <Code>find</Code> searches for one element.
          </>,
          'These methods create new arrays and can be chained.',
          <>
            <Code>push</Code>, <Code>splice</Code>, <Code>sort</Code> mutate - in React use spread,{' '}
            <Code>filter</Code>, <Code>map</Code> or <Code>toSorted</Code> instead.
          </>,
        ]}
      />
    </>
  )
}
