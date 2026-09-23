import { laden, type Teil } from './typen'

export const javaTeil: Teil = {
  id: 'java',
  nummer: 7,
  titel: { de: 'Java-Grundlagen', en: 'Java Fundamentals' },
  kurztitel: { de: 'Java', en: 'Java' },
  bereich: 'backend',
  beschreibung: {
    de: 'Die zweite Welt: eine streng typisierte, objektorientierte Sprache. Java läuft hier in einer eigenen Laufzeit (src/java/) - unabhängig von allem JavaScript und React.',
    en: 'The second world: a strictly typed, object-oriented language. Java runs here in its own runtime (src/java/) - independent of all JavaScript and React.',
  },
  kapitel: [
    {
      id: 'java-start',
      titel: { de: 'Hallo Java', en: 'Hello Java' },
      kurz: {
        de: 'Klasse, main, println - und warum Java erst kompiliert wird.',
        en: 'Class, main, println - and why Java is compiled first.',
      },
      dauer: 25,
      lernziele: {
        de: ['Ein Java-Programm starten können', 'Klasse, Methode und main einordnen', 'Kompilieren und Ausführen unterscheiden', 'Die ersten Unterschiede zu JavaScript benennen'],
        en: ['Start a Java program', 'Understand class, method and main', 'Tell compiling and running apart', 'Name the first differences to JavaScript'],
      },
      stichworte: ['java', 'JVM', 'main', 'System.out.println', 'compiler', 'Compiler', 'kompilieren', 'bytecode', 'Bytecode', 'javac', 'JDK', 'public class'],
      Komponente: {
        de: laden(() => import('../java/Start'), 'Start'),
        en: laden(() => import('../java/Start.en'), 'Start'),
      },
    },
    {
      id: 'java-variablen',
      titel: { de: 'Typen & Variablen', en: 'Types & Variables' },
      kurz: {
        de: 'int, double, boolean, char, String - und warum der Typ vorne steht.',
        en: 'int, double, boolean, char, String - and why the type comes first.',
      },
      dauer: 35,
      lernziele: {
        de: ['Die primitiven Typen kennen und wählen', 'Typen umwandeln (Casting)', 'final statt const einsetzen', 'Die Fallen der int-Division und der Kommazahlen kennen'],
        en: ['Know and choose the primitive types', 'Convert types (casting)', 'Use final instead of const', 'Know the traps of int division and decimals'],
      },
      stichworte: ['int', 'double', 'boolean', 'char', 'long', 'float', 'String', 'casting', 'Casting', 'final', 'var', 'primitive', 'Wrapper', 'Integer', 'Typisierung', 'static typing'],
      Komponente: {
        de: laden(() => import('../java/Variablen'), 'Variablen'),
        en: laden(() => import('../java/Variablen.en'), 'Variablen'),
      },
    },
    {
      id: 'java-kontrollfluss',
      titel: { de: 'Bedingungen & Schleifen', en: 'Conditions & Loops' },
      kurz: {
        de: 'if, switch, for, while - fast wie in JavaScript, nur strenger.',
        en: 'if, switch, for, while - almost like JavaScript, just stricter.',
      },
      dauer: 30,
      lernziele: {
        de: ['Bedingungen mit echten booleans schreiben', 'switch klassisch und mit Pfeil nutzen', 'Die vier Schleifenarten einsetzen', 'break und continue gezielt verwenden'],
        en: ['Write conditions with real booleans', 'Use switch classic and with arrows', 'Use all four kinds of loops', 'Use break and continue deliberately'],
      },
      stichworte: ['if', 'else', 'switch', 'for', 'while', 'do while', 'break', 'continue', 'ternär', 'enhanced for'],
      Komponente: {
        de: laden(() => import('../java/Kontrollfluss'), 'Kontrollfluss'),
        en: laden(() => import('../java/Kontrollfluss.en'), 'Kontrollfluss'),
      },
    },
    {
      id: 'java-methoden',
      titel: { de: 'Methoden', en: 'Methods' },
      kurz: {
        de: 'Rückgabetyp, Parameter, Überladung - und was static wirklich bedeutet.',
        en: 'Return type, parameters, overloading - and what static really means.',
      },
      dauer: 30,
      lernziele: {
        de: ['Methoden mit Typen deklarieren', 'Methoden überladen', 'static von Instanzmethoden unterscheiden', 'Verstehen, dass Parameter Kopien sind'],
        en: ['Declare methods with types', 'Overload methods', 'Tell static from instance methods', 'Understand that parameters are copies'],
      },
      stichworte: ['method', 'Methode', 'return', 'void', 'static', 'überladen', 'overloading', 'Parameter', 'varargs', 'Rekursion', 'recursion'],
      Komponente: {
        de: laden(() => import('../java/Methoden'), 'Methoden'),
        en: laden(() => import('../java/Methoden.en'), 'Methoden'),
      },
    },
    {
      id: 'java-arrays',
      titel: { de: 'Arrays & Strings', en: 'Arrays & Strings' },
      kurz: {
        de: 'Feste Längen, Standardwerte - und warum == bei Strings lügt.',
        en: 'Fixed lengths, default values - and why == lies about strings.',
      },
      dauer: 35,
      lernziele: {
        de: ['Arrays anlegen und durchlaufen', 'Arrays.toString und Arrays.sort nutzen', 'String-Methoden sicher anwenden', 'equals statt == verwenden'],
        en: ['Create and traverse arrays', 'Use Arrays.toString and Arrays.sort', 'Use string methods confidently', 'Use equals instead of =='],
      },
      stichworte: ['array', 'Array', 'length', 'Arrays.toString', 'Arrays.sort', 'StringBuilder', 'equals', '==', 'String-Pool', 'string pool', 'zweidimensional'],
      Komponente: {
        de: laden(() => import('../java/Arrays'), 'Arrays'),
        en: laden(() => import('../java/Arrays.en'), 'Arrays'),
      },
    },
    {
      id: 'java-klassen',
      titel: { de: 'Klassen & Objekte', en: 'Classes & Objects' },
      kurz: {
        de: 'Der Kern von Java: Bauplan, Konstruktor, Kapselung, toString.',
        en: 'The heart of Java: blueprint, constructor, encapsulation, toString.',
      },
      dauer: 45,
      lernziele: {
        de: ['Klassen mit Feldern und Methoden schreiben', 'Konstruktoren und this verstehen', 'Mit private kapseln und Getter/Setter schreiben', 'toString und equals überschreiben'],
        en: ['Write classes with fields and methods', 'Understand constructors and this', 'Encapsulate with private and write getters/setters', 'Override toString and equals'],
      },
      stichworte: ['class', 'Klasse', 'Objekt', 'object', 'constructor', 'Konstruktor', 'this', 'private', 'public', 'getter', 'setter', 'Kapselung', 'encapsulation', 'toString', 'equals', 'null'],
      Komponente: {
        de: laden(() => import('../java/Klassen'), 'Klassen'),
        en: laden(() => import('../java/Klassen.en'), 'Klassen'),
      },
    },
    {
      id: 'java-vererbung',
      titel: { de: 'Vererbung & Interfaces', en: 'Inheritance & Interfaces' },
      kurz: {
        de: 'extends, super, @Override, abstract, implements - und Polymorphie.',
        en: 'extends, super, @Override, abstract, implements - and polymorphism.',
      },
      dauer: 45,
      lernziele: {
        de: ['Klassen erweitern und Methoden überschreiben', 'Polymorphie erklären und einsetzen', 'Abstrakte Klassen und Interfaces unterscheiden', 'enum und record kennen'],
        en: ['Extend classes and override methods', 'Explain and use polymorphism', 'Tell abstract classes and interfaces apart', 'Know enum and record'],
      },
      stichworte: ['extends', 'super', 'Override', 'abstract', 'interface', 'implements', 'Polymorphie', 'polymorphism', 'instanceof', 'enum', 'record', 'Vererbung', 'inheritance'],
      Komponente: {
        de: laden(() => import('../java/Vererbung'), 'Vererbung'),
        en: laden(() => import('../java/Vererbung.en'), 'Vererbung'),
      },
    },
    {
      id: 'java-collections',
      titel: { de: 'Collections & Generics', en: 'Collections & Generics' },
      kurz: {
        de: 'ArrayList und HashMap - Javas Antwort auf Array und Objekt.',
        en: 'ArrayList and HashMap - Java’s answer to array and object.',
      },
      dauer: 40,
      lernziele: {
        de: ['ArrayList statt Array einsetzen', 'HashMap für Schlüssel-Wert-Paare nutzen', 'Generics <…> lesen und schreiben', 'Listen mit Lambdas und Streams verarbeiten'],
        en: ['Use ArrayList instead of arrays', 'Use HashMap for key-value pairs', 'Read and write generics <…>', 'Process lists with lambdas and streams'],
      },
      stichworte: ['ArrayList', 'HashMap', 'List', 'Map', 'Set', 'Generics', 'generics', 'Autoboxing', 'autoboxing', 'Stream', 'stream', 'Lambda', 'lambda', 'Collections'],
      Komponente: {
        de: laden(() => import('../java/Collections'), 'Collections'),
        en: laden(() => import('../java/Collections.en'), 'Collections'),
      },
    },
    {
      id: 'java-fehler',
      titel: { de: 'Exceptions', en: 'Exceptions' },
      kurz: {
        de: 'try/catch/finally, throw, eigene Fehlertypen - und checked vs. unchecked.',
        en: 'try/catch/finally, throw, custom error types - and checked vs. unchecked.',
      },
      dauer: 30,
      lernziele: {
        de: ['Exceptions fangen und gezielt behandeln', 'Eigene Exceptions werfen', 'finally richtig einsetzen', 'Checked und unchecked unterscheiden'],
        en: ['Catch and handle exceptions deliberately', 'Throw your own exceptions', 'Use finally correctly', 'Tell checked and unchecked apart'],
      },
      stichworte: ['try', 'catch', 'finally', 'throw', 'throws', 'Exception', 'RuntimeException', 'checked', 'unchecked', 'NullPointerException', 'Stacktrace'],
      Komponente: {
        de: laden(() => import('../java/Fehler'), 'Fehler'),
        en: laden(() => import('../java/Fehler.en'), 'Fehler'),
      },
    },
    {
      id: 'java-vergleich',
      titel: { de: 'Java, JavaScript & React', en: 'Java, JavaScript & React' },
      kurz: {
        de: 'Dieselbe Aufgabe dreimal - und wo in diesem Projekt welche Sprache steckt.',
        en: 'The same task three times - and where each language lives in this project.',
      },
      dauer: 35,
      lernziele: {
        de: ['Die Unterschiede der Sprachen sicher benennen', 'Dieselbe Logik in Java und JavaScript lesen', 'Wissen, wo im Projekt Java, JS und React liegen', 'Verstehen, wie die Java-Laufzeit hier funktioniert'],
        en: ['Name the differences between the languages confidently', 'Read the same logic in Java and JavaScript', 'Know where Java, JS and React live in this project', 'Understand how the Java runtime here works'],
      },
      stichworte: ['Vergleich', 'comparison', 'Java vs JavaScript', 'Unterschiede', 'differences', 'Interpreter', 'interpreter', 'Laufzeit', 'runtime', 'Projektstruktur'],
      Komponente: {
        de: laden(() => import('../java/Vergleich'), 'Vergleich'),
        en: laden(() => import('../java/Vergleich.en'), 'Vergleich'),
      },
    },
  ],
}
