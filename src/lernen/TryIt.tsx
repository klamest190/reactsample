import { lazy, Suspense, type ReactNode, type Ref } from 'react'
import { useTexte, type Zweisprachig } from '../i18n/SpracheContext'
import type { ProjectId } from '../docker/projects'
import type { SqlTest } from '../sql/check'
import type { EditorSteuerung } from './CodeEditor'
import type { DockerTest, ReactTest, SpringTestSpec, Test } from './jsSandbox'
import type { ProjektDatei } from './reactKompilieren'
import type { TypTest } from './tsLauf'
import { TryItJava } from './TryItJava'
import { TryItJs } from './TryItJs'
import { TryItReact } from './TryItReact'
import { TryItTest } from './TryItTest'

// Part 8 - loaded only when such an editor appears (they bring the Spring runtime and the Docker simulator).
const TryItSpring = lazy(() => import('./TryItSpring').then((m) => ({ default: m.TryItSpring })))
const TryItDocker = lazy(() => import('./TryItDocker').then((m) => ({ default: m.TryItDocker })))
// Part 9 - brings PostgreSQL (PGlite) along, see src/sql/.
const TryItSql = lazy(() => import('./TryItSql').then((m) => ({ default: m.TryItSql })))

/**
 * "Probier's selbst" - ein Editor mit Ausführen-Knopf.
 *
 *   <TryIt id="…" code={…} />                  JavaScript, Ausgabe = Konsole
 *   <TryIt id="…" code={…} tests={[…]} />      JavaScript-Übung mit automatischer Prüfung
 *   <TryIt id="…" code={…} vorschau />         JavaScript mit sichtbarem <div id="app">
 *   <TryIt id="…" code={…} modus="ts" />       TypeScript mit Konsole und Typprüfung (Teil 2), siehe tsLauf.ts
 *   <TryIt id="…" code={…} modus="react" />    JSX, gerendert wird die Komponente App
 *   <TryIt id="…" code={…} modus="react" typen />  TSX mit echter Typprüfung
 *   <TryIt id="…" code={…} modus="test" />     Eigene Tests (Vitest + Testing Library), siehe testLauf.ts
 *   <TryIt id="…" code={…} modus="java" />     Java, ausgeführt von src/java/ (Teil 7)
 *   <TryIt id="…" code={…} modus="spring" />   Spring Boot on top of the Java runtime, see src/spring/ (part 8)
 *   <TryIt id="…" code={…} modus="dockerfile" />  a simulated docker build, see src/docker/ (part 8)
 *   <TryIt id="…" code={…} modus="compose" />  a simulated docker compose up (part 8)
 *   <TryIt id="…" code={…} modus="sql" />      real PostgreSQL on the example database, see src/sql/ (part 9)
 *
 * Der Code wird pro `id` im localStorage gespeichert, damit Eingaben einen
 * Kapitelwechsel überleben.
 */

type Gemeinsam = {
  /** Eindeutig im ganzen Kurs - Schlüssel für den gespeicherten Code. */
  id: string
  titel?: string
  /** Aufgabenstellung über dem Editor. */
  aufgabe?: ReactNode
  code: string
  loesung?: string
  /** Gestufte Tipps, die nacheinander vor der Musterlösung aufgedeckt werden können. */
  tipps?: { de: string[]; en: string[] }
  /** Playground: Zugriff auf den Editor von außen (Bausteine einfügen), eigene Überschrift, größerer Editor. */
  editorRef?: Ref<EditorSteuerung>
  kopf?: string
  maxZeilen?: number
}

export type JsProps = Gemeinsam & {
  /** 'ts': Typen werden vor dem Ausführen entfernt und nebenher geprüft. */
  modus?: 'js' | 'ts'
  tests?: Test[]
  /** Nur bei 'ts': Typ-Tests einer Übung (siehe tsLauf.ts). */
  typTests?: TypTest[]
  /** Unsichtbarer Code, der vorher läuft (z. B. Hilfsfunktionen oder Testdaten). */
  vorbereitung?: string
  /** Zeigt das Dokument des iframes an, damit DOM-Code sichtbar wird. */
  vorschau?: boolean
}

export type ReactProps = Gemeinsam & {
  modus: 'react'
  /** Automatische Prüfung, siehe reactTests.ts */
  tests?: ReactTest[]
  /** TypeScript: zusätzlich echte Typprüfung (siehe typpruefung.ts). Bei Übungen zählt „keine Typfehler“ als Test. */
  typen?: boolean
}

export type TestProps = Gemeinsam & {
  modus: 'test'
  /** Dateien, die der Testcode importieren kann (z. B. die Komponente) - werden nur lesbar angezeigt. */
  dateien?: ProjektDatei[]
  /** Übung: fehlerhafte Fassungen der Dateien. Die Tests der Lernenden müssen jede davon erkennen. */
  varianten?: { name: Zweisprachig; dateien: ProjektDatei[] }[]
}

export type JavaProps = Gemeinsam & {
  modus: 'java'
  /** Wie bei JS: ein Ausdruck, der nach `main` ausgewertet wird - nur eben in Java. */
  tests?: Test[]
  /** Unsichtbare Hilfsklassen, die hinter den Code gehängt werden (für Tests). */
  vorbereitung?: string
}

export type SpringProps = Gemeinsam & {
  modus: 'spring'
  /** Requests in `.http` notation, optionally with `→ status body` - see src/spring/http.ts. */
  tests?: SpringTestSpec[]
  /** application.properties - shown as a second, editable file. */
  properties?: string
  /** Requests sent automatically after every start (`.http` notation). */
  requests?: string
}

type DockerBase = Gemeinsam & {
  tests?: DockerTest[]
  /** Which course project is the build context (Dockerfile only). */
  project?: ProjectId
  /** Content of .dockerignore - editable next to the Dockerfile. */
  ignore?: string
}
// Two types instead of `modus: 'dockerfile' | 'compose'` - so TypeScript can tell all modes apart.
export type DockerProps = (DockerBase & { modus: 'dockerfile' }) | (DockerBase & { modus: 'compose' })

export type SqlProps = Gemeinsam & {
  modus: 'sql'
  /** Compared with the result of the solution - see src/sql/check.ts. */
  tests?: SqlTest[]
}

/** Die Props aller Modi - `modus` entscheidet, welcher Editor erscheint. */
export type TryItProps = JsProps | ReactProps | TestProps | JavaProps | SpringProps | DockerProps | SqlProps

export function TryIt(props: TryItProps) {
  if (props.modus === 'react') return <TryItReact {...props} />
  if (props.modus === 'test') return <TryItTest {...props} />
  if (props.modus === 'java') return <TryItJava {...props} />
  if (props.modus === 'spring') return <Suspense fallback={<Laedt />}><TryItSpring {...props} /></Suspense>
  if (props.modus === 'dockerfile' || props.modus === 'compose') return <Suspense fallback={<Laedt />}><TryItDocker {...props} /></Suspense>
  if (props.modus === 'sql') return <Suspense fallback={<Laedt />}><TryItSql {...props} /></Suspense>
  return <TryItJs {...props} />
}

/** Placeholder while an editor of part 8 or 9 is loading. */
function Laedt() {
  const t = useTexte()
  return <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">{t.laeuft}</div>
}
