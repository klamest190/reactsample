import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './SpringRest.code'

/**
 * CHAPTER 8.3 - REST APIs with controllers (English version)
 */
export function SpringRest() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          A complete API for todos: list, filter, create, replace, delete. After the start, seven
          requests run - each with the expected answer. Below you can carry on: create a third todo,
          delete the first one, ask for one that does not exist.
        </P>
        <TryIt modus="spring" id="spring-rest-crud" {...beispiele['spring-rest-crud']} />
      </Abschnitt>

      <Abschnitt titel="REST: resources and verbs">
        <P>
          REST is not a technology but a convention for building HTTP APIs. The core idea:{' '}
          <strong>the path names a thing</strong> (a <em>resource</em>, in the plural),{' '}
          <strong>the method says what happens to it.</strong>
        </P>
        <CodeBlock code={codeBloecke.rest} titel="todos.http" />
        <P>This is what it looks like when the idea is ignored:</P>
        <CodeBlock code={codeBloecke.schlecht} titel="please-dont.http" />
        <Hinweis variante="warnung">
          <Code>GET</Code> must never change anything. Browsers, proxies and search engines call GET
          links just like that, repeat them or cache the answer - a{' '}
          <Code>GET /deleteTodo?id=7</Code> will be triggered by accident sooner or later.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="One controller per resource">
        <Liste>
          <li>
            <Code>@RequestMapping("/api/todos")</Code> on the class applies to all methods - they only
            add the rest: <Code>{'@GetMapping("/{id}")'}</Code>.
          </li>
          <li>
            <Code>@RequestBody TodoRequest request</Code> reads the JSON body and builds an object
            from it. Missing fields stay empty (<Code>null</Code>, <Code>0</Code>,{' '}
            <Code>false</Code>); unknown fields are ignored.
          </li>
          <li>
            <Code>@RequestParam(required = false) Boolean done</Code>: without the parameter,{' '}
            <Code>done</Code> is simply <Code>null</Code> - that is why it is <Code>Boolean</Code>{' '}
            instead of <Code>boolean</Code>.
          </li>
        </Liste>
        <P>
          The example uses two records: <Code>Todo</Code> for what the API hands out, and{' '}
          <Code>TodoRequest</Code> for what a client may send. Such pure transport classes are called{' '}
          <strong>DTOs</strong> (data transfer objects). This way a client cannot send an{' '}
          <Code>id</Code> - the server assigns it.
        </P>
      </Abschnitt>

      <Abschnitt titel="Status codes with ResponseEntity">
        <P>
          If a method simply returns an object, Spring answers with <strong>200</strong>. For
          everything else there is <Code>ResponseEntity</Code> - status, headers and body in one:
        </P>
        <CodeBlock code={codeBloecke.responseEntity} titel="ResponseEntity.java" />
        <P>
          If the status is fixed, an annotation on the method is shorter:{' '}
          <Code>@ResponseStatus(HttpStatus.CREATED)</Code>. The exercise below uses both.
        </P>
        <Hinweis variante="tipp">
          After a POST, <strong>201 Created</strong> comes with the <Code>Location</Code> header
          holding the address of the new entry. You can see it below the body of the first answer.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="How objects become JSON">
        <P>
          The conversion is done by the library <strong>Jackson</strong>. It reads objects through
          their <strong>getters</strong>, not their fields:
        </P>
        <CodeBlock code={codeBloecke.getter} titel="getter → JSON" />
        <P>
          That is handy - a password field without a getter stays on the server. But a class without
          any getter cannot be written by Jackson at all, which gives a <strong>500</strong>. The
          third and fourth requests show: a <Code>Map</Code> is enough for any JSON, and Spring
          answers broken JSON with <strong>400</strong>.
        </P>
        <TryIt modus="spring" id="spring-rest-json" {...beispiele['spring-rest-json']} />
        <Hinweis variante="info">
          That is why records are so popular for APIs (<Verweis nr="7.7" />): they automatically have
          “getters” for all components, they are immutable - and you can see at a glance which
          fields end up in the JSON.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="spring"
          id="spring-rest-uebung"
          {...beispiele['spring-rest-uebung']}
          aufgabe={
            <>
              <p>The book API can list and create. Add:</p>
              <Liste>
                <li>
                  <Code>PUT /api/books/{'{id}'}</Code> replaces title and author - <strong>200</strong>{' '}
                  with the new book, <strong>404</strong> if the id does not exist
                </li>
                <li>
                  <Code>DELETE /api/books/{'{id}'}</Code> deletes - <strong>204</strong> without a
                  body, <strong>404</strong> if the id does not exist
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Which endpoint follows the REST conventions for deleting todo 7?',
            antworten: ['GET /api/todos/7/delete', 'POST /api/deleteTodo?id=7', 'DELETE /api/todos/7', 'DELETE /api/todo?delete=7'],
            richtig: 2,
            erklaerung: 'The path names the resource (/api/todos/7), the method the action (DELETE).',
          },
          {
            frage: 'Which status fits a successful POST that created something?',
            antworten: ['200 OK', '201 Created', '204 No Content', '302 Found'],
            richtig: 1,
            erklaerung: '201 Created - plus the Location header with the address of the new entry.',
          },
          {
            frage: 'A class has a private field “password” without a getter. What happens to it in the JSON?',
            antworten: ['It appears with its value', 'It appears as null', 'It is missing', 'Spring answers with 500'],
            richtig: 2,
            erklaerung: 'Jackson reads through getters. Without a getter the field stays invisible - as long as there are other getters.',
          },
        ]}
      />

      <Merke
        punkte={[
          'REST: the path names the resource (plural), the method the action. GET never changes anything.',
          <>
            <Code>@RequestMapping</Code> on the class for the shared path, <Code>@GetMapping</Code>,{' '}
            <Code>@PostMapping</Code>, <Code>@PutMapping</Code>, <Code>@DeleteMapping</Code> on the methods.
          </>,
          <>
            <Code>@RequestBody</Code> turns JSON into an object - ideally a record as a DTO.
          </>,
          <>
            <Code>ResponseEntity</Code> decides status, headers and body: 201 + Location, 204, 404 …
          </>,
          'What has a getter ends up in the JSON (for records: every component).',
        ]}
      />
    </>
  )
}
