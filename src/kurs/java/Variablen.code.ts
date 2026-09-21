import { java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 6.2 - Typen & Variablen. */

export const beispiele = {
  'java-variablen-einstieg': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          int age = 36;
          double height = 1.72;
          boolean isAdult = true;
          char grade = 'A';
          String name = "Ada";

          System.out.println(name + ", " + age + ", " + height + ", " + isAdult + ", " + grade);
        }
      }
    `,
  },
  'java-variablen-typen': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // Whole numbers - they differ only in size:
          byte small = 100;                  //        -128 …        127
          short medium = 30000;              //     -32 768 …     32 767
          int normal = 2000000000;           // -2 147 483 648 … 2 147 483 647
          long big = 9000000000L;            // much larger - note the L!

          // Decimals:
          float lessPrecise = 1.5f;          // note the f
          double precise = 1.5;              // the normal choice

          // The rest:
          boolean yes = true;                // only true or false
          char letter = 'J';                 // exactly ONE character, single quotes

          System.out.println(small + " " + medium + " " + normal + " " + big);
          System.out.println(lessPrecise + " " + precise);
          System.out.println(yes + " " + letter);

          // Limits are known - and reachable:
          System.out.println(Integer.MAX_VALUE);
          System.out.println(Integer.MAX_VALUE + 1);   // overflow, no error!
        }
      }
    `,
  },
  'java-variablen-division': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          System.out.println(7 / 2);        // both int → the rest is cut off
          System.out.println(7 % 2);        // remainder
          System.out.println(7 / 2.0);      // one double → double
          System.out.println((double) 7 / 2);

          int a = 10;
          int b = 4;
          System.out.println(a / b);               // 2
          System.out.println((double) a / b);      // 2.5
          System.out.println(1.0 * a / b);         // 2.5

          // Decimals are not exact - in every language:
          System.out.println(0.1 + 0.2);
        }
      }
    `,
  },
  'java-variablen-casting': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // Widening: always allowed, nothing gets lost
          int whole = 42;
          double asDecimal = whole;
          System.out.println(asDecimal);

          // Narrowing: only with an explicit cast - and it cuts off
          double price = 19.99;
          int euros = (int) price;
          System.out.println(euros);

          // char is a number in disguise
          char letter = 'A';
          int code = letter;
          System.out.println(code);
          System.out.println((char) (code + 2));

          // Text to number and back
          int fromText = Integer.parseInt("123");
          String asText = String.valueOf(456);
          System.out.println(fromText + 1);
          System.out.println(asText + 1);
        }
      }
    `,
  },
  'java-variablen-final': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          final double TAX = 0.19;
          int price = 100;
          price = price + 10;                 // fine, price is not final
          System.out.println(price * (1 + TAX));

          // TAX = 0.2;                       // remove the // → compile error

          // var: the compiler works out the type - but it stays fixed
          var count = 5;                      // int
          var label = "items";                // String
          System.out.println(count + " " + label);
        }
      }
    `,
  },
  'java-variablen-fehler': {
    // Absicht: zeigt, was der Compiler bei falschen Typen meldet.
    code: java`
      public class Main {
        public static void main(String[] args) {
          int count = "three";
          System.out.println(count);
        }
      }
    `,
  },
  'java-variablen-uebung': {
    tipps: {
      de: [
        'Der Preis hat Nachkommastellen - `double`. Die Stückzahl ist eine ganze Zahl - `int`.',
        '`total` ist `pricePerItem * items`. Weil ein `double` beteiligt ist, wird das Ergebnis automatisch `double`.',
        'Für die halbe Stückzahl brauchst du eine Kommazahl: `items / 2.0` (nicht `items / 2`).',
        '`Math.round(x)` rundet kaufmännisch und liefert eine ganze Zahl.',
      ],
      en: [
        'The price has decimals - `double`. The count is a whole number - `int`.',
        '`total` is `pricePerItem * items`. Because a `double` is involved, the result is a `double` automatically.',
        'For half the count you need a decimal: `items / 2.0` (not `items / 2`).',
        '`Math.round(x)` rounds to the nearest whole number.',
      ],
    },
    code: java`
      public class Main {
        public static void main(String[] args) {
          // Given:
          int items = 7;
          double pricePerItem = 2.5;

          // Your code:

        }
      }
    `,
    loesung: java`
      public class Main {
        public static void main(String[] args) {
          // Given:
          int items = 7;
          double pricePerItem = 2.5;

          double total = items * pricePerItem;
          double half = items / 2.0;
          long rounded = Math.round(total);

          System.out.println(total);
          System.out.println(half);
          System.out.println(rounded);
        }
      }
    `,
    tests: [
      { name: { de: 'total ist 17.5', en: 'total is 17.5' }, ausdruck: 'total', erwartet: 17.5 },
      { name: { de: 'half ist 3.5 (nicht 3)', en: 'half is 3.5 (not 3)' }, ausdruck: 'half', erwartet: 3.5 },
      { name: { de: 'rounded ist 18', en: 'rounded is 18' }, ausdruck: 'rounded', erwartet: 18 },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  deklaration: java`
    int age = 36;
    //  ^    ^    ^
    //  |    |    └── the value
    //  |    └─────── the name
    //  └──────────── the type - it comes BEFORE the name and never changes
  `,
  jsVergleich: java`
    // JavaScript: the type belongs to the value and may change anytime
    let age = 36
    age = 'thirty-six'        // allowed

    // Java: the type belongs to the variable
    int age = 36;
    age = "thirty-six";       // error: incompatible types
  `,
  wrapper: java`
    int primitive = 5;            // a value, not an object
    Integer object = 5;           // an object (autoboxing does this for you)

    // Why it matters: only objects can be null
    Integer maybe = null;         // allowed
    // int never = null;          // error
  `,
}
