import { agentLoopLesson } from './agentLoop'
import { commandsLesson } from './commands'
import { contextLesson } from './context'
import { setupLesson } from './setup'
import { skillsLesson } from './skills'
import type { Lesson, Track } from './types'

/**
 * The "Claude Code Engineer" track: from installing to writing team skills. The lessons build
 * on each other (`basics`), but every one is open - the terminal of each lesson starts in the
 * state it needs, so nobody has to do lesson 1 to try lesson 5.
 */
export const claudeTrack: Track = {
  id: 'claude',
  title: { de: 'Claude Code Engineer', en: 'Claude Code Engineer' },
  shortTitle: { de: 'Claude Code', en: 'Claude Code' },
  description: {
    de: 'Mit einem KI-Agenten im Terminal arbeiten: installieren, steuern, Kontext verwalten, den Agentic Loop kontrollieren und eigene Skills für das Team schreiben - geübt in einem simulierten Claude-Code-Terminal.',
    en: 'Work with an AI agent in the terminal: install, steer, manage context, control the agentic loop and write your own skills for the team - practised in a simulated Claude Code terminal.',
  },
  lessons: [setupLesson, commandsLesson, contextLesson, agentLoopLesson, skillsLesson],
}

/** A lesson counts as done once all of its tasks are in the solved exercises. */
export function lessonCompleted(lesson: Lesson, solved: readonly string[]) {
  return lesson.tasks.every((task) => solved.includes(task.id))
}
