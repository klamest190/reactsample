import type { Zweisprachig } from '../i18n/LanguageContext'
import type { TestResult } from './jsSandbox'
import { checkTypes, type TypeDiagnostic } from './typeCheck'
import { localized } from '../i18n/localized'

/**
 * TypeScript mit Konsole (Teil 2, <TryIt modus="ts">).
 *
 * Genau wie im echten Projekt passieren zwei getrennte Dinge:
 *  - sucrase entfernt die Typen, danach läuft reines JavaScript in der Sandbox (wie Vite).
 *  - der TypeScript-Compiler prüft die Typen im Worker (wie `tsc` oder VS Code).
 * Typfehler halten das Programm deshalb nicht auf - auch das ist wie in echt.
 */

/**
 * Typ-Test einer Übung: TypeScript-Code, der hinter den Code der Lernenden gehängt und
 * mitgeprüft wird. Er kompiliert nur, wenn deren Typen stimmen - z. B. mit
 * `// @ts-expect-error` vor einem Aufruf, der verboten sein soll.
 */
export type TypeTest = { name: string | Zweisprachig; code: string }

export async function transpileTs(sourceCode: string): Promise<{ code: string } | { error: string }> {
  const { transform } = await import('sucrase')
  try {
    // Nur die Typen entfernen: Die Zeilen bleiben, wo sie sind - Laufzeitfehler zeigen auf die richtige Zeile.
    const { code } = transform(sourceCode, { transforms: ['typescript'], disableESTransforms: true })
    return { code }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Prüft den Code samt Typ-Tests in einem Durchgang und ordnet die Fehler zu.
 * `export {}` am Ende macht die Datei zum Modul: Sonst wären alle Namen global und
 * `const name = …` würde mit `window.name` aus den DOM-Typen kollidieren.
 */
export async function checkTsTypes(code: string, typeTests: TypeTest[] = []): Promise<{ inCode: TypeDiagnostic[]; perTest: TypeDiagnostic[][] }> {
  const codeLines = code.split('\n').length
  const scopes: { from: number; to: number }[] = []
  let total = code
  let line = codeLines
  for (const test of typeTests) {
    const from = line + 1
    line += test.code.split('\n').length
    scopes.push({ from, to: line })
    total += '\n' + test.code
  }
  const error = await checkTypes(total + '\nexport {}\n', { ts: true })
  return {
    inCode: error.filter((f) => f.line <= codeLines),
    perTest: scopes.map((b) => error.filter((f) => f.line >= b.from && f.line <= b.to)),
  }
}

/** Die Typprüfung als Testergebnisse: „keine Typfehler“ plus ein Eintrag pro Typ-Test. */
export function typeResults(
  script: { inCode: TypeDiagnostic[]; perTest: TypeDiagnostic[][] },
  typeTests: TypeTest[],
  language: 'de' | 'en',
  texte: { keineTypfehler: string; typfehlerZeile: (line: number) => string },
): TestResult[] {
  const first = script.inCode[0]
  return [
    {
      name: texte.keineTypfehler,
      ok: !first,
      message: first ? `${texte.typfehlerZeile(first.line)}: ${first.text}` : '',
    },
    ...typeTests.map((test, i) => ({
      name: localized(test.name, language),
      ok: script.perTest[i].length === 0,
      message: script.perTest[i][0]?.text ?? '',
    })),
  ]
}
