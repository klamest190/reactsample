/**
 * Tag-Funktion für Codebeispiele in den Kapiteln:
 *
 *   const beispiel = js`
 *     const name = 'Ada'
 *     console.log(name)
 *   `
 *
 * - Der Text wird "roh" übernommen, `\n` im Beispiel bleibt also ein
 *   Backslash + n (genau wie man es im Editor tippen würde).
 * - Nur \` und \${ müssen escaped werden, weil sie das Template sonst beenden.
 * - Gemeinsame Einrückung und Leerzeilen am Anfang/Ende werden entfernt.
 */
export function js(teile: TemplateStringsArray): string {
  const roh = teile.raw.join('').replace(/\\([`$])/g, '$1')
  const zeilen = roh.replace(/^\s*\n/, '').replace(/\n\s*$/, '').split('\n')

  const einrueckung = Math.min(
    ...zeilen.filter((z) => z.trim()).map((z) => z.match(/^ */)![0].length),
  )
  return zeilen.map((z) => z.slice(einrueckung)).join('\n')
}

/**
 * Dieselbe Funktion für Java-Beispiele (Teil 7). Ein eigener Name, damit man
 * in `<Teil>/Name.code.ts` auf den ersten Blick sieht, welche Sprache dort steht:
 *
 *   const beispiel = java`
 *     public class Main { … }
 *   `
 */
export const java = js

/** Kurzer Hash, damit gespeicherter Code verfällt, wenn sich der Startcode ändert. */
export function hash(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/**
 * The same function for the files of part 8 - the name says what is inside:
 * a Dockerfile, a compose.yaml, requests in `.http` notation or application.properties.
 */
export const docker = js
export const yaml = js
export const http = js
export const properties = js
