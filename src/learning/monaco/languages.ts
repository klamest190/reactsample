import type { Sprache } from '../../i18n/LanguageContext'
import type { EditorLanguage } from '../modes'

/**
 * Which Monaco language belongs to which editor language of the course?
 *
 * Several editor languages end up on the same Monaco language (js/ts/react -> JavaScript
 * resp. TypeScript, java/spring -> java). Their suggestion lists differ though: `spring`
 * also brings the annotations, `react` the hooks. That is why the registry below
 * remembers for every model which editor language it came from - the completion providers
 * hang off the Monaco language and ask here.
 */
export const MONACO_LANGUAGES = {
  js: 'javascript',
  ts: 'typescript',
  react: 'typescript',
  java: 'java',
  spring: 'java',
  docker: 'dockerfile',
  yaml: 'yaml',
  properties: 'ini',
  sql: 'sql',
} as const satisfies Record<EditorLanguage, string>

/** The Monaco languages we register our own suggestions for. */
export const REGISTERED_LANGUAGES = [...new Set(Object.values(MONACO_LANGUAGES))]

/**
 * File extension per editor language. Monaco's TypeScript service decides by file name
 * whether it may parse JSX - without `.tsx` a `<div/>` in the React playground is a syntax
 * error. Part 2 (plain TypeScript) needs `.ts` the other way round, otherwise it reads
 * `<T>(x: T) => x` as a JSX element instead of a generic (the same distinction
 * typeCheck.worker.ts makes).
 */
export const EXTENSIONS = {
  js: 'js',
  ts: 'ts',
  react: 'tsx',
  java: 'java',
  spring: 'java',
  docker: 'dockerfile',
  yaml: 'yaml',
  properties: 'ini',
  sql: 'sql',
} as const satisfies Record<EditorLanguage, string>

export type ModelInfo = {
  language: EditorLanguage
  /** Interface language - decides which language the explanation appears in. */
  ui: Sprache
  /** Text for suggestions that come from the learner's own code (t.imCode). */
  infoInCode: string
}

const registry = new Map<string, ModelInfo>()

/** Record where a model came from when it is created. */
export function rememberModel(uri: string, info: ModelInfo) {
  registry.set(uri, info)
}

export function forgetModel(uri: string) {
  registry.delete(uri)
}

export function modelInfo(uri: string): ModelInfo | undefined {
  return registry.get(uri)
}
