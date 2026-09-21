import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './Formulare.code'
import { Kontaktformular } from '../demos/Kontaktformular'

/**
 * KAPITEL 5.1 (English) - Forms
 */
export function Formulare() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>A controlled input: the value lives in state, submitting goes through <Code>onSubmit</Code>.</P>
        <TryIt
          id="praxis-formulare-einstieg"
          {...beispiele['praxis-formulare-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Controlled vs. uncontrolled">
        <P>There are two ways to manage form fields in React:</P>
        <Liste>
          <li>
            <strong>Controlled</strong>: the value lives in state, the field displays it (<Code>value</Code>)
            and reports changes (<Code>onChange</Code>). You have access at any time - ideal for live
            validation, dependent fields, formatting while typing.
          </li>
          <li>
            <strong>Uncontrolled</strong>: the DOM holds the value. You only read it on submit, e.g. via{' '}
            <Code>FormData</Code> or a ref. Less code, good for simple forms - and the basis of the form actions
            from <Verweis nr="4.9" />.
          </li>
        </Liste>
        <TryIt
          id="praxis-formulare-arten"
          {...beispiele['praxis-formulare-arten']}
          modus="react"
        />
        <Hinweis variante="warnung">
          A field should be either controlled <em>or</em> uncontrolled for its whole life. If <Code>value</Code>{' '}
          switches from <Code>undefined</Code> to a string, React warns. That’s why you use initial values like{' '}
          <Code>''</Code> instead of <Code>undefined</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Many fields, one handler">
        <P>
          Instead of creating separate state and a handler for every field, you keep one object and use the{' '}
          <Code>name</Code> attribute as the key. Checkboxes provide <Code>checked</Code> instead of{' '}
          <Code>value</Code>. Validation is <strong>calculated</strong> from the values on every render - no
          extra error state that could get out of date.
        </P>
        <Kontaktformular />
        <Liste>
          <li>
            <Code>useId()</Code> creates unique IDs for <Code>htmlFor</Code>/<Code>id</Code> - even if the form
            appears several times on the page. Never <Code>Math.random()</Code>.
          </li>
          <li>
            <Code>onSubmit</Code> on the <Code>{'<form>'}</Code> instead of <Code>onClick</Code> on the button -
            that way the Enter key works too.
          </li>
          <li>Only show errors once the field has been left (“touched”) - otherwise the form complains right away.</li>
          <li>
            <Code>aria-invalid</Code> and real <Code>{'<label>'}</Code> elements make the form accessible.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="praxis-formulare-uebung"
          {...beispiele['praxis-formulare-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Build a sign-up form (controlled, one state object, one handler):</p>
              <ul className="mt-1 list-disc pl-5">
                <li>Fields with the <Code>name</Code> attributes <Code>username</Code>, <Code>password</Code>, <Code>repeat</Code> and the checkbox <Code>terms</Code> (“Accept terms”).</li>
                <li>
                  Rules: username ≥ 3 characters, password ≥ 8 characters <em>and</em> at least one digit,
                  passwords match, terms accepted.
                </li>
                <li>Below each field the error message - only after the field has been left.</li>
                <li>The “Sign up” button is only enabled when everything is valid. Afterwards show “Welcome, <em>username</em>!”.</li>
                <li>
                  Link labels with <Code>useId</Code>.
                </li>
              </ul>
            </>
          }
        />
        <Hinweis variante="tipp">
          For large forms you usually use a library like <strong>React Hook Form</strong> with{' '}
          <strong>Zod</strong> for validation. The principle is the same - it just saves you wiring up{' '}
          <Code>value</Code>, <Code>onChange</Code> and errors.
        </Hinweis>
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What makes a field “controlled”?',
            antworten: ['A name attribute', 'value from state plus onChange', 'A <form> around it'],
            richtig: 1,
            erklaerung: 'React then decides the displayed value.',
          },
          {
            frage: 'Where should validation errors come from?',
            antworten: [
              'From a separate useState that is set in onChange',
              'Calculated from the current values while rendering',
            ],
            richtig: 1,
            erklaerung: 'Derived instead of stored - a single source of truth.',
          },
          {
            frage: 'What is useId meant for?',
            antworten: ['For keys in lists', 'For unique id attributes, e.g. label ↔ input', 'For database IDs'],
            richtig: 1,
            erklaerung: 'For list keys you use the IDs of the data, not useId.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Controlled: <Code>value</Code> + <Code>onChange</Code>. Uncontrolled: <Code>defaultValue</Code> +{' '}
            <Code>FormData</Code> on submit.
          </>,
          <>
            One state object, one handler with <Code>[e.target.name]</Code>.
          </>,
          'Validation as a pure function, calculated while rendering.',
          <>
            <Code>onSubmit</Code> + <Code>preventDefault</Code>, labels via <Code>useId</Code>.
          </>,
        ]}
      />
    </>
  )
}
