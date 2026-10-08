import { Icon } from '../../components/Icon'
import { useSprache, useTexte } from '../../i18n/LanguageContext'
import { Text } from '../../learning/Text'
import { TryIt } from '../../learning/TryIt'
import { projektSchritte } from './meta'
import { schrittInhalte } from './steps'

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
    code: inhalt.start ?? schrittInhalte[projektSchritte[index - 1].id].solution,
    solution: inhalt.solution,
    hints: inhalt.hints,
    task: <p className="text-xs text-slate-600 dark:text-slate-400">{startHinweis}</p>,
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
          <h2 className="mb-2 flex items-center gap-2 font-semibold">
            <Icon name="liste" className="size-4 text-amber-600 dark:text-amber-400" />
            {t.anforderungen}
          </h2>
          <ul className="space-y-1.5 text-sm">
            {inhalt.anforderungen[sprache].map((anforderung, i) => (
              <li key={i} className="flex gap-2">
                <Icon name="kaestchen" className="mt-0.5 size-4 text-amber-500 dark:text-amber-400" />
                <span>
                  <Text text={anforderung} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {inhalt.mode === 'test' ? (
          <TryIt mode="test" title={t.schrittAufgabe} {...gemeinsam} files={inhalt.files} variants={inhalt.variants} />
        ) : inhalt.mode === 'react' ? (
          <TryIt mode="react" title={t.schrittAufgabe} {...gemeinsam} tests={inhalt.tests} typed={inhalt.typed} />
        ) : (
          <TryIt title={t.schrittAufgabe} {...gemeinsam} tests={inhalt.tests} preview={inhalt.preview} />
        )}
      </section>
    </>
  )
}
