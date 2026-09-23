import { schritteChallenge } from './challenge'
import { schritteFortgeschritten } from './fortgeschritten'
import { schritteGrundlagen } from './grundlagen'
import { schritteHooks } from './hooks'
import type { SchrittInhalt } from './typen'

export type { SchrittInhalt } from './typen'

/**
 * Contents of the project steps by id (titles and prerequisites: ../meta.ts).
 *   typen.ts            types, the app's conventions, t()
 *   code.ts             the code blocks the solutions are built from
 *   tests.ts            tests several steps share
 *   grundlagen.ts       steps 1-5      hooks.ts   steps 6-11
 *   fortgeschritten.ts  steps 12-14    challenge.ts  step 15
 */
export const schrittInhalte: Record<string, SchrittInhalt> = {
  ...schritteFortgeschritten,
  ...schritteGrundlagen,
  ...schritteHooks,
  ...schritteChallenge,
}
