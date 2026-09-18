import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'praxis-projekt': {
    tipps: {
      de: [
        'Fang mit dem Reducer an (`added`, `toggled`, `deleted`) und teste ihn mit ein paar `dispatch`-Aufrufen.',
        'Speichern: der Reducer-State wandert per Effekt in den `localStorage` - wie in [[projekt-7-speichern]].',
        'Serie und Wochenansicht sind abgeleitete Werte aus `done` - die Hilfsfunktionen stehen oben schon bereit.',
      ],
      en: [
        'Start with the reducer (`added`, `toggled`, `deleted`) and test it with a few `dispatch` calls.',
        'Saving: the reducer state goes into `localStorage` via an effect - as in [[projekt-7-speichern]].',
        'Streak and week view are derived values from `done` - the helper functions are already provided at the top.',
      ],
    },
    code: js`
      // ---- Helper functions (done) ----------------------------------------
      const pad = (n) => String(n).padStart(2, '0')
      const dayString = (d) => \`\${d.getFullYear()}-\${pad(d.getMonth() + 1)}-\${pad(d.getDate())}\`
      const today = () => dayString(new Date())
      function lastDays(count) {
        return Array.from({ length: count }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (count - 1 - i))
          return dayString(d)
        })
      }
      const weekday = (day) => new Date(day + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' })

      // ---- Step 1: reducer ------------------------------------------------
      // A habit: { id, name, done: ['2025-01-01', ...] }
      function reducer(habits, action) {
        switch (action.type) {
          default:
            return habits
        }
      }

      // ---- Step 2: useLocalStorage ----------------------------------------

      // ---- Steps 3-6: components ------------------------------------------
      function App() {
        const [habits, dispatch] = useReducer(reducer, [
          { id: 1, name: 'Drink water 💧', done: [today()] },
        ])

        return (
          <div>
            <h2>My habits</h2>
            <ul>
              {habits.map((h) => <li key={h.id}>{h.name}</li>)}
            </ul>
            <p><small>Days: {lastDays(7).map(weekday).join(' ')}</small></p>
          </div>
        )
      }
    `,
    loesung: js`
      // ---- Helper functions -----------------------------------------------
      const pad = (n) => String(n).padStart(2, '0')
      const dayString = (d) => \`\${d.getFullYear()}-\${pad(d.getMonth() + 1)}-\${pad(d.getDate())}\`
      const today = () => dayString(new Date())
      function lastDays(count) {
        return Array.from({ length: count }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (count - 1 - i))
          return dayString(d)
        })
      }
      const weekday = (day) => new Date(day + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' })

      /** Days in a row up to today (or up to yesterday if today is still open). */
      function streak(done) {
        const days = new Set(done)
        const d = new Date()
        if (!days.has(dayString(d))) d.setDate(d.getDate() - 1)
        let count = 0
        while (days.has(dayString(d))) {
          count++
          d.setDate(d.getDate() - 1)
        }
        return count
      }

      // ---- Step 1: reducer (pure, no mutation) ----------------------------
      function reducer(habits, action) {
        switch (action.type) {
          case 'added':
            return [...habits, { id: Date.now(), name: action.name, done: [] }]
          case 'toggled':
            return habits.map((h) => {
              if (h.id !== action.id) return h
              const isDone = h.done.includes(action.day)
              return {
                ...h,
                done: isDone ? h.done.filter((d) => d !== action.day) : [...h.done, action.day],
              }
            })
          case 'deleted':
            return habits.filter((h) => h.id !== action.id)
          default:
            throw new Error('Unknown action: ' + action.type)
        }
      }

      // ---- Step 2: useReducer + localStorage ------------------------------
      function usePersistentReducer(key, reducer, initial) {
        const [state, dispatch] = useReducer(reducer, initial, (s) => {
          const stored = localStorage.getItem(key)
          return stored ? JSON.parse(stored) : s
        })
        useEffect(() => {
          localStorage.setItem(key, JSON.stringify(state))
        }, [key, state])
        return [state, dispatch]
      }

      // ---- Step 3: form ----------------------------------------------------
      function NewHabit({ existingNames, onAdd }) {
        const [name, setName] = useState('')
        const field = useRef(null)

        const trimmed = name.trim()
        const duplicate = existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())

        function handleSubmit(e) {
          e.preventDefault()
          if (!trimmed || duplicate) return
          onAdd(trimmed)
          setName('')
          field.current.focus()
        }

        return (
          <form onSubmit={handleSubmit}>
            <input ref={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="New habit" />
            <button disabled={!trimmed || duplicate}>Add</button>
            {duplicate && <small style={{ color: 'crimson' }}> already exists</small>}
          </form>
        )
      }

      // ---- Step 4: row ------------------------------------------------------
      function Row({ habit, days, dispatch }) {
        const currentStreak = useMemo(() => streak(habit.done), [habit.done])

        return (
          <tr>
            <td>{habit.name}</td>
            {days.map((day) => {
              const done = habit.done.includes(day)
              return (
                <td key={day}>
                  <button
                    title={day}
                    aria-pressed={done}
                    onClick={() => dispatch({ type: 'toggled', id: habit.id, day })}
                    style={{ width: 30, background: done ? '#10b981' : undefined, color: done ? 'white' : undefined }}
                  >
                    {done ? '✓' : ''}
                  </button>
                </td>
              )
            })}
            <td>🔥 {currentStreak}</td>
            <td>
              <button onClick={() => confirm(\`Delete "\${habit.name}"?\`) && dispatch({ type: 'deleted', id: habit.id })}>
                🗑
              </button>
            </td>
          </tr>
        )
      }

      // ---- Steps 5 & 6: App -------------------------------------------------
      function App() {
        const [habits, dispatch] = usePersistentReducer('habits', reducer, [
          { id: 1, name: 'Drink water 💧', done: [today()] },
        ])
        const days = lastDays(7)

        const doneToday = habits.filter((h) => h.done.includes(today())).length
        const text = \`Today: \${doneToday} of \${habits.length} done\`

        useEffect(() => {
          const previous = document.title
          document.title = text
          return () => { document.title = previous }
        }, [text])

        return (
          <div>
            <h2>My habits</h2>
            <p>{text}</p>
            <progress value={doneToday} max={habits.length || 1} style={{ width: '100%' }} />

            <NewHabit
              existingNames={habits.map((h) => h.name)}
              onAdd={(name) => dispatch({ type: 'added', name })}
            />

            {habits.length === 0 ? (
              <p>No habits yet. Create the first one above! 🌱</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th></th>
                    {days.map((d) => <th key={d}><small>{weekday(d)}</small></th>)}
                    <th>Streak</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((h) => (
                    <Row key={h.id} habit={h} days={days} dispatch={dispatch} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Start: „Today: 1 of 1 done“', en: 'Start: “Today: 1 of 1 done”' },
        pruefung: js`
          await render()
          expect(text()).toContain('Today: 1 of 1 done')
        `,
      },
      {
        name: { de: 'Eine neue Gewohnheit anlegen', en: 'Create a new habit' },
        pruefung: js`
          await render()
          await type(field('input'), 'Read 📚')
          await submit(field('input'))
          expect(text()).toContain('Read 📚')
          expect(text()).toContain('Today: 1 of 2 done')
        `,
      },
      {
        name: { de: 'Keine leeren Namen und keine Duplikate', en: 'No empty names and no duplicates' },
        pruefung: js`
          await render()
          expect(button('Add')).toBeDisabled()
          await type(field('input'), 'drink water 💧')
          expect(button('Add')).toBeDisabled()
        `,
      },
      {
        name: { de: 'Heute abhaken und wieder aus', en: 'Check today and uncheck it again' },
        pruefung: js`
          await render()
          const zeile = () => getByText('Drink water 💧').closest('tr, li') ?? getByText('Drink water 💧').parentElement
          await click(within(zeile()).findAll('button')[6])
          expect(text()).toContain('Today: 0 of 1 done')
          await click(within(zeile()).findAll('button')[6])
          expect(text()).toContain('Today: 1 of 1 done')
        `,
      },
      {
        name: { de: 'Die Serie wird angezeigt', en: 'The streak is shown' },
        pruefung: js`
          await render()
          expect(text()).toContain('🔥 1')
        `,
      },
      {
        name: { de: 'Daten überleben ein Neuladen', en: 'Data survives a reload' },
        pruefung: js`
          await render()
          await type(field('input'), 'Read 📚')
          await submit(field('input'))
          await remount()
          expect(text()).toContain('Read 📚')
        `,
      },
      {
        name: { de: 'Der Tab-Titel zeigt den Fortschritt', en: 'The tab title shows the progress' },
        pruefung: js`
          await render()
          expect(title()).toContain('Today: 1 of 1 done')
        `,
      },
      {
        name: { de: 'Löschen entfernt die Gewohnheit', en: 'Deleting removes the habit' },
        pruefung: js`
          await render()
          const zeile = getByText('Drink water 💧').closest('tr, li') ?? getByText('Drink water 💧').parentElement
          await click(within(zeile).button('🗑'))
          expect(text()).not.toContain('Drink water 💧')
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>
