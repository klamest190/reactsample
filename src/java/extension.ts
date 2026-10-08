/**
 * JAVA PART · Extensions: plugging in other libraries
 *
 * The runtime only knows the standard library (bibliothek.ts). An extension
 * teaches it additional classes - this is how Spring (src/spring/) hooks in,
 * without a single word about Spring in this folder.
 *
 * Every function may return `undefined`: "I don't know this one." The runtime
 * then carries on as usual. It is the same idea as the classpath in real
 * Java: which classes exist depends on which JARs are included.
 */

import type { Interpreter } from './interpreter'
import type { NativeValue, Value } from './values'

export type Extension = {
  /** Classes that can be used without declaring them: `ResponseEntity`, `HttpStatus` … */
  classes: ReadonlySet<string>
  /** Inheritance of the extension's own classes, so that `catch (RuntimeException e)` catches them. */
  superClasses?: Readonly<Record<string, string>>
  /** Package name for crash messages (defaults to `java.lang`). */
  packageOf?: (type: string) => string | undefined
  /** `HttpStatus.CREATED` */
  staticField?: (className: string, name: string, interpreter: Interpreter) => Value | undefined
  /** `ResponseEntity.ok(…)` */
  staticCall?: (className: string, name: string, args: Value[], interpreter: Interpreter, line: number) => Value | undefined
  /** `new ResponseStatusException(…)` */
  create?: (className: string, args: Value[], interpreter: Interpreter, line: number) => Value | undefined
  /** Methods on the extension's objects: `response.getBody()`, `repository.findAll()` */
  method?: (target: NativeValue, name: string, args: Value[], interpreter: Interpreter, line: number) => Value | undefined
  /** `toString()` - also what println prints */
  text?: (value: NativeValue, interpreter: Interpreter) => string | undefined
}
