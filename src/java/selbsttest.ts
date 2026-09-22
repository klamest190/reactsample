/**
 * Selbsttest der Java-Laufzeit - die Fälle.
 *
 *   npm run test:java
 *
 * Jeder Fall ist ein kleines Java-Programm mit der Ausgabe, die echtes Java
 * dafür liefern würde. Wenn hier alles grün ist, verhalten sich die Beispiele
 * im Kurs so, wie es in einer echten JVM wäre.
 */

import { javaAusfuehren, type JavaTest } from './index'

type Fall = { name: string; code: string; erwartet: string[]; tests?: JavaTest[] }

/** Kurzform: nur der Rumpf von main. */
const main = (rumpf: string) => `public class Main {\n  public static void main(String[] args) {\n${rumpf}\n  }\n}`

const faelle: Fall[] = [
  // --- Optional (used a lot with Spring Data in part 8) -----------------------
  {
    name: 'Optional: orElse, orElseGet and orElseThrow with a supplier',
    code: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Optional<String> empty = Optional.empty();
    System.out.println(empty.orElse("fallback"));
    System.out.println(empty.orElseGet(() -> "computed"));
    System.out.println(Optional.of("Ada").orElseThrow());
    try {
      empty.orElseThrow(() -> new IllegalStateException("nothing here"));
    } catch (IllegalStateException e) {
      System.out.println("caught: " + e.getMessage());
    }
  }
}`,
    erwartet: ['fallback', 'computed', 'Ada', 'caught: nothing here'],
  },
  // --- Zahlen und Typen ----------------------------------------------------
  {
    name: 'int-Division schneidet ab',
    code: main('    System.out.println(7 / 2);\n    System.out.println(7 % 2);\n    System.out.println(7 / 2.0);'),
    erwartet: ['3', '1', '3.5'],
  },
  {
    name: 'double druckt immer mit Punkt',
    code: main('    double d = 5;\n    System.out.println(d);\n    System.out.println(0.1 + 0.2);\n    System.out.println(1.0 / 0);'),
    erwartet: ['5.0', '0.30000000000000004', 'Infinity'],
  },
  {
    name: 'int läuft über',
    code: main('    int max = Integer.MAX_VALUE;\n    System.out.println(max + 1);'),
    erwartet: ['-2147483648'],
  },
  {
    name: 'char rechnet als Zahl',
    code: main("    char c = 'A';\n    System.out.println(c);\n    System.out.println((int) c);\n    System.out.println((char) (c + 1));\n    System.out.println(c + 1);"),
    erwartet: ['A', '65', 'B', '66'],
  },
  {
    name: 'Casting und Rundung',
    code: main('    double d = 3.99;\n    System.out.println((int) d);\n    System.out.println(Math.round(d));\n    System.out.println(Math.floor(d));'),
    erwartet: ['3', '4', '3.0'],
  },
  {
    name: 'Division durch null wirft',
    code: main('    System.out.println(5 / 0);'),
    erwartet: ['Exception in thread "main" java.lang.ArithmeticException: / by zero', '   at Main.java:3'],
  },
  {
    name: 'Integer.parseInt und NumberFormatException',
    code: main('    System.out.println(Integer.parseInt("42") + 1);\n    try {\n      Integer.parseInt("x");\n    } catch (NumberFormatException e) {\n      System.out.println("Fehler: " + e.getMessage());\n    }'),
    erwartet: ['43', 'Fehler: For input string: "x"'],
  },

  // --- Strings -------------------------------------------------------------
  {
    name: 'String-Methoden',
    code: main('    String s = "  Hallo Java  ";\n    System.out.println(s.trim().toUpperCase());\n    System.out.println(s.contains("Java"));\n    System.out.println("abc".charAt(1));\n    System.out.println("a,b,c".split(",").length);'),
    erwartet: ['HALLO JAVA', 'true', 'b', '3'],
  },
  {
    name: '== vergleicht bei Strings die Identität',
    code: main('    String a = "hi";\n    String b = "hi";\n    String c = new String("hi");\n    System.out.println(a == b);\n    System.out.println(a == c);\n    System.out.println(a.equals(c));'),
    erwartet: ['true', 'false', 'true'],
  },
  {
    name: 'String.format und printf',
    code: main('    System.out.printf("%s ist %d Jahre alt%n", "Ada", 36);\n    System.out.println(String.format("%.2f", 3.14159));\n    System.out.printf("[%5d][%-5s]%n", 42, "x");'),
    erwartet: ['Ada ist 36 Jahre alt', '3.14', '[   42][x    ]'],
  },
  {
    name: 'StringBuilder',
    code: main('    StringBuilder sb = new StringBuilder();\n    sb.append("a").append(1).append(true);\n    System.out.println(sb.toString());\n    System.out.println(sb.length());'),
    erwartet: ['a1true', '6'],
  },

  // --- Kontrollfluss -------------------------------------------------------
  {
    name: 'if / else / ternär',
    code: main('    int n = 7;\n    if (n % 2 == 0) System.out.println("gerade");\n    else System.out.println("ungerade");\n    System.out.println(n > 5 ? "groß" : "klein");'),
    erwartet: ['ungerade', 'groß'],
  },
  {
    name: 'switch klassisch mit Durchfallen',
    code: main('    int tag = 6;\n    switch (tag) {\n      case 6:\n      case 7:\n        System.out.println("Wochenende");\n        break;\n      default:\n        System.out.println("Arbeitstag");\n    }'),
    erwartet: ['Wochenende'],
  },
  {
    name: 'switch als Ausdruck',
    code: main('    int tag = 3;\n    String name = switch (tag) {\n      case 1, 2, 3, 4, 5 -> "Arbeitstag";\n      default -> "Wochenende";\n    };\n    System.out.println(name);'),
    erwartet: ['Arbeitstag'],
  },
  {
    name: 'Schleifen',
    code: main('    int summe = 0;\n    for (int i = 1; i <= 5; i++) summe += i;\n    System.out.println(summe);\n    int k = 3;\n    while (k > 0) { System.out.print(k + " "); k--; }\n    System.out.println();\n    do { System.out.println("einmal"); } while (false);'),
    erwartet: ['15', '3 2 1 ', 'einmal'],
  },
  {
    name: 'break und continue',
    code: main('    for (int i = 0; i < 10; i++) {\n      if (i % 2 == 0) continue;\n      if (i > 6) break;\n      System.out.print(i);\n    }\n    System.out.println();'),
    erwartet: ['135'],
  },

  // --- Arrays --------------------------------------------------------------
  {
    name: 'Arrays: feste Länge, Standardwerte',
    code: main('    int[] zahlen = new int[3];\n    zahlen[0] = 5;\n    System.out.println(zahlen.length);\n    System.out.println(zahlen[1]);\n    System.out.println(Arrays.toString(zahlen));\n    String[] namen = new String[2];\n    System.out.println(namen[0]);'),
    erwartet: ['3', '0', '[5, 0, 0]', 'null'],
  },
  {
    name: 'ArrayIndexOutOfBounds',
    code: main('    int[] a = {1, 2};\n    System.out.println(a[2]);'),
    erwartet: ['Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 2 out of bounds for length 2', '   at Main.java:4'],
  },
  {
    name: 'Array-Literale in allen Schreibweisen',
    code: main(
      '    int[] a = {1, 2};\n' +
        '    int[] b = new int[]{3, 4};\n' +
        '    int[] c = new int[2];\n' +
        '    int[] leer = new int[0];\n' +
        '    System.out.println(Arrays.toString(a) + Arrays.toString(b) + Arrays.toString(c) + leer.length);',
    ),
    erwartet: ['[1, 2][3, 4][0, 0]0'],
  },
  {
    name: 'for-each und zweidimensionale Arrays',
    code: main('    int[][] gitter = {{1, 2}, {3, 4}};\n    int summe = 0;\n    for (int[] reihe : gitter) for (int wert : reihe) summe += wert;\n    System.out.println(summe);\n    System.out.println(Arrays.deepToString(gitter));'),
    erwartet: ['10', '[[1, 2], [3, 4]]'],
  },
  {
    name: 'Array ohne Arrays.toString',
    code: main('    int[] a = {1};\n    String s = "" + a;\n    System.out.println(s.startsWith("[I@"));'),
    erwartet: ['true'],
  },

  // --- Methoden ------------------------------------------------------------
  {
    name: 'Methoden, Überladung und Rekursion',
    code: `public class Main {
  static int verdoppeln(int n) { return n * 2; }
  static String verdoppeln(String s) { return s + s; }
  static int fakultaet(int n) { return n <= 1 ? 1 : n * fakultaet(n - 1); }
  static int summe(int... zahlen) {
    int s = 0;
    for (int z : zahlen) s += z;
    return s;
  }
  public static void main(String[] args) {
    System.out.println(verdoppeln(21));
    System.out.println(verdoppeln("ab"));
    System.out.println(fakultaet(5));
    System.out.println(summe(1, 2, 3));
  }
}`,
    erwartet: ['42', 'abab', '120', '6'],
  },
  {
    name: 'Parameter sind Kopien',
    code: `public class Main {
  static void aendern(int zahl, int[] array) {
    zahl = 99;
    array[0] = 99;
  }
  public static void main(String[] args) {
    int zahl = 1;
    int[] array = {1};
    aendern(zahl, array);
    System.out.println(zahl + " " + array[0]);
  }
}`,
    erwartet: ['1 99'],
  },

  // --- Klassen -------------------------------------------------------------
  {
    name: 'Klasse mit Konstruktor, Getter und toString',
    code: `public class Main {
  public static void main(String[] args) {
    Person p = new Person("Ada", 36);
    System.out.println(p.getName());
    p.setAlter(37);
    System.out.println(p);
    System.out.println(new Person("Ada", 37).equals(p));
  }
}
class Person {
  private String name;
  private int alter;
  public Person(String name, int alter) {
    this.name = name;
    this.alter = alter;
  }
  public String getName() { return name; }
  public void setAlter(int alter) { this.alter = alter; }
  @Override
  public String toString() { return name + " (" + alter + ")"; }
}`,
    erwartet: ['Ada', 'Ada (37)', 'false'],
  },
  {
    name: 'static zählt für die ganze Klasse',
    code: `public class Main {
  static int anzahl = 0;
  static class Ding {
    Ding() { anzahl++; }
  }
  public static void main(String[] args) {
    new Ding();
    new Ding();
    System.out.println(anzahl);
  }
}`,
    erwartet: ['2'],
  },
  {
    name: 'Felder haben Standardwerte',
    code: `public class Main {
  static class Leer {
    int zahl;
    String text;
    boolean flagge;
  }
  public static void main(String[] args) {
    Leer l = new Leer();
    System.out.println(l.zahl + " " + l.text + " " + l.flagge);
  }
}`,
    erwartet: ['0 null false'],
  },
  {
    name: 'NullPointerException',
    code: main('    String s = null;\n    System.out.println(s.length());'),
    erwartet: [
      'Exception in thread "main" java.lang.NullPointerException: Cannot invoke "length()" because the value is null',
      '   at Main.java:4',
    ],
  },

  // --- Vererbung -----------------------------------------------------------
  {
    name: 'Vererbung, super und Polymorphie',
    code: `public class Main {
  public static void main(String[] args) {
    Tier[] tiere = { new Hund("Rex"), new Katze("Mimi") };
    for (Tier t : tiere) System.out.println(t.sagHallo());
    System.out.println(tiere[0] instanceof Tier);
  }
}
abstract class Tier {
  protected String name;
  Tier(String name) { this.name = name; }
  abstract String laut();
  String sagHallo() { return name + " sagt " + laut(); }
}
class Hund extends Tier {
  Hund(String name) { super(name); }
  @Override
  String laut() { return "Wuff"; }
}
class Katze extends Tier {
  Katze(String name) { super(name); }
  @Override
  String laut() { return "Miau"; }
  @Override
  String sagHallo() { return super.sagHallo() + "!"; }
}`,
    erwartet: ['Rex sagt Wuff', 'Mimi sagt Miau!', 'true'],
  },
  {
    name: 'Interface mit default-Methode',
    code: `public class Main {
  public static void main(String[] args) {
    Fahrzeug f = new Auto();
    System.out.println(f.beschreibung());
    System.out.println(f instanceof Fahrzeug);
  }
}
interface Fahrzeug {
  int raeder();
  default String beschreibung() { return "Fahrzeug mit " + raeder() + " Rädern"; }
}
class Auto implements Fahrzeug {
  public int raeder() { return 4; }
}`,
    erwartet: ['Fahrzeug mit 4 Rädern', 'true'],
  },
  {
    name: 'enum mit Feld und switch',
    code: `public class Main {
  enum Ampel {
    ROT("Halt"), GRUEN("Fahr");
    private final String text;
    Ampel(String text) { this.text = text; }
    String text() { return text; }
  }
  public static void main(String[] args) {
    for (Ampel a : Ampel.values()) System.out.println(a + " = " + a.text() + " (" + a.ordinal() + ")");
    Ampel jetzt = Ampel.ROT;
    switch (jetzt) {
      case ROT -> System.out.println("stehen");
      case GRUEN -> System.out.println("gehen");
    }
  }
}`,
    erwartet: ['ROT = Halt (0)', 'GRUEN = Fahr (1)', 'stehen'],
  },
  {
    name: 'record',
    code: `public class Main {
  record Punkt(int x, int y) {}
  public static void main(String[] args) {
    Punkt p = new Punkt(1, 2);
    System.out.println(p);
    System.out.println(p.x() + p.y());
    System.out.println(p.equals(new Punkt(1, 2)));
  }
}`,
    erwartet: ['Punkt[x=1, y=2]', '3', 'true'],
  },

  // --- Collections ---------------------------------------------------------
  {
    name: 'ArrayList',
    code: main(
      '    ArrayList<String> namen = new ArrayList<>();\n' +
        '    namen.add("Ada");\n' +
        '    namen.add("Grace");\n' +
        '    namen.add(0, "Alan");\n' +
        '    System.out.println(namen);\n' +
        '    System.out.println(namen.size() + " " + namen.get(1) + " " + namen.contains("Ada"));\n' +
        '    namen.remove("Alan");\n' +
        '    for (String n : namen) System.out.print(n + " ");\n' +
        '    System.out.println();',
    ),
    erwartet: ['[Alan, Ada, Grace]', '3 Ada true', 'Ada Grace '],
  },
  {
    name: 'HashMap',
    code: main(
      '    Map<String, Integer> punkte = new HashMap<>();\n' +
        '    punkte.put("Ada", 10);\n' +
        '    punkte.put("Alan", 7);\n' +
        '    punkte.put("Ada", 12);\n' +
        '    System.out.println(punkte.get("Ada"));\n' +
        '    System.out.println(punkte.getOrDefault("Nix", 0));\n' +
        '    System.out.println(punkte.size());\n' +
        '    for (String name : punkte.keySet()) System.out.print(name + " ");\n' +
        '    System.out.println();',
    ),
    erwartet: ['12', '0', '2', 'Ada Alan '],
  },
  {
    name: 'Autoboxing und List.of',
    code: main(
      '    List<Integer> zahlen = List.of(3, 1, 2);\n' +
        '    List<Integer> kopie = new ArrayList<>(zahlen);\n' +
        '    Collections.sort(kopie);\n' +
        '    System.out.println(kopie);\n' +
        '    int summe = 0;\n' +
        '    for (int z : kopie) summe += z;\n' +
        '    System.out.println(summe);',
    ),
    erwartet: ['[1, 2, 3]', '6'],
  },
  {
    name: 'Lambdas und Streams',
    code: main(
      '    List<String> namen = new ArrayList<>(List.of("Ada", "Alan", "Grace"));\n' +
        '    namen.forEach(n -> System.out.print(n.charAt(0)));\n' +
        '    System.out.println();\n' +
        '    List<String> kurz = namen.stream().filter(n -> n.length() <= 3).map(String::toUpperCase).toList();\n' +
        '    System.out.println(kurz);\n' +
        '    System.out.println(namen.stream().mapToInt(String::length).sum());',
    ),
    erwartet: ['AAG', '[ADA]', '12'],
  },

  // --- Exceptions ----------------------------------------------------------
  {
    name: 'try / catch / finally',
    code: main(
      '    try {\n' +
        '      int[] a = new int[1];\n' +
        '      a[5] = 1;\n' +
        '    } catch (ArrayIndexOutOfBoundsException e) {\n' +
        '      System.out.println("gefangen: " + e.getMessage());\n' +
        '    } finally {\n' +
        '      System.out.println("finally läuft immer");\n' +
        '    }',
    ),
    erwartet: ['gefangen: Index 5 out of bounds for length 1', 'finally läuft immer'],
  },
  {
    name: 'Eigene Exception',
    code: `public class Main {
  static class ZuJungException extends RuntimeException {
    ZuJungException(String meldung) { super(meldung); }
  }
  static void pruefen(int alter) {
    if (alter < 18) throw new ZuJungException("Erst ab 18, nicht mit " + alter);
    System.out.println("ok");
  }
  public static void main(String[] args) {
    try {
      pruefen(16);
    } catch (RuntimeException e) {
      System.out.println(e.getMessage());
      System.out.println(e instanceof ZuJungException);
    }
  }
}`,
    erwartet: ['Erst ab 18, nicht mit 16', 'true'],
  },

  // --- Der Prüfer (Kompilierfehler) ----------------------------------------
  {
    name: 'Typfehler wird VOR dem Lauf gemeldet',
    code: main('    int zahl = "drei";\n    System.out.println("läuft nie");'),
    erwartet: [
      'Main.java:3: error: incompatible types: String cannot be converted to int',
      '   String passt nicht in eine Variable vom Typ int. In Java muss der Typ genau stimmen - anders als in JavaScript.',
      '1 Fehler - das Programm wurde nicht gestartet.',
    ],
  },
  {
    name: 'Unbekannte Variable',
    code: main('    System.out.println(nichtDa);'),
    erwartet: [
      'Main.java:3: error: cannot find symbol: variable nichtDa',
      '   Die Variable `nichtDa` ist hier nicht bekannt. Wurde sie deklariert (z. B. `int nichtDa = …;`) - und steht sie im selben Block?',
      '1 Fehler - das Programm wurde nicht gestartet.',
    ],
  },
  {
    name: 'if braucht boolean',
    code: main('    int n = 1;\n    if (n) System.out.println("nie");'),
    erwartet: [
      'Main.java:4: error: incompatible types: int cannot be converted to boolean',
      '   Eine Bedingung muss in Java ein `boolean` sein, nicht int. In JavaScript wäre das „truthy“ - in Java ein Fehler.',
      '1 Fehler - das Programm wurde nicht gestartet.',
    ],
  },
  {
    name: 'Fehlendes return',
    code: `public class Main {
  static int verdoppeln(int n) {
    int e = n * 2;
  }
  public static void main(String[] args) { System.out.println(verdoppeln(2)); }
}`,
    erwartet: [
      'Main.java:2: error: missing return statement',
      '   Die Methode `verdoppeln` verspricht ein int zurückzugeben, tut es aber nie. Fehlt ein `return`?',
      '1 Fehler - das Programm wurde nicht gestartet.',
    ],
  },
  {
    name: 'Syntaxfehler: fehlendes Semikolon',
    code: main('    int a = 1\n    int b = 2;'),
    erwartet: ["Main.java:4: error: ';' expected, found 'int'"],
  },
  {
    name: 'Endlosschleife wird abgebrochen',
    code: main('    while (true) { int x = 1; }'),
    erwartet: ['Das Programm läuft zu lange - vermutlich eine Endlosschleife.'],
  },

  // --- Tests der Übungen ---------------------------------------------------
  {
    name: 'Testausdrücke greifen auf main zu',
    code: main('    int summe = 2 + 3;\n    String gruss = "Hi";'),
    erwartet: [],
    tests: [
      { name: 'summe ist 5', ausdruck: 'summe', erwartet: 5 },
      { name: 'gruss ist "Hi"', ausdruck: 'gruss', erwartet: 'Hi' },
    ],
  },
  {
    name: 'Testausdrücke rufen Methoden auf',
    code: `public class Main {
  static int addiere(int a, int b) { return a + b; }
  public static void main(String[] args) { System.out.println(addiere(1, 1)); }
}`,
    erwartet: ['2'],
    tests: [
      { name: 'addiere(2, 3) ist 5', ausdruck: 'addiere(2, 3)', erwartet: 5 },
      { name: 'Ausgabe enthält 2', ausdruck: 'output.contains("2")', erwartet: true },
    ],
  },
]


// ---------------------------------------------------------------------------

export type LaufzeitErgebnis = { name: string; ok: boolean; meldung: string }

/**
 * Führt alle Fälle aus. Läuft ohne DOM und ohne React - deshalb sowohl auf der
 * Kommandozeile (scripts/java-testen.ts) als auch in der Selbsttest-Seite.
 */
export function javaLaufzeitPruefen(): LaufzeitErgebnis[] {
  return faelle.map((fall) => {
    const lauf = javaAusfuehren(fall.code, { sprache: 'de', tests: fall.tests })
    const bekommen = lauf.zeilen.map((z) => z.text)
    const testFehler = (lauf.ergebnisse ?? []).filter((e) => !e.ok)

    if (bekommen.length !== fall.erwartet.length || bekommen.some((z, i) => z !== fall.erwartet[i])) {
      return {
        name: fall.name,
        ok: false,
        meldung: `erwartet ${JSON.stringify(fall.erwartet)}, bekommen ${JSON.stringify(bekommen)}`,
      }
    }
    if (testFehler.length) {
      return { name: fall.name, ok: false, meldung: testFehler.map((e) => `„${e.name}“: ${e.meldung}`).join(' · ') }
    }
    return { name: fall.name, ok: true, meldung: '' }
  })
}
