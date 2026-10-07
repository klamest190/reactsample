// Small helpers without React - a plain TypeScript module.

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' })
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function formatCurrency(value: number) {
  return currency.format(value)
}

export function formatDate(isoDate: string) {
  return dateFormat.format(new Date(isoDate))
}

/** Today as "YYYY-MM-DD" - the same format as in data.ts. */
export function today() {
  return new Date().toISOString().slice(0, 10)
}
