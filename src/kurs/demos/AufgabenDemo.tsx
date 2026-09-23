import { useReducer, useState } from 'react'
import { Button, Demo, Eingabe, Wert } from '../../components/Ui'
import { useSprache, type Sprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 4.5): Aufgabenliste mit useReducer - Actions als Discriminated Union. */

type Aufgabe = { id: number; text: string; erledigt: boolean }
type Filter = 'alle' | 'offen' | 'erledigt'
type State = { aufgaben: Aufgabe[]; filter: Filter }

// Das Feld `type` entscheidet, welche weiteren Felder eine Action hat.
// TypeScript prüft dadurch jeden dispatch-Aufruf.
type Action =
  | { type: 'hinzugefuegt'; text: string }
  | { type: 'umgeschaltet'; id: number }
  | { type: 'geloescht'; id: number }
  | { type: 'filterGesetzt'; filter: Filter }
  | { type: 'erledigteEntfernt' }

const TEXTE = {
  de: {
    titel: 'Aufgabenliste mit useReducer (TypeScript)',
    start: ['Hooks verstehen', 'Reducer schreiben'],
    platzhalter: 'Neue Aufgabe …',
    hinzufuegen: 'Hinzufügen',
    filter: { alle: 'alle', offen: 'offen', erledigt: 'erledigt' },
    erledigteLoeschen: 'Erledigte löschen',
    leer: 'Nichts zu sehen.',
    loeschen: 'Aufgabe löschen: ',
    erledigt: 'Erledigt: ',
    offen: 'offen',
  },
  en: {
    titel: 'Task list with useReducer (TypeScript)',
    start: ['Understand hooks', 'Write a reducer'],
    platzhalter: 'New task …',
    hinzufuegen: 'Add',
    filter: { alle: 'all', offen: 'open', erledigt: 'done' },
    erledigteLoeschen: 'Clear completed',
    leer: 'Nothing to see.',
    loeschen: 'Delete task: ',
    erledigt: 'Done: ',
    offen: 'open',
  },
}

/** Dritter Parameter von useReducer: berechnet den Startzustand (hier je nach Sprache). */
function startState(sprache: Sprache): State {
  const [a, b] = TEXTE[sprache].start
  return {
    aufgaben: [
      { id: 1, text: a, erledigt: true },
      { id: 2, text: b, erledigt: false },
    ],
    filter: 'alle',
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hinzugefuegt':
      return {
        ...state,
        aufgaben: [...state.aufgaben, { id: Date.now(), text: action.text, erledigt: false }],
      }
    case 'umgeschaltet':
      return {
        ...state,
        aufgaben: state.aufgaben.map((a) => (a.id === action.id ? { ...a, erledigt: !a.erledigt } : a)),
      }
    case 'geloescht':
      return { ...state, aufgaben: state.aufgaben.filter((a) => a.id !== action.id) }
    case 'filterGesetzt':
      return { ...state, filter: action.filter }
    case 'erledigteEntfernt':
      return { ...state, aufgaben: state.aufgaben.filter((a) => !a.erledigt) }
    default: {
      // Erschöpfungsprüfung: Fehlt oben ein case, meldet TypeScript hier einen Fehler.
      const unbekannt: never = action
      return unbekannt
    }
  }
}

export function AufgabenDemo() {
  const { sprache } = useSprache()
  const t = TEXTE[sprache]
  const [state, dispatch] = useReducer(reducer, sprache, startState)
  const [entwurf, setEntwurf] = useState('')

  const sichtbar = state.aufgaben.filter((a) =>
    state.filter === 'alle' ? true : state.filter === 'offen' ? !a.erledigt : a.erledigt,
  )

  function hinzufuegen() {
    const text = entwurf.trim()
    if (!text) return
    dispatch({ type: 'hinzugefuegt', text })
    setEntwurf('')
  }

  return (
    <Demo titel={t.titel}>
      <div className="flex gap-2">
        <Eingabe
          value={entwurf}
          onChange={(e) => setEntwurf(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && hinzufuegen()}
          placeholder={t.platzhalter}
        />
        <Button onClick={hinzufuegen}>{t.hinzufuegen}</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['alle', 'offen', 'erledigt'] as const).map((f) => (
          <Button
            key={f}
            variante={state.filter === f ? 'primaer' : 'sekundaer'}
            onClick={() => dispatch({ type: 'filterGesetzt', filter: f })}
          >
            {t.filter[f]}
          </Button>
        ))}
        <Button variante="gefahr" onClick={() => dispatch({ type: 'erledigteEntfernt' })}>
          {t.erledigteLoeschen}
        </Button>
      </div>
      <ul className="space-y-1">
        {sichtbar.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
          >
            <input
              type="checkbox"
              checked={a.erledigt}
              onChange={() => dispatch({ type: 'umgeschaltet', id: a.id })}
              aria-label={t.erledigt + a.text}
              className="size-4 accent-brand-600"
            />
            <span className={a.erledigt ? 'line-through opacity-60' : ''}>{a.text}</span>
            <button
              onClick={() => dispatch({ type: 'geloescht', id: a.id })}
              className="ml-auto text-slate-500 hover:text-rose-600 dark:text-slate-400"
              aria-label={t.loeschen + a.text}
            >
              ×
            </button>
          </li>
        ))}
        {sichtbar.length === 0 && <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">{t.leer}</li>}
      </ul>
      <Wert label={t.offen}>{state.aufgaben.filter((a) => !a.erledigt).length}</Wert>
    </Demo>
  )
}
