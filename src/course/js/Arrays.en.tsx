import { Abschnitt, Code, Hinweis, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/ChapterLink'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Arrays.code'

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
          {...examples['js-arrays-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Creating and reading arrays">
        <P>
          An array is an ordered list of values. The index starts at <strong>0</strong>.
        </P>
        <TryIt
          id="js-arrays-1"
          {...examples['js-arrays-1']}
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
          {...examples['js-arrays-2']}
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
          {...examples['js-arrays-3']}
        />
      </Abschnitt>

      <Abschnitt titel="Watch out: methods that change the array">
        <P>
          Some older methods <strong>mutate</strong> the array directly: <Code>push</Code>,{' '}
          <Code>pop</Code>, <Code>splice</Code>, <Code>sort</Code>, <Code>reverse</Code>. In React you must
          never change state directly (you will learn why in <Verweis nr="1.6" />). There is a non-mutating
          alternative for each of them:
        </P>
        <Tabelle
          kopf={['Mutates ❌', 'Creates a new array ✅']}
          spalten={['font-mono text-xs', 'font-mono text-xs']}
          zeilen={[
            ['arr.push(x)', '[...arr, x]'],
            ['arr.unshift(x)', '[x, ...arr]'],
            ['arr.splice(i, 1)', 'arr.filter((_, idx) => idx !== i)  or  arr.toSpliced(i, 1)'],
            ['arr[i] = x', 'arr.map((el, idx) => idx === i ? x : el)  or  arr.with(i, x)'],
            ['arr.sort()', 'arr.toSorted()'],
            ['arr.reverse()', 'arr.toReversed()'],
          ]}
        />
        <TryIt
          id="js-arrays-4"
          {...examples['js-arrays-4']}
        />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="js-arrays-uebung"
          {...examples['js-arrays-uebung']}
          task={
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
        questions={[
          {
            question: 'What does [1, 2, 3].map(x => x > 1) return?',
            answers: ['[2, 3]', '[false, true, true]', 'true'],
            correct: 1,
            explanation: 'map transforms every element - here into the result of the comparison. To remove elements, use filter.',
          },
          {
            question: 'What does find return when nothing matches?',
            answers: ['-1', 'null', 'undefined', '[]'],
            correct: 2,
            explanation: 'find returns undefined; findIndex returns -1.',
          },
          {
            question: 'Which method changes the original array?',
            answers: ['filter', 'toSorted', 'sort', 'map'],
            correct: 2,
            explanation: 'sort sorts “in place”. toSorted returns a sorted copy.',
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
