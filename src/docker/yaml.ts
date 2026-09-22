/**
 * DOCKER PART · A small YAML reader - enough for compose.yaml
 *
 * Supports what compose files use: nested maps and lists by indentation,
 * `key: value`, `- item`, quoted strings, flow lists `[a, b]`, simple flow
 * maps `{a: b}`, block scalars (`|`, `>`) and comments. Like real YAML it
 * refuses tabs for indentation - a classic error message worth seeing.
 *
 * Besides the value it remembers the line of every key (`services.api.image` → 7),
 * so error messages can point to the right place.
 */

export type Yaml = null | boolean | number | string | Yaml[] | { [key: string]: Yaml }

export class YamlError extends Error {
  readonly line: number

  constructor(message: string, line: number) {
    super(message)
    this.line = line
  }
}

type Line = { indent: number; text: string; number: number }

export function parseYaml(source: string): { value: Yaml; lines: Map<string, number> } {
  const lines: Line[] = []
  source.split('\n').forEach((raw, index) => {
    const withoutComment = stripComment(raw.replace(/\r$/, ''))
    if (!withoutComment.trim()) return
    const leading = withoutComment.match(/^[ \t]*/)![0]
    if (leading.includes('\t')) {
      throw new YamlError('found character that cannot start any token (tabs are not allowed for indentation - use spaces)', index + 1)
    }
    lines.push({ indent: leading.length, text: withoutComment.trim(), number: index + 1 })
  })
  const keyLines = new Map<string, number>()
  let position = 0

  function block(indent: number, path: string): Yaml {
    const first = lines[position]
    if (!first || first.indent < indent) return null
    return first.text.startsWith('- ') || first.text === '-' ? list(first.indent, path) : map(first.indent, path)
  }

  function map(indent: number, path: string): Yaml {
    const result: Record<string, Yaml> = {}
    while (position < lines.length && lines[position].indent === indent) {
      const line = lines[position]
      if (line.text.startsWith('- ')) throw new YamlError('did not find expected key (a list item where a key was expected)', line.number)
      const match = line.text.match(/^("[^"]*"|'[^']*'|[^:]+?)\s*:(?:\s+(.*)|$)/)
      if (!match) throw new YamlError(`could not find expected ':' in "${line.text}"`, line.number)
      const key = unquote(match[1])
      const keyPath = path ? `${path}.${key}` : key
      if (key in result) throw new YamlError(`mapping key "${key}" already defined`, line.number)
      keyLines.set(keyPath, line.number)
      position++
      result[key] = value(match[2], indent, keyPath, line)
    }
    if (position < lines.length && lines[position].indent > indent) {
      throw new YamlError('mapping values are not allowed in this context (check the indentation)', lines[position].number)
    }
    return result
  }

  function list(indent: number, path: string): Yaml {
    const result: Yaml[] = []
    while (position < lines.length && lines[position].indent === indent && (lines[position].text.startsWith('- ') || lines[position].text === '-')) {
      const line = lines[position]
      const itemPath = `${path}[${result.length}]`
      keyLines.set(itemPath, line.number)
      const rest = line.text === '-' ? '' : line.text.slice(2).trim()
      if (!rest) {
        position++
        result.push(block(indent + 1, itemPath))
        continue
      }
      if (/^("[^"]*"|'[^']*'|[^:[{"']+?)\s*:(\s|$)/.test(rest) && !/^["'].*["']$/.test(rest)) {
        // "- key: value" starts a map whose further keys are indented like "key"
        const inner = indent + 2
        lines[position] = { indent: inner, text: rest, number: line.number }
        result.push(map(inner, itemPath))
        continue
      }
      position++
      result.push(scalar(rest, line.number))
    }
    return result
  }

  function value(rest: string | undefined, indent: number, path: string, line: Line): Yaml {
    if (rest === undefined || rest === '') {
      const next = lines[position]
      if (!next || next.indent < indent) return null
      if (next.indent === indent) return next.text.startsWith('- ') ? list(indent, path) : null
      return block(next.indent, path)
    }
    if (rest === '|' || rest === '>' || rest === '|-' || rest === '>-') {
      const parts: string[] = []
      while (position < lines.length && lines[position].indent > indent) parts.push(lines[position++].text)
      return rest.startsWith('|') ? parts.join('\n') : parts.join(' ')
    }
    return scalar(rest, line.number)
  }

  const value0 = lines.length ? block(0, '') : null
  if (position < lines.length) throw new YamlError('did not find expected <document start> (check the indentation)', lines[position].number)
  return { value: value0, lines: keyLines }
}

function scalar(text: string, line: number): Yaml {
  if (text.startsWith('[')) {
    if (!text.endsWith(']')) throw new YamlError('did not find expected \',\' or \']\'', line)
    const inner = text.slice(1, -1).trim()
    return inner ? splitFlow(inner).map((part) => scalar(part, line)) : []
  }
  if (text.startsWith('{')) {
    if (!text.endsWith('}')) throw new YamlError('did not find expected \',\' or \'}\'', line)
    const result: Record<string, Yaml> = {}
    for (const part of splitFlow(text.slice(1, -1))) {
      const [key, ...rest] = part.split(':')
      result[unquote(key.trim())] = scalar(rest.join(':').trim(), line)
    }
    return result
  }
  if (/^".*"$/.test(text)) return text.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"')
  if (/^'.*'$/.test(text)) return text.slice(1, -1).replace(/''/g, "'")
  if (text === 'true' || text === 'false') return text === 'true'
  if (text === 'null' || text === '~') return null
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text)
  return text
}

function splitFlow(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let quote = ''
  let current = ''
  for (const c of text) {
    if (quote) {
      if (c === quote) quote = ''
    } else if (c === '"' || c === "'") quote = c
    else if (c === '[' || c === '{') depth++
    else if (c === ']' || c === '}') depth--
    else if (c === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }
    current += c
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function stripComment(line: string): string {
  let quote = ''
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quote) {
      if (c === quote) quote = ''
    } else if (c === '"' || c === "'") quote = c
    else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i)
  }
  return line
}

const unquote = (text: string) => text.replace(/^["']|["']$/g, '')
