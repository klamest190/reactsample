import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/ChapterLink'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { TryIt } from '../../learning/TryIt'
import { examples, codeBloecke } from './Props.code'
import { BenutzerKarten } from '../demos/BenutzerKarten'

/**
 * KAPITEL 3.2 (English) - Props, Lists & Conditions
 */
export function Props() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>Props are the parameters of a component - same component, different data.</P>
        <TryIt
          id="react-props-einstieg"
          {...examples['react-props-einstieg']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Props: parameters for components">
        <P>
          Props (short for <em>properties</em>) are to components what parameters are to functions. You pass
          them like HTML attributes, and the component receives them as <strong>one object</strong>. It is
          usually destructured right away (<Verweis nr="1.5" />).
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Liste>
          <li>
            Strings in quotes, <strong>everything else in curly braces</strong>: <Code>{'age={36}'}</Code>,{' '}
            <Code>{'active={false}'}</Code>, <Code>{'data={{ a: 1 }}'}</Code>.
          </li>
          <li>
            An attribute without a value (<Code>isAdmin</Code>) means <Code>true</Code>.
          </li>
          <li>Props can be anything: numbers, objects, arrays, functions, even JSX.</li>
        </Liste>
        <TryIt
          id="react-props-1"
          {...examples['react-props-1']}
          mode="react"
        />
        <Hinweis variante="warnung">
          Props are <strong>read-only</strong>. A component must never change its props - data always flows
          from the top (parent) down (children).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="children: content between the tags">
        <P>
          Everything you write between the opening and closing tag arrives as a special prop,{' '}
          <Code>children</Code>. This is how you build wrapper components like cards, dialogs or layouts.
        </P>
        <TryIt
          id="react-props-2"
          {...examples['react-props-2']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Rendering lists with map and key">
        <P>
          To display a list, you turn an array into an array of JSX elements with <Code>.map()</Code>. Every
          element needs a <Code>key</Code> prop: a <strong>stable, unique</strong> value React uses to
          recognize the element on the next render.
        </P>
        <BenutzerKarten />
        <P>
          This demo is written in TypeScript: <Code>src/course/demos/BenutzerKarten.tsx</Code>. There you can
          see how to describe props with a <Code>type</Code>.
        </P>
        <TryIt
          id="react-props-3"
          {...examples['react-props-3']}
          mode="react"
        />
        <Hinweis variante="warnung">
          Only use the array index as <Code>key</Code> if the list never gets reordered or loses elements.
          Otherwise React assigns state and input to the wrong rows. And never <Code>Math.random()</Code> -
          then every render is a “new” list.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Conditional rendering">
        <P>
          You already know the tools from <Verweis nr="1.2" />. In addition, a component may return{' '}
          <Code>null</Code> - then it renders nothing at all.
        </P>
        <TryIt
          id="react-props-4"
          {...examples['react-props-4']}
          mode="react"
        />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="react-props-uebung"
          {...examples['react-props-uebung']}
          mode="react"
          task={
            <>
              <p>Build a contact list:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  A component <Code>Contact</Code> with the props <Code>name</Code>, <Code>email</Code> and{' '}
                  <Code>favorite</Code>. Favorites get a ⭐ in front of the name.
                </li>
                <li>
                  <Code>App</Code> renders <strong>all</strong> contacts with <Code>map</Code> and a proper{' '}
                  <Code>key</Code>.
                </li>
                <li>Contacts without an email show “no email” in grey.</li>
                <li>
                  Above the list it says “3 contacts, 1 of them favorite” - <em>calculated</em> from the data.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        questions={[
          {
            question: 'How do you pass the number 5 as a prop?',
            answers: ['count="5"', 'count={5}', 'count=5'],
            correct: 1,
            explanation: 'count="5" would be the string "5". Everything except strings goes in { }.',
          },
          {
            question: 'What is a good key for list items from a database?',
            answers: ['The array index', 'Math.random()', 'The ID of the record'],
            correct: 2,
            explanation: 'The ID is unique and stays stable across renders.',
          },
          {
            question: 'How does <Card>Hello</Card> get the text “Hello”?',
            answers: ['props.text', 'props.children', 'props.content'],
            correct: 1,
            explanation: 'Content between the tags always ends up in children.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Props are an object - usually destructured right in the parameter, often with default values.',
          'Props are read-only: data flows from top to bottom.',
          <>
            <Code>children</Code> contains the content between the tags.
          </>,
          <>
            Lists: <Code>{'data.map(d => <X key={d.id} … />)'}</Code> with a stable, unique key.
          </>,
          <>
            Conditions: <Code>&&</Code>, <Code>? :</Code> or <Code>return null</Code>.
          </>,
        ]}
      />
    </>
  )
}
