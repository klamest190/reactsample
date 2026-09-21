import { java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 6.5 - Arrays & Strings. */

export const beispiele = {
  'java-arrays-einstieg': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // With values right away:
          String[] names = {"Ada", "Alan", "Grace"};

          // Or empty, with a fixed length:
          int[] scores = new int[3];
          scores[0] = 10;

          System.out.println(names.length);          // a field - no ()
          System.out.println(names[0]);
          System.out.println(scores[1]);             // 0, never undefined

          for (String name : names) {
            System.out.println(name);
          }
        }
      }
    `,
  },
  'java-arrays-laenge': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          int[] numbers = new int[3];

          // An array has a FIXED length. There is no push().
          // numbers[3] = 4;   → ArrayIndexOutOfBoundsException

          // Growing means: build a new, larger array and copy.
          int[] bigger = Arrays.copyOf(numbers, 5);
          bigger[3] = 42;

          System.out.println(numbers.length + " → " + bigger.length);
          System.out.println(Arrays.toString(bigger));

          // Without Arrays.toString you get the address, not the content:
          System.out.println(bigger);

          // Useful helpers:
          int[] messy = {5, 1, 3};
          Arrays.sort(messy);
          System.out.println(Arrays.toString(messy));
          System.out.println(Arrays.toString(new int[3]));
        }
      }
    `,
  },
  'java-arrays-npe': {
    // Absicht: zeigt die NullPointerException.
    code: java`
      public class Main {
        public static void main(String[] args) {
          String[] words = new String[2];    // two times null - not "" !
          System.out.println(words[0]);
          System.out.println(words[0].length());
        }
      }
    `,
  },
  'java-arrays-zweidimensional': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          int[][] grid = {
            {1, 2, 3},
            {4, 5, 6},
          };

          System.out.println(grid.length);        // rows
          System.out.println(grid[0].length);     // columns in the first row
          System.out.println(grid[1][2]);

          int total = 0;
          for (int[] row : grid) {
            for (int value : row) {
              total += value;
            }
          }
          System.out.println("Total: " + total);
          System.out.println(Arrays.deepToString(grid));
        }
      }
    `,
  },
  'java-arrays-strings': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          String text = "  Hello Java World  ";

          System.out.println(text.length());
          System.out.println(text.trim());
          System.out.println(text.trim().toUpperCase());
          System.out.println(text.contains("Java"));
          System.out.println(text.indexOf("Java"));
          System.out.println(text.trim().substring(0, 5));
          System.out.println(text.replace("Java", "JS").trim());

          // split gives an array back
          String[] parts = text.trim().split(" ");
          System.out.println(parts.length + ": " + Arrays.toString(parts));

          // Strings never change - every method returns a NEW string
          String name = "ada";
          name.toUpperCase();                 // result thrown away!
          System.out.println(name);
          name = name.toUpperCase();          // this is how it works
          System.out.println(name);
        }
      }
    `,
  },
  'java-arrays-gleichheit': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          String a = "hello";
          String b = "hello";
          String c = new String("hello");
          String d = "hel" + readTail();

          System.out.println(a == b);          // true  - same object from the pool
          System.out.println(a == c);          // false - new String() makes a new object
          System.out.println(a == d);          // false - built at runtime
          System.out.println(a.equals(c));     // true  - same content
          System.out.println(a.equals(d));     // true

          // Rule: == asks "same object?", equals asks "same content?"
          System.out.println(a.equalsIgnoreCase("HELLO"));
        }

        static String readTail() {
          return "lo";
        }
      }
    `,
  },
  'java-arrays-builder': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // Bad: every + creates a new string
          String slow = "";
          for (int i = 1; i <= 5; i++) slow = slow + i + ",";
          System.out.println(slow);

          // Good: StringBuilder changes one object
          StringBuilder builder = new StringBuilder();
          for (int i = 1; i <= 5; i++) builder.append(i).append(",");
          System.out.println(builder.toString());
          System.out.println(builder.length());

          // Or simply:
          System.out.println(String.join("-", "a", "b", "c"));
        }
      }
    `,
  },
  'java-arrays-uebung': {
    tipps: {
      de: [
        '`text.split(" ")` liefert ein `String[]` mit allen Wörtern.',
        'Die Länge eines Arrays ist `array.length` (ohne Klammern), die eines Strings `s.length()` (mit).',
        'Für das längste Wort brauchst du eine Variable, die du in der Schleife aktualisierst - starte mit `""`.',
        '`text.toLowerCase().contains("java")` prüft unabhängig von Groß- und Kleinschreibung.',
      ],
      en: [
        '`text.split(" ")` gives you a `String[]` with all words.',
        'The length of an array is `array.length` (no parentheses), that of a string `s.length()` (with).',
        'For the longest word you need a variable you update inside the loop - start with `""`.',
        '`text.toLowerCase().contains("java")` checks regardless of upper or lower case.',
      ],
    },
    code: java`
      public class Main {
        public static void main(String[] args) {
          String text = "Java is a compiled and typed language";

          // Your code:

        }
      }
    `,
    loesung: java`
      public class Main {
        public static void main(String[] args) {
          String text = "Java is a compiled and typed language";

          String[] words = text.split(" ");
          int wordCount = words.length;

          String longest = "";
          for (String word : words) {
            if (word.length() > longest.length()) longest = word;
          }

          boolean mentionsJava = text.toLowerCase().contains("java");

          System.out.println(wordCount + " " + longest + " " + mentionsJava);
        }
      }
    `,
    tests: [
      { name: { de: 'words hat 7 Einträge', en: 'words has 7 entries' }, ausdruck: 'words.length', erwartet: 7 },
      { name: { de: 'wordCount ist 7', en: 'wordCount is 7' }, ausdruck: 'wordCount', erwartet: 7 },
      { name: { de: 'longest ist "compiled"', en: 'longest is "compiled"' }, ausdruck: 'longest', erwartet: 'compiled' },
      { name: { de: 'mentionsJava ist true', en: 'mentionsJava is true' }, ausdruck: 'mentionsJava', erwartet: true },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  anlegen: java`
    int[] a = new int[5];              // five slots, all 0
    int[] b = {1, 2, 3};               // the length comes from the values
    String[] c = new String[]{"x"};    // the long form

    a.length         // 5   - a field, not a method!
    "abc".length()   // 3   - on a string it IS a method
  `,
  jsVergleich: java`
    // JavaScript: an array takes anything and grows
    const list = [1, 'two', true]
    list.push(4)

    // Java: one type, a fixed length
    int[] list = {1, 2, 3};
    // list.push(4);        does not exist → ArrayList (chapter 6.8)
  `,
  gleichheit: java`
    String a = "hello";
    String b = new String("hello");

    a == b            // false - two different objects
    a.equals(b)       // true  - same content

    // For numbers, == is the right choice:
    int x = 5, y = 5;
    x == y            // true
  `,
}
