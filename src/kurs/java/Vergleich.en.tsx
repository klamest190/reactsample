import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Vergleich.code'

/**
 * CHAPTER 6.10 (English) - Java, JavaScript & React compared
 */
export function Vergleich() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          The same task, two languages: sum and average of a series of numbers. Both editors run on
          this very page - watch the badge in the top right corner.
        </P>
        <TryIt modus="java" titel="Java" id="java-vergleich-java" {...beispiele['java-vergleich-java']} />
        <TryIt titel="JavaScript" id="java-vergleich-js" {...beispiele['java-vergleich-js']} />
        <P>
          Two things stand out: Java needs noticeably more scaffolding - and the cast{' '}
          <Code>(double)</Code> is mandatory, because <Code>int / int</Code> would cut off otherwise
          (<Verweis nr="7.2" />).
        </P>
      </Abschnitt>

      <Abschnitt titel="The differences on one page">
        <Tabelle
          breit
          kopf={['Topic', 'Java', 'JavaScript']}
          spalten={['align-top font-medium', undefined, 'text-slate-600 dark:text-slate-400']}
          zeilen={[
            ['Types', 'in the code, checked by the compiler', 'only at runtime'],
            ['Errors', 'many before the start', 'while running'],
            ['Entry point', 'main inside a class', 'the first line of the file'],
            ['Functions', 'methods inside classes', 'anywhere, also as values'],
            ['Objects', 'built from a class', 'built freely at any time'],
            ['Inheritance', 'extends, abstract, interface', 'prototypes - rarely used'],
            ['Lists', 'array (fixed) / ArrayList', 'array (grows)'],
            ['“empty”', 'only null', 'null and undefined'],
            ['Equality', '== identity, equals content', '=== value or identity'],
            ['Conditions', 'boolean only', 'everything is truthy/falsy'],
            ['Concurrency', 'real threads', 'one thread + event loop'],
            ['Runs', 'anywhere there is a JVM', 'in the browser and in Node'],
          ]}
        />
        <Hinweis variante="info">
          TypeScript (<Verweis nr="5.8" />) sits exactly in between: types like Java, runtime like
          JavaScript. During the build the types are removed again - but they are checked before.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The same logic three times">
        <P>
          A task list, filtered by “open”. First Java, then JavaScript, then React - and in the third
          case it becomes a user interface you can click.
        </P>
        <TryIt modus="java" titel="Java" id="java-vergleich-liste-java" {...beispiele['java-vergleich-liste-java']} />
        <TryIt titel="JavaScript" id="java-vergleich-liste-js" {...beispiele['java-vergleich-liste-js']} />
        <TryIt modus="react" titel="React" id="java-vergleich-liste-react" {...beispiele['java-vergleich-liste-react']} />
        <P>
          The chain <Code>stream().filter(…).toList()</Code> and{' '}
          <Code>{'tasks.filter(t => !t.done)'}</Code> say the same thing. React only adds one thing:
          the filtered list automatically becomes what you see - when state changes, React redraws (
          <Verweis nr="3.3" />).
        </P>
        <Hinweis variante="tipp">
          That is exactly why this course starts with JavaScript: React is not a language of its own
          but a library. Java, in contrast, is a world of its own - with its own compiler, runtime
          and tooling.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Where is what in this project?">
        <P>
          The app itself is 100 % React and TypeScript. Java only appears in two places here - and
          both are cleanly separated from the rest:
        </P>
        <CodeBlock code={codeBloecke.struktur} titel="Project structure" />
        <Liste>
          <li>
            <strong>
              ☕ <Code>src/java/</Code>
            </strong>{' '}
            - the Java runtime. Pure TypeScript, no React, no DOM. It only knows text in and output
            out.
          </li>
          <li>
            <strong>
              ☕ <Code>src/kurs/java/</Code>
            </strong>{' '}
            - the chapters of this part. The Java code lives in the <Code>.code.ts</Code> files, the
            explaining text around it is React.
          </li>
          <li>
            <strong>
              🟨 <Code>src/kurs/js/</Code>
            </strong>{' '}
            and <Code>src/lernen/jsSandbox.ts</Code> - everything related to JavaScript.
          </li>
          <li>
            <strong>⚛️ all the rest</strong> - components, hooks, pages: React.
          </li>
        </Liste>
        <P>Each of the three languages takes its own path when running:</P>
        <CodeBlock code={codeBloecke.wege} />
      </Abschnitt>

      <Abschnitt titel="How the Java runtime here works">
        <P>
          There is no JVM in the browser. What your Java code goes through here are four steps - the
          same four that <Code>javac</Code> and the JVM take:
        </P>
        <Liste>
          <li>
            <strong>1. Lexer</strong> (<Code>lexer.ts</Code>) - splits the text into tokens:{' '}
            <Code>int</Code>, <Code>x</Code>, <Code>=</Code>, <Code>5</Code>, <Code>;</Code>
          </li>
          <li>
            <strong>2. Parser</strong> (<Code>parser.ts</Code>) - builds a syntax tree from them.
            This is where a missing semicolon shows up.
          </li>
          <li>
            <strong>3. Checker</strong> (<Code>pruefer.ts</Code>) - walks the tree looking for type
            errors, unknown names, missing <Code>return</Code>. This is the job of <Code>javac</Code>
            . It also runs while you type - hence the red squiggles.
          </li>
          <li>
            <strong>4. Interpreter</strong> (<Code>interpreter.ts</Code>) - executes the tree. That
            is the role of the JVM. It knows the difference between <Code>int</Code> and{' '}
            <Code>double</Code>, lets <Code>int</Code> overflow and throws real exceptions.
          </li>
        </Liste>
        <TryIt modus="java" id="java-vergleich-laufzeit" {...beispiele['java-vergleich-laufzeit']} />
        <Hinweis variante="warnung">
          The runtime covers the fundamentals, not all of Java. Missing are threads, file access,{' '}
          <Code>Scanner</Code> (there is no keyboard input), packages across several files and
          anonymous classes. For everything in this part it behaves like a real JVM though - verified
          by <Code>npm run test:java</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="If you want to write Java outside this course">
        <P>
          You need a <strong>JDK</strong> (e.g. Temurin or Oracle JDK) and an IDE - IntelliJ IDEA
          Community or VS Code with the Java pack. Larger projects manage dependencies with Maven or
          Gradle:
        </P>
        <CodeBlock code={codeBloecke.echtesProjekt} />
        <P>
          The path there is the same as in <Verweis nr="5.11" /> for React: out of the browser
          editor, into a real project.
        </P>
      </Abschnitt>

      <Abschnitt titel="What do you use each for?">
        <Liste>
          <li>
            <strong>Java</strong> - server backends, Android, large and long-lived systems, anywhere
            many people work on the same code for years. The strictness pays off with size.
          </li>
          <li>
            <strong>JavaScript/TypeScript + React</strong> - everything in the browser, plus Node
            servers and mobile apps. Quick to start, very flexible.
          </li>
          <li>
            <strong>Both together</strong> is the normal case in companies: a Java backend serving
            JSON and a React frontend displaying it (<Verweis nr="5.2" />).
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          modus="java"
          id="java-vergleich-uebung"
          {...beispiele['java-vergleich-uebung']}
          aufgabe={
            <>
              <p>
                Translate two JavaScript one-liners into Java. The originals are in the comment
                inside the editor:
              </p>
              <Liste>
                <li>
                  <Code>average(int[] numbers)</Code> - the average as a <Code>double</Code>, 0 for
                  an empty array
                </li>
                <li>
                  <Code>countAbove(int[] numbers, int limit)</Code> - how many values are{' '}
                  <em>greater</em> than <Code>limit</Code>
                </li>
              </Liste>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'What is true about Java and JavaScript?',
            antworten: [
              'JavaScript is a simplified version of Java.',
              'They are independent languages - the similar name was marketing.',
              'Java runs in the browser, JavaScript on the server.',
              'Both are executed by the same runtime.',
            ],
            richtig: 1,
            erklaerung: 'JavaScript got its name in 1995 for marketing reasons, because Java was popular then. The languages are not related.',
          },
          {
            frage: 'Which folder in this project contains Java logic exclusively?',
            antworten: ['src/lernen/', 'src/java/', 'src/kurs/', 'src/components/'],
            richtig: 1,
            erklaerung: 'src/java/ is the Java runtime: lexer, parser, checker, interpreter - pure TypeScript without React.',
          },
          {
            frage: 'Where would you build a user interface with click state?',
            antworten: [
              'in Java, because it is type-safe',
              'in React, because the display follows from the state automatically',
              'both are equivalent',
              'in plain JavaScript without a library',
            ],
            richtig: 1,
            erklaerung: 'That is exactly what React is for: you describe the result, React takes care of the DOM changes.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Java and JavaScript are two independent languages - types and the moment errors appear are the main difference.',
          <>
            In this project Java lives exclusively in <Code>src/java/</Code> (runtime) and{' '}
            <Code>src/kurs/java/</Code> (chapters).
          </>,
          'The runtime does what javac + JVM do: lexer → parser → checker → interpreter.',
          'The same logic can be written in both languages - React only adds that the view follows the state.',
          'In practice you meet both: Java in the backend, React in the frontend.',
        ]}
      />
    </>
  )
}
