import { java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 6.9 - Exceptions. */

export const beispiele = {
  'java-fehler-einstieg': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          System.out.println("before");

          try {
            int result = 10 / 0;
            System.out.println("never reached: " + result);
          } catch (ArithmeticException e) {
            System.out.println("caught: " + e.getMessage());
          }

          System.out.println("after - the program keeps running");
        }
      }
    `,
  },
  'java-fehler-typen': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // The three you will meet most often:
          check(() -> {
            String text = null;
            text.length();
          });
          check(() -> {
            int[] numbers = new int[2];
            int value = numbers[5];
          });
          check(() -> Integer.parseInt("twelve"));
        }

        // A tiny helper so all three fit on one screen.
        static void check(Runnable action) {
          try {
            action.run();
          } catch (RuntimeException e) {
            System.out.println(e.getClass().getSimpleName() + ": " + e.getMessage());
          }
        }
      }
    `,
  },
  'java-fehler-finally': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          System.out.println(readAge("36"));
          System.out.println(readAge("old"));
        }

        static int readAge(String input) {
          try {
            return Integer.parseInt(input);          // may throw
          } catch (NumberFormatException e) {
            System.out.println("not a number: " + input);
            return -1;
          } finally {
            // runs ALWAYS - after return, after catch, even after throw.
            System.out.println("done with: " + input);
          }
        }
      }
    `,
  },
  'java-fehler-werfen': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          System.out.println(divide(10, 2));

          try {
            divide(10, 0);
          } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
          }

          // Several catch blocks: the first matching one wins.
          try {
            String text = null;
            System.out.println(text.length());
          } catch (NumberFormatException e) {
            System.out.println("a number problem");
          } catch (NullPointerException e) {
            System.out.println("something was null");
          } catch (Exception e) {
            System.out.println("anything else");
          }
        }

        static int divide(int a, int b) {
          if (b == 0) {
            throw new IllegalArgumentException("b must not be 0");
          }
          return a / b;
        }
      }
    `,
  },
  'java-fehler-eigene': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          Account account = new Account(100);

          try {
            account.withdraw(50);
            System.out.println("balance: " + account.getBalance());
            account.withdraw(500);
          } catch (InsufficientFundsException e) {
            System.out.println(e.getMessage());
            System.out.println("missing: " + e.getMissing());
          }
        }
      }

      // An exception of your own is just a class that extends RuntimeException.
      class InsufficientFundsException extends RuntimeException {
        private final int missing;

        InsufficientFundsException(String message, int missing) {
          super(message);
          this.missing = missing;
        }

        int getMissing() {
          return missing;
        }
      }

      class Account {
        private int balance;

        Account(int balance) {
          this.balance = balance;
        }

        int getBalance() {
          return balance;
        }

        void withdraw(int amount) {
          if (amount > balance) {
            throw new InsufficientFundsException("Not enough money for " + amount, amount - balance);
          }
          balance -= amount;
        }
      }
    `,
  },
  'java-fehler-ungefangen': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          System.out.println("start");
          level1();
          System.out.println("never printed");
        }

        static void level1() {
          level2();
        }

        static void level2() {
          throw new IllegalStateException("something went wrong down here");
        }
      }
    `,
  },
  'java-fehler-uebung': {
    tipps: {
      de: [
        '`parseOrDefault` umschließt `Integer.parseInt(text)` mit `try { … } catch (NumberFormatException e) { … }`.',
        'Im catch-Block gibst du einfach `fallback` zurück.',
        '`validateAge` wirft mit `throw new IllegalArgumentException("…");` - und gibt sonst nichts zurück (void).',
        'Denk an beide Grenzen: kleiner als 0 und größer als 130.',
      ],
      en: [
        '`parseOrDefault` wraps `Integer.parseInt(text)` in `try { … } catch (NumberFormatException e) { … }`.',
        'Inside the catch block simply return `fallback`.',
        '`validateAge` throws with `throw new IllegalArgumentException("…");` - and returns nothing otherwise (void).',
        'Remember both limits: below 0 and above 130.',
      ],
    },
    code: java`
      public class Main {
        static int parseOrDefault(String text, int fallback) {
          // Your code:
          return 0;
        }

        static void validateAge(int age) {
          // Your code:
        }

        public static void main(String[] args) {
          System.out.println(parseOrDefault("42", 0));
          System.out.println(parseOrDefault("x", -1));
        }
      }
    `,
    loesung: java`
      public class Main {
        static int parseOrDefault(String text, int fallback) {
          try {
            return Integer.parseInt(text);
          } catch (NumberFormatException e) {
            return fallback;
          }
        }

        static void validateAge(int age) {
          if (age < 0) {
            throw new IllegalArgumentException("Age must not be negative: " + age);
          }
          if (age > 130) {
            throw new IllegalArgumentException("Age is unrealistic: " + age);
          }
        }

        public static void main(String[] args) {
          System.out.println(parseOrDefault("42", 0));
          System.out.println(parseOrDefault("x", -1));
        }
      }
    `,
    tests: [
      {
        name: { de: 'parseOrDefault("42", 0) ist 42', en: 'parseOrDefault("42", 0) is 42' },
        ausdruck: 'parseOrDefault("42", 0)',
        erwartet: 42,
      },
      {
        name: { de: 'parseOrDefault("abc", 7) ist 7', en: 'parseOrDefault("abc", 7) is 7' },
        ausdruck: 'parseOrDefault("abc", 7)',
        erwartet: 7,
      },
      {
        name: { de: 'validateAge(30) wirft nicht', en: 'validateAge(30) does not throw' },
        ausdruck: 'Check.validate(30)',
        erwartet: 'ok',
      },
      {
        name: { de: 'validateAge(-1) wirft IllegalArgumentException', en: 'validateAge(-1) throws IllegalArgumentException' },
        ausdruck: 'Check.validate(-1)',
        erwartet: 'threw',
      },
      {
        name: { de: 'validateAge(200) wirft IllegalArgumentException', en: 'validateAge(200) throws IllegalArgumentException' },
        ausdruck: 'Check.validate(200)',
        erwartet: 'threw',
      },
    ],
    // Unsichtbare Hilfsklasse: Ein Test ist ein einzelner Ausdruck - try/catch
    // passt da nicht hinein, also steht es hier.
    vorbereitung: java`
      class Check {
        static String validate(int age) {
          try {
            Main.validateAge(age);
            return "ok";
          } catch (IllegalArgumentException e) {
            return "threw";
          }
        }
      }
    `,
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  aufbau: java`
    try {
      // code that may go wrong
    } catch (SpecificException e) {
      // plan B for exactly this case
    } catch (Exception e) {
      // safety net for everything else
    } finally {
      // always runs - even after a return
    }
  `,
  hierarchie: java`
    Throwable
    ├── Error                       (the JVM is broken - do not catch)
    │   └── StackOverflowError
    └── Exception
        ├── IOException             checked   → must be handled
        └── RuntimeException        unchecked → may be handled
            ├── NullPointerException
            ├── IllegalArgumentException
            ├── ArithmeticException
            └── ArrayIndexOutOfBoundsException
  `,
  checked: java`
    // checked: the compiler insists on a reaction
    void read() throws IOException {      // … pass it on
      Files.readString(path);
    }

    void read() {                         // … or handle it
      try {
        Files.readString(path);
      } catch (IOException e) { … }
    }

    // unchecked: up to you
    int n = Integer.parseInt(text);       // may throw NumberFormatException
  `,
  jsVergleich: java`
    // JavaScript: one catch for everything, you check the type yourself
    try { … } catch (e) {
      if (e instanceof TypeError) { … }
    }

    // Java: one catch per type - the compiler knows what you catch
    try { … }
    catch (NumberFormatException e) { … }
    catch (IOException e) { … }
  `,
}
