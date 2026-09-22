/**
 * DOCKER PART · The images this simulator knows
 *
 * A tiny, offline "Docker Hub". Sizes are rounded values of the real images
 * (uncompressed, as `docker images` shows them) - good enough to compare a
 * 540 MB build image with a 280 MB runtime image, not for exact numbers.
 */

export type ImageInfo = {
  /** Repository without tag: `eclipse-temurin`, `node`, `nginx` … */
  repository: string
  /** Size in MB for the given tag variant. */
  sizeMb: number
  /** What the image runs if no CMD is given. */
  defaultCommand?: string[]
  /** Ports the image documents with EXPOSE. */
  exposes?: number[]
  /** Users that exist in the image (besides root). */
  users: string[]
  /** Tools available for RUN. */
  tools: string[]
  /** Short description for `docker images` and the lessons. */
  kind: 'jdk' | 'jre' | 'maven' | 'node' | 'nginx' | 'postgres' | 'redis' | 'os' | 'hello' | 'distroless' | 'app'
}

/** A tag pattern with its size - and anything that differs from the repository defaults. */
type Variant = { match: RegExp; sizeMb: number; kind?: ImageInfo['kind']; defaultCommand?: string[] }

const CATALOG: { repository: string; variants: Variant[]; info: Omit<ImageInfo, 'repository' | 'sizeMb'> }[] = [
  {
    repository: 'eclipse-temurin',
    variants: [
      { match: /jre.*alpine/, sizeMb: 200, kind: 'jre', defaultCommand: [] },
      { match: /jdk.*alpine|alpine/, sizeMb: 360 },
      { match: /jre/, sizeMb: 280, kind: 'jre', defaultCommand: [] },
      { match: /./, sizeMb: 470 },
    ],
    info: { kind: 'jdk', users: [], tools: ['java', 'sh', 'apt-get'], defaultCommand: ['jshell'] },
  },
  {
    repository: 'maven',
    variants: [{ match: /alpine/, sizeMb: 380 }, { match: /./, sizeMb: 540 }],
    info: { kind: 'maven', users: [], tools: ['java', 'mvn', 'sh', 'apt-get'], defaultCommand: ['mvn'] },
  },
  {
    repository: 'gradle',
    variants: [{ match: /./, sizeMb: 720 }],
    info: { kind: 'maven', users: ['gradle'], tools: ['java', 'gradle', 'sh', 'apt-get'], defaultCommand: ['gradle'] },
  },
  {
    repository: 'gcr.io/distroless/java21-debian12',
    variants: [{ match: /./, sizeMb: 190 }],
    info: { kind: 'distroless', users: ['nonroot'], tools: ['java'] },
  },
  {
    repository: 'node',
    variants: [{ match: /alpine/, sizeMb: 160 }, { match: /slim/, sizeMb: 240 }, { match: /./, sizeMb: 1100 }],
    info: { kind: 'node', users: ['node'], tools: ['node', 'npm', 'npx', 'sh'], defaultCommand: ['node'] },
  },
  {
    repository: 'nginx',
    variants: [{ match: /alpine/, sizeMb: 50 }, { match: /./, sizeMb: 190 }],
    info: { kind: 'nginx', users: ['nginx'], tools: ['sh', 'nginx'], defaultCommand: ['nginx', '-g', 'daemon off;'], exposes: [80] },
  },
  {
    repository: 'postgres',
    variants: [{ match: /alpine/, sizeMb: 280 }, { match: /./, sizeMb: 440 }],
    info: { kind: 'postgres', users: ['postgres'], tools: ['sh', 'psql', 'pg_isready'], defaultCommand: ['postgres'], exposes: [5432] },
  },
  {
    repository: 'redis',
    variants: [{ match: /alpine/, sizeMb: 40 }, { match: /./, sizeMb: 120 }],
    info: { kind: 'redis', users: ['redis'], tools: ['sh', 'redis-cli'], defaultCommand: ['redis-server'], exposes: [6379] },
  },
  {
    repository: 'alpine',
    variants: [{ match: /./, sizeMb: 8 }],
    info: { kind: 'os', users: [], tools: ['sh', 'apk', 'echo', 'ls', 'cat'], defaultCommand: ['/bin/sh'] },
  },
  {
    repository: 'ubuntu',
    variants: [{ match: /./, sizeMb: 78 }],
    info: { kind: 'os', users: ['ubuntu'], tools: ['sh', 'bash', 'apt-get', 'echo', 'ls', 'cat'], defaultCommand: ['/bin/bash'] },
  },
  {
    repository: 'debian',
    variants: [{ match: /slim/, sizeMb: 75 }, { match: /./, sizeMb: 117 }],
    info: { kind: 'os', users: [], tools: ['sh', 'bash', 'apt-get', 'echo', 'ls', 'cat'], defaultCommand: ['bash'] },
  },
  {
    repository: 'hello-world',
    variants: [{ match: /./, sizeMb: 0.0133 }],
    info: { kind: 'hello', users: [], tools: [], defaultCommand: ['/hello'] },
  },
]

/** Splits `docker.io/library/node:22-alpine` into repository `node` and tag `22-alpine`. */
export function splitImage(reference: string): { repository: string; tag: string; explicitTag: boolean } {
  let name = reference.replace(/^docker\.io\//, '').replace(/^library\//, '')
  name = name.split('@')[0]
  const colon = name.lastIndexOf(':')
  if (colon > name.lastIndexOf('/')) return { repository: name.slice(0, colon), tag: name.slice(colon + 1), explicitTag: true }
  return { repository: name, tag: 'latest', explicitTag: false }
}

/** Looks an image up in the catalog - or in the images built locally (`docker build -t …`). */
export function findImage(reference: string, local: Record<string, ImageInfo> = {}): (ImageInfo & { tag: string }) | null {
  const { repository, tag } = splitImage(reference)
  const own = local[`${repository}:${tag}`]
  if (own) return { ...own, tag }
  const entry = CATALOG.find((c) => c.repository === repository)
  if (!entry) return null
  const variant = entry.variants.find((v) => v.match.test(tag)) ?? entry.variants[entry.variants.length - 1]
  const info = { ...entry.info, ...(variant.kind ? { kind: variant.kind } : {}) }
  if (variant.defaultCommand) info.defaultCommand = variant.defaultCommand.length ? variant.defaultCommand : undefined
  return { repository, tag, sizeMb: variant.sizeMb, ...info }
}

export const knownRepositories = () => CATALOG.map((c) => c.repository)

/** `1100` → `1.1GB`, `280` → `280MB`, `0.0133` → `13.3kB` - like `docker images`. */
export function formatSize(mb: number): string {
  if (mb >= 1000) return `${(mb / 1000).toFixed(mb >= 10000 ? 0 : 2).replace(/\.?0+$/, '')}GB`
  if (mb >= 1) return `${Math.round(mb * 10) / 10}MB`
  return `${Math.round(mb * 1000 * 10) / 10}kB`
}
