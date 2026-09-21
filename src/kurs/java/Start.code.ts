import { java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für Kapitel 6.1 - für die deutsche UND die englische Fassung.
 *
 * Java-Code ist (wie aller Code im Kurs) immer Englisch; nur die angezeigten
 * Testnamen gibt es in beiden Sprachen. Ausgeführt wird das hier von der
 * Laufzeit in `src/java/` - nicht vom Browser.
 */

export const beispiele = {
  'java-start-einstieg': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          System.out.println("Hello Java!");
        }
      }
    `,
  },
  'java-start-ausgabe': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          System.out.println("Line 1");
          System.out.println("Line 2");

          // print writes WITHOUT a line break:
          System.out.print("a");
          System.out.print("b");
          System.out.println("c");

          // Values of any type are allowed:
          System.out.println(42);
          System.out.println(3.5);
          System.out.println(true);
          System.out.println('X');

          // printf formats: %s text, %d whole number, %.2f decimals, %n line break
          System.out.printf("%s is %d years old%n", "Ada", 36);
          System.out.printf("Pi is about %.2f%n", 3.14159);
        }
      }
    `,
  },
  'java-start-fehler': {
    // Absicht: Dieses Beispiel läuft NICHT. Es zeigt, was der Compiler meldet.
    code: java`
      public class Main {
        public static void main(String[] args) {
          System.out.println("The semicolon is missing")
          System.out.println("This line never runs");
        }
      }
    `,
  },
  'java-start-mehrere': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          System.out.println("Main starts");
          Greeter.greet("Ada");
          Greeter.greet("Alan");
        }
      }

      // A second class in the same file - that is allowed.
      class Greeter {
        static void greet(String name) {
          System.out.println("Hello, " + name + "!");
        }
      }
    `,
  },
  'java-start-uebung': {
    tipps: {
      de: [
        'Text steht in doppelten Anführungszeichen: `"Ada"`. Einfache Anführungszeichen sind in Java nur für einzelne Zeichen.',
        'Eine Zahl braucht `int`, ein Text `String` - der Typ steht **vor** dem Namen.',
        'Mit `+` klebst du Text und Zahl zusammen: `"born in " + year`.',
        'Jede Anweisung endet mit einem Semikolon.',
      ],
      en: [
        'Text goes in double quotes: `"Ada"`. Single quotes are only for single characters in Java.',
        'A number needs `int`, text needs `String` - the type comes **before** the name.',
        'Use `+` to glue text and number together: `"born in " + year`.',
        'Every statement ends with a semicolon.',
      ],
    },
    code: java`
      public class Main {
        public static void main(String[] args) {
          // Your code:

        }
      }
    `,
    loesung: java`
      public class Main {
        public static void main(String[] args) {
          String name = "Ada";
          int year = 1815;
          System.out.println(name + " was born in " + year + ".");
        }
      }
    `,
    tests: [
      { name: { de: 'name ist "Ada"', en: 'name is "Ada"' }, ausdruck: 'name', erwartet: 'Ada' },
      { name: { de: 'year ist die Zahl 1815', en: 'year is the number 1815' }, ausdruck: 'year', erwartet: 1815 },
      {
        name: { de: 'Die Ausgabe lautet "Ada was born in 1815."', en: 'The output is "Ada was born in 1815."' },
        ausdruck: 'output.trim()',
        erwartet: 'Ada was born in 1815.',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/**
 * Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens.
 * Wie überall im Kurs: Code und Kommentare sind Englisch, weil beide
 * Sprachfassungen dieselben Blöcke zeigen.
 */
export const codeBloecke = {
  geruest: java`
    public class Main {                             // 1. the class
      public static void main(String[] args) {      // 2. the main method
        System.out.println("Hello Java!");          // 3. a statement
      }
    }
  `,
  jsVergleich: java`
    // JavaScript - one file, one line, done:
    console.log('Hello JavaScript!')
  `,
  werkzeuge: java`
    javac Main.java     # compiles Main.java → Main.class (bytecode)
    java Main           # starts the JVM with Main.class
  `,
}
