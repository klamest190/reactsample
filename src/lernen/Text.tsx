import { Fragment } from 'react'
import { Verweis } from '../components/Verweis'
import { Code } from '../components/Ui'

/**
 * Rendert kurze Texte aus Daten-Dateien mit einer Mini-Syntax:
 *   `code`          -> <Code>
 *   **fett**        -> <strong>
 *   [[kapitel-id]]  -> Link auf das Kapitel
 * So bleiben Übungen, Projektschritte und Glossar reine Daten, sehen aber aus wie der Kapiteltext.
 */
export function Text({ text }: { text: string }) {
  const teile = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[\[[\w-]+\]\])/g)
  return (
    <>
      {teile.map((teil, i) => {
        if (teil.startsWith('`') && teil.endsWith('`') && teil.length > 1) return <Code key={i}>{teil.slice(1, -1)}</Code>
        if (teil.startsWith('**') && teil.endsWith('**')) return <strong key={i}>{teil.slice(2, -2)}</strong>
        if (teil.startsWith('[[') && teil.endsWith(']]')) return <Verweis key={i} id={teil.slice(2, -2)} />
        return <Fragment key={i}>{teil}</Fragment>
      })}
    </>
  )
}
