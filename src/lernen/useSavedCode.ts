import { useLocalStorage } from '../hooks/useLocalStorage'
import { hash } from './quelltext'

/**
 * The code of an editor, saved per `id` in localStorage. The key contains a hash of the
 * start code - if an example changes, the old saved version expires automatically.
 * Shared by TryIt and the editors of part 8 (TryItSpring, TryItDocker, FullStack).
 */
export function useSavedCode(id: string, startCode: string) {
  return useLocalStorage(`tryit:${id}:${hash(startCode)}`, startCode)
}
