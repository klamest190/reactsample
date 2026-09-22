/**
 * DOCKER PART · Reading a Dockerfile
 *
 *   FROM maven:3.9-eclipse-temurin-21 AS build     ← a new stage
 *   WORKDIR /app
 *   COPY pom.xml .
 *   RUN mvn -q dependency:go-offline \             ← a backslash continues the line
 *       && echo done
 *
 * Each instruction becomes one entry with its line number. Exec form
 * (`CMD ["java", "-jar", "app.jar"]`) and shell form (`CMD java -jar app.jar`)
 * are both kept - the difference matters (signals, see the lint rules).
 */

export const INSTRUCTIONS = [
  'FROM', 'RUN', 'CMD', 'LABEL', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME',
  'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL', 'MAINTAINER',
] as const
export type Keyword = (typeof INSTRUCTIONS)[number]

export type Instruction = {
  keyword: Keyword
  /** Everything after the keyword, continuation lines joined. */
  args: string
  /** `--from=build`, `--chown=spring:spring` … */
  flags: Record<string, string>
  /** Exec form `["java", "-jar", "app.jar"]`, if used. */
  json?: string[]
  line: number
}

export class DockerfileError extends Error {
  readonly line: number

  constructor(message: string, line: number) {
    super(message)
    this.line = line
  }
}

export function parseDockerfile(text: string): Instruction[] {
  const instructions: Instruction[] = []
  const lines = text.split('\n')
  for (let index = 0; index < lines.length; index++) {
    const start = index
    let line = lines[index].replace(/\r$/, '')
    if (!line.trim() || line.trim().startsWith('#')) continue
    // Continuation: a trailing backslash joins the next line. Comment lines in between are skipped.
    while (/\\\s*$/.test(line) && index + 1 < lines.length) {
      index++
      const next = lines[index].replace(/\r$/, '')
      if (next.trim().startsWith('#')) continue
      line = line.replace(/\\\s*$/, ' ') + next.trim()
    }
    const match = line.trim().match(/^(\S+)\s*(.*)$/)!
    const word = match[1].toUpperCase()
    if (!(INSTRUCTIONS as readonly string[]).includes(word)) {
      const suggestion = INSTRUCTIONS.find((k) => distance(k, word) <= 2)
      throw new DockerfileError(`unknown instruction: ${match[1]}${suggestion ? ` (did you mean ${suggestion.toLowerCase()}?)` : ''}`, start + 1)
    }
    let rest = match[2].trim()
    const flags: Record<string, string> = {}
    while (/^--[\w-]+(=\S*)?(\s|$)/.test(rest)) {
      const flag = rest.match(/^--([\w-]+)(?:=(\S*))?\s*/)!
      flags[flag[1]] = flag[2] ?? 'true'
      rest = rest.slice(flag[0].length)
    }
    const instruction: Instruction = { keyword: word as Keyword, args: rest, flags, line: start + 1 }
    if (rest.startsWith('[')) {
      try {
        const parsed = JSON.parse(rest) as unknown
        if (Array.isArray(parsed) && parsed.every((p) => typeof p === 'string')) instruction.json = parsed
      } catch {
        // Not valid JSON: Docker silently treats it as shell form - a classic mistake with single quotes.
      }
    }
    instructions.push(instruction)
  }
  return instructions
}

/** `$VAR`, `${VAR}` and `${VAR:-default}` - with the values of ARG and ENV. */
export function substitute(text: string, variables: Record<string, string>): string {
  return text.replace(/\$\{(\w+)(?::-([^}]*))?\}|\$(\w+)/g, (_, braced: string, fallback: string | undefined, plain: string) => {
    const name = braced ?? plain
    return variables[name] ?? fallback ?? ''
  })
}

/** Splits shell words, respecting quotes: `sh -c "echo hi"` → [sh, -c, echo hi]. */
export function shellWords(text: string): string[] {
  const words: string[] = []
  for (const match of text.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)) words.push(match[1] ?? match[2] ?? match[3])
  return words
}

function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
  }
  return d[a.length][b.length]
}
