import type { Bereich, KapitelMitTeil, Teil } from './course'

/**
 * The course as a route map: one line per area, one station per part.
 *
 * Where a line starts is not drawn by hand, it follows from the prerequisites (GRUNDLAGEN in
 * course.ts): no station may stand left of a part of an earlier line it builds on. Where a
 * station ends up in the same column as such a part, the map draws a transfer - in this
 * course "React-Praxis", which both the Spring backend and the Claude Code setup build on.
 */

export type Station = {
  part: Teil
  column: number
  done: number
  total: number
  /** Parts of other lines this part builds on - where you change trains. */
  changeFrom: Teil[]
}

export type Line = { area: Bereich; stations: Station[] }

/** A vertical connector between two lines in one column (indexes into `lines`). */
export type Transfer = { column: number; fromLine: number; toLine: number }

export type RouteMap = { columns: number; lines: Line[]; transfers: Transfer[] }

export function buildRouteMap(parts: Teil[], areas: Bereich[], chapters: KapitelMitTeil[], completed: string[]): RouteMap {
  const partOfChapter = new Map(chapters.map((k) => [k.id, k.teil]))
  const columnOfPart = new Map<string, number>()
  const lineOfPart = new Map<string, number>()
  const lines: Line[] = []
  const transfers: Transfer[] = []

  areas.forEach((area, lineIndex) => {
    const lineParts = parts.filter((part) => part.bereich === area)

    // Parts of earlier lines each part of this line builds on.
    const changes = lineParts.map((part) => {
      const needed = new Set<Teil>()
      for (const chapter of chapters) {
        if (chapter.teil !== part) continue
        for (const id of chapter.grundlagen) {
          const other = partOfChapter.get(id)
          if (other && other.bereich !== area && columnOfPart.has(other.id)) needed.add(other)
        }
      }
      return [...needed].sort((a, b) => columnOfPart.get(a.id)! - columnOfPart.get(b.id)!)
    })

    // No station left of a part it builds on: the line starts as far right as its most
    // demanding station requires.
    const start = Math.max(0, ...changes.map((needed, i) => (needed.length ? columnOfPart.get(needed.at(-1)!.id)! - i : 0)))

    const stations = lineParts.map((part, i) => {
      const column = start + i
      columnOfPart.set(part.id, column)
      lineOfPart.set(part.id, lineIndex)
      const done = part.kapitel.filter((k) => completed.includes(k.id)).length
      for (const other of changes[i]) {
        if (columnOfPart.get(other.id) === column) transfers.push({ column, fromLine: lineOfPart.get(other.id)!, toLine: lineIndex })
      }
      return { part, column, done, total: part.kapitel.length, changeFrom: changes[i] }
    })
    lines.push({ area, stations })
  })

  const columns = Math.max(...lines.flatMap((line) => line.stations.map((s) => s.column + 1)))
  return { columns, lines, transfers }
}
