import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für das Routing-Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen und Tipps gibt es in beiden Sprachen.
 *
 * Im Editor läuft echtes React Router (wird beim ersten import nachgeladen).
 * Immer mit MemoryRouter: Die Vorschau ist Teil dieser Seite und darf deren URL nicht ändern.
 */

export const beispiele = {
  'praxis-routing-einstieg': {
    code: js`
      import { MemoryRouter, Routes, Route, Link } from 'react-router'

      function App() {
        return (
          <MemoryRouter>
            <nav>
              <Link to="/">Home</Link> | <Link to="/about">About</Link>
            </nav>
            <Routes>
              <Route path="/" element={<h2>Home</h2>} />
              <Route path="/about" element={<h2>About us</h2>} />
            </Routes>
          </MemoryRouter>
        )
      }
    `,
  },
  'praxis-routing-idee': {
    code: js`
      // The idea behind every router: the current path is state,
      // and the page to show is chosen from it.
      const PAGES = {
        '/': () => <h2>Home</h2>,
        '/products': () => <h2>Products</h2>,
      }

      function Link({ to, navigate, children }) {
        function handleClick(e) {
          e.preventDefault() // no page reload
          navigate(to)
        }
        return <a href={to} onClick={handleClick}>{children}</a>
      }

      function App() {
        const [path, setPath] = useState('/')
        const Page = PAGES[path] ?? (() => <h2>404 - not found</h2>)

        return (
          <>
            <p style={{ fontFamily: 'monospace' }}>URL: {path}</p>
            <nav>
              <Link to="/" navigate={setPath}>Home</Link> |{' '}
              <Link to="/products" navigate={setPath}>Products</Link> |{' '}
              <Link to="/nope" navigate={setPath}>Broken link</Link>
            </nav>
            <Page />
          </>
        )
      }
    `,
  },
  'praxis-routing-params': {
    code: js`
      import { MemoryRouter, Routes, Route, Link, NavLink, useParams, useLocation } from 'react-router'

      const PRODUCTS = [
        { id: 'keyboard', name: 'Keyboard', price: 49 },
        { id: 'mouse', name: 'Mouse', price: 19.5 },
        { id: 'monitor', name: 'Monitor', price: 189 },
      ]

      // Shows the current URL - a MemoryRouter has no address bar
      function AddressBar() {
        const { pathname } = useLocation()
        return <p style={{ fontFamily: 'monospace', color: 'gray' }}>📍 {pathname}</p>
      }

      function ProductList() {
        return (
          <ul>
            {PRODUCTS.map((p) => (
              <li key={p.id}>
                <Link to={'/products/' + p.id}>{p.name}</Link>
              </li>
            ))}
          </ul>
        )
      }

      function ProductDetail() {
        const { id } = useParams() // the ":id" part of the URL
        const product = PRODUCTS.find((p) => p.id === id)
        if (!product) return <p>There is no product "{id}".</p>
        return (
          <div>
            <h3>{product.name}</h3>
            <p>{product.price.toFixed(2)} €</p>
            <Link to="/products">← All products</Link>
          </div>
        )
      }

      // NavLink passes isActive - for highlighting the current page
      const navStyle = ({ isActive }) => ({ marginRight: 12, fontWeight: isActive ? 700 : 400 })

      function App() {
        return (
          <MemoryRouter initialEntries={['/products']}>
            <AddressBar />
            <nav>
              <NavLink to="/" end style={navStyle}>Home</NavLink>
              <NavLink to="/products" style={navStyle}>Products</NavLink>
              <NavLink to="/products/tablet" style={navStyle}>Tablet</NavLink>
              <NavLink to="/contact" style={navStyle}>Contact</NavLink>
            </nav>
            <Routes>
              <Route path="/" element={<h2>Welcome!</h2>} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="*" element={<h2>404 - page not found</h2>} />
            </Routes>
          </MemoryRouter>
        )
      }
    `,
  },
  'praxis-routing-layout': {
    code: js`
      import { MemoryRouter, Routes, Route, NavLink, Outlet, useLocation } from 'react-router'

      const active = ({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })

      function AddressBar() {
        return <p style={{ fontFamily: 'monospace', color: 'gray' }}>📍 {useLocation().pathname}</p>
      }

      // Layout route: renders the frame - the matching child appears at <Outlet />
      function Layout() {
        return (
          <div style={{ display: 'flex', gap: 24 }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <NavLink to="/" end style={active}>Dashboard</NavLink>
              <NavLink to="/settings" style={active}>Settings</NavLink>
            </nav>
            <main>
              <Outlet />
            </main>
          </div>
        )
      }

      function Settings() {
        return (
          <>
            <h3>Settings</h3>
            {/* Relative links: "profile" becomes /settings/profile */}
            <NavLink to="profile" style={active}>Profile</NavLink> ·{' '}
            <NavLink to="security" style={active}>Security</NavLink>
            <Outlet />
          </>
        )
      }

      function App() {
        return (
          <MemoryRouter>
            <AddressBar />
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<h3>Dashboard</h3>} />
                <Route path="settings" element={<Settings />}>
                  <Route index element={<p>Choose a section.</p>} />
                  <Route path="profile" element={<p>Your name and picture.</p>} />
                  <Route path="security" element={<p>Password and two-factor login.</p>} />
                </Route>
              </Route>
            </Routes>
          </MemoryRouter>
        )
      }
    `,
  },
  'praxis-routing-navigieren': {
    code: js`
      import { MemoryRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router'

      function AddressBar() {
        return <p style={{ fontFamily: 'monospace', color: 'gray' }}>📍 {useLocation().pathname}</p>
      }

      function Login({ onLogin }) {
        const navigate = useNavigate()

        function handleSubmit(e) {
          e.preventDefault()
          onLogin(new FormData(e.currentTarget).get('name'))
          // Navigate from code - replace: the login page is not kept in the history
          navigate('/account', { replace: true })
        }

        return (
          <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" required /> <button>Log in</button>
          </form>
        )
      }

      function Account({ user, onLogout }) {
        // Guard: without a user, redirect while rendering
        if (!user) return <Navigate to="/login" replace />
        return (
          <p>
            Hello {user}! <button onClick={onLogout}>Log out</button>
          </p>
        )
      }

      function App() {
        const [user, setUser] = useState(null)
        return (
          <MemoryRouter>
            <AddressBar />
            <nav>
              <Link to="/">Home</Link> | <Link to="/account">My account</Link>
            </nav>
            <Routes>
              <Route path="/" element={<p>Public start page.</p>} />
              <Route path="/login" element={<Login onLogin={setUser} />} />
              <Route path="/account" element={<Account user={user} onLogout={() => setUser(null)} />} />
            </Routes>
          </MemoryRouter>
        )
      }
    `,
  },
  'praxis-routing-suche': {
    code: js`
      import { MemoryRouter, Routes, Route, useSearchParams, useLocation } from 'react-router'

      const BOOKS = [
        { title: 'Clean Code', year: 2008 },
        { title: 'Refactoring', year: 2018 },
        { title: 'Designing Data-Intensive Applications', year: 2017 },
        { title: 'The Pragmatic Programmer', year: 2019 },
      ]

      function AddressBar() {
        const { pathname, search } = useLocation()
        return <p style={{ fontFamily: 'monospace', color: 'gray' }}>📍 {pathname + search}</p>
      }

      function Books() {
        // Like useState - but the values live in the URL (?q=…&sort=…)
        const [params, setParams] = useSearchParams()
        const query = params.get('q') ?? ''
        const sort = params.get('sort') ?? 'title'

        // replace: typing should not create a history entry per letter
        const update = (changes) => setParams({ q: query, sort, ...changes }, { replace: true })

        const shown = BOOKS.filter((b) => b.title.toLowerCase().includes(query.toLowerCase())).toSorted((a, b) =>
          sort === 'year' ? b.year - a.year : a.title.localeCompare(b.title),
        )

        return (
          <>
            <input value={query} onChange={(e) => update({ q: e.target.value })} placeholder="Search" />{' '}
            <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
              <option value="title">Title</option>
              <option value="year">Newest first</option>
            </select>
            <ul>
              {shown.map((b) => (
                <li key={b.title}>
                  {b.title} ({b.year})
                </li>
              ))}
            </ul>
          </>
        )
      }

      function App() {
        // Start with a "shared link": the filter comes from the URL
        return (
          <MemoryRouter initialEntries={['/books?q=re&sort=year']}>
            <AddressBar />
            <Routes>
              <Route path="/books" element={<Books />} />
            </Routes>
          </MemoryRouter>
        )
      }
    `,
  },
  'praxis-routing-loader': {
    code: js`
      import { createMemoryRouter, RouterProvider, Link, Outlet, useLoaderData, useNavigation, useRouteError } from 'react-router'

      const USERS = [
        { id: '1', name: 'Ada Lovelace', role: 'Mathematician' },
        { id: '2', name: 'Linus Torvalds', role: 'Kernel hacker' },
      ]
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

      // A loader runs BEFORE the page renders - no useEffect, no loading state in the component
      async function userLoader({ params }) {
        await wait(600) // pretend to ask a server
        const user = USERS.find((u) => u.id === params.id)
        if (!user) throw new Error('User ' + params.id + ' not found')
        return user
      }

      function Root() {
        const navigation = useNavigation() // "loading" while a loader runs
        return (
          <>
            <nav>
              <Link to="/users/1">Ada</Link> | <Link to="/users/2">Linus</Link> | <Link to="/users/3">Unknown</Link>
              {navigation.state === 'loading' && <em> Loading …</em>}
            </nav>
            <Outlet />
          </>
        )
      }

      function User() {
        const user = useLoaderData() // what the loader returned
        return (
          <p>
            <strong>{user.name}</strong> - {user.role}
          </p>
        )
      }

      function UserError() {
        const error = useRouteError()
        return <p style={{ color: 'crimson' }}>⚠️ {error.message}</p>
      }

      // Routes as data, created once - outside of the component
      const router = createMemoryRouter([
        {
          path: '/',
          element: <Root />,
          children: [
            { index: true, element: <p>Pick a user.</p> },
            { path: 'users/:id', loader: userLoader, element: <User />, errorElement: <UserError /> },
          ],
        },
      ])

      function App() {
        return <RouterProvider router={router} />
      }
    `,
  },
  'praxis-routing-uebung': {
    tipps: {
      de: [
        'Die Detailseite braucht eine Route mit Platzhalter: `<Route path="/posts/:slug" element={<Post />} />`.',
        'In `Post` liest du den Platzhalter mit `const { slug } = useParams()` und suchst den Beitrag mit `POSTS.find(…)`.',
        'Die Links in der Liste zeigen auf `\'/posts/\' + post.slug`, die Fallback-Route hat `path="*"`.',
      ],
      en: [
        'The detail page needs a route with a placeholder: `<Route path="/posts/:slug" element={<Post />} />`.',
        'In `Post` read the placeholder with `const { slug } = useParams()` and look up the post with `POSTS.find(…)`.',
        'The links in the list point to `\'/posts/\' + post.slug`, the fallback route has `path="*"`.',
      ],
    },
    code: js`
      import { MemoryRouter, Routes, Route, Link, useParams } from 'react-router'

      const POSTS = [
        { slug: 'hooks', title: 'Hooks explained', body: 'Hooks let function components remember things.' },
        { slug: 'routing', title: 'Why routing matters', body: 'Every page gets its own URL you can share.' },
      ]

      function PostList() {
        return (
          <ul>
            {POSTS.map((post) => (
              <li key={post.slug}>{post.title}</li>
            ))}
          </ul>
        )
      }

      function Post() {
        // TODO: read the slug from the URL and show title and body
        return <p>Post page</p>
      }

      function App() {
        return (
          <MemoryRouter>
            <nav>
              <Link to="/">Blog</Link> | <Link to="/does-not-exist">Broken link</Link>
            </nav>
            <Routes>
              <Route path="/" element={<PostList />} />
            </Routes>
          </MemoryRouter>
        )
      }
    `,
    loesung: js`
      import { MemoryRouter, Routes, Route, Link, useParams } from 'react-router'

      const POSTS = [
        { slug: 'hooks', title: 'Hooks explained', body: 'Hooks let function components remember things.' },
        { slug: 'routing', title: 'Why routing matters', body: 'Every page gets its own URL you can share.' },
      ]

      function PostList() {
        return (
          <ul>
            {POSTS.map((post) => (
              <li key={post.slug}>
                <Link to={'/posts/' + post.slug}>{post.title}</Link>
              </li>
            ))}
          </ul>
        )
      }

      function Post() {
        const { slug } = useParams()
        const post = POSTS.find((p) => p.slug === slug)
        if (!post) return <p>404 - this post does not exist.</p>
        return (
          <article>
            <h2>{post.title}</h2>
            <p>{post.body}</p>
            <Link to="/">← Back</Link>
          </article>
        )
      }

      function App() {
        return (
          <MemoryRouter>
            <nav>
              <Link to="/">Blog</Link> | <Link to="/does-not-exist">Broken link</Link>
            </nav>
            <Routes>
              <Route path="/" element={<PostList />} />
              <Route path="/posts/:slug" element={<Post />} />
              <Route path="*" element={<h2>404 - page not found</h2>} />
            </Routes>
          </MemoryRouter>
        )
      }
    `,
    tests: [
      {
        name: { de: 'Die Liste zeigt beide Beiträge als Links', en: 'The list shows both posts as links' },
        pruefung: js`
          await render()
          const links = findAll('a').map((a) => a.textContent)
          expect(links).toContain('Hooks explained')
          expect(links).toContain('Why routing matters')
        `,
      },
      {
        name: { de: 'Ein Klick öffnet den Beitrag mit Text', en: 'A click opens the post with its text' },
        pruefung: js`
          await render()
          await click(getByText('Why routing matters'))
          await wait(50)
          expect(text()).toContain('Every page gets its own URL you can share.')
        `,
      },
      {
        name: { de: '„← Back“ führt zurück zur Liste', en: '“← Back” leads back to the list' },
        pruefung: js`
          await render()
          await click(getByText('Hooks explained'))
          await wait(50)
          await click(getByText('← Back'))
          await wait(50)
          expect(text()).toContain('Why routing matters')
          expect(text()).not.toContain('Hooks let function components')
        `,
      },
      {
        name: { de: 'Unbekannte Adressen zeigen „404“', en: 'Unknown addresses show “404”' },
        pruefung: js`
          await render()
          await click(getByText('Broken link'))
          await wait(50)
          expect(text()).toContain('404')
        `,
      },
      {
        name: { de: 'Der Beitrag kommt per useParams aus der URL', en: 'The post comes from the URL via useParams' },
        pruefung: js`
          expect(code).toMatch(/useParams\(\)/)
          expect(code).toMatch(/:slug/)
        `,
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  installieren: js`
    npm install react-router
  `,
  einrichten: js`
    // src/main.tsx
    import { createRoot } from 'react-dom/client'
    import { BrowserRouter } from 'react-router'
    import App from './App'

    createRoot(document.getElementById('root')!).render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )
  `,
  datenRouter: js`
    // src/main.tsx - data mode: routes as objects, with loaders
    import { createBrowserRouter } from 'react-router'
    import { RouterProvider } from 'react-router/dom'

    const router = createBrowserRouter([
      { path: '/', Component: Root, children: [
        { index: true, Component: Home },
        { path: 'users/:id', loader: userLoader, Component: User },
      ]},
    ])

    createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
  `,
}
