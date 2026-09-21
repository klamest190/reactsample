import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Werkstatt } from '../../lernen/Werkstatt'
import { codeBloecke, dateien } from './BusinessApp.code'

const structure: [string, string][] = [
  ['App.tsx', 'Entry point: store, layout and the page for the selected menu entry'],
  ['store.tsx', 'All data: useReducer + context + the custom hook useStore'],
  ['data.ts', 'The data model as types (Customer, Order, OrderStatus) and the start data'],
  ['format.ts', 'Helpers without React: money and date formatting'],
  ['hooks/', 'Custom hooks that several components can use'],
  ['pages/', 'One component per page - they get their data from the store'],
  ['components/', 'Reusable building blocks controlled only through props'],
]

/**
 * KAPITEL 5.12 (English) - A complete business app
 */
export function BusinessApp() {
  return (
    <>
      <Abschnitt titel="A real app instead of single snippets">
        <P>
          So far you have tried out every concept on its own. Here you see how everything works together
          in a real application: <strong>BrightDesk</strong>, a small customer and order management app
          with a dashboard, a customer table and an order list.
        </P>
        <P>
          The app consists of {dateien.length} TypeScript files, split up like in a real project. Pick a file
          on the left and change it - the running app below picks up your change after a short pause, and the
          type check reports errors across all files (<Verweis id="praxis-typescript" />). With{' '}
          <strong>⛶ Full screen</strong>, files, editor and app sit side by side.
        </P>
        <Hinweis variante="tipp">
          Use the app first: search and sort customers, click a customer and edit it, create an order,
          change its status - and watch how the dashboard changes along with it.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="The workshop">
        <Werkstatt id="praxis-business" titel="BrightDesk" dateien={dateien} einstieg="App.tsx" typen />
      </Abschnitt>

      <Abschnitt titel="How the app is structured">
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-4">File / folder</th>
                <th className="py-2">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {structure.map(([file, purpose]) => (
                <tr key={file}>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <Code>{file}</Code>
                  </td>
                  <td className="py-2">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>The data always flows in the same circle:</P>
        <Liste>
          <li>
            A page reads the data with <Code>useStore()</Code> - behind it is <Code>useContext</Code> (
            <Verweis id="hooks-usecontext" />).
          </li>
          <li>
            A click sends an action, e.g. <Code>{"dispatch({ type: 'order/statusChanged', … })"}</Code>.
          </li>
          <li>
            The reducer in <Code>store.tsx</Code> builds a <strong>new</strong> state from it without changing
            the old one (<Verweis id="hooks-usereducer" />, <Verweis id="js-referenzen" />).
          </li>
          <li>
            All components that read this data re-render. Key figures like revenue are{' '}
            <strong>derived</strong> from the orders every time instead of being stored (
            <Verweis id="react-datenfluss" />).
          </li>
        </Liste>
        <P>For every file, the workshop shows above the editor which chapters explain the concepts used.</P>
      </Abschnitt>

      <Abschnitt titel="Things to try">
        <Liste>
          <li>
            <strong>New status:</strong> In <Code>data.ts</Code>, add the status <Code>'cancelled'</Code> to{' '}
            <Code>ORDER_STATUSES</Code>. Filters, select and label adapt by themselves - why is that?
          </li>
          <li>
            <strong>New key figure:</strong> In <Code>pages/Dashboard.tsx</Code>, add a{' '}
            <Code>StatCard</Code> “Average order” with the average value of all orders.
          </li>
          <li>
            <strong>New column:</strong> In <Code>pages/Customers.tsx</Code>, show the number of orders per
            customer - sortable, so as an entry in <Code>COLUMNS</Code>.
          </li>
          <li>
            <strong>Different formatting:</strong> Switch <Code>format.ts</Code> to <Code>'de-DE'</Code>. All
            amounts and dates in the app change - because there is only this one place.
          </li>
          <li>
            <strong>Delete customers:</strong> Add an action <Code>'customer/deleted'</Code> in{' '}
            <Code>store.tsx</Code> and a button for it in the customer dialog. Think about what should
            happen to this customer’s orders.
          </li>
          <li>
            <strong>New page:</strong> Write a small <Code>Settings</Code> component in{' '}
            <Code>App.tsx</Code>, add it to <Code>PAGES</Code> and add the menu entry in{' '}
            <Code>components/Layout.tsx</Code>.
          </li>
        </Liste>
        <Hinweis>
          After every code change the app restarts - created customers or changed statuses are gone again,
          but your code changes are not: they stay saved in your browser. <strong>↺ Reset all</strong>{' '}
          brings back the original.
        </Hinweis>
        <Hinweis variante="tipp">
          Try the types out: misspell an action in <Code>store.tsx</Code> (e.g.{' '}
          <Code>'order/statusChangd'</Code>) - the <Code>never</Code> branch in the reducer immediately reports
          that a case is missing. The app keeps running, because in the browser the types are only stripped.
        </Hinweis>
        <Hinweis variante="warnung">
          The preview uses the Tailwind CSS of this learning site. Classes that appear nowhere in the course
          are not included (<Verweis id="praxis-tailwind" />). If a new class has no effect, use a similar
          one from the app or <Code>{'style={{ … }}'}</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="From the browser to your own project">
        <P>
          The files are written exactly as in a Vite project (<Verweis id="praxis-lokal" />). Create a
          project and copy the files into <Code>src/</Code> - the only thing missing is{' '}
          <Code>main.tsx</Code>, which puts the app into the page:
        </P>
        <CodeBlock titel="Terminal" code={codeBloecke.anlegen} />
        <CodeBlock titel="src/main.tsx" code={codeBloecke.main} />
        <P>
          <Code>index.css</Code> then contains <Code>@import "tailwindcss";</Code> and the{' '}
          <Code>brand-…</Code> colors as <Code>@theme</Code> - or you replace them with a Tailwind color
          like <Code>blue</Code>.
        </P>
      </Abschnitt>

      <Merke
        punkte={[
          'Real apps are split into pages, building blocks (components), custom hooks and modules without React.',
          <>
            Global data: <Code>useReducer</Code> + context + a custom hook like <Code>useStore</Code>.
          </>,
          'Values like totals and counts are derived, not stored in addition.',
          'Small components that only receive props can be reused anywhere.',
          <>
            <Code>import</Code>/<Code>export</Code> connect the files - the bundler (here a mini bundler in
            the browser) puts them together into one app.
          </>,
          'The data model lives in one place - every other file gets its types from there.',
        ]}
      />
    </>
  )
}
