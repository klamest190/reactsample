/**
 * JAVA-TEIL · Schritt 3 von 4: prüfen, BEVOR etwas läuft
 *
 * Das ist der größte Unterschied zu JavaScript: In Java findet der Compiler
 * einen ganzen Stapel Fehler, ohne das Programm je zu starten. Diese Datei
 * macht davon das Wichtigste nach:
 *
 *   int zahl = "drei";     → incompatible types: String cannot be converted to int
 *   System.out.println(x); → cannot find symbol: variable x
 *   int verdoppeln(int n) {} → missing return statement
 *
 * Grundregel hier: **Im Zweifel nichts melden.** Ein falscher Fehler wäre für
 * Lernende schlimmer als ein übersehener - den fängt sonst die Laufzeit.
 */

import type { Statement, Expression, MethodDecl, Program, TypeDecl, TypeRef } from './ast'
import { BUILTIN_CLASSES, isExceptionClass } from './library'

export type CheckMessage = { line: number; de: string; en: string }

/** Typen, bei denen wir uns sicher genug sind, um zu meckern. */
type Type = string | null

const PRIMITIVES = new Set(['int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char'])
const INTEGERS = new Set(['int', 'long', 'short', 'byte', 'char'])

/** Klassen, die es ohne Deklaration gibt (Standardbibliothek). */
const KNOWN_CLASSES = new Set([
  ...BUILTIN_CLASSES,
  'ArrayList', 'LinkedList', 'HashMap', 'LinkedHashMap', 'TreeMap', 'HashSet', 'LinkedHashSet', 'TreeSet',
  'StringBuilder', 'StringBuffer', 'Random', 'Object', 'Number', 'CharSequence', 'Comparable', 'Iterable',
  'Collection', 'Entry', 'Scanner', 'Thread', 'Runnable', 'Function', 'BiFunction', 'Supplier', 'Consumer',
  'Predicate', 'UnaryOperator', 'BinaryOperator', 'Iterator', 'Void', 'Class',
])

/** `knownClasses`: additional classes from an extension (e.g. Spring) that exist without a declaration. */
export function checkProgram(program: Program, knownClasses?: ReadonlySet<string>): CheckMessage[] {
  const messages: CheckMessage[] = []
  const classes = new Map(program.types.map((t) => [t.name, t]))

  const report = (line: number, de: string, en: string) => {
    if (messages.length < 10 && !messages.some((m) => m.line === line)) messages.push({ line, de, en })
  }

  const isClass = (name: string) =>
    classes.has(name) || KNOWN_CLASSES.has(name) || isExceptionClass(name) || Boolean(knownClasses?.has(name))

  /** Alle Felder einer Klasse: eigene, geerbte und die der umgebenden Klasse. */
  function fieldsOf(classInfo: TypeDecl): Map<string, TypeRef> {
    const fields = new Map<string, TypeRef>()
    const seen = new Set<string>()
    const collect = (start: TypeDecl | undefined) => {
      let current = start
      while (current && !seen.has(current.name)) {
        seen.add(current.name)
        for (const field of current.fields) if (!fields.has(field.name)) fields.set(field.name, field.type)
        for (const component of current.components ?? []) if (!fields.has(component.name)) fields.set(component.name, component.type)
        for (const constant of current.constants) {
          if (!fields.has(constant.name)) fields.set(constant.name, { name: current.name, dimensions: 0, args: [] })
        }
        if (current.outer) collect(classes.get(current.outer))
        current = current.superclass ? classes.get(current.superclass) : undefined
      }
    }
    collect(classInfo)
    return fields
  }

  // --- Typen vergleichen ---------------------------------------------------

  const typeText = (type: TypeRef) => type.name + '[]'.repeat(type.dimensions)

  /** Passt ein Wert vom Typ `von` in eine Variable vom Typ `zu`? */
  function assignable(from: Type, to: Type, literal: boolean): boolean {
    if (!from || !to || from === to) return true
    if (to === 'var' || to === 'Object' || from === 'unknown' || to === 'unknown') return true
    if (from === 'null') return !PRIMITIVES.has(to)
    if (to === 'String') return false
    if (from === 'String') return to === 'CharSequence' || to === 'Comparable'
    if (from === 'boolean') return to === 'Boolean'
    if (to === 'boolean') return from === 'Boolean'
    if (INTEGERS.has(from) && (to === 'double' || to === 'float')) return true
    if (INTEGERS.has(from) && INTEGERS.has(to)) {
      // char c = 65; geht, char c = intVariable; nicht.
      if (to === 'char' && from !== 'char') return literal
      if ((to === 'short' || to === 'byte') && from === 'int') return literal
      return true
    }
    if ((from === 'double' || from === 'float') && to !== 'double' && to !== 'float' && to !== 'Double') return false
    if (from === 'int' && to === 'Integer') return true
    if (from === 'double' && to === 'Double') return true
    if (from === 'char' && to === 'Character') return true
    if (PRIMITIVES.has(from) !== PRIMITIVES.has(to)) return false
    return true
  }

  // --- Ein Sichtbarkeitsbereich --------------------------------------------

  type Frame = {
    variables: Map<string, Type>
    fields: Map<string, TypeRef>
    classInfo: TypeDecl
    isStatic: boolean
  }

  function typeOf(expression: Expression, frame: Frame): Type {
    switch (expression.kind) {
      case 'literal':
        return expression.value.type
      case 'name': {
        if (frame.variables.has(expression.name)) return frame.variables.get(expression.name)!
        const field = frame.fields.get(expression.name)
        return field ? typeText(field) : null
      }
      case 'this':
        return frame.classInfo.name
      case 'new':
        return expression.classInfo
      case 'newArray':
        return typeText(expression.type)
      case 'cast':
        return typeText(expression.type)
      case 'instanceof':
        return 'boolean'
      case 'ternary': {
        const thenBranch = typeOf(expression.thenBranch, frame)
        return thenBranch === typeOf(expression.elseBranch, frame) ? thenBranch : null
      }
      case 'unary':
        if (expression.operator === '!') return 'boolean'
        return typeOf(expression.expression, frame)
      case 'binary': {
        const op = expression.operator
        if (['==', '!=', '<', '>', '<=', '>=', '&&', '||'].includes(op)) return 'boolean'
        const left = typeOf(expression.left, frame)
        const right = typeOf(expression.right, frame)
        if (op === '+' && (left === 'String' || right === 'String')) return 'String'
        if (!left || !right) return null
        if (left === 'boolean' && right === 'boolean') return 'boolean'
        if (left === 'double' || right === 'double' || left === 'float' || right === 'float') return 'double'
        if (INTEGERS.has(left) && INTEGERS.has(right)) return 'int'
        return null
      }
      case 'index': {
        const target = typeOf(expression.target, frame)
        return target?.endsWith('[]') ? target.slice(0, -2) : null
      }
      case 'call': {
        // Nur eigene Methoden der eigenen Klasse sind sicher bestimmbar.
        if (!expression.target) {
          const method = frame.classInfo.methods.find((m) => m.name === expression.name)
          return method ? typeText(method.returnType) : null
        }
        if (expression.target.kind === 'name') {
          const classInfo = classes.get(expression.target.name)
          const method = classInfo?.methods.find((m) => m.name === expression.name && m.isStatic)
          if (method) return typeText(method.returnType)
        }
        return null
      }
      case 'field':
        if (expression.name === 'length' && typeOf(expression.target, frame)?.endsWith('[]')) return 'int'
        return null
      default:
        return null
    }
  }

  /** Läuft durch einen Ausdruck und meldet unbekannte Namen. */
  function checkExpression(expression: Expression, frame: Frame) {
    switch (expression.kind) {
      case 'name':
        if (!frame.variables.has(expression.name) && !frame.fields.has(expression.name) && !isClass(expression.name)) {
          report(
            expression.line,
            `Die Variable \`${expression.name}\` ist hier nicht bekannt. Wurde sie deklariert (z. B. \`int ${expression.name} = …;\`) - und steht sie im selben Block?`,
            `cannot find symbol: variable ${expression.name}`,
          )
        }
        return
      case 'binary':
        checkExpression(expression.left, frame)
        checkExpression(expression.right, frame)
        return
      case 'unary':
        checkExpression(expression.expression, frame)
        return
      case 'increment':
        checkExpression(expression.target, frame)
        return
      case 'ternary':
        checkExpression(expression.condition, frame)
        checkExpression(expression.thenBranch, frame)
        checkExpression(expression.elseBranch, frame)
        return
      case 'assign': {
        checkExpression(expression.value, frame)
        checkExpression(expression.target, frame)
        if (expression.operator === '=') {
          const target = typeOf(expression.target, frame)
          const value = typeOf(expression.value, frame)
          if (target && value && !assignable(value, target, expression.value.kind === 'literal')) {
            report(
              expression.line,
              `${value} passt nicht in eine Variable vom Typ ${target}.`,
              `incompatible types: ${value} cannot be converted to ${target}`,
            )
          }
        }
        return
      }
      case 'call':
        if (expression.target) checkExpression(expression.target, frame)
        for (const a of expression.args) checkExpression(a, frame)
        return
      case 'field':
        if (expression.target.kind !== 'name' || !isClass(expression.target.name)) checkExpression(expression.target, frame)
        return
      case 'index':
        checkExpression(expression.target, frame)
        checkExpression(expression.index, frame)
        return
      case 'new':
        if (!isClass(expression.classInfo)) {
          report(expression.line, `Die Klasse \`${expression.classInfo}\` gibt es nicht.`, `cannot find symbol: class ${expression.classInfo}`)
        }
        for (const a of expression.args) checkExpression(a, frame)
        return
      case 'newArray':
        for (const g of expression.sizes) checkExpression(g, frame)
        for (const w of expression.values ?? []) checkExpression(w, frame)
        return
      case 'arrayLiteral':
        for (const w of expression.values) checkExpression(w, frame)
        return
      case 'cast':
        checkExpression(expression.expression, frame)
        return
      case 'instanceof':
        checkExpression(expression.expression, frame)
        // `o instanceof Cat cat` legt cat gleich mit an (Java 16+).
        if (expression.binding) frame.variables.set(expression.binding, expression.type)
        return
      case 'lambda': {
        // Lambda-Parameter gelten im Rumpf - Typen kennen wir nicht.
        const inner: Frame = { ...frame, variables: new Map(frame.variables) }
        for (const p of expression.params) inner.variables.set(p, null)
        if ('kind' in expression.body && expression.body.kind === 'block') checkStatement(expression.body, inner)
        else checkExpression(expression.body as Expression, inner)
        return
      }
      default:
        return
    }
  }

  function checkStatement(statement: Statement, frame: Frame) {
    switch (statement.kind) {
      case 'block': {
        const inner: Frame = { ...frame, variables: new Map(frame.variables) }
        for (const a of statement.statements) checkStatement(a, inner)
        return
      }
      case 'local':
        for (const v of statement.variables) {
          if (v.init) {
            checkExpression(v.init, frame)
            const targetType = typeText({ ...statement.type, dimensions: statement.type.dimensions + v.dimensions })
            const valueType = v.init.kind === 'arrayLiteral' ? null : typeOf(v.init, frame)
            if (valueType && !assignable(valueType, targetType, v.init.kind === 'literal')) {
              report(
                statement.line,
                `${valueType} passt nicht in eine Variable vom Typ ${targetType}. In Java muss der Typ genau stimmen - anders als in JavaScript.`,
                `incompatible types: ${valueType} cannot be converted to ${targetType}`,
              )
            }
          }
          if (statement.type.name !== 'var' && !PRIMITIVES.has(statement.type.name) && !isClass(statement.type.name)) {
            report(statement.line, `Den Typ \`${statement.type.name}\` gibt es nicht.`, `cannot find symbol: class ${statement.type.name}`)
          }
          frame.variables.set(v.name, typeText({ ...statement.type, dimensions: statement.type.dimensions + v.dimensions }))
        }
        return
      case 'expression':
        checkExpression(statement.expression, frame)
        return
      case 'if':
        checkExpression(statement.condition, frame)
        checkCondition(statement.condition, frame)
        checkStatement(statement.thenBranch, frame)
        if (statement.elseBranch) checkStatement(statement.elseBranch, frame)
        return
      case 'while':
      case 'doWhile':
        checkExpression(statement.condition, frame)
        checkCondition(statement.condition, frame)
        checkStatement(statement.body, frame)
        return
      case 'for': {
        const inner: Frame = { ...frame, variables: new Map(frame.variables) }
        for (const a of statement.init) checkStatement(a, inner)
        if (statement.condition) {
          checkExpression(statement.condition, inner)
          checkCondition(statement.condition, inner)
        }
        for (const s of statement.update) checkExpression(s, inner)
        checkStatement(statement.body, inner)
        return
      }
      case 'forEach': {
        checkExpression(statement.source, frame)
        const inner: Frame = { ...frame, variables: new Map(frame.variables) }
        inner.variables.set(statement.name, statement.type.name === 'var' ? null : typeText(statement.type))
        checkStatement(statement.body, inner)
        return
      }
      case 'switch': {
        checkExpression(statement.value, frame)
        const inner: Frame = { ...frame, variables: new Map(frame.variables) }
        for (const switchCase of statement.cases) {
          for (const a of switchCase.statements) checkStatement(a, inner)
          if (switchCase.result) checkExpression(switchCase.result, inner)
        }
        return
      }
      case 'return':
        if (statement.value) checkExpression(statement.value, frame)
        return
      case 'throw':
        checkExpression(statement.value, frame)
        return
      case 'try': {
        checkStatement(statement.body, frame)
        for (const catches of statement.catches) {
          const inner: Frame = { ...frame, variables: new Map(frame.variables) }
          inner.variables.set(catches.name, catches.types[0])
          checkStatement(catches.body, inner)
        }
        if (statement.finallyBlock) checkStatement(statement.finallyBlock, frame)
        return
      }
      default:
        return
    }
  }

  /** Der Klassiker aus JavaScript: `if (zahl)` statt `if (zahl > 0)`. */
  function checkCondition(expression: Expression, frame: Frame) {
    const type = typeOf(expression, frame)
    if (type && type !== 'boolean' && type !== 'Boolean' && type !== 'unknown') {
      report(
        expression.line,
        `Eine Bedingung muss in Java ein \`boolean\` sein, nicht ${type}. In JavaScript wäre das „truthy“ - in Java ein Fehler.`,
        `incompatible types: ${type} cannot be converted to boolean`,
      )
    }
  }

  /** Enthält der Rumpf überhaupt irgendwo ein return mit Wert? */
  function hasReturn(statements: Statement[]): boolean {
    return statements.some((a) => {
      switch (a.kind) {
        case 'return':
          return Boolean(a.value)
        case 'throw':
          return true
        case 'block':
          return hasReturn(a.statements)
        case 'if':
          return hasReturn([a.thenBranch]) || (a.elseBranch ? hasReturn([a.elseBranch]) : false)
        case 'while':
        case 'doWhile':
        case 'forEach':
          return hasReturn([a.body])
        case 'for':
          return hasReturn([a.body])
        case 'switch':
          return a.cases.some((f) => hasReturn(f.statements) || Boolean(f.result))
        case 'try':
          return hasReturn(a.body.statements) || a.catches.some((f) => hasReturn(f.body.statements))
        default:
          return false
      }
    })
  }

  // --- Jede Methode jeder Klasse prüfen ------------------------------------

  for (const classInfo of program.types) {
    const fields = fieldsOf(classInfo)
    for (const method of classInfo.methods) {
      if (!method.body) continue
      const frame: Frame = {
        variables: new Map(method.params.map((p) => [p.name, p.type.name + '[]'.repeat(p.type.dimensions)] as const)),
        fields,
        classInfo,
        isStatic: method.isStatic,
      }
      for (const a of method.body.statements) checkStatement(a, frame)
      checkReturn(method)
    }
  }

  function checkReturn(method: MethodDecl) {
    if (method.isConstructor || !method.body) return
    if (method.returnType.name === 'void' && method.returnType.dimensions === 0) return
    if (!hasReturn(method.body.statements)) {
      report(
        method.line,
        `Die Methode \`${method.name}\` verspricht ein ${typeText(method.returnType)} zurückzugeben, tut es aber nie. Fehlt ein \`return\`?`,
        'missing return statement',
      )
    }
  }

  return messages.sort((a, b) => a.line - b.line)
}
