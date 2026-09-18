import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'praxis-formulare-einstieg': {
    code: js`
      function App() {
        const [email, setEmail] = useState('')

        function handleSubmit(e) {
          e.preventDefault()
          console.log('Sending:', email)
        }

        return (
          <form onSubmit={handleSubmit}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
            <button>Send</button>
          </form>
        )
      }
    `,
  },
  'praxis-formulare-arten': {
    code: js`
      function Controlled() {
        const [zip, setZip] = useState('')
        return (
          <p>
            Controlled ZIP code:{' '}
            {/* Only allow digits, at most 5 - only possible when controlled */}
            <input value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))} />
            {zip.length === 5 ? ' ✅' : \` \${5 - zip.length} to go\`}
          </p>
        )
      }

      function Uncontrolled() {
        function handleSubmit(e) {
          e.preventDefault()
          const data = Object.fromEntries(new FormData(e.currentTarget))
          console.log('Submitted:', data)
        }
        return (
          <form onSubmit={handleSubmit}>
            Uncontrolled:{' '}
            <input name="city" defaultValue="Berlin" />
            <select name="country" defaultValue="de">
              <option value="de">Germany</option>
              <option value="at">Austria</option>
            </select>
            <button>Submit</button>
          </form>
        )
      }

      function App() {
        return (
          <>
            <Controlled />
            <Uncontrolled />
          </>
        )
      }
    `,
  },
  'praxis-formulare-uebung': {
    tipps: {
      de: [
        'Ein State-Objekt für alle Werte und ein `handleChange`, das `name` und bei Checkboxen `checked` nutzt.',
        '`validate(values)` gibt ein Fehlerobjekt zurück - abgeleitet bei jedem Render.',
        'Fehler erst nach `onBlur` zeigen: ein zweites Objekt `touched` merkt sich besuchte Felder.',
      ],
      en: [
        'One state object for all values and a `handleChange` that uses `name` and, for checkboxes, `checked`.',
        '`validate(values)` returns an error object - derived on every render.',
        'Only show errors after `onBlur`: a second object `touched` remembers visited fields.',
      ],
    },
    code: js`
      function App() {
        return (
          <form>
            <p><label>Username <input name="username" /></label></p>
            <p><label>Password <input name="password" type="password" /></label></p>
            <p><label>Repeat <input name="repeat" type="password" /></label></p>
            <p><label><input name="terms" type="checkbox" /> Accept terms</label></p>
            <button>Sign up</button>
          </form>
        )
      }
    `,
    loesung: js`
      const INITIAL = { username: '', password: '', repeat: '', terms: false }

      function validate(v) {
        const e = {}
        if (v.username.trim().length < 3) e.username = 'At least 3 characters.'
        if (v.password.length < 8 || !/\d/.test(v.password)) e.password = 'At least 8 characters and one digit.'
        if (v.repeat !== v.password) e.repeat = 'Passwords do not match.'
        if (!v.terms) e.terms = 'Please accept the terms.'
        return e
      }

      function Field({ id, label, error, ...props }) {
        return (
          <p>
            <label htmlFor={id}>{label}</label>{' '}
            <input id={id} aria-invalid={Boolean(error)} {...props} />
            {error && <><br /><small style={{ color: 'crimson' }}>{error}</small></>}
          </p>
        )
      }

      function App() {
        const [values, setValues] = useState(INITIAL)
        const [touched, setTouched] = useState({})
        const [done, setDone] = useState(null)
        const id = useId()

        const errors = validate(values)
        const isValid = Object.keys(errors).length === 0
        const show = (name) => (touched[name] ? errors[name] : undefined)

        function handleChange(e) {
          const { name, type, value, checked } = e.target
          setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        }
        const handleBlur = (e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }))

        function handleSubmit(e) {
          e.preventDefault()
          if (!isValid) return
          setDone(values.username)
          setValues(INITIAL)
          setTouched({})
        }

        if (done) return <h2>Welcome, {done}! 🎉</h2>

        return (
          <form onSubmit={handleSubmit} noValidate>
            <Field id={id + 'u'} label="Username" name="username" value={values.username} onChange={handleChange} onBlur={handleBlur} error={show('username')} />
            <Field id={id + 'p'} label="Password" name="password" type="password" value={values.password} onChange={handleChange} onBlur={handleBlur} error={show('password')} />
            <Field id={id + 'r'} label="Repeat" name="repeat" type="password" value={values.repeat} onChange={handleChange} onBlur={handleBlur} error={show('repeat')} />
            <p>
              <label>
                <input name="terms" type="checkbox" checked={values.terms} onChange={handleChange} onBlur={handleBlur} /> Accept terms
              </label>
              {show('terms') && <><br /><small style={{ color: 'crimson' }}>{show('terms')}</small></>}
            </p>
            <button disabled={!isValid}>Sign up</button>
          </form>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Sign up ist anfangs deaktiviert', en: 'Sign up is disabled initially' },
        pruefung: js`
          await render()
          expect(button('Sign up')).toBeDisabled()
        `,
      },
      {
        name: { de: 'Gültige Eingaben aktivieren Sign up', en: 'Valid input enables Sign up' },
        pruefung: js`
          await render()
          await type(field('username'), 'ada')
          await type(field('password'), 'secret123')
          await type(field('repeat'), 'secret123')
          await check(field('terms'))
          expect(button('Sign up')).not.toBeDisabled()
        `,
      },
      {
        name: { de: 'Das Passwort braucht eine Ziffer', en: 'The password needs a digit' },
        pruefung: js`
          await render()
          await type(field('username'), 'ada')
          await type(field('password'), 'secretpassword')
          await type(field('repeat'), 'secretpassword')
          await check(field('terms'))
          expect(button('Sign up')).toBeDisabled()
        `,
      },
      {
        name: { de: 'Die Passwörter müssen übereinstimmen', en: 'The passwords must match' },
        pruefung: js`
          await render()
          await type(field('username'), 'ada')
          await type(field('password'), 'secret123')
          await type(field('repeat'), 'secret124')
          await check(field('terms'))
          expect(button('Sign up')).toBeDisabled()
        `,
      },
      {
        name: { de: 'Fehler erscheinen erst nach Verlassen des Feldes', en: 'Errors only appear after leaving the field' },
        pruefung: js`
          await render()
          await type(field('username'), 'ab')
          const vorher = text()
          await blur(field('username'))
          expect(text().length).toBeGreaterThan(vorher.length)
        `,
      },
      {
        name: { de: 'Absenden zeigt „Welcome, ada!“', en: 'Submitting shows “Welcome, ada!”' },
        pruefung: js`
          await render()
          await type(field('username'), 'ada')
          await type(field('password'), 'secret123')
          await type(field('repeat'), 'secret123')
          await check(field('terms'))
          await click(button('Sign up'))
          expect(text()).toContain('Welcome, ada!')
        `,
      },
      {
        name: { de: 'Labels sind per useId verknüpft', en: 'Labels are linked via useId' },
        pruefung: js`
          expect(code).toMatch(/useId\(/)
          await render()
          const id = field('username').id
          expect(id).toBeTruthy()
          expect(findAll('label').some((l) => l.htmlFor === id)).toBe(true)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>
