/**
 * SPRING PART · Spring Data JPA - repositories without an implementation
 *
 *   interface TodoRepository extends JpaRepository<Todo, Long> {
 *     List<Todo> findByDoneFalse();
 *   }
 *
 * Nobody writes a class for this interface - Spring generates it at startup.
 * The generated methods here work on an in-memory "table" per entity (like an
 * H2 database in memory). With `spring.jpa.show-sql=true` every call prints
 * the SQL that Hibernate would send.
 *
 * Two JPA rules are copied on purpose:
 *   - `findById` & co. return COPIES. Changing one does nothing until `save()`.
 *     (Real JPA also saves changes automatically inside a @Transactional
 *     method - "dirty checking". This course runtime does not do that; calling
 *     save() is correct in both.)
 *   - Errors in derived query names show up at STARTUP, not at the first call.
 */

import type { FieldDecl, MethodDecl, TypeDecl, TypeRef } from '../java/ast'
import type { Interpreter } from '../java/interpreter'
import { NULL, toNumber, contentEquals, isNumber, bool, type JavaObject, type ClassInfo, type NativeValue, type Value } from '../java/values'
import { find, has, text } from './annotations'

export const REPOSITORY_TYPES = ['JpaRepository', 'CrudRepository', 'ListCrudRepository', 'PagingAndSortingRepository', 'Repository']

/** Startup problems that Spring reports before the application runs. */
export class RepositoryError extends Error {}

type Condition = {
  property: string
  operator:
    | 'eq' | 'not' | 'true' | 'false' | 'containing' | 'startingWith' | 'endingWith'
    | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'isNull' | 'isNotNull' | 'in' | 'notIn'
  ignoreCase: boolean
  /** How many arguments this condition consumes. */
  arity: number
}

type DerivedQuery = {
  kind: 'find' | 'count' | 'exists' | 'delete'
  limit?: number
  /** Conditions in OR groups: `findByAAndBOrC` → [[A, B], [C]] */
  groups: Condition[][]
  orderBy: { property: string; descending: boolean }[]
  distinct: boolean
}

type Table = { rows: JavaObject[]; nextId: number }

export class Repository {
  readonly queries = new Map<string, DerivedQuery>()
  readonly idField: FieldDecl
  readonly generated: boolean
  readonly tableName: string
  readonly columns: string[]

  readonly name: string
  readonly declaration: TypeDecl
  readonly entity: ClassInfo
  private readonly table: Table
  private readonly interpreter: Interpreter
  private readonly log: (sql: string) => void

  constructor(name: string, declaration: TypeDecl, entity: ClassInfo, table: Table, interpreter: Interpreter, log: (sql: string) => void) {
    this.name = name
    this.declaration = declaration
    this.entity = entity
    this.table = table
    this.interpreter = interpreter
    this.log = log
    if (!has(entity.decl.annotations, 'Entity')) {
      throw new RepositoryError(`Not a managed type: class ${entity.name} - the entity class needs the annotation @Entity`)
    }
    const fields = entityFields(entity)
    const idField = fields.find((f) => has(f.annotations, 'Id'))
    if (!idField) throw new RepositoryError(`No identifier specified for entity: ${entity.name} - mark the id field with @Id`)
    this.idField = idField
    this.generated = has(idField.annotations, 'GeneratedValue')
    this.tableName = text(find(entity.decl.annotations, 'Table'), 'name') ?? snake(entity.name)
    this.columns = [idField.name, ...fields.filter((f) => f !== idField).map((f) => f.name).sort()].map(snake)

    const properties = new Set(fields.map((f) => f.name))
    for (const method of declaration.methods) {
      if (method.body || method.isStatic) continue
      this.queries.set(method.name, parseQuery(method, entity.name, properties))
    }
  }

  call(name: string, args: Value[], line: number): Value | undefined {
    const [a] = args
    const i = this.interpreter
    switch (name) {
      case 'save':
      case 'saveAndFlush':
        return this.save(a, line)
      case 'saveAll':
        return list(i.elementsOf(a, line).map((e) => this.save(e, line)))
      case 'findAll':
        this.select('')
        return list(this.table.rows.map(copy))
      case 'findById': {
        this.select(`where ${this.alias}.${snake(this.idField.name)}=?`)
        const row = this.byId(a)
        return optional(row ? copy(row) : null)
      }
      case 'getReferenceById':
      case 'getById': {
        const row = this.byId(a)
        if (!row) i.raise('EntityNotFoundException', `Unable to find ${this.entity.name} with id ${i.toText(a)}`, line)
        return copy(row!)
      }
      case 'findAllById': {
        const ids = i.elementsOf(a, line)
        return list(this.table.rows.filter((r) => ids.some((id) => sameId(this.idOf(r), id))).map(copy))
      }
      case 'existsById':
        this.log(`select ${this.alias}.${snake(this.idField.name)} from ${this.tableName} ${this.alias} where ${this.alias}.${snake(this.idField.name)}=? fetch first ? rows only`)
        return bool(Boolean(this.byId(a)))
      case 'count':
        if (args.length) return undefined
        this.log(`select count(*) from ${this.tableName} ${this.alias}`)
        return { kind: 'long', value: this.table.rows.length }
      case 'deleteById': {
        const row = this.byId(a)
        if (row) this.remove(row)
        return NULL
      }
      case 'delete': {
        const row = a?.kind === 'object' ? this.byId(this.idOf(a)) : null
        if (row) this.remove(row)
        return NULL
      }
      case 'deleteAll':
      case 'deleteAllInBatch':
        if (args.length) {
          for (const e of i.elementsOf(a, line)) if (e.kind === 'object') this.call('delete', [e], line)
        } else {
          this.log(`delete from ${this.tableName}`)
          this.table.rows.length = 0
        }
        return NULL
      case 'flush':
        return NULL
    }
    const query = this.queries.get(name)
    return query ? this.run(query, args, line) : undefined
  }

  private get alias() {
    return this.tableName.charAt(0) + '1_0'
  }

  private select(where: string) {
    const columns = this.columns.map((c) => `${this.alias}.${c}`).join(',')
    this.log(`select ${columns} from ${this.tableName} ${this.alias}${where ? ' ' + where : ''}`)
  }

  private idOf(row: JavaObject): Value {
    return row.fields.get(this.idField.name) ?? NULL
  }

  private byId(id: Value | undefined): JavaObject | undefined {
    if (!id || id.kind === 'null') this.interpreter.raise('IllegalArgumentException', 'The given id must not be null', 0)
    return this.table.rows.find((row) => sameId(this.idOf(row), id!))
  }

  private save(entity: Value, line: number): Value {
    const i = this.interpreter
    if (entity.kind !== 'object' || entity.classInfo !== this.entity) {
      i.raise('IllegalArgumentException', `Entity must be of type ${this.entity.name}`, line)
    }
    const object = entity as JavaObject
    let id = this.idOf(object)
    const isNew = id.kind === 'null' || (isNumber(id) && toNumber(id) === 0 && this.generated)
    const fields = entityFields(this.entity).filter((f) => f !== this.idField).map((f) => snake(f.name)).sort()

    if (isNew) {
      if (!this.generated) {
        i.raise('IllegalStateException', `ids for this class must be manually assigned before calling save(): ${this.entity.name}`, line)
      }
      id = idValue(this.idField.type, this.table.nextId++)
      object.fields.set(this.idField.name, id)
      this.log(`insert into ${this.tableName} (${fields.join(',')}) values (${fields.map(() => '?').join(',')})`)
      this.table.rows.push(copy(object))
      return object
    }

    const index = this.table.rows.findIndex((row) => sameId(this.idOf(row), id))
    this.select(`where ${this.alias}.${snake(this.idField.name)}=?`)
    if (index >= 0) {
      this.log(`update ${this.tableName} set ${fields.map((f) => f + '=?').join(',')} where ${snake(this.idField.name)}=?`)
      this.table.rows[index] = copy(object)
    } else {
      this.log(`insert into ${this.tableName} (${[...fields, snake(this.idField.name)].join(',')}) values (${[...fields, 'id'].map(() => '?').join(',')})`)
      this.table.rows.push(copy(object))
      if (isNumber(id)) this.table.nextId = Math.max(this.table.nextId, toNumber(id) + 1)
    }
    return object
  }

  private remove(row: JavaObject) {
    this.select(`where ${this.alias}.${snake(this.idField.name)}=?`)
    this.log(`delete from ${this.tableName} where ${snake(this.idField.name)}=?`)
    this.table.rows.splice(this.table.rows.indexOf(row), 1)
  }

  // --- Derived queries ------------------------------------------------------

  private run(query: DerivedQuery, args: Value[], line: number): Value {
    const i = this.interpreter
    let position = 0
    const bound = query.groups.map((group) =>
      group.map((condition) => {
        const values = args.slice(position, position + condition.arity)
        position += condition.arity
        return { condition, values }
      }),
    )
    const where = query.groups
      .map((g) => g.map((c) => `${this.alias}.${snake(c.property)}${SQL[c.operator]}`).join(' and '))
      .join(' or ')
    const order = query.orderBy.map((o) => `${this.alias}.${snake(o.property)}${o.descending ? ' desc' : ''}`).join(',')

    let rows = this.table.rows.filter((row) =>
      bound.length === 0 ? true : bound.some((group) => group.every(({ condition, values }) => matches(row, condition, values, i))),
    )
    for (const { property, descending } of [...query.orderBy].reverse()) {
      rows = [...rows].sort((x, y) => compareValues(x.fields.get(property) ?? NULL, y.fields.get(property) ?? NULL, i) * (descending ? -1 : 1))
    }
    if (query.limit) rows = rows.slice(0, query.limit)

    switch (query.kind) {
      case 'count':
        this.log(`select count(${this.alias}.${snake(this.idField.name)}) from ${this.tableName} ${this.alias}${where ? ' where ' + where : ''}`)
        return { kind: 'long', value: rows.length }
      case 'exists':
        this.log(`select ${this.alias}.${snake(this.idField.name)} from ${this.tableName} ${this.alias}${where ? ' where ' + where : ''} fetch first ? rows only`)
        return bool(rows.length > 0)
      case 'delete':
        this.select(where ? 'where ' + where : '')
        for (const row of rows) this.remove(row)
        return { kind: 'long', value: rows.length }
      case 'find': {
        this.select(`${where ? 'where ' + where : ''}${order ? ' order by ' + order : ''}`.trim())
        const method = this.declarationOf(query)
        const returns = method?.returnType.name ?? 'List'
        if (returns === 'Optional') return optional(rows[0] ? copy(rows[0]) : null)
        if (returns === this.entity.name) {
          if (rows.length > 1) {
            i.raise('IncorrectResultSizeDataAccessException', `Query did not return a unique result: ${rows.length} results were returned`, line)
          }
          return rows[0] ? copy(rows[0]) : NULL
        }
        return list(rows.map(copy))
      }
    }
  }

  private declarationOf(query: DerivedQuery): MethodDecl | undefined {
    for (const [name, q] of this.queries) if (q === query) return this.declaration.methods.find((m) => m.name === name)
    return undefined
  }
}

const SQL: Record<Condition['operator'], string> = {
  eq: '=?', not: '!=?', true: '=true', false: '=false', containing: ' like ? escape \'\\\'', startingWith: ' like ? escape \'\\\'',
  endingWith: ' like ? escape \'\\\'', gt: '>?', lt: '<?', gte: '>=?', lte: '<=?', between: ' between ? and ?',
  isNull: ' is null', isNotNull: ' is not null', in: ' in (?)', notIn: ' not in (?)',
}

// ---------------------------------------------------------------------------
// Parsing method names: findByTitleContainingIgnoreCaseAndDoneFalseOrderByTitleAsc
// ---------------------------------------------------------------------------

const OPERATORS: [string, Condition['operator'], number][] = [
  ['IsNotNull', 'isNotNull', 0], ['NotNull', 'isNotNull', 0], ['IsNull', 'isNull', 0], ['Null', 'isNull', 0],
  ['IsTrue', 'true', 0], ['True', 'true', 0], ['IsFalse', 'false', 0], ['False', 'false', 0],
  ['GreaterThanEqual', 'gte', 1], ['LessThanEqual', 'lte', 1], ['GreaterThan', 'gt', 1], ['LessThan', 'lt', 1],
  ['After', 'gt', 1], ['Before', 'lt', 1], ['Between', 'between', 2],
  ['NotContaining', 'not', 1], ['IsContaining', 'containing', 1], ['Containing', 'containing', 1], ['Contains', 'containing', 1],
  ['Like', 'containing', 1], ['StartingWith', 'startingWith', 1], ['StartsWith', 'startingWith', 1],
  ['EndingWith', 'endingWith', 1], ['EndsWith', 'endingWith', 1],
  ['NotIn', 'notIn', 1], ['In', 'in', 1], ['IsNot', 'not', 1], ['Not', 'not', 1], ['Is', 'eq', 1], ['Equals', 'eq', 1],
]

function parseQuery(method: MethodDecl, entity: string, properties: Set<string>): DerivedQuery {
  const fail = (reason: string): never => {
    throw new RepositoryError(`Could not create query for method ${method.name}(); ${reason}`)
  }
  const match = method.name.match(/^(find|read|get|query|search|stream|count|exists|delete|remove)(.*?)By(.*)$/)
  if (!match) {
    fail(`the name must start with findBy, countBy, existsBy or deleteBy (e.g. findByTitle)`)
  }
  const [, verb, subject, predicate] = match!
  const kind = verb === 'count' ? 'count' : verb === 'exists' ? 'exists' : verb === 'delete' || verb === 'remove' ? 'delete' : 'find'
  const limit = subject.match(/(?:First|Top)(\d*)/)
  const query: DerivedQuery = {
    kind,
    limit: limit ? Number(limit[1] || 1) : undefined,
    groups: [],
    orderBy: [],
    distinct: subject.includes('Distinct'),
  }

  let conditions = predicate
  const orderIndex = predicate.indexOf('OrderBy')
  if (orderIndex >= 0) {
    conditions = predicate.slice(0, orderIndex)
    for (const part of predicate.slice(orderIndex + 7).split(/(?<=Asc|Desc)(?=[A-Z])/)) {
      const order = part.match(/^(\w+?)(Asc|Desc)?$/)
      if (!order) continue
      const property = propertyName(order[1], properties) ?? fail(`No property '${decap(order[1])}' found for type '${entity}'`)
      query.orderBy.push({ property, descending: order[2] === 'Desc' })
    }
  }

  let argumentsNeeded = 0
  if (conditions) {
    for (const group of conditions.split(/Or(?=[A-Z])/)) {
      const parsed: Condition[] = []
      for (const part of group.split(/And(?=[A-Z])/)) {
        let rest = part
        let ignoreCase = false
        for (const suffix of ['IgnoreCase', 'IgnoringCase', 'AllIgnoreCase']) {
          if (rest.endsWith(suffix)) {
            rest = rest.slice(0, -suffix.length)
            ignoreCase = true
          }
        }
        let operator: Condition['operator'] = 'eq'
        let arity = 1
        const property = propertyName(rest, properties)
        if (!property) {
          const found = OPERATORS.find(([word]) => rest.endsWith(word) && propertyName(rest.slice(0, -word.length), properties))
          if (!found) fail(`No property '${decap(rest)}' found for type '${entity}'`)
          ;[, operator, arity] = found!
          rest = rest.slice(0, -found![0].length)
        }
        parsed.push({ property: propertyName(rest, properties)!, operator, ignoreCase, arity })
        argumentsNeeded += arity
      }
      query.groups.push(parsed)
    }
  }
  if (argumentsNeeded !== method.params.length) {
    fail(`it needs ${argumentsNeeded} parameter(s), but declares ${method.params.length}`)
  }
  return query
}

function propertyName(part: string, properties: Set<string>): string | null {
  if (!part) return null
  const name = decap(part)
  return properties.has(name) ? name : null
}

const decap = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

function matches(row: JavaObject, condition: Condition, values: Value[], i: Interpreter): boolean {
  const value = row.fields.get(condition.property) ?? NULL
  const [a, b] = values
  const lower = (w: Value) => (condition.ignoreCase ? i.toText(w).toLowerCase() : i.toText(w))
  const same = (x: Value, y: Value) => (condition.ignoreCase && x.kind === 'string' && y.kind === 'string' ? lower(x) === lower(y) : contentEquals(x, y))
  switch (condition.operator) {
    case 'eq':
      return same(value, a)
    case 'not':
      return !same(value, a)
    case 'true':
      return value.kind === 'boolean' && value.value
    case 'false':
      return value.kind === 'boolean' && !value.value
    case 'containing':
      return value.kind !== 'null' && lower(value).includes(lower(a))
    case 'startingWith':
      return value.kind !== 'null' && lower(value).startsWith(lower(a))
    case 'endingWith':
      return value.kind !== 'null' && lower(value).endsWith(lower(a))
    case 'gt':
      return compareValues(value, a, i) > 0
    case 'lt':
      return compareValues(value, a, i) < 0
    case 'gte':
      return compareValues(value, a, i) >= 0
    case 'lte':
      return compareValues(value, a, i) <= 0
    case 'between':
      return compareValues(value, a, i) >= 0 && compareValues(value, b, i) <= 0
    case 'isNull':
      return value.kind === 'null'
    case 'isNotNull':
      return value.kind !== 'null'
    case 'in':
      return i.elementsOf(a, 0).some((x) => same(value, x))
    case 'notIn':
      return !i.elementsOf(a, 0).some((x) => same(value, x))
  }
}

function compareValues(a: Value, b: Value, i: Interpreter): number {
  if (a.kind === 'null' || b.kind === 'null') return a.kind === b.kind ? 0 : a.kind === 'null' ? -1 : 1
  if (isNumber(a) && isNumber(b)) return toNumber(a) - toNumber(b)
  if (a.kind === 'boolean' && b.kind === 'boolean') return Number(a.value) - Number(b.value)
  return i.toText(a).localeCompare(i.toText(b))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function entityFields(entity: ClassInfo): FieldDecl[] {
  const chain: ClassInfo[] = []
  for (let k: ClassInfo | undefined = entity; k; k = k.superclass) chain.unshift(k)
  return chain.flatMap((k) => k.decl.fields.filter((f) => !f.isStatic && !has(f.annotations, 'Transient')))
}

/** `TodoItem` → `todo_item`: Hibernate's default naming for tables and columns. */
export const snake = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()

function idValue(type: TypeRef, n: number): Value {
  return type.name === 'Long' || type.name === 'long' ? { kind: 'long', value: n } : { kind: 'int', value: n }
}

function sameId(a: Value, b: Value) {
  return contentEquals(a, b)
}

/** A detached copy - changing it does not change the "database". */
function copy(row: JavaObject): JavaObject {
  return { kind: 'object', classInfo: row.classInfo, fields: new Map(row.fields) }
}

const list = (values: Value[]): NativeValue => ({ kind: 'native', type: 'ArrayList', data: { list: values } })
const optional = (value: Value | null): NativeValue => ({ kind: 'native', type: 'Optional', data: { list: value ? [value] : [] } })

/** The entity type of `interface X extends JpaRepository<Todo, Long>` - or null if X is no repository. */
export function repositoryEntity(declaration: TypeDecl): string | null {
  if (declaration.kind !== 'interface') return null
  const base = declaration.superTypes?.find((t) => REPOSITORY_TYPES.includes(t.name))
  return base?.args[0]?.name ?? null
}
