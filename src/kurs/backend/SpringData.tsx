import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { SpringLayers } from '../demos/BackendDiagrams'
import { beispiele, codeBloecke } from './SpringData.code'

/**
 * CHAPTER 8.5 - Databases with Spring Data JPA
 * Entities, repositories without an implementation, derived queries and the three layers.
 */
export function SpringData() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Bisher lagen die Daten in einer <Code>Map</Code> - nach jedem Neustart waren sie weg. Jetzt
          kommt eine Datenbank dazu. Das Erstaunliche: Für das Repository gibt es{' '}
          <strong>keine einzige Zeile Implementierung</strong>. In der Konsole siehst du, welches SQL
          dabei entsteht.
        </P>
        <TryIt modus="spring" id="spring-daten-einstieg" {...beispiele['spring-daten-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Objekte und Tabellen">
        <P>
          Relationale Datenbanken (PostgreSQL, MySQL, H2 …) speichern Tabellen mit Zeilen und
          Spalten, Java arbeitet mit Objekten. Die Übersetzung dazwischen heißt{' '}
          <strong>ORM</strong> (Object-Relational Mapping). In Java ist der Standard dafür{' '}
          <strong>JPA</strong>, umgesetzt von <strong>Hibernate</strong>:
        </P>
        <CodeBlock code={codeBloecke.tabelle} titel="Entity ↔ Tabelle" sprache="konfig" />
        <Liste>
          <li>
            <Code>@Entity</Code>: Diese Klasse ist eine Tabelle.
          </li>
          <li>
            <Code>@Id</Code>: das Feld mit dem Primärschlüssel. <Code>@GeneratedValue</Code>: die
            Datenbank vergibt ihn beim Speichern.
          </li>
          <li>
            Ein Konstruktor ohne Parameter (darf <Code>protected</Code> sein): Hibernate braucht ihn,
            um Objekte aus Zeilen zu bauen.
          </li>
        </Liste>
        <Hinweis variante="info">
          Entities sind normale Klassen mit Gettern und Settern, keine Records - JPA muss sie
          nachträglich befüllen und verändern können.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Repositories: Interface genügt">
        <P>
          <Code>{'interface TodoRepository extends JpaRepository<Todo, Long> {}'}</Code> - mehr steht
          da nicht. Beim Start erzeugt Spring Data eine Klasse, die das Interface implementiert, und
          macht sie zur Bean. Die Typparameter sagen: Entity <Code>Todo</Code>, id vom Typ{' '}
          <Code>Long</Code>. Geerbt sind unter anderem:
        </P>
        <CodeBlock code={codeBloecke.methoden} titel="JpaRepository" />
        <Hinweis variante="tipp">
          <Code>findById</Code> liefert ein <Code>Optional</Code> - „vielleicht ein Todo“. Mit{' '}
          <Code>ResponseEntity.of(optional)</Code> wird daraus direkt 200 oder 404, mit{' '}
          <Code>orElseThrow(() -&gt; new …)</Code> eine Exception (<Verweis nr="8.4" />).
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Abfragen aus Methodennamen">
        <P>
          Für eigene Abfragen schreibst du nur die Methode ins Interface - Spring Data liest den{' '}
          <strong>Namen</strong> und baut die SQL-Abfrage daraus:
        </P>
        <CodeBlock code={codeBloecke.namen} titel="Methodenname → SQL" />
        <TryIt modus="spring" id="spring-daten-abfragen" {...beispiele['spring-daten-abfragen']} />
        <Hinweis variante="warnung">
          Die Namen werden schon beim <strong>Start</strong> geprüft. Schreib testweise{' '}
          <Code>findByTitel</Code> statt <Code>findByTitle</Code>: Die Anwendung startet nicht, weil
          die Entity kein Feld <Code>titel</Code> hat. Lästig - aber viel besser als ein Fehler, der
          erst beim ersten Aufruf auffällt.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Controller, Service, Repository">
        <P>
          Sobald es mehr als „speichern und laden“ gibt, bekommt jede Aufgabe ihre eigene Schicht:
        </P>
        <SpringLayers />
        <P>
          Im Beispiel kümmert sich der <Code>TodoService</Code> um die Regeln (Titel trimmen,
          umschalten, 404 wenn es das ToDo nicht gibt). Der Controller übersetzt nur zwischen HTTP
          und Java.
        </P>
        <TryIt modus="spring" id="spring-daten-schichten" {...beispiele['spring-daten-schichten']} />
        <P>
          Die zweite und dritte Anfrage zeigen eine wichtige Falle:{' '}
          <Code>toggleWithoutSave</Code> ändert das Objekt, antwortet sogar mit{' '}
          <Code>"done": true</Code> - aber in der Datenbank ändert sich nichts. Erst{' '}
          <Code>save()</Code> schreibt die Änderung (siehe das <Code>update</Code> im SQL-Log).
        </P>
        <Hinweis variante="info">
          Echtes JPA speichert Änderungen innerhalb einer Methode mit <Code>@Transactional</Code>{' '}
          auch ohne <Code>save()</Code> automatisch („Dirty Checking“). Die Kurs-Laufzeit kennt das
          nicht - <Code>save()</Code> aufzurufen ist aber in beiden Fällen richtig und macht die
          Absicht sichtbar.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Und die echte Datenbank?">
        <P>
          Hier liegen die „Tabellen“ im Speicher des Browsers - so wie bei der Datenbank H2, die man
          zum Entwickeln gern benutzt. Im echten Projekt kommen zwei Abhängigkeiten dazu, und die
          Verbindung steht in der Konfiguration:
        </P>
        <CodeBlock code={codeBloecke.pom} titel="pom.xml" />
        <CodeBlock code={codeBloecke.postgres} titel="application.properties" />
        <P>
          Eine PostgreSQL-Datenbank startest du am einfachsten mit Docker - das kommt in{' '}
          <Verweis nr="8.8" /> und <Verweis nr="8.10" />.
        </P>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          modus="spring"
          id="spring-daten-uebung"
          {...beispiele['spring-daten-uebung']}
          aufgabe={
            <>
              <p>Ergänze die Bücher-API um zwei Abfragen - ohne eine einzige Schleife:</p>
              <Liste>
                <li>
                  <Code>GET /api/books/unread</Code>: alle Bücher, die noch nicht gelesen sind
                </li>
                <li>
                  <Code>GET /api/books/by?author=jane austen</Code>: alle Bücher des Autors - Groß- und
                  Kleinschreibung egal
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Wer implementiert interface TodoRepository extends JpaRepository<Todo, Long>?',
            antworten: ['Du, in einer Klasse TodoRepositoryImpl', 'Spring Data, beim Start', 'Die Datenbank', 'Niemand - man kann es nicht aufrufen'],
            richtig: 1,
            erklaerung: 'Spring Data erzeugt beim Start eine Implementierung und registriert sie als Bean.',
          },
          {
            frage: 'Was liefert findByDoneFalse()?',
            antworten: ['Alle ToDos', 'Alle erledigten ToDos', 'Alle offenen ToDos', 'false'],
            richtig: 2,
            erklaerung: 'Der Name wird zu „where done = false“ - also alle offenen.',
          },
          {
            frage: 'todo = repository.findById(1L).orElseThrow(); todo.setDone(true); - ohne save(). Was steht danach in der Datenbank (in dieser Laufzeit)?',
            antworten: ['done = true', 'done = false, die Änderung ist nicht gespeichert', 'Das ToDo ist gelöscht', 'Es gibt eine Exception'],
            richtig: 1,
            erklaerung: 'findById liefert ein geladenes Objekt; ohne save() wird die Änderung nicht geschrieben.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            <Code>@Entity</Code>-Klassen werden Tabellen, <Code>@Id @GeneratedValue</Code> ist der
            Primärschlüssel.
          </>,
          <>
            <Code>{'extends JpaRepository<Entity, Id>'}</Code> reicht für findAll, findById, save,
            deleteById - Spring Data implementiert es.
          </>,
          'Eigene Abfragen entstehen aus Methodennamen: findByDoneFalse, countByDone, …OrderByTitleAsc. Falsche Namen stoppen den Start.',
          'Controller (HTTP) → Service (Regeln) → Repository (Daten). Geänderte Entities mit save() speichern.',
        ]}
      />
    </>
  )
}
