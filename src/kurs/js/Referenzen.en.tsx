import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Referenzen.code'

/**
 * KAPITEL 1.6 (English) - References & Immutability
 */
export function Referenzen() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>Two variables, but only one array: assigning does not copy.</P>
        <TryIt
          id="js-referenzen-einstieg"
          {...beispiele['js-referenzen-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Values and references">
        <P>
          Primitive values (numbers, strings, booleans …) are <strong>copied</strong> when you assign them
          to another variable. Objects and arrays are not: the variable only holds a{' '}
          <strong>reference</strong> - a kind of address where the object lives in memory. Two variables
          can point to the <em>same</em> object.
        </P>
        <TryIt
          id="js-referenzen-1"
          {...beispiele['js-referenzen-1']}
        />
        <CodeBlock
          titel="Picture it in memory"
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="Why React cares so much">
        <P>
          When you set state, React checks with <Code>Object.is(prev, next)</Code> - basically{' '}
          <Code>===</Code> - whether anything changed. If you change an object directly (
          <strong>mutation</strong>), the reference stays the same. To React it looks like nothing
          happened: <strong>no re-render</strong>, the UI stays stale.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel2}
        />
        <TryIt
          id="js-referenzen-2"
          {...beispiele['js-referenzen-2']}
        />
        <Hinweis variante="info">
          <strong>Immutability</strong> has more benefits: old states are preserved (undo!), and
          optimizations like <Code>memo</Code> can check with a quick <Code>===</Code> whether something
          changed.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The update patterns">
        <P>You will write these patterns over and over again in React:</P>
        <TryIt
          id="js-referenzen-3"
          {...beispiele['js-referenzen-3']}
        />
      </Abschnitt>

      <Abschnitt titel="Shallow vs. deep copies">
        <P>
          Spread only copies the <strong>top level</strong>. Nested objects inside are still shared
          references. If you change something nested, you have to copy every level along the way.
        </P>
        <TryIt
          id="js-referenzen-4"
          {...beispiele['js-referenzen-4']}
        />
        <Liste>
          <li>Avoid deeply nested state where possible - flat structures are easier to update.</li>
          <li>
            <Code>structuredClone</Code> copies everything, but it is slower and creates new references
            everywhere.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="js-referenzen-uebung"
          {...beispiele['js-referenzen-uebung']}
          aufgabe={
            <>
              <p>
                Write three functions that <strong>don’t change</strong> an array of todos but return a new
                one:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  <Code>addTodo(todos, text)</Code> - appends{' '}
                  <Code>{'{ id: todos.length + 1, text, done: false }'}</Code>
                </li>
                <li>
                  <Code>toggleTodo(todos, id)</Code> - flips <Code>done</Code> on the matching todo
                </li>
                <li>
                  <Code>renameTodo(todos, id, text)</Code> - changes the text of the matching todo
                </li>
              </ul>
              <p className="mt-1">The tests also check that the original stays unchanged.</p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What is [1] === [1] ?',
            antworten: ['true', 'false'],
            richtig: 1,
            erklaerung: 'Two array literals are two different objects with different references.',
          },
          {
            frage: 'Why doesn’t React re-render after list.push(x); setList(list)?',
            antworten: [
              'push is forbidden in React',
              'The reference is the same - React sees no change',
              'setList needs a function',
            ],
            richtig: 1,
            erklaerung: 'React compares old and new with Object.is. Same reference = no change.',
          },
          {
            frage: 'What does { ...user } copy?',
            antworten: ['All levels', 'Only the top level', 'Nothing, it is a reference'],
            richtig: 1,
            erklaerung: 'Spread is a shallow copy - nested objects are still shared.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Primitives are copied, objects and arrays are only passed on as references.',
          <>
            <Code>===</Code> on objects compares the reference, not the content.
          </>,
          'React detects changes by a new reference - so never mutate state.',
          <>
            Patterns: <Code>[...arr, x]</Code>, <Code>arr.filter(…)</Code>,{' '}
            <Code>{'arr.map(x => x.id === id ? { ...x, … } : x)'}</Code>.
          </>,
          'Spread copies shallowly: copy nested levels one by one.',
        ]}
      />
    </>
  )
}
