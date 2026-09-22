import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Start.code'

/**
 * CHAPTER 6.1 (English) - Hello Java
 */
export function Start() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          The shortest complete Java program. Hit ▶ Run - it runs right here in the browser, just
          like the JavaScript examples, but along a different path.
        </P>
        <TryIt modus="java" id="java-start-einstieg" {...beispiele['java-start-einstieg']} />
      </Abschnitt>

      <Abschnitt titel="Why a Java part in a React course?">
        <P>
          Because Java is the other half of the world. JavaScript and React build user interfaces in
          the browser; Java has been running for almost 30 years on servers, Android phones, cash
          machines and banking backends. Knowing both makes it much clearer <em>why</em> languages
          look so different.
        </P>
        <P>The two most important differences are already visible in the example above:</P>
        <Liste>
          <li>
            <strong>Everything lives inside a class.</strong> There is no code in Java that simply
            “lies around”.
          </li>
          <li>
            <strong>Nothing runs unchecked.</strong> Before a single line is executed, the compiler
            inspects the whole program. If something does not fit, it never even starts.
          </li>
        </Liste>
        <Hinweis variante="info">
          This part is <strong>self-contained</strong>: it requires none of parts 1 to 5 and uses
          nothing from them. Where it is worth it, there are comparisons - collected in{' '}
          <Verweis nr="7.10" />.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The skeleton, word by word">
        <CodeBlock code={codeBloecke.geruest} titel="Main.java" />
        <P>Every word on the second line has a job:</P>
        <Tabelle
          kopf={['Word', 'Meaning']}
          spalten={['align-top']}
          zeilen={[
            ['public', 'Callable from anywhere. Without public the JVM would not find the method.'],
            ['static', 'Belongs to the class itself - so no object has to be created to start.'],
            ['void', 'The method returns nothing. (“void” = empty)'],
            ['main', 'The fixed name the JVM looks for on startup.'],
            ['String[] args', 'The command line arguments, as an array of text.'],
          ].map(([word, meaning]) => [<Code key={word}>{word}</Code>, meaning])}
        />
        <P>For comparison - the same program in JavaScript needs exactly one line and no frame at all:</P>
        <CodeBlock code={codeBloecke.jsVergleich} titel="hello.js" />
        <Hinweis variante="tipp">
          The class is called <Code>Main</Code> here because our runtime looks there for{' '}
          <Code>main</Code> first. In a real project the file name must match the public class:{' '}
          <Code>Main.java</Code> for <Code>public class Main</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Printing: println, print and printf">
        <P>
          <Code>System.out.println(…)</Code> is Java’s <Code>console.log</Code>. The long name is no
          accident: <Code>System</Code> is a class, <Code>out</Code> is a field inside it (the output
          stream) and <Code>println</Code> is a method on that stream.
        </P>
        <TryIt modus="java" id="java-start-ausgabe" {...beispiele['java-start-ausgabe']} />
        <Hinweis variante="tipp">
          Editor tip: type <Code>sout</Code> and press Enter - the same shortcut as in IntelliJ IDEA.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Compile first, run second">
        <P>
          The browser reads JavaScript line by line and runs it straight away. Java takes a detour
          that explains everything else:
        </P>
        <Liste>
          <li>
            <strong>The compiler</strong> (<Code>javac</Code>) reads your source and checks all of
            it: does every variable exist? Do the types match? Is a <Code>return</Code> missing?
          </li>
          <li>
            If everything is fine, <strong>bytecode</strong> is produced (<Code>Main.class</Code>) -
            an intermediate language no human has to read.
          </li>
          <li>
            <strong>The JVM</strong> (Java Virtual Machine) runs that bytecode - on Windows, Mac,
            Linux or Android, all the same. Hence the old slogan “write once, run anywhere”.
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.werkzeuge} titel="On the command line" />
        <P>
          The important effect: a typo becomes a <strong>compile error</strong> and the program does
          not start at all. Try it - the semicolon on line 3 is missing:
        </P>
        <TryIt modus="java" id="java-start-fehler" {...beispiele['java-start-fehler']} />
        <Hinweis variante="warnung">
          That is exactly why you see red squiggles in the editor as soon as you pause typing: our
          runtime checks the code in the background - just like a Java IDE does.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Several classes in one file">
        <P>
          A Java program almost always consists of several classes. While learning they may live in
          the same file - only one of them may be <Code>public</Code>.
        </P>
        <TryIt modus="java" id="java-start-mehrere" {...beispiele['java-start-mehrere']} />
      </Abschnitt>

      <Abschnitt titel="The first differences to JavaScript">
        <Tabelle
          breit
          kopf={['Topic', 'Java', 'JavaScript']}
          spalten={[
            'align-top font-medium',
            'font-mono text-xs',
            'font-mono text-xs text-slate-500 dark:text-slate-400',
          ]}
          zeilen={[
            ['Entry point', 'public static void main(String[] args)', 'the first line of the file'],
            ['Wrapper', 'always a class', 'code can stand on its own'],
            ['Semicolon', 'required', 'mostly optional'],
            ['Types', 'written in the code: int, String …', 'decided at runtime'],
            ['Errors', 'many at compile time', 'only when running'],
            ['Printing', 'System.out.println(x)', 'console.log(x)'],
          ]}
        />
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="java"
          id="java-start-uebung"
          {...beispiele['java-start-uebung']}
          aufgabe={
            <>
              <p>
                Create two variables inside <Code>main</Code>: <Code>name</Code> holding the text{' '}
                <Code>"Ada"</Code> and <Code>year</Code> holding the number <Code>1815</Code>.
              </p>
              <p className="mt-1">
                Use them to print exactly one line: <Code>Ada was born in 1815.</Code>
              </p>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Where does a Java program start?',
            antworten: [
              'on the first line of the file',
              'in the main method',
              'in the class with the shortest name',
              'in the constructor',
            ],
            richtig: 1,
            erklaerung: 'The JVM looks for public static void main(String[] args) and starts there.',
          },
          {
            frage: 'What does javac do?',
            antworten: [
              'It runs the program.',
              'It checks the source and produces bytecode.',
              'It downloads libraries from the internet.',
              'It formats the code.',
            ],
            richtig: 1,
            erklaerung: 'javac is the compiler: check, then write .class files with bytecode. The JVM runs those.',
          },
          {
            frage: 'What happens if a semicolon is missing?',
            antworten: [
              'Java adds it automatically.',
              'Only that line is skipped.',
              'The program does not start at all.',
              'There is a runtime warning.',
            ],
            richtig: 2,
            erklaerung: 'A syntax error stops compilation - and without a .class file there is nothing to run.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Every Java program starts in <Code>public static void main(String[] args)</Code>.
          </>,
          'All code lives inside a class - there is no free-standing code like in JavaScript.',
          <>
            <Code>System.out.println(x)</Code> prints a line, <Code>print</Code> without a line
            break, <Code>printf</Code> formats.
          </>,
          'Compile first (javac → bytecode), then run (JVM). That is why Java finds many errors before anything runs.',
          'Every statement ends with a semicolon.',
        ]}
      />
    </>
  )
}
