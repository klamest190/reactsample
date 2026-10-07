import { useEffect, useEffectEvent } from 'react'
import type { Gemeinsam } from './TryIt'
import { useSavedCode } from './useSavedCode'

/**
 * What every editor does with the props all modes share: the code (saved per id, see
 * useSavedCode.ts) and the props for <Rahmen>. The editor adds only what is its own - the badge,
 * how to run the code and what to show below it.
 *
 *   const { code, setCode, rahmen } = useEditor(props)
 *   return <Rahmen {...rahmen} art="SQL" ausfuehren={(c) => start(c ?? code)}>…</Rahmen>
 */
export function useEditor({ id, code: startCode, titel, aufgabe, loesung, tipps, editorRef, kopf, maxZeilen }: Gemeinsam) {
  const [code, setCode] = useSavedCode(id, startCode)
  return {
    code,
    setCode,
    rahmen: { titel, aufgabe, code, setCode, startCode, loesung, tipps, editorRef, kopf, maxZeilen },
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
