/**
 * DOCKER PART · The projects that get built
 *
 * `docker build .` sends the current folder - the "build context" - to Docker.
 * These are the two projects of the course as file lists (path → size in kB):
 * the Spring Boot backend and the React frontend. Both contain what a real
 * project folder contains, including the heavy parts (`node_modules`, `.git`,
 * `target`) that a `.dockerignore` should keep out.
 */

export type ProjectFile = { path: string; kb: number; group?: 'code' | 'dependencies' }
export type Project = { id: ProjectId; name: string; files: ProjectFile[]; defaultIgnore: string }
export type ProjectId = 'spring' | 'react'

const SPRING: ProjectFile[] = [
  { path: 'pom.xml', kb: 3, group: 'dependencies' },
  { path: 'mvnw', kb: 11 },
  { path: 'mvnw.cmd', kb: 7 },
  { path: '.mvn/wrapper/maven-wrapper.properties', kb: 1 },
  { path: 'src/main/java/com/example/todo/TodoApplication.java', kb: 1, group: 'code' },
  { path: 'src/main/java/com/example/todo/Todo.java', kb: 2, group: 'code' },
  { path: 'src/main/java/com/example/todo/TodoController.java', kb: 3, group: 'code' },
  { path: 'src/main/java/com/example/todo/TodoRepository.java', kb: 1, group: 'code' },
  { path: 'src/main/resources/application.properties', kb: 1, group: 'code' },
  { path: 'src/test/java/com/example/todo/TodoControllerTest.java', kb: 3, group: 'code' },
  // Built earlier on the developer's machine - it should NOT end up in the image by accident.
  { path: 'target/todo-api-0.0.1-SNAPSHOT.jar', kb: 26_000 },
  { path: 'target/classes/com/example/todo/TodoApplication.class', kb: 2 },
  { path: '.git/objects/pack/pack-1.pack', kb: 6_400 },
  { path: '.idea/workspace.xml', kb: 300 },
  { path: 'HELP.md', kb: 2 },
  { path: 'Dockerfile', kb: 1 },
]

const REACT: ProjectFile[] = [
  { path: 'package.json', kb: 1, group: 'dependencies' },
  { path: 'package-lock.json', kb: 320, group: 'dependencies' },
  { path: 'vite.config.ts', kb: 1 },
  { path: 'tsconfig.json', kb: 1 },
  { path: 'index.html', kb: 1, group: 'code' },
  { path: 'src/main.tsx', kb: 1, group: 'code' },
  { path: 'src/App.tsx', kb: 4, group: 'code' },
  { path: 'src/index.css', kb: 2, group: 'code' },
  { path: 'src/components/TodoList.tsx', kb: 3, group: 'code' },
  { path: 'public/favicon.svg', kb: 2 },
  { path: 'nginx.conf', kb: 1 },
  // Installed locally - 180 MB that must never be sent to Docker.
  { path: 'node_modules/.package-lock.json', kb: 180_000 },
  { path: 'dist/index.html', kb: 1 },
  { path: 'dist/assets/index-4f2a.js', kb: 180 },
  { path: '.git/objects/pack/pack-1.pack', kb: 9_000 },
  { path: 'README.md', kb: 2 },
  { path: 'Dockerfile', kb: 1 },
]

export const PROJECTS: Record<ProjectId, Project> = {
  spring: { id: 'spring', name: 'todo-api', files: SPRING, defaultIgnore: 'target/\n.git/\n.idea/\n*.md' },
  react: { id: 'react', name: 'todo-web', files: REACT, defaultIgnore: 'node_modules/\ndist/\n.git/\n*.md' },
}

/**
 * `.dockerignore` rules: one pattern per line, `#` comments, `!` re-includes.
 * `node_modules`, `node_modules/` and `**\/node_modules` all exclude the folder.
 */
export function ignoredBy(rules: string): (path: string) => boolean {
  const patterns = rules
    .split('\n')
    .map((r) => r.trim())
    .filter((r) => r && !r.startsWith('#'))
    .map((r) => ({ negate: r.startsWith('!'), regex: toRegex(r.replace(/^!/, '')) }))
  return (path) => {
    let ignored = false
    for (const { negate, regex } of patterns) if (regex.test(path)) ignored = !negate
    return ignored
  }
}

function toRegex(pattern: string): RegExp {
  const clean = pattern.replace(/^\.\//, '').replace(/^\//, '').replace(/\/$/, '')
  const source = clean
    .split('**/')
    .map((part) => part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]'))
    .join('(?:.*/)?')
  // A folder pattern also matches everything inside it.
  return new RegExp(`^${source}(?:/.*)?$`)
}
