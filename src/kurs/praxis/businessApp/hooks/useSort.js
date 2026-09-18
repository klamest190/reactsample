import { useMemo, useState } from 'react'

// Custom hook: sorting logic for any table.
// Click a column once = ascending, click it again = descending.
export function useSort(items, initialKey) {
  const [sort, setSort] = useState({ key: initialKey, direction: 'asc' })

  const sorted = useMemo(() => {
    const factor = sort.direction === 'asc' ? 1 : -1
    return items.toSorted((a, b) => {
      const x = a[sort.key]
      const y = b[sort.key]
      if (typeof x === 'number') return (x - y) * factor
      return String(x).localeCompare(String(y)) * factor
    })
  }, [items, sort])

  function sortBy(key) {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  return { sorted, sort, sortBy }
}
