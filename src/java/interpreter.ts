/**
 * JAVA-TEIL · Schritt 4 von 4: den Syntaxbaum ausführen
 *
 * Ein "tree-walking interpreter": Für jeden Knoten aus ast.ts gibt es hier
 * einen Fall. Echtes Java übersetzt stattdessen erst zu Bytecode und lässt
 * die JVM laufen - für einen Lernkurs im Browser ist der direkte Weg besser,
 * weil jede Fehlermeldung eine Zeilennummer aus dem Quelltext behalten kann.
 *
 * Bewusst nachgebaut, weil der Kurs es erklärt:
 *   - int-Arithmetik läuft über (überläuft bei 2147483647)
 *   - `/` schneidet bei ganzen Zahlen ab, `/ 0` wirft ArithmeticException
 *   - `==` vergleicht bei Objekten die Identität, `.equals()` den Inhalt
 *   - Felder haben Standardwerte (0, false, null), lokale Variablen nicht
 *   - Methoden werden dynamisch gebunden (Polymorphie)
 */

import type { Statement, Expression, FieldDecl, MethodDecl, Program, TypeRef } from './ast'
import { parse } from './parser'
import {
  toNumber,
  doubleText,
  identity,
  contentEquals,
  isNumber,
  comma,
  newString,
  NULL,
  poolString,
  keyOf,
  textOf,
  typeName,
  bool,
  number,
  chars,
  type JavaObject,
  type ClassInfo,
  type NativeValue,
  type Value,
} from './values'
import {
  BUILTIN_CLASSES,
  isExceptionClass,
  createNative,
  nativeMethod,
  nativeField,
  superclassOf,
  primitiveMethod,
  staticCall,
  staticField,
  stringMethod,
} from './library'
import type { Extension } from './extension'

// ---------------------------------------------------------------------------
// Fehler und Signale
// ---------------------------------------------------------------------------

/** Eine Java-Exception - fangbar mit try/catch. */
export class JavaException extends Error {
  value: Value
  line: number

  constructor(value: Value, line: number) {
    super('java exception')
    this.name = 'JavaAusnahme'
    this.value = value
    this.line = line
  }
}

/** Abbruch von außen: Endlosschleife, zu viel Ausgabe. Nicht fangbar. */
export class JavaAbort extends Error {
  de: string
  en: string
  /** Zeile, falls der Abbruch zu einer bestimmten Stelle gehört. */
  line?: number

  constructor(de: string, en: string, line?: number) {
    super(de)
    this.name = 'JavaAbbruch'
    this.de = de
    this.en = en
    this.line = line
  }
}

class Return {
  value: Value
  constructor(value: Value) {
    this.value = value
  }
}
const BREAK = Symbol('break')
const CONTINUE = Symbol('continue')
type Flow = void | Return | typeof BREAK | typeof CONTINUE

const MAX_STEPS = 4_000_000
const MAX_LINES = 500

// ---------------------------------------------------------------------------
// Sichtbarkeitsbereiche
// ---------------------------------------------------------------------------

type Entry = { value: Value; type: TypeRef; final: boolean }

export class Scope {
  private variables = new Map<string, Entry>()
  parent?: Scope

  constructor(parent?: Scope) {
    this.parent = parent
  }

  declare(name: string, value: Value, type: TypeRef, final = false) {
    this.variables.set(name, { value, type, final })
  }
  find(name: string): Entry | undefined {
    return this.variables.get(name) ?? this.parent?.find(name)
  }
  set(name: string, value: Value): boolean {
    const entry = this.variables.get(name)
    if (entry) {
      entry.value = value
      return true
    }
    return this.parent?.set(name, value) ?? false
  }
  /** Alle sichtbaren Variablen (für die Testauswertung nach dem Lauf). */
  all(): Map<string, Entry> {
    const map = new Map(this.parent?.all() ?? [])
    for (const [k, v] of this.variables) map.set(k, v)
    return map
  }
}

type Context = {
  scope: Scope
  /** Das Objekt, auf dem gerade eine Methode läuft (`this`) - null bei static. */
  self: JavaObject | null
  /** Die Klasse, in der der laufende Code steht - wichtig für `super`. */
  classInfo: ClassInfo | null
}

export type OutputLine = { stream: 'out' | 'err'; text: string }

// ---------------------------------------------------------------------------
// Der Interpreter
// ---------------------------------------------------------------------------

export class Interpreter {
  classes = new Map<string, ClassInfo>()
  lines: OutputLine[] = []
  /** Die Umgebung von `main` nach dem Lauf - darin prüfen die Übungstests. */
  globalScope: Scope | null = null
  mainClass: ClassInfo | null = null

  /** Additional library, e.g. Spring - see extension.ts. */
  readonly extension?: Extension

  private steps = 0
  private buffer = { out: '', err: '' }

  constructor(program: Program, extension?: Extension) {
    this.extension = extension
    for (const decl of program.types) {
      if (this.classes.has(decl.name)) {
        throw new JavaAbort(
          `Die Klasse ${decl.name} ist doppelt deklariert.`,
          `duplicate class: ${decl.name}`,
        )
      }
      const classInfo: ClassInfo = {
        name: decl.name,
        decl,
        interfaces: new Set(decl.interfaces),
        isStatic: new Map(),
        methods: new Map(),
        constructors: [],
        isAbstract: decl.isAbstract,
        isInterface: decl.kind === 'interface',
        isEnum: decl.kind === 'enum',
      }
      for (const m of decl.methods) {
        if (m.isConstructor) classInfo.constructors.push(m)
        else {
          const list = classInfo.methods.get(m.name) ?? []
          list.push(m)
          classInfo.methods.set(m.name, list)
        }
      }
      this.classes.set(decl.name, classInfo)
    }

    // Verwandtschaft auflösen, dann records/enums vervollständigen.
    for (const classInfo of this.classes.values()) {
      if (classInfo.decl.superclass) classInfo.superclass = this.classes.get(classInfo.decl.superclass)
      if (classInfo.decl.outer) classInfo.outer = this.classes.get(classInfo.decl.outer)
      for (const name of classInfo.decl.interfaces) {
        const i = this.classes.get(name)
        if (i) for (const inherited of i.interfaces) classInfo.interfaces.add(inherited)
      }
      let top = classInfo.superclass
      while (top) {
        for (const i of top.interfaces) classInfo.interfaces.add(i)
        top = top.superclass
      }
      if (classInfo.decl.components) this.completeRecord(classInfo)
    }
    for (const classInfo of this.classes.values()) this.loadStatics(classInfo)
  }

  // --- Ausgabe -------------------------------------------------------------

  print(text: string, stream: 'out' | 'err' = 'out') {
    this.buffer[stream] += text
    let newline = this.buffer[stream].indexOf('\n')
    while (newline >= 0) {
      this.writeLine(this.buffer[stream].slice(0, newline), stream)
      this.buffer[stream] = this.buffer[stream].slice(newline + 1)
      newline = this.buffer[stream].indexOf('\n')
    }
    if (this.buffer[stream].length > 10_000) {
      throw new JavaAbort('Zu viel Ausgabe in einer Zeile.', 'too much output on one line')
    }
  }

  private writeLine(text: string, stream: 'out' | 'err') {
    if (this.lines.length >= MAX_LINES) {
      throw new JavaAbort(
        `Mehr als ${MAX_LINES} Ausgabezeilen - läuft da eine Endlosschleife?`,
        `more than ${MAX_LINES} lines of output - is there an endless loop?`,
      )
    }
    this.lines.push({ stream, text })
  }

  /** Reste ohne Zeilenumbruch am Ende trotzdem zeigen (print statt println). */
  finish() {
    for (const stream of ['out', 'err'] as const) {
      if (this.buffer[stream]) {
        this.writeLine(this.buffer[stream], stream)
        this.buffer[stream] = ''
      }
    }
  }

  // --- Klassen vorbereiten --------------------------------------------------

  private completeRecord(classInfo: ClassInfo) {
    for (const k of classInfo.decl.components!) {
      if (!classInfo.decl.fields.some((f) => f.name === k.name)) {
        classInfo.decl.fields.push({
          name: k.name,
          type: k.type,
          isStatic: false,
          final: true,
          visibility: 'private',
          line: classInfo.decl.line,
        })
      }
    }
  }

  private loadStatics(classInfo: ClassInfo) {
    const kontext: Context = { scope: new Scope(), self: null, classInfo }
    for (const field of classInfo.decl.fields) {
      if (!field.isStatic) continue
      classInfo.isStatic.set(field.name, field.init ? this.adapt(this.evaluate(field.init, kontext), field.type) : this.defaultValue(field.type))
    }
    if (classInfo.isEnum) {
      const constants: Value[] = []
      classInfo.decl.constants.forEach((constant, index) => {
        const args = constant.args.map((a) => this.evaluate(a, kontext))
        const object = this.createObject(classInfo, args, classInfo.decl.line)
        object.fields.set('$name', poolString(constant.name))
        object.fields.set('$ordinal', number(index))
        classInfo.isStatic.set(constant.name, object)
        constants.push(object)
      })
      classInfo.isStatic.set('$werte', { kind: 'array', type: classInfo.name, values: constants })
    }
  }

  // --- Programmstart --------------------------------------------------------

  /** Sucht `public static void main(String[] args)` und führt sie aus. */
  start() {
    const withMain = [...this.classes.values()].filter((k) => (k.methods.get('main') ?? []).some((m) => m.isStatic))
    const classInfo = withMain.find((k) => k.name === 'Main') ?? withMain[0]
    if (!classInfo) {
      throw new JavaAbort(
        'Keine main-Methode gefunden. Ein Java-Programm startet in `public static void main(String[] args)`.',
        'No main method found. A Java program starts in `public static void main(String[] args)`.',
      )
    }
    this.mainClass = classInfo
    const method = (classInfo.methods.get('main') ?? []).find((m) => m.isStatic)!
    const scope = new Scope()
    scope.declare('args', { kind: 'array', type: 'String', values: [] }, method.params[0]?.type ?? { name: 'String', dimensions: 1, args: [] })
    this.globalScope = scope
    this.runStatements(method.body?.statements ?? [], { scope, self: null, classInfo })
    this.finish()
  }

  /** Wertet einen einzelnen Ausdruck im Zustand nach `main` aus (für Tests). */
  evaluateExpression(source: string): Value {
    const program = parse(`class $Test { static Object $wert() { return ${source}; } }`)
    const method = program.types[0].methods[0]
    const kontext: Context = {
      scope: new Scope(this.globalScope ?? undefined),
      self: null,
      classInfo: this.mainClass,
    }
    const flow = this.runStatements(method.body!.statements, kontext)
    return flow instanceof Return ? flow.value : NULL
  }

  // --- Anweisungen ----------------------------------------------------------

  private tick() {
    if (++this.steps > MAX_STEPS) {
      throw new JavaAbort(
        'Das Programm läuft zu lange - vermutlich eine Endlosschleife.',
        'The program runs too long - probably an endless loop.',
      )
    }
  }

  private runStatements(statements: Statement[], kontext: Context): Flow {
    for (const a of statements) {
      const flow = this.execute(a, kontext)
      if (flow) return flow
    }
  }

  private execute(statement: Statement, kontext: Context): Flow {
    this.tick()
    switch (statement.kind) {
      case 'empty':
        return

      case 'block':
        return this.runStatements(statement.statements, { ...kontext, scope: new Scope(kontext.scope) })

      case 'local': {
        for (const v of statement.variables) {
          const type: TypeRef = { ...statement.type, dimensions: statement.type.dimensions + v.dimensions }
          let value = v.init ? this.evaluate(v.init, kontext, type) : { kind: 'null' as const }
          if (v.init) value = this.adapt(value, type)
          kontext.scope.declare(v.name, value, type, statement.final)
        }
        return
      }

      case 'expression':
        this.evaluate(statement.expression, kontext)
        return

      case 'if':
        if (this.truthValue(this.evaluate(statement.condition, kontext), statement.line)) {
          return this.execute(statement.thenBranch, kontext)
        }
        return statement.elseBranch ? this.execute(statement.elseBranch, kontext) : undefined

      case 'while':
        while (this.truthValue(this.evaluate(statement.condition, kontext), statement.line)) {
          this.tick()
          const flow = this.execute(statement.body, kontext)
          if (flow === BREAK) break
          if (flow instanceof Return) return flow
        }
        return

      case 'doWhile':
        do {
          this.tick()
          const flow = this.execute(statement.body, kontext)
          if (flow === BREAK) break
          if (flow instanceof Return) return flow
        } while (this.truthValue(this.evaluate(statement.condition, kontext), statement.line))
        return

      case 'for': {
        const inner: Context = { ...kontext, scope: new Scope(kontext.scope) }
        for (const i of statement.init) this.execute(i, inner)
        while (!statement.condition || this.truthValue(this.evaluate(statement.condition, inner), statement.line)) {
          this.tick()
          const flow = this.execute(statement.body, inner)
          if (flow === BREAK) break
          if (flow instanceof Return) return flow
          for (const s of statement.update) this.evaluate(s, inner)
        }
        return
      }

      case 'forEach': {
        const source = this.evaluate(statement.source, kontext)
        const elements = this.elementsOf(source, statement.line)
        for (const element of elements) {
          this.tick()
          const inner: Context = { ...kontext, scope: new Scope(kontext.scope) }
          inner.scope.declare(statement.name, this.adapt(element, statement.type), statement.type)
          const flow = this.execute(statement.body, inner)
          if (flow === BREAK) break
          if (flow instanceof Return) return flow
        }
        return
      }

      case 'switch':
        return this.runSwitch(statement, kontext).flow

      case 'return':
        return new Return(statement.value ? this.evaluate(statement.value, kontext) : NULL)

      case 'break':
        return BREAK

      case 'continue':
        return CONTINUE

      case 'throw': {
        const value = this.evaluate(statement.value, kontext)
        if (value.kind === 'null') this.raise('NullPointerException', null, statement.line)
        throw new JavaException(value, statement.line)
      }

      case 'try':
        return this.runTry(statement, kontext)
    }
  }

  private runSwitch(
    statement: Extract<Statement, { kind: 'switch' }>,
    kontext: Context,
  ): { flow: Flow; result?: Value } {
    const value = this.evaluate(statement.value, kontext)
    const matches = (candidate: Expression) => {
      // In `case ROT:` steht der Enum-Name ohne Klasse davor.
      if (candidate.kind === 'name' && value.kind === 'object' && value.classInfo.isEnum) {
        return value.classInfo.isStatic.get(candidate.name) === value
      }
      return contentEquals(this.evaluate(candidate, kontext), value)
    }

    let start = statement.cases.findIndex((f) => f.values.length > 0 && f.values.some(matches))
    if (start < 0) start = statement.cases.findIndex((f) => f.values.length === 0)
    if (start < 0) return { flow: undefined }

    const inner: Context = { ...kontext, scope: new Scope(kontext.scope) }
    if (statement.arrow) {
      const switchCase = statement.cases[start]
      if (switchCase.result) return { flow: undefined, result: this.evaluate(switchCase.result, inner) }
      const flow = this.runStatements(switchCase.statements, inner)
      return { flow: flow === BREAK ? undefined : flow }
    }
    // Klassisches switch: ohne break läuft es in den nächsten Fall weiter.
    for (let i = start; i < statement.cases.length; i++) {
      const flow = this.runStatements(statement.cases[i].statements, inner)
      if (flow === BREAK) return { flow: undefined }
      if (flow) return { flow }
    }
    return { flow: undefined }
  }

  private runTry(statement: Extract<Statement, { kind: 'try' }>, kontext: Context): Flow {
    let flow: Flow
    try {
      flow = this.execute(statement.body, kontext)
    } catch (error) {
      if (!(error instanceof JavaException)) throw error
      const catches = statement.catches.find((f) => f.types.some((t) => this.isInstance(error.value, t)))
      if (!catches) {
        if (statement.finallyBlock) this.execute(statement.finallyBlock, kontext)
        throw error
      }
      const inner: Context = { ...kontext, scope: new Scope(kontext.scope) }
      inner.scope.declare(catches.name, error.value, { name: catches.types[0], dimensions: 0, args: [] })
      try {
        flow = this.execute(catches.body, inner)
      } finally {
        if (statement.finallyBlock) this.execute(statement.finallyBlock, kontext)
      }
      return flow
    }
    if (statement.finallyBlock) {
      const flowEnd = this.execute(statement.finallyBlock, kontext)
      if (flowEnd) return flowEnd
    }
    return flow
  }

  // --- Ausdrücke ------------------------------------------------------------

  private evaluate(expression: Expression, kontext: Context, expected?: TypeRef): Value {
    this.tick()
    switch (expression.kind) {
      case 'literal': {
        const l = expression.value
        switch (l.type) {
          case 'int':
            return { kind: 'int', value: l.value }
          case 'double':
            return comma(l.value)
          case 'boolean':
            return bool(l.value)
          case 'char':
            return chars(l.value)
          case 'String':
            return poolString(l.value)
          default:
            return NULL
        }
      }

      case 'name':
        return this.readName(expression.name, kontext, expression.line)

      case 'this':
        if (!kontext.self) this.abort('`this` gibt es in einer static-Methode nicht.', 'non-static variable this cannot be referenced from a static context')
        return kontext.self!

      case 'super':
        return kontext.self ?? NULL

      case 'classLiteral':
        return { kind: 'native', type: 'Class', data: { text: expression.className, classInfo: this.classes.get(expression.className) } }

      case 'field':
        return this.readField(expression.target, expression.name, kontext, expression.line)

      case 'index': {
        const target = this.evaluate(expression.target, kontext)
        const index = toNumber(this.evaluate(expression.index, kontext))
        return this.readArray(target, index, expression.line)
      }

      case 'arrayLiteral': {
        const values = expression.values.map((w) => this.evaluate(w, kontext))
        const type = expected?.name ?? 'Object'
        return { kind: 'array', type, values: values.map((w) => this.adapt(w, { name: type, dimensions: 0, args: [] })) }
      }

      case 'newArray':
        return this.createArray(expression, kontext)

      case 'new':
        return this.instantiate(expression.classInfo, expression.args.map((a) => this.evaluate(a, kontext)), expression.line)

      case 'call':
        return this.evaluateCall(expression, kontext)

      case 'assign':
        return this.assign(expression, kontext)

      case 'increment': {
        const previous = this.evaluate(expression.target, kontext)
        const one: Value = { kind: 'int', value: 1 }
        const fresh = this.compute(expression.operator === '++' ? '+' : '-', previous, one, expression.line)
        const stored = this.write(expression.target, fresh, kontext, expression.line)
        return expression.prefix ? stored : previous
      }

      case 'binary':
        return this.evaluateBinary(expression, kontext)

      case 'unary': {
        const value = this.evaluate(expression.expression, kontext)
        if (expression.operator === '!') return bool(!this.truthValue(value, expression.line))
        if (expression.operator === '-') {
          if (value.kind === 'double') return comma(-value.value)
          return number(-toNumber(value))
        }
        if (expression.operator === '~') return number(~toNumber(value))
        return value.kind === 'char' ? number(value.value) : value
      }

      case 'ternary':
        return this.truthValue(this.evaluate(expression.condition, kontext), expression.line)
          ? this.evaluate(expression.thenBranch, kontext, expected)
          : this.evaluate(expression.elseBranch, kontext, expected)

      case 'instanceof': {
        const value = this.evaluate(expression.expression, kontext)
        const matches = value.kind !== 'null' && this.isInstance(value, expression.type.replace(/\[\]$/, ''))
        if (matches && expression.binding) {
          kontext.scope.declare(expression.binding, value, { name: expression.type, dimensions: 0, args: [] })
        }
        return bool(matches)
      }

      case 'cast':
        return this.convert(this.evaluate(expression.expression, kontext, expression.type), expression.type, expression.line)

      case 'lambda': {
        const body = expression.body
        const caught = kontext
        return {
          kind: 'function',
          call: (args) => {
            const inner: Context = { ...caught, scope: new Scope(caught.scope) }
            expression.params.forEach((p, i) => {
              inner.scope.declare(p, args[i] ?? NULL, { name: 'var', dimensions: 0, args: [] })
            })
            if ('kind' in body && body.kind === 'block') {
              const flow = this.runStatements(body.statements, inner)
              return flow instanceof Return ? flow.value : NULL
            }
            return this.evaluate(body as Expression, inner)
          },
        }
      }

      case 'methodRef': {
        const target = expression.target
        const name = expression.name
        return {
          kind: 'function',
          call: (args) => {
            if (name === '<init>') return this.instantiate(target, args, expression.line)
            const classInfo = this.classes.get(target)
            if (classInfo || this.isBuiltIn(target)) {
              // Statisch (Integer::parseInt) oder auf dem ersten Argument (String::toUpperCase).
              try {
                return this.callStatic(target, name, args, expression.line)
              } catch {
                return this.callMethod(args[0], name, args.slice(1), expression.line)
              }
            }
            const value = this.readName(target, kontext, expression.line)
            return this.callMethod(value, name, args, expression.line)
          },
        }
      }

      case 'switchExpression': {
        const result = this.runSwitch(expression.statement as Extract<Statement, { kind: 'switch' }>, kontext)
        if (result.result) return result.result
        if (result.flow instanceof Return) return result.flow.value
        return NULL
      }
    }
  }

  private evaluateBinary(expression: Extract<Expression, { kind: 'binary' }>, kontext: Context): Value {
    const { operator, line } = expression
    // && und || werten die rechte Seite nur aus, wenn sie noch gebraucht wird.
    if (operator === '&&' || operator === '||') {
      const left = this.truthValue(this.evaluate(expression.left, kontext), line)
      if (operator === '&&' && !left) return bool(false)
      if (operator === '||' && left) return bool(true)
      return bool(this.truthValue(this.evaluate(expression.right, kontext), line))
    }

    const left = this.evaluate(expression.left, kontext)
    const right = this.evaluate(expression.right, kontext)

    if (operator === '==' || operator === '!=') {
      const same = this.identical(left, right)
      return bool(operator === '==' ? same : !same)
    }

    // String + irgendwas: Der Sonderfall, den Java als einziges "Operator-Überladen" kennt.
    if (operator === '+' && (left.kind === 'string' || right.kind === 'string')) {
      const text = this.toText(left) + this.toText(right)
      // Zwei Literale fasst schon der Compiler zusammen - das Ergebnis liegt im Pool.
      const bothLiteral = expression.left.kind === 'literal' && expression.right.kind === 'literal'
      return bothLiteral ? poolString(text) : newString(text)
    }

    return this.compute(operator, left, right, line)
  }

  private compute(operator: string, left: Value, right: Value, line: number): Value {
    if (operator === '&' && left.kind === 'boolean' && right.kind === 'boolean') return bool(left.value && right.value)
    if (operator === '|' && left.kind === 'boolean' && right.kind === 'boolean') return bool(left.value || right.value)
    if (operator === '^' && left.kind === 'boolean' && right.kind === 'boolean') return bool(left.value !== right.value)

    if (!isNumber(left) || !isNumber(right)) {
      this.abort(
        `Der Operator ${operator} passt nicht zu ${typeName(left)} und ${typeName(right)}.`,
        `bad operand types for operator '${operator}': ${typeName(left)}, ${typeName(right)}`,
      )
    }
    const a = toNumber(left)
    const b = toNumber(right)

    switch (operator) {
      case '<':
        return bool(a < b)
      case '>':
        return bool(a > b)
      case '<=':
        return bool(a <= b)
      case '>=':
        return bool(a >= b)
    }

    // Sobald ein double beteiligt ist, rechnet Java in double weiter.
    const isFloat = left.kind === 'double' || right.kind === 'double'
    switch (operator) {
      case '+':
        return isFloat ? comma(a + b) : number(a + b)
      case '-':
        return isFloat ? comma(a - b) : number(a - b)
      case '*':
        return isFloat ? comma(a * b) : number(Math.imul(a | 0, b | 0))
      case '/':
        if (!isFloat) {
          if (b === 0) this.raise('ArithmeticException', '/ by zero', line)
          return number(Math.trunc(a / b))
        }
        return comma(a / b)
      case '%':
        if (!isFloat && b === 0) this.raise('ArithmeticException', '/ by zero', line)
        return isFloat ? comma(a % b) : number(a % b)
      case '&':
        return number(a & b)
      case '|':
        return number(a | b)
      case '^':
        return number(a ^ b)
      case '<<':
        return number(a << b)
      case '>>':
        return number(a >> b)
      case '>>>':
        return number(a >>> b)
    }
    this.abort(`Unbekannter Operator ${operator}.`, `unknown operator ${operator}`)
  }

  /** `==`: Zahlen nach Wert, alles andere nach Identität - die klassische Java-Falle. */
  private identical(a: Value, b: Value): boolean {
    if (a.kind === 'null' || b.kind === 'null') return a.kind === b.kind
    if (isNumber(a) && isNumber(b)) return toNumber(a) === toNumber(b)
    if (a.kind === 'boolean' && b.kind === 'boolean') return a.value === b.value
    return a === b
  }

  // --- Lesen und Schreiben --------------------------------------------------

  /**
   * Alle Klassen, deren static-Felder und -Methoden von hier aus sichtbar sind:
   * die eigene Klasse samt Oberklassen - und dasselbe für jede umgebende Klasse.
   */
  private *visibleClasses(start: ClassInfo | null): Generator<ClassInfo> {
    for (let outerClass: ClassInfo | undefined = start ?? undefined; outerClass; outerClass = outerClass.outer) {
      for (let k: ClassInfo | undefined = outerClass; k; k = k.superclass) yield k
    }
  }

  private readName(name: string, kontext: Context, line: number): Value {
    const local = kontext.scope.find(name)
    if (local) return local.value

    if (kontext.self) {
      const object = kontext.self
      if (object.fields.has(name)) return object.fields.get(name)!
    }
    for (const k of this.visibleClasses(kontext.classInfo)) {
      if (k.isStatic.has(name)) return k.isStatic.get(name)!
    }
    this.abort(`Die Variable \`${name}\` gibt es hier nicht.`, `cannot find symbol: variable ${name}`, line)
  }

  private readField(targetExpression: Expression, name: string, kontext: Context, line: number): Value {
    // Klassenname davor? Dann ist es ein statisches Feld (Math.PI, Integer.MAX_VALUE).
    if (targetExpression.kind === 'name' && !kontext.scope.find(targetExpression.name)) {
      const className = targetExpression.name
      const classInfo = this.classes.get(className)
      if (classInfo) {
        for (let k: ClassInfo | undefined = classInfo; k; k = k.superclass) {
          if (k.isStatic.has(name)) return k.isStatic.get(name)!
        }
        this.abort(`${className} hat kein statisches Feld \`${name}\`.`, `cannot find symbol: variable ${name}`, line)
      }
      const builtIn = this.extension?.staticField?.(className, name, this) ?? staticField(className, name, this)
      if (builtIn) return builtIn
    }

    const target = this.evaluate(targetExpression, kontext)
    if (target.kind === 'null') this.raise('NullPointerException', `Cannot read field "${name}" because the value is null`, line)
    if (target.kind === 'array' && name === 'length') return number(target.values.length)
    if (target.kind === 'object') {
      if (target.fields.has(name)) return target.fields.get(name)!
      for (let k: ClassInfo | undefined = target.classInfo; k; k = k.superclass) {
        if (k.isStatic.has(name)) return k.isStatic.get(name)!
      }
    }
    if (target.kind === 'native') {
      const value = nativeField(target, name, this)
      if (value) return value
    }
    this.abort(`\`${name}\` gibt es bei ${typeName(target)} nicht.`, `cannot find symbol: variable ${name}`, line)
  }

  private readArray(target: Value, index: number, line: number): Value {
    if (target.kind === 'null') this.raise('NullPointerException', 'Cannot load from null array', line)
    if (target.kind !== 'array') {
      this.abort(`${typeName(target)} ist kein Array.`, `array required, but ${typeName(target)} found`, line)
    }
    if (index < 0 || index >= target.values.length) {
      this.raise('ArrayIndexOutOfBoundsException', `Index ${index} out of bounds for length ${target.values.length}`, line)
    }
    return target.values[index]
  }

  private assign(expression: Extract<Expression, { kind: 'assign' }>, kontext: Context): Value {
    const targetType = this.typeOfTarget(expression.target, kontext)
    let value: Value
    if (expression.operator === '=') {
      value = this.evaluate(expression.value, kontext, targetType)
    } else {
      const previous = this.evaluate(expression.target, kontext)
      const right = this.evaluate(expression.value, kontext)
      const operator = expression.operator.slice(0, -1)
      if (operator === '+' && previous.kind === 'string') {
        value = newString(previous.value + this.toText(right))
      } else {
        value = this.compute(operator, previous, right, expression.line)
        // `int x = 5; x += 1.5;` ist in Java erlaubt - es wird still abgeschnitten.
        if (targetType && ['int', 'long', 'short', 'byte', 'char'].includes(targetType.name) && targetType.dimensions === 0 && value.kind === 'double') {
          value = targetType.name === 'char' ? chars(Math.trunc(value.value)) : number(Math.trunc(value.value))
        }
      }
    }
    if (targetType) value = this.adapt(value, targetType)
    return this.write(expression.target, value, kontext, expression.line)
  }

  /** Der deklarierte Typ des Ziels - nötig für `double d = 5;` und `x += 1.5`. */
  private typeOfTarget(target: Expression, kontext: Context): TypeRef | undefined {
    if (target.kind === 'name') {
      const local = kontext.scope.find(target.name)
      if (local) return local.type
      for (let k: ClassInfo | undefined = kontext.classInfo ?? undefined; k; k = k.superclass) {
        const field = k.decl.fields.find((f) => f.name === target.name)
        if (field) return field.type
      }
      return undefined
    }
    if (target.kind === 'field') {
      const base = target.target
      if (base.kind === 'this' && kontext.classInfo) {
        for (let k: ClassInfo | undefined = kontext.classInfo; k; k = k.superclass) {
          const field = k.decl.fields.find((f) => f.name === target.name)
          if (field) return field.type
        }
      }
      return undefined
    }
    return undefined
  }

  private write(target: Expression, value: Value, kontext: Context, line: number): Value {
    if (target.kind === 'name') {
      const local = kontext.scope.find(target.name)
      if (local) {
        if (local.final) {
          this.abort(
            `\`${target.name}\` ist final und kann nicht neu zugewiesen werden.`,
            `cannot assign a value to final variable ${target.name}`,
            line,
          )
        }
        kontext.scope.set(target.name, value)
        return value
      }
      if (kontext.self?.fields.has(target.name)) {
        kontext.self.fields.set(target.name, value)
        return value
      }
      for (const k of this.visibleClasses(kontext.classInfo)) {
        if (k.isStatic.has(target.name)) {
          k.isStatic.set(target.name, value)
          return value
        }
      }
      this.abort(`Die Variable \`${target.name}\` gibt es hier nicht.`, `cannot find symbol: variable ${target.name}`, line)
    }

    if (target.kind === 'field') {
      if (target.target.kind === 'name' && !kontext.scope.find(target.target.name)) {
        const classInfo = this.classes.get(target.target.name)
        if (classInfo) {
          for (let k: ClassInfo | undefined = classInfo; k; k = k.superclass) {
            if (k.isStatic.has(target.name)) {
              k.isStatic.set(target.name, value)
              return value
            }
          }
        }
      }
      const object = this.evaluate(target.target, kontext)
      if (object.kind === 'null') this.raise('NullPointerException', `Cannot assign field "${target.name}" because the value is null`, line)
      if (object.kind !== 'object') {
        this.abort(`${typeName(object)} hat kein Feld \`${target.name}\`.`, `cannot find symbol: variable ${target.name}`, line)
      }
      object.fields.set(target.name, value)
      return value
    }

    if (target.kind === 'index') {
      const array = this.evaluate(target.target, kontext)
      const index = toNumber(this.evaluate(target.index, kontext))
      if (array.kind === 'null') this.raise('NullPointerException', 'Cannot store to null array', line)
      if (array.kind !== 'array') this.abort(`${typeName(array)} ist kein Array.`, `array required, but ${typeName(array)} found`, line)
      if (index < 0 || index >= array.values.length) {
        this.raise('ArrayIndexOutOfBoundsException', `Index ${index} out of bounds for length ${array.values.length}`, line)
      }
      array.values[index] = this.adapt(value, { name: array.type, dimensions: 0, args: [] })
      return array.values[index]
    }

    this.abort('Hier kann nichts zugewiesen werden.', 'unexpected type: variable required', line)
  }

  // --- Aufrufe --------------------------------------------------------------

  private evaluateCall(expression: Extract<Expression, { kind: 'call' }>, kontext: Context): Value {
    const { name, line } = expression
    const args = expression.args.map((a) => this.evaluate(a, kontext))

    // super(...) und this(...) im Konstruktor
    if (name === '<superinit>' || name === '<init>') {
      const classInfo = name === '<superinit>' ? kontext.classInfo?.superclass : kontext.classInfo
      if (classInfo && kontext.self) this.runConstructor(classInfo, kontext.self, args, line, name === '<init>')
      return NULL
    }

    // Ohne Ziel: eigene Methode (static oder auf this), sonst eine der umgebenden Klasse
    if (!expression.target) {
      const classInfo = kontext.classInfo
      if (classInfo) {
        const found = this.findMethod(kontext.self?.classInfo ?? classInfo, name, args)
        if (found) return this.runMethod(found.classInfo, found.method, kontext.self, args, line)
        for (let outerClass = classInfo.outer; outerClass; outerClass = outerClass.outer) {
          const outerMethod = this.findMethod(outerClass, name, args)
          if (outerMethod) return this.runMethod(outerMethod.classInfo, outerMethod.method, null, args, line)
        }
        // Von Object geerbt: toString(), getClass(), hashCode() ohne `this.` davor.
        if (kontext.self) {
          const inherited = this.objectDefaultMethod(kontext.self, name, args)
          if (inherited) return inherited
        }
      }
      this.abort(`Die Methode \`${name}\` gibt es hier nicht.`, `cannot find symbol: method ${name}`, line)
    }

    // super.methode(): bewusst NICHT dynamisch binden
    if (expression.viaSuper && kontext.classInfo?.superclass) {
      const found = this.findMethod(kontext.classInfo.superclass, name, args)
      if (found) return this.runMethod(found.classInfo, found.method, kontext.self, args, line)
      this.abort(`Die Oberklasse hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name}`, line)
    }

    // Klassenname davor: statischer Aufruf (Math.max, Integer.parseInt, Helfer.hilf)
    if (expression.target.kind === 'name' && !kontext.scope.find(expression.target.name)) {
      const className = expression.target.name
      const classInfo = this.classes.get(className)
      if (classInfo) {
        if (classInfo.isEnum && (name === 'values' || name === 'valueOf')) return this.enumStatic(classInfo, name, args, line)
        const found = this.findMethod(classInfo, name, args)
        if (found) return this.runMethod(found.classInfo, found.method, null, args, line)
        this.abort(`${className} hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name}`, line)
      }
      if (this.isBuiltIn(className)) return this.callStatic(className, name, args, line)
    }

    const target = this.evaluate(expression.target, kontext)
    return this.callMethod(target, name, args, line)
  }

  callStatic(classInfo: string, name: string, args: Value[], line: number): Value {
    return this.extension?.staticCall?.(classInfo, name, args, this, line) ?? staticCall(classInfo, name, args, this, line)
  }

  /** A class that can be used without a declaration - from the standard library or an extension. */
  isBuiltIn(className: string): boolean {
    return BUILTIN_CLASSES.has(className) || Boolean(this.extension?.classes.has(className))
  }

  /**
   * Runs one specific method on an object - for libraries that find methods by
   * their annotations (this is how Spring calls `@GetMapping` methods).
   */
  invoke(owner: ClassInfo, method: MethodDecl, self: JavaObject | null, args: Value[]): Value {
    return this.runMethod(owner, method, self, args, method.line)
  }

  /** Starts a fresh step budget - a server handles many requests, and each one gets its own limit. */
  resetStepLimit() {
    this.steps = 0
  }

  /** Methodenaufruf auf einem Wert - hier passiert die dynamische Bindung. */
  callMethod(target: Value, name: string, args: Value[], line: number): Value {
    if (target.kind === 'null') {
      this.raise('NullPointerException', `Cannot invoke "${name}()" because the value is null`, line)
    }
    if (target.kind === 'string') return stringMethod(target, name, args, this, line)
    if (target.kind === 'native') return this.extension?.method?.(target, name, args, this, line) ?? nativeMethod(target, name, args, this, line)
    if (target.kind === 'function') {
      // Funktionale Interfaces: egal ob apply, accept, test, get, run oder compare.
      return target.call(args)
    }
    if (target.kind === 'array') {
      if (name === 'clone') return { kind: 'array', type: target.type, values: [...target.values] }
      if (name === 'equals') return bool(target === args[0])
      if (name === 'toString') return newString(this.toText(target))
    }
    if (target.kind === 'object') {
      const found = this.findMethod(target.classInfo, name, args)
      if (found) return this.runMethod(found.classInfo, found.method, target, args, line)
      const builtIn = this.objectDefaultMethod(target, name, args)
      if (builtIn) return builtIn
      this.abort(`${target.classInfo.name} hat keine Methode \`${name}\`.`, `cannot find symbol: method ${name}`, line)
    }
    return primitiveMethod(target, name, args, this, line)
  }

  /** toString/equals/hashCode/getClass und die enum-Methoden gibt es immer. */
  private objectDefaultMethod(object: JavaObject, name: string, args: Value[]): Value | null {
    switch (name) {
      case 'toString':
        return newString(this.toText(object))
      case 'equals':
        return bool(this.recordEquals(object, args[0]))
      case 'hashCode':
        return number(parseInt(identity(object), 16) | 0)
      case 'getClass':
        return { kind: 'native', type: 'Class', data: { text: object.classInfo.name } }
      // Eigene Exceptions erben getMessage() von Throwable.
      case 'getMessage':
      case 'getLocalizedMessage':
        return object.fields.get('$meldung') ?? NULL
      case 'printStackTrace':
        this.print(this.exceptionText(object) + '\n', 'err')
        return NULL
      case 'name':
      case 'toUpperCase':
        if (object.classInfo.isEnum && name === 'name') return object.fields.get('$name') ?? NULL
        return null
      case 'ordinal':
        if (object.classInfo.isEnum) return object.fields.get('$ordinal') ?? number(0)
        return null
      case 'compareTo':
        if (object.classInfo.isEnum && args[0]?.kind === 'object') {
          return number(toNumber(object.fields.get('$ordinal')!) - toNumber(args[0].fields.get('$ordinal')!))
        }
        return null
      default:
        // record: die Komponenten sind gleichzeitig Getter.
        if (object.classInfo.decl.components?.some((k) => k.name === name) && !args.length) {
          return object.fields.get(name) ?? NULL
        }
        return null
    }
  }

  private recordEquals(object: JavaObject, other: Value): boolean {
    if (other?.kind !== 'object' || other.classInfo !== object.classInfo) return false
    const components = object.classInfo.decl.components
    if (!components) return object === other
    return components.every((k) => contentEquals(object.fields.get(k.name) ?? NULL, other.fields.get(k.name) ?? NULL))
  }

  private enumStatic(classInfo: ClassInfo, name: string, args: Value[], line: number): Value {
    if (name === 'values') {
      const values = classInfo.isStatic.get('$werte')
      return values?.kind === 'array' ? { kind: 'array', type: classInfo.name, values: [...values.values] } : NULL
    }
    const wanted = this.toText(args[0])
    const match = classInfo.isStatic.get(wanted)
    if (!match) this.raise('IllegalArgumentException', `No enum constant ${classInfo.name}.${wanted}`, line)
    return match!
  }

  /** Sucht die Methode ab `klasse` aufwärts und wählt die passende Überladung. */
  private findMethod(classInfo: ClassInfo, name: string, args: Value[]): { classInfo: ClassInfo; method: MethodDecl } | null {
    for (let k: ClassInfo | undefined = classInfo; k; k = k.superclass) {
      const candidates = (k.methods.get(name) ?? []).filter((m) => m.body)
      const method = this.chooseOverload(candidates, args)
      if (method) return { classInfo: k, method }
    }
    // default-Methoden aus Interfaces
    for (const name2 of classInfo.interfaces) {
      const i = this.classes.get(name2)
      const method = i && this.chooseOverload((i.methods.get(name) ?? []).filter((m) => m.body), args)
      if (method) return { classInfo: i!, method }
    }
    return null
  }

  private chooseOverload(candidates: MethodDecl[], args: Value[]): MethodDecl | undefined {
    const matching = candidates.filter((m) => m.params.length === args.length)
    if (matching.length <= 1) return matching[0] ?? candidates.find((m) => m.params.at(-1)?.varargs && args.length >= m.params.length - 1)
    // Mehrere gleich lange: die mit den genauesten Typen gewinnt.
    let best = matching[0]
    let bestScore = -1
    for (const m of matching) {
      const score = m.params.reduce((sum, p, i) => sum + this.match(args[i], p.type), 0)
      if (score > bestScore) {
        bestScore = score
        best = m
      }
    }
    return best
  }

  private match(value: Value, type: TypeRef): number {
    if (!value) return 0
    const name = type.name
    if (type.dimensions > 0) return value.kind === 'array' ? 3 : 0
    if (value.kind === 'string') return name === 'String' ? 3 : name === 'Object' || name === 'CharSequence' ? 1 : 0
    if (value.kind === 'int' || value.kind === 'long') {
      return ['int', 'long', 'short', 'byte'].includes(name) ? 3 : ['double', 'float'].includes(name) ? 2 : name === 'Integer' ? 3 : name === 'Object' ? 1 : 0
    }
    if (value.kind === 'double') return ['double', 'float'].includes(name) ? 3 : name === 'Double' ? 3 : name === 'Object' ? 1 : 0
    if (value.kind === 'char') return name === 'char' ? 3 : ['int', 'long', 'double'].includes(name) ? 2 : name === 'Object' ? 1 : 0
    if (value.kind === 'boolean') return name === 'boolean' || name === 'Boolean' ? 3 : name === 'Object' ? 1 : 0
    if (value.kind === 'object') return this.isInstance(value, name) ? 3 : name === 'Object' ? 1 : 0
    if (value.kind === 'native') return value.type === name ? 3 : this.isInstance(value, name) ? 2 : name === 'Object' ? 1 : 0
    if (value.kind === 'null') return ['int', 'double', 'boolean', 'char', 'long'].includes(name) ? 0 : 2
    return 1
  }

  private runMethod(classInfo: ClassInfo, method: MethodDecl, self: JavaObject | null, args: Value[], line: number): Value {
    if (!method.body) {
      this.abort(`\`${method.name}\` hat keinen Rumpf.`, `abstract method ${method.name} cannot be called`, line)
    }
    const scope = new Scope()
    method.params.forEach((p, i) => {
      if (p.varargs) {
        const rest = args.slice(i)
        const value: Value =
          rest.length === 1 && rest[0]?.kind === 'array' ? rest[0] : { kind: 'array', type: p.type.name, values: rest }
        scope.declare(p.name, value, p.type)
      } else {
        scope.declare(p.name, this.adapt(args[i] ?? NULL, p.type), p.type)
      }
    })
    const flow = this.runStatements(method.body.statements, {
      scope,
      self: method.isStatic ? null : self,
      classInfo,
    })
    const value = flow instanceof Return ? flow.value : NULL
    return this.adapt(value, method.returnType)
  }

  // --- Objekte erzeugen -----------------------------------------------------

  instantiate(className: string, args: Value[], line: number): Value {
    const classInfo = this.classes.get(className)
    if (classInfo) {
      if (classInfo.isAbstract) {
        this.abort(
          `${className} ist abstrakt - davon kann es kein Objekt geben.`,
          `${className} is abstract; cannot be instantiated`,
          line,
        )
      }
      return this.createObject(classInfo, args, line)
    }
    const native = this.extension?.create?.(className, args, this, line) ?? createNative(className, args, this, line)
    if (native) return native
    this.abort(`Die Klasse \`${className}\` ist unbekannt.`, `cannot find symbol: class ${className}`, line)
  }

  private createObject(classInfo: ClassInfo, args: Value[], line: number): JavaObject {
    const object: JavaObject = { kind: 'object', classInfo, fields: new Map() }
    // Felder bekommen IMMER einen Standardwert - anders als lokale Variablen.
    for (let k: ClassInfo | undefined = classInfo; k; k = k.superclass) {
      for (const field of k.decl.fields) {
        if (!field.isStatic && !object.fields.has(field.name)) object.fields.set(field.name, this.defaultValue(field.type))
      }
    }
    this.runConstructor(classInfo, object, args, line, false)
    return object
  }

  private runConstructor(classInfo: ClassInfo, object: JavaObject, args: Value[], line: number, viaThis: boolean) {
    const constructor = this.chooseOverload(classInfo.constructors, args)
    if (!constructor && classInfo.constructors.length && args.length) {
      this.abort(
        `Kein Konstruktor von ${classInfo.name} passt zu ${args.length} Argument(en).`,
        `constructor ${classInfo.name} cannot be applied to given types`,
        line,
      )
    }

    const scope = new Scope()
    constructor?.params.forEach((p, i) => scope.declare(p.name, this.adapt(args[i] ?? NULL, p.type), p.type))
    const kontext: Context = { scope, self: object, classInfo }

    const statements = constructor?.body?.statements ?? []
    const first = statements[0]
    const firstCall =
      first?.kind === 'expression' && first.expression.kind === 'call' && (first.expression.name === '<superinit>' || first.expression.name === '<init>')
        ? first.expression
        : null

    let setFields = !viaThis
    if (firstCall?.name === '<superinit>') {
      const superArgs = firstCall.args.map((a) => this.evaluate(a, kontext))
      if (classInfo.superclass) this.runConstructor(classInfo.superclass, object, superArgs, line, false)
      // `class MeinFehler extends RuntimeException`: die Oberklasse ist eingebaut,
      // super(meldung) muss die Nachricht trotzdem aufbewahren.
      else if (superArgs.length && classInfo.decl.superclass) object.fields.set('$meldung', superArgs[0])
    } else if (firstCall?.name === '<init>') {
      const own = firstCall.args.map((a) => this.evaluate(a, kontext))
      this.runConstructor(classInfo, object, own, line, false)
      setFields = false
    } else if (classInfo.superclass) {
      this.runConstructor(classInfo.superclass, object, [], line, false)
    }

    if (setFields) {
      for (const field of classInfo.decl.fields) {
        if (!field.isStatic && field.init) object.fields.set(field.name, this.adapt(this.evaluate(field.init, kontext, field.type), field.type))
      }
      // record: die Komponenten landen automatisch in den Feldern.
      if (classInfo.decl.components && !constructor) {
        classInfo.decl.components.forEach((k, i) => object.fields.set(k.name, this.adapt(args[i] ?? NULL, k.type)))
      }
    }

    if (constructor?.body) {
      this.runStatements(firstCall ? statements.slice(1) : statements, kontext)
    }
  }

  private createArray(expression: Extract<Expression, { kind: 'newArray' }>, kontext: Context): Value {
    if (expression.values) {
      const values = expression.values.map((w) =>
        w.kind === 'arrayLiteral'
          ? this.evaluate(w, kontext, { ...expression.type, dimensions: expression.type.dimensions - 1 })
          : this.adapt(this.evaluate(w, kontext), { ...expression.type, dimensions: 0 }),
      )
      return { kind: 'array', type: expression.type.name + '[]'.repeat(expression.type.dimensions - 1), values }
    }
    const sizes = expression.sizes.map((g) => toNumber(this.evaluate(g, kontext)))
    const build = (depth: number): Value => {
      const length = sizes[depth]
      if (length < 0) this.raise('NegativeArraySizeException', String(length), expression.line)
      if (length > 5_000_000) throw new JavaAbort('Das Array ist zu groß.', 'array too large')
      const rest = expression.type.dimensions - depth - 1
      const elementType = expression.type.name + '[]'.repeat(rest)
      const values: Value[] = []
      for (let i = 0; i < length; i++) {
        values.push(depth + 1 < sizes.length ? build(depth + 1) : this.defaultValue({ name: expression.type.name, dimensions: rest, args: [] }))
      }
      return { kind: 'array', type: elementType, values }
    }
    return build(0)
  }

  // --- Typen ----------------------------------------------------------------

  defaultValue(type: TypeRef): Value {
    if (type.dimensions > 0) return NULL
    switch (type.name) {
      case 'int':
      case 'short':
      case 'byte':
      case 'long':
        return number(0)
      case 'double':
      case 'float':
        return comma(0)
      case 'boolean':
        return bool(false)
      case 'char':
        return chars(0)
      default:
        return NULL
    }
  }

  /** Erweiternde Umwandlung: `double d = 5;` muss 5.0 ergeben. */
  adapt(value: Value, type: TypeRef | undefined): Value {
    if (!type || type.dimensions > 0) return value
    if ((type.name === 'double' || type.name === 'float' || type.name === 'Double') && (value.kind === 'int' || value.kind === 'long' || value.kind === 'char')) {
      return comma(value.value)
    }
    if ((type.name === 'int' || type.name === 'long' || type.name === 'Integer' || type.name === 'short' || type.name === 'byte') && value.kind === 'char') {
      return number(value.value)
    }
    if (type.name === 'char' && value.kind === 'int') return chars(value.value)
    if (type.name === 'String' && value.kind === 'char') return value
    return value
  }

  private convert(value: Value, type: TypeRef, line: number): Value {
    if (type.dimensions > 0) return value
    switch (type.name) {
      case 'int':
      case 'short':
      case 'byte':
        if (!isNumber(value)) break
        return number(Math.trunc(toNumber(value)))
      case 'long':
        if (!isNumber(value)) break
        return { kind: 'long', value: Math.trunc(toNumber(value)) }
      case 'double':
      case 'float':
        if (!isNumber(value)) break
        return comma(toNumber(value))
      case 'char':
        if (!isNumber(value)) break
        return chars(Math.trunc(toNumber(value)) & 0xffff)
      case 'boolean':
        return bool(this.truthValue(value, line))
      case 'Object':
        return value
    }
    if (value.kind !== 'null' && !this.isInstance(value, type.name)) {
      this.raise('ClassCastException', `class ${typeName(value)} cannot be cast to class ${type.name}`, line)
    }
    return value
  }

  /** `instanceof` und `catch`: läuft die Vererbungskette hoch. */
  isInstance(value: Value, type: string): boolean {
    if (type === 'Object') return value.kind !== 'null'
    switch (value.kind) {
      case 'string':
        return type === 'String' || type === 'CharSequence' || type === 'Comparable'
      case 'int':
      case 'long':
        return type === 'Integer' || type === 'Number' || type === 'Long'
      case 'double':
        return type === 'Double' || type === 'Number'
      case 'boolean':
        return type === 'Boolean'
      case 'char':
        return type === 'Character'
      case 'function':
        return true
      case 'array':
        return type.endsWith('[]') || type === 'Object'
      case 'object': {
        for (let k: ClassInfo | undefined = value.classInfo; k; k = k.superclass) {
          if (k.name === type) return true
          if (k.interfaces.has(type)) return true
          // Eigene Exception, die von einer eingebauten erbt
          if (!k.superclass && k.decl.superclass) {
            for (let e: string | undefined = k.decl.superclass; e; e = superclassOf(e) ?? this.extension?.superClasses?.[e]) {
              if (e === type) return true
            }
          }
        }
        return false
      }
      case 'native': {
        for (let t: string | undefined = value.type; t; t = superclassOf(t) ?? this.extension?.superClasses?.[t]) {
          if (t === type) return true
        }
        return ['List', 'Collection', 'Iterable'].includes(type) && ['ArrayList', 'LinkedList'].includes(value.type)
          ? true
          : type === 'Map' && ['HashMap', 'TreeMap', 'LinkedHashMap'].includes(value.type)
            ? true
            : type === 'Set' && ['HashSet', 'TreeSet', 'LinkedHashSet'].includes(value.type)
      }
      default:
        return false
    }
  }

  truthValue(value: Value, line: number): boolean {
    if (value.kind === 'boolean') return value.value
    if (value.kind === 'null') this.raise('NullPointerException', 'Cannot unbox null to boolean', line)
    this.abort(
      `Hier wird ein boolean gebraucht, nicht ${typeName(value)}. (In Java gibt es kein "truthy"!)`,
      `incompatible types: ${typeName(value)} cannot be converted to boolean`,
      line,
    )
  }

  /** Alles, was in eine for-each-Schleife darf. */
  elementsOf(value: Value, line: number): Value[] {
    if (value.kind === 'array') return [...value.values]
    if (value.kind === 'native') {
      if (value.data.list) return [...value.data.list]
      if (value.data.map) return [...value.data.map.values()].map((e) => ({ kind: 'native' as const, type: 'Entry', data: { list: [e.key, e.value] } }))
    }
    if (value.kind === 'null') this.raise('NullPointerException', 'Cannot iterate over null', line)
    this.abort(`Über ${typeName(value)} kann man nicht iterieren.`, `for-each not applicable to expression type ${typeName(value)}`, line)
  }

  // --- String-Darstellung ---------------------------------------------------

  /** `String.valueOf(wert)` inklusive eigener toString()-Methoden. */
  toText(value: Value): string {
    return textOf(value, (object) => {
      if (object.kind === 'object') {
        const own = this.findMethod(object.classInfo, 'toString', [])
        if (own) return this.toText(this.runMethod(own.classInfo, own.method, object, [], 0))
        if (object.classInfo.isEnum) return this.toText(object.fields.get('$name') ?? NULL)
        if (object.classInfo.decl.components) {
          const parts = object.classInfo.decl.components.map((k) => `${k.name}=${this.toText(object.fields.get(k.name) ?? NULL)}`)
          return `${object.classInfo.name}[${parts.join(', ')}]`
        }
        return `${object.classInfo.name}@${identity(object)}`
      }
      return this.nativeText(object)
    })
  }

  private nativeText(value: NativeValue): string {
    const own = this.extension?.text?.(value, this)
    if (own !== undefined) return own
    const { list, map, text, message } = value.data
    if (value.type === 'StringBuilder') return text ?? ''
    if (value.type === 'Class') return 'class ' + text
    if (value.type === 'Entry' && list) return `${this.toText(list[0])}=${this.toText(list[1])}`
    if (map) return `{${[...map.values()].map((e) => `${this.toText(e.key)}=${this.toText(e.value)}`).join(', ')}}`
    if (list) return `[${list.map((w) => this.toText(w)).join(', ')}]`
    if (isExceptionClass(value.type)) return message ? `${value.type}: ${message}` : value.type
    return `${value.type}@${identity(value)}`
  }

  /** Wie Java eine Exception beim Absturz meldet. */
  exceptionText(value: Value): string {
    if (value.kind === 'native') {
      const name = (this.extension?.packageOf?.(value.type) ?? 'java.lang') + '.' + value.type
      return value.data.message ? `${name}: ${value.data.message}` : name
    }
    if (value.kind === 'object') {
      const message = this.callMethod(value, 'getMessage', [], 0)
      const text = message.kind === 'null' ? '' : this.toText(message)
      return text ? `${value.classInfo.name}: ${text}` : value.classInfo.name
    }
    return this.toText(value)
  }

  // --- Fehler werfen --------------------------------------------------------

  /** Throws any Java value as an exception - e.g. the one an `orElseThrow` supplier created. */
  throwValue(value: Value, line: number): never {
    throw new JavaException(value, line)
  }

  /** Wirft eine eingebaute Exception (fangbar). */
  raise(classInfo: string, message: string | null, line: number): never {
    throw new JavaException({ kind: 'native', type: classInfo, data: { message: message ?? undefined } }, line)
  }

  /** Bricht ab: ein Fehler, den echtes Java schon beim Kompilieren finden würde. */
  abort(de: string, en: string, line?: number): never {
    throw new JavaAbort(de, en, line)
  }

  // Kleine Helfer, die die Bibliothek braucht ---------------------------------
  numberText = (v: number, isFloat: boolean) => (isFloat ? doubleText(v) : String(Math.trunc(v)))
  key = keyOf
  fieldDeclarations(classInfo: ClassInfo): FieldDecl[] {
    return classInfo.decl.fields
  }
}
