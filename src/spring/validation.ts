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

import type { Annotation, TypRef } from '../java/ast'
import type { Interpreter } from '../java/interpreter'
import { alsZahl, istZahl, type JavaObjekt, type Klasse, type Wert } from '../java/werte'
import { number, text } from './annotations'
import type { FieldErrorInfo } from './library'

const MAX_INT = 2147483647

type Check = (value: Wert, annotation: Annotation, interpreter: Interpreter) => string | null

const length = (value: Wert): number | null => {
  if (value.art === 'string') return value.wert.length
  if (value.art === 'array') return value.werte.length
  if (value.art === 'nativ' && value.daten.liste) return value.daten.liste.length
  if (value.art === 'nativ' && value.daten.map) return value.daten.map.size
  return null
}

const numeric = (value: Wert) => (istZahl(value) ? alsZahl(value) : null)

const CHECKS: Record<string, Check> = {
  NotNull: (v) => (v.art === 'null' ? 'must not be null' : null),
  NotBlank: (v) => (v.art === 'null' || (v.art === 'string' && v.wert.trim() === '') ? 'must not be blank' : null),
  NotEmpty: (v) => (v.art === 'null' || length(v) === 0 ? 'must not be empty' : null),
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
    v.art === 'string' && v.wert !== '' && !/^[^@\s]+@[^@\s]+$/.test(v.wert) ? 'must be a well-formed email address' : null,
  Pattern: (v, a) => {
    const regexp = text(a, 'regexp') ?? ''
    return v.art === 'string' && !new RegExp(`^(?:${regexp})$`).test(v.wert) ? `must match "${regexp}"` : null
  },
  AssertTrue: (v) => (v.art === 'boolean' && !v.wert ? 'must be true' : null),
  AssertFalse: (v) => (v.art === 'boolean' && v.wert ? 'must be false' : null),
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
export function validate(object: Wert, interpreter: Interpreter): FieldErrorInfo[] {
  if (object.art !== 'objekt') return []
  const klasse = object.klasse
  const objectName = klasse.name.charAt(0).toLowerCase() + klasse.name.slice(1)
  const errors: FieldErrorInfo[] = []
  for (const { name, annotations } of constrainedProperties(klasse)) {
    const value = (object as JavaObjekt).felder.get(name)
    if (!value) continue
    for (const annotation of annotations) {
      const check = CHECKS[annotation.name]
      const problem = check?.(value, annotation, interpreter)
      if (problem) errors.push({ objectName, field: name, rejected: value, message: message(annotation, problem) })
    }
  }
  return errors
}

function constrainedProperties(klasse: Klasse): { name: string; typ: TypRef; annotations: Annotation[] }[] {
  if (klasse.dekl.komponenten) {
    return klasse.dekl.komponenten.map((c) => ({ name: c.name, typ: c.typ, annotations: c.annotations ?? [] }))
  }
  const result: { name: string; typ: TypRef; annotations: Annotation[] }[] = []
  for (let k: Klasse | undefined = klasse; k; k = k.oberklasse) {
    for (const field of k.dekl.felder) {
      if (!field.statisch) result.push({ name: field.name, typ: field.typ, annotations: field.annotations ?? [] })
    }
  }
  return result
}

/** Spring's log line for a failed validation - shortened, but with the same parts. */
export function validationMessage(errors: FieldErrorInfo[], interpreter: Interpreter): string {
  const parts = errors.map(
    (e) =>
      `[Field error in object '${e.objectName}' on field '${e.field}': rejected value [${e.rejected.art === 'null' ? 'null' : interpreter.alsText(e.rejected)}]; default message [${e.message}]]`,
  )
  return `Validation failed for argument [0] with ${errors.length} error${errors.length === 1 ? '' : 's'}: ${parts.join(' ')}`
}
