import { java, js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für Kapitel 7.10 - Java, JavaScript & React im Vergleich.
 *
 * Als einziges Kapitel des Java-Teils mischt dieses hier absichtlich alle drei
 * Sprachen: Jedes Beispiel steht einmal in Java, einmal in JavaScript und
 * einmal als React-Komponente. Welcher Editor welche Sprache ausführt, steht
 * im `modus` des jeweiligen <TryIt> in Vergleich.tsx.
 */

export const beispiele = {
  // --- dieselbe Aufgabe, zwei Sprachen --------------------------------------
  'java-vergleich-java': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          int[] numbers = {4, 8, 15, 16, 23, 42};

          int sum = 0;
          for (int number : numbers) {
            sum += number;
          }

          double average = (double) sum / numbers.length;
          System.out.println("Sum: " + sum);
          System.out.println("Average: " + average);
        }
      }
    `,
  },
  'java-vergleich-js': {
    code: js`
      const numbers = [4, 8, 15, 16, 23, 42]

      const sum = numbers.reduce((total, number) => total + number, 0)
      const average = sum / numbers.length

      console.log('Sum: ' + sum)
      console.log('Average: ' + average)
    `,
  },

  // --- dieselbe Logik dreimal ----------------------------------------------
  'java-vergleich-liste-java': {
    code: java`
      public class Main {
        record Task(String title, boolean done) {}

        public static void main(String[] args) {
          List<Task> tasks = List.of(
            new Task("Learn Java", true),
            new Task("Write a class", false),
            new Task("Understand streams", false)
          );

          List<Task> open = tasks.stream()
              .filter(task -> !task.done())
              .toList();

          for (Task task : open) {
            System.out.println("[ ] " + task.title());
          }
          System.out.println(open.size() + " of " + tasks.size() + " open");
        }
      }
    `,
  },
  'java-vergleich-liste-js': {
    code: js`
      const tasks = [
        { title: 'Learn Java', done: true },
        { title: 'Write a class', done: false },
        { title: 'Understand streams', done: false },
      ]

      const open = tasks.filter((task) => !task.done)

      for (const task of open) {
        console.log('[ ] ' + task.title)
      }
      console.log(\`\${open.length} of \${tasks.length} open\`)
    `,
  },
  'java-vergleich-liste-react': {
    code: js`
      const START = [
        { id: 1, title: 'Learn Java', done: true },
        { id: 2, title: 'Write a class', done: false },
        { id: 3, title: 'Understand streams', done: false },
      ]

      function App() {
        const [tasks, setTasks] = useState(START)
        const open = tasks.filter((task) => !task.done)

        function toggle(id) {
          setTasks(tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)))
        }

        return (
          <div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tasks.map((task) => (
                <li key={task.id}>
                  <label>
                    <input type="checkbox" checked={task.done} onChange={() => toggle(task.id)} />{' '}
                    <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                      {task.title}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p>
              {open.length} of {tasks.length} open
            </p>
          </div>
        )
      }
    `,
  },

  // --- Wie die Laufzeit dieses Kurses arbeitet ------------------------------
  'java-vergleich-laufzeit': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // Everything you see here was read, checked and executed by
          // about 3000 lines of TypeScript in src/java/ - no JVM involved.
          String[] steps = {"lexer", "parser", "pruefer", "interpreter"};

          for (int i = 0; i < steps.length; i++) {
            System.out.println((i + 1) + ". " + steps[i]);
          }

          // Try it: break something and watch which step complains.
          System.out.println("Done.");
        }
      }
    `,
  },

  'java-vergleich-uebung': {
    tipps: {
      de: [
        'Der Rückgabetyp steht vor dem Namen: `static double average(int[] numbers)`.',
        'Für den Durchschnitt musst du eine Seite zu `double` machen: `(double) sum / numbers.length`.',
        'Ein leeres Array hat die Länge 0 - dann wäre die Division ein Fehler. Gib in dem Fall 0 zurück.',
        '`countAbove` zählt in einer Schleife alle Werte, die größer als `limit` sind.',
      ],
      en: [
        'The return type comes before the name: `static double average(int[] numbers)`.',
        'For the average you must make one side a `double`: `(double) sum / numbers.length`.',
        'An empty array has length 0 - dividing would be an error. Return 0 in that case.',
        '`countAbove` counts all values greater than `limit` in a loop.',
      ],
    },
    code: java`
      public class Main {
        // The JavaScript version:
        //   const average = (numbers) =>
        //     numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0
        //   const countAbove = (numbers, limit) => numbers.filter((n) => n > limit).length

        static double average(int[] numbers) {
          // Your code:
          return 0;
        }

        static int countAbove(int[] numbers, int limit) {
          // Your code:
          return 0;
        }

        public static void main(String[] args) {
          int[] values = {4, 8, 15, 16, 23, 42};
          System.out.println(average(values));
          System.out.println(countAbove(values, 15));
        }
      }
    `,
    loesung: java`
      public class Main {
        static double average(int[] numbers) {
          if (numbers.length == 0) return 0;
          int sum = 0;
          for (int number : numbers) {
            sum += number;
          }
          return (double) sum / numbers.length;
        }

        static int countAbove(int[] numbers, int limit) {
          int found = 0;
          for (int number : numbers) {
            if (number > limit) found++;
          }
          return found;
        }

        public static void main(String[] args) {
          int[] values = {4, 8, 15, 16, 23, 42};
          System.out.println(average(values));
          System.out.println(countAbove(values, 15));
        }
      }
    `,
    tests: [
      {
        name: { de: 'average({1, 2, 3, 4}) ist 2.5', en: 'average({1, 2, 3, 4}) is 2.5' },
        ausdruck: 'average(new int[]{1, 2, 3, 4})',
        erwartet: 2.5,
      },
      {
        name: { de: 'average teilt nicht ganzzahlig', en: 'average does not divide as whole numbers' },
        ausdruck: 'average(new int[]{1, 2})',
        erwartet: 1.5,
      },
      {
        name: { de: 'average eines leeren Arrays ist 0', en: 'average of an empty array is 0' },
        ausdruck: 'average(new int[0])',
        erwartet: 0,
      },
      {
        name: { de: 'countAbove zählt richtig', en: 'countAbove counts correctly' },
        ausdruck: 'countAbove(new int[]{4, 8, 15, 16, 23, 42}, 15)',
        erwartet: 3,
      },
      {
        name: { de: 'countAbove zählt nicht den Grenzwert selbst', en: 'countAbove does not count the limit itself' },
        ausdruck: 'countAbove(new int[]{5, 5, 6}, 5)',
        erwartet: 1,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  struktur: js`
    src/
      java/                  ☕ JAVA ONLY - the runtime, plain TypeScript
        lexer.ts               text     → tokens
        parser.ts              tokens   → syntax tree
        pruefer.ts             tree     → list of errors  (this is javac)
        interpreter.ts         tree     → execution       (this is the JVM)
        bibliothek.ts          System.out, Math, String, ArrayList …
        werte.ts               int, double, String, objects at runtime
        index.ts               javaAusfuehren() - the only door to the outside

      kurs/
        java/                ☕ the chapters of part 7 (Java code in .code.ts)
        js/                  🟨 the chapters of part 1 (JavaScript)
        react/ hooks/ praxis/ ⚛️ the chapters of parts 2-4 (React)

      lernen/                🔧 the learning blocks - written in React
        TryIt.tsx              one editor per language: js | react | test | java
        jsSandbox.ts         🟨 runs JavaScript inside an iframe
        reactKompilieren.ts  ⚛️ compiles JSX with sucrase
        CodeEditor.tsx         editor + completion for every language

      components/ hooks/ seiten/ context/   ⚛️ the app itself - React
  `,
  wege: js`
    JavaScript example  →  <iframe sandbox>          →  real JS in the browser
    React example       →  sucrase                   →  real React in the browser
    Java example        →  src/java/ (interpreter)   →  Java, rebuilt
  `,
  echtesProjekt: js`
    # What a real Java project looks like - you need none of this in the course:
    project/
      pom.xml                 dependencies and build (Maven; alternative: Gradle)
      src/main/java/…/Main.java
      src/test/java/…/MainTest.java

    mvn compile     # javac for every file
    mvn test        # JUnit tests
    mvn package     # a .jar you can hand out
  `,
}
