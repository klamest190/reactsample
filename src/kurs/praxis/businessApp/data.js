// Start data. In a real app this would come from a server via fetch.

export const ORDER_STATUSES = ['open', 'shipped', 'paid']

export const initialCustomers = [
  { id: 1, name: 'Ada Lovelace', company: 'Analytical Engines Ltd', email: 'ada@engines.example', city: 'London' },
  { id: 2, name: 'Grace Hopper', company: 'Compiler Works', email: 'grace@compiler.example', city: 'New York' },
  { id: 3, name: 'Alan Turing', company: 'Codebreakers & Co', email: 'alan@codebreakers.example', city: 'Manchester' },
  { id: 4, name: 'Hedy Lamarr', company: 'Frequency Labs', email: 'hedy@frequency.example', city: 'Vienna' },
  { id: 5, name: 'Katherine Johnson', company: 'Orbit Calculations', email: 'katherine@orbit.example', city: 'Hampton' },
  { id: 6, name: 'Konrad Zuse', company: 'Relay Computing', email: 'konrad@relay.example', city: 'Berlin' },
]

export const initialOrders = [
  { id: 101, customerId: 1, title: 'Engine maintenance', amount: 1200, date: '2026-05-04', status: 'paid' },
  { id: 102, customerId: 2, title: 'Compiler license', amount: 3400, date: '2026-05-18', status: 'paid' },
  { id: 103, customerId: 3, title: 'Security audit', amount: 5600, date: '2026-06-02', status: 'paid' },
  { id: 104, customerId: 4, title: 'Radio module prototype', amount: 2150, date: '2026-06-21', status: 'shipped' },
  { id: 105, customerId: 1, title: 'Punch card supplies', amount: 380, date: '2026-07-07', status: 'paid' },
  { id: 106, customerId: 5, title: 'Trajectory workshop', amount: 1800, date: '2026-07-25', status: 'shipped' },
  { id: 107, customerId: 6, title: 'Relay replacement', amount: 940, date: '2026-08-11', status: 'open' },
  { id: 108, customerId: 2, title: 'Training: debugging', amount: 1250, date: '2026-08-29', status: 'open' },
  { id: 109, customerId: 3, title: 'Cipher consulting', amount: 2700, date: '2026-09-08', status: 'open' },
  { id: 110, customerId: 5, title: 'Calculation service', amount: 640, date: '2026-09-15', status: 'shipped' },
]
