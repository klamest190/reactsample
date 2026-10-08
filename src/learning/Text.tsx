import { Fragment } from 'react'
import { Verweis } from '../components/ChapterLink'
import { Code } from '../components/Ui'

/**
 * Rendert kurze Texte aus Daten-Dateien mit einer Mini-Syntax:
 *   `code`          -> <Code>
 *   **fett**        -> <strong>
 *   [[kapitel-id]]  -> Link auf das Kapitel
 * So bleiben Übungen, Projektschritte und Glossar reine Daten, sehen aber aus wie der Kapiteltext.
 */
export function Text({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[\[[\w-]+\]\])/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 1) return <Code key={i}>{part.slice(1, -1)}</Code>
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith('[[') && part.endsWith(']]')) return <Verweis key={i} id={part.slice(2, -2)} />
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
