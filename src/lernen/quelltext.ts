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

/** Kurzer Hash, damit gespeicherter Code verfällt, wenn sich der Startcode ändert. */
export function hash(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}
