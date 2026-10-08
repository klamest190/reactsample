/**
 * SPRING PART · Bean Validation (`@Valid`, `@NotBlank`, `@Size` …)
 *
 * Checks the constraint annotations on record components and fields - with
 * the default messages of Hibernate Validator, which Spring Boot uses:
 *
 *   @NotBlank           "must not be blank"
 *   @Size(min, max)     "size must be between 1 and 80"
 *   @Min(1) / @Max(10)  "must be greater than or equal to 1"
 *
 * A custom text replaces the default: `@NotBlank(message = "title is required")`.
 */

import type { Annotation, TypeRef } from '../java/ast'
import type { Interpreter } from '../java/interpreter'
import { toNumber, isNumber, type JavaObject, type ClassInfo, type Value } from '../java/values'
import { number, text } from './annotations'
import type { FieldErrorInfo } from './library'

const MAX_INT = 2147483647

type Check = (value: Value, annotation: Annotation, interpreter: Interpreter) => string | null

const length = (value: Value): number | null => {
  if (value.kind === 'string') return value.value.length
  if (value.kind === 'array') return value.values.length
  if (value.kind === 'native' && value.data.list) return value.data.list.length
  if (value.kind === 'native' && value.data.map) return value.data.map.size
  return null
}

const numeric = (value: Value) => (isNumber(value) ? toNumber(value) : null)

const CHECKS: Record<string, Check> = {
  NotNull: (v) => (v.kind === 'null' ? 'must not be null' : null),
  NotBlank: (v) => (v.kind === 'null' || (v.kind === 'string' && v.value.trim() === '') ? 'must not be blank' : null),
  NotEmpty: (v) => (v.kind === 'null' || length(v) === 0 ? 'must not be empty' : null),
  Size: (v, a) => {
    const n = length(v)
    const min = number(a, 'min') ?? 0
    const max = number(a, 'max') ?? MAX_INT
    return n !== null && (n < min || n > max) ? `size must be between ${min} and ${max}` : null
  },
  Min: (v, a) => {
    const n = numeric(v)
    const min = number(a, 'value') ?? 0
    return n !== null && n < min ? `must be greater than or equal to ${min}` : null
  },
  Max: (v, a) => {
    const n = numeric(v)
    const max = number(a, 'value') ?? 0
    return n !== null && n > max ? `must be less than or equal to ${max}` : null
  },
  Positive: (v) => (numeric(v) !== null && numeric(v)! <= 0 ? 'must be greater than 0' : null),
  PositiveOrZero: (v) => (numeric(v) !== null && numeric(v)! < 0 ? 'must be greater than or equal to 0' : null),
  Negative: (v) => (numeric(v) !== null && numeric(v)! >= 0 ? 'must be less than 0' : null),
  Email: (v) =>
    v.kind === 'string' && v.value !== '' && !/^[^@\s]+@[^@\s]+$/.test(v.value) ? 'must be a well-formed email address' : null,
  Pattern: (v, a) => {
    const regexp = text(a, 'regexp') ?? ''
    return v.kind === 'string' && !new RegExp(`^(?:${regexp})$`).test(v.value) ? `must match "${regexp}"` : null
  },
  AssertTrue: (v) => (v.kind === 'boolean' && !v.value ? 'must be true' : null),
  AssertFalse: (v) => (v.kind === 'boolean' && v.value ? 'must be false' : null),
}

export const CONSTRAINTS = new Set(Object.keys(CHECKS))

/** `{min}` and `{max}` in custom messages are filled in, like in Hibernate Validator. */
function message(annotation: Annotation, fallback: string): string {
  const custom = text(annotation, 'message')
  if (!custom) return fallback
  return custom.replace(/\{(\w+)\}/g, (all, key: string) => {
    const value = annotation.values[key]
    return value !== undefined ? String(value) : key === 'max' ? String(MAX_INT) : key === 'min' ? '0' : all
  })
}

/** All violations of one object; `objectName` is the parameter's class name with a lower-case first letter. */
export function validate(object: Value, interpreter: Interpreter): FieldErrorInfo[] {
  if (object.kind !== 'object') return []
  const classInfo = object.classInfo
  const objectName = classInfo.name.charAt(0).toLowerCase() + classInfo.name.slice(1)
  const errors: FieldErrorInfo[] = []
  for (const { name, annotations } of constrainedProperties(classInfo)) {
    const value = (object as JavaObject).fields.get(name)
    if (!value) continue
    for (const annotation of annotations) {
      const check = CHECKS[annotation.name]
      const problem = check?.(value, annotation, interpreter)
      if (problem) errors.push({ objectName, field: name, rejected: value, message: message(annotation, problem) })
    }
  }
  return errors
}

function constrainedProperties(classInfo: ClassInfo): { name: string; type: TypeRef; annotations: Annotation[] }[] {
  if (classInfo.decl.components) {
    return classInfo.decl.components.map((c) => ({ name: c.name, type: c.type, annotations: c.annotations ?? [] }))
  }
  const result: { name: string; type: TypeRef; annotations: Annotation[] }[] = []
  for (let k: ClassInfo | undefined = classInfo; k; k = k.superclass) {
    for (const field of k.decl.fields) {
      if (!field.isStatic) result.push({ name: field.name, type: field.type, annotations: field.annotations ?? [] })
    }
  }
  return result
}

/** Spring's log line for a failed validation - shortened, but with the same parts. */
export function validationMessage(errors: FieldErrorInfo[], interpreter: Interpreter): string {
  const parts = errors.map(
    (e) =>
      `[Field error in object '${e.objectName}' on field '${e.field}': rejected value [${e.rejected.kind === 'null' ? 'null' : interpreter.toText(e.rejected)}]; default message [${e.message}]]`,
  )
  return `Validation failed for argument [0] with ${errors.length} error${errors.length === 1 ? '' : 's'}: ${parts.join(' ')}`
}
