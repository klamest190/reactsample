import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './Barrierefreiheit.code'

/**
 * KAPITEL 4.9 (English) - Accessibility (a11y)
 */

const elemente: [string, string, string][] = [
  ['<button>', 'button', 'Focusable, Enter and Space trigger onClick'],
  ['<a href>', 'link', 'Goes somewhere else - the wrong building block for actions'],
  ['<h1> … <h6>', 'heading', 'Structure you can jump through'],
  ['<nav>, <main>, <header>', 'navigation, main, banner', 'Regions you can jump to directly'],
  ['<ul>/<ol> + <li>', 'list, listitem', '“List with 5 items”'],
  ['<label> + <input>', 'textbox with a name', 'Clicking the label focuses the field'],
  ['<img alt="…">', 'img', 'alt is the text for everyone who cannot see the image'],
]

export function Barrierefreiheit() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          Two buttons that could look the same. Click into the preview and try it with the keyboard only: you cannot
          even reach the <Code>{'<div>'}</Code> with Tab.
        </P>
        <TryIt id="praxis-a11y-einstieg" {...beispiele['praxis-a11y-einstieg']} modus="react" />
      </Abschnitt>

      <Abschnitt titel="Who is it for?">
        <P>
          Accessible means: everyone can use the app. People who use a <strong>screen reader</strong> (which reads the
          page aloud), who work with the <strong>keyboard</strong> only, who zoom in a lot or have trouble telling
          colors apart. Plus everyone with a temporary limitation: a broken arm, bright sunlight, a baby on one arm.
        </P>
        <Liste>
          <li>
            <strong>Required:</strong> the European Accessibility Act applies in the EU (in Germany as the
            Barrierefreiheitsstärkungsgesetz, since June 2025). Many online shops, banking apps and other consumer
            services must be accessible.
          </li>
          <li>
            <strong>Better for everyone:</strong> clear headings, real buttons and good contrast help every user.
          </li>
          <li>
            <strong>Easier to test:</strong> Testing Library finds elements exactly the way a screen reader does (
            <Verweis id="praxis-testen" />).
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Semantic HTML first">
        <P>
          The most important part costs nothing: the <strong>right HTML element</strong>. Every element has a{' '}
          <strong>role</strong> that browsers and screen readers know - including keyboard support. A{' '}
          <Code>{'<div onClick>'}</Code> has no role, is not focusable and does not react to Enter.
        </P>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Element</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2">What you get for free</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {elemente.map(([el, rolle, text]) => (
                <tr key={el}>
                  <td className="py-1.5 pr-4 align-top">
                    <Code>{el}</Code>
                  </td>
                  <td className="py-1.5 pr-4 align-top">{rolle}</td>
                  <td className="py-1.5">{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TryIt id="praxis-a11y-semantik" {...beispiele['praxis-a11y-semantik']} modus="react" />
        <Liste>
          <li>
            <Code>alt</Code> describes what the image shows. If it is pure decoration, write <Code>alt=""</Code> - then
            it is skipped. Without any <Code>alt</Code>, screen readers often read out the file name.
          </li>
          <li>
            Icon-only buttons need a name: <Code>aria-label</Code>. Hide decoration like the stars with{' '}
            <Code>aria-hidden</Code> and provide text that only screen readers see instead (the Tailwind class{' '}
            <Code>sr-only</Code>).
          </li>
        </Liste>
        <Hinweis variante="warnung">
          The first rule of ARIA: <strong>no ARIA if there is an HTML element for it.</strong>{' '}
          <Code>{'<div role="button">'}</Code> is only a promise - you then have to rebuild focus and keyboard handling
          yourself. <Code>{'<button>'}</Code> already does it.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Forms">
        <P>
          Forms are the most common stumbling block. Three things cover most cases: a visible <strong>label</strong>{' '}
          per field, <strong>errors</strong> linked to their field, and errors that are <strong>announced</strong> as
          soon as they appear. Basics in <Verweis id="praxis-formulare" />.
        </P>
        <TryIt id="praxis-a11y-formular" {...beispiele['praxis-a11y-formular']} modus="react" />
        <Liste>
          <li>
            A <Code>placeholder</Code> is not a label: it disappears while typing and is not read out everywhere.
          </li>
          <li>
            <Code>aria-describedby</Code> points to the <Code>id</Code> of the error text - the screen reader reads it
            together with the field. <Code>useId</Code> provides unique IDs.
          </li>
          <li>
            <Code>autoComplete</Code> (<Code>email</Code>, <Code>name</Code>, <Code>street-address</Code> …) saves
            everyone some typing.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Keyboard and focus">
        <P>
          Everything that works with the mouse must work with the keyboard: Tab to the next element, Enter or Space to
          trigger, Escape to close. And you must always <strong>see</strong> where the focus is.
        </P>
        <TryIt id="praxis-a11y-fokus" {...beispiele['praxis-a11y-fokus']} modus="react" />
        <Liste>
          <li>
            Dialogs are the hardest: focus has to move in, must not disappear behind the dialog and has to return
            afterwards. The native <Code>{'<dialog>'}</Code> with <Code>showModal()</Code> does all that by itself -
            accessed through a ref (<Verweis id="hooks-useref" />).
          </li>
          <li>
            Never <Code>outline: none</Code> without a replacement. In Tailwind, <Code>focus-visible:ring-2</Code> shows
            the ring only for keyboard users.
          </li>
          <li>The tab order follows the HTML. A <Code>tabIndex</Code> greater than 0 almost always makes it worse.</li>
          <li>
            When a single page app changes the page (<Verweis id="praxis-routing" />), focus should move to the new main
            heading - otherwise it stays on the link that was just clicked.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Announcing changes">
        <P>
          Sighted users notice when something on the page changes. A screen reader only reads where the focus is. For
          messages like “3 results” or “Saved” there are <strong>live regions</strong>: when their content changes, it
          is read out.
        </P>
        <TryIt id="praxis-a11y-live" {...beispiele['praxis-a11y-live']} modus="react" />
        <P>
          <Code>aria-live="polite"</Code> and <Code>role="status"</Code> wait until the screen reader is idle.{' '}
          <Code>role="alert"</Code> interrupts immediately - for errors only. Important: the region has to be in the
          DOM before its text changes.
        </P>
      </Abschnitt>

      <Abschnitt titel="Checking">
        <P>
          A good test is an accessibility test at the same time: <Code>getByRole</Code> only finds what is in the{' '}
          <strong>accessibility tree</strong> - what a screen reader sees too. Swap <Code>GoodToolbar</Code> for{' '}
          <Code>BadToolbar</Code> in the example:
        </P>
        <TryIt id="praxis-a11y-pruefen" {...beispiele['praxis-a11y-pruefen']} modus="test" />
        <Liste>
          <li>
            <strong>Keyboard test:</strong> put the mouse away and click through everything once. Finds most problems
            in five minutes.
          </li>
          <li>
            <strong>Automated:</strong> Lighthouse (in the Chrome DevTools) and the axe DevTools extension find missing
            labels, alt texts and weak contrast. Linter rules like <Code>jsx-a11y</Code> (in ESLint and oxlint) report
            many issues right in the editor.
          </li>
          <li>
            <strong>With a screen reader:</strong> NVDA on Windows (free), VoiceOver on Mac and iPhone (built in).
            Trying it once changes how you look at your own app.
          </li>
        </Liste>
        <Hinweis variante="info">
          Automated tools find only about a third of the problems. Whether an alt text makes sense or the order is
          logical, only a person can judge.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="praxis-a11y-uebung"
          {...beispiele['praxis-a11y-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>The newsletter box looks good but is hardly usable without a mouse and screen. Fix it:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>“Newsletter” becomes a real heading.</li>
                <li>
                  The ✕ becomes a <Code>{'<button>'}</Code> named “Close”, “Subscribe” becomes a{' '}
                  <Code>{'<button>'}</Code> too.
                </li>
                <li>The image is decoration.</li>
                <li>The field gets a visible label “E-mail”.</li>
                <li>
                  The error message is linked to the field with <Code>aria-invalid</Code> and{' '}
                  <Code>aria-describedby</Code>.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Why is <div onClick> a problem as a button?',
            antworten: [
              'It looks different',
              'It cannot be reached with Tab, ignores Enter and has no role',
              'onClick does not work on a div',
            ],
            richtig: 1,
            erklaerung: '<button> brings focus, keyboard support and the role “button” for free.',
          },
          {
            frage: 'Which alt text does a purely decorative image get?',
            antworten: ['No alt at all', 'alt=""', 'alt="Image"'],
            richtig: 1,
            erklaerung: 'An empty alt means “skip it”. Without alt the file name is often read out.',
          },
          {
            frage: 'How does a screen reader learn about “Saved” appearing next to the button?',
            antworten: ['Not at all', 'Through a live region like role="status"', 'Through a title tooltip'],
            richtig: 1,
            erklaerung: 'Live regions read out changes even when the focus is elsewhere.',
          },
          {
            frage: 'What is the first rule of ARIA?',
            antworten: [
              'Every element needs a role',
              'No ARIA if there is a suitable HTML element',
              'Always add aria-label in addition to the text',
            ],
            richtig: 1,
            erklaerung: 'Native HTML brings behavior - ARIA only changes what is announced.',
          },
        ]}
      />

      <Merke
        punkte={[
          'The right HTML element does half the work: button, a, h1-h6, label, nav, main, ul.',
          <>
            Images with <Code>alt</Code> (decorative: <Code>alt=""</Code>), icon buttons with <Code>aria-label</Code>.
          </>,
          <>
            Forms: a label per field, errors linked via <Code>aria-describedby</Code> and announced with{' '}
            <Code>role="alert"</Code>.
          </>,
          'Everything works with the keyboard, focus is always visible - dialogs with <dialog> and showModal().',
          <>
            Check: keyboard test, <Code>getByRole</Code> in tests, Lighthouse/axe, once with a screen reader.
          </>,
        ]}
      />
    </>
  )
}
