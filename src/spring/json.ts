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

import type { Annotation, TypRef } from '../java/ast'
import type { Interpreter } from '../java/interpreter'
import { NULL, komma, neuerString, wahrheit, zeichen, type JavaObjekt, type Klasse, type Wert } from '../java/werte'
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

export function toJson(value: Wert, interpreter: Interpreter, depth = 0): Json {
  if (depth > 40) throw new JsonError('write', 'Document nesting depth exceeds the maximum allowed - is there a cycle (a → b → a)?')
  switch (value.art) {
    case 'null':
      return null
    case 'boolean':
      return value.wert
    case 'int':
    case 'long':
    case 'double':
      return value.wert
    case 'char':
      return String.fromCharCode(value.wert)
    case 'string':
      return value.wert
    case 'array':
      return value.werte.map((v) => toJson(v, interpreter, depth + 1))
    case 'funktion':
      throw new JsonError('write', 'No serializer found for a lambda expression')
    case 'nativ': {
      const { liste, map } = value.daten
      if (value.typ === 'Optional') return liste?.length ? toJson(liste[0], interpreter, depth + 1) : null
      if (value.typ === 'ResponseEntity') return liste?.length ? toJson(liste[0], interpreter, depth + 1) : null
      if (value.typ === 'ProblemDetail' && map) return mapToJson(map, interpreter, depth)
      if (value.typ === 'Entry' && liste) return { [interpreter.alsText(liste[0])]: toJson(liste[1], interpreter, depth + 1) }
      if (value.typ === 'StringBuilder' || value.typ === 'URI' || value.typ === 'Class') return interpreter.alsText(value)
      if (value.typ === 'HttpStatus') return value.daten.text ?? null
      if (value.typ === 'AtomicLong' || value.typ === 'AtomicInteger') return value.daten.zahl ?? 0
      if (map) return mapToJson(map, interpreter, depth)
      if (liste) return liste.map((v) => toJson(v, interpreter, depth + 1))
      if (value.daten.meldung !== undefined || /Exception$|Error$/.test(value.typ)) return { message: value.daten.meldung ?? null }
      return interpreter.alsText(value)
    }
    case 'objekt':
      return objectToJson(value, interpreter, depth)
  }
}

function mapToJson(map: Map<string, { schluessel: Wert; wert: Wert }>, interpreter: Interpreter, depth: number): Json {
  const result: Record<string, Json> = {}
  for (const entry of map.values()) result[interpreter.alsText(entry.schluessel)] = toJson(entry.wert, interpreter, depth + 1)
  return result
}

function objectToJson(object: JavaObjekt, interpreter: Interpreter, depth: number): Json {
  const klasse = object.klasse
  if (klasse.istEnum) return interpreter.alsText(object.felder.get('$name') ?? NULL)

  const result: Record<string, Json> = {}
  for (const property of readableProperties(klasse)) {
    const value = property.getter
      ? interpreter.invoke(property.getter.owner, property.getter.method, object, [])
      : (object.felder.get(property.field!) ?? NULL)
    result[property.name] = toJson(value, interpreter, depth + 1)
  }
  if (!Object.keys(result).length && !klasse.dekl.komponenten?.length) {
    throw new JsonError(
      'write',
      `No serializer found for class ${klasse.name} and no properties discovered to create BeanSerializer (add getters or make it a record)`,
    )
  }
  return result
}

type Getter = { owner: Klasse; method: import('../java/ast').MethodenDekl }
type Property = { name: string; getter?: Getter; field?: string }

/** What Jackson would write: record components, getters and public fields - minus @JsonIgnore. */
export function readableProperties(klasse: Klasse): Property[] {
  if (klasse.dekl.komponenten) {
    return klasse.dekl.komponenten
      .filter((c) => !find(c.annotations, 'JsonIgnore'))
      .map((c) => ({ name: jsonName(c.annotations) ?? c.name, field: c.name }))
  }

  const chain: Klasse[] = []
  for (let k: Klasse | undefined = klasse; k; k = k.oberklasse) chain.unshift(k)

  const getters = new Map<string, Getter & { annotations?: Annotation[] }>()
  for (const k of chain) {
    for (const [name, overloads] of k.methoden) {
      for (const method of overloads) {
        if (method.statisch || method.parameter.length || !method.rumpf || method.sichtbarkeit === 'private') continue
        const property = propertyOfGetter(name, method.rueckgabe)
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
    for (const field of k.dekl.felder) {
      if (field.statisch) continue
      const getter = getters.get(field.name)
      const ignored = find(field.annotations, 'JsonIgnore') ?? find(getter?.annotations, 'JsonIgnore')
      if (getter) add(field.name, { name: field.name, getter }, ignored ? [ignored] : (field.annotations ?? getter.annotations))
      else if (field.sichtbarkeit === 'public') add(field.name, { name: field.name, field: field.name }, field.annotations)
    }
  }
  for (const [name, getter] of getters) add(name, { name, getter }, getter.annotations)
  return properties
}

function propertyOfGetter(name: string, returnType: TypRef): string | null {
  if (returnType.name === 'void') return null
  const get = name.match(/^get([A-Z]\w*)$/)
  if (get && name !== 'getClass') return decapitalize(get[1])
  const is = name.match(/^is([A-Z]\w*)$/)
  if (is && returnType.name === 'boolean' && returnType.dimensionen === 0) return decapitalize(is[1])
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

export const typeText = (type: TypRef): string =>
  type.name + (type.argumente.length ? `<${type.argumente.map(typeText).join(', ')}>` : '') + '[]'.repeat(type.dimensionen)

const jsonKind = (json: Json) =>
  json === null ? 'null' : Array.isArray(json) ? 'Array' : typeof json === 'object' ? 'Object' : typeof json === 'string' ? 'String' : typeof json === 'number' ? 'Number' : 'Boolean'

export function fromJson(json: Json, type: TypRef, interpreter: Interpreter): Wert {
  const name = type.name
  const fail = (detail = ''): never => {
    throw new JsonError(
      'read',
      `Cannot deserialize value of type \`${typeText(type)}\` from ${jsonKind(json)} value${json !== null && typeof json !== 'object' ? ` (${JSON.stringify(json)})` : ''}${detail}`,
    )
  }

  if (type.dimensionen > 0) {
    if (json === null) return NULL
    if (!Array.isArray(json)) fail()
    const element = { ...type, dimensionen: type.dimensionen - 1 }
    return { art: 'array', typ: type.name, werte: (json as Json[]).map((j) => fromJson(j, element, interpreter)) }
  }

  if (json === null) {
    // Jackson puts the default value into primitives instead of failing.
    if (PRIMITIVES.has(name)) return interpreter.standardWert(type)
    return NULL
  }

  if (INTEGERS.has(name)) {
    const n = typeof json === 'number' ? json : typeof json === 'string' && /^-?\d+$/.test(json.trim()) ? Number(json) : NaN
    if (Number.isNaN(n)) fail(`: not a valid \`${name}\` value`)
    return name === 'long' || name === 'Long' ? { art: 'long', wert: Math.trunc(n) } : { art: 'int', wert: Math.trunc(n) | 0 }
  }
  if (DECIMALS.has(name)) {
    const n = typeof json === 'number' ? json : typeof json === 'string' && json.trim() !== '' ? Number(json) : NaN
    if (Number.isNaN(n)) fail(`: not a valid \`${name}\` value`)
    return komma(n)
  }
  if (name === 'boolean' || name === 'Boolean') {
    if (typeof json === 'boolean') return wahrheit(json)
    if (json === 'true' || json === 'false') return wahrheit(json === 'true')
    fail(': only "true" or "false" recognized')
  }
  if (name === 'String' || name === 'CharSequence') {
    if (typeof json === 'object') fail()
    return neuerString(String(json))
  }
  if (name === 'char' || name === 'Character') {
    if (typeof json !== 'string' || json.length !== 1) fail(': expected a single character')
    return zeichen((json as string).charCodeAt(0))
  }
  if (LISTS.has(name)) {
    if (!Array.isArray(json)) fail()
    const element = type.argumente[0] ?? { name: 'Object', dimensionen: 0, argumente: [] }
    return { art: 'nativ', typ: 'ArrayList', daten: { liste: (json as Json[]).map((j) => fromJson(j, element, interpreter)) } }
  }
  if (MAPS.has(name)) {
    if (typeof json !== 'object' || Array.isArray(json)) fail()
    const valueType = type.argumente[1] ?? { name: 'Object', dimensionen: 0, argumente: [] }
    const map = new Map<string, { schluessel: Wert; wert: Wert }>()
    for (const [key, value] of Object.entries(json as Record<string, Json>)) {
      const k = neuerString(key)
      map.set(interpreter.schluessel(k), { schluessel: k, wert: fromJson(value, valueType, interpreter) })
    }
    return { art: 'nativ', typ: 'LinkedHashMap', daten: { map } }
  }

  const klasse = interpreter.klassen.get(name)
  if (!klasse) return fromUntyped(json, interpreter)

  if (klasse.istEnum) {
    const constants = klasse.dekl.konstanten.map((k) => k.name)
    if (typeof json !== 'string' || !constants.includes(json)) {
      fail(`: not one of the values accepted for Enum class: [${constants.join(', ')}]`)
    }
    return klasse.statisch.get(json as string)!
  }

  if (typeof json !== 'object' || Array.isArray(json)) fail(': expected a JSON object {…}')
  return objectFromJson(json as Record<string, Json>, klasse, type, interpreter)
}

function objectFromJson(json: Record<string, Json>, klasse: Klasse, type: TypRef, interpreter: Interpreter): Wert {
  if (klasse.abstrakt) {
    throw new JsonError('read', `Cannot construct instance of \`${klasse.name}\` (abstract types either need to be mapped to concrete types or have custom deserializer)`)
  }
  const line = klasse.dekl.zeile

  // Records and classes with exactly one constructor: fill its parameters by name.
  // `null` = use the no-arg constructor (declared, or the default one when there is none at all).
  const constructors = klasse.konstruktoren
  const parameters =
    klasse.dekl.komponenten ??
    (constructors.length === 0 || constructors.some((k) => k.parameter.length === 0) ? null : constructors.length === 1 ? constructors[0].parameter : undefined)
  if (parameters === undefined) {
    throw new JsonError(
      'read',
      `Cannot construct instance of \`${type.name}\` (no Creators, like default constructor, exist): add a constructor without parameters`,
    )
  }
  if (parameters) {
    const args = parameters.map((p) => {
      const key = jsonName(p.annotations) ?? p.name
      return key in json ? fromJson(json[key], p.typ, interpreter) : interpreter.standardWert(p.typ)
    })
    return interpreter.neuErzeugen(klasse.name, args, line)
  }

  const object = interpreter.neuErzeugen(klasse.name, [], line) as JavaObjekt
  const fields = new Map<string, import('../java/ast').FeldDekl>()
  for (let k: Klasse | undefined = klasse; k; k = k.oberklasse) for (const f of k.dekl.felder) if (!f.statisch && !fields.has(f.name)) fields.set(f.name, f)
  const readable = new Set(readableProperties(klasse).map((p) => p.field ?? p.name))

  for (const [key, value] of Object.entries(json)) {
    const setterName = 'set' + key.charAt(0).toUpperCase() + key.slice(1)
    const setter = findMethod(klasse, setterName, 1)
    if (setter) {
      interpreter.invoke(setter.owner, setter.method, object, [fromJson(value, setter.method.parameter[0].typ, interpreter)])
      continue
    }
    const field = fields.get(key)
    // Jackson may also write a private field - but only if a getter "announces" the property.
    if (field && !field.final && (field.sichtbarkeit === 'public' || readable.has(key)) && !find(field.annotations, 'JsonIgnore')) {
      object.felder.set(key, interpreter.anpassen(fromJson(value, field.typ, interpreter), field.typ))
    }
  }
  return object
}

function findMethod(klasse: Klasse, name: string, parameterCount: number) {
  for (let k: Klasse | undefined = klasse; k; k = k.oberklasse) {
    const method = (k.methoden.get(name) ?? []).find((m) => m.parameter.length === parameterCount && m.rumpf && !m.statisch)
    if (method) return { owner: k, method }
  }
  return null
}

/** JSON into `Object`: numbers, strings, lists and maps. */
function fromUntyped(json: Json, interpreter: Interpreter): Wert {
  if (json === null) return NULL
  if (typeof json === 'boolean') return wahrheit(json)
  if (typeof json === 'number') return Number.isInteger(json) ? { art: 'int', wert: json } : komma(json)
  if (typeof json === 'string') return neuerString(json)
  if (Array.isArray(json)) return { art: 'nativ', typ: 'ArrayList', daten: { liste: json.map((j) => fromUntyped(j, interpreter)) } }
  const map = new Map<string, { schluessel: Wert; wert: Wert }>()
  for (const [key, value] of Object.entries(json)) {
    const k = neuerString(key)
    map.set(interpreter.schluessel(k), { schluessel: k, wert: fromUntyped(value, interpreter) })
  }
  return { art: 'nativ', typ: 'LinkedHashMap', daten: { map } }
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
