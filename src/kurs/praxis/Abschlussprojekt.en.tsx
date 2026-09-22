import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './Abschlussprojekt.code'

const steps: [string, string, string][] = [
  ['1', 'Data model & reducer', 'Habits as an array, actions: added, toggled, deleted. Dates as "YYYY-MM-DD" strings.'],
  ['2', 'useLocalStorage', 'A custom hook so the data survives a reload - combined with useReducer.'],
  ['3', 'Form', 'Create a new habit; after adding, focus the field again with useRef.'],
  ['4', 'List & components', 'One row per habit with checkboxes for today and the last 7 days.'],
  ['5', 'Derived values', 'Calculate the streak (days in a row) and today’s progress - with useMemo.'],
  ['6', 'Polish', 'document.title shows “3/5 done” (useEffect), empty state, delete with confirmation.'],
]

/**
 * KAPITEL 5.11 (English) - Final Project
 */
export function Abschlussprojekt() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          To finish, you build a small, complete app and put almost everything from this course together:
          array methods and immutability from part 1, components and data flow from part 3 and the hooks from
          part 4. Take your time - and only look at the sample solution when you get stuck.
        </P>
        <Tabelle
          kopf={['#', 'Step', 'What to do']}
          spalten={['tabular-nums', 'font-medium whitespace-nowrap']}
          zeilen={steps}
        />
        <Hinweis variante="tipp">
          Work step by step and press ▶ Run after each step. Your code is saved automatically, so you can take a
          break at any time.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="praxis-projekt"
          {...beispiele['praxis-projekt']}
          modus="react"
          titel="Habit tracker"
          aufgabe={
            <>
              <p>
                <strong>Requirements</strong> - the helper functions for dates already exist:
              </p>
              <ul className="mt-1 list-disc pl-5">
                <li>Create a habit via an input and “Add” (not empty, no duplicates - then “Add” is disabled) and delete it with “🗑” (with <Code>confirm</Code>).</li>
                <li>For each habit a row with 7 buttons for the last 7 days (the last one is today); a click checks or unchecks the day.</li>
                <li>Per habit the current <strong>streak</strong>: how many days in a row up to today (or yesterday) are done, shown as “🔥 n”.</li>
                <li>At the top: “Today: 2 of 3 done” plus a progress bar; the same text in the tab title.</li>
                <li>Everything survives a reload (localStorage). State logic in a reducer.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Abschnitt titel="Extensions, if you feel like it">
        <Liste>
          <li>
            <strong>Context:</strong> provide <Code>habits</Code> and <Code>dispatch</Code> via context instead of
            props.
          </li>
          <li>
            <strong>Undo:</strong> extend the reducer with a history (<Code>past</Code>, <Code>present</Code>) -
            almost free thanks to immutability.
          </li>
          <li>
            <strong>Statistics:</strong> a weekly overview with a success rate per habit.
          </li>
          <li>
            <strong>Optimistic saving:</strong> pretend saving goes to a server and use{' '}
            <Code>useOptimistic</Code>.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="What’s next?">
        <P>You now know the fundamentals of React. Sensible next steps:</P>
        <Liste>
          <li>
            <strong>Set up your own project:</strong> <Code>npm create vite@latest</Code> with the template{' '}
            <Code>react-ts</Code> - that’s how this project was created, too. Take a look at the code under{' '}
            <Code>src/</Code>: it uses exactly the patterns from the course.
          </li>
          <li>
            <strong>TypeScript:</strong> build the tracker again in TypeScript (<Verweis id="praxis-typescript" />) - typed
            actions catch many bugs before they happen.
          </li>
          <li>
            <strong>Routing:</strong> a statistics page with its own address (<Verweis id="praxis-routing" />).
          </li>
          <li>
            <strong>Data:</strong> TanStack Query for server data with a cache.
          </li>
          <li>
            <strong>Testing:</strong> tests for the reducer and the most important flows (<Verweis id="praxis-testen" />).
          </li>
          <li>
            <strong>Frameworks:</strong> Next.js or React Router (framework mode) for server rendering and Server
            Components.
          </li>
          <li>
            <strong>Documentation:</strong> <Code>react.dev</Code> is excellent - especially the sections
            “Thinking in React” and “You Might Not Need an Effect”.
          </li>
        </Liste>
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Where do you sensibly start with an app like the tracker?',
            antworten: [
              'With the layout and the colors',
              'With the data model and the transitions - that is, the reducer',
              'With the components, the UI follows from them',
            ],
            richtig: 1,
            erklaerung:
              'Once it is clear what the data looks like and how it changes, the UI is only a rendering of it.',
          },
          {
            frage: 'The streak (“🔥 4”) of a habit - where does it belong?',
            antworten: [
              'In its own state that is updated whenever a day is ticked',
              'In the reducer as an extra field on every habit',
              'Not in state at all - it is computed from the ticked days',
            ],
            richtig: 2,
            erklaerung:
              'Whatever can be derived from existing state does not belong in state. Otherwise the two values can drift apart.',
          },
          {
            frage: 'What is a custom hook like useLocalStorage good for?',
            antworten: [
              'It makes the app faster',
              'It encapsulates recurring mechanics so components do not repeat them every time',
              'It replaces the reducer',
            ],
            richtig: 1,
            erklaerung:
              'Custom hooks gather logic with state and effects in one place - the component stays readable.',
          },
        ]}
      />

      <Merke
        punkte={[
          'First the data model and the transitions (reducer), then the UI.',
          'Keep state minimal - streak, progress and title are derived.',
          'Custom hooks encapsulate recurring mechanics like localStorage.',
          'Small components with clear props keep the data flow easy to follow.',
          '🎉 Congratulations - you have completed the learning path!',
        ]}
      />
    </>
  )
}
