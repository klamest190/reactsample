import { useSprache, useTexte } from '../../i18n/SpracheContext'
import { Text } from '../../lernen/Text'
import { TryIt } from '../../lernen/TryIt'
import { projektSchritte } from './meta'
import { schrittInhalte } from './schritte'

/**
 * Eine Seite für alle Projektschritte - der Inhalt kommt aus schritte.ts.
 * Aufbau: Worum geht es? -> Anforderungen -> Editor mit Tests, Tipps und Lösung.
 */
export function ProjektSchritt({ id }: { id: string }) {
  const { sprache } = useSprache()
  const t = useTexte()
  const index = projektSchritte.findIndex((s) => s.id === id)
  const inhalt = schrittInhalte[id]
  if (!inhalt) return null

  const absaetze = inhalt.einleitung[sprache].split('\n\n')
  const startHinweis =
    inhalt.start === undefined ? t.schrittStart(index) : id.endsWith('challenge') ? t.schrittStartLeer : t.schrittGeruest

  const gemeinsam = {
    id: 'projekt:' + id,
    code: inhalt.start ?? schrittInhalte[projektSchritte[index - 1].id].loesung,
    loesung: inhalt.loesung,
    tipps: inhalt.tipps,
    aufgabe: <p className="text-xs text-slate-500 dark:text-slate-400">{startHinweis}</p>,
  }

  return (
    <>
      <section className="max-w-3xl space-y-3 leading-relaxed text-slate-700 dark:text-slate-300">
        {absaetze.map((absatz, i) => (
          <p key={i}>
            <Text text={absatz} />
          </p>
        ))}
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <h2 className="mb-2 font-semibold">{t.anforderungen}</h2>
          <ul className="space-y-1.5 text-sm">
            {inhalt.anforderungen[sprache].map((anforderung, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-600 dark:text-amber-400" aria-hidden>
                  ☐
                </span>
                <span>
                  <Text text={anforderung} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {inhalt.modus === 'test' ? (
          <TryIt modus="test" titel={t.schrittAufgabe} {...gemeinsam} dateien={inhalt.dateien} varianten={inhalt.varianten} />
        ) : inhalt.modus === 'react' ? (
          <TryIt modus="react" titel={t.schrittAufgabe} {...gemeinsam} tests={inhalt.tests} typen={inhalt.typen} />
        ) : (
          <TryIt titel={t.schrittAufgabe} {...gemeinsam} tests={inhalt.tests} vorschau={inhalt.vorschau} />
        )}
      </section>
    </>
  )
}
