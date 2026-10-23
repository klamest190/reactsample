import type { ClaudeSession, TerminalLine } from './types'
import { PLUGIN_CATALOG, skillCommand } from './workspace'

/**
 * `/plugin` in the simulation: add a marketplace (a catalog in a git repo), install a plugin from
 * it, list what is installed. A plugin bundles skills, agents, hooks and MCP servers; its parts
 * are namespaced with the plugin name (`/team-tools:release-notes`).
 */

const out = (text: string): TerminalLine => ({ text, kind: 'output' })
const error = (text: string): TerminalLine => ({ text, kind: 'error' })
const result = (text: string): TerminalLine => ({ text, kind: 'result' })

/** The marketplace a repo like `acme/company-plugins` provides - named after its marketplace.json. */
const MARKETPLACE_REPOS: Record<string, string> = { 'acme/company-plugins': 'company-plugins' }

export function installPlugin(session: ClaudeSession, name: string) {
  const plugin = PLUGIN_CATALOG[name]
  if (!session.plugins.includes(name)) session.plugins.push(name)
  session.skills = [...session.skills.filter((s) => s.plugin !== name), ...plugin.skills]
  session.agents = [...session.agents.filter((a) => a.scope !== 'plugin'), ...plugin.agents]
}

export function pluginCommand(session: ClaudeSession, args: string, lines: TerminalLine[]) {
  const [sub, ...rest] = args.split(/\s+/).filter(Boolean)

  if (!sub) {
    lines.push({ text: 'Plugins', kind: 'title', boxed: true })
    lines.push({ text: '  Discover · Installed · Marketplaces · Errors', kind: 'muted', boxed: true })
    lines.push({ text: `  Marketplaces: ${session.marketplaces.join(', ') || '(none added)'}`, kind: 'output', boxed: true })
    lines.push({ text: `  Installed: ${session.plugins.join(', ') || '(none)'}`, kind: 'output', boxed: true })
    lines.push(out('Commands: /plugin marketplace add <owner/repo> · /plugin install <name>@<marketplace>'))
    return
  }

  if (sub === 'marketplace' || sub === 'market') {
    const [action, source] = rest
    if (action === 'list') {
      lines.push(out(session.marketplaces.length ? session.marketplaces.map((m) => `  ${m}`).join('\n') : 'No marketplaces configured'))
      return
    }
    if (action !== 'add' || !source) {
      lines.push(error('Usage: /plugin marketplace add <owner/repo | git URL | ./path>'))
      return
    }
    const name = MARKETPLACE_REPOS[source.replace(/#.*$/, '')]
    if (!name) {
      lines.push(error(`Failed to add marketplace: no .claude-plugin/marketplace.json found in ${source}`))
      lines.push({ text: 'In this simulation the team marketplace is acme/company-plugins.', kind: 'hint' })
      return
    }
    if (!session.marketplaces.includes(name)) session.marketplaces.push(name)
    session.events.push({ type: 'marketplaceAdded', name })
    lines.push(result(`Successfully added marketplace: ${name}`))
    lines.push(out(`  ${Object.entries(PLUGIN_CATALOG).filter(([, p]) => p.marketplace === name).length} plugin available: team-tools`))
    return
  }

  if (sub === 'install') {
    const [name, marketplace] = (rest[0] ?? '').split('@')
    const plugin = PLUGIN_CATALOG[name]
    if (!name || !marketplace) {
      lines.push(error('Usage: /plugin install <name>@<marketplace>'))
      return
    }
    if (!session.marketplaces.includes(marketplace)) {
      lines.push(error(`Marketplace "${marketplace}" not found. Add it first: /plugin marketplace add <owner/repo>`))
      return
    }
    if (!plugin || plugin.marketplace !== marketplace) {
      lines.push(error(`Plugin "${name}" not found in marketplace "${marketplace}"`))
      return
    }
    installPlugin(session, name)
    session.events.push({ type: 'pluginInstalled', name })
    lines.push(result(`✓ Installed ${name}@${marketplace} (scope: user)`))
    lines.push(out(`  Skills: ${plugin.skills.map((s) => '/' + skillCommand(s)).join(', ')}`))
    lines.push(out(`  Agents: ${plugin.agents.map((a) => `${name}:${a.name}`).join(', ')}`))
    return
  }

  lines.push(error(`Unknown plugin command: ${sub}`))
}
