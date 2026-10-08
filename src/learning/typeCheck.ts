/**
 * Typprüfung für den Editor. Der TypeScript-Compiler ist groß (mehrere MB) und
 * läuft deshalb in einem Web Worker, der erst beim ersten Aufruf startet - wer
 * das TypeScript-Kapitel nie öffnet, lädt ihn nie.
 */

export type TypeDiagnostic = {
  /** 1-basiert */
  line: number
  /** 0-basiert, in Zeichen */
  column: number
  length: number
  text: string
  /** Fehlernummer des Compilers, angezeigt als TS2322 o. Ä. */
  code: number
}

type Answer = { id: number; error: TypeDiagnostic[]; absturz?: string }

let worker: Worker | null = null
let nextId = 0
const open = new Map<number, (error: TypeDiagnostic[]) => void>()

/** Ein ganzes Projekt prüfen und die Fehler der Datei `aktiv` liefern (Werkstatt). */
export function checkProjectTypes(files: { pfad: string; code: string }[], active: string): Promise<TypeDiagnostic[]> {
  return send({ files, active })
}

/** Editor-Code prüfen - als TSX (React) oder mit `ts` als reines TypeScript ohne JSX (Teil 2). */
export function checkTypes(code: string, options: { ts?: boolean } = {}): Promise<TypeDiagnostic[]> {
  return send({ code, ts: options.ts })
}

function send(message: { code?: string; ts?: boolean; files?: { pfad: string; code: string }[]; active?: string }): Promise<TypeDiagnostic[]> {
  if (!worker) {
    worker = new Worker(new URL('./typeCheck.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<Answer>) => {
      if (e.data.absturz) console.error('Typprüfung:', e.data.absturz)
      open.get(e.data.id)?.(e.data.error)
      open.delete(e.data.id)
    }
  }
  const id = ++nextId
  return new Promise((aufloesen) => {
    open.set(id, aufloesen)
    worker!.postMessage({ id, ...message })
  })
}
