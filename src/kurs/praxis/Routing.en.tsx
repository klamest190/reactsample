import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele, codeBloecke } from './Routing.code'

/**
 * KAPITEL 5.7 (English) - Routing with React Router
 */
export function Routing() {
  return (
    <>
      <Abschnitt titel="At a glance">
        <P>
          Two pages, two links: <Code>{'<Routes>'}</Code> shows the <Code>{'<Route>'}</Code> whose{' '}
          <Code>path</Code> matches the current address.
        </P>
        <TryIt id="praxis-routing-einstieg" {...beispiele['praxis-routing-einstieg']} modus="react" />
      </Abschnitt>

      <Abschnitt titel="What is routing?">
        <P>
          Real apps have several pages - and every page has its own <strong>address</strong>. That gives you what
          people expect from the web: sharing links, bookmarks, going back with “Back”. Yet a React app does not load
          a new HTML page from the server on every click (single page app). The <strong>router</strong> reads the
          address and decides which components to render.
        </P>
        <P>
          At its core, that is nothing new: the current path is state, and the page is chosen from it. Without a
          library it looks like this:
        </P>
        <TryIt id="praxis-routing-idee" {...beispiele['praxis-routing-idee']} modus="react" />
        <P>
          A real router does two more things: it writes the path into the address bar with{' '}
          <Code>history.pushState()</Code>, and it listens to the <Code>popstate</Code> event so the back button
          works. This learning app does it with the part after the <Code>#</Code> - look at your address bar:{' '}
          <Code>#/praxis-routing</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Setting up React Router">
        <P>
          The most widely used library for this is <strong>React Router</strong>. In your own project you install it
          and wrap the whole app in a <Code>BrowserRouter</Code>:
        </P>
        <CodeBlock titel="Terminal" code={codeBloecke.installieren} />
        <CodeBlock code={codeBloecke.einrichten} />
        <Hinweis variante="info">
          The editors here use <Code>MemoryRouter</Code> instead. It keeps the address in memory rather than in the
          address bar - otherwise every click in the preview would send the learning app itself somewhere else.
          Everything else works the same. Automated tests use <Code>MemoryRouter</Code> too.
        </Hinweis>
        <Liste>
          <li>
            <Code>{'<Link to="/about">'}</Code> instead of <Code>{'<a href>'}</Code>: a plain <Code>{'<a>'}</Code>{' '}
            reloads the whole page - all state would be gone.
          </li>
          <li>
            <Code>{'<Route path="…" element={…} />'}</Code> maps an address to a component.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Dynamic segments, active links and 404">
        <P>
          For detail pages you do not write one route per product, but one with a <strong>placeholder</strong>:{' '}
          <Code>/products/:id</Code>. The component reads the value with <Code>useParams()</Code>. The route{' '}
          <Code>path="*"</Code> catches everything that matches nothing else.
        </P>
        <TryIt id="praxis-routing-params" {...beispiele['praxis-routing-params']} modus="react" />
        <Liste>
          <li>
            <Code>NavLink</Code> is a <Code>Link</Code> that knows whether it is active - ideal for menus. “Products”
            stays active on <Code>/products/mouse</Code> as well. <Code>end</Code> prevents that, otherwise “Home” (
            <Code>/</Code>) would always be active.
          </li>
          <li>
            If there is no record for the placeholder (<Code>/products/tablet</Code>), the detail page has to handle
            it - the route does match, after all.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Nested routes and layouts">
        <P>
          Menu, header and frame should not be rewritten on every page. That is what nested routes are for: the outer
          route renders the <strong>layout</strong>, and the matching inner route appears where{' '}
          <Code>{'<Outlet />'}</Code> is. An <Code>index</Code> route is the default page of a section.
        </P>
        <TryIt id="praxis-routing-layout" {...beispiele['praxis-routing-layout']} modus="react" />
        <P>
          It is the same principle as <Code>children</Code> from <Verweis id="praxis-komposition" /> - only here the
          address decides what goes in. Switching between “Profile” and “Security” keeps the layout, only the inner
          part re-renders.
        </P>
      </Abschnitt>

      <Abschnitt titel="Navigating from code and redirecting">
        <P>
          Not every navigation is a click on a link. After submitting a form you move on with{' '}
          <Code>useNavigate()</Code>. If a page should not be shown at all, return <Code>{'<Navigate to="…" />'}</Code>{' '}
          - a redirect while rendering.
        </P>
        <TryIt id="praxis-routing-navigieren" {...beispiele['praxis-routing-navigieren']} modus="react" />
        <Liste>
          <li>
            <Code>replace</Code> replaces the current history entry instead of adding a new one. After logging in,
            “Back” should not land on the login form again.
          </li>
          <li>
            <Code>navigate(-1)</Code> is the back button in code.
          </li>
        </Liste>
        <Hinweis variante="warnung">
          A redirect in the browser is not protection. Anyone can read the app’s code. Secret data is only protected
          by the server refusing to hand it out without a valid login.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="State in the URL: search params">
        <P>
          Filters, search term, sort order, current tab - this kind of state often belongs in the address (
          <Code>?q=re&amp;sort=year</Code>). Then the view can be shared, bookmarked, and it survives a reload.{' '}
          <Code>useSearchParams()</Code> works almost like <Code>useState</Code>, except the value lives in the URL -
          a single source of truth (<Verweis id="react-datenfluss" />).
        </P>
        <TryIt id="praxis-routing-suche" {...beispiele['praxis-routing-suche']} modus="react" />
        <P>
          Search params are always strings. If one is missing, <Code>get()</Code> returns <Code>null</Code> - hence
          the defaults with <Code>??</Code>.
        </P>
      </Abschnitt>

      <Abschnitt titel="Loading data with loaders">
        <P>
          In <Verweis id="praxis-daten" /> you loaded data with <Code>useEffect</Code>: the page renders empty first,
          then shows a loading state, then the data. React Router can turn this around. In <strong>data mode</strong> a
          route gets a <Code>loader</Code> that runs <em>before</em> rendering. The component gets the result with{' '}
          <Code>useLoaderData()</Code> and no longer has to deal with loading and errors.
        </P>
        <TryIt id="praxis-routing-loader" {...beispiele['praxis-routing-loader']} modus="react" />
        <Liste>
          <li>
            Here the routes are objects instead of JSX and are created once, outside the components, with{' '}
            <Code>createMemoryRouter</Code> (in a project: <Code>createBrowserRouter</Code>).
          </li>
          <li>
            <Code>useNavigation().state</Code> is <Code>"loading"</Code> while a loader runs - for a global loading
            indicator.
          </li>
          <li>
            If the loader throws, React Router renders the route’s <Code>errorElement</Code> - like an error boundary
            (<Verweis id="praxis-fehler" />).
          </li>
        </Liste>
        <CodeBlock titel="In your own project" code={codeBloecke.datenRouter} />
        <Hinweis variante="tipp">
          React Router has three levels: <strong>declarative</strong> (<Code>{'<Routes>'}</Code>, as above),{' '}
          <strong>data</strong> (loaders, actions) and <strong>framework</strong> (with a Vite plugin, server rendering
          and file-based routes). Alternatives are <strong>TanStack Router</strong> (very strong with TypeScript) and{' '}
          <strong>Next.js</strong> as a complete framework.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Exercise">
        <TryIt
          id="praxis-routing-uebung"
          {...beispiele['praxis-routing-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Turn the blog into an app with detail pages:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>
                  The titles in the list become links to <Code>/posts/&lt;slug&gt;</Code>.
                </li>
                <li>
                  A route <Code>/posts/:slug</Code> shows the post’s title and text (<Code>useParams</Code>) and a link
                  “← Back” to the list.
                </li>
                <li>All other addresses show a page with “404” - try it with “Broken link”.</li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Why <Link> instead of <a href> for pages inside the app?',
            antworten: [
              'Link is easier to style',
              'An <a> reloads the whole page - all state is lost',
              'The back button does not work with <a>',
            ],
            richtig: 1,
            erklaerung: 'Link only changes the address and lets React render the matching route.',
          },
          {
            frage: 'How does a component read the :id from /products/:id?',
            antworten: ['props.id', 'useParams()', 'useLocation().id'],
            richtig: 1,
            erklaerung: 'useParams() returns an object with all placeholders of the matching route.',
          },
          {
            frage: 'What does <Outlet /> stand for in a layout route?',
            antworten: ['A link to the outside', 'The place where the matching child route appears', 'The 404 page'],
            richtig: 1,
            erklaerung: 'The layout stays, only the content at the outlet changes with the address.',
          },
          {
            frage: 'Which state typically belongs in the URL?',
            antworten: [
              'The text someone is currently typing into a form',
              'Filters, search and sort order of a list',
              'Whether a tooltip is open',
            ],
            richtig: 1,
            erklaerung: 'Anything people want to share or bookmark.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Routing: the address decides which components render - without reloading.',
          <>
            <Code>{'<Routes>'}</Code> + <Code>{'<Route path element>'}</Code>, navigation with{' '}
            <Code>{'<Link>'}</Code> or <Code>{'<NavLink>'}</Code>.
          </>,
          <>
            Placeholder <Code>:id</Code> + <Code>useParams()</Code>, fallback with <Code>path="*"</Code>.
          </>,
          <>
            Layouts with nested routes and <Code>{'<Outlet />'}</Code>, redirects with <Code>useNavigate</Code> and{' '}
            <Code>{'<Navigate />'}</Code>.
          </>,
          <>
            Shareable state goes into the URL: <Code>useSearchParams()</Code>. Loaders fetch data before rendering.
          </>,
        ]}
      />
    </>
  )
}
