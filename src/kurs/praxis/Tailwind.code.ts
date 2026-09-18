import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'praxis-tailwind-einstieg': {
    code: js`
      function App() {
        return (
          <button className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
            Tailwind button
          </button>
        )
      }
    `,
  },
  'praxis-tailwind-karte': {
    code: js`
      function ProfileCard({ name, role, online }) {
        return (
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="relative">
              <div className="flex size-12 items-center justify-center rounded-full bg-brand-500 text-lg font-bold text-white">
                {name[0]}
              </div>
              <span className={\`absolute right-0 bottom-0 size-3 rounded-full ring-2 ring-white \${online ? 'bg-emerald-500' : 'bg-slate-400'}\`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{name}</p>
              <p className="text-sm text-slate-500">{role}</p>
            </div>
            <button className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
              Follow
            </button>
          </div>
        )
      }

      function App() {
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <ProfileCard name="Ada Lovelace" role="Mathematician" online />
            <ProfileCard name="Alan Turing" role="Computer scientist" online={false} />
          </div>
        )
      }
    `,
  },
  'praxis-tailwind-uebung': {
    tipps: {
      de: [
        'Lege ein Objekt an: `const STYLES = { open: \'bg-amber-100 text-amber-800\', … }` - mit vollständigen Klassennamen.',
        'Genauso für Text und Symbol pro Status.',
        '`className={\'rounded-full px-2 py-0.5 text-xs font-semibold \' + STYLES[status]}`',
      ],
      en: [
        'Create an object: `const STYLES = { open: \'bg-amber-100 text-amber-800\', … }` - with complete class names.',
        'Do the same for the label and icon per status.',
        '`className={\'rounded-full px-2 py-0.5 text-xs font-semibold \' + STYLES[status]}`',
      ],
    },
    code: js`
      function Badge({ status }) {
        return <span className={\`bg-\${status}-100\`}>{status}</span>   // ❌ doesn't work
      }

      function App() {
        return (
          <ul className="space-y-2">
            <li>Build login <Badge status="done" /></li>
            <li>Write tests <Badge status="inProgress" /></li>
            <li>Documentation <Badge status="open" /></li>
          </ul>
        )
      }
    `,
    loesung: js`
      const STATUS = {
        open: { classes: 'bg-amber-100 text-amber-800', symbol: '○', text: 'open' },
        inProgress: { classes: 'bg-sky-100 text-sky-800', symbol: '◐', text: 'in progress' },
        done: { classes: 'bg-emerald-100 text-emerald-800', symbol: '●', text: 'done' },
      }

      function Badge({ status }) {
        const { classes, symbol, text } = STATUS[status]
        return (
          <span className={\`rounded-full px-2 py-0.5 text-xs font-semibold \${classes}\`}>
            {symbol} {text}
          </span>
        )
      }

      function App() {
        return (
          <ul className="space-y-2">
            <li>Build login <Badge status="done" /></li>
            <li>Write tests <Badge status="inProgress" /></li>
            <li>Documentation <Badge status="open" /></li>
          </ul>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Keine zusammengesetzten Klassennamen', en: 'No assembled class names' },
        pruefung: js`
          expect(code).not.toMatch(/bg-[$][{]/)
        `,
      },
      {
        name: { de: 'Jeder Status hat seine Farben', en: 'Every status has its colors' },
        pruefung: js`
          await render()
          const badge = (wort) => findAll('span').find((s) => s.textContent.includes(wort))
          expect(badge('done')?.className).toContain('bg-emerald-100')
          expect(badge('progress')?.className).toContain('bg-sky-100')
          expect(badge('open')?.className).toContain('bg-amber-100')
        `,
      },
      {
        name: { de: 'Badges sind rund und klein', en: 'Badges are round and small' },
        pruefung: js`
          await render()
          const badges = findAll('span').filter((s) => /done|progress|open/.test(s.textContent))
          expect(badges.length).toBeGreaterThan(2)
          expect(badges.every((b) => b.className.includes('rounded-full') && b.className.includes('text-xs'))).toBe(true)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
      Save
    </button>
  `,
  beispiel2: js`
    // ❌ The scanner never sees "bg-red-500" or "bg-green-500"
    <div className={\`bg-\${color}-500\`} />

    // ✅ Complete class names in a lookup object
    const colors = {
      error: 'bg-red-500 text-white',
      success: 'bg-green-500 text-white',
    }
    <div className={colors[status]} />

    // ✅ A condition with complete names
    <div className={isActive ? 'bg-blue-600 text-white' : 'bg-gray-100'} />
  `,
  beispiel3: js`
    @import "tailwindcss";

    /* Dark mode via the .dark class on <html> (set by the ThemeProvider) */
    @custom-variant dark (&:where(.dark, .dark *));

    /* Custom design tokens -> become bg-brand-500, text-brand-600, … */
    @theme {
      --color-brand-500: oklch(0.6 0.19 255);
      --color-brand-600: oklch(0.52 0.19 255);
    }
  `,
}
