import type { Zweisprachig } from '../i18n/SpracheContext'
import type { TestErgebnis } from './jsSandbox'
import { typenPruefen, type Typfehler } from './typpruefung'

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
export type TypTest = { name: string | Zweisprachig; code: string }

export async function tsUebersetzen(quelltext: string): Promise<{ code: string } | { fehler: string }> {
  const { transform } = await import('sucrase')
  try {
    // Nur die Typen entfernen: Die Zeilen bleiben, wo sie sind - Laufzeitfehler zeigen auf die richtige Zeile.
    const { code } = transform(quelltext, { transforms: ['typescript'], disableESTransforms: true })
    return { code }
  } catch (fehler) {
    return { fehler: fehler instanceof Error ? fehler.message : String(fehler) }
  }
}

/**
 * Prüft den Code samt Typ-Tests in einem Durchgang und ordnet die Fehler zu.
 * `export {}` am Ende macht die Datei zum Modul: Sonst wären alle Namen global und
 * `const name = …` würde mit `window.name` aus den DOM-Typen kollidieren.
 */
export async function tsTypenPruefen(code: string, typTests: TypTest[] = []): Promise<{ imCode: Typfehler[]; proTest: Typfehler[][] }> {
  const codeZeilen = code.split('\n').length
  const bereiche: { von: number; bis: number }[] = []
  let gesamt = code
  let zeile = codeZeilen
  for (const test of typTests) {
    const von = zeile + 1
    zeile += test.code.split('\n').length
    bereiche.push({ von, bis: zeile })
    gesamt += '\n' + test.code
  }
  const fehler = await typenPruefen(gesamt + '\nexport {}\n', { ts: true })
  return {
    imCode: fehler.filter((f) => f.zeile <= codeZeilen),
    proTest: bereiche.map((b) => fehler.filter((f) => f.zeile >= b.von && f.zeile <= b.bis)),
  }
}

/** Die Typprüfung als Testergebnisse: „keine Typfehler“ plus ein Eintrag pro Typ-Test. */
export function typErgebnisse(
  pruefung: { imCode: Typfehler[]; proTest: Typfehler[][] },
  typTests: TypTest[],
  sprache: 'de' | 'en',
  texte: { keineTypfehler: string; typfehlerZeile: (zeile: number) => string },
): TestErgebnis[] {
  const erster = pruefung.imCode[0]
  return [
    {
      name: texte.keineTypfehler,
      ok: !erster,
      meldung: erster ? `${texte.typfehlerZeile(erster.zeile)}: ${erster.text}` : '',
    },
    ...typTests.map((test, i) => ({
      name: typeof test.name === 'string' ? test.name : test.name[sprache],
      ok: pruefung.proTest[i].length === 0,
      meldung: pruefung.proTest[i][0]?.text ?? '',
    })),
  ]
}
