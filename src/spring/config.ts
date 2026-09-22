/**
 * SPRING PART · application.properties
 *
 * Spring Boot reads its configuration from `application.properties`. This file
 * supports what the course explains:
 *
 *   server.port=8080                 key=value (or key: value), # comments
 *   app.greeting=Hello ${app.name}   placeholders pointing to other keys
 *   #---                             a new document inside the same file …
 *   spring.config.activate.on-profile=dev   … that only counts for this profile
 *
 * Profiles are chosen with `spring.profiles.active=dev`.
 */

export class PlaceholderError extends Error {
  readonly placeholder: string
  readonly value: string

  constructor(placeholder: string, value: string) {
    super(`Could not resolve placeholder '${placeholder}' in value "${value}"`)
    this.placeholder = placeholder
    this.value = value
  }
}

export class Config {
  private readonly values = new Map<string, string>()
  readonly activeProfiles: string[]

  constructor(source = '') {
    const documents = source.split(/^[ \t]*#---[ \t]*$/m).map(parseDocument)
    // The first document decides the active profiles; later ones may only add values.
    const base = documents[0] ?? new Map<string, string>()
    this.activeProfiles = (base.get('spring.profiles.active') ?? '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
    for (const [key, value] of base) this.values.set(key, value)
    for (const document of documents.slice(1)) {
      const profile = document.get('spring.config.activate.on-profile')
      if (profile && !profile.split(',').some((p) => this.activeProfiles.includes(p.trim()))) continue
      for (const [key, value] of document) this.values.set(key, value)
    }
  }

  /** Relaxed binding like Spring: `app.max-items`, `app.maxItems` and `app.max_items` are the same key. */
  get(key: string): string | undefined {
    if (this.values.has(key)) return this.resolve(this.values.get(key)!)
    const wanted = canonical(key)
    for (const [k, v] of this.values) if (canonical(k) === wanted) return this.resolve(v)
    return undefined
  }

  has(key: string) {
    return this.get(key) !== undefined
  }

  keys() {
    return [...this.values.keys()]
  }

  /** All keys below a prefix, e.g. `app` → { 'max-items': '5', name: 'Todo' } - for @ConfigurationProperties. */
  below(prefix: string): Map<string, string> {
    const result = new Map<string, string>()
    for (const key of this.values.keys()) {
      if (canonical(key).startsWith(canonical(prefix) + '.')) result.set(key.slice(prefix.length + 1), this.get(key)!)
    }
    return result
  }

  isProfileActive(expression: string): boolean {
    const profile = expression.trim()
    if (profile.startsWith('!')) return !this.isProfileActive(profile.slice(1))
    // Without an active profile Spring uses the profile "default".
    const active = this.activeProfiles.length ? this.activeProfiles : ['default']
    return active.includes(profile)
  }

  /**
   * `${app.name}` and `${app.name:Default}` - in property values and in `@Value`.
   * Throws a PlaceholderError for a key that is missing and has no default, just like Spring.
   */
  resolve(value: string, depth = 0): string {
    if (depth > 10) return value
    return value.replace(/\$\{([^}:]+)(?::([^}]*))?\}/g, (_, key: string, fallback: string | undefined) => {
      const raw = this.values.get(key) ?? [...this.values].find(([k]) => canonical(k) === canonical(key))?.[1]
      if (raw !== undefined) return this.resolve(raw, depth + 1)
      if (fallback !== undefined) return fallback
      throw new PlaceholderError(key, value)
    })
  }
}

function parseDocument(text: string): Map<string, string> {
  const values = new Map<string, string>()
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || line.startsWith('!')) continue
    const match = line.match(/^([^=:\s]+)\s*[=:]\s*(.*)$/)
    if (match) values.set(match[1], match[2].trim())
  }
  return values
}

const canonical = (key: string) => key.replace(/[-_]/g, '').toLowerCase()

/** `maxItems` → `max-items`: the preferred spelling in properties files. */
export const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())
