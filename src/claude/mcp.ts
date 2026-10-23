import type { Plan } from './agent'
import type { ClaudeSession, Language, McpScope, McpServer, TerminalLine } from './types'

/**
 * MCP in the simulation: `claude mcp add|list|get|remove` in the shell, `/mcp` inside Claude Code
 * and one tool per server (`mcp__<server>__list_issues`) that Claude uses when asked about issues.
 * Nothing connects anywhere - every server "connects" if its command looks right.
 */

const out = (text: string): TerminalLine => ({ text, kind: 'output' })
const error = (text: string): TerminalLine => ({ text, kind: 'error' })
const result = (text: string): TerminalLine => ({ text, kind: 'result' })
const pick = (language: Language, de: string, en: string) => (language === 'de' ? de : en)

const USAGE = 'Usage: claude mcp add [--transport http|sse|stdio] [--scope local|project|user] [-e KEY=value] <name> <url> | <name> -- <command> [args...]'

/** Parses `claude mcp add …`. Returns an error message or the server. */
export function parseMcpAdd(args: string[]): McpServer | string {
  let transport: McpServer['transport'] | undefined
  let scope: McpScope = 'local'
  const positional: string[] = []
  let command: string[] | undefined
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--') {
      command = args.slice(i + 1)
      break
    }
    if (arg === '--transport' || arg === '-t') {
      const value = args[++i]
      if (value !== 'http' && value !== 'sse' && value !== 'stdio') return `error: invalid transport '${value ?? ''}'`
      transport = value === 'sse' ? 'http' : value
    } else if (arg === '--scope' || arg === '-s') {
      const value = args[++i]
      if (value !== 'local' && value !== 'project' && value !== 'user') return `error: invalid scope '${value ?? ''}' (local, project or user)`
      scope = value
    } else if (arg === '-e' || arg === '--env' || arg === '--header' || arg === '-H') i++
    else positional.push(arg)
  }
  const [name, url] = positional
  if (!name) return USAGE
  if (command?.length) return { name, transport: 'stdio', target: command.join(' '), scope }
  if (!url) return `${USAGE}\n(a stdio server needs its command after --)`
  if (!/^https?:\/\//.test(url)) return `error: '${url}' is not a URL - for a local command put it after --`
  return { name, transport: transport ?? 'http', target: url, scope }
}

export function mcpJson(servers: McpServer[]) {
  const entries = servers
    .filter((s) => s.scope === 'project')
    .map((s) => [s.name, s.transport === 'http' ? { type: 'http', url: s.target } : { command: s.target.split(' ')[0], args: s.target.split(' ').slice(1) }])
  return JSON.stringify({ mcpServers: Object.fromEntries(entries) }, null, 2)
}

/** `claude mcp …` from the shell. */
export function mcpCli(session: ClaudeSession, args: string[], lines: TerminalLine[]) {
  const [sub, ...rest] = args
  if (sub === 'add') {
    const server = parseMcpAdd(rest)
    if (typeof server === 'string') {
      lines.push(...server.split('\n').map(error))
      return
    }
    session.mcpServers = [...session.mcpServers.filter((s) => s.name !== server.name), server]
    session.events.push({ type: 'mcpAdded', name: server.name, scope: server.scope })
    const where = { local: `~/.claude.json [project: ~/todo-app]`, project: '.mcp.json', user: '~/.claude.json' }[server.scope]
    if (server.scope === 'project') session.files['.mcp.json'] = mcpJson(session.mcpServers)
    lines.push(out(`Added ${server.transport.toUpperCase()} MCP server ${server.name} with ${server.transport === 'http' ? 'URL' : 'command'}: ${server.target} to ${server.scope} config`))
    lines.push(out(`File modified: ${where}`))
    return
  }
  if (sub === 'list') {
    session.events.push({ type: 'mcpListed' })
    if (!session.mcpServers.length) {
      lines.push(out('No MCP servers configured. Use `claude mcp add` to add a server.'))
      return
    }
    lines.push(out('Checking MCP server health...'), out(''))
    for (const s of session.mcpServers) lines.push(out(`${s.name}: ${s.target}${s.transport === 'http' ? ' (HTTP)' : ''} - ✔ Connected`))
    return
  }
  if (sub === 'get' || sub === 'remove') {
    const server = session.mcpServers.find((s) => s.name === rest[0])
    if (!server) {
      lines.push(error(`No MCP server found with name: ${rest[0] ?? ''}`))
      return
    }
    if (sub === 'remove') {
      session.mcpServers = session.mcpServers.filter((s) => s !== server)
      lines.push(out(`Removed MCP server ${server.name} from ${server.scope} config`))
    } else lines.push(out(`${server.name}:`), out(`  Scope: ${server.scope}`), out(`  Type: ${server.transport}`), out(`  ${server.transport === 'http' ? 'URL' : 'Command'}: ${server.target}`))
    return
  }
  lines.push(error(USAGE))
}

/** `/mcp` inside Claude Code. */
export function mcpStatus(session: ClaudeSession, lines: TerminalLine[]) {
  session.events.push({ type: 'mcpListed' })
  if (!session.mcpServers.length) {
    lines.push(out('No MCP servers configured. Exit and run `claude mcp add` - or add them to .mcp.json.'))
    return
  }
  lines.push({ text: 'Manage MCP servers', kind: 'title', boxed: true })
  for (const s of session.mcpServers) {
    lines.push({ text: `  ${s.name} · ✔ connected · ${s.scope}`, kind: 'output', boxed: true })
    lines.push({ text: `    tools: mcp__${s.name}__list_issues, mcp__${s.name}__get_issue`, kind: 'muted', boxed: true })
  }
}

/** "Which issues are open?" - uses the first MCP server, or explains that Claude has no access. */
export function issuesPlan(session: ClaudeSession, language: Language): Plan {
  const server = session.mcpServers[0]
  if (!server) {
    return {
      intro: [],
      steps: [],
      closing: [
        { text: pick(language, 'Auf euren Issue-Tracker habe ich keinen Zugriff - es ist kein MCP-Server dafür eingerichtet.', 'I have no access to your issue tracker - no MCP server is set up for it.'), kind: 'assistant' },
        { text: pick(language, 'Beende Claude Code (/exit) und füge einen Server hinzu: claude mcp add --transport http tracker https://mcp.example.com/tracker', 'Exit Claude Code (/exit) and add a server: claude mcp add --transport http tracker https://mcp.example.com/tracker'), kind: 'hint' },
      ],
    }
  }
  const tool = `mcp__${server.name}__list_issues` as const
  return {
    intro: [],
    steps: [
      {
        tool,
        target: 'state: "open"',
        description: `List issues (MCP server ${server.name})`,
        output: [result('#42 Toggling one todo toggles all of them (bug)'), result('#43 Filter todos by status (feature)'), result('#44 Keyboard support for the list (a11y)')],
        tokens: 900,
        events: [{ type: 'toolUsed', tool }, { type: 'mcpToolUsed', server: server.name }],
      },
    ],
    closing: [
      { text: pick(language, 'Drei offene Issues:', 'Three open issues:'), kind: 'assistant' },
      { text: pick(language, '- #42 ist der Toggle-Fehler in `useTodos.ts` - den kann ich direkt beheben.', '- #42 is the toggle bug in `useTodos.ts` - I can fix it right away.'), kind: 'assistant' },
      { text: pick(language, '- #43 ein Filter nach Status, #44 Tastaturbedienung der Liste.', '- #43 a filter by status, #44 keyboard support for the list.'), kind: 'assistant' },
    ],
  }
}
