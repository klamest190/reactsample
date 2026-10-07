import { describe, expect, it } from 'vitest'

import { parseYaml, YamlError } from './yaml'

describe('parseYaml', () => {
  it('reads nested maps and lists by indentation', () => {
    const { value } = parseYaml(['services:', '  api:', '    image: app:1.0', '    ports:', '      - "8080:8080"', '      - 9090'].join('\n'))
    expect(value).toEqual({ services: { api: { image: 'app:1.0', ports: ['8080:8080', 9090] } } })
  })

  it('reads flow lists and flow maps', () => {
    const { value } = parseYaml('command: [java, -jar, app.jar]\nenvironment: {MODE: dev}')
    expect(value).toEqual({ command: ['java', '-jar', 'app.jar'], environment: { MODE: 'dev' } })
  })

  it('reads scalars: booleans, numbers, null and quoted strings with : and #', () => {
    const { value } = parseYaml(`a: true\nb: 3\nc: null\nd: "x: y # not a comment"\ne: 'it''s' # comment`)
    expect(value).toEqual({ a: true, b: 3, c: null, d: 'x: y # not a comment', e: "it's" })
  })

  // Simpler than real YAML: the final line break of a block scalar is not kept.
  it('reads literal and folded block scalars', () => {
    const { value } = parseYaml('literal: |\n  line 1\n  line 2\nfolded: >\n  word 1\n  word 2\n')
    expect(value).toEqual({ literal: 'line 1\nline 2', folded: 'word 1 word 2' })
  })

  it('remembers the line of every key path', () => {
    const { lines } = parseYaml('# comment\nservices:\n  db:\n    image: postgres:18\n')
    expect(lines.get('services')).toBe(2)
    expect(lines.get('services.db.image')).toBe(4)
  })

  it('refuses tabs for indentation, with the line', () => {
    expect(() => parseYaml('services:\n\tapi: {}')).toThrow(YamlError)
    expect(() => parseYaml('services:\n\tapi: {}')).toThrow(/tabs are not allowed/)
  })

  it('refuses a key defined twice', () => {
    try {
      parseYaml('image: a\nimage: b')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(YamlError)
      expect(error).toMatchObject({ line: 2, message: 'mapping key "image" already defined' })
    }
  })
})
