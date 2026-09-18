import { useId, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { Button, Demo } from '../../components/Ui'
import { useSprache, type Sprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 4.1): Kontaktformular mit einem State-Objekt und abgeleiteter Validierung. */

type Formular = {
  name: string
  email: string
  thema: 'frage' | 'lob' | 'fehler'
  nachricht: string
  newsletter: boolean
}

const leeresFormular: Formular = { name: '', email: '', thema: 'frage', nachricht: '', newsletter: false }

const TEXTE = {
  de: {
    titel: 'Kontaktformular (TypeScript)',
    felder: { name: 'Name', email: 'E-Mail', thema: 'Thema', nachricht: 'Nachricht' },
    themen: { frage: 'Frage', lob: 'Lob', fehler: 'Fehlermeldung' },
    newsletter: 'Newsletter abonnieren',
    absenden: 'Absenden',
    fehler: { name: 'Mindestens 2 Zeichen.', email: 'Keine gültige E-Mail.', nachricht: 'Mindestens 10 Zeichen.' },
  },
  en: {
    titel: 'Contact form (TypeScript)',
    felder: { name: 'Name', email: 'Email', thema: 'Topic', nachricht: 'Message' },
    themen: { frage: 'Question', lob: 'Praise', fehler: 'Bug report' },
    newsletter: 'Subscribe to newsletter',
    absenden: 'Submit',
    fehler: { name: 'At least 2 characters.', email: 'Not a valid email.', nachricht: 'At least 10 characters.' },
  },
}

/** Reine Funktion: Werte rein, Fehlermeldungen raus. Leicht testbar. */
function validieren(werte: Formular, sprache: Sprache) {
  const meldungen = TEXTE[sprache].fehler
  const fehler: Partial<Record<keyof Formular, string>> = {}
  if (werte.name.trim().length < 2) fehler.name = meldungen.name
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(werte.email)) fehler.email = meldungen.email
  if (werte.nachricht.trim().length < 10) fehler.nachricht = meldungen.nachricht
  return fehler
}

export function Kontaktformular() {
  const { sprache } = useSprache()
  const t = TEXTE[sprache]
  const [werte, setWerte] = useState<Formular>(leeresFormular)
  // Welche Felder hat der Benutzer schon verlassen? Erst dann Fehler zeigen.
  const [beruehrt, setBeruehrt] = useState<Partial<Record<keyof Formular, boolean>>>({})
  const [gesendet, setGesendet] = useState<Formular | null>(null)
  const id = useId()

  // Abgeleitet, kein eigener State - kann nie veralten.
  const fehler = validieren(werte, sprache)
  const istGueltig = Object.keys(fehler).length === 0

  function aendern(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setWerte((alt) => ({ ...alt, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  function absenden(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setBeruehrt({ name: true, email: true, nachricht: true })
    if (!istGueltig) return
    setGesendet(werte)
    setWerte(leeresFormular)
    setBeruehrt({})
  }

  const feld =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800'

  const textfelder = [
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' },
  ] as const

  return (
    <Demo titel={t.titel}>
      <form onSubmit={absenden} noValidate className="space-y-3">
        {textfelder.map((f) => (
          <div key={f.name}>
            <label htmlFor={`${id}-${f.name}`} className="mb-1 block text-sm font-medium">
              {t.felder[f.name]}
            </label>
            <input
              id={`${id}-${f.name}`}
              name={f.name}
              type={f.type}
              value={werte[f.name]}
              onChange={aendern}
              onBlur={() => setBeruehrt((alt) => ({ ...alt, [f.name]: true }))}
              aria-invalid={Boolean(beruehrt[f.name] && fehler[f.name])}
              className={feld}
            />
            {beruehrt[f.name] && fehler[f.name] && <p className="mt-1 text-xs text-rose-600">{fehler[f.name]}</p>}
          </div>
        ))}

        <div>
          <label htmlFor={`${id}-thema`} className="mb-1 block text-sm font-medium">
            {t.felder.thema}
          </label>
          <select id={`${id}-thema`} name="thema" value={werte.thema} onChange={aendern} className={feld}>
            {(['frage', 'lob', 'fehler'] as const).map((thema) => (
              <option key={thema} value={thema}>
                {t.themen[thema]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-nachricht`} className="mb-1 block text-sm font-medium">
            {t.felder.nachricht}
          </label>
          <textarea
            id={`${id}-nachricht`}
            name="nachricht"
            rows={3}
            value={werte.nachricht}
            onChange={aendern}
            onBlur={() => setBeruehrt((alt) => ({ ...alt, nachricht: true }))}
            className={feld}
          />
          {beruehrt.nachricht && fehler.nachricht && <p className="mt-1 text-xs text-rose-600">{fehler.nachricht}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="newsletter" checked={werte.newsletter} onChange={aendern} className="size-4 accent-brand-600" />
          {t.newsletter}
        </label>

        <Button type="submit">{t.absenden}</Button>
      </form>

      {gesendet && (
        <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-800">
          {JSON.stringify(gesendet, null, 2)}
        </pre>
      )}
    </Demo>
  )
}
