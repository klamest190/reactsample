import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'react-komponenten-einstieg': {
    code: js`
      function App() {
        return <h1>Hello, React!</h1>
      }
    `,
  },
  'react-komponenten-1': {
    code: js`
      function Greeting() {
        return <h2>Hello React! 👋</h2>
      }

      function ProfileCard() {
        return (
          <div>
            <Greeting />
            <p>I am a component inside a component.</p>
          </div>
        )
      }

      // The editor always shows the component "App".
      function App() {
        return (
          <main>
            <ProfileCard />
            <ProfileCard />
          </main>
        )
      }
    `,
  },
  'react-komponenten-2': {
    code: js`
      function App() {
        const name = 'Grace'
        const hobbies = ['Programming', 'Sailing', 'Chess']
        const isMorning = new Date().getHours() < 12

        return (
          <>
            {/* This is what comments look like in JSX */}
            <h2>{isMorning ? 'Good morning' : 'Hello'}, {name}!</h2>
            <p style={{ color: 'tomato', fontWeight: 'bold' }}>
              2 + 3 = {2 + 3}
            </p>
            <p>Number of hobbies: {hobbies.length}</p>
            <p>Upper case: {name.toUpperCase()}</p>
            <label htmlFor="field">Input: </label>
            <input id="field" placeholder="I am an input" />
          </>
        )
      }
    `,
  },
  'react-komponenten-uebung': {
    tipps: {
      de: [
        'Mehrere Elemente brauchen einen Rahmen: `<>…</>`.',
        '`class` heißt in JSX `className`, und leere Tags werden geschlossen: `<br />`.',
        '`Footer` ist eine eigene Funktion mit großem Anfangsbuchstaben.',
      ],
      en: [
        'Several elements need a wrapper: `<>…</>`.',
        '`class` is called `className` in JSX, and empty tags are closed: `<br />`.',
        '`Footer` is its own function with a capital first letter.',
      ],
    },
    code: js`
      function App() {
        const product = 'Coffee mug'
        const price = 12.5

        return (
          <h2 class="title">product</h2>
          <p>Price: {price} €<br></p>
        )
      }
    `,
    loesung: js`
      function Footer() {
        return <small>Built with React</small>
      }

      function App() {
        const product = 'Coffee mug'
        const price = 12.5

        return (
          <>
            <h2 className="title">{product}</h2>
            <p>Price: {price} €<br /></p>
            <Footer />
          </>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Die Überschrift zeigt den Produktnamen', en: 'The heading shows the product name' },
        pruefung: js`
          await render()
          expect(find('h2').textContent).toBe('Coffee mug')
        `,
      },
      {
        name: { de: 'Der Preis wird angezeigt', en: 'The price is displayed' },
        pruefung: js`
          await render()
          expect(text()).toContain('Price: 12.5 €')
        `,
      },
      {
        name: { de: 'Eine Komponente Footer zeigt „Built with React“', en: 'A Footer component shows “Built with React”' },
        pruefung: js`
          expect(code).toMatch(/function Footer\s*\(/)
          expect(code).toMatch(/<Footer\s*\/>/)
          await render()
          expect(text()).toContain('Built with React')
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`UI = Component(data)`,
  beispiel2: js`
    // This ...
    const element = <h1 className="title">Hello {name}</h1>

    // ... is translated to:
    const element = React.createElement('h1', { className: 'title' }, 'Hello ', name)
  `,
}
