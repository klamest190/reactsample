import { lazy, Suspense, useEffect, useEffectEvent, useState } from 'react'
import { Icon, Logo } from './components/Icon'
import { Seitenleiste } from './components/Seitenleiste'
import { Suche } from './components/Suche'
import { Platzhalter } from './components/Ui'
import { useFortschritt } from './context/FortschrittContext'
import { useTheme } from './context/ThemeContext'
import { useHashRoute } from './hooks/useHashRoute'
import { useSprache, useTexte, type Sprache } from './i18n/SpracheContext'
import { alleKapitel } from './kurs/kurs'
import { KapitelSeite } from './seiten/KapitelSeite'
import { Glossar } from './seiten/Glossar'
import { ProjektUebersicht } from './seiten/ProjektUebersicht'
import { Startseite } from './seiten/Startseite'

// Der Playground bringt viele Bausteine mit - er wird erst geladen, wenn man ihn öffnet.
const Playground = lazy(() => import('./seiten/Playground').then((modul) => ({ default: modul.Playground })))

/** Quadratischer Knopf mit Symbol in der Kopfzeile - alle gleich hoch (h-8), damit die Zeile ruhig wirkt. */
const KOPF_KNOPF =
  'flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'

/**
 * App = Layout + Navigation + Lernfortschritt.
 *
 * Konzepte, die hier stecken:
 *  - "State hochziehen": der Fortschritt wird hier ausgepackt und als Prop an
 *    Kopfzeile, Seitenleiste, Startseite und Kapitelseite verteilt. Gelagert wird
 *    er eine Ebene höher im FortschrittContext, weil die Kapitelseite beim
 *    Wechsel neu aufgebaut wird und Quizstände das überleben sollen.
 *  - Abgeleitete Werte: aktuelles Kapitel und Prozentzahl werden berechnet,
 *    nicht als eigener State gespeichert.
 *  - Mini-Routing über den URL-Hash (siehe hooks/useHashRoute.ts).
 *  - Sprache, Theme und Fortschritt kommen per Context (siehe i18n/ und context/).
 */
export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { sprache, setSprache } = useSprache()
  const t = useTexte()
  const [route, navigieren] = useHashRoute()
  const { erledigt, kapitelSetzen } = useFortschritt()
  const [menueOffen, setMenueOffen] = useState(false)
  // Die Suche merkt sich, auf welcher Seite sie geöffnet wurde. Wechselt die Seite
  // (z. B. per Zurück-Knopf), ist sie dadurch automatisch zu - ganz ohne Effekt.
  const [sucheBeiRoute, setSucheBeiRoute] = useState<string | null>(null)
  const sucheOffen = sucheBeiRoute === route
  const sucheOeffnen = () => setSucheBeiRoute(route)
  const beiStrgK = useEffectEvent(sucheOeffnen)

  // Die Route hat höchstens zwei Teile: Seite und Ziel darin, z.B.
  // "hooks-usestate/abschnitt-3" oder "glossar/closure". Keine Kapitel-ID enthält ein "/".
  const [seite, unterseite] = route.split('/')
  const kapitel = alleKapitel.find((k) => k.id === seite)
  const prozent = Math.round((erledigt.length / alleKapitel.length) * 100)

  const glossarZiel = seite === 'glossar' ? unterseite : undefined
  const abschnittZiel = kapitel ? unterseite : undefined

  // Bei jedem Seitenwechsel nach oben scrollen - außer wenn ein Ziel
  // innerhalb der Seite angesprungen wird, das scrollt selbst.
  useEffect(() => {
    if (!glossarZiel && !abschnittZiel) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route, glossarZiel, abschnittZiel])

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

  return (
    <div className="min-h-screen">
      {/* Überspringt die über 70 Einträge der Seitenleiste. Ein Knopf, kein Link:
          ein <a href="#inhalt"> würde der Hash-Router als Seitenwechsel lesen. */}
      <button
        onClick={() => document.getElementById('inhalt')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        {t.zumInhalt}
      </button>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        {/* Volle Breite: die Kopfzeile läuft über den ganzen Bildschirm, wie der Inhalt darunter. */}
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => setMenueOffen((o) => !o)}
            className={`${KOPF_KNOPF} md:hidden`}
            aria-expanded={menueOffen}
            aria-controls="kursnavigation"
          >
            <Icon name={menueOffen ? 'kreuz' : 'menue'} className="size-4.5" />
            <span className="sr-only">{t.kapitelMenue}</span>
          </button>

          <a href="#" className="group flex min-w-0 items-center gap-3 rounded-lg">
            <Logo className="size-8 transition group-hover:scale-105" />
            <span className="min-w-0">
              <h1 className="truncate text-base leading-tight font-semibold tracking-tight">{t.appTitel}</h1>
              <p className="hidden truncate text-xs text-slate-500 lg:block dark:text-slate-400">{t.appUntertitel}</p>
            </span>
          </a>

          <button onClick={sucheOeffnen} className={`${KOPF_KNOPF} ml-auto md:hidden`} aria-label={t.suche}>
            <Icon name="suche" className="size-4" />
          </button>

          <div className="hidden items-center gap-2 sm:flex md:ml-auto" title={t.lernfortschritt}>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 transition-all"
                style={{ width: prozent + '%' }}
              />
            </div>
            <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {erledigt.length}/{alleKapitel.length}
            </span>
          </div>

          {/* Sprachumschalter: zwei Knöpfe, aria-pressed zeigt die aktive Sprache an. */}
          <div
            role="group"
            aria-label={t.spracheWaehlen}
            className="flex h-8 shrink-0 overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold dark:border-slate-800"
          >
            {(['de', 'en'] as Sprache[]).map((s) => (
              <button
                key={s}
                onClick={() => setSprache(s)}
                aria-pressed={sprache === s}
                lang={s}
                className={`px-2.5 uppercase transition ${
                  sprache === s
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button onClick={toggleTheme} className={KOPF_KNOPF} aria-label={t.farbschemaUmschalten}>
            <Icon name={theme === 'dark' ? 'sonne' : 'mond'} className="size-4" />
          </button>
        </div>
      </header>

      {/* Früher max-w-7xl (1280px) und zentriert - auf breiten Monitoren blieben links
          und rechts leere Streifen. Jetzt: Seitenleiste am linken Rand, der Inhalt nimmt
          den Rest. Die Lesebreite hält der Fließtext selbst (max-w-3xl in P und Liste). */}
      <div className="flex gap-8 px-4 py-6 sm:px-6 lg:gap-12 lg:px-8">
        <Seitenleiste
          route={route}
          erledigt={erledigt}
          offen={menueOffen}
          schliessen={() => setMenueOffen(false)}
          sucheOeffnen={sucheOeffnen}
        />

        <main id="inhalt" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          {kapitel ? (
            <KapitelSeite
              // key: frischer State (Quiz, Demos) bei jedem Kapitel- und Sprachwechsel.
              // Der Abschnitt gehört bewusst NICHT in den key - sonst würde ein
              // Sprung innerhalb des Kapitels es neu aufbauen und das Quiz leeren.
              key={kapitel.id + sprache}
              kapitel={kapitel}
              abschnittZiel={abschnittZiel}
              istErledigt={erledigt.includes(kapitel.id)}
              erledigtSetzen={(wert) => kapitelSetzen(kapitel.id, wert)}
              navigieren={navigieren}
            />
          ) : seite === 'glossar' ? (
            <Glossar ziel={glossarZiel} />
          ) : seite === 'projekt' ? (
            <ProjektUebersicht erledigt={erledigt} />
          ) : seite === 'playground' ? (
            <Suspense fallback={<Platzhalter label={t.playground} />}>
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
