// Setup of the Vitest project "dom": DOM matchers (toBeInTheDocument …) and a clean DOM per test.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())

// jsdom has no layout, so no ResizeObserver - scroll containers (components/scrollFocus.ts) only need it to exist.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
