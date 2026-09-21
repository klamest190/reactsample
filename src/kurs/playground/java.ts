import { java } from '../../lernen/quelltext'
import type { PlaygroundDaten } from './typen'

/**
 * Playground für Teil 7 (Java), ausgeführt von der Laufzeit in src/java/.
 * Anweisungen landen am Ende von main, Methoden vor main, Klassen unter Main.
 */
export const javaPlayground: PlaygroundDaten = {
  teil: 'java',
  modus: 'java',
  hinweis: {
    de: 'Es gibt keine Tastatureingabe (Scanner), keine Threads und keine Dateien - alles andere aus Teil 7 funktioniert.',
    en: 'There is no keyboard input (Scanner), no threads and no files - everything else from part 7 works.',
  },
  vorlagen: [
    {
      titel: { de: 'Leeres Blatt', en: 'Blank page' },
      info: { de: 'Die Klasse Main mit main - der Rest gehört dir.', en: 'The class Main with main - the rest is yours.' },
      code: java`
        public class Main {
          public static void main(String[] args) {
            System.out.println("Hello playground!");
          }
        }
      `,
    },
    {
      titel: { de: 'Notenrechner', en: 'Grade calculator' },
      info: { de: 'Array, Schleife, Methoden und if/else.', en: 'An array, a loop, methods and if/else.' },
      code: java`
        public class Main {
          static double average(int[] points) {
            int sum = 0;
            for (int p : points) {
              sum += p;
            }
            return (double) sum / points.length;
          }

          static String grade(double avg) {
            if (avg >= 90) return "A";
            if (avg >= 75) return "B";
            if (avg >= 50) return "C";
            return "F";
          }

          public static void main(String[] args) {
            int[] points = {88, 92, 79, 95};
            double avg = average(points);
            System.out.printf("Average: %.1f -> grade %s%n", avg, grade(avg));
          }
        }
      `,
    },
    {
      titel: { de: 'Bankkonto (Klassen)', en: 'Bank account (classes)' },
      info: { de: 'Private Felder, Konstruktor, Methoden und eine Exception.', en: 'Private fields, a constructor, methods and an exception.' },
      code: java`
        public class Main {
          public static void main(String[] args) {
            Account account = new Account("Ada", 100);
            account.deposit(50);
            try {
              account.withdraw(500);
            } catch (IllegalArgumentException e) {
              System.out.println("Error: " + e.getMessage());
            }
            System.out.println(account);
          }
        }

        class Account {
          private final String owner;
          private double balance;

          Account(String owner, double balance) {
            this.owner = owner;
            this.balance = balance;
          }

          void deposit(double amount) {
            balance += amount;
          }

          void withdraw(double amount) {
            if (amount > balance) {
              throw new IllegalArgumentException("Not enough money");
            }
            balance -= amount;
          }

          @Override
          public String toString() {
            return owner + ": " + balance + " EUR";
          }
        }
      `,
    },
    {
      titel: { de: 'Wörter zählen (Collections)', en: 'Counting words (collections)' },
      info: { de: 'HashMap, Schleife über einen String und sortierte Ausgabe.', en: 'A HashMap, a loop over a string and sorted output.' },
      code: java`
        import java.util.Map;
        import java.util.TreeMap;

        public class Main {
          public static void main(String[] args) {
            String text = "the cat and the dog and the bird";
            Map<String, Integer> counts = new TreeMap<>();
            for (String word : text.split(" ")) {
              counts.merge(word, 1, Integer::sum);
            }
            for (Map.Entry<String, Integer> entry : counts.entrySet()) {
              System.out.println(entry.getKey() + ": " + entry.getValue());
            }
          }
        }
      `,
    },
  ],
  gruppen: [
    {
      titel: { de: 'Ausgabe & Variablen', en: 'Output & variables' },
      bausteine: [
        {
          titel: { de: 'println', en: 'println' },
          info: { de: 'Eine Zeile auf der Konsole ausgeben.', en: 'Print a line to the console.' },
          code: 'System.out.println($0);',
          ort: 'main',
          kapitel: 'java-start',
        },
        {
          titel: { de: 'Variablen mit Typ', en: 'Typed variables' },
          info: { de: 'Jede Variable hat einen festen Typ.', en: 'Every variable has a fixed type.' },
          code: java`
            int age = 36;
            double height = 1.72;
            boolean likesJava = true;
            String firstName = "Ada";
            System.out.println(firstName + " is " + age + ", " + height + " m, likes Java: " + likesJava);
          `,
          ort: 'main',
          kapitel: 'java-variablen',
        },
        {
          titel: { de: 'printf', en: 'printf' },
          info: { de: 'Formatierte Ausgabe: %d Ganzzahl, %.2f Kommazahl, %s Text, %n Zeilenumbruch.', en: 'Formatted output: %d integer, %.2f decimal, %s text, %n newline.' },
          code: 'System.out.printf("%s costs %.2f EUR (%d left)%n", "Coffee", 3.5, 12);',
          ort: 'main',
          kapitel: 'java-variablen',
        },
        {
          titel: { de: 'Ganzzahl-Division', en: 'Integer division' },
          info: { de: 'int / int schneidet ab - erst mit double gibt es Nachkommastellen.', en: 'int / int truncates - you only get decimals with double.' },
          code: java`
            System.out.println(7 / 2);
            System.out.println(7 / 2.0);
            System.out.println(7 % 2);
          `,
          ort: 'main',
          kapitel: 'java-variablen',
        },
      ],
    },
    {
      titel: { de: 'Bedingungen & Schleifen', en: 'Conditions & loops' },
      bausteine: [
        {
          titel: { de: 'if / else', en: 'if / else' },
          info: { de: 'Die Bedingung muss ein boolean sein.', en: 'The condition has to be a boolean.' },
          code: java`
            int temperature = 18;
            if (temperature > 25) {
              System.out.println("Hot");
            } else if (temperature > 15) {
              System.out.println("Nice");
            } else {
              System.out.println("Cold");
            }
          `,
          ort: 'main',
          kapitel: 'java-kontrollfluss',
        },
        {
          titel: { de: 'for-Schleife', en: 'for loop' },
          info: { de: 'Zählen von … bis.', en: 'Count from … to.' },
          code: java`
            for (int i = 1; i <= 5; i++) {
              System.out.println("Round " + i);
            }
          `,
          ort: 'main',
          kapitel: 'java-kontrollfluss',
        },
        {
          titel: { de: 'while', en: 'while' },
          info: { de: 'Wiederholen, solange die Bedingung gilt.', en: 'Repeat while the condition holds.' },
          code: java`
            int countdown = 3;
            while (countdown > 0) {
              System.out.println(countdown);
              countdown--;
            }
            System.out.println("Liftoff!");
          `,
          ort: 'main',
          kapitel: 'java-kontrollfluss',
        },
        {
          titel: { de: 'switch-Ausdruck', en: 'switch expression' },
          info: { de: 'Moderne Form mit -> und Rückgabewert.', en: 'The modern form with -> and a result.' },
          code: java`
            String day = "SAT";
            String kind = switch (day) {
              case "SAT", "SUN" -> "weekend";
              default -> "workday";
            };
            System.out.println(day + " is a " + kind);
          `,
          ort: 'main',
          kapitel: 'java-kontrollfluss',
        },
      ],
    },
    {
      titel: { de: 'Methoden', en: 'Methods' },
      bausteine: [
        {
          titel: { de: 'Methode mit Rückgabe', en: 'Method with a return value' },
          info: { de: 'Parameter- und Rückgabetyp stehen fest.', en: 'Parameter and return types are fixed.' },
          code: java`
            static int add(int a, int b) {
              return a + b;
            }
          `,
          ort: 'methode',
          nutzung: { ort: 'main', code: 'System.out.println(add(2, 3));' },
          kapitel: 'java-methoden',
        },
        {
          titel: { de: 'boolean-Methode', en: 'boolean method' },
          info: { de: 'Eine Frage, die mit true oder false beantwortet wird.', en: 'A question answered with true or false.' },
          code: java`
            static boolean isPrime(int n) {
              if (n < 2) return false;
              for (int i = 2; i * i <= n; i++) {
                if (n % i == 0) return false;
              }
              return true;
            }
          `,
          ort: 'methode',
          nutzung: { ort: 'main', code: 'System.out.println("17 is prime: " + isPrime(17));' },
          kapitel: 'java-methoden',
        },
        {
          titel: { de: 'Rekursion', en: 'Recursion' },
          info: { de: 'Eine Methode, die sich selbst aufruft - mit Abbruchbedingung.', en: 'A method that calls itself - with a base case.' },
          code: java`
            static long factorial(int n) {
              if (n <= 1) return 1;
              return n * factorial(n - 1);
            }
          `,
          ort: 'methode',
          nutzung: { ort: 'main', code: 'System.out.println("10! = " + factorial(10));' },
          kapitel: 'java-methoden',
        },
        {
          titel: { de: 'Überladen', en: 'Overloading' },
          info: { de: 'Gleicher Name, andere Parameter.', en: 'Same name, different parameters.' },
          code: java`
            static String describe(int value) {
              return "int " + value;
            }

            static String describe(String value) {
              return "String \"" + value + "\"";
            }
          `,
          ort: 'methode',
          nutzung: { ort: 'main', code: 'System.out.println(describe(42) + " / " + describe("42"));' },
          kapitel: 'java-methoden',
        },
      ],
    },
    {
      titel: { de: 'Arrays & Strings', en: 'Arrays & strings' },
      bausteine: [
        {
          titel: { de: 'Array', en: 'Array' },
          info: { de: 'Feste Länge, ein Typ. Arrays.toString zeigt den Inhalt.', en: 'Fixed length, one type. Arrays.toString shows the contents.' },
          code: java`
            int[] numbers = {5, 3, 8, 1};
            Arrays.sort(numbers);
            System.out.println(Arrays.toString(numbers) + ", length " + numbers.length);
          `,
          ort: 'main',
          importe: ['import java.util.Arrays;'],
          kapitel: 'java-arrays',
        },
        {
          titel: { de: 'for-each über ein Array', en: 'for-each over an array' },
          info: { de: 'Jedes Element der Reihe nach.', en: 'Every element in turn.' },
          code: java`
            String[] colors = {"red", "green", "blue"};
            for (String color : colors) {
              System.out.println(color.toUpperCase());
            }
          `,
          ort: 'main',
          kapitel: 'java-arrays',
        },
        {
          titel: { de: 'String-Methoden', en: 'String methods' },
          info: { de: 'Strings vergleicht man mit equals, nicht mit ==.', en: 'Compare strings with equals, not with ==.' },
          code: java`
            String greeting = "Hello, World";
            System.out.println(greeting.length() + " " + greeting.toLowerCase() + " " + greeting.contains("World"));
            System.out.println(greeting.substring(7) + " " + greeting.equals("Hello, World"));
          `,
          ort: 'main',
          kapitel: 'java-arrays',
        },
        {
          titel: { de: 'StringBuilder', en: 'StringBuilder' },
          info: { de: 'Text effizient Stück für Stück zusammenbauen.', en: 'Build text efficiently piece by piece.' },
          code: java`
            StringBuilder stars = new StringBuilder();
            for (int i = 0; i < 5; i++) {
              stars.append("*");
            }
            System.out.println(stars.reverse().toString());
          `,
          ort: 'main',
          kapitel: 'java-arrays',
        },
      ],
    },
    {
      titel: { de: 'Klassen & Vererbung', en: 'Classes & inheritance' },
      bausteine: [
        {
          titel: { de: 'Klasse', en: 'Class' },
          info: { de: 'Felder, Konstruktor, Methode - und ein Objekt mit new.', en: 'Fields, a constructor, a method - and an object with new.' },
          code: java`
            class Dog {
              private final String name;

              Dog(String name) {
                this.name = name;
              }

              String bark() {
                return name + " says woof";
              }
            }
          `,
          ort: 'klasse',
          nutzung: { ort: 'main', code: 'System.out.println(new Dog("Rex").bark());' },
          kapitel: 'java-klassen',
        },
        {
          titel: { de: 'Record', en: 'Record' },
          info: { de: 'Eine Datenklasse in einer Zeile - mit equals und toString.', en: 'A data class in one line - with equals and toString.' },
          code: 'record Point(int x, int y) {}',
          ort: 'klasse',
          nutzung: { ort: 'main', code: 'System.out.println(new Point(3, 4));' },
          kapitel: 'java-klassen',
        },
        {
          titel: { de: 'Vererbung', en: 'Inheritance' },
          info: { de: 'extends übernimmt alles, @Override ändert eine Methode.', en: 'extends inherits everything, @Override changes a method.' },
          code: java`
            class Animal {
              String sound() {
                return "...";
              }
            }

            class Cat extends Animal {
              @Override
              String sound() {
                return "meow";
              }
            }
          `,
          ort: 'klasse',
          nutzung: { ort: 'main', code: 'Animal pet = new Cat();\nSystem.out.println(pet.sound());' },
          kapitel: 'java-vererbung',
        },
        {
          titel: { de: 'Interface', en: 'Interface' },
          info: { de: 'Ein Vertrag: Jede Klasse, die es implementiert, hat diese Methoden.', en: 'A contract: every class that implements it has these methods.' },
          code: java`
            interface Shape {
              double area();
            }

            class Circle implements Shape {
              private final double radius;

              Circle(double radius) {
                this.radius = radius;
              }

              public double area() {
                return Math.PI * radius * radius;
              }
            }

            class Square implements Shape {
              private final double side;

              Square(double side) {
                this.side = side;
              }

              public double area() {
                return side * side;
              }
            }
          `,
          ort: 'klasse',
          nutzung: {
            ort: 'main',
            code: 'Shape[] shapes = {new Circle(1), new Square(2)};\nfor (Shape shape : shapes) {\n  System.out.printf("%.2f%n", shape.area());\n}',
          },
          kapitel: 'java-vererbung',
        },
      ],
    },
    {
      titel: { de: 'Collections & Fehler', en: 'Collections & errors' },
      bausteine: [
        {
          titel: { de: 'ArrayList', en: 'ArrayList' },
          info: { de: 'Eine Liste, die wachsen kann.', en: 'A list that can grow.' },
          code: java`
            List<String> names = new ArrayList<>();
            names.add("Ada");
            names.add("Grace");
            names.remove("Ada");
            System.out.println(names + ", size " + names.size());
          `,
          ort: 'main',
          importe: ['import java.util.ArrayList;', 'import java.util.List;'],
          kapitel: 'java-collections',
        },
        {
          titel: { de: 'HashMap', en: 'HashMap' },
          info: { de: 'Schlüssel → Wert, wie ein Objekt in JavaScript.', en: 'Key → value, like an object in JavaScript.' },
          code: java`
            Map<String, Integer> stock = new HashMap<>();
            stock.put("apples", 4);
            stock.put("pears", 0);
            System.out.println(stock.get("apples") + " apples, has plums: " + stock.containsKey("plums"));
          `,
          ort: 'main',
          importe: ['import java.util.HashMap;', 'import java.util.Map;'],
          kapitel: 'java-collections',
        },
        {
          titel: { de: 'Streams & Lambdas', en: 'Streams & lambdas' },
          info: { de: 'filter und map wie in JavaScript - nur mit stream() davor.', en: 'filter and map like in JavaScript - just with stream() in front.' },
          code: java`
            List<Integer> values = List.of(3, 8, 1, 12, 5);
            List<Integer> bigDoubled = values.stream().filter(v -> v > 4).map(v -> v * 2).toList();
            System.out.println(bigDoubled);
          `,
          ort: 'main',
          importe: ['import java.util.List;'],
          kapitel: 'java-collections',
        },
        {
          titel: { de: 'try / catch', en: 'try / catch' },
          info: { de: 'Eine Exception abfangen statt abzustürzen.', en: 'Catch an exception instead of crashing.' },
          code: java`
            try {
              int zero = 0;
              System.out.println(10 / zero);
            } catch (ArithmeticException e) {
              System.out.println("Caught: " + e.getMessage());
            } finally {
              System.out.println("finally always runs");
            }
          `,
          ort: 'main',
          kapitel: 'java-fehler',
        },
        {
          titel: { de: 'Eigene Exception', en: 'Custom exception' },
          info: { de: 'Eine eigene Fehlerklasse - geworfen mit throw.', en: 'A custom error class - thrown with throw.' },
          code: java`
            class TooYoungException extends Exception {
              TooYoungException(String message) {
                super(message);
              }
            }
          `,
          ort: 'klasse',
          nutzung: {
            ort: 'main',
            code: 'try {\n  throw new TooYoungException("Must be at least 18");\n} catch (TooYoungException e) {\n  System.out.println(e.getMessage());\n}',
          },
          kapitel: 'java-fehler',
        },
      ],
    },
  ],
}
