// Small helpers without React - plain JavaScript modules.

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' })
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function formatCurrency(value) {
  return currency.format(value)
}

export function formatDate(isoDate) {
  return dateFormat.format(new Date(isoDate))
}

/** Today as "YYYY-MM-DD" - the same format as in data.js. */
export function today() {
  return new Date().toISOString().slice(0, 10)
}
