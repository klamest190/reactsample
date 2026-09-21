import { java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 7.6 - Klassen & Objekte. */

export const beispiele = {
  'java-klassen-einstieg': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          Person ada = new Person("Ada", 36);
          Person alan = new Person("Alan", 41);

          System.out.println(ada.greet());
          System.out.println(alan.greet());
          System.out.println(ada.isAdult());
        }
      }

      class Person {
        String name;                       // field
        int age;

        Person(String name, int age) {     // constructor: same name as the class
          this.name = name;                // this.name = the field, name = the parameter
          this.age = age;
        }

        String greet() {                   // method: works on ONE person
          return "Hi, I am " + name + " (" + age + ")";
        }

        boolean isAdult() {
          return age >= 18;
        }
      }
    `,
  },
  'java-klassen-felder': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          Product a = new Product();
          System.out.println(a.name + " | " + a.price + " | " + a.available);

          Product b = new Product();
          System.out.println("Products created: " + Product.count);
        }
      }

      class Product {
        // Fields always have a default value - unlike local variables.
        String name;            // null
        double price;           // 0.0
        boolean available;      // false

        // static: belongs to the class, exists exactly once for all objects.
        static int count;

        Product() {
          count++;
        }
      }
    `,
  },
  'java-klassen-konstruktor': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          Book full = new Book("Java", "Gosling", 1995);
          Book short1 = new Book("Unknown");

          System.out.println(full.describe());
          System.out.println(short1.describe());
        }
      }

      class Book {
        String title;
        String author;
        int year;

        Book(String title, String author, int year) {
          this.title = title;
          this.author = author;
          this.year = year;
        }

        // A second constructor that hands work to the first one.
        Book(String title) {
          this(title, "unknown", 0);
        }

        String describe() {
          return title + " by " + author + " (" + year + ")";
        }
      }
    `,
  },
  'java-klassen-kapselung': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          Account account = new Account("Ada");

          // account.balance = 1000000;   ← not allowed, the field is private
          account.deposit(100);
          account.deposit(-50);          // rejected by the method
          System.out.println(account.getBalance());
          System.out.println(account.getOwner());
        }
      }

      class Account {
        private final String owner;      // private: only reachable inside this class
        private int balance;             // final: set once in the constructor

        Account(String owner) {
          this.owner = owner;
          this.balance = 0;
        }

        // Getter: read access …
        String getOwner() {
          return owner;
        }

        int getBalance() {
          return balance;
        }

        // … and a method instead of a setter: it can check.
        void deposit(int amount) {
          if (amount <= 0) {
            System.out.println("Deposit must be positive: " + amount);
            return;
          }
          balance += amount;
        }
      }
    `,
  },
  'java-klassen-tostring': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          Point a = new Point(1, 2);
          Point b = new Point(1, 2);

          System.out.println(a);            // uses toString()
          System.out.println(a == b);       // false - two different objects
          System.out.println(a.equals(b));  // true  - because we defined it that way
        }
      }

      class Point {
        int x;
        int y;

        Point(int x, int y) {
          this.x = x;
          this.y = y;
        }

        @Override
        public String toString() {
          return "Point(" + x + ", " + y + ")";
        }

        @Override
        public boolean equals(Object other) {
          if (!(other instanceof Point)) return false;
          Point p = (Point) other;
          return x == p.x && y == p.y;
        }
      }
    `,
  },
  'java-klassen-referenzen': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          Box first = new Box("full");
          Box second = first;             // NOT a copy - a second name

          second.content = "empty";
          System.out.println(first.content);

          Box third = null;               // no object at all
          System.out.println(third == null);
          // System.out.println(third.content);   → NullPointerException
        }
      }

      class Box {
        String content;

        Box(String content) {
          this.content = content;
        }
      }
    `,
  },
  'java-klassen-uebung': {
    tipps: {
      de: [
        'Die Felder gehören ins Innere der Klasse und sind `private`.',
        'Der Konstruktor heißt wie die Klasse und hat keinen Rückgabetyp - auch kein `void`.',
        '`this.title = title;` unterscheidet das Feld vom gleichnamigen Parameter.',
        '`toggle()` kehrt den Wert um: `done = !done;`',
      ],
      en: [
        'The fields belong inside the class and are `private`.',
        'The constructor is named like the class and has no return type - not even `void`.',
        '`this.title = title;` tells the field apart from the parameter of the same name.',
        '`toggle()` flips the value: `done = !done;`',
      ],
    },
    code: java`
      public class Main {
        public static void main(String[] args) {
          Task task = new Task("Learn Java");
          task.toggle();
          System.out.println(task);
        }
      }

      class Task {
        // Your code:

      }
    `,
    loesung: java`
      public class Main {
        public static void main(String[] args) {
          Task task = new Task("Learn Java");
          task.toggle();
          System.out.println(task);
        }
      }

      class Task {
        private final String title;
        private boolean done;

        Task(String title) {
          this.title = title;
          this.done = false;
        }

        String getTitle() {
          return title;
        }

        boolean isDone() {
          return done;
        }

        void toggle() {
          done = !done;
        }

        @Override
        public String toString() {
          return (done ? "[x] " : "[ ] ") + title;
        }
      }
    `,
    tests: [
      {
        name: { de: 'Ein neuer Task ist nicht erledigt', en: 'A new task is not done' },
        ausdruck: 'new Task("A").isDone()',
        erwartet: false,
      },
      {
        name: { de: 'getTitle() gibt den Titel zurück', en: 'getTitle() returns the title' },
        ausdruck: 'new Task("A").getTitle()',
        erwartet: 'A',
      },
      {
        name: { de: 'toggle() schaltet um', en: 'toggle() flips the state' },
        ausdruck: 'task.isDone()',
        erwartet: true,
      },
      {
        name: { de: 'toString() ist "[x] Learn Java"', en: 'toString() is "[x] Learn Java"' },
        ausdruck: 'task.toString()',
        erwartet: '[x] Learn Java',
      },
      {
        name: { de: 'Unerledigt beginnt mit "[ ]"', en: 'Not done starts with "[ ]"' },
        ausdruck: 'new Task("B").toString()',
        erwartet: '[ ] B',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  bauplan: java`
    class Person {          // the blueprint - exists once
      String name;          //   field:  what a person HAS
      String greet() { … }  //   method: what a person CAN DO
    }

    Person ada = new Person("Ada");    // an object - as many as you like
    Person alan = new Person("Alan");  // each with its own values
  `,
  jsVergleich: java`
    // JavaScript - an object just comes into being:
    const ada = { name: 'Ada', greet() { return 'Hi ' + this.name } }

    // Java - first the blueprint, then the object:
    class Person {
      String name;
      Person(String name) { this.name = name; }
      String greet() { return "Hi " + name; }
    }
    Person ada = new Person("Ada");
  `,
  konvention: java`
    private int balance;             // 1. the field is private

    public int getBalance() {        // 2. reading through a getter
      return balance;
    }

    public void setBalance(int b) {  // 3. writing through a setter -
      if (b < 0) return;             //    which can check!
      balance = b;
    }
  `,
}
