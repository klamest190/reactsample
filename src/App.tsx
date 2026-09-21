import { lazy, Suspense, useEffect, useEffectEvent, useState } from 'react'
import { Seitenleiste } from './components/Seitenleiste'
import { Suche } from './components/Suche'
import { useTheme } from './context/ThemeContext'
import { useHashRoute } from './hooks/useHashRoute'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useSprache, useTexte, type Sprache } from './i18n/SpracheContext'
import { alleKapitel } from './kurs/kurs'
import { KapitelSeite } from './seiten/KapitelSeite'
import { Glossar } from './seiten/Glossar'
import { ProjektUebersicht } from './seiten/ProjektUebersicht'
import { Startseite } from './seiten/Startseite'

// Der Playground bringt viele Bausteine mit - er wird erst geladen, wenn man ihn öffnet.
const Playground = lazy(() => import('./seiten/Playground').then((modul) => ({ default: modul.Playground })))

/**
 * App = Layout + Navigation + Lernfortschritt.
 *
 * Konzepte, die hier stecken:
 *  - "State hochziehen": der Fortschritt lebt hier, weil Kopfzeile, Seitenleiste,
 *    Startseite UND Kapitelseite ihn brauchen.
 *  - Abgeleitete Werte: aktuelles Kapitel und Prozentzahl werden berechnet,
 *    nicht als eigener State gespeichert.
 *  - Mini-Routing über den URL-Hash (siehe hooks/useHashRoute.ts).
 *  - Sprache und Theme kommen per Context (siehe i18n/ und context/).
 */
export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { sprache, setSprache } = useSprache()
  const t = useTexte()
  const [route, navigieren] = useHashRoute()
  const [erledigt, setErledigt] = useLocalStorage<string[]>('lernpfad-erledigt', [])
  const [menueOffen, setMenueOffen] = useState(false)
  // Die Suche merkt sich, auf welcher Seite sie geöffnet wurde. Wechselt die Seite
  // (z. B. per Zurück-Knopf), ist sie dadurch automatisch zu - ganz ohne Effekt.
  const [sucheBeiRoute, setSucheBeiRoute] = useState<string | null>(null)
  const sucheOffen = sucheBeiRoute === route
  const sucheOeffnen = () => setSucheBeiRoute(route)
  const beiStrgK = useEffectEvent(sucheOeffnen)

  const kapitel = alleKapitel.find((k) => k.id === route)
  const prozent = Math.round((erledigt.length / alleKapitel.length) * 100)

  const [seite, unterseite] = route.split('/')
  const glossarZiel = seite === 'glossar' ? unterseite : undefined

  // Bei jedem Seitenwechsel nach oben scrollen (Sprünge ins Glossar scrollen selbst).
  useEffect(() => {
    if (!glossarZiel) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route, glossarZiel])

  // Tab-Titel passend zu Seite und Sprache.
  useEffect(() => {
    const titel = kapitel
      ? `${kapitel.nummer} ${kapitel.titel[sprache]}`
      : seite === 'glossar'
        ? t.glossar
        : seite === 'projekt'
          ? t.projekt
          : seite === 'playground'
            ? t.playground
            : ''
    document.title = titel ? `${titel} · ${t.appTitel}` : t.appTitel
  }, [kapitel, seite, sprache, t])

  // Strg/⌘ + K öffnet die Suche von überall.
  useEffect(() => {
    function tasten(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        beiStrgK()
      }
    }
    window.addEventListener('keydown', tasten)
    return () => window.removeEventListener('keydown', tasten)
  }, [])

  function erledigtSetzen(id: string, wert: boolean) {
    setErledigt((alt) => (wert ? [...new Set([...alt, id])] : alt.filter((e) => e !== id)))
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMenueOffen((o) => !o)}
            className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm md:hidden dark:border-slate-700"
            aria-expanded={menueOffen}
            aria-controls="kursnavigation"
          >
            ☰ <span className="sr-only">{t.kapitelMenue}</span>
          </button>

          <a href="#" className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">
              <span className="text-brand-600 dark:text-brand-400">⚡</span> {t.appTitel}
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">{t.appUntertitel}</p>
          </a>

          <button
            onClick={sucheOeffnen}
            className="ml-auto shrink-0 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm hover:bg-slate-100 md:hidden dark:border-slate-700 dark:hover:bg-slate-800"
            aria-label={t.suche}
          >
            🔍
          </button>

          <div className="hidden items-center gap-2 sm:flex md:ml-auto" title={t.lernfortschritt}>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: prozent + '%' }} />
            </div>
            <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {erledigt.length}/{alleKapitel.length}
            </span>
          </div>

          {/* Sprachumschalter: zwei Knöpfe, aria-pressed zeigt die aktive Sprache an. */}
          <div
            role="group"
            aria-label={t.spracheWaehlen}
            className="flex shrink-0 overflow-hidden rounded-lg border border-slate-300 text-xs font-semibold dark:border-slate-700"
          >
            {(['de', 'en'] as Sprache[]).map((s) => (
              <button
                key={s}
                onClick={() => setSprache(s)}
                aria-pressed={sprache === s}
                lang={s}
                className={`px-2.5 py-1.5 uppercase transition ${
                  sprache === s
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            aria-label={t.farbschemaUmschalten}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6">
        <Seitenleiste
          route={route}
          erledigt={erledigt}
          offen={menueOffen}
          schliessen={() => setMenueOffen(false)}
          sucheOeffnen={sucheOeffnen}
        />

        <main className="min-w-0 flex-1">
          {kapitel ? (
            <KapitelSeite
              // key: frischer State (Quiz, Demos) bei jedem Kapitel- und Sprachwechsel.
              key={kapitel.id + sprache}
              kapitel={kapitel}
              istErledigt={erledigt.includes(kapitel.id)}
              erledigtSetzen={(wert) => erledigtSetzen(kapitel.id, wert)}
              navigieren={navigieren}
            />
          ) : seite === 'glossar' ? (
            <Glossar ziel={glossarZiel} />
          ) : seite === 'projekt' ? (
            <ProjektUebersicht erledigt={erledigt} />
          ) : seite === 'playground' ? (
            <Suspense fallback={null}>
              <Playground teil={unterseite} />
            </Suspense>
          ) : (
            <Startseite erledigt={erledigt} navigieren={navigieren} sucheOeffnen={sucheOeffnen} />
          )}
        </main>
      </div>

      <Suche offen={sucheOffen} schliessen={() => setSucheBeiRoute(null)} navigieren={navigieren} />
    </div>
  )
}
