import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './SpringErrors.code'

/**
 * CHAPTER 8.4 - Validation & error handling (English version)
 */
export function SpringErrors() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          Two annotations on the record, a <Code>@Valid</Code> in front - and Spring rejects invalid
          data before your method even runs. The second request gets <strong>400</strong>; the method
          is not called at all. What exactly was wrong is in the log.
        </P>
        <TryIt modus="spring" id="spring-fehler-valid" {...beispiele['spring-fehler-valid']} />
      </Abschnitt>

      <Abschnitt titel="Never trust the client">
        <P>
          The form in the frontend may already check whether the title is empty (<Verweis nr="5.1" />
          ) - but the backend must not rely on that. Anyone can send any request with{' '}
          <Code>curl</Code> or a script. So the rule is:{' '}
          <strong>the backend checks everything that comes in itself.</strong>
        </P>
        <P>
          That is what <strong>Bean Validation</strong> is for: rules as annotations directly on the
          fields. In a real project it needs this starter:
        </P>
        <CodeBlock code={codeBloecke.abhaengigkeit} titel="pom.xml" />
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">Annotation</th>
                <th className="py-2">checks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[
                ['@NotNull', 'not null'],
                ['@NotBlank', 'text not null, not empty and not only spaces'],
                ['@NotEmpty', 'text or list not empty'],
                ['@Size(min = 1, max = 40)', 'length of a text or list'],
                ['@Min(1) / @Max(5)', 'number range'],
                ['@Positive', 'greater than 0'],
                ['@Email', 'looks like an email address'],
                ['@Pattern(regexp = "…")', 'matches a regular expression'],
              ].map(([annotation, check]) => (
                <tr key={annotation}>
                  <td className="py-2 pr-4 font-mono text-xs">{annotation}</td>
                  <td className="py-2">{check}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Hinweis variante="warnung">
          Without <Code>@Valid</Code> on the parameter nothing happens at all - the annotations on the
          record are simply ignored. That is the most common reason for “my validation does not
          work”.
        </Hinweis>
        <P>
          By the way, Spring Boot’s default answer does not reveal <em>what</em> was wrong - only
          that something was:
        </P>
        <CodeBlock code={codeBloecke.standard} titel="400 Bad Request" sprache="konfig" />
        <P>How to change that comes in a moment.</P>
      </Abschnitt>

      <Abschnitt titel="Exceptions become status codes">
        <P>
          Not every error is broken input. Sometimes the thing you are looking for simply does not
          exist - then the answer should be <strong>404</strong>, not 500. Two simple ways:
        </P>
        <Liste>
          <li>
            <Code>@ResponseStatus(HttpStatus.NOT_FOUND)</Code> on an exception class of your own
            (custom exceptions: <Verweis nr="7.9" />).
          </li>
          <li>
            <Code>throw new ResponseStatusException(HttpStatus.CONFLICT, "…")</Code> right where the
            problem shows up.
          </li>
        </Liste>
        <P>
          Anything else that is thrown out of a method becomes <strong>500</strong> - with a stack
          trace in the log. The message only shows up in the response because the properties say{' '}
          <Code>server.error.include-message=always</Code>:
        </P>
        <TryIt modus="spring" id="spring-fehler-status" {...beispiele['spring-fehler-status']} />
        <Hinweis variante="info">
          That Spring Boot hides error messages by default is intentional: a message like
          “Connection to db-prod-3 refused” tells attackers more than they should know.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="All errors in one place: @RestControllerAdvice">
        <P>
          In bigger projects you want to answer errors consistently. A class with{' '}
          <Code>@RestControllerAdvice</Code> collects <Code>@ExceptionHandler</Code> methods that
          apply to <em>all</em> controllers. They get the exception as a parameter and return the
          answer - just like a normal controller method.
        </P>
        <P>
          For the content there is a standard, <strong>Problem Details</strong> (RFC 9457), which
          Spring supports directly with <Code>ProblemDetail</Code>:
        </P>
        <CodeBlock code={codeBloecke.problem} titel="404 · application/problem+json" sprache="konfig" />
        <P>
          Validation errors are exceptions too (<Code>MethodArgumentNotValidException</Code>) - a
          handler can turn them into a list “field → message” that a form in the frontend can use:
        </P>
        <TryIt modus="spring" id="spring-fehler-advice" {...beispiele['spring-fehler-advice']} />
        <P>Who gets an exception is decided by Spring in this order:</P>
        <CodeBlock code={codeBloecke.reihenfolge} titel="Order" sprache="konfig" />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="spring"
          id="spring-fehler-uebung"
          {...beispiele['spring-fehler-uebung']}
          aufgabe={
            <>
              <p>Make the book API robust:</p>
              <Liste>
                <li>
                  When creating, <Code>title</Code> and <Code>author</Code> must be filled in and{' '}
                  <Code>pages</Code> must be at least 1 - otherwise <strong>400</strong>.
                </li>
                <li>
                  <Code>GET /api/books/9</Code> for an unknown book answers with <strong>404</strong>{' '}
                  and a <Code>ProblemDetail</Code> whose <Code>detail</Code> is “Book 9 not found”.
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'A record has @NotBlank on the title, the controller parameter only @RequestBody. What happens with an empty title?',
            antworten: ['400 Bad Request', 'Nothing - the empty title is accepted', '500 Internal Server Error', 'The application does not start'],
            richtig: 1,
            erklaerung: 'Without @Valid nothing is checked. The annotations alone do nothing.',
          },
          {
            frage: 'A method throws a NullPointerException that nobody catches. Which status comes out?',
            antworten: ['400', '404', '500', '200 with an empty body'],
            richtig: 2,
            erklaerung: 'An unexpected exception is a server error: 500 Internal Server Error.',
          },
          {
            frage: 'What is @RestControllerAdvice good for?',
            antworten: ['It makes controllers faster', 'It collects @ExceptionHandler methods that apply to all controllers', 'It validates input', 'It replaces @RestController'],
            richtig: 1,
            erklaerung: 'One central place where exceptions from all controllers are turned into consistent answers.',
          },
        ]}
      />

      <Merke
        punkte={[
          'The backend checks all input itself - no matter what the frontend already checks.',
          <>
            Rules as annotations (<Code>@NotBlank</Code>, <Code>@Size</Code>, <Code>@Min</Code> …),
            activated by <Code>@Valid</Code> on the parameter. Violation → 400.
          </>,
          <>
            “Does not exist” → 404 with <Code>@ResponseStatus</Code> on the exception or{' '}
            <Code>ResponseStatusException</Code>. Anything unexpected → 500.
          </>,
          <>
            <Code>@RestControllerAdvice</Code> + <Code>@ExceptionHandler</Code> answer errors of all
            controllers in one place - ideally as a <Code>ProblemDetail</Code>.
          </>,
        ]}
      />
    </>
  )
}
