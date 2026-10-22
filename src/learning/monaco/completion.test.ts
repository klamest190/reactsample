import { describe, expect, it } from 'vitest'

import { KIND_NAMES, toSnippet, withoutDot, wordPattern } from './completion'
import { suggestionsFor } from '../suggestions'
import { EDITOR_LANGUAGES, type EditorLanguage } from '../modes'
import { EXTENSIONS, MONACO_LANGUAGES } from './languages'

describe('toSnippet', () => {
  it('keeps our own $0 as the cursor marker', () => {
    expect(toSnippet('console.log($0)')).toBe('console.log($0)')
  })

  it('escapes every other dollar sign, so a template literal stays literal', () => {
    // Without escaping Monaco would read ${name} as a snippet placeholder and eat it.
    expect(toSnippet('`Hello ${name}`')).toBe('`Hello \\${name}`')
  })

  it('escapes backslashes', () => {
    expect(toSnippet('"\\n"')).toBe('"\\\\n"')
  })

  it('escapes dollars around the cursor marker too', () => {
    expect(toSnippet('`$x $0 $y`')).toBe('`\\$x $0 \\$y`')
  })
})

describe('withoutDot', () => {
  it('strips the leading dot of method entries - the dot is already in the code', () => {
    expect(withoutDot('.map')).toBe('map')
  })

  it('leaves everything else alone', () => {
    expect(withoutDot('console.log')).toBe('console.log')
  })
})

describe('wordPattern', () => {
  it('takes the @ along for Spring annotations', () => {
    expect('  @GetMapp'.match(wordPattern('spring'))?.[0]).toBe('@GetMapp')
  })

  it('stops before the @ everywhere else', () => {
    expect('  @GetMapp'.match(wordPattern('java'))?.[0]).toBe('GetMapp')
  })

  it('reads up to the cursor including the dot', () => {
    expect('const x = console.lo'.match(wordPattern('js'))?.[0]).toBe('console.lo')
  })
})

describe('tables cover every editor language', () => {
  const languages = Object.keys(EDITOR_LANGUAGES) as EditorLanguage[]

  it.each(languages)('%s has a Monaco language and a file extension', (language) => {
    expect(MONACO_LANGUAGES[language]).toBeTruthy()
    expect(EXTENSIONS[language]).toBeTruthy()
  })

  it('offers a Monaco kind for every suggestion kind in the course', () => {
    // A new kind in suggestions.ts must not silently fall back to "Variable".
    for (const language of languages) {
      for (const suggestion of suggestionsFor(language, 'de')) {
        expect(KIND_NAMES[suggestion.kind], `kind ${suggestion.kind}`).toBeTruthy()
      }
    }
  })

  it('turns the course entries into snippets Monaco can insert', () => {
    // Every entry survives the escaping and keeps at most one cursor marker.
    for (const suggestion of suggestionsFor('js', 'de')) {
      const snippet = toSnippet(withoutDot(suggestion.insert ?? suggestion.label))
      expect(snippet.split('$0').length - 1).toBeLessThanOrEqual(1)
    }
  })
})
