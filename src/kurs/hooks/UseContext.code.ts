import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'hooks-usecontext-einstieg': {
    code: js`
      const ThemeContext = createContext('light')

      function Label() {
        const theme = useContext(ThemeContext)
        return <p>The theme is: {theme}</p>
      }

      function App() {
        return (
          <ThemeContext value="dark">
            <Label />
          </ThemeContext>
        )
      }
    `,
  },
  'hooks-usecontext-drilling': {
    tipps: {
      de: [
        'Drei Schritte: `createContext`, `<UserContext value={user}>` um den Baum, `useContext(UserContext)` in `Avatar`.',
        'Jetzt können `Page` und `Header` die `user`-Prop einfach weglassen.',
      ],
      en: [
        'Three steps: `createContext`, `<UserContext value={user}>` around the tree, `useContext(UserContext)` in `Avatar`.',
        'Now `Page` and `Header` can simply drop the `user` prop.',
      ],
    },
    code: js`
      // "user" has to go through Page and Header, although only Avatar needs it.
      function Avatar({ user }) {
        return <span>👤 {user.name}</span>
      }

      function Header({ user }) {
        return <header style={{ borderBottom: '1px solid #ccc' }}>My shop · <Avatar user={user} /></header>
      }

      function Page({ user }) {
        return (
          <div>
            <Header user={user} />
            <p>Content …</p>
          </div>
        )
      }

      function App() {
        const [user, setUser] = useState({ name: 'Ada' })
        return (
          <>
            <button onClick={() => setUser({ name: 'Grace' })}>Log in as Grace</button>
            <Page user={user} />
          </>
        )
      }
    `,
    loesung: js`
      // 1. Create the context
      const UserContext = createContext(null)

      function Avatar() {
        // 3. Read the value - no matter how deep
        const user = useContext(UserContext)
        return <span>👤 {user.name}</span>
      }

      function Header() {
        return <header style={{ borderBottom: '1px solid #ccc' }}>My shop · <Avatar /></header>
      }

      function Page() {
        return (
          <div>
            <Header />
            <p>Content …</p>
          </div>
        )
      }

      function App() {
        const [user, setUser] = useState({ name: 'Ada' })
        return (
          // 2. Provide the value
          <UserContext value={user}>
            <button onClick={() => setUser({ name: 'Grace' })}>Log in as Grace</button>
            <Page />
          </UserContext>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Context statt Prop Drilling', en: 'Context instead of prop drilling' },
        pruefung: js`
          expect(code).toMatch(/createContext\(/)
          expect(code).toMatch(/useContext\(/)
          expect(code).toMatch(/<Page\s*\/>/)
        `,
      },
      {
        name: { de: 'Anmelden als Grace aktualisiert den Avatar', en: 'Logging in as Grace updates the avatar' },
        pruefung: js`
          await render()
          expect(text()).toContain('👤 Ada')
          await click(button('Log in as Grace'))
          expect(text()).toContain('👤 Grace')
        `,
      },
    ],
  },
  'hooks-usecontext-muster': {
    code: js`
      // ---- todos.jsx ------------------------------------------------
      const TodoContext = createContext(null)

      function reducer(todos, action) {
        switch (action.type) {
          case 'added':
            return [...todos, { id: Date.now(), text: action.text, done: false }]
          case 'toggled':
            return todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
          default:
            return todos
        }
      }

      function TodoProvider({ children }) {
        const [todos, dispatch] = useReducer(reducer, [{ id: 1, text: 'Learn context', done: false }])
        const value = useMemo(() => ({ todos, dispatch }), [todos])
        return <TodoContext value={value}>{children}</TodoContext>
      }

      function useTodos() {
        const ctx = useContext(TodoContext)
        if (!ctx) throw new Error('useTodos needs a <TodoProvider>')
        return ctx
      }

      // ---- Components -----------------------------------------------
      function NewTodo() {
        const { dispatch } = useTodos()
        const [text, setText] = useState('')
        return (
          <form onSubmit={(e) => { e.preventDefault(); dispatch({ type: 'added', text }); setText('') }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="New task" />
            <button>+</button>
          </form>
        )
      }

      function TodoList() {
        const { todos, dispatch } = useTodos()
        return (
          <ul>
            {todos.map((t) => (
              <li key={t.id} onClick={() => dispatch({ type: 'toggled', id: t.id })}
                  style={{ textDecoration: t.done ? 'line-through' : 'none', cursor: 'pointer' }}>
                {t.text}
              </li>
            ))}
          </ul>
        )
      }

      function Counter() {
        const { todos } = useTodos()
        return <p>{todos.filter((t) => !t.done).length} open</p>
      }

      function App() {
        return (
          <TodoProvider>
            <Counter />
            <NewTodo />
            <TodoList />
          </TodoProvider>
        )
      }
    `,
  },
  'hooks-usecontext-uebung': {
    tipps: {
      de: [
        '`LanguageProvider` hält `language` als State und stellt `{ language, t, toggle }` bereit.',
        'Den Wert mit `useMemo(…, [language])` stabil halten.',
        '`useTranslation` liest den Context und wirft ohne Provider einen Fehler.',
      ],
      en: [
        '`LanguageProvider` holds `language` as state and provides `{ language, t, toggle }`.',
        'Keep the value stable with `useMemo(…, [language])`.',
        '`useTranslation` reads the context and throws an error without a provider.',
      ],
    },
    code: js`
      const TEXTS = {
        en: { greeting: 'Hello!', question: 'How are you?', switch: 'Auf Deutsch wechseln' },
        de: { greeting: 'Hallo!', question: 'Wie geht es dir?', switch: 'Switch to English' },
      }

      function Greeting() {
        return (
          <>
            <h2>{TEXTS.en.greeting}</h2>
            <p>{TEXTS.en.question}</p>
          </>
        )
      }

      function LanguageSwitch() {
        return <button>{TEXTS.en.switch}</button>
      }

      function App() {
        return (
          <>
            <Greeting />
            <LanguageSwitch />
          </>
        )
      }
    `,
    loesung: js`
      const TEXTS = {
        en: { greeting: 'Hello!', question: 'How are you?', switch: 'Auf Deutsch wechseln' },
        de: { greeting: 'Hallo!', question: 'Wie geht es dir?', switch: 'Switch to English' },
      }

      const LanguageContext = createContext(null)

      function LanguageProvider({ children }) {
        const [language, setLanguage] = useState('en')

        const value = useMemo(
          () => ({
            language,
            t: (key) => TEXTS[language][key],
            toggle: () => setLanguage((l) => (l === 'en' ? 'de' : 'en')),
          }),
          [language]
        )

        return <LanguageContext value={value}>{children}</LanguageContext>
      }

      function useTranslation() {
        const ctx = useContext(LanguageContext)
        if (!ctx) throw new Error('useTranslation needs a <LanguageProvider>')
        return ctx
      }

      function Greeting() {
        const { t } = useTranslation()
        return (
          <>
            <h2>{t('greeting')}</h2>
            <p>{t('question')}</p>
          </>
        )
      }

      function LanguageSwitch() {
        const { t, toggle } = useTranslation()
        return <button onClick={toggle}>{t('switch')}</button>
      }

      function App() {
        return (
          <LanguageProvider>
            <Greeting />
            <LanguageSwitch />
          </LanguageProvider>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Startet auf Englisch', en: 'Starts in English' },
        pruefung: js`
          await render()
          expect(text()).toContain('Hello!')
          expect(text()).toContain('How are you?')
        `,
      },
      {
        name: { de: 'Der Knopf wechselt die Sprache hin und zurück', en: 'The button switches the language back and forth' },
        pruefung: js`
          await render()
          await click(button('Auf Deutsch wechseln'))
          expect(text()).toContain('Hallo!')
          expect(text()).toContain('Wie geht es dir?')
          await click(button('Switch to English'))
          expect(text()).toContain('Hello!')
        `,
      },
      {
        name: { de: 'Context mit eigenem Hook useTranslation', en: 'Context with a custom hook useTranslation' },
        pruefung: js`
          expect(code).toMatch(/createContext\(/)
          expect(code).toMatch(/function useTranslation\s*\(/)
          expect(code).not.toMatch(/TEXTS\.(en|de)\./)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    // 1. Create - usually in its own file, with a default value
    const ThemeContext = createContext('light')

    // 2. Provide - everything below can read the value
    <ThemeContext value={theme}>        {/* before React 19: <ThemeContext.Provider value={theme}> */}
      <App />
    </ThemeContext>

    // 3. Read - in any component, however deep
    const theme = useContext(ThemeContext)
  `,
}
