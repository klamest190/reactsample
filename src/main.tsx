import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { SpracheProvider } from './i18n/SpracheContext'
import './index.css'

/**
 * Einstiegspunkt der Anwendung.
 *
 * createRoot(...).render(...) hängt den React-Baum an ein DOM-Element
 * (siehe <div id="root"> in index.html).
 *
 * StrictMode ist ein Entwicklungs-Helfer: React rendert Komponenten doppelt
 * und ruft jeden Effekt einmal zusätzlich mit Cleanup auf. Dadurch fallen
 * fehlende Cleanups und unreine Render-Funktionen sofort auf. Im Produktivbau
 * hat StrictMode keinerlei Wirkung.
 *
 * Theme- und Sprach-Provider stehen ganz außen, damit JEDE Komponente useTheme()
 * und useSprache() nutzen kann.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SpracheProvider>
        <App />
      </SpracheProvider>
    </ThemeProvider>
  </StrictMode>,
)
