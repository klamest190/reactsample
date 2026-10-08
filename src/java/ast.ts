/**
 * JAVA-TEIL · Der Syntaxbaum (AST = abstract syntax tree)
 *
 * Reine Datentypen: So sieht ein Java-Programm aus, nachdem der Parser es
 * gelesen hat. Der Interpreter läuft später genau über diese Knoten.
 *
 * Jeder Knoten kennt seine `zeile` - nur deshalb können Fehlermeldungen
 * sagen, WO etwas schiefgegangen ist.
 */

/** Ein Typ im Quelltext: `int`, `String`, `List<String>`, `int[][]`. */
export type TypeRef = {
  name: string
  /** Anzahl der [] - `int[][]` hat 2. */
  dimensions: number
  /** Generics werden gelesen, aber (wie in echtem Java zur Laufzeit) vergessen. */
  args: TypeRef[]
}

export const UNKNOWN_TYPE: TypeRef = { name: 'var', dimensions: 0, args: [] }

export type Visibility = 'public' | 'protected' | 'private' | 'package'

/**
 * An annotation such as `@GetMapping("/todos/{id}")` or `@Size(min = 1, max = 80)`.
 *
 * The runtime itself does not need them (`@Override` changes nothing at run time) -
 * they are only kept so that libraries like Spring (src/spring/) can read them.
 * Real Spring works the same way: it reads the annotations via reflection at startup.
 */
export type Annotation = {
  name: string
  /** A single unnamed value is stored as `value`: `@GetMapping("/x")` → { value: '/x' }. */
  values: Record<string, AnnotationValue>
  line: number
}

/** Strings, numbers and booleans as such; constants and classes as text (`HttpStatus.CREATED`, `Todo.class` → `Todo`). */
export type AnnotationValue = string | number | boolean | AnnotationValue[]

export type ParamDecl = { name: string; type: TypeRef; varargs: boolean; annotations?: Annotation[] }

export type FieldDecl = {
  name: string
  type: TypeRef
  isStatic: boolean
  final: boolean
  visibility: Visibility
  init?: Expression
  annotations?: Annotation[]
  line: number
}

export type MethodDecl = {
  name: string
  returnType: TypeRef
  params: ParamDecl[]
  /** Fehlt bei abstrakten Methoden und Interface-Methoden ohne default. */
  body?: Block
  isStatic: boolean
  isAbstract: boolean
  visibility: Visibility
  /** Konstruktoren sind Methoden ohne Rückgabetyp, die so heißen wie die Klasse. */
  isConstructor: boolean
  annotations?: Annotation[]
  line: number
}

export type TypeDecl = {
  kind: 'class' | 'interface' | 'enum'
  name: string
  isAbstract: boolean
  superclass?: string
  interfaces: string[]
  /** extends/implements including type arguments: `JpaRepository<Todo, Long>` - for libraries like Spring Data. */
  superTypes?: TypeRef[]
  fields: FieldDecl[]
  methods: MethodDecl[]
  /** Nur bei enum: die Konstanten in Reihenfolge. */
  constants: { name: string; args: Expression[] }[]
  /** Nur bei record: die Komponenten (werden zu final-Feldern + Gettern). */
  components?: ParamDecl[]
  /** Bei verschachtelten Klassen: die umgebende Klasse - deren static-Felder sind sichtbar. */
  outer?: string
  annotations?: Annotation[]
  line: number
}

export type Program = {
  types: TypeDecl[]
  /** package/import werden gelesen und ignoriert - hier gibt es nur eine Datei. */
  imports: string[]
}

// ---------------------------------------------------------------------------
// Anweisungen
// ---------------------------------------------------------------------------

export type Block = { kind: 'block'; statements: Statement[]; line: number }

export type VarDecl = { name: string; dimensions: number; init?: Expression }

export type Statement =
  | Block
  | { kind: 'local'; type: TypeRef; final: boolean; variables: VarDecl[]; line: number }
  | { kind: 'expression'; expression: Expression; line: number }
  | { kind: 'if'; condition: Expression; thenBranch: Statement; elseBranch?: Statement; line: number }
  | { kind: 'while'; condition: Expression; body: Statement; line: number }
  | { kind: 'doWhile'; condition: Expression; body: Statement; line: number }
  | { kind: 'for'; init: Statement[]; condition?: Expression; update: Expression[]; body: Statement; line: number }
  | { kind: 'forEach'; type: TypeRef; name: string; source: Expression; body: Statement; line: number }
  | { kind: 'switch'; value: Expression; cases: SwitchCase[]; arrow: boolean; line: number }
  | { kind: 'return'; value?: Expression; line: number }
  | { kind: 'break'; line: number }
  | { kind: 'continue'; line: number }
  | { kind: 'throw'; value: Expression; line: number }
  | { kind: 'try'; body: Block; catches: CatchClause[]; finallyBlock?: Block; line: number }
  | { kind: 'empty'; line: number }

export type SwitchCase = {
  /** Leer = `default`. Mehrere Werte für `case 1, 2 ->` bzw. gestapelte `case`. */
  values: Expression[]
  statements: Statement[]
  /** Bei `case x -> ausdruck;` der Wert, den das switch liefert. */
  result?: Expression
}

export type CatchClause = { types: string[]; name: string; body: Block }

// ---------------------------------------------------------------------------
// Ausdrücke
// ---------------------------------------------------------------------------

export type Literal =
  | { type: 'int'; value: number }
  | { type: 'double'; value: number }
  | { type: 'boolean'; value: boolean }
  | { type: 'char'; value: number }
  | { type: 'String'; value: string }
  | { type: 'null' }

export type Expression =
  | { kind: 'literal'; value: Literal; line: number }
  | { kind: 'name'; name: string; line: number }
  | { kind: 'this'; line: number }
  | { kind: 'field'; target: Expression; name: string; line: number }
  | { kind: 'call'; target?: Expression; name: string; args: Expression[]; viaSuper: boolean; line: number }
  | { kind: 'new'; classInfo: string; args: Expression[]; line: number }
  | { kind: 'newArray'; type: TypeRef; sizes: Expression[]; values?: Expression[]; line: number }
  | { kind: 'arrayLiteral'; values: Expression[]; line: number }
  | { kind: 'index'; target: Expression; index: Expression; line: number }
  | { kind: 'assign'; target: Expression; operator: string; value: Expression; line: number }
  | { kind: 'binary'; operator: string; left: Expression; right: Expression; line: number }
  | { kind: 'unary'; operator: string; expression: Expression; line: number }
  | { kind: 'increment'; operator: '++' | '--'; target: Expression; prefix: boolean; line: number }
  | { kind: 'ternary'; condition: Expression; thenBranch: Expression; elseBranch: Expression; line: number }
  | { kind: 'instanceof'; expression: Expression; type: string; binding?: string; line: number }
  | { kind: 'cast'; type: TypeRef; expression: Expression; line: number }
  | { kind: 'lambda'; params: string[]; body: Expression | Block; line: number }
  | { kind: 'methodRef'; target: string; name: string; line: number }
  | { kind: 'super'; line: number }
  /** `Todo.class` - a Class object, as needed by e.g. `SpringApplication.run(App.class, args)`. */
  | { kind: 'classLiteral'; className: string; line: number }
  /** switch als Ausdruck (Java 14+): `int t = switch (tag) { case 1 -> 10; … };` */
  | { kind: 'switchExpression'; statement: Statement; line: number }
