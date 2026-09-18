import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Tailwind.code'
import { TailwindDemo } from '../demos/TailwindDemo'

/**
 * KAPITEL 4.5 (English) - Tailwind CSS in React
 */
export function Tailwind() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>With Tailwind you style directly with classes in <Code>className</Code>.</P>
        <TryIt
          id="praxis-tailwind-einstieg"
          {...beispiele['praxis-tailwind-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Utility first">
        <P>
          Tailwind provides many small classes that each do exactly one thing: <Code>p-4</Code> = padding,{' '}
          <Code>text-sm</Code> = small font, <Code>rounded-lg</Code> = rounded corners. Instead of separate CSS
          files you put them directly into the markup. That fits React well: structure, logic and appearance of
          a component live in one place, and there are no global naming conflicts. This whole app is built
          that way.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel1}
        />
        <Liste>
          <li>
            <strong>Variants</strong> as prefixes: <Code>hover:</Code>, <Code>focus-visible:</Code>,{' '}
            <Code>disabled:</Code>, <Code>dark:</Code>
          </li>
          <li>
            <strong>Responsive</strong>, mobile first: <Code>md:flex-row</Code> applies from 768 px width
          </li>
          <li>
            <strong>group</strong> / <strong>peer</strong>: a child reacts to the state of its parent or sibling
          </li>
        </Liste>
        <TailwindDemo />
      </Abschnitt>

      <Abschnitt titel="Try it">
        <TryIt
          id="praxis-tailwind-karte"
          {...beispiele['praxis-tailwind-karte']}
          modus="react"
        />
        <Hinweis variante="warnung">
          <strong>Limitation in the editor:</strong> Tailwind only generates classes that appear in the
          project’s source code at build time. Classes from the examples here work - completely new ones you
          type yourself may not. In a real project with a running Vite server there is no such limitation. For
          free experimentation, use <Code>{'style={{ … }}'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Setting classes dynamically - the big pitfall">
        <P>
          The Tailwind scanner only reads your code as text. It doesn’t run it. It can’t find class names that
          are assembled at runtime - they then have no effect.
        </P>
        <CodeBlock
          code={codeBloecke.beispiel2}
        />
        <Liste>
          <li>
            For many conditions: the small packages <Code>clsx</Code> (building class strings) and{' '}
            <Code>tailwind-merge</Code> (resolving conflicts like <Code>p-2 p-4</Code>).
          </li>
          <li>
            Don’t hide recurring combinations with <Code>@apply</Code>, put them into a{' '}
            <strong>React component</strong> - like <Code>Button</Code> and <Code>Hinweis</Code> in{' '}
            <Code>src/components/Ui.tsx</Code>.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Tailwind v4 in this project">
        <P>
          Since version 4 there is no <Code>tailwind.config.js</Code> anymore. Everything lives in CSS:
        </P>
        <CodeBlock
          titel="src/index.css"
          code={codeBloecke.beispiel3}
        />
        <P>
          Tailwind is included as a Vite plugin in <Code>vite.config.ts</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="praxis-tailwind-uebung"
          {...beispiele['praxis-tailwind-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>
                Build a <Code>Badge</Code> component with the prop <Code>status</Code> (
                <Code>'open' | 'inProgress' | 'done'</Code>). Each status gets its own colors (<Code>open</Code> → amber, <Code>inProgress</Code> → sky, <Code>done</Code> → emerald), a text (“open”, “in progress”, “done”) and a symbol - via a{' '}
                <strong>lookup object with complete class names</strong>.
              </p>
              <p className="mt-1">
                Available classes (they appear in the project): <Code>bg-amber-100 text-amber-800</Code>,{' '}
                <Code>bg-sky-100 text-sky-800</Code>, <Code>bg-emerald-100 text-emerald-800</Code>,{' '}
                <Code>rounded-full px-2 py-0.5 text-xs font-semibold</Code>.
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Why doesn’t className={`text-${color}-600`} work reliably?',
            antworten: [
              'Template literals are forbidden in className',
              'The scanner can’t find the complete class name in the source code',
              'Tailwind doesn’t support colors',
            ],
            richtig: 1,
            erklaerung: 'Tailwind reads the code statically. Class names must appear in it in full.',
          },
          {
            frage: 'What does md:grid-cols-3 mean?',
            antworten: ['Only on medium screens', 'From 768 px width and up', 'Up to 768 px width'],
            richtig: 1,
            erklaerung: 'Tailwind is mobile first: prefixes apply from that width upwards.',
          },
          {
            frage: 'How do you avoid long, repeated class lists in React?',
            antworten: ['With @apply in CSS', 'With a dedicated component', 'With inline styles'],
            richtig: 1,
            erklaerung: 'In React the component is the natural unit of reuse.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Utility classes directly in JSX; variants like hover:, dark:, md: as prefixes.',
          'Always write class names out in full - lookup objects instead of concatenation.',
          'Encapsulate repetition in components, not with @apply.',
          <>
            v4: configuration in CSS (<Code>@import</Code>, <Code>@theme</Code>, <Code>@custom-variant</Code>).
          </>,
        ]}
      />
    </>
  )
}
