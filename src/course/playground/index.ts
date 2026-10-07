import { backendPlayground } from './backend'
import { hooksPlayground } from './hooks'
import { javaPlayground } from './java'
import { jsPlayground } from './js'
import { praxisPlayground } from './practice'
import { projektPlayground } from './project'
import { reactPlayground } from './react'
import { sqlPlayground } from './sql'
import { tsPlayground } from './ts'
import type { PlaygroundDaten } from './types'

/** Ein Playground pro Kursteil - in der Reihenfolge der Teile. */
export const playgrounds: PlaygroundDaten[] = [
  jsPlayground,
  tsPlayground,
  reactPlayground,
  hooksPlayground,
  praxisPlayground,
  projektPlayground,
  javaPlayground,
  backendPlayground,
  sqlPlayground,
]
