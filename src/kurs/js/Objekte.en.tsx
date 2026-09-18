import { Abschnitt, Code, Hinweis, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Objekte.code'

/**
 * KAPITEL 1.5 (English) - Objects, Destructuring & Spread
 */
export function Objekte() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>An object groups related values under names.</P>
        <TryIt
          id="js-objekte-einstieg"
          {...beispiele['js-objekte-einstieg']}
        />
      </Abschnitt>

      <Abschnitt titel="Objects">
        <P>
          An object groups related values under names (<strong>keys</strong>). You can read them with dot
          notation or with square brackets - you need the latter when the key is stored in a variable.
        </P>
        <TryIt
          id="js-objekte-1"
          {...beispiele['js-objekte-1']}
        />
      </Abschnitt>

      <Abschnitt titel="Destructuring">
        <P>
          Destructuring pulls values out of objects and arrays directly into variables. You will see it in
          every single React component:
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

      <Abschnitt titel="Spread and rest: ...">
        <P>
          The three dots have two meanings. As <strong>spread</strong> they spread the contents of an object
          or array into a new one. As <strong>rest</strong> they collect “the rest”.
        </P>
        <TryIt
          id="js-objekte-3"
          {...beispiele['js-objekte-3']}
        />
        <Hinweis variante="tipp">
          <Code>{'{ ...prev, field: next }'}</Code> is <strong>the</strong> pattern for updating state
          objects in React. Memorize it well.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Map and Set">
        <P>
          Two common jobs have their own data structures. A <Code>Set</Code> holds each value at most once - ideal for
          selected IDs or for removing duplicates. A <Code>Map</Code> maps keys to values like an object, but keys can be
          anything (numbers or even objects), the order is kept and <Code>size</Code> tells you how many entries there
          are.
        </P>
        <TryIt id="js-objekte-mapset" {...beispiele['js-objekte-mapset']} />
        <Hinweis variante="warnung">
          In React state the rule still applies: copy, don’t change (<Verweis id="js-referenzen" />).{' '}
          <Code>selected.add(id)</Code> changes the existing set and React sees no change. Correct is{' '}
          <Code>{'setSelected((prev) => new Set(prev).add(id))'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="JSON">
        <P>
          JSON is a text format that looks almost like a JavaScript object. You need it to store data (e.g.
          in <Code>localStorage</Code>) or to load it from a server.
        </P>
        <TryIt
          id="js-objekte-4"
          {...beispiele['js-objekte-4']}
        />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="js-objekte-uebung"
          {...beispiele['js-objekte-uebung']}
          aufgabe={
            <>
              <p>
                <strong>1.</strong> Write <Code>update(user, changes)</Code>: it returns a <em>new</em>{' '}
                object with all fields of <Code>user</Code>, where the fields from <Code>changes</Code> are
                overwritten. <Code>user</Code> itself must not change.
              </p>
              <p className="mt-1">
                <strong>2.</strong> Write <Code>displayName</Code> with destructuring in the parameter: it
                receives an object with <Code>firstName</Code>, <Code>lastName</Code> and an optional{' '}
                <Code>title</Code> and returns e.g. <Code>'Dr. Ada Lovelace'</Code>, or without a title{' '}
                <Code>'Ada Lovelace'</Code>.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What is the result of { ...{ a: 1, b: 2 }, b: 5 } ?',
            antworten: ['{ a: 1, b: 2 }', '{ a: 1, b: 5 }', '{ b: 5 }'],
            richtig: 1,
            erklaerung: 'Later properties overwrite earlier ones with the same name.',
          },
          {
            frage: 'What is in y after const [x, y] = useState(0) ?',
            antworten: ['0', 'The setter function', 'undefined'],
            richtig: 1,
            erklaerung: 'useState returns an array [value, setter] - destructured by position.',
          },
          {
            frage: 'How do you read a property whose name is stored in the variable field?',
            antworten: ['obj.field', 'obj[field]', "obj['field']"],
            richtig: 1,
            erklaerung: "obj.field and obj['field'] both read the property literally named “field”.",
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Shorthand <Code>{'{ name, age }'}</Code> and dynamic keys <Code>obj[field]</Code>.
          </>,
          'Destructuring: objects by name, arrays by position - also directly in parameters.',
          <>
            Spread <Code>{'{ ...prev, x: 1 }'}</Code> creates a copy with changes.
          </>,
          <>
            <Code>JSON.stringify</Code> / <Code>JSON.parse</Code> convert between object and text.
          </>,
        ]}
      />
    </>
  )
}
