/**
 * JAVA-TEIL · Schritt 2 von 4: aus Token wird ein Syntaxbaum
 *
 * Ein klassischer "recursive descent"-Parser: für jede Regel der Grammatik
 * eine Funktion, die sich gegenseitig aufrufen. `ausdruck()` ruft `ternaer()`,
 * das ruft `oder()`, … bis hinunter zu `primaer()` - dadurch entsteht ganz
 * automatisch die richtige Punkt-vor-Strich-Reihenfolge.
 *
 * An zwei Stellen muss der Parser raten und darf zurückspringen (`sichern()`):
 *   - Ist `List<String> a = …` eine Deklaration oder ein Vergleich mit `<`?
 *   - Ist `(String) x` eine Umwandlung (Cast) oder eine Klammer?
 * Echtes javac macht dasselbe.
 */

import { JavaSyntaxError, tokenize, type Token } from './lexer'
import type {
  Annotation,
  AnnotationValue,
  Statement,
  Expression,
  Block,
  CatchClause,
  Literal,
  ParamDecl,
  Program,
  Visibility,
  SwitchCase,
  TypeDecl,
  TypeRef,
  VarDecl,
} from './ast'

const PRIMITIVES = new Set(['int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char', 'void', 'var'])

/** Modifikatoren, die vor Klassen, Feldern und Methoden stehen dürfen. */
const MODIFIERS = new Set([
  'public', 'private', 'protected', 'static', 'final', 'abstract', 'default',
  'synchronized', 'native', 'transient', 'volatile', 'strictfp',
])

type Modifiers = {
  isStatic: boolean
  final: boolean
  isAbstract: boolean
  visibility: Visibility
  annotations: Annotation[]
}

export function parse(source: string): Program {
  const tokens = tokenize(source)
  let pos = 0

  // --- Werkzeuge ------------------------------------------------------------
  const current = () => tokens[pos]
  const peek = (n = 1) => tokens[Math.min(pos + n, tokens.length - 1)]
  const atEnd = () => current().kind === 'end'
  const is = (text: string, n = 0) => peek(n).text === text && peek(n).kind !== 'text'
  const isName = (n = 0) => peek(n).kind === 'name'

  function fail(message: string, token: Token = current()): never {
    throw new JavaSyntaxError(message, token.line)
  }
  /** Nimmt das Token, wenn es passt - sonst false. */
  function accept(text: string) {
    if (is(text)) {
      pos++
      return true
    }
    return false
  }
  function expect(text: string): Token {
    if (!is(text)) fail(`'${text}' expected, found '${current().text}'`)
    return tokens[pos++]
  }
  function expectName(): string {
    if (current().kind !== 'name') fail(`<identifier> expected, found '${current().text}'`)
    return tokens[pos++].text
  }
  const mark = () => pos
  const back = (p: number) => {
    pos = p
  }

  /** `>>` und `>>>` schließen mehrere Generics auf einmal - hier aufspalten. */
  function closeAngle() {
    const t = current()
    if (t.text === '>') {
      pos++
      return true
    }
    if (t.text === '>>' || t.text === '>>>') {
      t.text = t.text.slice(1)
      return true
    }
    return false
  }

  // --- Typen ----------------------------------------------------------------

  function isTypeStart(n = 0) {
    const t = peek(n)
    return t.kind === 'name' || (t.kind === 'keyword' && PRIMITIVES.has(t.text))
  }

  /** Liest einen Typ. Gibt null zurück, wenn hier keiner steht (für Rateversuche). */
  function readType(): TypeRef | null {
    if (!isTypeStart()) return null
    let name = tokens[pos++].text
    // Punktnamen wie java.util.List: für uns zählt nur der letzte Teil.
    while (is('.') && isName(1)) {
      pos++
      name = tokens[pos++].text
    }
    const args: TypeRef[] = []
    if (is('<')) {
      const p = mark()
      pos++
      if (closeAngle()) {
        // Diamond <> - kein Argument
      } else {
        let ok = true
        while (true) {
          if (accept('?')) {
            if (accept('extends') || accept('super')) readType()
            args.push({ name: 'Object', dimensions: 0, args: [] })
          } else {
            const arg = readType()
            if (!arg) {
              ok = false
              break
            }
            args.push(arg)
          }
          if (accept(',')) continue
          if (closeAngle()) break
          ok = false
          break
        }
        if (!ok) {
          back(p) // war doch ein Vergleich, kein Generic
          return { name, dimensions: 0, args: [] }
        }
      }
    }
    let dimensions = 0
    while (is('[') && is(']', 1)) {
      pos += 2
      dimensions++
    }
    return { name, dimensions, args }
  }

  function expectType(): TypeRef {
    const type = readType()
    if (!type) fail(`<type> expected, found '${current().text}'`)
    return type
  }

  // --- Modifikatoren & Annotationen ----------------------------------------

  function readModifiers(): Modifiers {
    const m: Modifiers = { isStatic: false, final: false, isAbstract: false, visibility: 'package', annotations: [] }
    while (true) {
      // `@interface` would declare an annotation type - not supported here.
      if (is('@') && !is('interface', 1)) {
        m.annotations.push(readAnnotation())
        continue
      }
      const t = current().text
      if (current().kind === 'keyword' && MODIFIERS.has(t)) {
        pos++
        if (t === 'static') m.isStatic = true
        else if (t === 'final') m.final = true
        else if (t === 'abstract') m.isAbstract = true
        else if (t === 'public' || t === 'private' || t === 'protected') m.visibility = t
        continue
      }
      return m
    }
  }

  /**
   * `@Name`, `@Name("value")` or `@Name(a = 1, b = {"x", "y"})`.
   * The runtime ignores annotations; they are only kept for libraries like Spring.
   */
  function readAnnotation(): Annotation {
    const line = expect('@').line
    let name = expectName()
    // Fully qualified: @jakarta.validation.constraints.NotBlank → NotBlank
    while (is('.') && isName(1)) {
      pos++
      name = expectName()
    }
    const values: Record<string, AnnotationValue> = {}
    if (accept('(')) {
      if (!is(')')) {
        if (isName() && is('=', 1)) {
          do {
            const key = expectName()
            expect('=')
            values[key] = readAnnotationValue()
          } while (accept(','))
        } else {
          values.value = readAnnotationValue()
        }
      }
      expect(')')
    }
    return { name, values, line }
  }

  function readAnnotationValue(): AnnotationValue {
    if (accept('{')) {
      const list: AnnotationValue[] = []
      while (!is('}') && !atEnd()) {
        list.push(readAnnotationValue())
        if (!accept(',')) break
      }
      expect('}')
      return list
    }
    const t = current()
    if (t.kind === 'text') {
      pos++
      // "a" + "b" - happens with long paths or messages
      let text = t.text
      while (is('+') && peek(1).kind === 'text') {
        pos++
        text += tokens[pos++].text
      }
      return text
    }
    if (t.kind === 'number') {
      pos++
      return t.value ?? Number(t.text)
    }
    if (is('-') && peek(1).kind === 'number') {
      pos++
      return -(tokens[pos++].value ?? 0)
    }
    if (is('true') || is('false')) return tokens[pos++].text === 'true'
    if (t.kind === 'name') {
      // HttpStatus.CREATED, RequestMethod.GET, Todo.class
      const parts = [expectName()]
      while (is('.') && (isName(1) || is('class', 1))) {
        pos++
        if (accept('class')) return parts.join('.')
        parts.push(expectName())
      }
      return parts.join('.')
    }
    fail(`illegal annotation value: '${t.text}'`)
  }

  // --- Typdeklarationen -----------------------------------------------------

  function typeDeclaration(mods: Modifiers): TypeDecl {
    const line = current().line
    const kind = accept('class') ? 'class' : accept('interface') ? 'interface' : accept('enum') ? 'enum' : 'record'
    if (kind === 'record') expect('record')
    const name = expectName()

    // Generische Klassen: <T> lesen und vergessen (Java macht zur Laufzeit dasselbe).
    if (is('<')) {
      pos++
      while (!closeAngle() && !atEnd()) pos++
    }

    const declaration: TypeDecl = {
      kind: kind === 'record' ? 'class' : kind,
      name,
      isAbstract: mods.isAbstract || kind === 'interface',
      interfaces: [],
      fields: [],
      methods: [],
      constants: [],
      superTypes: [],
      annotations: mods.annotations,
      line,
    }

    if (kind === 'record') {
      declaration.components = parameterList()
    }
    if (accept('extends')) {
      const first = expectType()
      declaration.superTypes!.push(first)
      if (kind === 'interface') {
        declaration.interfaces.push(first.name)
        while (accept(',')) {
          const next = expectType()
          declaration.superTypes!.push(next)
          declaration.interfaces.push(next.name)
        }
      } else {
        declaration.superclass = first.name
      }
    }
    if (accept('implements')) {
      do {
        const type = expectType()
        declaration.superTypes!.push(type)
        declaration.interfaces.push(type.name)
      } while (accept(','))
    }

    expect('{')

    if (kind === 'enum') {
      while (isName() && !atEnd()) {
        const cName = expectName()
        const args = is('(') ? argumentList() : []
        declaration.constants.push({ name: cName, args })
        if (!accept(',')) break
      }
      accept(';')
    }

    while (!is('}') && !atEnd()) {
      if (accept(';')) continue
      readMember(declaration)
    }
    expect('}')
    return declaration
  }

  /** Ein Mitglied: Feld, Methode, Konstruktor oder eine verschachtelte Klasse. */
  function readMember(classInfo: TypeDecl) {
    const mods = readModifiers()

    if (is('class') || is('interface') || is('enum') || (is('record') && isName(1))) {
      // Verschachtelte Typen behandeln wir wie eigene Klassen der Datei - sie
      // merken sich aber, wo sie standen, damit sie deren static-Felder sehen.
      const inner = typeDeclaration(mods)
      inner.outer = classInfo.name
      nested.push(inner)
      return
    }
    if (is('{')) fail('initializer blocks are not supported in this course runtime')

    const line = current().line

    // Konstruktor: heißt wie die Klasse und hat sofort eine Klammer.
    if (current().kind === 'name' && current().text === classInfo.name && is('(', 1)) {
      pos++
      const params = parameterList()
      throwsList()
      const body = block()
      classInfo.methods.push({
        name: '<init>',
        returnType: { name: 'void', dimensions: 0, args: [] },
        params,
        body,
        isStatic: false,
        isAbstract: false,
        visibility: mods.visibility,
        isConstructor: true,
        annotations: mods.annotations,
        line,
      })
      return
    }

    // Generische Methode: <T> vor dem Rückgabetyp.
    if (is('<')) {
      pos++
      while (!closeAngle() && !atEnd()) pos++
    }

    const type = expectType()

    // Methode: Name direkt gefolgt von (
    if (isName() && is('(', 1)) {
      const name = expectName()
      const params = parameterList()
      while (is('[') && is(']', 1)) pos += 2
      throwsList()
      const isAbstract = mods.isAbstract || (classInfo.kind === 'interface' && is(';'))
      const body = is(';') ? (pos++, undefined) : block()
      classInfo.methods.push({
        name,
        returnType: type,
        params,
        body,
        isStatic: mods.isStatic,
        isAbstract: isAbstract && !body,
        visibility: classInfo.kind === 'interface' ? 'public' : mods.visibility,
        isConstructor: false,
        annotations: mods.annotations,
        line,
      })
      return
    }

    // Sonst: ein oder mehrere Felder.
    do {
      const name = expectName()
      let dimensions = 0
      while (is('[') && is(']', 1)) {
        pos += 2
        dimensions++
      }
      const init = accept('=') ? (is('{') ? arrayLiteral() : expression()) : undefined
      classInfo.fields.push({
        name,
        type: { ...type, dimensions: type.dimensions + dimensions },
        isStatic: mods.isStatic || classInfo.kind === 'interface',
        final: mods.final || classInfo.kind === 'interface',
        visibility: mods.visibility,
        init,
        annotations: mods.annotations,
        line,
      })
    } while (accept(','))
    expect(';')
  }

  function throwsList() {
    if (accept('throws')) {
      do {
        expectType()
      } while (accept(','))
    }
  }

  function parameterList(): ParamDecl[] {
    expect('(')
    const params: ParamDecl[] = []
    if (!is(')')) {
      do {
        const { annotations } = readModifiers() // final / @PathVariable … before parameters
        const type = expectType()
        const varargs = accept('...')
        const name = expectName()
        let dimensions = 0
        while (is('[') && is(']', 1)) {
          pos += 2
          dimensions++
        }
        params.push({
          name,
          type: { ...type, dimensions: type.dimensions + dimensions + (varargs ? 1 : 0) },
          varargs,
          annotations,
        })
      } while (accept(','))
    }
    expect(')')
    return params
  }

  // --- Anweisungen ----------------------------------------------------------

  function block(): Block {
    const line = expect('{').line
    const statements: Statement[] = []
    while (!is('}') && !atEnd()) statements.push(statement())
    expect('}')
    return { kind: 'block', statements, line }
  }

  function statement(): Statement {
    const line = current().line

    if (is('{')) return block()
    if (accept(';')) return { kind: 'empty', line }
    if (is('if')) return ifStatement()
    if (is('while')) return whileStatement()
    if (is('do')) return doWhileStatement()
    if (is('for')) return forStatement()
    if (is('switch')) return switchStatement()
    if (is('try')) return tryStatement()
    if (accept('return')) {
      const expr = is(';') ? undefined : expression()
      expect(';')
      return { kind: 'return', value: expr, line }
    }
    if (accept('break')) {
      if (isName()) pos++ // Labels werden gelesen und ignoriert
      expect(';')
      return { kind: 'break', line }
    }
    if (accept('continue')) {
      if (isName()) pos++
      expect(';')
      return { kind: 'continue', line }
    }
    if (accept('throw')) {
      const expr = expression()
      expect(';')
      return { kind: 'throw', value: expr, line }
    }
    if (is('class') || is('interface') || is('enum')) {
      nested.push(typeDeclaration(readModifiers()))
      return { kind: 'empty', line }
    }

    const local = localDeclaration()
    if (local) return local

    const expr = expression()
    expect(';')
    return { kind: 'expression', expression: expr, line }
  }

  /**
   * Rateversuch: Steht hier eine lokale Variable? `int x = 1;`, `String[] a;`,
   * `var n = 2;`, `Map<String, Integer> m = …`. Passt es nicht, wird
   * zurückgesprungen und als Ausdruck gelesen.
   */
  function localDeclaration(): Statement | null {
    const start = mark()
    const line = current().line
    let final = false
    while (is('final') || is('@')) {
      if (accept('final')) final = true
      else readAnnotation() // e.g. @SuppressWarnings - meaningless for local variables
    }
    const type = readType()
    if (!type || !isName()) {
      back(start)
      return null
    }
    // Nach dem Namen muss = ; , oder [ kommen - sonst war es ein Ausdruck.
    const after = peek(1).text
    if (!['=', ';', ',', '['].includes(after)) {
      back(start)
      return null
    }
    if (after === '[' && peek(2).text !== ']') {
      back(start)
      return null
    }

    const variables: VarDecl[] = []
    do {
      const name = expectName()
      let dimensions = 0
      while (is('[') && is(']', 1)) {
        pos += 2
        dimensions++
      }
      const init = accept('=') ? (is('{') ? arrayLiteral() : expression()) : undefined
      variables.push({ name, dimensions, init })
    } while (accept(','))
    expect(';')
    return { kind: 'local', type, final, variables, line }
  }

  function ifStatement(): Statement {
    const line = expect('if').line
    expect('(')
    const condition = expression()
    expect(')')
    const thenBranch = statement()
    const elseBranch = accept('else') ? statement() : undefined
    return { kind: 'if', condition, thenBranch, elseBranch, line }
  }

  function whileStatement(): Statement {
    const line = expect('while').line
    expect('(')
    const condition = expression()
    expect(')')
    return { kind: 'while', condition, body: statement(), line }
  }

  function doWhileStatement(): Statement {
    const line = expect('do').line
    const body = statement()
    expect('while')
    expect('(')
    const condition = expression()
    expect(')')
    expect(';')
    return { kind: 'doWhile', condition, body, line }
  }

  function forStatement(): Statement {
    const line = expect('for').line
    expect('(')

    // for-each: for (Typ name : quelle)
    const start = mark()
    readModifiers()
    const type = readType()
    if (type && isName() && is(':', 1)) {
      const name = expectName()
      expect(':')
      const source = expression()
      expect(')')
      return { kind: 'forEach', type, name, source, body: statement(), line }
    }
    back(start)

    const init: Statement[] = []
    if (!accept(';')) {
      const local = localDeclaration()
      if (local) init.push(local)
      else {
        do {
          init.push({ kind: 'expression', expression: expression(), line })
        } while (accept(','))
        expect(';')
      }
    }
    const condition = is(';') ? undefined : expression()
    expect(';')
    const update: Expression[] = []
    if (!is(')')) {
      do {
        update.push(expression())
      } while (accept(','))
    }
    expect(')')
    return { kind: 'for', init, condition, update, body: statement(), line }
  }

  function switchStatement(): Statement {
    const line = expect('switch').line
    expect('(')
    const expr = expression()
    expect(')')
    expect('{')
    const cases: SwitchCase[] = []
    let arrow = false

    while (!is('}') && !atEnd()) {
      const values: Expression[] = []
      if (accept('default')) {
        // default ohne Werte
      } else {
        expect('case')
        do {
          values.push(caseValue())
        } while (accept(','))
      }

      if (accept('->')) {
        arrow = true
        if (is('{')) {
          cases.push({ values, statements: [block()] })
        } else if (is('throw')) {
          cases.push({ values, statements: [statement()] })
        } else {
          const result = expression()
          expect(';')
          cases.push({ values, statements: [], result })
        }
        continue
      }

      expect(':')
      // Gestapelte Labels: case 1: case 2: …
      while (is('case') || (is('default') && is(':', 1))) {
        if (accept('default')) {
          expect(':')
          cases.push({ values: [...values], statements: [] })
          values.length = 0
        } else {
          expect('case')
          do {
            values.push(caseValue())
          } while (accept(','))
          expect(':')
        }
      }
      const statements: Statement[] = []
      while (!is('case') && !is('default') && !is('}') && !atEnd()) statements.push(statement())
      cases.push({ values, statements })
    }
    expect('}')
    return { kind: 'switch', value: expr, cases, arrow, line }
  }

  /**
   * Ein case-Label. Sonderfall: `case ROT ->` ist ein enum-Name mit Pfeil und
   * KEIN Lambda - deshalb hier nicht der normale Ausdrucks-Parser.
   */
  function caseValue(): Expression {
    if (isName() && ['->', ',', ':'].includes(peek(1).text)) {
      const t = tokens[pos++]
      return { kind: 'name', name: t.text, line: t.line }
    }
    return ternary()
  }

  function tryStatement(): Statement {
    const line = expect('try').line
    if (is('(')) fail('try-with-resources is not supported in this course runtime')
    const body = block()
    const catches: CatchClause[] = []
    while (accept('catch')) {
      expect('(')
      readModifiers()
      const types = [expectType().name]
      while (accept('|')) types.push(expectType().name)
      const name = expectName()
      expect(')')
      catches.push({ types, name, body: block() })
    }
    const finallyBlock = accept('finally') ? block() : undefined
    if (!catches.length && !finallyBlock) fail("'catch' or 'finally' expected")
    return { kind: 'try', body, catches, finallyBlock, line }
  }

  // --- Ausdrücke ------------------------------------------------------------

  function expression(): Expression {
    const left = ternary()
    const op = current().text
    if (current().kind === 'symbol' && ['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>='].includes(op)) {
      const line = tokens[pos++].line
      const expr = expression() // rechtsassoziativ: a = b = c
      return { kind: 'assign', target: left, operator: op, value: expr, line }
    }
    return left
  }

  function ternary(): Expression {
    const condition = binary(0)
    if (is('?')) {
      const line = tokens[pos++].line
      const thenBranch = expression()
      expect(':')
      const elseBranch = ternary()
      return { kind: 'ternary', condition, thenBranch, elseBranch, line }
    }
    return condition
  }

  /** Alle zweistelligen Operatoren mit einer Tabelle statt einer Funktion je Stufe. */
  const STEPS: string[][] = [
    ['||'],
    ['&&'],
    ['|'],
    ['^'],
    ['&'],
    ['==', '!='],
    ['<', '>', '<=', '>=', 'instanceof'],
    ['<<', '>>', '>>>'],
    ['+', '-'],
    ['*', '/', '%'],
  ]

  function binary(stufe: number): Expression {
    if (stufe >= STEPS.length) return unary()
    let left = binary(stufe + 1)
    while (true) {
      const t = current()
      if (!STEPS[stufe].includes(t.text) || (t.kind !== 'symbol' && t.text !== 'instanceof')) break
      // `>` `>` nebeneinander sind hier nie Generics - die hat typLesen() schon geschluckt.
      pos++
      if (t.text === 'instanceof') {
        accept('final')
        const type = expectType()
        const binding = isName() ? expectName() : undefined
        left = { kind: 'instanceof', expression: left, type: type.name + '[]'.repeat(type.dimensions), binding, line: t.line }
        continue
      }
      const right = binary(stufe + 1)
      left = { kind: 'binary', operator: t.text, left, right, line: t.line }
    }
    return left
  }

  function unary(): Expression {
    const t = current()
    if (t.kind === 'symbol' && ['!', '~', '-', '+'].includes(t.text)) {
      pos++
      return { kind: 'unary', operator: t.text, expression: unary(), line: t.line }
    }
    if (t.text === '++' || t.text === '--') {
      pos++
      return { kind: 'increment', operator: t.text as '++' | '--', target: unary(), prefix: true, line: t.line }
    }
    // Cast? (int) x   (String) o   (List<String>) o
    if (is('(')) {
      const start = mark()
      pos++
      const type = readType()
      if (type && is(')')) {
        pos++
        const next = current()
        const canFollow =
          next.kind === 'name' ||
          next.kind === 'number' ||
          next.kind === 'text' ||
          next.kind === 'char' ||
          ['new', 'this', 'super', 'true', 'false', 'null'].includes(next.text) ||
          next.text === '(' ||
          next.text === '!'
        const primitive = PRIMITIVES.has(type.name) && type.dimensions === 0
        if (canFollow && (primitive || type.dimensions > 0 || /^[A-Z]/.test(type.name))) {
          return { kind: 'cast', type, expression: unary(), line: t.line }
        }
      }
      back(start)
    }
    return postfix(primary())
  }

  /** Alles, was hinter einem Wert stehen kann: .feld, .methode(), [i], ++, -- */
  function postfix(value: Expression): Expression {
    while (true) {
      const t = current()
      if (is('.')) {
        pos++
        if (is('<')) {
          // explizite Typargumente beim Aufruf: list.<String>toArray()
          pos++
          while (!closeAngle() && !atEnd()) pos++
        }
        // Todo.class - a class literal (needed e.g. by SpringApplication.run)
        if (is('class') && value.kind === 'name') {
          pos++
          value = { kind: 'classLiteral', className: value.name, line: t.line }
          continue
        }
        const name = is('new') ? fail('inner class creation is not supported') : expectName()
        if (is('(')) {
          value = { kind: 'call', target: value, name, args: argumentList(), viaSuper: value.kind === 'super', line: t.line }
        } else {
          value = { kind: 'field', target: value, name, line: t.line }
        }
        continue
      }
      if (is('::')) {
        pos++
        const name = is('new') ? (pos++, '<init>') : expectName()
        const target = value.kind === 'name' ? value.name : value.kind === 'field' ? value.name : ''
        value = { kind: 'methodRef', target, name, line: t.line }
        continue
      }
      if (is('[')) {
        pos++
        const index = expression()
        expect(']')
        value = { kind: 'index', target: value, index, line: t.line }
        continue
      }
      if (is('++') || is('--')) {
        pos++
        value = { kind: 'increment', operator: t.text as '++' | '--', target: value, prefix: false, line: t.line }
        continue
      }
      return value
    }
  }

  function argumentList(): Expression[] {
    expect('(')
    const args: Expression[] = []
    if (!is(')')) {
      do {
        args.push(expression())
      } while (accept(','))
    }
    expect(')')
    return args
  }

  function arrayLiteral(): Expression {
    const line = expect('{').line
    const values: Expression[] = []
    if (!is('}')) {
      do {
        if (is('}')) break // erlaubtes Komma am Ende
        values.push(is('{') ? arrayLiteral() : expression())
      } while (accept(','))
    }
    expect('}')
    return { kind: 'arrayLiteral', values, line }
  }

  function readLiteral(): Literal | null {
    const t = current()
    if (t.kind === 'number') {
      pos++
      return t.isFloat ? { type: 'double', value: t.value! } : { type: 'int', value: t.value! }
    }
    if (t.kind === 'text') {
      pos++
      return { type: 'String', value: t.text }
    }
    if (t.kind === 'char') {
      pos++
      return { type: 'char', value: t.value! }
    }
    if (t.text === 'true' || t.text === 'false') {
      pos++
      return { type: 'boolean', value: t.text === 'true' }
    }
    if (t.text === 'null') {
      pos++
      return { type: 'null' }
    }
    return null
  }

  function primary(): Expression {
    const t = current()
    const line = t.line

    const expr = readLiteral()
    if (expr) return { kind: 'literal', value: expr, line }

    if (accept('this')) {
      if (is('(')) return { kind: 'call', name: '<init>', args: argumentList(), viaSuper: false, line }
      return { kind: 'this', line }
    }
    if (accept('super')) {
      if (is('(')) return { kind: 'call', name: '<superinit>', args: argumentList(), viaSuper: true, line }
      return { kind: 'super', line }
    }
    if (accept('new')) return readNew(line)
    // switch als Ausdruck: int x = switch (tag) { case 1 -> 10; default -> 0; };
    if (is('switch')) return { kind: 'switchExpression', statement: switchStatement(), line }

    // Lambda mit einem Parameter ohne Klammern: x -> x * 2
    if (isName() && is('->', 1)) {
      const p = expectName()
      expect('->')
      return { kind: 'lambda', params: [p], body: is('{') ? block() : expression(), line }
    }

    if (is('(')) {
      // Lambda mit Klammern: () -> …, (a, b) -> …, (int a) -> …
      const start = mark()
      pos++
      const params: string[] = []
      let isLambda = true
      if (!is(')')) {
        do {
          readModifiers()
          const p = mark()
          const type = readType()
          if (type && isName()) {
            params.push(expectName())
          } else {
            back(p)
            if (isName()) params.push(expectName())
            else {
              isLambda = false
              break
            }
          }
        } while (accept(','))
      }
      if (isLambda && is(')') && is('->', 1)) {
        pos += 2
        return { kind: 'lambda', params, body: is('{') ? block() : expression(), line }
      }
      back(start)
      pos++
      const inner = expression()
      expect(')')
      return inner
    }

    if (isName()) {
      let name = expectName()
      // Voll qualifizierter Name: java.util.Arrays.sort(…) → Arrays.sort(…)
      if ((name === 'java' || name === 'javax') && is('.')) {
        while (is('.') && isName(1) && /^[a-z]/.test(peek(1).text)) {
          pos += 2
        }
        if (is('.') && isName(1)) {
          pos++
          name = expectName()
        }
      }
      if (is('(')) {
        return { kind: 'call', name, args: argumentList(), viaSuper: false, line }
      }
      return { kind: 'name', name, line }
    }

    // `int.class` o. Ä. kommt im Kurs nicht vor - alles andere ist ein Fehler.
    fail(`illegal start of expression: '${t.text}'`)
  }

  function readNew(line: number): Expression {
    const type = expectType()
    // `new int[]{1, 2, 3}`: die leeren Klammern hat typLesen() schon geschluckt.
    if (type.dimensions > 0 && is('{')) {
      const values = arrayLiteral() as { values: Expression[] }
      return { kind: 'newArray', type, sizes: [], values: values.values, line }
    }
    if (is('[')) {
      const sizes: Expression[] = []
      let dimensions = 0
      while (is('[')) {
        pos++
        if (is(']')) {
          pos++
          dimensions++
          continue
        }
        sizes.push(expression())
        expect(']')
        dimensions++
      }
      const base: TypeRef = { ...type, dimensions }
      if (is('{')) {
        const values = arrayLiteral() as { values: Expression[] }
        return { kind: 'newArray', type: base, sizes: [], values: values.values, line }
      }
      return { kind: 'newArray', type: base, sizes, line }
    }
    const args = argumentList()
    if (is('{')) fail('anonymous classes are not supported in this course runtime')
    return { kind: 'new', classInfo: type.name, args, line }
  }

  // --- Los geht's -----------------------------------------------------------

  const nested: TypeDecl[] = []
  const types: TypeDecl[] = []
  const imports: string[] = []

  while (!atEnd()) {
    if (accept('package')) {
      while (!is(';') && !atEnd()) pos++
      expect(';')
      continue
    }
    if (accept('import')) {
      accept('static')
      let path = ''
      while (!is(';') && !atEnd()) path += tokens[pos++].text
      expect(';')
      imports.push(path)
      continue
    }
    if (accept(';')) continue
    const mods = readModifiers()
    if (is('class') || is('interface') || is('enum') || is('record')) {
      types.push(typeDeclaration(mods))
      continue
    }
    fail(`class, interface or enum expected, found '${current().text}'`)
  }

  if (!types.length) throw new JavaSyntaxError('no class found - Java code always lives inside a class', 1)

  return { types: [...types, ...nested], imports }
}
