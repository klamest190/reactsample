import { useEffect, useEffectEvent, type ComponentProps } from 'react'
import type { EditorFrame } from './EditorFrame'
import type { CommonProps } from './TryIt'
import { useSavedCode } from './useSavedCode'

/**
 * What every editor does with the props all modes share: the code (saved per id, see
 * useSavedCode.ts) and the props for <EditorFrame>. The editor adds only what is its own - the badge,
 * how to run the code and what to show below it.
 *
 *   const { code, setCode, frame } = useEditor(props)
 *   return <EditorFrame {...frame} kind="SQL" run={(c) => start(c ?? code)}>…</EditorFrame>
 */
export function useEditor({ id, code: startCode, title, task, solution, hints, editorRef, heading, maxLines }: CommonProps) {
  const [code, setCode] = useSavedCode(id, startCode)
  return {
    code,
    setCode,
    // `satisfies`: a misspelled prop would otherwise vanish silently when spread into <EditorFrame>.
    frame: { title, task, code, setCode, startCode, solution, hints, editorRef, heading, maxLines } satisfies Partial<ComponentProps<typeof EditorFrame>>,
  }
}

/**
 * Runs once when the editor appears - with the props and state of that moment. The editors use
 * it for their first run: examples start right away, exercises wait for the button.
 */
export function useOnMount(run: () => void) {
  const onMount = useEffectEvent(run)
  useEffect(() => {
    onMount()
  }, [])
}
