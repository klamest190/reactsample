import { agentLoopLesson } from './agentLoop'
import { basicsLesson } from './basics'
import { commandsLesson } from './commands'
import { contextLesson } from './context'
import { gitLesson } from './git'
import { headlessLesson } from './headless'
import { hooksLesson } from './hooks'
import { mcpLesson } from './mcp'
import { pluginsLesson } from './plugins'
import { projectLesson } from './project'
import { promptingLesson } from './prompting'
import { securityLesson } from './security'
import { settingsLesson } from './settings'
import { setupLesson } from './setup'
import { skillsLesson } from './skills'
import { subagentsLesson } from './subagents'
import type { Lesson } from './types'

/**
 * The lesson content of parts 10 and 11 - in course order. The parts themselves (titles, goals,
 * keywords) are course/parts/claude.ts and claudeAdvanced.ts; this file is only loaded with a lesson.
 *
 * The lessons build on each other (GRUNDLAGEN in course.ts), but every one is open: the terminal
 * of each lesson starts in the state it needs, so nobody has to do lesson 1 to try lesson 5.
 */
export const lessons: Lesson[] = [
  // Part 10: fundamentals
  basicsLesson,
  setupLesson,
  commandsLesson,
  contextLesson,
  promptingLesson,
  agentLoopLesson,
  gitLesson,
  // Part 11: extending and automating
  settingsLesson,
  hooksLesson,
  skillsLesson,
  subagentsLesson,
  mcpLesson,
  pluginsLesson,
  headlessLesson,
  securityLesson,
  projectLesson,
]

export function lessonById(id: string) {
  const lesson = lessons.find((l) => l.id === id)
  if (!lesson) throw new Error(`No Claude Code lesson with the id "${id}"`)
  return lesson
}

/** A lesson counts as done once all of its tasks are in the solved exercises. */
export function lessonCompleted(lesson: Lesson, solved: readonly string[]) {
  return lesson.tasks.every((task) => solved.includes(task.id))
}
