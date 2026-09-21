import { hooksPlayground } from './hooks'
import { javaPlayground } from './java'
import { jsPlayground } from './js'
import { praxisPlayground } from './praxis'
import { projektPlayground } from './projekt'
import { reactPlayground } from './react'
import { tsPlayground } from './ts'
import type { PlaygroundDaten } from './typen'

/** Ein Playground pro Kursteil - in der Reihenfolge der Teile. */
export const playgrounds: PlaygroundDaten[] = [
  jsPlayground,
  tsPlayground,
  reactPlayground,
  hooksPlayground,
  praxisPlayground,
  projektPlayground,
  javaPlayground,
]
