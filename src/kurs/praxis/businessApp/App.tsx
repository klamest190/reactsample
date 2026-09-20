import { useState, type ComponentType } from 'react'
import { StoreProvider } from './store'
import { Layout, type PageId, type PageProps } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Customers } from './pages/Customers'
import { Orders } from './pages/Orders'

// Which page component belongs to which menu entry.
// Components are ordinary values - they can live in an object.
// Record<PageId, …> makes sure that every menu entry really has a page.
const PAGES: Record<PageId, ComponentType<PageProps>> = {
  dashboard: Dashboard,
  customers: Customers,
  orders: Orders,
}

export default function App() {
  const [page, setPage] = useState<PageId>('dashboard')
  const Page = PAGES[page]

  return (
    <StoreProvider>
      <Layout page={page} onNavigate={setPage}>
        <Page onNavigate={setPage} />
      </Layout>
    </StoreProvider>
  )
}
