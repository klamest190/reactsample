import { useRef, type ReactNode } from 'react'
import { Abschnitt, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { useFortschritt } from '../../context/ProgressContext'
import { useSprache } from '../../i18n/LanguageContext'
import { CodeBlock } from '../../learning/CodeBlock'
import { Quiz } from '../../learning/Quiz'
import { Text } from '../../learning/Text'
import { ClaudeTaskList, ClaudeTerminalMock, type ClaudeTerminalHandle } from '../demos/ClaudeTerminalMock'
import { lessonById } from './curriculum'
import type { LessonBlock } from './types'

/**
 * One lesson of part 10 as a split screen: theory, tasks, quiz and key points on the left, the
 * simulated terminal on the right - it stays in view while the text scrolls (from xl up).
 * Below xl everything is one column, and the terminal comes right after the tasks.
 * The chapter page around it brings the header, learning goals, "done" button and navigation.
 */

const TEXTS = {
  de: { tryIt: 'Probier es aus', tryItText: 'Das Terminal ist eine Simulation - nichts verlässt deinen Browser. Gelöste Aufgaben bleiben gespeichert, „Neu starten“ setzt nur das Terminal zurück.' },
  en: { tryIt: 'Try it yourself', tryItText: 'The terminal is a simulation - nothing leaves your browser. Solved tasks stay saved, "Start over" only resets the terminal.' },
}

const HIGHLIGHT = { bash: 'config', markdown: 'config', text: 'config', json: 'code' } as const

function Block({ block }: { block: Exclude<LessonBlock, { type: 'heading' }> }) {
  const { sprache } = useSprache()
  switch (block.type) {
    case 'text':
      return (
        <P>
          <Text text={block.text[sprache]} />
        </P>
      )
    case 'list':
      return (
        <Liste>
          {block.items[sprache].map((item) => (
            <li key={item}>
              <Text text={item} />
            </li>
          ))}
        </Liste>
      )
    case 'code':
      return <CodeBlock code={block.code} title={block.caption?.[sprache]} language={HIGHLIGHT[block.language]} />
    case 'note':
      return block.tone === 'remember' ? (
        <Hinweis variante="info">
          <Text text={block.text[sprache]} />
        </Hinweis>
      ) : (
        <Hinweis variante={block.tone === 'tip' ? 'tipp' : 'warnung'}>
          <Text text={block.text[sprache]} />
        </Hinweis>
      )
    case 'table':
      return (
        <Tabelle
          kopf={block.head[sprache]}
          zeilen={block.rows[sprache].map((row) => row.map((cell, i) => <Text key={i} text={cell} />))}
        />
      )
  }
}

/** Every heading starts a section - the chapter page expects <section> with an <h2>. */
function Sections({ blocks }: { blocks: LessonBlock[] }) {
  const { sprache } = useSprache()
  const sections: { title?: string; blocks: Exclude<LessonBlock, { type: 'heading' }>[] }[] = []
  for (const block of blocks) {
    if (block.type === 'heading') sections.push({ title: block.text[sprache], blocks: [] })
    else if (sections.length) sections.at(-1)!.blocks.push(block)
    else sections.push({ blocks: [block] })
  }
  return sections.map((section, i) => {
    const content: ReactNode = section.blocks.map((block, j) => <Block key={j} block={block} />)
    return section.title ? (
      <Abschnitt key={i} titel={section.title}>
        {content}
      </Abschnitt>
    ) : (
      <div key={i} className="space-y-4">
        {content}
      </div>
    )
  })
}

function ClaudeLesson({ id }: { id: string }) {
  const lesson = lessonById(id)
  const { sprache } = useSprache()
  const { kapitelSetzen } = useFortschritt()
  const terminal = useRef<ClaudeTerminalHandle>(null)
  const t = TEXTS[sprache]

  return (
    <div className="grid gap-10 xl:grid-cols-2 xl:gap-8">
      <div className="min-w-0 space-y-10 xl:col-start-1">
        <Sections blocks={lesson.blocks} />
      </div>

      <Abschnitt titel={t.tryIt}>
        <P>{t.tryItText}</P>
        <ClaudeTaskList tasks={lesson.tasks} onInsert={(command) => terminal.current?.insert(command)} />
      </Abschnitt>

      <div className="min-w-0 xl:sticky xl:top-20 xl:col-start-2 xl:row-span-4 xl:row-start-1 xl:self-start">
        <ClaudeTerminalMock
          ref={terminal}
          setup={lesson.setup}
          tasks={lesson.tasks}
          showTasks={false}
          onAllSolved={() => kapitelSetzen(lesson.id, true)}
        />
      </div>

      <div className="min-w-0 xl:col-start-1">
        <Quiz
          questions={lesson.quiz.map((q) => ({
            question: <Text text={q.question[sprache]} />,
            answers: q.answers[sprache].map((answer, i) => <Text key={i} text={answer} />),
            correct: q.correct,
            explanation: <Text text={q.explanation[sprache]} />,
          }))}
        />
      </div>

      <div className="min-w-0 xl:col-start-1">
        <Merke
          punkte={lesson.keyPoints[sprache].map((point, i) => (
            <Text key={i} text={point} />
          ))}
        />
      </div>
    </div>
  )
}

// One export per chapter - course/parts/claude.ts loads them with laden(…, name).
export const ClaudeSetup = () => <ClaudeLesson id="claude-setup" />
export const ClaudeCommands = () => <ClaudeLesson id="claude-commands" />
export const ClaudeContext = () => <ClaudeLesson id="claude-context" />
export const ClaudeAgent = () => <ClaudeLesson id="claude-agent" />
export const ClaudeSkills = () => <ClaudeLesson id="claude-skills" />
