import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { initialCustomers, initialOrders, type Customer, type Order, type OrderStatus } from './data'

type State = { customers: Customer[]; orders: Order[] }

// Before saving, a new record has no id yet - the store assigns it.
export type CustomerDraft = Omit<Customer, 'id'> & { id?: number }
export type OrderDraft = Omit<Order, 'id'>

// Every change has its own action, with exactly the fields it needs.
export type Action =
  | { type: 'customer/saved'; customer: CustomerDraft }
  | { type: 'order/added'; order: OrderDraft }
  | { type: 'order/statusChanged'; id: number; status: OrderStatus }

type Store = State & { dispatch: Dispatch<Action> }

const StoreContext = createContext<Store | null>(null)

function nextId(items: { id: number }[]) {
  return Math.max(0, ...items.map((item) => item.id)) + 1
}

// Every change to the data goes through this one function.
// It never mutates: it always returns a new state object.
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'customer/saved': {
      const { customer } = action
      if (customer.id === undefined) {
        return { ...state, customers: [...state.customers, { ...customer, id: nextId(state.customers) }] }
      }
      // After the check TypeScript knows: id is a number, so this is a complete Customer.
      const saved: Customer = { ...customer, id: customer.id }
      return { ...state, customers: state.customers.map((c) => (c.id === saved.id ? saved : c)) }
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
    default: {
      // If an action is missing above, this line fails to compile.
      const missing: never = action
      throw new Error('Unknown action: ' + JSON.stringify(missing))
    }
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
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
// After the null check the return type has no null in it any more.
export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}
