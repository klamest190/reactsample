import { agentLoopLesson } from './agentLoop'
import { commandsLesson } from './commands'
import { contextLesson } from './context'
import { setupLesson } from './setup'
import { skillsLesson } from './skills'
import type { Lesson } from './types'

/**
 * The lesson content of part 10, "Claude Code Engineer" - in course order. The part itself
 * (titles, goals, keywords) is course/parts/claude.ts; this file is only loaded with a lesson.
 *
 * The lessons build on each other (GRUNDLAGEN in course.ts), but every one is open: the terminal
 * of each lesson starts in the state it needs, so nobody has to do lesson 1 to try lesson 5.
 */
export const lessons: Lesson[] = [setupLesson, commandsLesson, contextLesson, agentLoopLesson, skillsLesson]

export function lessonById(id: string) {
  const lesson = lessons.find((l) => l.id === id)
  if (!lesson) throw new Error(`No Claude Code lesson with the id "${id}"`)
  return lesson
}

/** A lesson counts as done once all of its tasks are in the solved exercises. */
export function lessonCompleted(lesson: Lesson, solved: readonly string[]) {
  return lesson.tasks.every((task) => solved.includes(task.id))
}
