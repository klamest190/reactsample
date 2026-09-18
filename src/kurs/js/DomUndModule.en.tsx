import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './DomUndModule.code'

/**
 * KAPITEL 1.9 (English) - DOM, Events & Modules
 */
export function DomUndModule() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>Create an element, react to a click, add it to the document.</P>
        <TryIt
          id="js-dom-einstieg"
          {...beispiele['js-dom-einstieg']}
          vorschau
        />
      </Abschnitt>

      <Abschnitt titel="The DOM">
        <P>
          The browser turns the HTML into a tree of objects - the <strong>DOM</strong> (Document Object
          Model). With JavaScript you can find, create and change elements. These editors have a{' '}
          <strong>preview</strong> with an empty <Code>{'<div id="app">'}</Code> that you can write into.
        </P>
        <TryIt
          id="js-dom-1"
          {...beispiele['js-dom-1']}
          vorschau
        />
      </Abschnitt>

      <Abschnitt titel="Events">
        <P>
          With <Code>addEventListener</Code> you react to clicks, input and key presses. The callback
          receives an <strong>event object</strong> with details - e.g. <Code>event.target</Code>, the
          element that triggered it.
        </P>
        <TryIt
          id="js-dom-2"
          {...beispiele['js-dom-2']}
          vorschau
        />
      </Abschnitt>

      <Abschnitt titel="The problem: keeping state and UI in sync">
        <P>
          Look at the example above again: if you click and then type, the input overwrites the click count.
          With <strong>every change</strong> you have to figure out yourself which parts of the page are
          affected. This is called <strong>imperative</strong>: describing step by step <em>how</em> the DOM
          should change.
        </P>
        <TryIt
          id="js-dom-3"
          {...beispiele['js-dom-3']}
          vorschau
        />
        <P>
          React solves exactly this problem with a different approach - <strong>declarative</strong>:
        </P>
        <Liste>
          <li>You keep your data (the <strong>state</strong>) in one place.</li>
          <li>
            You describe what the UI looks like <em>for this data</em> - once, as a function.
          </li>
          <li>
            When the data changes, React calls your function again and updates the DOM{' '}
            <strong>by itself</strong>. No more “don’t forget!”.
          </li>
        </Liste>
        <CodeBlock
          titel="The same list in React (a taste of part 2)"
          code={codeBloecke.beispiel1}
        />
      </Abschnitt>

      <Abschnitt titel="Modules: import and export">
        <P>
          Larger programs are split into files. Every file is a <strong>module</strong> with its own scope.
          What other files may use gets <Code>export</Code>ed. You can see this in every file under{' '}
          <Code>src/</Code> in this project.
        </P>
        <CodeBlock
          titel="math.js"
          code={codeBloecke.beispiel2}
        />
        <CodeBlock
          titel="app.js"
          code={codeBloecke.beispiel3}
        />
        <Hinweis variante="tipp">
          Named exports are usually the better choice: the name is the same everywhere, and your editor can
          import it automatically. Default exports are needed e.g. for <Code>React.lazy()</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="js-dom-uebung"
          {...beispiele['js-dom-uebung']}
          vorschau
          aufgabe={
            <>
              <p>
                Build a counter with DOM methods: a <Code>{'<span>'}</Code> shows the number, a{' '}
                <strong>+1</strong> button increases it, a <strong>Reset</strong> button sets it back to 0.
                When the number is greater than 5, it should turn <strong>red</strong>.
              </p>
              <p className="mt-1">
                Notice that you have to update the display in several places? A function{' '}
                <Code>render()</Code> helps - and React turns exactly this idea into a principle.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What does “declarative” mean in the context of React?',
            antworten: [
              'You describe step by step how the DOM is changed.',
              'You describe what the UI looks like for certain data.',
              'You declare all variables with const.',
            ],
            richtig: 1,
            erklaerung: 'React derives the necessary DOM changes from your description by itself.',
          },
          {
            frage: 'How many default exports can a file have?',
            antworten: ['None', 'At most one', 'Any number'],
            richtig: 1,
            erklaerung: 'One default export per module, any number of named exports.',
          },
          {
            frage: 'How do you import the named export area?',
            antworten: ["import area from './math.js'", "import { area } from './math.js'"],
            richtig: 1,
            erklaerung: 'Named exports go in curly braces, the default export without.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            DOM: <Code>querySelector</Code>, <Code>createElement</Code>, <Code>textContent</Code>,{' '}
            <Code>addEventListener</Code>.
          </>,
          'Imperative = performing every DOM change yourself. This quickly becomes error-prone.',
          'React is declarative: change the state, React updates the DOM.',
          <>
            Modules: <Code>export</Code> / <Code>{'import { … }'}</Code> for named exports,{' '}
            <Code>export default</Code> for one main export.
          </>,
        ]}
      />
    </>
  )
}
