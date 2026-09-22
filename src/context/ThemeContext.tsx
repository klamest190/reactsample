/* oxlint-disable react/only-export-components -- Provider und Hook gehören inhaltlich
   zusammen. Der Hinweis betrifft nur den Hot-Reload-Komfort von Vite. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * KONZEPT: Context = "globaler" Zustand ohne Prop-Drilling.
 *
 * Ohne Context müsste man `theme` und `toggleTheme` durch jede Ebene
 * durchreichen (App -> Layout -> Header -> Button). Mit Context stellt ein
 * Provider den Wert bereit und jede beliebig tief verschachtelte Komponente
 * holt ihn sich per useContext.
 */

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
}

// createContext braucht einen Default-Wert. Wir nehmen `null` und prüfen
// später im Hook, ob wirklich ein Provider darüber liegt.
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lazy Initializer: die Funktion läuft nur beim ersten Render, nicht bei jedem.
  // Sinnvoll, weil localStorage-Zugriff vergleichsweise teuer ist.
  const [theme, setTheme] = useState<Theme>(() => {
    const gespeichert = localStorage.getItem('theme')
    if (gespeichert === 'light' || gespeichert === 'dark') return gespeichert
    // Fallback: System-Einstellung des Betriebssystems respektieren.
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // SIDE EFFECT: React rendert nur Komponenten. Alles außerhalb (hier: die
  // Klasse am <html>-Element und localStorage) gehört in einen Effekt.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    // Sagt dem Browser, wie er Scrollbalken und native Bedienelemente einfärben soll.
    // Muss hier stehen und nicht als <meta> - unser Dark Mode hängt am Umschalter, nicht am System.
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('theme', theme)
  }, [theme]) // läuft neu, sobald sich `theme` ändert

  // useCallback hält die Funktions-Identität stabil, damit der Context-Wert
  // sich nicht bei jedem Render ändert.
  const toggleTheme = useCallback(() => {
    setTheme((alt) => (alt === 'dark' ? 'light' : 'dark'))
  }, [])

  // useMemo: neues Objekt nur, wenn sich theme oder toggleTheme ändern.
  // Sonst würden ALLE Consumer bei jedem Render neu rendern.
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  // React 19: <Context value> statt <Context.Provider value>
  return <ThemeContext value={value}>{children}</ThemeContext>
}

/**
 * Eigener Hook statt direktem useContext-Aufruf: kapselt die Null-Prüfung
 * und gibt einen sauber typisierten Wert zurück.
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme muss innerhalb von <ThemeProvider> benutzt werden')
  }
  return context
}
