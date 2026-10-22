import type * as Monaco from 'monaco-editor'
import { EDITOR_LANGUAGES, type EditorLanguage } from '../modes'
import { classWord, tailwindEngine } from '../tailwind'
import { search, suggestionsFor, type Suggestion, type SuggestionKind } from '../suggestions'
import { REGISTERED_LANGUAGES, modelInfo, type ModelInfo } from './languages'

/**
 * The course's suggestions as Monaco providers.
 *
 * Deliberately the same source as the own editor: `suggestionsFor` returns the list per
 * editor language, `search` does the matching (dot logic, names from the learner's own
 * code, partial hits from three characters on). That keeps the ~420 curated entries with
 * their bilingual explanations valid, and Monaco's own IntelliSense for JS/TS comes on
 * top instead of replacing them.
 */

/** Monaco's completion kind per suggestion kind - resolved against the instance at runtime. */
export const KIND_NAMES = {
  function: 'Function',
  hook: 'Function',
  snippet: 'Snippet',
  keyword: 'Keyword',
  method: 'Method',
  jsx: 'Snippet',
  variable: 'Variable',
  tailwind: 'Color',
} as const satisfies Record<SuggestionKind, keyof typeof Monaco.languages.CompletionItemKind>

/** Monaco expands `$` and `\` inside a snippet - only our own `$0` may survive. */
export function toSnippet(text: string): string {
  return text
    .split('$0')
    .map((part) => part.replace(/\\/g, '\\\\').replace(/\$/g, '\\$'))
    .join('$0')
}

/** `.map` is offered as `map` - the dot is already in the code. */
export function withoutDot(text: string): string {
  return text.startsWith('.') ? text.slice(1) : text
}

/** `@` belongs to the word in Spring (@GetMapping), nowhere else. */
export function wordPattern(language: EditorLanguage): RegExp {
  return language === 'spring' ? /@?[\w$.]*$/ : /[\w$.]*$/
}

function item(
  monaco: typeof Monaco,
  suggestion: Suggestion,
  range: Monaco.IRange,
  rank: number,
): Monaco.languages.CompletionItem {
  const insert = withoutDot(suggestion.insert ?? suggestion.label)
  return {
    label: withoutDot(suggestion.label),
    kind: monaco.languages.CompletionItemKind[KIND_NAMES[suggestion.kind]],
    detail: suggestion.kind,
    // Keep the order `search` produced: hits at the start of the word before names from
    // the code before partial hits. Without sortText Monaco sorts purely alphabetically.
    sortText: String(rank).padStart(4, '0'),
    documentation: suggestion.css ? { value: `${suggestion.info}\n\n\`\`\`css\n${suggestion.css}\n\`\`\`` } : suggestion.info,
    insertText: toSnippet(insert),
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  }
}

type Hits = { hits: Suggestion[]; replaceChars: number }

async function matchingSuggestions(info: ModelInfo, code: string, before: string): Promise<Hits | null> {
  // Inside a class list (className="…", cn(…)) the suggestions come from the Tailwind
  // engine - with a colour swatch and the generated CSS, exactly like in VS Code.
  if (info.language === 'react') {
    const classes = classWord(before)
    if (classes !== null) {
      const engine = await tailwindEngine()
      return engine.suggestions(classes)
    }
  }

  const word = before.match(wordPattern(info.language))?.[0] ?? ''
  return search(suggestionsFor(info.language, info.ui), code, word, info.infoInCode)
}

/**
 * One provider per Monaco language. Which suggestion list applies depends on the model -
 * `java` serves both the Java and the Spring playground.
 */
export function registerCompletion(monaco: typeof Monaco) {
  for (const language of REGISTERED_LANGUAGES) {
    monaco.languages.registerCompletionItemProvider(language, {
      // Dot and `@` open the list by themselves; everything else is Monaco's word filter.
      // `quickSuggestions` is set in the editor options.
      triggerCharacters: ['.', '@', '-', ':'],
      async provideCompletionItems(model, position) {
        const info = modelInfo(model.uri.toString())
        if (!info) return { suggestions: [] }

        const before = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        // No suggestions inside comments (same as the own editor).
        if (before.includes(EDITOR_LANGUAGES[info.language].comment)) return { suggestions: [] }

        const found = await matchingSuggestions(info, model.getValue(), before)
        if (!found) return { suggestions: [] }

        const range: Monaco.IRange = {
          startLineNumber: position.lineNumber,
          startColumn: position.column - found.replaceChars,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }
        return { suggestions: found.hits.map((hit, i) => item(monaco, hit, range, i)) }
      },
    })
  }
}
