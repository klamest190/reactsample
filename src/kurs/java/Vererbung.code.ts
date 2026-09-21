import { java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 6.7 - Vererbung & Interfaces. */

export const beispiele = {
  'java-vererbung-einstieg': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          Dog rex = new Dog("Rex");
          System.out.println(rex.getName());      // inherited from Animal
          System.out.println(rex.sound());        // its own
          System.out.println(rex.describe());     // inherited, but uses sound()
        }
      }

      class Animal {
        private final String name;

        Animal(String name) {
          this.name = name;
        }

        String getName() {
          return name;
        }

        String sound() {
          return "...";
        }

        String describe() {
          return name + " says " + sound();
        }
      }

      class Dog extends Animal {
        Dog(String name) {
          super(name);              // call the constructor of Animal
        }

        @Override
        String sound() {
          return "Woof";
        }
      }
    `,
  },
  'java-vererbung-polymorphie': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // The declared type is Animal - what runs is decided by the object.
          Animal[] zoo = { new Dog("Rex"), new Cat("Mimi"), new Animal("Thing") };

          for (Animal animal : zoo) {
            System.out.println(animal.describe());
          }

          System.out.println(zoo[0] instanceof Dog);
          System.out.println(zoo[1] instanceof Animal);

          // Getting back the specific type needs a cast:
          if (zoo[1] instanceof Cat cat) {
            System.out.println(cat.purr());
          }
        }
      }

      class Animal {
        protected final String name;      // protected: also visible to subclasses

        Animal(String name) {
          this.name = name;
        }

        String sound() {
          return "...";
        }

        String describe() {
          return name + " says " + sound();
        }
      }

      class Dog extends Animal {
        Dog(String name) { super(name); }

        @Override
        String sound() { return "Woof"; }
      }

      class Cat extends Animal {
        Cat(String name) { super(name); }

        @Override
        String sound() { return "Meow"; }

        @Override
        String describe() {
          return super.describe() + " (quietly)";   // extend, not replace
        }

        String purr() { return name + " purrs"; }
      }
    `,
  },
  'java-vererbung-abstract': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // Shape shape = new Shape();     ← not allowed: abstract
          Shape[] shapes = { new Circle(2), new Rectangle(2, 3) };

          double total = 0;
          for (Shape shape : shapes) {
            System.out.printf("%s: %.2f%n", shape.name(), shape.area());
            total += shape.area();
          }
          System.out.printf("Total: %.2f%n", total);
        }
      }

      abstract class Shape {
        // No body: every subclass MUST provide one.
        abstract double area();

        // With a body: shared by everyone.
        String name() {
          return getClass().getSimpleName();
        }
      }

      class Circle extends Shape {
        private final double radius;

        Circle(double radius) { this.radius = radius; }

        @Override
        double area() { return Math.PI * radius * radius; }
      }

      class Rectangle extends Shape {
        private final double width;
        private final double height;

        Rectangle(double width, double height) {
          this.width = width;
          this.height = height;
        }

        @Override
        double area() { return width * height; }
      }
    `,
  },
  'java-vererbung-interface': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          // A class may implement several interfaces - but extend only one class.
          Robot robot = new Robot();
          System.out.println(robot.move());
          System.out.println(robot.speak());
          System.out.println(robot.introduce());

          // The interface is enough as a type:
          Speaker speaker = robot;
          System.out.println(speaker.speak());
        }
      }

      interface Movable {
        String move();                       // no body: a promise
      }

      interface Speaker {
        String speak();

        default String introduce() {         // default: a shared implementation
          return "I say: " + speak();
        }
      }

      class Robot implements Movable, Speaker {
        @Override
        public String move() { return "rolling"; }

        @Override
        public String speak() { return "beep"; }
      }
    `,
  },
  'java-vererbung-enum': {
    code: java`
      public class Main {
        public static void main(String[] args) {
          for (Status status : Status.values()) {
            System.out.println(status + " (" + status.ordinal() + ") = " + status.getLabel());
          }

          Status current = Status.OPEN;
          String text = switch (current) {
            case OPEN -> "still to do";
            case DONE -> "finished";
          };
          System.out.println(text);
          System.out.println(Status.valueOf("DONE").getLabel());
        }
      }

      enum Status {
        OPEN("open"),
        DONE("done");

        private final String label;

        Status(String label) {
          this.label = label;
        }

        String getLabel() {
          return label;
        }
      }
    `,
  },
  'java-vererbung-record': {
    code: java`
      public class Main {
        // A record is a class for pure data: fields, constructor,
        // getters, toString and equals are generated for you.
        record Point(int x, int y) {}

        public static void main(String[] args) {
          Point a = new Point(1, 2);
          Point b = new Point(1, 2);

          System.out.println(a);
          System.out.println(a.x() + a.y());
          System.out.println(a.equals(b));
        }
      }
    `,
  },
  'java-vererbung-uebung': {
    tipps: {
      de: [
        '`abstract class Employee` bekommt das Feld `name`, den Konstruktor und `abstract double monthlySalary();`.',
        'Die Unterklassen rufen im Konstruktor zuerst `super(name);` auf.',
        '`Developer` rechnet `hours * hourlyRate`, `Manager` gibt einfach das Fixgehalt zurück.',
        '`describe()` steht in `Employee` und benutzt `monthlySalary()` - dank Polymorphie ruft es die richtige Fassung auf.',
      ],
      en: [
        '`abstract class Employee` gets the field `name`, the constructor and `abstract double monthlySalary();`.',
        'The subclasses call `super(name);` first in their constructor.',
        '`Developer` computes `hours * hourlyRate`, `Manager` simply returns the fixed salary.',
        '`describe()` lives in `Employee` and uses `monthlySalary()` - thanks to polymorphism it calls the right version.',
      ],
    },
    code: java`
      public class Main {
        public static void main(String[] args) {
          Employee[] team = { new Developer("Ada", 100, 50), new Manager("Alan", 6000) };
          for (Employee employee : team) {
            System.out.println(employee.describe());
          }
        }
      }

      abstract class Employee {
        // Your code:

      }

      class Developer extends Employee {
        // Your code:

      }

      class Manager extends Employee {
        // Your code:

      }
    `,
    loesung: java`
      public class Main {
        public static void main(String[] args) {
          Employee[] team = { new Developer("Ada", 100, 50), new Manager("Alan", 6000) };
          for (Employee employee : team) {
            System.out.println(employee.describe());
          }
        }
      }

      abstract class Employee {
        protected final String name;

        Employee(String name) {
          this.name = name;
        }

        String getName() {
          return name;
        }

        abstract double monthlySalary();

        String describe() {
          return name + ": " + monthlySalary();
        }
      }

      class Developer extends Employee {
        private final int hours;
        private final double hourlyRate;

        Developer(String name, int hours, double hourlyRate) {
          super(name);
          this.hours = hours;
          this.hourlyRate = hourlyRate;
        }

        @Override
        double monthlySalary() {
          return hours * hourlyRate;
        }
      }

      class Manager extends Employee {
        private final double fixedSalary;

        Manager(String name, double fixedSalary) {
          super(name);
          this.fixedSalary = fixedSalary;
        }

        @Override
        double monthlySalary() {
          return fixedSalary;
        }
      }
    `,
    tests: [
      {
        name: { de: 'Developer verdient hours * hourlyRate', en: 'Developer earns hours * hourlyRate' },
        ausdruck: 'new Developer("X", 10, 20).monthlySalary()',
        erwartet: 200,
      },
      {
        name: { de: 'Manager verdient das Fixgehalt', en: 'Manager earns the fixed salary' },
        ausdruck: 'new Manager("Y", 5000).monthlySalary()',
        erwartet: 5000,
      },
      {
        name: { de: 'Beide sind Employee', en: 'Both are Employee' },
        ausdruck: 'new Manager("Y", 1) instanceof Employee && new Developer("X", 1, 1) instanceof Employee',
        erwartet: true,
      },
      {
        name: { de: 'describe() steht nur in Employee', en: 'describe() lives only in Employee' },
        ausdruck: 'new Developer("Ada", 2, 3).describe()',
        erwartet: 'Ada: 6.0',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  istEin: java`
    class Dog extends Animal { … }

    // Read extends as "is a":
    //   A Dog IS AN Animal.
    // So a Dog may stand wherever an Animal is expected.

    Animal a = new Dog("Rex");     // allowed
    // Dog d = new Animal("x");    // not allowed - not every animal is a dog
  `,
  wahl: java`
    abstract class …     // "is a" + shared code + shared fields
    interface …          // "can" - an ability, any number per class

    class Robot extends Machine implements Movable, Speaker { … }
    //           ^ exactly one        ^ any number
  `,
  reactVergleich: java`
    // Java: behaviour is inherited
    class Button extends Component { … }

    // React: behaviour is put together (composition)
    function Button({ children }) {
      return <Pressable>{children}</Pressable>
    }
  `,
}
