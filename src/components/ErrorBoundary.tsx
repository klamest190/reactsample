import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTexte } from '../i18n/SpracheContext'

/**
 * KONZEPT: Error Boundary.
 *
 * Das ist der einzige Fall, für den es bis heute KEINE Hook-Variante gibt -
 * Error Boundaries müssen Klassen-Komponenten sein.
 *
 * Sie fängt Fehler, die WAEHREND DES RENDERNS in Kind-Komponenten auftreten,
 * und zeigt statt eines weißen Bildschirms eine Ersatz-Oberfläche.
 * NICHT gefangen werden: Fehler in Event-Handlern, in setTimeout und in
 * asynchronem Code - die fangt man dort mit try/catch.
 */

type Props = {
  children: ReactNode
  /** Was statt der abgestürzten Kinder gezeigt wird. */
  fallback?: (fehler: Error, zuruecksetzen: () => void) => ReactNode
}

type State = { fehler: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { fehler: null }

  // Wird beim Fehler aufgerufen und liefert den neuen State -> Fallback rendern.
  static getDerivedStateFromError(fehler: Error): State {
    return { fehler }
  }

  // Guter Ort für Logging / Sentry o. Ä.
  componentDidCatch(fehler: Error, info: ErrorInfo) {
    console.error('ErrorBoundary hat einen Fehler gefangen:', fehler, info.componentStack)
  }

  zuruecksetzen = () => this.setState({ fehler: null })

  render() {
    const { fehler } = this.state

    if (fehler) {
      return (
        this.props.fallback?.(fehler, this.zuruecksetzen) ?? (
          <StandardFallback fehler={fehler} zuruecksetzen={this.zuruecksetzen} />
        )
      )
    }

    return this.props.children
  }
}

/** Klassen können keine Hooks nutzen - deshalb steckt der übersetzte Text in einer Funktionskomponente. */
function StandardFallback({ fehler, zuruecksetzen }: { fehler: Error; zuruecksetzen: () => void }) {
  const t = useTexte()
  return (
    <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
      <p className="font-semibold">{t.fehlerAllgemein}</p>
      <p className="mt-1 font-mono text-xs">{fehler.message}</p>
      <button
        onClick={zuruecksetzen}
        className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
      >
        {t.erneutVersuchen}
      </button>
    </div>
  )
}
