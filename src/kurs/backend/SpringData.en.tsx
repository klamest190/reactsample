import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { SpringLayers } from '../demos/BackendDiagrams'
import { beispiele, codeBloecke } from './SpringData.code'

/**
 * CHAPTER 8.5 - Databases with Spring Data JPA (English version)
 */
export function SpringData() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          So far the data lived in a <Code>Map</Code> - after every restart it was gone. Now a
          database joins in. The amazing part: there is <strong>not a single line of
          implementation</strong> for the repository. The console shows which SQL is produced.
        </P>
        <TryIt modus="spring" id="spring-daten-einstieg" {...beispiele['spring-daten-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Objects and tables">
        <P>
          Relational databases (PostgreSQL, MySQL, H2 …) store tables with rows and columns, Java
          works with objects. The translation between them is called <strong>ORM</strong>{' '}
          (object-relational mapping). In Java the standard for it is <strong>JPA</strong>,
          implemented by <strong>Hibernate</strong>:
        </P>
        <CodeBlock code={codeBloecke.tabelle} titel="entity ↔ table" sprache="konfig" />
        <Liste>
          <li>
            <Code>@Entity</Code>: this class is a table.
          </li>
          <li>
            <Code>@Id</Code>: the field with the primary key. <Code>@GeneratedValue</Code>: the
            database assigns it when saving.
          </li>
          <li>
            A constructor without parameters (may be <Code>protected</Code>): Hibernate needs it to
            build objects from rows.
          </li>
        </Liste>
        <Hinweis variante="info">
          Entities are normal classes with getters and setters, not records - JPA has to be able to
          fill and change them afterwards.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Repositories: an interface is enough">
        <P>
          <Code>{'interface TodoRepository extends JpaRepository<Todo, Long> {}'}</Code> - that is
          all. At startup Spring Data generates a class that implements the interface and turns it
          into a bean. The type parameters say: entity <Code>Todo</Code>, id of type{' '}
          <Code>Long</Code>. Inherited methods include:
        </P>
        <CodeBlock code={codeBloecke.methoden} titel="JpaRepository" />
        <Hinweis variante="tipp">
          <Code>findById</Code> returns an <Code>Optional</Code> - “maybe a todo”. With{' '}
          <Code>ResponseEntity.of(optional)</Code> it becomes 200 or 404 right away, with{' '}
          <Code>orElseThrow(() -&gt; new …)</Code> an exception (<Verweis nr="8.4" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Queries from method names">
        <P>
          For your own queries you only write the method into the interface - Spring Data reads the{' '}
          <strong>name</strong> and builds the SQL query from it:
        </P>
        <CodeBlock code={codeBloecke.namen} titel="method name → SQL" />
        <TryIt modus="spring" id="spring-daten-abfragen" {...beispiele['spring-daten-abfragen']} />
        <Hinweis variante="warnung">
          The names are checked at <strong>startup</strong> already. Try writing{' '}
          <Code>findByTitel</Code> instead of <Code>findByTitle</Code>: the application does not
          start, because the entity has no field <Code>titel</Code>. Annoying - but much better than
          an error that only shows up on the first call.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Controller, service, repository">
        <P>As soon as there is more than “save and load”, every task gets its own layer:</P>
        <SpringLayers />
        <P>
          In the example the <Code>TodoService</Code> takes care of the rules (trim the title, toggle,
          404 if the todo does not exist). The controller only translates between HTTP and Java.
        </P>
        <TryIt modus="spring" id="spring-daten-schichten" {...beispiele['spring-daten-schichten']} />
        <P>
          The second and third requests show an important trap: <Code>toggleWithoutSave</Code>{' '}
          changes the object and even answers with <Code>"done": true</Code> - but nothing changes in
          the database. Only <Code>save()</Code> writes the change (see the <Code>update</Code> in the
          SQL log).
        </P>
        <Hinweis variante="info">
          Real JPA also saves changes automatically inside a method with <Code>@Transactional</Code>,
          even without <Code>save()</Code> (“dirty checking”). The course runtime does not know that
          - but calling <Code>save()</Code> is correct in both cases and makes the intent visible.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="And the real database?">
        <P>
          Here the “tables” live in the browser’s memory - like the H2 database that is often used
          for development. In a real project two dependencies are added, and the connection goes into
          the configuration:
        </P>
        <CodeBlock code={codeBloecke.pom} titel="pom.xml" />
        <CodeBlock code={codeBloecke.postgres} titel="application.properties" />
        <P>
          The easiest way to start a PostgreSQL database is Docker - that comes in{' '}
          <Verweis nr="8.8" /> and <Verweis nr="8.10" />.
        </P>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="spring"
          id="spring-daten-uebung"
          {...beispiele['spring-daten-uebung']}
          aufgabe={
            <>
              <p>Add two queries to the book API - without a single loop:</p>
              <Liste>
                <li>
                  <Code>GET /api/books/unread</Code>: all books that have not been read yet
                </li>
                <li>
                  <Code>GET /api/books/by?author=jane austen</Code>: all books of the author - upper
                  and lower case do not matter
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Who implements interface TodoRepository extends JpaRepository<Todo, Long>?',
            antworten: ['You, in a class TodoRepositoryImpl', 'Spring Data, at startup', 'The database', 'Nobody - it cannot be called'],
            richtig: 1,
            erklaerung: 'Spring Data generates an implementation at startup and registers it as a bean.',
          },
          {
            frage: 'What does findByDoneFalse() return?',
            antworten: ['All todos', 'All done todos', 'All open todos', 'false'],
            richtig: 2,
            erklaerung: 'The name becomes “where done = false” - so all open ones.',
          },
          {
            frage: 'todo = repository.findById(1L).orElseThrow(); todo.setDone(true); - without save(). What is in the database afterwards (in this runtime)?',
            antworten: ['done = true', 'done = false, the change is not saved', 'The todo is deleted', 'There is an exception'],
            richtig: 1,
            erklaerung: 'findById returns a loaded object; without save() the change is not written.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>@Entity</Code> classes become tables, <Code>@Id @GeneratedValue</Code> is the
            primary key.
          </>,
          <>
            <Code>{'extends JpaRepository<Entity, Id>'}</Code> is enough for findAll, findById, save,
            deleteById - Spring Data implements it.
          </>,
          'Your own queries come from method names: findByDoneFalse, countByDone, …OrderByTitleAsc. Wrong names stop the start.',
          'Controller (HTTP) → service (rules) → repository (data). Save changed entities with save().',
        ]}
      />
    </>
  )
}
