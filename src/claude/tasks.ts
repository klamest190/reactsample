import type { SessionEvent, TaskCheck } from './types'

/** Does this event solve the check? Same type, and every field of the check equal. */
export function matches(check: TaskCheck, event: SessionEvent): boolean {
  if (check.type !== event.type) return false
  const fields = event as Record<string, unknown>
  return Object.entries(check).every(([key, value]) => fields[key] === value)
}

export function isSolved(check: TaskCheck, events: readonly SessionEvent[]): boolean {
  return events.some((event) => matches(check, event))
}
