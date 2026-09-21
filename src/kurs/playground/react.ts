import { js } from '../../lernen/quelltext'
import type { PlaygroundDaten, Vorlage } from './typen'

/** Leere React-Vorlage - gemeinsam für die React-Playgrounds. */
export const reactLeer: Vorlage = {
  titel: { de: 'Leeres Blatt', en: 'Blank page' },
  info: { de: 'Nur die Komponente App - der Rest gehört dir.', en: 'Just the App component - the rest is yours.' },
  code: js`
    // React playground - the component App is rendered on the right.
    // Hooks work without an import. Pick building blocks on the left.

    function App() {
      return (
        <div>
          <h1>Hello playground!</h1>
        </div>
      )
    }
  `,
}

/** Playground für Teil 3 (React-Grundlagen): Komponenten, Props, State, Datenfluss. */
export const reactPlayground: PlaygroundDaten = {
  teil: 'react',
  modus: 'react',
  hinweis: {
    de: 'Tailwind geht hier komplett: Tippe in className="…" los (z. B. bg- oder hover:), dann schlägt der Editor Klassen mit Farbe und CSS vor.',
    en: 'Tailwind works fully here: start typing inside className="…" (e.g. bg- or hover:) and the editor suggests classes with color and CSS.',
  },
  vorlagen: [
    reactLeer,
    {
      titel: { de: 'Zähler', en: 'Counter' },
      info: { de: 'Der Klassiker mit useState und zwei Knöpfen.', en: 'The classic with useState and two buttons.' },
      code: js`
        function App() {
          const [count, setCount] = useState(0)

          return (
            <div>
              <h1>{count}</h1>
              <button onClick={() => setCount(count - 1)}>−</button>
              <button onClick={() => setCount(count + 1)}>+</button>
            </div>
          )
        }
      `,
    },
    {
      titel: { de: 'Einkaufsliste', en: 'Shopping list' },
      info: { de: 'Liste mit Eingabefeld, map und key - hinzufügen und löschen.', en: 'A list with an input, map and key - add and remove.' },
      code: js`
        function App() {
          const [items, setItems] = useState(['Milk', 'Bread'])
          const [text, setText] = useState('')

          function add(event) {
            event.preventDefault()
            if (!text.trim()) return
            setItems([...items, text.trim()])
            setText('')
          }

          return (
            <div>
              <h1>Shopping list</h1>
              <form onSubmit={add}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="New item" />
                <button>Add</button>
              </form>
              <ul>
                {items.map((item, index) => (
                  <li key={item + index}>
                    {item} <button onClick={() => setItems(items.filter((_, i) => i !== index))}>✕</button>
                  </li>
                ))}
              </ul>
            </div>
          )
        }
      `,
    },
    {
      titel: { de: 'Profilkarten mit Props', en: 'Profile cards with props' },
      info: { de: 'Eine Komponente, mehrfach benutzt - mit unterschiedlichen Props.', en: 'One component used several times - with different props.' },
      code: js`
        function ProfileCard({ name, role, color }) {
          return (
            <div style={{ border: '2px solid ' + color, borderRadius: 12, padding: 12, marginBottom: 8 }}>
              <strong>{name}</strong>
              <p style={{ margin: 0 }}>{role}</p>
            </div>
          )
        }

        function App() {
          return (
            <div>
              <ProfileCard name="Ada Lovelace" role="Mathematician" color="tomato" />
              <ProfileCard name="Grace Hopper" role="Computer scientist" color="teal" />
            </div>
          )
        }
      `,
    },
  ],
  gruppen: [
    {
      titel: { de: 'Komponenten & JSX', en: 'Components & JSX' },
      bausteine: [
        {
          titel: { de: 'Neue Komponente', en: 'New component' },
          info: { de: 'Eine Funktion, die JSX zurückgibt - und gleich benutzt.', en: 'A function that returns JSX - used right away.' },
          code: js`
            function Greeting({ name }) {
              return <p>Hello {name}!</p>
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Greeting name="Ada" />' },
          kapitel: 'react-komponenten',
        },
        {
          titel: { de: 'Ausdruck in { }', en: 'Expression in { }' },
          info: { de: 'In geschweiften Klammern steht JavaScript.', en: 'Curly braces contain JavaScript.' },
          code: '<p>2 + 3 = {2 + 3}, today is {new Date().toLocaleDateString()}</p>',
          ort: 'jsx',
          kapitel: 'react-komponenten',
        },
        {
          titel: { de: 'Inline-Style', en: 'Inline style' },
          info: { de: 'style bekommt ein Objekt - Eigenschaften in camelCase.', en: 'style takes an object - properties in camelCase.' },
          code: "<p style={{ color: 'tomato', fontWeight: 'bold', fontSize: 20 }}>Styled text</p>",
          ort: 'jsx',
          kapitel: 'react-komponenten',
        },
        {
          titel: { de: 'Knopf mit Klick', en: 'Button with a click' },
          info: { de: 'onClick bekommt eine Funktion - sie läuft beim Klick.', en: 'onClick takes a function - it runs on click.' },
          code: "<button onClick={() => console.log('clicked!')}>Click me</button>",
          ort: 'jsx',
          kapitel: 'react-state',
        },
      ],
    },
    {
      titel: { de: 'Props, Listen & Bedingungen', en: 'Props, lists & conditions' },
      bausteine: [
        {
          titel: { de: 'Karte mit children', en: 'Card with children' },
          info: { de: 'Alles zwischen <Card> und </Card> kommt als children an.', en: 'Everything between <Card> and </Card> arrives as children.' },
          code: js`
            function Card({ title, children }) {
              return (
                <section style={{ border: '1px solid #94a3b8', borderRadius: 12, padding: 12, margin: '8px 0' }}>
                  <h3 style={{ marginTop: 0 }}>{title}</h3>
                  {children}
                </section>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Card title="My card">\n  <p>Anything can go in here.</p>\n</Card>' },
          kapitel: 'react-props',
        },
        {
          titel: { de: 'Liste mit map', en: 'List with map' },
          info: { de: 'Aus einem Array wird eine Liste - jedes Element braucht einen key.', en: 'An array becomes a list - every element needs a key.' },
          code: js`
            <ul>
              {['Tea', 'Coffee', 'Juice'].map((drink) => (
                <li key={drink}>{drink}</li>
              ))}
            </ul>
          `,
          ort: 'jsx',
          kapitel: 'react-props',
        },
        {
          titel: { de: 'Bedingung mit &&', en: 'Condition with &&' },
          info: { de: 'Nur anzeigen, wenn die Bedingung wahr ist.', en: 'Show only if the condition is true.' },
          code: '{new Date().getHours() < 12 && <p>Good morning!</p>}',
          ort: 'jsx',
          kapitel: 'react-props',
        },
        {
          titel: { de: 'Bedingung mit ? :', en: 'Condition with ? :' },
          info: { de: 'Das eine oder das andere anzeigen.', en: 'Show one thing or the other.' },
          code: "{Math.random() > 0.5 ? <p>Heads 🪙</p> : <p>Tails 🪙</p>}",
          ort: 'jsx',
          kapitel: 'react-props',
        },
      ],
    },
    {
      titel: { de: 'State & Events', en: 'State & events' },
      bausteine: [
        {
          titel: { de: 'Zähler-Komponente', en: 'Counter component' },
          info: { de: 'Eigener State pro Komponente - jede Kopie zählt für sich.', en: 'Every component has its own state - each copy counts on its own.' },
          code: js`
            function Counter() {
              const [count, setCount] = useState(0)
              return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Counter />' },
          kapitel: 'react-state',
        },
        {
          titel: { de: 'An/Aus-Schalter', en: 'On/off toggle' },
          info: { de: 'Boolean-State umschalten und Inhalt ein- und ausblenden.', en: 'Toggle boolean state and show or hide content.' },
          code: js`
            function Toggle() {
              const [open, setOpen] = useState(false)
              return (
                <div>
                  <button onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'} details</button>
                  {open && <p>Here are the details 🎉</p>}
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Toggle />' },
          kapitel: 'react-state',
        },
        {
          titel: { de: 'Eingabefeld mit State', en: 'Input with state' },
          info: { de: 'Kontrolliertes Feld: value kommt aus dem State, onChange schreibt zurück.', en: 'Controlled input: value comes from state, onChange writes it back.' },
          code: js`
            function NameInput() {
              const [name, setName] = useState('')
              return (
                <div>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  <p>Hello {name || 'stranger'}!</p>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<NameInput />' },
          kapitel: 'react-state',
        },
        {
          titel: { de: 'useState-Zeile', en: 'useState line' },
          info: { de: 'Ein State in App: aktueller Wert und Setter.', en: 'A piece of state in App: current value and setter.' },
          code: 'const [value, setValue] = useState($0)',
          ort: 'komponente',
          kapitel: 'react-state',
        },
        {
          titel: { de: 'Event-Handler', en: 'Event handler' },
          info: { de: 'Eine Funktion in App - und ein Knopf, der sie aufruft.', en: 'A function in App - and a button that calls it.' },
          code: js`
            function handleClick() {
              console.log('Button clicked')
            }
          `,
          ort: 'komponente',
          nutzung: { ort: 'jsx', code: '<button onClick={handleClick}>Click</button>' },
          kapitel: 'react-state',
        },
      ],
    },
    {
      titel: { de: 'Datenfluss', en: 'Data flow' },
      bausteine: [
        {
          titel: { de: 'State hochziehen', en: 'Lifting state up' },
          info: { de: 'Der State lebt oben, das Kind meldet Änderungen per Callback-Prop.', en: 'State lives at the top, the child reports changes through a callback prop.' },
          code: js`
            function TemperatureInput({ value, onChange }) {
              return <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
            }

            function Thermometer() {
              const [celsius, setCelsius] = useState(20)
              return (
                <div>
                  <TemperatureInput value={celsius} onChange={setCelsius} />
                  <p>{celsius} °C = {(celsius * 9) / 5 + 32} °F</p>
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<Thermometer />' },
          kapitel: 'react-datenfluss',
        },
        {
          titel: { de: 'Auswahl teilen', en: 'Sharing a selection' },
          info: { de: 'Zwei Geschwister-Komponenten nutzen denselben State.', en: 'Two sibling components use the same state.' },
          code: js`
            function ColorPicker({ color, onPick }) {
              return ['tomato', 'teal', 'gold'].map((c) => (
                <button key={c} onClick={() => onPick(c)} aria-pressed={c === color}>
                  {c}
                </button>
              ))
            }

            function ColorPreview({ color }) {
              return <div style={{ background: color, height: 40, borderRadius: 8, marginTop: 8 }} />
            }

            function ColorDemo() {
              const [color, setColor] = useState('teal')
              return (
                <div>
                  <ColorPicker color={color} onPick={setColor} />
                  <ColorPreview color={color} />
                </div>
              )
            }
          `,
          ort: 'oben',
          nutzung: { ort: 'jsx', code: '<ColorDemo />' },
          kapitel: 'react-datenfluss',
        },
      ],
    },
  ],
}
