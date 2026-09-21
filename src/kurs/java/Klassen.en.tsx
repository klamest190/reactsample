import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Klassen.code'

/**
 * CHAPTER 6.6 (English) - Classes & Objects
 */
export function Klassen() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          So far the class was only a frame around <Code>main</Code>. Now it becomes what it is meant
          to be: a <strong>blueprint</strong> for objects that keep data and behaviour together.
        </P>
        <TryIt modus="java" id="java-klassen-einstieg" {...beispiele['java-klassen-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Blueprint and object">
        <CodeBlock code={codeBloecke.bauplan} />
        <P>
          The class describes <em>what</em> an object has and can do. Every <Code>new</Code> creates
          one object from it, with its own values. The methods, however, exist only once - when
          called they are told through <Code>this</Code> which object they are working on.
        </P>
        <CodeBlock code={codeBloecke.jsVergleich} />
      </Abschnitt>

      <Abschnitt titel="Fields: state with a default value">
        <P>
          Fields are variables that belong to the object. Unlike local variables they automatically
          get a default value - <Code>0</Code>, <Code>false</Code> or <Code>null</Code>.
        </P>
        <TryIt modus="java" id="java-klassen-felder" {...beispiele['java-klassen-felder']} />
        <P>
          A <Code>static</Code> field, in contrast, belongs to the class and exists exactly once - no
          matter how many objects there are. Handy for counters and constants.
        </P>
      </Abschnitt>

      <Abschnitt titel="The constructor">
        <P>
          The constructor is named like the class, has <strong>no</strong> return type and runs
          exactly once: on <Code>new</Code>. Its job is to bring the object into a valid state.
        </P>
        <TryIt modus="java" id="java-klassen-konstruktor" {...beispiele['java-klassen-konstruktor']} />
        <Hinweis variante="info">
          <Code>this.title = title;</Code> is not decoration: on the left is the field, on the right
          the parameter. Without <Code>this</Code> the parameter would be assigned to itself - a bug
          the compiler cannot see. With <Code>this(…)</Code> one constructor can also call another
          instead of repeating code.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Encapsulation: private, getters and setters">
        <P>
          The basic principle of object-oriented programming: an object guards its own data and only
          allows controlled ways in.
        </P>
        <CodeBlock code={codeBloecke.konvention} />
        <Liste>
          <li>
            <Code>private</Code> - visible only inside this class. The normal case for fields.
          </li>
          <li>
            <Code>public</Code> - from anywhere. The normal case for methods others should use.
          </li>
          <li>
            <Code>protected</Code> - additionally for subclasses (<Verweis nr="6.7" />).
          </li>
          <li>nothing written - visible within the same package. Fine while learning.</li>
        </Liste>
        <TryIt modus="java" id="java-klassen-kapselung" {...beispiele['java-klassen-kapselung']} />
        <Hinweis variante="tipp">
          A setter is not an end in itself. Often a method with a meaningful name is better:{' '}
          <Code>deposit(100)</Code> says more than <Code>setBalance(getBalance() + 100)</Code> - and
          it can check whether the amount is allowed at all.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="toString and equals">
        <P>
          Every class inherits a few methods from <Code>Object</Code> - among them{' '}
          <Code>toString()</Code> and <Code>equals()</Code>. The default versions are not very
          helpful (<Code>Point@1b6d2f1d</Code> and “is it the same object?”), so you override them.
        </P>
        <TryIt modus="java" id="java-klassen-tostring" {...beispiele['java-klassen-tostring']} />
        <Hinweis variante="info">
          <Code>@Override</Code> is an annotation. It changes nothing about the program but lets the
          compiler verify that you really are overriding an inherited method - a typo in the name
          shows up immediately.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="References and null">
        <P>
          A variable of a class type never contains the object itself, only a reference to it. So two
          variables can point at the same object - or at none at all.
        </P>
        <TryIt modus="java" id="java-klassen-referenzen" {...beispiele['java-klassen-referenzen']} />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="java"
          id="java-klassen-uebung"
          {...beispiele['java-klassen-uebung']}
          aufgabe={
            <>
              <p>
                Write the class <Code>Task</Code> for a todo item:
              </p>
              <Liste>
                <li>
                  private fields <Code>title</Code> (<Code>String</Code>) and <Code>done</Code> (
                  <Code>boolean</Code>)
                </li>
                <li>
                  a constructor <Code>Task(String title)</Code> - new tasks are not done
                </li>
                <li>
                  <Code>getTitle()</Code> and <Code>isDone()</Code>
                </li>
                <li>
                  <Code>toggle()</Code> - switches between done and open
                </li>
                <li>
                  <Code>toString()</Code> - returns <Code>"[x] title"</Code> or{' '}
                  <Code>"[ ] title"</Code>
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What is special about the constructor?',
            antworten: [
              'It always returns the object.',
              'It is named like the class and has no return type.',
              'It is always static.',
              'There may only be one per class.',
            ],
            richtig: 1,
            erklaerung: 'No return type, not even void. And there may be any number, as long as the parameters differ.',
          },
          {
            frage: 'What is private good for on a field?',
            antworten: [
              'It makes the field immutable.',
              'Only the class itself can reach it - changes go through methods that can check.',
              'It saves memory.',
              'The field exists only once.',
            ],
            richtig: 1,
            erklaerung: 'Immutable is what final does. private controls visibility - that is encapsulation.',
          },
          {
            frage: 'What does this.name = name do in a constructor?',
            antworten: [
              'It copies the object.',
              'It assigns the value of the same-named parameter to the field.',
              'It creates a new field.',
              'It is only style, you can leave it out.',
            ],
            richtig: 1,
            erklaerung: 'Without this, name would be the parameter - on both sides. The field would stay empty.',
          },
        ]}
      />

      <Merke
        punkte={[
          'The class is the blueprint, every new creates an object with its own field values.',
          <>
            The constructor is named like the class, has no return type and makes the object valid.{' '}
            <Code>this.x = x</Code> tells field and parameter apart.
          </>,
          <>
            Fields <Code>private</Code>, access through methods - that is encapsulation.
          </>,
          <>
            Override <Code>toString()</Code> and <Code>equals()</Code>, otherwise you only see
            addresses and compare identities.
          </>,
          'Variables hold references to objects - or null.',
        ]}
      />
    </>
  )
}
