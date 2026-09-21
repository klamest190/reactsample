import { java } from '../../lernen/quelltext'
import type { UebungsSammlung } from './typen'

/**
 * Zusätzliche Übungen für Teil 6 (Java) - pro Kapitel gestuft:
 * vorhersagen -> Fehler finden -> ergänzen / frei schreiben.
 *
 * Die Vorhersage-Übungen zielen bewusst auf die Stellen, an denen Java sich
 * anders verhält, als man es aus JavaScript kennt.
 */

const t = (de: string, en: string) => ({ de, en })

export const uebungen: UebungsSammlung = {
  'java-start': [
    {
      id: 'java-start-println',
      stufe: 'vorhersage',
      titel: t('print oder println?', 'print or println?'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: java`
        System.out.print("A");
        System.out.println("B");
        System.out.print("C");
      `,
      antworten: ['A\nB\nC', 'AB\nC', 'ABC', 'A\nBC'],
      richtig: 1,
      erklaerung: t(
        '`print` schreibt ohne Zeilenumbruch, `println` hängt einen an. Also steht „AB“ in der ersten Zeile und „C“ in der zweiten.',
        '`print` writes without a line break, `println` adds one. So “AB” is on the first line and “C” on the second.',
      ),
    },
  ],

  'java-variablen': [
    {
      id: 'java-variablen-teilen',
      stufe: 'vorhersage',
      titel: t('Zwei Divisionen', 'Two divisions'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: java`
        int a = 5;
        int b = 2;
        System.out.println(a / b);
        System.out.println(a / (double) b);
      `,
      antworten: ['2.5\n2.5', '2\n2.5', '2\n2', '2.5\n2'],
      richtig: 1,
      erklaerung: t(
        '`int / int` rechnet ganzzahlig und schneidet ab: 2. Sobald eine Seite ein `double` ist, kommt 2.5 heraus.',
        '`int / int` divides as whole numbers and cuts off: 2. As soon as one side is a `double` the result is 2.5.',
      ),
    },
    {
      id: 'java-variablen-cast',
      stufe: 'fehler',
      titel: t('Der Durchschnitt stimmt nicht', 'The average is wrong'),
      aufgabe: t(
        '`average` soll `2.5` ergeben, liefert aber `2.0`. Finde und behebe den Fehler - ohne die Typen der Variablen zu ändern.',
        '`average` should be `2.5` but is `2.0`. Find and fix the bug - without changing the types of the variables.',
      ),
      modus: 'java',
      code: java`
        public class Main {
          public static void main(String[] args) {
            int sum = 5;
            int count = 2;
            double average = sum / count;

            System.out.println(average);
          }
        }
      `,
      loesung: java`
        public class Main {
          public static void main(String[] args) {
            int sum = 5;
            int count = 2;
            double average = (double) sum / count;

            System.out.println(average);
          }
        }
      `,
      tipps: {
        de: [
          'Die Division passiert, **bevor** das Ergebnis in `average` landet - da sind beide Seiten noch `int`.',
          'Mach eine der beiden Seiten zu `double`: `(double) sum / count`.',
        ],
        en: [
          'The division happens **before** the result lands in `average` - at that point both sides are still `int`.',
          'Make one of the two sides a `double`: `(double) sum / count`.',
        ],
      },
      tests: [{ name: t('average ist 2.5', 'average is 2.5'), ausdruck: 'average', erwartet: 2.5 }],
    },
  ],

  'java-kontrollfluss': [
    {
      id: 'java-kontrollfluss-fallthrough',
      stufe: 'vorhersage',
      titel: t('Ein vergessenes break', 'A forgotten break'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: java`
        int level = 2;
        switch (level) {
          case 1:
            System.out.println("one");
          case 2:
            System.out.println("two");
          case 3:
            System.out.println("three");
            break;
          default:
            System.out.println("other");
        }
      `,
      antworten: ['two', 'two\nthree', 'two\nthree\nother', 'one\ntwo\nthree'],
      richtig: 1,
      erklaerung: t(
        'Ohne `break` läuft die Ausführung in den nächsten `case` weiter („fall-through“) - bis zum `break` nach „three“.',
        'Without `break` execution falls through into the next `case` - until the `break` after “three”.',
      ),
    },
    {
      id: 'java-kontrollfluss-summe',
      stufe: 'ergaenzen',
      titel: t('Nur die geraden Zahlen', 'Only the even numbers'),
      aufgabe: t(
        'Zähle in `sum` alle geraden Zahlen von 1 bis 10 zusammen (2 + 4 + 6 + 8 + 10 = 30). Nutze `continue` für die ungeraden.',
        'Add up all even numbers from 1 to 10 in `sum` (2 + 4 + 6 + 8 + 10 = 30). Use `continue` for the odd ones.',
      ),
      modus: 'java',
      code: java`
        public class Main {
          public static void main(String[] args) {
            int sum = 0;

            for (int i = 1; i <= 10; i++) {
              // Your code:
            }

            System.out.println(sum);
          }
        }
      `,
      loesung: java`
        public class Main {
          public static void main(String[] args) {
            int sum = 0;

            for (int i = 1; i <= 10; i++) {
              if (i % 2 != 0) continue;
              sum += i;
            }

            System.out.println(sum);
          }
        }
      `,
      tipps: {
        de: ['Ungerade erkennst du mit `i % 2 != 0`.', '`continue` springt sofort zum nächsten Durchlauf.'],
        en: ['You detect odd numbers with `i % 2 != 0`.', '`continue` jumps straight to the next round.'],
      },
      tests: [{ name: t('sum ist 30', 'sum is 30'), ausdruck: 'sum', erwartet: 30 }],
    },
  ],

  'java-methoden': [
    {
      id: 'java-methoden-kopie',
      stufe: 'vorhersage',
      titel: t('Was die Methode ändert', 'What the method changes'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: java`
        static void change(int number, int[] values) {
          number = 9;
          values[0] = 9;
        }

        public static void main(String[] args) {
          int number = 1;
          int[] values = {1};
          change(number, values);
          System.out.println(number + " " + values[0]);
        }
      `,
      antworten: ['9 9', '1 1', '1 9', '9 1'],
      richtig: 2,
      erklaerung: t(
        'Die Zahl wird als Kopie übergeben - die Änderung bleibt in der Methode. Beim Array wird die **Referenz** kopiert: Beide zeigen auf dasselbe Array.',
        'The number is passed as a copy - the change stays inside the method. For the array the **reference** is copied: both point at the same array.',
      ),
    },
    {
      id: 'java-methoden-return',
      stufe: 'fehler',
      titel: t('Der Compiler meckert', 'The compiler complains'),
      aufgabe: t(
        'Dieser Code startet gar nicht. Lies die Fehlermeldung und repariere `grade` so, dass es auf **jedem** Weg etwas zurückgibt.',
        'This code does not even start. Read the error message and fix `grade` so it returns something on **every** path.',
      ),
      modus: 'java',
      code: java`
        public class Main {
          static String grade(int points) {
            if (points >= 90) {
              return "A";
            } else if (points >= 80) {
              return "B";
            }
          }

          public static void main(String[] args) {
            System.out.println(grade(95));
          }
        }
      `,
      loesung: java`
        public class Main {
          static String grade(int points) {
            if (points >= 90) {
              return "A";
            } else if (points >= 80) {
              return "B";
            }
            return "C";
          }

          public static void main(String[] args) {
            System.out.println(grade(95));
          }
        }
      `,
      tipps: {
        de: [
          'Was passiert bei `grade(50)`? Dort endet die Methode, ohne etwas zurückzugeben.',
          'Ein `return "C";` am Ende der Methode genügt.',
        ],
        en: [
          'What happens for `grade(50)`? There the method ends without returning anything.',
          'A `return "C";` at the end of the method is enough.',
        ],
      },
      tests: [
        { name: t('grade(95) ist "A"', 'grade(95) is "A"'), ausdruck: 'grade(95)', erwartet: 'A' },
        { name: t('grade(85) ist "B"', 'grade(85) is "B"'), ausdruck: 'grade(85)', erwartet: 'B' },
        { name: t('grade(10) ist "C"', 'grade(10) is "C"'), ausdruck: 'grade(10)', erwartet: 'C' },
      ],
    },
  ],

  'java-arrays': [
    {
      id: 'java-arrays-gleich',
      stufe: 'vorhersage',
      titel: t('Zwei gleiche Strings', 'Two equal strings'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: java`
        String a = "java";
        String b = new String("java");
        System.out.println(a == b);
        System.out.println(a.equals(b));
      `,
      antworten: ['true\ntrue', 'false\nfalse', 'true\nfalse', 'false\ntrue'],
      richtig: 3,
      erklaerung: t(
        '`new String(…)` erzeugt bewusst ein zweites Objekt. `==` fragt „dasselbe Objekt?“ (false), `equals` fragt „derselbe Inhalt?“ (true).',
        '`new String(…)` deliberately creates a second object. `==` asks “same object?” (false), `equals` asks “same content?” (true).',
      ),
    },
    {
      id: 'java-arrays-umdrehen',
      stufe: 'frei',
      titel: t('Text rückwärts', 'Text backwards'),
      aufgabe: t(
        'Schreibe `reverse(String text)`, das den Text rückwärts zurückgibt - ohne `StringBuilder.reverse()`. Laufe dafür von hinten nach vorn durch die Zeichen.',
        'Write `reverse(String text)` returning the text backwards - without `StringBuilder.reverse()`. Walk through the characters from back to front.',
      ),
      modus: 'java',
      code: java`
        public class Main {
          static String reverse(String text) {
            // Your code:
            return "";
          }

          public static void main(String[] args) {
            System.out.println(reverse("Java"));
          }
        }
      `,
      loesung: java`
        public class Main {
          static String reverse(String text) {
            StringBuilder result = new StringBuilder();
            for (int i = text.length() - 1; i >= 0; i--) {
              result.append(text.charAt(i));
            }
            return result.toString();
          }

          public static void main(String[] args) {
            System.out.println(reverse("Java"));
          }
        }
      `,
      tipps: {
        de: [
          'Das letzte Zeichen hat den Index `text.length() - 1`.',
          'Zähle rückwärts: `for (int i = text.length() - 1; i >= 0; i--)`.',
          '`text.charAt(i)` liefert das Zeichen, `StringBuilder.append(…)` sammelt es ein.',
        ],
        en: [
          'The last character has the index `text.length() - 1`.',
          'Count backwards: `for (int i = text.length() - 1; i >= 0; i--)`.',
          '`text.charAt(i)` gives the character, `StringBuilder.append(…)` collects it.',
        ],
      },
      tests: [
        { name: t('reverse("Java") ist "avaJ"', 'reverse("Java") is "avaJ"'), ausdruck: 'reverse("Java")', erwartet: 'avaJ' },
        { name: t('reverse("") ist ""', 'reverse("") is ""'), ausdruck: 'reverse("")', erwartet: '' },
        { name: t('reverse("a") ist "a"', 'reverse("a") is "a"'), ausdruck: 'reverse("a")', erwartet: 'a' },
      ],
    },
  ],

  'java-klassen': [
    {
      id: 'java-klassen-this',
      stufe: 'fehler',
      titel: t('Der Name bleibt leer', 'The name stays empty'),
      aufgabe: t(
        'Der Konstruktor sieht richtig aus, aber `getName()` liefert `null`. Finde den Grund und behebe ihn.',
        'The constructor looks right, but `getName()` returns `null`. Find the reason and fix it.',
      ),
      modus: 'java',
      code: java`
        public class Main {
          public static void main(String[] args) {
            Person person = new Person("Ada");
            System.out.println(person.getName());
          }
        }

        class Person {
          private String name;

          Person(String name) {
            name = name;
          }

          String getName() {
            return name;
          }
        }
      `,
      loesung: java`
        public class Main {
          public static void main(String[] args) {
            Person person = new Person("Ada");
            System.out.println(person.getName());
          }
        }

        class Person {
          private String name;

          Person(String name) {
            this.name = name;
          }

          String getName() {
            return name;
          }
        }
      `,
      tipps: {
        de: [
          'Im Konstruktor gibt es zwei Dinge namens `name`: das Feld und den Parameter.',
          '`name = name;` weist den Parameter sich selbst zu. Das Feld erreichst du mit `this.name`.',
        ],
        en: [
          'Inside the constructor there are two things called `name`: the field and the parameter.',
          '`name = name;` assigns the parameter to itself. You reach the field with `this.name`.',
        ],
      },
      tests: [
        { name: t('getName() ist "Ada"', 'getName() is "Ada"'), ausdruck: 'person.getName()', erwartet: 'Ada' },
        {
          name: t('Auch für andere Namen', 'Works for other names too'),
          ausdruck: 'new Person("Grace").getName()',
          erwartet: 'Grace',
        },
      ],
    },
  ],

  'java-vererbung': [
    {
      id: 'java-vererbung-polymorph',
      stufe: 'vorhersage',
      titel: t('Welche Methode läuft?', 'Which method runs?'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: java`
        class Animal {
          String sound() { return "..."; }
        }

        class Dog extends Animal {
          @Override
          String sound() { return "Woof"; }
        }

        // in main:
        Animal animal = new Dog();
        System.out.println(animal.sound());
      `,
      antworten: ['...', 'Woof', 'ein Kompilierfehler', 'null'],
      richtig: 1,
      erklaerung: t(
        'Der Typ der Variablen entscheidet nur, **was man aufrufen darf**. Welche Fassung läuft, bestimmt das Objekt - hier also `Dog`.',
        'The variable type only decides **what you may call**. Which version runs is decided by the object - here `Dog`.',
      ),
    },
  ],

  'java-collections': [
    {
      id: 'java-collections-remove',
      stufe: 'vorhersage',
      titel: t('remove mit einer Zahl', 'remove with a number'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: java`
        List<Integer> numbers = new ArrayList<>(List.of(10, 20, 30));
        numbers.remove(1);
        System.out.println(numbers);
      `,
      antworten: ['[10, 20, 30]', '[20, 30]', '[10, 30]', '[10, 20]'],
      richtig: 2,
      erklaerung: t(
        '`remove(int)` löscht nach **Position**, nicht nach Wert - also das zweite Element. Für den Wert bräuchte es `remove(Integer.valueOf(1))`.',
        '`remove(int)` deletes by **position**, not by value - so the second element. For the value you would need `remove(Integer.valueOf(1))`.',
      ),
    },
    {
      id: 'java-collections-filter',
      stufe: 'ergaenzen',
      titel: t('Lange Wörter sammeln', 'Collecting long words'),
      aufgabe: t(
        'Fülle `longWords` mit allen Wörtern aus `words`, die mehr als 4 Zeichen haben - einmal mit einer Schleife, wenn du magst auch mit `stream()`.',
        'Fill `longWords` with all words from `words` that have more than 4 characters - with a loop, or with `stream()` if you prefer.',
      ),
      modus: 'java',
      code: java`
        public class Main {
          public static void main(String[] args) {
            List<String> words = List.of("java", "class", "int", "object");
            List<String> longWords = new ArrayList<>();

            // Your code:

            System.out.println(longWords);
          }
        }
      `,
      loesung: java`
        public class Main {
          public static void main(String[] args) {
            List<String> words = List.of("java", "class", "int", "object");
            List<String> longWords = new ArrayList<>();

            for (String word : words) {
              if (word.length() > 4) {
                longWords.add(word);
              }
            }

            System.out.println(longWords);
          }
        }
      `,
      tipps: {
        de: [
          'Laufe mit `for (String word : words)` über die Liste.',
          'Die Länge eines Strings ist `word.length()` - mit Klammern.',
          'Mit `longWords.add(word)` hängst du an.',
        ],
        en: [
          'Walk the list with `for (String word : words)`.',
          'The length of a string is `word.length()` - with parentheses.',
          'Use `longWords.add(word)` to append.',
        ],
      },
      tests: [
        { name: t('longWords hat 2 Einträge', 'longWords has 2 entries'), ausdruck: 'longWords.size()', erwartet: 2 },
        {
          name: t('„class“ und „object“ sind drin', '“class” and “object” are in it'),
          ausdruck: 'longWords.contains("class") && longWords.contains("object")',
          erwartet: true,
        },
        { name: t('„java“ ist nicht drin', '“java” is not in it'), ausdruck: 'longWords.contains("java")', erwartet: false },
      ],
    },
  ],

  'java-fehler': [
    {
      id: 'java-fehler-reihenfolge',
      stufe: 'vorhersage',
      titel: t('try, catch, finally', 'try, catch, finally'),
      frage: t('Was gibt dieser Code aus?', 'What does this code print?'),
      code: java`
        try {
          System.out.println("A");
          int x = 1 / 0;
          System.out.println("B");
        } catch (ArithmeticException e) {
          System.out.println("C");
        } finally {
          System.out.println("D");
        }
        System.out.println("E");
      `,
      antworten: ['A\nB\nC\nD\nE', 'A\nC\nD\nE', 'A\nC\nE', 'A\nD\nE'],
      richtig: 1,
      erklaerung: t(
        'Nach dem Fehler wird der Rest des `try`-Blocks übersprungen („B“ fehlt). Dann läuft `catch`, dann **immer** `finally`, dann geht es normal weiter.',
        'After the error the rest of the `try` block is skipped (no “B”). Then `catch` runs, then **always** `finally`, then execution continues normally.',
      ),
    },
  ],

  'java-vergleich': [
    {
      id: 'java-vergleich-bedingung',
      stufe: 'vorhersage',
      titel: t('Was Java nicht erlaubt', 'What Java does not allow'),
      frage: t('Welche dieser Zeilen ist in Java ein Kompilierfehler?', 'Which of these lines is a compile error in Java?'),
      code: java`
        String name = "Ada";
        int count = 0;

        // 1)
        if (name != null) { }
        // 2)
        if (count == 0) { }
        // 3)
        if (count) { }
        // 4)
        if (!name.isEmpty()) { }
      `,
      antworten: ['1', '2', '3', '4'],
      richtig: 2,
      erklaerung: t(
        'Eine Bedingung muss in Java ein `boolean` sein. `count` ist ein `int` - in JavaScript wäre das „truthy“, hier meldet der Compiler `incompatible types`.',
        'A condition in Java must be a `boolean`. `count` is an `int` - in JavaScript that would be “truthy”, here the compiler reports `incompatible types`.',
      ),
    },
  ],
}
