/**
 * SPRING PART · Java objects ↔ JSON
 *
 * Real Spring Boot uses the Jackson library for this. The rules copied here are
 * the ones beginners trip over:
 *
 *   - Objects are written through their GETTERS (getTitle → "title", isDone → "done").
 *     Private fields without a getter do not appear in the JSON at all.
 *   - A class without any readable property cannot be written:
 *     "No serializer found for class …" → HTTP 500.
 *   - Records are written with their components.
 *   - Reading needs a way to create the object: a no-arg constructor plus setters
 *     (or fields that have a getter), or a single constructor / record with named parameters.
 *   - Unknown JSON properties are ignored (Spring Boot's default).
 */

import type { Annotation, TypeRef } from '../java/ast'
import type { Interpreter } from '../java/interpreter'
import { NULL, comma, newString, bool, chars, type JavaObject, type ClassInfo, type Value } from '../java/values'
import { find, text } from './annotations'

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

/** A JSON problem - `write` becomes HTTP 500, `read` becomes HTTP 400. */
export class JsonError extends Error {
  readonly kind: 'write' | 'read'

  constructor(kind: 'write' | 'read', message: string) {
    super(message)
    this.kind = kind
  }
}

// ---------------------------------------------------------------------------
// Java → JSON
// ---------------------------------------------------------------------------

export function toJson(value: Value, interpreter: Interpreter, depth = 0): Json {
  if (depth > 40) throw new JsonError('write', 'Document nesting depth exceeds the maximum allowed - is there a cycle (a → b → a)?')
  switch (value.kind) {
    case 'null':
      return null
    case 'boolean':
      return value.value
    case 'int':
    case 'long':
    case 'double':
      return value.value
    case 'char':
      return String.fromCharCode(value.value)
    case 'string':
      return value.value
    case 'array':
      return value.values.map((v) => toJson(v, interpreter, depth + 1))
    case 'function':
      throw new JsonError('write', 'No serializer found for a lambda expression')
    case 'native': {
      const { list, map } = value.data
      if (value.type === 'Optional') return list?.length ? toJson(list[0], interpreter, depth + 1) : null
      if (value.type === 'ResponseEntity') return list?.length ? toJson(list[0], interpreter, depth + 1) : null
      if (value.type === 'ProblemDetail' && map) return mapToJson(map, interpreter, depth)
      if (value.type === 'Entry' && list) return { [interpreter.toText(list[0])]: toJson(list[1], interpreter, depth + 1) }
      if (value.type === 'StringBuilder' || value.type === 'URI' || value.type === 'Class') return interpreter.toText(value)
      if (value.type === 'HttpStatus') return value.data.text ?? null
      if (value.type === 'AtomicLong' || value.type === 'AtomicInteger') return value.data.number ?? 0
      if (map) return mapToJson(map, interpreter, depth)
      if (list) return list.map((v) => toJson(v, interpreter, depth + 1))
      if (value.data.message !== undefined || /Exception$|Error$/.test(value.type)) return { message: value.data.message ?? null }
      return interpreter.toText(value)
    }
    case 'object':
      return objectToJson(value, interpreter, depth)
  }
}

function mapToJson(map: Map<string, { key: Value; value: Value }>, interpreter: Interpreter, depth: number): Json {
  const result: Record<string, Json> = {}
  for (const entry of map.values()) result[interpreter.toText(entry.key)] = toJson(entry.value, interpreter, depth + 1)
  return result
}

function objectToJson(object: JavaObject, interpreter: Interpreter, depth: number): Json {
  const classInfo = object.classInfo
  if (classInfo.isEnum) return interpreter.toText(object.fields.get('$name') ?? NULL)

  const result: Record<string, Json> = {}
  for (const property of readableProperties(classInfo)) {
    const value = property.getter
      ? interpreter.invoke(property.getter.owner, property.getter.method, object, [])
      : (object.fields.get(property.field!) ?? NULL)
    result[property.name] = toJson(value, interpreter, depth + 1)
  }
  if (!Object.keys(result).length && !classInfo.decl.components?.length) {
    throw new JsonError(
      'write',
      `No serializer found for class ${classInfo.name} and no properties discovered to create BeanSerializer (add getters or make it a record)`,
    )
  }
  return result
}

type Getter = { owner: ClassInfo; method: import('../java/ast').MethodDecl }
type Property = { name: string; getter?: Getter; field?: string }

/** What Jackson would write: record components, getters and public fields - minus @JsonIgnore. */
export function readableProperties(classInfo: ClassInfo): Property[] {
  if (classInfo.decl.components) {
    return classInfo.decl.components
      .filter((c) => !find(c.annotations, 'JsonIgnore'))
      .map((c) => ({ name: jsonName(c.annotations) ?? c.name, field: c.name }))
  }

  const chain: ClassInfo[] = []
  for (let k: ClassInfo | undefined = classInfo; k; k = k.superclass) chain.unshift(k)

  const getters = new Map<string, Getter & { annotations?: Annotation[] }>()
  for (const k of chain) {
    for (const [name, overloads] of k.methods) {
      for (const method of overloads) {
        if (method.isStatic || method.params.length || !method.body || method.visibility === 'private') continue
        const property = propertyOfGetter(name, method.returnType)
        if (property) getters.set(property, { owner: k, method, annotations: method.annotations })
      }
    }
  }

  const properties: Property[] = []
  const seen = new Set<string>()
  const add = (name: string, property: Property, annotations: Annotation[] | undefined) => {
    if (seen.has(name)) return
    seen.add(name)
    if (find(annotations, 'JsonIgnore')) return
    properties.push({ ...property, name: jsonName(annotations) ?? name })
  }
  // Declaration order of the fields first, then getters without a field.
  for (const k of chain) {
    for (const field of k.decl.fields) {
      if (field.isStatic) continue
      const getter = getters.get(field.name)
      const ignored = find(field.annotations, 'JsonIgnore') ?? find(getter?.annotations, 'JsonIgnore')
      if (getter) add(field.name, { name: field.name, getter }, ignored ? [ignored] : (field.annotations ?? getter.annotations))
      else if (field.visibility === 'public') add(field.name, { name: field.name, field: field.name }, field.annotations)
    }
  }
  for (const [name, getter] of getters) add(name, { name, getter }, getter.annotations)
  return properties
}

function propertyOfGetter(name: string, returnType: TypeRef): string | null {
  if (returnType.name === 'void') return null
  const get = name.match(/^get([A-Z]\w*)$/)
  if (get && name !== 'getClass') return decapitalize(get[1])
  const is = name.match(/^is([A-Z]\w*)$/)
  if (is && returnType.name === 'boolean' && returnType.dimensions === 0) return decapitalize(is[1])
  return null
}

const decapitalize = (name: string) => (/^[A-Z]{2}/.test(name) ? name.toLowerCase() : name.charAt(0).toLowerCase() + name.slice(1))
const jsonName = (annotations: Annotation[] | undefined) => text(find(annotations, 'JsonProperty'))

// ---------------------------------------------------------------------------
// JSON → Java
// ---------------------------------------------------------------------------

const INTEGERS = new Set(['int', 'Integer', 'long', 'Long', 'short', 'Short', 'byte', 'Byte'])
const DECIMALS = new Set(['double', 'Double', 'float', 'Float'])
const PRIMITIVES = new Set(['int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char'])
const LISTS = new Set(['List', 'ArrayList', 'LinkedList', 'Collection', 'Iterable', 'Set', 'HashSet', 'LinkedHashSet', 'TreeSet'])
const MAPS = new Set(['Map', 'HashMap', 'LinkedHashMap', 'TreeMap'])

export const typeText = (type: TypeRef): string =>
  type.name + (type.args.length ? `<${type.args.map(typeText).join(', ')}>` : '') + '[]'.repeat(type.dimensions)

const jsonKind = (json: Json) =>
  json === null ? 'null' : Array.isArray(json) ? 'Array' : typeof json === 'object' ? 'Object' : typeof json === 'string' ? 'String' : typeof json === 'number' ? 'Number' : 'Boolean'

export function fromJson(json: Json, type: TypeRef, interpreter: Interpreter): Value {
  const name = type.name
  const fail = (detail = ''): never => {
    throw new JsonError(
      'read',
      `Cannot deserialize value of type \`${typeText(type)}\` from ${jsonKind(json)} value${json !== null && typeof json !== 'object' ? ` (${JSON.stringify(json)})` : ''}${detail}`,
    )
  }

  if (type.dimensions > 0) {
    if (json === null) return NULL
    if (!Array.isArray(json)) fail()
    const element = { ...type, dimensionen: type.dimensions - 1 }
    return { kind: 'array', type: type.name, values: (json as Json[]).map((j) => fromJson(j, element, interpreter)) }
  }

  if (json === null) {
    // Jackson puts the default value into primitives instead of failing.
    if (PRIMITIVES.has(name)) return interpreter.defaultValue(type)
    return NULL
  }

  if (INTEGERS.has(name)) {
    const n = typeof json === 'number' ? json : typeof json === 'string' && /^-?\d+$/.test(json.trim()) ? Number(json) : NaN
    if (Number.isNaN(n)) fail(`: not a valid \`${name}\` value`)
    return name === 'long' || name === 'Long' ? { kind: 'long', value: Math.trunc(n) } : { kind: 'int', value: Math.trunc(n) | 0 }
  }
  if (DECIMALS.has(name)) {
    const n = typeof json === 'number' ? json : typeof json === 'string' && json.trim() !== '' ? Number(json) : NaN
    if (Number.isNaN(n)) fail(`: not a valid \`${name}\` value`)
    return comma(n)
  }
  if (name === 'boolean' || name === 'Boolean') {
    if (typeof json === 'boolean') return bool(json)
    if (json === 'true' || json === 'false') return bool(json === 'true')
    fail(': only "true" or "false" recognized')
  }
  if (name === 'String' || name === 'CharSequence') {
    if (typeof json === 'object') fail()
    return newString(String(json))
  }
  if (name === 'char' || name === 'Character') {
    if (typeof json !== 'string' || json.length !== 1) fail(': expected a single character')
    return chars((json as string).charCodeAt(0))
  }
  if (LISTS.has(name)) {
    if (!Array.isArray(json)) fail()
    const element = type.args[0] ?? { name: 'Object', dimensions: 0, args: [] }
    return { kind: 'native', type: 'ArrayList', data: { list: (json as Json[]).map((j) => fromJson(j, element, interpreter)) } }
  }
  if (MAPS.has(name)) {
    if (typeof json !== 'object' || Array.isArray(json)) fail()
    const valueType = type.args[1] ?? { name: 'Object', dimensions: 0, args: [] }
    const map = new Map<string, { key: Value; value: Value }>()
    for (const [key, value] of Object.entries(json as Record<string, Json>)) {
      const k = newString(key)
      map.set(interpreter.key(k), { key: k, value: fromJson(value, valueType, interpreter) })
    }
    return { kind: 'native', type: 'LinkedHashMap', data: { map } }
  }

  const classInfo = interpreter.classes.get(name)
  if (!classInfo) return fromUntyped(json, interpreter)

  if (classInfo.isEnum) {
    const constants = classInfo.decl.constants.map((k) => k.name)
    if (typeof json !== 'string' || !constants.includes(json)) {
      fail(`: not one of the values accepted for Enum class: [${constants.join(', ')}]`)
    }
    return classInfo.isStatic.get(json as string)!
  }

  if (typeof json !== 'object' || Array.isArray(json)) fail(': expected a JSON object {…}')
  return objectFromJson(json as Record<string, Json>, classInfo, type, interpreter)
}

function objectFromJson(json: Record<string, Json>, classInfo: ClassInfo, type: TypeRef, interpreter: Interpreter): Value {
  if (classInfo.isAbstract) {
    throw new JsonError('read', `Cannot construct instance of \`${classInfo.name}\` (abstract types either need to be mapped to concrete types or have custom deserializer)`)
  }
  const line = classInfo.decl.line

  // Records and classes with exactly one constructor: fill its parameters by name.
  // `null` = use the no-arg constructor (declared, or the default one when there is none at all).
  const constructors = classInfo.constructors
  const parameters =
    classInfo.decl.components ??
    (constructors.length === 0 || constructors.some((k) => k.params.length === 0) ? null : constructors.length === 1 ? constructors[0].params : undefined)
  if (parameters === undefined) {
    throw new JsonError(
      'read',
      `Cannot construct instance of \`${type.name}\` (no Creators, like default constructor, exist): add a constructor without parameters`,
    )
  }
  if (parameters) {
    const args = parameters.map((p) => {
      const key = jsonName(p.annotations) ?? p.name
      return key in json ? fromJson(json[key], p.type, interpreter) : interpreter.defaultValue(p.type)
    })
    return interpreter.instantiate(classInfo.name, args, line)
  }

  const object = interpreter.instantiate(classInfo.name, [], line) as JavaObject
  const fields = new Map<string, import('../java/ast').FieldDecl>()
  for (let k: ClassInfo | undefined = classInfo; k; k = k.superclass) for (const f of k.decl.fields) if (!f.isStatic && !fields.has(f.name)) fields.set(f.name, f)
  const readable = new Set(readableProperties(classInfo).map((p) => p.field ?? p.name))

  for (const [key, value] of Object.entries(json)) {
    const setterName = 'set' + key.charAt(0).toUpperCase() + key.slice(1)
    const setter = findMethod(classInfo, setterName, 1)
    if (setter) {
      interpreter.invoke(setter.owner, setter.method, object, [fromJson(value, setter.method.params[0].type, interpreter)])
      continue
    }
    const field = fields.get(key)
    // Jackson may also write a private field - but only if a getter "announces" the property.
    if (field && !field.final && (field.visibility === 'public' || readable.has(key)) && !find(field.annotations, 'JsonIgnore')) {
      object.fields.set(key, interpreter.adapt(fromJson(value, field.type, interpreter), field.type))
    }
  }
  return object
}

function findMethod(classInfo: ClassInfo, name: string, parameterCount: number) {
  for (let k: ClassInfo | undefined = classInfo; k; k = k.superclass) {
    const method = (k.methods.get(name) ?? []).find((m) => m.params.length === parameterCount && m.body && !m.isStatic)
    if (method) return { owner: k, method }
  }
  return null
}

/** JSON into `Object`: numbers, strings, lists and maps. */
function fromUntyped(json: Json, interpreter: Interpreter): Value {
  if (json === null) return NULL
  if (typeof json === 'boolean') return bool(json)
  if (typeof json === 'number') return Number.isInteger(json) ? { kind: 'int', value: json } : comma(json)
  if (typeof json === 'string') return newString(json)
  if (Array.isArray(json)) return { kind: 'native', type: 'ArrayList', data: { list: json.map((j) => fromUntyped(j, interpreter)) } }
  const map = new Map<string, { key: Value; value: Value }>()
  for (const [key, value] of Object.entries(json)) {
    const k = newString(key)
    map.set(interpreter.key(k), { key: k, value: fromUntyped(value, interpreter) })
  }
  return { kind: 'native', type: 'LinkedHashMap', data: { map } }
}

/** Parses a request body. Errors read like Jackson's. */
export function parseJson(text: string): Json {
  try {
    return JSON.parse(text) as Json
  } catch (error) {
    throw new JsonError('read', `JSON parse error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export const formatJson = (json: Json) => JSON.stringify(json, null, 2)
