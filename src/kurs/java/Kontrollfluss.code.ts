import { java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 7.3 - Bedingungen & Schleifen. */

export const beispiele = {
  'java-kontrollfluss-einstieg': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          int temperature = 18;

          if (temperature > 25) {
            System.out.println("hot");
          } else if (temperature > 15) {
            System.out.println("pleasant");
          } else {
            System.out.println("cold");
          }
        }
      }
    `,
  },
  'java-kontrollfluss-boolean': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          int count = 3;
          String name = "Ada";

          // A condition is always a boolean - never a number or a string.
          System.out.println(count > 0);
          System.out.println(count == 3);
          System.out.println(count != 3);
          System.out.println(count > 0 && name.length() > 2);
          System.out.println(count > 5 || name.equals("Ada"));
          System.out.println(!(count > 5));

          // if (count) { }     ← error: int cannot be converted to boolean
          // if (name) { }      ← error too

          // The ternary operator works exactly like in JavaScript:
          String label = count == 1 ? "item" : "items";
          System.out.println(count + " " + label);
        }
      }
    `,
  },
  'java-kontrollfluss-switch': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          int day = 3;

          // Classic: every case needs a break, otherwise it falls through.
          switch (day) {
            case 6:
            case 7:
              System.out.println("weekend");
              break;
            default:
              System.out.println("working day");
          }

          // Modern (Java 14+): arrow, no break, and it can return a value.
          String name = switch (day) {
            case 1 -> "Monday";
            case 2 -> "Tuesday";
            case 3 -> "Wednesday";
            default -> "later this week";
          };
          System.out.println(name);

          // switch also works on strings:
          String command = "stop";
          switch (command) {
            case "go" -> System.out.println("running");
            case "stop" -> System.out.println("standing");
            default -> System.out.println("unknown");
          }
        }
      }
    `,
  },
  'java-kontrollfluss-schleifen': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // 1. counting loop - the classic
          for (int i = 1; i <= 3; i++) {
            System.out.println("Round " + i);
          }

          // 2. enhanced for - over everything that has elements
          int[] scores = {10, 20, 30};
          int total = 0;
          for (int score : scores) {
            total += score;
          }
          System.out.println("Total: " + total);

          // 3. while - as long as the condition holds
          int remaining = 3;
          while (remaining > 0) {
            System.out.print(remaining + " ");
            remaining--;
          }
          System.out.println();

          // 4. do-while - runs at least once
          int tries = 0;
          do {
            tries++;
          } while (tries < 1);
          System.out.println("Tries: " + tries);
        }
      }
    `,
  },
  'java-kontrollfluss-break': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) continue;     // skip the rest of this round
            if (i > 7) break;             // leave the loop entirely
            System.out.print(i + " ");
          }
          System.out.println();

          // Nested loops: break only leaves the inner one.
          for (int row = 1; row <= 3; row++) {
            for (int col = 1; col <= 3; col++) {
              if (col > row) break;
              System.out.print("*");
            }
            System.out.println();
          }
        }
      }
    `,
  },
  'java-kontrollfluss-uebung': {
    tipps: {
      de: [
        'Zähle mit `for (int i = 1; i <= 20; i++)`.',
        'Teilbar durch 3 heißt: `i % 3 == 0`.',
        'Die Reihenfolge zählt: Erst auf „durch 3 **und** durch 5 teilbar“ prüfen, dann die Einzelfälle.',
        'Zähle die Treffer in einer Variablen `fizzCount`, die du **vor** der Schleife anlegst.',
      ],
      en: [
        'Count with `for (int i = 1; i <= 20; i++)`.',
        'Divisible by 3 means: `i % 3 == 0`.',
        'Order matters: check “divisible by 3 **and** 5” first, then the single cases.',
        'Count the hits in a variable `fizzCount` that you declare **before** the loop.',
      ],
    },
    code: java`
      public class Main {
        public static void main(String[] args) {
          int fizzCount = 0;

          // Your code:

          System.out.println("Fizz count: " + fizzCount);
        }
      }
    `,
    loesung: java`
      public class Main {
        public static void main(String[] args) {
          int fizzCount = 0;

          for (int i = 1; i <= 20; i++) {
            if (i % 3 == 0 && i % 5 == 0) {
              System.out.println("FizzBuzz");
            } else if (i % 3 == 0) {
              System.out.println("Fizz");
              fizzCount++;
            } else if (i % 5 == 0) {
              System.out.println("Buzz");
            } else {
              System.out.println(i);
            }
          }

          System.out.println("Fizz count: " + fizzCount);
        }
      }
    `,
    tests: [
      { name: { de: '1 und 2 werden als Zahl ausgegeben', en: '1 and 2 are printed as numbers' }, ausdruck: 'output.startsWith("1\\n2\\n")', erwartet: true },
      { name: { de: 'Bei 3 steht Fizz', en: 'At 3 it says Fizz' }, ausdruck: 'output.contains("2\\nFizz\\n4")', erwartet: true },
      { name: { de: 'Bei 5 steht Buzz', en: 'At 5 it says Buzz' }, ausdruck: 'output.contains("4\\nBuzz\\n")', erwartet: true },
      { name: { de: 'Bei 15 steht FizzBuzz', en: 'At 15 it says FizzBuzz' }, ausdruck: 'output.contains("14\\nFizzBuzz\\n16")', erwartet: true },
      { name: { de: 'fizzCount ist 5 (3, 6, 9, 12, 18)', en: 'fizzCount is 5 (3, 6, 9, 12, 18)' }, ausdruck: 'fizzCount', erwartet: 5 },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  keinTruthy: java`
    // JavaScript: anything may be a condition
    if (list.length) { … }
    if (name) { … }

    // Java: it must be a boolean
    if (list.length > 0) { … }
    if (name != null && !name.isEmpty()) { … }
  `,
  schleifenWahl: java`
    for (int i = 0; i < 10; i++)      // I need the counter
    for (String s : words)            // I only need the elements
    while (!done)                     // I do not know how often
    do { … } while (retry);           // at least once
  `,
}
