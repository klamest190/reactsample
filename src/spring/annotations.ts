/**
 * SPRING PART · Reading annotations
 *
 * Spring decides almost everything by looking at annotations: which classes
 * become beans, which methods answer which URL, what gets validated. The Java
 * parser keeps them in the syntax tree (see src/java/ast.ts); these helpers
 * read them comfortably.
 */

import type { Annotation, AnnotationValue } from '../java/ast'

/** Everything that makes a class a bean during component scanning. */
export const STEREOTYPES = [
  'Component',
  'Service',
  'Repository',
  'Controller',
  'RestController',
  'Configuration',
  'SpringBootApplication',
  'RestControllerAdvice',
  'ControllerAdvice',
]

export const MAPPINGS: Record<string, string | null> = {
  GetMapping: 'GET',
  PostMapping: 'POST',
  PutMapping: 'PUT',
  DeleteMapping: 'DELETE',
  PatchMapping: 'PATCH',
  // @RequestMapping names its method(s) itself - or accepts all of them.
  RequestMapping: null,
}

export function find(annotations: Annotation[] | undefined, ...names: string[]): Annotation | undefined {
  return annotations?.find((a) => names.includes(a.name))
}

export function has(annotations: Annotation[] | undefined, ...names: string[]): boolean {
  return Boolean(find(annotations, ...names))
}

/** A single text value; for arrays the first element (`@GetMapping({"/a", "/b"})`). */
export function text(annotation: Annotation | undefined, ...keys: string[]): string | undefined {
  if (!annotation) return undefined
  for (const key of keys.length ? keys : ['value']) {
    const value = annotation.values[key]
    if (value === undefined) continue
    const first = Array.isArray(value) ? value[0] : value
    if (first !== undefined) return String(first)
  }
  return undefined
}

/** All values of a key as texts: `@RequestMapping(method = {RequestMethod.GET, RequestMethod.HEAD})`. */
export function texts(annotation: Annotation | undefined, ...keys: string[]): string[] {
  if (!annotation) return []
  for (const key of keys.length ? keys : ['value']) {
    const value = annotation.values[key]
    if (value === undefined) continue
    return (Array.isArray(value) ? value : [value]).map((v: AnnotationValue) => String(v))
  }
  return []
}

export function number(annotation: Annotation | undefined, key: string): number | undefined {
  const value = annotation?.values[key]
  return typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value)) ? Number(value) : undefined
}

export function flag(annotation: Annotation | undefined, key: string): boolean | undefined {
  const value = annotation?.values[key]
  return typeof value === 'boolean' ? value : undefined
}

/** `HttpStatus.NOT_FOUND` → `NOT_FOUND` - the last part of a constant. */
export const constantName = (value: string) => value.slice(value.lastIndexOf('.') + 1)

/** Bean names: `TodoService` → `todoService` (like Spring's AnnotationBeanNameGenerator). */
export function beanNameOf(className: string): string {
  // Spring keeps names like `URLService` as they are - two capitals in a row.
  if (/^[A-Z]{2}/.test(className)) return className
  return className.charAt(0).toLowerCase() + className.slice(1)
}
