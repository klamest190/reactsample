import { java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 6.4 - Methoden. */

export const beispiele = {
  'java-methoden-einstieg': {
    code: java`
      public class Main {
        // Return type, name, parameters with types - all written out.
        static int doubled(int number) {
          return number * 2;
        }

        static void shout(String text) {       // void = returns nothing
          System.out.println(text.toUpperCase() + "!");
        }

        public static void main(String[] args) {
          System.out.println(doubled(21));
          shout("hello");
        }
      }
    `,
  },
  'java-methoden-ueberladung': {
    code: java`
      public class Main {
        // Same name, different parameters: that is "overloading".
        // The compiler picks the right one - before the program runs.
        static int add(int a, int b) {
          return a + b;
        }

        static double add(double a, double b) {
          return a + b;
        }

        static String add(String a, String b) {
          return a + " " + b;
        }

        static int add(int a, int b, int c) {
          return a + b + c;
        }

        public static void main(String[] args) {
          System.out.println(add(1, 2));
          System.out.println(add(1.5, 2.5));
          System.out.println(add("Hello", "world"));
          System.out.println(add(1, 2, 3));
        }
      }
    `,
  },
  'java-methoden-parameter': {
    code: java`
      public class Main {
        static void change(int number, int[] array, String text) {
          number = 99;
          text = "changed";
          array[0] = 99;          // this one is visible outside!
        }

        // Varargs: any number of arguments, arrives as an array
        static int sum(int... numbers) {
          int total = 0;
          for (int n : numbers) total += n;
          return total;
        }

        public static void main(String[] args) {
          int number = 1;
          int[] array = {1};
          String text = "original";

          change(number, array, text);

          System.out.println(number);      // 1  - the method got a copy
          System.out.println(text);        // original
          System.out.println(array[0]);    // 99 - the copy pointed at the SAME array

          System.out.println(sum());
          System.out.println(sum(1, 2, 3, 4));
        }
      }
    `,
  },
  'java-methoden-static': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // static: called on the class
          System.out.println(MathHelper.square(5));

          // not static: needs an object first
          Counter counter = new Counter();
          counter.increase();
          counter.increase();
          System.out.println(counter.value());
        }
      }

      class MathHelper {
        static int square(int n) {
          return n * n;
        }
      }

      class Counter {
        private int count = 0;

        void increase() {
          count++;
        }

        int value() {
          return count;
        }
      }
    `,
  },
  'java-methoden-rekursion': {
    code: java`
      public class Main {
        static int factorial(int n) {
          if (n <= 1) return 1;            // the exit - never forget it
          return n * factorial(n - 1);     // the method calls itself
        }

        static int fibonacci(int n) {
          return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
        }

        public static void main(String[] args) {
          System.out.println(factorial(5));
          for (int i = 0; i < 8; i++) System.out.print(fibonacci(i) + " ");
          System.out.println();
        }
      }
    `,
  },
  'java-methoden-uebung': {
    tipps: {
      de: [
        'Die Signatur steht schon da: `static boolean isPrime(int number)` - du füllst nur den Rumpf.',
        'Zahlen kleiner als 2 sind keine Primzahlen: `if (number < 2) return false;`',
        'Prüfe alle Teiler von 2 bis `number / 2` (oder bis `i * i <= number`). Teilt einer glatt, ist es keine Primzahl.',
        '`countPrimes` ruft `isPrime` in einer Schleife auf und zählt die Treffer.',
      ],
      en: [
        'The signature is already there: `static boolean isPrime(int number)` - you only fill the body.',
        'Numbers below 2 are not prime: `if (number < 2) return false;`',
        'Check all divisors from 2 up to `number / 2` (or while `i * i <= number`). If one divides evenly, it is not prime.',
        '`countPrimes` calls `isPrime` in a loop and counts the hits.',
      ],
    },
    code: java`
      public class Main {
        static boolean isPrime(int number) {
          // Your code:
          return false;
        }

        static int countPrimes(int upTo) {
          // Your code:
          return 0;
        }

        public static void main(String[] args) {
          System.out.println(isPrime(7));
          System.out.println(countPrimes(20));
        }
      }
    `,
    loesung: java`
      public class Main {
        static boolean isPrime(int number) {
          if (number < 2) return false;
          for (int i = 2; i * i <= number; i++) {
            if (number % i == 0) return false;
          }
          return true;
        }

        static int countPrimes(int upTo) {
          int found = 0;
          for (int i = 2; i <= upTo; i++) {
            if (isPrime(i)) found++;
          }
          return found;
        }

        public static void main(String[] args) {
          System.out.println(isPrime(7));
          System.out.println(countPrimes(20));
        }
      }
    `,
    tests: [
      { name: { de: 'isPrime(7) ist true', en: 'isPrime(7) is true' }, ausdruck: 'isPrime(7)', erwartet: true },
      { name: { de: 'isPrime(9) ist false', en: 'isPrime(9) is false' }, ausdruck: 'isPrime(9)', erwartet: false },
      { name: { de: 'isPrime(2) ist true', en: 'isPrime(2) is true' }, ausdruck: 'isPrime(2)', erwartet: true },
      { name: { de: 'isPrime(1) ist false', en: 'isPrime(1) is false' }, ausdruck: 'isPrime(1)', erwartet: false },
      { name: { de: 'countPrimes(20) ist 8', en: 'countPrimes(20) is 8' }, ausdruck: 'countPrimes(20)', erwartet: 8 },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  signatur: java`
    static int doubled(int number) {
    //  ^     ^      ^      ^
    //  |     |      |      └── parameter: type and name
    //  |     |      └───────── name of the method
    //  |     └──────────────── return type (void = nothing)
    //  └────────────────────── belongs to the class, not to an object
  `,
  jsVergleich: java`
    // JavaScript: one name, anything goes
    function add(a, b) { return a + b }
    add(1, 2)            // 3
    add('1', 2)          // '12'  - nobody stops you
    add(1)               // NaN

    // Java: the types are part of the method
    static int add(int a, int b) { return a + b; }
    add(1, 2);           // 3
    add("1", 2);         // compile error
    add(1);              // compile error
  `,
}
