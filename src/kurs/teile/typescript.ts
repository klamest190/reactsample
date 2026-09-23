import { laden, type Teil } from './typen'

export const typescriptTeil: Teil = {
  id: 'typescript',
  nummer: 2,
  titel: { de: 'TypeScript-Grundlagen', en: 'TypeScript Fundamentals' },
  kurztitel: { de: 'TypeScript', en: 'TypeScript' },
  bereich: 'frontend',
  beschreibung: {
    de: 'JavaScript mit Typen: Objekte und Funktionen beschreiben, Unions eingrenzen, Generics und Utility Types - alles mit echter Typprüfung im Editor.',
    en: 'JavaScript with types: describe objects and functions, narrow unions, generics and utility types - all with real type checking in the editor.',
  },
  kapitel: [
    {
      id: 'ts-start',
      titel: { de: 'Warum TypeScript?', en: 'Why TypeScript?' },
      kurz: {
        de: 'Typen, Inferenz und die wichtigsten Grundtypen - und warum Typen zur Laufzeit verschwinden.',
        en: 'Types, inference and the essential basic types - and why types disappear at runtime.',
      },
      dauer: 25,
      lernziele: {
        de: ['Typannotationen schreiben und Inferenz nutzen', 'Die Grundtypen, Arrays und Tupel kennen', 'any und unknown unterscheiden', 'Verstehen, dass Typen nur beim Prüfen existieren'],
        en: ['Write type annotations and rely on inference', 'Know the basic types, arrays and tuples', 'Tell any and unknown apart', 'Understand that types only exist while checking'],
      },
      stichworte: ['typescript', 'ts', 'type', 'Typ', 'annotation', 'inference', 'Inferenz', 'string', 'number', 'boolean', 'array', 'tuple', 'Tupel', 'any', 'unknown', 'strict', 'tsc', 'type erasure'],
      Komponente: {
        de: laden(() => import('../typescript/Einstieg'), 'Einstieg'),
        en: laden(() => import('../typescript/Einstieg.en'), 'Einstieg'),
      },
    },
    {
      id: 'ts-objekte',
      titel: { de: 'Objekttypen & Interfaces', en: 'Object Types & Interfaces' },
      kurz: {
        de: 'Die Form von Objekten beschreiben: type, interface, optionale und readonly Felder.',
        en: 'Describe the shape of objects: type, interface, optional and readonly fields.',
      },
      dauer: 30,
      lernziele: {
        de: ['Objekttypen mit type und interface beschreiben', 'Optionale und readonly Felder einsetzen', 'Typen mit extends und & kombinieren', 'Strukturelle Typisierung verstehen'],
        en: ['Describe object types with type and interface', 'Use optional and readonly fields', 'Combine types with extends and &', 'Understand structural typing'],
      },
      stichworte: ['type', 'interface', 'optional', 'readonly', 'extends', 'intersection', 'structural typing', 'strukturell', 'index signature', 'Record', 'excess property'],
      Komponente: {
        de: laden(() => import('../typescript/Objekte'), 'Objekte'),
        en: laden(() => import('../typescript/Objekte.en'), 'Objekte'),
      },
    },
    {
      id: 'ts-funktionen',
      titel: { de: 'Funktionen typisieren', en: 'Typing Functions' },
      kurz: {
        de: 'Parameter, Rückgabewerte, Callbacks und Funktionstypen.',
        en: 'Parameters, return values, callbacks and function types.',
      },
      dauer: 25,
      lernziele: {
        de: ['Parameter und Rückgabewerte typisieren', 'Optionale, Default- und Rest-Parameter nutzen', 'Funktionstypen für Callbacks schreiben', 'void und never einordnen'],
        en: ['Type parameters and return values', 'Use optional, default and rest parameters', 'Write function types for callbacks', 'Understand void and never'],
      },
      stichworte: ['function', 'Funktion', 'parameter', 'return type', 'Rückgabetyp', 'callback', 'void', 'never', 'overload', 'Überladung', 'rest parameter', 'function type'],
      Komponente: {
        de: laden(() => import('../typescript/Funktionen'), 'Funktionen'),
        en: laden(() => import('../typescript/Funktionen.en'), 'Funktionen'),
      },
    },
    {
      id: 'ts-unions',
      titel: { de: 'Unions & Narrowing', en: 'Unions & Narrowing' },
      kurz: {
        de: 'Ein Wert, mehrere mögliche Typen - und wie TypeScript sie sicher eingrenzt.',
        en: 'One value, several possible types - and how TypeScript narrows them safely.',
      },
      dauer: 35,
      lernziele: {
        de: ['Union- und Literal-Typen einsetzen', 'Mit typeof, in und instanceof eingrenzen', 'Discriminated Unions modellieren', 'Mit never auf Vollständigkeit prüfen'],
        en: ['Use union and literal types', 'Narrow with typeof, in and instanceof', 'Model discriminated unions', 'Check for exhaustiveness with never'],
      },
      stichworte: ['union', 'literal type', 'narrowing', 'Eingrenzen', 'typeof', 'instanceof', 'discriminated union', 'exhaustive', 'never', 'type guard', 'type predicate', 'null', 'undefined', 'strictNullChecks'],
      Komponente: {
        de: laden(() => import('../typescript/Unions'), 'Unions'),
        en: laden(() => import('../typescript/Unions.en'), 'Unions'),
      },
    },
    {
      id: 'ts-generics',
      titel: { de: 'Generics', en: 'Generics' },
      kurz: {
        de: 'Funktionen und Typen, die mit jedem Typ funktionieren - ohne any.',
        en: 'Functions and types that work with any type - without any.',
      },
      dauer: 35,
      lernziele: {
        de: ['Generische Funktionen schreiben', 'Typparameter mit extends einschränken', 'keyof mit Generics kombinieren', 'Generische Typen und Klassen bauen'],
        en: ['Write generic functions', 'Constrain type parameters with extends', 'Combine keyof with generics', 'Build generic types and classes'],
      },
      stichworte: ['generics', 'Generics', 'generic', 'type parameter', 'Typparameter', 'extends', 'constraint', 'keyof', 'default type'],
      Komponente: {
        de: laden(() => import('../typescript/Generics'), 'Generics'),
        en: laden(() => import('../typescript/Generics.en'), 'Generics'),
      },
    },
    {
      id: 'ts-utility',
      titel: { de: 'Typ-Operatoren & Utility Types', en: 'Type Operators & Utility Types' },
      kurz: {
        de: 'Typen aus anderen Typen ableiten: keyof, typeof, Partial, Pick, Omit, as const und satisfies.',
        en: 'Derive types from other types: keyof, typeof, Partial, Pick, Omit, as const and satisfies.',
      },
      dauer: 30,
      lernziele: {
        de: ['keyof, typeof und Indexzugriff nutzen', 'Die wichtigsten Utility Types einsetzen', 'as const und satisfies verstehen', 'Typen ableiten statt doppelt schreiben'],
        en: ['Use keyof, typeof and indexed access', 'Apply the most important utility types', 'Understand as const and satisfies', 'Derive types instead of writing them twice'],
      },
      stichworte: ['utility types', 'keyof', 'typeof', 'indexed access', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit', 'Record', 'ReturnType', 'Parameters', 'Awaited', 'NonNullable', 'Exclude', 'Extract', 'as const', 'satisfies'],
      Komponente: {
        de: laden(() => import('../typescript/UtilityTypes'), 'UtilityTypes'),
        en: laden(() => import('../typescript/UtilityTypes.en'), 'UtilityTypes'),
      },
    },
    {
      id: 'ts-klassen',
      titel: { de: 'Klassen, Enums & Module', en: 'Classes, Enums & Modules' },
      kurz: {
        de: 'Klassen mit Zugriffsmodifikatoren, Interfaces implementieren, Enums und Typen importieren.',
        en: 'Classes with access modifiers, implementing interfaces, enums and importing types.',
      },
      dauer: 30,
      lernziele: {
        de: ['Klassen mit private, readonly und Parameter-Properties schreiben', 'Interfaces implementieren und abstract nutzen', 'Enums und Union-Typen vergleichen', 'import type und Deklarationsdateien kennen'],
        en: ['Write classes with private, readonly and parameter properties', 'Implement interfaces and use abstract', 'Compare enums and union types', 'Know import type and declaration files'],
      },
      stichworte: ['class', 'Klasse', 'private', 'protected', 'public', 'readonly', 'parameter properties', 'implements', 'abstract', 'enum', 'import type', 'export', 'module', 'd.ts', 'declare'],
      Komponente: {
        de: laden(() => import('../typescript/Klassen'), 'Klassen'),
        en: laden(() => import('../typescript/Klassen.en'), 'Klassen'),
      },
    },
    {
      id: 'ts-fortgeschritten',
      titel: { de: 'Fortgeschrittene Typen & Praxis', en: 'Advanced Types & Practice' },
      kurz: {
        de: 'Mapped und Conditional Types, Template Literal Types, sichere API-Daten und die tsconfig.',
        en: 'Mapped and conditional types, template literal types, safe API data and the tsconfig.',
      },
      dauer: 35,
      lernziele: {
        de: ['Mapped und Conditional Types lesen und schreiben', 'Template Literal Types einsetzen', 'Async-Code und API-Daten sicher typisieren', 'Type Assertions sparsam einsetzen und die tsconfig verstehen'],
        en: ['Read and write mapped and conditional types', 'Use template literal types', 'Type async code and API data safely', 'Use type assertions sparingly and understand the tsconfig'],
      },
      stichworte: ['mapped types', 'conditional types', 'infer', 'template literal types', 'type assertion', 'non-null assertion', 'Promise', 'async', 'fetch', 'unknown', 'validation', 'Validierung', 'tsconfig', 'strict', 'noUncheckedIndexedAccess'],
      Komponente: {
        de: laden(() => import('../typescript/Fortgeschritten'), 'Fortgeschritten'),
        en: laden(() => import('../typescript/Fortgeschritten.en'), 'Fortgeschritten'),
      },
    },
  ],
}
