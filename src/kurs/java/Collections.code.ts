import { java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 7.8 - Collections & Generics. */

export const beispiele = {
  'java-collections-einstieg': {
    code: java`
      import java.util.ArrayList;
      import java.util.List;

      public class Main {
        public static void main(String[] args) {
          List<String> names = new ArrayList<>();

          names.add("Ada");
          names.add("Alan");
          names.add("Grace");

          System.out.println(names);
          System.out.println(names.size());
          System.out.println(names.get(0));
          System.out.println(names.contains("Alan"));

          names.remove("Alan");
          for (String name : names) {
            System.out.println(name);
          }
        }
      }
    `,
  },
  'java-collections-liste': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          List<Integer> numbers = new ArrayList<>();
          numbers.add(3);
          numbers.add(1);
          numbers.add(2);

          numbers.add(0, 99);                 // insert at a position
          System.out.println(numbers);

          numbers.set(0, 0);                  // replace
          System.out.println(numbers.indexOf(2));
          System.out.println(numbers.isEmpty());

          Collections.sort(numbers);
          System.out.println(numbers);

          numbers.removeIf(n -> n > 2);       // remove everything matching
          System.out.println(numbers);

          // A fixed list without new:
          List<String> fixed = List.of("a", "b");
          System.out.println(fixed);
        }
      }
    `,
  },
  'java-collections-generics': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // <String> is the promise: only strings go in, only strings come out.
          List<String> words = new ArrayList<>();
          words.add("hello");
          // words.add(42);                 ← compile error, and that is the point

          String first = words.get(0);      // no cast needed
          System.out.println(first.toUpperCase());

          // Collections hold objects, never primitives:
          List<Integer> numbers = new ArrayList<>();
          numbers.add(1);                   // int → Integer happens automatically
          int back = numbers.get(0);        // and back again
          System.out.println(back + 1);

          // Nested generics are read from the outside in:
          List<List<String>> table = new ArrayList<>();
          table.add(List.of("a", "b"));
          System.out.println(table);
        }
      }
    `,
  },
  'java-collections-map': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          Map<String, Integer> scores = new HashMap<>();

          scores.put("Ada", 10);
          scores.put("Alan", 7);
          scores.put("Ada", 12);              // same key → replaced

          System.out.println(scores.get("Ada"));
          System.out.println(scores.get("Nobody"));            // null!
          System.out.println(scores.getOrDefault("Nobody", 0)); // better
          System.out.println(scores.containsKey("Alan"));
          System.out.println(scores.size());

          // Walking a map:
          for (String name : scores.keySet()) {
            System.out.println(name + " → " + scores.get(name));
          }

          // Counting - the classic use:
          Map<String, Integer> counter = new HashMap<>();
          for (String word : "a b a c a".split(" ")) {
            counter.put(word, counter.getOrDefault(word, 0) + 1);
          }
          System.out.println(counter);
        }
      }
    `,
  },
  'java-collections-set': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          Set<String> tags = new HashSet<>();
          System.out.println(tags.add("java"));
          System.out.println(tags.add("java"));     // false - already there
          tags.add("react");

          System.out.println(tags.size());
          System.out.println(tags.contains("java"));

          // Removing duplicates in one line:
          List<String> withDuplicates = List.of("a", "b", "a", "c", "b");
          Set<String> unique = new HashSet<>(withDuplicates);
          System.out.println(unique.size());
        }
      }
    `,
  },
  'java-collections-streams': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          List<String> names = new ArrayList<>(List.of("Ada", "Alan", "Grace", "Linus"));

          // Lambda: (parameters) -> expression, like an arrow function
          names.forEach(name -> System.out.println("Hi " + name));

          // Streams: Java's answer to map/filter/reduce
          List<String> shortNames = names.stream()
              .filter(name -> name.length() <= 4)
              .map(String::toUpperCase)
              .toList();
          System.out.println(shortNames);

          int totalLength = names.stream()
              .mapToInt(String::length)
              .sum();
          System.out.println(totalLength);

          System.out.println(names.stream().anyMatch(n -> n.startsWith("G")));

          names.sort((a, b) -> a.length() - b.length());
          System.out.println(names);
        }
      }
    `,
  },
  'java-collections-uebung': {
    tipps: {
      de: [
        '`text.split(" ")` liefert die Wörter. Laufe mit einer erweiterten for-Schleife darüber.',
        'Für die Zählung: `counts.put(word, counts.getOrDefault(word, 0) + 1);`',
        '`counts.keySet()` sind alle Wörter, `counts.get(word)` die Anzahl.',
        'Für das häufigste Wort merkst du dir beim Durchlaufen das bisherige Maximum.',
      ],
      en: [
        '`text.split(" ")` gives you the words. Walk over them with an enhanced for loop.',
        'For counting: `counts.put(word, counts.getOrDefault(word, 0) + 1);`',
        '`counts.keySet()` are all words, `counts.get(word)` the count.',
        'For the most frequent word, track the maximum so far while walking.',
      ],
    },
    code: java`
      public class Main {
        public static void main(String[] args) {
          String text = "java is fun and java is fast";
          Map<String, Integer> counts = new HashMap<>();

          // Your code:

          System.out.println(counts);
        }
      }
    `,
    loesung: java`
      public class Main {
        public static void main(String[] args) {
          String text = "java is fun and java is fast";
          Map<String, Integer> counts = new HashMap<>();

          for (String word : text.split(" ")) {
            counts.put(word, counts.getOrDefault(word, 0) + 1);
          }

          String mostCommon = "";
          int highest = 0;
          for (String word : counts.keySet()) {
            if (counts.get(word) > highest) {
              highest = counts.get(word);
              mostCommon = word;
            }
          }

          System.out.println(counts);
          System.out.println(mostCommon + ": " + highest);
        }
      }
    `,
    tests: [
      { name: { de: '"java" kommt 2-mal vor', en: '"java" appears 2 times' }, ausdruck: 'counts.get("java")', erwartet: 2 },
      { name: { de: '"fun" kommt 1-mal vor', en: '"fun" appears 1 time' }, ausdruck: 'counts.get("fun")', erwartet: 1 },
      { name: { de: 'Es gibt 5 verschiedene Wörter', en: 'There are 5 different words' }, ausdruck: 'counts.size()', erwartet: 5 },
      { name: { de: 'highest ist 2', en: 'highest is 2' }, ausdruck: 'highest', erwartet: 2 },
      {
        name: { de: 'mostCommon ist "java" oder "is"', en: 'mostCommon is "java" or "is"' },
        ausdruck: 'mostCommon.equals("java") || mostCommon.equals("is")',
        erwartet: true,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  wahl: java`
    List<String>   ordered, duplicates allowed, access by index   → ArrayList
    Set<String>    unordered, every value only once               → HashSet
    Map<K, V>      key → value                                    → HashMap
  `,
  jsVergleich: java`
    // JavaScript
    const names = []                   // grows, takes anything
    names.push('Ada')
    const scores = { Ada: 10 }         // or new Map()

    // Java
    List<String> names = new ArrayList<>();   // grows, takes strings only
    names.add("Ada");
    Map<String, Integer> scores = new HashMap<>();
    scores.put("Ada", 10);
  `,
  interfaceLinks: java`
    // Interface on the left, implementation on the right:
    List<String> names = new ArrayList<>();
    Map<String, Integer> scores = new HashMap<>();

    // The benefit: only the right side would have to change
    // to switch to a LinkedList, for example.
  `,
  streamVergleich: java`
    // JavaScript
    const short = names.filter(n => n.length <= 4).map(n => n.toUpperCase())

    // Java
    List<String> short = names.stream()
        .filter(n -> n.length() <= 4)
        .map(String::toUpperCase)
        .toList();
  `,
}
