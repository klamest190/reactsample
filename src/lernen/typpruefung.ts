/**
 * Typprüfung für den Editor. Der TypeScript-Compiler ist groß (mehrere MB) und
 * läuft deshalb in einem Web Worker, der erst beim ersten Aufruf startet - wer
 * das TypeScript-Kapitel nie öffnet, lädt ihn nie.
 */

export type Typfehler = {
  /** 1-basiert */
  zeile: number
  /** 0-basiert, in Zeichen */
  spalte: number
  laenge: number
  text: string
  /** Fehlernummer des Compilers, angezeigt als TS2322 o. Ä. */
  code: number
}

type Antwort = { id: number; fehler: Typfehler[]; absturz?: string }

let worker: Worker | null = null
let naechsteId = 0
const offen = new Map<number, (fehler: Typfehler[]) => void>()

/** Ein ganzes Projekt prüfen und die Fehler der Datei `aktiv` liefern (Werkstatt). */
export function typenPruefenProjekt(dateien: { pfad: string; code: string }[], aktiv: string): Promise<Typfehler[]> {
  return senden({ dateien, aktiv })
}

/** Editor-Code prüfen - als TSX (React) oder mit `ts` als reines TypeScript ohne JSX (Teil 2). */
export function typenPruefen(code: string, optionen: { ts?: boolean } = {}): Promise<Typfehler[]> {
  return senden({ code, ts: optionen.ts })
}

function senden(nachricht: { code?: string; ts?: boolean; dateien?: { pfad: string; code: string }[]; aktiv?: string }): Promise<Typfehler[]> {
  if (!worker) {
    worker = new Worker(new URL('./typpruefung.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<Antwort>) => {
      if (e.data.absturz) console.error('Typprüfung:', e.data.absturz)
      offen.get(e.data.id)?.(e.data.fehler)
      offen.delete(e.data.id)
    }
  }
  const id = ++naechsteId
  return new Promise((aufloesen) => {
    offen.set(id, aufloesen)
    worker!.postMessage({ id, ...nachricht })
  })
}
