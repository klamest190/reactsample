import type { Sprache, Zweisprachig } from './SpracheContext'

/**
 * A text that is either the same in both languages (a test named after the code it
 * checks, say) or given per language - in the chosen language.
 */
export function localized(text: string | Zweisprachig, language: Sprache): string {
  return typeof text === 'string' ? text : text[language]
}
