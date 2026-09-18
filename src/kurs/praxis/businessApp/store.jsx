import { createContext, useContext, useMemo, useReducer } from 'react'
import { initialCustomers, initialOrders } from './data'

const StoreContext = createContext(null)

function nextId(items) {
  return Math.max(0, ...items.map((item) => item.id)) + 1
}

// Every change to the data goes through this one function.
// It never mutates: it always returns a new state object.
function reducer(state, action) {
  switch (action.type) {
    case 'customer/saved': {
      const { customer } = action
      if (customer.id) {
        return {
          ...state,
          customers: state.customers.map((c) => (c.id === customer.id ? customer : c)),
        }
      }
      return {
        ...state,
        customers: [...state.customers, { ...customer, id: nextId(state.customers) }],
      }
    }
    case 'order/added':
      return {
        ...state,
        orders: [...state.orders, { ...action.order, id: nextId(state.orders) }],
      }
    case 'order/statusChanged':
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.id ? { ...o, status: action.status } : o)),
      }
    default:
      throw new Error('Unknown action: ' + action.type)
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    customers: initialCustomers,
    orders: initialOrders,
  })

  // A new context value only when the state changes -
  // otherwise every consumer would re-render on every render of the provider.
  const value = useMemo(() => ({ ...state, dispatch }), [state])

  return <StoreContext value={value}>{children}</StoreContext>
}

// Custom hook: components never touch the context directly.
export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}
