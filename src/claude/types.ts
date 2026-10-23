/**
 * CLAUDE CODE PART · Types of the simulated Claude Code session
 *
 * The session is a plain object like the Docker simulator's state: every input returns output
 * lines and leaves events behind. Tasks of a lesson are checked against those events - they are
 * data (`TaskCheck`), not functions, so a lesson stays serializable.
 */

export type Language = 'de' | 'en'

export type LineKind =
  /** A shell command after `$`. */
  | 'input'
  /** What the user typed into Claude Code after `>`. */
  | 'prompt'
  | 'output'
  /** Claude's answer, printed after `⏺`. */
  | 'assistant'
  /** A tool call header, e.g. `⏺ Read(src/App.tsx)`. */
  | 'tool'
  /** Indented tool result after `⎿`. */
  | 'result'
  | 'added'
  | 'removed'
  | 'muted'
  | 'success'
  | 'error'
  /** Course hint - not part of the real CLI. */
  | 'hint'
  /** Bold heading, e.g. of a dialog. */
  | 'title'

export type TerminalLine = {
  text: string
  kind: LineKind
  /** Consecutive boxed lines are drawn inside one frame (welcome screen, permission dialog). */
  boxed?: boolean
}

/**
 * Where the terminal is:
 *   shell       plain shell, `claude` not started (or not installed yet)
 *   login       first start, waiting for the login method
 *   repl        Claude Code is running, waiting for a prompt
 *   permission  Claude wants to use a tool and waits for yes / always / no
 */
export type Phase = 'shell' | 'login' | 'repl' | 'permission'

/** Shift+Tab cycles through these. */
export type PermissionMode = 'default' | 'acceptEdits' | 'plan'

/** Built-in tools, plus MCP tools named `mcp__<server>__<tool>`. */
export type ToolName = 'Read' | 'Glob' | 'Grep' | 'Bash' | 'Edit' | 'Write' | 'Skill' | 'Agent' | `mcp__${string}`

export type HookEvent = 'PreToolUse' | 'PostToolUse' | 'UserPromptSubmit' | 'Notification' | 'Stop' | 'SessionStart'

/** A command hook from the settings. What it does is simulated from its command (see hooks.ts). */
export type Hook = { event: HookEvent; matcher?: string; command: string }

export type McpScope = 'local' | 'project' | 'user'

export type McpServer = { name: string; transport: 'http' | 'stdio'; target: string; scope: McpScope }

/** A custom subagent from `.claude/agents/<name>.md`. */
export type Subagent = { name: string; description: string; tools: string; scope: 'project' | 'personal' | 'plugin' }

export type PermissionAnswer = 'yes' | 'always' | 'no'

/** One step of the agentic loop. */
export type ToolStep = {
  tool: ToolName
  /** File path, glob pattern or shell command. */
  target: string
  /** Shown in the permission dialog. */
  description?: string
  /** What the tool prints once it ran. */
  output: TerminalLine[]
  /** Tokens the result adds to the context. */
  tokens: number
  /** Files the step writes - applied to the workspace when it runs. */
  writes?: Record<string, string>
  /** Skill the step registers (Claude wrote its SKILL.md). */
  skill?: Skill
  /** Subagent the step registers (Claude wrote its file in .claude/agents/). */
  agent?: Subagent
  /** Hook the step adds to the settings. */
  hook?: Hook
  /** Allow rule the step adds to the settings. */
  allowRule?: string
  /** Deny rule the step adds to the settings. */
  denyRule?: string
  /** Branch the step switches to. */
  branch?: string
  /** The step came from instructions hidden in a file (prompt injection) - rejecting it is right. */
  suspicious?: boolean
  /** Left behind once the step ran. */
  events?: SessionEvent[]
}

export type SkillScope = 'project' | 'personal' | 'plugin'

export type Skill = {
  name: string
  description: string
  scope: SkillScope
  /** Plugin name - plugin skills are called as `/plugin:skill`. */
  plugin?: string
  /** Instructions below the frontmatter. */
  body: string
  /** Words in a prompt that make Claude load the skill on its own. */
  triggers: string[]
}

export type SessionEvent =
  | { type: 'installed'; method: 'npm' | 'native' }
  | { type: 'versionChecked' }
  | { type: 'doctor' }
  | { type: 'loggedIn'; method: 'subscription' | 'console' }
  | { type: 'started'; resumed: boolean }
  /** `specific`: the prompt names a file and says enough to act on. */
  | { type: 'prompted'; specific: boolean }
  /** Claude asked back because the prompt was too vague. */
  | { type: 'clarified' }
  | { type: 'conceptExplained'; topic: 'tokens' | 'context' | 'hallucination' | 'agent' }
  | { type: 'headless'; outputFormat: 'text' | 'json'; allowedTools: boolean }
  | { type: 'exited' }
  /** A slash command that ran. `name` is the canonical name (an alias like `/bug` reports its target). */
  | { type: 'command'; name: string; withArgs: boolean }
  | { type: 'compacted'; withInstructions: boolean }
  | { type: 'fileMentioned'; path: string }
  | { type: 'memoryCreated' }
  | { type: 'gitInspected' }
  | { type: 'toolUsed'; tool: ToolName }
  | { type: 'permission'; tool: ToolName; answer: PermissionAnswer }
  | { type: 'modeChanged'; mode: PermissionMode }
  | { type: 'bashMode' }
  | { type: 'skillCreated'; name: string; scope: SkillScope }
  | { type: 'skillInvoked'; name: string; via: 'slash' | 'model' }
  | { type: 'modelChanged'; model: string }
  /** Plan mode produced a plan; `planExecuted` once it was carried out after leaving plan mode. */
  | { type: 'planned' }
  | { type: 'planExecuted' }
  | { type: 'branchCreated'; name: string }
  | { type: 'committed' }
  | { type: 'prCreated' }
  | { type: 'rewound' }
  | { type: 'featureBuilt' }
  | { type: 'bugFixed' }
  | { type: 'hookRan'; event: HookEvent; blocked: boolean }
  | { type: 'hookCreated'; event: HookEvent }
  | { type: 'denied'; rule: string }
  | { type: 'settingsChanged'; file: 'settings.json' | 'settings.local.json' }
  | { type: 'secretRead' }
  | { type: 'injectionBlocked' }
  | { type: 'subagentUsed'; agent: string }
  | { type: 'agentCreated'; name: string }
  | { type: 'mcpAdded'; name: string; scope: McpScope }
  | { type: 'mcpListed' }
  | { type: 'mcpToolUsed'; server: string }
  | { type: 'marketplaceAdded'; name: string }
  | { type: 'pluginInstalled'; name: string }

type EventType = SessionEvent['type']

/**
 * A task is solved as soon as one event matches: same `type`, and every other field given here
 * equal. `{ type: 'command', name: '/compact' }` accepts `/compact` with and without arguments.
 */
export type TaskCheck = { [K in EventType]: { type: K } & Partial<Omit<Extract<SessionEvent, { type: K }>, 'type'>> }[EventType]

export type ClaudeSession = {
  phase: Phase
  installed: boolean
  loggedIn: boolean
  mode: PermissionMode
  model: string
  /** Tokens currently in the context window. */
  contextTokens: number
  /** Messages in the conversation - /compact needs some to work with. */
  messages: number
  costUsd: number
  apiSeconds: number
  linesAdded: number
  linesRemoved: number
  /** Files Claude has read or that were mentioned with `@`. */
  filesInContext: string[]
  /** The mock project - path -> content. */
  files: Record<string, string>
  /** Permission rules added with "Yes, and don't ask again", e.g. `Bash(npm test:*)`. */
  allowRules: string[]
  /** Deny rules from the settings, e.g. `Read(./.env)`. */
  denyRules: string[]
  hooks: Hook[]
  skills: Skill[]
  agents: Subagent[]
  mcpServers: McpServer[]
  marketplaces: string[]
  plugins: string[]
  branch: string
  commits: string[]
  /** Files before every prompt that changed some - /rewind goes back to the last one. */
  checkpoints: { prompt: string; files: Record<string, string> }[]
  /** The prompt planned in plan mode - "go ahead" carries it out after leaving plan mode. */
  plannedPrompt?: string
  /** Steps of the running agentic loop; the first one waits for permission in phase `permission`. */
  queue: ToolStep[]
  /** Claude's final words once the queue is through. */
  closing: TerminalLine[]
  /** `claude "query"` before logging in - asked once the login is through. */
  pendingPrompt?: string
  /** Everything typed, for ↑/↓. */
  history: string[]
  events: SessionEvent[]
}

/** How a lesson starts the terminal. */
export type SessionSetup = {
  /** Lesson 1 starts on a machine without Claude Code. */
  installed: boolean
  loggedIn: boolean
  /** Start inside Claude Code instead of the shell. */
  inRepl: boolean
  /** Pretend an earlier conversation - gives /compact and /cost something to show. */
  priorMessages?: number
  /** Start with a CLAUDE.md in the project. */
  withMemory?: boolean
  /** Project skills already in `.claude/skills/`. */
  withProjectSkills?: boolean
  /** false: the team-tools plugin is not installed yet (plugin lesson). Default: installed. */
  withPlugins?: boolean
  /** Hooks in .claude/settings.json: a formatter after edits and a guard for .env. */
  withHooks?: boolean
  /** false: no deny rule for .env (security lesson). Default: `Read(./.env)` is denied. */
  protectEnv?: boolean
  /** A custom subagent in .claude/agents/. */
  withAgents?: boolean
  /** A file with instructions hidden for Claude (prompt injection lesson). */
  withInjection?: boolean
}
