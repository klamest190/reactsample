import { useMemo, useState } from 'react'

type Richtung = 'asc' | 'desc'

// Custom hook: sorting logic for any table.
// <T> is a placeholder for the row type - the hook works with customers, orders, anything.
// Click a column once = ascending, click it again = descending.
export function useSort<T extends object>(items: T[], initialKey: keyof T & string) {
  const [sort, setSort] = useState<{ key: keyof T & string; direction: Richtung }>({
    key: initialKey,
    direction: 'asc',
  })

  const sorted = useMemo(() => {
    const factor = sort.direction === 'asc' ? 1 : -1
    return items.toSorted((a, b) => {
      const x = a[sort.key]
      const y = b[sort.key]
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * factor
      return String(x).localeCompare(String(y)) * factor
    })
  }, [items, sort])

  function sortBy(key: keyof T & string) {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  return { sorted, sort, sortBy }
}
