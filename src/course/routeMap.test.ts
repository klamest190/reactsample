import { describe, expect, it } from 'vitest'

import { alleKapitel, BEREICHE, kurs, type KapitelMitTeil, type Teil } from './course'
import { buildRouteMap } from './routeMap'

const columnsOf = (map: ReturnType<typeof buildRouteMap>) =>
  Object.fromEntries(map.lines.flatMap((line) => line.stations.map((s) => [s.part.id, s.column])))

describe('route map of the course', () => {
  const map = buildRouteMap(kurs, BEREICHE, alleKapitel, [])

  it('has one line per area with every part exactly once', () => {
    expect(map.lines.map((line) => line.area)).toEqual(BEREICHE)
    expect(map.lines.flatMap((line) => line.stations.map((s) => s.part.id)).sort()).toEqual(kurs.map((t) => t.id).sort())
  })

  it('places the lines so the parts they build on share a column', () => {
    const columns = columnsOf(map)
    // Spring needs React-Praxis (data loading), the Claude Code setup needs it too (working locally).
    expect(columns.backend).toBe(columns.praxis)
    expect(columns.claude).toBe(columns.praxis)
    expect(map.transfers).toContainEqual({ column: columns.praxis, fromLine: 0, toLine: 1 })
    expect(map.transfers).toContainEqual({ column: columns.praxis, fromLine: 0, toLine: 2 })
    expect(map.columns).toBe(Math.max(...Object.values(columns)) + 1)
  })

  it('counts completed chapters per station', () => {
    const js = kurs[0]
    const done = buildRouteMap(kurs, BEREICHE, alleKapitel, [js.kapitel[0].id, js.kapitel[1].id])
    expect(done.lines[0].stations[0]).toMatchObject({ done: 2, total: js.kapitel.length })
  })
})

describe('route map rules', () => {
  const part = (id: string, bereich: Teil['bereich']) => ({ id, bereich, kapitel: [{ id: id + '-1' }] }) as unknown as Teil
  const chapter = (teil: Teil, grundlagen: string[] = []) => ({ id: teil.kapitel[0].id, teil, grundlagen }) as unknown as KapitelMitTeil

  it('starts a line without prerequisites in the first column', () => {
    const a = part('a', 'frontend'), b = part('b', 'frontend'), c = part('c', 'backend')
    const map = buildRouteMap([a, b, c], ['frontend', 'backend'], [chapter(a), chapter(b), chapter(c)], [])
    expect(columnsOf(map)).toEqual({ a: 0, b: 1, c: 0 })
    expect(map.transfers).toEqual([])
  })

  it('never shifts a line left of the first column', () => {
    const a = part('a', 'frontend'), c = part('c', 'backend'), d = part('d', 'backend')
    const map = buildRouteMap([a, c, d], ['frontend', 'backend'], [chapter(a), chapter(c), chapter(d, ['a-1'])], [])
    expect(columnsOf(map)).toEqual({ a: 0, c: 0, d: 1 })
    // d needs a, but they are not in one column: a change of lines without a drawn connector.
    expect(map.transfers).toEqual([])
    expect(map.lines[1].stations[1].changeFrom).toEqual([a])
  })
})
